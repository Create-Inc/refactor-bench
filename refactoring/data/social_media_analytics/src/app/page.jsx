"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const PLATFORMS = ["Twitter", "Instagram", "LinkedIn", "Facebook", "TikTok"];

const INITIAL_POSTS = [
  {
    id: 1,
    platform: "Twitter",
    content: "Excited to announce our new product launch! #startup #tech",
    publishedAt: "2025-04-01T10:00:00Z",
    likes: 342,
    shares: 89,
    comments: 47,
    impressions: 12400,
    status: "published",
    tags: ["product", "announcement"],
  },
  {
    id: 2,
    platform: "Instagram",
    content: "Behind the scenes of our team retreat",
    publishedAt: "2025-04-02T14:30:00Z",
    likes: 891,
    shares: 23,
    comments: 156,
    impressions: 34200,
    status: "published",
    tags: ["team", "culture"],
  },
  {
    id: 3,
    platform: "LinkedIn",
    content:
      "We're hiring! Looking for talented engineers to join our growing team.",
    publishedAt: "2025-04-03T09:00:00Z",
    likes: 567,
    shares: 234,
    comments: 89,
    impressions: 45600,
    status: "published",
    tags: ["hiring", "careers"],
  },
  {
    id: 4,
    platform: "Facebook",
    content: "Customer spotlight: How Company X increased revenue by 200%",
    publishedAt: "2025-04-04T11:00:00Z",
    likes: 234,
    shares: 67,
    comments: 34,
    impressions: 8900,
    status: "published",
    tags: ["case-study", "customers"],
  },
  {
    id: 5,
    platform: "TikTok",
    content: "Day in the life at our startup office",
    publishedAt: "2025-04-05T16:00:00Z",
    likes: 2340,
    shares: 567,
    comments: 890,
    impressions: 123000,
    status: "published",
    tags: ["culture", "office"],
  },
  {
    id: 6,
    platform: "Twitter",
    content: "Tips for scaling your SaaS business in 2025",
    publishedAt: null,
    likes: 0,
    shares: 0,
    comments: 0,
    impressions: 0,
    status: "draft",
    tags: ["tips", "saas"],
  },
  {
    id: 7,
    platform: "Instagram",
    content: "New feature drop: Real-time collaboration tools",
    publishedAt: null,
    likes: 0,
    shares: 0,
    comments: 0,
    impressions: 0,
    status: "scheduled",
    scheduledFor: "2025-04-10T12:00:00Z",
    tags: ["product", "feature"],
  },
  {
    id: 8,
    platform: "LinkedIn",
    content: "Our Q1 2025 growth report is out. Key takeaways inside.",
    publishedAt: "2025-03-28T08:00:00Z",
    likes: 1200,
    shares: 456,
    comments: 178,
    impressions: 67800,
    status: "published",
    tags: ["report", "growth"],
  },
  {
    id: 9,
    platform: "TikTok",
    content: "Reacting to our first ever product review!",
    publishedAt: "2025-04-06T18:00:00Z",
    likes: 5600,
    shares: 1200,
    comments: 2300,
    impressions: 456000,
    status: "published",
    tags: ["reaction", "product"],
  },
  {
    id: 10,
    platform: "Facebook",
    content: "Join us for a live Q&A session this Friday at 3 PM EST",
    publishedAt: null,
    likes: 0,
    shares: 0,
    comments: 0,
    impressions: 0,
    status: "scheduled",
    scheduledFor: "2025-04-11T15:00:00Z",
    tags: ["event", "live"],
  },
];

const FOLLOWER_DATA = [
  { date: "2025-03-01", Twitter: 12400, Instagram: 8900, LinkedIn: 5600, Facebook: 3200, TikTok: 15600 },
  { date: "2025-03-08", Twitter: 12800, Instagram: 9200, LinkedIn: 5800, Facebook: 3300, TikTok: 16800 },
  { date: "2025-03-15", Twitter: 13100, Instagram: 9600, LinkedIn: 6100, Facebook: 3400, TikTok: 18200 },
  { date: "2025-03-22", Twitter: 13500, Instagram: 10100, LinkedIn: 6300, Facebook: 3500, TikTok: 19800 },
  { date: "2025-03-29", Twitter: 14200, Instagram: 10800, LinkedIn: 6700, Facebook: 3700, TikTok: 22100 },
  { date: "2025-04-05", Twitter: 14900, Instagram: 11500, LinkedIn: 7100, Facebook: 3900, TikTok: 25000 },
];

const ENGAGEMENT_RATES = {
  Twitter: 4.2,
  Instagram: 6.8,
  LinkedIn: 3.1,
  Facebook: 2.5,
  TikTok: 9.4,
};

