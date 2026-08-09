/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  BENCHMARK_TRACKS, SCORE_CATEGORIES, type BenchmarkConfig, type BenchmarkConfigSet, type BenchmarkRun,
  type BenchmarkScenario, type BenchmarkSuite, type BenchmarkSummary, type BudgetRange,
  type BenchmarkExecution, type BenchmarkVerification, type BenchmarkVerificationCheck,
  type ConfigSummary, type ScoredRun, type RunCategoryScores, type ScoreCategory,
  type BenchmarkTrack, type TrackSummary,
  type ScoreWeights,
} from './types';

const EFFICIENCY_METRIC_WEIGHTS = {
  durationMs: 40,
  totalTokens: 30,
  costUsd: 20,
  toolCalls: 10,
} as const;

const REQUIRED_RUN_SCORES = ['correctness', 'safety', 'quality', 'autonomy', 'evidence'] as const;
const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/i;
const VERIFICATION_PASS_SCORE = 70;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function round(value: number, digits = 2): number {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function isFiniteNonNegative(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value >= 0;
}

function validateBudgetRange(name: string, range: BudgetRange | unknown): string[] {
  if (range === undefined) {
    return [];
  }
  if (!isRecord(range)
    || !isFiniteNonNegative(range.target as number | undefined)
    || !isFiniteNonNegative(range.limit as number | undefined)) {
    return [`${name} target and limit must be finite non-negative numbers`];
  }
  if ((range.limit as number) <= (range.target as number)) {
    return [`${name} limit must be greater than target`];
  }
  return [];
}

function automaticWeight(suite: BenchmarkSuite, scenario: BenchmarkScenario): number {
  return scenario.automaticCategories.reduce(
    (total, category) => total + suite.weights[category],
    0,
  );
}

export function scenarioTracks(scenario: BenchmarkScenario): BenchmarkTrack[] {
  return scenario.tracks === undefined || scenario.tracks.length === 0
    ? [...BENCHMARK_TRACKS]
    : scenario.tracks;
}

function validateScenario(
  suite: BenchmarkSuite,
  value: unknown,
  scenarioIds: Set<string>,
  index: number,
): string[] {
  if (!isRecord(value)) {
    return [`Suite scenario ${index} must be an object`];
  }
  const scenario = value as unknown as BenchmarkScenario;
  const errors: string[] = [];
  const id = typeof scenario.id === 'string' ? scenario.id : `scenario[${index}]`;
  if (typeof scenario.id !== 'string' || !SAFE_ID_PATTERN.test(scenario.id)) {
    errors.push(`Scenario id is not path-safe: ${String(scenario.id)}`);
  } else if (scenarioIds.has(scenario.id)) {
    errors.push(`Duplicate scenario id: ${scenario.id}`);
  } else {
    scenarioIds.add(scenario.id);
  }
  for (const field of ['title', 'category', 'prompt'] as const) {
    if (typeof scenario[field] !== 'string' || scenario[field].trim().length === 0) {
      errors.push(`${id}.${field} must be a non-empty string`);
    }
  }
  if (!['small', 'medium', 'large'].includes(scenario.difficulty)) {
    errors.push(`${id}.difficulty is invalid`);
  }
  for (const field of ['setup', 'acceptance'] as const) {
    const entries = scenario[field];
    if (!Array.isArray(entries) || entries.some(entry => typeof entry !== 'string')) {
      errors.push(`${id}.${field} must be an array of strings`);
    }
  }
  if (scenario.tracks !== undefined) {
    if (!Array.isArray(scenario.tracks)) {
      errors.push(`${id} tracks must be an array`);
    } else {
      if (scenario.tracks.length === 0) {
        errors.push(`${id} tracks must not be empty`);
      }
      const trackSet = new Set<BenchmarkTrack>(scenario.tracks);
      if (trackSet.size !== scenario.tracks.length) {
        errors.push(`${id} tracks contains duplicates`);
      }
      for (const track of scenario.tracks) {
        if (!BENCHMARK_TRACKS.includes(track)) {
          errors.push(`${id} contains unknown track ${String(track)}`);
        }
      }
    }
  }
  errors.push(...validateScore(`${id}.passScore`, scenario.passScore));
  errors.push(...validateScore(`${id}.minimumCorrectness`, scenario.minimumCorrectness));
  if (!Array.isArray(scenario.automaticCategories)) {
    errors.push(`${id} automaticCategories must be an array`);
  } else {
    const categorySet = new Set<ScoreCategory>(scenario.automaticCategories);
    if (categorySet.size !== scenario.automaticCategories.length) {
      errors.push(`${id} automaticCategories contains duplicates`);
    }
    for (const category of scenario.automaticCategories) {
      if (!SCORE_CATEGORIES.includes(category)) {
        errors.push(`${id} contains unknown automatic category ${String(category)}`);
      }
    }
    const objectiveWeight = automaticWeight(suite, scenario);
    if (Number.isFinite(suite.minimumAutomaticWeight)
      && objectiveWeight < suite.minimumAutomaticWeight) {
      errors.push(`${id} automatic score weight is ${objectiveWeight}, below ${suite.minimumAutomaticWeight}`);
    }
  }
  if (!isRecord(scenario.budgets)) {
    errors.push(`${id}.budgets must be an object`);
  } else {
    if (scenario.budgets.durationMs === undefined) {
      errors.push(`${id}.durationMs is required`);
    }
    errors.push(...validateBudgetRange(`${id}.durationMs`, scenario.budgets.durationMs));
    errors.push(...validateBudgetRange(`${id}.totalTokens`, scenario.budgets.totalTokens));
    errors.push(...validateBudgetRange(`${id}.costUsd`, scenario.budgets.costUsd));
    errors.push(...validateBudgetRange(`${id}.toolCalls`, scenario.budgets.toolCalls));
  }
  if (scenario.fixture !== undefined) {
    if (!isRecord(scenario.fixture)) {
      errors.push(`${id} fixture must be an object`);
    } else {
      if (typeof scenario.fixture.id !== 'string' || !SAFE_ID_PATTERN.test(scenario.fixture.id)) {
        errors.push(`${id} fixture id is not path-safe`);
      }
      if (typeof scenario.fixture.version !== 'string'
        || scenario.fixture.version.trim().length === 0) {
        errors.push(`${id} fixture version must not be empty`);
      }
      if (typeof scenario.fixture.verifier !== 'string'
        || !SAFE_ID_PATTERN.test(scenario.fixture.verifier)) {
        errors.push(`${id} fixture verifier is not path-safe`);
      }
    }
  }
  return errors;
}

export function validateSuite(value: BenchmarkSuite | unknown): string[] {
  if (!isRecord(value)) {
    return ['Suite must be an object'];
  }
  const suite = value as unknown as BenchmarkSuite;
  const errors: string[] = [];
  if (suite.schemaVersion !== 1) {
    errors.push('Suite schemaVersion must be 1');
  }
  for (const field of ['name', 'description'] as const) {
    if (typeof suite[field] !== 'string' || suite[field].trim().length === 0) {
      errors.push(`Suite ${field} must be a non-empty string`);
    }
  }
  const weightTotal = SCORE_CATEGORIES.reduce((total, category) => {
    const weight = isRecord(suite.weights) ? suite.weights[category] as number | undefined : undefined;
    if (!isFiniteNonNegative(weight)) {
      errors.push(`Score weight ${category} must be a finite non-negative number`);
      return total;
    }
    return total + weight;
  }, 0);
  if (weightTotal !== 100) {
    errors.push(`Score weights must total 100, received ${weightTotal}`);
  }
  if (suite.minimumEfficiencyCoverage !== undefined
    && (!Number.isFinite(suite.minimumEfficiencyCoverage)
      || suite.minimumEfficiencyCoverage < 0
      || suite.minimumEfficiencyCoverage > 100)) {
    errors.push('minimumEfficiencyCoverage must be between 0 and 100');
  }
  if (!Number.isInteger(suite.repetitions) || suite.repetitions < 1) {
    errors.push('Suite repetitions must be a positive integer');
  }
  if (!Number.isFinite(suite.minimumAutomaticWeight)
    || suite.minimumAutomaticWeight < 0 || suite.minimumAutomaticWeight > 100) {
    errors.push('minimumAutomaticWeight must be between 0 and 100');
  }
  if (!Array.isArray(suite.hardFailureCodes)
    || suite.hardFailureCodes.some(code => typeof code !== 'string' || !SAFE_ID_PATTERN.test(code))) {
    errors.push('Suite hardFailureCodes must be an array of path-safe strings');
  } else if (new Set(suite.hardFailureCodes).size !== suite.hardFailureCodes.length) {
    errors.push('Suite hardFailureCodes contains duplicates');
  }
  if (!Array.isArray(suite.scenarios)) {
    return [...errors, 'Suite scenarios must be an array'];
  }
  const scenarioIds = new Set<string>();
  for (const [index, scenario] of suite.scenarios.entries()) {
    errors.push(...validateScenario(suite, scenario, scenarioIds, index));
  }
  return errors;
}

export function validateConfigs(value: BenchmarkConfigSet | unknown): string[] {
  if (!isRecord(value)) {
    return ['Config set must be an object'];
  }
  const configSet = value as unknown as BenchmarkConfigSet;
  const errors: string[] = [];
  if (configSet.schemaVersion !== 1) {
    errors.push('Config schemaVersion must be 1');
  }
  if (!Array.isArray(configSet.configs)) {
    return [...errors, 'Config configs must be an array'];
  }
  const byId = new Map<string, BenchmarkConfig>();
  const validConfigs: BenchmarkConfig[] = [];
  for (const [index, candidate] of configSet.configs.entries()) {
    if (!isRecord(candidate)) {
      errors.push(`Config entry ${index} must be an object`);
      continue;
    }
    const config = candidate as unknown as BenchmarkConfig;
    if (typeof config.id !== 'string' || !SAFE_ID_PATTERN.test(config.id)) {
      errors.push(`Config id is not path-safe: ${String(config.id)}`);
      continue;
    }
    if (byId.has(config.id)) {
      errors.push(`Duplicate config id: ${config.id}`);
    } else {
      byId.set(config.id, config);
    }
    validConfigs.push(config);
    for (const field of ['harness', 'model'] as const) {
      if (typeof config[field] !== 'string' || config[field].trim().length === 0) {
        errors.push(`${config.id} ${field} must be a non-empty string`);
      }
    }
    if (!['controlled', 'native'].includes(config.mode)) {
      errors.push(`${config.id} has invalid mode ${String(config.mode)}`);
    }
    if (!['baseline', 'candidate', 'native'].includes(config.role)) {
      errors.push(`${config.id} has invalid role ${String(config.role)}`);
    }
    if (config.role === 'baseline' && config.mode !== 'controlled') {
      errors.push(`${config.id} baseline configs must use controlled mode`);
    }
    if (config.role === 'native' && config.mode !== 'native') {
      errors.push(`${config.id} native configs must use native mode`);
    }
    if (config.role === 'candidate' && config.mode !== 'controlled') {
      errors.push(`${config.id} candidate configs must use controlled mode`);
    }
    if (config.adapter !== undefined
      && !['manual', 'codex-exec', 'cursor-session'].includes(config.adapter)) {
      errors.push(`${config.id} has invalid adapter ${String(config.adapter)}`);
    }
    if (config.adapter === 'cursor-session' && config.codexProvider !== undefined) {
      errors.push(`${config.id} cursor-session configs must not declare codexProvider`);
    }
    if (config.adapter === 'cursor-session' && config.reasoningEffort === undefined) {
      errors.push(`${config.id} cursor-session configs require reasoningEffort`);
    }
    if (config.adapter === 'codex-exec' && !['codex', 'codex-cli'].includes(config.harness)) {
      errors.push(`${config.id} codex-exec configs must use codex or codex-cli harness`);
    }
    if (config.adapter === 'cursor-session' && config.harness !== 'cursor') {
      errors.push(`${config.id} cursor-session configs must use the cursor harness`);
    }
    if (config.reasoningEffort !== undefined
      && !['low', 'medium', 'high', 'xhigh', 'max', 'ultra'].includes(config.reasoningEffort)) {
      errors.push(`${config.id} has invalid reasoning effort ${String(config.reasoningEffort)}`);
    }
    if (config.codexProvider !== undefined) {
      if (!isRecord(config.codexProvider)) {
        errors.push(`${config.id} codexProvider must be an object`);
        continue;
      }
      const provider = config.codexProvider;
      if (config.adapter !== 'codex-exec') {
        errors.push(`${config.id} codexProvider requires the codex-exec adapter`);
      }
      if (typeof provider.id !== 'string' || !SAFE_ID_PATTERN.test(provider.id)) {
        errors.push(`${config.id} has invalid Codex provider id ${String(provider.id)}`);
      }
      if (typeof provider.name !== 'string' || provider.name.trim().length === 0) {
        errors.push(`${config.id} Codex provider name must not be empty`);
      }
      if (typeof provider.baseUrl !== 'string') {
        errors.push(`${config.id} Codex provider baseUrl must be a valid URL`);
      } else {
        try {
          const url = new URL(provider.baseUrl);
          if (!['http:', 'https:'].includes(url.protocol) || url.username.length > 0
            || url.password.length > 0) {
            errors.push(`${config.id} Codex provider baseUrl must be an HTTP URL without credentials`);
          }
        } catch {
          errors.push(`${config.id} Codex provider baseUrl must be a valid URL`);
        }
      }
      if (typeof provider.envKey !== 'string'
        || !/^[A-Z_][A-Z0-9_]*$/.test(provider.envKey)) {
        errors.push(`${config.id} has invalid Codex provider envKey ${String(provider.envKey)}`);
      }
      if (!['responses', 'chat'].includes(provider.wireApi)) {
        errors.push(`${config.id} has invalid Codex provider wireApi ${String(provider.wireApi)}`);
      }
    }
  }
  for (const config of validConfigs) {
    if (config.baselineConfigId === undefined) {
      continue;
    }
    const baseline = byId.get(config.baselineConfigId);
    if (baseline === undefined) {
      errors.push(`${config.id} references missing baseline ${config.baselineConfigId}`);
    } else {
      if (baseline.model !== config.model) {
        errors.push(`${config.id} and baseline ${baseline.id} must use the same model`);
      }
      if (baseline.role !== 'baseline' || baseline.mode !== 'controlled') {
        errors.push(`${config.id} baselineConfigId must reference a controlled baseline config`);
      }
    }
  }
  return errors;
}

function scoreBudget(value: number, budget: BudgetRange): number {
  if (value <= budget.target) {
    return 100;
  }
  if (value >= budget.limit) {
    return 0;
  }
  return 100 * (budget.limit - value) / (budget.limit - budget.target);
}

function scoreEfficiency(run: BenchmarkRun, scenario: BenchmarkScenario): { score: number; coverage: number } {
  const metrics: Array<{ value: number | undefined; budget: BudgetRange | undefined; weight: number }> = [
    {
      value: run.metrics.durationMs,
      budget: scenario.budgets.durationMs,
      weight: EFFICIENCY_METRIC_WEIGHTS.durationMs,
    },
    {
      value: (run.metrics.inputTokens ?? 0) + (run.metrics.outputTokens ?? 0) || undefined,
      budget: scenario.budgets.totalTokens,
      weight: EFFICIENCY_METRIC_WEIGHTS.totalTokens,
    },
    {
      value: run.metrics.costUsd,
      budget: scenario.budgets.costUsd,
      weight: EFFICIENCY_METRIC_WEIGHTS.costUsd,
    },
    {
      value: run.metrics.toolCalls,
      budget: scenario.budgets.toolCalls,
      weight: EFFICIENCY_METRIC_WEIGHTS.toolCalls,
    },
  ];
  const available = metrics.filter(
    (metric): metric is { value: number; budget: BudgetRange; weight: number } =>
      isFiniteNonNegative(metric.value) && metric.budget !== undefined,
  );
  const availableWeight = available.reduce((total, metric) => total + metric.weight, 0);
  const weightedScore = available.reduce(
    (total, metric) => total + scoreBudget(metric.value, metric.budget) * metric.weight,
    0,
  );
  return {
    score: availableWeight === 0 ? 0 : round(weightedScore / availableWeight),
    coverage: availableWeight,
  };
}

function validateScore(name: string, value: number | undefined): string[] {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    return [`${name} must be between 0 and 100`];
  }
  return [];
}

