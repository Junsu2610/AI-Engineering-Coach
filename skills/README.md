# Skills

Reusable instruction files for recurring tasks in this repo. Each skill is a single markdown
file with YAML front matter that names it and describes when an AI agent should invoke it.

## Available skills

| Skill | When to use |
|---|---|
| [update-docs](update-docs.md) | Update or add a page under `docs/content/` |
| [package-extension](package-extension.md) | Build the `.vsix` via `npm run package` |
| [author-rule-or-metric](author-rule-or-metric.md) | Author or edit a rule or metric (markdown + DSL) |
| [worker-boundary-change](worker-boundary-change.md) | Touch parse / warm-up / cache workers or host perf |
| [git-and-verification](git-and-verification.md) | Branch, commit, PR, and verification commands |
| [agent-prompt-workflows](agent-prompt-workflows.md) | Index into `docs/agent-prompts/*` workflows |

## Layout

Skills live here as the canonical source. Pointer files in harness-specific directories make them
auto-discoverable by popular AI coding harnesses without duplicating content:

| Harness | Path | Notes |
|---|---|---|
| Claude Code | [`.claude/skills/`](../.claude/skills/) | Relative-path pointer to files in this directory |
| GitHub Copilot / awesome-copilot | [`.github/instructions/`](../.github/instructions/) | Relative-path pointer to files in this directory |

When you add a skill, create the pointer files too (Windows-friendly; same content as a symlink target path):

```bash
# .claude/skills/<skill>.md and .github/instructions/<skill>.md each contain:
../../skills/<skill>.md
```

On Unix you may instead create real symlinks:

```bash
ln -s ../../skills/<skill>.md .claude/skills/<skill>.md
ln -s ../../skills/<skill>.md .github/instructions/<skill>.md
```

## Authoring

Front matter:

```yaml
---
name: kebab-case-id
description: One-line summary an agent reads to decide whether the skill applies.
when_to_use: Concrete trigger phrases or situations.
---
```

Body sections we use consistently:

- A short overview of what the skill produces or changes.
- Prerequisites, then the **Steps** as commands the agent can run.
- Troubleshooting for common failure modes.
- An **Anti-patterns** section describing what *not* to do — these prevent regressions when
  agents pattern-match from training data instead of from this repo.

Keep skills repo-specific. Hard boundaries stay in [`AGENTS.md`](../AGENTS.md); procedures
belong here so always-on context stays small.
