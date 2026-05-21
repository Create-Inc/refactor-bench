import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ── Mock React Native primitives ──
vi.mock('react-native', () => {
  const React = require('react');
  const createComponent = (name) =>
    React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(name.toLowerCase(), { ...props, ref }, children),
    );
  return {
    View: createComponent('div'),
    Text: createComponent('span'),
    ScrollView: createComponent('div'),
    TouchableOpacity: React.forwardRef(({ children, onPress, ...props }, ref) =>
      React.createElement('button', { ...props, onClick: onPress, ref }, children),
    ),
    Animated: {
      Value: class {
        constructor(v) { this._value = v; }
        interpolate() { return this; }
      },
      View: createComponent('div'),
      timing: () => ({ start: vi.fn() }),
      spring: () => ({ start: vi.fn() }),
    },
    StyleSheet: { create: (s) => s },
    Platform: { OS: 'ios' },
    Alert: { alert: vi.fn() },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('expo-image', () => {
  const React = require('react');
  return {
    Image: React.forwardRef(({ source, ...props }, ref) =>
      React.createElement('img', { src: source?.uri || '', ...props, ref }),
    ),
  };
});

vi.mock('expo-glass-effect', () => {
  const React = require('react');
  return {
    GlassView: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement('div', { ...props, ref }, children),
    ),
    isLiquidGlassAvailable: () => false,
  };
});

vi.mock('lucide-react-native', () => ({
  Menu: () => null,
  X: () => null,
  Heart: () => null,
  Users: () => null,
  Eye: () => null,
}));

// ── Mock app-level modules ──
const mockToggleTheme = vi.fn();
vi.mock('@/utils/theme', () => ({
  useTheme: () => ({
    colors: {
      bg: '#fff',
      text: '#000',
      textSecondary: '#666',
      green: '#27c175',
      surface: '#f0f0f0',
      surfaceElevated: '#e0e0e0',
      statusBar: 'dark',
      avatarText: '#fff',
    },
    isDark: false,
    toggleTheme: mockToggleTheme,
  }),
}));

vi.mock('@/utils/callTunesStore', () => ({
  useCallTunes: () => ({
    selectedRingtone: null,
    selectedCallout: null,
  }),
}));

vi.mock('@/utils/callStore', () => ({
  useCallStore: () => ({
    callerId: null,
    callHistory: [],
  }),
}));

const mockSignOut = vi.fn();
vi.mock('@/utils/auth/useAuth', () => ({
  useAuth: () => ({ signOut: mockSignOut }),
}));

vi.mock('@/utils/auth/store', () => ({
  useAuthStore: {
    getState: () => ({
      auth: { jwt: 'test-token' },
    }),
  },
}));

// ── Mock child components ──
// Each child renders a minimal marker so we can verify mount/unmount.
vi.mock('@/components/CallTunesSettings', () => ({
  CallTunesSettings: ({ onClose }) => (
    <div data-testid="call-tunes-settings">
      CallTunesSettings
      <button onClick={onClose}>CloseCallTunes</button>
    </div>
  ),
}));

vi.mock('@/components/CallerIdSettings', () => ({
  CallerIdSettings: ({ onClose }) => (
    <div data-testid="caller-id-settings">
      CallerIdSettings
      <button onClick={onClose}>CloseCallerId</button>
    </div>
  ),
}));

vi.mock('@/components/CallHistoryScreen', () => ({
  CallHistoryScreen: ({ onClose }) => (
    <div data-testid="call-history-screen">
      CallHistoryScreen
      <button onClick={onClose}>CloseCallHistory</button>
    </div>
  ),
}));

vi.mock('@/components/EditProfile', () => ({
  __esModule: true,
  default: ({ onClose, onSaved }) => (
    <div data-testid="edit-profile">
      EditProfile
      <button onClick={onClose}>CloseEditProfile</button>
      <button onClick={() => onSaved({ name: 'Updated Name', username: 'updateduser', bio: 'New bio' })}>
        SaveProfile
      </button>
    </div>
  ),
}));

vi.mock('@/components/VerificationBadge', () => ({
  __esModule: true,
  default: ({ size }) => <span data-testid="verification-badge">Verified</span>,
}));

vi.mock('@/components/VerificationScreen', () => ({
  __esModule: true,
  default: ({ onClose }) => (
    <div data-testid="verification-screen">
      VerificationScreen
      <button onClick={onClose}>CloseVerification</button>
    </div>
  ),
}));

vi.mock('@/components/AdminVerificationPanel', () => ({
  __esModule: true,
  default: ({ onClose }) => (
    <div data-testid="admin-panel">
      AdminVerificationPanel
      <button onClick={onClose}>CloseAdminPanel</button>
    </div>
  ),
}));

vi.mock('@/components/WalletScreen', () => ({
  __esModule: true,
  default: ({ onClose }) => (
    <div data-testid="wallet-screen">
      WalletScreen
      <button onClick={onClose}>CloseWallet</button>
    </div>
  ),
}));

vi.mock('@/components/Profile/ProfilePostGrid', () => ({
  ProfilePostGrid: () => <div data-testid="profile-post-grid">PostGrid</div>,
}));

vi.mock('@/components/Profile/ProfileMenu', () => ({
  __esModule: true,
  default: ({
    onCallTunes,
    onCallerId,
    onCallHistory,
    onEditProfile,
    onVerification,
    onAdminPanel,
    onWallet,
    onSignOut,
    onClose,
  }) => (
    <div data-testid="profile-menu">
      <button onClick={onCallTunes}>MenuCallTunes</button>
      <button onClick={onCallerId}>MenuCallerId</button>
      <button onClick={onCallHistory}>MenuCallHistory</button>
      <button onClick={onEditProfile}>MenuEditProfile</button>
      <button onClick={onVerification}>MenuVerification</button>
      <button onClick={onAdminPanel}>MenuAdminPanel</button>
      <button onClick={onWallet}>MenuWallet</button>
      <button onClick={onSignOut}>MenuSignOut</button>
      <button onClick={onClose}>MenuClose</button>
    </div>
  ),
}));

// ── Fetch mock ──
global.fetch = vi.fn();

// ── Helper ──
function mockProfileFetch(profileData = null, statsData = null) {
  const defaultProfile = {
    user: {
      name: 'Test User',
      username: 'testuser',
      bio: 'Hello world',
      image: null,
      is_verified: false,
      is_admin: false,
      verification_badge_url: null,
    },
  };
  const defaultStats = {
    posts: 42,
    subscribers: 1500,
    following: 230,
    totalViews: 12500,
    totalLikes: 8700,
  };
  global.fetch.mockImplementation((url) => {
    if (url === '/api/profile') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(profileData || defaultProfile),
      });
    }
    if (url === '/api/profile/stats') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(statsData || defaultStats),
      });
    }
    return Promise.resolve({ ok: false });
  });
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileFetch();
  });

  // ── Initial Render ──

  describe('Initial Render', () => {
    test('renders and displays the user name after loading', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeTruthy();
      });
    });

    test('renders the username with @ prefix and creator label', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText(/^@testuser/)).toBeTruthy();
        expect(screen.getByText(/DanceX Creator/)).toBeTruthy();
      });
    });

    test('renders the user bio', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeTruthy();
      });
    });

    test('shows avatar initial when no profile image is set', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('T')).toBeTruthy();
      });
    });

    test('fetches profile and stats on mount', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/profile');
        expect(global.fetch).toHaveBeenCalledWith('/api/profile/stats', expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }));
      });
    });

    test('renders the ProfilePostGrid component', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByTestId('profile-post-grid')).toBeTruthy();
      });
    });
  });

  // ── Stats Display ──

  describe('Stats Display', () => {
    test('displays posts, subscribers, and following counts', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('42')).toBeTruthy();
        expect(screen.getByText('1.5K')).toBeTruthy();
        expect(screen.getByText('230')).toBeTruthy();
      });
    });

    test('displays stat labels', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('Posts')).toBeTruthy();
        expect(screen.getByText('Subscribers')).toBeTruthy();
        expect(screen.getByText('Following')).toBeTruthy();
      });
    });

    test('displays views and likes engagement cards', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('12.5K')).toBeTruthy();
        expect(screen.getByText('Views')).toBeTruthy();
        expect(screen.getByText('8.7K')).toBeTruthy();
        expect(screen.getByText('Likes')).toBeTruthy();
      });
    });

    test('formats large numbers with M suffix', async () => {
      mockProfileFetch(null, {
        posts: 3200000,
        subscribers: 1000000,
        following: 500,
        totalViews: 45600000,
        totalLikes: 12000000,
      });
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('3.2M')).toBeTruthy();
        expect(screen.getByText('1M')).toBeTruthy();
        expect(screen.getByText('45.6M')).toBeTruthy();
        expect(screen.getByText('12M')).toBeTruthy();
      });
    });
  });

  // ── Menu Interactions ──

  describe('Menu Interactions', () => {
    test('menu is not visible by default', () => {
      render(<ProfileScreenWrapper />);
      expect(screen.queryByTestId('profile-menu')).toBeNull();
    });

    test('toggles menu open and closed on header button press', async () => {
      render(<ProfileScreenWrapper />);
      // There is a TouchableOpacity in the header; find the first button (logo side is an image, menu side is the button)
      const buttons = screen.getAllByRole('button');
      const menuToggle = buttons[0]; // first button is the toggle

      fireEvent.click(menuToggle);
      expect(screen.getByTestId('profile-menu')).toBeTruthy();

      fireEvent.click(menuToggle);
      expect(screen.queryByTestId('profile-menu')).toBeNull();
    });

    test('menu close callback hides the menu', async () => {
      render(<ProfileScreenWrapper />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      expect(screen.getByTestId('profile-menu')).toBeTruthy();

      fireEvent.click(screen.getByText('MenuClose'));
      expect(screen.queryByTestId('profile-menu')).toBeNull();
    });

    test('sign out callback is forwarded from menu', async () => {
      render(<ProfileScreenWrapper />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      fireEvent.click(screen.getByText('MenuSignOut'));
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  // ── Overlay Screens ──

  describe('Overlay Screens', () => {
    // Helper: opens menu then clicks the named menu button
    function openOverlay(menuButtonText) {
      render(<ProfileScreenWrapper />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // open menu
      fireEvent.click(screen.getByText(menuButtonText));
    }

    test('opens and closes CallTunes, CallerId, and CallHistory overlays', () => {
      // CallTunes
      const { unmount: u1 } = render(<ProfileScreenWrapper />);
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByText('MenuCallTunes'));
      expect(screen.getByTestId('call-tunes-settings')).toBeTruthy();
      fireEvent.click(screen.getByText('CloseCallTunes'));
      expect(screen.queryByTestId('call-tunes-settings')).toBeNull();
      u1();

      // CallerId
      const { unmount: u2 } = render(<ProfileScreenWrapper />);
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByText('MenuCallerId'));
      expect(screen.getByTestId('caller-id-settings')).toBeTruthy();
      fireEvent.click(screen.getByText('CloseCallerId'));
      expect(screen.queryByTestId('caller-id-settings')).toBeNull();
      u2();

      // CallHistory
      const { unmount: u3 } = render(<ProfileScreenWrapper />);
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByText('MenuCallHistory'));
      expect(screen.getByTestId('call-history-screen')).toBeTruthy();
      fireEvent.click(screen.getByText('CloseCallHistory'));
      expect(screen.queryByTestId('call-history-screen')).toBeNull();
      u3();
    });

    test('opens and closes EditProfile overlay', () => {
      openOverlay('MenuEditProfile');
      expect(screen.getByTestId('edit-profile')).toBeTruthy();

      fireEvent.click(screen.getByText('CloseEditProfile'));
      expect(screen.queryByTestId('edit-profile')).toBeNull();
    });

    test('opens and closes Verification and Wallet overlays', () => {
      // Verification
      const { unmount: u1 } = render(<ProfileScreenWrapper />);
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByText('MenuVerification'));
      expect(screen.getByTestId('verification-screen')).toBeTruthy();
      fireEvent.click(screen.getByText('CloseVerification'));
      expect(screen.queryByTestId('verification-screen')).toBeNull();
      u1();

      // Wallet
      const { unmount: u2 } = render(<ProfileScreenWrapper />);
      fireEvent.click(screen.getAllByRole('button')[0]);
      fireEvent.click(screen.getByText('MenuWallet'));
      expect(screen.getByTestId('wallet-screen')).toBeTruthy();
      fireEvent.click(screen.getByText('CloseWallet'));
      expect(screen.queryByTestId('wallet-screen')).toBeNull();
      u2();
    });
  });

  // ── Profile Data Variations ──

  describe('Profile Data Variations', () => {
    test('shows verification badge when user is verified', async () => {
      mockProfileFetch({
        user: {
          name: 'Verified User',
          username: 'vuser',
          bio: '',
          image: null,
          is_verified: true,
          is_admin: false,
          verification_badge_url: 'https://example.com/badge.png',
        },
      });
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByTestId('verification-badge')).toBeTruthy();
      });
    });

    test('does not show verification badge for unverified user', async () => {
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeTruthy();
      });
      expect(screen.queryByTestId('verification-badge')).toBeNull();
    });

    test('displays profile image when available', async () => {
      mockProfileFetch({
        user: {
          name: 'Photo User',
          username: 'photouser',
          bio: '',
          image: 'https://example.com/avatar.jpg',
          is_verified: false,
          is_admin: false,
        },
      });
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        const img = document.querySelector('img[src="https://example.com/avatar.jpg"]');
        expect(img).toBeTruthy();
      });
    });

    test('falls back to "User" name when profile has no name', async () => {
      mockProfileFetch({
        user: {
          name: '',
          username: '',
          bio: '',
          image: null,
          is_verified: false,
          is_admin: false,
        },
      });
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        expect(screen.getByText('User')).toBeTruthy();
      });
    });

    test('profile saved callback updates displayed name', async () => {
      render(<ProfileScreenWrapper />);
      // Open menu then EditProfile
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      fireEvent.click(screen.getByText('MenuEditProfile'));

      // Trigger the save
      fireEvent.click(screen.getByText('SaveProfile'));

      await waitFor(() => {
        expect(screen.getByText('Updated Name')).toBeTruthy();
      });
    });
  });

  // ── Edge Cases ──

  describe('Edge Cases', () => {
    test('handles profile and stats fetch failures gracefully', async () => {
      global.fetch.mockImplementation((url) => {
        if (url === '/api/profile') return Promise.reject(new Error('Network error'));
        if (url === '/api/profile/stats') return Promise.reject(new Error('Stats error'));
        return Promise.resolve({ ok: false });
      });

      expect(() => render(<ProfileScreenWrapper />)).not.toThrow();
    });

    test('renders zero stats correctly', async () => {
      mockProfileFetch(null, {
        posts: 0,
        subscribers: 0,
        following: 0,
        totalViews: 0,
        totalLikes: 0,
      });
      render(<ProfileScreenWrapper />);
      await waitFor(() => {
        const zeros = screen.getAllByText('0');
        expect(zeros.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('can be rendered multiple times without errors', async () => {
      const { rerender } = render(<ProfileScreenWrapper />);
      expect(() => rerender(<ProfileScreenWrapper />)).not.toThrow();
      expect(() => rerender(<ProfileScreenWrapper />)).not.toThrow();
    });
  });
});

// ── Wrapper to import the component ──
// We use a thin wrapper component to allow async import (dynamic import)
// while still using render() synchronously.
import ProfileScreen from './src/app/profile.jsx';

function ProfileScreenWrapper(props) {
  return <ProfileScreen {...props} />;
}
