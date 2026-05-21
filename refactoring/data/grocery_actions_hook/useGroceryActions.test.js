import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock React Native and Expo modules
vi.mock('react-native', () => ({
  Alert: { alert: vi.fn() },
  Animated: {
    Value: vi.fn().mockImplementation((val) => ({
      interpolate: vi.fn().mockReturnValue(val),
    })),
    spring: vi.fn().mockReturnValue({ start: vi.fn() }),
  },
  Platform: { OS: 'ios' },
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((config) => ({
    mutate: vi.fn((args) => {
      // Call mutationFn to allow testing the fetch behavior
      return config.mutationFn(args);
    }),
    mutateAsync: vi.fn((args) => config.mutationFn(args)),
    isLoading: false,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('expo-linking', () => ({
  openURL: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

vi.mock('@/utils/apiFetch', () => ({
  default: vi.fn(),
}));

import {
  useGroceryMutations,
  useGroceryActions,
  useAnimatedButtonScales,
  useCollapsibleAddSection,
} from './src/app/useGroceryActions.js';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import apiFetch from '@/utils/apiFetch';

describe('useGroceryMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return all mutation objects', () => {
    const result = useGroceryMutations('store-1', vi.fn());

    expect(result).toHaveProperty('addItemMutation');
    expect(result).toHaveProperty('toggleItemMutation');
    expect(result).toHaveProperty('updateItemMutation');
    expect(result).toHaveProperty('deleteItemMutation');
    expect(result).toHaveProperty('clearCheckedMutation');
    expect(result).toHaveProperty('clearAllMutation');
  });

  test('addItemMutation should POST to /api/grocery/add-ingredients', async () => {
    apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const { addItemMutation } = useGroceryMutations('store-1', vi.fn());
    await addItemMutation.mutate('Apples, Bananas');

    expect(apiFetch).toHaveBeenCalledWith('/api/grocery/add-ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: 'Apples, Bananas', location: 'store-1' }),
    });
  });

  test('addItemMutation should throw when fetch fails', async () => {
    apiFetch.mockResolvedValue({ ok: false });

    const { addItemMutation } = useGroceryMutations('store-1', vi.fn());
    await expect(addItemMutation.mutate('Apples')).rejects.toThrow('Failed to add items');
  });

  test('toggleItemMutation should PATCH item with checked status', async () => {
    apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const { toggleItemMutation } = useGroceryMutations('store-1', vi.fn());
    await toggleItemMutation.mutate({ id: 'item-1', checked: true });

    expect(apiFetch).toHaveBeenCalledWith('/api/grocery/item-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked: true }),
    });
  });

  test('updateItemMutation should PATCH with name and price', async () => {
    apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const { updateItemMutation } = useGroceryMutations('store-1', vi.fn());
    await updateItemMutation.mutate({ id: 'item-2', name: 'Milk', price: 3.99 });

    expect(apiFetch).toHaveBeenCalledWith('/api/grocery/item-2', expect.objectContaining({
      method: 'PATCH',
    }));
    const body = JSON.parse(apiFetch.mock.calls[0][1].body);
    expect(body.name).toBe('Milk');
    expect(body.price).toBe(3.99);
  });

  test('updateItemMutation should only include defined fields', async () => {
    apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const { updateItemMutation } = useGroceryMutations('store-1', vi.fn());
    await updateItemMutation.mutate({ id: 'item-2', name: 'Eggs' });

    const body = JSON.parse(apiFetch.mock.calls[0][1].body);
    expect(body.name).toBe('Eggs');
    expect(body).not.toHaveProperty('price');
  });

  test('deleteItemMutation should DELETE the item', async () => {
    apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const { deleteItemMutation } = useGroceryMutations('store-1', vi.fn());
    await deleteItemMutation.mutate('item-3');

    expect(apiFetch).toHaveBeenCalledWith('/api/grocery/item-3', { method: 'DELETE' });
  });

  test('clearCheckedMutation should DELETE /api/grocery', async () => {
    apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const { clearCheckedMutation } = useGroceryMutations('store-1', vi.fn());
    await clearCheckedMutation.mutate();

    expect(apiFetch).toHaveBeenCalledWith('/api/grocery', { method: 'DELETE' });
  });

  test('clearAllMutation should DELETE /api/grocery?all=true', async () => {
    apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const { clearAllMutation } = useGroceryMutations('store-1', vi.fn());
    await clearAllMutation.mutate();

    expect(apiFetch).toHaveBeenCalledWith('/api/grocery?all=true', { method: 'DELETE' });
  });
});

describe('useGroceryActions', () => {
  let mockItems;
  let mockSetNewItem;
  let mockAddItemMutation;
  let mockToggleItemMutation;
  let mockDeleteItemMutation;
  let mockClearCheckedMutation;
  let mockClearAllMutation;
  let mockUpdateItemMutation;
  let mockSetEditingItem;
  let mockSetEditItemName;
  let mockSetEditItemPrice;

  beforeEach(() => {
    vi.clearAllMocks();
    mockItems = [
      { id: '1', name: 'Milk', checked: false, price: 3.5 },
      { id: '2', name: 'Bread', checked: true, price: 2.0 },
      { id: '3', name: 'Eggs', checked: false, price: null },
    ];
    mockSetNewItem = vi.fn();
    mockAddItemMutation = { mutate: vi.fn() };
    mockToggleItemMutation = { mutate: vi.fn() };
    mockDeleteItemMutation = { mutate: vi.fn() };
    mockClearCheckedMutation = { mutate: vi.fn() };
    mockClearAllMutation = { mutate: vi.fn() };
    mockUpdateItemMutation = { mutate: vi.fn() };
    mockSetEditingItem = vi.fn();
    mockSetEditItemName = vi.fn();
    mockSetEditItemPrice = vi.fn();
  });

  function getActions(newItem = 'test item') {
    return useGroceryActions(
      mockItems,
      newItem,
      mockSetNewItem,
      mockAddItemMutation,
      mockToggleItemMutation,
      mockDeleteItemMutation,
      mockClearCheckedMutation,
      mockClearAllMutation,
      mockUpdateItemMutation,
      mockSetEditingItem,
      mockSetEditItemName,
      mockSetEditItemPrice,
    );
  }

  test('handleAddItem should call addItemMutation.mutate and clear input', () => {
    const { handleAddItem } = getActions('  Apples  ');
    handleAddItem();

    expect(mockAddItemMutation.mutate).toHaveBeenCalledWith('Apples');
    expect(mockSetNewItem).toHaveBeenCalledWith('');
  });

  test('handleAddItem should not add empty/whitespace-only items', () => {
    const { handleAddItem } = getActions('   ');
    handleAddItem();

    expect(mockAddItemMutation.mutate).not.toHaveBeenCalled();
  });

  test('handleToggleItem should toggle checked status', () => {
    const { handleToggleItem } = getActions();
    handleToggleItem({ id: '1', checked: false });

    expect(mockToggleItemMutation.mutate).toHaveBeenCalledWith({ id: '1', checked: true });
  });

  test('handleDeleteItem should call deleteItemMutation with id', () => {
    const { handleDeleteItem } = getActions();
    handleDeleteItem('item-5');

    expect(mockDeleteItemMutation.mutate).toHaveBeenCalledWith('item-5');
  });

  test('handleClearChecked should alert when no items are checked', () => {
    mockItems = [{ id: '1', name: 'Milk', checked: false }];
    const { handleClearChecked } = getActions();
    handleClearChecked();

    expect(Alert.alert).toHaveBeenCalledWith('Nothing to Clear', 'No items are checked.');
    expect(mockClearCheckedMutation.mutate).not.toHaveBeenCalled();
  });

  test('handleClearChecked should show confirmation with count of checked items', () => {
    const { handleClearChecked } = getActions();
    handleClearChecked();

    expect(Alert.alert).toHaveBeenCalledWith(
      'Clear Checked Items',
      'Remove 1 checked item?',
      expect.any(Array),
    );
  });

  test('handleClearAll should show confirmation with total item count', () => {
    const { handleClearAll } = getActions();
    handleClearAll();

    expect(Alert.alert).toHaveBeenCalledWith(
      'Clear All Items',
      'Remove all 3 items?',
      expect.any(Array),
    );
  });

  test('handleEditItem should set editing state with item details', () => {
    const { handleEditItem } = getActions();
    handleEditItem({ id: '1', name: 'Milk', price: 3.5 });

    expect(mockSetEditingItem).toHaveBeenCalledWith({ id: '1' });
    expect(mockSetEditItemName).toHaveBeenCalledWith('Milk');
    expect(mockSetEditItemPrice).toHaveBeenCalledWith('3.5');
  });

  test('handleEditItem should set empty price string when no price', () => {
    const { handleEditItem } = getActions();
    handleEditItem({ id: '3', name: 'Eggs', price: null });

    expect(mockSetEditItemPrice).toHaveBeenCalledWith('');
  });

  test('handleSaveItem should not save when editingItem is null', () => {
    const { handleSaveItem } = getActions();
    handleSaveItem(null, 'Name', '5.00');

    expect(mockUpdateItemMutation.mutate).not.toHaveBeenCalled();
  });

  test('handleSaveItem should alert when name is empty', () => {
    const { handleSaveItem } = getActions();
    handleSaveItem({ id: '1' }, '   ', '5.00');

    expect(Alert.alert).toHaveBeenCalledWith('Missing Name', 'Please enter an item name.');
    expect(mockUpdateItemMutation.mutate).not.toHaveBeenCalled();
  });

  test('handleSaveItem should alert for invalid price', () => {
    const { handleSaveItem } = getActions();
    handleSaveItem({ id: '1' }, 'Milk', 'abc');

    expect(Alert.alert).toHaveBeenCalledWith('Invalid Price', 'Please enter a valid price.');
  });

  test('handleSaveItem should alert for negative price', () => {
    const { handleSaveItem } = getActions();
    handleSaveItem({ id: '1' }, 'Milk', '-5');

    expect(Alert.alert).toHaveBeenCalledWith('Invalid Price', 'Please enter a valid price.');
  });

  test('handleSaveItem should save with valid name and price', () => {
    const { handleSaveItem } = getActions();
    handleSaveItem({ id: '1' }, 'Organic Milk', '4.99');

    expect(mockUpdateItemMutation.mutate).toHaveBeenCalledWith({
      id: '1',
      name: 'Organic Milk',
      price: 4.99,
    });
  });

  test('handleSaveItem should save with undefined price when price field is empty', () => {
    const { handleSaveItem } = getActions();
    handleSaveItem({ id: '1' }, 'Milk', '');

    expect(mockUpdateItemMutation.mutate).toHaveBeenCalledWith({
      id: '1',
      name: 'Milk',
      price: undefined,
    });
  });

  test('handleAddItemFromSuggestion should add item and clear input', () => {
    const { handleAddItemFromSuggestion } = getActions();
    handleAddItemFromSuggestion('Suggested Item');

    expect(mockSetNewItem).toHaveBeenCalledWith('');
    expect(mockAddItemMutation.mutate).toHaveBeenCalledWith('Suggested Item');
  });

  test('handleSendViaText should alert when no unchecked items', () => {
    const { handleSendViaText } = getActions();
    handleSendViaText([], 0);

    expect(Alert.alert).toHaveBeenCalledWith('No Items', 'Add some items to your list first.');
  });

  test('handleSendViaText should open SMS with formatted item list', () => {
    const { handleSendViaText } = getActions();
    const uncheckedItems = [
      { name: 'Milk', price: 3.50 },
      { name: 'Eggs', price: null },
    ];

    handleSendViaText(uncheckedItems, 3.50);

    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('sms:'),
    );
    // The URL should contain encoded grocery list
    const urlArg = Linking.openURL.mock.calls[0][0];
    const decoded = decodeURIComponent(urlArg);
    expect(decoded).toContain('Grocery List');
    expect(decoded).toContain('1. Milk');
    expect(decoded).toContain('$3.50');
    expect(decoded).toContain('2. Eggs');
    expect(decoded).toContain('Estimated Total: $3.50');
  });

  test('handleSendViaText should omit total when totalPrice is 0', () => {
    const { handleSendViaText } = getActions();
    handleSendViaText([{ name: 'Water', price: null }], 0);

    const urlArg = Linking.openURL.mock.calls[0][0];
    const decoded = decodeURIComponent(urlArg);
    expect(decoded).not.toContain('Estimated Total');
  });
});

describe('useAnimatedButtonScales', () => {
  test('should return clearCheckedScale, makePressIn, and makePressOut', () => {
    const result = useAnimatedButtonScales();

    expect(result).toHaveProperty('clearCheckedScale');
    expect(result).toHaveProperty('makePressIn');
    expect(result).toHaveProperty('makePressOut');
    expect(typeof result.makePressIn).toBe('function');
    expect(typeof result.makePressOut).toBe('function');
  });
});

describe('useCollapsibleAddSection', () => {
  test('should return section state and controls', () => {
    const result = useCollapsibleAddSection();

    expect(result).toHaveProperty('addSectionExpanded');
    expect(result).toHaveProperty('toggleAddSection');
    expect(result).toHaveProperty('addSectionMaxHeight');
    expect(result).toHaveProperty('addSectionOpacity');
    expect(result).toHaveProperty('chevronRotate');
    expect(result.addSectionExpanded).toBe(false);
    expect(typeof result.toggleAddSection).toBe('function');
  });
});
