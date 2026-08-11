/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { spawn, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, delimiter, dirname, extname, isAbsolute, join, resolve } from 'node:path';

import type { CodexProviderConfig, CommandExecutionEvidence, ReasoningEffort } from './types';

export interface CodexExecOptions {
  cwd: string;
  prompt: string;
  model: string;
  provider: CodexProviderConfig;
  reasoningEffort: ReasoningEffort;
  timeoutMs: number;
  lastMessagePath: string;
  executable?: string;
}

export type CodexNativeExecOptions = Omit<CodexExecOptions, 'provider'>;

export interface CodexJsonlSummary {
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  reasoningOutputTokens?: number;
  toolCalls: number;
  commands: CommandExecutionEvidence[];
  finalMessage: string;
  parseErrors: string[];
  authenticationFailed: boolean;
  permissionFailed: boolean;
  usedNetworkTool: boolean;
}

export interface CodexExecResult extends CodexJsonlSummary {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode?: number;
  signal?: string;
  timedOut: boolean;
  outcome: 'completed' | 'failed' | 'timed_out' | 'adapter_error';
  adapterVersion?: string;
  stdout: string;
  stderr: string;
  spawnError?: string;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null;
}

function numericValue(record: JsonRecord | undefined, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return value;
    }
  }
  return undefined;
}

function stringValue(record: JsonRecord | undefined, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === 'string') {
      return value;
    }
  }
  return undefined;
}

function toolItem(type: string): boolean {
  return [
    'command_execution',
    'file_change',
    'mcp_tool_call',
    'dynamic_tool_call',
    'web_search',
    'computer_use',
    'image_generation',
  ].includes(type);
}

function isAuthenticationFailure(message: string): boolean {
  return /(?:access token could not be refreshed|invalid_refresh_token|token_expired|please log out and sign in again)/i.test(message);
}

function isPermissionFailure(message: string): boolean {
  return /(?:rejected: blocked by policy|writing is blocked by read-only sandbox|rejected by user approval settings)/i.test(message);
}

export function parseCodexJsonl(raw: string): CodexJsonlSummary {
  const toolIds = new Set<string>();
  const commands = new Map<string, CommandExecutionEvidence>();
  const parseErrors: string[] = [];
  let finalMessage = '';
  let inputTokens: number | undefined;
  let cachedInputTokens: number | undefined;
  let outputTokens: number | undefined;
  let reasoningOutputTokens: number | undefined;
  let authenticationFailed = false;
  let permissionFailed = false;
  let usedNetworkTool = false;

  for (const [index, line] of raw.split(/\r?\n/).entries()) {
    if (line.trim().length === 0) {
      continue;
    }
    let event: JsonRecord;
    try {
      const parsed: unknown = JSON.parse(line);
      if (!isRecord(parsed)) {
        throw new Error('event is not an object');
      }
      event = parsed;
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : String(error);
      parseErrors.push(`line ${index + 1}: ${detail}`);
      continue;
    }

    const eventType = stringValue(event, 'type');
    const item = isRecord(event.item) ? event.item : undefined;
    const itemType = stringValue(item, 'type');
    const itemId = stringValue(item, 'id') ?? `${itemType ?? 'unknown'}-${index + 1}`;
    const eventError = isRecord(event.error) ? event.error : undefined;
    const errorMessage = stringValue(event, 'message') ?? stringValue(eventError, 'message') ?? '';
    authenticationFailed ||= isAuthenticationFailure(errorMessage);
    permissionFailed ||= isPermissionFailure(errorMessage);
    if ((eventType === 'item.started' || eventType === 'item.completed')
      && itemType !== undefined && toolItem(itemType)) {
      toolIds.add(itemId);
      usedNetworkTool ||= itemType === 'web_search';
    }
    if (eventType === 'item.completed' && itemType === 'agent_message') {
      finalMessage = stringValue(item, 'text', 'message') ?? finalMessage;
    }
    if (eventType === 'item.completed' && itemType === 'command_execution') {
      const command = stringValue(item, 'command') ?? '';
      const output = stringValue(item, 'aggregated_output', 'output') ?? '';
      permissionFailed ||= isPermissionFailure(output);
      commands.set(itemId, {
        id: itemId,
        command,
        status: stringValue(item, 'status'),
        exitCode: numericValue(item, 'exit_code', 'exitCode'),
      });
      usedNetworkTool ||= /(^|\s)(curl|wget|Invoke-WebRequest|Invoke-RestMethod|irm)(\s|$)/i.test(command);
    }
    if (eventType === 'turn.completed') {
      const usage = isRecord(event.usage) ? event.usage : undefined;
      inputTokens = numericValue(usage, 'input_tokens', 'inputTokens') ?? inputTokens;
      cachedInputTokens = numericValue(
        usage,
        'cached_input_tokens',
        'cachedInputTokens',
      ) ?? cachedInputTokens;
      outputTokens = numericValue(usage, 'output_tokens', 'outputTokens') ?? outputTokens;
      reasoningOutputTokens = numericValue(
        usage,
        'reasoning_output_tokens',
        'reasoningOutputTokens',
      ) ?? reasoningOutputTokens;
    }
  }

  return {
    inputTokens,
    cachedInputTokens,
    outputTokens,
    reasoningOutputTokens,
    toolCalls: toolIds.size,
    commands: [...commands.values()],
    finalMessage,
    parseErrors,
    authenticationFailed,
    permissionFailed,
    usedNetworkTool,
  };
}

