"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Seed Data ──────────────────────────────────────────────────────────────

const CURRENT_USER = {
  id: "u1",
  name: "Alex Rivera",
  avatar: "🧑‍💻",
  status: "online",
  bio: "Full-stack developer",
};

const INITIAL_USERS = [
  CURRENT_USER,
  {
    id: "u2",
    name: "Jordan Lee",
    avatar: "👩‍🎨",
    status: "online",
    bio: "UI/UX Designer",
  },
  {
    id: "u3",
    name: "Sam Taylor",
    avatar: "👨‍🔬",
    status: "away",
    bio: "Data Scientist",
  },
  {
    id: "u4",
    name: "Casey Morgan",
    avatar: "👩‍💼",
    status: "offline",
    bio: "Product Manager",
  },
  {
    id: "u5",
    name: "Riley Chen",
    avatar: "🧑‍🏫",
    status: "online",
    bio: "Tech Lead",
  },
  {
    id: "u6",
    name: "Morgan Park",
    avatar: "👨‍🎤",
    status: "dnd",
    bio: "DevOps Engineer",
  },
];

const INITIAL_CHANNELS = [
  {
    id: "ch1",
    name: "general",
    description: "General discussion for the team",
    type: "channel",
    members: ["u1", "u2", "u3", "u4", "u5", "u6"],
    pinned: [],
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: "ch2",
    name: "engineering",
    description: "Engineering team discussions",
    type: "channel",
    members: ["u1", "u2", "u3", "u5", "u6"],
    pinned: [],
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: "ch3",
    name: "design",
    description: "Design feedback and reviews",
    type: "channel",
    members: ["u1", "u2", "u4"],
    pinned: [],
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: "dm1",
    name: "Jordan Lee",
    type: "dm",
    members: ["u1", "u2"],
    pinned: [],
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "dm2",
    name: "Riley Chen",
    type: "dm",
    members: ["u1", "u5"],
    pinned: [],
    createdAt: Date.now() - 86400000 * 5,
  },
];

let msgIdCounter = 100;
function generateMsgId() {
  return `m${++msgIdCounter}`;
}

const INITIAL_MESSAGES = {
  ch1: [
    {
      id: "m1",
      channelId: "ch1",
      userId: "u2",
      text: "Hey everyone! Welcome to the new chat platform 🎉",
      timestamp: Date.now() - 86400000 * 2,
      reactions: { "👍": ["u1", "u3", "u5"], "🎉": ["u4", "u6"] },
      edited: false,
      thread: [],
    },
    {
      id: "m2",
      channelId: "ch1",
      userId: "u3",
      text: "Looks great! When is the next standup?",
      timestamp: Date.now() - 86400000 * 2 + 3600000,
      reactions: {},
      edited: false,
      thread: [
        {
          id: "m2t1",
          userId: "u5",
          text: "Tomorrow at 10am PST",
          timestamp: Date.now() - 86400000 * 2 + 7200000,
        },
        {
          id: "m2t2",
          userId: "u2",
          text: "I'll send a calendar invite",
          timestamp: Date.now() - 86400000 * 2 + 10800000,
        },
      ],
    },
    {
      id: "m3",
      channelId: "ch1",
      userId: "u1",
      text: "Has anyone reviewed the new API design doc?",
      timestamp: Date.now() - 86400000,
      reactions: { "👀": ["u2"] },
      edited: false,
      thread: [],
    },
    {
      id: "m4",
      channelId: "ch1",
      userId: "u5",
      text: "I just pushed the refactored auth module. Please check PR #247.",
      timestamp: Date.now() - 43200000,
      reactions: { "🚀": ["u1", "u2", "u3"] },
      edited: false,
      thread: [
        {
          id: "m4t1",
          userId: "u1",
          text: "Reviewing now!",
          timestamp: Date.now() - 40000000,
        },
      ],
    },
    {
      id: "m5",
      channelId: "ch1",
      userId: "u4",
      text: "Reminder: Sprint retro is this Friday at 3pm.",
      timestamp: Date.now() - 3600000,
      reactions: { "✅": ["u1", "u2", "u5"] },
      edited: false,
      thread: [],
    },
  ],
  ch2: [
    {
      id: "m6",
      channelId: "ch2",
      userId: "u5",
      text: "We need to discuss the migration plan for the database.",
      timestamp: Date.now() - 86400000 * 3,
      reactions: { "📋": ["u1"] },
      edited: false,
      thread: [],
    },
    {
      id: "m7",
      channelId: "ch2",
      userId: "u6",
      text: "CI pipeline is green after the hotfix. Deploy is scheduled for tonight.",
      timestamp: Date.now() - 86400000,
      reactions: { "🟢": ["u1", "u3", "u5"] },
      edited: false,
      thread: [],
    },
    {
      id: "m8",
      channelId: "ch2",
      userId: "u1",
      text: "I found a memory leak in the WebSocket handler. Working on a fix.",
      timestamp: Date.now() - 7200000,
      reactions: { "🐛": ["u5", "u6"] },
      edited: true,
      thread: [
        {
          id: "m8t1",
          userId: "u5",
          text: "Need any help debugging?",
          timestamp: Date.now() - 5400000,
        },
      ],
    },
  ],
  ch3: [
    {
      id: "m9",
      channelId: "ch3",
      userId: "u2",
      text: "New mockups for the dashboard are ready for review!",
      timestamp: Date.now() - 86400000 * 2,
      reactions: { "🎨": ["u1", "u4"] },
      edited: false,
      thread: [],
    },
    {
      id: "m10",
      channelId: "ch3",
      userId: "u4",
      text: "Love the color scheme. Can we add more contrast to the sidebar?",
      timestamp: Date.now() - 86400000,
      reactions: {},
      edited: false,
      thread: [
        {
          id: "m10t1",
          userId: "u2",
          text: "Sure, I'll update the palette.",
          timestamp: Date.now() - 82800000,
        },
      ],
    },
  ],
  dm1: [
    {
      id: "m11",
      channelId: "dm1",
      userId: "u2",
      text: "Hey Alex, can you review my latest component?",
      timestamp: Date.now() - 86400000,
      reactions: {},
      edited: false,
      thread: [],
    },
    {
      id: "m12",
      channelId: "dm1",
      userId: "u1",
      text: "Sure! I'll take a look this afternoon.",
      timestamp: Date.now() - 82800000,
      reactions: { "👍": ["u2"] },
      edited: false,
      thread: [],
    },
  ],
  dm2: [
    {
      id: "m13",
      channelId: "dm2",
      userId: "u5",
      text: "Can we sync about the architecture for the new service?",
      timestamp: Date.now() - 43200000,
      reactions: {},
      edited: false,
      thread: [],
    },
    {
      id: "m14",
      channelId: "dm2",
      userId: "u1",
      text: "Absolutely. Let me pull up the docs.",
      timestamp: Date.now() - 39600000,
      reactions: {},
      edited: false,
      thread: [],
    },
  ],
};

