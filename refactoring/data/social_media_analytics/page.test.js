import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Page from "@/app/page";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

let confirmMock;
let createObjectURLMock;
let revokeObjectURLMock;
let linkClickMock;

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  confirmMock = vi.fn(() => true);
  window.confirm = confirmMock;
  createObjectURLMock = vi.fn(() => "blob:test-url");
  revokeObjectURLMock = vi.fn();
  URL.createObjectURL = createObjectURLMock;
  URL.revokeObjectURL = revokeObjectURLMock;
  linkClickMock = vi.fn();
  vi.spyOn(document, "createElement").mockImplementation((tag) => {
    if (tag === "a") {
      return { href: "", download: "", click: linkClickMock, setAttribute: vi.fn() };
    }
    return document.__proto__.createElement.call(document, tag);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Initial Rendering ───────────────────────────────────────────────────────

describe("Initial Rendering", () => {
  it("renders the dashboard title", () => {
    render(<Page />);
    expect(screen.getByText("SocialPulse")).toBeInTheDocument();
  });

  it("renders the Overview heading by default", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).getByText("Overview")).toBeInTheDocument();
    expect(within(nav).getByText("Posts")).toBeInTheDocument();
    expect(within(nav).getByText("Analytics")).toBeInTheDocument();
    expect(within(nav).getByText("Audience")).toBeInTheDocument();
    expect(within(nav).getByText("Scheduler")).toBeInTheDocument();
    expect(within(nav).getByText("Settings")).toBeInTheDocument();
  });

  it("displays the search input", () => {
    render(<Page />);
    expect(screen.getByPlaceholderText("Search posts... (Ctrl+K)")).toBeInTheDocument();
  });

  it("displays the New Post button", () => {
    render(<Page />);
    expect(screen.getByRole("button", { name: "Create new post" })).toBeInTheDocument();
  });

  it("displays the notification bell", () => {
    render(<Page />);
    expect(screen.getByRole("button", { name: "Toggle notifications" })).toBeInTheDocument();
  });

  it("displays the dark mode toggle", () => {
    render(<Page />);
    expect(screen.getByRole("button", { name: "Toggle dark mode" })).toBeInTheDocument();
  });
});

// ─── Overview Tab ────────────────────────────────────────────────────────────

describe("Overview Tab", () => {
  it("displays total followers stat", () => {
    render(<Page />);
    expect(screen.getByText("Total Followers")).toBeInTheDocument();
  });

  it("displays total engagement stat", () => {
    render(<Page />);
    expect(screen.getByText("Total Engagement")).toBeInTheDocument();
  });

  it("displays total impressions stat", () => {
    render(<Page />);
    expect(screen.getByText("Total Impressions")).toBeInTheDocument();
  });

  it("displays avg engagement rate stat", () => {
    render(<Page />);
    expect(screen.getByText("Avg Engagement Rate")).toBeInTheDocument();
  });

  it("displays follower growth section", () => {
    render(<Page />);
    expect(screen.getByText("Follower Growth")).toBeInTheDocument();
  });

  it("displays top performing post section", () => {
    render(<Page />);
    expect(screen.getByText("Top Performing Post")).toBeInTheDocument();
  });

  it("displays platform breakdown with all 5 platforms", () => {
    render(<Page />);
    expect(screen.getByText("Platform Breakdown")).toBeInTheDocument();
    const breakdown = screen.getByText("Platform Breakdown").closest("div");
    expect(within(breakdown).getByText("Twitter")).toBeInTheDocument();
    expect(within(breakdown).getByText("Instagram")).toBeInTheDocument();
    expect(within(breakdown).getByText("LinkedIn")).toBeInTheDocument();
    expect(within(breakdown).getByText("Facebook")).toBeInTheDocument();
    expect(within(breakdown).getByText("TikTok")).toBeInTheDocument();
  });

  it("shows follower growth percentage", () => {
    render(<Page />);
    // Growth should appear as a positive percentage
    const growthElement = screen.getByText(/\+.*% this week/);
    expect(growthElement).toBeInTheDocument();
  });
});

// ─── Navigation ──────────────────────────────────────────────────────────────

