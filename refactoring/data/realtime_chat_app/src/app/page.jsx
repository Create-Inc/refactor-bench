import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const ONLINE_STATUSES = {
  online: { color: '#22c55e', label: 'Online' },
  away: { color: '#eab308', label: 'Away' },
  busy: { color: '#ef4444', label: 'Do Not Disturb' },
  offline: { color: '#94a3b8', label: 'Offline' },
};

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏'];

const MOCK_USERS = [
  { id: 'u1', name: 'You', avatar: '👤', status: 'online', bio: 'Hey there! I am using ChatApp', lastSeen: Date.now() },
  { id: 'u2', name: 'Alice Chen', avatar: '👩‍💻', status: 'online', bio: 'Software Engineer at TechCorp', lastSeen: Date.now() },
  { id: 'u3', name: 'Bob Martinez', avatar: '👨‍🎨', status: 'away', bio: 'UI/UX Designer', lastSeen: Date.now() - 300000 },
  { id: 'u4', name: 'Carol Williams', avatar: '👩‍💼', status: 'busy', bio: 'Product Manager', lastSeen: Date.now() - 600000 },
  { id: 'u5', name: 'Dave Johnson', avatar: '👨‍💻', status: 'offline', bio: 'Backend Developer', lastSeen: Date.now() - 86400000 },
  { id: 'u6', name: 'Eve Park', avatar: '👩‍🔬', status: 'online', bio: 'Data Scientist', lastSeen: Date.now() },
  { id: 'u7', name: 'Frank Lee', avatar: '👨‍🔧', status: 'offline', bio: 'DevOps Engineer', lastSeen: Date.now() - 172800000 },
  { id: 'u8', name: 'Grace Kim', avatar: '👩‍🎤', status: 'online', bio: 'Frontend Developer', lastSeen: Date.now() },
];

const INITIAL_CONVERSATIONS = [
  {
    id: 'c1',
    type: 'direct',
    participants: ['u1', 'u2'],
    name: null,
    lastMessage: 'Sure, I will review the PR today!',
    lastMessageTime: Date.now() - 120000,
    unreadCount: 2,
    pinned: true,
    muted: false,
    archived: false,
  },
  {
    id: 'c2',
    type: 'group',
    participants: ['u1', 'u2', 'u3', 'u4'],
    name: 'Design Team',
    lastMessage: 'The new mockups look great 🎉',
    lastMessageTime: Date.now() - 600000,
    unreadCount: 5,
    pinned: true,
    muted: false,
    archived: false,
  },
  {
    id: 'c3',
    type: 'direct',
    participants: ['u1', 'u3'],
    name: null,
    lastMessage: 'Can we reschedule to Thursday?',
    lastMessageTime: Date.now() - 3600000,
    unreadCount: 0,
    pinned: false,
    muted: false,
    archived: false,
  },
  {
    id: 'c4',
    type: 'group',
    participants: ['u1', 'u5', 'u6', 'u7', 'u8'],
    name: 'Backend Guild',
    lastMessage: 'Deployment successful ✅',
    lastMessageTime: Date.now() - 7200000,
    unreadCount: 12,
    pinned: false,
    muted: true,
    archived: false,
  },
  {
    id: 'c5',
    type: 'direct',
    participants: ['u1', 'u4'],
    name: null,
    lastMessage: 'Sprint planning notes attached',
    lastMessageTime: Date.now() - 86400000,
    unreadCount: 0,
    pinned: false,
    muted: false,
    archived: false,
  },
  {
    id: 'c6',
    type: 'group',
    participants: ['u1', 'u2', 'u6', 'u8'],
    name: 'Project Alpha',
    lastMessage: 'Let us sync tomorrow morning',
    lastMessageTime: Date.now() - 172800000,
    unreadCount: 0,
    pinned: false,
    muted: false,
    archived: true,
  },
];

