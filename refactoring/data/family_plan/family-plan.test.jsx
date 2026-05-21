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
  ArrowLeft: () => null,
  Users: () => null,
  Crown: () => null,
  UserPlus: () => null,
  UserMinus: () => null,
  Search: () => null,
  Shield: () => null,
}));

vi.mock('expo-image', () => ({
  Image: ({ source, ...props }) => <img src={source?.uri || ''} {...props} />,
}));

const mockRouterBack = vi.fn();
const mockRouterPush = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: mockRouterPush }),
}));

// ── Mock API and user hooks ──
let mockApiGetResult = {};
const mockApiPost = vi.fn().mockResolvedValue({});
const mockApiGet = vi.fn().mockImplementation(async (path) => {
  return mockApiGetResult[path] || {};
});

vi.mock('@/utils/api', () => ({
  default: {
    get: (...args) => mockApiGet(...args),
    post: (...args) => mockApiPost(...args),
  },
}));

let mockUser = { id: 'user-1', display_name: 'TestUser' };
let mockUserLoading = false;
vi.mock('@/utils/auth/useUser', () => ({
  default: () => ({ data: mockUser, loading: mockUserLoading }),
}));

let mockIsSubscribed = true;
vi.mock('@/utils/useInAppPurchase', () => ({
  default: () => ({ isSubscribed: mockIsSubscribed }),
}));

async function renderFamilyPlan() {
  // Reset the api mock to return appropriate data
  mockApiGet.mockImplementation(async (path) => {
    if (path === '/family') return mockApiGetResult['/family'] || { hasGroup: false };
    return {};
  });
  const mod = await import('./src/app/family-plan.jsx');
  const FamilyPlanScreen = mod.default;
  return render(<FamilyPlanScreen />);
}

describe('FamilyPlanScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 'user-1', display_name: 'TestUser' };
    mockUserLoading = false;
    mockIsSubscribed = true;
    mockApiGetResult = {};
  });

  // ── Header ──
  test('renders Family & Teams header', async () => {
    await renderFamilyPlan();
    expect(screen.getByText('Family & Teams')).toBeTruthy();
  });

  test('renders subtitle', async () => {
    await renderFamilyPlan();
    expect(screen.getByText('Build habits together')).toBeTruthy();
  });

  // ── No group state ──
  test('shows Better Together CTA when no group exists', async () => {
    await renderFamilyPlan();
    expect(screen.getByText('Better Together')).toBeTruthy();
  });

  test('shows group name input placeholder', async () => {
    await renderFamilyPlan();
    expect(screen.getByPlaceholderText('Group name (optional)')).toBeTruthy();
  });

  test('shows Family Plan option', async () => {
    await renderFamilyPlan();
    expect(screen.getByText('Family Plan')).toBeTruthy();
    expect(screen.getByText('Up to 5 members')).toBeTruthy();
  });

  test('shows Team Plan option', async () => {
    await renderFamilyPlan();
    expect(screen.getByText('Team Plan')).toBeTruthy();
    expect(screen.getByText('Up to 10 members')).toBeTruthy();
  });

  // ── Premium gate for non-subscribers ──
  test('shows premium info when not subscribed', async () => {
    mockIsSubscribed = false;
    await renderFamilyPlan();
    expect(screen.getByText(/Premium subscription required/)).toBeTruthy();
  });

  // ── Owned group view ──
  test('shows owned group name and member info', async () => {
    mockApiGetResult['/family'] = {
      hasGroup: true,
      ownedGroup: {
        id: 'g1',
        name: 'My Family',
        group_type: 'family',
        member_count: 3,
        max_members: 5,
      },
      members: [
        { id: 'm1', user_id: 'u2', display_name: 'Alice', level_number: 5, xp_points: 250 },
      ],
    };
    await renderFamilyPlan();
    expect(screen.getByText('My Family')).toBeTruthy();
    expect(screen.getByText(/3\/5 members/)).toBeTruthy();
  });

  test('shows search input for inviting users in owned group', async () => {
    mockApiGetResult['/family'] = {
      hasGroup: true,
      ownedGroup: { id: 'g1', name: 'My Family', group_type: 'family', max_members: 5 },
      members: [],
    };
    await renderFamilyPlan();
    expect(screen.getByPlaceholderText('Search users to invite...')).toBeTruthy();
  });

  test('shows Members heading in owned group', async () => {
    mockApiGetResult['/family'] = {
      hasGroup: true,
      ownedGroup: { id: 'g1', name: 'My Family', group_type: 'family', max_members: 5 },
      members: [],
    };
    await renderFamilyPlan();
    expect(screen.getByText('Members')).toBeTruthy();
  });

  test('shows empty members message when no members', async () => {
    mockApiGetResult['/family'] = {
      hasGroup: true,
      ownedGroup: { id: 'g1', name: 'My Family', group_type: 'family', max_members: 5 },
      members: [],
    };
    await renderFamilyPlan();
    expect(screen.getByText(/No members yet/)).toBeTruthy();
  });

  test('renders member with display name and stats', async () => {
    mockApiGetResult['/family'] = {
      hasGroup: true,
      ownedGroup: { id: 'g1', name: 'Team', group_type: 'team', max_members: 10 },
      members: [
        { id: 'm1', user_id: 'u2', display_name: 'Bob', level_number: 3, xp_points: 100 },
      ],
    };
    await renderFamilyPlan();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText(/Level 3.*100 XP/)).toBeTruthy();
  });

  // ── Member group view ──
  test('shows member group info with owner name', async () => {
    mockApiGetResult['/family'] = {
      hasGroup: true,
      ownedGroup: null,
      memberGroup: {
        id: 'g2',
        name: 'The Smiths',
        owner_name: 'Dad',
        member_count: 4,
      },
      members: [],
    };
    await renderFamilyPlan();
    expect(screen.getByText('The Smiths')).toBeTruthy();
    expect(screen.getByText(/Created by Dad/)).toBeTruthy();
  });

  test('shows Leave Group button for member view', async () => {
    mockApiGetResult['/family'] = {
      hasGroup: true,
      ownedGroup: null,
      memberGroup: { id: 'g2', name: 'The Smiths', owner_name: 'Dad', member_count: 4 },
      members: [],
    };
    await renderFamilyPlan();
    expect(screen.getByText('Leave Group')).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/family-plan.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Renders without crash ──
  test('renders without crashing and produces output', async () => {
    const { container } = await renderFamilyPlan();
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(50);
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/family-plan.jsx');
    const FamilyPlanScreen = mod.default;
    const { rerender } = render(<FamilyPlanScreen />);
    expect(() => rerender(<FamilyPlanScreen />)).not.toThrow();
  });
});
