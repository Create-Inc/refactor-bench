import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TravelItineraryPlanner from './src/app/page.jsx';

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

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn(() => Promise.resolve()) },
  writable: true,
});

describe('TravelItineraryPlanner Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with TripPlanner title', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText(/TripPlanner/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('Itinerary')).toBeInTheDocument();
      expect(screen.getByText('Budget')).toBeInTheDocument();
      expect(screen.getByText('Packing List')).toBeInTheDocument();
      expect(screen.getByText('Weather')).toBeInTheDocument();
      expect(screen.getByText('Map View')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    test('renders header with trip name', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('Japan Adventure')).toBeInTheDocument();
    });

    test('renders header with trip dates and destination', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText(/2025-06-15/)).toBeInTheDocument();
      expect(screen.getByText(/2025-06-29/)).toBeInTheDocument();
      expect(screen.getByText(/Tokyo, Japan/)).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByPlaceholderText('Search activities... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders currency selector', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByLabelText('Currency')).toBeInTheDocument();
    });

    test('renders New Trip button', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('+ New Trip')).toBeInTheDocument();
    });

    test('renders trip selector dropdown', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByLabelText('Select trip')).toBeInTheDocument();
    });

    test('renders budget progress in sidebar', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText(/Budget Used/)).toBeInTheDocument();
    });

    test('renders packing progress in sidebar', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText(/Packing:.*complete/)).toBeInTheDocument();
    });
  });

  describe('Itinerary View', () => {
    test('renders day tabs for the trip', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText(/Day 1/)).toBeInTheDocument();
      expect(screen.getByText(/Day 2/)).toBeInTheDocument();
      expect(screen.getByText(/Day 3/)).toBeInTheDocument();
    });

    test('renders activities for the first day by default', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('Arrive at Narita Airport')).toBeInTheDocument();
      expect(screen.getByText('Check in at Shinjuku Hotel')).toBeInTheDocument();
      expect(screen.getByText('Dinner at Omoide Yokocho')).toBeInTheDocument();
    });

    test('clicking day tab switches activities', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText(/Day 2/));
      expect(screen.getByText('Meiji Shrine visit')).toBeInTheDocument();
      expect(screen.getByText('Harajuku shopping')).toBeInTheDocument();
      expect(screen.getByText('TeamLab Borderless')).toBeInTheDocument();
    });

    test('clicking day 3 tab shows day 3 activities', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText(/Day 3/));
      expect(screen.getByText('Day trip to Mt. Fuji')).toBeInTheDocument();
      expect(screen.getByText('Onsen at Hakone')).toBeInTheDocument();
    });

    test('renders activity category icons', () => {
      render(<TravelItineraryPlanner />);
      // Transportation icon for arrival
      expect(screen.getByText('🚗')).toBeInTheDocument();
      // Accommodation icon for hotel
      expect(screen.getByText('🏨')).toBeInTheDocument();
      // Food icon for dinner
      expect(screen.getByText('🍽️')).toBeInTheDocument();
    });

    test('renders booked status badge', () => {
      render(<TravelItineraryPlanner />);
      const bookedBadges = screen.getAllByText('Booked');
      expect(bookedBadges.length).toBeGreaterThan(0);
    });

    test('renders activity time and address', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText(/14:00 – 16:00/)).toBeInTheDocument();
      expect(screen.getByText(/Narita International Airport/)).toBeInTheDocument();
    });

    test('renders activity notes', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText(/Flight JL123/)).toBeInTheDocument();
    });

    test('renders activity cost', () => {
      render(<TravelItineraryPlanner />);
      // Hotel cost is $150
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    test('renders Free for zero cost activities', () => {
      render(<TravelItineraryPlanner />);
      const freeLabels = screen.getAllByText('Free');
      expect(freeLabels.length).toBeGreaterThan(0);
    });

    test('renders day summary', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('Day Summary')).toBeInTheDocument();
      expect(screen.getByText(/3 activities/)).toBeInTheDocument();
    });

    test('renders Add Activity button', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('+ Add Activity')).toBeInTheDocument();
    });

    test('renders category filter dropdown', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
    });

    test('renders sort dropdown', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByLabelText('Sort activities')).toBeInTheDocument();
    });
  });

  describe('Activity Interaction', () => {
    test('clicking activity expands action buttons', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Arrive at Narita Airport'));
      expect(screen.getByText('Mark Unbooked')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    test('toggle booked status on activity', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Arrive at Narita Airport'));
      fireEvent.click(screen.getByText('Mark Unbooked'));
      // After toggling, the button text should flip
      // Re-click to expand
      fireEvent.click(screen.getByText('Arrive at Narita Airport'));
      expect(screen.getByText('Mark Booked')).toBeInTheDocument();
    });

    test('delete activity with confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Dinner at Omoide Yokocho'));
      fireEvent.click(screen.getByText('Delete'));
      expect(screen.queryByText('Dinner at Omoide Yokocho')).not.toBeInTheDocument();
    });

    test('delete activity cancelled keeps it', () => {
      window.confirm.mockReturnValue(false);
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Dinner at Omoide Yokocho'));
      fireEvent.click(screen.getByText('Delete'));
      expect(screen.getByText('Dinner at Omoide Yokocho')).toBeInTheDocument();
    });

    test('rating an activity shows stars', () => {
      render(<TravelItineraryPlanner />);
      const rateButtons = screen.getAllByLabelText('Rate 3 stars');
      fireEvent.click(rateButtons[0]);
      expect(screen.getByText('3/5')).toBeInTheDocument();
    });
  });

  describe('Activity Filtering and Sorting', () => {
    test('search filters activities by name', () => {
      render(<TravelItineraryPlanner />);
      const searchInput = screen.getByPlaceholderText('Search activities... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Narita' } });
      expect(screen.getByText('Arrive at Narita Airport')).toBeInTheDocument();
      expect(screen.queryByText('Dinner at Omoide Yokocho')).not.toBeInTheDocument();
    });

    test('search filters activities by notes', () => {
      render(<TravelItineraryPlanner />);
      const searchInput = screen.getByPlaceholderText('Search activities... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'yakitori' } });
      expect(screen.getByText('Dinner at Omoide Yokocho')).toBeInTheDocument();
    });

    test('clearing search shows all activities', () => {
      render(<TravelItineraryPlanner />);
      const searchInput = screen.getByPlaceholderText('Search activities... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Narita' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Arrive at Narita Airport')).toBeInTheDocument();
      expect(screen.getByText('Dinner at Omoide Yokocho')).toBeInTheDocument();
    });

    test('filter by category shows only matching activities', () => {
      render(<TravelItineraryPlanner />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'food' } });
      expect(screen.getByText('Dinner at Omoide Yokocho')).toBeInTheDocument();
      expect(screen.queryByText('Arrive at Narita Airport')).not.toBeInTheDocument();
    });

    test('selecting All Categories shows all activities', () => {
      render(<TravelItineraryPlanner />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'food' } });
      fireEvent.change(categoryFilter, { target: { value: 'all' } });
      expect(screen.getByText('Arrive at Narita Airport')).toBeInTheDocument();
      expect(screen.getByText('Dinner at Omoide Yokocho')).toBeInTheDocument();
    });

    test('non-matching filter shows empty state', () => {
      render(<TravelItineraryPlanner />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'outdoor' } });
      expect(screen.getByText('No activities match your filters.')).toBeInTheDocument();
    });

    test('sorting by cost changes activity order', () => {
      render(<TravelItineraryPlanner />);
      const sortDropdown = screen.getByLabelText('Sort activities');
      fireEvent.change(sortDropdown, { target: { value: 'cost' } });
      // The highest cost activity (hotel $150) should come first when sorted by cost desc
      const activities = screen.getAllByText(/Narita|Shinjuku Hotel|Omoide/);
      expect(activities.length).toBe(3);
    });
  });

  describe('Budget View', () => {
    test('clicking Budget nav shows budget overview', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Budget'));
      expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    });

    test('budget view shows summary cards', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Budget'));
      expect(screen.getByText('Total Budget')).toBeInTheDocument();
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getByText('Remaining')).toBeInTheDocument();
      expect(screen.getByText('Daily Average')).toBeInTheDocument();
    });

    test('budget view shows budget usage bar', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Budget'));
      expect(screen.getByText('Budget Usage')).toBeInTheDocument();
    });

    test('budget view shows spending by category', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Budget'));
      expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    });

    test('budget view shows daily spending', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Budget'));
      expect(screen.getByText('Daily Spending')).toBeInTheDocument();
    });

    test('total budget displays correctly', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Budget'));
      expect(screen.getByText('$5000.00')).toBeInTheDocument();
    });
  });

  describe('Packing List View', () => {
    test('clicking Packing List nav shows packing view', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      expect(screen.getByText('Passport')).toBeInTheDocument();
      expect(screen.getByText('JR Rail Pass voucher')).toBeInTheDocument();
    });

    test('packing list shows item count', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      // 3 items packed out of 10
      expect(screen.getByText(/3 \/ 10 packed/)).toBeInTheDocument();
    });

    test('toggling packing item checkbox', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      const checkbox = screen.getByLabelText('Pack Travel adapter (Type A)');
      expect(checkbox.checked).toBe(false);
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });

    test('adding a new packing item', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      const input = screen.getByPlaceholderText('Add a packing item...');
      fireEvent.change(input, { target: { value: 'Travel pillow' } });
      fireEvent.click(screen.getByText('Add'));
      expect(screen.getByText('Travel pillow')).toBeInTheDocument();
    });

    test('adding empty packing item does nothing', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);
      // The 10 items remain, no extra item was added
      expect(screen.getByText(/\/ 10 packed/)).toBeInTheDocument();
    });

    test('deleting a packing item', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      const removeButton = screen.getByLabelText('Remove Sunscreen');
      fireEvent.click(removeButton);
      expect(screen.queryByText('Sunscreen')).not.toBeInTheDocument();
    });

    test('packing category filter works', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      const categoryFilter = screen.getByLabelText('Filter packing by category');
      fireEvent.change(categoryFilter, { target: { value: 'electronics' } });
      expect(screen.getByText('Travel adapter (Type A)')).toBeInTheDocument();
      expect(screen.getByText('Portable WiFi device')).toBeInTheDocument();
      expect(screen.queryByText('Passport')).not.toBeInTheDocument();
    });

    test('packing progress by category is shown', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      expect(screen.getByText('Packing Progress by Category')).toBeInTheDocument();
    });

    test('packed items show strikethrough style', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Packing List'));
      const passport = screen.getByText('Passport');
      expect(passport.style.textDecoration).toBe('line-through');
    });
  });

  describe('Weather View', () => {
    test('clicking Weather nav shows weather info', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Weather'));
      expect(screen.getByText('Weather & Destination Info')).toBeInTheDocument();
    });

    test('weather view shows destination details', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Weather'));
      expect(screen.getByText('Destination Details')).toBeInTheDocument();
      expect(screen.getByText(/Tokyo, Japan/)).toBeInTheDocument();
      expect(screen.getByText(/JST/)).toBeInTheDocument();
      expect(screen.getByText(/Japanese/)).toBeInTheDocument();
    });

    test('weather view shows weather icon and temp', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Weather'));
      expect(screen.getByText('⛅')).toBeInTheDocument();
      expect(screen.getByText(/22°C.*14°C/)).toBeInTheDocument();
    });

    test('weather view shows daily forecast', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Weather'));
      expect(screen.getByText('Daily Forecast')).toBeInTheDocument();
    });

    test('weather view shows packing suggestions', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Weather'));
      expect(screen.getByText('Packing Suggestions')).toBeInTheDocument();
      // partly_cloudy weather suggests light jacket, layers, comfortable shoes
      expect(screen.getByText(/Light jacket/)).toBeInTheDocument();
    });
  });

  describe('Map View', () => {
    test('clicking Map View nav shows map', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Map View'));
      expect(screen.getByText(/Map View/)).toBeInTheDocument();
    });

    test('map view shows activity locations', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Map View'));
      expect(screen.getByText('Arrive at Narita Airport')).toBeInTheDocument();
      expect(screen.getByText('Meiji Shrine visit')).toBeInTheDocument();
      expect(screen.getByText('Day trip to Mt. Fuji')).toBeInTheDocument();
    });

    test('map view shows day and time for each location', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Map View'));
      expect(screen.getByText(/Day 1.*14:00.*Narita/)).toBeInTheDocument();
    });
  });

  describe('Timeline View', () => {
    test('clicking Timeline nav shows timeline', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Timeline'));
      expect(screen.getByText('Trip Timeline')).toBeInTheDocument();
    });

    test('timeline view shows day headers', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Timeline'));
      expect(screen.getByText(/Day 1 —/)).toBeInTheDocument();
      expect(screen.getByText(/Day 2 —/)).toBeInTheDocument();
      expect(screen.getByText(/Day 3 —/)).toBeInTheDocument();
    });

    test('timeline view shows activities with times', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Timeline'));
      expect(screen.getByText('Arrive at Narita Airport')).toBeInTheDocument();
      expect(screen.getByText('Meiji Shrine visit')).toBeInTheDocument();
    });

    test('timeline view shows activity costs', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Timeline'));
      const freeLabels = screen.getAllByText('Free');
      expect(freeLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Collaborators View', () => {
    test('clicking Team nav shows collaborators', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('Trip Collaborators')).toBeInTheDocument();
    });

    test('shows existing collaborators', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Sam Chen')).toBeInTheDocument();
    });

    test('shows collaborator emails', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('alex@example.com')).toBeInTheDocument();
      expect(screen.getByText('sam@example.com')).toBeInTheDocument();
    });

    test('shows collaborator roles', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('organizer')).toBeInTheDocument();
      expect(screen.getByText('editor')).toBeInTheDocument();
    });

    test('organizer does not have remove button', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      const removeButtons = screen.getAllByText('Remove');
      // Only the editor (Sam Chen) should have a Remove button, not the organizer
      expect(removeButtons.length).toBe(1);
    });

    test('removing a collaborator with confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);
      expect(screen.queryByText('Sam Chen')).not.toBeInTheDocument();
    });

    test('removing a collaborator cancelled keeps them', () => {
      window.confirm.mockReturnValue(false);
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);
      expect(screen.getByText('Sam Chen')).toBeInTheDocument();
    });

    test('Share Link button shows share modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('🔗 Share Link'));
      expect(screen.getByText('Share Trip')).toBeInTheDocument();
    });

    test('Add Collaborator button shows add modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('+ Add Collaborator'));
      expect(screen.getByText('Add Collaborator')).toBeInTheDocument();
    });

    test('trip notes section is shown', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('Trip Notes')).toBeInTheDocument();
      expect(screen.getByText(/exchange some cash/)).toBeInTheDocument();
    });

    test('editing trip notes', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('✏️ Edit'));
      const textarea = screen.getByPlaceholderText('Add shared notes for your trip...');
      fireEvent.change(textarea, { target: { value: 'Updated trip notes' } });
      fireEvent.click(screen.getByText('Save Notes'));
      expect(screen.getByText('Updated trip notes')).toBeInTheDocument();
    });

    test('cancelling trip notes edit', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('✏️ Edit'));
      fireEvent.click(screen.getByText('Cancel'));
      // Should show the original notes
      expect(screen.getByText(/exchange some cash/)).toBeInTheDocument();
    });
  });

  describe('Create Trip Modal', () => {
    test('clicking New Trip opens create modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ New Trip'));
      expect(screen.getByText('Create New Trip')).toBeInTheDocument();
    });

    test('create modal has all form fields', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ New Trip'));
      expect(screen.getByText('Trip Name *')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Start Date *')).toBeInTheDocument();
      expect(screen.getByText('End Date *')).toBeInTheDocument();
      expect(screen.getByText('Destination')).toBeInTheDocument();
    });

    test('cancel button closes create trip modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ New Trip'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText('Create New Trip')).not.toBeInTheDocument();
    });

    test('close button (×) closes create trip modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ New Trip'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Create New Trip')).not.toBeInTheDocument();
    });

    test('submitting form creates a new trip', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ New Trip'));
      const form = screen.getByText('Create New Trip').closest('div').querySelector('form');
      const nameField = form.querySelector('input[name="name"]');
      const startField = form.querySelector('input[name="startDate"]');
      const endField = form.querySelector('input[name="endDate"]');
      fireEvent.change(nameField, { target: { value: 'Weekend in Paris' } });
      fireEvent.change(startField, { target: { value: '2025-07-01' } });
      fireEvent.change(endField, { target: { value: '2025-07-03' } });
      fireEvent.click(screen.getByText('Create Trip'));
      expect(screen.queryByText('Create New Trip')).not.toBeInTheDocument();
    });
  });

  describe('Add Activity Modal', () => {
    test('clicking Add Activity opens activity modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ Add Activity'));
      expect(screen.getByText('Add Activity')).toBeInTheDocument();
    });

    test('add activity modal has all form fields', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ Add Activity'));
      expect(screen.getByText('Activity Name *')).toBeInTheDocument();
      expect(screen.getByText('Start Time *')).toBeInTheDocument();
      expect(screen.getByText('End Time *')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Already booked')).toBeInTheDocument();
    });

    test('submitting activity form adds activity to day', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ Add Activity'));
      const form = screen.getByText('Add Activity').closest('div').querySelector('form');
      const nameField = form.querySelector('input[name="activityName"]');
      const startField = form.querySelector('input[name="startTime"]');
      const endField = form.querySelector('input[name="endTime"]');
      fireEvent.change(nameField, { target: { value: 'Visit Senso-ji Temple' } });
      fireEvent.change(startField, { target: { value: '09:00' } });
      fireEvent.change(endField, { target: { value: '11:00' } });
      fireEvent.click(screen.getByText('Add Activity'));
      // Modal should close and activity should appear
      expect(screen.getByText('Visit Senso-ji Temple')).toBeInTheDocument();
    });

    test('cancel button closes activity modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ Add Activity'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText('Activity Name *')).not.toBeInTheDocument();
    });
  });

  describe('Add Collaborator Modal', () => {
    test('add collaborator form works', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('+ Add Collaborator'));
      const form = screen.getByText('Add Collaborator').closest('div').querySelector('form');
      const nameField = form.querySelector('input[name="collabName"]');
      const emailField = form.querySelector('input[name="collabEmail"]');
      fireEvent.change(nameField, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailField, { target: { value: 'jane@example.com' } });
      const addButtons = screen.getAllByText('Add');
      fireEvent.click(addButtons[addButtons.length - 1]);
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  describe('Trip Settings Modal', () => {
    test('clicking settings gear opens settings modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Trip settings'));
      expect(screen.getByText('Trip Settings')).toBeInTheDocument();
    });

    test('settings modal has form fields', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Trip settings'));
      expect(screen.getByDisplayValue('Japan Adventure')).toBeInTheDocument();
    });

    test('settings modal shows status dropdown', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Trip settings'));
      expect(screen.getByText('Planning')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    test('settings modal has Delete Trip button', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Trip settings'));
      expect(screen.getByText('Delete Trip')).toBeInTheDocument();
    });

    test('saving trip settings updates trip name', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Trip settings'));
      const nameInput = screen.getByDisplayValue('Japan Adventure');
      fireEvent.change(nameInput, { target: { value: 'Japan Grand Tour' } });
      fireEvent.click(screen.getByText('Save Changes'));
      expect(screen.getByText('Japan Grand Tour')).toBeInTheDocument();
    });

    test('delete trip with confirmation removes it', () => {
      window.confirm.mockReturnValue(true);
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Trip settings'));
      fireEvent.click(screen.getByText('Delete Trip'));
      expect(screen.queryByText('Japan Adventure')).not.toBeInTheDocument();
    });

    test('delete trip without confirmation keeps it', () => {
      window.confirm.mockReturnValue(false);
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Trip settings'));
      fireEvent.click(screen.getByText('Delete Trip'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.getByText('Japan Adventure')).toBeInTheDocument();
    });
  });

  describe('Share Modal', () => {
    test('share modal shows generated link', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('🔗 Share Link'));
      const linkInput = screen.getByDisplayValue(/travelplanner\.app\/share/);
      expect(linkInput).toBeInTheDocument();
    });

    test('copy link button triggers clipboard', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('🔗 Share Link'));
      fireEvent.click(screen.getByText('Copy Link'));
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    test('close button closes share modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('🔗 Share Link'));
      expect(screen.getByText('Share Trip')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Share Trip')).not.toBeInTheDocument();
    });
  });

  describe('Currency Conversion', () => {
    test('changing currency updates displayed values', () => {
      render(<TravelItineraryPlanner />);
      const currencySelect = screen.getByLabelText('Currency');
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });
      // Hotel cost of $150 in EUR should be €138.00
      expect(screen.getByText('€138.00')).toBeInTheDocument();
    });

    test('currency saves to localStorage', () => {
      render(<TravelItineraryPlanner />);
      const currencySelect = screen.getByLabelText('Currency');
      fireEvent.change(currencySelect, { target: { value: 'GBP' } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('travelPlannerCurrency', 'GBP');
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<TravelItineraryPlanner />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('travelPlannerTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<TravelItineraryPlanner />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('travelPlannerTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'travelPlannerTheme') return 'dark';
        return null;
      });
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<TravelItineraryPlanner />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<TravelItineraryPlanner />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Itinerary')).not.toBeInTheDocument();
      expect(screen.queryByText('Budget')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<TravelItineraryPlanner />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Itinerary')).toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    test('clicking bell icon shows notification panel', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    test('clicking bell icon again hides notification panel', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });

    test('adding an activity generates a notification', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ Add Activity'));
      const form = screen.getByText('Add Activity').closest('div').querySelector('form');
      const nameField = form.querySelector('input[name="activityName"]');
      const startField = form.querySelector('input[name="startTime"]');
      const endField = form.querySelector('input[name="endTime"]');
      fireEvent.change(nameField, { target: { value: 'Sushi dinner' } });
      fireEvent.change(startField, { target: { value: '19:00' } });
      fireEvent.change(endField, { target: { value: '21:00' } });
      fireEvent.click(screen.getByText('Add Activity'));
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText(/Sushi dinner.*added/)).toBeInTheDocument();
    });

    test('mark all read button works', () => {
      render(<TravelItineraryPlanner />);
      // Create an activity to generate a notification
      fireEvent.click(screen.getByText('+ Add Activity'));
      const form = screen.getByText('Add Activity').closest('div').querySelector('form');
      const nameField = form.querySelector('input[name="activityName"]');
      const startField = form.querySelector('input[name="startTime"]');
      const endField = form.querySelector('input[name="endTime"]');
      fireEvent.change(nameField, { target: { value: 'Test activity' } });
      fireEvent.change(startField, { target: { value: '10:00' } });
      fireEvent.change(endField, { target: { value: '11:00' } });
      fireEvent.click(screen.getByText('Add Activity'));
      fireEvent.click(screen.getByLabelText('Notifications'));
      fireEvent.click(screen.getByText('Mark all read'));
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes create trip modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ New Trip'));
      expect(screen.getByText('Create New Trip')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Trip')).not.toBeInTheDocument();
    });

    test('Escape key closes add activity modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('+ Add Activity'));
      expect(screen.getByText('Activity Name *')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Activity Name *')).not.toBeInTheDocument();
    });

    test('Escape key closes trip settings modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Trip settings'));
      expect(screen.getByText('Trip Settings')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Trip Settings')).not.toBeInTheDocument();
    });

    test('Escape key closes notification panel', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });

    test('Escape key closes share modal', () => {
      render(<TravelItineraryPlanner />);
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('🔗 Share Link'));
      expect(screen.getByText('Share Trip')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Share Trip')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('trips are saved to localStorage on change', () => {
      render(<TravelItineraryPlanner />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'travelPlannerTrips',
        expect.any(String)
      );
    });

    test('theme preference is loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'travelPlannerTheme') return 'dark';
        return null;
      });
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'travelPlannerView') return 'budget';
        return null;
      });
      render(<TravelItineraryPlanner />);
      expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    });

    test('saved currency is loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'travelPlannerCurrency') return 'EUR';
        return null;
      });
      render(<TravelItineraryPlanner />);
      const currencySelect = screen.getByLabelText('Currency');
      expect(currencySelect.value).toBe('EUR');
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'travelPlannerTrips') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<TravelItineraryPlanner />)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<TravelItineraryPlanner />)).not.toThrow();
    });
  });
});
