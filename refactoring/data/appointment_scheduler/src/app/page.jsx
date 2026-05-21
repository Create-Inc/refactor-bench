'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const SERVICES = [
  { id: 's1', name: 'Haircut', duration: 30, price: 35, category: 'Hair', color: '#8b5cf6' },
  { id: 's2', name: 'Hair Coloring', duration: 90, price: 120, category: 'Hair', color: '#8b5cf6' },
  { id: 's3', name: 'Beard Trim', duration: 15, price: 15, category: 'Hair', color: '#8b5cf6' },
  { id: 's4', name: 'Facial Treatment', duration: 60, price: 85, category: 'Skin', color: '#ec4899' },
  { id: 's5', name: 'Deep Tissue Massage', duration: 60, price: 95, category: 'Massage', color: '#14b8a6' },
  { id: 's6', name: 'Swedish Massage', duration: 45, price: 75, category: 'Massage', color: '#14b8a6' },
  { id: 's7', name: 'Manicure', duration: 30, price: 40, category: 'Nails', color: '#f97316' },
  { id: 's8', name: 'Pedicure', duration: 45, price: 55, category: 'Nails', color: '#f97316' },
  { id: 's9', name: 'Eyebrow Shaping', duration: 15, price: 20, category: 'Skin', color: '#ec4899' },
  { id: 's10', name: 'Full Body Wrap', duration: 90, price: 130, category: 'Spa', color: '#06b6d4' },
];

const STAFF = [
  { id: 'st1', name: 'Maria Santos', role: 'Senior Stylist', avatar: '👩‍🦰', specialties: ['Hair'], rating: 4.9, reviewCount: 312 },
  { id: 'st2', name: 'James Cooper', role: 'Barber', avatar: '💈', specialties: ['Hair'], rating: 4.7, reviewCount: 198 },
  { id: 'st3', name: 'Lisa Park', role: 'Massage Therapist', avatar: '💆', specialties: ['Massage', 'Spa'], rating: 4.8, reviewCount: 256 },
  { id: 'st4', name: 'Emma Davis', role: 'Aesthetician', avatar: '🧖', specialties: ['Skin', 'Spa'], rating: 4.6, reviewCount: 145 },
  { id: 'st5', name: 'Sophie Chen', role: 'Nail Technician', avatar: '💅', specialties: ['Nails'], rating: 4.9, reviewCount: 278 },
];

const BUSINESS_HOURS = { open: 9, close: 18 };
const TIME_SLOT_INTERVAL = 15;

