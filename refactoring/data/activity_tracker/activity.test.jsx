import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mock React Native primitives ──
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children, ...props }) => <div {...props}>{children}</div>,
    Text: ({ children, ...props }) => <span {...props}>{children}</span>,
    FlatList: ({ data, renderItem, keyExtractor, ListEmptyComponent, ...props }) => {
      if (!data || data.length === 0) {
        return <div data-testid="flatlist-empty">{ListEmptyComponent}</div>;
      }
      return (
        <div data-testid="flatlist">
          {data.map((item, index) => (
            <div key={keyExtractor ? keyExtractor(item) : index}>
              {renderItem({ item, index })}
            </div>
          ))}
        </div>
      );
    },
    TouchableOpacity: ({ children, onPress, disabled, ...props }) => (
      <button onClick={disabled ? undefined : onPress} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    RefreshControl: () => null,
    Animated: {
      View: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('lucide-react-native', () => ({
  ArrowUpRight: () => null,
  ArrowDownLeft: () => null,
  TrendingUp: () => null,
  Award: () => null,
  Gift: () => null,
  Bell: () => null,
  Clock: () => null,
  CheckCheck: () => null,
  Filter: () => null,
  FileText: () => null,
  Activity: () => null,
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
  selectionAsync: vi.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

let mockUser = { id: 'user-1' };
let mockUserLoading = false;
vi.mock('@/utils/auth/useUser', () => ({
  default: () => ({ data: mockUser, loading: mockUserLoading }),
}));

// ── React Query mock ──
let queryResults = {};
const mockMutate = vi.fn();

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
    invalidateQueries: vi.fn(),
  }),
}));

const mockActivities = [
  {
    id: 'a1',
    activity_type: 'loan_funded',
    title: 'Loan Funded',
    description: 'You funded a $50 loan to Bob',
    amount: '50',
    trust_change: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'a2',
    activity_type: 'trust_change',
    title: 'Trust Increased',
    description: 'Your trust score went up',
    amount: null,
    trust_change: 5,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'a3',
    activity_type: 'badge_earned',
    title: 'Badge Earned',
    description: 'You earned the Reliable badge',
    amount: null,
    trust_change: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const mockNotifications = [
  {
    id: 'n1',
    title: 'Payment Due',
    body: 'Your loan payment is due tomorrow',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Loan Approved',
    body: 'Your loan request was approved',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

async function renderActivity() {
  const mod = await import('./src/app/activity.jsx');
  const ActivityScreen = mod.default;
  return render(<ActivityScreen />);
}

describe('ActivityScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 'user-1' };
    mockUserLoading = false;
    queryResults = {
      activity: { data: mockActivities, isLoading: false, refetch: vi.fn() },
      notifications: {
        data: { notifications: mockNotifications, unreadCount: 1 },
        isLoading: false,
        refetch: vi.fn(),
      },
    };
  });

  // ── Header ──
  test('renders Activity header', async () => {
    await renderActivity();
    expect(screen.getByText('Activity')).toBeTruthy();
  });

  // ── Loading state ──
  test('shows Loading text when user is loading', async () => {
    mockUserLoading = true;
    await renderActivity();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  // ── Tabs ──
  test('renders Timeline and Notifications tabs', async () => {
    await renderActivity();
    expect(screen.getByText('Timeline')).toBeTruthy();
    expect(screen.getByText('Notifications')).toBeTruthy();
  });

  test('shows unread count badge on notifications tab', async () => {
    await renderActivity();
    expect(screen.getByText('1')).toBeTruthy();
  });

  // ── Filters ──
  test('renders filter buttons on activity tab', async () => {
    await renderActivity();
    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.getByText('Loans')).toBeTruthy();
    expect(screen.getByText('Trust')).toBeTruthy();
    expect(screen.getByText('Badges')).toBeTruthy();
  });

  // ── Activity items ──
  test('renders activity titles', async () => {
    await renderActivity();
    expect(screen.getByText('Loan Funded')).toBeTruthy();
    expect(screen.getByText('Trust Increased')).toBeTruthy();
    expect(screen.getByText('Badge Earned')).toBeTruthy();
  });

  test('renders activity descriptions', async () => {
    await renderActivity();
    expect(screen.getByText('You funded a $50 loan to Bob')).toBeTruthy();
    expect(screen.getByText('Your trust score went up')).toBeTruthy();
  });

  test('shows amount badge for loan activities', async () => {
    await renderActivity();
    expect(screen.getByText('$50')).toBeTruthy();
  });

  test('shows trust change badge', async () => {
    await renderActivity();
    expect(screen.getByText('+5% trust')).toBeTruthy();
  });

  // ── Filtering ──
  test('filters activities when filter button is pressed', async () => {
    await renderActivity();
    fireEvent.click(screen.getByText('Badges'));
    // Only badge activity should remain
    expect(screen.getByText('Badge Earned')).toBeTruthy();
    expect(screen.queryByText('Loan Funded')).toBeNull();
  });

  // ── Empty activity state ──
  test('shows empty state when no activities', async () => {
    queryResults['activity'] = { data: [], isLoading: false, refetch: vi.fn() };
    await renderActivity();
    expect(screen.getByText('No activity yet')).toBeTruthy();
    expect(screen.getByText('Your transactions will appear here')).toBeTruthy();
  });

  // ── Notifications tab ──
  test('switches to notifications tab and shows items', async () => {
    await renderActivity();
    fireEvent.click(screen.getByText('Notifications'));
    expect(screen.getByText('Payment Due')).toBeTruthy();
    expect(screen.getByText('Loan Approved')).toBeTruthy();
  });

  test('shows mark all read button when unread notifications exist', async () => {
    await renderActivity();
    fireEvent.click(screen.getByText('Notifications'));
    expect(screen.getByText('Mark all read')).toBeTruthy();
  });

  test('shows notification body text', async () => {
    await renderActivity();
    fireEvent.click(screen.getByText('Notifications'));
    expect(screen.getByText('Your loan payment is due tomorrow')).toBeTruthy();
  });

  test('shows tap to mark as read for unread notifications', async () => {
    await renderActivity();
    fireEvent.click(screen.getByText('Notifications'));
    expect(screen.getByText('Tap to mark as read')).toBeTruthy();
  });

  // ── Empty notifications ──
  test('shows empty notifications state', async () => {
    queryResults['notifications'] = {
      data: { notifications: [], unreadCount: 0 },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderActivity();
    fireEvent.click(screen.getByText('Notifications'));
    expect(screen.getByText('All caught up!')).toBeTruthy();
    expect(screen.getByText('No notifications right now')).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/activity.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/activity.jsx');
    const ActivityScreen = mod.default;
    const { rerender } = render(<ActivityScreen />);
    expect(() => rerender(<ActivityScreen />)).not.toThrow();
  });
});