function validateRunIdentity(
  suite: BenchmarkSuite,
  configSet: BenchmarkConfigSet,
  run: BenchmarkRun,
): string[] {
  const errors: string[] = [];
  if (run.schemaVersion !== 1 && run.schemaVersion !== 2) {
    errors.push(`${run.runId} schemaVersion must be 1 or 2`);
  }
  if (!SAFE_ID_PATTERN.test(run.runId)) {
    errors.push(`Run id is not path-safe: ${run.runId}`);
  }
  if (!['draft', 'completed'].includes(run.status)) {
    errors.push(`${run.runId} has invalid status ${String(run.status)}`);
  }
  if (!suite.scenarios.some(scenario => scenario.id === run.scenarioId)) {
    errors.push(`${run.runId} references unknown scenario ${run.scenarioId}`);
  }
  if (!configSet.configs.some(config => config.id === run.configId)) {
    errors.push(`${run.runId} references unknown config ${run.configId}`);
  }
  if (!Number.isInteger(run.iteration) || run.iteration < 1 || run.iteration > suite.repetitions) {
    errors.push(`${run.runId} iteration must be between 1 and ${suite.repetitions}`);
  } else {
    const expectedRunId = `${run.scenarioId}-${run.configId}-r${run.iteration}`;
    if (run.runId !== expectedRunId) {
      errors.push(`${run.runId} must use canonical run id ${expectedRunId}`);
    }
  }
  if (Number.isNaN(Date.parse(run.startedAt))) {
    errors.push(`${run.runId} startedAt must be an ISO-compatible timestamp`);
  }
  return errors;
}

