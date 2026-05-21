import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// --- Data ---

const GENRES = ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'r&b', 'indie'];

const MOCK_ARTISTS = [
  { id: 'a1', name: 'Luna Wave', avatar: '🎤', genre: 'pop', monthlyListeners: 2400000, verified: true },
  { id: 'a2', name: 'The Voltage', avatar: '🎸', genre: 'rock', monthlyListeners: 1800000, verified: true },
  { id: 'a3', name: 'DJ Prism', avatar: '🎧', genre: 'electronic', monthlyListeners: 3100000, verified: true },
  { id: 'a4', name: 'Miles Quartet', avatar: '🎷', genre: 'jazz', monthlyListeners: 450000, verified: false },
  { id: 'a5', name: 'Neon Pulse', avatar: '🎹', genre: 'electronic', monthlyListeners: 890000, verified: true },
  { id: 'a6', name: 'Skyler Gray', avatar: '🎵', genre: 'r&b', monthlyListeners: 1500000, verified: true },
  { id: 'a7', name: 'Autumn Drift', avatar: '🍂', genre: 'indie', monthlyListeners: 320000, verified: false },
  { id: 'a8', name: 'Classical Strings Ensemble', avatar: '🎻', genre: 'classical', monthlyListeners: 670000, verified: true },
];

const MOCK_SONGS = [
  { id: 's1', title: 'Midnight Glow', artist: 'a1', album: 'Starlight', duration: 214, genre: 'pop', plays: 5200000, year: 2024, liked: false },
  { id: 's2', title: 'Electric Sunrise', artist: 'a3', album: 'Frequency', duration: 198, genre: 'electronic', plays: 8100000, year: 2024, liked: true },
  { id: 's3', title: 'Broken Strings', artist: 'a2', album: 'Amplified', duration: 267, genre: 'rock', plays: 3400000, year: 2023, liked: false },
  { id: 's4', title: 'Blue Note Serenade', artist: 'a4', album: 'Late Night Sessions', duration: 342, genre: 'jazz', plays: 890000, year: 2023, liked: true },
  { id: 's5', title: 'Neon Dreams', artist: 'a5', album: 'Synthwave City', duration: 185, genre: 'electronic', plays: 2100000, year: 2024, liked: false },
  { id: 's6', title: 'Velvet Touch', artist: 'a6', album: 'Silk & Soul', duration: 231, genre: 'r&b', plays: 4600000, year: 2024, liked: true },
  { id: 's7', title: 'Autumn Leaves Fall', artist: 'a7', album: 'Wanderlust', duration: 203, genre: 'indie', plays: 780000, year: 2023, liked: false },
  { id: 's8', title: 'Symphony No. 9 Redux', artist: 'a8', album: 'Modern Classics', duration: 480, genre: 'classical', plays: 1200000, year: 2022, liked: false },
  { id: 's9', title: 'Waves of Sound', artist: 'a1', album: 'Starlight', duration: 196, genre: 'pop', plays: 3800000, year: 2024, liked: true },
  { id: 's10', title: 'Thunderbolt', artist: 'a2', album: 'Amplified', duration: 245, genre: 'rock', plays: 2900000, year: 2023, liked: false },
  { id: 's11', title: 'Deep Frequency', artist: 'a3', album: 'Frequency', duration: 221, genre: 'electronic', plays: 6500000, year: 2024, liked: false },
  { id: 's12', title: 'Smoky Room', artist: 'a4', album: 'Late Night Sessions', duration: 298, genre: 'jazz', plays: 560000, year: 2023, liked: false },
  { id: 's13', title: 'Pixel Hearts', artist: 'a5', album: 'Synthwave City', duration: 176, genre: 'electronic', plays: 1700000, year: 2024, liked: true },
  { id: 's14', title: 'Golden Hour', artist: 'a6', album: 'Silk & Soul', duration: 258, genre: 'r&b', plays: 5100000, year: 2024, liked: false },
  { id: 's15', title: 'Forest Path', artist: 'a7', album: 'Wanderlust', duration: 189, genre: 'indie', plays: 420000, year: 2023, liked: false },
  { id: 's16', title: 'Concerto in D Minor', artist: 'a8', album: 'Modern Classics', duration: 520, genre: 'classical', plays: 980000, year: 2022, liked: true },
  { id: 's17', title: 'Starlight Anthem', artist: 'a1', album: 'Starlight', duration: 228, genre: 'pop', plays: 7200000, year: 2024, liked: false },
  { id: 's18', title: 'Rebel Yell Redux', artist: 'a2', album: 'Amplified', duration: 212, genre: 'rock', plays: 1800000, year: 2023, liked: false },
  { id: 's19', title: 'Cosmic Drift', artist: 'a3', album: 'Frequency', duration: 305, genre: 'electronic', plays: 4200000, year: 2024, liked: false },
  { id: 's20', title: 'Raindrop Waltz', artist: 'a8', album: 'Modern Classics', duration: 360, genre: 'classical', plays: 730000, year: 2022, liked: false },
];

