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
    TextInput: ({ value, onChangeText, placeholder, placeholderTextColor, ...props }) => (
      <input
        value={value || ''}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
    ),
    ActivityIndicator: () => <span data-testid="activity-indicator">Loading...</span>,
    Modal: ({ visible, children }) =>
      visible ? <div data-testid="modal">{children}</div> : null,
    Alert: { alert: vi.fn() },
    Share: { share: vi.fn().mockResolvedValue({}) },
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Trash2: () => null,
  Edit3: () => null,
  Users: () => null,
  Trophy: () => null,
  Calendar: () => null,
  Settings: () => null,
  Plus: () => null,
  X: () => null,
  Copy: () => null,
  Share2: () => null,
}));

vi.mock('expo-clipboard', () => ({
  setStringAsync: vi.fn().mockResolvedValue(undefined),
}));

const mockRouterBack = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: vi.fn() }),
}));

vi.mock('../utils/useGroupCode', () => ({
  useGroupCode: () => ({ groupCode: 'TEST-GROUP' }),
}));

// ── React Query mock ──
let queryResults = {};
const mockMutate = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }) => {
    const key = queryKey[0];
    return queryResults[key] || { data: undefined, isLoading: false, refetch: vi.fn() };
  },
  useMutation: ({ onSuccess }) => ({
    mutate: (...args) => {
      mockMutate(...args);
      if (onSuccess) onSuccess();
    },
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

async function renderAdminPanel() {
  const mod = await import('./src/app/admin-panel.jsx');
  const AdminPanelScreen = mod.default;
  return render(<AdminPanelScreen />);
}

describe('AdminPanelScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryResults = {};
  });

  // ── Header ──
  test('renders Admin Panel title', async () => {
    await renderAdminPanel();
    expect(screen.getByText('Admin Panel')).toBeTruthy();
  });

  test('renders Back button', async () => {
    await renderAdminPanel();
    expect(screen.getByText('Back')).toBeTruthy();
  });

  // ── Tabs ──
  test('renders all three tab labels', async () => {
    await renderAdminPanel();
    expect(screen.getByText('Games')).toBeTruthy();
    expect(screen.getByText('Players')).toBeTruthy();
    expect(screen.getByText('Seasons')).toBeTruthy();
  });

  // ── Games tab (default) ──
  test('shows empty games message when no games exist', async () => {
    queryResults['recent-games-admin'] = {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    expect(screen.getByText('No games yet')).toBeTruthy();
  });

  test('renders game entries with winner and loser info', async () => {
    queryResults['recent-games-admin'] = {
      data: [
        {
          id: 'g1',
          winner_emoji: '🏓',
          winner_name: 'Alice',
          winner_score: 11,
          loser_emoji: '🎯',
          loser_name: 'Bob',
          loser_score: 5,
          played_at: '2025-01-15T10:00:00Z',
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    expect(screen.getByText(/Alice/)).toBeTruthy();
    expect(screen.getByText(/Bob/)).toBeTruthy();
  });

  // ── Players tab ──
  test('switches to players tab and shows empty message', async () => {
    queryResults['all-players-admin'] = {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    fireEvent.click(screen.getByText('Players'));
    expect(screen.getByText('No players yet')).toBeTruthy();
  });

  test('renders player name and elo on players tab', async () => {
    queryResults['all-players-admin'] = {
      data: [
        { id: 'p1', name: 'Charlie', emoji: '🎾', elo: 1200, username: 'charlie99' },
      ],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    fireEvent.click(screen.getByText('Players'));
    expect(screen.getByText('Charlie')).toBeTruthy();
    expect(screen.getByText('Elo: 1200')).toBeTruthy();
    expect(screen.getByText('@charlie99')).toBeTruthy();
  });

  // ── Seasons tab ──
  test('switches to seasons tab and shows Create New Season button', async () => {
    queryResults['seasons-admin'] = {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    fireEvent.click(screen.getByText('Seasons'));
    expect(screen.getByText('Create New Season')).toBeTruthy();
  });

  test('shows empty seasons message', async () => {
    queryResults['seasons-admin'] = {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    fireEvent.click(screen.getByText('Seasons'));
    expect(screen.getByText('No seasons yet')).toBeTruthy();
  });

  test('renders season cards with name and status', async () => {
    queryResults['seasons-admin'] = {
      data: [
        {
          id: 's1',
          name: 'Spring 2025',
          status: 'active',
          game_count: 42,
          started_at: '2025-03-01T00:00:00Z',
          ended_at: null,
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    fireEvent.click(screen.getByText('Seasons'));
    expect(screen.getByText('Spring 2025')).toBeTruthy();
    expect(screen.getByText('42 games')).toBeTruthy();
    expect(screen.getByText('active')).toBeTruthy();
  });

  // ── League Settings Modal ──
  test('opens league settings modal when settings icon tapped', async () => {
    await renderAdminPanel();
    // The settings button is the third button in the header row (after Back and title)
    // We find it by looking for the "League Settings" text that appears in the modal
    const buttons = screen.getAllByRole('button');
    // The settings button is the one after 'Back' (index 0) - we need to find it
    // Settings icon button is the 3rd element in header
    // Click all buttons until modal opens
    for (const btn of buttons) {
      if (!screen.queryByText('League Settings')) {
        fireEvent.click(btn);
      }
    }
    expect(screen.getByText('League Settings')).toBeTruthy();
  });

  test('league settings modal shows League Code label', async () => {
    await renderAdminPanel();
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      if (!screen.queryByText('League Settings')) {
        fireEvent.click(btn);
      }
    }
    expect(screen.getByText('League Code')).toBeTruthy();
    expect(screen.getByText('TEST-GROUP')).toBeTruthy();
  });

  test('league settings modal shows Copy and Share buttons', async () => {
    await renderAdminPanel();
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      if (!screen.queryByText('League Settings')) {
        fireEvent.click(btn);
      }
    }
    expect(screen.getByText('Copy')).toBeTruthy();
    expect(screen.getByText('Share League Code')).toBeTruthy();
  });

  test('league settings modal shows Save Settings button', async () => {
    await renderAdminPanel();
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      if (!screen.queryByText('League Settings')) {
        fireEvent.click(btn);
      }
    }
    expect(screen.getByText('Save Settings')).toBeTruthy();
  });

  test('league settings modal shows description field label', async () => {
    await renderAdminPanel();
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      if (!screen.queryByText('League Settings')) {
        fireEvent.click(btn);
      }
    }
    expect(screen.getByText('Description (max 100 chars)')).toBeTruthy();
  });

  // ── Create Season Modal ──
  test('opens create season modal from seasons tab', async () => {
    queryResults['seasons-admin'] = {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    fireEvent.click(screen.getByText('Seasons'));
    fireEvent.click(screen.getByText('Create New Season'));
    // The modal re-uses the "Create New Season" title
    expect(screen.getByPlaceholderText('e.g., Spring 2025, Season 2')).toBeTruthy();
  });

  test('create season modal shows close current season checkbox', async () => {
    queryResults['seasons-admin'] = {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    fireEvent.click(screen.getByText('Seasons'));
    fireEvent.click(screen.getByText('Create New Season'));
    expect(screen.getByText('Close current season')).toBeTruthy();
  });

  test('create season modal has Create Season submit button', async () => {
    queryResults['seasons-admin'] = {
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderAdminPanel();
    fireEvent.click(screen.getByText('Seasons'));
    fireEvent.click(screen.getByText('Create New Season'));
    expect(screen.getByText('Create Season')).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/admin-panel.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Renders without crash ──
  test('renders without crashing and produces output', async () => {
    const { container } = await renderAdminPanel();
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(50);
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/admin-panel.jsx');
    const AdminPanelScreen = mod.default;
    const { rerender } = render(<AdminPanelScreen />);
    expect(() => rerender(<AdminPanelScreen />)).not.toThrow();
  });
});