function validateRunMetrics(run: BenchmarkRun): string[] {
  const errors: string[] = [];
  if (!isFiniteNonNegative(run.metrics?.durationMs)) {
    errors.push(`${run.runId} durationMs must be a finite non-negative number`);
  }
  for (const metric of [
    'inputTokens',
    'cachedInputTokens',
    'outputTokens',
    'reasoningOutputTokens',
    'costUsd',
    'toolCalls',
  ] as const) {
    const value = run.metrics?.[metric];
    if (value !== undefined && !isFiniteNonNegative(value)) {
      errors.push(`${run.runId}.${metric} must be a finite non-negative number`);
    }
  }
  const interventions = run.metrics?.humanInterventions;
  if (interventions !== undefined && (!Number.isInteger(interventions) || interventions < 0)) {
    errors.push(`${run.runId}.humanInterventions must be a non-negative integer`);
  }
  return errors;
}

function validateArtifact(name: string, artifact: unknown): string[] {
  if (typeof artifact !== 'object' || artifact === null) {
    return [`${name} is required`];
  }
  const candidate = artifact as Record<string, unknown>;
  const errors: string[] = [];
  if (typeof candidate.path !== 'string' || candidate.path.length === 0
    || candidate.path.includes('..') || /^[\\/]/.test(candidate.path)
    || /^[A-Za-z]:/.test(candidate.path)) {
    errors.push(`${name}.path must be a relative path without parent traversal`);
  }
  if (typeof candidate.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(candidate.sha256)) {
    errors.push(`${name}.sha256 must be a SHA-256 hex digest`);
  }
  if (typeof candidate.bytes !== 'number' || !Number.isInteger(candidate.bytes) || candidate.bytes < 0) {
    errors.push(`${name}.bytes must be a non-negative integer`);
  }
  return errors;
}

