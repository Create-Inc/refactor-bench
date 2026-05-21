import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

// ── Mock React Native primitives ──
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children, ...props }) => <div {...props}>{children}</div>,
    Text: ({ children, ...props }) => <span {...props}>{children}</span>,
    ScrollView: ({ children, ...props }) => <div {...props}>{children}</div>,
    TouchableOpacity: ({ children, onPress, disabled, ...props }) => (
      <button onClick={disabled ? undefined : onPress} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Alert: { alert: vi.fn() },
    ActivityIndicator: () => <span data-testid="activity-indicator">Loading...</span>,
    Modal: ({ visible, children }) =>
      visible ? <div data-testid="modal">{children}</div> : null,
    TextInput: ({ value, onChangeText, placeholder, placeholderTextColor, ...props }) => (
      <input
        value={value}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
    ),
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('lucide-react-native', () => ({
  Calendar: () => null,
  Send: () => null,
  CheckCircle: () => null,
  ChevronDown: () => null,
  AlertCircle: () => null,
  XCircle: () => null,
}));

// ── Auth / data mocks ──
const mockGroupCode = { groupCode: 'test-group' };
vi.mock('../../utils/useGroupCode', () => ({
  useGroupCode: () => mockGroupCode,
}));

const mockAuth = {
  isReady: true,
  isAuthenticated: true,
  signIn: vi.fn(),
};
vi.mock('../../utils/auth/useAuth', () => ({
  useAuth: () => mockAuth,
}));

const mockUser = { data: { id: 'user-1' }, loading: false };
vi.mock('../../utils/auth/useUser', () => ({
  default: () => mockUser,
}));

vi.mock('../../utils/useNotifications', () => ({
  useNotifications: () => ({
    scheduleGameRequestNotification: vi.fn(),
  }),
}));

// ── React Query mock ──
let queryResults = {};
const mockInvalidateQueries = vi.fn();
const mockMutate = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }) => {
    const key = queryKey[0];
    return queryResults[key] || { data: undefined, isLoading: false, refetch: vi.fn() };
  },
  useMutation: ({ onSuccess, onError }) => ({
    mutate: (vars) => {
      mockMutate(vars);
      if (onSuccess) onSuccess({}, vars);
    },
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

const mockRouterPush = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, back: vi.fn() }),
}));

// ── Helper ──
async function renderSchedule() {
  const mod = await import('./src/app/schedule.jsx');
  const ScheduleScreen = mod.default;
  return render(<ScheduleScreen />);
}

