/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

import type { CommandExecutionEvidence, ReasoningEffort } from './types';

export interface CodexExecOptions {
  cwd: string;
  prompt: string;
  model: string;
  reasoningEffort: ReasoningEffort;
  timeoutMs: number;
  lastMessagePath: string;
  executable?: string;
}

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
    usedNetworkTool,
  };
}

function scrubEnvironment(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/(?:^|_)(?:API_?KEY|TOKEN|SECRET|PASSWORD|CREDENTIALS?)(?:_|$)/i.test(key)) {
      delete env[key];
    }
  }
  env.GIT_TERMINAL_PROMPT = '0';
  return env;
}

function codexExecutable(override: string | undefined): string {
  return override ?? process.env.CODEX_BIN ?? (process.platform === 'win32' ? 'codex.exe' : 'codex');
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

export async function runCodexExec(options: CodexExecOptions): Promise<CodexExecResult> {
  const executable = codexExecutable(options.executable);
  const env = scrubEnvironment();
  const adapterVersion = readCodexVersion(executable, env);
  const startedAt = new Date().toISOString();
  const start = Date.now();
  const args = [
    'exec',
    '--json',
    '--color',
    'never',
    '--ephemeral',
    '--ignore-user-config',
    '--ignore-rules',
    '--disable',
    'apps',
    '--disable',
    'memories',
    '--sandbox',
    'workspace-write',
    '-C',
    options.cwd,
    '--model',
    options.model,
    '--config',
    `model_reasoning_effort="${options.reasoningEffort}"`,
    '--config',
    'approval_policy="never"',
    '--config',
    'web_search="disabled"',
    '--config',
    'sandbox_workspace_write.network_access=false',
    '--output-last-message',
    options.lastMessagePath,
    '-',
  ];

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
      resolve({
        ...parsed,
        authenticationFailed: parsed.authenticationFailed || isAuthenticationFailure(stderrText),
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
