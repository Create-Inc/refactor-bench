import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunityForum from './src/app/page.jsx';

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

describe('CommunityForum Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with ForumHub title', () => {
      render(<CommunityForum />);
      expect(screen.getByText(/ForumHub/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<CommunityForum />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Bookmarks')).toBeInTheDocument();
      expect(screen.getByText('Trending')).toBeInTheDocument();
      expect(screen.getByText('Members')).toBeInTheDocument();
      expect(screen.getByText('Statistics')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<CommunityForum />);
      expect(screen.getByPlaceholderText('Search threads... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders category filter', () => {
      render(<CommunityForum />);
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
    });

    test('renders sort dropdown', () => {
      render(<CommunityForum />);
      expect(screen.getByLabelText('Sort threads')).toBeInTheDocument();
    });

    test('renders New Thread button', () => {
      render(<CommunityForum />);
      expect(screen.getByText('New Thread')).toBeInTheDocument();
    });

    test('renders thread list on home view by default', () => {
      render(<CommunityForum />);
      expect(screen.getByText('Welcome to the Community Forum!')).toBeInTheDocument();
      expect(screen.getByText('Best practices for React performance optimization')).toBeInTheDocument();
    });

    test('renders pinned thread indicator', () => {
      render(<CommunityForum />);
      const pinnedIcons = screen.getAllByTitle('Pinned');
      expect(pinnedIcons.length).toBeGreaterThan(0);
    });

    test('renders thread count', () => {
      render(<CommunityForum />);
      expect(screen.getByText('6 threads')).toBeInTheDocument();
    });

    test('renders sidebar stats', () => {
      render(<CommunityForum />);
      expect(screen.getByText(/threads/)).toBeInTheDocument();
      expect(screen.getByText(/posts/)).toBeInTheDocument();
      expect(screen.getByText(/members/)).toBeInTheDocument();
    });

    test('renders moderation button for admin user', () => {
      render(<CommunityForum />);
      expect(screen.getByLabelText('Moderation panel')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<CommunityForum />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<CommunityForum />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('forumTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<CommunityForum />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('forumTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'forumTheme') return 'dark';
        return null;
      });
      render(<CommunityForum />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Home shows thread list', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Home'));
      expect(screen.getByText('Welcome to the Community Forum!')).toBeInTheDocument();
    });

    test('clicking Bookmarks shows bookmarked threads', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Bookmarks'));
      expect(screen.getByText('Bookmarked Threads')).toBeInTheDocument();
    });

    test('clicking Trending shows trending threads', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Trending'));
      expect(screen.getByText('Trending Threads')).toBeInTheDocument();
    });

    test('clicking Members shows member cards', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      expect(screen.getByText('Community Members')).toBeInTheDocument();
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
    });

    test('clicking Statistics shows forum stats', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Forum Statistics')).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Trending'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('forumView', 'trending');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<CommunityForum />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<CommunityForum />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('Bookmarks')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<CommunityForum />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search input filters threads by title', () => {
      render(<CommunityForum />);
      const searchInput = screen.getByPlaceholderText('Search threads... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'React' } });
      expect(screen.getByText('Best practices for React performance optimization')).toBeInTheDocument();
      expect(screen.queryByText('Favorite indie games of 2025?')).not.toBeInTheDocument();
    });

    test('search input filters threads by tags', () => {
      render(<CommunityForum />);
      const searchInput = screen.getByPlaceholderText('Search threads... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'astronomy' } });
      expect(screen.getByText('The James Webb Space Telescope latest discoveries')).toBeInTheDocument();
    });

    test('search input filters threads by author name', () => {
      render(<CommunityForum />);
      const searchInput = screen.getByPlaceholderText('Search threads... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Maya Patel' } });
      expect(screen.getByText('Share your latest creative projects!')).toBeInTheDocument();
    });

    test('clearing search shows all threads again', () => {
      render(<CommunityForum />);
      const searchInput = screen.getByPlaceholderText('Search threads... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'React' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Welcome to the Community Forum!')).toBeInTheDocument();
      expect(screen.getByText('Favorite indie games of 2025?')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('filtering by tech shows only tech threads', () => {
      render(<CommunityForum />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'tech' } });
      expect(screen.getByText('Best practices for React performance optimization')).toBeInTheDocument();
      expect(screen.queryByText('Share your latest creative projects!')).not.toBeInTheDocument();
    });

    test('selecting All Categories shows all threads', () => {
      render(<CommunityForum />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'tech' } });
      fireEvent.change(categoryFilter, { target: { value: 'all' } });
      expect(screen.getByText('Welcome to the Community Forum!')).toBeInTheDocument();
      expect(screen.getByText('Share your latest creative projects!')).toBeInTheDocument();
    });
  });

  describe('Sort Controls', () => {
    test('sort dropdown has all options', () => {
      render(<CommunityForum />);
      const sortSelect = screen.getByLabelText('Sort threads');
      expect(sortSelect).toBeInTheDocument();
    });

    test('sorting by most views reorders threads', () => {
      render(<CommunityForum />);
      const sortSelect = screen.getByLabelText('Sort threads');
      fireEvent.change(sortSelect, { target: { value: 'mostViews' } });
      // Pinned thread stays first, then sorted by views
      const threadTitles = screen
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent);
      expect(threadTitles[0]).toBe('Welcome to the Community Forum!');
    });
  });

  describe('Tag Filtering', () => {
    test('clicking a tag filters threads by that tag', () => {
      render(<CommunityForum />);
      const reactTag = screen.getAllByText('#react')[0];
      fireEvent.click(reactTag);
      expect(screen.getByText('Best practices for React performance optimization')).toBeInTheDocument();
      expect(screen.getByText(/Filtering by tag/)).toBeInTheDocument();
    });

    test('clearing tag filter shows all threads', () => {
      render(<CommunityForum />);
      const reactTag = screen.getAllByText('#react')[0];
      fireEvent.click(reactTag);
      fireEvent.click(screen.getByText('Clear filter'));
      expect(screen.getByText('Welcome to the Community Forum!')).toBeInTheDocument();
    });
  });

  describe('Thread Cards', () => {
    test('thread cards display author info', () => {
      render(<CommunityForum />);
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
    });

    test('thread cards display category badge', () => {
      render(<CommunityForum />);
      expect(screen.getByText(/General Discussion/)).toBeInTheDocument();
      expect(screen.getByText(/Technology/)).toBeInTheDocument();
    });

    test('thread cards display post and reply counts', () => {
      render(<CommunityForum />);
      const postCounts = screen.getAllByText(/posts/);
      expect(postCounts.length).toBeGreaterThan(0);
    });

    test('thread cards display view counts', () => {
      render(<CommunityForum />);
      const viewCounts = screen.getAllByText(/views/);
      expect(viewCounts.length).toBeGreaterThan(0);
    });

    test('thread cards display tags', () => {
      render(<CommunityForum />);
      expect(screen.getAllByText('#react').length).toBeGreaterThan(0);
      expect(screen.getAllByText('#javascript').length).toBeGreaterThan(0);
    });
  });

  describe('Bookmarks', () => {
    test('bookmarks view shows bookmarked threads', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Bookmarks'));
      expect(screen.getByText('Bookmarked Threads')).toBeInTheDocument();
      // t1 and t2 are bookmarked by default
      expect(screen.getByText('Welcome to the Community Forum!')).toBeInTheDocument();
      expect(screen.getByText('Best practices for React performance optimization')).toBeInTheDocument();
    });

    test('toggling bookmark removes thread from bookmarks view', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Bookmarks'));
      const removeButtons = screen.getAllByLabelText(/Remove bookmark/);
      fireEvent.click(removeButtons[0]);
      // One bookmark should be removed
      const remainingBookmarks = screen.queryAllByLabelText(/Remove bookmark/);
      expect(remainingBookmarks.length).toBe(removeButtons.length - 1);
    });

    test('bookmarks persist to localStorage', () => {
      render(<CommunityForum />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('forumBookmarks', expect.any(String));
    });
  });

  describe('Thread Detail View', () => {
    test('clicking a thread opens thread detail', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText('← Back to threads')).toBeInTheDocument();
    });

    test('thread detail shows full content', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText(/community space for sharing ideas/)).toBeInTheDocument();
    });

    test('thread detail shows author info and date', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    });

    test('thread detail shows reply count', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText(/Replies/)).toBeInTheDocument();
    });

    test('thread detail shows posts with content', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText('Great to be here! Looking forward to connecting with everyone.')).toBeInTheDocument();
    });

    test('thread detail shows nested replies', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText('Welcome aboard, Sam! Feel free to ask any questions.')).toBeInTheDocument();
      expect(screen.getByText('Thanks for the warm welcome!')).toBeInTheDocument();
    });

    test('back button returns to thread list', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      fireEvent.click(screen.getByText('← Back to threads'));
      expect(screen.getByText('6 threads')).toBeInTheDocument();
    });

    test('thread detail shows tags', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText('#welcome')).toBeInTheDocument();
      expect(screen.getByText('#announcement')).toBeInTheDocument();
    });
  });

  describe('Voting', () => {
    test('post shows vote count', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      // Post p3 has 24 votes
      expect(screen.getByText('24')).toBeInTheDocument();
    });

    test('upvote button exists on posts', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      const upvoteButtons = screen.getAllByLabelText('Upvote');
      expect(upvoteButtons.length).toBeGreaterThan(0);
    });

    test('downvote button exists on posts', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      const downvoteButtons = screen.getAllByLabelText('Downvote');
      expect(downvoteButtons.length).toBeGreaterThan(0);
    });

    test('clicking upvote changes vote count', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      // p4 has 15 votes and current user has voted already (+1)
      // p5 has 19 votes and current user has not voted
      const upvoteButtons = screen.getAllByLabelText('Upvote');
      // Click upvote on last post (p5, 19 votes, user hasn't voted)
      fireEvent.click(upvoteButtons[upvoteButtons.length - 1]);
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    test('reply upvote button exists', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      const replyUpvotes = screen.getAllByLabelText('Upvote reply');
      expect(replyUpvotes.length).toBeGreaterThan(0);
    });
  });

  describe('Adding Posts', () => {
    test('thread detail shows Add a Reply section', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText('Add a Reply')).toBeInTheDocument();
    });

    test('post input placeholder is shown', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByPlaceholderText('Write your reply...')).toBeInTheDocument();
    });

    test('submitting a post via Post button adds it to thread', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      const textarea = screen.getByPlaceholderText('Write your reply...');
      fireEvent.change(textarea, { target: { value: 'This is a new test post!' } });
      const postButtons = screen.getAllByText('Post');
      fireEvent.click(postButtons[postButtons.length - 1]);
      expect(screen.getByText('This is a new test post!')).toBeInTheDocument();
    });

    test('submitting a post via Enter key adds it to thread', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      const textarea = screen.getByPlaceholderText('Write your reply...');
      fireEvent.change(textarea, { target: { value: 'Enter key post' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      expect(screen.getByText('Enter key post')).toBeInTheDocument();
    });
  });

  describe('Adding Replies', () => {
    test('Reply button exists on posts', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      const replyButtons = screen.getAllByText('Reply');
      expect(replyButtons.length).toBeGreaterThan(0);
    });

    test('clicking Reply shows reply input', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      const replyButtons = screen.getAllByText('Reply');
      fireEvent.click(replyButtons[0]);
      expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
    });

    test('submitting a reply via Send button adds it', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      const replyButtons = screen.getAllByText('Reply');
      fireEvent.click(replyButtons[0]);
      const replyInput = screen.getByPlaceholderText('Write a reply...');
      fireEvent.change(replyInput, { target: { value: 'Test reply content' } });
      fireEvent.click(screen.getByText('Send'));
      expect(screen.getByText('Test reply content')).toBeInTheDocument();
    });

    test('submitting a reply via Enter key adds it', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      const replyButtons = screen.getAllByText('Reply');
      fireEvent.click(replyButtons[0]);
      const replyInput = screen.getByPlaceholderText('Write a reply...');
      fireEvent.change(replyInput, { target: { value: 'Enter key reply' } });
      fireEvent.keyDown(replyInput, { key: 'Enter' });
      expect(screen.getByText('Enter key reply')).toBeInTheDocument();
    });

    test('cancel button hides reply input', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      const replyButtons = screen.getAllByText('Reply');
      fireEvent.click(replyButtons[0]);
      expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByPlaceholderText('Write a reply...')).not.toBeInTheDocument();
    });
  });

  describe('Post Editing', () => {
    test('edit button shows for user own posts', () => {
      render(<CommunityForum />);
      // Thread t1 post p1 is by u3, current user is u1 who authored the thread itself
      // Thread t2 has post p3 by u1 (current user)
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      // p3 is by u1, should have Edit button
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    test('clicking Edit shows edit textarea', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Save Edit')).toBeInTheDocument();
    });

    test('saving edit updates post content', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      const textarea = screen.getByDisplayValue(/Great question/);
      fireEvent.change(textarea, { target: { value: 'Updated post content here' } });
      fireEvent.click(screen.getByText('Save Edit'));
      expect(screen.getByText('Updated post content here')).toBeInTheDocument();
    });

    test('cancel edit reverts to original', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      // Click cancel
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      expect(screen.queryByText('Save Edit')).not.toBeInTheDocument();
    });

    test('edited posts show edited indicator', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      // Post p3 has isEdited: true
      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });
  });

  describe('Post Deletion', () => {
    test('delete button shows on own posts', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    test('delete requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this post?');
    });

    test('confirming delete removes the post', () => {
      window.confirm.mockReturnValue(true);
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Best practices for React performance optimization'));
      const initialDeleteButtons = screen.getAllByText('Delete');
      const initialCount = initialDeleteButtons.length;
      fireEvent.click(initialDeleteButtons[0]);
      const remainingDeleteButtons = screen.queryAllByText('Delete');
      expect(remainingDeleteButtons.length).toBe(initialCount - 1);
    });
  });

  describe('Create Thread Modal', () => {
    test('clicking New Thread opens create modal', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('New Thread'));
      expect(screen.getByText('Create New Thread')).toBeInTheDocument();
    });

    test('create modal has all form fields', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('New Thread'));
      expect(screen.getByText('Title *')).toBeInTheDocument();
      expect(screen.getByText('Content *')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Tags (comma separated)')).toBeInTheDocument();
    });

    test('cancel button closes create modal', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('New Thread'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      expect(screen.queryByText('Create New Thread')).not.toBeInTheDocument();
    });

    test('close button closes create modal', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('New Thread'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Create New Thread')).not.toBeInTheDocument();
    });

    test('submitting form creates a new thread', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('New Thread'));

      const titleInput = screen.getByPlaceholderText('Thread title...');
      fireEvent.change(titleInput, { target: { value: 'Brand new test thread' } });

      const contentTextarea = screen.getByPlaceholderText('What would you like to discuss?');
      fireEvent.change(contentTextarea, { target: { value: 'This is test content for the thread.' } });

      fireEvent.click(screen.getByText('Create Thread'));

      // Modal should close
      expect(screen.queryByText('Create New Thread')).not.toBeInTheDocument();
      // New thread should appear
      expect(screen.getByText('Brand new test thread')).toBeInTheDocument();
    });

    test('creating thread generates notification', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('New Thread'));

      const titleInput = screen.getByPlaceholderText('Thread title...');
      fireEvent.change(titleInput, { target: { value: 'Notification test thread' } });

      const contentTextarea = screen.getByPlaceholderText('What would you like to discuss?');
      fireEvent.change(contentTextarea, { target: { value: 'Test content here.' } });

      fireEvent.click(screen.getByText('Create Thread'));

      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText(/Notification test thread.*created/)).toBeInTheDocument();
    });
  });

  describe('User Profile Modal', () => {
    test('clicking member card opens profile modal', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      fireEvent.click(screen.getByText('Sam Chen'));
      expect(screen.getByText('User Profile')).toBeInTheDocument();
    });

    test('profile modal shows user info', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      fireEvent.click(screen.getByText('Sam Chen'));
      expect(screen.getByText('Lifelong learner, coffee addict')).toBeInTheDocument();
    });

    test('profile modal shows user stats', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      fireEvent.click(screen.getByText('Sam Chen'));
      expect(screen.getByText('Reputation')).toBeInTheDocument();
      expect(screen.getByText('Threads')).toBeInTheDocument();
      expect(screen.getByText('Posts')).toBeInTheDocument();
      expect(screen.getByText('Replies')).toBeInTheDocument();
    });

    test('profile modal shows member since date', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      fireEvent.click(screen.getByText('Sam Chen'));
      expect(screen.getByText(/Member since/)).toBeInTheDocument();
    });

    test('close button closes profile modal', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      fireEvent.click(screen.getByText('Sam Chen'));
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
    });

    test('clicking author name in thread detail opens profile', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      // Click the author name in the thread detail
      const authorNames = screen.getAllByText('Alex Rivera');
      fireEvent.click(authorNames[0]);
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Community founder & full-stack developer')).toBeInTheDocument();
    });
  });

  describe('Members View', () => {
    test('renders all member cards', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
      expect(screen.getByText('Sam Chen')).toBeInTheDocument();
      expect(screen.getByText('Maya Patel')).toBeInTheDocument();
      expect(screen.getByText('Chris Kim')).toBeInTheDocument();
    });

    test('shows member roles', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Moderator')).toBeInTheDocument();
    });

    test('shows member bios', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      expect(screen.getByText('Community founder & full-stack developer')).toBeInTheDocument();
      expect(screen.getByText('Tech enthusiast and open-source contributor')).toBeInTheDocument();
    });

    test('shows member reputation', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      const repLabels = screen.getAllByText(/rep/);
      expect(repLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics View', () => {
    test('shows stats cards', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Total Threads')).toBeInTheDocument();
      expect(screen.getByText('Total Posts')).toBeInTheDocument();
      expect(screen.getByText('Total Replies')).toBeInTheDocument();
      expect(screen.getByText('Members')).toBeInTheDocument();
    });

    test('shows correct thread count', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('6')).toBeInTheDocument(); // 6 threads
    });

    test('shows category breakdown', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
      expect(screen.getByText('General Discussion')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    test('shows popular tags section', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Popular Tags')).toBeInTheDocument();
    });

    test('clicking a tag in stats navigates to home with tag filter', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Statistics'));
      // Tags in stats view show count like "#react (1)"
      const reactTag = screen.getByText(/#react \(1\)/);
      fireEvent.click(reactTag);
      // Should navigate to home and show filter
      expect(screen.getByText(/Filtering by tag/)).toBeInTheDocument();
    });
  });

  describe('Trending View', () => {
    test('shows trending threads with ranking', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Trending'));
      expect(screen.getByText('Trending Threads')).toBeInTheDocument();
      // Should show numbered ranking
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('trending shows at most 5 threads', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Trending'));
      // There are 6 total threads but trending shows top 5
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Moderation', () => {
    test('pin button toggles thread pin state', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      // Thread t1 is pinned, so should show Unpin
      expect(screen.getByText('Unpin')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Unpin'));
      expect(screen.getByText('Pin')).toBeInTheDocument();
    });

    test('lock button toggles thread lock state', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      // Thread t1 is not locked
      expect(screen.getByText('Lock')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Lock'));
      expect(screen.getByText('Unlock')).toBeInTheDocument();
    });

    test('locked thread shows no-reply message', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      fireEvent.click(screen.getByText('Lock'));
      expect(screen.getByText(/This thread is locked/)).toBeInTheDocument();
    });

    test('delete thread requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      fireEvent.click(screen.getByText('Delete Thread'));
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming delete thread removes it', () => {
      window.confirm.mockReturnValue(true);
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      fireEvent.click(screen.getByText('Delete Thread'));
      // Should return to thread list
      expect(screen.queryByText('Welcome to the Community Forum!')).not.toBeInTheDocument();
    });

    test('moderation panel shows pinned threads', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByLabelText('Moderation panel'));
      expect(screen.getByText('Moderation Panel')).toBeInTheDocument();
      expect(screen.getByText(/Pinned Threads/)).toBeInTheDocument();
    });

    test('moderation panel shows locked threads section', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByLabelText('Moderation panel'));
      expect(screen.getByText(/Locked Threads/)).toBeInTheDocument();
    });

    test('moderation panel shows recent threads', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByLabelText('Moderation panel'));
      expect(screen.getByText('Recent Threads')).toBeInTheDocument();
    });

    test('moderation panel close button works', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByLabelText('Moderation panel'));
      expect(screen.getByText('Moderation Panel')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Moderation Panel')).not.toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    test('clicking bell icon shows notification panel', () => {
      render(<CommunityForum />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    test('clicking bell icon again hides notification panel', () => {
      render(<CommunityForum />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      fireEvent.click(bellButton);
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });

    test('mark all read button works', () => {
      render(<CommunityForum />);
      // Create a thread to generate notification
      fireEvent.click(screen.getByText('New Thread'));
      const titleInput = screen.getByPlaceholderText('Thread title...');
      fireEvent.change(titleInput, { target: { value: 'Test' } });
      const contentTextarea = screen.getByPlaceholderText('What would you like to discuss?');
      fireEvent.change(contentTextarea, { target: { value: 'Content' } });
      fireEvent.click(screen.getByText('Create Thread'));

      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      fireEvent.click(screen.getByText('Mark all read'));
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes create thread modal', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('New Thread'));
      expect(screen.getByText('Create New Thread')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Thread')).not.toBeInTheDocument();
    });

    test('Escape key closes user profile modal', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Members'));
      fireEvent.click(screen.getByText('Sam Chen'));
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
    });

    test('Escape key closes moderation panel', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByLabelText('Moderation panel'));
      expect(screen.getByText('Moderation Panel')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Moderation Panel')).not.toBeInTheDocument();
    });

    test('Escape key closes thread detail', () => {
      render(<CommunityForum />);
      fireEvent.click(screen.getByText('Welcome to the Community Forum!'));
      expect(screen.getByText('← Back to threads')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('← Back to threads')).not.toBeInTheDocument();
    });

    test('Escape key closes notification panel', () => {
      render(<CommunityForum />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('threads are saved to localStorage', () => {
      render(<CommunityForum />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('forumThreads', expect.any(String));
    });

    test('bookmarks are saved to localStorage', () => {
      render(<CommunityForum />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('forumBookmarks', expect.any(String));
    });

    test('saved threads are loaded from localStorage', () => {
      const savedThreads = JSON.stringify([
        {
          id: 'custom1',
          title: 'Custom saved thread',
          content: 'From localStorage',
          author: 'u1',
          category: 'general',
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
          isLocked: false,
          views: 0,
          posts: [],
        },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'forumThreads') return savedThreads;
        return null;
      });
      render(<CommunityForum />);
      expect(screen.getByText('Custom saved thread')).toBeInTheDocument();
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'forumView') return 'members';
        return null;
      });
      render(<CommunityForum />);
      expect(screen.getByText('Community Members')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'forumThreads') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<CommunityForum />)).not.toThrow();
    });
  });

  describe('Combined Filters', () => {
    test('search and category filter work together', () => {
      render(<CommunityForum />);
      const searchInput = screen.getByPlaceholderText('Search threads... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'React' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'tech' } });
      expect(screen.getByText('Best practices for React performance optimization')).toBeInTheDocument();
    });

    test('non-matching combined filters show no threads', () => {
      render(<CommunityForum />);
      const searchInput = screen.getByPlaceholderText('Search threads... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'React' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'gaming' } });
      expect(screen.queryByText('Best practices for React performance optimization')).not.toBeInTheDocument();
      expect(screen.getByText(/No threads found/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<CommunityForum />)).not.toThrow();
    });
  });
});
