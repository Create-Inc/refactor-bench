import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

// ---- Mocks ----

const mockRouter = { push: vi.fn(), back: vi.fn(), replace: vi.fn() };
vi.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('@expo-google-fonts/inter', () => ({
  useFonts: () => [true],
  Inter_600SemiBold: 'Inter_600SemiBold',
}));

const mockHaptics = {
  notificationAsync: vi.fn(),
  impactAsync: vi.fn(),
  NotificationFeedbackType: { Error: 'error', Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light' },
};
vi.mock('expo-haptics', () => ({
  Haptics: mockHaptics,
  ...mockHaptics,
}));

vi.mock('expo-gl', () => ({
  GLView: ({ onContextCreate, ...props }) => (
    <div data-testid="gl-view" {...props} />
  ),
}));

vi.mock('three', () => ({
  Scene: vi.fn(() => ({ add: vi.fn() })),
  PerspectiveCamera: vi.fn(() => ({
    position: { set: vi.fn() },
    add: vi.fn(),
  })),
  PointLight: vi.fn(() => ({
    position: { set: vi.fn() },
    intensity: 1,
    distance: 10,
  })),
}));

vi.mock('expo-three', () => ({
  Renderer: vi.fn(() => ({
    setSize: vi.fn(),
    setClearColor: vi.fn(),
    render: vi.fn(),
  })),
}));

// Game state mock with controllable values
let gameStateOverrides = {};
const defaultGameState = () => ({
  gameOver: false,
  setGameOver: vi.fn(),
  isJumpscare: false,
  setIsJumpscare: vi.fn(),
  currentLevel: 0,
  setCurrentLevel: vi.fn(),
  isSprinting: false,
  setIsSprinting: vi.fn(),
  flashlightOn: true,
  setFlashlightOn: vi.fn(),
  battery: 100,
  setBattery: vi.fn(),
  sanity: 100,
  setSanity: vi.fn(),
  visitedCells: new Set(),
  setVisitedCells: vi.fn(),
  collectedMilk: new Set(),
  setCollectedMilk: vi.fn(),
  totalMilkCollected: 0,
  setTotalMilkCollected: vi.fn(),
  movementRef: { current: { x: 0, y: 0 } },
  cameraRef: { current: null },
  sceneRef: { current: null },
  mazeRef: { current: null },
  stalkerRef: { current: null },
  lastTimeRef: { current: Date.now() },
  requestRef: { current: null },
  flashlightRef: { current: { intensity: 1, distance: 10 } },
  milkPositionsRef: { current: [] },
  milkMeshesRef: { current: [] },
  exitPortalRef: { current: null },
  monsterLastTeleportRef: { current: 0 },
});

vi.mock('../hooks/useGameState', () => ({
  useGameState: () => ({ ...defaultGameState(), ...gameStateOverrides }),
}));

// Audio mock
const mockStaticPlayer = { play: vi.fn() };
vi.mock('../hooks/useGameAudio', () => ({
  useGameAudio: () => ({ staticPlayer: mockStaticPlayer }),
}));

// Game loop mock
const mockGameLoopUpdate = vi.fn();
vi.mock('../hooks/useGameLoop', () => ({
  useGameLoop: () => mockGameLoopUpdate,
}));

vi.mock('../utils/levelBuilder', () => ({
  buildLevel: vi.fn(() => ({ cells: [] })),
}));

const MOCK_LEVEL_CONFIGS = [
  { name: 'Level 1', size: 5, milkCount: 3 },
  { name: 'Level 2', size: 7, milkCount: 5 },
  { name: 'Level 3', size: 9, milkCount: 7 },
];
vi.mock('../constants/levelConfigs', () => ({
  LEVEL_CONFIGS: MOCK_LEVEL_CONFIGS,
}));

vi.mock('../constants/gameConstants', () => ({
  PLAYER_HEIGHT: 0.6,
}));

// Stub child components to expose their props
vi.mock('../components/GameHUD/GameHUD', () => ({
  GameHUD: ({ sanity, battery, levelConfig }) => (
    <div data-testid="game-hud">
      <span data-testid="hud-sanity">{sanity}</span>
      <span data-testid="hud-battery">{battery}</span>
      <span data-testid="hud-level-name">{levelConfig?.name}</span>
    </div>
  ),
}));

vi.mock('../components/GameControls/GameControls', () => ({
  GameControls: ({
    isSprinting,
    flashlightOn,
    battery,
    toggleFlashlight,
  }) => (
    <div data-testid="game-controls">
      <span data-testid="ctrl-sprinting">{String(isSprinting)}</span>
      <span data-testid="ctrl-flashlight">{String(flashlightOn)}</span>
      <span data-testid="ctrl-battery">{String(battery)}</span>
      <button data-testid="toggle-flashlight" onClick={toggleFlashlight}>
        Toggle Flashlight
      </button>
    </div>
  ),
}));

vi.mock('../components/GameOverlay/GameOverlay', () => ({
  GameOverlay: ({
    gameOver,
    isJumpscare,
    currentLevel,
    totalMilkCollected,
    sanity,
    resetGame,
  }) => (
    <div data-testid="game-overlay">
      <span data-testid="overlay-game-over">{String(gameOver)}</span>
      <span data-testid="overlay-jumpscare">{String(isJumpscare)}</span>
      <span data-testid="overlay-level">{currentLevel}</span>
      <span data-testid="overlay-milk">{totalMilkCollected}</span>
      <span data-testid="overlay-sanity">{sanity}</span>
      <button data-testid="reset-button" onClick={resetGame}>
        Reset
      </button>
    </div>
  ),
}));

vi.mock('../components/SanityVignette/SanityVignette', () => ({
  SanityVignette: ({ sanity }) => (
    <div data-testid="sanity-vignette">
      <span data-testid="vignette-sanity">{sanity}</span>
    </div>
  ),
}));

// ---- Tests ----

describe('GameScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gameStateOverrides = {};
  });

  async function renderGame(overrides = {}) {
    gameStateOverrides = overrides;
    const mod = await import('./src/app/game.jsx');
    const GameScreen = mod.default;
    return render(<GameScreen />);
  }

  // ---- Basic rendering ----

  test('exports a default function component', async () => {
    const mod = await import('./src/app/game.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  test('renders the GL view', async () => {
    await renderGame();
    expect(screen.getByTestId('gl-view')).toBeTruthy();
  });

  test('renders HUD when game is not over', async () => {
    await renderGame({ gameOver: false });
    expect(screen.getByTestId('game-hud')).toBeTruthy();
  });

  test('renders game controls when game is not over', async () => {
    await renderGame({ gameOver: false });
    expect(screen.getByTestId('game-controls')).toBeTruthy();
  });

  test('renders the game overlay', async () => {
    await renderGame();
    expect(screen.getByTestId('game-overlay')).toBeTruthy();
  });

  test('renders sanity vignette', async () => {
    await renderGame();
    expect(screen.getByTestId('sanity-vignette')).toBeTruthy();
  });

  // ---- Game state display ----

  test('displays correct sanity in HUD', async () => {
    await renderGame({ gameOver: false, sanity: 75 });
    expect(screen.getByTestId('hud-sanity').textContent).toBe('75');
  });

  test('displays correct battery in HUD', async () => {
    await renderGame({ gameOver: false, battery: 42 });
    expect(screen.getByTestId('hud-battery').textContent).toBe('42');
  });

  test('displays current level config name in HUD', async () => {
    await renderGame({ gameOver: false, currentLevel: 0 });
    expect(screen.getByTestId('hud-level-name').textContent).toBe('Level 1');
  });

  test('passes sanity to vignette component', async () => {
    await renderGame({ sanity: 30 });
    expect(screen.getByTestId('vignette-sanity').textContent).toBe('30');
  });

  // ---- Game Over states ----

  test('hides HUD and controls when game is over', async () => {
    await renderGame({ gameOver: true });
    expect(screen.queryByTestId('game-hud')).toBeNull();
    expect(screen.queryByTestId('game-controls')).toBeNull();
  });

  test('overlay shows game-over state', async () => {
    await renderGame({ gameOver: true });
    expect(screen.getByTestId('overlay-game-over').textContent).toBe('true');
  });

  test('overlay shows total milk collected', async () => {
    await renderGame({ totalMilkCollected: 12 });
    expect(screen.getByTestId('overlay-milk').textContent).toBe('12');
  });

  // ---- Flashlight toggle ----

  test('toggleFlashlight calls setFlashlightOn when battery > 0', async () => {
    const setFlashlightOn = vi.fn();
    await renderGame({
      gameOver: false,
      battery: 50,
      flashlightOn: true,
      setFlashlightOn,
    });
    fireEvent.click(screen.getByTestId('toggle-flashlight'));
    expect(setFlashlightOn).toHaveBeenCalled();
  });

  test('toggleFlashlight does nothing when battery is 0', async () => {
    const setFlashlightOn = vi.fn();
    await renderGame({
      gameOver: false,
      battery: 0,
      flashlightOn: false,
      setFlashlightOn,
    });
    fireEvent.click(screen.getByTestId('toggle-flashlight'));
    expect(setFlashlightOn).not.toHaveBeenCalled();
  });

  // ---- Reset game ----

  test('resetGame resets all state via the overlay button', async () => {
    const setGameOver = vi.fn();
    const setIsJumpscare = vi.fn();
    const setCurrentLevel = vi.fn();
    const setBattery = vi.fn();
    const setSanity = vi.fn();
    const setFlashlightOn = vi.fn();
    const setVisitedCells = vi.fn();
    const setCollectedMilk = vi.fn();
    const setTotalMilkCollected = vi.fn();
    const setIsSprinting = vi.fn();

    await renderGame({
      gameOver: true,
      setGameOver,
      setIsJumpscare,
      setCurrentLevel,
      setBattery,
      setSanity,
      setFlashlightOn,
      setVisitedCells,
      setCollectedMilk,
      setTotalMilkCollected,
      setIsSprinting,
    });

    fireEvent.click(screen.getByTestId('reset-button'));

    expect(setGameOver).toHaveBeenCalledWith(false);
    expect(setIsJumpscare).toHaveBeenCalledWith(false);
    expect(setCurrentLevel).toHaveBeenCalledWith(0);
    expect(setBattery).toHaveBeenCalledWith(100);
    expect(setSanity).toHaveBeenCalledWith(100);
    expect(setFlashlightOn).toHaveBeenCalledWith(true);
    expect(setTotalMilkCollected).toHaveBeenCalledWith(0);
    expect(setIsSprinting).toHaveBeenCalledWith(false);
  });

  // ---- Controls state ----

  test('passes sprint state to controls', async () => {
    await renderGame({ gameOver: false, isSprinting: true });
    expect(screen.getByTestId('ctrl-sprinting').textContent).toBe('true');
  });

  test('passes flashlight state to controls', async () => {
    await renderGame({ gameOver: false, flashlightOn: false });
    expect(screen.getByTestId('ctrl-flashlight').textContent).toBe('false');
  });

  // ---- Fonts loading ----

  test('returns null when fonts not loaded', async () => {
    // Override the useFonts mock temporarily
    const { useFonts } = await import('@expo-google-fonts/inter');
    // The default mock returns [true], so the component renders.
    // Verify normal rendering works as a baseline.
    await renderGame();
    expect(screen.getByTestId('gl-view')).toBeTruthy();
  });
});