const INITIAL_PLAYLISTS = [
  { id: 'p1', name: 'Chill Vibes', description: 'Perfect for relaxing evenings', songs: ['s2', 's4', 's6', 's7', 's15'], createdAt: Date.now() - 86400000 * 30, cover: '🌙', isPublic: true },
  { id: 'p2', name: 'Workout Energy', description: 'High energy tracks for the gym', songs: ['s1', 's3', 's5', 's10', 's11', 's17'], createdAt: Date.now() - 86400000 * 15, cover: '💪', isPublic: true },
  { id: 'p3', name: 'Focus Flow', description: 'Deep concentration music', songs: ['s8', 's12', 's16', 's19', 's20'], createdAt: Date.now() - 86400000 * 7, cover: '🧠', isPublic: false },
  { id: 'p4', name: 'Road Trip', description: 'Songs for the open highway', songs: ['s3', 's9', 's10', 's13', 's17', 's18'], createdAt: Date.now() - 86400000 * 3, cover: '🚗', isPublic: true },
];

const INITIAL_RECENTLY_PLAYED = ['s2', 's17', 's6', 's4', 's11', 's9', 's3'];

// --- Utility Functions ---

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatPlays(plays) {
  if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
  if (plays >= 1000) return `${(plays / 1000).toFixed(0)}K`;
  return plays.toString();
}

function formatListeners(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M monthly listeners`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K monthly listeners`;
  return `${count} monthly listeners`;
}

function getArtistById(id) {
  return MOCK_ARTISTS.find((a) => a.id === id);
}

