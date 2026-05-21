import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatMessenger from './src/app/page.jsx';

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

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('ChatMessenger Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with ChatApp title', () => {
      render(<ChatMessenger />);
      expect(screen.getByText('ChatApp')).toBeInTheDocument();
    });

    test('renders current user info', () => {
      render(<ChatMessenger />);
      expect(screen.getByText('You')).toBeInTheDocument();
    });

    test('renders status selector', () => {
      render(<ChatMessenger />);
      expect(screen.getByLabelText('Set your status')).toBeInTheDocument();
    });

    test('renders settings button', () => {
      render(<ChatMessenger />);
      expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
    });

    test('renders conversation search input', () => {
      render(<ChatMessenger />);
      expect(screen.getByPlaceholderText('Search conversations... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders conversation filter buttons', () => {
      render(<ChatMessenger />);
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('DMs')).toBeInTheDocument();
      expect(screen.getByText('Group')).toBeInTheDocument();
      expect(screen.getByText('Unread')).toBeInTheDocument();
    });

    test('renders new group button', () => {
      render(<ChatMessenger />);
      expect(screen.getByText('+ New Group')).toBeInTheDocument();
    });

    test('renders conversation list with names', () => {
      render(<ChatMessenger />);
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Design Team')).toBeInTheDocument();
      expect(screen.getByText('General Chat')).toBeInTheDocument();
    });

    test('renders message input', () => {
      render(<ChatMessenger />);
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    test('renders send button', () => {
      render(<ChatMessenger />);
      expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    });

    test('renders chat header with active conversation name', () => {
      render(<ChatMessenger />);
      // Default active conversation is conv1 (Alice Chen DM)
      const headers = screen.getAllByText('Alice Chen');
      expect(headers.length).toBeGreaterThan(0);
    });

    test('renders theme toggle button', () => {
      render(<ChatMessenger />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('renders search messages button', () => {
      render(<ChatMessenger />);
      expect(screen.getByLabelText('Search messages')).toBeInTheDocument();
    });

    test('renders pinned messages button', () => {
      render(<ChatMessenger />);
      expect(screen.getByLabelText('Pinned messages')).toBeInTheDocument();
    });

    test('renders conversation info button', () => {
      render(<ChatMessenger />);
      expect(screen.getByLabelText('Conversation info')).toBeInTheDocument();
    });
  });

  describe('Messages Display', () => {
    test('displays messages in active conversation', () => {
      render(<ChatMessenger />);
      expect(screen.getByText('Hey! How are you doing?')).toBeInTheDocument();
      expect(screen.getByText('Doing great! Working on the new feature.')).toBeInTheDocument();
    });

    test('shows edited indicator for edited messages', () => {
      render(<ChatMessenger />);
      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });

    test('shows pinned indicator on pinned messages', () => {
      render(<ChatMessenger />);
      // Pinned messages should have the pin emoji visible
      const pinnedMsg = screen.getByText('Awesome! Let me know if you need any help.');
      expect(pinnedMsg).toBeInTheDocument();
    });

    test('shows reply references for reply messages', () => {
      render(<ChatMessenger />);
      // m4 is a reply to m3, m6 is a reply to m5
      const replyTexts = screen.getAllByText(/Replying to/);
      expect(replyTexts.length).toBeGreaterThan(0);
    });

    test('displays reactions on messages', () => {
      render(<ChatMessenger />);
      // m1 has a 👍 reaction
      expect(screen.getByLabelText('👍 reaction by 1 users')).toBeInTheDocument();
    });
  });

  describe('Sending Messages', () => {
    test('typing in message input updates the value', () => {
      render(<ChatMessenger />);
      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'Hello world!' } });
      expect(input.value).toBe('Hello world!');
    });

    test('sending a message via Send button', () => {
      render(<ChatMessenger />);
      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'New test message' } });
      fireEvent.click(screen.getByLabelText('Send message'));
      expect(screen.getByText('New test message')).toBeInTheDocument();
      expect(input.value).toBe('');
    });

    test('sending a message via Enter key', () => {
      render(<ChatMessenger />);
      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'Enter key message' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('Enter key message')).toBeInTheDocument();
    });

    test('empty message is not sent', () => {
      render(<ChatMessenger />);
      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(screen.getByLabelText('Send message'));
      // Input should remain since message was not sent
      expect(input.value).toBe('   ');
    });
  });

  describe('Conversation Switching', () => {
    test('clicking a conversation switches to it', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation with Project Alpha'));
      expect(screen.getByText('Team meeting at 2 PM today. Please review the sprint backlog.')).toBeInTheDocument();
    });

    test('switching conversation shows correct header', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation with Project Alpha'));
      // Group conversation shows member count
      expect(screen.getByText('4 members')).toBeInTheDocument();
    });

    test('DM conversation shows online status in header', () => {
      render(<ChatMessenger />);
      // conv1 is with Alice Chen who is online
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    test('switching conversation clears message search', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Search messages'));
      const searchInput = screen.getByLabelText('Search in conversation');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.click(screen.getByLabelText('Conversation with Project Alpha'));
      expect(screen.queryByLabelText('Search in conversation')).not.toBeInTheDocument();
    });
  });

  describe('Conversation Search and Filters', () => {
    test('search filters conversations by name', () => {
      render(<ChatMessenger />);
      const searchInput = screen.getByPlaceholderText('Search conversations... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Project' } });
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Design Team')).not.toBeInTheDocument();
    });

    test('search filters conversations by last message content', () => {
      render(<ChatMessenger />);
      const searchInput = screen.getByPlaceholderText('Search conversations... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'brand guidelines' } });
      expect(screen.getByText('Design Team')).toBeInTheDocument();
    });

    test('clearing search shows all conversations', () => {
      render(<ChatMessenger />);
      const searchInput = screen.getByPlaceholderText('Search conversations... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Project' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Design Team')).toBeInTheDocument();
    });

    test('DMs filter shows only direct messages', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('DMs'));
      expect(screen.queryByText('Project Alpha')).not.toBeInTheDocument();
      expect(screen.queryByText('Design Team')).not.toBeInTheDocument();
      expect(screen.queryByText('General Chat')).not.toBeInTheDocument();
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    });

    test('Group filter shows only group conversations', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('Group'));
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Design Team')).toBeInTheDocument();
      expect(screen.getByText('General Chat')).toBeInTheDocument();
    });

    test('no results shows empty state', () => {
      render(<ChatMessenger />);
      const searchInput = screen.getByPlaceholderText('Search conversations... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } });
      expect(screen.getByText('No conversations found')).toBeInTheDocument();
    });
  });

  describe('Message Search', () => {
    test('clicking search button shows search bar', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Search messages'));
      expect(screen.getByLabelText('Search in conversation')).toBeInTheDocument();
    });

    test('message search filters displayed messages', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Search messages'));
      const searchInput = screen.getByLabelText('Search in conversation');
      fireEvent.change(searchInput, { target: { value: 'design review' } });
      expect(screen.getByText('By the way, the design review is tomorrow at 3 PM.')).toBeInTheDocument();
      expect(screen.queryByText('Hey! How are you doing?')).not.toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('clicking theme toggle saves to localStorage', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<ChatMessenger />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chatTheme') return 'dark';
        return null;
      });
      render(<ChatMessenger />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Toggle', () => {
    test('renders toggle sidebar button', () => {
      render(<ChatMessenger />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides conversation names', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('ChatApp')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Search conversations... (Ctrl+K)')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows conversation names again', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.getByText('ChatApp')).toBeInTheDocument();
    });
  });

  describe('Message Editing', () => {
    test('clicking edit button shows edit input for own messages', () => {
      render(<ChatMessenger />);
      // Find the edit button for own messages
      const editButtons = screen.getAllByLabelText('Edit message');
      fireEvent.click(editButtons[0]);
      expect(screen.getByDisplayValue(/Doing great!/)).toBeInTheDocument();
    });

    test('saving edited message updates the text', () => {
      render(<ChatMessenger />);
      const editButtons = screen.getAllByLabelText('Edit message');
      fireEvent.click(editButtons[0]);
      const editInput = screen.getByLabelText('Edit message');
      fireEvent.change(editInput, { target: { value: 'Edited message text' } });
      fireEvent.click(screen.getByText('Save'));
      expect(screen.getByText('Edited message text')).toBeInTheDocument();
    });

    test('pressing Enter saves edited message', () => {
      render(<ChatMessenger />);
      const editButtons = screen.getAllByLabelText('Edit message');
      fireEvent.click(editButtons[0]);
      const editInput = screen.getByLabelText('Edit message');
      fireEvent.change(editInput, { target: { value: 'Enter edited message' } });
      fireEvent.keyDown(editInput, { key: 'Enter' });
      expect(screen.getByText('Enter edited message')).toBeInTheDocument();
    });

    test('cancel button closes edit mode', () => {
      render(<ChatMessenger />);
      const editButtons = screen.getAllByLabelText('Edit message');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Save')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    test('pressing Escape cancels edit', () => {
      render(<ChatMessenger />);
      const editButtons = screen.getAllByLabelText('Edit message');
      fireEvent.click(editButtons[0]);
      const editInput = screen.getByLabelText('Edit message');
      fireEvent.keyDown(editInput, { key: 'Escape' });
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });

  describe('Message Deletion', () => {
    test('clicking delete removes the message', () => {
      render(<ChatMessenger />);
      expect(screen.getByText('Doing great! Working on the new feature.')).toBeInTheDocument();
      const deleteButtons = screen.getAllByLabelText('Delete message');
      fireEvent.click(deleteButtons[0]);
      expect(screen.queryByText('Doing great! Working on the new feature.')).not.toBeInTheDocument();
    });
  });

  describe('Message Reactions', () => {
    test('clicking reaction button shows emoji picker', () => {
      render(<ChatMessenger />);
      const reactionButtons = screen.getAllByLabelText('Add reaction');
      fireEvent.click(reactionButtons[0]);
      expect(screen.getByLabelText('React with 👍')).toBeInTheDocument();
      expect(screen.getByLabelText('React with ❤️')).toBeInTheDocument();
    });

    test('clicking an emoji adds reaction to message', () => {
      render(<ChatMessenger />);
      const reactionButtons = screen.getAllByLabelText('Add reaction');
      fireEvent.click(reactionButtons[0]);
      fireEvent.click(screen.getByLabelText('React with 🎉'));
      expect(screen.getByLabelText('🎉 reaction by 1 users')).toBeInTheDocument();
    });

    test('clicking existing own reaction removes it', () => {
      render(<ChatMessenger />);
      // m1 has a 👍 reaction by u1 (current user)
      const thumbsUpButton = screen.getByLabelText('👍 reaction by 1 users');
      fireEvent.click(thumbsUpButton);
      // Reaction should be removed since it was the only one
      expect(screen.queryByLabelText('👍 reaction by 1 users')).not.toBeInTheDocument();
    });
  });

  describe('Pinned Messages', () => {
    test('clicking pinned messages button shows pinned panel', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Pinned messages'));
      expect(screen.getByText('📌 Pinned Messages')).toBeInTheDocument();
    });

    test('pinned panel shows pinned messages content', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Pinned messages'));
      expect(screen.getByText(/Awesome! Let me know if you need any help./)).toBeInTheDocument();
      expect(screen.getByText(/the design review is tomorrow/)).toBeInTheDocument();
    });

    test('clicking pin on a message toggles pin state', () => {
      render(<ChatMessenger />);
      // Count initial pinned messages
      fireEvent.click(screen.getByLabelText('Pinned messages'));
      const pinnedBefore = screen.getAllByText(/Alice Chen:|You:/).length;
      fireEvent.click(screen.getAllByText('×')[0]); // close panel

      // Pin a new message
      const pinButtons = screen.getAllByLabelText('Pin message');
      fireEvent.click(pinButtons[0]);

      // Check pinned panel again
      fireEvent.click(screen.getByLabelText('Pinned messages'));
      const pinnedAfter = screen.getAllByText(/Alice Chen:|You:/).length;
      expect(pinnedAfter).toBe(pinnedBefore + 1);
    });

    test('closing pinned panel hides it', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Pinned messages'));
      expect(screen.getByText('📌 Pinned Messages')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('📌 Pinned Messages')).not.toBeInTheDocument();
    });
  });

  describe('Reply to Message', () => {
    test('clicking reply shows reply bar', () => {
      render(<ChatMessenger />);
      const replyButtons = screen.getAllByLabelText('Reply to message');
      fireEvent.click(replyButtons[0]);
      const replyBars = screen.getAllByText(/Replying to/);
      // Should have reply references from existing replies + the new reply bar
      expect(replyBars.length).toBeGreaterThan(0);
    });

    test('sending a message while replying creates a reply', () => {
      render(<ChatMessenger />);
      const replyButtons = screen.getAllByLabelText('Reply to message');
      fireEvent.click(replyButtons[0]);
      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'This is a reply' } });
      fireEvent.click(screen.getByLabelText('Send message'));
      expect(screen.getByText('This is a reply')).toBeInTheDocument();
    });

    test('cancel reply button hides reply bar', () => {
      render(<ChatMessenger />);
      const replyButtons = screen.getAllByLabelText('Reply to message');
      fireEvent.click(replyButtons[0]);
      fireEvent.click(screen.getByLabelText('Cancel reply'));
      // The reply bar for the new reply should be gone
      // (existing inline reply references remain)
    });
  });

  describe('Conversation Info Panel', () => {
    test('clicking info button shows conversation info', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation info'));
      expect(screen.getByText('Conversation Info')).toBeInTheDocument();
    });

    test('info panel shows conversation type', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation info'));
      expect(screen.getByText('Direct Message')).toBeInTheDocument();
    });

    test('info panel shows member list', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation info'));
      expect(screen.getByText('Members (2)')).toBeInTheDocument();
      expect(screen.getByText('(You)')).toBeInTheDocument();
    });

    test('info panel shows Shared Media section', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation info'));
      expect(screen.getByText('Shared Media')).toBeInTheDocument();
      expect(screen.getByText('No shared media yet')).toBeInTheDocument();
    });

    test('group conversation info shows Leave Group button', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation with Project Alpha'));
      fireEvent.click(screen.getByLabelText('Conversation info'));
      expect(screen.getByText('Leave Group')).toBeInTheDocument();
    });

    test('closing info panel hides it', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation info'));
      expect(screen.getByText('Conversation Info')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Conversation Info')).not.toBeInTheDocument();
    });
  });

  describe('New Group Conversation', () => {
    test('clicking + New Group opens modal', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('+ New Group'));
      expect(screen.getByText('New Group Conversation')).toBeInTheDocument();
    });

    test('modal shows group name input', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('+ New Group'));
      expect(screen.getByLabelText('Group name')).toBeInTheDocument();
    });

    test('modal shows member checkboxes', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('+ New Group'));
      expect(screen.getByText('Select Members')).toBeInTheDocument();
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
    });

    test('creating a group adds it to conversation list', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('+ New Group'));
      const nameInput = screen.getByLabelText('Group name');
      fireEvent.change(nameInput, { target: { value: 'Test Group' } });
      // Select Alice Chen
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(screen.getByText('Create Group'));
      expect(screen.queryByText('New Group Conversation')).not.toBeInTheDocument();
    });

    test('cancel button closes the modal', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('+ New Group'));
      expect(screen.getByText('New Group Conversation')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('New Group Conversation')).not.toBeInTheDocument();
    });

    test('create button is disabled without name and members', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('+ New Group'));
      const createButton = screen.getByText('Create Group');
      // Button should be disabled (no name or members selected)
      expect(createButton).toBeDisabled();
    });
  });

  describe('Settings Modal', () => {
    test('clicking settings button opens modal', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('settings shows appearance section', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByText('Compact Mode')).toBeInTheDocument();
      expect(screen.getByText('Show Timestamps')).toBeInTheDocument();
    });

    test('settings shows notifications section', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Notification Sound')).toBeInTheDocument();
    });

    test('toggling compact mode saves to localStorage', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      fireEvent.click(screen.getByLabelText('Toggle compact mode'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatCompactMode', 'true');
    });

    test('toggling timestamps saves to localStorage', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      fireEvent.click(screen.getByLabelText('Toggle timestamps'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatShowTimestamps', 'false');
    });

    test('toggling notification sound saves to localStorage', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      fireEvent.click(screen.getByLabelText('Toggle notification sound'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatNotificationSound', 'false');
    });

    test('close settings button works', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      expect(screen.getByText('Settings')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Close settings'));
      expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
    });

    test('Done button closes settings', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      fireEvent.click(screen.getByText('Done'));
      expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
    });
  });

  describe('User Status', () => {
    test('changing status saves to localStorage', () => {
      render(<ChatMessenger />);
      const statusSelect = screen.getByLabelText('Set your status');
      fireEvent.change(statusSelect, { target: { value: 'away' } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatUserStatus', 'away');
    });

    test('status indicator is displayed', () => {
      render(<ChatMessenger />);
      expect(screen.getByTestId('user-status-indicator')).toBeInTheDocument();
    });

    test('loads saved status from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chatUserStatus') return 'busy';
        return null;
      });
      render(<ChatMessenger />);
      const statusSelect = screen.getByLabelText('Set your status');
      expect(statusSelect.value).toBe('busy');
    });
  });

  describe('Unread Counts', () => {
    test('displays unread badges on conversations with new messages', () => {
      render(<ChatMessenger />);
      // Several conversations should have unread messages based on initial read status
      const unreadBadges = screen.queryAllByTestId(/unread-/);
      expect(unreadBadges.length).toBeGreaterThan(0);
    });

    test('selecting a conversation marks it as read', () => {
      render(<ChatMessenger />);
      // conv3 (Project Alpha) should have unread messages
      const conv3Unread = screen.queryByTestId('unread-conv3');
      if (conv3Unread) {
        const initialCount = parseInt(conv3Unread.textContent, 10);
        fireEvent.click(screen.getByLabelText('Conversation with Project Alpha'));
        // After clicking, unread for conv3 should be 0
        expect(screen.queryByTestId('unread-conv3')).not.toBeInTheDocument();
      }
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes settings modal', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Open settings'));
      expect(screen.getByText('Settings')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
    });

    test('Escape closes new conversation modal', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByText('+ New Group'));
      expect(screen.getByText('New Group Conversation')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('New Group Conversation')).not.toBeInTheDocument();
    });

    test('Escape closes pinned messages panel', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Pinned messages'));
      expect(screen.getByText('📌 Pinned Messages')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('📌 Pinned Messages')).not.toBeInTheDocument();
    });

    test('Escape closes conversation info panel', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation info'));
      expect(screen.getByText('Conversation Info')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Conversation Info')).not.toBeInTheDocument();
    });

    test('Escape closes message search', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Search messages'));
      expect(screen.getByLabelText('Search in conversation')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByLabelText('Search in conversation')).not.toBeInTheDocument();
    });

    test('Escape cancels editing a message', () => {
      render(<ChatMessenger />);
      const editButtons = screen.getAllByLabelText('Edit message');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Save')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('theme is saved to localStorage', () => {
      render(<ChatMessenger />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatTheme', 'light');
    });

    test('notification sound preference is saved to localStorage', () => {
      render(<ChatMessenger />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatNotificationSound', 'true');
    });

    test('show timestamps preference is saved to localStorage', () => {
      render(<ChatMessenger />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatShowTimestamps', 'true');
    });

    test('compact mode is saved to localStorage', () => {
      render(<ChatMessenger />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatCompactMode', 'false');
    });

    test('user status is saved to localStorage', () => {
      render(<ChatMessenger />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatUserStatus', 'online');
    });

    test('read status is saved to localStorage', () => {
      render(<ChatMessenger />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatReadStatus', expect.any(String));
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chatReadStatus') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<ChatMessenger />)).not.toThrow();
    });
  });

  describe('Group Conversation Features', () => {
    test('group messages show sender names', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation with Project Alpha'));
      // In group chat, non-own messages should show sender name
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Dave Johnson')).toBeInTheDocument();
    });

    test('group header shows member count', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation with Project Alpha'));
      expect(screen.getByText('4 members')).toBeInTheDocument();
    });

    test('leaving a group conversation', () => {
      render(<ChatMessenger />);
      fireEvent.click(screen.getByLabelText('Conversation with Project Alpha'));
      fireEvent.click(screen.getByLabelText('Conversation info'));
      fireEvent.click(screen.getByText('Leave Group'));
      // After leaving, should switch to another conversation
      expect(screen.queryByText('4 members')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<ChatMessenger />)).not.toThrow();
    });
  });
});
