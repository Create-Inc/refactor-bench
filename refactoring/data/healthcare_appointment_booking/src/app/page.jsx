import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  StyleSheet,
  Animated,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const SPECIALTIES = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Ophthalmology',
  'Psychiatry',
];

const DOCTORS = [
  {
    id: 'd1',
    name: 'Dr. Sarah Chen',
    specialty: 'General Practice',
    avatar: '👩‍⚕️',
    rating: 4.8,
    reviewCount: 234,
    experience: 12,
    hospital: 'City Medical Center',
    bio: 'Board-certified family medicine physician with focus on preventive care.',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultationFee: 75,
    languages: ['English', 'Mandarin'],
    education: 'Harvard Medical School',
    insuranceAccepted: ['BlueCross', 'Aetna', 'United'],
  },
  {
    id: 'd2',
    name: 'Dr. Michael Reeves',
    specialty: 'Cardiology',
    avatar: '👨‍⚕️',
    rating: 4.9,
    reviewCount: 189,
    experience: 18,
    hospital: 'Heart & Vascular Institute',
    bio: 'Interventional cardiologist specializing in minimally invasive procedures.',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    consultationFee: 150,
    languages: ['English', 'Spanish'],
    education: 'Johns Hopkins University',
    insuranceAccepted: ['BlueCross', 'Cigna', 'United'],
  },
  {
    id: 'd3',
    name: 'Dr. Priya Patel',
    specialty: 'Dermatology',
    avatar: '👩‍⚕️',
    rating: 4.7,
    reviewCount: 312,
    experience: 10,
    hospital: 'SkinCare Clinic',
    bio: 'Dermatologist specializing in both medical and cosmetic dermatology.',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    consultationFee: 120,
    languages: ['English', 'Hindi', 'Gujarati'],
    education: 'Stanford University',
    insuranceAccepted: ['Aetna', 'Cigna', 'Humana'],
  },
  {
    id: 'd4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    avatar: '👨‍⚕️',
    rating: 4.6,
    reviewCount: 156,
    experience: 15,
    hospital: 'Joint & Spine Center',
    bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement.',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    consultationFee: 130,
    languages: ['English'],
    education: 'Yale School of Medicine',
    insuranceAccepted: ['BlueCross', 'United', 'Humana'],
  },
  {
    id: 'd5',
    name: 'Dr. Emily Nakamura',
    specialty: 'Pediatrics',
    avatar: '👩‍⚕️',
    rating: 4.9,
    reviewCount: 421,
    experience: 8,
    hospital: "Children's Medical Center",
    bio: 'Pediatrician passionate about childhood development and preventive care.',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultationFee: 85,
    languages: ['English', 'Japanese'],
    education: 'UCSF School of Medicine',
    insuranceAccepted: ['BlueCross', 'Aetna', 'Cigna', 'United'],
  },
  {
    id: 'd6',
    name: 'Dr. Robert Kim',
    specialty: 'Neurology',
    avatar: '👨‍⚕️',
    rating: 4.8,
    reviewCount: 198,
    experience: 20,
    hospital: 'Neuro Sciences Institute',
    bio: 'Neurologist with expertise in movement disorders and neurodegenerative diseases.',
    availableDays: ['Monday', 'Wednesday', 'Thursday'],
    consultationFee: 175,
    languages: ['English', 'Korean'],
    education: 'Columbia University',
    insuranceAccepted: ['BlueCross', 'Aetna', 'United'],
  },
  {
    id: 'd7',
    name: 'Dr. Lisa Thompson',
    specialty: 'Ophthalmology',
    avatar: '👩‍⚕️',
    rating: 4.7,
    reviewCount: 267,
    experience: 14,
    hospital: 'Vision Care Center',
    bio: 'Ophthalmologist specializing in cataract surgery and glaucoma management.',
    availableDays: ['Tuesday', 'Wednesday', 'Friday'],
    consultationFee: 140,
    languages: ['English', 'French'],
    education: 'University of Michigan',
    insuranceAccepted: ['Cigna', 'Humana', 'United'],
  },
  {
    id: 'd8',
    name: 'Dr. Ahmed Hassan',
    specialty: 'Psychiatry',
    avatar: '👨‍⚕️',
    rating: 4.8,
    reviewCount: 143,
    experience: 11,
    hospital: 'Behavioral Health Center',
    bio: 'Psychiatrist with focus on anxiety, depression, and cognitive behavioral therapy.',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    consultationFee: 160,
    languages: ['English', 'Arabic'],
    education: 'University of Pennsylvania',
    insuranceAccepted: ['BlueCross', 'Aetna', 'Cigna'],
  },
];

const TIME_SLOTS = [
  '8:00 AM',
  '8:30 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
];

const INITIAL_APPOINTMENTS = [
  {
    id: 'a1',
    doctorId: 'd1',
    date: '2025-02-10',
    time: '9:00 AM',
    reason: 'Annual physical exam',
    status: 'completed',
    notes: 'All vitals normal. Follow-up in 12 months.',
    prescriptions: [
      { id: 'rx1', name: 'Vitamin D3', dosage: '2000 IU daily', duration: '90 days' },
    ],
  },
  {
    id: 'a2',
    doctorId: 'd2',
    date: '2025-03-15',
    time: '10:30 AM',
    reason: 'Heart palpitations follow-up',
    status: 'completed',
    notes: 'ECG normal. Continue monitoring. Reduce caffeine intake.',
    prescriptions: [],
  },
  {
    id: 'a3',
    doctorId: 'd5',
    date: '2025-04-20',
    time: '2:00 PM',
    reason: 'Child wellness check - 6 month',
    status: 'upcoming',
    notes: '',
    prescriptions: [],
  },
  {
    id: 'a4',
    doctorId: 'd3',
    date: '2025-04-25',
    time: '11:00 AM',
    reason: 'Skin rash evaluation',
    status: 'upcoming',
    notes: '',
    prescriptions: [],
  },
  {
    id: 'a5',
    doctorId: 'd6',
    date: '2025-01-05',
    time: '3:00 PM',
    reason: 'Migraine consultation',
    status: 'completed',
    notes: 'Prescribed preventive medication. Track triggers in headache diary.',
    prescriptions: [
      { id: 'rx2', name: 'Sumatriptan', dosage: '50mg as needed', duration: '30 days' },
      { id: 'rx3', name: 'Topiramate', dosage: '25mg daily', duration: '90 days' },
    ],
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'reminder',
    title: 'Upcoming Appointment',
    message: 'Appointment with Dr. Emily Nakamura tomorrow at 2:00 PM',
    timestamp: Date.now() - 3600000,
    read: false,
    appointmentId: 'a3',
  },
  {
    id: 'n2',
    type: 'prescription',
    title: 'Prescription Refill',
    message: 'Your Vitamin D3 prescription expires in 5 days',
    timestamp: Date.now() - 86400000,
    read: false,
    prescriptionId: 'rx1',
  },
  {
    id: 'n3',
    type: 'result',
    title: 'Lab Results Available',
    message: 'Your blood work results from Dr. Sarah Chen are ready',
    timestamp: Date.now() - 172800000,
    read: true,
    appointmentId: 'a1',
  },
  {
    id: 'n4',
    type: 'reminder',
    title: 'Upcoming Appointment',
    message: 'Appointment with Dr. Priya Patel in 5 days',
    timestamp: Date.now() - 7200000,
    read: false,
    appointmentId: 'a4',
  },
];

