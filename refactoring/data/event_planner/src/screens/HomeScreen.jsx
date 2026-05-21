import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  Modal,
  Switch,
} from 'react-native';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CURRENT_USER = {
  id: 'u1',
  name: 'Jordan Rivera',
  avatar: 'JR',
  avatarColor: '#4F46E5',
  bio: 'Community organizer & food lover',
  eventsHosted: 12,
  eventsAttended: 47,
};

const USERS = [
  CURRENT_USER,
  { id: 'u2', name: 'Sam Chen', avatar: 'SC', avatarColor: '#059669', bio: 'Music enthusiast & concert-goer', eventsHosted: 8, eventsAttended: 63 },
  { id: 'u3', name: 'Alex Morgan', avatar: 'AM', avatarColor: '#DC2626', bio: 'Outdoor adventurer', eventsHosted: 15, eventsAttended: 34 },
  { id: 'u4', name: 'Taylor Kim', avatar: 'TK', avatarColor: '#7C3AED', bio: 'Art collector & gallery hopper', eventsHosted: 5, eventsAttended: 89 },
  { id: 'u5', name: 'Casey Brooks', avatar: 'CB', avatarColor: '#D97706', bio: 'Fitness instructor & wellness advocate', eventsHosted: 22, eventsAttended: 41 },
  { id: 'u6', name: 'Riley Patel', avatar: 'RP', avatarColor: '#0891B2', bio: 'Foodie & restaurant reviewer', eventsHosted: 3, eventsAttended: 112 },
  { id: 'u7', name: 'Morgan Lee', avatar: 'ML', avatarColor: '#BE185D', bio: 'Tech meetup regular', eventsHosted: 9, eventsAttended: 55 },
  { id: 'u8', name: 'Quinn Adams', avatar: 'QA', avatarColor: '#65A30D', bio: 'Book club founder', eventsHosted: 18, eventsAttended: 29 },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '\u{1F389}' },
  { id: 'music', label: 'Music', icon: '\u{1F3B5}' },
  { id: 'food', label: 'Food & Drink', icon: '\u{1F37D}\u{FE0F}' },
  { id: 'outdoor', label: 'Outdoor', icon: '\u{1F3D5}\u{FE0F}' },
  { id: 'art', label: 'Art & Culture', icon: '\u{1F3A8}' },
  { id: 'fitness', label: 'Fitness', icon: '\u{1F4AA}' },
  { id: 'tech', label: 'Tech', icon: '\u{1F4BB}' },
  { id: 'social', label: 'Social', icon: '\u{1F37B}' },
  { id: 'education', label: 'Education', icon: '\u{1F4DA}' },
];

