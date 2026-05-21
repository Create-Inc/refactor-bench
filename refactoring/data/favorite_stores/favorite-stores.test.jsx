import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mock React Native primitives ──
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children, ...props }) => <div {...props}>{children}</div>,
    Text: ({ children, ...props }) => <span {...props}>{children}</span>,
    ScrollView: ({ children, ...props }) => <div {...props}>{children}</div>,
    ActivityIndicator: () => <span data-testid="activity-indicator">Loading...</span>,
    Alert: { alert: vi.fn() },
    Platform: { OS: 'ios' },
  };
});

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

vi.mock('lucide-react-native', () => ({
  Store: () => null,
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
  },
}));

// ── Router mock ──
const mockRouterPush = vi.fn();
vi.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, back: vi.fn() }),
}));

// ── Stub child components ──
vi.mock('@/components/NearbyStoresModal', () => ({
  default: ({ visible, onClose }) =>
    visible ? <div data-testid="nearby-stores-modal"><button onClick={onClose}>Close Nearby</button></div> : null,
}));

vi.mock('@/components/FavoriteStores/FavoriteStoresHeader', () => ({
  default: ({ favoriteStoresCount, uncheckedItemsCount, onShowTips }) => (
    <div data-testid="favorite-stores-header">
      <span data-testid="fav-count">{favoriteStoresCount}</span>
      <span data-testid="unchecked-count">{uncheckedItemsCount}</span>
      <button data-testid="show-tips" onClick={onShowTips}>Tips</button>
    </div>
  ),
}));

vi.mock('@/components/FavoriteStores/FavoriteStoresList', () => ({
  default: ({ favoriteStores, onRemove, onDirections, onOrderFrom, onFindNearbyStores }) => (
    <div data-testid="favorite-stores-list">
      {favoriteStores.map((s) => (
        <div key={s.place_id} data-testid={`store-${s.place_id}`}>
          <span>{s.store_name}</span>
          <button onClick={() => onRemove(s)}>Remove {s.store_name}</button>
          <button onClick={() => onDirections(s)}>Directions</button>
          <button onClick={() => onOrderFrom(s)}>Order</button>
        </div>
      ))}
      <button onClick={onFindNearbyStores}>Find Nearby</button>
    </div>
  ),
}));

vi.mock('@/components/FavoriteStores/EmptyFavoritesState', () => ({
  default: ({ onFindNearbyStores, isRequestingLocation }) => (
    <div data-testid="empty-favorites">
      <span>No favorite stores yet</span>
      <button onClick={onFindNearbyStores} disabled={isRequestingLocation}>
        Find Nearby Stores
      </button>
    </div>
  ),
}));

vi.mock('@/components/FavoriteStores/OrderDeliverySection', () => ({
  default: ({ uncheckedItemsCount, onOrderAll }) => (
    <div data-testid="order-delivery-section">
      <span>{uncheckedItemsCount} items</span>
      <button onClick={onOrderAll}>Order All</button>
    </div>
  ),
}));

vi.mock('@/components/FavoriteStores/DeliveryServiceSheet', () => ({
  default: ({ visible, onClose, selectedStore, onServicePress }) =>
    visible ? (
      <div data-testid="delivery-service-sheet">
        <span>{selectedStore?.store_name || 'All Stores'}</span>
        <button onClick={onClose}>Close Sheet</button>
        <button onClick={() => onServicePress({ id: 'svc1' })}>Pick Service</button>
      </div>
    ) : null,
}));

