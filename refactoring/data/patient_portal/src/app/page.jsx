import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const SPECIALTIES = [
  "cardiology",
  "dermatology",
  "neurology",
  "orthopedics",
  "pediatrics",
  "general",
];

const STATUS_COLORS = {
  scheduled: "#3b82f6",
  completed: "#22c55e",
  cancelled: "#ef4444",
  pending: "#eab308",
};

const PRIORITY_COLORS = {
  normal: "#6b7280",
  urgent: "#f97316",
  critical: "#ef4444",
};

const MOCK_DOCTORS = [
  {
    id: "d1",
    name: "Dr. Sarah Chen",
    avatar: "👩‍⚕️",
    specialty: "cardiology",
    rating: 4.9,
    patientsCount: 340,
    availableDays: ["Mon", "Wed", "Fri"],
  },
  {
    id: "d2",
    name: "Dr. Michael Rivera",
    avatar: "👨‍⚕️",
    specialty: "dermatology",
    rating: 4.7,
    patientsCount: 280,
    availableDays: ["Tue", "Thu"],
  },
  {
    id: "d3",
    name: "Dr. Emily Watson",
    avatar: "👩‍⚕️",
    specialty: "neurology",
    rating: 4.8,
    patientsCount: 195,
    availableDays: ["Mon", "Tue", "Thu"],
  },
  {
    id: "d4",
    name: "Dr. James Park",
    avatar: "👨‍⚕️",
    specialty: "orthopedics",
    rating: 4.6,
    patientsCount: 420,
    availableDays: ["Wed", "Fri"],
  },
  {
    id: "d5",
    name: "Dr. Lisa Thompson",
    avatar: "👩‍⚕️",
    specialty: "pediatrics",
    rating: 4.9,
    patientsCount: 510,
    availableDays: ["Mon", "Wed", "Thu", "Fri"],
  },
  {
    id: "d6",
    name: "Dr. Robert Kim",
    avatar: "👨‍⚕️",
    specialty: "general",
    rating: 4.5,
    patientsCount: 620,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  },
];

const INITIAL_APPOINTMENTS = [
  {
    id: "a1",
    doctorId: "d1",
    date: "2026-05-15",
    time: "09:00",
    type: "Check-up",
    status: "scheduled",
    notes: "Annual cardiac screening",
    priority: "normal",
  },
  {
    id: "a2",
    doctorId: "d3",
    date: "2026-04-20",
    time: "14:30",
    type: "Follow-up",
    status: "completed",
    notes: "Headache follow-up",
    priority: "normal",
  },
  {
    id: "a3",
    doctorId: "d2",
    date: "2026-05-22",
    time: "11:00",
    type: "Consultation",
    status: "scheduled",
    notes: "Skin rash evaluation",
    priority: "urgent",
  },
  {
    id: "a4",
    doctorId: "d6",
    date: "2026-03-10",
    time: "10:00",
    type: "Check-up",
    status: "completed",
    notes: "General physical exam",
    priority: "normal",
  },
  {
    id: "a5",
    doctorId: "d4",
    date: "2026-06-01",
    time: "15:00",
    type: "Consultation",
    status: "pending",
    notes: "Knee pain assessment",
    priority: "normal",
  },
];

const INITIAL_PRESCRIPTIONS = [
  {
    id: "p1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    doctorId: "d1",
    startDate: "2026-01-15",
    endDate: "2026-07-15",
    refillsLeft: 3,
    status: "active",
    instructions: "Take in the morning with water",
  },
  {
    id: "p2",
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "As needed",
    doctorId: "d4",
    startDate: "2026-03-10",
    endDate: "2026-04-10",
    refillsLeft: 0,
    status: "expired",
    instructions: "Take with food, max 3 per day",
  },
  {
    id: "p3",
    name: "Cetirizine",
    dosage: "10mg",
    frequency: "Once daily",
    doctorId: "d2",
    startDate: "2026-04-01",
    endDate: "2026-10-01",
    refillsLeft: 5,
    status: "active",
    instructions: "Take at bedtime",
  },
  {
    id: "p4",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    doctorId: "d6",
    startDate: "2026-02-01",
    endDate: "2026-08-01",
    refillsLeft: 2,
    status: "active",
    instructions: "Take with meals",
  },
];

const INITIAL_LAB_RESULTS = [
  {
    id: "lr1",
    testName: "Complete Blood Count",
    date: "2026-04-18",
    doctorId: "d1",
    status: "normal",
    values: [
      {
        name: "WBC",
        value: "7.2",
        unit: "K/uL",
        range: "4.5-11.0",
        flag: "normal",
      },
      {
        name: "RBC",
        value: "4.8",
        unit: "M/uL",
        range: "4.2-5.9",
        flag: "normal",
      },
      {
        name: "Hemoglobin",
        value: "14.2",
        unit: "g/dL",
        range: "12.0-17.5",
        flag: "normal",
      },
    ],
  },
  {
    id: "lr2",
    testName: "Lipid Panel",
    date: "2026-04-18",
    doctorId: "d1",
    status: "abnormal",
    values: [
      {
        name: "Total Cholesterol",
        value: "245",
        unit: "mg/dL",
        range: "<200",
        flag: "high",
      },
      { name: "HDL", value: "42", unit: "mg/dL", range: ">40", flag: "normal" },
      { name: "LDL", value: "168", unit: "mg/dL", range: "<100", flag: "high" },
      {
        name: "Triglycerides",
        value: "175",
        unit: "mg/dL",
        range: "<150",
        flag: "high",
      },
    ],
  },
  {
    id: "lr3",
    testName: "Metabolic Panel",
    date: "2026-03-05",
    doctorId: "d6",
    status: "normal",
    values: [
      {
        name: "Glucose",
        value: "95",
        unit: "mg/dL",
        range: "70-100",
        flag: "normal",
      },
      {
        name: "Creatinine",
        value: "1.0",
        unit: "mg/dL",
        range: "0.7-1.3",
        flag: "normal",
      },
    ],
  },
];

const INITIAL_MESSAGES = [
  {
    id: "m1",
    doctorId: "d1",
    subject: "Lab Results Review",
    messages: [
      {
        sender: "doctor",
        text: "Your CBC results look good. However, your cholesterol levels are elevated. I recommend dietary changes.",
        timestamp: Date.now() - 86400000 * 2,
      },
      {
        sender: "patient",
        text: "Thank you, Dr. Chen. Should I schedule a follow-up?",
        timestamp: Date.now() - 86400000,
      },
    ],
    unread: true,
    lastUpdated: Date.now() - 86400000,
  },
  {
    id: "m2",
    doctorId: "d6",
    subject: "Prescription Renewal",
    messages: [
      {
        sender: "doctor",
        text: "Your Metformin prescription has been renewed for another 6 months.",
        timestamp: Date.now() - 86400000 * 5,
      },
    ],
    unread: false,
    lastUpdated: Date.now() - 86400000 * 5,
  },
  {
    id: "m3",
    doctorId: "d2",
    subject: "Upcoming Appointment Prep",
    messages: [
      {
        sender: "doctor",
        text: "Please avoid any new skin products 48 hours before your appointment.",
        timestamp: Date.now() - 86400000 * 3,
      },
    ],
    unread: true,
    lastUpdated: Date.now() - 86400000 * 3,
  },
];

