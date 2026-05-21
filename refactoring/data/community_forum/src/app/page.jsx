import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = [
  { id: 'general', name: 'General Discussion', icon: '💬', color: '#6366f1' },
  { id: 'tech', name: 'Technology', icon: '💻', color: '#06b6d4' },
  { id: 'creative', name: 'Creative Arts', icon: '🎨', color: '#f59e0b' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#22c55e' },
  { id: 'science', name: 'Science', icon: '🔬', color: '#ef4444' },
  { id: 'music', name: 'Music', icon: '🎵', color: '#a855f7' },
];

const ROLES = {
  admin: { label: 'Admin', color: '#ef4444', badge: '🛡️' },
  moderator: { label: 'Moderator', color: '#f59e0b', badge: '⚔️' },
  member: { label: 'Member', color: '#6366f1', badge: '' },
};

const MOCK_USERS = [
  { id: 'u1', name: 'Alex Rivera', avatar: '👤', role: 'admin', reputation: 4250, joinedAt: Date.now() - 86400000 * 365, bio: 'Community founder & full-stack developer' },
  { id: 'u2', name: 'Jordan Lee', avatar: '👩', role: 'moderator', reputation: 2180, joinedAt: Date.now() - 86400000 * 200, bio: 'Tech enthusiast and open-source contributor' },
  { id: 'u3', name: 'Sam Chen', avatar: '👨', role: 'member', reputation: 890, joinedAt: Date.now() - 86400000 * 90, bio: 'Lifelong learner, coffee addict' },
  { id: 'u4', name: 'Maya Patel', avatar: '👩‍🎨', role: 'member', reputation: 1560, joinedAt: Date.now() - 86400000 * 150, bio: 'Digital artist & UI designer' },
  { id: 'u5', name: 'Chris Kim', avatar: '👨‍💻', role: 'member', reputation: 340, joinedAt: Date.now() - 86400000 * 30, bio: 'New here, learning the ropes!' },
];

const INITIAL_THREADS = [
  {
    id: 't1',
    title: 'Welcome to the Community Forum!',
    content: 'Hello everyone! This is our community space for sharing ideas, asking questions, and connecting with fellow members. Please read the community guidelines before posting.',
    author: 'u1',
    category: 'general',
    tags: ['welcome', 'announcement', 'rules'],
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 2,
    isPinned: true,
    isLocked: false,
    views: 1523,
    posts: [
      {
        id: 'p1',
        content: 'Great to be here! Looking forward to connecting with everyone.',
        author: 'u3',
        createdAt: Date.now() - 86400000 * 28,
        votes: 12,
        votedBy: { u2: 1, u4: 1, u5: 1 },
        isEdited: false,
        replies: [
          { id: 'r1', content: 'Welcome aboard, Sam! Feel free to ask any questions.', author: 'u1', createdAt: Date.now() - 86400000 * 28, votes: 5, votedBy: { u3: 1 } },
          { id: 'r2', content: 'Thanks for the warm welcome!', author: 'u3', createdAt: Date.now() - 86400000 * 27, votes: 2, votedBy: {} },
        ],
      },
      {
        id: 'p2',
        content: 'Excited to join the community! Where can I find the guidelines?',
        author: 'u5',
        createdAt: Date.now() - 86400000 * 5,
        votes: 3,
        votedBy: { u1: 1 },
        isEdited: false,
        replies: [
          { id: 'r3', content: 'Check the pinned threads section for all the rules!', author: 'u2', createdAt: Date.now() - 86400000 * 5, votes: 4, votedBy: { u5: 1 } },
        ],
      },
    ],
  },
  {
    id: 't2',
    title: 'Best practices for React performance optimization',
    content: 'I have been working on a large React project and noticed some performance issues. What are some strategies you use for optimizing React apps? Specifically interested in memoization patterns and when to use useMemo vs useCallback.',
    author: 'u2',
    category: 'tech',
    tags: ['react', 'performance', 'javascript'],
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 1,
    isPinned: false,
    isLocked: false,
    views: 856,
    posts: [
      {
        id: 'p3',
        content: 'Great question! One of the most impactful things you can do is use React.memo for components that receive the same props frequently. Also, make sure you are not creating new objects/arrays in render - extract them to useMemo.',
        author: 'u1',
        createdAt: Date.now() - 86400000 * 13,
        votes: 24,
        votedBy: { u2: 1, u3: 1, u4: 1, u5: 1 },
        isEdited: true,
        replies: [
          { id: 'r4', content: 'Solid advice! I also recommend using the React DevTools Profiler to identify bottlenecks.', author: 'u4', createdAt: Date.now() - 86400000 * 12, votes: 8, votedBy: { u1: 1, u2: 1 } },
        ],
      },
      {
        id: 'p4',
        content: 'Don\'t forget about code splitting with React.lazy and Suspense! That can drastically reduce your initial bundle size.',
        author: 'u3',
        createdAt: Date.now() - 86400000 * 10,
        votes: 15,
        votedBy: { u1: 1, u2: 1 },
        isEdited: false,
        replies: [],
      },
      {
        id: 'p5',
        content: 'I found that virtualizing long lists with react-window or react-virtuoso made a huge difference in my project. Rendering 10,000 rows went from 3 seconds to instant.',
        author: 'u4',
        createdAt: Date.now() - 86400000 * 7,
        votes: 19,
        votedBy: { u2: 1, u3: 1 },
        isEdited: false,
        replies: [],
      },
    ],
  },
  {
    id: 't3',
    title: 'Share your latest creative projects!',
    content: 'Hey creatives! Let us see what you have been working on lately. Post screenshots, links, or descriptions of your latest artwork, designs, or creative endeavors.',
    author: 'u4',
    category: 'creative',
    tags: ['showcase', 'art', 'design'],
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 3,
    isPinned: false,
    isLocked: false,
    views: 432,
    posts: [
      {
        id: 'p6',
        content: 'I just finished a series of pixel art characters for a retro game project. It took me about two weeks to complete the full sprite sheet with animations.',
        author: 'u3',
        createdAt: Date.now() - 86400000 * 6,
        votes: 8,
        votedBy: { u4: 1, u1: 1 },
        isEdited: false,
        replies: [
          { id: 'r5', content: 'Those look amazing! What tools do you use for pixel art?', author: 'u4', createdAt: Date.now() - 86400000 * 6, votes: 3, votedBy: {} },
          { id: 'r6', content: 'I mostly use Aseprite. It is fantastic for sprite animations.', author: 'u3', createdAt: Date.now() - 86400000 * 5, votes: 5, votedBy: { u4: 1 } },
        ],
      },
    ],
  },
  {
    id: 't4',
    title: 'Favorite indie games of 2025?',
    content: 'What indie games have you been playing lately? I am looking for recommendations. I particularly enjoy roguelikes and metroidvanias.',
    author: 'u5',
    category: 'gaming',
    tags: ['indie', 'recommendations', 'discussion'],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
    isPinned: false,
    isLocked: false,
    views: 267,
    posts: [
      {
        id: 'p7',
        content: 'If you like roguelikes, you absolutely need to try Hades II. The early access is already incredible.',
        author: 'u3',
        createdAt: Date.now() - 86400000 * 2,
        votes: 6,
        votedBy: { u5: 1, u1: 1 },
        isEdited: false,
        replies: [],
      },
    ],
  },
  {
    id: 't5',
    title: 'The James Webb Space Telescope latest discoveries',
    content: 'Let us discuss the incredible new images and data coming from the JWST. The recent findings about exoplanet atmospheres are groundbreaking.',
    author: 'u1',
    category: 'science',
    tags: ['space', 'jwst', 'astronomy'],
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 4,
    isPinned: false,
    isLocked: false,
    views: 689,
    posts: [
      {
        id: 'p8',
        content: 'The resolution of those nebula images is absolutely stunning. We are living in an incredible era for space exploration.',
        author: 'u2',
        createdAt: Date.now() - 86400000 * 9,
        votes: 11,
        votedBy: { u1: 1, u3: 1, u4: 1 },
        isEdited: false,
        replies: [
          { id: 'r7', content: 'Agreed! The spectroscopy data is even more exciting from a scientific perspective.', author: 'u1', createdAt: Date.now() - 86400000 * 9, votes: 7, votedBy: { u2: 1 } },
        ],
      },
      {
        id: 'p9',
        content: 'Has anyone read the paper about the potential biosignatures found on K2-18b? The methane and CO2 levels are very interesting.',
        author: 'u4',
        createdAt: Date.now() - 86400000 * 6,
        votes: 9,
        votedBy: { u1: 1, u2: 1 },
        isEdited: false,
        replies: [],
      },
    ],
  },
  {
    id: 't6',
    title: 'Building a synthesizer from scratch',
    content: 'I am documenting my journey of building a modular synthesizer from scratch. Currently working on the oscillator module using analog circuits.',
    author: 'u3',
    category: 'music',
    tags: ['synthesizer', 'diy', 'electronics'],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    isPinned: false,
    isLocked: false,
    views: 198,
    posts: [
      {
        id: 'p10',
        content: 'This is such a cool project! Are you using VCOs or DCOs for the oscillator section?',
        author: 'u2',
        createdAt: Date.now() - 86400000 * 4,
        votes: 4,
        votedBy: { u3: 1 },
        isEdited: false,
        replies: [
          { id: 'r8', content: 'Starting with VCOs for that authentic analog sound. Planning to add DCOs later for stability.', author: 'u3', createdAt: Date.now() - 86400000 * 4, votes: 3, votedBy: { u2: 1 } },
        ],
      },
    ],
  },
];

const CURRENT_USER = 'u1';

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function CommunityForum() {
  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem('forumThreads');
      return saved ? JSON.parse(saved) : INITIAL_THREADS;
    } catch {
      return INITIAL_THREADS;
    }
  });

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('forumBookmarks');
      return saved ? JSON.parse(saved) : ['t1', 't2'];
    } catch {
      return ['t1', 't2'];
    }
  });

  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('forumView') || 'home';
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('forumTheme') || 'light';
  });
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showModPanel, setShowModPanel] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');

  const postInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('forumThreads', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('forumBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('forumView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('forumTheme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showCreateThread) setShowCreateThread(false);
        else if (showUserProfile) setShowUserProfile(null);
        else if (showModPanel) setShowModPanel(false);
        else if (showNotifications) setShowNotifications(false);
        else if (selectedThread) setSelectedThread(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateThread, showUserProfile, showModPanel, showNotifications, selectedThread]);

  const allTags = useMemo(() => {
    const tags = new Set();
    threads.forEach((t) => t.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [threads]);

  const filteredThreads = useMemo(() => {
    let filtered = [...threads];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.content.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          MOCK_USERS.find((u) => u.id === t.author)?.name.toLowerCase().includes(query)
      );
    }

    if (tagFilter) {
      filtered = filtered.filter((t) => t.tags.includes(tagFilter));
    }

    const pinned = filtered.filter((t) => t.isPinned);
    const unpinned = filtered.filter((t) => !t.isPinned);

    switch (sortBy) {
      case 'newest':
        unpinned.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        unpinned.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'mostPosts':
        unpinned.sort((a, b) => b.posts.length - a.posts.length);
        break;
      case 'mostViews':
        unpinned.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    return [...pinned, ...unpinned];
  }, [threads, selectedCategory, searchQuery, tagFilter, sortBy]);

  const bookmarkedThreads = useMemo(() => {
    return threads.filter((t) => bookmarks.includes(t.id));
  }, [threads, bookmarks]);

  const stats = useMemo(() => {
    const totalPosts = threads.reduce((sum, t) => sum + t.posts.length, 0);
    const totalReplies = threads.reduce(
      (sum, t) => sum + t.posts.reduce((pSum, p) => pSum + p.replies.length, 0),
      0
    );
    return {
      totalThreads: threads.length,
      totalPosts,
      totalReplies,
      totalMembers: MOCK_USERS.length,
    };
  }, [threads]);

  const getUser = useCallback((userId) => {
    return MOCK_USERS.find((u) => u.id === userId) || { id: userId, name: 'Unknown', avatar: '❓', role: 'member', reputation: 0 };
  }, []);

  const toggleBookmark = useCallback(
    (threadId) => {
      setBookmarks((prev) =>
        prev.includes(threadId) ? prev.filter((id) => id !== threadId) : [...prev, threadId]
      );
    },
    []
  );

  const handleVote = useCallback(
    (threadId, postId, replyId, direction) => {
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id !== threadId) return thread;
          return {
            ...thread,
            posts: thread.posts.map((post) => {
              if (replyId) {
                if (post.id !== postId) return post;
                return {
                  ...post,
                  replies: post.replies.map((reply) => {
                    if (reply.id !== replyId) return reply;
                    const currentVote = reply.votedBy[CURRENT_USER] || 0;
                    const newVote = currentVote === direction ? 0 : direction;
                    const voteDiff = newVote - currentVote;
                    return {
                      ...reply,
                      votes: reply.votes + voteDiff,
                      votedBy: { ...reply.votedBy, [CURRENT_USER]: newVote },
                    };
                  }),
                };
              }
              if (post.id !== postId) return post;
              const currentVote = post.votedBy[CURRENT_USER] || 0;
              const newVote = currentVote === direction ? 0 : direction;
              const voteDiff = newVote - currentVote;
              return {
                ...post,
                votes: post.votes + voteDiff,
                votedBy: { ...post.votedBy, [CURRENT_USER]: newVote },
              };
            }),
          };
        })
      );
    },
    []
  );

  const handleCreateThread = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.target;
      const title = form.title.value.trim();
      const content = form.content.value.trim();
      const category = form.category.value;
      const tagsStr = form.tags.value.trim();
      if (!title || !content) return;

      const newThread = {
        id: `t${Date.now()}`,
        title,
        content,
        author: CURRENT_USER,
        category,
        tags: tagsStr ? tagsStr.split(',').map((t) => t.trim().toLowerCase()) : [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
        isLocked: false,
        views: 0,
        posts: [],
      };

      setThreads((prev) => [newThread, ...prev]);
      setShowCreateThread(false);
      setNotifications((prev) => [
        { id: `n${Date.now()}`, text: `Thread "${title}" created`, read: false, time: Date.now() },
        ...prev,
      ]);
    },
    []
  );

  const handleAddPost = useCallback(
    (threadId, content) => {
      if (!content.trim()) return;
      const newPost = {
        id: `p${Date.now()}`,
        content: content.trim(),
        author: CURRENT_USER,
        createdAt: Date.now(),
        votes: 0,
        votedBy: {},
        isEdited: false,
        replies: [],
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return { ...t, posts: [...t.posts, newPost], updatedAt: Date.now() };
        })
      );
    },
    []
  );

  const handleAddReply = useCallback(
    (threadId, postId, content) => {
      if (!content.trim()) return;
      const newReply = {
        id: `r${Date.now()}`,
        content: content.trim(),
        author: CURRENT_USER,
        createdAt: Date.now(),
        votes: 0,
        votedBy: {},
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return {
            ...t,
            posts: t.posts.map((p) => {
              if (p.id !== postId) return p;
              return { ...p, replies: [...p.replies, newReply] };
            }),
            updatedAt: Date.now(),
          };
        })
      );
    },
    []
  );

  const handleDeletePost = useCallback(
    (threadId, postId) => {
      if (!window.confirm('Are you sure you want to delete this post?')) return;
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return { ...t, posts: t.posts.filter((p) => p.id !== postId) };
        })
      );
    },
    []
  );

  const handleEditPost = useCallback(
    (threadId, postId, newContent) => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return {
            ...t,
            posts: t.posts.map((p) => {
              if (p.id !== postId) return p;
              return { ...p, content: newContent, isEdited: true };
            }),
          };
        })
      );
      setEditingPost(null);
      setEditContent('');
    },
    []
  );

  const handleTogglePin = useCallback(
    (threadId) => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return { ...t, isPinned: !t.isPinned };
        })
      );
    },
    []
  );

  const handleToggleLock = useCallback(
    (threadId) => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return { ...t, isLocked: !t.isLocked };
        })
      );
    },
    []
  );

  const handleDeleteThread = useCallback(
    (threadId) => {
      if (!window.confirm('Are you sure you want to delete this thread? This cannot be undone.'))
        return;
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setSelectedThread(null);
      setNotifications((prev) => [
        { id: `n${Date.now()}`, text: 'Thread deleted', read: false, time: Date.now() },
        ...prev,
      ]);
    },
    []
  );

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const incrementViews = useCallback((threadId) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return { ...t, views: t.views + 1 };
      })
    );
  }, []);

  const themeStyles = theme === 'dark'
    ? { bg: '#1a1a2e', surface: '#16213e', text: '#e0e0e0', textSecondary: '#a0a0a0', border: '#2a2a4a', accent: '#6366f1', hover: '#1e2a4a' }
    : { bg: '#f0f2f5', surface: '#ffffff', text: '#1a1a2e', textSecondary: '#666666', border: '#e0e0e0', accent: '#6366f1', hover: '#f5f5f5' };

  const renderSidebar = () => (
    <div
      style={{
        width: sidebarCollapsed ? 60 : 240,
        backgroundColor: themeStyles.surface,
        borderRight: `1px solid ${themeStyles.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '16px', borderBottom: `1px solid ${themeStyles.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!sidebarCollapsed && (
          <h1 style={{ margin: 0, fontSize: 18, color: themeStyles.accent, fontWeight: 'bold' }}>
            ForumHub
          </h1>
        )}
        <button
          aria-label="Toggle sidebar"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: themeStyles.text, padding: 4 }}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }}>
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'bookmarks', label: 'Bookmarks', icon: '🔖' },
          { id: 'trending', label: 'Trending', icon: '🔥' },
          { id: 'members', label: 'Members', icon: '👥' },
          { id: 'stats', label: 'Statistics', icon: '📊' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              setSelectedThread(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: sidebarCollapsed ? '10px 0' : '10px 16px',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              border: 'none',
              background: activeView === item.id ? `${themeStyles.accent}22` : 'transparent',
              color: activeView === item.id ? themeStyles.accent : themeStyles.text,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeView === item.id ? 600 : 400,
              borderRight: activeView === item.id ? `3px solid ${themeStyles.accent}` : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {!sidebarCollapsed && item.label}
          </button>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div style={{ padding: 16, borderTop: `1px solid ${themeStyles.border}`, fontSize: 12, color: themeStyles.textSecondary }}>
          <div style={{ marginBottom: 8 }}>
            <strong>{stats.totalThreads}</strong> threads
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>{stats.totalPosts}</strong> posts
          </div>
          <div>
            <strong>{stats.totalMembers}</strong> members
          </div>
        </div>
      )}
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        padding: '12px 24px',
        backgroundColor: themeStyles.surface,
        borderBottom: `1px solid ${themeStyles.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <input
        type="text"
        placeholder="Search threads... (Ctrl+K)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          flex: 1,
          padding: '8px 12px',
          border: `1px solid ${themeStyles.border}`,
          borderRadius: 8,
          backgroundColor: themeStyles.bg,
          color: themeStyles.text,
          fontSize: 14,
          outline: 'none',
        }}
      />

      <select
        aria-label="Filter by category"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{
          padding: '8px 12px',
          border: `1px solid ${themeStyles.border}`,
          borderRadius: 8,
          backgroundColor: themeStyles.bg,
          color: themeStyles.text,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        <option value="all">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort threads"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={{
          padding: '8px 12px',
          border: `1px solid ${themeStyles.border}`,
          borderRadius: 8,
          backgroundColor: themeStyles.bg,
          color: themeStyles.text,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="mostPosts">Most Replies</option>
        <option value="mostViews">Most Views</option>
      </select>

      <button
        onClick={() => setShowCreateThread(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: themeStyles.accent,
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 14,
          whiteSpace: 'nowrap',
        }}
      >
        New Thread
      </button>

      <button
        aria-label="Notifications"
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 20,
          position: 'relative',
          color: themeStyles.text,
          padding: 4,
        }}
      >
        🔔
        {notifications.filter((n) => !n.read).length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: 16,
              height: 16,
              fontSize: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </button>

      <button
        aria-label="Toggle theme"
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 20,
          color: themeStyles.text,
          padding: 4,
        }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {getUser(CURRENT_USER).role !== 'member' && (
        <button
          aria-label="Moderation panel"
          onClick={() => setShowModPanel(!showModPanel)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: themeStyles.text,
            padding: 4,
          }}
        >
          {ROLES[getUser(CURRENT_USER).role].badge}
        </button>
      )}
    </div>
  );

  const renderThreadCard = (thread) => {
    const author = getUser(thread.author);
    const totalReplies = thread.posts.reduce((sum, p) => sum + p.replies.length, 0);
    const category = CATEGORIES.find((c) => c.id === thread.category);
    const isBookmarked = bookmarks.includes(thread.id);

    return (
      <div
        key={thread.id}
        onClick={() => {
          setSelectedThread(thread.id);
          incrementViews(thread.id);
        }}
        style={{
          padding: 16,
          backgroundColor: themeStyles.surface,
          border: `1px solid ${thread.isPinned ? themeStyles.accent : themeStyles.border}`,
          borderRadius: 8,
          cursor: 'pointer',
          marginBottom: 8,
          transition: 'background-color 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {thread.isPinned && <span title="Pinned">📌</span>}
          {thread.isLocked && <span title="Locked">🔒</span>}
          {category && (
            <span
              style={{
                backgroundColor: `${category.color}22`,
                color: category.color,
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {category.icon} {category.name}
            </span>
          )}
          <span style={{ fontSize: 12, color: themeStyles.textSecondary, marginLeft: 'auto' }}>
            {formatTimeAgo(thread.createdAt)}
          </span>
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: 16, color: themeStyles.text }}>
          {thread.title}
        </h3>

        <p
          style={{
            margin: '0 0 12px',
            fontSize: 14,
            color: themeStyles.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {thread.content}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: themeStyles.textSecondary }}>
            {author.avatar} {author.name}
            {ROLES[author.role].badge && (
              <span title={ROLES[author.role].label}>{ROLES[author.role].badge}</span>
            )}
          </span>
          <span style={{ fontSize: 12, color: themeStyles.textSecondary }}>
            💬 {thread.posts.length} posts
          </span>
          <span style={{ fontSize: 12, color: themeStyles.textSecondary }}>
            ↩️ {totalReplies} replies
          </span>
          <span style={{ fontSize: 12, color: themeStyles.textSecondary }}>
            👁️ {thread.views} views
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(thread.id);
            }}
            aria-label={isBookmarked ? `Remove bookmark ${thread.title}` : `Bookmark ${thread.title}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              color: isBookmarked ? themeStyles.accent : themeStyles.textSecondary,
              padding: 0,
              marginLeft: 'auto',
            }}
          >
            {isBookmarked ? '🔖' : '📑'}
          </button>
        </div>

        {thread.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            {thread.tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  setTagFilter(tag);
                }}
                style={{
                  backgroundColor: `${themeStyles.accent}15`,
                  color: themeStyles.accent,
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderThreadDetail = () => {
    const thread = threads.find((t) => t.id === selectedThread);
    if (!thread) return null;

    const author = getUser(thread.author);
    const category = CATEGORIES.find((c) => c.id === thread.category);
    const currentUserData = getUser(CURRENT_USER);
    const canModerate = currentUserData.role === 'admin' || currentUserData.role === 'moderator';

    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <button
          onClick={() => setSelectedThread(null)}
          style={{
            background: 'none',
            border: 'none',
            color: themeStyles.accent,
            cursor: 'pointer',
            fontSize: 14,
            marginBottom: 16,
            padding: 0,
          }}
        >
          ← Back to threads
        </button>

        <div
          style={{
            backgroundColor: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`,
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {thread.isPinned && <span>📌</span>}
            {thread.isLocked && <span>🔒</span>}
            {category && (
              <span
                style={{
                  backgroundColor: `${category.color}22`,
                  color: category.color,
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {category.icon} {category.name}
              </span>
            )}
            {canModerate && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleTogglePin(thread.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    border: `1px solid ${themeStyles.border}`,
                    borderRadius: 4,
                    backgroundColor: thread.isPinned ? themeStyles.accent : 'transparent',
                    color: thread.isPinned ? 'white' : themeStyles.text,
                    cursor: 'pointer',
                  }}
                >
                  {thread.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => handleToggleLock(thread.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    border: `1px solid ${themeStyles.border}`,
                    borderRadius: 4,
                    backgroundColor: thread.isLocked ? '#f59e0b' : 'transparent',
                    color: thread.isLocked ? 'white' : themeStyles.text,
                    cursor: 'pointer',
                  }}
                >
                  {thread.isLocked ? 'Unlock' : 'Lock'}
                </button>
                <button
                  onClick={() => handleDeleteThread(thread.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    border: '1px solid #ef4444',
                    borderRadius: 4,
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  Delete Thread
                </button>
              </div>
            )}
          </div>

          <h2 style={{ margin: '0 0 12px', fontSize: 24, color: themeStyles.text }}>
            {thread.title}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: themeStyles.textSecondary }}>
            <span
              onClick={() => setShowUserProfile(thread.author)}
              style={{ cursor: 'pointer', fontWeight: 600, color: themeStyles.text }}
            >
              {author.avatar} {author.name}
            </span>
            {ROLES[author.role].badge && (
              <span title={ROLES[author.role].label}>{ROLES[author.role].badge}</span>
            )}
            <span>•</span>
            <span>{formatDate(thread.createdAt)}</span>
            <span>•</span>
            <span>👁️ {thread.views} views</span>
          </div>

          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: themeStyles.text }}>
            {thread.content}
          </p>

          {thread.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              {thread.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: `${themeStyles.accent}15`,
                    color: themeStyles.accent,
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <h3 style={{ color: themeStyles.text, marginBottom: 16 }}>
          Replies ({thread.posts.length})
        </h3>

        {thread.posts.map((post) => {
          const postAuthor = getUser(post.author);
          return (
            <div
              key={post.id}
              style={{
                backgroundColor: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                <span
                  onClick={() => setShowUserProfile(post.author)}
                  style={{ cursor: 'pointer', fontWeight: 600, color: themeStyles.text }}
                >
                  {postAuthor.avatar} {postAuthor.name}
                </span>
                {ROLES[postAuthor.role].badge && (
                  <span title={ROLES[postAuthor.role].label}>{ROLES[postAuthor.role].badge}</span>
                )}
                <span style={{ color: themeStyles.textSecondary }}>{formatTimeAgo(post.createdAt)}</span>
                {post.isEdited && (
                  <span style={{ color: themeStyles.textSecondary, fontStyle: 'italic', fontSize: 11 }}>
                    (edited)
                  </span>
                )}
              </div>

              {editingPost === post.id ? (
                <div style={{ marginBottom: 8 }}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 8,
                      border: `1px solid ${themeStyles.border}`,
                      borderRadius: 4,
                      backgroundColor: themeStyles.bg,
                      color: themeStyles.text,
                      fontSize: 14,
                      minHeight: 80,
                      resize: 'vertical',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => handleEditPost(thread.id, post.id, editContent)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: themeStyles.accent,
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Save Edit
                    </button>
                    <button
                      onClick={() => {
                        setEditingPost(null);
                        setEditContent('');
                      }}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'transparent',
                        color: themeStyles.text,
                        border: `1px solid ${themeStyles.border}`,
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.5, color: themeStyles.text }}>
                  {post.content}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    aria-label="Upvote"
                    onClick={() => handleVote(thread.id, post.id, null, 1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: post.votedBy[CURRENT_USER] === 1 ? '#22c55e' : themeStyles.textSecondary,
                      fontSize: 14,
                      padding: 2,
                    }}
                  >
                    ▲
                  </button>
                  <span style={{ fontWeight: 600, color: themeStyles.text, minWidth: 20, textAlign: 'center' }}>
                    {post.votes}
                  </span>
                  <button
                    aria-label="Downvote"
                    onClick={() => handleVote(thread.id, post.id, null, -1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: post.votedBy[CURRENT_USER] === -1 ? '#ef4444' : themeStyles.textSecondary,
                      fontSize: 14,
                      padding: 2,
                    }}
                  >
                    ▼
                  </button>
                </div>

                {post.author === CURRENT_USER && editingPost !== post.id && (
                  <button
                    onClick={() => {
                      setEditingPost(post.id);
                      setEditContent(post.content);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: themeStyles.accent,
                      fontSize: 13,
                      padding: 0,
                    }}
                  >
                    Edit
                  </button>
                )}

                {(post.author === CURRENT_USER || canModerate) && (
                  <button
                    onClick={() => handleDeletePost(thread.id, post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: 13,
                      padding: 0,
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>

              {post.replies.length > 0 && (
                <div style={{ marginTop: 12, paddingLeft: 24, borderLeft: `2px solid ${themeStyles.border}` }}>
                  {post.replies.map((reply) => {
                    const replyAuthor = getUser(reply.author);
                    return (
                      <div key={reply.id} style={{ padding: '8px 0', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
                          <span
                            onClick={() => setShowUserProfile(reply.author)}
                            style={{ cursor: 'pointer', fontWeight: 600, color: themeStyles.text }}
                          >
                            {replyAuthor.avatar} {replyAuthor.name}
                          </span>
                          {ROLES[replyAuthor.role].badge && (
                            <span style={{ fontSize: 10 }}>{ROLES[replyAuthor.role].badge}</span>
                          )}
                          <span style={{ color: themeStyles.textSecondary }}>
                            {formatTimeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: 13, color: themeStyles.text }}>
                          {reply.content}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <button
                            aria-label="Upvote reply"
                            onClick={() => handleVote(thread.id, post.id, reply.id, 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: reply.votedBy[CURRENT_USER] === 1 ? '#22c55e' : themeStyles.textSecondary,
                              fontSize: 12,
                              padding: 2,
                            }}
                          >
                            ▲
                          </button>
                          <span style={{ fontWeight: 600, color: themeStyles.text, minWidth: 16, textAlign: 'center', fontSize: 12 }}>
                            {reply.votes}
                          </span>
                          <button
                            aria-label="Downvote reply"
                            onClick={() => handleVote(thread.id, post.id, reply.id, -1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: reply.votedBy[CURRENT_USER] === -1 ? '#ef4444' : themeStyles.textSecondary,
                              fontSize: 12,
                              padding: 2,
                            }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!thread.isLocked && (
                <ReplyInput
                  threadId={thread.id}
                  postId={post.id}
                  onSubmit={handleAddReply}
                  themeStyles={themeStyles}
                />
              )}
            </div>
          );
        })}

        {!thread.isLocked ? (
          <div
            style={{
              backgroundColor: themeStyles.surface,
              border: `1px solid ${themeStyles.border}`,
              borderRadius: 8,
              padding: 16,
              marginTop: 16,
            }}
          >
            <h4 style={{ margin: '0 0 12px', color: themeStyles.text }}>Add a Reply</h4>
            <PostInput
              ref={postInputRef}
              threadId={thread.id}
              onSubmit={handleAddPost}
              themeStyles={themeStyles}
            />
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: 24,
              color: themeStyles.textSecondary,
              backgroundColor: themeStyles.surface,
              border: `1px solid ${themeStyles.border}`,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            🔒 This thread is locked. No new replies can be added.
          </div>
        )}
      </div>
    );
  };

  const renderHome = () => (
    <div style={{ padding: 24 }}>
      {tagFilter && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            padding: '8px 12px',
            backgroundColor: `${themeStyles.accent}15`,
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 13, color: themeStyles.text }}>
            Filtering by tag: <strong>#{tagFilter}</strong>
          </span>
          <button
            onClick={() => setTagFilter('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: themeStyles.accent,
              fontSize: 13,
            }}
          >
            Clear filter
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: themeStyles.textSecondary }}>
          {filteredThreads.length} threads
        </span>
      </div>

      {filteredThreads.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            color: themeStyles.textSecondary,
            backgroundColor: themeStyles.surface,
            borderRadius: 8,
          }}
        >
          No threads found. Try adjusting your filters or create a new thread!
        </div>
      ) : (
        filteredThreads.map((thread) => renderThreadCard(thread))
      )}
    </div>
  );

  const renderBookmarks = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px', color: themeStyles.text }}>Bookmarked Threads</h2>
      {bookmarkedThreads.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            color: themeStyles.textSecondary,
            backgroundColor: themeStyles.surface,
            borderRadius: 8,
          }}
        >
          No bookmarked threads yet. Click the bookmark icon on any thread to save it here.
        </div>
      ) : (
        bookmarkedThreads.map((thread) => renderThreadCard(thread))
      )}
    </div>
  );

  const renderTrending = () => {
    const trending = [...threads]
      .sort((a, b) => {
        const aScore = a.views + a.posts.length * 5 + a.posts.reduce((sum, p) => sum + p.votes, 0) * 2;
        const bScore = b.views + b.posts.length * 5 + b.posts.reduce((sum, p) => sum + p.votes, 0) * 2;
        return bScore - aScore;
      })
      .slice(0, 5);

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 16px', color: themeStyles.text }}>Trending Threads</h2>
        {trending.map((thread, index) => (
          <div key={thread.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: `${themeStyles.accent}22`,
                color: themeStyles.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {index + 1}
            </div>
            <div style={{ flex: 1 }}>{renderThreadCard(thread)}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderMembers = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px', color: themeStyles.text }}>Community Members</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280, 1fr))', gap: 16 }}>
        {MOCK_USERS.map((user) => {
          const userThreads = threads.filter((t) => t.author === user.id).length;
          const userPosts = threads.reduce(
            (sum, t) => sum + t.posts.filter((p) => p.author === user.id).length,
            0
          );

          return (
            <div
              key={user.id}
              onClick={() => setShowUserProfile(user.id)}
              style={{
                backgroundColor: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`,
                borderRadius: 12,
                padding: 20,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{user.avatar}</span>
                <div>
                  <div style={{ fontWeight: 600, color: themeStyles.text }}>
                    {user.name} {ROLES[user.role].badge}
                  </div>
                  <div style={{ fontSize: 12, color: ROLES[user.role].color }}>
                    {ROLES[user.role].label}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: themeStyles.textSecondary, margin: '0 0 12px' }}>
                {user.bio}
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: themeStyles.textSecondary }}>
                <span>⭐ {user.reputation} rep</span>
                <span>📝 {userThreads} threads</span>
                <span>💬 {userPosts} posts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStats = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px', color: themeStyles.text }}>Forum Statistics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Threads', value: stats.totalThreads, icon: '📋' },
          { label: 'Total Posts', value: stats.totalPosts, icon: '💬' },
          { label: 'Total Replies', value: stats.totalReplies, icon: '↩️' },
          { label: 'Members', value: stats.totalMembers, icon: '👥' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: themeStyles.surface,
              border: `1px solid ${themeStyles.border}`,
              borderRadius: 12,
              padding: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 28 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: themeStyles.accent, margin: '8px 0' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, color: themeStyles.textSecondary }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ color: themeStyles.text, marginBottom: 12 }}>Category Breakdown</h3>
      <div style={{ backgroundColor: themeStyles.surface, border: `1px solid ${themeStyles.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {CATEGORIES.map((cat) => {
          const catThreads = threads.filter((t) => t.category === cat.id);
          const catPosts = catThreads.reduce((sum, t) => sum + t.posts.length, 0);
          return (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                borderBottom: `1px solid ${themeStyles.border}`,
              }}
            >
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <span style={{ flex: 1, fontWeight: 500, color: themeStyles.text }}>{cat.name}</span>
              <span style={{ fontSize: 13, color: themeStyles.textSecondary }}>{catThreads.length} threads</span>
              <span style={{ fontSize: 13, color: themeStyles.textSecondary }}>{catPosts} posts</span>
            </div>
          );
        })}
      </div>

      <h3 style={{ color: themeStyles.text, margin: '24px 0 12px' }}>Popular Tags</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {allTags.map((tag) => {
          const count = threads.filter((t) => t.tags.includes(tag)).length;
          return (
            <span
              key={tag}
              onClick={() => {
                setTagFilter(tag);
                setActiveView('home');
              }}
              style={{
                backgroundColor: `${themeStyles.accent}15`,
                color: themeStyles.accent,
                padding: '6px 12px',
                borderRadius: 16,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              #{tag} ({count})
            </span>
          );
        })}
      </div>
    </div>
  );

  const renderCreateThreadModal = () => {
    if (!showCreateThread) return null;
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: themeStyles.surface,
            borderRadius: 12,
            padding: 24,
            width: 560,
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: themeStyles.text }}>Create New Thread</h2>
            <button
              onClick={() => setShowCreateThread(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: themeStyles.textSecondary,
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleCreateThread}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: themeStyles.text, fontSize: 14 }}>
                Title *
              </label>
              <input
                name="title"
                required
                placeholder="Thread title..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${themeStyles.border}`,
                  borderRadius: 8,
                  backgroundColor: themeStyles.bg,
                  color: themeStyles.text,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: themeStyles.text, fontSize: 14 }}>
                Content *
              </label>
              <textarea
                name="content"
                required
                placeholder="What would you like to discuss?"
                rows={5}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${themeStyles.border}`,
                  borderRadius: 8,
                  backgroundColor: themeStyles.bg,
                  color: themeStyles.text,
                  fontSize: 14,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: themeStyles.text, fontSize: 14 }}>
                Category
              </label>
              <select
                name="category"
                defaultValue="general"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${themeStyles.border}`,
                  borderRadius: 8,
                  backgroundColor: themeStyles.bg,
                  color: themeStyles.text,
                  fontSize: 14,
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: themeStyles.text, fontSize: 14 }}>
                Tags (comma separated)
              </label>
              <input
                name="tags"
                placeholder="e.g., react, javascript, help"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${themeStyles.border}`,
                  borderRadius: 8,
                  backgroundColor: themeStyles.bg,
                  color: themeStyles.text,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowCreateThread(false)}
                style={{
                  padding: '8px 20px',
                  border: `1px solid ${themeStyles.border}`,
                  borderRadius: 8,
                  backgroundColor: 'transparent',
                  color: themeStyles.text,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 20px',
                  backgroundColor: themeStyles.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Create Thread
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderUserProfileModal = () => {
    if (!showUserProfile) return null;
    const user = getUser(showUserProfile);
    const userThreads = threads.filter((t) => t.author === user.id);
    const userPosts = threads.reduce(
      (sum, t) => sum + t.posts.filter((p) => p.author === user.id).length,
      0
    );
    const userReplies = threads.reduce(
      (sum, t) =>
        sum + t.posts.reduce((pSum, p) => pSum + p.replies.filter((r) => r.author === user.id).length, 0),
      0
    );

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: themeStyles.surface,
            borderRadius: 12,
            padding: 24,
            width: 440,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: themeStyles.text }}>User Profile</h2>
            <button
              onClick={() => setShowUserProfile(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: themeStyles.textSecondary,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{user.avatar}</div>
            <h3 style={{ margin: '0 0 4px', color: themeStyles.text }}>
              {user.name} {ROLES[user.role].badge}
            </h3>
            <div style={{ color: ROLES[user.role].color, fontSize: 13, fontWeight: 600 }}>
              {ROLES[user.role].label}
            </div>
          </div>

          <p style={{ textAlign: 'center', color: themeStyles.textSecondary, fontSize: 14, marginBottom: 20 }}>
            {user.bio}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ textAlign: 'center', padding: 12, backgroundColor: themeStyles.bg, borderRadius: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: themeStyles.accent }}>{user.reputation}</div>
              <div style={{ fontSize: 12, color: themeStyles.textSecondary }}>Reputation</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, backgroundColor: themeStyles.bg, borderRadius: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: themeStyles.accent }}>{userThreads.length}</div>
              <div style={{ fontSize: 12, color: themeStyles.textSecondary }}>Threads</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, backgroundColor: themeStyles.bg, borderRadius: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: themeStyles.accent }}>{userPosts}</div>
              <div style={{ fontSize: 12, color: themeStyles.textSecondary }}>Posts</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, backgroundColor: themeStyles.bg, borderRadius: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: themeStyles.accent }}>{userReplies}</div>
              <div style={{ fontSize: 12, color: themeStyles.textSecondary }}>Replies</div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: themeStyles.textSecondary, textAlign: 'center' }}>
            Member since {formatDate(user.joinedAt)}
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationPanel = () => {
    if (!showNotifications) return null;
    return (
      <div
        style={{
          position: 'fixed',
          top: 60,
          right: 24,
          width: 320,
          backgroundColor: themeStyles.surface,
          border: `1px solid ${themeStyles.border}`,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 999,
          maxHeight: 400,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: `1px solid ${themeStyles.border}`,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, color: themeStyles.text }}>Notifications</h3>
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: themeStyles.accent,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Mark all read
          </button>
        </div>
        {notifications.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: themeStyles.textSecondary, fontSize: 13 }}>
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '10px 16px',
                borderBottom: `1px solid ${themeStyles.border}`,
                backgroundColor: n.read ? 'transparent' : `${themeStyles.accent}08`,
              }}
            >
              <div style={{ fontSize: 13, color: themeStyles.text }}>{n.text}</div>
              <div style={{ fontSize: 11, color: themeStyles.textSecondary, marginTop: 4 }}>
                {formatTimeAgo(n.time)}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderModPanel = () => {
    if (!showModPanel) return null;
    const pinnedThreads = threads.filter((t) => t.isPinned);
    const lockedThreads = threads.filter((t) => t.isLocked);
    const recentThreads = [...threads].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: themeStyles.surface,
            borderRadius: 12,
            padding: 24,
            width: 560,
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: themeStyles.text }}>Moderation Panel</h2>
            <button
              onClick={() => setShowModPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: themeStyles.textSecondary,
              }}
            >
              ×
            </button>
          </div>

          <h3 style={{ color: themeStyles.text, margin: '0 0 8px' }}>
            Pinned Threads ({pinnedThreads.length})
          </h3>
          {pinnedThreads.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: themeStyles.bg,
                borderRadius: 6,
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              <span style={{ color: themeStyles.text }}>{t.title}</span>
              <button
                onClick={() => handleTogglePin(t.id)}
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                Unpin
              </button>
            </div>
          ))}

          <h3 style={{ color: themeStyles.text, margin: '20px 0 8px' }}>
            Locked Threads ({lockedThreads.length})
          </h3>
          {lockedThreads.length === 0 ? (
            <p style={{ fontSize: 13, color: themeStyles.textSecondary }}>No locked threads</p>
          ) : (
            lockedThreads.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: themeStyles.bg,
                  borderRadius: 6,
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                <span style={{ color: themeStyles.text }}>{t.title}</span>
                <button
                  onClick={() => handleToggleLock(t.id)}
                  style={{
                    padding: '2px 8px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  Unlock
                </button>
              </div>
            ))
          )}

          <h3 style={{ color: themeStyles.text, margin: '20px 0 8px' }}>Recent Threads</h3>
          {recentThreads.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: themeStyles.bg,
                borderRadius: 6,
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              <span style={{ color: themeStyles.text }}>{t.title}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => handleTogglePin(t.id)}
                  style={{
                    padding: '2px 8px',
                    backgroundColor: t.isPinned ? themeStyles.accent : 'transparent',
                    color: t.isPinned ? 'white' : themeStyles.text,
                    border: `1px solid ${themeStyles.border}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  📌
                </button>
                <button
                  onClick={() => handleToggleLock(t.id)}
                  style={{
                    padding: '2px 8px',
                    backgroundColor: t.isLocked ? '#f59e0b' : 'transparent',
                    color: t.isLocked ? 'white' : themeStyles.text,
                    border: `1px solid ${themeStyles.border}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  🔒
                </button>
                <button
                  onClick={() => handleDeleteThread(t.id)}
                  style={{
                    padding: '2px 8px',
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (selectedThread) return renderThreadDetail();
    switch (activeView) {
      case 'bookmarks':
        return renderBookmarks();
      case 'trending':
        return renderTrending();
      case 'members':
        return renderMembers();
      case 'stats':
        return renderStats();
      case 'home':
      default:
        return renderHome();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: themeStyles.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {renderSidebar()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderHeader()}
        <div style={{ flex: 1, overflow: 'auto' }}>{renderContent()}</div>
      </div>
      {renderCreateThreadModal()}
      {renderUserProfileModal()}
      {renderNotificationPanel()}
      {renderModPanel()}
    </div>
  );
}

function PostInput({ threadId, onSubmit, themeStyles }) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(threadId, content);
    setContent('');
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        style={{
          flex: 1,
          padding: '10px 12px',
          border: `1px solid ${themeStyles.border}`,
          borderRadius: 8,
          backgroundColor: themeStyles.bg,
          color: themeStyles.text,
          fontSize: 14,
          minHeight: 60,
          resize: 'vertical',
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          padding: '8px 16px',
          backgroundColor: themeStyles.accent,
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 14,
          alignSelf: 'flex-end',
        }}
      >
        Post
      </button>
    </div>
  );
}

function ReplyInput({ threadId, postId, onSubmit, themeStyles }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = () => {
    if (!replyContent.trim()) return;
    onSubmit(threadId, postId, replyContent);
    setReplyContent('');
    setShowReplyInput(false);
  };

  if (!showReplyInput) {
    return (
      <button
        onClick={() => setShowReplyInput(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: themeStyles.accent,
          fontSize: 13,
          padding: 0,
          marginTop: 8,
        }}
      >
        Reply
      </button>
    );
  }

  return (
    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
      <input
        autoFocus
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Write a reply..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === 'Escape') {
            setShowReplyInput(false);
            setReplyContent('');
          }
        }}
        style={{
          flex: 1,
          padding: '6px 10px',
          border: `1px solid ${themeStyles.border}`,
          borderRadius: 6,
          backgroundColor: themeStyles.bg,
          color: themeStyles.text,
          fontSize: 13,
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          padding: '6px 12px',
          backgroundColor: themeStyles.accent,
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Send
      </button>
      <button
        onClick={() => {
          setShowReplyInput(false);
          setReplyContent('');
        }}
        style={{
          padding: '6px 12px',
          border: `1px solid ${themeStyles.border}`,
          borderRadius: 6,
          backgroundColor: 'transparent',
          color: themeStyles.textSecondary,
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Cancel
      </button>
    </div>
  );
}
