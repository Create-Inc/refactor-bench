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
    TextInput: ({ value, onChangeText, placeholder, onFocus, onBlur, editable, ...props }) => (
      <input
        value={value || ''}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={editable === false}
        {...props}
      />
    ),
    ActivityIndicator: () => <span data-testid="activity-indicator">Loading...</span>,
    Linking: { openURL: vi.fn() },
    Animated: {
      View: ({ children, ...props }) => <div {...props}>{children}</div>,
      Value: vi.fn().mockImplementation((v) => ({
        _value: v,
        interpolate: vi.fn().mockReturnThis(),
      })),
      timing: () => ({ start: vi.fn() }),
    },
    Platform: { OS: 'ios' },
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
  ChevronRight: () => null,
  ChevronDown: () => null,
  CheckCircle2: () => null,
  Lock: () => null,
  ExternalLink: () => null,
  BookOpen: () => null,
  Users: () => null,
  MessageSquare: () => null,
}));

vi.mock('date-fns', () => ({
  format: (date, fmt) => {
    const d = new Date(date);
    if (fmt === 'MMM d') return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}`;
    if (fmt === 'M/d') return `${d.getMonth()+1}/${d.getDate()}`;
    return d.toLocaleDateString();
  },
}));

vi.mock('@/components/KeyboardAvoidingAnimatedView', () => ({
  default: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

const mockRouter = { back: vi.fn() };
vi.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ assignmentId: 'assign-1' }),
}));

// ── React Query mock ──
let queryResults = {};
const mockMutate = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }) => {
    const key = queryKey[0];
    return queryResults[key] || { data: undefined, isLoading: false, error: null };
  },
  useMutation: ({ onSuccess }) => ({
    mutate: (vars) => {
      mockMutate(vars);
      if (onSuccess) onSuccess();
    },
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// ── Helpers ──
const makeDays = (count, completedCount = 0) =>
  Array.from({ length: count }, (_, i) => ({
    id: `day-${i + 1}`,
    day_number: i + 1,
    week_number: Math.ceil((i + 1) / 5),
    week_title: `Week ${Math.ceil((i + 1) / 5)} Title`,
    week_phase: null,
    scripture_reference: `John ${i + 1}:1-10`,
    content: `Content for day ${i + 1}`,
    reflection_question: `What did you learn on day ${i + 1}?`,
    response_text: i < completedCount ? `My response for day ${i + 1}` : null,
    responded_at: i < completedCount ? new Date().toISOString() : null,
  }));

async function renderJourney() {
  const mod = await import('./src/app/[assignmentId].jsx');
  const JourneyScreen = mod.default;
  return render(<JourneyScreen />);
}

describe('JourneyScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryResults = {};
  });

  // ── Loading state ──
  test('shows loading indicator while data is loading', async () => {
    queryResults['journey'] = { data: undefined, isLoading: true, error: null };
    await renderJourney();
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  // ── Error state ──
  test('shows error message when query fails', async () => {
    queryResults['journey'] = {
      data: undefined,
      isLoading: false,
      error: { message: 'Journey not found' },
    };
    await renderJourney();
    expect(screen.getByText('Journey not found')).toBeTruthy();
    expect(screen.getByText('Back to Dashboard')).toBeTruthy();
  });

  // ── Error state back button ──
  test('calls router.back when "Back to Dashboard" is pressed on error', async () => {
    queryResults['journey'] = {
      data: undefined,
      isLoading: false,
      error: { message: 'Journey not found' },
    };
    await renderJourney();
    fireEvent.click(screen.getByText('Back to Dashboard'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  // ── Journey not found fallback ──
  test('shows "Journey not found." when no error object but no data', async () => {
    queryResults['journey'] = { data: undefined, isLoading: false, error: null };
    await renderJourney();
    expect(screen.getByText('Journey not found.')).toBeTruthy();
  });

  // ── Main render with data ──
  test('renders assignment title', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'My Spiritual Journey', group_id: null },
        days: makeDays(10, 3),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('My Spiritual Journey')).toBeTruthy();
  });

  // ── Progress display ──
  test('shows correct progress percentage', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 5),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('5 of 10 days')).toBeTruthy();
  });

  // ── Current day scripture reference ──
  test('displays current day scripture reference', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 3),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    // Day 4 is the first unfinished
    expect(screen.getByText('John 4:1-10')).toBeTruthy();
  });

  // ── Current day content ──
  test('displays current day content', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 3),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('Content for day 4')).toBeTruthy();
  });

  // ── Reflection question ──
  test('displays current day reflection question', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 3),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('What did you learn on day 4?')).toBeTruthy();
  });

  // ── Response input placeholder ──
  test('renders response input with placeholder', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(
      screen.getByPlaceholderText('Write your response here... (minimum 25 characters)')
    ).toBeTruthy();
  });

  // ── Submit Response button ──
  test('shows Submit Response button', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('Submit Response')).toBeTruthy();
  });

  // ── Character count ──
  test('shows character count as 0 / 2,000 characters', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('0 / 2,000 characters')).toBeTruthy();
  });

  // ── Instructions toggle ──
  test('shows "How to Use This Guide" instructions toggle', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('How to Use This Guide')).toBeTruthy();
  });

  test('toggles instructions text on click', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    // Instructions should not be visible yet
    expect(screen.queryByText(/Prayerfully read/)).toBeNull();
    // Click to expand
    fireEvent.click(screen.getByText('How to Use This Guide'));
    expect(screen.getByText(/Prayerfully read/)).toBeTruthy();
  });

  // ── Today's Scripture header ──
  test('shows "Today\'s Scripture" header', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(5, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText("Today's Scripture")).toBeTruthy();
  });

  // ── Journey Timeline ──
  test('renders Journey Timeline section', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 3),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('Journey Timeline')).toBeTruthy();
  });

  // ── Module complete state ──
  test('shows Journey Complete when all days are finished', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'My Journey', group_id: null },
        days: makeDays(5, 5),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('Journey Complete')).toBeTruthy();
    expect(
      screen.getByText(/You have completed My Journey/)
    ).toBeTruthy();
  });

  // ── Group badge ──
  test('shows Group badge for group journeys', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Group Journey', group_id: 'grp-1' },
        days: makeDays(5, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('Group')).toBeTruthy();
  });

  test('does not show Group badge for individual journeys', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Solo Journey', group_id: null },
        days: makeDays(5, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.queryByText('Group')).toBeNull();
  });

  // ── Week info in subtitle ──
  test('shows week and day number in subtitle', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    // First day is week 1, day 1
    expect(screen.getByText(/Week 1.*Day 1/)).toBeTruthy();
  });

  // ── Back to Dashboard navigation link ──
  test('renders back link on main screen', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(5, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    // There should be a "Back to Dashboard" link in the header
    const backLinks = screen.getAllByText('Back to Dashboard');
    expect(backLinks.length).toBeGreaterThan(0);
  });

  // ── Read button for Bible ──
  test('renders a Read button to open scripture', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(5, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('Read')).toBeTruthy();
  });

  // ── Export check ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/[assignmentId].jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Progress at 0% ──
  test('shows 0% progress when no days completed', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(10, 0),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('0%')).toBeTruthy();
    expect(screen.getByText('0 of 10 days')).toBeTruthy();
  });

  // ── 100% progress ──
  test('shows 100% progress when all days completed', async () => {
    queryResults['journey'] = {
      data: {
        assignment: { title: 'Journey', group_id: null },
        days: makeDays(5, 5),
      },
      isLoading: false,
      error: null,
    };
    await renderJourney();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText('5 of 5 days')).toBeTruthy();
  });
});
