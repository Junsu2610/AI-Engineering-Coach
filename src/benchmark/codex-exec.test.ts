/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';

import { parseCodexJsonl } from './codex-exec';

describe('parseCodexJsonl', () => {
  it('deduplicates tool lifecycles and reads final cumulative usage', () => {
    const summary = parseCodexJsonl([
      JSON.stringify({ type: 'thread.started', thread_id: 'thread-1' }),
      JSON.stringify({
        type: 'item.started',
        item: { id: 'command-1', type: 'command_execution', command: 'npm test' },
      }),
      JSON.stringify({
        type: 'item.completed',
        item: {
          id: 'command-1',
          type: 'command_execution',
          command: 'npm test',
          status: 'completed',
          exit_code: 0,
        },
      }),
      JSON.stringify({
        type: 'item.completed',
        item: { id: 'message-1', type: 'agent_message', text: 'Done.' },
      }),
      JSON.stringify({
        type: 'turn.completed',
        usage: {
          input_tokens: 120,
          cached_input_tokens: 80,
          output_tokens: 30,
          reasoning_output_tokens: 10,
        },
      }),
      '',
    ].join('\r\n'));

    expect(summary.toolCalls).toBe(1);
    expect(summary.commands).toEqual([{
      id: 'command-1',
      command: 'npm test',
      status: 'completed',
      exitCode: 0,
    }]);
    expect(summary.inputTokens).toBe(120);
    expect(summary.cachedInputTokens).toBe(80);
    expect(summary.outputTokens).toBe(30);
    expect(summary.reasoningOutputTokens).toBe(10);
    expect(summary.finalMessage).toBe('Done.');
    expect(summary.parseErrors).toEqual([]);
    expect(summary.authenticationFailed).toBe(false);
  });

  it('records malformed lines and forbidden network activity', () => {
    const summary = parseCodexJsonl([
      '{not-json}',
      JSON.stringify({
        type: 'item.completed',
        item: { id: 'search-1', type: 'web_search' },
      }),
      JSON.stringify({
        type: 'item.completed',
        item: {
          id: 'command-1',
          type: 'command_execution',
          command: 'curl https://example.com',
          exit_code: 1,
        },
      }),
    ].join('\n'));

    expect(summary.parseErrors).toHaveLength(1);
    expect(summary.toolCalls).toBe(2);
    expect(summary.usedNetworkTool).toBe(true);
  });

  it('detects an expired Codex login from live failure events', () => {
    const summary = parseCodexJsonl([
      JSON.stringify({
        type: 'error',
        message: 'Your access token could not be refreshed. Please log out and sign in again.',
      }),
      JSON.stringify({
        type: 'turn.failed',
        error: { message: 'invalid_refresh_token' },
      }),
    ].join('\n'));

    expect(summary.authenticationFailed).toBe(true);
  });
});
