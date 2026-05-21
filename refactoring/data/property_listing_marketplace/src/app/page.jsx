import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PROPERTY_TYPES = ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'];

const PROPERTY_TYPE_LABELS = {
  house: 'House',
  apartment: 'Apartment',
  condo: 'Condo',
  townhouse: 'Townhouse',
  land: 'Land',
  commercial: 'Commercial',
};

const PROPERTY_TYPE_ICONS = {
  house: '\u{1F3E0}',
  apartment: '\u{1F3E2}',
  condo: '\u{1F3E8}',
  townhouse: '\u{1F3D8}\u{FE0F}',
  land: '\u{1F333}',
  commercial: '\u{1F3EC}',
};

const LISTING_STATUS = {
  active: { label: 'Active', color: '#22c55e' },
  pending: { label: 'Pending', color: '#f59e0b' },
  sold: { label: 'Sold', color: '#ef4444' },
  new: { label: 'New', color: '#3b82f6' },
};

const AMENITIES_LIST = [
  'Pool',
  'Garage',
  'Garden',
  'Gym',
  'Fireplace',
  'Balcony',
  'Elevator',
  'Parking',
  'Security',
  'Pet Friendly',
  'Central AC',
  'Laundry',
];

const NEIGHBORHOODS = [
  'Downtown',
  'Midtown',
  'Suburbs',
  'Lakeside',
  'Hillcrest',
  'Riverside',
  'Eastside',
  'Westview',
];

const MOCK_AGENTS = [
  {
    id: 'a1',
    name: 'Jessica Torres',
    avatar: '\u{1F469}\u{200D}\u{1F4BC}',
    phone: '(555) 123-4567',
    email: 'jessica@realty.com',
    agency: 'Premier Realty',
    rating: 4.9,
    salesCount: 156,
    specialties: ['house', 'condo'],
    bio: 'Top-selling agent with 10+ years of experience in residential properties.',
  },
  {
    id: 'a2',
    name: 'Marcus Chen',
    avatar: '\u{1F468}\u{200D}\u{1F4BC}',
    phone: '(555) 234-5678',
    email: 'marcus@realty.com',
    agency: 'Urban Living Realty',
    rating: 4.7,
    salesCount: 98,
    specialties: ['apartment', 'commercial'],
    bio: 'Specialist in commercial and urban apartment listings.',
  },
  {
    id: 'a3',
    name: 'Sarah Kim',
    avatar: '\u{1F469}\u{200D}\u{1F4BC}',
    phone: '(555) 345-6789',
    email: 'sarah@realty.com',
    agency: 'Premier Realty',
    rating: 4.8,
    salesCount: 134,
    specialties: ['house', 'townhouse', 'land'],
    bio: 'Focused on helping families find their dream home in suburban neighborhoods.',
  },
  {
    id: 'a4',
    name: 'David Okafor',
    avatar: '\u{1F468}\u{200D}\u{1F4BC}',
    phone: '(555) 456-7890',
    email: 'david@realty.com',
    agency: 'Okafor & Associates',
    rating: 4.6,
    salesCount: 72,
    specialties: ['commercial', 'land'],
    bio: 'Expert in commercial real estate and land development opportunities.',
  },
];

