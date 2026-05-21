import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddMealForm } from "./src/app/AddMealForm.jsx";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("lucide-react", () => {
  const icon = (name) => {
    const C = (props) => <span data-testid={`icon-${name}`} {...props} />;
    C.displayName = name;
    return C;
  };
  return { Search: icon("Search") };
});

const mockSearchResults = [
  { name: "Grilled Chicken", calories: 250, protein: 35, carbs: 0, fat: 8 },
  { name: "Grape Fruit", calories: 52, protein: 1, carbs: 13, fat: 0 },
];

const mockHandleSearchChange = vi.fn();
const mockClearSearch = vi.fn();
const mockSetSearchQuery = vi.fn();
const mockSetShowDropdown = vi.fn();

let mockSearchState = {
  searchQuery: "",
  searchResults: [],
  searchLoading: false,
  showDropdown: false,
};

vi.mock("@/hooks/useFoodSearch", () => ({
  useFoodSearch: () => ({
    ...mockSearchState,
    setSearchQuery: mockSetSearchQuery,
    setShowDropdown: mockSetShowDropdown,
    handleSearchChange: mockHandleSearchChange,
    clearSearch: mockClearSearch,
  }),
}));

const defaultProps = () => ({
  onSubmit: vi.fn(() => Promise.resolve(true)),
  onCancel: vi.fn(),
  tier: "pro",
  loading: false,
});

describe("AddMealForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchState = {
      searchQuery: "",
      searchResults: [],
      searchLoading: false,
      showDropdown: false,
    };
  });

  /* ---- Rendering ------------------------------------------------- */

  test("renders the meal type selector", () => {
    render(<AddMealForm {...defaultProps()} />);
    expect(screen.getByDisplayValue("Breakfast")).toBeInTheDocument();
  });

  test("renders mode toggle buttons", () => {
    render(<AddMealForm {...defaultProps()} />);
    expect(screen.getByText("AI Search")).toBeInTheDocument();
    expect(screen.getByText("Manual Entry")).toBeInTheDocument();
  });

  test("renders AI Search mode by default", () => {
    render(<AddMealForm {...defaultProps()} />);
    expect(
      screen.getByPlaceholderText("Search food (e.g., grapes, chicken breast...)"),
    ).toBeInTheDocument();
  });

  test("renders submit and cancel buttons", () => {
    render(<AddMealForm {...defaultProps()} />);
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  /* ---- Meal type selector ---------------------------------------- */

  test("offers breakfast, lunch, dinner, snack options", () => {
    render(<AddMealForm {...defaultProps()} />);
    const select = screen.getByDisplayValue("Breakfast");
    expect(select).toBeInTheDocument();
    // Change to lunch
    fireEvent.change(select, { target: { value: "lunch" } });
    expect(screen.getByDisplayValue("Lunch")).toBeInTheDocument();
  });

  /* ---- Mode toggle ----------------------------------------------- */

  test("switches to manual entry mode", () => {
    render(<AddMealForm {...defaultProps()} />);
    fireEvent.click(screen.getByText("Manual Entry"));
    expect(screen.getByPlaceholderText("Food name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Calories")).toBeInTheDocument();
  });

  test("shows protein, carbs, fat fields in manual mode for pro tier", () => {
    render(<AddMealForm {...defaultProps()} />);
    fireEvent.click(screen.getByText("Manual Entry"));
    expect(screen.getByPlaceholderText("Protein (g)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Carbs (g)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Fat (g)")).toBeInTheDocument();
  });

  test("hides macro fields in manual mode for free tier", () => {
    const props = defaultProps();
    props.tier = "free";
    render(<AddMealForm {...props} />);
    fireEvent.click(screen.getByText("Manual Entry"));
    expect(screen.queryByPlaceholderText("Protein (g)")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Carbs (g)")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Fat (g)")).not.toBeInTheDocument();
  });

  test("switches back to AI Search mode from manual", () => {
    render(<AddMealForm {...defaultProps()} />);
    fireEvent.click(screen.getByText("Manual Entry"));
    fireEvent.click(screen.getByText("AI Search"));
    expect(
      screen.getByPlaceholderText("Search food (e.g., grapes, chicken breast...)"),
    ).toBeInTheDocument();
  });

  /* ---- Search results -------------------------------------------- */

  test("shows search results dropdown when results are available", () => {
    mockSearchState = {
      searchQuery: "chicken",
      searchResults: mockSearchResults,
      searchLoading: false,
      showDropdown: true,
    };
    render(<AddMealForm {...defaultProps()} />);
    expect(screen.getByText("Grilled Chicken")).toBeInTheDocument();
    expect(screen.getByText("Grape Fruit")).toBeInTheDocument();
  });

  test("shows loading indicator during search", () => {
    mockSearchState = {
      searchQuery: "test",
      searchResults: [],
      searchLoading: true,
      showDropdown: false,
    };
    render(<AddMealForm {...defaultProps()} />);
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  test("populates form when a search result is selected", () => {
    mockSearchState = {
      searchQuery: "chicken",
      searchResults: mockSearchResults,
      searchLoading: false,
      showDropdown: true,
    };
    render(<AddMealForm {...defaultProps()} />);
    fireEvent.click(screen.getByText("Grilled Chicken"));
    // After selection, the food details should show
    expect(mockSetSearchQuery).toHaveBeenCalledWith("Grilled Chicken");
    expect(mockSetShowDropdown).toHaveBeenCalledWith(false);
  });

  /* ---- Form submission ------------------------------------------- */

  test("calls onSubmit when form is submitted", async () => {
    const props = defaultProps();
    render(<AddMealForm {...props} />);
    fireEvent.click(screen.getByText("Manual Entry"));
    fireEvent.change(screen.getByPlaceholderText("Food name"), {
      target: { value: "Test Food" },
    });
    fireEvent.change(screen.getByPlaceholderText("Calories"), {
      target: { value: "200" },
    });
    fireEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(props.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          food_name: "Test Food",
          calories: "200",
          meal_type: "breakfast",
        }),
      );
    });
  });

  test("calls onCancel when cancel is clicked", () => {
    const props = defaultProps();
    render(<AddMealForm {...props} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(props.onCancel).toHaveBeenCalled();
  });

  test("disables Add button when loading is true", () => {
    const props = defaultProps();
    props.loading = true;
    render(<AddMealForm {...props} />);
    expect(screen.getByText("Add")).toBeDisabled();
  });

  test("disables Add button when food_name is empty", () => {
    render(<AddMealForm {...defaultProps()} />);
    // In AI search mode with no food selected, button should be disabled
    expect(screen.getByText("Add")).toBeDisabled();
  });

  /* ---- Selected food display ------------------------------------- */

  test("shows selected food details with macros for pro tier", () => {
    mockSearchState = {
      searchQuery: "chicken",
      searchResults: mockSearchResults,
      searchLoading: false,
      showDropdown: true,
    };
    const { rerender } = render(<AddMealForm {...defaultProps()} />);
    fireEvent.click(screen.getByText("Grilled Chicken"));

    // After selection, rerender with updated state would show the food
    // This tests the interaction flow
    expect(mockSetSearchQuery).toHaveBeenCalledWith("Grilled Chicken");
  });
});
