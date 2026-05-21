"use client";
import { useState, useMemo, useCallback, useEffect } from "react";

const PROPERTY_TYPES = ["House", "Apartment", "Condo", "Townhouse", "Land"];
const LISTING_STATUSES = ["For Sale", "For Rent", "Sold", "Pending"];
const PRICE_RANGES = [
  { label: "Any", min: 0, max: Infinity },
  { label: "Under $200K", min: 0, max: 200000 },
  { label: "$200K - $500K", min: 200000, max: 500000 },
  { label: "$500K - $1M", min: 500000, max: 1000000 },
  { label: "$1M+", min: 1000000, max: Infinity },
];
const BEDROOM_OPTIONS = ["Any", "1+", "2+", "3+", "4+", "5+"];
const BATHROOM_OPTIONS = ["Any", "1+", "2+", "3+"];
const SORT_OPTIONS = [
  { label: "Newest First", key: "date", direction: "desc" },
  { label: "Oldest First", key: "date", direction: "asc" },
  { label: "Price: Low to High", key: "price", direction: "asc" },
  { label: "Price: High to Low", key: "price", direction: "desc" },
  { label: "Sq Ft: Large to Small", key: "sqft", direction: "desc" },
  { label: "Sq Ft: Small to Large", key: "sqft", direction: "asc" },
];
const VIEW_MODES = ["grid", "list", "map"];

const NEIGHBORHOODS = [
  "Downtown",
  "Westside",
  "Riverside",
  "Lakefront",
  "Uptown",
  "Suburbia",
  "Hillcrest",
  "Bayview",
];

const AMENITIES = [
  "Pool",
  "Garage",
  "Garden",
  "Gym",
  "Parking",
  "Balcony",
  "Fireplace",
  "Laundry",
  "Elevator",
  "Security",
  "Pet Friendly",
  "Central AC",
];

const AGENTS = [
  {
    id: "a1",
    name: "Sarah Chen",
    photo: "SC",
    phone: "(555) 100-2001",
    email: "sarah@realty.com",
    listings: 42,
  },
  {
    id: "a2",
    name: "Marcus Johnson",
    photo: "MJ",
    phone: "(555) 100-2002",
    email: "marcus@realty.com",
    listings: 38,
  },
  {
    id: "a3",
    name: "Priya Patel",
    photo: "PP",
    phone: "(555) 100-2003",
    email: "priya@realty.com",
    listings: 55,
  },
  {
    id: "a4",
    name: "James Wilson",
    photo: "JW",
    phone: "(555) 100-2004",
    email: "james@realty.com",
    listings: 29,
  },
];