const LOCATIONS = [
  { id: 'loc1', name: 'Sunset Park Amphitheater', address: '123 Park Ave', city: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { id: 'loc2', name: 'The Blue Note Lounge', address: '456 Jazz St', city: 'San Francisco', lat: 37.7849, lng: -122.4094 },
  { id: 'loc3', name: 'Hilltop Community Center', address: '789 Summit Rd', city: 'Oakland', lat: 37.8044, lng: -122.2712 },
  { id: 'loc4', name: 'Waterfront Gallery', address: '321 Pier Blvd', city: 'San Francisco', lat: 37.7949, lng: -122.3894 },
  { id: 'loc5', name: 'FitZone Studio', address: '555 Health Way', city: 'Berkeley', lat: 37.8716, lng: -122.2727 },
  { id: 'loc6', name: 'TechHub Conference Room', address: '100 Innovation Dr', city: 'San Francisco', lat: 37.7849, lng: -122.3994 },
  { id: 'loc7', name: 'Riverside Pavilion', address: '200 River Rd', city: 'San Rafael', lat: 37.9735, lng: -122.5311 },
];

const INITIAL_EVENTS = [
  {
    id: 'e1',
    title: 'Summer Jazz Night',
    description: 'An evening of smooth jazz under the stars featuring local artists. Bring your own blankets and enjoy food trucks on-site. Open to all ages.',
    category: 'music',
    hostId: 'u2',
    locationId: 'loc1',
    date: '2025-02-15',
    startTime: '19:00',
    endTime: '23:00',
    capacity: 200,
    rsvps: ['u1', 'u3', 'u4', 'u6', 'u7'],
    waitlist: ['u8'],
    tags: ['jazz', 'live music', 'outdoor'],
    image: 'https://picsum.photos/seed/jazz/600/400',
    isFree: true,
    price: 0,
    isPublic: true,
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'e2',
    title: 'Farm-to-Table Dinner Experience',
    description: 'A curated 5-course dinner using locally sourced ingredients. Meet the farmers, learn about sustainable agriculture, and enjoy wine pairings with each course.',
    category: 'food',
    hostId: 'u6',
    locationId: 'loc3',
    date: '2025-02-20',
    startTime: '18:30',
    endTime: '21:30',
    capacity: 30,
    rsvps: ['u1', 'u2', 'u5'],
    waitlist: [],
    tags: ['dinner', 'farm-to-table', 'wine'],
    image: 'https://picsum.photos/seed/dinner/600/400',
    isFree: false,
    price: 85,
    isPublic: true,
    createdAt: '2025-01-12T14:00:00Z',
  },
  {
    id: 'e3',
    title: 'Sunrise Hike at Twin Peaks',
    description: 'Start your Saturday with a guided sunrise hike. Moderate difficulty, approximately 4 miles round trip. Hot coffee and pastries provided at the summit.',
    category: 'outdoor',
    hostId: 'u3',
    locationId: 'loc7',
    date: '2025-02-08',
    startTime: '06:00',
    endTime: '09:00',
    capacity: 25,
    rsvps: ['u1', 'u2', 'u5', 'u7'],
    waitlist: [],
    tags: ['hiking', 'sunrise', 'nature'],
    image: 'https://picsum.photos/seed/hike/600/400',
    isFree: true,
    price: 0,
    isPublic: true,
    createdAt: '2025-01-08T07:00:00Z',
  },
  {
    id: 'e4',
    title: 'Abstract Art Workshop',
    description: 'Explore abstract expressionism with professional artist Maya Torres. All materials provided. No experience necessary — just bring your creativity!',
    category: 'art',
    hostId: 'u4',
    locationId: 'loc4',
    date: '2025-02-22',
    startTime: '14:00',
    endTime: '17:00',
    capacity: 15,
    rsvps: ['u2', 'u6', 'u8'],
    waitlist: [],
    tags: ['art', 'workshop', 'painting'],
    image: 'https://picsum.photos/seed/art/600/400',
    isFree: false,
    price: 45,
    isPublic: true,
    createdAt: '2025-01-14T11:00:00Z',
  },
  {
    id: 'e5',
    title: 'HIIT Bootcamp Challenge',
    description: 'Push your limits with this high-intensity interval training session. Suitable for intermediate to advanced fitness levels. Bring water and a towel.',
    category: 'fitness',
    hostId: 'u5',
    locationId: 'loc5',
    date: '2025-02-10',
    startTime: '07:00',
    endTime: '08:00',
    capacity: 20,
    rsvps: ['u1', 'u3', 'u7'],
    waitlist: [],
    tags: ['hiit', 'bootcamp', 'workout'],
    image: 'https://picsum.photos/seed/hiit/600/400',
    isFree: false,
    price: 15,
    isPublic: true,
    createdAt: '2025-01-09T06:00:00Z',
  },
  {
    id: 'e6',
    title: 'AI & Machine Learning Meetup',
    description: 'Monthly meetup for AI enthusiasts. This month: practical applications of LLMs in production. Lightning talks followed by networking. Pizza provided.',
    category: 'tech',
    hostId: 'u7',
    locationId: 'loc6',
    date: '2025-02-18',
    startTime: '18:30',
    endTime: '21:00',
    capacity: 50,
    rsvps: ['u1', 'u2', 'u3', 'u4', 'u5'],
    waitlist: ['u6', 'u8'],
    tags: ['ai', 'machine learning', 'networking'],
    image: 'https://picsum.photos/seed/tech/600/400',
    isFree: true,
    price: 0,
    isPublic: true,
    createdAt: '2025-01-11T16:00:00Z',
  },
  {
    id: 'e7',
    title: 'Board Game & Trivia Night',
    description: 'Casual game night with a rotating selection of board games and a trivia competition with prizes. Snacks and drinks available. Come solo or bring friends!',
    category: 'social',
    hostId: 'u8',
    locationId: 'loc2',
    date: '2025-02-14',
    startTime: '19:00',
    endTime: '23:00',
    capacity: 40,
    rsvps: ['u2', 'u4', 'u6'],
    waitlist: [],
    tags: ['games', 'trivia', 'social'],
    image: 'https://picsum.photos/seed/games/600/400',
    isFree: true,
    price: 0,
    isPublic: true,
    createdAt: '2025-01-13T10:00:00Z',
  },
  {
    id: 'e8',
    title: 'Photography Walk: Golden Gate',
    description: 'Join fellow photographers for a sunset walk across the Golden Gate Bridge. Tips on composition and lighting shared along the way. All skill levels welcome.',
    category: 'art',
    hostId: 'u4',
    locationId: 'loc1',
    date: '2025-02-25',
    startTime: '16:00',
    endTime: '19:00',
    capacity: 12,
    rsvps: ['u1', 'u3', 'u5', 'u6', 'u7', 'u8'],
    waitlist: [],
    tags: ['photography', 'golden gate', 'sunset'],
    image: 'https://picsum.photos/seed/photo/600/400',
    isFree: true,
    price: 0,
    isPublic: true,
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'e9',
    title: 'Yoga in the Park',
    description: 'Relaxing outdoor yoga session for all levels. Mats available if you don\'t have one. End with a guided meditation and complimentary herbal tea.',
    category: 'fitness',
    hostId: 'u5',
    locationId: 'loc7',
    date: '2025-02-12',
    startTime: '08:00',
    endTime: '09:30',
    capacity: 30,
    rsvps: ['u2', 'u4', 'u6', 'u8'],
    waitlist: [],
    tags: ['yoga', 'meditation', 'wellness'],
    image: 'https://picsum.photos/seed/yoga/600/400',
    isFree: true,
    price: 0,
    isPublic: true,
    createdAt: '2025-01-07T12:00:00Z',
  },
  {
    id: 'e10',
    title: 'Startup Pitch Night',
    description: 'Watch 8 early-stage startups pitch to a panel of investors. Audience voting for People\'s Choice award. Great networking opportunity afterward.',
    category: 'tech',
    hostId: 'u7',
    locationId: 'loc6',
    date: '2025-03-01',
    startTime: '18:00',
    endTime: '21:00',
    capacity: 80,
    rsvps: ['u1', 'u2', 'u4'],
    waitlist: [],
    tags: ['startups', 'pitch', 'investing'],
    image: 'https://picsum.photos/seed/pitch/600/400',
    isFree: false,
    price: 10,
    isPublic: true,
    createdAt: '2025-01-16T09:00:00Z',
  },
];

const NOTIFICATIONS = [
  { id: 'n1', type: 'rsvp', eventId: 'e1', userId: 'u7', message: 'Morgan Lee RSVP\'d to Summer Jazz Night', read: false, timestamp: '2025-01-16T08:00:00Z' },
  { id: 'n2', type: 'reminder', eventId: 'e3', message: 'Sunrise Hike at Twin Peaks is tomorrow!', read: false, timestamp: '2025-01-16T07:00:00Z' },
  { id: 'n3', type: 'update', eventId: 'e6', userId: 'u7', message: 'AI & ML Meetup location updated', read: true, timestamp: '2025-01-15T14:00:00Z' },
  { id: 'n4', type: 'waitlist', eventId: 'e1', message: 'You moved up on the waitlist for Summer Jazz Night', read: true, timestamp: '2025-01-14T10:00:00Z' },
  { id: 'n5', type: 'rsvp', eventId: 'e8', userId: 'u8', message: 'Quinn Adams RSVP\'d to Photography Walk', read: false, timestamp: '2025-01-15T18:00:00Z' },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const getLocation = (locationId) => LOCATIONS.find((l) => l.id === locationId);
const getUser = (userId) => USERS.find((u) => u.id === userId);

const getDaysUntil = (dateStr) => {
  const eventDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HomeScreen() {
  // ── State ────────────────────────────────────────────────────────────────────
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar' | 'map'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'popularity' | 'price'
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all'); // 'all' | 'free' | 'paid'
  const [calendarMonth, setCalendarMonth] = useState(1); // 0-indexed, starts Feb (1)
  const [calendarYear, setCalendarYear] = useState(2025);
  const scrollViewRef = useRef(null);

  // ── Create Event Form State ──────────────────────────────────────────────────
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('social');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newLocationId, setNewLocationId] = useState('loc1');
  const [newCapacity, setNewCapacity] = useState('50');
  const [newIsFree, setNewIsFree] = useState(true);
  const [newPrice, setNewPrice] = useState('0');
  const [newIsPublic, setNewIsPublic] = useState(true);

  // ── Derived State ────────────────────────────────────────────────────────────

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          getLocation(e.locationId)?.name.toLowerCase().includes(q)
      );
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter((e) => e.isFree);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((e) => !e.isFree);
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => b.rsvps.length - a.rsvps.length);
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    }

    return filtered;
  }, [events, selectedCategory, searchQuery, priceFilter, sortBy]);

  const myEvents = useMemo(
    () => events.filter((e) => e.rsvps.includes(CURRENT_USER.id)),
    [events]
  );

  const hostedEvents = useMemo(
    () => events.filter((e) => e.hostId === CURRENT_USER.id),
    [events]
  );

  const calendarEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
    });
  }, [events, calendarMonth, calendarYear]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleRsvp = useCallback(
    (eventId) => {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== eventId) return e;
          const isRsvpd = e.rsvps.includes(CURRENT_USER.id);
          if (isRsvpd) {
            return { ...e, rsvps: e.rsvps.filter((id) => id !== CURRENT_USER.id) };
          }
          if (e.rsvps.length >= e.capacity) {
            const isWaitlisted = e.waitlist.includes(CURRENT_USER.id);
            if (isWaitlisted) {
              return { ...e, waitlist: e.waitlist.filter((id) => id !== CURRENT_USER.id) };
            }
            return { ...e, waitlist: [...e.waitlist, CURRENT_USER.id] };
          }
          return { ...e, rsvps: [...e.rsvps, CURRENT_USER.id] };
        })
      );
    },
    []
  );

  const handleCreateEvent = useCallback(() => {
    if (!newTitle.trim() || !newDate.trim() || !newStartTime.trim()) {
      Alert.alert('Missing Fields', 'Please fill in the title, date, and start time.');
      return;
    }
    const newEvent = {
      id: `e${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      hostId: CURRENT_USER.id,
      locationId: newLocationId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime || newStartTime,
      capacity: parseInt(newCapacity, 10) || 50,
      rsvps: [CURRENT_USER.id],
      waitlist: [],
      tags: [],
      image: `https://picsum.photos/seed/${Date.now()}/600/400`,
      isFree: newIsFree,
      price: newIsFree ? 0 : parseFloat(newPrice) || 0,
      isPublic: newIsPublic,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    setShowCreateModal(false);
    resetCreateForm();
  }, [newTitle, newDescription, newCategory, newDate, newStartTime, newEndTime, newLocationId, newCapacity, newIsFree, newPrice, newIsPublic]);

  const resetCreateForm = useCallback(() => {
    setNewTitle('');
    setNewDescription('');
    setNewCategory('social');
    setNewDate('');
    setNewStartTime('');
    setNewEndTime('');
    setNewLocationId('loc1');
    setNewCapacity('50');
    setNewIsFree(true);
    setNewPrice('0');
    setNewIsPublic(true);
  }, []);

  const handleMarkNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleDeleteEvent = useCallback((eventId) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setEvents((prev) => prev.filter((e) => e.id !== eventId));
          setShowEventDetail(false);
          setSelectedEvent(null);
        },
      },
    ]);
  }, []);

  const openEventDetail = useCallback((event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  }, []);

  const openUserProfile = useCallback((userId) => {
    const user = getUser(userId);
    if (user) {
      setSelectedProfileUser(user);
      setShowProfile(true);
    }
  }, []);

  // ── Calendar Helpers ─────────────────────────────────────────────────────────

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];

    for (let i = 0; i < startPad; i++) {
      days.push({ day: null, events: [] });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter((e) => e.date === dateStr);
      days.push({ day: d, events: dayEvents });
    }

    return days;
  }, [events, calendarMonth, calendarYear]);

  const navigateCalendar = useCallback(
    (direction) => {
      if (direction === 'next') {
        if (calendarMonth === 11) {
          setCalendarMonth(0);
          setCalendarYear((y) => y + 1);
        } else {
          setCalendarMonth((m) => m + 1);
        }
      } else {
        if (calendarMonth === 0) {
          setCalendarMonth(11);
          setCalendarYear((y) => y - 1);
        } else {
          setCalendarMonth((m) => m - 1);
        }
      }
    },
    [calendarMonth]
  );

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // ── Render Helpers ─────────────────────────────────────────────────────────

  const renderAvatar = (user, size = 40) => (
    <View
      testID={`avatar-${user.id}`}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: user.avatarColor }]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{user.avatar}</Text>
    </View>
  );

  const renderCategoryChip = (cat, isSelected) => (
    <TouchableOpacity
      key={cat.id}
      testID={`category-${cat.id}`}
      style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
      onPress={() => setSelectedCategory(cat.id)}
    >
      <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
      <Text style={[styles.categoryChipLabel, isSelected && styles.categoryChipLabelSelected]}>
        {cat.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEventCard = (event) => {
    const host = getUser(event.hostId);
    const location = getLocation(event.locationId);
    const isRsvpd = event.rsvps.includes(CURRENT_USER.id);
    const isWaitlisted = event.waitlist.includes(CURRENT_USER.id);
    const isFull = event.rsvps.length >= event.capacity;
    const daysUntil = getDaysUntil(event.date);

    return (
      <TouchableOpacity
        key={event.id}
        testID={`event-card-${event.id}`}
        style={styles.eventCard}
        onPress={() => openEventDetail(event)}
        activeOpacity={0.7}
      >
        <View style={styles.eventCardImageContainer}>
          <View style={[styles.eventCardImage, { backgroundColor: '#E5E7EB' }]}>
            <Text style={styles.eventCardImagePlaceholder}>
              {CATEGORIES.find((c) => c.id === event.category)?.icon || '\u{1F4C5}'}
            </Text>
          </View>
          {daysUntil >= 0 && daysUntil <= 3 && (
            <View style={styles.urgencyBadge}>
              <Text style={styles.urgencyBadgeText}>
                {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
              </Text>
            </View>
          )}
          {!event.isFree && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>${event.price}</Text>
            </View>
          )}
        </View>

        <View style={styles.eventCardBody}>
          <View style={styles.eventCardHeader}>
            <Text style={styles.eventCardTitle} numberOfLines={1}>
              {event.title}
            </Text>
            <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(event.category) + '20' }]}>
              <Text style={[styles.categoryTagText, { color: getCategoryColor(event.category) }]}>
                {event.category}
              </Text>
            </View>
          </View>

          <Text style={styles.eventCardDescription} numberOfLines={2}>
            {event.description}
          </Text>

          <View style={styles.eventCardMeta}>
            <Text style={styles.eventCardMetaText}>
              {'\u{1F4C5}'} {formatDate(event.date)}
            </Text>
            <Text style={styles.eventCardMetaText}>
              {'\u{1F555}'} {formatTime(event.startTime)}
            </Text>
          </View>

          <View style={styles.eventCardMeta}>
            <Text style={styles.eventCardMetaText} numberOfLines={1}>
              {'\u{1F4CD}'} {location?.name || 'TBD'}
            </Text>
          </View>

          <View style={styles.eventCardFooter}>
            <TouchableOpacity
              testID={`host-btn-${event.id}`}
              style={styles.hostInfo}
              onPress={() => openUserProfile(event.hostId)}
            >
              {host && renderAvatar(host, 24)}
              <Text style={styles.hostName}>{host?.name || 'Unknown'}</Text>
            </TouchableOpacity>

            <View style={styles.eventCardActions}>
              <View style={styles.attendeeCount}>
                <Text style={styles.attendeeCountText}>
                  {'\u{1F465}'} {event.rsvps.length}/{event.capacity}
                </Text>
              </View>

              <TouchableOpacity
                testID={`rsvp-btn-${event.id}`}
                style={[
                  styles.rsvpButton,
                  isRsvpd && styles.rsvpButtonActive,
                  isWaitlisted && styles.rsvpButtonWaitlist,
                ]}
                onPress={() => handleRsvp(event.id)}
              >
                <Text
                  style={[
                    styles.rsvpButtonText,
                    isRsvpd && styles.rsvpButtonTextActive,
                    isWaitlisted && styles.rsvpButtonTextWaitlist,
                  ]}
                >
                  {isRsvpd ? 'Going' : isWaitlisted ? 'Waitlisted' : isFull ? 'Join Waitlist' : 'RSVP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Event Detail Modal ─────────────────────────────────────────────────────

  const renderEventDetail = () => {
    if (!selectedEvent) return null;
    const event = events.find((e) => e.id === selectedEvent.id) || selectedEvent;
    const host = getUser(event.hostId);
    const location = getLocation(event.locationId);
    const isRsvpd = event.rsvps.includes(CURRENT_USER.id);
    const isWaitlisted = event.waitlist.includes(CURRENT_USER.id);
    const isFull = event.rsvps.length >= event.capacity;
    const isHost = event.hostId === CURRENT_USER.id;
    const attendees = event.rsvps.map((id) => getUser(id)).filter(Boolean);
    const waitlistUsers = event.waitlist.map((id) => getUser(id)).filter(Boolean);

    return (
      <Modal
        visible={showEventDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEventDetail(false)}
      >
        <View testID="event-detail-modal" style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              testID="close-event-detail"
              onPress={() => setShowEventDetail(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              Event Details
            </Text>
            {isHost && (
              <TouchableOpacity
                testID={`delete-event-${event.id}`}
                onPress={() => handleDeleteEvent(event.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={[styles.detailImage, { backgroundColor: '#E5E7EB' }]}>
              <Text style={styles.detailImagePlaceholder}>
                {CATEGORIES.find((c) => c.id === event.category)?.icon || '\u{1F4C5}'}
              </Text>
            </View>

            <View style={styles.detailContent}>
              <Text testID="event-detail-title" style={styles.detailTitle}>
                {event.title}
              </Text>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Date & Time</Text>
                <Text style={styles.detailText}>
                  {formatDate(event.date)} {'\u00B7'} {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Location</Text>
                <Text style={styles.detailText}>{location?.name}</Text>
                <Text style={styles.detailSubtext}>
                  {location?.address}, {location?.city}
                </Text>
                <View testID="event-location-map" style={styles.mapPlaceholder}>
                  <Text style={styles.mapPlaceholderText}>
                    {'\u{1F5FA}\u{FE0F}'} Map: {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>About</Text>
                <Text style={styles.detailDescription}>{event.description}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{event.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue}>
                    {event.isFree ? 'Free' : `$${event.price}`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Visibility</Text>
                  <Text style={styles.detailValue}>
                    {event.isPublic ? 'Public' : 'Private'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Host</Text>
                <TouchableOpacity
                  testID={`detail-host-${event.hostId}`}
                  style={styles.detailHostRow}
                  onPress={() => {
                    setShowEventDetail(false);
                    openUserProfile(event.hostId);
                  }}
                >
                  {host && renderAvatar(host, 36)}
                  <View style={styles.detailHostInfo}>
                    <Text style={styles.detailHostName}>{host?.name}</Text>
                    <Text style={styles.detailHostBio}>{host?.bio}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  Attendees ({event.rsvps.length}/{event.capacity})
                </Text>
                <View testID="attendee-list" style={styles.attendeeList}>
                  {attendees.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      testID={`attendee-${user.id}`}
                      style={styles.attendeeItem}
                      onPress={() => {
                        setShowEventDetail(false);
                        openUserProfile(user.id);
                      }}
                    >
                      {renderAvatar(user, 32)}
                      <Text style={styles.attendeeName}>{user.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {waitlistUsers.length > 0 && (
                  <View testID="waitlist-section">
                    <Text style={styles.waitlistTitle}>
                      Waitlist ({waitlistUsers.length})
                    </Text>
                    {waitlistUsers.map((user) => (
                      <View key={user.id} testID={`waitlist-${user.id}`} style={styles.attendeeItem}>
                        {renderAvatar(user, 28)}
                        <Text style={styles.attendeeName}>{user.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {event.tags.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Tags</Text>
                  <View testID="event-tags" style={styles.tagList}>
                    {event.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.detailFooter}>
            <TouchableOpacity
              testID={`detail-rsvp-btn-${event.id}`}
              style={[
                styles.detailRsvpButton,
                isRsvpd && styles.detailRsvpButtonActive,
                isWaitlisted && styles.detailRsvpButtonWaitlist,
              ]}
              onPress={() => handleRsvp(event.id)}
            >
              <Text
                style={[
                  styles.detailRsvpButtonText,
                  (isRsvpd || isWaitlisted) && styles.detailRsvpButtonTextActive,
                ]}
              >
                {isRsvpd ? 'Cancel RSVP' : isWaitlisted ? 'Leave Waitlist' : isFull ? 'Join Waitlist' : 'RSVP Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Create Event Modal ─────────────────────────────────────────────────────

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View testID="create-event-modal" style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            testID="close-create-modal"
            onPress={() => {
              setShowCreateModal(false);
              resetCreateForm();
            }}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Create Event</Text>
          <TouchableOpacity testID="submit-create-event" onPress={handleCreateEvent}>
            <Text style={styles.createSubmitText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title *</Text>
            <TextInput
              testID="create-title-input"
              style={styles.formInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Event title"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              testID="create-description-input"
              style={[styles.formInput, styles.formTextArea]}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Describe your event..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category</Text>
            <View testID="create-category-selector" style={styles.categorySelector}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  testID={`create-cat-${cat.id}`}
                  style={[styles.categorySelectorItem, newCategory === cat.id && styles.categorySelectorItemActive]}
                  onPress={() => setNewCategory(cat.id)}
                >
                  <Text style={styles.categorySelectorIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categorySelectorLabel,
                      newCategory === cat.id && styles.categorySelectorLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Date *</Text>
            <TextInput
              testID="create-date-input"
              style={styles.formInput}
              value={newDate}
              onChangeText={setNewDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>Start Time *</Text>
              <TextInput
                testID="create-start-time-input"
                style={styles.formInput}
                value={newStartTime}
                onChangeText={setNewStartTime}
                placeholder="HH:MM"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>End Time</Text>
              <TextInput
                testID="create-end-time-input"
                style={styles.formInput}
                value={newEndTime}
                onChangeText={setNewEndTime}
                placeholder="HH:MM"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Location</Text>
            <View testID="create-location-selector" style={styles.locationSelector}>
              {LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  testID={`create-loc-${loc.id}`}
                  style={[styles.locationItem, newLocationId === loc.id && styles.locationItemActive]}
                  onPress={() => setNewLocationId(loc.id)}
                >
                  <Text style={styles.locationItemName}>{loc.name}</Text>
                  <Text style={styles.locationItemCity}>{loc.city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Capacity</Text>
            <TextInput
              testID="create-capacity-input"
              style={styles.formInput}
              value={newCapacity}
              onChangeText={setNewCapacity}
              keyboardType="numeric"
              placeholder="50"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Free Event</Text>
              <Switch
                testID="create-free-switch"
                value={newIsFree}
                onValueChange={setNewIsFree}
                trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
              />
            </View>
          </View>

          {!newIsFree && (
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Price ($)</Text>
              <TextInput
                testID="create-price-input"
                style={styles.formInput}
                value={newPrice}
                onChangeText={setNewPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Public Event</Text>
              <Switch
                testID="create-public-switch"
                value={newIsPublic}
                onValueChange={setNewIsPublic}
                trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );

  // ── Notifications Panel ────────────────────────────────────────────────────

  const renderNotifications = () => (
    <Modal
      visible={showNotifications}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowNotifications(false)}
    >
      <View testID="notifications-modal" style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            testID="close-notifications"
            onPress={() => setShowNotifications(false)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Notifications</Text>
          <TouchableOpacity testID="mark-all-read" onPress={handleMarkAllNotificationsRead}>
            <Text style={styles.markAllReadText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No notifications yet</Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                testID={`notification-${notif.id}`}
                style={[styles.notificationItem, !notif.read && styles.notificationUnread]}
                onPress={() => handleMarkNotificationRead(notif.id)}
              >
                <View style={styles.notificationDot}>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationMessage, !notif.read && styles.notificationMessageUnread]}>
                    {notif.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {new Date(notif.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  // ── User Profile Modal ─────────────────────────────────────────────────────

  const renderProfileModal = () => {
    if (!selectedProfileUser) return null;
    const user = selectedProfileUser;
    const userHosted = events.filter((e) => e.hostId === user.id);
    const userAttending = events.filter((e) => e.rsvps.includes(user.id) && e.hostId !== user.id);

    return (
      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfile(false)}
      >
        <View testID="profile-modal" style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity testID="close-profile" onPress={() => setShowProfile(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Profile</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View testID={`profile-${user.id}`} style={styles.profileHeader}>
              {renderAvatar(user, 72)}
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileBio}>{user.bio}</Text>
              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>{user.eventsHosted}</Text>
                  <Text style={styles.profileStatLabel}>Hosted</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>{user.eventsAttended}</Text>
                  <Text style={styles.profileStatLabel}>Attended</Text>
                </View>
              </View>
            </View>

            {userHosted.length > 0 && (
              <View style={styles.profileSection}>
                <Text style={styles.profileSectionTitle}>Hosting ({userHosted.length})</Text>
                {userHosted.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    testID={`profile-event-${event.id}`}
                    style={styles.profileEventItem}
                    onPress={() => {
                      setShowProfile(false);
                      openEventDetail(event);
                    }}
                  >
                    <Text style={styles.profileEventTitle}>{event.title}</Text>
                    <Text style={styles.profileEventDate}>{formatDate(event.date)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {userAttending.length > 0 && (
              <View style={styles.profileSection}>
                <Text style={styles.profileSectionTitle}>Attending ({userAttending.length})</Text>
                {userAttending.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    testID={`profile-attending-${event.id}`}
                    style={styles.profileEventItem}
                    onPress={() => {
                      setShowProfile(false);
                      openEventDetail(event);
                    }}
                  >
                    <Text style={styles.profileEventTitle}>{event.title}</Text>
                    <Text style={styles.profileEventDate}>{formatDate(event.date)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // ── Calendar View ──────────────────────────────────────────────────────────

  const renderCalendarView = () => (
    <View testID="calendar-view" style={styles.calendarContainer}>
      <View style={styles.calendarNav}>
        <TouchableOpacity testID="calendar-prev" onPress={() => navigateCalendar('prev')}>
          <Text style={styles.calendarNavText}>{'\u25C0'}</Text>
        </TouchableOpacity>
        <Text testID="calendar-month-label" style={styles.calendarMonthLabel}>
          {monthNames[calendarMonth]} {calendarYear}
        </Text>
        <TouchableOpacity testID="calendar-next" onPress={() => navigateCalendar('next')}>
          <Text style={styles.calendarNavText}>{'\u25B6'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarWeekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.calendarWeekDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((cell, idx) => (
          <View key={idx} style={styles.calendarCell}>
            {cell.day !== null && (
              <>
                <Text style={styles.calendarDayNumber}>{cell.day}</Text>
                {cell.events.length > 0 && (
                  <View style={styles.calendarEventDots}>
                    {cell.events.slice(0, 3).map((ev) => (
                      <TouchableOpacity
                        key={ev.id}
                        testID={`calendar-event-${ev.id}`}
                        onPress={() => openEventDetail(ev)}
                      >
                        <View
                          style={[styles.calendarDot, { backgroundColor: getCategoryColor(ev.category) }]}
                        />
                      </TouchableOpacity>
                    ))}
                    {cell.events.length > 3 && (
                      <Text style={styles.calendarMoreText}>+{cell.events.length - 3}</Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        ))}
      </View>

      {calendarEvents.length > 0 && (
        <View style={styles.calendarEventList}>
          <Text style={styles.calendarEventListTitle}>
            Events in {monthNames[calendarMonth]}
          </Text>
          {calendarEvents
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((event) => (
              <TouchableOpacity
                key={event.id}
                testID={`calendar-list-${event.id}`}
                style={styles.calendarEventItem}
                onPress={() => openEventDetail(event)}
              >
                <View style={[styles.calendarEventColor, { backgroundColor: getCategoryColor(event.category) }]} />
                <View style={styles.calendarEventInfo}>
                  <Text style={styles.calendarEventTitle}>{event.title}</Text>
                  <Text style={styles.calendarEventDate}>
                    {formatDate(event.date)} {'\u00B7'} {formatTime(event.startTime)}
                  </Text>
                </View>
                <Text style={styles.calendarEventRsvp}>
                  {event.rsvps.length}/{event.capacity}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );

  // ── Map View ───────────────────────────────────────────────────────────────

  const renderMapView = () => {
    const eventsByLocation = {};
    filteredAndSortedEvents.forEach((event) => {
      if (!eventsByLocation[event.locationId]) {
        eventsByLocation[event.locationId] = [];
      }
      eventsByLocation[event.locationId].push(event);
    });

    return (
      <View testID="map-view" style={styles.mapViewContainer}>
        <View style={styles.mapDisplay}>
          <Text style={styles.mapDisplayText}>{'\u{1F5FA}\u{FE0F}'} Map View</Text>
          <Text style={styles.mapDisplaySubtext}>
            {Object.keys(eventsByLocation).length} locations with events
          </Text>
        </View>

        <ScrollView style={styles.mapLocationList}>
          {Object.entries(eventsByLocation).map(([locId, locEvents]) => {
            const location = getLocation(locId);
            return (
              <View key={locId} testID={`map-location-${locId}`} style={styles.mapLocationCard}>
                <View style={styles.mapLocationHeader}>
                  <Text style={styles.mapLocationName}>{location?.name}</Text>
                  <Text style={styles.mapLocationAddress}>
                    {location?.address}, {location?.city}
                  </Text>
                  <Text style={styles.mapLocationCoords}>
                    {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                  </Text>
                </View>
                {locEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    testID={`map-event-${event.id}`}
                    style={styles.mapEventItem}
                    onPress={() => openEventDetail(event)}
                  >
                    <View style={[styles.mapEventDot, { backgroundColor: getCategoryColor(event.category) }]} />
                    <View style={styles.mapEventInfo}>
                      <Text style={styles.mapEventTitle}>{event.title}</Text>
                      <Text style={styles.mapEventDate}>{formatDate(event.date)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // ── Main Render ────────────────────────────────────────────────────────────

  return (
    <View testID="home-screen" style={styles.container}>
      {/* Header */}
      <View testID="app-header" style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appTitle}>Evently</Text>
          <Text style={styles.appSubtitle}>Discover & plan events</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            testID="notifications-btn"
            style={styles.headerButton}
            onPress={() => setShowNotifications(true)}
          >
            <Text style={styles.headerButtonText}>{'\u{1F514}'}</Text>
            {unreadNotificationCount > 0 && (
              <View testID="notification-badge" style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            testID="profile-btn"
            style={styles.headerButton}
            onPress={() => openUserProfile(CURRENT_USER.id)}
          >
            {renderAvatar(CURRENT_USER, 32)}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View testID="search-bar" style={styles.searchBar}>
        <Text style={styles.searchIcon}>{'\u{1F50D}'}</Text>
        <TextInput
          testID="search-input"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search events, locations, tags..."
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity testID="clear-search" onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchText}>{'\u2716'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        testID="category-filter"
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {CATEGORIES.map((cat) => renderCategoryChip(cat, selectedCategory === cat.id))}
      </ScrollView>

      {/* View Mode Toggle & Filters */}
      <View testID="toolbar" style={styles.toolbar}>
        <View style={styles.viewModeToggle}>
          {[
            { id: 'list', icon: '\u{1F4CB}', label: 'List' },
            { id: 'calendar', icon: '\u{1F4C5}', label: 'Calendar' },
            { id: 'map', icon: '\u{1F5FA}\u{FE0F}', label: 'Map' },
          ].map((mode) => (
            <TouchableOpacity
              key={mode.id}
              testID={`view-mode-${mode.id}`}
              style={[styles.viewModeButton, viewMode === mode.id && styles.viewModeButtonActive]}
              onPress={() => setViewMode(mode.id)}
            >
              <Text style={styles.viewModeIcon}>{mode.icon}</Text>
              <Text
                style={[styles.viewModeLabel, viewMode === mode.id && styles.viewModeLabelActive]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          testID="toggle-filters"
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {'\u2699\u{FE0F}'} Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Filters */}
      {showFilters && (
        <View testID="filter-panel" style={styles.filterPanel}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            {[
              { id: 'date', label: 'Date' },
              { id: 'popularity', label: 'Popular' },
              { id: 'price', label: 'Price' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                testID={`sort-${opt.id}`}
                style={[styles.filterOption, sortBy === opt.id && styles.filterOptionActive]}
                onPress={() => setSortBy(opt.id)}
              >
                <Text
                  style={[styles.filterOptionText, sortBy === opt.id && styles.filterOptionTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Price:</Text>
            {[
              { id: 'all', label: 'All' },
              { id: 'free', label: 'Free' },
              { id: 'paid', label: 'Paid' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                testID={`price-filter-${opt.id}`}
                style={[styles.filterOption, priceFilter === opt.id && styles.filterOptionActive]}
                onPress={() => setPriceFilter(opt.id)}
              >
                <Text
                  style={[styles.filterOptionText, priceFilter === opt.id && styles.filterOptionTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* My Events Summary */}
      <View testID="my-events-summary" style={styles.myEventsSummary}>
        <Text style={styles.myEventsTitle}>My Events</Text>
        <View style={styles.myEventsRow}>
          <View testID="going-count" style={styles.myEventsStat}>
            <Text style={styles.myEventsStatValue}>{myEvents.length}</Text>
            <Text style={styles.myEventsStatLabel}>Going</Text>
          </View>
          <View testID="hosting-count" style={styles.myEventsStat}>
            <Text style={styles.myEventsStatValue}>{hostedEvents.length}</Text>
            <Text style={styles.myEventsStatLabel}>Hosting</Text>
          </View>
        </View>
      </View>

      {/* Content Area */}
      {viewMode === 'list' && (
        <ScrollView
          ref={scrollViewRef}
          testID="event-list"
          style={styles.eventList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.eventListContent}
        >
          {filteredAndSortedEvents.length === 0 ? (
            <View testID="empty-state" style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>{'\u{1F50D}'}</Text>
              <Text style={styles.emptyStateTitle}>No events found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your filters or search query
              </Text>
            </View>
          ) : (
            filteredAndSortedEvents.map((event) => renderEventCard(event))
          )}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {viewMode === 'calendar' && (
        <ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
          {renderCalendarView()}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {viewMode === 'map' && renderMapView()}

      {/* FAB - Create Event */}
      <TouchableOpacity
        testID="create-event-fab"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View testID="footer" style={styles.footer}>
        <Text style={styles.footerText}>{'\u00A9'} 2025 Evently. All rights reserved.</Text>
      </View>

      {/* Modals */}
      {renderEventDetail()}
      {renderCreateModal()}
      {renderNotifications()}
      {renderProfileModal()}
    </View>
  );
}

// ─── Category Color Helper ───────────────────────────────────────────────────

function getCategoryColor(category) {
  const colors = {
    music: '#7C3AED',
    food: '#DC2626',
    outdoor: '#059669',
    art: '#D97706',
    fitness: '#2563EB',
    tech: '#4F46E5',
    social: '#DB2777',
    education: '#0891B2',
  };
  return colors[category] || '#6B7280';
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerLeft: {},
  appTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  appSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerButton: { position: 'relative', padding: 4 },
  headerButtonText: { fontSize: 24 },
  notifBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  clearSearchText: { fontSize: 16, color: '#9CA3AF', paddingLeft: 8 },

  // Categories
  categoryScroll: { marginTop: 12, maxHeight: 48 },
  categoryScrollContent: { paddingHorizontal: 16, gap: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryChipSelected: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  categoryChipIcon: { fontSize: 14, marginRight: 6 },
  categoryChipLabel: { fontSize: 13, color: '#374151', fontWeight: '500' },
  categoryChipLabelSelected: { color: '#FFFFFF' },

  // Toolbar
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 12 },
  viewModeToggle: { flexDirection: 'row', gap: 4 },
  viewModeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  viewModeButtonActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  viewModeIcon: { fontSize: 14, marginRight: 4 },
  viewModeLabel: { fontSize: 12, color: '#374151', fontWeight: '500' },
  viewModeLabelActive: { color: '#FFFFFF' },
  filterToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  filterToggleText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  // Filters
  filterPanel: { marginHorizontal: 16, marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  filterLabel: { fontSize: 13, color: '#6B7280', marginRight: 8, width: 55 },
  filterOption: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F3F4F6', marginRight: 6 },
  filterOptionActive: { backgroundColor: '#4F46E5' },
  filterOptionText: { fontSize: 12, color: '#374151' },
  filterOptionTextActive: { color: '#FFFFFF' },

  // My Events Summary
  myEventsSummary: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  myEventsTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  myEventsRow: { flexDirection: 'row', gap: 16 },
  myEventsStat: { alignItems: 'center' },
  myEventsStatValue: { fontSize: 20, fontWeight: '700', color: '#4F46E5' },
  myEventsStatLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Event List
  eventList: { flex: 1, marginTop: 8 },
  eventListContent: { paddingHorizontal: 16, paddingBottom: 16 },

  // Event Card
  eventCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  eventCardImageContainer: { position: 'relative', height: 140, backgroundColor: '#F3F4F6' },
  eventCardImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  eventCardImagePlaceholder: { fontSize: 48 },
  urgencyBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  urgencyBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  priceBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#059669', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priceBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  eventCardBody: { padding: 14 },
  eventCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  eventCardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryTagText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  eventCardDescription: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 8 },
  eventCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 4 },
  eventCardMetaText: { fontSize: 12, color: '#6B7280' },
  eventCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  hostInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hostName: { fontSize: 13, color: '#374151', fontWeight: '500' },
  eventCardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attendeeCount: {},
  attendeeCountText: { fontSize: 12, color: '#6B7280' },
  rsvpButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#4F46E5' },
  rsvpButtonActive: { backgroundColor: '#059669' },
  rsvpButtonWaitlist: { backgroundColor: '#D97706' },
  rsvpButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  rsvpButtonTextActive: { color: '#FFFFFF' },
  rsvpButtonTextWaitlist: { color: '#FFFFFF' },

  // Avatar
  avatar: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '700' },

  // Modals
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalCloseText: { fontSize: 15, color: '#4F46E5', fontWeight: '600' },
  modalBody: { flex: 1, padding: 20 },
  deleteText: { fontSize: 15, color: '#EF4444', fontWeight: '600' },
  createSubmitText: { fontSize: 15, color: '#4F46E5', fontWeight: '700' },
  markAllReadText: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },

  // Event Detail
  detailImage: { height: 200, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginBottom: 16 },
  detailImagePlaceholder: { fontSize: 64 },
  detailContent: {},
  detailTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  detailSection: { marginBottom: 20 },
  detailSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  detailText: { fontSize: 15, color: '#374151' },
  detailSubtext: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  detailDescription: { fontSize: 15, color: '#374151', lineHeight: 22 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel: { fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  detailHostRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailHostInfo: { flex: 1 },
  detailHostName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  detailHostBio: { fontSize: 13, color: '#6B7280' },
  detailFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  detailRsvpButton: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  detailRsvpButtonActive: { backgroundColor: '#DC2626' },
  detailRsvpButtonWaitlist: { backgroundColor: '#D97706' },
  detailRsvpButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  detailRsvpButtonTextActive: { color: '#FFFFFF' },

  // Map
  mapPlaceholder: { marginTop: 8, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 20, alignItems: 'center' },
  mapPlaceholderText: { fontSize: 14, color: '#6B7280' },
  mapViewContainer: { flex: 1 },
  mapDisplay: { height: 200, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, borderRadius: 16 },
  mapDisplayText: { fontSize: 24 },
  mapDisplaySubtext: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  mapLocationList: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  mapLocationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  mapLocationHeader: { marginBottom: 8 },
  mapLocationName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  mapLocationAddress: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  mapLocationCoords: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  mapEventItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  mapEventDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  mapEventInfo: { flex: 1 },
  mapEventTitle: { fontSize: 13, color: '#374151', fontWeight: '500' },
  mapEventDate: { fontSize: 11, color: '#6B7280' },

  // Calendar
  calendarContainer: { paddingHorizontal: 16 },
  calendarNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  calendarNavText: { fontSize: 18, color: '#4F46E5', padding: 8 },
  calendarMonthLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  calendarWeekHeader: { flexDirection: 'row' },
  calendarWeekDay: { flex: 1, textAlign: 'center', fontSize: 12, color: '#6B7280', fontWeight: '600', paddingVertical: 4 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: (SCREEN_WIDTH - 32) / 7, minHeight: 50, padding: 2, alignItems: 'center' },
  calendarDayNumber: { fontSize: 13, color: '#374151', fontWeight: '500' },
  calendarEventDots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  calendarDot: { width: 6, height: 6, borderRadius: 3 },
  calendarMoreText: { fontSize: 8, color: '#6B7280' },
  calendarEventList: { marginTop: 16 },
  calendarEventListTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  calendarEventItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  calendarEventColor: { width: 4, height: 32, borderRadius: 2, marginRight: 10 },
  calendarEventInfo: { flex: 1 },
  calendarEventTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  calendarEventDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  calendarEventRsvp: { fontSize: 12, color: '#6B7280' },

  // Attendees
  attendeeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  attendeeItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  attendeeName: { fontSize: 14, color: '#374151' },
  waitlistTitle: { fontSize: 14, fontWeight: '600', color: '#D97706', marginTop: 12, marginBottom: 6 },

  // Tags
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 12, color: '#6B7280' },

  // Notifications
  notificationItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  notificationUnread: { backgroundColor: '#EFF6FF' },
  notificationDot: { width: 24, justifyContent: 'center', alignItems: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F46E5' },
  notificationContent: { flex: 1 },
  notificationMessage: { fontSize: 14, color: '#374151', lineHeight: 20 },
  notificationMessageUnread: { fontWeight: '600', color: '#111827' },
  notificationTime: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },

  // Profile
  profileHeader: { alignItems: 'center', paddingVertical: 20 },
  profileName: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 12 },
  profileBio: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'center', paddingHorizontal: 32 },
  profileStats: { flexDirection: 'row', marginTop: 16, gap: 32 },
  profileStat: { alignItems: 'center' },
  profileStatValue: { fontSize: 20, fontWeight: '700', color: '#4F46E5' },
  profileStatLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  profileStatDivider: { width: 1, backgroundColor: '#E5E7EB' },
  profileSection: { marginTop: 20 },
  profileSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  profileEventItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  profileEventTitle: { fontSize: 14, color: '#374151', fontWeight: '500', flex: 1 },
  profileEventDate: { fontSize: 12, color: '#6B7280', marginLeft: 8 },

  // Create Form
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  formInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#111827' },
  formTextArea: { minHeight: 100, textAlignVertical: 'top' },
  formRow: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categorySelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categorySelectorItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  categorySelectorItemActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  categorySelectorIcon: { fontSize: 14, marginRight: 4 },
  categorySelectorLabel: { fontSize: 12, color: '#374151' },
  categorySelectorLabelActive: { color: '#FFFFFF' },
  locationSelector: { gap: 6 },
  locationItem: { padding: 10, borderRadius: 8, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  locationItemActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  locationItemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  locationItemCity: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyStateEmoji: { fontSize: 48, marginBottom: 12 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptyStateText: { fontSize: 14, color: '#6B7280' },

  // FAB
  fab: { position: 'absolute', bottom: 40, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabText: { color: '#FFFFFF', fontSize: 28, fontWeight: '600', marginTop: -2 },

  // Footer
  footer: { paddingVertical: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  footerText: { fontSize: 11, color: '#9CA3AF' },
});