const INITIAL_BILLS = [
  {
    id: "b1",
    description: "Cardiac Screening - Dr. Chen",
    date: "2026-04-20",
    amount: 350.0,
    insuranceCovered: 280.0,
    patientOwes: 70.0,
    status: "paid",
    appointmentId: "a2",
  },
  {
    id: "b2",
    description: "General Physical - Dr. Kim",
    date: "2026-03-10",
    amount: 200.0,
    insuranceCovered: 160.0,
    patientOwes: 40.0,
    status: "paid",
    appointmentId: "a4",
  },
  {
    id: "b3",
    description: "Lab Work - Blood Panel",
    date: "2026-04-18",
    amount: 450.0,
    insuranceCovered: 360.0,
    patientOwes: 90.0,
    status: "pending",
    appointmentId: null,
  },
  {
    id: "b4",
    description: "Dermatology Consultation",
    date: "2026-05-22",
    amount: 275.0,
    insuranceCovered: 220.0,
    patientOwes: 55.0,
    status: "upcoming",
    appointmentId: "a3",
  },
];

const INITIAL_VITALS = [
  {
    id: "v1",
    date: "2026-04-20",
    bloodPressure: "128/82",
    heartRate: 72,
    temperature: 98.6,
    weight: 175,
    oxygenSaturation: 98,
    recordedBy: "d6",
    notes: "Slightly elevated BP",
  },
  {
    id: "v2",
    date: "2026-03-10",
    bloodPressure: "135/88",
    heartRate: 78,
    temperature: 98.4,
    weight: 177,
    oxygenSaturation: 97,
    recordedBy: "d1",
    notes: "BP trending high, monitor closely",
  },
  {
    id: "v3",
    date: "2026-01-15",
    bloodPressure: "122/78",
    heartRate: 68,
    temperature: 98.7,
    weight: 173,
    oxygenSaturation: 99,
    recordedBy: "d6",
    notes: "All vitals within normal range",
  },
  {
    id: "v4",
    date: "2025-11-20",
    bloodPressure: "118/76",
    heartRate: 70,
    temperature: 98.5,
    weight: 172,
    oxygenSaturation: 98,
    recordedBy: "d1",
    notes: "",
  },
  {
    id: "v5",
    date: "2025-09-05",
    bloodPressure: "120/80",
    heartRate: 74,
    temperature: 98.6,
    weight: 174,
    oxygenSaturation: 98,
    recordedBy: "d6",
    notes: "Baseline vitals",
  },
];

const MEDICAL_HISTORY = [
  {
    id: "mh1",
    date: "2026-04-18",
    type: "lab",
    title: "Blood Work Completed",
    description: "CBC and Lipid Panel — abnormal cholesterol levels detected",
    relatedId: "lr2",
    icon: "🔬",
  },
  {
    id: "mh2",
    date: "2026-04-20",
    type: "appointment",
    title: "Follow-up with Dr. Watson",
    description:
      "Headache follow-up — symptoms resolved, no further treatment needed",
    relatedId: "a2",
    icon: "📅",
  },
  {
    id: "mh3",
    date: "2026-03-10",
    type: "appointment",
    title: "General Physical Exam",
    description: "Annual physical with Dr. Kim — all clear",
    relatedId: "a4",
    icon: "📅",
  },
  {
    id: "mh4",
    date: "2026-02-01",
    type: "prescription",
    title: "Metformin Prescribed",
    description:
      "Started Metformin 500mg twice daily for blood sugar management",
    relatedId: "p4",
    icon: "💊",
  },
  {
    id: "mh5",
    date: "2026-01-15",
    type: "prescription",
    title: "Lisinopril Prescribed",
    description: "Started Lisinopril 10mg daily for blood pressure management",
    relatedId: "p1",
    icon: "💊",
  },
  {
    id: "mh6",
    date: "2025-12-10",
    type: "procedure",
    title: "Flu Vaccination",
    description: "Annual flu shot administered",
    relatedId: null,
    icon: "💉",
  },
  {
    id: "mh7",
    date: "2025-11-20",
    type: "lab",
    title: "Routine Blood Work",
    description: "All results within normal ranges",
    relatedId: null,
    icon: "🔬",
  },
  {
    id: "mh8",
    date: "2025-09-05",
    type: "appointment",
    title: "Initial Consultation",
    description:
      "First visit with Dr. Kim — established care, baseline vitals recorded",
    relatedId: null,
    icon: "📅",
  },
];

const VITAL_RANGES = {
  heartRate: { low: 60, high: 100, unit: "bpm" },
  temperature: { low: 97.0, high: 99.5, unit: "°F" },
  weight: { unit: "lbs" },
  oxygenSaturation: { low: 95, high: 100, unit: "%" },
};

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

const PATIENT_PROFILE = {
  name: "Alex Morgan",
  dateOfBirth: "1988-07-22",
  bloodType: "O+",
  allergies: ["Penicillin", "Shellfish"],
  emergencyContact: {
    name: "Jordan Morgan",
    phone: "(555) 123-4567",
    relationship: "Spouse",
  },
  insuranceProvider: "HealthFirst Premium",
  insuranceId: "HF-2026-88742",
};

