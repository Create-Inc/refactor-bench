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
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  RefreshCw: () => null,
}));

vi.mock('@/utils/scoreboardUtils', () => ({
  getColorHex: (color) => {
    const colors = { red: '#EF4444', blue: '#3B82F6', yellow: '#EAB308' };
    return colors[color] || '#888888';
  },
}));

// ── Hook mocks ──
const mockSheetSelection = {
  sheetNumber: 3,
  clubSheetsCount: 6,
  isSelectingSheet: false,
  sheetSelectionLoading: false,
  error: null,
  setError: vi.fn(),
  handleSheetSelect: vi.fn(),
};

vi.mock('@/hooks/useSheetSelection', () => ({
  useSheetSelection: () => mockSheetSelection,
}));

const mockScoreboardState = {
  team1Scores: [2, 0, 1, 0, 0, 0, 0, 0],
  setTeam1Scores: vi.fn(),
  team2Scores: [0, 3, 0, 0, 0, 0, 0, 0],
  setTeam2Scores: vi.fn(),
  currentEnd: 4,
  setCurrentEnd: vi.fn(),
  currentHammer: 1,
  setCurrentHammer: vi.fn(),
  blankEnd: false,
  setBlankEnd: vi.fn(),
  team1Total: 3,
  team2Total: 3,
};

vi.mock('@/hooks/useScoreboardState', () => ({
  useScoreboardState: () => mockScoreboardState,
}));

const mockTieBreaker = {
  showTieBreaker: false,
  tieWinMethod: null,
  setTieWinMethod: vi.fn(),
  tieWinnerTeam: null,
  setTieWinnerTeam: vi.fn(),
  tiesAllowed: false,
};

vi.mock('@/hooks/useTieBreaker', () => ({
  useTieBreaker: () => mockTieBreaker,
}));

const mockSaveGameResults = vi.fn();
const mockSaveTieBreakerResults = vi.fn();

vi.mock('@/utils/gameResultsHandler', () => ({
  saveGameResults: (...args) => mockSaveGameResults(...args),
  saveTieBreakerResults: (...args) => mockSaveTieBreakerResults(...args),
}));

// ── Stub child components ──
vi.mock('@/components/Scoreboard/SheetSelectionScreen', () => ({
  SheetSelectionScreen: ({ team1Name, team2Name }) => (
    <div data-testid="sheet-selection">
      <span>{team1Name} vs {team2Name}</span>
    </div>
  ),
}));

vi.mock('@/components/Scoreboard/ScoreboardHeader', () => ({
  ScoreboardHeader: ({ team1Name, team2Name, team1Total, team2Total, currentEnd, totalEnds }) => (
    <div data-testid="scoreboard-header">
      <span data-testid="team1-name">{team1Name}</span>
      <span data-testid="team2-name">{team2Name}</span>
      <span data-testid="team1-total">{team1Total}</span>
      <span data-testid="team2-total">{team2Total}</span>
    </div>
  ),
}));

vi.mock('@/components/Scoreboard/ScoreEntrySection', () => ({
  ScoreEntrySection: ({ currentEnd, totalEnds, handleFinishGame, handleTieBreakerConfirm }) => (
    <div data-testid="score-entry">
      <span data-testid="current-end">{currentEnd}</span>
      <button data-testid="finish-game" onClick={handleFinishGame}>Finish</button>
      <button data-testid="tiebreaker-confirm" onClick={handleTieBreakerConfirm}>Tiebreaker</button>
    </div>
  ),
}));

vi.mock('@/components/Scoreboard/GameSummary', () => ({
  GameSummary: ({ team1Name, team2Name, team1Total, team2Total }) => (
    <div data-testid="game-summary">
      <span>{team1Name}: {team1Total}</span>
      <span>{team2Name}: {team2Total}</span>
    </div>
  ),
}));

vi.mock('@/components/Scoreboard/ErrorNotice', () => ({
  ErrorNotice: ({ error }) =>
    error ? <div data-testid="error-notice">{error}</div> : null,
}));

// ── Router mock ──
const mockRouterBack = vi.fn();
const mockRouterPush = vi.fn();

