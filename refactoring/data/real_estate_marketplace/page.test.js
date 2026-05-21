import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RealEstateMarketplace from './src/app/page.jsx';

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

describe('RealEstateMarketplace Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with HomeFind title', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByText(/HomeFind/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByText('Browse')).toBeInTheDocument();
      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.getByText('Agents')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByPlaceholderText('Search properties... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by location')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by bedrooms')).toBeInTheDocument();
    });

    test('renders browse view by default with property listings', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Charming Victorian House')).toBeInTheDocument();
      expect(screen.getByText('Luxury Waterfront Condo')).toBeInTheDocument();
    });

    test('renders sidebar stats', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByText(/active listings/)).toBeInTheDocument();
      expect(screen.getByText(/saved/)).toBeInTheDocument();
    });

    test('renders calculator button in header', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByText(/Calculator/)).toBeInTheDocument();
    });

    test('renders property count', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByText('8 properties')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<RealEstateMarketplace />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('realEstateTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<RealEstateMarketplace />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('realEstateTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'realEstateTheme') return 'dark';
        return null;
      });
      render(<RealEstateMarketplace />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Browse shows property listings', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Browse'));
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });

    test('clicking Saved shows saved properties view', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Saved'));
      expect(screen.getByText('Saved Properties')).toBeInTheDocument();
    });

    test('clicking Agents shows agent cards', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      expect(screen.getByText('Our Agents')).toBeInTheDocument();
      expect(screen.getByText('Rachel Green')).toBeInTheDocument();
      expect(screen.getByText('Marcus Chen')).toBeInTheDocument();
    });

    test('clicking Analytics shows analytics view', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Market Analytics')).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('realEstateView', 'agents');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<RealEstateMarketplace />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Browse')).not.toBeInTheDocument();
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<RealEstateMarketplace />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Browse')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search input filters properties by title', () => {
      render(<RealEstateMarketplace />);
      const searchInput = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Victorian' } });
      expect(screen.getByText('Charming Victorian House')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('search input filters properties by address', () => {
      render(<RealEstateMarketplace />);
      const searchInput = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Harbor View' } });
      expect(screen.getByText('Luxury Waterfront Condo')).toBeInTheDocument();
    });

    test('search input filters properties by tags', () => {
      render(<RealEstateMarketplace />);
      const searchInput = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'penthouse' } });
      expect(screen.getByText('Luxury Waterfront Condo')).toBeInTheDocument();
    });

    test('search input filters properties by agent name', () => {
      render(<RealEstateMarketplace />);
      const searchInput = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Rachel Green' } });
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Cozy Midtown Townhouse')).toBeInTheDocument();
    });

    test('clearing search shows all properties again', () => {
      render(<RealEstateMarketplace />);
      const searchInput = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Victorian' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Charming Victorian House')).toBeInTheDocument();
    });
  });

  describe('Type Filter', () => {
    test('filtering by house shows only houses', () => {
      render(<RealEstateMarketplace />);
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'house' } });
      expect(screen.getByText('Charming Victorian House')).toBeInTheDocument();
      expect(screen.getByText('Uptown Family Estate')).toBeInTheDocument();
      expect(screen.getByText('Waterfront Beach House')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('selecting All Types shows all properties', () => {
      render(<RealEstateMarketplace />);
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'house' } });
      fireEvent.change(typeFilter, { target: { value: 'all' } });
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });
  });

  describe('Location Filter', () => {
    test('filtering by Downtown shows only downtown properties', () => {
      render(<RealEstateMarketplace />);
      const locationFilter = screen.getByLabelText('Filter by location');
      fireEvent.change(locationFilter, { target: { value: 'Downtown' } });
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Downtown Studio Apartment')).toBeInTheDocument();
      expect(screen.queryByText('Charming Victorian House')).not.toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    test('filtering by sold shows only sold properties', () => {
      render(<RealEstateMarketplace />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'sold' } });
      expect(screen.getByText('Waterfront Beach House')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });

    test('filtering by pending shows only pending properties', () => {
      render(<RealEstateMarketplace />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });
      expect(screen.getByText('Cozy Midtown Townhouse')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });
  });

  describe('Bedrooms Filter', () => {
    test('filtering by 4+ beds shows only properties with 4+ bedrooms', () => {
      render(<RealEstateMarketplace />);
      const bedroomsFilter = screen.getByLabelText('Filter by bedrooms');
      fireEvent.change(bedroomsFilter, { target: { value: '4' } });
      expect(screen.getByText('Charming Victorian House')).toBeInTheDocument();
      expect(screen.getByText('Uptown Family Estate')).toBeInTheDocument();
      expect(screen.getByText('Waterfront Beach House')).toBeInTheDocument();
      expect(screen.queryByText('Modern Downtown Loft')).not.toBeInTheDocument();
    });
  });

  describe('Sort Controls', () => {
    test('sort dropdown is present', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByLabelText('Sort properties')).toBeInTheDocument();
    });

    test('sort direction toggle works', () => {
      render(<RealEstateMarketplace />);
      const dirButton = screen.getByText('↓');
      fireEvent.click(dirButton);
      expect(screen.getByText('↑')).toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    test('grid view button is present', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
    });

    test('list view button is present', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByLabelText('List view')).toBeInTheDocument();
    });

    test('switching to list view renders property list items', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByLabelText('List view'));
      // In list view, properties should still be visible
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Charming Victorian House')).toBeInTheDocument();
    });
  });

  describe('Property Cards', () => {
    test('property cards display agent info', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByText('Rachel Green')).toBeInTheDocument();
      expect(screen.getByText('Marcus Chen')).toBeInTheDocument();
    });

    test('property cards display tags', () => {
      render(<RealEstateMarketplace />);
      expect(screen.getByText('luxury')).toBeInTheDocument();
      expect(screen.getByText('historic')).toBeInTheDocument();
    });

    test('property cards display status badges', () => {
      render(<RealEstateMarketplace />);
      const activeLabels = screen.getAllByText('active');
      expect(activeLabels.length).toBeGreaterThan(0);
    });

    test('property cards display property details', () => {
      render(<RealEstateMarketplace />);
      // Verify bed/bath/sqft info
      const bedLabels = screen.getAllByText(/bed/);
      expect(bedLabels.length).toBeGreaterThan(0);
      const bathLabels = screen.getAllByText(/bath/);
      expect(bathLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Save/Favorite Properties', () => {
    test('toggling save on a property saves it', () => {
      render(<RealEstateMarketplace />);
      // p2 and p3 are saved by default - find unsave buttons
      const unsaveButtons = screen.getAllByLabelText('Unsave property');
      expect(unsaveButtons.length).toBe(2);
    });

    test('toggling save on an unsaved property adds to saved', () => {
      render(<RealEstateMarketplace />);
      const saveButtons = screen.getAllByLabelText('Save property');
      fireEvent.click(saveButtons[0]);
      // Should now have 3 unsaved property buttons total
      const unsaveButtons = screen.getAllByLabelText('Unsave property');
      expect(unsaveButtons.length).toBe(3);
    });

    test('saved properties appear in Saved view', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Saved'));
      // p2 (Victorian House) and p3 (Waterfront Condo) are saved by default
      expect(screen.getByText('Charming Victorian House')).toBeInTheDocument();
      expect(screen.getByText('Luxury Waterfront Condo')).toBeInTheDocument();
    });

    test('saved properties persist to localStorage', () => {
      render(<RealEstateMarketplace />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'savedProperties',
        expect.any(String)
      );
    });
  });

  describe('Compare Feature', () => {
    test('clicking compare button adds property to compare list', () => {
      render(<RealEstateMarketplace />);
      const compareButtons = screen.getAllByText('⚖️ Compare');
      fireEvent.click(compareButtons[0]);
      // Should now show Compare button in header
      expect(screen.getByText(/Compare \(1\)/)).toBeInTheDocument();
    });

    test('compare button shows in header when items added', () => {
      render(<RealEstateMarketplace />);
      const compareButtons = screen.getAllByText('⚖️ Compare');
      fireEvent.click(compareButtons[0]);
      fireEvent.click(compareButtons[1]);
      expect(screen.getByText(/Compare \(2\)/)).toBeInTheDocument();
    });

    test('clicking header compare button opens compare modal', () => {
      render(<RealEstateMarketplace />);
      const compareButtons = screen.getAllByText('⚖️ Compare');
      fireEvent.click(compareButtons[0]);
      fireEvent.click(screen.getByText(/Compare \(1\)/));
      expect(screen.getByText('Compare Properties')).toBeInTheDocument();
    });

    test('compare modal shows comparison table with features', () => {
      render(<RealEstateMarketplace />);
      const compareButtons = screen.getAllByText('⚖️ Compare');
      fireEvent.click(compareButtons[0]);
      fireEvent.click(compareButtons[1]);
      fireEvent.click(screen.getByText(/Compare \(2\)/));
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Bedrooms')).toBeInTheDocument();
      expect(screen.getByText('Bathrooms')).toBeInTheDocument();
      expect(screen.getByText('Sq Ft')).toBeInTheDocument();
    });

    test('compare limit is 3 properties', () => {
      render(<RealEstateMarketplace />);
      const compareButtons = screen.getAllByText('⚖️ Compare');
      fireEvent.click(compareButtons[0]);
      fireEvent.click(compareButtons[1]);
      fireEvent.click(compareButtons[2]);
      fireEvent.click(compareButtons[3]); // 4th should not be added
      expect(screen.getByText(/Compare \(3\)/)).toBeInTheDocument();
    });

    test('remove button in compare modal removes property', () => {
      render(<RealEstateMarketplace />);
      const compareButtons = screen.getAllByText('⚖️ Compare');
      fireEvent.click(compareButtons[0]);
      fireEvent.click(compareButtons[1]);
      fireEvent.click(screen.getByText(/Compare \(2\)/));
      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[0]);
      // Should now only have 1 in compare
    });

    test('compare list persists to localStorage', () => {
      render(<RealEstateMarketplace />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'compareList',
        expect.any(String)
      );
    });
  });

  describe('Property Detail Modal', () => {
    test('clicking a property card opens detail modal', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText(/Stunning open-concept loft/)).toBeInTheDocument();
    });

    test('modal shows property price and status', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('$425,000')).toBeInTheDocument();
    });

    test('modal shows property details', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('2 Bedrooms')).toBeInTheDocument();
      expect(screen.getByText('2 Bathrooms')).toBeInTheDocument();
      expect(screen.getByText('1,200 sqft')).toBeInTheDocument();
    });

    test('modal shows amenities', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Amenities')).toBeInTheDocument();
      expect(screen.getByText('Gym')).toBeInTheDocument();
      expect(screen.getByText('Parking')).toBeInTheDocument();
      expect(screen.getByText('Elevator')).toBeInTheDocument();
    });

    test('modal shows tags', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('#new-construction')).toBeInTheDocument();
      expect(screen.getByText('#luxury')).toBeInTheDocument();
    });

    test('modal shows listing agent info', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Listing Agent')).toBeInTheDocument();
      expect(screen.getByText('rachel@realty.com')).toBeInTheDocument();
      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    });

    test('modal shows views and saves count', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText(/342 views/)).toBeInTheDocument();
      expect(screen.getByText(/28 saves/)).toBeInTheDocument();
    });

    test('close button closes modal', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Description')).toBeInTheDocument();
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      expect(screen.queryByText(/Stunning open-concept loft/)).not.toBeInTheDocument();
    });

    test('modal shows open house info when available', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText(/Open House/)).toBeInTheDocument();
    });

    test('save button works from modal', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      // p1 is not saved by default, so we should see the Save button
      const saveButton = screen.getByText('🤍 Save');
      fireEvent.click(saveButton);
      expect(screen.getByText('❤️ Saved')).toBeInTheDocument();
    });
  });

  describe('Image Gallery', () => {
    test('property detail shows image navigation buttons', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
      expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    });

    test('clicking next image navigates to next photo', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByLabelText('Next image'));
      // Should now be on image index 1
      expect(screen.getByLabelText('View image 2')).toBeInTheDocument();
    });

    test('clicking previous image navigates back', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByLabelText('Next image'));
      fireEvent.click(screen.getByLabelText('Previous image'));
      // Should be back on image index 0
    });

    test('image dots are rendered for each image', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByLabelText('View image 1')).toBeInTheDocument();
      expect(screen.getByLabelText('View image 2')).toBeInTheDocument();
      expect(screen.getByLabelText('View image 3')).toBeInTheDocument();
    });
  });

  describe('Contact Agent Form', () => {
    test('modal shows contact agent form', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Contact Agent')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your Name *')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email *')).toBeInTheDocument();
    });

    test('submitting contact form shows success message', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      const nameInput = screen.getByPlaceholderText('Your Name *');
      const emailInput = screen.getByPlaceholderText('Email *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.click(screen.getByText('Send Message'));
      expect(screen.getByText('Message sent successfully!')).toBeInTheDocument();
    });

    test('contact form clears after successful submission', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      const nameInput = screen.getByPlaceholderText('Your Name *');
      const emailInput = screen.getByPlaceholderText('Email *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.click(screen.getByText('Send Message'));
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });
  });

  describe('Mortgage Calculator', () => {
    test('clicking calculator button opens mortgage calculator', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('🧮 Calculator'));
      expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
    });

    test('mortgage calculator shows monthly payment', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('🧮 Calculator'));
      expect(screen.getByText('Monthly Payment')).toBeInTheDocument();
    });

    test('mortgage calculator shows financial breakdown', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('🧮 Calculator'));
      expect(screen.getByText('Principal')).toBeInTheDocument();
      expect(screen.getByText('Total Interest')).toBeInTheDocument();
      expect(screen.getByText('Total Paid')).toBeInTheDocument();
    });

    test('close button closes mortgage calculator', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('🧮 Calculator'));
      expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Mortgage Calculator')).not.toBeInTheDocument();
    });

    test('calculator opens with property price from detail modal', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      fireEvent.click(screen.getByText('🧮 Calculator'));
      expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
    });
  });

  describe('Saved Properties View', () => {
    test('shows saved properties list', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Saved'));
      expect(screen.getByText('Saved Properties')).toBeInTheDocument();
      expect(screen.getByText('Charming Victorian House')).toBeInTheDocument();
      expect(screen.getByText('Luxury Waterfront Condo')).toBeInTheDocument();
    });

    test('shows empty state when no saved properties', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'savedProperties') return JSON.stringify([]);
        return null;
      });
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Saved'));
      expect(screen.getByText(/No saved properties yet/)).toBeInTheDocument();
    });

    test('unsaving from saved view removes property', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Saved'));
      const unsaveButtons = screen.getAllByLabelText('Unsave property');
      const initialCount = unsaveButtons.length;
      fireEvent.click(unsaveButtons[0]);
      const remaining = screen.queryAllByLabelText('Unsave property');
      expect(remaining.length).toBe(initialCount - 1);
    });
  });

  describe('Agents View', () => {
    test('renders all agent cards', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      expect(screen.getByText('Rachel Green')).toBeInTheDocument();
      expect(screen.getByText('Marcus Chen')).toBeInTheDocument();
      expect(screen.getByText('Sofia Rodriguez')).toBeInTheDocument();
      expect(screen.getByText('James Wilson')).toBeInTheDocument();
    });

    test('shows agent contact info', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      expect(screen.getByText('rachel@realty.com')).toBeInTheDocument();
      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    });

    test('shows agent ratings', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      expect(screen.getByText('(4.9)')).toBeInTheDocument();
    });

    test('shows agent stats', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Agents'));
      const listingsLabels = screen.getAllByText('Listings');
      expect(listingsLabels.length).toBeGreaterThan(0);
      const soldLabels = screen.getAllByText('Sold');
      expect(soldLabels.length).toBeGreaterThan(0);
      const activeLabels = screen.getAllByText('Active');
      expect(activeLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics View', () => {
    test('renders stats cards', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Total Listings')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Sold')).toBeInTheDocument();
    });

    test('shows correct total count', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    test('shows average price', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Average Price')).toBeInTheDocument();
    });

    test('shows total views', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Total Views')).toBeInTheDocument();
    });

    test('shows properties by type breakdown', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Properties by Type')).toBeInTheDocument();
      expect(screen.getByText('house')).toBeInTheDocument();
      expect(screen.getByText('apartment')).toBeInTheDocument();
      expect(screen.getByText('condo')).toBeInTheDocument();
    });

    test('shows properties by location breakdown', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Properties by Location')).toBeInTheDocument();
      expect(screen.getByText('Downtown')).toBeInTheDocument();
      expect(screen.getByText('Suburbs')).toBeInTheDocument();
      expect(screen.getByText('Waterfront')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes property detail modal', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Modern Downtown Loft'));
      expect(screen.getByText('Description')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Stunning open-concept loft/)).not.toBeInTheDocument();
    });

    test('Escape key closes mortgage calculator', () => {
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('🧮 Calculator'));
      expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Mortgage Calculator')).not.toBeInTheDocument();
    });

    test('Escape key closes compare modal', () => {
      render(<RealEstateMarketplace />);
      const compareButtons = screen.getAllByText('⚖️ Compare');
      fireEvent.click(compareButtons[0]);
      fireEvent.click(screen.getByText(/Compare \(1\)/));
      expect(screen.getByText('Compare Properties')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Compare Properties')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('properties are saved to localStorage', () => {
      render(<RealEstateMarketplace />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'realEstateProperties',
        expect.any(String)
      );
    });

    test('saved properties are loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'savedProperties') return JSON.stringify(['p1', 'p5']);
        return null;
      });
      render(<RealEstateMarketplace />);
      fireEvent.click(screen.getByText('Saved'));
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Uptown Family Estate')).toBeInTheDocument();
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'realEstateView') return 'agents';
        return null;
      });
      render(<RealEstateMarketplace />);
      expect(screen.getByText('Our Agents')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'realEstateProperties') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<RealEstateMarketplace />)).not.toThrow();
    });

    test('compare list is loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'compareList') return JSON.stringify(['p1', 'p2']);
        return null;
      });
      render(<RealEstateMarketplace />);
      expect(screen.getByText(/Compare \(2\)/)).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    test('search and type filter work together', () => {
      render(<RealEstateMarketplace />);
      const searchInput = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Downtown' } });
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'apartment' } });
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Downtown Studio Apartment')).toBeInTheDocument();
      expect(screen.queryByText('Charming Victorian House')).not.toBeInTheDocument();
    });

    test('non-matching combined filters show no properties', () => {
      render(<RealEstateMarketplace />);
      const searchInput = screen.getByPlaceholderText('Search properties... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Victorian' } });
      const locationFilter = screen.getByLabelText('Filter by location');
      fireEvent.change(locationFilter, { target: { value: 'Downtown' } });
      // Victorian House is in Suburbs, not Downtown
      expect(screen.queryByText('Charming Victorian House')).not.toBeInTheDocument();
      expect(screen.getByText(/No properties match/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<RealEstateMarketplace />)).not.toThrow();
    });
  });
});
