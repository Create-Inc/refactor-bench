import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PROPERTY_TYPES = ['house', 'apartment', 'condo', 'townhouse', 'land'];

const LOCATIONS = ['Downtown', 'Suburbs', 'Waterfront', 'Midtown', 'Uptown', 'Eastside'];

const AMENITIES_LIST = [
  'Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 'Fireplace',
  'Laundry', 'Storage', 'Elevator', 'Doorman', 'Rooftop', 'Pet-friendly',
];

const STATUS_COLORS = {
  active: '#22c55e',
  pending: '#eab308',
  sold: '#ef4444',
};

const MOCK_AGENTS = [
  { id: 'a1', name: 'Rachel Green', avatar: '👩‍💼', phone: '(555) 123-4567', email: 'rachel@realty.com', rating: 4.9, listings: 45 },
  { id: 'a2', name: 'Marcus Chen', avatar: '👨‍💼', phone: '(555) 234-5678', email: 'marcus@realty.com', rating: 4.7, listings: 32 },
  { id: 'a3', name: 'Sofia Rodriguez', avatar: '👩‍💼', phone: '(555) 345-6789', email: 'sofia@realty.com', rating: 4.8, listings: 28 },
  { id: 'a4', name: 'James Wilson', avatar: '👨‍💼', phone: '(555) 456-7890', email: 'james@realty.com', rating: 4.6, listings: 51 },
];

const INITIAL_PROPERTIES = [
  {
    id: 'p1', title: 'Modern Downtown Loft', type: 'apartment', status: 'active',
    price: 425000, location: 'Downtown', address: '123 Main St, Unit 4B',
    bedrooms: 2, bathrooms: 2, sqft: 1200, yearBuilt: 2019, lotSize: null,
    agent: 'a1', description: 'Stunning open-concept loft in the heart of downtown with floor-to-ceiling windows and premium finishes.',
    amenities: ['Gym', 'Parking', 'Elevator', 'Doorman', 'Rooftop'],
    images: ['🏙️', '🛋️', '🍳'], tags: ['new-construction', 'luxury'],
    openHouse: '2025-02-15', listed: Date.now() - 86400000 * 14,
    views: 342, saves: 28,
  },
  {
    id: 'p2', title: 'Charming Victorian House', type: 'house', status: 'active',
    price: 675000, location: 'Suburbs', address: '456 Oak Lane',
    bedrooms: 4, bathrooms: 3, sqft: 2800, yearBuilt: 1920, lotSize: 0.35,
    agent: 'a2', description: 'Beautifully restored Victorian with original woodwork, modern kitchen, and spacious backyard perfect for families.',
    amenities: ['Garden', 'Fireplace', 'Laundry', 'Storage', 'Parking'],
    images: ['🏡', '🌳', '🏠'], tags: ['historic', 'family-friendly'],
    openHouse: '2025-02-22', listed: Date.now() - 86400000 * 30,
    views: 567, saves: 45,
  },
  {
    id: 'p3', title: 'Luxury Waterfront Condo', type: 'condo', status: 'active',
    price: 890000, location: 'Waterfront', address: '789 Harbor View Dr, PH1',
    bedrooms: 3, bathrooms: 2.5, sqft: 2100, yearBuilt: 2022, lotSize: null,
    agent: 'a3', description: 'Penthouse condo with panoramic ocean views, private terrace, and resort-style amenities.',
    amenities: ['Pool', 'Gym', 'Balcony', 'Parking', 'Doorman', 'Elevator', 'Rooftop', 'Pet-friendly'],
    images: ['🌊', '🏖️', '☀️'], tags: ['waterfront', 'luxury', 'penthouse'],
    openHouse: null, listed: Date.now() - 86400000 * 7,
    views: 892, saves: 67,
  },
  {
    id: 'p4', title: 'Cozy Midtown Townhouse', type: 'townhouse', status: 'pending',
    price: 520000, location: 'Midtown', address: '321 Elm Street',
    bedrooms: 3, bathrooms: 2, sqft: 1800, yearBuilt: 2005, lotSize: 0.12,
    agent: 'a1', description: 'Well-maintained townhouse with private garage, updated kitchen, and rooftop deck in vibrant Midtown neighborhood.',
    amenities: ['Parking', 'Laundry', 'Rooftop', 'Storage'],
    images: ['🏘️', '🔑', '🌆'], tags: ['townhome', 'move-in-ready'],
    openHouse: null, listed: Date.now() - 86400000 * 45,
    views: 234, saves: 19,
  },
  {
    id: 'p5', title: 'Uptown Family Estate', type: 'house', status: 'active',
    price: 1250000, location: 'Uptown', address: '555 Maple Avenue',
    bedrooms: 5, bathrooms: 4, sqft: 4200, yearBuilt: 2015, lotSize: 0.75,
    agent: 'a4', description: 'Expansive family estate with chef\'s kitchen, home theater, wine cellar, and resort-style pool on a large landscaped lot.',
    amenities: ['Pool', 'Garden', 'Fireplace', 'Laundry', 'Storage', 'Parking', 'Gym'],
    images: ['🏰', '🎭', '🍷'], tags: ['luxury', 'estate', 'family-friendly'],
    openHouse: '2025-03-01', listed: Date.now() - 86400000 * 21,
    views: 1203, saves: 89,
  },
  {
    id: 'p6', title: 'Eastside Building Lot', type: 'land', status: 'active',
    price: 195000, location: 'Eastside', address: '888 Pine Road',
    bedrooms: 0, bathrooms: 0, sqft: 0, yearBuilt: null, lotSize: 1.2,
    agent: 'a2', description: 'Prime building lot in up-and-coming Eastside neighborhood with all utilities available and approved building plans.',
    amenities: [],
    images: ['🌿', '🗺️', '📐'], tags: ['investment', 'new-build'],
    openHouse: null, listed: Date.now() - 86400000 * 60,
    views: 156, saves: 12,
  },
  {
    id: 'p7', title: 'Downtown Studio Apartment', type: 'apartment', status: 'active',
    price: 275000, location: 'Downtown', address: '100 Center Blvd, Unit 2A',
    bedrooms: 1, bathrooms: 1, sqft: 550, yearBuilt: 2018, lotSize: null,
    agent: 'a3', description: 'Efficient studio apartment perfect for young professionals, with modern amenities and walkable location.',
    amenities: ['Gym', 'Elevator', 'Laundry', 'Pet-friendly'],
    images: ['🏢', '🛏️', '☕'], tags: ['starter', 'urban'],
    openHouse: '2025-02-20', listed: Date.now() - 86400000 * 10,
    views: 445, saves: 31,
  },
  {
    id: 'p8', title: 'Waterfront Beach House', type: 'house', status: 'sold',
    price: 1100000, location: 'Waterfront', address: '42 Coastal Highway',
    bedrooms: 4, bathrooms: 3, sqft: 3200, yearBuilt: 2010, lotSize: 0.5,
    agent: 'a4', description: 'Stunning beach house with direct ocean access, wraparound deck, and open floor plan designed for entertaining.',
    amenities: ['Pool', 'Garden', 'Balcony', 'Fireplace', 'Parking', 'Storage'],
    images: ['🏖️', '🐚', '🌅'], tags: ['beachfront', 'luxury'],
    openHouse: null, listed: Date.now() - 86400000 * 90,
    views: 2100, saves: 156,
  },
];

