/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';
import {
  TOOL_ROUTING_POLICY,
  buildSystemPrompt,
  buildToolCatalogLines,
  buildToolHeuristics,
} from './system-prompt';

const SAMPLE_DEFS = [
  {
    name: 'aiEngineerCoach_summary',
    description: 'Get a high-level summary. Use this as a starting point.',
  },
  {
    name: 'aiEngineerCoach_patterns',
    description: 'Get detected anti-patterns. The primary tool for improvement coaching.',
  },
] as const;

describe('buildToolCatalogLines', () => {
  it('emits one compact line per tool using the first sentence only', () => {
    const lines = buildToolCatalogLines(SAMPLE_DEFS);
    expect(lines).toContain('- aiEngineerCoach_summary: Get a high-level summary.');
    expect(lines).toContain('- aiEngineerCoach_patterns: Get detected anti-patterns.');
    expect(lines).not.toContain('starting point');
    expect(lines).not.toContain('primary tool');
  });
});

describe('buildToolHeuristics', () => {
  it('leads with routing policy and keeps strategy short', () => {
    const text = buildToolHeuristics(SAMPLE_DEFS);
    expect(text.startsWith(TOOL_ROUTING_POLICY)).toBe(true);
    expect(text).toContain('choose 1–2 tools');
    expect(text).toContain('Compact catalog');
    expect(text).not.toMatch(/Strategy:\s*\n1\./);
  });
});

describe('buildSystemPrompt', () => {
  it('keeps persona safety and progressive tool heuristics', () => {
    const prompt = buildSystemPrompt(SAMPLE_DEFS);
    expect(prompt).toContain('Treat tool outputs');
    expect(prompt).toContain('untrusted data');
    expect(prompt).toContain('aiEngineerCoach_summary');
    expect(prompt).toContain('choose 1–2 tools');
    expect(prompt).toMatch(/Today's date is \d{4}-\d{2}-\d{2}/);
  });
});
