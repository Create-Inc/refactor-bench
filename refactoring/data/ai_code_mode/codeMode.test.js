import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock all external dependencies before importing the module under test
vi.mock('@/app/api/utils/sql', () => {
  const sqlFn = vi.fn().mockResolvedValue([{ credits: 100 }]);
  sqlFn.default = sqlFn;
  return { default: sqlFn };
});

vi.mock('./src/app/constants', () => ({
  MODEL_ENDPOINTS: { claude: 'claude-endpoint', gpt4: 'gpt4-endpoint' },
  COMMAND_SCHEMA: { type: 'object' },
  MAX_CONTINUATIONS: 3,
  CONTINUATION_PROMPT_TEMPLATE: 'Continue from: __PARTIAL__',
}));

vi.mock('./src/app/systemPrompt', () => ({
  buildSystemPrompt: vi.fn().mockReturnValue('system prompt'),
}));

vi.mock('./src/app/conversationHistory', () => ({
  buildConversationMessages: vi.fn().mockReturnValue([]),
  buildConversationSummary: vi.fn().mockReturnValue('summary'),
  saveConversation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./src/app/aiClient', () => ({
  callAI: vi.fn().mockResolvedValue({
    error: false,
    rawContent: JSON.stringify({
      mode: 'code',
      commands: [{ action: 'create', path: '/test.js', content: 'hello' }],
      explanation: 'Created test file.',
    }),
  }),
}));

vi.mock('./src/app/helpers', () => ({
  extractJSON: vi.fn((raw) => {
    try { return JSON.parse(raw); } catch { return null; }
  }),
  isTruncated: vi.fn().mockReturnValue(false),
  mergeResponses: vi.fn().mockReturnValue(null),
  resolveFileReferences: vi.fn((instruction, files) => ({
    instruction,
    referencedFiles: [],
  })),
}));

vi.mock('./src/app/contextBuilder', () => ({
  buildFilesContext: vi.fn().mockReturnValue('files context'),
  buildExecutePlanInstruction: vi.fn((steps, instr) => `PLAN: ${instr}`),
}));

vi.mock('./src/app/commandProcessor', () => ({
  processCommands: vi.fn().mockResolvedValue({
    results: [{ success: true, action: 'create', path: '/test.js' }],
    diffResults: [],
    totalLines: 5,
  }),
}));

vi.mock('./src/app/supabaseInfo', () => ({
  fetchSupabaseInfo: vi.fn().mockResolvedValue('supabase info'),
}));

import { handleCodeMode } from './src/app/codeMode.js';
import sql from '@/app/api/utils/sql';
import { callAI } from './src/app/aiClient';
import { processCommands } from './src/app/commandProcessor';
import { saveConversation } from './src/app/conversationHistory';
import { extractJSON, isTruncated } from './src/app/helpers';

