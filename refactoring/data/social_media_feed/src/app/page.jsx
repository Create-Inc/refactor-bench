import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const MOCK_USERS = [
  { id: 'u1', name: 'Alice Chen', handle: '@alicechen', avatar: '👩‍💻', bio: 'Full-stack developer & open source enthusiast', followers: 1250, following: 340, verified: true },
  { id: 'u2', name: 'Bob Martinez', handle: '@bobmartinez', avatar: '👨‍🎨', bio: 'Digital artist and UI designer', followers: 890, following: 210, verified: false },
  { id: 'u3', name: 'Carol Davis', handle: '@caroldavis', avatar: '👩‍🔬', bio: 'Data scientist | ML researcher | Coffee lover', followers: 2100, following: 450, verified: true },
  { id: 'u4', name: 'Dave Wilson', handle: '@davewilson', avatar: '👨‍🍳', bio: 'Home chef sharing recipes from around the world', followers: 670, following: 180, verified: false },
  { id: 'u5', name: 'Eva Thompson', handle: '@evathompson', avatar: '👩‍🚀', bio: 'Space enthusiast and science communicator', followers: 3400, following: 520, verified: true },
];

const CURRENT_USER = { id: 'me', name: 'Current User', handle: '@currentuser', avatar: '🧑', bio: 'Welcome to my profile!', followers: 150, following: 75, verified: false };

const INITIAL_POSTS = [
  {
    id: 'p1', authorId: 'u1', content: 'Just shipped a major refactor of our component library! 🚀 Reduced bundle size by 40% and improved tree-shaking. Thread below...', timestamp: Date.now() - 3600000, likes: 42, shares: 12, media: null, tags: ['webdev', 'react', 'performance'],
    comments: [
      { id: 'cm1', authorId: 'u3', content: 'This is amazing! What bundler are you using?', timestamp: Date.now() - 3000000, likes: 5 },
      { id: 'cm2', authorId: 'u1', content: 'We switched to Rollup with custom plugins. Happy to share the config!', timestamp: Date.now() - 2800000, likes: 8 },
    ],
  },
  {
    id: 'p2', authorId: 'u2', content: 'New design system exploration — playing with glassmorphism effects combined with organic shapes 🎨✨', timestamp: Date.now() - 7200000, likes: 87, shares: 23, media: '🖼️ [Design Preview]', tags: ['design', 'ui', 'glassmorphism'],
    comments: [
      { id: 'cm3', authorId: 'u4', content: 'Love the color palette!', timestamp: Date.now() - 6000000, likes: 3 },
    ],
  },
  {
    id: 'p3', authorId: 'u3', content: 'Published my research paper on transformer attention patterns in low-resource languages. Link in bio! 📝', timestamp: Date.now() - 14400000, likes: 156, shares: 67, media: null, tags: ['ml', 'nlp', 'research'],
    comments: [],
  },
  {
    id: 'p4', authorId: 'u4', content: 'Made homemade ramen from scratch today — 12 hour bone broth, hand-pulled noodles, and chashu pork. Recipe in the thread! 🍜', timestamp: Date.now() - 21600000, likes: 234, shares: 89, media: '📸 [Food Photo]', tags: ['cooking', 'ramen', 'homemade'],
    comments: [
      { id: 'cm4', authorId: 'u5', content: 'This looks incredible! Saving this recipe', timestamp: Date.now() - 20000000, likes: 12 },
      { id: 'cm5', authorId: 'u2', content: 'The presentation is chef\'s kiss 👨‍🍳', timestamp: Date.now() - 19000000, likes: 7 },
      { id: 'cm6', authorId: 'u1', content: 'I need to try this! How long does the broth take?', timestamp: Date.now() - 18000000, likes: 2 },
    ],
  },
  {
    id: 'p5', authorId: 'u5', content: 'The James Webb Space Telescope just captured a stunning image of a protoplanetary disk around a young star 150 light-years away! 🌌', timestamp: Date.now() - 43200000, likes: 445, shares: 201, media: '🔭 [Space Image]', tags: ['space', 'jwst', 'astronomy'],
    comments: [
      { id: 'cm7', authorId: 'u3', content: 'The detail in these images never ceases to amaze me', timestamp: Date.now() - 40000000, likes: 15 },
    ],
  },
  {
    id: 'p6', authorId: 'u1', content: 'Hot take: CSS-in-JS is dead, long live CSS Modules + Tailwind. Fight me 😤', timestamp: Date.now() - 86400000, likes: 78, shares: 34, media: null, tags: ['webdev', 'css', 'hottake'],
    comments: [
      { id: 'cm8', authorId: 'u2', content: 'As a designer, I actually agree. Separation of concerns matters!', timestamp: Date.now() - 80000000, likes: 9 },
      { id: 'cm9', authorId: 'u3', content: 'Counter-point: styled-components has great DX for dynamic styles', timestamp: Date.now() - 78000000, likes: 6 },
    ],
  },
  {
    id: 'p7', authorId: 'u2', content: 'Just redesigned the onboarding flow for our app — went from 5 steps to 2. Conversion up 35%! 📈', timestamp: Date.now() - 100000000, likes: 167, shares: 45, media: '🖼️ [Before/After]', tags: ['design', 'ux', 'conversion'],
    comments: [],
  },
  {
    id: 'p8', authorId: 'u4', content: 'Tip: always rest your steak for at least 5 minutes after cooking. The juices redistribute and it makes a HUGE difference 🥩', timestamp: Date.now() - 150000000, likes: 312, shares: 156, media: null, tags: ['cooking', 'tips', 'steak'],
    comments: [
      { id: 'cm10', authorId: 'u5', content: 'Game changer! I used to cut right away', timestamp: Date.now() - 140000000, likes: 4 },
    ],
  },
];

const INITIAL_STORIES = [
  { id: 's1', authorId: 'u1', content: '🎉 Feature launched!', timestamp: Date.now() - 1800000, viewed: false, emoji: '🎉' },
  { id: 's2', authorId: 'u3', content: '📊 New data viz', timestamp: Date.now() - 5400000, viewed: false, emoji: '📊' },
  { id: 's3', authorId: 'u5', content: '🌌 Aurora tonight!', timestamp: Date.now() - 7200000, viewed: false, emoji: '🌌' },
  { id: 's4', authorId: 'u2', content: '🎨 WIP designs', timestamp: Date.now() - 10800000, viewed: true, emoji: '🎨' },
  { id: 's5', authorId: 'u4', content: '🍕 Pizza night!', timestamp: Date.now() - 14400000, viewed: true, emoji: '🍕' },
];

