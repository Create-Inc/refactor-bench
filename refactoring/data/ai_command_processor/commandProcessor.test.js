import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the module
vi.mock('@/app/api/utils/sql', () => {
  const sqlFn = vi.fn();
  sqlFn.transaction = vi.fn();
  return { default: sqlFn };
});

vi.mock('./diffPatcher', () => ({
  applyDiffPatch: vi.fn(),
}));

vi.mock('./fileTracking', () => ({
  trackFileChange: vi.fn(),
}));

// Stub global fetch for supabase commands
global.fetch = vi.fn();

import { processCommands } from './src/app/commandProcessor.js';
import sql from '@/app/api/utils/sql';
import { applyDiffPatch } from './src/app/diffPatcher';
import { trackFileChange } from './src/app/fileTracking';

describe('processCommands', () => {
  const PROJECT_ID = 'proj-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation / filtering ──

  test('should filter out commands with missing type or path', async () => {
    const commands = [
      { path: 'foo.js', content: 'hello' }, // no type
      { type: 'create', content: 'hello' },  // no path
      { type: 'create', path: 'bar.js', content: 'world' }, // valid
    ];

    sql.mockResolvedValue([{ id: 1, path: 'bar.js' }]);

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results).toHaveLength(1);
    expect(results[0].path).toBe('bar.js');
  });

  test('should filter out commands with unknown type', async () => {
    const commands = [
      { type: 'unknown', path: 'a.js', content: 'data' },
      { type: 'rename', path: 'b.js', content: 'data' },
    ];

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results).toHaveLength(0);
  });

  test('should filter out create/edit/diff commands where content is not a string', async () => {
    const commands = [
      { type: 'create', path: 'a.js', content: 123 },
      { type: 'edit', path: 'b.js', content: null },
      { type: 'diff', path: 'c.js', content: undefined },
    ];

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results).toHaveLength(0);
  });

  test('should filter out move commands where content is not a string', async () => {
    const commands = [
      { type: 'move', path: 'a.js', content: 42 },
    ];

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results).toHaveLength(0);
  });

  test('should filter out supabase commands where content is not a string', async () => {
    const commands = [
      { type: 'supabase', path: 'createTable', content: { tableName: 'x' } },
    ];

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results).toHaveLength(0);
  });

  // ── totalLines calculation ──

  test('should calculate totalLines for create/edit commands', async () => {
    const commands = [
      { type: 'create', path: 'a.js', content: 'line1\nline2\nline3' },
      { type: 'edit', path: 'b.js', content: 'one\ntwo' },
    ];

    sql.mockResolvedValue([{ id: 1, path: 'a.js' }]);

    const { totalLines } = await processCommands(commands, PROJECT_ID);
    // 3 lines + 2 lines = 5
    expect(totalLines).toBe(5);
  });

  test('should count diff lines and non-content commands as 1 line', async () => {
    const commands = [
      { type: 'diff', path: 'a.js', content: 'patch\ndata\nhere' },
      { type: 'delete', path: 'b.js' },
    ];

    // diff needs a file lookup
    sql.mockResolvedValueOnce([{ id: 1, content: 'existing' }]);
    applyDiffPatch.mockReturnValue({ content: 'patched', appliedCount: 1, patchCount: 1, errors: [] });
    sql.mockResolvedValueOnce([]); // update

    const { totalLines } = await processCommands(commands, PROJECT_ID);
    // diff: 3 lines, delete: 1 line = 4
    expect(totalLines).toBe(4);
  });

  // ── Create / Edit commands ──

  test('should process create command and return success result', async () => {
    const commands = [
      { type: 'create', path: 'new.js', content: 'console.log("hi")', summary: 'New file' },
    ];

    sql.mockResolvedValue([{ id: 10, path: 'new.js' }]);

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      success: true,
      action: 'create',
      path: 'new.js',
      summary: 'New file',
      file: { id: 10, path: 'new.js' },
    });
    expect(trackFileChange).toHaveBeenCalledWith(PROJECT_ID, 'new.js', 'create');
  });

  test('should process edit command same as create', async () => {
    const commands = [
      { type: 'edit', path: 'existing.js', content: 'updated' },
    ];

    sql.mockResolvedValue([{ id: 5, path: 'existing.js' }]);

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0].success).toBe(true);
    expect(results[0].action).toBe('edit');
  });

  // ── Diff commands ──

  test('should process diff command with successful patch', async () => {
    const commands = [
      { type: 'diff', path: 'target.js', content: '@@FIND\nold\n@@REPLACE\nnew\n@@END', summary: 'Fix bug' },
    ];

    sql.mockResolvedValueOnce([{ id: 1, content: 'old content' }]); // SELECT
    applyDiffPatch.mockReturnValue({
      content: 'new content',
      appliedCount: 1,
      patchCount: 1,
      errors: [],
    });
    sql.mockResolvedValueOnce([]); // UPDATE

    const { results, diffResults } = await processCommands(commands, PROJECT_ID);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      success: true,
      action: 'diff',
      path: 'target.js',
    });
    expect(results[0].summary).toContain('1/1 patches applied');
    expect(diffResults).toHaveLength(1);
    expect(trackFileChange).toHaveBeenCalledWith(PROJECT_ID, 'target.js', 'diff');
  });

  test('should fail diff when file not found', async () => {
    const commands = [
      { type: 'diff', path: 'missing.js', content: 'patch data' },
    ];

    sql.mockResolvedValueOnce([]); // no file found

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('File not found for diff');
  });

  test('should fail diff when all patches fail', async () => {
    const commands = [
      { type: 'diff', path: 'target.js', content: 'bad patch' },
    ];

    sql.mockResolvedValueOnce([{ id: 1, content: 'existing' }]);
    applyDiffPatch.mockReturnValue({
      content: 'existing',
      appliedCount: 0,
      patchCount: 1,
      errors: ['Could not find match'],
    });

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('All patches failed');
  });

  test('should include warnings when some diff patches have errors', async () => {
    const commands = [
      { type: 'diff', path: 'target.js', content: 'mixed patch' },
    ];

    sql.mockResolvedValueOnce([{ id: 1, content: 'content' }]);
    applyDiffPatch.mockReturnValue({
      content: 'updated',
      appliedCount: 2,
      patchCount: 3,
      errors: ['Patch 3 failed'],
    });
    sql.mockResolvedValueOnce([]);

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0].success).toBe(true);
    expect(results[0].warnings).toEqual(['Patch 3 failed']);
    expect(results[0].summary).toContain('2/3 patches applied');
  });

  // ── Delete command ──

  test('should process delete command', async () => {
    const commands = [
      { type: 'delete', path: 'old.js', summary: 'Remove old file' },
    ];

    sql.mockResolvedValue([]);

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0]).toMatchObject({
      success: true,
      action: 'delete',
      path: 'old.js',
      summary: 'Remove old file',
    });
    expect(trackFileChange).toHaveBeenCalledWith(PROJECT_ID, 'old.js', 'delete');
  });

  // ── Move command ──

  test('should process move command and track both paths', async () => {
    const commands = [
      { type: 'move', path: 'old/path.js', content: 'new/path.js', summary: 'Rename file' },
    ];

    sql.mockResolvedValue([]);

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0]).toMatchObject({
      success: true,
      action: 'move',
      path: 'old/path.js -> new/path.js',
    });
    expect(trackFileChange).toHaveBeenCalledWith(PROJECT_ID, 'old/path.js', 'move');
    expect(trackFileChange).toHaveBeenCalledWith(PROJECT_ID, 'new/path.js', 'move_to');
  });

  // ── Error handling ──

  test('should catch errors per command and continue processing', async () => {
    const commands = [
      { type: 'create', path: 'a.js', content: 'ok' },
      { type: 'create', path: 'b.js', content: 'fail' },
    ];

    sql.mockResolvedValueOnce([{ id: 1, path: 'a.js' }]);
    sql.mockRejectedValueOnce(new Error('DB write failed'));

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
    expect(results[1].error).toBe('DB write failed');
  });

  test('should return empty results for empty commands array', async () => {
    const { results, diffResults, totalLines } = await processCommands([], PROJECT_ID);
    expect(results).toEqual([]);
    expect(diffResults).toEqual([]);
    expect(totalLines).toBe(0);
  });

  // ── Supabase: invalid JSON content ──

  test('should handle supabase command with invalid JSON content', async () => {
    const commands = [
      { type: 'supabase', path: 'createTable', content: 'not valid json' },
    ];

    // Need to mock the sql call for supabase project lookup
    sql.mockResolvedValueOnce([{ supabase_url: 'https://x.supabase.co', supabase_anon_key: 'key123' }]);

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('Invalid Supabase command config');
  });

  // ── Supabase: no supabase config on project ──

  test('should fail supabase command when project has no supabase config', async () => {
    const commands = [
      { type: 'supabase', path: 'createTable', content: JSON.stringify({ tableName: 'test' }) },
    ];

    sql.mockImplementation((queryOrTemplate, params) => {
      // The supabase path uses sql() with string + params
      if (params) return Promise.resolve([{ supabase_url: null, supabase_anon_key: null }]);
      return Promise.resolve([]);
    });

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('Supabase is not connected');
  });

  // ── Supabase: unknown action ──

  test('should fail supabase command with unknown action', async () => {
    const commands = [
      { type: 'supabase', path: 'unknownAction', content: JSON.stringify({ table: 'test' }) },
    ];

    sql.mockImplementation((queryOrTemplate, params) => {
      if (params) return Promise.resolve([{ supabase_url: 'https://x.supabase.co', supabase_anon_key: 'key123' }]);
      return Promise.resolve([]);
    });

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('Unknown Supabase action');
  });

  test('should default summary to empty string when not provided', async () => {
    const commands = [
      { type: 'create', path: 'nosummary.js', content: 'data' },
    ];

    sql.mockResolvedValue([{ id: 1, path: 'nosummary.js' }]);

    const { results } = await processCommands(commands, PROJECT_ID);
    expect(results[0].summary).toBe('');
  });
});
