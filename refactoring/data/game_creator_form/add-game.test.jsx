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
    TextInput: ({ value, onChangeText, placeholder, ...props }) => (
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
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('lucide-react-native', () => ({
  Check: () => null,
  ChevronDown: () => null,
  ChevronLeft: () => null,
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

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }) => {
    const key = queryKey[0];
    return queryResults[key] || { data: undefined, isLoading: false };
  },
  useMutation: ({ onSuccess, onError }) => ({
    mutate: (...args) => mockMutate(...args),
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

const mockPlayers = [
  { id: 'p1', name: 'Alice', emoji: '🏓', elo: 1200 },
  { id: 'p2', name: 'Bob', emoji: '🎯', elo: 1100 },
  { id: 'p3', name: 'Charlie', emoji: '🎾', elo: 1050 },
];

async function renderAddGame() {
  const mod = await import('./src/app/add-game.jsx');
  const AddGameScreen = mod.default;
  return render(<AddGameScreen />);
}

describe('AddGameScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryResults = {
      players: { data: mockPlayers, isLoading: false },
      'recent-opponents': { data: [], isLoading: false },
    };
  });

  // ── Header ──
  test('renders the screen title', async () => {
    await renderAddGame();
    expect(screen.getByText(/Add Game/)).toBeTruthy();
  });

  test('renders subtitle text', async () => {
    await renderAddGame();
    expect(screen.getByText('Record the results')).toBeTruthy();
  });

  // ── Player selection ──
  test('renders Winner label', async () => {
    await renderAddGame();
    expect(screen.getByText(/Winner/)).toBeTruthy();
  });

  test('renders Loser label', async () => {
    await renderAddGame();
    expect(screen.getByText(/Loser/)).toBeTruthy();
  });

  test('shows placeholder text for winner selection', async () => {
    await renderAddGame();
    expect(screen.getByText('Select winner...')).toBeTruthy();
  });

  test('shows placeholder text for loser selection', async () => {
    await renderAddGame();
    expect(screen.getByText('Select loser...')).toBeTruthy();
  });

  // ── Quick Scores ──
  test('renders Quick Scores section', async () => {
    await renderAddGame();
    expect(screen.getByText('Quick Scores')).toBeTruthy();
  });

  test('renders all quick score options', async () => {
    await renderAddGame();
    expect(screen.getByText('11-9')).toBeTruthy();
    expect(screen.getByText('11-8')).toBeTruthy();
    expect(screen.getByText('11-7')).toBeTruthy();
    expect(screen.getByText('11-5')).toBeTruthy();
    expect(screen.getByText('11-3')).toBeTruthy();
    expect(screen.getByText('11-0')).toBeTruthy();
  });

  // ── Final Score ──
  test('renders Final Score section', async () => {
    await renderAddGame();
    expect(screen.getByText('Final Score')).toBeTruthy();
  });

  test('renders Winner Score and Loser Score labels', async () => {
    await renderAddGame();
    expect(screen.getByText('Winner Score')).toBeTruthy();
    expect(screen.getByText('Loser Score')).toBeTruthy();
  });

  // ── Submit button ──
  test('renders Add Game submit button', async () => {
    await renderAddGame();
    expect(screen.getByText('Add Game')).toBeTruthy();
  });

  // ── Loading state ──
  test('shows loading indicator while players load', async () => {
    queryResults['players'] = { data: undefined, isLoading: true };
    await renderAddGame();
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  // ── Winner picker modal ──
  test('opens winner picker modal on winner button press', async () => {
    await renderAddGame();
    fireEvent.click(screen.getByText('Select winner...'));
    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(screen.getByText('Select Winner')).toBeTruthy();
  });

  test('winner picker shows player names', async () => {
    await renderAddGame();
    fireEvent.click(screen.getByText('Select winner...'));
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('Charlie')).toBeTruthy();
  });

  test('winner picker has Cancel button', async () => {
    await renderAddGame();
    fireEvent.click(screen.getByText('Select winner...'));
    // Cancel buttons in both modals
    const cancelButtons = screen.getAllByText('Cancel');
    expect(cancelButtons.length).toBeGreaterThan(0);
  });

  // ── Loser picker modal ──
  test('opens loser picker modal on loser button press', async () => {
    await renderAddGame();
    fireEvent.click(screen.getByText('Select loser...'));
    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(screen.getByText('Select Loser')).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/add-game.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Renders without crash ──
  test('renders without crashing and produces output', async () => {
    const { container } = await renderAddGame();
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(50);
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/add-game.jsx');
    const AddGameScreen = mod.default;
    const { rerender } = render(<AddGameScreen />);
    expect(() => rerender(<AddGameScreen />)).not.toThrow();
  });
});
