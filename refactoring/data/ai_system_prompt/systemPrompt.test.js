import { describe, test, expect } from 'vitest';
import { buildSystemPrompt } from './src/app/systemPrompt.js';

describe('buildSystemPrompt', () => {
  test('should return a non-empty string', () => {
    const result = buildSystemPrompt('My Project', [], '');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should include the project name in the prompt', () => {
    const result = buildSystemPrompt('Test App', [], '');
    expect(result).toContain('Project: Test App');
  });

  test('should use "Untitled" when project name is falsy', () => {
    expect(buildSystemPrompt(null, [], '')).toContain('Project: Untitled');
    expect(buildSystemPrompt('', [], '')).toContain('Project: Untitled');
    expect(buildSystemPrompt(undefined, [], '')).toContain('Project: Untitled');
  });

  test('should include conversation summary when provided', () => {
    const summary = 'User wants a todo app with dark theme';
    const result = buildSystemPrompt('App', [], summary);
    expect(result).toContain('CONVERSATION CONTEXT');
    expect(result).toContain(summary);
  });

  test('should not include conversation context section when summary is empty', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).not.toContain('CONVERSATION CONTEXT');
  });

  test('should not include conversation context when summary is null/undefined', () => {
    expect(buildSystemPrompt('App', [], null)).not.toContain('CONVERSATION CONTEXT');
    expect(buildSystemPrompt('App', [], undefined)).not.toContain('CONVERSATION CONTEXT');
  });

  test('should include file map when fileList is non-empty', () => {
    const files = [
      { path: 'index.html', content: '<html>\n<body>\n</body>\n</html>' },
      { path: 'js/app.js', content: 'console.log("hello")' },
    ];
    const result = buildSystemPrompt('App', files, '');

    expect(result).toContain('PROJECT FILE MAP');
    expect(result).toContain('index.html');
    expect(result).toContain('js/app.js');
  });

  test('should not include file map section when fileList is empty', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).not.toContain('PROJECT FILE MAP');
  });

  test('should not include file map when fileList is null/undefined', () => {
    expect(buildSystemPrompt('App', null, '')).not.toContain('PROJECT FILE MAP');
    expect(buildSystemPrompt('App', undefined, '')).not.toContain('PROJECT FILE MAP');
  });

  test('should count lines correctly in file map', () => {
    const files = [
      { path: 'small.js', content: 'line1\nline2\nline3' },
    ];
    const result = buildSystemPrompt('App', files, '');
    expect(result).toContain('small.js (3 lines)');
  });

  test('should handle file with empty content in file map', () => {
    const files = [
      { path: 'empty.js', content: '' },
    ];
    const result = buildSystemPrompt('App', files, '');
    expect(result).toContain('empty.js (1 lines)');
  });

  test('should handle file with undefined content', () => {
    const files = [
      { path: 'noContent.js' },
    ];
    const result = buildSystemPrompt('App', files, '');
    expect(result).toContain('noContent.js (1 lines)');
  });

  // ── Response format sections ──

  test('should include response format instructions', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('RESPONSE FORMAT');
    expect(result).toContain('valid JSON');
  });

  test('should describe both planning and execute modes', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('MODE 1');
    expect(result).toContain('PLANNING');
    expect(result).toContain('MODE 2');
    expect(result).toContain('EXECUTE');
  });

  test('should list all command types', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('COMMAND TYPES');
    expect(result).toContain('"create"');
    expect(result).toContain('"edit"');
    expect(result).toContain('"diff"');
    expect(result).toContain('"delete"');
    expect(result).toContain('"move"');
    expect(result).toContain('"supabase"');
  });

  test('should include diff format instructions', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('DIFF FORMAT');
    expect(result).toContain('@@FIND');
    expect(result).toContain('@@REPLACE');
    expect(result).toContain('@@END');
    expect(result).toContain('@@AFTER');
    expect(result).toContain('@@INSERT');
  });

  test('should include the golden rule about complete apps', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('APP COMPLETENESS');
    expect(result).toContain('Build complete working app examples');
  });

  test('should include app templates', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('APP TEMPLATES');
    expect(result).toContain('Note-Taking App');
    expect(result).toContain('Todo/Task App');
    expect(result).toContain('Landing Page');
    expect(result).toContain('Calculator');
    expect(result).toContain('Dashboard');
  });

  test('should include code quality and styling guidelines', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('CODE QUALITY');
    expect(result).toContain('Dark theme');
    expect(result).toContain('#F97316');
  });

  test('should include command guidance', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('COMMAND TYPES');
    expect(result).toContain('"create"');
    expect(result).toContain('"edit"');
    expect(result).toContain('"diff"');
    expect(result).toContain('"delete"');
  });

  test('should include anti-patterns section', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('APP COMPLETENESS');
  });

  test('should include final checklist', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('FINAL CHECKLIST');
    expect(result).toContain('Every button has a working click handler');
    expect(result).toContain('localStorage');
  });

  test('should include semantic markup guidance', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('semantic HTML');
  });

  test('should include synthetic benchmark identity', () => {
    const result = buildSystemPrompt('App', [], '');
    expect(result).toContain('ExampleBuild Assistant');
  });
});
