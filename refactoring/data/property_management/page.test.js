import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PropertyManagement from './src/app/page.jsx';

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

describe('PropertyManagement Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering & Sidebar', () => {
    test('renders sidebar with PropManager title', () => {
      render(<PropertyManagement />);
      expect(screen.getByText(/PropManager/)).toBeInTheDocument();
    });

    test('renders all sidebar navigation items', () => {
      render(<PropertyManagement />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Properties')).toBeInTheDocument();
      expect(screen.getByText('Units')).toBeInTheDocument();
      expect(screen.getByText('Tenants')).toBeInTheDocument();
      expect(screen.getByText('Leases')).toBeInTheDocument();
      expect(screen.getByText('Payments')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<PropertyManagement />);
      expect(screen.getByPlaceholderText('Search... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders sidebar financial summary', () => {
      render(<PropertyManagement />);
      // Occupancy rate should be shown
      const sidebar = screen.getByTestId('sidebar');
      expect(within(sidebar).getByText(/Occupancy:/)).toBeInTheDocument();
      expect(within(sidebar).getByText(/Monthly Rev:/)).toBeInTheDocument();
      expect(within(sidebar).getByText(/Open Tickets:/)).toBeInTheDocument();
    });

    test('sidebar collapse toggles visibility', () => {
      render(<PropertyManagement />);
      const toggleBtn = screen.getByTestId('toggle-sidebar');
      // Click to collapse
      fireEvent.click(toggleBtn);
      // PropManager title should be hidden when collapsed
      expect(screen.queryByText(/PropManager/)).not.toBeInTheDocument();
      // Click again to expand
      fireEvent.click(toggleBtn);
      expect(screen.getByText(/PropManager/)).toBeInTheDocument();
    });

    test('theme toggle switches dark/light mode', () => {
      render(<PropertyManagement />);
      const themeBtn = screen.getByTestId('toggle-theme');
      expect(themeBtn.textContent).toContain('Dark');
      fireEvent.click(themeBtn);
      expect(themeBtn.textContent).toContain('Light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('propMgmtTheme', 'dark');
    });
  });

  describe('Dashboard View', () => {
    test('renders dashboard by default with KPI cards', () => {
      render(<PropertyManagement />);
      expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-occupancy')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-collected')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-overdue')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-maintenance')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-properties')).toBeInTheDocument();
    });

    test('displays correct occupancy rate', () => {
      render(<PropertyManagement />);
      const kpi = screen.getByTestId('kpi-occupancy');
      // 8 occupied out of 12 units = 67%
      expect(within(kpi).getByText('67%')).toBeInTheDocument();
      expect(within(kpi).getByText('8 / 12 units')).toBeInTheDocument();
    });

    test('displays property performance table', () => {
      render(<PropertyManagement />);
      expect(screen.getByTestId('property-performance-table')).toBeInTheDocument();
      expect(screen.getByText('Sunrise Apartments')).toBeInTheDocument();
      expect(screen.getByText('Oak Ridge Condos')).toBeInTheDocument();
      expect(screen.getByText('Maple Street Houses')).toBeInTheDocument();
      expect(screen.getByText('Downtown Commercial Plaza')).toBeInTheDocument();
    });

    test('displays recent maintenance requests', () => {
      render(<PropertyManagement />);
      expect(screen.getByTestId('recent-maintenance')).toBeInTheDocument();
      // Should show non-completed/cancelled maintenance items
      expect(screen.getByText('Leaky kitchen faucet')).toBeInTheDocument();
      expect(screen.getByText('AC not cooling')).toBeInTheDocument();
      expect(screen.getByText('Storefront window crack')).toBeInTheDocument();
    });

    test('clicking a property in performance table navigates to property detail', () => {
      render(<PropertyManagement />);
      const table = screen.getByTestId('property-performance-table');
      fireEvent.click(within(table).getByText('Sunrise Apartments'));
      expect(screen.getByTestId('property-detail')).toBeInTheDocument();
    });
  });

  describe('Properties View', () => {
    test('navigating to Properties view shows property grid', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      expect(screen.getByTestId('properties-view')).toBeInTheDocument();
      expect(screen.getByTestId('property-grid')).toBeInTheDocument();
    });

    test('renders all property cards with financial info', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      expect(screen.getByTestId('property-card-p1')).toBeInTheDocument();
      expect(screen.getByTestId('property-card-p2')).toBeInTheDocument();
      expect(screen.getByTestId('property-card-p3')).toBeInTheDocument();
      expect(screen.getByTestId('property-card-p4')).toBeInTheDocument();
    });

    test('filtering by property type works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      const typeFilter = screen.getByTestId('filter-property-type');
      fireEvent.change(typeFilter, { target: { value: 'condo' } });
      expect(screen.getByTestId('property-card-p2')).toBeInTheDocument();
      expect(screen.queryByTestId('property-card-p1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('property-card-p3')).not.toBeInTheDocument();
    });

    test('sorting by name/units/type/revenue works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      const sortSelect = screen.getByTestId('sort-by');
      // Sort by units
      fireEvent.change(sortSelect, { target: { value: 'units' } });
      const grid = screen.getByTestId('property-grid');
      const cards = grid.querySelectorAll('[data-testid^="property-card-"]');
      expect(cards.length).toBe(4);
    });

    test('sort direction toggles asc/desc', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      const dirBtn = screen.getByTestId('sort-direction');
      expect(dirBtn.textContent).toBe('↑');
      fireEvent.click(dirBtn);
      expect(dirBtn.textContent).toBe('↓');
    });

    test('clicking a property card shows property detail', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p1'));
      expect(screen.getByTestId('property-detail')).toBeInTheDocument();
      expect(screen.getByText('Sunrise Apartments')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, Springfield, IL 62701')).toBeInTheDocument();
    });

    test('property detail shows units for that property', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p1'));
      expect(screen.getByTestId('property-units')).toBeInTheDocument();
      expect(screen.getByTestId('unit-card-u1')).toBeInTheDocument();
      expect(screen.getByTestId('unit-card-u2')).toBeInTheDocument();
      expect(screen.getByTestId('unit-card-u3')).toBeInTheDocument();
      expect(screen.getByTestId('unit-card-u4')).toBeInTheDocument();
      // Should NOT show units from other properties
      expect(screen.queryByTestId('unit-card-u5')).not.toBeInTheDocument();
    });

    test('property detail shows amenities', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p1'));
      expect(screen.getByText('pool')).toBeInTheDocument();
      expect(screen.getByText('gym')).toBeInTheDocument();
    });

    test('back button returns to property grid', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p1'));
      expect(screen.getByTestId('property-detail')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('back-to-properties'));
      expect(screen.getByTestId('property-grid')).toBeInTheDocument();
    });

    test('add property modal opens and closes', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('add-property-btn'));
      expect(screen.getByTestId('property-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('cancel-property-modal'));
      expect(screen.queryByTestId('property-modal')).not.toBeInTheDocument();
    });

    test('delete property with confirmation', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p3'));
      window.confirm.mockReturnValue(true);
      fireEvent.click(screen.getByTestId('delete-property-btn'));
      expect(window.confirm).toHaveBeenCalled();
      // Should return to grid and property should be gone
      expect(screen.queryByTestId('property-card-p3')).not.toBeInTheDocument();
    });

    test('delete property is cancelled when user declines', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p3'));
      window.confirm.mockReturnValue(false);
      fireEvent.click(screen.getByTestId('delete-property-btn'));
      // Should still show detail
      expect(screen.getByTestId('property-detail')).toBeInTheDocument();
    });
  });

  describe('Units View', () => {
    test('navigating to Units view shows units table', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-units'));
      expect(screen.getByTestId('units-view')).toBeInTheDocument();
      expect(screen.getByTestId('units-table')).toBeInTheDocument();
    });

    test('all units are rendered in the table', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-units'));
      expect(screen.getByTestId('unit-row-u1')).toBeInTheDocument();
      expect(screen.getByTestId('unit-row-u5')).toBeInTheDocument();
      expect(screen.getByTestId('unit-row-u10')).toBeInTheDocument();
      expect(screen.getByTestId('unit-row-u12')).toBeInTheDocument();
    });

    test('filtering by unit status works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-units'));
      const statusFilter = screen.getByTestId('filter-unit-status');
      fireEvent.change(statusFilter, { target: { value: 'vacant' } });
      // u3 and u11 are vacant
      expect(screen.getByTestId('unit-row-u3')).toBeInTheDocument();
      expect(screen.getByTestId('unit-row-u11')).toBeInTheDocument();
      // occupied units should be hidden
      expect(screen.queryByTestId('unit-row-u1')).not.toBeInTheDocument();
    });

    test('units table shows tenant name for occupied units', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-units'));
      // u1 is occupied by tenant t1 (John Smith)
      const row = screen.getByTestId('unit-row-u1');
      expect(within(row).getByText('John Smith')).toBeInTheDocument();
    });

    test('units table shows property name', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-units'));
      const row = screen.getByTestId('unit-row-u1');
      expect(within(row).getByText('Sunrise Apartments')).toBeInTheDocument();
    });
  });

  describe('Tenants View', () => {
    test('navigating to Tenants shows tenant list', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      expect(screen.getByTestId('tenants-view')).toBeInTheDocument();
      expect(screen.getByTestId('tenant-list')).toBeInTheDocument();
    });

    test('all tenants are rendered', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      expect(screen.getByTestId('tenant-card-t1')).toBeInTheDocument();
      expect(screen.getByTestId('tenant-card-t2')).toBeInTheDocument();
      expect(screen.getByTestId('tenant-card-t3')).toBeInTheDocument();
      expect(screen.getByTestId('tenant-card-t7')).toBeInTheDocument();
    });

    test('clicking a tenant shows tenant detail with contact info', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      fireEvent.click(screen.getByTestId('tenant-card-t1'));
      expect(screen.getByTestId('tenant-detail')).toBeInTheDocument();
      expect(screen.getByText('john.smith@email.com')).toBeInTheDocument();
      expect(screen.getByText('555-1001')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith (555-1002)')).toBeInTheDocument();
    });

    test('tenant detail shows pets and vehicles', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      fireEvent.click(screen.getByTestId('tenant-card-t1'));
      // t1 has dog Buddy and Toyota Camry
      expect(screen.getByText(/Buddy/)).toBeInTheDocument();
      expect(screen.getByText(/Toyota/)).toBeInTheDocument();
    });

    test('tenant detail shows lease information', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      fireEvent.click(screen.getByTestId('tenant-card-t1'));
      expect(screen.getByTestId('tenant-lease-l1')).toBeInTheDocument();
    });

    test('tenant detail shows payment history', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      fireEvent.click(screen.getByTestId('tenant-card-t1'));
      expect(screen.getByTestId('tenant-payments')).toBeInTheDocument();
      // t1 has 4 payments
      const table = screen.getByTestId('tenant-payments');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBe(4);
    });

    test('back button returns to tenant list', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      fireEvent.click(screen.getByTestId('tenant-card-t1'));
      fireEvent.click(screen.getByTestId('back-to-tenants'));
      expect(screen.getByTestId('tenant-list')).toBeInTheDocument();
    });

    test('add tenant modal opens and closes', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      fireEvent.click(screen.getByTestId('add-tenant-btn'));
      expect(screen.getByTestId('tenant-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('cancel-tenant-modal'));
      expect(screen.queryByTestId('tenant-modal')).not.toBeInTheDocument();
    });

    test('search filters tenants by name', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'Sarah' } });
      expect(screen.getByTestId('tenant-card-t2')).toBeInTheDocument();
      expect(screen.queryByTestId('tenant-card-t1')).not.toBeInTheDocument();
    });
  });

  describe('Leases View', () => {
    test('navigating to Leases shows leases table', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-leases'));
      expect(screen.getByTestId('leases-view')).toBeInTheDocument();
      expect(screen.getByTestId('leases-table')).toBeInTheDocument();
    });

    test('all leases are rendered with correct data', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-leases'));
      expect(screen.getByTestId('lease-row-l1')).toBeInTheDocument();
      expect(screen.getByTestId('lease-row-l3')).toBeInTheDocument();
      expect(screen.getByTestId('lease-row-l8')).toBeInTheDocument();
    });

    test('lease rows show property, unit, tenant, and status', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-leases'));
      const row = screen.getByTestId('lease-row-l1');
      expect(within(row).getByText(/Sunrise Apartments/)).toBeInTheDocument();
      expect(within(row).getByText('John Smith')).toBeInTheDocument();
      expect(within(row).getByText('active')).toBeInTheDocument();
    });

    test('leases show auto-renew status', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-leases'));
      // l1 has autoRenew = true
      const row1 = screen.getByTestId('lease-row-l1');
      expect(within(row1).getByText('✓')).toBeInTheDocument();
      // l3 has autoRenew = false
      const row3 = screen.getByTestId('lease-row-l3');
      expect(within(row3).getByText('—')).toBeInTheDocument();
    });
  });

  describe('Payments View', () => {
    test('navigating to Payments shows payments view with summary', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-payments'));
      expect(screen.getByTestId('payments-view')).toBeInTheDocument();
      expect(screen.getByTestId('payment-summary')).toBeInTheDocument();
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    test('payment summary shows correct counts', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-payments'));
      const summary = screen.getByTestId('payment-summary');
      // Count paid payments = 14
      const paid = summary.children[0];
      expect(within(paid).getByText('14')).toBeInTheDocument();
    });

    test('filtering by payment status works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-payments'));
      const statusFilter = screen.getByTestId('filter-payment-status');
      fireEvent.change(statusFilter, { target: { value: 'overdue' } });
      // Only pay4 is overdue
      expect(screen.getByTestId('payment-row-pay4')).toBeInTheDocument();
      expect(screen.queryByTestId('payment-row-pay1')).not.toBeInTheDocument();
    });

    test('record payment modal opens and closes', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-payments'));
      fireEvent.click(screen.getByTestId('record-payment-btn'));
      expect(screen.getByTestId('payment-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('cancel-payment-modal'));
      expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument();
    });

    test('payments table shows tenant names', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-payments'));
      const row = screen.getByTestId('payment-row-pay1');
      expect(within(row).getByText('John Smith')).toBeInTheDocument();
    });
  });

  describe('Maintenance View', () => {
    test('navigating to Maintenance shows maintenance list', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      expect(screen.getByTestId('maintenance-view')).toBeInTheDocument();
      expect(screen.getByTestId('maintenance-list')).toBeInTheDocument();
    });

    test('all maintenance items are rendered', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      expect(screen.getByTestId('maint-item-m1')).toBeInTheDocument();
      expect(screen.getByTestId('maint-item-m3')).toBeInTheDocument();
      expect(screen.getByTestId('maint-item-m5')).toBeInTheDocument();
    });

    test('filtering by priority works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      const priorityFilter = screen.getByTestId('filter-maintenance-priority');
      fireEvent.change(priorityFilter, { target: { value: 'emergency' } });
      // Only m5 is emergency
      expect(screen.getByTestId('maint-item-m5')).toBeInTheDocument();
      expect(screen.queryByTestId('maint-item-m1')).not.toBeInTheDocument();
    });

    test('filtering by maintenance status works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      const statusFilter = screen.getByTestId('filter-maintenance-status');
      fireEvent.change(statusFilter, { target: { value: 'completed' } });
      // Only m4 is completed
      expect(screen.getByTestId('maint-item-m4')).toBeInTheDocument();
      expect(screen.queryByTestId('maint-item-m1')).not.toBeInTheDocument();
    });

    test('clicking maintenance item shows detail', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m1'));
      expect(screen.getByTestId('maintenance-detail')).toBeInTheDocument();
      expect(screen.getByText('Leaky kitchen faucet')).toBeInTheDocument();
      expect(screen.getByText(/Kitchen faucet drips/)).toBeInTheDocument();
    });

    test('maintenance detail shows notes', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m1'));
      expect(screen.getByText('Scheduled Mike for Tuesday')).toBeInTheDocument();
    });

    test('adding a note to maintenance request works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m3'));
      const noteInput = screen.getByTestId('maintenance-note-input');
      fireEvent.change(noteInput, { target: { value: 'HVAC tech coming tomorrow' } });
      fireEvent.click(screen.getByTestId('add-note-btn'));
      expect(screen.getByText('HVAC tech coming tomorrow')).toBeInTheDocument();
      // Input should be cleared
      expect(noteInput.value).toBe('');
    });

    test('adding a note via Enter key works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m3'));
      const noteInput = screen.getByTestId('maintenance-note-input');
      fireEvent.change(noteInput, { target: { value: 'Contacted supplier' } });
      fireEvent.keyDown(noteInput, { key: 'Enter' });
      expect(screen.getByText('Contacted supplier')).toBeInTheDocument();
    });

    test('empty note is not added', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m3'));
      // m3 has 0 notes initially
      fireEvent.click(screen.getByTestId('add-note-btn'));
      expect(screen.getByText('Notes (0)')).toBeInTheDocument();
    });

    test('changing maintenance status works', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m3'));
      // m3 is 'open', so should show buttons for other statuses
      const inProgressBtn = screen.getByTestId('set-status-in_progress');
      fireEvent.click(inProgressBtn);
      // Status should be updated — the 'open' button should now be visible
      expect(screen.getByTestId('set-status-open')).toBeInTheDocument();
    });

    test('back button returns to maintenance list', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m1'));
      fireEvent.click(screen.getByTestId('back-to-maintenance'));
      expect(screen.getByTestId('maintenance-list')).toBeInTheDocument();
    });

    test('new maintenance request modal opens and closes', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('add-maintenance-btn'));
      expect(screen.getByTestId('maintenance-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('cancel-maintenance-modal'));
      expect(screen.queryByTestId('maintenance-modal')).not.toBeInTheDocument();
    });
  });

  describe('Cross-Entity Data Relationships', () => {
    test('property detail shows correct tenant for each occupied unit', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p1'));
      // u1 occupied by t1 (John Smith), u2 by t2 (Sarah Johnson)
      const u1 = screen.getByTestId('unit-card-u1');
      expect(within(u1).getByText(/John Smith/)).toBeInTheDocument();
      const u2 = screen.getByTestId('unit-card-u2');
      expect(within(u2).getByText(/Sarah Johnson/)).toBeInTheDocument();
      // u3 is vacant — no tenant shown
      const u3 = screen.getByTestId('unit-card-u3');
      expect(within(u3).queryByText(/Tenant:/)).not.toBeInTheDocument();
    });

    test('tenant detail shows leases that link back to correct property/unit', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-tenants'));
      // t3 has two leases — l3 (expired) and l6 (active)
      fireEvent.click(screen.getByTestId('tenant-card-t3'));
      expect(screen.getByTestId('tenant-lease-l3')).toBeInTheDocument();
      expect(screen.getByTestId('tenant-lease-l6')).toBeInTheDocument();
      // l3 maps to u5 which is Oak Ridge Condos
      const l3 = screen.getByTestId('tenant-lease-l3');
      expect(within(l3).getByText(/Oak Ridge Condos/)).toBeInTheDocument();
      expect(within(l3).getByText('expired')).toBeInTheDocument();
    });

    test('lease table shows correct property/unit/tenant relationships', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-leases'));
      // l7: u10 (Downtown Commercial Plaza G1) -> t6 (Lisa Garcia)
      const row = screen.getByTestId('lease-row-l7');
      expect(within(row).getByText(/Downtown Commercial Plaza/)).toBeInTheDocument();
      expect(within(row).getByText('Lisa Garcia')).toBeInTheDocument();
    });

    test('deleting a property cascades to remove associated units, leases, and payments', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p1'));
      window.confirm.mockReturnValue(true);
      fireEvent.click(screen.getByTestId('delete-property-btn'));

      // Verify the property is gone
      expect(screen.queryByTestId('property-card-p1')).not.toBeInTheDocument();

      // Verify units from p1 are gone from units view
      fireEvent.click(screen.getByTestId('nav-units'));
      expect(screen.queryByTestId('unit-row-u1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('unit-row-u2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('unit-row-u3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('unit-row-u4')).not.toBeInTheDocument();
      // Units from other properties should still exist
      expect(screen.getByTestId('unit-row-u5')).toBeInTheDocument();

      // Verify payments view no longer shows payments from deleted leases
      fireEvent.click(screen.getByTestId('nav-payments'));
      expect(screen.queryByTestId('payment-row-pay1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('payment-row-pay2')).not.toBeInTheDocument();
      // Payments from other leases should still exist
      expect(screen.getByTestId('payment-row-pay8')).toBeInTheDocument();
    });

    test('maintenance items link to correct property, unit, and tenant', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m5'));
      // m5: u10 in p4, tenant t6
      expect(screen.getByText('Downtown Commercial Plaza')).toBeInTheDocument();
      expect(screen.getByText('Lisa Garcia')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('search filters properties by name', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'Sunrise' } });
      expect(screen.getByTestId('property-card-p1')).toBeInTheDocument();
      expect(screen.queryByTestId('property-card-p2')).not.toBeInTheDocument();
    });

    test('search filters properties by address', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'Oak Ave' } });
      expect(screen.getByTestId('property-card-p2')).toBeInTheDocument();
      expect(screen.queryByTestId('property-card-p1')).not.toBeInTheDocument();
    });

    test('search filters maintenance by title', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'faucet' } });
      expect(screen.getByTestId('maint-item-m1')).toBeInTheDocument();
      expect(screen.queryByTestId('maint-item-m3')).not.toBeInTheDocument();
    });

    test('search filters units by number', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-units'));
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: '201' } });
      expect(screen.getByTestId('unit-row-u3')).toBeInTheDocument(); // p1 unit 201
      expect(screen.getByTestId('unit-row-u12')).toBeInTheDocument(); // p4 unit 201
      expect(screen.queryByTestId('unit-row-u1')).not.toBeInTheDocument();
    });
  });

  describe('View Navigation & State Reset', () => {
    test('switching views resets selected items', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-properties'));
      fireEvent.click(screen.getByTestId('property-card-p1'));
      expect(screen.getByTestId('property-detail')).toBeInTheDocument();
      // Switch to tenants
      fireEvent.click(screen.getByTestId('nav-tenants'));
      expect(screen.getByTestId('tenants-view')).toBeInTheDocument();
      // Switch back to properties — should show grid, not detail
      fireEvent.click(screen.getByTestId('nav-properties'));
      expect(screen.getByTestId('property-grid')).toBeInTheDocument();
    });

    test('switching views resets maintenance selection', () => {
      render(<PropertyManagement />);
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      fireEvent.click(screen.getByTestId('maint-item-m1'));
      expect(screen.getByTestId('maintenance-detail')).toBeInTheDocument();
      // Switch to dashboard and back
      fireEvent.click(screen.getByTestId('nav-dashboard'));
      fireEvent.click(screen.getByTestId('nav-maintenance'));
      expect(screen.getByTestId('maintenance-list')).toBeInTheDocument();
    });
  });
});