const PATIENT_PROFILE = {
  id: 'p1',
  name: 'Alex Johnson',
  dateOfBirth: '1990-06-15',
  gender: 'Male',
  phone: '(555) 123-4567',
  email: 'alex.johnson@email.com',
  insurance: 'BlueCross BlueShield',
  memberId: 'BCB-98765432',
  bloodType: 'O+',
  allergies: ['Penicillin', 'Shellfish'],
  conditions: ['Mild hypertension', 'Seasonal allergies'],
  emergencyContact: { name: 'Maria Johnson', phone: '(555) 987-6543', relationship: 'Spouse' },
};

const MEDICAL_HISTORY = [
  { id: 'mh1', date: '2024-12-10', type: 'Lab Work', description: 'Complete blood count', provider: 'City Medical Lab', result: 'Normal' },
  { id: 'mh2', date: '2024-11-05', type: 'Imaging', description: 'Chest X-ray', provider: 'City Medical Center', result: 'Clear' },
  { id: 'mh3', date: '2024-08-20', type: 'Procedure', description: 'Flu vaccination', provider: 'City Medical Center', result: 'Completed' },
  { id: 'mh4', date: '2024-06-15', type: 'Lab Work', description: 'Lipid panel', provider: 'City Medical Lab', result: 'Borderline high cholesterol' },
  { id: 'mh5', date: '2024-03-10', type: 'Consultation', description: 'Sleep study', provider: 'Sleep Center', result: 'Mild sleep apnea' },
];

// ─── Helper Functions ───────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

const generateDates = (days) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      dateStr: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return dates;
};