export function buildCodexEnvironment(
  providerEnvKey: string,
  source: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const env = { ...source };
  for (const key of Object.keys(env)) {
    if (key !== providerEnvKey && (
      key.startsWith('CODEX_')
      || /(?:^|_)(?:API_?KEY|TOKEN|SECRET|PASSWORD|CREDENTIALS?)(?:_|$)/i.test(key)
    )) {
      delete env[key];
    }
  }
  if (env[providerEnvKey]?.trim().length === 0) {
    throw new Error(`Missing Codex provider credential environment variable: ${providerEnvKey}`);
  }
  env.GIT_TERMINAL_PROMPT = '0';
  return env;
}

export function buildCodexNativeEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const env = { ...source };
  for (const key of [
    'CODEX_INTERNAL_ORIGINATOR_OVERRIDE',
    'CODEX_PERMISSION_PROFILE',
    'CODEX_THREAD_ID',
  ]) {
    delete env[key];
  }
  env.GIT_TERMINAL_PROMPT = '0';
  return env;
}

function tomlString(value: string): string {
  return JSON.stringify(value);
}

function projectTrustConfig(path: string): string {
  return `projects.${tomlString(path)}.trust_level="trusted"`;
}

export function buildCodexExecArgs(options: CodexExecOptions): string[] {
  const providerKey = `model_providers.${options.provider.id}`;
  return [
    'exec',
    '--json',
    '--color',
    'never',
    '--ephemeral',
    '--ignore-user-config',
    '--strict-config',
    '--disable',
    'apps',
    '--disable',
    'memories',
    '--disable',
    'plugins',
    '--disable',
    'remote_plugin',
    '--disable',
    'multi_agent',
    '--sandbox',
    'workspace-write',
    '-C',
    options.cwd,
    '--model',
    options.model,
    '--config',
    `model_provider=${tomlString(options.provider.id)}`,
    '--config',
    projectTrustConfig(options.cwd),
    '--config',
    `${providerKey}.name=${tomlString(options.provider.name)}`,
    '--config',
    `${providerKey}.base_url=${tomlString(options.provider.baseUrl)}`,
    '--config',
    `${providerKey}.env_key=${tomlString(options.provider.envKey)}`,
    '--config',
    `${providerKey}.wire_api=${tomlString(options.provider.wireApi)}`,
    '--config',
    `model_reasoning_effort=${tomlString(options.reasoningEffort)}`,
    '--config',
    'approval_policy="never"',
    '--config',
    'web_search="disabled"',
    '--config',
    'sandbox_workspace_write.network_access=false',
    '--config',
    'windows.sandbox="unelevated"',
    '--output-last-message',
    options.lastMessagePath,
    '-',
  ];
}

