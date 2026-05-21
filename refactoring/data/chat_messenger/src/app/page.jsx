import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CURRENT_USER = { id: 'u1', name: 'You', avatar: '👤', status: 'online' };

const USERS = [
  { id: 'u1', name: 'You', avatar: '👤', status: 'online', lastSeen: Date.now() },
  { id: 'u2', name: 'Alice Chen', avatar: '👩‍💻', status: 'online', lastSeen: Date.now() },
  { id: 'u3', name: 'Bob Martinez', avatar: '👨‍🎨', status: 'away', lastSeen: Date.now() - 300000 },
  { id: 'u4', name: 'Carol Williams', avatar: '👩‍💼', status: 'offline', lastSeen: Date.now() - 3600000 },
  { id: 'u5', name: 'Dave Johnson', avatar: '👨‍🔬', status: 'online', lastSeen: Date.now() },
  { id: 'u6', name: 'Eve Park', avatar: '👩‍🎤', status: 'busy', lastSeen: Date.now() - 60000 },
  { id: 'u7', name: 'Frank Lee', avatar: '👨‍🍳', status: 'offline', lastSeen: Date.now() - 7200000 },
];

const STATUS_COLORS = {
  online: '#22c55e',
  away: '#eab308',
  busy: '#ef4444',
  offline: '#9ca3af',
};

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

const INITIAL_CONVERSATIONS = [
  {
    id: 'conv1',
    type: 'dm',
    participants: ['u1', 'u2'],
    name: null,
    icon: null,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'conv2',
    type: 'dm',
    participants: ['u1', 'u3'],
    name: null,
    icon: null,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'conv3',
    type: 'group',
    participants: ['u1', 'u2', 'u3', 'u5'],
    name: 'Project Alpha',
    icon: '🚀',
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'conv4',
    type: 'dm',
    participants: ['u1', 'u4'],
    name: null,
    icon: null,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'conv5',
    type: 'group',
    participants: ['u1', 'u2', 'u5', 'u6'],
    name: 'Design Team',
    icon: '🎨',
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'conv6',
    type: 'dm',
    participants: ['u1', 'u5'],
    name: null,
    icon: null,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'conv7',
    type: 'group',
    participants: ['u1', 'u3', 'u4', 'u6', 'u7'],
    name: 'General Chat',
    icon: '💬',
    createdAt: Date.now() - 86400000 * 25,
  },
];

