import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
const FONT_FAMILIES = ['Sans-serif', 'Serif', 'Monospace', 'Georgia', 'Verdana', 'Courier New'];
const HEADING_LEVELS = ['Normal', 'Heading 1', 'Heading 2', 'Heading 3'];
const TEXT_COLORS = ['#000000', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed', '#db2777'];
const HIGHLIGHT_COLORS = ['transparent', '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fecdd3', '#fed7aa'];

const MOCK_USERS = [
  { id: 'u1', name: 'Alice Chen', avatar: 'AC', color: '#3b82f6', email: 'alice@example.com' },
  { id: 'u2', name: 'Bob Martinez', avatar: 'BM', color: '#ef4444', email: 'bob@example.com' },
  { id: 'u3', name: 'Carol Williams', avatar: 'CW', color: '#22c55e', email: 'carol@example.com' },
  { id: 'u4', name: 'Dave Johnson', avatar: 'DJ', color: '#f59e0b', email: 'dave@example.com' },
  { id: 'u5', name: 'Eve Park', avatar: 'EP', color: '#8b5cf6', email: 'eve@example.com' },
];

const CURRENT_USER = MOCK_USERS[0];

const INITIAL_DOCUMENTS = [
  {
    id: 'doc1',
    title: 'Q1 Product Roadmap',
    content: 'Our Q1 product roadmap focuses on three main pillars: improving user onboarding, expanding our API capabilities, and launching the mobile companion app. The onboarding improvements include a guided tour, contextual tooltips, and a redesigned welcome email sequence. API expansion covers webhooks, batch operations, and GraphQL support. The mobile app will start with read-only access and push notifications.\n\nTimeline:\n- January: Onboarding redesign kickoff, API webhook beta\n- February: Mobile app alpha, batch operations release\n- March: Full mobile launch, GraphQL beta, onboarding A/B tests\n\nKey metrics to track: activation rate, API adoption, mobile DAU.',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 2,
    createdBy: 'u1',
    collaborators: ['u1', 'u2', 'u3'],
    tags: ['roadmap', 'product', 'q1'],
    starred: true,
    wordCount: 89,
    versions: [
      { id: 'v1', timestamp: Date.now() - 86400000 * 30, author: 'u1', summary: 'Initial draft' },
      { id: 'v2', timestamp: Date.now() - 86400000 * 15, author: 'u2', summary: 'Added timeline section' },
      { id: 'v3', timestamp: Date.now() - 86400000 * 2, author: 'u1', summary: 'Updated metrics section' },
    ],
    comments: [
      { id: 'cm1', author: 'u2', text: 'Should we add budget estimates?', timestamp: Date.now() - 86400000 * 10, resolved: false, selectionStart: 0, selectionEnd: 20 },
      { id: 'cm2', author: 'u3', text: 'Mobile app timeline looks tight.', timestamp: Date.now() - 86400000 * 5, resolved: true, selectionStart: 200, selectionEnd: 250 },
    ],
  },
  {
    id: 'doc2',
    title: 'Engineering Standards',
    content: 'Code Review Guidelines:\n1. All PRs must have at least one approval before merging.\n2. Tests are required for new features and bug fixes.\n3. Commit messages must follow conventional commits format.\n4. No force pushes to main branch.\n5. Feature branches should be rebased on main before merging.\n\nArchitecture Principles:\n- Services should be loosely coupled.\n- Prefer composition over inheritance.\n- Use dependency injection for testability.\n- Document all public APIs.\n- Follow the principle of least privilege for service accounts.\n\nDeployment Process:\n- Staging deployment requires passing CI.\n- Production deploys happen on Tuesdays and Thursdays.\n- Hotfixes can be deployed anytime with VP approval.\n- All deploys must be logged in the deployment tracker.',
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 10,
    createdBy: 'u1',
    collaborators: ['u1', 'u4', 'u5'],
    tags: ['engineering', 'standards', 'process'],
    starred: false,
    wordCount: 120,
    versions: [
      { id: 'v4', timestamp: Date.now() - 86400000 * 60, author: 'u1', summary: 'Initial standards document' },
      { id: 'v5', timestamp: Date.now() - 86400000 * 30, author: 'u4', summary: 'Added deployment process' },
    ],
    comments: [],
  },
  {
    id: 'doc3',
    title: 'Meeting Notes - Sprint Retro',
    content: 'Sprint 24 Retrospective\n\nWhat went well:\n- Shipped the notification system on time.\n- Good cross-team collaboration on the API project.\n- Reduced bug count by 30% compared to last sprint.\n\nWhat could be improved:\n- Story estimation was off by ~40% on average.\n- Too many meetings on Wednesdays.\n- Staging environment was unstable for 2 days.\n\nAction items:\n- [ ] Schedule estimation workshop (Owner: Carol)\n- [ ] Move Wednesday standups to async (Owner: Alice)\n- [ ] Set up staging monitoring alerts (Owner: Dave)\n- [x] Update sprint velocity chart (Owner: Bob)',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 1,
    createdBy: 'u3',
    collaborators: ['u1', 'u2', 'u3', 'u4', 'u5'],
    tags: ['meeting', 'retro', 'sprint'],
    starred: false,
    wordCount: 98,
    versions: [
      { id: 'v6', timestamp: Date.now() - 86400000 * 7, author: 'u3', summary: 'Notes from retro meeting' },
      { id: 'v7', timestamp: Date.now() - 86400000 * 1, author: 'u2', summary: 'Updated action item status' },
    ],
    comments: [
      { id: 'cm3', author: 'u4', text: 'I can set up the monitoring by Friday', timestamp: Date.now() - 86400000 * 3, resolved: false, selectionStart: 350, selectionEnd: 400 },
    ],
  },
  {
    id: 'doc4',
    title: 'Design System Guidelines',
    content: 'Color Palette:\n- Primary: #3b82f6 (blue-500)\n- Secondary: #64748b (slate-500)\n- Success: #22c55e (green-500)\n- Warning: #f59e0b (amber-500)\n- Error: #ef4444 (red-500)\n\nTypography:\n- Headings: Inter, 700 weight\n- Body: Inter, 400 weight\n- Code: JetBrains Mono, 400 weight\n\nSpacing Scale:\n- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px\n\nComponent Guidelines:\n- Buttons should have minimum height of 36px.\n- Form inputs should have 8px padding.\n- Cards should use 16px padding and 8px border-radius.\n- Modals should have a 50% opacity backdrop.',
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 5,
    createdBy: 'u2',
    collaborators: ['u1', 'u2'],
    tags: ['design', 'ui', 'guidelines'],
    starred: true,
    wordCount: 105,
    versions: [
      { id: 'v8', timestamp: Date.now() - 86400000 * 45, author: 'u2', summary: 'Initial design system' },
    ],
    comments: [],
  },
];

const INITIAL_PRESENCE = [
  { userId: 'u2', docId: 'doc1', cursorPosition: 145, lastActive: Date.now() - 30000, status: 'editing' },
  { userId: 'u3', docId: 'doc1', cursorPosition: 320, lastActive: Date.now() - 120000, status: 'viewing' },
  { userId: 'u5', docId: 'doc3', cursorPosition: 50, lastActive: Date.now() - 60000, status: 'editing' },
];

export default function CollaborativeDocEditor() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [activeDocId, setActiveDocId] = useState('doc1');
  const [showDocList, setShowDocList] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [docListSearch, setDocListSearch] = useState('');
  const [docListFilter, setDocListFilter] = useState('all');
  const [docListSort, setDocListSort] = useState('updated');
  const [formatting, setFormatting] = useState({
    bold: false, italic: false, underline: false, strikethrough: false,
    fontSize: 16, fontFamily: 'Sans-serif', headingLevel: 'Normal',
    textColor: '#000000', highlightColor: 'transparent',
    alignLeft: true, alignCenter: false, alignRight: false, alignJustify: false,
    bulletList: false, numberedList: false,
  });
  const [presence, setPresence] = useState(INITIAL_PRESENCE);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(Date.now());
  const [isDirty, setIsDirty] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findMatchCount, setFindMatchCount] = useState(0);
  const [currentFindIndex, setCurrentFindIndex] = useState(0);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('edit');
  const [newCommentText, setNewCommentText] = useState('');
  const [newTagText, setNewTagText] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [focusMode, setFocusMode] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const editorRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const presenceIntervalRef = useRef(null);

  const activeDoc = useMemo(
    () => documents.find((d) => d.id === activeDocId),
    [documents, activeDocId]
  );

  const filteredDocuments = useMemo(() => {
    let docs = [...documents];
    if (docListSearch) {
      const query = docListSearch.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.content.toLowerCase().includes(query) ||
          d.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    if (docListFilter === 'starred') docs = docs.filter((d) => d.starred);
    else if (docListFilter === 'mine') docs = docs.filter((d) => d.createdBy === CURRENT_USER.id);
    else if (docListFilter === 'shared')
      docs = docs.filter((d) => d.collaborators.length > 1 && d.createdBy !== CURRENT_USER.id);
    if (docListSort === 'updated') docs.sort((a, b) => b.updatedAt - a.updatedAt);
    else if (docListSort === 'created') docs.sort((a, b) => b.createdAt - a.createdAt);
    else if (docListSort === 'title') docs.sort((a, b) => a.title.localeCompare(b.title));
    else if (docListSort === 'wordCount') docs.sort((a, b) => b.wordCount - a.wordCount);
    return docs;
  }, [documents, docListSearch, docListFilter, docListSort]);

  const activeDocPresence = useMemo(
    () =>
      presence.filter(
        (p) => p.docId === activeDocId && p.userId !== CURRENT_USER.id && Date.now() - p.lastActive < 300000
      ),
    [presence, activeDocId]
  );

  const unresolvedComments = useMemo(
    () => (activeDoc ? activeDoc.comments.filter((c) => !c.resolved) : []),
    [activeDoc]
  );

  const wordCount = useMemo(() => {
    if (!activeDoc) return 0;
    return activeDoc.content
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  }, [activeDoc]);

  const charCount = useMemo(() => {
    if (!activeDoc) return 0;
    return activeDoc.content.length;
  }, [activeDoc]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  useEffect(() => {
    if (autoSaveEnabled && isDirty) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        setIsAutoSaving(true);
        setDocuments((prev) =>
          prev.map((d) => (d.id === activeDocId ? { ...d, updatedAt: Date.now(), wordCount } : d))
        );
        setLastSavedAt(Date.now());
        setIsDirty(false);
        setTimeout(() => setIsAutoSaving(false), 1000);
      }, 2000);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [activeDoc?.content, autoSaveEnabled, isDirty, activeDocId, wordCount]);

  useEffect(() => {
    presenceIntervalRef.current = setInterval(() => {
      setPresence((prev) =>
        prev.map((p) => ({
          ...p,
          cursorPosition: p.cursorPosition + Math.floor(Math.random() * 10) - 5,
          lastActive: Date.now() - Math.floor(Math.random() * 120000),
        }))
      );
    }, 15000);
    return () => {
      if (presenceIntervalRef.current) clearInterval(presenceIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleFormat('bold');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        toggleFormat('italic');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        toggleFormat('underline');
      }
      if (e.key === '?' && e.shiftKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowKeyboardShortcuts((v) => !v);
      }
      if (e.key === 'Escape') {
        setShowFindReplace(false);
        setShowKeyboardShortcuts(false);
        setShowCreateDocModal(false);
        setShowShareModal(false);
        setShowExportMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  useEffect(() => {
    if (findText && activeDoc) {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = activeDoc.content.match(regex);
      setFindMatchCount(matches ? matches.length : 0);
      setCurrentFindIndex(0);
    } else {
      setFindMatchCount(0);
      setCurrentFindIndex(0);
    }
  }, [findText, activeDoc]);

  const toggleFormat = useCallback((key) => {
    setFormatting((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setAlignment = useCallback((alignment) => {
    setFormatting((prev) => ({
      ...prev,
      alignLeft: alignment === 'left',
      alignCenter: alignment === 'center',
      alignRight: alignment === 'right',
      alignJustify: alignment === 'justify',
    }));
  }, []);

  const handleContentChange = useCallback(
    (e) => {
      const newContent = e.target.value;
      setDocuments((prev) =>
        prev.map((d) => (d.id === activeDocId ? { ...d, content: newContent } : d))
      );
      setIsDirty(true);
      setCursorPosition(e.target.selectionStart);
    },
    [activeDocId]
  );

  const handleSelectionChange = useCallback(() => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      setSelectionRange({ start, end });
      setCursorPosition(start);
    }
  }, []);

  const handleManualSave = useCallback(() => {
    if (!activeDoc) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? {
              ...d,
              updatedAt: Date.now(),
              wordCount,
              versions: [
                ...d.versions,
                {
                  id: `v${Date.now()}`,
                  timestamp: Date.now(),
                  author: CURRENT_USER.id,
                  summary: 'Manual save',
                },
              ],
            }
          : d
      )
    );
    setLastSavedAt(Date.now());
    setIsDirty(false);
  }, [activeDoc, activeDocId, wordCount]);

  const handleCreateDocument = useCallback(() => {
    if (!newDocTitle.trim()) return;
    const newDoc = {
      id: `doc${Date.now()}`,
      title: newDocTitle.trim(),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: CURRENT_USER.id,
      collaborators: [CURRENT_USER.id],
      tags: [],
      starred: false,
      wordCount: 0,
      versions: [
        {
          id: `v${Date.now()}`,
          timestamp: Date.now(),
          author: CURRENT_USER.id,
          summary: 'Document created',
        },
      ],
      comments: [],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setNewDocTitle('');
    setShowCreateDocModal(false);
  }, [newDocTitle]);

  const handleDeleteDocument = useCallback(
    (docId) => {
      if (!window.confirm('Are you sure you want to delete this document?')) return;
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (activeDocId === docId) {
        const remaining = documents.filter((d) => d.id !== docId);
        setActiveDocId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [activeDocId, documents]
  );

  const handleToggleStar = useCallback((docId) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, starred: !d.starred } : d)));
  }, []);

  const handleDuplicateDocument = useCallback(
    (docId) => {
      const source = documents.find((d) => d.id === docId);
      if (!source) return;
      const dup = {
        ...source,
        id: `doc${Date.now()}`,
        title: `${source.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: CURRENT_USER.id,
        versions: [
          {
            id: `v${Date.now()}`,
            timestamp: Date.now(),
            author: CURRENT_USER.id,
            summary: 'Duplicated document',
          },
        ],
        comments: [],
      };
      setDocuments((prev) => [dup, ...prev]);
      setActiveDocId(dup.id);
    },
    [documents]
  );

  const handleShareDocument = useCallback(() => {
    if (!shareEmail.trim() || !activeDoc) return;
    const user = MOCK_USERS.find((u) => u.email === shareEmail.trim());
    if (user && !activeDoc.collaborators.includes(user.id)) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocId ? { ...d, collaborators: [...d.collaborators, user.id] } : d
        )
      );
    }
    setShareEmail('');
    setShowShareModal(false);
  }, [shareEmail, activeDoc, activeDocId]);

  const handleRemoveCollaborator = useCallback(
    (userId) => {
      if (userId === CURRENT_USER.id) return;
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocId
            ? { ...d, collaborators: d.collaborators.filter((c) => c !== userId) }
            : d
        )
      );
    },
    [activeDocId]
  );

  const handleAddComment = useCallback(() => {
    if (!newCommentText.trim() || !activeDoc) return;
    const comment = {
      id: `cm${Date.now()}`,
      author: CURRENT_USER.id,
      text: newCommentText.trim(),
      timestamp: Date.now(),
      resolved: false,
      selectionStart: selectionRange.start,
      selectionEnd: selectionRange.end,
    };
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId ? { ...d, comments: [...d.comments, comment] } : d
      )
    );
    setNewCommentText('');
  }, [newCommentText, activeDoc, activeDocId, selectionRange]);

  const handleResolveComment = useCallback(
    (commentId) => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocId
            ? {
                ...d,
                comments: d.comments.map((c) =>
                  c.id === commentId ? { ...c, resolved: !c.resolved } : c
                ),
              }
            : d
        )
      );
    },
    [activeDocId]
  );

  const handleDeleteComment = useCallback(
    (commentId) => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocId
            ? { ...d, comments: d.comments.filter((c) => c.id !== commentId) }
            : d
        )
      );
    },
    [activeDocId]
  );

  const handleAddTag = useCallback(() => {
    if (!newTagText.trim() || !activeDoc) return;
    if (activeDoc.tags.includes(newTagText.trim().toLowerCase())) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? { ...d, tags: [...d.tags, newTagText.trim().toLowerCase()] }
          : d
      )
    );
    setNewTagText('');
  }, [newTagText, activeDoc, activeDocId]);

  const handleRemoveTag = useCallback(
    (tag) => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocId ? { ...d, tags: d.tags.filter((t) => t !== tag) } : d
        )
      );
    },
    [activeDocId]
  );

  const handleRestoreVersion = useCallback(
    (versionId) => {
      if (!window.confirm('Restore this version? Current changes will be saved as a new version.'))
        return;
      handleManualSave();
      setSelectedVersionId(null);
      setShowVersionHistory(false);
    },
    [handleManualSave]
  );

  const handleFindNext = useCallback(() => {
    if (findMatchCount > 0) {
      setCurrentFindIndex((prev) => (prev + 1) % findMatchCount);
    }
  }, [findMatchCount]);

  const handleFindPrevious = useCallback(() => {
    if (findMatchCount > 0) {
      setCurrentFindIndex((prev) => (prev - 1 + findMatchCount) % findMatchCount);
    }
  }, [findMatchCount]);

  const handleReplaceOne = useCallback(() => {
    if (!findText || !activeDoc) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const newContent = activeDoc.content.replace(regex, replaceText);
    setDocuments((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, content: newContent } : d))
    );
    setIsDirty(true);
  }, [findText, replaceText, activeDoc, activeDocId]);

  const handleReplaceAll = useCallback(() => {
    if (!findText || !activeDoc) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newContent = activeDoc.content.replace(regex, replaceText);
    setDocuments((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, content: newContent } : d))
    );
    setIsDirty(true);
  }, [findText, replaceText, activeDoc, activeDocId]);

  const handleExport = useCallback(
    (format) => {
      if (!activeDoc) return;
      let content = '';
      let mimeType = '';
      let extension = '';
      if (format === 'txt') {
        content = activeDoc.content;
        mimeType = 'text/plain';
        extension = 'txt';
      } else if (format === 'md') {
        content = `# ${activeDoc.title}\n\n${activeDoc.content}`;
        mimeType = 'text/markdown';
        extension = 'md';
      } else if (format === 'html') {
        content = `<!DOCTYPE html><html><head><title>${activeDoc.title}</title></head><body><h1>${activeDoc.title}</h1><pre>${activeDoc.content}</pre></body></html>`;
        mimeType = 'text/html';
        extension = 'html';
      }
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeDoc.title.replace(/\s+/g, '_')}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportMenu(false);
    },
    [activeDoc]
  );

  const handleTitleChange = useCallback(
    (e) => {
      const newTitle = e.target.value;
      setDocuments((prev) =>
        prev.map((d) => (d.id === activeDocId ? { ...d, title: newTitle } : d))
      );
      setIsDirty(true);
    },
    [activeDocId]
  );

  const formatTimestamp = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const getUserById = (userId) => MOCK_USERS.find((u) => u.id === userId) || { name: 'Unknown', avatar: '??', color: '#666' };

  /* ───────────── render ───────────── */

  if (!activeDoc && documents.length === 0) {
    return (
      <div data-testid="empty-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <h2>No Documents</h2>
        <p>Create your first document to get started.</p>
        <button data-testid="create-first-doc-btn" onClick={() => setShowCreateDocModal(true)} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Create Document
        </button>
      </div>
    );
  }

  return (
    <div data-testid="editor-app" style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#1e293b', overflow: 'hidden' }}>
      {/* ─── Document List Sidebar ─── */}
      {showDocList && (
        <aside data-testid="doc-list-sidebar" style={{ width: 280, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#f8fafc', flexShrink: 0 }}>
          <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Documents</h2>
              <button data-testid="new-doc-btn" onClick={() => setShowCreateDocModal(true)} style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                + New
              </button>
            </div>
            <input data-testid="doc-search-input" placeholder="Search documents..." value={docListSearch} onChange={(e) => setDocListSearch(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <select data-testid="doc-filter-select" value={docListFilter} onChange={(e) => setDocListFilter(e.target.value)} style={{ flex: 1, padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12 }}>
                <option value="all">All</option>
                <option value="starred">Starred</option>
                <option value="mine">My Docs</option>
                <option value="shared">Shared</option>
              </select>
              <select data-testid="doc-sort-select" value={docListSort} onChange={(e) => setDocListSort(e.target.value)} style={{ flex: 1, padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12 }}>
                <option value="updated">Last Updated</option>
                <option value="created">Created</option>
                <option value="title">Title</option>
                <option value="wordCount">Word Count</option>
              </select>
            </div>
          </div>
          <div data-testid="doc-list" style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                data-testid={`doc-item-${doc.id}`}
                onClick={() => setActiveDocId(doc.id)}
                style={{ padding: '10px 12px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', background: doc.id === activeDocId ? '#dbeafe' : 'transparent', border: doc.id === activeDocId ? '1px solid #93c5fd' : '1px solid transparent' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                    {doc.starred && <span data-testid={`star-badge-${doc.id}`}>&#9733; </span>}
                    {doc.title}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button data-testid={`star-btn-${doc.id}`} onClick={(e) => { e.stopPropagation(); handleToggleStar(doc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: doc.starred ? '#f59e0b' : '#94a3b8' }} title="Star">
                      {doc.starred ? '\u2605' : '\u2606'}
                    </button>
                    <button data-testid={`dup-btn-${doc.id}`} onClick={(e) => { e.stopPropagation(); handleDuplicateDocument(doc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#64748b' }} title="Duplicate">
                      &#128203;
                    </button>
                    <button data-testid={`del-btn-${doc.id}`} onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444' }} title="Delete">
                      &#128465;
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  {formatTimestamp(doc.updatedAt)} &middot; {doc.wordCount} words
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span key={tag} style={{ fontSize: 10, padding: '1px 6px', background: '#e2e8f0', borderRadius: 10, color: '#475569' }}>
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && <span style={{ fontSize: 10, color: '#94a3b8' }}>+{doc.tags.length - 3}</span>}
                </div>
                {doc.collaborators.length > 1 && (
                  <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                    {doc.collaborators.slice(0, 4).map((cId) => {
                      const user = getUserById(cId);
                      return (
                        <span key={cId} style={{ width: 20, height: 20, borderRadius: '50%', background: user.color, color: '#fff', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {user.avatar}
                        </span>
                      );
                    })}
                    {doc.collaborators.length > 4 && <span style={{ fontSize: 10, color: '#94a3b8', lineHeight: '20px' }}>+{doc.collaborators.length - 4}</span>}
                  </div>
                )}
              </div>
            ))}
            {filteredDocuments.length === 0 && (
              <div data-testid="no-docs-message" style={{ textAlign: 'center', color: '#94a3b8', padding: 24, fontSize: 13 }}>
                No documents found
              </div>
            )}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', fontSize: 11, color: '#64748b', textAlign: 'center' }}>
            {documents.length} document{documents.length !== 1 ? 's' : ''} &middot;{' '}
            {documents.reduce((sum, d) => sum + d.wordCount, 0)} total words
          </div>
        </aside>
      )}

      {/* ─── Main Editor Area ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* ── Top Toolbar ── */}
        <header data-testid="toolbar" style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: '#fff' }}>
          <button data-testid="toggle-sidebar-btn" onClick={() => setShowDocList((v) => !v)} style={{ padding: '4px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 14 }} title="Toggle sidebar">
            &#9776;
          </button>

          <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

          <select data-testid="heading-select" value={formatting.headingLevel} onChange={(e) => setFormatting((p) => ({ ...p, headingLevel: e.target.value }))} style={{ padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12 }}>
            {HEADING_LEVELS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <select data-testid="font-family-select" value={formatting.fontFamily} onChange={(e) => setFormatting((p) => ({ ...p, fontFamily: e.target.value }))} style={{ padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, maxWidth: 100 }}>
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select data-testid="font-size-select" value={formatting.fontSize} onChange={(e) => setFormatting((p) => ({ ...p, fontSize: Number(e.target.value) }))} style={{ padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, width: 55 }}>
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

          <button data-testid="bold-btn" onClick={() => toggleFormat('bold')} style={{ padding: '3px 8px', background: formatting.bold ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            B
          </button>
          <button data-testid="italic-btn" onClick={() => toggleFormat('italic')} style={{ padding: '3px 8px', background: formatting.italic ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontStyle: 'italic', fontSize: 13 }}>
            I
          </button>
          <button data-testid="underline-btn" onClick={() => toggleFormat('underline')} style={{ padding: '3px 8px', background: formatting.underline ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>
            U
          </button>
          <button data-testid="strikethrough-btn" onClick={() => toggleFormat('strikethrough')} style={{ padding: '3px 8px', background: formatting.strikethrough ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', textDecoration: 'line-through', fontSize: 13 }}>
            S
          </button>

          <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

          <select data-testid="text-color-select" value={formatting.textColor} onChange={(e) => setFormatting((p) => ({ ...p, textColor: e.target.value }))} style={{ padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, width: 45, color: formatting.textColor }}>
            {TEXT_COLORS.map((c) => (
              <option key={c} value={c} style={{ color: c }}>A</option>
            ))}
          </select>

          <select data-testid="highlight-color-select" value={formatting.highlightColor} onChange={(e) => setFormatting((p) => ({ ...p, highlightColor: e.target.value }))} style={{ padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, width: 45, background: formatting.highlightColor !== 'transparent' ? formatting.highlightColor : undefined }}>
            {HIGHLIGHT_COLORS.map((c) => (
              <option key={c} value={c} style={{ background: c !== 'transparent' ? c : undefined }}>{c === 'transparent' ? 'None' : '\u2588'}</option>
            ))}
          </select>

          <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

          <button data-testid="align-left-btn" onClick={() => setAlignment('left')} style={{ padding: '3px 8px', background: formatting.alignLeft ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            &#9776;
          </button>
          <button data-testid="align-center-btn" onClick={() => setAlignment('center')} style={{ padding: '3px 8px', background: formatting.alignCenter ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            &#8801;
          </button>
          <button data-testid="align-right-btn" onClick={() => setAlignment('right')} style={{ padding: '3px 8px', background: formatting.alignRight ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            &#8594;
          </button>

          <button data-testid="bullet-list-btn" onClick={() => toggleFormat('bulletList')} style={{ padding: '3px 8px', background: formatting.bulletList ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            &#8226;
          </button>
          <button data-testid="numbered-list-btn" onClick={() => toggleFormat('numberedList')} style={{ padding: '3px 8px', background: formatting.numberedList ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            1.
          </button>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {activeDocPresence.map((p) => {
              const user = getUserById(p.userId);
              return (
                <span key={p.userId} data-testid={`presence-${p.userId}`} title={`${user.name} (${p.status})`} style={{ width: 28, height: 28, borderRadius: '50%', background: user.color, color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: p.status === 'editing' ? '2px solid #22c55e' : '2px solid #94a3b8' }}>
                  {user.avatar}
                </span>
              );
            })}
          </div>

          <div style={{ position: 'relative' }}>
            <button data-testid="export-btn" onClick={() => setShowExportMenu((v) => !v)} style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Export &#9662;
            </button>
            {showExportMenu && (
              <div data-testid="export-menu" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,.1)', zIndex: 50, minWidth: 140 }}>
                <button data-testid="export-txt-btn" onClick={() => handleExport('txt')} style={{ display: 'block', width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>
                  Plain Text (.txt)
                </button>
                <button data-testid="export-md-btn" onClick={() => handleExport('md')} style={{ display: 'block', width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>
                  Markdown (.md)
                </button>
                <button data-testid="export-html-btn" onClick={() => handleExport('html')} style={{ display: 'block', width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>
                  HTML (.html)
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── Secondary Toolbar (doc title, save status, actions) ── */}
        {activeDoc && (
          <div data-testid="secondary-toolbar" style={{ padding: '6px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12, background: '#fff' }}>
            <input data-testid="doc-title-input" value={activeDoc.title} onChange={handleTitleChange} style={{ border: 'none', fontSize: 18, fontWeight: 700, flex: 1, outline: 'none', minWidth: 0 }} />
            <span data-testid="save-status" style={{ fontSize: 11, color: isAutoSaving ? '#f59e0b' : isDirty ? '#ef4444' : '#22c55e', whiteSpace: 'nowrap' }}>
              {isAutoSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : `Saved ${formatTimestamp(lastSavedAt)}`}
            </span>
            <button data-testid="save-btn" onClick={handleManualSave} style={{ padding: '3px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Save
            </button>
            <button data-testid="toggle-autosave-btn" onClick={() => setAutoSaveEnabled((v) => !v)} style={{ padding: '3px 10px', background: autoSaveEnabled ? '#dcfce7' : '#fef2f2', border: `1px solid ${autoSaveEnabled ? '#86efac' : '#fca5a5'}`, borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
              Auto-save: {autoSaveEnabled ? 'ON' : 'OFF'}
            </button>
            <button data-testid="find-replace-btn" onClick={() => setShowFindReplace((v) => !v)} style={{ padding: '3px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Find
            </button>
            <button data-testid="version-history-btn" onClick={() => { setShowVersionHistory((v) => !v); setShowCollaborators(false); setShowComments(false); }} style={{ padding: '3px 10px', background: showVersionHistory ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              History
            </button>
            <button data-testid="collaborators-btn" onClick={() => { setShowCollaborators((v) => !v); setShowVersionHistory(false); setShowComments(false); }} style={{ padding: '3px 10px', background: showCollaborators ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Share ({activeDoc.collaborators.length})
            </button>
            <button data-testid="comments-btn" onClick={() => { setShowComments((v) => !v); setShowVersionHistory(false); setShowCollaborators(false); }} style={{ padding: '3px 10px', background: showComments ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Comments ({unresolvedComments.length})
            </button>
            <button data-testid="tags-btn" onClick={() => setShowTagEditor((v) => !v)} style={{ padding: '3px 10px', background: showTagEditor ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Tags
            </button>
            <button data-testid="focus-mode-btn" onClick={() => setFocusMode((v) => !v)} style={{ padding: '3px 10px', background: focusMode ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              {focusMode ? 'Exit Focus' : 'Focus'}
            </button>
          </div>
        )}

        {/* ── Find & Replace Bar ── */}
        {showFindReplace && (
          <div data-testid="find-replace-bar" style={{ padding: '8px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, background: '#fffbeb' }}>
            <input data-testid="find-input" placeholder="Find..." value={findText} onChange={(e) => setFindText(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, width: 180 }} />
            <span data-testid="find-match-count" style={{ fontSize: 11, color: '#64748b', minWidth: 50 }}>
              {findMatchCount > 0 ? `${currentFindIndex + 1}/${findMatchCount}` : '0 results'}
            </span>
            <button data-testid="find-prev-btn" onClick={handleFindPrevious} style={{ padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              &#9650;
            </button>
            <button data-testid="find-next-btn" onClick={handleFindNext} style={{ padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              &#9660;
            </button>
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <input data-testid="replace-input" placeholder="Replace..." value={replaceText} onChange={(e) => setReplaceText(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, width: 180 }} />
            <button data-testid="replace-one-btn" onClick={handleReplaceOne} style={{ padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Replace
            </button>
            <button data-testid="replace-all-btn" onClick={handleReplaceAll} style={{ padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Replace All
            </button>
            <button data-testid="close-find-btn" onClick={() => setShowFindReplace(false)} style={{ padding: '3px 8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>
              &#10005;
            </button>
          </div>
        )}

        {/* ── Tag Editor Bar ── */}
        {showTagEditor && activeDoc && (
          <div data-testid="tag-editor-bar" style={{ padding: '8px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Tags:</span>
            {activeDoc.tags.map((tag) => (
              <span key={tag} data-testid={`tag-${tag}`} style={{ fontSize: 12, padding: '2px 8px', background: '#e2e8f0', borderRadius: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                {tag}
                <button data-testid={`remove-tag-${tag}`} onClick={() => handleRemoveTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 12, padding: 0, lineHeight: 1 }}>
                  &#10005;
                </button>
              </span>
            ))}
            <input data-testid="new-tag-input" placeholder="Add tag..." value={newTagText} onChange={(e) => setNewTagText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} style={{ padding: '3px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, width: 100 }} />
            <button data-testid="add-tag-btn" onClick={handleAddTag} style={{ padding: '3px 8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
              Add
            </button>
          </div>
        )}

        {/* ── Editor + Right Panel ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Editor Content */}
          {activeDoc ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <textarea
                ref={editorRef}
                data-testid="editor-textarea"
                value={activeDoc.content}
                onChange={handleContentChange}
                onSelect={handleSelectionChange}
                style={{
                  flex: 1, padding: focusMode ? '48px 25%' : '24px 32px', border: 'none', outline: 'none', resize: 'none',
                  fontSize: formatting.fontSize, fontFamily: formatting.fontFamily,
                  fontWeight: formatting.bold ? 700 : 400, fontStyle: formatting.italic ? 'italic' : 'normal',
                  textDecoration: [formatting.underline && 'underline', formatting.strikethrough && 'line-through'].filter(Boolean).join(' ') || 'none',
                  color: formatting.textColor,
                  backgroundColor: formatting.highlightColor !== 'transparent' ? formatting.highlightColor : '#fff',
                  textAlign: formatting.alignCenter ? 'center' : formatting.alignRight ? 'right' : formatting.alignJustify ? 'justify' : 'left',
                  lineHeight: 1.7, zoom: `${zoomLevel}%`,
                }}
              />
              {/* Status Bar */}
              <div data-testid="status-bar" style={{ padding: '4px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', background: '#f8fafc' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span data-testid="word-count">{wordCount} words</span>
                  <span data-testid="char-count">{charCount} characters</span>
                  <span data-testid="reading-time">{readingTime} min read</span>
                  <span data-testid="cursor-position">Ln {activeDoc.content.substring(0, cursorPosition).split('\n').length}, Col {cursorPosition - activeDoc.content.lastIndexOf('\n', cursorPosition - 1)}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button data-testid="zoom-out-btn" onClick={() => setZoomLevel((z) => Math.max(50, z - 10))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 12 }}>
                    -
                  </button>
                  <span data-testid="zoom-level">{zoomLevel}%</span>
                  <button data-testid="zoom-in-btn" onClick={() => setZoomLevel((z) => Math.min(200, z + 10))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 12 }}>
                    +
                  </button>
                  <span data-testid="active-collaborators">{activeDocPresence.length} online</span>
                </div>
              </div>
            </div>
          ) : (
            <div data-testid="no-doc-selected" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 16 }}>
              Select a document to start editing
            </div>
          )}

          {/* ── Right Panel (Version History / Collaborators / Comments) ── */}
          {(showVersionHistory || showCollaborators || showComments) && activeDoc && (
            <aside data-testid="right-panel" style={{ width: 300, borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0, overflow: 'hidden' }}>
              {/* Version History Panel */}
              {showVersionHistory && (
                <div data-testid="version-history-panel" style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Version History</h3>
                    <button data-testid="close-version-history" onClick={() => setShowVersionHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 16 }}>
                      &#10005;
                    </button>
                  </div>
                  {activeDoc.versions.map((version) => {
                    const author = getUserById(version.author);
                    return (
                      <div key={version.id} data-testid={`version-${version.id}`} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: selectedVersionId === version.id ? '#eff6ff' : 'transparent', cursor: 'pointer' }} onClick={() => setSelectedVersionId(version.id === selectedVersionId ? null : version.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{version.summary}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: author.color, color: '#fff', fontSize: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {author.avatar}
                          </span>
                          {author.name} &middot; {formatTimestamp(version.timestamp)}
                        </div>
                        {selectedVersionId === version.id && (
                          <button data-testid={`restore-version-${version.id}`} onClick={(e) => { e.stopPropagation(); handleRestoreVersion(version.id); }} style={{ marginTop: 8, padding: '4px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                            Restore This Version
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Collaborators Panel */}
              {showCollaborators && (
                <div data-testid="collaborators-panel" style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Collaborators</h3>
                    <button data-testid="share-doc-btn" onClick={() => setShowShareModal(true)} style={{ padding: '3px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      + Invite
                    </button>
                  </div>
                  {activeDoc.collaborators.map((cId) => {
                    const user = getUserById(cId);
                    const presenceInfo = presence.find((p) => p.userId === cId && p.docId === activeDocId);
                    const isOnline = presenceInfo && Date.now() - presenceInfo.lastActive < 300000;
                    return (
                      <div key={cId} data-testid={`collaborator-${cId}`} style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 32, height: 32, borderRadius: '50%', background: user.color, color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, position: 'relative' }}>
                          {user.avatar}
                          {isOnline && (
                            <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
                          )}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {user.name} {cId === CURRENT_USER.id && <span style={{ fontSize: 10, color: '#94a3b8' }}>(you)</span>}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {isOnline ? presenceInfo.status : 'offline'}
                          </div>
                        </div>
                        {cId !== CURRENT_USER.id && cId !== activeDoc.createdBy && (
                          <button data-testid={`remove-collaborator-${cId}`} onClick={() => handleRemoveCollaborator(cId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}>
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Comments Panel */}
              {showComments && (
                <div data-testid="comments-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                      Comments ({unresolvedComments.length} open)
                    </h3>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {activeDoc.comments.length === 0 ? (
                      <div data-testid="no-comments" style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        No comments yet
                      </div>
                    ) : (
                      activeDoc.comments.map((comment) => {
                        const author = getUserById(comment.author);
                        return (
                          <div key={comment.id} data-testid={`comment-${comment.id}`} style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', opacity: comment.resolved ? 0.5 : 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 24, height: 24, borderRadius: '50%', background: author.color, color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {author.avatar}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{author.name}</span>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatTimestamp(comment.timestamp)}</span>
                              {comment.resolved && <span data-testid={`resolved-badge-${comment.id}`} style={{ fontSize: 10, padding: '1px 6px', background: '#dcfce7', color: '#16a34a', borderRadius: 10 }}>Resolved</span>}
                            </div>
                            <p style={{ margin: '6px 0 8px', fontSize: 13, lineHeight: 1.5, color: '#334155' }}>{comment.text}</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button data-testid={`resolve-comment-${comment.id}`} onClick={() => handleResolveComment(comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 12 }}>
                                {comment.resolved ? 'Unresolve' : 'Resolve'}
                              </button>
                              <button data-testid={`delete-comment-${comment.id}`} onClick={() => handleDeleteComment(comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}>
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div style={{ padding: '10px 16px', borderTop: '1px solid #e2e8f0' }}>
                    <textarea data-testid="new-comment-input" placeholder="Add a comment..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, resize: 'vertical', minHeight: 50, boxSizing: 'border-box' }} />
                    <button data-testid="add-comment-btn" onClick={handleAddComment} disabled={!newCommentText.trim()} style={{ marginTop: 6, padding: '4px 12px', background: newCommentText.trim() ? '#3b82f6' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 4, cursor: newCommentText.trim() ? 'pointer' : 'default', fontSize: 12 }}>
                      Add Comment
                    </button>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* ─── Create Document Modal ─── */}
      {showCreateDocModal && (
        <div data-testid="create-doc-modal-overlay" onClick={() => setShowCreateDocModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div data-testid="create-doc-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 24, width: 400, maxWidth: '90vw', boxShadow: '0 8px 30px rgba(0,0,0,.15)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>New Document</h3>
            <input data-testid="new-doc-title-input" placeholder="Document title" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateDocument()} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button data-testid="cancel-create-doc" onClick={() => setShowCreateDocModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}>
                Cancel
              </button>
              <button data-testid="confirm-create-doc" onClick={handleCreateDocument} disabled={!newDocTitle.trim()} style={{ padding: '8px 16px', background: newDocTitle.trim() ? '#3b82f6' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 6, cursor: newDocTitle.trim() ? 'pointer' : 'default' }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Share Modal ─── */}
      {showShareModal && activeDoc && (
        <div data-testid="share-modal-overlay" onClick={() => setShowShareModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div data-testid="share-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 24, width: 420, maxWidth: '90vw', boxShadow: '0 8px 30px rgba(0,0,0,.15)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Share "{activeDoc.title}"</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input data-testid="share-email-input" placeholder="Enter email address" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleShareDocument()} style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14 }} />
              <select data-testid="share-permission-select" value={sharePermission} onChange={(e) => setSharePermission(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}>
                <option value="edit">Can edit</option>
                <option value="view">Can view</option>
                <option value="comment">Can comment</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button data-testid="cancel-share" onClick={() => setShowShareModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}>
                Cancel
              </button>
              <button data-testid="confirm-share" onClick={handleShareDocument} disabled={!shareEmail.trim()} style={{ padding: '8px 16px', background: shareEmail.trim() ? '#3b82f6' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 6, cursor: shareEmail.trim() ? 'pointer' : 'default' }}>
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Keyboard Shortcuts Modal ─── */}
      {showKeyboardShortcuts && (
        <div data-testid="shortcuts-modal-overlay" onClick={() => setShowKeyboardShortcuts(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div data-testid="shortcuts-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 24, width: 400, maxWidth: '90vw', boxShadow: '0 8px 30px rgba(0,0,0,.15)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Keyboard Shortcuts</h3>
            {[
              ['Ctrl+S', 'Save document'],
              ['Ctrl+F', 'Find & Replace'],
              ['Ctrl+B', 'Bold'],
              ['Ctrl+I', 'Italic'],
              ['Ctrl+U', 'Underline'],
              ['Ctrl+Shift+?', 'Show shortcuts'],
              ['Escape', 'Close panels'],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#334155' }}>{desc}</span>
                <kbd style={{ fontSize: 12, padding: '2px 8px', background: '#f1f5f9', borderRadius: 4, border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{key}</kbd>
              </div>
            ))}
            <button data-testid="close-shortcuts" onClick={() => setShowKeyboardShortcuts(false)} style={{ marginTop: 16, padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