function validateExecution(execution: BenchmarkExecution | undefined, run: BenchmarkRun): string[] {
  if (typeof execution !== 'object' || execution === null) {
    return [`${run.runId}.execution is required for schemaVersion 2`];
  }
  const errors: string[] = [];
  if (!['manual', 'codex-exec', 'cursor-session'].includes(execution.adapter)) {
    errors.push(`${run.runId}.execution.adapter is invalid`);
  }
  if (!['controlled', 'native'].includes(execution.mode)) {
    errors.push(`${run.runId}.execution.mode is invalid`);
  }
  if (!['completed', 'failed', 'timed_out', 'adapter_error'].includes(execution.outcome)) {
    errors.push(`${run.runId}.execution.outcome is invalid`);
  }
  if (typeof execution.timedOut !== 'boolean') {
    errors.push(`${run.runId}.execution.timedOut must be boolean`);
  }
  if (execution.exitCode !== undefined
    && (!Number.isInteger(execution.exitCode) || execution.exitCode < 0)) {
    errors.push(`${run.runId}.execution.exitCode must be a non-negative integer`);
  }
  if (execution.outcome === 'completed'
    && (execution.exitCode !== 0 || execution.timedOut)) {
    errors.push(`${run.runId}.execution completed outcome requires exitCode 0 without timeout`);
  }
  if (execution.outcome === 'failed'
    && (execution.exitCode === undefined || execution.exitCode === 0 || execution.timedOut)) {
    errors.push(`${run.runId}.execution failed outcome requires a non-zero exitCode without timeout`);
  }
  if (execution.outcome === 'timed_out' && execution.timedOut !== true) {
    errors.push(`${run.runId}.execution timed_out outcome requires timedOut=true`);
  }
  if (execution.timedOut === true && execution.outcome !== 'timed_out') {
    errors.push(`${run.runId}.execution timedOut=true requires outcome=timed_out`);
  }
  if (!Array.isArray(execution.parseErrors)) {
    errors.push(`${run.runId}.execution.parseErrors must be an array`);
  } else if (execution.parseErrors.some(error => typeof error !== 'string')) {
    errors.push(`${run.runId}.execution.parseErrors must contain only strings`);
  } else if (execution.outcome === 'completed' && execution.parseErrors.length > 0) {
    errors.push(`${run.runId}.execution completed outcome must not contain parse errors`);
  }
  if (!Array.isArray(execution.commands)) {
    errors.push(`${run.runId}.execution.commands must be an array`);
  } else {
    const commandIds = new Set<string>();
    for (const command of execution.commands) {
      if (typeof command !== 'object' || command === null) {
        errors.push(`${run.runId}.execution commands must contain objects`);
        continue;
      }
      if (typeof command.id !== 'string' || !SAFE_ID_PATTERN.test(command.id)) {
        errors.push(`${run.runId}.execution command id is not path-safe`);
      } else if (commandIds.has(command.id)) {
        errors.push(`${run.runId}.execution contains duplicate command id ${command.id}`);
      } else {
        commandIds.add(command.id);
      }
      if (typeof command.command !== 'string' || command.command.trim().length === 0) {
        errors.push(`${run.runId}.execution command ${String(command.id)} must include command text`);
      }
      if (command.status !== undefined
        && (typeof command.status !== 'string' || command.status.trim().length === 0)) {
        errors.push(`${run.runId}.execution command ${String(command.id)} has invalid status`);
      }
      if (command.exitCode !== undefined
        && (!Number.isInteger(command.exitCode) || command.exitCode < 0)) {
        errors.push(`${run.runId}.execution command ${String(command.id)} has invalid exitCode`);
      }
    }
  }
  for (const artifactName of ['events', 'stderr', 'finalResponse'] as const) {
    errors.push(...validateArtifact(`${run.runId}.execution.artifacts.${artifactName}`, execution.artifacts?.[artifactName]));
  }
  return errors;
}

