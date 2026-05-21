import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import VideoStreamingPlatform from "./src/app/page.jsx";

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

describe("VideoStreamingPlatform Component", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe("Initial Rendering", () => {
    test("renders sidebar with StreamHub branding", () => {
      render(<VideoStreamingPlatform />);
      expect(screen.getByText(/StreamHub/)).toBeInTheDocument();
    });

    test("renders sidebar navigation items", () => {
      render(<VideoStreamingPlatform />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Trending")).toBeInTheDocument();
      expect(screen.getByText("History")).toBeInTheDocument();
      expect(screen.getByText("Queue")).toBeInTheDocument();
      expect(screen.getByText("Playlists")).toBeInTheDocument();
      expect(screen.getByText("Liked Videos")).toBeInTheDocument();
    });

    test("renders search bar", () => {
      render(<VideoStreamingPlatform />);
      expect(
        screen.getByPlaceholderText("Search videos... (Ctrl+K)")
      ).toBeInTheDocument();
    });

    test("renders video grid on home view", () => {
      render(<VideoStreamingPlatform />);
      expect(screen.getByTestId("video-grid")).toBeInTheDocument();
    });

    test("renders all initial videos", () => {
      render(<VideoStreamingPlatform />);
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Perfect Pasta Carbonara Recipe")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Lo-fi Beats to Study To - Live Stream")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Elden Ring Boss Rush - No Hit Challenge")
      ).toBeInTheDocument();
    });

    test("renders genre filter chips", () => {
      render(<VideoStreamingPlatform />);
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Technology")).toBeInTheDocument();
      expect(screen.getByText("Cooking")).toBeInTheDocument();
      expect(screen.getByText("Music")).toBeInTheDocument();
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    test("renders sort dropdown", () => {
      render(<VideoStreamingPlatform />);
      expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
    });

    test("renders channel names on video cards", () => {
      render(<VideoStreamingPlatform />);
      expect(screen.getAllByText("TechVision").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Chef Marco").length).toBeGreaterThan(0);
      expect(screen.getAllByText("GameZone").length).toBeGreaterThan(0);
    });

    test("renders theme toggle button", () => {
      render(<VideoStreamingPlatform />);
      expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    });
  });

  describe("Theme Toggling", () => {
    test("toggling theme saves to localStorage", () => {
      render(<VideoStreamingPlatform />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "streamTheme",
        "light"
      );
    });

    test("toggling theme twice returns to dark mode", () => {
      render(<VideoStreamingPlatform />);
      const themeButton = screen.getByLabelText("Toggle theme");
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "streamTheme",
        "dark"
      );
    });

    test("loads light theme from localStorage", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "streamTheme") return "light";
        return null;
      });
      render(<VideoStreamingPlatform />);
      // In light mode, the moon icon is shown for toggling to dark
      expect(screen.getByText("🌙")).toBeInTheDocument();
    });
  });

  describe("Sidebar Navigation", () => {
    test("clicking Home shows video grid", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Home"));
      expect(screen.getByTestId("video-grid")).toBeInTheDocument();
    });

    test("clicking History shows watch history view", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("History"));
      expect(screen.getByText("Watch History")).toBeInTheDocument();
    });

    test("clicking Queue shows queue view", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Queue"));
      expect(screen.getByText(/Up Next/)).toBeInTheDocument();
    });

    test("clicking Playlists shows playlists view", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      expect(screen.getByTestId("create-playlist-btn")).toBeInTheDocument();
    });

    test("clicking Liked Videos shows liked videos view", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Liked Videos"));
      expect(screen.getByText("No liked videos yet")).toBeInTheDocument();
    });
  });

  describe("Sidebar Collapse/Expand", () => {
    test("renders toggle sidebar button", () => {
      render(<VideoStreamingPlatform />);
      expect(screen.getByLabelText("Toggle sidebar")).toBeInTheDocument();
    });

    test("collapsing sidebar hides navigation labels", () => {
      render(<VideoStreamingPlatform />);
      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);
      expect(screen.queryByText("Home")).not.toBeInTheDocument();
      expect(screen.queryByText("Trending")).not.toBeInTheDocument();
    });

    test("expanding sidebar shows navigation labels again", () => {
      render(<VideoStreamingPlatform />);
      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  describe("Search Filtering", () => {
    test("search filters videos by title", () => {
      render(<VideoStreamingPlatform />);
      const searchInput = screen.getByPlaceholderText(
        "Search videos... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "React" } });
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Perfect Pasta Carbonara Recipe")
      ).not.toBeInTheDocument();
    });

    test("search filters videos by channel name", () => {
      render(<VideoStreamingPlatform />);
      const searchInput = screen.getByPlaceholderText(
        "Search videos... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "Chef Marco" } });
      expect(
        screen.getByText("Perfect Pasta Carbonara Recipe")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Homemade Ramen From Scratch")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Building a React App from Scratch")
      ).not.toBeInTheDocument();
    });

    test("search filters videos by description", () => {
      render(<VideoStreamingPlatform />);
      const searchInput = screen.getByPlaceholderText(
        "Search videos... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "carbonara" } });
      expect(
        screen.getByText("Perfect Pasta Carbonara Recipe")
      ).toBeInTheDocument();
    });

    test("clearing search shows all videos again", () => {
      render(<VideoStreamingPlatform />);
      const searchInput = screen.getByPlaceholderText(
        "Search videos... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "React" } });
      fireEvent.change(searchInput, { target: { value: "" } });
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Perfect Pasta Carbonara Recipe")
      ).toBeInTheDocument();
    });

    test("no results shows empty state", () => {
      render(<VideoStreamingPlatform />);
      const searchInput = screen.getByPlaceholderText(
        "Search videos... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
      expect(screen.getByText("No videos found")).toBeInTheDocument();
    });
  });

  describe("Genre Filtering", () => {
    test("filtering by technology shows only tech videos", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Technology"));
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
      expect(
        screen.getByText("CSS Grid vs Flexbox - Complete Guide")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Perfect Pasta Carbonara Recipe")
      ).not.toBeInTheDocument();
    });

    test("filtering by cooking shows only cooking videos", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Cooking"));
      expect(
        screen.getByText("Perfect Pasta Carbonara Recipe")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Homemade Ramen From Scratch")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Building a React App from Scratch")
      ).not.toBeInTheDocument();
    });

    test("clicking All resets genre filter", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Technology"));
      fireEvent.click(screen.getByText("All"));
      expect(
        screen.getByText("Perfect Pasta Carbonara Recipe")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
    });
  });

  describe("Sort Controls", () => {
    test("sort by newest shows newest videos first", () => {
      render(<VideoStreamingPlatform />);
      const sortSelect = screen.getByLabelText("Sort by");
      fireEvent.change(sortSelect, { target: { value: "newest" } });
      const grid = screen.getByTestId("video-grid");
      const titles = within(grid).getAllByRole("heading", { level: 3 });
      // Most recent upload is "Stand-Up Comedy Special: Night Owl" (1 day ago)
      expect(titles[0].textContent).toBe("Stand-Up Comedy Special: Night Owl");
    });

    test("sort by popular shows most viewed first", () => {
      render(<VideoStreamingPlatform />);
      const sortSelect = screen.getByLabelText("Sort by");
      fireEvent.change(sortSelect, { target: { value: "popular" } });
      const grid = screen.getByTestId("video-grid");
      const titles = within(grid).getAllByRole("heading", { level: 3 });
      // Most viewed is "Stand-Up Comedy Special: Night Owl" (2.1M)
      expect(titles[0].textContent).toBe("Stand-Up Comedy Special: Night Owl");
    });
  });

  describe("Combined Filters", () => {
    test("search and genre filter work together", () => {
      render(<VideoStreamingPlatform />);
      const searchInput = screen.getByPlaceholderText(
        "Search videos... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "street" } });
      fireEvent.click(screen.getByText("Travel"));
      expect(screen.getByText("Street Food Tour: Bangkok")).toBeInTheDocument();
    });

    test("non-matching combined filters show no videos", () => {
      render(<VideoStreamingPlatform />);
      const searchInput = screen.getByPlaceholderText(
        "Search videos... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "React" } });
      fireEvent.click(screen.getByText("Cooking"));
      expect(screen.getByText("No videos found")).toBeInTheDocument();
    });
  });

  describe("Video Detail Modal", () => {
    test("clicking a video card opens detail modal", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      expect(screen.getByTestId("detail-title")).toBeInTheDocument();
    });

    test("detail modal shows video description", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      expect(screen.getByTestId("detail-description")).toBeInTheDocument();
      expect(
        screen.getByText(/Learn how to build a complete React application/)
      ).toBeInTheDocument();
    });

    test("detail modal shows channel info", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      // Channel name appears in the detail modal
      const detailModal = screen
        .getByTestId("detail-title")
        .closest("div[style]");
      expect(screen.getByText(/245K subscribers/)).toBeInTheDocument();
    });

    test("detail modal has Play Now button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      expect(screen.getByTestId("detail-play-btn")).toBeInTheDocument();
    });

    test("detail modal has Add to Queue button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      expect(screen.getByTestId("detail-queue-btn")).toBeInTheDocument();
    });

    test("detail modal has Like button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      expect(screen.getByTestId("detail-like-btn")).toBeInTheDocument();
    });

    test("detail modal has Save button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      expect(screen.getByTestId("detail-save-btn")).toBeInTheDocument();
    });

    test("clicking close button closes detail modal", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      expect(screen.getByTestId("detail-title")).toBeInTheDocument();
      const closeButton = screen.getByText("×");
      fireEvent.click(closeButton);
      expect(screen.queryByTestId("detail-title")).not.toBeInTheDocument();
    });

    test("clicking Play Now starts playing the video", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("video-player")).toBeInTheDocument();
      expect(screen.getByTestId("video-title").textContent).toBe(
        "Building a React App from Scratch"
      );
    });

    test("liking from detail modal toggles like state", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      const likeBtn = screen.getByTestId("detail-like-btn");
      expect(likeBtn.textContent).toContain("Like");
      fireEvent.click(likeBtn);
      expect(likeBtn.textContent).toContain("Liked");
      fireEvent.click(likeBtn);
      expect(likeBtn.textContent).toContain("Like");
    });

    test("adding to queue from detail modal", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-queue-btn"));
      // Modal closes
      expect(screen.queryByTestId("detail-title")).not.toBeInTheDocument();
      // Check queue shows 1 item
      fireEvent.click(screen.getByText("Queue"));
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
    });
  });

  describe("Video Player", () => {
    test("playing a video shows the player", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("video-player")).toBeInTheDocument();
    });

    test("player shows video title", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("video-title").textContent).toBe(
        "Building a React App from Scratch"
      );
    });

    test("player shows play/pause button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("play-pause-btn")).toBeInTheDocument();
    });

    test("player shows time display", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("time-display")).toBeInTheDocument();
      expect(screen.getByTestId("time-display").textContent).toContain("0:00");
    });

    test("player shows volume slider", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("volume-slider")).toBeInTheDocument();
    });

    test("player shows mute button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("mute-btn")).toBeInTheDocument();
    });

    test("player shows progress bar", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
    });

    test("player shows fullscreen button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("fullscreen-btn")).toBeInTheDocument();
    });

    test("player shows speed button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("speed-btn")).toBeInTheDocument();
      expect(screen.getByTestId("speed-btn").textContent).toBe("1x");
    });

    test("player shows mini player button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("miniplayer-btn")).toBeInTheDocument();
    });
  });

  describe("Player Controls - Mute", () => {
    test("clicking mute button toggles mute", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      const muteBtn = screen.getByTestId("mute-btn");
      expect(muteBtn.textContent).toBe("🔊");
      fireEvent.click(muteBtn);
      expect(muteBtn.textContent).toBe("🔇");
      fireEvent.click(muteBtn);
      expect(muteBtn.textContent).toBe("🔊");
    });
  });

  describe("Player Controls - Speed", () => {
    test("clicking speed button shows speed menu", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      fireEvent.click(screen.getByTestId("speed-btn"));
      expect(screen.getByTestId("speed-menu")).toBeInTheDocument();
    });

    test("selecting a speed changes playback speed", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      fireEvent.click(screen.getByTestId("speed-btn"));
      // Click 2x speed
      fireEvent.click(screen.getByText("2x"));
      expect(screen.getByTestId("speed-btn").textContent).toBe("2x");
    });

    test("speed menu has all speed options", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      fireEvent.click(screen.getByTestId("speed-btn"));
      expect(screen.getByText("0.25x")).toBeInTheDocument();
      expect(screen.getByText("0.5x")).toBeInTheDocument();
      expect(screen.getByText("1.5x")).toBeInTheDocument();
      expect(screen.getByText("2x")).toBeInTheDocument();
    });
  });

  describe("Video Info Section", () => {
    test("shows video description below player", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("video-description")).toBeInTheDocument();
    });

    test("shows like and dislike buttons", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("like-btn")).toBeInTheDocument();
      expect(screen.getByTestId("dislike-btn")).toBeInTheDocument();
    });

    test("like button toggles like state", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      const likeBtn = screen.getByTestId("like-btn");
      // Initially shows original like count (8400)
      expect(likeBtn.textContent).toContain("8400");
      fireEvent.click(likeBtn);
      // After liking, shows incremented count
      expect(likeBtn.textContent).toContain("8401");
    });

    test("liking then disliking removes like", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      const likeBtn = screen.getByTestId("like-btn");
      const dislikeBtn = screen.getByTestId("dislike-btn");
      fireEvent.click(likeBtn);
      expect(likeBtn.textContent).toContain("8401");
      fireEvent.click(dislikeBtn);
      // Like should be removed, back to original
      expect(likeBtn.textContent).toContain("8400");
    });

    test("shows Add to Queue button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("add-queue-btn")).toBeInTheDocument();
    });

    test("shows Save button", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });
  });

  describe("Watch History", () => {
    test("playing a video adds it to watch history", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      // Navigate to history
      fireEvent.click(screen.getByText("History"));
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
    });

    test("empty history shows empty state", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("History"));
      expect(screen.getByText("No watch history yet")).toBeInTheDocument();
    });

    test("clear history button removes all history", () => {
      window.confirm.mockReturnValue(true);
      render(<VideoStreamingPlatform />);
      // Play a video
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      // Go to history
      fireEvent.click(screen.getByText("History"));
      expect(screen.getByTestId("clear-history-btn")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("clear-history-btn"));
      expect(screen.getByText("No watch history yet")).toBeInTheDocument();
    });

    test("watch history persists to localStorage", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "streamHistory",
        expect.stringContaining("v1")
      );
    });
  });

  describe("Queue Management", () => {
    test("empty queue shows empty state", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Queue"));
      expect(screen.getByText("Queue is empty")).toBeInTheDocument();
    });

    test("adding a video to queue from video card", () => {
      render(<VideoStreamingPlatform />);
      const addBtn = screen.getByLabelText(
        "Add Building a React App from Scratch to queue"
      );
      fireEvent.click(addBtn);
      fireEvent.click(screen.getByText("Queue"));
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
    });

    test("removing a video from queue", () => {
      render(<VideoStreamingPlatform />);
      // Add to queue
      const addBtn = screen.getByLabelText(
        "Add Building a React App from Scratch to queue"
      );
      fireEvent.click(addBtn);
      // Go to queue
      fireEvent.click(screen.getByText("Queue"));
      const removeBtn = screen.getByTestId("remove-queue-v1");
      fireEvent.click(removeBtn);
      expect(screen.getByText("Queue is empty")).toBeInTheDocument();
    });

    test("clear queue removes all items", () => {
      render(<VideoStreamingPlatform />);
      // Add two videos
      fireEvent.click(
        screen.getByLabelText("Add Building a React App from Scratch to queue")
      );
      fireEvent.click(
        screen.getByLabelText("Add Perfect Pasta Carbonara Recipe to queue")
      );
      fireEvent.click(screen.getByText("Queue"));
      fireEvent.click(screen.getByTestId("clear-queue-btn"));
      expect(screen.getByText("Queue is empty")).toBeInTheDocument();
    });

    test("queue shows numbered items", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(
        screen.getByLabelText("Add Building a React App from Scratch to queue")
      );
      fireEvent.click(
        screen.getByLabelText("Add Perfect Pasta Carbonara Recipe to queue")
      );
      fireEvent.click(screen.getByText("Queue"));
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    test("queue count is shown in header", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(
        screen.getByLabelText("Add Building a React App from Scratch to queue")
      );
      fireEvent.click(
        screen.getByLabelText("Add Perfect Pasta Carbonara Recipe to queue")
      );
      fireEvent.click(screen.getByText("Queue"));
      expect(screen.getByText(/Up Next \(2\)/)).toBeInTheDocument();
    });

    test("queue persists to localStorage", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(
        screen.getByLabelText("Add Building a React App from Scratch to queue")
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "streamQueue",
        expect.stringContaining("v1")
      );
    });
  });

  describe("Playlists", () => {
    test("default playlists exist", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      expect(screen.getByText("Watch Later")).toBeInTheDocument();
      expect(screen.getByText("Favorites")).toBeInTheDocument();
    });

    test("creating a new playlist", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      fireEvent.click(screen.getByTestId("create-playlist-btn"));
      const input = screen.getByTestId("playlist-name-input");
      fireEvent.change(input, { target: { value: "My Playlist" } });
      fireEvent.click(screen.getByTestId("create-playlist-submit"));
      expect(screen.getByText("My Playlist")).toBeInTheDocument();
    });

    test("adding a video to a playlist via modal", () => {
      render(<VideoStreamingPlatform />);
      // Click add to playlist button on first video card
      const addBtn = screen.getByLabelText(
        "Add Building a React App from Scratch to playlist"
      );
      fireEvent.click(addBtn);
      // Click on Watch Later
      fireEvent.click(screen.getByTestId("save-to-pl1"));
      // Navigate to playlist
      fireEvent.click(screen.getByText("Playlists"));
    });

    test("playlist overview shows video count", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      // Default playlists should show 0 videos
      const videoCountTexts = screen.getAllByText("0 videos");
      expect(videoCountTexts.length).toBeGreaterThan(0);
    });

    test("deleting a custom playlist", () => {
      window.confirm.mockReturnValue(true);
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      // Create a playlist first
      fireEvent.click(screen.getByTestId("create-playlist-btn"));
      const input = screen.getByTestId("playlist-name-input");
      fireEvent.change(input, { target: { value: "To Delete" } });
      fireEvent.click(screen.getByTestId("create-playlist-submit"));
      // Open the playlist
      fireEvent.click(screen.getByText("To Delete"));
      // Delete it
      fireEvent.click(screen.getByTestId("delete-playlist-btn"));
      expect(screen.queryByText("To Delete")).not.toBeInTheDocument();
    });

    test("playlists persist to localStorage", () => {
      render(<VideoStreamingPlatform />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "streamPlaylists",
        expect.any(String)
      );
    });
  });

  describe("Playlist Detail View", () => {
    test("clicking a playlist shows its detail view", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      fireEvent.click(screen.getByText("Watch Later"));
      expect(screen.getByText("This playlist is empty")).toBeInTheDocument();
    });

    test("back button returns to playlists overview", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      fireEvent.click(screen.getByText("Watch Later"));
      fireEvent.click(screen.getByText("← Back to Playlists"));
      expect(screen.getByTestId("create-playlist-btn")).toBeInTheDocument();
    });

    test("play all button starts playing playlist videos", () => {
      render(<VideoStreamingPlatform />);
      // Add video to Watch Later
      const addBtn = screen.getByLabelText(
        "Add Building a React App from Scratch to playlist"
      );
      fireEvent.click(addBtn);
      fireEvent.click(screen.getByTestId("save-to-pl1"));
      // Navigate to Watch Later
      fireEvent.click(screen.getByText("Playlists"));
      fireEvent.click(screen.getByText("Watch Later"));
      fireEvent.click(screen.getByTestId("play-all-btn"));
      expect(screen.getByTestId("video-player")).toBeInTheDocument();
    });
  });

  describe("Liked Videos", () => {
    test("empty liked videos shows empty state", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Liked Videos"));
      expect(screen.getByText("No liked videos yet")).toBeInTheDocument();
    });

    test("liking a video adds it to liked videos view", () => {
      render(<VideoStreamingPlatform />);
      // Play a video and like it
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      fireEvent.click(screen.getByTestId("like-btn"));
      // Navigate to liked videos
      fireEvent.click(screen.getByText("Liked Videos"));
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
    });

    test("unliking a video removes it from liked videos view", () => {
      render(<VideoStreamingPlatform />);
      // Like from detail modal
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-like-btn"));
      // Check liked view has it
      fireEvent.click(screen.getByText("Liked Videos"));
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
      // Unlike via detail modal
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-like-btn"));
      // Navigate back
      fireEvent.click(screen.getByText("Liked Videos"));
      expect(screen.getByText("No liked videos yet")).toBeInTheDocument();
    });

    test("liked videos persist to localStorage", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-like-btn"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "streamLikes",
        expect.stringContaining("v1")
      );
    });
  });

  describe("Keyboard Shortcuts", () => {
    test("Escape key closes video detail modal", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      expect(screen.getByTestId("detail-title")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByTestId("detail-title")).not.toBeInTheDocument();
    });

    test("Escape key closes create playlist modal", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      fireEvent.click(screen.getByTestId("create-playlist-btn"));
      expect(screen.getByTestId("playlist-name-input")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(
        screen.queryByTestId("playlist-name-input")
      ).not.toBeInTheDocument();
    });

    test("Escape key closes add to playlist modal", () => {
      render(<VideoStreamingPlatform />);
      const addBtn = screen.getByLabelText(
        "Add Building a React App from Scratch to playlist"
      );
      fireEvent.click(addBtn);
      expect(screen.getByText("Save to Playlist")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Save to Playlist")).not.toBeInTheDocument();
    });
  });

  describe("localStorage Persistence", () => {
    test("history is saved to localStorage", () => {
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Building a React App from Scratch"));
      fireEvent.click(screen.getByTestId("detail-play-btn"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "streamHistory",
        expect.any(String)
      );
    });

    test("loads watch history from localStorage", () => {
      const savedHistory = JSON.stringify([
        { videoId: "v2", watchedAt: Date.now(), progress: 0 },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "streamHistory") return savedHistory;
        return null;
      });
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("History"));
      expect(
        screen.getByText("Perfect Pasta Carbonara Recipe")
      ).toBeInTheDocument();
    });

    test("loads playlists from localStorage", () => {
      const savedPlaylists = JSON.stringify([
        { id: "pl1", name: "Watch Later", videoIds: ["v1"] },
        { id: "pl2", name: "Favorites", videoIds: [] },
        { id: "pl99", name: "Custom List", videoIds: ["v3"] },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "streamPlaylists") return savedPlaylists;
        return null;
      });
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Playlists"));
      expect(screen.getByText("Custom List")).toBeInTheDocument();
    });

    test("loads liked videos from localStorage", () => {
      const savedLikes = JSON.stringify(["v1", "v3"]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "streamLikes") return savedLikes;
        return null;
      });
      render(<VideoStreamingPlatform />);
      fireEvent.click(screen.getByText("Liked Videos"));
      expect(
        screen.getByText("Building a React App from Scratch")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Lo-fi Beats to Study To - Live Stream")
      ).toBeInTheDocument();
    });

    test("handles corrupted localStorage gracefully", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "streamHistory") return "not valid json{{{";
        if (key === "streamLikes") return "{{broken}}";
        if (key === "streamPlaylists") return "nope";
        return null;
      });
      expect(() => render(<VideoStreamingPlatform />)).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    test("renders without errors with empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<VideoStreamingPlatform />)).not.toThrow();
    });
  });
});
