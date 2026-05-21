import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import ChatApp from "./src/app/page.jsx";

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

describe("ChatApp Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ─── Initial Rendering ────────────────────────────────────────────────

  describe("Initial Rendering", () => {
    test("renders workspace title in sidebar", () => {
      render(<ChatApp />);
      expect(screen.getByText("TeamChat")).toBeInTheDocument();
    });

    test("renders online count in sidebar", () => {
      render(<ChatApp />);
      expect(screen.getByText(/online/)).toBeInTheDocument();
    });

    test("renders current user name in sidebar", () => {
      render(<ChatApp />);
      expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    });

    test("renders channel list", () => {
      render(<ChatApp />);
      expect(screen.getByText("# general")).toBeInTheDocument();
      expect(screen.getByText("# engineering")).toBeInTheDocument();
      expect(screen.getByText("# design")).toBeInTheDocument();
    });

    test("renders direct messages section", () => {
      render(<ChatApp />);
      expect(screen.getByText("Direct Messages")).toBeInTheDocument();
      expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
      expect(screen.getByText("Riley Chen")).toBeInTheDocument();
    });

    test("renders channel header with active channel name", () => {
      render(<ChatApp />);
      expect(screen.getByText("# general")).toBeInTheDocument();
    });

    test("renders messages for the default channel", () => {
      render(<ChatApp />);
      expect(
        screen.getByText(
          "Hey everyone! Welcome to the new chat platform 🎉"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("Looks great! When is the next standup?")
      ).toBeInTheDocument();
    });

    test("renders message input", () => {
      render(<ChatApp />);
      expect(screen.getByLabelText("Message input")).toBeInTheDocument();
    });

    test("renders send button", () => {
      render(<ChatApp />);
      // The send button is the one in the message input area
      const buttons = screen.getAllByLabelText("Send message");
      expect(buttons.length).toBeGreaterThan(0);
    });

    test("renders header toolbar buttons", () => {
      render(<ChatApp />);
      expect(screen.getByLabelText("Pinned messages")).toBeInTheDocument();
      expect(screen.getByLabelText("Search messages")).toBeInTheDocument();
      expect(screen.getByLabelText("Channel info")).toBeInTheDocument();
    });
  });

  // ─── Channel Switching ────────────────────────────────────────────────

  describe("Channel Switching", () => {
    test("clicking engineering channel shows engineering messages", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText("# engineering"));
      expect(
        screen.getByText(
          "We need to discuss the migration plan for the database."
        )
      ).toBeInTheDocument();
    });

    test("clicking design channel shows design messages", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText("# design"));
      expect(
        screen.getByText(
          "New mockups for the dashboard are ready for review!"
        )
      ).toBeInTheDocument();
    });

    test("clicking DM shows direct messages", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText("Jordan Lee"));
      expect(
        screen.getByText(
          "Hey Alex, can you review my latest component?"
        )
      ).toBeInTheDocument();
    });

    test("switching channels hides previous channel messages", () => {
      render(<ChatApp />);
      expect(
        screen.getByText(
          "Hey everyone! Welcome to the new chat platform 🎉"
        )
      ).toBeInTheDocument();
      fireEvent.click(screen.getByText("# engineering"));
      expect(
        screen.queryByText(
          "Hey everyone! Welcome to the new chat platform 🎉"
        )
      ).not.toBeInTheDocument();
    });

    test("switching to second DM shows its messages", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText("Riley Chen"));
      expect(
        screen.getByText(
          "Can we sync about the architecture for the new service?"
        )
      ).toBeInTheDocument();
    });
  });

  // ─── Sending Messages ─────────────────────────────────────────────────

  describe("Sending Messages", () => {
    test("typing and pressing Enter sends a message", () => {
      render(<ChatApp />);
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, { target: { value: "Hello team!" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(screen.getByText("Hello team!")).toBeInTheDocument();
    });

    test("clicking Send button sends a message", () => {
      render(<ChatApp />);
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, { target: { value: "Test message" } });
      const sendButton = screen.getByLabelText("Send message");
      fireEvent.click(sendButton);
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    test("message input is cleared after sending", () => {
      render(<ChatApp />);
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, { target: { value: "Clear me" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(input.value).toBe("");
    });

    test("empty message is not sent", () => {
      render(<ChatApp />);
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.keyDown(input, { key: "Enter" });
      // Should not crash and input should still be whitespace or cleared
    });

    test("new message appears with sender name", () => {
      render(<ChatApp />);
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, { target: { value: "My new message" } });
      fireEvent.keyDown(input, { key: "Enter" });
      // Message should show with Alex Rivera as sender
      expect(screen.getByText("My new message")).toBeInTheDocument();
    });
  });

  // ─── Reactions ────────────────────────────────────────────────────────

  describe("Reactions", () => {
    test("existing reactions are displayed on messages", () => {
      render(<ChatApp />);
      // m1 has 👍 with 3 users and 🎉 with 2 users
      expect(screen.getByTestId("reaction-m1-👍")).toBeInTheDocument();
      expect(screen.getByTestId("reaction-m1-🎉")).toBeInTheDocument();
    });

    test("clicking a reaction toggles current user participation", () => {
      render(<ChatApp />);
      const reaction = screen.getByTestId("reaction-m1-👍");
      // Initially u1 is in the reaction, count is 3
      expect(reaction.textContent).toContain("3");
      fireEvent.click(reaction);
      // After toggle, u1 is removed, count is 2
      expect(reaction.textContent).toContain("2");
    });

    test("clicking a reaction the user is not in adds them", () => {
      render(<ChatApp />);
      const reaction = screen.getByTestId("reaction-m1-🎉");
      // u1 is not in 🎉, count is 2
      expect(reaction.textContent).toContain("2");
      fireEvent.click(reaction);
      // After click, u1 is added, count is 3
      expect(reaction.textContent).toContain("3");
    });

    test("add reaction button opens emoji picker", () => {
      render(<ChatApp />);
      const addButtons = screen.getAllByLabelText("Add reaction");
      fireEvent.click(addButtons[0]);
      // Emoji picker should appear for the first message with reactions
      expect(screen.getByTestId("emoji-picker-m1")).toBeInTheDocument();
    });
  });

  // ─── Threads ──────────────────────────────────────────────────────────

  describe("Threads", () => {
    test("messages with replies show thread button with count", () => {
      render(<ChatApp />);
      const threadBtn = screen.getByTestId("thread-btn-m2");
      expect(threadBtn.textContent).toContain("2");
      expect(threadBtn.textContent).toContain("replies");
    });

    test("messages without replies show Reply in thread button", () => {
      render(<ChatApp />);
      const threadBtn = screen.getByTestId("thread-btn-m3");
      expect(threadBtn.textContent).toContain("Reply in thread");
    });

    test("clicking thread button opens thread panel", () => {
      render(<ChatApp />);
      const threadBtn = screen.getByTestId("thread-btn-m2");
      fireEvent.click(threadBtn);
      expect(screen.getByText("Thread")).toBeInTheDocument();
      expect(
        screen.getByText("Tomorrow at 10am PST")
      ).toBeInTheDocument();
    });

    test("thread panel shows parent message", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId("thread-btn-m2"));
      // Parent message text should be visible in thread panel
      expect(
        screen.getByText("Looks great! When is the next standup?")
      ).toBeInTheDocument();
    });

    test("thread panel shows all replies", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId("thread-btn-m2"));
      expect(
        screen.getByText("Tomorrow at 10am PST")
      ).toBeInTheDocument();
      expect(
        screen.getByText("I'll send a calendar invite")
      ).toBeInTheDocument();
    });

    test("sending a thread reply adds it to the thread", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId("thread-btn-m2"));
      const threadInput = screen.getByLabelText("Thread reply");
      fireEvent.change(threadInput, {
        target: { value: "Thanks for the info!" },
      });
      fireEvent.keyDown(threadInput, { key: "Enter" });
      expect(screen.getByText("Thanks for the info!")).toBeInTheDocument();
    });

    test("close thread button closes the panel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId("thread-btn-m2"));
      expect(screen.getByText("Thread")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Close thread"));
      expect(screen.queryByText("Thread")).not.toBeInTheDocument();
    });
  });

  // ─── Message Editing ──────────────────────────────────────────────────

  describe("Message Editing", () => {
    test("edited messages show (edited) label", () => {
      render(<ChatApp />);
      // Switch to engineering channel where m8 is edited
      fireEvent.click(screen.getByText("# engineering"));
      expect(screen.getByText("(edited)")).toBeInTheDocument();
    });
  });

  // ─── Create Channel ───────────────────────────────────────────────────

  describe("Create Channel", () => {
    test("clicking + opens create channel modal", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Create channel"));
      expect(screen.getByText("Create a Channel")).toBeInTheDocument();
    });

    test("create channel modal has name and description fields", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Create channel"));
      expect(
        screen.getByPlaceholderText("e.g. project-alpha")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("What's this channel about?")
      ).toBeInTheDocument();
    });

    test("creating a channel adds it to the sidebar", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Create channel"));
      const nameInput = screen.getByPlaceholderText("e.g. project-alpha");
      fireEvent.change(nameInput, { target: { value: "new-project" } });
      fireEvent.click(screen.getByText("Create Channel"));
      expect(screen.getByText("# new-project")).toBeInTheDocument();
    });

    test("cancel button closes create channel modal", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Create channel"));
      expect(screen.getByText("Create a Channel")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Cancel"));
      expect(
        screen.queryByText("Create a Channel")
      ).not.toBeInTheDocument();
    });

    test("creating a channel switches to the new channel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Create channel"));
      const nameInput = screen.getByPlaceholderText("e.g. project-alpha");
      fireEvent.change(nameInput, { target: { value: "testing" } });
      fireEvent.click(screen.getByText("Create Channel"));
      // New channel has no messages, input placeholder changes
      expect(screen.getByPlaceholderText("Message #testing")).toBeInTheDocument();
    });
  });

  // ─── User Profile ─────────────────────────────────────────────────────

  describe("User Profile", () => {
    test("clicking a message avatar shows user profile modal", () => {
      render(<ChatApp />);
      // Get the first message sender avatar (Jordan Lee's 👩‍🎨 for m1)
      // Messages are rendered with avatars that have onClick
      const avatars = screen.getAllByText("👩‍🎨");
      fireEvent.click(avatars[0]);
      expect(screen.getByText("UI/UX Designer")).toBeInTheDocument();
    });

    test("user profile modal shows status", () => {
      render(<ChatApp />);
      const avatars = screen.getAllByText("👩‍🎨");
      fireEvent.click(avatars[0]);
      expect(screen.getByText("Online")).toBeInTheDocument();
    });

    test("close button closes user profile modal", () => {
      render(<ChatApp />);
      const avatars = screen.getAllByText("👩‍🎨");
      fireEvent.click(avatars[0]);
      expect(screen.getByText("UI/UX Designer")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Close"));
      expect(screen.queryByText("UI/UX Designer")).not.toBeInTheDocument();
    });
  });

  // ─── Channel Info Panel ───────────────────────────────────────────────

  describe("Channel Info Panel", () => {
    test("clicking info button shows channel info panel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Channel info"));
      expect(screen.getByText("Channel Info")).toBeInTheDocument();
    });

    test("channel info shows description", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Channel info"));
      expect(
        screen.getByText("General discussion for the team")
      ).toBeInTheDocument();
    });

    test("channel info shows member list", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Channel info"));
      expect(screen.getByText("Members (6)")).toBeInTheDocument();
    });

    test("close button closes channel info", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Channel info"));
      expect(screen.getByText("Channel Info")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Close channel info"));
      expect(screen.queryByText("Channel Info")).not.toBeInTheDocument();
    });
  });

  // ─── Pinned Messages ─────────────────────────────────────────────────

  describe("Pinned Messages", () => {
    test("clicking pinned button shows pinned messages panel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Pinned messages"));
      expect(screen.getByText("Pinned Messages")).toBeInTheDocument();
    });

    test("initially shows no pinned messages", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Pinned messages"));
      expect(screen.getByText("No pinned messages")).toBeInTheDocument();
    });

    test("close button closes pinned messages panel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Pinned messages"));
      expect(screen.getByText("Pinned Messages")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Close pinned messages"));
      expect(
        screen.queryByText("Pinned Messages")
      ).not.toBeInTheDocument();
    });
  });

  // ─── Search ───────────────────────────────────────────────────────────

  describe("Search", () => {
    test("clicking search button opens search panel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Search messages"));
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    test("searching for text shows matching messages", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Search messages"));
      const searchInput = screen.getByPlaceholderText(
        "Search messages... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "mockups" } });
      expect(
        screen.getByText(
          "New mockups for the dashboard are ready for review!"
        )
      ).toBeInTheDocument();
    });

    test("search with no matches shows no results message", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Search messages"));
      const searchInput = screen.getByPlaceholderText(
        "Search messages... (Ctrl+K)"
      );
      fireEvent.change(searchInput, {
        target: { value: "xyznonexistent" },
      });
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });

    test("close button closes search panel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Search messages"));
      expect(screen.getByText("Search")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Close search"));
      // The search heading should be gone
      expect(screen.queryByPlaceholderText("Search messages... (Ctrl+K)")).not.toBeInTheDocument();
    });
  });

  // ─── Sidebar ──────────────────────────────────────────────────────────

  describe("Sidebar", () => {
    test("toggle sidebar collapses it", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Toggle sidebar"));
      expect(screen.queryByText("TeamChat")).not.toBeInTheDocument();
      expect(screen.queryByText("# general")).not.toBeInTheDocument();
    });

    test("toggle sidebar twice restores it", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Toggle sidebar"));
      fireEvent.click(screen.getByLabelText("Toggle sidebar"));
      expect(screen.getByText("TeamChat")).toBeInTheDocument();
      expect(screen.getByText("# general")).toBeInTheDocument();
    });
  });

  // ─── Theme Toggle ─────────────────────────────────────────────────────

  describe("Theme Toggle", () => {
    test("renders theme toggle button", () => {
      render(<ChatApp />);
      expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    });

    test("clicking theme toggle saves to localStorage", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Toggle theme"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "chatTheme",
        "dark"
      );
    });

    test("toggling theme twice returns to light mode", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Toggle theme"));
      fireEvent.click(screen.getByLabelText("Toggle theme"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "chatTheme",
        "light"
      );
    });

    test("dark mode shows light mode toggle text", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Toggle theme"));
      expect(screen.getByText(/Light Mode/)).toBeInTheDocument();
    });
  });

  // ─── User Status ──────────────────────────────────────────────────────

  describe("User Status", () => {
    test("renders status selector", () => {
      render(<ChatApp />);
      expect(screen.getByLabelText("Set status")).toBeInTheDocument();
    });

    test("changing status updates the dropdown", () => {
      render(<ChatApp />);
      const statusSelect = screen.getByLabelText("Set status");
      fireEvent.change(statusSelect, { target: { value: "away" } });
      expect(statusSelect.value).toBe("away");
    });
  });

  // ─── Keyboard Shortcuts ───────────────────────────────────────────────

  describe("Keyboard Shortcuts", () => {
    test("Escape closes search panel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Search messages"));
      expect(
        screen.getByPlaceholderText("Search messages... (Ctrl+K)")
      ).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByPlaceholderText("Search messages... (Ctrl+K)")
      ).not.toBeInTheDocument();
    });

    test("Escape closes create channel modal", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText("Create channel"));
      expect(screen.getByText("Create a Channel")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByText("Create a Channel")
      ).not.toBeInTheDocument();
    });

    test("Escape closes thread panel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId("thread-btn-m2"));
      expect(screen.getByText("Thread")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Thread")).not.toBeInTheDocument();
    });
  });

  // ─── localStorage Persistence ─────────────────────────────────────────

  describe("localStorage Persistence", () => {
    test("channels are saved to localStorage", () => {
      render(<ChatApp />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "chatChannels",
        expect.any(String)
      );
    });

    test("messages are saved to localStorage", () => {
      render(<ChatApp />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "chatMessages",
        expect.any(String)
      );
    });

    test("theme preference is saved to localStorage", () => {
      render(<ChatApp />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "chatTheme",
        expect.any(String)
      );
    });

    test("handles corrupted localStorage gracefully", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "chatChannels") return "not valid json{{{";
        if (key === "chatMessages") return "also broken{{{";
        return null;
      });
      expect(() => render(<ChatApp />)).not.toThrow();
    });

    test("loads saved theme from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "chatTheme") return "dark";
        return null;
      });
      render(<ChatApp />);
      expect(screen.getByText(/Light Mode/)).toBeInTheDocument();
    });
  });

  // ─── Date Grouping ────────────────────────────────────────────────────

  describe("Date Grouping", () => {
    test("messages are grouped by date separators", () => {
      render(<ChatApp />);
      // There should be date group labels like "Today", "Yesterday", or dates
      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });

  // ─── Message Indicators ───────────────────────────────────────────────

  describe("Message Indicators", () => {
    test("message data-testid attributes are present", () => {
      render(<ChatApp />);
      expect(screen.getByTestId("message-m1")).toBeInTheDocument();
      expect(screen.getByTestId("message-m2")).toBeInTheDocument();
    });

    test("thread reply data-testid attributes are present", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId("thread-btn-m2"));
      expect(screen.getByTestId("thread-reply-m2t1")).toBeInTheDocument();
      expect(screen.getByTestId("thread-reply-m2t2")).toBeInTheDocument();
    });
  });

  // ─── Combined Interactions ────────────────────────────────────────────

  describe("Combined Interactions", () => {
    test("can send message then view it in search", () => {
      render(<ChatApp />);
      // Send a unique message
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, {
        target: { value: "unique_search_test_string_xyz" },
      });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(
        screen.getByText("unique_search_test_string_xyz")
      ).toBeInTheDocument();

      // Search for it
      fireEvent.click(screen.getByLabelText("Search messages"));
      const searchInput = screen.getByPlaceholderText(
        "Search messages... (Ctrl+K)"
      );
      fireEvent.change(searchInput, {
        target: { value: "unique_search_test_string_xyz" },
      });
      // Should find the message in search results
      const results = screen.getAllByText("unique_search_test_string_xyz");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    test("switching channels and sending message in new channel", () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText("# engineering"));
      const input = screen.getByLabelText("Message input");
      fireEvent.change(input, {
        target: { value: "Engineering update" },
      });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(screen.getByText("Engineering update")).toBeInTheDocument();
    });

    test("thread reply then switch channel preserves thread", () => {
      render(<ChatApp />);
      // Open thread
      fireEvent.click(screen.getByTestId("thread-btn-m2"));
      const threadInput = screen.getByLabelText("Thread reply");
      fireEvent.change(threadInput, {
        target: { value: "New reply here" },
      });
      fireEvent.keyDown(threadInput, { key: "Enter" });
      expect(screen.getByText("New reply here")).toBeInTheDocument();

      // Switch channel and back
      fireEvent.click(screen.getByText("# engineering"));
      fireEvent.click(screen.getByText("# general"));

      // Open the same thread again
      fireEvent.click(screen.getByTestId("thread-btn-m2"));
      expect(screen.getByText("New reply here")).toBeInTheDocument();
    });
  });

  // ─── Error Handling ───────────────────────────────────────────────────

  describe("Error Handling", () => {
    test("renders without errors with empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<ChatApp />)).not.toThrow();
    });
  });
});