describe('ScheduleScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.isReady = true;
    mockAuth.isAuthenticated = true;
    mockUser.loading = false;
    queryResults = {};
  });

  // ── Loading state ──
  test('shows loading indicator when auth is not ready', async () => {
    mockAuth.isReady = false;
    await renderSchedule();
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  test('shows loading indicator when user is loading', async () => {
    mockUser.loading = true;
    await renderSchedule();
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  // ── Sign-in state ──
  test('shows sign-in prompt when not authenticated', async () => {
    mockAuth.isAuthenticated = false;
    await renderSchedule();
    expect(screen.getByText('Sign in to manage your schedule')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  test('calls signIn when sign-in button is pressed', async () => {
    mockAuth.isAuthenticated = false;
    await renderSchedule();
    fireEvent.click(screen.getByText('Sign In'));
    expect(mockAuth.signIn).toHaveBeenCalled();
  });

  // ── Main schedule header ──
  test('renders schedule header and subtitle when authenticated', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1', name: 'Me' } } };
    await renderSchedule();
    expect(screen.getByText('Upcoming games & challenges')).toBeTruthy();
  });

  // ── No player profile ──
  test('shows no-player message when profile has no player', async () => {
    queryResults['my-profile'] = { data: { player: null } };
    await renderSchedule();
    expect(screen.getByText('No player profile in this league yet')).toBeTruthy();
  });

  // ── Empty schedule ──
  test('shows empty state when no games or requests exist', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    expect(screen.getByText('No scheduled games')).toBeTruthy();
    expect(
      screen.getByText('Challenge a player to schedule your next match!')
    ).toBeTruthy();
  });

  // ── Challenge a Player button ──
  test('renders "Challenge a Player" button when player profile exists', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    expect(screen.getByText('Challenge a Player')).toBeTruthy();
  });

  // ── Upcoming Games section ──
  test('renders upcoming games section when accepted requests exist', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: {
        received: [
          {
            id: 'r1',
            status: 'accepted',
            sender_id: 'p2',
            sender_name: 'Alice',
            sender_emoji: '🏓',
            receiver_name: 'Me',
            proposed_date: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
        sent: [],
      },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    expect(screen.getByText('Upcoming Games')).toBeTruthy();
    expect(screen.getByText('Confirmed')).toBeTruthy();
  });

  // ── Incoming Requests section ──
  test('renders incoming requests with Accept and Decline buttons', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: {
        received: [
          {
            id: 'r2',
            status: 'pending',
            sender_name: 'Bob',
            sender_emoji: '🎯',
            proposed_date: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
        sent: [],
      },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    expect(screen.getByText('Incoming Requests')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('Accept')).toBeTruthy();
    expect(screen.getByText('Decline')).toBeTruthy();
  });

  // ── Sent Requests section ──
  test('renders sent requests with Cancel option', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: {
        received: [],
        sent: [
          {
            id: 's1',
            status: 'pending',
            receiver_name: 'Charlie',
            receiver_emoji: '🎾',
            proposed_date: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
      },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    expect(screen.getByText('Sent Requests')).toBeTruthy();
    expect(screen.getByText('Charlie')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  // ── Pending Games Confirmation section ──
  test('renders pending confirmation games with Confirm and Dispute buttons', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = {
      data: [
        {
          id: 'g1',
          winner_name: 'Alice',
          winner_emoji: '🏓',
          winner_score: 11,
          loser_name: 'Me',
          loser_emoji: '🎯',
          loser_score: 5,
          played_at: new Date().toISOString(),
          elo_change_loser: -15,
        },
      ],
      refetch: vi.fn(),
    };
    await renderSchedule();
    expect(screen.getByText('Pending Confirmation')).toBeTruthy();
    expect(screen.getByText('These games need your confirmation')).toBeTruthy();
    expect(screen.getByText('Confirm')).toBeTruthy();
    expect(screen.getByText('Dispute')).toBeTruthy();
  });

  // ── Challenge Modal ──
  test('opens challenge modal when Challenge a Player is pressed', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    queryResults['players'] = {
      data: [
        { id: 'p2', name: 'Alice', emoji: '🏓' },
        { id: 'p1', name: 'Me', emoji: '🎯' },
      ],
    };
    await renderSchedule();
    fireEvent.click(screen.getByText('Challenge a Player'));
    // Modal opens - should show modal content
    expect(screen.getByText('Choose a player...')).toBeTruthy();
  });

  // ── Modal shows location/note input ──
  test('challenge modal shows location input field', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    fireEvent.click(screen.getByText('Challenge a Player'));
    expect(screen.getByText('Location / Note (Optional)')).toBeTruthy();
    expect(
      screen.getByPlaceholderText('e.g., Table 2, gym basement')
    ).toBeTruthy();
  });

  // ── Default time shown in modal ──
  test('challenge modal shows default time of 6:00 PM', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    fireEvent.click(screen.getByText('Challenge a Player'));
    expect(screen.getByText('6:00 PM')).toBeTruthy();
  });

  // ── Default day shown ──
  test('challenge modal shows Today as default day', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    fireEvent.click(screen.getByText('Challenge a Player'));
    expect(screen.getByText('Today')).toBeTruthy();
  });

  // ── Modal Cancel ──
  test('challenge modal has cancel button', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    fireEvent.click(screen.getByText('Challenge a Player'));
    // The modal has a Cancel button
    const cancelButtons = screen.getAllByText('Cancel');
    expect(cancelButtons.length).toBeGreaterThan(0);
  });

  // ── Send button in modal ──
  test('challenge modal has Send button', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    await renderSchedule();
    fireEvent.click(screen.getByText('Challenge a Player'));
    expect(screen.getByText('Send')).toBeTruthy();
  });

  // ── Player picker modal ──
  test('opens player picker when player field is tapped', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = { data: [], refetch: vi.fn() };
    queryResults['players'] = {
      data: [
        { id: 'p2', name: 'Alice', emoji: '🏓' },
      ],
    };
    await renderSchedule();
    fireEvent.click(screen.getByText('Challenge a Player'));
    fireEvent.click(screen.getByText('Choose a player...'));
    expect(screen.getByText('Select Player')).toBeTruthy();
  });

  // ── Component is a valid function ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/schedule.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Pending game shows score info ──
  test('pending game shows winner and loser details', async () => {
    queryResults['my-profile'] = { data: { player: { id: 'p1' } } };
    queryResults['game-requests'] = {
      data: { received: [], sent: [] },
      refetch: vi.fn(),
    };
    queryResults['pending-games'] = {
      data: [
        {
          id: 'g1',
          winner_name: 'Alice',
          winner_emoji: '🏓',
          winner_score: 11,
          loser_name: 'Bob',
          loser_emoji: '🎯',
          loser_score: 7,
          played_at: new Date().toISOString(),
          elo_change_loser: -12,
        },
      ],
      refetch: vi.fn(),
    };
    await renderSchedule();
    expect(screen.getByText(/-12 Elo/)).toBeTruthy();
  });
});
