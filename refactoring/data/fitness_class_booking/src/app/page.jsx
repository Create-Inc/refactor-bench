import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CLASS_TYPES = [
  { id: 'yoga', name: 'Yoga', icon: '🧘', color: '#8b5cf6' },
  { id: 'hiit', name: 'HIIT', icon: '🔥', color: '#ef4444' },
  { id: 'spin', name: 'Spin', icon: '🚴', color: '#f59e0b' },
  { id: 'pilates', name: 'Pilates', icon: '🤸', color: '#ec4899' },
  { id: 'boxing', name: 'Boxing', icon: '🥊', color: '#f97316' },
  { id: 'dance', name: 'Dance', icon: '💃', color: '#06b6d4' },
  { id: 'strength', name: 'Strength', icon: '🏋️', color: '#10b981' },
  { id: 'swimming', name: 'Swimming', icon: '🏊', color: '#3b82f6' },
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const DIFFICULTY_COLORS = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };

const INSTRUCTORS = [
  { id: 'i1', name: 'Maya Rodriguez', specialties: ['yoga', 'pilates'], avatar: '👩‍🦰', rating: 4.9, bio: 'Certified yoga instructor with 10+ years of experience' },
  { id: 'i2', name: 'Jake Thompson', specialties: ['hiit', 'strength', 'boxing'], avatar: '👨‍🦱', rating: 4.8, bio: 'Former athlete turned fitness coach' },
  { id: 'i3', name: 'Lena Park', specialties: ['spin', 'hiit', 'dance'], avatar: '👩', rating: 4.7, bio: 'Energetic instructor who loves high-intensity workouts' },
  { id: 'i4', name: 'Carlos Mendez', specialties: ['swimming', 'strength'], avatar: '👨', rating: 4.6, bio: 'Competitive swimmer and certified personal trainer' },
  { id: 'i5', name: 'Aisha Patel', specialties: ['dance', 'yoga'], avatar: '👩‍🦱', rating: 4.9, bio: 'Dance choreographer and mindfulness coach' },
];

const TIME_SLOTS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

const generateWeekDates = (startDate) => {
  const dates = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay());
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const formatTime = (time) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const INITIAL_CLASSES = [
  { id: 'c1', typeId: 'yoga', instructorId: 'i1', title: 'Morning Flow Yoga', date: new Date().toISOString().split('T')[0], time: '07:00', duration: 60, difficulty: 'beginner', maxCapacity: 20, enrolled: 14, waitlist: [], room: 'Studio A', description: 'Start your day with gentle stretches and mindful breathing.', recurring: true, recurringDays: [1, 3, 5] },
  { id: 'c2', typeId: 'hiit', instructorId: 'i2', title: 'Power HIIT', date: new Date().toISOString().split('T')[0], time: '08:00', duration: 45, difficulty: 'advanced', maxCapacity: 15, enrolled: 15, waitlist: ['w1', 'w2'], room: 'Gym Floor', description: 'High-intensity interval training to push your limits.', recurring: true, recurringDays: [2, 4] },
  { id: 'c3', typeId: 'spin', instructorId: 'i3', title: 'Spin & Burn', date: new Date().toISOString().split('T')[0], time: '09:00', duration: 50, difficulty: 'intermediate', maxCapacity: 25, enrolled: 18, waitlist: [], room: 'Spin Room', description: 'High-energy cycling class with motivating music.', recurring: true, recurringDays: [1, 2, 3, 4, 5] },
  { id: 'c4', typeId: 'pilates', instructorId: 'i1', title: 'Core Pilates', date: new Date().toISOString().split('T')[0], time: '10:00', duration: 55, difficulty: 'intermediate', maxCapacity: 18, enrolled: 12, waitlist: [], room: 'Studio B', description: 'Strengthen your core with controlled movements.', recurring: false, recurringDays: [] },
  { id: 'c5', typeId: 'boxing', instructorId: 'i2', title: 'Cardio Boxing', date: new Date().toISOString().split('T')[0], time: '17:00', duration: 60, difficulty: 'intermediate', maxCapacity: 20, enrolled: 19, waitlist: ['w3'], room: 'Boxing Ring', description: 'Box your way to fitness with this cardio-heavy class.', recurring: true, recurringDays: [1, 3] },
  { id: 'c6', typeId: 'dance', instructorId: 'i5', title: 'Zumba Party', date: new Date().toISOString().split('T')[0], time: '18:00', duration: 60, difficulty: 'beginner', maxCapacity: 30, enrolled: 22, waitlist: [], room: 'Dance Hall', description: 'Dance-fitness party with Latin and international music.', recurring: true, recurringDays: [2, 4, 6] },
  { id: 'c7', typeId: 'strength', instructorId: 'i2', title: 'Full Body Strength', date: new Date().toISOString().split('T')[0], time: '19:00', duration: 60, difficulty: 'advanced', maxCapacity: 12, enrolled: 11, waitlist: [], room: 'Weight Room', description: 'Build total-body strength with compound exercises.', recurring: true, recurringDays: [1, 3, 5] },
  { id: 'c8', typeId: 'swimming', instructorId: 'i4', title: 'Lap Swimming', date: new Date().toISOString().split('T')[0], time: '06:00', duration: 60, difficulty: 'beginner', maxCapacity: 8, enrolled: 5, waitlist: [], room: 'Pool', description: 'Guided lap swimming for all levels.', recurring: true, recurringDays: [1, 2, 3, 4, 5] },
  { id: 'c9', typeId: 'yoga', instructorId: 'i5', title: 'Evening Restorative Yoga', date: new Date().toISOString().split('T')[0], time: '20:00', duration: 75, difficulty: 'beginner', maxCapacity: 15, enrolled: 8, waitlist: [], room: 'Studio A', description: 'Wind down with gentle restorative poses and meditation.', recurring: true, recurringDays: [2, 4] },
];

