import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalyticsDashboard from './src/app/page.jsx';

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

// Mock URL.createObjectURL / revokeObjectURL for export tests
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock HTMLAnchorElement click
HTMLAnchorElement.prototype.click = vi.fn();

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Initial Rendering
  // ───────────────────────────────────────────────────────────────────────────

  describe('Initial Rendering', () => {
    test('renders dashboard header with title', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText('Sales Analytics')).toBeInTheDocument();
    });

    test('renders dashboard header element', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByPlaceholderText(/Search transactions/)).toBeInTheDocument();
    });

    test('renders export button', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('export-btn')).toBeInTheDocument();
    });

    test('renders theme toggle button', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    test('renders settings button', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('settings-btn')).toBeInTheDocument();
    });

    test('renders comparison toggle checkbox', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('comparison-toggle')).toBeInTheDocument();
    });

    test('renders filter sidebar', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument();
    });

    test('renders tab navigation with all tabs', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
      expect(screen.getByTestId('tab-charts')).toBeInTheDocument();
      expect(screen.getByTestId('tab-breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('tab-transactions')).toBeInTheDocument();
    });

    test('defaults to overview tab', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('overview-section')).toBeInTheDocument();
    });

    test('renders KPI cards on overview tab', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('kpi-section')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-total-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-total-profit')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-total-orders')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-avg-order-value')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-profit-margin')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-items-sold')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-unique-customers')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-refund-rate')).toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Filter Sidebar
  // ───────────────────────────────────────────────────────────────────────────

  describe('Filter Sidebar', () => {
    test('renders date range presets', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('preset-7')).toBeInTheDocument();
      expect(screen.getByTestId('preset-30')).toBeInTheDocument();
      expect(screen.getByTestId('preset-90')).toBeInTheDocument();
      expect(screen.getByTestId('preset-365')).toBeInTheDocument();
    });

    test('renders date start and end inputs', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('date-start')).toBeInTheDocument();
      expect(screen.getByTestId('date-end')).toBeInTheDocument();
    });

    test('renders region filter checkboxes', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('region-north-america')).toBeInTheDocument();
      expect(screen.getByTestId('region-europe')).toBeInTheDocument();
      expect(screen.getByTestId('region-asia-pacific')).toBeInTheDocument();
      expect(screen.getByTestId('region-latin-america')).toBeInTheDocument();
      expect(screen.getByTestId('region-middle-east')).toBeInTheDocument();
    });

    test('renders category filter checkboxes', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('category-electronics')).toBeInTheDocument();
      expect(screen.getByTestId('category-clothing')).toBeInTheDocument();
      expect(screen.getByTestId('category-home---garden')).toBeInTheDocument();
      expect(screen.getByTestId('category-sports')).toBeInTheDocument();
      expect(screen.getByTestId('category-books')).toBeInTheDocument();
      expect(screen.getByTestId('category-food---beverage')).toBeInTheDocument();
    });

    test('renders channel filter checkboxes', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('channel-online')).toBeInTheDocument();
      expect(screen.getByTestId('channel-retail')).toBeInTheDocument();
      expect(screen.getByTestId('channel-wholesale')).toBeInTheDocument();
      expect(screen.getByTestId('channel-partner')).toBeInTheDocument();
    });

    test('renders group-by select with default value "day"', () => {
      render(<AnalyticsDashboard />);
      const select = screen.getByTestId('group-by-select');
      expect(select).toBeInTheDocument();
      expect(select.value).toBe('day');
    });

    test('all region checkboxes are checked by default', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('region-north-america')).toBeChecked();
      expect(screen.getByTestId('region-europe')).toBeChecked();
      expect(screen.getByTestId('region-asia-pacific')).toBeChecked();
      expect(screen.getByTestId('region-latin-america')).toBeChecked();
      expect(screen.getByTestId('region-middle-east')).toBeChecked();
    });

    test('all category checkboxes are checked by default', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('category-electronics')).toBeChecked();
      expect(screen.getByTestId('category-clothing')).toBeChecked();
      expect(screen.getByTestId('category-sports')).toBeChecked();
      expect(screen.getByTestId('category-books')).toBeChecked();
    });

    test('all channel checkboxes are checked by default', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('channel-online')).toBeChecked();
      expect(screen.getByTestId('channel-retail')).toBeChecked();
      expect(screen.getByTestId('channel-wholesale')).toBeChecked();
      expect(screen.getByTestId('channel-partner')).toBeChecked();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Region Filter Toggling
  // ───────────────────────────────────────────────────────────────────────────

  describe('Region Filter Toggling', () => {
    test('unchecking a region updates KPI values', () => {
      render(<AnalyticsDashboard />);
      const revenueKpi = screen.getByTestId('kpi-total-revenue');
      const initialText = revenueKpi.textContent;

      fireEvent.click(screen.getByTestId('region-north-america'));

      const updatedText = revenueKpi.textContent;
      expect(updatedText).not.toBe(initialText);
    });

    test('unchecking and re-checking a region restores KPI values', () => {
      render(<AnalyticsDashboard />);
      const revenueKpi = screen.getByTestId('kpi-total-revenue');
      const initialText = revenueKpi.textContent;

      fireEvent.click(screen.getByTestId('region-europe'));
      fireEvent.click(screen.getByTestId('region-europe'));

      expect(revenueKpi.textContent).toBe(initialText);
    });

    test('unchecking a region checkbox unchecks it', () => {
      render(<AnalyticsDashboard />);
      const checkbox = screen.getByTestId('region-asia-pacific');
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Category Filter Toggling
  // ───────────────────────────────────────────────────────────────────────────

  describe('Category Filter Toggling', () => {
    test('unchecking a category updates KPIs', () => {
      render(<AnalyticsDashboard />);
      const ordersKpi = screen.getByTestId('kpi-total-orders');
      const initial = ordersKpi.textContent;

      fireEvent.click(screen.getByTestId('category-electronics'));

      expect(ordersKpi.textContent).not.toBe(initial);
    });

    test('unchecking all categories shows zero orders', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('category-electronics'));
      fireEvent.click(screen.getByTestId('category-clothing'));
      fireEvent.click(screen.getByTestId('category-home---garden'));
      fireEvent.click(screen.getByTestId('category-sports'));
      fireEvent.click(screen.getByTestId('category-books'));
      fireEvent.click(screen.getByTestId('category-food---beverage'));

      const ordersKpi = screen.getByTestId('kpi-total-orders');
      expect(ordersKpi.textContent).toContain('0');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Channel Filter Toggling
  // ───────────────────────────────────────────────────────────────────────────

  describe('Channel Filter Toggling', () => {
    test('unchecking a channel updates revenue KPI', () => {
      render(<AnalyticsDashboard />);
      const revenueKpi = screen.getByTestId('kpi-total-revenue');
      const initial = revenueKpi.textContent;

      fireEvent.click(screen.getByTestId('channel-online'));

      expect(revenueKpi.textContent).not.toBe(initial);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Date Range Presets
  // ───────────────────────────────────────────────────────────────────────────

  describe('Date Range Presets', () => {
    test('clicking 7-day preset updates KPI values', () => {
      render(<AnalyticsDashboard />);
      const revenueKpi = screen.getByTestId('kpi-total-revenue');
      const initialText = revenueKpi.textContent;

      fireEvent.click(screen.getByTestId('preset-365'));
      const yearText = revenueKpi.textContent;

      // Year-long range should show more revenue than default 30 days
      expect(yearText).not.toBe(initialText);
    });

    test('clicking 7-day preset then 90-day preset shows different data', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('preset-7'));
      const sevenDayRevenue = screen.getByTestId('kpi-total-revenue').textContent;

      fireEvent.click(screen.getByTestId('preset-90'));
      const ninetyDayRevenue = screen.getByTestId('kpi-total-revenue').textContent;

      expect(ninetyDayRevenue).not.toBe(sevenDayRevenue);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Group By
  // ───────────────────────────────────────────────────────────────────────────

  describe('Group By', () => {
    test('changing group-by select updates its value', () => {
      render(<AnalyticsDashboard />);
      const select = screen.getByTestId('group-by-select');
      fireEvent.change(select, { target: { value: 'month' } });
      expect(select.value).toBe('month');
    });

    test('changing group-by to week updates charts tab heading', () => {
      render(<AnalyticsDashboard />);
      fireEvent.change(screen.getByTestId('group-by-select'), { target: { value: 'week' } });
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByText(/Weekly/)).toBeInTheDocument();
    });

    test('changing group-by to year updates charts tab heading', () => {
      render(<AnalyticsDashboard />);
      fireEvent.change(screen.getByTestId('group-by-select'), { target: { value: 'year' } });
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByText(/Yearly/)).toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Theme Toggling
  // ───────────────────────────────────────────────────────────────────────────

  describe('Theme Toggling', () => {
    test('clicking theme toggle saves dark to localStorage', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('theme-toggle'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('analyticsDashboardTheme', 'dark');
    });

    test('clicking theme toggle twice saves light to localStorage', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('theme-toggle'));
      fireEvent.click(screen.getByTestId('theme-toggle'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('analyticsDashboardTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'analyticsDashboardTheme') return 'dark';
        return null;
      });
      render(<AnalyticsDashboard />);
      // In dark mode, the toggle shows the sun emoji
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    test('light theme shows moon emoji', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByText('🌙')).toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Tab Navigation
  // ───────────────────────────────────────────────────────────────────────────

  describe('Tab Navigation', () => {
    test('clicking charts tab shows charts section', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByTestId('charts-section')).toBeInTheDocument();
    });

    test('clicking breakdown tab shows breakdown section', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.getByTestId('breakdown-section')).toBeInTheDocument();
    });

    test('clicking transactions tab shows transactions section', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByTestId('transactions-section')).toBeInTheDocument();
    });

    test('clicking overview tab returns to overview', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      fireEvent.click(screen.getByTestId('tab-overview'));
      expect(screen.getByTestId('overview-section')).toBeInTheDocument();
    });

    test('KPI section is visible on both overview and charts tabs', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('kpi-section')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByTestId('kpi-section')).toBeInTheDocument();
    });

    test('KPI section is not visible on breakdown tab', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.queryByTestId('kpi-section')).not.toBeInTheDocument();
    });

    test('KPI section is not visible on transactions tab', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.queryByTestId('kpi-section')).not.toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Charts Tab
  // ───────────────────────────────────────────────────────────────────────────

  describe('Charts Tab', () => {
    test('renders chart type selector buttons', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByTestId('chart-type-bar')).toBeInTheDocument();
      expect(screen.getByTestId('chart-type-line')).toBeInTheDocument();
      expect(screen.getByTestId('chart-type-pie')).toBeInTheDocument();
    });

    test('defaults to bar chart', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    test('clicking line button switches to line chart', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      fireEvent.click(screen.getByTestId('chart-type-line'));
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    test('clicking pie button switches to pie chart', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      fireEvent.click(screen.getByTestId('chart-type-pie'));
      expect(screen.getAllByTestId(/pie-chart/)[0]).toBeInTheDocument();
    });

    test('charts tab shows category and region pie charts', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByText('Revenue by Category')).toBeInTheDocument();
      expect(screen.getByText('Revenue by Region')).toBeInTheDocument();
    });

    test('bar chart renders data bars', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByTestId('bar-0')).toBeInTheDocument();
    });

    test('charts heading reflects daily grouping', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByText(/Daily/)).toBeInTheDocument();
    });

    test('charts heading reflects monthly grouping', () => {
      render(<AnalyticsDashboard />);
      fireEvent.change(screen.getByTestId('group-by-select'), { target: { value: 'month' } });
      fireEvent.click(screen.getByTestId('tab-charts'));
      expect(screen.getByText(/Monthly/)).toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Overview Tab - Top Products & Summaries
  // ───────────────────────────────────────────────────────────────────────────

  describe('Overview Tab - Top Products & Summaries', () => {
    test('renders top products list', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('top-products-list')).toBeInTheDocument();
    });

    test('renders top product rows', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('top-product-0')).toBeInTheDocument();
      expect(screen.getByTestId('top-product-1')).toBeInTheDocument();
    });

    test('renders region summary section', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('region-summary')).toBeInTheDocument();
    });

    test('renders channel summary section', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('channel-summary')).toBeInTheDocument();
    });

    test('renders region summary rows', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('region-row-0')).toBeInTheDocument();
    });

    test('renders channel summary rows', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('channel-row-0')).toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Breakdown Tab
  // ───────────────────────────────────────────────────────────────────────────

  describe('Breakdown Tab', () => {
    test('renders category breakdown table', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
    });

    test('renders region breakdown table', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.getByText('Region Breakdown')).toBeInTheDocument();
    });

    test('renders channel breakdown table', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.getByText('Channel Breakdown')).toBeInTheDocument();
    });

    test('renders category breakdown rows', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.getByTestId('category-breakdown-row-0')).toBeInTheDocument();
    });

    test('renders region breakdown rows', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.getByTestId('region-breakdown-row-0')).toBeInTheDocument();
    });

    test('renders channel breakdown rows', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.getByTestId('channel-breakdown-row-0')).toBeInTheDocument();
    });

    test('breakdown tables show Revenue, Profit, Orders columns', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      const headings = screen.getAllByText('Revenue');
      expect(headings.length).toBeGreaterThan(0);
      expect(screen.getAllByText('Profit').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Orders').length).toBeGreaterThan(0);
    });

    test('breakdown tables show Margin column', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      expect(screen.getAllByText('Margin').length).toBeGreaterThanOrEqual(3);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Transactions Tab
  // ───────────────────────────────────────────────────────────────────────────

  describe('Transactions Tab', () => {
    test('renders transaction table', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByTestId('transactions-section')).toBeInTheDocument();
    });

    test('renders transaction rows', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByTestId('txn-row-0')).toBeInTheDocument();
    });

    test('shows total transaction count', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByText(/total\)/)).toBeInTheDocument();
    });

    test('renders sort headers for all columns', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByTestId('sort-date')).toBeInTheDocument();
      expect(screen.getByTestId('sort-region')).toBeInTheDocument();
      expect(screen.getByTestId('sort-category')).toBeInTheDocument();
      expect(screen.getByTestId('sort-channel')).toBeInTheDocument();
      expect(screen.getByTestId('sort-amount')).toBeInTheDocument();
      expect(screen.getByTestId('sort-profit')).toBeInTheDocument();
      expect(screen.getByTestId('sort-quantity')).toBeInTheDocument();
    });

    test('renders pagination controls', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByTestId('prev-page')).toBeInTheDocument();
      expect(screen.getByTestId('next-page')).toBeInTheDocument();
    });

    test('shows page 1 of N', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Sorting
  // ───────────────────────────────────────────────────────────────────────────

  describe('Sorting', () => {
    test('clicking amount header sorts by amount', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('sort-amount'));

      const header = screen.getByTestId('sort-amount');
      expect(header.textContent).toContain('↓');
    });

    test('clicking amount header twice toggles sort direction', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('sort-amount'));
      fireEvent.click(screen.getByTestId('sort-amount'));

      const header = screen.getByTestId('sort-amount');
      expect(header.textContent).toContain('↑');
    });

    test('clicking region header sorts by region', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('sort-region'));

      const header = screen.getByTestId('sort-region');
      expect(header.textContent).toContain('↓');
    });

    test('default sort is by date descending', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      const dateHeader = screen.getByTestId('sort-date');
      expect(dateHeader.textContent).toContain('↓');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Pagination
  // ───────────────────────────────────────────────────────────────────────────

  describe('Pagination', () => {
    test('previous button is disabled on page 1', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByTestId('prev-page')).toBeDisabled();
    });

    test('clicking next page advances to page 2', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
    });

    test('clicking next then previous returns to page 1', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('next-page'));
      fireEvent.click(screen.getByTestId('prev-page'));
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    test('clicking a page number button goes to that page', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('page-2'));
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Search
  // ───────────────────────────────────────────────────────────────────────────

  describe('Search', () => {
    test('typing in search input updates its value', () => {
      render(<AnalyticsDashboard />);
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'Electronics' } });
      expect(input.value).toBe('Electronics');
    });

    test('searching filters KPI values', () => {
      render(<AnalyticsDashboard />);
      const revenueKpi = screen.getByTestId('kpi-total-revenue');
      const initial = revenueKpi.textContent;

      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'cust-1' } });

      expect(revenueKpi.textContent).not.toBe(initial);
    });

    test('searching for non-existent term shows zero orders', () => {
      render(<AnalyticsDashboard />);
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'zzz-nonexistent-zzz' } });

      const ordersKpi = screen.getByTestId('kpi-total-orders');
      expect(ordersKpi.textContent).toContain('0');
    });

    test('clearing search restores full data', () => {
      render(<AnalyticsDashboard />);
      const revenueKpi = screen.getByTestId('kpi-total-revenue');
      const initial = revenueKpi.textContent;

      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'cust-1' } });
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } });

      expect(revenueKpi.textContent).toBe(initial);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Export Menu
  // ───────────────────────────────────────────────────────────────────────────

  describe('Export Menu', () => {
    test('clicking export button opens export menu', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('export-btn'));
      expect(screen.getByTestId('export-menu')).toBeInTheDocument();
    });

    test('export menu shows CSV and JSON options', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('export-btn'));
      expect(screen.getByTestId('export-csv-btn')).toBeInTheDocument();
      expect(screen.getByTestId('export-json-btn')).toBeInTheDocument();
    });

    test('clicking export button again closes the menu', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('export-btn'));
      expect(screen.getByTestId('export-menu')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('export-btn'));
      expect(screen.queryByTestId('export-menu')).not.toBeInTheDocument();
    });

    test('clicking export CSV creates a blob and triggers download', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('export-btn'));
      fireEvent.click(screen.getByTestId('export-csv-btn'));

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('clicking export JSON creates a blob and triggers download', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('export-btn'));
      fireEvent.click(screen.getByTestId('export-json-btn'));

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('export menu closes after CSV export', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('export-btn'));
      fireEvent.click(screen.getByTestId('export-csv-btn'));

      expect(screen.queryByTestId('export-menu')).not.toBeInTheDocument();
    });

    test('export menu closes after JSON export', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('export-btn'));
      fireEvent.click(screen.getByTestId('export-json-btn'));

      expect(screen.queryByTestId('export-menu')).not.toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Comparison Mode
  // ───────────────────────────────────────────────────────────────────────────

  describe('Comparison Mode', () => {
    test('comparison toggle is unchecked by default', () => {
      render(<AnalyticsDashboard />);
      expect(screen.getByTestId('comparison-toggle')).not.toBeChecked();
    });

    test('enabling comparison mode shows change indicators', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('comparison-toggle'));

      // Should show change indicators for revenue, profit, and orders
      expect(screen.getByTestId('kpi-change-total-revenue')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-change-total-profit')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-change-total-orders')).toBeInTheDocument();
    });

    test('change indicators show percentage with up or down arrow', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('comparison-toggle'));

      const revenueChange = screen.getByTestId('kpi-change-total-revenue');
      expect(revenueChange.textContent).toMatch(/[↑↓]\s*[\d.]+%/);
    });

    test('disabling comparison mode hides change indicators', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('comparison-toggle'));
      expect(screen.getByTestId('kpi-change-total-revenue')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('comparison-toggle'));
      expect(screen.queryByTestId('kpi-change-total-revenue')).not.toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Settings Panel
  // ───────────────────────────────────────────────────────────────────────────

  describe('Settings Panel', () => {
    test('clicking settings button opens settings panel', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('settings-btn'));
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
    });

    test('settings panel has KPI layout select', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('settings-btn'));
      expect(screen.getByTestId('kpi-layout-select')).toBeInTheDocument();
    });

    test('settings panel has refresh interval select', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('settings-btn'));
      expect(screen.getByTestId('refresh-interval-select')).toBeInTheDocument();
    });

    test('settings panel has page size select', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('settings-btn'));
      expect(screen.getByTestId('page-size-select')).toBeInTheDocument();
    });

    test('changing KPI layout to compact changes KPI grid', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('settings-btn'));
      fireEvent.change(screen.getByTestId('kpi-layout-select'), { target: { value: 'compact' } });
      expect(screen.getByTestId('kpi-layout-select').value).toBe('compact');
    });

    test('changing page size to 10 shows fewer transactions', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('settings-btn'));
      fireEvent.change(screen.getByTestId('page-size-select'), { target: { value: '10' } });

      fireEvent.click(screen.getByTestId('tab-transactions'));
      // With page size 10, we should have rows 0-9 but not row 10
      expect(screen.getByTestId('txn-row-0')).toBeInTheDocument();
      expect(screen.getByTestId('txn-row-9')).toBeInTheDocument();
      expect(screen.queryByTestId('txn-row-10')).not.toBeInTheDocument();
    });

    test('changing page size to 50 shows more transactions', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('settings-btn'));
      fireEvent.change(screen.getByTestId('page-size-select'), { target: { value: '50' } });

      fireEvent.click(screen.getByTestId('tab-transactions'));
      expect(screen.getByTestId('txn-row-25')).toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Drill-Down Modal
  // ───────────────────────────────────────────────────────────────────────────

  describe('Drill-Down Modal', () => {
    test('clicking a region summary row opens drill-down modal', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('region-row-0'));
      expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument();
    });

    test('drill-down modal shows summary KPIs', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('region-row-0'));
      expect(screen.getByTestId('drill-kpi-0')).toBeInTheDocument();
      expect(screen.getByTestId('drill-kpi-1')).toBeInTheDocument();
      expect(screen.getByTestId('drill-kpi-2')).toBeInTheDocument();
      expect(screen.getByTestId('drill-kpi-3')).toBeInTheDocument();
    });

    test('drill-down modal shows transaction rows', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('region-row-0'));
      expect(screen.getByTestId('drill-txn-0')).toBeInTheDocument();
    });

    test('drill-down modal has close button', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('region-row-0'));
      expect(screen.getByTestId('close-drill-down')).toBeInTheDocument();
    });

    test('clicking close button closes drill-down modal', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('region-row-0'));
      expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('close-drill-down'));
      expect(screen.queryByTestId('drill-down-modal')).not.toBeInTheDocument();
    });

    test('clicking a channel summary row opens drill-down for that channel', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('channel-row-0'));
      expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument();
    });

    test('clicking category breakdown row opens drill-down', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      fireEvent.click(screen.getByTestId('category-breakdown-row-0'));
      expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument();
    });

    test('clicking region breakdown row opens drill-down', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      fireEvent.click(screen.getByTestId('region-breakdown-row-0'));
      expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument();
    });

    test('clicking channel breakdown row opens drill-down', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      fireEvent.click(screen.getByTestId('channel-breakdown-row-0'));
      expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument();
    });

    test('clicking overlay background closes drill-down', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('region-row-0'));
      expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('drill-down-modal'));
      expect(screen.queryByTestId('drill-down-modal')).not.toBeInTheDocument();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // KPI Calculations Correctness
  // ───────────────────────────────────────────────────────────────────────────

  describe('KPI Calculations', () => {
    test('KPI total revenue is a non-zero currency value', () => {
      render(<AnalyticsDashboard />);
      const kpi = screen.getByTestId('kpi-total-revenue');
      expect(kpi.textContent).toMatch(/\$/);
      expect(kpi.textContent).not.toContain('$0');
    });

    test('KPI total profit is a non-zero currency value', () => {
      render(<AnalyticsDashboard />);
      const kpi = screen.getByTestId('kpi-total-profit');
      expect(kpi.textContent).toMatch(/\$/);
      expect(kpi.textContent).not.toContain('$0');
    });

    test('KPI total orders is a positive number', () => {
      render(<AnalyticsDashboard />);
      const kpi = screen.getByTestId('kpi-total-orders');
      const text = kpi.textContent.replace(/[^0-9]/g, '');
      expect(Number(text)).toBeGreaterThan(0);
    });

    test('KPI profit margin is between 0 and 100', () => {
      render(<AnalyticsDashboard />);
      const kpi = screen.getByTestId('kpi-profit-margin');
      const match = kpi.textContent.match(/([\d.]+)%/);
      expect(match).not.toBeNull();
      const pct = parseFloat(match[1]);
      expect(pct).toBeGreaterThan(0);
      expect(pct).toBeLessThan(100);
    });

    test('KPI refund rate is between 0 and 100', () => {
      render(<AnalyticsDashboard />);
      const kpi = screen.getByTestId('kpi-refund-rate');
      const match = kpi.textContent.match(/([\d.]+)%/);
      expect(match).not.toBeNull();
      const pct = parseFloat(match[1]);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThan(100);
    });

    test('KPI unique customers is a positive number', () => {
      render(<AnalyticsDashboard />);
      const kpi = screen.getByTestId('kpi-unique-customers');
      const text = kpi.textContent.replace(/[^0-9]/g, '');
      expect(Number(text)).toBeGreaterThan(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Cross-Feature Interactions
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cross-Feature Interactions', () => {
    test('changing date preset affects transaction count on transactions tab', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('preset-7'));
      fireEvent.click(screen.getByTestId('tab-transactions'));
      const shortText = screen.getByText(/total\)/).textContent;

      fireEvent.click(screen.getByTestId('preset-365'));
      const longText = screen.getByText(/total\)/).textContent;

      expect(longText).not.toBe(shortText);
    });

    test('filtering regions affects breakdown tab data', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      const initialRows = screen.getAllByTestId(/region-breakdown-row-/);
      const initialCount = initialRows.length;

      fireEvent.click(screen.getByTestId('region-north-america'));

      const updatedRows = screen.getAllByTestId(/region-breakdown-row-/);
      expect(updatedRows.length).toBe(initialCount - 1);
    });

    test('filtering categories affects breakdown tab data', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-breakdown'));
      const initialRows = screen.getAllByTestId(/category-breakdown-row-/);
      const initialCount = initialRows.length;

      fireEvent.click(screen.getByTestId('category-electronics'));

      const updatedRows = screen.getAllByTestId(/category-breakdown-row-/);
      expect(updatedRows.length).toBe(initialCount - 1);
    });

    test('search filtering is preserved across tab switches', () => {
      render(<AnalyticsDashboard />);
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'cust-1' } });
      const filteredRevenue = screen.getByTestId('kpi-total-revenue').textContent;

      fireEvent.click(screen.getByTestId('tab-charts'));
      fireEvent.click(screen.getByTestId('tab-overview'));

      expect(screen.getByTestId('kpi-total-revenue').textContent).toBe(filteredRevenue);
    });

    test('sort state is preserved across tab switches', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('sort-amount'));

      fireEvent.click(screen.getByTestId('tab-overview'));
      fireEvent.click(screen.getByTestId('tab-transactions'));

      const header = screen.getByTestId('sort-amount');
      expect(header.textContent).toContain('↓');
    });

    test('page resets to 1 after changing date range preset', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('preset-7'));
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    test('page resets to 1 after toggling a region filter', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('region-europe'));
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    test('page resets to 1 after sorting', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('sort-amount'));
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    test('page resets to 1 after search input', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('tab-transactions'));
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();

      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'North' } });
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    test('drill-down from overview then closing returns to overview', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('region-row-0'));
      expect(screen.getByTestId('drill-down-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('close-drill-down'));
      expect(screen.queryByTestId('drill-down-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('overview-section')).toBeInTheDocument();
    });

    test('comparison mode works with filtered regions', () => {
      render(<AnalyticsDashboard />);
      fireEvent.click(screen.getByTestId('region-north-america'));
      fireEvent.click(screen.getByTestId('comparison-toggle'));

      expect(screen.getByTestId('kpi-change-total-revenue')).toBeInTheDocument();
    });
  });
});
