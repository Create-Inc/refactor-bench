import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  Platform,
} from 'react-native';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const CURRENT_USER = {
  id: 'u1',
  username: 'alex_johnson',
  displayName: 'Alex Johnson',
  avatar: 'AJ',
  bio: 'Product designer & photographer',
  followersCount: 1284,
  followingCount: 567,
  postsCount: 89,
  verified: true,
};

const USERS = [
  { id: 'u1', username: 'alex_johnson', displayName: 'Alex Johnson', avatar: 'AJ', verified: true },
  { id: 'u2', username: 'sarah_m', displayName: 'Sarah Mitchell', avatar: 'SM', verified: false },
  { id: 'u3', username: 'mike_dev', displayName: 'Mike Chen', avatar: 'MC', verified: true },
  { id: 'u4', username: 'emma_art', displayName: 'Emma Wilson', avatar: 'EW', verified: false },
  { id: 'u5', username: 'james_fit', displayName: 'James Park', avatar: 'JP', verified: true },
  { id: 'u6', username: 'olivia_cook', displayName: 'Olivia Brown', avatar: 'OB', verified: false },
  { id: 'u7', username: 'david_photo', displayName: 'David Kim', avatar: 'DK', verified: true },
  { id: 'u8', username: 'lisa_travel', displayName: 'Lisa Garcia', avatar: 'LG', verified: false },
];

const STORIES = [
  { id: 's1', userId: 'u1', hasUnread: false, label: 'Your Story' },
  { id: 's2', userId: 'u2', hasUnread: true, label: null },
  { id: 's3', userId: 'u3', hasUnread: true, label: null },
  { id: 's4', userId: 'u4', hasUnread: true, label: null },
  { id: 's5', userId: 'u5', hasUnread: false, label: null },
  { id: 's6', userId: 'u6', hasUnread: true, label: null },
  { id: 's7', userId: 'u7', hasUnread: false, label: null },
  { id: 's8', userId: 'u8', hasUnread: true, label: null },
];

const INITIAL_POSTS = [
  {
    id: 'p1',
    userId: 'u2',
    content: 'Just finished designing the new dashboard for our client! Really proud of how the data visualization turned out. What do you think? #design #ux #dashboards',
    imageEmoji: '🎨',
    timestamp: Date.now() - 3600000 * 2,
    likesCount: 42,
    commentsCount: 8,
    sharesCount: 3,
    tags: ['design', 'ux', 'dashboards'],
  },
  {
    id: 'p2',
    userId: 'u3',
    content: 'New blog post: "Why TypeScript is Essential for Large-Scale Applications" - link in bio! After working on a 200k LOC codebase, I have some thoughts...',
    imageEmoji: '💻',
    timestamp: Date.now() - 3600000 * 5,
    likesCount: 128,
    commentsCount: 34,
    sharesCount: 21,
    tags: ['typescript', 'programming', 'webdev'],
  },
  {
    id: 'p3',
    userId: 'u5',
    content: 'Morning workout done! 5K run followed by a strength session. The sunrise was incredible today. Remember: consistency beats intensity every time.',
    imageEmoji: '🏃',
    timestamp: Date.now() - 3600000 * 8,
    likesCount: 89,
    commentsCount: 12,
    sharesCount: 5,
    tags: ['fitness', 'running', 'motivation'],
  },
  {
    id: 'p4',
    userId: 'u4',
    content: 'Just opened my Etsy shop! Selling custom watercolor portraits and digital art prints. First 10 orders get 20% off! Check it out.',
    imageEmoji: '🖼️',
    timestamp: Date.now() - 3600000 * 12,
    likesCount: 67,
    commentsCount: 19,
    sharesCount: 14,
    tags: ['art', 'watercolor', 'etsy'],
  },
  {
    id: 'p5',
    userId: 'u7',
    content: 'Captured this amazing sunset at Golden Gate Bridge yesterday. Sometimes you just have to stop and appreciate the beauty around you. #photography #sanfrancisco',
    imageEmoji: '📸',
    timestamp: Date.now() - 3600000 * 18,
    likesCount: 215,
    commentsCount: 28,
    sharesCount: 42,
    tags: ['photography', 'sanfrancisco', 'sunset'],
  },
  {
    id: 'p6',
    userId: 'u6',
    content: 'Made homemade pasta from scratch for the first time! Surprisingly easier than I thought. The key is letting the dough rest for at least 30 minutes.',
    imageEmoji: '🍝',
    timestamp: Date.now() - 3600000 * 24,
    likesCount: 156,
    commentsCount: 41,
    sharesCount: 18,
    tags: ['cooking', 'pasta', 'homemade'],
  },
  {
    id: 'p7',
    userId: 'u8',
    content: 'Two weeks in Japan and I still can\'t get over how amazing the food is. Today: ramen in Kyoto that was absolutely life-changing. Travel diary coming soon!',
    imageEmoji: '🗾',
    timestamp: Date.now() - 3600000 * 36,
    likesCount: 312,
    commentsCount: 56,
    sharesCount: 33,
    tags: ['travel', 'japan', 'food'],
  },
  {
    id: 'p8',
    userId: 'u2',
    content: 'Hot take: Dark mode should be the default in every app. Our users agree - 78% of our user base switches to dark mode within the first week.',
    imageEmoji: '🌙',
    timestamp: Date.now() - 3600000 * 48,
    likesCount: 98,
    commentsCount: 63,
    sharesCount: 11,
    tags: ['design', 'darkmode', 'ux'],
  },
];

const INITIAL_COMMENTS = {
  p1: [
    { id: 'c1', userId: 'u3', text: 'This looks incredible! Love the color palette.', timestamp: Date.now() - 3600000 },
    { id: 'c2', userId: 'u7', text: 'The chart animations are so smooth!', timestamp: Date.now() - 1800000 },
  ],
  p2: [
    { id: 'c3', userId: 'u1', text: 'Great article! TypeScript saved our project many times.', timestamp: Date.now() - 3600000 * 4 },
    { id: 'c4', userId: 'u4', text: 'Would love to see a follow-up on type safety patterns.', timestamp: Date.now() - 3600000 * 3 },
    { id: 'c5', userId: 'u5', text: 'Bookmarked! Sharing with my team.', timestamp: Date.now() - 3600000 * 2 },
  ],
  p3: [
    { id: 'c6', userId: 'u1', text: 'How do you stay motivated for early morning runs?', timestamp: Date.now() - 3600000 * 7 },
    { id: 'c7', userId: 'u6', text: 'Impressive consistency! What is your weekly mileage?', timestamp: Date.now() - 3600000 * 6 },
  ],
};

