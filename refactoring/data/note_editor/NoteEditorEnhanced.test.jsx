import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NoteEditorEnhanced } from "./src/app/NoteEditorEnhanced.jsx";

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
    Check: icon("Check"),
    Wand2: icon("Wand2"),
    Bell: icon("Bell"),
    BellOff: icon("BellOff"),
    Palette: icon("Palette"),
    Type: icon("Type"),
    Trash: icon("Trash"),
    Sparkles: icon("Sparkles"),
    X: icon("X"),
  };
});

vi.mock("date-fns", () => ({
  format: (d, fmt) => "Jan 15, 2025",
}));

const mockMutate = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: ["General", "Work", "Personal"] }),
  useMutation: ({ mutationFn, onSuccess }) => ({
    mutate: (data) => {
      mockMutate(data);
      if (onSuccess) onSuccess();
    },
  }),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ suggestion: "Test suggestion" }) }),
);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock Notification
Object.defineProperty(window, "Notification", {
  value: { permission: "granted", requestPermission: vi.fn() },
  writable: true,
});

const baseNote = {
  id: "n1",
  title: "Test Note",
  body: "This is the body of the test note for testing purposes.",
  category: "Work",
  updated_at: "2025-01-15T10:00:00Z",
  reminder_at: null,
  drawing_data: null,
  has_drawing: false,
  is_starred: false,
};

const defaultProps = () => ({
  note: baseNote,
  onNoteChange: vi.fn(),
  onCategoryChange: vi.fn(),
  saveIndicator: false,
  wordCount: 10,
  charCount: 55,
});

describe("NoteEditorEnhanced", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  /* ---- Rendering ------------------------------------------------- */

  test("renders the title input with the note title", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    const titleInput = screen.getByPlaceholderText("Untitled");
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.defaultValue).toBe("Test Note");
  });

  test("renders the textarea with the note body", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    const textarea = screen.getByPlaceholderText("Start writing...");
    expect(textarea).toBeInTheDocument();
  });

  test("displays word count in the footer", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    expect(screen.getByText("10 words")).toBeInTheDocument();
  });

  test("displays char count in the footer", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    expect(screen.getByText("55 chars")).toBeInTheDocument();
  });

  test("displays last edited date in the footer", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    expect(screen.getByText(/edited/)).toBeInTheDocument();
  });

  test("renders category selector with current category", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    const select = screen.getByDisplayValue("Work");
    expect(select).toBeInTheDocument();
  });

  /* ---- Save indicator -------------------------------------------- */

  test("shows saved indicator when saveIndicator is true", () => {
    const props = defaultProps();
    props.saveIndicator = true;
    render(<NoteEditorEnhanced {...props} />);
    expect(screen.getByText("saved")).toBeInTheDocument();
  });

  /* ---- Category change ------------------------------------------- */

  test("calls onCategoryChange when category is changed", () => {
    const props = defaultProps();
    render(<NoteEditorEnhanced {...props} />);
    const select = screen.getByDisplayValue("Work");
    fireEvent.change(select, { target: { value: "Personal" } });
    expect(props.onCategoryChange).toHaveBeenCalledWith("Personal");
  });

  /* ---- Title/Body editing ---------------------------------------- */

  test("calls onNoteChange when title is edited", () => {
    const props = defaultProps();
    render(<NoteEditorEnhanced {...props} />);
    const titleInput = screen.getByPlaceholderText("Untitled");
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    expect(props.onNoteChange).toHaveBeenCalled();
  });

  test("calls onNoteChange when body is edited", () => {
    const props = defaultProps();
    render(<NoteEditorEnhanced {...props} />);
    const textarea = screen.getByPlaceholderText("Start writing...");
    fireEvent.change(textarea, { target: { value: "Updated body text" } });
    expect(props.onNoteChange).toHaveBeenCalled();
  });

  /* ---- Drawing mode ---------------------------------------------- */

  test("toggles to drawing mode and shows drawing tools", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    // Click the palette/type toggle button (drawing mode)
    fireEvent.click(screen.getByTitle("Toggle drawing mode"));
    expect(screen.getByText("Drawing Tools")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  test("hides textarea in drawing mode", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    fireEvent.click(screen.getByTitle("Toggle drawing mode"));
    expect(screen.queryByPlaceholderText("Start writing...")).not.toBeInTheDocument();
  });

  /* ---- Reminder -------------------------------------------------- */

  test("opens reminder modal when reminder button is clicked", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    fireEvent.click(screen.getByTitle("Set reminder"));
    expect(screen.getByText("Set Reminder")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });

  test("set reminder button is disabled without date and time", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    fireEvent.click(screen.getByTitle("Set reminder"));
    const setButtons = screen.getAllByText("Set Reminder");
    const submitBtn = setButtons[setButtons.length - 1];
    expect(submitBtn).toBeDisabled();
  });

  test("shows clear button in reminder modal when reminder is set", () => {
    const props = defaultProps();
    props.note = { ...baseNote, reminder_at: "2025-06-01T10:00:00Z" };
    render(<NoteEditorEnhanced {...props} />);
    fireEvent.click(screen.getByTitle("Edit reminder"));
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  /* ---- AI Suggestion --------------------------------------------- */

  test("renders the AI suggestion button", () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    expect(screen.getByTitle("Get AI suggestion (Cmd/Ctrl+K)")).toBeInTheDocument();
  });

  test("shows AI suggestion bar when suggestion is received", async () => {
    render(<NoteEditorEnhanced {...defaultProps()} />);
    fireEvent.click(screen.getByTitle("Get AI suggestion (Cmd/Ctrl+K)"));

    await waitFor(() => {
      expect(screen.getByText("Accept")).toBeInTheDocument();
    });
  });

  /* ---- Word count singular --------------------------------------- */

  test("shows 'word' singular when count is 1", () => {
    const props = defaultProps();
    props.wordCount = 1;
    render(<NoteEditorEnhanced {...props} />);
    expect(screen.getByText("1 word")).toBeInTheDocument();
  });
});
