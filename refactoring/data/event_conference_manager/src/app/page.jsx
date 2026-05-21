import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const TRACKS = [
  "frontend",
  "backend",
  "devops",
  "design",
  "data",
  "security",
  "mobile",
];
const SESSION_TYPES = ["talk", "workshop", "panel", "keynote", "lightning"];
const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];
const ATTENDEE_TIERS = ["general", "vip", "speaker", "sponsor", "staff"];

const VENUES = [
  {
    id: "v1",
    name: "Grand Hall A",
    capacity: 500,
    floor: 1,
    equipment: ["projector", "microphone", "livestream"],
    available: true,
  },
  {
    id: "v2",
    name: "Grand Hall B",
    capacity: 500,
    floor: 1,
    equipment: ["projector", "microphone", "livestream"],
    available: true,
  },
  {
    id: "v3",
    name: "Workshop Room 1",
    capacity: 50,
    floor: 2,
    equipment: ["projector", "whiteboard"],
    available: true,
  },
  {
    id: "v4",
    name: "Workshop Room 2",
    capacity: 50,
    floor: 2,
    equipment: ["projector", "whiteboard"],
    available: true,
  },
  {
    id: "v5",
    name: "Panel Stage",
    capacity: 200,
    floor: 1,
    equipment: ["projector", "microphone", "recording"],
    available: true,
  },
  {
    id: "v6",
    name: "Lightning Theater",
    capacity: 150,
    floor: 3,
    equipment: ["projector", "microphone"],
    available: true,
  },
  {
    id: "v7",
    name: "VIP Lounge",
    capacity: 40,
    floor: 3,
    equipment: ["tv", "whiteboard"],
    available: false,
  },
  {
    id: "v8",
    name: "Expo Hall",
    capacity: 1000,
    floor: 1,
    equipment: ["projector", "microphone", "livestream", "recording"],
    available: true,
  },
];

const INITIAL_SPEAKERS = [
  {
    id: "s1",
    name: "Sarah Chen",
    email: "sarah@tech.io",
    bio: 'Principal engineer at TechCorp with 15 years of React experience. Author of "Modern Frontend Patterns".',
    company: "TechCorp",
    role: "Principal Engineer",
    avatar: "👩‍💻",
    expertise: ["frontend", "design"],
    twitter: "@sarahcodes",
    confirmed: true,
    travelArranged: true,
    sessions: ["sess1", "sess5"],
  },
  {
    id: "s2",
    name: "Marcus Johnson",
    email: "marcus@dataflow.com",
    bio: "Data platform architect building real-time analytics systems at scale. Conference keynote veteran.",
    company: "DataFlow",
    role: "CTO",
    avatar: "👨‍💻",
    expertise: ["data", "backend"],
    twitter: "@marcusj",
    confirmed: true,
    travelArranged: true,
    sessions: ["sess2", "sess9"],
  },
  {
    id: "s3",
    name: "Priya Patel",
    email: "priya@secureai.co",
    bio: "Leading AI security researcher focused on adversarial ML and secure deployment pipelines.",
    company: "SecureAI",
    role: "Head of Security",
    avatar: "👩‍🔬",
    expertise: ["security", "data"],
    twitter: "@priyasec",
    confirmed: true,
    travelArranged: false,
    sessions: ["sess3"],
  },
  {
    id: "s4",
    name: "James O'Brien",
    email: "james@cloudops.dev",
    bio: "Kubernetes contributor and cloud-native advocate. Built infrastructure serving 100M+ users.",
    company: "CloudOps",
    role: "Staff Engineer",
    avatar: "👨‍🔧",
    expertise: ["devops", "backend"],
    twitter: "@jamescloud",
    confirmed: true,
    travelArranged: true,
    sessions: ["sess4", "sess10"],
  },
  {
    id: "s5",
    name: "Aisha Williams",
    email: "aisha@mobilefirst.io",
    bio: "Mobile architect specializing in cross-platform frameworks. React Native core contributor.",
    company: "MobileFirst",
    role: "Mobile Lead",
    avatar: "👩‍💻",
    expertise: ["mobile", "frontend"],
    twitter: "@aishamobile",
    confirmed: false,
    travelArranged: false,
    sessions: ["sess6"],
  },
  {
    id: "s6",
    name: "Erik Lindqvist",
    email: "erik@designsys.co",
    bio: "Design systems pioneer who has built component libraries used by Fortune 500 companies.",
    company: "DesignSys",
    role: "Design Director",
    avatar: "👨‍🎨",
    expertise: ["design", "frontend"],
    twitter: "@erikdesign",
    confirmed: true,
    travelArranged: true,
    sessions: ["sess7", "sess5"],
  },
  {
    id: "s7",
    name: "Fatima Al-Rashid",
    email: "fatima@quantumml.ai",
    bio: "Quantum computing researcher exploring ML applications. Published 30+ papers on quantum algorithms.",
    company: "QuantumML",
    role: "Research Lead",
    avatar: "👩‍🔬",
    expertise: ["data", "security"],
    twitter: "@fatimaquantum",
    confirmed: true,
    travelArranged: true,
    sessions: ["sess8"],
  },
  {
    id: "s8",
    name: "Tom Nakamura",
    email: "tom@fastapi.dev",
    bio: "Backend performance specialist. Creator of several open-source high-performance API frameworks.",
    company: "FastAPI Labs",
    role: "Founder",
    avatar: "👨‍💻",
    expertise: ["backend", "devops"],
    twitter: "@tomnaka",
    confirmed: false,
    travelArranged: false,
    sessions: ["sess10", "sess9"],
  },
];

