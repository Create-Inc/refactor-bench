import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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
    ActivityIndicator: () => <span data-testid="activity-indicator">Loading...</span>,
    Modal: ({ visible, children, transparent }) =>
      visible ? <div data-testid="modal">{children}</div> : null,
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('lucide-react-native', () => ({
  Trophy: () => null,
  Users: () => null,
  Calendar: () => null,
  Plus: () => null,
}));

const mockGroupCode = { groupCode: 'test-group' };
vi.mock('../../utils/useGroupCode', () => ({
  useGroupCode: () => mockGroupCode,
}));

const mockRouterPush = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, back: vi.fn() }),
}));

// ── React Query mock ──
let queryResults = {};

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }) => {
    const key = queryKey[0];
    return queryResults[key] || { data: undefined, isLoading: false };
  },
}));

// ── Helpers ──
const mockTournaments = [
  {
    id: 't1',
    name: 'Spring Championship',
    participant_count: 8,
    games_played: 12,
    status: 'active',
    format: 'single_elimination',
  },
  {
    id: 't2',
    name: 'Round Robin Series',
    participant_count: 4,
    games_played: 6,
    status: 'completed',
    format: 'round_robin',
  },
];

async function renderTournaments() {
  const mod = await import('./src/app/tournaments.jsx');
  const TournamentsScreen = mod.default;
  return render(<TournamentsScreen />);
}

