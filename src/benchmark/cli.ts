/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  FULL_SCENARIO_IDS,
  PILOT_SCENARIO_IDS,
  runPilotScenario,
  validateExecutableFixtures,
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
  RunCategoryScores,
} from './types';

const DEFAULT_SUITE_PATH = 'benchmarks/model-harness-suite.json';
const DEFAULT_CONFIG_PATH = 'benchmarks/configs.example.json';
const PILOT_CONFIG_PATH = 'benchmarks/configs.codex-sol-ultra.json';

function readJson<T>(path: string): T {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  return parsed as T;
}

function isRunRecord(value: unknown): value is BenchmarkRun {
  return typeof value === 'object'
    && value !== null
    && 'runId' in value
    && typeof value.runId === 'string';
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
  return [
    ...validateSuite(suite),
    ...validateConfigs(configs),
    ...validateExecutableFixtures(suite),
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
    return path.endsWith('.json') ? [path] : [];
  }
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      return collectJsonFiles(child);
    }
    return entry.isFile() && entry.name.endsWith('.json') ? [child] : [];
  });
}

function loadRuns(path: string): BenchmarkRun[] {
  return collectJsonFiles(path)
    .map(file => readJson<unknown>(file))
    .filter(isRunRecord);
}

function validateCommand(args: string[]): void {
  const { suite, configs } = loadContracts(args);
  const errors = contractErrors(suite, configs);
  const runsPath = readFlag(args, '--runs');
  if (runsPath !== undefined) {
    for (const run of loadRuns(resolve(runsPath))) {
      errors.push(...validateRun(suite, configs, run));
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
  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    for (const scenarioId of PILOT_SCENARIO_IDS) {
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
  const run = readJson<BenchmarkRun>(path);
  const errors = validateRun(suite, configs, run);
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
  if (iterations > suite.repetitions) {
    throw new Error('--iterations must not exceed suite repetitions (' + suite.repetitions + ')');
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
  const reportRuns = loadRuns(resultsRoot);
  const reportErrors = reportRuns.flatMap(run => validateRun(suite, configs, run));
  if (reportErrors.length > 0) {
    throw new Error(reportErrors.join('\n'));
  }
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
  const scored = scoreRun(suite, configs, readJson<BenchmarkRun>(runPath));
  console.log(JSON.stringify(scored, undefined, 2));
}

function reportCommand(args: string[]): void {
  const { suite, configs } = loadContracts(args);
  assertContracts(suite, configs);
  const runsPath = resolve(requiredFlag(args, '--runs'));
  const runs = loadRuns(runsPath);
  if (runs.length === 0) {
    throw new Error(`No run JSON files found under ${runsPath}`);
  }
  const runErrors = runs.flatMap(run => validateRun(suite, configs, run));
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
  run --scenario ID --config ID [--iteration N] [--results DIR] [--timeout-ms N]
  pilot --config ID [--iterations N] [--results DIR] [--timeout-ms N]
  full --config ID [--track manager|coder|all] [--iterations N] [--results DIR] [--timeout-ms N]
  score --run FILE
  report --runs PATH [--out FILE] [--json-out FILE]
`);
}

export async function main(): Promise<void> {
  const [, , command = 'help', ...args] = process.argv;
  if (command === 'validate') {
    validateCommand(args);
  } else if (command === 'template') {
    templateCommand(args);
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
