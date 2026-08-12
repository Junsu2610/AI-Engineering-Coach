/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createHash } from 'node:crypto';
import {
  existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync,
} from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  FULL_SCENARIO_IDS,
  PILOT_VERIFIER_VERSION,
  PILOT_SCENARIO_IDS,
  fixtureSha256ForScenario,
  prepareAgentSession,
  runPilotScenario,
  validateExecutableFixtures,
  verifyAgentSession,
} from './pilot';
import { renderBenchmarkReport } from './report';
import {
  scoreRun,
  scenarioTracks,
  summarizeBenchmark,
  validateConfigs,
  validateRun,
  validateSuite,
} from './scoring';
import type {
  BenchmarkConfigSet,
  BenchmarkRun,
  BenchmarkSuite,
  BenchmarkTrack,
  CommandExecutionEvidence,
  RunCategoryScores,
} from './types';

const DEFAULT_SUITE_PATH = 'benchmarks/model-harness-suite.json';
const DEFAULT_CONFIG_PATH = 'benchmarks/configs.example.json';
const PILOT_CONFIG_PATH = 'benchmarks/configs.codex-sol-ultra.json';
const fixtureHashCache = new Map<string, string>();

function readJson<T>(path: string): T {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
    return parsed as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read JSON ${path}: ${message}`, { cause: error });
  }
}

function isRunRecord(value: unknown): value is BenchmarkRun {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (record.schemaVersion === 1 || record.schemaVersion === 2)
    && typeof record.runId === 'string'
    && typeof record.scenarioId === 'string'
    && typeof record.configId === 'string'
    && (record.status === 'draft' || record.status === 'completed')
    && typeof record.metrics === 'object'
    && record.metrics !== null
    && typeof record.scores === 'object'
    && record.scores !== null
    && Array.isArray(record.hardFailures);
}

interface LoadedRun {
  path: string;
  run: BenchmarkRun;
}

function isPathWithin(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate);
  return relativePath.length > 0
    && !isAbsolute(relativePath)
    && relativePath !== '..'
    && !relativePath.startsWith(`..${sep}`);
}

function validateRunArtifacts(runPath: string, run: BenchmarkRun): string[] {
  if (run.schemaVersion !== 2) {
    return [];
  }
  const errors: string[] = [];
  const runDirectory = realpathSync(dirname(resolve(runPath)));
  for (const artifactName of ['events', 'stderr', 'finalResponse'] as const) {
    const artifact = run.execution?.artifacts?.[artifactName];
    if (typeof artifact !== 'object' || artifact === null || typeof artifact.path !== 'string') {
      continue;
    }
    const candidate = resolve(runDirectory, artifact.path);
    if (!isPathWithin(runDirectory, candidate)) {
      errors.push(`${run.runId}.execution.artifacts.${artifactName}.path escapes the run directory`);
      continue;
    }
    let file: ReturnType<typeof lstatSync>;
    try {
      file = lstatSync(candidate);
    } catch {
      errors.push(`${run.runId}.execution.artifacts.${artifactName} file is missing: ${artifact.path}`);
      continue;
    }
    if (file.isSymbolicLink()) {
      errors.push(`${run.runId}.execution.artifacts.${artifactName} must not be a symbolic link`);
      continue;
    }
    if (!file.isFile()) {
      errors.push(`${run.runId}.execution.artifacts.${artifactName} must be a regular file`);
      continue;
    }
    const realCandidate = realpathSync(candidate);
    if (!isPathWithin(runDirectory, realCandidate)) {
      errors.push(`${run.runId}.execution.artifacts.${artifactName} resolves outside the run directory`);
      continue;
    }
    if (Number.isInteger(artifact.bytes) && file.size !== artifact.bytes) {
      errors.push(`${run.runId}.execution.artifacts.${artifactName}.bytes does not match the file`);
    }
    if (typeof artifact.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(artifact.sha256)) {
      const digest = createHash('sha256').update(readFileSync(candidate)).digest('hex');
      if (digest.toLowerCase() !== artifact.sha256.toLowerCase()) {
        errors.push(`${run.runId}.execution.artifacts.${artifactName}.sha256 does not match the file`);
      }
    }
  }
  return errors;
}

function currentVerifierErrors(suite: BenchmarkSuite, run: BenchmarkRun): string[] {
  if (run.schemaVersion !== 2) {
    return [];
  }
  const scenario = suite.scenarios.find(candidate => candidate.id === run.scenarioId);
  if (scenario?.fixture === undefined || run.verification === undefined) {
    return [];
  }
  const errors: string[] = [];
  if (run.verification.verifierVersion !== PILOT_VERIFIER_VERSION) {
    errors.push(
      `${run.runId} verifier version ${run.verification.verifierVersion} is stale; `
        + `current version is ${PILOT_VERIFIER_VERSION}`,
    );
  }
  let currentFixtureHash = fixtureHashCache.get(run.scenarioId);
  if (currentFixtureHash === undefined) {
    currentFixtureHash = fixtureSha256ForScenario(run.scenarioId);
    fixtureHashCache.set(run.scenarioId, currentFixtureHash);
  }
  if (run.verification.fixtureSha256 !== currentFixtureHash) {
    errors.push(`${run.runId} fixture SHA-256 does not match the current fixture`);
  }
  return errors;
}

function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

function requiredFlag(args: string[], flag: string): string {
  const value = readFlag(args, flag);
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`Missing required flag ${flag}`);
  }
  return value;
}

function loadContracts(
  args: string[],
  defaultConfigPath = DEFAULT_CONFIG_PATH,
): { suite: BenchmarkSuite; configs: BenchmarkConfigSet } {
  const suitePath = resolve(readFlag(args, '--suite') ?? DEFAULT_SUITE_PATH);
  const configPath = resolve(readFlag(args, '--configs') ?? defaultConfigPath);
  return {
    suite: readJson<BenchmarkSuite>(suitePath),
    configs: readJson<BenchmarkConfigSet>(configPath),
  };
}

function contractErrors(suite: BenchmarkSuite, configs: BenchmarkConfigSet): string[] {
  const suiteErrors = validateSuite(suite);
  return [
    ...suiteErrors,
    ...validateConfigs(configs),
    ...(suiteErrors.length === 0 ? validateExecutableFixtures(suite) : []),
  ];
}

function assertContracts(suite: BenchmarkSuite, configs: BenchmarkConfigSet): void {
  const errors = contractErrors(suite, configs);
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

function collectJsonFiles(path: string): string[] {
  if (!existsSync(path)) {
    throw new Error(`Runs path does not exist: ${path}`);
  }
  if (!statSync(path).isDirectory()) {
    const name = basename(path);
    return name.endsWith('.json')
      && !/-report\.json$/i.test(name)
      && !/\.session\.json$/i.test(name)
      ? [path]
      : [];
  }
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      return collectJsonFiles(child);
    }
    return entry.isFile()
      && entry.name.endsWith('.json')
      && !/-report\.json$/i.test(entry.name)
      && !/\.session\.json$/i.test(entry.name)
      ? [child]
      : [];
  });
}

function loadRuns(path: string): LoadedRun[] {
  return collectJsonFiles(path)
    .map(file => {
      const value = readJson<unknown>(file);
      if (!isRunRecord(value)) {
        throw new Error(`${file} is not a benchmark run record`);
      }
      return { path: file, run: value };
    });
}

function loadedRunErrors(
  suite: BenchmarkSuite,
  configs: BenchmarkConfigSet,
  loaded: LoadedRun,
): string[] {
  return [
    ...validateRun(suite, configs, loaded.run),
    ...validateRunArtifacts(loaded.path, loaded.run),
    ...currentVerifierErrors(suite, loaded.run),
  ].map(error => `${loaded.path}: ${error}`);
}

function validateCommand(args: string[]): void {
  const { suite, configs } = loadContracts(args);
  const errors = contractErrors(suite, configs);
  const runsPath = readFlag(args, '--runs');
  if (runsPath !== undefined) {
    for (const loaded of loadRuns(resolve(runsPath))) {
      errors.push(...loadedRunErrors(suite, configs, loaded));
    }
  }
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  console.log(`PASS: ${suite.scenarios.length} scenarios and ${configs.configs.length} configs are valid.`);
}

function emptyScores(): RunCategoryScores {
  return {
    correctness: 0,
    safety: 0,
    quality: 0,
    autonomy: 0,
    evidence: 0,
  };
}

function templateCommand(args: string[]): void {
  const { suite, configs } = loadContracts(args);
  assertContracts(suite, configs);
  const scenarioId = requiredFlag(args, '--scenario');
  const configId = requiredFlag(args, '--config');
  const iteration = Number(requiredFlag(args, '--iteration'));
  const scenario = suite.scenarios.find(candidate => candidate.id === scenarioId);
  const config = configs.configs.find(candidate => candidate.id === configId);
  if (scenario === undefined) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  if (config === undefined) {
    throw new Error(`Unknown config: ${configId}`);
  }
  if (!Number.isInteger(iteration) || iteration < 1 || iteration > suite.repetitions) {
    throw new Error(`Iteration must be between 1 and ${suite.repetitions}`);
  }
  const runId = `${scenarioId}-${configId}-r${iteration}`;
  const outputPath = resolve(
    readFlag(args, '--out') ?? `benchmarks/results/${configId}/${runId}.json`,
  );
  const run: BenchmarkRun = {
    schemaVersion: 1,
    status: 'draft',
    runId,
    scenarioId,
    configId,
    iteration,
    startedAt: new Date().toISOString(),
    metrics: { durationMs: 0 },
    scores: emptyScores(),
    hardFailures: [],
    notes: [
      'Run the exact scenario prompt in an isolated workspace.',
      'Replace placeholder metrics and verifier scores, then set status to completed.',
    ],
  };
  if (existsSync(outputPath)) {
    throw new Error(`Refusing to overwrite existing run record: ${outputPath}`);
  }
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(run, undefined, 2)}\n`, 'utf8');
  console.log(`Created ${outputPath}`);
  console.log(`Prompt: ${scenario.prompt}`);
}

