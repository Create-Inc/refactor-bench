import { describe, test, expect, beforeEach, vi } from 'vitest';
// biome-ignore lint/correctness/noUndeclaredDependencies: eval test data — runs in vitest sandbox, not core package
import { render, screen, fireEvent } from '@testing-library/react';
import HomeScreen from './src/screens/HomeScreen.jsx';

// Mock Alert
const alertSpy = vi.fn();
vi.stubGlobal('Alert', { alert: alertSpy });

describe('SocialHub HomeScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial Rendering ───────────────────────────────────────────────────

  describe('Initial Rendering', () => {
    test('renders the home screen container', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('home-screen')).toBeInTheDocument();
    });

    test('renders the app title SocialHub', () => {
      render(<HomeScreen />);
      expect(screen.getByText('SocialHub')).toBeInTheDocument();
    });

    test('renders the hamburger menu button', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('menu-btn')).toBeInTheDocument();
    });

    test('renders the theme toggle in header', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('header-theme-toggle')).toBeInTheDocument();
    });

    test('renders bottom tab bar with all tabs', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('tab-feed')).toBeInTheDocument();
      expect(screen.getByTestId('tab-search')).toBeInTheDocument();
      expect(screen.getByTestId('tab-create')).toBeInTheDocument();
      expect(screen.getByTestId('tab-notifications')).toBeInTheDocument();
      expect(screen.getByTestId('tab-messages')).toBeInTheDocument();
      expect(screen.getByTestId('tab-profile')).toBeInTheDocument();
    });

    test('renders tab labels for all tabs', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Discover')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  // ── Feed Tab ──────────────────────────────────────────────────────────────

  describe('Feed Tab', () => {
    test('renders feed filter tabs (All, Following, Trending)', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('feed-filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('feed-filter-following')).toBeInTheDocument();
      expect(screen.getByTestId('feed-filter-trending')).toBeInTheDocument();
    });

    test('renders posts in the feed', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
      expect(screen.getByTestId('post-p2')).toBeInTheDocument();
      expect(screen.getByTestId('post-p3')).toBeInTheDocument();
    });

    test('renders post content text', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/Just finished designing the new dashboard/)).toBeInTheDocument();
      expect(screen.getByText(/TypeScript is Essential/)).toBeInTheDocument();
    });

    test('renders post author names', () => {
      render(<HomeScreen />);
      expect(screen.getAllByText('Sarah Mitchell').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Mike Chen').length).toBeGreaterThan(0);
    });

    test('renders post engagement stats (likes, comments, shares)', () => {
      render(<HomeScreen />);
      expect(screen.getByText('42 likes')).toBeInTheDocument();
      expect(screen.getByText('8 comments')).toBeInTheDocument();
      expect(screen.getByText('3 shares')).toBeInTheDocument();
    });

    test('renders like, comment, share, and bookmark buttons for each post', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('like-btn-p1')).toBeInTheDocument();
      expect(screen.getByTestId('comment-btn-p1')).toBeInTheDocument();
      expect(screen.getByTestId('share-btn-p1')).toBeInTheDocument();
      expect(screen.getByTestId('bookmark-btn-p1')).toBeInTheDocument();
    });

    test('clicking Following filter shows only posts from followed users', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('feed-filter-following'));
      // u2, u3, u5 are followed. Posts from u4, u6, u7, u8 should not appear.
      expect(screen.getByTestId('post-p1')).toBeInTheDocument(); // u2
      expect(screen.getByTestId('post-p2')).toBeInTheDocument(); // u3
      expect(screen.getByTestId('post-p3')).toBeInTheDocument(); // u5
      expect(screen.queryByTestId('post-p4')).not.toBeInTheDocument(); // u4 not followed
    });

    test('clicking Trending filter shows posts sorted by engagement', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('feed-filter-trending'));
      // Posts should still render (just reordered)
      expect(screen.getByTestId('post-p7')).toBeInTheDocument(); // highest engagement (312+33)
    });
  });

  // ── Stories ───────────────────────────────────────────────────────────────

  describe('Stories', () => {
    test('renders story items', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('story-s1')).toBeInTheDocument();
      expect(screen.getByTestId('story-s2')).toBeInTheDocument();
      expect(screen.getByTestId('story-s3')).toBeInTheDocument();
    });

    test('clicking a story opens the story viewer', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('story-s2'));
      expect(screen.getByTestId('story-viewer')).toBeInTheDocument();
    });

    test('story viewer shows user name', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('story-s2'));
      expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
    });

    test('closing story viewer removes it', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('story-s2'));
      expect(screen.getByTestId('story-viewer')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('close-story'));
      expect(screen.queryByTestId('story-viewer')).not.toBeInTheDocument();
    });
  });

  // ── Like / Bookmark / Share ───────────────────────────────────────────────

  describe('Post Interactions', () => {
    test('clicking like button toggles like state', () => {
      render(<HomeScreen />);
      const likeBtn = screen.getByTestId('like-btn-p1');
      // Initially not liked — shows 🤍
      expect(likeBtn.textContent).toContain('🤍');
      fireEvent.click(likeBtn);
      // Now liked — shows ❤️
      expect(likeBtn.textContent).toContain('❤️');
    });

    test('liking a post increments the like count', () => {
      render(<HomeScreen />);
      expect(screen.getByText('42 likes')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('like-btn-p1'));
      expect(screen.getByText('43 likes')).toBeInTheDocument();
    });

    test('double-tapping like toggles it off and decrements count', () => {
      render(<HomeScreen />);
      const likeBtn = screen.getByTestId('like-btn-p1');
      fireEvent.click(likeBtn);
      expect(screen.getByText('43 likes')).toBeInTheDocument();
      fireEvent.click(likeBtn);
      expect(screen.getByText('42 likes')).toBeInTheDocument();
    });

    test('clicking bookmark toggles bookmark state', () => {
      render(<HomeScreen />);
      const bookmarkBtn = screen.getByTestId('bookmark-btn-p1');
      expect(bookmarkBtn.textContent).toContain('🏷️');
      fireEvent.click(bookmarkBtn);
      expect(bookmarkBtn.textContent).toContain('🔖');
    });

    test('clicking share increments share count', () => {
      render(<HomeScreen />);
      expect(screen.getByText('3 shares')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('share-btn-p1'));
      expect(screen.getByText('4 shares')).toBeInTheDocument();
    });
  });

  // ── Comments ──────────────────────────────────────────────────────────────

  describe('Comments', () => {
    test('clicking comment button expands comment section', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.getByTestId('comments-p1')).toBeInTheDocument();
    });

    test('expanded comments show existing comments', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.getByText('This looks incredible! Love the color palette.')).toBeInTheDocument();
      expect(screen.getByText('The chart animations are so smooth!')).toBeInTheDocument();
    });

    test('comment input is present when comments are expanded', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.getByTestId('comment-input-p1')).toBeInTheDocument();
    });

    test('user can type and submit a new comment', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      const input = screen.getByTestId('comment-input-p1');
      fireEvent.change(input, { target: { value: 'Great work!' } });
      fireEvent.click(screen.getByTestId('send-comment-p1'));
      expect(screen.getByText('Great work!')).toBeInTheDocument();
    });

    test('adding a comment increments comment count', () => {
      render(<HomeScreen />);
      expect(screen.getByText('8 comments')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      const input = screen.getByTestId('comment-input-p1');
      fireEvent.change(input, { target: { value: 'Nice!' } });
      fireEvent.click(screen.getByTestId('send-comment-p1'));
      expect(screen.getByText('9 comments')).toBeInTheDocument();
    });

    test('toggling comments again collapses the section', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.getByTestId('comments-p1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('comment-btn-p1'));
      expect(screen.queryByTestId('comments-p1')).not.toBeInTheDocument();
    });

    test('own comments show delete button', () => {
      render(<HomeScreen />);
      // Post p2 has a comment from u1 (current user)
      fireEvent.click(screen.getByTestId('comment-btn-p2'));
      expect(screen.getByTestId('delete-comment-c3')).toBeInTheDocument();
    });
  });

  // ── Tab Navigation ────────────────────────────────────────────────────────

  describe('Tab Navigation', () => {
    test('clicking Discover tab shows search view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    test('clicking Alerts tab shows notifications', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-notifications'));
      expect(screen.getByTestId('notif-filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('notif-filter-unread')).toBeInTheDocument();
    });

    test('clicking Messages tab shows conversations list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      expect(screen.getByTestId('message-search-input')).toBeInTheDocument();
      expect(screen.getByTestId('conv-conv1')).toBeInTheDocument();
    });

    test('clicking Profile tab shows user profile', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      expect(screen.getByText('@alex_johnson')).toBeInTheDocument();
      expect(screen.getByText('Product designer & photographer')).toBeInTheDocument();
    });

    test('clicking Create tab opens create post modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      expect(screen.getByTestId('create-post-modal')).toBeInTheDocument();
    });
  });

  // ── Search / Discover ─────────────────────────────────────────────────────

  describe('Search & Discover', () => {
    test('renders trending tags when search is empty', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      expect(screen.getByText('Trending')).toBeInTheDocument();
      expect(screen.getByTestId('trending-#reactnative')).toBeInTheDocument();
      expect(screen.getByTestId('trending-#design')).toBeInTheDocument();
    });

    test('renders discover categories when search is empty', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      expect(screen.getByText('Discover')).toBeInTheDocument();
      expect(screen.getByTestId('category-cat1')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Art & Design')).toBeInTheDocument();
    });

    test('searching for a user shows matching results', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'sarah' } });
      expect(screen.getByTestId('search-user-u2')).toBeInTheDocument();
    });

    test('searching for a tag shows matching results', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: '#design' } });
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    test('searching for post content shows matching posts', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'TypeScript' } });
      expect(screen.getByText('Posts')).toBeInTheDocument();
    });

    test('clear search button resets the query', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(screen.getByTestId('clear-search'));
      // Should be back to discover view
      expect(screen.getByText('Trending')).toBeInTheDocument();
    });

    test('search filter chips filter result types', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'sarah' } });
      // Switch to people only
      fireEvent.click(screen.getByTestId('search-filter-people'));
      expect(screen.getByTestId('search-user-u2')).toBeInTheDocument();
    });

    test('no results state is shown for unmatched query', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'zzzznonexistent' } });
      expect(screen.getByTestId('no-search-results')).toBeInTheDocument();
    });

    test('selecting a category highlights it', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      fireEvent.click(screen.getByTestId('category-cat1'));
      // Click again to deselect
      fireEvent.click(screen.getByTestId('category-cat1'));
      // Category should still be present
      expect(screen.getByTestId('category-cat1')).toBeInTheDocument();
    });
  });

  // ── Notifications ─────────────────────────────────────────────────────────

  describe('Notifications', () => {
    test('renders notifications list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-notifications'));
      expect(screen.getByTestId('notif-n1')).toBeInTheDocument();
      expect(screen.getByTestId('notif-n2')).toBeInTheDocument();
      expect(screen.getByTestId('notif-n3')).toBeInTheDocument();
    });

    test('renders notification text for like notification', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-notifications'));
      expect(screen.getByText(/liked your post/)).toBeInTheDocument();
    });

    test('renders notification text for follow notification', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-notifications'));
      expect(screen.getByText(/started following you/)).toBeInTheDocument();
    });

    test('renders notification text for comment notification', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-notifications'));
      expect(screen.getByText(/commented/)).toBeInTheDocument();
    });

    test('filtering by unread shows only unread notifications', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-notifications'));
      fireEvent.click(screen.getByTestId('notif-filter-unread'));
      // n1, n2, n3 are unread; n4-n7 are read
      expect(screen.getByTestId('notif-n1')).toBeInTheDocument();
      expect(screen.getByTestId('notif-n2')).toBeInTheDocument();
      expect(screen.getByTestId('notif-n3')).toBeInTheDocument();
      expect(screen.queryByTestId('notif-n4')).not.toBeInTheDocument();
    });

    test('mark all read button marks all notifications as read', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-notifications'));
      fireEvent.click(screen.getByTestId('mark-all-read'));
      // Switch to unread filter — should be empty
      fireEvent.click(screen.getByTestId('notif-filter-unread'));
      expect(screen.getByTestId('empty-notifications')).toBeInTheDocument();
    });

    test('delete notification removes it from the list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-notifications'));
      fireEvent.click(screen.getByTestId('delete-notif-n1'));
      expect(screen.queryByTestId('notif-n1')).not.toBeInTheDocument();
    });
  });

  // ── Messages ──────────────────────────────────────────────────────────────

  describe('Messages', () => {
    test('renders conversations list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      expect(screen.getByTestId('conv-conv1')).toBeInTheDocument();
      expect(screen.getByTestId('conv-conv2')).toBeInTheDocument();
    });

    test('conversation shows last message preview', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      expect(screen.getByText('Can you review my design?')).toBeInTheDocument();
    });

    test('conversation shows unread badge when has unread messages', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      // conv1 has 2 unread, conv5 has 3 unread
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('clicking a conversation opens the conversation view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      fireEvent.click(screen.getByTestId('conv-conv1'));
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
      expect(screen.getByTestId('back-to-messages')).toBeInTheDocument();
    });

    test('conversation view shows user info', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      fireEvent.click(screen.getByTestId('conv-conv1'));
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    test('typing and sending a message updates the conversation', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      fireEvent.click(screen.getByTestId('conv-conv1'));
      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello there!' } });
      fireEvent.click(screen.getByTestId('send-message'));
      // After sending, message input should be cleared
      expect(input.value || input.textContent || '').toBe('');
    });

    test('back button returns to conversations list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      fireEvent.click(screen.getByTestId('conv-conv1'));
      fireEvent.click(screen.getByTestId('back-to-messages'));
      // Should be back to conversations list
      expect(screen.getByTestId('conv-conv1')).toBeInTheDocument();
      expect(screen.getByTestId('message-search-input')).toBeInTheDocument();
    });

    test('searching messages filters conversations', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      const input = screen.getByTestId('message-search-input');
      fireEvent.change(input, { target: { value: 'design' } });
      expect(screen.getByTestId('conv-conv1')).toBeInTheDocument();
      expect(screen.queryByTestId('conv-conv3')).not.toBeInTheDocument();
    });

    test('empty messages state shows when no conversations match search', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      const input = screen.getByTestId('message-search-input');
      fireEvent.change(input, { target: { value: 'zzzznonexistent' } });
      expect(screen.getByTestId('empty-messages')).toBeInTheDocument();
    });
  });

  // ── Profile ───────────────────────────────────────────────────────────────

  describe('Profile', () => {
    test('renders own profile with display name and username', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
      expect(screen.getByText('@alex_johnson')).toBeInTheDocument();
    });

    test('renders profile bio', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      expect(screen.getByText('Product designer & photographer')).toBeInTheDocument();
    });

    test('renders profile stats (posts, followers, following)', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      expect(screen.getByText('89')).toBeInTheDocument(); // posts count
      expect(screen.getByText('Posts')).toBeInTheDocument();
      expect(screen.getByText('Followers')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    test('renders Edit Profile button on own profile', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      expect(screen.getByTestId('edit-profile-btn')).toBeInTheDocument();
    });

    test('profile tabs switch between posts, bookmarks, and likes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      expect(screen.getByTestId('profile-tab-posts')).toBeInTheDocument();
      expect(screen.getByTestId('profile-tab-bookmarks')).toBeInTheDocument();
      expect(screen.getByTestId('profile-tab-likes')).toBeInTheDocument();
    });

    test('bookmarks tab shows bookmarked posts', () => {
      render(<HomeScreen />);
      // Bookmark a post first
      fireEvent.click(screen.getByTestId('bookmark-btn-p1'));
      // Navigate to profile
      fireEvent.click(screen.getByTestId('tab-profile'));
      fireEvent.click(screen.getByTestId('profile-tab-bookmarks'));
      expect(screen.getByTestId('post-p1')).toBeInTheDocument();
    });

    test('likes tab shows liked posts', () => {
      render(<HomeScreen />);
      // Like a post first
      fireEvent.click(screen.getByTestId('like-btn-p2'));
      // Navigate to profile
      fireEvent.click(screen.getByTestId('tab-profile'));
      fireEvent.click(screen.getByTestId('profile-tab-likes'));
      expect(screen.getByTestId('post-p2')).toBeInTheDocument();
    });

    test('empty bookmarks shows empty state', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      fireEvent.click(screen.getByTestId('profile-tab-bookmarks'));
      expect(screen.getByTestId('empty-profile-posts')).toBeInTheDocument();
      expect(screen.getByText('No bookmarked posts yet')).toBeInTheDocument();
    });

    test('clicking on another user post author navigates to their profile', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('post-author-p1'));
      // Should show Sarah Mitchell's profile (u2)
      expect(screen.getByTestId('follow-profile-btn')).toBeInTheDocument();
      expect(screen.getByTestId('profile-back')).toBeInTheDocument();
    });

    test('other user profile shows follow/unfollow button', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('post-author-p1'));
      // u2 is already followed
      expect(screen.getByTestId('follow-profile-btn')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    test('toggling follow on another user profile works', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('post-author-p1'));
      const followBtn = screen.getByTestId('follow-profile-btn');
      fireEvent.click(followBtn);
      expect(screen.getByText('Follow')).toBeInTheDocument();
      fireEvent.click(followBtn);
      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    test('profile back button returns to feed', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('post-author-p1'));
      fireEvent.click(screen.getByTestId('profile-back'));
      // Should return to feed
      expect(screen.getByTestId('feed-filter-all')).toBeInTheDocument();
    });
  });

  // ── Create Post ───────────────────────────────────────────────────────────

  describe('Create Post', () => {
    test('create post modal opens when Create tab is tapped', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      expect(screen.getByTestId('create-post-modal')).toBeInTheDocument();
      expect(screen.getByText('New Post')).toBeInTheDocument();
    });

    test('create post modal has text input', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      expect(screen.getByTestId('new-post-input')).toBeInTheDocument();
    });

    test('emoji picker allows selecting a post icon', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      fireEvent.click(screen.getByTestId('emoji-📸'));
      // The emoji should now be selected (we just verify no crash)
      expect(screen.getByTestId('emoji-📸')).toBeInTheDocument();
    });

    test('shows character count', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      expect(screen.getByText('0/500')).toBeInTheDocument();
    });

    test('typing in post input updates character count', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      const input = screen.getByTestId('new-post-input');
      fireEvent.change(input, { target: { value: 'Hello world' } });
      expect(screen.getByText('11/500')).toBeInTheDocument();
    });

    test('submitting a post adds it to the feed', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      const input = screen.getByTestId('new-post-input');
      fireEvent.change(input, { target: { value: 'My new post! #testing' } });
      fireEvent.click(screen.getByTestId('submit-post'));
      // Modal should close and post should appear in feed
      expect(screen.queryByTestId('create-post-modal')).not.toBeInTheDocument();
      expect(screen.getByText(/My new post! #testing/)).toBeInTheDocument();
    });

    test('new post extracts hashtags', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      const input = screen.getByTestId('new-post-input');
      fireEvent.change(input, { target: { value: 'Check this out! #react #mobile' } });
      fireEvent.click(screen.getByTestId('submit-post'));
      // Tags should be rendered
      expect(screen.getByText('#react')).toBeInTheDocument();
      expect(screen.getByText('#mobile')).toBeInTheDocument();
    });

    test('cancel button closes create post modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      fireEvent.click(screen.getByTestId('close-create-post'));
      expect(screen.queryByTestId('create-post-modal')).not.toBeInTheDocument();
    });

    test('empty post cannot be submitted', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-create'));
      fireEvent.click(screen.getByTestId('submit-post'));
      // Modal should remain open
      expect(screen.getByTestId('create-post-modal')).toBeInTheDocument();
    });
  });

  // ── Dark Mode ─────────────────────────────────────────────────────────────

  describe('Dark Mode', () => {
    test('clicking header theme toggle changes the theme', () => {
      render(<HomeScreen />);
      const toggle = screen.getByTestId('header-theme-toggle');
      // Initially light mode (shows 🌙)
      expect(toggle.textContent).toContain('🌙');
      fireEvent.click(toggle);
      // Now dark mode (shows ☀️)
      expect(toggle.textContent).toContain('☀️');
    });

    test('toggling dark mode twice returns to light', () => {
      render(<HomeScreen />);
      const toggle = screen.getByTestId('header-theme-toggle');
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(toggle.textContent).toContain('🌙');
    });
  });

  // ── Side Menu ─────────────────────────────────────────────────────────────

  describe('Side Menu', () => {
    test('clicking menu button opens side menu', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      expect(screen.getByTestId('side-menu')).toBeInTheDocument();
    });

    test('side menu shows current user info', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
      expect(screen.getByText('@alex_johnson')).toBeInTheDocument();
    });

    test('side menu has profile, bookmarks, and settings links', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      expect(screen.getByTestId('menu-profile')).toBeInTheDocument();
      expect(screen.getByTestId('menu-bookmarks')).toBeInTheDocument();
      expect(screen.getByTestId('menu-settings')).toBeInTheDocument();
    });

    test('clicking overlay closes side menu', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      expect(screen.getByTestId('side-menu')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('side-menu-overlay'));
      expect(screen.queryByTestId('side-menu')).not.toBeInTheDocument();
    });

    test('clicking Settings in side menu navigates to settings', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      fireEvent.click(screen.getByTestId('menu-settings'));
      expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
    });
  });

  // ── Settings ──────────────────────────────────────────────────────────────

  describe('Settings', () => {
    test('renders settings sections', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      fireEvent.click(screen.getByTestId('menu-settings'));
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    test('dark mode toggle works in settings', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      fireEvent.click(screen.getByTestId('menu-settings'));
      fireEvent.click(screen.getByTestId('dark-mode-toggle'));
      // Header theme toggle should now show sun emoji (dark mode on)
      const headerToggle = screen.getByTestId('header-theme-toggle');
      expect(headerToggle.textContent).toContain('☀️');
    });

    test('private account toggle works', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      fireEvent.click(screen.getByTestId('menu-settings'));
      expect(screen.getByTestId('private-toggle')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('private-toggle'));
      // Toggle should exist and be clickable (no crash)
      expect(screen.getByTestId('private-toggle')).toBeInTheDocument();
    });

    test('notifications toggle works', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      fireEvent.click(screen.getByTestId('menu-settings'));
      expect(screen.getByTestId('notifications-toggle')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('notifications-toggle'));
      expect(screen.getByTestId('notifications-toggle')).toBeInTheDocument();
    });

    test('logout button is present', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('menu-btn'));
      fireEvent.click(screen.getByTestId('menu-settings'));
      expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
  });

  // ── Cross-feature Interactions ────────────────────────────────────────────

  describe('Cross-feature Interactions', () => {
    test('clicking a tag in a post navigates to search with that tag', () => {
      render(<HomeScreen />);
      // Click a tag on post p1
      fireEvent.click(screen.getByText('#design'));
      // Should be on search tab with the tag as query
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    test('follow button appears in search results for non-followed users', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'emma' } });
      // Emma (u4) is not followed
      expect(screen.getByTestId('follow-btn-u4')).toBeInTheDocument();
    });

    test('toggling follow in search results updates following state', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-search'));
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'emma' } });
      fireEvent.click(screen.getByTestId('follow-btn-u4'));
      // Now following — should show "Following"
      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    test('unread notification badge shows count on tab bar', () => {
      render(<HomeScreen />);
      // There are 3 unread notifications
      const alertsTab = screen.getByTestId('tab-notifications');
      expect(alertsTab.textContent).toMatch(/3/);
    });

    test('unread message badge shows count on tab bar', () => {
      render(<HomeScreen />);
      // Total unread across conversations: 2+0+1+0+3 = 6
      const messagesTab = screen.getByTestId('tab-messages');
      expect(messagesTab.textContent).toMatch(/6/);
    });

    test('opening a conversation clears its unread count', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-messages'));
      fireEvent.click(screen.getByTestId('conv-conv1'));
      fireEvent.click(screen.getByTestId('back-to-messages'));
      // conv1 should no longer show unread badge (was 2)
      const conv1 = screen.getByTestId('conv-conv1');
      expect(conv1.textContent).not.toMatch(/\b2\b/);
    });

    test('Edit Profile button navigates to settings', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      fireEvent.click(screen.getByTestId('edit-profile-btn'));
      expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });
  });
});
