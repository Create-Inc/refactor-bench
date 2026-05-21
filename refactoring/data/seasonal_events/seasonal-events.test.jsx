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
    RefreshControl: () => null,
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
  Calendar: () => null,
  Zap: () => null,
  Trophy: () => null,
  Clock: () => null,
  Star: () => null,
}));

const mockRouterBack = vi.fn();
const mockRouterPush = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: mockRouterPush }),
}));

// ── Mock API ──
let mockApiResult = {};
const mockApiGet = vi.fn().mockImplementation(async (path) => {
  return mockApiResult;
});

vi.mock('@/utils/api', () => ({
  default: {
    get: (...args) => mockApiGet(...args),
  },
}));

async function renderSeasonalEvents() {
  const mod = await import('./src/app/seasonal-events.jsx');
  const SeasonalEventsScreen = mod.default;
  return render(<SeasonalEventsScreen />);
}

describe('SeasonalEventsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiResult = {
      activeEvents: [],
      upcomingEvents: [],
      currentXpMultiplier: 1,
    };
  });

  // ── Header ──
  test('renders Seasonal Events header', async () => {
    await renderSeasonalEvents();
    expect(screen.getByText('Seasonal Events')).toBeTruthy();
  });

  test('renders subtitle', async () => {
    await renderSeasonalEvents();
    expect(screen.getByText('Limited-time challenges & bonuses')).toBeTruthy();
  });

  // ── Empty state ──
  test('shows empty state when no events exist', async () => {
    await renderSeasonalEvents();
    expect(screen.getByText('No events right now')).toBeTruthy();
    expect(screen.getByText(/Stay tuned for exciting seasonal challenges/)).toBeTruthy();
  });

  // ── How Events Work ──
  test('renders How Events Work section', async () => {
    await renderSeasonalEvents();
    expect(screen.getByText('How Events Work')).toBeTruthy();
  });

  test('renders event explanation items', async () => {
    await renderSeasonalEvents();
    expect(screen.getByText(/Participate in limited-time challenges/)).toBeTruthy();
    expect(screen.getByText(/Earn bonus XP during event periods/)).toBeTruthy();
    expect(screen.getByText(/Unlock exclusive event badges/)).toBeTruthy();
    expect(screen.getByText(/Compete on event-specific leaderboards/)).toBeTruthy();
  });

  // ── XP Multiplier Banner ──
  test('shows XP multiplier banner when multiplier > 1', async () => {
    mockApiResult = {
      activeEvents: [],
      upcomingEvents: [],
      currentXpMultiplier: 2,
    };
    await renderSeasonalEvents();
    expect(screen.getByText('2x XP Active!')).toBeTruthy();
    expect(screen.getByText('All check-ins earn bonus XP right now')).toBeTruthy();
  });

  test('hides XP multiplier banner when multiplier is 1', async () => {
    await renderSeasonalEvents();
    expect(screen.queryByText(/XP Active!/)).toBeNull();
  });

  // ── Active Events ──
  test('renders Live Now section with active events', async () => {
    mockApiResult = {
      activeEvents: [
        {
          id: 'e1',
          title: 'Winter Streak Challenge',
          description: 'Keep your streak alive through winter!',
          theme_emoji: '❄️',
          theme_color: '#4FC3F7',
          xp_multiplier: '1.5',
          badge_reward: 'Winter Warrior',
          end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        },
      ],
      upcomingEvents: [],
      currentXpMultiplier: 1.5,
    };
    await renderSeasonalEvents();
    expect(screen.getByText('Winter Streak Challenge')).toBeTruthy();
    expect(screen.getByText('Keep your streak alive through winter!')).toBeTruthy();
  });

  test('shows XP multiplier tag on active event', async () => {
    mockApiResult = {
      activeEvents: [
        {
          id: 'e1',
          title: 'Test Event',
          xp_multiplier: '2',
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
      upcomingEvents: [],
      currentXpMultiplier: 2,
    };
    await renderSeasonalEvents();
    expect(screen.getByText('2x XP')).toBeTruthy();
  });

  test('shows badge reward tag on active event', async () => {
    mockApiResult = {
      activeEvents: [
        {
          id: 'e1',
          title: 'Test Event',
          xp_multiplier: '1',
          badge_reward: 'Champion Badge',
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
      upcomingEvents: [],
      currentXpMultiplier: 1,
    };
    await renderSeasonalEvents();
    expect(screen.getByText('Champion Badge')).toBeTruthy();
  });

  test('shows Join Event button on active events', async () => {
    mockApiResult = {
      activeEvents: [
        {
          id: 'e1',
          title: 'Test Event',
          xp_multiplier: '1',
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
      upcomingEvents: [],
      currentXpMultiplier: 1,
    };
    await renderSeasonalEvents();
    expect(screen.getByText('Join Event')).toBeTruthy();
  });

  // ── Upcoming Events ──
  test('renders Coming Soon section with upcoming events', async () => {
    mockApiResult = {
      activeEvents: [],
      upcomingEvents: [
        {
          id: 'e2',
          title: 'Spring Showdown',
          theme_emoji: '🌸',
          start_date: new Date(Date.now() + 86400000 * 7).toISOString(),
        },
      ],
      currentXpMultiplier: 1,
    };
    await renderSeasonalEvents();
    expect(screen.getByText('Spring Showdown')).toBeTruthy();
  });

  test('shows time until for upcoming events', async () => {
    mockApiResult = {
      activeEvents: [],
      upcomingEvents: [
        {
          id: 'e2',
          title: 'Spring Showdown',
          theme_emoji: '🌸',
          start_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        },
      ],
      currentXpMultiplier: 1,
    };
    await renderSeasonalEvents();
    expect(screen.getByText(/Starts in 5 days/)).toBeTruthy();
  });

  // ── Active + Upcoming together ──
  test('renders both active and upcoming sections', async () => {
    mockApiResult = {
      activeEvents: [
        {
          id: 'e1',
          title: 'Active Challenge',
          xp_multiplier: '1',
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
      upcomingEvents: [
        {
          id: 'e2',
          title: 'Future Event',
          start_date: new Date(Date.now() + 86400000 * 10).toISOString(),
        },
      ],
      currentXpMultiplier: 1,
    };
    await renderSeasonalEvents();
    expect(screen.getByText('Active Challenge')).toBeTruthy();
    expect(screen.getByText('Future Event')).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/seasonal-events.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Renders without crash ──
  test('renders without crashing and produces output', async () => {
    const { container } = await renderSeasonalEvents();
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(50);
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/seasonal-events.jsx');
    const SeasonalEventsScreen = mod.default;
    const { rerender } = render(<SeasonalEventsScreen />);
    expect(() => rerender(<SeasonalEventsScreen />)).not.toThrow();
  });
});