vi.mock('@/components/FavoriteStores/OnboardingTooltip', () => ({
  default: ({ onDismiss }) => (
    <div data-testid="onboarding-tooltip">
      <span>Welcome tips</span>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}));

vi.mock('@/components/FavoriteStores/OptimizeRouteButton', () => ({
  default: () => <div data-testid="optimize-route" />,
}));

// ── Data hooks ──
const mockFavoriteStores = [
  { place_id: 'p1', store_name: 'Trader Joes' },
  { place_id: 'p2', store_name: 'Whole Foods' },
];
const mockRemoveFavorite = vi.fn();

let hookOverrides = {};

vi.mock('@/utils/useFavoriteStores', () => ({
  useFavoriteStores: () => ({
    favoriteStores: mockFavoriteStores,
    isLoading: false,
    error: null,
    removeFavorite: mockRemoveFavorite,
    ...hookOverrides,
  }),
}));

vi.mock('@/utils/useGroceryItems', () => ({
  useGroceryItems: () => ({
    uncheckedItems: [{ id: 'i1', name: 'Milk' }, { id: 'i2', name: 'Eggs' }],
  }),
}));

vi.mock('@/utils/useDeliveryServices', () => ({
  useDeliveryServices: () => ({
    deliveryServices: [{ id: 'svc1', name: 'Instacart' }],
  }),
}));

const mockRequestLocation = vi.fn().mockResolvedValue({ lat: 40.7, lng: -74.0 });
vi.mock('@/utils/useLocationActions', () => ({
  useLocationActions: () => ({
    userCoords: null,
    isRequestingLocation: false,
    handleDirections: vi.fn(),
    requestLocation: mockRequestLocation,
  }),
}));

const mockHandleOpenDeliveryService = vi.fn();
vi.mock('@/utils/useDeliveryActions', () => ({
  useDeliveryActions: () => ({
    handleOpenDeliveryService: mockHandleOpenDeliveryService,
  }),
}));

async function renderFavoriteStores() {
  const mod = await import('./src/app/favorite-stores.jsx');
  const FavoriteStoresScreen = mod.default;
  return render(<FavoriteStoresScreen />);
}

describe('FavoriteStoresScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookOverrides = {};
  });

  // ── Header ──
  test('renders FavoriteStoresHeader with correct counts', async () => {
    await renderFavoriteStores();
    expect(screen.getByTestId('favorite-stores-header')).toBeTruthy();
    expect(screen.getByTestId('fav-count').textContent).toBe('2');
    expect(screen.getByTestId('unchecked-count').textContent).toBe('2');
  });

  // ── Loading state ──
  test('shows loading indicator when stores are loading', async () => {
    hookOverrides = { isLoading: true, favoriteStores: [] };
    await renderFavoriteStores();
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    expect(screen.getByText('Loading your favorites...')).toBeTruthy();
  });

  // ── Error state ──
  test('shows error message when loading fails', async () => {
    hookOverrides = { error: new Error('Network error'), favoriteStores: [], isLoading: false };
    await renderFavoriteStores();
    expect(
      screen.getByText("Couldn't load your favorite stores.")
    ).toBeTruthy();
  });

  // ── Stores list ──
  test('renders favorite stores list', async () => {
    await renderFavoriteStores();
    expect(screen.getByTestId('favorite-stores-list')).toBeTruthy();
    expect(screen.getByText('Trader Joes')).toBeTruthy();
    expect(screen.getByText('Whole Foods')).toBeTruthy();
  });

  // ── Empty state ──
  test('shows empty favorites state when no stores', async () => {
    hookOverrides = { favoriteStores: [], isLoading: false, error: null };
    await renderFavoriteStores();
    expect(screen.getByTestId('empty-favorites')).toBeTruthy();
    expect(screen.getByText('No favorite stores yet')).toBeTruthy();
  });

  // ── Order delivery section ──
  test('renders OrderDeliverySection when stores exist', async () => {
    await renderFavoriteStores();
    expect(screen.getByTestId('order-delivery-section')).toBeTruthy();
    expect(screen.getByText('2 items')).toBeTruthy();
  });

  // ── Optimize route button ──
  test('renders OptimizeRouteButton', async () => {
    await renderFavoriteStores();
    expect(screen.getByTestId('optimize-route')).toBeTruthy();
  });

  // ── Remove store triggers Alert ──
  test('triggers Alert when remove button is pressed', async () => {
    const { Alert } = await import('react-native');
    await renderFavoriteStores();
    fireEvent.click(screen.getByText('Remove Trader Joes'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Remove Favorite',
      'Remove Trader Joes from your favorites?',
      expect.any(Array)
    );
  });

  // ── Order from a specific store opens delivery sheet ──
  test('opens delivery sheet when Order is pressed on a store', async () => {
    await renderFavoriteStores();
    fireEvent.click(screen.getAllByText('Order')[0]);
    expect(screen.getByTestId('delivery-service-sheet')).toBeTruthy();
    expect(screen.getByText('Trader Joes')).toBeTruthy();
  });

  // ── Order All opens delivery sheet without specific store ──
  test('opens delivery sheet for all stores when Order All is pressed', async () => {
    await renderFavoriteStores();
    fireEvent.click(screen.getByText('Order All'));
    expect(screen.getByTestId('delivery-service-sheet')).toBeTruthy();
    expect(screen.getByText('All Stores')).toBeTruthy();
  });

  // ── Onboarding tooltip ──
  test('shows onboarding tooltip on first visit', async () => {
    await renderFavoriteStores();
    expect(screen.getByTestId('onboarding-tooltip')).toBeTruthy();
    expect(screen.getByText('Welcome tips')).toBeTruthy();
  });

  test('dismisses onboarding tooltip when Dismiss is pressed', async () => {
    await renderFavoriteStores();
    fireEvent.click(screen.getByText('Dismiss'));
    expect(screen.queryByTestId('onboarding-tooltip')).toBeNull();
  });

  // ── Show tips button ──
  test('re-shows onboarding when Tips button is pressed', async () => {
    await renderFavoriteStores();
    // First dismiss
    fireEvent.click(screen.getByText('Dismiss'));
    expect(screen.queryByTestId('onboarding-tooltip')).toBeNull();
    // Then re-show via header tips button
    fireEvent.click(screen.getByTestId('show-tips'));
    expect(screen.getByTestId('onboarding-tooltip')).toBeTruthy();
  });

  // ── Component export ──
  test('exports a default function component', async () => {
    const mod = await import('./src/app/favorite-stores.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/favorite-stores.jsx');
    const FavoriteStoresScreen = mod.default;
    const { rerender } = render(<FavoriteStoresScreen />);
    expect(() => rerender(<FavoriteStoresScreen />)).not.toThrow();
  });
});