const INITIAL_MESSAGES = {
  c1: [
    { id: 'm1', senderId: 'u2', type: 'text', content: 'Hey! Did you get a chance to look at the new API endpoints?', timestamp: Date.now() - 3600000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm2', senderId: 'u1', type: 'text', content: 'Yes, I reviewed them. The authentication flow looks solid.', timestamp: Date.now() - 3500000, edited: false, reactions: { '👍': ['u2'] }, replyTo: null, deleted: false },
    { id: 'm3', senderId: 'u2', type: 'text', content: 'Great! I also pushed some changes to the PR for the user profile endpoint.', timestamp: Date.now() - 3400000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm4', senderId: 'u1', type: 'text', content: 'I noticed a potential issue with the error handling in the middleware. Should we add retry logic?', timestamp: Date.now() - 3300000, edited: true, reactions: {}, replyTo: null, deleted: false },
    { id: 'm5', senderId: 'u2', type: 'text', content: 'Good catch! Yes, let me add exponential backoff. Can you also check the rate limiting config?', timestamp: Date.now() - 3200000, edited: false, reactions: { '🔥': ['u1'] }, replyTo: 'm4', deleted: false },
    { id: 'm6', senderId: 'u1', type: 'text', content: 'Will do. The current rate limit seems too aggressive for our traffic patterns.', timestamp: Date.now() - 300000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm7', senderId: 'u2', type: 'text', content: 'Sure, I will review the PR today!', timestamp: Date.now() - 120000, edited: false, reactions: {}, replyTo: null, deleted: false },
  ],
  c2: [
    { id: 'm8', senderId: 'u3', type: 'text', content: 'I uploaded the new wireframes for the settings page', timestamp: Date.now() - 7200000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm9', senderId: 'u4', type: 'text', content: 'These look fantastic! Love the color scheme.', timestamp: Date.now() - 7100000, edited: false, reactions: { '❤️': ['u2', 'u3'] }, replyTo: 'm8', deleted: false },
    { id: 'm10', senderId: 'u2', type: 'text', content: 'Agreed! Should we schedule a design review for Friday?', timestamp: Date.now() - 7000000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm11', senderId: 'u1', type: 'text', content: 'Friday works for me. What time?', timestamp: Date.now() - 6900000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm12', senderId: 'u3', type: 'text', content: '2pm? I will book the conference room.', timestamp: Date.now() - 6800000, edited: false, reactions: { '👍': ['u1', 'u2', 'u4'] }, replyTo: null, deleted: false },
    { id: 'm13', senderId: 'u4', type: 'system', content: 'Carol Williams changed the group name to "Design Team"', timestamp: Date.now() - 1800000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm14', senderId: 'u2', type: 'text', content: 'The new mockups look great 🎉', timestamp: Date.now() - 600000, edited: false, reactions: { '🎉': ['u1', 'u3'] }, replyTo: null, deleted: false },
  ],
  c3: [
    { id: 'm15', senderId: 'u3', type: 'text', content: 'Are we still meeting Wednesday for the design sync?', timestamp: Date.now() - 86400000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm16', senderId: 'u1', type: 'text', content: 'I have a conflict. Can we reschedule?', timestamp: Date.now() - 82800000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm17', senderId: 'u3', type: 'text', content: 'Can we reschedule to Thursday?', timestamp: Date.now() - 3600000, edited: false, reactions: { '👍': ['u1'] }, replyTo: 'm16', deleted: false },
  ],
  c4: [
    { id: 'm18', senderId: 'u5', type: 'text', content: 'Starting the deployment pipeline for v2.3.1', timestamp: Date.now() - 14400000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm19', senderId: 'u7', type: 'text', content: 'All checks passed. Proceeding to staging.', timestamp: Date.now() - 14000000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm20', senderId: 'u6', type: 'text', content: 'Monitoring dashboards show no anomalies so far.', timestamp: Date.now() - 10800000, edited: false, reactions: { '👍': ['u5', 'u7'] }, replyTo: null, deleted: false },
    { id: 'm21', senderId: 'u8', type: 'text', content: 'Frontend build is also green. Ready for production rollout?', timestamp: Date.now() - 10000000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm22', senderId: 'u5', type: 'text', content: 'Deploying to production now...', timestamp: Date.now() - 8000000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm23', senderId: 'u5', type: 'text', content: 'Deployment successful ✅', timestamp: Date.now() - 7200000, edited: false, reactions: { '🎉': ['u1', 'u6', 'u7', 'u8'], '🔥': ['u6'] }, replyTo: null, deleted: false },
  ],
  c5: [
    { id: 'm24', senderId: 'u4', type: 'text', content: 'Here are the sprint planning notes from today', timestamp: Date.now() - 172800000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm25', senderId: 'u4', type: 'file', content: 'sprint-planning-notes.pdf', timestamp: Date.now() - 172700000, edited: false, reactions: {}, replyTo: null, deleted: false },
    { id: 'm26', senderId: 'u1', type: 'text', content: 'Thanks Carol! I will go through these before tomorrow.', timestamp: Date.now() - 172000000, edited: false, reactions: { '👍': ['u4'] }, replyTo: null, deleted: false },
    { id: 'm27', senderId: 'u4', type: 'text', content: 'Sprint planning notes attached', timestamp: Date.now() - 86400000, edited: false, reactions: {}, replyTo: null, deleted: false },
  ],
  c6: [
    { id: 'm28', senderId: 'u6', type: 'text', content: 'Let us sync tomorrow morning', timestamp: Date.now() - 172800000, edited: false, reactions: {}, replyTo: null, deleted: false },
  ],
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatLastSeen = (timestamp) => {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function ChatApp() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setShowSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    sound: true,
    desktop: true,
    preview: true,
  });
  const [chatFilter, setChatFilter] = useState('all');
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const messageEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('chatTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedNotifSettings = localStorage.getItem('chatNotifSettings');
    if (savedNotifSettings) {
      try {
        setNotificationSettings(JSON.parse(savedNotifSettings));
      } catch (e) {
        console.error('Failed to parse notification settings');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('chatNotifSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowEmojiPicker(null);
        setShowUserProfile(null);
        setShowGroupInfo(false);
        setShowNewChat(false);
        setShowNewGroup(false);
        setShowSettings(false);
        setContextMenu(null);
        setReplyingTo(null);
        setEditingMessage(null);
        setForwardingMessage(null);
        if (isSelectionMode) {
          setIsSelectionMode(false);
          setSelectedMessages([]);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (activeConversationId) {
          setShowMessageSearch(prev => !prev);
        } else {
          setShowSearch(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConversationId, isSelectionMode]);

  useEffect(() => {
    if (!activeConversationId) return;
    const userIds = ['u2', 'u3', 'u6'];
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const timeout = setTimeout(() => {
      setTypingUsers(prev => ({ ...prev, [activeConversationId]: randomUser }));
      const clearTimeout2 = setTimeout(() => {
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[activeConversationId];
          return next;
        });
      }, 3000);
      return () => clearTimeout(clearTimeout2);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [activeConversationId]);

  const getConversationName = useCallback((conv) => {
    if (conv.name) return conv.name;
    const otherParticipant = conv.participants.find(p => p !== 'u1');
    const user = MOCK_USERS.find(u => u.id === otherParticipant);
    return user?.name || 'Unknown';
  }, []);

  const getConversationAvatar = useCallback((conv) => {
    if (conv.type === 'group') return '👥';
    const otherParticipant = conv.participants.find(p => p !== 'u1');
    const user = MOCK_USERS.find(u => u.id === otherParticipant);
    return user?.avatar || '👤';
  }, []);

  const getConversationStatus = useCallback((conv) => {
    if (conv.type === 'group') return null;
    const otherParticipant = conv.participants.find(p => p !== 'u1');
    const user = MOCK_USERS.find(u => u.id === otherParticipant);
    return user?.status || 'offline';
  }, []);

  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter(c => !c.archived || chatFilter === 'archived');

    if (chatFilter === 'unread') {
      filtered = filtered.filter(c => c.unreadCount > 0);
    } else if (chatFilter === 'groups') {
      filtered = filtered.filter(c => c.type === 'group');
    } else if (chatFilter === 'direct') {
      filtered = filtered.filter(c => c.type === 'direct');
    } else if (chatFilter === 'archived') {
      filtered = conversations.filter(c => c.archived);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => {
        const name = getConversationName(c).toLowerCase();
        const lastMsg = (c.lastMessage || '').toLowerCase();
        return name.includes(q) || lastMsg.includes(q);
      });
    }

    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastMessageTime - a.lastMessageTime;
    });
  }, [conversations, chatFilter, searchQuery, getConversationName]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messages[activeConversationId] || []) : [];

  const filteredMessages = useMemo(() => {
    if (!messageSearchQuery) return activeMessages;
    const q = messageSearchQuery.toLowerCase();
    return activeMessages.filter(m => m.content.toLowerCase().includes(q) && !m.deleted);
  }, [activeMessages, messageSearchQuery]);

  const sendMessage = () => {
    if (!messageInput.trim() || !activeConversationId) return;

    const newMessage = {
      id: `m${Date.now()}`,
      senderId: 'u1',
      type: 'text',
      content: messageInput.trim(),
      timestamp: Date.now(),
      edited: false,
      reactions: {},
      replyTo: replyingTo,
      deleted: false,
    };

    setMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage],
    }));

    setConversations(prev => prev.map(c =>
      c.id === activeConversationId
        ? { ...c, lastMessage: newMessage.content, lastMessageTime: newMessage.timestamp, unreadCount: 0 }
        : c
    ));

    setMessageInput('');
    setReplyingTo(null);
    messageInputRef.current?.focus();
  };

  const deleteMessage = (messageId) => {
    if (!activeConversationId) return;
    setMessages(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m =>
        m.id === messageId ? { ...m, deleted: true, content: 'This message was deleted' } : m
      ),
    }));
  };

  const editMessage = (messageId) => {
    if (!editContent.trim() || !activeConversationId) return;
    setMessages(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m =>
        m.id === messageId ? { ...m, content: editContent.trim(), edited: true } : m
      ),
    }));
    setEditingMessage(null);
    setEditContent('');
  };

  const toggleReaction = (messageId, emoji) => {
    if (!activeConversationId) return;
    setMessages(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m => {
        if (m.id !== messageId) return m;
        const reactions = { ...m.reactions };
        if (reactions[emoji]?.includes('u1')) {
          reactions[emoji] = reactions[emoji].filter(u => u !== 'u1');
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...(reactions[emoji] || []), 'u1'];
        }
        return { ...m, reactions };
      }),
    }));
    setShowEmojiPicker(null);
  };

  const pinConversation = (convId) => {
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, pinned: !c.pinned } : c
    ));
  };

  const muteConversation = (convId) => {
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, muted: !c.muted } : c
    ));
  };

  const archiveConversation = (convId) => {
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, archived: !c.archived } : c
    ));
    if (activeConversationId === convId) {
      setActiveConversationId(null);
    }
  };

  const markAsRead = (convId) => {
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const selectConversation = (convId) => {
    setActiveConversationId(convId);
    markAsRead(convId);
    setShowMessageSearch(false);
    setMessageSearchQuery('');
    setReplyingTo(null);
    setEditingMessage(null);
    setForwardingMessage(null);
    setIsSelectionMode(false);
    setSelectedMessages([]);
  };

  const createDirectChat = (userId) => {
    const existing = conversations.find(c =>
      c.type === 'direct' && c.participants.includes(userId) && c.participants.includes('u1')
    );
    if (existing) {
      selectConversation(existing.id);
      setShowNewChat(false);
      return;
    }

    const newConv = {
      id: `c${Date.now()}`,
      type: 'direct',
      participants: ['u1', userId],
      name: null,
      lastMessage: '',
      lastMessageTime: Date.now(),
      unreadCount: 0,
      pinned: false,
      muted: false,
      archived: false,
    };

    setConversations(prev => [newConv, ...prev]);
    setMessages(prev => ({ ...prev, [newConv.id]: [] }));
    selectConversation(newConv.id);
    setShowNewChat(false);
  };

  const createGroupChat = () => {
    if (!newGroupName.trim() || newGroupMembers.length === 0) return;

    const newConv = {
      id: `c${Date.now()}`,
      type: 'group',
      participants: ['u1', ...newGroupMembers],
      name: newGroupName.trim(),
      lastMessage: `Group "${newGroupName.trim()}" created`,
      lastMessageTime: Date.now(),
      unreadCount: 0,
      pinned: false,
      muted: false,
      archived: false,
    };

    const systemMessage = {
      id: `m${Date.now()}`,
      senderId: 'u1',
      type: 'system',
      content: `Group "${newGroupName.trim()}" created`,
      timestamp: Date.now(),
      edited: false,
      reactions: {},
      replyTo: null,
      deleted: false,
    };

    setConversations(prev => [newConv, ...prev]);
    setMessages(prev => ({ ...prev, [newConv.id]: [systemMessage] }));
    selectConversation(newConv.id);
    setShowNewGroup(false);
    setNewGroupName('');
    setNewGroupMembers([]);
  };

  const forwardMessage = (targetConvId) => {
    if (!forwardingMessage) return;

    const forwarded = {
      id: `m${Date.now()}`,
      senderId: 'u1',
      type: 'text',
      content: `[Forwarded] ${forwardingMessage.content}`,
      timestamp: Date.now(),
      edited: false,
      reactions: {},
      replyTo: null,
      deleted: false,
    };

    setMessages(prev => ({
      ...prev,
      [targetConvId]: [...(prev[targetConvId] || []), forwarded],
    }));

    setConversations(prev => prev.map(c =>
      c.id === targetConvId
        ? { ...c, lastMessage: forwarded.content, lastMessageTime: forwarded.timestamp }
        : c
    ));

    setForwardingMessage(null);
  };

  const deleteSelectedMessages = () => {
    if (!activeConversationId || selectedMessages.length === 0) return;
    setMessages(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m =>
        selectedMessages.includes(m.id)
          ? { ...m, deleted: true, content: 'This message was deleted' }
          : m
      ),
    }));
    setSelectedMessages([]);
    setIsSelectionMode(false);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.archived ? 0 : c.unreadCount), 0);

  const theme = isDarkMode
    ? { bg: '#1a1a2e', sidebar: '#16213e', chat: '#0f3460', text: '#e0e0e0', textSecondary: '#a0a0a0', border: '#2a2a4a', accent: '#e94560', inputBg: '#16213e', hover: '#1a1a3e', messageOwn: '#e94560', messageOther: '#16213e' }
    : { bg: '#f5f5f5', sidebar: '#ffffff', chat: '#e8e8e8', text: '#1a1a1a', textSecondary: '#666666', border: '#e0e0e0', accent: '#0066cc', inputBg: '#ffffff', hover: '#f0f0f0', messageOwn: '#0066cc', messageOther: '#ffffff' };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', background: theme.bg, color: theme.text }} data-testid="chat-app">
      {/* Sidebar */}
      <div style={{ width: '340px', borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', background: theme.sidebar }} data-testid="sidebar">
        {/* Sidebar Header */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
            💬 ChatApp {totalUnread > 0 && <span style={{ background: theme.accent, color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', marginLeft: '8px' }} data-testid="total-unread">{totalUnread}</span>}
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowNewChat(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }} aria-label="New chat" title="New Chat">✏️</button>
            <button onClick={() => setShowNewGroup(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }} aria-label="New group" title="New Group">👥</button>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }} aria-label="Settings" title="Settings">⚙️</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '8px 16px' }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '20px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            data-testid="conversation-search"
          />
        </div>

        {/* Chat Filters */}
        <div style={{ display: 'flex', padding: '4px 16px 8px', gap: '4px', overflowX: 'auto' }} data-testid="chat-filters">
          {['all', 'unread', 'groups', 'direct', 'archived'].map(filter => (
            <button
              key={filter}
              onClick={() => setChatFilter(filter)}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: chatFilter === filter ? 'none' : `1px solid ${theme.border}`,
                background: chatFilter === filter ? theme.accent : 'transparent',
                color: chatFilter === filter ? '#fff' : theme.textSecondary,
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                textTransform: 'capitalize',
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }} data-testid="conversation-list">
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, convId: conv.id });
              }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: activeConversationId === conv.id ? theme.hover : 'transparent',
                borderBottom: `1px solid ${theme.border}`,
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                position: 'relative',
              }}
              data-testid={`conversation-${conv.id}`}
            >
              <div style={{ position: 'relative', fontSize: '28px' }}>
                {getConversationAvatar(conv)}
                {getConversationStatus(conv) && (
                  <div style={{
                    position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px',
                    borderRadius: '50%', background: ONLINE_STATUSES[getConversationStatus(conv)]?.color,
                    border: `2px solid ${theme.sidebar}`,
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: conv.unreadCount > 0 ? 700 : 400, fontSize: '14px' }}>
                    {conv.pinned && '📌 '}{conv.muted && '🔇 '}{getConversationName(conv)}
                  </span>
                  <span style={{ fontSize: '11px', color: theme.textSecondary }}>{formatTime(conv.lastMessageTime)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ fontSize: '13px', color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {typingUsers[conv.id] ? (
                      <em style={{ color: theme.accent }}>
                        {MOCK_USERS.find(u => u.id === typingUsers[conv.id])?.name || 'Someone'} is typing...
                      </em>
                    ) : conv.lastMessage}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span style={{
                      background: conv.muted ? theme.textSecondary : theme.accent,
                      color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700, minWidth: '18px', textAlign: 'center',
                    }} data-testid={`unread-badge-${conv.id}`}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: theme.textSecondary }}>
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeConversation ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }} data-testid="no-chat-selected">
            <div style={{ fontSize: '64px' }}>💬</div>
            <h2 style={{ margin: 0, color: theme.textSecondary }}>Select a conversation</h2>
            <p style={{ color: theme.textSecondary, margin: 0 }}>Choose from your existing conversations or start a new one</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.sidebar }} data-testid="chat-header">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => {
                  if (activeConversation.type === 'group') {
                    setShowGroupInfo(true);
                  } else {
                    const otherUser = activeConversation.participants.find(p => p !== 'u1');
                    setShowUserProfile(otherUser);
                  }
                }}
              >
                <span style={{ fontSize: '28px' }}>{getConversationAvatar(activeConversation)}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{getConversationName(activeConversation)}</div>
                  <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                    {activeConversation.type === 'group'
                      ? `${activeConversation.participants.length} members`
                      : ONLINE_STATUSES[getConversationStatus(activeConversation)]?.label || 'Offline'
                    }
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowMessageSearch(prev => !prev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '6px' }} aria-label="Search messages" title="Search Messages">🔍</button>
                {isSelectionMode && (
                  <button onClick={deleteSelectedMessages} style={{ background: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '6px 12px', borderRadius: '6px', color: '#fff' }} data-testid="delete-selected">
                    Delete ({selectedMessages.length})
                  </button>
                )}
                <button onClick={() => setIsSelectionMode(prev => !prev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '6px' }} aria-label="Select messages" title="Select Messages">☑️</button>
                <button onClick={() => pinConversation(activeConversationId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '6px' }} aria-label="Pin conversation" title="Pin">{activeConversation.pinned ? '📌' : '📍'}</button>
                <button onClick={() => muteConversation(activeConversationId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '6px' }} aria-label="Mute conversation" title="Mute">{activeConversation.muted ? '🔇' : '🔔'}</button>
              </div>
            </div>

            {/* Message Search Bar */}
            {showMessageSearch && (
              <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, background: theme.sidebar }}>
                <input
                  type="text"
                  placeholder="Search in conversation..."
                  value={messageSearchQuery}
                  onChange={(e) => setMessageSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                  data-testid="message-search"
                  autoFocus
                />
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', background: theme.chat }} data-testid="message-list">
              {filteredMessages.map((msg, idx) => {
                const isOwn = msg.senderId === 'u1';
                const sender = MOCK_USERS.find(u => u.id === msg.senderId);
                const showAvatar = !isOwn && (idx === 0 || filteredMessages[idx - 1]?.senderId !== msg.senderId);
                const repliedMessage = msg.replyTo ? activeMessages.find(m => m.id === msg.replyTo) : null;

                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: theme.textSecondary, fontStyle: 'italic' }} data-testid={`message-${msg.id}`}>
                      {msg.content}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      gap: '8px',
                      marginTop: showAvatar ? '12px' : '2px',
                      alignItems: 'flex-end',
                      opacity: msg.deleted ? 0.5 : 1,
                    }}
                    data-testid={`message-${msg.id}`}
                    onClick={() => isSelectionMode && toggleMessageSelection(msg.id)}
                  >
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(msg.id)}
                        onChange={() => toggleMessageSelection(msg.id)}
                        style={{ marginRight: '4px' }}
                      />
                    )}
                    {!isOwn && showAvatar && (
                      <span
                        style={{ fontSize: '24px', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); setShowUserProfile(msg.senderId); }}
                        title={sender?.name}
                      >
                        {sender?.avatar}
                      </span>
                    )}
                    {!isOwn && !showAvatar && <span style={{ width: '24px' }} />}
                    <div style={{ maxWidth: '65%', position: 'relative' }}>
                      {repliedMessage && (
                        <div style={{
                          padding: '4px 8px', background: isOwn ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          borderRadius: '6px', fontSize: '12px', marginBottom: '4px', borderLeft: `3px solid ${theme.accent}`,
                          color: theme.textSecondary, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          ↩ {repliedMessage.content}
                        </div>
                      )}
                      {showAvatar && !isOwn && activeConversation.type === 'group' && (
                        <div style={{ fontSize: '11px', color: theme.accent, marginBottom: '2px', fontWeight: 600 }}>
                          {sender?.name}
                        </div>
                      )}
                      <div
                        style={{
                          padding: msg.type === 'file' ? '8px 12px' : '8px 12px',
                          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isOwn ? theme.messageOwn : theme.messageOther,
                          color: isOwn ? '#ffffff' : theme.text,
                          fontSize: '14px',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                          position: 'relative',
                        }}
                        onContextMenu={(e) => {
                          if (!isSelectionMode) {
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, messageId: msg.id, isOwn });
                          }
                        }}
                      >
                        {msg.type === 'file' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📎</span>
                            <span style={{ textDecoration: 'underline' }}>{msg.content}</span>
                          </div>
                        ) : (
                          msg.content
                        )}
                        <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: 'right' }}>
                          {msg.edited && <span title="Edited">✏️ </span>}
                          {formatMessageTime(msg.timestamp)}
                        </div>
                      </div>
                      {/* Reactions */}
                      {Object.keys(msg.reactions).length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {Object.entries(msg.reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={(e) => { e.stopPropagation(); toggleReaction(msg.id, emoji); }}
                              style={{
                                padding: '2px 6px', borderRadius: '10px', fontSize: '12px',
                                border: users.includes('u1') ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
                                background: users.includes('u1') ? `${theme.accent}20` : 'transparent',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px',
                              }}
                              data-testid={`reaction-${msg.id}-${emoji}`}
                            >
                              {emoji} <span style={{ fontSize: '11px' }}>{users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Emoji picker */}
                      {showEmojiPicker === msg.id && (
                        <div style={{
                          position: 'absolute', bottom: '100%', [isOwn ? 'right' : 'left']: 0,
                          background: theme.sidebar, border: `1px solid ${theme.border}`, borderRadius: '12px',
                          padding: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '200px', zIndex: 10,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }} data-testid={`emoji-picker-${msg.id}`}>
                          {EMOJI_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={(e) => { e.stopPropagation(); toggleReaction(msg.id, emoji); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '4px', borderRadius: '4px' }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Message hover actions */}
                      {!isSelectionMode && !msg.deleted && (
                        <div style={{
                          position: 'absolute', top: '-8px', [isOwn ? 'left' : 'right']: '-8px',
                          display: 'none', gap: '2px', background: theme.sidebar, borderRadius: '8px', padding: '2px',
                          border: `1px solid ${theme.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }} className="message-actions">
                          <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(msg.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }} title="React">😀</button>
                          <button onClick={(e) => { e.stopPropagation(); setReplyingTo(msg.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }} title="Reply">↩️</button>
                          <button onClick={(e) => { e.stopPropagation(); setForwardingMessage(msg); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }} title="Forward">➡️</button>
                          {isOwn && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setEditingMessage(msg.id); setEditContent(msg.content); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }} title="Edit">✏️</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }} title="Delete">🗑️</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {typingUsers[activeConversationId] && (
                <div style={{ padding: '8px', fontSize: '13px', color: theme.textSecondary, fontStyle: 'italic' }} data-testid="typing-indicator">
                  {MOCK_USERS.find(u => u.id === typingUsers[activeConversationId])?.name || 'Someone'} is typing...
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Edit Message Bar */}
            {editingMessage && (
              <div style={{ padding: '8px 16px', borderTop: `1px solid ${theme.border}`, background: theme.sidebar, display: 'flex', alignItems: 'center', gap: '8px' }} data-testid="edit-bar">
                <span style={{ fontSize: '14px' }}>✏️ Editing message</span>
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') editMessage(editingMessage); if (e.key === 'Escape') { setEditingMessage(null); setEditContent(''); } }}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, outline: 'none' }}
                  autoFocus
                />
                <button onClick={() => editMessage(editingMessage)} style={{ background: theme.accent, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
                <button onClick={() => { setEditingMessage(null); setEditContent(''); }} style={{ background: 'none', border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: theme.text }}>Cancel</button>
              </div>
            )}

            {/* Reply Bar */}
            {replyingTo && !editingMessage && (
              <div style={{ padding: '8px 16px', borderTop: `1px solid ${theme.border}`, background: theme.sidebar, display: 'flex', alignItems: 'center', gap: '8px' }} data-testid="reply-bar">
                <span style={{ fontSize: '14px' }}>↩️</span>
                <span style={{ fontSize: '13px', color: theme.textSecondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Replying to: {activeMessages.find(m => m.id === replyingTo)?.content || 'message'}
                </span>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: theme.textSecondary }}>✕</button>
              </div>
            )}

            {/* Message Input */}
            {!editingMessage && (
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: '8px', alignItems: 'center', background: theme.sidebar }} data-testid="message-input-area">
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '4px' }} aria-label="Attach file" title="Attach">📎</button>
                <input
                  ref={messageInputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: '24px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, outline: 'none', fontSize: '14px' }}
                  data-testid="message-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  style={{
                    background: messageInput.trim() ? theme.accent : theme.border,
                    color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                    cursor: messageInput.trim() ? 'pointer' : 'default', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  data-testid="send-button"
                  aria-label="Send message"
                >
                  ➤
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: theme.sidebar,
            border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '4px', zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '160px',
          }}
          data-testid="context-menu"
          onClick={() => setContextMenu(null)}
        >
          {contextMenu.convId && (
            <>
              <button onClick={() => pinConversation(contextMenu.convId)} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: theme.text, fontSize: '13px', borderRadius: '4px' }}>
                {conversations.find(c => c.id === contextMenu.convId)?.pinned ? '📌 Unpin' : '📍 Pin'}
              </button>
              <button onClick={() => muteConversation(contextMenu.convId)} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: theme.text, fontSize: '13px', borderRadius: '4px' }}>
                {conversations.find(c => c.id === contextMenu.convId)?.muted ? '🔔 Unmute' : '🔇 Mute'}
              </button>
              <button onClick={() => markAsRead(contextMenu.convId)} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: theme.text, fontSize: '13px', borderRadius: '4px' }}>
                ✓ Mark as read
              </button>
              <button onClick={() => archiveConversation(contextMenu.convId)} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: theme.text, fontSize: '13px', borderRadius: '4px' }}>
                {conversations.find(c => c.id === contextMenu.convId)?.archived ? '📥 Unarchive' : '📦 Archive'}
              </button>
            </>
          )}
          {contextMenu.messageId && (
            <>
              <button onClick={() => { setReplyingTo(contextMenu.messageId); }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: theme.text, fontSize: '13px', borderRadius: '4px' }}>
                ↩️ Reply
              </button>
              <button onClick={() => {
                const msg = activeMessages.find(m => m.id === contextMenu.messageId);
                if (msg) setForwardingMessage(msg);
              }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: theme.text, fontSize: '13px', borderRadius: '4px' }}>
                ➡️ Forward
              </button>
              {contextMenu.isOwn && (
                <>
                  <button onClick={() => {
                    const msg = activeMessages.find(m => m.id === contextMenu.messageId);
                    if (msg) { setEditingMessage(msg.id); setEditContent(msg.content); }
                  }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: theme.text, fontSize: '13px', borderRadius: '4px' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => deleteMessage(contextMenu.messageId)} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#ef4444', fontSize: '13px', borderRadius: '4px' }}>
                    🗑️ Delete
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowUserProfile(null)} data-testid="user-profile-modal">
          <div style={{ background: theme.sidebar, borderRadius: '16px', padding: '24px', width: '320px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const user = MOCK_USERS.find(u => u.id === showUserProfile);
              if (!user) return <p>User not found</p>;
              return (
                <>
                  <div style={{ fontSize: '64px', marginBottom: '12px' }}>{user.avatar}</div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{user.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ONLINE_STATUSES[user.status]?.color }} />
                    <span style={{ fontSize: '13px', color: theme.textSecondary }}>{ONLINE_STATUSES[user.status]?.label}</span>
                  </div>
                  <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 12px 0' }}>{user.bio}</p>
                  <p style={{ color: theme.textSecondary, fontSize: '12px', margin: 0 }}>Last seen: {formatLastSeen(user.lastSeen)}</p>
                  <button onClick={() => { createDirectChat(user.id); setShowUserProfile(null); }} style={{ marginTop: '16px', padding: '8px 24px', background: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    Send Message
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Group Info Modal */}
      {showGroupInfo && activeConversation?.type === 'group' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowGroupInfo(false)} data-testid="group-info-modal">
          <div style={{ background: theme.sidebar, borderRadius: '16px', padding: '24px', width: '360px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>👥 {activeConversation.name}</h2>
            <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '0 0 16px 0' }}>
              {activeConversation.participants.length} members
            </p>
            <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', color: theme.textSecondary }}>Members</h3>
            {activeConversation.participants.map(pId => {
              const user = MOCK_USERS.find(u => u.id === pId);
              if (!user) return null;
              return (
                <div key={pId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ fontSize: '24px' }}>{user.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.name} {pId === 'u1' && '(You)'}</div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>{user.bio}</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ONLINE_STATUSES[user.status]?.color }} />
                </div>
              );
            })}
            <button onClick={() => setShowGroupInfo(false)} style={{ marginTop: '16px', padding: '8px 24px', background: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowNewChat(false)} data-testid="new-chat-modal">
          <div style={{ background: theme.sidebar, borderRadius: '16px', padding: '24px', width: '340px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>New Chat</h2>
            <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '0 0 12px 0' }}>Select a user to start a conversation</p>
            {MOCK_USERS.filter(u => u.id !== 'u1').map(user => (
              <div
                key={user.id}
                onClick={() => createDirectChat(user.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px',
                  cursor: 'pointer', borderRadius: '8px', borderBottom: `1px solid ${theme.border}`,
                }}
                data-testid={`new-chat-user-${user.id}`}
              >
                <span style={{ fontSize: '24px' }}>{user.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: theme.textSecondary }}>{ONLINE_STATUSES[user.status]?.label}</div>
                </div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ONLINE_STATUSES[user.status]?.color }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => { setShowNewGroup(false); setNewGroupName(''); setNewGroupMembers([]); }} data-testid="new-group-modal">
          <div style={{ background: theme.sidebar, borderRadius: '16px', padding: '24px', width: '360px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>New Group</h2>
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, outline: 'none', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
              data-testid="group-name-input"
            />
            <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '0 0 8px 0' }}>Select members ({newGroupMembers.length} selected)</p>
            {MOCK_USERS.filter(u => u.id !== 'u1').map(user => (
              <label
                key={user.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
                  cursor: 'pointer', borderRadius: '8px', borderBottom: `1px solid ${theme.border}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={newGroupMembers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNewGroupMembers(prev => [...prev, user.id]);
                    } else {
                      setNewGroupMembers(prev => prev.filter(id => id !== user.id));
                    }
                  }}
                  data-testid={`group-member-${user.id}`}
                />
                <span style={{ fontSize: '20px' }}>{user.avatar}</span>
                <span style={{ fontSize: '14px' }}>{user.name}</span>
              </label>
            ))}
            <button
              onClick={createGroupChat}
              disabled={!newGroupName.trim() || newGroupMembers.length === 0}
              style={{
                marginTop: '16px', padding: '10px 24px', background: newGroupName.trim() && newGroupMembers.length > 0 ? theme.accent : theme.border,
                color: '#fff', border: 'none', borderRadius: '8px', cursor: newGroupName.trim() && newGroupMembers.length > 0 ? 'pointer' : 'default', fontSize: '14px', width: '100%',
              }}
              data-testid="create-group-button"
            >
              Create Group
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowSettings(false)} data-testid="settings-modal">
          <div style={{ background: theme.sidebar, borderRadius: '16px', padding: '24px', width: '360px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>⚙️ Settings</h2>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: theme.textSecondary }}>Appearance</h3>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '14px' }}>Dark Mode</span>
                <button
                  onClick={() => setIsDarkMode(prev => !prev)}
                  style={{ background: isDarkMode ? theme.accent : theme.border, color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px' }}
                  aria-label="Toggle dark mode"
                  data-testid="dark-mode-toggle"
                >
                  {isDarkMode ? '🌙 On' : '☀️ Off'}
                </button>
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: theme.textSecondary }}>Notifications</h3>
              {Object.entries(notificationSettings).map(([key, value]) => (
                <label key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>{key}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    data-testid={`notif-${key}`}
                  />
                </label>
              ))}
            </div>

            <button onClick={() => setShowSettings(false)} style={{ padding: '10px 24px', background: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%' }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
      {forwardingMessage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setForwardingMessage(null)} data-testid="forward-modal">
          <div style={{ background: theme.sidebar, borderRadius: '16px', padding: '24px', width: '340px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Forward Message</h2>
            <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '0 0 12px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              &quot;{forwardingMessage.content}&quot;
            </p>
            <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 12px 0' }}>Select a conversation:</p>
            {conversations.filter(c => !c.archived && c.id !== activeConversationId).map(conv => (
              <div
                key={conv.id}
                onClick={() => forwardMessage(conv.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px',
                  cursor: 'pointer', borderRadius: '8px', borderBottom: `1px solid ${theme.border}`,
                }}
                data-testid={`forward-to-${conv.id}`}
              >
                <span style={{ fontSize: '20px' }}>{getConversationAvatar(conv)}</span>
                <span style={{ fontSize: '14px' }}>{getConversationName(conv)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .message-actions { display: none !important; }
        div:hover > .message-actions { display: flex !important; }
        * { scrollbar-width: thin; scrollbar-color: ${theme.border} transparent; }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }
      `}</style>
    </div>
  );
}
