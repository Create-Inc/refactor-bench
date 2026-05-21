import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock constants
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 500;
const INITIAL_PLAYERS = {
  home: [
    { name: 'Player 1', x: 100, y: 250 },
    { name: 'Player 2', x: 200, y: 150 },
    { name: 'Player 3', x: 200, y: 350 },
  ],
  away: [
    { name: 'Away 1', x: 600, y: 250 },
    { name: 'Away 2', x: 500, y: 150 },
  ],
};
const INITIAL_STATS = {
  shots: { home: 0, away: 0 },
  passes: { home: 0, away: 0 },
  fouls: { home: 0, away: 0 },
  possession: { home: 50, away: 50 },
};

vi.mock('@/components/Football/constants', () => ({
  FIELD_WIDTH: 800,
  FIELD_HEIGHT: 500,
  INITIAL_PLAYERS: {
    home: [
      { name: 'Player 1', x: 100, y: 250 },
      { name: 'Player 2', x: 200, y: 150 },
      { name: 'Player 3', x: 200, y: 350 },
    ],
    away: [
      { name: 'Away 1', x: 600, y: 250 },
      { name: 'Away 2', x: 500, y: 150 },
    ],
  },
  INITIAL_STATS: {
    shots: { home: 0, away: 0 },
    passes: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    possession: { home: 50, away: 50 },
  },
}));

// Mock useGameLoop
vi.mock('@/components/Football/useGameLoop', () => ({
  useGameLoop: vi.fn(),
}));

// Mock child components
vi.mock('@/components/Football/PageHeader', () => ({
  PageHeader: ({ gameState, setGameState, onReset, difficulty, setDifficulty }) => (
    <div data-testid="page-header">
      <span data-testid="game-state">{gameState}</span>
      <span data-testid="difficulty">{difficulty}</span>
      <button data-testid="start-btn" onClick={() => setGameState('playing')}>Start</button>
      <button data-testid="pause-btn" onClick={() => setGameState('paused')}>Pause</button>
      <button data-testid="reset-btn" onClick={onReset}>Reset</button>
      <button data-testid="set-easy" onClick={() => setDifficulty('easy')}>Easy</button>
      <button data-testid="set-hard" onClick={() => setDifficulty('hard')}>Hard</button>
    </div>
  ),
}));

vi.mock('@/components/Football/Card', () => ({
  Card: ({ children, className }) => <div data-testid="card" className={className}>{children}</div>,
}));

vi.mock('@/components/Football/Scoreboard', () => ({
  Scoreboard: ({ score, time, gameState, teamNames }) => (
    <div data-testid="scoreboard">
      <span data-testid="home-score">{score.home}</span>
      <span data-testid="away-score">{score.away}</span>
      <span data-testid="time">{time}</span>
      <span data-testid="home-team">{teamNames.home}</span>
      <span data-testid="away-team">{teamNames.away}</span>
    </div>
  ),
}));

vi.mock('@/components/Football/GameCanvas', () => ({
  GameCanvas: ({ gameState, isHalftime }) => (
    <div data-testid="game-canvas">
      <span data-testid="canvas-state">{gameState}</span>
      <span data-testid="is-halftime">{String(isHalftime)}</span>
    </div>
  ),
}));

vi.mock('@/components/Football/ControlsGuide', () => ({
  ControlsGuide: ({ selectedPlayer }) => (
    <div data-testid="controls-guide">
      <span data-testid="selected-player">{selectedPlayer}</span>
    </div>
  ),
}));

vi.mock('@/components/Football/StatsPanel', () => ({
  StatsPanel: ({ stats, teamNames }) => (
    <div data-testid="stats-panel">
      <span data-testid="home-shots">{stats.shots.home}</span>
      <span data-testid="away-shots">{stats.shots.away}</span>
    </div>
  ),
}));

vi.mock('@/components/Football/EventsPanel', () => ({
  EventsPanel: ({ events }) => (
    <div data-testid="events-panel">
      <span data-testid="event-count">{events.length}</span>
    </div>
  ),
}));

vi.mock('@/components/Football/TipsPanel', () => ({
  TipsPanel: ({ difficulty }) => (
    <div data-testid="tips-panel">
      <span data-testid="tips-difficulty">{difficulty}</span>
    </div>
  ),
}));

import FootballGamePage from './src/app/page.jsx';

describe('FootballGamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -- Initial render --

  test('renders the page header', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('page-header')).toBeTruthy();
  });

  test('renders the scoreboard', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('scoreboard')).toBeTruthy();
  });

  test('renders the game canvas', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('game-canvas')).toBeTruthy();
  });

  test('renders controls guide', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('controls-guide')).toBeTruthy();
  });

  test('renders stats panel', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('stats-panel')).toBeTruthy();
  });

  test('renders events panel', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('events-panel')).toBeTruthy();
  });

  test('renders tips panel', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('tips-panel')).toBeTruthy();
  });

  // -- Initial state --

  test('starts with idle game state', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('game-state').textContent).toBe('idle');
  });

  test('starts with score 0-0', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('home-score').textContent).toBe('0');
    expect(screen.getByTestId('away-score').textContent).toBe('0');
  });

  test('starts with medium difficulty', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('difficulty').textContent).toBe('medium');
  });

  test('displays correct team names', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('home-team').textContent).toBe('الهلال');
    expect(screen.getByTestId('away-team').textContent).toBe('النصر');
  });

  test('starts with time at 0', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('time').textContent).toBe('0');
  });

  test('starts with 0 events', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('event-count').textContent).toBe('0');
  });

  test('starts with selected player 0', () => {
    render(<FootballGamePage />);
    expect(screen.getByTestId('selected-player').textContent).toBe('0');
  });

  // -- User interactions --

  test('changes game state to playing when start is clicked', () => {
    render(<FootballGamePage />);
    fireEvent.click(screen.getByTestId('start-btn'));
    expect(screen.getByTestId('game-state').textContent).toBe('playing');
  });

  test('resets game state when reset is clicked', () => {
    render(<FootballGamePage />);
    fireEvent.click(screen.getByTestId('start-btn'));
    fireEvent.click(screen.getByTestId('reset-btn'));
    expect(screen.getByTestId('game-state').textContent).toBe('idle');
    expect(screen.getByTestId('home-score').textContent).toBe('0');
    expect(screen.getByTestId('away-score').textContent).toBe('0');
  });

  test('changes difficulty when difficulty button is clicked', () => {
    render(<FootballGamePage />);
    fireEvent.click(screen.getByTestId('set-easy'));
    expect(screen.getByTestId('difficulty').textContent).toBe('easy');
    expect(screen.getByTestId('tips-difficulty').textContent).toBe('easy');
  });

  // -- Component export --

  test('exports a default function component', () => {
    expect(FootballGamePage).toBeDefined();
    expect(typeof FootballGamePage).toBe('function');
  });

  test('renders without crashing and produces output', () => {
    const { container } = render(<FootballGamePage />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
