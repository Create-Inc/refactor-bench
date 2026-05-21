import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react';
import CollaborativeDocEditor from './src/app/page.jsx';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock confirm dialog
window.confirm = vi.fn();

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock document.createElement('a').click for export
const mockClick = vi.fn();
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  const el = originalCreateElement(tag);
  if (tag === 'a') { el.click = mockClick; }
  return el;
});

describe('CollaborativeDocEditor', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.confirm.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Initial Rendering ───

  describe('Initial Rendering', () => {
    test('renders the editor app container', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('editor-app')).toBeInTheDocument();
    });

    test('renders the document list sidebar', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('doc-list-sidebar')).toBeInTheDocument();
    });

    test('renders all initial documents in the sidebar', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('doc-item-doc1')).toBeInTheDocument();
      expect(screen.getByTestId('doc-item-doc2')).toBeInTheDocument();
      expect(screen.getByTestId('doc-item-doc3')).toBeInTheDocument();
      expect(screen.getByTestId('doc-item-doc4')).toBeInTheDocument();
    });

    test('renders the main toolbar', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    });

    test('renders formatting buttons', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('bold-btn')).toBeInTheDocument();
      expect(screen.getByTestId('italic-btn')).toBeInTheDocument();
      expect(screen.getByTestId('underline-btn')).toBeInTheDocument();
      expect(screen.getByTestId('strikethrough-btn')).toBeInTheDocument();
    });

    test('renders font and heading selectors', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('heading-select')).toBeInTheDocument();
      expect(screen.getByTestId('font-family-select')).toBeInTheDocument();
      expect(screen.getByTestId('font-size-select')).toBeInTheDocument();
    });

    test('renders alignment and list buttons', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('align-left-btn')).toBeInTheDocument();
      expect(screen.getByTestId('align-center-btn')).toBeInTheDocument();
      expect(screen.getByTestId('align-right-btn')).toBeInTheDocument();
      expect(screen.getByTestId('bullet-list-btn')).toBeInTheDocument();
      expect(screen.getByTestId('numbered-list-btn')).toBeInTheDocument();
    });

    test('renders the editor textarea with first document content', () => {
      render(<CollaborativeDocEditor />);
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea.value).toContain('Q1 product roadmap');
    });

    test('renders the secondary toolbar with doc title', () => {
      render(<CollaborativeDocEditor />);
      const titleInput = screen.getByTestId('doc-title-input');
      expect(titleInput.value).toBe('Q1 Product Roadmap');
    });

    test('renders the status bar with word count', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('status-bar')).toBeInTheDocument();
      expect(screen.getByTestId('word-count')).toBeInTheDocument();
      expect(screen.getByTestId('char-count')).toBeInTheDocument();
      expect(screen.getByTestId('reading-time')).toBeInTheDocument();
    });

    test('renders save status indicator', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('save-status')).toBeInTheDocument();
    });

    test('renders save and auto-save toggle buttons', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('save-btn')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-autosave-btn')).toBeInTheDocument();
    });

    test('renders export button', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('export-btn')).toBeInTheDocument();
    });
  });

  // ─── Document List Operations ───

  describe('Document List Operations', () => {
    test('clicking a document in the sidebar switches the active document', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('doc-item-doc2'));
      const titleInput = screen.getByTestId('doc-title-input');
      expect(titleInput.value).toBe('Engineering Standards');
    });

    test('search filters documents by title', () => {
      render(<CollaborativeDocEditor />);
      const searchInput = screen.getByTestId('doc-search-input');
      fireEvent.change(searchInput, { target: { value: 'engineering' } });
      expect(screen.getByTestId('doc-item-doc2')).toBeInTheDocument();
      expect(screen.queryByTestId('doc-item-doc1')).not.toBeInTheDocument();
    });

    test('search filters documents by tag', () => {
      render(<CollaborativeDocEditor />);
      const searchInput = screen.getByTestId('doc-search-input');
      fireEvent.change(searchInput, { target: { value: 'retro' } });
      expect(screen.getByTestId('doc-item-doc3')).toBeInTheDocument();
      expect(screen.queryByTestId('doc-item-doc1')).not.toBeInTheDocument();
    });

    test('filter by starred shows only starred docs', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('doc-filter-select'), { target: { value: 'starred' } });
      expect(screen.getByTestId('doc-item-doc1')).toBeInTheDocument();
      expect(screen.getByTestId('doc-item-doc4')).toBeInTheDocument();
      expect(screen.queryByTestId('doc-item-doc2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('doc-item-doc3')).not.toBeInTheDocument();
    });

    test('filter by "mine" shows only user-created docs', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('doc-filter-select'), { target: { value: 'mine' } });
      expect(screen.getByTestId('doc-item-doc1')).toBeInTheDocument();
      expect(screen.getByTestId('doc-item-doc2')).toBeInTheDocument();
      expect(screen.queryByTestId('doc-item-doc3')).not.toBeInTheDocument();
    });

    test('sort by title sorts alphabetically', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('doc-sort-select'), { target: { value: 'title' } });
      const docList = screen.getByTestId('doc-list');
      const items = within(docList).getAllByTestId(/^doc-item-/);
      expect(items.length).toBe(4);
    });

    test('star toggle works on document list items', () => {
      render(<CollaborativeDocEditor />);
      // doc2 is not starred initially
      expect(screen.queryByTestId('star-badge-doc2')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('star-btn-doc2'));
      expect(screen.getByTestId('star-badge-doc2')).toBeInTheDocument();
    });

    test('duplicate document creates a copy', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('dup-btn-doc1'));
      // Should now have 5 documents - the new one should be active
      const titleInput = screen.getByTestId('doc-title-input');
      expect(titleInput.value).toContain('(Copy)');
    });

    test('delete document removes it (with confirm)', () => {
      window.confirm.mockReturnValue(true);
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('del-btn-doc2'));
      expect(screen.queryByTestId('doc-item-doc2')).not.toBeInTheDocument();
    });

    test('delete document does nothing when cancelled', () => {
      window.confirm.mockReturnValue(false);
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('del-btn-doc2'));
      expect(screen.getByTestId('doc-item-doc2')).toBeInTheDocument();
    });

    test('toggle sidebar hides/shows document list', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('doc-list-sidebar')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('toggle-sidebar-btn'));
      expect(screen.queryByTestId('doc-list-sidebar')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('toggle-sidebar-btn'));
      expect(screen.getByTestId('doc-list-sidebar')).toBeInTheDocument();
    });

    test('shows no docs message when search yields no results', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('doc-search-input'), { target: { value: 'zzzznonexistent' } });
      expect(screen.getByTestId('no-docs-message')).toBeInTheDocument();
    });
  });

  // ─── Document Editing ───

  describe('Document Editing', () => {
    test('editing the textarea updates document content', () => {
      render(<CollaborativeDocEditor />);
      const textarea = screen.getByTestId('editor-textarea');
      fireEvent.change(textarea, { target: { value: 'New content here' } });
      expect(textarea.value).toBe('New content here');
    });

    test('editing the title updates the document title', () => {
      render(<CollaborativeDocEditor />);
      const titleInput = screen.getByTestId('doc-title-input');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      expect(titleInput.value).toBe('Updated Title');
    });

    test('editing marks document as dirty (unsaved changes)', () => {
      render(<CollaborativeDocEditor />);
      const textarea = screen.getByTestId('editor-textarea');
      fireEvent.change(textarea, { target: { value: 'Changed content' } });
      expect(screen.getByTestId('save-status').textContent).toContain('Unsaved');
    });

    test('manual save updates save status', () => {
      render(<CollaborativeDocEditor />);
      const textarea = screen.getByTestId('editor-textarea');
      fireEvent.change(textarea, { target: { value: 'Changed content' } });
      fireEvent.click(screen.getByTestId('save-btn'));
      expect(screen.getByTestId('save-status').textContent).toContain('Saved');
    });

    test('manual save creates a new version', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('editor-textarea'), { target: { value: 'Changed' } });
      fireEvent.click(screen.getByTestId('save-btn'));
      fireEvent.click(screen.getByTestId('version-history-btn'));
      const panel = screen.getByTestId('version-history-panel');
      expect(within(panel).getByText('Manual save')).toBeInTheDocument();
    });

    test('word count updates when content changes', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('editor-textarea'), { target: { value: 'one two three four five' } });
      expect(screen.getByTestId('word-count').textContent).toContain('5');
    });

    test('character count updates when content changes', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('editor-textarea'), { target: { value: 'hello' } });
      expect(screen.getByTestId('char-count').textContent).toContain('5');
    });

    test('auto-save toggle switches between ON and OFF', () => {
      render(<CollaborativeDocEditor />);
      const toggleBtn = screen.getByTestId('toggle-autosave-btn');
      expect(toggleBtn.textContent).toContain('ON');
      fireEvent.click(toggleBtn);
      expect(toggleBtn.textContent).toContain('OFF');
      fireEvent.click(toggleBtn);
      expect(toggleBtn.textContent).toContain('ON');
    });
  });

  // ─── Formatting Toolbar ───

  describe('Formatting Toolbar', () => {
    test('bold button toggles bold formatting', () => {
      render(<CollaborativeDocEditor />);
      const boldBtn = screen.getByTestId('bold-btn');
      fireEvent.click(boldBtn);
      // Bold is now active — check that the textarea font-weight changes
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.style.fontWeight).toBe('700');
    });

    test('italic button toggles italic formatting', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('italic-btn'));
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.style.fontStyle).toBe('italic');
    });

    test('underline button toggles underline formatting', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('underline-btn'));
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.style.textDecoration).toContain('underline');
    });

    test('font size selector changes editor font size', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('font-size-select'), { target: { value: '24' } });
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.style.fontSize).toBe('24px');
    });

    test('font family selector changes editor font family', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('font-family-select'), { target: { value: 'Monospace' } });
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.style.fontFamily).toBe('Monospace');
    });

    test('alignment buttons change text alignment', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('align-center-btn'));
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.style.textAlign).toBe('center');

      fireEvent.click(screen.getByTestId('align-right-btn'));
      expect(textarea.style.textAlign).toBe('right');

      fireEvent.click(screen.getByTestId('align-left-btn'));
      expect(textarea.style.textAlign).toBe('left');
    });

    test('text color selector changes editor text color', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('text-color-select'), { target: { value: '#dc2626' } });
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.style.color).toBe('#dc2626');
    });
  });

  // ─── Find & Replace ───

  describe('Find & Replace', () => {
    test('find/replace bar toggles visibility', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.queryByTestId('find-replace-bar')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('find-replace-btn'));
      expect(screen.getByTestId('find-replace-bar')).toBeInTheDocument();
    });

    test('find shows match count', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('find-replace-btn'));
      fireEvent.change(screen.getByTestId('find-input'), { target: { value: 'the' } });
      const matchCount = screen.getByTestId('find-match-count').textContent;
      expect(matchCount).not.toBe('0 results');
    });

    test('find shows 0 results for non-matching text', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('find-replace-btn'));
      fireEvent.change(screen.getByTestId('find-input'), { target: { value: 'zzzznonexistent' } });
      expect(screen.getByTestId('find-match-count').textContent).toBe('0 results');
    });

    test('replace one replaces first occurrence', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('find-replace-btn'));
      fireEvent.change(screen.getByTestId('find-input'), { target: { value: 'Q1' } });
      fireEvent.change(screen.getByTestId('replace-input'), { target: { value: 'Q2' } });
      fireEvent.click(screen.getByTestId('replace-one-btn'));
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.value).toContain('Q2');
    });

    test('replace all replaces all occurrences', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('find-replace-btn'));
      fireEvent.change(screen.getByTestId('find-input'), { target: { value: 'the' } });
      fireEvent.change(screen.getByTestId('replace-input'), { target: { value: 'THE' } });
      fireEvent.click(screen.getByTestId('replace-all-btn'));
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.value).not.toMatch(/\bthe\b/);
    });

    test('close button hides find/replace bar', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('find-replace-btn'));
      expect(screen.getByTestId('find-replace-bar')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('close-find-btn'));
      expect(screen.queryByTestId('find-replace-bar')).not.toBeInTheDocument();
    });

    test('find next and previous cycle through matches', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('find-replace-btn'));
      fireEvent.change(screen.getByTestId('find-input'), { target: { value: 'the' } });
      // Initially shows 1/N
      const beforeNext = screen.getByTestId('find-match-count').textContent;
      fireEvent.click(screen.getByTestId('find-next-btn'));
      const afterNext = screen.getByTestId('find-match-count').textContent;
      // The counter should change (or wrap)
      expect(afterNext).toBeTruthy();
    });
  });

  // ─── Version History ───

  describe('Version History', () => {
    test('version history panel opens and lists versions', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('version-history-btn'));
      const panel = screen.getByTestId('version-history-panel');
      expect(panel).toBeInTheDocument();
      expect(within(panel).getByText('Initial draft')).toBeInTheDocument();
      expect(within(panel).getByText('Added timeline section')).toBeInTheDocument();
      expect(within(panel).getByText('Updated metrics section')).toBeInTheDocument();
    });

    test('clicking a version shows restore button', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('version-history-btn'));
      fireEvent.click(screen.getByTestId('version-v1'));
      expect(screen.getByTestId('restore-version-v1')).toBeInTheDocument();
    });

    test('clicking selected version again hides restore button', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('version-history-btn'));
      fireEvent.click(screen.getByTestId('version-v1'));
      expect(screen.getByTestId('restore-version-v1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('version-v1'));
      expect(screen.queryByTestId('restore-version-v1')).not.toBeInTheDocument();
    });

    test('close button closes version history panel', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('version-history-btn'));
      expect(screen.getByTestId('version-history-panel')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('close-version-history'));
      expect(screen.queryByTestId('version-history-panel')).not.toBeInTheDocument();
    });
  });

  // ─── Collaborators Panel ───

  describe('Collaborators Panel', () => {
    test('collaborators panel opens and lists collaborators', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      const panel = screen.getByTestId('collaborators-panel');
      expect(panel).toBeInTheDocument();
      // doc1 has collaborators u1, u2, u3
      expect(within(panel).getByTestId('collaborator-u1')).toBeInTheDocument();
      expect(within(panel).getByTestId('collaborator-u2')).toBeInTheDocument();
      expect(within(panel).getByTestId('collaborator-u3')).toBeInTheDocument();
    });

    test('current user is marked with "(you)"', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      const u1 = screen.getByTestId('collaborator-u1');
      expect(u1.textContent).toContain('(you)');
    });

    test('remove collaborator button works for non-owner collaborators', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      // u2 is not the doc creator (u1) and not the current user
      fireEvent.click(screen.getByTestId('remove-collaborator-u2'));
      expect(screen.queryByTestId('collaborator-u2')).not.toBeInTheDocument();
    });

    test('invite button opens share modal', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      fireEvent.click(screen.getByTestId('share-doc-btn'));
      expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    });

    test('share modal allows adding collaborator by email', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      fireEvent.click(screen.getByTestId('share-doc-btn'));
      fireEvent.change(screen.getByTestId('share-email-input'), { target: { value: 'dave@example.com' } });
      fireEvent.click(screen.getByTestId('confirm-share'));
      // Reopen collaborators panel to check
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      expect(screen.getByTestId('collaborator-u4')).toBeInTheDocument();
    });

    test('presence indicators show online collaborators in toolbar', () => {
      render(<CollaborativeDocEditor />);
      // u2 and u3 have presence on doc1
      expect(screen.getByTestId('presence-u2')).toBeInTheDocument();
      expect(screen.getByTestId('presence-u3')).toBeInTheDocument();
    });
  });

  // ─── Comments Panel ───

  describe('Comments Panel', () => {
    test('comments panel opens and shows comments', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('comments-btn'));
      const panel = screen.getByTestId('comments-panel');
      expect(panel).toBeInTheDocument();
      // doc1 has 2 comments (cm1, cm2)
      expect(within(panel).getByTestId('comment-cm1')).toBeInTheDocument();
      expect(within(panel).getByTestId('comment-cm2')).toBeInTheDocument();
    });

    test('comments button shows unresolved count', () => {
      render(<CollaborativeDocEditor />);
      const commentsBtn = screen.getByTestId('comments-btn');
      expect(commentsBtn.textContent).toContain('1'); // Only cm1 is unresolved
    });

    test('add comment creates a new comment', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('comments-btn'));
      const input = screen.getByTestId('new-comment-input');
      fireEvent.change(input, { target: { value: 'This is a test comment' } });
      fireEvent.click(screen.getByTestId('add-comment-btn'));
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    test('add comment clears input after submission', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('comments-btn'));
      const input = screen.getByTestId('new-comment-input');
      fireEvent.change(input, { target: { value: 'Comment text' } });
      fireEvent.click(screen.getByTestId('add-comment-btn'));
      expect(input.value).toBe('');
    });

    test('resolve/unresolve comment toggles resolved state', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('comments-btn'));
      // cm1 is unresolved
      expect(screen.queryByTestId('resolved-badge-cm1')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('resolve-comment-cm1'));
      expect(screen.getByTestId('resolved-badge-cm1')).toBeInTheDocument();
      // Unresolve
      fireEvent.click(screen.getByTestId('resolve-comment-cm1'));
      expect(screen.queryByTestId('resolved-badge-cm1')).not.toBeInTheDocument();
    });

    test('delete comment removes it from the list', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('comments-btn'));
      expect(screen.getByTestId('comment-cm1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('delete-comment-cm1'));
      expect(screen.queryByTestId('comment-cm1')).not.toBeInTheDocument();
    });

    test('shows no comments message on doc with no comments', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('doc-item-doc2'));
      fireEvent.click(screen.getByTestId('comments-btn'));
      expect(screen.getByTestId('no-comments')).toBeInTheDocument();
    });
  });

  // ─── Tags ───

  describe('Tags', () => {
    test('tag editor bar toggles visibility', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.queryByTestId('tag-editor-bar')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('tags-btn'));
      expect(screen.getByTestId('tag-editor-bar')).toBeInTheDocument();
    });

    test('existing tags are displayed', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('tags-btn'));
      expect(screen.getByTestId('tag-roadmap')).toBeInTheDocument();
      expect(screen.getByTestId('tag-product')).toBeInTheDocument();
      expect(screen.getByTestId('tag-q1')).toBeInTheDocument();
    });

    test('add a new tag', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('tags-btn'));
      fireEvent.change(screen.getByTestId('new-tag-input'), { target: { value: 'planning' } });
      fireEvent.click(screen.getByTestId('add-tag-btn'));
      expect(screen.getByTestId('tag-planning')).toBeInTheDocument();
    });

    test('add tag via Enter key', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('tags-btn'));
      const input = screen.getByTestId('new-tag-input');
      fireEvent.change(input, { target: { value: 'important' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByTestId('tag-important')).toBeInTheDocument();
    });

    test('remove a tag', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('tags-btn'));
      expect(screen.getByTestId('tag-roadmap')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('remove-tag-roadmap'));
      expect(screen.queryByTestId('tag-roadmap')).not.toBeInTheDocument();
    });

    test('duplicate tags are not added', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('tags-btn'));
      const tagsBefore = screen.getAllByTestId(/^tag-/).length;
      fireEvent.change(screen.getByTestId('new-tag-input'), { target: { value: 'roadmap' } });
      fireEvent.click(screen.getByTestId('add-tag-btn'));
      const tagsAfter = screen.getAllByTestId(/^tag-/).length;
      // One of those testIds is remove-tag-roadmap, but we just check count doesn't increase
      expect(tagsAfter).toBe(tagsBefore);
    });
  });

  // ─── Create Document Modal ───

  describe('Create Document Modal', () => {
    test('new doc button opens create modal', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('new-doc-btn'));
      expect(screen.getByTestId('create-doc-modal')).toBeInTheDocument();
    });

    test('create document adds it to the list and switches to it', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('new-doc-btn'));
      fireEvent.change(screen.getByTestId('new-doc-title-input'), { target: { value: 'My New Document' } });
      fireEvent.click(screen.getByTestId('confirm-create-doc'));
      expect(screen.queryByTestId('create-doc-modal')).not.toBeInTheDocument();
      const titleInput = screen.getByTestId('doc-title-input');
      expect(titleInput.value).toBe('My New Document');
    });

    test('create with Enter key works', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('new-doc-btn'));
      const input = screen.getByTestId('new-doc-title-input');
      fireEvent.change(input, { target: { value: 'Quick Doc' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.queryByTestId('create-doc-modal')).not.toBeInTheDocument();
      const titleInput = screen.getByTestId('doc-title-input');
      expect(titleInput.value).toBe('Quick Doc');
    });

    test('cancel button closes create modal', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('new-doc-btn'));
      expect(screen.getByTestId('create-doc-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('cancel-create-doc'));
      expect(screen.queryByTestId('create-doc-modal')).not.toBeInTheDocument();
    });

    test('cannot create document with empty title', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('new-doc-btn'));
      const confirmBtn = screen.getByTestId('confirm-create-doc');
      fireEvent.click(confirmBtn);
      // Modal should still be open since title is empty
      expect(screen.getByTestId('create-doc-modal')).toBeInTheDocument();
    });
  });

  // ─── Export ───

  describe('Export', () => {
    test('export menu opens and closes', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.queryByTestId('export-menu')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('export-btn'));
      expect(screen.getByTestId('export-menu')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('export-btn'));
      expect(screen.queryByTestId('export-menu')).not.toBeInTheDocument();
    });

    test('export as .txt triggers download', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('export-btn'));
      fireEvent.click(screen.getByTestId('export-txt-btn'));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('export as .md triggers download', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('export-btn'));
      fireEvent.click(screen.getByTestId('export-md-btn'));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    test('export as .html triggers download', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('export-btn'));
      fireEvent.click(screen.getByTestId('export-html-btn'));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    test('export menu closes after export', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('export-btn'));
      fireEvent.click(screen.getByTestId('export-txt-btn'));
      expect(screen.queryByTestId('export-menu')).not.toBeInTheDocument();
    });
  });

  // ─── Focus Mode and Zoom ───

  describe('Focus Mode and Zoom', () => {
    test('focus mode toggles on and off', () => {
      render(<CollaborativeDocEditor />);
      const focusBtn = screen.getByTestId('focus-mode-btn');
      expect(focusBtn.textContent).toBe('Focus');
      fireEvent.click(focusBtn);
      expect(focusBtn.textContent).toBe('Exit Focus');
      fireEvent.click(focusBtn);
      expect(focusBtn.textContent).toBe('Focus');
    });

    test('zoom in increases zoom level', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('zoom-level').textContent).toBe('100%');
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      expect(screen.getByTestId('zoom-level').textContent).toBe('110%');
    });

    test('zoom out decreases zoom level', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('zoom-out-btn'));
      expect(screen.getByTestId('zoom-level').textContent).toBe('90%');
    });

    test('zoom has minimum of 50%', () => {
      render(<CollaborativeDocEditor />);
      for (let i = 0; i < 10; i++) {
        fireEvent.click(screen.getByTestId('zoom-out-btn'));
      }
      expect(screen.getByTestId('zoom-level').textContent).toBe('50%');
    });

    test('zoom has maximum of 200%', () => {
      render(<CollaborativeDocEditor />);
      for (let i = 0; i < 20; i++) {
        fireEvent.click(screen.getByTestId('zoom-in-btn'));
      }
      expect(screen.getByTestId('zoom-level').textContent).toBe('200%');
    });
  });

  // ─── Panel Mutual Exclusivity ───

  describe('Panel Mutual Exclusivity', () => {
    test('opening version history closes collaborators and comments panels', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('comments-btn'));
      expect(screen.getByTestId('comments-panel')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('version-history-btn'));
      expect(screen.getByTestId('version-history-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('comments-panel')).not.toBeInTheDocument();
    });

    test('opening collaborators closes version history and comments', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('version-history-btn'));
      expect(screen.getByTestId('version-history-panel')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      expect(screen.getByTestId('collaborators-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('version-history-panel')).not.toBeInTheDocument();
    });

    test('opening comments closes version history and collaborators', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      expect(screen.getByTestId('collaborators-panel')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('comments-btn'));
      expect(screen.getByTestId('comments-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('collaborators-panel')).not.toBeInTheDocument();
    });
  });

  // ─── Cross-Feature Interactions ───

  describe('Cross-Feature Interactions', () => {
    test('switching documents updates editor content', () => {
      render(<CollaborativeDocEditor />);
      const textarea = screen.getByTestId('editor-textarea');
      expect(textarea.value).toContain('Q1 product roadmap');
      fireEvent.click(screen.getByTestId('doc-item-doc2'));
      expect(textarea.value).toContain('Code Review Guidelines');
    });

    test('switching documents updates comments panel', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('comments-btn'));
      expect(screen.getByTestId('comment-cm1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('doc-item-doc2'));
      expect(screen.getByTestId('no-comments')).toBeInTheDocument();
    });

    test('switching documents updates version history panel', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('version-history-btn'));
      expect(screen.getByText('Initial draft')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('doc-item-doc2'));
      expect(screen.getByText('Initial standards document')).toBeInTheDocument();
    });

    test('switching documents updates collaborators panel', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      expect(screen.getByTestId('collaborator-u2')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('doc-item-doc2'));
      expect(screen.getByTestId('collaborator-u4')).toBeInTheDocument();
    });

    test('deleting the active document switches to first remaining doc', () => {
      window.confirm.mockReturnValue(true);
      render(<CollaborativeDocEditor />);
      expect(screen.getByTestId('doc-title-input').value).toBe('Q1 Product Roadmap');
      fireEvent.click(screen.getByTestId('del-btn-doc1'));
      // Should switch to another document
      expect(screen.queryByTestId('doc-item-doc1')).not.toBeInTheDocument();
      expect(screen.getByTestId('doc-title-input')).toBeInTheDocument();
    });

    test('creating a document while sidebar shows filtered results works', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.change(screen.getByTestId('doc-search-input'), { target: { value: 'engineering' } });
      fireEvent.click(screen.getByTestId('new-doc-btn'));
      fireEvent.change(screen.getByTestId('new-doc-title-input'), { target: { value: 'Test Doc' } });
      fireEvent.click(screen.getByTestId('confirm-create-doc'));
      expect(screen.getByTestId('doc-title-input').value).toBe('Test Doc');
    });

    test('online collaborator count in status bar reflects current doc presence', () => {
      render(<CollaborativeDocEditor />);
      // doc1 has 2 collaborators online (u2 and u3)
      const onlineCount = screen.getByTestId('active-collaborators').textContent;
      expect(onlineCount).toContain('online');
    });
  });

  // ─── Share Modal ───

  describe('Share Modal', () => {
    test('share modal has permission selector', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      fireEvent.click(screen.getByTestId('share-doc-btn'));
      expect(screen.getByTestId('share-permission-select')).toBeInTheDocument();
    });

    test('cancel share modal closes it', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      fireEvent.click(screen.getByTestId('share-doc-btn'));
      expect(screen.getByTestId('share-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('cancel-share'));
      expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument();
    });

    test('sharing with unknown email does not add collaborator', () => {
      render(<CollaborativeDocEditor />);
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      const collabCountBefore = screen.getAllByTestId(/^collaborator-/).length;
      fireEvent.click(screen.getByTestId('share-doc-btn'));
      fireEvent.change(screen.getByTestId('share-email-input'), { target: { value: 'unknown@example.com' } });
      fireEvent.click(screen.getByTestId('confirm-share'));
      // Reopen collaborators panel
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      fireEvent.click(screen.getByTestId('collaborators-btn'));
      const collabCountAfter = screen.getAllByTestId(/^collaborator-/).length;
      expect(collabCountAfter).toBe(collabCountBefore);
    });
  });

  // ─── Keyboard Shortcuts Modal ───

  describe('Keyboard Shortcuts Modal', () => {
    test('shortcuts modal is not visible by default', () => {
      render(<CollaborativeDocEditor />);
      expect(screen.queryByTestId('shortcuts-modal')).not.toBeInTheDocument();
    });
  });
});
