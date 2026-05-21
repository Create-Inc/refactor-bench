import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  JPY: { symbol: '¥', rate: 149.5 },
};

const WEATHER_ICONS = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⛈️',
  windy: '💨',
  partly_cloudy: '⛅',
};

const ACTIVITY_CATEGORIES = ['sightseeing', 'food', 'transportation', 'accommodation', 'shopping', 'entertainment', 'outdoor', 'culture'];

const CATEGORY_ICONS = {
  sightseeing: '📸',
  food: '🍽️',
  transportation: '🚗',
  accommodation: '🏨',
  shopping: '🛍️',
  entertainment: '🎭',
  outdoor: '🏔️',
  culture: '🏛️',
};

const CATEGORY_COLORS = {
  sightseeing: '#3b82f6',
  food: '#f97316',
  transportation: '#8b5cf6',
  accommodation: '#ec4899',
  shopping: '#14b8a6',
  entertainment: '#eab308',
  outdoor: '#22c55e',
  culture: '#6366f1',
};

const MOCK_DESTINATIONS = [
  { id: 'd1', name: 'Tokyo', country: 'Japan', timezone: 'JST (UTC+9)', language: 'Japanese', currency: 'JPY', image: '🗼', weather: 'partly_cloudy', tempHigh: 22, tempLow: 14 },
  { id: 'd2', name: 'Paris', country: 'France', timezone: 'CET (UTC+1)', language: 'French', currency: 'EUR', image: '🗼', weather: 'cloudy', tempHigh: 18, tempLow: 10 },
  { id: 'd3', name: 'New York', country: 'USA', timezone: 'EST (UTC-5)', language: 'English', currency: 'USD', image: '🗽', weather: 'sunny', tempHigh: 25, tempLow: 16 },
  { id: 'd4', name: 'London', country: 'UK', timezone: 'GMT (UTC+0)', language: 'English', currency: 'GBP', image: '🎡', weather: 'rainy', tempHigh: 15, tempLow: 8 },
  { id: 'd5', name: 'Sydney', country: 'Australia', timezone: 'AEST (UTC+10)', language: 'English', currency: 'USD', image: '🏖️', weather: 'sunny', tempHigh: 28, tempLow: 20 },
];

const INITIAL_TRIPS = [
  {
    id: 'trip1',
    name: 'Japan Adventure',
    description: 'Two-week exploration of Japanese culture, cuisine, and landscapes.',
    startDate: '2025-06-15',
    endDate: '2025-06-29',
    destination: 'd1',
    status: 'planning',
    budget: 5000,
    currency: 'USD',
    coverImage: '🗾',
    collaborators: [
      { id: 'u1', name: 'Alex Rivera', email: 'alex@example.com', role: 'organizer', avatar: '👤' },
      { id: 'u2', name: 'Sam Chen', email: 'sam@example.com', role: 'editor', avatar: '👤' },
    ],
    days: [
      {
        date: '2025-06-15',
        activities: [
          { id: 'a1', name: 'Arrive at Narita Airport', time: '14:00', endTime: '16:00', category: 'transportation', cost: 0, notes: 'Flight JL123. Pick up JR Rail Pass at airport.', booked: true, rating: null, address: 'Narita International Airport' },
          { id: 'a2', name: 'Check in at Shinjuku Hotel', time: '17:00', endTime: '18:00', category: 'accommodation', cost: 150, notes: 'Booking ref: HT-8834. Near Shinjuku station.', booked: true, rating: null, address: 'Shinjuku, Tokyo' },
          { id: 'a3', name: 'Dinner at Omoide Yokocho', time: '19:00', endTime: '21:00', category: 'food', cost: 30, notes: 'Try yakitori and ramen. Cash preferred.', booked: false, rating: null, address: 'Omoide Yokocho, Shinjuku' },
        ],
      },
      {
        date: '2025-06-16',
        activities: [
          { id: 'a4', name: 'Meiji Shrine visit', time: '08:00', endTime: '10:00', category: 'culture', cost: 0, notes: 'Free entry. Arrive early to avoid crowds.', booked: false, rating: null, address: 'Meiji Jingu, Shibuya' },
          { id: 'a5', name: 'Harajuku shopping', time: '10:30', endTime: '13:00', category: 'shopping', cost: 100, notes: 'Takeshita Street and Omotesando Hills.', booked: false, rating: null, address: 'Harajuku, Shibuya' },
          { id: 'a6', name: 'Lunch at conveyor belt sushi', time: '13:00', endTime: '14:00', category: 'food', cost: 20, notes: 'Genki Sushi in Shibuya.', booked: false, rating: null, address: 'Shibuya, Tokyo' },
          { id: 'a7', name: 'Shibuya Crossing & Hachiko statue', time: '14:30', endTime: '15:30', category: 'sightseeing', cost: 0, notes: 'Iconic scramble crossing. Photo opportunities.', booked: false, rating: null, address: 'Shibuya Crossing, Tokyo' },
          { id: 'a8', name: 'TeamLab Borderless', time: '16:00', endTime: '19:00', category: 'entertainment', cost: 35, notes: 'Pre-book tickets online. Wear comfortable shoes.', booked: true, rating: null, address: 'Odaiba, Tokyo' },
        ],
      },
      {
        date: '2025-06-17',
        activities: [
          { id: 'a9', name: 'Day trip to Mt. Fuji', time: '07:00', endTime: '18:00', category: 'outdoor', cost: 80, notes: 'Guided tour from Shinjuku. Includes 5th station visit and Hakone.', booked: true, rating: null, address: 'Mt. Fuji, Yamanashi' },
          { id: 'a10', name: 'Onsen at Hakone', time: '15:00', endTime: '17:00', category: 'entertainment', cost: 25, notes: 'Traditional hot spring bath. Bring small towel.', booked: false, rating: null, address: 'Hakone, Kanagawa' },
        ],
      },
    ],
    packingList: [
      { id: 'p1', item: 'Passport', packed: true, category: 'documents' },
      { id: 'p2', item: 'JR Rail Pass voucher', packed: true, category: 'documents' },
      { id: 'p3', item: 'Travel adapter (Type A)', packed: false, category: 'electronics' },
      { id: 'p4', item: 'Portable WiFi device', packed: false, category: 'electronics' },
      { id: 'p5', item: 'Comfortable walking shoes', packed: true, category: 'clothing' },
      { id: 'p6', item: 'Rain jacket', packed: false, category: 'clothing' },
      { id: 'p7', item: 'Sunscreen', packed: false, category: 'toiletries' },
      { id: 'p8', item: 'First aid kit', packed: false, category: 'health' },
      { id: 'p9', item: 'Camera with extra batteries', packed: true, category: 'electronics' },
      { id: 'p10', item: 'Japanese phrasebook', packed: false, category: 'documents' },
    ],
    notes: 'Remember to exchange some cash at the airport. Most small shops only accept cash.',
  },
];