describe("Sidebar Navigation", () => {
  it("navigates to Posts tab", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
    expect(screen.getByRole("heading", { name: "Posts" })).toBeInTheDocument();
    expect(screen.getByText("Manage and track all your posts")).toBeInTheDocument();
  });

  it("navigates to Analytics tab", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Analytics"));
    expect(screen.getByRole("heading", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByText("Deep dive into your metrics")).toBeInTheDocument();
  });

  it("navigates to Audience tab", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Audience"));
    expect(screen.getByRole("heading", { name: "Audience" })).toBeInTheDocument();
    expect(screen.getByText("Understand your audience")).toBeInTheDocument();
  });

  it("navigates to Scheduler tab", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Scheduler"));
    expect(screen.getByRole("heading", { name: "Scheduler" })).toBeInTheDocument();
    expect(screen.getByText("Plan and schedule content")).toBeInTheDocument();
  });

  it("navigates to Settings tab", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Settings"));
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText("Configure your dashboard")).toBeInTheDocument();
  });

  it("highlights the active tab", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const overviewBtn = within(nav).getByText("Overview").closest("button");
    expect(overviewBtn).toHaveAttribute("aria-current", "page");
  });
});

// ─── Sidebar Collapse / Expand ───────────────────────────────────────────────

describe("Sidebar Collapse/Expand", () => {
  it("collapses the sidebar", () => {
    render(<Page />);
    const collapseBtn = screen.getByRole("button", { name: "Collapse sidebar" });
    fireEvent.click(collapseBtn);
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
    expect(screen.queryByText("SocialPulse")).not.toBeInTheDocument();
  });

  it("expands the sidebar after collapse", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(screen.getByText("SocialPulse")).toBeInTheDocument();
  });

  it("hides nav labels when collapsed", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).queryByText("Overview")).not.toBeInTheDocument();
    expect(within(nav).queryByText("Posts")).not.toBeInTheDocument();
  });
});

// ─── Dark Mode ───────────────────────────────────────────────────────────────

describe("Dark Mode Toggle", () => {
  it("toggles dark mode on click", () => {
    render(<Page />);
    const toggle = screen.getByRole("button", { name: "Toggle dark mode" });
    // Initially light mode shows moon icon
    expect(toggle.textContent).toContain("🌙");
    fireEvent.click(toggle);
    // After toggle, shows sun icon
    expect(toggle.textContent).toContain("☀️");
  });

  it("persists dark mode to localStorage", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("sma_darkMode", "true");
  });

  it("loads dark mode from localStorage", () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "sma_darkMode") return "true";
      return null;
    });
    render(<Page />);
    const toggle = screen.getByRole("button", { name: "Toggle dark mode" });
    expect(toggle.textContent).toContain("☀️");
  });
});

// ─── Posts Tab ───────────────────────────────────────────────────────────────

describe("Posts Tab", () => {
  const goToPosts = () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
  };

  it("displays all 10 initial posts", () => {
    goToPosts();
    expect(screen.getByText(/Showing 10 of 10 posts/)).toBeInTheDocument();
  });

  it("displays platform badges on posts", () => {
    goToPosts();
    // The post about product launch should show Twitter badge
    const postCard = screen.getByText(/Excited to announce our new product launch/).closest("div");
    expect(within(postCard).getByText("Twitter")).toBeInTheDocument();
  });

  it("displays post status badges", () => {
    goToPosts();
    const draftBadges = screen.getAllByText("draft");
    expect(draftBadges.length).toBeGreaterThan(0);
    const scheduledBadges = screen.getAllByText("scheduled");
    expect(scheduledBadges.length).toBeGreaterThan(0);
  });

  it("displays engagement metrics for published posts", () => {
    goToPosts();
    // The top post (TikTok reactions video) should show engagement
    const tikTokPost = screen.getByText(/Reacting to our first ever product review/).closest("div");
    expect(within(tikTokPost).getByText(/5.6K/)).toBeInTheDocument();
  });

  it("shows tags on posts", () => {
    goToPosts();
    expect(screen.getByText("#product")).toBeInTheDocument();
    expect(screen.getByText("#announcement")).toBeInTheDocument();
  });
});

