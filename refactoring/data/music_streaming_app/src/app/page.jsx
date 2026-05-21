import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country', 'Latin', 'Indie'];

const MOCK_ARTISTS = [
  { id: 'ar1', name: 'Luna Wave', genre: 'Electronic', avatar: '🎧', followers: 1240000, verified: true },
  { id: 'ar2', name: 'The Midnight Sons', genre: 'Rock', avatar: '🎸', followers: 890000, verified: true },
  { id: 'ar3', name: 'Aria Gold', genre: 'Pop', avatar: '🎤', followers: 3200000, verified: true },
  { id: 'ar4', name: 'DJ Phantom', genre: 'Electronic', avatar: '🎛️', followers: 560000, verified: false },
  { id: 'ar5', name: 'Velvet Groove', genre: 'R&B', avatar: '🎵', followers: 720000, verified: true },
  { id: 'ar6', name: 'Cedar Heights', genre: 'Indie', avatar: '🌿', followers: 340000, verified: false },
  { id: 'ar7', name: 'Marcus Reed', genre: 'Hip-Hop', avatar: '🎤', followers: 1800000, verified: true },
  { id: 'ar8', name: 'Sofia Strings', genre: 'Classical', avatar: '🎻', followers: 450000, verified: true },
];

const MOCK_ALBUMS = [
  { id: 'al1', title: 'Neon Dreams', artistId: 'ar1', year: 2024, cover: '💜', trackCount: 12 },
  { id: 'al2', title: 'Electric Nights', artistId: 'ar1', year: 2023, cover: '🌃', trackCount: 10 },
  { id: 'al3', title: 'Thunderstrike', artistId: 'ar2', year: 2024, cover: '⚡', trackCount: 11 },
  { id: 'al4', title: 'Golden Hour', artistId: 'ar3', year: 2024, cover: '🌅', trackCount: 14 },
  { id: 'al5', title: 'Midnight Pulse', artistId: 'ar4', year: 2023, cover: '🌙', trackCount: 8 },
  { id: 'al6', title: 'Silk & Soul', artistId: 'ar5', year: 2024, cover: '✨', trackCount: 10 },
  { id: 'al7', title: 'Forest Echo', artistId: 'ar6', year: 2024, cover: '🌲', trackCount: 9 },
  { id: 'al8', title: 'Street Poetry', artistId: 'ar7', year: 2024, cover: '🏙️', trackCount: 16 },
  { id: 'al9', title: 'Concerto in Blue', artistId: 'ar8', year: 2023, cover: '🔵', trackCount: 6 },
];

const MOCK_TRACKS = [
  { id: 't1', title: 'Neon Skyline', artistId: 'ar1', albumId: 'al1', duration: 234, genre: 'Electronic', plays: 4500000, liked: false },
  { id: 't2', title: 'Digital Rain', artistId: 'ar1', albumId: 'al1', duration: 198, genre: 'Electronic', plays: 3200000, liked: false },
  { id: 't3', title: 'Pulse Wave', artistId: 'ar1', albumId: 'al2', duration: 267, genre: 'Electronic', plays: 2800000, liked: false },
  { id: 't4', title: 'Thunder Road', artistId: 'ar2', albumId: 'al3', duration: 312, genre: 'Rock', plays: 5100000, liked: false },
  { id: 't5', title: 'Burning Sky', artistId: 'ar2', albumId: 'al3', duration: 245, genre: 'Rock', plays: 3900000, liked: false },
  { id: 't6', title: 'Rebel Heart', artistId: 'ar2', albumId: 'al3', duration: 289, genre: 'Rock', plays: 4200000, liked: false },
  { id: 't7', title: 'Shine On Me', artistId: 'ar3', albumId: 'al4', duration: 215, genre: 'Pop', plays: 12000000, liked: false },
  { id: 't8', title: 'Starlight', artistId: 'ar3', albumId: 'al4', duration: 203, genre: 'Pop', plays: 8500000, liked: false },
  { id: 't9', title: 'Heartbeat', artistId: 'ar3', albumId: 'al4', duration: 178, genre: 'Pop', plays: 6700000, liked: false },
  { id: 't10', title: 'After Dark', artistId: 'ar4', albumId: 'al5', duration: 342, genre: 'Electronic', plays: 1900000, liked: false },
  { id: 't11', title: 'Bassline', artistId: 'ar4', albumId: 'al5', duration: 298, genre: 'Electronic', plays: 1500000, liked: false },
  { id: 't12', title: 'Velvet Touch', artistId: 'ar5', albumId: 'al6', duration: 256, genre: 'R&B', plays: 3400000, liked: false },
  { id: 't13', title: 'Slow Motion', artistId: 'ar5', albumId: 'al6', duration: 224, genre: 'R&B', plays: 2700000, liked: false },
  { id: 't14', title: 'Autumn Leaves', artistId: 'ar6', albumId: 'al7', duration: 278, genre: 'Indie', plays: 1200000, liked: false },
  { id: 't15', title: 'Campfire Song', artistId: 'ar6', albumId: 'al7', duration: 195, genre: 'Indie', plays: 980000, liked: false },
  { id: 't16', title: 'City Lights', artistId: 'ar7', albumId: 'al8', duration: 210, genre: 'Hip-Hop', plays: 7800000, liked: false },
  { id: 't17', title: 'Rise Up', artistId: 'ar7', albumId: 'al8', duration: 188, genre: 'Hip-Hop', plays: 6200000, liked: false },
  { id: 't18', title: 'Dreamscape', artistId: 'ar7', albumId: 'al8', duration: 232, genre: 'Hip-Hop', plays: 5400000, liked: false },
  { id: 't19', title: 'Moonlight Sonata Remix', artistId: 'ar8', albumId: 'al9', duration: 480, genre: 'Classical', plays: 2100000, liked: false },
  { id: 't20', title: 'Symphony No. 5 (Modern)', artistId: 'ar8', albumId: 'al9', duration: 540, genre: 'Classical', plays: 1700000, liked: false },
];

