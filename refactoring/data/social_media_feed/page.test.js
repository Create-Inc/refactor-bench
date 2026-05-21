import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import SocialMediaFeed from './src/app/page.jsx';

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

describe('SocialMediaFeed Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders header with SocialHub title', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByText('SocialHub')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByPlaceholderText(/Search posts, people, tags/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('nav-feed')).toBeInTheDocument();
      expect(screen.getByTestId('nav-notifications')).toBeInTheDocument();
      expect(screen.getByTestId('nav-messages')).toBeInTheDocument();
      expect(screen.getByTestId('nav-bookmarks')).toBeInTheDocument();
      expect(screen.getByTestId('nav-profile')).toBeInTheDocument();
    });

    test('renders feed view by default', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('feed-view')).toBeInTheDocument();
    });

    test('renders theme toggle button', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('renders initial posts', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
      expect(screen.getByTestId('post-p2')).toBeInTheDocument();
      expect(screen.getByTestId('post-p3')).toBeInTheDocument();
    });

    test('renders post content correctly', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByText(/Just shipped a major refactor/)).toBeInTheDocument();
      expect(screen.getByText(/New design system exploration/)).toBeInTheDocument();
    });

    test('renders stories bar', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('stories-bar')).toBeInTheDocument();
    });

    test('renders trending sidebar', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('trending-sidebar')).toBeInTheDocument();
    });

    test('renders suggested users section', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('suggested-users')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('toggles theme saves to localStorage', () => {
      render(<SocialMediaFeed />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('socialFeedTheme', 'dark');
    });

    test('toggling theme twice returns to light', () => {
      render(<SocialMediaFeed />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('socialFeedTheme', 'light');
    });
  });

  describe('Post Interactions - Likes', () => {
    test('can like a post', () => {
      render(<SocialMediaFeed />);
      const likeBtn = screen.getByTestId('like-post-p1');
      fireEvent.click(likeBtn);
      expect(likeBtn.textContent).toContain('❤️');
    });

    test('can unlike a post', () => {
      render(<SocialMediaFeed />);
      const likeBtn = screen.getByTestId('like-post-p1');
      fireEvent.click(likeBtn);
      fireEvent.click(likeBtn);
      expect(likeBtn.textContent).toContain('🤍');
    });

    test('like count updates when liking a post', () => {
      render(<SocialMediaFeed />);
      const likeBtn = screen.getByTestId('like-post-p1');
      const initialText = likeBtn.textContent;
      fireEvent.click(likeBtn);
      expect(likeBtn.textContent).not.toBe(initialText);
    });
  });

  describe('Post Interactions - Bookmarks', () => {
    test('can bookmark a post', () => {
      render(<SocialMediaFeed />);
      const bookmarkBtn = screen.getByTestId('bookmark-post-p1');
      fireEvent.click(bookmarkBtn);
      expect(bookmarkBtn.textContent).toContain('⭐');
    });

    test('can unbookmark a post', () => {
      render(<SocialMediaFeed />);
      const bookmarkBtn = screen.getByTestId('bookmark-post-p1');
      fireEvent.click(bookmarkBtn);
      fireEvent.click(bookmarkBtn);
      expect(bookmarkBtn.textContent).toContain('☆');
    });

    test('bookmarks persist to localStorage', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('bookmark-post-p1'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'socialFeedBookmarks',
        expect.stringContaining('p1')
      );
    });

    test('bookmarked posts appear in bookmarks view', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('bookmark-post-p1'));
      fireEvent.click(screen.getByTestId('bookmark-post-p2'));
      fireEvent.click(screen.getByTestId('nav-bookmarks'));
      expect(screen.getByTestId('bookmarks-view')).toBeInTheDocument();
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
      expect(screen.getByTestId('post-p2')).toBeInTheDocument();
    });

    test('empty bookmarks view shows message', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-bookmarks'));
      expect(screen.getByTestId('empty-bookmarks')).toBeInTheDocument();
    });
  });

  describe('Post Interactions - Sharing', () => {
    test('clicking share opens share modal', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('share-post-p1'));
      expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    });

    test('confirming share increments share count', () => {
      render(<SocialMediaFeed />);
      const shareBtn = screen.getByTestId('share-post-p1');
      const initialText = shareBtn.textContent;
      fireEvent.click(shareBtn);
      fireEvent.click(screen.getByTestId('confirm-share'));
      expect(shareBtn.textContent).not.toBe(initialText);
    });

    test('canceling share closes modal', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('share-post-p1'));
      fireEvent.click(screen.getByTestId('cancel-share'));
      expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument();
    });
  });

  describe('Comments', () => {
    test('clicking comment button opens comments section', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.getByTestId('comments-section-p1')).toBeInTheDocument();
    });

    test('displays existing comments', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.getByTestId('comment-cm1')).toBeInTheDocument();
      expect(screen.getByTestId('comment-cm2')).toBeInTheDocument();
    });

    test('can add a new comment', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      const input = screen.getByTestId('comment-input-p1');
      fireEvent.change(input, { target: { value: 'Great post!' } });
      fireEvent.click(screen.getByTestId('submit-comment-p1'));
      expect(screen.getByText('Great post!')).toBeInTheDocument();
    });

    test('can add a comment via Enter key', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      const input = screen.getByTestId('comment-input-p1');
      fireEvent.change(input, { target: { value: 'Nice work!' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('Nice work!')).toBeInTheDocument();
    });

    test('empty comment is not submitted', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      const commentCountBefore = screen.getByTestId('comments-section-p1').querySelectorAll('[data-testid^="comment-cm"]').length;
      fireEvent.click(screen.getByTestId('submit-comment-p1'));
      const commentCountAfter = screen.getByTestId('comments-section-p1').querySelectorAll('[data-testid^="comment-cm"]').length;
      expect(commentCountAfter).toBe(commentCountBefore);
    });

    test('can like a comment', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      const likeBtn = screen.getByTestId('like-comment-cm1');
      fireEvent.click(likeBtn);
      expect(likeBtn.textContent).toContain('❤️');
    });

    test('comment section toggles closed', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.getByTestId('comments-section-p1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.queryByTestId('comments-section-p1')).not.toBeInTheDocument();
    });
  });

  describe('Post Creation', () => {
    test('clicking new post button shows composer', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      expect(screen.getByTestId('post-composer')).toBeInTheDocument();
    });

    test('can create a new post', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Hello world! This is my first post.' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      expect(screen.getByText('Hello world! This is my first post.')).toBeInTheDocument();
    });

    test('can create a post with tags', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Testing tags' },
      });
      fireEvent.change(screen.getByTestId('new-post-tags'), {
        target: { value: 'hello, world' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      expect(screen.getByTestId('tag-hello')).toBeInTheDocument();
      expect(screen.getByTestId('tag-world')).toBeInTheDocument();
    });

    test('composer closes after posting', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Test post' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      expect(screen.queryByTestId('post-composer')).not.toBeInTheDocument();
    });

    test('close composer button works', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.click(screen.getByTestId('close-composer'));
      expect(screen.queryByTestId('post-composer')).not.toBeInTheDocument();
    });

    test('cannot submit empty post', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      const submitBtn = screen.getByTestId('submit-post');
      expect(submitBtn.disabled).toBe(true);
    });
  });

  describe('Post Deletion', () => {
    test('delete button only shows on own posts', () => {
      render(<SocialMediaFeed />);
      // Other users' posts should not have delete button
      expect(screen.queryByTestId('delete-post-p1')).not.toBeInTheDocument();
    });

    test('can delete own post with confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Post to delete' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      expect(screen.getByText('Post to delete')).toBeInTheDocument();
      // Find the newly created post's delete button
      const newPost = screen.getByText('Post to delete').closest('[data-testid^="post-"]');
      const deleteBtn = within(newPost).getByText('🗑️');
      fireEvent.click(deleteBtn);
      expect(screen.queryByText('Post to delete')).not.toBeInTheDocument();
    });
  });

  describe('Feed Filtering and Sorting', () => {
    test('can filter feed by following', () => {
      render(<SocialMediaFeed />);
      const feedFilter = screen.getByTestId('feed-filter');
      fireEvent.change(feedFilter, { target: { value: 'following' } });
      // u1 and u3 are followed by default
      expect(screen.getByTestId('post-p1')).toBeInTheDocument(); // by u1
      expect(screen.getByTestId('post-p3')).toBeInTheDocument(); // by u3
      // u2's posts should not appear
      expect(screen.queryByTestId('post-p2')).not.toBeInTheDocument();
    });

    test('can filter feed by popular', () => {
      render(<SocialMediaFeed />);
      const feedFilter = screen.getByTestId('feed-filter');
      fireEvent.change(feedFilter, { target: { value: 'popular' } });
      // Posts with > 100 likes
      expect(screen.getByTestId('post-p3')).toBeInTheDocument(); // 156 likes
      expect(screen.getByTestId('post-p5')).toBeInTheDocument(); // 445 likes
      // Posts with <= 100 likes should not appear
      expect(screen.queryByTestId('post-p1')).not.toBeInTheDocument(); // 42 likes
    });

    test('can sort by most liked', () => {
      render(<SocialMediaFeed />);
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'popular' } });
      const posts = screen.getAllByTestId(/^post-p/);
      // p5 (445 likes) should be first
      expect(posts[0]).toHaveAttribute('data-testid', 'post-p5');
    });

    test('can sort by most discussed', () => {
      render(<SocialMediaFeed />);
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'discussed' } });
      const posts = screen.getAllByTestId(/^post-p/);
      // p4 (3 comments) should be first
      expect(posts[0]).toHaveAttribute('data-testid', 'post-p4');
    });

    test('default sort is most recent', () => {
      render(<SocialMediaFeed />);
      const posts = screen.getAllByTestId(/^post-p/);
      // p1 is most recent
      expect(posts[0]).toHaveAttribute('data-testid', 'post-p1');
    });
  });

  describe('Search', () => {
    test('can search posts by content', () => {
      render(<SocialMediaFeed />);
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'ramen' } });
      expect(screen.getByTestId('post-p4')).toBeInTheDocument();
      expect(screen.queryByTestId('post-p1')).not.toBeInTheDocument();
    });

    test('can search posts by tag', () => {
      render(<SocialMediaFeed />);
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'space' } });
      expect(screen.getByTestId('post-p5')).toBeInTheDocument();
    });

    test('can search for users', () => {
      render(<SocialMediaFeed />);
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      expect(screen.getByTestId('search-user-u1')).toBeInTheDocument();
    });

    test('search filter restricts to posts only', () => {
      render(<SocialMediaFeed />);
      fireEvent.change(screen.getByTestId('search-filter'), { target: { value: 'posts' } });
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Alice' } });
      expect(screen.queryByTestId('search-user-u1')).not.toBeInTheDocument();
    });

    test('search filter restricts to people only', () => {
      render(<SocialMediaFeed />);
      fireEvent.change(screen.getByTestId('search-filter'), { target: { value: 'people' } });
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'ramen' } });
      // No user named 'ramen' so no search results should display
      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });

    test('empty search shows all posts', () => {
      render(<SocialMediaFeed />);
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'ramen' } });
      expect(screen.queryByTestId('post-p1')).not.toBeInTheDocument();
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
    });
  });

  describe('Stories', () => {
    test('renders all stories', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('story-s1')).toBeInTheDocument();
      expect(screen.getByTestId('story-s2')).toBeInTheDocument();
      expect(screen.getByTestId('story-s3')).toBeInTheDocument();
      expect(screen.getByTestId('story-s4')).toBeInTheDocument();
      expect(screen.getByTestId('story-s5')).toBeInTheDocument();
    });

    test('clicking a story opens the story viewer', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('story-s1'));
      expect(screen.getByTestId('story-viewer')).toBeInTheDocument();
    });

    test('can close story viewer', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('story-s1'));
      fireEvent.click(screen.getByTestId('close-story'));
      expect(screen.queryByTestId('story-viewer')).not.toBeInTheDocument();
    });

    test('can navigate to next story', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('story-s1'));
      fireEvent.click(screen.getByTestId('next-story'));
      // Should still have story viewer open with next story content
      expect(screen.getByTestId('story-viewer')).toBeInTheDocument();
    });

    test('previous button is disabled on first story', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('story-s1'));
      expect(screen.getByTestId('prev-story').disabled).toBe(true);
    });

    test('next button is disabled on last story', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('story-s5'));
      expect(screen.getByTestId('next-story').disabled).toBe(true);
    });
  });

  describe('Navigation', () => {
    test('can navigate to notifications', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-notifications'));
      expect(screen.getByTestId('notifications-view')).toBeInTheDocument();
    });

    test('can navigate to messages', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-messages'));
      expect(screen.getByTestId('messages-view')).toBeInTheDocument();
    });

    test('can navigate to bookmarks', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-bookmarks'));
      expect(screen.getByTestId('bookmarks-view')).toBeInTheDocument();
    });

    test('can navigate to profile', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-profile'));
      expect(screen.getByTestId('profile-view')).toBeInTheDocument();
    });

    test('can navigate back to feed', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-notifications'));
      fireEvent.click(screen.getByTestId('nav-feed'));
      expect(screen.getByTestId('feed-view')).toBeInTheDocument();
    });

    test('clicking SocialHub title goes to feed', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-notifications'));
      fireEvent.click(screen.getByText('SocialHub'));
      expect(screen.getByTestId('feed-view')).toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    test('displays notifications', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-notifications'));
      expect(screen.getByTestId('notification-n1')).toBeInTheDocument();
      expect(screen.getByTestId('notification-n2')).toBeInTheDocument();
    });

    test('shows unread notification count badge', () => {
      render(<SocialMediaFeed />);
      const badge = screen.getByTestId('badge-notifications');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('3');
    });

    test('can mark all notifications as read', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-notifications'));
      fireEvent.click(screen.getByTestId('mark-all-read'));
      // Badge should disappear
      expect(screen.queryByTestId('badge-notifications')).not.toBeInTheDocument();
    });

    test('can filter notifications by type', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-notifications'));
      fireEvent.click(screen.getByTestId('notif-filter-like'));
      // Only like notifications should show (n1, n5)
      expect(screen.getByTestId('notification-n1')).toBeInTheDocument();
      expect(screen.getByTestId('notification-n5')).toBeInTheDocument();
      expect(screen.queryByTestId('notification-n2')).not.toBeInTheDocument();
    });

    test('can filter notifications by unread', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-notifications'));
      fireEvent.click(screen.getByTestId('notif-filter-unread'));
      expect(screen.getByTestId('notification-n1')).toBeInTheDocument();
      expect(screen.getByTestId('notification-n2')).toBeInTheDocument();
      expect(screen.getByTestId('notification-n3')).toBeInTheDocument();
      expect(screen.queryByTestId('notification-n4')).not.toBeInTheDocument();
    });
  });

  describe('Messages', () => {
    test('displays conversation list', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-messages'));
      expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-conv1')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-conv2')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-conv3')).toBeInTheDocument();
    });

    test('shows unread badges on conversations', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-messages'));
      expect(screen.getByTestId('unread-badge-conv1')).toBeInTheDocument();
      expect(screen.getByTestId('unread-badge-conv3')).toBeInTheDocument();
      expect(screen.queryByTestId('unread-badge-conv2')).not.toBeInTheDocument();
    });

    test('shows no conversation selected message initially', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-messages'));
      expect(screen.getByTestId('no-conversation-selected')).toBeInTheDocument();
    });

    test('clicking a conversation shows messages', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-messages'));
      fireEvent.click(screen.getByTestId('conversation-conv1'));
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      expect(screen.getByTestId('message-msg1')).toBeInTheDocument();
      expect(screen.getByTestId('message-msg2')).toBeInTheDocument();
      expect(screen.getByTestId('message-msg3')).toBeInTheDocument();
    });

    test('can send a message', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-messages'));
      fireEvent.click(screen.getByTestId('conversation-conv1'));
      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello there!' } });
      fireEvent.click(screen.getByTestId('send-message'));
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });

    test('can send a message with Enter key', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-messages'));
      fireEvent.click(screen.getByTestId('conversation-conv1'));
      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Enter message!' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('Enter message!')).toBeInTheDocument();
    });

    test('marking conversation as read removes unread badge', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-messages'));
      expect(screen.getByTestId('unread-badge-conv1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('conversation-conv1'));
      expect(screen.queryByTestId('unread-badge-conv1')).not.toBeInTheDocument();
    });

    test('total unread message badge shows in sidebar', () => {
      render(<SocialMediaFeed />);
      const badge = screen.getByTestId('badge-messages');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('3'); // 2 from conv1 + 1 from conv3
    });
  });

  describe('Profile', () => {
    test('renders own profile with user info', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-profile'));
      expect(screen.getByText('Current User')).toBeInTheDocument();
      expect(screen.getByText('@currentuser')).toBeInTheDocument();
    });

    test('can view another user profile by clicking post author', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p1'));
      expect(screen.getByTestId('profile-view')).toBeInTheDocument();
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    });

    test('profile shows user posts', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p1'));
      // Alice (u1) has posts p1, p6
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
      expect(screen.getByTestId('post-p6')).toBeInTheDocument();
    });

    test('profile shows follow/unfollow button for other users', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p2')); // Bob (u2) - not followed
      expect(screen.getByTestId('follow-btn-u2')).toBeInTheDocument();
      expect(screen.getByTestId('follow-btn-u2').textContent).toBe('Follow');
    });

    test('profile shows following state for followed users', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p1')); // Alice (u1) - followed
      expect(screen.getByTestId('follow-btn-u1').textContent).toBe('Following');
    });

    test('profile shows follower and following counts', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p1'));
      expect(screen.getByText('followers')).toBeInTheDocument();
      expect(screen.getByText('following')).toBeInTheDocument();
      expect(screen.getByText('posts')).toBeInTheDocument();
      expect(screen.getByText('total likes')).toBeInTheDocument();
    });
  });

  describe('Follow/Unfollow', () => {
    test('can follow a user from their profile', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p2')); // Bob (u2) - not followed
      const followBtn = screen.getByTestId('follow-btn-u2');
      expect(followBtn.textContent).toBe('Follow');
      fireEvent.click(followBtn);
      expect(followBtn.textContent).toBe('Following');
    });

    test('can unfollow a user from their profile', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p1')); // Alice (u1) - followed
      const followBtn = screen.getByTestId('follow-btn-u1');
      expect(followBtn.textContent).toBe('Following');
      fireEvent.click(followBtn);
      expect(followBtn.textContent).toBe('Follow');
    });

    test('follow state persists to localStorage', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p2'));
      fireEvent.click(screen.getByTestId('follow-btn-u2'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'socialFeedFollows',
        expect.stringContaining('u2')
      );
    });

    test('can follow a user from suggested users section', () => {
      render(<SocialMediaFeed />);
      // u2, u4, u5 are not followed initially
      const followBtn = screen.getByTestId('suggest-follow-u2');
      fireEvent.click(followBtn);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'socialFeedFollows',
        expect.stringContaining('u2')
      );
    });
  });

  describe('Sidebar', () => {
    test('can collapse sidebar', () => {
      render(<SocialMediaFeed />);
      const sidebar = screen.getByTestId('sidebar');
      fireEvent.click(screen.getByTestId('toggle-sidebar'));
      expect(sidebar.style.width).toBe('60px');
    });

    test('can expand sidebar', () => {
      render(<SocialMediaFeed />);
      const sidebar = screen.getByTestId('sidebar');
      fireEvent.click(screen.getByTestId('toggle-sidebar'));
      fireEvent.click(screen.getByTestId('toggle-sidebar'));
      expect(sidebar.style.width).toBe('220px');
    });
  });

  describe('Tags and Trending', () => {
    test('renders post tags', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('tag-webdev')).toBeInTheDocument();
      expect(screen.getByTestId('tag-react')).toBeInTheDocument();
    });

    test('clicking a tag searches for it', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('tag-cooking'));
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput.value).toBe('cooking');
    });

    test('clicking a trending topic searches for it', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('trending-webdev'));
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput.value).toBe('webdev');
    });

    test('renders trending topics with post counts', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('trending-webdev')).toBeInTheDocument();
      expect(screen.getByTestId('trending-react')).toBeInTheDocument();
      expect(screen.getByTestId('trending-design')).toBeInTheDocument();
    });
  });

  describe('Post Media', () => {
    test('renders media for posts that have it', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('post-media-p2')).toBeInTheDocument();
      expect(screen.getByTestId('post-media-p4')).toBeInTheDocument();
    });

    test('does not render media for posts without it', () => {
      render(<SocialMediaFeed />);
      expect(screen.queryByTestId('post-media-p1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('post-media-p3')).not.toBeInTheDocument();
    });
  });

  describe('Verified Users', () => {
    test('shows verified badge for verified users', () => {
      render(<SocialMediaFeed />);
      // Alice (u1) is verified — look for the checkmark in post author area
      const postAuthor = screen.getByTestId('post-p1');
      expect(postAuthor.textContent).toContain('✓');
    });
  });

  describe('Empty States', () => {
    test('shows empty feed message when no posts match', () => {
      render(<SocialMediaFeed />);
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'xyznonexistenttermxyz' },
      });
      expect(screen.getByTestId('empty-feed')).toBeInTheDocument();
    });

    test('shows empty notifications when filtered to non-existent type', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-notifications'));
      fireEvent.click(screen.getByTestId('mark-all-read'));
      fireEvent.click(screen.getByTestId('notif-filter-unread'));
      expect(screen.getByTestId('empty-notifications')).toBeInTheDocument();
    });
  });

  describe('Cross-Feature Interactions', () => {
    test('bookmarking from profile view persists when navigating to bookmarks', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('post-author-name-p1')); // Go to Alice profile
      fireEvent.click(screen.getByTestId('bookmark-post-p1')); // Bookmark from profile
      fireEvent.click(screen.getByTestId('nav-bookmarks')); // Go to bookmarks
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
    });

    test('following filter interacts with follow state changes', () => {
      render(<SocialMediaFeed />);
      // Unfollow u1 (Alice)
      fireEvent.click(screen.getByTestId('post-author-name-p1'));
      fireEvent.click(screen.getByTestId('follow-btn-u1'));
      // Go back to feed with following filter
      fireEvent.click(screen.getByTestId('nav-feed'));
      fireEvent.change(screen.getByTestId('feed-filter'), { target: { value: 'following' } });
      // Alice's posts should not be visible now
      expect(screen.queryByTestId('post-p1')).not.toBeInTheDocument();
    });

    test('new post appears in own profile', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Profile test post' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      fireEvent.click(screen.getByTestId('nav-profile'));
      expect(screen.getByText('Profile test post')).toBeInTheDocument();
    });

    test('liking a post from feed preserves state in bookmarks', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('bookmark-post-p1'));
      fireEvent.click(screen.getByTestId('like-post-p1'));
      fireEvent.click(screen.getByTestId('nav-bookmarks'));
      const likeBtn = screen.getByTestId('like-post-p1');
      expect(likeBtn.textContent).toContain('❤️');
    });

    test('adding comment updates comment count on post', () => {
      render(<SocialMediaFeed />);
      const commentBtn = screen.getByTestId('comment-btn-p3');
      const initialText = commentBtn.textContent;
      fireEvent.click(commentBtn);
      fireEvent.change(screen.getByTestId('comment-input-p3'), {
        target: { value: 'New comment' },
      });
      fireEvent.click(screen.getByTestId('submit-comment-p3'));
      // Close and check count updated
      fireEvent.click(commentBtn);
      expect(commentBtn.textContent).not.toBe(initialText);
    });
  });

  describe('Post Editing', () => {
    test('can enter edit mode on own post', () => {
      render(<SocialMediaFeed />);
      // Create a post first
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Original content' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      // Find the new post and click edit
      const newPost = screen.getByText('Original content').closest('[data-testid^="post-"]');
      const postId = newPost.getAttribute('data-testid').replace('post-', '');
      fireEvent.click(screen.getByTestId(`edit-post-${postId}`));
      expect(screen.getByTestId(`edit-form-${postId}`)).toBeInTheDocument();
    });

    test('can save edited post', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Before edit' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      const newPost = screen.getByText('Before edit').closest('[data-testid^="post-"]');
      const postId = newPost.getAttribute('data-testid').replace('post-', '');
      fireEvent.click(screen.getByTestId(`edit-post-${postId}`));
      fireEvent.change(screen.getByTestId(`edit-content-${postId}`), {
        target: { value: 'After edit' },
      });
      fireEvent.click(screen.getByTestId(`save-edit-${postId}`));
      expect(screen.getByText('After edit')).toBeInTheDocument();
      expect(screen.queryByText('Before edit')).not.toBeInTheDocument();
    });

    test('edited post shows edited badge', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Edit me' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      const newPost = screen.getByText('Edit me').closest('[data-testid^="post-"]');
      const postId = newPost.getAttribute('data-testid').replace('post-', '');
      fireEvent.click(screen.getByTestId(`edit-post-${postId}`));
      fireEvent.change(screen.getByTestId(`edit-content-${postId}`), {
        target: { value: 'Edited content' },
      });
      fireEvent.click(screen.getByTestId(`save-edit-${postId}`));
      expect(screen.getByTestId(`edited-badge-${postId}`)).toBeInTheDocument();
    });

    test('can cancel editing', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'No edit' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      const newPost = screen.getByText('No edit').closest('[data-testid^="post-"]');
      const postId = newPost.getAttribute('data-testid').replace('post-', '');
      fireEvent.click(screen.getByTestId(`edit-post-${postId}`));
      fireEvent.click(screen.getByTestId(`cancel-edit-${postId}`));
      expect(screen.queryByTestId(`edit-form-${postId}`)).not.toBeInTheDocument();
      expect(screen.getByText('No edit')).toBeInTheDocument();
    });
  });

  describe('Post Pinning', () => {
    test('can pin own post', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Pin me' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      const newPost = screen.getByText('Pin me').closest('[data-testid^="post-"]');
      const postId = newPost.getAttribute('data-testid').replace('post-', '');
      fireEvent.click(screen.getByTestId(`pin-post-${postId}`));
      expect(screen.getByTestId(`pinned-badge-${postId}`)).toBeInTheDocument();
    });

    test('pinned posts appear at top of feed', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Pinned post content' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      const newPost = screen.getByText('Pinned post content').closest('[data-testid^="post-"]');
      const postId = newPost.getAttribute('data-testid').replace('post-', '');
      fireEvent.click(screen.getByTestId(`pin-post-${postId}`));
      const allPosts = screen.getAllByTestId(/^post-/);
      expect(allPosts[0]).toHaveAttribute('data-testid', `post-${postId}`);
    });
  });

  describe('Muting Users', () => {
    test('mute button appears on other users posts', () => {
      render(<SocialMediaFeed />);
      // p1 is by u1
      expect(screen.getByTestId('mute-user-u1')).toBeInTheDocument();
    });

    test('muting a user hides their posts from feed', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('mute-user-u1'));
      // u1's posts (p1, p6) should be hidden
      expect(screen.queryByTestId('post-p1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('post-p6')).not.toBeInTheDocument();
    });

    test('muted users appear in settings', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('mute-user-u1'));
      fireEvent.click(screen.getByTestId('nav-settings'));
      expect(screen.getByTestId('muted-user-u1')).toBeInTheDocument();
    });

    test('can unmute from settings', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('mute-user-u1'));
      fireEvent.click(screen.getByTestId('nav-settings'));
      fireEvent.click(screen.getByTestId('unmute-u1'));
      expect(screen.queryByTestId('muted-user-u1')).not.toBeInTheDocument();
    });
  });

  describe('Reporting Posts', () => {
    test('report button appears on other users posts', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('report-post-p1')).toBeInTheDocument();
    });

    test('clicking report opens report modal', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('report-post-p1'));
      expect(screen.getByTestId('report-modal')).toBeInTheDocument();
    });

    test('can select a report reason', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('report-post-p1'));
      fireEvent.click(screen.getByTestId('report-reason-spam'));
      expect(screen.getByTestId('report-reason-spam')).toBeInTheDocument();
    });

    test('can submit a report', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('report-post-p1'));
      fireEvent.click(screen.getByTestId('report-reason-spam'));
      fireEvent.click(screen.getByTestId('submit-report'));
      expect(screen.queryByTestId('report-modal')).not.toBeInTheDocument();
    });

    test('cannot submit report without reason', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('report-post-p1'));
      const submitBtn = screen.getByTestId('submit-report');
      expect(submitBtn.disabled).toBe(true);
    });

    test('can cancel report', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('report-post-p1'));
      fireEvent.click(screen.getByTestId('cancel-report'));
      expect(screen.queryByTestId('report-modal')).not.toBeInTheDocument();
    });
  });

  describe('Reposting', () => {
    test('repost button appears on other users posts', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('repost-btn-p1')).toBeInTheDocument();
    });

    test('reposting creates a new post with repost badge', () => {
      render(<SocialMediaFeed />);
      const postsBefore = screen.getAllByTestId(/^post-/).length;
      fireEvent.click(screen.getByTestId('repost-btn-p1'));
      const postsAfter = screen.getAllByTestId(/^post-/).length;
      expect(postsAfter).toBe(postsBefore + 1);
    });

    test('reposted post shows original author attribution', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('repost-btn-p1'));
      const allPosts = screen.getAllByTestId(/^post-/);
      // The repost should be the first post (most recent)
      const repostBadge = allPosts[0].querySelector('[data-testid^="repost-badge-"]');
      expect(repostBadge).toBeInTheDocument();
      expect(repostBadge.textContent).toContain('Alice Chen');
    });
  });

  describe('Settings', () => {
    test('can navigate to settings', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-settings'));
      expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    });

    test('can toggle compact mode', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-settings'));
      const compactBtn = screen.getByTestId('setting-compact-mode');
      expect(compactBtn.textContent).toBe('Off');
      fireEvent.click(compactBtn);
      expect(compactBtn.textContent).toBe('On');
    });

    test('can toggle notification badges', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-settings'));
      const notifBtn = screen.getByTestId('setting-notif-badges');
      expect(notifBtn.textContent).toBe('On');
      fireEvent.click(notifBtn);
      expect(notifBtn.textContent).toBe('Off');
    });

    test('disabling notification badges hides badges in sidebar', () => {
      render(<SocialMediaFeed />);
      expect(screen.getByTestId('badge-notifications')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('nav-settings'));
      fireEvent.click(screen.getByTestId('setting-notif-badges'));
      fireEvent.click(screen.getByTestId('nav-feed'));
      expect(screen.queryByTestId('badge-notifications')).not.toBeInTheDocument();
    });

    test('can toggle dark mode from settings', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-settings'));
      fireEvent.click(screen.getByTestId('setting-dark-mode'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('socialFeedTheme', 'dark');
    });

    test('can toggle read receipts', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-settings'));
      const receiptsBtn = screen.getByTestId('setting-read-receipts');
      expect(receiptsBtn.textContent).toBe('On');
      fireEvent.click(receiptsBtn);
      expect(receiptsBtn.textContent).toBe('Off');
    });

    test('shows user stats', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-settings'));
      expect(screen.getByTestId('user-stats')).toBeInTheDocument();
    });

    test('shows no muted users initially', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-settings'));
      expect(screen.getByTestId('no-muted-users')).toBeInTheDocument();
    });
  });

  describe('Advanced Cross-Feature Interactions', () => {
    test('muted user posts are hidden in bookmarks view too', () => {
      render(<SocialMediaFeed />);
      // Bookmark then mute
      fireEvent.click(screen.getByTestId('bookmark-post-p1'));
      fireEvent.click(screen.getByTestId('mute-user-u1'));
      // Bookmarks view still shows the bookmarked post (bookmarks override mute)
      fireEvent.click(screen.getByTestId('nav-bookmarks'));
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
    });

    test('repost appears in own profile', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('repost-btn-p1'));
      fireEvent.click(screen.getByTestId('nav-profile'));
      // The repost should appear in own profile
      const repostBadges = screen.getAllByTestId(/^repost-badge-/);
      expect(repostBadges.length).toBeGreaterThan(0);
    });

    test('editing a post preserves its bookmark state', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Bookmark and edit me' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      const newPost = screen.getByText('Bookmark and edit me').closest('[data-testid^="post-"]');
      const postId = newPost.getAttribute('data-testid').replace('post-', '');
      fireEvent.click(screen.getByTestId(`bookmark-post-${postId}`));
      fireEvent.click(screen.getByTestId(`edit-post-${postId}`));
      fireEvent.change(screen.getByTestId(`edit-content-${postId}`), {
        target: { value: 'Edited and bookmarked' },
      });
      fireEvent.click(screen.getByTestId(`save-edit-${postId}`));
      fireEvent.click(screen.getByTestId('nav-bookmarks'));
      expect(screen.getByText('Edited and bookmarked')).toBeInTheDocument();
    });

    test('compact mode affects post rendering', () => {
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('nav-settings'));
      fireEvent.click(screen.getByTestId('setting-compact-mode'));
      fireEvent.click(screen.getByTestId('nav-feed'));
      // Post cards should have compact padding
      const post = screen.getByTestId('post-p1');
      expect(post.style.padding).toBe('10px');
    });

    test('user stats update when creating and deleting posts', () => {
      window.confirm.mockReturnValue(true);
      render(<SocialMediaFeed />);
      fireEvent.click(screen.getByTestId('open-composer'));
      fireEvent.change(screen.getByTestId('new-post-content'), {
        target: { value: 'Stats test' },
      });
      fireEvent.click(screen.getByTestId('submit-post'));
      fireEvent.click(screen.getByTestId('nav-settings'));
      const stats = screen.getByTestId('user-stats');
      expect(stats.textContent).toContain('1'); // 1 post by me
    });
  });
});