const INITIAL_CONVERSATIONS = [
  { id: 'conv1', userId: 'u2', lastMessage: 'Can you review my design?', timestamp: Date.now() - 3600000, unreadCount: 2 },
  { id: 'conv2', userId: 'u3', lastMessage: 'PR merged! Thanks for the review', timestamp: Date.now() - 7200000, unreadCount: 0 },
  { id: 'conv3', userId: 'u5', lastMessage: 'See you at the gym tomorrow!', timestamp: Date.now() - 10800000, unreadCount: 1 },
  { id: 'conv4', userId: 'u7', lastMessage: 'Sent you the edited photos', timestamp: Date.now() - 86400000, unreadCount: 0 },
  { id: 'conv5', userId: 'u8', lastMessage: 'Japan is amazing! You should visit', timestamp: Date.now() - 172800000, unreadCount: 3 },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'like', userId: 'u3', postId: 'p1', timestamp: Date.now() - 1800000, read: false },
  { id: 'n2', type: 'comment', userId: 'u4', postId: 'p2', text: 'Great post!', timestamp: Date.now() - 3600000, read: false },
  { id: 'n3', type: 'follow', userId: 'u6', postId: null, timestamp: Date.now() - 7200000, read: false },
  { id: 'n4', type: 'like', userId: 'u7', postId: 'p1', timestamp: Date.now() - 14400000, read: true },
  { id: 'n5', type: 'mention', userId: 'u2', postId: 'p3', text: 'tagged you', timestamp: Date.now() - 28800000, read: true },
  { id: 'n6', type: 'follow', userId: 'u8', postId: null, timestamp: Date.now() - 43200000, read: true },
  { id: 'n7', type: 'comment', userId: 'u5', postId: 'p4', text: 'Wow amazing!', timestamp: Date.now() - 86400000, read: true },
];

const TRENDING_TAGS = ['#reactnative', '#webdev', '#design', '#photography', '#fitness', '#cooking', '#travel', '#typescript'];

const DISCOVER_CATEGORIES = [
  { id: 'cat1', name: 'Technology', emoji: '💻', color: '#3b82f6' },
  { id: 'cat2', name: 'Art & Design', emoji: '🎨', color: '#8b5cf6' },
  { id: 'cat3', name: 'Fitness', emoji: '💪', color: '#22c55e' },
  { id: 'cat4', name: 'Food', emoji: '🍕', color: '#f59e0b' },
  { id: 'cat5', name: 'Travel', emoji: '✈️', color: '#06b6d4' },
  { id: 'cat6', name: 'Music', emoji: '🎵', color: '#ec4899' },
];

// ─── Helper Functions ───────────────────────────────────────────────────────────

const getUserById = (userId) => USERS.find((u) => u.id === userId) || USERS[0];

