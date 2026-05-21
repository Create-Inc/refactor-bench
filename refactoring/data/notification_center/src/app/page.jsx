import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const NOTIFICATION_TYPES = ['mention', 'comment', 'assignment', 'system', 'alert', 'invite'];

const PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low'];

const PRIORITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',
};

const NOTIFICATION_ICONS = {
  mention: '@',
  comment: '💬',
  assignment: '📋',
  system: '⚙️',
  alert: '🔔',
  invite: '✉️',
};

const MOCK_USERS = [
  { id: 'u1', name: 'Alice Zhang', avatar: '👩‍💻', role: 'Engineering Lead' },
  { id: 'u2', name: 'Bob Martinez', avatar: '👨‍🎨', role: 'Designer' },
  { id: 'u3', name: 'Carol Singh', avatar: '👩‍🔬', role: 'Data Scientist' },
  { id: 'u4', name: 'Dan Kim', avatar: '👨‍💼', role: 'Product Manager' },
  { id: 'u5', name: 'Eve Johnson', avatar: '👩‍🏫', role: 'QA Engineer' },
  { id: 'u6', name: 'System', avatar: '🤖', role: 'Automated' },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1', type: 'mention', priority: 'high', fromUser: 'u1', title: 'Mentioned you in PR #342',
    body: 'Hey, can you review the auth middleware changes? I think we need your input on the session handling.',
    project: 'Backend API', channel: '#code-review', read: false, archived: false, snoozedUntil: null,
    starred: true, actionUrl: '/pr/342', createdAt: Date.now() - 300000, reactions: [{ emoji: '👍', users: ['u2'] }],
  },
  {
    id: 'n2', type: 'comment', priority: 'medium', fromUser: 'u2', title: 'Commented on your design spec',
    body: 'The new dashboard layout looks great! I have a few suggestions for the mobile breakpoints though.',
    project: 'Dashboard Redesign', channel: '#design', read: false, archived: false, snoozedUntil: null,
    starred: false, actionUrl: '/docs/design-spec', createdAt: Date.now() - 900000, reactions: [],
  },
  {
    id: 'n3', type: 'assignment', priority: 'high', fromUser: 'u4', title: 'Assigned you to PROJ-128',
    body: 'Implement real-time notification system with WebSocket support. Due by end of sprint.',
    project: 'Backend API', channel: '#tasks', read: false, archived: false, snoozedUntil: null,
    starred: false, actionUrl: '/task/PROJ-128', createdAt: Date.now() - 1800000, reactions: [{ emoji: '🚀', users: ['u1', 'u3'] }],
  },
  {
    id: 'n4', type: 'alert', priority: 'critical', fromUser: 'u6', title: 'Build failed on main branch',
    body: 'CI pipeline failed: 3 test suites failing after merge of PR #340. Immediate attention required.',
    project: 'Backend API', channel: '#ci-cd', read: false, archived: false, snoozedUntil: null,
    starred: true, actionUrl: '/ci/build/5678', createdAt: Date.now() - 2400000, reactions: [],
  },
  {
    id: 'n5', type: 'invite', priority: 'medium', fromUser: 'u3', title: 'Invited you to "ML Pipeline Review"',
    body: 'Meeting scheduled for tomorrow at 2pm. We will review the new feature extraction pipeline.',
    project: 'ML Platform', channel: '#meetings', read: true, archived: false, snoozedUntil: null,
    starred: false, actionUrl: '/calendar/meeting/89', createdAt: Date.now() - 3600000, reactions: [],
  },
  {
    id: 'n6', type: 'system', priority: 'low', fromUser: 'u6', title: 'Weekly digest ready',
    body: 'Your weekly activity summary is available. You completed 12 tasks and reviewed 5 PRs this week.',
    project: null, channel: '#general', read: true, archived: false, snoozedUntil: null,
    starred: false, actionUrl: '/digest/weekly', createdAt: Date.now() - 7200000, reactions: [],
  },
  {
    id: 'n7', type: 'mention', priority: 'medium', fromUser: 'u5', title: 'Mentioned you in test report',
    body: 'Found a regression in the checkout flow after the latest deploy. Tagging you since you own that module.',
    project: 'E-Commerce App', channel: '#qa', read: false, archived: false, snoozedUntil: null,
    starred: false, actionUrl: '/report/qa-456', createdAt: Date.now() - 10800000, reactions: [{ emoji: '👀', users: ['u4'] }],
  },
  {
    id: 'n8', type: 'comment', priority: 'low', fromUser: 'u1', title: 'Replied to your thread',
    body: 'Good point about the caching strategy. I think we should benchmark both approaches before deciding.',
    project: 'Backend API', channel: '#architecture', read: true, archived: false, snoozedUntil: null,
    starred: false, actionUrl: '/thread/arch-12', createdAt: Date.now() - 14400000, reactions: [],
  },
  {
    id: 'n9', type: 'assignment', priority: 'low', fromUser: 'u4', title: 'Reassigned PROJ-115 to you',
    body: 'The original assignee is on PTO. This is a documentation task for the new API endpoints.',
    project: 'Backend API', channel: '#tasks', read: true, archived: false, snoozedUntil: null,
    starred: false, actionUrl: '/task/PROJ-115', createdAt: Date.now() - 43200000, reactions: [],
  },
  {
    id: 'n10', type: 'alert', priority: 'high', fromUser: 'u6', title: 'High memory usage detected',
    body: 'Production server mem-02 is at 92% memory usage. Auto-scaling has been triggered.',
    project: null, channel: '#ops-alerts', read: true, archived: true, snoozedUntil: null,
    starred: false, actionUrl: '/monitoring/mem-02', createdAt: Date.now() - 86400000, reactions: [],
  },
  {
    id: 'n11', type: 'invite', priority: 'low', fromUser: 'u2', title: 'Invited you to "Design Sync"',
    body: 'Recurring weekly design sync. This week we are covering the new onboarding flow.',
    project: 'Dashboard Redesign', channel: '#design', read: true, archived: false, snoozedUntil: null,
    starred: false, actionUrl: '/calendar/meeting/90', createdAt: Date.now() - 172800000, reactions: [],
  },
  {
    id: 'n12', type: 'system', priority: 'low', fromUser: 'u6', title: 'Password expiring soon',
    body: 'Your password will expire in 7 days. Please update it to maintain access.',
    project: null, channel: null, read: false, archived: false,
    snoozedUntil: Date.now() + 86400000 * 3,
    starred: false, actionUrl: '/settings/security', createdAt: Date.now() - 259200000, reactions: [],
  },
];