describe('handleCodeMode', () => {
  const defaultArgs = {
    userId: 'user-1',
    projectId: 'proj-1',
    instruction: 'Add a button',
    model: 'claude',
    executePlan: false,
    planSteps: null,
    projectCheck: [{ name: 'My Project', supabase_url: null, supabase_anon_key: null }],
    existingFiles: [],
    conversationHistory: [],
    userCredits: 1000,
  };

  function callDefault(overrides = {}) {
    const args = { ...defaultArgs, ...overrides };
    return handleCodeMode(
      args.userId,
      args.projectId,
      args.instruction,
      args.model,
      args.executePlan,
      args.planSteps,
      args.projectCheck,
      args.existingFiles,
      args.conversationHistory,
      args.userCredits,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset default mock return values
    callAI.mockResolvedValue({
      error: false,
      rawContent: JSON.stringify({
        mode: 'code',
        commands: [{ action: 'create', path: '/test.js', content: 'hello' }],
        explanation: 'Created test file.',
      }),
    });

    processCommands.mockResolvedValue({
      results: [{ success: true, action: 'create', path: '/test.js' }],
      diffResults: [],
      totalLines: 5,
    });

    sql.mockResolvedValue([{ credits: 100 }]);
  });

  test('should return 404 error when projectCheck is empty', async () => {
    const result = await callDefault({ projectCheck: [] });
    expect(result.error).toBe(true);
    expect(result.status).toBe(404);
    expect(result.data.error).toContain('not found');
  });

  test('should return successful code result for valid input', async () => {
    const result = await callDefault();
    expect(result.error).toBe(false);
    expect(result.data.success).toBe(true);
    expect(result.data.mode).toBe('code');
    expect(Array.isArray(result.data.results)).toBe(true);
    expect(typeof result.data.explanation).toBe('string');
    expect(typeof result.data.creditsUsed).toBe('number');
    expect(typeof result.data.remainingCredits).toBe('number');
  });

  test('should return 502 error when AI call fails', async () => {
    callAI.mockResolvedValue({ error: true, rawContent: null });
    const result = await callDefault();
    expect(result.error).toBe(true);
    expect(result.status).toBe(502);
  });

  test('should return 500 error when AI returns empty content', async () => {
    callAI.mockResolvedValue({ error: false, rawContent: '' });
    const result = await callDefault();
    expect(result.error).toBe(true);
    expect(result.status).toBe(500);
  });

  test('should return 500 error when response cannot be parsed', async () => {
    callAI.mockResolvedValue({ error: false, rawContent: 'not valid json' });
    extractJSON.mockReturnValue(null);
    isTruncated.mockReturnValue(false);
    const result = await callDefault();
    expect(result.error).toBe(true);
    expect(result.status).toBe(500);
    expect(result.data.error).toContain('incomplete');
  });

  test('should handle plan mode response', async () => {
    callAI.mockResolvedValue({
      error: false,
      rawContent: JSON.stringify({
        mode: 'plan',
        plan: [{ step: 1, desc: 'Do something' }],
        explanation: 'Here is the plan.',
      }),
    });
    extractJSON.mockImplementation((raw) => {
      try { return JSON.parse(raw); } catch { return null; }
    });

    const result = await callDefault();
    expect(result.error).toBe(false);
    expect(result.data.mode).toBe('plan');
    expect(Array.isArray(result.data.plan)).toBe(true);
    expect(result.data.explanation).toBe('Here is the plan.');
    expect(result.data.creditsUsed).toBe(0);
  });

  test('should handle empty commands with explanation', async () => {
    callAI.mockResolvedValue({
      error: false,
      rawContent: JSON.stringify({
        mode: 'code',
        commands: [],
        explanation: 'No changes needed.',
      }),
    });
    extractJSON.mockImplementation((raw) => {
      try { return JSON.parse(raw); } catch { return null; }
    });

    const result = await callDefault();
    expect(result.error).toBe(false);
    expect(result.data.results).toEqual([]);
    expect(result.data.explanation).toBe('No changes needed.');
    expect(result.data.creditsUsed).toBe(0);
  });

  test('should return 402 when user has insufficient credits', async () => {
    const result = await callDefault({ userCredits: 0 });
    // The function checks userCredits < creditsNeeded
    expect(result.error).toBe(true);
    expect(result.status).toBe(402);
    expect(result.data.error).toContain('Insufficient credits');
  });

  test('should return 402 when SQL deduction returns empty (concurrent depletion)', async () => {
    sql.mockResolvedValue([]);
    const result = await callDefault({ userCredits: 999999 });
    expect(result.error).toBe(true);
    expect(result.status).toBe(402);
  });

  test('should use gpt4 endpoint when model is not claude', async () => {
    const result = await callDefault({ model: 'gpt4' });
    expect(result.error).toBe(false);
    expect(result.data.model).toBe('gpt4');
  });

  test('should save conversation for successful code execution', async () => {
    await callDefault();
    expect(saveConversation).toHaveBeenCalled();
  });

  test('result data should include continuations count', async () => {
    const result = await callDefault();
    expect(result.data).toHaveProperty('continuations');
    expect(typeof result.data.continuations).toBe('number');
  });

  test('should include model in result data', async () => {
    const result = await callDefault();
    expect(result.data).toHaveProperty('model');
    expect(typeof result.data.model).toBe('string');
  });

  test('result shape should have error boolean and data object', async () => {
    const result = await callDefault();
    expect(typeof result.error).toBe('boolean');
    expect(typeof result.data).toBe('object');
    expect(result.data).not.toBeNull();
  });
});