const INITIAL_BOOKINGS = [
  { id: 'b1', classId: 'c1', userId: 'user1', bookedAt: Date.now() - 86400000 * 2, status: 'confirmed' },
  { id: 'b2', classId: 'c3', userId: 'user1', bookedAt: Date.now() - 86400000, status: 'confirmed' },
  { id: 'b3', classId: 'c6', userId: 'user1', bookedAt: Date.now() - 3600000, status: 'confirmed' },
  { id: 'b4', classId: 'c2', userId: 'user1', bookedAt: Date.now() - 7200000, status: 'waitlisted' },
];

export default function FitnessBooking() {
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [activeView, setActiveView] = useState('schedule');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showInstructorProfile, setShowInstructorProfile] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterInstructor] = useState('all');
  const [filterTime, setFilterTime] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [sortBy, setSortBy] = useState('time');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const savedBookings = localStorage.getItem('fitnessBookings');
    if (savedBookings) {
      try { setBookings(JSON.parse(savedBookings)); } catch (e) { /* ignore */ }
    }
    const savedFavorites = localStorage.getItem('fitnessFavorites');
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fitnessBookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('fitnessFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedClass(null);
        setShowBookingModal(false);
        setShowCreateClassModal(false);
        setShowInstructorProfile(null);
        setShowNotifications(false);
        setShowCancelConfirm(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    setNotifications(prev => [{ id: Date.now().toString(), message, type, timestamp: Date.now(), read: false }, ...prev]);
  }, []);

  const currentWeekDates = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    return generateWeekDates(today);
  }, [weekOffset]);

  const getInstructor = (id) => INSTRUCTORS.find(i => i.id === id);
  const getClassType = (id) => CLASS_TYPES.find(t => t.id === id);

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = cls.title.toLowerCase().includes(q);
        const matchInstructor = getInstructor(cls.instructorId)?.name.toLowerCase().includes(q);
        const matchType = getClassType(cls.typeId)?.name.toLowerCase().includes(q);
        const matchRoom = cls.room.toLowerCase().includes(q);
        if (!matchTitle && !matchInstructor && !matchType && !matchRoom) return false;
      }
      if (filterType !== 'all' && cls.typeId !== filterType) return false;
      if (filterDifficulty !== 'all' && cls.difficulty !== filterDifficulty) return false;
      if (filterInstructor !== 'all' && cls.instructorId !== filterInstructor) return false;
      if (filterTime !== 'all') {
        const hour = parseInt(cls.time.split(':')[0]);
        if (filterTime === 'morning' && hour >= 12) return false;
        if (filterTime === 'afternoon' && (hour < 12 || hour >= 17)) return false;
        if (filterTime === 'evening' && hour < 17) return false;
      }
      if (showOnlyFavorites && !favorites.includes(cls.id)) return false;
      return true;
    });
  }, [classes, searchQuery, filterType, filterDifficulty, filterInstructor, filterTime, showOnlyFavorites, favorites]);

  const sortedClasses = useMemo(() => {
    return [...filteredClasses].sort((a, b) => {
      if (sortBy === 'time') return a.time.localeCompare(b.time);
      if (sortBy === 'popularity') return (b.enrolled / b.maxCapacity) - (a.enrolled / a.maxCapacity);
      if (sortBy === 'availability') return (a.maxCapacity - a.enrolled) - (b.maxCapacity - b.enrolled);
      if (sortBy === 'difficulty') {
        const order = { beginner: 0, intermediate: 1, advanced: 2 };
        return order[a.difficulty] - order[b.difficulty];
      }
      return 0;
    });
  }, [filteredClasses, sortBy]);

  const isClassFull = (cls) => cls.enrolled >= cls.maxCapacity;

  const getUserBookingForClass = (classId) => bookings.find(b => b.classId === classId && b.userId === 'user1');

  const getAvailableSpots = (cls) => Math.max(0, cls.maxCapacity - cls.enrolled);

  const getOccupancyPercentage = (cls) => Math.round((cls.enrolled / cls.maxCapacity) * 100);

  const bookClass = (classId) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    const existing = getUserBookingForClass(classId);
    if (existing) return;

    if (isClassFull(cls)) {
      const newBooking = { id: `b${Date.now()}`, classId, userId: 'user1', bookedAt: Date.now(), status: 'waitlisted' };
      setBookings(prev => [...prev, newBooking]);
      setClasses(prev => prev.map(c => c.id === classId ? { ...c, waitlist: [...c.waitlist, 'user1'] } : c));
      addNotification(`Added to waitlist for ${cls.title}`, 'warning');
    } else {
      const newBooking = { id: `b${Date.now()}`, classId, userId: 'user1', bookedAt: Date.now(), status: 'confirmed' };
      setBookings(prev => [...prev, newBooking]);
      setClasses(prev => prev.map(c => c.id === classId ? { ...c, enrolled: c.enrolled + 1 } : c));
      addNotification(`Booked ${cls.title} successfully!`, 'success');
    }
    setShowBookingModal(false);
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const cls = classes.find(c => c.id === booking.classId);

    if (booking.status === 'waitlisted') {
      setClasses(prev => prev.map(c => c.id === booking.classId ? { ...c, waitlist: c.waitlist.filter(w => w !== 'user1') } : c));
    } else {
      setClasses(prev => prev.map(c => c.id === booking.classId ? { ...c, enrolled: Math.max(0, c.enrolled - 1) } : c));
    }

    setBookings(prev => prev.filter(b => b.id !== bookingId));
    addNotification(`Cancelled booking for ${cls?.title}`, 'info');
    setShowCancelConfirm(null);
  };

  const toggleFavorite = (classId) => {
    setFavorites(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      }
      return [...prev, classId];
    });
  };

  const createClass = (classData) => {
    const newClass = {
      id: `c${Date.now()}`,
      ...classData,
      enrolled: 0,
      waitlist: [],
      maxCapacity: parseInt(classData.maxCapacity) || 20,
      duration: parseInt(classData.duration) || 60,
      recurring: classData.recurring || false,
      recurringDays: classData.recurringDays || [],
    };
    setClasses(prev => [...prev, newClass]);
    setShowCreateClassModal(false);
    addNotification(`Class "${newClass.title}" created`, 'success');
  };

  const getTotalBookings = () => bookings.filter(b => b.status === 'confirmed').length;
  const getWaitlistedCount = () => bookings.filter(b => b.status === 'waitlisted').length;
  const getWeeklyClassCount = () => classes.filter(c => c.recurring).length;
  const getAverageOccupancy = () => {
    if (classes.length === 0) return 0;
    return Math.round(classes.reduce((sum, c) => sum + getOccupancyPercentage(c), 0) / classes.length);
  };

  const accentColor = '#6366f1';
  const bgColor = '#f8fafc';
  const cardBg = '#ffffff';
  const textColor = '#1e293b';
  const secondaryText = '#64748b';
  const borderColor = '#e2e8f0';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', backgroundColor: '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${borderColor}` }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>FitBook</h1>
          <p style={{ fontSize: '12px', color: secondaryText, margin: '4px 0 0' }}>Class Booking System</p>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'schedule', icon: '📅', label: 'Schedule' },
            { id: 'my-bookings', icon: '🎫', label: 'My Bookings' },
            { id: 'classes', icon: '📋', label: 'All Classes' },
            { id: 'instructors', icon: '👥', label: 'Instructors' },
            { id: 'stats', icon: '📊', label: 'Statistics' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
                marginBottom: '4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                backgroundColor: activeView === item.id ? '#eef2ff' : 'transparent',
                color: activeView === item.id ? accentColor : textColor,
                fontWeight: activeView === item.id ? 600 : 400, textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: `1px solid ${borderColor}` }}>
          <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '8px' }}>Your Stats</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
            <span>Booked</span>
            <span style={{ fontWeight: 600 }}>{getTotalBookings()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>Waitlisted</span>
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>{getWaitlistedCount()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search classes, instructors... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: '#f9fafb', color: textColor, outline: 'none' }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
            </div>

            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} aria-label="Filter by class type" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: '#f9fafb', color: textColor, cursor: 'pointer' }}>
              <option value="all">All Types</option>
              {CLASS_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
            </select>

            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} aria-label="Filter by difficulty" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: '#f9fafb', color: textColor, cursor: 'pointer' }}>
              <option value="all">All Levels</option>
              {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>

            <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} aria-label="Filter by time" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: '#f9fafb', color: textColor, cursor: 'pointer' }}>
              <option value="all">All Times</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>

            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              style={{
                padding: '8px 12px', border: `1px solid ${showOnlyFavorites ? accentColor : borderColor}`,
                borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                backgroundColor: showOnlyFavorites ? '#eef2ff' : 'transparent', color: showOnlyFavorites ? accentColor : textColor,
              }}
              aria-label="Toggle favorites filter"
            >
              {showOnlyFavorites ? '★ Favorites' : '☆ Favorites'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowCreateClassModal(true)} style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              + New Class
            </button>

            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', position: 'relative' }} aria-label="Notifications">
                🔔
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                )}
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, top: '100%', width: '320px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '400px', overflow: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}`, fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} style={{ fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: secondaryText, fontSize: '13px' }}>No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${borderColor}`, backgroundColor: n.read ? 'transparent' : '#f0f4ff', fontSize: '13px' }}>
                        <div>{n.message}</div>
                        <div style={{ color: secondaryText, fontSize: '11px', marginTop: '4px' }}>
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Schedule View */}
          {activeView === 'schedule' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setWeekOffset(prev => prev - 1)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: cardBg, color: textColor }}>
                    ← Prev
                  </button>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    {formatDate(currentWeekDates[0])} - {formatDate(currentWeekDates[6])}
                  </h2>
                  <button onClick={() => setWeekOffset(prev => prev + 1)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: cardBg, color: textColor }}>
                    Next →
                  </button>
                  <button onClick={() => setWeekOffset(0)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: cardBg, color: textColor, fontSize: '13px' }}>
                    This Week
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: secondaryText }}>Sort:</span>
                  {['time', 'popularity', 'availability', 'difficulty'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                        border: `1px solid ${sortBy === s ? accentColor : borderColor}`,
                        backgroundColor: sortBy === s ? '#eef2ff' : 'transparent',
                        color: sortBy === s ? accentColor : textColor,
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                {currentWeekDates.map((date, idx) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = new Date().toDateString() === date.toDateString();
                  const dayClasses = sortedClasses.filter(c => c.date === dateStr || (c.recurring && c.recurringDays.includes(date.getDay())));

                  return (
                    <div key={idx} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${isToday ? accentColor : borderColor}`, overflow: 'hidden', minHeight: '200px' }}>
                      <div style={{ padding: '10px 12px', backgroundColor: isToday ? '#eef2ff' : '#f8fafc', borderBottom: `1px solid ${borderColor}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'uppercase' }}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: isToday ? 700 : 500, color: isToday ? accentColor : textColor }}>
                          {date.getDate()}
                        </div>
                      </div>
                      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {dayClasses.length === 0 ? (
                          <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: secondaryText }}>No classes</div>
                        ) : (
                          dayClasses.map(cls => {
                            const classType = getClassType(cls.typeId);
                            const booking = getUserBookingForClass(cls.id);
                            return (
                              <div
                                key={cls.id}
                                onClick={() => { setSelectedClass(cls); setShowBookingModal(true); }}
                                style={{
                                  padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px',
                                  backgroundColor: booking ? '#f0fdf4' : '#f8fafc',
                                  borderLeft: `3px solid ${classType?.color || '#ccc'}`,
                                  border: booking ? '1px solid #86efac' : `1px solid ${borderColor}`,
                                }}
                              >
                                <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '2px' }}>{cls.title}</div>
                                <div style={{ color: secondaryText }}>{formatTime(cls.time)} | {cls.duration}min</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                  <span style={{ color: DIFFICULTY_COLORS[cls.difficulty], fontWeight: 500 }}>
                                    {cls.difficulty}
                                  </span>
                                  <span style={{ color: isClassFull(cls) ? '#ef4444' : '#22c55e' }}>
                                    {getAvailableSpots(cls)}/{cls.maxCapacity}
                                  </span>
                                </div>
                                {booking && (
                                  <div style={{ marginTop: '4px', fontSize: '10px', color: booking.status === 'confirmed' ? '#16a34a' : '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>
                                    {booking.status}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Bookings View */}
          {activeView === 'my-bookings' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>My Bookings</h2>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: secondaryText }}>
                  <p style={{ fontSize: '16px' }}>No bookings yet</p>
                  <p style={{ fontSize: '13px' }}>Browse the schedule to book your first class!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookings.map(booking => {
                    const cls = classes.find(c => c.id === booking.classId);
                    if (!cls) return null;
                    const classType = getClassType(cls.typeId);
                    const instructor = getInstructor(cls.instructorId);
                    return (
                      <div key={booking.id} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '16px', border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '32px' }}>{classType?.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{cls.title}</h3>
                            <span style={{
                              fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, textTransform: 'uppercase',
                              backgroundColor: booking.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                              color: booking.status === 'confirmed' ? '#16a34a' : '#d97706',
                            }}>
                              {booking.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: secondaryText }}>
                            {formatTime(cls.time)} | {cls.duration}min | {cls.room} | {instructor?.name}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => toggleFavorite(cls.id)} style={{ padding: '6px 10px', backgroundColor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                            {favorites.includes(cls.id) ? '★' : '☆'}
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(booking.id)}
                            style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* All Classes View */}
          {activeView === 'classes' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
                All Classes ({sortedClasses.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {sortedClasses.map(cls => {
                  const classType = getClassType(cls.typeId);
                  const instructor = getInstructor(cls.instructorId);
                  const booking = getUserBookingForClass(cls.id);
                  const occupancy = getOccupancyPercentage(cls);
                  return (
                    <div
                      key={cls.id}
                      onClick={() => { setSelectedClass(cls); setShowBookingModal(true); }}
                      style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, cursor: 'pointer', position: 'relative' }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(cls.id); }}
                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                        aria-label={`Favorite ${cls.title}`}
                      >
                        {favorites.includes(cls.id) ? '★' : '☆'}
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{classType?.icon}</span>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{cls.title}</h3>
                          <div style={{ fontSize: '12px', color: secondaryText }}>{classType?.name} | {cls.room}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '12px', lineHeight: 1.5 }}>{cls.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{instructor?.avatar}</span>
                        <span style={{ fontSize: '13px' }}>{instructor?.name}</span>
                        <span style={{ fontSize: '11px', color: '#f59e0b' }}>★ {instructor?.rating}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: DIFFICULTY_COLORS[cls.difficulty] + '20', color: DIFFICULTY_COLORS[cls.difficulty], fontWeight: 600 }}>
                          {cls.difficulty}
                        </span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: secondaryText }}>
                          {formatTime(cls.time)}
                        </span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: secondaryText }}>
                          {cls.duration}min
                        </span>
                        {cls.recurring && (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#3b82f6' }}>
                            Recurring
                          </span>
                        )}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{cls.enrolled}/{cls.maxCapacity} spots filled</span>
                          <span style={{ color: occupancy >= 90 ? '#ef4444' : occupancy >= 70 ? '#f59e0b' : '#22c55e' }}>{occupancy}%</span>
                        </div>
                        <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${occupancy}%`, height: '100%', backgroundColor: occupancy >= 90 ? '#ef4444' : occupancy >= 70 ? '#f59e0b' : '#22c55e', borderRadius: '2px' }} />
                        </div>
                      </div>
                      {booking && (
                        <div style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: booking.status === 'confirmed' ? '#dcfce7' : '#fef3c7', fontSize: '12px', fontWeight: 600, textAlign: 'center', color: booking.status === 'confirmed' ? '#16a34a' : '#d97706' }}>
                          {booking.status === 'confirmed' ? 'Booked' : 'On Waitlist'}
                        </div>
                      )}
                      {cls.waitlist.length > 0 && (
                        <div style={{ fontSize: '11px', color: secondaryText, marginTop: '4px' }}>
                          {cls.waitlist.length} on waitlist
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructors View */}
          {activeView === 'instructors' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Our Instructors</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {INSTRUCTORS.map(instructor => {
                  const instructorClasses = classes.filter(c => c.instructorId === instructor.id);
                  const totalStudents = instructorClasses.reduce((sum, c) => sum + c.enrolled, 0);
                  return (
                    <div
                      key={instructor.id}
                      onClick={() => setShowInstructorProfile(instructor)}
                      style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, cursor: 'pointer' }}
                    >
                      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '48px' }}>{instructor.avatar}</span>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '8px 0 4px' }}>{instructor.name}</h3>
                        <div style={{ fontSize: '12px', color: '#f59e0b' }}>★ {instructor.rating}</div>
                      </div>
                      <p style={{ fontSize: '13px', color: secondaryText, textAlign: 'center', marginBottom: '12px' }}>{instructor.bio}</p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        {instructor.specialties.map(s => {
                          const type = getClassType(s);
                          return (
                            <span key={s} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: type?.color + '20', color: type?.color }}>
                              {type?.icon} {type?.name}
                            </span>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '12px', borderTop: `1px solid ${borderColor}`, fontSize: '12px', textAlign: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>{instructorClasses.length}</div>
                          <div style={{ color: secondaryText }}>Classes</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>{totalStudents}</div>
                          <div style={{ color: secondaryText }}>Students</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statistics View */}
          {activeView === 'stats' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Studio Statistics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Classes', value: classes.length, icon: '📋', color: '#6366f1' },
                  { label: 'My Bookings', value: getTotalBookings(), icon: '🎫', color: '#22c55e' },
                  { label: 'Avg Occupancy', value: `${getAverageOccupancy()}%`, icon: '📊', color: '#f59e0b' },
                  { label: 'Weekly Classes', value: getWeeklyClassCount(), icon: '🔄', color: '#06b6d4' },
                ].map(stat => (
                  <div key={stat.label} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                      <span style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: secondaryText }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Classes by Type</h3>
                  {CLASS_TYPES.map(type => {
                    const count = classes.filter(c => c.typeId === type.id).length;
                    const pct = classes.length > 0 ? (count / classes.length) * 100 : 0;
                    return (
                      <div key={type.id} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{type.icon} {type.name}</span>
                          <span style={{ color: secondaryText }}>{count}</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: type.color, borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Classes by Difficulty</h3>
                  {DIFFICULTY_LEVELS.map(level => {
                    const count = classes.filter(c => c.difficulty === level).length;
                    const pct = classes.length > 0 ? (count / classes.length) * 100 : 0;
                    return (
                      <div key={level} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: DIFFICULTY_COLORS[level], display: 'inline-block' }} />
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </span>
                          <span style={{ color: secondaryText }}>{count}</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: DIFFICULTY_COLORS[level], borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Top Instructors</h3>
                  {INSTRUCTORS.sort((a, b) => b.rating - a.rating).map(instructor => {
                    const instructorClasses = classes.filter(c => c.instructorId === instructor.id);
                    return (
                      <div key={instructor.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px' }}>
                        <span>{instructor.avatar}</span>
                        <span style={{ flex: 1 }}>{instructor.name}</span>
                        <span style={{ color: '#f59e0b' }}>★ {instructor.rating}</span>
                        <span style={{ color: secondaryText }}>{instructorClasses.length} classes</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Most Popular Classes</h3>
                  {[...classes].sort((a, b) => getOccupancyPercentage(b) - getOccupancyPercentage(a)).slice(0, 5).map(cls => {
                    const classType = getClassType(cls.typeId);
                    const occupancy = getOccupancyPercentage(cls);
                    return (
                      <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px' }}>
                        <span>{classType?.icon}</span>
                        <span style={{ flex: 1 }}>{cls.title}</span>
                        <span style={{ color: occupancy >= 90 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{occupancy}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedClass && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => { setShowBookingModal(false); setSelectedClass(null); }}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const classType = getClassType(selectedClass.typeId);
              const instructor = getInstructor(selectedClass.instructorId);
              const booking = getUserBookingForClass(selectedClass.id);
              const occupancy = getOccupancyPercentage(selectedClass);

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '36px' }}>{classType?.icon}</span>
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{selectedClass.title}</h2>
                        <div style={{ fontSize: '13px', color: secondaryText }}>{classType?.name} | {selectedClass.room}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedClass.id); }}
                        style={{ padding: '6px 10px', background: 'none', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
                        aria-label="Toggle favorite"
                      >
                        {favorites.includes(selectedClass.id) ? '★' : '☆'}
                      </button>
                      <button onClick={() => { setShowBookingModal(false); setSelectedClass(null); }} style={{ padding: '6px 12px', background: 'none', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '16px', color: secondaryText }}>
                        ×
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: secondaryText, lineHeight: 1.6, marginBottom: '16px' }}>{selectedClass.description}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'uppercase', marginBottom: '4px' }}>Time</div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatTime(selectedClass.time)}</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'uppercase', marginBottom: '4px' }}>Duration</div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedClass.duration} minutes</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'uppercase', marginBottom: '4px' }}>Difficulty</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: DIFFICULTY_COLORS[selectedClass.difficulty] }}>{selectedClass.difficulty}</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'uppercase', marginBottom: '4px' }}>Available</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: isClassFull(selectedClass) ? '#ef4444' : '#22c55e' }}>
                        {getAvailableSpots(selectedClass)} / {selectedClass.maxCapacity}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Occupancy</span>
                      <span>{occupancy}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${occupancy}%`, height: '100%', backgroundColor: occupancy >= 90 ? '#ef4444' : occupancy >= 70 ? '#f59e0b' : '#22c55e', borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div
                    style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => setShowInstructorProfile(instructor)}
                  >
                    <span style={{ fontSize: '28px' }}>{instructor?.avatar}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{instructor?.name}</div>
                      <div style={{ fontSize: '12px', color: secondaryText }}>{instructor?.bio}</div>
                      <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '2px' }}>★ {instructor?.rating}</div>
                    </div>
                  </div>

                  {selectedClass.recurring && (
                    <div style={{ padding: '10px', backgroundColor: '#dbeafe', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#3b82f6' }}>
                      Recurring: {selectedClass.recurringDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                    </div>
                  )}

                  {selectedClass.waitlist.length > 0 && (
                    <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '12px' }}>
                      {selectedClass.waitlist.length} people on waitlist
                    </div>
                  )}

                  {booking ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: booking.status === 'confirmed' ? '#dcfce7' : '#fef3c7', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: booking.status === 'confirmed' ? '#16a34a' : '#d97706' }}>
                        {booking.status === 'confirmed' ? 'Booked' : 'On Waitlist'}
                      </div>
                      <button
                        onClick={() => setShowCancelConfirm(booking.id)}
                        style={{ padding: '10px 20px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => bookClass(selectedClass.id)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                        backgroundColor: isClassFull(selectedClass) ? '#fef3c7' : accentColor,
                        color: isClassFull(selectedClass) ? '#d97706' : '#ffffff',
                      }}
                    >
                      {isClassFull(selectedClass) ? 'Join Waitlist' : 'Book This Class'}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }} onClick={() => setShowCancelConfirm(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 12px' }}>Cancel Booking?</h3>
            <p style={{ fontSize: '14px', color: secondaryText, marginBottom: '20px' }}>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCancelConfirm(null)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                Keep Booking
              </button>
              <button onClick={() => cancelBooking(showCancelConfirm)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateClassModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowCreateClassModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Create New Class</h2>
              <button onClick={() => setShowCreateClassModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              createClass({
                title: fd.get('title'),
                typeId: fd.get('typeId'),
                instructorId: fd.get('instructorId'),
                date: fd.get('date'),
                time: fd.get('time'),
                duration: fd.get('duration'),
                difficulty: fd.get('difficulty'),
                maxCapacity: fd.get('maxCapacity'),
                room: fd.get('room'),
                description: fd.get('description'),
              });
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Class Title *</label>
                <input name="title" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Type</label>
                  <select name="typeId" defaultValue="yoga" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {CLASS_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Instructor</label>
                  <select name="instructorId" defaultValue="i1" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {INSTRUCTORS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Difficulty</label>
                  <select name="difficulty" defaultValue="beginner" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Room</label>
                  <input name="room" defaultValue="Studio A" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Date</label>
                  <input name="date" type="date" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Time</label>
                  <select name="time" defaultValue="09:00" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Duration</label>
                  <input name="duration" type="number" defaultValue="60" min="15" max="120" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Max Capacity</label>
                <input name="maxCapacity" type="number" defaultValue="20" min="1" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Description</label>
                <textarea name="description" rows={2} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowCreateClassModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instructor Profile Modal */}
      {showInstructorProfile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2500, padding: '20px' }} onClick={() => setShowInstructorProfile(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '48px' }}>{showInstructorProfile.avatar}</span>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{showInstructorProfile.name}</h2>
                  <div style={{ fontSize: '14px', color: '#f59e0b', marginTop: '4px' }}>★ {showInstructorProfile.rating} rating</div>
                </div>
              </div>
              <button onClick={() => setShowInstructorProfile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>

            <p style={{ fontSize: '14px', color: secondaryText, lineHeight: 1.6, marginBottom: '16px' }}>{showInstructorProfile.bio}</p>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Specialties</h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {showInstructorProfile.specialties.map(s => {
                  const type = getClassType(s);
                  return (
                    <span key={s} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '10px', backgroundColor: type?.color + '20', color: type?.color }}>
                      {type?.icon} {type?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Upcoming Classes</h3>
              {classes.filter(c => c.instructorId === showInstructorProfile.id).map(cls => {
                const classType = getClassType(cls.typeId);
                return (
                  <div key={cls.id} style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{classType?.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{cls.title}</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>{formatTime(cls.time)} | {cls.duration}min | {cls.room}</div>
                    </div>
                    <span style={{ fontSize: '11px', color: isClassFull(cls) ? '#ef4444' : '#22c55e' }}>
                      {getAvailableSpots(cls)} spots
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