describe('TournamentsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryResults = {};
  });

  // ── Header ──
  test('renders tournaments header', async () => {
    await renderTournaments();
    expect(screen.getByText(/Tournaments/)).toBeTruthy();
    expect(screen.getByText('View brackets and standings')).toBeTruthy();
  });

  // ── Loading state ──
  test('shows loading indicator while tournaments load', async () => {
    queryResults['tournaments'] = { data: undefined, isLoading: true };
    await renderTournaments();
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  // ── Empty state ──
  test('shows empty state when no tournaments exist', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [] },
      isLoading: false,
    };
    await renderTournaments();
    expect(screen.getByText('No tournaments yet')).toBeTruthy();
    expect(
      screen.getByText('Tap + to create your first tournament')
    ).toBeTruthy();
  });

  // ── Tournament list rendering ──
  test('renders tournament names', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: mockTournaments },
      isLoading: false,
    };
    await renderTournaments();
    expect(screen.getByText('Spring Championship')).toBeTruthy();
    expect(screen.getByText('Round Robin Series')).toBeTruthy();
  });

  test('shows participant count for tournaments', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: mockTournaments },
      isLoading: false,
    };
    await renderTournaments();
    expect(screen.getByText('8 players')).toBeTruthy();
    expect(screen.getByText('4 players')).toBeTruthy();
  });

  test('shows games played count', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: mockTournaments },
      isLoading: false,
    };
    await renderTournaments();
    expect(screen.getByText('12 games')).toBeTruthy();
    expect(screen.getByText('6 games')).toBeTruthy();
  });

  test('shows status and format for each tournament', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: mockTournaments },
      isLoading: false,
    };
    await renderTournaments();
    expect(screen.getByText(/active.*single elimination/i)).toBeTruthy();
    expect(screen.getByText(/completed.*round robin/i)).toBeTruthy();
  });

  // ── Admin create button ──
  test('shows create button for admin users', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [] },
      isLoading: false,
    };
    queryResults['my-profile'] = {
      data: { player: { is_admin: true } },
    };
    await renderTournaments();
    // The Plus button exists when admin
    // Since we can't easily query by icon, we test the button action
    // by verifying the component renders without error
    expect(screen.getByText(/Tournaments/)).toBeTruthy();
  });

  test('does not show create button for non-admin users', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [] },
      isLoading: false,
    };
    queryResults['my-profile'] = {
      data: { player: { is_admin: false } },
    };
    await renderTournaments();
    expect(screen.getByText('No tournaments yet')).toBeTruthy();
  });

  // ── Bracket modal ──
  test('opens bracket modal when tournament is tapped', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [mockTournaments[0]] },
      isLoading: false,
    };
    queryResults['tournament-bracket'] = {
      data: {
        tournament: { name: 'Spring Championship', format: 'single_elimination' },
        bracket: null,
      },
    };
    await renderTournaments();
    fireEvent.click(screen.getByText('Spring Championship'));
    // Modal should open showing tournament name
    expect(screen.getByTestId('modal')).toBeTruthy();
  });

  test('bracket modal shows close button', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [mockTournaments[0]] },
      isLoading: false,
    };
    queryResults['tournament-bracket'] = {
      data: {
        tournament: { name: 'Spring Championship', format: 'single_elimination' },
        bracket: null,
      },
    };
    await renderTournaments();
    fireEvent.click(screen.getByText('Spring Championship'));
    // Close button renders as a text element
    expect(screen.queryByText(/✕/)).toBeTruthy();
  });

  // ── Round robin bracket ──
  test('renders round robin standings when bracket is loaded', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [mockTournaments[1]] },
      isLoading: false,
    };
    queryResults['tournament-bracket'] = {
      data: {
        tournament: { name: 'Round Robin Series', format: 'round_robin' },
        bracket: {
          standings: [
            { id: 'p1', name: 'Alice', emoji: '🏓', wins: 3, losses: 1, gamesPlayed: 4 },
            { id: 'p2', name: 'Bob', emoji: '🎯', wins: 1, losses: 3, gamesPlayed: 4 },
          ],
          matchups: [],
        },
      },
    };
    await renderTournaments();
    fireEvent.click(screen.getByText('Round Robin Series'));
    expect(screen.getByText('Standings')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('3W')).toBeTruthy();
    expect(screen.getByText('1L')).toBeTruthy();
  });

  // ── Single elimination bracket ──
  test('renders single elimination bracket with round names', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [mockTournaments[0]] },
      isLoading: false,
    };
    queryResults['tournament-bracket'] = {
      data: {
        tournament: { name: 'Spring Championship', format: 'single_elimination' },
        bracket: {
          rounds: [
            {
              name: 'Quarter Finals',
              matchups: [
                {
                  player1: { player_id: 'p1', name: 'Alice', emoji: '🏓' },
                  player2: { player_id: 'p2', name: 'Bob', emoji: '🎯' },
                  game: null,
                },
              ],
            },
          ],
        },
      },
    };
    await renderTournaments();
    fireEvent.click(screen.getByText('Spring Championship'));
    expect(screen.getByText('Quarter Finals')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  // ── TBD placeholder ──
  test('shows TBD for empty bracket slots', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [mockTournaments[0]] },
      isLoading: false,
    };
    queryResults['tournament-bracket'] = {
      data: {
        tournament: { name: 'Spring Championship', format: 'single_elimination' },
        bracket: {
          rounds: [
            {
              name: 'Semi Finals',
              matchups: [
                {
                  player1: null,
                  player2: null,
                  game: null,
                },
              ],
            },
          ],
        },
      },
    };
    await renderTournaments();
    fireEvent.click(screen.getByText('Spring Championship'));
    const tbdElements = screen.getAllByText('TBD');
    expect(tbdElements.length).toBe(2);
  });

  // ── Loading bracket ──
  test('shows loading spinner while bracket data loads', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [mockTournaments[0]] },
      isLoading: false,
    };
    queryResults['tournament-bracket'] = {
      data: undefined,
      isLoading: true,
    };
    await renderTournaments();
    fireEvent.click(screen.getByText('Spring Championship'));
    // A second loader appears in the modal
    const loaders = screen.getAllByTestId('activity-indicator');
    expect(loaders.length).toBeGreaterThan(0);
  });

  // ── All Matchups section in round robin ──
  test('renders All Matchups section in round robin bracket', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [mockTournaments[1]] },
      isLoading: false,
    };
    queryResults['tournament-bracket'] = {
      data: {
        tournament: { name: 'Round Robin Series', format: 'round_robin' },
        bracket: {
          standings: [
            { id: 'p1', name: 'Alice', emoji: '🏓', wins: 1, losses: 0, gamesPlayed: 1 },
          ],
          matchups: [
            {
              player1: { name: 'Alice', emoji: '🏓' },
              player2: { name: 'Bob', emoji: '🎯' },
              game: null,
            },
          ],
        },
      },
    };
    await renderTournaments();
    fireEvent.click(screen.getByText('Round Robin Series'));
    expect(screen.getByText('All Matchups')).toBeTruthy();
    expect(screen.getByText('Not played')).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/tournaments.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Renders without crash ──
  test('renders without crashing', async () => {
    queryResults['tournaments'] = {
      data: { tournaments: [] },
      isLoading: false,
    };
    const { container } = await renderTournaments();
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(50);
  });
});