const INITIAL_MESSAGES = [
  { id: 'm1', conversationId: 'conv1', senderId: 'u2', text: 'Hey! How are you doing?', timestamp: Date.now() - 86400000 * 2, edited: false, pinned: false, reactions: { '👍': ['u1'] }, replyTo: null },
  { id: 'm2', conversationId: 'conv1', senderId: 'u1', text: 'Doing great! Working on the new feature.', timestamp: Date.now() - 86400000 * 2 + 60000, edited: false, pinned: false, reactions: {}, replyTo: null },
  { id: 'm3', conversationId: 'conv1', senderId: 'u2', text: 'Awesome! Let me know if you need any help.', timestamp: Date.now() - 86400000 * 2 + 120000, edited: false, pinned: true, reactions: { '❤️': ['u1'] }, replyTo: null },
  { id: 'm4', conversationId: 'conv1', senderId: 'u1', text: 'Will do! Thanks Alice.', timestamp: Date.now() - 86400000 * 2 + 180000, edited: false, pinned: false, reactions: {}, replyTo: 'm3' },
  { id: 'm5', conversationId: 'conv1', senderId: 'u2', text: 'By the way, the design review is tomorrow at 3 PM.', timestamp: Date.now() - 86400000, edited: false, pinned: true, reactions: {}, replyTo: null },
  { id: 'm6', conversationId: 'conv1', senderId: 'u1', text: "Got it! I'll prepare the mockups.", timestamp: Date.now() - 86400000 + 60000, edited: true, pinned: false, reactions: { '👍': ['u2'] }, replyTo: 'm5' },
  { id: 'm7', conversationId: 'conv2', senderId: 'u3', text: 'Did you see the latest mockups?', timestamp: Date.now() - 86400000 * 3, edited: false, pinned: false, reactions: {}, replyTo: null },
  { id: 'm8', conversationId: 'conv2', senderId: 'u1', text: 'Yes! They look amazing. Great work Bob.', timestamp: Date.now() - 86400000 * 3 + 60000, edited: false, pinned: false, reactions: { '🎉': ['u3'] }, replyTo: null },
  { id: 'm9', conversationId: 'conv2', senderId: 'u3', text: 'Thanks! I spent a lot of time on the animations.', timestamp: Date.now() - 86400000 * 3 + 120000, edited: false, pinned: false, reactions: {}, replyTo: null },
  { id: 'm10', conversationId: 'conv3', senderId: 'u2', text: 'Team meeting at 2 PM today. Please review the sprint backlog.', timestamp: Date.now() - 86400000, edited: false, pinned: true, reactions: { '👍': ['u1', 'u3', 'u5'] }, replyTo: null },
  { id: 'm11', conversationId: 'conv3', senderId: 'u5', text: "I'll be there. Just finishing up the API docs.", timestamp: Date.now() - 86400000 + 300000, edited: false, pinned: false, reactions: {}, replyTo: 'm10' },
  { id: 'm12', conversationId: 'conv3', senderId: 'u3', text: 'Can we also discuss the new color palette?', timestamp: Date.now() - 86400000 + 600000, edited: false, pinned: false, reactions: { '👍': ['u2'] }, replyTo: null },
  { id: 'm13', conversationId: 'conv3', senderId: 'u1', text: 'Sure, adding it to the agenda.', timestamp: Date.now() - 86400000 + 900000, edited: false, pinned: false, reactions: {}, replyTo: 'm12' },
  { id: 'm14', conversationId: 'conv4', senderId: 'u4', text: 'The deployment scripts need updating. Can you take a look?', timestamp: Date.now() - 86400000 * 5, edited: false, pinned: false, reactions: {}, replyTo: null },
  { id: 'm15', conversationId: 'conv4', senderId: 'u1', text: "I'll check them this afternoon.", timestamp: Date.now() - 86400000 * 5 + 60000, edited: false, pinned: false, reactions: {}, replyTo: null },
  { id: 'm16', conversationId: 'conv5', senderId: 'u6', text: 'New brand guidelines are ready for review!', timestamp: Date.now() - 86400000 * 2, edited: false, pinned: true, reactions: { '🎉': ['u1', 'u2', 'u5'] }, replyTo: null },
  { id: 'm17', conversationId: 'conv5', senderId: 'u2', text: 'Love the new color scheme!', timestamp: Date.now() - 86400000 * 2 + 120000, edited: false, pinned: false, reactions: { '❤️': ['u6'] }, replyTo: 'm16' },
  { id: 'm18', conversationId: 'conv6', senderId: 'u5', text: 'Have you reviewed the pull request?', timestamp: Date.now() - 86400000 * 4, edited: false, pinned: false, reactions: {}, replyTo: null },
  { id: 'm19', conversationId: 'conv6', senderId: 'u1', text: "Not yet, I'll review it today.", timestamp: Date.now() - 86400000 * 4 + 60000, edited: false, pinned: false, reactions: {}, replyTo: null },
  { id: 'm20', conversationId: 'conv7', senderId: 'u6', text: 'Happy Friday everyone! 🎉', timestamp: Date.now() - 86400000, edited: false, pinned: false, reactions: { '🎉': ['u1', 'u3', 'u4', 'u7'], '❤️': ['u1'] }, replyTo: null },
  { id: 'm21', conversationId: 'conv7', senderId: 'u7', text: 'Weekend plans anyone?', timestamp: Date.now() - 86400000 + 300000, edited: false, pinned: false, reactions: {}, replyTo: null },
  { id: 'm22', conversationId: 'conv7', senderId: 'u3', text: 'Going hiking! 🏔️', timestamp: Date.now() - 86400000 + 600000, edited: false, pinned: false, reactions: { '😮': ['u7'] }, replyTo: 'm21' },
];

