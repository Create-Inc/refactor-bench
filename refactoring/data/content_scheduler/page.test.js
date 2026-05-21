import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentScheduler from './src/app/page.jsx';

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

// Mock confirm dialog
window.confirm = vi.fn();

describe('ContentScheduler Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with ContentCal title', () => {
      render(<ContentScheduler />);
      expect(screen.getByText('ContentCal')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<ContentScheduler />);
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('All Posts')).toBeInTheDocument();
      expect(screen.getByText('Drafts')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<ContentScheduler />);
      expect(screen.getByPlaceholderText('Search posts... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls', () => {
      render(<ContentScheduler />);
      expect(screen.getByLabelText('Filter by platform')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
    });

    test('renders calendar view by default', () => {
      render(<ContentScheduler />);
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    test('renders quick stats in sidebar', () => {
      render(<ContentScheduler />);
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      expect(screen.getByText(/scheduled/)).toBeInTheDocument();
      expect(screen.getByText(/drafts/)).toBeInTheDocument();
      expect(screen.getByText(/published/)).toBeInTheDocument();
    });

    test('renders new post button', () => {
      render(<ContentScheduler />);
      expect(screen.getByText('+ New Post')).toBeInTheDocument();
    });

    test('renders day-of-week headers in calendar', () => {
      render(<ContentScheduler />);
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<ContentScheduler />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<ContentScheduler />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('schedulerTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<ContentScheduler />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('schedulerTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'schedulerTheme') return 'dark';
        return null;
      });
      render(<ContentScheduler />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking All Posts shows list view', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      expect(screen.getByText(/All Posts \(/)).toBeInTheDocument();
    });

    test('clicking Drafts shows drafts view', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Drafts'));
      expect(screen.getByText(/Drafts \(/)).toBeInTheDocument();
    });

    test('clicking Analytics shows analytics dashboard', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('clicking Settings shows settings view', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Connected Platforms')).toBeInTheDocument();
    });

    test('clicking Calendar returns to calendar view', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      fireEvent.click(screen.getByText('Calendar'));
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    });

    test('saves active view to localStorage', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('schedulerView', 'analytics');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<ContentScheduler />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<ContentScheduler />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Calendar')).not.toBeInTheDocument();
      expect(screen.queryByText('All Posts')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<ContentScheduler />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search input filters posts by content', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'product launch' } });
      expect(screen.getByText(/Excited to announce our new product launch/)).toBeInTheDocument();
    });

    test('search input filters posts by hashtag', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'growthhack' } });
      expect(screen.getByText(/Quick tip/)).toBeInTheDocument();
    });

    test('clearing search shows all posts again', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'product launch' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      // Should see multiple posts
      expect(screen.getByText(/Excited to announce/)).toBeInTheDocument();
      expect(screen.getByText(/Behind the scenes/)).toBeInTheDocument();
    });
  });

  describe('Platform Filter', () => {
    test('filtering by tiktok shows only TikTok posts', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const platformFilter = screen.getByLabelText('Filter by platform');
      fireEvent.change(platformFilter, { target: { value: 'tiktok' } });
      // No initial posts target TikTok, so should show empty
      expect(screen.getByText('No posts match your filters.')).toBeInTheDocument();
    });

    test('selecting All Platforms shows all posts', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const platformFilter = screen.getByLabelText('Filter by platform');
      fireEvent.change(platformFilter, { target: { value: 'instagram' } });
      fireEvent.change(platformFilter, { target: { value: 'all' } });
      expect(screen.getByText(/Excited to announce/)).toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    test('filtering by draft shows only draft posts', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'draft' } });
      expect(screen.getByText(/Did you know/)).toBeInTheDocument();
      expect(screen.getByText(/We're hiring/)).toBeInTheDocument();
      expect(screen.queryByText(/Excited to announce/)).not.toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('filtering by educational shows only educational posts', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'educational' } });
      expect(screen.getByText(/Did you know/)).toBeInTheDocument();
      expect(screen.getByText(/Quick tip/)).toBeInTheDocument();
      expect(screen.queryByText(/Excited to announce/)).not.toBeInTheDocument();
    });
  });

  describe('Post Editor - Create', () => {
    test('clicking New Post opens editor modal', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
    });

    test('editor modal has content textarea', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      expect(screen.getByPlaceholderText('Write your post content...')).toBeInTheDocument();
    });

    test('editor modal has platform selection buttons', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      expect(screen.getByLabelText('Select Twitter/X')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Instagram')).toBeInTheDocument();
      expect(screen.getByLabelText('Select LinkedIn')).toBeInTheDocument();
    });

    test('editor modal has category select', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      expect(screen.getByLabelText('Select category')).toBeInTheDocument();
    });

    test('editor modal has hashtag input', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      expect(screen.getByPlaceholderText('marketing, social, growth')).toBeInTheDocument();
    });

    test('editor shows character count', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      const textarea = screen.getByPlaceholderText('Write your post content...');
      fireEvent.change(textarea, { target: { value: 'Hello world' } });
      expect(screen.getByText('11 characters')).toBeInTheDocument();
    });

    test('create button is disabled without content', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      const createButton = screen.getByText('Create Post');
      expect(createButton).toBeDisabled();
    });

    test('creating a post adds it to list', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      const textarea = screen.getByPlaceholderText('Write your post content...');
      fireEvent.change(textarea, { target: { value: 'My test post content here' } });
      // Select a platform
      fireEvent.click(screen.getByLabelText('Select Twitter/X'));
      fireEvent.click(screen.getByText('Create Post'));
      // Navigate to All Posts to verify
      fireEvent.click(screen.getByText('All Posts'));
      expect(screen.getByText(/My test post content here/)).toBeInTheDocument();
    });

    test('creating a post shows success notification', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      const textarea = screen.getByPlaceholderText('Write your post content...');
      fireEvent.change(textarea, { target: { value: 'Notification test post' } });
      fireEvent.click(screen.getByLabelText('Select Twitter/X'));
      fireEvent.click(screen.getByText('Create Post'));
      expect(screen.getByText('Post created successfully!')).toBeInTheDocument();
    });

    test('cancel button closes editor', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
    });

    test('close X button closes editor', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
    });
  });

  describe('Post Editor - Edit', () => {
    test('clicking Edit opens editor with post content', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
    });

    test('saving edited post shows update notification', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      fireEvent.click(screen.getByText('Save Changes'));
      expect(screen.getByText('Post updated successfully!')).toBeInTheDocument();
    });
  });

  describe('Post Actions', () => {
    test('duplicate button creates a copy', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const duplicateButtons = screen.getAllByText('Duplicate');
      fireEvent.click(duplicateButtons[0]);
      expect(screen.getByText('Post duplicated as draft.')).toBeInTheDocument();
    });

    test('delete button opens confirmation', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Delete Post?')).toBeInTheDocument();
    });

    test('confirming delete removes the post', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      // Confirm deletion
      const confirmDeleteButton = screen.getAllByText('Delete').find(
        (btn) => btn.closest('div[style*="position: fixed"]')
      );
      fireEvent.click(confirmDeleteButton);
      expect(screen.getByText('Post deleted.')).toBeInTheDocument();
    });

    test('cancelling delete keeps the post', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Delete Post?')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Delete Post?')).not.toBeInTheDocument();
    });
  });

  describe('Bulk Selection', () => {
    test('selecting posts shows selection count', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    test('bulk delete requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(screen.getByText('Delete Selected'));
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming bulk delete removes posts', () => {
      window.confirm.mockReturnValue(true);
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      fireEvent.click(screen.getByText('Delete Selected'));
      expect(screen.getByText(/posts deleted/)).toBeInTheDocument();
    });

    test('deselecting a post removes it from selection', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      expect(screen.getByText('1 selected')).toBeInTheDocument();
      fireEvent.click(checkboxes[0]);
      expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    });
  });

  describe('Calendar Navigation', () => {
    test('clicking next month changes displayed month', () => {
      render(<ContentScheduler />);
      const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      expect(screen.getByText(currentMonthName)).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Next month'));
      const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1);
      const nextMonthName = nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      expect(screen.getByText(nextMonthName)).toBeInTheDocument();
    });

    test('clicking previous month changes displayed month', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByLabelText('Previous month'));
      const prevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1);
      const prevMonthName = prevMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      expect(screen.getByText(prevMonthName)).toBeInTheDocument();
    });

    test('Today button returns to current month', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByLabelText('Next month'));
      fireEvent.click(screen.getByLabelText('Next month'));
      fireEvent.click(screen.getByText('Today'));
      const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      expect(screen.getByText(currentMonthName)).toBeInTheDocument();
    });
  });

  describe('Analytics View', () => {
    test('shows stats cards', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Total Impressions')).toBeInTheDocument();
      expect(screen.getByText('Total Likes')).toBeInTheDocument();
      expect(screen.getByText('Total Shares')).toBeInTheDocument();
      expect(screen.getByText('Avg Engagement')).toBeInTheDocument();
    });

    test('shows platform performance section', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Platform Performance')).toBeInTheDocument();
    });

    test('shows category performance section', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Category Performance')).toBeInTheDocument();
    });

    test('shows top performing posts', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Top Performing Posts')).toBeInTheDocument();
    });

    test('clicking a top post opens analytics detail modal', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Analytics'));
      // Click a top performing post
      const topPostSection = screen.getByText('Top Performing Posts');
      const postItems = topPostSection.parentElement.querySelectorAll('[style*="cursor: pointer"]');
      if (postItems.length > 0) {
        fireEvent.click(postItems[0]);
        expect(screen.getByText('Post Analytics')).toBeInTheDocument();
        expect(screen.getByText('Impressions')).toBeInTheDocument();
        expect(screen.getByText('Likes')).toBeInTheDocument();
        expect(screen.getByText('Shares')).toBeInTheDocument();
        expect(screen.getByText('Comments')).toBeInTheDocument();
      }
    });
  });

  describe('Drafts View', () => {
    test('shows draft posts', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Drafts'));
      expect(screen.getByText(/Did you know/)).toBeInTheDocument();
      expect(screen.getByText(/We're hiring/)).toBeInTheDocument();
    });

    test('shows correct draft count', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Drafts'));
      expect(screen.getByText('Drafts (2)')).toBeInTheDocument();
    });
  });

  describe('Settings View', () => {
    test('shows all platforms', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('TikTok')).toBeInTheDocument();
    });

    test('connected platforms show Connected status', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      const connectedButtons = screen.getAllByText('Connected');
      // Twitter, Instagram, LinkedIn, Facebook are connected by default
      expect(connectedButtons.length).toBe(4);
    });

    test('disconnected platforms show Connect button', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      // TikTok is not connected by default
      const connectButtons = screen.getAllByText('Connect');
      expect(connectButtons.length).toBe(1);
    });

    test('toggling platform connection updates status', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      // Connect TikTok
      const connectButton = screen.getByLabelText('Connect TikTok');
      fireEvent.click(connectButton);
      expect(screen.getAllByText('Connected').length).toBe(5);
    });

    test('disconnecting a platform updates status', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      const disconnectButton = screen.getByLabelText('Disconnect Twitter/X');
      fireEvent.click(disconnectButton);
      expect(screen.getAllByText('Connect').length).toBe(2);
    });

    test('shows appearance settings', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    });

    test('dark mode toggle in settings works', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      const darkModeButton = screen.getByLabelText('Toggle dark mode');
      fireEvent.click(darkModeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('schedulerTheme', 'dark');
    });

    test('shows max character counts for platforms', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Max 280 characters')).toBeInTheDocument();
      expect(screen.getByText('Max 3000 characters')).toBeInTheDocument();
    });
  });

  describe('Platform Validation in Editor', () => {
    test('shows validation error when content exceeds platform limit', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      const textarea = screen.getByPlaceholderText('Write your post content...');
      // Twitter limit is 280 chars, create content > 280
      const longContent = 'A'.repeat(300);
      fireEvent.change(textarea, { target: { value: longContent } });
      // Select Twitter
      fireEvent.click(screen.getByLabelText('Select Twitter/X'));
      expect(screen.getByText(/Exceeds Twitter\/X limit/)).toBeInTheDocument();
    });

    test('no validation error within platform limit', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      const textarea = screen.getByPlaceholderText('Write your post content...');
      fireEvent.change(textarea, { target: { value: 'Short post' } });
      fireEvent.click(screen.getByLabelText('Select Twitter/X'));
      expect(screen.queryByText(/Exceeds/)).not.toBeInTheDocument();
    });

    test('disconnected platform buttons are disabled in editor', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      // TikTok is not connected by default
      const tiktokButton = screen.getByLabelText('Select TikTok');
      expect(tiktokButton).toBeDisabled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes post editor', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
    });

    test('Escape key closes delete confirmation', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Delete Post?')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Delete Post?')).not.toBeInTheDocument();
    });

    test('Escape key closes analytics detail modal', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('Analytics'));
      const topPostSection = screen.getByText('Top Performing Posts');
      const postItems = topPostSection.parentElement.querySelectorAll('[style*="cursor: pointer"]');
      if (postItems.length > 0) {
        fireEvent.click(postItems[0]);
        expect(screen.getByText('Post Analytics')).toBeInTheDocument();
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByText('Post Analytics')).not.toBeInTheDocument();
      }
    });
  });

  describe('localStorage Persistence', () => {
    test('posts are saved to localStorage', () => {
      render(<ContentScheduler />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'schedulerPosts',
        expect.any(String)
      );
    });

    test('connected platforms are saved to localStorage', () => {
      render(<ContentScheduler />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'schedulerConnectedPlatforms',
        expect.any(String)
      );
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'schedulerView') return 'analytics';
        return null;
      });
      render(<ContentScheduler />);
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'schedulerPosts') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<ContentScheduler />)).not.toThrow();
    });

    test('saved posts are loaded from localStorage', () => {
      const customPosts = JSON.stringify([
        {
          id: 'pCustom', content: 'Custom saved post from storage',
          platforms: ['twitter'], category: 'marketing', status: 'draft',
          scheduledDate: '', scheduledHour: 9, scheduledMinute: 0,
          media: [], hashtags: [], createdAt: Date.now(),
          engagement: { likes: 0, shares: 0, comments: 0, impressions: 0 },
        },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'schedulerPosts') return customPosts;
        return null;
      });
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      expect(screen.getByText('Custom saved post from storage')).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    test('search and platform filter work together', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'hiring' } });
      const platformFilter = screen.getByLabelText('Filter by platform');
      fireEvent.change(platformFilter, { target: { value: 'linkedin' } });
      expect(screen.getByText(/We're hiring/)).toBeInTheDocument();
    });

    test('non-matching combined filters show empty state', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('All Posts'));
      const searchInput = screen.getByPlaceholderText('Search posts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'product launch' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'educational' } });
      expect(screen.getByText('No posts match your filters.')).toBeInTheDocument();
    });
  });

  describe('Notification Banner', () => {
    test('notification appears after creating a post', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      const textarea = screen.getByPlaceholderText('Write your post content...');
      fireEvent.change(textarea, { target: { value: 'Notification test' } });
      fireEvent.click(screen.getByLabelText('Select LinkedIn'));
      fireEvent.click(screen.getByText('Create Post'));
      expect(screen.getByText('Post created successfully!')).toBeInTheDocument();
    });

    test('notification can be dismissed with X button', () => {
      render(<ContentScheduler />);
      fireEvent.click(screen.getByText('+ New Post'));
      const textarea = screen.getByPlaceholderText('Write your post content...');
      fireEvent.change(textarea, { target: { value: 'Dismiss test' } });
      fireEvent.click(screen.getByLabelText('Select LinkedIn'));
      fireEvent.click(screen.getByText('Create Post'));
      expect(screen.getByText('Post created successfully!')).toBeInTheDocument();
      // Find the dismiss button inside the notification
      const dismissButton = screen.getByText('Post created successfully!').parentElement.querySelector('button');
      fireEvent.click(dismissButton);
      expect(screen.queryByText('Post created successfully!')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<ContentScheduler />)).not.toThrow();
    });
  });
});