const INITIAL_APPOINTMENTS = [
  { id: 'a1', clientName: 'Alice Johnson', clientEmail: 'alice@email.com', clientPhone: '555-0101', serviceId: 's1', staffId: 'st1', date: getTodayStr(), startTime: '09:00', status: 'confirmed', notes: 'Regular client, prefers shorter layers', createdAt: Date.now() - 86400000 * 3 },
  { id: 'a2', clientName: 'Bob Williams', clientEmail: 'bob@email.com', clientPhone: '555-0102', serviceId: 's5', staffId: 'st3', date: getTodayStr(), startTime: '10:00', status: 'confirmed', notes: 'Focus on lower back', createdAt: Date.now() - 86400000 * 2 },
  { id: 'a3', clientName: 'Carol Davis', clientEmail: 'carol@email.com', clientPhone: '555-0103', serviceId: 's7', staffId: 'st5', date: getTodayStr(), startTime: '11:00', status: 'pending', notes: '', createdAt: Date.now() - 86400000 },
  { id: 'a4', clientName: 'Dan Smith', clientEmail: 'dan@email.com', clientPhone: '555-0104', serviceId: 's4', staffId: 'st4', date: getTodayStr(), startTime: '14:00', status: 'confirmed', notes: 'Sensitive skin, use gentle products', createdAt: Date.now() - 86400000 * 5 },
  { id: 'a5', clientName: 'Eva Brown', clientEmail: 'eva@email.com', clientPhone: '555-0105', serviceId: 's2', staffId: 'st1', date: getTomorrowStr(), startTime: '10:00', status: 'confirmed', notes: 'Wants balayage highlights', createdAt: Date.now() - 86400000 },
  { id: 'a6', clientName: 'Frank Lee', clientEmail: 'frank@email.com', clientPhone: '555-0106', serviceId: 's6', staffId: 'st3', date: getTomorrowStr(), startTime: '13:00', status: 'pending', notes: '', createdAt: Date.now() - 43200000 },
  { id: 'a7', clientName: 'Grace Kim', clientEmail: 'grace@email.com', clientPhone: '555-0107', serviceId: 's8', staffId: 'st5', date: getDateStr(2), startTime: '15:00', status: 'confirmed', notes: 'Gel pedicure, French tips', createdAt: Date.now() - 86400000 * 2 },
  { id: 'a8', clientName: 'Henry Park', clientEmail: 'henry@email.com', clientPhone: '555-0108', serviceId: 's10', staffId: 'st3', date: getDateStr(3), startTime: '11:00', status: 'confirmed', notes: 'First time client', createdAt: Date.now() - 86400000 },
  { id: 'a9', clientName: 'Ivy Chen', clientEmail: 'ivy@email.com', clientPhone: '555-0109', serviceId: 's3', staffId: 'st2', date: getTodayStr(), startTime: '15:30', status: 'cancelled', notes: 'Cancelled due to illness', createdAt: Date.now() - 86400000 * 4 },
  { id: 'a10', clientName: 'Jack Taylor', clientEmail: 'jack@email.com', clientPhone: '555-0110', serviceId: 's9', staffId: 'st4', date: getTodayStr(), startTime: '16:00', status: 'completed', notes: '', createdAt: Date.now() - 86400000 * 6 },
];

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDateStr(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getEndTime(startTime, durationMinutes) {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

function generateTimeSlots() {
  const slots = [];
  for (let h = BUSINESS_HOURS.open; h < BUSINESS_HOURS.close; h++) {
    for (let m = 0; m < 60; m += TIME_SLOT_INTERVAL) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

function isSlotAvailable(staffId, date, startTime, duration, appointments, excludeId = null) {
  const [sh, sm] = startTime.split(':').map(Number);
  const slotStart = sh * 60 + sm;
  const slotEnd = slotStart + duration;
  return !appointments.some((apt) => {
    if (apt.id === excludeId) return false;
    if (apt.staffId !== staffId || apt.date !== date || apt.status === 'cancelled') return false;
    const service = SERVICES.find((s) => s.id === apt.serviceId);
    if (!service) return false;
    const [ah, am] = apt.startTime.split(':').map(Number);
    const aptStart = ah * 60 + am;
    const aptEnd = aptStart + service.duration;
    return slotStart < aptEnd && slotEnd > aptStart;
  });
}

export default function AppointmentScheduler() {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [activeView, setActiveView] = useState('day');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [showRevenueReport, setShowRevenueReport] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '', serviceId: '', staffId: '', date: getTodayStr(), startTime: '', notes: '',
  });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('schedulerTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
    const savedView = localStorage.getItem('schedulerView');
    if (savedView) setActiveView(savedView);
    const savedAppts = localStorage.getItem('schedulerAppointments');
    if (savedAppts) {
      try { setAppointments(JSON.parse(savedAppts)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('schedulerTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('schedulerView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('schedulerAppointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowBookingModal(false);
        setShowAppointmentDetail(null);
        setShowStaffPanel(false);
        setShowRevenueReport(false);
        setShowNotifications(false);
        setEditingAppointment(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = useCallback((message) => {
    setNotifications((prev) => [{ id: Date.now(), message, read: false, timestamp: Date.now() }, ...prev]);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedStaffFilter !== 'all' && apt.staffId !== selectedStaffFilter) return false;
      if (selectedServiceFilter !== 'all') {
        const service = SERVICES.find((s) => s.id === apt.serviceId);
        if (service && service.category !== selectedServiceFilter) return false;
      }
      if (selectedStatusFilter !== 'all' && apt.status !== selectedStatusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const service = SERVICES.find((s) => s.id === apt.serviceId);
        const staff = STAFF.find((s) => s.id === apt.staffId);
        return (
          apt.clientName.toLowerCase().includes(q) ||
          apt.clientEmail.toLowerCase().includes(q) ||
          (service && service.name.toLowerCase().includes(q)) ||
          (staff && staff.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [appointments, selectedStaffFilter, selectedServiceFilter, selectedStatusFilter, searchQuery]);

  const dayAppointments = useMemo(() => {
    return filteredAppointments.filter((apt) => apt.date === selectedDate);
  }, [filteredAppointments, selectedDate]);

  const weekAppointments = useMemo(() => {
    const startDate = new Date(selectedDate);
    const dayOfWeek = startDate.getDay();
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      weekDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return weekDates.map((date) => ({
      date,
      dayName: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: new Date(date + 'T00:00:00').getDate(),
      appointments: filteredAppointments.filter((apt) => apt.date === date),
    }));
  }, [filteredAppointments, selectedDate]);

  const revenueStats = useMemo(() => {
    const now = new Date();
    const thisMonth = appointments.filter((apt) => {
      const d = new Date(apt.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && apt.status !== 'cancelled';
    });
    const totalRevenue = thisMonth.reduce((sum, apt) => {
      const service = SERVICES.find((s) => s.id === apt.serviceId);
      return sum + (service ? service.price : 0);
    }, 0);
    const byCategory = {};
    thisMonth.forEach((apt) => {
      const service = SERVICES.find((s) => s.id === apt.serviceId);
      if (service) {
        byCategory[service.category] = (byCategory[service.category] || 0) + service.price;
      }
    });
    const byStaff = {};
    thisMonth.forEach((apt) => {
      const staff = STAFF.find((s) => s.id === apt.staffId);
      const service = SERVICES.find((s) => s.id === apt.serviceId);
      if (staff && service) {
        byStaff[staff.name] = (byStaff[staff.name] || 0) + service.price;
      }
    });
    return { totalRevenue, byCategory, byStaff, totalAppointments: thisMonth.length };
  }, [appointments]);

  const handleBookAppointment = useCallback(() => {
    if (!bookingForm.clientName || !bookingForm.serviceId || !bookingForm.staffId || !bookingForm.startTime) return;
    const service = SERVICES.find((s) => s.id === bookingForm.serviceId);
    if (!service) return;
    if (!isSlotAvailable(bookingForm.staffId, bookingForm.date, bookingForm.startTime, service.duration, appointments, editingAppointment?.id)) {
      alert('This time slot is not available. Please choose another time.');
      return;
    }
    if (editingAppointment) {
      setAppointments((prev) => prev.map((apt) => apt.id === editingAppointment.id ? { ...apt, ...bookingForm, status: apt.status } : apt));
      addNotification(`Appointment for ${bookingForm.clientName} updated`);
    } else {
      const newAppt = {
        id: `a${Date.now()}`,
        ...bookingForm,
        status: 'pending',
        createdAt: Date.now(),
      };
      setAppointments((prev) => [...prev, newAppt]);
      addNotification(`New appointment booked for ${bookingForm.clientName}`);
    }
    setShowBookingModal(false);
    setEditingAppointment(null);
    setBookingForm({ clientName: '', clientEmail: '', clientPhone: '', serviceId: '', staffId: '', date: getTodayStr(), startTime: '', notes: '' });
  }, [bookingForm, appointments, editingAppointment, addNotification]);

  const handleStatusChange = useCallback((appointmentId, newStatus) => {
    setAppointments((prev) => prev.map((apt) => apt.id === appointmentId ? { ...apt, status: newStatus } : apt));
    const apt = appointments.find((a) => a.id === appointmentId);
    if (apt) addNotification(`${apt.clientName}'s appointment ${newStatus}`);
  }, [appointments, addNotification]);

  const handleCancelAppointment = useCallback((appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    handleStatusChange(appointmentId, 'cancelled');
    setShowAppointmentDetail(null);
  }, [handleStatusChange]);

  const handleDeleteAppointment = useCallback((appointmentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment?')) return;
    setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
    const apt = appointments.find((a) => a.id === appointmentId);
    if (apt) addNotification(`Appointment for ${apt.clientName} deleted`);
    setShowAppointmentDetail(null);
  }, [appointments, addNotification]);

  const handleEditAppointment = useCallback((appointment) => {
    setEditingAppointment(appointment);
    setBookingForm({
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      serviceId: appointment.serviceId,
      staffId: appointment.staffId,
      date: appointment.date,
      startTime: appointment.startTime,
      notes: appointment.notes,
    });
    setShowAppointmentDetail(null);
    setShowBookingModal(true);
  }, []);

  const navigateDate = useCallback((direction) => {
    const d = new Date(selectedDate);
    if (activeView === 'day') {
      d.setDate(d.getDate() + direction);
    } else if (activeView === 'week') {
      d.setDate(d.getDate() + direction * 7);
    }
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }, [selectedDate, activeView]);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayStr());
    const now = new Date();
    setCalendarMonth(now.getMonth());
    setCalendarYear(now.getFullYear());
  }, []);

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const serviceCategories = useMemo(() => [...new Set(SERVICES.map((s) => s.category))], []);

  const availableStaffForService = useMemo(() => {
    if (!bookingForm.serviceId) return STAFF;
    const service = SERVICES.find((s) => s.id === bookingForm.serviceId);
    if (!service) return STAFF;
    return STAFF.filter((st) => st.specialties.includes(service.category));
  }, [bookingForm.serviceId]);

  const availableSlots = useMemo(() => {
    if (!bookingForm.serviceId || !bookingForm.staffId || !bookingForm.date) return timeSlots;
    const service = SERVICES.find((s) => s.id === bookingForm.serviceId);
    if (!service) return timeSlots;
    return timeSlots.filter((slot) => {
      const [h, m] = slot.split(':').map(Number);
      const endMinutes = h * 60 + m + service.duration;
      if (endMinutes > BUSINESS_HOURS.close * 60) return false;
      return isSlotAvailable(bookingForm.staffId, bookingForm.date, slot, service.duration, appointments, editingAppointment?.id);
    });
  }, [bookingForm.serviceId, bookingForm.staffId, bookingForm.date, appointments, editingAppointment, timeSlots]);

  const bg = isDarkMode ? '#1a1a2e' : '#f8fafc';
  const cardBg = isDarkMode ? '#16213e' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const textSecondary = isDarkMode ? '#94a3b8' : '#64748b';
  const border = isDarkMode ? '#2d3748' : '#e2e8f0';
  const accent = '#6366f1';
  const sidebarBg = isDarkMode ? '#0f172a' : '#1e293b';

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calendarMonth, calendarYear]);

  const navigateCalendar = useCallback((direction) => {
    setCalendarMonth((prev) => {
      let newMonth = prev + direction;
      if (newMonth < 0) { setCalendarYear((y) => y - 1); return 11; }
      if (newMonth > 11) { setCalendarYear((y) => y + 1); return 0; }
      return newMonth;
    });
  }, []);

  const getAppointmentsForCalendarDay = useCallback((day) => {
    if (!day) return [];
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter((apt) => apt.date === dateStr && apt.status !== 'cancelled');
  }, [appointments, calendarMonth, calendarYear]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bg, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? 60 : 240, background: sidebarBg, color: '#e2e8f0', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? '16px 8px' : '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>BookEase</h1>}
          <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: 18 }}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {[
            { key: 'day', label: 'Day View', icon: '📅' },
            { key: 'week', label: 'Week View', icon: '📆' },
            { key: 'list', label: 'List View', icon: '📋' },
            { key: 'calendar', label: 'Calendar', icon: '🗓️' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveView(item.key); setShowStaffPanel(false); setShowRevenueReport(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: sidebarCollapsed ? '10px 0' : '10px 16px',
                background: activeView === item.key && !showStaffPanel && !showRevenueReport ? 'rgba(99,102,241,0.2)' : 'transparent',
                border: 'none', color: activeView === item.key && !showStaffPanel && !showRevenueReport ? '#818cf8' : '#cbd5e1',
                cursor: 'pointer', fontSize: 14, textAlign: sidebarCollapsed ? 'center' : 'left', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', borderRadius: 6,
              }}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 16px' }} />
          <button
            onClick={() => { setShowStaffPanel(true); setShowRevenueReport(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: sidebarCollapsed ? '10px 0' : '10px 16px',
              background: showStaffPanel ? 'rgba(99,102,241,0.2)' : 'transparent',
              border: 'none', color: showStaffPanel ? '#818cf8' : '#cbd5e1', cursor: 'pointer', fontSize: 14,
              textAlign: sidebarCollapsed ? 'center' : 'left', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', borderRadius: 6,
            }}
          >
            <span>👥</span>
            {!sidebarCollapsed && <span>Staff</span>}
          </button>
          <button
            onClick={() => { setShowRevenueReport(true); setShowStaffPanel(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: sidebarCollapsed ? '10px 0' : '10px 16px',
              background: showRevenueReport ? 'rgba(99,102,241,0.2)' : 'transparent',
              border: 'none', color: showRevenueReport ? '#818cf8' : '#cbd5e1', cursor: 'pointer', fontSize: 14,
              textAlign: sidebarCollapsed ? 'center' : 'left', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', borderRadius: 6,
            }}
          >
            <span>💰</span>
            {!sidebarCollapsed && <span>Revenue</span>}
          </button>
        </nav>
        {!sidebarCollapsed && (
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#94a3b8' }}>
            <div>Today's Appointments</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#818cf8' }}>
              {appointments.filter((a) => a.date === getTodayStr() && a.status !== 'cancelled').length}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: cardBg, borderBottom: `1px solid ${border}`, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search clients, services... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, width: 280, fontSize: 14, outline: 'none' }}
            />
            <select aria-label="Filter by staff" value={selectedStaffFilter} onChange={(e) => setSelectedStaffFilter(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14 }}>
              <option value="all">All Staff</option>
              {STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select aria-label="Filter by category" value={selectedServiceFilter} onChange={(e) => setSelectedServiceFilter(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14 }}>
              <option value="all">All Services</option>
              {serviceCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select aria-label="Filter by status" value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14 }}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button aria-label="Toggle theme" onClick={toggleTheme}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div style={{ position: 'relative' }}>
              <button aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', position: 'relative' }}>
                🔔
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, top: 36, width: 320, background: cardBg, border: `1px solid ${border}`, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: 400, overflow: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Notifications</strong>
                    <button onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))} style={{ background: 'none', border: 'none', color: accent, cursor: 'pointer', fontSize: 12 }}>Mark all read</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: textSecondary }}>No notifications</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${border}`, background: n.read ? 'transparent' : (isDarkMode ? 'rgba(99,102,241,0.1)' : '#f0f0ff'), fontSize: 13 }}>
                      {n.message}
                      <div style={{ fontSize: 11, color: textSecondary, marginTop: 4 }}>{new Date(n.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setEditingAppointment(null); setBookingForm({ clientName: '', clientEmail: '', clientPhone: '', serviceId: '', staffId: '', date: selectedDate, startTime: '', notes: '' }); setShowBookingModal(true); }}
              style={{ padding: '8px 16px', background: accent, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              + New Booking
            </button>
          </div>
        </header>

        {/* Sub-header with date navigation */}
        {!showStaffPanel && !showRevenueReport && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', background: cardBg, borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => navigateDate(-1)} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: textColor }}>←</button>
              <button onClick={goToToday} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: textColor, fontSize: 13 }}>Today</button>
              <button onClick={() => navigateDate(1)} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: textColor }}>→</button>
              <h2 style={{ margin: 0, fontSize: 18, marginLeft: 8 }}>
                {activeView === 'week'
                  ? (() => {
                      const d = new Date(selectedDate);
                      const dayOfWeek = d.getDay();
                      const weekStart = new Date(d);
                      weekStart.setDate(d.getDate() - dayOfWeek);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                    })()
                  : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['day', 'week', 'list', 'calendar'].map((v) => (
                <button key={v} onClick={() => setActiveView(v)}
                  style={{ padding: '6px 12px', background: activeView === v ? accent : 'transparent', color: activeView === v ? 'white' : textColor, border: `1px solid ${activeView === v ? accent : border}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, textTransform: 'capitalize' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {showStaffPanel ? (
            /* Staff Panel */
            <div>
              <h2 style={{ margin: '0 0 20px 0' }}>Staff Members</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {STAFF.map((member) => {
                  const memberAppts = appointments.filter((a) => a.staffId === member.id && a.status !== 'cancelled');
                  const todayAppts = memberAppts.filter((a) => a.date === getTodayStr());
                  const totalRevenue = memberAppts.reduce((sum, a) => {
                    const svc = SERVICES.find((s) => s.id === a.serviceId);
                    return sum + (svc ? svc.price : 0);
                  }, 0);
                  return (
                    <div key={member.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: 32 }}>{member.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>{member.name}</div>
                          <div style={{ color: textSecondary, fontSize: 13 }}>{member.role}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        {member.specialties.map((spec) => (
                          <span key={spec} style={{ padding: '2px 8px', background: isDarkMode ? '#2d3748' : '#f1f5f9', borderRadius: 12, fontSize: 12 }}>{spec}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: textSecondary }}>
                        <span>⭐ {member.rating} ({member.reviewCount})</span>
                        <span>Today: {todayAppts.length}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: textSecondary, marginTop: 8 }}>
                        <span>Total Appointments: {memberAppts.length}</span>
                        <span>Revenue: ${totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : showRevenueReport ? (
            /* Revenue Report */
            <div>
              <h2 style={{ margin: '0 0 20px 0' }}>Revenue Report</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: textSecondary }}>Total Revenue (This Month)</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>${revenueStats.totalRevenue.toFixed(2)}</div>
                </div>
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: textSecondary }}>Total Appointments</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: accent }}>{revenueStats.totalAppointments}</div>
                </div>
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: textSecondary }}>Avg per Appointment</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                    ${revenueStats.totalAppointments > 0 ? (revenueStats.totalRevenue / revenueStats.totalAppointments).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                  <h3 style={{ margin: '0 0 16px 0' }}>Revenue by Category</h3>
                  {Object.entries(revenueStats.byCategory).map(([cat, rev]) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                      <span>{cat}</span>
                      <span style={{ fontWeight: 600 }}>${rev.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                  <h3 style={{ margin: '0 0 16px 0' }}>Revenue by Staff</h3>
                  {Object.entries(revenueStats.byStaff).map(([name, rev]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                      <span>{name}</span>
                      <span style={{ fontWeight: 600 }}>${rev.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeView === 'day' ? (
            /* Day View - Time grid */
            <div style={{ position: 'relative' }}>
              {timeSlots.map((slot) => {
                const slotAppts = dayAppointments.filter((apt) => apt.startTime === slot);
                return (
                  <div key={slot} style={{ display: 'flex', minHeight: 48, borderBottom: `1px solid ${border}` }}>
                    <div style={{ width: 80, padding: '8px 12px', fontSize: 12, color: textSecondary, flexShrink: 0, textAlign: 'right' }}>
                      {slot.endsWith(':00') ? formatTime(slot) : ''}
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: 8, padding: '4px 8px', flexWrap: 'wrap' }}>
                      {slotAppts.map((apt) => {
                        const service = SERVICES.find((s) => s.id === apt.serviceId);
                        const staff = STAFF.find((s) => s.id === apt.staffId);
                        return (
                          <button
                            key={apt.id}
                            onClick={() => setShowAppointmentDetail(apt)}
                            style={{
                              padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                              background: apt.status === 'cancelled' ? '#94a3b8' : (service?.color || accent),
                              color: 'white', fontSize: 12, textAlign: 'left', flex: '1 1 200px', maxWidth: 300,
                              opacity: apt.status === 'cancelled' ? 0.5 : 1,
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{apt.clientName}</div>
                            <div>{service?.name} • {staff?.name}</div>
                            <div>{formatTime(apt.startTime)} - {formatTime(getEndTime(apt.startTime, service?.duration || 30))}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeView === 'week' ? (
            /* Week View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {weekAppointments.map((day) => (
                <div key={day.date} style={{
                  background: cardBg, border: `1px solid ${day.date === getTodayStr() ? accent : border}`, borderRadius: 8, minHeight: 200,
                }}>
                  <div style={{
                    padding: '8px 12px', borderBottom: `1px solid ${border}`, textAlign: 'center',
                    background: day.date === getTodayStr() ? accent : 'transparent', color: day.date === getTodayStr() ? 'white' : textColor,
                    borderRadius: day.date === getTodayStr() ? '8px 8px 0 0' : 0,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{day.dayName}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{day.dayNum}</div>
                  </div>
                  <div style={{ padding: 8 }}>
                    {day.appointments.filter((a) => a.status !== 'cancelled').map((apt) => {
                      const service = SERVICES.find((s) => s.id === apt.serviceId);
                      return (
                        <button
                          key={apt.id}
                          onClick={() => setShowAppointmentDetail(apt)}
                          style={{
                            display: 'block', width: '100%', padding: '4px 8px', marginBottom: 4, borderRadius: 4,
                            background: service?.color || accent, color: 'white', border: 'none', cursor: 'pointer',
                            fontSize: 11, textAlign: 'left',
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{formatTime(apt.startTime)}</div>
                          <div>{apt.clientName}</div>
                        </button>
                      );
                    })}
                    {day.appointments.filter((a) => a.status !== 'cancelled').length === 0 && (
                      <div style={{ fontSize: 12, color: textSecondary, textAlign: 'center', padding: 16 }}>No appointments</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : activeView === 'list' ? (
            /* List View */
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${border}` }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: textSecondary }}>Client</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: textSecondary }}>Service</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: textSecondary }}>Staff</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: textSecondary }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: textSecondary }}>Time</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: textSecondary }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: textSecondary }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => {
                    const service = SERVICES.find((s) => s.id === apt.serviceId);
                    const staff = STAFF.find((s) => s.id === apt.staffId);
                    const statusColors = { pending: '#f59e0b', confirmed: '#22c55e', completed: '#6366f1', cancelled: '#94a3b8' };
                    return (
                      <tr key={apt.id} onClick={() => setShowAppointmentDetail(apt)} style={{ borderBottom: `1px solid ${border}`, cursor: 'pointer' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{apt.clientName}</div>
                          <div style={{ fontSize: 12, color: textSecondary }}>{apt.clientEmail}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{service?.name}</td>
                        <td style={{ padding: '12px 16px' }}>{staff?.name}</td>
                        <td style={{ padding: '12px 16px' }}>{new Date(apt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td style={{ padding: '12px 16px' }}>{formatTime(apt.startTime)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: `${statusColors[apt.status]}20`, color: statusColors[apt.status] }}>
                            {apt.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>${service?.price.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAppointments.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: textSecondary }}>No appointments found</div>
              )}
            </div>
          ) : activeView === 'calendar' ? (
            /* Calendar View */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button onClick={() => navigateCalendar(-1)} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 4, padding: '4px 12px', cursor: 'pointer', color: textColor }}>←</button>
                <h2 style={{ margin: 0 }}>
                  {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => navigateCalendar(1)} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 4, padding: '4px 12px', cursor: 'pointer', color: textColor }}>→</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: border }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} style={{ padding: 12, textAlign: 'center', fontWeight: 600, fontSize: 13, background: cardBg }}>{d}</div>
                ))}
                {calendarDays.map((day, idx) => {
                  const dayAppts = getAppointmentsForCalendarDay(day);
                  const dateStr = day ? `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                  const isToday = dateStr === getTodayStr();
                  return (
                    <div
                      key={idx}
                      onClick={() => { if (day) { setSelectedDate(dateStr); setActiveView('day'); } }}
                      style={{
                        padding: 8, minHeight: 90, background: cardBg, cursor: day ? 'pointer' : 'default',
                        border: isToday ? `2px solid ${accent}` : 'none',
                      }}
                    >
                      {day && (
                        <>
                          <div style={{ fontSize: 14, fontWeight: isToday ? 700 : 400, color: isToday ? accent : textColor, marginBottom: 4 }}>{day}</div>
                          {dayAppts.slice(0, 3).map((apt) => {
                            const service = SERVICES.find((s) => s.id === apt.serviceId);
                            return (
                              <div key={apt.id} style={{
                                fontSize: 10, padding: '2px 4px', marginBottom: 2, borderRadius: 3,
                                background: service?.color || accent, color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                              }}>
                                {formatTime(apt.startTime)} {apt.clientName}
                              </div>
                            );
                          })}
                          {dayAppts.length > 3 && (
                            <div style={{ fontSize: 10, color: textSecondary }}>+{dayAppts.length - 3} more</div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowBookingModal(false); setEditingAppointment(null); } }}>
          <div style={{ background: cardBg, borderRadius: 12, padding: 24, width: 480, maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>{editingAppointment ? 'Edit Appointment' : 'New Booking'}</h2>
              <button onClick={() => { setShowBookingModal(false); setEditingAppointment(null); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: textColor }}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleBookAppointment(); }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Client Name *</label>
                <input name="clientName" value={bookingForm.clientName} onChange={(e) => setBookingForm((f) => ({ ...f, clientName: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Email</label>
                  <input name="clientEmail" value={bookingForm.clientEmail} onChange={(e) => setBookingForm((f) => ({ ...f, clientEmail: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Phone</label>
                  <input name="clientPhone" value={bookingForm.clientPhone} onChange={(e) => setBookingForm((f) => ({ ...f, clientPhone: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Service *</label>
                <select name="serviceId" value={bookingForm.serviceId} onChange={(e) => setBookingForm((f) => ({ ...f, serviceId: e.target.value, staffId: '', startTime: '' }))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14 }}>
                  <option value="">Select a service</option>
                  {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.duration} min) — ${s.price}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Staff *</label>
                <select name="staffId" value={bookingForm.staffId} onChange={(e) => setBookingForm((f) => ({ ...f, staffId: e.target.value, startTime: '' }))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14 }}>
                  <option value="">Select staff</option>
                  {availableStaffForService.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Date *</label>
                  <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value, startTime: '' }))}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Time *</label>
                  <select name="startTime" value={bookingForm.startTime} onChange={(e) => setBookingForm((f) => ({ ...f, startTime: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14 }}>
                    <option value="">Select time</option>
                    {availableSlots.map((slot) => <option key={slot} value={slot}>{formatTime(slot)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Notes</label>
                <textarea value={bookingForm.notes} onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${border}`, borderRadius: 6, background: bg, color: textColor, fontSize: 14, resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowBookingModal(false); setEditingAppointment(null); }}
                  style={{ padding: '8px 16px', border: `1px solid ${border}`, borderRadius: 6, background: 'transparent', color: textColor, cursor: 'pointer' }}>Cancel</button>
                <button type="submit"
                  style={{ padding: '8px 16px', background: accent, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                  {editingAppointment ? 'Update' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showAppointmentDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAppointmentDetail(null); }}>
          <div style={{ background: cardBg, borderRadius: 12, padding: 24, width: 440, maxHeight: '80vh', overflow: 'auto' }}>
            {(() => {
              const apt = showAppointmentDetail;
              const service = SERVICES.find((s) => s.id === apt.serviceId);
              const staff = STAFF.find((s) => s.id === apt.staffId);
              const statusColors = { pending: '#f59e0b', confirmed: '#22c55e', completed: '#6366f1', cancelled: '#94a3b8' };
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <h2 style={{ margin: 0 }}>{apt.clientName}</h2>
                      <div style={{ color: textSecondary, fontSize: 13, marginTop: 4 }}>{apt.clientEmail} • {apt.clientPhone}</div>
                    </div>
                    <button onClick={() => setShowAppointmentDetail(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: textColor }}>×</button>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: `${statusColors[apt.status]}20`, color: statusColors[apt.status] }}>
                      {apt.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>Service</div>
                      <div style={{ fontWeight: 600 }}>{service?.name}</div>
                      <div style={{ fontSize: 13, color: textSecondary }}>{service?.duration} min • ${service?.price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>Staff</div>
                      <div style={{ fontWeight: 600 }}>{staff?.avatar} {staff?.name}</div>
                      <div style={{ fontSize: 13, color: textSecondary }}>{staff?.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>Date</div>
                      <div style={{ fontWeight: 600 }}>{new Date(apt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>Time</div>
                      <div style={{ fontWeight: 600 }}>{formatTime(apt.startTime)} – {formatTime(getEndTime(apt.startTime, service?.duration || 30))}</div>
                    </div>
                  </div>
                  {apt.notes && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>Notes</div>
                      <div style={{ padding: 12, background: bg, borderRadius: 6, fontSize: 14 }}>{apt.notes}</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    {apt.status === 'pending' && (
                      <button onClick={() => { handleStatusChange(apt.id, 'confirmed'); setShowAppointmentDetail({ ...apt, status: 'confirmed' }); }}
                        style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
                    )}
                    {(apt.status === 'confirmed' || apt.status === 'pending') && (
                      <button onClick={() => { handleStatusChange(apt.id, 'completed'); setShowAppointmentDetail({ ...apt, status: 'completed' }); }}
                        style={{ padding: '8px 16px', background: accent, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Complete</button>
                    )}
                    <button onClick={() => handleEditAppointment(apt)}
                      style={{ padding: '8px 16px', border: `1px solid ${border}`, borderRadius: 6, background: 'transparent', color: textColor, cursor: 'pointer' }}>Edit</button>
                    {apt.status !== 'cancelled' && (
                      <button onClick={() => handleCancelAppointment(apt.id)}
                        style={{ padding: '8px 16px', border: '1px solid #ef4444', borderRadius: 6, background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>Cancel</button>
                    )}
                    <button onClick={() => handleDeleteAppointment(apt.id)}
                      style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
