import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import ConferenceManager from "./src/app/page.jsx";

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

describe("ConferenceManager Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe("Initial Rendering", () => {
    test("renders sidebar with ConfHub title", () => {
      render(<ConferenceManager />);
      expect(screen.getByText("ConfHub")).toBeInTheDocument();
    });

    test("renders sidebar navigation items", () => {
      render(<ConferenceManager />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Speakers")).toBeInTheDocument();
      expect(screen.getByText("Sessions")).toBeInTheDocument();
      expect(screen.getByText("Schedule")).toBeInTheDocument();
      expect(screen.getByText("Attendees")).toBeInTheDocument();
      expect(screen.getByText("Venues")).toBeInTheDocument();
    });

    test("renders search input with placeholder", () => {
      render(<ConferenceManager />);
      expect(
        screen.getByPlaceholderText("Search... (Ctrl+K)")
      ).toBeInTheDocument();
    });

    test("renders dashboard view by default", () => {
      render(<ConferenceManager />);
      expect(screen.getByText("Conference Dashboard")).toBeInTheDocument();
    });

    test("renders dashboard stat cards", () => {
      render(<ConferenceManager />);
      expect(screen.getByText("Total Attendees")).toBeInTheDocument();
      expect(screen.getByText("Speakers")).toBeInTheDocument();
      expect(screen.getByText("Sessions")).toBeInTheDocument();
      expect(screen.getByText("Avg Rating")).toBeInTheDocument();
    });

    test("renders track distribution section", () => {
      render(<ConferenceManager />);
      expect(screen.getByText("Track Distribution")).toBeInTheDocument();
    });

    test("renders venue utilization section", () => {
      render(<ConferenceManager />);
      expect(screen.getByText("Venue Utilization")).toBeInTheDocument();
    });

    test("renders checked-in count in sidebar", () => {
      render(<ConferenceManager />);
      expect(screen.getByText(/checked in/)).toBeInTheDocument();
    });

    test("renders confirmed speakers count in sidebar", () => {
      render(<ConferenceManager />);
      expect(screen.getByText(/speakers confirmed/)).toBeInTheDocument();
    });
  });

  describe("Theme Toggling", () => {
    test("renders theme toggle button", () => {
      render(<ConferenceManager />);
      expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    });

    test("toggling theme saves to localStorage", () => {
      render(<ConferenceManager />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "confManagerTheme",
        "dark"
      );
    });

    test("toggling theme twice returns to light mode", () => {
      render(<ConferenceManager />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "confManagerTheme",
        "light"
      );
    });

    test("loads dark theme from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "confManagerTheme") return "dark";
        return null;
      });
      render(<ConferenceManager />);
      expect(screen.getByText("☀️")).toBeInTheDocument();
    });
  });

  describe("Sidebar Navigation", () => {
    test("clicking Dashboard shows dashboard view", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Dashboard"));
      expect(screen.getByText("Conference Dashboard")).toBeInTheDocument();
    });

    test("clicking Speakers shows speakers list", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
      expect(screen.getByText("Marcus Johnson")).toBeInTheDocument();
    });

    test("clicking Sessions shows sessions list", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      expect(
        screen.getByText("The Future of React Server Components")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Building Real-Time Data Pipelines")
      ).toBeInTheDocument();
    });

    test("clicking Schedule shows schedule grid", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Schedule"));
      expect(screen.getByText("Schedule Grid")).toBeInTheDocument();
    });

    test("clicking Attendees shows attendee table", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
      expect(screen.getByText("Blake Kim")).toBeInTheDocument();
    });

    test("clicking Venues shows venue cards", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Venues"));
      expect(screen.getByText("Grand Hall A")).toBeInTheDocument();
      expect(screen.getByText("Workshop Room 1")).toBeInTheDocument();
    });

    test("saves active view to localStorage on navigation", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "confManagerView",
        "speakers"
      );
    });
  });

  describe("Sidebar Collapse/Expand", () => {
    test("renders toggle sidebar button", () => {
      render(<ConferenceManager />);
      expect(screen.getByLabelText("Toggle sidebar")).toBeInTheDocument();
    });

    test("collapsing sidebar hides navigation labels", () => {
      render(<ConferenceManager />);
      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Speakers")).not.toBeInTheDocument();
    });

    test("expanding sidebar shows navigation labels again", () => {
      render(<ConferenceManager />);
      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  describe("Speakers View", () => {
    test("displays all speakers with their companies", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
      expect(screen.getByText(/TechCorp/)).toBeInTheDocument();
      expect(screen.getByText("Marcus Johnson")).toBeInTheDocument();
      expect(screen.getByText(/DataFlow/)).toBeInTheDocument();
    });

    test("shows speaker count in header", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      expect(screen.getByText(/Speakers \(8\)/)).toBeInTheDocument();
    });

    test("shows Add Speaker button", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      expect(screen.getByText("+ Add Speaker")).toBeInTheDocument();
    });

    test("shows confirmation status badges", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      const confirmedBadges = screen.getAllByText("Confirmed");
      const pendingBadges = screen.getAllByText("Pending");
      expect(confirmedBadges.length).toBeGreaterThan(0);
      expect(pendingBadges.length).toBeGreaterThan(0);
    });

    test("shows expertise tags on speaker cards", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      expect(screen.getAllByText("frontend").length).toBeGreaterThan(0);
      expect(screen.getAllByText("backend").length).toBeGreaterThan(0);
    });

    test("filter by confirmed status", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      const statusFilter = screen.getByLabelText("Filter by confirmation");
      fireEvent.change(statusFilter, { target: { value: "pending" } });
      // Aisha Williams and Tom Nakamura are pending
      expect(screen.getByText("Aisha Williams")).toBeInTheDocument();
      expect(screen.getByText("Tom Nakamura")).toBeInTheDocument();
      expect(screen.queryByText("Sarah Chen")).not.toBeInTheDocument();
    });

    test("search filters speakers by name", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      const searchInput = screen.getByPlaceholderText("Search... (Ctrl+K)");
      fireEvent.change(searchInput, { target: { value: "Sarah" } });
      expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
      expect(screen.queryByText("Marcus Johnson")).not.toBeInTheDocument();
    });

    test("search filters speakers by company", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      const searchInput = screen.getByPlaceholderText("Search... (Ctrl+K)");
      fireEvent.change(searchInput, { target: { value: "TechCorp" } });
      expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    });

    test("search filters speakers by expertise", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      const searchInput = screen.getByPlaceholderText("Search... (Ctrl+K)");
      fireEvent.change(searchInput, { target: { value: "security" } });
      expect(screen.getByText("Priya Patel")).toBeInTheDocument();
      expect(screen.getByText("Fatima Al-Rashid")).toBeInTheDocument();
    });
  });

  describe("Speaker Detail Modal", () => {
    test("clicking a speaker card opens detail modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      expect(
        screen.getByText(/Principal engineer at TechCorp/)
      ).toBeInTheDocument();
    });

    test("speaker detail shows bio", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      expect(screen.getByText(/Modern Frontend Patterns/)).toBeInTheDocument();
    });

    test("speaker detail shows twitter handle", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      expect(screen.getByText("@sarahcodes")).toBeInTheDocument();
    });

    test("speaker detail shows assigned sessions", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      expect(screen.getByText(/Assigned Sessions/)).toBeInTheDocument();
      expect(
        screen.getByText("The Future of React Server Components")
      ).toBeInTheDocument();
      expect(screen.getByText("Design Systems That Scale")).toBeInTheDocument();
    });

    test("speaker detail shows email", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      expect(screen.getByText(/sarah@tech.io/)).toBeInTheDocument();
    });

    test("close button closes speaker detail", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      expect(
        screen.getByText(/Principal engineer at TechCorp/)
      ).toBeInTheDocument();
      fireEvent.click(screen.getByText("×"));
      expect(
        screen.queryByText(/Principal engineer at TechCorp/)
      ).not.toBeInTheDocument();
    });

    test("confirm/unconfirm toggle works", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      // Sarah is confirmed, so button should say "Unconfirm"
      expect(screen.getByText("Unconfirm")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Unconfirm"));
      // After unconfirming, button text should change
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
  });

  describe("Speaker CRUD", () => {
    test("Add Speaker button opens create modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("+ Add Speaker"));
      expect(screen.getByText("Add New Speaker")).toBeInTheDocument();
    });

    test("create speaker form has required fields", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("+ Add Speaker"));
      expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter company")).toBeInTheDocument();
    });

    test("cancel button closes create speaker modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("+ Add Speaker"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("Add New Speaker")).not.toBeInTheDocument();
    });

    test("deleting a speaker requires confirmation", () => {
      window.confirm.mockReturnValue(false);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      fireEvent.click(screen.getByText("Remove"));
      expect(window.confirm).toHaveBeenCalled();
    });

    test("confirming delete removes speaker from list", () => {
      window.confirm.mockReturnValue(true);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Sarah Chen"));
      fireEvent.click(screen.getByText("Remove"));
      expect(screen.queryByText("Sarah Chen")).not.toBeInTheDocument();
    });
  });

  describe("Sessions View", () => {
    test("displays all sessions", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      expect(
        screen.getByText("The Future of React Server Components")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Building Real-Time Data Pipelines")
      ).toBeInTheDocument();
    });

    test("shows session count in header", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      expect(screen.getByText(/Sessions \(10\)/)).toBeInTheDocument();
    });

    test("shows Add Session button", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      expect(screen.getByText("+ Add Session")).toBeInTheDocument();
    });

    test("shows conflicts button with count", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const conflictsButton = screen.getByText(/Conflicts/);
      expect(conflictsButton).toBeInTheDocument();
    });

    test("shows session type badges", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const keynoteBadges = screen.getAllByText("keynote");
      expect(keynoteBadges.length).toBeGreaterThan(0);
    });

    test("shows session track badges", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const frontendBadges = screen.getAllByText("frontend");
      expect(frontendBadges.length).toBeGreaterThan(0);
    });

    test("shows speaker names on session cards", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      expect(screen.getByText(/Sarah Chen/)).toBeInTheDocument();
    });

    test("shows capacity progress on session cards", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const fullIndicators = screen.getAllByText(/% full/);
      expect(fullIndicators.length).toBeGreaterThan(0);
    });

    test("filter sessions by track", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const trackFilter = screen.getByLabelText("Filter by track");
      fireEvent.change(trackFilter, { target: { value: "security" } });
      expect(
        screen.getByText("Securing AI/ML Models in Production")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("The Future of React Server Components")
      ).not.toBeInTheDocument();
    });

    test("filter sessions by day", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const dayFilter = screen.getByLabelText("Filter by day");
      fireEvent.change(dayFilter, { target: { value: "2" } });
      expect(
        screen.getByText("Cross-Platform Mobile Architecture")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("The Future of React Server Components")
      ).not.toBeInTheDocument();
    });

    test("filter sessions by type", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const typeFilter = screen.getByLabelText("Filter by type");
      fireEvent.change(typeFilter, { target: { value: "workshop" } });
      expect(
        screen.getByText("Kubernetes at Scale: Lessons Learned")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Accessible Component Patterns")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("The Future of React Server Components")
      ).not.toBeInTheDocument();
    });

    test("search filters sessions by title", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const searchInput = screen.getByPlaceholderText("Search... (Ctrl+K)");
      fireEvent.change(searchInput, { target: { value: "Kubernetes" } });
      expect(
        screen.getByText("Kubernetes at Scale: Lessons Learned")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("The Future of React Server Components")
      ).not.toBeInTheDocument();
    });

    test("search filters sessions by tag", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const searchInput = screen.getByPlaceholderText("Search... (Ctrl+K)");
      fireEvent.change(searchInput, { target: { value: "kafka" } });
      expect(
        screen.getByText("Building Real-Time Data Pipelines")
      ).toBeInTheDocument();
    });
  });

  describe("Session Detail Modal", () => {
    test("clicking a session opens detail modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(
        screen.getByText(/Deep dive into RSC architecture/)
      ).toBeInTheDocument();
    });

    test("session detail shows speakers", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      // The modal should list the speaker
      const modal = screen
        .getByText(/Deep dive into RSC architecture/)
        .closest("div");
      expect(screen.getByText(/Speakers/)).toBeInTheDocument();
    });

    test("session detail shows venue details", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(screen.getByText("Venue Details")).toBeInTheDocument();
      expect(screen.getByText("Grand Hall A")).toBeInTheDocument();
    });

    test("session detail shows registered attendees", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(screen.getByText(/Registered Attendees/)).toBeInTheDocument();
      expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    });

    test("session detail shows tags", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(screen.getByText("#react")).toBeInTheDocument();
      expect(screen.getByText("#rsc")).toBeInTheDocument();
    });

    test("session detail shows feedback when available", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(screen.getByText("Best keynote ever!")).toBeInTheDocument();
    });

    test("close button closes session detail", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(
        screen.getByText(/Deep dive into RSC architecture/)
      ).toBeInTheDocument();
      const closeButton = screen.getByText("×");
      fireEvent.click(closeButton);
      expect(
        screen.queryByText(/Deep dive into RSC architecture/)
      ).not.toBeInTheDocument();
    });

    test("delete session requires confirmation", () => {
      window.confirm.mockReturnValue(false);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      fireEvent.click(screen.getByText("Delete"));
      expect(window.confirm).toHaveBeenCalled();
    });

    test("confirming delete removes session", () => {
      window.confirm.mockReturnValue(true);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      fireEvent.click(screen.getByText("Delete"));
      expect(
        screen.queryByText("The Future of React Server Components")
      ).not.toBeInTheDocument();
    });

    test("Add Feedback button opens feedback modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      fireEvent.click(screen.getByText("Add Feedback"));
      expect(screen.getByText("Submit Feedback")).toBeInTheDocument();
    });
  });

  describe("Session CRUD", () => {
    test("Add Session button opens create modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(screen.getByText("+ Add Session"));
      expect(screen.getByText("Create New Session")).toBeInTheDocument();
    });

    test("create session form has title field", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(screen.getByText("+ Add Session"));
      expect(screen.getByPlaceholderText("Session title")).toBeInTheDocument();
    });

    test("cancel button closes create session modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(screen.getByText("+ Add Session"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("Create New Session")).not.toBeInTheDocument();
    });
  });

  describe("Attendees View", () => {
    test("displays attendees in a table", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
      expect(screen.getByText("Blake Kim")).toBeInTheDocument();
    });

    test("shows attendee count in header", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      expect(screen.getByText(/Attendees \(10\)/)).toBeInTheDocument();
    });

    test("shows Register Attendee button", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      expect(screen.getByText("+ Register Attendee")).toBeInTheDocument();
    });

    test("shows tier badges on attendee rows", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      expect(screen.getAllByText("vip").length).toBeGreaterThan(0);
      expect(screen.getAllByText("general").length).toBeGreaterThan(0);
    });

    test("shows check-in status", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      expect(screen.getAllByText("Checked In").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Not Arrived").length).toBeGreaterThan(0);
    });

    test("shows Check In/Check Out buttons", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      expect(screen.getAllByText("Check In").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Check Out").length).toBeGreaterThan(0);
    });

    test("filter attendees by tier", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      const tierFilter = screen.getByLabelText("Filter by tier");
      fireEvent.change(tierFilter, { target: { value: "vip" } });
      expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
      expect(screen.getByText("Evan Tanaka")).toBeInTheDocument();
      expect(screen.queryByText("Blake Kim")).not.toBeInTheDocument();
    });

    test("search filters attendees by name", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      const searchInput = screen.getByPlaceholderText("Search... (Ctrl+K)");
      fireEvent.change(searchInput, { target: { value: "Alex" } });
      expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
      expect(screen.queryByText("Blake Kim")).not.toBeInTheDocument();
    });

    test("search filters attendees by company", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      const searchInput = screen.getByPlaceholderText("Search... (Ctrl+K)");
      fireEvent.change(searchInput, { target: { value: "DataLab" } });
      expect(screen.getByText("Fiona Zhang")).toBeInTheDocument();
    });

    test("check in toggle works from table", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      // Casey Jordan is not checked in, find their Check In button
      const caseyRow = screen.getByText("Casey Jordan").closest("tr");
      const checkInButton = within(caseyRow).getByText("Check In");
      fireEvent.click(checkInButton);
      // Casey should now be checked in
      expect(within(caseyRow).getByText("Checked In")).toBeInTheDocument();
    });
  });

  describe("Attendee Detail Modal", () => {
    test("clicking an attendee row opens detail modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      expect(screen.getByText(/StartupCo/)).toBeInTheDocument();
      expect(screen.getByText(/alex@startup.co/)).toBeInTheDocument();
    });

    test("attendee detail shows registered sessions", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      expect(screen.getByText(/Registered Sessions/)).toBeInTheDocument();
    });

    test("attendee detail shows dietary restrictions", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      expect(screen.getByText(/vegetarian/)).toBeInTheDocument();
    });

    test("attendee detail shows t-shirt size", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      expect(screen.getByText(/T-Shirt Size: M/)).toBeInTheDocument();
    });

    test("attendee detail shows available sessions", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      expect(screen.getByText("Available Sessions")).toBeInTheDocument();
    });

    test("unregister from session works", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      const unregisterButtons = screen.getAllByText("Unregister");
      const initialCount = unregisterButtons.length;
      fireEvent.click(unregisterButtons[0]);
      const newUnregisterButtons = screen.queryAllByText("Unregister");
      expect(newUnregisterButtons.length).toBe(initialCount - 1);
    });

    test("register for session works", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      const registerButtons = screen.getAllByText("Register");
      fireEvent.click(registerButtons[0]);
      // Should now have one fewer register button and one more unregister button
      const newRegisterButtons = screen.queryAllByText("Register");
      expect(newRegisterButtons.length).toBe(registerButtons.length - 1);
    });

    test("close button closes attendee detail", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      expect(screen.getByText(/alex@startup.co/)).toBeInTheDocument();
      const closeButtons = screen.getAllByText("×");
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText(/alex@startup.co/)).not.toBeInTheDocument();
    });

    test("delete attendee requires confirmation", () => {
      window.confirm.mockReturnValue(false);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      fireEvent.click(screen.getByText("Remove"));
      expect(window.confirm).toHaveBeenCalled();
    });

    test("confirming delete removes attendee", () => {
      window.confirm.mockReturnValue(true);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      fireEvent.click(screen.getByText("Remove"));
      expect(screen.queryByText("Alex Rivera")).not.toBeInTheDocument();
    });
  });

  describe("Attendee CRUD", () => {
    test("Register Attendee button opens create modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("+ Register Attendee"));
      expect(screen.getByText("Register New Attendee")).toBeInTheDocument();
    });

    test("create attendee form has required fields", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("+ Register Attendee"));
      expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });

    test("cancel button closes create attendee modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("+ Register Attendee"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(
        screen.queryByText("Register New Attendee")
      ).not.toBeInTheDocument();
    });
  });

  describe("Schedule Grid View", () => {
    test("shows Day 1 and Day 2 headers", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Schedule"));
      expect(screen.getByText("Day 1")).toBeInTheDocument();
      expect(screen.getByText("Day 2")).toBeInTheDocument();
    });

    test("shows venue names as column headers", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Schedule"));
      expect(screen.getAllByText("Grand Hall A").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Workshop Room 1").length).toBeGreaterThan(0);
    });

    test("shows time slots in grid", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Schedule"));
      expect(screen.getAllByText("09:00").length).toBeGreaterThan(0);
      expect(screen.getAllByText("13:00").length).toBeGreaterThan(0);
    });

    test("shows session titles in grid cells", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Schedule"));
      expect(
        screen.getByText("The Future of React Server Components")
      ).toBeInTheDocument();
    });

    test("clicking a session in grid opens session detail", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Schedule"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(
        screen.getByText(/Deep dive into RSC architecture/)
      ).toBeInTheDocument();
    });
  });

  describe("Venues View", () => {
    test("shows all venue cards", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Venues"));
      expect(screen.getByText("Grand Hall A")).toBeInTheDocument();
      expect(screen.getByText("Grand Hall B")).toBeInTheDocument();
      expect(screen.getByText("Workshop Room 1")).toBeInTheDocument();
      expect(screen.getByText("Panel Stage")).toBeInTheDocument();
    });

    test("shows venue capacity and floor", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Venues"));
      const capacityTexts = screen.getAllByText(/Capacity:/);
      expect(capacityTexts.length).toBeGreaterThan(0);
    });

    test("shows venue equipment tags", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Venues"));
      expect(screen.getAllByText("projector").length).toBeGreaterThan(0);
      expect(screen.getAllByText("microphone").length).toBeGreaterThan(0);
    });

    test("shows availability status", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Venues"));
      expect(screen.getAllByText("Available").length).toBeGreaterThan(0);
      expect(screen.getByText("Unavailable")).toBeInTheDocument();
    });

    test("shows session count per venue", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Venues"));
      const sessionCounts = screen.getAllByText(/session\(s\) booked/);
      expect(sessionCounts.length).toBeGreaterThan(0);
    });

    test("shows booked sessions under each venue", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Venues"));
      // Grand Hall A has 1 session (The Future of React Server Components)
      expect(
        screen.getByText(/The Future of React Server Components/)
      ).toBeInTheDocument();
    });
  });

  describe("Schedule Conflicts", () => {
    test("conflicts button opens conflicts modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      const conflictsButton = screen.getByText(/Conflicts/);
      fireEvent.click(conflictsButton);
      expect(screen.getByText(/Schedule Conflicts/)).toBeInTheDocument();
    });

    test("close button closes conflicts modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(screen.getByText(/Conflicts/));
      const closeButton = screen.getAllByText("×");
      fireEvent.click(closeButton[0]);
      // Modal should be closed
    });
  });

  describe("Feedback Modal", () => {
    test("feedback modal shows session title", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      fireEvent.click(screen.getByText("Add Feedback"));
      expect(screen.getByText("Submit Feedback")).toBeInTheDocument();
      expect(
        screen.getByText("The Future of React Server Components")
      ).toBeInTheDocument();
    });

    test("feedback modal has rating options", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      fireEvent.click(screen.getByText("Add Feedback"));
      expect(screen.getByLabelText("Rate 1 stars")).toBeInTheDocument();
      expect(screen.getByLabelText("Rate 5 stars")).toBeInTheDocument();
    });

    test("cancel button closes feedback modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      fireEvent.click(screen.getByText("Add Feedback"));
      // There may be multiple cancel buttons; find the one in the feedback modal
      const cancelButtons = screen.getAllByText("Cancel");
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText("Submit Feedback")).not.toBeInTheDocument();
    });
  });

  describe("Cross-Entity Relationships", () => {
    test("deleting a speaker removes them from session speaker lists", () => {
      window.confirm.mockReturnValue(true);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      // Delete Sarah Chen (who is assigned to sess1 and sess5)
      fireEvent.click(screen.getByText("Sarah Chen"));
      fireEvent.click(screen.getByText("Remove"));
      // Now check sess5 (Design Systems That Scale) which had Sarah Chen and Erik Lindqvist
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(screen.getByText("Design Systems That Scale"));
      // Should not show Sarah Chen anymore, but should still show Erik Lindqvist
      expect(screen.queryByText("Sarah Chen")).not.toBeInTheDocument();
      expect(screen.getByText("Erik Lindqvist")).toBeInTheDocument();
    });

    test("deleting a session removes it from speaker session lists", () => {
      window.confirm.mockReturnValue(true);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      // Delete "The Future of React Server Components" (sess1, assigned to Sarah Chen)
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      fireEvent.click(screen.getByText("Delete"));
      // Now check Sarah Chen's sessions
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      expect(screen.getByText(/Assigned Sessions \(1\)/)).toBeInTheDocument();
    });

    test("deleting an attendee removes them from session registered lists", () => {
      window.confirm.mockReturnValue(true);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Attendees"));
      // Delete Alex Rivera (registered for sess1, sess2, sess4, sess8, sess9)
      fireEvent.click(screen.getByText("Alex Rivera"));
      fireEvent.click(screen.getByText("Remove"));
      // Check sess1 attendee list
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(screen.queryByText("Alex Rivera")).not.toBeInTheDocument();
    });

    test("deleting a session removes it from attendee registered sessions", () => {
      window.confirm.mockReturnValue(true);
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      fireEvent.click(screen.getByText("Delete"));
      // Check Alex Rivera's registered sessions
      fireEvent.click(screen.getByText("Attendees"));
      fireEvent.click(screen.getByText("Alex Rivera"));
      // Should have 4 registered sessions instead of 5
      expect(screen.getByText(/Registered Sessions \(4\)/)).toBeInTheDocument();
    });
  });

  describe("Keyboard Shortcuts", () => {
    test("Escape key closes speaker detail modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("Sarah Chen"));
      expect(
        screen.getByText(/Principal engineer at TechCorp/)
      ).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByText(/Principal engineer at TechCorp/)
      ).not.toBeInTheDocument();
    });

    test("Escape key closes session detail modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(
        screen.getByText("The Future of React Server Components")
      );
      expect(
        screen.getByText(/Deep dive into RSC architecture/)
      ).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByText(/Deep dive into RSC architecture/)
      ).not.toBeInTheDocument();
    });

    test("Escape key closes create speaker modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Speakers"));
      fireEvent.click(screen.getByText("+ Add Speaker"));
      expect(screen.getByText("Add New Speaker")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Add New Speaker")).not.toBeInTheDocument();
    });

    test("Escape key closes conflicts modal", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByText("Sessions"));
      fireEvent.click(screen.getByText(/Conflicts/));
      fireEvent.keyDown(window, { key: "Escape" });
    });
  });

  describe("localStorage Persistence", () => {
    test("speakers are saved to localStorage", () => {
      render(<ConferenceManager />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "confSpeakers",
        expect.any(String)
      );
    });

    test("sessions are saved to localStorage", () => {
      render(<ConferenceManager />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "confSessions",
        expect.any(String)
      );
    });

    test("attendees are saved to localStorage", () => {
      render(<ConferenceManager />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "confAttendees",
        expect.any(String)
      );
    });

    test("saved view is restored from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "confManagerView") return "speakers";
        return null;
      });
      render(<ConferenceManager />);
      expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    });
  });

  describe("Notifications", () => {
    test("notification bell is rendered", () => {
      render(<ConferenceManager />);
      expect(screen.getByLabelText("Show notifications")).toBeInTheDocument();
    });

    test("clicking notification bell opens panel", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByLabelText("Show notifications"));
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    test("empty notifications show message", () => {
      render(<ConferenceManager />);
      fireEvent.click(screen.getByLabelText("Show notifications"));
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    test("renders without errors with empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<ConferenceManager />)).not.toThrow();
    });
  });
});
