/**
 * Harness guardrails: AGENTS.md line budget, skill pointer sync, boundary grep,
 * and AGENTS ↔ skills table sync.
 * CRLF-safe on Windows (normalizes line endings before counting).
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const AGENTS_PATH = join(ROOT, 'AGENTS.md');
const COPILOT_PATH = join(ROOT, '.github', 'copilot-instructions.md');
const SKILLS_DIR = join(ROOT, 'skills');
const POINTER_DIRS = [
  { label: '.claude/skills', path: join(ROOT, '.claude', 'skills') },
  { label: '.github/instructions', path: join(ROOT, '.github', 'instructions') },
];
const MAX_AGENTS_LINES = 40;
const BOUNDARY_FILES = [
  { label: 'AGENTS.md', path: AGENTS_PATH },
  { label: '.github/copilot-instructions.md', path: COPILOT_PATH },
];

function normalizeNewlines(content) {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** Count logical lines; trailing newline does not add an extra empty line. */
function countLines(content) {
  const normalized = normalizeNewlines(content);
  if (normalized.length === 0) {
    return 0;
  }
  const lines = normalized.split('\n');
  if (lines.at(-1) === '' && normalized.endsWith('\n')) {
    return lines.length - 1;
  }
  return lines.length;
}

function listSkillIds() {
  return readdirSync(SKILLS_DIR)
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .map((file) => file.replace(/\.md$/, ''))
    .sort();
}

function listPointerIds(dirPath) {
  return readdirSync(dirPath)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''))
    .sort();
}

function expectedPointerContent(skillId) {
  return `../../skills/${skillId}.md`;
}

let failed = false;

const agentsContent = readFileSync(AGENTS_PATH, 'utf8');
const agentsLines = countLines(agentsContent);
console.log(`AGENTS.md: ${agentsLines} lines (budget: ≤${MAX_AGENTS_LINES})`);
if (agentsLines > MAX_AGENTS_LINES) {
  console.error(`❌ AGENTS.md exceeds ${MAX_AGENTS_LINES}-line budget`);
  failed = true;
} else {
  console.log('✅ AGENTS.md within line budget');
}

const skillIds = listSkillIds();

function comparePointerSet(label, pointerIds) {
  const expected = skillIds.join(',');
  const actual = pointerIds.join(',');
  if (actual !== expected) {
    const expectedSet = new Set(skillIds);
    const actualSet = new Set(pointerIds);
    const missing = skillIds.filter((id) => !actualSet.has(id));
    const extra = pointerIds.filter((id) => !expectedSet.has(id));
    console.error(`❌ ${label}: pointer set mismatch`);
    if (missing.length > 0) {
      console.error(`   Missing: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      console.error(`   Extra: ${extra.join(', ')}`);
    }
    failed = true;
    return;
  }
  console.log(`✅ ${label}: pointer filenames match skills/`);
}

for (const { label, path: dirPath } of POINTER_DIRS) {
  const pointerIds = listPointerIds(dirPath);
  comparePointerSet(label, pointerIds);

  for (const skillId of skillIds) {
    const pointerPath = join(dirPath, `${skillId}.md`);
    const expected = expectedPointerContent(skillId);
    let actual;
    try {
      actual = normalizeNewlines(readFileSync(pointerPath, 'utf8')).trim();
    } catch {
      console.error(`❌ ${label}/${skillId}.md: missing or unreadable`);
      failed = true;
      continue;
    }
    if (actual !== expected) {
      console.error(`❌ ${label}/${skillId}.md: expected "${expected}", got "${actual}"`);
      failed = true;
    }
  }
}

if (!failed) {
  console.log('✅ All skill pointers point to ../../skills/<id>.md');
}

// Boundary grep: privacy / read-only / worker path must remain greppable.
for (const { label, path: filePath } of BOUNDARY_FILES) {
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    console.error(`❌ ${label}: missing or unreadable (required for boundary grep)`);
    failed = true;
    continue;
  }
  const lower = content.toLowerCase();
  const missing = [];
  if (!lower.includes('telemetry')) {
    missing.push('telemetry');
  }
  if (!lower.includes('read-only') && !lower.includes('session log')) {
    missing.push('read-only or session log');
  }
  if (!content.includes('*-worker.ts')) {
    missing.push('*-worker.ts');
  }
  if (missing.length > 0) {
    console.error(`❌ ${label}: missing required boundary terms: ${missing.join(', ')}`);
    failed = true;
  } else {
    console.log(`✅ ${label}: boundary terms present`);
  }
}

// Skill-table sync: every skills/*.md id must appear as a link in AGENTS.md.
const missingFromAgents = skillIds.filter((id) => !agentsContent.includes(`skills/${id}.md`));
if (missingFromAgents.length > 0) {
  console.error(`❌ AGENTS.md Skills table missing skill links: ${missingFromAgents.join(', ')}`);
  failed = true;
} else {
  console.log('✅ AGENTS.md Skills table lists every skills/*.md id');
}

process.exit(failed ? 1 : 0);