const INITIAL_PROPERTIES = [
  {
    id: 'p1',
    title: 'Modern Downtown Loft',
    type: 'apartment',
    status: 'active',
    price: 425000,
    address: '123 Main St, Unit 4B',
    neighborhood: 'Downtown',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    yearBuilt: 2019,
    lotSize: null,
    description:
      'Stunning open-concept loft with floor-to-ceiling windows, exposed brick walls, and premium finishes throughout. Walking distance to restaurants, shops, and public transit.',
    amenities: ['Gym', 'Elevator', 'Parking', 'Security', 'Central AC', 'Laundry'],
    images: ['\u{1F3D9}\u{FE0F}', '\u{1F6CB}\u{FE0F}', '\u{1F6BD}'],
    agent: 'a2',
    openHouse: Date.now() + 86400000 * 3,
    listedAt: Date.now() - 86400000 * 5,
    views: 342,
    saves: 28,
  },
  {
    id: 'p2',
    title: 'Spacious Family Home',
    type: 'house',
    status: 'active',
    price: 675000,
    address: '456 Oak Avenue',
    neighborhood: 'Suburbs',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    yearBuilt: 2005,
    lotSize: 0.35,
    description:
      'Beautiful 4-bedroom family home with a large backyard, updated kitchen with granite countertops, hardwood floors, and a finished basement with home office.',
    amenities: ['Garage', 'Garden', 'Fireplace', 'Pet Friendly', 'Central AC', 'Laundry'],
    images: ['\u{1F3E0}', '\u{1F3E1}', '\u{1F333}'],
    agent: 'a1',
    openHouse: Date.now() + 86400000 * 7,
    listedAt: Date.now() - 86400000 * 12,
    views: 567,
    saves: 45,
  },
  {
    id: 'p3',
    title: 'Luxury Lakeside Condo',
    type: 'condo',
    status: 'new',
    price: 890000,
    address: '789 Lakeshore Dr, Unit 12A',
    neighborhood: 'Lakeside',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2100,
    yearBuilt: 2022,
    lotSize: null,
    description:
      'Premium waterfront condo with panoramic lake views, gourmet kitchen, spa-like bathrooms, and a private balcony. Resort-style amenities including pool and fitness center.',
    amenities: ['Pool', 'Gym', 'Balcony', 'Elevator', 'Parking', 'Security', 'Central AC'],
    images: ['\u{1F30A}', '\u{1F3CA}', '\u{1F305}'],
    agent: 'a1',
    openHouse: null,
    listedAt: Date.now() - 86400000 * 2,
    views: 189,
    saves: 32,
  },
  {
    id: 'p4',
    title: 'Charming Hillcrest Townhouse',
    type: 'townhouse',
    status: 'active',
    price: 520000,
    address: '321 Hillcrest Lane',
    neighborhood: 'Hillcrest',
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1950,
    yearBuilt: 2015,
    lotSize: 0.12,
    description:
      'Elegant townhouse in sought-after Hillcrest neighborhood. Features a rooftop terrace, chef kitchen, walk-in closets, and attached two-car garage.',
    amenities: ['Garage', 'Balcony', 'Pet Friendly', 'Central AC', 'Laundry'],
    images: ['\u{1F3D8}\u{FE0F}', '\u{1F307}', '\u{1F306}'],
    agent: 'a3',
    openHouse: Date.now() + 86400000 * 5,
    listedAt: Date.now() - 86400000 * 8,
    views: 298,
    saves: 19,
  },
  {
    id: 'p5',
    title: 'Commercial Office Space',
    type: 'commercial',
    status: 'active',
    price: 1250000,
    address: '500 Business Park Blvd',
    neighborhood: 'Midtown',
    bedrooms: 0,
    bathrooms: 4,
    sqft: 5000,
    yearBuilt: 2018,
    lotSize: 0.5,
    description:
      'Prime commercial office space in Midtown business district. Open floor plan, conference rooms, kitchenette, and ample parking. Ideal for a growing company.',
    amenities: ['Parking', 'Security', 'Elevator', 'Central AC'],
    images: ['\u{1F3E2}', '\u{1F4BC}', '\u{1F5A5}\u{FE0F}'],
    agent: 'a4',
    openHouse: null,
    listedAt: Date.now() - 86400000 * 20,
    views: 156,
    saves: 8,
  },
  {
    id: 'p6',
    title: 'Riverside Development Land',
    type: 'land',
    status: 'active',
    price: 350000,
    address: 'Lot 15, River Road',
    neighborhood: 'Riverside',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    yearBuilt: null,
    lotSize: 2.5,
    description:
      'Prime development land with river frontage. Approved for residential development, utilities available at street. Beautiful mature trees and gentle slope to the water.',
    amenities: [],
    images: ['\u{1F333}', '\u{1F3DE}\u{FE0F}', '\u{1F30A}'],
    agent: 'a4',
    openHouse: null,
    listedAt: Date.now() - 86400000 * 30,
    views: 87,
    saves: 12,
  },
  {
    id: 'p7',
    title: 'Cozy Eastside Studio',
    type: 'apartment',
    status: 'pending',
    price: 185000,
    address: '88 Elm St, Unit 2C',
    neighborhood: 'Eastside',
    bedrooms: 0,
    bathrooms: 1,
    sqft: 550,
    yearBuilt: 2010,
    lotSize: null,
    description:
      'Efficient studio apartment with smart storage solutions, updated kitchen, and in-unit washer/dryer. Perfect for young professionals or investors.',
    amenities: ['Laundry', 'Parking', 'Pet Friendly', 'Security'],
    images: ['\u{1F3E2}', '\u{1F6CB}\u{FE0F}', '\u{1F373}'],
    agent: 'a2',
    openHouse: null,
    listedAt: Date.now() - 86400000 * 15,
    views: 234,
    saves: 15,
  },
  {
    id: 'p8',
    title: 'Westview Estate',
    type: 'house',
    status: 'active',
    price: 1450000,
    address: '1 Panorama Crest',
    neighborhood: 'Westview',
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4200,
    yearBuilt: 2021,
    lotSize: 0.75,
    description:
      'Magnificent estate home with sweeping valley views. Features include a gourmet kitchen, home theater, wine cellar, infinity pool, and smart home automation throughout.',
    amenities: [
      'Pool',
      'Garage',
      'Garden',
      'Gym',
      'Fireplace',
      'Balcony',
      'Security',
      'Central AC',
      'Laundry',
    ],
    images: ['\u{1F3F0}', '\u{1F3CA}', '\u{1F304}'],
    agent: 'a3',
    openHouse: Date.now() + 86400000 * 10,
    listedAt: Date.now() - 86400000 * 3,
    views: 892,
    saves: 76,
  },
  {
    id: 'p9',
    title: 'Midtown Micro-Apartment',
    type: 'apartment',
    status: 'sold',
    price: 210000,
    address: '200 Central Ave, Unit 7F',
    neighborhood: 'Midtown',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 650,
    yearBuilt: 2017,
    lotSize: null,
    description:
      'Cleverly designed micro-apartment with murphy bed, built-in desk, and full kitchen. Building amenities include rooftop lounge and co-working space.',
    amenities: ['Gym', 'Elevator', 'Security', 'Central AC', 'Laundry'],
    images: ['\u{1F3E2}', '\u{1F6CB}\u{FE0F}', '\u{2615}'],
    agent: 'a2',
    openHouse: null,
    listedAt: Date.now() - 86400000 * 45,
    views: 412,
    saves: 22,
  },
  {
    id: 'p10',
    title: 'Garden District Bungalow',
    type: 'house',
    status: 'active',
    price: 395000,
    address: '77 Garden Way',
    neighborhood: 'Suburbs',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1600,
    yearBuilt: 1965,
    lotSize: 0.25,
    description:
      'Charming renovated bungalow with original hardwood floors, updated systems, and a gorgeous wraparound porch. Large fenced yard perfect for kids and pets.',
    amenities: ['Garden', 'Garage', 'Fireplace', 'Pet Friendly', 'Laundry'],
    images: ['\u{1F3E1}', '\u{1F33B}', '\u{1F343}'],
    agent: 'a3',
    openHouse: Date.now() + 86400000 * 2,
    listedAt: Date.now() - 86400000 * 7,
    views: 445,
    saves: 38,
  },
];

const RECENTLY_VIEWED_KEY = 'propertyRecentlyViewed';
const FAVORITES_KEY = 'propertyFavorites';
const COMPARISON_KEY = 'propertyComparison';
const SEARCH_HISTORY_KEY = 'propertySearchHistory';
const THEME_KEY = 'propertyTheme';

const formatPrice = (price) => {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
};

