import { useState, useEffect, useRef, useCallback } from 'react';

const PRIORITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const STATUS_COLUMNS = ['backlog', 'todo', 'in_progress', 'review', 'done'];
const STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done',
};

const CATEGORIES = ['feature', 'bug', 'improvement', 'documentation', 'devops'];

const MOCK_TEAM = [
  { id: 't1', name: 'Alice Chen', email: 'alice@example.com', role: 'Lead Engineer', avatar: '👩‍💻', department: 'Engineering', active: true },
  { id: 't2', name: 'Bob Martinez', email: 'bob@example.com', role: 'Designer', avatar: '👨‍🎨', department: 'Design', active: true },
  { id: 't3', name: 'Carol Williams', email: 'carol@example.com', role: 'PM', avatar: '👩‍💼', department: 'Product', active: true },
  { id: 't4', name: 'Dave Johnson', email: 'dave@example.com', role: 'Backend Dev', avatar: '👨‍💻', department: 'Engineering', active: false },
  { id: 't5', name: 'Eve Park', email: 'eve@example.com', role: 'QA Engineer', avatar: '👩‍🔬', department: 'Engineering', active: true },
  { id: 't6', name: 'Frank Lee', email: 'frank@example.com', role: 'DevOps', avatar: '👨‍🔧', department: 'Infrastructure', active: true },
  { id: 't7', name: 'Grace Kim', email: 'grace@example.com', role: 'Frontend Dev', avatar: '👩‍💻', department: 'Engineering', active: true },
  { id: 't8', name: 'Henry Zhao', email: 'henry@example.com', role: 'Data Engineer', avatar: '👨‍💻', department: 'Data', active: true },
];

