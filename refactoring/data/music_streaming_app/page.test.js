import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import MusicStreamingApp from './src/app/page.jsx';

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

describe('MusicStreamingApp', () => {
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
    test('renders sidebar with SonicFlow brand', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByText(/SonicFlow/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByTestId('nav-home')).toBeInTheDocument();
      expect(screen.getByTestId('nav-search')).toBeInTheDocument();
      expect(screen.getByTestId('nav-library')).toBeInTheDocument();
      expect(screen.getByTestId('nav-liked')).toBeInTheDocument();
      expect(screen.getByTestId('nav-artists')).toBeInTheDocument();
      expect(screen.getByTestId('nav-albums')).toBeInTheDocument();
    });

    test('renders home view by default', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByTestId('home-view')).toBeInTheDocument();
    });

    test('renders greeting based on time of day', () => {
      render(<MusicStreamingApp />);
      const hour = new Date().getHours();
      if (hour < 12) expect(screen.getByText('Good Morning')).toBeInTheDocument();
      else if (hour < 18) expect(screen.getByText('Good Afternoon')).toBeInTheDocument();
      else expect(screen.getByText('Good Evening')).toBeInTheDocument();
    });

    test('renders recently played section', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByText('Recently Played')).toBeInTheDocument();
      expect(screen.getByTestId('recently-played')).toBeInTheDocument();
    });

    test('renders top charts section', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByText('Top Charts')).toBeInTheDocument();
      expect(screen.getByTestId('top-charts')).toBeInTheDocument();
    });

    test('renders playlists section on home', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByText('Your Playlists')).toBeInTheDocument();
      expect(screen.getByTestId('home-playlists')).toBeInTheDocument();
    });

    test('renders genre grid', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByText('Browse by Genre')).toBeInTheDocument();
      expect(screen.getByTestId('genre-grid')).toBeInTheDocument();
      expect(screen.getByTestId('genre-Pop')).toBeInTheDocument();
      expect(screen.getByTestId('genre-Rock')).toBeInTheDocument();
      expect(screen.getByTestId('genre-Electronic')).toBeInTheDocument();
    });

    test('renders sidebar playlists', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByTestId('playlist-pl1')).toBeInTheDocument();
      expect(screen.getByTestId('playlist-pl2')).toBeInTheDocument();
      expect(screen.getByTestId('playlist-pl3')).toBeInTheDocument();
    });

    test('renders sidebar stats', () => {
      render(<MusicStreamingApp />);
      const stats = screen.getByTestId('sidebar-stats');
      expect(stats).toHaveTextContent('20 tracks');
      expect(stats).toHaveTextContent('4 playlists');
      expect(stats).toHaveTextContent('0 liked songs');
    });

    test('renders create playlist button', () => {
      render(<MusicStreamingApp />);
      expect(screen.getByTestId('create-playlist-btn')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Search navigates to search view', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      expect(screen.getByTestId('search-view')).toBeInTheDocument();
    });

    test('clicking Library navigates to library view', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-library'));
      expect(screen.getByTestId('library-view')).toBeInTheDocument();
    });

    test('clicking Liked Songs navigates to liked view', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-liked'));
      expect(screen.getByTestId('liked-view')).toBeInTheDocument();
      expect(screen.getByText('Liked Songs')).toBeInTheDocument();
    });

    test('clicking Artists navigates to artists view', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-artists'));
      expect(screen.getByTestId('artists-view')).toBeInTheDocument();
    });

    test('clicking Albums navigates to albums view', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-albums'));
      expect(screen.getByTestId('albums-view')).toBeInTheDocument();
    });

    test('clicking Home navigates back to home view', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      fireEvent.click(screen.getByTestId('nav-home'));
      expect(screen.getByTestId('home-view')).toBeInTheDocument();
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('toggle sidebar collapses it', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText(/SonicFlow/)).not.toBeInTheDocument();
    });

    test('toggle sidebar twice expands it again', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.getByText(/SonicFlow/)).toBeInTheDocument();
    });
  });

  describe('Search View', () => {
    test('renders search input', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    test('renders search category filter', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      expect(screen.getByTestId('search-filter')).toBeInTheDocument();
    });

    test('searching for a track shows results', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Neon' } });
      expect(screen.getByText('Neon Skyline')).toBeInTheDocument();
    });

    test('searching for an artist shows artist results', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Luna' } });
      expect(screen.getByTestId('search-artists')).toBeInTheDocument();
      expect(screen.getByText('Luna Wave')).toBeInTheDocument();
    });

    test('searching for an album shows album results', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Thunderstrike' } });
      expect(screen.getByTestId('search-albums')).toBeInTheDocument();
    });

    test('filtering search by tracks only', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      fireEvent.change(screen.getByTestId('search-filter'), { target: { value: 'tracks' } });
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Luna' } });
      // When searching tracks only, artist results should not appear
      expect(screen.queryByTestId('search-artists')).not.toBeInTheDocument();
    });

    test('empty search shows placeholder', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-search'));
      expect(screen.getByText(/Search for tracks, artists, or albums/)).toBeInTheDocument();
    });
  });

  describe('Library View', () => {
    test('renders library with all tracks', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-library'));
      expect(screen.getByText('Showing 20 of 20 tracks')).toBeInTheDocument();
    });

    test('genre filter filters tracks', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-library'));
      fireEvent.change(screen.getByTestId('genre-filter'), { target: { value: 'Rock' } });
      expect(screen.getByText('Thunder Road')).toBeInTheDocument();
      expect(screen.queryByText('Neon Skyline')).not.toBeInTheDocument();
    });

    test('sort by plays changes order', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-library'));
      fireEvent.change(screen.getByTestId('sort-select'), { target: { value: 'plays' } });
      // Tracks should now be sorted by play count
      const trackElements = screen.getByTestId('library-tracks');
      expect(trackElements).toBeInTheDocument();
    });

    test('sort direction toggle works', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-library'));
      const dirBtn = screen.getByTestId('sort-direction');
      expect(dirBtn).toHaveTextContent('↑');
      fireEvent.click(dirBtn);
      expect(dirBtn).toHaveTextContent('↓');
    });

    test('genre filter shows filter text', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-library'));
      fireEvent.change(screen.getByTestId('genre-filter'), { target: { value: 'Electronic' } });
      expect(screen.getByText(/Filtered by Electronic/)).toBeInTheDocument();
    });
  });

  describe('Artists View', () => {
    test('renders all artist cards', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-artists'));
      expect(screen.getByTestId('artist-card-ar1')).toBeInTheDocument();
      expect(screen.getByTestId('artist-card-ar2')).toBeInTheDocument();
      expect(screen.getByTestId('artist-card-ar3')).toBeInTheDocument();
      expect(screen.getByText('Luna Wave')).toBeInTheDocument();
      expect(screen.getByText('The Midnight Sons')).toBeInTheDocument();
    });

    test('clicking artist card opens artist detail', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-artists'));
      fireEvent.click(screen.getByTestId('artist-card-ar1'));
      expect(screen.getByTestId('artist-detail-view')).toBeInTheDocument();
      expect(screen.getByText('Luna Wave')).toBeInTheDocument();
    });

    test('artist detail shows albums', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-artists'));
      fireEvent.click(screen.getByTestId('artist-card-ar1'));
      expect(screen.getByTestId('artist-albums')).toBeInTheDocument();
      expect(screen.getByText('Neon Dreams')).toBeInTheDocument();
      expect(screen.getByText('Electric Nights')).toBeInTheDocument();
    });

    test('artist detail shows tracks', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-artists'));
      fireEvent.click(screen.getByTestId('artist-card-ar1'));
      expect(screen.getByTestId('artist-tracks')).toBeInTheDocument();
      expect(screen.getByText('Neon Skyline')).toBeInTheDocument();
    });

    test('artist detail has play all button', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-artists'));
      fireEvent.click(screen.getByTestId('artist-card-ar1'));
      expect(screen.getByTestId('play-artist')).toBeInTheDocument();
    });

    test('artist detail back button returns to artists', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-artists'));
      fireEvent.click(screen.getByTestId('artist-card-ar1'));
      fireEvent.click(screen.getByTestId('back-button'));
      expect(screen.getByTestId('artists-view')).toBeInTheDocument();
    });
  });

  describe('Albums View', () => {
    test('renders all album cards', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-albums'));
      expect(screen.getByTestId('album-card-al1')).toBeInTheDocument();
      expect(screen.getByTestId('album-card-al3')).toBeInTheDocument();
      expect(screen.getByText('Neon Dreams')).toBeInTheDocument();
      expect(screen.getByText('Thunderstrike')).toBeInTheDocument();
    });

    test('clicking album card opens album detail', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-albums'));
      fireEvent.click(screen.getByTestId('album-card-al3'));
      expect(screen.getByTestId('album-detail-view')).toBeInTheDocument();
      expect(screen.getByText('Thunderstrike')).toBeInTheDocument();
    });

    test('album detail shows tracks', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-albums'));
      fireEvent.click(screen.getByTestId('album-card-al3'));
      expect(screen.getByTestId('album-tracks')).toBeInTheDocument();
      expect(screen.getByText('Thunder Road')).toBeInTheDocument();
      expect(screen.getByText('Burning Sky')).toBeInTheDocument();
      expect(screen.getByText('Rebel Heart')).toBeInTheDocument();
    });

    test('album detail has play album button', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-albums'));
      fireEvent.click(screen.getByTestId('album-card-al3'));
      expect(screen.getByTestId('play-album')).toBeInTheDocument();
    });

    test('album detail back button returns to albums', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-albums'));
      fireEvent.click(screen.getByTestId('album-card-al3'));
      fireEvent.click(screen.getByTestId('back-button'));
      expect(screen.getByTestId('albums-view')).toBeInTheDocument();
    });
  });

  describe('Playback Controls', () => {
    test('clicking play on a track starts playback', () => {
      render(<MusicStreamingApp />);
      // Play a track from top charts
      const playButton = screen.getByLabelText('Play Shine On Me');
      fireEvent.click(playButton);
      expect(screen.getByTestId('now-playing-bar')).toBeInTheDocument();
      expect(screen.getByTestId('now-playing-title')).toHaveTextContent('Shine On Me');
      expect(screen.getByTestId('now-playing-artist')).toHaveTextContent('Aria Gold');
    });

    test('play/pause button toggles state', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const playPauseBtn = screen.getByTestId('play-pause-btn');
      expect(playPauseBtn).toHaveTextContent('⏸');
      fireEvent.click(playPauseBtn);
      expect(playPauseBtn).toHaveTextContent('▶');
    });

    test('progress display shows current time', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      expect(screen.getByTestId('progress-current')).toHaveTextContent('0:00');
      expect(screen.getByTestId('progress-total')).toHaveTextContent('3:35');
    });

    test('shuffle button toggles shuffle', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const shuffleBtn = screen.getByTestId('shuffle-btn');
      fireEvent.click(shuffleBtn);
      // Shuffle is now enabled — button should have accent color
    });

    test('repeat button cycles through modes', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const repeatBtn = screen.getByTestId('repeat-btn');
      expect(repeatBtn).toHaveTextContent('🔁');
      fireEvent.click(repeatBtn); // off -> all
      fireEvent.click(repeatBtn); // all -> one
      expect(repeatBtn).toHaveTextContent('🔂');
      fireEvent.click(repeatBtn); // one -> off
    });

    test('volume slider changes volume', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const volumeSlider = screen.getByTestId('volume-slider');
      fireEvent.change(volumeSlider, { target: { value: '30' } });
      expect(volumeSlider.value).toBe('30');
    });

    test('mute button mutes audio', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const muteBtn = screen.getByTestId('mute-btn');
      fireEvent.click(muteBtn);
      expect(muteBtn).toHaveTextContent('🔇');
    });

    test('mute button unmutes audio', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const muteBtn = screen.getByTestId('mute-btn');
      fireEvent.click(muteBtn);
      fireEvent.click(muteBtn);
      expect(muteBtn).toHaveTextContent('🔊');
    });

    test('equalizer preset can be changed', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const eqSelect = screen.getByTestId('eq-preset');
      fireEvent.change(eqSelect, { target: { value: 'bass' } });
      expect(eqSelect.value).toBe('bass');
    });

    test('like button on now playing bar works', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const likeBtn = screen.getByLabelText('Like current track');
      fireEvent.click(likeBtn);
      expect(screen.getByLabelText('Unlike current track')).toBeInTheDocument();
    });
  });

  describe('Like/Unlike Tracks', () => {
    test('liking a track adds it to liked songs', () => {
      render(<MusicStreamingApp />);
      const likeBtn = screen.getByLabelText('Like Neon Skyline');
      fireEvent.click(likeBtn);
      fireEvent.click(screen.getByTestId('nav-liked'));
      expect(screen.getByText('Neon Skyline')).toBeInTheDocument();
      expect(screen.getByText('1 songs')).toBeInTheDocument();
    });

    test('unliking a track removes it from liked songs', () => {
      render(<MusicStreamingApp />);
      const likeBtn = screen.getByLabelText('Like Neon Skyline');
      fireEvent.click(likeBtn);
      const unlikeBtn = screen.getByLabelText('Unlike Neon Skyline');
      fireEvent.click(unlikeBtn);
      fireEvent.click(screen.getByTestId('nav-liked'));
      expect(screen.getByText('0 songs')).toBeInTheDocument();
    });

    test('liked songs view has play all button when songs exist', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Like Neon Skyline'));
      fireEvent.click(screen.getByTestId('nav-liked'));
      expect(screen.getByTestId('play-all-liked')).toBeInTheDocument();
    });

    test('liked songs view shows empty state', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('nav-liked'));
      expect(screen.getByText('Songs you like will appear here')).toBeInTheDocument();
    });
  });

  describe('Playlist Management', () => {
    test('creating a new playlist', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('create-playlist-btn'));
      expect(screen.getByTestId('create-playlist-modal')).toBeInTheDocument();
      const form = screen.getByTestId('create-playlist-modal').querySelector('form');
      const nameInput = form.querySelector('input[name="name"]');
      fireEvent.change(nameInput, { target: { value: 'Road Trip' } });
      const descInput = form.querySelector('textarea[name="description"]');
      fireEvent.change(descInput, { target: { value: 'Songs for driving' } });
      fireEvent.click(screen.getByText('Create'));
      expect(screen.queryByTestId('create-playlist-modal')).not.toBeInTheDocument();
      // New playlist should appear in sidebar
      expect(screen.getByText('Road Trip')).toBeInTheDocument();
    });

    test('cancel button closes create playlist modal', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('create-playlist-btn'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('create-playlist-modal')).not.toBeInTheDocument();
    });

    test('clicking a playlist opens playlist view', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('playlist-pl2'));
      expect(screen.getByTestId('playlist-view')).toBeInTheDocument();
      expect(screen.getByText('Workout Mix')).toBeInTheDocument();
    });

    test('playlist view shows track count and duration', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('playlist-pl2'));
      expect(screen.getByText(/6 tracks/)).toBeInTheDocument();
    });

    test('non-system playlist has edit and delete buttons', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('playlist-pl2'));
      expect(screen.getByTestId('edit-playlist-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-playlist-btn')).toBeInTheDocument();
    });

    test('system playlist does not have edit/delete buttons', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('playlist-pl1'));
      expect(screen.queryByTestId('edit-playlist-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-playlist-btn')).not.toBeInTheDocument();
    });

    test('editing a playlist name', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('playlist-pl2'));
      fireEvent.click(screen.getByTestId('edit-playlist-btn'));
      expect(screen.getByTestId('edit-playlist-modal')).toBeInTheDocument();
      const form = screen.getByTestId('edit-playlist-modal').querySelector('form');
      const nameInput = form.querySelector('input[name="name"]');
      fireEvent.change(nameInput, { target: { value: 'Gym Vibes' } });
      fireEvent.click(screen.getByText('Save'));
      expect(screen.queryByTestId('edit-playlist-modal')).not.toBeInTheDocument();
    });

    test('deleting a playlist with confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('playlist-pl2'));
      fireEvent.click(screen.getByTestId('delete-playlist-btn'));
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this playlist?');
      // Playlist should be removed
      expect(screen.queryByTestId('playlist-pl2')).not.toBeInTheDocument();
    });

    test('canceling delete keeps playlist', () => {
      window.confirm.mockReturnValue(false);
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('playlist-pl2'));
      fireEvent.click(screen.getByTestId('delete-playlist-btn'));
      fireEvent.click(screen.getByTestId('nav-home'));
      expect(screen.getByTestId('playlist-pl2')).toBeInTheDocument();
    });

    test('play all button on playlist works', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('playlist-pl1'));
      fireEvent.click(screen.getByTestId('play-playlist'));
      expect(screen.getByTestId('now-playing-bar')).toBeInTheDocument();
    });
  });

  describe('Track Context Menu', () => {
    test('clicking more options shows track menu', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('More options for Shine On Me'));
      expect(screen.getByTestId('track-menu-t7')).toBeInTheDocument();
    });

    test('add to queue option works', () => {
      render(<MusicStreamingApp />);
      // First start playing something to have a queue
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      // Then add another track to queue
      fireEvent.click(screen.getByLabelText('More options for Starlight'));
      fireEvent.click(screen.getByText('Add to Queue'));
      // Open queue panel to verify
      fireEvent.click(screen.getByTestId('queue-btn'));
      expect(screen.getByText('Starlight')).toBeInTheDocument();
    });

    test('add to playlist option shows playlist selection', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('More options for Shine On Me'));
      fireEvent.click(screen.getByText('Add to Playlist'));
      expect(screen.getByTestId('add-to-playlist-modal')).toBeInTheDocument();
      expect(screen.getByTestId('playlist-options')).toBeInTheDocument();
    });

    test('adding track to playlist', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('More options for Neon Skyline'));
      fireEvent.click(screen.getByText('Add to Playlist'));
      // Click on Workout Mix playlist (pl2) - Neon Skyline is not in it
      fireEvent.click(screen.getByTestId('add-to-pl2'));
      expect(screen.queryByTestId('add-to-playlist-modal')).not.toBeInTheDocument();
    });

    test('go to artist navigates to artist detail', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('More options for Shine On Me'));
      fireEvent.click(screen.getByText('Go to Artist'));
      expect(screen.getByTestId('artist-detail-view')).toBeInTheDocument();
    });

    test('go to album navigates to album detail', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('More options for Shine On Me'));
      fireEvent.click(screen.getByText('Go to Album'));
      expect(screen.getByTestId('album-detail-view')).toBeInTheDocument();
    });
  });

  describe('Queue Management', () => {
    test('queue panel opens and closes', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      fireEvent.click(screen.getByTestId('queue-btn'));
      expect(screen.getByTestId('queue-panel')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('queue-btn'));
      expect(screen.queryByTestId('queue-panel')).not.toBeInTheDocument();
    });

    test('queue shows current track', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      fireEvent.click(screen.getByTestId('queue-btn'));
      expect(screen.getByTestId('queue-item-0')).toBeInTheDocument();
    });

    test('clear queue keeps only current track', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      // Add another track
      fireEvent.click(screen.getByLabelText('More options for Starlight'));
      fireEvent.click(screen.getByText('Add to Queue'));
      fireEvent.click(screen.getByTestId('queue-btn'));
      fireEvent.click(screen.getByTestId('clear-queue'));
      // Should only have one item (current track)
      expect(screen.getByTestId('queue-item-0')).toBeInTheDocument();
      expect(screen.queryByTestId('queue-item-1')).not.toBeInTheDocument();
    });

    test('remove track from queue', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      fireEvent.click(screen.getByLabelText('More options for Starlight'));
      fireEvent.click(screen.getByText('Add to Queue'));
      fireEvent.click(screen.getByTestId('queue-btn'));
      // Remove the second item
      fireEvent.click(screen.getByLabelText('Remove Starlight from queue'));
      expect(screen.queryByTestId('queue-item-1')).not.toBeInTheDocument();
    });
  });

  describe('Lyrics Panel', () => {
    test('lyrics button opens lyrics panel', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      fireEvent.click(screen.getByTestId('lyrics-btn'));
      expect(screen.getByTestId('lyrics-panel')).toBeInTheDocument();
      expect(screen.getByText('Lyrics')).toBeInTheDocument();
    });

    test('lyrics panel shows track name', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      fireEvent.click(screen.getByTestId('lyrics-btn'));
      expect(screen.getByText(/Shine On Me/)).toBeInTheDocument();
    });

    test('lyrics panel close button works', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      fireEvent.click(screen.getByTestId('lyrics-btn'));
      const closeButtons = within(screen.getByTestId('lyrics-panel')).getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByTestId('lyrics-panel')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes queue panel', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      fireEvent.click(screen.getByTestId('queue-btn'));
      expect(screen.getByTestId('queue-panel')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('queue-panel')).not.toBeInTheDocument();
    });

    test('Escape closes create playlist modal', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('create-playlist-btn'));
      expect(screen.getByTestId('create-playlist-modal')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('create-playlist-modal')).not.toBeInTheDocument();
    });

    test('Escape closes lyrics panel', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      fireEvent.click(screen.getByTestId('lyrics-btn'));
      expect(screen.getByTestId('lyrics-panel')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('lyrics-panel')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('playlists are saved to localStorage', () => {
      render(<MusicStreamingApp />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('musicPlaylists', expect.any(String));
    });

    test('volume is saved to localStorage', () => {
      render(<MusicStreamingApp />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('musicVolume', expect.any(String));
    });

    test('shuffle state is saved to localStorage', () => {
      render(<MusicStreamingApp />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('musicShuffle', expect.any(String));
    });

    test('repeat mode is saved to localStorage', () => {
      render(<MusicStreamingApp />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('musicRepeat', expect.any(String));
    });

    test('liked tracks are saved to localStorage', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByLabelText('Like Shine On Me'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'musicLikedTracks',
        expect.stringContaining('t7')
      );
    });

    test('equalizer preset is saved to localStorage', () => {
      render(<MusicStreamingApp />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('musicEqualizer', expect.any(String));
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicPlaylists') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<MusicStreamingApp />)).not.toThrow();
    });

    test('loads saved playlists from localStorage', () => {
      const savedPlaylists = JSON.stringify([
        { id: 'pl_saved', name: 'Saved Playlist', description: 'From storage', trackIds: [], createdAt: Date.now(), isSystem: false },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicPlaylists') return savedPlaylists;
        return null;
      });
      render(<MusicStreamingApp />);
      expect(screen.getByText('Saved Playlist')).toBeInTheDocument();
    });

    test('loads saved volume from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'musicVolume') return '42';
        return null;
      });
      render(<MusicStreamingApp />);
      // Start playback to see volume slider
      fireEvent.click(screen.getByLabelText('Play Shine On Me'));
      const volumeSlider = screen.getByTestId('volume-slider');
      expect(volumeSlider.value).toBe('42');
    });
  });

  describe('Browse by Genre', () => {
    test('clicking a genre navigates to library with that genre selected', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('genre-Rock'));
      expect(screen.getByTestId('library-view')).toBeInTheDocument();
      const genreSelect = screen.getByTestId('genre-filter');
      expect(genreSelect.value).toBe('Rock');
    });
  });

  describe('Home View Interactions', () => {
    test('clicking recently played track starts playback', () => {
      render(<MusicStreamingApp />);
      const recentCard = screen.getByTestId('recent-t7');
      fireEvent.click(recentCard);
      expect(screen.getByTestId('now-playing-bar')).toBeInTheDocument();
      expect(screen.getByTestId('now-playing-title')).toHaveTextContent('Shine On Me');
    });

    test('clicking playlist card on home opens playlist view', () => {
      render(<MusicStreamingApp />);
      fireEvent.click(screen.getByTestId('home-playlist-pl1'));
      expect(screen.getByTestId('playlist-view')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<MusicStreamingApp />)).not.toThrow();
    });
  });
});
