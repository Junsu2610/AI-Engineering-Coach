/**
 * Multi-Harness Context & Memory Synchronizer
 * Ensures AGENTS.md (Single Source of Truth) and docs/CURRENT_TASK.md (Dynamic Memory)
 * are properly linked and referenced across all harnesses:
 * - Antigravity / Gemini: GEMINI.md
 * - Cursor: .cursor/rules/agents.mdc
 * - Codex: .codex/instructions.md
 * - Claude Code: CLAUDE.md
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const AGENTS_PATH = join(ROOT, 'AGENTS.md');
const CURRENT_TASK_PATH = join(ROOT, 'docs', 'CURRENT_TASK.md');

console.log('🔄 Checking Unified Multi-Harness Sync Status...\n');

if (!existsSync(AGENTS_PATH)) {
  console.error('❌ AGENTS.md missing in repository root!');
  process.exit(1);
}

if (!existsSync(CURRENT_TASK_PATH)) {
  console.warn('⚠️ docs/CURRENT_TASK.md missing. Creating a default scratchpad...');
  mkdirSync(join(ROOT, 'docs'), { recursive: true });
  writeFileSync(
    CURRENT_TASK_PATH,
    `# CURRENT TASK & ACTIVE MEMORY\n\n- **Status**: Idle\n- **Next Steps**: Define task.\n`,
    'utf8'
  );
}

const HARNESS_TARGETS = [
  {
    name: 'Antigravity / Gemini',
    file: join(ROOT, 'GEMINI.md'),
    template: `# Antigravity & Gemini Context\n\nAlways strictly read and follow the master project rules and architecture in:\n1. \`AGENTS.md\` - Single Source of Truth for rules, boundaries, and test commands.\n2. \`docs/CURRENT_TASK.md\` - Dynamic shared memory & current session progress.\n\n## Key Antigravity Instructions\n- Output language to user: Vietnamese (full diacritics).\n- Code, diffs, comments, tests: English.\n- Keep extension host responsive; offload heavy parsing to \`src/core/*-worker.ts\`.\n- Run \`npm test\` after modifying code in \`src/\`.\n- Before concluding any session, update \`docs/CURRENT_TASK.md\` with current state and next steps.\n`
  },
  {
    name: 'Cursor',
    file: join(ROOT, '.cursor', 'rules', 'agents.mdc'),
    template: `---\ndescription: AI Engineering Coach Unified Harness Rules\nglobs: *\nalwaysApply: true\n---\n# Unified Project Context\n\nAlways refer to:\n1. \`AGENTS.md\` - Master specification, boundaries, skills, and verification commands.\n2. \`docs/CURRENT_TASK.md\` - Active task, decisions log, and next steps.\n\n# Core Guardrails\n- Language: Vietnamese to user, English in code and commit messages.\n- TypeScript strict mode, zero telemetry, read-only user session logs.\n- Offload heavy compute to \`src/core/*-worker.ts\`.\n- Run \`npm test\` after modifying code. Update \`docs/CURRENT_TASK.md\` when completing a subtask.\n`
  },
  {
    name: 'Codex',
    file: join(ROOT, '.codex', 'instructions.md'),
    template: `# Codex Harness Instructions\n\nStrictly follow the project architecture and boundaries defined in:\n1. \`AGENTS.md\` - Primary single source of truth.\n2. \`docs/CURRENT_TASK.md\` - Shared dynamic memory state and next actions.\n\n## Rules\n- Do not hallucinate file paths or external dependencies.\n- Stick to the target files specified in \`docs/CURRENT_TASK.md\`.\n- Run \`npm test\` after code changes to verify correctness.\n- Update \`docs/CURRENT_TASK.md\` before finishing your task.\n`
  },
  {
    name: 'Claude Code',
    file: join(ROOT, 'CLAUDE.md'),
    template: `# Claude Code Instructions\n\nAlways refer to and follow:\n1. \`AGENTS.md\` - Master specification, boundaries, skills, and verification commands.\n2. \`docs/CURRENT_TASK.md\` - Active task, decisions log, and next steps.\n\n## Verification\n- Fast test: \`npm test\`\n- Full check: \`npm run check\`\n- Update \`docs/CURRENT_TASK.md\` after completing each work item.\n`
  }
];

let syncedCount = 0;

for (const target of HARNESS_TARGETS) {
  const dir = join(target.file, '..');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(target.file, target.template, 'utf8');
  console.log(`✅ [${target.name}] -> Synchronized to ${target.file.replace(ROOT + '\\', '')}`);
  syncedCount++;
}

console.log(`\n🎉 Successfully synchronized ${syncedCount} harness endpoints to AGENTS.md & docs/CURRENT_TASK.md!`);