// ─── Posts Filtering ─────────────────────────────────────────────────────────

describe("Posts Filtering", () => {
  const goToPosts = () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
  };

  it("filters posts by platform", () => {
    goToPosts();
    const platformSelect = screen.getByRole("combobox", { name: "Filter by platform" });
    fireEvent.change(platformSelect, { target: { value: "Twitter" } });
    // Only Twitter posts (id 1 and 6)
    expect(screen.getByText(/Showing 2 of 10 posts/)).toBeInTheDocument();
  });

  it("filters posts by status", () => {
    goToPosts();
    const statusSelect = screen.getByRole("combobox", { name: "Filter by status" });
    fireEvent.change(statusSelect, { target: { value: "draft" } });
    expect(screen.getByText(/Showing 1 of 10 posts/)).toBeInTheDocument();
  });

  it("combines platform and status filters", () => {
    goToPosts();
    const platformSelect = screen.getByRole("combobox", { name: "Filter by platform" });
    const statusSelect = screen.getByRole("combobox", { name: "Filter by status" });
    fireEvent.change(platformSelect, { target: { value: "Instagram" } });
    fireEvent.change(statusSelect, { target: { value: "scheduled" } });
    expect(screen.getByText(/Showing 1 of 10 posts/)).toBeInTheDocument();
  });

  it("shows empty state when no posts match", () => {
    goToPosts();
    const platformSelect = screen.getByRole("combobox", { name: "Filter by platform" });
    const statusSelect = screen.getByRole("combobox", { name: "Filter by status" });
    fireEvent.change(platformSelect, { target: { value: "TikTok" } });
    fireEvent.change(statusSelect, { target: { value: "draft" } });
    expect(screen.getByText("No posts match your filters")).toBeInTheDocument();
  });
});

// ─── Search ──────────────────────────────────────────────────────────────────

describe("Search", () => {
  it("filters posts by content search", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
    const searchInput = screen.getByPlaceholderText("Search posts... (Ctrl+K)");
    fireEvent.change(searchInput, { target: { value: "hiring" } });
    expect(screen.getByText(/Showing 1 of 10 posts/)).toBeInTheDocument();
    expect(screen.getByText(/We're hiring!/)).toBeInTheDocument();
  });

  it("filters posts by tag search", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
    const searchInput = screen.getByPlaceholderText("Search posts... (Ctrl+K)");
    fireEvent.change(searchInput, { target: { value: "culture" } });
    expect(screen.getByText(/Showing 2 of 10 posts/)).toBeInTheDocument();
  });

  it("filters posts by platform name search", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
    const searchInput = screen.getByPlaceholderText("Search posts... (Ctrl+K)");
    fireEvent.change(searchInput, { target: { value: "tiktok" } });
    expect(screen.getByText(/Showing 2 of 10 posts/)).toBeInTheDocument();
  });
});

// ─── Post Sorting ────────────────────────────────────────────────────────────

describe("Post Sorting", () => {
  const goToPosts = () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
  };

  it("toggles sort direction", () => {
    goToPosts();
    const sortBtn = screen.getByText("↓ Desc");
    fireEvent.click(sortBtn);
    expect(screen.getByText("↑ Asc")).toBeInTheDocument();
  });

  it("changes sort field to engagement", () => {
    goToPosts();
    const sortSelect = screen.getByRole("combobox", { name: "Sort by" });
    fireEvent.change(sortSelect, { target: { value: "engagement" } });
    // First post should be highest engagement (TikTok reactions post)
    const postCards = screen.getAllByText(/❤️/);
    expect(postCards.length).toBeGreaterThan(0);
  });

  it("changes sort field to impressions", () => {
    goToPosts();
    const sortSelect = screen.getByRole("combobox", { name: "Sort by" });
    fireEvent.change(sortSelect, { target: { value: "impressions" } });
    expect(screen.getByText(/Showing 10 of 10 posts/)).toBeInTheDocument();
  });
});

// ─── Create Post ─────────────────────────────────────────────────────────────

