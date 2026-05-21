import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { DepartmentsTab } from "./src/app/DepartmentsTab.jsx";

vi.mock("lucide-react", () => ({
  Plus: (props) => <svg data-testid="plus-icon" {...props} />,
}));

vi.mock("./src/app/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

global.fetch = vi.fn();

const mockDepartments = [
  {
    id: 1,
    code: "ENG",
    name: "Engineering",
    parent_code: "",
    manager_name: "Jane Smith",
    manager_email: "jane@company.com",
    budget_owner: "Finance Ops",
    description: "Software engineering organization",
    employee_count: 42,
    permissions: {
      approve_budget: true,
      invite_members: true,
      publish_reports: false,
    },
    is_active: true,
  },
  {
    id: 2,
    code: "ENG-PLAT",
    name: "Platform Engineering",
    parent_code: "ENG",
    manager_name: "Alice Chen",
    manager_email: "alice@company.com",
    budget_owner: "Infrastructure Finance",
    description: "Core platform services",
    employee_count: 15,
    permissions: {
      approve_budget: false,
      invite_members: true,
      publish_reports: true,
    },
    is_active: true,
  },
  {
    id: 3,
    code: "MKT",
    name: "Marketing",
    parent_code: "",
    manager_name: "",
    manager_email: "",
    budget_owner: "",
    description: "",
    employee_count: 8,
    permissions: {},
    is_active: false,
  },
];

describe("DepartmentsTab Component", () => {
  let onRefresh;
  let setSaveMessage;
  let setError;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    onRefresh = vi.fn();
    setSaveMessage = vi.fn();
    setError = vi.fn();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderComponent(props = {}) {
    return render(
      <DepartmentsTab
        departments={mockDepartments}
        loading={false}
        onRefresh={onRefresh}
        setSaveMessage={setSaveMessage}
        setError={setError}
        {...props}
      />,
    );
  }

  describe("Hierarchy overview", () => {
    test("renders the heading and hierarchy description", () => {
      renderComponent();

      expect(screen.getByText("Departments")).toBeInTheDocument();
      expect(
        screen.getByText("Manage reporting hierarchy, owners, and delegated permissions"),
      ).toBeInTheDocument();
    });

    test("summarizes active departments, managed teams, and total members", () => {
      renderComponent();

      expect(screen.getByText("Active Departments")).toBeInTheDocument();
      expect(screen.getByText("Covered Teams")).toBeInTheDocument();
      expect(screen.getByText("Total Members")).toBeInTheDocument();
      expect(screen.getByText("65")).toBeInTheDocument();
    });

    test("renders only top-level departments until a parent is expanded", () => {
      renderComponent();

      expect(screen.getByText("ENG")).toBeInTheDocument();
      expect(screen.getByText("Marketing")).toBeInTheDocument();
      expect(screen.queryByText("Platform Engineering")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Expand Engineering" }));

      expect(screen.getByText("Platform Engineering")).toBeInTheDocument();
      expect(screen.getByTestId("department-row-ENG-PLAT")).toBeInTheDocument();
    });

    test("collapses an expanded department branch", () => {
      renderComponent();

      fireEvent.click(screen.getByRole("button", { name: "Expand Engineering" }));
      expect(screen.getByText("Platform Engineering")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Collapse Engineering" }));
      expect(screen.queryByText("Platform Engineering")).not.toBeInTheDocument();
    });

    test("shows manager, budget owner, permission labels, and team size", () => {
      renderComponent();

      const engineeringRow = screen.getByTestId("department-row-ENG");

      expect(within(engineeringRow).getByText("Jane Smith")).toBeInTheDocument();
      expect(within(engineeringRow).getByText("jane@company.com")).toBeInTheDocument();
      expect(within(engineeringRow).getByText("Budget owner: Finance Ops")).toBeInTheDocument();
      expect(
        within(engineeringRow).getByText("Approve budget, Invite members"),
      ).toBeInTheDocument();
      expect(within(engineeringRow).getByText("42 members")).toBeInTheDocument();
      expect(within(engineeringRow).getByText("1 child department")).toBeInTheDocument();
    });

    test("shows fallbacks for inactive departments without manager or permissions", () => {
      renderComponent();

      const marketingRow = screen.getByTestId("department-row-MKT");

      expect(within(marketingRow).getByText("Inactive")).toBeInTheDocument();
      expect(within(marketingRow).getByText("No manager assigned")).toBeInTheDocument();
      expect(within(marketingRow).getByText("No elevated permissions")).toBeInTheDocument();
    });

    test("shows loading spinner instead of department hierarchy when loading", () => {
      renderComponent({ loading: true });

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.queryByText("Active Departments")).not.toBeInTheDocument();
    });
  });

  describe("Add Modal", () => {
    test("opens add modal when clicking Add Department button", () => {
      renderComponent();

      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));

      expect(screen.getByRole("heading", { name: "Add Department" })).toBeInTheDocument();
    });

    test("modal contains hierarchy, owner, manager, and permission fields", () => {
      renderComponent();

      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));

      expect(screen.getByText("Code *")).toBeInTheDocument();
      expect(screen.getByText("Name *")).toBeInTheDocument();
      expect(screen.getByText("Parent Department")).toBeInTheDocument();
      expect(screen.getByText("Budget Owner")).toBeInTheDocument();
      expect(screen.getByText("Delegated Permissions")).toBeInTheDocument();
      expect(screen.getByLabelText("Approve budget")).toBeInTheDocument();
      expect(screen.getByLabelText("Invite members")).toBeInTheDocument();
      expect(screen.getByLabelText("Publish reports")).toBeInTheDocument();
    });

    test("closes modal when Cancel is clicked", () => {
      renderComponent();

      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByRole("heading", { name: "Add Department" })).not.toBeInTheDocument();
    });

    test("closes modal when clicking the backdrop overlay", () => {
      renderComponent();

      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));
      fireEvent.click(document.querySelector(".fixed.inset-0.bg-black"));

      expect(screen.queryByRole("heading", { name: "Add Department" })).not.toBeInTheDocument();
    });

    test("submits form data with parent department and permission bundle", async () => {
      renderComponent();

      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));
      fireEvent.change(screen.getByPlaceholderText("e.g., ENG-PLAT"), {
        target: { value: "ENG-DATA" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., Platform Engineering"), {
        target: { value: "Data Platform" },
      });
      fireEvent.change(screen.getByLabelText("Parent Department"), {
        target: { value: "ENG" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., Finance Ops"), {
        target: { value: "Analytics Finance" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., Jane Smith"), {
        target: { value: "Priya Rao" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g., jane@company.com"), {
        target: { value: "priya@company.com" },
      });
      fireEvent.click(screen.getByLabelText("Approve budget"));
      fireEvent.click(screen.getByLabelText("Publish reports"));

      const buttons = screen.getAllByRole("button", {
        name: /Add Department/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/departments",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: expect.any(String),
          }),
        );
      });

      const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(requestBody).toEqual(
        expect.objectContaining({
          code: "ENG-DATA",
          name: "Data Platform",
          parent_code: "ENG",
          budget_owner: "Analytics Finance",
          manager_name: "Priya Rao",
          manager_email: "priya@company.com",
          permissions: {
            approve_budget: true,
            invite_members: false,
            publish_reports: true,
          },
        }),
      );

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled();
        expect(setSaveMessage).toHaveBeenCalledWith("Department added successfully!");
      });
    });

    test("sets error from API response when add fails", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Duplicate department code" }),
      });

      renderComponent();
      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));
      fireEvent.change(screen.getByPlaceholderText("e.g., ENG-PLAT"), {
        target: { value: "DUP" },
      });

      const buttons = screen.getAllByRole("button", {
        name: /Add Department/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(setError).toHaveBeenCalledWith("Duplicate department code");
      });
    });

    test("sets fallback error when API returns no error field", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      renderComponent();
      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));

      const buttons = screen.getAllByRole("button", {
        name: /Add Department/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(setError).toHaveBeenCalledWith("Failed to add department");
      });
    });

    test("sets error when fetch throws a network error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      renderComponent();
      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));

      const buttons = screen.getAllByRole("button", {
        name: /Add Department/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(setError).toHaveBeenCalledWith("Failed to add department");
      });
    });

    test("clears save message after 3 second timeout and closes modal", async () => {
      renderComponent();

      fireEvent.click(screen.getByRole("button", { name: /Add Department/i }));
      fireEvent.change(screen.getByPlaceholderText("e.g., ENG-PLAT"), {
        target: { value: "RST" },
      });

      const buttons = screen.getAllByRole("button", {
        name: /Add Department/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled();
      });

      expect(screen.queryByRole("heading", { name: "Add Department" })).not.toBeInTheDocument();

      vi.advanceTimersByTime(3000);
      expect(setSaveMessage).toHaveBeenCalledWith("");
    });
  });
});
