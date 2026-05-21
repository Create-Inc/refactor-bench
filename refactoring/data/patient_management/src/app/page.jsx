import { useState, useEffect, useCallback, useMemo } from 'react';

const DEPARTMENTS = ['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology'];
const APPOINTMENT_STATUSES = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'];
const APPOINTMENT_STATUS_LABELS = { scheduled: 'Scheduled', checked_in: 'Checked In', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No Show' };
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const INSURANCE_PROVIDERS = ['BlueCross', 'Aetna', 'United', 'Cigna', 'Medicare', 'Medicaid', 'Self-Pay'];
const MEDICATION_FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Weekly'];

const DOCTORS = [
  { id: 'd1', name: 'Dr. Sarah Chen', department: 'General', avatar: '\ud83d\udc69\u200d\u2695\ufe0f' },
  { id: 'd2', name: 'Dr. James Wilson', department: 'Cardiology', avatar: '\ud83d\udc68\u200d\u2695\ufe0f' },
  { id: 'd3', name: 'Dr. Maria Garcia', department: 'Neurology', avatar: '\ud83d\udc69\u200d\u2695\ufe0f' },
  { id: 'd4', name: 'Dr. Robert Kim', department: 'Orthopedics', avatar: '\ud83d\udc68\u200d\u2695\ufe0f' },
  { id: 'd5', name: 'Dr. Emily Park', department: 'Pediatrics', avatar: '\ud83d\udc69\u200d\u2695\ufe0f' },
  { id: 'd6', name: 'Dr. Michael Brown', department: 'Dermatology', avatar: '\ud83d\udc68\u200d\u2695\ufe0f' },
];

const INITIAL_PATIENTS = [
  { id: 'p1', firstName: 'John', lastName: 'Doe', dob: '1985-03-15', gender: 'Male', bloodType: 'A+', phone: '555-0101', email: 'john.doe@email.com', insurance: 'BlueCross', insuranceId: 'BC-12345', emergencyContact: 'Jane Doe (Wife) 555-0102', allergies: ['Penicillin', 'Peanuts'], conditions: ['Hypertension', 'Type 2 Diabetes'], heightCm: 178, weightKg: 88, notes: 'Regular checkups every 3 months', createdAt: Date.now() - 86400000 * 90 },
  { id: 'p2', firstName: 'Emily', lastName: 'Smith', dob: '1992-07-22', gender: 'Female', bloodType: 'O-', phone: '555-0201', email: 'emily.smith@email.com', insurance: 'Aetna', insuranceId: 'AE-67890', emergencyContact: 'Mark Smith (Brother) 555-0202', allergies: ['Sulfa drugs'], conditions: ['Asthma'], heightCm: 165, weightKg: 62, notes: '', createdAt: Date.now() - 86400000 * 60 },
  { id: 'p3', firstName: 'Robert', lastName: 'Johnson', dob: '1958-11-03', gender: 'Male', bloodType: 'B+', phone: '555-0301', email: 'rjohnson@email.com', insurance: 'Medicare', insuranceId: 'MC-11111', emergencyContact: 'Lisa Johnson (Daughter) 555-0302', allergies: [], conditions: ['Coronary Artery Disease', 'Hyperlipidemia', 'Osteoarthritis'], heightCm: 172, weightKg: 95, notes: 'Needs wheelchair assistance', createdAt: Date.now() - 86400000 * 180 },
  { id: 'p4', firstName: 'Sofia', lastName: 'Martinez', dob: '2015-04-10', gender: 'Female', bloodType: 'AB+', phone: '555-0401', email: 'smartinez.parent@email.com', insurance: 'United', insuranceId: 'UN-22222', emergencyContact: 'Carlos Martinez (Father) 555-0402', allergies: ['Latex'], conditions: [], heightCm: 130, weightKg: 28, notes: 'Pediatric patient', createdAt: Date.now() - 86400000 * 30 },
  { id: 'p5', firstName: 'William', lastName: 'Taylor', dob: '1975-09-18', gender: 'Male', bloodType: 'O+', phone: '555-0501', email: 'wtaylor@email.com', insurance: 'Cigna', insuranceId: 'CG-33333', emergencyContact: 'Sarah Taylor (Wife) 555-0502', allergies: ['Aspirin', 'Ibuprofen'], conditions: ['Chronic Back Pain', 'Depression'], heightCm: 185, weightKg: 102, notes: 'Referred from orthopedics', createdAt: Date.now() - 86400000 * 45 },
];

const INITIAL_APPOINTMENTS = [
  { id: 'a1', patientId: 'p1', doctorId: 'd1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '09:00', duration: 30, department: 'General', reason: 'Quarterly checkup', status: 'scheduled', notes: '' },
  { id: 'a2', patientId: 'p2', doctorId: 'd1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '10:00', duration: 30, department: 'General', reason: 'Asthma follow-up', status: 'scheduled', notes: '' },
  { id: 'a3', patientId: 'p3', doctorId: 'd2', date: new Date(Date.now()).toISOString().split('T')[0], time: '14:00', duration: 45, department: 'Cardiology', reason: 'Cardiac stress test', status: 'in_progress', notes: 'Fasting required' },
  { id: 'a4', patientId: 'p5', doctorId: 'd4', date: new Date(Date.now()).toISOString().split('T')[0], time: '11:00', duration: 30, department: 'Orthopedics', reason: 'Back pain evaluation', status: 'checked_in', notes: '' },
  { id: 'a5', patientId: 'p1', doctorId: 'd2', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], time: '15:00', duration: 30, department: 'Cardiology', reason: 'Blood pressure monitoring', status: 'completed', notes: 'BP stable at 130/85' },
  { id: 'a6', patientId: 'p4', doctorId: 'd5', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], time: '09:30', duration: 30, department: 'Pediatrics', reason: 'Annual wellness check', status: 'scheduled', notes: '' },
];

const INITIAL_VITALS = [
  { id: 'v1', patientId: 'p1', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], systolic: 130, diastolic: 85, heartRate: 72, temperature: 98.6, oxygenSat: 98, respiratoryRate: 16, recordedBy: 'd1' },
  { id: 'v2', patientId: 'p1', date: new Date(Date.now() - 86400000 * 90).toISOString().split('T')[0], systolic: 145, diastolic: 92, heartRate: 78, temperature: 98.4, oxygenSat: 97, respiratoryRate: 18, recordedBy: 'd1' },
  { id: 'v3', patientId: 'p2', date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0], systolic: 118, diastolic: 75, heartRate: 68, temperature: 98.7, oxygenSat: 99, respiratoryRate: 14, recordedBy: 'd1' },
  { id: 'v4', patientId: 'p3', date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], systolic: 155, diastolic: 95, heartRate: 82, temperature: 98.8, oxygenSat: 96, respiratoryRate: 20, recordedBy: 'd2' },
  { id: 'v5', patientId: 'p5', date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], systolic: 128, diastolic: 82, heartRate: 70, temperature: 98.5, oxygenSat: 98, respiratoryRate: 16, recordedBy: 'd4' },
];

