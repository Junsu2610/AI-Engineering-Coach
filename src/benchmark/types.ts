/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const SCORE_CATEGORIES = [
  'correctness',
  'safety',
  'quality',
  'autonomy',
  'efficiency',
  'evidence',
] as const;

export type ScoreCategory = typeof SCORE_CATEGORIES[number];

export type ScoreWeights = Record<ScoreCategory, number>;

export interface BudgetRange {
  target: number;
  limit: number;
}

export interface EfficiencyBudget {
  durationMs: BudgetRange;
  totalTokens?: BudgetRange;
  costUsd?: BudgetRange;
  toolCalls?: BudgetRange;
}

export interface BenchmarkScenario {
  id: string;
  title: string;
  category: string;
  difficulty: 'small' | 'medium' | 'large';
  /** Tracks the operating role exercised by the scenario. */
  tracks?: BenchmarkTrack[];
  prompt: string;
  setup: string[];
  acceptance: string[];
  automaticCategories: ScoreCategory[];
  passScore: number;
  minimumCorrectness: number;
  budgets: EfficiencyBudget;
  fixture?: BenchmarkFixtureReference;
}

export interface BenchmarkFixtureReference {
  id: string;
  version: string;
  verifier: string;
}

export const BENCHMARK_TRACKS = ['manager', 'coder'] as const;
export type BenchmarkTrack = typeof BENCHMARK_TRACKS[number];

export interface BenchmarkSuite {
  schemaVersion: 1;
  name: string;
  description: string;
  repetitions: number;
  minimumAutomaticWeight: number;
  minimumEfficiencyCoverage?: number;
  weights: ScoreWeights;
  hardFailureCodes: string[];
  scenarios: BenchmarkScenario[];
}

export type BenchmarkMode = 'controlled' | 'native';
export type BenchmarkRole = 'baseline' | 'candidate' | 'native';
export type BenchmarkAdapterId = 'manual' | 'codex-exec';
export type ReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'ultra';

export interface CodexProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  envKey: string;
  wireApi: 'responses' | 'chat';
}

export interface BenchmarkConfig {
  id: string;
  harness: string;
  model: string;
  mode: BenchmarkMode;
  role: BenchmarkRole;
  baselineConfigId?: string;
  adapter?: BenchmarkAdapterId;
  reasoningEffort?: ReasoningEffort;
  codexProvider?: CodexProviderConfig;
  notes?: string;
}

export interface BenchmarkConfigSet {
  schemaVersion: 1;
  configs: BenchmarkConfig[];
}

export interface RunMetrics {
  durationMs: number;
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  reasoningOutputTokens?: number;
  costUsd?: number;
  toolCalls?: number;
  humanInterventions?: number;
}

export type RunCategoryScores = Omit<ScoreWeights, 'efficiency'>;

export interface CommandExecutionEvidence {
  id: string;
  command: string;
  status?: string;
  exitCode?: number;
}

export interface BenchmarkArtifact {
  path: string;
  sha256: string;
  bytes: number;
}

export interface BenchmarkExecution {
  adapter: BenchmarkAdapterId;
  adapterVersion?: string;
  model: string;
  modelProvider?: string;
  reasoningEffort?: ReasoningEffort;
  mode: BenchmarkMode;
  outcome: 'completed' | 'failed' | 'timed_out' | 'adapter_error';
  exitCode?: number;
  signal?: string;
  timedOut: boolean;
  platform: string;
  nodeVersion: string;
  parseErrors: string[];
  commands: CommandExecutionEvidence[];
  artifacts: {
    events: BenchmarkArtifact;
    stderr: BenchmarkArtifact;
    finalResponse: BenchmarkArtifact;
  };
}

export interface BenchmarkVerificationCheck {
  id: string;
  category: keyof RunCategoryScores;
  passed: boolean;
  score: number;
  evidence: string;
}

export interface VerificationCommandResult {
  id: string;
  command: string;
  exitCode?: number;
  timedOut: boolean;
}

export interface BenchmarkVerification {
  verifierId: string;
  verifierVersion: string;
  fixtureVersion: string;
  fixtureSha256: string;
  completedAt: string;
  changedFiles: string[];
  commandResults: VerificationCommandResult[];
  checks: BenchmarkVerificationCheck[];
}

export interface BenchmarkRun {
  schemaVersion: 1 | 2;
  status: 'draft' | 'completed';
  runId: string;
  scenarioId: string;
  configId: string;
  iteration: number;
  startedAt: string;
  finishedAt?: string;
  metrics: RunMetrics;
  scores: RunCategoryScores;
  hardFailures: string[];
  execution?: BenchmarkExecution;
  verification?: BenchmarkVerification;
  notes?: string[];
}

export interface ScoredRun {
  run: BenchmarkRun;
  scenario: BenchmarkScenario;
  config: BenchmarkConfig;
  categoryScores: ScoreWeights;
  automaticWeight: number;
  efficiencyMetricCoverage: number;
  meetsEfficiencyCoverage: boolean;
  rawScore: number;
  finalScore: number;
  passed: boolean;
}

export interface ConfigSummary {
  config: BenchmarkConfig;
  score: number;
  successRate: number;
  hardFailureCount: number;
  p50DurationMs: number;
  p90DurationMs: number;
  costPerAcceptedTask?: number;
  scoreSpread: number;
  measurementCoverage: number;
  modelBaseline?: number;
  harnessUplift?: number;
  nativeScore?: number;
  tracks: TrackSummary[];
}

export interface TrackSummary {
  track: BenchmarkTrack;
  completedScenarioCount: number;
  suiteScenarioCount: number;
  coverage: number;
  score: number;
  successRate: number;
  hardFailureCount: number;
  p50DurationMs: number;
  p90DurationMs: number;
  measurementCoverage: number;
  categoryScores: ScoreWeights;
}

export interface BenchmarkSummary {
  generatedAt: string;
  runCount: number;
  draftCount: number;
  configs: ConfigSummary[];
}