const EMOJI_PICKER_OPTIONS = [
  "👍",
  "👎",
  "❤️",
  "🎉",
  "🚀",
  "👀",
  "🐛",
  "✅",
  "🔥",
  "💯",
  "🤔",
  "😂",
];

// ─── Utility Helpers ────────────────────────────────────────────────────────

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupMessagesByDate(msgs) {
  const groups = {};
  msgs.forEach((msg) => {
    const key = formatDate(msg.timestamp);
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  });
  return groups;
}

function getUserById(users, id) {
  return users.find((u) => u.id === id) || { name: "Unknown", avatar: "❓" };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ChatApp() {
  // Core state
  const [channels, setChannels] = useState(() => {
    try {
      const saved = localStorage.getItem("chatChannels");
      return saved ? JSON.parse(saved) : INITIAL_CHANNELS;
    } catch {
      return INITIAL_CHANNELS;
    }
  });
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("chatMessages");
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });
  const [users] = useState(INITIAL_USERS);
  const [activeChannelId, setActiveChannelId] = useState("ch1");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // UI state
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [showUserProfile, setShowUserProfile] = useState(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [activeThread, setActiveThread] = useState(null);
  const [threadInput, setThreadInput] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("chatTheme") || "light";
    } catch {
      return "light";
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [userStatus, setUserStatus] = useState(CURRENT_USER.status);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // ─── Persistence ────────────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem("chatChannels", JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chatTheme", theme);
  }, [theme]);

  // ─── Auto-scroll ────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChannelId]);

  // ─── Typing indicator simulation ────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      const onlineUsers = users.filter(
        (u) => u.id !== CURRENT_USER.id && u.status === "online"
      );
      if (onlineUsers.length > 0 && Math.random() > 0.85) {
        const randomUser =
          onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
        setTypingUsers((prev) => ({
          ...prev,
          [activeChannelId]: randomUser.name,
        }));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[activeChannelId];
            return next;
          });
        }, 3000);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [activeChannelId, users]);

  // ─── Computed Values ────────────────────────────────────────────────────

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId),
    [channels, activeChannelId]
  );

  const activeMessages = useMemo(
    () => messages[activeChannelId] || [],
    [messages, activeChannelId]
  );

  const filteredChannels = useMemo(() => {
    if (!searchQuery || !showSearch) return channels;
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery, showSearch]);

  const groupedMessages = useMemo(
    () => groupMessagesByDate(activeMessages),
    [activeMessages]
  );

  const pinnedMessages = useMemo(() => {
    if (!activeChannel) return [];
    return activeMessages.filter((m) =>
      (activeChannel.pinned || []).includes(m.id)
    );
  }, [activeChannel, activeMessages]);

  const onlineCount = useMemo(
    () => users.filter((u) => u.status === "online").length,
    [users]
  );

  // ─── Message Actions ──────────────────────────────────────────────────

  const sendMessage = useCallback(() => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: generateMsgId(),
      channelId: activeChannelId,
      userId: CURRENT_USER.id,
      text: messageInput.trim(),
      timestamp: Date.now(),
      reactions: {},
      edited: false,
      thread: [],
    };
    setMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));
    setMessageInput("");
    messageInputRef.current?.focus();
  }, [messageInput, activeChannelId]);

  const deleteMessage = useCallback(
    (msgId) => {
      setMessages((prev) => ({
        ...prev,
        [activeChannelId]: prev[activeChannelId].filter((m) => m.id !== msgId),
      }));
      setContextMenu(null);
    },
    [activeChannelId]
  );

  const startEditMessage = useCallback((msg) => {
    setEditingMessage(msg.id);
    setEditingText(msg.text);
    setContextMenu(null);
  }, []);

  const saveEditMessage = useCallback(
    (msgId) => {
      if (!editingText.trim()) return;
      setMessages((prev) => ({
        ...prev,
        [activeChannelId]: prev[activeChannelId].map((m) =>
          m.id === msgId
            ? { ...m, text: editingText.trim(), edited: true }
            : m
        ),
      }));
      setEditingMessage(null);
      setEditingText("");
    },
    [editingText, activeChannelId]
  );

  const cancelEditMessage = useCallback(() => {
    setEditingMessage(null);
    setEditingText("");
  }, []);

  const toggleReaction = useCallback(
    (msgId, emoji) => {
      setMessages((prev) => ({
        ...prev,
        [activeChannelId]: prev[activeChannelId].map((m) => {
          if (m.id !== msgId) return m;
          const reactions = { ...m.reactions };
          if (!reactions[emoji]) reactions[emoji] = [];
          if (reactions[emoji].includes(CURRENT_USER.id)) {
            reactions[emoji] = reactions[emoji].filter(
              (id) => id !== CURRENT_USER.id
            );
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...reactions[emoji], CURRENT_USER.id];
          }
          return { ...m, reactions };
        }),
      }));
      setShowEmojiPicker(null);
    },
    [activeChannelId]
  );

  const pinMessage = useCallback(
    (msgId) => {
      setChannels((prev) =>
        prev.map((c) => {
          if (c.id !== activeChannelId) return c;
          const pinned = c.pinned || [];
          if (pinned.includes(msgId)) {
            return { ...c, pinned: pinned.filter((id) => id !== msgId) };
          }
          return { ...c, pinned: [...pinned, msgId] };
        })
      );
      setContextMenu(null);
    },
    [activeChannelId]
  );

  // ─── Thread Actions ───────────────────────────────────────────────────

  const sendThreadReply = useCallback(() => {
    if (!threadInput.trim() || !activeThread) return;
    const reply = {
      id: generateMsgId(),
      userId: CURRENT_USER.id,
      text: threadInput.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => ({
      ...prev,
      [activeChannelId]: prev[activeChannelId].map((m) =>
        m.id === activeThread ? { ...m, thread: [...m.thread, reply] } : m
      ),
    }));
    setThreadInput("");
  }, [threadInput, activeThread, activeChannelId]);

  // ─── Channel Actions ─────────────────────────────────────────────────

  const createChannel = useCallback(() => {
    if (!newChannelName.trim()) return;
    const newChannel = {
      id: `ch${Date.now()}`,
      name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newChannelDesc.trim(),
      type: "channel",
      members: [CURRENT_USER.id],
      pinned: [],
      createdAt: Date.now(),
    };
    setChannels((prev) => [...prev, newChannel]);
    setMessages((prev) => ({ ...prev, [newChannel.id]: [] }));
    setNewChannelName("");
    setNewChannelDesc("");
    setShowCreateChannel(false);
    setActiveChannelId(newChannel.id);
  }, [newChannelName, newChannelDesc]);

  const switchChannel = useCallback(
    (channelId) => {
      setActiveChannelId(channelId);
      setUnreadCounts((prev) => ({ ...prev, [channelId]: 0 }));
      setActiveThread(null);
      setShowPinnedMessages(false);
      setShowChannelInfo(false);
      setContextMenu(null);
      messageInputRef.current?.focus();
    },
    []
  );

  // ─── Search ───────────────────────────────────────────────────────────

  const performSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      const results = [];
      Object.entries(messages).forEach(([chId, msgs]) => {
        msgs.forEach((msg) => {
          if (msg.text.toLowerCase().includes(query.toLowerCase())) {
            const channel = channels.find((c) => c.id === chId);
            const user = getUserById(users, msg.userId);
            results.push({ ...msg, channelName: channel?.name, userName: user.name });
          }
        });
      });
      setSearchResults(results);
    },
    [messages, channels, users]
  );

  // ─── Context Menu ─────────────────────────────────────────────────────

  const handleContextMenu = useCallback((e, msg) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: msg.id,
      isOwn: msg.userId === CURRENT_USER.id,
      message: msg,
    });
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (showSearch) setShowSearch(false);
        else if (showCreateChannel) setShowCreateChannel(false);
        else if (showUserProfile) setShowUserProfile(null);
        else if (showChannelInfo) setShowChannelInfo(false);
        else if (activeThread) setActiveThread(null);
        else if (showPinnedMessages) setShowPinnedMessages(false);
        else if (editingMessage) cancelEditMessage();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    showSearch,
    showCreateChannel,
    showUserProfile,
    showChannelInfo,
    activeThread,
    showPinnedMessages,
    editingMessage,
    cancelEditMessage,
  ]);

  // ─── Theming ──────────────────────────────────────────────────────────

  const isDark = theme === "dark";
  const bgPrimary = isDark ? "#1a1d21" : "#ffffff";
  const bgSecondary = isDark ? "#222529" : "#f8f9fa";
  const bgSidebar = isDark ? "#19171d" : "#3f0e40";
  const textPrimary = isDark ? "#d1d2d3" : "#1d1c1d";
  const textSecondary = isDark ? "#ababad" : "#616061";
  const textOnSidebar = "#ffffff";
  const borderColor = isDark ? "#393b3f" : "#e1e1e1";
  const hoverBg = isDark ? "#2c2d30" : "#f0f0f0";
  const accentColor = "#1264a3";
  const activeItemBg = isDark ? "#1164a3" : "#1264a3";

  // ─── Render: Sidebar ──────────────────────────────────────────────────

  const renderSidebar = () => (
    <div
      style={{
        width: sidebarCollapsed ? 60 : 260,
        backgroundColor: bgSidebar,
        color: textOnSidebar,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Workspace header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!sidebarCollapsed && (
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              TeamChat
            </h2>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {onlineCount} online
            </span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle sidebar"
          style={{
            background: "none",
            border: "none",
            color: textOnSidebar,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
      </div>

      {!sidebarCollapsed && (
        <>
          {/* User status */}
          <div
            style={{
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>{CURRENT_USER.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {CURRENT_USER.name}
              </div>
              <select
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value)}
                aria-label="Set status"
                style={{
                  background: "transparent",
                  border: "none",
                  color: textOnSidebar,
                  fontSize: 12,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <option value="online">🟢 Online</option>
                <option value="away">🟡 Away</option>
                <option value="dnd">🔴 Do Not Disturb</option>
                <option value="offline">⚫ Offline</option>
              </select>
            </div>
          </div>

          {/* Channels section */}
          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                padding: "4px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>
                Channels
              </span>
              <button
                onClick={() => setShowCreateChannel(true)}
                aria-label="Create channel"
                style={{
                  background: "none",
                  border: "none",
                  color: textOnSidebar,
                  cursor: "pointer",
                  fontSize: 16,
                  opacity: 0.7,
                }}
              >
                +
              </button>
            </div>
            {filteredChannels
              .filter((c) => c.type === "channel")
              .map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => switchChannel(channel.id)}
                  style={{
                    padding: "4px 16px 4px 24px",
                    cursor: "pointer",
                    backgroundColor:
                      activeChannelId === channel.id
                        ? activeItemBg
                        : "transparent",
                    borderRadius: 4,
                    margin: "1px 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 14,
                  }}
                >
                  <span>
                    # {channel.name}
                    {(unreadCounts[channel.id] || 0) > 0 && (
                      <span
                        style={{
                          fontWeight: 700,
                        }}
                      >
                        {" "}
                        ({unreadCounts[channel.id]})
                      </span>
                    )}
                  </span>
                </div>
              ))}
          </div>

          {/* Direct Messages section */}
          <div style={{ padding: "8px 0" }}>
            <div style={{ padding: "4px 16px" }}>
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>
                Direct Messages
              </span>
            </div>
            {filteredChannels
              .filter((c) => c.type === "dm")
              .map((dm) => {
                const otherUserId = dm.members.find(
                  (id) => id !== CURRENT_USER.id
                );
                const otherUser = getUserById(users, otherUserId);
                return (
                  <div
                    key={dm.id}
                    onClick={() => switchChannel(dm.id)}
                    style={{
                      padding: "4px 16px 4px 24px",
                      cursor: "pointer",
                      backgroundColor:
                        activeChannelId === dm.id
                          ? activeItemBg
                          : "transparent",
                      borderRadius: 4,
                      margin: "1px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{otherUser.avatar}</span>
                    <span>{otherUser.name}</span>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor:
                          otherUser.status === "online"
                            ? "#2bac76"
                            : otherUser.status === "away"
                              ? "#e8912d"
                              : "#616061",
                        display: "inline-block",
                      }}
                    />
                  </div>
                );
              })}
          </div>

          {/* Theme toggle */}
          <div
            style={{
              marginTop: "auto",
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              style={{
                background: "none",
                border: "none",
                color: textOnSidebar,
                cursor: "pointer",
                fontSize: 14,
                width: "100%",
                textAlign: "left",
              }}
            >
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ─── Render: Channel Header ───────────────────────────────────────────

  const renderChannelHeader = () => (
    <div
      style={{
        padding: "8px 20px",
        borderBottom: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: bgPrimary,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: textPrimary }}>
          {activeChannel?.type === "channel"
            ? `# ${activeChannel.name}`
            : activeChannel?.name}
        </h3>
        {activeChannel?.description && (
          <span style={{ fontSize: 13, color: textSecondary }}>
            | {activeChannel.description}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setShowPinnedMessages(!showPinnedMessages)}
          aria-label="Pinned messages"
          style={{
            background: "none",
            border: `1px solid ${borderColor}`,
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
            color: textSecondary,
            fontSize: 14,
          }}
        >
          📌 {pinnedMessages.length}
        </button>
        <button
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Search messages"
          style={{
            background: "none",
            border: `1px solid ${borderColor}`,
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
            color: textSecondary,
            fontSize: 14,
          }}
        >
          🔍
        </button>
        <button
          onClick={() => setShowChannelInfo(!showChannelInfo)}
          aria-label="Channel info"
          style={{
            background: "none",
            border: `1px solid ${borderColor}`,
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
            color: textSecondary,
            fontSize: 14,
          }}
        >
          ℹ️
        </button>
      </div>
    </div>
  );

  // ─── Render: Message Item ─────────────────────────────────────────────

  const renderMessage = (msg) => {
    const sender = getUserById(users, msg.userId);
    const isEditing = editingMessage === msg.id;
    const isPinned = (activeChannel?.pinned || []).includes(msg.id);

    return (
      <div
        key={msg.id}
        data-testid={`message-${msg.id}`}
        onContextMenu={(e) => handleContextMenu(e, msg)}
        style={{
          padding: "8px 20px",
          display: "flex",
          gap: 12,
          backgroundColor:
            isPinned && !isDark
              ? "#fffbe6"
              : isPinned && isDark
                ? "#2a2a1a"
                : "transparent",
          borderLeft: isPinned ? `3px solid #e6b800` : "3px solid transparent",
        }}
      >
        <span
          style={{ fontSize: 28, cursor: "pointer", flexShrink: 0 }}
          onClick={() => setShowUserProfile(msg.userId)}
        >
          {sender.avatar}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: textPrimary,
                cursor: "pointer",
                fontSize: 15,
              }}
              onClick={() => setShowUserProfile(msg.userId)}
            >
              {sender.name}
            </span>
            <span style={{ fontSize: 12, color: textSecondary }}>
              {formatTime(msg.timestamp)}
            </span>
            {msg.edited && (
              <span style={{ fontSize: 11, color: textSecondary }}>
                (edited)
              </span>
            )}
            {isPinned && (
              <span style={{ fontSize: 11, color: "#e6b800" }}>📌 pinned</span>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: "flex", gap: 4 }}>
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEditMessage(msg.id);
                  if (e.key === "Escape") cancelEditMessage();
                }}
                aria-label="Edit message"
                autoFocus
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 4,
                  backgroundColor: bgPrimary,
                  color: textPrimary,
                }}
              />
              <button
                onClick={() => saveEditMessage(msg.id)}
                style={{
                  padding: "4px 8px",
                  backgroundColor: accentColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={cancelEditMessage}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "transparent",
                  color: textSecondary,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                color: textPrimary,
                fontSize: 15,
                lineHeight: 1.46,
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
            </p>
          )}

          {/* Reactions */}
          {Object.keys(msg.reactions || {}).length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                marginTop: 4,
              }}
            >
              {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(msg.id, emoji)}
                  data-testid={`reaction-${msg.id}-${emoji}`}
                  style={{
                    padding: "2px 6px",
                    borderRadius: 12,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: userIds.includes(CURRENT_USER.id)
                      ? isDark
                        ? "#1d3f5c"
                        : "#e8f5fe"
                      : "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: textPrimary,
                  }}
                >
                  {emoji} {userIds.length}
                </button>
              ))}
              <button
                onClick={() =>
                  setShowEmojiPicker(
                    showEmojiPicker === msg.id ? null : msg.id
                  )
                }
                aria-label="Add reaction"
                style={{
                  padding: "2px 6px",
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  color: textSecondary,
                }}
              >
                +
              </button>
            </div>
          )}

          {/* Emoji picker */}
          {showEmojiPicker === msg.id && (
            <div
              data-testid={`emoji-picker-${msg.id}`}
              style={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                marginTop: 4,
                padding: 8,
                backgroundColor: bgSecondary,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
              }}
            >
              {EMOJI_PICKER_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(msg.id, emoji)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    padding: 4,
                    borderRadius: 4,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Thread indicator */}
          {msg.thread && msg.thread.length > 0 && (
            <button
              onClick={() =>
                setActiveThread(activeThread === msg.id ? null : msg.id)
              }
              data-testid={`thread-btn-${msg.id}`}
              style={{
                marginTop: 4,
                background: "none",
                border: "none",
                color: accentColor,
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              💬 {msg.thread.length}{" "}
              {msg.thread.length === 1 ? "reply" : "replies"}
            </button>
          )}
          {msg.thread && msg.thread.length === 0 && (
            <button
              onClick={() =>
                setActiveThread(activeThread === msg.id ? null : msg.id)
              }
              data-testid={`thread-btn-${msg.id}`}
              style={{
                marginTop: 4,
                background: "none",
                border: "none",
                color: textSecondary,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Reply in thread
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── Render: Thread Panel ─────────────────────────────────────────────

  const renderThreadPanel = () => {
    const parentMsg = activeMessages.find((m) => m.id === activeThread);
    if (!parentMsg) return null;
    const sender = getUserById(users, parentMsg.userId);

    return (
      <div
        style={{
          width: 350,
          borderLeft: `1px solid ${borderColor}`,
          backgroundColor: bgPrimary,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 style={{ margin: 0, color: textPrimary }}>Thread</h4>
          <button
            onClick={() => setActiveThread(null)}
            aria-label="Close thread"
            style={{
              background: "none",
              border: "none",
              color: textSecondary,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        {/* Parent message */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span>{sender.avatar}</span>
            <span style={{ fontWeight: 700, color: textPrimary }}>
              {sender.name}
            </span>
            <span style={{ fontSize: 12, color: textSecondary }}>
              {formatTime(parentMsg.timestamp)}
            </span>
          </div>
          <p style={{ margin: 0, color: textPrimary, fontSize: 14 }}>
            {parentMsg.text}
          </p>
        </div>

        {/* Thread replies */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {parentMsg.thread.map((reply) => {
            const replySender = getUserById(users, reply.userId);
            return (
              <div
                key={reply.id}
                data-testid={`thread-reply-${reply.id}`}
                style={{
                  padding: "6px 16px",
                  display: "flex",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>{replySender.avatar}</span>
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: textPrimary,
                        fontSize: 14,
                      }}
                    >
                      {replySender.name}
                    </span>
                    <span style={{ fontSize: 11, color: textSecondary }}>
                      {formatTime(reply.timestamp)}
                    </span>
                  </div>
                  <p
                    style={{ margin: 0, color: textPrimary, fontSize: 14 }}
                  >
                    {reply.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thread input */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: `1px solid ${borderColor}`,
            display: "flex",
            gap: 8,
          }}
        >
          <input
            type="text"
            value={threadInput}
            onChange={(e) => setThreadInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendThreadReply()}
            placeholder="Reply in thread..."
            aria-label="Thread reply"
            style={{
              flex: 1,
              padding: "8px 12px",
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              backgroundColor: bgPrimary,
              color: textPrimary,
            }}
          />
          <button
            onClick={sendThreadReply}
            style={{
              padding: "8px 12px",
              backgroundColor: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  // ─── Render: Search Panel ─────────────────────────────────────────────

  const renderSearchPanel = () => (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 400,
        height: "100%",
        backgroundColor: bgPrimary,
        borderLeft: `1px solid ${borderColor}`,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ margin: 0, color: textPrimary }}>Search</h4>
        <button
          onClick={() => {
            setShowSearch(false);
            setSearchQuery("");
            setSearchResults([]);
          }}
          aria-label="Close search"
          style={{
            background: "none",
            border: "none",
            color: textSecondary,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => performSearch(e.target.value)}
          placeholder="Search messages... (Ctrl+K)"
          autoFocus
          style={{
            width: "100%",
            padding: "8px 12px",
            border: `1px solid ${borderColor}`,
            borderRadius: 4,
            backgroundColor: bgSecondary,
            color: textPrimary,
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {searchResults.length === 0 && searchQuery && (
          <p style={{ padding: "12px 16px", color: textSecondary }}>
            No results found
          </p>
        )}
        {searchResults.map((result) => (
          <div
            key={result.id}
            onClick={() => {
              switchChannel(result.channelId);
              setShowSearch(false);
              setSearchQuery("");
              setSearchResults([]);
            }}
            style={{
              padding: "8px 16px",
              borderBottom: `1px solid ${borderColor}`,
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 12, color: textSecondary, marginBottom: 2 }}>
              #{result.channelName} · {result.userName}
            </div>
            <p style={{ margin: 0, color: textPrimary, fontSize: 14 }}>
              {result.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Render: Modals & Panels ──────────────────────────────────────────

  const renderCreateChannelModal = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={() => setShowCreateChannel(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: bgPrimary,
          borderRadius: 8,
          padding: 24,
          width: 400,
          maxWidth: "90vw",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: textPrimary }}>
          Create a Channel
        </h3>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", marginBottom: 4, color: textSecondary }}
          >
            Channel Name
          </label>
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="e.g. project-alpha"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              backgroundColor: bgSecondary,
              color: textPrimary,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 4, color: textSecondary }}
          >
            Description (optional)
          </label>
          <input
            type="text"
            value={newChannelDesc}
            onChange={(e) => setNewChannelDesc(e.target.value)}
            placeholder="What's this channel about?"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              backgroundColor: bgSecondary,
              color: textPrimary,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={() => setShowCreateChannel(false)}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: textSecondary,
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={createChannel}
            style={{
              padding: "8px 16px",
              backgroundColor: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );

  const renderUserProfileModal = () => {
    const profileUser = getUserById(users, showUserProfile);
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
        }}
        onClick={() => setShowUserProfile(null)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: bgPrimary,
            borderRadius: 8,
            padding: 24,
            width: 320,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 56 }}>{profileUser.avatar}</span>
          <h3 style={{ margin: "12px 0 4px", color: textPrimary }}>
            {profileUser.name}
          </h3>
          <p style={{ margin: 0, color: textSecondary, fontSize: 14 }}>
            {profileUser.bio}
          </p>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                display: "inline-block",
                backgroundColor:
                  profileUser.status === "online"
                    ? "#2bac76"
                    : profileUser.status === "away"
                      ? "#e8912d"
                      : profileUser.status === "dnd"
                        ? "#e01e5a"
                        : "#616061",
              }}
            />
            <span style={{ fontSize: 14, color: textSecondary }}>
              {profileUser.status === "online"
                ? "Online"
                : profileUser.status === "away"
                  ? "Away"
                  : profileUser.status === "dnd"
                    ? "Do Not Disturb"
                    : "Offline"}
            </span>
          </div>
          <button
            onClick={() => setShowUserProfile(null)}
            style={{
              marginTop: 16,
              padding: "8px 24px",
              backgroundColor: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const renderChannelInfoPanel = () => (
    <div
      style={{
        width: 300,
        borderLeft: `1px solid ${borderColor}`,
        backgroundColor: bgPrimary,
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ margin: 0, color: textPrimary }}>Channel Info</h4>
        <button
          onClick={() => setShowChannelInfo(false)}
          aria-label="Close channel info"
          style={{
            background: "none",
            border: "none",
            color: textSecondary,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>
      {activeChannel && (
        <div style={{ padding: 16 }}>
          <h3 style={{ margin: "0 0 8px", color: textPrimary }}>
            # {activeChannel.name}
          </h3>
          <p style={{ margin: "0 0 16px", color: textSecondary, fontSize: 14 }}>
            {activeChannel.description || "No description"}
          </p>
          <h5 style={{ margin: "0 0 8px", color: textPrimary }}>
            Members ({activeChannel.members.length})
          </h5>
          {activeChannel.members.map((memberId) => {
            const member = getUserById(users, memberId);
            return (
              <div
                key={memberId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 0",
                }}
              >
                <span>{member.avatar}</span>
                <span style={{ color: textPrimary, fontSize: 14 }}>
                  {member.name}
                </span>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor:
                      member.status === "online" ? "#2bac76" : "#616061",
                    display: "inline-block",
                  }}
                />
              </div>
            );
          })}
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 12, color: textSecondary }}>
              Created{" "}
              {new Date(activeChannel.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderPinnedMessages = () => (
    <div
      style={{
        width: 300,
        borderLeft: `1px solid ${borderColor}`,
        backgroundColor: bgPrimary,
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ margin: 0, color: textPrimary }}>Pinned Messages</h4>
        <button
          onClick={() => setShowPinnedMessages(false)}
          aria-label="Close pinned messages"
          style={{
            background: "none",
            border: "none",
            color: textSecondary,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: 8 }}>
        {pinnedMessages.length === 0 ? (
          <p style={{ padding: 16, color: textSecondary, textAlign: "center" }}>
            No pinned messages
          </p>
        ) : (
          pinnedMessages.map((msg) => {
            const sender = getUserById(users, msg.userId);
            return (
              <div
                key={msg.id}
                style={{
                  padding: "8px 12px",
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 14 }}>{sender.avatar}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: textPrimary }}>
                    {sender.name}
                  </span>
                  <span style={{ fontSize: 11, color: textSecondary }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p style={{ margin: 0, color: textPrimary, fontSize: 13 }}>
                  {msg.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderContextMenu = () => (
    <div
      style={{
        position: "fixed",
        left: contextMenu.x,
        top: contextMenu.y,
        backgroundColor: bgPrimary,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 300,
        padding: 4,
        minWidth: 160,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          setShowEmojiPicker(contextMenu.messageId);
          setContextMenu(null);
        }}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "8px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: textPrimary,
          borderRadius: 4,
          fontSize: 14,
        }}
      >
        😀 Add Reaction
      </button>
      <button
        onClick={() => {
          setActiveThread(contextMenu.messageId);
          setContextMenu(null);
        }}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "8px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: textPrimary,
          borderRadius: 4,
          fontSize: 14,
        }}
      >
        💬 Reply in Thread
      </button>
      <button
        onClick={() => pinMessage(contextMenu.messageId)}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "8px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: textPrimary,
          borderRadius: 4,
          fontSize: 14,
        }}
      >
        📌{" "}
        {(activeChannel?.pinned || []).includes(contextMenu.messageId)
          ? "Unpin"
          : "Pin"}{" "}
        Message
      </button>
      {contextMenu.isOwn && (
        <>
          <button
            onClick={() => startEditMessage(contextMenu.message)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: textPrimary,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            ✏️ Edit Message
          </button>
          <button
            onClick={() => deleteMessage(contextMenu.messageId)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#e01e5a",
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            🗑️ Delete Message
          </button>
        </>
      )}
    </div>
  );

  // ─── Render: Main Layout ──────────────────────────────────────────────

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: bgPrimary,
        color: textPrimary,
        overflow: "hidden",
      }}
    >
      {renderSidebar()}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {renderChannelHeader()}

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Message area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ flex: 1, overflowY: "auto" }}>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px 0 8px",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: bgSecondary,
                        padding: "4px 12px",
                        borderRadius: 16,
                        fontSize: 12,
                        fontWeight: 700,
                        color: textSecondary,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      {date}
                    </span>
                  </div>
                  {msgs.map((msg) => renderMessage(msg))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator */}
            {typingUsers[activeChannelId] && (
              <div
                style={{
                  padding: "4px 20px",
                  fontSize: 13,
                  color: textSecondary,
                  fontStyle: "italic",
                }}
                data-testid="typing-indicator"
              >
                {typingUsers[activeChannelId]} is typing...
              </div>
            )}

            {/* Message input */}
            <div
              style={{
                padding: "8px 20px 20px",
                borderTop: `1px solid ${borderColor}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: 4,
                  backgroundColor: bgSecondary,
                }}
              >
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Message ${
                    activeChannel?.type === "channel"
                      ? "#" + activeChannel.name
                      : activeChannel?.name
                  }`}
                  aria-label="Message input"
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    padding: "8px 12px",
                    color: textPrimary,
                    fontSize: 15,
                    outline: "none",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  aria-label="Send message"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: messageInput.trim()
                      ? accentColor
                      : "transparent",
                    color: messageInput.trim() ? "#fff" : textSecondary,
                    border: "none",
                    borderRadius: 4,
                    cursor: messageInput.trim() ? "pointer" : "default",
                    fontWeight: 700,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Side panels */}
          {activeThread && renderThreadPanel()}
          {showChannelInfo && renderChannelInfoPanel()}
          {showPinnedMessages && renderPinnedMessages()}
        </div>

        {/* Search overlay */}
        {showSearch && renderSearchPanel()}
      </div>

      {/* Modals */}
      {showCreateChannel && renderCreateChannelModal()}
      {showUserProfile && renderUserProfileModal()}
      {contextMenu && renderContextMenu()}
    </div>
  );
}
