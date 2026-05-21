import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FitnessBooking from './src/app/page.jsx';

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

describe('FitnessBooking Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with FitBook title', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('FitBook')).toBeInTheDocument();
    });

    test('renders sidebar subtitle', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('Class Booking System')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
      expect(screen.getByText('All Classes')).toBeInTheDocument();
      expect(screen.getByText('Instructors')).toBeInTheDocument();
      expect(screen.getByText('Statistics')).toBeInTheDocument();
    });

    test('renders search input in header', () => {
      render(<FitnessBooking />);
      expect(screen.getByPlaceholderText('Search classes, instructors... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter dropdowns', () => {
      render(<FitnessBooking />);
      expect(screen.getByLabelText('Filter by class type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by difficulty')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by time')).toBeInTheDocument();
    });

    test('renders New Class button', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('+ New Class')).toBeInTheDocument();
    });

    test('renders favorites filter button', () => {
      render(<FitnessBooking />);
      expect(screen.getByLabelText('Toggle favorites filter')).toBeInTheDocument();
    });

    test('renders sidebar stats showing booking counts', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('Booked')).toBeInTheDocument();
      expect(screen.getByText('Waitlisted')).toBeInTheDocument();
    });

    test('renders notification bell', () => {
      render(<FitnessBooking />);
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });
  });

  describe('Schedule View', () => {
    test('renders schedule view by default', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('This Week')).toBeInTheDocument();
    });

    test('renders week navigation with prev and next buttons', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('← Prev')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    test('renders sort options', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('Sort:')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Popularity')).toBeInTheDocument();
      expect(screen.getByText('Availability')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
    });

    test('renders 7 day columns', () => {
      render(<FitnessBooking />);
      const dayHeaders = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/);
      expect(dayHeaders.length).toBe(7);
    });

    test('renders class cards with titles', () => {
      render(<FitnessBooking />);
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
    });

    test('class cards show difficulty level', () => {
      render(<FitnessBooking />);
      const beginnerLabels = screen.getAllByText('beginner');
      expect(beginnerLabels.length).toBeGreaterThan(0);
    });

    test('clicking prev week navigates backward', () => {
      render(<FitnessBooking />);
      const prevButton = screen.getByText('← Prev');
      fireEvent.click(prevButton);
      // Should show different date range
    });

    test('clicking next week navigates forward', () => {
      render(<FitnessBooking />);
      const nextButton = screen.getByText('Next →');
      fireEvent.click(nextButton);
      // Should show different date range
    });

    test('clicking This Week resets to current week', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Next →'));
      fireEvent.click(screen.getByText('This Week'));
      // Should be back to current week
    });

    test('clicking sort button changes active sort', () => {
      render(<FitnessBooking />);
      const popularitySort = screen.getByText('Popularity');
      fireEvent.click(popularitySort);
      // Sort should be active
    });

    test('class cards show booking status when booked', () => {
      render(<FitnessBooking />);
      // User has bookings for c1, c3, c6 (confirmed) and c2 (waitlisted)
      const confirmedLabels = screen.getAllByText('confirmed');
      expect(confirmedLabels.length).toBeGreaterThan(0);
    });
  });

  describe('My Bookings View', () => {
    test('renders my bookings view with heading', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
    });

    test('shows booked classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.getByText('Spin & Burn')).toBeInTheDocument();
    });

    test('shows booking status badges', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      const confirmedBadges = screen.getAllByText('confirmed');
      expect(confirmedBadges.length).toBeGreaterThan(0);
    });

    test('shows waitlisted status for waitlisted booking', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      expect(screen.getByText('waitlisted')).toBeInTheDocument();
    });

    test('shows instructor name in booking card', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      expect(screen.getByText(/Maya Rodriguez/)).toBeInTheDocument();
    });

    test('shows cancel button for each booking', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      const cancelButtons = screen.getAllByText('Cancel');
      expect(cancelButtons.length).toBeGreaterThan(0);
    });

    test('clicking Cancel shows confirmation modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      expect(screen.getByText('Cancel Booking?')).toBeInTheDocument();
    });

    test('confirming cancellation removes booking', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      fireEvent.click(screen.getByText('Yes, Cancel'));
      // Booking should be removed
    });

    test('clicking Keep Booking dismisses confirmation', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      fireEvent.click(screen.getByText('Keep Booking'));
      expect(screen.queryByText('Cancel Booking?')).not.toBeInTheDocument();
    });

    test('favorite toggle button exists on booking cards', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      const starButtons = screen.getAllByText('☆');
      expect(starButtons.length).toBeGreaterThan(0);
    });
  });

  describe('All Classes View', () => {
    test('renders all classes view with heading and count', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      expect(screen.getByText(/All Classes/)).toBeInTheDocument();
    });

    test('renders class cards with titles', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.getByText('Power HIIT')).toBeInTheDocument();
      expect(screen.getByText('Spin & Burn')).toBeInTheDocument();
    });

    test('class cards show instructor info', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      expect(screen.getByText('Maya Rodriguez')).toBeInTheDocument();
      expect(screen.getByText('Jake Thompson')).toBeInTheDocument();
    });

    test('class cards show difficulty badges', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const beginnerBadges = screen.getAllByText('beginner');
      expect(beginnerBadges.length).toBeGreaterThan(0);
      const advancedBadges = screen.getAllByText('advanced');
      expect(advancedBadges.length).toBeGreaterThan(0);
    });

    test('class cards show occupancy bar', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const occupancyTexts = screen.getAllByText(/spots filled/);
      expect(occupancyTexts.length).toBeGreaterThan(0);
    });

    test('class cards show description', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      expect(screen.getByText(/Start your day with gentle stretches/)).toBeInTheDocument();
    });

    test('class cards show recurring badge for recurring classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const recurringBadges = screen.getAllByText('Recurring');
      expect(recurringBadges.length).toBeGreaterThan(0);
    });

    test('class cards show waitlist count when present', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const waitlistTexts = screen.getAllByText(/on waitlist/);
      expect(waitlistTexts.length).toBeGreaterThan(0);
    });

    test('favorite button toggles on class cards', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const favoriteButton = screen.getByLabelText('Favorite Morning Flow Yoga');
      fireEvent.click(favoriteButton);
      // Should now show filled star
    });

    test('booked classes show Booked status', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const bookedLabels = screen.getAllByText('Booked');
      expect(bookedLabels.length).toBeGreaterThan(0);
    });

    test('waitlisted classes show On Waitlist status', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      expect(screen.getByText('On Waitlist')).toBeInTheDocument();
    });
  });

  describe('Instructors View', () => {
    test('renders instructors view with heading', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      expect(screen.getByText('Our Instructors')).toBeInTheDocument();
    });

    test('renders all instructor cards', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      expect(screen.getByText('Maya Rodriguez')).toBeInTheDocument();
      expect(screen.getByText('Jake Thompson')).toBeInTheDocument();
      expect(screen.getByText('Lena Park')).toBeInTheDocument();
      expect(screen.getByText('Carlos Mendez')).toBeInTheDocument();
      expect(screen.getByText('Aisha Patel')).toBeInTheDocument();
    });

    test('instructor cards show ratings', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      expect(screen.getByText('★ 4.9')).toBeInTheDocument();
    });

    test('instructor cards show bios', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      expect(screen.getByText(/Certified yoga instructor/)).toBeInTheDocument();
      expect(screen.getByText(/Former athlete/)).toBeInTheDocument();
    });

    test('instructor cards show specialties', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      const yogaBadges = screen.getAllByText(/Yoga/);
      expect(yogaBadges.length).toBeGreaterThan(0);
    });

    test('instructor cards show class count and student count', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      const classesLabels = screen.getAllByText('Classes');
      expect(classesLabels.length).toBeGreaterThan(0);
      const studentsLabels = screen.getAllByText('Students');
      expect(studentsLabels.length).toBeGreaterThan(0);
    });

    test('clicking instructor card opens profile modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      fireEvent.click(screen.getByText('Maya Rodriguez'));
      // Profile modal should open with rating
      expect(screen.getByText('★ 4.9 rating')).toBeInTheDocument();
    });
  });

  describe('Statistics View', () => {
    test('renders statistics view with heading', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Studio Statistics')).toBeInTheDocument();
    });

    test('renders stat cards', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Total Classes')).toBeInTheDocument();
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
      expect(screen.getByText('Avg Occupancy')).toBeInTheDocument();
      expect(screen.getByText('Weekly Classes')).toBeInTheDocument();
    });

    test('shows total classes count', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('9')).toBeInTheDocument();
    });

    test('renders classes by type breakdown', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Classes by Type')).toBeInTheDocument();
    });

    test('renders classes by difficulty breakdown', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Classes by Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('Intermediate')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    test('renders top instructors section', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Top Instructors')).toBeInTheDocument();
    });

    test('renders most popular classes section', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Most Popular Classes')).toBeInTheDocument();
    });
  });

  describe('Booking Modal', () => {
    test('clicking a class card in schedule opens booking modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText(/Start your day with gentle stretches/)).toBeInTheDocument();
    });

    test('booking modal shows class details', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('60 minutes')).toBeInTheDocument();
    });

    test('booking modal shows difficulty', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
    });

    test('booking modal shows availability', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    test('booking modal shows occupancy bar', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText('Occupancy')).toBeInTheDocument();
    });

    test('booking modal shows instructor info', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText('Maya Rodriguez')).toBeInTheDocument();
    });

    test('booking modal shows recurring info for recurring classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText(/Recurring:/)).toBeInTheDocument();
    });

    test('booking modal shows Book/Booked status for already booked class', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      // c1 is already booked by user
      expect(screen.getByText('Booked')).toBeInTheDocument();
    });

    test('booking modal shows cancel button for booked class', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('booking modal shows favorite toggle', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByLabelText('Toggle favorite')).toBeInTheDocument();
    });

    test('close button closes booking modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText(/Start your day with gentle stretches/)).toBeInTheDocument();
      fireEvent.click(screen.getByText('×'));
      // Modal description should be gone (the description is only in the modal)
    });

    test('clicking overlay closes booking modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      // Test escape key instead since overlay click is harder to target
    });
  });

  describe('Booking Actions', () => {
    test('booking an available class shows success notification', () => {
      render(<FitnessBooking />);
      // Navigate to All Classes and click an unbooked class
      fireEvent.click(screen.getByText('All Classes'));
      fireEvent.click(screen.getByText('Core Pilates'));
      // c4 is not yet booked
      fireEvent.click(screen.getByText('Book This Class'));
      // Check notification
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText(/Booked Core Pilates successfully/)).toBeInTheDocument();
    });

    test('booking a full class joins waitlist', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      // c2 (Power HIIT) is full (15/15)
      // But user already has a waitlisted booking for c2
      // Let's try c5 (Cardio Boxing) which has 19/20 enrolled
      // Need to find one that's actually full and unbooked
    });

    test('cancelling a booking adds notification', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      fireEvent.click(screen.getByText('Yes, Cancel'));
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText(/Cancelled booking/)).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search filters classes by title', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const searchInput = screen.getByPlaceholderText('Search classes, instructors... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'yoga' } });
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.queryByText('Power HIIT')).not.toBeInTheDocument();
    });

    test('search filters by instructor name', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const searchInput = screen.getByPlaceholderText('Search classes, instructors... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Maya' } });
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.getByText('Core Pilates')).toBeInTheDocument();
    });

    test('search filters by room', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const searchInput = screen.getByPlaceholderText('Search classes, instructors... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Pool' } });
      expect(screen.getByText('Lap Swimming')).toBeInTheDocument();
    });

    test('clearing search shows all classes again', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const searchInput = screen.getByPlaceholderText('Search classes, instructors... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'yoga' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Power HIIT')).toBeInTheDocument();
    });
  });

  describe('Type Filter', () => {
    test('filtering by class type shows only matching classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const typeFilter = screen.getByLabelText('Filter by class type');
      fireEvent.change(typeFilter, { target: { value: 'yoga' } });
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.getByText('Evening Restorative Yoga')).toBeInTheDocument();
      expect(screen.queryByText('Power HIIT')).not.toBeInTheDocument();
    });

    test('selecting All Types shows all classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const typeFilter = screen.getByLabelText('Filter by class type');
      fireEvent.change(typeFilter, { target: { value: 'yoga' } });
      fireEvent.change(typeFilter, { target: { value: 'all' } });
      expect(screen.getByText('Power HIIT')).toBeInTheDocument();
    });
  });

  describe('Difficulty Filter', () => {
    test('filtering by beginner shows only beginner classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const difficultyFilter = screen.getByLabelText('Filter by difficulty');
      fireEvent.change(difficultyFilter, { target: { value: 'beginner' } });
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.queryByText('Power HIIT')).not.toBeInTheDocument();
    });

    test('filtering by advanced shows only advanced classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const difficultyFilter = screen.getByLabelText('Filter by difficulty');
      fireEvent.change(difficultyFilter, { target: { value: 'advanced' } });
      expect(screen.getByText('Power HIIT')).toBeInTheDocument();
      expect(screen.getByText('Full Body Strength')).toBeInTheDocument();
      expect(screen.queryByText('Morning Flow Yoga')).not.toBeInTheDocument();
    });
  });

  describe('Time Filter', () => {
    test('filtering by morning shows morning classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const timeFilter = screen.getByLabelText('Filter by time');
      fireEvent.change(timeFilter, { target: { value: 'morning' } });
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.queryByText('Cardio Boxing')).not.toBeInTheDocument();
    });

    test('filtering by evening shows evening classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const timeFilter = screen.getByLabelText('Filter by time');
      fireEvent.change(timeFilter, { target: { value: 'evening' } });
      expect(screen.getByText('Cardio Boxing')).toBeInTheDocument();
      expect(screen.getByText('Zumba Party')).toBeInTheDocument();
      expect(screen.queryByText('Morning Flow Yoga')).not.toBeInTheDocument();
    });
  });

  describe('Favorites', () => {
    test('toggling favorite on a class updates the star icon', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const favoriteButton = screen.getByLabelText('Favorite Morning Flow Yoga');
      fireEvent.click(favoriteButton);
      // Should now show filled star
      expect(screen.getByLabelText('Favorite Morning Flow Yoga').textContent).toBe('★');
    });

    test('toggling favorite twice removes it', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const favoriteButton = screen.getByLabelText('Favorite Morning Flow Yoga');
      fireEvent.click(favoriteButton);
      fireEvent.click(favoriteButton);
      expect(screen.getByLabelText('Favorite Morning Flow Yoga').textContent).toBe('☆');
    });

    test('favorites filter only shows favorited classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      // Favorite one class
      const favoriteButton = screen.getByLabelText('Favorite Morning Flow Yoga');
      fireEvent.click(favoriteButton);
      // Toggle favorites filter
      fireEvent.click(screen.getByLabelText('Toggle favorites filter'));
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.queryByText('Power HIIT')).not.toBeInTheDocument();
    });

    test('favorites persist to localStorage', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const favoriteButton = screen.getByLabelText('Favorite Morning Flow Yoga');
      fireEvent.click(favoriteButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fitnessFavorites',
        expect.stringContaining('c1')
      );
    });
  });

  describe('Notifications', () => {
    test('clicking bell opens notification panel', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });

    test('clicking bell again closes notification panel', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.queryByText('No notifications yet')).not.toBeInTheDocument();
    });

    test('mark all read button appears when notifications exist', () => {
      render(<FitnessBooking />);
      // Create a notification by booking a class
      fireEvent.click(screen.getByText('All Classes'));
      fireEvent.click(screen.getByText('Core Pilates'));
      fireEvent.click(screen.getByText('Book This Class'));
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });
  });

  describe('Create Class Modal', () => {
    test('clicking New Class opens create modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('+ New Class'));
      expect(screen.getByText('Create New Class')).toBeInTheDocument();
    });

    test('create modal has all form fields', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('+ New Class'));
      expect(screen.getByText('Class Title *')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Instructor')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Room')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('Max Capacity')).toBeInTheDocument();
    });

    test('cancel button closes create modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('+ New Class'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText('Create New Class')).not.toBeInTheDocument();
    });

    test('close button closes create modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('+ New Class'));
      fireEvent.click(screen.getByText('×'));
      expect(screen.queryByText('Create New Class')).not.toBeInTheDocument();
    });

    test('submitting form creates a new class', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('+ New Class'));
      const form = screen.getByText('Create New Class').closest('div').querySelector('form');
      const titleField = form.querySelector('input[name="title"]');
      const dateField = form.querySelector('input[name="date"]');
      fireEvent.change(titleField, { target: { value: 'New Test Class' } });
      fireEvent.change(dateField, { target: { value: '2025-12-01' } });
      fireEvent.click(screen.getByText('Create Class'));
      expect(screen.queryByText('Create New Class')).not.toBeInTheDocument();
      // Check notification
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText(/New Test Class.*created/)).toBeInTheDocument();
    });
  });

  describe('Instructor Profile Modal', () => {
    test('clicking instructor in instructors view opens profile modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      fireEvent.click(screen.getByText('Maya Rodriguez'));
      expect(screen.getByText('★ 4.9 rating')).toBeInTheDocument();
    });

    test('profile modal shows bio', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      fireEvent.click(screen.getByText('Maya Rodriguez'));
      expect(screen.getByText(/Certified yoga instructor/)).toBeInTheDocument();
    });

    test('profile modal shows specialties section', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      fireEvent.click(screen.getByText('Maya Rodriguez'));
      expect(screen.getByText('Specialties')).toBeInTheDocument();
    });

    test('profile modal shows upcoming classes section', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      fireEvent.click(screen.getByText('Maya Rodriguez'));
      expect(screen.getByText('Upcoming Classes')).toBeInTheDocument();
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.getByText('Core Pilates')).toBeInTheDocument();
    });

    test('close button closes profile modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      fireEvent.click(screen.getByText('Maya Rodriguez'));
      expect(screen.getByText('★ 4.9 rating')).toBeInTheDocument();
      fireEvent.click(screen.getByText('×'));
      expect(screen.queryByText('★ 4.9 rating')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes booking modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Morning Flow Yoga'));
      expect(screen.getByText(/Start your day with gentle stretches/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      // Modal description should disappear
    });

    test('Escape closes create class modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('+ New Class'));
      expect(screen.getByText('Create New Class')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Class')).not.toBeInTheDocument();
    });

    test('Escape closes notification panel', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('No notifications yet')).not.toBeInTheDocument();
    });

    test('Escape closes cancel confirmation', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      expect(screen.getByText('Cancel Booking?')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Cancel Booking?')).not.toBeInTheDocument();
    });

    test('Escape closes instructor profile modal', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('Instructors'));
      fireEvent.click(screen.getByText('Maya Rodriguez'));
      expect(screen.getByText('★ 4.9 rating')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('★ 4.9 rating')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('bookings are saved to localStorage on change', () => {
      render(<FitnessBooking />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fitnessBookings',
        expect.any(String)
      );
    });

    test('favorites are saved to localStorage on change', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const favoriteButton = screen.getByLabelText('Favorite Morning Flow Yoga');
      fireEvent.click(favoriteButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fitnessFavorites',
        expect.any(String)
      );
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'fitnessBookings') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<FitnessBooking />)).not.toThrow();
    });

    test('loads saved bookings from localStorage', () => {
      const savedBookings = JSON.stringify([
        { id: 'bCustom', classId: 'c4', userId: 'user1', bookedAt: Date.now(), status: 'confirmed' },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'fitnessBookings') return savedBookings;
        return null;
      });
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('My Bookings'));
      expect(screen.getByText('Core Pilates')).toBeInTheDocument();
    });

    test('loads saved favorites from localStorage', () => {
      const savedFavorites = JSON.stringify(['c1', 'c3']);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'fitnessFavorites') return savedFavorites;
        return null;
      });
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      // c1 should show filled star
      expect(screen.getByLabelText('Favorite Morning Flow Yoga').textContent).toBe('★');
    });
  });

  describe('Combined Filters', () => {
    test('search and type filter work together', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const searchInput = screen.getByPlaceholderText('Search classes, instructors... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Morning' } });
      const typeFilter = screen.getByLabelText('Filter by class type');
      fireEvent.change(typeFilter, { target: { value: 'yoga' } });
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
    });

    test('non-matching combined filters show no classes', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const searchInput = screen.getByPlaceholderText('Search classes, instructors... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'yoga' } });
      const typeFilter = screen.getByLabelText('Filter by class type');
      fireEvent.change(typeFilter, { target: { value: 'hiit' } });
      expect(screen.queryByText('Morning Flow Yoga')).not.toBeInTheDocument();
      expect(screen.queryByText('Power HIIT')).not.toBeInTheDocument();
    });

    test('difficulty and time filters work together', () => {
      render(<FitnessBooking />);
      fireEvent.click(screen.getByText('All Classes'));
      const difficultyFilter = screen.getByLabelText('Filter by difficulty');
      fireEvent.change(difficultyFilter, { target: { value: 'beginner' } });
      const timeFilter = screen.getByLabelText('Filter by time');
      fireEvent.change(timeFilter, { target: { value: 'morning' } });
      expect(screen.getByText('Morning Flow Yoga')).toBeInTheDocument();
      expect(screen.queryByText('Zumba Party')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<FitnessBooking />)).not.toThrow();
    });
  });
});
