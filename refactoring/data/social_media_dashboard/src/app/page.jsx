import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PLATFORMS = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'];

const PLATFORM_COLORS = {
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  tiktok: '#000000',
};

const PLATFORM_ICONS = {
  twitter: '\ud83d\udc26',
  instagram: '\ud83d\udcf7',
  facebook: '\ud83d\udc4d',
  linkedin: '\ud83d\udcbc',
  tiktok: '\ud83c\udfb5',
};

const MOCK_ACCOUNTS = [
  { id: 'a1', platform: 'twitter', handle: '@techbrand', displayName: 'TechBrand', followers: 24500, following: 1200, verified: true, avatar: '\ud83d\ude80' },
  { id: 'a2', platform: 'instagram', handle: '@techbrand.ig', displayName: 'TechBrand Official', followers: 45200, following: 890, verified: true, avatar: '\u2728' },
  { id: 'a3', platform: 'facebook', handle: 'TechBrand', displayName: 'TechBrand Page', followers: 32100, following: 0, verified: false, avatar: '\ud83d\udcbb' },
  { id: 'a4', platform: 'linkedin', handle: 'techbrand-inc', displayName: 'TechBrand Inc.', followers: 18700, following: 450, verified: true, avatar: '\ud83c\udfe2' },
  { id: 'a5', platform: 'tiktok', handle: '@techbrand_tt', displayName: 'TechBrand TikTok', followers: 67800, following: 200, verified: false, avatar: '\ud83c\udfac' },
];

const INITIAL_POSTS = [
  {
    id: 'p1', accountId: 'a1', content: 'Excited to announce our new product launch! Stay tuned for something amazing. #tech #innovation',
    createdAt: Date.now() - 86400000 * 2, scheduledAt: null, status: 'published',
    likes: 342, comments: 56, shares: 89, impressions: 12400, engagementRate: 3.9,
    hashtags: ['tech', 'innovation'], mediaUrl: null, mediaType: null,
  },
  {
    id: 'p2', accountId: 'a2', content: 'Behind the scenes at our design studio. Swipe to see the creative process!',
    createdAt: Date.now() - 86400000 * 1, scheduledAt: null, status: 'published',
    likes: 1205, comments: 134, shares: 267, impressions: 34500, engagementRate: 4.7,
    hashtags: ['behindthescenes', 'design'], mediaUrl: 'studio.jpg', mediaType: 'image',
  },
  {
    id: 'p3', accountId: 'a1', content: 'Thread: 5 tips for building a successful tech startup in 2026...',
    createdAt: Date.now() - 86400000 * 3, scheduledAt: null, status: 'published',
    likes: 567, comments: 98, shares: 234, impressions: 21000, engagementRate: 4.3,
    hashtags: ['startup', 'tech', 'entrepreneurship'], mediaUrl: null, mediaType: null,
  },
  {
    id: 'p4', accountId: 'a3', content: 'Join us for our live Q&A session this Friday at 3pm EST!',
    createdAt: Date.now() - 86400000 * 4, scheduledAt: null, status: 'published',
    likes: 89, comments: 23, shares: 45, impressions: 5600, engagementRate: 2.8,
    hashtags: ['liveqa', 'community'], mediaUrl: null, mediaType: null,
  },
  {
    id: 'p5', accountId: 'a4', content: 'We are hiring! Check out our open positions for Senior Engineers and Product Managers.',
    createdAt: Date.now() - 86400000 * 5, scheduledAt: null, status: 'published',
    likes: 234, comments: 67, shares: 156, impressions: 15800, engagementRate: 2.9,
    hashtags: ['hiring', 'careers', 'tech'], mediaUrl: null, mediaType: null,
  },
  {
    id: 'p6', accountId: 'a5', content: 'Our viral dance challenge just hit 1M views! Thank you all!',
    createdAt: Date.now() - 86400000 * 1, scheduledAt: null, status: 'published',
    likes: 4520, comments: 890, shares: 1230, impressions: 98000, engagementRate: 6.8,
    hashtags: ['viral', 'challenge', 'milestone'], mediaUrl: 'dance.mp4', mediaType: 'video',
  },
  {
    id: 'p7', accountId: 'a1', content: 'Upcoming webinar: AI in 2026 - register now!',
    createdAt: Date.now(), scheduledAt: Date.now() + 86400000 * 2, status: 'scheduled',
    likes: 0, comments: 0, shares: 0, impressions: 0, engagementRate: 0,
    hashtags: ['ai', 'webinar'], mediaUrl: null, mediaType: null,
  },
  {
    id: 'p8', accountId: 'a2', content: 'New collection dropping next week! Here is a sneak peek...',
    createdAt: Date.now(), scheduledAt: Date.now() + 86400000 * 5, status: 'scheduled',
    likes: 0, comments: 0, shares: 0, impressions: 0, engagementRate: 0,
    hashtags: ['newcollection', 'sneakpeek'], mediaUrl: 'preview.jpg', mediaType: 'image',
  },
  {
    id: 'p9', accountId: 'a3', content: 'Draft: Year in review blog post summary for social sharing',
    createdAt: Date.now() - 86400000 * 6, scheduledAt: null, status: 'draft',
    likes: 0, comments: 0, shares: 0, impressions: 0, engagementRate: 0,
    hashtags: ['yearinreview'], mediaUrl: null, mediaType: null,
  },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'mention', text: '@user123 mentioned you in a comment', accountId: 'a1', read: false, timestamp: Date.now() - 3600000 },
  { id: 'n2', type: 'follower', text: 'You gained 50 new followers today', accountId: 'a2', read: false, timestamp: Date.now() - 7200000 },
  { id: 'n3', type: 'engagement', text: 'Your post reached 10K impressions', accountId: 'a1', read: true, timestamp: Date.now() - 86400000 },
  { id: 'n4', type: 'milestone', text: 'Congratulations! You reached 45K followers', accountId: 'a2', read: true, timestamp: Date.now() - 86400000 * 2 },
  { id: 'n5', type: 'mention', text: '@brandpartner tagged you in a post', accountId: 'a4', read: false, timestamp: Date.now() - 1800000 },
  { id: 'n6', type: 'scheduled', text: 'Your scheduled post will go live in 2 hours', accountId: 'a1', read: false, timestamp: Date.now() - 900000 },
];

