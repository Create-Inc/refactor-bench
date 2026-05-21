import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ForecastDashboard from "./src/app/ForecastDashboard.jsx";

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
    TrendingUp: icon("TrendingUp"),
    Calendar: icon("Calendar"),
    AlertTriangle: icon("AlertTriangle"),
    CheckCircle: icon("CheckCircle"),
    Users: icon("Users"),
  };
});

vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...actual,
    format: (d, fmt) => "Jun 1, 2025",
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

const makeAllocation = (resourceId, startDate, endDate, hoursPerDay) => ({
  resource_id: resourceId,
  start_date: startDate,
  end_date: endDate,
  hours_per_day: hoursPerDay,
});

const makeTimeBlock = (resourceId, startDate, endDate, hoursPerDay) => ({
  resource_id: resourceId,
  start_date: startDate,
  end_date: endDate,
  hours_per_day: hoursPerDay,
});

const resources = [
  makeResource("r1", "Alice Johnson", "Developer"),
  makeResource("r2", "Bob Smith", "Designer"),
];

const defaultProps = () => ({
  resources,
  allocations: [],
  timeBlocks: [],
});

describe("ForecastDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ---- Header ---------------------------------------------------- */

  test("renders the Capacity Forecast heading", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    expect(screen.getByText("Capacity Forecast")).toBeInTheDocument();
  });

  test("renders the description text", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    expect(
      screen.getByText(/View projected team capacity and availability/),
    ).toBeInTheDocument();
  });

  /* ---- Forecast period labels ------------------------------------ */

  test("renders three forecast period labels", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    expect(screen.getByText("In 2 Weeks")).toBeInTheDocument();
    expect(screen.getByText("In 1 Month")).toBeInTheDocument();
    expect(screen.getByText("In 3 Months")).toBeInTheDocument();
  });

  /* ---- Team summary ---------------------------------------------- */

  test("renders Allocated and Available headers in each card", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    const allocatedHeaders = screen.getAllByText("Allocated");
    const availableHeaders = screen.getAllByText("Available");
    expect(allocatedHeaders.length).toBe(3);
    expect(availableHeaders.length).toBe(3);
  });

  test("renders Team Utilization labels", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    const labels = screen.getAllByText("Team Utilization");
    expect(labels.length).toBe(3);
  });

  /* ---- Team members section -------------------------------------- */

  test("renders Team Members section in each forecast card", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    const teamMembersHeaders = screen.getAllByText("Team Members");
    expect(teamMembersHeaders.length).toBe(3);
  });

  test("renders resource names in each forecast card", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    // Each resource should appear 3 times (once per forecast card)
    const aliceNames = screen.getAllByText("Alice Johnson");
    const bobNames = screen.getAllByText("Bob Smith");
    expect(aliceNames.length).toBe(3);
    expect(bobNames.length).toBe(3);
  });

  test("renders resource roles in each forecast card", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    const devRoles = screen.getAllByText("Developer");
    const designRoles = screen.getAllByText("Designer");
    expect(devRoles.length).toBe(3);
    expect(designRoles.length).toBe(3);
  });

  /* ---- Capacity Insights ----------------------------------------- */

  test("renders Capacity Insights section", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    expect(screen.getByText("Capacity Insights")).toBeInTheDocument();
  });

  test("renders Healthy capacity, Near capacity, and Overloaded labels", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    const healthy = screen.getAllByText("Healthy capacity");
    const near = screen.getAllByText("Near capacity");
    const overloaded = screen.getAllByText("Overloaded");
    expect(healthy.length).toBe(3);
    expect(near.length).toBe(3);
    expect(overloaded.length).toBe(3);
  });

  /* ---- With allocations ------------------------------------------ */

  test("shows allocated hours labels for resources", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    // Each resource card shows "Xh allocated" and "Xh available"
    const allocLabels = screen.getAllByText(/allocated$/);
    const availLabels = screen.getAllByText(/available$/);
    expect(allocLabels.length).toBe(6); // 2 resources * 3 periods
    expect(availLabels.length).toBe(6);
  });

  test("renders utilization percentage for each resource", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    // With no allocations, should show 0% for all
    const zeroPercents = screen.getAllByText("0%");
    expect(zeroPercents.length).toBeGreaterThanOrEqual(6);
  });

  /* ---- Blocked time ---------------------------------------------- */

  test("does not show blocked time message when no time blocks", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    expect(screen.queryByText(/blocked time/)).not.toBeInTheDocument();
  });

  /* ---- Overloaded warning ---------------------------------------- */

  test("does not show overloaded warning when no one is overloaded", () => {
    render(<ForecastDashboard {...defaultProps()} />);
    expect(screen.queryByText(/overloaded$/)).not.toBeInTheDocument();
  });

  /* ---- No resources edge case ------------------------------------ */

  test("renders gracefully with empty resources array", () => {
    render(
      <ForecastDashboard resources={[]} allocations={[]} timeBlocks={[]} />,
    );
    expect(screen.getByText("Capacity Forecast")).toBeInTheDocument();
    expect(screen.getByText("In 2 Weeks")).toBeInTheDocument();
  });
});
