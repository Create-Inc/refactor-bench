import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mock React Native primitives ──
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children, ...props }) => <div {...props}>{children}</div>,
    Text: ({ children, ...props }) => <span {...props}>{children}</span>,
    TouchableOpacity: ({ children, onPress, disabled, ...props }) => (
      <button onClick={disabled ? undefined : onPress} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Switch: ({ value, onValueChange, ...props }) => (
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onValueChange?.(e.target.checked)}
        data-testid="analytics-switch"
        {...props}
      />
    ),
    Animated: {
      View: ({ children, ...props }) => <div {...props}>{children}</div>,
      Value: class {
        interpolate({ inputRange, outputRange }) { return this; }
      },
      loop: (anim) => ({ start: vi.fn(), stop: vi.fn() }),
      sequence: (anims) => ({ start: vi.fn() }),
      timing: (value, config) => ({ start: vi.fn() }),
    },
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('lucide-react-native', () => ({
  Flame: () => null,
  Trophy: () => null,
  Shield: () => null,
  ArrowRight: () => null,
  CheckCircle: () => null,
  Users: () => null,
  Zap: () => null,
}));

vi.mock('expo-haptics', () => ({
  notificationAsync: vi.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));

const mockSetAnalyticsConsent = vi.fn().mockResolvedValue(undefined);
vi.mock('@/utils/analytics', () => ({
  setAnalyticsConsent: (...args) => mockSetAnalyticsConsent(...args),
}));

const mockRouterReplace = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockRouterReplace, back: vi.fn() }),
}));

async function renderOnboarding() {
  const mod = await import('./src/app/onboarding.jsx');
  const OnboardingScreen = mod.default;
  return render(<OnboardingScreen />);
}

describe('OnboardingScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── First screen content ──
  test('renders first onboarding screen title', async () => {
    await renderOnboarding();
    expect(screen.getByText('Build Unbreakable Streaks')).toBeTruthy();
  });

  test('renders first screen description', async () => {
    await renderOnboarding();
    expect(
      screen.getByText(/Track your daily habits and watch your streak grow/)
    ).toBeTruthy();
  });

  test('renders social proof on first screen', async () => {
    await renderOnboarding();
    expect(screen.getByText(/Join 50,000\+ people/)).toBeTruthy();
  });

  // ── Skip button ──
  test('renders Skip button on non-last screen', async () => {
    await renderOnboarding();
    expect(screen.getByText('Skip')).toBeTruthy();
  });

  // ── Next button ──
  test('renders Next button on first screen', async () => {
    await renderOnboarding();
    expect(screen.getByText('Next')).toBeTruthy();
  });

  // ── Navigation to second screen ──
  test('navigates to second screen on Next press', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Compete with Friends')).toBeTruthy();
  });

  test('shows social proof on second screen', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/10,000\+ active battles/)).toBeTruthy();
  });

  // ── Third screen (interactive) ──
  test('navigates to interactive check-in screen', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Your First Win!')).toBeTruthy();
    expect(screen.getByText('Tap to Check In!')).toBeTruthy();
  });

  test('Next is disabled on interactive screen until check-in done', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    // The Next button should be disabled (visually indicated by style)
    const nextBtn = screen.getByText('Next').closest('button');
    expect(nextBtn.disabled).toBe(true);
  });

  test('completing check-in shows success state', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Tap to Check In!'));
    expect(screen.getByText('First Check-In Complete!')).toBeTruthy();
    expect(screen.getByText('+25 XP')).toBeTruthy();
  });

  // ── Fourth screen (consent) ──
  test('navigates to consent screen after check-in', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Tap to Check In!'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Your Data, Your Choice')).toBeTruthy();
  });

  test('consent screen shows Help Improve LastUp toggle', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Tap to Check In!'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Help Improve LastUp')).toBeTruthy();
    expect(screen.getByTestId('analytics-switch')).toBeTruthy();
  });

  test('consent screen shows Get Started button', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Tap to Check In!'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Get Started')).toBeTruthy();
  });

  test('consent screen does not show Skip button', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Tap to Check In!'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.queryByText('Skip')).toBeNull();
  });

  test('Settings privacy text is shown on consent screen', async () => {
    await renderOnboarding();
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Tap to Check In!'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/Settings.*Data & Privacy/)).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/onboarding.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/onboarding.jsx');
    const OnboardingScreen = mod.default;
    const { rerender } = render(<OnboardingScreen />);
    expect(() => rerender(<OnboardingScreen />)).not.toThrow();
  });
});
