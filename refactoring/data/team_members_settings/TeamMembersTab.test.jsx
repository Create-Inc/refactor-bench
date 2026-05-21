import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TeamMembersTab } from "./src/app/TeamMembersTab.jsx";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("lucide-react", () => {
  const icon = (name) => {
    const C = (props) => <span data-testid={`icon-${name}`} {...props} />;
    C.displayName = name;
    return C;
  };
  return { Plus: icon("Plus") };
});

vi.mock("./src/app/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

global.fetch = vi.fn();
global.confirm = vi.fn(() => true);

const mockUsers = [
  {
    id: "u1",
    name: "Alice Admin",
    email: "alice@co.com",
    role: "admin",
    status: "active",
    department_access: ["ENG", "SALES"],
    account_code_access: ["AC001", "AC002", "AC003", "AC004"],
  },
  {
    id: "u2",
    name: "Bob Viewer",
    email: "bob@co.com",
    role: "viewer",
    status: "active",
    department_access: [],
    account_code_access: [],
  },
];

const mockDepartments = [
  { id: "d1", code: "ENG", name: "Engineering", is_active: true },
  { id: "d2", code: "SALES", name: "Sales", is_active: true },
  { id: "d3", code: "HR", name: "Human Resources", is_active: true },
];

const mockAccountCodes = [
  { id: "a1", code: "AC001", name: "General Expenses", is_active: true },
  { id: "a2", code: "AC002", name: "Travel", is_active: true },
  { id: "a3", code: "AC005", name: "Marketing", is_active: true },
];

const defaultProps = () => ({
  users: mockUsers,
  departments: mockDepartments,
  accountCodes: mockAccountCodes,
  loading: false,
  onRefresh: vi.fn(),
  setSaveMessage: vi.fn(),
  setError: vi.fn(),
});

describe("TeamMembersTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  /* ---- Rendering ------------------------------------------------- */

  test("renders the heading and description", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    expect(screen.getByText("Team Members")).toBeInTheDocument();
    expect(screen.getByText("Manage user access and permissions")).toBeInTheDocument();
  });

  test("renders the Invite User button", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    // There's an "Invite User" button in the header
    const buttons = screen.getAllByText("Invite User");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  test("renders the access control info box", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    expect(screen.getByText(/Access Control:/)).toBeInTheDocument();
  });

  test("shows loading spinner when loading is true", () => {
    const props = defaultProps();
    props.loading = true;
    render(<TeamMembersTab {...props} />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  /* ---- User table ------------------------------------------------ */

  test("renders user names in the table", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("Bob Viewer")).toBeInTheDocument();
  });

  test("renders user emails in the table", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    expect(screen.getByText("alice@co.com")).toBeInTheDocument();
    expect(screen.getByText("bob@co.com")).toBeInTheDocument();
  });

  test("renders user roles in the table", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("viewer")).toBeInTheDocument();
  });

  test("renders department badges for users with department access", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    expect(screen.getByText("ENG")).toBeInTheDocument();
    expect(screen.getByText("SALES")).toBeInTheDocument();
  });

  test("shows 'All' when user has no department restrictions", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    // Bob has no department_access, so "All" should appear
    const allLabels = screen.getAllByText("All");
    expect(allLabels.length).toBeGreaterThanOrEqual(1);
  });

  test("shows +N more label for account codes exceeding 3", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    // Alice has 4 account codes, only 3 shown, +1 more
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  test("renders edit and remove buttons for each user", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    const editButtons = screen.getAllByText("Edit");
    const removeButtons = screen.getAllByText("Remove");
    expect(editButtons.length).toBe(2);
    expect(removeButtons.length).toBe(2);
  });

  /* ---- Invite User Modal ----------------------------------------- */

  test("opens invite modal when Invite User button is clicked", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    const inviteButtons = screen.getAllByText("Invite User");
    fireEvent.click(inviteButtons[0]);
    expect(screen.getByText("Invite Team Member")).toBeInTheDocument();
  });

  test("shows required field labels in invite modal", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    fireEvent.click(screen.getAllByText("Invite User")[0]);
    expect(screen.getByText("Name *")).toBeInTheDocument();
    expect(screen.getByText("Email *")).toBeInTheDocument();
  });

  test("sets error when invite is submitted without required fields", async () => {
    const props = defaultProps();
    render(<TeamMembersTab {...props} />);
    fireEvent.click(screen.getAllByText("Invite User")[0]);
    // Click the submit "Invite User" button in modal
    const modalInviteButtons = screen.getAllByText("Invite User");
    const submitBtn = modalInviteButtons[modalInviteButtons.length - 1];
    fireEvent.click(submitBtn);
    expect(props.setError).toHaveBeenCalledWith("Please fill in all required fields");
  });

  test("submits invite and shows success message on success", async () => {
    const props = defaultProps();
    render(<TeamMembersTab {...props} />);
    fireEvent.click(screen.getAllByText("Invite User")[0]);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@company.com"), {
      target: { value: "new@co.com" },
    });

    const modalInviteButtons = screen.getAllByText("Invite User");
    fireEvent.click(modalInviteButtons[modalInviteButtons.length - 1]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({ method: "POST" }),
      );
    });

    await waitFor(() => {
      expect(props.setSaveMessage).toHaveBeenCalledWith("User invited successfully!");
      expect(props.onRefresh).toHaveBeenCalled();
    });
  });

  /* ---- Edit User Modal ------------------------------------------- */

  test("opens edit modal pre-populated with user data", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]); // Edit Alice
    expect(screen.getByText("Edit User: Alice Admin")).toBeInTheDocument();
  });

  test("submits update and shows success message", async () => {
    const props = defaultProps();
    render(<TeamMembersTab {...props} />);
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    fireEvent.click(screen.getByText("Update User"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/users/u1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    await waitFor(() => {
      expect(props.setSaveMessage).toHaveBeenCalledWith("User updated successfully!");
    });
  });

  /* ---- Remove User ----------------------------------------------- */

  test("removes user after confirmation", async () => {
    const props = defaultProps();
    render(<TeamMembersTab {...props} />);
    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/users/u1", {
        method: "DELETE",
      });
      expect(props.setSaveMessage).toHaveBeenCalledWith("User removed successfully!");
    });
  });

  test("does not remove user if confirmation is cancelled", async () => {
    global.confirm.mockReturnValue(false);
    const props = defaultProps();
    render(<TeamMembersTab {...props} />);
    fireEvent.click(screen.getAllByText("Remove")[0]);
    expect(global.fetch).not.toHaveBeenCalledWith(
      "/api/users/u1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  /* ---- Cancel buttons -------------------------------------------- */

  test("closes invite modal when Cancel is clicked", () => {
    render(<TeamMembersTab {...defaultProps()} />);
    fireEvent.click(screen.getAllByText("Invite User")[0]);
    expect(screen.getByText("Invite Team Member")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Invite Team Member")).not.toBeInTheDocument();
  });
});
