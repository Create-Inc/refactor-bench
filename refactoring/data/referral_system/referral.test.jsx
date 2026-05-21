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
  ArrowLeft: () => null,
  Gift: () => null,
  Users: () => null,
  Copy: () => null,
  Share2: () => null,
  Trophy: () => null,
  Award: () => null,
  Star: () => null,
  Crown: () => null,
}));

vi.mock('expo-clipboard', () => ({
  setStringAsync: vi.fn().mockResolvedValue(undefined),
}));

const mockRouterBack = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: vi.fn() }),
}));

// ── Mock user and API ──
let mockUser = { id: 'user-1' };
let mockUserLoading = false;
vi.mock('@/utils/auth/useUser', () => ({
  default: () => ({ data: mockUser, loading: mockUserLoading }),
}));

const mockApiGet = vi.fn().mockResolvedValue({
  referralCode: 'ABC123',
  totalReferrals: 5,
  rewards: [
    { name: 'Community Builder', emoji: '🌟', threshold: 1, freezes: 0, unlocked: true, claimed: true, canClaim: false },
    { name: 'Motivator', emoji: '⭐', threshold: 3, freezes: 2, unlocked: true, claimed: false, canClaim: true },
    { name: 'Ambassador', emoji: '🏆', threshold: 10, freezes: 5, unlocked: false, claimed: false, canClaim: false },
  ],
});
const mockApiPost = vi.fn().mockResolvedValue({ success: true, reward: { name: 'Motivator' }, xpEarned: 100, freezesAwarded: 2 });

vi.mock('@/utils/api', () => ({
  default: {
    get: (...args) => mockApiGet(...args),
    post: (...args) => mockApiPost(...args),
  },
}));

async function renderReferral() {
  const mod = await import('./src/app/referral.jsx');
  const ReferralScreen = mod.default;
  return render(<ReferralScreen />);
}

describe('ReferralScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 'user-1' };
    mockUserLoading = false;
  });

  // ── Header ──
  test('renders header title', async () => {
    await renderReferral();
    expect(screen.getByText('Share & Earn Badges')).toBeTruthy();
  });

  test('renders header subtitle', async () => {
    await renderReferral();
    expect(screen.getByText('Unlock exclusive cosmetic profile rewards')).toBeTruthy();
  });

  // ── Not logged in ──
  test('shows login prompt when user is not logged in', async () => {
    mockUser = null;
    await renderReferral();
    expect(screen.getByText('Please log in to access referral program')).toBeTruthy();
    expect(screen.getByText('Go Back')).toBeTruthy();
  });

  // ── Hero section ──
  test('renders Build Your Community hero text', async () => {
    await renderReferral();
    expect(screen.getByText('Build Your Community')).toBeTruthy();
  });

  test('renders Your Referral Code label', async () => {
    await renderReferral();
    expect(screen.getByText('Your Referral Code')).toBeTruthy();
  });

  test('renders referral code value', async () => {
    await renderReferral();
    expect(screen.getByText('ABC123')).toBeTruthy();
  });

  // ── Copy and Share buttons ──
  test('renders Copy Code button', async () => {
    await renderReferral();
    expect(screen.getByText('Copy Code')).toBeTruthy();
  });

  test('renders Share button', async () => {
    await renderReferral();
    expect(screen.getByText('Share')).toBeTruthy();
  });

  // ── Stats ──
  test('renders Friends Joined stat', async () => {
    await renderReferral();
    expect(screen.getByText('Friends Joined')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  test('renders Rewards Claimed stat', async () => {
    await renderReferral();
    expect(screen.getByText('Rewards Claimed')).toBeTruthy();
  });

  // ── Rewards ladder ──
  test('renders Unlock Rewards section', async () => {
    await renderReferral();
    expect(screen.getByText('Unlock Rewards')).toBeTruthy();
    expect(screen.getByText(/Earn badges, freezes, and XP/)).toBeTruthy();
  });

  test('renders reward names', async () => {
    await renderReferral();
    expect(screen.getByText(/Community Builder/)).toBeTruthy();
    expect(screen.getByText(/Motivator/)).toBeTruthy();
    expect(screen.getByText(/Ambassador/)).toBeTruthy();
  });

  test('shows CLAIMED badge for claimed rewards', async () => {
    await renderReferral();
    expect(screen.getByText(/CLAIMED/)).toBeTruthy();
  });

  test('shows Claim button for claimable rewards', async () => {
    await renderReferral();
    expect(screen.getByText(/Claim!/)).toBeTruthy();
  });

  test('shows remaining count for locked rewards', async () => {
    await renderReferral();
    expect(screen.getByText('5 more')).toBeTruthy();
  });

  // ── How it Works ──
  test('renders How It Works section', async () => {
    await renderReferral();
    expect(screen.getByText('How It Works')).toBeTruthy();
  });

  test('renders referral steps', async () => {
    await renderReferral();
    expect(screen.getByText(/Share your progress and invite friends/)).toBeTruthy();
    expect(screen.getByText(/Friends use your code/)).toBeTruthy();
  });

  test('renders optional note about referrals', async () => {
    await renderReferral();
    expect(screen.getByText(/Referrals are completely optional/)).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/referral.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/referral.jsx');
    const ReferralScreen = mod.default;
    const { rerender } = render(<ReferralScreen />);
    expect(() => rerender(<ReferralScreen />)).not.toThrow();
  });
});