vi.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    gameId: 'game-1',
    team1Name: 'Red Team',
    team2Name: 'Blue Team',
    team1Color: 'red',
    team2Color: 'blue',
    ends: '8',
    hammerTeam: '1',
    myTeamId: '1',
    myTeamNumber: '1',
    team1Id: '1',
    team2Id: '2',
    playerSetup: null,
  }),
  router: { back: mockRouterBack, push: mockRouterPush },
}));

async function renderScoreboard() {
  const mod = await import('./src/app/scoreboard.jsx');
  const ScoreboardScreen = mod.default;
  return render(<ScoreboardScreen />);
}

describe('ScoreboardScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSheetSelection.isSelectingSheet = false;
    mockSheetSelection.sheetSelectionLoading = false;
  });

  // ── Loading state ──
  test('shows loading text when sheet data is loading', async () => {
    mockSheetSelection.sheetSelectionLoading = true;
    await renderScoreboard();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  // ── Sheet selection ──
  test('shows sheet selection screen when no sheet selected', async () => {
    mockSheetSelection.isSelectingSheet = true;
    await renderScoreboard();
    expect(screen.getByTestId('sheet-selection')).toBeTruthy();
  });

  // ── Main scoreboard header ──
  test('renders Scoreboard title', async () => {
    await renderScoreboard();
    expect(screen.getByText('Scoreboard')).toBeTruthy();
  });

  test('renders Back to Setup link', async () => {
    await renderScoreboard();
    expect(screen.getByText('Back to Setup')).toBeTruthy();
  });

  test('shows current end and sheet number', async () => {
    await renderScoreboard();
    expect(screen.getByText(/End 4 of 8.*Sheet 3/)).toBeTruthy();
  });

  // ── Team names in scoreboard ──
  test('passes team names to ScoreboardHeader', async () => {
    await renderScoreboard();
    expect(screen.getByTestId('team1-name').textContent).toBe('Red Team');
    expect(screen.getByTestId('team2-name').textContent).toBe('Blue Team');
  });

  // ── Totals ──
  test('passes team totals to ScoreboardHeader', async () => {
    await renderScoreboard();
    expect(screen.getByTestId('team1-total').textContent).toBe('3');
    expect(screen.getByTestId('team2-total').textContent).toBe('3');
  });

  // ── Score entry section ──
  test('renders ScoreEntrySection with current end', async () => {
    await renderScoreboard();
    expect(screen.getByTestId('score-entry')).toBeTruthy();
    expect(screen.getByTestId('current-end').textContent).toBe('4');
  });

  // ── Game summary ──
  test('renders GameSummary component', async () => {
    await renderScoreboard();
    expect(screen.getByTestId('game-summary')).toBeTruthy();
    expect(screen.getByText('Red Team: 3')).toBeTruthy();
    expect(screen.getByText('Blue Team: 3')).toBeTruthy();
  });

  // ── Reassign Rocks button ──
  test('shows Reassign Rocks button when myTeamId is set', async () => {
    await renderScoreboard();
    expect(screen.getByText('Reassign Rocks')).toBeTruthy();
  });

  // ── Finish game ──
  test('calls saveGameResults when finish button is pressed', async () => {
    await renderScoreboard();
    fireEvent.click(screen.getByTestId('finish-game'));
    expect(mockSaveGameResults).toHaveBeenCalled();
  });

  // ── Tiebreaker ──
  test('calls saveTieBreakerResults when tiebreaker confirm is pressed', async () => {
    await renderScoreboard();
    fireEvent.click(screen.getByTestId('tiebreaker-confirm'));
    expect(mockSaveTieBreakerResults).toHaveBeenCalled();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/scoreboard.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Renders without crash ──
  test('renders without crashing and produces output', async () => {
    const { container } = await renderScoreboard();
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(50);
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/scoreboard.jsx');
    const ScoreboardScreen = mod.default;
    const { rerender } = render(<ScoreboardScreen />);
    expect(() => rerender(<ScoreboardScreen />)).not.toThrow();
  });
});
