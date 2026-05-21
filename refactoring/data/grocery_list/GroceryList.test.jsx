import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock react-native
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children, style, ...props }) =>
      React.createElement('div', { style, ...props }, children),
    Text: ({ children, style, ...props }) =>
      React.createElement('span', { style, ...props }, children),
    ScrollView: ({ children, contentContainerStyle, ...props }) =>
      React.createElement('div', { style: contentContainerStyle, ...props }, children),
    ActivityIndicator: ({ size, color }) =>
      React.createElement('div', { 'data-testid': 'activity-indicator', 'data-color': color }),
    TouchableOpacity: ({ children, onPress, ...props }) =>
      React.createElement('button', { onClick: onPress, ...props }, children),
    Pressable: ({ children, onPress, onPressIn, onPressOut, style }) =>
      React.createElement('button', { onClick: onPress, style }, children),
    Linking: {
      openURL: vi.fn(() => Promise.resolve()),
      canOpenURL: vi.fn(() => Promise.resolve(false)),
    },
    Platform: { OS: 'ios', select: (opts) => opts.ios || opts.default },
    Alert: { alert: vi.fn() },
    Animated: {
      View: ({ children, style }) =>
        require('react').createElement('div', { style }, children),
      Value: vi.fn(() => ({ interpolate: vi.fn() })),
    },
  };
});

// Mock lucide icons
vi.mock('lucide-react-native', () => {
  const React = require('react');
  const Icon = ({ size, color, ...props }) =>
    React.createElement('span', { 'data-testid': 'icon', ...props });
  return {
    ShoppingCart: (props) => React.createElement('span', { 'data-testid': 'shopping-cart-icon', ...props }),
    MapPin: (props) => React.createElement('span', { 'data-testid': 'map-pin-icon', ...props }),
    Route: (props) => React.createElement('span', { 'data-testid': 'route-icon', ...props }),
    Navigation: (props) => React.createElement('span', { 'data-testid': 'navigation-icon', ...props }),
  };
});

// Mock child components
vi.mock('@/components/GroceryItemList', () => {
  const React = require('react');
  return {
    UncheckedItem: ({ item, onToggle, onEditItem, onDelete, onAssignStore }) =>
      React.createElement('div', { 'data-testid': `unchecked-item-${item.id}` },
        React.createElement('span', null, item.name),
        React.createElement('button', { 'data-testid': `toggle-${item.id}`, onClick: () => onToggle(item.id) }, 'Toggle'),
        React.createElement('button', { 'data-testid': `delete-${item.id}`, onClick: () => onDelete(item.id) }, 'Delete'),
      ),
    CheckedItem: ({ item, onToggle, onDelete }) =>
      React.createElement('div', { 'data-testid': `checked-item-${item.id}` },
        React.createElement('span', null, item.name),
        React.createElement('button', { 'data-testid': `toggle-checked-${item.id}`, onClick: () => onToggle(item.id) }, 'Toggle'),
      ),
  };
});

vi.mock('./src/app/GroceryListHeader', () => {
  const React = require('react');
  return {
    GroceryListHeader: ({ uncheckedItemsCount, itemsCount, handleClearAll }) =>
      React.createElement('div', { 'data-testid': 'grocery-list-header' },
        React.createElement('span', { 'data-testid': 'unchecked-count' }, uncheckedItemsCount),
        React.createElement('span', { 'data-testid': 'total-count' }, itemsCount),
        React.createElement('button', { 'data-testid': 'clear-all-btn', onClick: handleClearAll }, 'Clear All'),
      ),
  };
});

import { GroceryList } from './src/app/GroceryList.jsx';

// Test data factories
function makeItem(overrides = {}) {
  return {
    id: 'item-1',
    name: 'Milk',
    price: '3.99',
    preferred_store_id: null,
    store_name: null,
    store_address: null,
    checked: false,
    ...overrides,
  };
}