const formatPrice = (price) => {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
};

const formatFullPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

export default function RealEstateMarketplace() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('realEstateTheme') || 'light'; } catch { return 'light'; }
  });
  const [activeView, setActiveView] = useState(() => {
    try { return localStorage.getItem('realEstateView') || 'browse'; } catch { return 'browse'; }
  });
  const [properties, setProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('realEstateProperties');
      return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    } catch { return INITIAL_PROPERTIES; }
  });
  const [savedProperties, setSavedProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('savedProperties');
      return saved ? JSON.parse(saved) : ['p2', 'p3'];
    } catch { return ['p2', 'p3']; }
  });
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('compareList');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBedrooms, setFilterBedrooms] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000000 });
  const [sortBy, setSortBy] = useState('listed');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showMortgageCalc, setShowMortgageCalc] = useState(false);
  const [mortgagePrice, setMortgagePrice] = useState(500000);
  const [mortgageDown, setMortgageDown] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [mortgageTerm, setMortgageTerm] = useState(30);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [showContactSuccess, setShowContactSuccess] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('realEstateTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('realEstateView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('realEstateProperties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
  }, [savedProperties]);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (selectedProperty) { setSelectedProperty(null); setImageIndex(0); }
        else if (showMortgageCalc) setShowMortgageCalc(false);
        else if (showCompare) setShowCompare(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedProperty, showMortgageCalc, showCompare]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleSave = useCallback((propertyId) => {
    setSavedProperties((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  }, []);

  const toggleCompare = useCallback((propertyId) => {
    setCompareList((prev) => {
      if (prev.includes(propertyId)) return prev.filter((id) => id !== propertyId);
      if (prev.length >= 3) return prev;
      return [...prev, propertyId];
    });
  }, []);

  const filteredProperties = useMemo(() => {
    let result = [...properties];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          MOCK_AGENTS.find((a) => a.id === p.agent)?.name.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') result = result.filter((p) => p.type === filterType);
    if (filterLocation !== 'all') result = result.filter((p) => p.location === filterLocation);
    if (filterStatus !== 'all') result = result.filter((p) => p.status === filterStatus);
    if (filterBedrooms !== 'all') result = result.filter((p) => p.bedrooms >= parseInt(filterBedrooms));
    result = result.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'price') cmp = a.price - b.price;
      else if (sortBy === 'sqft') cmp = a.sqft - b.sqft;
      else if (sortBy === 'bedrooms') cmp = a.bedrooms - b.bedrooms;
      else if (sortBy === 'listed') cmp = a.listed - b.listed;
      else if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [properties, searchQuery, filterType, filterLocation, filterStatus, filterBedrooms, priceRange, sortBy, sortDir]);

  const stats = useMemo(() => ({
    total: properties.length,
    active: properties.filter((p) => p.status === 'active').length,
    pending: properties.filter((p) => p.status === 'pending').length,
    sold: properties.filter((p) => p.status === 'sold').length,
    avgPrice: Math.round(properties.reduce((s, p) => s + p.price, 0) / properties.length),
    totalViews: properties.reduce((s, p) => s + p.views, 0),
  }), [properties]);

  const monthlyPayment = useMemo(() => {
    const principal = mortgagePrice * (1 - mortgageDown / 100);
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = mortgageTerm * 12;
    if (monthlyRate === 0) return principal / numPayments;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }, [mortgagePrice, mortgageDown, mortgageRate, mortgageTerm]);

  const handleContactSubmit = useCallback((e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setShowContactSuccess(true);
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setShowContactSuccess(false), 3000);
  }, [contactForm]);

  const isDark = theme === 'dark';
  const bg = isDark ? '#1a1a2e' : '#f8fafc';
  const cardBg = isDark ? '#16213e' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const accentColor = '#3b82f6';
  const sidebarBg = isDark ? '#0f172a' : '#1e293b';

  const navItems = [
    { id: 'browse', icon: '🏠', label: 'Browse' },
    { id: 'saved', icon: '❤️', label: 'Saved' },
    { id: 'agents', icon: '👥', label: 'Agents' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
  ];

  const getAgent = (agentId) => MOCK_AGENTS.find((a) => a.id === agentId);

  const renderPropertyCard = (property) => {
    const agent = getAgent(property.agent);
    const isSaved = savedProperties.includes(property.id);
    const isComparing = compareList.includes(property.id);

    if (viewMode === 'list') {
      return (
        <div key={property.id} style={{ display: 'flex', background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ width: 200, minHeight: 140, background: isDark ? '#1e293b' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, cursor: 'pointer' }} onClick={() => { setSelectedProperty(property); setImageIndex(0); }}>
            {property.images[0]}
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, color: textColor, cursor: 'pointer' }} onClick={() => { setSelectedProperty(property); setImageIndex(0); }}>{property.title}</h3>
                <p style={{ margin: '4px 0 0', color: mutedColor, fontSize: 14 }}>{property.address}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ background: STATUS_COLORS[property.status], color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{property.status}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: accentColor }}>{formatFullPrice(property.price)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, color: mutedColor, fontSize: 14 }}>
              {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
              {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
              {property.sqft > 0 && <span>{property.sqft.toLocaleString()} sqft</span>}
              {property.lotSize && <span>{property.lotSize} acres</span>}
              <span>{property.type}</span>
              <span>{property.location}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <button aria-label={isSaved ? 'Unsave property' : 'Save property'} onClick={() => toggleSave(property.id)} style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, background: isSaved ? '#fef2f2' : 'transparent', color: isSaved ? '#ef4444' : mutedColor, cursor: 'pointer' }}>{isSaved ? '❤️ Saved' : '🤍 Save'}</button>
              <button onClick={() => toggleCompare(property.id)} style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, background: isComparing ? '#eff6ff' : 'transparent', color: isComparing ? accentColor : mutedColor, cursor: 'pointer' }}>{isComparing ? '✓ Comparing' : '⚖️ Compare'}</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={property.id} style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, overflow: 'hidden', transition: 'transform 0.2s' }}>
        <div style={{ height: 160, background: isDark ? '#1e293b' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative', cursor: 'pointer' }} onClick={() => { setSelectedProperty(property); setImageIndex(0); }}>
          {property.images[0]}
          <span style={{ position: 'absolute', top: 8, left: 8, background: STATUS_COLORS[property.status], color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{property.status}</span>
          <button aria-label={isSaved ? 'Unsave property' : 'Save property'} onClick={(e) => { e.stopPropagation(); toggleSave(property.id); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isSaved ? '❤️' : '🤍'}</button>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: textColor, cursor: 'pointer' }} onClick={() => { setSelectedProperty(property); setImageIndex(0); }}>{property.title}</h3>
            <span style={{ fontSize: 18, fontWeight: 700, color: accentColor, whiteSpace: 'nowrap' }}>{formatPrice(property.price)}</span>
          </div>
          <p style={{ margin: '0 0 8px', color: mutedColor, fontSize: 13 }}>{property.address}</p>
          <div style={{ display: 'flex', gap: 12, color: mutedColor, fontSize: 13, marginBottom: 8, flexWrap: 'wrap' }}>
            {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
            {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
            {property.sqft > 0 && <span>{property.sqft.toLocaleString()} sqft</span>}
            {property.lotSize && <span>{property.lotSize} acres</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {property.tags.map((tag) => (
              <span key={tag} style={{ background: isDark ? '#334155' : '#f1f5f9', color: mutedColor, padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>{tag}</span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{agent?.avatar}</span>
              <span style={{ fontSize: 12, color: mutedColor }}>{agent?.name}</span>
            </div>
            <button onClick={() => toggleCompare(property.id)} style={{ padding: '2px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: isComparing ? '#eff6ff' : 'transparent', color: isComparing ? accentColor : mutedColor, cursor: 'pointer', fontSize: 12 }}>{isComparing ? '✓ Compare' : '⚖️ Compare'}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderBrowseView = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <span style={{ color: mutedColor, fontSize: 14 }}>{filteredProperties.length} properties</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label htmlFor="sort-select" style={{ color: mutedColor, fontSize: 14 }}>Sort by:</label>
          <select id="sort-select" aria-label="Sort properties" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, fontSize: 13 }}>
            <option value="listed">Date Listed</option>
            <option value="price">Price</option>
            <option value="sqft">Square Feet</option>
            <option value="bedrooms">Bedrooms</option>
            <option value="title">Title</option>
          </select>
          <button onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, cursor: 'pointer', fontSize: 13 }}>{sortDir === 'asc' ? '↑' : '↓'}</button>
          <button onClick={() => setViewMode('grid')} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: viewMode === 'grid' ? accentColor : cardBg, color: viewMode === 'grid' ? '#fff' : textColor, cursor: 'pointer' }} aria-label="Grid view">▦</button>
          <button onClick={() => setViewMode('list')} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: viewMode === 'list' ? accentColor : cardBg, color: viewMode === 'list' ? '#fff' : textColor, cursor: 'pointer' }} aria-label="List view">☰</button>
        </div>
      </div>
      {filteredProperties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: mutedColor }}>
          <p style={{ fontSize: 48 }}>🏚️</p>
          <p>No properties match your criteria</p>
          <button onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterLocation('all'); setFilterStatus('all'); setFilterBedrooms('all'); setPriceRange({ min: 0, max: 2000000 }); }} style={{ padding: '8px 16px', borderRadius: 8, background: accentColor, color: '#fff', border: 'none', cursor: 'pointer', marginTop: 8 }}>Clear Filters</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredProperties.map(renderPropertyCard)}
        </div>
      ) : (
        <div>{filteredProperties.map(renderPropertyCard)}</div>
      )}
    </div>
  );

  const renderSavedView = () => {
    const savedProps = properties.filter((p) => savedProperties.includes(p.id));
    return (
      <div>
        <h2 style={{ margin: '0 0 16px', color: textColor }}>Saved Properties</h2>
        {savedProps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: mutedColor }}>
            <p style={{ fontSize: 48 }}>💔</p>
            <p>No saved properties yet. Browse listings and save your favorites!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {savedProps.map(renderPropertyCard)}
          </div>
        )}
      </div>
    );
  };

  const renderAgentsView = () => (
    <div>
      <h2 style={{ margin: '0 0 16px', color: textColor }}>Our Agents</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {MOCK_AGENTS.map((agent) => {
          const agentListings = properties.filter((p) => p.agent === agent.id);
          const soldCount = agentListings.filter((p) => p.status === 'sold').length;
          return (
            <div key={agent.id} style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{agent.avatar}</div>
              <h3 style={{ margin: '0 0 4px', color: textColor }}>{agent.name}</h3>
              <p style={{ margin: '0 0 4px', color: mutedColor, fontSize: 14 }}>{agent.email}</p>
              <p style={{ margin: '0 0 12px', color: mutedColor, fontSize: 14 }}>{agent.phone}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} style={{ color: star <= Math.round(agent.rating) ? '#fbbf24' : '#d1d5db', fontSize: 16 }}>★</span>
                ))}
                <span style={{ color: mutedColor, fontSize: 14 }}>({agent.rating})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: `1px solid ${borderColor}`, paddingTop: 12 }}>
                <div><div style={{ fontSize: 18, fontWeight: 700, color: textColor }}>{agent.listings}</div><div style={{ fontSize: 12, color: mutedColor }}>Listings</div></div>
                <div><div style={{ fontSize: 18, fontWeight: 700, color: textColor }}>{soldCount}</div><div style={{ fontSize: 12, color: mutedColor }}>Sold</div></div>
                <div><div style={{ fontSize: 18, fontWeight: 700, color: textColor }}>{agentListings.length}</div><div style={{ fontSize: 12, color: mutedColor }}>Active</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div>
      <h2 style={{ margin: '0 0 16px', color: textColor }}>Market Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20 }}>
          <div style={{ fontSize: 12, color: mutedColor, textTransform: 'uppercase', marginBottom: 4 }}>Total Listings</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: textColor }}>{stats.total}</div>
        </div>
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20 }}>
          <div style={{ fontSize: 12, color: mutedColor, textTransform: 'uppercase', marginBottom: 4 }}>Active</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{stats.active}</div>
        </div>
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20 }}>
          <div style={{ fontSize: 12, color: mutedColor, textTransform: 'uppercase', marginBottom: 4 }}>Pending</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#eab308' }}>{stats.pending}</div>
        </div>
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20 }}>
          <div style={{ fontSize: 12, color: mutedColor, textTransform: 'uppercase', marginBottom: 4 }}>Sold</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{stats.sold}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', color: textColor }}>Average Price</h3>
          <div style={{ fontSize: 24, fontWeight: 700, color: accentColor }}>{formatFullPrice(stats.avgPrice)}</div>
        </div>
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', color: textColor }}>Total Views</h3>
          <div style={{ fontSize: 24, fontWeight: 700, color: accentColor }}>{stats.totalViews.toLocaleString()}</div>
        </div>
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20, gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 12px', color: textColor }}>Properties by Type</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {PROPERTY_TYPES.map((type) => {
              const count = properties.filter((p) => p.type === type).length;
              return (
                <div key={type} style={{ flex: '1 1 100px', textAlign: 'center', padding: 12, background: isDark ? '#1e293b' : '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: textColor }}>{count}</div>
                  <div style={{ fontSize: 12, color: mutedColor, textTransform: 'capitalize' }}>{type}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: 20, gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 12px', color: textColor }}>Properties by Location</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {LOCATIONS.map((loc) => {
              const count = properties.filter((p) => p.location === loc).length;
              const totalValue = properties.filter((p) => p.location === loc).reduce((s, p) => s + p.price, 0);
              return (
                <div key={loc} style={{ flex: '1 1 120px', textAlign: 'center', padding: 12, background: isDark ? '#1e293b' : '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: textColor }}>{count}</div>
                  <div style={{ fontSize: 12, color: mutedColor }}>{loc}</div>
                  <div style={{ fontSize: 11, color: accentColor }}>{formatPrice(totalValue)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPropertyDetail = () => {
    if (!selectedProperty) return null;
    const agent = getAgent(selectedProperty.agent);
    const isSaved = savedProperties.includes(selectedProperty.id);

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 20, zIndex: 1000, overflowY: 'auto' }} onClick={() => { setSelectedProperty(null); setImageIndex(0); }}>
        <div style={{ background: cardBg, borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${borderColor}` }}>
            <h2 style={{ margin: 0, color: textColor }}>{selectedProperty.title}</h2>
            <button onClick={() => { setSelectedProperty(null); setImageIndex(0); }} style={{ background: 'none', border: 'none', fontSize: 24, color: mutedColor, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ height: 300, background: isDark ? '#1e293b' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, position: 'relative' }}>
            {selectedProperty.images[imageIndex]}
            {selectedProperty.images.length > 1 && (
              <>
                <button aria-label="Previous image" onClick={() => setImageIndex((i) => (i - 1 + selectedProperty.images.length) % selectedProperty.images.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>←</button>
                <button aria-label="Next image" onClick={() => setImageIndex((i) => (i + 1) % selectedProperty.images.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>→</button>
              </>
            )}
            <div style={{ position: 'absolute', bottom: 8, display: 'flex', gap: 6 }}>
              {selectedProperty.images.map((_, idx) => (
                <button key={idx} aria-label={`View image ${idx + 1}`} onClick={() => setImageIndex(idx)} style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', background: idx === imageIndex ? accentColor : 'rgba(255,255,255,0.6)', cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 28, fontWeight: 700, color: accentColor }}>{formatFullPrice(selectedProperty.price)}</span>
                <span style={{ marginLeft: 12, background: STATUS_COLORS[selectedProperty.status], color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{selectedProperty.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button aria-label={isSaved ? 'Unsave property' : 'Save property'} onClick={() => toggleSave(selectedProperty.id)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isSaved ? '#fef2f2' : 'transparent', color: isSaved ? '#ef4444' : mutedColor, cursor: 'pointer', fontSize: 14 }}>{isSaved ? '❤️ Saved' : '🤍 Save'}</button>
                <button onClick={() => { setMortgagePrice(selectedProperty.price); setShowMortgageCalc(true); }} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${borderColor}`, background: 'transparent', color: textColor, cursor: 'pointer', fontSize: 14 }}>🧮 Calculator</button>
              </div>
            </div>
            <p style={{ color: mutedColor, fontSize: 14, marginBottom: 4 }}>{selectedProperty.address}</p>
            <div style={{ display: 'flex', gap: 20, color: mutedColor, fontSize: 14, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ textTransform: 'capitalize' }}>{selectedProperty.type}</span>
              <span>{selectedProperty.location}</span>
              {selectedProperty.bedrooms > 0 && <span>{selectedProperty.bedrooms} Bedrooms</span>}
              {selectedProperty.bathrooms > 0 && <span>{selectedProperty.bathrooms} Bathrooms</span>}
              {selectedProperty.sqft > 0 && <span>{selectedProperty.sqft.toLocaleString()} sqft</span>}
              {selectedProperty.lotSize && <span>{selectedProperty.lotSize} acres</span>}
              {selectedProperty.yearBuilt && <span>Built {selectedProperty.yearBuilt}</span>}
            </div>
            <h3 style={{ margin: '0 0 8px', color: textColor }}>Description</h3>
            <p style={{ color: mutedColor, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{selectedProperty.description}</p>
            {selectedProperty.amenities.length > 0 && (
              <>
                <h3 style={{ margin: '0 0 8px', color: textColor }}>Amenities</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {selectedProperty.amenities.map((amenity) => (
                    <span key={amenity} style={{ background: isDark ? '#334155' : '#f1f5f9', color: textColor, padding: '4px 12px', borderRadius: 6, fontSize: 13 }}>{amenity}</span>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {selectedProperty.tags.map((tag) => (
                <span key={tag} style={{ background: isDark ? '#1e3a5f' : '#eff6ff', color: accentColor, padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>#{tag}</span>
              ))}
            </div>
            {selectedProperty.openHouse && (
              <div style={{ background: isDark ? '#1e3a5f' : '#eff6ff', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <span style={{ color: accentColor, fontWeight: 600 }}>🏡 Open House: {new Date(selectedProperty.openHouse).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, color: mutedColor, fontSize: 13 }}>
              <span>👁️ {selectedProperty.views} views</span>
              <span>❤️ {selectedProperty.saves} saves</span>
              <span>📅 Listed {Math.round((Date.now() - selectedProperty.listed) / 86400000)} days ago</span>
            </div>
            <div style={{ background: isDark ? '#1e293b' : '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 12px', color: textColor }}>Listing Agent</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 36 }}>{agent?.avatar}</span>
                <div>
                  <div style={{ fontWeight: 600, color: textColor }}>{agent?.name}</div>
                  <div style={{ color: mutedColor, fontSize: 13 }}>{agent?.email}</div>
                  <div style={{ color: mutedColor, fontSize: 13 }}>{agent?.phone}</div>
                </div>
              </div>
            </div>
            <div style={{ background: isDark ? '#1e293b' : '#f8fafc', padding: 16, borderRadius: 12 }}>
              <h3 style={{ margin: '0 0 12px', color: textColor }}>Contact Agent</h3>
              {showContactSuccess && <div style={{ background: '#22c55e', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>Message sent successfully!</div>}
              <form onSubmit={handleContactSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input name="contactName" placeholder="Your Name *" value={contactForm.name} onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor }} />
                  <input name="contactEmail" placeholder="Email *" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor }} />
                </div>
                <input name="contactPhone" placeholder="Phone" value={contactForm.phone} onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginBottom: 8, boxSizing: 'border-box' }} />
                <textarea name="contactMessage" placeholder="Message" value={contactForm.message} onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))} rows={3} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginBottom: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                <button type="submit" style={{ width: '100%', padding: '10px 16px', borderRadius: 8, background: accentColor, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMortgageCalculator = () => {
    if (!showMortgageCalc) return null;
    const principal = mortgagePrice * (1 - mortgageDown / 100);
    const totalPaid = monthlyPayment * mortgageTerm * 12;
    const totalInterest = totalPaid - principal;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowMortgageCalc(false)}>
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, width: '100%', maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: textColor }}>Mortgage Calculator</h2>
            <button onClick={() => setShowMortgageCalc(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: mutedColor, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
            <label style={{ color: mutedColor, fontSize: 13 }}>Home Price
              <input type="number" value={mortgagePrice} onChange={(e) => setMortgagePrice(Number(e.target.value))} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginTop: 4, boxSizing: 'border-box' }} />
            </label>
            <label style={{ color: mutedColor, fontSize: 13 }}>Down Payment (%)
              <input type="number" value={mortgageDown} onChange={(e) => setMortgageDown(Number(e.target.value))} min={0} max={100} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginTop: 4, boxSizing: 'border-box' }} />
            </label>
            <label style={{ color: mutedColor, fontSize: 13 }}>Interest Rate (%)
              <input type="number" value={mortgageRate} onChange={(e) => setMortgageRate(Number(e.target.value))} step={0.1} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginTop: 4, boxSizing: 'border-box' }} />
            </label>
            <label style={{ color: mutedColor, fontSize: 13 }}>Loan Term
              <select value={mortgageTerm} onChange={(e) => setMortgageTerm(Number(e.target.value))} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, marginTop: 4 }}>
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={30}>30 years</option>
              </select>
            </label>
          </div>
          <div style={{ background: isDark ? '#1e293b' : '#f8fafc', padding: 16, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: mutedColor, textTransform: 'uppercase', marginBottom: 4 }}>Monthly Payment</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: accentColor }}>{formatFullPrice(Math.round(monthlyPayment))}</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16, borderTop: `1px solid ${borderColor}`, paddingTop: 12 }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{formatFullPrice(Math.round(principal))}</div><div style={{ fontSize: 11, color: mutedColor }}>Principal</div></div>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{formatFullPrice(Math.round(totalInterest))}</div><div style={{ fontSize: 11, color: mutedColor }}>Total Interest</div></div>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{formatFullPrice(Math.round(totalPaid))}</div><div style={{ fontSize: 11, color: mutedColor }}>Total Paid</div></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompareView = () => {
    if (!showCompare) return null;
    const compareProperties = properties.filter((p) => compareList.includes(p.id));
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 20, zIndex: 1000, overflowY: 'auto' }} onClick={() => setShowCompare(false)}>
        <div style={{ background: cardBg, borderRadius: 16, width: '100%', maxWidth: 900, padding: 24 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: textColor }}>Compare Properties</h2>
            <button onClick={() => setShowCompare(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: mutedColor, cursor: 'pointer' }}>×</button>
          </div>
          {compareProperties.length === 0 ? (
            <p style={{ color: mutedColor, textAlign: 'center', padding: 24 }}>Add properties to compare by clicking the compare button on listings.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: `2px solid ${borderColor}`, color: mutedColor, fontSize: 13 }}>Feature</th>
                    {compareProperties.map((p) => (
                      <th key={p.id} style={{ padding: 12, textAlign: 'center', borderBottom: `2px solid ${borderColor}`, color: textColor, fontSize: 14, minWidth: 150 }}>
                        <div>{p.images[0]}</div>
                        {p.title}
                        <button onClick={() => toggleCompare(p.id)} style={{ display: 'block', margin: '4px auto 0', padding: '2px 8px', borderRadius: 4, border: `1px solid ${borderColor}`, background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 11 }}>Remove</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Price', key: (p) => formatFullPrice(p.price) },
                    { label: 'Type', key: (p) => p.type },
                    { label: 'Location', key: (p) => p.location },
                    { label: 'Bedrooms', key: (p) => p.bedrooms },
                    { label: 'Bathrooms', key: (p) => p.bathrooms },
                    { label: 'Sq Ft', key: (p) => p.sqft > 0 ? p.sqft.toLocaleString() : 'N/A' },
                    { label: 'Lot Size', key: (p) => p.lotSize ? `${p.lotSize} acres` : 'N/A' },
                    { label: 'Year Built', key: (p) => p.yearBuilt || 'N/A' },
                    { label: 'Status', key: (p) => p.status },
                    { label: 'Amenities', key: (p) => p.amenities.length },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${borderColor}`, color: mutedColor, fontSize: 13, fontWeight: 600 }}>{row.label}</td>
                      {compareProperties.map((p) => (
                        <td key={p.id} style={{ padding: '10px 12px', borderBottom: `1px solid ${borderColor}`, color: textColor, fontSize: 13, textAlign: 'center', textTransform: 'capitalize' }}>{row.key(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? 60 : 240, background: sidebarBg, color: '#e2e8f0', display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? '16px 8px' : 16, borderBottom: '1px solid #334155' }}>
          {!sidebarCollapsed && <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🏘️ HomeFind</h1>}
          {sidebarCollapsed && <span style={{ fontSize: 20, display: 'block', textAlign: 'center' }}>🏘️</span>}
        </div>
        <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed((c) => !c)} style={{ padding: 8, margin: 8, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'center', fontSize: 16 }}>{sidebarCollapsed ? '→' : '←'}</button>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: sidebarCollapsed ? '10px 0' : '10px 16px', background: activeView === item.id ? 'rgba(59,130,246,0.2)' : 'transparent', border: 'none', color: activeView === item.id ? '#3b82f6' : '#94a3b8', cursor: 'pointer', fontSize: 14, justifyContent: sidebarCollapsed ? 'center' : 'flex-start', borderLeft: activeView === item.id ? '3px solid #3b82f6' : '3px solid transparent' }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!sidebarCollapsed && item.label}
            </button>
          ))}
        </nav>
        {!sidebarCollapsed && (
          <div style={{ padding: 16, borderTop: '1px solid #334155' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{stats.active} active listings</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{savedProperties.length} saved</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${borderColor}`, background: cardBg, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input ref={searchRef} type="text" placeholder="Search properties... (Ctrl+K)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: '1 1 200px', padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: 14 }} />
          <select aria-label="Filter by type" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: 13 }}>
            <option value="all">All Types</option>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select aria-label="Filter by location" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: 13 }}>
            <option value="all">All Locations</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select aria-label="Filter by status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: 13 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
          </select>
          <select aria-label="Filter by bedrooms" value={filterBedrooms} onChange={(e) => setFilterBedrooms(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: 13 }}>
            <option value="all">Any Beds</option>
            <option value="1">1+ Beds</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label htmlFor="price-min" style={{ color: mutedColor, fontSize: 12 }}>Price:</label>
            <input id="price-min" type="number" placeholder="Min" value={priceRange.min || ''} onChange={(e) => setPriceRange((r) => ({ ...r, min: Number(e.target.value) || 0 }))} style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: 12 }} />
            <span style={{ color: mutedColor }}>-</span>
            <input id="price-max" type="number" placeholder="Max" value={priceRange.max || ''} onChange={(e) => setPriceRange((r) => ({ ...r, max: Number(e.target.value) || 2000000 }))} style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: 12 }} />
          </div>
          {compareList.length > 0 && (
            <button onClick={() => setShowCompare(true)} style={{ padding: '8px 16px', borderRadius: 8, background: accentColor, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>⚖️ Compare ({compareList.length})</button>
          )}
          <button onClick={() => setShowMortgageCalc(true)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, cursor: 'pointer', fontSize: 13 }}>🧮 Calculator</button>
          <button aria-label="Toggle theme" onClick={toggleTheme} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, color: textColor, cursor: 'pointer', fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {activeView === 'browse' && renderBrowseView()}
          {activeView === 'saved' && renderSavedView()}
          {activeView === 'agents' && renderAgentsView()}
          {activeView === 'analytics' && renderAnalyticsView()}
        </div>
      </div>

      {renderPropertyDetail()}
      {renderMortgageCalculator()}
      {renderCompareView()}
    </div>
  );
}