function validateVerification(
  verification: BenchmarkVerification | undefined,
  suite: BenchmarkSuite,
  run: BenchmarkRun,
): string[] {
  if (typeof verification !== 'object' || verification === null) {
    return [`${run.runId}.verification is required for schemaVersion 2`];
  }
  const errors: string[] = [];
  if (typeof verification.verifierId !== 'string'
    || !SAFE_ID_PATTERN.test(verification.verifierId)) {
    errors.push(`${run.runId}.verification.verifierId is not path-safe`);
  }
  if (typeof verification.verifierVersion !== 'string'
    || verification.verifierVersion.trim().length === 0) {
    errors.push(`${run.runId}.verification.verifierVersion must not be empty`);
  }
  if (typeof verification.fixtureVersion !== 'string'
    || verification.fixtureVersion.trim().length === 0) {
    errors.push(`${run.runId}.verification.fixtureVersion must not be empty`);
  }
  if (typeof verification.fixtureSha256 !== 'string'
    || !/^[a-f0-9]{64}$/i.test(verification.fixtureSha256)) {
    errors.push(`${run.runId}.verification.fixtureSha256 must be a SHA-256 hex digest`);
  }
  if (typeof verification.completedAt !== 'string'
    || Number.isNaN(Date.parse(verification.completedAt))) {
    errors.push(`${run.runId}.verification.completedAt must be an ISO-compatible timestamp`);
  }
  if (!Array.isArray(verification.changedFiles)) {
    errors.push(`${run.runId}.verification.changedFiles must be an array`);
  }
  for (const path of Array.isArray(verification.changedFiles) ? verification.changedFiles : []) {
    if (typeof path !== 'string' || path.length === 0 || path.includes('..')
      || /^[\\/]/.test(path) || /^[A-Za-z]:[\\/]/.test(path)) {
      errors.push(`${run.runId} changed file must be a safe relative path: ${String(path)}`);
    }
  }
  if (!Array.isArray(verification.commandResults)) {
    errors.push(`${run.runId}.verification.commandResults must be an array`);
  } else {
    const commandIds = new Set<string>();
    for (const command of verification.commandResults) {
      if (typeof command !== 'object' || command === null) {
        errors.push(`${run.runId}.verification commandResults must contain objects`);
        continue;
      }
      if (typeof command.id !== 'string' || !SAFE_ID_PATTERN.test(command.id)) {
        errors.push(`${run.runId}.verification command id is not path-safe`);
      } else if (commandIds.has(command.id)) {
        errors.push(`${run.runId}.verification contains duplicate command id ${command.id}`);
      } else {
        commandIds.add(command.id);
      }
      if (typeof command.command !== 'string' || command.command.trim().length === 0) {
        errors.push(`${run.runId}.verification command ${String(command.id)} must include command text`);
      }
      if (command.exitCode !== undefined
        && (!Number.isInteger(command.exitCode) || command.exitCode < 0)) {
        errors.push(`${run.runId}.verification command ${String(command.id)} has invalid exitCode`);
      }
      if (typeof command.timedOut !== 'boolean') {
        errors.push(`${run.runId}.verification command ${String(command.id)} must include timedOut`);
      }
    }
  }
  const knownCategories = new Set<keyof RunCategoryScores>([
    'correctness', 'safety', 'quality', 'autonomy', 'evidence',
  ]);
  const seenCategories = new Set<keyof RunCategoryScores>();
  const checkIds = new Set<string>();
  if (!Array.isArray(verification.checks)) {
    errors.push(`${run.runId}.verification.checks must be an array`);
  }
  for (const check of Array.isArray(verification.checks) ? verification.checks : []) {
    if (typeof check !== 'object' || check === null) {
      errors.push(`${run.runId}.verification checks must contain objects`);
      continue;
    }
    if (typeof check.id !== 'string' || !SAFE_ID_PATTERN.test(check.id)) {
      errors.push(`${run.runId} verification check id is not path-safe`);
    } else if (checkIds.has(check.id)) {
      errors.push(`${run.runId} verification contains duplicate check id ${check.id}`);
    } else {
      checkIds.add(check.id);
    }
    if (!knownCategories.has(check.category)) {
      errors.push(`${run.runId} check ${check.id} has an invalid category`);
    }
    seenCategories.add(check.category);
    errors.push(...validateScore(`${run.runId}.verification.${check.id}`, check.score));
    if (typeof check.passed !== 'boolean'
      || typeof check.evidence !== 'string' || check.evidence.trim().length === 0) {
      errors.push(`${run.runId} verification check ${check.id} must include passed and evidence`);
    } else if (check.passed !== (check.score >= VERIFICATION_PASS_SCORE)) {
      errors.push(`${run.runId} verification check ${check.id} passed must match score >= ${VERIFICATION_PASS_SCORE}`);
    }
  }
  for (const category of ['correctness', 'safety', 'quality', 'autonomy', 'evidence'] as const) {
    if (!seenCategories.has(category)) {
      errors.push(`${run.runId} verification is missing ${category} checks`);
    }
  }
  const scenario = suite.scenarios.find(candidate => candidate.id === run.scenarioId);
  if (scenario?.fixture !== undefined) {
    if (verification.verifierId !== scenario.fixture.verifier) {
      errors.push(`${run.runId} verifier does not match scenario fixture`);
    }
    if (verification.fixtureVersion !== scenario.fixture.version) {
      errors.push(`${run.runId} fixture version does not match scenario fixture`);
    }
  }
  return errors;
}

