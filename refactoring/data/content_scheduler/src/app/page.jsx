import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: '#1DA1F2', maxChars: 280, supportsImages: true, supportsVideo: true },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E4405F', maxChars: 2200, supportsImages: true, supportsVideo: true },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', maxChars: 3000, supportsImages: true, supportsVideo: true },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: '#1877F2', maxChars: 63206, supportsImages: true, supportsVideo: true },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000', maxChars: 2200, supportsImages: false, supportsVideo: true },
];

const STATUS_COLORS = {
  draft: '#6b7280',
  scheduled: '#3b82f6',
  published: '#22c55e',
  failed: '#ef4444',
};

const STATUS_LABELS = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
};

const CATEGORIES = ['marketing', 'product', 'engagement', 'announcement', 'educational', 'behind-the-scenes'];

const CATEGORY_COLORS = {
  marketing: '#8b5cf6',
  product: '#06b6d4',
  engagement: '#f59e0b',
  announcement: '#ef4444',
  educational: '#10b981',
  'behind-the-scenes': '#ec4899',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const INITIAL_POSTS = [
  {
    id: 'p1', content: 'Excited to announce our new product launch! 🚀 Stay tuned for more details.',
    platforms: ['twitter', 'linkedin', 'facebook'], category: 'announcement', status: 'scheduled',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledHour: 9, scheduledMinute: 0,
    media: [{ type: 'image', name: 'product-launch.png' }],
    hashtags: ['launch', 'newproduct', 'exciting'], createdAt: Date.now() - 86400000 * 2,
    engagement: { likes: 0, shares: 0, comments: 0, impressions: 0 },
  },
  {
    id: 'p2', content: 'Behind the scenes look at our team building session! Great energy in the office today.',
    platforms: ['instagram', 'facebook'], category: 'behind-the-scenes', status: 'published',
    scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    scheduledHour: 14, scheduledMinute: 30,
    media: [{ type: 'image', name: 'team-photo.jpg' }, { type: 'image', name: 'office-fun.jpg' }],
    hashtags: ['teamwork', 'behindthescenes', 'companyculture'], createdAt: Date.now() - 86400000 * 5,
    engagement: { likes: 245, shares: 32, comments: 18, impressions: 4520 },
  },
  {
    id: 'p3', content: 'Did you know? Our platform processes over 1M requests per day. Here\'s how we built it.',
    platforms: ['linkedin', 'twitter'], category: 'educational', status: 'draft',
    scheduledDate: '', scheduledHour: 10, scheduledMinute: 0,
    media: [], hashtags: ['tech', 'engineering', 'scale'], createdAt: Date.now() - 86400000 * 1,
    engagement: { likes: 0, shares: 0, comments: 0, impressions: 0 },
  },
  {
    id: 'p4', content: 'Happy Monday! What are your goals for this week? Share below! 👇',
    platforms: ['twitter', 'instagram', 'facebook', 'linkedin'], category: 'engagement', status: 'scheduled',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    scheduledHour: 8, scheduledMinute: 0,
    media: [], hashtags: ['mondaymotivation', 'goals', 'community'], createdAt: Date.now() - 86400000 * 3,
    engagement: { likes: 0, shares: 0, comments: 0, impressions: 0 },
  },
  {
    id: 'p5', content: 'Check out our latest blog post on scaling your social media presence with data-driven strategies.',
    platforms: ['linkedin', 'twitter', 'facebook'], category: 'marketing', status: 'published',
    scheduledDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    scheduledHour: 11, scheduledMinute: 0,
    media: [{ type: 'image', name: 'blog-cover.png' }],
    hashtags: ['socialmedia', 'marketing', 'strategy'], createdAt: Date.now() - 86400000 * 7,
    engagement: { likes: 189, shares: 67, comments: 23, impressions: 8900 },
  },
  {
    id: 'p6', content: 'New feature alert! You can now schedule posts across 5 platforms simultaneously. Try it out!',
    platforms: ['twitter', 'instagram', 'linkedin', 'facebook'], category: 'product', status: 'scheduled',
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    scheduledHour: 15, scheduledMinute: 0,
    media: [{ type: 'image', name: 'feature-screenshot.png' }],
    hashtags: ['update', 'feature', 'productlaunch'], createdAt: Date.now() - 86400000 * 1,
    engagement: { likes: 0, shares: 0, comments: 0, impressions: 0 },
  },
  {
    id: 'p7', content: 'Quick tip: The best time to post on LinkedIn is between 9-11 AM on Tuesdays and Wednesdays.',
    platforms: ['linkedin'], category: 'educational', status: 'published',
    scheduledDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    scheduledHour: 9, scheduledMinute: 30,
    media: [], hashtags: ['socialmediatips', 'linkedin', 'growthhack'], createdAt: Date.now() - 86400000 * 6,
    engagement: { likes: 412, shares: 156, comments: 45, impressions: 12300 },
  },
  {
    id: 'p8', content: 'We\'re hiring! Looking for passionate developers and designers to join our growing team.',
    platforms: ['linkedin', 'twitter', 'facebook'], category: 'announcement', status: 'draft',
    scheduledDate: '', scheduledHour: 10, scheduledMinute: 0,
    media: [{ type: 'image', name: 'hiring-banner.png' }],
    hashtags: ['hiring', 'jobs', 'careers', 'techjobs'], createdAt: Date.now() - 86400000 * 4,
    engagement: { likes: 0, shares: 0, comments: 0, impressions: 0 },
  },
];

const CONNECTED_PLATFORMS = ['twitter', 'instagram', 'linkedin', 'facebook'];

export default function ContentScheduler() {
  // === Core State ===
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [connectedPlatforms, setConnectedPlatforms] = useState(CONNECTED_PLATFORMS);

  // === View State ===
  const [activeView, setActiveView] = useState('calendar');
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // === Calendar State ===
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // === Filter State ===
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // === Post Editor State ===
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorPlatforms, setEditorPlatforms] = useState([]);
  const [editorCategory, setEditorCategory] = useState('marketing');
  const [editorDate, setEditorDate] = useState('');
  const [editorHour, setEditorHour] = useState(9);
  const [editorMinute, setEditorMinute] = useState(0);
  const [editorHashtags, setEditorHashtags] = useState('');

  // === UI State ===
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAnalyticsDetail, setShowAnalyticsDetail] = useState(null);
  const [showPlatformSettings, setShowPlatformSettings] = useState(false);
  const [draggedPost, setDraggedPost] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [bulkSelected, setBulkSelected] = useState([]);

  const searchInputRef = useRef(null);
  const editorContentRef = useRef(null);

  // === localStorage persistence ===
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('schedulerTheme');
      if (savedTheme) setTheme(savedTheme);
      const savedView = localStorage.getItem('schedulerView');
      if (savedView) setActiveView(savedView);
      const savedPosts = localStorage.getItem('schedulerPosts');
      if (savedPosts) setPosts(JSON.parse(savedPosts));
      const savedPlatforms = localStorage.getItem('schedulerConnectedPlatforms');
      if (savedPlatforms) setConnectedPlatforms(JSON.parse(savedPlatforms));
    } catch (e) {
      // ignore corrupted localStorage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('schedulerTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('schedulerView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('schedulerPosts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('schedulerConnectedPlatforms', JSON.stringify(connectedPlatforms));
  }, [connectedPlatforms]);

  // === Keyboard shortcuts ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showPostEditor) { setShowPostEditor(false); setEditingPost(null); }
        else if (showDeleteConfirm) setShowDeleteConfirm(null);
        else if (showAnalyticsDetail) setShowAnalyticsDetail(null);
        else if (showPlatformSettings) setShowPlatformSettings(false);
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openNewPostEditor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPostEditor, showDeleteConfirm, showAnalyticsDetail, showPlatformSettings]);

  // === Notification auto-dismiss ===
  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => setNotificationMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  // === Derived State (useMemo chains) ===
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filterPlatform !== 'all' && !post.platforms.includes(filterPlatform)) return false;
      if (filterStatus !== 'all' && post.status !== filterStatus) return false;
      if (filterCategory !== 'all' && post.category !== filterCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          post.content.toLowerCase().includes(query) ||
          post.hashtags.some((h) => h.toLowerCase().includes(query)) ||
          post.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [posts, filterPlatform, filterStatus, filterCategory, searchQuery]);

  const postsByDate = useMemo(() => {
    const map = {};
    filteredPosts.forEach((post) => {
      if (post.scheduledDate) {
        if (!map[post.scheduledDate]) map[post.scheduledDate] = [];
        map[post.scheduledDate].push(post);
      }
    });
    return map;
  }, [filteredPosts]);

  const draftPosts = useMemo(() => filteredPosts.filter((p) => p.status === 'draft'), [filteredPosts]);

  const scheduledPosts = useMemo(() => filteredPosts.filter((p) => p.status === 'scheduled'), [filteredPosts]);

  const publishedPosts = useMemo(() => filteredPosts.filter((p) => p.status === 'published'), [filteredPosts]);

  const analyticsData = useMemo(() => {
    const published = posts.filter((p) => p.status === 'published');
    const totalLikes = published.reduce((sum, p) => sum + p.engagement.likes, 0);
    const totalShares = published.reduce((sum, p) => sum + p.engagement.shares, 0);
    const totalComments = published.reduce((sum, p) => sum + p.engagement.comments, 0);
    const totalImpressions = published.reduce((sum, p) => sum + p.engagement.impressions, 0);
    const avgEngagement = published.length > 0 ? ((totalLikes + totalShares + totalComments) / published.length).toFixed(1) : '0';
    const platformBreakdown = {};
    published.forEach((p) => {
      p.platforms.forEach((plat) => {
        if (!platformBreakdown[plat]) platformBreakdown[plat] = { posts: 0, totalEngagement: 0 };
        platformBreakdown[plat].posts += 1;
        platformBreakdown[plat].totalEngagement += p.engagement.likes + p.engagement.shares + p.engagement.comments;
      });
    });
    const categoryBreakdown = {};
    published.forEach((p) => {
      if (!categoryBreakdown[p.category]) categoryBreakdown[p.category] = { posts: 0, totalImpressions: 0 };
      categoryBreakdown[p.category].posts += 1;
      categoryBreakdown[p.category].totalImpressions += p.engagement.impressions;
    });
    return { totalLikes, totalShares, totalComments, totalImpressions, avgEngagement, platformBreakdown, categoryBreakdown, publishedCount: published.length };
  }, [posts]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr, posts: postsByDate[dateStr] || [] });
    }
    return days;
  }, [currentYear, currentMonth, postsByDate]);

  const platformValidationErrors = useMemo(() => {
    if (!editorContent || editorPlatforms.length === 0) return {};
    const errors = {};
    editorPlatforms.forEach((platId) => {
      const platform = PLATFORMS.find((p) => p.id === platId);
      if (platform && editorContent.length > platform.maxChars) {
        errors[platId] = `Exceeds ${platform.name} limit (${editorContent.length}/${platform.maxChars})`;
      }
    });
    return errors;
  }, [editorContent, editorPlatforms]);

  // === Actions ===
  const openNewPostEditor = useCallback(() => {
    setEditingPost(null);
    setEditorContent('');
    setEditorPlatforms([]);
    setEditorCategory('marketing');
    setEditorDate('');
    setEditorHour(9);
    setEditorMinute(0);
    setEditorHashtags('');
    setShowPostEditor(true);
  }, []);

  const openEditPostEditor = useCallback((post) => {
    setEditingPost(post.id);
    setEditorContent(post.content);
    setEditorPlatforms([...post.platforms]);
    setEditorCategory(post.category);
    setEditorDate(post.scheduledDate);
    setEditorHour(post.scheduledHour);
    setEditorMinute(post.scheduledMinute);
    setEditorHashtags(post.hashtags.join(', '));
    setShowPostEditor(true);
  }, []);

  const savePost = useCallback(() => {
    const hashtagList = editorHashtags
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);
    if (editingPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost
            ? { ...p, content: editorContent, platforms: editorPlatforms, category: editorCategory, scheduledDate: editorDate, scheduledHour: editorHour, scheduledMinute: editorMinute, hashtags: hashtagList, status: editorDate ? 'scheduled' : 'draft' }
            : p
        )
      );
      setNotificationMessage('Post updated successfully!');
    } else {
      const newPost = {
        id: `p${Date.now()}`,
        content: editorContent,
        platforms: editorPlatforms,
        category: editorCategory,
        status: editorDate ? 'scheduled' : 'draft',
        scheduledDate: editorDate,
        scheduledHour: editorHour,
        scheduledMinute: editorMinute,
        media: [],
        hashtags: hashtagList,
        createdAt: Date.now(),
        engagement: { likes: 0, shares: 0, comments: 0, impressions: 0 },
      };
      setPosts((prev) => [...prev, newPost]);
      setNotificationMessage('Post created successfully!');
    }
    setShowPostEditor(false);
    setEditingPost(null);
  }, [editingPost, editorContent, editorPlatforms, editorCategory, editorDate, editorHour, editorMinute, editorHashtags]);

  const deletePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setShowDeleteConfirm(null);
    setNotificationMessage('Post deleted.');
  }, []);

  const duplicatePost = useCallback((post) => {
    const newPost = { ...post, id: `p${Date.now()}`, status: 'draft', scheduledDate: '', createdAt: Date.now(), engagement: { likes: 0, shares: 0, comments: 0, impressions: 0 } };
    setPosts((prev) => [...prev, newPost]);
    setNotificationMessage('Post duplicated as draft.');
  }, []);

  const toggleBulkSelect = useCallback((postId) => {
    setBulkSelected((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
  }, []);

  const bulkDelete = useCallback(() => {
    if (window.confirm(`Delete ${bulkSelected.length} selected posts?`)) {
      setPosts((prev) => prev.filter((p) => !bulkSelected.includes(p.id)));
      setBulkSelected([]);
      setNotificationMessage(`${bulkSelected.length} posts deleted.`);
    }
  }, [bulkSelected]);

  const handleDragStart = useCallback((post) => {
    setDraggedPost(post);
  }, []);

  const handleDrop = useCallback((dateStr) => {
    if (draggedPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === draggedPost.id ? { ...p, scheduledDate: dateStr, status: 'scheduled' } : p
        )
      );
      setNotificationMessage(`"${draggedPost.content.substring(0, 30)}..." rescheduled.`);
      setDraggedPost(null);
    }
  }, [draggedPost]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const togglePlatformConnection = useCallback((platformId) => {
    setConnectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  }, []);

  const navigateMonth = useCallback((direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
      else setCurrentMonth((m) => m - 1);
    } else {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
      else setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  }, []);

  const changeView = useCallback((view) => {
    setActiveView(view);
    setBulkSelected([]);
  }, []);

  // === Theme ===
  const themeStyles = theme === 'dark'
    ? { bg: '#1a1a2e', sidebar: '#16213e', card: '#0f3460', text: '#e0e0e0', textSecondary: '#a0a0a0', border: '#2a2a4a', accent: '#e94560', inputBg: '#1a1a3e' }
    : { bg: '#f8fafc', sidebar: '#ffffff', card: '#ffffff', text: '#1e293b', textSecondary: '#64748b', border: '#e2e8f0', accent: '#3b82f6', inputBg: '#ffffff' };

  // === Render Helpers ===
  const renderPlatformBadge = (platformId) => {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return null;
    return (
      <span key={platformId} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', backgroundColor: platform.color + '20', color: platform.color, marginRight: '4px' }}>
        {platform.icon} {platform.name}
      </span>
    );
  };

  const renderCategoryBadge = (category) => (
    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', backgroundColor: (CATEGORY_COLORS[category] || '#6b7280') + '20', color: CATEGORY_COLORS[category] || '#6b7280' }}>
      {category}
    </span>
  );

  const renderStatusBadge = (status) => (
    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, backgroundColor: (STATUS_COLORS[status] || '#6b7280') + '20', color: STATUS_COLORS[status] || '#6b7280' }}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  const renderPostCard = (post, compact = false) => (
    <div
      key={post.id}
      draggable
      onDragStart={() => handleDragStart(post)}
      style={{ padding: compact ? '8px' : '16px', border: `1px solid ${themeStyles.border}`, borderRadius: '8px', marginBottom: '8px', backgroundColor: themeStyles.card, cursor: 'grab', borderLeft: `4px solid ${CATEGORY_COLORS[post.category] || '#6b7280'}` }}
      aria-label={`Post: ${post.content.substring(0, 50)}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {post.platforms.map(renderPlatformBadge)}
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {renderStatusBadge(post.status)}
          <input
            type="checkbox"
            checked={bulkSelected.includes(post.id)}
            onChange={() => toggleBulkSelect(post.id)}
            aria-label={`Select post ${post.id}`}
            style={{ marginLeft: '8px' }}
          />
        </div>
      </div>
      <p style={{ color: themeStyles.text, fontSize: compact ? '12px' : '14px', lineHeight: 1.5, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: 'vertical' }}>
        {post.content}
      </p>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {renderCategoryBadge(post.category)}
        {post.hashtags.map((tag) => (
          <span key={tag} style={{ fontSize: '11px', color: themeStyles.accent }}>#{tag}</span>
        ))}
      </div>
      {post.scheduledDate && (
        <p style={{ fontSize: '12px', color: themeStyles.textSecondary, marginBottom: '8px' }}>
          📅 {post.scheduledDate} at {String(post.scheduledHour).padStart(2, '0')}:{String(post.scheduledMinute).padStart(2, '0')}
        </p>
      )}
      {post.media.length > 0 && (
        <p style={{ fontSize: '11px', color: themeStyles.textSecondary, marginBottom: '8px' }}>
          📎 {post.media.length} media file{post.media.length > 1 ? 's' : ''}
        </p>
      )}
      {!compact && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => openEditPostEditor(post)} style={{ padding: '4px 12px', borderRadius: '4px', border: `1px solid ${themeStyles.border}`, backgroundColor: 'transparent', color: themeStyles.text, cursor: 'pointer', fontSize: '12px' }}>
            Edit
          </button>
          <button onClick={() => duplicatePost(post)} style={{ padding: '4px 12px', borderRadius: '4px', border: `1px solid ${themeStyles.border}`, backgroundColor: 'transparent', color: themeStyles.text, cursor: 'pointer', fontSize: '12px' }}>
            Duplicate
          </button>
          <button onClick={() => setShowDeleteConfirm(post.id)} style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );

  // === Main Render ===
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: themeStyles.bg, color: themeStyles.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? '60px' : '240px', backgroundColor: themeStyles.sidebar, borderRight: `1px solid ${themeStyles.border}`, padding: '16px', display: 'flex', flexDirection: 'column', transition: 'width 0.2s', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          {!sidebarCollapsed && <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>ContentCal</h1>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Toggle sidebar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: themeStyles.text }}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <button onClick={openNewPostEditor} aria-label="Create new post" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: themeStyles.accent, color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>
              + New Post
            </button>

            <nav>
              {[
                { id: 'calendar', label: 'Calendar', icon: '📅' },
                { id: 'list', label: 'All Posts', icon: '📋' },
                { id: 'drafts', label: 'Drafts', icon: '📝' },
                { id: 'analytics', label: 'Analytics', icon: '📊' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => changeView(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', marginBottom: '4px', borderRadius: '8px', border: 'none', backgroundColor: activeView === item.id ? themeStyles.accent + '20' : 'transparent', color: activeView === item.id ? themeStyles.accent : themeStyles.text, cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '12px', borderRadius: '8px', backgroundColor: themeStyles.bg, fontSize: '12px' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Quick Stats</p>
              <p style={{ margin: '2px 0', color: themeStyles.textSecondary }}>{scheduledPosts.length} scheduled</p>
              <p style={{ margin: '2px 0', color: themeStyles.textSecondary }}>{draftPosts.length} drafts</p>
              <p style={{ margin: '2px 0', color: themeStyles.textSecondary }}>{publishedPosts.length} published</p>
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts... (Ctrl+K)"
              style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text, fontSize: '14px', width: '280px' }}
            />
            <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} aria-label="Filter by platform" style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text }}>
              <option value="all">All Platforms</option>
              {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status" style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text }}>
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category" style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text }}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {bulkSelected.length > 0 && (
              <span style={{ fontSize: '13px', color: themeStyles.textSecondary }}>{bulkSelected.length} selected</span>
            )}
            {bulkSelected.length > 0 && (
              <button onClick={bulkDelete} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>
                Delete Selected
              </button>
            )}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Notification Banner */}
        {notificationMessage && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#22c55e20', color: '#22c55e', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{notificationMessage}</span>
            <button onClick={() => setNotificationMessage('')} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => navigateMonth('prev')} aria-label="Previous month" style={{ background: 'none', border: `1px solid ${themeStyles.border}`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', color: themeStyles.text }}>
                  ◀
                </button>
                <h2 style={{ margin: 0, fontSize: '18px' }}>
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => navigateMonth('next')} aria-label="Next month" style={{ background: 'none', border: `1px solid ${themeStyles.border}`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', color: themeStyles.text }}>
                  ▶
                </button>
                <button onClick={goToToday} style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: 'transparent', color: themeStyles.accent, cursor: 'pointer', fontSize: '13px' }}>
                  Today
                </button>
              </div>
              <p style={{ fontSize: '13px', color: themeStyles.textSecondary }}>
                {filteredPosts.length} posts total | {scheduledPosts.length} scheduled | {draftPosts.length} drafts
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: themeStyles.border, borderRadius: '8px', overflow: 'hidden' }}>
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} style={{ padding: '8px', textAlign: 'center', fontWeight: 600, fontSize: '12px', backgroundColor: themeStyles.card, color: themeStyles.textSecondary }}>
                  {day}
                </div>
              ))}
              {calendarDays.map((cell, idx) => (
                <div
                  key={idx}
                  onDragOver={cell ? handleDragOver : undefined}
                  onDrop={cell ? () => handleDrop(cell.dateStr) : undefined}
                  onClick={() => cell && setSelectedDate(cell.dateStr === selectedDate ? null : cell.dateStr)}
                  style={{ minHeight: '100px', padding: '8px', backgroundColor: cell?.dateStr === selectedDate ? themeStyles.accent + '10' : themeStyles.card, cursor: cell ? 'pointer' : 'default', borderBottom: cell?.dateStr === selectedDate ? `2px solid ${themeStyles.accent}` : 'none' }}
                >
                  {cell && (
                    <>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: cell.dateStr === new Date().toISOString().split('T')[0] ? themeStyles.accent : themeStyles.textSecondary }}>
                        {cell.day}
                      </span>
                      {cell.posts.map((post) => (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={() => handleDragStart(post)}
                          onClick={(e) => { e.stopPropagation(); openEditPostEditor(post); }}
                          style={{ marginTop: '4px', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', backgroundColor: (CATEGORY_COLORS[post.category] || '#6b7280') + '20', color: CATEGORY_COLORS[post.category] || '#6b7280', cursor: 'grab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderLeft: `3px solid ${STATUS_COLORS[post.status]}` }}
                          aria-label={`Scheduled: ${post.content.substring(0, 30)}`}
                        >
                          {post.platforms.map((p) => PLATFORMS.find((pl) => pl.id === p)?.icon).join('')} {post.content.substring(0, 25)}...
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>

            {selectedDate && postsByDate[selectedDate] && (
              <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.card }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Posts for {selectedDate}</h3>
                {postsByDate[selectedDate].map((post) => renderPostCard(post))}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>All Posts ({filteredPosts.length})</h2>
            </div>
            {filteredPosts.length === 0 ? (
              <p style={{ textAlign: 'center', color: themeStyles.textSecondary, padding: '40px' }}>No posts match your filters.</p>
            ) : (
              filteredPosts.map((post) => renderPostCard(post))
            )}
          </div>
        )}

        {/* Drafts View */}
        {activeView === 'drafts' && (
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Drafts ({draftPosts.length})</h2>
            {draftPosts.length === 0 ? (
              <p style={{ textAlign: 'center', color: themeStyles.textSecondary, padding: '40px' }}>No drafts. Create a post without a schedule date to save it as a draft.</p>
            ) : (
              draftPosts.map((post) => renderPostCard(post))
            )}
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Analytics Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Impressions', value: analyticsData.totalImpressions.toLocaleString(), icon: '👁️' },
                { label: 'Total Likes', value: analyticsData.totalLikes.toLocaleString(), icon: '❤️' },
                { label: 'Total Shares', value: analyticsData.totalShares.toLocaleString(), icon: '🔁' },
                { label: 'Avg Engagement', value: analyticsData.avgEngagement, icon: '📈' },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.card }}>
                  <p style={{ margin: '0 0 8px', fontSize: '24px' }}>{stat.icon}</p>
                  <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700 }}>{stat.value}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: themeStyles.textSecondary }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.card }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Platform Performance</h3>
                {Object.entries(analyticsData.platformBreakdown).map(([platId, data]) => {
                  const platform = PLATFORMS.find((p) => p.id === platId);
                  return (
                    <div key={platId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${themeStyles.border}` }}>
                      <span>{platform?.icon} {platform?.name}</span>
                      <span style={{ fontSize: '13px', color: themeStyles.textSecondary }}>{data.posts} posts | {data.totalEngagement} engagements</span>
                    </div>
                  );
                })}
                {Object.keys(analyticsData.platformBreakdown).length === 0 && (
                  <p style={{ color: themeStyles.textSecondary, textAlign: 'center' }}>No published posts yet.</p>
                )}
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.card }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Category Performance</h3>
                {Object.entries(analyticsData.categoryBreakdown).map(([cat, data]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${themeStyles.border}` }}>
                    <span>{renderCategoryBadge(cat)}</span>
                    <span style={{ fontSize: '13px', color: themeStyles.textSecondary }}>{data.posts} posts | {data.totalImpressions.toLocaleString()} impressions</span>
                  </div>
                ))}
                {Object.keys(analyticsData.categoryBreakdown).length === 0 && (
                  <p style={{ color: themeStyles.textSecondary, textAlign: 'center' }}>No published posts yet.</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '20px', borderRadius: '12px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.card }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Top Performing Posts</h3>
              {publishedPosts
                .sort((a, b) => (b.engagement.likes + b.engagement.shares + b.engagement.comments) - (a.engagement.likes + a.engagement.shares + a.engagement.comments))
                .slice(0, 3)
                .map((post) => (
                  <div key={post.id} onClick={() => setShowAnalyticsDetail(post)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginBottom: '8px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, cursor: 'pointer' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '14px' }}>{post.content.substring(0, 60)}...</p>
                      <div style={{ display: 'flex', gap: '4px' }}>{post.platforms.map(renderPlatformBadge)}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '13px', color: themeStyles.textSecondary }}>
                      <p style={{ margin: 0 }}>❤️ {post.engagement.likes} | 🔁 {post.engagement.shares} | 💬 {post.engagement.comments}</p>
                      <p style={{ margin: 0 }}>👁️ {post.engagement.impressions.toLocaleString()} impressions</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Settings View */}
        {activeView === 'settings' && (
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Settings</h2>
            <div style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.card, marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Connected Platforms</h3>
              {PLATFORMS.map((platform) => {
                const isConnected = connectedPlatforms.includes(platform.id);
                return (
                  <div key={platform.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${themeStyles.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{platform.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{platform.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: themeStyles.textSecondary }}>Max {platform.maxChars} characters</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePlatformConnection(platform.id)}
                      aria-label={`${isConnected ? 'Disconnect' : 'Connect'} ${platform.name}`}
                      style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', backgroundColor: isConnected ? '#22c55e' : themeStyles.border, color: isConnected ? '#fff' : themeStyles.text, cursor: 'pointer', fontSize: '13px' }}
                    >
                      {isConnected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.card }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Appearance</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Dark Mode</span>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle dark mode"
                  style={{ padding: '6px 16px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: theme === 'dark' ? themeStyles.accent : 'transparent', color: theme === 'dark' ? '#fff' : themeStyles.text, cursor: 'pointer' }}
                >
                  {theme === 'dark' ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Post Editor Modal */}
      {showPostEditor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ width: '600px', maxHeight: '80vh', overflow: 'auto', borderRadius: '12px', backgroundColor: themeStyles.card, padding: '24px', border: `1px solid ${themeStyles.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
              <button onClick={() => { setShowPostEditor(false); setEditingPost(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: themeStyles.text }}>×</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Content</label>
              <textarea
                ref={editorContentRef}
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Write your post content..."
                style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text, fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: themeStyles.textSecondary }}>{editorContent.length} characters</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Platforms</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PLATFORMS.map((platform) => {
                  const isSelected = editorPlatforms.includes(platform.id);
                  const isConnected = connectedPlatforms.includes(platform.id);
                  const hasError = platformValidationErrors[platform.id];
                  return (
                    <button
                      key={platform.id}
                      onClick={() => isConnected && setEditorPlatforms((prev) => isSelected ? prev.filter((p) => p !== platform.id) : [...prev, platform.id])}
                      disabled={!isConnected}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: hasError ? '2px solid #ef4444' : `1px solid ${isSelected ? platform.color : themeStyles.border}`, backgroundColor: isSelected ? platform.color + '20' : 'transparent', color: isConnected ? themeStyles.text : themeStyles.textSecondary, cursor: isConnected ? 'pointer' : 'not-allowed', opacity: isConnected ? 1 : 0.5 }}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${platform.name}`}
                    >
                      {platform.icon} {platform.name}
                    </button>
                  );
                })}
              </div>
              {Object.entries(platformValidationErrors).map(([platId, error]) => (
                <p key={platId} style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444' }}>{error}</p>
              ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Category</label>
              <select value={editorCategory} onChange={(e) => setEditorCategory(e.target.value)} aria-label="Select category" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text }}>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Date</label>
                <input type="date" value={editorDate} onChange={(e) => setEditorDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Hour</label>
                <select value={editorHour} onChange={(e) => setEditorHour(parseInt(e.target.value))} aria-label="Select hour" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text }}>
                  {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Minute</label>
                <select value={editorMinute} onChange={(e) => setEditorMinute(parseInt(e.target.value))} aria-label="Select minute" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text }}>
                  {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Hashtags (comma-separated)</label>
              <input
                type="text"
                value={editorHashtags}
                onChange={(e) => setEditorHashtags(e.target.value)}
                placeholder="marketing, social, growth"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => { setShowPostEditor(false); setEditingPost(null); }} style={{ padding: '8px 20px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: 'transparent', color: themeStyles.text, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={savePost}
                disabled={!editorContent.trim() || editorPlatforms.length === 0 || Object.keys(platformValidationErrors).length > 0}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: themeStyles.accent, color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: (!editorContent.trim() || editorPlatforms.length === 0 || Object.keys(platformValidationErrors).length > 0) ? 0.5 : 1 }}
              >
                {editingPost ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
          <div style={{ width: '400px', borderRadius: '12px', backgroundColor: themeStyles.card, padding: '24px', border: `1px solid ${themeStyles.border}` }}>
            <h3 style={{ margin: '0 0 12px' }}>Delete Post?</h3>
            <p style={{ margin: '0 0 20px', color: themeStyles.textSecondary }}>This action cannot be undone. The post will be permanently removed from all platforms.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '8px 20px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: 'transparent', color: themeStyles.text, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => deletePost(showDeleteConfirm)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Detail Modal */}
      {showAnalyticsDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
          <div style={{ width: '500px', borderRadius: '12px', backgroundColor: themeStyles.card, padding: '24px', border: `1px solid ${themeStyles.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Post Analytics</h3>
              <button onClick={() => setShowAnalyticsDetail(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: themeStyles.text }}>×</button>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '14px', lineHeight: 1.5 }}>{showAnalyticsDetail.content}</p>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{showAnalyticsDetail.platforms.map(renderPlatformBadge)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: themeStyles.bg }}>
                <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>{showAnalyticsDetail.engagement.impressions.toLocaleString()}</p>
                <p style={{ margin: 0, fontSize: '12px', color: themeStyles.textSecondary }}>Impressions</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: themeStyles.bg }}>
                <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>{showAnalyticsDetail.engagement.likes}</p>
                <p style={{ margin: 0, fontSize: '12px', color: themeStyles.textSecondary }}>Likes</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: themeStyles.bg }}>
                <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>{showAnalyticsDetail.engagement.shares}</p>
                <p style={{ margin: 0, fontSize: '12px', color: themeStyles.textSecondary }}>Shares</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: themeStyles.bg }}>
                <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>{showAnalyticsDetail.engagement.comments}</p>
                <p style={{ margin: 0, fontSize: '12px', color: themeStyles.textSecondary }}>Comments</p>
              </div>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: '12px', color: themeStyles.textSecondary }}>
              Engagement Rate: {showAnalyticsDetail.engagement.impressions > 0
                ? ((showAnalyticsDetail.engagement.likes + showAnalyticsDetail.engagement.shares + showAnalyticsDetail.engagement.comments) / showAnalyticsDetail.engagement.impressions * 100).toFixed(2)
                : '0'}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
