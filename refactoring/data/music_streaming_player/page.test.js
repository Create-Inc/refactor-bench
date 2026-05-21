import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MusicStreamingPlayer from './src/app/page.jsx';

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

describe('MusicStreamingPlayer Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with SoundFlow title', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByText('SoundFlow')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Your Library')).toBeInTheDocument();
      expect(screen.getByText('Liked Songs')).toBeInTheDocument();
      expect(screen.getByText('Recently Played')).toBeInTheDocument();
      expect(screen.getByText('Queue')).toBeInTheDocument();
    });

    test('renders playlists in sidebar', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
      expect(screen.getByText('Workout Energy')).toBeInTheDocument();
      expect(screen.getByText('Focus Flow')).toBeInTheDocument();
      expect(screen.getByText('Road Trip')).toBeInTheDocument();
    });

    test('renders home view by default', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByText('Good evening')).toBeInTheDocument();
      expect(screen.getByTestId('home-view')).toBeInTheDocument();
    });

    test('renders player bar', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByTestId('player-bar')).toBeInTheDocument();
      expect(screen.getByText('No song playing')).toBeInTheDocument();
    });

    test('renders create playlist button', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByLabelText('Create playlist')).toBeInTheDocument();
    });

    test('renders toggle sidebar button', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });
  });

  describe('Home View', () => {
    test('renders quick play cards from recently played', () => {
      render(<MusicStreamingPlayer />);
      // Recently played includes s2 (Electric Sunrise), s17 (Starlight Anthem), etc.
      expect(screen.getByText('Electric Sunrise')).toBeInTheDocument();
      expect(screen.getByText('Starlight Anthem')).toBeInTheDocument();
    });

    test('renders Top Songs section', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByTestId('top-songs-section')).toBeInTheDocument();
      expect(screen.getByText('Top Songs')).toBeInTheDocument();
    });

    test('renders New Releases section', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByTestId('new-releases-section')).toBeInTheDocument();
      expect(screen.getByText('New Releases')).toBeInTheDocument();
    });

    test('clicking a song starts playback', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('play-song-s2'));
      expect(screen.getByTestId('now-playing-title')).toHaveTextContent('Electric Sunrise');
      expect(screen.getByTestId('now-playing-artist')).toHaveTextContent('DJ Prism');
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Search shows search view', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      expect(screen.getByTestId('search-view')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    test('clicking Your Library shows library view', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-library'));
      expect(screen.getByTestId('library-view')).toBeInTheDocument();
      expect(screen.getByText('Your Library')).toBeInTheDocument();
    });

    test('clicking Liked Songs shows liked songs view', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-liked'));
      expect(screen.getByTestId('liked-songs-view')).toBeInTheDocument();
    });

    test('clicking Recently Played shows recent view', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-recent'));
      expect(screen.getByTestId('recently-played-view')).toBeInTheDocument();
    });

    test('clicking Queue shows queue view', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-queue'));
      expect(screen.getByTestId('queue-view')).toBeInTheDocument();
    });

    test('clicking a playlist in sidebar shows playlist view', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      expect(screen.getByTestId('playlist-view-p1')).toBeInTheDocument();
      expect(screen.getByTestId('playlist-title')).toHaveTextContent('Chill Vibes');
    });

    test('saves active view to localStorage on navigation', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('soundflowView', 'search');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('collapsing sidebar hides navigation labels', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('Search')).not.toBeInTheDocument();
      expect(screen.queryByText('Your Library')).not.toBeInTheDocument();
    });

    test('collapsing sidebar hides playlist names', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('Chill Vibes')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Chill Vibes')).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    test('search input filters songs by title', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'Midnight' } });
      expect(screen.getByText('Midnight Glow')).toBeInTheDocument();
      expect(screen.queryByText('Electric Sunrise')).not.toBeInTheDocument();
    });

    test('search input filters songs by artist name', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'DJ Prism' } });
      expect(screen.getByText('Electric Sunrise')).toBeInTheDocument();
      expect(screen.getByText('Deep Frequency')).toBeInTheDocument();
    });

    test('search input filters songs by album name', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'Frequency' } });
      expect(screen.getByText('Electric Sunrise')).toBeInTheDocument();
      expect(screen.getByText('Deep Frequency')).toBeInTheDocument();
      expect(screen.getByText('Cosmic Drift')).toBeInTheDocument();
    });

    test('genre filter works', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      const filter = screen.getByTestId('genre-filter');
      fireEvent.change(filter, { target: { value: 'jazz' } });
      expect(screen.getByText('Blue Note Serenade')).toBeInTheDocument();
      expect(screen.getByText('Smoky Room')).toBeInTheDocument();
      expect(screen.queryByText('Midnight Glow')).not.toBeInTheDocument();
    });

    test('search and genre filter work together', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      const input = screen.getByTestId('search-input');
      const filter = screen.getByTestId('genre-filter');
      fireEvent.change(input, { target: { value: 'Neon' } });
      fireEvent.change(filter, { target: { value: 'electronic' } });
      expect(screen.getByText('Neon Dreams')).toBeInTheDocument();
      expect(screen.queryByText('Blue Note Serenade')).not.toBeInTheDocument();
    });

    test('clearing search shows all songs', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'Midnight' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(screen.getByTestId('search-results-count')).toHaveTextContent('20 songs found');
    });

    test('shows no results message when nothing matches', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'xyznonexistent' } });
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
    });

    test('search results count updates correctly', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'jazz' } });
      expect(screen.getByTestId('search-results-count')).toHaveTextContent('2 songs found');
    });
  });

  describe('Library View', () => {
    test('shows total song count and duration', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-library'));
      expect(screen.getByText(/20 songs/)).toBeInTheDocument();
    });

    test('sort by title works', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-library'));
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'title' } });
      // Songs should be sorted alphabetically - first should be "Autumn Leaves Fall"
      const firstRow = screen.getByTestId('song-row-s7');
      expect(firstRow).toBeInTheDocument();
    });

    test('sort by plays works', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-library'));
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'plays' } });
      // Most played should be Electric Sunrise (8.1M)
      expect(screen.getByTestId('song-row-s2')).toBeInTheDocument();
    });

    test('shows album column', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-library'));
      expect(screen.getByText('Starlight')).toBeInTheDocument();
      expect(screen.getByText('Frequency')).toBeInTheDocument();
    });
  });

  describe('Liked Songs', () => {
    test('shows only liked songs', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-liked'));
      // Default liked: s2, s4, s6, s9, s13, s16
      expect(screen.getByText('Electric Sunrise')).toBeInTheDocument();
      expect(screen.getByText('Blue Note Serenade')).toBeInTheDocument();
      expect(screen.getByText('Velvet Touch')).toBeInTheDocument();
    });

    test('toggling like removes song from liked view', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-liked'));
      const likeBtn = screen.getByTestId('like-btn-s2');
      fireEvent.click(likeBtn);
      expect(screen.queryByTestId('song-row-s2')).not.toBeInTheDocument();
    });

    test('shows empty state when no liked songs', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-liked'));
      // Unlike all songs
      const likedIds = ['s2', 's4', 's6', 's9', 's13', 's16'];
      likedIds.forEach((id) => {
        const btn = screen.queryByTestId(`like-btn-${id}`);
        if (btn) fireEvent.click(btn);
      });
      expect(screen.getByTestId('no-liked-songs')).toBeInTheDocument();
    });
  });

  describe('Player Controls', () => {
    test('play/pause toggles when a song is playing', () => {
      render(<MusicStreamingPlayer />);
      // Play a song first
      fireEvent.click(screen.getByTestId('play-song-s1'));
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('play-pause-btn'));
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
    });

    test('playing a song shows now playing info', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('play-song-s6'));
      expect(screen.getByTestId('now-playing-title')).toHaveTextContent('Velvet Touch');
      expect(screen.getByTestId('now-playing-artist')).toHaveTextContent('Skyler Gray');
    });

    test('shuffle toggle changes state', () => {
      render(<MusicStreamingPlayer />);
      const shuffleBtn = screen.getByTestId('shuffle-btn');
      expect(screen.getByLabelText('Enable shuffle')).toBeInTheDocument();
      fireEvent.click(shuffleBtn);
      expect(screen.getByLabelText('Disable shuffle')).toBeInTheDocument();
    });

    test('repeat toggle cycles through modes', () => {
      render(<MusicStreamingPlayer />);
      const repeatBtn = screen.getByTestId('repeat-btn');
      expect(screen.getByLabelText('Repeat: off')).toBeInTheDocument();
      fireEvent.click(repeatBtn);
      expect(screen.getByLabelText('Repeat: all')).toBeInTheDocument();
      fireEvent.click(repeatBtn);
      expect(screen.getByLabelText('Repeat: one')).toBeInTheDocument();
      fireEvent.click(repeatBtn);
      expect(screen.getByLabelText('Repeat: off')).toBeInTheDocument();
    });

    test('volume slider changes volume', () => {
      render(<MusicStreamingPlayer />);
      const volumeSlider = screen.getByTestId('volume-slider');
      fireEvent.change(volumeSlider, { target: { value: '50' } });
      expect(volumeSlider.value).toBe('50');
    });

    test('queue count shows in player bar', () => {
      render(<MusicStreamingPlayer />);
      expect(screen.getByTestId('queue-count')).toHaveTextContent('0 in queue');
    });
  });

  describe('Queue Management', () => {
    test('adding a song to queue updates queue count', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('queue-btn-s1'));
      expect(screen.getByTestId('queue-count')).toHaveTextContent('1 in queue');
    });

    test('queue view shows added songs', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('queue-btn-s1'));
      fireEvent.click(screen.getByTestId('queue-btn-s3'));
      fireEvent.click(screen.getByTestId('nav-queue'));
      expect(screen.getByText('Midnight Glow')).toBeInTheDocument();
      expect(screen.getByText('Broken Strings')).toBeInTheDocument();
    });

    test('removing a song from queue works', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('queue-btn-s1'));
      fireEvent.click(screen.getByTestId('nav-queue'));
      fireEvent.click(screen.getByTestId('queue-remove-0'));
      expect(screen.getByTestId('empty-queue')).toBeInTheDocument();
    });

    test('clear queue removes all songs', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('queue-btn-s1'));
      fireEvent.click(screen.getByTestId('queue-btn-s2'));
      fireEvent.click(screen.getByTestId('nav-queue'));
      fireEvent.click(screen.getByTestId('clear-queue-btn'));
      expect(screen.getByTestId('empty-queue')).toBeInTheDocument();
    });

    test('reorder queue move up works', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('queue-btn-s1'));
      fireEvent.click(screen.getByTestId('queue-btn-s3'));
      fireEvent.click(screen.getByTestId('nav-queue'));
      // Move second item up
      fireEvent.click(screen.getByTestId('queue-move-up-1'));
      // Now s3 should be first in queue
      const firstItem = screen.getByTestId('queue-item-0');
      expect(firstItem).toHaveTextContent('Broken Strings');
    });

    test('shows empty queue message when queue is empty', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-queue'));
      expect(screen.getByTestId('empty-queue')).toBeInTheDocument();
    });
  });

  describe('Playlist CRUD', () => {
    test('create playlist modal opens', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('create-playlist-btn'));
      expect(screen.getByTestId('create-playlist-modal')).toBeInTheDocument();
      expect(screen.getByText('Create Playlist')).toBeInTheDocument();
    });

    test('creating a playlist adds it to sidebar', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('create-playlist-btn'));
      const nameInput = screen.getByTestId('playlist-name-input');
      fireEvent.change(nameInput, { target: { value: 'My New Mix' } });
      fireEvent.click(screen.getByTestId('save-playlist-btn'));
      expect(screen.getByText('My New Mix')).toBeInTheDocument();
    });

    test('creating a playlist with description works', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('create-playlist-btn'));
      const nameInput = screen.getByTestId('playlist-name-input');
      const descInput = screen.getByTestId('playlist-description-input');
      fireEvent.change(nameInput, { target: { value: 'Test Playlist' } });
      fireEvent.change(descInput, { target: { value: 'A test description' } });
      fireEvent.click(screen.getByTestId('save-playlist-btn'));
      expect(screen.queryByTestId('create-playlist-modal')).not.toBeInTheDocument();
    });

    test('cancel closes create playlist modal', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('create-playlist-btn'));
      fireEvent.click(screen.getByTestId('cancel-create-playlist'));
      expect(screen.queryByTestId('create-playlist-modal')).not.toBeInTheDocument();
    });

    test('edit playlist modal opens with current values', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      fireEvent.click(screen.getByTestId('playlist-edit-btn'));
      expect(screen.getByTestId('edit-playlist-modal')).toBeInTheDocument();
      expect(screen.getByTestId('edit-playlist-name-input')).toHaveValue('Chill Vibes');
    });

    test('saving playlist edits updates the playlist', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      fireEvent.click(screen.getByTestId('playlist-edit-btn'));
      const nameInput = screen.getByTestId('edit-playlist-name-input');
      fireEvent.change(nameInput, { target: { value: 'Super Chill' } });
      fireEvent.click(screen.getByTestId('save-edit-playlist-btn'));
      expect(screen.getByTestId('playlist-title')).toHaveTextContent('Super Chill');
    });

    test('deleting a playlist requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      fireEvent.click(screen.getByTestId('playlist-delete-btn'));
      expect(window.confirm).toHaveBeenCalled();
      // Should not be deleted since confirm returned false
      expect(screen.getByTestId('playlist-title')).toHaveTextContent('Chill Vibes');
    });

    test('confirming delete removes the playlist', () => {
      window.confirm.mockReturnValue(true);
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      fireEvent.click(screen.getByTestId('playlist-delete-btn'));
      // Should navigate away and playlist should be gone from sidebar
      expect(screen.queryByTestId('playlist-nav-p1')).not.toBeInTheDocument();
    });
  });

  describe('Playlist Song Management', () => {
    test('playlist view shows songs', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      // Chill Vibes has songs s2, s4, s6, s7, s15
      expect(screen.getByText('Electric Sunrise')).toBeInTheDocument();
      expect(screen.getByText('Blue Note Serenade')).toBeInTheDocument();
    });

    test('playlist shows description', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      expect(screen.getByTestId('playlist-description')).toHaveTextContent('Perfect for relaxing evenings');
    });

    test('removing a song from playlist works', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      fireEvent.click(screen.getByTestId('remove-from-playlist-s2'));
      expect(screen.queryByTestId('playlist-song-s2')).not.toBeInTheDocument();
    });

    test('add to playlist modal shows playlists', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      fireEvent.click(screen.getByTestId('add-to-playlist-btn-s1'));
      expect(screen.getByTestId('add-to-playlist-modal')).toBeInTheDocument();
      expect(screen.getByTestId('add-to-p1')).toBeInTheDocument();
      expect(screen.getByTestId('add-to-p2')).toBeInTheDocument();
    });

    test('adding a song to a playlist from modal works', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      fireEvent.click(screen.getByTestId('add-to-playlist-btn-s1'));
      fireEvent.click(screen.getByTestId('add-to-p1'));
      // Modal should close
      expect(screen.queryByTestId('add-to-playlist-modal')).not.toBeInTheDocument();
      // Verify song is in playlist
      fireEvent.click(screen.getByTestId('nav-home'));
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      expect(screen.getByTestId('playlist-song-s1')).toBeInTheDocument();
    });

    test('play all button plays first song in playlist', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      fireEvent.click(screen.getByTestId('playlist-play-all'));
      // First song in Chill Vibes is s2
      expect(screen.getByTestId('now-playing-title')).toHaveTextContent('Electric Sunrise');
    });
  });

  describe('Recently Played', () => {
    test('recently played view shows songs in order', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-recent'));
      expect(screen.getByText('Electric Sunrise')).toBeInTheDocument();
      expect(screen.getByText('Starlight Anthem')).toBeInTheDocument();
    });

    test('playing a song adds it to recently played', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('play-song-s8'));
      fireEvent.click(screen.getByTestId('nav-recent'));
      // s8 should now be in recently played
      expect(screen.getByText('Symphony No. 9 Redux')).toBeInTheDocument();
    });

    test('recently played persists to localStorage', () => {
      render(<MusicStreamingPlayer />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'soundflowRecent',
        expect.any(String)
      );
    });
  });

  describe('Like Toggling', () => {
    test('liking a song from search view toggles heart icon', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      // s1 starts as not liked
      const likeBtn = screen.getByTestId('like-btn-s1');
      fireEvent.click(likeBtn);
      // Now check it appears in liked songs view
      fireEvent.click(screen.getByTestId('nav-liked'));
      expect(screen.getByTestId('song-row-s1')).toBeInTheDocument();
    });

    test('likes persist to localStorage', () => {
      render(<MusicStreamingPlayer />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'soundflowLikes',
        expect.any(String)
      );
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes create playlist modal', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('create-playlist-btn'));
      expect(screen.getByTestId('create-playlist-modal')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('create-playlist-modal')).not.toBeInTheDocument();
    });

    test('Escape closes edit playlist modal', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('playlist-nav-p1'));
      fireEvent.click(screen.getByTestId('playlist-edit-btn'));
      expect(screen.getByTestId('edit-playlist-modal')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('edit-playlist-modal')).not.toBeInTheDocument();
    });

    test('Escape closes add to playlist modal', () => {
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-search'));
      fireEvent.click(screen.getByTestId('add-to-playlist-btn-s1'));
      expect(screen.getByTestId('add-to-playlist-modal')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('add-to-playlist-modal')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('playlists are saved to localStorage', () => {
      render(<MusicStreamingPlayer />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'soundflowPlaylists',
        expect.any(String)
      );
    });

    test('volume is saved to localStorage', () => {
      render(<MusicStreamingPlayer />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'soundflowVolume',
        expect.any(String)
      );
    });

    test('saved playlists are loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'soundflowPlaylists') {
          return JSON.stringify([{ id: 'px', name: 'Loaded Playlist', description: 'From storage', songs: [], createdAt: Date.now(), cover: '🎵', isPublic: true }]);
        }
        return null;
      });
      render(<MusicStreamingPlayer />);
      expect(screen.getByText('Loaded Playlist')).toBeInTheDocument();
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'soundflowView') return 'search';
        return null;
      });
      render(<MusicStreamingPlayer />);
      expect(screen.getByTestId('search-view')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'soundflowPlaylists') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<MusicStreamingPlayer />)).not.toThrow();
    });

    test('saved likes are loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'soundflowLikes') return JSON.stringify(['s1', 's3', 's5']);
        return null;
      });
      render(<MusicStreamingPlayer />);
      fireEvent.click(screen.getByTestId('nav-liked'));
      expect(screen.getByText('Midnight Glow')).toBeInTheDocument();
      expect(screen.getByText('Broken Strings')).toBeInTheDocument();
      expect(screen.getByText('Neon Dreams')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<MusicStreamingPlayer />)).not.toThrow();
    });
  });
});