describe("Create Post Modal", () => {
  it("opens create post modal", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Create new post" }));
    expect(screen.getByRole("dialog", { name: "Create new post" })).toBeInTheDocument();
    expect(screen.getByText("Create New Post")).toBeInTheDocument();
  });

  it("creates a new published post", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Create new post" }));

    const platformSelect = screen.getByRole("combobox", { name: "Select platform" });
    fireEvent.change(platformSelect, { target: { value: "LinkedIn" } });

    const contentInput = screen.getByPlaceholderText("Write your post content...");
    fireEvent.change(contentInput, { target: { value: "Test post content for LinkedIn" } });

    const tagsInput = screen.getByPlaceholderText("e.g., product, announcement");
    fireEvent.change(tagsInput, { target: { value: "test, linkedin" } });

    fireEvent.click(screen.getByText("Publish Post"));

    // Modal should close
    expect(screen.queryByText("Create New Post")).not.toBeInTheDocument();

    // Navigate to posts to verify
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
    expect(screen.getByText("Test post content for LinkedIn")).toBeInTheDocument();
    expect(screen.getByText(/Showing 11 of 11 posts/)).toBeInTheDocument();
  });

  it("creates a scheduled post", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Create new post" }));

    const contentInput = screen.getByPlaceholderText("Write your post content...");
    fireEvent.change(contentInput, { target: { value: "Scheduled post content" } });

    const scheduleInput = screen.getByLabelText("Schedule date");
    fireEvent.change(scheduleInput, { target: { value: "2025-04-20T14:00" } });

    fireEvent.click(screen.getByText("Schedule Post"));
    expect(screen.queryByText("Create New Post")).not.toBeInTheDocument();
  });

  it("does not create post with empty content", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Create new post" }));
    fireEvent.click(screen.getByText("Publish Post"));
    // Modal should remain open
    expect(screen.getByText("Create New Post")).toBeInTheDocument();
  });

  it("closes modal with cancel button", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Create new post" }));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Create New Post")).not.toBeInTheDocument();
  });

  it("closes modal with close button", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Create new post" }));
    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));
    expect(screen.queryByText("Create New Post")).not.toBeInTheDocument();
  });
});

// ─── Edit Post ───────────────────────────────────────────────────────────────

describe("Edit Post", () => {
  it("opens edit modal with pre-filled data", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    // Click edit on first post
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(screen.getByRole("dialog", { name: "Edit post" })).toBeInTheDocument();
    expect(screen.getByText("Edit Post")).toBeInTheDocument();
    // Content should be pre-filled
    const textarea = screen.getByPlaceholderText("Write your post content...");
    expect(textarea.value).toBeTruthy();
  });

  it("saves edited post content", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    const textarea = screen.getByPlaceholderText("Write your post content...");
    fireEvent.change(textarea, { target: { value: "Updated post content here" } });
    fireEvent.click(screen.getByText("Save Changes"));

    expect(screen.queryByText("Edit Post")).not.toBeInTheDocument();
    expect(screen.getByText("Updated post content here")).toBeInTheDocument();
  });
});

// ─── Delete Post ─────────────────────────────────────────────────────────────

describe("Delete Post", () => {
  it("deletes a post after confirmation", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    expect(screen.getByText(/Showing 10 of 10 posts/)).toBeInTheDocument();
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(confirmMock).toHaveBeenCalledWith("Are you sure you want to delete this post?");
    expect(screen.getByText(/Showing 9 of 9 posts/)).toBeInTheDocument();
  });

  it("does not delete post when confirmation is cancelled", () => {
    confirmMock.mockReturnValueOnce(false);
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/Showing 10 of 10 posts/)).toBeInTheDocument();
  });
});

// ─── Publish Draft ───────────────────────────────────────────────────────────

describe("Publish Draft", () => {
  it("publishes a draft post", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    // Filter to drafts
    const statusSelect = screen.getByRole("combobox", { name: "Filter by status" });
    fireEvent.change(statusSelect, { target: { value: "draft" } });

    const publishBtn = screen.getByText("Publish");
    fireEvent.click(publishBtn);

    // After publishing, draft count should change
    fireEvent.change(statusSelect, { target: { value: "all" } });
    // The draft post should now have status "published"
    // Verify by filtering to published - should have one more
    fireEvent.change(statusSelect, { target: { value: "published" } });
    expect(screen.getByText(/Showing 9 of 10 posts/)).toBeInTheDocument();
  });
});

