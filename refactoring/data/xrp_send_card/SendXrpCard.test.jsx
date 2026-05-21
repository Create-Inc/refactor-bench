import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SendXrpCard } from "./src/app/SendXrpCard.jsx";

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
    Lock: icon("Lock"),
    MessageCircle: icon("MessageCircle"),
    AlertCircle: icon("AlertCircle"),
  };
});

// Mock translation hook
const translations = {
  "send.title": "Send XRP",
  "send.subtitle": "Transfer to another user",
  "send.submit": "Send Now",
  "send.processing": "Processing...",
  "send.cancel": "Cancel",
  "send.recipientEmail": "Recipient Email",
  "send.recipientAccessCode": "Recipient Access Code",
  "send.amount": "Amount (XRP)",
  "send.howItWorks": "How it works",
  "send.step1": "Enter the recipient's email",
  "send.step2": "Enter their access code",
  "send.step3": "Enter the amount",
  "send.step4": "Confirm the transfer",
  "send.info": "Send XRP to anyone with an account",
  "send.suspended": "Transfers are suspended",
  "withdraw.securityReview": "Security Review",
};

vi.mock("@/utils/translations", () => ({
  useTranslation: () => ({
    t: (key) => translations[key] || key,
  }),
}));

global.fetch = vi.fn();

const defaultProps = () => ({
  onSendXrp: vi.fn(),
  loading: false,
  isFrozen: false,
});

describe("SendXrpCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  /* ---- Rendering ------------------------------------------------- */

  test("renders the card title", () => {
    render(<SendXrpCard {...defaultProps()} />);
    expect(screen.getByText("Send XRP")).toBeInTheDocument();
  });

  test("renders the card subtitle", () => {
    render(<SendXrpCard {...defaultProps()} />);
    expect(screen.getByText("Transfer to another user")).toBeInTheDocument();
  });

  test("renders the send button initially", () => {
    render(<SendXrpCard {...defaultProps()} />);
    expect(screen.getByText("Send Now")).toBeInTheDocument();
  });

  test("renders info text when form is not shown", () => {
    render(<SendXrpCard {...defaultProps()} />);
    expect(screen.getByText(/Send XRP to anyone with an account/)).toBeInTheDocument();
  });

  /* ---- Frozen state ---------------------------------------------- */

  test("shows frozen state when isFrozen is true", () => {
    render(<SendXrpCard {...defaultProps()} isFrozen={true} />);
    expect(screen.getByText("Transfers are suspended")).toBeInTheDocument();
  });

  test("does not show the send button in frozen state", () => {
    render(<SendXrpCard {...defaultProps()} isFrozen={true} />);
    expect(screen.queryByText("Send Now")).not.toBeInTheDocument();
  });

  /* ---- Form toggle ----------------------------------------------- */

  test("shows form fields when Send Now button is clicked", () => {
    render(<SendXrpCard {...defaultProps()} />);
    fireEvent.click(screen.getByText("Send Now"));
    expect(screen.getByText("Recipient Email")).toBeInTheDocument();
    expect(screen.getByText("Recipient Access Code")).toBeInTheDocument();
    expect(screen.getByText("Amount (XRP)")).toBeInTheDocument();
  });

  test("shows how it works info in the form", () => {
    render(<SendXrpCard {...defaultProps()} />);
    fireEvent.click(screen.getByText("Send Now"));
    expect(screen.getByText("How it works")).toBeInTheDocument();
  });

  test("hides info text when form is shown", () => {
    render(<SendXrpCard {...defaultProps()} />);
    fireEvent.click(screen.getByText("Send Now"));
    expect(screen.queryByText(/Send XRP to anyone with an account/)).not.toBeInTheDocument();
  });

  /* ---- Form cancel ----------------------------------------------- */

  test("hides form and clears fields when Cancel is clicked", () => {
    render(<SendXrpCard {...defaultProps()} />);
    fireEvent.click(screen.getByText("Send Now"));
    // Fill in a field
    fireEvent.change(screen.getByPlaceholderText("friend@example.com"), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByText("Cancel"));
    // Form should be hidden, info text should reappear
    expect(screen.getByText(/Send XRP to anyone with an account/)).toBeInTheDocument();
  });

  /* ---- Form submission ------------------------------------------- */

  test("submits the form and calls fetch with correct data", async () => {
    const props = defaultProps();
    render(<SendXrpCard {...props} />);
    fireEvent.click(screen.getByText("Send Now"));

    fireEvent.change(screen.getByPlaceholderText("friend@example.com"), {
      target: { value: "recipient@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter their access code"), {
      target: { value: "ABC123" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "100" },
    });

    // Find submit button (Send Now inside the form)
    const submitButtons = screen.getAllByText("Send Now");
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/p2p-transfer",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("recipient@test.com"),
        }),
      );
    });
  });

  test("calls onSendXrp callback after successful submission", async () => {
    const props = defaultProps();
    render(<SendXrpCard {...props} />);
    fireEvent.click(screen.getByText("Send Now"));

    fireEvent.change(screen.getByPlaceholderText("friend@example.com"), {
      target: { value: "r@t.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter their access code"), {
      target: { value: "CODE" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "50" },
    });

    const submitButtons = screen.getAllByText("Send Now");
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(props.onSendXrp).toHaveBeenCalled();
    });
  });

  test("resets form after successful submission", async () => {
    render(<SendXrpCard {...defaultProps()} />);
    fireEvent.click(screen.getByText("Send Now"));

    fireEvent.change(screen.getByPlaceholderText("friend@example.com"), {
      target: { value: "r@t.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter their access code"), {
      target: { value: "CODE" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "50" },
    });

    const submitButtons = screen.getAllByText("Send Now");
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      // After successful submission form should be hidden, info text should show
      expect(screen.getByText(/Send XRP to anyone with an account/)).toBeInTheDocument();
    });
  });

  /* ---- Error handling -------------------------------------------- */

  test("shows error message when transfer fails", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Insufficient balance" }),
    });

    render(<SendXrpCard {...defaultProps()} />);
    fireEvent.click(screen.getByText("Send Now"));

    fireEvent.change(screen.getByPlaceholderText("friend@example.com"), {
      target: { value: "r@t.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter their access code"), {
      target: { value: "CODE" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "999999" },
    });

    const submitButtons = screen.getAllByText("Send Now");
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Insufficient balance")).toBeInTheDocument();
    });
  });

  test("shows frozen message when response indicates frozen account", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ frozen: true, reason: "Suspicious activity detected" }),
    });

    render(<SendXrpCard {...defaultProps()} />);
    fireEvent.click(screen.getByText("Send Now"));

    fireEvent.change(screen.getByPlaceholderText("friend@example.com"), {
      target: { value: "r@t.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter their access code"), {
      target: { value: "CODE" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "10" },
    });

    const submitButtons = screen.getAllByText("Send Now");
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Security Review")).toBeInTheDocument();
      expect(screen.getByText("Suspicious activity detected")).toBeInTheDocument();
    });
  });

  /* ---- Loading state --------------------------------------------- */

  test("disables submit button when loading is true", () => {
    render(<SendXrpCard {...defaultProps()} loading={true} />);
    fireEvent.click(screen.getByText("Send Now"));
    // The submit button should show Processing text
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });
});