const TRENDING_TOPICS = [
  { tag: 'webdev', postCount: 12400 },
  { tag: 'react', postCount: 8900 },
  { tag: 'design', postCount: 7200 },
  { tag: 'ml', postCount: 6800 },
  { tag: 'cooking', postCount: 5100 },
  { tag: 'space', postCount: 4300 },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'like', actorId: 'u3', targetPostId: 'p1', read: false, timestamp: Date.now() - 600000 },
  { id: 'n2', type: 'comment', actorId: 'u2', targetPostId: 'p1', content: 'Great refactoring tips!', read: false, timestamp: Date.now() - 1200000 },
  { id: 'n3', type: 'follow', actorId: 'u5', read: false, timestamp: Date.now() - 3600000 },
  { id: 'n4', type: 'share', actorId: 'u4', targetPostId: 'p1', read: true, timestamp: Date.now() - 7200000 },
  { id: 'n5', type: 'like', actorId: 'u1', targetPostId: 'p1', read: true, timestamp: Date.now() - 14400000 },
  { id: 'n6', type: 'mention', actorId: 'u3', targetPostId: 'p3', content: 'Check out this paper!', read: true, timestamp: Date.now() - 28800000 },
];

const INITIAL_CONVERSATIONS = [
  {
    id: 'conv1', participantId: 'u1', lastMessage: 'Sure, I\'ll send over the config!', lastTimestamp: Date.now() - 900000, unread: 2,
    messages: [
      { id: 'msg1', senderId: 'me', content: 'Hey, can you share your Rollup config?', timestamp: Date.now() - 1800000 },
      { id: 'msg2', senderId: 'u1', content: 'Of course! Give me a few minutes', timestamp: Date.now() - 1200000 },
      { id: 'msg3', senderId: 'u1', content: 'Sure, I\'ll send over the config!', timestamp: Date.now() - 900000 },
    ],
  },
  {
    id: 'conv2', participantId: 'u3', lastMessage: 'The paper is really interesting!', lastTimestamp: Date.now() - 7200000, unread: 0,
    messages: [
      { id: 'msg4', senderId: 'u3', content: 'Thanks for reading my paper!', timestamp: Date.now() - 10800000 },
      { id: 'msg5', senderId: 'me', content: 'The paper is really interesting!', timestamp: Date.now() - 7200000 },
    ],
  },
  {
    id: 'conv3', participantId: 'u4', lastMessage: 'Thanks! Recipe is in the post now', lastTimestamp: Date.now() - 43200000, unread: 1,
    messages: [
      { id: 'msg6', senderId: 'me', content: 'That ramen looked amazing!', timestamp: Date.now() - 50000000 },
      { id: 'msg7', senderId: 'u4', content: 'Thanks! Recipe is in the post now', timestamp: Date.now() - 43200000 },
    ],
  },
];

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function SocialMediaFeed() {
  const [activeView, setActiveView] = useState('feed');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [followedUsers, setFollowedUsers] = useState(['u1', 'u3']);
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedComments, setLikedComments] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [theme, setTheme] = useState('light');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTargetPost, setShareTargetPost] = useState(null);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [mutedUsers, setMutedUsers] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetPost, setReportTargetPost] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    showNotificationBadges: true,
    compactMode: false,
    autoPlayStories: false,
    showReadReceipts: true,
  });
  const [postViews, setPostViews] = useState({});
  const [repostHistory, setRepostHistory] = useState([]);

  const feedRef = useRef(null);
  const messageEndRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('socialFeedTheme');
    if (savedTheme) setTheme(savedTheme);
    const savedBookmarks = localStorage.getItem('socialFeedBookmarks');
    if (savedBookmarks) setBookmarkedPosts(JSON.parse(savedBookmarks));
    const savedFollows = localStorage.getItem('socialFeedFollows');
    if (savedFollows) setFollowedUsers(JSON.parse(savedFollows));
  }, []);

  useEffect(() => {
    localStorage.setItem('socialFeedTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('socialFeedBookmarks', JSON.stringify(bookmarkedPosts));
  }, [bookmarkedPosts]);

  useEffect(() => {
    localStorage.setItem('socialFeedFollows', JSON.stringify(followedUsers));
  }, [followedUsers]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation, conversations]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedPost(null);
        setSelectedProfile(null);
        setActiveStory(null);
        setShowShareModal(false);
        setShowComposer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getUserById = useCallback((id) => {
    if (id === 'me') return CURRENT_USER;
    return MOCK_USERS.find((u) => u.id === id);
  }, []);

  const unreadNotificationCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const unreadMessageCount = useMemo(() => conversations.reduce((sum, c) => sum + c.unread, 0), [conversations]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (feedFilter === 'following') {
      result = result.filter((p) => followedUsers.includes(p.authorId));
    } else if (feedFilter === 'popular') {
      result = result.filter((p) => p.likes > 100);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (searchFilter === 'all' || searchFilter === 'posts') {
        result = result.filter(
          (p) =>
            p.content.toLowerCase().includes(query) ||
            p.tags.some((t) => t.toLowerCase().includes(query))
        );
      }
    }
    if (sortBy === 'recent') {
      result.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'discussed') {
      result.sort((a, b) => b.comments.length - a.comments.length);
    }
    return result;
  }, [posts, feedFilter, searchQuery, searchFilter, sortBy, followedUsers]);

  const filteredNotifications = useMemo(() => {
    if (notificationFilter === 'all') return notifications;
    if (notificationFilter === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === notificationFilter);
  }, [notifications, notificationFilter]);

  const searchedUsers = useMemo(() => {
    if (!searchQuery.trim() || (searchFilter !== 'all' && searchFilter !== 'people')) return [];
    const query = searchQuery.toLowerCase();
    return MOCK_USERS.filter(
      (u) => u.name.toLowerCase().includes(query) || u.handle.toLowerCase().includes(query)
    );
  }, [searchQuery, searchFilter]);

  const handleToggleFollow = useCallback((userId) => {
    setFollowedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleLikePost = useCallback((postId) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: likedPosts.includes(postId) ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, [likedPosts]);

  const handleLikeComment = useCallback((commentId) => {
    setLikedComments((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );
    setPosts((prev) =>
      prev.map((p) => ({
        ...p,
        comments: p.comments.map((c) =>
          c.id === commentId
            ? { ...c, likes: likedComments.includes(commentId) ? c.likes - 1 : c.likes + 1 }
            : c
        ),
      }))
    );
  }, [likedComments]);

  const handleBookmarkPost = useCallback((postId) => {
    setBookmarkedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  }, []);

  const handleSharePost = useCallback((postId) => {
    setShareTargetPost(postId);
    setShowShareModal(true);
  }, []);

  const handleConfirmShare = useCallback(() => {
    if (shareTargetPost) {
      setPosts((prev) =>
        prev.map((p) => (p.id === shareTargetPost ? { ...p, shares: p.shares + 1 } : p))
      );
      setShowShareModal(false);
      setShareTargetPost(null);
    }
  }, [shareTargetPost]);

  const handleCreatePost = useCallback(() => {
    if (!newPostContent.trim()) return;
    const tags = newPostTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const newPost = {
      id: `p${Date.now()}`,
      authorId: 'me',
      content: newPostContent,
      timestamp: Date.now(),
      likes: 0,
      shares: 0,
      media: null,
      tags,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent('');
    setNewPostTags('');
    setShowComposer(false);
  }, [newPostContent, newPostTags]);

  const handleAddComment = useCallback((postId) => {
    if (!newCommentContent.trim()) return;
    const newComment = {
      id: `cm${Date.now()}`,
      authorId: 'me',
      content: newCommentContent,
      timestamp: Date.now(),
      likes: 0,
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
    setNewCommentContent('');
  }, [newCommentContent]);

  const handleDeletePost = useCallback((postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelectedPost(null);
    }
  }, []);

  const handleDeleteComment = useCallback((postId, commentId) => {
    if (window.confirm('Delete this comment?')) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
            : p
        )
      );
    }
  }, []);

  const handleSendMessage = useCallback((conversationId) => {
    if (!newMessageContent.trim()) return;
    const newMsg = {
      id: `msg${Date.now()}`,
      senderId: 'me',
      content: newMessageContent,
      timestamp: Date.now(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMessageContent, lastTimestamp: Date.now() }
          : c
      )
    );
    setNewMessageContent('');
  }, [newMessageContent]);

  const handleMarkNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleMarkConversationRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
    );
  }, []);

  const handleViewStory = useCallback((storyId) => {
    setActiveStory(storyId);
    setStories((prev) => prev.map((s) => (s.id === storyId ? { ...s, viewed: true } : s)));
  }, []);

  const handleEditPost = useCallback((postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post && post.authorId === 'me') {
      setEditingPost(postId);
      setEditPostContent(post.content);
    }
  }, [posts]);

  const handleSaveEditPost = useCallback(() => {
    if (!editPostContent.trim() || !editingPost) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === editingPost
          ? { ...p, content: editPostContent, edited: true }
          : p
      )
    );
    setEditingPost(null);
    setEditPostContent('');
  }, [editingPost, editPostContent]);

  const handleCancelEditPost = useCallback(() => {
    setEditingPost(null);
    setEditPostContent('');
  }, []);

  const handleMuteUser = useCallback((userId) => {
    setMutedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleReportPost = useCallback((postId) => {
    setReportTargetPost(postId);
    setShowReportModal(true);
  }, []);

  const handleSubmitReport = useCallback(() => {
    if (reportTargetPost && reportReason.trim()) {
      setReportedPosts((prev) => [...prev, { postId: reportTargetPost, reason: reportReason, timestamp: Date.now() }]);
      setShowReportModal(false);
      setReportTargetPost(null);
      setReportReason('');
    }
  }, [reportTargetPost, reportReason]);

  const handlePinPost = useCallback((postId) => {
    setPinnedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  }, []);

  const handleUpdateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleTrackPostView = useCallback((postId) => {
    setPostViews((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  }, []);

  const handleRepost = useCallback((postId) => {
    const originalPost = posts.find((p) => p.id === postId);
    if (!originalPost) return;
    const repost = {
      id: `rp${Date.now()}`,
      authorId: 'me',
      content: originalPost.content,
      timestamp: Date.now(),
      likes: 0,
      shares: 0,
      media: originalPost.media,
      tags: originalPost.tags,
      comments: [],
      repostOf: postId,
      originalAuthorId: originalPost.authorId,
    };
    setPosts((prev) => [repost, ...prev]);
    setRepostHistory((prev) => [...prev, { postId, timestamp: Date.now() }]);
  }, [posts]);

  const displayedPosts = useMemo(() => {
    let result = filteredPosts;
    if (mutedUsers.length > 0) {
      result = result.filter((p) => !mutedUsers.includes(p.authorId));
    }
    const pinned = result.filter((p) => pinnedPosts.includes(p.id));
    const unpinned = result.filter((p) => !pinnedPosts.includes(p.id));
    return [...pinned, ...unpinned];
  }, [filteredPosts, mutedUsers, pinnedPosts]);

  const userStats = useMemo(() => {
    const myPosts = posts.filter((p) => p.authorId === 'me');
    const totalLikes = myPosts.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = myPosts.reduce((sum, p) => sum + p.comments.length, 0);
    const totalShares = myPosts.reduce((sum, p) => sum + p.shares, 0);
    return { postCount: myPosts.length, totalLikes, totalComments, totalShares };
  }, [posts]);

  const themeStyles = theme === 'dark'
    ? { bg: '#1a1a2e', cardBg: '#16213e', text: '#e0e0e0', textSecondary: '#a0a0a0', border: '#2a2a4a', accent: '#4f8cff', hover: '#1e2a4a' }
    : { bg: '#f0f2f5', cardBg: '#ffffff', text: '#1a1a1a', textSecondary: '#65676b', border: '#dddfe2', accent: '#1877f2', hover: '#f5f5f5' };

  const renderStories = () => (
    <div data-testid="stories-bar" style={{ display: 'flex', gap: '12px', padding: '16px', background: themeStyles.cardBg, borderRadius: '12px', marginBottom: '16px', overflowX: 'auto', border: `1px solid ${themeStyles.border}` }}>
      {stories.map((story) => {
        const author = getUserById(story.authorId);
        return (
          <button key={story.id} data-testid={`story-${story.id}`} onClick={() => handleViewStory(story.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: 'none', background: 'none', cursor: 'pointer', minWidth: '72px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `3px solid ${story.viewed ? themeStyles.textSecondary : themeStyles.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: themeStyles.bg }}>
              {author?.avatar}
            </div>
            <span style={{ fontSize: '11px', color: themeStyles.textSecondary, maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{author?.name?.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );

  const renderStoryViewer = () => {
    if (!activeStory) return null;
    const story = stories.find((s) => s.id === activeStory);
    if (!story) return null;
    const author = getUserById(story.authorId);
    const storyIndex = stories.findIndex((s) => s.id === activeStory);

    return (
      <div data-testid="story-viewer" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setActiveStory(null)}>
        <div style={{ background: themeStyles.cardBg, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '32px' }}>{author?.avatar}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', color: themeStyles.text }}>{author?.name}</div>
              <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>{formatTimeAgo(story.timestamp)}</div>
            </div>
            <button data-testid="close-story" onClick={() => setActiveStory(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: themeStyles.text }}>✕</button>
          </div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{story.emoji}</div>
          <div style={{ fontSize: '18px', color: themeStyles.text }}>{story.content}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <button data-testid="prev-story" disabled={storyIndex === 0} onClick={() => { if (storyIndex > 0) handleViewStory(stories[storyIndex - 1].id); }} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, cursor: storyIndex === 0 ? 'not-allowed' : 'pointer', opacity: storyIndex === 0 ? 0.5 : 1 }}>← Previous</button>
            <button data-testid="next-story" disabled={storyIndex === stories.length - 1} onClick={() => { if (storyIndex < stories.length - 1) handleViewStory(stories[storyIndex + 1].id); }} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, cursor: storyIndex === stories.length - 1 ? 'not-allowed' : 'pointer', opacity: storyIndex === stories.length - 1 ? 0.5 : 1 }}>Next →</button>
          </div>
        </div>
      </div>
    );
  };

  const renderPostCard = (post) => {
    const author = getUserById(post.authorId);
    const isLiked = likedPosts.includes(post.id);
    const isBookmarked = bookmarkedPosts.includes(post.id);
    const isPinned = pinnedPosts.includes(post.id);
    const isEditing = editingPost === post.id;
    const viewCount = postViews[post.id] || 0;

    return (
      <div key={post.id} data-testid={`post-${post.id}`} style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: settings.compactMode ? '10px' : '16px', marginBottom: settings.compactMode ? '8px' : '12px', border: `1px solid ${isPinned ? themeStyles.accent : themeStyles.border}` }}>
        {isPinned && (
          <div data-testid={`pinned-badge-${post.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', fontSize: '12px', color: themeStyles.accent }}>📌 Pinned post</div>
        )}
        {post.repostOf && (
          <div data-testid={`repost-badge-${post.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', fontSize: '12px', color: themeStyles.textSecondary }}>🔄 Reposted from {getUserById(post.originalAuthorId)?.name}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <button data-testid={`post-author-${post.id}`} onClick={() => setSelectedProfile(post.authorId)} style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer' }}>{author?.avatar}</button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button data-testid={`post-author-name-${post.id}`} onClick={() => setSelectedProfile(post.authorId)} style={{ fontWeight: 'bold', color: themeStyles.text, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}>{author?.name}</button>
              {author?.verified && <span title="Verified" style={{ color: themeStyles.accent }}>✓</span>}
              {post.edited && <span data-testid={`edited-badge-${post.id}`} style={{ fontSize: '11px', color: themeStyles.textSecondary }}>(edited)</span>}
            </div>
            <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>{author?.handle} · {formatTimeAgo(post.timestamp)}{viewCount > 0 ? ` · ${formatNumber(viewCount)} views` : ''}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            {post.authorId === 'me' && (
              <>
                <button data-testid={`edit-post-${post.id}`} onClick={() => handleEditPost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: themeStyles.textSecondary }}>✏️</button>
                <button data-testid={`pin-post-${post.id}`} onClick={() => handlePinPost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: isPinned ? themeStyles.accent : themeStyles.textSecondary }}>📌</button>
                <button data-testid={`delete-post-${post.id}`} onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
              </>
            )}
            {post.authorId !== 'me' && (
              <>
                <button data-testid={`mute-user-${post.authorId}`} onClick={() => handleMuteUser(post.authorId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: themeStyles.textSecondary }} title={mutedUsers.includes(post.authorId) ? 'Unmute' : 'Mute'}>{mutedUsers.includes(post.authorId) ? '🔊' : '🔇'}</button>
                <button data-testid={`report-post-${post.id}`} onClick={() => handleReportPost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: themeStyles.textSecondary }}>⚠️</button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div data-testid={`edit-form-${post.id}`} style={{ marginBottom: '12px' }}>
            <textarea data-testid={`edit-content-${post.id}`} value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <button data-testid={`cancel-edit-${post.id}`} onClick={handleCancelEditPost} style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button data-testid={`save-edit-${post.id}`} onClick={handleSaveEditPost} style={{ padding: '6px 14px', borderRadius: '8px', background: themeStyles.accent, color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Save</button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '12px', color: themeStyles.text, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{post.content}</div>
        )}

        {post.media && (
          <div data-testid={`post-media-${post.id}`} style={{ background: themeStyles.bg, borderRadius: '8px', padding: '40px', textAlign: 'center', marginBottom: '12px', fontSize: '24px', border: `1px solid ${themeStyles.border}` }}>{post.media}</div>
        )}

        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {post.tags.map((tag) => (
              <span key={tag} data-testid={`tag-${tag}`} onClick={() => { setSearchQuery(tag); setActiveView('feed'); }} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: `${themeStyles.accent}20`, color: themeStyles.accent, cursor: 'pointer' }}>#{tag}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px', borderTop: `1px solid ${themeStyles.border}` }}>
          <button data-testid={`like-post-${post.id}`} onClick={() => handleLikePost(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? '#e74c3c' : themeStyles.textSecondary, fontSize: '14px' }}>
            {isLiked ? '❤️' : '🤍'} {formatNumber(post.likes)}
          </button>
          <button data-testid={`comment-btn-${post.id}`} onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: themeStyles.textSecondary, fontSize: '14px' }}>
            💬 {post.comments.length}
          </button>
          <button data-testid={`share-post-${post.id}`} onClick={() => handleSharePost(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: themeStyles.textSecondary, fontSize: '14px' }}>
            🔗 {formatNumber(post.shares)}
          </button>
          {post.authorId !== 'me' && (
            <button data-testid={`repost-btn-${post.id}`} onClick={() => handleRepost(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: themeStyles.textSecondary, fontSize: '14px' }}>
              🔄 Repost
            </button>
          )}
          <button data-testid={`bookmark-post-${post.id}`} onClick={() => handleBookmarkPost(post.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? '#f39c12' : themeStyles.textSecondary, fontSize: '14px' }}>
            {isBookmarked ? '⭐' : '☆'}
          </button>
        </div>

        {selectedPost === post.id && (
          <div data-testid={`comments-section-${post.id}`} style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${themeStyles.border}` }}>
            {post.comments.map((comment) => {
              const commentAuthor = getUserById(comment.authorId);
              const isCommentLiked = likedComments.includes(comment.id);
              return (
                <div key={comment.id} data-testid={`comment-${comment.id}`} style={{ display: 'flex', gap: '8px', marginBottom: '10px', padding: '8px', borderRadius: '8px', background: themeStyles.bg }}>
                  <span style={{ fontSize: '20px' }}>{commentAuthor?.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: themeStyles.text }}>{commentAuthor?.name}</span>
                      <span style={{ fontSize: '11px', color: themeStyles.textSecondary }}>{formatTimeAgo(comment.timestamp)}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: themeStyles.text, marginTop: '2px' }}>{comment.content}</div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <button data-testid={`like-comment-${comment.id}`} onClick={() => handleLikeComment(comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: isCommentLiked ? '#e74c3c' : themeStyles.textSecondary }}>
                        {isCommentLiked ? '❤️' : '🤍'} {comment.likes}
                      </button>
                      {comment.authorId === 'me' && (
                        <button data-testid={`delete-comment-${comment.id}`} onClick={() => handleDeleteComment(post.id, comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#e74c3c' }}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input data-testid={`comment-input-${post.id}`} value={newCommentContent} onChange={(e) => setNewCommentContent(e.target.value)} placeholder="Write a comment..." onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }} style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, fontSize: '13px' }} />
              <button data-testid={`submit-comment-${post.id}`} onClick={() => handleAddComment(post.id)} style={{ padding: '8px 16px', borderRadius: '20px', background: themeStyles.accent, color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Post</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderComposer = () => (
    showComposer && (
      <div data-testid="post-composer" style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '16px', marginBottom: '16px', border: `1px solid ${themeStyles.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px' }}>{CURRENT_USER.avatar}</span>
          <span style={{ fontWeight: 'bold', color: themeStyles.text }}>{CURRENT_USER.name}</span>
          <button data-testid="close-composer" onClick={() => setShowComposer(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: themeStyles.textSecondary }}>✕</button>
        </div>
        <textarea data-testid="new-post-content" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="What's on your mind?" style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }} />
        <input data-testid="new-post-tags" value={newPostTags} onChange={(e) => setNewPostTags(e.target.value)} placeholder="Tags (comma separated)" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, fontSize: '13px', marginTop: '8px', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button data-testid="submit-post" onClick={handleCreatePost} disabled={!newPostContent.trim()} style={{ padding: '8px 24px', borderRadius: '20px', background: newPostContent.trim() ? themeStyles.accent : themeStyles.border, color: 'white', border: 'none', cursor: newPostContent.trim() ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: 'bold' }}>Post</button>
        </div>
      </div>
    )
  );

  const renderFeed = () => (
    <div data-testid="feed-view" ref={feedRef}>
      {renderStories()}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select data-testid="feed-filter" value={feedFilter} onChange={(e) => setFeedFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.cardBg, color: themeStyles.text, fontSize: '13px' }}>
          <option value="all">All Posts</option>
          <option value="following">Following</option>
          <option value="popular">Popular</option>
        </select>
        <select data-testid="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.cardBg, color: themeStyles.text, fontSize: '13px' }}>
          <option value="recent">Most Recent</option>
          <option value="popular">Most Liked</option>
          <option value="discussed">Most Discussed</option>
        </select>
        <button data-testid="open-composer" onClick={() => setShowComposer(true)} style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '20px', background: themeStyles.accent, color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>+ New Post</button>
      </div>
      {renderComposer()}
      {displayedPosts.length === 0 ? (
        <div data-testid="empty-feed" style={{ textAlign: 'center', padding: '40px', color: themeStyles.textSecondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div>No posts found. Try adjusting your filters or follow more people!</div>
        </div>
      ) : (
        displayedPosts.map((post) => renderPostCard(post))
      )}
    </div>
  );

  const renderBookmarks = () => {
    const bookmarked = posts.filter((p) => bookmarkedPosts.includes(p.id));
    return (
      <div data-testid="bookmarks-view">
        <h2 style={{ color: themeStyles.text, marginBottom: '16px' }}>📌 Bookmarked Posts ({bookmarked.length})</h2>
        {bookmarked.length === 0 ? (
          <div data-testid="empty-bookmarks" style={{ textAlign: 'center', padding: '40px', color: themeStyles.textSecondary }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📑</div>
            <div>No bookmarked posts yet. Click the star icon on posts to bookmark them!</div>
          </div>
        ) : (
          bookmarked.map((post) => renderPostCard(post))
        )}
      </div>
    );
  };

  const renderProfile = () => {
    const profileId = selectedProfile || 'me';
    const user = getUserById(profileId);
    if (!user) return null;
    const userPosts = posts.filter((p) => p.authorId === profileId);
    const isFollowing = followedUsers.includes(profileId);
    const totalLikes = userPosts.reduce((sum, p) => sum + p.likes, 0);

    return (
      <div data-testid="profile-view">
        <div style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '24px', marginBottom: '16px', border: `1px solid ${themeStyles.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>{user.avatar}</div>
          <h2 style={{ color: themeStyles.text, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            {user.name} {user.verified && <span style={{ color: themeStyles.accent, fontSize: '16px' }}>✓</span>}
          </h2>
          <div style={{ color: themeStyles.textSecondary, marginBottom: '8px' }}>{user.handle}</div>
          <div style={{ color: themeStyles.text, marginBottom: '16px' }}>{user.bio}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
            <div><strong style={{ color: themeStyles.text }}>{formatNumber(user.followers)}</strong> <span style={{ color: themeStyles.textSecondary, fontSize: '13px' }}>followers</span></div>
            <div><strong style={{ color: themeStyles.text }}>{formatNumber(user.following)}</strong> <span style={{ color: themeStyles.textSecondary, fontSize: '13px' }}>following</span></div>
            <div><strong style={{ color: themeStyles.text }}>{userPosts.length}</strong> <span style={{ color: themeStyles.textSecondary, fontSize: '13px' }}>posts</span></div>
            <div><strong style={{ color: themeStyles.text }}>{formatNumber(totalLikes)}</strong> <span style={{ color: themeStyles.textSecondary, fontSize: '13px' }}>total likes</span></div>
          </div>
          {profileId !== 'me' && (
            <button data-testid={`follow-btn-${profileId}`} onClick={() => handleToggleFollow(profileId)} style={{ padding: '10px 32px', borderRadius: '24px', background: isFollowing ? themeStyles.bg : themeStyles.accent, color: isFollowing ? themeStyles.text : 'white', border: `1px solid ${isFollowing ? themeStyles.border : themeStyles.accent}`, cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        <h3 style={{ color: themeStyles.text, marginBottom: '12px' }}>Posts by {user.name}</h3>
        {userPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: themeStyles.textSecondary }}>No posts yet</div>
        ) : (
          userPosts.map((post) => renderPostCard(post))
        )}
      </div>
    );
  };

  const renderNotifications = () => (
    <div data-testid="notifications-view">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h2 style={{ color: themeStyles.text, margin: 0 }}>🔔 Notifications</h2>
        {unreadNotificationCount > 0 && (
          <button data-testid="mark-all-read" onClick={handleMarkNotificationsRead} style={{ padding: '6px 12px', borderRadius: '8px', background: themeStyles.accent, color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Mark all read</button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'unread', 'like', 'comment', 'follow', 'share', 'mention'].map((filter) => (
          <button key={filter} data-testid={`notif-filter-${filter}`} onClick={() => setNotificationFilter(filter)} style={{ padding: '6px 12px', borderRadius: '16px', background: notificationFilter === filter ? themeStyles.accent : themeStyles.bg, color: notificationFilter === filter ? 'white' : themeStyles.text, border: `1px solid ${themeStyles.border}`, cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' }}>{filter}</button>
        ))}
      </div>
      {filteredNotifications.length === 0 ? (
        <div data-testid="empty-notifications" style={{ textAlign: 'center', padding: '40px', color: themeStyles.textSecondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔕</div>
          <div>No notifications to show</div>
        </div>
      ) : (
        filteredNotifications.map((notif) => {
          const actor = getUserById(notif.actorId);
          const typeEmoji = { like: '❤️', comment: '💬', follow: '👤', share: '🔄', mention: '📢' };
          return (
            <div key={notif.id} data-testid={`notification-${notif.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', marginBottom: '8px', background: notif.read ? themeStyles.cardBg : `${themeStyles.accent}10`, border: `1px solid ${themeStyles.border}`, cursor: 'pointer' }} onClick={() => { if (notif.type === 'follow') { setSelectedProfile(notif.actorId); setActiveView('profile'); } }}>
              <span style={{ fontSize: '24px' }}>{typeEmoji[notif.type]}</span>
              <span style={{ fontSize: '24px' }}>{actor?.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: themeStyles.text, fontSize: '14px' }}>
                  <strong>{actor?.name}</strong>{' '}
                  {notif.type === 'like' && 'liked your post'}
                  {notif.type === 'comment' && 'commented on your post'}
                  {notif.type === 'follow' && 'started following you'}
                  {notif.type === 'share' && 'shared your post'}
                  {notif.type === 'mention' && 'mentioned you'}
                </div>
                {notif.content && <div style={{ fontSize: '13px', color: themeStyles.textSecondary, marginTop: '2px' }}>"{notif.content}"</div>}
                <div style={{ fontSize: '11px', color: themeStyles.textSecondary, marginTop: '4px' }}>{formatTimeAgo(notif.timestamp)}</div>
              </div>
              {!notif.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: themeStyles.accent }} />}
            </div>
          );
        })
      )}
    </div>
  );

  const renderMessages = () => (
    <div data-testid="messages-view" style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: '16px' }}>
      <div data-testid="conversation-list" style={{ width: '280px', background: themeStyles.cardBg, borderRadius: '12px', border: `1px solid ${themeStyles.border}`, overflow: 'auto' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${themeStyles.border}` }}>
          <h3 style={{ color: themeStyles.text, margin: 0 }}>💬 Messages</h3>
        </div>
        {conversations.map((conv) => {
          const participant = getUserById(conv.participantId);
          return (
            <div key={conv.id} data-testid={`conversation-${conv.id}`} onClick={() => { setSelectedConversation(conv.id); handleMarkConversationRead(conv.id); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer', background: selectedConversation === conv.id ? themeStyles.hover : 'transparent', borderBottom: `1px solid ${themeStyles.border}` }}>
              <span style={{ fontSize: '24px' }}>{participant?.avatar}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: themeStyles.text, fontSize: '13px' }}>{participant?.name}</span>
                  <span style={{ fontSize: '11px', color: themeStyles.textSecondary }}>{formatTimeAgo(conv.lastTimestamp)}</span>
                </div>
                <div style={{ fontSize: '12px', color: themeStyles.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMessage}</div>
              </div>
              {conv.unread > 0 && (
                <span data-testid={`unread-badge-${conv.id}`} style={{ background: themeStyles.accent, color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>{conv.unread}</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, background: themeStyles.cardBg, borderRadius: '12px', border: `1px solid ${themeStyles.border}`, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (() => {
          const conv = conversations.find((c) => c.id === selectedConversation);
          if (!conv) return null;
          const participant = getUserById(conv.participantId);
          return (
            <>
              <div style={{ padding: '16px', borderBottom: `1px solid ${themeStyles.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>{participant?.avatar}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: themeStyles.text, fontSize: '14px' }}>{participant?.name}</div>
                  <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>{participant?.handle}</div>
                </div>
              </div>
              <div data-testid="message-list" style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {conv.messages.map((msg) => (
                  <div key={msg.id} data-testid={`message-${msg.id}`} style={{ alignSelf: msg.senderId === 'me' ? 'flex-end' : 'flex-start', maxWidth: '70%', padding: '10px 14px', borderRadius: '16px', background: msg.senderId === 'me' ? themeStyles.accent : themeStyles.bg, color: msg.senderId === 'me' ? 'white' : themeStyles.text, fontSize: '14px' }}>
                    <div>{msg.content}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>{formatTimeAgo(msg.timestamp)}</div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
              <div style={{ padding: '16px', borderTop: `1px solid ${themeStyles.border}`, display: 'flex', gap: '8px' }}>
                <input data-testid="message-input" value={newMessageContent} onChange={(e) => setNewMessageContent(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(selectedConversation); }} style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, fontSize: '14px' }} />
                <button data-testid="send-message" onClick={() => handleSendMessage(selectedConversation)} style={{ padding: '10px 20px', borderRadius: '24px', background: themeStyles.accent, color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Send</button>
              </div>
            </>
          );
        })() : (
          <div data-testid="no-conversation-selected" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeStyles.textSecondary }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <div>Select a conversation to start messaging</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrending = () => (
    <div data-testid="trending-sidebar" style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '16px', border: `1px solid ${themeStyles.border}` }}>
      <h3 style={{ color: themeStyles.text, marginTop: 0, marginBottom: '12px' }}>🔥 Trending</h3>
      {TRENDING_TOPICS.map((topic) => (
        <div key={topic.tag} data-testid={`trending-${topic.tag}`} onClick={() => { setSearchQuery(topic.tag); setActiveView('feed'); }} style={{ padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid ${themeStyles.border}` }}>
          <div style={{ fontWeight: 'bold', color: themeStyles.accent, fontSize: '14px' }}>#{topic.tag}</div>
          <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>{formatNumber(topic.postCount)} posts</div>
        </div>
      ))}
    </div>
  );

  const renderSuggestedUsers = () => {
    const unfollowed = MOCK_USERS.filter((u) => !followedUsers.includes(u.id));
    if (unfollowed.length === 0) return null;
    return (
      <div data-testid="suggested-users" style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '16px', marginTop: '16px', border: `1px solid ${themeStyles.border}` }}>
        <h3 style={{ color: themeStyles.text, marginTop: 0, marginBottom: '12px' }}>👥 Suggested</h3>
        {unfollowed.slice(0, 3).map((user) => (
          <div key={user.id} data-testid={`suggested-${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <button onClick={() => { setSelectedProfile(user.id); setActiveView('profile'); }} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>{user.avatar}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: themeStyles.text }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: themeStyles.textSecondary }}>{user.handle}</div>
            </div>
            <button data-testid={`suggest-follow-${user.id}`} onClick={() => handleToggleFollow(user.id)} style={{ padding: '4px 12px', borderRadius: '16px', background: themeStyles.accent, color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Follow</button>
          </div>
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;
    return (
      <div data-testid="search-results">
        {searchedUsers.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ color: themeStyles.text }}>People</h3>
            {searchedUsers.map((user) => (
              <div key={user.id} data-testid={`search-user-${user.id}`} onClick={() => { setSelectedProfile(user.id); setActiveView('profile'); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: themeStyles.cardBg, marginBottom: '8px', cursor: 'pointer', border: `1px solid ${themeStyles.border}` }}>
                <span style={{ fontSize: '28px' }}>{user.avatar}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: themeStyles.text }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>{user.handle}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderShareModal = () => {
    if (!showShareModal) return null;
    return (
      <div data-testid="share-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowShareModal(false)}>
        <div style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ color: themeStyles.text, marginTop: 0 }}>Share Post</h3>
          <p style={{ color: themeStyles.textSecondary }}>Share this post with your followers?</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button data-testid="cancel-share" onClick={() => setShowShareModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, cursor: 'pointer' }}>Cancel</button>
            <button data-testid="confirm-share" onClick={handleConfirmShare} style={{ padding: '8px 16px', borderRadius: '8px', background: themeStyles.accent, color: 'white', border: 'none', cursor: 'pointer' }}>Share</button>
          </div>
        </div>
      </div>
    );
  };

  const renderReportModal = () => {
    if (!showReportModal) return null;
    return (
      <div data-testid="report-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowReportModal(false)}>
        <div style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ color: themeStyles.text, marginTop: 0 }}>Report Post</h3>
          <p style={{ color: themeStyles.textSecondary }}>Why are you reporting this post?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {['Spam', 'Harassment', 'Misinformation', 'Other'].map((reason) => (
              <button key={reason} data-testid={`report-reason-${reason.toLowerCase()}`} onClick={() => setReportReason(reason)} style={{ padding: '10px 16px', borderRadius: '8px', border: `1px solid ${reportReason === reason ? themeStyles.accent : themeStyles.border}`, background: reportReason === reason ? `${themeStyles.accent}20` : themeStyles.bg, color: themeStyles.text, cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>{reason}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button data-testid="cancel-report" onClick={() => { setShowReportModal(false); setReportReason(''); }} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, cursor: 'pointer' }}>Cancel</button>
            <button data-testid="submit-report" onClick={handleSubmitReport} disabled={!reportReason} style={{ padding: '8px 16px', borderRadius: '8px', background: reportReason ? '#e74c3c' : themeStyles.border, color: 'white', border: 'none', cursor: reportReason ? 'pointer' : 'not-allowed' }}>Report</button>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div data-testid="settings-view">
      <h2 style={{ color: themeStyles.text, marginBottom: '16px' }}>⚙️ Settings</h2>
      <div style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${themeStyles.border}` }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: themeStyles.text, marginBottom: '12px', fontSize: '16px' }}>Appearance</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${themeStyles.border}` }}>
            <div>
              <div style={{ color: themeStyles.text, fontSize: '14px' }}>Dark Mode</div>
              <div style={{ color: themeStyles.textSecondary, fontSize: '12px' }}>Switch between light and dark theme</div>
            </div>
            <button data-testid="setting-dark-mode" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ padding: '6px 16px', borderRadius: '16px', background: theme === 'dark' ? themeStyles.accent : themeStyles.bg, color: theme === 'dark' ? 'white' : themeStyles.text, border: `1px solid ${themeStyles.border}`, cursor: 'pointer', fontSize: '13px' }}>{theme === 'dark' ? 'On' : 'Off'}</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${themeStyles.border}` }}>
            <div>
              <div style={{ color: themeStyles.text, fontSize: '14px' }}>Compact Mode</div>
              <div style={{ color: themeStyles.textSecondary, fontSize: '12px' }}>Reduce spacing between posts</div>
            </div>
            <button data-testid="setting-compact-mode" onClick={() => handleUpdateSetting('compactMode', !settings.compactMode)} style={{ padding: '6px 16px', borderRadius: '16px', background: settings.compactMode ? themeStyles.accent : themeStyles.bg, color: settings.compactMode ? 'white' : themeStyles.text, border: `1px solid ${themeStyles.border}`, cursor: 'pointer', fontSize: '13px' }}>{settings.compactMode ? 'On' : 'Off'}</button>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: themeStyles.text, marginBottom: '12px', fontSize: '16px' }}>Notifications</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${themeStyles.border}` }}>
            <div>
              <div style={{ color: themeStyles.text, fontSize: '14px' }}>Show Notification Badges</div>
              <div style={{ color: themeStyles.textSecondary, fontSize: '12px' }}>Display unread count badges in sidebar</div>
            </div>
            <button data-testid="setting-notif-badges" onClick={() => handleUpdateSetting('showNotificationBadges', !settings.showNotificationBadges)} style={{ padding: '6px 16px', borderRadius: '16px', background: settings.showNotificationBadges ? themeStyles.accent : themeStyles.bg, color: settings.showNotificationBadges ? 'white' : themeStyles.text, border: `1px solid ${themeStyles.border}`, cursor: 'pointer', fontSize: '13px' }}>{settings.showNotificationBadges ? 'On' : 'Off'}</button>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: themeStyles.text, marginBottom: '12px', fontSize: '16px' }}>Privacy</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${themeStyles.border}` }}>
            <div>
              <div style={{ color: themeStyles.text, fontSize: '14px' }}>Show Read Receipts</div>
              <div style={{ color: themeStyles.textSecondary, fontSize: '12px' }}>Let others know when you've read their messages</div>
            </div>
            <button data-testid="setting-read-receipts" onClick={() => handleUpdateSetting('showReadReceipts', !settings.showReadReceipts)} style={{ padding: '6px 16px', borderRadius: '16px', background: settings.showReadReceipts ? themeStyles.accent : themeStyles.bg, color: settings.showReadReceipts ? 'white' : themeStyles.text, border: `1px solid ${themeStyles.border}`, cursor: 'pointer', fontSize: '13px' }}>{settings.showReadReceipts ? 'On' : 'Off'}</button>
          </div>
        </div>
        <div>
          <h3 style={{ color: themeStyles.text, marginBottom: '12px', fontSize: '16px' }}>Muted Users</h3>
          {mutedUsers.length === 0 ? (
            <div data-testid="no-muted-users" style={{ color: themeStyles.textSecondary, fontSize: '13px', padding: '10px 0' }}>No muted users</div>
          ) : (
            mutedUsers.map((userId) => {
              const user = getUserById(userId);
              return (
                <div key={userId} data-testid={`muted-user-${userId}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${themeStyles.border}` }}>
                  <span style={{ fontSize: '20px' }}>{user?.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: themeStyles.text }}>{user?.name}</div>
                    <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>{user?.handle}</div>
                  </div>
                  <button data-testid={`unmute-${userId}`} onClick={() => handleMuteUser(userId)} style={{ padding: '4px 12px', borderRadius: '16px', background: themeStyles.bg, color: themeStyles.text, border: `1px solid ${themeStyles.border}`, cursor: 'pointer', fontSize: '12px' }}>Unmute</button>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${themeStyles.border}`, marginTop: '16px' }}>
        <h3 style={{ color: themeStyles.text, marginBottom: '12px', fontSize: '16px' }}>Your Stats</h3>
        <div data-testid="user-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', background: themeStyles.bg }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: themeStyles.text }}>{userStats.postCount}</div>
            <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>Posts</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', background: themeStyles.bg }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: themeStyles.text }}>{userStats.totalLikes}</div>
            <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>Likes</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', background: themeStyles.bg }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: themeStyles.text }}>{userStats.totalComments}</div>
            <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>Comments</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', background: themeStyles.bg }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: themeStyles.text }}>{userStats.totalShares}</div>
            <div style={{ fontSize: '12px', color: themeStyles.textSecondary }}>Shares</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: themeStyles.bg, color: themeStyles.text }}>
      <header data-testid="header" style={{ background: themeStyles.cardBg, borderBottom: `1px solid ${themeStyles.border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ margin: 0, fontSize: '20px', color: themeStyles.accent, cursor: 'pointer' }} onClick={() => { setActiveView('feed'); setSelectedProfile(null); }}>SocialHub</h1>
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
          <input ref={searchInputRef} data-testid="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search posts, people, tags... (Ctrl+K)" style={{ width: '100%', padding: '8px 12px', borderRadius: '24px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <select data-testid="search-filter" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, background: themeStyles.bg, color: themeStyles.text, fontSize: '13px' }}>
          <option value="all">All</option>
          <option value="posts">Posts</option>
          <option value="people">People</option>
        </select>
        <button data-testid="toggle-theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>{theme === 'light' ? '🌙' : '☀️'}</button>
      </header>

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '16px', gap: '16px' }}>
        <nav data-testid="sidebar" style={{ width: sidebarCollapsed ? '60px' : '220px', transition: 'width 0.2s', flexShrink: 0 }}>
          <div style={{ background: themeStyles.cardBg, borderRadius: '12px', padding: '8px', border: `1px solid ${themeStyles.border}`, position: 'sticky', top: '80px' }}>
            <button data-testid="toggle-sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ width: '100%', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: themeStyles.textSecondary, fontSize: '16px' }}>
              {sidebarCollapsed ? '→' : '←'}
            </button>
            {[
              { id: 'feed', icon: '🏠', label: 'Feed' },
              { id: 'notifications', icon: '🔔', label: 'Notifications', badge: unreadNotificationCount },
              { id: 'messages', icon: '💬', label: 'Messages', badge: unreadMessageCount },
              { id: 'bookmarks', icon: '📌', label: 'Bookmarks' },
              { id: 'profile', icon: '👤', label: 'Profile' },
              { id: 'settings', icon: '⚙️', label: 'Settings' },
            ].map((item) => (
              <button key={item.id} data-testid={`nav-${item.id}`} onClick={() => { setActiveView(item.id); if (item.id === 'profile') setSelectedProfile(null); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: activeView === item.id ? `${themeStyles.accent}20` : 'transparent', color: activeView === item.id ? themeStyles.accent : themeStyles.text, border: 'none', cursor: 'pointer', fontSize: '14px', textAlign: 'left', position: 'relative' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
                {item.badge > 0 && settings.showNotificationBadges && (
                  <span data-testid={`badge-${item.id}`} style={{ position: sidebarCollapsed ? 'absolute' : 'static', top: sidebarCollapsed ? '2px' : 'auto', right: sidebarCollapsed ? '2px' : 'auto', marginLeft: sidebarCollapsed ? 0 : 'auto', background: '#e74c3c', color: 'white', fontSize: '11px', padding: '1px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <main style={{ flex: 1, minWidth: 0 }}>
          {renderSearchResults()}
          {activeView === 'feed' && renderFeed()}
          {activeView === 'notifications' && renderNotifications()}
          {activeView === 'messages' && renderMessages()}
          {activeView === 'bookmarks' && renderBookmarks()}
          {activeView === 'profile' && renderProfile()}
          {activeView === 'settings' && renderSettings()}
        </main>

        {activeView === 'feed' && (
          <aside style={{ width: '280px', flexShrink: 0 }}>
            {renderTrending()}
            {renderSuggestedUsers()}
          </aside>
        )}
      </div>

      {renderStoryViewer()}
      {renderShareModal()}
      {renderReportModal()}
    </div>
  );
}