const INITIAL_HASHTAG_DATA = [
  { tag: 'tech', postsCount: 4, totalReach: 48000, trend: 'up' },
  { tag: 'innovation', postsCount: 1, totalReach: 12400, trend: 'stable' },
  { tag: 'design', postsCount: 1, totalReach: 34500, trend: 'up' },
  { tag: 'startup', postsCount: 1, totalReach: 21000, trend: 'down' },
  { tag: 'hiring', postsCount: 1, totalReach: 15800, trend: 'up' },
  { tag: 'viral', postsCount: 1, totalReach: 98000, trend: 'up' },
  { tag: 'community', postsCount: 1, totalReach: 5600, trend: 'stable' },
  { tag: 'ai', postsCount: 1, totalReach: 0, trend: 'up' },
];

export default function SocialMediaDashboard() {
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [hashtagData, setHashtagData] = useState(INITIAL_HASHTAG_DATA);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Post composer state
  const [showComposer, setShowComposer] = useState(false);
  const [composerContent, setComposerContent] = useState('');
  const [composerAccountId, setComposerAccountId] = useState('a1');
  const [composerScheduleDate, setComposerScheduleDate] = useState('');
  const [composerScheduleTime, setComposerScheduleTime] = useState('');
  const [composerMediaType, setComposerMediaType] = useState('none');
  const [isEditingPost, setIsEditingPost] = useState(null);

  // Post filters
  const [postStatusFilter, setPostStatusFilter] = useState('all');
  const [postPlatformFilter, setPostPlatformFilter] = useState('all');
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postSortBy, setPostSortBy] = useState('newest');

  // Notification state
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');

  // Analytics date range
  const [analyticsRange, setAnalyticsRange] = useState('7d');

  // Detail views
  const [showPostDetail, setShowPostDetail] = useState(null);
  const [showAccountDetail, setShowAccountDetail] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('smDashboardTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
    const savedTab = localStorage.getItem('smDashboardTab');
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowComposer(false);
        setShowNotificationPanel(false);
        setShowPostDetail(null);
        setShowAccountDetail(null);
        setIsEditingPost(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowComposer(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('smDashboardTheme', next ? 'dark' : 'light');
      return next;
    });
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('smDashboardTab', tab);
    setSelectedAccountId(null);
    setShowPostDetail(null);
    setShowAccountDetail(null);
  };

  const getAccount = (id) => accounts.find(a => a.id === id);

  const getTotalFollowers = useCallback(() => {
    return accounts.reduce((sum, a) => sum + a.followers, 0);
  }, [accounts]);

  const getTotalEngagement = useCallback(() => {
    const published = posts.filter(p => p.status === 'published');
    return published.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0);
  }, [posts]);

  const getAverageEngagementRate = useCallback(() => {
    const published = posts.filter(p => p.status === 'published');
    if (published.length === 0) return 0;
    const avg = published.reduce((sum, p) => sum + p.engagementRate, 0) / published.length;
    return Math.round(avg * 10) / 10;
  }, [posts]);

  const getTotalImpressions = useCallback(() => {
    return posts.filter(p => p.status === 'published').reduce((sum, p) => sum + p.impressions, 0);
  }, [posts]);

  const getUnreadNotificationsCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getScheduledPostsCount = useCallback(() => {
    return posts.filter(p => p.status === 'scheduled').length;
  }, [posts]);

  const getBestPerformingPost = useCallback(() => {
    const published = posts.filter(p => p.status === 'published');
    if (published.length === 0) return null;
    return published.reduce((best, p) => p.engagementRate > best.engagementRate ? p : best);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (postStatusFilter !== 'all' && p.status !== postStatusFilter) return false;
      if (postPlatformFilter !== 'all') {
        const acct = getAccount(p.accountId);
        if (acct && acct.platform !== postPlatformFilter) return false;
      }
      if (selectedAccountId && p.accountId !== selectedAccountId) return false;
      if (postSearchQuery) {
        const q = postSearchQuery.toLowerCase();
        const matchContent = p.content.toLowerCase().includes(q);
        const matchHashtags = p.hashtags.some(h => h.toLowerCase().includes(q));
        if (!matchContent && !matchHashtags) return false;
      }
      return true;
    }).sort((a, b) => {
      if (postSortBy === 'newest') return b.createdAt - a.createdAt;
      if (postSortBy === 'oldest') return a.createdAt - b.createdAt;
      if (postSortBy === 'engagement') return b.engagementRate - a.engagementRate;
      if (postSortBy === 'impressions') return b.impressions - a.impressions;
      if (postSortBy === 'likes') return b.likes - a.likes;
      return 0;
    });
  }, [posts, postStatusFilter, postPlatformFilter, selectedAccountId, postSearchQuery, postSortBy]);

  const filteredNotifications = useMemo(() => {
    if (notificationFilter === 'all') return notifications;
    if (notificationFilter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === notificationFilter);
  }, [notifications, notificationFilter]);

  const createPost = () => {
    if (!composerContent.trim()) return;
    const now = Date.now();
    let scheduledAt = null;
    let status = 'published';
    if (composerScheduleDate && composerScheduleTime) {
      scheduledAt = new Date(`${composerScheduleDate}T${composerScheduleTime}`).getTime();
      status = 'scheduled';
    }
    const hashtags = composerContent.match(/#(\w+)/g)?.map(h => h.slice(1)) || [];
    if (isEditingPost) {
      setPosts(prev => prev.map(p => {
        if (p.id !== isEditingPost) return p;
        return { ...p, content: composerContent, hashtags, scheduledAt, status: scheduledAt ? 'scheduled' : p.status, mediaType: composerMediaType === 'none' ? null : composerMediaType };
      }));
      setIsEditingPost(null);
    } else {
      const newPost = {
        id: `p${now}`, accountId: composerAccountId, content: composerContent,
        createdAt: now, scheduledAt, status,
        likes: 0, comments: 0, shares: 0, impressions: 0, engagementRate: 0,
        hashtags, mediaUrl: composerMediaType !== 'none' ? 'placeholder' : null, mediaType: composerMediaType === 'none' ? null : composerMediaType,
      };
      setPosts(prev => [newPost, ...prev]);
      // Update hashtag data
      hashtags.forEach(tag => {
        setHashtagData(prev => {
          const existing = prev.find(h => h.tag === tag);
          if (existing) return prev.map(h => h.tag === tag ? { ...h, postsCount: h.postsCount + 1 } : h);
          return [...prev, { tag, postsCount: 1, totalReach: 0, trend: 'stable' }];
        });
      });
    }
    resetComposer();
  };

  const resetComposer = () => {
    setComposerContent('');
    setComposerScheduleDate('');
    setComposerScheduleTime('');
    setComposerMediaType('none');
    setShowComposer(false);
  };

  const deletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      setShowPostDetail(null);
    }
  };

  const editPost = (post) => {
    setIsEditingPost(post.id);
    setComposerContent(post.content);
    setComposerAccountId(post.accountId);
    setComposerMediaType(post.mediaType || 'none');
    if (post.scheduledAt) {
      const d = new Date(post.scheduledAt);
      setComposerScheduleDate(d.toISOString().split('T')[0]);
      setComposerScheduleTime(d.toISOString().split('T')[1].slice(0, 5));
    }
    setShowComposer(true);
  };

  const publishDraft = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'published', createdAt: Date.now() } : p));
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const bgColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const secondaryText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#6366f1';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${borderColor}` }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>SocialHub</h1>
          <p style={{ fontSize: '11px', color: secondaryText, margin: '4px 0 0' }}>Social Media Manager</p>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'overview', icon: '\ud83d\udcca', label: 'Overview' },
            { id: 'posts', icon: '\ud83d\udcdd', label: 'Posts' },
            { id: 'scheduler', icon: '\ud83d\udcc5', label: 'Scheduler' },
            { id: 'analytics', icon: '\ud83d\udcc8', label: 'Analytics' },
            { id: 'accounts', icon: '\ud83d\udc65', label: 'Accounts' },
            { id: 'hashtags', icon: '#\ufe0f\u20e3', label: 'Hashtags' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => switchTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
                marginBottom: '4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                backgroundColor: activeTab === item.id ? (isDarkMode ? '#1e293b' : '#eef2ff') : 'transparent',
                color: activeTab === item.id ? accentColor : textColor, fontWeight: activeTab === item.id ? 600 : 400,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: `1px solid ${borderColor}` }}>
          <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Total Followers</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: accentColor }}>{formatNumber(getTotalFollowers())}</div>
          <div style={{ fontSize: '12px', color: secondaryText, marginTop: '8px' }}>{getScheduledPostsCount()} scheduled posts</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search posts... (Ctrl+K)"
                value={postSearchQuery}
                onChange={(e) => setPostSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, outline: 'none' }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>\ud83d\udd0d</span>
            </div>

            <select
              value={postPlatformFilter}
              onChange={(e) => setPostPlatformFilter(e.target.value)}
              aria-label="Filter by platform"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Platforms</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>

            <select
              value={postStatusFilter}
              onChange={(e) => setPostStatusFilter(e.target.value)}
              aria-label="Filter by status"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowComposer(true)}
              style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              aria-label="Create new post"
            >
              + New Post
            </button>
            <button
              onClick={() => setShowNotificationPanel(true)}
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor, position: 'relative' }}
              aria-label="Open notifications"
            >
              \ud83d\udd14 {getUnreadNotificationsCount() > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getUnreadNotificationsCount()}
                </span>
              )}
            </button>
            <button onClick={toggleTheme} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label="Toggle theme">
              {isDarkMode ? '\u2600\ufe0f' : '\ud83c\udf19'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Dashboard Overview</h2>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Followers', value: formatNumber(getTotalFollowers()), icon: '\ud83d\udc65', color: accentColor },
                  { label: 'Total Engagement', value: formatNumber(getTotalEngagement()), icon: '\u2764\ufe0f', color: '#ef4444' },
                  { label: 'Avg. Engagement Rate', value: `${getAverageEngagementRate()}%`, icon: '\ud83d\udcc8', color: '#22c55e' },
                  { label: 'Total Impressions', value: formatNumber(getTotalImpressions()), icon: '\ud83d\udc41\ufe0f', color: '#f59e0b' },
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

              {/* Best Performing Post */}
              {getBestPerformingPost() && (
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>\ud83c\udfc6 Best Performing Post</h3>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '24px' }}>{PLATFORM_ICONS[getAccount(getBestPerformingPost().accountId)?.platform]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 8px', fontSize: '14px', lineHeight: 1.5 }}>{getBestPerformingPost().content}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: secondaryText }}>
                        <span>\u2764\ufe0f {formatNumber(getBestPerformingPost().likes)}</span>
                        <span>\ud83d\udcac {formatNumber(getBestPerformingPost().comments)}</span>
                        <span>\ud83d\udd01 {formatNumber(getBestPerformingPost().shares)}</span>
                        <span>\ud83d\udc41\ufe0f {formatNumber(getBestPerformingPost().impressions)}</span>
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>{getBestPerformingPost().engagementRate}% engagement</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Breakdown */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ padding: '16px 20px', fontWeight: 600, fontSize: '15px', borderBottom: `1px solid ${borderColor}` }}>Platform Breakdown</div>
                {accounts.map(account => {
                  const accountPosts = posts.filter(p => p.accountId === account.id && p.status === 'published');
                  const totalLikes = accountPosts.reduce((s, p) => s + p.likes, 0);
                  return (
                    <div key={account.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{PLATFORM_ICONS[account.platform]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{account.displayName}</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>{account.handle}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{formatNumber(account.followers)} followers</div>
                        <div style={{ color: secondaryText }}>{accountPosts.length} posts \u00b7 {formatNumber(totalLikes)} likes</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Notifications */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', fontWeight: 600, fontSize: '15px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Recent Notifications</span>
                  <span style={{ fontSize: '12px', color: secondaryText }}>{getUnreadNotificationsCount()} unread</span>
                </div>
                {notifications.slice(0, 4).map(notif => (
                  <div key={notif.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '10px', opacity: notif.read ? 0.6 : 1 }}>
                    <span style={{ fontSize: '14px' }}>
                      {notif.type === 'mention' ? '\ud83d\udce2' : notif.type === 'follower' ? '\ud83d\udc65' : notif.type === 'engagement' ? '\ud83d\udcc8' : notif.type === 'milestone' ? '\ud83c\udfc6' : '\ud83d\udd14'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: notif.read ? 400 : 600 }}>{notif.text}</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>{getTimeAgo(notif.timestamp)}</div>
                    </div>
                    {!notif.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Content Feed</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: secondaryText }}>Sort by:</span>
                  <select
                    value={postSortBy}
                    onChange={(e) => setPostSortBy(e.target.value)}
                    aria-label="Sort posts"
                    style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor, cursor: 'pointer' }}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="engagement">Engagement</option>
                    <option value="impressions">Impressions</option>
                    <option value="likes">Likes</option>
                  </select>
                  <span style={{ fontSize: '13px', color: secondaryText }}>{filteredPosts.length} posts</span>
                </div>
              </div>

              {filteredPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>\ud83d\udcdd</div>
                  <p style={{ fontSize: '16px' }}>No posts match your filters.</p>
                  <button onClick={() => setShowComposer(true)} style={{ padding: '10px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '12px' }}>Create Post</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredPosts.map(post => {
                    const account = getAccount(post.accountId);
                    return (
                      <div key={post.id} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{account?.avatar}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 600, fontSize: '14px' }}>{account?.displayName}</span>
                              <span style={{ fontSize: '12px', color: PLATFORM_COLORS[account?.platform] }}>{PLATFORM_ICONS[account?.platform]} {account?.handle}</span>
                              <span style={{
                                fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 600,
                                backgroundColor: post.status === 'published' ? '#dcfce7' : post.status === 'scheduled' ? '#dbeafe' : '#f3f4f6',
                                color: post.status === 'published' ? '#16a34a' : post.status === 'scheduled' ? '#2563eb' : '#6b7280',
                              }}>
                                {post.status}
                              </span>
                            </div>
                            <p style={{ margin: '0 0 10px', fontSize: '14px', lineHeight: 1.6 }}>{post.content}</p>

                            {post.mediaType && (
                              <div style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px', padding: '20px', textAlign: 'center', marginBottom: '10px', fontSize: '13px', color: secondaryText }}>
                                {post.mediaType === 'image' ? '\ud83d\uddbc\ufe0f Image' : '\ud83c\udfa5 Video'} attached
                              </div>
                            )}

                            {post.hashtags.length > 0 && (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                {post.hashtags.map(tag => (
                                  <span key={tag} style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isDarkMode ? '#334155' : '#e0e7ff', color: accentColor }}>#{tag}</span>
                                ))}
                              </div>
                            )}

                            {post.status === 'published' && (
                              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: secondaryText }}>
                                <span>\u2764\ufe0f {formatNumber(post.likes)}</span>
                                <span>\ud83d\udcac {formatNumber(post.comments)}</span>
                                <span>\ud83d\udd01 {formatNumber(post.shares)}</span>
                                <span>\ud83d\udc41\ufe0f {formatNumber(post.impressions)}</span>
                                <span style={{ color: '#22c55e', fontWeight: 600 }}>{post.engagementRate}%</span>
                              </div>
                            )}

                            {post.status === 'scheduled' && post.scheduledAt && (
                              <div style={{ fontSize: '12px', color: '#2563eb' }}>
                                \ud83d\udcc5 Scheduled for {formatDate(post.scheduledAt)} at {formatTime(post.scheduledAt)}
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                              <span style={{ fontSize: '11px', color: secondaryText }}>{getTimeAgo(post.createdAt)}</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {post.status === 'draft' && (
                                  <button onClick={() => publishDraft(post.id)} style={{ padding: '4px 10px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                                    Publish
                                  </button>
                                )}
                                <button onClick={() => editPost(post)} style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: textColor }}>
                                  Edit
                                </button>
                                <button onClick={() => deletePost(post.id)} style={{ padding: '4px 10px', border: `1px solid #fecaca`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: '#ef4444' }}>
                                  Delete
                                </button>
                                <button onClick={() => setShowPostDetail(post)} style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: textColor }}>
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Scheduler Tab */}
          {activeTab === 'scheduler' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Content Scheduler</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>\ud83d\udcc5 Upcoming Scheduled</h3>
                  {posts.filter(p => p.status === 'scheduled').sort((a, b) => a.scheduledAt - b.scheduledAt).length === 0 ? (
                    <p style={{ color: secondaryText, fontSize: '13px' }}>No scheduled posts. Create one!</p>
                  ) : (
                    posts.filter(p => p.status === 'scheduled').sort((a, b) => a.scheduledAt - b.scheduledAt).map(post => {
                      const account = getAccount(post.accountId);
                      return (
                        <div key={post.id} style={{ padding: '10px 0', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>{PLATFORM_ICONS[account?.platform]}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{post.content.substring(0, 60)}...</div>
                            <div style={{ fontSize: '11px', color: secondaryText }}>{formatDate(post.scheduledAt)} at {formatTime(post.scheduledAt)}</div>
                          </div>
                          <button onClick={() => editPost(post)} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: textColor }}>Edit</button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>\ud83d\udcdd Drafts</h3>
                  {posts.filter(p => p.status === 'draft').length === 0 ? (
                    <p style={{ color: secondaryText, fontSize: '13px' }}>No drafts.</p>
                  ) : (
                    posts.filter(p => p.status === 'draft').map(post => {
                      const account = getAccount(post.accountId);
                      return (
                        <div key={post.id} style={{ padding: '10px 0', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>{PLATFORM_ICONS[account?.platform]}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{post.content.substring(0, 60)}...</div>
                            <div style={{ fontSize: '11px', color: secondaryText }}>Created {formatDate(post.createdAt)}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => publishDraft(post.id)} style={{ padding: '4px 8px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Publish</button>
                            <button onClick={() => editPost(post)} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: textColor }}>Edit</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button onClick={() => setShowComposer(true)} style={{ padding: '12px 24px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                + Schedule New Post
              </button>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Analytics</h2>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['7d', '30d', '90d'].map(range => (
                    <button
                      key={range}
                      onClick={() => setAnalyticsRange(range)}
                      style={{
                        padding: '6px 14px', borderRadius: '6px', border: `1px solid ${borderColor}`, cursor: 'pointer', fontSize: '12px',
                        backgroundColor: analyticsRange === range ? accentColor : 'transparent',
                        color: analyticsRange === range ? '#fff' : textColor,
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analytics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Posts Published', value: posts.filter(p => p.status === 'published').length, icon: '\ud83d\udcdd' },
                  { label: 'Avg Likes/Post', value: Math.round(posts.filter(p => p.status === 'published').reduce((s, p) => s + p.likes, 0) / Math.max(posts.filter(p => p.status === 'published').length, 1)), icon: '\u2764\ufe0f' },
                  { label: 'Avg Comments/Post', value: Math.round(posts.filter(p => p.status === 'published').reduce((s, p) => s + p.comments, 0) / Math.max(posts.filter(p => p.status === 'published').length, 1)), icon: '\ud83d\udcac' },
                ].map(stat => (
                  <div key={stat.label} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{stat.value}</div>
                    <div style={{ fontSize: '13px', color: secondaryText, marginTop: '4px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Per-Account Analytics */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', fontWeight: 600, fontSize: '15px', borderBottom: `1px solid ${borderColor}` }}>Per-Account Performance</div>
                {accounts.map(account => {
                  const accountPosts = posts.filter(p => p.accountId === account.id && p.status === 'published');
                  const totalLikes = accountPosts.reduce((s, p) => s + p.likes, 0);
                  const totalImpressions = accountPosts.reduce((s, p) => s + p.impressions, 0);
                  const avgEngagement = accountPosts.length > 0
                    ? Math.round(accountPosts.reduce((s, p) => s + p.engagementRate, 0) / accountPosts.length * 10) / 10
                    : 0;
                  return (
                    <div key={account.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{PLATFORM_ICONS[account.platform]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{account.displayName}</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>{account.handle}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{accountPosts.length}</div>
                          <div style={{ color: secondaryText }}>Posts</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{formatNumber(totalLikes)}</div>
                          <div style={{ color: secondaryText }}>Likes</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{formatNumber(totalImpressions)}</div>
                          <div style={{ color: secondaryText }}>Impressions</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#22c55e' }}>{avgEngagement}%</div>
                          <div style={{ color: secondaryText }}>Eng. Rate</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && !showAccountDetail && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Connected Accounts</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {accounts.map(account => (
                  <div
                    key={account.id}
                    onClick={() => setShowAccountDetail(account)}
                    style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '36px' }}>{account.avatar}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {account.displayName}
                          {account.verified && <span style={{ color: '#1DA1F2', fontSize: '14px' }}>\u2713</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: PLATFORM_COLORS[account.platform] }}>{PLATFORM_ICONS[account.platform]} {account.handle}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '12px', borderTop: `1px solid ${borderColor}`, fontSize: '12px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{formatNumber(account.followers)}</div>
                        <div style={{ color: secondaryText }}>Followers</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{formatNumber(account.following)}</div>
                        <div style={{ color: secondaryText }}>Following</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{posts.filter(p => p.accountId === account.id).length}</div>
                        <div style={{ color: secondaryText }}>Posts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Detail */}
          {activeTab === 'accounts' && showAccountDetail && (
            <div>
              <button onClick={() => setShowAccountDetail(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: accentColor, fontSize: '13px', marginBottom: '16px' }}>
                \u2190 Back to Accounts
              </button>

              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '48px' }}>{showAccountDetail.avatar}</span>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {showAccountDetail.displayName}
                      {showAccountDetail.verified && <span style={{ color: '#1DA1F2' }}>\u2713</span>}
                    </div>
                    <div style={{ fontSize: '14px', color: PLATFORM_COLORS[showAccountDetail.platform] }}>{PLATFORM_ICONS[showAccountDetail.platform]} {showAccountDetail.handle}</div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '13px', color: secondaryText }}>
                      <span><strong style={{ color: textColor }}>{formatNumber(showAccountDetail.followers)}</strong> followers</span>
                      <span><strong style={{ color: textColor }}>{formatNumber(showAccountDetail.following)}</strong> following</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Posts from {showAccountDetail.displayName}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {posts.filter(p => p.accountId === showAccountDetail.id).sort((a, b) => b.createdAt - a.createdAt).map(post => (
                  <div key={post.id} style={{ backgroundColor: cardBg, borderRadius: '8px', border: `1px solid ${borderColor}`, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '6px', fontWeight: 600,
                        backgroundColor: post.status === 'published' ? '#dcfce7' : post.status === 'scheduled' ? '#dbeafe' : '#f3f4f6',
                        color: post.status === 'published' ? '#16a34a' : post.status === 'scheduled' ? '#2563eb' : '#6b7280',
                      }}>
                        {post.status}
                      </span>
                      <span style={{ fontSize: '11px', color: secondaryText }}>{formatDate(post.createdAt)}</span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', lineHeight: 1.5 }}>{post.content}</p>
                    {post.status === 'published' && (
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: secondaryText }}>
                        <span>\u2764\ufe0f {formatNumber(post.likes)}</span>
                        <span>\ud83d\udcac {formatNumber(post.comments)}</span>
                        <span>\ud83d\udd01 {formatNumber(post.shares)}</span>
                        <span>{post.engagementRate}% eng.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags Tab */}
          {activeTab === 'hashtags' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Hashtag Performance</h2>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: `1px solid ${borderColor}`, fontSize: '12px', color: secondaryText, fontWeight: 600, textTransform: 'uppercase' }}>
                  <span>Hashtag</span>
                  <span>Posts</span>
                  <span>Total Reach</span>
                  <span>Trend</span>
                </div>
                {hashtagData.sort((a, b) => b.totalReach - a.totalReach).map(ht => (
                  <div key={ht.tag} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: `1px solid ${borderColor}`, alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500, color: accentColor }}>#{ht.tag}</span>
                    <span>{ht.postsCount}</span>
                    <span>{formatNumber(ht.totalReach)}</span>
                    <span style={{ color: ht.trend === 'up' ? '#22c55e' : ht.trend === 'down' ? '#ef4444' : secondaryText }}>
                      {ht.trend === 'up' ? '\u2191 Trending' : ht.trend === 'down' ? '\u2193 Declining' : '\u2194 Stable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={resetComposer}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '550px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{isEditingPost ? 'Edit Post' : 'Create New Post'}</h2>
              <button onClick={resetComposer} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>\u00d7</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '6px' }}>Account</label>
              <select
                value={composerAccountId}
                onChange={(e) => setComposerAccountId(e.target.value)}
                aria-label="Select account"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{PLATFORM_ICONS[a.platform]} {a.displayName} ({a.handle})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '6px' }}>Content</label>
              <textarea
                value={composerContent}
                onChange={(e) => setComposerContent(e.target.value)}
                placeholder="What do you want to share? Use #hashtags to categorize..."
                rows={5}
                style={{ width: '100%', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: secondaryText, marginTop: '4px' }}>
                {composerContent.length} characters
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '6px' }}>Media</label>
              <select
                value={composerMediaType}
                onChange={(e) => setComposerMediaType(e.target.value)}
                aria-label="Select media type"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
              >
                <option value="none">No media</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '6px' }}>Schedule Date (optional)</label>
                <input
                  type="date"
                  value={composerScheduleDate}
                  onChange={(e) => setComposerScheduleDate(e.target.value)}
                  aria-label="Schedule date"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '6px' }}>Schedule Time</label>
                <input
                  type="time"
                  value={composerScheduleTime}
                  onChange={(e) => setComposerScheduleTime(e.target.value)}
                  aria-label="Schedule time"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={resetComposer} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button
                onClick={createPost}
                style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                {isEditingPost ? 'Save Changes' : (composerScheduleDate ? 'Schedule Post' : 'Publish Now')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {showPostDetail && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowPostDetail(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '550px', padding: '24px', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Post Details</h2>
              <button onClick={() => setShowPostDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>\u00d7</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getAccount(showPostDetail.accountId)?.avatar}</span>
                <span style={{ fontWeight: 600 }}>{getAccount(showPostDetail.accountId)?.displayName}</span>
                <span style={{ fontSize: '12px', color: PLATFORM_COLORS[getAccount(showPostDetail.accountId)?.platform] }}>{getAccount(showPostDetail.accountId)?.handle}</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, margin: '0 0 12px' }}>{showPostDetail.content}</p>
            </div>

            {showPostDetail.status === 'published' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  { label: 'Likes', value: showPostDetail.likes, icon: '\u2764\ufe0f' },
                  { label: 'Comments', value: showPostDetail.comments, icon: '\ud83d\udcac' },
                  { label: 'Shares', value: showPostDetail.shares, icon: '\ud83d\udd01' },
                  { label: 'Impressions', value: showPostDetail.impressions, icon: '\ud83d\udc41\ufe0f' },
                  { label: 'Engagement', value: `${showPostDetail.engagementRate}%`, icon: '\ud83d\udcc8' },
                  { label: 'Published', value: formatDate(showPostDetail.createdAt), icon: '\ud83d\udcc5' },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>{stat.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}</div>
                    <div style={{ fontSize: '11px', color: secondaryText }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {showPostDetail.hashtags.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Hashtags</div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {showPostDetail.hashtags.map(tag => (
                    <span key={tag} style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', backgroundColor: isDarkMode ? '#334155' : '#e0e7ff', color: accentColor }}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
              <button onClick={() => { editPost(showPostDetail); setShowPostDetail(null); }} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Edit
              </button>
              <button onClick={() => deletePost(showPostDetail.id)} style={{ padding: '8px 16px', border: `1px solid #fecaca`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444', fontSize: '13px' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 2000 }} onClick={() => setShowNotificationPanel(false)}>
          <div style={{ backgroundColor: cardBg, width: '400px', height: '100%', padding: '24px', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Notifications</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={markAllNotificationsRead} style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: textColor }}>
                  Mark all read
                </button>
                <button onClick={() => setShowNotificationPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>\u00d7</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['all', 'unread', 'mention', 'follower', 'engagement', 'milestone'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setNotificationFilter(filter)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', border: `1px solid ${borderColor}`, cursor: 'pointer', fontSize: '11px',
                    backgroundColor: notificationFilter === filter ? accentColor : 'transparent',
                    color: notificationFilter === filter ? '#fff' : textColor,
                  }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {filteredNotifications.length === 0 ? (
              <p style={{ color: secondaryText, fontSize: '13px', textAlign: 'center', padding: '20px' }}>No notifications.</p>
            ) : (
              filteredNotifications.sort((a, b) => b.timestamp - a.timestamp).map(notif => (
                <div key={notif.id} style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}`, opacity: notif.read ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                      {notif.type === 'mention' ? '\ud83d\udce2' : notif.type === 'follower' ? '\ud83d\udc65' : notif.type === 'engagement' ? '\ud83d\udcc8' : notif.type === 'milestone' ? '\ud83c\udfc6' : '\ud83d\udd14'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: notif.read ? 400 : 600, marginBottom: '4px' }}>{notif.text}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: secondaryText }}>
                        <span>{PLATFORM_ICONS[getAccount(notif.accountId)?.platform]} {getAccount(notif.accountId)?.handle}</span>
                        <span>\u00b7</span>
                        <span>{getTimeAgo(notif.timestamp)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {!notif.read && (
                        <button onClick={() => markNotificationRead(notif.id)} style={{ padding: '2px 6px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '10px', backgroundColor: 'transparent', color: textColor }}>
                          Read
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif.id)} style={{ padding: '2px 6px', border: `1px solid #fecaca`, borderRadius: '4px', cursor: 'pointer', fontSize: '10px', backgroundColor: 'transparent', color: '#ef4444' }}>
                        \u00d7
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