const getAvailableSlots = (doctor, dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  if (!doctor.availableDays.includes(dayName)) return [];
  // Simulate some slots being taken
  const hash = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TIME_SLOTS.filter((_, i) => (hash + i) % 3 !== 0);
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function HealthcareApp() {
  // ─── Navigation State ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubView, setActiveSubView] = useState(null);

  // ─── Data State ───────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [favorites, setFavorites] = useState(['d1', 'd5']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);

  // ─── Booking State ────────────────────────────────────────────────────────
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingReason, setBookingReason] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  // ─── Profile Edit State ───────────────────────────────────────────────────
  const [profile, setProfile] = useState(PATIENT_PROFILE);
  const [editPhone, setEditPhone] = useState(PATIENT_PROFILE.phone);
  const [editEmail, setEditEmail] = useState(PATIENT_PROFILE.email);
  const [editEmergencyName, setEditEmergencyName] = useState(PATIENT_PROFILE.emergencyContact.name);
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(PATIENT_PROFILE.emergencyContact.phone);

  // ─── Settings State ───────────────────────────────────────────────────────
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHours, setReminderHours] = useState('24');
  const [darkMode, setDarkMode] = useState(false);

  // ─── Animation refs ───────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ─── Persistence ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedAppointments = await AsyncStorage.getItem('hc_appointments');
        if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
        const savedFavorites = await AsyncStorage.getItem('hc_favorites');
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        const savedProfile = await AsyncStorage.getItem('hc_profile');
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        const savedNotifications = await AsyncStorage.getItem('hc_notifications');
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
        const savedDarkMode = await AsyncStorage.getItem('hc_darkMode');
        if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
        const savedReminder = await AsyncStorage.getItem('hc_reminderEnabled');
        if (savedReminder !== null) setReminderEnabled(JSON.parse(savedReminder));
      } catch (e) {
        // Gracefully handle corrupted storage
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('hc_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    AsyncStorage.setItem('hc_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    AsyncStorage.setItem('hc_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    AsyncStorage.setItem('hc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    AsyncStorage.setItem('hc_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    AsyncStorage.setItem('hc_reminderEnabled', JSON.stringify(reminderEnabled));
  }, [reminderEnabled]);

  // ─── Computed Values ──────────────────────────────────────────────────────
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date)),
    [appointments]
  );

  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date)),
    [appointments]
  );

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredDoctors = useMemo(() => {
    let result = [...DOCTORS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q) ||
          d.languages.some((l) => l.toLowerCase().includes(q))
      );
    }
    if (selectedSpecialty !== 'All') {
      result = result.filter((d) => d.specialty === selectedSpecialty);
    }
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      result.sort((a, b) => b.experience - a.experience);
    } else if (sortBy === 'fee') {
      result.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [searchQuery, selectedSpecialty, sortBy]);

  const allPrescriptions = useMemo(() => {
    const rxList = [];
    appointments.forEach((apt) => {
      apt.prescriptions.forEach((rx) => {
        const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
        rxList.push({ ...rx, doctorName: doctor?.name || 'Unknown', appointmentDate: apt.date });
      });
    });
    return rxList;
  }, [appointments]);

  const availableDates = useMemo(() => generateDates(14), []);

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !bookingDate) return [];
    return getAvailableSlots(selectedDoctor, bookingDate);
  }, [selectedDoctor, bookingDate]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback(
    (doctorId) => {
      setFavorites((prev) =>
        prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId]
      );
    },
    []
  );

  const openDoctorProfile = useCallback((doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  }, []);

  const startBooking = useCallback((doctor) => {
    setSelectedDoctor(doctor);
    setBookingDate(null);
    setBookingTime(null);
    setBookingReason('');
    setBookingNotes('');
    setShowDoctorModal(false);
    setShowBookingModal(true);
  }, []);

  const confirmBooking = useCallback(() => {
    if (!selectedDoctor || !bookingDate || !bookingTime || !bookingReason.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    const newAppointment = {
      id: `a${Date.now()}`,
      doctorId: selectedDoctor.id,
      date: bookingDate,
      time: bookingTime,
      reason: bookingReason.trim(),
      status: 'upcoming',
      notes: bookingNotes.trim(),
      prescriptions: [],
    };
    setAppointments((prev) => [...prev, newAppointment]);
    setNotifications((prev) => [
      {
        id: `n${Date.now()}`,
        type: 'confirmation',
        title: 'Appointment Confirmed',
        message: `Appointment with ${selectedDoctor.name} on ${formatDate(bookingDate)} at ${bookingTime}`,
        timestamp: Date.now(),
        read: false,
        appointmentId: newAppointment.id,
      },
      ...prev,
    ]);
    setShowBookingModal(false);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setActiveTab('appointments');
  }, [selectedDoctor, bookingDate, bookingTime, bookingReason, bookingNotes, fadeAnim]);

  const cancelAppointment = useCallback(
    (appointmentId) => {
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
      setShowCancelConfirm(null);
      setShowAppointmentDetail(null);
      setNotifications((prev) => [
        {
          id: `n${Date.now()}`,
          type: 'cancellation',
          title: 'Appointment Cancelled',
          message: 'Your appointment has been cancelled successfully.',
          timestamp: Date.now(),
          read: false,
          appointmentId,
        },
        ...prev,
      ]);
    },
    []
  );

  const markNotificationRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const saveProfileChanges = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      phone: editPhone,
      email: editEmail,
      emergencyContact: {
        ...prev.emergencyContact,
        name: editEmergencyName,
        phone: editEmergencyPhone,
      },
    }));
    setShowEditProfile(false);
  }, [editPhone, editEmail, editEmergencyName, editEmergencyPhone]);

  const handleTabChange = useCallback(
    (tab) => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
        setActiveTab(tab);
        setActiveSubView(null);
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    },
    [fadeAnim]
  );

  // ─── Theme ────────────────────────────────────────────────────────────────
  const theme = useMemo(
    () => ({
      bg: darkMode ? '#1a1a2e' : '#f8f9fa',
      card: darkMode ? '#16213e' : '#ffffff',
      text: darkMode ? '#e0e0e0' : '#333333',
      textSecondary: darkMode ? '#a0a0a0' : '#666666',
      primary: '#4A90D9',
      accent: '#34C759',
      danger: '#FF3B30',
      warning: '#FF9500',
      border: darkMode ? '#2a2a4a' : '#e8e8e8',
      tabBar: darkMode ? '#0f0f23' : '#ffffff',
      inputBg: darkMode ? '#1e1e3a' : '#f0f0f0',
    }),
    [darkMode]
  );

  // ─── Render: Home Tab ─────────────────────────────────────────────────────
  const renderHomeTab = () => (
    <ScrollView style={[styles.content, { backgroundColor: theme.bg }]} testID="home-tab">
      {/* Welcome Header */}
      <View style={[styles.welcomeCard, { backgroundColor: theme.primary }]}>
        <Text style={styles.welcomeName}>Hello, {profile.name} 👋</Text>
        <Text style={styles.welcomeSubtitle}>
          {upcomingAppointments.length > 0
            ? `You have ${upcomingAppointments.length} upcoming appointment${upcomingAppointments.length > 1 ? 's' : ''}`
            : 'No upcoming appointments'}
        </Text>
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: theme.card }]}
          onPress={() => handleTabChange('doctors')}
          testID="quick-find-doctor"
        >
          <Text style={styles.quickActionIcon}>🔍</Text>
          <Text style={[styles.quickActionLabel, { color: theme.text }]}>Find Doctor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: theme.card }]}
          onPress={() => handleTabChange('appointments')}
          testID="quick-appointments"
        >
          <Text style={styles.quickActionIcon}>📅</Text>
          <Text style={[styles.quickActionLabel, { color: theme.text }]}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: theme.card }]}
          onPress={() => {
            handleTabChange('profile');
            setActiveSubView('prescriptions');
          }}
          testID="quick-prescriptions"
        >
          <Text style={styles.quickActionIcon}>💊</Text>
          <Text style={[styles.quickActionLabel, { color: theme.text }]}>Prescriptions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: theme.card }]}
          onPress={() => {
            handleTabChange('profile');
            setActiveSubView('history');
          }}
          testID="quick-history"
        >
          <Text style={styles.quickActionIcon}>📋</Text>
          <Text style={[styles.quickActionLabel, { color: theme.text }]}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Next Appointment */}
      {upcomingAppointments.length > 0 && (
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Next Appointment</Text>
          {(() => {
            const next = upcomingAppointments[0];
            const doctor = DOCTORS.find((d) => d.id === next.doctorId);
            const daysUntil = getDaysUntil(next.date);
            return (
              <TouchableOpacity
                style={[styles.nextAppointmentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => setShowAppointmentDetail(next)}
                testID="next-appointment-card"
              >
                <View style={styles.nextAptHeader}>
                  <Text style={styles.nextAptAvatar}>{doctor?.avatar}</Text>
                  <View style={styles.nextAptInfo}>
                    <Text style={[styles.nextAptDoctor, { color: theme.text }]}>{doctor?.name}</Text>
                    <Text style={[styles.nextAptSpecialty, { color: theme.textSecondary }]}>{doctor?.specialty}</Text>
                  </View>
                  <View style={[styles.daysUntilBadge, { backgroundColor: daysUntil <= 3 ? theme.warning : theme.primary }]}>
                    <Text style={styles.daysUntilText}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                    </Text>
                  </View>
                </View>
                <View style={styles.nextAptDetails}>
                  <Text style={[styles.nextAptDate, { color: theme.textSecondary }]}>📅 {formatDate(next.date)}</Text>
                  <Text style={[styles.nextAptTime, { color: theme.textSecondary }]}>🕐 {next.time}</Text>
                </View>
                <Text style={[styles.nextAptReason, { color: theme.text }]}>📝 {next.reason}</Text>
              </TouchableOpacity>
            );
          })()}
        </View>
      )}

      {/* Favorite Doctors */}
      {favorites.length > 0 && (
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Favorite Doctors</Text>
          {DOCTORS.filter((d) => favorites.includes(d.id)).map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={[styles.favDoctorCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => openDoctorProfile(doctor)}
              testID={`fav-doctor-${doctor.id}`}
            >
              <Text style={styles.favDoctorAvatar}>{doctor.avatar}</Text>
              <View style={styles.favDoctorInfo}>
                <Text style={[styles.favDoctorName, { color: theme.text }]}>{doctor.name}</Text>
                <Text style={[styles.favDoctorSpecialty, { color: theme.textSecondary }]}>{doctor.specialty}</Text>
              </View>
              <TouchableOpacity onPress={() => startBooking(doctor)} testID={`book-fav-${doctor.id}`}>
                <Text style={[styles.bookBtn, { color: theme.primary }]}>Book</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent Notifications */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Notifications</Text>
      {notifications.slice(0, 3).map((notif) => (
        <TouchableOpacity
          key={notif.id}
          style={[styles.notifCard, { backgroundColor: theme.card, borderColor: theme.border, opacity: notif.read ? 0.6 : 1 }]}
          onPress={() => markNotificationRead(notif.id)}
          testID={`notif-${notif.id}`}
        >
          <Text style={styles.notifIcon}>
            {notif.type === 'reminder' ? '⏰' : notif.type === 'prescription' ? '💊' : notif.type === 'result' ? '📊' : notif.type === 'confirmation' ? '✅' : '❌'}
          </Text>
          <View style={styles.notifContent}>
            <Text style={[styles.notifTitle, { color: theme.text }]}>{notif.title}</Text>
            <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>{notif.message}</Text>
          </View>
          {!notif.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ─── Render: Doctors Tab ──────────────────────────────────────────────────
  const renderDoctorsTab = () => (
    <View style={[styles.content, { backgroundColor: theme.bg }]} testID="doctors-tab">
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: theme.inputBg }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search doctors, specialties, hospitals..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="doctor-search-input"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} testID="clear-search">
            <Text style={{ color: theme.textSecondary }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Specialty Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll}>
        <TouchableOpacity
          style={[styles.specialtyChip, selectedSpecialty === 'All' && { backgroundColor: theme.primary }]}
          onPress={() => setSelectedSpecialty('All')}
          testID="specialty-all"
        >
          <Text style={[styles.specialtyChipText, selectedSpecialty === 'All' && { color: '#fff' }]}>All</Text>
        </TouchableOpacity>
        {SPECIALTIES.map((spec) => (
          <TouchableOpacity
            key={spec}
            style={[styles.specialtyChip, selectedSpecialty === spec && { backgroundColor: theme.primary }, { borderColor: theme.border }]}
            onPress={() => setSelectedSpecialty(spec)}
            testID={`specialty-${spec.toLowerCase().replace(/\s/g, '-')}`}
          >
            <Text style={[styles.specialtyChipText, selectedSpecialty === spec && { color: '#fff' }, { color: selectedSpecialty === spec ? '#fff' : theme.text }]}>
              {spec}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortRow}>
        <Text style={[styles.resultCount, { color: theme.textSecondary }]}>{filteredDoctors.length} doctors</Text>
        <View style={styles.sortOptions}>
          {['rating', 'experience', 'fee', 'name'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortChip, sortBy === option && { backgroundColor: theme.primary + '20' }]}
              onPress={() => setSortBy(option)}
              testID={`sort-${option}`}
            >
              <Text style={[styles.sortChipText, { color: sortBy === option ? theme.primary : theme.textSecondary }]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Doctor List */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: doctor }) => (
          <TouchableOpacity
            style={[styles.doctorCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openDoctorProfile(doctor)}
            testID={`doctor-card-${doctor.id}`}
          >
            <View style={styles.doctorCardHeader}>
              <Text style={styles.doctorAvatar}>{doctor.avatar}</Text>
              <View style={styles.doctorCardInfo}>
                <Text style={[styles.doctorName, { color: theme.text }]}>{doctor.name}</Text>
                <Text style={[styles.doctorSpecialty, { color: theme.primary }]}>{doctor.specialty}</Text>
                <Text style={[styles.doctorHospital, { color: theme.textSecondary }]}>{doctor.hospital}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(doctor.id)} testID={`fav-toggle-${doctor.id}`}>
                <Text style={styles.favIcon}>{favorites.includes(doctor.id) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.doctorCardStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>⭐ {doctor.rating}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{doctor.reviewCount} reviews</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>{doctor.experience} yrs</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Experience</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>${doctor.consultationFee}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Consultation</Text>
              </View>
            </View>
            <View style={styles.doctorCardFooter}>
              <View style={styles.languageTags}>
                {doctor.languages.map((lang) => (
                  <Text key={lang} style={[styles.langTag, { backgroundColor: theme.inputBg, color: theme.textSecondary }]}>
                    {lang}
                  </Text>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.bookButton, { backgroundColor: theme.primary }]}
                onPress={() => startBooking(doctor)}
                testID={`book-doctor-${doctor.id}`}
              >
                <Text style={styles.bookButtonText}>Book</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // ─── Render: Appointments Tab ─────────────────────────────────────────────
  const renderAppointmentsTab = () => (
    <ScrollView style={[styles.content, { backgroundColor: theme.bg }]} testID="appointments-tab">
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Upcoming ({upcomingAppointments.length})
      </Text>
      {upcomingAppointments.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No upcoming appointments</Text>
          <TouchableOpacity
            style={[styles.emptyAction, { backgroundColor: theme.primary }]}
            onPress={() => handleTabChange('doctors')}
            testID="book-now-empty"
          >
            <Text style={styles.emptyActionText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        upcomingAppointments.map((apt) => {
          const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
          const daysUntil = getDaysUntil(apt.date);
          return (
            <TouchableOpacity
              key={apt.id}
              style={[styles.appointmentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowAppointmentDetail(apt)}
              testID={`appointment-${apt.id}`}
            >
              <View style={styles.aptCardHeader}>
                <Text style={styles.aptAvatar}>{doctor?.avatar}</Text>
                <View style={styles.aptInfo}>
                  <Text style={[styles.aptDoctorName, { color: theme.text }]}>{doctor?.name}</Text>
                  <Text style={[styles.aptSpecialty, { color: theme.textSecondary }]}>{doctor?.specialty}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: theme.accent + '20' }]}>
                  <Text style={[styles.statusText, { color: theme.accent }]}>Upcoming</Text>
                </View>
              </View>
              <View style={styles.aptCardBody}>
                <Text style={[styles.aptDetail, { color: theme.textSecondary }]}>📅 {formatDate(apt.date)}</Text>
                <Text style={[styles.aptDetail, { color: theme.textSecondary }]}>🕐 {apt.time}</Text>
                <Text style={[styles.aptDetail, { color: theme.textSecondary }]}>📝 {apt.reason}</Text>
              </View>
              <View style={styles.aptCardActions}>
                <Text style={[styles.daysUntilLabel, { color: daysUntil <= 3 ? theme.warning : theme.primary }]}>
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCancelConfirm(apt.id)}
                  testID={`cancel-apt-${apt.id}`}
                >
                  <Text style={[styles.cancelLink, { color: theme.danger }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
        Past Appointments ({completedAppointments.length})
      </Text>
      {completedAppointments.map((apt) => {
        const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
        return (
          <TouchableOpacity
            key={apt.id}
            style={[styles.appointmentCard, { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.8 }]}
            onPress={() => setShowAppointmentDetail(apt)}
            testID={`past-appointment-${apt.id}`}
          >
            <View style={styles.aptCardHeader}>
              <Text style={styles.aptAvatar}>{doctor?.avatar}</Text>
              <View style={styles.aptInfo}>
                <Text style={[styles.aptDoctorName, { color: theme.text }]}>{doctor?.name}</Text>
                <Text style={[styles.aptSpecialty, { color: theme.textSecondary }]}>{doctor?.specialty}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: theme.textSecondary + '20' }]}>
                <Text style={[styles.statusText, { color: theme.textSecondary }]}>Completed</Text>
              </View>
            </View>
            <View style={styles.aptCardBody}>
              <Text style={[styles.aptDetail, { color: theme.textSecondary }]}>📅 {formatDate(apt.date)}</Text>
              <Text style={[styles.aptDetail, { color: theme.textSecondary }]}>📝 {apt.reason}</Text>
            </View>
            {apt.prescriptions.length > 0 && (
              <Text style={[styles.rxCount, { color: theme.primary }]}>
                💊 {apt.prescriptions.length} prescription{apt.prescriptions.length > 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ─── Render: Profile Tab ──────────────────────────────────────────────────
  const renderProfileTab = () => (
    <ScrollView style={[styles.content, { backgroundColor: theme.bg }]} testID="profile-tab">
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.profileAvatarCircle, { backgroundColor: theme.primary }]}>
          <Text style={styles.profileAvatarText}>{profile.name.split(' ').map((n) => n[0]).join('')}</Text>
        </View>
        <Text style={[styles.profileName, { color: theme.text }]}>{profile.name}</Text>
        <Text style={[styles.profileDetail, { color: theme.textSecondary }]}>{profile.email}</Text>
        <Text style={[styles.profileDetail, { color: theme.textSecondary }]}>{profile.phone}</Text>
        <TouchableOpacity
          style={[styles.editProfileBtn, { borderColor: theme.primary }]}
          onPress={() => {
            setEditPhone(profile.phone);
            setEditEmail(profile.email);
            setEditEmergencyName(profile.emergencyContact.name);
            setEditEmergencyPhone(profile.emergencyContact.phone);
            setShowEditProfile(true);
          }}
          testID="edit-profile-btn"
        >
          <Text style={[styles.editProfileBtnText, { color: theme.primary }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-navigation */}
      <View style={styles.profileNav}>
        {[
          { key: 'info', label: 'Info', icon: 'ℹ️' },
          { key: 'prescriptions', label: 'Rx', icon: '💊' },
          { key: 'history', label: 'History', icon: '📋' },
          { key: 'settings', label: 'Settings', icon: '⚙️' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.profileNavItem, activeSubView === item.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveSubView(item.key)}
            testID={`profile-nav-${item.key}`}
          >
            <Text style={styles.profileNavIcon}>{item.icon}</Text>
            <Text style={[styles.profileNavLabel, { color: activeSubView === item.key ? theme.primary : theme.textSecondary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sub-views */}
      {(activeSubView === null || activeSubView === 'info') && (
        <View testID="profile-info-section">
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Personal Information</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Date of Birth</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formatDate(profile.dateOfBirth)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Gender</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile.gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Blood Type</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile.bloodType}</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Insurance</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Provider</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile.insurance}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Member ID</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile.memberId}</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Allergies</Text>
            <View style={styles.tagRow}>
              {profile.allergies.map((allergy) => (
                <Text key={allergy} style={[styles.allergyTag, { backgroundColor: theme.danger + '20', color: theme.danger }]}>
                  ⚠️ {allergy}
                </Text>
              ))}
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Conditions</Text>
            <View style={styles.tagRow}>
              {profile.conditions.map((condition) => (
                <Text key={condition} style={[styles.conditionTag, { backgroundColor: theme.warning + '20', color: theme.warning }]}>
                  {condition}
                </Text>
              ))}
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Emergency Contact</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Name</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile.emergencyContact.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Relationship</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile.emergencyContact.relationship}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile.emergencyContact.phone}</Text>
            </View>
          </View>
        </View>
      )}

      {activeSubView === 'prescriptions' && (
        <View testID="prescriptions-section">
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Active Prescriptions ({allPrescriptions.length})
          </Text>
          {allPrescriptions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Text style={styles.emptyIcon}>💊</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No prescriptions</Text>
            </View>
          ) : (
            allPrescriptions.map((rx) => (
              <View key={rx.id} style={[styles.rxCard, { backgroundColor: theme.card, borderColor: theme.border }]} testID={`prescription-${rx.id}`}>
                <View style={styles.rxHeader}>
                  <Text style={[styles.rxName, { color: theme.text }]}>{rx.name}</Text>
                  <Text style={[styles.rxDuration, { color: theme.primary }]}>{rx.duration}</Text>
                </View>
                <Text style={[styles.rxDosage, { color: theme.textSecondary }]}>{rx.dosage}</Text>
                <Text style={[styles.rxDoctor, { color: theme.textSecondary }]}>Prescribed by {rx.doctorName}</Text>
                <Text style={[styles.rxDate, { color: theme.textSecondary }]}>📅 {formatDate(rx.appointmentDate)}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {activeSubView === 'history' && (
        <View testID="history-section">
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Medical History</Text>
          {MEDICAL_HISTORY.map((item) => (
            <View key={item.id} style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]} testID={`history-${item.id}`}>
              <View style={styles.historyHeader}>
                <Text style={[styles.historyType, { color: theme.primary }]}>{item.type}</Text>
                <Text style={[styles.historyDate, { color: theme.textSecondary }]}>{formatDate(item.date)}</Text>
              </View>
              <Text style={[styles.historyDesc, { color: theme.text }]}>{item.description}</Text>
              <Text style={[styles.historyProvider, { color: theme.textSecondary }]}>{item.provider}</Text>
              <View style={[styles.historyResultBadge, { backgroundColor: item.result === 'Normal' || item.result === 'Clear' || item.result === 'Completed' ? theme.accent + '20' : theme.warning + '20' }]}>
                <Text style={[styles.historyResultText, { color: item.result === 'Normal' || item.result === 'Clear' || item.result === 'Completed' ? theme.accent : theme.warning }]}>
                  {item.result}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeSubView === 'settings' && (
        <View testID="settings-section">
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Switch to dark theme</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                testID="dark-mode-toggle"
              />
            </View>
            <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Appointment Reminders</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Get notified before appointments</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: theme.border, true: theme.primary }}
                testID="reminder-toggle"
              />
            </View>
            {reminderEnabled && (
              <View style={styles.reminderHoursRow}>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Remind me</Text>
                <View style={styles.hoursSelector}>
                  {['1', '12', '24', '48'].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.hourChip, reminderHours === h && { backgroundColor: theme.primary }]}
                      onPress={() => setReminderHours(h)}
                      testID={`reminder-${h}h`}
                    >
                      <Text style={[styles.hourChipText, reminderHours === h && { color: '#fff' }]}>{h}h</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>before</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ─── Render: Doctor Detail Modal ──────────────────────────────────────────
  const renderDoctorModal = () => (
    <Modal visible={showDoctorModal} animationType="slide" transparent testID="doctor-modal">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <ScrollView>
            <TouchableOpacity onPress={() => setShowDoctorModal(false)} testID="close-doctor-modal">
              <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕ Close</Text>
            </TouchableOpacity>
            {selectedDoctor && (
              <>
                <View style={styles.doctorModalHeader}>
                  <Text style={styles.doctorModalAvatar}>{selectedDoctor.avatar}</Text>
                  <Text style={[styles.doctorModalName, { color: theme.text }]}>{selectedDoctor.name}</Text>
                  <Text style={[styles.doctorModalSpecialty, { color: theme.primary }]}>{selectedDoctor.specialty}</Text>
                  <Text style={[styles.doctorModalHospital, { color: theme.textSecondary }]}>{selectedDoctor.hospital}</Text>
                </View>
                <Text style={[styles.doctorBio, { color: theme.text }]}>{selectedDoctor.bio}</Text>

                <View style={styles.doctorStatsGrid}>
                  <View style={[styles.doctorStatBox, { backgroundColor: theme.inputBg }]}>
                    <Text style={[styles.doctorStatValue, { color: theme.text }]}>⭐ {selectedDoctor.rating}</Text>
                    <Text style={[styles.doctorStatLabel, { color: theme.textSecondary }]}>{selectedDoctor.reviewCount} reviews</Text>
                  </View>
                  <View style={[styles.doctorStatBox, { backgroundColor: theme.inputBg }]}>
                    <Text style={[styles.doctorStatValue, { color: theme.text }]}>{selectedDoctor.experience} yrs</Text>
                    <Text style={[styles.doctorStatLabel, { color: theme.textSecondary }]}>Experience</Text>
                  </View>
                  <View style={[styles.doctorStatBox, { backgroundColor: theme.inputBg }]}>
                    <Text style={[styles.doctorStatValue, { color: theme.text }]}>${selectedDoctor.consultationFee}</Text>
                    <Text style={[styles.doctorStatLabel, { color: theme.textSecondary }]}>Per visit</Text>
                  </View>
                </View>

                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Education</Text>
                <Text style={[styles.modalSectionContent, { color: theme.textSecondary }]}>🎓 {selectedDoctor.education}</Text>

                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Languages</Text>
                <View style={styles.tagRow}>
                  {selectedDoctor.languages.map((lang) => (
                    <Text key={lang} style={[styles.langTag, { backgroundColor: theme.inputBg, color: theme.text }]}>{lang}</Text>
                  ))}
                </View>

                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Insurance Accepted</Text>
                <View style={styles.tagRow}>
                  {selectedDoctor.insuranceAccepted.map((ins) => (
                    <Text key={ins} style={[styles.insuranceTag, { backgroundColor: theme.accent + '20', color: theme.accent }]}>{ins}</Text>
                  ))}
                </View>

                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Available Days</Text>
                <View style={styles.tagRow}>
                  {selectedDoctor.availableDays.map((day) => (
                    <Text key={day} style={[styles.dayTag, { backgroundColor: theme.primary + '20', color: theme.primary }]}>{day}</Text>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 20 }]}
                  onPress={() => startBooking(selectedDoctor)}
                  testID="book-from-profile"
                >
                  <Text style={styles.primaryBtnText}>Book Appointment</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── Render: Booking Modal ────────────────────────────────────────────────
  const renderBookingModal = () => (
    <Modal visible={showBookingModal} animationType="slide" transparent testID="booking-modal">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <ScrollView>
            <TouchableOpacity onPress={() => setShowBookingModal(false)} testID="close-booking-modal">
              <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Book Appointment</Text>
            {selectedDoctor && (
              <View style={styles.bookingDoctorInfo}>
                <Text style={styles.bookingDoctorAvatar}>{selectedDoctor.avatar}</Text>
                <Text style={[styles.bookingDoctorName, { color: theme.text }]}>{selectedDoctor.name}</Text>
                <Text style={[styles.bookingDoctorSpecialty, { color: theme.primary }]}>{selectedDoctor.specialty}</Text>
              </View>
            )}

            {/* Date Selection */}
            <Text style={[styles.bookingLabel, { color: theme.text }]}>Select Date *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {availableDates.map((d) => {
                const isAvailable = selectedDoctor?.availableDays.includes(
                  new Date(d.dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
                );
                return (
                  <TouchableOpacity
                    key={d.dateStr}
                    style={[
                      styles.dateChip,
                      { borderColor: theme.border },
                      !isAvailable && { opacity: 0.3 },
                      bookingDate === d.dateStr && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => {
                      if (isAvailable) {
                        setBookingDate(d.dateStr);
                        setBookingTime(null);
                      }
                    }}
                    disabled={!isAvailable}
                    testID={`date-${d.dateStr}`}
                  >
                    <Text style={[styles.dateDayName, bookingDate === d.dateStr && { color: '#fff' }, { color: bookingDate === d.dateStr ? '#fff' : theme.textSecondary }]}>
                      {d.dayName}
                    </Text>
                    <Text style={[styles.dateDayNum, bookingDate === d.dateStr && { color: '#fff' }, { color: bookingDate === d.dateStr ? '#fff' : theme.text }]}>
                      {d.dayNum}
                    </Text>
                    <Text style={[styles.dateMonth, bookingDate === d.dateStr && { color: '#fff' }, { color: bookingDate === d.dateStr ? '#fff' : theme.textSecondary }]}>
                      {d.monthName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time Slot Selection */}
            {bookingDate && (
              <>
                <Text style={[styles.bookingLabel, { color: theme.text }]}>Select Time *</Text>
                {availableSlots.length === 0 ? (
                  <Text style={[styles.noSlotsText, { color: theme.danger }]}>No slots available on this date</Text>
                ) : (
                  <View style={styles.timeSlotGrid}>
                    {availableSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[
                          styles.timeSlot,
                          { borderColor: theme.border },
                          bookingTime === slot && { backgroundColor: theme.primary, borderColor: theme.primary },
                        ]}
                        onPress={() => setBookingTime(slot)}
                        testID={`time-${slot.replace(/[:\s]/g, '-')}`}
                      >
                        <Text style={[styles.timeSlotText, { color: bookingTime === slot ? '#fff' : theme.text }]}>{slot}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Reason */}
            <Text style={[styles.bookingLabel, { color: theme.text }]}>Reason for Visit *</Text>
            <TextInput
              style={[styles.bookingInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g., Annual checkup, Follow-up, New symptoms..."
              placeholderTextColor={theme.textSecondary}
              value={bookingReason}
              onChangeText={setBookingReason}
              testID="booking-reason-input"
            />

            {/* Additional Notes */}
            <Text style={[styles.bookingLabel, { color: theme.text }]}>Additional Notes</Text>
            <TextInput
              style={[styles.bookingInput, styles.bookingTextarea, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
              placeholder="Any additional information for the doctor..."
              placeholderTextColor={theme.textSecondary}
              value={bookingNotes}
              onChangeText={setBookingNotes}
              multiline
              numberOfLines={3}
              testID="booking-notes-input"
            />

            {/* Summary */}
            {bookingDate && bookingTime && bookingReason.trim() && (
              <View style={[styles.bookingSummary, { backgroundColor: theme.inputBg, borderColor: theme.border }]} testID="booking-summary">
                <Text style={[styles.summaryTitle, { color: theme.text }]}>Appointment Summary</Text>
                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>👨‍⚕️ {selectedDoctor?.name}</Text>
                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>📅 {formatDate(bookingDate)}</Text>
                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>🕐 {bookingTime}</Text>
                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>💵 ${selectedDoctor?.consultationFee}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 16, opacity: bookingDate && bookingTime && bookingReason.trim() ? 1 : 0.5 }]}
              onPress={confirmBooking}
              disabled={!bookingDate || !bookingTime || !bookingReason.trim()}
              testID="confirm-booking-btn"
            >
              <Text style={styles.primaryBtnText}>Confirm Booking</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── Render: Appointment Detail Modal ─────────────────────────────────────
  const renderAppointmentDetailModal = () => {
    if (!showAppointmentDetail) return null;
    const apt = showAppointmentDetail;
    const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
    return (
      <Modal visible={!!showAppointmentDetail} animationType="slide" transparent testID="appointment-detail-modal">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView>
              <TouchableOpacity onPress={() => setShowAppointmentDetail(null)} testID="close-apt-detail">
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕ Close</Text>
              </TouchableOpacity>
              <View style={styles.aptDetailHeader}>
                <Text style={styles.aptDetailAvatar}>{doctor?.avatar}</Text>
                <Text style={[styles.aptDetailDoctorName, { color: theme.text }]}>{doctor?.name}</Text>
                <Text style={[styles.aptDetailSpecialty, { color: theme.primary }]}>{doctor?.specialty}</Text>
                <Text style={[styles.aptDetailHospital, { color: theme.textSecondary }]}>{doctor?.hospital}</Text>
              </View>

              <View style={[styles.aptDetailSection, { borderColor: theme.border }]}>
                <Text style={[styles.aptDetailLabel, { color: theme.textSecondary }]}>Date & Time</Text>
                <Text style={[styles.aptDetailValue, { color: theme.text }]}>{formatDate(apt.date)} at {apt.time}</Text>
              </View>

              <View style={[styles.aptDetailSection, { borderColor: theme.border }]}>
                <Text style={[styles.aptDetailLabel, { color: theme.textSecondary }]}>Reason</Text>
                <Text style={[styles.aptDetailValue, { color: theme.text }]}>{apt.reason}</Text>
              </View>

              <View style={[styles.aptDetailSection, { borderColor: theme.border }]}>
                <Text style={[styles.aptDetailLabel, { color: theme.textSecondary }]}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: apt.status === 'upcoming' ? theme.accent + '20' : theme.textSecondary + '20' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: apt.status === 'upcoming' ? theme.accent : theme.textSecondary }]}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </Text>
                </View>
              </View>

              {apt.notes && (
                <View style={[styles.aptDetailSection, { borderColor: theme.border }]}>
                  <Text style={[styles.aptDetailLabel, { color: theme.textSecondary }]}>Doctor's Notes</Text>
                  <Text style={[styles.aptDetailValue, { color: theme.text }]}>{apt.notes}</Text>
                </View>
              )}

              {apt.prescriptions.length > 0 && (
                <View style={[styles.aptDetailSection, { borderColor: theme.border }]}>
                  <Text style={[styles.aptDetailLabel, { color: theme.textSecondary }]}>Prescriptions</Text>
                  {apt.prescriptions.map((rx) => (
                    <View key={rx.id} style={[styles.aptRxItem, { backgroundColor: theme.inputBg }]}>
                      <Text style={[styles.aptRxName, { color: theme.text }]}>💊 {rx.name}</Text>
                      <Text style={[styles.aptRxDosage, { color: theme.textSecondary }]}>{rx.dosage}</Text>
                      <Text style={[styles.aptRxDuration, { color: theme.primary }]}>{rx.duration}</Text>
                    </View>
                  ))}
                </View>
              )}

              {apt.status === 'upcoming' && (
                <TouchableOpacity
                  style={[styles.dangerBtn, { borderColor: theme.danger }]}
                  onPress={() => setShowCancelConfirm(apt.id)}
                  testID="cancel-from-detail"
                >
                  <Text style={[styles.dangerBtnText, { color: theme.danger }]}>Cancel Appointment</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ─── Render: Cancel Confirmation Modal ────────────────────────────────────
  const renderCancelConfirmModal = () => (
    <Modal visible={!!showCancelConfirm} animationType="fade" transparent testID="cancel-confirm-modal">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.confirmModal, { backgroundColor: theme.card }]}>
          <Text style={[styles.confirmTitle, { color: theme.text }]}>Cancel Appointment?</Text>
          <Text style={[styles.confirmMessage, { color: theme.textSecondary }]}>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={[styles.confirmCancelBtn, { borderColor: theme.border }]}
              onPress={() => setShowCancelConfirm(null)}
              testID="keep-appointment-btn"
            >
              <Text style={[styles.confirmCancelText, { color: theme.text }]}>Keep</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmDeleteBtn, { backgroundColor: theme.danger }]}
              onPress={() => cancelAppointment(showCancelConfirm)}
              testID="confirm-cancel-btn"
            >
              <Text style={styles.confirmDeleteText}>Cancel Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ─── Render: Notification Panel ───────────────────────────────────────────
  const renderNotificationPanel = () => (
    <Modal visible={showNotificationPanel} animationType="slide" transparent testID="notification-panel">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.notifPanelHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Notifications</Text>
            <View style={styles.notifPanelActions}>
              <TouchableOpacity onPress={markAllNotificationsRead} testID="mark-all-read">
                <Text style={[styles.notifPanelAction, { color: theme.primary }]}>Mark all read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearAllNotifications} testID="clear-all-notifs">
                <Text style={[styles.notifPanelAction, { color: theme.danger }]}>Clear all</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowNotificationPanel(false)} testID="close-notif-panel">
            <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕ Close</Text>
          </TouchableOpacity>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item: notif }) => (
              <TouchableOpacity
                style={[styles.notifPanelItem, { borderColor: theme.border, opacity: notif.read ? 0.6 : 1 }]}
                onPress={() => markNotificationRead(notif.id)}
                testID={`notif-panel-${notif.id}`}
              >
                <Text style={styles.notifIcon}>
                  {notif.type === 'reminder' ? '⏰' : notif.type === 'prescription' ? '💊' : notif.type === 'result' ? '📊' : notif.type === 'confirmation' ? '✅' : '❌'}
                </Text>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, { color: theme.text }]}>{notif.title}</Text>
                  <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>{notif.message}</Text>
                  <Text style={[styles.notifTime, { color: theme.textSecondary }]}>
                    {Math.round((Date.now() - notif.timestamp) / 3600000)}h ago
                  </Text>
                </View>
                {!notif.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No notifications</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );

  // ─── Render: Edit Profile Modal ───────────────────────────────────────────
  const renderEditProfileModal = () => (
    <Modal visible={showEditProfile} animationType="slide" transparent testID="edit-profile-modal">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <TouchableOpacity onPress={() => setShowEditProfile(false)} testID="close-edit-profile">
            <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>

          <Text style={[styles.bookingLabel, { color: theme.text }]}>Phone</Text>
          <TextInput
            style={[styles.bookingInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            value={editPhone}
            onChangeText={setEditPhone}
            testID="edit-phone-input"
          />

          <Text style={[styles.bookingLabel, { color: theme.text }]}>Email</Text>
          <TextInput
            style={[styles.bookingInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            value={editEmail}
            onChangeText={setEditEmail}
            keyboardType="email-address"
            testID="edit-email-input"
          />

          <Text style={[styles.bookingLabel, { color: theme.text }]}>Emergency Contact Name</Text>
          <TextInput
            style={[styles.bookingInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            value={editEmergencyName}
            onChangeText={setEditEmergencyName}
            testID="edit-emergency-name-input"
          />

          <Text style={[styles.bookingLabel, { color: theme.text }]}>Emergency Contact Phone</Text>
          <TextInput
            style={[styles.bookingInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            value={editEmergencyPhone}
            onChangeText={setEditEmergencyPhone}
            testID="edit-emergency-phone-input"
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 20 }]}
            onPress={saveProfileChanges}
            testID="save-profile-btn"
          >
            <Text style={styles.primaryBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]} testID="healthcare-app">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {activeTab === 'home' ? 'HealthCare+' : activeTab === 'doctors' ? 'Find Doctors' : activeTab === 'appointments' ? 'Appointments' : 'My Profile'}
        </Text>
        <TouchableOpacity
          onPress={() => setShowNotificationPanel(true)}
          testID="notification-bell"
        >
          <View style={styles.bellContainer}>
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadNotificationCount > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: theme.danger }]}>
                <Text style={styles.notifBadgeText}>{unreadNotificationCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'doctors' && renderDoctorsTab()}
        {activeTab === 'appointments' && renderAppointmentsTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </Animated.View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.tabBar, borderColor: theme.border }]}>
        {[
          { key: 'home', label: 'Home', icon: '🏠' },
          { key: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
          { key: 'appointments', label: 'Appts', icon: '📅' },
          { key: 'profile', label: 'Profile', icon: '👤' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabChange(tab.key)}
            testID={`tab-${tab.key}`}
          >
            <Text style={[styles.tabIcon, activeTab === tab.key && { opacity: 1 }]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? theme.primary : theme.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modals */}
      {renderDoctorModal()}
      {renderBookingModal()}
      {renderAppointmentDetailModal()}
      {renderCancelConfirmModal()}
      {renderNotificationPanel()}
      {renderEditProfileModal()}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  bellContainer: { position: 'relative' },
  bellIcon: { fontSize: 24 },
  notifBadge: { position: 'absolute', top: -4, right: -4, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16 },
  welcomeCard: { borderRadius: 16, padding: 20, marginTop: 16 },
  welcomeName: { color: '#fff', fontSize: 24, fontWeight: '700' },
  welcomeSubtitle: { color: '#ffffffcc', fontSize: 14, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 12 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center', padding: 16, borderRadius: 12, width: '23%' },
  quickActionIcon: { fontSize: 24, marginBottom: 6 },
  quickActionLabel: { fontSize: 11, textAlign: 'center' },
  nextAppointmentCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
  nextAptHeader: { flexDirection: 'row', alignItems: 'center' },
  nextAptAvatar: { fontSize: 36 },
  nextAptInfo: { flex: 1, marginLeft: 12 },
  nextAptDoctor: { fontSize: 16, fontWeight: '600' },
  nextAptSpecialty: { fontSize: 13 },
  daysUntilBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  daysUntilText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  nextAptDetails: { flexDirection: 'row', marginTop: 12, gap: 16 },
  nextAptDate: { fontSize: 13 },
  nextAptTime: { fontSize: 13 },
  nextAptReason: { fontSize: 13, marginTop: 8 },
  favDoctorCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8 },
  favDoctorAvatar: { fontSize: 32 },
  favDoctorInfo: { flex: 1, marginLeft: 12 },
  favDoctorName: { fontSize: 15, fontWeight: '600' },
  favDoctorSpecialty: { fontSize: 12 },
  bookBtn: { fontSize: 14, fontWeight: '600' },
  notifCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 6 },
  notifIcon: { fontSize: 24, marginRight: 12 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600' },
  notifMessage: { fontSize: 12, marginTop: 2 },
  notifTime: { fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, marginTop: 12, height: 44 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  specialtyScroll: { marginTop: 12, maxHeight: 40 },
  specialtyChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  specialtyChipText: { fontSize: 13 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 },
  resultCount: { fontSize: 13 },
  sortOptions: { flexDirection: 'row' },
  sortChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 4 },
  sortChipText: { fontSize: 12 },
  doctorCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 12 },
  doctorCardHeader: { flexDirection: 'row', alignItems: 'center' },
  doctorAvatar: { fontSize: 40 },
  doctorCardInfo: { flex: 1, marginLeft: 12 },
  doctorName: { fontSize: 16, fontWeight: '600' },
  doctorSpecialty: { fontSize: 13, marginTop: 2 },
  doctorHospital: { fontSize: 12, marginTop: 2 },
  favIcon: { fontSize: 22 },
  doctorCardStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '600' },
  statLabel: { fontSize: 11, marginTop: 2 },
  doctorCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  languageTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  langTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 11, overflow: 'hidden' },
  bookButton: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  bookButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  appointmentCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 12 },
  aptCardHeader: { flexDirection: 'row', alignItems: 'center' },
  aptAvatar: { fontSize: 32 },
  aptInfo: { flex: 1, marginLeft: 12 },
  aptDoctorName: { fontSize: 15, fontWeight: '600' },
  aptSpecialty: { fontSize: 12 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  aptCardBody: { marginTop: 10 },
  aptDetail: { fontSize: 13, marginTop: 4 },
  aptCardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  daysUntilLabel: { fontSize: 13, fontWeight: '600' },
  cancelLink: { fontSize: 13, fontWeight: '600' },
  rxCount: { marginTop: 8, fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, marginTop: 8 },
  emptyAction: { borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10, marginTop: 12 },
  emptyActionText: { color: '#fff', fontWeight: '600' },
  profileHeader: { alignItems: 'center', padding: 24, borderRadius: 16, marginTop: 16, borderWidth: 1 },
  profileAvatarCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  profileAvatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  profileName: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  profileDetail: { fontSize: 13, marginTop: 4 },
  editProfileBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8, marginTop: 12 },
  editProfileBtnText: { fontWeight: '600', fontSize: 14 },
  profileNav: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, marginBottom: 8 },
  profileNavItem: { alignItems: 'center', paddingBottom: 8 },
  profileNavIcon: { fontSize: 20 },
  profileNavLabel: { fontSize: 12, marginTop: 4 },
  infoCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 12 },
  infoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '500' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  allergyTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 13, overflow: 'hidden' },
  conditionTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 13, overflow: 'hidden' },
  rxCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 10 },
  rxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rxName: { fontSize: 15, fontWeight: '600' },
  rxDuration: { fontSize: 12 },
  rxDosage: { fontSize: 13, marginTop: 4 },
  rxDoctor: { fontSize: 12, marginTop: 4 },
  rxDate: { fontSize: 12, marginTop: 4 },
  historyCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyType: { fontSize: 13, fontWeight: '600' },
  historyDate: { fontSize: 12 },
  historyDesc: { fontSize: 14, marginTop: 6 },
  historyProvider: { fontSize: 12, marginTop: 4 },
  historyResultBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  historyResultText: { fontSize: 12, fontWeight: '600' },
  settingsCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingDesc: { fontSize: 12, marginTop: 2 },
  settingDivider: { height: 1, marginVertical: 8 },
  reminderHoursRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingLeft: 4 },
  hoursSelector: { flexDirection: 'row', gap: 6 },
  hourChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  hourChipText: { fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalCloseText: { textAlign: 'right', fontSize: 16, padding: 4 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  doctorModalHeader: { alignItems: 'center', marginBottom: 16 },
  doctorModalAvatar: { fontSize: 56 },
  doctorModalName: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  doctorModalSpecialty: { fontSize: 15, marginTop: 4 },
  doctorModalHospital: { fontSize: 13, marginTop: 2 },
  doctorBio: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  doctorStatsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  doctorStatBox: { alignItems: 'center', padding: 12, borderRadius: 10, minWidth: 90 },
  doctorStatValue: { fontSize: 16, fontWeight: '600' },
  doctorStatLabel: { fontSize: 11, marginTop: 4 },
  modalSectionTitle: { fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  modalSectionContent: { fontSize: 13 },
  insuranceTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, overflow: 'hidden' },
  dayTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, overflow: 'hidden' },
  primaryBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dangerBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, marginTop: 20 },
  dangerBtnText: { fontSize: 16, fontWeight: '600' },
  bookingDoctorInfo: { alignItems: 'center', marginBottom: 20 },
  bookingDoctorAvatar: { fontSize: 40 },
  bookingDoctorName: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  bookingDoctorSpecialty: { fontSize: 14, marginTop: 2 },
  bookingLabel: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  dateScroll: { maxHeight: 80 },
  dateChip: { alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, marginRight: 8, minWidth: 56 },
  dateDayName: { fontSize: 11 },
  dateDayNum: { fontSize: 18, fontWeight: '700', marginVertical: 2 },
  dateMonth: { fontSize: 11 },
  timeSlotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  timeSlotText: { fontSize: 13 },
  bookingInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  bookingTextarea: { minHeight: 70, textAlignVertical: 'top' },
  bookingSummary: { borderRadius: 12, borderWidth: 1, padding: 16, marginTop: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  summaryItem: { fontSize: 13, marginTop: 4 },
  noSlotsText: { fontSize: 13, marginTop: 4 },
  confirmModal: { margin: 20, borderRadius: 16, padding: 24 },
  confirmTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  confirmMessage: { fontSize: 14, lineHeight: 20 },
  confirmActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  confirmCancelBtn: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 12, alignItems: 'center' },
  confirmCancelText: { fontWeight: '600' },
  confirmDeleteBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmDeleteText: { color: '#fff', fontWeight: '600' },
  aptDetailHeader: { alignItems: 'center', marginBottom: 20 },
  aptDetailAvatar: { fontSize: 48 },
  aptDetailDoctorName: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  aptDetailSpecialty: { fontSize: 14, marginTop: 4 },
  aptDetailHospital: { fontSize: 12, marginTop: 2 },
  aptDetailSection: { borderBottomWidth: 1, paddingVertical: 12 },
  aptDetailLabel: { fontSize: 12, marginBottom: 4 },
  aptDetailValue: { fontSize: 14 },
  aptRxItem: { borderRadius: 8, padding: 10, marginTop: 8 },
  aptRxName: { fontSize: 14, fontWeight: '600' },
  aptRxDosage: { fontSize: 12, marginTop: 2 },
  aptRxDuration: { fontSize: 12, marginTop: 2 },
  notifPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifPanelActions: { flexDirection: 'row', gap: 12 },
  notifPanelAction: { fontSize: 13, fontWeight: '600' },
  notifPanelItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 30, paddingTop: 8 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22, opacity: 0.5 },
  tabLabel: { fontSize: 11, marginTop: 2 },
});