const INITIAL_READ_STATUS = {
  conv1: Date.now() - 86400000 * 2 + 100000,
  conv2: Date.now() - 86400000 * 3 + 60000,
  conv3: Date.now() - 86400000 + 500000,
  conv4: Date.now() - 86400000 * 5 + 60000,
  conv5: Date.now() - 86400000 * 2,
  conv6: Date.now() - 86400000 * 4 + 60000,
  conv7: Date.now() - 86400000 + 100000,
};

export default function ChatMessenger() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState('conv1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationFilter, setConversationFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [readStatus, setReadStatus] = useState(INITIAL_READ_STATUS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParticipants, setNewGroupParticipants] = useState([]);
  const [userStatus, setUserStatus] = useState('online');
  const [notificationSound, setNotificationSound] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const messageEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('chatTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
    const savedNotifSound = localStorage.getItem('chatNotificationSound');
    if (savedNotifSound !== null) setNotificationSound(savedNotifSound === 'true');
    const savedShowTimestamps = localStorage.getItem('chatShowTimestamps');
    if (savedShowTimestamps !== null) setShowTimestamps(savedShowTimestamps === 'true');
    const savedCompact = localStorage.getItem('chatCompactMode');
    if (savedCompact !== null) setCompactMode(savedCompact === 'true');
    const savedStatus = localStorage.getItem('chatUserStatus');
    if (savedStatus) setUserStatus(savedStatus);
    try {
      const savedReadStatus = localStorage.getItem('chatReadStatus');
      if (savedReadStatus) setReadStatus(JSON.parse(savedReadStatus));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('chatTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('chatNotificationSound', String(notificationSound));
  }, [notificationSound]);

  useEffect(() => {
    localStorage.setItem('chatShowTimestamps', String(showTimestamps));
  }, [showTimestamps]);

  useEffect(() => {
    localStorage.setItem('chatCompactMode', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem('chatUserStatus', userStatus);
  }, [userStatus]);

  useEffect(() => {
    localStorage.setItem('chatReadStatus', JSON.stringify(readStatus));
  }, [readStatus]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversationId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingMessageId) {
          setEditingMessageId(null);
          setEditingText('');
        } else if (showSettings) {
          setShowSettings(false);
        } else if (showNewConversation) {
          setShowNewConversation(false);
        } else if (showPinnedMessages) {
          setShowPinnedMessages(false);
        } else if (showConversationInfo) {
          setShowConversationInfo(false);
        } else if (showMessageSearch) {
          setShowMessageSearch(false);
          setMessageSearchQuery('');
        } else if (showEmojiPicker) {
          setShowEmojiPicker(null);
        } else if (replyingTo) {
          setReplyingTo(null);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('[data-search-input]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingMessageId, showSettings, showNewConversation, showPinnedMessages, showConversationInfo, showMessageSearch, showEmojiPicker, replyingTo]);

  const getUserById = useCallback((id) => USERS.find((u) => u.id === id), []);

  const getConversationName = useCallback(
    (conv) => {
      if (conv.name) return conv.name;
      const otherParticipants = conv.participants.filter((p) => p !== CURRENT_USER.id);
      return otherParticipants.map((p) => getUserById(p)?.name || 'Unknown').join(', ');
    },
    [getUserById]
  );

  const getConversationAvatar = useCallback(
    (conv) => {
      if (conv.icon) return conv.icon;
      const otherParticipant = conv.participants.find((p) => p !== CURRENT_USER.id);
      return getUserById(otherParticipant)?.avatar || '👤';
    },
    [getUserById]
  );

  const getUnreadCount = useCallback(
    (convId) => {
      const lastRead = readStatus[convId] || 0;
      return messages.filter(
        (m) => m.conversationId === convId && m.senderId !== CURRENT_USER.id && m.timestamp > lastRead
      ).length;
    },
    [messages, readStatus]
  );

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + getUnreadCount(c.id), 0),
    [conversations, getUnreadCount]
  );

  const getLastMessage = useCallback(
    (convId) => {
      const convMessages = messages.filter((m) => m.conversationId === convId);
      return convMessages.length > 0 ? convMessages[convMessages.length - 1] : null;
    },
    [messages]
  );

  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conv) => {
        const name = getConversationName(conv).toLowerCase();
        if (name.includes(query)) return true;
        const lastMsg = getLastMessage(conv.id);
        if (lastMsg && lastMsg.text.toLowerCase().includes(query)) return true;
        return false;
      });
    }
    if (conversationFilter === 'dm') {
      filtered = filtered.filter((c) => c.type === 'dm');
    } else if (conversationFilter === 'group') {
      filtered = filtered.filter((c) => c.type === 'group');
    } else if (conversationFilter === 'unread') {
      filtered = filtered.filter((c) => getUnreadCount(c.id) > 0);
    }
    filtered.sort((a, b) => {
      const lastA = getLastMessage(a.id);
      const lastB = getLastMessage(b.id);
      const timeA = lastA ? lastA.timestamp : a.createdAt;
      const timeB = lastB ? lastB.timestamp : b.createdAt;
      return timeB - timeA;
    });
    return filtered;
  }, [conversations, searchQuery, conversationFilter, getConversationName, getLastMessage, getUnreadCount]);

  const activeMessages = useMemo(() => {
    let msgs = messages.filter((m) => m.conversationId === activeConversationId);
    if (messageSearchQuery) {
      const query = messageSearchQuery.toLowerCase();
      msgs = msgs.filter((m) => m.text.toLowerCase().includes(query));
    }
    return msgs;
  }, [messages, activeConversationId, messageSearchQuery]);

  const pinnedMessages = useMemo(
    () => messages.filter((m) => m.conversationId === activeConversationId && m.pinned),
    [messages, activeConversationId]
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const handleSendMessage = useCallback(() => {
    const text = messageInput.trim();
    if (!text) return;
    const newMsg = {
      id: `m${Date.now()}`,
      conversationId: activeConversationId,
      senderId: CURRENT_USER.id,
      text,
      timestamp: Date.now(),
      edited: false,
      pinned: false,
      reactions: {},
      replyTo: replyingTo,
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
    setReplyingTo(null);
    setReadStatus((prev) => ({ ...prev, [activeConversationId]: Date.now() }));
  }, [messageInput, activeConversationId, replyingTo]);

  const handleDeleteMessage = useCallback((msgId) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  }, []);

  const handleEditMessage = useCallback(
    (msgId) => {
      const updated = editingText.trim();
      if (!updated) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: updated, edited: true } : m))
      );
      setEditingMessageId(null);
      setEditingText('');
    },
    [editingText]
  );

  const handleTogglePin = useCallback((msgId) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, pinned: !m.pinned } : m)));
  }, []);

  const handleAddReaction = useCallback((msgId, emoji) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const reactions = { ...m.reactions };
        if (reactions[emoji]?.includes(CURRENT_USER.id)) {
          reactions[emoji] = reactions[emoji].filter((id) => id !== CURRENT_USER.id);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...(reactions[emoji] || []), CURRENT_USER.id];
        }
        return { ...m, reactions };
      })
    );
    setShowEmojiPicker(null);
  }, []);

  const handleSelectConversation = useCallback((convId) => {
    setActiveConversationId(convId);
    setReadStatus((prev) => ({ ...prev, [convId]: Date.now() }));
    setShowMessageSearch(false);
    setMessageSearchQuery('');
    setReplyingTo(null);
    setEditingMessageId(null);
    setEditingText('');
  }, []);

  const handleCreateGroup = useCallback(() => {
    if (!newGroupName.trim() || newGroupParticipants.length === 0) return;
    const newConv = {
      id: `conv${Date.now()}`,
      type: 'group',
      participants: [CURRENT_USER.id, ...newGroupParticipants],
      name: newGroupName.trim(),
      icon: '👥',
      createdAt: Date.now(),
    };
    setConversations((prev) => [...prev, newConv]);
    setShowNewConversation(false);
    setNewGroupName('');
    setNewGroupParticipants([]);
    setActiveConversationId(newConv.id);
  }, [newGroupName, newGroupParticipants]);

  const handleLeaveGroup = useCallback(
    (convId) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, participants: c.participants.filter((p) => p !== CURRENT_USER.id) }
            : c
        )
      );
      if (activeConversationId === convId) {
        const remaining = conversations.filter((c) => c.id !== convId);
        if (remaining.length > 0) setActiveConversationId(remaining[0].id);
      }
    },
    [activeConversationId, conversations]
  );

  const formatTimestamp = useCallback((ts) => {
    const date = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);

  const formatMessageTime = useCallback((ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const getStatusForConversation = useCallback(
    (conv) => {
      if (conv.type === 'group') return null;
      const otherUserId = conv.participants.find((p) => p !== CURRENT_USER.id);
      return getUserById(otherUserId)?.status || 'offline';
    },
    [getUserById]
  );

  const getTypingText = useCallback(
    (convId) => {
      const typing = typingUsers[convId];
      if (!typing || typing.length === 0) return null;
      const names = typing.map((uid) => getUserById(uid)?.name || 'Someone');
      if (names.length === 1) return `${names[0]} is typing...`;
      if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
      return `${names[0]} and ${names.length - 1} others are typing...`;
    },
    [typingUsers, getUserById]
  );

  const simulateTyping = useCallback((convId, userId) => {
    setTypingUsers((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []).filter((id) => id !== userId), userId],
    }));
    setTimeout(() => {
      setTypingUsers((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).filter((id) => id !== userId),
      }));
    }, 3000);
  }, []);

  const bgColor = isDarkMode ? '#1a1a2e' : '#ffffff';
  const textColor = isDarkMode ? '#e0e0e0' : '#1a1a1a';
  const secondaryText = isDarkMode ? '#a0a0a0' : '#666666';
  const borderColor = isDarkMode ? '#2d2d44' : '#e0e0e0';
  const sidebarBg = isDarkMode ? '#16213e' : '#f5f5f5';
  const hoverBg = isDarkMode ? '#1f3460' : '#e8e8e8';
  const activeBg = isDarkMode ? '#1a3a6b' : '#dbeafe';
  const inputBg = isDarkMode ? '#2d2d44' : '#f0f0f0';
  const messageBubbleSent = isDarkMode ? '#1a3a6b' : '#3b82f6';
  const messageBubbleReceived = isDarkMode ? '#2d2d44' : '#e5e7eb';

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', background: bgColor, color: textColor }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? '70px' : '320px',
          borderRight: `1px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          background: sidebarBg,
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>ChatApp</span>
              {totalUnread > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  data-testid="total-unread-badge"
                >
                  {totalUnread}
                </span>
              )}
            </div>
          )}
          <button
            aria-label="Toggle sidebar"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* User Status */}
        {!sidebarCollapsed && (
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>{CURRENT_USER.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{CURRENT_USER.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: STATUS_COLORS[userStatus],
                    display: 'inline-block',
                  }}
                  data-testid="user-status-indicator"
                />
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                  aria-label="Set your status"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: secondaryText,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <button
              aria-label="Open settings"
              onClick={() => setShowSettings(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
            >
              ⚙️
            </button>
          </div>
        )}

        {/* Search and Filter */}
        {!sidebarCollapsed && (
          <div style={{ padding: '12px 16px' }}>
            <input
              data-search-input
              type="text"
              placeholder="Search conversations... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: textColor,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {['all', 'dm', 'group', 'unread'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setConversationFilter(filter)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: conversationFilter === filter ? '#3b82f6' : inputBg,
                    color: conversationFilter === filter ? 'white' : secondaryText,
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {filter === 'dm' ? 'DMs' : filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New Conversation Button */}
        {!sidebarCollapsed && (
          <div style={{ padding: '0 16px 8px' }}>
            <button
              onClick={() => setShowNewConversation(true)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: `1px dashed ${borderColor}`,
                background: 'transparent',
                color: '#3b82f6',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              + New Group
            </button>
          </div>
        )}

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 && !sidebarCollapsed && (
            <div style={{ padding: '20px', textAlign: 'center', color: secondaryText }}>
              No conversations found
            </div>
          )}
          {filteredConversations.map((conv) => {
            const lastMsg = getLastMessage(conv.id);
            const unreadCount = getUnreadCount(conv.id);
            const isActive = conv.id === activeConversationId;
            const status = getStatusForConversation(conv);
            const typingText = getTypingText(conv.id);

            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                role="button"
                tabIndex={0}
                aria-label={`Conversation with ${getConversationName(conv)}`}
                style={{
                  padding: sidebarCollapsed ? '12px 8px' : '12px 16px',
                  cursor: 'pointer',
                  background: isActive ? activeBg : 'transparent',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <span style={{ fontSize: sidebarCollapsed ? '24px' : '32px' }}>{getConversationAvatar(conv)}</span>
                  {status && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: STATUS_COLORS[status],
                        border: `2px solid ${sidebarBg}`,
                      }}
                      data-testid={`status-${conv.id}`}
                    />
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: unreadCount > 0 ? 700 : 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getConversationName(conv)}
                      </span>
                      {lastMsg && (
                        <span style={{ fontSize: '11px', color: secondaryText, flexShrink: 0 }}>
                          {formatTimestamp(lastMsg.timestamp)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: typingText ? '#3b82f6' : secondaryText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: typingText ? 'italic' : 'normal' }}>
                        {typingText || (lastMsg ? `${lastMsg.senderId === CURRENT_USER.id ? 'You: ' : ''}${lastMsg.text}` : 'No messages yet')}
                      </span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            borderRadius: '10px',
                            padding: '1px 7px',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                          data-testid={`unread-${conv.id}`}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {sidebarCollapsed && unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        {activeConversation && (
          <div
            style={{
              padding: '12px 20px',
              borderBottom: `1px solid ${borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: bgColor,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>{getConversationAvatar(activeConversation)}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>
                  {getConversationName(activeConversation)}
                </div>
                <div style={{ fontSize: '12px', color: secondaryText }}>
                  {activeConversation.type === 'group'
                    ? `${activeConversation.participants.length} members`
                    : (() => {
                        const otherUserId = activeConversation.participants.find((p) => p !== CURRENT_USER.id);
                        const otherUser = getUserById(otherUserId);
                        if (!otherUser) return '';
                        if (otherUser.status === 'online') return 'Online';
                        return `Last seen ${formatTimestamp(otherUser.lastSeen)}`;
                      })()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                aria-label="Search messages"
                onClick={() => setShowMessageSearch(!showMessageSearch)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '6px' }}
              >
                🔍
              </button>
              <button
                aria-label="Pinned messages"
                onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '6px', position: 'relative' }}
              >
                📌
                {pinnedMessages.length > 0 && (
                  <span style={{ position: 'absolute', top: '0', right: '0', background: '#f59e0b', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pinnedMessages.length}
                  </span>
                )}
              </button>
              <button
                aria-label="Conversation info"
                onClick={() => setShowConversationInfo(!showConversationInfo)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '6px' }}
              >
                ℹ️
              </button>
              <button
                aria-label="Toggle theme"
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '6px' }}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        )}

        {/* Message Search Bar */}
        {showMessageSearch && (
          <div style={{ padding: '8px 20px', borderBottom: `1px solid ${borderColor}`, background: inputBg }}>
            <input
              type="text"
              placeholder="Search in conversation..."
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
              aria-label="Search in conversation"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                color: textColor,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
          </div>
        )}

        {/* Pinned Messages Panel */}
        {showPinnedMessages && (
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${borderColor}`, background: isDarkMode ? '#1f2937' : '#fefce8', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>📌 Pinned Messages</span>
              <button onClick={() => setShowPinnedMessages(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>×</button>
            </div>
            {pinnedMessages.length === 0 ? (
              <div style={{ color: secondaryText, fontSize: '13px' }}>No pinned messages</div>
            ) : (
              pinnedMessages.map((msg) => (
                <div key={msg.id} style={{ padding: '6px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{getUserById(msg.senderId)?.name}: </span>
                  <span>{msg.text}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeMessages.map((msg) => {
            const isMine = msg.senderId === CURRENT_USER.id;
            const sender = getUserById(msg.senderId);
            const replyMsg = msg.replyTo ? messages.find((m) => m.id === msg.replyTo) : null;

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: compactMode ? '4px' : '12px',
                }}
                data-testid={`message-${msg.id}`}
              >
                {/* Reply reference */}
                {replyMsg && (
                  <div style={{ fontSize: '11px', color: secondaryText, marginBottom: '2px', paddingLeft: isMine ? '0' : '40px', paddingRight: isMine ? '8px' : '0' }}>
                    ↩ Replying to {getUserById(replyMsg.senderId)?.name}: {replyMsg.text.substring(0, 50)}{replyMsg.text.length > 50 ? '...' : ''}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexDirection: isMine ? 'row-reverse' : 'row', maxWidth: '70%' }}>
                  {!isMine && !compactMode && <span style={{ fontSize: '24px', flexShrink: 0 }}>{sender?.avatar}</span>}

                  <div>
                    {!isMine && activeConversation?.type === 'group' && !compactMode && (
                      <div style={{ fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '2px' }}>
                        {sender?.name}
                      </div>
                    )}

                    {editingMessageId === msg.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditMessage(msg.id);
                            if (e.key === 'Escape') { setEditingMessageId(null); setEditingText(''); }
                          }}
                          aria-label="Edit message"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            background: inputBg,
                            color: textColor,
                            fontSize: '14px',
                            flex: 1,
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditMessage(msg.id)}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingMessageId(null); setEditingText(''); }}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: 'transparent', color: textColor, cursor: 'pointer', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '8px 14px',
                          borderRadius: '16px',
                          background: isMine ? messageBubbleSent : messageBubbleReceived,
                          color: isMine ? 'white' : textColor,
                          fontSize: '14px',
                          lineHeight: '1.4',
                          position: 'relative',
                        }}
                      >
                        {msg.pinned && <span style={{ position: 'absolute', top: '-8px', right: '-4px', fontSize: '12px' }}>📌</span>}
                        <div>{msg.text}</div>
                        {msg.edited && <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '4px' }}>(edited)</span>}
                        {showTimestamps && (
                          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px', textAlign: isMine ? 'right' : 'left' }}>
                            {formatMessageTime(msg.timestamp)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reactions */}
                    {Object.keys(msg.reactions).length > 0 && editingMessageId !== msg.id && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '12px',
                              border: users.includes(CURRENT_USER.id) ? '2px solid #3b82f6' : `1px solid ${borderColor}`,
                              background: users.includes(CURRENT_USER.id) ? (isDarkMode ? '#1a3a6b' : '#dbeafe') : 'transparent',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                            aria-label={`${emoji} reaction by ${users.length} users`}
                          >
                            <span>{emoji}</span>
                            <span style={{ fontSize: '10px', color: secondaryText }}>{users.length}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    {editingMessageId !== msg.id && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', opacity: 0.7 }}>
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                          aria-label="Add reaction"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                        >
                          😀
                        </button>
                        <button
                          onClick={() => setReplyingTo(msg.id)}
                          aria-label="Reply to message"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                        >
                          ↩
                        </button>
                        <button
                          onClick={() => handleTogglePin(msg.id)}
                          aria-label={msg.pinned ? 'Unpin message' : 'Pin message'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                        >
                          📌
                        </button>
                        {isMine && (
                          <>
                            <button
                              onClick={() => { setEditingMessageId(msg.id); setEditingText(msg.text); }}
                              aria-label="Edit message"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              aria-label="Delete message"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Emoji Picker */}
                    {showEmojiPicker === msg.id && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', padding: '6px', borderRadius: '8px', background: inputBg, border: `1px solid ${borderColor}` }}>
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                            aria-label={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        {/* Typing Indicator */}
        {getTypingText(activeConversationId) && (
          <div style={{ padding: '4px 20px', fontSize: '12px', color: secondaryText, fontStyle: 'italic' }} data-testid="typing-indicator">
            {getTypingText(activeConversationId)}
          </div>
        )}

        {/* Reply Bar */}
        {replyingTo && (
          <div style={{ padding: '8px 20px', borderTop: `1px solid ${borderColor}`, background: isDarkMode ? '#1f2937' : '#f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: secondaryText }}>
              ↩ Replying to{' '}
              <span style={{ fontWeight: 600 }}>
                {getUserById(messages.find((m) => m.id === replyingTo)?.senderId)?.name}
              </span>
              : {messages.find((m) => m.id === replyingTo)?.text.substring(0, 60)}
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              aria-label="Cancel reply"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Message Input */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${borderColor}`, display: 'flex', gap: '8px', alignItems: 'center', background: bgColor }}>
          <input
            ref={messageInputRef}
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            aria-label="Message input"
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '24px',
              border: `1px solid ${borderColor}`,
              background: inputBg,
              color: textColor,
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            aria-label="Send message"
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              border: 'none',
              background: messageInput.trim() ? '#3b82f6' : borderColor,
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: messageInput.trim() ? 'pointer' : 'default',
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Conversation Info Panel */}
      {showConversationInfo && activeConversation && (
        <div
          style={{
            width: '300px',
            borderLeft: `1px solid ${borderColor}`,
            background: sidebarBg,
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Conversation Info</span>
            <button onClick={() => setShowConversationInfo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '48px' }}>{getConversationAvatar(activeConversation)}</span>
            <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '8px' }}>
              {getConversationName(activeConversation)}
            </div>
            <div style={{ color: secondaryText, fontSize: '13px' }}>
              {activeConversation.type === 'group' ? 'Group' : 'Direct Message'}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
              Members ({activeConversation.participants.length})
            </div>
            {activeConversation.participants.map((pid) => {
              const user = getUserById(pid);
              if (!user) return null;
              return (
                <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <span style={{ fontSize: '20px' }}>{user.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                      {user.name} {user.id === CURRENT_USER.id && '(You)'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLORS[user.status], display: 'inline-block' }} />
                      <span style={{ fontSize: '11px', color: secondaryText, textTransform: 'capitalize' }}>{user.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {activeConversation.type === 'group' && (
            <button
              onClick={() => handleLeaveGroup(activeConversation.id)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '12px',
              }}
            >
              Leave Group
            </button>
          )}

          <div style={{ marginTop: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Shared Media</div>
            <div style={{ color: secondaryText, fontSize: '13px' }}>No shared media yet</div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
        >
          <div style={{ background: bgColor, borderRadius: '16px', padding: '24px', width: '400px', maxHeight: '80vh', overflowY: 'auto', color: textColor }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>Settings</span>
              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textColor }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Appearance</div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                <span>Dark Mode</span>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode(!isDarkMode)}
                  aria-label="Toggle dark mode"
                />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                <span>Compact Mode</span>
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={() => setCompactMode(!compactMode)}
                  aria-label="Toggle compact mode"
                />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                <span>Show Timestamps</span>
                <input
                  type="checkbox"
                  checked={showTimestamps}
                  onChange={() => setShowTimestamps(!showTimestamps)}
                  aria-label="Toggle timestamps"
                />
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Notifications</div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
                <span>Notification Sound</span>
                <input
                  type="checkbox"
                  checked={notificationSound}
                  onChange={() => setNotificationSound(!notificationSound)}
                  aria-label="Toggle notification sound"
                />
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Status</div>
              <select
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value)}
                aria-label="Set status in settings"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  background: inputBg,
                  color: textColor,
                  fontSize: '14px',
                }}
              >
                <option value="online">🟢 Online</option>
                <option value="away">🟡 Away</option>
                <option value="busy">🔴 Busy</option>
                <option value="offline">⚫ Offline</option>
              </select>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewConversation(false); }}
        >
          <div style={{ background: bgColor, borderRadius: '16px', padding: '24px', width: '400px', color: textColor }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>New Group Conversation</span>
              <button
                onClick={() => setShowNewConversation(false)}
                aria-label="Close new conversation"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textColor }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '4px' }}>Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name..."
                aria-label="Group name"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  background: inputBg,
                  color: textColor,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>Select Members</label>
              {USERS.filter((u) => u.id !== CURRENT_USER.id).map((user) => (
                <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newGroupParticipants.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewGroupParticipants((prev) => [...prev, user.id]);
                      } else {
                        setNewGroupParticipants((prev) => prev.filter((p) => p !== user.id));
                      }
                    }}
                  />
                  <span style={{ fontSize: '20px' }}>{user.avatar}</span>
                  <span style={{ fontSize: '14px' }}>{user.name}</span>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: STATUS_COLORS[user.status],
                      display: 'inline-block',
                    }}
                  />
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowNewConversation(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  color: textColor,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || newGroupParticipants.length === 0}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: newGroupName.trim() && newGroupParticipants.length > 0 ? '#3b82f6' : borderColor,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: newGroupName.trim() && newGroupParticipants.length > 0 ? 'pointer' : 'default',
                }}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