const INITIAL_PRESCRIPTIONS = [
  { id: 'rx1', patientId: 'p1', medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribedBy: 'd1', startDate: new Date(Date.now() - 86400000 * 90).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0], refillsRemaining: 2, active: true },
  { id: 'rx2', patientId: 'p1', medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribedBy: 'd1', startDate: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 120).toISOString().split('T')[0], refillsRemaining: 5, active: true },
  { id: 'rx3', patientId: 'p2', medication: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed', prescribedBy: 'd1', startDate: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 150).toISOString().split('T')[0], refillsRemaining: 3, active: true },
  { id: 'rx4', patientId: 'p3', medication: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily', prescribedBy: 'd2', startDate: new Date(Date.now() - 86400000 * 120).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0], refillsRemaining: 1, active: true },
  { id: 'rx5', patientId: 'p5', medication: 'Gabapentin', dosage: '300mg', frequency: 'Three times daily', prescribedBy: 'd4', startDate: new Date(Date.now() - 86400000 * 20).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 70).toISOString().split('T')[0], refillsRemaining: 4, active: true },
  { id: 'rx6', patientId: 'p5', medication: 'Sertraline', dosage: '50mg', frequency: 'Once daily', prescribedBy: 'd1', startDate: new Date(Date.now() - 86400000 * 45).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 135).toISOString().split('T')[0], refillsRemaining: 6, active: true },
];