const INITIAL_LISTINGS = [
  {
    id: "l1",
    title: "Modern Downtown Loft",
    address: "123 Main St, Unit 4A",
    neighborhood: "Downtown",
    price: 475000,
    propertyType: "Apartment",
    status: "For Sale",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    yearBuilt: 2019,
    amenities: ["Gym", "Parking", "Elevator", "Central AC", "Security"],
    description:
      "Sleek open-concept loft with floor-to-ceiling windows and stunning city views. Modern finishes throughout including quartz countertops and hardwood floors.",
    images: ["loft1.jpg", "loft2.jpg", "loft3.jpg"],
    agent: "a1",
    listedDate: "2025-03-15",
    openHouse: "2025-04-20",
    tags: ["New Construction", "City View", "Open Floor Plan"],
  },
  {
    id: "l2",
    title: "Charming Victorian Home",
    address: "456 Oak Avenue",
    neighborhood: "Westside",
    price: 825000,
    propertyType: "House",
    status: "For Sale",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    yearBuilt: 1920,
    amenities: ["Garden", "Garage", "Fireplace", "Laundry"],
    description:
      "Beautifully restored Victorian with original crown molding, hardwood floors, and modern kitchen. Large backyard with mature landscaping.",
    images: ["victorian1.jpg", "victorian2.jpg"],
    agent: "a2",
    listedDate: "2025-02-28",
    openHouse: null,
    tags: ["Historic", "Renovated", "Large Yard"],
  },
  {
    id: "l3",
    title: "Lakefront Luxury Estate",
    address: "789 Lakeshore Drive",
    neighborhood: "Lakefront",
    price: 2150000,
    propertyType: "House",
    status: "For Sale",
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4500,
    yearBuilt: 2015,
    amenities: [
      "Pool",
      "Garage",
      "Garden",
      "Fireplace",
      "Central AC",
      "Security",
    ],
    description:
      "Stunning waterfront property with private dock, infinity pool, and panoramic lake views from every room. Chef's kitchen and home theater.",
    images: ["lake1.jpg", "lake2.jpg", "lake3.jpg", "lake4.jpg"],
    agent: "a3",
    listedDate: "2025-01-10",
    openHouse: "2025-04-25",
    tags: ["Waterfront", "Luxury", "Pool"],
  },
  {
    id: "l4",
    title: "Cozy Riverside Condo",
    address: "321 River Road, Unit 2B",
    neighborhood: "Riverside",
    price: 310000,
    propertyType: "Condo",
    status: "For Sale",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 750,
    yearBuilt: 2010,
    amenities: ["Parking", "Balcony", "Laundry", "Pet Friendly"],
    description:
      "Perfect starter home or investment property. Updated kitchen and bath with river views from private balcony.",
    images: ["condo1.jpg", "condo2.jpg"],
    agent: "a1",
    listedDate: "2025-04-01",
    openHouse: null,
    tags: ["River View", "Pet Friendly", "Investment"],
  },
  {
    id: "l5",
    title: "Uptown Penthouse Suite",
    address: "555 High Street, PH1",
    neighborhood: "Uptown",
    price: 1850000,
    propertyType: "Apartment",
    status: "Pending",
    bedrooms: 3,
    bathrooms: 3,
    sqft: 3200,
    yearBuilt: 2022,
    amenities: [
      "Pool",
      "Gym",
      "Parking",
      "Balcony",
      "Elevator",
      "Central AC",
      "Security",
    ],
    description:
      "Exclusive penthouse with wraparound terrace, private elevator access, and smart home automation. Building includes rooftop pool and fitness center.",
    images: ["penthouse1.jpg", "penthouse2.jpg", "penthouse3.jpg"],
    agent: "a3",
    listedDate: "2025-03-01",
    openHouse: null,
    tags: ["Penthouse", "Smart Home", "Terrace"],
  },
  {
    id: "l6",
    title: "Suburban Family Home",
    address: "890 Maple Court",
    neighborhood: "Suburbia",
    price: 550000,
    propertyType: "House",
    status: "For Sale",
    bedrooms: 4,
    bathrooms: 2,
    sqft: 2200,
    yearBuilt: 2005,
    amenities: ["Garage", "Garden", "Laundry", "Central AC", "Pet Friendly"],
    description:
      "Spacious family home in top-rated school district. Open layout with large kitchen island, family room, and fenced backyard perfect for kids and pets.",
    images: ["suburban1.jpg", "suburban2.jpg"],
    agent: "a4",
    listedDate: "2025-03-20",
    openHouse: "2025-04-22",
    tags: ["Family", "Good Schools", "Fenced Yard"],
  },
  {
    id: "l7",
    title: "Hillcrest Townhouse",
    address: "234 Hillside Terrace",
    neighborhood: "Hillcrest",
    price: 620000,
    propertyType: "Townhouse",
    status: "For Rent",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    yearBuilt: 2018,
    amenities: ["Garage", "Balcony", "Laundry", "Central AC"],
    description:
      "Modern three-story townhouse with rooftop deck and mountain views. Walking distance to shops and restaurants.",
    images: ["townhouse1.jpg"],
    agent: "a2",
    listedDate: "2025-04-05",
    openHouse: null,
    tags: ["Mountain View", "Walkable", "Modern"],
  },
  {
    id: "l8",
    title: "Bayview Studio",
    address: "678 Bay Boulevard, Unit 1C",
    neighborhood: "Bayview",
    price: 225000,
    propertyType: "Apartment",
    status: "For Sale",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 550,
    yearBuilt: 2017,
    amenities: ["Parking", "Elevator", "Laundry"],
    description:
      "Efficient studio apartment with bay views and modern finishes. Great for professionals or as a rental investment.",
    images: ["studio1.jpg"],
    agent: "a4",
    listedDate: "2025-04-10",
    openHouse: "2025-04-21",
    tags: ["Bay View", "Investment", "Compact"],
  },
  {
    id: "l9",
    title: "Development Land Parcel",
    address: "Lot 15, Sunrise Heights",
    neighborhood: "Hillcrest",
    price: 380000,
    propertyType: "Land",
    status: "For Sale",
    bedrooms: 0,
    bathrooms: 0,
    sqft: 12000,
    yearBuilt: null,
    amenities: [],
    description:
      "Prime 12,000 sqft building lot with approved plans for a 4-bedroom home. Utilities at street. Stunning valley views.",
    images: ["land1.jpg"],
    agent: "a3",
    listedDate: "2025-02-14",
    openHouse: null,
    tags: ["Development", "Valley View", "Approved Plans"],
  },
  {
    id: "l10",
    title: "Renovated Downtown Flat",
    address: "99 Central Ave, Unit 3F",
    neighborhood: "Downtown",
    price: 395000,
    propertyType: "Condo",
    status: "Sold",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 950,
    yearBuilt: 1985,
    amenities: ["Parking", "Laundry", "Central AC", "Security"],
    description:
      "Completely renovated condo with exposed brick and modern finishes. Walk to transit, dining, and nightlife.",
    images: ["flat1.jpg", "flat2.jpg"],
    agent: "a1",
    listedDate: "2025-01-20",
    openHouse: null,
    tags: ["Renovated", "Walkable", "Transit"],
  },
];

const SAVED_SEARCHES = [
  {
    id: "ss1",
    name: "Family Homes Under $600K",
    filters: {
      propertyType: "House",
      priceRange: { min: 0, max: 600000 },
      bedrooms: "3+",
    },
  },
  {
    id: "ss2",
    name: "Downtown Apartments",
    filters: { propertyType: "Apartment", neighborhood: "Downtown" },
  },
];

function formatPrice(price) {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  return `$${(price / 1000).toFixed(0)}K`;
}

function formatFullPrice(price) {
  return `$${price.toLocaleString()}`;
}

function daysOnMarket(listedDate) {
  const listed = new Date(listedDate);
  const now = new Date("2025-04-15");
  return Math.floor((now - listed) / (1000 * 60 * 60 * 24));
}