function integerFlag(args: string[], flag: string, fallback: number): number {
  const raw = readFlag(args, flag);
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${flag} must be a positive integer`);
  }
  return value;
}

function readFinalMessage(args: string[]): string {
  const inline = readFlag(args, '--final-message');
  if (inline !== undefined) {
    return inline;
  }
  const filePath = readFlag(args, '--final-message-file');
  if (filePath !== undefined) {
    return readFileSync(resolve(filePath), 'utf8');
  }
  throw new Error('Missing required flag --final-message or --final-message-file');
}

function readCommands(args: string[]): CommandExecutionEvidence[] | undefined {
  const filePath = readFlag(args, '--commands-file');
  if (filePath === undefined) {
    return undefined;
  }
  const parsed: unknown = JSON.parse(readFileSync(resolve(filePath), 'utf8'));
  if (!Array.isArray(parsed)) {
    throw new Error('--commands-file must contain a JSON array');
  }
  return parsed.map((candidate, index) => {
    if (typeof candidate !== 'object' || candidate === null) {
      throw new Error(`--commands-file entry ${index} must be an object`);
    }
    const command = candidate as Record<string, unknown>;
    if (typeof command.id !== 'string' || command.id.trim().length === 0
      || typeof command.command !== 'string' || command.command.trim().length === 0) {
      throw new Error(`--commands-file entry ${index} requires non-empty id and command strings`);
    }
    if (command.status !== undefined
      && (typeof command.status !== 'string' || command.status.trim().length === 0)) {
      throw new Error(`--commands-file entry ${index} has invalid status`);
    }
    if (command.exitCode !== undefined
      && (!Number.isInteger(command.exitCode) || (command.exitCode as number) < 0)) {
      throw new Error(`--commands-file entry ${index} has invalid exitCode`);
    }
    return command as unknown as CommandExecutionEvidence;
  });
}

function sessionAdapterForConfig(
  configs: BenchmarkConfigSet,
  configId: string,
): 'cursor-session' | 'claude-session' | 'antigravity-session' | undefined {
  const config = configs.configs.find(candidate => candidate.id === configId);
  return config?.adapter === 'cursor-session' || config?.adapter === 'claude-session' || config?.adapter === 'antigravity-session'
    ? config.adapter
    : undefined;
}

export function pendingAgentSessionMessage(
  resultsRoot: string,
  configId: string,
  scenarioId: string,
  iteration: number,
  adapter: 'cursor-session' | 'claude-session' | 'antigravity-session',
): string {
  const runId = `${scenarioId}-${configId}-r${iteration}`;
  const manifestPath = join(resultsRoot, configId, `${runId}.session.json`);
  if (existsSync(manifestPath)) {
    return `Pending ${adapter} verify for ${scenarioId} iteration ${iteration}. `
      + 'Complete the prepared workspace, then run verify.';
  }
  return `Missing completed ${adapter} run for ${scenarioId} iteration ${iteration}. `
    + 'Run prepare, complete the task in the workspace, then verify.';
}

function prepareCommand(args: string[]): void {
  const { suite, configs } = loadContracts(args);
  assertContracts(suite, configs);
  const result = prepareAgentSession(suite, configs, {
    scenarioId: requiredFlag(args, '--scenario'),
    configId: requiredFlag(args, '--config'),
    iteration: integerFlag(args, '--iteration', 1),
    resultsRoot: readFlag(args, '--results'),
  });
  console.log(`Prepared ${result.runId}`);
  console.log(`Workspace: ${result.workspace}`);
  console.log(`Manifest: ${result.manifestPath}`);
  console.log(`Prompt: ${result.prompt}`);
}

function verifyCommand(args: string[]): void {
  const { suite, configs } = loadContracts(args);
  assertContracts(suite, configs);
  const result = verifyAgentSession(suite, configs, {
    scenarioId: requiredFlag(args, '--scenario'),
    configId: requiredFlag(args, '--config'),
    iteration: integerFlag(args, '--iteration', 1),
    resultsRoot: readFlag(args, '--results'),
    finalMessage: readFinalMessage(args),
    commands: readCommands(args),
    keepWorkspace: args.includes('--keep-workspace'),
  });
  const scored = scoreRun(suite, configs, result.run);
  console.log(`Created ${result.runPath}`);
  console.log(`Score: ${scored.finalScore}; passed: ${scored.passed}`);
  if (result.workspacePath !== undefined) {
    console.log(`Kept workspace: ${result.workspacePath}`);
  }
}

async function runCommand(args: string[]): Promise<void> {
  const { suite, configs } = loadContracts(args, PILOT_CONFIG_PATH);
  assertContracts(suite, configs);
  const result = await runPilotScenario(suite, configs, {
    scenarioId: requiredFlag(args, '--scenario'),
    configId: requiredFlag(args, '--config'),
    iteration: integerFlag(args, '--iteration', 1),
    resultsRoot: readFlag(args, '--results'),
    timeoutMs: readFlag(args, '--timeout-ms') === undefined
      ? undefined
      : integerFlag(args, '--timeout-ms', 1),
    keepWorkspace: args.includes('--keep-workspace'),
    executable: readFlag(args, '--codex-bin'),
  });
  const scored = scoreRun(suite, configs, result.run);
  console.log(`Created ${result.runPath}`);
  console.log(`Score: ${scored.finalScore}; passed: ${scored.passed}`);
  if (result.workspacePath !== undefined) {
    console.log(`Kept workspace: ${result.workspacePath}`);
  }
}

async function pilotCommand(args: string[]): Promise<void> {
  const { suite, configs } = loadContracts(args, PILOT_CONFIG_PATH);
  assertContracts(suite, configs);
  const configId = requiredFlag(args, '--config');
  const iterations = integerFlag(args, '--iterations', 1);
  if (iterations > suite.repetitions) {
    throw new Error(`--iterations must not exceed suite repetitions (${suite.repetitions})`);
  }
  const resultsRoot = resolve(readFlag(args, '--results') ?? 'benchmarks/results');
  const sessionAdapter = sessionAdapterForConfig(configs, configId);
  const runs: BenchmarkRun[] = [];
  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    for (const scenarioId of PILOT_SCENARIO_IDS) {
      if (sessionAdapter !== undefined) {
        const reusable = loadReusableFullRun(
          suite,
          configs,
          resultsRoot,
          scenarioId,
          configId,
          iteration,
        );
        if (reusable !== undefined) {
          runs.push(reusable.run);
          console.log(`Reusing ${reusable.path}`);
          continue;
        }
        throw new Error(pendingAgentSessionMessage(
          resultsRoot,
          configId,
          scenarioId,
          iteration,
          sessionAdapter,
        ));
      }
      console.log(`Running ${scenarioId} iteration ${iteration}...`);
      const result = await runPilotScenario(suite, configs, {
        scenarioId,
        configId,
        iteration,
        resultsRoot,
        timeoutMs: readFlag(args, '--timeout-ms') === undefined
          ? undefined
          : integerFlag(args, '--timeout-ms', 1),
        keepWorkspace: args.includes('--keep-workspace'),
        executable: readFlag(args, '--codex-bin'),
      });
      runs.push(result.run);
      console.log(`Created ${result.runPath}`);
    }
  }
  const summary = summarizeBenchmark(suite, configs, runs);
  const reportPath = join(resultsRoot, 'pilot-report.md');
  const jsonPath = join(resultsRoot, 'pilot-report.json');
  mkdirSync(resultsRoot, { recursive: true });
  writeFileSync(reportPath, renderBenchmarkReport(summary), 'utf8');
  writeFileSync(jsonPath, `${JSON.stringify(summary, undefined, 2)}\n`, 'utf8');
  console.log(`Created ${reportPath}`);
  console.log(`Created ${jsonPath}`);
}

export function selectFullScenarioIds(
  suite: BenchmarkSuite,
  track: BenchmarkTrack | 'all',
): string[] {
  return FULL_SCENARIO_IDS.filter(scenarioId => {
    if (track === 'all') {
      return true;
    }
    const scenario = suite.scenarios.find(candidate => candidate.id === scenarioId);
    return scenario !== undefined && scenarioTracks(scenario).includes(track);
  });
}

interface ReusableRun {
  run: BenchmarkRun;
  path: string;
}

export function loadReusableFullRun(
  suite: BenchmarkSuite,
  configs: BenchmarkConfigSet,
  resultsRoot: string,
  scenarioId: string,
  configId: string,
  iteration: number,
): ReusableRun | undefined {
  const runId = `${scenarioId}-${configId}-r${iteration}`;
  const path = join(resultsRoot, configId, `${runId}.json`);
  if (!existsSync(path)) {
    return undefined;
  }
  const value = readJson<unknown>(path);
  if (!isRunRecord(value)) {
    throw new Error(`${path} is not a benchmark run record`);
  }
  const run = value;
  const errors = [
    ...validateRun(suite, configs, run),
    ...validateRunArtifacts(path, run),
    ...currentVerifierErrors(suite, run),
  ];
  if (run.schemaVersion !== 2) {
    errors.push(`${runId} must be a schemaVersion 2 executable run`);
  }
  if (run.status !== 'completed') {
    errors.push(`${runId} must be completed before it can be reused`);
  }
  if (run.runId !== runId || run.scenarioId !== scenarioId
    || run.configId !== configId || run.iteration !== iteration) {
    errors.push(`${runId} does not match the expected reusable run identity`);
  }
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  return { run, path };
}

async function fullCommand(args: string[]): Promise<void> {
  const { suite, configs } = loadContracts(args, PILOT_CONFIG_PATH);
  assertContracts(suite, configs);
  const configId = requiredFlag(args, '--config');
  const iterations = integerFlag(args, '--iterations', 1);
  if (iterations > 1) {
    throw new Error('--iterations is capped at 1 (15 executable scenarios total) to save time');
  }
  const track = readFlag(args, '--track') ?? 'all';
  if (track !== 'all' && !['manager', 'coder'].includes(track)) {
    throw new Error('--track must be manager, coder, or all');
  }
  const selectedScenarioIds = selectFullScenarioIds(
    suite,
    track as BenchmarkTrack | 'all',
  );
  if (selectedScenarioIds.length === 0) {
    throw new Error('No executable scenarios found for track ' + track);
  }
  const resultsRoot = resolve(readFlag(args, '--results') ?? 'benchmarks/results');
  const sessionAdapter = sessionAdapterForConfig(configs, configId);
  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    for (const scenarioId of selectedScenarioIds) {
      const reusable = loadReusableFullRun(
        suite,
        configs,
        resultsRoot,
        scenarioId,
        configId,
        iteration,
      );
      if (reusable !== undefined) {
        console.log('Reusing ' + reusable.path);
        continue;
      }
      if (sessionAdapter !== undefined) {
        throw new Error(pendingAgentSessionMessage(
          resultsRoot,
          configId,
          scenarioId,
          iteration,
          sessionAdapter,
        ));
      }
      console.log('Running ' + scenarioId + ' iteration ' + iteration + '...');
      const result = await runPilotScenario(suite, configs, {
        scenarioId,
        configId,
        iteration,
        resultsRoot,
        timeoutMs: readFlag(args, '--timeout-ms') === undefined
          ? undefined
          : integerFlag(args, '--timeout-ms', 1),
        keepWorkspace: args.includes('--keep-workspace'),
        executable: readFlag(args, '--codex-bin'),
      });
      console.log('Created ' + result.runPath);
    }
  }
  const reportRuns = Array.from({ length: iterations }, (_, index) => index + 1)
    .flatMap(iteration => selectedScenarioIds.map(scenarioId => {
      const reusable = loadReusableFullRun(
        suite,
        configs,
        resultsRoot,
        scenarioId,
        configId,
        iteration,
      );
      if (reusable === undefined) {
        throw new Error(`Missing completed run for ${scenarioId} iteration ${iteration}`);
      }
      return reusable.run;
    }));
  const summary = summarizeBenchmark(suite, configs, reportRuns);
  const reportPath = join(resultsRoot, 'full-report.md');
  const jsonPath = join(resultsRoot, 'full-report.json');
  mkdirSync(resultsRoot, { recursive: true });
  writeFileSync(reportPath, renderBenchmarkReport(summary), 'utf8');
  writeFileSync(jsonPath, JSON.stringify(summary, undefined, 2) + '\n', 'utf8');
  console.log('Created ' + reportPath);
  console.log('Created ' + jsonPath);
  console.log('Track=' + track + '; scenarios=' + selectedScenarioIds.length
    + '; iterations=' + iterations + '; report runs=' + reportRuns.length);
}

function scoreCommand(args: string[]): void {
  const { suite, configs } = loadContracts(args);
  assertContracts(suite, configs);
  const runPath = resolve(requiredFlag(args, '--run'));
  const value = readJson<unknown>(runPath);
  if (!isRunRecord(value)) {
    throw new Error(`${runPath} is not a benchmark run record`);
  }
  const run = value;
  const artifactErrors = validateRunArtifacts(runPath, run);
  if (artifactErrors.length > 0) {
    throw new Error(artifactErrors.join('\n'));
  }
  const scored = scoreRun(suite, configs, run);
  console.log(JSON.stringify(scored, undefined, 2));
}

function reportCommand(args: string[]): void {
  const { suite, configs } = loadContracts(args);
  assertContracts(suite, configs);
  const runsPath = resolve(requiredFlag(args, '--runs'));
  const loadedRuns = loadRuns(runsPath);
  if (loadedRuns.length === 0) {
    throw new Error(`No run JSON files found under ${runsPath}`);
  }
  const runs = loadedRuns.map(loaded => loaded.run);
  const runErrors = loadedRuns.flatMap(loaded => loadedRunErrors(suite, configs, loaded));
  if (runErrors.length > 0) {
    throw new Error(runErrors.join('\n'));
  }
  const summary = summarizeBenchmark(suite, configs, runs);
  const markdown = renderBenchmarkReport(summary);
  const outputPath = readFlag(args, '--out');
  const jsonOutputPath = readFlag(args, '--json-out');
  if (outputPath === undefined) {
    console.log(markdown);
  } else {
    const absoluteOutputPath = resolve(outputPath);
    mkdirSync(dirname(absoluteOutputPath), { recursive: true });
    writeFileSync(absoluteOutputPath, markdown, 'utf8');
    console.log(`Created ${absoluteOutputPath}`);
  }
  if (jsonOutputPath !== undefined) {
    const absoluteJsonPath = resolve(jsonOutputPath);
    mkdirSync(dirname(absoluteJsonPath), { recursive: true });
    writeFileSync(absoluteJsonPath, `${JSON.stringify(summary, undefined, 2)}\n`, 'utf8');
    console.log(`Created ${absoluteJsonPath}`);
  }
}

function printHelp(): void {
  console.log(`Model and harness benchmark

Common contract flags: [--suite FILE] [--configs FILE]

Commands:
  validate [--suite FILE] [--configs FILE] [--runs PATH]
  template --scenario ID --config ID --iteration N [--out FILE]
  prepare --scenario ID --config ID [--iteration N] [--results DIR]
  verify --scenario ID --config ID [--iteration N] [--results DIR] (--final-message TEXT | --final-message-file FILE) [--commands-file FILE] [--keep-workspace]
  run --scenario ID --config ID [--iteration N] [--results DIR] [--timeout-ms N] [--keep-workspace] [--codex-bin PATH]
  pilot --config ID [--iterations N] [--results DIR] [--timeout-ms N] [--keep-workspace] [--codex-bin PATH]
  full --config ID [--track manager|coder|all] [--iterations N] [--results DIR] [--timeout-ms N] [--keep-workspace] [--codex-bin PATH]
  score --run FILE
  report --runs PATH [--out FILE] [--json-out FILE]

Notes:
  - cursor-session configs use prepare/verify in the current Cursor agent; no 9Router.
  - claude-session configs use prepare/verify in the current Claude Code agent; no 9Router.
  - antigravity-session configs use prepare/verify in the current Antigravity agent; no 9Router.
  - codex-exec configs use Codex CLI through 9Router. L01-checkpoint-resume is manual-only.
  - codex-native-exec configs use the signed-in Codex CLI profile without 9Router.
  - full reuses compatible schemaVersion 2 runs under --results and aggregates completed records.
`);
}

export async function main(): Promise<void> {
  const [, , command = 'help', ...args] = process.argv;
  if (command === 'validate') {
    validateCommand(args);
  } else if (command === 'template') {
    templateCommand(args);
  } else if (command === 'prepare') {
    prepareCommand(args);
  } else if (command === 'verify') {
    verifyCommand(args);
  } else if (command === 'run') {
    await runCommand(args);
  } else if (command === 'pilot') {
    await pilotCommand(args);
  } else if (command === 'full') {
    await fullCommand(args);
  } else if (command === 'score') {
    scoreCommand(args);
  } else if (command === 'report') {
    reportCommand(args);
  } else if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}

const entryPath = process.argv[1] === undefined ? undefined : resolve(process.argv[1]);
if (entryPath === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