const ACTIVITY_FEED = [
  { id: 'a1', userId: 'u1', action: 'merged', target: 'PR #340', project: 'Backend API', timestamp: Date.now() - 600000 },
  { id: 'a2', userId: 'u2', action: 'uploaded', target: '3 design files', project: 'Dashboard Redesign', timestamp: Date.now() - 1200000 },
  { id: 'a3', userId: 'u3', action: 'completed', target: 'PROJ-122', project: 'ML Platform', timestamp: Date.now() - 3600000 },
  { id: 'a4', userId: 'u4', action: 'created', target: 'Sprint 24 backlog', project: 'Backend API', timestamp: Date.now() - 7200000 },
  { id: 'a5', userId: 'u5', action: 'filed', target: 'Bug #567', project: 'E-Commerce App', timestamp: Date.now() - 10800000 },
  { id: 'a6', userId: 'u1', action: 'deployed', target: 'v2.3.1', project: 'Backend API', timestamp: Date.now() - 14400000 },
  { id: 'a7', userId: 'u6', action: 'scheduled', target: 'Maintenance window', project: null, timestamp: Date.now() - 28800000 },
  { id: 'a8', userId: 'u3', action: 'published', target: 'Model v3 results', project: 'ML Platform', timestamp: Date.now() - 43200000 },
];

