import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GoalsModal } from "./src/app/GoalsModal.jsx";

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
    Moon: icon("Moon"),
    Dumbbell: icon("Dumbbell"),
    Apple: icon("Apple"),
    X: icon("X"),
  };
});

global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
);

const currentGoals = {
  sleep_hours: 7,
  sleep_quality: 80,
  workout_frequency: 4,
  daily_calories: 2200,
  daily_protein: 160,
  daily_carbs: 220,
  daily_fats: 65,
  daily_water: 2500,
};

const defaultProps = () => ({
  onClose: vi.fn(),
  currentGoals,
  onSuccess: vi.fn(),
});

describe("GoalsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  /* ---- Rendering ------------------------------------------------- */

  test("renders the modal title", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Set Your Health Goals")).toBeInTheDocument();
  });

  test("renders Sleep Goals section", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Sleep Goals")).toBeInTheDocument();
  });

  test("renders Activity Goals section", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Activity Goals")).toBeInTheDocument();
  });

  test("renders Nutrition Goals section", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Nutrition Goals")).toBeInTheDocument();
  });

  test("renders Save Goals and Cancel buttons", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Save Goals")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  /* ---- Pre-populated values -------------------------------------- */

  test("pre-populates sleep hours from currentGoals", () => {
    render(<GoalsModal {...defaultProps()} />);
    const sleepInput = screen.getByDisplayValue("7");
    expect(sleepInput).toBeInTheDocument();
  });

  test("pre-populates daily calories from currentGoals", () => {
    render(<GoalsModal {...defaultProps()} />);
    const caloriesInput = screen.getByDisplayValue("2200");
    expect(caloriesInput).toBeInTheDocument();
  });

  test("pre-populates protein from currentGoals", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByDisplayValue("160")).toBeInTheDocument();
  });

  test("pre-populates workout frequency from currentGoals", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByDisplayValue("4")).toBeInTheDocument();
  });

  /* ---- Field labels ---------------------------------------------- */

  test("renders Daily Sleep label", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Daily Sleep (hours)")).toBeInTheDocument();
  });

  test("renders Quality Score label", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Quality Score (0-100)")).toBeInTheDocument();
  });

  test("renders Weekly Workouts label", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Weekly Workouts")).toBeInTheDocument();
  });

  test("renders Daily Calories label", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Daily Calories")).toBeInTheDocument();
  });

  test("renders Daily Water label", () => {
    render(<GoalsModal {...defaultProps()} />);
    expect(screen.getByText("Daily Water (ml)")).toBeInTheDocument();
  });

  /* ---- Form editing ---------------------------------------------- */

  test("updates sleep hours when changed", () => {
    render(<GoalsModal {...defaultProps()} />);
    const sleepInput = screen.getByDisplayValue("7");
    fireEvent.change(sleepInput, { target: { value: "9" } });
    expect(screen.getByDisplayValue("9")).toBeInTheDocument();
  });

  test("updates daily calories when changed", () => {
    render(<GoalsModal {...defaultProps()} />);
    const calInput = screen.getByDisplayValue("2200");
    fireEvent.change(calInput, { target: { value: "3000" } });
    expect(screen.getByDisplayValue("3000")).toBeInTheDocument();
  });

  /* ---- Form submission ------------------------------------------- */

  test("calls fetch for each goal field on submit", async () => {
    const props = defaultProps();
    render(<GoalsModal {...props} />);
    fireEvent.click(screen.getByText("Save Goals"));

    await waitFor(() => {
      // Should be called 8 times (one for each goal field)
      expect(global.fetch).toHaveBeenCalledTimes(8);
    });
  });

  test("calls fetch with POST method and correct endpoint", async () => {
    const props = defaultProps();
    render(<GoalsModal {...props} />);
    fireEvent.click(screen.getByText("Save Goals"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/goals",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  test("calls onSuccess after successful submission", async () => {
    const props = defaultProps();
    render(<GoalsModal {...props} />);
    fireEvent.click(screen.getByText("Save Goals"));

    await waitFor(() => {
      expect(props.onSuccess).toHaveBeenCalled();
    });
  });

  test("shows Saving... text while submitting", async () => {
    // Make fetch slow
    global.fetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100)),
    );
    const props = defaultProps();
    render(<GoalsModal {...props} />);
    fireEvent.click(screen.getByText("Save Goals"));
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  test("disables save button while submitting", async () => {
    global.fetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100)),
    );
    render(<GoalsModal {...defaultProps()} />);
    fireEvent.click(screen.getByText("Save Goals"));
    expect(screen.getByText("Saving...")).toBeDisabled();
  });

  /* ---- Close behavior -------------------------------------------- */

  test("calls onClose when close button (X) is clicked", () => {
    const props = defaultProps();
    render(<GoalsModal {...props} />);
    fireEvent.click(screen.getByTestId("icon-X"));
    expect(props.onClose).toHaveBeenCalled();
  });

  test("calls onClose when Cancel button is clicked", () => {
    const props = defaultProps();
    render(<GoalsModal {...props} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(props.onClose).toHaveBeenCalled();
  });
});
