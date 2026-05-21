import { describe, test, expect, beforeEach } from 'vitest';
// biome-ignore lint/correctness/noUndeclaredDependencies: eval test data — runs in vitest sandbox, not core package
import { render, screen, fireEvent, within } from '@testing-library/react-native';
import HomeScreen from '.screens/HomeScreen.jsx';

describe('Event Planner - Refactoring Preservation Tests', () => {
  beforeEach(() => {
    render(<HomeScreen />);
  });

  // ═══════════════════════════════════════════════════════════════
  // HEADER & NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  test('app header renders with branding', () => {
    expect(screen.getByTestId('app-header')).toBeTruthy();
    expect(screen.getByText('Evently')).toBeTruthy();
    expect(screen.getByText('Discover & plan events')).toBeTruthy();
  });

  test('notification button is present with unread badge', () => {
    expect(screen.getByTestId('notifications-btn')).toBeTruthy();
    const badge = screen.getByTestId('notification-badge');
    expect(badge).toBeTruthy();
    // 3 unread notifications in seed data (n1, n2, n5)
    expect(badge).toHaveTextContent('3');
  });

  test('profile button renders current user avatar', () => {
    expect(screen.getByTestId('profile-btn')).toBeTruthy();
    expect(screen.getByTestId('avatar-u1')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════

  test('search bar is present and functional', () => {
    expect(screen.getByTestId('search-bar')).toBeTruthy();
    const input = screen.getByTestId('search-input');
    expect(input).toBeTruthy();

    fireEvent.changeText(input, 'jazz');
    // Should show the Jazz event
    expect(screen.getByTestId('event-card-e1')).toBeTruthy();
    // Should filter out unrelated events
    expect(screen.queryByTestId('event-card-e5')).toBeNull();
  });

  test('search by location name works', () => {
    const input = screen.getByTestId('search-input');
    fireEvent.changeText(input, 'Blue Note');
    // Board Game Night is at The Blue Note Lounge
    expect(screen.getByTestId('event-card-e7')).toBeTruthy();
    // Other events should be filtered
    expect(screen.queryByTestId('event-card-e1')).toBeNull();
  });

  test('search by tag works', () => {
    const input = screen.getByTestId('search-input');
    fireEvent.changeText(input, 'hiking');
    expect(screen.getByTestId('event-card-e3')).toBeTruthy();
    expect(screen.queryByTestId('event-card-e6')).toBeNull();
  });

  test('clear search button appears and works', () => {
    const input = screen.getByTestId('search-input');
    fireEvent.changeText(input, 'jazz');
    const clearBtn = screen.getByTestId('clear-search');
    expect(clearBtn).toBeTruthy();
    fireEvent.press(clearBtn);
    // All events should be visible again
    expect(screen.getByTestId('event-card-e1')).toBeTruthy();
    expect(screen.getByTestId('event-card-e5')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY FILTER
  // ═══════════════════════════════════════════════════════════════

  test('category filter chips render all categories', () => {
    expect(screen.getByTestId('category-filter')).toBeTruthy();
    expect(screen.getByTestId('category-all')).toBeTruthy();
    expect(screen.getByTestId('category-music')).toBeTruthy();
    expect(screen.getByTestId('category-food')).toBeTruthy();
    expect(screen.getByTestId('category-outdoor')).toBeTruthy();
    expect(screen.getByTestId('category-art')).toBeTruthy();
    expect(screen.getByTestId('category-fitness')).toBeTruthy();
    expect(screen.getByTestId('category-tech')).toBeTruthy();
    expect(screen.getByTestId('category-social')).toBeTruthy();
    expect(screen.getByTestId('category-education')).toBeTruthy();
  });

  test('selecting a category filters events', () => {
    fireEvent.press(screen.getByTestId('category-music'));
    // Only music event should show
    expect(screen.getByTestId('event-card-e1')).toBeTruthy();
    expect(screen.queryByTestId('event-card-e2')).toBeNull();
    expect(screen.queryByTestId('event-card-e5')).toBeNull();
  });

  test('selecting All category shows all events', () => {
    fireEvent.press(screen.getByTestId('category-fitness'));
    expect(screen.queryByTestId('event-card-e1')).toBeNull();
    fireEvent.press(screen.getByTestId('category-all'));
    expect(screen.getByTestId('event-card-e1')).toBeTruthy();
    expect(screen.getByTestId('event-card-e5')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // VIEW MODE TOGGLE
  // ═══════════════════════════════════════════════════════════════

  test('view mode toggle renders list, calendar, and map options', () => {
    expect(screen.getByTestId('toolbar')).toBeTruthy();
    expect(screen.getByTestId('view-mode-list')).toBeTruthy();
    expect(screen.getByTestId('view-mode-calendar')).toBeTruthy();
    expect(screen.getByTestId('view-mode-map')).toBeTruthy();
  });

  test('switching to calendar view shows calendar', () => {
    fireEvent.press(screen.getByTestId('view-mode-calendar'));
    expect(screen.getByTestId('calendar-view')).toBeTruthy();
    expect(screen.getByTestId('calendar-month-label')).toBeTruthy();
  });

  test('switching to map view shows map', () => {
    fireEvent.press(screen.getByTestId('view-mode-map'));
    expect(screen.getByTestId('map-view')).toBeTruthy();
  });

  test('switching back to list view shows event cards', () => {
    fireEvent.press(screen.getByTestId('view-mode-calendar'));
    fireEvent.press(screen.getByTestId('view-mode-list'));
    expect(screen.getByTestId('event-list')).toBeTruthy();
    expect(screen.getByTestId('event-card-e1')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // FILTERS & SORTING
  // ═══════════════════════════════════════════════════════════════

  test('filter toggle shows/hides filter panel', () => {
    expect(screen.queryByTestId('filter-panel')).toBeNull();
    fireEvent.press(screen.getByTestId('toggle-filters'));
    expect(screen.getByTestId('filter-panel')).toBeTruthy();
    fireEvent.press(screen.getByTestId('toggle-filters'));
    expect(screen.queryByTestId('filter-panel')).toBeNull();
  });

  test('sort options are present in filter panel', () => {
    fireEvent.press(screen.getByTestId('toggle-filters'));
    expect(screen.getByTestId('sort-date')).toBeTruthy();
    expect(screen.getByTestId('sort-popularity')).toBeTruthy();
    expect(screen.getByTestId('sort-price')).toBeTruthy();
  });

  test('price filter options are present', () => {
    fireEvent.press(screen.getByTestId('toggle-filters'));
    expect(screen.getByTestId('price-filter-all')).toBeTruthy();
    expect(screen.getByTestId('price-filter-free')).toBeTruthy();
    expect(screen.getByTestId('price-filter-paid')).toBeTruthy();
  });

  test('free price filter shows only free events', () => {
    fireEvent.press(screen.getByTestId('toggle-filters'));
    fireEvent.press(screen.getByTestId('price-filter-free'));
    // e1 (Summer Jazz Night) is free
    expect(screen.getByTestId('event-card-e1')).toBeTruthy();
    // e2 (Farm-to-Table Dinner) is $85 — should be hidden
    expect(screen.queryByTestId('event-card-e2')).toBeNull();
    // e4 (Art Workshop) is $45 — should be hidden
    expect(screen.queryByTestId('event-card-e4')).toBeNull();
  });

  test('paid price filter shows only paid events', () => {
    fireEvent.press(screen.getByTestId('toggle-filters'));
    fireEvent.press(screen.getByTestId('price-filter-paid'));
    // e2 (Farm-to-Table $85) should show
    expect(screen.getByTestId('event-card-e2')).toBeTruthy();
    // e1 (Jazz Night free) should be hidden
    expect(screen.queryByTestId('event-card-e1')).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════════
  // MY EVENTS SUMMARY
  // ═══════════════════════════════════════════════════════════════

  test('my events summary shows correct counts', () => {
    expect(screen.getByTestId('my-events-summary')).toBeTruthy();
    const goingSection = screen.getByTestId('going-count');
    // u1 is RSVP'd to e1, e2, e3, e5, e6, e8, e10 = 7 events
    expect(within(goingSection).getByText('7')).toBeTruthy();
    const hostingSection = screen.getByTestId('hosting-count');
    // u1 hosts 0 events in seed data
    expect(within(hostingSection).getByText('0')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // EVENT CARDS
  // ═══════════════════════════════════════════════════════════════

  test('event cards render with titles', () => {
    expect(screen.getByText('Summer Jazz Night')).toBeTruthy();
    expect(screen.getByText('Farm-to-Table Dinner Experience')).toBeTruthy();
    expect(screen.getByText('Sunrise Hike at Twin Peaks')).toBeTruthy();
  });

  test('event cards show host information', () => {
    expect(screen.getByTestId('host-btn-e1')).toBeTruthy();
    // e1 host is Sam Chen (u2)
    const hostBtn = screen.getByTestId('host-btn-e1');
    expect(within(hostBtn).getByText('Sam Chen')).toBeTruthy();
  });

  test('event cards show RSVP counts', () => {
    // e1 has 5 RSVPs out of 200 capacity
    const card = screen.getByTestId('event-card-e1');
    expect(within(card).getByText(/5\/200/)).toBeTruthy();
  });

  test('RSVP button shows correct state for attending events', () => {
    // u1 is RSVP'd to e1
    const rsvpBtn = screen.getByTestId('rsvp-btn-e1');
    expect(rsvpBtn).toHaveTextContent('Going');
  });

  test('RSVP button shows correct state for non-attending events', () => {
    // u1 is NOT RSVP'd to e4
    const rsvpBtn = screen.getByTestId('rsvp-btn-e4');
    expect(rsvpBtn).toHaveTextContent('RSVP');
  });

  test('RSVP toggle works — cancel and re-join', () => {
    const rsvpBtn = screen.getByTestId('rsvp-btn-e1');
    expect(rsvpBtn).toHaveTextContent('Going');
    fireEvent.press(rsvpBtn);
    expect(rsvpBtn).toHaveTextContent('RSVP');
    fireEvent.press(rsvpBtn);
    expect(rsvpBtn).toHaveTextContent('Going');
  });

  test('RSVP to a new event works', () => {
    const rsvpBtn = screen.getByTestId('rsvp-btn-e4');
    expect(rsvpBtn).toHaveTextContent('RSVP');
    fireEvent.press(rsvpBtn);
    expect(rsvpBtn).toHaveTextContent('Going');
  });

  // ═══════════════════════════════════════════════════════════════
  // EVENT DETAIL MODAL
  // ═══════════════════════════════════════════════════════════════

  test('tapping event card opens detail modal', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    expect(screen.getByTestId('event-detail-modal')).toBeTruthy();
    expect(screen.getByTestId('event-detail-title')).toHaveTextContent('Summer Jazz Night');
  });

  test('event detail shows location and map', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    expect(screen.getByText('Sunset Park Amphitheater')).toBeTruthy();
    expect(screen.getByText(/123 Park Ave/)).toBeTruthy();
    expect(screen.getByTestId('event-location-map')).toBeTruthy();
  });

  test('event detail shows attendee list', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    const attendeeList = screen.getByTestId('attendee-list');
    expect(attendeeList).toBeTruthy();
    // u1, u3, u4, u6, u7 are RSVP'd
    expect(screen.getByTestId('attendee-u1')).toBeTruthy();
    expect(screen.getByTestId('attendee-u3')).toBeTruthy();
  });

  test('event detail shows waitlist when present', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    // e1 has u8 on waitlist
    expect(screen.getByTestId('waitlist-section')).toBeTruthy();
    expect(screen.getByTestId('waitlist-u8')).toBeTruthy();
  });

  test('event detail shows tags', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    expect(screen.getByTestId('event-tags')).toBeTruthy();
    expect(screen.getByText('#jazz')).toBeTruthy();
    expect(screen.getByText('#live music')).toBeTruthy();
  });

  test('event detail shows price info', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    expect(screen.getByText('Free')).toBeTruthy();
  });

  test('event detail RSVP button works', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    const detailRsvp = screen.getByTestId('detail-rsvp-btn-e1');
    expect(detailRsvp).toHaveTextContent('Cancel RSVP');
    fireEvent.press(detailRsvp);
    expect(detailRsvp).toHaveTextContent('RSVP Now');
  });

  test('close event detail modal works', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    expect(screen.getByTestId('event-detail-modal')).toBeTruthy();
    fireEvent.press(screen.getByTestId('close-event-detail'));
    expect(screen.queryByTestId('event-detail-modal')).toBeNull();
  });

  test('event detail shows host with profile link', () => {
    fireEvent.press(screen.getByTestId('event-card-e1'));
    expect(screen.getByTestId('detail-host-u2')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // CREATE EVENT MODAL
  // ═══════════════════════════════════════════════════════════════

  test('FAB opens create event modal', () => {
    fireEvent.press(screen.getByTestId('create-event-fab'));
    expect(screen.getByTestId('create-event-modal')).toBeTruthy();
  });

  test('create event form has all required fields', () => {
    fireEvent.press(screen.getByTestId('create-event-fab'));
    expect(screen.getByTestId('create-title-input')).toBeTruthy();
    expect(screen.getByTestId('create-description-input')).toBeTruthy();
    expect(screen.getByTestId('create-category-selector')).toBeTruthy();
    expect(screen.getByTestId('create-date-input')).toBeTruthy();
    expect(screen.getByTestId('create-start-time-input')).toBeTruthy();
    expect(screen.getByTestId('create-end-time-input')).toBeTruthy();
    expect(screen.getByTestId('create-location-selector')).toBeTruthy();
    expect(screen.getByTestId('create-capacity-input')).toBeTruthy();
    expect(screen.getByTestId('create-free-switch')).toBeTruthy();
    expect(screen.getByTestId('create-public-switch')).toBeTruthy();
  });

  test('creating a new event adds it to the list', () => {
    fireEvent.press(screen.getByTestId('create-event-fab'));

    fireEvent.changeText(screen.getByTestId('create-title-input'), 'My Test Event');
    fireEvent.changeText(screen.getByTestId('create-description-input'), 'A fun event');
    fireEvent.changeText(screen.getByTestId('create-date-input'), '2025-03-15');
    fireEvent.changeText(screen.getByTestId('create-start-time-input'), '10:00');

    fireEvent.press(screen.getByTestId('submit-create-event'));

    // Modal should close
    expect(screen.queryByTestId('create-event-modal')).toBeNull();
    // New event should appear in the list
    expect(screen.getByText('My Test Event')).toBeTruthy();
  });

  test('close create modal works', () => {
    fireEvent.press(screen.getByTestId('create-event-fab'));
    expect(screen.getByTestId('create-event-modal')).toBeTruthy();
    fireEvent.press(screen.getByTestId('close-create-modal'));
    expect(screen.queryByTestId('create-event-modal')).toBeNull();
  });

  test('category selector in create form works', () => {
    fireEvent.press(screen.getByTestId('create-event-fab'));
    expect(screen.getByTestId('create-cat-music')).toBeTruthy();
    expect(screen.getByTestId('create-cat-food')).toBeTruthy();
    expect(screen.getByTestId('create-cat-outdoor')).toBeTruthy();
    fireEvent.press(screen.getByTestId('create-cat-music'));
  });

  test('location selector in create form works', () => {
    fireEvent.press(screen.getByTestId('create-event-fab'));
    expect(screen.getByTestId('create-loc-loc1')).toBeTruthy();
    expect(screen.getByTestId('create-loc-loc2')).toBeTruthy();
    fireEvent.press(screen.getByTestId('create-loc-loc3'));
  });

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════

  test('notifications modal opens and shows notifications', () => {
    fireEvent.press(screen.getByTestId('notifications-btn'));
    expect(screen.getByTestId('notifications-modal')).toBeTruthy();
    expect(screen.getByTestId('notification-n1')).toBeTruthy();
    expect(screen.getByTestId('notification-n2')).toBeTruthy();
    expect(screen.getByText(/Morgan Lee RSVP/)).toBeTruthy();
  });

  test('mark all read button works', () => {
    fireEvent.press(screen.getByTestId('notifications-btn'));
    fireEvent.press(screen.getByTestId('mark-all-read'));
    fireEvent.press(screen.getByTestId('close-notifications'));
    // Badge should be gone since all are read
    expect(screen.queryByTestId('notification-badge')).toBeNull();
  });

  test('tapping a notification marks it as read', () => {
    fireEvent.press(screen.getByTestId('notifications-btn'));
    fireEvent.press(screen.getByTestId('notification-n1'));
    fireEvent.press(screen.getByTestId('close-notifications'));
    // Badge count should decrease: was 3, now 2
    const badge = screen.getByTestId('notification-badge');
    expect(badge).toHaveTextContent('2');
  });

  test('close notifications modal works', () => {
    fireEvent.press(screen.getByTestId('notifications-btn'));
    expect(screen.getByTestId('notifications-modal')).toBeTruthy();
    fireEvent.press(screen.getByTestId('close-notifications'));
    expect(screen.queryByTestId('notifications-modal')).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════════
  // USER PROFILE MODAL
  // ═══════════════════════════════════════════════════════════════

  test('tapping profile button opens current user profile', () => {
    fireEvent.press(screen.getByTestId('profile-btn'));
    expect(screen.getByTestId('profile-modal')).toBeTruthy();
    expect(screen.getByTestId('profile-u1')).toBeTruthy();
    expect(screen.getByText('Jordan Rivera')).toBeTruthy();
    expect(screen.getByText('Community organizer & food lover')).toBeTruthy();
  });

  test('profile shows hosted and attended stats', () => {
    fireEvent.press(screen.getByTestId('profile-btn'));
    expect(screen.getByText('12')).toBeTruthy(); // eventsHosted
    expect(screen.getByText('Hosted')).toBeTruthy();
    expect(screen.getByText('47')).toBeTruthy(); // eventsAttended
    expect(screen.getByText('Attended')).toBeTruthy();
  });

  test('tapping host on event card opens host profile', () => {
    fireEvent.press(screen.getByTestId('host-btn-e1'));
    expect(screen.getByTestId('profile-modal')).toBeTruthy();
    expect(screen.getByTestId('profile-u2')).toBeTruthy();
    expect(screen.getByText('Sam Chen')).toBeTruthy();
  });

  test('close profile modal works', () => {
    fireEvent.press(screen.getByTestId('profile-btn'));
    expect(screen.getByTestId('profile-modal')).toBeTruthy();
    fireEvent.press(screen.getByTestId('close-profile'));
    expect(screen.queryByTestId('profile-modal')).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════════
  // CALENDAR VIEW
  // ═══════════════════════════════════════════════════════════════

  test('calendar view shows month navigation', () => {
    fireEvent.press(screen.getByTestId('view-mode-calendar'));
    expect(screen.getByTestId('calendar-prev')).toBeTruthy();
    expect(screen.getByTestId('calendar-next')).toBeTruthy();
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('February 2025');
  });

  test('calendar navigation changes month', () => {
    fireEvent.press(screen.getByTestId('view-mode-calendar'));
    fireEvent.press(screen.getByTestId('calendar-next'));
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('March 2025');
    fireEvent.press(screen.getByTestId('calendar-prev'));
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('February 2025');
  });

  test('calendar shows event dots on days with events', () => {
    fireEvent.press(screen.getByTestId('view-mode-calendar'));
    // e3 is on Feb 8
    expect(screen.getByTestId('calendar-event-e3')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // MAP VIEW
  // ═══════════════════════════════════════════════════════════════

  test('map view groups events by location', () => {
    fireEvent.press(screen.getByTestId('view-mode-map'));
    expect(screen.getByTestId('map-view')).toBeTruthy();
    // e1 and e8 are at loc1 (Sunset Park Amphitheater)
    expect(screen.getByTestId('map-location-loc1')).toBeTruthy();
    expect(screen.getByTestId('map-event-e1')).toBeTruthy();
    expect(screen.getByTestId('map-event-e8')).toBeTruthy();
  });

  test('map view shows location names and addresses', () => {
    fireEvent.press(screen.getByTestId('view-mode-map'));
    expect(screen.getByText('Sunset Park Amphitheater')).toBeTruthy();
    expect(screen.getByText(/123 Park Ave/)).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════════════

  test('empty state shows when no events match filters', () => {
    const input = screen.getByTestId('search-input');
    fireEvent.changeText(input, 'xyznonexistentevent');
    expect(screen.getByTestId('empty-state')).toBeTruthy();
    expect(screen.getByText('No events found')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════

  test('footer is preserved', () => {
    expect(screen.getByTestId('footer')).toBeTruthy();
    expect(screen.getByText(/2025 Evently. All rights reserved./)).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════════
  // CROSS-FEATURE INTERACTIONS
  // ═══════════════════════════════════════════════════════════════

  test('category filter combined with search works', () => {
    fireEvent.press(screen.getByTestId('category-fitness'));
    const input = screen.getByTestId('search-input');
    fireEvent.changeText(input, 'yoga');
    // e9 is fitness + has yoga tag
    expect(screen.getByTestId('event-card-e9')).toBeTruthy();
    // e5 is fitness but not yoga
    expect(screen.queryByTestId('event-card-e5')).toBeNull();
  });

  test('RSVP updates my events count', () => {
    const goingSection = screen.getByTestId('going-count');
    expect(within(goingSection).getByText('7')).toBeTruthy();

    // RSVP to e4 (currently not attending)
    fireEvent.press(screen.getByTestId('rsvp-btn-e4'));

    expect(within(goingSection).getByText('8')).toBeTruthy();
  });

  test('creating event and then finding it via search', () => {
    fireEvent.press(screen.getByTestId('create-event-fab'));
    fireEvent.changeText(screen.getByTestId('create-title-input'), 'Underwater Basket Weaving');
    fireEvent.changeText(screen.getByTestId('create-date-input'), '2025-04-01');
    fireEvent.changeText(screen.getByTestId('create-start-time-input'), '14:00');
    fireEvent.press(screen.getByTestId('submit-create-event'));

    const input = screen.getByTestId('search-input');
    fireEvent.changeText(input, 'Underwater');
    expect(screen.getByText('Underwater Basket Weaving')).toBeTruthy();
  });
});
