#!/usr/bin/env node
/**
 * Resolve `/benchmark <harness> <modelEffort> [controlled|native]` into a saved model registry entry,
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
const CLAUDE_HARNESSES = new Set(['claudeext']);
const ANTIGRAVITY_HARNESSES = new Set(['anti', 'antigravity', 'agy']);
const CODEX_EXECUTABLE_HARNESS = 'codex-cli';
const CODEX_ADAPTER = 'codex-exec';
const CODEX_NATIVE_ADAPTER = 'codex-native-exec';
const CURSOR_ADAPTER = 'cursor-session';
const CLAUDE_ADAPTER = 'claude-session';
const ANTIGRAVITY_ADAPTER = 'antigravity-session';
const CURSOR_EXECUTABLE_HARNESS = 'cursor';
const CLAUDE_EXECUTABLE_HARNESS = 'claudeext';
const ANTIGRAVITY_EXECUTABLE_HARNESS = 'antigravity';
const PILOT_SCENARIOS = [
  'U01-root-cause-no-edit',
  'F01-surgical-boundary-fix',
  'S01-dirty-worktree',
];

function usage() {
  console.error('Usage: node scripts/benchmark-model.mjs <harness> <modelEffort> [controlled|native]');
  console.error('Example: node scripts/benchmark-model.mjs codex gpt5.6solhigh native');
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
    .replace(/(\d)([a-z])/gi, '$1-$2')
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
  const requestedMode = tokens.length > 2 && ['controlled', 'native'].includes(tokens.at(-1).toLowerCase())
    ? tokens.at(-1).toLowerCase()
    : 'controlled';
  const modelTokens = requestedMode === 'controlled' && tokens.at(-1).toLowerCase() !== 'controlled'
    ? tokens.slice(1)
    : tokens.slice(1, -1);
  const modelEffortToken = modelTokens.join('');
  const { model, effort, modelEffort } = parseModelEffort(modelEffortToken);
  const alias = `${tokens[0]} ${modelEffort}${requestedMode === 'native' ? ' native' : ''}`;

  return { harness, model, effort, modelEffort, alias, mode: requestedMode };
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

function resolveExecutionMode(harness, mode) {
  if (CODEX_HARNESSES.has(harness)) {
    return mode === 'native' ? CODEX_NATIVE_ADAPTER : CODEX_ADAPTER;
  }
  if (mode === 'native') {
    throw new Error(`Native mode is not executable for harness "${harness}"`);
  }
  if (CURSOR_HARNESSES.has(harness)) {
    return CURSOR_ADAPTER;
  }
  if (CLAUDE_HARNESSES.has(harness)) {
    return CLAUDE_ADAPTER;
  }
  if (ANTIGRAVITY_HARNESSES.has(harness)) {
    return ANTIGRAVITY_ADAPTER;
  }
  throw new Error(
    `Unknown harness "${harness}". Supported harnesses: codex, codex-cli, cursor, claudeext, antigravity (anti, agy).`,
  );
}

function buildConfig(parsed, executionMode, registry) {
  const slug = slugify(`${parsed.harness}-${parsed.model}-${parsed.effort}${parsed.mode === 'native' ? '-native' : ''}`);
  const configId = `${parsed.harness}-${parsed.model}-${parsed.mode}-${parsed.effort}`;
  const configsRel = `benchmarks/configs.${slug}.json`;
  const resultsRel = `benchmarks/results/${slug}-full-1x`;

  if (executionMode === CODEX_ADAPTER || executionMode === CODEX_NATIVE_ADAPTER) {
    const native = executionMode === CODEX_NATIVE_ADAPTER;
    const config = {
      id: configId,
      harness: parsed.harness,
      model: parsed.model,
      reasoningEffort: parsed.effort,
      adapter: executionMode,
      mode: parsed.mode,
      role: native ? 'native' : 'candidate',
      notes: native
        ? `Auto-generated native config for ${parsed.alias}. Executable runs use the signed-in Codex CLI user profile without 9Router.`
        : `Auto-generated controlled config for ${parsed.alias}. Executable runs use ${CODEX_ADAPTER} via 9Router.`,
    };
    if (!native) {
      config.codexProvider = registry.provider;
    }
    return {
      slug,
      configId,
      configsRel,
      resultsRel,
      configSet: {
        schemaVersion: 1,
        configs: [config],
      },
      entry: {
        alias: parsed.alias,
        harness: parsed.harness,
        modelEffort: parsed.modelEffort,
        model: parsed.model,
        reasoningEffort: parsed.effort,
        configId,
        adapter: executionMode,
        executionMode,
        executableHarness: CODEX_EXECUTABLE_HARNESS,
        mode: parsed.mode,
        role: native ? 'native' : 'candidate',
        configsPath: configsRel.replaceAll('\\', '/'),
        notes: 'Upserted by scripts/benchmark-model.mjs for /benchmark codex runs.',
      },
    };
  }

  const session = executionMode === CURSOR_ADAPTER
    ? {
      adapter: CURSOR_ADAPTER,
      executableHarness: CURSOR_EXECUTABLE_HARNESS,
      agentName: 'Cursor',
    }
    : executionMode === CLAUDE_ADAPTER
      ? {
        adapter: CLAUDE_ADAPTER,
        executableHarness: CLAUDE_EXECUTABLE_HARNESS,
        agentName: 'Claude Code',
      }
      : {
        adapter: ANTIGRAVITY_ADAPTER,
        executableHarness: ANTIGRAVITY_EXECUTABLE_HARNESS,
        agentName: 'Antigravity',
      };

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
        adapter: session.adapter,
        mode: 'controlled',
        role: 'candidate',
        notes: `Auto-generated controlled config for ${parsed.alias}. Runs execute in the current ${session.agentName} agent session (harness=${parsed.harness}, model=${parsed.model}, effort=${parsed.effort}). No 9Router or Codex CLI. Operator-assisted records are diagnostic only.`,
      }],
    },
    entry: {
      alias: parsed.alias,
      harness: parsed.harness,
      modelEffort: parsed.modelEffort,
      model: parsed.model,
      reasoningEffort: parsed.effort,
      configId,
      adapter: session.adapter,
      executionMode: session.adapter,
      executableHarness: session.executableHarness,
      mode: 'controlled',
      role: 'candidate',
      configsPath: configsRel.replaceAll('\\', '/'),
      notes: `Upserted by scripts/benchmark-model.mjs for /benchmark ${session.adapter} runs.`,
    },
  };
}

function buildCodexCommand(configsRel, configId, resultsRel) {
  return [
    'npm run benchmark:agents -- full',
    `--configs ${configsRel.replaceAll('\\', '/')}`,
    `--config ${configId}`,
    '--track all',
    '--iterations 1',
    `--results ${resultsRel.replaceAll('\\', '/')}`,
  ].join(' `\n  ');
}

function buildAgentSessionLoop(executionMode, configsRel, configId, resultsRel) {
  const configsFlag = `--configs ${configsRel.replaceAll('\\', '/')}`;
  const configFlag = `--config ${configId}`;
  const resultsFlag = `--results ${resultsRel.replaceAll('\\', '/')}`;
  const agentName = executionMode === CURSOR_ADAPTER
    ? 'Cursor'
    : executionMode === CLAUDE_ADAPTER
      ? 'Claude Code'
      : 'Antigravity';
  const lines = [
    `${executionMode} benchmark loop (no 9Router, no OPENAI_API_KEY):`,
    '',
    'For each scenario iteration (pilot first, then full track as needed):',
    `  1. npm run benchmark:agents -- prepare ${configsFlag} ${configFlag} --scenario <ID> --iteration <N> ${resultsFlag}`,
    `  2. Complete the printed prompt inside the prepared workspace in this ${agentName} session.`,
    `  3. npm run benchmark:agents -- verify ${configsFlag} ${configFlag} --scenario <ID> --iteration <N> ${resultsFlag} --final-message "<handoff>"`,
    '',
    'Pilot scenarios:',
    ...PILOT_SCENARIOS.map(id => `  - ${id}`),
    '',
    'After all scenarios are verified, aggregate the diagnostic report:',
    `  npm run benchmark:agents -- full ${configsFlag} ${configFlag} --track all --iterations 1 ${resultsFlag}`,
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

  const executionMode = resolveExecutionMode(parsed.harness, parsed.mode);
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
      && candidate.mode === parsed.mode
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
    mode: parsed.mode,
    configId: built.configId,
    configsPath: built.configsRel.replaceAll('\\', '/'),
    modelsPath: 'benchmarks/models.json',
    resultsRoot: built.resultsRel.replaceAll('\\', '/'),
    executionMode,
    executableHarness: built.entry.executableHarness,
    executableAdapter: built.entry.adapter,
    preflight: executionMode === CODEX_ADAPTER
      ? ['OPENAI_API_KEY must be set', '127.0.0.1:9011 must be reachable']
      : executionMode === CODEX_NATIVE_ADAPTER
        ? ['Codex CLI must be available with an active native login']
        : [],
    pilotScenarios: PILOT_SCENARIOS,
  };

  if (executionMode === CODEX_ADAPTER || executionMode === CODEX_NATIVE_ADAPTER) {
    output.command = buildCodexCommand(built.configsRel, built.configId, built.resultsRel);
  } else {
    output.agentSessionLoop = buildAgentSessionLoop(
      executionMode,
      built.configsRel,
      built.configId,
      built.resultsRel,
    );
    if (executionMode === CURSOR_ADAPTER) {
      output.cursorSessionLoop = output.agentSessionLoop;
    } else if (executionMode === CLAUDE_ADAPTER) {
      output.claudeSessionLoop = output.agentSessionLoop;
    } else {
      output.antigravitySessionLoop = output.agentSessionLoop;
    }
  }

  console.log(JSON.stringify(output, undefined, 2));
  console.log('');
  if (executionMode === CODEX_ADAPTER || executionMode === CODEX_NATIVE_ADAPTER) {
    console.log(executionMode === CODEX_ADAPTER
      ? 'Preflight: require OPENAI_API_KEY and confirm 127.0.0.1:9011 is open.'
      : 'Preflight: require Codex CLI with an active native login; 9Router and OPENAI_API_KEY are not used.');
    console.log('Run:');
    console.log(output.command);
  } else {
    console.log(output.agentSessionLoop);
  }
}

main();
