import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InventoryAdmin from './src/app/page.jsx';

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

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock document.createElement('a').click for CSV export
const mockClick = vi.fn();
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  const el = originalCreateElement(tag);
  if (tag === 'a') {
    el.click = mockClick;
  }
  return el;
});

describe('InventoryAdmin Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with InvenTrack title', () => {
      render(<InventoryAdmin />);
      expect(screen.getByText(/InvenTrack/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<InventoryAdmin />);
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Suppliers')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Warehouses')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Stock Alerts')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<InventoryAdmin />);
      expect(screen.getByPlaceholderText('Search products... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls', () => {
      render(<InventoryAdmin />);
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by supplier')).toBeInTheDocument();
    });

    test('renders products table by default', () => {
      render(<InventoryAdmin />);
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
      expect(screen.getByText('USB-C Charging Cable 6ft')).toBeInTheDocument();
    });

    test('renders New Product button', () => {
      render(<InventoryAdmin />);
      expect(screen.getByText('+ New Product')).toBeInTheDocument();
    });

    test('renders sidebar stats', () => {
      render(<InventoryAdmin />);
      expect(screen.getByText(/Total Products:/)).toBeInTheDocument();
      expect(screen.getByText(/Active:/)).toBeInTheDocument();
      expect(screen.getByText(/Low Stock:/)).toBeInTheDocument();
      expect(screen.getByText(/Out of Stock:/)).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<InventoryAdmin />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<InventoryAdmin />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('inventoryTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<InventoryAdmin />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('inventoryTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'inventoryTheme') return 'dark';
        return null;
      });
      render(<InventoryAdmin />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Products shows products table', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Products'));
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
    });

    test('clicking Orders shows orders view', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      expect(screen.getByText(/Orders \(/)).toBeInTheDocument();
    });

    test('clicking Suppliers shows supplier cards', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Suppliers'));
      expect(screen.getByText('TechParts Inc.')).toBeInTheDocument();
      expect(screen.getByText('Global Textiles')).toBeInTheDocument();
      expect(screen.getByText('FreshFoods Co.')).toBeInTheDocument();
    });

    test('clicking Categories shows category cards', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Categories'));
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Food & Beverage')).toBeInTheDocument();
    });

    test('clicking Warehouses shows warehouse cards', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Warehouses'));
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.getByText('Overflow Storage')).toBeInTheDocument();
      expect(screen.getByText('Cold Storage')).toBeInTheDocument();
    });

    test('clicking Analytics shows analytics view', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Inventory Analytics')).toBeInTheDocument();
    });

    test('clicking Stock Alerts shows alerts view', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Stock Alerts'));
      expect(screen.getByText(/Stock Alerts/)).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('inventoryView', 'orders');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<InventoryAdmin />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<InventoryAdmin />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Products')).not.toBeInTheDocument();
      expect(screen.queryByText('Orders')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<InventoryAdmin />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search input filters products by name', () => {
      render(<InventoryAdmin />);
      const searchInput = screen.getByPlaceholderText('Search products... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Headphones' } });
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
      expect(screen.queryByText('USB-C Charging Cable 6ft')).not.toBeInTheDocument();
    });

    test('search input filters products by SKU', () => {
      render(<InventoryAdmin />);
      const searchInput = screen.getByPlaceholderText('Search products... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'ELEC-001' } });
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
    });

    test('search input filters products by tags', () => {
      render(<InventoryAdmin />);
      const searchInput = screen.getByPlaceholderText('Search products... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'yoga' } });
      expect(screen.getByText('Yoga Mat Premium')).toBeInTheDocument();
    });

    test('clearing search shows all products again', () => {
      render(<InventoryAdmin />);
      const searchInput = screen.getByPlaceholderText('Search products... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Headphones' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
      expect(screen.getByText('USB-C Charging Cable 6ft')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('filtering by Electronics shows only electronics products', () => {
      render(<InventoryAdmin />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'cat1' } });
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
      expect(screen.getByText('USB-C Charging Cable 6ft')).toBeInTheDocument();
      expect(screen.queryByText('Organic Cotton T-Shirt')).not.toBeInTheDocument();
    });

    test('selecting All Categories shows all products', () => {
      render(<InventoryAdmin />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'cat1' } });
      fireEvent.change(categoryFilter, { target: { value: 'all' } });
      expect(screen.getByText('Organic Cotton T-Shirt')).toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    test('filtering by out_of_stock shows only out of stock products', () => {
      render(<InventoryAdmin />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'out_of_stock' } });
      expect(screen.getByText('Yoga Mat Premium')).toBeInTheDocument();
      expect(screen.queryByText('Wireless Bluetooth Headphones')).not.toBeInTheDocument();
    });

    test('filtering by low_stock shows low stock products', () => {
      render(<InventoryAdmin />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'low_stock' } });
      expect(screen.getByText('Smart Watch Band')).toBeInTheDocument();
      expect(screen.getByText('Garden Tool Set')).toBeInTheDocument();
    });
  });

  describe('Supplier Filter', () => {
    test('filtering by supplier shows only their products', () => {
      render(<InventoryAdmin />);
      const supplierFilter = screen.getByLabelText('Filter by supplier');
      fireEvent.change(supplierFilter, { target: { value: 'sup3' } });
      expect(screen.getByText('Artisan Granola Mix')).toBeInTheDocument();
      expect(screen.getByText('Protein Bar Variety Pack')).toBeInTheDocument();
      expect(screen.queryByText('Wireless Bluetooth Headphones')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    test('clicking Product header sorts by name', () => {
      render(<InventoryAdmin />);
      const productHeader = screen.getByText(/Product/);
      fireEvent.click(productHeader);
      // Should show sort direction indicator
      expect(screen.getByText(/Product.*▲|Product.*▼/)).toBeInTheDocument();
    });

    test('clicking Price header sorts by price', () => {
      render(<InventoryAdmin />);
      const priceHeader = screen.getByText(/^Price/);
      fireEvent.click(priceHeader);
      expect(screen.getByText(/Price.*▲|Price.*▼/)).toBeInTheDocument();
    });

    test('clicking Stock header sorts by stock', () => {
      render(<InventoryAdmin />);
      const stockHeader = screen.getByText(/^Stock/);
      fireEvent.click(stockHeader);
      expect(screen.getByText(/Stock.*▲|Stock.*▼/)).toBeInTheDocument();
    });

    test('clicking same header toggles sort direction', () => {
      render(<InventoryAdmin />);
      const priceHeader = screen.getByText(/^Price/);
      fireEvent.click(priceHeader);
      fireEvent.click(priceHeader);
      // Direction should toggle
      expect(screen.getByText(/Price.*▲|Price.*▼/)).toBeInTheDocument();
    });
  });

  describe('Product Detail Modal', () => {
    test('clicking a product row opens detail modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText(/Premium wireless headphones/)).toBeInTheDocument();
    });

    test('modal shows product description', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText(/noise cancellation/)).toBeInTheDocument();
    });

    test('modal shows price, cost, and margin', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Cost')).toBeInTheDocument();
      expect(screen.getByText('Margin')).toBeInTheDocument();
    });

    test('modal shows stock level bar', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText(/Stock Level:/)).toBeInTheDocument();
    });

    test('modal shows supplier details', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText('TechParts Inc.')).toBeInTheDocument();
      expect(screen.getByText('mike@techparts.com')).toBeInTheDocument();
    });

    test('modal shows product tags', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText('#wireless')).toBeInTheDocument();
      expect(screen.getByText('#audio')).toBeInTheDocument();
      expect(screen.getByText('#bluetooth')).toBeInTheDocument();
    });

    test('modal shows order history for the product', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText('Order History')).toBeInTheDocument();
    });

    test('close button closes modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText(/Premium wireless headphones/)).toBeInTheDocument();
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      expect(screen.queryByText(/Premium wireless headphones/)).not.toBeInTheDocument();
    });

    test('modal has Edit Product button', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });

    test('modal has Order Restock button', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText('Order Restock')).toBeInTheDocument();
    });

    test('modal has Discontinue button for active products', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText('Discontinue')).toBeInTheDocument();
    });
  });

  describe('Create Product Modal', () => {
    test('clicking New Product opens create modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('+ New Product'));
      expect(screen.getByText('Create New Product')).toBeInTheDocument();
    });

    test('create modal has all form fields', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('+ New Product'));
      expect(screen.getByText('Name *')).toBeInTheDocument();
      expect(screen.getByText('SKU *')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Price ($)')).toBeInTheDocument();
      expect(screen.getByText('Cost ($)')).toBeInTheDocument();
      expect(screen.getByText('Min Stock')).toBeInTheDocument();
      expect(screen.getByText('Max Stock')).toBeInTheDocument();
      expect(screen.getByText('Tags (comma separated)')).toBeInTheDocument();
    });

    test('cancel button closes create modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('+ New Product'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Product')).not.toBeInTheDocument();
    });

    test('submitting form creates a new product', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('+ New Product'));

      const form = screen.getByText('Create New Product').closest('div').querySelector('form');
      const nameField = form.querySelector('input[name="name"]');
      const skuField = form.querySelector('input[name="sku"]');
      fireEvent.change(nameField, { target: { value: 'Brand New Widget' } });
      fireEvent.change(skuField, { target: { value: 'NEW-001' } });

      fireEvent.click(screen.getByText('Create Product'));

      // Modal should close
      expect(screen.queryByText('Create New Product')).not.toBeInTheDocument();
      // New product should appear in the table
      expect(screen.getByText('Brand New Widget')).toBeInTheDocument();
    });

    test('close button (×) closes create modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('+ New Product'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Create New Product')).not.toBeInTheDocument();
    });
  });

  describe('Edit Product Modal', () => {
    test('clicking Edit button opens edit modal', () => {
      render(<InventoryAdmin />);
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });

    test('edit modal pre-populates with product data', () => {
      render(<InventoryAdmin />);
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByDisplayValue('Wireless Bluetooth Headphones')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ELEC-001')).toBeInTheDocument();
    });

    test('saving changes updates the product', () => {
      render(<InventoryAdmin />);
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      const nameInput = screen.getByDisplayValue('Wireless Bluetooth Headphones');
      fireEvent.change(nameInput, { target: { value: 'Updated Headphones Pro' } });
      fireEvent.click(screen.getByText('Save Changes'));
      expect(screen.getByText('Updated Headphones Pro')).toBeInTheDocument();
    });
  });

  describe('Delete Product', () => {
    test('clicking Del button shows confirmation dialog', () => {
      window.confirm.mockReturnValue(false);
      render(<InventoryAdmin />);
      const delButtons = screen.getAllByText('Del');
      fireEvent.click(delButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming delete removes product', () => {
      window.confirm.mockReturnValue(true);
      render(<InventoryAdmin />);
      const delButtons = screen.getAllByText('Del');
      fireEvent.click(delButtons[0]);
      expect(screen.queryByText('Wireless Bluetooth Headphones')).not.toBeInTheDocument();
    });

    test('canceling delete keeps product', () => {
      window.confirm.mockReturnValue(false);
      render(<InventoryAdmin />);
      const delButtons = screen.getAllByText('Del');
      fireEvent.click(delButtons[0]);
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
    });
  });

  describe('Bulk Selection', () => {
    test('selecting products shows bulk actions bar', () => {
      render(<InventoryAdmin />);
      const checkbox = screen.getByLabelText('Select Wireless Bluetooth Headphones');
      fireEvent.click(checkbox);
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    test('selecting multiple products shows correct count', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByLabelText('Select Wireless Bluetooth Headphones'));
      fireEvent.click(screen.getByLabelText('Select USB-C Charging Cable 6ft'));
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    test('select all checkbox selects all visible products', () => {
      render(<InventoryAdmin />);
      const selectAll = screen.getByLabelText('Select all products');
      fireEvent.click(selectAll);
      expect(screen.getByText(/selected/)).toBeInTheDocument();
    });

    test('bulk delete removes selected products after confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByLabelText('Select Wireless Bluetooth Headphones'));
      fireEvent.click(screen.getByText('Delete Selected'));
      expect(screen.queryByText('Wireless Bluetooth Headphones')).not.toBeInTheDocument();
    });

    test('bulk discontinue changes status of selected products', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByLabelText('Select Wireless Bluetooth Headphones'));
      fireEvent.click(screen.getByText('Discontinue'));
      // Selection should be cleared
      expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    });

    test('cancel button clears selection', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByLabelText('Select Wireless Bluetooth Headphones'));
      expect(screen.getByText('1 selected')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    });
  });

  describe('Orders View', () => {
    test('shows order list with details', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      expect(screen.getByText('ord1')).toBeInTheDocument();
      expect(screen.getByText('ord2')).toBeInTheDocument();
    });

    test('shows New Order button', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      expect(screen.getByText('+ New Order')).toBeInTheDocument();
    });

    test('clicking New Order opens order modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      fireEvent.click(screen.getByText('+ New Order'));
      expect(screen.getByText('Create Restock Order')).toBeInTheDocument();
    });

    test('Mark Delivered button exists for in-transit orders', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      const deliverButtons = screen.getAllByText('Mark Delivered');
      expect(deliverButtons.length).toBeGreaterThan(0);
    });

    test('marking order as delivered updates stock', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      const deliverButtons = screen.getAllByText('Mark Delivered');
      fireEvent.click(deliverButtons[0]);
      // Status should change to delivered
      const deliveredBadges = screen.getAllByText('delivered');
      expect(deliveredBadges.length).toBeGreaterThan(0);
    });

    test('cancel button exists for pending/in-transit orders', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      const cancelButtons = screen.getAllByText('Cancel');
      expect(cancelButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Order Modal', () => {
    test('order modal has product select', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      fireEvent.click(screen.getByText('+ New Order'));
      expect(screen.getByLabelText('Select product')).toBeInTheDocument();
    });

    test('order modal has quantity input', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      fireEvent.click(screen.getByText('+ New Order'));
      expect(screen.getByLabelText('Order quantity')).toBeInTheDocument();
    });

    test('submitting order creates new order', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      fireEvent.click(screen.getByText('+ New Order'));

      const productSelect = screen.getByLabelText('Select product');
      fireEvent.change(productSelect, { target: { value: 'p1' } });
      const quantityInput = screen.getByLabelText('Order quantity');
      fireEvent.change(quantityInput, { target: { value: '50' } });
      fireEvent.click(screen.getByText('Place Order'));

      // Modal should close
      expect(screen.queryByText('Create Restock Order')).not.toBeInTheDocument();
    });
  });

  describe('Suppliers View', () => {
    test('renders all supplier cards', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Suppliers'));
      expect(screen.getByText('TechParts Inc.')).toBeInTheDocument();
      expect(screen.getByText('Global Textiles')).toBeInTheDocument();
      expect(screen.getByText('FreshFoods Co.')).toBeInTheDocument();
      expect(screen.getByText('HomeStyle Supply')).toBeInTheDocument();
      expect(screen.getByText('ActiveGear Ltd.')).toBeInTheDocument();
      expect(screen.getByText('BookWorld Dist.')).toBeInTheDocument();
    });

    test('shows supplier contact info', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Suppliers'));
      expect(screen.getByText('mike@techparts.com')).toBeInTheDocument();
      expect(screen.getByText('555-0101')).toBeInTheDocument();
    });

    test('shows supplier locations', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Suppliers'));
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('New York, NY')).toBeInTheDocument();
    });

    test('shows supplier product stats', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Suppliers'));
      const productsLabels = screen.getAllByText('Products');
      expect(productsLabels.length).toBeGreaterThan(0);
      const unitsLabels = screen.getAllByText('Units');
      expect(unitsLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Categories View', () => {
    test('renders all category cards', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Categories'));
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Food & Beverage')).toBeInTheDocument();
      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
      expect(screen.getByText('Sports')).toBeInTheDocument();
      expect(screen.getByText('Books & Media')).toBeInTheDocument();
    });

    test('shows category stats', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Categories'));
      const productsLabels = screen.getAllByText('Products');
      expect(productsLabels.length).toBeGreaterThan(0);
      const stockLabels = screen.getAllByText('Total Stock');
      expect(stockLabels.length).toBeGreaterThan(0);
      const valueLabels = screen.getAllByText('Inventory Value');
      expect(valueLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Warehouses View', () => {
    test('renders all warehouse cards', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Warehouses'));
      expect(screen.getByText('Main Warehouse')).toBeInTheDocument();
      expect(screen.getByText('Overflow Storage')).toBeInTheDocument();
      expect(screen.getByText('Cold Storage')).toBeInTheDocument();
    });

    test('shows warehouse locations', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Warehouses'));
      expect(screen.getByText('Building A')).toBeInTheDocument();
      expect(screen.getByText('Building B')).toBeInTheDocument();
      expect(screen.getByText('Building C')).toBeInTheDocument();
    });

    test('shows warehouse utilization', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Warehouses'));
      const utilizationTexts = screen.getAllByText(/Utilization:/);
      expect(utilizationTexts.length).toBe(3);
    });
  });

  describe('Analytics View', () => {
    test('renders stats cards', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('Inventory Value')).toBeInTheDocument();
      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('Avg Margin')).toBeInTheDocument();
      expect(screen.getByText('Pending Orders')).toBeInTheDocument();
      expect(screen.getByText('In Transit')).toBeInTheDocument();
    });

    test('shows correct total products count', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('16')).toBeInTheDocument();
    });

    test('renders status breakdown', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Status Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
      expect(screen.getByText('Discontinued')).toBeInTheDocument();
    });

    test('renders top sellers section', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Top Sellers')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    test('renders category performance table', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Category Performance')).toBeInTheDocument();
    });
  });

  describe('Stock Alerts View', () => {
    test('shows alerts for low stock and out of stock products', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Stock Alerts'));
      // p4 (Artisan Granola) is below minStock, p6 (Yoga Mat) is out of stock,
      // p8 (Smart Watch Band) is low_stock, p14 (Garden Tool Set) is low_stock
      expect(screen.getByText('Artisan Granola Mix')).toBeInTheDocument();
      expect(screen.getByText('Yoga Mat Premium')).toBeInTheDocument();
    });

    test('shows severity badges on alerts', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Stock Alerts'));
      const criticalBadges = screen.getAllByText('critical');
      expect(criticalBadges.length).toBeGreaterThan(0);
    });

    test('shows current stock and minimum stock', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Stock Alerts'));
      const stockTexts = screen.getAllByText(/Current stock:/);
      expect(stockTexts.length).toBeGreaterThan(0);
    });

    test('Order Restock button exists on alerts', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Stock Alerts'));
      const restockButtons = screen.getAllByText('Order Restock');
      expect(restockButtons.length).toBeGreaterThan(0);
    });

    test('clicking Order Restock opens order modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Stock Alerts'));
      const restockButtons = screen.getAllByText('Order Restock');
      fireEvent.click(restockButtons[0]);
      expect(screen.getByText('Create Restock Order')).toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    test('clicking bell icon shows notification panel', () => {
      render(<InventoryAdmin />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    test('clicking bell icon again hides notification panel', () => {
      render(<InventoryAdmin />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      fireEvent.click(bellButton);
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });

    test('creating a product adds notification', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('+ New Product'));
      const form = screen.getByText('Create New Product').closest('div').querySelector('form');
      const nameField = form.querySelector('input[name="name"]');
      const skuField = form.querySelector('input[name="sku"]');
      fireEvent.change(nameField, { target: { value: 'Notification Test' } });
      fireEvent.change(skuField, { target: { value: 'TEST-001' } });
      fireEvent.click(screen.getByText('Create Product'));

      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText(/Notification Test.*created/)).toBeInTheDocument();
    });

    test('mark all read button works', () => {
      render(<InventoryAdmin />);
      // Create a product to generate a notification
      fireEvent.click(screen.getByText('+ New Product'));
      const form = screen.getByText('Create New Product').closest('div').querySelector('form');
      const nameField = form.querySelector('input[name="name"]');
      const skuField = form.querySelector('input[name="sku"]');
      fireEvent.change(nameField, { target: { value: 'Test' } });
      fireEvent.change(skuField, { target: { value: 'T-001' } });
      fireEvent.click(screen.getByText('Create Product'));

      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      fireEvent.click(screen.getByText('Mark all read'));
    });
  });

  describe('Export CSV', () => {
    test('clicking Export button triggers CSV download', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('📥 Export'));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('export generates notification', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('📥 Export'));
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Inventory exported to CSV')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    test('shows page information', () => {
      render(<InventoryAdmin />);
      expect(screen.getByText(/Page \d+ of \d+/)).toBeInTheDocument();
    });

    test('shows items per page select', () => {
      render(<InventoryAdmin />);
      expect(screen.getByLabelText('Items per page')).toBeInTheDocument();
    });

    test('changing items per page updates pagination', () => {
      render(<InventoryAdmin />);
      const itemsPerPage = screen.getByLabelText('Items per page');
      fireEvent.change(itemsPerPage, { target: { value: '5' } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('inventoryItemsPerPage', '5');
    });

    test('next page button navigates to next page', () => {
      render(<InventoryAdmin />);
      // With 16 products and 10 per page, there should be 2 pages
      const nextButton = screen.getByText('→');
      fireEvent.click(nextButton);
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

    test('previous page button navigates back', () => {
      render(<InventoryAdmin />);
      const nextButton = screen.getByText('→');
      fireEvent.click(nextButton);
      const prevButton = screen.getByText('←');
      fireEvent.click(prevButton);
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    test('first and last page buttons work', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Last'));
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
      fireEvent.click(screen.getByText('First'));
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes product detail modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Wireless Bluetooth Headphones'));
      expect(screen.getByText(/Premium wireless headphones/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Premium wireless headphones/)).not.toBeInTheDocument();
    });

    test('Escape key closes create modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('+ New Product'));
      expect(screen.getByText('Create New Product')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Product')).not.toBeInTheDocument();
    });

    test('Escape key closes edit modal', () => {
      render(<InventoryAdmin />);
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
    });

    test('Escape key closes order modal', () => {
      render(<InventoryAdmin />);
      fireEvent.click(screen.getByText('Orders'));
      fireEvent.click(screen.getByText('+ New Order'));
      expect(screen.getByText('Create Restock Order')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create Restock Order')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('products are saved to localStorage', () => {
      render(<InventoryAdmin />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'inventoryProducts',
        expect.any(String)
      );
    });

    test('orders are saved to localStorage', () => {
      render(<InventoryAdmin />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'inventoryOrders',
        expect.any(String)
      );
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'inventoryView') return 'analytics';
        return null;
      });
      render(<InventoryAdmin />);
      expect(screen.getByText('Inventory Analytics')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'inventoryProducts') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<InventoryAdmin />)).not.toThrow();
    });
  });

  describe('Combined Filters', () => {
    test('search and category filter work together', () => {
      render(<InventoryAdmin />);
      const searchInput = screen.getByPlaceholderText('Search products... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Cable' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'cat1' } });
      expect(screen.getByText('USB-C Charging Cable 6ft')).toBeInTheDocument();
    });

    test('non-matching combined filters show no products', () => {
      render(<InventoryAdmin />);
      const searchInput = screen.getByPlaceholderText('Search products... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Headphones' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'cat2' } });
      // Headphones is Electronics, not Clothing
      expect(screen.queryByText('Wireless Bluetooth Headphones')).not.toBeInTheDocument();
    });

    test('status and supplier filter work together', () => {
      render(<InventoryAdmin />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'active' } });
      const supplierFilter = screen.getByLabelText('Filter by supplier');
      fireEvent.change(supplierFilter, { target: { value: 'sup1' } });
      expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
      expect(screen.getByText('USB-C Charging Cable 6ft')).toBeInTheDocument();
      // Discontinued mouse should not appear
      expect(screen.queryByText('Wireless Mouse Ergonomic')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<InventoryAdmin />)).not.toThrow();
    });
  });
});