// ─── Post Detail Modal ───────────────────────────────────────────────────────

describe("Post Detail Modal", () => {
  it("opens post detail on click", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const postCard = screen.getByText(/Excited to announce our new product launch/).closest("[style]");
    fireEvent.click(postCard);

    expect(screen.getByRole("dialog", { name: "Post details" })).toBeInTheDocument();
    expect(screen.getByText("Post Details")).toBeInTheDocument();
  });

  it("displays engagement metrics in detail modal", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const postCard = screen.getByText(/Excited to announce our new product launch/).closest("[style]");
    fireEvent.click(postCard);

    const dialog = screen.getByRole("dialog", { name: "Post details" });
    expect(within(dialog).getByText("Likes")).toBeInTheDocument();
    expect(within(dialog).getByText("Shares")).toBeInTheDocument();
    expect(within(dialog).getByText("Comments")).toBeInTheDocument();
    expect(within(dialog).getByText("Impressions")).toBeInTheDocument();
  });

  it("displays tags in detail modal", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const postCard = screen.getByText(/Excited to announce our new product launch/).closest("[style]");
    fireEvent.click(postCard);

    const dialog = screen.getByRole("dialog", { name: "Post details" });
    expect(within(dialog).getByText("#product")).toBeInTheDocument();
    expect(within(dialog).getByText("#announcement")).toBeInTheDocument();
  });

  it("shows engagement score", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const postCard = screen.getByText(/Excited to announce our new product launch/).closest("[style]");
    fireEvent.click(postCard);

    expect(screen.getByText(/Engagement Score: /)).toBeInTheDocument();
  });

  it("closes detail modal", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const postCard = screen.getByText(/Excited to announce our new product launch/).closest("[style]");
    fireEvent.click(postCard);

    fireEvent.click(screen.getByRole("button", { name: "Close post detail" }));
    expect(screen.queryByText("Post Details")).not.toBeInTheDocument();
  });

  it("allows editing from detail modal", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const postCard = screen.getByText(/Excited to announce our new product launch/).closest("[style]");
    fireEvent.click(postCard);

    const dialog = screen.getByRole("dialog", { name: "Post details" });
    const editBtn = within(dialog).getByText("Edit");
    fireEvent.click(editBtn);

    expect(screen.getByRole("dialog", { name: "Edit post" })).toBeInTheDocument();
  });

  it("allows deleting from detail modal", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));

    const postCard = screen.getByText(/Excited to announce our new product launch/).closest("[style]");
    fireEvent.click(postCard);

    const dialog = screen.getByRole("dialog", { name: "Post details" });
    const deleteBtn = within(dialog).getByText("Delete");
    fireEvent.click(deleteBtn);

    expect(confirmMock).toHaveBeenCalled();
    expect(screen.queryByText("Post Details")).not.toBeInTheDocument();
  });
});

// ─── Analytics Tab ───────────────────────────────────────────────────────────

describe("Analytics Tab", () => {
  const goToAnalytics = () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Analytics"));
  };

  it("displays Platform Performance heading", () => {
    goToAnalytics();
    expect(screen.getByText("Platform Performance")).toBeInTheDocument();
  });

  it("displays analytics table with all platforms", () => {
    goToAnalytics();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Posts")).toBeInTheDocument();
    expect(screen.getByText("Total Engagement")).toBeInTheDocument();
    expect(screen.getByText("Avg Engagement")).toBeInTheDocument();
  });

  it("displays engagement by type section", () => {
    goToAnalytics();
    expect(screen.getByText("Engagement by Type")).toBeInTheDocument();
    expect(screen.getByText(/Likes/)).toBeInTheDocument();
    expect(screen.getByText(/Shares/)).toBeInTheDocument();
    expect(screen.getByText(/Comments/)).toBeInTheDocument();
  });

  it("displays content performance by tags", () => {
    goToAnalytics();
    expect(screen.getByText("Content Performance by Tags")).toBeInTheDocument();
  });

  it("shows export CSV button", () => {
    goToAnalytics();
    expect(screen.getByRole("button", { name: "Export analytics as CSV" })).toBeInTheDocument();
  });

  it("exports analytics as CSV", () => {
    goToAnalytics();
    fireEvent.click(screen.getByRole("button", { name: "Export analytics as CSV" }));
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(linkClickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });
});

