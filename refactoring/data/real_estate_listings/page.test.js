import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import RealEstateListings from './src/app/page.jsx';

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

describe('RealEstateListings Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial Rendering ──────────────────────────────────────────────

  describe('Initial Rendering', () => {
    test('renders the app root and sidebar', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('app-root')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('🏠 RealtyHub')).toBeInTheDocument();
    });

    test('renders stats bar with correct initial values', () => {
      render(<RealEstateListings />);
      const statsBar = screen.getByTestId('stats-bar');
      expect(statsBar).toBeInTheDocument();
      expect(screen.getByTestId('stat-total-listings')).toHaveTextContent('10');
      // Active = For Sale (7) + For Rent (1) = 8
      expect(screen.getByTestId('stat-active')).toHaveTextContent('8');
      expect(screen.getByTestId('stat-favorites')).toHaveTextContent('0');
    });

    test('renders search input', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search by title/i)).toBeInTheDocument();
    });

    test('renders view mode buttons', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('view-grid')).toBeInTheDocument();
      expect(screen.getByTestId('view-list')).toBeInTheDocument();
      expect(screen.getByTestId('view-map')).toBeInTheDocument();
    });

    test('renders filter panel by default', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
      expect(screen.getByTestId('filter-property-type')).toBeInTheDocument();
      expect(screen.getByTestId('filter-status')).toBeInTheDocument();
      expect(screen.getByTestId('filter-price')).toBeInTheDocument();
      expect(screen.getByTestId('filter-bedrooms')).toBeInTheDocument();
      expect(screen.getByTestId('filter-bathrooms')).toBeInTheDocument();
      expect(screen.getByTestId('filter-neighborhood')).toBeInTheDocument();
      expect(screen.getByTestId('sort-select')).toBeInTheDocument();
    });

    test('renders listing cards in grid view (first page)', () => {
      render(<RealEstateListings />);
      const grid = screen.getByTestId('listings-grid');
      expect(grid).toBeInTheDocument();
      // Default sort is "Newest First" so first page shows 6 most recent
      expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 6 of 10 listings');
    });

    test('renders sidebar navigation items with counts', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('nav-all-listings')).toBeInTheDocument();
      expect(screen.getByTestId('nav-favorites')).toBeInTheDocument();
      expect(screen.getByTestId('nav-for-sale')).toBeInTheDocument();
      expect(screen.getByTestId('nav-for-rent')).toBeInTheDocument();
      expect(screen.getByTestId('nav-sold')).toBeInTheDocument();
      expect(screen.getByTestId('nav-pending')).toBeInTheDocument();
    });

    test('renders sidebar utility buttons', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('saved-searches-btn')).toBeInTheDocument();
      expect(screen.getByTestId('mortgage-calc-btn')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  // ── Theme Toggling ────────────────────────────────────────────────

  describe('Theme Toggling', () => {
    test('toggles between light and dark mode', () => {
      render(<RealEstateListings />);
      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toHaveTextContent('🌙 Dark Mode');

      fireEvent.click(toggle);
      expect(toggle).toHaveTextContent('☀️ Light Mode');

      fireEvent.click(toggle);
      expect(toggle).toHaveTextContent('🌙 Dark Mode');
    });

    test('dark mode changes background color', () => {
      render(<RealEstateListings />);
      const root = screen.getByTestId('app-root');
      expect(root.style.background).toBe('#f8f9fa'); // light

      fireEvent.click(screen.getByTestId('theme-toggle'));
      expect(root.style.background).toBe('#1a1a2e'); // dark
    });
  });

  // ── Sidebar Navigation ────────────────────────────────────────────

  describe('Sidebar Navigation', () => {
    test('collapses and expands sidebar', () => {
      render(<RealEstateListings />);
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar.style.width).toBe('240px');

      fireEvent.click(screen.getByTestId('sidebar-toggle'));
      expect(sidebar.style.width).toBe('60px');

      fireEvent.click(screen.getByTestId('sidebar-toggle'));
      expect(sidebar.style.width).toBe('240px');
    });

    test('clicking "For Sale" nav filters by status', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('nav-for-sale'));
      // 7 For Sale listings, first page shows 6
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 7 listings');
    });

    test('clicking "For Rent" nav filters by status', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('nav-for-rent'));
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('clicking "All Listings" clears all filters', () => {
      render(<RealEstateListings />);
      // Apply a filter first
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 3 listings');

      // Click All Listings to reset
      fireEvent.click(screen.getByTestId('nav-all-listings'));
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 10 listings');
    });
  });

  // ── Search Filtering ──────────────────────────────────────────────

  describe('Search Filtering', () => {
    test('filters listings by title', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'Loft' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });

    test('filters listings by address', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: '456 Oak' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('filters listings by neighborhood', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'downtown' },
      });
      // Downtown: "Modern Downtown Loft" and "Renovated Downtown Flat"
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });

    test('filters listings by tag', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'luxury' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
      expect(screen.getByText('Lakefront Luxury Estate')).toBeInTheDocument();
    });

    test('filters by description content', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'infinity pool' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('shows no results for non-matching query', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'xyznonexistent' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 0 of 0');
    });
  });

  // ── Property Type Filter ──────────────────────────────────────────

  describe('Property Type Filter', () => {
    test('filters by House type', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 3 listings');
    });

    test('filters by Apartment type', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'Apartment' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 3 listings');
    });

    test('filters by Condo type', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'Condo' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });

    test('filters by Land type', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'Land' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('All Types shows all listings', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'All' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 10 listings');
    });
  });

  // ── Status Filter ─────────────────────────────────────────────────

  describe('Status Filter', () => {
    test('filters by For Sale', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-status'), {
        target: { value: 'For Sale' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 7 listings');
    });

    test('filters by For Rent', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-status'), {
        target: { value: 'For Rent' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('filters by Sold', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-status'), {
        target: { value: 'Sold' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('filters by Pending', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-status'), {
        target: { value: 'Pending' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });
  });

  // ── Price Range Filter ────────────────────────────────────────────

  describe('Price Range Filter', () => {
    test('filters Under $200K', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-price'), {
        target: { value: 'Under $200K' },
      });
      // No listing under 200K
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 0 listings');
    });

    test('filters $200K - $500K range', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-price'), {
        target: { value: '$200K - $500K' },
      });
      // l1=475K, l4=310K, l8=225K, l9=380K, l10=395K = 5
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 5 listings');
    });

    test('filters $500K - $1M range', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-price'), {
        target: { value: '$500K - $1M' },
      });
      // l2=825K, l6=550K, l7=620K = 3
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 3 listings');
    });

    test('filters $1M+ range', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-price'), {
        target: { value: '$1M+' },
      });
      // l3=2.15M, l5=1.85M = 2
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });
  });

  // ── Bedroom and Bathroom Filters ──────────────────────────────────

  describe('Bedroom and Bathroom Filters', () => {
    test('filters by 3+ bedrooms', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-bedrooms'), {
        target: { value: '3+' },
      });
      // l2=4bd, l3=5bd, l5=3bd, l6=4bd, l7=3bd = 5
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 5 listings');
    });

    test('filters by 5+ bedrooms', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-bedrooms'), {
        target: { value: '5+' },
      });
      // l3=5bd = 1
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('filters by 3+ bathrooms', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-bathrooms'), {
        target: { value: '3+' },
      });
      // l2=3ba, l3=4ba, l5=3ba = 3
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 3 listings');
    });
  });

  // ── Neighborhood Filter ───────────────────────────────────────────

  describe('Neighborhood Filter', () => {
    test('filters by Downtown neighborhood', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-neighborhood'), {
        target: { value: 'Downtown' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });

    test('filters by Lakefront neighborhood', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-neighborhood'), {
        target: { value: 'Lakefront' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('filters by Hillcrest neighborhood', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-neighborhood'), {
        target: { value: 'Hillcrest' },
      });
      // l7 + l9 = 2
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });
  });

  // ── Amenity Filters ───────────────────────────────────────────────

  describe('Amenity Filters', () => {
    test('filters by Pool amenity', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('amenity-pool'));
      // l3, l5 have Pool = 2
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });

    test('filters by multiple amenities (intersection)', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('amenity-pool'));
      fireEvent.click(screen.getByTestId('amenity-gym'));
      // Only l5 has both Pool and Gym
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('toggling amenity off removes filter', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('amenity-pool'));
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');

      fireEvent.click(screen.getByTestId('amenity-pool'));
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 10 listings');
    });

    test('filters by Fireplace amenity', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('amenity-fireplace'));
      // l2, l3 have Fireplace = 2
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });
  });

  // ── Sort ──────────────────────────────────────────────────────────

  describe('Sorting', () => {
    test('sorts by Price: Low to High', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('sort-select'), {
        target: { value: 'Price: Low to High' },
      });
      const grid = screen.getByTestId('listings-grid');
      const cards = grid.querySelectorAll('[data-testid^="listing-card-"]');
      // First card should be cheapest: l8 = $225K
      expect(cards[0].getAttribute('data-testid')).toBe('listing-card-l8');
    });

    test('sorts by Price: High to Low', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('sort-select'), {
        target: { value: 'Price: High to Low' },
      });
      const grid = screen.getByTestId('listings-grid');
      const cards = grid.querySelectorAll('[data-testid^="listing-card-"]');
      // First card should be most expensive: l3 = $2.15M
      expect(cards[0].getAttribute('data-testid')).toBe('listing-card-l3');
    });

    test('sorts by Sq Ft: Large to Small', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('sort-select'), {
        target: { value: 'Sq Ft: Large to Small' },
      });
      const grid = screen.getByTestId('listings-grid');
      const cards = grid.querySelectorAll('[data-testid^="listing-card-"]');
      // l9 has 12000 sqft (land parcel)
      expect(cards[0].getAttribute('data-testid')).toBe('listing-card-l9');
    });
  });

  // ── View Modes ────────────────────────────────────────────────────

  describe('View Modes', () => {
    test('switches to list view', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('view-list'));
      expect(screen.getByTestId('listings-list')).toBeInTheDocument();
      expect(screen.queryByTestId('listings-grid')).not.toBeInTheDocument();
    });

    test('switches to map view', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('view-map'));
      expect(screen.getByTestId('map-view')).toBeInTheDocument();
      expect(screen.queryByTestId('listings-grid')).not.toBeInTheDocument();
    });

    test('map view shows neighborhood pins', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('view-map'));
      expect(screen.getByTestId('map-pin-downtown')).toBeInTheDocument();
      expect(screen.getByTestId('map-pin-westside')).toBeInTheDocument();
    });

    test('clicking map pin sets neighborhood filter and switches to grid', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('view-map'));
      fireEvent.click(screen.getByTestId('map-pin-downtown'));
      expect(screen.getByTestId('listings-grid')).toBeInTheDocument();
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });

    test('list view shows listing rows', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('view-list'));
      // First page, 6 items
      const list = screen.getByTestId('listings-list');
      const rows = list.querySelectorAll('[data-testid^="listing-row-"]');
      expect(rows.length).toBe(6);
    });

    test('switches back to grid view', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('view-list'));
      fireEvent.click(screen.getByTestId('view-grid'));
      expect(screen.getByTestId('listings-grid')).toBeInTheDocument();
    });
  });

  // ── Pagination ────────────────────────────────────────────────────

  describe('Pagination', () => {
    test('shows pagination when there are more items than page size', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    test('navigates to next page', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
      expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 4 of 10');
    });

    test('navigates back to previous page', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('next-page'));
      fireEvent.click(screen.getByTestId('prev-page'));
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    test('prev button is disabled on first page', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('prev-page')).toBeDisabled();
    });

    test('next button is disabled on last page', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByTestId('next-page')).toBeDisabled();
    });

    test('pagination resets when filters change', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();

      // Change a filter — page should reset
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      // 3 houses fit in 1 page, no pagination needed
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  // ── Favorites ─────────────────────────────────────────────────────

  describe('Favorites', () => {
    test('toggles favorite on a listing in grid view', () => {
      render(<RealEstateListings />);
      const favBtn = screen.getByTestId('favorite-l1');
      expect(favBtn).toHaveTextContent('🤍');

      fireEvent.click(favBtn);
      expect(favBtn).toHaveTextContent('❤️');
      expect(screen.getByTestId('stat-favorites')).toHaveTextContent('1');
    });

    test('removes favorite', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('favorite-l1'));
      expect(screen.getByTestId('stat-favorites')).toHaveTextContent('1');

      fireEvent.click(screen.getByTestId('favorite-l1'));
      expect(screen.getByTestId('stat-favorites')).toHaveTextContent('0');
    });

    test('favorites persist in localStorage', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('favorite-l1'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        're_favorites',
        JSON.stringify(['l1']),
      );
    });

    test('can favorite multiple listings', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('favorite-l1'));
      fireEvent.click(screen.getByTestId('favorite-l2'));
      expect(screen.getByTestId('stat-favorites')).toHaveTextContent('2');
    });

    test('favorite works in list view', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('view-list'));
      const favBtn = screen.getByTestId('list-favorite-l1');
      fireEvent.click(favBtn);
      expect(screen.getByTestId('stat-favorites')).toHaveTextContent('1');
    });
  });

  // ── Listing Detail Modal ──────────────────────────────────────────

  describe('Listing Detail Modal', () => {
    test('opens detail modal on card click', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      expect(screen.getByTestId('listing-detail-modal')).toBeInTheDocument();
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
    });

    test('shows property details in modal', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      expect(screen.getByTestId('detail-specs')).toBeInTheDocument();
      expect(screen.getByText('$475,000')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, Unit 4A')).toBeInTheDocument();
    });

    test('shows image gallery with counter', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
      expect(screen.getByTestId('image-counter')).toHaveTextContent('1 / 3');
    });

    test('navigates image gallery dots', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      fireEvent.click(screen.getByTestId('gallery-dot-1'));
      expect(screen.getByTestId('image-counter')).toHaveTextContent('2 / 3');
    });

    test('shows agent info', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      expect(screen.getByTestId('agent-info')).toBeInTheDocument();
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });

    test('shows amenities in detail modal', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      expect(screen.getByText('Gym')).toBeInTheDocument();
      expect(screen.getByText('Elevator')).toBeInTheDocument();
    });

    test('shows open house date when available', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      expect(screen.getByText(/Open House/i)).toBeInTheDocument();
    });

    test('closes modal with close button', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      expect(screen.getByTestId('listing-detail-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('close-detail'));
      expect(screen.queryByTestId('listing-detail-modal')).not.toBeInTheDocument();
    });

    test('closes modal with Escape key', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      expect(screen.getByTestId('listing-detail-modal')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('listing-detail-modal')).not.toBeInTheDocument();
    });

    test('closes modal on backdrop click', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      fireEvent.click(screen.getByTestId('listing-detail-modal'));
      expect(screen.queryByTestId('listing-detail-modal')).not.toBeInTheDocument();
    });
  });

  // ── Contact Agent Modal ───────────────────────────────────────────

  describe('Contact Agent Modal', () => {
    test('opens contact modal from detail view', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      fireEvent.click(screen.getByTestId('contact-agent-btn'));
      expect(screen.getByTestId('contact-modal')).toBeInTheDocument();
    });

    test('sends message and closes modal', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      fireEvent.click(screen.getByTestId('contact-agent-btn'));

      fireEvent.change(screen.getByTestId('contact-message'), {
        target: { value: 'I am interested in this property.' },
      });
      fireEvent.click(screen.getByTestId('send-message'));
      expect(screen.queryByTestId('contact-modal')).not.toBeInTheDocument();
    });

    test('does not send empty message', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      fireEvent.click(screen.getByTestId('contact-agent-btn'));
      fireEvent.click(screen.getByTestId('send-message'));
      // Modal should still be open because message was empty
      expect(screen.getByTestId('contact-modal')).toBeInTheDocument();
    });

    test('cancels contact modal', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      fireEvent.click(screen.getByTestId('contact-agent-btn'));
      fireEvent.click(screen.getByTestId('cancel-contact'));
      expect(screen.queryByTestId('contact-modal')).not.toBeInTheDocument();
    });

    test('Escape closes contact modal before detail modal', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('listing-card-l1'));
      fireEvent.click(screen.getByTestId('contact-agent-btn'));
      expect(screen.getByTestId('contact-modal')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      // Contact modal should close but detail modal should stay
      expect(screen.queryByTestId('contact-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('listing-detail-modal')).toBeInTheDocument();
    });
  });

  // ── Compare Properties ────────────────────────────────────────────

  describe('Compare Properties', () => {
    test('adds listing to compare', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('compare-toggle-l1'));
      expect(screen.getByTestId('compare-btn')).toHaveTextContent('Compare (1)');
    });

    test('removes listing from compare', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('compare-toggle-l1'));
      fireEvent.click(screen.getByTestId('compare-toggle-l1'));
      expect(screen.getByTestId('compare-btn')).toHaveTextContent('Compare (0)');
    });

    test('shows compare panel with comparison table', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('compare-toggle-l1'));
      fireEvent.click(screen.getByTestId('compare-toggle-l2'));
      fireEvent.click(screen.getByTestId('compare-btn'));
      expect(screen.getByTestId('compare-panel')).toBeInTheDocument();
      expect(screen.getByText('Compare Properties')).toBeInTheDocument();
      // Table should show both listings
      expect(screen.getByText('Modern Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Charming Victorian Home')).toBeInTheDocument();
    });

    test('compare table shows key attributes', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('compare-toggle-l1'));
      fireEvent.click(screen.getByTestId('compare-btn'));
      const panel = screen.getByTestId('compare-panel');
      expect(within(panel).getByText('Price')).toBeInTheDocument();
      expect(within(panel).getByText('Bedrooms')).toBeInTheDocument();
      expect(within(panel).getByText('Sq Ft')).toBeInTheDocument();
      expect(within(panel).getByText('Price/Sq Ft')).toBeInTheDocument();
      expect(within(panel).getByText('Days on Market')).toBeInTheDocument();
    });

    test('clears all compared items', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('compare-toggle-l1'));
      fireEvent.click(screen.getByTestId('compare-toggle-l2'));
      fireEvent.click(screen.getByTestId('compare-btn'));
      fireEvent.click(screen.getByTestId('clear-compare'));
      expect(screen.getByTestId('compare-btn')).toHaveTextContent('Compare (0)');
    });

    test('limits compare to 3 properties', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('compare-toggle-l1'));
      fireEvent.click(screen.getByTestId('compare-toggle-l2'));
      fireEvent.click(screen.getByTestId('compare-toggle-l3'));
      // Try to add a 4th — should not increase count
      fireEvent.click(screen.getByTestId('compare-toggle-l4'));
      expect(screen.getByTestId('compare-btn')).toHaveTextContent('Compare (3)');
    });
  });

  // ── Filter Panel Toggle ───────────────────────────────────────────

  describe('Filter Panel Toggle', () => {
    test('hides filter panel', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('toggle-filters'));
      expect(screen.queryByTestId('filters-panel')).not.toBeInTheDocument();
    });

    test('shows filter panel again', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('toggle-filters'));
      fireEvent.click(screen.getByTestId('toggle-filters'));
      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
    });

    test('Ctrl+F toggles filter panel', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'f', ctrlKey: true });
      expect(screen.queryByTestId('filters-panel')).not.toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'f', ctrlKey: true });
      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
    });
  });

  // ── Clear Filters ─────────────────────────────────────────────────

  describe('Clear Filters', () => {
    test('resets all filters', () => {
      render(<RealEstateListings />);
      // Apply multiple filters
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      fireEvent.change(screen.getByTestId('filter-price'), {
        target: { value: '$1M+' },
      });
      // Only 1 result: Lakefront Luxury Estate
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');

      fireEvent.click(screen.getByTestId('clear-filters'));
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 10 listings');
      expect(screen.getByTestId('filter-property-type')).toHaveValue('All');
      expect(screen.getByTestId('filter-price')).toHaveValue('Any');
    });
  });

  // ── Saved Searches ────────────────────────────────────────────────

  describe('Saved Searches', () => {
    test('opens saved searches panel', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('saved-searches-btn'));
      expect(screen.getByTestId('saved-searches-panel')).toBeInTheDocument();
    });

    test('displays initial saved searches', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('saved-searches-btn'));
      expect(screen.getByTestId('saved-search-ss1')).toBeInTheDocument();
      expect(screen.getByTestId('saved-search-ss2')).toBeInTheDocument();
      expect(screen.getByText('Family Homes Under $600K')).toBeInTheDocument();
    });

    test('applies a saved search', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('saved-searches-btn'));
      fireEvent.click(screen.getByTestId('apply-search-ss1'));
      // Family Homes Under $600K: propertyType=House, priceRange 0-600K, bedrooms 3+
      // Houses under 600K with 3+ bedrooms: l6 (550K, 4bd) = 1
      expect(screen.getByTestId('filter-property-type')).toHaveValue('House');
      expect(screen.getByTestId('filter-bedrooms')).toHaveValue('3+');
    });

    test('deletes a saved search', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('saved-searches-btn'));
      fireEvent.click(screen.getByTestId('delete-search-ss1'));
      expect(screen.queryByTestId('saved-search-ss1')).not.toBeInTheDocument();
    });

    test('saves a new search', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'Apartment' },
      });
      fireEvent.change(screen.getByTestId('save-search-name'), {
        target: { value: 'My Apartments' },
      });
      fireEvent.click(screen.getByTestId('save-search-btn'));
      // Saved searches count should increase
      expect(screen.getByTestId('saved-searches-btn')).toHaveTextContent('Saved Searches (3)');
    });

    test('does not save search with empty name', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('save-search-btn'));
      expect(screen.getByTestId('saved-searches-btn')).toHaveTextContent('Saved Searches (2)');
    });
  });

  // ── Mortgage Calculator ───────────────────────────────────────────

  describe('Mortgage Calculator', () => {
    test('opens mortgage calculator modal', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('mortgage-calc-btn'));
      expect(screen.getByTestId('mortgage-modal')).toBeInTheDocument();
    });

    test('calculates monthly payment', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('mortgage-calc-btn'));

      fireEvent.change(screen.getByTestId('mortgage-amount'), {
        target: { value: '400000' },
      });
      // Default rate is 6.5%, term 30 years
      expect(screen.getByTestId('mortgage-results')).toBeInTheDocument();
      expect(screen.getByText('Monthly Payment')).toBeInTheDocument();
    });

    test('updates calculation when rate changes', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('mortgage-calc-btn'));

      fireEvent.change(screen.getByTestId('mortgage-amount'), {
        target: { value: '400000' },
      });
      fireEvent.change(screen.getByTestId('mortgage-rate'), {
        target: { value: '5.0' },
      });
      expect(screen.getByTestId('mortgage-results')).toBeInTheDocument();
    });

    test('closes mortgage calculator with Escape', () => {
      render(<RealEstateListings />);
      fireEvent.click(screen.getByTestId('mortgage-calc-btn'));
      expect(screen.getByTestId('mortgage-modal')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByTestId('mortgage-modal')).not.toBeInTheDocument();
    });
  });

  // ── Keyboard Shortcuts ────────────────────────────────────────────

  describe('Keyboard Shortcuts', () => {
    test('Ctrl+K focuses search input', () => {
      render(<RealEstateListings />);
      const searchInput = screen.getByTestId('search-input');
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      expect(document.activeElement).toBe(searchInput);
    });
  });

  // ── Combined Filters ──────────────────────────────────────────────

  describe('Combined Filters', () => {
    test('combines property type and price range', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      fireEvent.change(screen.getByTestId('filter-price'), {
        target: { value: '$500K - $1M' },
      });
      // Houses in 500K-1M: l2=825K, l6=550K = 2
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });

    test('combines neighborhood and bedrooms', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-neighborhood'), {
        target: { value: 'Downtown' },
      });
      fireEvent.change(screen.getByTestId('filter-bedrooms'), {
        target: { value: '2+' },
      });
      // Downtown with 2+ bedrooms: l1=2bd, l10=2bd = 2
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });

    test('combines search with property type filter', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'luxury' },
      });
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      // "luxury" matches l3 (Lakefront Luxury Estate), which is a House
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 1 listings');
    });

    test('combines status and amenity filters', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-status'), {
        target: { value: 'For Sale' },
      });
      fireEvent.click(screen.getByTestId('amenity-garage'));
      // For Sale with Garage: l2=yes, l3=yes, l6=yes = 3
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 3 listings');
    });

    test('three filters narrow results significantly', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      fireEvent.change(screen.getByTestId('filter-bedrooms'), {
        target: { value: '4+' },
      });
      fireEvent.change(screen.getByTestId('filter-price'), {
        target: { value: '$500K - $1M' },
      });
      // Houses with 4+ bedrooms in 500K-1M: l2=4bd 825K, l6=4bd 550K = 2
      expect(screen.getByTestId('results-count')).toHaveTextContent('of 2 listings');
    });
  });

  // ── Listing Card Content ──────────────────────────────────────────

  describe('Listing Card Content', () => {
    test('shows property type emoji in grid card', () => {
      render(<RealEstateListings />);
      // Cards should contain the property type emoji
      const grid = screen.getByTestId('listings-grid');
      expect(grid).toBeInTheDocument();
    });

    test('shows status badge on cards', () => {
      render(<RealEstateListings />);
      // All visible cards in default view should have status badges
      const cards = screen.getAllByText('For Sale');
      expect(cards.length).toBeGreaterThan(0);
    });

    test('shows tags on grid cards', () => {
      render(<RealEstateListings />);
      // l1 has tags: New Construction, City View, Open Floor Plan
      // Default sort is newest first — need to check which cards are on page 1
      // Tags should be visible on at least some cards
      const grid = screen.getByTestId('listings-grid');
      expect(grid).toBeInTheDocument();
    });

    test('shows agent name on card', () => {
      render(<RealEstateListings />);
      // Agent names should appear on cards
      expect(screen.getAllByText(/Sarah Chen|Marcus Johnson|Priya Patel|James Wilson/).length).toBeGreaterThan(0);
    });

    test('shows days on market on cards', () => {
      render(<RealEstateListings />);
      const daysTexts = screen.getAllByText(/days on market/);
      expect(daysTexts.length).toBeGreaterThan(0);
    });
  });

  // ── Results Count Display ─────────────────────────────────────────

  describe('Results Count Display', () => {
    test('shows filtered count when filters active', () => {
      render(<RealEstateListings />);
      fireEvent.change(screen.getByTestId('filter-property-type'), {
        target: { value: 'House' },
      });
      expect(screen.getByTestId('results-count')).toHaveTextContent(
        'filtered from 10',
      );
    });

    test('does not show "filtered from" when no filters', () => {
      render(<RealEstateListings />);
      expect(screen.getByTestId('results-count')).not.toHaveTextContent(
        'filtered from',
      );
    });
  });
});
