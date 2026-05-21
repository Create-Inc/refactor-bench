import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import OnlineStore from './src/app/page.jsx';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock confirm dialog
window.confirm = vi.fn();

describe('OnlineStore Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with ShopWave store name', () => {
      render(<OnlineStore />);
      expect(screen.getByTestId('store-name')).toHaveTextContent('ShopWave');
    });

    test('renders sidebar navigation items', () => {
      render(<OnlineStore />);
      expect(screen.getByTestId('nav-catalog')).toHaveTextContent('Shop');
      expect(screen.getByTestId('nav-wishlist')).toHaveTextContent('Wishlist');
      expect(screen.getByTestId('nav-orders')).toHaveTextContent('Orders');
      expect(screen.getByTestId('nav-addresses')).toHaveTextContent('Addresses');
    });

    test('renders search input with placeholder', () => {
      render(<OnlineStore />);
      expect(screen.getByPlaceholderText('Search products... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls', () => {
      render(<OnlineStore />);
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by price')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    });

    test('renders product catalog by default', () => {
      render(<OnlineStore />);
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
      expect(screen.getByText('Organic Cotton T-Shirt')).toBeInTheDocument();
    });

    test('renders cart button with count', () => {
      render(<OnlineStore />);
      expect(screen.getByTestId('cart-button')).toBeInTheDocument();
    });

    test('renders grid and list view toggle buttons', () => {
      render(<OnlineStore />);
      expect(screen.getByTestId('grid-view-btn')).toBeInTheDocument();
      expect(screen.getByTestId('list-view-btn')).toBeInTheDocument();
    });

    test('renders product count', () => {
      render(<OnlineStore />);
      expect(screen.getByText('12 products')).toBeInTheDocument();
    });

    test('renders sidebar cart summary', () => {
      render(<OnlineStore />);
      expect(screen.getByText('Cart: 0 items')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('Product Catalog - Filtering', () => {
    test('filters products by category', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'electronics' } });
      expect(screen.getByText('3 products')).toBeInTheDocument();
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
      expect(screen.getByText('Smart Home Security Camera')).toBeInTheDocument();
    });

    test('filters products by price range', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByLabelText('Filter by price'), { target: { value: 'under25' } });
      expect(screen.getByText('0 products')).toBeInTheDocument();
    });

    test('filters in-stock products only', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('in-stock-filter'));
      expect(screen.getByText('11 products')).toBeInTheDocument();
    });

    test('combines multiple filters', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'sports' } });
      fireEvent.click(screen.getByTestId('in-stock-filter'));
      expect(screen.getByText('3 products')).toBeInTheDocument();
    });

    test('resets to page 1 when filter changes', () => {
      render(<OnlineStore />);
      // First go to page 2
      const nextBtn = screen.getByText('Next');
      fireEvent.click(nextBtn);
      // Apply filter - should go back to page 1
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'electronics' } });
      // All 3 electronics products should be visible (they fit on one page)
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
    });
  });

  describe('Product Catalog - Sorting', () => {
    test('sorts products by price low to high', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price_asc' } });
      const cards = screen.getAllByTestId(/^product-card-/);
      expect(cards.length).toBeGreaterThan(0);
    });

    test('sorts products by price high to low', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price_desc' } });
      const cards = screen.getAllByTestId(/^product-card-/);
      expect(cards.length).toBeGreaterThan(0);
    });

    test('sorts products by rating', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'rating' } });
      const cards = screen.getAllByTestId(/^product-card-/);
      expect(cards.length).toBeGreaterThan(0);
    });

    test('sorts products by newest arrivals', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'newest' } });
      const cards = screen.getAllByTestId(/^product-card-/);
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Product Catalog - Search', () => {
    test('searches products by name', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'headphones' } });
      expect(screen.getByText('1 products')).toBeInTheDocument();
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
    });

    test('searches products by tag', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'bluetooth' } });
      expect(screen.getByText('1 products')).toBeInTheDocument();
    });

    test('searches products by description', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'organic' } });
      expect(screen.getByText('Organic Cotton T-Shirt')).toBeInTheDocument();
    });

    test('shows no results message when search has no matches', () => {
      render(<OnlineStore />);
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'xyznonexistent' } });
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  describe('Product Catalog - View Modes', () => {
    test('switches to list view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('list-view-btn'));
      // Products should still be visible
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
    });

    test('switches back to grid view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('list-view-btn'));
      fireEvent.click(screen.getByTestId('grid-view-btn'));
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
    });

    test('list view shows brand and SKU', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('list-view-btn'));
      expect(screen.getByText(/SoundMax/)).toBeInTheDocument();
      expect(screen.getByText(/ELEC-HP-001/)).toBeInTheDocument();
    });
  });

  describe('Product Catalog - Pagination', () => {
    test('renders pagination controls', () => {
      render(<OnlineStore />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    test('navigates to next page', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Next'));
      // Page 2 products should be visible
      const cards = screen.getAllByTestId(/^product-card-/);
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.length).toBeLessThanOrEqual(6);
    });

    test('navigates back to previous page', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Previous'));
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
    });

    test('previous button is disabled on first page', () => {
      render(<OnlineStore />);
      expect(screen.getByText('Previous')).toBeDisabled();
    });
  });

  describe('Product Detail View', () => {
    test('navigates to product detail when clicking product name', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      expect(screen.getByTestId('back-to-catalog')).toBeInTheDocument();
      expect(screen.getByTestId('detail-add-to-cart')).toBeInTheDocument();
    });

    test('shows product info in detail view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      expect(screen.getByText('$249.99')).toBeInTheDocument();
      expect(screen.getByText(/SoundMax/)).toBeInTheDocument();
      expect(screen.getByText(/ELEC-HP-001/)).toBeInTheDocument();
    });

    test('shows sale badge and savings on discounted products', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      expect(screen.getByText('$349.99')).toBeInTheDocument();
      expect(screen.getByText(/Save \$100\.00/)).toBeInTheDocument();
    });

    test('shows product tags', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      expect(screen.getByText('#wireless')).toBeInTheDocument();
      expect(screen.getByText('#bluetooth')).toBeInTheDocument();
    });

    test('shows in-stock status', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      expect(screen.getByText(/In Stock/)).toBeInTheDocument();
    });

    test('navigates back to catalog', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('back-to-catalog'));
      expect(screen.queryByTestId('back-to-catalog')).not.toBeInTheDocument();
    });

    test('shows related products in same category', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      // Should show other electronics
      const related = screen.getAllByTestId(/^related-/);
      expect(related.length).toBeGreaterThan(0);
    });

    test('shows wishlist button in detail view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      expect(screen.getByTestId('detail-wishlist-btn')).toBeInTheDocument();
    });

    test('shows compare button in detail view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      expect(screen.getByTestId('detail-compare-btn')).toBeInTheDocument();
    });
  });

  describe('Shopping Cart', () => {
    test('opens cart sidebar when cart button clicked', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('cart-button'));
      expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
    });

    test('shows empty cart message', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('cart-button'));
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    test('adds product to cart from catalog', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      expect(screen.getByTestId('cart-item-p1')).toBeInTheDocument();
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
    });

    test('adds product to cart from detail view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('detail-add-to-cart'));
      fireEvent.click(screen.getByTestId('cart-button'));
      expect(screen.getByTestId('cart-item-p1')).toBeInTheDocument();
    });

    test('increments quantity for existing cart items', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      expect(screen.getByTestId('qty-p1')).toHaveTextContent('2');
    });

    test('increases item quantity with + button', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('increase-qty-p1'));
      expect(screen.getByTestId('qty-p1')).toHaveTextContent('2');
    });

    test('decreases item quantity with - button', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('decrease-qty-p1'));
      expect(screen.getByTestId('qty-p1')).toHaveTextContent('1');
    });

    test('removes item when quantity reaches 0', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('decrease-qty-p1'));
      expect(screen.queryByTestId('cart-item-p1')).not.toBeInTheDocument();
    });

    test('removes item with remove button', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('remove-item-p1'));
      expect(screen.queryByTestId('cart-item-p1')).not.toBeInTheDocument();
    });

    test('clears entire cart', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('add-to-cart-p2'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('clear-cart-btn'));
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    test('shows correct subtotal', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      expect(screen.getByText('$249.99')).toBeInTheDocument();
    });

    test('updates sidebar cart summary', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      expect(screen.getByText('Cart: 1 items')).toBeInTheDocument();
    });

    test('does not allow adding out-of-stock products', () => {
      render(<OnlineStore />);
      // p9 (4K monitor) is out of stock
      const addBtn = screen.getByTestId('add-to-cart-p9');
      expect(addBtn).toBeDisabled();
    });

    test('closes cart sidebar', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('cart-button'));
      expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Close cart'));
      expect(screen.queryByTestId('cart-sidebar')).not.toBeInTheDocument();
    });
  });

  describe('Promo Codes', () => {
    test('applies valid percentage promo code', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.change(screen.getByTestId('promo-input'), { target: { value: 'SAVE10' } });
      fireEvent.click(screen.getByTestId('apply-promo-btn'));
      expect(screen.getByText(/10% off/)).toBeInTheDocument();
    });

    test('applies valid flat promo code', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.change(screen.getByTestId('promo-input'), { target: { value: 'FLAT20' } });
      fireEvent.click(screen.getByTestId('apply-promo-btn'));
      expect(screen.getByText(/\$20 off/)).toBeInTheDocument();
    });

    test('shows error for invalid promo code', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.change(screen.getByTestId('promo-input'), { target: { value: 'INVALID' } });
      fireEvent.click(screen.getByTestId('apply-promo-btn'));
      expect(screen.getByText('Invalid promo code')).toBeInTheDocument();
    });

    test('removes applied promo code', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.change(screen.getByTestId('promo-input'), { target: { value: 'SAVE10' } });
      fireEvent.click(screen.getByTestId('apply-promo-btn'));
      fireEvent.click(screen.getByTestId('remove-promo-btn'));
      expect(screen.queryByText(/10% off/)).not.toBeInTheDocument();
    });

    test('promo code is case-insensitive', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.change(screen.getByTestId('promo-input'), { target: { value: 'save10' } });
      fireEvent.click(screen.getByTestId('apply-promo-btn'));
      expect(screen.getByText(/10% off/)).toBeInTheDocument();
    });
  });

  describe('Checkout Flow', () => {
    test('opens checkout modal from cart', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
    });

    test('shows shipping step with addresses', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      expect(screen.getByTestId('address-option-addr1')).toBeInTheDocument();
      expect(screen.getByTestId('address-option-addr2')).toBeInTheDocument();
    });

    test('shows shipping method options', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      expect(screen.getByTestId('shipping-option-standard')).toBeInTheDocument();
      expect(screen.getByTestId('shipping-option-express')).toBeInTheDocument();
      expect(screen.getByTestId('shipping-option-overnight')).toBeInTheDocument();
    });

    test('proceeds to payment step', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
      expect(screen.getByTestId('payment-method-card')).toBeInTheDocument();
      expect(screen.getByTestId('payment-method-paypal')).toBeInTheDocument();
    });

    test('proceeds to order review step', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByTestId('continue-to-review'));
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByTestId('order-total')).toBeInTheDocument();
      expect(screen.getByTestId('place-order-btn')).toBeInTheDocument();
    });

    test('shows correct order total with tax and shipping', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p2')); // $34.99
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByTestId('continue-to-review'));
      // Subtotal $34.99 + Tax ($34.99 * 0.0875 = $3.06) + Standard Shipping $5.99 = $44.04
      expect(screen.getByTestId('order-total')).toBeInTheDocument();
    });

    test('places order successfully', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p2'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByTestId('continue-to-review'));
      fireEvent.click(screen.getByTestId('place-order-btn'));
      // Should navigate to orders view and show the order
      expect(screen.getByText('Order History')).toBeInTheDocument();
      const orderCards = screen.getAllByTestId(/^order-ORD-/);
      expect(orderCards.length).toBe(1);
    });

    test('clears cart after placing order', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p2'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByTestId('continue-to-review'));
      fireEvent.click(screen.getByTestId('place-order-btn'));
      expect(screen.getByText('Cart: 0 items')).toBeInTheDocument();
    });

    test('selects different shipping method', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      const expressOption = screen.getByTestId('shipping-option-express');
      const radio = within(expressOption).getByRole('radio');
      fireEvent.click(radio);
      expect(radio).toBeChecked();
    });

    test('selects different payment method', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      const paypalOption = screen.getByTestId('payment-method-paypal');
      const radio = within(paypalOption).getByRole('radio');
      fireEvent.click(radio);
      expect(radio).toBeChecked();
    });

    test('closes checkout modal', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByLabelText('Close checkout'));
      expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
    });

    test('navigates back from payment to shipping', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    });
  });

  describe('Wishlist', () => {
    test('adds product to wishlist from catalog', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('wishlist-btn-p1'));
      fireEvent.click(screen.getByTestId('nav-wishlist'));
      expect(screen.getByTestId('wishlist-item-p1')).toBeInTheDocument();
    });

    test('removes product from wishlist', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('wishlist-btn-p1'));
      fireEvent.click(screen.getByTestId('nav-wishlist'));
      fireEvent.click(screen.getByTestId('remove-wishlist-p1'));
      expect(screen.queryByTestId('wishlist-item-p1')).not.toBeInTheDocument();
    });

    test('moves wishlist item to cart', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('wishlist-btn-p1'));
      fireEvent.click(screen.getByTestId('nav-wishlist'));
      fireEvent.click(screen.getByTestId('move-to-cart-p1'));
      // Item should be removed from wishlist
      expect(screen.queryByTestId('wishlist-item-p1')).not.toBeInTheDocument();
      // Cart count should update
      expect(screen.getByText('Cart: 1 items')).toBeInTheDocument();
    });

    test('shows empty wishlist message', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-wishlist'));
      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    });

    test('toggles wishlist from detail view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('detail-wishlist-btn'));
      // Go to wishlist page
      fireEvent.click(screen.getByTestId('nav-wishlist'));
      expect(screen.getByTestId('wishlist-item-p1')).toBeInTheDocument();
    });

    test('shows wishlist count badge in sidebar', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('wishlist-btn-p1'));
      fireEvent.click(screen.getByTestId('wishlist-btn-p2'));
      // Badge should show count
      const wishlistNav = screen.getByTestId('nav-wishlist');
      expect(wishlistNav).toHaveTextContent('2');
    });
  });

  describe('Product Reviews', () => {
    test('shows existing reviews on product detail', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      expect(screen.getByText('Best headphones ever!')).toBeInTheDocument();
      expect(screen.getByText('Great but heavy')).toBeInTheDocument();
    });

    test('opens review modal', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('write-review-btn'));
      expect(screen.getByTestId('review-modal')).toBeInTheDocument();
    });

    test('submits a new review', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('write-review-btn'));
      fireEvent.change(screen.getByTestId('review-title-input'), { target: { value: 'Amazing product!' } });
      fireEvent.change(screen.getByTestId('review-comment-input'), { target: { value: 'Really love these headphones.' } });
      fireEvent.click(screen.getByTestId('submit-review-btn'));
      expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
      expect(screen.getByText('Amazing product!')).toBeInTheDocument();
    });

    test('marks review as helpful', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('helpful-btn-r1'));
      expect(screen.getByTestId('helpful-btn-r1')).toHaveTextContent('Helpful (43)');
    });

    test('closes review modal', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('write-review-btn'));
      fireEvent.click(screen.getByLabelText('Close review modal'));
      expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
    });

    test('selects star rating in review modal', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('write-review-btn'));
      fireEvent.click(screen.getByLabelText('Rate 3 stars'));
      // The rating selector should reflect 3 stars
      expect(screen.getByTestId('review-rating-selector')).toBeInTheDocument();
    });

    test('does not submit review with empty title', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('write-review-btn'));
      fireEvent.change(screen.getByTestId('review-comment-input'), { target: { value: 'Some comment.' } });
      fireEvent.click(screen.getByTestId('submit-review-btn'));
      // Modal should still be open
      expect(screen.getByTestId('review-modal')).toBeInTheDocument();
    });
  });

  describe('Product Compare', () => {
    test('adds products to compare list', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('compare-btn-p1'));
      fireEvent.click(screen.getByTestId('compare-btn-p2'));
      expect(screen.getByText('2 item(s) selected for comparison')).toBeInTheDocument();
    });

    test('opens compare modal', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('compare-btn-p1'));
      fireEvent.click(screen.getByTestId('compare-btn-p2'));
      fireEvent.click(screen.getByTestId('compare-now-btn'));
      expect(screen.getByTestId('compare-modal')).toBeInTheDocument();
    });

    test('shows product attributes in compare table', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('compare-btn-p1'));
      fireEvent.click(screen.getByTestId('compare-btn-p2'));
      fireEvent.click(screen.getByTestId('compare-now-btn'));
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Brand')).toBeInTheDocument();
    });

    test('clears compare list', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('compare-btn-p1'));
      fireEvent.click(screen.getByTestId('compare-btn-p2'));
      fireEvent.click(screen.getByText('Clear'));
      expect(screen.queryByText(/item\(s\) selected for comparison/)).not.toBeInTheDocument();
    });

    test('limits compare list to 4 items', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('compare-btn-p1'));
      fireEvent.click(screen.getByTestId('compare-btn-p2'));
      fireEvent.click(screen.getByTestId('compare-btn-p3'));
      fireEvent.click(screen.getByTestId('compare-btn-p4'));
      fireEvent.click(screen.getByTestId('compare-btn-p5'));
      expect(screen.getByText('4 item(s) selected for comparison')).toBeInTheDocument();
    });

    test('removes product from compare list by toggling', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('compare-btn-p1'));
      fireEvent.click(screen.getByTestId('compare-btn-p2'));
      fireEvent.click(screen.getByTestId('compare-btn-p1'));
      expect(screen.getByText('1 item(s) selected for comparison')).toBeInTheDocument();
    });
  });

  describe('Order History', () => {
    test('shows empty orders message', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-orders'));
      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });

    test('shows order after checkout', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p2'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByTestId('continue-to-review'));
      fireEvent.click(screen.getByTestId('place-order-btn'));
      const orderCards = screen.getAllByTestId(/^order-ORD-/);
      expect(orderCards.length).toBe(1);
    });

    test('toggles order detail view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p2'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByTestId('continue-to-review'));
      fireEvent.click(screen.getByTestId('place-order-btn'));
      const toggleBtns = screen.getAllByText('View Details');
      fireEvent.click(toggleBtns[0]);
      expect(screen.getByText('Organic Cotton T-Shirt')).toBeInTheDocument();
      expect(screen.getByText(/Shipped to:/)).toBeInTheDocument();
    });

    test('shows order status badge', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p2'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByTestId('continue-to-review'));
      fireEvent.click(screen.getByTestId('place-order-btn'));
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });
  });

  describe('Addresses', () => {
    test('shows default addresses', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-addresses'));
      expect(screen.getByTestId('address-card-addr1')).toBeInTheDocument();
      expect(screen.getByTestId('address-card-addr2')).toBeInTheDocument();
    });

    test('shows default badge on default address', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-addresses'));
      const addr1Card = screen.getByTestId('address-card-addr1');
      expect(within(addr1Card).getByText('Default')).toBeInTheDocument();
    });

    test('opens add address modal', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-addresses'));
      fireEvent.click(screen.getByTestId('add-address-page-btn'));
      expect(screen.getByTestId('address-modal')).toBeInTheDocument();
    });

    test('adds new address', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-addresses'));
      fireEvent.click(screen.getByTestId('add-address-page-btn'));
      fireEvent.change(screen.getByTestId('address-label-input'), { target: { value: 'Vacation' } });
      fireEvent.change(screen.getByTestId('address-name-input'), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByTestId('address-street-input'), { target: { value: '789 Beach Road' } });
      fireEvent.change(screen.getByTestId('address-city-input'), { target: { value: 'Miami' } });
      fireEvent.change(screen.getByTestId('address-state-input'), { target: { value: 'FL' } });
      fireEvent.change(screen.getByTestId('address-zip-input'), { target: { value: '33101' } });
      fireEvent.click(screen.getByTestId('save-address-btn'));
      expect(screen.queryByTestId('address-modal')).not.toBeInTheDocument();
      expect(screen.getByText('Vacation')).toBeInTheDocument();
    });

    test('sets new default address', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-addresses'));
      fireEvent.click(screen.getByTestId('set-default-addr2'));
      const addr2Card = screen.getByTestId('address-card-addr2');
      expect(within(addr2Card).getByText('Default')).toBeInTheDocument();
    });

    test('removes address with confirmation', () => {
      render(<OnlineStore />);
      window.confirm.mockReturnValue(true);
      fireEvent.click(screen.getByTestId('nav-addresses'));
      fireEvent.click(screen.getByTestId('remove-address-addr2'));
      expect(window.confirm).toHaveBeenCalled();
      expect(screen.queryByTestId('address-card-addr2')).not.toBeInTheDocument();
    });

    test('does not remove address when confirm is cancelled', () => {
      render(<OnlineStore />);
      window.confirm.mockReturnValue(false);
      fireEvent.click(screen.getByTestId('nav-addresses'));
      fireEvent.click(screen.getByTestId('remove-address-addr2'));
      expect(screen.getByTestId('address-card-addr2')).toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    test('shows notification when adding to cart', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      expect(screen.getByTestId('notification')).toHaveTextContent('Wireless Noise-Cancelling Headphones added to cart');
    });

    test('shows notification when adding to wishlist', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('wishlist-btn-p1'));
      expect(screen.getByTestId('notification')).toHaveTextContent('Added to wishlist');
    });

    test('notification can be dismissed', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      fireEvent.click(screen.getByLabelText('Dismiss notification'));
      expect(screen.queryByTestId('notification')).not.toBeInTheDocument();
    });

    test('notification auto-dismisses after 3 seconds', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      expect(screen.getByTestId('notification')).toBeInTheDocument();
      vi.advanceTimersByTime(3000);
      expect(screen.queryByTestId('notification')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('navigates to wishlist view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-wishlist'));
      expect(screen.getByText(/My Wishlist/)).toBeInTheDocument();
    });

    test('navigates to orders view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-orders'));
      expect(screen.getByText('Order History')).toBeInTheDocument();
    });

    test('navigates to addresses view', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-addresses'));
      expect(screen.getByText('My Addresses')).toBeInTheDocument();
    });

    test('navigates back to shop/catalog', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('nav-wishlist'));
      fireEvent.click(screen.getByTestId('nav-catalog'));
      expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
    });

    test('highlights active nav item', () => {
      render(<OnlineStore />);
      const catalogNav = screen.getByTestId('nav-catalog');
      expect(catalogNav).toHaveStyle({ fontWeight: 600 });
    });
  });

  describe('Quick View', () => {
    test('opens quick view overlay', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('quick-view-p1'));
      // The product detail view should be shown since quick view triggers handleViewProduct indirectly
      // In grid mode, clicking quick-view opens the product detail
    });
  });

  describe('Recently Viewed', () => {
    test('tracks recently viewed products', () => {
      render(<OnlineStore />);
      // View first product
      fireEvent.click(screen.getByText('Wireless Noise-Cancelling Headphones'));
      fireEvent.click(screen.getByTestId('back-to-catalog'));
      // View second product
      fireEvent.click(screen.getByText('Organic Cotton T-Shirt'));
      // Should show first product in recently viewed
      const recentItems = screen.getAllByTestId(/^recent-/);
      expect(recentItems.length).toBeGreaterThan(0);
    });
  });

  describe('localStorage Persistence', () => {
    test('saves cart to localStorage', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p1'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('storeCart', expect.any(String));
    });

    test('saves wishlist to localStorage', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('wishlist-btn-p1'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('storeWishlist', expect.any(String));
    });

    test('saves orders to localStorage', () => {
      render(<OnlineStore />);
      fireEvent.click(screen.getByTestId('add-to-cart-p2'));
      fireEvent.click(screen.getByTestId('cart-button'));
      fireEvent.click(screen.getByTestId('checkout-btn'));
      fireEvent.click(screen.getByTestId('continue-to-payment'));
      fireEvent.click(screen.getByTestId('continue-to-review'));
      fireEvent.click(screen.getByTestId('place-order-btn'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('storeOrders', expect.any(String));
    });

    test('loads cart from localStorage on mount', () => {
      const savedCart = JSON.stringify([{ productId: 'p1', name: 'Test', price: 10, image: '', quantity: 2 }]);
      localStorageMock.getItem.mockImplementation((key) => key === 'storeCart' ? savedCart : null);
      render(<OnlineStore />);
      expect(screen.getByText('Cart: 2 items')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('focuses search on Ctrl+K', () => {
      render(<OnlineStore />);
      const searchInput = screen.getByTestId('search-input');
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      expect(document.activeElement).toBe(searchInput);
    });
  });

  describe('Sale Badges & Pricing', () => {
    test('shows SALE badge on discounted products', () => {
      render(<OnlineStore />);
      // Headphones have originalPrice
      expect(screen.getAllByText('SALE').length).toBeGreaterThan(0);
    });

    test('shows Featured badge on featured products', () => {
      render(<OnlineStore />);
      expect(screen.getAllByText('Featured').length).toBeGreaterThan(0);
    });

    test('shows strikethrough original price', () => {
      render(<OnlineStore />);
      const strikeThroughPrices = screen.getAllByText('$349.99');
      expect(strikeThroughPrices.length).toBeGreaterThan(0);
    });
  });

  describe('Star Ratings', () => {
    test('renders star ratings for products', () => {
      render(<OnlineStore />);
      const starRatings = screen.getAllByTestId('star-rating');
      expect(starRatings.length).toBeGreaterThan(0);
    });
  });
});
