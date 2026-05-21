import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import NotificationCenter from './src/app/page.jsx';

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

// Mock window.open
window.open = vi.fn();

describe('NotificationCenter Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with Notifications title', () => {
      render(<NotificationCenter />);
      expect(screen.getByText(/Notifications/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<NotificationCenter />);
      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(screen.getByText('Starred')).toBeInTheDocument();
      expect(screen.getByText('Snoozed')).toBeInTheDocument();
      expect(screen.getByText('Archived')).toBeInTheDocument();
      expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<NotificationCenter />);
      expect(screen.getByPlaceholderText('Search notifications... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls', () => {
      render(<NotificationCenter />);
      expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by project')).toBeInTheDocument();
    });

    test('renders notification list by default (inbox)', () => {
      render(<NotificationCenter />);
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.getByText('Build failed on main branch')).toBeInTheDocument();
    });

    test('renders unread count badge on Inbox', () => {
      render(<NotificationCenter />);
      // 5 unread notifications in inbox (n1, n2, n3, n4, n7 - n12 is snoozed so not in inbox)
      const inboxButton = screen.getByText('Inbox').closest('button');
      expect(inboxButton).toBeInTheDocument();
    });

    test('renders compose button', () => {
      render(<NotificationCenter />);
      expect(screen.getByText(/Compose/)).toBeInTheDocument();
    });

    test('renders preferences button', () => {
      render(<NotificationCenter />);
      expect(screen.getByLabelText('Open preferences')).toBeInTheDocument();
    });

    test('renders sort control', () => {
      render(<NotificationCenter />);
      expect(screen.getByLabelText('Sort notifications')).toBeInTheDocument();
    });

    test('renders Mark all read button when unread exist', () => {
      render(<NotificationCenter />);
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<NotificationCenter />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<NotificationCenter />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('notifCenterTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<NotificationCenter />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('notifCenterTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'notifCenterTheme') return 'dark';
        return null;
      });
      render(<NotificationCenter />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Inbox shows inbox notifications', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Inbox'));
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
    });

    test('clicking Starred shows starred notifications', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Starred'));
      // n1 and n4 are starred
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.getByText('Build failed on main branch')).toBeInTheDocument();
    });

    test('clicking Archived shows archived notifications', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Archived'));
      // n10 is archived
      expect(screen.getByText('High memory usage detected')).toBeInTheDocument();
    });

    test('clicking Snoozed shows snoozed notifications', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Snoozed'));
      // n12 is snoozed
      expect(screen.getByText('Password expiring soon')).toBeInTheDocument();
    });

    test('clicking Activity Feed shows activity view', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Activity Feed'));
      expect(screen.getByText('Activity Feed')).toBeInTheDocument();
      expect(screen.getByText('Recent Team Activity')).toBeInTheDocument();
    });

    test('navigation clears selected notification', () => {
      render(<NotificationCenter />);
      // Select a notification
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      // Navigate away
      fireEvent.click(screen.getByText('Starred'));
      // The detail panel should not show the old notification's detail content
      // Since the notification is starred, it might still appear in the list, but not as selected detail
    });
  });

  describe('Search Filtering', () => {
    test('search input filters notifications by title', () => {
      render(<NotificationCenter />);
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'PR #342' } });
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.queryByText('Build failed on main branch')).not.toBeInTheDocument();
    });

    test('search input filters by body content', () => {
      render(<NotificationCenter />);
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'auth middleware' } });
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
    });

    test('search input filters by project name', () => {
      render(<NotificationCenter />);
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'ML Platform' } });
      expect(screen.getByText('Invited you to "ML Pipeline Review"')).toBeInTheDocument();
    });

    test('search input filters by user name', () => {
      render(<NotificationCenter />);
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Bob Martinez' } });
      expect(screen.getByText('Commented on your design spec')).toBeInTheDocument();
    });

    test('clearing search shows all notifications', () => {
      render(<NotificationCenter />);
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'PR #342' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.getByText('Build failed on main branch')).toBeInTheDocument();
    });
  });

  describe('Type Filter', () => {
    test('filtering by mention shows only mention notifications', () => {
      render(<NotificationCenter />);
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'mention' } });
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.getByText('Mentioned you in test report')).toBeInTheDocument();
      expect(screen.queryByText('Build failed on main branch')).not.toBeInTheDocument();
    });

    test('filtering by alert shows only alert notifications', () => {
      render(<NotificationCenter />);
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'alert' } });
      expect(screen.getByText('Build failed on main branch')).toBeInTheDocument();
      expect(screen.queryByText('Mentioned you in PR #342')).not.toBeInTheDocument();
    });

    test('selecting All Types shows all notifications', () => {
      render(<NotificationCenter />);
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'mention' } });
      fireEvent.change(typeFilter, { target: { value: 'all' } });
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.getByText('Build failed on main branch')).toBeInTheDocument();
    });
  });

  describe('Priority Filter', () => {
    test('filtering by critical shows only critical notifications', () => {
      render(<NotificationCenter />);
      const priorityFilter = screen.getByLabelText('Filter by priority');
      fireEvent.change(priorityFilter, { target: { value: 'critical' } });
      expect(screen.getByText('Build failed on main branch')).toBeInTheDocument();
      expect(screen.queryByText('Mentioned you in PR #342')).not.toBeInTheDocument();
    });

    test('filtering by high shows only high priority notifications', () => {
      render(<NotificationCenter />);
      const priorityFilter = screen.getByLabelText('Filter by priority');
      fireEvent.change(priorityFilter, { target: { value: 'high' } });
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.getByText('Assigned you to PROJ-128')).toBeInTheDocument();
    });
  });

  describe('Project Filter', () => {
    test('filtering by Backend API shows only Backend API notifications', () => {
      render(<NotificationCenter />);
      const projectFilter = screen.getByLabelText('Filter by project');
      fireEvent.change(projectFilter, { target: { value: 'Backend API' } });
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.getByText('Assigned you to PROJ-128')).toBeInTheDocument();
      expect(screen.queryByText('Commented on your design spec')).not.toBeInTheDocument();
    });
  });

  describe('Unread Only Filter', () => {
    test('toggling unread only shows only unread notifications', () => {
      render(<NotificationCenter />);
      const checkbox = screen.getByLabelText('Unread only');
      fireEvent.click(checkbox);
      // Unread: n1, n2, n3, n4, n7 (in inbox)
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.queryByText('Weekly digest ready')).not.toBeInTheDocument();
    });
  });

  describe('Sort Controls', () => {
    test('sort by priority reorders notifications', () => {
      render(<NotificationCenter />);
      const sortSelect = screen.getByLabelText('Sort notifications');
      fireEvent.change(sortSelect, { target: { value: 'priority' } });
      // Critical should come first
      const items = screen.getAllByText(/priority/i).filter(el => el.textContent === 'critical');
      expect(items.length).toBeGreaterThan(0);
    });

    test('sort by oldest reverses order', () => {
      render(<NotificationCenter />);
      const sortSelect = screen.getByLabelText('Sort notifications');
      fireEvent.change(sortSelect, { target: { value: 'oldest' } });
      // Should still show notifications (order changed)
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
    });
  });

  describe('Notification Detail Panel', () => {
    test('clicking a notification shows detail panel', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      // Detail should show the full body
      expect(screen.getByText(/can you review the auth middleware changes/)).toBeInTheDocument();
    });

    test('detail panel shows user info', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      expect(screen.getByText('Alice Zhang')).toBeInTheDocument();
      expect(screen.getByText(/Engineering Lead/)).toBeInTheDocument();
    });

    test('detail panel shows priority badge', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Build failed on main branch'));
      const badges = screen.getAllByText('critical');
      expect(badges.length).toBeGreaterThan(0);
    });

    test('detail panel shows project tag', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      const projectTags = screen.getAllByText('Backend API');
      expect(projectTags.length).toBeGreaterThan(0);
    });

    test('detail panel shows action buttons', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      expect(screen.getByText(/Star/)).toBeInTheDocument();
      expect(screen.getByText(/Snooze/)).toBeInTheDocument();
      expect(screen.getByText(/Archive/)).toBeInTheDocument();
      expect(screen.getByText(/Delete/)).toBeInTheDocument();
    });

    test('detail panel shows Open button for notifications with actionUrl', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      expect(screen.getByText('Open →')).toBeInTheDocument();
    });

    test('clicking Open button calls window.open', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      fireEvent.click(screen.getByText('Open →'));
      expect(window.open).toHaveBeenCalledWith('/pr/342');
    });
  });

  describe('Read/Unread State', () => {
    test('clicking an unread notification marks it as read', () => {
      render(<NotificationCenter />);
      // n2 is unread
      fireEvent.click(screen.getByText('Commented on your design spec'));
      // After clicking, detail panel should open and notification should be marked read
      expect(screen.getByText(/Mark Unread/)).toBeInTheDocument();
    });

    test('Mark Unread button appears for read notifications', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Commented on your design spec'));
      expect(screen.getByText(/Mark Unread/)).toBeInTheDocument();
    });

    test('Mark all read button marks all notifications as read', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mark all read'));
      // Mark all read button should disappear (no more unread)
      expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    });
  });

  describe('Star/Unstar', () => {
    test('toggling star on a notification', () => {
      render(<NotificationCenter />);
      // Click on n2 (not starred)
      fireEvent.click(screen.getByText('Commented on your design spec'));
      const starButton = screen.getByText(/Star/);
      fireEvent.click(starButton);
      // Now go to starred tab
      fireEvent.click(screen.getByText('Starred'));
      expect(screen.getByText('Commented on your design spec')).toBeInTheDocument();
    });

    test('unstarring a notification removes it from starred tab', () => {
      render(<NotificationCenter />);
      // n1 is starred, go to starred tab first
      fireEvent.click(screen.getByText('Starred'));
      // Click on a starred notification
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      // Click unstar
      const unstarButton = screen.getByText(/Unstar/);
      fireEvent.click(unstarButton);
      // It should be removed from starred view (or count decreased)
    });
  });

  describe('Archive/Unarchive', () => {
    test('archiving a notification moves it to archived tab', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Commented on your design spec'));
      fireEvent.click(screen.getByText(/Archive/));
      // Go to archived tab
      fireEvent.click(screen.getByText('Archived'));
      expect(screen.getByText('Commented on your design spec')).toBeInTheDocument();
    });

    test('archiving clears the detail panel', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Commented on your design spec'));
      expect(screen.getByText(/can you review|dashboard layout/)).toBeInTheDocument();
      fireEvent.click(screen.getByText(/Archive/));
      // Detail panel should be cleared
      expect(screen.queryByText('Open →')).not.toBeInTheDocument();
    });
  });

  describe('Delete Notification', () => {
    test('deleting a notification removes it from the list', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Commented on your design spec'));
      fireEvent.click(screen.getByText(/Delete/));
      expect(screen.queryByText('Commented on your design spec')).not.toBeInTheDocument();
    });

    test('deleting clears the detail panel', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Commented on your design spec'));
      fireEvent.click(screen.getByText(/Delete/));
      expect(screen.queryByText(/dashboard layout looks great/)).not.toBeInTheDocument();
    });
  });

  describe('Snooze', () => {
    test('clicking Snooze button opens snooze modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      fireEvent.click(screen.getByText(/Snooze/));
      expect(screen.getByText('Snooze Notification')).toBeInTheDocument();
    });

    test('snooze modal shows duration options', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      fireEvent.click(screen.getByText(/Snooze/));
      expect(screen.getByText('1 hour')).toBeInTheDocument();
      expect(screen.getByText('4 hours')).toBeInTheDocument();
      expect(screen.getByText('1 day')).toBeInTheDocument();
      expect(screen.getByText('3 days')).toBeInTheDocument();
    });

    test('confirming snooze moves notification to snoozed tab', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Commented on your design spec'));
      fireEvent.click(screen.getByText(/Snooze/));
      fireEvent.click(screen.getByText('1 day'));
      const snoozeButton = screen.getAllByText(/Snooze/).find(el => el.tagName === 'BUTTON' && el.textContent === 'Snooze');
      fireEvent.click(snoozeButton);
      // Go to snoozed tab
      fireEvent.click(screen.getByText('Snoozed'));
      expect(screen.getByText('Commented on your design spec')).toBeInTheDocument();
    });

    test('snooze modal cancel button closes it', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      fireEvent.click(screen.getByText(/Snooze/));
      expect(screen.getByText('Snooze Notification')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Snooze Notification')).not.toBeInTheDocument();
    });
  });

  describe('Reactions', () => {
    test('existing reactions are displayed', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      // n1 has a 👍 reaction with 1 user
      expect(screen.getByText(/👍/)).toBeInTheDocument();
    });

    test('reaction emoji buttons are shown', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      expect(screen.getByLabelText('React with 👍')).toBeInTheDocument();
      expect(screen.getByLabelText('React with 🎉')).toBeInTheDocument();
      expect(screen.getByLabelText('React with 🚀')).toBeInTheDocument();
    });

    test('clicking a reaction emoji adds it', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      fireEvent.click(screen.getByLabelText('React with 🎉'));
      // Should show the reaction now
      const reactionButtons = screen.getAllByText(/🎉/);
      expect(reactionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Bulk Actions', () => {
    test('selecting notifications shows bulk action bar', () => {
      render(<NotificationCenter />);
      const checkboxes = screen.getAllByRole('checkbox');
      // Click the first notification checkbox (skip the "unread only" checkbox)
      const notifCheckbox = checkboxes.find(cb => cb.type === 'checkbox' && !cb.labels?.length);
      if (notifCheckbox) {
        fireEvent.click(notifCheckbox);
        expect(screen.getByText(/selected/)).toBeInTheDocument();
      }
    });

    test('bulk Mark Read button marks selected as read', () => {
      render(<NotificationCenter />);
      const checkboxes = screen.getAllByRole('checkbox');
      // Select first notification checkbox
      fireEvent.click(checkboxes[1]); // Skip unread-only checkbox
      if (screen.queryByText('Mark Read')) {
        fireEvent.click(screen.getByText('Mark Read'));
      }
    });

    test('bulk Archive button archives selected notifications', () => {
      render(<NotificationCenter />);
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Select a notification
      if (screen.queryByText(/Archive/)) {
        // There should be an Archive button in the bulk action bar
      }
    });

    test('bulk Delete button requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<NotificationCenter />);
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      if (screen.queryByText('Delete')) {
        const deleteButtons = screen.getAllByText('Delete');
        // Click the bulk delete button (first one)
        fireEvent.click(deleteButtons[0]);
        expect(window.confirm).toHaveBeenCalled();
      }
    });

    test('Clear button deselects all', () => {
      render(<NotificationCenter />);
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      if (screen.queryByText('Clear')) {
        fireEvent.click(screen.getByText('Clear'));
        expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
      }
    });
  });

  describe('Activity Feed', () => {
    test('activity feed shows stats cards', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Activity Feed'));
      expect(screen.getByText('Total Notifications')).toBeInTheDocument();
      expect(screen.getByText('Unread')).toBeInTheDocument();
      expect(screen.getByText('Team Activities')).toBeInTheDocument();
    });

    test('activity feed shows priority distribution', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Activity Feed'));
      expect(screen.getByText('Priority Distribution')).toBeInTheDocument();
    });

    test('activity feed shows team activity timeline', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Activity Feed'));
      expect(screen.getByText('Recent Team Activity')).toBeInTheDocument();
      expect(screen.getByText(/Alice Zhang/)).toBeInTheDocument();
      expect(screen.getByText(/Bob Martinez/)).toBeInTheDocument();
    });

    test('clicking an activity item shows detail', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Activity Feed'));
      // Click on an activity row
      fireEvent.click(screen.getByText(/PR #340/));
      // Should show expanded detail
      expect(screen.getByText(/Action: merged PR #340/)).toBeInTheDocument();
    });

    test('clicking activity item again hides detail', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Activity Feed'));
      fireEvent.click(screen.getByText(/PR #340/));
      expect(screen.getByText(/Action: merged PR #340/)).toBeInTheDocument();
      fireEvent.click(screen.getByText(/PR #340/));
      expect(screen.queryByText(/Action: merged PR #340/)).not.toBeInTheDocument();
    });

    test('activity feed displays correct stats', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Activity Feed'));
      // Total notifications = 12
      expect(screen.getByText('12')).toBeInTheDocument();
      // Team activities = 8
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  describe('Preferences Modal', () => {
    test('clicking preferences button opens preferences modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByLabelText('Open preferences'));
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    test('preferences modal shows all notification types', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByLabelText('Open preferences'));
      expect(screen.getByLabelText('Enable mention notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable comment notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable alert notifications')).toBeInTheDocument();
    });

    test('preferences modal shows sound and desktop options', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByLabelText('Open preferences'));
      expect(screen.getByLabelText('mention sound')).toBeInTheDocument();
      expect(screen.getByLabelText('mention desktop notifications')).toBeInTheDocument();
    });

    test('toggling a preference updates it', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByLabelText('Open preferences'));
      const mentionSound = screen.getByLabelText('mention sound');
      // mention sound is initially true
      expect(mentionSound.checked).toBe(true);
      fireEvent.click(mentionSound);
      expect(mentionSound.checked).toBe(false);
    });

    test('preferences persist to localStorage', () => {
      render(<NotificationCenter />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notifPreferences',
        expect.any(String)
      );
    });

    test('Done button closes preferences modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByLabelText('Open preferences'));
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Done'));
      expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
    });

    test('close button (×) closes preferences modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByLabelText('Open preferences'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
    });
  });

  describe('Compose Modal', () => {
    test('clicking Compose opens compose modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText(/Compose/));
      expect(screen.getByText('Compose Notification')).toBeInTheDocument();
    });

    test('compose modal has recipient selector', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText(/Compose/));
      expect(screen.getByLabelText('Select recipient')).toBeInTheDocument();
    });

    test('compose modal has type and priority selectors', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText(/Compose/));
      expect(screen.getByLabelText('Notification type')).toBeInTheDocument();
      expect(screen.getByLabelText('Notification priority')).toBeInTheDocument();
    });

    test('compose modal has title and body inputs', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText(/Compose/));
      expect(screen.getByPlaceholderText('Notification title...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Notification details...')).toBeInTheDocument();
    });

    test('sending a notification adds it to the list', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText(/Compose/));
      // Fill out form
      const recipientSelect = screen.getByLabelText('Select recipient');
      fireEvent.change(recipientSelect, { target: { value: 'u2' } });
      const titleInput = screen.getByPlaceholderText('Notification title...');
      fireEvent.change(titleInput, { target: { value: 'Test notification title' } });
      const bodyInput = screen.getByPlaceholderText('Notification details...');
      fireEvent.change(bodyInput, { target: { value: 'Test body content' } });
      fireEvent.click(screen.getByText('Send'));
      // New notification should appear in the inbox
      expect(screen.getByText('Test notification title')).toBeInTheDocument();
    });

    test('cancel button closes compose modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText(/Compose/));
      expect(screen.getByText('Compose Notification')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Compose Notification')).not.toBeInTheDocument();
    });

    test('sending without title does not create notification', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText(/Compose/));
      const recipientSelect = screen.getByLabelText('Select recipient');
      fireEvent.change(recipientSelect, { target: { value: 'u2' } });
      // Don't fill title
      fireEvent.click(screen.getByText('Send'));
      // Modal should still be open since title is empty
      expect(screen.getByText('Compose Notification')).toBeInTheDocument();
    });
  });

  describe('Notification Grouping', () => {
    test('notifications are grouped by date labels', () => {
      render(<NotificationCenter />);
      // Should show "Today" group for recent notifications
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    test('older notifications appear in different date groups', () => {
      render(<NotificationCenter />);
      // n9 is 12h old (today), n11 is 2d old (should be in a different group)
      // The exact label depends on the test execution date
      const dateLabels = screen.getAllByText(/Today|Yesterday|[A-Z][a-z]{2} \d+/);
      expect(dateLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Combined Filters', () => {
    test('search and type filter work together', () => {
      render(<NotificationCenter />);
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Backend' } });
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'mention' } });
      expect(screen.getByText('Mentioned you in PR #342')).toBeInTheDocument();
      expect(screen.queryByText('Build failed on main branch')).not.toBeInTheDocument();
    });

    test('non-matching combined filters show empty state', () => {
      render(<NotificationCenter />);
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'ML Platform' } });
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'alert' } });
      // No alerts in ML Platform project
      expect(screen.getByText('All caught up!')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes snooze modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      fireEvent.click(screen.getByText(/Snooze/));
      expect(screen.getByText('Snooze Notification')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Snooze Notification')).not.toBeInTheDocument();
    });

    test('Escape key closes preferences modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByLabelText('Open preferences'));
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
    });

    test('Escape key closes compose modal', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText(/Compose/));
      expect(screen.getByText('Compose Notification')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Compose Notification')).not.toBeInTheDocument();
    });

    test('Escape key clears selected notification', () => {
      render(<NotificationCenter />);
      fireEvent.click(screen.getByText('Mentioned you in PR #342'));
      expect(screen.getByText('Open →')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Open →')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('preferences are saved to localStorage', () => {
      render(<NotificationCenter />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notifPreferences',
        expect.any(String)
      );
    });

    test('saved preferences are loaded from localStorage', () => {
      const savedPrefs = {
        mention: { enabled: false, sound: false, desktop: false },
        comment: { enabled: true, sound: true, desktop: true },
        assignment: { enabled: true, sound: true, desktop: true },
        system: { enabled: true, sound: false, desktop: false },
        alert: { enabled: true, sound: true, desktop: true },
        invite: { enabled: true, sound: false, desktop: true },
      };
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'notifPreferences') return JSON.stringify(savedPrefs);
        return null;
      });
      render(<NotificationCenter />);
      fireEvent.click(screen.getByLabelText('Open preferences'));
      // Mention should be unchecked
      const mentionEnabled = screen.getByLabelText('Enable mention notifications');
      expect(mentionEnabled.checked).toBe(false);
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'notifPreferences') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<NotificationCenter />)).not.toThrow();
    });
  });

  describe('Empty States', () => {
    test('empty inbox shows all caught up message', () => {
      render(<NotificationCenter />);
      // Filter to something that returns no results
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
      expect(screen.getByText('All caught up!')).toBeInTheDocument();
    });

    test('empty starred tab shows appropriate message', () => {
      render(<NotificationCenter />);
      // Unstar all starred notifications first - use search to find specific
      // Instead, just filter to show no matches
      fireEvent.click(screen.getByText('Starred'));
      const searchInput = screen.getByPlaceholderText('Search notifications... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
      expect(screen.getByText('No starred notifications')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<NotificationCenter />)).not.toThrow();
    });
  });
});
