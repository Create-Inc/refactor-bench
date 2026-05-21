import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ChatApp from './src/app/page.jsx';

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

describe('ChatApp Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders the ChatApp title', () => {
      render(<ChatApp />);
      expect(screen.getByText(/ChatApp/)).toBeInTheDocument();
    });

    test('renders sidebar with conversation list', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
    });

    test('renders conversation search input', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('conversation-search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search conversations...')).toBeInTheDocument();
    });

    test('renders chat filter buttons', () => {
      render(<ChatApp />);
      const filters = screen.getByTestId('chat-filters');
      expect(within(filters).getByText('all')).toBeInTheDocument();
      expect(within(filters).getByText('unread')).toBeInTheDocument();
      expect(within(filters).getByText('groups')).toBeInTheDocument();
      expect(within(filters).getByText('direct')).toBeInTheDocument();
      expect(within(filters).getByText('archived')).toBeInTheDocument();
    });

    test('renders new chat and new group buttons', () => {
      render(<ChatApp />);
      expect(screen.getByLabelText('New chat')).toBeInTheDocument();
      expect(screen.getByLabelText('New group')).toBeInTheDocument();
    });

    test('renders settings button', () => {
      render(<ChatApp />);
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });

    test('renders empty state when no conversation is selected', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('no-chat-selected')).toBeInTheDocument();
      expect(screen.getByText('Select a conversation')).toBeInTheDocument();
    });

    test('renders total unread badge with correct count', () => {
      render(<ChatApp />);
      // c1: 2, c2: 5, c4: 12 = 19 total (c6 is archived so excluded)
      expect(screen.getByTestId('total-unread')).toHaveTextContent('19');
    });
  });

  describe('Conversation List', () => {
    test('renders conversation items', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('conversation-c1')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-c2')).toBeInTheDocument();
    });

    test('displays conversation names correctly', () => {
      render(<ChatApp />);
      // Direct chats show other participant name
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      // Group chats show group name
      expect(screen.getByText('Design Team')).toBeInTheDocument();
      expect(screen.getByText('Backend Guild')).toBeInTheDocument();
    });

    test('displays last message preview', () => {
      render(<ChatApp />);
      expect(screen.getByText('Sure, I will review the PR today!')).toBeInTheDocument();
      expect(screen.getByText('The new mockups look great 🎉')).toBeInTheDocument();
    });

    test('displays unread count badges', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('unread-badge-c1')).toHaveTextContent('2');
      expect(screen.getByTestId('unread-badge-c2')).toHaveTextContent('5');
      expect(screen.getByTestId('unread-badge-c4')).toHaveTextContent('12');
    });

    test('pinned conversations show pin emoji', () => {
      render(<ChatApp />);
      // c1 and c2 are pinned
      const c1 = screen.getByTestId('conversation-c1');
      expect(c1.textContent).toContain('📌');
    });

    test('muted conversations show mute emoji', () => {
      render(<ChatApp />);
      // c4 is muted
      const c4 = screen.getByTestId('conversation-c4');
      expect(c4.textContent).toContain('🔇');
    });

    test('pinned conversations appear before unpinned', () => {
      render(<ChatApp />);
      const list = screen.getByTestId('conversation-list');
      const items = list.querySelectorAll('[data-testid^="conversation-c"]');
      // c1 and c2 are pinned, so they should be first
      expect(items[0].getAttribute('data-testid')).toMatch(/conversation-c[12]/);
      expect(items[1].getAttribute('data-testid')).toMatch(/conversation-c[12]/);
    });

    test('archived conversations are hidden by default', () => {
      render(<ChatApp />);
      // c6 is archived
      expect(screen.queryByTestId('conversation-c6')).not.toBeInTheDocument();
    });
  });

  describe('Conversation Search', () => {
    test('search filters conversations by name', () => {
      render(<ChatApp />);
      const search = screen.getByTestId('conversation-search');
      fireEvent.change(search, { target: { value: 'Alice' } });
      expect(screen.getByTestId('conversation-c1')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-c2')).not.toBeInTheDocument();
    });

    test('search filters conversations by last message', () => {
      render(<ChatApp />);
      const search = screen.getByTestId('conversation-search');
      fireEvent.change(search, { target: { value: 'mockups' } });
      expect(screen.getByTestId('conversation-c2')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-c1')).not.toBeInTheDocument();
    });

    test('clearing search shows all conversations', () => {
      render(<ChatApp />);
      const search = screen.getByTestId('conversation-search');
      fireEvent.change(search, { target: { value: 'Alice' } });
      fireEvent.change(search, { target: { value: '' } });
      expect(screen.getByTestId('conversation-c1')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-c2')).toBeInTheDocument();
    });

    test('no results shows empty message', () => {
      render(<ChatApp />);
      const search = screen.getByTestId('conversation-search');
      fireEvent.change(search, { target: { value: 'zzzznonexistent' } });
      expect(screen.getByText('No conversations found')).toBeInTheDocument();
    });
  });

  describe('Chat Filters', () => {
    test('unread filter shows only conversations with unread messages', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText('unread'));
      expect(screen.getByTestId('conversation-c1')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-c2')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-c4')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-c3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('conversation-c5')).not.toBeInTheDocument();
    });

    test('groups filter shows only group conversations', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText('groups'));
      expect(screen.getByTestId('conversation-c2')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-c4')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-c1')).not.toBeInTheDocument();
    });

    test('direct filter shows only direct messages', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText('direct'));
      expect(screen.getByTestId('conversation-c1')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-c3')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-c2')).not.toBeInTheDocument();
    });

    test('archived filter shows only archived conversations', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText('archived'));
      expect(screen.getByTestId('conversation-c6')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-c1')).not.toBeInTheDocument();
    });

    test('all filter shows non-archived conversations', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByText('groups'));
      fireEvent.click(screen.getByText('all'));
      expect(screen.getByTestId('conversation-c1')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-c2')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-c3')).toBeInTheDocument();
    });
  });

  describe('Selecting a Conversation', () => {
    test('clicking a conversation opens the chat view', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      expect(screen.getByTestId('chat-header')).toBeInTheDocument();
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      expect(screen.getByTestId('message-input-area')).toBeInTheDocument();
    });

    test('chat header shows conversation name', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const header = screen.getByTestId('chat-header');
      expect(header.textContent).toContain('Alice Chen');
    });

    test('chat header shows group member count for group chats', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c2'));
      const header = screen.getByTestId('chat-header');
      expect(header.textContent).toContain('4 members');
    });

    test('chat header shows online status for direct chats', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const header = screen.getByTestId('chat-header');
      expect(header.textContent).toContain('Online');
    });

    test('selecting a conversation clears its unread count', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('unread-badge-c1')).toHaveTextContent('2');
      fireEvent.click(screen.getByTestId('conversation-c1'));
      expect(screen.queryByTestId('unread-badge-c1')).not.toBeInTheDocument();
    });

    test('empty state disappears when conversation is selected', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('no-chat-selected')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('conversation-c1'));
      expect(screen.queryByTestId('no-chat-selected')).not.toBeInTheDocument();
    });
  });

  describe('Messages Display', () => {
    test('messages are rendered in the message list', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      expect(screen.getByTestId('message-m1')).toBeInTheDocument();
      expect(screen.getByTestId('message-m2')).toBeInTheDocument();
    });

    test('message content is displayed', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      expect(screen.getByText('Hey! Did you get a chance to look at the new API endpoints?')).toBeInTheDocument();
      expect(screen.getByText('Yes, I reviewed them. The authentication flow looks solid.')).toBeInTheDocument();
    });

    test('edited messages show edit indicator', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      // m4 is edited
      const editedMsg = screen.getByTestId('message-m4');
      expect(editedMsg.textContent).toContain('✏️');
    });

    test('reply messages show the replied content', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      // m5 replies to m4
      const replyMsg = screen.getByTestId('message-m5');
      expect(replyMsg.textContent).toContain('↩');
    });

    test('system messages are rendered with italic style', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c2'));
      // m13 is a system message
      expect(screen.getByTestId('message-m13')).toBeInTheDocument();
      expect(screen.getByText(/changed the group name/)).toBeInTheDocument();
    });

    test('file messages show attachment indicator', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c5'));
      expect(screen.getByText('sprint-planning-notes.pdf')).toBeInTheDocument();
    });

    test('switching conversations shows different messages', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      expect(screen.getByText('Hey! Did you get a chance to look at the new API endpoints?')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('conversation-c2'));
      expect(screen.queryByText('Hey! Did you get a chance to look at the new API endpoints?')).not.toBeInTheDocument();
      expect(screen.getByText('I uploaded the new wireframes for the settings page')).toBeInTheDocument();
    });

    test('group messages show sender name', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c2'));
      // Group chats show sender names
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
    });
  });

  describe('Sending Messages', () => {
    test('message input is rendered when a conversation is active', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    test('send button is rendered', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    test('typing a message and pressing Enter sends it', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello, this is a test message!' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('Hello, this is a test message!')).toBeInTheDocument();
    });

    test('typing a message and clicking send button sends it', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Click send test' } });
      fireEvent.click(screen.getByTestId('send-button'));
      expect(screen.getByText('Click send test')).toBeInTheDocument();
    });

    test('input is cleared after sending a message', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Will be cleared' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(input.value).toBe('');
    });

    test('empty messages cannot be sent', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const input = screen.getByTestId('message-input');
      const messageCountBefore = screen.getByTestId('message-list').querySelectorAll('[data-testid^="message-"]').length;
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      const messageCountAfter = screen.getByTestId('message-list').querySelectorAll('[data-testid^="message-"]').length;
      expect(messageCountAfter).toBe(messageCountBefore);
    });

    test('sending a message updates the conversation last message', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Updated last msg' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      // The conversation list should now show the new message
      const convItem = screen.getByTestId('conversation-c1');
      expect(convItem.textContent).toContain('Updated last msg');
    });
  });

  describe('Message Reactions', () => {
    test('existing reactions are displayed on messages', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      // m2 has a 👍 reaction from u2
      expect(screen.getByTestId('reaction-m2-👍')).toBeInTheDocument();
    });

    test('reaction button shows count', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const reaction = screen.getByTestId('reaction-m2-👍');
      expect(reaction.textContent).toContain('1');
    });

    test('clicking a reaction toggles it', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const reaction = screen.getByTestId('reaction-m2-👍');
      // Initially u2 reacted, clicking adds u1
      fireEvent.click(reaction);
      expect(reaction.textContent).toContain('2');
    });

    test('clicking a reaction again removes it', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const reaction = screen.getByTestId('reaction-m2-👍');
      // Click to add u1
      fireEvent.click(reaction);
      expect(reaction.textContent).toContain('2');
      // Click again to remove u1
      fireEvent.click(reaction);
      expect(reaction.textContent).toContain('1');
    });

    test('multi-user reactions show correct count', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c2'));
      // m12 has 👍 from u1, u2, u4 = 3
      const reaction = screen.getByTestId('reaction-m12-👍');
      expect(reaction.textContent).toContain('3');
    });
  });

  describe('Conversation Actions', () => {
    test('pin button toggles pin state', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c3'));
      // c3 is not pinned, click pin button
      const pinButton = screen.getByLabelText('Pin conversation');
      fireEvent.click(pinButton);
      // Now c3 should show pin indicator
      const c3 = screen.getByTestId('conversation-c3');
      expect(c3.textContent).toContain('📌');
    });

    test('mute button toggles mute state', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      // c1 is not muted
      const muteButton = screen.getByLabelText('Mute conversation');
      fireEvent.click(muteButton);
      const c1 = screen.getByTestId('conversation-c1');
      expect(c1.textContent).toContain('🔇');
    });

    test('search messages button toggles message search', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      fireEvent.click(screen.getByLabelText('Search messages'));
      expect(screen.getByTestId('message-search')).toBeInTheDocument();
    });
  });

  describe('Message Search', () => {
    test('message search filters messages by content', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      fireEvent.click(screen.getByLabelText('Search messages'));
      const searchInput = screen.getByTestId('message-search');
      fireEvent.change(searchInput, { target: { value: 'authentication' } });
      expect(screen.getByText('Yes, I reviewed them. The authentication flow looks solid.')).toBeInTheDocument();
      expect(screen.queryByText('Sure, I will review the PR today!')).not.toBeInTheDocument();
    });

    test('clearing message search shows all messages', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      fireEvent.click(screen.getByLabelText('Search messages'));
      const searchInput = screen.getByTestId('message-search');
      fireEvent.change(searchInput, { target: { value: 'authentication' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Sure, I will review the PR today!')).toBeInTheDocument();
    });
  });

  describe('Reply Functionality', () => {
    test('reply bar appears when replying to a message', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      // Use context menu to reply
      const msg = screen.getByTestId('message-m1');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      // Click reply in context menu
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Reply/));
      expect(screen.getByTestId('reply-bar')).toBeInTheDocument();
    });

    test('reply bar can be dismissed', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const msg = screen.getByTestId('message-m1');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Reply/));
      expect(screen.getByTestId('reply-bar')).toBeInTheDocument();
      // Click the close button
      fireEvent.click(screen.getByText('✕'));
      expect(screen.queryByTestId('reply-bar')).not.toBeInTheDocument();
    });
  });

  describe('Edit Message', () => {
    test('edit bar appears when editing own message via context menu', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      // m2 is sent by u1 (own message)
      const msg = screen.getByTestId('message-m2');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Edit/));
      expect(screen.getByTestId('edit-bar')).toBeInTheDocument();
    });

    test('editing a message updates its content', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const msg = screen.getByTestId('message-m2');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Edit/));
      const editInput = screen.getByTestId('edit-bar').querySelector('input');
      fireEvent.change(editInput, { target: { value: 'Edited content here' } });
      fireEvent.click(screen.getByText('Save'));
      expect(screen.getByText('Edited content here')).toBeInTheDocument();
    });

    test('canceling edit preserves original message', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const msg = screen.getByTestId('message-m2');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Edit/));
      const editInput = screen.getByTestId('edit-bar').querySelector('input');
      fireEvent.change(editInput, { target: { value: 'This will be canceled' } });
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.getByText('Yes, I reviewed them. The authentication flow looks solid.')).toBeInTheDocument();
      expect(screen.queryByText('This will be canceled')).not.toBeInTheDocument();
    });
  });

  describe('Delete Message', () => {
    test('deleting own message replaces content', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const msg = screen.getByTestId('message-m2');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Delete/));
      expect(screen.getByText('This message was deleted')).toBeInTheDocument();
    });
  });

  describe('User Profile Modal', () => {
    test('clicking chat header in direct chat opens user profile', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const header = screen.getByTestId('chat-header');
      fireEvent.click(within(header).getByText('Alice Chen'));
      expect(screen.getByTestId('user-profile-modal')).toBeInTheDocument();
    });

    test('user profile shows name, bio, and status', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const header = screen.getByTestId('chat-header');
      fireEvent.click(within(header).getByText('Alice Chen'));
      const modal = screen.getByTestId('user-profile-modal');
      expect(modal.textContent).toContain('Alice Chen');
      expect(modal.textContent).toContain('Software Engineer at TechCorp');
      expect(modal.textContent).toContain('Online');
    });

    test('user profile has send message button', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const header = screen.getByTestId('chat-header');
      fireEvent.click(within(header).getByText('Alice Chen'));
      expect(screen.getByText('Send Message')).toBeInTheDocument();
    });

    test('clicking backdrop closes user profile modal', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const header = screen.getByTestId('chat-header');
      fireEvent.click(within(header).getByText('Alice Chen'));
      expect(screen.getByTestId('user-profile-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('user-profile-modal'));
      expect(screen.queryByTestId('user-profile-modal')).not.toBeInTheDocument();
    });
  });

  describe('Group Info Modal', () => {
    test('clicking chat header in group chat opens group info', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c2'));
      const header = screen.getByTestId('chat-header');
      fireEvent.click(within(header).getByText('Design Team'));
      expect(screen.getByTestId('group-info-modal')).toBeInTheDocument();
    });

    test('group info shows group name and member count', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c2'));
      const header = screen.getByTestId('chat-header');
      fireEvent.click(within(header).getByText('Design Team'));
      const modal = screen.getByTestId('group-info-modal');
      expect(modal.textContent).toContain('Design Team');
      expect(modal.textContent).toContain('4 members');
    });

    test('group info lists all members', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c2'));
      const header = screen.getByTestId('chat-header');
      fireEvent.click(within(header).getByText('Design Team'));
      const modal = screen.getByTestId('group-info-modal');
      expect(modal.textContent).toContain('(You)');
      expect(modal.textContent).toContain('Alice Chen');
      expect(modal.textContent).toContain('Bob Martinez');
      expect(modal.textContent).toContain('Carol Williams');
    });

    test('close button closes group info modal', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c2'));
      const header = screen.getByTestId('chat-header');
      fireEvent.click(within(header).getByText('Design Team'));
      expect(screen.getByTestId('group-info-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('group-info-modal')).not.toBeInTheDocument();
    });
  });

  describe('New Chat Modal', () => {
    test('clicking new chat button opens the modal', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New chat'));
      expect(screen.getByTestId('new-chat-modal')).toBeInTheDocument();
      expect(screen.getByText('New Chat')).toBeInTheDocument();
    });

    test('new chat modal lists available users', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New chat'));
      expect(screen.getByTestId('new-chat-user-u2')).toBeInTheDocument();
      expect(screen.getByTestId('new-chat-user-u3')).toBeInTheDocument();
      expect(screen.getByTestId('new-chat-user-u4')).toBeInTheDocument();
    });

    test('clicking a user starts a direct chat', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New chat'));
      // u5 Dave Johnson doesn't have an existing direct chat shown
      fireEvent.click(screen.getByTestId('new-chat-user-u5'));
      // Modal should close and chat header should show
      expect(screen.queryByTestId('new-chat-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    });

    test('clicking an existing contact opens existing conversation', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New chat'));
      // u2 Alice already has a direct chat (c1)
      fireEvent.click(screen.getByTestId('new-chat-user-u2'));
      expect(screen.queryByTestId('new-chat-modal')).not.toBeInTheDocument();
      // Should show the existing chat with messages
      expect(screen.getByText('Hey! Did you get a chance to look at the new API endpoints?')).toBeInTheDocument();
    });
  });

  describe('New Group Modal', () => {
    test('clicking new group button opens the modal', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New group'));
      expect(screen.getByTestId('new-group-modal')).toBeInTheDocument();
      expect(screen.getByText('New Group')).toBeInTheDocument();
    });

    test('new group modal has name input and member checkboxes', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New group'));
      expect(screen.getByTestId('group-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('group-member-u2')).toBeInTheDocument();
      expect(screen.getByTestId('group-member-u3')).toBeInTheDocument();
    });

    test('create group button is disabled without name and members', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New group'));
      const createButton = screen.getByTestId('create-group-button');
      expect(createButton).toBeDisabled();
    });

    test('creating a group with name and members works', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New group'));
      fireEvent.change(screen.getByTestId('group-name-input'), { target: { value: 'Test Group' } });
      fireEvent.click(screen.getByTestId('group-member-u2'));
      fireEvent.click(screen.getByTestId('group-member-u3'));
      fireEvent.click(screen.getByTestId('create-group-button'));
      // Modal should close and new group should be selected
      expect(screen.queryByTestId('new-group-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    });

    test('selected member count updates as members are toggled', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New group'));
      expect(screen.getByText('Select members (0 selected)')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('group-member-u2'));
      expect(screen.getByText('Select members (1 selected)')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('group-member-u3'));
      expect(screen.getByText('Select members (2 selected)')).toBeInTheDocument();
    });
  });

  describe('Settings Modal', () => {
    test('clicking settings button opens settings modal', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
    });

    test('settings shows dark mode toggle', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
    });

    test('toggling dark mode updates theme', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      const toggle = screen.getByTestId('dark-mode-toggle');
      expect(toggle.textContent).toContain('Off');
      fireEvent.click(toggle);
      expect(toggle.textContent).toContain('On');
    });

    test('settings shows notification toggles', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      expect(screen.getByTestId('notif-sound')).toBeInTheDocument();
      expect(screen.getByTestId('notif-desktop')).toBeInTheDocument();
      expect(screen.getByTestId('notif-preview')).toBeInTheDocument();
    });

    test('notification toggles can be changed', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      const soundToggle = screen.getByTestId('notif-sound');
      expect(soundToggle.checked).toBe(true);
      fireEvent.click(soundToggle);
      expect(soundToggle.checked).toBe(false);
    });

    test('done button closes settings', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Done'));
      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
    });
  });

  describe('Forward Message', () => {
    test('forward modal opens from context menu', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const msg = screen.getByTestId('message-m1');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Forward/));
      expect(screen.getByTestId('forward-modal')).toBeInTheDocument();
    });

    test('forward modal lists other conversations', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const msg = screen.getByTestId('message-m1');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Forward/));
      const modal = screen.getByTestId('forward-modal');
      // Current conversation c1 should not be listed
      expect(within(modal).queryByTestId('forward-to-c1')).not.toBeInTheDocument();
      // Other conversations should be listed
      expect(within(modal).getByTestId('forward-to-c2')).toBeInTheDocument();
    });

    test('clicking a conversation in forward modal forwards the message', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      const msg = screen.getByTestId('message-m1');
      fireEvent.contextMenu(msg.querySelector('div[style]') || msg);
      const contextMenu = screen.getByTestId('context-menu');
      fireEvent.click(within(contextMenu).getByText(/Forward/));
      fireEvent.click(screen.getByTestId('forward-to-c3'));
      // Modal should close
      expect(screen.queryByTestId('forward-modal')).not.toBeInTheDocument();
    });
  });

  describe('Message Selection Mode', () => {
    test('select messages button toggles selection mode', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      fireEvent.click(screen.getByLabelText('Select messages'));
      // Checkboxes should appear on messages
      const messageList = screen.getByTestId('message-list');
      const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    test('selecting messages shows delete count', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      fireEvent.click(screen.getByLabelText('Select messages'));
      // Click on first message to select it
      const messageList = screen.getByTestId('message-list');
      const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
      fireEvent.click(checkboxes[0]);
      expect(screen.getByTestId('delete-selected')).toBeInTheDocument();
      expect(screen.getByTestId('delete-selected').textContent).toContain('1');
    });
  });

  describe('Context Menu', () => {
    test('right-clicking a conversation shows context menu', () => {
      render(<ChatApp />);
      fireEvent.contextMenu(screen.getByTestId('conversation-c1'));
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    test('context menu has pin, mute, mark as read, and archive options', () => {
      render(<ChatApp />);
      fireEvent.contextMenu(screen.getByTestId('conversation-c1'));
      const menu = screen.getByTestId('context-menu');
      expect(menu.textContent).toContain('Pin');
      expect(menu.textContent).toContain('Mute');
      expect(menu.textContent).toContain('Mark as read');
      expect(menu.textContent).toContain('Archive');
    });

    test('archive option in context menu archives conversation', () => {
      render(<ChatApp />);
      fireEvent.contextMenu(screen.getByTestId('conversation-c3'));
      const menu = screen.getByTestId('context-menu');
      fireEvent.click(within(menu).getByText(/Archive/));
      // c3 should no longer be visible in default view
      expect(screen.queryByTestId('conversation-c3')).not.toBeInTheDocument();
    });

    test('mark as read in context menu clears unread count', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('unread-badge-c2')).toHaveTextContent('5');
      fireEvent.contextMenu(screen.getByTestId('conversation-c2'));
      const menu = screen.getByTestId('context-menu');
      fireEvent.click(within(menu).getByText(/Mark as read/));
      expect(screen.queryByTestId('unread-badge-c2')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes settings modal', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
    });

    test('Escape closes new chat modal', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New chat'));
      expect(screen.getByTestId('new-chat-modal')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('new-chat-modal')).not.toBeInTheDocument();
    });

    test('Escape closes new group modal', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('New group'));
      expect(screen.getByTestId('new-group-modal')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('new-group-modal')).not.toBeInTheDocument();
    });

    test('Escape exits selection mode', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByTestId('conversation-c1'));
      fireEvent.click(screen.getByLabelText('Select messages'));
      const messageList = screen.getByTestId('message-list');
      expect(messageList.querySelectorAll('input[type="checkbox"]').length).toBeGreaterThan(0);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(messageList.querySelectorAll('input[type="checkbox"]').length).toBe(0);
    });
  });

  describe('localStorage Persistence', () => {
    test('theme preference is saved to localStorage', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      fireEvent.click(screen.getByTestId('dark-mode-toggle'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chatTheme', 'dark');
    });

    test('theme preference is loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chatTheme') return 'dark';
        return null;
      });
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      expect(screen.getByTestId('dark-mode-toggle').textContent).toContain('On');
    });

    test('notification settings are saved to localStorage', () => {
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      fireEvent.click(screen.getByTestId('notif-sound'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'chatNotifSettings',
        expect.any(String)
      );
    });

    test('notification settings are loaded from localStorage', () => {
      const settings = JSON.stringify({ sound: false, desktop: true, preview: false });
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chatNotifSettings') return settings;
        return null;
      });
      render(<ChatApp />);
      fireEvent.click(screen.getByLabelText('Settings'));
      expect(screen.getByTestId('notif-sound').checked).toBe(false);
      expect(screen.getByTestId('notif-desktop').checked).toBe(true);
      expect(screen.getByTestId('notif-preview').checked).toBe(false);
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'chatNotifSettings') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<ChatApp />)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<ChatApp />)).not.toThrow();
    });

    test('renders correctly with no active conversation', () => {
      render(<ChatApp />);
      expect(screen.getByTestId('no-chat-selected')).toBeInTheDocument();
      expect(screen.getByText('Select a conversation')).toBeInTheDocument();
    });
  });
});
