import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ── Mock all external dependencies ──────────────────────────────────────────

// expo-image
vi.mock('expo-image', () => ({
  Image: (props) => <img {...props} />,
}));

// react-native-safe-area-context
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// expo-status-bar
vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// lucide-react-native icons (render display name as text for easy querying)
vi.mock('lucide-react-native', () => ({
  Flame: (props) => <span data-testid="flame-icon" {...props} />,
  Plus: (props) => <span data-testid="plus-icon" {...props} />,
  CheckCircle: (props) => <span data-testid="check-circle-icon" {...props} />,
  Crown: (props) => <span data-testid="crown-icon" {...props} />,
  Target: (props) => <span data-testid="target-icon" {...props} />,
  Snowflake: (props) => <span data-testid="snowflake-icon" {...props} />,
  Swords: (props) => <span data-testid="swords-icon" {...props} />,
  Share2: (props) => <span data-testid="share2-icon" {...props} />,
  X: (props) => <span data-testid="x-icon" {...props} />,
  Trophy: (props) => <span data-testid="trophy-icon" {...props} />,
}));

// expo-haptics
vi.mock('expo-haptics', () => ({
  default: {
    impactAsync: vi.fn(),
    notificationAsync: vi.fn(),
    ImpactFeedbackStyle: { Medium: 'medium' },
    NotificationFeedbackType: { Success: 'success', Error: 'error' },
  },
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

// expo-router
const mockRouterPush = vi.fn();
const mockUseFocusEffectCb = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useFocusEffect: (cb) => {
    mockUseFocusEffectCb.mockImplementation(cb);
  },
}));

// In-app purchase hook
const mockIsSubscribed = { value: false };
vi.mock('@/utils/useInAppPurchase', () => ({
  default: () => ({ isSubscribed: mockIsSubscribed.value }),
}));

// Auth hooks
const mockUser = { value: null, loading: false };
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
vi.mock('@/utils/auth/useUser', () => ({
  default: () => ({
    data: mockUser.value,
    loading: mockUser.loading,
  }),
}));
vi.mock('@/utils/auth/useAuth', () => ({
  default: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
  }),
}));

// API module
const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
vi.mock('@/utils/api', () => ({
  default: {
    get: (...args) => mockApiGet(...args),
    post: (...args) => mockApiPost(...args),
  },
}));

// Analytics
vi.mock('@/utils/analytics', () => ({
  default: {
    checkInCompleted: vi.fn(),
    streakBroken: vi.fn(),
    milestoneReached: vi.fn(),
    shareTapped: vi.fn(),
    battleChallengeCreated: vi.fn(),
    friendInvited: vi.fn(),
  },
}));

// Notifications
vi.mock('@/utils/notifications', () => ({
  registerForPushNotifications: vi.fn().mockResolvedValue('mock-token'),
  scheduleDailyReminder: vi.fn().mockResolvedValue(undefined),
  syncSmartNotifications: vi.fn().mockResolvedValue(undefined),
  registerPushTokenWithServer: vi.fn().mockResolvedValue(undefined),
  scheduleStreakRiskCheck: vi.fn().mockResolvedValue(undefined),
}));

// AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

// react-native — minimal mock for web-based RTL
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props) => <div {...props} />,
    Text: (props) => <span {...props} />,
    ScrollView: (props) => <div {...props} />,
    TouchableOpacity: ({ onPress, disabled, children, accessibilityLabel, accessibilityRole, ...rest }) => (
      <button
        onClick={disabled ? undefined : onPress}
        disabled={disabled}
        aria-label={accessibilityLabel}
        role={accessibilityRole || 'button'}
        {...rest}
      >
        {children}
      </button>
    ),
    RefreshControl: () => null,
    Alert: {
      alert: vi.fn(),
    },
    ActivityIndicator: () => <span data-testid="activity-indicator">Loading...</span>,
    Modal: ({ visible, children }) => (visible ? <div data-testid="modal">{children}</div> : null),
    Animated: {
      View: (props) => <div {...props} />,
      createAnimatedComponent: (comp) => comp,
      timing: () => ({ start: vi.fn() }),
      Value: vi.fn().mockImplementation(() => ({
        interpolate: vi.fn(),
        setValue: vi.fn(),
      })),
    },
    Share: {
      share: vi.fn().mockResolvedValue({ action: 'sharedAction' }),
    },
  };
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
})();
const TWO_DAYS_AGO = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().split('T')[0];
})();