const AUDIENCE_DEMOGRAPHICS = {
  ageGroups: [
    { range: "18-24", percentage: 28 },
    { range: "25-34", percentage: 35 },
    { range: "35-44", percentage: 20 },
    { range: "45-54", percentage: 12 },
    { range: "55+", percentage: 5 },
  ],
  topLocations: [
    { city: "New York", count: 4500 },
    { city: "San Francisco", count: 3200 },
    { city: "London", count: 2800 },
    { city: "Toronto", count: 2100 },
    { city: "Berlin", count: 1900 },
  ],
  peakHours: [9, 12, 17, 20],
};

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "milestone", message: "You reached 25,000 followers on TikTok!", read: false, createdAt: "2025-04-05T10:00:00Z" },
  { id: 2, type: "alert", message: "Engagement rate dropped 15% on Facebook this week", read: false, createdAt: "2025-04-05T08:00:00Z" },
  { id: 3, type: "suggestion", message: "Best time to post on Instagram: 12 PM EST", read: true, createdAt: "2025-04-04T16:00:00Z" },
  { id: 4, type: "milestone", message: "Your LinkedIn post got 1,000+ shares!", read: true, createdAt: "2025-04-03T14:00:00Z" },
  { id: 5, type: "alert", message: "Scheduled post for Facebook failed to publish", read: false, createdAt: "2025-04-05T12:00:00Z" },
];

// ─── Utility Functions ───────────────────────────────────────────────────────

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getEngagementScore(post) {
  return post.likes + post.shares * 2 + post.comments * 3;
}