export default function TravelItineraryPlanner() {
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [selectedTripId, setSelectedTripId] = useState('trip1');
  const [activeView, setActiveView] = useState('itinerary');
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAddCollaboratorModal, setShowAddCollaboratorModal] = useState(false);
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);
  const [showTripSettings, setShowTripSettings] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortActivitiesBy, setSortActivitiesBy] = useState('time');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [draggedActivity, setDraggedActivity] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newPackingItem, setNewPackingItem] = useState('');
  const [packingFilterCategory, setPackingFilterCategory] = useState('all');
  const [selectedDayForActivity, setSelectedDayForActivity] = useState(0);
  const [editingTripNotes, setEditingTripNotes] = useState(false);
  const [tripNotesValue, setTripNotesValue] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const searchInputRef = useRef(null);

  const selectedTrip = useMemo(() => trips.find((t) => t.id === selectedTripId) || trips[0], [trips, selectedTripId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('travelPlannerTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
    const savedTrips = localStorage.getItem('travelPlannerTrips');
    if (savedTrips) {
      try {
        setTrips(JSON.parse(savedTrips));
      } catch (e) {
        /* ignore corrupted data */
      }
    }
    const savedView = localStorage.getItem('travelPlannerView');
    if (savedView) setActiveView(savedView);
    const savedCurrency = localStorage.getItem('travelPlannerCurrency');
    if (savedCurrency && CURRENCIES[savedCurrency]) setCurrency(savedCurrency);
  }, []);

  useEffect(() => {
    localStorage.setItem('travelPlannerTrips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('travelPlannerTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('travelPlannerView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('travelPlannerCurrency', currency);
  }, [currency]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowCreateTripModal(false);
        setShowAddActivityModal(false);
        setShowAddCollaboratorModal(false);
        setShowDestinationSearch(false);
        setShowTripSettings(false);
        setShowNotifications(false);
        setEditingActivityId(null);
        setShowShareModal(false);
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = useCallback((message) => {
    setNotifications((prev) => [{ id: Date.now().toString(), message, timestamp: Date.now(), read: false }, ...prev]);
  }, []);

  const convertCurrency = useCallback(
    (amount, fromCurrency = 'USD') => {
      const fromRate = CURRENCIES[fromCurrency]?.rate || 1;
      const toRate = CURRENCIES[currency]?.rate || 1;
      return (amount / fromRate) * toRate;
    },
    [currency]
  );

  const formatCurrency = useCallback(
    (amount) => {
      const symbol = CURRENCIES[currency]?.symbol || '$';
      const converted = convertCurrency(amount);
      return `${symbol}${converted.toFixed(2)}`;
    },
    [currency, convertCurrency]
  );

  const getTripDuration = useCallback((trip) => {
    if (!trip.startDate || !trip.endDate) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  const getTotalSpent = useCallback(
    (trip) => {
      return trip.days.reduce((total, day) => {
        return total + day.activities.reduce((dayTotal, act) => dayTotal + (act.cost || 0), 0);
      }, 0);
    },
    []
  );

  const getBudgetPercentage = useCallback(
    (trip) => {
      const spent = getTotalSpent(trip);
      if (trip.budget <= 0) return 0;
      return Math.min((spent / trip.budget) * 100, 100);
    },
    [getTotalSpent]
  );

  const getPackingProgress = useCallback((trip) => {
    if (!trip.packingList || trip.packingList.length === 0) return 0;
    const packed = trip.packingList.filter((item) => item.packed).length;
    return Math.round((packed / trip.packingList.length) * 100);
  }, []);

  const getCategoryBreakdown = useCallback((trip) => {
    const breakdown = {};
    trip.days.forEach((day) => {
      day.activities.forEach((act) => {
        if (!breakdown[act.category]) breakdown[act.category] = { count: 0, cost: 0 };
        breakdown[act.category].count += 1;
        breakdown[act.category].cost += act.cost || 0;
      });
    });
    return breakdown;
  }, []);

  const handleCreateTrip = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.target;
      const newTrip = {
        id: `trip${Date.now()}`,
        name: form.name.value,
        description: form.description.value,
        startDate: form.startDate.value,
        endDate: form.endDate.value,
        destination: form.destination.value,
        status: 'planning',
        budget: parseFloat(form.budget.value) || 0,
        currency: currency,
        coverImage: '🌍',
        collaborators: [{ id: 'u1', name: 'Alex Rivera', email: 'alex@example.com', role: 'organizer', avatar: '👤' }],
        days: [],
        packingList: [],
        notes: '',
      };
      const startDate = new Date(form.startDate.value);
      const endDate = new Date(form.endDate.value);
      const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        newTrip.days.push({ date: date.toISOString().split('T')[0], activities: [] });
      }
      setTrips((prev) => [...prev, newTrip]);
      setSelectedTripId(newTrip.id);
      setShowCreateTripModal(false);
      addNotification(`Trip "${newTrip.name}" created`);
    },
    [currency, addNotification]
  );

  const handleDeleteTrip = useCallback(
    (tripId) => {
      if (!window.confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;
      const trip = trips.find((t) => t.id === tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      if (selectedTripId === tripId) {
        setSelectedTripId(trips[0]?.id || null);
      }
      addNotification(`Trip "${trip?.name}" deleted`);
    },
    [trips, selectedTripId, addNotification]
  );

  const handleAddActivity = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.target;
      const newActivity = {
        id: `a${Date.now()}`,
        name: form.activityName.value,
        time: form.startTime.value,
        endTime: form.endTime.value,
        category: form.category.value,
        cost: parseFloat(form.cost.value) || 0,
        notes: form.notes.value,
        booked: form.booked.checked,
        rating: null,
        address: form.address.value,
      };
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          const newDays = [...trip.days];
          newDays[selectedDayForActivity] = {
            ...newDays[selectedDayForActivity],
            activities: [...newDays[selectedDayForActivity].activities, newActivity],
          };
          return { ...trip, days: newDays };
        })
      );
      setShowAddActivityModal(false);
      addNotification(`Activity "${newActivity.name}" added`);
    },
    [selectedTripId, selectedDayForActivity, addNotification]
  );

  const handleDeleteActivity = useCallback(
    (dayIndex, activityId) => {
      if (!window.confirm('Delete this activity?')) return;
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          const newDays = [...trip.days];
          newDays[dayIndex] = {
            ...newDays[dayIndex],
            activities: newDays[dayIndex].activities.filter((a) => a.id !== activityId),
          };
          return { ...trip, days: newDays };
        })
      );
    },
    [selectedTripId]
  );

  const handleRateActivity = useCallback(
    (dayIndex, activityId, rating) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          const newDays = [...trip.days];
          newDays[dayIndex] = {
            ...newDays[dayIndex],
            activities: newDays[dayIndex].activities.map((a) => (a.id === activityId ? { ...a, rating } : a)),
          };
          return { ...trip, days: newDays };
        })
      );
    },
    [selectedTripId]
  );

  const handleToggleBooked = useCallback(
    (dayIndex, activityId) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          const newDays = [...trip.days];
          newDays[dayIndex] = {
            ...newDays[dayIndex],
            activities: newDays[dayIndex].activities.map((a) => (a.id === activityId ? { ...a, booked: !a.booked } : a)),
          };
          return { ...trip, days: newDays };
        })
      );
    },
    [selectedTripId]
  );

  const handleTogglePackingItem = useCallback(
    (itemId) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          return {
            ...trip,
            packingList: trip.packingList.map((item) => (item.id === itemId ? { ...item, packed: !item.packed } : item)),
          };
        })
      );
    },
    [selectedTripId]
  );

  const handleAddPackingItem = useCallback(
    (e) => {
      e.preventDefault();
      if (!newPackingItem.trim()) return;
      const newItem = { id: `p${Date.now()}`, item: newPackingItem.trim(), packed: false, category: 'other' };
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          return { ...trip, packingList: [...trip.packingList, newItem] };
        })
      );
      setNewPackingItem('');
      addNotification(`"${newItem.item}" added to packing list`);
    },
    [selectedTripId, newPackingItem, addNotification]
  );

  const handleDeletePackingItem = useCallback(
    (itemId) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          return { ...trip, packingList: trip.packingList.filter((item) => item.id !== itemId) };
        })
      );
    },
    [selectedTripId]
  );

  const handleAddCollaborator = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.target;
      const newCollaborator = {
        id: `u${Date.now()}`,
        name: form.collabName.value,
        email: form.collabEmail.value,
        role: form.collabRole.value,
        avatar: '👤',
      };
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          return { ...trip, collaborators: [...trip.collaborators, newCollaborator] };
        })
      );
      setShowAddCollaboratorModal(false);
      addNotification(`${newCollaborator.name} added as collaborator`);
    },
    [selectedTripId, addNotification]
  );

  const handleRemoveCollaborator = useCallback(
    (collabId) => {
      if (!window.confirm('Remove this collaborator?')) return;
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          return { ...trip, collaborators: trip.collaborators.filter((c) => c.id !== collabId) };
        })
      );
    },
    [selectedTripId]
  );

  const handleSaveTripNotes = useCallback(() => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== selectedTripId) return trip;
        return { ...trip, notes: tripNotesValue };
      })
    );
    setEditingTripNotes(false);
    addNotification('Trip notes updated');
  }, [selectedTripId, tripNotesValue, addNotification]);

  const handleGenerateShareLink = useCallback(() => {
    const link = `https://travelplanner.app/share/${selectedTripId}-${Date.now().toString(36)}`;
    setShareLink(link);
    setShowShareModal(true);
  }, [selectedTripId]);

  const handleUpdateTripSettings = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.target;
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== selectedTripId) return trip;
          return {
            ...trip,
            name: form.tripName.value,
            description: form.tripDescription.value,
            budget: parseFloat(form.tripBudget.value) || 0,
            status: form.tripStatus.value,
          };
        })
      );
      setShowTripSettings(false);
      addNotification('Trip settings updated');
    },
    [selectedTripId, addNotification]
  );

  const filteredActivities = useMemo(() => {
    if (!selectedTrip || !selectedTrip.days[selectedDayIndex]) return [];
    let activities = [...selectedTrip.days[selectedDayIndex].activities];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      activities = activities.filter((a) => a.name.toLowerCase().includes(q) || a.notes.toLowerCase().includes(q) || a.address.toLowerCase().includes(q));
    }
    if (filterCategory !== 'all') {
      activities = activities.filter((a) => a.category === filterCategory);
    }
    if (sortActivitiesBy === 'time') {
      activities.sort((a, b) => a.time.localeCompare(b.time));
    } else if (sortActivitiesBy === 'cost') {
      activities.sort((a, b) => b.cost - a.cost);
    } else if (sortActivitiesBy === 'category') {
      activities.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortActivitiesBy === 'name') {
      activities.sort((a, b) => a.name.localeCompare(b.name));
    }
    return activities;
  }, [selectedTrip, selectedDayIndex, searchQuery, filterCategory, sortActivitiesBy]);

  const destination = useMemo(() => MOCK_DESTINATIONS.find((d) => d.id === selectedTrip?.destination), [selectedTrip]);

  const totalSpent = useMemo(() => getTotalSpent(selectedTrip), [selectedTrip, getTotalSpent]);
  const budgetPercentage = useMemo(() => getBudgetPercentage(selectedTrip), [selectedTrip, getBudgetPercentage]);
  const packingProgress = useMemo(() => getPackingProgress(selectedTrip), [selectedTrip, getPackingProgress]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(selectedTrip), [selectedTrip, getCategoryBreakdown]);

  const bgColor = isDarkMode ? '#1a1a2e' : '#f0f4f8';
  const cardBg = isDarkMode ? '#16213e' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const mutedText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#3b82f6';
  const dangerColor = '#ef4444';
  const successColor = '#22c55e';

  const navItems = [
    { id: 'itinerary', label: 'Itinerary', icon: '📅' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'packing', label: 'Packing List', icon: '🧳' },
    { id: 'weather', label: 'Weather', icon: '🌤️' },
    { id: 'map', label: 'Map View', icon: '🗺️' },
    { id: 'timeline', label: 'Timeline', icon: '📊' },
    { id: 'collaborators', label: 'Team', icon: '👥' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bgColor, color: textColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarCollapsed ? '60px' : '260px',
          background: isDarkMode ? '#0f172a' : '#1e293b',
          color: '#e2e8f0',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          {!sidebarCollapsed && (
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              ✈️ TripPlanner
            </h1>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Toggle sidebar" style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div style={{ padding: '0 16px', marginBottom: '16px' }}>
            <select
              value={selectedTripId}
              onChange={(e) => {
                setSelectedTripId(e.target.value);
                setSelectedDayIndex(0);
              }}
              aria-label="Select trip"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #475569', background: '#334155', color: '#e2e8f0', fontSize: '14px' }}
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 16px',
                background: activeView === item.id ? '#3b82f6' : 'transparent',
                border: 'none',
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                borderRadius: '0',
              }}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div style={{ marginTop: 'auto', padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Budget Used</div>
              <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${budgetPercentage}%`, background: budgetPercentage > 90 ? dangerColor : budgetPercentage > 70 ? '#eab308' : successColor, borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{formatCurrency(totalSpent)} / {formatCurrency(selectedTrip.budget)}</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Packing: {packingProgress}% complete</div>
              <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${packingProgress}%`, background: accentColor, borderRadius: '3px' }} />
              </div>
            </div>
            <button onClick={() => setShowCreateTripModal(true)} style={{ width: '100%', padding: '10px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              + New Trip
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: cardBg, borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px' }}>{selectedTrip.name}</h2>
              <span style={{ fontSize: '12px', color: mutedText }}>
                {selectedTrip.startDate} → {selectedTrip.endDate} · {getTripDuration(selectedTrip)} days
                {destination && ` · ${destination.name}, ${destination.country}`}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities... (Ctrl+K)"
              style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, width: '200px', fontSize: '13px' }}
            />
            <select aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '13px' }}>
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative' }}>
              🔔
              {notifications.filter((n) => !n.read).length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: dangerColor, color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle theme" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setShowTripSettings(true)} aria-label="Trip settings" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
              ⚙️
            </button>
          </div>
        </header>

        {/* Notifications Panel */}
        {showNotifications && (
          <div style={{ position: 'absolute', top: '60px', right: '120px', width: '320px', background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: '400px', overflow: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Notifications</strong>
              <button onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', fontSize: '12px' }}>
                Mark all read
              </button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: mutedText }}>No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${borderColor}`, opacity: n.read ? 0.6 : 1, fontSize: '13px' }}>
                  <div>{n.message}</div>
                  <div style={{ fontSize: '11px', color: mutedText, marginTop: '4px' }}>{new Date(n.timestamp).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {/* Itinerary View */}
          {activeView === 'itinerary' && (
            <div>
              {/* Day Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                {selectedTrip.days.map((day, index) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDayIndex(index)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: `1px solid ${selectedDayIndex === index ? accentColor : borderColor}`,
                      background: selectedDayIndex === index ? accentColor : cardBg,
                      color: selectedDayIndex === index ? 'white' : textColor,
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: selectedDayIndex === index ? '600' : '400',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Day {index + 1} · {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <select aria-label="Filter by category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '13px' }}>
                  <option value="all">All Categories</option>
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <select aria-label="Sort activities" value={sortActivitiesBy} onChange={(e) => setSortActivitiesBy(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '13px' }}>
                  <option value="time">Sort by Time</option>
                  <option value="cost">Sort by Cost</option>
                  <option value="category">Sort by Category</option>
                  <option value="name">Sort by Name</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedDayForActivity(selectedDayIndex);
                    setShowAddActivityModal(true);
                  }}
                  style={{ padding: '6px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginLeft: 'auto' }}
                >
                  + Add Activity
                </button>
              </div>

              {/* Activity Cards */}
              {filteredActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: mutedText }}>
                  {searchQuery || filterCategory !== 'all' ? 'No activities match your filters.' : 'No activities planned for this day. Click "+ Add Activity" to get started!'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        display: 'flex',
                        background: cardBg,
                        borderRadius: '10px',
                        border: `1px solid ${borderColor}`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                      onClick={() => setEditingActivityId(editingActivityId === activity.id ? null : activity.id)}
                    >
                      <div style={{ width: '4px', background: CATEGORY_COLORS[activity.category] || accentColor, flexShrink: 0 }} />
                      <div style={{ flex: 1, padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span>{CATEGORY_ICONS[activity.category]}</span>
                              <strong style={{ fontSize: '15px' }}>{activity.name}</strong>
                              {activity.booked && <span style={{ background: successColor, color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>Booked</span>}
                            </div>
                            <div style={{ fontSize: '13px', color: mutedText }}>
                              🕐 {activity.time} – {activity.endTime} · 📍 {activity.address}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', color: activity.cost > 0 ? textColor : successColor }}>{activity.cost > 0 ? formatCurrency(activity.cost) : 'Free'}</div>
                          </div>
                        </div>

                        {activity.notes && <div style={{ fontSize: '13px', color: mutedText, marginBottom: '8px' }}>{activity.notes}</div>}

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateActivity(selectedDayIndex, activity.id, star);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: star <= (activity.rating || 0) ? '#eab308' : '#d1d5db' }}
                              aria-label={`Rate ${star} stars`}
                            >
                              ★
                            </button>
                          ))}
                          {activity.rating && <span style={{ fontSize: '12px', color: mutedText, marginLeft: '4px' }}>{activity.rating}/5</span>}
                        </div>

                        {/* Expanded view */}
                        {editingActivityId === activity.id && (
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${borderColor}`, display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBooked(selectedDayIndex, activity.id);
                              }}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: 'pointer', fontSize: '12px' }}
                            >
                              {activity.booked ? 'Mark Unbooked' : 'Mark Booked'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteActivity(selectedDayIndex, activity.id);
                              }}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${dangerColor}`, background: 'transparent', color: dangerColor, cursor: 'pointer', fontSize: '12px' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Day Summary */}
              {selectedTrip.days[selectedDayIndex] && (
                <div style={{ marginTop: '20px', padding: '16px', background: cardBg, borderRadius: '10px', border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Day Summary</h4>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: mutedText }}>
                    <span>📋 {selectedTrip.days[selectedDayIndex].activities.length} activities</span>
                    <span>💰 {formatCurrency(selectedTrip.days[selectedDayIndex].activities.reduce((sum, a) => sum + (a.cost || 0), 0))} total</span>
                    <span>✅ {selectedTrip.days[selectedDayIndex].activities.filter((a) => a.booked).length} booked</span>
                    <span>⭐ {selectedTrip.days[selectedDayIndex].activities.filter((a) => a.rating).length} rated</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Budget View */}
          {activeView === 'budget' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Budget Overview</h3>
              {/* Budget Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '12px', color: mutedText, marginBottom: '4px' }}>Total Budget</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(selectedTrip.budget)}</div>
                </div>
                <div style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '12px', color: mutedText, marginBottom: '4px' }}>Total Spent</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: totalSpent > selectedTrip.budget ? dangerColor : successColor }}>{formatCurrency(totalSpent)}</div>
                </div>
                <div style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '12px', color: mutedText, marginBottom: '4px' }}>Remaining</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(Math.max(0, selectedTrip.budget - totalSpent))}</div>
                </div>
                <div style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '12px', color: mutedText, marginBottom: '4px' }}>Daily Average</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(getTripDuration(selectedTrip) > 0 ? totalSpent / getTripDuration(selectedTrip) : 0)}</div>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>Budget Usage</span>
                  <span style={{ color: mutedText }}>{budgetPercentage.toFixed(1)}%</span>
                </div>
                <div style={{ height: '12px', background: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${budgetPercentage}%`, background: budgetPercentage > 90 ? dangerColor : budgetPercentage > 70 ? '#eab308' : successColor, borderRadius: '6px', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Category Breakdown */}
              <div style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0' }}>Spending by Category</h4>
                {Object.entries(categoryBreakdown).map(([cat, data]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{CATEGORY_ICONS[cat]}</span>
                      <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                      <span style={{ fontSize: '12px', color: mutedText }}>({data.count} activities)</span>
                    </div>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(data.cost)}</span>
                  </div>
                ))}
              </div>

              {/* Daily Spending */}
              <div style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}` }}>
                <h4 style={{ margin: '0 0 16px 0' }}>Daily Spending</h4>
                {selectedTrip.days.map((day, index) => {
                  const dayTotal = day.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
                  const dayPercentage = selectedTrip.budget > 0 ? (dayTotal / selectedTrip.budget) * 100 : 0;
                  return (
                    <div key={day.date} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                      <span style={{ fontSize: '13px', color: mutedText, minWidth: '80px' }}>Day {index + 1}</span>
                      <div style={{ flex: 1, height: '8px', background: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${dayPercentage}%`, background: CATEGORY_COLORS[day.activities[0]?.category] || accentColor, borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontWeight: '600', minWidth: '80px', textAlign: 'right' }}>{formatCurrency(dayTotal)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Packing List View */}
          {activeView === 'packing' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Packing List</h3>
                <span style={{ fontSize: '14px', color: mutedText }}>
                  {selectedTrip.packingList.filter((i) => i.packed).length} / {selectedTrip.packingList.length} packed ({packingProgress}%)
                </span>
              </div>

              {/* Add Item Form */}
              <form onSubmit={handleAddPackingItem} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  value={newPackingItem}
                  onChange={(e) => setNewPackingItem(e.target.value)}
                  placeholder="Add a packing item..."
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Add
                </button>
              </form>

              {/* Category Filter */}
              <div style={{ marginBottom: '16px' }}>
                <select aria-label="Filter packing by category" value={packingFilterCategory} onChange={(e) => setPackingFilterCategory(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '13px' }}>
                  <option value="all">All Categories</option>
                  {[...new Set(selectedTrip.packingList.map((i) => i.category))].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Packing Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedTrip.packingList
                  .filter((item) => packingFilterCategory === 'all' || item.category === packingFilterCategory)
                  .map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: cardBg, borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                      <input type="checkbox" checked={item.packed} onChange={() => handleTogglePackingItem(item.id)} aria-label={`Pack ${item.item}`} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      <span style={{ flex: 1, textDecoration: item.packed ? 'line-through' : 'none', opacity: item.packed ? 0.6 : 1 }}>{item.item}</span>
                      <span style={{ fontSize: '11px', color: mutedText, textTransform: 'capitalize', padding: '2px 8px', background: isDarkMode ? '#334155' : '#f1f5f9', borderRadius: '10px' }}>{item.category}</span>
                      <button onClick={() => handleDeletePackingItem(item.id)} style={{ background: 'none', border: 'none', color: dangerColor, cursor: 'pointer', fontSize: '16px' }} aria-label={`Remove ${item.item}`}>
                        ×
                      </button>
                    </div>
                  ))}
              </div>

              {/* Packing Progress */}
              <div style={{ marginTop: '24px', padding: '16px', background: cardBg, borderRadius: '10px', border: `1px solid ${borderColor}` }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Packing Progress by Category</h4>
                {[...new Set(selectedTrip.packingList.map((i) => i.category))].map((cat) => {
                  const catItems = selectedTrip.packingList.filter((i) => i.category === cat);
                  const catPacked = catItems.filter((i) => i.packed).length;
                  const catProgress = Math.round((catPacked / catItems.length) * 100);
                  return (
                    <div key={cat} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                        <span style={{ color: mutedText }}>{catPacked}/{catItems.length}</span>
                      </div>
                      <div style={{ height: '6px', background: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${catProgress}%`, background: catProgress === 100 ? successColor : accentColor, borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weather View */}
          {activeView === 'weather' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Weather & Destination Info</h3>
              {destination ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: cardBg, borderRadius: '10px', padding: '24px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '8px' }}>{WEATHER_ICONS[destination.weather]}</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize' }}>{destination.weather.replace('_', ' ')}</div>
                      <div style={{ fontSize: '14px', color: mutedText, marginTop: '4px' }}>
                        {destination.tempHigh}°C / {destination.tempLow}°C
                      </div>
                    </div>
                    <div style={{ background: cardBg, borderRadius: '10px', padding: '24px', border: `1px solid ${borderColor}` }}>
                      <h4 style={{ margin: '0 0 12px 0' }}>Destination Details</h4>
                      <div style={{ fontSize: '14px', lineHeight: '2' }}>
                        <div>📍 {destination.name}, {destination.country}</div>
                        <div>🕐 {destination.timezone}</div>
                        <div>🗣️ {destination.language}</div>
                        <div>💱 {destination.currency}</div>
                      </div>
                    </div>
                    <div style={{ background: cardBg, borderRadius: '10px', padding: '24px', border: `1px solid ${borderColor}` }}>
                      <h4 style={{ margin: '0 0 12px 0' }}>Daily Forecast</h4>
                      {selectedTrip.days.slice(0, 5).map((day, index) => (
                        <div key={day.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '13px' }}>
                          <span>Day {index + 1}</span>
                          <span>{WEATHER_ICONS[['sunny', 'partly_cloudy', 'cloudy', 'rainy', 'sunny'][index % 5]]}</span>
                          <span>{destination.tempHigh - index}°/{destination.tempLow + index}°</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Packing suggestions based on weather */}
                  <div style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>Packing Suggestions</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {destination.weather === 'rainy' && ['Umbrella', 'Waterproof jacket', 'Water-resistant shoes'].map((item) => (
                        <span key={item} style={{ padding: '6px 12px', background: isDarkMode ? '#334155' : '#e0f2fe', borderRadius: '16px', fontSize: '13px' }}>🌧️ {item}</span>
                      ))}
                      {destination.weather === 'sunny' && ['Sunscreen', 'Sunglasses', 'Hat', 'Light clothing'].map((item) => (
                        <span key={item} style={{ padding: '6px 12px', background: isDarkMode ? '#334155' : '#fef3c7', borderRadius: '16px', fontSize: '13px' }}>☀️ {item}</span>
                      ))}
                      {destination.weather === 'snowy' && ['Winter coat', 'Boots', 'Gloves', 'Scarf'].map((item) => (
                        <span key={item} style={{ padding: '6px 12px', background: isDarkMode ? '#334155' : '#e0e7ff', borderRadius: '16px', fontSize: '13px' }}>❄️ {item}</span>
                      ))}
                      {(destination.weather === 'partly_cloudy' || destination.weather === 'cloudy') && ['Light jacket', 'Layers', 'Comfortable shoes'].map((item) => (
                        <span key={item} style={{ padding: '6px 12px', background: isDarkMode ? '#334155' : '#f1f5f9', borderRadius: '16px', fontSize: '13px' }}>⛅ {item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: mutedText }}>No destination selected for this trip.</div>
              )}
            </div>
          )}

          {/* Map View */}
          {activeView === 'map' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Map View</h3>
              <div style={{ background: cardBg, borderRadius: '10px', padding: '24px', border: `1px solid ${borderColor}`, marginBottom: '20px' }}>
                <div style={{ background: isDarkMode ? '#1e293b' : '#dbeafe', borderRadius: '8px', padding: '60px', textAlign: 'center', marginBottom: '16px', fontSize: '48px' }}>
                  🗺️
                </div>
                <p style={{ color: mutedText, textAlign: 'center', fontSize: '14px' }}>Interactive map integration coming soon. Below are your activity locations:</p>
              </div>

              {/* Location List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedTrip.days.map((day, dayIndex) =>
                  day.activities.map((activity) => (
                    <div key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: cardBg, borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                      <span style={{ fontSize: '20px' }}>{CATEGORY_ICONS[activity.category]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{activity.name}</div>
                        <div style={{ fontSize: '12px', color: mutedText }}>Day {dayIndex + 1} · {activity.time} · {activity.address}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: mutedText }}>📍</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Timeline View */}
          {activeView === 'timeline' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Trip Timeline</h3>
              <div style={{ position: 'relative', paddingLeft: '32px' }}>
                {selectedTrip.days.map((day, dayIndex) => (
                  <div key={day.date} style={{ marginBottom: '32px', position: 'relative' }}>
                    {/* Timeline dot */}
                    <div style={{ position: 'absolute', left: '-32px', top: '0', width: '16px', height: '16px', background: accentColor, borderRadius: '50%', border: `3px solid ${cardBg}` }} />
                    {/* Timeline line */}
                    {dayIndex < selectedTrip.days.length - 1 && (
                      <div style={{ position: 'absolute', left: '-26px', top: '16px', width: '2px', height: 'calc(100% + 16px)', background: borderColor }} />
                    )}

                    <div style={{ paddingLeft: '8px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: accentColor }}>
                        Day {dayIndex + 1} — {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </h4>
                      {day.activities.length === 0 ? (
                        <div style={{ fontSize: '13px', color: mutedText, fontStyle: 'italic' }}>No activities planned</div>
                      ) : (
                        day.activities
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map((activity) => (
                            <div key={activity.id} style={{ display: 'flex', gap: '12px', marginBottom: '8px', padding: '10px 14px', background: cardBg, borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                              <div style={{ fontSize: '13px', color: mutedText, minWidth: '90px' }}>
                                {activity.time} – {activity.endTime}
                              </div>
                              <span>{CATEGORY_ICONS[activity.category]}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '500', fontSize: '14px' }}>{activity.name}</div>
                                <div style={{ fontSize: '12px', color: mutedText }}>📍 {activity.address}</div>
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: '600' }}>{activity.cost > 0 ? formatCurrency(activity.cost) : 'Free'}</div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collaborators View */}
          {activeView === 'collaborators' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Trip Collaborators</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleGenerateShareLink} style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: 'pointer', fontSize: '13px' }}>
                    🔗 Share Link
                  </button>
                  <button onClick={() => setShowAddCollaboratorModal(true)} style={{ padding: '8px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    + Add Collaborator
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {selectedTrip.collaborators.map((collab) => (
                  <div key={collab.id} style={{ background: cardBg, borderRadius: '10px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '32px' }}>{collab.avatar}</div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{collab.name}</div>
                        <div style={{ fontSize: '12px', color: mutedText }}>{collab.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '10px', background: collab.role === 'organizer' ? accentColor : isDarkMode ? '#334155' : '#f1f5f9', color: collab.role === 'organizer' ? 'white' : textColor, textTransform: 'capitalize' }}>
                        {collab.role}
                      </span>
                      {collab.role !== 'organizer' && (
                        <button onClick={() => handleRemoveCollaborator(collab.id)} style={{ background: 'none', border: 'none', color: dangerColor, cursor: 'pointer', fontSize: '13px' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trip Notes */}
              <div style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0 }}>Trip Notes</h3>
                  {!editingTripNotes && (
                    <button
                      onClick={() => {
                        setTripNotesValue(selectedTrip.notes);
                        setEditingTripNotes(true);
                      }}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: 'pointer', fontSize: '13px' }}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
                {editingTripNotes ? (
                  <div>
                    <textarea
                      value={tripNotesValue}
                      onChange={(e) => setTripNotesValue(e.target.value)}
                      style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
                      placeholder="Add shared notes for your trip..."
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={handleSaveTripNotes} style={{ padding: '8px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        Save Notes
                      </button>
                      <button onClick={() => setEditingTripNotes(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '16px', background: cardBg, borderRadius: '10px', border: `1px solid ${borderColor}`, fontSize: '14px', lineHeight: '1.6', color: selectedTrip.notes ? textColor : mutedText }}>
                    {selectedTrip.notes || 'No trip notes yet. Click "Edit" to add shared notes.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Trip Modal */}
      {showCreateTripModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowCreateTripModal(false)}>
          <div style={{ background: cardBg, borderRadius: '12px', padding: '28px', width: '480px', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Create New Trip</h3>
              <button onClick={() => setShowCreateTripModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: textColor }}>×</button>
            </div>
            <form onSubmit={handleCreateTrip}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Trip Name *</label>
                <input name="name" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                <textarea name="description" rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Start Date *</label>
                  <input name="startDate" type="date" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>End Date *</label>
                  <input name="endDate" type="date" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Destination</label>
                <select name="destination" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px' }}>
                  {MOCK_DESTINATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.image} {d.name}, {d.country}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Budget ({CURRENCIES[currency]?.symbol})</label>
                <input name="budget" type="number" min="0" step="0.01" defaultValue="1000" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateTripModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowAddActivityModal(false)}>
          <div style={{ background: cardBg, borderRadius: '12px', padding: '28px', width: '480px', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add Activity</h3>
              <button onClick={() => setShowAddActivityModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: textColor }}>×</button>
            </div>
            <form onSubmit={handleAddActivity}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Activity Name *</label>
                <input name="activityName" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Start Time *</label>
                  <input name="startTime" type="time" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>End Time *</label>
                  <input name="endTime" type="time" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                <select name="category" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px' }}>
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Cost ({CURRENCIES[currency]?.symbol})</label>
                <input name="cost" type="number" min="0" step="0.01" defaultValue="0" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Address</label>
                <input name="address" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Notes</label>
                <textarea name="notes" rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input name="booked" type="checkbox" style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '13px' }}>Already booked</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddActivityModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Collaborator Modal */}
      {showAddCollaboratorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowAddCollaboratorModal(false)}>
          <div style={{ background: cardBg, borderRadius: '12px', padding: '28px', width: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add Collaborator</h3>
              <button onClick={() => setShowAddCollaboratorModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: textColor }}>×</button>
            </div>
            <form onSubmit={handleAddCollaborator}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Name *</label>
                <input name="collabName" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Email *</label>
                <input name="collabEmail" type="email" required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Role</label>
                <select name="collabRole" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px' }}>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddCollaboratorModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trip Settings Modal */}
      {showTripSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowTripSettings(false)}>
          <div style={{ background: cardBg, borderRadius: '12px', padding: '28px', width: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Trip Settings</h3>
              <button onClick={() => setShowTripSettings(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: textColor }}>×</button>
            </div>
            <form onSubmit={handleUpdateTripSettings}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Trip Name</label>
                <input name="tripName" defaultValue={selectedTrip.name} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                <textarea name="tripDescription" defaultValue={selectedTrip.description} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Budget ({CURRENCIES[currency]?.symbol})</label>
                <input name="tripBudget" type="number" min="0" step="0.01" defaultValue={selectedTrip.budget} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Status</label>
                <select name="tripStatus" defaultValue={selectedTrip.status} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '14px' }}>
                  <option value="planning">Planning</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => handleDeleteTrip(selectedTripId)} style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${dangerColor}`, background: 'transparent', color: dangerColor, cursor: 'pointer' }}>
                  Delete Trip
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowTripSettings(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowShareModal(false)}>
          <div style={{ background: cardBg, borderRadius: '12px', padding: '28px', width: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Share Trip</h3>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: textColor }}>×</button>
            </div>
            <p style={{ fontSize: '14px', color: mutedText, marginBottom: '12px' }}>Share this link with others to give them access to your trip itinerary:</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={shareLink}
                readOnly
                style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: bgColor, color: textColor, fontSize: '13px' }}
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(shareLink);
                  addNotification('Share link copied to clipboard');
                }}
                style={{ padding: '10px 16px', background: accentColor, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
