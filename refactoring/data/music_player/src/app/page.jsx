import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const GENRES = ['All', 'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country'];

const MOCK_ARTISTS = [
  { id: 'a1', name: 'Luna Wave', avatar: '🎤', genre: 'Pop', followers: 2400000 },
  { id: 'a2', name: 'Steel Horizon', avatar: '🎸', genre: 'Rock', followers: 1800000 },
  { id: 'a3', name: 'DJ Prism', avatar: '🎧', genre: 'Electronic', followers: 3100000 },
  { id: 'a4', name: 'Miles Beyond', avatar: '🎺', genre: 'Jazz', followers: 950000 },
  { id: 'a5', name: 'The Velvet Keys', avatar: '🎹', genre: 'Classical', followers: 720000 },
  { id: 'a6', name: 'MC Thunder', avatar: '🎙️', genre: 'Hip-Hop', followers: 4200000 },
  { id: 'a7', name: 'Rosewood', avatar: '🪕', genre: 'Country', followers: 1100000 },
  { id: 'a8', name: 'Neon Pulse', avatar: '💿', genre: 'Electronic', followers: 2700000 },
];

const MOCK_ALBUMS = [
  { id: 'al1', title: 'Midnight Glow', artistId: 'a1', year: 2024, cover: '🌙', trackCount: 12 },
  { id: 'al2', title: 'Electric Storm', artistId: 'a2', year: 2023, cover: '⚡', trackCount: 10 },
  { id: 'al3', title: 'Neon Dreams', artistId: 'a3', year: 2024, cover: '🌈', trackCount: 14 },
  { id: 'al4', title: 'Blue Notes', artistId: 'a4', year: 2022, cover: '🎵', trackCount: 8 },
  { id: 'al5', title: 'Sonata Collection', artistId: 'a5', year: 2023, cover: '🎼', trackCount: 6 },
  { id: 'al6', title: 'Street Poetry', artistId: 'a6', year: 2024, cover: '🏙️', trackCount: 16 },
  { id: 'al7', title: 'Dusty Roads', artistId: 'a7', year: 2023, cover: '🛤️', trackCount: 11 },
  { id: 'al8', title: 'Synthwave Odyssey', artistId: 'a8', year: 2024, cover: '🚀', trackCount: 13 },
  { id: 'al9', title: 'Starlight Sessions', artistId: 'a1', year: 2023, cover: '⭐', trackCount: 10 },
  { id: 'al10', title: 'Thunderclap', artistId: 'a2', year: 2024, cover: '🔥', trackCount: 9 },
];

const MOCK_TRACKS = [
  { id: 't1', title: 'Moonrise', artistId: 'a1', albumId: 'al1', duration: 214, genre: 'Pop', plays: 1200000 },
  { id: 't2', title: 'City Lights', artistId: 'a1', albumId: 'al1', duration: 198, genre: 'Pop', plays: 980000 },
  { id: 't3', title: 'Dreaming Wide Awake', artistId: 'a1', albumId: 'al1', duration: 243, genre: 'Pop', plays: 1500000 },
  { id: 't4', title: 'Thunder Road', artistId: 'a2', albumId: 'al2', duration: 267, genre: 'Rock', plays: 870000 },
  { id: 't5', title: 'Breaking Chains', artistId: 'a2', albumId: 'al2', duration: 312, genre: 'Rock', plays: 1100000 },
  { id: 't6', title: 'Voltage', artistId: 'a2', albumId: 'al10', duration: 189, genre: 'Rock', plays: 750000 },
  { id: 't7', title: 'Pulse', artistId: 'a3', albumId: 'al3', duration: 356, genre: 'Electronic', plays: 2300000 },
  { id: 't8', title: 'Digital Horizon', artistId: 'a3', albumId: 'al3', duration: 298, genre: 'Electronic', plays: 1800000 },
  { id: 't9', title: 'Neon Rain', artistId: 'a3', albumId: 'al3', duration: 274, genre: 'Electronic', plays: 2100000 },
  { id: 't10', title: 'Autumn Leaves', artistId: 'a4', albumId: 'al4', duration: 345, genre: 'Jazz', plays: 450000 },
  { id: 't11', title: 'Midnight Blue', artistId: 'a4', albumId: 'al4', duration: 412, genre: 'Jazz', plays: 380000 },
  { id: 't12', title: 'Piano Sonata No. 3', artistId: 'a5', albumId: 'al5', duration: 487, genre: 'Classical', plays: 290000 },
  { id: 't13', title: 'Concerto in D Minor', artistId: 'a5', albumId: 'al5', duration: 523, genre: 'Classical', plays: 210000 },
  { id: 't14', title: 'Flow State', artistId: 'a6', albumId: 'al6', duration: 203, genre: 'Hip-Hop', plays: 3400000 },
  { id: 't15', title: 'Crown', artistId: 'a6', albumId: 'al6', duration: 178, genre: 'Hip-Hop', plays: 2900000 },
  { id: 't16', title: 'Real Talk', artistId: 'a6', albumId: 'al6', duration: 224, genre: 'Hip-Hop', plays: 2600000 },
  { id: 't17', title: 'Open Highway', artistId: 'a7', albumId: 'al7', duration: 256, genre: 'Country', plays: 620000 },
  { id: 't18', title: 'Porch Light', artistId: 'a7', albumId: 'al7', duration: 231, genre: 'Country', plays: 540000 },
  { id: 't19', title: 'Retrowave', artistId: 'a8', albumId: 'al8', duration: 318, genre: 'Electronic', plays: 1900000 },
  { id: 't20', title: 'Chrome Future', artistId: 'a8', albumId: 'al8', duration: 287, genre: 'Electronic', plays: 1600000 },
  { id: 't21', title: 'Starlight', artistId: 'a1', albumId: 'al9', duration: 207, genre: 'Pop', plays: 1350000 },
  { id: 't22', title: 'Gravity', artistId: 'a1', albumId: 'al9', duration: 195, genre: 'Pop', plays: 1100000 },
  { id: 't23', title: 'Firestarter', artistId: 'a2', albumId: 'al10', duration: 234, genre: 'Rock', plays: 920000 },
  { id: 't24', title: 'Wildfire', artistId: 'a2', albumId: 'al10', duration: 278, genre: 'Rock', plays: 810000 },
];

