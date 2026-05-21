import { useState, useEffect, useCallback, useMemo } from 'react';

const SPECIALTIES = ['General Practice', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology'];

const INSURANCE_PROVIDERS = ['BlueCross', 'Aetna', 'UnitedHealth', 'Cigna', 'Medicare', 'None'];

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

const APPOINTMENT_TYPES = ['Check-up', 'Follow-up', 'Consultation', 'Urgent Care', 'Lab Work', 'Vaccination'];

const DOCTORS = [
  { id: 'd1', name: 'Dr. Sarah Chen', specialty: 'General Practice', avatar: '\uD83D\uDC69\u200D\u2695\uFE0F', rating: 4.8, yearsExp: 12, bio: 'Board-certified family medicine physician with focus on preventive care.', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: 'd2', name: 'Dr. James Rivera', specialty: 'Cardiology', avatar: '\uD83D\uDC68\u200D\u2695\uFE0F', rating: 4.9, yearsExp: 18, bio: 'Interventional cardiologist specializing in heart failure and arrhythmias.', availableDays: ['Mon', 'Wed', 'Fri'] },
  { id: 'd3', name: 'Dr. Emily Park', specialty: 'Dermatology', avatar: '\uD83D\uDC69\u200D\u2695\uFE0F', rating: 4.7, yearsExp: 9, bio: 'Dermatologist focused on both medical and cosmetic dermatology.', availableDays: ['Tue', 'Thu', 'Fri'] },
  { id: 'd4', name: 'Dr. Michael Torres', specialty: 'Orthopedics', avatar: '\uD83D\uDC68\u200D\u2695\uFE0F', rating: 4.6, yearsExp: 15, bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement.', availableDays: ['Mon', 'Tue', 'Wed', 'Thu'] },
  { id: 'd5', name: 'Dr. Lisa Nguyen', specialty: 'Pediatrics', avatar: '\uD83D\uDC69\u200D\u2695\uFE0F', rating: 4.9, yearsExp: 11, bio: 'Pediatrician with expertise in childhood development and adolescent health.', availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: 'd6', name: 'Dr. Robert Kim', specialty: 'Neurology', avatar: '\uD83D\uDC68\u200D\u2695\uFE0F', rating: 4.8, yearsExp: 20, bio: 'Neurologist specializing in headache disorders and neurodegenerative diseases.', availableDays: ['Tue', 'Wed', 'Thu'] },
];

const INITIAL_PATIENTS = [
  { id: 'p1', firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', phone: '555-0101', dob: '1985-03-15', insurance: 'BlueCross', insuranceId: 'BC-123456', allergies: 'Penicillin', medications: 'Lisinopril 10mg', emergencyContact: 'Bob Johnson', emergencyPhone: '555-0102', registeredAt: Date.now() - 86400000 * 60 },
  { id: 'p2', firstName: 'Carlos', lastName: 'Martinez', email: 'carlos@example.com', phone: '555-0201', dob: '1990-07-22', insurance: 'Aetna', insuranceId: 'AE-789012', allergies: 'None', medications: 'None', emergencyContact: 'Maria Martinez', emergencyPhone: '555-0202', registeredAt: Date.now() - 86400000 * 45 },
  { id: 'p3', firstName: 'Diana', lastName: 'Lee', email: 'diana@example.com', phone: '555-0301', dob: '1978-11-08', insurance: 'UnitedHealth', insuranceId: 'UH-345678', allergies: 'Sulfa drugs, Latex', medications: 'Metformin 500mg, Atorvastatin 20mg', emergencyContact: 'David Lee', emergencyPhone: '555-0302', registeredAt: Date.now() - 86400000 * 30 },
  { id: 'p4', firstName: 'Erik', lastName: 'Patel', email: 'erik@example.com', phone: '555-0401', dob: '2015-01-20', insurance: 'Cigna', insuranceId: 'CI-901234', allergies: 'Peanuts', medications: 'EpiPen', emergencyContact: 'Priya Patel', emergencyPhone: '555-0402', registeredAt: Date.now() - 86400000 * 15 },
];

const INITIAL_APPOINTMENTS = [
  { id: 'a1', patientId: 'p1', doctorId: 'd1', date: '2026-05-10', time: '9:00 AM', type: 'Check-up', status: 'confirmed', notes: 'Annual physical exam', createdAt: Date.now() - 86400000 * 7 },
  { id: 'a2', patientId: 'p1', doctorId: 'd2', date: '2026-05-12', time: '2:00 PM', type: 'Consultation', status: 'confirmed', notes: 'Heart palpitation follow-up', createdAt: Date.now() - 86400000 * 5 },
  { id: 'a3', patientId: 'p2', doctorId: 'd4', date: '2026-05-11', time: '10:00 AM', type: 'Follow-up', status: 'pending', notes: 'Knee rehab progress check', createdAt: Date.now() - 86400000 * 3 },
  { id: 'a4', patientId: 'p3', doctorId: 'd1', date: '2026-05-09', time: '11:00 AM', type: 'Check-up', status: 'completed', notes: 'Diabetes management review', createdAt: Date.now() - 86400000 * 10 },
  { id: 'a5', patientId: 'p4', doctorId: 'd5', date: '2026-05-13', time: '3:00 PM', type: 'Vaccination', status: 'confirmed', notes: 'Routine childhood vaccination', createdAt: Date.now() - 86400000 * 2 },
  { id: 'a6', patientId: 'p2', doctorId: 'd3', date: '2026-05-08', time: '1:00 PM', type: 'Consultation', status: 'completed', notes: 'Skin rash evaluation', createdAt: Date.now() - 86400000 * 12 },
];

const INITIAL_VISIT_NOTES = [
  { id: 'vn1', appointmentId: 'a4', doctorId: 'd1', patientId: 'p3', date: '2026-05-09', diagnosis: 'Type 2 Diabetes - well controlled', treatment: 'Continue current medications. Increase exercise to 30min/day.', followUp: '3 months', vitals: { bp: '128/82', hr: 72, temp: 98.6, weight: 165 } },
  { id: 'vn2', appointmentId: 'a6', doctorId: 'd3', patientId: 'p2', date: '2026-05-08', diagnosis: 'Contact dermatitis', treatment: 'Prescribed hydrocortisone cream 1%. Avoid irritant.', followUp: '2 weeks', vitals: { bp: '120/78', hr: 68, temp: 98.4, weight: 180 } },
];

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{3}-\d{4}$/.test(phone);
const validateDob = (dob) => {
  if (!dob) return false;
  const date = new Date(dob);
  return date instanceof Date && !isNaN(date) && date < new Date();
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const getAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function HealthClinicBooking() {
  const [activeView, setActiveView] = useState(() => {
    try { return localStorage.getItem('clinicActiveView') || 'dashboard'; } catch { return 'dashboard'; }
  });
  const [patients, setPatients] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicPatients');
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch { return INITIAL_PATIENTS; }
  });
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicAppointments');
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch { return INITIAL_APPOINTMENTS; }
  });
  const [visitNotes, setVisitNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('clinicVisitNotes');
      return saved ? JSON.parse(saved) : INITIAL_VISIT_NOTES;
    } catch { return INITIAL_VISIT_NOTES; }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showVisitNoteModal, setShowVisitNoteModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [intakeStep, setIntakeStep] = useState(1);
  const [intakeData, setIntakeData] = useState({ firstName: '', lastName: '', email: '', phone: '', dob: '', insurance: '', insuranceId: '', allergies: '', medications: '', emergencyContact: '', emergencyPhone: '' });
  const [intakeErrors, setIntakeErrors] = useState({});
  const [bookingData, setBookingData] = useState({ patientId: '', doctorId: '', date: '', time: '', type: '', notes: '' });
  const [bookingErrors, setBookingErrors] = useState({});
  const [visitNoteData, setVisitNoteData] = useState({ diagnosis: '', treatment: '', followUp: '', bp: '', hr: '', temp: '', weight: '' });
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('clinicTheme') || 'light'; } catch { return 'light'; }
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try { localStorage.setItem('clinicActiveView', activeView); } catch {}
  }, [activeView]);

  useEffect(() => {
    try { localStorage.setItem('clinicPatients', JSON.stringify(patients)); } catch {}
  }, [patients]);

  useEffect(() => {
    try { localStorage.setItem('clinicAppointments', JSON.stringify(appointments)); } catch {}
  }, [appointments]);

  useEffect(() => {
    try { localStorage.setItem('clinicVisitNotes', JSON.stringify(visitNotes)); } catch {}
  }, [visitNotes]);

  useEffect(() => {
    try { localStorage.setItem('clinicTheme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showVisitNoteModal) { setShowVisitNoteModal(false); return; }
        if (showBookingModal) { setShowBookingModal(false); resetBookingForm(); return; }
        if (showPatientModal) { setShowPatientModal(false); resetIntakeForm(); return; }
        if (selectedAppointment) { setSelectedAppointment(null); return; }
        if (selectedDoctor) { setSelectedDoctor(null); return; }
        if (selectedPatient) { setSelectedPatient(null); return; }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBookingModal, showPatientModal, showVisitNoteModal, selectedPatient, selectedDoctor, selectedAppointment]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const resetIntakeForm = useCallback(() => {
    setIntakeStep(1);
    setIntakeData({ firstName: '', lastName: '', email: '', phone: '', dob: '', insurance: '', insuranceId: '', allergies: '', medications: '', emergencyContact: '', emergencyPhone: '' });
    setIntakeErrors({});
    setEditingPatient(null);
  }, []);

  const resetBookingForm = useCallback(() => {
    setBookingData({ patientId: '', doctorId: '', date: '', time: '', type: '', notes: '' });
    setBookingErrors({});
  }, []);

  const validateIntakeStep1 = useCallback(() => {
    const errors = {};
    if (!intakeData.firstName.trim()) errors.firstName = 'First name is required';
    if (!intakeData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!intakeData.email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(intakeData.email)) errors.email = 'Invalid email format';
    if (!intakeData.phone.trim()) errors.phone = 'Phone is required';
    else if (!validatePhone(intakeData.phone)) errors.phone = 'Phone format: 555-0101';
    if (!intakeData.dob) errors.dob = 'Date of birth is required';
    else if (!validateDob(intakeData.dob)) errors.dob = 'Invalid date of birth';
    setIntakeErrors(errors);
    return Object.keys(errors).length === 0;
  }, [intakeData]);

  const validateIntakeStep2 = useCallback(() => {
    const errors = {};
    if (!intakeData.insurance) errors.insurance = 'Insurance provider is required';
    if (intakeData.insurance && intakeData.insurance !== 'None' && !intakeData.insuranceId.trim()) {
      errors.insuranceId = 'Insurance ID is required';
    }
    setIntakeErrors(errors);
    return Object.keys(errors).length === 0;
  }, [intakeData]);

  const validateIntakeStep3 = useCallback(() => {
    const errors = {};
    if (!intakeData.emergencyContact.trim()) errors.emergencyContact = 'Emergency contact name is required';
    if (!intakeData.emergencyPhone.trim()) errors.emergencyPhone = 'Emergency phone is required';
    else if (!validatePhone(intakeData.emergencyPhone)) errors.emergencyPhone = 'Phone format: 555-0101';
    setIntakeErrors(errors);
    return Object.keys(errors).length === 0;
  }, [intakeData]);

  const handleIntakeNext = useCallback(() => {
    if (intakeStep === 1 && validateIntakeStep1()) setIntakeStep(2);
    else if (intakeStep === 2 && validateIntakeStep2()) setIntakeStep(3);
    else if (intakeStep === 3 && validateIntakeStep3()) {
      if (editingPatient) {
        setPatients(prev => prev.map(p => p.id === editingPatient.id ? { ...p, ...intakeData } : p));
        showNotification('Patient record updated successfully');
      } else {
        const newPatient = {
          id: 'p' + (Date.now()),
          ...intakeData,
          registeredAt: Date.now(),
        };
        setPatients(prev => [...prev, newPatient]);
        showNotification('Patient registered successfully');
      }
      setShowPatientModal(false);
      resetIntakeForm();
    }
  }, [intakeStep, validateIntakeStep1, validateIntakeStep2, validateIntakeStep3, intakeData, editingPatient, resetIntakeForm, showNotification]);

  const handleIntakeBack = useCallback(() => {
    if (intakeStep > 1) {
      setIntakeStep(intakeStep - 1);
      setIntakeErrors({});
    }
  }, [intakeStep]);

  const validateBooking = useCallback(() => {
    const errors = {};
    if (!bookingData.patientId) errors.patientId = 'Select a patient';
    if (!bookingData.doctorId) errors.doctorId = 'Select a doctor';
    if (!bookingData.date) errors.date = 'Select a date';
    if (!bookingData.time) errors.time = 'Select a time slot';
    if (!bookingData.type) errors.type = 'Select appointment type';

    if (bookingData.doctorId && bookingData.date && bookingData.time) {
      const conflict = appointments.find(
        a => a.doctorId === bookingData.doctorId && a.date === bookingData.date && a.time === bookingData.time && a.status !== 'cancelled'
      );
      if (conflict) errors.time = 'This time slot is already booked';
    }

    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  }, [bookingData, appointments]);

  const handleBookAppointment = useCallback(() => {
    if (validateBooking()) {
      const newAppointment = {
        id: 'a' + Date.now(),
        ...bookingData,
        status: 'pending',
        createdAt: Date.now(),
      };
      setAppointments(prev => [...prev, newAppointment]);
      setShowBookingModal(false);
      resetBookingForm();
      showNotification('Appointment booked successfully');
    }
  }, [validateBooking, bookingData, resetBookingForm, showNotification]);

  const handleCancelAppointment = useCallback((appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a));
      showNotification('Appointment cancelled', 'warning');
    }
  }, [showNotification]);

  const handleConfirmAppointment = useCallback((appointmentId) => {
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'confirmed' } : a));
    showNotification('Appointment confirmed');
  }, [showNotification]);

  const handleCompleteAppointment = useCallback((appointmentId) => {
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'completed' } : a));
    setSelectedAppointment(appointments.find(a => a.id === appointmentId));
    setShowVisitNoteModal(true);
  }, [appointments]);

  const handleSaveVisitNote = useCallback(() => {
    if (!visitNoteData.diagnosis.trim() || !visitNoteData.treatment.trim()) return;
    const newNote = {
      id: 'vn' + Date.now(),
      appointmentId: selectedAppointment.id,
      doctorId: selectedAppointment.doctorId,
      patientId: selectedAppointment.patientId,
      date: selectedAppointment.date,
      diagnosis: visitNoteData.diagnosis,
      treatment: visitNoteData.treatment,
      followUp: visitNoteData.followUp,
      vitals: {
        bp: visitNoteData.bp,
        hr: Number(visitNoteData.hr) || 0,
        temp: Number(visitNoteData.temp) || 0,
        weight: Number(visitNoteData.weight) || 0,
      },
    };
    setVisitNotes(prev => [...prev, newNote]);
    setShowVisitNoteModal(false);
    setVisitNoteData({ diagnosis: '', treatment: '', followUp: '', bp: '', hr: '', temp: '', weight: '' });
    setSelectedAppointment(null);
    showNotification('Visit note saved');
  }, [visitNoteData, selectedAppointment, showNotification]);

  const handleDeletePatient = useCallback((patientId) => {
    if (window.confirm('Are you sure you want to delete this patient record? This cannot be undone.')) {
      setPatients(prev => prev.filter(p => p.id !== patientId));
      setAppointments(prev => prev.filter(a => a.patientId !== patientId));
      setVisitNotes(prev => prev.filter(vn => vn.patientId !== patientId));
      setSelectedPatient(null);
      showNotification('Patient record deleted', 'warning');
    }
  }, [showNotification]);

  const handleEditPatient = useCallback((patient) => {
    setEditingPatient(patient);
    setIntakeData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dob: patient.dob,
      insurance: patient.insurance,
      insuranceId: patient.insuranceId,
      allergies: patient.allergies,
      medications: patient.medications,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
    });
    setShowPatientModal(true);
  }, []);

  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled');
    const upcomingAppts = appointments.filter(a => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed');
    const completedAppts = appointments.filter(a => a.status === 'completed');
    const pendingAppts = appointments.filter(a => a.status === 'pending');
    return { todayCount: todayAppts.length, upcomingCount: upcomingAppts.length, completedCount: completedAppts.length, pendingCount: pendingAppts.length, totalPatients: patients.length };
  }, [appointments, patients]);

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => {
        const patient = patients.find(p => p.id === a.patientId);
        const doctor = DOCTORS.find(d => d.id === a.doctorId);
        return (patient && (`${patient.firstName} ${patient.lastName}`).toLowerCase().includes(q)) ||
               (doctor && doctor.name.toLowerCase().includes(q)) ||
               a.type.toLowerCase().includes(q) ||
               a.notes.toLowerCase().includes(q);
      });
    }
    if (filterStatus !== 'all') result = result.filter(a => a.status === filterStatus);
    result.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    return result;
  }, [appointments, patients, searchQuery, filterStatus]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(p =>
      (`${p.firstName} ${p.lastName}`).toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.insurance.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const filteredDoctors = useMemo(() => {
    let result = [...DOCTORS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q));
    }
    if (filterSpecialty !== 'all') result = result.filter(d => d.specialty === filterSpecialty);
    return result;
  }, [searchQuery, filterSpecialty]);

  const getPatientById = useCallback((id) => patients.find(p => p.id === id), [patients]);
  const getDoctorById = useCallback((id) => DOCTORS.find(d => d.id === id), []);

  const getPatientAppointments = useCallback((patientId) => {
    return appointments.filter(a => a.patientId === patientId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments]);

  const getPatientVisitNotes = useCallback((patientId) => {
    return visitNotes.filter(vn => vn.patientId === patientId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [visitNotes]);

  const getAvailableSlots = useCallback((doctorId, date) => {
    if (!doctorId || !date) return TIME_SLOTS;
    const bookedSlots = appointments
      .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
      .map(a => a.time);
    return TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
  }, [appointments]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a2e' : '#f0f4f8';
  const cardBg = isDark ? '#16213e' : '#ffffff';
  const textColor = isDark ? '#e0e0e0' : '#1a1a2e';
  const mutedColor = isDark ? '#a0a0b0' : '#6b7280';
  const borderColor = isDark ? '#2a2a4a' : '#e2e8f0';
  const primaryColor = '#3b82f6';
  const dangerColor = '#ef4444';
  const successColor = '#22c55e';
  const warningColor = '#f59e0b';

  const statusColors = { confirmed: successColor, pending: warningColor, completed: primaryColor, cancelled: dangerColor };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '\uD83D\uDCCA' },
    { id: 'appointments', label: 'Appointments', icon: '\uD83D\uDCC5' },
    { id: 'patients', label: 'Patients', icon: '\uD83D\uDC65' },
    { id: 'doctors', label: 'Doctors', icon: '\u2695\uFE0F' },
  ];

  const renderSidebar = () => (
    <div style={{ width: sidebarCollapsed ? 60 : 240, background: isDark ? '#0f3460' : '#1e40af', color: '#fff', padding: '16px 8px', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 8px' }}>
        {!sidebarCollapsed && <h1 style={{ fontSize: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>MediCare Clinic</h1>}
        <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
          {sidebarCollapsed ? '\u25B6' : '\u25C0'}
        </button>
      </div>
      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveView(item.id); setSelectedPatient(null); setSelectedDoctor(null); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', marginBottom: 4, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: activeView === item.id ? 600 : 400, background: activeView === item.id ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {!sidebarCollapsed && item.label}
          </button>
        ))}
      </nav>
      {!sidebarCollapsed && (
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: 12, opacity: 0.7 }}>
          <div>{patients.length} registered patients</div>
          <div>{appointments.filter(a => a.status !== 'cancelled').length} active appointments</div>
        </div>
      )}
    </div>
  );

  const renderHeader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: cardBg, borderBottom: `1px solid ${borderColor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
        <input type="text" placeholder="Search patients, doctors, appointments..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#f8fafc', color: textColor, width: 320, outline: 'none' }} />
        {activeView === 'appointments' && (
          <select aria-label="Filter by status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#f8fafc', color: textColor }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
        {activeView === 'doctors' && (
          <select aria-label="Filter by specialty" value={filterSpecialty} onChange={e => setFilterSpecialty(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#f8fafc', color: textColor }}>
            <option value="all">All Specialties</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button aria-label="Toggle theme" onClick={() => setTheme(isDark ? 'light' : 'dark')} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
          {isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
        </button>
        <button onClick={() => { resetIntakeForm(); setShowPatientModal(true); }} style={{ padding: '8px 16px', background: primaryColor, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          + New Patient
        </button>
        <button onClick={() => { resetBookingForm(); setShowBookingModal(true); }} style={{ padding: '8px 16px', background: successColor, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          + Book Appointment
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: textColor, marginBottom: 20 }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: "Today's Appointments", value: dashboardStats.todayCount, color: primaryColor, icon: '\uD83D\uDCC5' },
          { label: 'Upcoming', value: dashboardStats.upcomingCount, color: warningColor, icon: '\u23F0' },
          { label: 'Completed', value: dashboardStats.completedCount, color: successColor, icon: '\u2705' },
          { label: 'Pending Confirmation', value: dashboardStats.pendingCount, color: warningColor, icon: '\u23F3' },
          { label: 'Total Patients', value: dashboardStats.totalPatients, color: '#8b5cf6', icon: '\uD83D\uDC65' },
        ].map(stat => (
          <div key={stat.label} style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 28 }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: mutedColor }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 12 }}>Upcoming Appointments</h3>
          {appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').slice(0, 5).map(appt => {
            const patient = getPatientById(appt.patientId);
            const doctor = getDoctorById(appt.doctorId);
            return (
              <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                <div>
                  <div style={{ fontWeight: 500, color: textColor }}>{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: mutedColor }}>{doctor?.name} - {appt.type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textColor }}>{formatDate(appt.date)}</div>
                  <div style={{ fontSize: 12, color: mutedColor }}>{appt.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 12 }}>Recent Patients</h3>
          {patients.slice(-5).reverse().map(patient => (
            <div key={patient.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, cursor: 'pointer' }} onClick={() => { setSelectedPatient(patient); setActiveView('patients'); }}>
              <div>
                <div style={{ fontWeight: 500, color: textColor }}>{patient.firstName} {patient.lastName}</div>
                <div style={{ fontSize: 12, color: mutedColor }}>{patient.insurance} - Age {getAge(patient.dob)}</div>
              </div>
              <div style={{ fontSize: 12, color: mutedColor }}>{patient.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textColor }}>Appointments</h2>
        <span style={{ fontSize: 14, color: mutedColor }}>{filteredAppointments.length} appointments</span>
      </div>
      <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: isDark ? '#1a1a2e' : '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>Patient</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>Doctor</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>Date & Time</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: mutedColor, borderBottom: `1px solid ${borderColor}` }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appt => {
              const patient = getPatientById(appt.patientId);
              const doctor = getDoctorById(appt.doctorId);
              return (
                <tr key={appt.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '12px 16px', color: textColor, fontWeight: 500 }}>{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}</td>
                  <td style={{ padding: '12px 16px', color: textColor }}>{doctor?.name || 'Unknown'}</td>
                  <td style={{ padding: '12px 16px', color: textColor }}>{formatDate(appt.date)}<br /><span style={{ fontSize: 12, color: mutedColor }}>{appt.time}</span></td>
                  <td style={{ padding: '12px 16px', color: textColor }}>{appt.type}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: `${statusColors[appt.status]}20`, color: statusColors[appt.status] }}>{appt.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {appt.status === 'pending' && (
                        <button onClick={() => handleConfirmAppointment(appt.id)} style={{ padding: '4px 10px', background: `${successColor}20`, color: successColor, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Confirm</button>
                      )}
                      {(appt.status === 'confirmed' || appt.status === 'pending') && (
                        <>
                          <button onClick={() => handleCompleteAppointment(appt.id)} style={{ padding: '4px 10px', background: `${primaryColor}20`, color: primaryColor, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Complete</button>
                          <button onClick={() => handleCancelAppointment(appt.id)} style={{ padding: '4px 10px', background: `${dangerColor}20`, color: dangerColor, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredAppointments.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: mutedColor }}>No appointments found</div>
        )}
      </div>
    </div>
  );

  const renderPatientDetail = () => {
    if (!selectedPatient) return null;
    const patientAppts = getPatientAppointments(selectedPatient.id);
    const patientNotes = getPatientVisitNotes(selectedPatient.id);
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setSelectedPatient(null)} style={{ background: 'none', border: 'none', color: primaryColor, cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>
          &larr; Back to Patients
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: textColor }}>{selectedPatient.firstName} {selectedPatient.lastName}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button aria-label="Edit patient" onClick={() => handleEditPatient(selectedPatient)} style={{ background: `${primaryColor}20`, color: primaryColor, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Edit</button>
                <button aria-label="Delete patient" onClick={() => handleDeletePatient(selectedPatient.id)} style={{ background: `${dangerColor}20`, color: dangerColor, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Delete</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div><span style={{ color: mutedColor }}>Age:</span> <span style={{ color: textColor }}>{getAge(selectedPatient.dob)} years</span></div>
              <div><span style={{ color: mutedColor }}>DOB:</span> <span style={{ color: textColor }}>{formatDate(selectedPatient.dob)}</span></div>
              <div><span style={{ color: mutedColor }}>Email:</span> <span style={{ color: textColor }}>{selectedPatient.email}</span></div>
              <div><span style={{ color: mutedColor }}>Phone:</span> <span style={{ color: textColor }}>{selectedPatient.phone}</span></div>
              <div><span style={{ color: mutedColor }}>Insurance:</span> <span style={{ color: textColor }}>{selectedPatient.insurance} ({selectedPatient.insuranceId})</span></div>
              <div><span style={{ color: mutedColor }}>Allergies:</span> <span style={{ color: textColor, fontWeight: selectedPatient.allergies !== 'None' ? 600 : 400, color: selectedPatient.allergies !== 'None' ? dangerColor : textColor }}>{selectedPatient.allergies}</span></div>
              <div><span style={{ color: mutedColor }}>Medications:</span> <span style={{ color: textColor }}>{selectedPatient.medications}</span></div>
              <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 10, marginTop: 4 }}>
                <div style={{ color: mutedColor, marginBottom: 4 }}>Emergency Contact</div>
                <div style={{ color: textColor }}>{selectedPatient.emergencyContact}</div>
                <div style={{ color: textColor }}>{selectedPatient.emergencyPhone}</div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}`, marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 12 }}>Appointment History</h4>
              {patientAppts.length === 0 ? (
                <div style={{ color: mutedColor, fontSize: 14 }}>No appointments yet</div>
              ) : patientAppts.map(appt => {
                const doctor = getDoctorById(appt.doctorId);
                return (
                  <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div>
                      <div style={{ fontWeight: 500, color: textColor }}>{appt.type} - {doctor?.name}</div>
                      <div style={{ fontSize: 12, color: mutedColor }}>{appt.notes}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: textColor }}>{formatDate(appt.date)}</div>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${statusColors[appt.status]}20`, color: statusColors[appt.status] }}>{appt.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 12 }}>Visit Notes</h4>
              {patientNotes.length === 0 ? (
                <div style={{ color: mutedColor, fontSize: 14 }}>No visit notes yet</div>
              ) : patientNotes.map(note => {
                const doctor = getDoctorById(note.doctorId);
                return (
                  <div key={note.id} style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: textColor }}>{note.diagnosis}</div>
                      <div style={{ fontSize: 12, color: mutedColor }}>{formatDate(note.date)} - {doctor?.name}</div>
                    </div>
                    <div style={{ fontSize: 13, color: textColor, marginBottom: 6 }}>{note.treatment}</div>
                    {note.followUp && <div style={{ fontSize: 12, color: mutedColor }}>Follow-up: {note.followUp}</div>}
                    {note.vitals && (
                      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                        {note.vitals.bp && <span style={{ color: mutedColor }}>BP: <strong style={{ color: textColor }}>{note.vitals.bp}</strong></span>}
                        {note.vitals.hr > 0 && <span style={{ color: mutedColor }}>HR: <strong style={{ color: textColor }}>{note.vitals.hr}</strong></span>}
                        {note.vitals.temp > 0 && <span style={{ color: mutedColor }}>Temp: <strong style={{ color: textColor }}>{note.vitals.temp}</strong></span>}
                        {note.vitals.weight > 0 && <span style={{ color: mutedColor }}>Weight: <strong style={{ color: textColor }}>{note.vitals.weight}</strong></span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPatients = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textColor }}>Patients</h2>
        <span style={{ fontSize: 14, color: mutedColor }}>{filteredPatients.length} patients</span>
      </div>
      {selectedPatient ? renderPatientDetail() : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredPatients.map(patient => {
            const apptCount = appointments.filter(a => a.patientId === patient.id).length;
            return (
              <div key={patient.id} onClick={() => setSelectedPatient(patient)} style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: textColor }}>{patient.firstName} {patient.lastName}</div>
                    <div style={{ fontSize: 13, color: mutedColor }}>Age {getAge(patient.dob)}</div>
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 11, background: `${primaryColor}15`, color: primaryColor }}>{patient.insurance}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  <div style={{ color: mutedColor }}>{patient.email}</div>
                  <div style={{ color: mutedColor }}>{patient.phone}</div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: mutedColor }}>{apptCount} appointment{apptCount !== 1 ? 's' : ''}</span>
                    {patient.allergies !== 'None' && <span style={{ color: dangerColor, fontSize: 11, fontWeight: 600 }}>Allergies noted</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredPatients.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: mutedColor }}>No patients found</div>
          )}
        </div>
      )}
    </div>
  );

  const renderDoctorDetail = () => {
    if (!selectedDoctor) return null;
    const doctorAppts = appointments.filter(a => a.doctorId === selectedDoctor.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', border: 'none', color: primaryColor, cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>
          &larr; Back to Doctors
        </button>
        <div style={{ background: cardBg, borderRadius: 12, padding: 24, border: `1px solid ${borderColor}`, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 48 }}>{selectedDoctor.avatar}</span>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: textColor }}>{selectedDoctor.name}</h3>
              <div style={{ fontSize: 14, color: primaryColor, fontWeight: 500 }}>{selectedDoctor.specialty}</div>
              <div style={{ fontSize: 13, color: mutedColor, marginTop: 4 }}>{selectedDoctor.yearsExp} years experience</div>
            </div>
          </div>
          <p style={{ color: textColor, fontSize: 14, lineHeight: 1.6 }}>{selectedDoctor.bio}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <div style={{ padding: '8px 16px', background: `${warningColor}15`, borderRadius: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: warningColor }}>{selectedDoctor.rating}</div>
              <div style={{ fontSize: 11, color: mutedColor }}>Rating</div>
            </div>
            <div style={{ padding: '8px 16px', background: `${primaryColor}15`, borderRadius: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: primaryColor }}>{doctorAppts.length}</div>
              <div style={{ fontSize: 11, color: mutedColor }}>Appointments</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, color: mutedColor, marginBottom: 6 }}>Available Days</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {selectedDoctor.availableDays.map(day => (
                <span key={day} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: `${successColor}15`, color: successColor, fontWeight: 500 }}>{day}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 12 }}>Appointment Schedule</h4>
          {doctorAppts.length === 0 ? (
            <div style={{ color: mutedColor, fontSize: 14 }}>No appointments scheduled</div>
          ) : doctorAppts.slice(0, 10).map(appt => {
            const patient = getPatientById(appt.patientId);
            return (
              <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                <div>
                  <div style={{ fontWeight: 500, color: textColor }}>{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: mutedColor }}>{appt.type} - {appt.notes}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: textColor }}>{formatDate(appt.date)} at {appt.time}</div>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${statusColors[appt.status]}20`, color: statusColors[appt.status] }}>{appt.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDoctors = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textColor }}>Doctors</h2>
        <span style={{ fontSize: 14, color: mutedColor }}>{filteredDoctors.length} doctors</span>
      </div>
      {selectedDoctor ? renderDoctorDetail() : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} onClick={() => setSelectedDoctor(doctor)} style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}`, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 36 }}>{doctor.avatar}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: textColor }}>{doctor.name}</div>
                  <div style={{ fontSize: 13, color: primaryColor }}>{doctor.specialty}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: mutedColor, marginBottom: 12, lineHeight: 1.5 }}>{doctor.bio}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                  <span style={{ color: warningColor }}>{'★'.repeat(Math.round(doctor.rating))} {doctor.rating}</span>
                  <span style={{ color: mutedColor }}>{doctor.yearsExp} yrs</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {doctor.availableDays.slice(0, 3).map(day => (
                    <span key={day} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: `${successColor}15`, color: successColor }}>{day}</span>
                  ))}
                  {doctor.availableDays.length > 3 && <span style={{ fontSize: 10, color: mutedColor }}>+{doctor.availableDays.length - 3}</span>}
                </div>
              </div>
            </div>
          ))}
          {filteredDoctors.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: mutedColor }}>No doctors found</div>
          )}
        </div>
      )}
    </div>
  );

  const renderPatientIntakeModal = () => {
    if (!showPatientModal) return null;
    const stepLabels = ['Personal Info', 'Insurance', 'Emergency & Medical'];
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: cardBg, borderRadius: 16, padding: 32, width: 520, maxHeight: '90vh', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: textColor }}>{editingPatient ? 'Edit Patient' : 'New Patient Registration'}</h3>
            <button onClick={() => { setShowPatientModal(false); resetIntakeForm(); }} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: mutedColor }}>&times;</button>
          </div>
          <div style={{ display: 'flex', marginBottom: 24 }}>
            {stepLabels.map((label, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, background: intakeStep > i + 1 ? successColor : intakeStep === i + 1 ? primaryColor : borderColor, color: intakeStep >= i + 1 ? '#fff' : mutedColor, marginBottom: 6 }}>
                  {intakeStep > i + 1 ? '\u2713' : i + 1}
                </div>
                <div style={{ fontSize: 11, color: intakeStep === i + 1 ? primaryColor : mutedColor }}>{label}</div>
              </div>
            ))}
          </div>

          {intakeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>First Name *</label>
                  <input type="text" value={intakeData.firstName} onChange={e => setIntakeData({ ...intakeData, firstName: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.firstName ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                  {intakeErrors.firstName && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.firstName}</div>}
                </div>
                <div>
                  <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Last Name *</label>
                  <input type="text" value={intakeData.lastName} onChange={e => setIntakeData({ ...intakeData, lastName: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.lastName ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                  {intakeErrors.lastName && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.lastName}</div>}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Email *</label>
                <input type="email" value={intakeData.email} onChange={e => setIntakeData({ ...intakeData, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.email ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                {intakeErrors.email && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.email}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Phone *</label>
                  <input type="tel" value={intakeData.phone} onChange={e => setIntakeData({ ...intakeData, phone: e.target.value })} placeholder="555-0101" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.phone ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                  {intakeErrors.phone && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.phone}</div>}
                </div>
                <div>
                  <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Date of Birth *</label>
                  <input type="date" value={intakeData.dob} onChange={e => setIntakeData({ ...intakeData, dob: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.dob ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                  {intakeErrors.dob && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.dob}</div>}
                </div>
              </div>
            </div>
          )}

          {intakeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Insurance Provider *</label>
                <select value={intakeData.insurance} onChange={e => setIntakeData({ ...intakeData, insurance: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.insurance ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }}>
                  <option value="">Select provider</option>
                  {INSURANCE_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {intakeErrors.insurance && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.insurance}</div>}
              </div>
              {intakeData.insurance && intakeData.insurance !== 'None' && (
                <div>
                  <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Insurance ID *</label>
                  <input type="text" value={intakeData.insuranceId} onChange={e => setIntakeData({ ...intakeData, insuranceId: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.insuranceId ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                  {intakeErrors.insuranceId && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.insuranceId}</div>}
                </div>
              )}
            </div>
          )}

          {intakeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Allergies</label>
                <input type="text" value={intakeData.allergies} onChange={e => setIntakeData({ ...intakeData, allergies: e.target.value })} placeholder="e.g., Penicillin, Peanuts (or None)" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Current Medications</label>
                <input type="text" value={intakeData.medications} onChange={e => setIntakeData({ ...intakeData, medications: e.target.value })} placeholder="e.g., Lisinopril 10mg (or None)" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Emergency Contact Name *</label>
                <input type="text" value={intakeData.emergencyContact} onChange={e => setIntakeData({ ...intakeData, emergencyContact: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.emergencyContact ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                {intakeErrors.emergencyContact && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.emergencyContact}</div>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Emergency Contact Phone *</label>
                <input type="tel" value={intakeData.emergencyPhone} onChange={e => setIntakeData({ ...intakeData, emergencyPhone: e.target.value })} placeholder="555-0101" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${intakeErrors.emergencyPhone ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                {intakeErrors.emergencyPhone && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{intakeErrors.emergencyPhone}</div>}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={intakeStep > 1 ? handleIntakeBack : () => { setShowPatientModal(false); resetIntakeForm(); }} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 8, color: textColor, cursor: 'pointer' }}>
              {intakeStep > 1 ? 'Back' : 'Cancel'}
            </button>
            <button onClick={handleIntakeNext} style={{ padding: '10px 20px', background: intakeStep === 3 ? successColor : primaryColor, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              {intakeStep === 3 ? (editingPatient ? 'Update Patient' : 'Register Patient') : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingModal = () => {
    if (!showBookingModal) return null;
    const availableSlots = getAvailableSlots(bookingData.doctorId, bookingData.date);
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: cardBg, borderRadius: 16, padding: 32, width: 520, maxHeight: '90vh', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: textColor }}>Book Appointment</h3>
            <button onClick={() => { setShowBookingModal(false); resetBookingForm(); }} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: mutedColor }}>&times;</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Patient *</label>
              <select value={bookingData.patientId} onChange={e => setBookingData({ ...bookingData, patientId: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${bookingErrors.patientId ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }}>
                <option value="">Select patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
              {bookingErrors.patientId && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{bookingErrors.patientId}</div>}
            </div>
            <div>
              <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Doctor *</label>
              <select value={bookingData.doctorId} onChange={e => setBookingData({ ...bookingData, doctorId: e.target.value, time: '' })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${bookingErrors.doctorId ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }}>
                <option value="">Select doctor</option>
                {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>)}
              </select>
              {bookingErrors.doctorId && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{bookingErrors.doctorId}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Date *</label>
                <input type="date" value={bookingData.date} onChange={e => setBookingData({ ...bookingData, date: e.target.value, time: '' })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${bookingErrors.date ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
                {bookingErrors.date && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{bookingErrors.date}</div>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Time *</label>
                <select value={bookingData.time} onChange={e => setBookingData({ ...bookingData, time: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${bookingErrors.time ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }}>
                  <option value="">Select time</option>
                  {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                {bookingErrors.time && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{bookingErrors.time}</div>}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Appointment Type *</label>
              <select value={bookingData.type} onChange={e => setBookingData({ ...bookingData, type: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${bookingErrors.type ? dangerColor : borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }}>
                <option value="">Select type</option>
                {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {bookingErrors.type && <div style={{ color: dangerColor, fontSize: 12, marginTop: 2 }}>{bookingErrors.type}</div>}
            </div>
            <div>
              <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Notes</label>
              <textarea value={bookingData.notes} onChange={e => setBookingData({ ...bookingData, notes: e.target.value })} placeholder="Reason for visit..." rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button onClick={() => { setShowBookingModal(false); resetBookingForm(); }} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 8, color: textColor, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleBookAppointment} style={{ padding: '10px 20px', background: successColor, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Book Appointment</button>
          </div>
        </div>
      </div>
    );
  };

  const renderVisitNoteModal = () => {
    if (!showVisitNoteModal || !selectedAppointment) return null;
    const patient = getPatientById(selectedAppointment.patientId);
    const doctor = getDoctorById(selectedAppointment.doctorId);
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: cardBg, borderRadius: 16, padding: 32, width: 560, maxHeight: '90vh', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: textColor }}>Visit Note</h3>
            <button onClick={() => { setShowVisitNoteModal(false); setSelectedAppointment(null); }} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: mutedColor }}>&times;</button>
          </div>
          <div style={{ background: isDark ? '#1a1a2e' : '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
            <div style={{ color: textColor, fontWeight: 500 }}>{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'} - {doctor?.name}</div>
            <div style={{ color: mutedColor }}>{selectedAppointment.type} on {formatDate(selectedAppointment.date)} at {selectedAppointment.time}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: mutedColor, display: 'block', marginBottom: 4 }}>Blood Pressure</label>
                <input type="text" value={visitNoteData.bp} onChange={e => setVisitNoteData({ ...visitNoteData, bp: e.target.value })} placeholder="120/80" style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: isDark ? '#16213e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: mutedColor, display: 'block', marginBottom: 4 }}>Heart Rate</label>
                <input type="number" value={visitNoteData.hr} onChange={e => setVisitNoteData({ ...visitNoteData, hr: e.target.value })} placeholder="72" style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: isDark ? '#16213e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: mutedColor, display: 'block', marginBottom: 4 }}>Temperature</label>
                <input type="number" step="0.1" value={visitNoteData.temp} onChange={e => setVisitNoteData({ ...visitNoteData, temp: e.target.value })} placeholder="98.6" style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: isDark ? '#16213e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: mutedColor, display: 'block', marginBottom: 4 }}>Weight (lbs)</label>
                <input type="number" value={visitNoteData.weight} onChange={e => setVisitNoteData({ ...visitNoteData, weight: e.target.value })} placeholder="150" style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: isDark ? '#16213e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Diagnosis *</label>
              <textarea value={visitNoteData.diagnosis} onChange={e => setVisitNoteData({ ...visitNoteData, diagnosis: e.target.value })} rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Treatment Plan *</label>
              <textarea value={visitNoteData.treatment} onChange={e => setVisitNoteData({ ...visitNoteData, treatment: e.target.value })} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: mutedColor, display: 'block', marginBottom: 4 }}>Follow-up</label>
              <input type="text" value={visitNoteData.followUp} onChange={e => setVisitNoteData({ ...visitNoteData, followUp: e.target.value })} placeholder="e.g., 2 weeks, 3 months" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${borderColor}`, background: isDark ? '#1a1a2e' : '#fff', color: textColor, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button onClick={() => { setShowVisitNoteModal(false); setSelectedAppointment(null); }} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 8, color: textColor, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSaveVisitNote} style={{ padding: '10px 20px', background: successColor, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Save Visit Note</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: bgColor, color: textColor }}>
      {renderSidebar()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderHeader()}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'appointments' && renderAppointments()}
          {activeView === 'patients' && renderPatients()}
          {activeView === 'doctors' && renderDoctors()}
        </div>
      </div>
      {renderPatientIntakeModal()}
      {renderBookingModal()}
      {renderVisitNoteModal()}
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, padding: '12px 24px', borderRadius: 8, background: notification.type === 'warning' ? warningColor : successColor, color: '#fff', fontWeight: 500, zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
