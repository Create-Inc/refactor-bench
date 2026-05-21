import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('lucide-react-native', () => ({
  Target: () => null,
  Star: () => null,
  TrendingUp: () => null,
  Users: () => null,
  Zap: () => null,
  X: () => null,
}));

const mockRouterBack = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: vi.fn() }),
}));

let mockUser = { id: 'user-1' };
vi.mock('@/utils/auth/useUser', () => ({
  default: () => ({ data: mockUser }),
}));

// ── Mock API ──
let mockApiResult = { quests: [], personalized: false };
const mockApiGet = vi.fn().mockImplementation(async () => mockApiResult);

vi.mock('@/utils/api', () => ({
  default: {
    get: (...args) => mockApiGet(...args),
  },
}));

const mockQuests = [
  {
    id: 'q1',
    quest_type: 'checkin_goals',
    quest_target: 3,
    quest_progress: 1,
    xp_reward: 50,
    completed_at: null,
    description: 'Check in to 3 of your goals today',
  },
  {
    id: 'q2',
    quest_type: 'join_battle',
    quest_target: 1,
    quest_progress: 1,
    xp_reward: 75,
    completed_at: '2025-01-15T10:00:00Z',
    description: 'Join a battle and compete with others',
  },
  {
    id: 'q3',
    quest_type: 'maintain_7_streak',
    quest_target: 7,
    quest_progress: 4,
    xp_reward: 100,
    completed_at: null,
    description: 'Keep a streak going for 7 days',
  },
];

async function renderQuests() {
  const mod = await import('./src/app/quests.jsx');
  const QuestsScreen = mod.default;
  return render(<QuestsScreen />);
}

describe('QuestsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 'user-1' };
    mockApiResult = { quests: mockQuests, personalized: false };
  });

  // ── Header ──
  test('renders Daily Quests header', async () => {
    await renderQuests();
    expect(screen.getByText('Daily Quests')).toBeTruthy();
  });

  // ── Stats bar ──
  test('renders completed quests count', async () => {
    await renderQuests();
    // 1 completed out of 3
    expect(screen.getByText('1/3')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
  });

  test('renders XP earned from completed quests', async () => {
    await renderQuests();
    // Only q2 is completed with 75 XP
    expect(screen.getByText('75')).toBeTruthy();
    expect(screen.getByText('XP Earned')).toBeTruthy();
  });

  // ── Quest cards ──
  test('renders quest descriptions', async () => {
    await renderQuests();
    expect(screen.getByText('Check in to 3 of your goals today')).toBeTruthy();
    expect(screen.getByText('Join a battle and compete with others')).toBeTruthy();
    expect(screen.getByText('Keep a streak going for 7 days')).toBeTruthy();
  });

  test('renders XP reward for each quest', async () => {
    await renderQuests();
    expect(screen.getByText('+50 XP')).toBeTruthy();
    expect(screen.getByText('+75 XP')).toBeTruthy();
    expect(screen.getByText('+100 XP')).toBeTruthy();
  });

  test('shows Complete badge for completed quests', async () => {
    await renderQuests();
    expect(screen.getByText(/Complete/)).toBeTruthy();
  });

  test('shows progress bar info for incomplete quests', async () => {
    await renderQuests();
    expect(screen.getByText('Progress: 1/3')).toBeTruthy();
    expect(screen.getByText('Progress: 4/7')).toBeTruthy();
  });

  // ── Personalized badge ──
  test('shows FOR YOU badge when quests are personalized', async () => {
    mockApiResult = { quests: mockQuests, personalized: true };
    await renderQuests();
    expect(screen.getByText('FOR YOU')).toBeTruthy();
  });

  test('does not show FOR YOU badge when not personalized', async () => {
    mockApiResult = { quests: mockQuests, personalized: false };
    await renderQuests();
    expect(screen.queryByText('FOR YOU')).toBeNull();
  });

  // ── Empty state ──
  test('shows empty state when no quests available', async () => {
    mockApiResult = { quests: [], personalized: false };
    await renderQuests();
    expect(screen.getByText('No quests available today')).toBeTruthy();
  });

  // ── Refresh info ──
  test('renders refresh info text', async () => {
    await renderQuests();
    expect(screen.getByText(/New quests refresh daily/)).toBeTruthy();
    expect(screen.getByText(/Complete quests to earn bonus XP/)).toBeTruthy();
  });

  // ── Empty completed stats ──
  test('shows 0 stats when no quests completed', async () => {
    mockApiResult = {
      quests: [
        { id: 'q1', quest_type: 'checkin_goals', quest_target: 3, quest_progress: 0, xp_reward: 50, completed_at: null, description: 'Do something' },
      ],
      personalized: false,
    };
    await renderQuests();
    expect(screen.getByText('0/1')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/quests.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Renders without crash ──
  test('renders without crashing and produces output', async () => {
    const { container } = await renderQuests();
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(50);
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/quests.jsx');
    const QuestsScreen = mod.default;
    const { rerender } = render(<QuestsScreen />);
    expect(() => rerender(<QuestsScreen />)).not.toThrow();
  });
});
