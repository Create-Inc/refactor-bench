import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ExpenseTracker from "./src/app/page.tsx";

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

// Mock URL.createObjectURL and revokeObjectURL for CSV export
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

describe("ExpenseTracker Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe("Initial Rendering", () => {
    test("renders sidebar with FinTrack title", () => {
      render(<ExpenseTracker />);
      expect(screen.getByText(/FinTrack/)).toBeInTheDocument();
    });

    test("renders sidebar navigation items", () => {
      render(<ExpenseTracker />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Transactions")).toBeInTheDocument();
      expect(screen.getByText("Budgets")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
      expect(screen.getByText("Accounts")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    test("renders search input in header", () => {
      render(<ExpenseTracker />);
      expect(
        screen.getByPlaceholderText("Search transactions... (Ctrl+K)")
      ).toBeInTheDocument();
    });

    test("renders category and type filter dropdowns", () => {
      render(<ExpenseTracker />);
      expect(screen.getByLabelText("Filter by category")).toBeInTheDocument();
      expect(screen.getByLabelText("Filter by type")).toBeInTheDocument();
    });

    test("renders Add Transaction button", () => {
      render(<ExpenseTracker />);
      expect(screen.getByText("+ Add Transaction")).toBeInTheDocument();
    });

    test("renders Export button", () => {
      render(<ExpenseTracker />);
      expect(screen.getByText(/Export/)).toBeInTheDocument();
    });

    test("renders theme toggle", () => {
      render(<ExpenseTracker />);
      expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    });

    test("shows dashboard view by default", () => {
      render(<ExpenseTracker />);
      expect(screen.getByText("Financial Overview")).toBeInTheDocument();
    });

    test("renders net worth in sidebar", () => {
      render(<ExpenseTracker />);
      // Net worth is displayed in sidebar
      expect(screen.getByText("Net Worth")).toBeInTheDocument();
    });
  });

  describe("Dashboard View", () => {
    test("renders summary stat cards", () => {
      render(<ExpenseTracker />);
      expect(screen.getByText("Total Income")).toBeInTheDocument();
      expect(screen.getByText("Total Expenses")).toBeInTheDocument();
      expect(screen.getByText("Net Balance")).toBeInTheDocument();
      expect(screen.getByText("Transactions")).toBeInTheDocument();
    });

    test("renders budget status section", () => {
      render(<ExpenseTracker />);
      expect(screen.getByText("Budget Status")).toBeInTheDocument();
    });

    test("renders recent transactions section", () => {
      render(<ExpenseTracker />);
      expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
    });

    test("shows budget categories with icons", () => {
      render(<ExpenseTracker />);
      // Budget status shows category names
      expect(screen.getByText("Food & Dining")).toBeInTheDocument();
      expect(screen.getByText("Transport")).toBeInTheDocument();
    });

    test("clicking a recent transaction opens detail modal", () => {
      render(<ExpenseTracker />);
      // Click on a recent transaction from the dashboard
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      // Modal should show the transaction details
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Payment Method")).toBeInTheDocument();
    });
  });

  describe("Sidebar Navigation", () => {
    test("clicking Transactions shows transactions view", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      // Transactions view has sort controls
      expect(screen.getByText("Sort by:")).toBeInTheDocument();
    });

    test("clicking Budgets shows budgets view", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Budgets"));
      expect(screen.getByText("+ New Budget")).toBeInTheDocument();
    });

    test("clicking Analytics shows analytics view", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Analytics"));
      expect(screen.getByText("Monthly Trend")).toBeInTheDocument();
    });

    test("clicking Accounts shows accounts view", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Accounts"));
      expect(screen.getByText("Main Checking")).toBeInTheDocument();
      expect(screen.getByText("Savings")).toBeInTheDocument();
    });

    test("clicking Settings shows settings view", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("Display")).toBeInTheDocument();
      expect(screen.getByText("Currency Symbol")).toBeInTheDocument();
    });

    test("saves active view to localStorage on navigation", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerView",
        "transactions"
      );
    });
  });

  describe("Sidebar Collapse/Expand", () => {
    test("renders toggle sidebar button", () => {
      render(<ExpenseTracker />);
      expect(screen.getByLabelText("Toggle sidebar")).toBeInTheDocument();
    });

    test("collapsing sidebar hides navigation labels", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByLabelText("Toggle sidebar"));
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Transactions")).not.toBeInTheDocument();
    });

    test("expanding sidebar shows navigation labels again", () => {
      render(<ExpenseTracker />);
      const toggle = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  describe("Theme Toggling", () => {
    test("clicking theme toggle switches dark mode", () => {
      render(<ExpenseTracker />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      // In dark mode, sun emoji is shown
      expect(screen.getByText("☀️")).toBeInTheDocument();
    });

    test("toggling theme twice returns to light mode", () => {
      render(<ExpenseTracker />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(screen.getByText("🌙")).toBeInTheDocument();
    });

    test("theme preference persists to localStorage", () => {
      render(<ExpenseTracker />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerSettings",
        expect.stringContaining('"darkMode":true')
      );
    });
  });

  describe("Search Filtering", () => {
    test("search input filters transactions by description", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const searchInput = screen.getByPlaceholderText(
        "Search transactions... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "grocery" } });
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
      expect(screen.queryByText("Concert tickets")).not.toBeInTheDocument();
    });

    test("search input filters by tags", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const searchInput = screen.getByPlaceholderText(
        "Search transactions... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "freelance" } });
      expect(screen.getByText("Freelance design project")).toBeInTheDocument();
    });

    test("clearing search shows all transactions", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const searchInput = screen.getByPlaceholderText(
        "Search transactions... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "grocery" } });
      fireEvent.change(searchInput, { target: { value: "" } });
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
      expect(screen.getByText("Concert tickets")).toBeInTheDocument();
    });
  });

  describe("Category Filter", () => {
    test("filtering by food category shows only food transactions", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const categoryFilter = screen.getByLabelText("Filter by category");
      fireEvent.change(categoryFilter, { target: { value: "food" } });
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Dinner at Italian restaurant")
      ).toBeInTheDocument();
      expect(screen.queryByText("Concert tickets")).not.toBeInTheDocument();
    });

    test("selecting All Categories shows all transactions", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const categoryFilter = screen.getByLabelText("Filter by category");
      fireEvent.change(categoryFilter, { target: { value: "food" } });
      fireEvent.change(categoryFilter, { target: { value: "all" } });
      expect(screen.getByText("Concert tickets")).toBeInTheDocument();
    });
  });

  describe("Type Filter", () => {
    test("filtering by income shows only income transactions", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "income" } });
      expect(screen.getByText("Monthly salary")).toBeInTheDocument();
      expect(screen.getByText("Freelance design project")).toBeInTheDocument();
      expect(
        screen.queryByText("Grocery shopping at Whole Foods")
      ).not.toBeInTheDocument();
    });

    test("filtering by expense shows only expense transactions", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "expense" } });
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
      expect(screen.queryByText("Monthly salary")).not.toBeInTheDocument();
    });
  });

  describe("Transactions View", () => {
    beforeEach(() => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
    });

    test("renders sort controls", () => {
      expect(screen.getByText("Sort by:")).toBeInTheDocument();
      expect(screen.getByText(/Date/)).toBeInTheDocument();
      expect(screen.getByText(/Amount/)).toBeInTheDocument();
    });

    test("renders transaction table with headers", () => {
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Account")).toBeInTheDocument();
      expect(screen.getByText("Method")).toBeInTheDocument();
    });

    test("renders transaction rows", () => {
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
      expect(screen.getByText("Monthly salary")).toBeInTheDocument();
      expect(screen.getByText("Concert tickets")).toBeInTheDocument();
    });

    test("clicking sort button toggles direction", () => {
      const dateButton = screen.getByText(/Date/);
      fireEvent.click(dateButton);
      expect(screen.getByText(/Date.*↑/)).toBeInTheDocument();
    });

    test("clicking different sort field changes sorting", () => {
      const amountButton = screen.getByText(/Amount/);
      fireEvent.click(amountButton);
      expect(screen.getByText(/Amount.*↓/)).toBeInTheDocument();
    });

    test("renders payment method filter", () => {
      expect(
        screen.getByLabelText("Filter by payment method")
      ).toBeInTheDocument();
    });

    test("renders account filter", () => {
      expect(screen.getByLabelText("Filter by account")).toBeInTheDocument();
    });

    test("payment method filter works", () => {
      const methodFilter = screen.getByLabelText("Filter by payment method");
      fireEvent.change(methodFilter, { target: { value: "cash" } });
      expect(
        screen.getByText("Dinner at Italian restaurant")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Grocery shopping at Whole Foods")
      ).not.toBeInTheDocument();
    });

    test("account filter works", () => {
      const accountFilter = screen.getByLabelText("Filter by account");
      fireEvent.change(accountFilter, { target: { value: "acc3" } });
      // Only credit card transactions
      expect(screen.getByText("Netflix monthly")).toBeInTheDocument();
      expect(
        screen.queryByText("Grocery shopping at Whole Foods")
      ).not.toBeInTheDocument();
    });

    test("clear filters button appears when filters are active", () => {
      const methodFilter = screen.getByLabelText("Filter by payment method");
      fireEvent.change(methodFilter, { target: { value: "cash" } });
      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });

    test("clear filters button resets all filters", () => {
      const methodFilter = screen.getByLabelText("Filter by payment method");
      fireEvent.change(methodFilter, { target: { value: "cash" } });
      fireEvent.click(screen.getByText("Clear Filters"));
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Dinner at Italian restaurant")
      ).toBeInTheDocument();
    });

    test("clicking a transaction row opens detail modal", () => {
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      // Modal should show full details
      expect(screen.getByText("Debit Card")).toBeInTheDocument();
      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
    });

    test("empty state shows when no transactions match filters", () => {
      const searchInput = screen.getByPlaceholderText(
        "Search transactions... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
      expect(
        screen.getByText("No transactions match your filters.")
      ).toBeInTheDocument();
    });
  });

  describe("Transaction Detail Modal", () => {
    test("modal displays transaction description and amount", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
    });

    test("modal shows category label", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      expect(screen.getByText("Food & Dining")).toBeInTheDocument();
    });

    test("modal shows tags", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      expect(screen.getByText("#groceries")).toBeInTheDocument();
      expect(screen.getByText("#weekly")).toBeInTheDocument();
    });

    test("modal shows notes when present", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      expect(screen.getByText("Weekly meal prep supplies")).toBeInTheDocument();
    });

    test("modal shows recurring badge for recurring transactions", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Electric bill - March"));
      expect(screen.getByText(/Recurring: monthly/)).toBeInTheDocument();
    });

    test("close button closes modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
      fireEvent.click(screen.getByText("×"));
      expect(screen.queryByText("Delete Transaction")).not.toBeInTheDocument();
    });

    test("deleting transaction with confirmation removes it", () => {
      window.confirm.mockReturnValue(true);
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      fireEvent.click(screen.getByText("Delete Transaction"));
      expect(
        screen.queryByText("Grocery shopping at Whole Foods")
      ).not.toBeInTheDocument();
    });

    test("canceling delete keeps transaction", () => {
      window.confirm.mockReturnValue(false);
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      fireEvent.click(screen.getByText("Delete Transaction"));
      fireEvent.click(screen.getByText("×"));
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
    });
  });

  describe("Add Transaction Modal", () => {
    test("clicking Add Transaction opens modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("+ Add Transaction"));
      expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    });

    test("modal has all required form fields", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("+ Add Transaction"));
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Description *")).toBeInTheDocument();
      expect(screen.getByText("Amount *")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Payment Method")).toBeInTheDocument();
    });

    test("cancel button closes add modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("+ Add Transaction"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("Add Transaction")).not.toBeInTheDocument();
    });

    test("submitting form creates new transaction", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("+ Add Transaction"));

      const form = screen
        .getByText("Add Transaction")
        .closest("div")
        .querySelector("form");
      const descField = form.querySelector('input[name="description"]');
      fireEvent.change(descField, { target: { value: "New test expense" } });
      const amountField = form.querySelector('input[name="amount"]');
      fireEvent.change(amountField, { target: { value: "99.99" } });

      fireEvent.click(
        screen.getByText("Add Transaction", {
          selector: 'button[type="submit"]',
        })
      );

      // Modal should close
      expect(screen.queryByText("Description *")).not.toBeInTheDocument();
      // Navigate to transactions to see the new entry
      fireEvent.click(screen.getByText("Transactions"));
      expect(screen.getByText("New test expense")).toBeInTheDocument();
    });

    test("close button closes add modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("+ Add Transaction"));
      const closeButtons = screen.getAllByText("×");
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText("Description *")).not.toBeInTheDocument();
    });
  });

  describe("Budgets View", () => {
    beforeEach(() => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Budgets"));
    });

    test("renders budget cards", () => {
      expect(screen.getByText("Food & Dining")).toBeInTheDocument();
      expect(screen.getByText("Transport")).toBeInTheDocument();
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
    });

    test("budget cards show spent and limit", () => {
      const spentLabels = screen.getAllByText(/spent/);
      expect(spentLabels.length).toBeGreaterThan(0);
      const limitLabels = screen.getAllByText(/limit/);
      expect(limitLabels.length).toBeGreaterThan(0);
    });

    test("budget cards show percentage used", () => {
      const usedLabels = screen.getAllByText(/% used/);
      expect(usedLabels.length).toBeGreaterThan(0);
    });

    test("clicking New Budget opens budget modal", () => {
      fireEvent.click(screen.getByText("+ New Budget"));
      expect(screen.getByText("New Budget")).toBeInTheDocument();
    });

    test("clicking edit on budget opens edit modal", () => {
      const editButtons = screen.getAllByLabelText(/Edit .* budget/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText("Edit Budget")).toBeInTheDocument();
    });

    test("deleting budget with confirmation removes it", () => {
      window.confirm.mockReturnValue(true);
      const deleteButtons = screen.getAllByLabelText(/Delete .* budget/);
      const initialCount = deleteButtons.length;
      fireEvent.click(deleteButtons[0]);
      const remaining = screen.queryAllByLabelText(/Delete .* budget/);
      expect(remaining.length).toBe(initialCount - 1);
    });

    test("canceling budget delete keeps budget", () => {
      window.confirm.mockReturnValue(false);
      const deleteButtons = screen.getAllByLabelText(/Delete .* budget/);
      const initialCount = deleteButtons.length;
      fireEvent.click(deleteButtons[0]);
      const remaining = screen.getAllByLabelText(/Delete .* budget/);
      expect(remaining.length).toBe(initialCount);
    });
  });

  describe("Budget Modal", () => {
    test("creating a new budget via form", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Budgets"));
      fireEvent.click(screen.getByText("+ New Budget"));

      const form = screen
        .getByText("New Budget")
        .closest("div")
        .querySelector("form");
      const limitField = form.querySelector('input[name="limit"]');
      fireEvent.change(limitField, { target: { value: "500" } });

      fireEvent.click(screen.getByText("Create"));
      // Modal closes
      expect(screen.queryByText("New Budget")).not.toBeInTheDocument();
    });

    test("cancel button closes budget modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Budgets"));
      fireEvent.click(screen.getByText("+ New Budget"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("New Budget")).not.toBeInTheDocument();
    });
  });

  describe("Analytics View", () => {
    beforeEach(() => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Analytics"));
    });

    test("renders monthly trend section", () => {
      expect(screen.getByText("Monthly Trend")).toBeInTheDocument();
    });

    test("renders spending by category section", () => {
      expect(screen.getByText("Spending by Category")).toBeInTheDocument();
    });

    test("renders recurring expenses section", () => {
      expect(screen.getByText("Recurring Expenses")).toBeInTheDocument();
    });

    test("shows category breakdown with amounts", () => {
      // Categories with expenses should appear
      const foodLabels = screen.getAllByText("Food & Dining");
      expect(foodLabels.length).toBeGreaterThan(0);
    });

    test("shows recurring transactions", () => {
      expect(screen.getByText("Electric bill - March")).toBeInTheDocument();
      expect(screen.getByText("Netflix monthly")).toBeInTheDocument();
    });
  });

  describe("Accounts View", () => {
    beforeEach(() => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Accounts"));
    });

    test("renders all account cards", () => {
      expect(screen.getByText("Main Checking")).toBeInTheDocument();
      expect(screen.getByText("Savings")).toBeInTheDocument();
      expect(screen.getByText("Credit Card")).toBeInTheDocument();
      expect(screen.getByText("Cash Wallet")).toBeInTheDocument();
      expect(screen.getByText("Investment")).toBeInTheDocument();
    });

    test("shows account types", () => {
      const checkingLabels = screen.getAllByText(/checking/i);
      expect(checkingLabels.length).toBeGreaterThan(0);
    });

    test("shows recent activity per account", () => {
      const recentLabels = screen.getAllByText("Recent Activity");
      expect(recentLabels.length).toBeGreaterThan(0);
    });

    test("shows total transaction count per account", () => {
      const txCountLabels = screen.getAllByText(/total transactions/);
      expect(txCountLabels.length).toBeGreaterThan(0);
    });

    test("renders Transfer button", () => {
      expect(screen.getByText(/Transfer/)).toBeInTheDocument();
    });

    test("clicking Transfer opens transfer modal", () => {
      fireEvent.click(screen.getByText(/Transfer/));
      expect(screen.getByText("Transfer Between Accounts")).toBeInTheDocument();
    });
  });

  describe("Transfer Modal", () => {
    test("transfer modal has from/to/amount fields", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Accounts"));
      fireEvent.click(screen.getByText(/Transfer/));
      expect(screen.getByText("From Account")).toBeInTheDocument();
      expect(screen.getByText("To Account")).toBeInTheDocument();
    });

    test("cancel closes transfer modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Accounts"));
      fireEvent.click(screen.getByText(/Transfer/));
      fireEvent.click(screen.getByText("Cancel"));
      expect(
        screen.queryByText("Transfer Between Accounts")
      ).not.toBeInTheDocument();
    });

    test("submitting transfer closes modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Accounts"));
      fireEvent.click(screen.getByText(/Transfer/));

      const form = screen
        .getByText("Transfer Between Accounts")
        .closest("div")
        .querySelector("form");
      const amountField = form.querySelector('input[name="amount"]');
      fireEvent.change(amountField, { target: { value: "100" } });

      fireEvent.click(
        screen.getByText("Transfer", { selector: 'button[type="submit"]' })
      );
      expect(
        screen.queryByText("Transfer Between Accounts")
      ).not.toBeInTheDocument();
    });
  });

  describe("Settings View", () => {
    beforeEach(() => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Settings"));
    });

    test("renders display settings section", () => {
      expect(screen.getByText("Display")).toBeInTheDocument();
      expect(screen.getByText("Currency Symbol")).toBeInTheDocument();
      expect(screen.getByText("Date Format")).toBeInTheDocument();
    });

    test("changing currency symbol updates settings", () => {
      const currencyInput = screen.getByDisplayValue("$");
      fireEvent.change(currencyInput, { target: { value: "€" } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerSettings",
        expect.stringContaining('"currencySymbol":"€"')
      );
    });

    test("changing date format updates settings", () => {
      const dateFormatSelect = screen.getByLabelText("Date format");
      fireEvent.change(dateFormatSelect, { target: { value: "DD/MM/YYYY" } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerSettings",
        expect.stringContaining('"dateFormat":"DD/MM/YYYY"')
      );
    });

    test("toggle show cents works", () => {
      const toggle = screen.getByLabelText("Toggle show cents");
      fireEvent.click(toggle);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerSettings",
        expect.stringContaining('"showCents":false')
      );
    });

    test("toggle dark mode via settings works", () => {
      const toggle = screen.getByLabelText("Toggle dark mode");
      fireEvent.click(toggle);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerSettings",
        expect.stringContaining('"darkMode":true')
      );
    });

    test("toggle compact view works", () => {
      const toggle = screen.getByLabelText("Toggle compact view");
      fireEvent.click(toggle);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerSettings",
        expect.stringContaining('"compactView":true')
      );
    });

    test("renders danger zone", () => {
      expect(screen.getByText("Danger Zone")).toBeInTheDocument();
      expect(screen.getByText("Delete All Transactions")).toBeInTheDocument();
      expect(screen.getByText("Reset Settings")).toBeInTheDocument();
    });

    test("delete all transactions with confirmation clears data", () => {
      window.confirm.mockReturnValue(true);
      fireEvent.click(screen.getByText("Delete All Transactions"));
      // Navigate to transactions to verify
      fireEvent.click(screen.getByText("Transactions"));
      expect(
        screen.getByText("No transactions match your filters.")
      ).toBeInTheDocument();
    });

    test("delete all transactions without confirmation keeps data", () => {
      window.confirm.mockReturnValue(false);
      fireEvent.click(screen.getByText("Delete All Transactions"));
      fireEvent.click(screen.getByText("Transactions"));
      expect(
        screen.getByText("Grocery shopping at Whole Foods")
      ).toBeInTheDocument();
    });

    test("reset settings with confirmation restores defaults", () => {
      // First change a setting
      const currencyInput = screen.getByDisplayValue("$");
      fireEvent.change(currencyInput, { target: { value: "€" } });
      // Then reset
      window.confirm.mockReturnValue(true);
      fireEvent.click(screen.getByText("Reset Settings"));
      expect(screen.getByDisplayValue("$")).toBeInTheDocument();
    });

    test("export button in data section works", () => {
      fireEvent.click(screen.getByText("📥 Export All Transactions"));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe("Export CSV", () => {
    test("clicking Export triggers CSV download", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText(/Export/));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe("Keyboard Shortcuts", () => {
    test("Escape closes transaction detail modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Grocery shopping at Whole Foods"));
      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Delete Transaction")).not.toBeInTheDocument();
    });

    test("Escape closes add transaction modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("+ Add Transaction"));
      expect(screen.getByText("Add Transaction")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Description *")).not.toBeInTheDocument();
    });

    test("Escape closes budget modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Budgets"));
      fireEvent.click(screen.getByText("+ New Budget"));
      expect(screen.getByText("New Budget")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("New Budget")).not.toBeInTheDocument();
    });

    test("Escape closes transfer modal", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Accounts"));
      fireEvent.click(screen.getByText(/Transfer/));
      expect(screen.getByText("Transfer Between Accounts")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByText("Transfer Between Accounts")
      ).not.toBeInTheDocument();
    });
  });

  describe("localStorage Persistence", () => {
    test("transactions are saved to localStorage", () => {
      render(<ExpenseTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerTransactions",
        expect.any(String)
      );
    });

    test("budgets are saved to localStorage", () => {
      render(<ExpenseTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerBudgets",
        expect.any(String)
      );
    });

    test("accounts are saved to localStorage", () => {
      render(<ExpenseTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerAccounts",
        expect.any(String)
      );
    });

    test("settings are saved to localStorage", () => {
      render(<ExpenseTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "expenseTrackerSettings",
        expect.any(String)
      );
    });

    test("saved view is restored from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "expenseTrackerView") return "analytics";
        return null;
      });
      render(<ExpenseTracker />);
      expect(screen.getByText("Monthly Trend")).toBeInTheDocument();
    });

    test("saved settings are loaded from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "expenseTrackerSettings")
          return JSON.stringify({
            ...JSON.parse(
              '{"currency":"USD","currencySymbol":"€","dateFormat":"DD/MM/YYYY","weekStartsOn":"sunday","showCents":true,"enableNotifications":true,"darkMode":true,"compactView":false}'
            ),
          });
        return null;
      });
      render(<ExpenseTracker />);
      // Dark mode should be active - sun emoji visible
      expect(screen.getByText("☀️")).toBeInTheDocument();
    });

    test("handles corrupted localStorage gracefully", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "expenseTrackerTransactions") return "not valid json{{{";
        return null;
      });
      expect(() => render(<ExpenseTracker />)).not.toThrow();
    });
  });

  describe("Combined Filters", () => {
    test("search and category filter work together", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const searchInput = screen.getByPlaceholderText(
        "Search transactions... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "bill" } });
      const categoryFilter = screen.getByLabelText("Filter by category");
      fireEvent.change(categoryFilter, { target: { value: "utilities" } });
      expect(screen.getByText("Electric bill - March")).toBeInTheDocument();
      expect(screen.getByText("Internet bill")).toBeInTheDocument();
    });

    test("type and category filter work together", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "expense" } });
      const categoryFilter = screen.getByLabelText("Filter by category");
      fireEvent.change(categoryFilter, { target: { value: "subscriptions" } });
      expect(screen.getByText("Netflix monthly")).toBeInTheDocument();
      expect(screen.getByText("Spotify Premium")).toBeInTheDocument();
      expect(screen.queryByText("Monthly salary")).not.toBeInTheDocument();
    });

    test("non-matching combined filters show empty state", () => {
      render(<ExpenseTracker />);
      fireEvent.click(screen.getByText("Transactions"));
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "income" } });
      const categoryFilter = screen.getByLabelText("Filter by category");
      fireEvent.change(categoryFilter, { target: { value: "food" } });
      // No income transactions in food category
      expect(
        screen.getByText("No transactions match your filters.")
      ).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    test("renders without errors with empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<ExpenseTracker />)).not.toThrow();
    });

    test("handles corrupted budgets localStorage gracefully", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "expenseTrackerBudgets") return "{bad json}";
        return null;
      });
      expect(() => render(<ExpenseTracker />)).not.toThrow();
    });

    test("handles corrupted accounts localStorage gracefully", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "expenseTrackerAccounts") return "{bad json}";
        return null;
      });
      expect(() => render(<ExpenseTracker />)).not.toThrow();
    });
  });
});