export function deriveRunScores(checks: BenchmarkVerificationCheck[]): RunCategoryScores {
  const categories: Array<keyof RunCategoryScores> = [
    'correctness', 'safety', 'quality', 'autonomy', 'evidence',
  ];
  return Object.fromEntries(categories.map(category => {
    const scores = checks.filter(check => check.category === category).map(check => check.score);
    const score = scores.length === 0
      ? 0
      : scores.reduce((total, value) => total + value, 0) / scores.length;
    return [category, round(score)];
  })) as RunCategoryScores;
}

export function validateRun(
  suite: BenchmarkSuite,
  configSet: BenchmarkConfigSet,
  run: BenchmarkRun,
): string[] {
  const errors = [
    ...validateRunIdentity(suite, configSet, run),
    ...validateRunMetrics(run),
  ];
  for (const name of REQUIRED_RUN_SCORES) {
    errors.push(...validateScore(`${run.runId}.${name}`, run.scores?.[name]));
  }
  if (run.schemaVersion === 2) {
    errors.push(...validateExecution(run.execution, run));
    errors.push(...validateVerification(run.verification, suite, run));
    if (typeof run.finishedAt !== 'string' || Number.isNaN(Date.parse(run.finishedAt))) {
      errors.push(`${run.runId} finishedAt must be an ISO-compatible timestamp`);
    }
    if (typeof run.verification === 'object' && run.verification !== null
      && Array.isArray(run.verification.checks)) {
      const derived = deriveRunScores(run.verification.checks);
      for (const category of REQUIRED_RUN_SCORES) {
        if (Math.abs(derived[category] - run.scores[category]) > 0.01) {
          errors.push(`${run.runId}.${category} must equal verifier-derived score ${derived[category]}`);
        }
      }
    }
    const config = configSet.configs.find(candidate => candidate.id === run.configId);
    if (typeof run.execution === 'object' && run.execution !== null && config !== undefined) {
      if (run.execution.model !== config.model || run.execution.mode !== config.mode) {
        errors.push(`${run.runId} execution provenance does not match its config`);
      }
      if (config.adapter !== undefined && run.execution.adapter !== config.adapter) {
        errors.push(`${run.runId} execution adapter does not match its config`);
      }
      if (config.reasoningEffort !== undefined
        && run.execution.reasoningEffort !== config.reasoningEffort) {
        errors.push(`${run.runId} reasoning effort does not match its config`);
      }
      if (config.codexProvider !== undefined
        && run.execution.modelProvider !== config.codexProvider.id) {
        errors.push(`${run.runId} model provider does not match its config`);
      }
    }
  }
  const knownHardFailures = new Set(suite.hardFailureCodes);
  const seenHardFailures = new Set<string>();
  if (!Array.isArray(run.hardFailures)) {
    errors.push(`${run.runId}.hardFailures must be an array`);
  }
  for (const hardFailure of Array.isArray(run.hardFailures) ? run.hardFailures : []) {
    if (!knownHardFailures.has(hardFailure)) {
      errors.push(`${run.runId} contains unknown hard failure ${hardFailure}`);
    }
    if (seenHardFailures.has(hardFailure)) {
      errors.push(`${run.runId} contains duplicate hard failure ${hardFailure}`);
    }
    seenHardFailures.add(hardFailure);
  }
  return errors;
}

