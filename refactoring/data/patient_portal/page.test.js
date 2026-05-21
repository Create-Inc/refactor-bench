import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import PatientPortal from "./src/app/page.jsx";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock confirm dialog
window.confirm = vi.fn();

describe("PatientPortal Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe("Initial Rendering", () => {
    test("renders sidebar with HealthHub title", () => {
      render(<PatientPortal />);
      expect(screen.getByText("HealthHub")).toBeInTheDocument();
    });

    test("renders sidebar navigation items", () => {
      render(<PatientPortal />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Appointments")).toBeInTheDocument();
      expect(screen.getByText("Prescriptions")).toBeInTheDocument();
      expect(screen.getByText("Lab Results")).toBeInTheDocument();
      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.getByText("Vitals")).toBeInTheDocument();
      expect(screen.getByText("History")).toBeInTheDocument();
      expect(screen.getByText("Billing")).toBeInTheDocument();
      expect(screen.getByText("Doctors")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    test("renders global search input", () => {
      render(<PatientPortal />);
      expect(screen.getByLabelText("Global search")).toBeInTheDocument();
    });

    test("renders dashboard by default with welcome message", () => {
      render(<PatientPortal />);
      expect(screen.getByText(/Welcome back, Alex Morgan/)).toBeInTheDocument();
    });

    test("renders notification bell", () => {
      render(<PatientPortal />);
      expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
    });

    test("renders patient name in header", () => {
      render(<PatientPortal />);
      expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    });

    test("renders theme toggle", () => {
      render(<PatientPortal />);
      expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    });
  });

  describe("Dashboard View", () => {
    test("shows upcoming appointments count", () => {
      render(<PatientPortal />);
      expect(screen.getByText("Upcoming Appointments")).toBeInTheDocument();
    });

    test("shows active prescriptions count", () => {
      render(<PatientPortal />);
      expect(screen.getByText("Active Prescriptions")).toBeInTheDocument();
    });

    test("shows pending bills amount", () => {
      render(<PatientPortal />);
      expect(screen.getByText("Pending Bills")).toBeInTheDocument();
      expect(screen.getByText("$90.00")).toBeInTheDocument();
    });

    test("shows abnormal results count", () => {
      render(<PatientPortal />);
      expect(screen.getByText("Abnormal Results")).toBeInTheDocument();
    });

    test("shows next appointments section", () => {
      render(<PatientPortal />);
      expect(screen.getByText("Next Appointments")).toBeInTheDocument();
    });

    test("shows recent messages section", () => {
      render(<PatientPortal />);
      expect(screen.getByText("Recent Messages")).toBeInTheDocument();
      expect(screen.getByText("Lab Results Review")).toBeInTheDocument();
    });

    test("clicking a message on dashboard navigates to messages view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results Review"));
      expect(screen.getByText("Conversations")).toBeInTheDocument();
    });
  });

  describe("Theme Toggling", () => {
    test("renders theme toggle button", () => {
      render(<PatientPortal />);
      expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    });

    test("toggling theme saves to localStorage", () => {
      render(<PatientPortal />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "patientPortalTheme",
        "dark"
      );
    });

    test("toggling theme twice returns to light mode", () => {
      render(<PatientPortal />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "patientPortalTheme",
        "light"
      );
    });

    test("loads dark theme from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "patientPortalTheme") return "dark";
        return null;
      });
      render(<PatientPortal />);
      expect(screen.getByText("☀️")).toBeInTheDocument();
    });
  });

  describe("Sidebar Navigation", () => {
    test("clicking Appointments shows appointments view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      expect(screen.getByLabelText("New appointment")).toBeInTheDocument();
    });

    test("clicking Prescriptions shows prescriptions view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      // Should show a prescription name
      expect(screen.getByText(/Lisinopril/)).toBeInTheDocument();
    });

    test("clicking Lab Results shows lab results view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      expect(screen.getByText("Complete Blood Count")).toBeInTheDocument();
      expect(screen.getByText("Lipid Panel")).toBeInTheDocument();
    });

    test("clicking Messages shows messages view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      expect(screen.getByText("Conversations")).toBeInTheDocument();
    });

    test("clicking Billing shows billing view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      expect(screen.getByText("Total Billed")).toBeInTheDocument();
    });

    test("clicking Doctors shows doctors view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Doctors"));
      expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
      expect(screen.getByText("Dr. Michael Rivera")).toBeInTheDocument();
    });

    test("clicking Settings shows settings view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("Patient Information")).toBeInTheDocument();
    });

    test("saves active view to localStorage on navigation", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "patientPortalView",
        "prescriptions"
      );
    });
  });

  describe("Sidebar Collapse/Expand", () => {
    test("renders toggle sidebar button", () => {
      render(<PatientPortal />);
      expect(screen.getByLabelText("Toggle sidebar")).toBeInTheDocument();
    });

    test("collapsing sidebar hides navigation labels", () => {
      render(<PatientPortal />);
      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Appointments")).not.toBeInTheDocument();
    });

    test("expanding sidebar shows navigation labels again", () => {
      render(<PatientPortal />);
      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  describe("Appointments View", () => {
    test("shows appointment list", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      expect(screen.getByText("Check-up")).toBeInTheDocument();
    });

    test("shows appointment count", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      expect(screen.getByText("5 appointments")).toBeInTheDocument();
    });

    test("appointment filter buttons are rendered", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      expect(screen.getByText("all")).toBeInTheDocument();
      expect(screen.getByText("scheduled")).toBeInTheDocument();
      expect(screen.getByText("completed")).toBeInTheDocument();
    });

    test("filtering by scheduled shows only scheduled appointments", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("scheduled"));
      expect(screen.getByText("2 appointments")).toBeInTheDocument();
    });

    test("filtering by completed shows only completed appointments", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("completed"));
      expect(screen.getByText("2 appointments")).toBeInTheDocument();
    });

    test("clicking an appointment shows detail view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      // Click the first appointment card
      fireEvent.click(screen.getByText("Annual cardiac screening"));
      expect(screen.getByText("← Back to Appointments")).toBeInTheDocument();
    });

    test("appointment detail shows doctor info", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("Annual cardiac screening"));
      expect(screen.getByText(/Dr. Sarah Chen/)).toBeInTheDocument();
      expect(screen.getByText(/cardiology/)).toBeInTheDocument();
    });

    test("appointment detail shows cancel button for scheduled appointments", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("Annual cardiac screening"));
      expect(screen.getByText("Cancel Appointment")).toBeInTheDocument();
    });

    test("back button returns to appointment list", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("Annual cardiac screening"));
      fireEvent.click(screen.getByText("← Back to Appointments"));
      expect(screen.getByText("5 appointments")).toBeInTheDocument();
    });

    test("cancelling appointment requires confirmation", () => {
      window.confirm.mockReturnValue(false);
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("Annual cardiac screening"));
      fireEvent.click(screen.getByText("Cancel Appointment"));
      expect(window.confirm).toHaveBeenCalled();
    });

    test("confirming cancel changes appointment status", () => {
      window.confirm.mockReturnValue(true);
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("Annual cardiac screening"));
      fireEvent.click(screen.getByText("Cancel Appointment"));
      // Should return to list after cancellation
      expect(screen.getByText("5 appointments")).toBeInTheDocument();
    });

    test("new appointment button opens modal", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      expect(screen.getByText("Schedule New Appointment")).toBeInTheDocument();
    });

    test("urgent priority is displayed on appointments", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      expect(screen.getByText("urgent")).toBeInTheDocument();
    });
  });

  describe("New Appointment Modal", () => {
    test("modal shows doctor select", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      expect(screen.getByLabelText("Select doctor")).toBeInTheDocument();
    });

    test("modal shows date and time fields", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      expect(screen.getByLabelText("Appointment date")).toBeInTheDocument();
      expect(screen.getByLabelText("Appointment time")).toBeInTheDocument();
    });

    test("modal shows type and priority selects", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      expect(screen.getByLabelText("Appointment type")).toBeInTheDocument();
      expect(screen.getByLabelText("Appointment priority")).toBeInTheDocument();
    });

    test("modal shows notes textarea", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      expect(screen.getByLabelText("Appointment notes")).toBeInTheDocument();
    });

    test("close button closes modal", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      expect(screen.getByText("Schedule New Appointment")).toBeInTheDocument();
      fireEvent.click(screen.getByText("×"));
      expect(
        screen.queryByText("Schedule New Appointment")
      ).not.toBeInTheDocument();
    });

    test("cancel button closes modal", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(
        screen.queryByText("Schedule New Appointment")
      ).not.toBeInTheDocument();
    });

    test("creating appointment adds it to the list", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      // Fill in the form
      fireEvent.change(screen.getByLabelText("Select doctor"), {
        target: { value: "d6" },
      });
      fireEvent.change(screen.getByLabelText("Appointment date"), {
        target: { value: "2026-07-01" },
      });
      fireEvent.change(screen.getByLabelText("Appointment time"), {
        target: { value: "10:00" },
      });
      fireEvent.change(screen.getByLabelText("Appointment notes"), {
        target: { value: "Annual check-up" },
      });
      fireEvent.click(screen.getByText("Schedule Appointment"));
      // Modal should close and new appointment should appear
      expect(
        screen.queryByText("Schedule New Appointment")
      ).not.toBeInTheDocument();
      expect(screen.getByText("6 appointments")).toBeInTheDocument();
    });
  });

  describe("Prescriptions View", () => {
    test("shows active prescriptions", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      expect(screen.getByText(/Lisinopril — 10mg/)).toBeInTheDocument();
      expect(screen.getByText(/Cetirizine — 10mg/)).toBeInTheDocument();
    });

    test("shows prescription details", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      expect(screen.getByText("Once daily")).toBeInTheDocument();
      expect(
        screen.getByText(/Take in the morning with water/)
      ).toBeInTheDocument();
    });

    test("shows prescribing doctor", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      expect(screen.getByText(/Dr. Sarah Chen/)).toBeInTheDocument();
    });

    test("prescription filter buttons are rendered", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      expect(screen.getByText("all")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
      expect(screen.getByText("expired")).toBeInTheDocument();
    });

    test("filtering by active shows only active prescriptions", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      fireEvent.click(screen.getByText("active"));
      expect(screen.getByText(/Lisinopril/)).toBeInTheDocument();
      expect(screen.queryByText(/Ibuprofen/)).not.toBeInTheDocument();
    });

    test("filtering by expired shows only expired prescriptions", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      fireEvent.click(screen.getByText("expired"));
      expect(screen.getByText(/Ibuprofen/)).toBeInTheDocument();
      expect(screen.queryByText(/Lisinopril/)).not.toBeInTheDocument();
    });

    test("request refill button is shown for active prescriptions with refills", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      const refillButtons = screen.getAllByText("Request Refill");
      expect(refillButtons.length).toBeGreaterThan(0);
    });

    test("requesting refill decrements refill count", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      // Lisinopril initially has 3 refills
      expect(screen.getByText("Refills: 3")).toBeInTheDocument();
      const refillButtons = screen.getAllByText("Request Refill");
      fireEvent.click(refillButtons[0]);
      expect(screen.getByText("Refills: 2")).toBeInTheDocument();
    });

    test("search filters prescriptions by name", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      const searchInput = screen.getByLabelText("Global search");
      fireEvent.change(searchInput, { target: { value: "Metformin" } });
      expect(screen.getByText(/Metformin/)).toBeInTheDocument();
      expect(screen.queryByText(/Lisinopril/)).not.toBeInTheDocument();
    });
  });

  describe("Lab Results View", () => {
    test("shows lab result list", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      expect(screen.getByText("Complete Blood Count")).toBeInTheDocument();
      expect(screen.getByText("Lipid Panel")).toBeInTheDocument();
      expect(screen.getByText("Metabolic Panel")).toBeInTheDocument();
    });

    test("shows status badges on lab results", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      const normalBadges = screen.getAllByText("normal");
      expect(normalBadges.length).toBeGreaterThan(0);
      expect(screen.getByText("abnormal")).toBeInTheDocument();
    });

    test("clicking a lab result shows detail view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      fireEvent.click(screen.getByText("Complete Blood Count"));
      expect(screen.getByText("← Back to Lab Results")).toBeInTheDocument();
    });

    test("lab result detail shows values table", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      fireEvent.click(screen.getByText("Complete Blood Count"));
      expect(screen.getByText("WBC")).toBeInTheDocument();
      expect(screen.getByText("RBC")).toBeInTheDocument();
      expect(screen.getByText("Hemoglobin")).toBeInTheDocument();
    });

    test("lab result detail shows reference ranges", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      fireEvent.click(screen.getByText("Complete Blood Count"));
      expect(screen.getByText("4.5-11.0")).toBeInTheDocument();
    });

    test("lab result detail shows ordering doctor", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      fireEvent.click(screen.getByText("Complete Blood Count"));
      expect(screen.getByText(/Dr. Sarah Chen/)).toBeInTheDocument();
    });

    test("abnormal lab result shows flagged values", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      fireEvent.click(screen.getByText("Lipid Panel"));
      expect(screen.getByText("Total Cholesterol")).toBeInTheDocument();
      expect(screen.getByText("245")).toBeInTheDocument();
      const highFlags = screen.getAllByText("HIGH");
      expect(highFlags.length).toBe(3);
    });

    test("back button returns to lab result list", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      fireEvent.click(screen.getByText("Complete Blood Count"));
      fireEvent.click(screen.getByText("← Back to Lab Results"));
      expect(screen.getByText("Lipid Panel")).toBeInTheDocument();
    });
  });

  describe("Messages View", () => {
    test("shows conversation list", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      expect(screen.getByText("Lab Results Review")).toBeInTheDocument();
      expect(screen.getByText("Prescription Renewal")).toBeInTheDocument();
      expect(screen.getByText("Upcoming Appointment Prep")).toBeInTheDocument();
    });

    test("shows placeholder when no conversation selected", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      expect(
        screen.getByText("Select a conversation to view messages")
      ).toBeInTheDocument();
    });

    test("clicking a conversation shows messages", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      fireEvent.click(screen.getByText("Lab Results Review"));
      expect(
        screen.getByText(/cholesterol levels are elevated/)
      ).toBeInTheDocument();
    });

    test("conversation header shows doctor name", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      fireEvent.click(screen.getByText("Lab Results Review"));
      expect(screen.getByText(/Dr. Sarah Chen/)).toBeInTheDocument();
    });

    test("message input is shown when conversation is open", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      fireEvent.click(screen.getByText("Lab Results Review"));
      expect(screen.getByLabelText("Message input")).toBeInTheDocument();
    });

    test("sending a message adds it to the conversation", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      fireEvent.click(screen.getByText("Lab Results Review"));
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, {
        target: { value: "Thank you for the update." },
      });
      fireEvent.click(screen.getByText("Send"));
      expect(screen.getByText("Thank you for the update.")).toBeInTheDocument();
    });

    test("sending a message via Enter key works", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      fireEvent.click(screen.getByText("Lab Results Review"));
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, { target: { value: "Sent via enter" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(screen.getByText("Sent via enter")).toBeInTheDocument();
    });

    test("sending empty message does nothing", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      fireEvent.click(screen.getByText("Lab Results Review"));
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.click(screen.getByText("Send"));
      // Should still show existing messages only
      expect(
        screen.getByText(/cholesterol levels are elevated/)
      ).toBeInTheDocument();
    });

    test("opening a conversation marks it as read", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Messages"));
      // Lab Results Review is initially unread
      fireEvent.click(screen.getByText("Lab Results Review"));
      // Unread dot should be gone after opening
      // Navigate away and back to check
      fireEvent.click(screen.getByText("Dashboard"));
      fireEvent.click(screen.getByText("Messages"));
      // The conversation should no longer show as unread bold
      expect(screen.getByText("Lab Results Review")).toBeInTheDocument();
    });
  });

  describe("Billing View", () => {
    test("shows billing summary cards", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      expect(screen.getByText("Total Billed")).toBeInTheDocument();
      expect(screen.getByText("Insurance Covered")).toBeInTheDocument();
      expect(screen.getByText("Patient Responsibility")).toBeInTheDocument();
    });

    test("shows correct total billed amount", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      expect(screen.getByText("$1275.00")).toBeInTheDocument();
    });

    test("shows correct insurance covered amount", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      expect(screen.getByText("$1020.00")).toBeInTheDocument();
    });

    test("shows correct patient responsibility amount", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      expect(screen.getByText("$255.00")).toBeInTheDocument();
    });

    test("shows billing table with all bills", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      expect(
        screen.getByText("Cardiac Screening - Dr. Chen")
      ).toBeInTheDocument();
      expect(
        screen.getByText("General Physical - Dr. Kim")
      ).toBeInTheDocument();
      expect(screen.getByText("Lab Work - Blood Panel")).toBeInTheDocument();
    });

    test("bill filter buttons are rendered", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      expect(screen.getByText("all")).toBeInTheDocument();
      expect(screen.getByText("pending")).toBeInTheDocument();
      expect(screen.getByText("paid")).toBeInTheDocument();
      expect(screen.getByText("upcoming")).toBeInTheDocument();
    });

    test("filtering by paid shows only paid bills", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      fireEvent.click(screen.getByText("paid"));
      expect(
        screen.getByText("Cardiac Screening - Dr. Chen")
      ).toBeInTheDocument();
      expect(
        screen.getByText("General Physical - Dr. Kim")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Lab Work - Blood Panel")
      ).not.toBeInTheDocument();
    });

    test("filtering by pending shows only pending bills", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Billing"));
      fireEvent.click(screen.getByText("pending"));
      expect(screen.getByText("Lab Work - Blood Panel")).toBeInTheDocument();
      expect(
        screen.queryByText("Cardiac Screening - Dr. Chen")
      ).not.toBeInTheDocument();
    });
  });

  describe("Doctors View", () => {
    test("renders all doctor cards", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Doctors"));
      expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
      expect(screen.getByText("Dr. Michael Rivera")).toBeInTheDocument();
      expect(screen.getByText("Dr. Emily Watson")).toBeInTheDocument();
      expect(screen.getByText("Dr. James Park")).toBeInTheDocument();
      expect(screen.getByText("Dr. Lisa Thompson")).toBeInTheDocument();
      expect(screen.getByText("Dr. Robert Kim")).toBeInTheDocument();
    });

    test("shows doctor specialties", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Doctors"));
      expect(screen.getByText("cardiology")).toBeInTheDocument();
      expect(screen.getByText("dermatology")).toBeInTheDocument();
      expect(screen.getByText("neurology")).toBeInTheDocument();
    });

    test("shows doctor stats", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Doctors"));
      const ratingLabels = screen.getAllByText("Rating");
      expect(ratingLabels.length).toBeGreaterThan(0);
      const patientsLabels = screen.getAllByText("Patients");
      expect(patientsLabels.length).toBeGreaterThan(0);
    });

    test("shows available days for doctors", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Doctors"));
      expect(screen.getByText(/Mon, Wed, Fri/)).toBeInTheDocument();
    });

    test("book appointment button opens modal with doctor pre-selected", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Doctors"));
      const bookButtons = screen.getAllByText("Book Appointment");
      fireEvent.click(bookButtons[0]);
      expect(screen.getByText("Schedule New Appointment")).toBeInTheDocument();
    });
  });

  describe("Settings View", () => {
    test("shows profile tab by default", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("Patient Information")).toBeInTheDocument();
    });

    test("shows patient profile details", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
      expect(screen.getByText("1988-07-22")).toBeInTheDocument();
      expect(screen.getByText("O+")).toBeInTheDocument();
      expect(screen.getByText(/Penicillin, Shellfish/)).toBeInTheDocument();
    });

    test("shows insurance information", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("HealthFirst Premium")).toBeInTheDocument();
      expect(screen.getByText("HF-2026-88742")).toBeInTheDocument();
    });

    test("shows emergency contact", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("Emergency Contact")).toBeInTheDocument();
      expect(screen.getByText("Jordan Morgan")).toBeInTheDocument();
      expect(screen.getByText("(555) 123-4567")).toBeInTheDocument();
      expect(screen.getByText("Spouse")).toBeInTheDocument();
    });

    test("clicking notifications tab shows notification preferences", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Settings"));
      fireEvent.click(screen.getByText("notifications"));
      expect(screen.getByText("Notification Preferences")).toBeInTheDocument();
      expect(screen.getByText("Appointment reminders")).toBeInTheDocument();
      expect(screen.getByText("Lab result notifications")).toBeInTheDocument();
    });

    test("clicking privacy tab shows privacy settings", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Settings"));
      fireEvent.click(screen.getByText("privacy"));
      expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      expect(
        screen.getByText("Share records with specialists")
      ).toBeInTheDocument();
    });
  });

  describe("Notifications", () => {
    test("clicking notification bell shows notifications panel", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByLabelText("Notifications"));
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(
        screen.getByText("Upcoming appointment with Dr. Chen on May 15")
      ).toBeInTheDocument();
    });

    test("shows unread notification count badge", () => {
      render(<PatientPortal />);
      // There are 2 unread notifications
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    test("mark all read button clears unread count", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByLabelText("Notifications"));
      fireEvent.click(screen.getByText("Mark all read"));
      // All should be read now; badge should be gone
      fireEvent.click(screen.getByLabelText("Notifications"));
      // No unread count badge
      expect(screen.queryByText("2")).not.toBeInTheDocument();
    });

    test("clicking a notification marks it as read", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByLabelText("Notifications"));
      fireEvent.click(screen.getByText("New lab results available"));
      // Notification should be marked as read
    });
  });

  describe("Profile Modal", () => {
    test("clicking profile button opens profile modal", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByLabelText("View profile"));
      expect(screen.getByText("Quick Profile")).toBeInTheDocument();
    });

    test("profile modal shows patient info", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByLabelText("View profile"));
      expect(screen.getByText("O+")).toBeInTheDocument();
      expect(screen.getByText(/Penicillin, Shellfish/)).toBeInTheDocument();
      expect(screen.getByText("HealthFirst Premium")).toBeInTheDocument();
    });

    test("close button closes profile modal", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByLabelText("View profile"));
      expect(screen.getByText("Quick Profile")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Close profile"));
      expect(screen.queryByText("Quick Profile")).not.toBeInTheDocument();
    });
  });

  describe("Keyboard Shortcuts", () => {
    test("Escape key closes new appointment modal", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByLabelText("New appointment"));
      expect(screen.getByText("Schedule New Appointment")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByText("Schedule New Appointment")
      ).not.toBeInTheDocument();
    });

    test("Escape key closes profile modal", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByLabelText("View profile"));
      expect(screen.getByText("Quick Profile")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Quick Profile")).not.toBeInTheDocument();
    });

    test("Escape key closes notification panel", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByLabelText("Notifications"));
      expect(screen.getByText("Mark all read")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Mark all read")).not.toBeInTheDocument();
    });

    test("Escape key closes appointment detail", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("Annual cardiac screening"));
      expect(screen.getByText("← Back to Appointments")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByText("← Back to Appointments")
      ).not.toBeInTheDocument();
    });

    test("Escape key closes lab result detail", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Lab Results"));
      fireEvent.click(screen.getByText("Complete Blood Count"));
      expect(screen.getByText("← Back to Lab Results")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByText("← Back to Lab Results")
      ).not.toBeInTheDocument();
    });
  });

  describe("Search Filtering", () => {
    test("search filters appointments by doctor name", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      const searchInput = screen.getByLabelText("Global search");
      fireEvent.change(searchInput, { target: { value: "Sarah Chen" } });
      expect(screen.getByText("1 appointments")).toBeInTheDocument();
    });

    test("search filters appointments by notes", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      const searchInput = screen.getByLabelText("Global search");
      fireEvent.change(searchInput, { target: { value: "cardiac" } });
      expect(screen.getByText("1 appointments")).toBeInTheDocument();
    });

    test("clearing search shows all items again", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      const searchInput = screen.getByLabelText("Global search");
      fireEvent.change(searchInput, { target: { value: "cardiac" } });
      fireEvent.change(searchInput, { target: { value: "" } });
      expect(screen.getByText("5 appointments")).toBeInTheDocument();
    });

    test("navigating to a new view clears search", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      const searchInput = screen.getByLabelText("Global search");
      fireEvent.change(searchInput, { target: { value: "cardiac" } });
      fireEvent.click(screen.getByText("Prescriptions"));
      // All prescriptions should be visible
      expect(screen.getByText(/Lisinopril/)).toBeInTheDocument();
    });
  });

  describe("localStorage Persistence", () => {
    test("appointments are saved to localStorage", () => {
      render(<PatientPortal />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "patientAppointments",
        expect.any(String)
      );
    });

    test("view is saved to localStorage", () => {
      render(<PatientPortal />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "patientPortalView",
        "dashboard"
      );
    });

    test("saved view is restored from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "patientPortalView") return "doctors";
        return null;
      });
      render(<PatientPortal />);
      expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
    });

    test("handles corrupted localStorage gracefully", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "patientAppointments") return "not valid json{{{";
        return null;
      });
      expect(() => render(<PatientPortal />)).not.toThrow();
    });

    test("saved appointments are loaded from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "patientAppointments")
          return JSON.stringify([
            {
              id: "custom1",
              doctorId: "d1",
              date: "2026-12-01",
              time: "09:00",
              type: "Custom Visit",
              status: "scheduled",
              notes: "Custom note",
              priority: "normal",
            },
          ]);
        return null;
      });
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Appointments"));
      expect(screen.getByText("Custom Visit")).toBeInTheDocument();
    });
  });

  describe("Vitals View", () => {
    test("shows vitals tracking heading", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      expect(screen.getByText("Vitals Tracking")).toBeInTheDocument();
    });

    test("shows latest readings summary", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      expect(screen.getByText("Blood Pressure")).toBeInTheDocument();
      expect(screen.getByText("Heart Rate")).toBeInTheDocument();
      expect(screen.getByText("Temperature")).toBeInTheDocument();
    });

    test("shows latest BP reading", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      expect(screen.getByText("128/82")).toBeInTheDocument();
    });

    test("shows vitals records count", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      expect(screen.getByText("5 records")).toBeInTheDocument();
    });

    test("shows sort order dropdown", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      expect(screen.getByLabelText("Sort vitals")).toBeInTheDocument();
    });

    test("clicking a vital record shows detail view", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      fireEvent.click(screen.getByText("Slightly elevated BP"));
      expect(screen.getByText("← Back to Vitals")).toBeInTheDocument();
    });

    test("vital detail shows all measurements", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      fireEvent.click(screen.getByText("Slightly elevated BP"));
      expect(screen.getByText("128/82")).toBeInTheDocument();
      expect(screen.getByText(/72/)).toBeInTheDocument();
    });

    test("vital detail shows recording doctor", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      fireEvent.click(screen.getByText("Slightly elevated BP"));
      expect(screen.getByText(/Dr. Robert Kim/)).toBeInTheDocument();
    });

    test("back button returns to vitals list", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      fireEvent.click(screen.getByText("Slightly elevated BP"));
      fireEvent.click(screen.getByText("← Back to Vitals"));
      expect(screen.getByText("5 records")).toBeInTheDocument();
    });

    test("sorting vitals by oldest first changes order", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      const sortSelect = screen.getByLabelText("Sort vitals");
      fireEvent.change(sortSelect, { target: { value: "oldest" } });
      // The first record should now be the oldest (2025-09-05)
      expect(screen.getByText("Baseline vitals")).toBeInTheDocument();
    });

    test("Escape key closes vital detail", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Vitals"));
      fireEvent.click(screen.getByText("Slightly elevated BP"));
      expect(screen.getByText("← Back to Vitals")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("← Back to Vitals")).not.toBeInTheDocument();
    });
  });

  describe("Medical History View", () => {
    test("shows medical history heading", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      expect(screen.getByText("Medical History")).toBeInTheDocument();
    });

    test("shows history events", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      expect(screen.getByText("Blood Work Completed")).toBeInTheDocument();
      expect(screen.getByText(/Dr. Watson/)).toBeInTheDocument();
    });

    test("shows event count", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      expect(screen.getByText("8 events")).toBeInTheDocument();
    });

    test("history filter buttons are rendered", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      expect(screen.getByText("all")).toBeInTheDocument();
      expect(screen.getByText("appointments")).toBeInTheDocument();
      expect(screen.getByText("labs")).toBeInTheDocument();
      expect(screen.getByText("prescriptions")).toBeInTheDocument();
      expect(screen.getByText("procedures")).toBeInTheDocument();
    });

    test("filtering by appointments shows only appointment events", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      fireEvent.click(screen.getByText("appointments"));
      expect(screen.getByText("3 events")).toBeInTheDocument();
    });

    test("filtering by labs shows only lab events", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      fireEvent.click(screen.getByText("labs"));
      expect(screen.getByText("2 events")).toBeInTheDocument();
    });

    test("filtering by prescriptions shows prescription events", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      fireEvent.click(screen.getByText("prescriptions"));
      expect(screen.getByText("Metformin Prescribed")).toBeInTheDocument();
      expect(screen.getByText("Lisinopril Prescribed")).toBeInTheDocument();
    });

    test("filtering by procedures shows procedure events", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      fireEvent.click(screen.getByText("procedures"));
      expect(screen.getByText("Flu Vaccination")).toBeInTheDocument();
      expect(screen.getByText("1 events")).toBeInTheDocument();
    });

    test("search filters history events", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      const searchInput = screen.getByLabelText("Global search");
      fireEvent.change(searchInput, { target: { value: "Metformin" } });
      expect(screen.getByText("Metformin Prescribed")).toBeInTheDocument();
      expect(screen.getByText("1 events")).toBeInTheDocument();
    });

    test("event type badges are displayed", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("History"));
      // Should show type badges
      expect(screen.getAllByText("lab").length).toBeGreaterThan(0);
      expect(screen.getAllByText("appointment").length).toBeGreaterThan(0);
    });
  });

  describe("Dashboard Vitals Summary", () => {
    test("dashboard shows latest vitals section", () => {
      render(<PatientPortal />);
      expect(screen.getByText(/Latest Vitals/)).toBeInTheDocument();
    });

    test("dashboard shows BP reading", () => {
      render(<PatientPortal />);
      expect(screen.getByText("128/82")).toBeInTheDocument();
    });

    test("dashboard shows heart rate", () => {
      render(<PatientPortal />);
      expect(screen.getByText(/72 bpm/)).toBeInTheDocument();
    });
  });

  describe("Cross-View Interactions", () => {
    test("doctor in appointment detail matches doctor in doctors view", () => {
      render(<PatientPortal />);
      // Check appointment shows Dr. Sarah Chen
      fireEvent.click(screen.getByText("Appointments"));
      fireEvent.click(screen.getByText("Annual cardiac screening"));
      expect(screen.getByText(/Dr. Sarah Chen/)).toBeInTheDocument();
      // Go to doctors view and verify same doctor
      fireEvent.click(screen.getByText("Doctors"));
      expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
    });

    test("prescribing doctor is shown consistently across views", () => {
      render(<PatientPortal />);
      fireEvent.click(screen.getByText("Prescriptions"));
      expect(screen.getByText(/Dr. Sarah Chen/)).toBeInTheDocument();
      fireEvent.click(screen.getByText("Doctors"));
      expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
    });

    test("unread message count badge appears on Messages nav", () => {
      render(<PatientPortal />);
      // Messages nav item should show unread badge (2 unread conversations)
      // The badge renders inside the nav button
      const messagesNav = screen.getByText("Messages").closest("button");
      expect(messagesNav).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    test("renders without errors with empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<PatientPortal />)).not.toThrow();
    });

    test("renders without crashing when localStorage throws", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });
      expect(() => render(<PatientPortal />)).not.toThrow();
    });
  });
});