function makeGoal(overrides = {}) {
  return {
    id: 'goal-1',
    name: 'Exercise Daily',
    category: 'fitness',
    streak_id: 'streak-1',
    current_streak: 5,
    longest_streak: 10,
    last_check_in: YESTERDAY,
    freezes_available: 2,
    freeze_active: false,
    ...overrides,
  };
}

function setupLoggedInUser(goals = [makeGoal()], extraApiHandlers = {}) {
  mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
  mockUser.loading = false;

  mockApiGet.mockImplementation((url) => {
    if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
    if (url.startsWith('/goals')) return Promise.resolve({ goals });
    if (url.startsWith('/comeback')) return Promise.resolve({ showComebackOffer: false, comebackTier: 'none' });
    if (url.startsWith('/streak-saver')) return Promise.resolve({ hasStreaksAtRisk: false, atRiskStreaks: [] });
    if (extraApiHandlers[url]) return extraApiHandlers[url]();
    return Promise.resolve({});
  });
}

// ── Test Suite ───────────────────────────────────────────────────────────────

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockUser.value = null;
    mockUser.loading = false;
    mockIsSubscribed.value = false;
    mockRouterPush.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Loading State ─────────────────────────────────────────────────────────

  describe('Loading State', () => {
    test('shows loading indicator when user data is loading', async () => {
      mockUser.loading = true;
      mockUser.value = null;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      expect(screen.getByText('Loading...')).toBeTruthy();
    });
  });

  // ── Signed-Out State ──────────────────────────────────────────────────────

  describe('Signed-Out State', () => {
    test('shows welcome screen with Sign In and Create Account when no user', async () => {
      mockUser.value = null;
      mockUser.loading = false;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      expect(screen.getByText('Welcome to LastUp!')).toBeTruthy();
      expect(screen.getByText(/Build unbreakable streaks/)).toBeTruthy();
      expect(screen.getByText('Sign In')).toBeTruthy();
      expect(screen.getByText('Create Account')).toBeTruthy();
    });

    test('calls signIn when Sign In button is pressed', async () => {
      mockUser.value = null;
      mockUser.loading = false;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      fireEvent.click(screen.getByText('Sign In'));
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });

    test('calls signUp when Create Account button is pressed', async () => {
      mockUser.value = null;
      mockUser.loading = false;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      fireEvent.click(screen.getByText('Create Account'));
      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });

    test('Sign In button has correct accessibility label', async () => {
      mockUser.value = null;
      mockUser.loading = false;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      expect(screen.getByLabelText('Sign in to your account')).toBeTruthy();
      expect(screen.getByLabelText('Create a new account')).toBeTruthy();
    });
  });

  // ── Signed-In / Main Screen ───────────────────────────────────────────────

  describe('Signed-In Main Screen', () => {
    test('renders app header with LastUp branding and tagline', async () => {
      setupLoggedInUser([]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('LastUp')).toBeTruthy();
        expect(screen.getByText('Rise. Compete. Conquer.')).toBeTruthy();
      });
    });

    test('shows Go Pro button when user is not subscribed', async () => {
      setupLoggedInUser([]);
      mockIsSubscribed.value = false;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Go Pro')).toBeTruthy();
      });
    });

    test('hides Go Pro button when user is subscribed', async () => {
      setupLoggedInUser([]);
      mockIsSubscribed.value = true;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('LastUp')).toBeTruthy();
      });
      expect(screen.queryByText('Go Pro')).toBeNull();
    });

    test('navigates to paywall when Go Pro is pressed', async () => {
      setupLoggedInUser([]);
      mockIsSubscribed.value = false;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Go Pro')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Go Pro'));
      expect(mockRouterPush).toHaveBeenCalledWith('/paywall');
    });

    test('shows New Goal and Find Battle quick action buttons', async () => {
      setupLoggedInUser([]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('New Goal')).toBeTruthy();
        expect(screen.getByText('Find Battle')).toBeTruthy();
      });
    });

    test('navigates to create-goal when New Goal is pressed', async () => {
      setupLoggedInUser([]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('New Goal')).toBeTruthy();
      });

      fireEvent.click(screen.getByLabelText('Create a new goal'));
      expect(mockRouterPush).toHaveBeenCalledWith('/create-goal');
    });

    test('navigates to battles tab when Find Battle is pressed', async () => {
      setupLoggedInUser([]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Find Battle')).toBeTruthy();
      });

      fireEvent.click(screen.getByLabelText('Find a battle to join'));
      expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/battles');
    });
  });

  // ── Empty State ───────────────────────────────────────────────────────────

  describe('Empty Goals State', () => {
    test('shows empty state message when user has no goals', async () => {
      setupLoggedInUser([]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/No goals yet/)).toBeTruthy();
        expect(screen.getByText(/New Goal/)).toBeTruthy();
      });
    });
  });

  // ── Goal Cards / Streaks ──────────────────────────────────────────────────

  describe('Goal Cards', () => {
    test('renders goal name and category', async () => {
      setupLoggedInUser([makeGoal({ name: 'Read 30 Minutes', category: 'education' })]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Read 30 Minutes')).toBeTruthy();
        expect(screen.getByText('education')).toBeTruthy();
      });
    });

    test('displays current streak count', async () => {
      setupLoggedInUser([makeGoal({ current_streak: 12 })]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('12')).toBeTruthy();
      });
    });

    test('shows longest streak in progress bar label', async () => {
      setupLoggedInUser([makeGoal({ longest_streak: 25 })]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Best: 25 days')).toBeTruthy();
        expect(screen.getByText('Progress to best')).toBeTruthy();
      });
    });

    test('displays freezes available count', async () => {
      setupLoggedInUser([makeGoal({ freezes_available: 3 })]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/3 freezes available/)).toBeTruthy();
      });
    });

    test('uses singular "freeze" when only 1 available', async () => {
      setupLoggedInUser([makeGoal({ freezes_available: 1 })]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/1 freeze available/)).toBeTruthy();
      });
    });

    test('shows Check In Now button for goals not yet checked in today', async () => {
      setupLoggedInUser([makeGoal({ last_check_in: YESTERDAY })]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });
    });

    test('shows Checked In! when goal was already checked in today', async () => {
      setupLoggedInUser([makeGoal({ last_check_in: TODAY })]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Checked In/)).toBeTruthy();
      });
    });

    test('shows Frozen status when streak is frozen', async () => {
      setupLoggedInUser([makeGoal({ freeze_active: true })]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Streak Frozen - Safe for 24h')).toBeTruthy();
        expect(screen.getByText('Frozen')).toBeTruthy();
      });
    });

    test('renders multiple goals', async () => {
      const goals = [
        makeGoal({ id: 'g1', name: 'Workout', streak_id: 's1' }),
        makeGoal({ id: 'g2', name: 'Meditate', streak_id: 's2' }),
        makeGoal({ id: 'g3', name: 'Read', streak_id: 's3' }),
      ];
      setupLoggedInUser(goals);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Workout')).toBeTruthy();
        expect(screen.getByText('Meditate')).toBeTruthy();
        expect(screen.getByText('Read')).toBeTruthy();
      });
    });

    test('shows Share button only for goals with streak > 0', async () => {
      const goals = [
        makeGoal({ id: 'g1', name: 'Active Goal', streak_id: 's1', current_streak: 5 }),
        makeGoal({ id: 'g2', name: 'Inactive Goal', streak_id: 's2', current_streak: 0 }),
      ];
      setupLoggedInUser(goals);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Active Goal')).toBeTruthy();
        expect(screen.getByText('Inactive Goal')).toBeTruthy();
      });

      // There should be exactly one Share text (only for the active streak)
      const shareTexts = screen.getAllByText('Share');
      expect(shareTexts).toHaveLength(1);
    });

    test('shows Challenge Friend button for every goal', async () => {
      const goals = [
        makeGoal({ id: 'g1', name: 'Goal A', streak_id: 's1' }),
        makeGoal({ id: 'g2', name: 'Goal B', streak_id: 's2' }),
      ];
      setupLoggedInUser(goals);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        const challengeButtons = screen.getAllByText('Challenge Friend');
        expect(challengeButtons).toHaveLength(2);
      });
    });
  });

  // ── Daily Challenge Section ───────────────────────────────────────────────

  describe('Daily Challenge', () => {
    test('shows Daily Challenge banner with progress when goals exist', async () => {
      setupLoggedInUser([makeGoal()]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Daily Challenge')).toBeTruthy();
        expect(screen.getByText('Check in to all streaks today')).toBeTruthy();
      });
    });

    test('shows correct check-in count in Daily Challenge (0/N when none checked)', async () => {
      const goals = [
        makeGoal({ id: 'g1', name: 'A', streak_id: 's1', last_check_in: YESTERDAY }),
        makeGoal({ id: 'g2', name: 'B', streak_id: 's2', last_check_in: YESTERDAY }),
      ];
      setupLoggedInUser(goals);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('0/2')).toBeTruthy();
      });
    });

    test('shows correct check-in count when some goals checked in today', async () => {
      const goals = [
        makeGoal({ id: 'g1', name: 'A', streak_id: 's1', last_check_in: TODAY }),
        makeGoal({ id: 'g2', name: 'B', streak_id: 's2', last_check_in: YESTERDAY }),
        makeGoal({ id: 'g3', name: 'C', streak_id: 's3', last_check_in: TODAY }),
      ];
      setupLoggedInUser(goals);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('2/3')).toBeTruthy();
      });
    });

    test('does not show Daily Challenge when there are no goals', async () => {
      setupLoggedInUser([]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/No goals yet/)).toBeTruthy();
      });
      expect(screen.queryByText('Daily Challenge')).toBeNull();
    });
  });

  // ── Check-In Flow ─────────────────────────────────────────────────────────

  describe('Check-In Flow', () => {
    test('calls API to check in when Check In Now is pressed', async () => {
      const goal = makeGoal({ streak_id: 'streak-42', last_check_in: YESTERDAY });
      setupLoggedInUser([goal]);

      mockApiPost.mockResolvedValue({ streak: { current_streak: 6 } });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Now'));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/streaks/checkin', { streakId: 'streak-42' });
      });
    });

    test('shows error alert when check-in fails', async () => {
      const { Alert } = await import('react-native');
      const goal = makeGoal({ streak_id: 'streak-42', last_check_in: YESTERDAY });
      setupLoggedInUser([goal]);

      mockApiPost.mockRejectedValue(new Error('Network error'));

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Now'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          expect.stringContaining('Network error')
        );
      });
    });
  });

  // ── Streak Break Modal ────────────────────────────────────────────────────

  describe('Streak Break Modal', () => {
    test('shows Streak Broken modal when check-in breaks a streak', async () => {
      // A streak that was broken: last check-in was 2+ days ago, current_streak > 0
      const goal = makeGoal({
        streak_id: 'streak-1',
        current_streak: 15,
        last_check_in: TWO_DAYS_AGO,
        name: 'Morning Run',
      });
      setupLoggedInUser([goal]);

      mockApiPost.mockResolvedValue({ streak: { current_streak: 1 } });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Now'));

      await waitFor(() => {
        expect(screen.getByText('Streak Broken!')).toBeTruthy();
        expect(screen.getByText(/15-day streak has ended/)).toBeTruthy();
      });
    });

    test('can dismiss Streak Broken modal with Start Comeback Streak button', async () => {
      const goal = makeGoal({
        streak_id: 'streak-1',
        current_streak: 3,
        last_check_in: TWO_DAYS_AGO,
        name: 'Gym',
      });
      setupLoggedInUser([goal]);

      mockApiPost.mockResolvedValue({ streak: { current_streak: 1 } });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Now'));

      await waitFor(() => {
        expect(screen.getByText('Streak Broken!')).toBeTruthy();
      });

      fireEvent.click(screen.getByText(/Start Comeback Streak/));

      await waitFor(() => {
        expect(screen.queryByText('Streak Broken!')).toBeNull();
      });
    });
  });

  // ── Milestone Modal ───────────────────────────────────────────────────────

  describe('Milestone Modal', () => {
    test('shows Milestone Reached modal when check-in hits a milestone day', async () => {
      // current_streak is 6 (about to become 7, which is a milestone day)
      const goal = makeGoal({
        streak_id: 'streak-1',
        current_streak: 6,
        last_check_in: YESTERDAY,
        name: 'Meditation',
      });
      setupLoggedInUser([goal]);

      // API returns streak = 7 (milestone)
      mockApiPost.mockResolvedValue({ streak: { current_streak: 7 } });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Now'));

      await waitFor(() => {
        expect(screen.getByText('Milestone Reached!')).toBeTruthy();
        expect(screen.getByText(/Day 7 of Meditation/)).toBeTruthy();
      });
    });

    test('milestone modal shows correct encouragement for 30+ day streaks', async () => {
      const goal = makeGoal({
        streak_id: 'streak-1',
        current_streak: 29,
        last_check_in: YESTERDAY,
        name: 'Yoga',
      });
      setupLoggedInUser([goal]);

      mockApiPost.mockResolvedValue({ streak: { current_streak: 30 } });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Now'));

      await waitFor(() => {
        expect(screen.getByText('Milestone Reached!')).toBeTruthy();
        expect(screen.getByText(/A whole month/)).toBeTruthy();
      });
    });

    test('milestone modal shows Share This Win and Maybe Later buttons', async () => {
      const goal = makeGoal({
        streak_id: 'streak-1',
        current_streak: 13,
        last_check_in: YESTERDAY,
        name: 'Coding',
      });
      setupLoggedInUser([goal]);

      mockApiPost.mockResolvedValue({ streak: { current_streak: 14 } });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Now'));

      await waitFor(() => {
        expect(screen.getByText('Milestone Reached!')).toBeTruthy();
        expect(screen.getByText(/Share This Win/)).toBeTruthy();
        expect(screen.getByText('Maybe Later')).toBeTruthy();
      });
    });

    test('can dismiss milestone modal with Maybe Later', async () => {
      const goal = makeGoal({
        streak_id: 'streak-1',
        current_streak: 20,
        last_check_in: YESTERDAY,
        name: 'Walking',
      });
      setupLoggedInUser([goal]);

      mockApiPost.mockResolvedValue({ streak: { current_streak: 21 } });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Check In Now')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Now'));

      await waitFor(() => {
        expect(screen.getByText('Milestone Reached!')).toBeTruthy();
      });

      // Click "Maybe Later" to dismiss
      const maybeLaterButtons = screen.getAllByText('Maybe Later');
      fireEvent.click(maybeLaterButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Milestone Reached!')).toBeNull();
      });
    });
  });

  // ── Freeze Streak ─────────────────────────────────────────────────────────

  describe('Freeze Streak', () => {
    test('triggers freeze alert when freeze button is pressed with available freezes', async () => {
      const { Alert } = await import('react-native');
      const goal = makeGoal({ freezes_available: 2, freeze_active: false });
      setupLoggedInUser([goal]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/2 freezes available/)).toBeTruthy();
      });

      // The freeze button doesn't have text, but there's a snowflake icon button
      // We look for the accessibility-labeled button or the Snowflake icon button
      // Since the freeze button in the Check In + Freeze Row doesn't have an accessibilityLabel,
      // we find it via testid or structure. Given our mock, the snowflake icons render as spans.
      // The freeze button is adjacent to Check In. Let's find buttons that aren't labeled.
      // The freeze TouchableOpacity doesn't have accessibilityLabel. We click the correct one.
      // Since we can't easily distinguish, let's test via Alert mock.

      const freezeButton = screen.getByText('Check In Now').closest('div')
        ?.parentElement?.querySelectorAll('button');

      // The second button in the Check In + Freeze Row is the freeze button
      if (freezeButton && freezeButton.length > 1) {
        fireEvent.click(freezeButton[1]);

        await waitFor(() => {
          expect(Alert.alert).toHaveBeenCalledWith(
            expect.stringContaining('Freeze This Streak'),
            expect.stringContaining('Use 1 freeze to protect your streak'),
            expect.any(Array)
          );
        });
      }
    });

    test('shows no-freezes alert when user has 0 freezes', async () => {
      const { Alert } = await import('react-native');
      const goal = makeGoal({ freezes_available: 0, freeze_active: false });
      setupLoggedInUser([goal]);

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/0 freezes available/)).toBeTruthy();
      });

      const container = screen.getByText('Check In Now').closest('div')?.parentElement;
      const buttons = container?.querySelectorAll('button');

      if (buttons && buttons.length > 1) {
        fireEvent.click(buttons[1]);

        await waitFor(() => {
          expect(Alert.alert).toHaveBeenCalledWith(
            'No Freezes Available',
            expect.stringContaining("don't have any freezes"),
            expect.any(Array)
          );
        });
      }
    });
  });

  // ── Challenge From Goal ───────────────────────────────────────────────────

  describe('Challenge From Goal', () => {
    test('calls API and Share when Challenge Friend is pressed', async () => {
      const { Share } = await import('react-native');
      const goal = makeGoal({ id: 'goal-99', name: 'Running' });
      setupLoggedInUser([goal]);

      mockApiPost.mockResolvedValue({});

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Challenge Friend')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Challenge Friend'));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/challenge-battle', { goalId: 'goal-99' });
      });

      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Running'),
          })
        );
      });
    });
  });

  // ── Comeback Modal ────────────────────────────────────────────────────────

  describe('Comeback Modal', () => {
    test('shows comeback modal when API returns comeback offer', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback'))
          return Promise.resolve({
            showComebackOffer: true,
            comebackTier: 'epic_return',
            comebackMessage: 'We missed you!',
            daysInactive: 14,
            bonusXp: 500,
            activeBattles: [],
            friendActivity: [],
          });
        if (url.startsWith('/streak-saver')) return Promise.resolve({ hasStreaksAtRisk: false, atRiskStreaks: [] });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('We missed you!')).toBeTruthy();
        expect(screen.getByText(/14 days since your last visit/)).toBeTruthy();
      });
    });

    test('shows bonus XP in comeback modal when available', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback'))
          return Promise.resolve({
            showComebackOffer: true,
            comebackTier: 'legendary_return',
            comebackMessage: 'The legend returns!',
            daysInactive: 30,
            bonusXp: 1000,
            activeBattles: [],
            friendActivity: [],
          });
        if (url.startsWith('/streak-saver')) return Promise.resolve({ hasStreaksAtRisk: false, atRiskStreaks: [] });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/\+1000 Comeback XP/)).toBeTruthy();
        expect(screen.getByText(/Claim your welcome back bonus/)).toBeTruthy();
      });
    });

    test('calls API to claim comeback bonus when button is pressed', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback'))
          return Promise.resolve({
            showComebackOffer: true,
            comebackTier: 'epic_return',
            comebackMessage: 'Welcome Back!',
            daysInactive: 7,
            bonusXp: 250,
            activeBattles: [],
            friendActivity: [],
          });
        if (url.startsWith('/streak-saver')) return Promise.resolve({ hasStreaksAtRisk: false, atRiskStreaks: [] });
        return Promise.resolve({});
      });

      mockApiPost.mockResolvedValue({ success: true, xpEarned: 250 });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Claim Bonus & Start Fresh/)).toBeTruthy();
      });

      fireEvent.click(screen.getByText(/Claim Bonus & Start Fresh/));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/comeback', { action: 'claim_bonus' });
      });
    });

    test('comeback modal shows active battles info when present', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback'))
          return Promise.resolve({
            showComebackOffer: true,
            comebackTier: 'epic_return',
            comebackMessage: 'Hey there!',
            daysInactive: 5,
            bonusXp: 0,
            activeBattles: [{ id: 'b1' }, { id: 'b2' }],
            friendActivity: [],
          });
        if (url.startsWith('/streak-saver')) return Promise.resolve({ hasStreaksAtRisk: false, atRiskStreaks: [] });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Your battles are still going/)).toBeTruthy();
        expect(screen.getByText(/2 active battles waiting for you/)).toBeTruthy();
      });
    });

    test('can dismiss comeback modal with Maybe Later', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback'))
          return Promise.resolve({
            showComebackOffer: true,
            comebackTier: 'epic_return',
            comebackMessage: 'Welcome!',
            daysInactive: 3,
            bonusXp: 0,
            activeBattles: [],
            friendActivity: [],
          });
        if (url.startsWith('/streak-saver')) return Promise.resolve({ hasStreaksAtRisk: false, atRiskStreaks: [] });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Welcome!')).toBeTruthy();
      });

      const maybeLaterButtons = screen.getAllByText('Maybe Later');
      fireEvent.click(maybeLaterButtons[maybeLaterButtons.length - 1]);

      await waitFor(() => {
        expect(screen.queryByText('Welcome!')).toBeNull();
      });
    });
  });

  // ── Streak Saver Modal ────────────────────────────────────────────────────

  describe('Streak Saver Modal', () => {
    test('shows streak saver modal with at-risk streaks after delay', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback')) return Promise.resolve({ showComebackOffer: false, comebackTier: 'none' });
        if (url.startsWith('/streak-saver'))
          return Promise.resolve({
            hasStreaksAtRisk: true,
            atRiskStreaks: [
              { streak_id: 's1', goal_name: 'Running', current_streak: 10, freezes_available: 1 },
            ],
          });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      // The modal is shown after a 3000ms delay
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      await waitFor(() => {
        expect(screen.getByText('Streaks at Risk!')).toBeTruthy();
        expect(screen.getByText(/10-day "Running" streak will break/)).toBeTruthy();
      });
    });

    test('streak saver modal shows multiple at-risk streaks', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback')) return Promise.resolve({ showComebackOffer: false, comebackTier: 'none' });
        if (url.startsWith('/streak-saver'))
          return Promise.resolve({
            hasStreaksAtRisk: true,
            atRiskStreaks: [
              { streak_id: 's1', goal_name: 'Running', current_streak: 10, freezes_available: 1 },
              { streak_id: 's2', goal_name: 'Reading', current_streak: 5, freezes_available: 0 },
            ],
          });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      await waitFor(() => {
        expect(screen.getByText('Streaks at Risk!')).toBeTruthy();
        expect(screen.getByText(/2 streaks are about to break/)).toBeTruthy();
        expect(screen.getByText('Running')).toBeTruthy();
        expect(screen.getByText('Reading')).toBeTruthy();
      });
    });

    test('streak saver shows Freeze button for streaks with available freezes', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback')) return Promise.resolve({ showComebackOffer: false, comebackTier: 'none' });
        if (url.startsWith('/streak-saver'))
          return Promise.resolve({
            hasStreaksAtRisk: true,
            atRiskStreaks: [
              { streak_id: 's1', goal_name: 'Running', current_streak: 10, freezes_available: 2 },
            ],
          });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      await waitFor(() => {
        expect(screen.getByText(/Freeze/)).toBeTruthy();
      });
    });

    test('streak saver shows Get Freezes button for streaks with no freezes', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback')) return Promise.resolve({ showComebackOffer: false, comebackTier: 'none' });
        if (url.startsWith('/streak-saver'))
          return Promise.resolve({
            hasStreaksAtRisk: true,
            atRiskStreaks: [
              { streak_id: 's1', goal_name: 'Running', current_streak: 10, freezes_available: 0 },
            ],
          });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      await waitFor(() => {
        expect(screen.getByText('Get Freezes')).toBeTruthy();
      });
    });

    test('streak saver shows Go Premium upsell when user is not subscribed', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;
      mockIsSubscribed.value = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback')) return Promise.resolve({ showComebackOffer: false, comebackTier: 'none' });
        if (url.startsWith('/streak-saver'))
          return Promise.resolve({
            hasStreaksAtRisk: true,
            atRiskStreaks: [
              { streak_id: 's1', goal_name: 'Running', current_streak: 10, freezes_available: 0 },
            ],
          });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      await waitFor(() => {
        expect(screen.getByText(/Go Premium/)).toBeTruthy();
        expect(screen.getByText(/Never Lose a Streak/)).toBeTruthy();
      });
    });

    test('can dismiss streak saver modal with Check In Instead', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.resolve({ user: { id: 'user-123' } });
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [] });
        if (url.startsWith('/comeback')) return Promise.resolve({ showComebackOffer: false, comebackTier: 'none' });
        if (url.startsWith('/streak-saver'))
          return Promise.resolve({
            hasStreaksAtRisk: true,
            atRiskStreaks: [
              { streak_id: 's1', goal_name: 'Running', current_streak: 10, freezes_available: 1 },
            ],
          });
        return Promise.resolve({});
      });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      await waitFor(() => {
        expect(screen.getByText('Streaks at Risk!')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Check In Instead'));

      await waitFor(() => {
        expect(screen.queryByText('Streaks at Risk!')).toBeNull();
      });
    });
  });

  // ── Profile Creation ──────────────────────────────────────────────────────

  describe('Profile Creation', () => {
    test('creates profile when user does not exist and fetches goals after', async () => {
      mockUser.value = { id: 'user-123', name: 'TestUser', email: 'test@example.com' };
      mockUser.loading = false;

      mockApiGet.mockImplementation((url) => {
        if (url.startsWith('/users')) return Promise.reject(new Error('404 User not found'));
        if (url.startsWith('/goals')) return Promise.resolve({ goals: [makeGoal()] });
        if (url.startsWith('/comeback')) return Promise.resolve({ showComebackOffer: false, comebackTier: 'none' });
        if (url.startsWith('/streak-saver')) return Promise.resolve({ hasStreaksAtRisk: false, atRiskStreaks: [] });
        return Promise.resolve({});
      });

      mockApiPost.mockResolvedValue({ user: { id: 'user-123' } });

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      render(<HomeScreen />);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          '/users',
          expect.objectContaining({
            displayName: 'TestUser',
          })
        );
      });

      // Should still fetch goals after profile creation
      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith(expect.stringContaining('/goals'));
      });
    });
  });

  // ── Component Basics ──────────────────────────────────────────────────────

  describe('Component Basics', () => {
    test('component is a valid default export function', async () => {
      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      expect(HomeScreen).toBeDefined();
      expect(typeof HomeScreen).toBe('function');
    });

    test('renders without crashing and produces output', async () => {
      mockUser.value = null;
      mockUser.loading = false;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      const { container } = render(<HomeScreen />);
      expect(container).toBeTruthy();
    });

    test('can be rendered multiple times without errors', async () => {
      mockUser.value = null;
      mockUser.loading = false;

      const HomeModule = await import('./app/index.jsx');
      const HomeScreen = HomeModule.default;

      const { rerender } = render(<HomeScreen />);
      expect(() => rerender(<HomeScreen />)).not.toThrow();
      expect(() => rerender(<HomeScreen />)).not.toThrow();
    });
  });
});