const formatTimestamp = (ts) => {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatCount = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // ── Navigation & UI State ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('feed');
  const [darkMode, setDarkMode] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // ── Feed State ────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'following' | 'trending'
  const [likedPosts, setLikedPosts] = useState({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // ── Stories State ─────────────────────────────────────────────────────────
  const [viewedStories, setViewedStories] = useState({});
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState(null);

  // ── Search & Discover State ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all'); // 'all' | 'people' | 'tags' | 'posts'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ── Notifications State ───────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'

  // ── Messages State ────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');

  // ── Profile State ─────────────────────────────────────────────────────────
  const [profileTab, setProfileTab] = useState('posts'); // 'posts' | 'bookmarks' | 'likes'
  const [viewingProfile, setViewingProfile] = useState(null);
  const [following, setFollowing] = useState({ u2: true, u3: true, u5: true });

  // ── Create Post State ─────────────────────────────────────────────────────
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostEmoji, setNewPostEmoji] = useState('📝');

  // ── Settings State ────────────────────────────────────────────────────────
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);

  const scrollRef = useRef(null);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const theme = useMemo(
    () => ({
      bg: darkMode ? '#0a0a0a' : '#ffffff',
      surface: darkMode ? '#1a1a2e' : '#f8f9fa',
      card: darkMode ? '#16213e' : '#ffffff',
      text: darkMode ? '#e2e8f0' : '#1a202c',
      textSecondary: darkMode ? '#94a3b8' : '#718096',
      border: darkMode ? '#2d3748' : '#e2e8f0',
      primary: '#6366f1',
      primaryLight: darkMode ? '#312e81' : '#eef2ff',
      danger: '#ef4444',
      success: '#22c55e',
      accent: '#f59e0b',
    }),
    [darkMode]
  );

  // ── Derived Data ──────────────────────────────────────────────────────────

  const unreadNotifCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const unreadMessageCount = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (feedFilter === 'following') {
      result = result.filter((p) => following[p.userId]);
    } else if (feedFilter === 'trending') {
      result = result.sort((a, b) => (b.likesCount + b.sharesCount) - (a.likesCount + a.sharesCount));
    }
    return result;
  }, [posts, feedFilter, following]);

  const filteredNotifications = useMemo(() => {
    if (notifFilter === 'unread') return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, notifFilter]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { users: [], posts: [], tags: [] };
    const q = searchQuery.toLowerCase();
    const matchedUsers = USERS.filter(
      (u) => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)
    );
    const matchedPosts = posts.filter(
      (p) => p.content.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
    );
    const matchedTags = TRENDING_TAGS.filter((t) => t.toLowerCase().includes(q));
    return { users: matchedUsers, posts: matchedPosts, tags: matchedTags };
  }, [searchQuery, posts]);

  const filteredConversations = useMemo(() => {
    if (!messageSearchQuery.trim()) return conversations;
    const q = messageSearchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const user = getUserById(conv.userId);
      return user.displayName.toLowerCase().includes(q) || conv.lastMessage.toLowerCase().includes(q);
    });
  }, [conversations, messageSearchQuery]);

  const bookmarkedPostsList = useMemo(
    () => posts.filter((p) => bookmarkedPosts[p.id]),
    [posts, bookmarkedPosts]
  );

  const likedPostsList = useMemo(
    () => posts.filter((p) => likedPosts[p.id]),
    [posts, likedPosts]
  );

  const userPosts = useMemo(() => {
    const userId = viewingProfile || CURRENT_USER.id;
    return posts.filter((p) => p.userId === userId);
  }, [posts, viewingProfile]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const toggleLike = useCallback((postId) => {
    setLikedPosts((prev) => {
      const isLiked = prev[postId];
      return { ...prev, [postId]: !isLiked };
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likesCount: p.likesCount + (likedPosts[postId] ? -1 : 1) }
          : p
      )
    );
  }, [likedPosts]);

  const toggleBookmark = useCallback((postId) => {
    setBookmarkedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const toggleComments = useCallback((postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const addComment = useCallback((postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const newComment = {
      id: `c_${Date.now()}`,
      userId: CURRENT_USER.id,
      text,
      timestamp: Date.now(),
    };
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  }, [commentInputs]);

  const deleteComment = useCallback((postId, commentId) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setComments((prev) => ({
            ...prev,
            [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
          }));
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
            )
          );
        },
      },
    ]);
  }, []);

  const sharePost = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p
      )
    );
    Alert.alert('Shared!', 'Post has been shared to your story.');
  }, []);

  const openStory = useCallback((storyId) => {
    setActiveStoryId(storyId);
    setStoryViewerOpen(true);
    setViewedStories((prev) => ({ ...prev, [storyId]: true }));
  }, []);

  const closeStoryViewer = useCallback(() => {
    setStoryViewerOpen(false);
    setActiveStoryId(null);
  }, []);

  const createPost = useCallback(() => {
    if (!newPostContent.trim()) return;
    const extractedTags = newPostContent.match(/#(\w+)/g)?.map((t) => t.slice(1)) || [];
    const newPost = {
      id: `p_${Date.now()}`,
      userId: CURRENT_USER.id,
      content: newPostContent,
      imageEmoji: newPostEmoji,
      timestamp: Date.now(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      tags: extractedTags,
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent('');
    setNewPostEmoji('📝');
    setCreatePostOpen(false);
  }, [newPostContent, newPostEmoji]);

  const deletePost = useCallback((postId) => {
    Alert.alert('Delete Post', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          setComments((prev) => {
            const next = { ...prev };
            delete next[postId];
            return next;
          });
        },
      },
    ]);
  }, []);

  const toggleFollow = useCallback((userId) => {
    setFollowing((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  }, []);

  const sendMessage = useCallback(() => {
    if (!messageInput.trim() || !activeConversation) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation
          ? { ...c, lastMessage: messageInput, timestamp: Date.now(), unreadCount: 0 }
          : c
      )
    );
    setMessageInput('');
  }, [messageInput, activeConversation]);

  const openConversation = useCallback((convId) => {
    setActiveConversation(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const navigateToProfile = useCallback((userId) => {
    setViewingProfile(userId === CURRENT_USER.id ? null : userId);
    setActiveTab('profile');
    setProfileTab('posts');
  }, []);

  // ── Render Helpers ────────────────────────────────────────────────────────

  const renderAvatar = (user, size = 40) => (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.primary,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{user.avatar}</Text>
    </View>
  );

  const renderVerifiedBadge = () => (
    <Text style={styles.verifiedBadge}>✓</Text>
  );

  // ── Stories Row ───────────────────────────────────────────────────────────

  const renderStories = () => (
    <View style={[styles.storiesContainer, { borderBottomColor: theme.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
        {STORIES.map((story) => {
          const user = getUserById(story.userId);
          const hasUnread = story.hasUnread && !viewedStories[story.id];
          return (
            <TouchableOpacity
              key={story.id}
              style={styles.storyItem}
              onPress={() => openStory(story.id)}
              testID={`story-${story.id}`}
            >
              <View
                style={[
                  styles.storyRing,
                  {
                    borderColor: hasUnread ? theme.primary : theme.border,
                    borderWidth: hasUnread ? 2 : 1,
                  },
                ]}
              >
                {renderAvatar(user, 56)}
              </View>
              <Text style={[styles.storyLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {story.label || user.username.split('_')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ── Post Card ─────────────────────────────────────────────────────────────

  const renderPostCard = (post) => {
    const user = getUserById(post.userId);
    const isLiked = likedPosts[post.id];
    const isBookmarked = bookmarkedPosts[post.id];
    const isExpanded = expandedComments[post.id];
    const postComments = comments[post.id] || [];
    const isOwnPost = post.userId === CURRENT_USER.id;

    return (
      <View
        key={post.id}
        style={[styles.postCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        testID={`post-${post.id}`}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.postAuthor}
            onPress={() => navigateToProfile(post.userId)}
            testID={`post-author-${post.id}`}
          >
            {renderAvatar(user, 36)}
            <View style={styles.postAuthorInfo}>
              <View style={styles.authorNameRow}>
                <Text style={[styles.postAuthorName, { color: theme.text }]}>{user.displayName}</Text>
                {user.verified && renderVerifiedBadge()}
              </View>
              <Text style={[styles.postTimestamp, { color: theme.textSecondary }]}>
                {formatTimestamp(post.timestamp)}
              </Text>
            </View>
          </TouchableOpacity>
          {isOwnPost && (
            <TouchableOpacity
              onPress={() => deletePost(post.id)}
              testID={`delete-post-${post.id}`}
              style={styles.postMenuBtn}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 18 }}>•••</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Post Content */}
        <Text style={[styles.postContent, { color: theme.text }]}>{post.content}</Text>

        {/* Post Image Placeholder */}
        <View style={[styles.postImage, { backgroundColor: theme.surface }]}>
          <Text style={styles.postImageEmoji}>{post.imageEmoji}</Text>
        </View>

        {/* Tags */}
        {post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => {
                  setSearchQuery(`#${tag}`);
                  setActiveTab('search');
                }}
              >
                <Text style={[styles.tagText, { color: theme.primary }]}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Engagement Stats */}
        <View style={[styles.engagementRow, { borderTopColor: theme.border }]}>
          <Text style={[styles.engagementText, { color: theme.textSecondary }]}>
            {formatCount(post.likesCount)} likes
          </Text>
          <Text style={[styles.engagementText, { color: theme.textSecondary }]}>
            {post.commentsCount} comments
          </Text>
          <Text style={[styles.engagementText, { color: theme.textSecondary }]}>
            {post.sharesCount} shares
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleLike(post.id)}
            testID={`like-btn-${post.id}`}
          >
            <Text style={{ color: isLiked ? theme.danger : theme.textSecondary, fontSize: 18 }}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={[styles.actionLabel, { color: isLiked ? theme.danger : theme.textSecondary }]}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleComments(post.id)}
            testID={`comment-btn-${post.id}`}
          >
            <Text style={{ fontSize: 18 }}>💬</Text>
            <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => sharePost(post.id)}
            testID={`share-btn-${post.id}`}
          >
            <Text style={{ fontSize: 18 }}>↗️</Text>
            <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => toggleBookmark(post.id)}
            testID={`bookmark-btn-${post.id}`}
          >
            <Text style={{ color: isBookmarked ? theme.accent : theme.textSecondary, fontSize: 18 }}>
              {isBookmarked ? '🔖' : '🏷️'}
            </Text>
            <Text style={[styles.actionLabel, { color: isBookmarked ? theme.accent : theme.textSecondary }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {isExpanded && (
          <View style={[styles.commentsSection, { borderTopColor: theme.border }]} testID={`comments-${post.id}`}>
            {postComments.map((comment) => {
              const commentUser = getUserById(comment.userId);
              return (
                <View key={comment.id} style={styles.commentItem}>
                  <TouchableOpacity onPress={() => navigateToProfile(comment.userId)}>
                    {renderAvatar(commentUser, 28)}
                  </TouchableOpacity>
                  <View style={styles.commentContent}>
                    <Text style={[styles.commentAuthor, { color: theme.text }]}>
                      {commentUser.displayName}
                    </Text>
                    <Text style={[styles.commentText, { color: theme.text }]}>{comment.text}</Text>
                    <Text style={[styles.commentTime, { color: theme.textSecondary }]}>
                      {formatTimestamp(comment.timestamp)}
                    </Text>
                  </View>
                  {comment.userId === CURRENT_USER.id && (
                    <TouchableOpacity
                      onPress={() => deleteComment(post.id, comment.id)}
                      testID={`delete-comment-${comment.id}`}
                    >
                      <Text style={{ color: theme.danger, fontSize: 12 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {/* Add Comment Input */}
            <View style={styles.commentInputRow}>
              {renderAvatar(CURRENT_USER, 28)}
              <TextInput
                style={[
                  styles.commentInput,
                  { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.textSecondary}
                value={commentInputs[post.id] || ''}
                onChangeText={(text) =>
                  setCommentInputs((prev) => ({ ...prev, [post.id]: text }))
                }
                onSubmitEditing={() => addComment(post.id)}
                testID={`comment-input-${post.id}`}
              />
              <TouchableOpacity
                onPress={() => addComment(post.id)}
                style={[styles.commentSendBtn, { backgroundColor: theme.primary }]}
                testID={`send-comment-${post.id}`}
              >
                <Text style={styles.commentSendText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // ── Feed Tab ──────────────────────────────────────────────────────────────

  const renderFeedTab = () => (
    <View style={styles.tabContent}>
      {/* Feed Filter Tabs */}
      <View style={[styles.feedFilterRow, { backgroundColor: theme.surface }]}>
        {['all', 'following', 'trending'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.feedFilterBtn,
              feedFilter === filter && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFeedFilter(filter)}
            testID={`feed-filter-${filter}`}
          >
            <Text
              style={[
                styles.feedFilterText,
                { color: feedFilter === filter ? '#fff' : theme.textSecondary },
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderStories()}

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <View style={styles.emptyState} testID="empty-feed">
          <Text style={[styles.emptyEmoji]}>📭</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {feedFilter === 'following' ? 'Follow more people to see posts here!' : 'No posts yet'}
          </Text>
        </View>
      ) : (
        filteredPosts.map((post) => renderPostCard(post))
      )}
    </View>
  );

  // ── Search/Discover Tab ───────────────────────────────────────────────────

  const renderSearchTab = () => (
    <View style={styles.tabContent}>
      {/* Search Input */}
      <View style={[styles.searchInputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search people, posts, tags..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="search-input"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} testID="clear-search">
            <Text style={{ color: theme.textSecondary }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Filter Chips */}
      <View style={styles.searchFilterRow}>
        {['all', 'people', 'tags', 'posts'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.searchFilterChip,
              {
                backgroundColor: searchFilter === filter ? theme.primary : theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setSearchFilter(filter)}
            testID={`search-filter-${filter}`}
          >
            <Text
              style={{
                color: searchFilter === filter ? '#fff' : theme.textSecondary,
                fontSize: 13,
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {searchQuery.trim() ? (
        <View>
          {/* People Results */}
          {(searchFilter === 'all' || searchFilter === 'people') &&
            searchResults.users.length > 0 && (
              <View style={styles.searchSection}>
                <Text style={[styles.searchSectionTitle, { color: theme.text }]}>People</Text>
                {searchResults.users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[styles.searchUserItem, { borderBottomColor: theme.border }]}
                    onPress={() => navigateToProfile(user.id)}
                    testID={`search-user-${user.id}`}
                  >
                    {renderAvatar(user, 40)}
                    <View style={styles.searchUserInfo}>
                      <View style={styles.authorNameRow}>
                        <Text style={[styles.searchUserName, { color: theme.text }]}>{user.displayName}</Text>
                        {user.verified && renderVerifiedBadge()}
                      </View>
                      <Text style={[styles.searchUsername, { color: theme.textSecondary }]}>
                        @{user.username}
                      </Text>
                    </View>
                    {user.id !== CURRENT_USER.id && (
                      <TouchableOpacity
                        style={[
                          styles.followBtn,
                          {
                            backgroundColor: following[user.id] ? theme.surface : theme.primary,
                            borderColor: theme.border,
                          },
                        ]}
                        onPress={() => toggleFollow(user.id)}
                        testID={`follow-btn-${user.id}`}
                      >
                        <Text style={{ color: following[user.id] ? theme.text : '#fff', fontSize: 12 }}>
                          {following[user.id] ? 'Following' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

          {/* Tag Results */}
          {(searchFilter === 'all' || searchFilter === 'tags') &&
            searchResults.tags.length > 0 && (
              <View style={styles.searchSection}>
                <Text style={[styles.searchSectionTitle, { color: theme.text }]}>Tags</Text>
                {searchResults.tags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.searchTagItem, { borderBottomColor: theme.border }]}
                    onPress={() => setSearchQuery(tag)}
                    testID={`search-tag-${tag}`}
                  >
                    <Text style={{ fontSize: 20 }}>🏷️</Text>
                    <Text style={[styles.searchTagText, { color: theme.primary }]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          {/* Post Results */}
          {(searchFilter === 'all' || searchFilter === 'posts') &&
            searchResults.posts.length > 0 && (
              <View style={styles.searchSection}>
                <Text style={[styles.searchSectionTitle, { color: theme.text }]}>Posts</Text>
                {searchResults.posts.map((post) => renderPostCard(post))}
              </View>
            )}

          {/* No Results */}
          {searchResults.users.length === 0 &&
            searchResults.tags.length === 0 &&
            searchResults.posts.length === 0 && (
              <View style={styles.emptyState} testID="no-search-results">
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No results found for &quot;{searchQuery}&quot;
                </Text>
              </View>
            )}
        </View>
      ) : (
        /* Discover Section */
        <View>
          {/* Trending Tags */}
          <View style={styles.discoverSection}>
            <Text style={[styles.discoverTitle, { color: theme.text }]}>Trending</Text>
            <View style={styles.trendingTagsGrid}>
              {TRENDING_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.trendingTag, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}
                  onPress={() => setSearchQuery(tag)}
                  testID={`trending-${tag}`}
                >
                  <Text style={[styles.trendingTagText, { color: theme.primary }]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Discover Categories */}
          <View style={styles.discoverSection}>
            <Text style={[styles.discoverTitle, { color: theme.text }]}>Discover</Text>
            <View style={styles.categoriesGrid}>
              {DISCOVER_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: selectedCategory === cat.id ? cat.color + '20' : theme.surface,
                      borderColor: selectedCategory === cat.id ? cat.color : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  testID={`category-${cat.id}`}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  // ── Notifications Tab ─────────────────────────────────────────────────────

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.notifHeader}>
        <View style={styles.notifFilterRow}>
          {['all', 'unread'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.notifFilterBtn,
                { backgroundColor: notifFilter === filter ? theme.primary : theme.surface },
              ]}
              onPress={() => setNotifFilter(filter)}
              testID={`notif-filter-${filter}`}
            >
              <Text style={{ color: notifFilter === filter ? '#fff' : theme.textSecondary, fontSize: 13 }}>
                {filter === 'all' ? 'All' : `Unread (${unreadNotifCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {unreadNotifCount > 0 && (
          <TouchableOpacity onPress={markNotificationsRead} testID="mark-all-read">
            <Text style={[styles.markReadText, { color: theme.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyState} testID="empty-notifications">
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {notifFilter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </Text>
        </View>
      ) : (
        filteredNotifications.map((notif) => {
          const user = getUserById(notif.userId);
          const notifText =
            notif.type === 'like'
              ? 'liked your post'
              : notif.type === 'comment'
                ? `commented: "${notif.text}"`
                : notif.type === 'follow'
                  ? 'started following you'
                  : `${notif.text} in a post`;

          return (
            <View
              key={notif.id}
              style={[
                styles.notifItem,
                {
                  backgroundColor: notif.read ? theme.card : theme.primaryLight,
                  borderBottomColor: theme.border,
                },
              ]}
              testID={`notif-${notif.id}`}
            >
              <TouchableOpacity onPress={() => navigateToProfile(notif.userId)}>
                {renderAvatar(user, 40)}
              </TouchableOpacity>
              <View style={styles.notifContent}>
                <Text style={[styles.notifText, { color: theme.text }]}>
                  <Text style={styles.notifBold}>{user.displayName}</Text> {notifText}
                </Text>
                <Text style={[styles.notifTime, { color: theme.textSecondary }]}>
                  {formatTimestamp(notif.timestamp)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteNotification(notif.id)}
                testID={`delete-notif-${notif.id}`}
              >
                <Text style={{ color: theme.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );

  // ── Messages Tab ──────────────────────────────────────────────────────────

  const renderMessagesTab = () => (
    <View style={styles.tabContent}>
      {activeConversation ? (
        // Active conversation view
        <View style={styles.conversationView}>
          <TouchableOpacity
            style={styles.convBackBtn}
            onPress={() => setActiveConversation(null)}
            testID="back-to-messages"
          >
            <Text style={{ color: theme.primary, fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          {(() => {
            const conv = conversations.find((c) => c.id === activeConversation);
            if (!conv) return null;
            const user = getUserById(conv.userId);
            return (
              <View>
                <View style={[styles.convHeader, { borderBottomColor: theme.border }]}>
                  {renderAvatar(user, 44)}
                  <View style={styles.convHeaderInfo}>
                    <Text style={[styles.convHeaderName, { color: theme.text }]}>{user.displayName}</Text>
                    <Text style={[styles.convHeaderStatus, { color: theme.success }]}>Online</Text>
                  </View>
                </View>
                <View style={[styles.messageBubble, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.messageText, { color: theme.text }]}>{conv.lastMessage}</Text>
                  <Text style={[styles.messageTime, { color: theme.textSecondary }]}>
                    {formatTimestamp(conv.timestamp)}
                  </Text>
                </View>
                <View style={styles.messageInputRow}>
                  <TextInput
                    style={[
                      styles.messageInput,
                      { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border },
                    ]}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.textSecondary}
                    value={messageInput}
                    onChangeText={setMessageInput}
                    testID="message-input"
                  />
                  <TouchableOpacity
                    style={[styles.messageSendBtn, { backgroundColor: theme.primary }]}
                    onPress={sendMessage}
                    testID="send-message"
                  >
                    <Text style={styles.messageSendText}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
        </View>
      ) : (
        // Conversations list
        <View>
          <View style={[styles.messageSearchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.messageSearchInput, { color: theme.text }]}
              placeholder="Search messages..."
              placeholderTextColor={theme.textSecondary}
              value={messageSearchQuery}
              onChangeText={setMessageSearchQuery}
              testID="message-search-input"
            />
          </View>

          {filteredConversations.length === 0 ? (
            <View style={styles.emptyState} testID="empty-messages">
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No conversations found</Text>
            </View>
          ) : (
            filteredConversations.map((conv) => {
              const user = getUserById(conv.userId);
              return (
                <TouchableOpacity
                  key={conv.id}
                  style={[styles.convItem, { borderBottomColor: theme.border }]}
                  onPress={() => openConversation(conv.id)}
                  testID={`conv-${conv.id}`}
                >
                  {renderAvatar(user, 48)}
                  <View style={styles.convInfo}>
                    <Text style={[styles.convName, { color: theme.text }]}>{user.displayName}</Text>
                    <Text
                      style={[
                        styles.convLastMsg,
                        { color: conv.unreadCount > 0 ? theme.text : theme.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {conv.lastMessage}
                    </Text>
                  </View>
                  <View style={styles.convMeta}>
                    <Text style={[styles.convTime, { color: theme.textSecondary }]}>
                      {formatTimestamp(conv.timestamp)}
                    </Text>
                    {conv.unreadCount > 0 && (
                      <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );

  // ── Profile Tab ───────────────────────────────────────────────────────────

  const renderProfileTab = () => {
    const profileUser = viewingProfile ? getUserById(viewingProfile) : CURRENT_USER;
    const isOwnProfile = !viewingProfile;

    return (
      <View style={styles.tabContent}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {!isOwnProfile && (
            <TouchableOpacity
              style={styles.profileBackBtn}
              onPress={() => {
                setViewingProfile(null);
                setActiveTab('feed');
              }}
              testID="profile-back"
            >
              <Text style={{ color: theme.primary }}>← Back</Text>
            </TouchableOpacity>
          )}
          {renderAvatar(profileUser, 80)}
          <Text style={[styles.profileDisplayName, { color: theme.text }]}>
            {profileUser.displayName}
            {profileUser.verified && renderVerifiedBadge()}
          </Text>
          <Text style={[styles.profileUsername, { color: theme.textSecondary }]}>
            @{profileUser.username}
          </Text>
          {isOwnProfile && (
            <Text style={[styles.profileBio, { color: theme.textSecondary }]}>{CURRENT_USER.bio}</Text>
          )}

          {/* Stats Row */}
          <View style={styles.profileStats}>
            <View style={styles.profileStatItem}>
              <Text style={[styles.profileStatNum, { color: theme.text }]}>
                {isOwnProfile ? CURRENT_USER.postsCount : userPosts.length}
              </Text>
              <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Posts</Text>
            </View>
            <View style={styles.profileStatItem}>
              <Text style={[styles.profileStatNum, { color: theme.text }]}>
                {isOwnProfile ? formatCount(CURRENT_USER.followersCount) : '—'}
              </Text>
              <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Followers</Text>
            </View>
            <View style={styles.profileStatItem}>
              <Text style={[styles.profileStatNum, { color: theme.text }]}>
                {isOwnProfile ? formatCount(CURRENT_USER.followingCount) : '—'}
              </Text>
              <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Following</Text>
            </View>
          </View>

          {/* Follow / Edit Profile Button */}
          {isOwnProfile ? (
            <TouchableOpacity
              style={[styles.editProfileBtn, { borderColor: theme.border }]}
              onPress={() => setActiveTab('settings')}
              testID="edit-profile-btn"
            >
              <Text style={[styles.editProfileText, { color: theme.text }]}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.followProfileBtn,
                { backgroundColor: following[viewingProfile] ? theme.surface : theme.primary },
              ]}
              onPress={() => toggleFollow(viewingProfile)}
              testID="follow-profile-btn"
            >
              <Text style={{ color: following[viewingProfile] ? theme.text : '#fff' }}>
                {following[viewingProfile] ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Content Tabs */}
        {isOwnProfile && (
          <View style={styles.profileTabRow}>
            {['posts', 'bookmarks', 'likes'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.profileTabBtn,
                  profileTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
                ]}
                onPress={() => setProfileTab(tab)}
                testID={`profile-tab-${tab}`}
              >
                <Text
                  style={[
                    styles.profileTabText,
                    { color: profileTab === tab ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Profile Posts */}
        {(() => {
          let displayPosts = userPosts;
          if (isOwnProfile) {
            if (profileTab === 'bookmarks') displayPosts = bookmarkedPostsList;
            else if (profileTab === 'likes') displayPosts = likedPostsList;
          }

          return displayPosts.length === 0 ? (
            <View style={styles.emptyState} testID="empty-profile-posts">
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {profileTab === 'bookmarks'
                  ? 'No bookmarked posts yet'
                  : profileTab === 'likes'
                    ? 'No liked posts yet'
                    : 'No posts yet'}
              </Text>
            </View>
          ) : (
            displayPosts.map((post) => renderPostCard(post))
          );
        })()}
      </View>
    );
  };

  // ── Settings Tab ──────────────────────────────────────────────────────────

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.settingsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingsTitle, { color: theme.text }]}>Appearance</Text>
        <View style={styles.settingsRow}>
          <Text style={[styles.settingsLabel, { color: theme.text }]}>Dark Mode</Text>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              { backgroundColor: darkMode ? theme.primary : theme.border },
            ]}
            onPress={() => setDarkMode((prev) => !prev)}
            testID="dark-mode-toggle"
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  transform: [{ translateX: darkMode ? 20 : 0 }],
                  backgroundColor: '#fff',
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingsTitle, { color: theme.text }]}>Privacy</Text>
        <View style={styles.settingsRow}>
          <Text style={[styles.settingsLabel, { color: theme.text }]}>Private Account</Text>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              { backgroundColor: privateAccount ? theme.primary : theme.border },
            ]}
            onPress={() => setPrivateAccount((prev) => !prev)}
            testID="private-toggle"
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  transform: [{ translateX: privateAccount ? 20 : 0 }],
                  backgroundColor: '#fff',
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingsTitle, { color: theme.text }]}>Notifications</Text>
        <View style={styles.settingsRow}>
          <Text style={[styles.settingsLabel, { color: theme.text }]}>Push Notifications</Text>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              { backgroundColor: notificationsEnabled ? theme.primary : theme.border },
            ]}
            onPress={() => setNotificationsEnabled((prev) => !prev)}
            testID="notifications-toggle"
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  transform: [{ translateX: notificationsEnabled ? 20 : 0 }],
                  backgroundColor: '#fff',
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.settingsTitle, { color: theme.text }]}>Account</Text>
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?')}
          testID="logout-btn"
        >
          <Text style={[styles.settingsLabel, { color: theme.danger }]}>Log Out</Text>
          <Text style={{ color: theme.danger }}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Create Post Modal ─────────────────────────────────────────────────────

  const renderCreatePostModal = () => (
    <Modal
      visible={createPostOpen}
      animationType="slide"
      transparent
      onRequestClose={() => setCreatePostOpen(false)}
    >
      <View style={[styles.modalOverlay]}>
        <View style={[styles.createPostModal, { backgroundColor: theme.card }]} testID="create-post-modal">
          <View style={styles.createPostHeader}>
            <TouchableOpacity onPress={() => setCreatePostOpen(false)} testID="close-create-post">
              <Text style={{ color: theme.textSecondary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.createPostTitle, { color: theme.text }]}>New Post</Text>
            <TouchableOpacity
              onPress={createPost}
              disabled={!newPostContent.trim()}
              testID="submit-post"
            >
              <Text
                style={{
                  color: newPostContent.trim() ? theme.primary : theme.textSecondary,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Post
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createPostBody}>
            {renderAvatar(CURRENT_USER, 40)}
            <TextInput
              style={[styles.createPostInput, { color: theme.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.textSecondary}
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
              testID="new-post-input"
              autoFocus
            />
          </View>

          {/* Emoji Picker */}
          <View style={styles.emojiPickerRow}>
            <Text style={[styles.emojiPickerLabel, { color: theme.textSecondary }]}>Post icon:</Text>
            {['📝', '📸', '🎨', '💻', '🏃', '🍕', '✈️', '🎵'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiOption,
                  newPostEmoji === emoji && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                ]}
                onPress={() => setNewPostEmoji(emoji)}
                testID={`emoji-${emoji}`}
              >
                <Text style={{ fontSize: 20 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.charCount, { color: theme.textSecondary }]}>
            {newPostContent.length}/500
          </Text>
        </View>
      </View>
    </Modal>
  );

  // ── Story Viewer Modal ────────────────────────────────────────────────────

  const renderStoryViewer = () => {
    const story = STORIES.find((s) => s.id === activeStoryId);
    if (!story) return null;
    const user = getUserById(story.userId);

    return (
      <Modal
        visible={storyViewerOpen}
        animationType="fade"
        transparent
        onRequestClose={closeStoryViewer}
      >
        <View style={[styles.storyViewerOverlay]} testID="story-viewer">
          <View style={styles.storyViewerHeader}>
            {renderAvatar(user, 36)}
            <Text style={styles.storyViewerName}>{user.displayName}</Text>
            <TouchableOpacity onPress={closeStoryViewer} testID="close-story">
              <Text style={styles.storyCloseBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.storyContent}>
            <Text style={styles.storyPlaceholder}>📷 Story Content</Text>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Bottom Tab Bar ────────────────────────────────────────────────────────

  const tabs = [
    { id: 'feed', icon: '🏠', label: 'Home' },
    { id: 'search', icon: '🔍', label: 'Discover' },
    { id: 'create', icon: '➕', label: 'Create' },
    { id: 'notifications', icon: '🔔', label: 'Alerts', badge: unreadNotifCount },
    { id: 'messages', icon: '💬', label: 'Messages', badge: unreadMessageCount },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  // ── Main Render ───────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]} testID="home-screen">
      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => setSideMenuOpen(true)} testID="menu-btn">
          <Text style={{ fontSize: 20 }}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.appTitle, { color: theme.text }]}>SocialHub</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setDarkMode((prev) => !prev)}
            testID="header-theme-toggle"
          >
            <Text style={{ fontSize: 18 }}>{darkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Menu Overlay */}
      {sideMenuOpen && (
        <Pressable
          style={styles.sideMenuOverlay}
          onPress={() => setSideMenuOpen(false)}
          testID="side-menu-overlay"
        >
          <View style={[styles.sideMenu, { backgroundColor: theme.card }]} testID="side-menu">
            <View style={styles.sideMenuHeader}>
              {renderAvatar(CURRENT_USER, 56)}
              <Text style={[styles.sideMenuName, { color: theme.text }]}>{CURRENT_USER.displayName}</Text>
              <Text style={[styles.sideMenuUsername, { color: theme.textSecondary }]}>
                @{CURRENT_USER.username}
              </Text>
            </View>
            {[
              { label: 'Profile', tab: 'profile', icon: '👤' },
              { label: 'Bookmarks', tab: 'profile', icon: '🔖', action: () => { setProfileTab('bookmarks'); setViewingProfile(null); } },
              { label: 'Settings', tab: 'settings', icon: '⚙️' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.sideMenuItem}
                onPress={() => {
                  if (item.action) item.action();
                  setActiveTab(item.tab);
                  setSideMenuOpen(false);
                }}
                testID={`menu-${item.label.toLowerCase()}`}
              >
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      )}

      {/* Main Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentInner}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'feed' && renderFeedTab()}
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'messages' && renderMessagesTab()}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'create' && createPostOpen);
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => {
                if (tab.id === 'create') {
                  setCreatePostOpen(true);
                } else {
                  if (tab.id === 'profile') setViewingProfile(null);
                  setActiveTab(tab.id);
                }
              }}
              testID={`tab-${tab.id}`}
            >
              <View style={styles.tabIconContainer}>
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
                {tab.badge > 0 && (
                  <View style={[styles.tabBadge, { backgroundColor: theme.danger }]}>
                    <Text style={styles.tabBadgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.primary : theme.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modals */}
      {renderCreatePostModal()}
      {renderStoryViewer()}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  appTitle: { fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 12 },

  // Side Menu
  sideMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  sideMenu: {
    width: 280,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
  },
  sideMenuHeader: { marginBottom: 24 },
  sideMenuName: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  sideMenuUsername: { fontSize: 14, marginTop: 2 },
  sideMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  sideMenuItemText: { fontSize: 16 },

  // Avatars
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '600' },
  verifiedBadge: { color: '#3b82f6', fontSize: 12, marginLeft: 4, fontWeight: '700' },

  // Stories
  storiesContainer: { borderBottomWidth: 1, paddingVertical: 12 },
  storiesScroll: { paddingHorizontal: 12, gap: 12 },
  storyItem: { alignItems: 'center', width: 72 },
  storyRing: { borderRadius: 32, padding: 2 },
  storyLabel: { fontSize: 11, marginTop: 4 },

  // Feed
  tabContent: { paddingBottom: 20 },
  feedFilterRow: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  feedFilterBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  feedFilterText: { fontSize: 13, fontWeight: '500' },

  // Posts
  postCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  postAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postAuthorInfo: {},
  authorNameRow: { flexDirection: 'row', alignItems: 'center' },
  postAuthorName: { fontSize: 14, fontWeight: '600' },
  postTimestamp: { fontSize: 12, marginTop: 1 },
  postMenuBtn: { padding: 4 },
  postContent: { paddingHorizontal: 12, paddingBottom: 8, fontSize: 14, lineHeight: 20 },
  postImage: { height: 200, alignItems: 'center', justifyContent: 'center', marginHorizontal: 12, borderRadius: 8 },
  postImageEmoji: { fontSize: 64 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 4, gap: 8 },
  tagText: { fontSize: 13, fontWeight: '500' },
  engagementRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, marginHorizontal: 12 },
  engagementText: { fontSize: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  actionLabel: { fontSize: 12 },

  // Comments
  commentsSection: { borderTopWidth: 1, padding: 12 },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  commentContent: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '600' },
  commentText: { fontSize: 13, marginTop: 2 },
  commentTime: { fontSize: 11, marginTop: 4 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  commentInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, fontSize: 13 },
  commentSendBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  commentSendText: { color: '#fff', fontSize: 16 },

  // Search
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  searchFilterRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 8, gap: 8 },
  searchFilterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  searchSection: { marginTop: 16, paddingHorizontal: 16 },
  searchSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  searchUserItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  searchUserInfo: { flex: 1 },
  searchUserName: { fontSize: 14, fontWeight: '500' },
  searchUsername: { fontSize: 12, marginTop: 2 },
  followBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  searchTagItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  searchTagText: { fontSize: 14, fontWeight: '500' },

  // Discover
  discoverSection: { marginTop: 20, paddingHorizontal: 16 },
  discoverTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  trendingTagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trendingTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  trendingTagText: { fontSize: 13, fontWeight: '500' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryEmoji: { fontSize: 28 },
  categoryName: { fontSize: 13, fontWeight: '500', marginTop: 6 },

  // Notifications
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notifFilterRow: { flexDirection: 'row', gap: 8 },
  notifFilterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  markReadText: { fontSize: 13, fontWeight: '500' },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  notifContent: { flex: 1 },
  notifText: { fontSize: 13, lineHeight: 18 },
  notifBold: { fontWeight: '600' },
  notifTime: { fontSize: 11, marginTop: 4 },

  // Messages
  messageSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  messageSearchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  convInfo: { flex: 1 },
  convName: { fontSize: 15, fontWeight: '500' },
  convLastMsg: { fontSize: 13, marginTop: 2 },
  convMeta: { alignItems: 'flex-end' },
  convTime: { fontSize: 11 },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  unreadBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  conversationView: { paddingHorizontal: 16 },
  convBackBtn: { paddingVertical: 8 },
  convHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  convHeaderInfo: {},
  convHeaderName: { fontSize: 16, fontWeight: '600' },
  convHeaderStatus: { fontSize: 12, marginTop: 2 },
  messageBubble: { padding: 12, borderRadius: 12, marginVertical: 12, maxWidth: '70%' },
  messageText: { fontSize: 14 },
  messageTime: { fontSize: 11, marginTop: 4 },
  messageInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  messageInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  messageSendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  messageSendText: { color: '#fff', fontSize: 18 },

  // Profile
  profileHeader: { padding: 20, alignItems: 'center', borderBottomWidth: 1 },
  profileBackBtn: { alignSelf: 'flex-start', marginBottom: 12 },
  profileDisplayName: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  profileUsername: { fontSize: 14, marginTop: 4 },
  profileBio: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  profileStats: { flexDirection: 'row', marginTop: 16, gap: 32 },
  profileStatItem: { alignItems: 'center' },
  profileStatNum: { fontSize: 18, fontWeight: '700' },
  profileStatLabel: { fontSize: 12, marginTop: 2 },
  editProfileBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  editProfileText: { fontWeight: '500' },
  followProfileBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 },
  profileTabRow: { flexDirection: 'row', marginTop: 8 },
  profileTabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  profileTabText: { fontSize: 14, fontWeight: '500' },

  // Settings
  settingsSection: { marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  settingsTitle: { fontSize: 14, fontWeight: '600', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsLabel: { fontSize: 15 },
  toggleBtn: { width: 44, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10 },

  // Create Post Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  createPostModal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  createPostHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  createPostTitle: { fontSize: 17, fontWeight: '600' },
  createPostBody: { flexDirection: 'row', gap: 12 },
  createPostInput: { flex: 1, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  emojiPickerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8, flexWrap: 'wrap' },
  emojiPickerLabel: { fontSize: 13 },
  emojiOption: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 8 },

  // Story Viewer
  storyViewerOverlay: { flex: 1, backgroundColor: '#000' },
  storyViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  storyViewerName: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '500' },
  storyCloseBtn: { color: '#fff', fontSize: 20 },
  storyContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  storyPlaceholder: { color: '#fff', fontSize: 48 },

  // Tab Bar
  mainContent: { flex: 1 },
  mainContentInner: { paddingBottom: 80 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 24 : 8, paddingTop: 8 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIconContainer: { position: 'relative' },
  tabIcon: { fontSize: 22, opacity: 0.6 },
  tabIconActive: { opacity: 1 },
  tabBadge: { position: 'absolute', top: -4, right: -8, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  tabLabel: { fontSize: 10, marginTop: 2 },

  // Empty States
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14 },
});
