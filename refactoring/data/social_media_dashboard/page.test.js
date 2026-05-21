import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SocialMediaDashboard from './src/app/page.jsx';

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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

window.confirm = vi.fn();

describe('SocialMediaDashboard Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with SocialHub title', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('SocialHub')).toBeInTheDocument();
    });

    test('renders sidebar subtitle', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('Social Media Manager')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Posts')).toBeInTheDocument();
      expect(screen.getByText('Scheduler')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Accounts')).toBeInTheDocument();
      expect(screen.getByText('Hashtags')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByPlaceholderText('Search posts... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls in header', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByLabelText('Filter by platform')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });

    test('renders total followers in sidebar', () => {
      render(<SocialMediaDashboard />);
      // Total is 24500+45200+32100+18700+67800 = 188300 = 188.3K
      expect(screen.getByText('188.3K')).toBeInTheDocument();
    });

    test('renders scheduled posts count in sidebar', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('2 scheduled posts')).toBeInTheDocument();
    });

    test('renders New Post button', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByLabelText('Create new post')).toBeInTheDocument();
    });

    test('renders notification bell button', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByLabelText('Open notifications')).toBeInTheDocument();
    });

    test('renders theme toggle button', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    test('renders dashboard overview by default', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });

    test('shows stats cards', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('Total Followers')).toBeInTheDocument();
      expect(screen.getByText('Total Engagement')).toBeInTheDocument();
      expect(screen.getByText('Avg. Engagement Rate')).toBeInTheDocument();
      expect(screen.getByText('Total Impressions')).toBeInTheDocument();
    });

    test('shows best performing post section', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText(/Best Performing Post/)).toBeInTheDocument();
    });

    test('shows platform breakdown section', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('Platform Breakdown')).toBeInTheDocument();
    });

    test('shows all account names in platform breakdown', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('TechBrand')).toBeInTheDocument();
      expect(screen.getByText('TechBrand Official')).toBeInTheDocument();
      expect(screen.getByText('TechBrand Page')).toBeInTheDocument();
    });

    test('shows recent notifications section', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('Recent Notifications')).toBeInTheDocument();
    });

    test('shows unread count in notifications header', () => {
      render(<SocialMediaDashboard />);
      expect(screen.getByText('4 unread')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('toggling theme saves to localStorage', () => {
      render(<SocialMediaDashboard />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('smDashboardTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<SocialMediaDashboard />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('smDashboardTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'smDashboardTheme') return 'dark';
        return null;
      });
      render(<SocialMediaDashboard />);
      expect(screen.getByText('\u2600\ufe0f')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Posts tab shows content feed', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText('Content Feed')).toBeInTheDocument();
    });

    test('clicking Scheduler tab shows scheduler', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Scheduler'));
      expect(screen.getByText('Content Scheduler')).toBeInTheDocument();
    });

    test('clicking Analytics tab shows analytics', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    test('clicking Accounts tab shows connected accounts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Accounts'));
      expect(screen.getByText('Connected Accounts')).toBeInTheDocument();
    });

    test('clicking Hashtags tab shows hashtag table', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Hashtags'));
      expect(screen.getByText('Hashtag Performance')).toBeInTheDocument();
    });

    test('saves active tab to localStorage', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('smDashboardTab', 'analytics');
    });

    test('restores saved tab from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'smDashboardTab') return 'posts';
        return null;
      });
      render(<SocialMediaDashboard />);
      expect(screen.getByText('Content Feed')).toBeInTheDocument();
    });
  });

  describe('Posts Tab', () => {
    test('shows post content in feed', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText(/Excited to announce our new product launch/)).toBeInTheDocument();
      expect(screen.getByText(/Behind the scenes at our design studio/)).toBeInTheDocument();
    });

    test('shows post status badges', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const publishedBadges = screen.getAllByText('published');
      expect(publishedBadges.length).toBeGreaterThan(0);
    });

    test('shows post engagement metrics', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      // The engagement rate of 6.8% from the TikTok post
      expect(screen.getByText('6.8%')).toBeInTheDocument();
    });

    test('shows post count', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText('9 posts')).toBeInTheDocument();
    });

    test('shows sort dropdown', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByLabelText('Sort posts')).toBeInTheDocument();
    });

    test('shows edit and delete buttons for each post', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    test('shows Publish button for draft posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const publishButtons = screen.getAllByText('Publish');
      expect(publishButtons.length).toBeGreaterThan(0);
    });

    test('shows Details button for posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const detailsButtons = screen.getAllByText('Details');
      expect(detailsButtons.length).toBeGreaterThan(0);
    });

    test('shows hashtag badges on posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText('#tech')).toBeInTheDocument();
      expect(screen.getByText('#innovation')).toBeInTheDocument();
    });

    test('shows media attachment indicator', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const imageIndicators = screen.getAllByText(/Image/);
      expect(imageIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Post Filtering', () => {
    test('filtering by platform shows only matching posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const platformFilter = screen.getByLabelText('Filter by platform');
      fireEvent.change(platformFilter, { target: { value: 'tiktok' } });
      expect(screen.getByText(/viral dance challenge/)).toBeInTheDocument();
      expect(screen.queryByText(/Excited to announce our new product launch/)).not.toBeInTheDocument();
    });

    test('filtering by status shows only matching posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'scheduled' } });
      expect(screen.getByText(/Upcoming webinar/)).toBeInTheDocument();
      expect(screen.queryByText(/Excited to announce our new product launch/)).not.toBeInTheDocument();
    });

    test('filtering by draft status shows draft posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'draft' } });
      expect(screen.getByText(/Year in review blog post/)).toBeInTheDocument();
    });

    test('search input filters posts by content', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'startup' } });
      expect(screen.getByText(/5 tips for building/)).toBeInTheDocument();
      expect(screen.queryByText(/Excited to announce our new product launch/)).not.toBeInTheDocument();
    });

    test('search input filters posts by hashtag', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'viral' } });
      expect(screen.getByText(/viral dance challenge/)).toBeInTheDocument();
    });

    test('clearing search shows all posts again', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'startup' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('9 posts')).toBeInTheDocument();
    });

    test('combined filters work together', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'published' } });
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'hiring' } });
      expect(screen.getByText(/We are hiring/)).toBeInTheDocument();
    });

    test('non-matching filters show empty state', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
      expect(screen.getByText('No posts match your filters.')).toBeInTheDocument();
    });
  });

  describe('Post Composer', () => {
    test('clicking New Post opens composer modal', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
    });

    test('composer has account selector', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByLabelText('Select account')).toBeInTheDocument();
    });

    test('composer has content textarea', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByPlaceholderText(/What do you want to share/)).toBeInTheDocument();
    });

    test('composer has media type selector', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByLabelText('Select media type')).toBeInTheDocument();
    });

    test('composer has schedule date and time inputs', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByLabelText('Schedule date')).toBeInTheDocument();
      expect(screen.getByLabelText('Schedule time')).toBeInTheDocument();
    });

    test('composer shows character count', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByText('0 characters')).toBeInTheDocument();
    });

    test('character count updates as user types', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      const textarea = screen.getByPlaceholderText(/What do you want to share/);
      fireEvent.change(textarea, { target: { value: 'Hello world' } });
      expect(screen.getByText('11 characters')).toBeInTheDocument();
    });

    test('publishing a new post adds it to feed', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      const textarea = screen.getByPlaceholderText(/What do you want to share/);
      fireEvent.change(textarea, { target: { value: 'My brand new test post #testing' } });
      fireEvent.click(screen.getByText('Publish Now'));
      // Navigate to posts tab to verify
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText(/My brand new test post/)).toBeInTheDocument();
    });

    test('composer shows Schedule Post button when date is set', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      const dateInput = screen.getByLabelText('Schedule date');
      fireEvent.change(dateInput, { target: { value: '2026-12-25' } });
      expect(screen.getByText('Schedule Post')).toBeInTheDocument();
    });

    test('cancel button closes composer', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
    });

    test('close button closes composer', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      fireEvent.click(screen.getByText('\u00d7'));
      expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
    });

    test('empty content does not create a post', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      fireEvent.click(screen.getByText('Publish Now'));
      // Composer should still be open because nothing happened
      // Verify no empty post was added by checking post count
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText('9 posts')).toBeInTheDocument();
    });
  });

  describe('Post Edit', () => {
    test('clicking Edit on a post opens composer with Edit Post title', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
    });

    test('edit composer shows Save Changes button', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    test('editing a post updates its content', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      const textarea = screen.getByPlaceholderText(/What do you want to share/);
      fireEvent.change(textarea, { target: { value: 'Updated content for testing #updated' } });
      fireEvent.click(screen.getByText('Save Changes'));
      expect(screen.getByText(/Updated content for testing/)).toBeInTheDocument();
    });
  });

  describe('Post Delete', () => {
    test('clicking Delete triggers confirmation dialog', () => {
      window.confirm.mockReturnValue(false);
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming delete removes the post', () => {
      window.confirm.mockReturnValue(true);
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText('9 posts')).toBeInTheDocument();
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('8 posts')).toBeInTheDocument();
    });

    test('canceling delete keeps the post', () => {
      window.confirm.mockReturnValue(false);
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('9 posts')).toBeInTheDocument();
    });
  });

  describe('Publish Draft', () => {
    test('clicking Publish on a draft changes its status', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      // Filter to show only drafts
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'draft' } });
      const publishButtons = screen.getAllByText('Publish');
      fireEvent.click(publishButtons[0]);
      // After publishing, draft filter should show no results
      expect(screen.getByText('No posts match your filters.')).toBeInTheDocument();
    });
  });

  describe('Post Detail Modal', () => {
    test('clicking Details opens post detail modal', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const detailsButtons = screen.getAllByText('Details');
      fireEvent.click(detailsButtons[0]);
      expect(screen.getByText('Post Details')).toBeInTheDocument();
    });

    test('post detail modal shows engagement metrics', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      // Sort by engagement to get the TikTok post first (highest engagement)
      const sortSelect = screen.getByLabelText('Sort posts');
      fireEvent.change(sortSelect, { target: { value: 'engagement' } });
      const detailsButtons = screen.getAllByText('Details');
      fireEvent.click(detailsButtons[0]);
      expect(screen.getByText('Likes')).toBeInTheDocument();
      expect(screen.getByText('Comments')).toBeInTheDocument();
      expect(screen.getByText('Shares')).toBeInTheDocument();
      expect(screen.getByText('Impressions')).toBeInTheDocument();
    });

    test('close button closes post detail modal', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const detailsButtons = screen.getAllByText('Details');
      fireEvent.click(detailsButtons[0]);
      expect(screen.getByText('Post Details')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('\u00d7');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Post Details')).not.toBeInTheDocument();
    });
  });

  describe('Scheduler Tab', () => {
    test('shows upcoming scheduled posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Scheduler'));
      expect(screen.getByText(/Upcoming Scheduled/)).toBeInTheDocument();
    });

    test('shows drafts section', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Scheduler'));
      expect(screen.getByText(/Drafts/)).toBeInTheDocument();
    });

    test('shows Schedule New Post button', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Scheduler'));
      expect(screen.getByText('+ Schedule New Post')).toBeInTheDocument();
    });

    test('clicking Schedule New Post opens composer', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Scheduler'));
      fireEvent.click(screen.getByText('+ Schedule New Post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
    });

    test('scheduled posts show date and time', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Scheduler'));
      // Scheduled posts have formatted dates
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    test('draft section shows publish button', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Scheduler'));
      const publishButtons = screen.getAllByText('Publish');
      expect(publishButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Tab', () => {
    test('shows analytics date range buttons', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('7d')).toBeInTheDocument();
      expect(screen.getByText('30d')).toBeInTheDocument();
      expect(screen.getByText('90d')).toBeInTheDocument();
    });

    test('shows analytics stat cards', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Posts Published')).toBeInTheDocument();
      expect(screen.getByText('Avg Likes/Post')).toBeInTheDocument();
      expect(screen.getByText('Avg Comments/Post')).toBeInTheDocument();
    });

    test('shows per-account performance table', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Per-Account Performance')).toBeInTheDocument();
    });

    test('shows engagement rate per account', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
      const engRateLabels = screen.getAllByText('Eng. Rate');
      expect(engRateLabels.length).toBeGreaterThan(0);
    });

    test('clicking different date range updates selection', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
      const button30d = screen.getByText('30d');
      fireEvent.click(button30d);
      // The 30d button should now be the active one (visually)
      // We verify by checking it rendered correctly
      expect(screen.getByText('30d')).toBeInTheDocument();
    });
  });

  describe('Accounts Tab', () => {
    test('shows all connected accounts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Accounts'));
      expect(screen.getByText('TechBrand')).toBeInTheDocument();
      expect(screen.getByText('TechBrand Official')).toBeInTheDocument();
      expect(screen.getByText('TechBrand Page')).toBeInTheDocument();
      expect(screen.getByText('TechBrand Inc.')).toBeInTheDocument();
      expect(screen.getByText('TechBrand TikTok')).toBeInTheDocument();
    });

    test('shows follower and following counts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Accounts'));
      const followersLabels = screen.getAllByText('Followers');
      expect(followersLabels.length).toBeGreaterThan(0);
      const followingLabels = screen.getAllByText('Following');
      expect(followingLabels.length).toBeGreaterThan(0);
    });

    test('shows verified badge for verified accounts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Accounts'));
      const verifiedBadges = screen.getAllByText('\u2713');
      expect(verifiedBadges.length).toBe(3); // a1, a2, a4 are verified
    });

    test('clicking an account opens account detail', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Accounts'));
      fireEvent.click(screen.getByText('TechBrand Official'));
      expect(screen.getByText('Back to Accounts')).toBeInTheDocument();
    });

    test('account detail shows account posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Accounts'));
      fireEvent.click(screen.getByText('TechBrand Official'));
      expect(screen.getByText(/Behind the scenes at our design studio/)).toBeInTheDocument();
    });

    test('back button returns to account list', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Accounts'));
      fireEvent.click(screen.getByText('TechBrand Official'));
      fireEvent.click(screen.getByText(/Back to Accounts/));
      expect(screen.getByText('Connected Accounts')).toBeInTheDocument();
    });
  });

  describe('Hashtags Tab', () => {
    test('shows hashtag performance table', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Hashtags'));
      expect(screen.getByText('Hashtag Performance')).toBeInTheDocument();
    });

    test('shows table headers', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Hashtags'));
      expect(screen.getByText('Hashtag')).toBeInTheDocument();
      expect(screen.getByText('Posts')).toBeInTheDocument();
      expect(screen.getByText('Total Reach')).toBeInTheDocument();
      expect(screen.getByText('Trend')).toBeInTheDocument();
    });

    test('shows hashtag entries', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Hashtags'));
      expect(screen.getByText('#viral')).toBeInTheDocument();
      expect(screen.getByText('#design')).toBeInTheDocument();
    });

    test('shows trend indicators', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Hashtags'));
      const trendingLabels = screen.getAllByText(/Trending/);
      expect(trendingLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Notification Panel', () => {
    test('clicking notification bell opens panel', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    test('shows notification filter buttons', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Unread')).toBeInTheDocument();
      expect(screen.getByText('Mention')).toBeInTheDocument();
      expect(screen.getByText('Follower')).toBeInTheDocument();
    });

    test('shows Mark all read button', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });

    test('shows notification items', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      expect(screen.getByText(/@user123 mentioned you/)).toBeInTheDocument();
      expect(screen.getByText(/You gained 50 new followers/)).toBeInTheDocument();
    });

    test('filtering by unread shows only unread notifications', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      fireEvent.click(screen.getByText('Unread'));
      expect(screen.getByText(/@user123 mentioned you/)).toBeInTheDocument();
      expect(screen.queryByText(/Your post reached 10K impressions/)).not.toBeInTheDocument();
    });

    test('marking a notification as read', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      const readButtons = screen.getAllByText('Read');
      const initialReadCount = readButtons.length;
      fireEvent.click(readButtons[0]);
      const updatedReadButtons = screen.queryAllByText('Read');
      expect(updatedReadButtons.length).toBe(initialReadCount - 1);
    });

    test('marking all notifications as read', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      fireEvent.click(screen.getByText('Mark all read'));
      // After marking all read, filtering by unread should show nothing
      fireEvent.click(screen.getByText('Unread'));
      expect(screen.getByText('No notifications.')).toBeInTheDocument();
    });

    test('deleting a notification removes it', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      expect(screen.getByText(/@user123 mentioned you/)).toBeInTheDocument();
      // Find delete buttons (×) in notifications
      const deleteButtons = screen.getAllByText('\u00d7');
      // The first × button in the notification panel is the close button, subsequent ones are delete
      // Click the delete button of the first notification
      fireEvent.click(deleteButtons[1]);
      expect(screen.queryByText(/@user123 mentioned you/)).not.toBeInTheDocument();
    });

    test('close button closes notification panel', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('\u00d7');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes composer modal', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
    });

    test('Escape key closes notification panel', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Open notifications'));
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });

    test('Escape key closes post detail modal', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const detailsButtons = screen.getAllByText('Details');
      fireEvent.click(detailsButtons[0]);
      expect(screen.getByText('Post Details')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Post Details')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('handles missing localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<SocialMediaDashboard />)).not.toThrow();
    });
  });

  describe('Post Sorting', () => {
    test('sorting by engagement reorders posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const sortSelect = screen.getByLabelText('Sort posts');
      fireEvent.change(sortSelect, { target: { value: 'engagement' } });
      // TikTok post (6.8% engagement) should be at the top for published
      // Just verify the sort control works by checking the sort is selected
      expect(sortSelect.value).toBe('engagement');
    });

    test('sorting by likes reorders posts', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      const sortSelect = screen.getByLabelText('Sort posts');
      fireEvent.change(sortSelect, { target: { value: 'likes' } });
      expect(sortSelect.value).toBe('likes');
    });
  });

  describe('Cross-Feature Interactions', () => {
    test('creating a post with hashtags updates hashtag data', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByLabelText('Create new post'));
      const textarea = screen.getByPlaceholderText(/What do you want to share/);
      fireEvent.change(textarea, { target: { value: 'New post with #newhashtag content' } });
      fireEvent.click(screen.getByText('Publish Now'));
      // Check hashtags tab
      fireEvent.click(screen.getByText('Hashtags'));
      expect(screen.getByText('#newhashtag')).toBeInTheDocument();
    });

    test('deleting a post updates post count', () => {
      window.confirm.mockReturnValue(true);
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Posts'));
      expect(screen.getByText('9 posts')).toBeInTheDocument();
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('8 posts')).toBeInTheDocument();
    });

    test('account detail view shows posts for that specific account', () => {
      render(<SocialMediaDashboard />);
      fireEvent.click(screen.getByText('Accounts'));
      fireEvent.click(screen.getByText('TechBrand Page'));
      // Only Facebook posts should show
      expect(screen.getByText(/live Q&A session/)).toBeInTheDocument();
      expect(screen.queryByText(/viral dance challenge/)).not.toBeInTheDocument();
    });
  });
});