const INITIAL_PLAYLISTS = [
  { id: 'pl1', name: 'Favorites', description: 'My all-time favorites', trackIds: ['t7', 't4', 't1', 't12', 't16'], createdAt: Date.now() - 86400000 * 30, isSystem: true },
  { id: 'pl2', name: 'Workout Mix', description: 'High energy tracks for the gym', trackIds: ['t4', 't5', 't6', 't16', 't17', 't11'], createdAt: Date.now() - 86400000 * 14, isSystem: false },
  { id: 'pl3', name: 'Chill Vibes', description: 'Relaxing background music', trackIds: ['t12', 't13', 't14', 't15', 't19'], createdAt: Date.now() - 86400000 * 7, isSystem: false },
  { id: 'pl4', name: 'Recently Added', description: 'New discoveries', trackIds: ['t10', 't18', 't8', 't3'], createdAt: Date.now() - 86400000 * 2, isSystem: true },
];

const RECENTLY_PLAYED = [
  { trackId: 't7', playedAt: Date.now() - 60000 * 5 },
  { trackId: 't1', playedAt: Date.now() - 60000 * 30 },
  { trackId: 't16', playedAt: Date.now() - 60000 * 65 },
  { trackId: 't12', playedAt: Date.now() - 3600000 * 2 },
  { trackId: 't4', playedAt: Date.now() - 3600000 * 5 },
  { trackId: 't19', playedAt: Date.now() - 86400000 },
  { trackId: 't14', playedAt: Date.now() - 86400000 * 2 },
  { trackId: 't8', playedAt: Date.now() - 86400000 * 3 },
];

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatPlays(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function MusicStreamingApp() {
  const [tracks, setTracks] = useState(MOCK_TRACKS);
  const [playlists, setPlaylists] = useState(INITIAL_PLAYLISTS);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  const [activeView, setActiveView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showEditPlaylist, setShowEditPlaylist] = useState(null);
  const [showQueuePanel, setShowQueuePanel] = useState(false);
  const [showTrackMenu, setShowTrackMenu] = useState(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [genreFilter, setGenreFilter] = useState('all');
  const [recentlyPlayed, setRecentlyPlayed] = useState(RECENTLY_PLAYED);
  const [lyrics, setLyrics] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [equalizerPreset, setEqualizerPreset] = useState('normal');

  const progressInterval = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    try {
      const savedPlaylists = localStorage.getItem('musicPlaylists');
      if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
      const savedVolume = localStorage.getItem('musicVolume');
      if (savedVolume) setVolume(Number(savedVolume));
      const savedShuffle = localStorage.getItem('musicShuffle');
      if (savedShuffle) setShuffleEnabled(savedShuffle === 'true');
      const savedRepeat = localStorage.getItem('musicRepeat');
      if (savedRepeat) setRepeatMode(savedRepeat);
      const savedEq = localStorage.getItem('musicEqualizer');
      if (savedEq) setEqualizerPreset(savedEq);
      const savedLiked = localStorage.getItem('musicLikedTracks');
      if (savedLiked) {
        const likedIds = JSON.parse(savedLiked);
        setTracks((prev) => prev.map((t) => ({ ...t, liked: likedIds.includes(t.id) })));
      }
    } catch {
      // ignore corrupted localStorage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('musicPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('musicVolume', String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('musicShuffle', String(shuffleEnabled));
  }, [shuffleEnabled]);

  useEffect(() => {
    localStorage.setItem('musicRepeat', repeatMode);
  }, [repeatMode]);

  useEffect(() => {
    localStorage.setItem('musicEqualizer', equalizerPreset);
  }, [equalizerPreset]);

  useEffect(() => {
    const likedIds = tracks.filter((t) => t.liked).map((t) => t.id);
    localStorage.setItem('musicLikedTracks', JSON.stringify(likedIds));
  }, [tracks]);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            handleTrackEnd();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(progressInterval.current);
    }
    return () => clearInterval(progressInterval.current);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ') { e.preventDefault(); togglePlayPause(); }
      if (e.key === 'ArrowRight' && e.ctrlKey) playNext();
      if (e.key === 'ArrowLeft' && e.ctrlKey) playPrevious();
      if (e.key === 'm') toggleMute();
      if (e.key === 's') setShuffleEnabled((p) => !p);
      if (e.key === 'r') cycleRepeatMode();
      if (e.key === 'q') setShowQueuePanel((p) => !p);
      if (e.key === 'Escape') {
        setShowCreatePlaylist(false);
        setShowEditPlaylist(null);
        setShowQueuePanel(false);
        setShowTrackMenu(null);
        setShowAddToPlaylist(null);
        setShowLyrics(false);
        setSelectedPlaylist(null);
        setSelectedArtist(null);
        setSelectedAlbum(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActiveView('search');
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isPlaying, queue, queueIndex]);

  const getArtist = useCallback((artistId) => MOCK_ARTISTS.find((a) => a.id === artistId), []);
  const getAlbum = useCallback((albumId) => MOCK_ALBUMS.find((a) => a.id === albumId), []);

  const toggleLike = useCallback((trackId) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, liked: !t.liked } : t)));
  }, []);

  const playTrack = useCallback((track, contextTracks = null) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((rp) => rp.trackId !== track.id);
      return [{ trackId: track.id, playedAt: Date.now() }, ...filtered].slice(0, 20);
    });
    if (contextTracks) {
      const idx = contextTracks.findIndex((t) => t.id === track.id);
      setQueue(contextTracks);
      setQueueIndex(idx);
    } else if (queue.length === 0) {
      setQueue([track]);
      setQueueIndex(0);
    }
  }, [queue]);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((p) => !p);
  }, [currentTrack]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIndex;
    if (shuffleEnabled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') nextIndex = 0;
        else { setIsPlaying(false); return; }
      }
    }
    setQueueIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    setProgress(0);
    setIsPlaying(true);
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((rp) => rp.trackId !== queue[nextIndex].id);
      return [{ trackId: queue[nextIndex].id, playedAt: Date.now() }, ...filtered].slice(0, 20);
    });
  }, [queue, queueIndex, shuffleEnabled, repeatMode]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    if (progress > 3) {
      setProgress(0);
      return;
    }
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') prevIndex = queue.length - 1;
      else prevIndex = 0;
    }
    setQueueIndex(prevIndex);
    setCurrentTrack(queue[prevIndex]);
    setProgress(0);
    setIsPlaying(true);
  }, [queue, queueIndex, progress, repeatMode]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      setProgress(0);
      setIsPlaying(true);
    } else {
      playNext();
    }
  }, [repeatMode, playNext]);

  const toggleMute = useCallback(() => setIsMuted((p) => !p), []);
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < queueIndex) setQueueIndex((p) => p - 1);
    else if (index === queueIndex) {
      if (queue.length > 1) {
        const nextTrack = queue[index + 1] || queue[index - 1];
        setCurrentTrack(nextTrack);
        setProgress(0);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
        setProgress(0);
        setQueueIndex(-1);
      }
    }
  }, [queue, queueIndex]);

  const moveInQueue = useCallback((fromIndex, toIndex) => {
    setQueue((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
    if (fromIndex === queueIndex) setQueueIndex(toIndex);
    else if (fromIndex < queueIndex && toIndex >= queueIndex) setQueueIndex((p) => p - 1);
    else if (fromIndex > queueIndex && toIndex <= queueIndex) setQueueIndex((p) => p + 1);
  }, [queueIndex]);

  const clearQueue = useCallback(() => {
    const current = currentTrack ? [currentTrack] : [];
    setQueue(current);
    setQueueIndex(current.length > 0 ? 0 : -1);
  }, [currentTrack]);

  const createPlaylist = useCallback((name, description) => {
    const newPlaylist = {
      id: `pl_${Date.now()}`,
      name,
      description,
      trackIds: [],
      createdAt: Date.now(),
      isSystem: false,
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setShowCreatePlaylist(false);
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    if (selectedPlaylist?.id === playlistId) setSelectedPlaylist(null);
  }, [selectedPlaylist]);

  const updatePlaylist = useCallback((playlistId, updates) => {
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? { ...p, ...updates } : p)));
    setShowEditPlaylist(null);
  }, []);

  const addTrackToPlaylist = useCallback((trackId, playlistId) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId) ? { ...p, trackIds: [...p.trackIds, trackId] } : p
      )
    );
    setShowAddToPlaylist(null);
  }, []);

  const removeTrackFromPlaylist = useCallback((trackId, playlistId) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p))
    );
  }, []);

  const filteredTracks = useMemo(() => {
    let result = [...tracks];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => {
        const artist = getArtist(t.artistId);
        const album = getAlbum(t.albumId);
        if (searchFilter === 'tracks' || searchFilter === 'all') {
          if (t.title.toLowerCase().includes(q)) return true;
        }
        if (searchFilter === 'artists' || searchFilter === 'all') {
          if (artist?.name.toLowerCase().includes(q)) return true;
        }
        if (searchFilter === 'albums' || searchFilter === 'all') {
          if (album?.title.toLowerCase().includes(q)) return true;
        }
        if (searchFilter === 'all') {
          if (t.genre.toLowerCase().includes(q)) return true;
        }
        return false;
      });
    }
    if (genreFilter !== 'all') {
      result = result.filter((t) => t.genre === genreFilter);
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'artist') cmp = (getArtist(a.artistId)?.name || '').localeCompare(getArtist(b.artistId)?.name || '');
      else if (sortBy === 'duration') cmp = a.duration - b.duration;
      else if (sortBy === 'plays') cmp = a.plays - b.plays;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [tracks, searchQuery, searchFilter, genreFilter, sortBy, sortDirection, getArtist, getAlbum]);

  const searchedArtists = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    if (searchFilter !== 'all' && searchFilter !== 'artists') return [];
    return MOCK_ARTISTS.filter((a) => a.name.toLowerCase().includes(q));
  }, [searchQuery, searchFilter]);

  const searchedAlbums = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    if (searchFilter !== 'all' && searchFilter !== 'albums') return [];
    return MOCK_ALBUMS.filter((a) => a.title.toLowerCase().includes(q));
  }, [searchQuery, searchFilter]);

  const likedTracks = useMemo(() => tracks.filter((t) => t.liked), [tracks]);

  const topTracks = useMemo(() => [...tracks].sort((a, b) => b.plays - a.plays).slice(0, 10), [tracks]);

  const bgColor = '#0a0a0a';
  const surfaceColor = '#1a1a2e';
  const accentColor = '#6c63ff';
  const textPrimary = '#ffffff';
  const textSecondary = '#a0a0b0';
  const borderColor = '#2a2a40';

  const renderSidebar = () => (
    <div data-testid="sidebar" style={{ width: sidebarCollapsed ? 60 : 240, background: surfaceColor, borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}` }}>
        {!sidebarCollapsed && <span style={{ fontSize: 18, fontWeight: 'bold', color: accentColor }}>🎵 SonicFlow</span>}
        <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((p) => !p)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 18 }}>
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {[
          { key: 'home', icon: '🏠', label: 'Home' },
          { key: 'search', icon: '🔍', label: 'Search' },
          { key: 'library', icon: '📚', label: 'Library' },
          { key: 'liked', icon: '❤️', label: 'Liked Songs' },
          { key: 'artists', icon: '🎤', label: 'Artists' },
          { key: 'albums', icon: '💿', label: 'Albums' },
        ].map(({ key, icon, label }) => (
          <button key={key} data-testid={`nav-${key}`} onClick={() => { setActiveView(key); setSelectedPlaylist(null); setSelectedArtist(null); setSelectedAlbum(null); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 16px', background: activeView === key ? `${accentColor}22` : 'transparent', color: activeView === key ? accentColor : textSecondary, border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left' }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            {!sidebarCollapsed && label}
          </button>
        ))}
      </nav>
      {!sidebarCollapsed && (
        <div style={{ padding: '8px 16px', borderTop: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Playlists</span>
            <button data-testid="create-playlist-btn" onClick={() => setShowCreatePlaylist(true)} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', fontSize: 18 }}>+</button>
          </div>
          {playlists.map((pl) => (
            <button key={pl.id} data-testid={`playlist-${pl.id}`} onClick={() => { setSelectedPlaylist(pl); setActiveView('playlist'); }} style={{ display: 'block', width: '100%', padding: '6px 0', background: 'none', border: 'none', color: selectedPlaylist?.id === pl.id ? accentColor : textSecondary, cursor: 'pointer', textAlign: 'left', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pl.isSystem ? '📌' : '🎶'} {pl.name}
            </button>
          ))}
        </div>
      )}
      {!sidebarCollapsed && (
        <div data-testid="sidebar-stats" style={{ padding: '12px 16px', borderTop: `1px solid ${borderColor}`, color: textSecondary, fontSize: 11 }}>
          <div>{tracks.length} tracks • {playlists.length} playlists</div>
          <div>{likedTracks.length} liked songs</div>
        </div>
      )}
    </div>
  );

  const renderTrackRow = (track, index, contextTracks, playlistId = null) => {
    const artist = getArtist(track.artistId);
    const album = getAlbum(track.albumId);
    const isCurrentTrack = currentTrack?.id === track.id;
    return (
      <div key={track.id} data-testid={`track-${track.id}`} style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: isCurrentTrack ? `${accentColor}15` : 'transparent', borderRadius: 4, cursor: 'pointer', gap: 12, position: 'relative' }} onDoubleClick={() => playTrack(track, contextTracks)} role="row">
        <span style={{ width: 30, textAlign: 'right', color: textSecondary, fontSize: 13 }}>
          {isCurrentTrack && isPlaying ? '🔊' : index + 1}
        </span>
        <button aria-label={`Play ${track.title}`} onClick={() => playTrack(track, contextTracks)} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', fontSize: 16 }}>▶</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: isCurrentTrack ? accentColor : textPrimary, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</div>
          <div style={{ color: textSecondary, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedArtist(artist); setActiveView('artist-detail'); }}>{artist?.name}</span>
            {' • '}
            <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedAlbum(album); setActiveView('album-detail'); }}>{album?.title}</span>
          </div>
        </div>
        <button aria-label={track.liked ? `Unlike ${track.title}` : `Like ${track.title}`} onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }} style={{ background: 'none', border: 'none', color: track.liked ? '#ff4081' : textSecondary, cursor: 'pointer', fontSize: 16 }}>
          {track.liked ? '♥' : '♡'}
        </button>
        <span style={{ color: textSecondary, fontSize: 12, width: 60, textAlign: 'right' }}>{formatPlays(track.plays)}</span>
        <span style={{ color: textSecondary, fontSize: 12, width: 45, textAlign: 'right' }}>{formatDuration(track.duration)}</span>
        <button aria-label={`More options for ${track.title}`} onClick={(e) => { e.stopPropagation(); setShowTrackMenu(showTrackMenu === track.id ? null : track.id); }} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer' }}>⋯</button>
        {showTrackMenu === track.id && (
          <div data-testid={`track-menu-${track.id}`} style={{ position: 'absolute', right: 40, top: '100%', background: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 4, zIndex: 100, minWidth: 180 }}>
            <button onClick={() => { addToQueue(track); setShowTrackMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: textPrimary, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>Add to Queue</button>
            <button onClick={() => { setShowAddToPlaylist(track.id); setShowTrackMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: textPrimary, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>Add to Playlist</button>
            {playlistId && (
              <button onClick={() => { removeTrackFromPlaylist(track.id, playlistId); setShowTrackMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>Remove from Playlist</button>
            )}
            <button onClick={() => { setSelectedArtist(getArtist(track.artistId)); setActiveView('artist-detail'); setShowTrackMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: textPrimary, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>Go to Artist</button>
            <button onClick={() => { setSelectedAlbum(getAlbum(track.albumId)); setActiveView('album-detail'); setShowTrackMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: textPrimary, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>Go to Album</button>
          </div>
        )}
      </div>
    );
  };

  const renderHomeView = () => (
    <div data-testid="home-view">
      <h2 style={{ color: textPrimary, fontSize: 24, marginBottom: 24 }}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</h2>
      <section style={{ marginBottom: 32 }}>
        <h3 style={{ color: textPrimary, fontSize: 18, marginBottom: 12 }}>Recently Played</h3>
        <div data-testid="recently-played" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {recentlyPlayed.slice(0, 6).map((rp) => {
            const track = tracks.find((t) => t.id === rp.trackId);
            if (!track) return null;
            const artist = getArtist(track.artistId);
            const album = getAlbum(track.albumId);
            return (
              <div key={rp.trackId} data-testid={`recent-${rp.trackId}`} onClick={() => playTrack(track, tracks)} style={{ background: surfaceColor, borderRadius: 8, padding: 12, cursor: 'pointer' }}>
                <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>{album?.cover}</div>
                <div style={{ color: textPrimary, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</div>
                <div style={{ color: textSecondary, fontSize: 11 }}>{artist?.name}</div>
                <div style={{ color: textSecondary, fontSize: 10 }}>{formatTimeAgo(rp.playedAt)}</div>
              </div>
            );
          })}
        </div>
      </section>
      <section style={{ marginBottom: 32 }}>
        <h3 style={{ color: textPrimary, fontSize: 18, marginBottom: 12 }}>Top Charts</h3>
        <div data-testid="top-charts">
          {topTracks.map((track, i) => renderTrackRow(track, i, topTracks))}
        </div>
      </section>
      <section style={{ marginBottom: 32 }}>
        <h3 style={{ color: textPrimary, fontSize: 18, marginBottom: 12 }}>Your Playlists</h3>
        <div data-testid="home-playlists" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {playlists.map((pl) => (
            <div key={pl.id} data-testid={`home-playlist-${pl.id}`} onClick={() => { setSelectedPlaylist(pl); setActiveView('playlist'); }} style={{ background: surfaceColor, borderRadius: 8, padding: 16, cursor: 'pointer' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{pl.isSystem ? '📌' : '🎶'}</div>
              <div style={{ color: textPrimary, fontSize: 14, fontWeight: 500 }}>{pl.name}</div>
              <div style={{ color: textSecondary, fontSize: 12 }}>{pl.trackIds.length} tracks</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 style={{ color: textPrimary, fontSize: 18, marginBottom: 12 }}>Browse by Genre</h3>
        <div data-testid="genre-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
          {GENRES.map((genre) => (
            <button key={genre} data-testid={`genre-${genre}`} onClick={() => { setGenreFilter(genre); setActiveView('library'); }} style={{ padding: '20px 12px', borderRadius: 8, background: `${accentColor}33`, border: 'none', color: textPrimary, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              {genre}
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  const renderSearchView = () => (
    <div data-testid="search-view">
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <input ref={searchInputRef} data-testid="search-input" type="text" placeholder="Search tracks, artists, albums..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: `1px solid ${borderColor}`, background: surfaceColor, color: textPrimary, fontSize: 16 }} />
        <select data-testid="search-filter" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} aria-label="Search category" style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: surfaceColor, color: textPrimary }}>
          <option value="all">All</option>
          <option value="tracks">Tracks</option>
          <option value="artists">Artists</option>
          <option value="albums">Albums</option>
        </select>
      </div>
      {searchQuery && (
        <>
          {searchedArtists.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ color: textPrimary, fontSize: 16, marginBottom: 8 }}>Artists</h3>
              <div data-testid="search-artists" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {searchedArtists.map((artist) => (
                  <div key={artist.id} data-testid={`search-artist-${artist.id}`} onClick={() => { setSelectedArtist(artist); setActiveView('artist-detail'); }} style={{ background: surfaceColor, borderRadius: 8, padding: 16, cursor: 'pointer', textAlign: 'center', width: 140 }}>
                    <div style={{ fontSize: 36 }}>{artist.avatar}</div>
                    <div style={{ color: textPrimary, fontSize: 13, fontWeight: 500 }}>{artist.name}</div>
                    <div style={{ color: textSecondary, fontSize: 11 }}>{artist.verified ? '✓ Verified' : ''}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {searchedAlbums.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ color: textPrimary, fontSize: 16, marginBottom: 8 }}>Albums</h3>
              <div data-testid="search-albums" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {searchedAlbums.map((album) => {
                  const artist = getArtist(album.artistId);
                  return (
                    <div key={album.id} data-testid={`search-album-${album.id}`} onClick={() => { setSelectedAlbum(album); setActiveView('album-detail'); }} style={{ background: surfaceColor, borderRadius: 8, padding: 16, cursor: 'pointer', width: 160 }}>
                      <div style={{ fontSize: 36, textAlign: 'center' }}>{album.cover}</div>
                      <div style={{ color: textPrimary, fontSize: 13, fontWeight: 500 }}>{album.title}</div>
                      <div style={{ color: textSecondary, fontSize: 11 }}>{artist?.name} • {album.year}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          <section>
            <h3 style={{ color: textPrimary, fontSize: 16, marginBottom: 8 }}>Tracks ({filteredTracks.length})</h3>
            <div data-testid="search-tracks">
              {filteredTracks.map((track, i) => renderTrackRow(track, i, filteredTracks))}
            </div>
          </section>
        </>
      )}
      {!searchQuery && (
        <div style={{ textAlign: 'center', padding: 48, color: textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p>Search for tracks, artists, or albums</p>
          <p style={{ fontSize: 12 }}>Tip: Press Ctrl+K anywhere to search</p>
        </div>
      )}
    </div>
  );

  const renderLibraryView = () => (
    <div data-testid="library-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: textPrimary, fontSize: 24 }}>Library</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select data-testid="genre-filter" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} aria-label="Filter by genre" style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, background: surfaceColor, color: textPrimary, fontSize: 13 }}>
            <option value="all">All Genres</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select data-testid="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort by" style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, background: surfaceColor, color: textPrimary, fontSize: 13 }}>
            <option value="title">Title</option>
            <option value="artist">Artist</option>
            <option value="duration">Duration</option>
            <option value="plays">Plays</option>
          </select>
          <button data-testid="sort-direction" onClick={() => setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'))} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, background: surfaceColor, color: textPrimary, cursor: 'pointer', fontSize: 13 }}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      <div style={{ color: textSecondary, fontSize: 13, marginBottom: 12 }}>
        Showing {filteredTracks.length} of {tracks.length} tracks
        {genreFilter !== 'all' && ` • Filtered by ${genreFilter}`}
      </div>
      <div data-testid="library-tracks" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredTracks.map((track, i) => renderTrackRow(track, i, filteredTracks))}
      </div>
      {filteredTracks.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: textSecondary }}>No tracks found matching your filters.</div>
      )}
    </div>
  );

  const renderLikedView = () => (
    <div data-testid="liked-view">
      <h2 style={{ color: textPrimary, fontSize: 24, marginBottom: 4 }}>Liked Songs</h2>
      <p style={{ color: textSecondary, fontSize: 13, marginBottom: 16 }}>{likedTracks.length} songs</p>
      {likedTracks.length > 0 && (
        <button data-testid="play-all-liked" onClick={() => playTrack(likedTracks[0], likedTracks)} style={{ padding: '10px 24px', borderRadius: 24, background: accentColor, color: textPrimary, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>▶ Play All</button>
      )}
      <div data-testid="liked-tracks">
        {likedTracks.map((track, i) => renderTrackRow(track, i, likedTracks))}
      </div>
      {likedTracks.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
          <p>Songs you like will appear here</p>
        </div>
      )}
    </div>
  );

  const renderArtistsView = () => (
    <div data-testid="artists-view">
      <h2 style={{ color: textPrimary, fontSize: 24, marginBottom: 16 }}>Artists</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {MOCK_ARTISTS.map((artist) => {
          const artistTracks = tracks.filter((t) => t.artistId === artist.id);
          return (
            <div key={artist.id} data-testid={`artist-card-${artist.id}`} onClick={() => { setSelectedArtist(artist); setActiveView('artist-detail'); }} style={{ background: surfaceColor, borderRadius: 8, padding: 16, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{artist.avatar}</div>
              <div style={{ color: textPrimary, fontSize: 14, fontWeight: 500 }}>{artist.name}</div>
              <div style={{ color: textSecondary, fontSize: 12 }}>{artist.genre}</div>
              <div style={{ color: textSecondary, fontSize: 11 }}>{formatPlays(artist.followers)} followers • {artistTracks.length} tracks</div>
              {artist.verified && <span style={{ color: accentColor, fontSize: 11 }}>✓ Verified</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderArtistDetailView = () => {
    if (!selectedArtist) return null;
    const artistTracks = tracks.filter((t) => t.artistId === selectedArtist.id);
    const artistAlbums = MOCK_ALBUMS.filter((a) => a.artistId === selectedArtist.id);
    const totalPlays = artistTracks.reduce((sum, t) => sum + t.plays, 0);
    return (
      <div data-testid="artist-detail-view">
        <button data-testid="back-button" onClick={() => setActiveView('artists')} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>← Back to Artists</button>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 72 }}>{selectedArtist.avatar}</div>
          <div>
            <h2 style={{ color: textPrimary, fontSize: 28, margin: 0 }}>{selectedArtist.name}</h2>
            <div style={{ color: textSecondary, fontSize: 14 }}>{selectedArtist.genre} {selectedArtist.verified && '• ✓ Verified Artist'}</div>
            <div style={{ color: textSecondary, fontSize: 13 }}>{formatPlays(selectedArtist.followers)} followers • {formatPlays(totalPlays)} total plays</div>
          </div>
        </div>
        <button data-testid="play-artist" onClick={() => { if (artistTracks.length > 0) playTrack(artistTracks[0], artistTracks); }} style={{ padding: '10px 24px', borderRadius: 24, background: accentColor, color: textPrimary, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 24 }}>▶ Play All</button>
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ color: textPrimary, fontSize: 18, marginBottom: 8 }}>Albums</h3>
          <div data-testid="artist-albums" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {artistAlbums.map((album) => (
              <div key={album.id} data-testid={`artist-album-${album.id}`} onClick={() => { setSelectedAlbum(album); setActiveView('album-detail'); }} style={{ background: surfaceColor, borderRadius: 8, padding: 16, cursor: 'pointer', width: 160 }}>
                <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>{album.cover}</div>
                <div style={{ color: textPrimary, fontSize: 13, fontWeight: 500 }}>{album.title}</div>
                <div style={{ color: textSecondary, fontSize: 11 }}>{album.year} • {album.trackCount} tracks</div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 style={{ color: textPrimary, fontSize: 18, marginBottom: 8 }}>Popular Tracks</h3>
          <div data-testid="artist-tracks">
            {artistTracks.sort((a, b) => b.plays - a.plays).map((track, i) => renderTrackRow(track, i, artistTracks))}
          </div>
        </section>
      </div>
    );
  };

  const renderAlbumsView = () => (
    <div data-testid="albums-view">
      <h2 style={{ color: textPrimary, fontSize: 24, marginBottom: 16 }}>Albums</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {MOCK_ALBUMS.map((album) => {
          const artist = getArtist(album.artistId);
          return (
            <div key={album.id} data-testid={`album-card-${album.id}`} onClick={() => { setSelectedAlbum(album); setActiveView('album-detail'); }} style={{ background: surfaceColor, borderRadius: 8, padding: 16, cursor: 'pointer' }}>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{album.cover}</div>
              <div style={{ color: textPrimary, fontSize: 14, fontWeight: 500 }}>{album.title}</div>
              <div style={{ color: textSecondary, fontSize: 12 }}>{artist?.name} • {album.year}</div>
              <div style={{ color: textSecondary, fontSize: 11 }}>{album.trackCount} tracks</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAlbumDetailView = () => {
    if (!selectedAlbum) return null;
    const albumTracks = tracks.filter((t) => t.albumId === selectedAlbum.id);
    const artist = getArtist(selectedAlbum.artistId);
    const totalDuration = albumTracks.reduce((sum, t) => sum + t.duration, 0);
    return (
      <div data-testid="album-detail-view">
        <button data-testid="back-button" onClick={() => setActiveView('albums')} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>← Back to Albums</button>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ fontSize: 96, background: surfaceColor, borderRadius: 12, padding: 20 }}>{selectedAlbum.cover}</div>
          <div>
            <h2 style={{ color: textPrimary, fontSize: 28, margin: 0 }}>{selectedAlbum.title}</h2>
            <div style={{ color: textSecondary, fontSize: 14, cursor: 'pointer' }} onClick={() => { setSelectedArtist(artist); setActiveView('artist-detail'); }}>{artist?.name}</div>
            <div style={{ color: textSecondary, fontSize: 13 }}>{selectedAlbum.year} • {albumTracks.length} tracks • {formatDuration(totalDuration)}</div>
          </div>
        </div>
        <button data-testid="play-album" onClick={() => { if (albumTracks.length > 0) playTrack(albumTracks[0], albumTracks); }} style={{ padding: '10px 24px', borderRadius: 24, background: accentColor, color: textPrimary, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>▶ Play Album</button>
        <div data-testid="album-tracks">
          {albumTracks.map((track, i) => renderTrackRow(track, i, albumTracks))}
        </div>
      </div>
    );
  };

  const renderPlaylistView = () => {
    if (!selectedPlaylist) return null;
    const playlistTracks = selectedPlaylist.trackIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean);
    const totalDuration = playlistTracks.reduce((sum, t) => sum + t.duration, 0);
    return (
      <div data-testid="playlist-view">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ color: textPrimary, fontSize: 24, margin: 0 }}>{selectedPlaylist.name}</h2>
            <p style={{ color: textSecondary, fontSize: 13 }}>{selectedPlaylist.description}</p>
            <p style={{ color: textSecondary, fontSize: 12 }}>{playlistTracks.length} tracks • {formatDuration(totalDuration)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!selectedPlaylist.isSystem && (
              <>
                <button data-testid="edit-playlist-btn" onClick={() => setShowEditPlaylist(selectedPlaylist)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${borderColor}`, background: 'transparent', color: textPrimary, cursor: 'pointer', fontSize: 13 }}>Edit</button>
                <button data-testid="delete-playlist-btn" onClick={() => deletePlaylist(selectedPlaylist.id)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${borderColor}`, background: 'transparent', color: '#ff4444', cursor: 'pointer', fontSize: 13 }}>Delete</button>
              </>
            )}
          </div>
        </div>
        {playlistTracks.length > 0 && (
          <button data-testid="play-playlist" onClick={() => playTrack(playlistTracks[0], playlistTracks)} style={{ padding: '10px 24px', borderRadius: 24, background: accentColor, color: textPrimary, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>▶ Play All</button>
        )}
        <div data-testid="playlist-tracks">
          {playlistTracks.map((track, i) => renderTrackRow(track, i, playlistTracks, selectedPlaylist.id))}
        </div>
        {playlistTracks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: textSecondary }}>This playlist is empty. Add some tracks!</div>
        )}
      </div>
    );
  };

  const renderNowPlayingBar = () => {
    if (!currentTrack) return null;
    const artist = getArtist(currentTrack.artistId);
    const album = getAlbum(currentTrack.albumId);
    const progressPercent = currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;
    return (
      <div data-testid="now-playing-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 80, background: surfaceColor, borderTop: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 250, minWidth: 0 }}>
          <div style={{ fontSize: 36 }}>{album?.cover}</div>
          <div style={{ minWidth: 0 }}>
            <div data-testid="now-playing-title" style={{ color: textPrimary, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.title}</div>
            <div data-testid="now-playing-artist" style={{ color: textSecondary, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artist?.name}</div>
          </div>
          <button aria-label={currentTrack.liked ? 'Unlike current track' : 'Like current track'} onClick={() => toggleLike(currentTrack.id)} style={{ background: 'none', border: 'none', color: currentTrack.liked ? '#ff4081' : textSecondary, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>
            {currentTrack.liked ? '♥' : '♡'}
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button data-testid="shuffle-btn" aria-label="Toggle shuffle" onClick={() => setShuffleEnabled((p) => !p)} style={{ background: 'none', border: 'none', color: shuffleEnabled ? accentColor : textSecondary, cursor: 'pointer', fontSize: 16 }}>🔀</button>
            <button data-testid="prev-btn" aria-label="Previous track" onClick={playPrevious} style={{ background: 'none', border: 'none', color: textPrimary, cursor: 'pointer', fontSize: 18 }}>⏮</button>
            <button data-testid="play-pause-btn" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayPause} style={{ width: 36, height: 36, borderRadius: '50%', background: accentColor, border: 'none', color: textPrimary, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button data-testid="next-btn" aria-label="Next track" onClick={playNext} style={{ background: 'none', border: 'none', color: textPrimary, cursor: 'pointer', fontSize: 18 }}>⏭</button>
            <button data-testid="repeat-btn" aria-label="Toggle repeat" onClick={cycleRepeatMode} style={{ background: 'none', border: 'none', color: repeatMode !== 'off' ? accentColor : textSecondary, cursor: 'pointer', fontSize: 16 }}>
              {repeatMode === 'one' ? '🔂' : '🔁'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 500 }}>
            <span data-testid="progress-current" style={{ color: textSecondary, fontSize: 11, width: 40, textAlign: 'right' }}>{formatDuration(progress)}</span>
            <div data-testid="progress-bar" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; setProgress(Math.floor(pct * currentTrack.duration)); }} style={{ flex: 1, height: 4, background: borderColor, borderRadius: 2, cursor: 'pointer', position: 'relative' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: accentColor, borderRadius: 2 }} />
            </div>
            <span data-testid="progress-total" style={{ color: textSecondary, fontSize: 11, width: 40 }}>{formatDuration(currentTrack.duration)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 200, justifyContent: 'flex-end' }}>
          <button data-testid="lyrics-btn" aria-label="Toggle lyrics" onClick={() => setShowLyrics((p) => !p)} style={{ background: 'none', border: 'none', color: showLyrics ? accentColor : textSecondary, cursor: 'pointer', fontSize: 14 }}>📝</button>
          <button data-testid="queue-btn" aria-label="Toggle queue" onClick={() => setShowQueuePanel((p) => !p)} style={{ background: 'none', border: 'none', color: showQueuePanel ? accentColor : textSecondary, cursor: 'pointer', fontSize: 14 }}>📋</button>
          <button data-testid="mute-btn" aria-label={isMuted ? 'Unmute' : 'Mute'} onClick={toggleMute} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 14 }}>
            {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
          </button>
          <input data-testid="volume-slider" type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); if (isMuted) setIsMuted(false); }} aria-label="Volume" style={{ width: 80 }} />
          <select data-testid="eq-preset" value={equalizerPreset} onChange={(e) => setEqualizerPreset(e.target.value)} aria-label="Equalizer preset" style={{ padding: '4px 6px', borderRadius: 4, border: `1px solid ${borderColor}`, background: surfaceColor, color: textSecondary, fontSize: 10 }}>
            <option value="normal">Normal</option>
            <option value="bass">Bass Boost</option>
            <option value="vocal">Vocal</option>
            <option value="treble">Treble</option>
          </select>
        </div>
      </div>
    );
  };

  const renderQueuePanel = () => {
    if (!showQueuePanel) return null;
    return (
      <div data-testid="queue-panel" style={{ position: 'fixed', right: 0, top: 0, bottom: 80, width: 350, background: surfaceColor, borderLeft: `1px solid ${borderColor}`, zIndex: 150, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: `1px solid ${borderColor}` }}>
          <h3 style={{ color: textPrimary, fontSize: 16, margin: 0 }}>Queue</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button data-testid="clear-queue" onClick={clearQueue} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 12 }}>Clear</button>
            <button onClick={() => setShowQueuePanel(false)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
          {queue.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: textSecondary }}>Queue is empty</div>}
          {queue.map((track, i) => {
            const artist = getArtist(track.artistId);
            const isCurrent = i === queueIndex;
            return (
              <div key={`queue-${i}`} data-testid={`queue-item-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', borderRadius: 4, background: isCurrent ? `${accentColor}22` : 'transparent' }}>
                <span style={{ color: textSecondary, fontSize: 11, width: 20 }}>{isCurrent ? '▶' : i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: isCurrent ? accentColor : textPrimary, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</div>
                  <div style={{ color: textSecondary, fontSize: 11 }}>{artist?.name}</div>
                </div>
                <span style={{ color: textSecondary, fontSize: 11 }}>{formatDuration(track.duration)}</span>
                {i > 0 && <button aria-label={`Move ${track.title} up`} onClick={() => moveInQueue(i, i - 1)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 12 }}>↑</button>}
                {i < queue.length - 1 && <button aria-label={`Move ${track.title} down`} onClick={() => moveInQueue(i, i + 1)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 12 }}>↓</button>}
                <button aria-label={`Remove ${track.title} from queue`} onClick={() => removeFromQueue(i)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCreatePlaylistModal = () => {
    if (!showCreatePlaylist) return null;
    return (
      <div data-testid="create-playlist-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setShowCreatePlaylist(false); }}>
        <div style={{ background: surfaceColor, borderRadius: 12, padding: 24, width: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: textPrimary, margin: 0 }}>Create Playlist</h3>
            <button onClick={() => setShowCreatePlaylist(false)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); createPlaylist(fd.get('name'), fd.get('description')); }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', color: textSecondary, fontSize: 12, marginBottom: 4 }}>Name *</label>
              <input name="name" required placeholder="My Playlist" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, background: bgColor, color: textPrimary, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: textSecondary, fontSize: 12, marginBottom: 4 }}>Description</label>
              <textarea name="description" placeholder="Add a description..." rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, background: bgColor, color: textPrimary, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowCreatePlaylist(false)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${borderColor}`, background: 'transparent', color: textPrimary, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: accentColor, border: 'none', color: textPrimary, cursor: 'pointer' }}>Create</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditPlaylistModal = () => {
    if (!showEditPlaylist) return null;
    return (
      <div data-testid="edit-playlist-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setShowEditPlaylist(null); }}>
        <div style={{ background: surfaceColor, borderRadius: 12, padding: 24, width: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: textPrimary, margin: 0 }}>Edit Playlist</h3>
            <button onClick={() => setShowEditPlaylist(null)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); updatePlaylist(showEditPlaylist.id, { name: fd.get('name'), description: fd.get('description') }); }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', color: textSecondary, fontSize: 12, marginBottom: 4 }}>Name *</label>
              <input name="name" required defaultValue={showEditPlaylist.name} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, background: bgColor, color: textPrimary, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: textSecondary, fontSize: 12, marginBottom: 4 }}>Description</label>
              <textarea name="description" defaultValue={showEditPlaylist.description} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, background: bgColor, color: textPrimary, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowEditPlaylist(null)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${borderColor}`, background: 'transparent', color: textPrimary, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: accentColor, border: 'none', color: textPrimary, cursor: 'pointer' }}>Save</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAddToPlaylistModal = () => {
    if (!showAddToPlaylist) return null;
    return (
      <div data-testid="add-to-playlist-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setShowAddToPlaylist(null); }}>
        <div style={{ background: surfaceColor, borderRadius: 12, padding: 24, width: 350 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: textPrimary, margin: 0 }}>Add to Playlist</h3>
            <button onClick={() => setShowAddToPlaylist(null)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
          <div data-testid="playlist-options">
            {playlists.map((pl) => {
              const alreadyAdded = pl.trackIds.includes(showAddToPlaylist);
              return (
                <button key={pl.id} data-testid={`add-to-${pl.id}`} onClick={() => !alreadyAdded && addTrackToPlaylist(showAddToPlaylist, pl.id)} disabled={alreadyAdded} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', background: 'none', border: 'none', borderBottom: `1px solid ${borderColor}`, color: alreadyAdded ? textSecondary : textPrimary, cursor: alreadyAdded ? 'default' : 'pointer', opacity: alreadyAdded ? 0.5 : 1 }}>
                  <span>{pl.name}</span>
                  <span style={{ fontSize: 11 }}>{alreadyAdded ? '✓ Added' : `${pl.trackIds.length} tracks`}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'home': return renderHomeView();
      case 'search': return renderSearchView();
      case 'library': return renderLibraryView();
      case 'liked': return renderLikedView();
      case 'artists': return renderArtistsView();
      case 'artist-detail': return renderArtistDetailView();
      case 'albums': return renderAlbumsView();
      case 'album-detail': return renderAlbumDetailView();
      case 'playlist': return renderPlaylistView();
      default: return renderHomeView();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: bgColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: textPrimary }}>
      {renderSidebar()}
      <main style={{ flex: 1, overflow: 'auto', padding: 24, paddingBottom: currentTrack ? 104 : 24, marginRight: showQueuePanel ? 350 : 0, transition: 'margin-right 0.2s' }}>
        {renderMainContent()}
      </main>
      {renderQueuePanel()}
      {renderNowPlayingBar()}
      {renderCreatePlaylistModal()}
      {renderEditPlaylistModal()}
      {renderAddToPlaylistModal()}
      {showLyrics && currentTrack && (
        <div data-testid="lyrics-panel" style={{ position: 'fixed', right: showQueuePanel ? 350 : 0, top: 0, bottom: 80, width: 300, background: surfaceColor, borderLeft: `1px solid ${borderColor}`, zIndex: 140, padding: 24, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: textPrimary, margin: 0 }}>Lyrics</h3>
            <button onClick={() => setShowLyrics(false)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
          <p style={{ color: textSecondary, fontStyle: 'italic' }}>Lyrics not available for "{currentTrack.title}"</p>
        </div>
      )}
    </div>
  );
}
