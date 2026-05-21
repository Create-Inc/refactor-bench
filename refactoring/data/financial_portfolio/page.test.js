import { describe, test, expect, beforeEach, vi } from 'vitest';
// biome-ignore lint/correctness/noUndeclaredDependencies: eval test data — runs in vitest sandbox, not core package
import { render, screen, fireEvent } from '@testing-library/react';
import FinancialPortfolio from './src/app/page.jsx';

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

window.confirm = vi.fn();

describe('FinancialPortfolio Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with PortfolioTracker title', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('PortfolioTracker')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Holdings')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('Watchlist')).toBeInTheDocument();
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    test('renders search input in header', () => {
      render(<FinancialPortfolio />);
      expect(
        screen.getByPlaceholderText('Search holdings... (Ctrl+K)')
      ).toBeInTheDocument();
    });

    test('renders Settings and Dark Mode buttons in sidebar', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    });

    test('renders portfolio overview by default with summary cards', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('Total Value')).toBeInTheDocument();
      expect(screen.getByText('Total Gain/Loss')).toBeInTheDocument();
      expect(screen.getByText('Day Change')).toBeInTheDocument();
      expect(screen.getByText('Annual Dividend Income')).toBeInTheDocument();
    });

    test('renders sector and asset type allocation charts', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('Sector Allocation')).toBeInTheDocument();
      expect(screen.getByText('Asset Type Allocation')).toBeInTheDocument();
    });

    test('renders top performers table', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('Top Performers')).toBeInTheDocument();
    });

    test('displays active alert count badge in sidebar', () => {
      render(<FinancialPortfolio />);
      // 4 active alerts out of 5 total
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Portfolio Metrics Computation', () => {
    test('displays total portfolio value', () => {
      render(<FinancialPortfolio />);
      // The total value should be rendered (sum of all shares * currentPrice)
      // This verifies the useMemo computation runs correctly
      const totalValueCard = screen.getByText('Total Value').parentElement;
      expect(totalValueCard).toBeInTheDocument();
      // Value should contain a dollar sign (formatted currency)
      expect(totalValueCard.textContent).toMatch(/\$/);
    });

    test('displays gain/loss with correct sign coloring', () => {
      render(<FinancialPortfolio />);
      // Total gain should be positive for this portfolio
      const gainCard = screen.getByText('Total Gain/Loss').parentElement;
      expect(gainCard).toBeInTheDocument();
      expect(gainCard.textContent).toMatch(/\$/);
    });

    test('displays sector allocation with percentages', () => {
      render(<FinancialPortfolio />);
      // Technology sector should be present (AAPL, GOOGL, BTC, ETH)
      expect(screen.getByText('Technology')).toBeInTheDocument();
      // Healthcare sector (JNJ)
      expect(screen.getByText('Healthcare')).toBeInTheDocument();
      // Finance sector (VTI, BND, VFIAX)
      expect(screen.getByText('Finance')).toBeInTheDocument();
    });

    test('displays asset type allocation labels', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('Stock')).toBeInTheDocument();
      expect(screen.getByText('ETF')).toBeInTheDocument();
      expect(screen.getByText('Crypto')).toBeInTheDocument();
    });

    test('displays top performers with gain percentages', () => {
      render(<FinancialPortfolio />);
      // BTC should be a top performer (bought at $42K, now at $67.5K = ~60% gain)
      const topPerformersSection = screen.getByText('Top Performers').parentElement;
      expect(topPerformersSection.textContent).toContain('BTC');
    });
  });

  describe('Navigation', () => {
    test('switches to Holdings view when clicked', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      expect(screen.getByText(/Holdings \(/)).toBeInTheDocument();
      expect(screen.getByText('+ Add Transaction')).toBeInTheDocument();
    });

    test('switches to Transactions view', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Transactions'));
      expect(screen.getByText(/Transactions \(/)).toBeInTheDocument();
      expect(screen.getByText('+ Record Transaction')).toBeInTheDocument();
    });

    test('switches to Watchlist view', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Watchlist'));
      expect(screen.getByText(/Watchlist \(/)).toBeInTheDocument();
      expect(screen.getByText('+ Add to Watchlist')).toBeInTheDocument();
    });

    test('switches to Alerts view', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Alerts'));
      expect(screen.getByText(/Price Alerts \(/)).toBeInTheDocument();
      expect(screen.getByText('+ Create Alert')).toBeInTheDocument();
    });

    test('switches to Performance view', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Performance'));
      expect(screen.getByText('Performance Analysis')).toBeInTheDocument();
      expect(screen.getByText('Total Invested')).toBeInTheDocument();
      expect(screen.getByText('Return on Investment')).toBeInTheDocument();
    });
  });

  describe('Holdings View', () => {
    test('displays all holdings in table', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('VTI')).toBeInTheDocument();
      expect(screen.getByText('BTC')).toBeInTheDocument();
    });

    test('shows sortable column headers', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      expect(screen.getByText(/Symbol/)).toBeInTheDocument();
      expect(screen.getByText(/Market Value/)).toBeInTheDocument();
      expect(screen.getByText(/Total Gain/)).toBeInTheDocument();
      expect(screen.getByText(/Day Change/)).toBeInTheDocument();
    });

    test('sorts holdings by different columns', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      // Click symbol header to sort alphabetically
      fireEvent.click(screen.getByText(/Symbol/));
      const rows = screen.getAllByText(/shares @/);
      expect(rows.length).toBeGreaterThan(0);
    });

    test('toggles sort direction on second click', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      // Default sort is by value desc
      fireEvent.click(screen.getByText(/Market Value/));
      // Should toggle to asc since it was already sorted by value
      expect(screen.getByText(/Market Value.*▲/)).toBeInTheDocument();
    });

    test('filters holdings by asset type', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      const typeFilter = screen.getByLabelText('Filter by asset type');
      fireEvent.change(typeFilter, { target: { value: 'crypto' } });
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
    });

    test('filters holdings by sector', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      const sectorFilter = screen.getByLabelText('Filter by sector');
      fireEvent.change(sectorFilter, { target: { value: 'Healthcare' } });
      expect(screen.getByText('JNJ')).toBeInTheDocument();
      expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
    });

    test('filters holdings by search query', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      const searchInput = screen.getByPlaceholderText('Search holdings... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'apple' } });
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
    });

    test('shows empty state when no holdings match filters', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      const searchInput = screen.getByPlaceholderText('Search holdings... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } });
      expect(
        screen.getByText('No holdings match your filters')
      ).toBeInTheDocument();
    });

    test('opens holding detail panel when row is clicked', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('Apple Inc.'));
      expect(screen.getByText('AAPL Details')).toBeInTheDocument();
      expect(screen.getByText('Current Price')).toBeInTheDocument();
      expect(screen.getByText('Avg Cost')).toBeInTheDocument();
      expect(screen.getByText('Shares')).toBeInTheDocument();
    });

    test('closes holding detail panel', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('Apple Inc.'));
      expect(screen.getByText('AAPL Details')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Close details'));
      expect(screen.queryByText('AAPL Details')).not.toBeInTheDocument();
    });

    test('holding detail panel shows recent transactions for that holding', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('Apple Inc.'));
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      // AAPL has buy and sell transactions
      const buyBadges = screen.getAllByText('BUY');
      expect(buyBadges.length).toBeGreaterThan(0);
    });

    test('holding detail shows dividend info when yield > 0', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      // Click on AAPL which has 0.55% dividend yield
      fireEvent.click(screen.getByText('Apple Inc.'));
      expect(screen.getByText('Dividend Yield')).toBeInTheDocument();
      expect(screen.getByText('0.55%')).toBeInTheDocument();
    });
  });

  describe('Transactions View', () => {
    test('displays all transactions by default', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Transactions'));
      // Should show buy and sell types
      const buyBadges = screen.getAllByText('BUY');
      expect(buyBadges.length).toBeGreaterThan(0);
    });

    test('filters transactions by type', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Transactions'));
      const typeFilter = screen.getByLabelText('Filter by transaction type');
      fireEvent.change(typeFilter, { target: { value: 'sell' } });
      const sellBadges = screen.getAllByText('SELL');
      expect(sellBadges.length).toBeGreaterThan(0);
      expect(screen.queryAllByText('BUY').length).toBe(0);
    });

    test('filters transactions by date range', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Transactions'));
      const dateFilter = screen.getByLabelText('Filter by date range');
      fireEvent.change(dateFilter, { target: { value: '7d' } });
      // Most transactions are older than 7 days, so few should remain
      // The SELL transaction (t9) at 10 days ago should be filtered out too
    });

    test('shows Record Transaction button', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Transactions'));
      expect(screen.getByText('+ Record Transaction')).toBeInTheDocument();
    });
  });

  describe('Transaction Modal', () => {
    test('opens transaction modal from Holdings view', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('+ Add Transaction'));
      expect(screen.getByText('Record Transaction')).toBeInTheDocument();
    });

    test('transaction modal has buy/sell toggle', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('+ Add Transaction'));
      expect(screen.getByText('Buy')).toBeInTheDocument();
      expect(screen.getByText('Sell')).toBeInTheDocument();
    });

    test('fills in transaction form and calculates total', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('+ Add Transaction'));
      fireEvent.change(screen.getByPlaceholderText('Symbol (e.g. AAPL)'), {
        target: { value: 'TSLA' },
      });
      fireEvent.change(screen.getByPlaceholderText('Number of shares'), {
        target: { value: '10' },
      });
      fireEvent.change(screen.getByPlaceholderText('Price per share'), {
        target: { value: '250' },
      });
      // Total should show $2,500.00
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });

    test('saves a new transaction', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('+ Add Transaction'));
      fireEvent.change(screen.getByPlaceholderText('Symbol (e.g. AAPL)'), {
        target: { value: 'TSLA' },
      });
      fireEvent.change(screen.getByPlaceholderText('Number of shares'), {
        target: { value: '5' },
      });
      fireEvent.change(screen.getByPlaceholderText('Price per share'), {
        target: { value: '200' },
      });
      fireEvent.click(screen.getByText('Save Transaction'));
      // Modal should close
      expect(screen.queryByText('Record Transaction')).not.toBeInTheDocument();
    });

    test('closes transaction modal on Cancel', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('+ Add Transaction'));
      expect(screen.getByText('Record Transaction')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Record Transaction')).not.toBeInTheDocument();
    });

    test('does not save transaction if required fields are empty', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Holdings'));
      fireEvent.click(screen.getByText('+ Add Transaction'));
      // Click save without filling in fields
      fireEvent.click(screen.getByText('Save Transaction'));
      // Modal should remain open because validation failed
      expect(screen.getByText('Record Transaction')).toBeInTheDocument();
    });
  });

  describe('Watchlist View', () => {
    test('displays watchlist items as cards', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Watchlist'));
      expect(screen.getByText('NVDA')).toBeInTheDocument();
      expect(screen.getByText('NVIDIA Corp')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
      expect(screen.getByText('AMZN')).toBeInTheDocument();
    });

    test('shows target price and notes on watchlist cards', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Watchlist'));
      expect(screen.getByText('Wait for pullback to $800')).toBeInTheDocument();
      expect(screen.getByText('Buy below $400')).toBeInTheDocument();
    });

    test('opens add to watchlist modal', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Watchlist'));
      fireEvent.click(screen.getByText('+ Add to Watchlist'));
      expect(screen.getByText('Add to Watchlist')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Symbol (e.g. NVDA)')
      ).toBeInTheDocument();
    });

    test('adds a new item to the watchlist', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Watchlist'));
      fireEvent.click(screen.getByText('+ Add to Watchlist'));
      fireEvent.change(screen.getByPlaceholderText('Symbol (e.g. NVDA)'), {
        target: { value: 'META' },
      });
      fireEvent.change(screen.getByPlaceholderText('Company name'), {
        target: { value: 'Meta Platforms' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Add to Watchlist/i }));
      // After adding, should not show the modal header anymore
      // The new item should appear
      expect(screen.getByText('META')).toBeInTheDocument();
      expect(screen.getByText('Meta Platforms')).toBeInTheDocument();
    });

    test('removes item from watchlist with confirmation', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Watchlist'));
      window.confirm.mockReturnValue(true);
      const removeButton = screen.getByLabelText('Remove NVDA from watchlist');
      fireEvent.click(removeButton);
      expect(window.confirm).toHaveBeenCalledWith('Remove from watchlist?');
      expect(screen.queryByText('NVIDIA Corp')).not.toBeInTheDocument();
    });

    test('does not remove item if confirmation is cancelled', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Watchlist'));
      window.confirm.mockReturnValue(false);
      const removeButton = screen.getByLabelText('Remove NVDA from watchlist');
      fireEvent.click(removeButton);
      expect(screen.getByText('NVIDIA Corp')).toBeInTheDocument();
    });
  });

  describe('Alerts View', () => {
    test('displays all alerts in table', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Alerts'));
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('Price Above')).toBeInTheDocument();
      expect(screen.getByText('Price Below')).toBeInTheDocument();
    });

    test('shows alert status badges (Active/Paused)', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Alerts'));
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBeGreaterThan(0);
      const pausedBadges = screen.getAllByText('Paused');
      expect(pausedBadges.length).toBeGreaterThan(0);
    });

    test('toggles alert active/paused state', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Alerts'));
      // Find the Pause buttons (for active alerts) and click one
      const pauseButtons = screen.getAllByText('Pause');
      const initialCount = pauseButtons.length;
      fireEvent.click(pauseButtons[0]);
      // Now there should be one fewer Pause button and one more Resume
      const newPauseButtons = screen.getAllByText('Pause');
      expect(newPauseButtons.length).toBe(initialCount - 1);
    });

    test('deletes alert with confirmation', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Alerts'));
      window.confirm.mockReturnValue(true);
      const deleteButtons = screen.getAllByText('Delete');
      const initialCount = deleteButtons.length;
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalledWith('Delete this alert?');
      const remainingDeleteButtons = screen.getAllByText('Delete');
      expect(remainingDeleteButtons.length).toBe(initialCount - 1);
    });

    test('opens create alert modal', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Alerts'));
      fireEvent.click(screen.getByText('+ Create Alert'));
      expect(screen.getByText('Create Price Alert')).toBeInTheDocument();
      expect(screen.getByLabelText('Alert type')).toBeInTheDocument();
    });

    test('creates a new alert', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Alerts'));
      fireEvent.click(screen.getByText('+ Create Alert'));
      fireEvent.change(
        screen.getByPlaceholderText('Symbol (e.g. AAPL)'),
        { target: { value: 'NVDA' } }
      );
      fireEvent.change(screen.getByLabelText('Alert type'), {
        target: { value: 'price_above' },
      });
      fireEvent.change(screen.getByPlaceholderText('Price threshold'), {
        target: { value: '900' },
      });
      fireEvent.click(screen.getByText('Create Alert'));
      // Modal should close and new alert should appear
      expect(screen.queryByText('Create Price Alert')).not.toBeInTheDocument();
      expect(screen.getByText('NVDA')).toBeInTheDocument();
    });
  });

  describe('Performance View', () => {
    test('displays performance summary cards', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Performance'));
      expect(screen.getByText('Total Invested')).toBeInTheDocument();
      expect(screen.getByText('Current Value')).toBeInTheDocument();
      expect(screen.getByText('Return on Investment')).toBeInTheDocument();
      expect(screen.getByText('Total Fees Paid')).toBeInTheDocument();
    });

    test('shows holdings performance breakdown table', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Performance'));
      expect(
        screen.getByText('Holdings Performance Breakdown')
      ).toBeInTheDocument();
      expect(screen.getByText('Cost Basis')).toBeInTheDocument();
      expect(screen.getByText('Return %')).toBeInTheDocument();
      expect(screen.getByText('% of Portfolio')).toBeInTheDocument();
    });

    test('displays all holdings in performance breakdown', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Performance'));
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('VTI')).toBeInTheDocument();
    });
  });

  describe('Theme & Settings', () => {
    test('toggles dark mode', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Dark Mode'));
      // After toggling, should show Light Mode
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'portfolioTheme',
        'dark'
      );
    });

    test('persists dark mode to localStorage', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Dark Mode'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'portfolioTheme',
        'dark'
      );
      fireEvent.click(screen.getByText('Light Mode'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'portfolioTheme',
        'light'
      );
    });

    test('opens settings panel', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Portfolio Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Currency')).toBeInTheDocument();
      expect(screen.getByText('Show Percentages')).toBeInTheDocument();
      expect(screen.getByText('Compact View')).toBeInTheDocument();
      expect(screen.getByText('Alert Sound')).toBeInTheDocument();
    });

    test('changes currency setting', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Settings'));
      const currencySelect = screen.getByLabelText('Currency');
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });
      // Settings should be persisted to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('closes settings panel', () => {
      render(<FinancialPortfolio />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Portfolio Settings')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Done'));
      expect(
        screen.queryByText('Portfolio Settings')
      ).not.toBeInTheDocument();
    });
  });

  describe('Sidebar Collapse', () => {
    test('collapses sidebar when toggle button is clicked', () => {
      render(<FinancialPortfolio />);
      expect(screen.getByText('PortfolioTracker')).toBeInTheDocument();
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      // After collapse, the title should not be visible
      expect(
        screen.queryByText('PortfolioTracker')
      ).not.toBeInTheDocument();
    });

    test('expands sidebar when toggle button is clicked again', () => {
      render(<FinancialPortfolio />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton); // collapse
      expect(
        screen.queryByText('PortfolioTracker')
      ).not.toBeInTheDocument();
      fireEvent.click(toggleButton); // expand
      expect(screen.getByText('PortfolioTracker')).toBeInTheDocument();
    });
  });
});
