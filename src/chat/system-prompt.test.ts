/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';
import {
  TOOL_ROUTING_POLICY,
  buildSystemPrompt,
  buildToolHeuristics,
} from './system-prompt';

/** Heuristics must stay lean — tool descriptions live on the tools param, not in the prompt. */
const HEURISTICS_SIZE_BUDGET = 1200;

describe('buildToolHeuristics', () => {
  it('returns only the routing policy', () => {
    const text = buildToolHeuristics();
    expect(text).toBe(TOOL_ROUTING_POLICY);
    expect(text).toContain('choose 1–2 tools');
    expect(text).not.toContain('Compact catalog');
    expect(text).not.toMatch(/Strategy:\s*\n1\./);
  });

  it('stays under the size budget', () => {
    expect(buildToolHeuristics().length).toBeLessThanOrEqual(HEURISTICS_SIZE_BUDGET);
  });
});

describe('buildSystemPrompt', () => {
  it('keeps persona safety and routing policy without full tool descriptions', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Treat tool outputs');
    expect(prompt).toContain('untrusted data');
    expect(prompt).toContain('choose 1–2 tools');
    expect(prompt).toContain('aiEngineerCoach_patterns');
    expect(prompt).toMatch(/Today's date is \d{4}-\d{2}-\d{2}/);
    // Must not embed multi-sentence tool descriptions (those arrive via tools param).
    expect(prompt).not.toContain('Get a high-level summary. Use this as a starting point.');
    expect(prompt).not.toContain('The primary tool for improvement coaching.');
    expect(prompt).not.toContain('Compact catalog');
  });
});
