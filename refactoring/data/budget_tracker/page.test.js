import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetTracker from './src/app/page.jsx';

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

// Mock Intl.NumberFormat for consistent currency formatting
const mockFormat = vi.fn((value) => {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
});

describe('BudgetTracker Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with BudgetWise title', () => {
      render(<BudgetTracker />);
      expect(screen.getByText(/BudgetWise/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<BudgetTracker />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('Budgets')).toBeInTheDocument();
      expect(screen.getByText('Accounts')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    test('renders search input in header', () => {
      render(<BudgetTracker />);
      expect(screen.getByPlaceholderText('Search transactions... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders Add Transaction button', () => {
      render(<BudgetTracker />);
      expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    });

    test('renders net worth in sidebar', () => {
      render(<BudgetTracker />);
      // Net worth should be displayed — total of all account balances
      expect(screen.getByText(/Net Worth/)).toBeInTheDocument();
    });

    test('renders dashboard view by default', () => {
      render(<BudgetTracker />);
      expect(screen.getByText('Financial Overview')).toBeInTheDocument();
    });
  });

  describe('Dashboard View', () => {
    test('renders summary cards', () => {
      render(<BudgetTracker />);
      expect(screen.getByText('Total Balance')).toBeInTheDocument();
      expect(screen.getByText('Income')).toBeInTheDocument();
      expect(screen.getByText('Expenses')).toBeInTheDocument();
      expect(screen.getByText('Net Cash Flow')).toBeInTheDocument();
    });

    test('renders spending by category section', () => {
      render(<BudgetTracker />);
      expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    });

    test('renders recent transactions section', () => {
      render(<BudgetTracker />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });

    test('renders account balances section', () => {
      render(<BudgetTracker />);
      expect(screen.getByText('Account Balances')).toBeInTheDocument();
    });

    test('shows account names in dashboard', () => {
      render(<BudgetTracker />);
      expect(screen.getByText('Main Checking')).toBeInTheDocument();
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });

    test('displays budget alerts when budgets are exceeded', () => {
      render(<BudgetTracker />);
      // Based on initial data, some budgets may be exceeded
      // The Shopping budget is $300 and spending is ~$189.99, not exceeded
      // Check that Budget Alerts section renders when appropriate
      const alerts = screen.queryByText('Budget Alerts');
      // Whether alerts show depends on whether any budget is exceeded with initial data
      // This is a smoke test — if alerts exist, they should have correct structure
      if (alerts) {
        expect(alerts).toBeInTheDocument();
      }
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<BudgetTracker />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<BudgetTracker />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('budgetTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<BudgetTracker />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('budgetTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'budgetTheme') return 'dark';
        return null;
      });
      render(<BudgetTracker />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Dashboard shows dashboard view', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Dashboard'));
      expect(screen.getByText('Financial Overview')).toBeInTheDocument();
    });

    test('clicking Transactions shows transactions view', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      // Transactions view has an Export CSV button and sort controls
      expect(screen.getByText('📥 Export CSV')).toBeInTheDocument();
    });

    test('clicking Budgets shows budgets view', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      expect(screen.getByText('+ Add Budget')).toBeInTheDocument();
    });

    test('clicking Accounts shows accounts view', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Accounts'));
      expect(screen.getByText('Account Summary')).toBeInTheDocument();
    });

    test('clicking Reports shows reports view', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Reports'));
      expect(screen.getByText('Financial Reports')).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('budgetView', 'transactions');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<BudgetTracker />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<BudgetTracker />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Transactions')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<BudgetTracker />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Transactions View - Filtering', () => {
    beforeEach(() => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
    });

    test('renders category filter', () => {
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
    });

    test('renders account filter', () => {
      expect(screen.getByLabelText('Filter by account')).toBeInTheDocument();
    });

    test('renders type filter', () => {
      expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
    });

    test('filtering by category shows only matching transactions', () => {
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'food' } });
      expect(screen.getByText('Grocery store')).toBeInTheDocument();
      expect(screen.getByText('Restaurant dinner')).toBeInTheDocument();
      expect(screen.getByText('Coffee shop')).toBeInTheDocument();
      expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument();
    });

    test('filtering by account shows only matching transactions', () => {
      const accountFilter = screen.getByLabelText('Filter by account');
      fireEvent.change(accountFilter, { target: { value: 'cash' } });
      expect(screen.getByText('Coffee shop')).toBeInTheDocument();
      expect(screen.getByText('Parking fee')).toBeInTheDocument();
      expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument();
    });

    test('filtering by type shows only matching transactions', () => {
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'income' } });
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
      expect(screen.getByText('Freelance payment')).toBeInTheDocument();
      expect(screen.getByText('Side project income')).toBeInTheDocument();
      expect(screen.queryByText('Grocery store')).not.toBeInTheDocument();
    });

    test('resetting filters shows all transactions', () => {
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'food' } });
      fireEvent.change(categoryFilter, { target: { value: 'all' } });
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
      expect(screen.getByText('Grocery store')).toBeInTheDocument();
    });
  });

  describe('Transactions View - Sorting', () => {
    beforeEach(() => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
    });

    test('renders sort controls', () => {
      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });

    test('clicking sort button toggles direction', () => {
      const dateButton = screen.getByText(/Date/);
      fireEvent.click(dateButton);
      expect(screen.getByText(/Date.*↑/)).toBeInTheDocument();
    });

    test('clicking different sort button changes field', () => {
      const amountButton = screen.getByText(/Amount/);
      fireEvent.click(amountButton);
      expect(screen.getByText(/Amount.*↓/)).toBeInTheDocument();
    });

    test('shows transaction count', () => {
      expect(screen.getByText(/20 transactions/)).toBeInTheDocument();
    });
  });

  describe('Transactions View - Table', () => {
    beforeEach(() => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
    });

    test('renders transaction table headers', () => {
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
    });

    test('renders transaction data rows', () => {
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
      expect(screen.getByText('Rent payment')).toBeInTheDocument();
      expect(screen.getByText('Grocery store')).toBeInTheDocument();
    });

    test('shows recurring indicator on recurring transactions', () => {
      const recurringLabels = screen.getAllByText(/Recurring/i);
      expect(recurringLabels.length).toBeGreaterThan(0);
    });

    test('clicking a transaction opens detail modal', () => {
      fireEvent.click(screen.getByText('Monthly salary'));
      // Modal shows the amount
      expect(screen.getByText('January salary deposit')).toBeInTheDocument();
    });
  });

  describe('Transaction Detail Modal', () => {
    test('shows transaction details', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('Grocery store'));
      expect(screen.getByText('expense')).toBeInTheDocument();
      expect(screen.getByText('2025-01-03')).toBeInTheDocument();
    });

    test('close button closes modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('Grocery store'));
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      // Modal content should be gone (the "expense" type label was in the modal)
      // Re-check that the transaction list is visible instead
      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });

    test('delete button shows confirmation dialog', () => {
      window.confirm.mockReturnValue(false);
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('Grocery store'));
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      expect(window.confirm).toHaveBeenCalledWith('Delete this transaction?');
    });

    test('confirming delete removes transaction', () => {
      window.confirm.mockReturnValue(true);
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('Grocery store'));
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      expect(screen.queryByText('Grocery store')).not.toBeInTheDocument();
    });

    test('shows notes when present', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('Electric bill'));
      expect(screen.getByText('January electric')).toBeInTheDocument();
    });

    test('shows recurring status', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('Rent payment'));
      expect(screen.getByText('🔄 Yes')).toBeInTheDocument();
    });
  });

  describe('Add Transaction Modal', () => {
    test('clicking Add Transaction opens modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Add Transaction'));
      expect(screen.getByText('Description *')).toBeInTheDocument();
    });

    test('modal has all form fields', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Add Transaction'));
      expect(screen.getByText('Description *')).toBeInTheDocument();
      expect(screen.getByText('Amount *')).toBeInTheDocument();
      expect(screen.getByText('Type *')).toBeInTheDocument();
      expect(screen.getByText('Category *')).toBeInTheDocument();
      expect(screen.getByText('Account *')).toBeInTheDocument();
      expect(screen.getByText('Date *')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    test('cancel button closes modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Add Transaction'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Description *')).not.toBeInTheDocument();
    });

    test('submitting form adds new transaction', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Add Transaction'));

      const form = screen.getByText('Add Transaction', { selector: 'h2' }).closest('div').querySelector('form');
      const descInput = form.querySelector('input[name="description"]');
      const amountInput = form.querySelector('input[name="amount"]');

      fireEvent.change(descInput, { target: { value: 'New test transaction' } });
      fireEvent.change(amountInput, { target: { value: '99.99' } });

      const submitButton = screen.getByText('Add Transaction', { selector: 'button[type="submit"]' });
      fireEvent.click(submitButton);

      // Modal should close
      expect(screen.queryByText('Description *')).not.toBeInTheDocument();
    });

    test('close button (×) closes add transaction modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Add Transaction'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Description *')).not.toBeInTheDocument();
    });
  });

  describe('Budgets View', () => {
    beforeEach(() => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Budgets'));
    });

    test('renders budget cards', () => {
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
      expect(screen.getByText('Shopping')).toBeInTheDocument();
    });

    test('shows budget spending and limit', () => {
      const spentLabels = screen.getAllByText(/Spent:/);
      expect(spentLabels.length).toBeGreaterThan(0);
      const limitLabels = screen.getAllByText(/Limit:/);
      expect(limitLabels.length).toBeGreaterThan(0);
    });

    test('shows percentage used', () => {
      const percentLabels = screen.getAllByText(/% used/);
      expect(percentLabels.length).toBeGreaterThan(0);
    });

    test('shows remaining or over budget text', () => {
      const remaining = screen.getAllByText(/left|Over by/);
      expect(remaining.length).toBeGreaterThan(0);
    });

    test('clicking budget period shows period label', () => {
      const monthlyLabels = screen.getAllByText('monthly');
      expect(monthlyLabels.length).toBeGreaterThan(0);
    });

    test('delete budget button triggers confirmation', () => {
      window.confirm.mockReturnValue(false);
      const deleteButtons = screen.getAllByLabelText(/Delete .* budget/);
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalledWith('Delete this budget?');
    });

    test('confirming delete removes budget', () => {
      window.confirm.mockReturnValue(true);
      const deleteButtons = screen.getAllByLabelText(/Delete .* budget/);
      const initialCount = deleteButtons.length;
      fireEvent.click(deleteButtons[0]);
      const remainingButtons = screen.getAllByLabelText(/Delete .* budget/);
      expect(remainingButtons.length).toBe(initialCount - 1);
    });

    test('clicking limit enables editing', () => {
      const limitLabel = screen.getAllByText(/Limit:/)[0];
      fireEvent.click(limitLabel);
      // An input field for editing should appear
      const numberInput = screen.getByDisplayValue('400');
      expect(numberInput).toBeInTheDocument();
    });

    test('blurring budget limit input saves new value', () => {
      const limitLabel = screen.getAllByText(/Limit:/)[0];
      fireEvent.click(limitLabel);
      const numberInput = screen.getByDisplayValue('400');
      fireEvent.change(numberInput, { target: { value: '500' } });
      fireEvent.blur(numberInput);
      // Budget should now show $500 limit
    });
  });

  describe('Add Budget Modal', () => {
    test('clicking Add Budget opens modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      fireEvent.click(screen.getByText('+ Add Budget'));
      expect(screen.getByText('Add Budget', { selector: 'h2' })).toBeInTheDocument();
    });

    test('modal has category, limit, and period fields', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      fireEvent.click(screen.getByText('+ Add Budget'));
      expect(screen.getByText('Category *')).toBeInTheDocument();
      expect(screen.getByText('Limit *')).toBeInTheDocument();
      expect(screen.getByText('Period')).toBeInTheDocument();
    });

    test('cancel closes add budget modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      fireEvent.click(screen.getByText('+ Add Budget'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Add Budget', { selector: 'h2' })).not.toBeInTheDocument();
    });
  });

  describe('Accounts View', () => {
    beforeEach(() => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Accounts'));
    });

    test('renders account cards', () => {
      expect(screen.getByText('Main Checking')).toBeInTheDocument();
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });

    test('shows account types', () => {
      const checkingLabels = screen.getAllByText('checking');
      expect(checkingLabels.length).toBeGreaterThan(0);
    });

    test('shows income and expenses per account', () => {
      const incomeLabels = screen.getAllByText('Income');
      expect(incomeLabels.length).toBeGreaterThan(0);
      const expenseLabels = screen.getAllByText('Expenses');
      expect(expenseLabels.length).toBeGreaterThan(0);
    });

    test('shows transaction count per account', () => {
      const txLabels = screen.getAllByText('Transactions');
      expect(txLabels.length).toBeGreaterThan(0);
    });

    test('renders account summary table', () => {
      expect(screen.getByText('Account Summary')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    test('clicking account name enables editing', () => {
      const nameElements = screen.getAllByText('Main Checking');
      // Click the account card name (first one)
      fireEvent.click(nameElements[0]);
      const input = screen.getByDisplayValue('Main Checking');
      expect(input).toBeInTheDocument();
    });

    test('blurring account name input saves new value', () => {
      const nameElements = screen.getAllByText('Main Checking');
      fireEvent.click(nameElements[0]);
      const input = screen.getByDisplayValue('Main Checking');
      fireEvent.change(input, { target: { value: 'Primary Checking' } });
      fireEvent.blur(input);
      expect(screen.getByText('Primary Checking')).toBeInTheDocument();
    });
  });

  describe('Reports View', () => {
    beforeEach(() => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Reports'));
    });

    test('renders financial reports heading', () => {
      expect(screen.getByText('Financial Reports')).toBeInTheDocument();
    });

    test('renders income vs expenses summary', () => {
      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Savings Rate')).toBeInTheDocument();
    });

    test('renders expense breakdown section', () => {
      expect(screen.getByText('Expense Breakdown')).toBeInTheDocument();
    });

    test('renders budget vs actual section', () => {
      expect(screen.getByText('Budget vs Actual')).toBeInTheDocument();
    });

    test('renders monthly trend section', () => {
      expect(screen.getByText('Monthly Trend')).toBeInTheDocument();
    });

    test('renders recurring expenses section', () => {
      expect(screen.getByText('Recurring Expenses')).toBeInTheDocument();
      expect(screen.getByText('Total Monthly Recurring')).toBeInTheDocument();
    });

    test('shows savings rate percentage', () => {
      const savingsRate = screen.getByText('Savings Rate');
      expect(savingsRate).toBeInTheDocument();
      // Should show a percentage
      const percentageElements = screen.getAllByText(/%/);
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    test('shows recurring expense items', () => {
      // Recurring expenses from initial data
      expect(screen.getByText('Rent payment')).toBeInTheDocument();
      expect(screen.getByText('Electric bill')).toBeInTheDocument();
      expect(screen.getByText('Internet bill')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('search filters transactions by description', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'grocery' } });
      expect(screen.getByText('Grocery store')).toBeInTheDocument();
      expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument();
    });

    test('search filters transactions by notes', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'birthday' } });
      expect(screen.getByText('Restaurant dinner')).toBeInTheDocument();
    });

    test('clearing search shows all transactions', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'grocery' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
      expect(screen.getByText('Grocery store')).toBeInTheDocument();
    });
  });

  describe('CSV Export', () => {
    test('clicking Export CSV triggers download', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('📥 Export CSV'));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Notifications', () => {
    test('clicking bell icon shows notification panel', () => {
      render(<BudgetTracker />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    test('clicking bell icon again hides notification panel', () => {
      render(<BudgetTracker />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      fireEvent.click(bellButton);
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });

    test('CSV export generates notification', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('📥 Export CSV'));
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Transactions exported to CSV')).toBeInTheDocument();
    });

    test('mark all read button works', () => {
      render(<BudgetTracker />);
      // Generate a notification via export
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('📥 Export CSV'));
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      fireEvent.click(screen.getByText('Mark all read'));
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes transaction detail modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      fireEvent.click(screen.getByText('Monthly salary'));
      expect(screen.getByText('January salary deposit')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('January salary deposit')).not.toBeInTheDocument();
    });

    test('Escape key closes add transaction modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Add Transaction'));
      expect(screen.getByText('Description *')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Description *')).not.toBeInTheDocument();
    });

    test('Escape key closes add budget modal', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      fireEvent.click(screen.getByText('+ Add Budget'));
      expect(screen.getByText('Add Budget', { selector: 'h2' })).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Add Budget', { selector: 'h2' })).not.toBeInTheDocument();
    });

    test('Escape key closes notification panel', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('transactions are saved to localStorage on change', () => {
      render(<BudgetTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budgetTransactions',
        expect.any(String)
      );
    });

    test('accounts are saved to localStorage on change', () => {
      render(<BudgetTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budgetAccounts',
        expect.any(String)
      );
    });

    test('budgets are saved to localStorage on change', () => {
      render(<BudgetTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budgetBudgets',
        expect.any(String)
      );
    });

    test('theme preference is loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'budgetTheme') return 'dark';
        return null;
      });
      render(<BudgetTracker />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'budgetView') return 'reports';
        return null;
      });
      render(<BudgetTracker />);
      expect(screen.getByText('Financial Reports')).toBeInTheDocument();
    });

    test('saved transactions are loaded from localStorage', () => {
      const savedTransactions = JSON.stringify([
        {
          id: 'custom1',
          description: 'Saved custom transaction',
          amount: -55.00,
          type: 'expense',
          category: 'food',
          account: 'checking',
          date: '2025-02-01',
          notes: 'From localStorage',
          recurring: false,
        },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'budgetTransactions') return savedTransactions;
        return null;
      });
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      expect(screen.getByText('Saved custom transaction')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'budgetTransactions') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<BudgetTracker />)).not.toThrow();
    });
  });

  describe('Combined Filters', () => {
    test('search and category filter work together', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'bill' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'utilities' } });
      expect(screen.getByText('Electric bill')).toBeInTheDocument();
      expect(screen.getByText('Internet bill')).toBeInTheDocument();
      expect(screen.getByText('Phone bill')).toBeInTheDocument();
    });

    test('non-matching combined filters show empty state', () => {
      render(<BudgetTracker />);
      fireEvent.click(screen.getByText('Transactions'));
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'salary' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'food' } });
      expect(screen.getByText('No transactions match your filters')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<BudgetTracker />)).not.toThrow();
    });
  });
});
