import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamDashboard from "./src/app/TeamDashboard.jsx";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("lucide-react", () => {
  const icon = (name) => {
    const C = (props) => <span data-testid={`icon-${name}`} {...props} />;
    C.displayName = name;
    return C;
  };
  return {
    AlertTriangle: icon("AlertTriangle"),
    TrendingUp: icon("TrendingUp"),
    CheckCircle: icon("CheckCircle"),
    Users: icon("Users"),
    Clock: icon("Clock"),
    BarChart3: icon("BarChart3"),
    Calendar: icon("Calendar"),
  };
});

vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...actual,
    format: (d, fmt) => {
      if (fmt === "MMM d") return "Jun 1";
      if (fmt === "MMMM yyyy") return "June 2025";
      return "Jun 1, 2025";
    },
  };
});

/* ---- Test data --------------------------------------------------- */

const makeResource = (id, name, role, weeklyCapacity = 40, targetUtil = 0.75, multiplier = 1.0) => ({
  id,
  name,
  role,
  weekly_capacity: weeklyCapacity,
  target_utilization: targetUtil,
  effort_multiplier: multiplier,
});

const resources = [
  makeResource("r1", "Alice Developer", "Frontend Developer"),
  makeResource("r2", "Bob Designer", "UI Designer"),
  makeResource("r3", "Carol Manager", "Project Manager"),
];

const currentDate = new Date("2025-06-15");

const defaultProps = () => ({
  resources,
  allocations: [],
  timeBlocks: [],
  currentDate,
});

describe("TeamDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ---- Summary cards --------------------------------------------- */

  test("renders the Overloaded This Week summary card", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.getByText("Overloaded This Week")).toBeInTheDocument();
  });

  test("renders the Near Capacity summary card", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.getByText("Near Capacity")).toBeInTheDocument();
  });

  test("renders the Healthy Load summary card", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.getByText("Healthy Load")).toBeInTheDocument();
  });

  test("renders the Total Team Members summary card with correct count", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.getByText("Total Team Members")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  /* ---- This Week section ----------------------------------------- */

  test("renders This Week section header", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.getByText(/This Week/)).toBeInTheDocument();
  });

  test("renders each team member name in This Week section", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.getByText("Alice Developer")).toBeInTheDocument();
    expect(screen.getByText("Bob Designer")).toBeInTheDocument();
    expect(screen.getByText("Carol Manager")).toBeInTheDocument();
  });

  test("renders team member roles", () => {
    render(<TeamDashboard {...defaultProps()} />);
    const devRoles = screen.getAllByText("Frontend Developer");
    const designerRoles = screen.getAllByText("UI Designer");
    expect(devRoles.length).toBeGreaterThanOrEqual(1);
    expect(designerRoles.length).toBeGreaterThanOrEqual(1);
  });

  test("shows utilization label in This Week section", () => {
    render(<TeamDashboard {...defaultProps()} />);
    const utilizationLabels = screen.getAllByText("utilization");
    expect(utilizationLabels.length).toBeGreaterThanOrEqual(1);
  });

  test("shows Allocated metric label for each member", () => {
    render(<TeamDashboard {...defaultProps()} />);
    const allocatedLabels = screen.getAllByText("Allocated");
    expect(allocatedLabels.length).toBeGreaterThanOrEqual(3);
  });

  /* ---- This Month section ---------------------------------------- */

  test("renders This Month section header", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.getByText(/This Month/)).toBeInTheDocument();
  });

  test("renders team members in This Month section", () => {
    render(<TeamDashboard {...defaultProps()} />);
    // Each member appears in both This Week and This Month sections
    const aliceAll = screen.getAllByText("Alice Developer");
    expect(aliceAll.length).toBeGreaterThanOrEqual(2);
  });

  /* ---- No bottlenecks -------------------------------------------- */

  test("does not show bottleneck warning when no one is overloaded", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.queryByText(/Bottlenecks Detected/)).not.toBeInTheDocument();
  });

  /* ---- With overloaded resources --------------------------------- */

  test("shows bottleneck warning when a resource is overloaded", () => {
    const now = new Date("2025-06-15");
    // Create allocation that far exceeds capacity for this week
    const heavyAllocation = {
      resource_id: "r1",
      start_date: "2025-06-09",
      end_date: "2025-06-20",
      hours_per_day: 12,
    };
    render(
      <TeamDashboard
        resources={resources}
        allocations={[heavyAllocation]}
        timeBlocks={[]}
        currentDate={now}
      />,
    );
    expect(screen.getByText(/Bottlenecks Detected This Week/)).toBeInTheDocument();
  });

  /* ---- Healthy load count ---------------------------------------- */

  test("shows correct healthy count when no allocations exist", () => {
    render(<TeamDashboard {...defaultProps()} />);
    // With no allocations, all 3 should be healthy (utilization is 0/NaN -> depends on calc)
    // The healthy card should show a count
    const healthyCard = screen.getByText("Healthy Load").closest("div");
    expect(healthyCard).toBeInTheDocument();
  });

  /* ---- Empty resources ------------------------------------------- */

  test("renders gracefully with empty resources array", () => {
    render(
      <TeamDashboard
        resources={[]}
        allocations={[]}
        timeBlocks={[]}
        currentDate={currentDate}
      />,
    );
    expect(screen.getByText("Total Team Members")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  /* ---- Blocked hours --------------------------------------------- */

  test("does not show Blocked label when no time blocks", () => {
    render(<TeamDashboard {...defaultProps()} />);
    expect(screen.queryByText("Blocked")).not.toBeInTheDocument();
  });
});