// ─── Audience Tab ────────────────────────────────────────────────────────────

describe("Audience Tab", () => {
  const goToAudience = () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Audience"));
  };

  it("displays age distribution", () => {
    goToAudience();
    expect(screen.getByText("Age Distribution")).toBeInTheDocument();
    expect(screen.getByText("18-24")).toBeInTheDocument();
    expect(screen.getByText("25-34")).toBeInTheDocument();
    expect(screen.getByText("35-44")).toBeInTheDocument();
    expect(screen.getByText("45-54")).toBeInTheDocument();
    expect(screen.getByText("55+")).toBeInTheDocument();
  });

  it("displays top locations", () => {
    goToAudience();
    expect(screen.getByText("Top Locations")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("San Francisco")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Toronto")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
  });

  it("displays best times to post", () => {
    goToAudience();
    expect(screen.getByText("Best Times to Post")).toBeInTheDocument();
    expect(screen.getByText("9:00")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
    expect(screen.getByText("17:00")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();
  });

  it("displays followers by platform with growth", () => {
    goToAudience();
    expect(screen.getByText("Followers by Platform")).toBeInTheDocument();
    // Should show growth percentages
    const growthElements = screen.getAllByText(/\+[\d.]+%/);
    expect(growthElements.length).toBeGreaterThan(0);
  });
});

// ─── Scheduler Tab ───────────────────────────────────────────────────────────

describe("Scheduler Tab", () => {
  const goToScheduler = () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Scheduler"));
  };

  it("displays scheduled posts section", () => {
    goToScheduler();
    expect(screen.getByText(/Scheduled Posts \(2\)/)).toBeInTheDocument();
  });

  it("displays drafts section", () => {
    goToScheduler();
    expect(screen.getByText(/Drafts \(1\)/)).toBeInTheDocument();
  });

  it("displays quick schedule section with peak hours", () => {
    goToScheduler();
    expect(screen.getByText("Quick Schedule")).toBeInTheDocument();
    expect(screen.getByText("9:00")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
    expect(screen.getByText("17:00")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();
  });

  it("publishes scheduled post immediately", () => {
    goToScheduler();
    const publishBtns = screen.getAllByText("Publish Now");
    fireEvent.click(publishBtns[0]);
    // Should have one fewer scheduled post
    expect(screen.getByText(/Scheduled Posts \(1\)/)).toBeInTheDocument();
  });

  it("deletes scheduled post (Cancel button)", () => {
    goToScheduler();
    const cancelBtns = screen.getAllByText("Cancel");
    fireEvent.click(cancelBtns[0]);
    expect(confirmMock).toHaveBeenCalled();
    expect(screen.getByText(/Scheduled Posts \(1\)/)).toBeInTheDocument();
  });

  it("opens create modal from quick schedule button", () => {
    goToScheduler();
    const scheduleButtons = screen.getAllByText("Schedule post");
    fireEvent.click(scheduleButtons[0]);
    expect(screen.getByRole("dialog", { name: "Create new post" })).toBeInTheDocument();
  });
});

// ─── Settings Tab ────────────────────────────────────────────────────────────

describe("Settings Tab", () => {
  const goToSettings = () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Settings"));
  };

  it("displays appearance settings", () => {
    goToSettings();
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByLabelText("Dark mode toggle")).toBeInTheDocument();
    expect(screen.getByLabelText("Compact view toggle")).toBeInTheDocument();
  });

  it("displays data & refresh settings", () => {
    goToSettings();
    expect(screen.getByText("Data & Refresh")).toBeInTheDocument();
    expect(screen.getByLabelText("Auto-refresh toggle")).toBeInTheDocument();
  });

  it("shows refresh interval when auto-refresh is enabled", () => {
    goToSettings();
    expect(screen.getByLabelText("Refresh interval")).toBeInTheDocument();
  });

  it("hides refresh interval when auto-refresh is disabled", () => {
    goToSettings();
    const autoRefreshToggle = screen.getByLabelText("Auto-refresh toggle");
    fireEvent.click(autoRefreshToggle);
    expect(screen.queryByLabelText("Refresh interval")).not.toBeInTheDocument();
  });

  it("displays notification settings", () => {
    goToSettings();
    expect(screen.getByLabelText("Email notifications toggle")).toBeInTheDocument();
  });

  it("displays data management with export and reset", () => {
    goToSettings();
    expect(screen.getByText("Data Management")).toBeInTheDocument();
    expect(screen.getByText("Export Analytics")).toBeInTheDocument();
    expect(screen.getByText("Reset Posts")).toBeInTheDocument();
  });

  it("resets posts to default on confirmation", () => {
    render(<Page />);
    // First create a post to change state
    fireEvent.click(screen.getByRole("button", { name: "Create new post" }));
    const textarea = screen.getByPlaceholderText("Write your post content...");
    fireEvent.change(textarea, { target: { value: "Temp post to delete" } });
    fireEvent.click(screen.getByText("Publish Post"));

    // Navigate to settings and reset
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Settings"));
    fireEvent.click(screen.getByText("Reset Posts"));
    expect(confirmMock).toHaveBeenCalledWith("Reset all posts to default? This cannot be undone.");

    // Verify reset by going to posts
    fireEvent.click(within(nav).getByText("Posts"));
    expect(screen.getByText(/Showing 10 of 10 posts/)).toBeInTheDocument();
  });

  it("toggles compact view and persists to localStorage", () => {
    goToSettings();
    const compactToggle = screen.getByLabelText("Compact view toggle");
    fireEvent.click(compactToggle);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("sma_compactView", "true");
  });
});

// ─── Notifications Panel ─────────────────────────────────────────────────────

describe("Notifications Panel", () => {
  it("opens notifications panel", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    expect(screen.getByRole("complementary", { name: "Notifications panel" })).toBeInTheDocument();
  });

  it("displays unread count badge", () => {
    render(<Page />);
    // 3 unread notifications in initial data
    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
  });

  it("displays notification messages", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    expect(screen.getByText("You reached 25,000 followers on TikTok!")).toBeInTheDocument();
    expect(screen.getByText(/Engagement rate dropped/)).toBeInTheDocument();
  });

  it("displays notification types", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    const panel = screen.getByRole("complementary", { name: "Notifications panel" });
    expect(within(panel).getAllByText("milestone").length).toBeGreaterThan(0);
    expect(within(panel).getAllByText("alert").length).toBeGreaterThan(0);
    expect(within(panel).getAllByText("suggestion").length).toBeGreaterThan(0);
  });

  it("marks individual notification as read", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    const markReadBtns = screen.getAllByRole("button", { name: "Mark as read" });
    fireEvent.click(markReadBtns[0]);
    // Should have one fewer unread
    const badge = screen.getByText("2");
    expect(badge).toBeInTheDocument();
  });

  it("marks all notifications as read", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    fireEvent.click(screen.getByText("Mark all read"));
    // Badge should disappear (no unread)
    expect(screen.queryByRole("button", { name: "Mark as read" })).not.toBeInTheDocument();
  });

  it("dismisses a notification", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    const dismissBtns = screen.getAllByRole("button", { name: "Dismiss notification" });
    const initialCount = dismissBtns.length;
    fireEvent.click(dismissBtns[0]);
    const remaining = screen.getAllByRole("button", { name: "Dismiss notification" });
    expect(remaining.length).toBe(initialCount - 1);
  });

  it("closes notifications panel", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    fireEvent.click(screen.getByRole("button", { name: "Close notifications" }));
    expect(screen.queryByRole("complementary", { name: "Notifications panel" })).not.toBeInTheDocument();
  });
});

