import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MusicPlayer from './src/app/page.jsx';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock confirm dialog
window.confirm = vi.fn();

describe('MusicPlayer Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    test('renders Melodify branding in sidebar', () => {
      render(<MusicPlayer />);
      expect(screen.getByText(/Melodify/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<MusicPlayer />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
      expect(screen.getByText('Recently Played')).toBeInTheDocument();
      expect(screen.getByText('Playlists')).toBeInTheDocument();
      expect(screen.getByText('Artists')).toBeInTheDocument();
      expect(screen.getByText('Albums')).toBeInTheDocument();
    });

    test('renders home view by default with greeting', () => {
      render(<MusicPlayer />);
      expect(screen.getByText(/Good (Morning|Afternoon|Evening)/)).toBeInTheDocument();
    });

    test('renders now playing bar with no track selected', () => {
      render(<MusicPlayer />);
      expect(screen.getByText('No track selected')).toBeInTheDocument();
    });

    test('renders playback control buttons', () => {
      render(<MusicPlayer />);
      expect(screen.getByLabelText('Shuffle')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous track')).toBeInTheDocument();
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
      expect(screen.getByLabelText('Next track')).toBeInTheDocument();
      expect(screen.getByLabelText('Repeat')).toBeInTheDocument();
    });

    test('renders volume and extra controls', () => {
      render(<MusicPlayer />);
      expect(screen.getByLabelText('Show lyrics')).toBeInTheDocument();
      expect(screen.getByLabelText('Show queue')).toBeInTheDocument();
      expect(screen.getByLabelText('Mute')).toBeInTheDocument();
    });

    test('renders top tracks section on home view', () => {
      render(<MusicPlayer />);
      expect(screen.getByText('Top Tracks')).toBeInTheDocument();
    });

    test('renders featured playlists on home view', () => {
      render(<MusicPlayer />);
      expect(screen.getByText('Featured Playlists')).toBeInTheDocument();
      expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
      expect(screen.getByText('Workout Mix')).toBeInTheDocument();
    });

    test('renders browse artists section on home view', () => {
      render(<MusicPlayer />);
      expect(screen.getByText('Browse Artists')).toBeInTheDocument();
      expect(screen.getByText('Luna Wave')).toBeInTheDocument();
    });

    test('renders equalizer button in sidebar', () => {
      render(<MusicPlayer />);
      expect(screen.getByLabelText('Equalizer')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Search shows search view with input', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      expect(screen.getByPlaceholderText('Search tracks, artists, albums...')).toBeInTheDocument();
    });

    test('clicking Library shows library view', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Library'));
      expect(screen.getByText('Your Library')).toBeInTheDocument();
      expect(screen.getByText('Liked Songs')).toBeInTheDocument();
    });

    test('clicking Favorites shows favorites view', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Favorites'));
      expect(screen.getByText('Liked Songs')).toBeInTheDocument();
      expect(screen.getByText('Songs you like will appear here')).toBeInTheDocument();
    });

    test('clicking Recently Played shows empty state', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Recently Played'));
      expect(screen.getByText('Your listening history will appear here')).toBeInTheDocument();
    });

    test('clicking Playlists shows playlists view', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      expect(screen.getByText('Your Playlists')).toBeInTheDocument();
      expect(screen.getByText('+ New Playlist')).toBeInTheDocument();
    });

    test('clicking Artists shows all artists', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Artists'));
      expect(screen.getByText('Luna Wave')).toBeInTheDocument();
      expect(screen.getByText('Steel Horizon')).toBeInTheDocument();
      expect(screen.getByText('DJ Prism')).toBeInTheDocument();
      expect(screen.getByText('Miles Beyond')).toBeInTheDocument();
      expect(screen.getByText('MC Thunder')).toBeInTheDocument();
    });

    test('clicking Albums shows all albums', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Albums'));
      expect(screen.getByText('Midnight Glow')).toBeInTheDocument();
      expect(screen.getByText('Electric Storm')).toBeInTheDocument();
      expect(screen.getByText('Neon Dreams')).toBeInTheDocument();
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<MusicPlayer />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('Search')).not.toBeInTheDocument();
      expect(screen.queryByText('Library')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<MusicPlayer />);
      const toggle = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    test('search input filters tracks by title', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      const searchInput = screen.getByPlaceholderText('Search tracks, artists, albums...');
      fireEvent.change(searchInput, { target: { value: 'Moonrise' } });
      expect(screen.getByText('1 track found')).toBeInTheDocument();
    });

    test('search input filters tracks by artist name', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      const searchInput = screen.getByPlaceholderText('Search tracks, artists, albums...');
      fireEvent.change(searchInput, { target: { value: 'Luna Wave' } });
      // Luna Wave has tracks: Moonrise, City Lights, Dreaming Wide Awake, Starlight, Gravity
      expect(screen.getByText('5 tracks found')).toBeInTheDocument();
    });

    test('genre filter shows only tracks of selected genre', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByText('Jazz'));
      expect(screen.getByText('2 tracks found')).toBeInTheDocument();
      expect(screen.getByText('Autumn Leaves')).toBeInTheDocument();
      expect(screen.getByText('Midnight Blue')).toBeInTheDocument();
    });

    test('clearing genre filter shows all tracks', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByText('Jazz'));
      fireEvent.click(screen.getByText('All'));
      expect(screen.getByText('24 tracks found')).toBeInTheDocument();
    });

    test('sort by title works', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      // Default sort is by title ascending
      const trackRows = screen.getAllByRole('row');
      expect(trackRows.length).toBeGreaterThan(0);
    });

    test('clicking sort button toggles direction', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      const titleButton = screen.getByText(/Title/);
      fireEvent.click(titleButton);
      expect(screen.getByText(/Title.*↓/)).toBeInTheDocument();
    });

    test('clicking different sort field changes sort', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByText(/Plays/));
      expect(screen.getByText(/Plays.*↑/)).toBeInTheDocument();
    });

    test('search combined with genre filter', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByText('Electronic'));
      const searchInput = screen.getByPlaceholderText('Search tracks, artists, albums...');
      fireEvent.change(searchInput, { target: { value: 'Neon' } });
      expect(screen.getByText('Neon Rain')).toBeInTheDocument();
    });
  });

  describe('Track Playback', () => {
    test('clicking a track starts playback', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      const trackRow = screen.getByLabelText('Play Moonrise');
      fireEvent.click(trackRow);
      // Now playing bar should show current track
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    });

    test('clicking play/pause toggles playback state', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Pause'));
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
    });

    test('progress shows formatted time', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      // Initial progress should show 0:00
      expect(screen.getByText('0:00')).toBeInTheDocument();
      // Track duration of Moonrise is 214 seconds = 3:34
      expect(screen.getByText('3:34')).toBeInTheDocument();
    });

    test('playing a track adds it to recently played', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      fireEvent.click(screen.getByText('Recently Played'));
      expect(screen.getByText('Moonrise')).toBeInTheDocument();
    });

    test('recently played persists to localStorage', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'musicPlayerRecent',
        expect.stringContaining('t1')
      );
    });
  });

  describe('Shuffle and Repeat', () => {
    test('clicking shuffle toggles shuffle mode', () => {
      render(<MusicPlayer />);
      const shuffleButton = screen.getByLabelText('Shuffle');
      fireEvent.click(shuffleButton);
      // Shuffle is now on (button color changes — we just verify no error)
      fireEvent.click(shuffleButton);
      // Shuffle is now off
    });

    test('clicking repeat cycles through modes', () => {
      render(<MusicPlayer />);
      const repeatButton = screen.getByLabelText('Repeat');
      // none -> all
      fireEvent.click(repeatButton);
      // all -> one (shows 🔂)
      fireEvent.click(repeatButton);
      expect(screen.getByText('🔂')).toBeInTheDocument();
      // one -> none
      fireEvent.click(repeatButton);
    });
  });

  describe('Volume Controls', () => {
    test('clicking mute button toggles mute', () => {
      render(<MusicPlayer />);
      const muteButton = screen.getByLabelText('Mute');
      fireEvent.click(muteButton);
      expect(screen.getByLabelText('Unmute')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Unmute'));
      expect(screen.getByLabelText('Mute')).toBeInTheDocument();
    });

    test('volume is saved to localStorage', () => {
      render(<MusicPlayer />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('musicPlayerVolume', '75');
    });
  });

  describe('Favorites', () => {
    test('clicking heart icon adds track to favorites', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      const favButton = screen.getByLabelText('Add Moonrise to favorites');
      fireEvent.click(favButton);
      // Now the button should say remove
      expect(screen.getByLabelText('Remove Moonrise from favorites')).toBeInTheDocument();
    });

    test('favorited tracks appear in Favorites view', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Add Moonrise to favorites'));
      fireEvent.click(screen.getByText('Favorites'));
      expect(screen.getByText('Moonrise')).toBeInTheDocument();
      expect(screen.getByText('1 songs')).toBeInTheDocument();
    });

    test('unfavoriting removes track from Favorites view', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Add Moonrise to favorites'));
      fireEvent.click(screen.getByText('Favorites'));
      fireEvent.click(screen.getByLabelText('Remove Moonrise from favorites'));
      expect(screen.getByText('Songs you like will appear here')).toBeInTheDocument();
    });

    test('favorites persist to localStorage', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Add Moonrise to favorites'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'musicPlayerFavorites',
        expect.stringContaining('t1')
      );
    });

    test('favorite button on now playing bar works', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      // The now playing bar also has a favorite button
      const favButton = screen.getByLabelText('Add to favorites');
      fireEvent.click(favButton);
      expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
    });
  });

  describe('Queue Management', () => {
    test('clicking queue button opens queue panel', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Show queue'));
      expect(screen.getByText('Queue')).toBeInTheDocument();
      expect(screen.getByText('Queue is empty')).toBeInTheDocument();
    });

    test('adding a track to queue shows it in queue panel', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      const addButton = screen.getByLabelText('Add Moonrise to queue');
      fireEvent.click(addButton);
      fireEvent.click(screen.getByLabelText('Show queue'));
      expect(screen.getByText('Up Next (1 tracks)')).toBeInTheDocument();
    });

    test('removing a track from queue', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Add Moonrise to queue'));
      fireEvent.click(screen.getByLabelText('Show queue'));
      fireEvent.click(screen.getByLabelText('Remove Moonrise from queue'));
      expect(screen.getByText('Queue is empty')).toBeInTheDocument();
    });

    test('clearing queue removes all tracks', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Add Moonrise to queue'));
      fireEvent.click(screen.getByLabelText('Add City Lights to queue'));
      fireEvent.click(screen.getByLabelText('Show queue'));
      fireEvent.click(screen.getByText('Clear'));
      expect(screen.getByText('Queue is empty')).toBeInTheDocument();
    });

    test('closing queue panel', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Show queue'));
      expect(screen.getByText('Queue')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Close queue'));
      expect(screen.queryByText('Queue is empty')).not.toBeInTheDocument();
    });

    test('playing a track shows Now Playing in queue', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      fireEvent.click(screen.getByLabelText('Show queue'));
      expect(screen.getByText('Now Playing')).toBeInTheDocument();
    });
  });

  describe('Playlist Management', () => {
    test('clicking + New Playlist opens create modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByText('+ New Playlist'));
      expect(screen.getByText('Create New Playlist')).toBeInTheDocument();
    });

    test('creating a new playlist', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByText('+ New Playlist'));
      const form = screen.getByText('Create New Playlist').closest('div').querySelector('form');
      const nameInput = form.querySelector('input[name="name"]');
      fireEvent.change(nameInput, { target: { value: 'My Test Playlist' } });
      fireEvent.click(screen.getByText('Create'));
      expect(screen.queryByText('Create New Playlist')).not.toBeInTheDocument();
      expect(screen.getByText('My Test Playlist')).toBeInTheDocument();
    });

    test('cancel button closes create playlist modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByText('+ New Playlist'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Playlist')).not.toBeInTheDocument();
    });

    test('deleting a playlist with confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByLabelText('Delete Chill Vibes'));
      expect(screen.queryByText('Chill Vibes')).not.toBeInTheDocument();
    });

    test('canceling playlist deletion keeps playlist', () => {
      window.confirm.mockReturnValue(false);
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByLabelText('Delete Chill Vibes'));
      expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
    });

    test('clicking a playlist shows its tracks', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByText('Chill Vibes'));
      expect(screen.getByText('Relaxing tunes for any mood')).toBeInTheDocument();
      expect(screen.getByText('5 songs,')).toBeInTheDocument();
    });

    test('playlist has Play All button', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByText('Chill Vibes'));
      expect(screen.getByText('▶ Play All')).toBeInTheDocument();
    });

    test('adding a track to a playlist via modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      const addButton = screen.getByLabelText('Add Moonrise to playlist');
      fireEvent.click(addButton);
      expect(screen.getByText('Add to Playlist')).toBeInTheDocument();
      expect(screen.getByText(/Adding "Moonrise"/)).toBeInTheDocument();
      // Find the Workout Mix button (Moonrise is already in Chill Vibes)
      fireEvent.click(screen.getByText('Workout Mix'));
      expect(screen.queryByText('Add to Playlist')).not.toBeInTheDocument();
    });

    test('already-added tracks are disabled in add-to-playlist modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Add Moonrise to playlist'));
      // Moonrise (t1) is in Chill Vibes — should show ✓ Added
      expect(screen.getByText('✓ Added')).toBeInTheDocument();
    });

    test('removing a track from playlist detail view', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByText('Chill Vibes'));
      const removeButton = screen.getByLabelText('Remove Moonrise from playlist');
      fireEvent.click(removeButton);
      // Playlist should have one less track
      expect(screen.getByText('4 songs,')).toBeInTheDocument();
    });

    test('playlists persist to localStorage', () => {
      render(<MusicPlayer />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'musicPlayerPlaylists',
        expect.any(String)
      );
    });
  });

  describe('Artist Detail View', () => {
    test('clicking an artist shows artist detail', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Artists'));
      fireEvent.click(screen.getByText('Luna Wave'));
      expect(screen.getByText('Pop')).toBeInTheDocument();
      expect(screen.getByText(/2\.4M followers/)).toBeInTheDocument();
    });

    test('artist detail shows popular tracks', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Artists'));
      fireEvent.click(screen.getByText('Luna Wave'));
      expect(screen.getByText('Popular Tracks')).toBeInTheDocument();
      expect(screen.getByText('Moonrise')).toBeInTheDocument();
      expect(screen.getByText('City Lights')).toBeInTheDocument();
      expect(screen.getByText('Dreaming Wide Awake')).toBeInTheDocument();
    });

    test('artist detail shows albums section', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Artists'));
      fireEvent.click(screen.getByText('Luna Wave'));
      // Luna Wave has 2 albums
      expect(screen.getByText('Midnight Glow')).toBeInTheDocument();
      expect(screen.getByText('Starlight Sessions')).toBeInTheDocument();
    });
  });

  describe('Album Detail View', () => {
    test('clicking an album shows album detail', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Albums'));
      fireEvent.click(screen.getByText('Neon Dreams'));
      expect(screen.getByText('DJ Prism')).toBeInTheDocument();
      expect(screen.getByText('3 songs,')).toBeInTheDocument();
    });

    test('album detail shows Play All button', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Albums'));
      fireEvent.click(screen.getByText('Neon Dreams'));
      expect(screen.getByText('▶ Play All')).toBeInTheDocument();
    });

    test('album detail shows track listing', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Albums'));
      fireEvent.click(screen.getByText('Neon Dreams'));
      expect(screen.getByText('Pulse')).toBeInTheDocument();
      expect(screen.getByText('Digital Horizon')).toBeInTheDocument();
      expect(screen.getByText('Neon Rain')).toBeInTheDocument();
    });

    test('clicking artist name on album navigates to artist', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Albums'));
      fireEvent.click(screen.getByText('Neon Dreams'));
      // Click the artist link under the album header
      const artistLink = screen.getByText(/🎧 DJ Prism/);
      fireEvent.click(artistLink);
      expect(screen.getByText('Popular Tracks')).toBeInTheDocument();
    });
  });

  describe('Library View', () => {
    test('library shows liked songs card', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Library'));
      expect(screen.getByText('Liked Songs')).toBeInTheDocument();
    });

    test('library shows recently played card', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Library'));
      expect(screen.getByText('Recently Played')).toBeInTheDocument();
    });

    test('library shows all playlists', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Library'));
      expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
      expect(screen.getByText('Workout Mix')).toBeInTheDocument();
      expect(screen.getByText('Road Trip')).toBeInTheDocument();
      expect(screen.getByText('Late Night Coding')).toBeInTheDocument();
    });

    test('clicking Liked Songs card navigates to favorites', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Library'));
      fireEvent.click(screen.getByText('Liked Songs'));
      expect(screen.getByText('Songs you like will appear here')).toBeInTheDocument();
    });
  });

  describe('Lyrics Panel', () => {
    test('clicking lyrics button with no track does nothing', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Show lyrics'));
      expect(screen.queryByText('Lyrics')).not.toBeInTheDocument();
    });

    test('lyrics panel shows for current track', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      fireEvent.click(screen.getByLabelText('Show lyrics'));
      expect(screen.getByText('Lyrics')).toBeInTheDocument();
      expect(screen.getByText('Lyrics not available for this track.')).toBeInTheDocument();
    });

    test('closing lyrics panel', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      fireEvent.click(screen.getByLabelText('Show lyrics'));
      fireEvent.click(screen.getByLabelText('Close lyrics'));
      expect(screen.queryByText('Lyrics not available for this track.')).not.toBeInTheDocument();
    });
  });

  describe('Equalizer', () => {
    test('clicking Equalizer opens equalizer modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Equalizer'));
      expect(screen.getByText('Equalizer')).toBeInTheDocument();
      expect(screen.getByText('Flat')).toBeInTheDocument();
    });

    test('equalizer shows all preset options', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Equalizer'));
      expect(screen.getByText('Bass Boost')).toBeInTheDocument();
      expect(screen.getByText('Treble Boost')).toBeInTheDocument();
      expect(screen.getByText('Vocal')).toBeInTheDocument();
      expect(screen.getByText('Electronic')).toBeInTheDocument();
      expect(screen.getByText('Rock')).toBeInTheDocument();
      expect(screen.getByText('Jazz')).toBeInTheDocument();
      expect(screen.getByText('Classical')).toBeInTheDocument();
    });

    test('selecting a preset changes the active preset', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Equalizer'));
      fireEvent.click(screen.getByText('Bass Boost'));
      // The Bass Boost button should now be active (different color)
    });

    test('equalizer shows frequency labels', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Equalizer'));
      expect(screen.getByText('60Hz')).toBeInTheDocument();
      expect(screen.getByText('1kHz')).toBeInTheDocument();
      expect(screen.getByText('15kHz')).toBeInTheDocument();
    });

    test('closing equalizer modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Equalizer'));
      fireEvent.click(screen.getByLabelText('Close equalizer'));
      expect(screen.queryByText('60Hz')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes create playlist modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      fireEvent.click(screen.getByText('+ New Playlist'));
      expect(screen.getByText('Create New Playlist')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Create New Playlist')).not.toBeInTheDocument();
    });

    test('Escape closes equalizer modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByLabelText('Equalizer'));
      expect(screen.getByText('60Hz')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('60Hz')).not.toBeInTheDocument();
    });

    test('Escape closes lyrics panel', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Play Moonrise'));
      fireEvent.click(screen.getByLabelText('Show lyrics'));
      expect(screen.getByText('Lyrics')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Lyrics not available for this track.')).not.toBeInTheDocument();
    });

    test('Escape closes add to playlist modal', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Search'));
      fireEvent.click(screen.getByLabelText('Add Moonrise to playlist'));
      expect(screen.getByText('Add to Playlist')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Add to Playlist')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('favorites are loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicPlayerFavorites') return JSON.stringify(['t1', 't7']);
        return null;
      });
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Favorites'));
      expect(screen.getByText('Moonrise')).toBeInTheDocument();
      expect(screen.getByText('Pulse')).toBeInTheDocument();
      expect(screen.getByText('2 songs')).toBeInTheDocument();
    });

    test('playlists are loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicPlayerPlaylists')
          return JSON.stringify([
            { id: 'custom1', name: 'Saved Playlist', description: 'From localStorage', trackIds: ['t1'], cover: '🎶' },
          ]);
        return null;
      });
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Playlists'));
      expect(screen.getByText('Saved Playlist')).toBeInTheDocument();
    });

    test('volume is loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicPlayerVolume') return '30';
        return null;
      });
      render(<MusicPlayer />);
      // Just verify it doesn't crash — volume bar width would be 30%
    });

    test('recently played are loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicPlayerRecent') return JSON.stringify(['t14', 't7']);
        return null;
      });
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Recently Played'));
      expect(screen.getByText('Flow State')).toBeInTheDocument();
      expect(screen.getByText('Pulse')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicPlayerFavorites') return 'not valid json{{{';
        if (key === 'musicPlayerPlaylists') return 'broken[';
        return null;
      });
      expect(() => render(<MusicPlayer />)).not.toThrow();
    });
  });

  describe('Home View Cards', () => {
    test('home view shows recently played when there is history', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicPlayerRecent') return JSON.stringify(['t1', 't7', 't14']);
        return null;
      });
      render(<MusicPlayer />);
      // Home view should show Recently Played section
      expect(screen.getByText('Recently Played')).toBeInTheDocument();
    });

    test('home view featured playlists are clickable', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Chill Vibes'));
      expect(screen.getByText('Relaxing tunes for any mood')).toBeInTheDocument();
    });

    test('home view browse artists are clickable', () => {
      render(<MusicPlayer />);
      fireEvent.click(screen.getByText('Luna Wave'));
      expect(screen.getByText('Popular Tracks')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<MusicPlayer />)).not.toThrow();
    });

    test('play/pause with no track does nothing', () => {
      render(<MusicPlayer />);
      expect(() => fireEvent.click(screen.getByLabelText('Play'))).not.toThrow();
    });

    test('skip next with empty queue does nothing', () => {
      render(<MusicPlayer />);
      expect(() => fireEvent.click(screen.getByLabelText('Next track'))).not.toThrow();
    });

    test('skip previous with empty queue does nothing', () => {
      render(<MusicPlayer />);
      expect(() => fireEvent.click(screen.getByLabelText('Previous track'))).not.toThrow();
    });
  });
});