export default function PatientPortal() {
  const [activeView, setActiveView] = useState(() => {
    try {
      return localStorage.getItem("patientPortalView") || "dashboard";
    } catch {
      return "dashboard";
    }
  });
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("patientPortalTheme") || "light";
    } catch {
      return "light";
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem("patientAppointments");
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [labResults] = useState(INITIAL_LAB_RESULTS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [bills] = useState(INITIAL_BILLS);
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      text: "Upcoming appointment with Dr. Chen on May 15",
      type: "reminder",
      read: false,
    },
    {
      id: "n2",
      text: "New lab results available",
      type: "result",
      read: false,
    },
    {
      id: "n3",
      text: "Prescription refill reminder: Lisinopril",
      type: "prescription",
      read: true,
    },
  ]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedLabResult, setSelectedLabResult] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    date: "",
    time: "",
    type: "Check-up",
    notes: "",
    priority: "normal",
  });
  const [messageInput, setMessageInput] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [prescriptionFilter, setPrescriptionFilter] = useState("all");
  const [billFilter, setBillFilter] = useState("all");
  const [settingsTab, setSettingsTab] = useState("profile");
  const [vitals] = useState(INITIAL_VITALS);
  const [selectedVital, setSelectedVital] = useState(null);
  const [historyTypeFilter, setHistoryTypeFilter] = useState("all");
  const [vitalsSortOrder, setVitalsSortOrder] = useState("newest");
  const searchInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("patientPortalView", activeView);
    } catch {}
  }, [activeView]);

  useEffect(() => {
    try {
      localStorage.setItem("patientPortalTheme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("patientAppointments", JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (showNewAppointmentModal) setShowNewAppointmentModal(false);
        else if (showProfileModal) setShowProfileModal(false);
        else if (showNotifications) setShowNotifications(false);
        else if (selectedAppointment) setSelectedAppointment(null);
        else if (selectedLabResult) setSelectedLabResult(null);
        else if (selectedVital) setSelectedVital(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    showNewAppointmentModal,
    showProfileModal,
    showNotifications,
    selectedAppointment,
    selectedLabResult,
    selectedVital,
  ]);

  const getDoctorById = useCallback(
    (id) => MOCK_DOCTORS.find((d) => d.id === id),
    []
  );

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const unreadMessageCount = useMemo(
    () => messages.filter((m) => m.unread).length,
    [messages]
  );

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    if (appointmentFilter !== "all")
      filtered = filtered.filter((a) => a.status === appointmentFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => {
        const doctor = getDoctorById(a.doctorId);
        return (
          a.type.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q) ||
          (doctor && doctor.name.toLowerCase().includes(q))
        );
      });
    }
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, appointmentFilter, searchQuery, getDoctorById]);

  const filteredPrescriptions = useMemo(() => {
    let filtered = prescriptions;
    if (prescriptionFilter !== "all")
      filtered = filtered.filter((p) => p.status === prescriptionFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.dosage.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [prescriptions, prescriptionFilter, searchQuery]);

  const filteredBills = useMemo(() => {
    let filtered = bills;
    if (billFilter !== "all")
      filtered = filtered.filter((b) => b.status === billFilter);
    return filtered;
  }, [bills, billFilter]);

  const sortedVitals = useMemo(() => {
    const sorted = [...vitals];
    return vitalsSortOrder === "newest"
      ? sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
      : sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [vitals, vitalsSortOrder]);

  const latestVitals = useMemo(
    () => (vitals.length > 0 ? sortedVitals[0] : null),
    [vitals, sortedVitals]
  );

  const filteredHistory = useMemo(() => {
    let filtered = MEDICAL_HISTORY;
    if (historyTypeFilter !== "all")
      filtered = filtered.filter((h) => h.type === historyTypeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [historyTypeFilter, searchQuery]);

  const dashboardStats = useMemo(() => {
    const upcoming = appointments.filter(
      (a) => a.status === "scheduled"
    ).length;
    const activePrescriptions = prescriptions.filter(
      (p) => p.status === "active"
    ).length;
    const pendingBills = bills
      .filter((b) => b.status === "pending")
      .reduce((sum, b) => sum + b.patientOwes, 0);
    const abnormalResults = labResults.filter(
      (r) => r.status === "abnormal"
    ).length;
    return { upcoming, activePrescriptions, pendingBills, abnormalResults };
  }, [appointments, prescriptions, bills, labResults]);

  const handleCreateAppointment = () => {
    if (
      !newAppointment.doctorId ||
      !newAppointment.date ||
      !newAppointment.time
    )
      return;
    const appt = {
      id: `a${Date.now()}`,
      ...newAppointment,
      status: "scheduled",
    };
    setAppointments((prev) => [...prev, appt]);
    setShowNewAppointmentModal(false);
    setNewAppointment({
      doctorId: "",
      date: "",
      time: "",
      type: "Check-up",
      notes: "",
      priority: "normal",
    });
  };

  const handleCancelAppointment = (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );
    setSelectedAppointment(null);
  };

  const handleRequestRefill = (id) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, refillsLeft: Math.max(0, p.refillsLeft - 1) } : p
      )
    );
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    setMessages((prev) =>
      prev.map((c) =>
        c.id === selectedConversation
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  sender: "patient",
                  text: messageInput.trim(),
                  timestamp: Date.now(),
                },
              ],
              lastUpdated: Date.now(),
            }
          : c
      )
    );
    setMessageInput("");
  };

  const handleMarkNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleOpenConversation = (convId) => {
    setSelectedConversation(convId);
    setMessages((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread: false } : c))
    );
  };

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const navigateTo = (view) => {
    setActiveView(view);
    setSearchQuery("");
    setSelectedAppointment(null);
    setSelectedLabResult(null);
    setSelectedConversation(null);
    setSelectedVital(null);
  };

  const bgColor = theme === "dark" ? "#1a1a2e" : "#f0f4f8";
  const cardBg = theme === "dark" ? "#16213e" : "#ffffff";
  const textColor = theme === "dark" ? "#e0e0e0" : "#1a1a2e";
  const mutedColor = theme === "dark" ? "#8899aa" : "#6b7280";
  const borderColor = theme === "dark" ? "#2a3a5e" : "#e2e8f0";
  const accentColor = "#3b82f6";
  const sidebarBg = theme === "dark" ? "#0f1729" : "#1e3a5f";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊" },
    { id: "lab-results", label: "Lab Results", icon: "🔬" },
    {
      id: "messages",
      label: "Messages",
      icon: "✉️",
      badge: unreadMessageCount,
    },
    { id: "vitals", label: "Vitals", icon: "❤️" },
    { id: "history", label: "History", icon: "📋" },
    { id: "billing", label: "Billing", icon: "💳" },
    { id: "doctors", label: "Doctors", icon: "🩺" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const renderDashboard = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: 20 }}>
        Welcome back, {PATIENT_PROFILE.name}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ color: mutedColor, fontSize: 14 }}>
            Upcoming Appointments
          </div>
          <div style={{ color: textColor, fontSize: 28, fontWeight: "bold" }}>
            {dashboardStats.upcoming}
          </div>
        </div>
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ color: mutedColor, fontSize: 14 }}>
            Active Prescriptions
          </div>
          <div style={{ color: textColor, fontSize: 28, fontWeight: "bold" }}>
            {dashboardStats.activePrescriptions}
          </div>
        </div>
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ color: mutedColor, fontSize: 14 }}>Pending Bills</div>
          <div style={{ color: textColor, fontSize: 28, fontWeight: "bold" }}>
            ${dashboardStats.pendingBills.toFixed(2)}
          </div>
        </div>
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ color: mutedColor, fontSize: 14 }}>
            Abnormal Results
          </div>
          <div
            style={{
              color: textColor,
              fontSize: 28,
              fontWeight: "bold",
              color: dashboardStats.abnormalResults > 0 ? "#ef4444" : textColor,
            }}
          >
            {dashboardStats.abnormalResults}
          </div>
        </div>
      </div>
      {latestVitals && (
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: 12 }}>
            Latest Vitals ({latestVitals.date})
          </h3>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <span style={{ color: mutedColor, fontSize: 13 }}>BP: </span>
              <span style={{ color: textColor, fontWeight: 500 }}>
                {latestVitals.bloodPressure}
              </span>
            </div>
            <div>
              <span style={{ color: mutedColor, fontSize: 13 }}>HR: </span>
              <span style={{ color: textColor, fontWeight: 500 }}>
                {latestVitals.heartRate} bpm
              </span>
            </div>
            <div>
              <span style={{ color: mutedColor, fontSize: 13 }}>Temp: </span>
              <span style={{ color: textColor, fontWeight: 500 }}>
                {latestVitals.temperature}°F
              </span>
            </div>
            <div>
              <span style={{ color: mutedColor, fontSize: 13 }}>Weight: </span>
              <span style={{ color: textColor, fontWeight: 500 }}>
                {latestVitals.weight} lbs
              </span>
            </div>
            <div>
              <span style={{ color: mutedColor, fontSize: 13 }}>O₂: </span>
              <span style={{ color: textColor, fontWeight: 500 }}>
                {latestVitals.oxygenSaturation}%
              </span>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: 12 }}>
            Next Appointments
          </h3>
          {appointments
            .filter((a) => a.status === "scheduled")
            .slice(0, 3)
            .map((apt) => {
              const doctor = getDoctorById(apt.doctorId);
              return (
                <div
                  key={apt.id}
                  style={{
                    padding: 12,
                    borderBottom: `1px solid ${borderColor}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ color: textColor, fontWeight: 500 }}>
                      {apt.type} - {doctor?.name}
                    </div>
                    <div style={{ color: mutedColor, fontSize: 13 }}>
                      {apt.date} at {apt.time}
                    </div>
                  </div>
                  <span
                    style={{
                      background: STATUS_COLORS[apt.status] + "20",
                      color: STATUS_COLORS[apt.status],
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  >
                    {apt.status}
                  </span>
                </div>
              );
            })}
        </div>
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: 12 }}>
            Recent Messages
          </h3>
          {messages.slice(0, 3).map((conv) => {
            const doctor = getDoctorById(conv.doctorId);
            return (
              <div
                key={conv.id}
                style={{
                  padding: 12,
                  borderBottom: `1px solid ${borderColor}`,
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigateTo("messages");
                  handleOpenConversation(conv.id);
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div
                    style={{
                      color: textColor,
                      fontWeight: conv.unread ? "bold" : "normal",
                    }}
                  >
                    {conv.subject}
                  </div>
                  {conv.unread && (
                    <span
                      style={{
                        background: "#ef4444",
                        color: "white",
                        borderRadius: "50%",
                        width: 8,
                        height: 8,
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>
                <div style={{ color: mutedColor, fontSize: 13 }}>
                  {doctor?.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ color: textColor }}>Appointments</h2>
        <button
          onClick={() => setShowNewAppointmentModal(true)}
          style={{
            background: accentColor,
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
          }}
          aria-label="New appointment"
        >
          + New Appointment
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "scheduled", "completed", "cancelled", "pending"].map((f) => (
          <button
            key={f}
            onClick={() => setAppointmentFilter(f)}
            style={{
              background: appointmentFilter === f ? accentColor : cardBg,
              color: appointmentFilter === f ? "white" : textColor,
              border: `1px solid ${borderColor}`,
              padding: "6px 14px",
              borderRadius: 20,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div style={{ color: mutedColor, fontSize: 14, marginBottom: 12 }}>
        {filteredAppointments.length} appointments
      </div>
      {selectedAppointment ? (
        (() => {
          const apt = appointments.find((a) => a.id === selectedAppointment);
          const doctor = getDoctorById(apt?.doctorId);
          if (!apt) return null;
          return (
            <div
              style={{
                background: cardBg,
                padding: 24,
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
              }}
            >
              <button
                onClick={() => setSelectedAppointment(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: accentColor,
                  cursor: "pointer",
                  marginBottom: 16,
                }}
              >
                ← Back to Appointments
              </button>
              <h3 style={{ color: textColor }}>
                {apt.type} with {doctor?.name}
              </h3>
              <div style={{ color: mutedColor, marginTop: 8 }}>
                Date: {apt.date} at {apt.time}
              </div>
              <div style={{ color: mutedColor }}>
                Status:{" "}
                <span style={{ color: STATUS_COLORS[apt.status] }}>
                  {apt.status}
                </span>
              </div>
              <div style={{ color: mutedColor }}>
                Priority:{" "}
                <span style={{ color: PRIORITY_COLORS[apt.priority] }}>
                  {apt.priority}
                </span>
              </div>
              <div style={{ color: mutedColor, marginTop: 8 }}>
                Notes: {apt.notes}
              </div>
              <div style={{ color: mutedColor, marginTop: 8 }}>
                Specialty: {doctor?.specialty}
              </div>
              {apt.status === "scheduled" && (
                <button
                  onClick={() => handleCancelAppointment(apt.id)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 8,
                    cursor: "pointer",
                    marginTop: 16,
                  }}
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          );
        })()
      ) : (
        <div>
          {filteredAppointments.map((apt) => {
            const doctor = getDoctorById(apt.doctorId);
            return (
              <div
                key={apt.id}
                onClick={() => setSelectedAppointment(apt.id)}
                style={{
                  background: cardBg,
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  marginBottom: 12,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: textColor, fontWeight: 500 }}>
                    {apt.type}
                  </div>
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    {doctor?.name} — {apt.date} at {apt.time}
                  </div>
                  <div style={{ color: mutedColor, fontSize: 12 }}>
                    {apt.notes}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {apt.priority !== "normal" && (
                    <span
                      style={{
                        color: PRIORITY_COLORS[apt.priority],
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {apt.priority}
                    </span>
                  )}
                  <span
                    style={{
                      background: STATUS_COLORS[apt.status] + "20",
                      color: STATUS_COLORS[apt.status],
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      textTransform: "capitalize",
                    }}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderNewAppointmentModal = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: cardBg,
          padding: 32,
          borderRadius: 16,
          width: 480,
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: textColor }}>Schedule New Appointment</h3>
          <button
            onClick={() => setShowNewAppointmentModal(false)}
            style={{
              background: "none",
              border: "none",
              color: textColor,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ color: textColor, display: "block", marginBottom: 4 }}
          >
            Doctor
          </label>
          <select
            value={newAppointment.doctorId}
            onChange={(e) =>
              setNewAppointment((p) => ({ ...p, doctorId: e.target.value }))
            }
            aria-label="Select doctor"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: cardBg,
              color: textColor,
            }}
          >
            <option value="">Select a doctor</option>
            {MOCK_DOCTORS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialty}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ color: textColor, display: "block", marginBottom: 4 }}
          >
            Date
          </label>
          <input
            type="date"
            value={newAppointment.date}
            onChange={(e) =>
              setNewAppointment((p) => ({ ...p, date: e.target.value }))
            }
            aria-label="Appointment date"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: cardBg,
              color: textColor,
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ color: textColor, display: "block", marginBottom: 4 }}
          >
            Time
          </label>
          <select
            value={newAppointment.time}
            onChange={(e) =>
              setNewAppointment((p) => ({ ...p, time: e.target.value }))
            }
            aria-label="Appointment time"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: cardBg,
              color: textColor,
            }}
          >
            <option value="">Select time</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ color: textColor, display: "block", marginBottom: 4 }}
          >
            Type
          </label>
          <select
            value={newAppointment.type}
            onChange={(e) =>
              setNewAppointment((p) => ({ ...p, type: e.target.value }))
            }
            aria-label="Appointment type"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: cardBg,
              color: textColor,
            }}
          >
            <option value="Check-up">Check-up</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Consultation">Consultation</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ color: textColor, display: "block", marginBottom: 4 }}
          >
            Priority
          </label>
          <select
            value={newAppointment.priority}
            onChange={(e) =>
              setNewAppointment((p) => ({ ...p, priority: e.target.value }))
            }
            aria-label="Appointment priority"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: cardBg,
              color: textColor,
            }}
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ color: textColor, display: "block", marginBottom: 4 }}
          >
            Notes
          </label>
          <textarea
            value={newAppointment.notes}
            onChange={(e) =>
              setNewAppointment((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Describe your symptoms or reason for visit..."
            aria-label="Appointment notes"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: cardBg,
              color: textColor,
              minHeight: 80,
              resize: "vertical",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={() => setShowNewAppointmentModal(false)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: "none",
              color: textColor,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAppointment}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: accentColor,
              color: "white",
              cursor: "pointer",
            }}
          >
            Schedule Appointment
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: 20 }}>Prescriptions</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "active", "expired"].map((f) => (
          <button
            key={f}
            onClick={() => setPrescriptionFilter(f)}
            style={{
              background: prescriptionFilter === f ? accentColor : cardBg,
              color: prescriptionFilter === f ? "white" : textColor,
              border: `1px solid ${borderColor}`,
              padding: "6px 14px",
              borderRadius: 20,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      {filteredPrescriptions.map((rx) => {
        const doctor = getDoctorById(rx.doctorId);
        return (
          <div
            key={rx.id}
            style={{
              background: cardBg,
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${borderColor}`,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{ color: textColor, fontWeight: 600, fontSize: 16 }}
                >
                  {rx.name} — {rx.dosage}
                </div>
                <div style={{ color: mutedColor, fontSize: 13 }}>
                  Frequency: {rx.frequency}
                </div>
                <div style={{ color: mutedColor, fontSize: 13 }}>
                  Prescribed by: {doctor?.name}
                </div>
                <div style={{ color: mutedColor, fontSize: 13 }}>
                  Period: {rx.startDate} to {rx.endDate}
                </div>
                <div
                  style={{
                    color: mutedColor,
                    fontSize: 13,
                    fontStyle: "italic",
                  }}
                >
                  {rx.instructions}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    background:
                      rx.status === "active" ? "#22c55e20" : "#ef444420",
                    color: rx.status === "active" ? "#22c55e" : "#ef4444",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  {rx.status}
                </span>
                <div style={{ color: mutedColor, fontSize: 13, marginTop: 8 }}>
                  Refills: {rx.refillsLeft}
                </div>
                {rx.status === "active" && rx.refillsLeft > 0 && (
                  <button
                    onClick={() => handleRequestRefill(rx.id)}
                    style={{
                      background: accentColor,
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      marginTop: 8,
                      fontSize: 12,
                    }}
                  >
                    Request Refill
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLabResults = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: 20 }}>Lab Results</h2>
      {selectedLabResult ? (
        (() => {
          const result = labResults.find((r) => r.id === selectedLabResult);
          const doctor = getDoctorById(result?.doctorId);
          if (!result) return null;
          return (
            <div
              style={{
                background: cardBg,
                padding: 24,
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
              }}
            >
              <button
                onClick={() => setSelectedLabResult(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: accentColor,
                  cursor: "pointer",
                  marginBottom: 16,
                }}
              >
                ← Back to Lab Results
              </button>
              <h3 style={{ color: textColor }}>{result.testName}</h3>
              <div style={{ color: mutedColor, marginBottom: 4 }}>
                Date: {result.date}
              </div>
              <div style={{ color: mutedColor, marginBottom: 4 }}>
                Ordered by: {doctor?.name}
              </div>
              <div
                style={{
                  color: result.status === "abnormal" ? "#ef4444" : "#22c55e",
                  marginBottom: 16,
                }}
              >
                Overall: {result.status}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        color: textColor,
                      }}
                    >
                      Test
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        color: textColor,
                      }}
                    >
                      Value
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        color: textColor,
                      }}
                    >
                      Unit
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        color: textColor,
                      }}
                    >
                      Reference Range
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        color: textColor,
                      }}
                    >
                      Flag
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.values.map((v, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                    >
                      <td style={{ padding: 10, color: textColor }}>
                        {v.name}
                      </td>
                      <td style={{ padding: 10, color: textColor }}>
                        {v.value}
                      </td>
                      <td style={{ padding: 10, color: mutedColor }}>
                        {v.unit}
                      </td>
                      <td style={{ padding: 10, color: mutedColor }}>
                        {v.range}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          color:
                            v.flag === "high"
                              ? "#ef4444"
                              : v.flag === "low"
                              ? "#f97316"
                              : "#22c55e",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {v.flag}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()
      ) : (
        <div>
          {labResults.map((result) => {
            const doctor = getDoctorById(result.doctorId);
            return (
              <div
                key={result.id}
                onClick={() => setSelectedLabResult(result.id)}
                style={{
                  background: cardBg,
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  marginBottom: 12,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: textColor, fontWeight: 500 }}>
                    {result.testName}
                  </div>
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    {result.date} — {doctor?.name}
                  </div>
                </div>
                <span
                  style={{
                    background:
                      result.status === "abnormal" ? "#ef444420" : "#22c55e20",
                    color: result.status === "abnormal" ? "#ef4444" : "#22c55e",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    textTransform: "capitalize",
                  }}
                >
                  {result.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMessages = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 16,
        height: 500,
      }}
    >
      <div
        style={{
          background: cardBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          overflow: "auto",
        }}
      >
        <h3
          style={{
            color: textColor,
            padding: 16,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          Conversations
        </h3>
        {messages.map((conv) => {
          const doctor = getDoctorById(conv.doctorId);
          return (
            <div
              key={conv.id}
              onClick={() => handleOpenConversation(conv.id)}
              style={{
                padding: 14,
                borderBottom: `1px solid ${borderColor}`,
                cursor: "pointer",
                background:
                  selectedConversation === conv.id
                    ? accentColor + "15"
                    : "transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: textColor,
                    fontWeight: conv.unread ? "bold" : "normal",
                    fontSize: 14,
                  }}
                >
                  {conv.subject}
                </span>
                {conv.unread && (
                  <span
                    style={{
                      background: "#ef4444",
                      borderRadius: "50%",
                      width: 8,
                      height: 8,
                      display: "inline-block",
                    }}
                  />
                )}
              </div>
              <div style={{ color: mutedColor, fontSize: 12 }}>
                {doctor?.name}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedConversation ? (
          (() => {
            const conv = messages.find((c) => c.id === selectedConversation);
            const doctor = getDoctorById(conv?.doctorId);
            if (!conv) return null;
            return (
              <>
                <div
                  style={{
                    padding: 16,
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <div style={{ color: textColor, fontWeight: 600 }}>
                    {conv.subject}
                  </div>
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    with {doctor?.name}
                  </div>
                </div>
                <div style={{ flex: 1, padding: 16, overflow: "auto" }}>
                  {conv.messages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.sender === "patient" ? "flex-end" : "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          background:
                            msg.sender === "patient"
                              ? accentColor
                              : theme === "dark"
                              ? "#2a3a5e"
                              : "#e2e8f0",
                          color: msg.sender === "patient" ? "white" : textColor,
                          padding: "10px 14px",
                          borderRadius: 12,
                          maxWidth: "70%",
                        }}
                      >
                        <div style={{ fontSize: 14 }}>{msg.text}</div>
                        <div
                          style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}
                        >
                          {new Date(msg.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: 16,
                    borderTop: `1px solid ${borderColor}`,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    aria-label="Message input"
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: `1px solid ${borderColor}`,
                      background: cardBg,
                      color: textColor,
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    style={{
                      background: accentColor,
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </div>
              </>
            );
          })()
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: mutedColor,
            }}
          >
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );

  const renderVitals = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: 20 }}>Vitals Tracking</h2>
      {latestVitals && (
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: 12 }}>
            Latest Readings ({latestVitals.date})
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ color: mutedColor, fontSize: 12 }}>
                Blood Pressure
              </div>
              <div style={{ color: textColor, fontSize: 20, fontWeight: 600 }}>
                {latestVitals.bloodPressure}
              </div>
              <div style={{ color: mutedColor, fontSize: 11 }}>mmHg</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: mutedColor, fontSize: 12 }}>Heart Rate</div>
              <div
                style={{
                  color:
                    latestVitals.heartRate >= VITAL_RANGES.heartRate.low &&
                    latestVitals.heartRate <= VITAL_RANGES.heartRate.high
                      ? "#22c55e"
                      : "#ef4444",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {latestVitals.heartRate}
              </div>
              <div style={{ color: mutedColor, fontSize: 11 }}>
                {VITAL_RANGES.heartRate.unit}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: mutedColor, fontSize: 12 }}>Temperature</div>
              <div
                style={{
                  color:
                    latestVitals.temperature >= VITAL_RANGES.temperature.low &&
                    latestVitals.temperature <= VITAL_RANGES.temperature.high
                      ? "#22c55e"
                      : "#ef4444",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {latestVitals.temperature}
              </div>
              <div style={{ color: mutedColor, fontSize: 11 }}>
                {VITAL_RANGES.temperature.unit}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: mutedColor, fontSize: 12 }}>Weight</div>
              <div style={{ color: textColor, fontSize: 20, fontWeight: 600 }}>
                {latestVitals.weight}
              </div>
              <div style={{ color: mutedColor, fontSize: 11 }}>
                {VITAL_RANGES.weight.unit}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: mutedColor, fontSize: 12 }}>
                O₂ Saturation
              </div>
              <div
                style={{
                  color:
                    latestVitals.oxygenSaturation >=
                    VITAL_RANGES.oxygenSaturation.low
                      ? "#22c55e"
                      : "#ef4444",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {latestVitals.oxygenSaturation}
              </div>
              <div style={{ color: mutedColor, fontSize: 11 }}>
                {VITAL_RANGES.oxygenSaturation.unit}
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ color: mutedColor, fontSize: 14 }}>
          {sortedVitals.length} records
        </div>
        <select
          value={vitalsSortOrder}
          onChange={(e) => setVitalsSortOrder(e.target.value)}
          aria-label="Sort vitals"
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      {selectedVital ? (
        (() => {
          const vital = vitals.find((v) => v.id === selectedVital);
          const doctor = getDoctorById(vital?.recordedBy);
          if (!vital) return null;
          return (
            <div
              style={{
                background: cardBg,
                padding: 24,
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
              }}
            >
              <button
                onClick={() => setSelectedVital(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: accentColor,
                  cursor: "pointer",
                  marginBottom: 16,
                }}
              >
                ← Back to Vitals
              </button>
              <h3 style={{ color: textColor }}>Vitals — {vital.date}</h3>
              <div style={{ color: mutedColor, marginBottom: 16 }}>
                Recorded by: {doctor?.name}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div
                  style={{ background: bgColor, padding: 16, borderRadius: 8 }}
                >
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    Blood Pressure
                  </div>
                  <div
                    style={{ color: textColor, fontSize: 24, fontWeight: 600 }}
                  >
                    {vital.bloodPressure}{" "}
                    <span style={{ fontSize: 14, color: mutedColor }}>
                      mmHg
                    </span>
                  </div>
                </div>
                <div
                  style={{ background: bgColor, padding: 16, borderRadius: 8 }}
                >
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    Heart Rate
                  </div>
                  <div
                    style={{
                      color:
                        vital.heartRate >= VITAL_RANGES.heartRate.low &&
                        vital.heartRate <= VITAL_RANGES.heartRate.high
                          ? "#22c55e"
                          : "#ef4444",
                      fontSize: 24,
                      fontWeight: 600,
                    }}
                  >
                    {vital.heartRate}{" "}
                    <span style={{ fontSize: 14, color: mutedColor }}>
                      {VITAL_RANGES.heartRate.unit}
                    </span>
                  </div>
                </div>
                <div
                  style={{ background: bgColor, padding: 16, borderRadius: 8 }}
                >
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    Temperature
                  </div>
                  <div
                    style={{ color: textColor, fontSize: 24, fontWeight: 600 }}
                  >
                    {vital.temperature}{" "}
                    <span style={{ fontSize: 14, color: mutedColor }}>
                      {VITAL_RANGES.temperature.unit}
                    </span>
                  </div>
                </div>
                <div
                  style={{ background: bgColor, padding: 16, borderRadius: 8 }}
                >
                  <div style={{ color: mutedColor, fontSize: 13 }}>Weight</div>
                  <div
                    style={{ color: textColor, fontSize: 24, fontWeight: 600 }}
                  >
                    {vital.weight}{" "}
                    <span style={{ fontSize: 14, color: mutedColor }}>
                      {VITAL_RANGES.weight.unit}
                    </span>
                  </div>
                </div>
                <div
                  style={{ background: bgColor, padding: 16, borderRadius: 8 }}
                >
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    O₂ Saturation
                  </div>
                  <div
                    style={{
                      color:
                        vital.oxygenSaturation >=
                        VITAL_RANGES.oxygenSaturation.low
                          ? "#22c55e"
                          : "#ef4444",
                      fontSize: 24,
                      fontWeight: 600,
                    }}
                  >
                    {vital.oxygenSaturation}{" "}
                    <span style={{ fontSize: 14, color: mutedColor }}>
                      {VITAL_RANGES.oxygenSaturation.unit}
                    </span>
                  </div>
                </div>
              </div>
              {vital.notes && (
                <div
                  style={{
                    color: mutedColor,
                    marginTop: 16,
                    fontStyle: "italic",
                  }}
                >
                  Notes: {vital.notes}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div>
          {sortedVitals.map((vital) => {
            const doctor = getDoctorById(vital.recordedBy);
            return (
              <div
                key={vital.id}
                onClick={() => setSelectedVital(vital.id)}
                style={{
                  background: cardBg,
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  marginBottom: 12,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: textColor, fontWeight: 500 }}>
                    {vital.date}
                  </div>
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    Recorded by {doctor?.name}
                  </div>
                  {vital.notes && (
                    <div
                      style={{
                        color: mutedColor,
                        fontSize: 12,
                        fontStyle: "italic",
                      }}
                    >
                      {vital.notes}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        color: textColor,
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {vital.bloodPressure}
                    </div>
                    <div style={{ color: mutedColor, fontSize: 10 }}>BP</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        color: textColor,
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {vital.heartRate}
                    </div>
                    <div style={{ color: mutedColor, fontSize: 10 }}>HR</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        color: textColor,
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {vital.weight}
                    </div>
                    <div style={{ color: mutedColor, fontSize: 10 }}>lbs</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        color: textColor,
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {vital.oxygenSaturation}%
                    </div>
                    <div style={{ color: mutedColor, fontSize: 10 }}>O₂</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: 20 }}>Medical History</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "appointment", "lab", "prescription", "procedure"].map((f) => (
          <button
            key={f}
            onClick={() => setHistoryTypeFilter(f)}
            style={{
              background: historyTypeFilter === f ? accentColor : cardBg,
              color: historyTypeFilter === f ? "white" : textColor,
              border: `1px solid ${borderColor}`,
              padding: "6px 14px",
              borderRadius: 20,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "all" : f + "s"}
          </button>
        ))}
      </div>
      <div style={{ color: mutedColor, fontSize: 14, marginBottom: 12 }}>
        {filteredHistory.length} events
      </div>
      <div style={{ position: "relative", paddingLeft: 32 }}>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 0,
            bottom: 0,
            width: 2,
            background: borderColor,
          }}
        />
        {filteredHistory.map((event) => (
          <div
            key={event.id}
            style={{ position: "relative", marginBottom: 20 }}
          >
            <div
              style={{
                position: "absolute",
                left: -32,
                top: 4,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: cardBg,
                border: `2px solid ${accentColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            >
              {event.icon}
            </div>
            <div
              style={{
                background: cardBg,
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
                marginLeft: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ color: textColor, fontWeight: 500 }}>
                    {event.title}
                  </div>
                  <div style={{ color: mutedColor, fontSize: 13 }}>
                    {event.description}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: mutedColor, fontSize: 12 }}>
                    {event.date}
                  </div>
                  <span
                    style={{
                      background:
                        event.type === "appointment"
                          ? "#3b82f620"
                          : event.type === "lab"
                          ? "#8b5cf620"
                          : event.type === "prescription"
                          ? "#22c55e20"
                          : "#f9731620",
                      color:
                        event.type === "appointment"
                          ? "#3b82f6"
                          : event.type === "lab"
                          ? "#8b5cf6"
                          : event.type === "prescription"
                          ? "#22c55e"
                          : "#f97316",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      textTransform: "capitalize",
                    }}
                  >
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBilling = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: 20 }}>Billing</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ color: mutedColor, fontSize: 14 }}>Total Billed</div>
          <div style={{ color: textColor, fontSize: 24, fontWeight: "bold" }}>
            ${bills.reduce((s, b) => s + b.amount, 0).toFixed(2)}
          </div>
        </div>
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ color: mutedColor, fontSize: 14 }}>
            Insurance Covered
          </div>
          <div style={{ color: "#22c55e", fontSize: 24, fontWeight: "bold" }}>
            ${bills.reduce((s, b) => s + b.insuranceCovered, 0).toFixed(2)}
          </div>
        </div>
        <div
          style={{
            background: cardBg,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ color: mutedColor, fontSize: 14 }}>
            Patient Responsibility
          </div>
          <div style={{ color: textColor, fontSize: 24, fontWeight: "bold" }}>
            ${bills.reduce((s, b) => s + b.patientOwes, 0).toFixed(2)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "pending", "paid", "upcoming"].map((f) => (
          <button
            key={f}
            onClick={() => setBillFilter(f)}
            style={{
              background: billFilter === f ? accentColor : cardBg,
              color: billFilter === f ? "white" : textColor,
              border: `1px solid ${borderColor}`,
              padding: "6px 14px",
              borderRadius: 20,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: cardBg,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
            <th style={{ textAlign: "left", padding: 14, color: textColor }}>
              Description
            </th>
            <th style={{ textAlign: "left", padding: 14, color: textColor }}>
              Date
            </th>
            <th style={{ textAlign: "right", padding: 14, color: textColor }}>
              Amount
            </th>
            <th style={{ textAlign: "right", padding: 14, color: textColor }}>
              Insurance
            </th>
            <th style={{ textAlign: "right", padding: 14, color: textColor }}>
              You Owe
            </th>
            <th style={{ textAlign: "center", padding: 14, color: textColor }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredBills.map((bill) => (
            <tr
              key={bill.id}
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <td style={{ padding: 14, color: textColor }}>
                {bill.description}
              </td>
              <td style={{ padding: 14, color: mutedColor }}>{bill.date}</td>
              <td style={{ padding: 14, color: textColor, textAlign: "right" }}>
                ${bill.amount.toFixed(2)}
              </td>
              <td style={{ padding: 14, color: "#22c55e", textAlign: "right" }}>
                ${bill.insuranceCovered.toFixed(2)}
              </td>
              <td
                style={{
                  padding: 14,
                  color: textColor,
                  textAlign: "right",
                  fontWeight: 600,
                }}
              >
                ${bill.patientOwes.toFixed(2)}
              </td>
              <td style={{ padding: 14, textAlign: "center" }}>
                <span
                  style={{
                    background:
                      bill.status === "paid"
                        ? "#22c55e20"
                        : bill.status === "pending"
                        ? "#eab30820"
                        : "#3b82f620",
                    color:
                      bill.status === "paid"
                        ? "#22c55e"
                        : bill.status === "pending"
                        ? "#eab308"
                        : "#3b82f6",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  {bill.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDoctors = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: 20 }}>Doctors</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {MOCK_DOCTORS.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: cardBg,
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${borderColor}`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>{doc.avatar}</div>
            <div style={{ color: textColor, fontWeight: 600, fontSize: 16 }}>
              {doc.name}
            </div>
            <div
              style={{
                color: accentColor,
                fontSize: 14,
                textTransform: "capitalize",
                marginBottom: 8,
              }}
            >
              {doc.specialty}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ color: textColor, fontWeight: 600 }}>
                  {doc.rating}
                </div>
                <div style={{ color: mutedColor, fontSize: 12 }}>Rating</div>
              </div>
              <div>
                <div style={{ color: textColor, fontWeight: 600 }}>
                  {doc.patientsCount}
                </div>
                <div style={{ color: mutedColor, fontSize: 12 }}>Patients</div>
              </div>
            </div>
            <div style={{ color: mutedColor, fontSize: 12, marginBottom: 12 }}>
              Available: {doc.availableDays.join(", ")}
            </div>
            <button
              onClick={() => {
                setNewAppointment((p) => ({ ...p, doctorId: doc.id }));
                setShowNewAppointmentModal(true);
              }}
              style={{
                background: accentColor,
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: 20 }}>Settings</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["profile", "notifications", "privacy"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSettingsTab(tab)}
            style={{
              background: settingsTab === tab ? accentColor : cardBg,
              color: settingsTab === tab ? "white" : textColor,
              border: `1px solid ${borderColor}`,
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {settingsTab === "profile" && (
        <div
          style={{
            background: cardBg,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: 16 }}>
            Patient Information
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>Name</div>
              <div style={{ color: textColor }}>{PATIENT_PROFILE.name}</div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>
                Date of Birth
              </div>
              <div style={{ color: textColor }}>
                {PATIENT_PROFILE.dateOfBirth}
              </div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>Blood Type</div>
              <div style={{ color: textColor }}>
                {PATIENT_PROFILE.bloodType}
              </div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>Allergies</div>
              <div style={{ color: textColor }}>
                {PATIENT_PROFILE.allergies.join(", ")}
              </div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>
                Insurance Provider
              </div>
              <div style={{ color: textColor }}>
                {PATIENT_PROFILE.insuranceProvider}
              </div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>
                Insurance ID
              </div>
              <div style={{ color: textColor }}>
                {PATIENT_PROFILE.insuranceId}
              </div>
            </div>
          </div>
          <h4 style={{ color: textColor, marginTop: 20, marginBottom: 12 }}>
            Emergency Contact
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>Name</div>
              <div style={{ color: textColor }}>
                {PATIENT_PROFILE.emergencyContact.name}
              </div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>Phone</div>
              <div style={{ color: textColor }}>
                {PATIENT_PROFILE.emergencyContact.phone}
              </div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: 13 }}>
                Relationship
              </div>
              <div style={{ color: textColor }}>
                {PATIENT_PROFILE.emergencyContact.relationship}
              </div>
            </div>
          </div>
        </div>
      )}
      {settingsTab === "notifications" && (
        <div
          style={{
            background: cardBg,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: 16 }}>
            Notification Preferences
          </h3>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                color: textColor,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input type="checkbox" defaultChecked /> Appointment reminders
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                color: textColor,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input type="checkbox" defaultChecked /> Lab result notifications
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                color: textColor,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input type="checkbox" defaultChecked /> Prescription refill
              reminders
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                color: textColor,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input type="checkbox" /> Marketing communications
            </label>
          </div>
        </div>
      )}
      {settingsTab === "privacy" && (
        <div
          style={{
            background: cardBg,
            padding: 24,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: 16 }}>
            Privacy Settings
          </h3>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                color: textColor,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input type="checkbox" defaultChecked /> Share records with
              specialists
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                color: textColor,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input type="checkbox" /> Allow research data usage
            </label>
          </div>
          <div style={{ marginBottom: 12, color: mutedColor, fontSize: 13 }}>
            Last privacy policy update: January 2026
          </div>
        </div>
      )}
    </div>
  );

  const renderProfileModal = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: cardBg,
          padding: 32,
          borderRadius: 16,
          width: 400,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: textColor }}>Quick Profile</h3>
          <button
            onClick={() => setShowProfileModal(false)}
            style={{
              background: "none",
              border: "none",
              color: textColor,
              fontSize: 20,
              cursor: "pointer",
            }}
            aria-label="Close profile"
          >
            ×
          </button>
        </div>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>👤</div>
          <div style={{ color: textColor, fontWeight: 600 }}>
            {PATIENT_PROFILE.name}
          </div>
          <div style={{ color: mutedColor, fontSize: 13 }}>
            DOB: {PATIENT_PROFILE.dateOfBirth}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}>
          <div style={{ color: mutedColor, fontSize: 13 }}>
            Blood Type:{" "}
            <span style={{ color: textColor }}>
              {PATIENT_PROFILE.bloodType}
            </span>
          </div>
          <div style={{ color: mutedColor, fontSize: 13, marginTop: 4 }}>
            Allergies:{" "}
            <span style={{ color: "#ef4444" }}>
              {PATIENT_PROFILE.allergies.join(", ")}
            </span>
          </div>
          <div style={{ color: mutedColor, fontSize: 13, marginTop: 4 }}>
            Insurance:{" "}
            <span style={{ color: textColor }}>
              {PATIENT_PROFILE.insuranceProvider}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return renderDashboard();
      case "appointments":
        return renderAppointments();
      case "prescriptions":
        return renderPrescriptions();
      case "lab-results":
        return renderLabResults();
      case "messages":
        return renderMessages();
      case "vitals":
        return renderVitals();
      case "history":
        return renderHistory();
      case "billing":
        return renderBilling();
      case "doctors":
        return renderDoctors();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: bgColor,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarCollapsed ? 64 : 240,
          background: sidebarBg,
          transition: "width 0.2s",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 24 }}>🏥</span>
          {!sidebarCollapsed && (
            <span style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
              HealthHub
            </span>
          )}
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle sidebar"
          style={{
            background: "none",
            border: "none",
            color: "white",
            padding: 8,
            cursor: "pointer",
            margin: "0 8px",
          }}
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
        <nav style={{ flex: 1, marginTop: 8 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                background:
                  activeView === item.id
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                position: "relative",
              }}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {item.badge > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    position: "absolute",
                    right: 12,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: cardBg,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, appointments, records..."
            aria-label="Global search"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: bgColor,
              color: textColor,
              width: 360,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "#ef4444",
                      color: "white",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                    }}
                  >
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: 36,
                    right: 0,
                    width: 320,
                    background: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: 14,
                      borderBottom: `1px solid ${borderColor}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: textColor, fontWeight: 600 }}>
                      Notifications
                    </span>
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      style={{
                        background: "none",
                        border: "none",
                        color: accentColor,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkNotificationRead(n.id)}
                      style={{
                        padding: 12,
                        borderBottom: `1px solid ${borderColor}`,
                        cursor: "pointer",
                        background: n.read ? "transparent" : accentColor + "08",
                      }}
                    >
                      <div
                        style={{
                          color: textColor,
                          fontSize: 13,
                          fontWeight: n.read ? "normal" : "bold",
                        }}
                      >
                        {n.text}
                      </div>
                      <div
                        style={{
                          color: mutedColor,
                          fontSize: 11,
                          textTransform: "capitalize",
                        }}
                      >
                        {n.type}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              aria-label="View profile"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>👤</span>
              <span style={{ color: textColor, fontSize: 14 }}>
                {PATIENT_PROFILE.name}
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
          {renderView()}
        </main>
      </div>

      {/* Modals */}
      {showNewAppointmentModal && renderNewAppointmentModal()}
      {showProfileModal && renderProfileModal()}
    </div>
  );
}