export function buildCodexNativeExecArgs(options: CodexNativeExecOptions): string[] {
  return [
    'exec',
    '--json',
    '--color',
    'never',
    '--sandbox',
    'workspace-write',
    '-C',
    options.cwd,
    '--model',
    options.model,
    '--config',
    projectTrustConfig(options.cwd),
    '--config',
    `model_reasoning_effort=${tomlString(options.reasoningEffort)}`,
    '--config',
    'approval_policy="never"',
    '--config',
    'sandbox_workspace_write.network_access=false',
    '--config',
    'windows.sandbox="unelevated"',
    '--output-last-message',
    options.lastMessagePath,
    '-',
  ];
}

function codexExecutable(override: string | undefined): string {
  return override ?? process.env.CODEX_BIN ?? (process.platform === 'win32' ? 'codex.exe' : 'codex');
}

interface PreparedCodexExecutable {
  executable: string;
  cleanupRoot?: string;
}

const WINDOWS_CODEX_HELPERS = [
  'codex-windows-sandbox-setup.exe',
  'codex-command-runner.exe',
  'codex-code-mode-host.exe',
];

function resolveWindowsExecutable(executable: string): string | undefined {
  if (isAbsolute(executable)) {
    return existsSync(executable) ? executable : undefined;
  }
  if (executable.includes('\\') || executable.includes('/')) {
    const candidate = resolve(executable);
    return existsSync(candidate) ? candidate : undefined;
  }
  const extensions = extname(executable).length > 0
    ? ['']
    : (process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';');
  for (const directory of (process.env.PATH ?? '').split(delimiter)) {
    const cleanDirectory = directory.trim().replace(/^"|"$/g, '');
    if (cleanDirectory.length === 0) {
      continue;
    }
    for (const extension of extensions) {
      const candidate = join(cleanDirectory, `${executable}${extension.toLowerCase()}`);
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return undefined;
}

function prepareCodexExecutable(override: string | undefined): PreparedCodexExecutable {
  const configured = codexExecutable(override);
  if (process.platform !== 'win32') {
    return { executable: configured };
  }
  const resolved = resolveWindowsExecutable(configured) ?? configured;
  const executableDirectory = dirname(resolved);
  if (WINDOWS_CODEX_HELPERS.every(name => existsSync(join(executableDirectory, name)))) {
    return { executable: resolved };
  }
  const setupHelper = resolveWindowsExecutable(WINDOWS_CODEX_HELPERS[0]);
  if (setupHelper === undefined) {
    return { executable: resolved };
  }
  const helperDirectory = dirname(setupHelper);
  if (!WINDOWS_CODEX_HELPERS.every(name => existsSync(join(helperDirectory, name)))) {
    return { executable: resolved };
  }
  const bundleBase = join(process.env.LOCALAPPDATA ?? tmpdir(), 'AIEngineeringCoach', 'codex-binaries');
  mkdirSync(bundleBase, { recursive: true });
  const cleanupRoot = mkdtempSync(join(bundleBase, 'run-'));
  const executablePath = join(cleanupRoot, basename(resolved));
  copyFileSync(resolved, executablePath);
  for (const helper of WINDOWS_CODEX_HELPERS) {
    copyFileSync(join(helperDirectory, helper), join(cleanupRoot, helper));
  }
  return { executable: executablePath, cleanupRoot };
}

function readCodexVersion(executable: string, env: NodeJS.ProcessEnv): string | undefined {
  const result = spawnSync(executable, ['--version'], {
    encoding: 'utf8',
    env,
    timeout: 10_000,
    windowsHide: true,
  });
  return result.status === 0 ? result.stdout.trim() : undefined;
}

function terminateProcessTree(pid: number | undefined): void {
  if (pid === undefined) {
    return;
  }
  if (process.platform === 'win32') {
    spawnSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
      stdio: 'ignore',
      timeout: 10_000,
      windowsHide: true,
    });
    return;
  }
  try {
    process.kill(-pid, 'SIGKILL');
  } catch {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // The process already exited between the timeout and termination attempt.
    }
  }
}