const INITIAL_TASKS = [
  { id: '1', title: 'Implement user authentication', description: 'Add OAuth2 login flow with Google and GitHub providers. Must support session persistence and token refresh.', status: 'done', priority: 'critical', assignee: 't1', category: 'feature', createdAt: Date.now() - 86400000 * 14, dueDate: Date.now() - 86400000 * 7, tags: ['auth', 'security'], subtasks: [{ id: 's1', text: 'Google OAuth setup', done: true }, { id: 's2', text: 'GitHub OAuth setup', done: true }, { id: 's3', text: 'Session management', done: true }], comments: [{ id: 'c1', author: 't3', text: 'This is top priority for the release', timestamp: Date.now() - 86400000 * 13 }], timeEstimate: 16, timeSpent: 14 },
  { id: '2', title: 'Design dashboard layout', description: 'Create responsive dashboard layout with sidebar navigation, header with notifications, and main content area with card grid.', status: 'done', priority: 'high', assignee: 't2', category: 'feature', createdAt: Date.now() - 86400000 * 12, dueDate: Date.now() - 86400000 * 5, tags: ['ui', 'design'], subtasks: [{ id: 's4', text: 'Wireframes', done: true }, { id: 's5', text: 'High fidelity mockups', done: true }], comments: [], timeEstimate: 8, timeSpent: 10 },
  { id: '3', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated testing, linting, and deployment to staging and production environments.', status: 'review', priority: 'high', assignee: 't6', category: 'devops', createdAt: Date.now() - 86400000 * 10, dueDate: Date.now() - 86400000 * 2, tags: ['ci', 'devops', 'automation'], subtasks: [{ id: 's6', text: 'Test pipeline', done: true }, { id: 's7', text: 'Staging deploy', done: true }, { id: 's8', text: 'Prod deploy', done: false }], comments: [{ id: 'c2', author: 't1', text: 'Can we add Slack notifications?', timestamp: Date.now() - 86400000 * 3 }], timeEstimate: 12, timeSpent: 10 },
  { id: '4', title: 'Fix pagination bug on mobile', description: 'Users report that pagination controls overlap with content on screens smaller than 375px. The issue appears on both iOS Safari and Chrome mobile.', status: 'in_progress', priority: 'critical', assignee: 't7', category: 'bug', createdAt: Date.now() - 86400000 * 5, dueDate: Date.now() + 86400000 * 1, tags: ['bug', 'mobile', 'responsive'], subtasks: [{ id: 's9', text: 'Reproduce on iOS', done: true }, { id: 's10', text: 'Fix CSS overflow', done: false }], comments: [{ id: 'c3', author: 't5', text: 'Reproduced on iPhone 13, attaching screenshots', timestamp: Date.now() - 86400000 * 4 }, { id: 'c4', author: 't7', text: 'Working on a flex-based fix', timestamp: Date.now() - 86400000 * 2 }], timeEstimate: 4, timeSpent: 3 },
  { id: '5', title: 'Write API documentation', description: 'Document all REST API endpoints including request/response schemas, authentication requirements, rate limits, and example curl commands.', status: 'todo', priority: 'medium', assignee: 't3', category: 'documentation', createdAt: Date.now() - 86400000 * 8, dueDate: Date.now() + 86400000 * 5, tags: ['docs', 'api'], subtasks: [{ id: 's11', text: 'Auth endpoints', done: false }, { id: 's12', text: 'User endpoints', done: false }, { id: 's13', text: 'Project endpoints', done: false }], comments: [], timeEstimate: 6, timeSpent: 0 },
  { id: '6', title: 'Optimize database queries', description: 'Profile slow queries identified in production monitoring. Focus on N+1 queries in the task listing and user dashboard views.', status: 'in_progress', priority: 'high', assignee: 't4', category: 'improvement', createdAt: Date.now() - 86400000 * 6, dueDate: Date.now() + 86400000 * 3, tags: ['performance', 'database'], subtasks: [{ id: 's14', text: 'Profile slow queries', done: true }, { id: 's15', text: 'Add indexes', done: true }, { id: 's16', text: 'Optimize N+1', done: false }], comments: [{ id: 'c5', author: 't8', text: 'I can help with the query analysis', timestamp: Date.now() - 86400000 * 4 }], timeEstimate: 10, timeSpent: 6 },
  { id: '7', title: 'Add dark mode support', description: 'Implement system-preference-aware dark mode with manual toggle. All components should respect the current theme.', status: 'backlog', priority: 'low', assignee: null, category: 'feature', createdAt: Date.now() - 86400000 * 3, dueDate: null, tags: ['ui', 'theme'], subtasks: [], comments: [], timeEstimate: 8, timeSpent: 0 },
  { id: '8', title: 'Implement real-time notifications', description: 'Add WebSocket-based notification system for task assignments, mentions, and status changes. Include desktop notifications with user permission.', status: 'backlog', priority: 'medium', assignee: null, category: 'feature', createdAt: Date.now() - 86400000 * 2, dueDate: null, tags: ['notifications', 'websocket', 'realtime'], subtasks: [{ id: 's17', text: 'WebSocket server setup', done: false }, { id: 's18', text: 'Client integration', done: false }, { id: 's19', text: 'Desktop notifications', done: false }], comments: [], timeEstimate: 16, timeSpent: 0 },
  { id: '9', title: 'Migrate to TypeScript', description: 'Migrate codebase from JS to TS starting with utilities.', status: 'todo', priority: 'medium', assignee: 't1', category: 'improvement', createdAt: Date.now() - 86400000 * 4, dueDate: Date.now() + 86400000 * 14, tags: ['typescript', 'refactor'], subtasks: [{ id: 's20', text: 'Setup tsconfig', done: false }, { id: 's21', text: 'Migrate utilities', done: false }], comments: [], timeEstimate: 24, timeSpent: 0 },
  { id: '10', title: 'Add export to CSV feature', description: 'Export task data as CSV with column selection.', status: 'todo', priority: 'low', assignee: 't7', category: 'feature', createdAt: Date.now() - 86400000 * 1, dueDate: Date.now() + 86400000 * 10, tags: ['export', 'data'], subtasks: [], comments: [], timeEstimate: 4, timeSpent: 0 },
];

const ACTIVITY_LOG = [
  { id: 'a1', user: 't1', action: 'completed', target: 'Implement user authentication', timestamp: Date.now() - 86400000 * 7 },
  { id: 'a2', user: 't2', action: 'completed', target: 'Design dashboard layout', timestamp: Date.now() - 86400000 * 5 },
  { id: 'a3', user: 't6', action: 'moved to review', target: 'Setup CI/CD pipeline', timestamp: Date.now() - 86400000 * 3 },
  { id: 'a4', user: 't7', action: 'started', target: 'Fix pagination bug on mobile', timestamp: Date.now() - 86400000 * 2 },
  { id: 'a5', user: 't5', action: 'commented on', target: 'Fix pagination bug on mobile', timestamp: Date.now() - 86400000 * 4 },
  { id: 'a6', user: 't3', action: 'created', target: 'Write API documentation', timestamp: Date.now() - 86400000 * 8 },
  { id: 'a7', user: 't8', action: 'commented on', target: 'Optimize database queries', timestamp: Date.now() - 86400000 * 4 },
  { id: 'a8', user: 't5', action: 'started', target: 'Improve test coverage', timestamp: Date.now() - 86400000 * 5 },
];

export default function ProjectDashboard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeView, setActiveView] = useState('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [projectSettings, setProjectSettings] = useState({
    name: 'Project Alpha',
    description: 'Main product development project for Q1 2025',
    sprintLength: 14,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    autoAssign: false,
    emailNotifications: true,
    slackIntegration: false,
    githubIntegration: true,
  });
  const [bulkSelection, setBulkSelection] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState('week');
  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboardTheme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    const savedTasks = localStorage.getItem('dashboardTasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse saved tasks');
      }
    }

    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      try {
        setProjectSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings');
      }
    }

    const savedView = localStorage.getItem('dashboardView');
    if (savedView) {
      setActiveView(savedView);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dashboardSettings', JSON.stringify(projectSettings));
  }, [projectSettings]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedTask(null);
        setShowCreateModal(false);
        setShowSettingsPanel(false);
        setShowTeamPanel(false);
        setShowNotifications(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowCreateModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    const newNotif = { id: Date.now().toString(), message, type, timestamp: Date.now(), read: false };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('dashboardTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchTags = task.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (filterAssignee !== 'all' && task.assignee !== filterAssignee) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'created') cmp = a.createdAt - b.createdAt;
    else if (sortBy === 'priority') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      cmp = order[a.priority] - order[b.priority];
    } else if (sortBy === 'dueDate') {
      cmp = (a.dueDate || Infinity) - (b.dueDate || Infinity);
    } else if (sortBy === 'title') {
      cmp = a.title.localeCompare(b.title);
    }
    return sortDirection === 'desc' ? -cmp : cmp;
  });

  const createTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: Date.now(),
      subtasks: [],
      comments: [],
      tags: taskData.tags ? taskData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      timeEstimate: parseInt(taskData.timeEstimate) || 0,
      timeSpent: 0,
    };
    setTasks(prev => [...prev, newTask]);
    setShowCreateModal(false);
    addNotification(`Task "${newTask.title}" created`, 'success');
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const deleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const task = tasks.find(t => t.id === taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);
      addNotification(`Task "${task?.title}" deleted`, 'warning');
    }
  };

  const moveTask = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    addNotification(`Task moved to ${STATUS_LABELS[newStatus]}`, 'info');
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (status) => {
    if (draggedTask) {
      moveTask(draggedTask.id, status);
      setDraggedTask(null);
    }
  };

  const addComment = (taskId, text) => {
    if (!text.trim()) return;
    const comment = { id: Date.now().toString(), author: 't1', text, timestamp: Date.now() };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t));
    setNewComment('');
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s) };
    }));
  };

  const addSubtask = (taskId, text) => {
    if (!text.trim()) return;
    const subtask = { id: Date.now().toString(), text, done: false };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t));
  };

  const removeSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
    }));
  };

  const getTeamMember = (id) => MOCK_TEAM.find(m => m.id === id);

  const getTasksByStatus = (status) => sortedTasks.filter(t => t.status === status);

  const getOverdueTasks = () => tasks.filter(t => t.dueDate && t.dueDate < Date.now() && t.status !== 'done');

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);
  };

  const getTotalTimeEstimate = () => tasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0);
  const getTotalTimeSpent = () => tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(timestamp);
  };

  const getCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const startPad = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startPad; i++) {
      days.push({ day: null, tasks: [] });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dayStart = new Date(calendarYear, calendarMonth, d).getTime();
      const dayEnd = dayStart + 86400000;
      const dayTasks = tasks.filter(t => t.dueDate && t.dueDate >= dayStart && t.dueDate < dayEnd);
      days.push({ day: d, tasks: dayTasks, isToday: new Date().toDateString() === new Date(calendarYear, calendarMonth, d).toDateString() });
    }

    return days;
  };

  const exportTasksCSV = () => {
    const headers = ['Title', 'Status', 'Priority', 'Category', 'Assignee', 'Due Date', 'Time Estimate', 'Time Spent'];
    const rows = tasks.map(t => [
      t.title,
      STATUS_LABELS[t.status],
      t.priority,
      t.category,
      getTeamMember(t.assignee)?.name || 'Unassigned',
      formatDate(t.dueDate),
      t.timeEstimate,
      t.timeSpent,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Tasks exported to CSV', 'success');
  };

  const handleBulkStatusChange = (newStatus) => {
    setTasks(prev => prev.map(t => bulkSelection.includes(t.id) ? { ...t, status: newStatus } : t));
    addNotification(`${bulkSelection.length} tasks moved to ${STATUS_LABELS[newStatus]}`, 'info');
    setBulkSelection([]);
    setShowBulkActions(false);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${bulkSelection.length} tasks?`)) {
      setTasks(prev => prev.filter(t => !bulkSelection.includes(t.id)));
      addNotification(`${bulkSelection.length} tasks deleted`, 'warning');
      setBulkSelection([]);
      setShowBulkActions(false);
    }
  };

  const toggleBulkSelect = (taskId) => {
    setBulkSelection(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const bgColor = isDarkMode ? '#1a1a2e' : '#f5f7fa';
  const cardBg = isDarkMode ? '#16213e' : '#ffffff';
  const textColor = isDarkMode ? '#e0e0e0' : '#333333';
  const secondaryText = isDarkMode ? '#a0a0a0' : '#666666';
  const borderColor = isDarkMode ? '#2a2a4a' : '#e0e0e0';
  const accentColor = '#4f46e5';
  const hoverBg = isDarkMode ? '#1e2a4a' : '#f0f0f0';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? '60px' : '240px', backgroundColor: isDarkMode ? '#0f0f23' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? '16px 12px' : '20px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>📋 TaskBoard</h1>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText, padding: '4px' }}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'board', icon: '📊', label: 'Board View' },
            { id: 'list', icon: '📝', label: 'List View' },
            { id: 'calendar', icon: '📅', label: 'Calendar' },
            { id: 'analytics', icon: '📈', label: 'Analytics' },
            { id: 'activity', icon: '🕐', label: 'Activity' },
            { id: 'team', icon: '👥', label: 'Team' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                localStorage.setItem('dashboardView', item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: sidebarCollapsed ? '10px 12px' : '10px 12px',
                marginBottom: '4px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: activeView === item.id ? (isDarkMode ? '#1e2a4a' : '#eef2ff') : 'transparent',
                color: activeView === item.id ? accentColor : textColor,
                fontWeight: activeView === item.id ? 600 : 400,
                textAlign: 'left',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div style={{ padding: '16px', borderTop: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '8px' }}>Completion</div>
            <div style={{ background: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${getCompletionRate()}%`, height: '100%', backgroundColor: accentColor, borderRadius: '4px', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '12px', color: secondaryText, marginTop: '4px' }}>{getCompletionRate()}% complete</div>
          </div>
        )}

        <div style={{ padding: '12px 8px', borderTop: `1px solid ${borderColor}` }}>
          <button
            onClick={() => setShowSettingsPanel(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: secondaryText,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <span>⚙️</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tasks... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb',
                  color: textColor,
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filter by priority"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter by category"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              aria-label="Filter by assignee"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Assignees</option>
              {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>+</span> New Task
            </button>

            <button onClick={exportTasksCSV} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: textColor }} title="Export CSV">
              📥 Export
            </button>

            <button onClick={toggleTheme} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label="Toggle theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div ref={notificationRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', position: 'relative' }}
                aria-label="Notifications"
              >
                🔔
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                )}
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, top: '100%', width: '320px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '400px', overflow: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}`, fontWeight: 600, fontSize: '14px' }}>
                    Notifications
                    {notifications.length > 0 && (
                      <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} style={{ float: 'right', fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: secondaryText, fontSize: '13px' }}>No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${borderColor}`, backgroundColor: n.read ? 'transparent' : (isDarkMode ? '#1e2a4a' : '#f0f4ff'), fontSize: '13px' }}>
                        <div>{n.message}</div>
                        <div style={{ color: secondaryText, fontSize: '11px', marginTop: '4px' }}>{formatRelativeTime(n.timestamp)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Bulk actions bar */}
        {bulkSelection.length > 0 && (
          <div style={{ padding: '8px 24px', backgroundColor: isDarkMode ? '#1e2a4a' : '#eef2ff', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
            <span style={{ fontWeight: 600 }}>{bulkSelection.length} selected</span>
            <select onChange={(e) => { if (e.target.value) handleBulkStatusChange(e.target.value); e.target.value = ''; }} style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${borderColor}`, fontSize: '12px', backgroundColor: cardBg, color: textColor }} aria-label="Bulk move">
              <option value="">Move to...</option>
              {STATUS_COLUMNS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <button onClick={handleBulkDelete} style={{ padding: '4px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
            <button onClick={() => setBulkSelection([])} style={{ padding: '4px 12px', backgroundColor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: textColor }}>Cancel</button>
          </div>
        )}

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Board View */}
          {activeView === 'board' && (
            <div style={{ display: 'flex', gap: '16px', minHeight: '100%' }}>
              {STATUS_COLUMNS.map(status => (
                <div
                  key={status}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(status)}
                  style={{ flex: 1, minWidth: '250px', backgroundColor: isDarkMode ? '#0f0f23' : '#f3f4f6', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', color: secondaryText }}>
                      {STATUS_LABELS[status]}
                    </h3>
                    <span style={{ fontSize: '12px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', padding: '2px 8px', borderRadius: '10px', color: secondaryText }}>
                      {getTasksByStatus(status).length}
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getTasksByStatus(status).map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        onClick={() => setSelectedTask(task)}
                        style={{
                          backgroundColor: cardBg,
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          border: `1px solid ${borderColor}`,
                          borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}`,
                          transition: 'box-shadow 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6', color: secondaryText, textTransform: 'uppercase', fontWeight: 600 }}>
                            {task.category}
                          </span>
                          <input
                            type="checkbox"
                            checked={bulkSelection.includes(task.id)}
                            onChange={(e) => { e.stopPropagation(); toggleBulkSelect(task.id); }}
                            style={{ cursor: 'pointer' }}
                            aria-label={`Select ${task.title}`}
                          />
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 8px 0', lineHeight: 1.3 }}>{task.title}</h4>

                        {task.subtasks.length > 0 && (
                          <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '6px' }}>
                            ☑ {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {task.tags.slice(0, 2).map(tag => (
                              <span key={tag} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px', backgroundColor: isDarkMode ? '#1e2a4a' : '#e0e7ff', color: accentColor }}>
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && <span style={{ fontSize: '10px', color: secondaryText }}>+{task.tags.length - 2}</span>}
                          </div>
                          {task.assignee && (
                            <span style={{ fontSize: '16px' }} title={getTeamMember(task.assignee)?.name}>
                              {getTeamMember(task.assignee)?.avatar}
                            </span>
                          )}
                        </div>

                        {task.dueDate && (
                          <div style={{ fontSize: '11px', color: task.dueDate < Date.now() && task.status !== 'done' ? '#ef4444' : secondaryText, marginTop: '6px' }}>
                            📅 {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {activeView === 'list' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: secondaryText }}>Sort by:</span>
                {['created', 'priority', 'dueDate', 'title'].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      if (sortBy === s) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      else { setSortBy(s); setSortDirection('desc'); }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${sortBy === s ? accentColor : borderColor}`,
                      backgroundColor: sortBy === s ? (isDarkMode ? '#1e2a4a' : '#eef2ff') : 'transparent',
                      color: sortBy === s ? accentColor : textColor,
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {s === 'created' ? 'Created' : s === 'dueDate' ? 'Due Date' : s.charAt(0).toUpperCase() + s.slice(1)}
                    {sortBy === s && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ))}
              </div>

              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}`, textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText, width: '30px' }}></th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Task</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Priority</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Assignee</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Due Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map(task => (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        style={{ borderBottom: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '10px 16px' }}>
                          <input type="checkbox" checked={bulkSelection.includes(task.id)} onChange={(e) => { e.stopPropagation(); toggleBulkSelect(task.id); }} aria-label={`Select ${task.title}`} />
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ fontWeight: 500 }}>{task.title}</div>
                          <div style={{ fontSize: '11px', color: secondaryText, marginTop: '2px' }}>
                            {task.tags.map(t => `#${t}`).join(' ')}
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: task.status === 'done' ? '#dcfce7' : (isDarkMode ? '#2a2a4a' : '#f3f4f6'), color: task.status === 'done' ? '#16a34a' : secondaryText }}>
                            {STATUS_LABELS[task.status]}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PRIORITY_COLORS[task.priority], display: 'inline-block' }} />
                            {task.priority}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          {task.assignee ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{getTeamMember(task.assignee)?.avatar}</span>
                              <span>{getTeamMember(task.assignee)?.name}</span>
                            </span>
                          ) : (
                            <span style={{ color: secondaryText }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px', color: task.dueDate && task.dueDate < Date.now() && task.status !== 'done' ? '#ef4444' : textColor }}>
                          {formatDate(task.dueDate)}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          {task.subtasks.length > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '60px', height: '4px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${(task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100}%`, height: '100%', backgroundColor: accentColor }} />
                              </div>
                              <span style={{ fontSize: '11px', color: secondaryText }}>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: secondaryText }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {activeView === 'calendar' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(prev => prev - 1); } else { setCalendarMonth(prev => prev - 1); } }} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: cardBg, color: textColor }}>
                    ←
                  </button>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(prev => prev + 1); } else { setCalendarMonth(prev => prev + 1); } }} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: cardBg, color: textColor }}>
                    →
                  </button>
                </div>
                <button onClick={() => { setCalendarMonth(new Date().getMonth()); setCalendarYear(new Date().getFullYear()); }} style={{ padding: '6px 14px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: cardBg, color: textColor, fontSize: '13px' }}>
                  Today
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: borderColor, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ padding: '10px', textAlign: 'center', fontWeight: 600, fontSize: '12px', color: secondaryText, backgroundColor: cardBg }}>
                    {day}
                  </div>
                ))}
                {getCalendarDays().map((cell, i) => (
                  <div key={i} style={{ padding: '8px', minHeight: '90px', backgroundColor: cell.isToday ? (isDarkMode ? '#1e2a4a' : '#eef2ff') : cardBg, opacity: cell.day ? 1 : 0.3 }}>
                    {cell.day && (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: cell.isToday ? 700 : 400, color: cell.isToday ? accentColor : textColor, marginBottom: '4px' }}>
                          {cell.day}
                        </div>
                        {cell.tasks.map(task => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            style={{ fontSize: '10px', padding: '2px 4px', marginBottom: '2px', borderRadius: '3px', backgroundColor: PRIORITY_COLORS[task.priority] + '20', borderLeft: `2px solid ${PRIORITY_COLORS[task.priority]}`, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {task.title}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Project Analytics</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Tasks', value: tasks.length, icon: '📋', color: '#4f46e5' },
                  { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, icon: '✅', color: '#22c55e' },
                  { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, icon: '🔄', color: '#f97316' },
                  { label: 'Overdue', value: getOverdueTasks().length, icon: '⚠️', color: '#ef4444' },
                ].map(stat => (
                  <div key={stat.label} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                      <span style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: secondaryText }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Tasks by Status</h3>
                  {STATUS_COLUMNS.map(status => {
                    const count = tasks.filter(t => t.status === status).length;
                    const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                    return (
                      <div key={status} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{STATUS_LABELS[status]}</span>
                          <span style={{ color: secondaryText }}>{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: accentColor, borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Tasks by Priority</h3>
                  {Object.entries(PRIORITY_COLORS).map(([priority, color]) => {
                    const count = tasks.filter(t => t.priority === priority).length;
                    const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                    return (
                      <div key={priority} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </span>
                          <span style={{ color: secondaryText }}>{count}</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Time Tracking</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{getTotalTimeEstimate()}h</div>
                      <div style={{ fontSize: '12px', color: secondaryText }}>Estimated</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>{getTotalTimeSpent()}h</div>
                      <div style={{ fontSize: '12px', color: secondaryText }}>Spent</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: getTotalTimeSpent() > getTotalTimeEstimate() ? '#ef4444' : '#eab308' }}>{getTotalTimeEstimate() - getTotalTimeSpent()}h</div>
                      <div style={{ fontSize: '12px', color: secondaryText }}>Remaining</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Team Workload</h3>
                  {MOCK_TEAM.filter(m => m.active).slice(0, 5).map(member => {
                    const memberTasks = tasks.filter(t => t.assignee === member.id && t.status !== 'done');
                    return (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
                        <span>{member.avatar}</span>
                        <span style={{ flex: 1 }}>{member.name}</span>
                        <span style={{ color: memberTasks.length > 3 ? '#ef4444' : secondaryText, fontWeight: memberTasks.length > 3 ? 600 : 400 }}>
                          {memberTasks.length} tasks
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Activity View */}
          {activeView === 'activity' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Activity Feed</h2>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                {ACTIVITY_LOG.sort((a, b) => b.timestamp - a.timestamp).map(activity => {
                  const member = getTeamMember(activity.user);
                  return (
                    <div key={activity.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{member?.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{member?.name}</span>
                        <span style={{ color: secondaryText, fontSize: '13px' }}> {activity.action} </span>
                        <span style={{ fontWeight: 500, fontSize: '13px' }}>{activity.target}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: secondaryText }}>{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team View */}
          {activeView === 'team' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Team Members</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {MOCK_TEAM.map(member => {
                  const memberTasks = tasks.filter(t => t.assignee === member.id);
                  const completedTasks = memberTasks.filter(t => t.status === 'done');
                  const activeTasks = memberTasks.filter(t => t.status !== 'done');
                  return (
                    <div key={member.id} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: member.active ? '#22c55e' : '#94a3b8' }} />
                      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '36px' }}>{member.avatar}</span>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '8px 0 2px' }}>{member.name}</h3>
                        <div style={{ fontSize: '12px', color: secondaryText }}>{member.role}</div>
                        <div style={{ fontSize: '11px', color: secondaryText }}>{member.department}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '12px', borderTop: `1px solid ${borderColor}`, fontSize: '12px', textAlign: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>{memberTasks.length}</div>
                          <div style={{ color: secondaryText }}>Total</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px', color: '#22c55e' }}>{completedTasks.length}</div>
                          <div style={{ color: secondaryText }}>Done</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px', color: '#f97316' }}>{activeTasks.length}</div>
                          <div style={{ color: secondaryText }}>Active</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '12px', fontSize: '12px', color: accentColor, textAlign: 'center' }}>
                        <a href={`mailto:${member.email}`} style={{ color: accentColor, textDecoration: 'none' }}>{member.email}</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setSelectedTask(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6', color: secondaryText, textTransform: 'uppercase', fontWeight: 600 }}>{selectedTask.category}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PRIORITY_COLORS[selectedTask.priority], display: 'inline-block' }} />
                    {selectedTask.priority}
                  </span>
                </div>
                {editingTaskId === selectedTask.id ? (
                  <input
                    type="text"
                    defaultValue={selectedTask.title}
                    onBlur={(e) => { updateTask(selectedTask.id, { title: e.target.value }); setEditingTaskId(null); setSelectedTask(prev => ({ ...prev, title: e.target.value })); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                    style={{ fontSize: '20px', fontWeight: 600, border: `1px solid ${borderColor}`, borderRadius: '6px', padding: '4px 8px', width: '100%', backgroundColor: 'transparent', color: textColor }}
                    autoFocus
                  />
                ) : (
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, cursor: 'pointer' }} onClick={() => setEditingTaskId(selectedTask.id)}>{selectedTask.title}</h2>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => deleteTask(selectedTask.id)} style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                <button onClick={() => setSelectedTask(null)} style={{ padding: '6px 12px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6', color: textColor, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: secondaryText, lineHeight: 1.6, marginBottom: '16px' }}>{selectedTask.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: secondaryText, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Status</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => { moveTask(selectedTask.id, e.target.value); setSelectedTask(prev => ({ ...prev, status: e.target.value })); }}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', backgroundColor: 'transparent', color: textColor }}
                >
                  {STATUS_COLUMNS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: secondaryText, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Assignee</label>
                <select
                  value={selectedTask.assignee || ''}
                  onChange={(e) => { updateTask(selectedTask.id, { assignee: e.target.value || null }); setSelectedTask(prev => ({ ...prev, assignee: e.target.value || null })); }}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', backgroundColor: 'transparent', color: textColor }}
                >
                  <option value="">Unassigned</option>
                  {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: secondaryText, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Priority</label>
                <select
                  value={selectedTask.priority}
                  onChange={(e) => { updateTask(selectedTask.id, { priority: e.target.value }); setSelectedTask(prev => ({ ...prev, priority: e.target.value })); }}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', backgroundColor: 'transparent', color: textColor }}
                >
                  {Object.keys(PRIORITY_COLORS).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: secondaryText, marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Category</label>
                <select
                  value={selectedTask.category}
                  onChange={(e) => { updateTask(selectedTask.id, { category: e.target.value }); setSelectedTask(prev => ({ ...prev, category: e.target.value })); }}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', backgroundColor: 'transparent', color: textColor }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', marginBottom: '8px' }}>
                <div>
                  <span style={{ color: secondaryText }}>Created: </span>
                  <span>{formatDate(selectedTask.createdAt)}</span>
                </div>
                <div>
                  <span style={{ color: secondaryText }}>Due: </span>
                  <span style={{ color: selectedTask.dueDate && selectedTask.dueDate < Date.now() && selectedTask.status !== 'done' ? '#ef4444' : textColor }}>
                    {formatDate(selectedTask.dueDate)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: secondaryText }}>Estimated: </span>
                  <span>{selectedTask.timeEstimate}h</span>
                </div>
                <div>
                  <span style={{ color: secondaryText }}>Spent: </span>
                  <span style={{ color: selectedTask.timeSpent > selectedTask.timeEstimate ? '#ef4444' : textColor }}>{selectedTask.timeSpent}h</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {selectedTask.tags.map(tag => (
                <span key={tag} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', backgroundColor: isDarkMode ? '#1e2a4a' : '#e0e7ff', color: accentColor }}>
                  #{tag}
                </span>
              ))}
            </div>

            {/* Subtasks */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                Subtasks ({selectedTask.subtasks.filter(s => s.done).length}/{selectedTask.subtasks.length})
              </h3>
              {selectedTask.subtasks.map(subtask => (
                <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={subtask.done}
                    onChange={() => { toggleSubtask(selectedTask.id, subtask.id); setSelectedTask(prev => ({ ...prev, subtasks: prev.subtasks.map(s => s.id === subtask.id ? { ...s, done: !s.done } : s) })); }}
                  />
                  <span style={{ textDecoration: subtask.done ? 'line-through' : 'none', color: subtask.done ? secondaryText : textColor, flex: 1 }}>{subtask.text}</span>
                  <button onClick={() => { removeSubtask(selectedTask.id, subtask.id); setSelectedTask(prev => ({ ...prev, subtasks: prev.subtasks.filter(s => s.id !== subtask.id) })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: secondaryText, fontSize: '14px' }}>×</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="Add subtask..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addSubtask(selectedTask.id, e.target.value.trim());
                      setSelectedTask(prev => ({ ...prev, subtasks: [...prev.subtasks, { id: Date.now().toString(), text: e.target.value.trim(), done: false }] }));
                      e.target.value = '';
                    }
                  }}
                  style={{ flex: 1, padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
                />
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Comments ({selectedTask.comments.length})</h3>
              {selectedTask.comments.map(comment => {
                const author = getTeamMember(comment.author);
                return (
                  <div key={comment.id} style={{ padding: '10px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>{author?.avatar}</span>
                      <span style={{ fontWeight: 600 }}>{author?.name}</span>
                      <span style={{ color: secondaryText, fontSize: '11px' }}>{formatRelativeTime(comment.timestamp)}</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.5, color: secondaryText }}>{comment.text}</p>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addComment(selectedTask.id, newComment);
                      setSelectedTask(prev => ({ ...prev, comments: [...prev.comments, { id: Date.now().toString(), author: 't1', text: newComment, timestamp: Date.now() }] }));
                    }
                  }}
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
                />
                <button
                  onClick={() => {
                    addComment(selectedTask.id, newComment);
                    setSelectedTask(prev => ({ ...prev, comments: [...prev.comments, { id: Date.now().toString(), author: 't1', text: newComment, timestamp: Date.now() }] }));
                  }}
                  style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowCreateModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Create New Task</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              createTask({
                title: formData.get('title'),
                description: formData.get('description'),
                status: formData.get('status'),
                priority: formData.get('priority'),
                category: formData.get('category'),
                assignee: formData.get('assignee') || null,
                tags: formData.get('tags'),
                dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate')).getTime() : null,
                timeEstimate: formData.get('timeEstimate'),
              });
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Title *</label>
                <input name="title" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Description</label>
                <textarea name="description" rows={3} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Status</label>
                  <select name="status" defaultValue="backlog" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {STATUS_COLUMNS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Priority</label>
                  <select name="priority" defaultValue="medium" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {Object.keys(PRIORITY_COLORS).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Category</label>
                  <select name="category" defaultValue="feature" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Assignee</label>
                  <select name="assignee" defaultValue="" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    <option value="">Unassigned</option>
                    {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Due Date</label>
                  <input name="dueDate" type="date" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Time Estimate (hours)</label>
                  <input name="timeEstimate" type="number" min="0" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Tags (comma separated)</label>
                <input name="tags" placeholder="e.g. frontend, urgent" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 2000 }} onClick={() => setShowSettingsPanel(false)}>
          <div style={{ backgroundColor: cardBg, width: '400px', height: '100%', padding: '24px', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>⚙️ Settings</h2>
              <button onClick={() => setShowSettingsPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Project Info</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Project Name</label>
                <input
                  value={projectSettings.name}
                  onChange={(e) => setProjectSettings(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Description</label>
                <textarea
                  value={projectSettings.description}
                  onChange={(e) => setProjectSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Danger Zone</h3>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
                    setTasks([]);
                    addNotification('All tasks deleted', 'warning');
                    setShowSettingsPanel(false);
                  }
                }}
                style={{ padding: '8px 16px', backgroundColor: '#fef2f2', color: '#ef4444', border: `1px solid #fecaca`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', width: '100%' }}
              >
                Delete All Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