const formatDate = (ts) => {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const daysAgo = (ts) => {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

export default function PropertyMarketplace() {
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [activeView, setActiveView] = useState('grid');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNeighborhood, setFilterNeighborhood] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);
  const [filterAmenities, setFilterAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [sortDirection, setSortDirection] = useState('desc');

  const [favorites, setFavorites] = useState([]);
  const [comparisonList, setComparisonList] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'email',
    preApproved: false,
    moveInDate: '',
  });

  const searchInputRef = useRef(null);
  const comparisonRef = useRef(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        /* ignore */
      }
    }
    const savedComparison = localStorage.getItem(COMPARISON_KEY);
    if (savedComparison) {
      try {
        setComparisonList(JSON.parse(savedComparison));
      } catch (e) {
        /* ignore */
      }
    }
    const savedRecent = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (savedRecent) {
      try {
        setRecentlyViewed(JSON.parse(savedRecent));
      } catch (e) {
        /* ignore */
      }
    }
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        /* ignore */
      }
    }
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(COMPARISON_KEY, JSON.stringify(comparisonList));
  }, [comparisonList]);

  useEffect(() => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleFavorite = useCallback(
    (propertyId) => {
      setFavorites((prev) =>
        prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
      );
    },
    []
  );

  const toggleComparison = useCallback(
    (propertyId) => {
      setComparisonList((prev) => {
        if (prev.includes(propertyId)) return prev.filter((id) => id !== propertyId);
        if (prev.length >= 4) return prev;
        return [...prev, propertyId];
      });
    },
    []
  );

  const addToRecentlyViewed = useCallback(
    (propertyId) => {
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((id) => id !== propertyId);
        return [propertyId, ...filtered].slice(0, 10);
      });
    },
    []
  );

  const handlePropertySelect = useCallback(
    (property) => {
      setSelectedProperty(property);
      addToRecentlyViewed(property.id);
    },
    [addToRecentlyViewed]
  );

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      setCurrentPage(1);
      if (query.trim() && !searchHistory.includes(query.trim())) {
        const updated = [query.trim(), ...searchHistory].slice(0, 20);
        setSearchHistory(updated);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      }
    },
    [searchHistory]
  );

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
  }, []);

  const toggleAmenityFilter = useCallback((amenity) => {
    setFilterAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterNeighborhood('all');
    setPriceRange([0, 2000000]);
    setMinBedrooms(0);
    setMinBathrooms(0);
    setFilterAmenities([]);
    setSortBy('newest');
    setSortDirection('desc');
    setCurrentPage(1);
  }, []);

  const handleInquirySubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) return;
      alert(
        `Inquiry sent to agent for ${selectedProperty?.title}!\nName: ${inquiryForm.name}\nEmail: ${inquiryForm.email}`
      );
      setInquiryForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        preferredContact: 'email',
        preApproved: false,
        moveInDate: '',
      });
      setShowInquiryModal(false);
    },
    [inquiryForm, selectedProperty]
  );

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') result = result.filter((p) => p.type === filterType);
    if (filterStatus !== 'all') result = result.filter((p) => p.status === filterStatus);
    if (filterNeighborhood !== 'all')
      result = result.filter((p) => p.neighborhood === filterNeighborhood);
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minBedrooms > 0) result = result.filter((p) => p.bedrooms >= minBedrooms);
    if (minBathrooms > 0) result = result.filter((p) => p.bathrooms >= minBathrooms);
    if (filterAmenities.length > 0) {
      result = result.filter((p) => filterAmenities.every((a) => p.amenities.includes(a)));
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'price':
          cmp = a.price - b.price;
          break;
        case 'newest':
          cmp = a.listedAt - b.listedAt;
          break;
        case 'sqft':
          cmp = a.sqft - b.sqft;
          break;
        case 'bedrooms':
          cmp = a.bedrooms - b.bedrooms;
          break;
        case 'popular':
          cmp = a.views - b.views;
          break;
        default:
          cmp = a.listedAt - b.listedAt;
      }
      return sortDirection === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [
    properties,
    searchQuery,
    filterType,
    filterStatus,
    filterNeighborhood,
    priceRange,
    minBedrooms,
    minBathrooms,
    filterAmenities,
    sortBy,
    sortDirection,
  ]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const favoriteProperties = useMemo(
    () => properties.filter((p) => favorites.includes(p.id)),
    [properties, favorites]
  );

  const comparisonProperties = useMemo(
    () => properties.filter((p) => comparisonList.includes(p.id)),
    [properties, comparisonList]
  );

  const marketStats = useMemo(() => {
    const activeListings = properties.filter((p) => p.status === 'active');
    const avgPrice =
      activeListings.length > 0
        ? activeListings.reduce((sum, p) => sum + p.price, 0) / activeListings.length
        : 0;
    const avgSqft =
      activeListings.filter((p) => p.sqft > 0).length > 0
        ? activeListings.filter((p) => p.sqft > 0).reduce((sum, p) => sum + p.sqft, 0) /
          activeListings.filter((p) => p.sqft > 0).length
        : 0;
    const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
    return {
      total: properties.length,
      active: activeListings.length,
      avgPrice,
      avgSqft: Math.round(avgSqft),
      totalViews,
      newThisWeek: properties.filter((p) => p.listedAt > Date.now() - 86400000 * 7).length,
    };
  }, [properties]);

  const bg = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#3b82f6';
  const hoverBg = isDarkMode ? '#334155' : '#f1f5f9';

  const sidebarWidth = sidebarCollapsed ? 60 : 260;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: bg,
        color: textColor,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarWidth,
          background: cardBg,
          borderRight: `1px solid ${borderColor}`,
          padding: sidebarCollapsed ? '16px 8px' : '16px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          {!sidebarCollapsed && (
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              {'\u{1F3E0}'} HomeFind
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: mutedColor,
              padding: 4,
            }}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? '\u{25B6}' : '\u{25C0}'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { id: 'grid', label: 'Grid View', icon: '\u{1F4F1}' },
                { id: 'list', label: 'List View', icon: '\u{1F4CB}' },
                { id: 'map', label: 'Map View', icon: '\u{1F5FA}\u{FE0F}' },
                { id: 'favorites', label: 'Favorites', icon: '\u{2764}\u{FE0F}' },
                { id: 'agents', label: 'Agents', icon: '\u{1F465}' },
                { id: 'stats', label: 'Market Stats', icon: '\u{1F4CA}' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setSelectedProperty(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: activeView === item.id ? accentColor : 'transparent',
                    color: activeView === item.id ? '#ffffff' : textColor,
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'favorites' && favorites.length > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: 10,
                        padding: '2px 8px',
                        fontSize: 11,
                      }}
                    >
                      {favorites.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div
              style={{
                marginTop: 24,
                padding: 12,
                background: hoverBg,
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Quick Stats</div>
              <div style={{ color: mutedColor, marginBottom: 4 }}>
                {marketStats.active} active listings
              </div>
              <div style={{ color: mutedColor, marginBottom: 4 }}>
                Avg: {formatPrice(marketStats.avgPrice)}
              </div>
              <div style={{ color: mutedColor }}>
                {marketStats.newThisWeek} new this week
              </div>
            </div>

            {recentlyViewed.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div
                  style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: mutedColor }}
                >
                  Recently Viewed
                </div>
                {recentlyViewed.slice(0, 3).map((id) => {
                  const prop = properties.find((p) => p.id === id);
                  if (!prop) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => handlePropertySelect(prop)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: textColor,
                        borderRadius: 4,
                      }}
                    >
                      {prop.title}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'none',
                  border: `1px solid ${borderColor}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: textColor,
                  fontSize: 13,
                }}
                aria-label="Toggle theme"
              >
                {isDarkMode ? '\u{2600}\u{FE0F} Light Mode' : '\u{1F319} Dark Mode'}
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header
          style={{
            padding: '12px 24px',
            background: cardBg,
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 400 }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search properties... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                background: bg,
                color: textColor,
                fontSize: 14,
                outline: 'none',
              }}
            />
            {searchHistory.length > 0 && (
              <button
                onClick={clearSearchHistory}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: mutedColor,
                  fontSize: 12,
                }}
                aria-label="Clear search history"
              >
                Clear History
              </button>
            )}
          </div>

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 12px',
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              background: bg,
              color: textColor,
              fontSize: 13,
            }}
            aria-label="Filter by property type"
          >
            <option value="all">All Types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 12px',
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              background: bg,
              color: textColor,
              fontSize: 13,
            }}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            {Object.entries(LISTING_STATUS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <select
            value={filterNeighborhood}
            onChange={(e) => {
              setFilterNeighborhood(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 12px',
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              background: bg,
              color: textColor,
              fontSize: 13,
            }}
            aria-label="Filter by neighborhood"
          >
            <option value="all">All Neighborhoods</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 12px',
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              background: bg,
              color: textColor,
              fontSize: 13,
            }}
            aria-label="Sort by"
          >
            <option value="newest">Newest</option>
            <option value="price">Price</option>
            <option value="sqft">Square Feet</option>
            <option value="bedrooms">Bedrooms</option>
            <option value="popular">Most Popular</option>
          </select>

          <button
            onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
            style={{
              padding: '10px 12px',
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              background: bg,
              color: textColor,
              cursor: 'pointer',
              fontSize: 13,
            }}
            aria-label="Toggle sort direction"
          >
            {sortDirection === 'desc' ? '\u{2193} Desc' : '\u{2191} Asc'}
          </button>

          <button
            onClick={resetFilters}
            style={{
              padding: '10px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Reset Filters
          </button>

          {comparisonList.length > 0 && (
            <button
              onClick={() => setShowComparisonPanel(true)}
              style={{
                padding: '10px 16px',
                background: accentColor,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Compare ({comparisonList.length})
            </button>
          )}
        </header>

        {/* Advanced Filters Bar */}
        <div
          style={{
            padding: '8px 24px',
            background: cardBg,
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            fontSize: 13,
          }}
        >
          <span style={{ color: mutedColor, fontWeight: 600 }}>Filters:</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: mutedColor }}>
            Min Beds:
            <select
              value={minBedrooms}
              onChange={(e) => {
                setMinBedrooms(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 8px',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                background: bg,
                color: textColor,
                fontSize: 12,
              }}
              aria-label="Minimum bedrooms"
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'Any' : `${n}+`}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: mutedColor }}>
            Min Baths:
            <select
              value={minBathrooms}
              onChange={(e) => {
                setMinBathrooms(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 8px',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                background: bg,
                color: textColor,
                fontSize: 12,
              }}
              aria-label="Minimum bathrooms"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'Any' : `${n}+`}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: mutedColor }}>
            Max Price:
            <input
              type="range"
              min={0}
              max={2000000}
              step={50000}
              value={priceRange[1]}
              onChange={(e) => {
                setPriceRange([priceRange[0], Number(e.target.value)]);
                setCurrentPage(1);
              }}
              style={{ width: 100 }}
              aria-label="Maximum price"
            />
            <span>{formatPrice(priceRange[1])}</span>
          </label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {AMENITIES_LIST.slice(0, 6).map((amenity) => (
              <button
                key={amenity}
                onClick={() => toggleAmenityFilter(amenity)}
                style={{
                  padding: '4px 10px',
                  border: `1px solid ${filterAmenities.includes(amenity) ? accentColor : borderColor}`,
                  borderRadius: 12,
                  background: filterAmenities.includes(amenity) ? accentColor : 'transparent',
                  color: filterAmenities.includes(amenity) ? 'white' : mutedColor,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                {amenity}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', color: mutedColor }}>
            {filteredProperties.length} results
          </span>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Grid View */}
          {activeView === 'grid' && !selectedProperty && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 20,
                }}
              >
                {paginatedProperties.map((property) => (
                  <div
                    key={property.id}
                    style={{
                      background: cardBg,
                      borderRadius: 12,
                      border: `1px solid ${borderColor}`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onClick={() => handlePropertySelect(property)}
                    data-testid={`property-card-${property.id}`}
                  >
                    <div
                      style={{
                        height: 180,
                        background: isDarkMode ? '#334155' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 48,
                        position: 'relative',
                      }}
                    >
                      {property.images[0]}
                      <span
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          background: LISTING_STATUS[property.status].color,
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {LISTING_STATUS[property.status].label}
                      </span>
                      <div
                        style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(property.id);
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            cursor: 'pointer',
                            fontSize: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label={`Toggle favorite ${property.title}`}
                        >
                          {favorites.includes(property.id) ? '\u{2764}\u{FE0F}' : '\u{1F90D}'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComparison(property.id);
                          }}
                          style={{
                            background: comparisonList.includes(property.id)
                              ? accentColor
                              : 'rgba(255,255,255,0.9)',
                            color: comparisonList.includes(property.id) ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            cursor: 'pointer',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label={`Toggle compare ${property.title}`}
                        >
                          {'\u{2696}\u{FE0F}'}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 8,
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                          {property.title}
                        </h3>
                        <span style={{ fontWeight: 700, color: accentColor, fontSize: 16 }}>
                          {formatPrice(property.price)}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px', color: mutedColor, fontSize: 13 }}>
                        {property.address}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          color: mutedColor,
                          fontSize: 12,
                          marginBottom: 8,
                        }}
                      >
                        <span>
                          {PROPERTY_TYPE_ICONS[property.type]} {PROPERTY_TYPE_LABELS[property.type]}
                        </span>
                        {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
                        {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
                        {property.sqft > 0 && <span>{property.sqft.toLocaleString()} sqft</span>}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 12,
                          color: mutedColor,
                        }}
                      >
                        <span>{property.neighborhood}</span>
                        <span>{daysAgo(property.listedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 24,
                  }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      background: bg,
                      color: currentPage === 1 ? mutedColor : textColor,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${currentPage === page ? accentColor : borderColor}`,
                        borderRadius: 8,
                        background: currentPage === page ? accentColor : bg,
                        color: currentPage === page ? 'white' : textColor,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: currentPage === page ? 600 : 400,
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      background: bg,
                      color: currentPage === totalPages ? mutedColor : textColor,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {activeView === 'list' && !selectedProperty && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {paginatedProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => handlePropertySelect(property)}
                  style={{
                    display: 'flex',
                    background: cardBg,
                    borderRadius: 12,
                    border: `1px solid ${borderColor}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  data-testid={`property-list-item-${property.id}`}
                >
                  <div
                    style={{
                      width: 200,
                      minHeight: 140,
                      background: isDarkMode ? '#334155' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 36,
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {property.images[0]}
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: LISTING_STATUS[property.status].color,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {LISTING_STATUS[property.status].label}
                    </span>
                  </div>
                  <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                          {property.title}
                        </h3>
                        <p style={{ margin: '4px 0', color: mutedColor, fontSize: 13 }}>
                          {property.address} &middot; {property.neighborhood}
                        </p>
                      </div>
                      <span style={{ fontWeight: 700, color: accentColor, fontSize: 18 }}>
                        {formatPrice(property.price)}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '8px 0',
                        color: mutedColor,
                        fontSize: 13,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {property.description}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        gap: 16,
                        marginTop: 'auto',
                        alignItems: 'center',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: mutedColor }}>
                        {PROPERTY_TYPE_ICONS[property.type]} {PROPERTY_TYPE_LABELS[property.type]}
                      </span>
                      {property.bedrooms > 0 && (
                        <span style={{ color: mutedColor }}>{property.bedrooms} bed</span>
                      )}
                      {property.bathrooms > 0 && (
                        <span style={{ color: mutedColor }}>{property.bathrooms} bath</span>
                      )}
                      {property.sqft > 0 && (
                        <span style={{ color: mutedColor }}>
                          {property.sqft.toLocaleString()} sqft
                        </span>
                      )}
                      <span style={{ marginLeft: 'auto', color: mutedColor, fontSize: 12 }}>
                        {daysAgo(property.listedAt)} &middot; {property.views} views
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(property.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 18,
                        }}
                        aria-label={`Toggle favorite ${property.title}`}
                      >
                        {favorites.includes(property.id) ? '\u{2764}\u{FE0F}' : '\u{1F90D}'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      background: bg,
                      color: textColor,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: '8px 12px', color: mutedColor }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      background: bg,
                      color: textColor,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Map View */}
          {activeView === 'map' && !selectedProperty && (
            <div>
              <div
                style={{
                  background: isDarkMode ? '#1a2744' : '#dbeafe',
                  borderRadius: 12,
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginBottom: 20,
                  border: `1px solid ${borderColor}`,
                }}
                data-testid="map-container"
              >
                <div style={{ textAlign: 'center', color: mutedColor }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>{'\u{1F5FA}\u{FE0F}'}</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Interactive Map</div>
                  <div style={{ fontSize: 13 }}>
                    Showing {filteredProperties.length} properties
                  </div>
                </div>
                {filteredProperties.map((property, idx) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertySelect(property)}
                    style={{
                      position: 'absolute',
                      top: `${20 + (idx * 35) % 340}px`,
                      left: `${30 + (idx * 120) % 600}px`,
                      background: accentColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: 16,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    aria-label={`View ${property.title} on map`}
                  >
                    {formatPrice(property.price)}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 12,
                }}
              >
                {filteredProperties.slice(0, 6).map((property) => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertySelect(property)}
                    style={{
                      background: cardBg,
                      borderRadius: 8,
                      border: `1px solid ${borderColor}`,
                      padding: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        background: isDarkMode ? '#334155' : '#e2e8f0',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      {property.images[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{property.title}</div>
                      <div style={{ color: mutedColor, fontSize: 12 }}>
                        {property.neighborhood}
                      </div>
                      <div style={{ color: accentColor, fontWeight: 600, fontSize: 14 }}>
                        {formatPrice(property.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites View */}
          {activeView === 'favorites' && !selectedProperty && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>
                Saved Properties ({favoriteProperties.length})
              </h2>
              {favoriteProperties.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 48,
                    color: mutedColor,
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u{2764}\u{FE0F}'}</div>
                  <p>No saved properties yet. Browse listings and click the heart icon to save.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 20,
                  }}
                >
                  {favoriteProperties.map((property) => (
                    <div
                      key={property.id}
                      style={{
                        background: cardBg,
                        borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                        padding: 16,
                        cursor: 'pointer',
                      }}
                      onClick={() => handlePropertySelect(property)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16 }}>{property.title}</h3>
                          <p style={{ margin: '4px 0', color: mutedColor, fontSize: 13 }}>
                            {property.address}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(property.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 20,
                          }}
                          aria-label={`Remove ${property.title} from favorites`}
                        >
                          {'\u{2764}\u{FE0F}'}
                        </button>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: 12,
                          color: mutedColor,
                          fontSize: 13,
                        }}
                      >
                        <span>
                          {property.bedrooms} bed &middot; {property.bathrooms} bath
                        </span>
                        <span style={{ fontWeight: 700, color: accentColor }}>
                          {formatPrice(property.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Agents View */}
          {activeView === 'agents' && !selectedProperty && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>Our Agents</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 20,
                }}
              >
                {MOCK_AGENTS.map((agent) => {
                  const agentListings = properties.filter((p) => p.agent === agent.id);
                  return (
                    <div
                      key={agent.id}
                      style={{
                        background: cardBg,
                        borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                        padding: 20,
                      }}
                      data-testid={`agent-card-${agent.id}`}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 12,
                        }}
                      >
                        <span style={{ fontSize: 40 }}>{agent.avatar}</span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                            {agent.name}
                          </h3>
                          <p style={{ margin: 0, color: mutedColor, fontSize: 13 }}>
                            {agent.agency}
                          </p>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 12px', color: mutedColor, fontSize: 13 }}>
                        {agent.bio}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 12,
                          fontSize: 13,
                        }}
                      >
                        <span>
                          {'\u{2B50}'} {agent.rating}
                        </span>
                        <span>{agent.salesCount} sales</span>
                        <span>{agentListings.length} active</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                        {agent.specialties.map((s) => (
                          <span
                            key={s}
                            style={{
                              padding: '2px 8px',
                              background: hoverBg,
                              borderRadius: 8,
                              fontSize: 11,
                              color: mutedColor,
                            }}
                          >
                            {PROPERTY_TYPE_LABELS[s]}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowAgentPanel(true);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: accentColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          View Profile
                        </button>
                        <button
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: 8,
                            background: 'transparent',
                            color: textColor,
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Market Stats View */}
          {activeView === 'stats' && !selectedProperty && (
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>Market Overview</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {[
                  {
                    label: 'Total Listings',
                    value: marketStats.total,
                    icon: '\u{1F3E0}',
                  },
                  {
                    label: 'Active',
                    value: marketStats.active,
                    icon: '\u{2705}',
                  },
                  {
                    label: 'Avg Price',
                    value: formatPrice(marketStats.avgPrice),
                    icon: '\u{1F4B0}',
                  },
                  {
                    label: 'Avg Size',
                    value: `${marketStats.avgSqft} sqft`,
                    icon: '\u{1F4CF}',
                  },
                  {
                    label: 'Total Views',
                    value: marketStats.totalViews.toLocaleString(),
                    icon: '\u{1F440}',
                  },
                  {
                    label: 'New This Week',
                    value: marketStats.newThisWeek,
                    icon: '\u{2728}',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: cardBg,
                      borderRadius: 12,
                      border: `1px solid ${borderColor}`,
                      padding: 20,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{stat.value}</div>
                    <div style={{ color: mutedColor, fontSize: 13, marginTop: 4 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <h3>Listings by Type</h3>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 24,
                }}
              >
                {PROPERTY_TYPES.map((type) => {
                  const count = properties.filter((p) => p.type === type).length;
                  const pct = properties.length > 0 ? Math.round((count / properties.length) * 100) : 0;
                  return (
                    <div
                      key={type}
                      style={{
                        background: cardBg,
                        borderRadius: 8,
                        border: `1px solid ${borderColor}`,
                        padding: '12px 20px',
                        minWidth: 120,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 24 }}>{PROPERTY_TYPE_ICONS[type]}</div>
                      <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0' }}>
                        {PROPERTY_TYPE_LABELS[type]}
                      </div>
                      <div style={{ color: mutedColor, fontSize: 13 }}>
                        {count} ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3>Listings by Neighborhood</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {NEIGHBORHOODS.map((neighborhood) => {
                  const count = properties.filter((p) => p.neighborhood === neighborhood).length;
                  const maxCount = Math.max(
                    ...NEIGHBORHOODS.map((n) => properties.filter((p) => p.neighborhood === n).length),
                    1
                  );
                  return (
                    <div
                      key={neighborhood}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 14,
                      }}
                    >
                      <span style={{ width: 100, fontWeight: 500 }}>{neighborhood}</span>
                      <div
                        style={{
                          flex: 1,
                          height: 24,
                          background: hoverBg,
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            height: '100%',
                            background: accentColor,
                            borderRadius: 4,
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <span style={{ width: 30, textAlign: 'right', color: mutedColor }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Property Detail View */}
          {selectedProperty && (
            <div>
              <button
                onClick={() => setSelectedProperty(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: accentColor,
                  fontSize: 14,
                  marginBottom: 16,
                  padding: 0,
                }}
              >
                {'\u{2190}'} Back to listings
              </button>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 400 }}>
                  {/* Image gallery */}
                  <div
                    style={{
                      background: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: 12,
                      height: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 24,
                      marginBottom: 20,
                    }}
                  >
                    {selectedProperty.images.map((img, idx) => (
                      <span key={idx} style={{ fontSize: 64 }}>
                        {img}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <h1 style={{ margin: 0, fontSize: 28 }}>{selectedProperty.title}</h1>
                      <p style={{ margin: '4px 0', color: mutedColor, fontSize: 16 }}>
                        {selectedProperty.address} &middot; {selectedProperty.neighborhood}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{ fontSize: 28, fontWeight: 700, color: accentColor }}
                      >
                        {formatPrice(selectedProperty.price)}
                      </div>
                      <span
                        style={{
                          background: LISTING_STATUS[selectedProperty.status].color,
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {LISTING_STATUS[selectedProperty.status].label}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginBottom: 20,
                    }}
                  >
                    <button
                      onClick={() => toggleFavorite(selectedProperty.id)}
                      style={{
                        padding: '10px 20px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: 8,
                        background: favorites.includes(selectedProperty.id) ? '#fef2f2' : bg,
                        color: favorites.includes(selectedProperty.id) ? '#ef4444' : textColor,
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      {favorites.includes(selectedProperty.id)
                        ? '\u{2764}\u{FE0F} Saved'
                        : '\u{1F90D} Save'}
                    </button>
                    <button
                      onClick={() => toggleComparison(selectedProperty.id)}
                      style={{
                        padding: '10px 20px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: 8,
                        background: comparisonList.includes(selectedProperty.id)
                          ? '#eff6ff'
                          : bg,
                        color: comparisonList.includes(selectedProperty.id)
                          ? accentColor
                          : textColor,
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      {comparisonList.includes(selectedProperty.id)
                        ? '\u{2696}\u{FE0F} Comparing'
                        : '\u{2696}\u{FE0F} Compare'}
                    </button>
                    <button
                      onClick={() => setShowInquiryModal(true)}
                      style={{
                        padding: '10px 20px',
                        background: accentColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Contact Agent
                    </button>
                  </div>

                  {/* Property specs grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 16,
                      marginBottom: 20,
                      background: cardBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 12,
                      padding: 20,
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {selectedProperty.bedrooms}
                      </div>
                      <div style={{ color: mutedColor, fontSize: 13 }}>Bedrooms</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {selectedProperty.bathrooms}
                      </div>
                      <div style={{ color: mutedColor, fontSize: 13 }}>Bathrooms</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {selectedProperty.sqft > 0
                          ? selectedProperty.sqft.toLocaleString()
                          : 'N/A'}
                      </div>
                      <div style={{ color: mutedColor, fontSize: 13 }}>Sq Ft</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {selectedProperty.yearBuilt || 'N/A'}
                      </div>
                      <div style={{ color: mutedColor, fontSize: 13 }}>Year Built</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 8 }}>Description</h3>
                    <p
                      style={{
                        color: mutedColor,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {selectedProperty.description}
                    </p>
                  </div>

                  {selectedProperty.amenities.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ marginBottom: 8 }}>Amenities</h3>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selectedProperty.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            style={{
                              padding: '6px 14px',
                              background: hoverBg,
                              borderRadius: 20,
                              fontSize: 13,
                              color: textColor,
                            }}
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      fontSize: 13,
                      color: mutedColor,
                    }}
                  >
                    <span>Listed: {formatDate(selectedProperty.listedAt)}</span>
                    <span>{selectedProperty.views} views</span>
                    <span>{selectedProperty.saves} saves</span>
                    {selectedProperty.lotSize && (
                      <span>Lot: {selectedProperty.lotSize} acres</span>
                    )}
                  </div>

                  {selectedProperty.openHouse && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 16,
                        background: '#eff6ff',
                        borderRadius: 8,
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <strong>Open House:</strong> {formatDate(selectedProperty.openHouse)}
                    </div>
                  )}
                </div>

                {/* Agent sidebar */}
                <div style={{ flex: 1, minWidth: 280 }}>
                  {(() => {
                    const agent = MOCK_AGENTS.find((a) => a.id === selectedProperty.agent);
                    if (!agent) return null;
                    return (
                      <div
                        style={{
                          background: cardBg,
                          border: `1px solid ${borderColor}`,
                          borderRadius: 12,
                          padding: 20,
                          position: 'sticky',
                          top: 20,
                        }}
                      >
                        <h3 style={{ margin: '0 0 12px' }}>Listing Agent</h3>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 16,
                          }}
                        >
                          <span style={{ fontSize: 40 }}>{agent.avatar}</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{agent.name}</div>
                            <div style={{ color: mutedColor, fontSize: 13 }}>
                              {agent.agency}
                            </div>
                            <div style={{ fontSize: 13 }}>
                              {'\u{2B50}'} {agent.rating} &middot; {agent.salesCount} sales
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            marginBottom: 16,
                            fontSize: 13,
                            color: mutedColor,
                          }}
                        >
                          <div>
                            {'\u{1F4DE}'} {agent.phone}
                          </div>
                          <div>
                            {'\u{2709}\u{FE0F}'} {agent.email}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowInquiryModal(true)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: accentColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          Send Inquiry
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Comparison Panel Modal */}
      {showComparisonPanel && (
        <div
          ref={comparisonRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          data-testid="comparison-panel"
        >
          <div
            style={{
              background: cardBg,
              borderRadius: 16,
              padding: 24,
              maxWidth: 900,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h2 style={{ margin: 0 }}>Compare Properties</h2>
              <button
                onClick={() => setShowComparisonPanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 24,
                  color: mutedColor,
                }}
                aria-label="Close comparison"
              >
                {'\u{2715}'}
              </button>
            </div>

            {comparisonProperties.length === 0 ? (
              <p style={{ color: mutedColor, textAlign: 'center', padding: 24 }}>
                No properties selected for comparison.
              </p>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderBottom: `2px solid ${borderColor}`,
                        color: mutedColor,
                        fontWeight: 600,
                      }}
                    >
                      Feature
                    </th>
                    {comparisonProperties.map((p) => (
                      <th
                        key={p.id}
                        style={{
                          textAlign: 'center',
                          padding: '8px 12px',
                          borderBottom: `2px solid ${borderColor}`,
                          fontWeight: 600,
                        }}
                      >
                        {p.title}
                        <button
                          onClick={() => toggleComparison(p.id)}
                          style={{
                            marginLeft: 8,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: 12,
                          }}
                          aria-label={`Remove ${p.title} from comparison`}
                        >
                          {'\u{2715}'}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Price', key: 'price', format: (v) => formatPrice(v) },
                    { label: 'Type', key: 'type', format: (v) => PROPERTY_TYPE_LABELS[v] },
                    { label: 'Status', key: 'status', format: (v) => LISTING_STATUS[v].label },
                    { label: 'Bedrooms', key: 'bedrooms', format: (v) => v },
                    { label: 'Bathrooms', key: 'bathrooms', format: (v) => v },
                    {
                      label: 'Sq Ft',
                      key: 'sqft',
                      format: (v) => (v > 0 ? v.toLocaleString() : 'N/A'),
                    },
                    { label: 'Year Built', key: 'yearBuilt', format: (v) => v || 'N/A' },
                    { label: 'Neighborhood', key: 'neighborhood', format: (v) => v },
                    {
                      label: 'Amenities',
                      key: 'amenities',
                      format: (v) => v.length,
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td
                        style={{
                          padding: '10px 12px',
                          borderBottom: `1px solid ${borderColor}`,
                          fontWeight: 500,
                          color: mutedColor,
                        }}
                      >
                        {row.label}
                      </td>
                      {comparisonProperties.map((p) => (
                        <td
                          key={p.id}
                          style={{
                            padding: '10px 12px',
                            textAlign: 'center',
                            borderBottom: `1px solid ${borderColor}`,
                          }}
                        >
                          {row.format(p[row.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && selectedProperty && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          data-testid="inquiry-modal"
        >
          <div
            style={{
              background: cardBg,
              borderRadius: 16,
              padding: 24,
              maxWidth: 500,
              width: '90%',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h2 style={{ margin: 0 }}>Send Inquiry</h2>
              <button
                onClick={() => setShowInquiryModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 24,
                  color: mutedColor,
                }}
                aria-label="Close inquiry form"
              >
                {'\u{2715}'}
              </button>
            </div>

            <p style={{ color: mutedColor, marginBottom: 16, fontSize: 14 }}>
              Inquiring about: <strong>{selectedProperty.title}</strong>
            </p>

            <form onSubmit={handleInquirySubmit}>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  value={inquiryForm.name}
                  onChange={(e) =>
                    setInquiryForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: bg,
                    color: textColor,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  value={inquiryForm.email}
                  onChange={(e) =>
                    setInquiryForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: bg,
                    color: textColor,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={inquiryForm.phone}
                  onChange={(e) =>
                    setInquiryForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="(555) 000-0000"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: bg,
                    color: textColor,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}
                >
                  Preferred Contact
                </label>
                <select
                  value={inquiryForm.preferredContact}
                  onChange={(e) =>
                    setInquiryForm((f) => ({ ...f, preferredContact: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: bg,
                    color: textColor,
                    fontSize: 14,
                  }}
                  aria-label="Preferred contact method"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="either">Either</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={inquiryForm.preApproved}
                    onChange={(e) =>
                      setInquiryForm((f) => ({ ...f, preApproved: e.target.checked }))
                    }
                  />
                  I am pre-approved for financing
                </label>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}
                >
                  Message *
                </label>
                <textarea
                  value={inquiryForm.message}
                  onChange={(e) =>
                    setInquiryForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="I'm interested in this property..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: bg,
                    color: textColor,
                    fontSize: 14,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: accentColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Agent Profile Panel */}
      {showAgentPanel && selectedAgent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          data-testid="agent-profile-panel"
        >
          <div
            style={{
              background: cardBg,
              borderRadius: 16,
              padding: 24,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h2 style={{ margin: 0 }}>Agent Profile</h2>
              <button
                onClick={() => setShowAgentPanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 24,
                  color: mutedColor,
                }}
                aria-label="Close agent profile"
              >
                {'\u{2715}'}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 56 }}>{selectedAgent.avatar}</span>
              <div>
                <h3 style={{ margin: 0 }}>{selectedAgent.name}</h3>
                <p style={{ margin: '4px 0', color: mutedColor }}>{selectedAgent.agency}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 14, marginTop: 4 }}>
                  <span>
                    {'\u{2B50}'} {selectedAgent.rating}
                  </span>
                  <span>{selectedAgent.salesCount} sales</span>
                  <span>{selectedAgent.coursesCount || selectedAgent.specialties.length} specialties</span>
                </div>
              </div>
            </div>

            <p style={{ color: mutedColor, marginBottom: 20, lineHeight: 1.6 }}>
              {selectedAgent.bio}
            </p>

            <div style={{ marginBottom: 20, fontSize: 14 }}>
              <div style={{ marginBottom: 8 }}>
                {'\u{1F4DE}'} {selectedAgent.phone}
              </div>
              <div>
                {'\u{2709}\u{FE0F}'} {selectedAgent.email}
              </div>
            </div>

            <h4 style={{ marginBottom: 8 }}>Specialties</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {selectedAgent.specialties.map((s) => (
                <span
                  key={s}
                  style={{
                    padding: '6px 14px',
                    background: hoverBg,
                    borderRadius: 20,
                    fontSize: 13,
                  }}
                >
                  {PROPERTY_TYPE_LABELS[s]}
                </span>
              ))}
            </div>

            <h4 style={{ marginBottom: 8 }}>Current Listings</h4>
            {properties
              .filter((p) => p.agent === selectedAgent.id)
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    handlePropertySelect(p);
                    setShowAgentPanel(false);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.title}</div>
                    <div style={{ color: mutedColor, fontSize: 12 }}>{p.neighborhood}</div>
                  </div>
                  <span style={{ fontWeight: 600, color: accentColor }}>
                    {formatPrice(p.price)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
