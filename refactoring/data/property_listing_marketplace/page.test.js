import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PropertyMarketplace from './src/app/page.jsx';

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

// Mock confirm and alert
window.confirm = vi.fn();
window.alert = vi.fn();

describe('PropertyMarketplace Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with HomeFind title', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByText(/HomeFind/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByText('Grid View')).toBeInTheDocument();
      expect(screen.getByText('List View')).toBeInTheDocument();
      expect(screen.getByText('Map View')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
      expect(screen.getByText('Agents')).toBeInTheDocument();
      expect(screen.getByText('Market Stats')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByPlaceholderText('Search properties... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls in header', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByLabelText('Filter by property type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by neighborhood')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    });

    test('renders property cards in grid view by default', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Spacious Family Home')).toBeInTheDocument();
    });

    test('renders Quick Stats in sidebar', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByText(/active listings/)).toBeInTheDocument();
      expect(screen.getByText(/new this week/)).toBeInTheDocument();
    });

    test('renders Reset Filters button', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    });

    test('renders advanced filters bar with bedroom/bathroom selectors', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByLabelText('Minimum bedrooms')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum bathrooms')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum price')).toBeInTheDocument();
    });

    test('renders results count', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByText(/results/)).toBeInTheDocument();
    });

    test('renders theme toggle button', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('renders toggle sidebar button', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('renders sort direction toggle', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByLabelText('Toggle sort direction')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('filters properties by search query on title', () => {
      render(<PropertyMarketplace />);
      const input = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(input, { target: { value: 'Downtown Loft' } });
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.queryByText('Spacious Family Home')).not.toBeInTheDocument();
    });

    test('filters properties by search query on address', () => {
      render(<PropertyMarketplace />);
      const input = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(input, { target: { value: '456 Oak' } });
      expect(screen.getByText('Spacious Family Home')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('filters properties by neighborhood search', () => {
      render(<PropertyMarketplace />);
      const input = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(input, { target: { value: 'Lakeside' } });
      expect(screen.getByText('Luxury Lakeside Condo')).toBeInTheDocument();
    });

    test('shows clear search history button when search history exists', () => {
      render(<PropertyMarketplace />);
      const input = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(input, { target: { value: 'test search' } });
      expect(screen.getByLabelText('Clear search history')).toBeInTheDocument();
    });

    test('clears search history', () => {
      render(<PropertyMarketplace />);
      const input = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(input, { target: { value: 'test search' } });
      fireEvent.click(screen.getByLabelText('Clear search history'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'propertySearchHistory',
        JSON.stringify([])
      );
    });
  });

  describe('Filter Controls', () => {
    test('filters by property type', () => {
      render(<PropertyMarketplace />);
      const typeSelect = screen.getByLabelText('Filter by property type');
      fireEvent.change(typeSelect, { target: { value: 'house' } });
      expect(screen.getByText('Spacious Family Home')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('filters by listing status', () => {
      render(<PropertyMarketplace />);
      const statusSelect = screen.getByLabelText('Filter by status');
      fireEvent.change(statusSelect, { target: { value: 'new' } });
      expect(screen.getByText('Luxury Lakeside Condo')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('filters by neighborhood', () => {
      render(<PropertyMarketplace />);
      const neighborhoodSelect = screen.getByLabelText('Filter by neighborhood');
      fireEvent.change(neighborhoodSelect, { target: { value: 'Suburbs' } });
      expect(screen.getByText('Spacious Family Home')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('filters by minimum bedrooms', () => {
      render(<PropertyMarketplace />);
      const bedroomSelect = screen.getByLabelText('Minimum bedrooms');
      fireEvent.change(bedroomSelect, { target: { value: '4' } });
      expect(screen.getByText('Spacious Family Home')).toBeInTheDocument();
      expect(screen.getByText('Westview Estate')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('filters by minimum bathrooms', () => {
      render(<PropertyMarketplace />);
      const bathroomSelect = screen.getByLabelText('Minimum bathrooms');
      fireEvent.change(bathroomSelect, { target: { value: '3' } });
      expect(screen.getByText('Spacious Family Home')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('toggles amenity filters', () => {
      render(<PropertyMarketplace />);
      const poolButton = screen.getByText('Pool');
      fireEvent.click(poolButton);
      expect(screen.getByText('Luxury Lakeside Condo')).toBeInTheDocument();
      expect(screen.getByText('Westview Estate')).toBeInTheDocument();
      expect(screen.queryByText('Spacious Family Home')).not.toBeInTheDocument();
    });

    test('resets all filters', () => {
      render(<PropertyMarketplace />);
      const typeSelect = screen.getByLabelText('Filter by property type');
      fireEvent.change(typeSelect, { target: { value: 'house' } });
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('Reset Filters'));
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });

    test('changes sort option', () => {
      render(<PropertyMarketplace />);
      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'price' } });
      // Sort by price should reorder the properties
      const priceElements = screen.getAllByText(/\$\d/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    test('toggles sort direction', () => {
      render(<PropertyMarketplace />);
      const dirButton = screen.getByLabelText('Toggle sort direction');
      expect(dirButton.textContent).toContain('Desc');
      fireEvent.click(dirButton);
      expect(dirButton.textContent).toContain('Asc');
    });

    test('adjusts max price with range slider', () => {
      render(<PropertyMarketplace />);
      const priceSlider = screen.getByLabelText('Maximum price');
      fireEvent.change(priceSlider, { target: { value: '300000' } });
      // Only properties under $300K should show (studios, land, etc.)
      expect(screen.queryByText('Spacious Family Home')).not.toBeInTheDocument();
    });
  });

  describe('View Switching', () => {
    test('switches to list view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('List View'));
      // In list view, properties show with truncated descriptions
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });

    test('switches to map view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Map View'));
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      expect(screen.getByText('Interactive Map')).toBeInTheDocument();
    });

    test('switches to favorites view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Favorites'));
      expect(screen.getByText(/Saved Properties/)).toBeInTheDocument();
      expect(
        screen.getByText(/No saved properties yet/)
      ).toBeInTheDocument();
    });

    test('switches to agents view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      expect(screen.getByText('Our Agents')).toBeInTheDocument();
      expect(screen.getByText('Jessica Torres')).toBeInTheDocument();
      expect(screen.getByText('Marcus Chen')).toBeInTheDocument();
      expect(screen.getByText('Sarah Kim')).toBeInTheDocument();
      expect(screen.getByText('David Okafor')).toBeInTheDocument();
    });

    test('switches to market stats view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Market Stats'));
      expect(screen.getByText('Market Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Listings')).toBeInTheDocument();
      expect(screen.getByText('Avg Price')).toBeInTheDocument();
      expect(screen.getByText('Total Views')).toBeInTheDocument();
    });
  });

  describe('Favorites Functionality', () => {
    test('toggles favorite on property card in grid view', () => {
      render(<PropertyMarketplace />);
      const favButton = screen.getByLabelText('Toggle favorite Modern Downtown Loft');
      fireEvent.click(favButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'propertyFavorites',
        expect.stringContaining('p1')
      );
    });

    test('shows favorite count badge in sidebar', () => {
      render(<PropertyMarketplace />);
      const favButton = screen.getByLabelText('Toggle favorite Modern Downtown Loft');
      fireEvent.click(favButton);
      // Sidebar should show badge with count
      const badge = screen.getByText('1');
      expect(badge).toBeInTheDocument();
    });

    test('displays favorited properties in favorites view', () => {
      render(<PropertyMarketplace />);
      // Add a favorite
      const favButton = screen.getByLabelText('Toggle favorite Modern Downtown Loft');
      fireEvent.click(favButton);
      // Switch to favorites view
      fireEvent.click(screen.getByText('Favorites'));
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText(/Saved Properties \(1\)/)).toBeInTheDocument();
    });

    test('removes property from favorites in favorites view', () => {
      render(<PropertyMarketplace />);
      const favButton = screen.getByLabelText('Toggle favorite Modern Downtown Loft');
      fireEvent.click(favButton);
      fireEvent.click(screen.getByText('Favorites'));
      const removeButton = screen.getByLabelText('Remove Modern Downtown Loft from favorites');
      fireEvent.click(removeButton);
      expect(screen.getByText(/No saved properties yet/)).toBeInTheDocument();
    });

    test('unfavoriting in grid view removes it', () => {
      render(<PropertyMarketplace />);
      const favButton = screen.getByLabelText('Toggle favorite Modern Downtown Loft');
      fireEvent.click(favButton);
      // Click again to unfavorite
      fireEvent.click(favButton);
      fireEvent.click(screen.getByText('Favorites'));
      expect(screen.getByText(/Saved Properties \(0\)/)).toBeInTheDocument();
    });
  });

  describe('Comparison Feature', () => {
    test('adds properties to comparison via grid cards', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle compare Modern Downtown Loft'));
      // Compare button should appear in header
      expect(screen.getByText(/Compare \(1\)/)).toBeInTheDocument();
    });

    test('opens comparison panel', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle compare Modern Downtown Loft'));
      fireEvent.click(screen.getByText(/Compare \(1\)/));
      expect(screen.getByTestId('comparison-panel')).toBeInTheDocument();
      expect(screen.getByText('Compare Properties')).toBeInTheDocument();
    });

    test('comparison table displays property details', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle compare Modern Downtown Loft'));
      fireEvent.click(screen.getByText(/Compare \(1\)/));

      const panel = screen.getByTestId('comparison-panel');
      expect(within(panel).getByText('Price')).toBeInTheDocument();
      expect(within(panel).getByText('Type')).toBeInTheDocument();
      expect(within(panel).getByText('Bedrooms')).toBeInTheDocument();
      expect(within(panel).getByText('Bathrooms')).toBeInTheDocument();
      expect(within(panel).getByText('Sq Ft')).toBeInTheDocument();
    });

    test('removes property from comparison', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle compare Modern Downtown Loft'));
      fireEvent.click(screen.getByText(/Compare \(1\)/));

      const removeBtn = screen.getByLabelText('Remove Modern Downtown Loft from comparison');
      fireEvent.click(removeBtn);
      expect(screen.getByText(/No properties selected for comparison/)).toBeInTheDocument();
    });

    test('closes comparison panel', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle compare Modern Downtown Loft'));
      fireEvent.click(screen.getByText(/Compare \(1\)/));
      fireEvent.click(screen.getByLabelText('Close comparison'));
      expect(screen.queryByTestId('comparison-panel')).not.toBeInTheDocument();
    });

    test('persists comparison list to localStorage', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle compare Modern Downtown Loft'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'propertyComparison',
        expect.stringContaining('p1')
      );
    });
  });

  describe('Property Detail View', () => {
    test('opens property detail when clicking a card', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      // Detail view should show description
      expect(
        screen.getByText(/Stunning open-concept loft/)
      ).toBeInTheDocument();
    });

    test('shows property specs in detail view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Bedrooms')).toBeInTheDocument();
      expect(screen.getByText('Bathrooms')).toBeInTheDocument();
      expect(screen.getByText('Sq Ft')).toBeInTheDocument();
      expect(screen.getByText('Year Built')).toBeInTheDocument();
    });

    test('shows amenities in detail view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Amenities')).toBeInTheDocument();
      expect(screen.getByText('Gym')).toBeInTheDocument();
      expect(screen.getByText('Elevator')).toBeInTheDocument();
    });

    test('shows listing agent in detail view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Listing Agent')).toBeInTheDocument();
      expect(screen.getByText('Marcus Chen')).toBeInTheDocument();
      expect(screen.getByText('Urban Living Realty')).toBeInTheDocument();
    });

    test('shows back to listings button', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      const backButton = screen.getByText(/Back to listings/);
      expect(backButton).toBeInTheDocument();
    });

    test('navigates back from detail to grid view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText(/Back to listings/));
      expect(screen.getByText('Spacious Family Home')).toBeInTheDocument();
    });

    test('can favorite from detail view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      const saveBtn = screen.getByText(/Save/);
      fireEvent.click(saveBtn);
      expect(screen.getByText(/Saved/)).toBeInTheDocument();
    });

    test('can add to comparison from detail view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      const compareBtn = screen.getByText(/Compare$/);
      fireEvent.click(compareBtn);
      expect(screen.getByText(/Comparing/)).toBeInTheDocument();
    });

    test('adds property to recently viewed', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'propertyRecentlyViewed',
        expect.stringContaining('p1')
      );
    });

    test('shows open house notice when available', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText(/Open House/)).toBeInTheDocument();
    });

    test('shows Contact Agent button in detail view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Contact Agent')).toBeInTheDocument();
    });
  });

  describe('Inquiry Form', () => {
    test('opens inquiry modal from detail view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText('Contact Agent'));
      expect(screen.getByTestId('inquiry-modal')).toBeInTheDocument();
      expect(screen.getByText('Send Inquiry')).toBeInTheDocument();
    });

    test('shows property name in inquiry modal', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText('Contact Agent'));
      expect(screen.getByText(/Inquiring about/)).toBeInTheDocument();
    });

    test('renders all inquiry form fields', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText('Contact Agent'));
      expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('(555) 000-0000')).toBeInTheDocument();
      expect(screen.getByLabelText('Preferred contact method')).toBeInTheDocument();
      expect(
        screen.getByText('I am pre-approved for financing')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("I'm interested in this property...")
      ).toBeInTheDocument();
    });

    test('fills out and submits inquiry form', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText('Contact Agent'));

      fireEvent.change(screen.getByPlaceholderText('Your full name'), {
        target: { value: 'Jane Doe' },
      });
      fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
        target: { value: 'jane@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText("I'm interested in this property..."),
        { target: { value: 'I would like to schedule a viewing.' } }
      );
      fireEvent.submit(screen.getByPlaceholderText('Your full name').closest('form'));

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Modern Downtown Loft')
      );
    });

    test('closes inquiry modal', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText('Contact Agent'));
      fireEvent.click(screen.getByLabelText('Close inquiry form'));
      expect(screen.queryByTestId('inquiry-modal')).not.toBeInTheDocument();
    });

    test('toggles pre-approved checkbox', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText('Contact Agent'));
      const checkbox = screen.getByText('I am pre-approved for financing').querySelector('input') ||
        screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Agents View', () => {
    test('renders agent cards with details', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      expect(screen.getByTestId('agent-card-a1')).toBeInTheDocument();
      expect(screen.getByTestId('agent-card-a2')).toBeInTheDocument();
      expect(screen.getByTestId('agent-card-a3')).toBeInTheDocument();
      expect(screen.getByTestId('agent-card-a4')).toBeInTheDocument();
    });

    test('displays agent specialties', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      // Jessica Torres specializes in House and Condo
      const card = screen.getByTestId('agent-card-a1');
      expect(within(card).getByText('House')).toBeInTheDocument();
      expect(within(card).getByText('Condo')).toBeInTheDocument();
    });

    test('opens agent profile panel', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      const viewProfileButtons = screen.getAllByText('View Profile');
      fireEvent.click(viewProfileButtons[0]);
      expect(screen.getByTestId('agent-profile-panel')).toBeInTheDocument();
      expect(screen.getByText('Agent Profile')).toBeInTheDocument();
    });

    test('shows agent listings in profile panel', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      const viewProfileButtons = screen.getAllByText('View Profile');
      fireEvent.click(viewProfileButtons[0]); // Jessica Torres
      expect(screen.getByText('Current Listings')).toBeInTheDocument();
      // Jessica Torres has properties p2, p3 (agent a1)
      const panel = screen.getByTestId('agent-profile-panel');
      expect(within(panel).getByText('Spacious Family Home')).toBeInTheDocument();
      expect(within(panel).getByText('Luxury Lakeside Condo')).toBeInTheDocument();
    });

    test('closes agent profile panel', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      const viewProfileButtons = screen.getAllByText('View Profile');
      fireEvent.click(viewProfileButtons[0]);
      fireEvent.click(screen.getByLabelText('Close agent profile'));
      expect(screen.queryByTestId('agent-profile-panel')).not.toBeInTheDocument();
    });

    test('clicking a listing in agent profile opens property detail', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      const viewProfileButtons = screen.getAllByText('View Profile');
      fireEvent.click(viewProfileButtons[0]); // Jessica Torres
      const panel = screen.getByTestId('agent-profile-panel');
      fireEvent.click(within(panel).getByText('Spacious Family Home'));
      // Should navigate to property detail and close agent panel
      expect(screen.queryByTestId('agent-profile-panel')).not.toBeInTheDocument();
      expect(screen.getByText(/Beautiful 4-bedroom family home/)).toBeInTheDocument();
    });
  });

  describe('Market Stats View', () => {
    test('displays market overview stats', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Market Stats'));
      expect(screen.getByText('Total Listings')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Avg Price')).toBeInTheDocument();
      expect(screen.getByText('Avg Size')).toBeInTheDocument();
      expect(screen.getByText('Total Views')).toBeInTheDocument();
      expect(screen.getByText('New This Week')).toBeInTheDocument();
    });

    test('displays listings by property type breakdown', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Market Stats'));
      expect(screen.getByText('Listings by Type')).toBeInTheDocument();
      expect(screen.getByText('House')).toBeInTheDocument();
      expect(screen.getByText('Apartment')).toBeInTheDocument();
      expect(screen.getByText('Condo')).toBeInTheDocument();
    });

    test('displays listings by neighborhood breakdown', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Market Stats'));
      expect(screen.getByText('Listings by Neighborhood')).toBeInTheDocument();
      expect(screen.getByText('Downtown')).toBeInTheDocument();
      expect(screen.getByText('Suburbs')).toBeInTheDocument();
      expect(screen.getByText('Lakeside')).toBeInTheDocument();
    });
  });

  describe('Map View', () => {
    test('renders map container with price markers', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Map View'));
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      expect(screen.getByText(/Showing \d+ properties/)).toBeInTheDocument();
    });

    test('clicking map marker opens property detail', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Map View'));
      const marker = screen.getByLabelText(/View Modern Downtown Loft on map/);
      fireEvent.click(marker);
      expect(screen.getByText(/Stunning open-concept loft/)).toBeInTheDocument();
    });
  });

  describe('List View', () => {
    test('renders properties in list format', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('List View'));
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Spacious Family Home')).toBeInTheDocument();
    });

    test('shows view count in list view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('List View'));
      expect(screen.getByText(/342 views/)).toBeInTheDocument();
    });

    test('can toggle favorite from list view', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('List View'));
      const favButton = screen.getByLabelText('Toggle favorite Modern Downtown Loft');
      fireEvent.click(favButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'propertyFavorites',
        expect.stringContaining('p1')
      );
    });
  });

  describe('Pagination', () => {
    test('shows pagination when enough results', () => {
      render(<PropertyMarketplace />);
      // Default 6 items per page with 10 properties = 2 pages
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });

    test('navigates to next page', () => {
      render(<PropertyMarketplace />);
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      // Should show remaining properties on page 2
      expect(screen.getByText(/Midtown Micro-Apartment|Garden District Bungalow/)).toBeInTheDocument();
    });

    test('previous button is disabled on first page', () => {
      render(<PropertyMarketplace />);
      const prevButton = screen.getByText('Previous');
      expect(prevButton.disabled).toBe(true);
    });

    test('resets page when filter changes', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Next'));
      const typeSelect = screen.getByLabelText('Filter by property type');
      fireEvent.change(typeSelect, { target: { value: 'apartment' } });
      // Should reset to page 1 when filter changes
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    test('toggles dark mode', () => {
      render(<PropertyMarketplace />);
      const toggleButton = screen.getByLabelText('Toggle theme');
      expect(toggleButton.textContent).toContain('Dark Mode');
      fireEvent.click(toggleButton);
      expect(toggleButton.textContent).toContain('Light Mode');
    });

    test('persists dark mode to localStorage', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('propertyTheme', 'dark');
    });
  });

  describe('Sidebar', () => {
    test('collapses and expands sidebar', () => {
      render(<PropertyMarketplace />);
      expect(screen.getByText(/HomeFind/)).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      // When collapsed, HomeFind text should not be visible
      expect(screen.queryByText(/HomeFind/)).not.toBeInTheDocument();
    });

    test('shows recently viewed in sidebar after viewing property', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText(/Back to listings/));
      expect(screen.getByText('Recently Viewed')).toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('saves favorites to localStorage', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle favorite Modern Downtown Loft'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'propertyFavorites',
        expect.stringContaining('p1')
      );
    });

    test('saves comparison list to localStorage', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle compare Modern Downtown Loft'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'propertyComparison',
        expect.stringContaining('p1')
      );
    });

    test('saves recently viewed to localStorage', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'propertyRecentlyViewed',
        expect.stringContaining('p1')
      );
    });

    test('saves theme to localStorage', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('propertyTheme', 'dark');
    });
  });

  describe('Cross-Feature Interactions', () => {
    test('filter changes preserve favorites', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle favorite Modern Downtown Loft'));
      const typeSelect = screen.getByLabelText('Filter by property type');
      fireEvent.change(typeSelect, { target: { value: 'house' } });
      fireEvent.change(typeSelect, { target: { value: 'all' } });
      // Favorite should still be set
      fireEvent.click(screen.getByText('Favorites'));
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });

    test('view switching preserves search query', () => {
      render(<PropertyMarketplace />);
      const input = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(input, { target: { value: 'Downtown' } });
      fireEvent.click(screen.getByText('List View'));
      expect(input.value).toBe('Downtown');
    });

    test('view switching preserves comparison list', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByLabelText('Toggle compare Modern Downtown Loft'));
      fireEvent.click(screen.getByText('List View'));
      expect(screen.getByText(/Compare \(1\)/)).toBeInTheDocument();
    });

    test('search resets pagination to page 1', () => {
      render(<PropertyMarketplace />);
      fireEvent.click(screen.getByText('Next'));
      const input = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(input, { target: { value: 'Modern' } });
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });
  });
});