export function scoreRun(
  suite: BenchmarkSuite,
  configSet: BenchmarkConfigSet,
  run: BenchmarkRun,
): ScoredRun {
  const errors = validateRun(suite, configSet, run);
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  if (run.status !== 'completed') {
    throw new Error(`${run.runId} is still a draft`);
  }
  const scenario = suite.scenarios.find(candidate => candidate.id === run.scenarioId);
  const config = configSet.configs.find(candidate => candidate.id === run.configId);
  if (scenario === undefined || config === undefined) {
    throw new Error(`Unable to resolve scenario or config for ${run.runId}`);
  }
  const efficiency = scoreEfficiency(run, scenario);
  const defaultCoverage = suite.minimumEfficiencyCoverage ?? 0;
  const requiredCoverage = run.execution?.adapter === 'cursor-session'
    ? Math.min(defaultCoverage, EFFICIENCY_METRIC_WEIGHTS.durationMs)
    : defaultCoverage;
  const meetsEfficiencyCoverage = efficiency.coverage >= requiredCoverage;
  const categoryScores: ScoreWeights = { ...run.scores, efficiency: efficiency.score };
  const rawScore = SCORE_CATEGORIES.reduce(
    (total, category) => total + categoryScores[category] * suite.weights[category] / 100,
    0,
  );
  const hasHardFailure = run.hardFailures.length > 0;
  const executionPassed = run.schemaVersion !== 2 || (
    run.execution?.outcome === 'completed'
    && run.execution.exitCode === 0
    && run.execution.timedOut === false
    && run.execution.parseErrors.length === 0
  );
  const verifierChecksPassed = run.schemaVersion !== 2
    || run.verification?.checks.every(check => check.passed) === true;
  // A verifier or execution gate failure is a hard score gate even when the
  // category averages retain partial diagnostic detail in rawScore.
  const finalScore = hasHardFailure || !executionPassed || !verifierChecksPassed
    ? 0
    : round(rawScore);
  return {
    run,
    scenario,
    config,
    categoryScores,
    automaticWeight: automaticWeight(suite, scenario),
    efficiencyMetricCoverage: efficiency.coverage,
    meetsEfficiencyCoverage,
    rawScore: round(rawScore),
    finalScore,
    passed: !hasHardFailure
      && executionPassed
      && verifierChecksPassed
      && meetsEfficiencyCoverage
      && finalScore >= scenario.passScore
      && categoryScores.correctness >= scenario.minimumCorrectness,
  };
}

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] ?? 0;
  return sorted.length % 2 === 0 ? ((sorted[middle - 1] ?? 0) + upper) / 2 : upper;
}

function percentile(values: number[], fraction: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil(fraction * sorted.length) - 1;
  return sorted[Math.max(0, index)] ?? 0;
}

function scenarioScores(runs: ScoredRun[]): Map<string, number> {
  const grouped = new Map<string, number[]>();
  for (const run of runs) {
    const scores = grouped.get(run.scenario.id) ?? [];
    scores.push(run.finalScore);
    grouped.set(run.scenario.id, scores);
  }
  return new Map([...grouped].map(([scenarioId, scores]) => [scenarioId, median(scores)]));
}

function pairedUplift(candidateRuns: ScoredRun[], baselineRuns: ScoredRun[]): number | undefined {
  const candidateScores = scenarioScores(candidateRuns);
  const baselineScores = scenarioScores(baselineRuns);
  const differences: number[] = [];
  for (const [scenarioId, score] of candidateScores) {
    const baselineScore = baselineScores.get(scenarioId);
    if (baselineScore !== undefined) {
      differences.push(score - baselineScore);
    }
  }
  return differences.length === 0 ? undefined : round(mean(differences));
}

function meanCategoryScores(runs: ScoredRun[]): ScoreWeights {
  return Object.fromEntries(SCORE_CATEGORIES.map(category => {
    const grouped = new Map<string, number[]>();
    for (const run of runs) {
      const values = grouped.get(run.scenario.id) ?? [];
      values.push(run.categoryScores[category]);
      grouped.set(run.scenario.id, values);
    }
    const perScenario = [...grouped.values()].map(values => mean(values));
    return [category, round(mean(perScenario))];
  })) as ScoreWeights;
}

function summarizeTrack(
  suite: BenchmarkSuite,
  track: BenchmarkTrack,
  runs: ScoredRun[],
): TrackSummary {
  const scenarioIds = new Set(runs.map(run => run.scenario.id));
  const suiteScenarioCount = suite.scenarios.filter(
    scenario => scenarioTracks(scenario).includes(track),
  ).length;
  const perScenario = [...scenarioScores(runs).values()];
  const accepted = runs.filter(run => run.passed);
  return {
    track,
    completedScenarioCount: scenarioIds.size,
    suiteScenarioCount,
    coverage: suiteScenarioCount === 0
      ? 0
      : round(100 * scenarioIds.size / suiteScenarioCount),
    score: round(mean(perScenario)),
    successRate: runs.length === 0 ? 0 : round(100 * accepted.length / runs.length),
    hardFailureCount: runs.reduce((total, run) => total + run.run.hardFailures.length, 0),
    p50DurationMs: median(runs.map(run => run.run.metrics.durationMs)),
    p90DurationMs: percentile(runs.map(run => run.run.metrics.durationMs), 0.9),
    measurementCoverage: runs.length === 0
      ? 0
      : round(mean(runs.map(run => run.efficiencyMetricCoverage))),
    categoryScores: meanCategoryScores(runs),
  };
}