const MOCK_PLAYLISTS = [
  { id: 'p1', name: 'Chill Vibes', description: 'Relaxing tunes for any mood', trackIds: ['t1', 't10', 't11', 't21', 't22'], cover: '🌊' },
  { id: 'p2', name: 'Workout Mix', description: 'High energy tracks to keep you moving', trackIds: ['t5', 't7', 't14', 't15', 't19'], cover: '💪' },
  { id: 'p3', name: 'Road Trip', description: 'Perfect soundtrack for the open road', trackIds: ['t4', 't6', 't17', 't18', 't23', 't24'], cover: '🚗' },
  { id: 'p4', name: 'Late Night Coding', description: 'Focus-friendly electronic beats', trackIds: ['t7', 't8', 't9', 't19', 't20'], cover: '💻' },
];

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatPlayCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [playlists, setPlaylists] = useState(MOCK_PLAYLISTS);
  const [activeView, setActiveView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null);
  const [showQueuePanel, setShowQueuePanel] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [equalizerPreset, setEqualizerPreset] = useState('flat');
  const [showTrackContextMenu, setShowTrackContextMenu] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const playIntervalRef = useRef(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('musicPlayerFavorites');
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { /* ignore */ }
    }
    const savedPlaylists = localStorage.getItem('musicPlayerPlaylists');
    if (savedPlaylists) {
      try { setPlaylists(JSON.parse(savedPlaylists)); } catch (e) { /* ignore */ }
    }
    const savedVolume = localStorage.getItem('musicPlayerVolume');
    if (savedVolume) setVolume(Number(savedVolume));
    const savedRecent = localStorage.getItem('musicPlayerRecent');
    if (savedRecent) {
      try { setRecentlyPlayed(JSON.parse(savedRecent)); } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('musicPlayerFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('musicPlayerPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('musicPlayerVolume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('musicPlayerRecent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      playIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            handleTrackEnd();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, currentTrack]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      setProgress(0);
      return;
    }
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      playTrack(queue[nextIndex]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      setQueueIndex(0);
      playTrack(queue[0]);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [repeatMode, queue, queueIndex]);

  const playTrack = useCallback((track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((id) => id !== track.id);
      return [track.id, ...filtered].slice(0, 20);
    });
  }, []);

  const playTrackInContext = useCallback((track, trackList) => {
    const shuffled = isShuffled
      ? [track, ...trackList.filter((t) => t.id !== track.id).sort(() => Math.random() - 0.5)]
      : trackList;
    setQueue(shuffled);
    setQueueIndex(shuffled.findIndex((t) => t.id === track.id));
    playTrack(track);
  }, [isShuffled, playTrack]);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying((prev) => !prev);
  }, [currentTrack]);

  const skipNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1 >= queue.length ? 0 : queueIndex + 1;
    }
    setQueueIndex(nextIndex);
    playTrack(queue[nextIndex]);
  }, [queue, queueIndex, isShuffled, playTrack]);

  const skipPrevious = useCallback(() => {
    if (queue.length === 0) return;
    if (progress > 3) {
      setProgress(0);
      return;
    }
    const prevIndex = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex]);
  }, [queue, queueIndex, progress, playTrack]);

  const toggleFavorite = useCallback((trackId) => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleProgressClick = useCallback((e) => {
    if (!progressBarRef.current || !currentTrack) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    setProgress(Math.floor(fraction * currentTrack.duration));
  }, [currentTrack]);

  const handleVolumeClick = useCallback((e) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    setVolume(Math.round(Math.max(0, Math.min(100, fraction * 100))));
    setIsMuted(false);
  }, []);

  const addToQueue = useCallback((track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < queueIndex) setQueueIndex((prev) => prev - 1);
    if (index === queueIndex) {
      if (queue.length > 1) {
        playTrack(queue[index + 1] || queue[index - 1]);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    }
  }, [queueIndex, queue, playTrack]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const createPlaylist = useCallback((name, description) => {
    const newPlaylist = {
      id: `p${Date.now()}`,
      name,
      description,
      trackIds: [],
      cover: '🎶',
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setShowCreatePlaylist(false);
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null);
      setActiveView('playlists');
    }
  }, [selectedPlaylist]);

  const addTrackToPlaylist = useCallback((trackId, playlistId) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId)
          ? { ...p, trackIds: [...p.trackIds, trackId] }
          : p
      )
    );
    setShowAddToPlaylist(null);
  }, []);

  const removeTrackFromPlaylist = useCallback((trackId, playlistId) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p
      )
    );
  }, []);

  const handleContextMenu = useCallback((e, track) => {
    e.preventDefault();
    setShowTrackContextMenu(track.id);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const handleClick = () => setShowTrackContextMenu(null);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowTrackContextMenu(null);
        setShowCreatePlaylist(false);
        setShowAddToPlaylist(null);
        setShowEqualizer(false);
        setShowLyrics(false);
        setSelectedArtist(null);
        setSelectedAlbum(null);
      }
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      }
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlayPause]);

  const getArtist = (artistId) => MOCK_ARTISTS.find((a) => a.id === artistId);
  const getAlbum = (albumId) => MOCK_ALBUMS.find((a) => a.id === albumId);

  const filteredTracks = useMemo(() => {
    let tracks = [...MOCK_TRACKS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tracks = tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          getArtist(t.artistId)?.name.toLowerCase().includes(q) ||
          getAlbum(t.albumId)?.title.toLowerCase().includes(q)
      );
    }
    if (selectedGenre !== 'All') {
      tracks = tracks.filter((t) => t.genre === selectedGenre);
    }
    tracks.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'artist') cmp = (getArtist(a.artistId)?.name || '').localeCompare(getArtist(b.artistId)?.name || '');
      else if (sortBy === 'duration') cmp = a.duration - b.duration;
      else if (sortBy === 'plays') cmp = a.plays - b.plays;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return tracks;
  }, [searchQuery, selectedGenre, sortBy, sortDirection]);

  const favoriteTracks = useMemo(() => MOCK_TRACKS.filter((t) => favorites.includes(t.id)), [favorites]);
  const recentTracks = useMemo(() => recentlyPlayed.map((id) => MOCK_TRACKS.find((t) => t.id === id)).filter(Boolean), [recentlyPlayed]);

  const topTracks = useMemo(() => [...MOCK_TRACKS].sort((a, b) => b.plays - a.plays).slice(0, 10), []);

  const handleSortClick = useCallback((field) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }, [sortBy]);

  const bgColor = '#0a0a0a';
  const sidebarBg = '#111111';
  const cardBg = '#1a1a1a';
  const accentColor = '#1db954';
  const textPrimary = '#ffffff';
  const textSecondary = '#b3b3b3';
  const hoverBg = '#282828';

  const renderTrackRow = (track, index, contextTracks) => {
    const artist = getArtist(track.artistId);
    const album = getAlbum(track.albumId);
    const isCurrent = currentTrack?.id === track.id;
    const isFav = favorites.includes(track.id);

    return (
      <div
        key={track.id}
        data-testid={`track-row-${track.id}`}
        onContextMenu={(e) => handleContextMenu(e, track)}
        onClick={() => playTrackInContext(track, contextTracks || filteredTracks)}
        style={{
          display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '16px',
          cursor: 'pointer', borderRadius: '4px',
          background: isCurrent ? hoverBg : 'transparent',
          color: isCurrent ? accentColor : textPrimary,
        }}
        role="row"
        aria-label={`Play ${track.title}`}
      >
        <span style={{ width: '30px', textAlign: 'right', color: textSecondary, fontSize: '14px' }}>
          {isCurrent && isPlaying ? '♫' : index + 1}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: isCurrent ? 'bold' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.title}
          </div>
          <div style={{ fontSize: '12px', color: textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {artist?.name} • {album?.title}
          </div>
        </div>
        <button
          aria-label={isFav ? `Remove ${track.title} from favorites` : `Add ${track.title} to favorites`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: isFav ? accentColor : textSecondary }}
        >
          {isFav ? '❤️' : '🤍'}
        </button>
        <span style={{ color: textSecondary, fontSize: '14px', width: '50px', textAlign: 'right' }}>
          {formatDuration(track.duration)}
        </span>
        <span style={{ color: textSecondary, fontSize: '12px', width: '60px', textAlign: 'right' }}>
          {formatPlayCount(track.plays)}
        </span>
        <button
          aria-label={`Add ${track.title} to playlist`}
          onClick={(e) => { e.stopPropagation(); setShowAddToPlaylist(track.id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: textSecondary }}
        >
          ➕
        </button>
        <button
          aria-label={`Add ${track.title} to queue`}
          onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: textSecondary }}
        >
          📋
        </button>
      </div>
    );
  };

  const renderContextMenu = () => {
    if (!showTrackContextMenu) return null;
    const track = MOCK_TRACKS.find((t) => t.id === showTrackContextMenu);
    if (!track) return null;
    return (
      <div
        data-testid="context-menu"
        style={{
          position: 'fixed', top: contextMenuPosition.y, left: contextMenuPosition.x,
          background: '#282828', borderRadius: '8px', padding: '4px 0', minWidth: '180px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000,
        }}
      >
        <button onClick={() => { playTrack(track); setShowTrackContextMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: textPrimary, textAlign: 'left', cursor: 'pointer' }}>
          ▶️ Play
        </button>
        <button onClick={() => { addToQueue(track); setShowTrackContextMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: textPrimary, textAlign: 'left', cursor: 'pointer' }}>
          📋 Add to Queue
        </button>
        <button onClick={() => { toggleFavorite(track.id); setShowTrackContextMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: textPrimary, textAlign: 'left', cursor: 'pointer' }}>
          {favorites.includes(track.id) ? '💔 Remove from Favorites' : '❤️ Add to Favorites'}
        </button>
        <button onClick={() => { setShowAddToPlaylist(track.id); setShowTrackContextMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: textPrimary, textAlign: 'left', cursor: 'pointer' }}>
          ➕ Add to Playlist
        </button>
        <button onClick={() => { setSelectedArtist(getArtist(track.artistId)); setActiveView('artist'); setShowTrackContextMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: textPrimary, textAlign: 'left', cursor: 'pointer' }}>
          👤 Go to Artist
        </button>
        <button onClick={() => { setSelectedAlbum(getAlbum(track.albumId)); setActiveView('album'); setShowTrackContextMenu(null); }} style={{ display: 'block', width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: textPrimary, textAlign: 'left', cursor: 'pointer' }}>
          💿 Go to Album
        </button>
      </div>
    );
  };

  const renderSidebar = () => (
    <div style={{ width: sidebarCollapsed ? '60px' : '220px', background: sidebarBg, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '1px solid #282828', transition: 'width 0.2s', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '16px' }}>
        {!sidebarCollapsed && <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: accentColor, margin: 0 }}>🎵 Melodify</h1>}
        <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((p) => !p)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: '18px' }}>
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      {[
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'search', icon: '🔍', label: 'Search' },
        { id: 'library', icon: '📚', label: 'Library' },
        { id: 'favorites', icon: '❤️', label: 'Favorites' },
        { id: 'recent', icon: '🕐', label: 'Recently Played' },
        { id: 'playlists', icon: '📝', label: 'Playlists' },
        { id: 'artists', icon: '👤', label: 'Artists' },
        { id: 'albums', icon: '💿', label: 'Albums' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveView(item.id);
            setSelectedArtist(null);
            setSelectedAlbum(null);
            setSelectedPlaylist(null);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
            background: activeView === item.id ? hoverBg : 'transparent',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            color: activeView === item.id ? textPrimary : textSecondary,
            fontWeight: activeView === item.id ? 'bold' : 'normal',
            fontSize: '14px', width: '100%', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: '18px' }}>{item.icon}</span>
          {!sidebarCollapsed && item.label}
        </button>
      ))}
      {!sidebarCollapsed && (
        <div style={{ marginTop: 'auto', padding: '8px' }}>
          <button
            aria-label="Equalizer"
            onClick={() => setShowEqualizer(true)}
            style={{ width: '100%', padding: '8px', background: hoverBg, border: 'none', borderRadius: '6px', color: textSecondary, cursor: 'pointer', fontSize: '14px' }}
          >
            🎛️ Equalizer
          </button>
        </div>
      )}
    </div>
  );

  const renderHomeView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: textPrimary, marginBottom: '24px' }}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</h2>
      {recentTracks.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: textPrimary, marginBottom: '16px' }}>Recently Played</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {recentTracks.slice(0, 6).map((track) => {
              const album = getAlbum(track.albumId);
              const artist = getArtist(track.artistId);
              return (
                <div key={track.id} onClick={() => playTrackInContext(track, recentTracks)} style={{ background: cardBg, borderRadius: '8px', padding: '16px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '8px' }}>{album?.cover}</div>
                  <div style={{ color: textPrimary, fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                  <div style={{ color: textSecondary, fontSize: '12px' }}>{artist?.name}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ color: textPrimary, marginBottom: '16px' }}>Top Tracks</h3>
        <div role="table" aria-label="Top tracks list">
          {topTracks.map((track, i) => renderTrackRow(track, i, topTracks))}
        </div>
      </section>
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ color: textPrimary, marginBottom: '16px' }}>Featured Playlists</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {playlists.slice(0, 4).map((playlist) => (
            <div key={playlist.id} onClick={() => { setSelectedPlaylist(playlist); setActiveView('playlist'); }} style={{ background: cardBg, borderRadius: '8px', padding: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>{playlist.cover}</div>
              <div style={{ color: textPrimary, fontWeight: 'bold', fontSize: '16px' }}>{playlist.name}</div>
              <div style={{ color: textSecondary, fontSize: '12px', marginTop: '4px' }}>{playlist.description}</div>
              <div style={{ color: textSecondary, fontSize: '12px', marginTop: '8px' }}>{playlist.trackIds.length} tracks</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 style={{ color: textPrimary, marginBottom: '16px' }}>Browse Artists</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {MOCK_ARTISTS.slice(0, 6).map((artist) => (
            <div key={artist.id} onClick={() => { setSelectedArtist(artist); setActiveView('artist'); }} style={{ background: cardBg, borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>{artist.avatar}</div>
              <div style={{ color: textPrimary, fontWeight: 'bold', fontSize: '14px' }}>{artist.name}</div>
              <div style={{ color: textSecondary, fontSize: '12px' }}>{artist.genre}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderSearchView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: textPrimary, marginBottom: '16px' }}>Search</h2>
      <input
        type="text"
        placeholder="Search tracks, artists, albums..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: '100%', maxWidth: '500px', padding: '12px 16px', borderRadius: '24px', border: 'none', background: '#333', color: textPrimary, fontSize: '16px', marginBottom: '16px', outline: 'none' }}
      />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            style={{
              padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: selectedGenre === genre ? accentColor : '#333',
              color: selectedGenre === genre ? '#000' : textSecondary, fontSize: '14px',
            }}
          >
            {genre}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
        <span style={{ color: textSecondary, fontSize: '14px' }}>Sort by:</span>
        {['title', 'artist', 'duration', 'plays'].map((field) => (
          <button
            key={field}
            onClick={() => handleSortClick(field)}
            style={{
              padding: '4px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: sortBy === field ? accentColor : '#333',
              color: sortBy === field ? '#000' : textSecondary, fontSize: '13px',
            }}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)} {sortBy === field ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
          </button>
        ))}
      </div>
      <div style={{ color: textSecondary, fontSize: '14px', marginBottom: '8px' }}>
        {filteredTracks.length} {filteredTracks.length === 1 ? 'track' : 'tracks'} found
      </div>
      <div role="table" aria-label="Search results">
        {filteredTracks.map((track, i) => renderTrackRow(track, i, filteredTracks))}
      </div>
    </div>
  );

  const renderLibraryView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: textPrimary, marginBottom: '24px' }}>Your Library</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        <div onClick={() => setActiveView('favorites')} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', borderRadius: '8px', padding: '20px', cursor: 'pointer' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>❤️</div>
          <div style={{ color: textPrimary, fontWeight: 'bold' }}>Liked Songs</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px' }}>{favorites.length} tracks</div>
        </div>
        <div onClick={() => setActiveView('recent')} style={{ background: 'linear-gradient(135deg, #1db954, #134e2e)', borderRadius: '8px', padding: '20px', cursor: 'pointer' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🕐</div>
          <div style={{ color: textPrimary, fontWeight: 'bold' }}>Recently Played</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px' }}>{recentlyPlayed.length} tracks</div>
        </div>
        {playlists.map((playlist) => (
          <div key={playlist.id} onClick={() => { setSelectedPlaylist(playlist); setActiveView('playlist'); }} style={{ background: cardBg, borderRadius: '8px', padding: '20px', cursor: 'pointer' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{playlist.cover}</div>
            <div style={{ color: textPrimary, fontWeight: 'bold' }}>{playlist.name}</div>
            <div style={{ color: textSecondary, fontSize: '12px', marginTop: '4px' }}>{playlist.trackIds.length} tracks</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFavoritesView = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>❤️</div>
        <div>
          <div style={{ color: textSecondary, fontSize: '12px', textTransform: 'uppercase' }}>Playlist</div>
          <h2 style={{ color: textPrimary, fontSize: '32px', margin: '4px 0' }}>Liked Songs</h2>
          <div style={{ color: textSecondary, fontSize: '14px' }}>{favoriteTracks.length} songs</div>
        </div>
      </div>
      {favoriteTracks.length === 0 ? (
        <div style={{ color: textSecondary, textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤍</div>
          <p>Songs you like will appear here</p>
        </div>
      ) : (
        <div role="table" aria-label="Favorite tracks">
          {favoriteTracks.map((track, i) => renderTrackRow(track, i, favoriteTracks))}
        </div>
      )}
    </div>
  );

  const renderRecentView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: textPrimary, marginBottom: '24px' }}>Recently Played</h2>
      {recentTracks.length === 0 ? (
        <div style={{ color: textSecondary, textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕐</div>
          <p>Your listening history will appear here</p>
        </div>
      ) : (
        <div role="table" aria-label="Recently played tracks">
          {recentTracks.map((track, i) => renderTrackRow(track, i, recentTracks))}
        </div>
      )}
    </div>
  );

  const renderPlaylistsView = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: textPrimary }}>Your Playlists</h2>
        <button
          onClick={() => setShowCreatePlaylist(true)}
          style={{ padding: '8px 16px', background: accentColor, color: '#000', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          + New Playlist
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {playlists.map((playlist) => (
          <div key={playlist.id} style={{ background: cardBg, borderRadius: '8px', padding: '20px', cursor: 'pointer', position: 'relative' }}>
            <div onClick={() => { setSelectedPlaylist(playlist); setActiveView('playlist'); }}>
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>{playlist.cover}</div>
              <div style={{ color: textPrimary, fontWeight: 'bold', fontSize: '16px' }}>{playlist.name}</div>
              <div style={{ color: textSecondary, fontSize: '12px', marginTop: '4px' }}>{playlist.description}</div>
              <div style={{ color: textSecondary, fontSize: '12px', marginTop: '8px' }}>{playlist.trackIds.length} tracks</div>
            </div>
            <button
              aria-label={`Delete ${playlist.name}`}
              onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id); }}
              style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: '16px' }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaylistDetailView = () => {
    if (!selectedPlaylist) return null;
    const tracks = selectedPlaylist.trackIds.map((id) => MOCK_TRACKS.find((t) => t.id === id)).filter(Boolean);
    const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '120px', height: '120px', background: cardBg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>{selectedPlaylist.cover}</div>
          <div>
            <div style={{ color: textSecondary, fontSize: '12px', textTransform: 'uppercase' }}>Playlist</div>
            <h2 style={{ color: textPrimary, fontSize: '32px', margin: '4px 0' }}>{selectedPlaylist.name}</h2>
            <div style={{ color: textSecondary, fontSize: '14px' }}>{selectedPlaylist.description}</div>
            <div style={{ color: textSecondary, fontSize: '14px', marginTop: '4px' }}>{tracks.length} songs, {formatDuration(totalDuration)} total</div>
          </div>
        </div>
        {tracks.length > 0 && (
          <button
            onClick={() => playTrackInContext(tracks[0], tracks)}
            style={{ padding: '12px 32px', background: accentColor, color: '#000', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}
          >
            ▶ Play All
          </button>
        )}
        <div role="table" aria-label={`${selectedPlaylist.name} tracks`}>
          {tracks.map((track, i) => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>{renderTrackRow(track, i, tracks)}</div>
              <button
                aria-label={`Remove ${track.title} from playlist`}
                onClick={() => removeTrackFromPlaylist(track.id, selectedPlaylist.id)}
                style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: '14px', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {tracks.length === 0 && (
          <div style={{ color: textSecondary, textAlign: 'center', padding: '48px' }}>
            <p>This playlist is empty. Add some tracks!</p>
          </div>
        )}
      </div>
    );
  };

  const renderArtistsView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: textPrimary, marginBottom: '24px' }}>Artists</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
        {MOCK_ARTISTS.map((artist) => (
          <div key={artist.id} onClick={() => { setSelectedArtist(artist); setActiveView('artist'); }} style={{ background: cardBg, borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>{artist.avatar}</div>
            <div style={{ color: textPrimary, fontWeight: 'bold', fontSize: '16px' }}>{artist.name}</div>
            <div style={{ color: textSecondary, fontSize: '12px', marginTop: '4px' }}>{artist.genre}</div>
            <div style={{ color: textSecondary, fontSize: '12px', marginTop: '4px' }}>{formatPlayCount(artist.followers)} followers</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderArtistDetailView = () => {
    if (!selectedArtist) return null;
    const artistTracks = MOCK_TRACKS.filter((t) => t.artistId === selectedArtist.id);
    const artistAlbums = MOCK_ALBUMS.filter((a) => a.artistId === selectedArtist.id);
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{ width: '160px', height: '160px', background: cardBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>{selectedArtist.avatar}</div>
          <div>
            <div style={{ color: textSecondary, fontSize: '12px', textTransform: 'uppercase' }}>Artist</div>
            <h2 style={{ color: textPrimary, fontSize: '36px', margin: '4px 0' }}>{selectedArtist.name}</h2>
            <div style={{ color: textSecondary, fontSize: '14px' }}>{selectedArtist.genre} • {formatPlayCount(selectedArtist.followers)} followers</div>
          </div>
        </div>
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: textPrimary, marginBottom: '16px' }}>Popular Tracks</h3>
          <div role="table" aria-label={`${selectedArtist.name} tracks`}>
            {artistTracks.sort((a, b) => b.plays - a.plays).map((track, i) => renderTrackRow(track, i, artistTracks))}
          </div>
        </section>
        <section>
          <h3 style={{ color: textPrimary, marginBottom: '16px' }}>Albums</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {artistAlbums.map((album) => (
              <div key={album.id} onClick={() => { setSelectedAlbum(album); setActiveView('album'); }} style={{ width: '180px', background: cardBg, borderRadius: '8px', padding: '16px', cursor: 'pointer' }}>
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '8px' }}>{album.cover}</div>
                <div style={{ color: textPrimary, fontWeight: 'bold', fontSize: '14px' }}>{album.title}</div>
                <div style={{ color: textSecondary, fontSize: '12px' }}>{album.year} • {album.trackCount} tracks</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderAlbumsView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: textPrimary, marginBottom: '24px' }}>Albums</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {MOCK_ALBUMS.map((album) => {
          const artist = getArtist(album.artistId);
          return (
            <div key={album.id} onClick={() => { setSelectedAlbum(album); setActiveView('album'); }} style={{ background: cardBg, borderRadius: '8px', padding: '20px', cursor: 'pointer' }}>
              <div style={{ fontSize: '56px', textAlign: 'center', marginBottom: '12px' }}>{album.cover}</div>
              <div style={{ color: textPrimary, fontWeight: 'bold', fontSize: '16px' }}>{album.title}</div>
              <div style={{ color: textSecondary, fontSize: '12px', marginTop: '4px' }}>{artist?.name}</div>
              <div style={{ color: textSecondary, fontSize: '12px', marginTop: '4px' }}>{album.year} • {album.trackCount} tracks</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAlbumDetailView = () => {
    if (!selectedAlbum) return null;
    const artist = getArtist(selectedAlbum.artistId);
    const albumTracks = MOCK_TRACKS.filter((t) => t.albumId === selectedAlbum.id);
    const totalDuration = albumTracks.reduce((sum, t) => sum + t.duration, 0);
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
          <div style={{ width: '180px', height: '180px', background: cardBg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px' }}>{selectedAlbum.cover}</div>
          <div>
            <div style={{ color: textSecondary, fontSize: '12px', textTransform: 'uppercase' }}>Album</div>
            <h2 style={{ color: textPrimary, fontSize: '32px', margin: '4px 0' }}>{selectedAlbum.title}</h2>
            <div style={{ color: textSecondary, fontSize: '14px', cursor: 'pointer' }} onClick={() => { setSelectedArtist(artist); setActiveView('artist'); }}>
              {artist?.avatar} {artist?.name} • {selectedAlbum.year} • {albumTracks.length} songs, {formatDuration(totalDuration)}
            </div>
          </div>
        </div>
        <button
          onClick={() => playTrackInContext(albumTracks[0], albumTracks)}
          style={{ padding: '12px 32px', background: accentColor, color: '#000', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}
        >
          ▶ Play All
        </button>
        <div role="table" aria-label={`${selectedAlbum.title} tracks`}>
          {albumTracks.map((track, i) => renderTrackRow(track, i, albumTracks))}
        </div>
      </div>
    );
  };

  const renderNowPlayingBar = () => (
    <div style={{ height: '80px', background: '#181818', borderTop: '1px solid #282828', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px' }}>
      {/* Track Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '250px', minWidth: '180px' }}>
        {currentTrack ? (
          <>
            <div style={{ width: '48px', height: '48px', background: cardBg, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              {getAlbum(currentTrack.albumId)?.cover || '🎵'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: textPrimary, fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</div>
              <div style={{ color: textSecondary, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getArtist(currentTrack.artistId)?.name}</div>
            </div>
            <button
              aria-label={favorites.includes(currentTrack.id) ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => toggleFavorite(currentTrack.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >
              {favorites.includes(currentTrack.id) ? '❤️' : '🤍'}
            </button>
          </>
        ) : (
          <div style={{ color: textSecondary, fontSize: '14px' }}>No track selected</div>
        )}
      </div>

      {/* Playback Controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button aria-label="Shuffle" onClick={toggleShuffle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: isShuffled ? accentColor : textSecondary }}>🔀</button>
          <button aria-label="Previous track" onClick={skipPrevious} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textPrimary }}>⏮</button>
          <button
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={togglePlayPause}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: textPrimary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
          >
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button aria-label="Next track" onClick={skipNext} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textPrimary }}>⏭</button>
          <button aria-label="Repeat" onClick={cycleRepeat} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: repeatMode !== 'none' ? accentColor : textSecondary }}>
            {repeatMode === 'one' ? '🔂' : '🔁'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '600px' }}>
          <span style={{ color: textSecondary, fontSize: '12px', width: '40px', textAlign: 'right' }}>{formatDuration(progress)}</span>
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            aria-label="Seek"
            role="slider"
            aria-valuenow={progress}
            aria-valuemax={currentTrack?.duration || 0}
            style={{ flex: 1, height: '4px', background: '#535353', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}
          >
            <div style={{ width: `${currentTrack ? (progress / currentTrack.duration) * 100 : 0}%`, height: '100%', background: accentColor, borderRadius: '2px' }} />
          </div>
          <span style={{ color: textSecondary, fontSize: '12px', width: '40px' }}>{currentTrack ? formatDuration(currentTrack.duration) : '0:00'}</span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px', justifyContent: 'flex-end' }}>
        <button aria-label="Show lyrics" onClick={() => setShowLyrics((p) => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: showLyrics ? accentColor : textSecondary }}>📜</button>
        <button aria-label="Show queue" onClick={() => setShowQueuePanel((p) => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: showQueuePanel ? accentColor : textSecondary }}>📋</button>
        <button aria-label={isMuted ? 'Unmute' : 'Mute'} onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: textSecondary }}>
          {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
        </button>
        <div
          ref={volumeBarRef}
          onClick={handleVolumeClick}
          aria-label="Volume"
          role="slider"
          aria-valuenow={isMuted ? 0 : volume}
          aria-valuemax={100}
          style={{ width: '80px', height: '4px', background: '#535353', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}
        >
          <div style={{ width: `${isMuted ? 0 : volume}%`, height: '100%', background: accentColor, borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );

  const renderQueuePanel = () => {
    if (!showQueuePanel) return null;
    return (
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: '80px', width: '350px', background: sidebarBg, borderLeft: '1px solid #282828', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
          <h3 style={{ color: textPrimary, margin: 0 }}>Queue</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={clearQueue} style={{ padding: '4px 12px', background: '#333', border: 'none', borderRadius: '4px', color: textSecondary, cursor: 'pointer', fontSize: '12px' }}>Clear</button>
            <button aria-label="Close queue" onClick={() => setShowQueuePanel(false)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        </div>
        {currentTrack && (
          <div style={{ padding: '0 16px', marginBottom: '8px' }}>
            <div style={{ color: textSecondary, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Now Playing</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: hoverBg, borderRadius: '4px' }}>
              <div style={{ fontSize: '20px' }}>{getAlbum(currentTrack.albumId)?.cover}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: accentColor, fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</div>
                <div style={{ color: textSecondary, fontSize: '12px' }}>{getArtist(currentTrack.artistId)?.name}</div>
              </div>
            </div>
          </div>
        )}
        <div style={{ padding: '0 16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ color: textSecondary, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Up Next ({queue.length} tracks)</div>
          {queue.map((track, i) => (
            <div key={`queue-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '4px', background: i === queueIndex ? hoverBg : 'transparent' }}>
              <span style={{ color: textSecondary, fontSize: '12px', width: '20px' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: i === queueIndex ? accentColor : textPrimary, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                <div style={{ color: textSecondary, fontSize: '12px' }}>{getArtist(track.artistId)?.name}</div>
              </div>
              <button
                aria-label={`Remove ${track.title} from queue`}
                onClick={() => removeFromQueue(i)}
                style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>
          ))}
          {queue.length === 0 && (
            <div style={{ color: textSecondary, textAlign: 'center', padding: '24px', fontSize: '14px' }}>Queue is empty</div>
          )}
        </div>
      </div>
    );
  };

  const renderLyricsPanel = () => {
    if (!showLyrics || !currentTrack) return null;
    return (
      <div style={{ position: 'fixed', right: showQueuePanel ? '350px' : 0, top: 0, bottom: '80px', width: '350px', background: sidebarBg, borderLeft: '1px solid #282828', zIndex: 99, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
          <h3 style={{ color: textPrimary, margin: 0 }}>Lyrics</h3>
          <button aria-label="Close lyrics" onClick={() => setShowLyrics(false)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
        <div style={{ flex: 1, padding: '0 24px', overflowY: 'auto' }}>
          <div style={{ color: textSecondary, textAlign: 'center', fontSize: '16px', lineHeight: '2', padding: '24px 0' }}>
            <p style={{ color: textPrimary, fontSize: '18px', fontWeight: 'bold' }}>{currentTrack.title}</p>
            <p>Lyrics not available for this track.</p>
            <p style={{ fontSize: '14px', marginTop: '24px' }}>🎵 Enjoy the music 🎵</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCreatePlaylistModal = () => {
    if (!showCreatePlaylist) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
        <div style={{ background: '#282828', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%' }}>
          <h3 style={{ color: textPrimary, marginBottom: '16px' }}>Create New Playlist</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            createPlaylist(formData.get('name'), formData.get('description'));
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: textSecondary, fontSize: '14px', display: 'block', marginBottom: '4px' }}>Name *</label>
              <input name="name" required placeholder="My Playlist" style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #535353', background: '#1a1a1a', color: textPrimary, fontSize: '14px' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: textSecondary, fontSize: '14px', display: 'block', marginBottom: '4px' }}>Description</label>
              <input name="description" placeholder="Add a description..." style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #535353', background: '#1a1a1a', color: textPrimary, fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowCreatePlaylist(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid #535353', borderRadius: '20px', color: textPrimary, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: accentColor, border: 'none', borderRadius: '20px', color: '#000', cursor: 'pointer', fontWeight: 'bold' }}>Create</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAddToPlaylistModal = () => {
    if (!showAddToPlaylist) return null;
    const track = MOCK_TRACKS.find((t) => t.id === showAddToPlaylist);
    if (!track) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
        <div style={{ background: '#282828', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%' }}>
          <h3 style={{ color: textPrimary, marginBottom: '8px' }}>Add to Playlist</h3>
          <p style={{ color: textSecondary, fontSize: '14px', marginBottom: '16px' }}>Adding "{track.title}"</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
            {playlists.map((playlist) => {
              const alreadyIn = playlist.trackIds.includes(track.id);
              return (
                <button
                  key={playlist.id}
                  disabled={alreadyIn}
                  onClick={() => addTrackToPlaylist(track.id, playlist.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                    background: 'transparent', border: 'none', borderRadius: '4px', cursor: alreadyIn ? 'default' : 'pointer',
                    color: alreadyIn ? textSecondary : textPrimary, textAlign: 'left', opacity: alreadyIn ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{playlist.cover}</span>
                  <span style={{ flex: 1 }}>{playlist.name}</span>
                  {alreadyIn && <span style={{ fontSize: '12px' }}>✓ Added</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button onClick={() => setShowAddToPlaylist(null)} style={{ padding: '8px 16px', background: 'none', border: '1px solid #535353', borderRadius: '20px', color: textPrimary, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const renderEqualizerModal = () => {
    if (!showEqualizer) return null;
    const presets = ['flat', 'bass_boost', 'treble_boost', 'vocal', 'electronic', 'rock', 'jazz', 'classical'];
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
        <div style={{ background: '#282828', borderRadius: '12px', padding: '24px', width: '450px', maxWidth: '90%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: textPrimary, margin: 0 }}>Equalizer</h3>
            <button aria-label="Close equalizer" onClick={() => setShowEqualizer(false)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setEqualizerPreset(preset)}
                style={{
                  padding: '6px 14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                  background: equalizerPreset === preset ? accentColor : '#333',
                  color: equalizerPreset === preset ? '#000' : textSecondary, fontSize: '13px',
                }}
              >
                {preset.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '120px', padding: '0 8px' }}>
            {['60Hz', '150Hz', '400Hz', '1kHz', '2.4kHz', '6kHz', '15kHz'].map((freq, i) => {
              const heights = {
                flat: [50, 50, 50, 50, 50, 50, 50],
                bass_boost: [90, 80, 60, 50, 45, 40, 40],
                treble_boost: [40, 40, 45, 50, 60, 80, 90],
                vocal: [40, 45, 60, 85, 70, 50, 40],
                electronic: [80, 70, 50, 60, 75, 85, 80],
                rock: [80, 70, 55, 50, 65, 75, 80],
                jazz: [60, 50, 45, 65, 70, 60, 50],
                classical: [50, 55, 60, 65, 60, 55, 50],
              };
              const h = heights[equalizerPreset]?.[i] || 50;
              return (
                <div key={freq} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '20px', height: `${h}%`, background: accentColor, borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                  <span style={{ color: textSecondary, fontSize: '10px' }}>{freq}</span>
                </div>
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
      case 'favorites': return renderFavoritesView();
      case 'recent': return renderRecentView();
      case 'playlists': return renderPlaylistsView();
      case 'playlist': return renderPlaylistDetailView();
      case 'artists': return renderArtistsView();
      case 'artist': return renderArtistDetailView();
      case 'albums': return renderAlbumsView();
      case 'album': return renderAlbumDetailView();
      default: return renderHomeView();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: bgColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {renderSidebar()}
        <main style={{ flex: 1, overflowY: 'auto', background: bgColor }}>
          {renderMainContent()}
        </main>
      </div>
      {renderNowPlayingBar()}
      {renderQueuePanel()}
      {renderLyricsPanel()}
      {renderContextMenu()}
      {renderCreatePlaylistModal()}
      {renderAddToPlaylistModal()}
      {renderEqualizerModal()}
    </div>
  );
}
