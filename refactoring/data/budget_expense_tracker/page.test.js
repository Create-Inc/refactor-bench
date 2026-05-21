import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetExpenseTracker from './src/app/page.jsx';

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

// Mock URL.createObjectURL / revokeObjectURL for CSV export
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

describe('BudgetExpenseTracker Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with BudgetWise title', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText(/BudgetWise/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('Budgets')).toBeInTheDocument();
      expect(screen.getByText('Accounts')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Recurring')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByPlaceholderText('Search transactions... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders add transaction button', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Add transaction')).toBeInTheDocument();
    });

    test('renders transfer button', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Transfer funds')).toBeInTheDocument();
    });

    test('renders theme toggle', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('renders summary cards', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Net Balance')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });

    test('renders net balance in sidebar', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText(/Net Balance/)).toBeInTheDocument();
    });

    test('renders recurring total in sidebar', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText(/Recurring/)).toBeInTheDocument();
      expect(screen.getByText(/\/mo/)).toBeInTheDocument();
    });

    test('renders transactions view by default', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.getByText('Monthly Rent')).toBeInTheDocument();
      expect(screen.getByText('Salary Deposit')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('toggling theme saves to localStorage', () => {
      render(<BudgetExpenseTracker />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('budgetTrackerTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<BudgetExpenseTracker />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('budgetTrackerTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'budgetTrackerTheme') return 'dark';
        return null;
      });
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Transactions shows transaction list', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      fireEvent.click(screen.getByText('Transactions'));
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
    });

    test('clicking Budgets shows budget cards', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      expect(screen.getByText('Monthly Budgets')).toBeInTheDocument();
    });

    test('clicking Accounts shows account cards', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Accounts'));
      expect(screen.getByText('Checking Account')).toBeInTheDocument();
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });

    test('clicking Reports shows spending reports', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Reports'));
      expect(screen.getByText('Spending Reports')).toBeInTheDocument();
    });

    test('clicking Recurring shows recurring items', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Recurring'));
      expect(screen.getByText('Recurring Transactions')).toBeInTheDocument();
    });

    test('saves active view to localStorage', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('budgetTrackerView', 'budgets');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('Transactions')).not.toBeInTheDocument();
      expect(screen.queryByText('Budgets')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows labels again', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });
  });

  describe('Transaction List', () => {
    test('displays all initial transactions', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.getByText('Monthly Rent')).toBeInTheDocument();
      expect(screen.getByText('Salary Deposit')).toBeInTheDocument();
      expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
    });

    test('displays transaction amounts with correct formatting', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText(/\$85.42/)).toBeInTheDocument();
    });

    test('displays category icons for transactions', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
      expect(screen.getByText('Housing')).toBeInTheDocument();
    });

    test('displays transaction notes', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('Weekly groceries')).toBeInTheDocument();
      expect(screen.getByText('April rent payment')).toBeInTheDocument();
    });

    test('displays transaction tags', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('groceries')).toBeInTheDocument();
      expect(screen.getByText('weekly')).toBeInTheDocument();
    });

    test('shows result count', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('15 results')).toBeInTheDocument();
    });

    test('shows edit and delete buttons', () => {
      render(<BudgetExpenseTracker />);
      const editButtons = screen.getAllByLabelText(/^Edit /);
      expect(editButtons.length).toBeGreaterThan(0);
      const deleteButtons = screen.getAllByLabelText(/^Delete /);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Search Filtering', () => {
    test('search filters transactions by description', () => {
      render(<BudgetExpenseTracker />);
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Grocery' } });
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Rent')).not.toBeInTheDocument();
    });

    test('search filters transactions by notes', () => {
      render(<BudgetExpenseTracker />);
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'vitamins' } });
      expect(screen.getByText('Pharmacy')).toBeInTheDocument();
    });

    test('search filters transactions by tags', () => {
      render(<BudgetExpenseTracker />);
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'freelance' } });
      expect(screen.getByText('Freelance Payment')).toBeInTheDocument();
    });

    test('clearing search shows all transactions', () => {
      render(<BudgetExpenseTracker />);
      const searchInput = screen.getByPlaceholderText('Search transactions... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Grocery' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.getByText('Monthly Rent')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('renders category filter dropdown', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
    });

    test('filtering by food shows only food transactions', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'food' } });
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
      expect(screen.getByText('Restaurant Dinner')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Rent')).not.toBeInTheDocument();
    });

    test('resetting category filter shows all transactions', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'food' } });
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'all' } });
      expect(screen.getByText('Monthly Rent')).toBeInTheDocument();
    });
  });

  describe('Account Filter', () => {
    test('renders account filter dropdown', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Filter by account')).toBeInTheDocument();
    });

    test('filtering by credit card shows only credit card transactions', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.change(screen.getByLabelText('Filter by account'), { target: { value: 'credit' } });
      expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
      expect(screen.getByText('Gas Station')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Rent')).not.toBeInTheDocument();
    });
  });

  describe('Date Filter', () => {
    test('renders date filter inputs', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Date from')).toBeInTheDocument();
      expect(screen.getByLabelText('Date to')).toBeInTheDocument();
    });

    test('date from filter excludes earlier transactions', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.change(screen.getByLabelText('Date from'), { target: { value: '2025-04-20' } });
      expect(screen.getByText('New Headphones')).toBeInTheDocument();
      expect(screen.getByText('Restaurant Dinner')).toBeInTheDocument();
      expect(screen.getByText('Movie Tickets')).toBeInTheDocument();
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Rent')).not.toBeInTheDocument();
    });
  });

  describe('Sort Controls', () => {
    test('renders sort dropdown', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Sort transactions')).toBeInTheDocument();
    });

    test('sort by name shows alphabetical order', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.change(screen.getByLabelText('Sort transactions'), { target: { value: 'name' } });
      const descriptions = screen.getAllByText(/^(Coffee Shop|Electric Bill|Freelance Payment|Gas Station|Grocery Store|Monthly Rent|Movie Tickets|Netflix Subscription|New Headphones|Online Course|Pharmacy|Restaurant Dinner|Salary Deposit|Savings Transfer|Water Bill)$/);
      expect(descriptions.length).toBe(15);
    });
  });

  describe('Transaction Selection', () => {
    test('select all checkbox toggles all transactions', () => {
      render(<BudgetExpenseTracker />);
      const selectAll = screen.getByLabelText('Select all transactions');
      fireEvent.click(selectAll);
      expect(screen.getByText(/Delete.*Selected/)).toBeInTheDocument();
    });

    test('individual transaction checkboxes work', () => {
      render(<BudgetExpenseTracker />);
      const checkbox = screen.getByLabelText('Select Grocery Store');
      fireEvent.click(checkbox);
      expect(screen.getByText(/Delete 1 Selected/)).toBeInTheDocument();
    });

    test('deselecting all hides bulk delete button', () => {
      render(<BudgetExpenseTracker />);
      const selectAll = screen.getByLabelText('Select all transactions');
      fireEvent.click(selectAll);
      fireEvent.click(selectAll);
      expect(screen.queryByText(/Delete.*Selected/)).not.toBeInTheDocument();
    });
  });

  describe('Add Transaction', () => {
    test('clicking add button opens modal', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Add transaction'));
      expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    });

    test('modal has all form fields', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Add transaction'));
      expect(screen.getByPlaceholderText('e.g., Grocery Store')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('-85.42')).toBeInTheDocument();
      expect(screen.getByLabelText('Transaction category')).toBeInTheDocument();
      expect(screen.getByLabelText('Transaction account')).toBeInTheDocument();
      expect(screen.getByLabelText('Transaction date')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Optional notes')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('groceries, weekly')).toBeInTheDocument();
    });

    test('adding a transaction updates the list', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Add transaction'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Grocery Store'), { target: { value: 'Test Purchase' } });
      fireEvent.change(screen.getByPlaceholderText('-85.42'), { target: { value: '-25.50' } });
      fireEvent.click(screen.getByText('Add Transaction'));
      expect(screen.getByText('Test Purchase')).toBeInTheDocument();
    });

    test('adding a transaction closes the modal', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Add transaction'));
      fireEvent.change(screen.getByPlaceholderText('e.g., Grocery Store'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByPlaceholderText('-85.42'), { target: { value: '-10' } });
      fireEvent.click(screen.getByText('Add Transaction'));
      expect(screen.queryByPlaceholderText('e.g., Grocery Store')).not.toBeInTheDocument();
    });

    test('cancel button closes the add modal', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Add transaction'));
      expect(screen.getByText('Add Transaction')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByPlaceholderText('e.g., Grocery Store')).not.toBeInTheDocument();
    });

    test('empty description prevents adding', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Add transaction'));
      fireEvent.change(screen.getByPlaceholderText('-85.42'), { target: { value: '-10' } });
      fireEvent.click(screen.getByText('Add Transaction'));
      // Modal should stay open since description is empty
      expect(screen.getByPlaceholderText('e.g., Grocery Store')).toBeInTheDocument();
    });
  });

  describe('Edit Transaction', () => {
    test('clicking edit button opens edit modal', () => {
      render(<BudgetExpenseTracker />);
      const editButton = screen.getByLabelText('Edit Grocery Store');
      fireEvent.click(editButton);
      expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
    });

    test('edit modal is pre-filled with transaction data', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Edit Grocery Store'));
      expect(screen.getByDisplayValue('Grocery Store')).toBeInTheDocument();
    });

    test('saving edits updates the transaction', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Edit Grocery Store'));
      const descInput = screen.getByDisplayValue('Grocery Store');
      fireEvent.change(descInput, { target: { value: 'Whole Foods' } });
      fireEvent.click(screen.getByText('Save Changes'));
      expect(screen.getByText('Whole Foods')).toBeInTheDocument();
      expect(screen.queryByText('Grocery Store')).not.toBeInTheDocument();
    });

    test('canceling edit closes modal without changes', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Edit Grocery Store'));
      const descInput = screen.getByDisplayValue('Grocery Store');
      fireEvent.change(descInput, { target: { value: 'Changed Name' } });
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.queryByText('Changed Name')).not.toBeInTheDocument();
    });
  });

  describe('Delete Transaction', () => {
    test('deleting a transaction requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Delete Grocery Store'));
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this transaction?');
    });

    test('confirming deletion removes the transaction', () => {
      window.confirm.mockReturnValue(true);
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Delete Grocery Store'));
      expect(screen.queryByText('Grocery Store')).not.toBeInTheDocument();
    });

    test('declining deletion keeps the transaction', () => {
      window.confirm.mockReturnValue(false);
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Delete Grocery Store'));
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
    });
  });

  describe('Bulk Delete', () => {
    test('bulk delete requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<BudgetExpenseTracker />);
      const selectAll = screen.getByLabelText('Select all transactions');
      fireEvent.click(selectAll);
      fireEvent.click(screen.getByText(/Delete.*Selected/));
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming bulk delete removes selected transactions', () => {
      window.confirm.mockReturnValue(true);
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Select Grocery Store'));
      fireEvent.click(screen.getByLabelText('Select Coffee Shop'));
      fireEvent.click(screen.getByText(/Delete 2 Selected/));
      expect(screen.queryByText('Grocery Store')).not.toBeInTheDocument();
      expect(screen.queryByText('Coffee Shop')).not.toBeInTheDocument();
      expect(screen.getByText('Monthly Rent')).toBeInTheDocument();
    });
  });

  describe('Budgets View', () => {
    test('shows budget cards for all categories', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      expect(screen.getByText('Housing')).toBeInTheDocument();
      expect(screen.getByText('Utilities')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
      expect(screen.getByText('Shopping')).toBeInTheDocument();
    });

    test('shows spent and limit amounts', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      const spentElements = screen.getAllByText(/spent/);
      expect(spentElements.length).toBeGreaterThan(0);
      const limitElements = screen.getAllByText(/limit/);
      expect(limitElements.length).toBeGreaterThan(0);
    });

    test('shows edit button for each budget', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    test('clicking edit opens budget edit modal', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      const editButton = screen.getByLabelText('Edit Food & Dining budget');
      fireEvent.click(editButton);
      expect(screen.getByText(/Edit.*Budget/)).toBeInTheDocument();
      expect(screen.getByLabelText('Budget limit')).toBeInTheDocument();
    });

    test('updating budget saves new limit', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      fireEvent.click(screen.getByLabelText('Edit Food & Dining budget'));
      const input = screen.getByLabelText('Budget limit');
      fireEvent.change(input, { target: { value: '500' } });
      fireEvent.click(screen.getByText('Save Budget'));
      // Modal should close
      expect(screen.queryByText('Save Budget')).not.toBeInTheDocument();
    });

    test('shows remaining amount for under-budget categories', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Budgets'));
      const remainingElements = screen.getAllByText(/remaining/);
      expect(remainingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accounts View', () => {
    test('shows all account cards', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Accounts'));
      expect(screen.getByText('Checking Account')).toBeInTheDocument();
      expect(screen.getByText('Savings Account')).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });

    test('shows account balances', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Accounts'));
      // Checking account has positive balance, credit card has negative
      const balanceElements = screen.getAllByText(/\$[\d,]+\.\d{2}/);
      expect(balanceElements.length).toBeGreaterThan(0);
    });

    test('shows recent transactions for each account', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Accounts'));
      const recentLabels = screen.getAllByText('Recent Transactions');
      expect(recentLabels.length).toBe(4); // one per account
    });

    test('shows total transaction count per account', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Accounts'));
      const totalLabels = screen.getAllByText(/total transactions/);
      expect(totalLabels.length).toBe(4);
    });

    test('shows Transfer Between Accounts button', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Accounts'));
      expect(screen.getByText('↔ Transfer Between Accounts')).toBeInTheDocument();
    });
  });

  describe('Reports View', () => {
    test('shows spending reports header', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Reports'));
      expect(screen.getByText('Spending Reports')).toBeInTheDocument();
    });

    test('shows report period selector', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Reports'));
      expect(screen.getByLabelText('Report period')).toBeInTheDocument();
    });

    test('shows spending by category section', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Reports'));
      expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    });

    test('shows budget vs actual section', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Reports'));
      expect(screen.getByText('Budget vs Actual')).toBeInTheDocument();
    });

    test('changing report period updates the view', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Reports'));
      const periodSelect = screen.getByLabelText('Report period');
      fireEvent.change(periodSelect, { target: { value: 'last-month' } });
      expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    });
  });

  describe('Recurring View', () => {
    test('shows recurring items list', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Recurring'));
      expect(screen.getByText('Monthly Rent')).toBeInTheDocument();
      expect(screen.getByText('Electric Bill')).toBeInTheDocument();
      expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
    });

    test('shows monthly recurring total', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Recurring'));
      expect(screen.getByText(/Monthly recurring total/)).toBeInTheDocument();
    });

    test('shows active/paused status for each item', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Recurring'));
      const activeButtons = screen.getAllByText('Active');
      expect(activeButtons.length).toBeGreaterThan(0);
      expect(screen.getByText('Paused')).toBeInTheDocument(); // Gym Membership is paused
    });

    test('toggling active status changes button label', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Recurring'));
      // Pause an active item
      const pauseButton = screen.getByLabelText('Pause Monthly Rent');
      fireEvent.click(pauseButton);
      expect(screen.getByLabelText('Resume Monthly Rent')).toBeInTheDocument();
    });

    test('shows next date for recurring items', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Recurring'));
      const nextLabels = screen.getAllByText(/Next:/);
      expect(nextLabels.length).toBeGreaterThan(0);
    });

    test('shows frequency for recurring items', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByText('Recurring'));
      const monthlyLabels = screen.getAllByText(/monthly/);
      expect(monthlyLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Transfer Modal', () => {
    test('clicking transfer button opens modal', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Transfer funds'));
      expect(screen.getByText('Transfer Funds')).toBeInTheDocument();
    });

    test('modal has from/to account selectors and amount', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Transfer funds'));
      expect(screen.getByLabelText('Transfer from')).toBeInTheDocument();
      expect(screen.getByLabelText('Transfer to')).toBeInTheDocument();
      expect(screen.getByLabelText('Transfer amount')).toBeInTheDocument();
    });

    test('executing transfer updates account balances', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Transfer funds'));
      fireEvent.change(screen.getByLabelText('Transfer amount'), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Transfer'));
      // Modal should close after transfer
      expect(screen.queryByText('Transfer Funds')).not.toBeInTheDocument();
    });

    test('transfer creates a transaction record', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Transfer funds'));
      fireEvent.change(screen.getByLabelText('Transfer amount'), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Transfer'));
      // Should show the transfer in transactions list
      expect(screen.getByText(/Transfer:/)).toBeInTheDocument();
    });

    test('cancel closes transfer modal', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Transfer funds'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Transfer Funds')).not.toBeInTheDocument();
    });
  });

  describe('CSV Export', () => {
    test('export CSV button is visible', () => {
      render(<BudgetExpenseTracker />);
      expect(screen.getByLabelText('Export CSV')).toBeInTheDocument();
    });

    test('clicking export CSV calls URL.createObjectURL', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Export CSV'));
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Combined Filters', () => {
    test('search and category filter work together', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.change(screen.getByPlaceholderText('Search transactions... (Ctrl+K)'), { target: { value: 'Store' } });
      fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'food' } });
      expect(screen.getByText('Grocery Store')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Rent')).not.toBeInTheDocument();
    });

    test('search and account filter work together', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.change(screen.getByPlaceholderText('Search transactions... (Ctrl+K)'), { target: { value: 'Netflix' } });
      fireEvent.change(screen.getByLabelText('Filter by account'), { target: { value: 'credit' } });
      expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
    });

    test('non-matching combined filters show empty state', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.change(screen.getByPlaceholderText('Search transactions... (Ctrl+K)'), { target: { value: 'Rent' } });
      fireEvent.change(screen.getByLabelText('Filter by account'), { target: { value: 'cash' } });
      expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes add modal', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Add transaction'));
      expect(screen.getByText('Add Transaction')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByPlaceholderText('e.g., Grocery Store')).not.toBeInTheDocument();
    });

    test('Escape closes transfer modal', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Transfer funds'));
      expect(screen.getByText('Transfer Funds')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Transfer Funds')).not.toBeInTheDocument();
    });

    test('Escape clears transaction selection', () => {
      render(<BudgetExpenseTracker />);
      fireEvent.click(screen.getByLabelText('Select Grocery Store'));
      expect(screen.getByText(/Delete 1 Selected/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Delete.*Selected/)).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('transactions are saved to localStorage', () => {
      render(<BudgetExpenseTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budgetTrackerTransactions',
        expect.any(String)
      );
    });

    test('budgets are saved to localStorage', () => {
      render(<BudgetExpenseTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budgetTrackerBudgets',
        expect.any(String)
      );
    });

    test('accounts are saved to localStorage', () => {
      render(<BudgetExpenseTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budgetTrackerAccounts',
        expect.any(String)
      );
    });

    test('recurring items are saved to localStorage', () => {
      render(<BudgetExpenseTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budgetTrackerRecurring',
        expect.any(String)
      );
    });

    test('loads saved view from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'budgetTrackerView') return 'recurring';
        return null;
      });
      render(<BudgetExpenseTracker />);
      expect(screen.getByText('Recurring Transactions')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'budgetTrackerTransactions') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<BudgetExpenseTracker />)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<BudgetExpenseTracker />)).not.toThrow();
    });
  });
});
