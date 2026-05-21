import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const GENRES = [
  "all",
  "technology",
  "cooking",
  "music",
  "gaming",
  "education",
  "fitness",
  "travel",
  "comedy",
];

const CHANNELS = [
  { id: "ch1", name: "TechVision", avatar: "🖥️", subscribers: 245000 },
  { id: "ch2", name: "Chef Marco", avatar: "👨‍🍳", subscribers: 189000 },
  { id: "ch3", name: "BeatLab", avatar: "🎵", subscribers: 312000 },
  { id: "ch4", name: "GameZone", avatar: "🎮", subscribers: 520000 },
  { id: "ch5", name: "LearnDaily", avatar: "📚", subscribers: 175000 },
  { id: "ch6", name: "FitPro", avatar: "💪", subscribers: 290000 },
  { id: "ch7", name: "Wanderlust", avatar: "✈️", subscribers: 410000 },
  { id: "ch8", name: "LaughTrack", avatar: "😂", subscribers: 680000 },
];

const INITIAL_VIDEOS = [
  {
    id: "v1",
    title: "Building a React App from Scratch",
    channel: "ch1",
    genre: "technology",
    duration: 1845,
    views: 125000,
    uploadDate: Date.now() - 86400000 * 3,
    thumbnail: "🖥️",
    description:
      "Learn how to build a complete React application from scratch with hooks, state management, and routing.",
    likes: 8400,
    dislikes: 120,
  },
  {
    id: "v2",
    title: "Perfect Pasta Carbonara Recipe",
    channel: "ch2",
    genre: "cooking",
    duration: 924,
    views: 340000,
    uploadDate: Date.now() - 86400000 * 7,
    thumbnail: "🍝",
    description:
      "Master the classic Italian carbonara with crispy guanciale, pecorino romano, and perfectly silky egg sauce.",
    likes: 22000,
    dislikes: 340,
  },
  {
    id: "v3",
    title: "Lo-fi Beats to Study To - Live Stream",
    channel: "ch3",
    genre: "music",
    duration: 7200,
    views: 1200000,
    uploadDate: Date.now() - 86400000 * 14,
    thumbnail: "🎧",
    description:
      "Relaxing lo-fi hip hop beats for studying, working, and chilling. 24/7 live radio.",
    likes: 95000,
    dislikes: 1200,
  },
  {
    id: "v4",
    title: "Elden Ring Boss Rush - No Hit Challenge",
    channel: "ch4",
    genre: "gaming",
    duration: 2700,
    views: 890000,
    uploadDate: Date.now() - 86400000 * 2,
    thumbnail: "⚔️",
    description:
      "Attempting every boss in Elden Ring without getting hit once. Can we do it?",
    likes: 67000,
    dislikes: 2100,
  },
  {
    id: "v5",
    title: "Machine Learning Explained Simply",
    channel: "ch5",
    genre: "education",
    duration: 1200,
    views: 450000,
    uploadDate: Date.now() - 86400000 * 10,
    thumbnail: "🧠",
    description:
      "A beginner-friendly guide to understanding machine learning concepts, algorithms, and real-world applications.",
    likes: 31000,
    dislikes: 560,
  },
  {
    id: "v6",
    title: "30-Minute Full Body HIIT Workout",
    channel: "ch6",
    genre: "fitness",
    duration: 1800,
    views: 670000,
    uploadDate: Date.now() - 86400000 * 5,
    thumbnail: "🏋️",
    description:
      "High-intensity interval training for all fitness levels. No equipment needed, just bring your energy!",
    likes: 44000,
    dislikes: 890,
  },
  {
    id: "v7",
    title: "Hidden Gems of Kyoto, Japan",
    channel: "ch7",
    genre: "travel",
    duration: 1560,
    views: 520000,
    uploadDate: Date.now() - 86400000 * 8,
    thumbnail: "🏯",
    description:
      "Explore the secret temples, gardens, and local spots that most tourists never find in beautiful Kyoto.",
    likes: 38000,
    dislikes: 420,
  },
  {
    id: "v8",
    title: "Stand-Up Comedy Special: Night Owl",
    channel: "ch8",
    genre: "comedy",
    duration: 3600,
    views: 2100000,
    uploadDate: Date.now() - 86400000 * 1,
    thumbnail: "🎤",
    description:
      "A hilarious one-hour stand-up special covering modern life, social media, and late-night adventures.",
    likes: 150000,
    dislikes: 4500,
  },
  {
    id: "v9",
    title: "CSS Grid vs Flexbox - Complete Guide",
    channel: "ch1",
    genre: "technology",
    duration: 2100,
    views: 210000,
    uploadDate: Date.now() - 86400000 * 12,
    thumbnail: "🎨",
    description:
      "The definitive comparison of CSS Grid and Flexbox with practical examples for every use case.",
    likes: 14000,
    dislikes: 230,
  },
  {
    id: "v10",
    title: "Street Food Tour: Bangkok",
    channel: "ch7",
    genre: "travel",
    duration: 1320,
    views: 780000,
    uploadDate: Date.now() - 86400000 * 4,
    thumbnail: "🌶️",
    description:
      "Join us as we explore the vibrant street food scene of Bangkok, from pad thai to mango sticky rice.",
    likes: 52000,
    dislikes: 670,
  },
  {
    id: "v11",
    title: "Piano Tutorial - Moonlight Sonata",
    channel: "ch3",
    genre: "music",
    duration: 1680,
    views: 390000,
    uploadDate: Date.now() - 86400000 * 6,
    thumbnail: "🎹",
    description:
      "Step-by-step piano tutorial for Beethoven's Moonlight Sonata, 1st movement. Perfect for intermediate players.",
    likes: 27000,
    dislikes: 310,
  },
  {
    id: "v12",
    title: "Minecraft Mega Build: Underwater City",
    channel: "ch4",
    genre: "gaming",
    duration: 2400,
    views: 650000,
    uploadDate: Date.now() - 86400000 * 9,
    thumbnail: "🌊",
    description:
      "Time-lapse of building an entire underwater city in Minecraft survival mode. 200+ hours of work.",
    likes: 48000,
    dislikes: 1100,
  },
  {
    id: "v13",
    title: "Homemade Ramen From Scratch",
    channel: "ch2",
    genre: "cooking",
    duration: 1500,
    views: 280000,
    uploadDate: Date.now() - 86400000 * 11,
    thumbnail: "🍜",
    description:
      "Make authentic tonkotsu ramen at home with homemade broth, chashu pork, and hand-pulled noodles.",
    likes: 19000,
    dislikes: 250,
  },
  {
    id: "v14",
    title: "Yoga for Beginners - Morning Flow",
    channel: "ch6",
    genre: "fitness",
    duration: 1200,
    views: 920000,
    uploadDate: Date.now() - 86400000 * 15,
    thumbnail: "🧘",
    description:
      "Start your day with this gentle 20-minute yoga flow designed for complete beginners.",
    likes: 61000,
    dislikes: 780,
  },
  {
    id: "v15",
    title: "The History of the Internet",
    channel: "ch5",
    genre: "education",
    duration: 2700,
    views: 320000,
    uploadDate: Date.now() - 86400000 * 13,
    thumbnail: "🌐",
    description:
      "From ARPANET to social media: a comprehensive documentary on how the internet changed everything.",
    likes: 23000,
    dislikes: 390,
  },
  {
    id: "v16",
    title: "Improv Comedy Workshop Highlights",
    channel: "ch8",
    genre: "comedy",
    duration: 1800,
    views: 450000,
    uploadDate: Date.now() - 86400000 * 6,
    thumbnail: "🎭",
    description:
      "The funniest moments from our live improv comedy workshop. Audience suggestions gone hilariously wrong.",
    likes: 32000,
    dislikes: 850,
  },
];

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatViews = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K views`;
  return `${count} views`;
};

const formatSubscribers = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return `${count}`;
};

const formatTimeAgo = (timestamp) => {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

export default function VideoStreamingPlatform() {
  const [videos] = useState(INITIAL_VIDEOS);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const [watchHistory, setWatchHistory] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [dislikedVideos, setDislikedVideos] = useState([]);
  const [queue, setQueue] = useState([]);
  const [playlists, setPlaylists] = useState([
    { id: "pl1", name: "Watch Later", videoIds: [] },
    { id: "pl2", name: "Favorites", videoIds: [] },
  ]);

  const [activeView, setActiveView] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showVideoDetail, setShowVideoDetail] = useState(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [miniPlayerMode, setMiniPlayerMode] = useState(false);

  const controlsTimerRef = useRef(null);
  const progressBarRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load persisted state
  useEffect(() => {
    const savedTheme = localStorage.getItem("streamTheme");
    if (savedTheme !== null) setIsDarkMode(savedTheme === "dark");

    const savedHistory = localStorage.getItem("streamHistory");
    if (savedHistory) {
      try {
        setWatchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse watch history");
      }
    }

    const savedLikes = localStorage.getItem("streamLikes");
    if (savedLikes) {
      try {
        setLikedVideos(JSON.parse(savedLikes));
      } catch (e) {
        console.error("Failed to parse likes");
      }
    }

    const savedPlaylists = localStorage.getItem("streamPlaylists");
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists));
      } catch (e) {
        console.error("Failed to parse playlists");
      }
    }

    const savedQueue = localStorage.getItem("streamQueue");
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (e) {
        console.error("Failed to parse queue");
      }
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem("streamHistory", JSON.stringify(watchHistory));
  }, [watchHistory]);
  useEffect(() => {
    localStorage.setItem("streamLikes", JSON.stringify(likedVideos));
  }, [likedVideos]);
  useEffect(() => {
    localStorage.setItem("streamPlaylists", JSON.stringify(playlists));
  }, [playlists]);
  useEffect(() => {
    localStorage.setItem("streamQueue", JSON.stringify(queue));
  }, [queue]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      if (e.key === " " && currentVideo) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
      if (e.key === "m" && currentVideo) {
        setIsMuted((prev) => !prev);
      }
      if (e.key === "f" && currentVideo) {
        setIsFullscreen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setShowVideoDetail(null);
        setShowCreatePlaylist(false);
        setShowAddToPlaylist(null);
        setShowSpeedMenu(false);
        if (isFullscreen) setIsFullscreen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "ArrowRight" && currentVideo) {
        setCurrentTime((prev) => Math.min(prev + 10, currentVideo.duration));
      }
      if (e.key === "ArrowLeft" && currentVideo) {
        setCurrentTime((prev) => Math.max(prev - 10, 0));
      }
      if (e.key === "ArrowUp" && currentVideo) {
        e.preventDefault();
        setVolume((prev) => Math.min(prev + 5, 100));
      }
      if (e.key === "ArrowDown" && currentVideo) {
        e.preventDefault();
        setVolume((prev) => Math.max(prev - 5, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVideo, isFullscreen]);

  // Simulated playback timer
  useEffect(() => {
    let interval;
    if (isPlaying && currentVideo) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentVideo.duration) {
            setIsPlaying(false);
            playNextInQueue();
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentVideo, playbackSpeed]);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && currentVideo) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(controlsTimerRef.current);
  }, [isPlaying, showControls, currentVideo]);

  const playVideo = useCallback((video) => {
    setCurrentVideo(video);
    setCurrentTime(0);
    setIsPlaying(true);
    setShowControls(true);
    setMiniPlayerMode(false);

    setWatchHistory((prev) => {
      const filtered = prev.filter((h) => h.videoId !== video.id);
      return [
        { videoId: video.id, watchedAt: Date.now(), progress: 0 },
        ...filtered,
      ].slice(0, 50);
    });
  }, []);

  const playNextInQueue = useCallback(() => {
    if (queue.length > 0) {
      const nextVideoId = queue[0];
      const nextVideo = videos.find((v) => v.id === nextVideoId);
      if (nextVideo) {
        setQueue((prev) => prev.slice(1));
        playVideo(nextVideo);
      }
    }
  }, [queue, videos, playVideo]);

  const toggleLike = useCallback((videoId) => {
    setLikedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
    setDislikedVideos((prev) => prev.filter((id) => id !== videoId));
  }, []);

  const toggleDislike = useCallback((videoId) => {
    setDislikedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
    setLikedVideos((prev) => prev.filter((id) => id !== videoId));
  }, []);

  const addToQueue = useCallback((videoId) => {
    setQueue((prev) => (prev.includes(videoId) ? prev : [...prev, videoId]));
  }, []);

  const removeFromQueue = useCallback((videoId) => {
    setQueue((prev) => prev.filter((id) => id !== videoId));
  }, []);

  const addToPlaylist = useCallback((playlistId, videoId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId
          ? {
              ...pl,
              videoIds: pl.videoIds.includes(videoId)
                ? pl.videoIds
                : [...pl.videoIds, videoId],
            }
          : pl
      )
    );
    setShowAddToPlaylist(null);
  }, []);

  const removeFromPlaylist = useCallback((playlistId, videoId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, videoIds: pl.videoIds.filter((id) => id !== videoId) }
          : pl
      )
    );
  }, []);

  const createPlaylist = useCallback((name) => {
    if (!name.trim()) return;
    const newPlaylist = {
      id: `pl_${Date.now()}`,
      name: name.trim(),
      videoIds: [],
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setShowCreatePlaylist(false);
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    if (playlistId === "pl1" || playlistId === "pl2") return; // Can't delete default playlists
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
    }
  }, []);

  const getChannel = useCallback(
    (channelId) => CHANNELS.find((c) => c.id === channelId),
    []
  );

  const handleSeek = useCallback(
    (e) => {
      if (!progressBarRef.current || !currentVideo) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      setCurrentTime(Math.floor(pct * currentVideo.duration));
    },
    [currentVideo]
  );

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const newVal = !prev;
      localStorage.setItem("streamTheme", newVal ? "dark" : "light");
      return newVal;
    });
  }, []);

  const filteredVideos = useMemo(() => {
    let result = videos;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((v) => {
        const channel = getChannel(v.channel);
        return (
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.genre.toLowerCase().includes(q) ||
          (channel && channel.name.toLowerCase().includes(q))
        );
      });
    }

    if (selectedGenre !== "all") {
      result = result.filter((v) => v.genre === selectedGenre);
    }

    if (sortBy === "popular") {
      result = [...result].sort((a, b) => b.views - a.views);
    } else if (sortBy === "newest") {
      result = [...result].sort((a, b) => b.uploadDate - a.uploadDate);
    } else if (sortBy === "oldest") {
      result = [...result].sort((a, b) => a.uploadDate - b.uploadDate);
    } else if (sortBy === "duration") {
      result = [...result].sort((a, b) => b.duration - a.duration);
    }

    return result;
  }, [videos, searchQuery, selectedGenre, sortBy, getChannel]);

  const watchHistoryVideos = useMemo(
    () =>
      watchHistory
        .map((h) => videos.find((v) => v.id === h.videoId))
        .filter(Boolean),
    [watchHistory, videos]
  );

  const queueVideos = useMemo(
    () => queue.map((id) => videos.find((v) => v.id === id)).filter(Boolean),
    [queue, videos]
  );

  const bgColor = isDarkMode ? "#0f0f0f" : "#ffffff";
  const cardBg = isDarkMode ? "#1a1a1a" : "#f9f9f9";
  const textColor = isDarkMode ? "#f1f1f1" : "#0f0f0f";
  const secondaryText = isDarkMode ? "#aaaaaa" : "#606060";
  const borderColor = isDarkMode ? "#303030" : "#e5e5e5";
  const accentColor = "#ff0000";
  const hoverBg = isDarkMode ? "#272727" : "#f2f2f2";
  const sidebarBg = isDarkMode ? "#0f0f0f" : "#ffffff";

  const renderVideoCard = (video, showRemoveFromPlaylist = null) => {
    const channel = getChannel(video.channel);
    const historyEntry = watchHistory.find((h) => h.videoId === video.id);

    return (
      <div
        key={video.id}
        style={{
          cursor: "pointer",
          borderRadius: "12px",
          overflow: "hidden",
          transition: "transform 0.2s",
        }}
        onClick={() => setShowVideoDetail(video)}
      >
        <div
          style={{
            position: "relative",
            backgroundColor: isDarkMode ? "#272727" : "#e5e5e5",
            paddingBottom: "56.25%",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
            }}
          >
            {video.thumbnail}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "#fff",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {formatDuration(video.duration)}
          </div>
          {historyEntry && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: accentColor,
                  width: `${(historyEntry.progress / video.duration) * 100}%`,
                }}
              />
            </div>
          )}
        </div>

        <div style={{ padding: "12px 0", display: "flex", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: isDarkMode ? "#303030" : "#e5e5e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            {channel?.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 500,
                margin: "0 0 4px 0",
                lineHeight: 1.3,
                color: textColor,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {video.title}
            </h3>
            <div
              style={{
                fontSize: "12px",
                color: secondaryText,
                lineHeight: 1.4,
              }}
            >
              {channel?.name}
            </div>
            <div style={{ fontSize: "12px", color: secondaryText }}>
              {formatViews(video.views)} · {formatTimeAgo(video.uploadDate)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToQueue(video.id);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
                color: secondaryText,
              }}
              title="Add to queue"
              aria-label={`Add ${video.title} to queue`}
            >
              ➕
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddToPlaylist(video.id);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
                color: secondaryText,
              }}
              title="Add to playlist"
              aria-label={`Add ${video.title} to playlist`}
            >
              📋
            </button>
            {showRemoveFromPlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromPlaylist(showRemoveFromPlaylist, video.id);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "4px",
                  color: secondaryText,
                }}
                title="Remove from playlist"
                aria-label={`Remove ${video.title} from playlist`}
              >
                ❌
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPlayer = () => {
    if (!currentVideo) return null;

    const progress =
      currentVideo.duration > 0
        ? (currentTime / currentVideo.duration) * 100
        : 0;

    return (
      <div
        style={{
          position: miniPlayerMode ? "fixed" : "relative",
          bottom: miniPlayerMode ? "16px" : undefined,
          right: miniPlayerMode ? "16px" : undefined,
          width: miniPlayerMode ? "360px" : "100%",
          zIndex: miniPlayerMode ? 3000 : 1,
          borderRadius: miniPlayerMode ? "12px" : 0,
          overflow: "hidden",
          boxShadow: miniPlayerMode ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
        }}
        onMouseMove={() => {
          setShowControls(true);
          clearTimeout(controlsTimerRef.current);
        }}
        data-testid="video-player"
      >
        <div
          style={{
            position: "relative",
            backgroundColor: "#000",
            paddingBottom: miniPlayerMode ? "56.25%" : "56.25%",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: miniPlayerMode ? "48px" : "96px",
              color: "#fff",
            }}
          >
            {currentVideo.thumbnail}
          </div>

          {/* Player overlay controls */}
          {showControls && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(transparent 50%, rgba(0,0,0,0.8))",
              }}
              data-testid="player-controls"
            >
              {/* Center play button */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    border: "none",
                    borderRadius: "50%",
                    width: "64px",
                    height: "64px",
                    cursor: "pointer",
                    fontSize: "28px",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  data-testid="play-pause-btn"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
              </div>

              {/* Bottom controls bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "8px 16px",
                }}
              >
                {/* Progress bar */}
                <div
                  ref={progressBarRef}
                  onClick={handleSeek}
                  style={{
                    height: "4px",
                    backgroundColor: "rgba(255,255,255,0.3)",
                    borderRadius: "2px",
                    cursor: "pointer",
                    marginBottom: "8px",
                    position: "relative",
                  }}
                  data-testid="progress-bar"
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: `${progress}%`,
                      backgroundColor: accentColor,
                      borderRadius: "2px",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                        color: "#fff",
                        padding: "4px",
                      }}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? "⏸" : "▶"}
                    </button>

                    <button
                      onClick={playNextInQueue}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        color: "#fff",
                        padding: "4px",
                        opacity: queue.length > 0 ? 1 : 0.5,
                      }}
                      disabled={queue.length === 0}
                      aria-label="Next video"
                      data-testid="next-btn"
                    >
                      ⏭
                    </button>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                          color: "#fff",
                          padding: "4px",
                        }}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                        data-testid="mute-btn"
                      >
                        {isMuted || volume === 0
                          ? "🔇"
                          : volume < 50
                          ? "🔉"
                          : "🔊"}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseInt(e.target.value));
                          setIsMuted(false);
                        }}
                        style={{ width: "80px", cursor: "pointer" }}
                        aria-label="Volume"
                        data-testid="volume-slider"
                      />
                    </div>

                    <span
                      style={{
                        fontSize: "13px",
                        color: "#fff",
                        fontFamily: "monospace",
                      }}
                      data-testid="time-display"
                    >
                      {formatDuration(currentTime)} /{" "}
                      {formatDuration(currentVideo.duration)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        style={{
                          background: "none",
                          border: "1px solid rgba(255,255,255,0.3)",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "#fff",
                          padding: "2px 8px",
                        }}
                        aria-label="Playback speed"
                        data-testid="speed-btn"
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "100%",
                            right: 0,
                            backgroundColor: "#1a1a1a",
                            borderRadius: "8px",
                            padding: "4px",
                            marginBottom: "4px",
                            minWidth: "80px",
                          }}
                          data-testid="speed-menu"
                        >
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(
                            (speed) => (
                              <button
                                key={speed}
                                onClick={() => {
                                  setPlaybackSpeed(speed);
                                  setShowSpeedMenu(false);
                                }}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "6px 12px",
                                  background:
                                    speed === playbackSpeed
                                      ? "rgba(255,255,255,0.1)"
                                      : "none",
                                  border: "none",
                                  color: "#fff",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  textAlign: "left",
                                  borderRadius: "4px",
                                }}
                              >
                                {speed}x
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setMiniPlayerMode(!miniPlayerMode)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        color: "#fff",
                        padding: "4px",
                      }}
                      aria-label={
                        miniPlayerMode ? "Exit mini player" : "Mini player"
                      }
                      data-testid="miniplayer-btn"
                    >
                      {miniPlayerMode ? "⬆️" : "⬇️"}
                    </button>

                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        color: "#fff",
                        padding: "4px",
                      }}
                      aria-label={
                        isFullscreen ? "Exit fullscreen" : "Fullscreen"
                      }
                      data-testid="fullscreen-btn"
                    >
                      {isFullscreen ? "⬜" : "⛶"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mini player close button */}
        {miniPlayerMode && (
          <button
            onClick={() => {
              setCurrentVideo(null);
              setIsPlaying(false);
              setMiniPlayerMode(false);
            }}
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              background: "rgba(0,0,0,0.7)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              color: "#fff",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close mini player"
            data-testid="close-miniplayer"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  const renderVideoInfo = () => {
    if (!currentVideo) return null;
    const channel = getChannel(currentVideo.channel);
    const isLiked = likedVideos.includes(currentVideo.id);
    const isDisliked = dislikedVideos.includes(currentVideo.id);

    return (
      <div style={{ padding: "16px 0" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 600,
            margin: "0 0 8px 0",
            color: textColor,
          }}
          data-testid="video-title"
        >
          {currentVideo.title}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: isDarkMode ? "#303030" : "#e5e5e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              {channel?.avatar}
            </div>
            <div>
              <div
                style={{ fontWeight: 600, fontSize: "14px", color: textColor }}
              >
                {channel?.name}
              </div>
              <div style={{ fontSize: "12px", color: secondaryText }}>
                {formatSubscribers(channel?.subscribers || 0)} subscribers
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                borderRadius: "20px",
                overflow: "hidden",
                border: `1px solid ${borderColor}`,
              }}
            >
              <button
                onClick={() => toggleLike(currentVideo.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: isLiked
                    ? isDarkMode
                      ? "#272727"
                      : "#e5e5e5"
                    : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: textColor,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRight: `1px solid ${borderColor}`,
                }}
                data-testid="like-btn"
                aria-label="Like"
              >
                👍 {currentVideo.likes + (isLiked ? 1 : 0)}
              </button>
              <button
                onClick={() => toggleDislike(currentVideo.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: isDisliked
                    ? isDarkMode
                      ? "#272727"
                      : "#e5e5e5"
                    : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: textColor,
                }}
                data-testid="dislike-btn"
                aria-label="Dislike"
              >
                👎
              </button>
            </div>

            <button
              onClick={() => addToQueue(currentVideo.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: `1px solid ${borderColor}`,
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "13px",
                color: textColor,
              }}
              data-testid="add-queue-btn"
            >
              Add to Queue
            </button>

            <button
              onClick={() => setShowAddToPlaylist(currentVideo.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: `1px solid ${borderColor}`,
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "13px",
                color: textColor,
              }}
              data-testid="save-btn"
            >
              Save
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: cardBg,
            borderRadius: "12px",
            fontSize: "14px",
          }}
        >
          <div
            style={{ fontWeight: 600, marginBottom: "4px", color: textColor }}
          >
            {formatViews(currentVideo.views)} ·{" "}
            {formatTimeAgo(currentVideo.uploadDate)}
          </div>
          <p
            style={{ margin: 0, color: secondaryText, lineHeight: 1.6 }}
            data-testid="video-description"
          >
            {currentVideo.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "Roboto, -apple-system, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? "72px" : "240px",
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${borderColor}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: textColor,
              padding: "8px",
            }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          {!sidebarCollapsed && (
            <span
              style={{ fontSize: "18px", fontWeight: 700, color: accentColor }}
            >
              ▶ StreamHub
            </span>
          )}
        </div>

        <nav style={{ padding: "8px", flex: 1 }}>
          {[
            { id: "home", icon: "🏠", label: "Home" },
            { id: "trending", icon: "🔥", label: "Trending" },
            { id: "history", icon: "🕐", label: "History" },
            { id: "queue", icon: "📃", label: "Queue" },
            { id: "playlists", icon: "📁", label: "Playlists" },
            { id: "liked", icon: "👍", label: "Liked Videos" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                width: "100%",
                padding: "10px 12px",
                marginBottom: "2px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                backgroundColor:
                  activeView === item.id ? hoverBg : "transparent",
                color: textColor,
                fontWeight: activeView === item.id ? 600 : 400,
                textAlign: "left",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}

          {!sidebarCollapsed && (
            <>
              <div
                style={{
                  borderTop: `1px solid ${borderColor}`,
                  margin: "12px 0",
                  paddingTop: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    padding: "0 12px",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Playlists
                </div>
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => setActiveView(`playlist_${pl.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      backgroundColor: "transparent",
                      color: textColor,
                      textAlign: "left",
                    }}
                  >
                    <span>📋</span>
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pl.name}
                    </span>
                    <span style={{ fontSize: "11px", color: secondaryText }}>
                      {pl.videoIds.length}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </nav>

        <div style={{ padding: "8px", borderTop: `1px solid ${borderColor}` }}>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "10px 12px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              backgroundColor: "transparent",
              color: secondaryText,
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
            }}
            aria-label="Toggle theme"
          >
            <span style={{ fontSize: "18px" }}>{isDarkMode ? "☀️" : "🌙"}</span>
            {!sidebarCollapsed && (
              <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Search header */}
        <header
          style={{
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: "640px",
              margin: "0 auto",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search videos... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 16px",
                border: `1px solid ${borderColor}`,
                borderRadius: "20px 0 0 20px",
                fontSize: "14px",
                backgroundColor: "transparent",
                color: textColor,
                outline: "none",
              }}
              aria-label="Search"
            />
            <button
              style={{
                padding: "8px 20px",
                backgroundColor: isDarkMode ? "#303030" : "#f2f2f2",
                border: `1px solid ${borderColor}`,
                borderLeft: "none",
                borderRadius: "0 20px 20px 0",
                cursor: "pointer",
                fontSize: "16px",
              }}
              aria-label="Search button"
            >
              🔍
            </button>
          </div>
        </header>

        {/* Now playing + content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {/* Video player area - shows when watching a video */}
          {currentVideo && !miniPlayerMode && (
            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 24px",
              }}
            >
              {renderPlayer()}
              {renderVideoInfo()}
            </div>
          )}

          {/* Content area */}
          <div
            style={{
              padding: "16px 24px",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            {/* Genre filter chips + sort */}
            {(activeView === "home" || activeView === "trending") && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: selectedGenre === genre ? 600 : 400,
                        backgroundColor:
                          selectedGenre === genre
                            ? isDarkMode
                              ? "#f1f1f1"
                              : "#0f0f0f"
                            : isDarkMode
                            ? "#272727"
                            : "#f2f2f2",
                        color:
                          selectedGenre === genre
                            ? isDarkMode
                              ? "#0f0f0f"
                              : "#f1f1f1"
                            : textColor,
                      }}
                    >
                      {genre === "all"
                        ? "All"
                        : genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </button>
                  ))}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "8px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                    cursor: "pointer",
                  }}
                  aria-label="Sort by"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="duration">Longest</option>
                </select>
              </div>
            )}

            {/* Home / Trending view - Video grid */}
            {(activeView === "home" || activeView === "trending") && (
              <div>
                {filteredVideos.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: secondaryText,
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                      🔍
                    </div>
                    <div style={{ fontSize: "16px" }}>No videos found</div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      Try adjusting your search or filters
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "16px",
                    }}
                    data-testid="video-grid"
                  >
                    {filteredVideos.map((video) => renderVideoCard(video))}
                  </div>
                )}
              </div>
            )}

            {/* History view */}
            {activeView === "history" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                    Watch History
                  </h2>
                  {watchHistory.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm("Clear all watch history?"))
                          setWatchHistory([]);
                      }}
                      style={{
                        padding: "8px 16px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "20px",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: textColor,
                      }}
                      data-testid="clear-history-btn"
                    >
                      Clear History
                    </button>
                  )}
                </div>
                {watchHistoryVideos.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: secondaryText,
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                      🕐
                    </div>
                    <div style={{ fontSize: "16px" }}>No watch history yet</div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      Videos you watch will appear here
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {watchHistoryVideos.map((video) => renderVideoCard(video))}
                  </div>
                )}
              </div>
            )}

            {/* Queue view */}
            {activeView === "queue" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                    Up Next ({queue.length})
                  </h2>
                  {queue.length > 0 && (
                    <button
                      onClick={() => setQueue([])}
                      style={{
                        padding: "8px 16px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "20px",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: textColor,
                      }}
                      data-testid="clear-queue-btn"
                    >
                      Clear Queue
                    </button>
                  )}
                </div>
                {queueVideos.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: secondaryText,
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                      📃
                    </div>
                    <div style={{ fontSize: "16px" }}>Queue is empty</div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      Add videos to your queue to play them next
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {queueVideos.map((video, index) => (
                      <div
                        key={video.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px",
                          borderRadius: "8px",
                          backgroundColor: cardBg,
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            color: secondaryText,
                            minWidth: "24px",
                            textAlign: "center",
                          }}
                        >
                          {index + 1}
                        </span>
                        <div
                          style={{
                            width: "120px",
                            height: "68px",
                            borderRadius: "8px",
                            backgroundColor: isDarkMode ? "#272727" : "#e5e5e5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "28px",
                            flexShrink: 0,
                            cursor: "pointer",
                          }}
                          onClick={() => playVideo(video)}
                        >
                          {video.thumbnail}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: textColor,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                            }}
                            onClick={() => playVideo(video)}
                          >
                            {video.title}
                          </div>
                          <div
                            style={{ fontSize: "12px", color: secondaryText }}
                          >
                            {getChannel(video.channel)?.name} ·{" "}
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromQueue(video.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                            color: secondaryText,
                            padding: "8px",
                          }}
                          aria-label={`Remove ${video.title} from queue`}
                          data-testid={`remove-queue-${video.id}`}
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Playlists overview */}
            {activeView === "playlists" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                    Playlists
                  </h2>
                  <button
                    onClick={() => setShowCreatePlaylist(true)}
                    style={{
                      padding: "8px 20px",
                      backgroundColor: accentColor,
                      color: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                    data-testid="create-playlist-btn"
                  >
                    + New Playlist
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {playlists.map((pl) => {
                    const firstVideo = videos.find(
                      (v) => v.id === pl.videoIds[0]
                    );
                    return (
                      <div
                        key={pl.id}
                        onClick={() => setActiveView(`playlist_${pl.id}`)}
                        style={{
                          cursor: "pointer",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: `1px solid ${borderColor}`,
                          backgroundColor: cardBg,
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            backgroundColor: isDarkMode ? "#272727" : "#e5e5e5",
                            paddingBottom: "56.25%",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "36px",
                            }}
                          >
                            {firstVideo ? firstVideo.thumbnail : "📁"}
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: 0,
                              bottom: 0,
                              width: "40%",
                              backgroundColor: "rgba(0,0,0,0.7)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                            }}
                          >
                            <span style={{ fontSize: "24px", fontWeight: 700 }}>
                              {pl.videoIds.length}
                            </span>
                            <span style={{ fontSize: "11px" }}>videos</span>
                          </div>
                        </div>
                        <div style={{ padding: "12px" }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color: textColor,
                            }}
                          >
                            {pl.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: secondaryText,
                              marginTop: "4px",
                            }}
                          >
                            {pl.videoIds.length} videos
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Individual playlist view */}
            {activeView.startsWith("playlist_") &&
              (() => {
                const playlistId = activeView.replace("playlist_", "");
                const playlist = playlists.find((pl) => pl.id === playlistId);
                if (!playlist) return null;
                const playlistVideos = playlist.videoIds
                  .map((id) => videos.find((v) => v.id === id))
                  .filter(Boolean);
                return (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                      }}
                    >
                      <div>
                        <button
                          onClick={() => setActiveView("playlists")}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: secondaryText,
                            padding: "0",
                            marginBottom: "4px",
                          }}
                        >
                          ← Back to Playlists
                        </button>
                        <h2
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {playlist.name}
                        </h2>
                        <span
                          style={{ fontSize: "13px", color: secondaryText }}
                        >
                          {playlistVideos.length} videos
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {playlistVideos.length > 0 && (
                          <button
                            onClick={() => {
                              playVideo(playlistVideos[0]);
                              setQueue(
                                playlistVideos.slice(1).map((v) => v.id)
                              );
                            }}
                            style={{
                              padding: "8px 20px",
                              backgroundColor: accentColor,
                              color: "#fff",
                              border: "none",
                              borderRadius: "20px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                            data-testid="play-all-btn"
                          >
                            ▶ Play All
                          </button>
                        )}
                        {playlistId !== "pl1" && playlistId !== "pl2" && (
                          <button
                            onClick={() => {
                              deletePlaylist(playlistId);
                              setActiveView("playlists");
                            }}
                            style={{
                              padding: "8px 16px",
                              border: `1px solid ${borderColor}`,
                              borderRadius: "20px",
                              backgroundColor: "transparent",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: textColor,
                            }}
                            data-testid="delete-playlist-btn"
                          >
                            Delete Playlist
                          </button>
                        )}
                      </div>
                    </div>
                    {playlistVideos.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "48px",
                          color: secondaryText,
                        }}
                      >
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                          📁
                        </div>
                        <div style={{ fontSize: "16px" }}>
                          This playlist is empty
                        </div>
                        <div style={{ fontSize: "13px", marginTop: "4px" }}>
                          Add videos from the home page
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(300px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        {playlistVideos.map((video) =>
                          renderVideoCard(video, playlistId)
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* Liked videos view */}
            {activeView === "liked" && (
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    margin: "0 0 20px 0",
                  }}
                >
                  Liked Videos
                </h2>
                {likedVideos.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: secondaryText,
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                      👍
                    </div>
                    <div style={{ fontSize: "16px" }}>No liked videos yet</div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      Videos you like will appear here
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {likedVideos
                      .map((id) => videos.find((v) => v.id === id))
                      .filter(Boolean)
                      .map((video) => renderVideoCard(video))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini player */}
      {currentVideo && miniPlayerMode && renderPlayer()}

      {/* Video Detail Modal */}
      {showVideoDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowVideoDetail(null)}
        >
          <div
            style={{
              backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflow: "auto",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  margin: 0,
                  flex: 1,
                  color: textColor,
                }}
                data-testid="detail-title"
              >
                {showVideoDetail.title}
              </h2>
              <button
                onClick={() => setShowVideoDetail(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: secondaryText,
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                backgroundColor: isDarkMode ? "#272727" : "#e5e5e5",
                borderRadius: "12px",
                paddingBottom: "56.25%",
                position: "relative",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "72px",
                }}
              >
                {showVideoDetail.thumbnail}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: isDarkMode ? "#303030" : "#e5e5e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                {getChannel(showVideoDetail.channel)?.avatar}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: textColor,
                  }}
                >
                  {getChannel(showVideoDetail.channel)?.name}
                </div>
                <div style={{ fontSize: "12px", color: secondaryText }}>
                  {formatSubscribers(
                    getChannel(showVideoDetail.channel)?.subscribers || 0
                  )}{" "}
                  subscribers
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                fontSize: "13px",
                color: secondaryText,
                marginBottom: "12px",
              }}
            >
              <span>{formatViews(showVideoDetail.views)}</span>
              <span>{formatTimeAgo(showVideoDetail.uploadDate)}</span>
              <span>{formatDuration(showVideoDetail.duration)}</span>
              <span>👍 {showVideoDetail.likes}</span>
            </div>

            <p
              style={{
                fontSize: "14px",
                color: secondaryText,
                lineHeight: 1.6,
                margin: "0 0 20px 0",
              }}
              data-testid="detail-description"
            >
              {showVideoDetail.description}
            </p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  playVideo(showVideoDetail);
                  setShowVideoDetail(null);
                }}
                style={{
                  padding: "10px 24px",
                  backgroundColor: accentColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
                data-testid="detail-play-btn"
              >
                ▶ Play Now
              </button>
              <button
                onClick={() => {
                  addToQueue(showVideoDetail.id);
                  setShowVideoDetail(null);
                }}
                style={{
                  padding: "10px 20px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "20px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: textColor,
                }}
                data-testid="detail-queue-btn"
              >
                Add to Queue
              </button>
              <button
                onClick={() => {
                  toggleLike(showVideoDetail.id);
                }}
                style={{
                  padding: "10px 20px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "20px",
                  backgroundColor: likedVideos.includes(showVideoDetail.id)
                    ? isDarkMode
                      ? "#272727"
                      : "#e5e5e5"
                    : "transparent",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: textColor,
                }}
                data-testid="detail-like-btn"
              >
                👍 {likedVideos.includes(showVideoDetail.id) ? "Liked" : "Like"}
              </button>
              <button
                onClick={() => setShowAddToPlaylist(showVideoDetail.id)}
                style={{
                  padding: "10px 20px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "20px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: textColor,
                }}
                data-testid="detail-save-btn"
              >
                📋 Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2500,
            padding: "20px",
          }}
          onClick={() => setShowAddToPlaylist(null)}
        >
          <div
            style={{
              backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "400px",
              padding: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: 0,
                  color: textColor,
                }}
              >
                Save to Playlist
              </h3>
              <button
                onClick={() => setShowAddToPlaylist(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: secondaryText,
                }}
              >
                ×
              </button>
            </div>
            {playlists.map((pl) => {
              const isInPlaylist = pl.videoIds.includes(showAddToPlaylist);
              return (
                <button
                  key={pl.id}
                  onClick={() =>
                    isInPlaylist
                      ? removeFromPlaylist(pl.id, showAddToPlaylist)
                      : addToPlaylist(pl.id, showAddToPlaylist)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "10px 12px",
                    marginBottom: "4px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: isInPlaylist
                      ? isDarkMode
                        ? "#272727"
                        : "#e5e5e5"
                      : "transparent",
                    color: textColor,
                    fontSize: "14px",
                    textAlign: "left",
                  }}
                  data-testid={`save-to-${pl.id}`}
                >
                  <span>{isInPlaylist ? "✅" : "➕"}</span>
                  <span style={{ flex: 1 }}>{pl.name}</span>
                  <span style={{ fontSize: "12px", color: secondaryText }}>
                    {pl.videoIds.length} videos
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => {
                setShowAddToPlaylist(null);
                setShowCreatePlaylist(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "10px 12px",
                marginTop: "8px",
                border: `1px dashed ${borderColor}`,
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "transparent",
                color: secondaryText,
                fontSize: "14px",
              }}
            >
              <span>➕</span>
              <span>Create New Playlist</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2500,
            padding: "20px",
          }}
          onClick={() => setShowCreatePlaylist(false)}
        >
          <div
            style={{
              backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "400px",
              padding: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                margin: "0 0 16px 0",
                color: textColor,
              }}
            >
              Create Playlist
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = new FormData(e.target).get("name");
                createPlaylist(name);
              }}
            >
              <input
                name="name"
                type="text"
                placeholder="Playlist name..."
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  color: textColor,
                  boxSizing: "border-box",
                  marginBottom: "16px",
                }}
                autoFocus
                data-testid="playlist-name-input"
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylist(false)}
                  style={{
                    padding: "8px 16px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                  data-testid="create-playlist-submit"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
