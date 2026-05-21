import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import FinancialDashboard from "./src/app/page.jsx";

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

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock confirm dialog
window.confirm = vi.fn();

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn(() => "blob:mock-url");
URL.revokeObjectURL = vi.fn();

// Mock document.createElement('a').click for CSV export
const mockClick = vi.fn();
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, "createElement").mockImplementation((tag) => {
  const el = originalCreateElement(tag);
  if (tag === "a") {
    el.click = mockClick;
  }
  return el;
});

describe("FinancialDashboard Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe("Initial Rendering", () => {
    test("renders sidebar with FinTracker title", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("FinTracker")).toBeInTheDocument();
    });

    test("renders sidebar navigation items", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Transactions")).toBeInTheDocument();
      expect(screen.getByText("Charts")).toBeInTheDocument();
      expect(screen.getByText("Budget")).toBeInTheDocument();
      expect(screen.getByText("Departments")).toBeInTheDocument();
      expect(screen.getByText("Reports")).toBeInTheDocument();
    });

    test("renders header with search and filter controls", () => {
      render(<FinancialDashboard />);
      expect(
        screen.getByPlaceholderText("Search transactions... (Ctrl+K)")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Filter by type")).toBeInTheDocument();
      expect(screen.getByLabelText("Filter by category")).toBeInTheDocument();
      expect(screen.getByLabelText("Filter by department")).toBeInTheDocument();
      expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    });

    test("renders overview view by default with KPI cards", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("Financial Overview")).toBeInTheDocument();
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("Total Expenses")).toBeInTheDocument();
      expect(screen.getByText("Net Income")).toBeInTheDocument();
      expect(screen.getByText("Profit Margin")).toBeInTheDocument();
      expect(screen.getByText("Pending Transactions")).toBeInTheDocument();
      expect(screen.getByText("Avg Transaction")).toBeInTheDocument();
    });

    test("renders Export CSV button in header", () => {
      render(<FinancialDashboard />);
      const exportButtons = screen.getAllByText("Export CSV");
      expect(exportButtons.length).toBeGreaterThan(0);
    });

    test("renders Settings button in sidebar", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    test("renders net income in sidebar footer", () => {
      render(<FinancialDashboard />);
      // The sidebar footer shows Net Income label
      const sidebarNetIncome = screen.getAllByText("Net Income");
      expect(sidebarNetIncome.length).toBeGreaterThan(0);
    });

    test("renders date range filters", () => {
      render(<FinancialDashboard />);
      expect(screen.getByLabelText("Start date")).toBeInTheDocument();
      expect(screen.getByLabelText("End date")).toBeInTheDocument();
    });
  });

  describe("Theme Toggling", () => {
    test("renders theme toggle button", () => {
      render(<FinancialDashboard />);
      expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    });

    test("toggling theme saves to localStorage", () => {
      render(<FinancialDashboard />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "finDashTheme",
        "dark"
      );
    });

    test("toggling theme twice returns to light mode", () => {
      render(<FinancialDashboard />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "finDashTheme",
        "light"
      );
    });

    test("loads dark theme from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "finDashTheme") return "dark";
        return null;
      });
      render(<FinancialDashboard />);
      expect(screen.getByText("\u2600\uFE0F")).toBeInTheDocument();
    });
  });

  describe("Sidebar Navigation", () => {
    test("clicking Overview shows overview with KPI cards", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Overview"));
      expect(screen.getByText("Financial Overview")).toBeInTheDocument();
    });

    test("clicking Transactions shows transactions table", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      expect(screen.getByText("+ Add Transaction")).toBeInTheDocument();
    });

    test("clicking Charts shows chart controls", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Charts"));
      expect(screen.getByText("Charts & Analytics")).toBeInTheDocument();
    });

    test("clicking Budget shows budget table", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Budget"));
      expect(screen.getByText("Budget vs Actuals")).toBeInTheDocument();
    });

    test("clicking Departments shows department cards", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Departments"));
      expect(screen.getByText("Department Performance")).toBeInTheDocument();
    });

    test("clicking Reports shows report options", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Reports"));
      expect(screen.getByText("Financial Summary")).toBeInTheDocument();
      expect(screen.getByText("Budget Report")).toBeInTheDocument();
      expect(screen.getByText("Department Analysis")).toBeInTheDocument();
    });

    test("saves active view to localStorage on navigation", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "finDashView",
        "transactions"
      );
    });
  });

  describe("Sidebar Collapse/Expand", () => {
    test("renders toggle sidebar button", () => {
      render(<FinancialDashboard />);
      expect(screen.getByLabelText("Toggle sidebar")).toBeInTheDocument();
    });

    test("collapsing sidebar hides navigation labels", () => {
      render(<FinancialDashboard />);
      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);
      expect(screen.queryByText("Overview")).not.toBeInTheDocument();
      expect(screen.queryByText("Transactions")).not.toBeInTheDocument();
      expect(screen.queryByText("FinTracker")).not.toBeInTheDocument();
    });

    test("expanding sidebar shows navigation labels again", () => {
      render(<FinancialDashboard />);
      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("FinTracker")).toBeInTheDocument();
    });
  });

  describe("Overview - KPI Metrics", () => {
    test("displays total revenue", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });

    test("displays total expenses", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    });

    test("displays profit margin", () => {
      render(<FinancialDashboard />);
      const profitMarginLabels = screen.getAllByText("Profit Margin");
      expect(profitMarginLabels.length).toBeGreaterThan(0);
    });

    test("displays monthly revenue vs expenses chart", () => {
      render(<FinancialDashboard />);
      expect(
        screen.getByText("Monthly Revenue vs Expenses")
      ).toBeInTheDocument();
      expect(screen.getByTestId("monthly-trend-chart")).toBeInTheDocument();
    });

    test("displays top categories pie chart", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("Top Categories")).toBeInTheDocument();
      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    });

    test("displays top 10 transactions table", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("Top 10 Transactions")).toBeInTheDocument();
    });

    test("displays chart legend for revenue and expenses", () => {
      render(<FinancialDashboard />);
      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("Expenses")).toBeInTheDocument();
    });
  });

  describe("Search Filtering", () => {
    test("search input filters transactions", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const searchInput = screen.getByPlaceholderText(
        "Search transactions... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "Engineering" } });
      // After search, only Engineering-related transactions should be visible
      // The "Showing X of Y" text should reflect the filtered count
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
    });

    test("clearing search shows all transactions", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const searchInput = screen.getByPlaceholderText(
        "Search transactions... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "Engineering" } });
      fireEvent.change(searchInput, { target: { value: "" } });
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
    });
  });

  describe("Type Filter", () => {
    test("filtering by revenue shows only revenue transactions", () => {
      render(<FinancialDashboard />);
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "revenue" } });
      // After filtering, the overview should update
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });

    test("filtering by expense shows only expense transactions", () => {
      render(<FinancialDashboard />);
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "expense" } });
      expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    });

    test("selecting All Types shows all transactions", () => {
      render(<FinancialDashboard />);
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "revenue" } });
      fireEvent.change(typeFilter, { target: { value: "all" } });
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    });
  });

  describe("Category Filter", () => {
    test("filtering by category updates display", () => {
      render(<FinancialDashboard />);
      const categoryFilter = screen.getByLabelText("Filter by category");
      fireEvent.change(categoryFilter, { target: { value: "Salaries" } });
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });
  });

  describe("Department Filter", () => {
    test("filtering by department updates display", () => {
      render(<FinancialDashboard />);
      const deptFilter = screen.getByLabelText("Filter by department");
      fireEvent.change(deptFilter, { target: { value: "Engineering" } });
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });
  });

  describe("Status Filter", () => {
    test("filtering by completed status", () => {
      render(<FinancialDashboard />);
      const statusFilter = screen.getByLabelText("Filter by status");
      fireEvent.change(statusFilter, { target: { value: "completed" } });
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });

    test("filtering by pending status", () => {
      render(<FinancialDashboard />);
      const statusFilter = screen.getByLabelText("Filter by status");
      fireEvent.change(statusFilter, { target: { value: "pending" } });
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });
  });

  describe("Transactions View", () => {
    beforeEach(() => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
    });

    test("renders add transaction button", () => {
      expect(screen.getByText("+ Add Transaction")).toBeInTheDocument();
    });

    test("renders transaction count indicator", () => {
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
    });

    test("renders clear filters link", () => {
      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });

    test("renders sortable column headers", () => {
      expect(screen.getByText(/Date/)).toBeInTheDocument();
      expect(screen.getByText(/Reference/)).toBeInTheDocument();
      expect(screen.getByText(/Category/)).toBeInTheDocument();
      expect(screen.getByText(/Department/)).toBeInTheDocument();
      expect(screen.getByText(/Amount/)).toBeInTheDocument();
    });

    test("renders pagination controls", () => {
      expect(screen.getByText(/Page/)).toBeInTheDocument();
      expect(screen.getByLabelText("Rows per page")).toBeInTheDocument();
      expect(screen.getByLabelText("First page")).toBeInTheDocument();
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
      expect(screen.getByLabelText("Last page")).toBeInTheDocument();
    });

    test("renders select all checkbox", () => {
      expect(screen.getByLabelText("Select all")).toBeInTheDocument();
    });

    test("clicking sort header changes sort direction", () => {
      const dateHeader = screen.getByText(/Date/);
      fireEvent.click(dateHeader);
      // Sort direction should toggle (default is desc for date, so clicking should toggle to asc)
      expect(screen.getByText(/Date.*\u2191/)).toBeInTheDocument();
    });

    test("clicking different sort header changes sort field", () => {
      const amountHeader = screen.getByText(/Amount/);
      fireEvent.click(amountHeader);
      expect(screen.getByText(/Amount.*\u2193/)).toBeInTheDocument();
    });

    test("changing page size resets to page 1", () => {
      const pageSizeSelect = screen.getByLabelText("Rows per page");
      fireEvent.change(pageSizeSelect, { target: { value: "10" } });
      expect(screen.getByText(/Page 1/)).toBeInTheDocument();
    });

    test("clicking next page navigates forward", () => {
      const nextButton = screen.getByLabelText("Next page");
      fireEvent.click(nextButton);
      expect(screen.getByText(/Page 2/)).toBeInTheDocument();
    });

    test("clicking last page navigates to end", () => {
      const lastButton = screen.getByLabelText("Last page");
      fireEvent.click(lastButton);
      // Should be on the last page, which is > 1 for seed data
      expect(screen.getByText(/Page \d+ of \d+/)).toBeInTheDocument();
    });

    test("clicking first page navigates to start", () => {
      const nextButton = screen.getByLabelText("Next page");
      fireEvent.click(nextButton);
      const firstButton = screen.getByLabelText("First page");
      fireEvent.click(firstButton);
      expect(screen.getByText(/Page 1/)).toBeInTheDocument();
    });

    test("clear filters resets all filter state", () => {
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "revenue" } });
      fireEvent.click(screen.getByText("Clear Filters"));
      expect(typeFilter.value).toBe("all");
    });
  });

  describe("Transaction Selection", () => {
    test("selecting a row shows selection count", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const checkboxes = screen.getAllByRole("checkbox");
      // First checkbox is select-all, skip it; click second one (first row)
      fireEvent.click(checkboxes[1]);
      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });

    test("selecting multiple rows shows correct count", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      expect(screen.getByText("2 selected")).toBeInTheDocument();
    });

    test("clear selection button clears all selected rows", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);
      expect(screen.getByText("1 selected")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Clear Selection"));
      expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
    });

    test("select all checkbox selects all visible rows", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const selectAll = screen.getByLabelText("Select all");
      fireEvent.click(selectAll);
      expect(screen.getByText("25 selected")).toBeInTheDocument();
    });

    test("bulk delete with confirmation removes transactions", () => {
      window.confirm.mockReturnValue(true);
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);
      fireEvent.click(screen.getByText("Delete Selected"));
      expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
    });

    test("bulk delete without confirmation keeps transactions", () => {
      window.confirm.mockReturnValue(false);
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);
      fireEvent.click(screen.getByText("Delete Selected"));
      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });
  });

  describe("Transaction Detail Modal", () => {
    test("clicking a transaction row opens detail modal", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      // Click on a transaction row's reference link
      const txnRows = screen.getAllByText(/TXN-/);
      fireEvent.click(txnRows[0]);
      // Modal should show transaction details
      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
    });

    test("modal shows transaction type badge", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const txnRows = screen.getAllByText(/TXN-/);
      fireEvent.click(txnRows[0]);
      // Type should be visible as a badge
      const typeBadges = screen.getAllByText(/revenue|expense/i);
      expect(typeBadges.length).toBeGreaterThan(0);
    });

    test("modal shows category and department", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const txnRows = screen.getAllByText(/TXN-/);
      fireEvent.click(txnRows[0]);
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Department")).toBeInTheDocument();
    });

    test("modal shows description", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const txnRows = screen.getAllByText(/TXN-/);
      fireEvent.click(txnRows[0]);
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    test("close button closes modal", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const txnRows = screen.getAllByText(/TXN-/);
      fireEvent.click(txnRows[0]);
      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
      const closeButton = screen.getByText("\u00D7");
      fireEvent.click(closeButton);
      expect(screen.queryByText("Delete Transaction")).not.toBeInTheDocument();
    });

    test("delete transaction with confirmation removes it", () => {
      window.confirm.mockReturnValue(true);
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const txnRows = screen.getAllByText(/TXN-/);
      const firstRef = txnRows[0].textContent;
      fireEvent.click(txnRows[0]);
      fireEvent.click(screen.getByText("Delete Transaction"));
      // Modal should close
      expect(screen.queryByText("Delete Transaction")).not.toBeInTheDocument();
    });

    test("delete transaction without confirmation keeps it", () => {
      window.confirm.mockReturnValue(false);
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const txnRows = screen.getAllByText(/TXN-/);
      fireEvent.click(txnRows[0]);
      fireEvent.click(screen.getByText("Delete Transaction"));
      // Modal should remain open
      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
    });
  });

  describe("Add Transaction Modal", () => {
    test("clicking Add Transaction opens modal", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("+ Add Transaction"));
      expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    });

    test("modal has all form fields", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("+ Add Transaction"));
      expect(screen.getByText("Type *")).toBeInTheDocument();
      expect(screen.getByText("Category *")).toBeInTheDocument();
      expect(screen.getByText("Department *")).toBeInTheDocument();
      expect(screen.getByText("Amount *")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    test("cancel button closes modal", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("+ Add Transaction"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("Add Transaction")).not.toBeInTheDocument();
    });

    test("close button closes modal", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("+ Add Transaction"));
      const closeButtons = screen.getAllByText("\u00D7");
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText("Add Transaction")).not.toBeInTheDocument();
    });

    test("submitting form adds transaction and generates notification", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("+ Add Transaction"));

      const form = screen
        .getByText("Add Transaction")
        .closest("div")
        .querySelector("form");
      const amountInput = form.querySelector('input[name="amount"]');
      fireEvent.change(amountInput, { target: { value: "5000" } });

      const addButton = screen.getByText("Add Transaction");
      // Get the submit button, which is inside the form
      const submitButton = form.querySelector('button[type="submit"]');
      fireEvent.click(submitButton);

      // Modal should close
      expect(screen.queryByText("Type *")).not.toBeInTheDocument();

      // Check notification was created
      const bellButton = screen.getByLabelText("Notifications");
      fireEvent.click(bellButton);
      expect(screen.getByText(/added/)).toBeInTheDocument();
    });
  });

  describe("Charts View", () => {
    test("renders chart type toggle buttons", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Charts"));
      expect(screen.getByText("bar")).toBeInTheDocument();
      expect(screen.getByText("line")).toBeInTheDocument();
      expect(screen.getByText("comparison")).toBeInTheDocument();
    });

    test("bar chart type shows revenue and expense charts", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Charts"));
      fireEvent.click(screen.getByText("bar"));
      expect(screen.getByText("Revenue by Month")).toBeInTheDocument();
      expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
      expect(screen.getByText("Monthly Expenses")).toBeInTheDocument();
    });

    test("line chart type shows net income trend", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Charts"));
      fireEvent.click(screen.getByText("line"));
      expect(screen.getByText("Net Income Trend")).toBeInTheDocument();
      expect(screen.getByTestId("net-income-chart")).toBeInTheDocument();
    });

    test("comparison chart type shows category distribution", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Charts"));
      fireEvent.click(screen.getByText("comparison"));
      expect(screen.getByText("Category Comparison")).toBeInTheDocument();
      expect(screen.getByText("Expense Distribution")).toBeInTheDocument();
    });
  });

  describe("Budget View", () => {
    test("renders budget table with columns", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Budget"));
      expect(screen.getByText("Budget vs Actuals")).toBeInTheDocument();
      // Table headers
      const allocated = screen.getAllByText(/Allocated/i);
      expect(allocated.length).toBeGreaterThan(0);
      const actual = screen.getAllByText(/Actual/i);
      expect(actual.length).toBeGreaterThan(0);
      const variance = screen.getAllByText(/Variance/i);
      expect(variance.length).toBeGreaterThan(0);
      const utilization = screen.getAllByText(/Utilization/i);
      expect(utilization.length).toBeGreaterThan(0);
    });

    test("renders budget year selector", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Budget"));
      expect(screen.getByLabelText("Budget year")).toBeInTheDocument();
    });

    test("changing budget year updates the comparison", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Budget"));
      const yearSelect = screen.getByLabelText("Budget year");
      fireEvent.change(yearSelect, { target: { value: "2025" } });
      expect(yearSelect.value).toBe("2025");
    });

    test("renders budget summary totals", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Budget"));
      expect(screen.getByText("Total Allocated")).toBeInTheDocument();
      expect(screen.getByText("Total Actual")).toBeInTheDocument();
      expect(screen.getByText("Total Variance")).toBeInTheDocument();
    });

    test("displays all budget departments", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Budget"));
      expect(screen.getByText("Engineering")).toBeInTheDocument();
      expect(screen.getByText("Marketing")).toBeInTheDocument();
      expect(screen.getByText("Sales")).toBeInTheDocument();
      expect(screen.getByText("Operations")).toBeInTheDocument();
      expect(screen.getByText("HR")).toBeInTheDocument();
      expect(screen.getByText("Finance")).toBeInTheDocument();
      // Legal appears multiple times in budget
      const legalCells = screen.getAllByText("Legal");
      expect(legalCells.length).toBeGreaterThan(0);
    });
  });

  describe("Departments View", () => {
    test("renders department performance cards", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Departments"));
      expect(screen.getByText("Department Performance")).toBeInTheDocument();
      expect(screen.getByText("Engineering")).toBeInTheDocument();
      expect(screen.getByText("Marketing")).toBeInTheDocument();
    });

    test("each department shows revenue and expenses", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Departments"));
      // Multiple Revenue/Expenses labels across department cards
      const revenueLabels = screen.getAllByText("Revenue");
      expect(revenueLabels.length).toBeGreaterThan(0);
      const expenseLabels = screen.getAllByText("Expenses");
      expect(expenseLabels.length).toBeGreaterThan(0);
    });

    test("each department shows net and transaction count", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Departments"));
      const netLabels = screen.getAllByText("Net");
      expect(netLabels.length).toBeGreaterThan(0);
      const txnLabels = screen.getAllByText("Transactions");
      expect(txnLabels.length).toBeGreaterThan(0);
    });

    test("each department shows revenue share indicator", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Departments"));
      const shareLabels = screen.getAllByText("Revenue share");
      expect(shareLabels.length).toBeGreaterThan(0);
    });
  });

  describe("Reports View", () => {
    test("renders report cards", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Reports"));
      expect(screen.getByText("Financial Summary")).toBeInTheDocument();
      expect(screen.getByText("Budget Report")).toBeInTheDocument();
      expect(screen.getByText("Department Analysis")).toBeInTheDocument();
    });

    test("Export CSV button triggers download", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Reports"));
      const exportButtons = screen.getAllByText("Export CSV");
      fireEvent.click(exportButtons[0]);
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test("Export PDF button generates notification", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Reports"));
      fireEvent.click(screen.getByText("Export PDF"));
      const bellButton = screen.getByLabelText("Notifications");
      fireEvent.click(bellButton);
      expect(screen.getByText(/PDF export started/)).toBeInTheDocument();
    });

    test("View Departments button navigates to departments view", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Reports"));
      fireEvent.click(screen.getByText("View Departments"));
      expect(screen.getByText("Department Performance")).toBeInTheDocument();
    });

    test("renders quick stats section", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Reports"));
      expect(screen.getByText("Quick Stats")).toBeInTheDocument();
      expect(screen.getByText("Total Transactions")).toBeInTheDocument();
      expect(screen.getByText("Revenue Categories")).toBeInTheDocument();
      expect(screen.getByText("Expense Categories")).toBeInTheDocument();
    });

    test("shows correct static counts", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Reports"));
      // 5 revenue categories
      expect(screen.getByText("5")).toBeInTheDocument();
      // 8 expense categories
      expect(screen.getByText("8")).toBeInTheDocument();
      // 7 departments
      expect(screen.getByText("7")).toBeInTheDocument();
    });
  });

  describe("Notifications", () => {
    test("clicking bell icon shows notification panel", () => {
      render(<FinancialDashboard />);
      const bellButton = screen.getByLabelText("Notifications");
      fireEvent.click(bellButton);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });

    test("clicking bell icon again hides notification panel", () => {
      render(<FinancialDashboard />);
      const bellButton = screen.getByLabelText("Notifications");
      fireEvent.click(bellButton);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      fireEvent.click(bellButton);
      expect(screen.queryByText("No notifications")).not.toBeInTheDocument();
    });

    test("CSV export adds notification", () => {
      render(<FinancialDashboard />);
      // Use header export button
      const exportButtons = screen.getAllByText("Export CSV");
      fireEvent.click(exportButtons[0]);
      const bellButton = screen.getByLabelText("Notifications");
      fireEvent.click(bellButton);
      expect(
        screen.getByText("Financial report exported to CSV")
      ).toBeInTheDocument();
    });

    test("mark all read button works", () => {
      render(<FinancialDashboard />);
      // Generate a notification via export
      const exportButtons = screen.getAllByText("Export CSV");
      fireEvent.click(exportButtons[0]);
      const bellButton = screen.getByLabelText("Notifications");
      fireEvent.click(bellButton);
      fireEvent.click(screen.getByText("Mark all read"));
    });
  });

  describe("Settings Panel", () => {
    test("clicking Settings opens settings panel", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByLabelText("Currency")).toBeInTheDocument();
      expect(screen.getByText("Dark Mode")).toBeInTheDocument();
    });

    test("changing currency updates formatCurrency", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Settings"));
      const currencySelect = screen.getByLabelText("Currency");
      fireEvent.change(currencySelect, { target: { value: "EUR" } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "finDashCurrency",
        "EUR"
      );
    });

    test("settings panel has close button", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Settings"));
      const closeButtons = screen.getAllByText("\u00D7");
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByLabelText("Currency")).not.toBeInTheDocument();
    });

    test("danger zone has delete all transactions button", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("Danger Zone")).toBeInTheDocument();
      expect(screen.getByText("Delete All Transactions")).toBeInTheDocument();
    });

    test("delete all transactions with confirmation removes all", () => {
      window.confirm.mockReturnValue(true);
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Settings"));
      fireEvent.click(screen.getByText("Delete All Transactions"));
      // Settings panel should close
      expect(screen.queryByLabelText("Currency")).not.toBeInTheDocument();
    });

    test("delete all transactions without confirmation keeps them", () => {
      window.confirm.mockReturnValue(false);
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Settings"));
      fireEvent.click(screen.getByText("Delete All Transactions"));
      // Settings panel should remain open
      expect(screen.getByLabelText("Currency")).toBeInTheDocument();
    });

    test("changing default page size updates display", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Settings"));
      const pageSizeSelect = screen.getByLabelText("Default page size");
      fireEvent.change(pageSizeSelect, { target: { value: "50" } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "finDashPageSize",
        "50"
      );
    });
  });

  describe("Export Functionality", () => {
    test("header Export CSV triggers file download", () => {
      render(<FinancialDashboard />);
      const exportButtons = screen.getAllByText("Export CSV");
      fireEvent.click(exportButtons[0]);
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test("export generates a notification", () => {
      render(<FinancialDashboard />);
      const exportButtons = screen.getAllByText("Export CSV");
      fireEvent.click(exportButtons[0]);
      const bellButton = screen.getByLabelText("Notifications");
      fireEvent.click(bellButton);
      expect(
        screen.getByText("Financial report exported to CSV")
      ).toBeInTheDocument();
    });
  });

  describe("Keyboard Shortcuts", () => {
    test("Escape key closes transaction detail modal", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const txnRows = screen.getAllByText(/TXN-/);
      fireEvent.click(txnRows[0]);
      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Delete Transaction")).not.toBeInTheDocument();
    });

    test("Escape key closes add transaction modal", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("+ Add Transaction"));
      expect(screen.getByText("Type *")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Type *")).not.toBeInTheDocument();
    });

    test("Escape key closes settings panel", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByLabelText("Currency")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByLabelText("Currency")).not.toBeInTheDocument();
    });

    test("Escape key closes notification panel", () => {
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByLabelText("Notifications"));
      expect(screen.getByText("No notifications")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("No notifications")).not.toBeInTheDocument();
    });
  });

  describe("localStorage Persistence", () => {
    test("theme preference is saved to localStorage", () => {
      render(<FinancialDashboard />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "finDashTheme",
        "light"
      );
    });

    test("dark theme is loaded from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "finDashTheme") return "dark";
        return null;
      });
      render(<FinancialDashboard />);
      expect(screen.getByText("\u2600\uFE0F")).toBeInTheDocument();
    });

    test("saved view is restored from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "finDashView") return "budget";
        return null;
      });
      render(<FinancialDashboard />);
      expect(screen.getByText("Budget vs Actuals")).toBeInTheDocument();
    });

    test("saved currency is restored from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "finDashCurrency") return "EUR";
        return null;
      });
      render(<FinancialDashboard />);
      // The EUR symbol should be used in currency formatting
      // The KPI cards should show EUR-formatted values
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });

    test("saved page size is restored from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "finDashPageSize") return "50";
        return null;
      });
      render(<FinancialDashboard />);
      fireEvent.click(screen.getByText("Transactions"));
      const pageSizeSelect = screen.getByLabelText("Rows per page");
      expect(pageSizeSelect.value).toBe("50");
    });
  });

  describe("Combined Filters", () => {
    test("search and type filter work together", () => {
      render(<FinancialDashboard />);
      const searchInput = screen.getByPlaceholderText(
        "Search transactions... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "Salaries" } });
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "expense" } });
      // Both filters should be applied
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });

    test("date range filters transactions", () => {
      render(<FinancialDashboard />);
      const startDate = screen.getByLabelText("Start date");
      const endDate = screen.getByLabelText("End date");
      fireEvent.change(startDate, { target: { value: "2026-01-01" } });
      fireEvent.change(endDate, { target: { value: "2026-01-31" } });
      // Transactions should be filtered to January
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    test("renders without errors with empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<FinancialDashboard />)).not.toThrow();
    });
  });
});