export default function PatientManagement() {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [vitals, setVitals] = useState(INITIAL_VITALS);
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [activeView, setActiveView] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddVitals, setShowAddVitals] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterInsurance, setFilterInsurance] = useState('all');
  const [appointmentDateFilter, setAppointmentDateFilter] = useState('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [patientDetailTab, setPatientDetailTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pmDarkMode');
    if (saved === 'true') setIsDarkMode(true);
    const savedPatients = localStorage.getItem('pmPatients');
    if (savedPatients) { try { setPatients(JSON.parse(savedPatients)); } catch (e) { /* ignore */ } }
    const savedAppts = localStorage.getItem('pmAppointments');
    if (savedAppts) { try { setAppointments(JSON.parse(savedAppts)); } catch (e) { /* ignore */ } }
  }, []);

  useEffect(() => { localStorage.setItem('pmPatients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('pmAppointments', JSON.stringify(appointments)); }, [appointments]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setSelectedPatient(null); setShowAddPatient(false); setShowAddAppointment(false); setShowAddVitals(false); setShowAddPrescription(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const toggleTheme = () => { setIsDarkMode(prev => { const v = !prev; localStorage.setItem('pmDarkMode', String(v)); return v; }); };

  const calculateAge = useCallback((dob) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, []);

  const calculateBMI = useCallback((heightCm, weightKg) => {
    if (!heightCm || !weightKg) return null;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  }, []);

  const getBMICategory = useCallback((bmi) => {
    if (!bmi) return 'N/A';
    const val = parseFloat(bmi);
    if (val < 18.5) return 'Underweight';
    if (val < 25) return 'Normal';
    if (val < 30) return 'Overweight';
    return 'Obese';
  }, []);

  const getRiskScore = useCallback((patient) => {
    let score = 0;
    const age = calculateAge(patient.dob);
    if (age > 65) score += 3;
    else if (age > 50) score += 2;
    else if (age > 40) score += 1;
    score += patient.conditions.length;
    score += patient.allergies.length > 2 ? 2 : patient.allergies.length > 0 ? 1 : 0;
    const bmi = parseFloat(calculateBMI(patient.heightCm, patient.weightKg));
    if (bmi > 30) score += 2;
    else if (bmi > 25) score += 1;
    return Math.min(score, 10);
  }, [calculateAge, calculateBMI]);

  const getRiskLabel = (score) => {
    if (score <= 2) return 'Low';
    if (score <= 5) return 'Moderate';
    if (score <= 7) return 'High';
    return 'Critical';
  };

  const getRiskColor = (score) => {
    if (score <= 2) return '#22c55e';
    if (score <= 5) return '#eab308';
    if (score <= 7) return '#f97316';
    return '#ef4444';
  };

  const getDoctor = (id) => DOCTORS.find(d => d.id === id);
  const getPatient = (id) => patients.find(p => p.id === id);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone.includes(q) || p.insuranceId.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterInsurance !== 'all' && p.insurance !== filterInsurance) return false;
      return true;
    });
  }, [patients, searchQuery, filterInsurance]);

  const filteredAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => {
      if (filterDepartment !== 'all' && a.department !== filterDepartment) return false;
      if (appointmentStatusFilter !== 'all' && a.status !== appointmentStatusFilter) return false;
      if (appointmentDateFilter === 'today' && a.date !== today) return false;
      if (appointmentDateFilter === 'upcoming' && a.date < today) return false;
      if (appointmentDateFilter === 'past' && a.date >= today) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [appointments, filterDepartment, appointmentStatusFilter, appointmentDateFilter]);

  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter(a => a.date === today);
    const activeRx = prescriptions.filter(rx => rx.active);
    const criticalPatients = patients.filter(p => getRiskScore(p) >= 8);
    const lowRefills = activeRx.filter(rx => rx.refillsRemaining <= 1);
    return { totalPatients: patients.length, todayAppointments: todayAppts.length, activePrescriptions: activeRx.length, criticalPatients: criticalPatients.length, lowRefills: lowRefills.length };
  }, [patients, appointments, prescriptions, getRiskScore]);

  const addPatient = (data) => {
    const newPatient = { id: `p${Date.now()}`, ...data, allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(Boolean) : [], conditions: data.conditions ? data.conditions.split(',').map(c => c.trim()).filter(Boolean) : [], heightCm: parseInt(data.heightCm) || 0, weightKg: parseInt(data.weightKg) || 0, createdAt: Date.now() };
    setPatients(prev => [...prev, newPatient]);
    setShowAddPatient(false);
  };

  const updatePatient = (id, updates) => { setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); };

  const deletePatient = (id) => {
    if (window.confirm('Delete this patient and all associated records?')) {
      setPatients(prev => prev.filter(p => p.id !== id));
      setAppointments(prev => prev.filter(a => a.patientId !== id));
      setVitals(prev => prev.filter(v => v.patientId !== id));
      setPrescriptions(prev => prev.filter(rx => rx.patientId !== id));
      setSelectedPatient(null);
    }
  };

  const addAppointment = (data) => {
    const newAppt = { id: `a${Date.now()}`, ...data, status: 'scheduled' };
    setAppointments(prev => [...prev, newAppt]);
    setShowAddAppointment(false);
  };

  const updateAppointmentStatus = (id, status) => { setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a)); };
  const cancelAppointment = (id) => { if (window.confirm('Cancel this appointment?')) { updateAppointmentStatus(id, 'cancelled'); } };

  const addVitalRecord = (data) => {
    const newVital = { id: `v${Date.now()}`, ...data, systolic: parseInt(data.systolic), diastolic: parseInt(data.diastolic), heartRate: parseInt(data.heartRate), temperature: parseFloat(data.temperature), oxygenSat: parseInt(data.oxygenSat), respiratoryRate: parseInt(data.respiratoryRate) };
    setVitals(prev => [...prev, newVital]);
    setShowAddVitals(false);
  };

  const addPrescription = (data) => {
    const newRx = { id: `rx${Date.now()}`, ...data, refillsRemaining: parseInt(data.refillsRemaining) || 0, active: true };
    setPrescriptions(prev => [...prev, newRx]);
    setShowAddPrescription(false);
  };

  const discontinuePrescription = (id) => { if (window.confirm('Discontinue this prescription?')) { setPrescriptions(prev => prev.map(rx => rx.id === id ? { ...rx, active: false } : rx)); } };

  const bgColor = isDarkMode ? '#1a1a2e' : '#f5f7fa';
  const cardBg = isDarkMode ? '#16213e' : '#ffffff';
  const textColor = isDarkMode ? '#e0e0e0' : '#333333';
  const secondaryText = isDarkMode ? '#a0a0a0' : '#666666';
  const borderColor = isDarkMode ? '#2a2a4a' : '#e0e0e0';
  const accentColor = '#0891b2';

  const patientVitals = selectedPatient ? vitals.filter(v => v.patientId === selectedPatient.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const patientAppointments = selectedPatient ? appointments.filter(a => a.patientId === selectedPatient.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const patientPrescriptions = selectedPatient ? prescriptions.filter(rx => rx.patientId === selectedPatient.id) : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', backgroundColor: isDarkMode ? '#0f0f23' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${borderColor}` }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: accentColor }}>MedChart</h1>
          <div style={{ fontSize: '11px', color: secondaryText, marginTop: '2px' }}>Patient Management</div>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'dashboard', icon: '\ud83d\udcca', label: 'Dashboard' },
            { id: 'patients', icon: '\ud83d\udc65', label: 'Patients' },
            { id: 'appointments', icon: '\ud83d\udcc5', label: 'Appointments' },
            { id: 'prescriptions', icon: '\ud83d\udc8a', label: 'Prescriptions' },
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setSelectedPatient(null); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', marginBottom: '4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: activeView === item.id ? (isDarkMode ? '#1e2a4a' : '#ecfeff') : 'transparent', color: activeView === item.id ? accentColor : textColor, fontWeight: activeView === item.id ? 600 : 400, textAlign: 'left' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: `1px solid ${borderColor}` }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: secondaryText }} aria-label="Toggle theme">
            <span>{isDarkMode ? '\u2600\ufe0f' : '\ud83c\udf19'}</span><span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input type="text" placeholder="Search patients by name, email, phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, maxWidth: '400px', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor }} aria-label="Search patients" />
          {activeView === 'patients' && (
            <select value={filterInsurance} onChange={e => setFilterInsurance(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor }} aria-label="Filter by insurance">
              <option value="all">All Insurance</option>
              {INSURANCE_PROVIDERS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          )}
          {activeView === 'appointments' && (
            <>
              <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor }} aria-label="Filter by department">
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={appointmentStatusFilter} onChange={e => setAppointmentStatusFilter(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor }} aria-label="Filter by status">
                <option value="all">All Statuses</option>
                {APPOINTMENT_STATUSES.map(s => <option key={s} value={s}>{APPOINTMENT_STATUS_LABELS[s]}</option>)}
              </select>
              <select value={appointmentDateFilter} onChange={e => setAppointmentDateFilter(e.target.value)} style={{ padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor }} aria-label="Filter by date">
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeView === 'patients' && <button onClick={() => setShowAddPatient(true)} style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>+ New Patient</button>}
            {activeView === 'appointments' && <button onClick={() => setShowAddAppointment(true)} style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>+ New Appointment</button>}
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Dashboard Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Patients', value: dashboardStats.totalPatients, icon: '\ud83d\udc65', color: '#0891b2' },
                  { label: "Today's Appointments", value: dashboardStats.todayAppointments, icon: '\ud83d\udcc5', color: '#8b5cf6' },
                  { label: 'Active Prescriptions', value: dashboardStats.activePrescriptions, icon: '\ud83d\udc8a', color: '#22c55e' },
                  { label: 'Critical Risk Patients', value: dashboardStats.criticalPatients, icon: '\u26a0\ufe0f', color: '#ef4444' },
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
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Patient Risk Distribution</h3>
                  {['Low', 'Moderate', 'High', 'Critical'].map(level => {
                    const count = patients.filter(p => getRiskLabel(getRiskScore(p)) === level).length;
                    const pct = patients.length > 0 ? (count / patients.length) * 100 : 0;
                    const color = level === 'Low' ? '#22c55e' : level === 'Moderate' ? '#eab308' : level === 'High' ? '#f97316' : '#ef4444';
                    return (
                      <div key={level} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{level}</span><span style={{ color: secondaryText }}>{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Low Refill Alerts</h3>
                  {prescriptions.filter(rx => rx.active && rx.refillsRemaining <= 1).length === 0 ? (
                    <div style={{ color: secondaryText, fontSize: '13px' }}>No low refill alerts</div>
                  ) : (
                    prescriptions.filter(rx => rx.active && rx.refillsRemaining <= 1).map(rx => {
                      const patient = getPatient(rx.patientId);
                      return (
                        <div key={rx.id} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                          <div style={{ fontWeight: 500 }}>{patient?.firstName} {patient?.lastName}</div>
                          <div style={{ color: secondaryText }}>{rx.medication} - {rx.refillsRemaining} refill{rx.refillsRemaining !== 1 ? 's' : ''} remaining</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Patients View */}
          {activeView === 'patients' && !selectedPatient && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Patients ({filteredPatients.length})</h2>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}`, textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Patient</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Age</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Blood Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Insurance</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>BMI</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Risk</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Conditions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map(patient => {
                      const bmi = calculateBMI(patient.heightCm, patient.weightKg);
                      const risk = getRiskScore(patient);
                      return (
                        <tr key={patient.id} onClick={() => { setSelectedPatient(patient); setPatientDetailTab('overview'); }} style={{ borderBottom: `1px solid ${borderColor}`, cursor: 'pointer' }}>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ fontWeight: 500 }}>{patient.firstName} {patient.lastName}</div>
                            <div style={{ fontSize: '11px', color: secondaryText }}>{patient.email}</div>
                          </td>
                          <td style={{ padding: '10px 16px' }}>{calculateAge(patient.dob)}</td>
                          <td style={{ padding: '10px 16px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: isDarkMode ? '#2a2a4a' : '#fef2f2', fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>{patient.bloodType}</span></td>
                          <td style={{ padding: '10px 16px' }}>{patient.insurance}</td>
                          <td style={{ padding: '10px 16px' }}><span title={getBMICategory(bmi)}>{bmi}</span></td>
                          <td style={{ padding: '10px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: getRiskColor(risk) }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getRiskColor(risk) }} />{getRiskLabel(risk)}</span></td>
                          <td style={{ padding: '10px 16px' }}><div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{patient.conditions.slice(0, 2).map(c => <span key={c} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f0fdf4', color: '#16a34a' }}>{c}</span>)}{patient.conditions.length > 2 && <span style={{ fontSize: '10px', color: secondaryText }}>+{patient.conditions.length - 2}</span>}</div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Patient Detail View */}
          {activeView === 'patients' && selectedPatient && (
            <div>
              <button onClick={() => setSelectedPatient(null)} style={{ marginBottom: '16px', padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>&larr; Back to Patients</button>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '24px', border: `1px solid ${borderColor}`, marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px' }}>{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <div style={{ fontSize: '13px', color: secondaryText }}>{selectedPatient.gender} &middot; {calculateAge(selectedPatient.dob)} years &middot; DOB: {selectedPatient.dob} &middot; {selectedPatient.bloodType}</div>
                    <div style={{ fontSize: '13px', color: secondaryText, marginTop: '4px' }}>{selectedPatient.phone} &middot; {selectedPatient.email}</div>
                    <div style={{ fontSize: '12px', color: secondaryText, marginTop: '4px' }}>Insurance: {selectedPatient.insurance} ({selectedPatient.insuranceId})</div>
                    <div style={{ fontSize: '12px', color: secondaryText, marginTop: '2px' }}>Emergency: {selectedPatient.emergencyContact}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: '8px', backgroundColor: isDarkMode ? '#1e2a4a' : '#f0fdfa' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: getRiskColor(getRiskScore(selectedPatient)) }}>{getRiskScore(selectedPatient)}/10</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>Risk Score</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: '8px', backgroundColor: isDarkMode ? '#1e2a4a' : '#f0fdfa' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: accentColor }}>{calculateBMI(selectedPatient.heightCm, selectedPatient.weightKg)}</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>BMI ({getBMICategory(calculateBMI(selectedPatient.heightCm, selectedPatient.weightKg))})</div>
                    </div>
                    <button onClick={() => deletePatient(selectedPatient.id)} style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                  </div>
                </div>
                {selectedPatient.allergies.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: isDarkMode ? '#3b1818' : '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>Allergies: </span>
                    <span style={{ fontSize: '12px', color: '#ef4444' }}>{selectedPatient.allergies.join(', ')}</span>
                  </div>
                )}
                {selectedPatient.conditions.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedPatient.conditions.map(c => <span key={c} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', backgroundColor: isDarkMode ? '#1e2a4a' : '#ecfeff', color: accentColor }}>{c}</span>)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {['overview', 'vitals', 'appointments', 'prescriptions'].map(tab => (
                  <button key={tab} onClick={() => setPatientDetailTab(tab)} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: '13px', fontWeight: patientDetailTab === tab ? 600 : 400, backgroundColor: patientDetailTab === tab ? cardBg : 'transparent', color: patientDetailTab === tab ? accentColor : secondaryText, borderBottom: patientDetailTab === tab ? `2px solid ${accentColor}` : 'none' }}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {patientDetailTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Physical Information</h3>
                    <div style={{ fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div><span style={{ color: secondaryText }}>Height: </span>{selectedPatient.heightCm} cm</div>
                      <div><span style={{ color: secondaryText }}>Weight: </span>{selectedPatient.weightKg} kg</div>
                      <div><span style={{ color: secondaryText }}>BMI: </span>{calculateBMI(selectedPatient.heightCm, selectedPatient.weightKg)}</div>
                      <div><span style={{ color: secondaryText }}>Category: </span>{getBMICategory(calculateBMI(selectedPatient.heightCm, selectedPatient.weightKg))}</div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Latest Vitals</h3>
                    {patientVitals.length > 0 ? (
                      <div style={{ fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div><span style={{ color: secondaryText }}>BP: </span>{patientVitals[0].systolic}/{patientVitals[0].diastolic} mmHg</div>
                        <div><span style={{ color: secondaryText }}>Heart Rate: </span>{patientVitals[0].heartRate} bpm</div>
                        <div><span style={{ color: secondaryText }}>Temp: </span>{patientVitals[0].temperature}&deg;F</div>
                        <div><span style={{ color: secondaryText }}>O2 Sat: </span>{patientVitals[0].oxygenSat}%</div>
                        <div><span style={{ color: secondaryText }}>Resp Rate: </span>{patientVitals[0].respiratoryRate}/min</div>
                        <div><span style={{ color: secondaryText }}>Date: </span>{patientVitals[0].date}</div>
                      </div>
                    ) : <div style={{ color: secondaryText, fontSize: '13px' }}>No vitals recorded</div>}
                  </div>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Notes</h3>
                    </div>
                    <textarea value={selectedPatient.notes || ''} onChange={e => { updatePatient(selectedPatient.id, { notes: e.target.value }); setSelectedPatient(prev => ({ ...prev, notes: e.target.value })); }} rows={3} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} placeholder="Add patient notes..." />
                  </div>
                </div>
              )}

              {patientDetailTab === 'vitals' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Vital Signs History</h3>
                    <button onClick={() => setShowAddVitals(true)} style={{ padding: '6px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>+ Record Vitals</button>
                  </div>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${borderColor}`, textAlign: 'left' }}>
                          <th style={{ padding: '10px 14px', color: secondaryText }}>Date</th>
                          <th style={{ padding: '10px 14px', color: secondaryText }}>BP (mmHg)</th>
                          <th style={{ padding: '10px 14px', color: secondaryText }}>Heart Rate</th>
                          <th style={{ padding: '10px 14px', color: secondaryText }}>Temp (&deg;F)</th>
                          <th style={{ padding: '10px 14px', color: secondaryText }}>O2 Sat</th>
                          <th style={{ padding: '10px 14px', color: secondaryText }}>Resp Rate</th>
                          <th style={{ padding: '10px 14px', color: secondaryText }}>Recorded By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientVitals.map(v => (
                          <tr key={v.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                            <td style={{ padding: '10px 14px' }}>{v.date}</td>
                            <td style={{ padding: '10px 14px', color: v.systolic >= 140 || v.diastolic >= 90 ? '#ef4444' : textColor, fontWeight: v.systolic >= 140 || v.diastolic >= 90 ? 600 : 400 }}>{v.systolic}/{v.diastolic}</td>
                            <td style={{ padding: '10px 14px' }}>{v.heartRate} bpm</td>
                            <td style={{ padding: '10px 14px', color: v.temperature >= 100.4 ? '#ef4444' : textColor }}>{v.temperature}</td>
                            <td style={{ padding: '10px 14px', color: v.oxygenSat < 95 ? '#ef4444' : textColor }}>{v.oxygenSat}%</td>
                            <td style={{ padding: '10px 14px' }}>{v.respiratoryRate}/min</td>
                            <td style={{ padding: '10px 14px' }}>{getDoctor(v.recordedBy)?.name || 'Unknown'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {patientVitals.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: secondaryText }}>No vitals recorded</div>}
                  </div>
                </div>
              )}

              {patientDetailTab === 'appointments' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Appointment History</h3>
                    <button onClick={() => setShowAddAppointment(true)} style={{ padding: '6px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>+ Schedule Appointment</button>
                  </div>
                  {patientAppointments.map(appt => {
                    const doctor = getDoctor(appt.doctorId);
                    return (
                      <div key={appt.id} style={{ backgroundColor: cardBg, borderRadius: '8px', padding: '14px 16px', border: `1px solid ${borderColor}`, marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{appt.reason}</div>
                          <div style={{ fontSize: '12px', color: secondaryText, marginTop: '2px' }}>{doctor?.avatar} {doctor?.name} &middot; {appt.department} &middot; {appt.date} at {appt.time} ({appt.duration}min)</div>
                          {appt.notes && <div style={{ fontSize: '12px', color: secondaryText, marginTop: '2px' }}>Note: {appt.notes}</div>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: appt.status === 'completed' ? '#dcfce7' : appt.status === 'cancelled' ? '#fef2f2' : (isDarkMode ? '#2a2a4a' : '#f3f4f6'), color: appt.status === 'completed' ? '#16a34a' : appt.status === 'cancelled' ? '#ef4444' : secondaryText }}>{APPOINTMENT_STATUS_LABELS[appt.status]}</span>
                          {appt.status === 'scheduled' && <button onClick={() => cancelAppointment(appt.id)} style={{ fontSize: '11px', padding: '3px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444' }}>Cancel</button>}
                          {appt.status === 'scheduled' && <button onClick={() => updateAppointmentStatus(appt.id, 'checked_in')} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Check In</button>}
                          {appt.status === 'checked_in' && <button onClick={() => updateAppointmentStatus(appt.id, 'in_progress')} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Start</button>}
                          {appt.status === 'in_progress' && <button onClick={() => updateAppointmentStatus(appt.id, 'completed')} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Complete</button>}
                        </div>
                      </div>
                    );
                  })}
                  {patientAppointments.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: secondaryText, backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}` }}>No appointments</div>}
                </div>
              )}

              {patientDetailTab === 'prescriptions' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Prescriptions</h3>
                    <button onClick={() => setShowAddPrescription(true)} style={{ padding: '6px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>+ Add Prescription</button>
                  </div>
                  {patientPrescriptions.map(rx => {
                    const doctor = getDoctor(rx.prescribedBy);
                    return (
                      <div key={rx.id} style={{ backgroundColor: cardBg, borderRadius: '8px', padding: '14px 16px', border: `1px solid ${borderColor}`, marginBottom: '8px', opacity: rx.active ? 1 : 0.6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '14px' }}>{rx.medication} - {rx.dosage}</div>
                            <div style={{ fontSize: '12px', color: secondaryText, marginTop: '2px' }}>{rx.frequency} &middot; Prescribed by {doctor?.name}</div>
                            <div style={{ fontSize: '12px', color: secondaryText, marginTop: '2px' }}>{rx.startDate} to {rx.endDate} &middot; {rx.refillsRemaining} refills remaining</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: rx.active ? '#dcfce7' : '#fef2f2', color: rx.active ? '#16a34a' : '#ef4444' }}>{rx.active ? 'Active' : 'Discontinued'}</span>
                            {rx.active && <button onClick={() => discontinuePrescription(rx.id)} style={{ fontSize: '11px', padding: '3px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444' }}>Discontinue</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {patientPrescriptions.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: secondaryText, backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}` }}>No prescriptions</div>}
                </div>
              )}
            </div>
          )}

          {/* Appointments View */}
          {activeView === 'appointments' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Appointments ({filteredAppointments.length})</h2>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}`, textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Date & Time</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Patient</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Doctor</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Department</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Reason</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Status</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(appt => {
                      const patient = getPatient(appt.patientId);
                      const doctor = getDoctor(appt.doctorId);
                      return (
                        <tr key={appt.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <td style={{ padding: '10px 16px' }}><div>{appt.date}</div><div style={{ fontSize: '11px', color: secondaryText }}>{appt.time} ({appt.duration}min)</div></td>
                          <td style={{ padding: '10px 16px', cursor: 'pointer', color: accentColor }} onClick={() => { setActiveView('patients'); setSelectedPatient(patient); setPatientDetailTab('overview'); }}>{patient?.firstName} {patient?.lastName}</td>
                          <td style={{ padding: '10px 16px' }}>{doctor?.avatar} {doctor?.name}</td>
                          <td style={{ padding: '10px 16px' }}>{appt.department}</td>
                          <td style={{ padding: '10px 16px' }}>{appt.reason}</td>
                          <td style={{ padding: '10px 16px' }}><span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: appt.status === 'completed' ? '#dcfce7' : appt.status === 'cancelled' ? '#fef2f2' : (isDarkMode ? '#2a2a4a' : '#f3f4f6'), color: appt.status === 'completed' ? '#16a34a' : appt.status === 'cancelled' ? '#ef4444' : secondaryText }}>{APPOINTMENT_STATUS_LABELS[appt.status]}</span></td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {appt.status === 'scheduled' && <button onClick={() => updateAppointmentStatus(appt.id, 'checked_in')} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Check In</button>}
                              {appt.status === 'checked_in' && <button onClick={() => updateAppointmentStatus(appt.id, 'in_progress')} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Start</button>}
                              {appt.status === 'in_progress' && <button onClick={() => updateAppointmentStatus(appt.id, 'completed')} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Complete</button>}
                              {appt.status === 'scheduled' && <button onClick={() => cancelAppointment(appt.id)} style={{ fontSize: '11px', padding: '3px 8px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444' }}>Cancel</button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredAppointments.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: secondaryText }}>No appointments match filters</div>}
              </div>
            </div>
          )}

          {/* Prescriptions View */}
          {activeView === 'prescriptions' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>All Prescriptions</h2>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}`, textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Patient</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Medication</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Dosage</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Frequency</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Prescribed By</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Period</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Refills</th>
                      <th style={{ padding: '12px 16px', color: secondaryText }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map(rx => {
                      const patient = getPatient(rx.patientId);
                      const doctor = getDoctor(rx.prescribedBy);
                      return (
                        <tr key={rx.id} style={{ borderBottom: `1px solid ${borderColor}`, opacity: rx.active ? 1 : 0.5 }}>
                          <td style={{ padding: '10px 16px', cursor: 'pointer', color: accentColor }} onClick={() => { setActiveView('patients'); setSelectedPatient(patient); setPatientDetailTab('prescriptions'); }}>{patient?.firstName} {patient?.lastName}</td>
                          <td style={{ padding: '10px 16px', fontWeight: 500 }}>{rx.medication}</td>
                          <td style={{ padding: '10px 16px' }}>{rx.dosage}</td>
                          <td style={{ padding: '10px 16px' }}>{rx.frequency}</td>
                          <td style={{ padding: '10px 16px' }}>{doctor?.name}</td>
                          <td style={{ padding: '10px 16px' }}><div style={{ fontSize: '12px' }}>{rx.startDate}</div><div style={{ fontSize: '11px', color: secondaryText }}>to {rx.endDate}</div></td>
                          <td style={{ padding: '10px 16px', color: rx.refillsRemaining <= 1 ? '#ef4444' : textColor, fontWeight: rx.refillsRemaining <= 1 ? 600 : 400 }}>{rx.refillsRemaining}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: rx.active ? '#dcfce7' : '#fef2f2', color: rx.active ? '#16a34a' : '#ef4444' }}>{rx.active ? 'Active' : 'Discontinued'}</span>
                              {rx.active && <button onClick={() => discontinuePrescription(rx.id)} style={{ fontSize: '10px', padding: '2px 6px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent', color: '#ef4444' }}>Stop</button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowAddPatient(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Add New Patient</h2>
              <button onClick={() => setShowAddPatient(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>&times;</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); addPatient({ firstName: fd.get('firstName'), lastName: fd.get('lastName'), dob: fd.get('dob'), gender: fd.get('gender'), bloodType: fd.get('bloodType'), phone: fd.get('phone'), email: fd.get('email'), insurance: fd.get('insurance'), insuranceId: fd.get('insuranceId'), emergencyContact: fd.get('emergencyContact'), allergies: fd.get('allergies'), conditions: fd.get('conditions'), heightCm: fd.get('heightCm'), weightKg: fd.get('weightKg'), notes: fd.get('notes') }); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>First Name *</label><input name="firstName" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Last Name *</label><input name="lastName" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Date of Birth *</label><input name="dob" type="date" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Gender</label><select name="gender" defaultValue="Male" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Blood Type</label><select name="bloodType" defaultValue="O+" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>{BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Phone *</label><input name="phone" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Email</label><input name="email" type="email" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Insurance</label><select name="insurance" defaultValue="Self-Pay" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>{INSURANCE_PROVIDERS.map(i => <option key={i}>{i}</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Insurance ID</label><input name="insuranceId" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Height (cm)</label><input name="heightCm" type="number" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Weight (kg)</label><input name="weightKg" type="number" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Emergency Contact</label><input name="emergencyContact" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Allergies (comma-separated)</label><input name="allergies" placeholder="e.g. Penicillin, Peanuts" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Conditions (comma-separated)</label><input name="conditions" placeholder="e.g. Hypertension, Diabetes" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Notes</label><textarea name="notes" rows={2} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddPatient(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Add Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddAppointment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowAddAppointment(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Schedule Appointment</h2>
              <button onClick={() => setShowAddAppointment(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>&times;</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); addAppointment({ patientId: selectedPatient?.id || fd.get('patientId'), doctorId: fd.get('doctorId'), date: fd.get('date'), time: fd.get('time'), duration: parseInt(fd.get('duration')), department: fd.get('department'), reason: fd.get('reason'), notes: fd.get('notes') || '' }); }}>
              {!selectedPatient && <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Patient *</label><select name="patientId" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}><option value="">Select patient...</option>{patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Doctor *</label><select name="doctorId" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>{DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.department})</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Department *</label><select name="department" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Time *</label><input name="time" type="time" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Duration (min)</label><input name="duration" type="number" defaultValue="30" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Reason *</label><input name="reason" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Notes</label><input name="notes" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddAppointment(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vitals Modal */}
      {showAddVitals && selectedPatient && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowAddVitals(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Record Vitals for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <button onClick={() => setShowAddVitals(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>&times;</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); addVitalRecord({ patientId: selectedPatient.id, date: fd.get('date'), systolic: fd.get('systolic'), diastolic: fd.get('diastolic'), heartRate: fd.get('heartRate'), temperature: fd.get('temperature'), oxygenSat: fd.get('oxygenSat'), respiratoryRate: fd.get('respiratoryRate'), recordedBy: fd.get('recordedBy') }); }}>
              <div style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Date *</label><input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Systolic (mmHg) *</label><input name="systolic" type="number" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Diastolic (mmHg) *</label><input name="diastolic" type="number" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Heart Rate (bpm) *</label><input name="heartRate" type="number" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Temperature (&deg;F) *</label><input name="temperature" type="number" step="0.1" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>O2 Saturation (%) *</label><input name="oxygenSat" type="number" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Resp Rate (/min) *</label><input name="respiratoryRate" type="number" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Recorded By</label><select name="recordedBy" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>{DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddVitals(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Save Vitals</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Prescription Modal */}
      {showAddPrescription && selectedPatient && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowAddPrescription(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Add Prescription for {selectedPatient.firstName} {selectedPatient.lastName}</h2>
              <button onClick={() => setShowAddPrescription(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>&times;</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); addPrescription({ patientId: selectedPatient.id, medication: fd.get('medication'), dosage: fd.get('dosage'), frequency: fd.get('frequency'), prescribedBy: fd.get('prescribedBy'), startDate: fd.get('startDate'), endDate: fd.get('endDate'), refillsRemaining: fd.get('refillsRemaining') }); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Medication *</label><input name="medication" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Dosage *</label><input name="dosage" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Frequency</label><select name="frequency" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>{MEDICATION_FREQUENCIES.map(f => <option key={f}>{f}</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Prescribed By</label><select name="prescribedBy" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>{DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Start Date *</label><input name="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>End Date *</label><input name="endDate" type="date" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Refills</label><input name="refillsRemaining" type="number" defaultValue="0" min="0" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddPrescription(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Add Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