function getPlatformColor(platform) {
  const colors = {
    Twitter: "#1DA1F2",
    Instagram: "#E1306C",
    LinkedIn: "#0077B5",
    Facebook: "#4267B2",
    TikTok: "#000000",
  };
  return colors[platform] || "#666";
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SocialMediaDashboard() {
  // ── Navigation & UI State ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // ── Data State ───────────────────────────────────────────────────────────
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [postSortField, setPostSortField] = useState("publishedAt");
  const [postSortDirection, setPostSortDirection] = useState("desc");

  // ── Modal State ──────────────────────────────────────────────────────────
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [, setShowSchedulerModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // ── Create Post Form State ───────────────────────────────────────────────
  const [newPostPlatform, setNewPostPlatform] = useState("Twitter");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [newPostScheduleDate, setNewPostScheduleDate] = useState("");

  // ── Settings State ───────────────────────────────────────────────────────
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [compactView, setCompactView] = useState(false);

  // ── localStorage persistence ─────────────────────────────────────────────
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("sma_darkMode");
    if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
    const savedCompact = localStorage.getItem("sma_compactView");
    if (savedCompact !== null) setCompactView(JSON.parse(savedCompact));
  }, []);

  useEffect(() => {
    localStorage.setItem("sma_darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("sma_compactView", JSON.stringify(compactView));
  }, [compactView]);

  // ── Keyboard Shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        setShowCreatePostModal(true);
      }
      if (e.key === "Escape") {
        setShowCreatePostModal(false);
        setShowPostDetailModal(false);
        setShowNotificationsPanel(false);
        setShowSchedulerModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Computed Values ──────────────────────────────────────────────────────

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (selectedPlatformFilter !== "all") {
      result = result.filter((p) => p.platform === selectedPlatformFilter);
    }
    if (selectedStatusFilter !== "all") {
      result = result.filter((p) => p.status === selectedStatusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.platform.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let aVal, bVal;
      if (postSortField === "publishedAt") {
        aVal = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        bVal = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      } else if (postSortField === "engagement") {
        aVal = getEngagementScore(a);
        bVal = getEngagementScore(b);
      } else if (postSortField === "impressions") {
        aVal = a.impressions;
        bVal = b.impressions;
      }
      return postSortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [posts, selectedPlatformFilter, selectedStatusFilter, searchQuery, postSortField, postSortDirection]);

  const totalFollowers = useMemo(() => {
    const latest = FOLLOWER_DATA[FOLLOWER_DATA.length - 1];
    return PLATFORMS.reduce((sum, p) => sum + latest[p], 0);
  }, []);

  const followerGrowth = useMemo(() => {
    const latest = FOLLOWER_DATA[FOLLOWER_DATA.length - 1];
    const previous = FOLLOWER_DATA[FOLLOWER_DATA.length - 2];
    const latestTotal = PLATFORMS.reduce((sum, p) => sum + latest[p], 0);
    const previousTotal = PLATFORMS.reduce((sum, p) => sum + previous[p], 0);
    return (((latestTotal - previousTotal) / previousTotal) * 100).toFixed(1);
  }, []);

  const totalEngagement = useMemo(() => {
    return posts
      .filter((p) => p.status === "published")
      .reduce((sum, p) => sum + p.likes + p.shares + p.comments, 0);
  }, [posts]);

  const totalImpressions = useMemo(() => {
    return posts
      .filter((p) => p.status === "published")
      .reduce((sum, p) => sum + p.impressions, 0);
  }, [posts]);

  const avgEngagementRate = useMemo(() => {
    const rates = Object.values(ENGAGEMENT_RATES);
    return (rates.reduce((s, r) => s + r, 0) / rates.length).toFixed(1);
  }, []);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const topPerformingPost = useMemo(() => {
    const published = posts.filter((p) => p.status === "published");
    if (published.length === 0) return null;
    return published.reduce((best, p) =>
      getEngagementScore(p) > getEngagementScore(best) ? p : best
    );
  }, [posts]);

  const platformBreakdown = useMemo(() => {
    const published = posts.filter((p) => p.status === "published");
    return PLATFORMS.map((platform) => {
      const platformPosts = published.filter((p) => p.platform === platform);
      const totalEng = platformPosts.reduce(
        (sum, p) => sum + p.likes + p.shares + p.comments,
        0
      );
      return {
        platform,
        postCount: platformPosts.length,
        totalEngagement: totalEng,
        avgEngagement: platformPosts.length > 0 ? Math.round(totalEng / platformPosts.length) : 0,
        rate: ENGAGEMENT_RATES[platform],
      };
    });
  }, [posts]);

  // ── Event Handlers ─────────────────────────────────────────────────────

  const handleCreatePost = useCallback(() => {
    if (!newPostContent.trim()) return;
    const newPost = {
      id: Math.max(...posts.map((p) => p.id)) + 1,
      platform: newPostPlatform,
      content: newPostContent.trim(),
      publishedAt: newPostScheduleDate ? null : new Date().toISOString(),
      likes: 0,
      shares: 0,
      comments: 0,
      impressions: 0,
      status: newPostScheduleDate ? "scheduled" : "published",
      scheduledFor: newPostScheduleDate || undefined,
      tags: newPostTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    setPosts((prev) => [...prev, newPost]);
    setNewPostPlatform("Twitter");
    setNewPostContent("");
    setNewPostTags("");
    setNewPostScheduleDate("");
    setShowCreatePostModal(false);
  }, [posts, newPostPlatform, newPostContent, newPostTags, newPostScheduleDate]);

  const handleDeletePost = useCallback(
    (postId) => {
      if (window.confirm("Are you sure you want to delete this post?")) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        if (selectedPost?.id === postId) {
          setShowPostDetailModal(false);
          setSelectedPost(null);
        }
      }
    },
    [selectedPost]
  );

  const handleEditPost = useCallback(
    (postId, updates) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updates } : p))
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => ({ ...prev, ...updates }));
      }
      setEditingPost(null);
    },
    [selectedPost]
  );

  const handlePublishDraft = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, status: "published", publishedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const handleMarkNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleDismissNotification = useCallback((notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  }, []);

  const handleExportAnalytics = useCallback(() => {
    const headers = ["Platform", "Posts", "Total Engagement", "Avg Engagement", "Engagement Rate"];
    const rows = platformBreakdown.map((pb) => [
      pb.platform,
      pb.postCount,
      pb.totalEngagement,
      pb.avgEngagement,
      pb.rate + "%",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "social_analytics_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [platformBreakdown]);

  const handleOpenPostDetail = useCallback((post) => {
    setSelectedPost(post);
    setShowPostDetailModal(true);
  }, []);

  // ── Styles ─────────────────────────────────────────────────────────────

  const theme = darkMode
    ? { bg: "#1a1a2e", surface: "#16213e", text: "#e0e0e0", textSecondary: "#a0a0a0", border: "#2a2a4a", accent: "#4fc3f7", danger: "#ef5350", success: "#66bb6a", warning: "#ffa726" }
    : { bg: "#f5f7fa", surface: "#ffffff", text: "#1a1a2e", textSecondary: "#666", border: "#e0e0e0", accent: "#1976d2", danger: "#d32f2f", success: "#388e3c", warning: "#f57c00" };

  const containerStyle = {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: theme.bg,
    color: theme.text,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const sidebarStyle = {
    width: sidebarCollapsed ? "60px" : "240px",
    backgroundColor: theme.surface,
    borderRight: `1px solid ${theme.border}`,
    padding: sidebarCollapsed ? "16px 8px" : "16px",
    transition: "width 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flexShrink: 0,
  };

  const mainContentStyle = {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  };

  const cardStyle = {
    backgroundColor: theme.surface,
    borderRadius: "12px",
    padding: compactView ? "12px" : "20px",
    border: `1px solid ${theme.border}`,
    marginBottom: "16px",
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    backgroundColor: theme.accent,
    color: "#fff",
  };

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: theme.surface,
    borderRadius: "16px",
    padding: "24px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
    border: `1px solid ${theme.border}`,
  };

  // ── Render: Sidebar ────────────────────────────────────────────────────

  const navItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "posts", label: "Posts", icon: "📝" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "audience", label: "Audience", icon: "👥" },
    { id: "scheduler", label: "Scheduler", icon: "📅" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const renderSidebar = () => (
    <nav style={sidebarStyle} aria-label="Main navigation">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        {!sidebarCollapsed && (
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>SocialPulse</h2>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ ...buttonStyle, padding: "4px 8px", fontSize: "12px", backgroundColor: "transparent", color: theme.text }}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? "▶" : "◀"}
        </button>
      </div>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          aria-current={activeTab === item.id ? "page" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            fontSize: "14px",
            fontWeight: activeTab === item.id ? 600 : 400,
            backgroundColor: activeTab === item.id ? theme.accent + "22" : "transparent",
            color: activeTab === item.id ? theme.accent : theme.text,
          }}
        >
          <span>{item.icon}</span>
          {!sidebarCollapsed && <span>{item.label}</span>}
        </button>
      ))}
    </nav>
  );

  // ── Render: Header ─────────────────────────────────────────────────────

  const renderHeader = () => (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
          {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
        </h1>
        <p style={{ margin: "4px 0 0", color: theme.textSecondary, fontSize: "14px" }}>
          {activeTab === "overview" && "Your social media performance at a glance"}
          {activeTab === "posts" && "Manage and track all your posts"}
          {activeTab === "analytics" && "Deep dive into your metrics"}
          {activeTab === "audience" && "Understand your audience"}
          {activeTab === "scheduler" && "Plan and schedule content"}
          {activeTab === "settings" && "Configure your dashboard"}
        </p>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search posts... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, width: "220px" }}
            aria-label="Search posts"
          />
        </div>
        <button
          onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
          style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, position: "relative" }}
          aria-label="Toggle notifications"
        >
          🔔
          {unreadNotifications > 0 && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                backgroundColor: theme.danger,
                color: "#fff",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadNotifications}
            </span>
          )}
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button
          onClick={() => setShowCreatePostModal(true)}
          style={buttonStyle}
          aria-label="Create new post"
        >
          + New Post
        </button>
      </div>
    </header>
  );

  // ── Render: Overview Tab ───────────────────────────────────────────────

  const renderOverview = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={cardStyle}>
          <p style={{ margin: 0, color: theme.textSecondary, fontSize: "13px" }}>Total Followers</p>
          <p style={{ margin: "8px 0 0", fontSize: "28px", fontWeight: 700 }}>{formatNumber(totalFollowers)}</p>
          <p style={{ margin: "4px 0 0", color: theme.success, fontSize: "13px" }}>+{followerGrowth}% this week</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: 0, color: theme.textSecondary, fontSize: "13px" }}>Total Engagement</p>
          <p style={{ margin: "8px 0 0", fontSize: "28px", fontWeight: 700 }}>{formatNumber(totalEngagement)}</p>
          <p style={{ margin: "4px 0 0", color: theme.textSecondary, fontSize: "13px" }}>Likes + Shares + Comments</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: 0, color: theme.textSecondary, fontSize: "13px" }}>Total Impressions</p>
          <p style={{ margin: "8px 0 0", fontSize: "28px", fontWeight: 700 }}>{formatNumber(totalImpressions)}</p>
          <p style={{ margin: "4px 0 0", color: theme.textSecondary, fontSize: "13px" }}>Across all platforms</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: 0, color: theme.textSecondary, fontSize: "13px" }}>Avg Engagement Rate</p>
          <p style={{ margin: "8px 0 0", fontSize: "28px", fontWeight: 700 }}>{avgEngagementRate}%</p>
          <p style={{ margin: "4px 0 0", color: theme.textSecondary, fontSize: "13px" }}>Across platforms</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Follower Growth</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FOLLOWER_DATA.map((entry, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < FOLLOWER_DATA.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                <span style={{ fontSize: "13px", color: theme.textSecondary }}>{formatDate(entry.date)}</span>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  {formatNumber(PLATFORMS.reduce((sum, p) => sum + entry[p], 0))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Top Performing Post</h3>
          {topPerformingPost ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ backgroundColor: getPlatformColor(topPerformingPost.platform), color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                  {topPerformingPost.platform}
                </span>
                <span style={{ fontSize: "12px", color: theme.textSecondary }}>
                  {formatDate(topPerformingPost.publishedAt)}
                </span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: "14px" }}>{topPerformingPost.content}</p>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: theme.textSecondary }}>
                <span>❤️ {formatNumber(topPerformingPost.likes)}</span>
                <span>🔄 {formatNumber(topPerformingPost.shares)}</span>
                <span>💬 {formatNumber(topPerformingPost.comments)}</span>
                <span>👁 {formatNumber(topPerformingPost.impressions)}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: theme.textSecondary }}>No published posts yet</p>
          )}
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: "16px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Platform Breakdown</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
          {platformBreakdown.map((pb) => (
            <div key={pb.platform} style={{ textAlign: "center", padding: "12px", borderRadius: "8px", backgroundColor: theme.bg }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: getPlatformColor(pb.platform), margin: "0 auto 8px" }} />
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{pb.platform}</p>
              <p style={{ margin: "4px 0", fontSize: "20px", fontWeight: 700 }}>{pb.postCount}</p>
              <p style={{ margin: 0, fontSize: "12px", color: theme.textSecondary }}>posts</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: theme.success }}>{pb.rate}% eng.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Render: Posts Tab ──────────────────────────────────────────────────

  const renderPosts = () => (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={selectedPlatformFilter}
          onChange={(e) => setSelectedPlatformFilter(e.target.value)}
          style={inputStyle}
          aria-label="Filter by platform"
        >
          <option value="all">All Platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          style={inputStyle}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <select
          value={postSortField}
          onChange={(e) => setPostSortField(e.target.value)}
          style={inputStyle}
          aria-label="Sort by"
        >
          <option value="publishedAt">Date</option>
          <option value="engagement">Engagement</option>
          <option value="impressions">Impressions</option>
        </select>
        <button
          onClick={() => setPostSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
          style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, border: `1px solid ${theme.border}` }}
          aria-label={`Sort ${postSortDirection === "asc" ? "descending" : "ascending"}`}
        >
          {postSortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>

      <p style={{ margin: "0 0 12px", color: theme.textSecondary, fontSize: "13px" }}>
        Showing {filteredPosts.length} of {posts.length} posts
      </p>

      {filteredPosts.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "40px" }}>
          <p style={{ color: theme.textSecondary }}>No posts match your filters</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <div key={post.id} style={{ ...cardStyle, cursor: "pointer" }} onClick={() => handleOpenPostDetail(post)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ backgroundColor: getPlatformColor(post.platform), color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                    {post.platform}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      backgroundColor:
                        post.status === "published" ? theme.success + "22" :
                        post.status === "scheduled" ? theme.warning + "22" :
                        theme.textSecondary + "22",
                      color:
                        post.status === "published" ? theme.success :
                        post.status === "scheduled" ? theme.warning :
                        theme.textSecondary,
                    }}
                  >
                    {post.status}
                  </span>
                  {post.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: "11px", color: theme.accent, backgroundColor: theme.accent + "15", padding: "2px 6px", borderRadius: "6px" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
                <p style={{ margin: "0 0 8px", fontSize: "14px" }}>{post.content}</p>
                {post.status === "published" && (
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: theme.textSecondary }}>
                    <span>❤️ {formatNumber(post.likes)}</span>
                    <span>🔄 {formatNumber(post.shares)}</span>
                    <span>💬 {formatNumber(post.comments)}</span>
                    <span>👁 {formatNumber(post.impressions)}</span>
                  </div>
                )}
                {post.status === "scheduled" && post.scheduledFor && (
                  <p style={{ margin: 0, fontSize: "13px", color: theme.warning }}>
                    Scheduled for: {formatDate(post.scheduledFor)}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {post.status === "draft" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePublishDraft(post.id); }}
                    style={{ ...buttonStyle, backgroundColor: theme.success, fontSize: "12px", padding: "4px 10px" }}
                  >
                    Publish
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingPost(post); setShowCreatePostModal(true); }}
                  style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, fontSize: "12px", padding: "4px 10px", border: `1px solid ${theme.border}` }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                  style={{ ...buttonStyle, backgroundColor: theme.danger, fontSize: "12px", padding: "4px 10px" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ── Render: Analytics Tab ──────────────────────────────────────────────

  const renderAnalytics = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>Platform Performance</h3>
        <button onClick={handleExportAnalytics} style={buttonStyle} aria-label="Export analytics as CSV">
          📥 Export CSV
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ textAlign: "left", padding: "12px 8px" }}>Platform</th>
              <th style={{ textAlign: "right", padding: "12px 8px" }}>Posts</th>
              <th style={{ textAlign: "right", padding: "12px 8px" }}>Total Engagement</th>
              <th style={{ textAlign: "right", padding: "12px 8px" }}>Avg Engagement</th>
              <th style={{ textAlign: "right", padding: "12px 8px" }}>Engagement Rate</th>
              <th style={{ textAlign: "right", padding: "12px 8px" }}>Followers</th>
            </tr>
          </thead>
          <tbody>
            {platformBreakdown.map((pb) => {
              const latestFollowers = FOLLOWER_DATA[FOLLOWER_DATA.length - 1][pb.platform];
              return (
                <tr key={pb.platform} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: getPlatformColor(pb.platform) }} />
                      {pb.platform}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", padding: "12px 8px" }}>{pb.postCount}</td>
                  <td style={{ textAlign: "right", padding: "12px 8px" }}>{formatNumber(pb.totalEngagement)}</td>
                  <td style={{ textAlign: "right", padding: "12px 8px" }}>{formatNumber(pb.avgEngagement)}</td>
                  <td style={{ textAlign: "right", padding: "12px 8px" }}>{pb.rate}%</td>
                  <td style={{ textAlign: "right", padding: "12px 8px" }}>{formatNumber(latestFollowers)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Engagement by Type</h3>
          {(() => {
            const published = posts.filter((p) => p.status === "published");
            const totalLikes = published.reduce((s, p) => s + p.likes, 0);
            const totalShares = published.reduce((s, p) => s + p.shares, 0);
            const totalComments = published.reduce((s, p) => s + p.comments, 0);
            const total = totalLikes + totalShares + totalComments;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Likes", value: totalLikes, color: theme.danger },
                  { label: "Shares", value: totalShares, color: theme.accent },
                  { label: "Comments", value: totalComments, color: theme.success },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                      <span>{label}</span>
                      <span>{formatNumber(value)} ({total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: theme.bg, borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: total > 0 ? `${(value / total) * 100}%` : "0%", backgroundColor: color, borderRadius: "4px" }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Content Performance by Tags</h3>
          {(() => {
            const tagMap = {};
            posts.filter((p) => p.status === "published").forEach((p) => {
              p.tags.forEach((tag) => {
                if (!tagMap[tag]) tagMap[tag] = { count: 0, engagement: 0 };
                tagMap[tag].count++;
                tagMap[tag].engagement += getEngagementScore(p);
              });
            });
            const tagEntries = Object.entries(tagMap).sort((a, b) => b[1].engagement - a[1].engagement);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {tagEntries.map(([tag, data]) => (
                  <div key={tag} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ fontSize: "13px" }}>#{tag}</span>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: theme.textSecondary }}>
                      <span>{data.count} posts</span>
                      <span>{formatNumber(data.engagement)} engagement</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );

  // ── Render: Audience Tab ───────────────────────────────────────────────

  const renderAudience = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Age Distribution</h3>
          {AUDIENCE_DEMOGRAPHICS.ageGroups.map((group) => (
            <div key={group.range} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                <span>{group.range}</span>
                <span>{group.percentage}%</span>
              </div>
              <div style={{ height: "8px", backgroundColor: theme.bg, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${group.percentage}%`, backgroundColor: theme.accent, borderRadius: "4px" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Top Locations</h3>
          {AUDIENCE_DEMOGRAPHICS.topLocations.map((loc, i) => (
            <div key={loc.city} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < AUDIENCE_DEMOGRAPHICS.topLocations.length - 1 ? `1px solid ${theme.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: theme.textSecondary, width: "24px" }}>#{i + 1}</span>
                <span style={{ fontSize: "14px" }}>{loc.city}</span>
              </div>
              <span style={{ fontSize: "13px", color: theme.textSecondary }}>{formatNumber(loc.count)} followers</span>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Best Times to Post</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px" }}>
            {Array.from({ length: 24 }, (_, h) => {
              const isPeak = AUDIENCE_DEMOGRAPHICS.peakHours.includes(h);
              return (
                <div
                  key={h}
                  style={{
                    padding: "8px 4px",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontSize: "11px",
                    backgroundColor: isPeak ? theme.accent + "33" : theme.bg,
                    color: isPeak ? theme.accent : theme.textSecondary,
                    fontWeight: isPeak ? 700 : 400,
                    border: isPeak ? `1px solid ${theme.accent}` : "1px solid transparent",
                  }}
                >
                  {h}:00
                </div>
              );
            })}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: "12px", color: theme.textSecondary }}>
            Peak hours highlighted. Based on last 30 days of engagement data.
          </p>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: "16px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Followers by Platform</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
          {PLATFORMS.map((platform) => {
            const latest = FOLLOWER_DATA[FOLLOWER_DATA.length - 1][platform];
            const previous = FOLLOWER_DATA[FOLLOWER_DATA.length - 2][platform];
            const growth = (((latest - previous) / previous) * 100).toFixed(1);
            return (
              <div key={platform} style={{ textAlign: "center", padding: "16px", borderRadius: "8px", backgroundColor: theme.bg }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: getPlatformColor(platform), margin: "0 auto 8px" }} />
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{platform}</p>
                <p style={{ margin: "4px 0", fontSize: "22px", fontWeight: 700 }}>{formatNumber(latest)}</p>
                <p style={{ margin: 0, fontSize: "13px", color: parseFloat(growth) >= 0 ? theme.success : theme.danger }}>
                  {parseFloat(growth) >= 0 ? "+" : ""}{growth}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Render: Scheduler Tab ──────────────────────────────────────────────

  const renderScheduler = () => {
    const scheduledPosts = posts.filter((p) => p.status === "scheduled");
    const draftPosts = posts.filter((p) => p.status === "draft");

    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>
              Scheduled Posts ({scheduledPosts.length})
            </h3>
            {scheduledPosts.length === 0 ? (
              <p style={{ color: theme.textSecondary, fontSize: "14px" }}>No scheduled posts</p>
            ) : (
              scheduledPosts.map((post) => (
                <div key={post.id} style={{ padding: "12px", borderRadius: "8px", backgroundColor: theme.bg, marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ backgroundColor: getPlatformColor(post.platform), color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                      {post.platform}
                    </span>
                    <span style={{ fontSize: "12px", color: theme.warning }}>
                      {formatDate(post.scheduledFor)}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: "13px" }}>{post.content}</p>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handlePublishDraft(post.id)}
                      style={{ ...buttonStyle, backgroundColor: theme.success, fontSize: "11px", padding: "3px 8px" }}
                    >
                      Publish Now
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{ ...buttonStyle, backgroundColor: theme.danger, fontSize: "11px", padding: "3px 8px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>
              Drafts ({draftPosts.length})
            </h3>
            {draftPosts.length === 0 ? (
              <p style={{ color: theme.textSecondary, fontSize: "14px" }}>No drafts</p>
            ) : (
              draftPosts.map((post) => (
                <div key={post.id} style={{ padding: "12px", borderRadius: "8px", backgroundColor: theme.bg, marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ backgroundColor: getPlatformColor(post.platform), color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                      {post.platform}
                    </span>
                    <span style={{ fontSize: "12px", color: theme.textSecondary }}>Draft</span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: "13px" }}>{post.content}</p>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handlePublishDraft(post.id)}
                      style={{ ...buttonStyle, backgroundColor: theme.success, fontSize: "11px", padding: "3px 8px" }}
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => { setEditingPost(post); setShowCreatePostModal(true); }}
                      style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, fontSize: "11px", padding: "3px 8px", border: `1px solid ${theme.border}` }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{ ...buttonStyle, backgroundColor: theme.danger, fontSize: "11px", padding: "3px 8px" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ ...cardStyle, marginTop: "16px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>Quick Schedule</h3>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: theme.textSecondary }}>
            Optimal posting times based on your audience engagement patterns
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {AUDIENCE_DEMOGRAPHICS.peakHours.map((hour) => (
              <button
                key={hour}
                onClick={() => {
                  setNewPostScheduleDate(new Date(new Date().setHours(hour, 0, 0, 0)).toISOString().slice(0, 16));
                  setShowCreatePostModal(true);
                }}
                style={{ ...buttonStyle, backgroundColor: theme.accent + "15", color: theme.accent, padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
              >
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{hour}:00</span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>Schedule post</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Render: Settings Tab ───────────────────────────────────────────────

  const renderSettings = () => (
    <div style={{ maxWidth: "600px" }}>
      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Appearance</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: "14px" }}>Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              aria-label="Dark mode toggle"
            />
          </label>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: "14px" }}>Compact View</span>
            <input
              type="checkbox"
              checked={compactView}
              onChange={(e) => setCompactView(e.target.checked)}
              aria-label="Compact view toggle"
            />
          </label>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Data & Refresh</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: "14px" }}>Auto-Refresh</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              aria-label="Auto-refresh toggle"
            />
          </label>
          {autoRefresh && (
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px" }}>Refresh Interval (seconds)</span>
              <input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                min={5}
                max={300}
                style={{ ...inputStyle, width: "80px" }}
                aria-label="Refresh interval"
              />
            </label>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Notifications</h3>
        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <span style={{ fontSize: "14px" }}>Email Notifications</span>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            aria-label="Email notifications toggle"
          />
        </label>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>Data Management</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleExportAnalytics} style={buttonStyle}>
            Export Analytics
          </button>
          <button
            onClick={() => {
              if (window.confirm("Reset all posts to default? This cannot be undone.")) {
                setPosts(INITIAL_POSTS);
              }
            }}
            style={{ ...buttonStyle, backgroundColor: theme.danger }}
          >
            Reset Posts
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render: Create / Edit Post Modal ───────────────────────────────────

  const renderCreatePostModal = () => {
    if (!showCreatePostModal) return null;
    const isEditing = editingPost !== null;
    return (
      <div style={modalOverlayStyle} onClick={() => { setShowCreatePostModal(false); setEditingPost(null); }} role="dialog" aria-label={isEditing ? "Edit post" : "Create new post"}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "20px" }}>{isEditing ? "Edit Post" : "Create New Post"}</h2>
            <button
              onClick={() => { setShowCreatePostModal(false); setEditingPost(null); }}
              style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, fontSize: "18px", padding: "4px 8px" }}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px", display: "block" }}>Platform</label>
              <select
                value={isEditing ? editingPost.platform : newPostPlatform}
                onChange={(e) => isEditing ? setEditingPost({ ...editingPost, platform: e.target.value }) : setNewPostPlatform(e.target.value)}
                style={inputStyle}
                aria-label="Select platform"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px", display: "block" }}>Content</label>
              <textarea
                value={isEditing ? editingPost.content : newPostContent}
                onChange={(e) => isEditing ? setEditingPost({ ...editingPost, content: e.target.value }) : setNewPostContent(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Write your post content..."
                aria-label="Post content"
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px", display: "block" }}>Tags (comma-separated)</label>
              <input
                type="text"
                value={isEditing ? editingPost.tags.join(", ") : newPostTags}
                onChange={(e) => isEditing ? setEditingPost({ ...editingPost, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }) : setNewPostTags(e.target.value)}
                style={inputStyle}
                placeholder="e.g., product, announcement"
                aria-label="Post tags"
              />
            </div>

            {!isEditing && (
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px", display: "block" }}>Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={newPostScheduleDate}
                  onChange={(e) => setNewPostScheduleDate(e.target.value)}
                  style={inputStyle}
                  aria-label="Schedule date"
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button
                onClick={() => { setShowCreatePostModal(false); setEditingPost(null); }}
                style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, border: `1px solid ${theme.border}` }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleEditPost(editingPost.id, {
                      platform: editingPost.platform,
                      content: editingPost.content,
                      tags: editingPost.tags,
                    });
                    setShowCreatePostModal(false);
                    setEditingPost(null);
                  } else {
                    handleCreatePost();
                  }
                }}
                style={buttonStyle}
              >
                {isEditing ? "Save Changes" : newPostScheduleDate ? "Schedule Post" : "Publish Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render: Post Detail Modal ──────────────────────────────────────────

  const renderPostDetailModal = () => {
    if (!showPostDetailModal || !selectedPost) return null;
    const currentPost = posts.find((p) => p.id === selectedPost.id) || selectedPost;
    return (
      <div style={modalOverlayStyle} onClick={() => setShowPostDetailModal(false)} role="dialog" aria-label="Post details">
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "20px" }}>Post Details</h2>
            <button
              onClick={() => setShowPostDetailModal(false)}
              style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, fontSize: "18px", padding: "4px 8px" }}
              aria-label="Close post detail"
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ backgroundColor: getPlatformColor(currentPost.platform), color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "13px" }}>
              {currentPost.platform}
            </span>
            <span style={{
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              backgroundColor: currentPost.status === "published" ? theme.success + "22" : theme.warning + "22",
              color: currentPost.status === "published" ? theme.success : theme.warning,
            }}>
              {currentPost.status}
            </span>
          </div>

          <p style={{ fontSize: "15px", lineHeight: 1.6, margin: "0 0 16px" }}>{currentPost.content}</p>

          {currentPost.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
              {currentPost.tags.map((tag) => (
                <span key={tag} style={{ fontSize: "12px", color: theme.accent, backgroundColor: theme.accent + "15", padding: "3px 8px", borderRadius: "8px" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {currentPost.status === "published" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Likes", value: currentPost.likes, icon: "❤️" },
                { label: "Shares", value: currentPost.shares, icon: "🔄" },
                { label: "Comments", value: currentPost.comments, icon: "💬" },
                { label: "Impressions", value: currentPost.impressions, icon: "👁" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ textAlign: "center", padding: "12px", borderRadius: "8px", backgroundColor: theme.bg }}>
                  <p style={{ margin: 0, fontSize: "18px" }}>{icon}</p>
                  <p style={{ margin: "4px 0", fontSize: "18px", fontWeight: 700 }}>{formatNumber(value)}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: theme.textSecondary }}>{label}</p>
                </div>
              ))}
            </div>
          )}

          {currentPost.publishedAt && (
            <p style={{ fontSize: "13px", color: theme.textSecondary, margin: "0 0 4px" }}>
              Published: {formatDate(currentPost.publishedAt)}
            </p>
          )}
          {currentPost.scheduledFor && (
            <p style={{ fontSize: "13px", color: theme.warning, margin: "0 0 4px" }}>
              Scheduled for: {formatDate(currentPost.scheduledFor)}
            </p>
          )}
          <p style={{ fontSize: "13px", color: theme.textSecondary, margin: "0 0 16px" }}>
            Engagement Score: {getEngagementScore(currentPost)}
          </p>

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setEditingPost(currentPost);
                setShowPostDetailModal(false);
                setShowCreatePostModal(true);
              }}
              style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, border: `1px solid ${theme.border}` }}
            >
              Edit
            </button>
            <button
              onClick={() => { handleDeletePost(currentPost.id); }}
              style={{ ...buttonStyle, backgroundColor: theme.danger }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Render: Notifications Panel ────────────────────────────────────────

  const renderNotificationsPanel = () => {
    if (!showNotificationsPanel) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "380px",
          height: "100vh",
          backgroundColor: theme.surface,
          borderLeft: `1px solid ${theme.border}`,
          padding: "24px",
          overflowY: "auto",
          zIndex: 999,
          boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
        }}
        role="complementary"
        aria-label="Notifications panel"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>Notifications</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleMarkAllNotificationsRead}
              style={{ ...buttonStyle, fontSize: "12px", padding: "4px 8px" }}
            >
              Mark all read
            </button>
            <button
              onClick={() => setShowNotificationsPanel(false)}
              style={{ ...buttonStyle, backgroundColor: "transparent", color: theme.text, fontSize: "16px", padding: "4px 8px" }}
              aria-label="Close notifications"
            >
              ✕
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <p style={{ color: theme.textSecondary, textAlign: "center", marginTop: "40px" }}>
            No notifications
          </p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: notif.read ? "transparent" : theme.accent + "10",
                borderLeft: notif.read ? "3px solid transparent" : `3px solid ${theme.accent}`,
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px" }}>
                      {notif.type === "milestone" ? "🎉" : notif.type === "alert" ? "⚠️" : "💡"}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color:
                          notif.type === "milestone" ? theme.success :
                          notif.type === "alert" ? theme.warning :
                          theme.accent,
                      }}
                    >
                      {notif.type}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "13px" }}>{notif.message}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: theme.textSecondary }}>
                    {formatDate(notif.createdAt)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkNotificationRead(notif.id)}
                      style={{ ...buttonStyle, fontSize: "11px", padding: "2px 6px", backgroundColor: "transparent", color: theme.accent }}
                      aria-label="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDismissNotification(notif.id)}
                    style={{ ...buttonStyle, fontSize: "11px", padding: "2px 6px", backgroundColor: "transparent", color: theme.danger }}
                    aria-label="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // ── Main Render ────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {renderSidebar()}
      <div style={mainContentStyle}>
        {renderHeader()}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "posts" && renderPosts()}
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "audience" && renderAudience()}
        {activeTab === "scheduler" && renderScheduler()}
        {activeTab === "settings" && renderSettings()}
      </div>
      {renderCreatePostModal()}
      {renderPostDetailModal()}
      {renderNotificationsPanel()}
    </div>
  );
}