const INITIAL_SESSIONS = [
  {
    id: "sess1",
    title: "The Future of React Server Components",
    type: "keynote",
    track: "frontend",
    speakerIds: ["s1"],
    venueId: "v1",
    timeSlot: "09:00",
    duration: 60,
    day: 1,
    description:
      "Deep dive into RSC architecture, streaming, and the future of React rendering patterns.",
    maxAttendees: 500,
    registeredAttendees: ["a1", "a2", "a3", "a4", "a5"],
    tags: ["react", "rsc", "performance"],
    feedback: [{ attendeeId: "a1", rating: 5, comment: "Best keynote ever!" }],
  },
  {
    id: "sess2",
    title: "Building Real-Time Data Pipelines",
    type: "talk",
    track: "data",
    speakerIds: ["s2"],
    venueId: "v5",
    timeSlot: "10:00",
    duration: 45,
    day: 1,
    description:
      "Learn how to architect real-time data pipelines that scale to millions of events per second.",
    maxAttendees: 200,
    registeredAttendees: ["a1", "a3", "a6"],
    tags: ["data", "streaming", "kafka"],
    feedback: [],
  },
  {
    id: "sess3",
    title: "Securing AI/ML Models in Production",
    type: "talk",
    track: "security",
    speakerIds: ["s3"],
    venueId: "v5",
    timeSlot: "11:00",
    duration: 45,
    day: 1,
    description:
      "Practical strategies for defending ML models against adversarial attacks and ensuring safe deployments.",
    maxAttendees: 200,
    registeredAttendees: ["a2", "a4", "a7"],
    tags: ["security", "ai", "mlops"],
    feedback: [],
  },
  {
    id: "sess4",
    title: "Kubernetes at Scale: Lessons Learned",
    type: "workshop",
    track: "devops",
    speakerIds: ["s4"],
    venueId: "v3",
    timeSlot: "13:00",
    duration: 120,
    day: 1,
    description:
      "Hands-on workshop covering advanced Kubernetes patterns, autoscaling, and disaster recovery.",
    maxAttendees: 50,
    registeredAttendees: ["a1", "a5", "a8"],
    tags: ["kubernetes", "cloud", "infrastructure"],
    feedback: [
      { attendeeId: "a5", rating: 4, comment: "Very practical workshop" },
    ],
  },
  {
    id: "sess5",
    title: "Design Systems That Scale",
    type: "panel",
    track: "design",
    speakerIds: ["s1", "s6"],
    venueId: "v5",
    timeSlot: "15:00",
    duration: 60,
    day: 1,
    description:
      "Panel discussion on building and maintaining design systems across large organizations.",
    maxAttendees: 200,
    registeredAttendees: ["a2", "a3", "a6", "a9"],
    tags: ["design-systems", "components", "accessibility"],
    feedback: [],
  },
  {
    id: "sess6",
    title: "Cross-Platform Mobile Architecture",
    type: "talk",
    track: "mobile",
    speakerIds: ["s5"],
    venueId: "v6",
    timeSlot: "09:00",
    duration: 45,
    day: 2,
    description:
      "Strategies for sharing code between iOS, Android, and web while maintaining native performance.",
    maxAttendees: 150,
    registeredAttendees: ["a4", "a7"],
    tags: ["mobile", "react-native", "architecture"],
    feedback: [],
  },
  {
    id: "sess7",
    title: "Accessible Component Patterns",
    type: "workshop",
    track: "design",
    speakerIds: ["s6"],
    venueId: "v4",
    timeSlot: "10:00",
    duration: 120,
    day: 2,
    description:
      "Build accessible components from scratch with proper ARIA patterns, keyboard navigation, and screen reader support.",
    maxAttendees: 50,
    registeredAttendees: ["a2", "a9", "a10"],
    tags: ["accessibility", "a11y", "components"],
    feedback: [
      { attendeeId: "a9", rating: 5, comment: "Eye-opening workshop!" },
    ],
  },
  {
    id: "sess8",
    title: "Quantum Computing for Engineers",
    type: "lightning",
    track: "data",
    speakerIds: ["s7"],
    venueId: "v6",
    timeSlot: "13:00",
    duration: 15,
    day: 2,
    description:
      "A rapid introduction to quantum computing concepts that every software engineer should know.",
    maxAttendees: 150,
    registeredAttendees: ["a1", "a3", "a5", "a8"],
    tags: ["quantum", "computing", "future"],
    feedback: [],
  },
  {
    id: "sess9",
    title: "API Performance Masterclass",
    type: "workshop",
    track: "backend",
    speakerIds: ["s2", "s8"],
    venueId: "v3",
    timeSlot: "14:00",
    duration: 120,
    day: 2,
    description:
      "Deep dive into API optimization techniques: caching strategies, connection pooling, query optimization, and load testing.",
    maxAttendees: 50,
    registeredAttendees: ["a1", "a5", "a6", "a8"],
    tags: ["api", "performance", "backend"],
    feedback: [],
  },
  {
    id: "sess10",
    title: "Cloud-Native CI/CD Pipelines",
    type: "talk",
    track: "devops",
    speakerIds: ["s4", "s8"],
    venueId: "v6",
    timeSlot: "16:00",
    duration: 45,
    day: 2,
    description:
      "Modern CI/CD pipeline architecture using GitOps, Argo CD, and Tekton for cloud-native applications.",
    maxAttendees: 150,
    registeredAttendees: ["a3", "a5", "a7", "a10"],
    tags: ["cicd", "gitops", "devops"],
    feedback: [],
  },
];

const INITIAL_ATTENDEES = [
  {
    id: "a1",
    name: "Alex Rivera",
    email: "alex@startup.co",
    company: "StartupCo",
    tier: "vip",
    checkedIn: true,
    registeredSessions: ["sess1", "sess2", "sess4", "sess8", "sess9"],
    dietaryRestrictions: "vegetarian",
    tshirtSize: "M",
    notes: "",
  },
  {
    id: "a2",
    name: "Blake Kim",
    email: "blake@enterprise.io",
    company: "EnterpriseCorp",
    tier: "general",
    checkedIn: true,
    registeredSessions: ["sess1", "sess3", "sess5", "sess7"],
    dietaryRestrictions: "",
    tshirtSize: "L",
    notes: "",
  },
  {
    id: "a3",
    name: "Casey Jordan",
    email: "casey@freelance.dev",
    company: "Freelance",
    tier: "general",
    checkedIn: false,
    registeredSessions: ["sess1", "sess2", "sess5", "sess8", "sess10"],
    dietaryRestrictions: "vegan",
    tshirtSize: "S",
    notes: "First-time attendee",
  },
  {
    id: "a4",
    name: "Dana Lopez",
    email: "dana@agency.co",
    company: "CreativeAgency",
    tier: "sponsor",
    checkedIn: true,
    registeredSessions: ["sess1", "sess3", "sess6"],
    dietaryRestrictions: "",
    tshirtSize: "M",
    notes: "Gold sponsor representative",
  },
  {
    id: "a5",
    name: "Evan Tanaka",
    email: "evan@bigtech.com",
    company: "BigTech Inc",
    tier: "vip",
    checkedIn: true,
    registeredSessions: ["sess1", "sess4", "sess8", "sess9", "sess10"],
    dietaryRestrictions: "gluten-free",
    tshirtSize: "XL",
    notes: "",
  },
  {
    id: "a6",
    name: "Fiona Zhang",
    email: "fiona@datalab.ai",
    company: "DataLab",
    tier: "general",
    checkedIn: false,
    registeredSessions: ["sess2", "sess5", "sess9"],
    dietaryRestrictions: "",
    tshirtSize: "S",
    notes: "",
  },
  {
    id: "a7",
    name: "George Okafor",
    email: "george@secfirm.com",
    company: "SecFirm",
    tier: "general",
    checkedIn: true,
    registeredSessions: ["sess3", "sess6", "sess10"],
    dietaryRestrictions: "halal",
    tshirtSize: "L",
    notes: "",
  },
  {
    id: "a8",
    name: "Hannah Müller",
    email: "hannah@devshop.de",
    company: "DevShop GmbH",
    tier: "general",
    checkedIn: false,
    registeredSessions: ["sess4", "sess8", "sess9"],
    dietaryRestrictions: "",
    tshirtSize: "M",
    notes: "Traveling from Germany",
  },
  {
    id: "a9",
    name: "Irene Costa",
    email: "irene@uistudio.br",
    company: "UI Studio",
    tier: "sponsor",
    checkedIn: true,
    registeredSessions: ["sess5", "sess7"],
    dietaryRestrictions: "vegetarian",
    tshirtSize: "S",
    notes: "Silver sponsor representative",
  },
  {
    id: "a10",
    name: "Jack Petrov",
    email: "jack@cloudstart.io",
    company: "CloudStart",
    tier: "staff",
    checkedIn: true,
    registeredSessions: ["sess7", "sess10"],
    dietaryRestrictions: "",
    tshirtSize: "L",
    notes: "Volunteer coordinator",
  },
];

