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
    RefreshControl: () => null,
    Animated: {
      View: ({ children, ...props }) => <div {...props}>{children}</div>,
      Value: class { interpolate() { return this; } },
    },
    Platform: { OS: 'ios' },
    KeyboardAvoidingView: ({ children, ...props }) => <div {...props}>{children}</div>,
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
  Send: () => null,
  SmilePlus: () => null,
  Reply: () => null,
  BookOpen: () => null,
  X: () => null,
  Users: () => null,
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
  selectionAsync: vi.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

vi.mock('date-fns', () => ({
  format: (date, fmt) => {
    if (fmt === 'yyyy-MM-dd') return '2025-01-15';
    if (fmt === 'h:mm a') return '10:00 AM';
    if (fmt === 'EEEE, MMM d') return 'Wednesday, Jan 15';
    return '2025-01-15';
  },
  isToday: () => false,
  isYesterday: () => false,
}));

const mockRouterBack = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: vi.fn() }),
  useLocalSearchParams: () => ({ groupId: 'group-123' }),
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

const mockResponses = [
  {
    id: 'r1',
    user_id: 'user-1',
    first_name: 'John',
    user_name: 'john_doe',
    avatar: 'dove',
    response_text: 'This passage really spoke to me about grace.',
    reflection_question: 'What stood out to you?',
    scripture_reference: 'John 3:16',
    week_number: 1,
    day_number: 3,
    created_at: '2025-01-15T10:00:00Z',
    reactions: [{ emoji: '🙏', user_name: 'Jane', user_id: 'user-2' }],
    replies: [],
  },
  {
    id: 'r2',
    user_id: 'user-2',
    first_name: 'Jane',
    user_name: 'jane_doe',
    avatar: 'fish',
    response_text: 'I found comfort in knowing God\'s love is unconditional.',
    reflection_question: 'How does this apply to your life?',
    scripture_reference: 'Romans 8:28',
    week_number: 1,
    day_number: 4,
    created_at: '2025-01-15T14:00:00Z',
    reactions: [],
    replies: [
      {
        id: 'rp1',
        user_id: 'user-1',
        user_name: 'john_doe',
        avatar: 'dove',
        reply_text: 'Amen! That is so true.',
        created_at: '2025-01-15T15:00:00Z',
      },
    ],
  },
];

async function renderGroupConversation() {
  const mod = await import('./src/app/[groupId].jsx');
  const GroupConversation = mod.default;
  return render(<GroupConversation />);
}

describe('GroupConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryResults = {};
  });

  // ── Loading state ──
  test('shows loading indicator while data loads', async () => {
    queryResults['group-conversation'] = { data: undefined, isLoading: true, refetch: vi.fn() };
    await renderGroupConversation();
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  // ── Empty state ──
  test('shows empty state when no responses exist', async () => {
    queryResults['group-conversation'] = {
      data: { responses: [], group: { name: 'Faith Group' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('No responses yet')).toBeTruthy();
  });

  // ── Header ──
  test('renders group name in header', async () => {
    queryResults['group-conversation'] = {
      data: { responses: [], group: { name: 'Bible Study' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('Bible Study')).toBeTruthy();
  });

  test('renders module title in header when provided', async () => {
    queryResults['group-conversation'] = {
      data: {
        responses: [],
        group: { name: 'Bible Study', module_title: 'The Gospel of John' },
        currentUserId: 'user-1',
      },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('The Gospel of John')).toBeTruthy();
  });

  test('shows fallback "Group" when name is missing', async () => {
    queryResults['group-conversation'] = {
      data: { responses: [], group: {}, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('Group')).toBeTruthy();
  });

  // ── Messages ──
  test('renders response text from messages', async () => {
    queryResults['group-conversation'] = {
      data: { responses: mockResponses, group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('This passage really spoke to me about grace.')).toBeTruthy();
    expect(screen.getByText("I found comfort in knowing God's love is unconditional.")).toBeTruthy();
  });

  test('renders reflection questions', async () => {
    queryResults['group-conversation'] = {
      data: { responses: mockResponses, group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('What stood out to you?')).toBeTruthy();
    expect(screen.getByText('How does this apply to your life?')).toBeTruthy();
  });

  test('renders scripture references', async () => {
    queryResults['group-conversation'] = {
      data: { responses: mockResponses, group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText(/John 3:16/)).toBeTruthy();
    expect(screen.getByText(/Romans 8:28/)).toBeTruthy();
  });

  test('renders display name for other users messages', async () => {
    queryResults['group-conversation'] = {
      data: { responses: mockResponses, group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    // Jane's message should show her name (she is not currentUser)
    expect(screen.getByText('Jane')).toBeTruthy();
  });

  // ── Reactions ──
  test('renders reaction emoji on messages', async () => {
    queryResults['group-conversation'] = {
      data: { responses: mockResponses, group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('🙏')).toBeTruthy();
  });

  // ── Replies ──
  test('renders reply text in thread', async () => {
    queryResults['group-conversation'] = {
      data: { responses: mockResponses, group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('Amen! That is so true.')).toBeTruthy();
  });

  // ── Date labels ──
  test('renders date labels between messages', async () => {
    queryResults['group-conversation'] = {
      data: { responses: mockResponses, group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(screen.getByText('Wednesday, Jan 15')).toBeTruthy();
  });

  // ── Empty message explanation ──
  test('shows explanation text in empty state', async () => {
    queryResults['group-conversation'] = {
      data: { responses: [], group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    await renderGroupConversation();
    expect(
      screen.getByText(/When group members respond to journal prompts/)
    ).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/[groupId].jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Renders without crash ──
  test('renders without crashing and produces output', async () => {
    queryResults['group-conversation'] = {
      data: { responses: [], group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    const { container } = await renderGroupConversation();
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(50);
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    queryResults['group-conversation'] = {
      data: { responses: [], group: { name: 'G' }, currentUserId: 'user-1' },
      isLoading: false,
      refetch: vi.fn(),
    };
    const mod = await import('./src/app/[groupId].jsx');
    const GroupConversation = mod.default;
    const { rerender } = render(<GroupConversation />);
    expect(() => rerender(<GroupConversation />)).not.toThrow();
  });
});