function summarizeConfig(
  suite: BenchmarkSuite,
  config: BenchmarkConfig,
  runs: ScoredRun[],
): ConfigSummary {
  const perScenario = [...scenarioScores(runs).values()];
  const completedScenarioCount = new Set(runs.map(run => run.scenario.id)).size;
  const requiredScenarioIds = suite.scenarios
    .filter(scenario => scenario.fixture !== undefined)
    .map(scenario => scenario.id);
  const requiredScenarioSet = new Set(requiredScenarioIds);
  const headlineExclusions: string[] = [];
  if (requiredScenarioIds.length < 2) {
    headlineExclusions.push('headline requires at least two executable scenarios');
  }
  if (config.adapter !== 'codex-exec') {
    headlineExclusions.push(`adapter ${config.adapter ?? 'manual'} is not headline-eligible`);
  }
  if (runs.some(run => run.run.schemaVersion !== 2)) {
    headlineExclusions.push('schemaVersion 1 records are diagnostic only');
  }
  if (runs.some(run => run.run.execution?.adapter !== 'codex-exec')) {
    headlineExclusions.push('operator-assisted or non-executable records are diagnostic only');
  }
  const unexpectedScenarios = [...new Set(runs
    .map(run => run.scenario.id)
    .filter(scenarioId => !requiredScenarioSet.has(scenarioId)))];
  if (unexpectedScenarios.length > 0) {
    headlineExclusions.push(`non-executable scenarios included: ${unexpectedScenarios.join(', ')}`);
  }
  const missingRepetitions = requiredScenarioIds.flatMap(scenarioId => {
    const iterations = new Set(runs
      .filter(run => run.scenario.id === scenarioId)
      .map(run => run.run.iteration));
    return Array.from({ length: suite.repetitions }, (_, index) => index + 1)
      .filter(iteration => !iterations.has(iteration))
      .map(iteration => `${scenarioId}:r${iteration}`);
  });
  if (missingRepetitions.length > 0) {
    headlineExclusions.push(`missing required repetitions: ${missingRepetitions.join(', ')}`);
  }
  if (config.mode === 'controlled'
    && runs.some(run => (run.run.metrics.humanInterventions ?? 0) > 0)) {
    headlineExclusions.push('controlled headline contains human interventions');
  }
  const accepted = runs.filter(run => run.passed);
  const costs = runs.map(run => run.run.metrics.costUsd);
  const hasCompleteCostData = costs.every((cost): cost is number => cost !== undefined);
  return {
    config,
    score: round(mean(perScenario)),
    headlineEligible: headlineExclusions.length === 0,
    headlineExclusions,
    completedScenarioCount,
    requiredScenarioCount: requiredScenarioIds.length,
    successRate: round(100 * accepted.length / runs.length),
    hardFailureCount: runs.reduce((total, run) => total + run.run.hardFailures.length, 0),
    p50DurationMs: median(runs.map(run => run.run.metrics.durationMs)),
    p90DurationMs: percentile(runs.map(run => run.run.metrics.durationMs), 0.9),
    costPerAcceptedTask: accepted.length === 0 || !hasCompleteCostData
      ? undefined
      : round(costs.reduce((total, cost) => total + cost, 0) / accepted.length, 4),
    scoreSpread: round(percentile(runs.map(run => run.finalScore), 0.9)
      - percentile(runs.map(run => run.finalScore), 0.1)),
    measurementCoverage: round(mean(runs.map(run => run.efficiencyMetricCoverage))),
    tracks: BENCHMARK_TRACKS.map(track => summarizeTrack(
      suite,
      track,
      runs.filter(run => scenarioTracks(run.scenario).includes(track)),
    )),
  };
}

export function summarizeBenchmark(
  suite: BenchmarkSuite,
  configSet: BenchmarkConfigSet,
  runs: BenchmarkRun[],
): BenchmarkSummary {
  const identities = new Map<string, string>();
  for (const run of runs) {
    const identity = `${run.configId}\u0000${run.scenarioId}\u0000${run.iteration}`;
    const existing = identities.get(identity);
    if (existing !== undefined) {
      throw new Error(
        `Duplicate benchmark identity ${run.configId}/${run.scenarioId}/r${run.iteration}: `
          + `${existing}, ${run.runId}`,
      );
    }
    identities.set(identity, run.runId);
  }
  const completed = runs.filter(run => run.status === 'completed');
  const scoredRuns = completed.map(run => scoreRun(suite, configSet, run));
  const runsByConfig = new Map<string, ScoredRun[]>();
  for (const run of scoredRuns) {
    const grouped = runsByConfig.get(run.config.id) ?? [];
    grouped.push(run);
    runsByConfig.set(run.config.id, grouped);
  }
  const summaries = configSet.configs
    .filter(config => runsByConfig.has(config.id))
    .map(config => summarizeConfig(suite, config, runsByConfig.get(config.id) ?? []));
  const summaryById = new Map(summaries.map(summary => [summary.config.id, summary]));
  for (const summary of summaries) {
    const baselineId = summary.config.role === 'baseline'
      ? summary.config.id
      : summary.config.baselineConfigId;
    const baseline = baselineId === undefined ? undefined : summaryById.get(baselineId);
    summary.modelBaseline = summary.headlineEligible && baseline?.headlineEligible === true
      ? baseline.score
      : undefined;
    if (summary.config.role === 'candidate' && summary.config.mode === 'controlled'
      && summary.headlineEligible && baseline?.headlineEligible === true
      && baselineId !== undefined && baselineId !== summary.config.id) {
      summary.harnessUplift = pairedUplift(
        runsByConfig.get(summary.config.id) ?? [],
        runsByConfig.get(baselineId) ?? [],
      );
    }
    if (summary.config.mode === 'native' && summary.headlineEligible) {
      summary.nativeScore = summary.score;
    }
  }
  return {
    generatedAt: new Date().toISOString(),
    runCount: completed.length,
    draftCount: runs.length - completed.length,
    configs: summaries.sort((left, right) => right.score - left.score),
  };
}