export default function RealEstateListings() {
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("re_favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [selectedBedrooms, setSelectedBedrooms] = useState("Any");
  const [selectedBathrooms, setSelectedBathrooms] = useState("Any");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedListing, setSelectedListing] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState(SAVED_SEARCHES);
  const [newSearchName, setNewSearchName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showMortgageCalc, setShowMortgageCalc] = useState(false);
  const [mortgageAmount, setMortgageAmount] = useState("");
  const [mortgageRate, setMortgageRate] = useState("6.5");
  const [mortgageTerm, setMortgageTerm] = useState("30");
  const [theme, setTheme] = useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("re_favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showContactModal) setShowContactModal(false);
        else if (selectedListing) setSelectedListing(null);
        else if (showMortgageCalc) setShowMortgageCalc(false);
      }
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setShowFilters((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showContactModal, selectedListing, showMortgageCalc]);

  const toggleFavorite = useCallback(
    (listingId) => {
      setFavorites((prev) => {
        if (prev.includes(listingId)) {
          return prev.filter((id) => id !== listingId);
        }
        return [...prev, listingId];
      });
    },
    [setFavorites],
  );

  const toggleCompare = useCallback(
    (listingId) => {
      setCompareList((prev) => {
        if (prev.includes(listingId)) {
          return prev.filter((id) => id !== listingId);
        }
        if (prev.length >= 3) {
          addNotification("You can compare up to 3 properties at a time.");
          return prev;
        }
        return [...prev, listingId];
      });
    },
    [setCompareList],
  );

  const addNotification = useCallback((message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const toggleAmenity = useCallback((amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedPropertyType("All");
    setSelectedStatus("All");
    setSelectedPriceRange(PRICE_RANGES[0]);
    setSelectedBedrooms("Any");
    setSelectedBathrooms("Any");
    setSelectedNeighborhood("All");
    setSelectedAmenities([]);
    setSortOption(SORT_OPTIONS[0]);
    setCurrentPage(1);
  }, []);

  const saveCurrentSearch = useCallback(() => {
    if (!newSearchName.trim()) return;
    const newSearch = {
      id: `ss${Date.now()}`,
      name: newSearchName,
      filters: {
        propertyType: selectedPropertyType,
        priceRange: {
          min: selectedPriceRange.min,
          max: selectedPriceRange.max,
        },
        bedrooms: selectedBedrooms,
        neighborhood: selectedNeighborhood,
      },
    };
    setSavedSearches((prev) => [...prev, newSearch]);
    setNewSearchName("");
    addNotification(`Search "${newSearchName}" saved!`);
  }, [
    newSearchName,
    selectedPropertyType,
    selectedPriceRange,
    selectedBedrooms,
    selectedNeighborhood,
    addNotification,
  ]);

  const applySavedSearch = useCallback((search) => {
    if (search.filters.propertyType)
      setSelectedPropertyType(search.filters.propertyType);
    if (search.filters.priceRange) {
      const range = PRICE_RANGES.find(
        (r) =>
          r.min === search.filters.priceRange.min &&
          r.max === search.filters.priceRange.max,
      );
      if (range) setSelectedPriceRange(range);
    }
    if (search.filters.bedrooms) setSelectedBedrooms(search.filters.bedrooms);
    if (search.filters.neighborhood)
      setSelectedNeighborhood(search.filters.neighborhood);
    setCurrentPage(1);
    setShowSavedSearches(false);
    addNotification(`Applied search: "${search.name}"`);
  }, []);

  const deleteSavedSearch = useCallback(
    (searchId) => {
      setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
      addNotification("Saved search deleted.");
    },
    [addNotification],
  );

  const calculateMortgage = useMemo(() => {
    const principal = parseFloat(mortgageAmount) || 0;
    const rate = parseFloat(mortgageRate) / 100 / 12;
    const payments = parseFloat(mortgageTerm) * 12;
    if (principal <= 0 || rate <= 0 || payments <= 0) return null;
    const monthly =
      (principal * (rate * Math.pow(1 + rate, payments))) /
      (Math.pow(1 + rate, payments) - 1);
    return {
      monthly: monthly.toFixed(2),
      total: (monthly * payments).toFixed(2),
      interest: (monthly * payments - principal).toFixed(2),
    };
  }, [mortgageAmount, mortgageRate, mortgageTerm]);

  const filteredListings = useMemo(() => {
    let result = [...listings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.neighborhood.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (selectedPropertyType !== "All") {
      result = result.filter((l) => l.propertyType === selectedPropertyType);
    }
    if (selectedStatus !== "All") {
      result = result.filter((l) => l.status === selectedStatus);
    }
    result = result.filter(
      (l) =>
        l.price >= selectedPriceRange.min &&
        l.price <= selectedPriceRange.max,
    );
    if (selectedBedrooms !== "Any") {
      const min = parseInt(selectedBedrooms);
      result = result.filter((l) => l.bedrooms >= min);
    }
    if (selectedBathrooms !== "Any") {
      const min = parseInt(selectedBathrooms);
      result = result.filter((l) => l.bathrooms >= min);
    }
    if (selectedNeighborhood !== "All") {
      result = result.filter((l) => l.neighborhood === selectedNeighborhood);
    }
    if (selectedAmenities.length > 0) {
      result = result.filter((l) =>
        selectedAmenities.every((a) => l.amenities.includes(a)),
      );
    }
    result.sort((a, b) => {
      const key = sortOption.key;
      const dir = sortOption.direction === "asc" ? 1 : -1;
      if (key === "date") {
        return (
          dir * (new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime())
        );
      }
      return dir * (a[key] - b[key]);
    });
    return result;
  }, [
    listings,
    searchQuery,
    selectedPropertyType,
    selectedStatus,
    selectedPriceRange,
    selectedBedrooms,
    selectedBathrooms,
    selectedNeighborhood,
    selectedAmenities,
    sortOption,
  ]);

  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredListings.slice(start, start + itemsPerPage);
  }, [filteredListings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  const stats = useMemo(() => {
    const active = listings.filter(
      (l) => l.status === "For Sale" || l.status === "For Rent",
    );
    const avgPrice =
      active.length > 0
        ? active.reduce((sum, l) => sum + l.price, 0) / active.length
        : 0;
    const avgSqft =
      active.filter((l) => l.sqft > 0).length > 0
        ? active
            .filter((l) => l.sqft > 0)
            .reduce((sum, l) => sum + l.sqft, 0) /
          active.filter((l) => l.sqft > 0).length
        : 0;
    return {
      total: listings.length,
      active: active.length,
      avgPrice,
      avgSqft: Math.round(avgSqft),
      favoriteCount: favorites.length,
    };
  }, [listings, favorites]);

  const compareListings = useMemo(() => {
    return compareList
      .map((id) => listings.find((l) => l.id === id))
      .filter(Boolean);
  }, [compareList, listings]);

  const bgColor = theme === "dark" ? "#1a1a2e" : "#f8f9fa";
  const cardBg = theme === "dark" ? "#16213e" : "#ffffff";
  const textColor = theme === "dark" ? "#e0e0e0" : "#333333";
  const mutedColor = theme === "dark" ? "#a0a0a0" : "#666666";
  const borderColor = theme === "dark" ? "#2a2a4a" : "#e0e0e0";
  const accentColor = "#2563eb";
  const favoriteColor = "#ef4444";

  const sendContactMessage = useCallback(() => {
    if (!contactMessage.trim()) return;
    addNotification("Message sent to agent!");
    setContactMessage("");
    setShowContactModal(false);
  }, [contactMessage, addNotification]);

  return (
    <div
      data-testid="app-root"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: bgColor,
        color: textColor,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        style={{
          width: sidebarCollapsed ? "60px" : "240px",
          background: theme === "dark" ? "#0f0f23" : "#ffffff",
          borderRight: `1px solid ${borderColor}`,
          padding: sidebarCollapsed ? "16px 8px" : "16px",
          transition: "width 0.2s",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          {!sidebarCollapsed && (
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
              🏠 RealtyHub
            </h1>
          )}
          <button
            data-testid="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: textColor,
              fontSize: "18px",
              padding: "4px",
            }}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>
        {!sidebarCollapsed && (
          <>
            <nav style={{ flex: 1 }}>
              <div style={{ marginBottom: "8px", fontSize: "12px", color: mutedColor, textTransform: "uppercase" }}>
                Navigation
              </div>
              {[
                { label: "All Listings", icon: "🏘️", count: stats.total },
                {
                  label: "Favorites",
                  icon: "❤️",
                  count: stats.favoriteCount,
                  action: () => {
                    setSelectedStatus("All");
                    setSearchQuery("");
                  },
                },
                { label: "For Sale", icon: "🏷️", count: listings.filter((l) => l.status === "For Sale").length },
                { label: "For Rent", icon: "🔑", count: listings.filter((l) => l.status === "For Rent").length },
                { label: "Sold", icon: "✅", count: listings.filter((l) => l.status === "Sold").length },
                { label: "Pending", icon: "⏳", count: listings.filter((l) => l.status === "Pending").length },
              ].map((item) => (
                <button
                  key={item.label}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => {
                    if (item.label === "All Listings") {
                      clearFilters();
                    } else if (item.label === "Favorites") {
                      // Show only favorites - handled in filter
                    } else {
                      setSelectedStatus(item.label);
                    }
                    if (item.action) item.action();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "10px 12px",
                    marginBottom: "4px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: textColor,
                    borderRadius: "8px",
                    fontSize: "14px",
                    textAlign: "left",
                  }}
                >
                  <span>
                    {item.icon} {item.label}
                  </span>
                  <span
                    style={{
                      background: borderColor,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </nav>
            <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: "16px" }}>
              <button
                data-testid="saved-searches-btn"
                onClick={() => setShowSavedSearches(!showSavedSearches)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "none",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: textColor,
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                📌 Saved Searches ({savedSearches.length})
              </button>
              <button
                data-testid="mortgage-calc-btn"
                onClick={() => setShowMortgageCalc(!showMortgageCalc)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "none",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: textColor,
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                🧮 Mortgage Calculator
              </button>
              <button
                data-testid="theme-toggle"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "none",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: textColor,
                  fontSize: "13px",
                }}
              >
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
        {/* Header Stats */}
        <div
          data-testid="stats-bar"
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Total Listings", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Avg Price", value: formatPrice(stats.avgPrice) },
            { label: "Avg Sq Ft", value: stats.avgSqft.toLocaleString() },
            { label: "Favorites", value: stats.favoriteCount },
          ].map((stat) => (
            <div
              key={stat.label}
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "12px",
                padding: "16px 20px",
                minWidth: "140px",
              }}
            >
              <div style={{ fontSize: "12px", color: mutedColor, marginBottom: "4px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search and View Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "300px", position: "relative" }}>
            <input
              id="search-input"
              data-testid="search-input"
              type="text"
              placeholder="Search by title, address, neighborhood, or tags... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {VIEW_MODES.map((mode) => (
              <button
                key={mode}
                data-testid={`view-${mode}`}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${viewMode === mode ? accentColor : borderColor}`,
                  background: viewMode === mode ? accentColor : cardBg,
                  color: viewMode === mode ? "#fff" : textColor,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: viewMode === mode ? "600" : "400",
                }}
              >
                {mode === "grid" ? "▦ Grid" : mode === "list" ? "☰ List" : "🗺️ Map"}
              </button>
            ))}
          </div>
          <button
            data-testid="toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: `1px solid ${borderColor}`,
              background: showFilters ? accentColor : cardBg,
              color: showFilters ? "#fff" : textColor,
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            🔍 Filters {showFilters ? "▲" : "▼"}
          </button>
          <button
            data-testid="compare-btn"
            onClick={() => setShowComparePanel(!showComparePanel)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: `1px solid ${compareList.length > 0 ? accentColor : borderColor}`,
              background: showComparePanel ? accentColor : cardBg,
              color: showComparePanel ? "#fff" : textColor,
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ⚖️ Compare ({compareList.length})
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            data-testid="filters-panel"
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px" }}>Filters</h3>
              <button
                data-testid="clear-filters"
                onClick={clearFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: accentColor,
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Clear All
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "6px" }}>
                  Property Type
                </label>
                <select
                  data-testid="filter-property-type"
                  value={selectedPropertyType}
                  onChange={(e) => {
                    setSelectedPropertyType(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  <option value="All">All Types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "6px" }}>
                  Status
                </label>
                <select
                  data-testid="filter-status"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  <option value="All">All Statuses</option>
                  {LISTING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "6px" }}>
                  Price Range
                </label>
                <select
                  data-testid="filter-price"
                  value={selectedPriceRange.label}
                  onChange={(e) => {
                    const range = PRICE_RANGES.find(
                      (r) => r.label === e.target.value,
                    );
                    setSelectedPriceRange(range);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {PRICE_RANGES.map((r) => (
                    <option key={r.label} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "6px" }}>
                  Bedrooms
                </label>
                <select
                  data-testid="filter-bedrooms"
                  value={selectedBedrooms}
                  onChange={(e) => {
                    setSelectedBedrooms(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {BEDROOM_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "6px" }}>
                  Bathrooms
                </label>
                <select
                  data-testid="filter-bathrooms"
                  value={selectedBathrooms}
                  onChange={(e) => {
                    setSelectedBathrooms(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {BATHROOM_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "6px" }}>
                  Neighborhood
                </label>
                <select
                  data-testid="filter-neighborhood"
                  value={selectedNeighborhood}
                  onChange={(e) => {
                    setSelectedNeighborhood(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  <option value="All">All Neighborhoods</option>
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "6px" }}>
                  Sort By
                </label>
                <select
                  data-testid="sort-select"
                  value={sortOption.label}
                  onChange={(e) => {
                    const opt = SORT_OPTIONS.find(
                      (o) => o.label === e.target.value,
                    );
                    setSortOption(opt);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.label} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Amenities Filter */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "8px" }}>
                Amenities
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    data-testid={`amenity-${amenity.toLowerCase().replace(/\s/g, "-")}`}
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: `1px solid ${selectedAmenities.includes(amenity) ? accentColor : borderColor}`,
                      background: selectedAmenities.includes(amenity)
                        ? accentColor
                        : "transparent",
                      color: selectedAmenities.includes(amenity) ? "#fff" : textColor,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
            {/* Save Search */}
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                data-testid="save-search-name"
                type="text"
                placeholder="Name this search..."
                value={newSearchName}
                onChange={(e) => setNewSearchName(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  fontSize: "13px",
                }}
              />
              <button
                data-testid="save-search-btn"
                onClick={saveCurrentSearch}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: accentColor,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Save Search
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div
          data-testid="results-count"
          style={{
            marginBottom: "16px",
            fontSize: "14px",
            color: mutedColor,
          }}
        >
          Showing {paginatedListings.length} of {filteredListings.length}{" "}
          listings
          {filteredListings.length !== listings.length &&
            ` (filtered from ${listings.length})`}
        </div>

        {/* Listings Grid/List */}
        {viewMode === "grid" && (
          <div
            data-testid="listings-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {paginatedListings.map((listing) => {
              const agent = AGENTS.find((a) => a.id === listing.agent);
              return (
                <div
                  key={listing.id}
                  data-testid={`listing-card-${listing.id}`}
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                  }}
                  onClick={() => {
                    setSelectedListing(listing);
                    setActiveImageIndex(0);
                  }}
                >
                  {/* Image placeholder */}
                  <div
                    style={{
                      height: "200px",
                      background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <span style={{ fontSize: "48px" }}>
                      {listing.propertyType === "House"
                        ? "🏠"
                        : listing.propertyType === "Apartment"
                          ? "🏢"
                          : listing.propertyType === "Condo"
                            ? "🏬"
                            : listing.propertyType === "Townhouse"
                              ? "🏘️"
                              : "🌳"}
                    </span>
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background:
                          listing.status === "For Sale"
                            ? "#22c55e"
                            : listing.status === "For Rent"
                              ? "#3b82f6"
                              : listing.status === "Pending"
                                ? "#f59e0b"
                                : "#6b7280",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {listing.status}
                    </div>
                    <button
                      data-testid={`favorite-${listing.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(listing.id);
                      }}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "rgba(255,255,255,0.9)",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        cursor: "pointer",
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={
                        favorites.includes(listing.id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      {favorites.includes(listing.id) ? "❤️" : "🤍"}
                    </button>
                    <button
                      data-testid={`compare-toggle-${listing.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(listing.id);
                      }}
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        right: "12px",
                        background: compareList.includes(listing.id)
                          ? accentColor
                          : "rgba(255,255,255,0.9)",
                        color: compareList.includes(listing.id) ? "#fff" : "#333",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {compareList.includes(listing.id) ? "✓ Compare" : "+ Compare"}
                    </button>
                    {listing.images.length > 1 && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "12px",
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                        }}
                      >
                        📷 {listing.images.length}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                        {listing.title}
                      </h3>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          color: accentColor,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatFullPrice(listing.price)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: mutedColor,
                        marginBottom: "8px",
                      }}
                    >
                      📍 {listing.address} • {listing.neighborhood}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        fontSize: "13px",
                        color: mutedColor,
                        marginBottom: "8px",
                      }}
                    >
                      <span>🛏️ {listing.bedrooms} bd</span>
                      <span>🚿 {listing.bathrooms} ba</span>
                      <span>📐 {listing.sqft.toLocaleString()} sqft</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {listing.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: `${accentColor}15`,
                            color: accentColor,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                        color: mutedColor,
                      }}
                    >
                      <span>
                        {agent?.photo} {agent?.name}
                      </span>
                      <span>{daysOnMarket(listing.listedDate)} days on market</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "list" && (
          <div data-testid="listings-list" style={{ marginBottom: "24px" }}>
            {paginatedListings.map((listing) => {
              const agent = AGENTS.find((a) => a.id === listing.agent);
              return (
                <div
                  key={listing.id}
                  data-testid={`listing-row-${listing.id}`}
                  onClick={() => {
                    setSelectedListing(listing);
                    setActiveImageIndex(0);
                  }}
                  style={{
                    display: "flex",
                    background: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "12px",
                    marginBottom: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "200px",
                      minHeight: "140px",
                      background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "36px" }}>
                      {listing.propertyType === "House"
                        ? "🏠"
                        : listing.propertyType === "Apartment"
                          ? "🏢"
                          : listing.propertyType === "Condo"
                            ? "🏬"
                            : listing.propertyType === "Townhouse"
                              ? "🏘️"
                              : "🌳"}
                    </span>
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        background:
                          listing.status === "For Sale"
                            ? "#22c55e"
                            : listing.status === "For Rent"
                              ? "#3b82f6"
                              : listing.status === "Pending"
                                ? "#f59e0b"
                                : "#6b7280",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {listing.status}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
                        {listing.title}
                      </h3>
                      <div style={{ fontSize: "13px", color: mutedColor, marginBottom: "8px" }}>
                        📍 {listing.address} • {listing.neighborhood}
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: mutedColor }}>
                        <span>🛏️ {listing.bedrooms} bd</span>
                        <span>🚿 {listing.bathrooms} ba</span>
                        <span>📐 {listing.sqft.toLocaleString()} sqft</span>
                        <span>🏗️ {listing.yearBuilt || "N/A"}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: accentColor,
                          marginBottom: "8px",
                        }}
                      >
                        {formatFullPrice(listing.price)}
                      </div>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          data-testid={`list-favorite-${listing.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(listing.id);
                          }}
                          style={{
                            background: "none",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {favorites.includes(listing.id) ? "❤️" : "🤍"}
                        </button>
                        <button
                          data-testid={`list-compare-${listing.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(listing.id);
                          }}
                          style={{
                            background: compareList.includes(listing.id)
                              ? accentColor
                              : "none",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            color: compareList.includes(listing.id) ? "#fff" : textColor,
                          }}
                        >
                          ⚖️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "map" && (
          <div
            data-testid="map-view"
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
              marginBottom: "24px",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🗺️</div>
            <h3 style={{ marginBottom: "8px" }}>Map View</h3>
            <p style={{ color: mutedColor, marginBottom: "16px" }}>
              Showing {filteredListings.length} listings across{" "}
              {[...new Set(filteredListings.map((l) => l.neighborhood))].length}{" "}
              neighborhoods
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {[...new Set(filteredListings.map((l) => l.neighborhood))].map(
                (neighborhood) => {
                  const count = filteredListings.filter(
                    (l) => l.neighborhood === neighborhood,
                  ).length;
                  return (
                    <div
                      key={neighborhood}
                      data-testid={`map-pin-${neighborhood.toLowerCase()}`}
                      style={{
                        background: `${accentColor}15`,
                        border: `1px solid ${accentColor}40`,
                        borderRadius: "8px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                      onClick={() => {
                        setSelectedNeighborhood(neighborhood);
                        setViewMode("grid");
                      }}
                    >
                      📍 {neighborhood} ({count})
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && viewMode !== "map" && (
          <div
            data-testid="pagination"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <button
              data-testid="prev-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: currentPage === 1 ? mutedColor : textColor,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: "14px", color: mutedColor }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              data-testid="next-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: currentPage === totalPages ? mutedColor : textColor,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Compare Panel */}
        {showComparePanel && compareListings.length > 0 && (
          <div
            data-testid="compare-panel"
            style={{
              background: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Compare Properties</h3>
              <button
                data-testid="clear-compare"
                onClick={() => setCompareList([])}
                style={{
                  background: "none",
                  border: "none",
                  color: accentColor,
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Clear All
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      Feature
                    </th>
                    {compareListings.map((l) => (
                      <th
                        key={l.id}
                        style={{
                          textAlign: "left",
                          padding: "8px",
                          borderBottom: `1px solid ${borderColor}`,
                          minWidth: "180px",
                        }}
                      >
                        {l.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Price", fn: (l) => formatFullPrice(l.price) },
                    { label: "Type", fn: (l) => l.propertyType },
                    { label: "Bedrooms", fn: (l) => l.bedrooms },
                    { label: "Bathrooms", fn: (l) => l.bathrooms },
                    {
                      label: "Sq Ft",
                      fn: (l) => l.sqft.toLocaleString(),
                    },
                    {
                      label: "Year Built",
                      fn: (l) => l.yearBuilt || "N/A",
                    },
                    { label: "Neighborhood", fn: (l) => l.neighborhood },
                    { label: "Status", fn: (l) => l.status },
                    {
                      label: "Price/Sq Ft",
                      fn: (l) =>
                        l.sqft > 0
                          ? `$${(l.price / l.sqft).toFixed(0)}`
                          : "N/A",
                    },
                    {
                      label: "Days on Market",
                      fn: (l) => daysOnMarket(l.listedDate),
                    },
                    {
                      label: "Amenities",
                      fn: (l) => l.amenities.join(", ") || "None",
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td
                        style={{
                          padding: "8px",
                          fontWeight: "600",
                          borderBottom: `1px solid ${borderColor}`,
                        }}
                      >
                        {row.label}
                      </td>
                      {compareListings.map((l) => (
                        <td
                          key={l.id}
                          style={{
                            padding: "8px",
                            borderBottom: `1px solid ${borderColor}`,
                          }}
                        >
                          {row.fn(l)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div
          data-testid="listing-detail-modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedListing(null)}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "16px",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "32px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 8px 0" }}>{selectedListing.title}</h2>
                <div style={{ fontSize: "14px", color: mutedColor }}>
                  📍 {selectedListing.address} • {selectedListing.neighborhood}
                </div>
              </div>
              <button
                data-testid="close-detail"
                onClick={() => setSelectedListing(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: textColor,
                }}
              >
                ✕
              </button>
            </div>
            {/* Image Gallery */}
            <div
              data-testid="image-gallery"
              style={{
                height: "300px",
                background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                position: "relative",
              }}
            >
              <span style={{ fontSize: "64px" }}>
                {selectedListing.propertyType === "House"
                  ? "🏠"
                  : selectedListing.propertyType === "Apartment"
                    ? "🏢"
                    : selectedListing.propertyType === "Condo"
                      ? "🏬"
                      : selectedListing.propertyType === "Townhouse"
                        ? "🏘️"
                        : "🌳"}
              </span>
              {selectedListing.images.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  {selectedListing.images.map((_, i) => (
                    <button
                      key={i}
                      data-testid={`gallery-dot-${i}`}
                      onClick={() => setActiveImageIndex(i)}
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        border: "none",
                        background:
                          i === activeImageIndex ? accentColor : "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              )}
              <div
                data-testid="image-counter"
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {activeImageIndex + 1} / {selectedListing.images.length}
              </div>
            </div>
            {/* Listing Details */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: accentColor,
                }}
              >
                {formatFullPrice(selectedListing.price)}
              </span>
              <div
                style={{
                  background:
                    selectedListing.status === "For Sale"
                      ? "#22c55e"
                      : selectedListing.status === "For Rent"
                        ? "#3b82f6"
                        : selectedListing.status === "Pending"
                          ? "#f59e0b"
                          : "#6b7280",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {selectedListing.status}
              </div>
            </div>
            <div
              data-testid="detail-specs"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ textAlign: "center", padding: "12px", background: bgColor, borderRadius: "8px" }}>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>
                  {selectedListing.bedrooms}
                </div>
                <div style={{ fontSize: "12px", color: mutedColor }}>Bedrooms</div>
              </div>
              <div style={{ textAlign: "center", padding: "12px", background: bgColor, borderRadius: "8px" }}>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>
                  {selectedListing.bathrooms}
                </div>
                <div style={{ fontSize: "12px", color: mutedColor }}>Bathrooms</div>
              </div>
              <div style={{ textAlign: "center", padding: "12px", background: bgColor, borderRadius: "8px" }}>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>
                  {selectedListing.sqft.toLocaleString()}
                </div>
                <div style={{ fontSize: "12px", color: mutedColor }}>Sq Ft</div>
              </div>
              <div style={{ textAlign: "center", padding: "12px", background: bgColor, borderRadius: "8px" }}>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>
                  {selectedListing.yearBuilt || "N/A"}
                </div>
                <div style={{ fontSize: "12px", color: mutedColor }}>Year Built</div>
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Description</h4>
              <p style={{ color: mutedColor, lineHeight: "1.6", margin: 0 }}>
                {selectedListing.description}
              </p>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Amenities</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selectedListing.amenities.length > 0 ? (
                  selectedListing.amenities.map((a) => (
                    <span
                      key={a}
                      style={{
                        background: `${accentColor}15`,
                        color: accentColor,
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span style={{ color: mutedColor }}>No amenities listed</span>
                )}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Tags</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selectedListing.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: borderColor,
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {/* Agent Info */}
            {(() => {
              const agent = AGENTS.find((a) => a.id === selectedListing.agent);
              if (!agent) return null;
              return (
                <div
                  data-testid="agent-info"
                  style={{
                    background: bgColor,
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: "13px", color: mutedColor }}>
                      📞 {agent.phone} • ✉️ {agent.email}
                    </div>
                    <div style={{ fontSize: "12px", color: mutedColor }}>
                      {agent.listings} active listings
                    </div>
                  </div>
                  <button
                    data-testid="contact-agent-btn"
                    onClick={() => setShowContactModal(true)}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "8px",
                      border: "none",
                      background: accentColor,
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Contact Agent
                  </button>
                </div>
              );
            })()}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px",
                color: mutedColor,
              }}
            >
              <span>
                Listed on{" "}
                {new Date(selectedListing.listedDate).toLocaleDateString()} •{" "}
                {daysOnMarket(selectedListing.listedDate)} days on market
              </span>
              {selectedListing.openHouse && (
                <span style={{ color: "#22c55e", fontWeight: "600" }}>
                  🏡 Open House:{" "}
                  {new Date(selectedListing.openHouse).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Agent Modal */}
      {showContactModal && selectedListing && (
        <div
          data-testid="contact-modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "16px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0" }}>
              Contact Agent about {selectedListing.title}
            </h3>
            <textarea
              data-testid="contact-message"
              placeholder="Write your message to the agent..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
                background: bgColor,
                color: textColor,
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "16px",
              }}
            >
              <button
                data-testid="cancel-contact"
                onClick={() => setShowContactModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: "none",
                  color: textColor,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                data-testid="send-message"
                onClick={sendContactMessage}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: accentColor,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches Panel */}
      {showSavedSearches && (
        <div
          data-testid="saved-searches-panel"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowSavedSearches(false)}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "16px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0" }}>Saved Searches</h3>
            {savedSearches.length === 0 ? (
              <p style={{ color: mutedColor }}>No saved searches yet.</p>
            ) : (
              savedSearches.map((search) => (
                <div
                  key={search.id}
                  data-testid={`saved-search-${search.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600" }}>{search.name}</div>
                    <div style={{ fontSize: "12px", color: mutedColor }}>
                      {Object.entries(search.filters)
                        .filter(([, v]) => v && v !== "All" && v !== "Any")
                        .map(
                          ([k, v]) =>
                            `${k}: ${typeof v === "object" ? `$${v.min / 1000}K-$${v.max === Infinity ? "∞" : v.max / 1000 + "K"}` : v}`,
                        )
                        .join(" • ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      data-testid={`apply-search-${search.id}`}
                      onClick={() => applySavedSearch(search)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: accentColor,
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Apply
                    </button>
                    <button
                      data-testid={`delete-search-${search.id}`}
                      onClick={() => deleteSavedSearch(search.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${borderColor}`,
                        background: "none",
                        color: textColor,
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mortgage Calculator Modal */}
      {showMortgageCalc && (
        <div
          data-testid="mortgage-modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowMortgageCalc(false)}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "16px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0" }}>🧮 Mortgage Calculator</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: mutedColor,
                    marginBottom: "4px",
                  }}
                >
                  Loan Amount ($)
                </label>
                <input
                  data-testid="mortgage-amount"
                  type="number"
                  value={mortgageAmount}
                  onChange={(e) => setMortgageAmount(e.target.value)}
                  placeholder="e.g. 400000"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${borderColor}`,
                    background: bgColor,
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: mutedColor,
                      marginBottom: "4px",
                    }}
                  >
                    Interest Rate (%)
                  </label>
                  <input
                    data-testid="mortgage-rate"
                    type="number"
                    step="0.1"
                    value={mortgageRate}
                    onChange={(e) => setMortgageRate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: `1px solid ${borderColor}`,
                      background: bgColor,
                      color: textColor,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: mutedColor,
                      marginBottom: "4px",
                    }}
                  >
                    Term (years)
                  </label>
                  <input
                    data-testid="mortgage-term"
                    type="number"
                    value={mortgageTerm}
                    onChange={(e) => setMortgageTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: `1px solid ${borderColor}`,
                      background: bgColor,
                      color: textColor,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              {calculateMortgage && (
                <div
                  data-testid="mortgage-results"
                  style={{
                    background: bgColor,
                    borderRadius: "8px",
                    padding: "16px",
                    marginTop: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: mutedColor }}>Monthly Payment</span>
                    <span style={{ fontWeight: "700", fontSize: "18px" }}>
                      ${Number(calculateMortgage.monthly).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: mutedColor }}>Total Payment</span>
                    <span>
                      ${Number(calculateMortgage.total).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: mutedColor }}>Total Interest</span>
                    <span>
                      ${Number(calculateMortgage.interest).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div
        data-testid="notifications"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 2000,
        }}
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            data-testid={`notification-${n.id}`}
            style={{
              background: "#333",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}