export default function ConferenceManager() {
  const [speakers, setSpeakers] = useState(INITIAL_SPEAKERS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [attendees, setAttendees] = useState(INITIAL_ATTENDEES);
  const [venues] = useState(VENUES);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [filterConfirmed, setFilterConfirmed] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showCreateSpeakerModal, setShowCreateSpeakerModal] = useState(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [showCreateAttendeeModal, setShowCreateAttendeeModal] = useState(false);
  const [showScheduleConflicts, setShowScheduleConflicts] = useState(false);
  const [editingSpeakerId, setEditingSpeakerId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingAttendeeId, setEditingAttendeeId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("confManagerTheme");
    if (savedTheme === "dark") setIsDarkMode(true);
    const savedView = localStorage.getItem("confManagerView");
    if (savedView) setActiveView(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem("confManagerTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("confManagerView", activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem("confSpeakers", JSON.stringify(speakers));
  }, [speakers]);

  useEffect(() => {
    localStorage.setItem("confSessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("confAttendees", JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedSpeaker(null);
        setSelectedSession(null);
        setSelectedAttendee(null);
        setShowCreateSpeakerModal(false);
        setShowCreateSessionModal(false);
        setShowCreateAttendeeModal(false);
        setShowScheduleConflicts(false);
        setShowNotifications(false);
        setFeedbackModal(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now().toString();
    setNotifications((prev) => [
      ...prev,
      { id, message, type, timestamp: Date.now() },
    ]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const scheduleConflicts = useMemo(() => {
    const conflicts = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const a = sessions[i];
        const b = sessions[j];
        if (a.day !== b.day) continue;
        const aStart = TIME_SLOTS.indexOf(a.timeSlot);
        const aEnd = aStart + Math.ceil(a.duration / 30);
        const bStart = TIME_SLOTS.indexOf(b.timeSlot);
        const bEnd = bStart + Math.ceil(b.duration / 30);
        if (aStart < bEnd && bStart < aEnd) {
          if (a.venueId === b.venueId) {
            conflicts.push({
              type: "venue",
              sessions: [a, b],
              venue: venues.find((v) => v.id === a.venueId)?.name,
            });
          }
          const sharedSpeakers = a.speakerIds.filter((id) =>
            b.speakerIds.includes(id)
          );
          if (sharedSpeakers.length > 0) {
            conflicts.push({
              type: "speaker",
              sessions: [a, b],
              speakerNames: sharedSpeakers.map(
                (id) => speakers.find((s) => s.id === id)?.name
              ),
            });
          }
        }
      }
    }
    return conflicts;
  }, [sessions, venues, speakers]);

  const conferenceStats = useMemo(() => {
    const totalAttendees = attendees.length;
    const checkedIn = attendees.filter((a) => a.checkedIn).length;
    const confirmedSpeakers = speakers.filter((s) => s.confirmed).length;
    const totalSessions = sessions.length;
    const day1Sessions = sessions.filter((s) => s.day === 1).length;
    const day2Sessions = sessions.filter((s) => s.day === 2).length;
    const avgRating =
      sessions.reduce((sum, s) => {
        const ratings = s.feedback.map((f) => f.rating);
        return (
          sum +
          (ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0)
        );
      }, 0) / sessions.filter((s) => s.feedback.length > 0).length || 0;
    const trackDistribution = {};
    sessions.forEach((s) => {
      trackDistribution[s.track] = (trackDistribution[s.track] || 0) + 1;
    });
    const venueUtilization = venues.map((v) => {
      const venueSessions = sessions.filter((s) => s.venueId === v.id);
      const totalMinutes = venueSessions.reduce(
        (sum, s) => sum + s.duration,
        0
      );
      return {
        venue: v.name,
        sessions: venueSessions.length,
        minutes: totalMinutes,
        utilization: Math.round((totalMinutes / (8 * 60 * 2)) * 100),
      };
    });
    return {
      totalAttendees,
      checkedIn,
      confirmedSpeakers,
      totalSpeakers: speakers.length,
      totalSessions,
      day1Sessions,
      day2Sessions,
      avgRating,
      trackDistribution,
      venueUtilization,
      conflicts: scheduleConflicts.length,
    };
  }, [attendees, speakers, sessions, venues, scheduleConflicts]);

  const getSpeakerById = useCallback(
    (id) => speakers.find((s) => s.id === id),
    [speakers]
  );
  const getVenueById = useCallback(
    (id) => venues.find((v) => v.id === id),
    [venues]
  );
  const getSessionById = useCallback(
    (id) => sessions.find((s) => s.id === id),
    [sessions]
  );
  const getAttendeeById = useCallback(
    (id) => attendees.find((a) => a.id === id),
    [attendees]
  );

  const filteredSpeakers = useMemo(() => {
    let result = [...speakers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.company.toLowerCase().includes(q) ||
          s.expertise.some((e) => e.includes(q))
      );
    }
    if (filterConfirmed === "confirmed")
      result = result.filter((s) => s.confirmed);
    if (filterConfirmed === "pending")
      result = result.filter((s) => !s.confirmed);
    result.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortBy === "name") return dir * a.name.localeCompare(b.name);
      if (sortBy === "company") return dir * a.company.localeCompare(b.company);
      if (sortBy === "sessions")
        return dir * (a.sessions.length - b.sessions.length);
      return 0;
    });
    return result;
  }, [speakers, searchQuery, filterConfirmed, sortBy, sortDirection]);

  const filteredSessions = useMemo(() => {
    let result = [...sessions];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.tags.some((t) => t.includes(q)) ||
          s.speakerIds.some((id) =>
            getSpeakerById(id)?.name.toLowerCase().includes(q)
          )
      );
    }
    if (filterTrack !== "all")
      result = result.filter((s) => s.track === filterTrack);
    if (filterDay !== "all")
      result = result.filter((s) => s.day === parseInt(filterDay));
    if (filterType !== "all")
      result = result.filter((s) => s.type === filterType);
    result.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortBy === "time")
        return (
          dir *
          (a.day * 100 +
            TIME_SLOTS.indexOf(a.timeSlot) -
            (b.day * 100 + TIME_SLOTS.indexOf(b.timeSlot)))
        );
      if (sortBy === "title") return dir * a.title.localeCompare(b.title);
      if (sortBy === "track") return dir * a.track.localeCompare(b.track);
      if (sortBy === "attendees")
        return (
          dir * (a.registeredAttendees.length - b.registeredAttendees.length)
        );
      return 0;
    });
    return result;
  }, [
    sessions,
    searchQuery,
    filterTrack,
    filterDay,
    filterType,
    sortBy,
    sortDirection,
    getSpeakerById,
  ]);

  const filteredAttendees = useMemo(() => {
    let result = [...attendees];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q)
      );
    }
    if (filterTier !== "all")
      result = result.filter((a) => a.tier === filterTier);
    result.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortBy === "name") return dir * a.name.localeCompare(b.name);
      if (sortBy === "company") return dir * a.company.localeCompare(b.company);
      if (sortBy === "tier") return dir * a.tier.localeCompare(b.tier);
      if (sortBy === "sessions")
        return (
          dir * (a.registeredSessions.length - b.registeredSessions.length)
        );
      return 0;
    });
    return result;
  }, [attendees, searchQuery, filterTier, sortBy, sortDirection]);

  const handleCreateSpeaker = (formData) => {
    const newSpeaker = {
      id: "s" + (speakers.length + 1),
      ...formData,
      sessions: [],
      confirmed: false,
      travelArranged: false,
    };
    setSpeakers((prev) => [...prev, newSpeaker]);
    setShowCreateSpeakerModal(false);
    addNotification(`Speaker "${formData.name}" added successfully`, "success");
  };

  const handleUpdateSpeaker = (id, updates) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    setEditingSpeakerId(null);
    addNotification("Speaker updated successfully", "success");
  };

  const handleDeleteSpeaker = (id) => {
    const speaker = getSpeakerById(id);
    if (
      !window.confirm(
        `Remove speaker "${speaker?.name}"? They will be removed from all assigned sessions.`
      )
    )
      return;
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        speakerIds: s.speakerIds.filter((sid) => sid !== id),
      }))
    );
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    setSelectedSpeaker(null);
    addNotification(`Speaker "${speaker?.name}" removed`, "info");
  };

  const handleToggleSpeakerConfirmation = (id) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, confirmed: !s.confirmed } : s))
    );
    const speaker = getSpeakerById(id);
    addNotification(
      `${speaker?.name} ${speaker?.confirmed ? "unconfirmed" : "confirmed"}`,
      "success"
    );
  };

  const handleCreateSession = (formData) => {
    const newSession = {
      id: "sess" + (sessions.length + 1),
      ...formData,
      registeredAttendees: [],
      feedback: [],
    };
    setSessions((prev) => [...prev, newSession]);
    formData.speakerIds.forEach((sid) => {
      setSpeakers((prev) =>
        prev.map((s) =>
          s.id === sid ? { ...s, sessions: [...s.sessions, newSession.id] } : s
        )
      );
    });
    setShowCreateSessionModal(false);
    addNotification(`Session "${formData.title}" created`, "success");
  };

  const handleUpdateSession = (id, updates) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    setEditingSessionId(null);
    addNotification("Session updated successfully", "success");
  };

  const handleDeleteSession = (id) => {
    const session = getSessionById(id);
    if (
      !window.confirm(
        `Delete session "${session?.title}"? All registrations will be lost.`
      )
    )
      return;
    setSpeakers((prev) =>
      prev.map((s) => ({
        ...s,
        sessions: s.sessions.filter((sid) => sid !== id),
      }))
    );
    setAttendees((prev) =>
      prev.map((a) => ({
        ...a,
        registeredSessions: a.registeredSessions.filter((sid) => sid !== id),
      }))
    );
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setSelectedSession(null);
    addNotification(`Session "${session?.title}" deleted`, "info");
  };

  const handleCreateAttendee = (formData) => {
    const newAttendee = {
      id: "a" + (attendees.length + 1),
      ...formData,
      checkedIn: false,
      registeredSessions: [],
      notes: "",
    };
    setAttendees((prev) => [...prev, newAttendee]);
    setShowCreateAttendeeModal(false);
    addNotification(`Attendee "${formData.name}" registered`, "success");
  };

  const handleUpdateAttendee = (id, updates) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    setEditingAttendeeId(null);
    addNotification("Attendee updated successfully", "success");
  };

  const handleDeleteAttendee = (id) => {
    const attendee = getAttendeeById(id);
    if (!window.confirm(`Remove attendee "${attendee?.name}"?`)) return;
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        registeredAttendees: s.registeredAttendees.filter((aid) => aid !== id),
      }))
    );
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    setSelectedAttendee(null);
    addNotification(`Attendee "${attendee?.name}" removed`, "info");
  };

  const handleToggleCheckIn = (id) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checkedIn: !a.checkedIn } : a))
    );
    const attendee = getAttendeeById(id);
    addNotification(
      `${attendee?.name} ${attendee?.checkedIn ? "checked out" : "checked in"}`,
      "success"
    );
  };

  const handleRegisterForSession = (attendeeId, sessionId) => {
    const session = getSessionById(sessionId);
    if (session && session.registeredAttendees.length >= session.maxAttendees) {
      addNotification("Session is full", "error");
      return;
    }
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              registeredAttendees: [...s.registeredAttendees, attendeeId],
            }
          : s
      )
    );
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? { ...a, registeredSessions: [...a.registeredSessions, sessionId] }
          : a
      )
    );
    addNotification("Registered for session", "success");
  };

  const handleUnregisterFromSession = (attendeeId, sessionId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              registeredAttendees: s.registeredAttendees.filter(
                (id) => id !== attendeeId
              ),
            }
          : s
      )
    );
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? {
              ...a,
              registeredSessions: a.registeredSessions.filter(
                (id) => id !== sessionId
              ),
            }
          : a
      )
    );
    addNotification("Unregistered from session", "info");
  };

  const handleSubmitFeedback = (sessionId, attendeeId, rating, comment) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, feedback: [...s.feedback, { attendeeId, rating, comment }] }
          : s
      )
    );
    setFeedbackModal(null);
    addNotification("Feedback submitted", "success");
  };

  const bg = isDarkMode ? "#1a1a2e" : "#f8fafc";
  const cardBg = isDarkMode ? "#16213e" : "#ffffff";
  const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
  const mutedColor = isDarkMode ? "#94a3b8" : "#64748b";
  const borderColor = isDarkMode ? "#334155" : "#e2e8f0";
  const accentColor = "#6366f1";
  const sidebarBg = isDarkMode ? "#0f172a" : "#1e293b";

  const renderDashboard = () => (
    <div style={{ padding: "24px" }}>
      <h2 style={{ color: textColor, marginBottom: "24px", fontSize: "24px" }}>
        Conference Dashboard
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total Attendees",
            value: conferenceStats.totalAttendees,
            sub: `${conferenceStats.checkedIn} checked in`,
          },
          {
            label: "Speakers",
            value: `${conferenceStats.confirmedSpeakers}/${conferenceStats.totalSpeakers}`,
            sub: "confirmed",
          },
          {
            label: "Sessions",
            value: conferenceStats.totalSessions,
            sub: `Day 1: ${conferenceStats.day1Sessions} | Day 2: ${conferenceStats.day2Sessions}`,
          },
          {
            label: "Avg Rating",
            value: conferenceStats.avgRating.toFixed(1),
            sub: `${conferenceStats.conflicts} conflicts`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: cardBg,
              borderRadius: "12px",
              padding: "20px",
              border: `1px solid ${borderColor}`,
            }}
          >
            <div
              style={{
                color: mutedColor,
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{ color: textColor, fontSize: "28px", fontWeight: "bold" }}
            >
              {stat.value}
            </div>
            <div
              style={{ color: mutedColor, fontSize: "12px", marginTop: "4px" }}
            >
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "16px" }}>
            Track Distribution
          </h3>
          {Object.entries(conferenceStats.trackDistribution).map(
            ([track, count]) => (
              <div
                key={track}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    color: mutedColor,
                    width: "100px",
                    textTransform: "capitalize",
                  }}
                >
                  {track}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "20px",
                    background: borderColor,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        (count / conferenceStats.totalSessions) * 100
                      }%`,
                      height: "100%",
                      background: accentColor,
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <span
                  style={{
                    color: textColor,
                    marginLeft: "8px",
                    minWidth: "20px",
                  }}
                >
                  {count}
                </span>
              </div>
            )
          )}
        </div>
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "16px" }}>
            Venue Utilization
          </h3>
          {conferenceStats.venueUtilization
            .filter((v) => v.sessions > 0)
            .map((v) => (
              <div
                key={v.venue}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    color: mutedColor,
                    width: "140px",
                    fontSize: "13px",
                  }}
                >
                  {v.venue}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "20px",
                    background: borderColor,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${v.utilization}%`,
                      height: "100%",
                      background: "#22c55e",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <span
                  style={{
                    color: textColor,
                    marginLeft: "8px",
                    minWidth: "35px",
                    fontSize: "13px",
                  }}
                >
                  {v.utilization}%
                </span>
              </div>
            ))}
        </div>
      </div>
      {scheduleConflicts.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ color: "#dc2626", marginBottom: "12px" }}>
            ⚠️ Schedule Conflicts ({scheduleConflicts.length})
          </h3>
          {scheduleConflicts.slice(0, 3).map((conflict, i) => (
            <div
              key={i}
              style={{
                color: "#991b1b",
                fontSize: "14px",
                marginBottom: "4px",
              }}
            >
              {conflict.type === "venue"
                ? `Venue conflict: "${conflict.sessions[0].title}" and "${conflict.sessions[1].title}" in ${conflict.venue}`
                : `Speaker conflict: ${conflict.speakerNames?.join(
                    ", "
                  )} double-booked in "${conflict.sessions[0].title}" and "${
                    conflict.sessions[1].title
                  }"`}
            </div>
          ))}
          {scheduleConflicts.length > 3 && (
            <div
              style={{ color: "#991b1b", fontSize: "13px", marginTop: "4px" }}
            >
              +{scheduleConflicts.length - 3} more conflicts
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSpeakers = () => (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ color: textColor, fontSize: "24px" }}>
          Speakers ({filteredSpeakers.length})
        </h2>
        <button
          onClick={() => setShowCreateSpeakerModal(true)}
          style={{
            background: accentColor,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + Add Speaker
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <select
          aria-label="Filter by confirmation"
          value={filterConfirmed}
          onChange={(e) => setFilterConfirmed(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
        </select>
        <select
          aria-label="Sort speakers"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="company">Sort by Company</option>
          <option value="sessions">Sort by Sessions</option>
        </select>
        <button
          aria-label="Toggle sort direction"
          onClick={() =>
            setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
          }
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
            cursor: "pointer",
          }}
        >
          {sortDirection === "asc" ? "↑" : "↓"}
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        {filteredSpeakers.map((speaker) => (
          <div
            key={speaker.id}
            onClick={() => setSelectedSpeaker(speaker.id)}
            style={{
              background: cardBg,
              borderRadius: "12px",
              padding: "20px",
              border: `1px solid ${borderColor}`,
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "32px" }}>{speaker.avatar}</span>
              <div>
                <div
                  style={{
                    color: textColor,
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  {speaker.name}
                </div>
                <div style={{ color: mutedColor, fontSize: "13px" }}>
                  {speaker.role} at {speaker.company}
                </div>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: speaker.confirmed ? "#dcfce7" : "#fef9c3",
                  color: speaker.confirmed ? "#166534" : "#854d0e",
                }}
              >
                {speaker.confirmed ? "Confirmed" : "Pending"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginBottom: "8px",
              }}
            >
              {speaker.expertise.map((exp) => (
                <span
                  key={exp}
                  style={{
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    background: isDarkMode ? "#334155" : "#f1f5f9",
                    color: mutedColor,
                    textTransform: "capitalize",
                  }}
                >
                  {exp}
                </span>
              ))}
            </div>
            <div style={{ color: mutedColor, fontSize: "13px" }}>
              {speaker.sessions.length} session(s) |{" "}
              {speaker.travelArranged
                ? "✈️ Travel arranged"
                : "🔴 Travel pending"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpeakerDetail = () => {
    const speaker = getSpeakerById(selectedSpeaker);
    if (!speaker) return null;
    const speakerSessions = sessions.filter((s) =>
      s.speakerIds.includes(speaker.id)
    );
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "16px",
            padding: "32px",
            width: "600px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <span style={{ fontSize: "48px" }}>{speaker.avatar}</span>
              <div>
                <h2 style={{ color: textColor, marginBottom: "4px" }}>
                  {speaker.name}
                </h2>
                <div style={{ color: mutedColor }}>
                  {speaker.role} at {speaker.company}
                </div>
                <div style={{ color: accentColor, fontSize: "14px" }}>
                  {speaker.twitter}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedSpeaker(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: mutedColor,
              }}
            >
              ×
            </button>
          </div>
          <p
            style={{
              color: textColor,
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            {speaker.bio}
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              onClick={() => handleToggleSpeakerConfirmation(speaker.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: speaker.confirmed ? "#fef9c3" : "#dcfce7",
                color: speaker.confirmed ? "#854d0e" : "#166534",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {speaker.confirmed ? "Unconfirm" : "Confirm"}
            </button>
            <button
              onClick={() => setEditingSpeakerId(speaker.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                cursor: "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteSpeaker(speaker.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#fee2e2",
                color: "#dc2626",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
          <h3 style={{ color: textColor, marginBottom: "12px" }}>
            Assigned Sessions ({speakerSessions.length})
          </h3>
          {speakerSessions.map((session) => (
            <div
              key={session.id}
              style={{
                background: isDarkMode ? "#1e293b" : "#f8fafc",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "8px",
                border: `1px solid ${borderColor}`,
              }}
            >
              <div style={{ color: textColor, fontWeight: "600" }}>
                {session.title}
              </div>
              <div style={{ color: mutedColor, fontSize: "13px" }}>
                Day {session.day} | {session.timeSlot} | {session.duration}min |{" "}
                {getVenueById(session.venueId)?.name}
              </div>
            </div>
          ))}
          <div
            style={{ color: mutedColor, fontSize: "13px", marginTop: "12px" }}
          >
            Email: {speaker.email}
          </div>
        </div>
      </div>
    );
  };

  const renderSessions = () => (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ color: textColor, fontSize: "24px" }}>
          Sessions ({filteredSessions.length})
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowScheduleConflicts(true)}
            style={{
              background: scheduleConflicts.length > 0 ? "#fee2e2" : cardBg,
              color: scheduleConflicts.length > 0 ? "#dc2626" : textColor,
              border: `1px solid ${
                scheduleConflicts.length > 0 ? "#fecaca" : borderColor
              }`,
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            ⚠️ Conflicts ({scheduleConflicts.length})
          </button>
          <button
            onClick={() => setShowCreateSessionModal(true)}
            style={{
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            + Add Session
          </button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <select
          aria-label="Filter by track"
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="all">All Tracks</option>
          {TRACKS.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by day"
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="all">All Days</option>
          <option value="1">Day 1</option>
          <option value="2">Day 2</option>
        </select>
        <select
          aria-label="Filter by type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="all">All Types</option>
          {SESSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort sessions"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="time">Sort by Time</option>
          <option value="title">Sort by Title</option>
          <option value="track">Sort by Track</option>
          <option value="attendees">Sort by Attendees</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredSessions.map((session) => {
          const venue = getVenueById(session.venueId);
          const sessionSpeakers = session.speakerIds
            .map((id) => getSpeakerById(id))
            .filter(Boolean);
          const capacityPct = Math.round(
            (session.registeredAttendees.length / session.maxAttendees) * 100
          );
          return (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session.id)}
              style={{
                background: cardBg,
                borderRadius: "12px",
                padding: "20px",
                border: `1px solid ${borderColor}`,
                cursor: "pointer",
                display: "flex",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: "80px", textAlign: "center" }}>
                <div
                  style={{
                    color: accentColor,
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Day {session.day}
                </div>
                <div
                  style={{
                    color: textColor,
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {session.timeSlot}
                </div>
                <div style={{ color: mutedColor, fontSize: "12px" }}>
                  {session.duration}min
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: isDarkMode ? "#334155" : "#e0e7ff",
                      color: accentColor,
                      textTransform: "capitalize",
                    }}
                  >
                    {session.type}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      background: isDarkMode ? "#334155" : "#f1f5f9",
                      color: mutedColor,
                      textTransform: "capitalize",
                    }}
                  >
                    {session.track}
                  </span>
                </div>
                <div
                  style={{
                    color: textColor,
                    fontWeight: "600",
                    fontSize: "16px",
                    marginBottom: "4px",
                  }}
                >
                  {session.title}
                </div>
                <div style={{ color: mutedColor, fontSize: "13px" }}>
                  {sessionSpeakers.map((s) => s.name).join(", ")} |{" "}
                  {venue?.name}
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: "100px" }}>
                <div style={{ color: textColor, fontWeight: "600" }}>
                  {session.registeredAttendees.length}/{session.maxAttendees}
                </div>
                <div
                  style={{
                    height: "6px",
                    width: "80px",
                    background: borderColor,
                    borderRadius: "3px",
                    marginTop: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${capacityPct}%`,
                      height: "100%",
                      background:
                        capacityPct > 90
                          ? "#dc2626"
                          : capacityPct > 70
                          ? "#f59e0b"
                          : "#22c55e",
                      borderRadius: "3px",
                    }}
                  />
                </div>
                <div
                  style={{
                    color: mutedColor,
                    fontSize: "11px",
                    marginTop: "2px",
                  }}
                >
                  {capacityPct}% full
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSessionDetail = () => {
    const session = getSessionById(selectedSession);
    if (!session) return null;
    const venue = getVenueById(session.venueId);
    const sessionSpeakers = session.speakerIds
      .map((id) => getSpeakerById(id))
      .filter(Boolean);
    const sessionAttendees = session.registeredAttendees
      .map((id) => getAttendeeById(id))
      .filter(Boolean);
    const avgFeedback =
      session.feedback.length > 0
        ? (
            session.feedback.reduce((sum, f) => sum + f.rating, 0) /
            session.feedback.length
          ).toFixed(1)
        : "N/A";
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "16px",
            padding: "32px",
            width: "700px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: "#e0e7ff",
                    color: accentColor,
                    textTransform: "capitalize",
                  }}
                >
                  {session.type}
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    background: "#f1f5f9",
                    color: mutedColor,
                    textTransform: "capitalize",
                  }}
                >
                  {session.track}
                </span>
              </div>
              <h2 style={{ color: textColor, marginBottom: "4px" }}>
                {session.title}
              </h2>
              <div style={{ color: mutedColor }}>
                Day {session.day} | {session.timeSlot} | {session.duration}min |{" "}
                {venue?.name}
              </div>
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: mutedColor,
              }}
            >
              ×
            </button>
          </div>
          <p
            style={{
              color: textColor,
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            {session.description}
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              onClick={() => setEditingSessionId(session.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                cursor: "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteSession(session.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#fee2e2",
                color: "#dc2626",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setFeedbackModal(session.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                cursor: "pointer",
              }}
            >
              Add Feedback
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            {session.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  background: isDarkMode ? "#334155" : "#f1f5f9",
                  color: mutedColor,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <h3 style={{ color: textColor, marginBottom: "12px" }}>Speakers</h3>
          {sessionSpeakers.map((speaker) => (
            <div
              key={speaker.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
                padding: "8px",
                borderRadius: "8px",
                background: isDarkMode ? "#1e293b" : "#f8fafc",
              }}
            >
              <span style={{ fontSize: "24px" }}>{speaker.avatar}</span>
              <div>
                <div style={{ color: textColor, fontWeight: "600" }}>
                  {speaker.name}
                </div>
                <div style={{ color: mutedColor, fontSize: "13px" }}>
                  {speaker.company}
                </div>
              </div>
            </div>
          ))}
          <h3
            style={{
              color: textColor,
              marginTop: "16px",
              marginBottom: "12px",
            }}
          >
            Venue Details
          </h3>
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: isDarkMode ? "#1e293b" : "#f8fafc",
              border: `1px solid ${borderColor}`,
              marginBottom: "16px",
            }}
          >
            <div style={{ color: textColor, fontWeight: "600" }}>
              {venue?.name}
            </div>
            <div style={{ color: mutedColor, fontSize: "13px" }}>
              Floor {venue?.floor} | Capacity: {venue?.capacity} | Equipment:{" "}
              {venue?.equipment.join(", ")}
            </div>
          </div>
          <h3 style={{ color: textColor, marginBottom: "12px" }}>
            Registered Attendees ({sessionAttendees.length}/
            {session.maxAttendees})
          </h3>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {sessionAttendees.map((attendee) => (
              <div
                key={attendee.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px",
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <div>
                  <span style={{ color: textColor }}>{attendee.name}</span>
                  <span
                    style={{
                      color: mutedColor,
                      fontSize: "13px",
                      marginLeft: "8px",
                    }}
                  >
                    {attendee.company}
                  </span>
                </div>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    textTransform: "capitalize",
                    background: attendee.checkedIn ? "#dcfce7" : "#fef9c3",
                    color: attendee.checkedIn ? "#166534" : "#854d0e",
                  }}
                >
                  {attendee.checkedIn ? "Checked in" : "Not arrived"}
                </span>
              </div>
            ))}
          </div>
          {session.feedback.length > 0 && (
            <>
              <h3
                style={{
                  color: textColor,
                  marginTop: "16px",
                  marginBottom: "12px",
                }}
              >
                Feedback (Avg: {avgFeedback} ⭐)
              </h3>
              {session.feedback.map((fb, i) => {
                const fbAttendee = getAttendeeById(fb.attendeeId);
                return (
                  <div
                    key={i}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      marginBottom: "8px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: textColor, fontWeight: "600" }}>
                        {fbAttendee?.name || "Anonymous"}
                      </span>
                      <span style={{ color: "#f59e0b" }}>
                        {"⭐".repeat(fb.rating)}
                      </span>
                    </div>
                    {fb.comment && (
                      <div
                        style={{
                          color: mutedColor,
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        {fb.comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderAttendees = () => (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ color: textColor, fontSize: "24px" }}>
          Attendees ({filteredAttendees.length})
        </h2>
        <button
          onClick={() => setShowCreateAttendeeModal(true)}
          style={{
            background: accentColor,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + Register Attendee
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <select
          aria-label="Filter by tier"
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="all">All Tiers</option>
          {ATTENDEE_TIERS.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort attendees"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color: textColor,
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="company">Sort by Company</option>
          <option value="tier">Sort by Tier</option>
          <option value="sessions">Sort by Sessions</option>
        </select>
      </div>
      <div
        style={{
          borderRadius: "12px",
          border: `1px solid ${borderColor}`,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: isDarkMode ? "#1e293b" : "#f8fafc" }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: mutedColor,
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: mutedColor,
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Company
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: mutedColor,
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Tier
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  color: mutedColor,
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Sessions
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  color: mutedColor,
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  color: mutedColor,
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendees.map((attendee) => (
              <tr
                key={attendee.id}
                onClick={() => setSelectedAttendee(attendee.id)}
                style={{
                  borderTop: `1px solid ${borderColor}`,
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ color: textColor, fontWeight: "600" }}>
                    {attendee.name}
                  </div>
                  <div style={{ color: mutedColor, fontSize: "13px" }}>
                    {attendee.email}
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: textColor }}>
                  {attendee.company}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      background:
                        attendee.tier === "vip"
                          ? "#fef9c3"
                          : attendee.tier === "sponsor"
                          ? "#e0e7ff"
                          : attendee.tier === "staff"
                          ? "#dcfce7"
                          : "#f1f5f9",
                      color:
                        attendee.tier === "vip"
                          ? "#854d0e"
                          : attendee.tier === "sponsor"
                          ? "#4338ca"
                          : attendee.tier === "staff"
                          ? "#166534"
                          : mutedColor,
                    }}
                  >
                    {attendee.tier}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    color: textColor,
                  }}
                >
                  {attendee.registeredSessions.length}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      background: attendee.checkedIn ? "#dcfce7" : "#fee2e2",
                      color: attendee.checkedIn ? "#166534" : "#991b1b",
                    }}
                  >
                    {attendee.checkedIn ? "Checked In" : "Not Arrived"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCheckIn(attendee.id);
                    }}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${borderColor}`,
                      background: cardBg,
                      color: textColor,
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    {attendee.checkedIn ? "Check Out" : "Check In"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendeeDetail = () => {
    const attendee = getAttendeeById(selectedAttendee);
    if (!attendee) return null;
    const attendeeSessions = sessions.filter((s) =>
      attendee.registeredSessions.includes(s.id)
    );
    const availableSessions = sessions.filter(
      (s) =>
        !attendee.registeredSessions.includes(s.id) &&
        s.registeredAttendees.length < s.maxAttendees
    );
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "16px",
            padding: "32px",
            width: "650px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "24px",
            }}
          >
            <div>
              <h2 style={{ color: textColor, marginBottom: "4px" }}>
                {attendee.name}
              </h2>
              <div style={{ color: mutedColor }}>
                {attendee.company} | {attendee.email}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "capitalize",
                    background: attendee.tier === "vip" ? "#fef9c3" : "#f1f5f9",
                    color: attendee.tier === "vip" ? "#854d0e" : mutedColor,
                  }}
                >
                  {attendee.tier}
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    background: attendee.checkedIn ? "#dcfce7" : "#fee2e2",
                    color: attendee.checkedIn ? "#166534" : "#991b1b",
                  }}
                >
                  {attendee.checkedIn ? "Checked In" : "Not Arrived"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedAttendee(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: mutedColor,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              onClick={() => handleToggleCheckIn(attendee.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: attendee.checkedIn ? "#fef9c3" : "#dcfce7",
                color: attendee.checkedIn ? "#854d0e" : "#166534",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {attendee.checkedIn ? "Check Out" : "Check In"}
            </button>
            <button
              onClick={() => setEditingAttendeeId(attendee.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                cursor: "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteAttendee(attendee.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#fee2e2",
                color: "#dc2626",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
          {attendee.dietaryRestrictions && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#fef9c3",
                color: "#854d0e",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              🍽️ Dietary: {attendee.dietaryRestrictions}
            </div>
          )}
          {attendee.notes && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: isDarkMode ? "#1e293b" : "#f8fafc",
                color: mutedColor,
                fontSize: "14px",
                marginBottom: "16px",
                border: `1px solid ${borderColor}`,
              }}
            >
              📝 {attendee.notes}
            </div>
          )}
          <div
            style={{
              color: mutedColor,
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            T-Shirt Size: {attendee.tshirtSize}
          </div>
          <h3 style={{ color: textColor, marginBottom: "12px" }}>
            Registered Sessions ({attendeeSessions.length})
          </h3>
          {attendeeSessions.map((session) => (
            <div
              key={session.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                borderRadius: "8px",
                background: isDarkMode ? "#1e293b" : "#f8fafc",
                marginBottom: "8px",
                border: `1px solid ${borderColor}`,
              }}
            >
              <div>
                <div style={{ color: textColor, fontWeight: "600" }}>
                  {session.title}
                </div>
                <div style={{ color: mutedColor, fontSize: "13px" }}>
                  Day {session.day} | {session.timeSlot} | {session.type}
                </div>
              </div>
              <button
                onClick={() =>
                  handleUnregisterFromSession(attendee.id, session.id)
                }
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#fee2e2",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Unregister
              </button>
            </div>
          ))}
          {availableSessions.length > 0 && (
            <>
              <h3
                style={{
                  color: textColor,
                  marginTop: "16px",
                  marginBottom: "12px",
                }}
              >
                Available Sessions
              </h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {availableSessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      borderRadius: "8px",
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      marginBottom: "8px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <div>
                      <div style={{ color: textColor, fontWeight: "600" }}>
                        {session.title}
                      </div>
                      <div style={{ color: mutedColor, fontSize: "13px" }}>
                        Day {session.day} | {session.timeSlot} |{" "}
                        {session.registeredAttendees.length}/
                        {session.maxAttendees}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleRegisterForSession(attendee.id, session.id)
                      }
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#dcfce7",
                        color: "#166534",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Register
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderScheduleGrid = () => {
    const days = [1, 2];
    return (
      <div style={{ padding: "24px" }}>
        <h2
          style={{ color: textColor, marginBottom: "24px", fontSize: "24px" }}
        >
          Schedule Grid
        </h2>
        {days.map((day) => (
          <div key={day} style={{ marginBottom: "32px" }}>
            <h3 style={{ color: textColor, marginBottom: "16px" }}>
              Day {day}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "80px repeat(auto-fill, minmax(200px, 1fr))",
                gap: "4px",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  fontWeight: "600",
                  color: mutedColor,
                  fontSize: "13px",
                }}
              >
                Time
              </div>
              {venues
                .filter((v) => v.available)
                .map((venue) => (
                  <div
                    key={venue.id}
                    style={{
                      padding: "8px",
                      fontWeight: "600",
                      color: mutedColor,
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                  >
                    {venue.name}
                  </div>
                ))}
              {TIME_SLOTS.filter((_, i) => i % 2 === 0).map((slot) => (
                <div key={slot} style={{ display: "contents" }}>
                  <div
                    style={{
                      padding: "8px",
                      color: mutedColor,
                      fontSize: "13px",
                      borderTop: `1px solid ${borderColor}`,
                    }}
                  >
                    {slot}
                  </div>
                  {venues
                    .filter((v) => v.available)
                    .map((venue) => {
                      const session = sessions.find(
                        (s) =>
                          s.day === day &&
                          s.venueId === venue.id &&
                          s.timeSlot === slot
                      );
                      return (
                        <div
                          key={venue.id}
                          style={{
                            padding: "8px",
                            borderTop: `1px solid ${borderColor}`,
                            minHeight: "40px",
                          }}
                        >
                          {session && (
                            <div
                              onClick={() => setSelectedSession(session.id)}
                              style={{
                                background: accentColor + "20",
                                borderLeft: `3px solid ${accentColor}`,
                                borderRadius: "4px",
                                padding: "6px 8px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              <div
                                style={{ color: textColor, fontWeight: "600" }}
                              >
                                {session.title}
                              </div>
                              <div
                                style={{ color: mutedColor, fontSize: "11px" }}
                              >
                                {session.duration}min |{" "}
                                {session.speakerIds
                                  .map((id) => getSpeakerById(id)?.name)
                                  .join(", ")}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVenues = () => (
    <div style={{ padding: "24px" }}>
      <h2 style={{ color: textColor, marginBottom: "24px", fontSize: "24px" }}>
        Venues
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {venues.map((venue) => {
          const venueSessions = sessions.filter((s) => s.venueId === venue.id);
          return (
            <div
              key={venue.id}
              style={{
                background: cardBg,
                borderRadius: "12px",
                padding: "20px",
                border: `1px solid ${borderColor}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h3 style={{ color: textColor, margin: 0 }}>{venue.name}</h3>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    background: venue.available ? "#dcfce7" : "#fee2e2",
                    color: venue.available ? "#166534" : "#991b1b",
                  }}
                >
                  {venue.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <div
                style={{
                  color: mutedColor,
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Floor {venue.floor} | Capacity: {venue.capacity}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                {venue.equipment.map((eq) => (
                  <span
                    key={eq}
                    style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      background: isDarkMode ? "#334155" : "#f1f5f9",
                      color: mutedColor,
                    }}
                  >
                    {eq}
                  </span>
                ))}
              </div>
              <div
                style={{
                  color: textColor,
                  fontWeight: "600",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                {venueSessions.length} session(s) booked
              </div>
              {venueSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    fontSize: "13px",
                    color: mutedColor,
                    marginBottom: "4px",
                  }}
                >
                  Day {session.day} {session.timeSlot} — {session.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCreateSpeakerModal = () => {
    if (!showCreateSpeakerModal) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "16px",
            padding: "32px",
            width: "500px",
          }}
        >
          <h2 style={{ color: textColor, marginBottom: "24px" }}>
            Add New Speaker
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleCreateSpeaker({
                name: fd.get("name"),
                email: fd.get("email"),
                company: fd.get("company"),
                role: fd.get("role"),
                bio: fd.get("bio"),
                avatar: "👤",
                expertise: fd
                  .get("expertise")
                  .split(",")
                  .map((s) => s.trim().toLowerCase()),
                twitter: fd.get("twitter"),
              });
            }}
          >
            {["name", "email", "company", "role", "twitter"].map((field) => (
              <div key={field} style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                    textTransform: "capitalize",
                  }}
                >
                  {field}
                </label>
                <input
                  name={field}
                  required={field === "name" || field === "email"}
                  placeholder={`Enter ${field}`}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Expertise (comma-separated)
              </label>
              <input
                name="expertise"
                placeholder="e.g. frontend, design"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Speaker biography"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowCreateSpeakerModal(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: accentColor,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Add Speaker
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCreateSessionModal = () => {
    if (!showCreateSessionModal) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "16px",
            padding: "32px",
            width: "550px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h2 style={{ color: textColor, marginBottom: "24px" }}>
            Create New Session
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleCreateSession({
                title: fd.get("title"),
                type: fd.get("type"),
                track: fd.get("track"),
                speakerIds: fd
                  .get("speakers")
                  .split(",")
                  .map((s) => s.trim()),
                venueId: fd.get("venue"),
                timeSlot: fd.get("timeSlot"),
                duration: parseInt(fd.get("duration")),
                day: parseInt(fd.get("day")),
                description: fd.get("description"),
                maxAttendees: parseInt(fd.get("maxAttendees")),
                tags: fd
                  .get("tags")
                  .split(",")
                  .map((s) => s.trim().toLowerCase()),
              });
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Title
              </label>
              <input
                name="title"
                required
                placeholder="Session title"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  Type
                </label>
                <select
                  name="type"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  Track
                </label>
                <select
                  name="track"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {TRACKS.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  Day
                </label>
                <select
                  name="day"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  <option value="1">Day 1</option>
                  <option value="2">Day 2</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  Time Slot
                </label>
                <select
                  name="timeSlot"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  Duration (min)
                </label>
                <input
                  name="duration"
                  type="number"
                  defaultValue={45}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Venue
              </label>
              <select
                name="venue"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                }}
              >
                {venues
                  .filter((v) => v.available)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Cap: {v.capacity})
                    </option>
                  ))}
              </select>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Speaker IDs (comma-separated)
              </label>
              <input
                name="speakers"
                placeholder="e.g. s1, s2"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Max Attendees
              </label>
              <input
                name="maxAttendees"
                type="number"
                defaultValue={100}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Tags (comma-separated)
              </label>
              <input
                name="tags"
                placeholder="e.g. react, performance"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Session description"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowCreateSessionModal(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: accentColor,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Create Session
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCreateAttendeeModal = () => {
    if (!showCreateAttendeeModal) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "16px",
            padding: "32px",
            width: "500px",
          }}
        >
          <h2 style={{ color: textColor, marginBottom: "24px" }}>
            Register New Attendee
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleCreateAttendee({
                name: fd.get("name"),
                email: fd.get("email"),
                company: fd.get("company"),
                tier: fd.get("tier"),
                dietaryRestrictions: fd.get("dietary"),
                tshirtSize: fd.get("tshirtSize"),
              });
            }}
          >
            {["name", "email", "company"].map((field) => (
              <div key={field} style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                    textTransform: "capitalize",
                  }}
                >
                  {field}
                </label>
                <input
                  name={field}
                  required={field === "name" || field === "email"}
                  placeholder={`Enter ${field}`}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  Tier
                </label>
                <select
                  name="tier"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {ATTENDEE_TIERS.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: mutedColor,
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  T-Shirt Size
                </label>
                <select
                  name="tshirtSize"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: cardBg,
                    color: textColor,
                  }}
                >
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Dietary Restrictions
              </label>
              <input
                name="dietary"
                placeholder="e.g. vegetarian, vegan, gluten-free"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowCreateAttendeeModal(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: accentColor,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Register Attendee
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderFeedbackModal = () => {
    if (!feedbackModal) return null;
    const session = getSessionById(feedbackModal);
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001,
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "16px",
            padding: "32px",
            width: "450px",
          }}
        >
          <h2 style={{ color: textColor, marginBottom: "8px" }}>
            Submit Feedback
          </h2>
          <div style={{ color: mutedColor, marginBottom: "24px" }}>
            {session?.title}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              handleSubmitFeedback(
                feedbackModal,
                "a1",
                parseInt(fd.get("rating")),
                fd.get("comment")
              );
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                Rating
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((r) => (
                  <label key={r} style={{ cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="rating"
                      value={r}
                      required
                      style={{ display: "none" }}
                    />
                    <span
                      aria-label={`Rate ${r} stars`}
                      style={{ fontSize: "24px", opacity: 0.5 }}
                    >
                      ⭐
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: mutedColor,
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Comment
              </label>
              <textarea
                name="comment"
                rows={3}
                placeholder="Share your thoughts..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setFeedbackModal(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: cardBg,
                  color: textColor,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: accentColor,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderConflictsModal = () => {
    if (!showScheduleConflicts) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "16px",
            padding: "32px",
            width: "600px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h2 style={{ color: textColor }}>
              Schedule Conflicts ({scheduleConflicts.length})
            </h2>
            <button
              onClick={() => setShowScheduleConflicts(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: mutedColor,
              }}
            >
              ×
            </button>
          </div>
          {scheduleConflicts.length === 0 ? (
            <div
              style={{ color: "#22c55e", textAlign: "center", padding: "24px" }}
            >
              ✅ No schedule conflicts found!
            </div>
          ) : (
            scheduleConflicts.map((conflict, i) => (
              <div
                key={i}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    color: "#dc2626",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {conflict.type === "venue"
                    ? "🏢 Venue Conflict"
                    : "👤 Speaker Conflict"}
                </div>
                <div style={{ color: "#991b1b", fontSize: "14px" }}>
                  {conflict.type === "venue"
                    ? `Both sessions in ${conflict.venue}:`
                    : `${conflict.speakerNames?.join(", ")} double-booked:`}
                </div>
                {conflict.sessions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      color: "#991b1b",
                      fontSize: "13px",
                      marginTop: "4px",
                      paddingLeft: "12px",
                    }}
                  >
                    • {s.title} (Day {s.day}, {s.timeSlot})
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "speakers", label: "Speakers", icon: "🎤" },
    { id: "sessions", label: "Sessions", icon: "📅" },
    { id: "schedule", label: "Schedule", icon: "🗓️" },
    { id: "attendees", label: "Attendees", icon: "👥" },
    { id: "venues", label: "Venues", icon: "🏢" },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: bg,
      }}
    >
      <div
        style={{
          width: sidebarCollapsed ? "60px" : "220px",
          background: sidebarBg,
          padding: "16px 8px",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            padding: "0 8px",
          }}
        >
          {!sidebarCollapsed && (
            <div style={{ color: "#fff", fontWeight: "800", fontSize: "18px" }}>
              ConfHub
            </div>
          )}
          <button
            aria-label="Toggle sidebar"
            onClick={() => setSidebarCollapsed((c) => !c)}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSearchQuery("");
                setFilterTrack("all");
                setFilterDay("all");
                setFilterType("all");
                setFilterTier("all");
                setFilterConfirmed("all");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background:
                  activeView === item.id
                    ? "rgba(99, 102, 241, 0.2)"
                    : "transparent",
                color: activeView === item.id ? "#818cf8" : "#94a3b8",
                cursor: "pointer",
                fontSize: "14px",
                textAlign: "left",
                marginBottom: "4px",
                whiteSpace: "nowrap",
              }}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        {!sidebarCollapsed && (
          <div style={{ padding: "12px 8px", borderTop: "1px solid #334155" }}>
            <div style={{ color: "#94a3b8", fontSize: "12px" }}>
              {conferenceStats.checkedIn}/{conferenceStats.totalAttendees}{" "}
              checked in
            </div>
            <div style={{ color: "#94a3b8", fontSize: "12px" }}>
              {conferenceStats.confirmedSpeakers} speakers confirmed
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 24px",
            borderBottom: `1px solid ${borderColor}`,
            background: cardBg,
          }}
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: "8px",
              border: `1px solid ${borderColor}`,
              background: bg,
              color: textColor,
              outline: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <button
              aria-label="Show notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "#dc2626",
                    color: "#fff",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  width: "300px",
                  background: cardBg,
                  borderRadius: "12px",
                  border: `1px solid ${borderColor}`,
                  padding: "12px",
                  zIndex: 100,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <h4 style={{ color: textColor, marginBottom: "8px" }}>
                  Notifications
                </h4>
                {notifications.length === 0 ? (
                  <div style={{ color: mutedColor, fontSize: "14px" }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        marginBottom: "4px",
                        background:
                          n.type === "error"
                            ? "#fee2e2"
                            : n.type === "success"
                            ? "#dcfce7"
                            : "#f1f5f9",
                        color:
                          n.type === "error"
                            ? "#dc2626"
                            : n.type === "success"
                            ? "#166534"
                            : textColor,
                        fontSize: "13px",
                      }}
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            aria-label="Toggle theme"
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {activeView === "dashboard" && renderDashboard()}
          {activeView === "speakers" && renderSpeakers()}
          {activeView === "sessions" && renderSessions()}
          {activeView === "schedule" && renderScheduleGrid()}
          {activeView === "attendees" && renderAttendees()}
          {activeView === "venues" && renderVenues()}
        </div>
      </div>

      {selectedSpeaker && renderSpeakerDetail()}
      {selectedSession && renderSessionDetail()}
      {selectedAttendee && renderAttendeeDetail()}
      {renderCreateSpeakerModal()}
      {renderCreateSessionModal()}
      {renderCreateAttendeeModal()}
      {renderFeedbackModal()}
      {renderConflictsModal()}
    </div>
  );
}
