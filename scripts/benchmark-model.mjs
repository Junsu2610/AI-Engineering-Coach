#!/usr/bin/env node
/**
 * Resolve `/benchmark <harness> <modelEffort>` into a saved model registry entry,
 * a dedicated configs JSON file, and runnable instructions for the selected harness.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MODELS_PATH = join(ROOT, 'benchmarks', 'models.json');
const EFFORT_SUFFIXES = ['xhigh', 'ultra', 'medium', 'high', 'low', 'max'];
const DEFAULT_EFFORT = 'high';
const CODEX_HARNESSES = new Set(['codex', 'codex-cli']);
const CURSOR_HARNESSES = new Set(['cursor']);
const CODEX_EXECUTABLE_HARNESS = 'codex-cli';
const CODEX_ADAPTER = 'codex-exec';
const CURSOR_ADAPTER = 'cursor-session';
const CURSOR_EXECUTABLE_HARNESS = 'cursor';
const PILOT_SCENARIOS = [
  'U01-root-cause-no-edit',
  'F01-surgical-boundary-fix',
  'S01-dirty-worktree',
];

function usage() {
  console.error('Usage: node scripts/benchmark-model.mjs <harness> <modelEffort>');
  console.error('Example: node scripts/benchmark-model.mjs cursor grok4.5high');
  process.exitCode = 1;
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeModelId(value) {
  if (value.length === 0) {
    throw new Error('model token is empty after removing effort suffix');
  }
  return value
    .replace(/([a-z])(\d)/gi, '$1-$2')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseModelEffort(token) {
  const lower = token.trim().toLowerCase();
  let effort = DEFAULT_EFFORT;
  let modelPart = lower;

  for (const suffix of EFFORT_SUFFIXES) {
    if (lower.endsWith(`-${suffix}`)) {
      effort = suffix;
      modelPart = lower.slice(0, -(suffix.length + 1));
      break;
    }
    if (lower.endsWith(suffix) && lower.length > suffix.length) {
      effort = suffix;
      modelPart = lower.slice(0, -suffix.length);
      break;
    }
  }

  return {
    model: normalizeModelId(modelPart),
    effort,
    modelEffort: token.trim(),
  };
}

function parseArgs(argv) {
  const tokens = argv.map(part => part.trim()).filter(part => part.length > 0);
  if (tokens.length < 2) {
    return undefined;
  }

  const harness = slugify(tokens[0]);
  const modelEffortToken = tokens.length === 2
    ? tokens[1]
    : tokens.slice(1).join('');
  const { model, effort, modelEffort } = parseModelEffort(modelEffortToken);
  const alias = `${tokens[0]} ${modelEffort}`;

  return { harness, model, effort, modelEffort, alias };
}

function readRegistry() {
  if (!existsSync(MODELS_PATH)) {
    throw new Error(`Missing model registry: ${MODELS_PATH}`);
  }
  return JSON.parse(readFileSync(MODELS_PATH, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, undefined, 2)}\n`, 'utf8');
}

function resolveExecutionMode(harness) {
  if (CODEX_HARNESSES.has(harness)) {
    return CODEX_ADAPTER;
  }
  if (CURSOR_HARNESSES.has(harness)) {
    return CURSOR_ADAPTER;
  }
  throw new Error(
    `Unknown harness "${harness}". Supported harnesses: codex, codex-cli, cursor.`,
  );
}

function buildConfig(parsed, executionMode, registry) {
  const slug = slugify(`${parsed.harness}-${parsed.model}-${parsed.effort}`);
  const configId = `${parsed.harness}-${parsed.model}-controlled-${parsed.effort}`;
  const configsRel = `benchmarks/configs.${slug}.json`;
  const resultsRel = `benchmarks/results/${slug}-full-3x`;

  if (executionMode === CODEX_ADAPTER) {
    return {
      slug,
      configId,
      configsRel,
      resultsRel,
      configSet: {
        schemaVersion: 1,
        configs: [{
          id: configId,
          harness: parsed.harness,
          model: parsed.model,
          reasoningEffort: parsed.effort,
          adapter: CODEX_ADAPTER,
          codexProvider: registry.provider,
          mode: 'controlled',
          role: 'candidate',
          notes: `Auto-generated controlled config for ${parsed.alias}. Executable runs use ${CODEX_ADAPTER} via 9Router.`,
        }],
      },
      entry: {
        alias: parsed.alias,
        harness: parsed.harness,
        modelEffort: parsed.modelEffort,
        model: parsed.model,
        reasoningEffort: parsed.effort,
        configId,
        adapter: CODEX_ADAPTER,
        executionMode: CODEX_ADAPTER,
        executableHarness: CODEX_EXECUTABLE_HARNESS,
        mode: 'controlled',
        role: 'candidate',
        configsPath: configsRel.replaceAll('\\', '/'),
        notes: 'Upserted by scripts/benchmark-model.mjs for /benchmark codex runs.',
      },
    };
  }

  return {
    slug,
    configId,
    configsRel,
    resultsRel,
    configSet: {
      schemaVersion: 1,
      configs: [{
        id: configId,
        harness: parsed.harness,
        model: parsed.model,
        reasoningEffort: parsed.effort,
        adapter: CURSOR_ADAPTER,
        mode: 'controlled',
        role: 'candidate',
        notes: `Auto-generated controlled config for ${parsed.alias}. Runs execute in the current Cursor agent session (harness=${parsed.harness}, model=${parsed.model}, effort=${parsed.effort}). No 9Router or Codex CLI.`,
      }],
    },
    entry: {
      alias: parsed.alias,
      harness: parsed.harness,
      modelEffort: parsed.modelEffort,
      model: parsed.model,
      reasoningEffort: parsed.effort,
      configId,
      adapter: CURSOR_ADAPTER,
      executionMode: CURSOR_ADAPTER,
      executableHarness: CURSOR_EXECUTABLE_HARNESS,
      mode: 'controlled',
      role: 'candidate',
      configsPath: configsRel.replaceAll('\\', '/'),
      notes: 'Upserted by scripts/benchmark-model.mjs for /benchmark cursor-session runs.',
    },
  };
}

function buildCodexCommand(configsRel, configId, resultsRel) {
  return [
    'npm run benchmark:agents -- full',
    `--configs ${configsRel.replaceAll('\\', '/')}`,
    `--config ${configId}`,
    '--track all',
    '--iterations 3',
    `--results ${resultsRel.replaceAll('\\', '/')}`,
  ].join(' `\n  ');
}

function buildCursorSessionLoop(configsRel, configId, resultsRel) {
  const configsFlag = `--configs ${configsRel.replaceAll('\\', '/')}`;
  const configFlag = `--config ${configId}`;
  const resultsFlag = `--results ${resultsRel.replaceAll('\\', '/')}`;
  const lines = [
    'Cursor-session benchmark loop (no 9Router, no OPENAI_API_KEY):',
    '',
    'For each scenario iteration (pilot first, then full track as needed):',
    `  1. npm run benchmark:agents -- prepare ${configsFlag} ${configFlag} --scenario <ID> --iteration <N> ${resultsFlag}`,
    '  2. Complete the printed prompt inside the prepared workspace in this Cursor session.',
    `  3. npm run benchmark:agents -- verify ${configsFlag} ${configFlag} --scenario <ID> --iteration <N> ${resultsFlag} --final-message "<handoff>"`,
    '',
    'Pilot scenarios:',
    ...PILOT_SCENARIOS.map(id => `  - ${id}`),
    '',
    'After all scenarios are verified, aggregate the report:',
    `  npm run benchmark:agents -- full ${configsFlag} ${configFlag} --track all --iterations 3 ${resultsFlag}`,
  ];
  return lines.join('\n');
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed === undefined) {
    usage();
    return;
  }

  const registry = readRegistry();
  if (registry.schemaVersion !== 1 || registry.provider === undefined) {
    throw new Error('benchmarks/models.json must use schemaVersion 1 with a provider block');
  }

  const executionMode = resolveExecutionMode(parsed.harness);
  const built = buildConfig(parsed, executionMode, registry);
  const configsPath = join(ROOT, built.configsRel);
  const now = new Date().toISOString();
  writeJson(configsPath, built.configSet);

  const entry = { ...built.entry, updatedAt: now };
  const models = Array.isArray(registry.models) ? [...registry.models] : [];
  const index = models.findIndex(candidate => (
    candidate.configId === built.configId
    || (
      candidate.harness === parsed.harness
      && candidate.model === parsed.model
      && candidate.reasoningEffort === parsed.effort
    )
  ));
  if (index === -1) {
    models.push(entry);
  } else {
    models[index] = { ...models[index], ...entry };
  }
  writeJson(MODELS_PATH, { ...registry, models });

  const output = {
    alias: parsed.alias,
    harness: parsed.harness,
    modelEffort: parsed.modelEffort,
    model: parsed.model,
    reasoningEffort: parsed.effort,
    configId: built.configId,
    configsPath: built.configsRel.replaceAll('\\', '/'),
    modelsPath: 'benchmarks/models.json',
    resultsRoot: built.resultsRel.replaceAll('\\', '/'),
    executionMode,
    executableHarness: built.entry.executableHarness,
    executableAdapter: built.entry.adapter,
    preflight: executionMode === CODEX_ADAPTER
      ? ['OPENAI_API_KEY must be set', '127.0.0.1:9011 must be reachable']
      : [],
    pilotScenarios: PILOT_SCENARIOS,
  };

  if (executionMode === CODEX_ADAPTER) {
    output.command = buildCodexCommand(built.configsRel, built.configId, built.resultsRel);
  } else {
    output.cursorSessionLoop = buildCursorSessionLoop(
      built.configsRel,
      built.configId,
      built.resultsRel,
    );
  }

  console.log(JSON.stringify(output, undefined, 2));
  console.log('');
  if (executionMode === CODEX_ADAPTER) {
    console.log('Preflight: require OPENAI_API_KEY and confirm 127.0.0.1:9011 is open.');
    console.log('Run:');
    console.log(output.command);
  } else {
    console.log(output.cursorSessionLoop);
  }
}

main();
