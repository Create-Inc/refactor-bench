import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mock React Native primitives ──
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children, ...props }) => <div {...props}>{children}</div>,
    Text: ({ children, ...props }) => <span {...props}>{children}</span>,
    TextInput: ({ value, onChangeText, placeholder, ...props }) => (
      <input
        value={value || ''}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
    ),
    FlatList: ({ data, renderItem, ListEmptyComponent, keyExtractor }) => (
      <div data-testid="flat-list">
        {data && data.length > 0
          ? data.map((item, index) => (
              <div key={keyExtractor?.(item) || index}>
                {renderItem({ item, index })}
              </div>
            ))
          : ListEmptyComponent}
      </div>
    ),
    TouchableOpacity: ({ children, onPress, disabled, ...props }) => (
      <button onClick={disabled ? undefined : onPress} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Alert: { alert: vi.fn() },
    Modal: ({ visible, children }) =>
      visible ? <div data-testid="modal">{children}</div> : null,
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('lucide-react-native', () => ({
  Search: () => null,
  Shield: () => null,
  ArrowUpRight: () => null,
  ArrowDownLeft: () => null,
  Calendar: () => null,
  X: () => null,
  DollarSign: () => null,
  FileText: () => null,
  Users: () => null,
}));

vi.mock('@/components/TrustMeter', () => ({
  default: ({ score }) => <div data-testid="trust-meter">Score: {score}</div>,
}));

// ── Auth mock ──
const mockUser = { value: { id: 'user-1' }, loading: false };
vi.mock('@/utils/auth/useUser', () => ({
  default: () => ({
    data: mockUser.value,
    loading: mockUser.loading,
  }),
}));

// ── React Query mock ──
let queryResults = {};
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }) => {
    const key = queryKey[0];
    return queryResults[key] || { data: undefined, isLoading: false };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// ── Helpers ──
const mockUsers = [
  {
    id: 'u2',
    username: 'alice_lender',
    full_name: 'Alice Johnson',
    trust_score: 85,
    interest_rate: 5,
    verified: true,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'u3',
    username: 'bob_borrows',
    full_name: 'Bob Smith',
    trust_score: 42,
    interest_rate: 12,
    verified: false,
    created_at: '2024-06-20T00:00:00Z',
  },
  {
    id: 'u4',
    username: 'charlie',
    full_name: null,
    trust_score: 15,
    interest_rate: 20,
    verified: false,
    created_at: '2024-09-01T00:00:00Z',
  },
];

async function renderSearch() {
  const mod = await import('./src/app/search.jsx');
  const SearchScreen = mod.default;
  return render(<SearchScreen />);
}

describe('SearchScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.value = { id: 'user-1' };
    mockUser.loading = false;
    queryResults = {};
  });

  // ── Loading state ──
  test('shows Loading... while user is loading', async () => {
    mockUser.loading = true;
    mockUser.value = null;
    await renderSearch();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  test('shows Loading... when no userId', async () => {
    mockUser.value = null;
    await renderSearch();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  // ── Main header ──
  test('renders Search header and subtitle', async () => {
    queryResults['all-users'] = { data: [] };
    await renderSearch();
    expect(screen.getByText('Search')).toBeTruthy();
    expect(
      screen.getByText('Find people to lend to or borrow from.')
    ).toBeTruthy();
  });

  // ── Search input ──
  test('renders search input with placeholder', async () => {
    queryResults['all-users'] = { data: [] };
    await renderSearch();
    expect(
      screen.getByPlaceholderText('Search by username...')
    ).toBeTruthy();
  });

  // ── Empty state ──
  test('shows "No users found" when list is empty', async () => {
    queryResults['all-users'] = { data: [] };
    await renderSearch();
    expect(screen.getByText('No users found')).toBeTruthy();
    expect(screen.getByText('Try a different search term.')).toBeTruthy();
  });

  // ── User list rendering ──
  test('renders user cards with usernames', async () => {
    queryResults['all-users'] = { data: mockUsers };
    await renderSearch();
    expect(screen.getByText('@alice_lender')).toBeTruthy();
    expect(screen.getByText('@bob_borrows')).toBeTruthy();
    expect(screen.getByText('@charlie')).toBeTruthy();
  });

  test('displays full name for users who have one', async () => {
    queryResults['all-users'] = { data: mockUsers };
    await renderSearch();
    expect(screen.getByText('Alice Johnson')).toBeTruthy();
    expect(screen.getByText('Bob Smith')).toBeTruthy();
  });

  test('displays trust score percentage', async () => {
    queryResults['all-users'] = { data: mockUsers };
    await renderSearch();
    expect(screen.getByText('85%')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
    expect(screen.getByText('15%')).toBeTruthy();
  });

  test('displays interest rate', async () => {
    queryResults['all-users'] = { data: mockUsers };
    await renderSearch();
    expect(screen.getByText('5% rate')).toBeTruthy();
    expect(screen.getByText('12% rate')).toBeTruthy();
    expect(screen.getByText('20% rate')).toBeTruthy();
  });

  // ── User expansion (selected user) ──
  test('shows Lend and Request buttons when user is selected', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    // Click on user to select them
    fireEvent.click(screen.getByText('@alice_lender'));
    // Expanded view should show Lend and Request buttons
    expect(screen.getByText('Lend')).toBeTruthy();
    expect(screen.getByText('Request')).toBeTruthy();
  });

  test('shows TrustMeter when user is selected', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    expect(screen.getByTestId('trust-meter')).toBeTruthy();
  });

  test('shows interest rate detail when user is selected', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    expect(screen.getByText('Interest Rate: 5%')).toBeTruthy();
  });

  test('shows Verified badge for verified users when expanded', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    expect(screen.getByText('Verified')).toBeTruthy();
  });

  // ── Lend Modal ──
  test('opens Lend modal when Lend button is pressed', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    fireEvent.click(screen.getByText('Lend'));
    expect(screen.getByText('Lend to @alice_lender')).toBeTruthy();
    expect(screen.getByText('Amount to Lend')).toBeTruthy();
    expect(screen.getByText('Loan Duration (days)')).toBeTruthy();
  });

  test('lend modal has Confirm Loan button', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    fireEvent.click(screen.getByText('Lend'));
    expect(screen.getByText('Confirm Loan')).toBeTruthy();
  });

  // ── Request Modal ──
  test('opens Request modal when Request button is pressed', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    fireEvent.click(screen.getByText('Request'));
    expect(screen.getByText('Request from @alice_lender')).toBeTruthy();
    expect(screen.getByText('Amount Needed')).toBeTruthy();
    expect(screen.getByText('Reason for Loan')).toBeTruthy();
  });

  test('request modal has Post Loan Request button', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    fireEvent.click(screen.getByText('Request'));
    expect(screen.getByText('Post Loan Request')).toBeTruthy();
  });

  test('request modal shows a note about public loan request', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    fireEvent.click(screen.getByText('Request'));
    expect(screen.getByText('Note')).toBeTruthy();
    expect(
      screen.getByText(/This will create a public loan request/)
    ).toBeTruthy();
  });

  test('request modal has reason text input with placeholder', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    fireEvent.click(screen.getByText('Request'));
    expect(
      screen.getByPlaceholderText('Explain why you need this loan...')
    ).toBeTruthy();
  });

  // ── Search filtering ──
  test('filters users by search query', async () => {
    queryResults['all-users'] = { data: mockUsers };
    await renderSearch();
    const searchInput = screen.getByPlaceholderText('Search by username...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    expect(screen.getByText('@alice_lender')).toBeTruthy();
    expect(screen.queryByText('@bob_borrows')).toBeNull();
    expect(screen.queryByText('@charlie')).toBeNull();
  });

  // ── Deselect user ──
  test('deselects user when expanded user is clicked again', async () => {
    queryResults['all-users'] = { data: [mockUsers[0]] };
    await renderSearch();
    fireEvent.click(screen.getByText('@alice_lender'));
    expect(screen.getByText('Lend')).toBeTruthy();
    // Click the expanded area to deselect (click on TrustMeter area)
    fireEvent.click(screen.getByTestId('trust-meter'));
    // After deselect, Lend/Request buttons should be gone
    expect(screen.queryByText('Lend')).toBeNull();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/search.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── First letter avatar ──
  test('shows first letter of username as avatar', async () => {
    queryResults['all-users'] = {
      data: [{ ...mockUsers[0], username: 'Zara' }],
    };
    await renderSearch();
    expect(screen.getByText('Z')).toBeTruthy();
  });
});