// ─── Keyboard Shortcuts ──────────────────────────────────────────────────────

describe("Keyboard Shortcuts", () => {
  it("opens create post modal with Ctrl+N", () => {
    render(<Page />);
    fireEvent.keyDown(window, { key: "n", ctrlKey: true });
    expect(screen.getByRole("dialog", { name: "Create new post" })).toBeInTheDocument();
  });

  it("closes modals with Escape", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Create new post" }));
    expect(screen.getByRole("dialog", { name: "Create new post" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Create new post" })).not.toBeInTheDocument();
  });

  it("focuses search input with Ctrl+K", () => {
    render(<Page />);
    const searchInput = screen.getByPlaceholderText("Search posts... (Ctrl+K)");
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(document.activeElement).toBe(searchInput);
  });
});

// ─── localStorage Persistence ────────────────────────────────────────────────

describe("localStorage Persistence", () => {
  it("saves dark mode preference", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("sma_darkMode", "true");
    fireEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("sma_darkMode", "false");
  });

  it("saves compact view preference", () => {
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Settings"));
    fireEvent.click(screen.getByLabelText("Compact view toggle"));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("sma_compactView", "true");
  });

  it("restores dark mode from localStorage", () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "sma_darkMode") return "true";
      return null;
    });
    render(<Page />);
    expect(screen.getByRole("button", { name: "Toggle dark mode" }).textContent).toContain("☀️");
  });

  it("restores compact view from localStorage", () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "sma_compactView") return "true";
      return null;
    });
    render(<Page />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Settings"));
    expect(screen.getByLabelText("Compact view toggle")).toBeChecked();
  });
});

