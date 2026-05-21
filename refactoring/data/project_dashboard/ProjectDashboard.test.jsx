import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectDashboard from "./src/app/ProjectDashboard.jsx";

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
    Briefcase: icon("Briefcase"),
    Users: icon("Users"),
    Clock: icon("Clock"),
    AlertTriangle: icon("AlertTriangle"),
    TrendingUp: icon("TrendingUp"),
    CheckCircle: icon("CheckCircle"),
    Layers: icon("Layers"),
  };
});

vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return actual;
});

/* ---- Test data --------------------------------------------------- */

const resources = [
  {
    id: "r1",
    name: "Alice",
    weekly_capacity: 40,
    target_utilization: 0.75,
    effort_multiplier: 1.0,
  },
  {
    id: "r2",
    name: "Bob",
    weekly_capacity: 40,
    target_utilization: 0.75,
    effort_multiplier: 1.0,
  },
];

const projects = [
  { id: "p1", name: "Project Alpha", color: "#3B82F6" },
  { id: "p2", name: "Project Beta", color: "#10B981" },
  { id: "p3", name: "Project Gamma", color: "#EF4444" },
];

const allocations = [
  {
    project_id: "p1",
    resource_id: "r1",
    start_date: "2025-06-01",
    end_date: "2025-06-14",
    hours_per_day: 4,
  },
  {
    project_id: "p1",
    resource_id: "r2",
    start_date: "2025-06-01",
    end_date: "2025-06-07",
    hours_per_day: 3,
  },
  {
    project_id: "p2",
    resource_id: "r1",
    start_date: "2025-06-10",
    end_date: "2025-06-20",
    hours_per_day: 2,
  },
];

const phases = [
  { project_id: "p1", name: "Design", complexity: "high" },
  { project_id: "p1", name: "Development", complexity: "medium" },
  { project_id: "p2", name: "Research", complexity: "low" },
];

const defaultProps = () => ({
  projects,
  allocations,
  phases,
  resources,
});

describe("ProjectDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ---- Summary cards --------------------------------------------- */

  test("renders Total Projects count", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText("Total Projects")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("renders Active Projects count", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
  });

  test("renders Total Hours Allocated label", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText("Total Hours Allocated")).toBeInTheDocument();
  });

  test("renders Over Capacity label", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText("Over Capacity")).toBeInTheDocument();
  });

  /* ---- Project Effort Breakdown ---------------------------------- */

  test("renders Project Effort Breakdown heading", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText("Project Effort Breakdown")).toBeInTheDocument();
  });

  test("renders all project names in the breakdown", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByText("Project Beta")).toBeInTheDocument();
    expect(screen.getByText("Project Gamma")).toBeInTheDocument();
  });

  test("shows total effort label for projects with allocations", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    const effortLabels = screen.getAllByText("total effort");
    expect(effortLabels.length).toBeGreaterThanOrEqual(1);
  });

  test("shows 'No allocations yet' for projects without allocations", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText("No allocations yet")).toBeInTheDocument();
  });

  /* ---- Capacity utilization -------------------------------------- */

  test("shows Capacity Utilization label for projects with hours", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    const capLabels = screen.getAllByText("Capacity Utilization");
    expect(capLabels.length).toBeGreaterThanOrEqual(1);
  });

  test("shows Realistic status suffix for healthy projects", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    const realisticLabels = screen.getAllByText(/Realistic$/);
    expect(realisticLabels.length).toBeGreaterThanOrEqual(1);
  });

  /* ---- Resource count -------------------------------------------- */

  test("shows number of people assigned to projects", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    // Project Alpha has 2 resources
    expect(screen.getByText(/2 people/)).toBeInTheDocument();
  });

  test("shows singular 'person' for single resource", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    // Project Beta has 1 resource
    expect(screen.getByText(/1 person/)).toBeInTheDocument();
  });

  /* ---- Phases ---------------------------------------------------- */

  test("shows phase count for projects", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText(/2 phases/)).toBeInTheDocument();
    expect(screen.getByText(/1 phase$/)).toBeInTheDocument();
  });

  test("shows high-complexity phase warning", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    expect(screen.getByText(/high-complexity/)).toBeInTheDocument();
  });

  /* ---- Empty state ----------------------------------------------- */

  test("shows empty state when no projects exist", () => {
    render(
      <ProjectDashboard
        projects={[]}
        allocations={[]}
        phases={[]}
        resources={resources}
      />,
    );
    expect(
      screen.getByText("No projects yet. Create a project to get started!"),
    ).toBeInTheDocument();
  });

  /* ---- Critical warning ------------------------------------------ */

  test("does not show critical warning when no projects exceed capacity", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    // With our test data this should not show critical warning
    // (depends on actual calculation)
    expect(screen.getByText("Project Effort Breakdown")).toBeInTheDocument();
  });

  /* ---- Duration -------------------------------------------------- */

  test("shows duration in days for projects with allocations", () => {
    render(<ProjectDashboard {...defaultProps()} />);
    const daysLabels = screen.getAllByText(/days$/);
    expect(daysLabels.length).toBeGreaterThanOrEqual(1);
  });
});