const DEFAULT_PREFERENCES = {
  mention: { enabled: true, sound: true, desktop: true },
  comment: { enabled: true, sound: false, desktop: true },
  assignment: { enabled: true, sound: true, desktop: true },
  system: { enabled: true, sound: false, desktop: false },
  alert: { enabled: true, sound: true, desktop: true },
  invite: { enabled: true, sound: false, desktop: true },
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [snoozeModalId, setSnoozeModalId] = useState(null);
  const [snoozeDuration, setSnoozeDuration] = useState('1h');
  const [activityFeed, setActivityFeed] = useState(ACTIVITY_FEED);
  const [showActivityDetail, setShowActivityDetail] = useState(null);
  const [composeMode, setComposeMode] = useState(false);
  const [composeData, setComposeData] = useState({ type: 'mention', priority: 'medium', toUser: '', title: '', body: '' });
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('notifCenterTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedPrefs = localStorage.getItem('notifPreferences');
    if (savedPrefs) {
      try { setPreferences(JSON.parse(savedPrefs)); } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notifPreferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNotification(null);
        setShowPreferences(false);
        setSnoozeModalId(null);
        setShowActivityDetail(null);
        setComposeMode(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && activeTab === 'inbox') {
        e.preventDefault();
        const visibleIds = filteredNotifications.map(n => n.id);
        setSelectedIds(prev =>
          prev.length === visibleIds.length ? [] : visibleIds
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('notifCenterTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const getUser = (id) => MOCK_USERS.find(u => u.id === id);

  const markAsRead = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    if (selectedNotification?.id === notifId) {
      setSelectedNotification(prev => prev ? { ...prev, read: true } : null);
    }
  }, [selectedNotification]);

  const markAsUnread = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: false } : n));
  }, []);

  const toggleStar = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, starred: !n.starred } : n));
    if (selectedNotification?.id === notifId) {
      setSelectedNotification(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  }, [selectedNotification]);

  const archiveNotification = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, archived: true, read: true } : n));
    if (selectedNotification?.id === notifId) {
      setSelectedNotification(null);
    }
  }, [selectedNotification]);

  const unarchiveNotification = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, archived: false } : n));
  }, []);

  const deleteNotification = useCallback((notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    if (selectedNotification?.id === notifId) {
      setSelectedNotification(null);
    }
  }, [selectedNotification]);

  const snoozeNotification = useCallback((notifId, duration) => {
    const durationMs = {
      '1h': 3600000,
      '4h': 14400000,
      '1d': 86400000,
      '3d': 259200000,
    }[duration] || 3600000;
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, snoozedUntil: Date.now() + durationMs, read: true } : n
    ));
    setSnoozeModalId(null);
  }, []);

  const unsnoozeNotification = useCallback((notifId) => {
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, snoozedUntil: null } : n
    ));
  }, []);

  const addReaction = useCallback((notifId, emoji) => {
    setNotifications(prev => prev.map(n => {
      if (n.id !== notifId) return n;
      const existingReaction = n.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (existingReaction.users.includes('me')) {
          return {
            ...n,
            reactions: n.reactions.map(r =>
              r.emoji === emoji ? { ...r, users: r.users.filter(u => u !== 'me') } : r
            ).filter(r => r.users.length > 0),
          };
        }
        return {
          ...n,
          reactions: n.reactions.map(r =>
            r.emoji === emoji ? { ...r, users: [...r.users, 'me'] } : r
          ),
        };
      }
      return { ...n, reactions: [...n.reactions, { emoji, users: ['me'] }] };
    }));
  }, []);

  // Bulk actions
  const bulkMarkRead = useCallback(() => {
    setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, read: true } : n));
    setSelectedIds([]);
    setShowBulkActions(false);
  }, [selectedIds]);

  const bulkArchive = useCallback(() => {
    setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, archived: true, read: true } : n));
    setSelectedIds([]);
    setShowBulkActions(false);
  }, [selectedIds]);

  const bulkDelete = useCallback(() => {
    if (window.confirm(`Delete ${selectedIds.length} notifications?`)) {
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setShowBulkActions(false);
    }
  }, [selectedIds]);

  const toggleSelectNotification = useCallback((notifId) => {
    setSelectedIds(prev =>
      prev.includes(notifId) ? prev.filter(id => id !== notifId) : [...prev, notifId]
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const sendNotification = useCallback(() => {
    if (!composeData.title.trim() || !composeData.toUser) return;
    const newNotif = {
      id: Date.now().toString(),
      type: composeData.type,
      priority: composeData.priority,
      fromUser: 'u1',
      title: composeData.title,
      body: composeData.body,
      project: null,
      channel: null,
      read: true,
      archived: false,
      snoozedUntil: null,
      starred: false,
      actionUrl: null,
      createdAt: Date.now(),
      reactions: [],
    };
    setNotifications(prev => [newNotif, ...prev]);
    setComposeMode(false);
    setComposeData({ type: 'mention', priority: 'medium', toUser: '', title: '', body: '' });
  }, [composeData]);

  const updatePreference = useCallback((type, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  }, []);

  // Derived data
  const unreadCount = useMemo(() =>
    notifications.filter(n => !n.read && !n.archived && (!n.snoozedUntil || n.snoozedUntil <= Date.now())).length
  , [notifications]);

  const starredCount = useMemo(() =>
    notifications.filter(n => n.starred && !n.archived).length
  , [notifications]);

  const archivedCount = useMemo(() =>
    notifications.filter(n => n.archived).length
  , [notifications]);

  const snoozedCount = useMemo(() =>
    notifications.filter(n => n.snoozedUntil && n.snoozedUntil > Date.now() && !n.archived).length
  , [notifications]);

  const projects = useMemo(() => {
    const set = new Set(notifications.map(n => n.project).filter(Boolean));
    return Array.from(set).sort();
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let list = notifications;

    // Tab filtering
    if (activeTab === 'inbox') {
      list = list.filter(n => !n.archived && (!n.snoozedUntil || n.snoozedUntil <= Date.now()));
    } else if (activeTab === 'starred') {
      list = list.filter(n => n.starred && !n.archived);
    } else if (activeTab === 'archived') {
      list = list.filter(n => n.archived);
    } else if (activeTab === 'snoozed') {
      list = list.filter(n => n.snoozedUntil && n.snoozedUntil > Date.now() && !n.archived);
    }

    // Filters
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n => {
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchBody = n.body.toLowerCase().includes(q);
        const matchProject = n.project?.toLowerCase().includes(q);
        const matchUser = getUser(n.fromUser)?.name.toLowerCase().includes(q);
        return matchTitle || matchBody || matchProject || matchUser;
      });
    }
    if (filterType !== 'all') list = list.filter(n => n.type === filterType);
    if (filterPriority !== 'all') list = list.filter(n => n.priority === filterPriority);
    if (filterProject !== 'all') list = list.filter(n => n.project === filterProject);
    if (showUnreadOnly) list = list.filter(n => !n.read);

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'priority') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return 0;
    });

    return list;
  }, [notifications, activeTab, searchQuery, filterType, filterPriority, filterProject, showUnreadOnly, sortBy]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach(n => {
      const date = new Date(n.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label;
      if (date.toDateString() === today.toDateString()) label = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday';
      else label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatSnoozeTime = (timestamp) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'expired';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const bgColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const secondaryText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#6366f1';
  const dangerColor = '#ef4444';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', backgroundColor: cardBg, borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>🔔 Notifications</h1>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} aria-label="Toggle theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'inbox', icon: '📥', label: 'Inbox', count: unreadCount },
            { id: 'starred', icon: '⭐', label: 'Starred', count: starredCount },
            { id: 'snoozed', icon: '⏰', label: 'Snoozed', count: snoozedCount },
            { id: 'archived', icon: '🗄️', label: 'Archived', count: archivedCount },
            { id: 'activity', icon: '📊', label: 'Activity Feed', count: null },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedNotification(null);
                setSelectedIds([]);
                setShowBulkActions(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
                marginBottom: '2px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                backgroundColor: activeTab === item.id ? (isDarkMode ? '#334155' : '#eef2ff') : 'transparent',
                color: activeTab === item.id ? accentColor : textColor, fontWeight: activeTab === item.id ? 600 : 400,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span style={{
                  fontSize: '11px', padding: '2px 7px', borderRadius: '10px', fontWeight: 600,
                  backgroundColor: item.id === 'inbox' ? accentColor : (isDarkMode ? '#334155' : '#e2e8f0'),
                  color: item.id === 'inbox' ? '#fff' : secondaryText,
                }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${borderColor}` }}>
          <button
            onClick={() => setComposeMode(true)}
            style={{
              width: '100%', padding: '10px', backgroundColor: accentColor, color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            }}
          >
            ✏️ Compose
          </button>
          <button
            onClick={() => setShowPreferences(true)}
            style={{
              width: '100%', padding: '8px', backgroundColor: 'transparent', color: secondaryText,
              border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '6px',
            }}
            aria-label="Open preferences"
          >
            ⚙️ Preferences
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header Bar */}
        <header style={{ padding: '10px 20px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search notifications... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 30px', border: `1px solid ${borderColor}`,
                borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                color: textColor, outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px' }}>🔍</span>
          </div>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} aria-label="Filter by type"
            style={{ padding: '7px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}>
            <option value="all">All Types</option>
            {NOTIFICATION_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} aria-label="Filter by priority"
            style={{ padding: '7px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}>
            <option value="all">All Priorities</option>
            {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>

          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} aria-label="Filter by project"
            style={{ padding: '7px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}>
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: secondaryText, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={showUnreadOnly} onChange={(e) => setShowUnreadOnly(e.target.checked)} />
            Unread only
          </label>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort notifications"
            style={{ padding: '7px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
          </select>

          {activeTab === 'inbox' && unreadCount > 0 && (
            <button onClick={markAllRead}
              style={{ padding: '7px 12px', fontSize: '12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: accentColor, whiteSpace: 'nowrap' }}>
              Mark all read
            </button>
          )}
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Notification List / Activity Feed */}
          {activeTab !== 'activity' ? (
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* List Panel */}
              <div style={{ width: selectedNotification ? '380px' : '100%', borderRight: selectedNotification ? `1px solid ${borderColor}` : 'none', overflow: 'auto', flexShrink: 0 }}>
                {/* Bulk Action Bar */}
                {selectedIds.length > 0 && (
                  <div style={{ padding: '8px 16px', backgroundColor: isDarkMode ? '#1a2332' : '#eef2ff', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{selectedIds.length} selected</span>
                    <button onClick={bulkMarkRead} style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: cardBg, color: textColor, fontSize: '12px' }}>
                      Mark Read
                    </button>
                    <button onClick={bulkArchive} style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: cardBg, color: textColor, fontSize: '12px' }}>
                      Archive
                    </button>
                    <button onClick={bulkDelete} style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: cardBg, color: dangerColor, fontSize: '12px' }}>
                      Delete
                    </button>
                    <button onClick={() => setSelectedIds([])} style={{ padding: '4px 8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: secondaryText, fontSize: '12px' }}>
                      Clear
                    </button>
                  </div>
                )}

                {filteredNotifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                      {activeTab === 'inbox' ? '📭' : activeTab === 'starred' ? '⭐' : activeTab === 'snoozed' ? '⏰' : '🗄️'}
                    </div>
                    <p style={{ fontSize: '15px', margin: 0 }}>
                      {activeTab === 'inbox' ? 'All caught up!' : `No ${activeTab} notifications`}
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedNotifications).map(([dateLabel, notifs]) => (
                    <div key={dateLabel}>
                      <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: secondaryText, textTransform: 'uppercase', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderBottom: `1px solid ${borderColor}` }}>
                        {dateLabel}
                      </div>
                      {notifs.map(notif => {
                        const user = getUser(notif.fromUser);
                        const isSelected = selectedIds.includes(notif.id);
                        const isActive = selectedNotification?.id === notif.id;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setSelectedNotification(notif);
                              if (!notif.read) markAsRead(notif.id);
                            }}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px',
                              borderBottom: `1px solid ${borderColor}`, cursor: 'pointer',
                              backgroundColor: isActive ? (isDarkMode ? '#1a2332' : '#eef2ff') : !notif.read ? (isDarkMode ? '#162032' : '#f0f7ff') : 'transparent',
                              borderLeft: `3px solid ${!notif.read ? accentColor : 'transparent'}`,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => { e.stopPropagation(); toggleSelectNotification(notif.id); }}
                              onClick={(e) => e.stopPropagation()}
                              style={{ marginTop: '4px', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                <span style={{ fontSize: '13px' }}>{NOTIFICATION_ICONS[notif.type]}</span>
                                <span style={{
                                  fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 600,
                                  backgroundColor: PRIORITY_COLORS[notif.priority] + '20',
                                  color: PRIORITY_COLORS[notif.priority],
                                }}>
                                  {notif.priority}
                                </span>
                                <span style={{ fontSize: '12px', color: secondaryText }}>{user?.name}</span>
                                <span style={{ fontSize: '11px', color: secondaryText, marginLeft: 'auto', whiteSpace: 'nowrap' }}>{formatTimeAgo(notif.createdAt)}</span>
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: notif.read ? 400 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {notif.title}
                              </div>
                              <div style={{ fontSize: '12px', color: secondaryText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                                {notif.body}
                              </div>
                              {notif.project && (
                                <span style={{ display: 'inline-block', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', backgroundColor: isDarkMode ? '#334155' : '#e0e7ff', color: accentColor, marginTop: '4px' }}>
                                  {notif.project}
                                </span>
                              )}
                            </div>
                            {notif.starred && <span style={{ fontSize: '14px', flexShrink: 0 }}>⭐</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Detail Panel */}
              {selectedNotification && (
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{NOTIFICATION_ICONS[selectedNotification.type]}</span>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600,
                      backgroundColor: PRIORITY_COLORS[selectedNotification.priority] + '20',
                      color: PRIORITY_COLORS[selectedNotification.priority],
                    }}>
                      {selectedNotification.priority}
                    </span>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                      backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', color: secondaryText,
                    }}>
                      {selectedNotification.type}
                    </span>
                    {selectedNotification.project && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: isDarkMode ? '#334155' : '#e0e7ff', color: accentColor }}>
                        {selectedNotification.project}
                      </span>
                    )}
                    {selectedNotification.channel && (
                      <span style={{ fontSize: '11px', color: secondaryText }}>{selectedNotification.channel}</span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 12px' }}>{selectedNotification.title}</h2>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '13px' }}>
                    <span style={{ fontSize: '20px' }}>{getUser(selectedNotification.fromUser)?.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{getUser(selectedNotification.fromUser)?.name}</div>
                      <div style={{ fontSize: '12px', color: secondaryText }}>{getUser(selectedNotification.fromUser)?.role} · {formatTimeAgo(selectedNotification.createdAt)}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '20px', padding: '16px', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    {selectedNotification.body}
                  </div>

                  {/* Reactions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {selectedNotification.reactions.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => addReaction(selectedNotification.id, r.emoji)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px',
                          border: `1px solid ${r.users.includes('me') ? accentColor : borderColor}`,
                          borderRadius: '12px', cursor: 'pointer', fontSize: '12px',
                          backgroundColor: r.users.includes('me') ? (isDarkMode ? '#1e1b4b' : '#eef2ff') : 'transparent',
                          color: textColor,
                        }}
                      >
                        {r.emoji} {r.users.length}
                      </button>
                    ))}
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {['👍', '👀', '🎉', '❤️', '🚀'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(selectedNotification.id, emoji)}
                          style={{ padding: '4px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', backgroundColor: 'transparent' }}
                          aria-label={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
                    <button
                      onClick={() => toggleStar(selectedNotification.id)}
                      style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: selectedNotification.starred ? '#fef3c7' : 'transparent', color: textColor }}
                    >
                      {selectedNotification.starred ? '⭐ Unstar' : '☆ Star'}
                    </button>
                    <button
                      onClick={() => selectedNotification.read ? markAsUnread(selectedNotification.id) : markAsRead(selectedNotification.id)}
                      style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}
                    >
                      {selectedNotification.read ? '📩 Mark Unread' : '📭 Mark Read'}
                    </button>
                    <button
                      onClick={() => setSnoozeModalId(selectedNotification.id)}
                      style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}
                    >
                      ⏰ Snooze
                    </button>
                    <button
                      onClick={() => archiveNotification(selectedNotification.id)}
                      style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}
                    >
                      🗄️ Archive
                    </button>
                    <button
                      onClick={() => deleteNotification(selectedNotification.id)}
                      style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: dangerColor }}
                    >
                      🗑️ Delete
                    </button>
                    {selectedNotification.actionUrl && (
                      <button
                        onClick={() => window.open(selectedNotification.actionUrl)}
                        style={{ padding: '8px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Open →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Activity Feed View */
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Activity Feed</h2>

              {/* Activity Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Notifications', value: notifications.length, icon: '🔔', color: accentColor },
                  { label: 'Unread', value: unreadCount, icon: '📬', color: '#f97316' },
                  { label: 'Team Activities', value: activityFeed.length, icon: '👥', color: '#22c55e' },
                  { label: 'Starred', value: starredCount, icon: '⭐', color: '#eab308' },
                ].map(stat => (
                  <div key={stat.label} style={{ backgroundColor: cardBg, borderRadius: '10px', padding: '16px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                      <span style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: secondaryText }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Priority Distribution */}
              <div style={{ backgroundColor: cardBg, borderRadius: '10px', padding: '16px', border: `1px solid ${borderColor}`, marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Priority Distribution</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {PRIORITY_LEVELS.map(p => {
                    const count = notifications.filter(n => n.priority === p && !n.archived).length;
                    return (
                      <div key={p} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: PRIORITY_COLORS[p] }}>{count}</div>
                        <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'capitalize' }}>{p}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div style={{ backgroundColor: cardBg, borderRadius: '10px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', fontWeight: 600, fontSize: '15px', borderBottom: `1px solid ${borderColor}` }}>
                  Recent Team Activity
                </div>
                {activityFeed.map((activity, index) => {
                  const user = getUser(activity.userId);
                  return (
                    <div
                      key={activity.id}
                      onClick={() => setShowActivityDetail(activity.id === showActivityDetail ? null : activity.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        borderBottom: index < activityFeed.length - 1 ? `1px solid ${borderColor}` : 'none',
                        cursor: 'pointer', backgroundColor: showActivityDetail === activity.id ? (isDarkMode ? '#1a2332' : '#f0f7ff') : 'transparent',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{user?.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px' }}>
                          <strong>{user?.name}</strong>{' '}<span style={{ color: secondaryText }}>{activity.action}</span>{' '}<strong>{activity.target}</strong>
                        </div>
                        {activity.project && (
                          <span style={{ fontSize: '11px', color: accentColor }}>{activity.project}</span>
                        )}
                        {showActivityDetail === activity.id && (
                          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '6px', fontSize: '12px', color: secondaryText }}>
                            <div>User: {user?.name} ({user?.role})</div>
                            <div>Action: {activity.action} {activity.target}</div>
                            {activity.project && <div>Project: {activity.project}</div>}
                            <div>Time: {new Date(activity.timestamp).toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: secondaryText, whiteSpace: 'nowrap' }}>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Snooze Modal */}
      {snoozeModalId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}
          onClick={() => setSnoozeModalId(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '12px', width: '100%', maxWidth: '360px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>⏰ Snooze Notification</h3>
              <button onClick={() => setSnoozeModalId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: secondaryText }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { value: '1h', label: '1 hour' },
                { value: '4h', label: '4 hours' },
                { value: '1d', label: '1 day' },
                { value: '3d', label: '3 days' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSnoozeDuration(opt.value)}
                  style={{
                    padding: '10px 16px', border: `1px solid ${snoozeDuration === opt.value ? accentColor : borderColor}`,
                    borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left',
                    backgroundColor: snoozeDuration === opt.value ? (isDarkMode ? '#1e1b4b' : '#eef2ff') : 'transparent',
                    color: snoozeDuration === opt.value ? accentColor : textColor, fontWeight: snoozeDuration === opt.value ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setSnoozeModalId(null)}
                style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={() => snoozeNotification(snoozeModalId, snoozeDuration)}
                style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Snooze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}
          onClick={() => setShowPreferences(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>⚙️ Notification Preferences</h3>
              <button onClick={() => setShowPreferences(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: secondaryText, fontWeight: 600 }}>Type</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: secondaryText, fontWeight: 600 }}>Enabled</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: secondaryText, fontWeight: 600 }}>Sound</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: secondaryText, fontWeight: 600 }}>Desktop</th>
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_TYPES.map(type => (
                  <tr key={type} style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{NOTIFICATION_ICONS[type]}</span>
                      <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <input type="checkbox" checked={preferences[type]?.enabled ?? true}
                        onChange={(e) => updatePreference(type, 'enabled', e.target.checked)}
                        aria-label={`Enable ${type} notifications`} />
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <input type="checkbox" checked={preferences[type]?.sound ?? false}
                        onChange={(e) => updatePreference(type, 'sound', e.target.checked)}
                        aria-label={`${type} sound`} />
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <input type="checkbox" checked={preferences[type]?.desktop ?? false}
                        onChange={(e) => updatePreference(type, 'desktop', e.target.checked)}
                        aria-label={`${type} desktop notifications`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPreferences(false)}
                style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {composeMode && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}
          onClick={() => setComposeMode(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>✏️ Compose Notification</h3>
              <button onClick={() => setComposeMode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>To</label>
                <select value={composeData.toUser}
                  onChange={(e) => setComposeData(prev => ({ ...prev, toUser: e.target.value }))}
                  aria-label="Select recipient"
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                  <option value="">Select recipient...</option>
                  {MOCK_USERS.filter(u => u.id !== 'u6').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Type</label>
                  <select value={composeData.type}
                    onChange={(e) => setComposeData(prev => ({ ...prev, type: e.target.value }))}
                    aria-label="Notification type"
                    style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {NOTIFICATION_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Priority</label>
                  <select value={composeData.priority}
                    onChange={(e) => setComposeData(prev => ({ ...prev, priority: e.target.value }))}
                    aria-label="Notification priority"
                    style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Title</label>
                <input type="text" value={composeData.title}
                  onChange={(e) => setComposeData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title..."
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Body</label>
                <textarea value={composeData.body}
                  onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Notification details..."
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setComposeMode(false)}
                style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={sendNotification}
                style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