async function runCodexProcess(
  options: CodexExecOptions | CodexNativeExecOptions,
  args: string[],
  env: NodeJS.ProcessEnv,
  isolatedCodexHome?: string,
): Promise<CodexExecResult> {
  const preparedExecutable = prepareCodexExecutable(options.executable);
  const executable = preparedExecutable.executable;
  if (isolatedCodexHome !== undefined) {
    env.CODEX_HOME = isolatedCodexHome;
  }
  const adapterVersion = readCodexVersion(executable, env);
  const startedAt = new Date().toISOString();
  const start = Date.now();

  return await new Promise(resolve => {
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let timedOut = false;
    let spawnError: string | undefined;
    const child = spawn(executable, args, {
      cwd: options.cwd,
      detached: process.platform !== 'win32',
      env,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.stdin.on('error', () => undefined);
    child.on('error', (error: Error) => {
      spawnError = error.message;
    });
    const timeout = setTimeout(() => {
      timedOut = true;
      terminateProcessTree(child.pid);
    }, options.timeoutMs);
    child.on('close', (code, signal) => {
      clearTimeout(timeout);
      const stdoutText = Buffer.concat(stdout).toString('utf8');
      const parsed = parseCodexJsonl(stdoutText);
      const stderrText = Buffer.concat(stderr).toString('utf8');
      const fileMessage = existsSync(options.lastMessagePath)
        ? readFileSync(options.lastMessagePath, 'utf8')
        : '';
      const finalMessage = fileMessage.trim().length > 0 ? fileMessage : parsed.finalMessage;
      const exitCode = code ?? undefined;
      const outcome = timedOut
        ? 'timed_out'
        : spawnError !== undefined || parsed.parseErrors.length > 0
          ? 'adapter_error'
          : exitCode === 0
            ? 'completed'
            : 'failed';
      if (isolatedCodexHome !== undefined) {
        rmSync(isolatedCodexHome, { recursive: true, force: true, maxRetries: 3 });
      }
      if (preparedExecutable.cleanupRoot !== undefined) {
        rmSync(preparedExecutable.cleanupRoot, { recursive: true, force: true, maxRetries: 3 });
      }
      resolve({
        ...parsed,
        authenticationFailed: parsed.authenticationFailed || isAuthenticationFailure(stderrText),
        permissionFailed: parsed.permissionFailed || isPermissionFailure(stderrText),
        finalMessage,
        startedAt,
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - start,
        exitCode,
        signal: signal ?? undefined,
        timedOut,
        outcome,
        adapterVersion,
        stdout: stdoutText,
        stderr: stderrText,
        spawnError,
      });
    });
    child.stdin.end(options.prompt, 'utf8');
  });
}

export async function runCodexExec(options: CodexExecOptions): Promise<CodexExecResult> {
  const env = buildCodexEnvironment(options.provider.envKey);
  const isolatedCodexHome = mkdtempSync(join(tmpdir(), 'aic-codex-home-'));
  return runCodexProcess(options, buildCodexExecArgs(options), env, isolatedCodexHome);
}

export async function runCodexNativeExec(
  options: CodexNativeExecOptions,
): Promise<CodexExecResult> {
  return runCodexProcess(
    options,
    buildCodexNativeExecArgs(options),
    buildCodexNativeEnvironment(),
  );
}