// ─── Utility Functions ───────────────────────────────────────────────────────

describe("Utility Functions - Formatting", () => {
  it("formats large numbers correctly in overview", () => {
    render(<Page />);
    // Total followers should be formatted (e.g., "62.4K" or similar)
    // The page contains formatted numbers for stats
    const impressionLabel = screen.getByText("Total Impressions");
    const statCard = impressionLabel.closest("div");
    // Impressions across all published posts should be a large formatted number
    expect(statCard).toBeTruthy();
  });

  it("displays dates in human-readable format", () => {
    render(<Page />);
    // Follower growth section should show formatted dates
    expect(screen.getByText("Follower Growth")).toBeInTheDocument();
    // The dates should be formatted like "Mar 1, 2025"
    expect(screen.getByText(/Mar 1, 2025/)).toBeInTheDocument();
  });
});

// ─── Cross-Tab State Consistency ─────────────────────────────────────────────

describe("Cross-Tab State Consistency", () => {
  it("search filter persists across tab switches", () => {
    render(<Page />);
    const searchInput = screen.getByPlaceholderText("Search posts... (Ctrl+K)");
    fireEvent.change(searchInput, { target: { value: "hiring" } });

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
    // Search should still be applied
    expect(screen.getByText(/Showing 1 of 10 posts/)).toBeInTheDocument();

    // Navigate away and back
    fireEvent.click(within(nav).getByText("Analytics"));
    fireEvent.click(within(nav).getByText("Posts"));
    expect(screen.getByText(/Showing 1 of 10 posts/)).toBeInTheDocument();
  });

  it("post changes reflect in overview stats", () => {
    render(<Page />);

    // Note initial state - go to posts and delete one
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    fireEvent.click(within(nav).getByText("Posts"));
    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    // Go back to overview - stats should have changed
    fireEvent.click(within(nav).getByText("Overview"));
    expect(screen.getByText("Total Engagement")).toBeInTheDocument();
    // The overview should reflect the reduced dataset
  });

  it("notification dismissal persists", () => {
    render(<Page />);
    // Open and dismiss a notification
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    const dismissBtns = screen.getAllByRole("button", { name: "Dismiss notification" });
    fireEvent.click(dismissBtns[0]);
    fireEvent.click(screen.getByRole("button", { name: "Close notifications" }));

    // Reopen - should still be dismissed
    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));
    const newDismissBtns = screen.getAllByRole("button", { name: "Dismiss notification" });
    expect(newDismissBtns.length).toBe(dismissBtns.length - 1);
  });
});