function getSongById(id) {
  return MOCK_SONGS.find((s) => s.id === id);
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- Components ---

function PlayerBar({ currentSong, isPlaying, onPlayPause, onNext, onPrevious, progress, onSeek, volume, onVolumeChange, repeatMode, onRepeatToggle, isShuffled, onShuffleToggle, queue }) {
  const song = currentSong ? getSongById(currentSong) : null;
  const artist = song ? getArtistById(song.artist) : null;
  const progressPercent = song ? (progress / song.duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-900 px-4 py-3" data-testid="player-bar">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4">
        {/* Song Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3" data-testid="now-playing-info">
          {song ? (
            <>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-700 text-xl">
                {artist?.avatar || '🎵'}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-sm text-white" data-testid="now-playing-title">{song.title}</p>
                <p className="truncate text-xs text-gray-400" data-testid="now-playing-artist">{artist?.name}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No song playing</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1" data-testid="player-controls">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onShuffleToggle}
              className={`text-sm ${isShuffled ? 'text-green-400' : 'text-gray-400'} hover:text-white`}
              data-testid="shuffle-btn"
              aria-label={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
            >
              🔀
            </button>
            <button type="button" onClick={onPrevious} className="text-gray-300 hover:text-white" data-testid="prev-btn" aria-label="Previous track">
              ⏮
            </button>
            <button
              type="button"
              onClick={onPlayPause}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:scale-105"
              data-testid="play-pause-btn"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button type="button" onClick={onNext} className="text-gray-300 hover:text-white" data-testid="next-btn" aria-label="Next track">
              ⏭
            </button>
            <button
              type="button"
              onClick={onRepeatToggle}
              className={`text-sm ${repeatMode !== 'off' ? 'text-green-400' : 'text-gray-400'} hover:text-white`}
              data-testid="repeat-btn"
              aria-label={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? '🔂' : '🔁'}
            </button>
          </div>
          <div className="flex w-96 items-center gap-2">
            <span className="w-10 text-right text-xs text-gray-400">{song ? formatDuration(Math.floor(progress)) : '0:00'}</span>
            <input
              type="range"
              min="0"
              max={song?.duration || 100}
              value={progress}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="flex-1"
              data-testid="progress-bar"
              aria-label="Seek"
            />
            <span className="w-10 text-xs text-gray-400">{song ? formatDuration(song.duration) : '0:00'}</span>
          </div>
        </div>

        {/* Volume & Queue */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <span className="text-sm text-gray-400" data-testid="queue-count">{queue.length} in queue</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-24"
              data-testid="volume-slider"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activeView, onViewChange, playlists, onCreatePlaylist, sidebarCollapsed, onToggleSidebar }) {
  const views = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'library', label: 'Your Library', icon: '📚' },
    { id: 'liked', label: 'Liked Songs', icon: '❤️' },
    { id: 'recent', label: 'Recently Played', icon: '🕐' },
    { id: 'queue', label: 'Queue', icon: '📋' },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-gray-800 bg-gray-950 ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-200`}
      data-testid="sidebar"
    >
      <div className="flex items-center justify-between p-4">
        {!sidebarCollapsed && <h1 className="font-bold text-lg text-white">SoundFlow</h1>}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-gray-400 hover:text-white"
          aria-label="Toggle sidebar"
          data-testid="toggle-sidebar-btn"
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2" data-testid="sidebar-nav">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onViewChange(view.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              activeView === view.id ? 'bg-gray-800 font-medium text-white' : 'text-gray-400 hover:text-white'
            }`}
            data-testid={`nav-${view.id}`}
          >
            <span>{view.icon}</span>
            {!sidebarCollapsed && view.label}
          </button>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="border-t border-gray-800 p-4" data-testid="sidebar-playlists">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-300">Playlists</h2>
            <button
              type="button"
              onClick={onCreatePlaylist}
              className="text-gray-400 hover:text-white"
              data-testid="create-playlist-btn"
              aria-label="Create playlist"
            >
              +
            </button>
          </div>
          <div className="space-y-1">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => onViewChange(`playlist:${pl.id}`)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
                  activeView === `playlist:${pl.id}` ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                }`}
                data-testid={`playlist-nav-${pl.id}`}
              >
                <span>{pl.cover}</span>
                <span className="truncate">{pl.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function SongRow({ song, index, isCurrentSong, onPlay, onLikeToggle, onAddToQueue, onAddToPlaylist, showAlbum = true }) {
  const artist = getArtistById(song.artist);
  return (
    <div
      className={`group flex items-center gap-4 rounded-lg px-4 py-2 transition-colors hover:bg-gray-800/50 ${isCurrentSong ? 'bg-gray-800' : ''}`}
      data-testid={`song-row-${song.id}`}
    >
      <span className="w-6 text-center text-gray-500 text-sm">{index + 1}</span>
      <button type="button" onClick={() => onPlay(song.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" data-testid={`play-song-${song.id}`}>
        <div>
          <p className={`truncate text-sm ${isCurrentSong ? 'text-green-400' : 'text-white'}`}>{song.title}</p>
          <p className="truncate text-xs text-gray-400">{artist?.name}</p>
        </div>
      </button>
      {showAlbum && <span className="hidden w-40 truncate text-sm text-gray-400 md:block">{song.album}</span>}
      <span className="w-16 text-right text-sm text-gray-400">{formatPlays(song.plays)}</span>
      <span className="w-12 text-right text-sm text-gray-400">{formatDuration(song.duration)}</span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onLikeToggle(song.id)}
          className={`text-sm ${song.liked ? 'text-green-400' : 'text-gray-400'} hover:text-green-300`}
          data-testid={`like-btn-${song.id}`}
          aria-label={song.liked ? 'Unlike' : 'Like'}
        >
          {song.liked ? '💚' : '🤍'}
        </button>
        <button
          type="button"
          onClick={() => onAddToQueue(song.id)}
          className="text-sm text-gray-400 hover:text-white"
          data-testid={`queue-btn-${song.id}`}
          aria-label="Add to queue"
        >
          📋
        </button>
        <button
          type="button"
          onClick={() => onAddToPlaylist(song.id)}
          className="text-sm text-gray-400 hover:text-white"
          data-testid={`add-to-playlist-btn-${song.id}`}
          aria-label="Add to playlist"
        >
          ➕
        </button>
      </div>
    </div>
  );
}

function HomeView({ songs, recentlyPlayed, currentSongId, onPlay, onLikeToggle, onAddToQueue, onAddToPlaylist, onViewChange }) {
  const topSongs = useMemo(() => [...songs].sort((a, b) => b.plays - a.plays).slice(0, 5), [songs]);
  const recentSongs = useMemo(() => recentlyPlayed.map(getSongById).filter(Boolean).slice(0, 6), [recentlyPlayed]);
  const newReleases = useMemo(() => [...songs].filter((s) => s.year === 2024).slice(0, 6), [songs]);

  return (
    <div className="space-y-8" data-testid="home-view">
      <section>
        <h2 className="mb-4 font-bold text-2xl text-white">Good evening</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {recentSongs.map((song) => {
            const artist = getArtistById(song.artist);
            return (
              <button
                key={song.id}
                type="button"
                onClick={() => onPlay(song.id)}
                className="flex items-center gap-3 rounded-lg bg-gray-800/50 p-2 text-left transition-colors hover:bg-gray-800"
                data-testid={`quick-play-${song.id}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-700 text-lg">
                  {artist?.avatar || '🎵'}
                </div>
                <span className="truncate text-sm font-medium text-white">{song.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section data-testid="top-songs-section">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-xl text-white">Top Songs</h2>
          <button type="button" onClick={() => onViewChange('library')} className="text-sm text-gray-400 hover:text-white">
            See all
          </button>
        </div>
        {topSongs.map((song, i) => (
          <SongRow key={song.id} song={song} index={i} isCurrentSong={currentSongId === song.id} onPlay={onPlay} onLikeToggle={onLikeToggle} onAddToQueue={onAddToQueue} onAddToPlaylist={onAddToPlaylist} />
        ))}
      </section>

      <section data-testid="new-releases-section">
        <h2 className="mb-4 font-bold text-xl text-white">New Releases</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {newReleases.map((song) => {
            const artist = getArtistById(song.artist);
            return (
              <button
                key={song.id}
                type="button"
                onClick={() => onPlay(song.id)}
                className="group rounded-lg bg-gray-800/30 p-3 text-left transition-colors hover:bg-gray-800/60"
                data-testid={`new-release-${song.id}`}
              >
                <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-gray-700 text-3xl">
                  {artist?.avatar || '🎵'}
                </div>
                <p className="truncate text-sm font-medium text-white">{song.title}</p>
                <p className="truncate text-xs text-gray-400">{artist?.name}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SearchView({ songs, searchQuery, onSearchChange, filterGenre, onFilterGenreChange, currentSongId, onPlay, onLikeToggle, onAddToQueue, onAddToPlaylist }) {
  const filteredSongs = useMemo(() => {
    let result = [...songs];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          getArtistById(song.artist)?.name.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query) ||
          song.genre.toLowerCase().includes(query)
      );
    }
    if (filterGenre !== 'all') {
      result = result.filter((song) => song.genre === filterGenre);
    }
    return result;
  }, [songs, searchQuery, filterGenre]);

  return (
    <div className="space-y-6" data-testid="search-view">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 rounded-full bg-gray-800 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          data-testid="search-input"
        />
        <select
          value={filterGenre}
          onChange={(e) => onFilterGenreChange(e.target.value)}
          className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          data-testid="genre-filter"
          aria-label="Filter by genre"
        >
          <option value="all">All Genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-400" data-testid="search-results-count">
        {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} found
      </div>

      <div>
        {filteredSongs.map((song, i) => (
          <SongRow key={song.id} song={song} index={i} isCurrentSong={currentSongId === song.id} onPlay={onPlay} onLikeToggle={onLikeToggle} onAddToQueue={onAddToQueue} onAddToPlaylist={onAddToPlaylist} />
        ))}
        {filteredSongs.length === 0 && (
          <p className="py-12 text-center text-gray-500" data-testid="no-results">No songs match your search.</p>
        )}
      </div>
    </div>
  );
}

function LibraryView({ songs, sortBy, onSortChange, currentSongId, onPlay, onLikeToggle, onAddToQueue, onAddToPlaylist }) {
  const sortedSongs = useMemo(() => {
    const sorted = [...songs];
    switch (sortBy) {
      case 'title': sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'artist': sorted.sort((a, b) => (getArtistById(a.artist)?.name || '').localeCompare(getArtistById(b.artist)?.name || '')); break;
      case 'plays': sorted.sort((a, b) => b.plays - a.plays); break;
      case 'duration': sorted.sort((a, b) => a.duration - b.duration); break;
      case 'year': sorted.sort((a, b) => b.year - a.year); break;
      default: break;
    }
    return sorted;
  }, [songs, sortBy]);

  const totalDuration = useMemo(() => songs.reduce((sum, s) => sum + s.duration, 0), [songs]);

  return (
    <div className="space-y-4" data-testid="library-view">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl text-white">Your Library</h2>
          <p className="text-sm text-gray-400">{songs.length} songs, {formatDuration(totalDuration)} total</p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none"
          data-testid="sort-select"
          aria-label="Sort by"
        >
          <option value="title">Title</option>
          <option value="artist">Artist</option>
          <option value="plays">Most Played</option>
          <option value="duration">Duration</option>
          <option value="year">Year</option>
        </select>
      </div>

      <div className="rounded-lg border border-gray-800">
        <div className="flex items-center gap-4 border-b border-gray-800 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
          <span className="w-6 text-center">#</span>
          <span className="flex-1">Title</span>
          <span className="hidden w-40 md:block">Album</span>
          <span className="w-16 text-right">Plays</span>
          <span className="w-12 text-right">Time</span>
          <span className="w-20"></span>
        </div>
        {sortedSongs.map((song, i) => (
          <SongRow key={song.id} song={song} index={i} isCurrentSong={currentSongId === song.id} onPlay={onPlay} onLikeToggle={onLikeToggle} onAddToQueue={onAddToQueue} onAddToPlaylist={onAddToPlaylist} />
        ))}
      </div>
    </div>
  );
}

function LikedSongsView({ songs, currentSongId, onPlay, onLikeToggle, onAddToQueue, onAddToPlaylist }) {
  const likedSongs = useMemo(() => songs.filter((s) => s.liked), [songs]);

  return (
    <div className="space-y-4" data-testid="liked-songs-view">
      <div className="rounded-xl bg-gradient-to-br from-purple-800 to-blue-600 p-8">
        <h2 className="mb-2 font-bold text-3xl text-white">Liked Songs</h2>
        <p className="text-purple-200">{likedSongs.length} songs</p>
      </div>
      {likedSongs.length > 0 ? (
        likedSongs.map((song, i) => (
          <SongRow key={song.id} song={song} index={i} isCurrentSong={currentSongId === song.id} onPlay={onPlay} onLikeToggle={onLikeToggle} onAddToQueue={onAddToQueue} onAddToPlaylist={onAddToPlaylist} />
        ))
      ) : (
        <p className="py-12 text-center text-gray-500" data-testid="no-liked-songs">Songs you like will appear here.</p>
      )}
    </div>
  );
}

function RecentlyPlayedView({ recentlyPlayed, songs, currentSongId, onPlay, onLikeToggle, onAddToQueue, onAddToPlaylist }) {
  const recentSongs = useMemo(() => recentlyPlayed.map((id) => songs.find((s) => s.id === id)).filter(Boolean), [recentlyPlayed, songs]);

  return (
    <div className="space-y-4" data-testid="recently-played-view">
      <h2 className="font-bold text-2xl text-white">Recently Played</h2>
      <p className="text-sm text-gray-400">{recentSongs.length} songs</p>
      {recentSongs.map((song, i) => (
        <SongRow key={song.id} song={song} index={i} isCurrentSong={currentSongId === song.id} onPlay={onPlay} onLikeToggle={onLikeToggle} onAddToQueue={onAddToQueue} onAddToPlaylist={onAddToPlaylist} />
      ))}
    </div>
  );
}

function QueueView({ queue, songs, currentSongId, onPlay, onRemoveFromQueue, onClearQueue, onReorderQueue }) {
  const queueSongs = useMemo(() => queue.map((id) => songs.find((s) => s.id === id)).filter(Boolean), [queue, songs]);

  return (
    <div className="space-y-4" data-testid="queue-view">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl text-white">Queue</h2>
          <p className="text-sm text-gray-400">{queueSongs.length} songs</p>
        </div>
        {queueSongs.length > 0 && (
          <button
            type="button"
            onClick={onClearQueue}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            data-testid="clear-queue-btn"
          >
            Clear Queue
          </button>
        )}
      </div>
      {queueSongs.length > 0 ? (
        queueSongs.map((song, i) => {
          const artist = getArtistById(song.artist);
          return (
            <div
              key={`${song.id}-${i}`}
              className={`flex items-center gap-4 rounded-lg px-4 py-2 transition-colors hover:bg-gray-800/50 ${currentSongId === song.id ? 'bg-gray-800' : ''}`}
              data-testid={`queue-item-${i}`}
            >
              <span className="w-6 text-center text-gray-500 text-sm">{i + 1}</span>
              <button type="button" onClick={() => onPlay(song.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div>
                  <p className={`truncate text-sm ${currentSongId === song.id ? 'text-green-400' : 'text-white'}`}>{song.title}</p>
                  <p className="truncate text-xs text-gray-400">{artist?.name}</p>
                </div>
              </button>
              <span className="text-sm text-gray-400">{formatDuration(song.duration)}</span>
              <div className="flex items-center gap-1">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => onReorderQueue(i, i - 1)}
                    className="text-gray-400 hover:text-white"
                    data-testid={`queue-move-up-${i}`}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                )}
                {i < queueSongs.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onReorderQueue(i, i + 1)}
                    className="text-gray-400 hover:text-white"
                    data-testid={`queue-move-down-${i}`}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveFromQueue(i)}
                  className="text-gray-400 hover:text-red-400"
                  data-testid={`queue-remove-${i}`}
                  aria-label="Remove from queue"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p className="py-12 text-center text-gray-500" data-testid="empty-queue">Your queue is empty. Add songs to get started.</p>
      )}
    </div>
  );
}

function PlaylistView({ playlist, songs, currentSongId, onPlay, onLikeToggle, onAddToQueue, onAddToPlaylist, onRemoveFromPlaylist, onEditPlaylist, onDeletePlaylist }) {
  const playlistSongs = useMemo(() => playlist.songs.map((id) => songs.find((s) => s.id === id)).filter(Boolean), [playlist.songs, songs]);
  const totalDuration = useMemo(() => playlistSongs.reduce((sum, s) => sum + s.duration, 0), [playlistSongs]);

  return (
    <div className="space-y-6" data-testid={`playlist-view-${playlist.id}`}>
      <div className="flex items-start gap-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6">
        <div className="flex h-40 w-40 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700 text-6xl">
          {playlist.cover}
        </div>
        <div className="flex-1">
          <p className="mb-1 text-xs font-medium text-gray-400 uppercase">Playlist</p>
          <h2 className="mb-2 font-bold text-3xl text-white" data-testid="playlist-title">{playlist.name}</h2>
          <p className="mb-3 text-sm text-gray-400" data-testid="playlist-description">{playlist.description}</p>
          <p className="text-sm text-gray-400">
            {playlistSongs.length} songs, {formatDuration(totalDuration)} total
            {playlist.isPublic ? ' · Public' : ' · Private'}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => playlistSongs.length > 0 && onPlay(playlistSongs[0].id)}
              className="rounded-full bg-green-500 px-6 py-2 font-semibold text-sm text-black hover:bg-green-400"
              data-testid="playlist-play-all"
            >
              ▶ Play
            </button>
            <button
              type="button"
              onClick={onEditPlaylist}
              className="rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-white hover:text-white"
              data-testid="playlist-edit-btn"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDeletePlaylist}
              className="rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-red-500 hover:text-red-500"
              data-testid="playlist-delete-btn"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {playlistSongs.length > 0 ? (
        playlistSongs.map((song, i) => (
          <div key={song.id} className="group flex items-center gap-4 rounded-lg px-4 py-2 transition-colors hover:bg-gray-800/50" data-testid={`playlist-song-${song.id}`}>
            <span className="w-6 text-center text-gray-500 text-sm">{i + 1}</span>
            <button type="button" onClick={() => onPlay(song.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <div>
                <p className={`truncate text-sm ${currentSongId === song.id ? 'text-green-400' : 'text-white'}`}>{song.title}</p>
                <p className="truncate text-xs text-gray-400">{getArtistById(song.artist)?.name}</p>
              </div>
            </button>
            <span className="text-sm text-gray-400">{song.album}</span>
            <span className="text-sm text-gray-400">{formatDuration(song.duration)}</span>
            <button
              type="button"
              onClick={() => onRemoveFromPlaylist(playlist.id, song.id)}
              className="text-sm text-gray-400 opacity-0 hover:text-red-400 group-hover:opacity-100"
              data-testid={`remove-from-playlist-${song.id}`}
              aria-label="Remove from playlist"
            >
              ✕
            </button>
          </div>
        ))
      ) : (
        <p className="py-12 text-center text-gray-500" data-testid="empty-playlist">This playlist is empty. Search for songs to add.</p>
      )}
    </div>
  );
}

function ArtistDetailModal({ artistId, songs, onClose, onPlay, currentSongId, onLikeToggle, onAddToQueue, onAddToPlaylist }) {
  const artist = getArtistById(artistId);
  const artistSongs = useMemo(() => songs.filter((s) => s.artist === artistId), [songs, artistId]);
  const totalPlays = useMemo(() => artistSongs.reduce((sum, s) => sum + s.plays, 0), [artistSongs]);

  if (!artist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" data-testid="artist-modal">
      <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-gray-900 p-6">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white" data-testid="close-artist-modal">
          ✕
        </button>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-700 text-4xl">{artist.avatar}</div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-2xl text-white">{artist.name}</h2>
              {artist.verified && <span className="text-blue-400" data-testid="verified-badge">✓</span>}
            </div>
            <p className="text-sm text-gray-400">{formatListeners(artist.monthlyListeners)}</p>
            <p className="text-sm text-gray-400">{formatPlays(totalPlays)} total plays · {artistSongs.length} songs</p>
          </div>
        </div>
        <h3 className="mb-3 font-semibold text-lg text-white">Songs</h3>
        {artistSongs.map((song, i) => (
          <SongRow key={song.id} song={song} index={i} isCurrentSong={currentSongId === song.id} onPlay={onPlay} onLikeToggle={onLikeToggle} onAddToQueue={onAddToQueue} onAddToPlaylist={onAddToPlaylist} showAlbum={false} />
        ))}
      </div>
    </div>
  );
}

function CreatePlaylistModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), isPublic });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" data-testid="create-playlist-modal">
      <div className="w-full max-w-md rounded-xl bg-gray-900 p-6">
        <h2 className="mb-4 font-bold text-xl text-white">Create Playlist</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="playlist-name" className="mb-1 block text-sm text-gray-400">Name</label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome playlist"
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              data-testid="playlist-name-input"
            />
          </div>
          <div>
            <label htmlFor="playlist-description" className="mb-1 block text-sm text-gray-400">Description</label>
            <textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              data-testid="playlist-description-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="playlist-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
              data-testid="playlist-public-checkbox"
            />
            <label htmlFor="playlist-public" className="text-sm text-gray-300">Make public</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white"
            data-testid="cancel-create-playlist"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-green-500 px-6 py-2 text-sm font-semibold text-black hover:bg-green-400"
            data-testid="save-playlist-btn"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPlaylistModal({ playlist, onClose, onSave }) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description);
  const [isPublic, setIsPublic] = useState(playlist.isPublic);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ ...playlist, name: name.trim(), description: description.trim(), isPublic });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" data-testid="edit-playlist-modal">
      <div className="w-full max-w-md rounded-xl bg-gray-900 p-6">
        <h2 className="mb-4 font-bold text-xl text-white">Edit Playlist</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-playlist-name" className="mb-1 block text-sm text-gray-400">Name</label>
            <input
              id="edit-playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              data-testid="edit-playlist-name-input"
            />
          </div>
          <div>
            <label htmlFor="edit-playlist-desc" className="mb-1 block text-sm text-gray-400">Description</label>
            <textarea
              id="edit-playlist-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              data-testid="edit-playlist-description-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-playlist-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
              data-testid="edit-playlist-public-checkbox"
            />
            <label htmlFor="edit-playlist-public" className="text-sm text-gray-300">Make public</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white" data-testid="cancel-edit-playlist">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="rounded-lg bg-green-500 px-6 py-2 text-sm font-semibold text-black hover:bg-green-400" data-testid="save-edit-playlist-btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function AddToPlaylistModal({ songId, playlists, onClose, onAddToPlaylist }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" data-testid="add-to-playlist-modal">
      <div className="w-full max-w-sm rounded-xl bg-gray-900 p-6">
        <h2 className="mb-4 font-bold text-lg text-white">Add to Playlist</h2>
        <div className="space-y-2">
          {playlists.map((pl) => {
            const alreadyAdded = pl.songs.includes(songId);
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => !alreadyAdded && onAddToPlaylist(pl.id, songId)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${alreadyAdded ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-800'}`}
                data-testid={`add-to-${pl.id}`}
                disabled={alreadyAdded}
              >
                <span>{pl.cover}</span>
                <div>
                  <p className="text-sm text-white">{pl.name}</p>
                  <p className="text-xs text-gray-400">{pl.songs.length} songs{alreadyAdded ? ' · Already added' : ''}</p>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
          data-testid="close-add-to-playlist"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function MusicStreamingPlayer() {
  const [songs, setSongs] = useState(MOCK_SONGS);
  const [playlists, setPlaylists] = useState(INITIAL_PLAYLISTS);
  const [currentSongId, setCurrentSongId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [queue, setQueue] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off');
  const [isShuffled, setIsShuffled] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [librarySortBy, setLibrarySortBy] = useState('title');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState(INITIAL_RECENTLY_PLAYED);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [addToPlaylistSongId, setAddToPlaylistSongId] = useState(null);
  const [artistDetailId, setArtistDetailId] = useState(null);
  const progressInterval = useRef(null);

  // Load persisted state
  useEffect(() => {
    try {
      const savedPlaylists = localStorage.getItem('soundflowPlaylists');
      if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    } catch {}
    try {
      const savedLikes = localStorage.getItem('soundflowLikes');
      if (savedLikes) {
        const likedIds = JSON.parse(savedLikes);
        setSongs((prev) => prev.map((s) => ({ ...s, liked: likedIds.includes(s.id) })));
      }
    } catch {}
    try {
      const savedVolume = localStorage.getItem('soundflowVolume');
      if (savedVolume) setVolume(Number(savedVolume));
    } catch {}
    try {
      const savedRecent = localStorage.getItem('soundflowRecent');
      if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent));
    } catch {}
    try {
      const savedView = localStorage.getItem('soundflowView');
      if (savedView) setActiveView(savedView);
    } catch {}
  }, []);

  // Persist playlists
  useEffect(() => {
    localStorage.setItem('soundflowPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  // Persist likes
  useEffect(() => {
    const likedIds = songs.filter((s) => s.liked).map((s) => s.id);
    localStorage.setItem('soundflowLikes', JSON.stringify(likedIds));
  }, [songs]);

  // Persist volume
  useEffect(() => {
    localStorage.setItem('soundflowVolume', String(volume));
  }, [volume]);

  // Persist recently played
  useEffect(() => {
    localStorage.setItem('soundflowRecent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  // Persist active view
  useEffect(() => {
    localStorage.setItem('soundflowView', activeView);
  }, [activeView]);

  // Simulate playback progress
  useEffect(() => {
    if (isPlaying && currentSongId) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          const song = getSongById(currentSongId);
          if (!song) return 0;
          if (prev >= song.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, currentSongId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' && currentSongId) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowCreatePlaylistModal(false);
        setEditingPlaylist(null);
        setAddToPlaylistSongId(null);
        setArtistDetailId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSongId]);

  const handlePlaySong = useCallback((songId) => {
    setCurrentSongId(songId);
    setIsPlaying(true);
    setProgress(0);
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((id) => id !== songId);
      return [songId, ...filtered].slice(0, 20);
    });
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!currentSongId) return;
    setIsPlaying((prev) => !prev);
  }, [currentSongId]);

  const handleNext = useCallback(() => {
    if (repeatMode === 'one') {
      setProgress(0);
      return;
    }
    if (queue.length > 0) {
      const nextId = queue[0];
      setQueue((prev) => prev.slice(1));
      handlePlaySong(nextId);
    } else if (currentSongId) {
      const idx = songs.findIndex((s) => s.id === currentSongId);
      if (idx >= 0) {
        const nextIdx = isShuffled ? Math.floor(Math.random() * songs.length) : (idx + 1) % songs.length;
        handlePlaySong(songs[nextIdx].id);
      }
    }
  }, [repeatMode, queue, currentSongId, songs, isShuffled, handlePlaySong]);

  const handlePrevious = useCallback(() => {
    if (progress > 3) {
      setProgress(0);
      return;
    }
    if (currentSongId) {
      const idx = songs.findIndex((s) => s.id === currentSongId);
      if (idx > 0) {
        handlePlaySong(songs[idx - 1].id);
      }
    }
  }, [progress, currentSongId, songs, handlePlaySong]);

  const handleSeek = useCallback((value) => {
    setProgress(value);
  }, []);

  const handleVolumeChange = useCallback((value) => {
    setVolume(value);
  }, []);

  const handleRepeatToggle = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const handleShuffleToggle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const handleLikeToggle = useCallback((songId) => {
    setSongs((prev) => prev.map((s) => (s.id === songId ? { ...s, liked: !s.liked } : s)));
  }, []);

  const handleAddToQueue = useCallback((songId) => {
    setQueue((prev) => [...prev, songId]);
  }, []);

  const handleRemoveFromQueue = useCallback((index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const handleReorderQueue = useCallback((fromIndex, toIndex) => {
    setQueue((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }, []);

  const handleCreatePlaylist = useCallback(({ name, description, isPublic }) => {
    const newPlaylist = {
      id: `p${Date.now()}`,
      name,
      description,
      songs: [],
      createdAt: Date.now(),
      cover: ['🎵', '🎶', '🎼', '🎧', '🎤', '🎸'][Math.floor(Math.random() * 6)],
      isPublic,
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setShowCreatePlaylistModal(false);
  }, []);

  const handleEditPlaylist = useCallback((updatedPlaylist) => {
    setPlaylists((prev) => prev.map((p) => (p.id === updatedPlaylist.id ? updatedPlaylist : p)));
    setEditingPlaylist(null);
  }, []);

  const handleDeletePlaylist = useCallback((playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    setActiveView('home');
  }, []);

  const handleAddToPlaylist = useCallback((playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.songs.includes(songId)
          ? { ...p, songs: [...p.songs, songId] }
          : p
      )
    );
    setAddToPlaylistSongId(null);
  }, []);

  const handleRemoveFromPlaylist = useCallback((playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId ? { ...p, songs: p.songs.filter((id) => id !== songId) } : p
      )
    );
  }, []);

  const handleViewChange = useCallback((view) => {
    setActiveView(view);
  }, []);

  // Determine current view content
  const currentPlaylist = activeView.startsWith('playlist:') ? playlists.find((p) => p.id === activeView.split(':')[1]) : null;

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white" data-testid="music-streaming-app">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          playlists={playlists}
          onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-6 pb-28" data-testid="main-content">
          {activeView === 'home' && (
            <HomeView
              songs={songs}
              recentlyPlayed={recentlyPlayed}
              currentSongId={currentSongId}
              onPlay={handlePlaySong}
              onLikeToggle={handleLikeToggle}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(songId) => setAddToPlaylistSongId(songId)}
              onViewChange={handleViewChange}
            />
          )}
          {activeView === 'search' && (
            <SearchView
              songs={songs}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterGenre={filterGenre}
              onFilterGenreChange={setFilterGenre}
              currentSongId={currentSongId}
              onPlay={handlePlaySong}
              onLikeToggle={handleLikeToggle}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(songId) => setAddToPlaylistSongId(songId)}
            />
          )}
          {activeView === 'library' && (
            <LibraryView
              songs={songs}
              sortBy={librarySortBy}
              onSortChange={setLibrarySortBy}
              currentSongId={currentSongId}
              onPlay={handlePlaySong}
              onLikeToggle={handleLikeToggle}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(songId) => setAddToPlaylistSongId(songId)}
            />
          )}
          {activeView === 'liked' && (
            <LikedSongsView
              songs={songs}
              currentSongId={currentSongId}
              onPlay={handlePlaySong}
              onLikeToggle={handleLikeToggle}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(songId) => setAddToPlaylistSongId(songId)}
            />
          )}
          {activeView === 'recent' && (
            <RecentlyPlayedView
              recentlyPlayed={recentlyPlayed}
              songs={songs}
              currentSongId={currentSongId}
              onPlay={handlePlaySong}
              onLikeToggle={handleLikeToggle}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(songId) => setAddToPlaylistSongId(songId)}
            />
          )}
          {activeView === 'queue' && (
            <QueueView
              queue={queue}
              songs={songs}
              currentSongId={currentSongId}
              onPlay={handlePlaySong}
              onRemoveFromQueue={handleRemoveFromQueue}
              onClearQueue={handleClearQueue}
              onReorderQueue={handleReorderQueue}
            />
          )}
          {currentPlaylist && (
            <PlaylistView
              playlist={currentPlaylist}
              songs={songs}
              currentSongId={currentSongId}
              onPlay={handlePlaySong}
              onLikeToggle={handleLikeToggle}
              onAddToQueue={handleAddToQueue}
              onAddToPlaylist={(songId) => setAddToPlaylistSongId(songId)}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
              onEditPlaylist={() => setEditingPlaylist(currentPlaylist)}
              onDeletePlaylist={() => handleDeletePlaylist(currentPlaylist.id)}
            />
          )}
        </main>
      </div>

      <PlayerBar
        currentSong={currentSongId}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        progress={progress}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        repeatMode={repeatMode}
        onRepeatToggle={handleRepeatToggle}
        isShuffled={isShuffled}
        onShuffleToggle={handleShuffleToggle}
        queue={queue}
      />

      {showCreatePlaylistModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreatePlaylistModal(false)}
          onSave={handleCreatePlaylist}
        />
      )}
      {editingPlaylist && (
        <EditPlaylistModal
          playlist={editingPlaylist}
          onClose={() => setEditingPlaylist(null)}
          onSave={handleEditPlaylist}
        />
      )}
      {addToPlaylistSongId && (
        <AddToPlaylistModal
          songId={addToPlaylistSongId}
          playlists={playlists}
          onClose={() => setAddToPlaylistSongId(null)}
          onAddToPlaylist={handleAddToPlaylist}
        />
      )}
      {artistDetailId && (
        <ArtistDetailModal
          artistId={artistDetailId}
          songs={songs}
          onClose={() => setArtistDetailId(null)}
          onPlay={handlePlaySong}
          currentSongId={currentSongId}
          onLikeToggle={handleLikeToggle}
          onAddToQueue={handleAddToQueue}
          onAddToPlaylist={(songId) => setAddToPlaylistSongId(songId)}
        />
      )}
    </div>
  );
}