const defaultProps = {
  isLoading: false,
  error: null,
  items: [],
  uncheckedItems: [],
  checkedItems: [],
  handleToggleItem: vi.fn(),
  handleEditItem: vi.fn(),
  handleDeleteItem: vi.fn(),
  handleClearChecked: vi.fn(),
  handleClearAll: vi.fn(),
  clearCheckedScale: { interpolate: vi.fn() },
  makePressIn: vi.fn(() => vi.fn()),
  makePressOut: vi.fn(() => vi.fn()),
  clearAllMutation: { isPending: false },
  insets: { bottom: 0, top: 0, left: 0, right: 0 },
  onAssignStore: vi.fn(),
  favoriteStores: [],
};

describe('GroceryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -- Loading state --

  test('shows loading indicator when isLoading is true', () => {
    render(<GroceryList {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  // -- Error state --

  test('shows error message when error is present', () => {
    render(<GroceryList {...defaultProps} error={new Error('Network error')} />);
    expect(screen.getByText('Failed to load grocery list')).toBeTruthy();
  });

  // -- Empty state --

  test('shows empty state when items list is empty', () => {
    render(<GroceryList {...defaultProps} items={[]} />);
    expect(screen.getByText('Your list is empty')).toBeTruthy();
    expect(screen.getByText(/Tap "\+ Add Items" above to get started/)).toBeTruthy();
  });

  test('shows shopping cart icon in empty state', () => {
    render(<GroceryList {...defaultProps} items={[]} />);
    expect(screen.getByTestId('shopping-cart-icon')).toBeTruthy();
  });

  // -- Normal list rendering (flat, no store assignments) --

  test('renders unchecked items in flat list when no store assignments exist', () => {
    const items = [makeItem({ id: '1', name: 'Milk' }), makeItem({ id: '2', name: 'Bread' })];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
      />
    );
    expect(screen.getByTestId('unchecked-item-1')).toBeTruthy();
    expect(screen.getByTestId('unchecked-item-2')).toBeTruthy();
    expect(screen.getByText('Milk')).toBeTruthy();
    expect(screen.getByText('Bread')).toBeTruthy();
  });

  test('renders the grocery list header with correct counts', () => {
    const items = [makeItem({ id: '1' }), makeItem({ id: '2' })];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
      />
    );
    expect(screen.getByTestId('grocery-list-header')).toBeTruthy();
    expect(screen.getByTestId('unchecked-count').textContent).toBe('2');
    expect(screen.getByTestId('total-count').textContent).toBe('2');
  });

  // -- Checked items --

  test('renders checked items section with "IN CART" label and count', () => {
    const unchecked = [makeItem({ id: '1', name: 'Milk' })];
    const checked = [makeItem({ id: '2', name: 'Eggs', checked: true })];
    render(
      <GroceryList
        {...defaultProps}
        items={[...unchecked, ...checked]}
        uncheckedItems={unchecked}
        checkedItems={checked}
      />
    );
    expect(screen.getByText('IN CART (1)')).toBeTruthy();
    expect(screen.getByTestId('checked-item-2')).toBeTruthy();
  });

  test('shows "Clear" button in checked items section', () => {
    const checked = [makeItem({ id: '2', name: 'Eggs', checked: true })];
    render(
      <GroceryList
        {...defaultProps}
        items={checked}
        uncheckedItems={[]}
        checkedItems={checked}
      />
    );
    expect(screen.getByText('Clear')).toBeTruthy();
  });

  test('does not show checked section when checkedItems is empty', () => {
    const items = [makeItem({ id: '1' })];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
        checkedItems={[]}
      />
    );
    expect(screen.queryByText(/IN CART/)).toBeNull();
  });

  // -- Store grouping --

  test('groups unchecked items by store when store assignments exist', () => {
    const items = [
      makeItem({ id: '1', name: 'Milk', preferred_store_id: 's1', store_name: 'Walmart', store_address: '123 Main' }),
      makeItem({ id: '2', name: 'Bread', preferred_store_id: 's1', store_name: 'Walmart', store_address: '123 Main' }),
      makeItem({ id: '3', name: 'Apples', preferred_store_id: 's2', store_name: 'Target', store_address: '456 Oak' }),
    ];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
      />
    );
    expect(screen.getByText('Target')).toBeTruthy();
    expect(screen.getByText('Walmart')).toBeTruthy();
  });

  test('shows item count and subtotal per store group', () => {
    const items = [
      makeItem({ id: '1', name: 'Milk', price: '3.50', preferred_store_id: 's1', store_name: 'Walmart' }),
      makeItem({ id: '2', name: 'Bread', price: '2.50', preferred_store_id: 's1', store_name: 'Walmart' }),
    ];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
      />
    );
    // 2 items, subtotal $6.00
    expect(screen.getByText(/2 items/)).toBeTruthy();
    expect(screen.getByText(/\$6\.00/)).toBeTruthy();
  });

  test('shows "Unassigned" group for items without store assignment', () => {
    const items = [
      makeItem({ id: '1', name: 'Milk', preferred_store_id: 's1', store_name: 'Walmart' }),
      makeItem({ id: '2', name: 'Random Item' }),
    ];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
      />
    );
    expect(screen.getByText('Unassigned')).toBeTruthy();
  });

  // -- Optimize Route --

  test('shows "Optimize Route" button when stores have coordinates', () => {
    const items = [
      makeItem({ id: '1', name: 'Milk', preferred_store_id: 's1', store_name: 'Walmart' }),
    ];
    const favoriteStores = [{ id: 's1', name: 'Walmart', lat: 40.7, lng: -74.0 }];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
        favoriteStores={favoriteStores}
      />
    );
    expect(screen.getByText(/Optimize Route to 1 Store/)).toBeTruthy();
  });

  test('does not show "Optimize Route" when no stores have coordinates', () => {
    const items = [makeItem({ id: '1', name: 'Milk' })];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
        favoriteStores={[]}
      />
    );
    expect(screen.queryByText(/Optimize Route/)).toBeNull();
  });

  test('pluralizes store count in Optimize Route button', () => {
    const items = [
      makeItem({ id: '1', preferred_store_id: 's1', store_name: 'Walmart' }),
      makeItem({ id: '2', preferred_store_id: 's2', store_name: 'Target' }),
    ];
    const favoriteStores = [
      { id: 's1', name: 'Walmart', lat: 40.7, lng: -74.0 },
      { id: 's2', name: 'Target', lat: 40.8, lng: -73.9 },
    ];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
        favoriteStores={favoriteStores}
      />
    );
    expect(screen.getByText(/Optimize Route to 2 Stores/)).toBeTruthy();
  });

  // -- Callbacks --

  test('calls handleToggleItem when toggling an unchecked item', () => {
    const handleToggleItem = vi.fn();
    const items = [makeItem({ id: '1', name: 'Milk' })];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
        handleToggleItem={handleToggleItem}
      />
    );
    fireEvent.click(screen.getByTestId('toggle-1'));
    expect(handleToggleItem).toHaveBeenCalledWith('1');
  });

  test('calls handleDeleteItem when deleting an unchecked item', () => {
    const handleDeleteItem = vi.fn();
    const items = [makeItem({ id: '1', name: 'Milk' })];
    render(
      <GroceryList
        {...defaultProps}
        items={items}
        uncheckedItems={items}
        handleDeleteItem={handleDeleteItem}
      />
    );
    fireEvent.click(screen.getByTestId('delete-1'));
    expect(handleDeleteItem).toHaveBeenCalledWith('1');
  });

  test('does not render header when uncheckedItems is empty but checkedItems exist', () => {
    const checked = [makeItem({ id: '1', checked: true })];
    render(
      <GroceryList
        {...defaultProps}
        items={checked}
        uncheckedItems={[]}
        checkedItems={checked}
      />
    );
    expect(screen.queryByTestId('grocery-list-header')).toBeNull();
  });
});
