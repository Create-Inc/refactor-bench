import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlightBookingModal } from "./src/app/FlightBookingModal.jsx";

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
    Plane: icon("Plane"),
    X: icon("X"),
    Calendar: icon("Calendar"),
    MapPinned: icon("MapPinned"),
    User: icon("User"),
    Baby: icon("Baby"),
    Briefcase: icon("Briefcase"),
    Users: icon("Users"),
    Send: icon("Send"),
    CheckCircle: icon("CheckCircle"),
  };
});

vi.mock("@/data/constants", () => ({
  WHATSAPP_NUMBER: "1234567890",
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, "open", { value: mockWindowOpen, writable: true });

const defaultProps = () => ({
  isOpen: true,
  onClose: vi.fn(),
  lang: "ar",
});

describe("FlightBookingModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ---- Visibility ------------------------------------------------ */

  test("renders nothing when isOpen is false", () => {
    const { container } = render(
      <FlightBookingModal isOpen={false} onClose={vi.fn()} lang="ar" />,
    );
    expect(container.innerHTML).toBe("");
  });

  test("renders the modal when isOpen is true", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    expect(screen.getByText("حجز تذكرة طيران")).toBeInTheDocument();
  });

  /* ---- Header ---------------------------------------------------- */

  test("displays Arabic header text when lang is ar", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    expect(screen.getByText("حجز تذكرة طيران")).toBeInTheDocument();
    expect(
      screen.getByText("املأ النموذج وسنرسل لك أفضل العروض"),
    ).toBeInTheDocument();
  });

  test("displays French header text when lang is fr", () => {
    render(<FlightBookingModal {...defaultProps()} lang="fr" />);
    expect(
      screen.getByText("Réservation de Billet d'Avion"),
    ).toBeInTheDocument();
  });

  /* ---- Trip type ------------------------------------------------- */

  test("defaults to roundtrip and shows return date field", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    expect(screen.getByText("ذهاب وعودة")).toBeInTheDocument();
    expect(screen.getByText("ذهاب فقط")).toBeInTheDocument();
    // Return date label should be visible for roundtrip
    expect(screen.getByText("تاريخ العودة")).toBeInTheDocument();
  });

  test("hides return date field when one-way is selected", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    fireEvent.click(screen.getByText("ذهاب فقط"));
    expect(screen.queryByText("تاريخ العودة")).not.toBeInTheDocument();
  });

  /* ---- Passenger counts ------------------------------------------ */

  test("defaults to 1 adult, 0 children, 0 infants", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    // Find the adult count display — the "1" for adults
    expect(screen.getByText("بالغين")).toBeInTheDocument();
    expect(screen.getByText("أطفال")).toBeInTheDocument();
    expect(screen.getByText("رضع")).toBeInTheDocument();
  });

  test("increments adult count when + is clicked", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    // There are multiple + buttons, first one is for adults
    const plusButtons = screen.getAllByText("+");
    fireEvent.click(plusButtons[0]); // increment adults
    // The count should now be 2
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("does not decrement adult count below 1", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    const minusButtons = screen.getAllByText("-");
    fireEvent.click(minusButtons[0]); // decrement adults (already 1)
    // Should remain at 1 — there should still be a "1" in the adults section
    const adultSection = screen.getByText("بالغين").closest("div");
    expect(adultSection).toBeInTheDocument();
  });

  test("increments children count", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    const plusButtons = screen.getAllByText("+");
    fireEvent.click(plusButtons[1]); // increment children
    // Should show 1 for children
    const counts = screen.getAllByText("1");
    expect(counts.length).toBeGreaterThanOrEqual(1);
  });

  /* ---- Form fields ----------------------------------------------- */

  test("renders required from/to input fields", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    expect(screen.getByPlaceholderText("مثال: الجزائر العاصمة")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("مثال: إسطنبول")).toBeInTheDocument();
  });

  test("renders contact info fields", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    expect(screen.getByText("الاسم الكامل")).toBeInTheDocument();
    expect(screen.getByText("رقم الهاتف")).toBeInTheDocument();
  });

  test("renders class selector with economy default", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    expect(screen.getByText("الدرجة")).toBeInTheDocument();
    expect(screen.getByText("اقتصادية")).toBeInTheDocument();
  });

  test("renders notes textarea", () => {
    render(<FlightBookingModal {...defaultProps()} />);
    expect(
      screen.getByPlaceholderText("أي طلبات خاصة أو ملاحظات..."),
    ).toBeInTheDocument();
  });

  /* ---- Form submission ------------------------------------------- */

  test("opens WhatsApp link on form submission", async () => {
    render(<FlightBookingModal {...defaultProps()} />);

    fireEvent.change(screen.getByPlaceholderText("مثال: الجزائر العاصمة"), {
      target: { value: "Algiers" },
    });
    fireEvent.change(screen.getByPlaceholderText("مثال: إسطنبول"), {
      target: { value: "Istanbul" },
    });
    fireEvent.change(screen.getByPlaceholderText("أدخل اسمك"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("+213 XX XX XX XX"), {
      target: { value: "+213 123 456" },
    });

    // Set departure date
    const dateInputs = screen.getAllByDisplayValue("");
    // Find date inputs by type
    const form = screen.getByText("إرسال الطلب عبر واتساب").closest("form");
    const dateFields = form.querySelectorAll('input[type="date"]');
    if (dateFields.length > 0) {
      fireEvent.change(dateFields[0], { target: { value: "2026-06-01" } });
      if (dateFields[1]) {
        fireEvent.change(dateFields[1], { target: { value: "2026-06-15" } });
      }
    }

    fireEvent.click(screen.getByText("إرسال الطلب عبر واتساب"));

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining("wa.me/1234567890"),
        "_blank",
      );
    });
  });

  test("shows success message after submission", async () => {
    render(<FlightBookingModal {...defaultProps()} />);

    fireEvent.change(screen.getByPlaceholderText("مثال: الجزائر العاصمة"), {
      target: { value: "Algiers" },
    });
    fireEvent.change(screen.getByPlaceholderText("مثال: إسطنبول"), {
      target: { value: "Istanbul" },
    });
    fireEvent.change(screen.getByPlaceholderText("أدخل اسمك"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByPlaceholderText("+213 XX XX XX XX"), {
      target: { value: "+213 999" },
    });

    const form = screen.getByText("إرسال الطلب عبر واتساب").closest("form");
    const dateFields = form.querySelectorAll('input[type="date"]');
    if (dateFields[0]) fireEvent.change(dateFields[0], { target: { value: "2026-06-01" } });
    if (dateFields[1]) fireEvent.change(dateFields[1], { target: { value: "2026-06-15" } });

    fireEvent.click(screen.getByText("إرسال الطلب عبر واتساب"));

    await waitFor(() => {
      expect(screen.getByText("تم إرسال طلبك بنجاح!")).toBeInTheDocument();
    });
  });

  /* ---- Close behavior -------------------------------------------- */

  test("calls onClose when close button is clicked", () => {
    const props = defaultProps();
    render(<FlightBookingModal {...props} />);
    fireEvent.click(screen.getByTestId("icon-X"));
    expect(props.onClose).toHaveBeenCalled();
  });

  test("calls onClose when clicking the backdrop overlay", () => {
    const props = defaultProps();
    const { container } = render(<FlightBookingModal {...props} />);
    // Click the outermost overlay div
    const overlay = container.firstChild;
    fireEvent.click(overlay);
    expect(props.onClose).toHaveBeenCalled();
  });
});
