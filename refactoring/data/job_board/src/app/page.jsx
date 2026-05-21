import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Product',
  'Operations',
  'Finance',
  'Human Resources',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Director'];

const SALARY_RANGES = [
  { label: 'Any', min: 0, max: Infinity },
  { label: '$0 - $50k', min: 0, max: 50000 },
  { label: '$50k - $100k', min: 50000, max: 100000 },
  { label: '$100k - $150k', min: 100000, max: 150000 },
  { label: '$150k - $200k', min: 150000, max: 200000 },
  { label: '$200k+', min: 200000, max: Infinity },
];

const STATUS_COLORS = {
  Applied: '#3b82f6',
  'Under Review': '#f59e0b',
  Interview: '#8b5cf6',
  Offered: '#10b981',
  Rejected: '#ef4444',
  Withdrawn: '#6b7280',
};

const COMPANIES = [
  {
    id: 1,
    name: 'TechFlow Inc.',
    logo: 'TF',
    industry: 'Technology',
    size: '500-1000',
    location: 'San Francisco, CA',
    description: 'Leading cloud infrastructure company building the future of distributed systems.',
    rating: 4.5,
    reviewCount: 342,
  },
  {
    id: 2,
    name: 'DesignHub',
    logo: 'DH',
    industry: 'Design',
    size: '50-200',
    location: 'New York, NY',
    description: 'Award-winning design agency crafting digital experiences for global brands.',
    rating: 4.2,
    reviewCount: 128,
  },
  {
    id: 3,
    name: 'GreenScale',
    logo: 'GS',
    industry: 'CleanTech',
    size: '200-500',
    location: 'Austin, TX',
    description: 'Sustainable technology solutions for enterprise carbon footprint reduction.',
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: 4,
    name: 'DataNova',
    logo: 'DN',
    industry: 'Data Analytics',
    size: '1000-5000',
    location: 'Seattle, WA',
    description: 'Enterprise data analytics platform powering insights for Fortune 500 companies.',
    rating: 4.1,
    reviewCount: 567,
  },
  {
    id: 5,
    name: 'HealthBridge',
    logo: 'HB',
    industry: 'Healthcare',
    size: '200-500',
    location: 'Boston, MA',
    description: 'Digital health platform connecting patients with personalized care solutions.',
    rating: 4.4,
    reviewCount: 201,
  },
];

const INITIAL_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    companyId: 1,
    category: 'Engineering',
    type: 'Full-time',
    experience: 'Senior',
    salaryMin: 150000,
    salaryMax: 200000,
    location: 'San Francisco, CA',
    remote: true,
    description:
      'Build and maintain our React-based dashboard platform. Work with a team of 12 engineers on scalable UI architecture.',
    requirements: [
      '5+ years React experience',
      'TypeScript proficiency',
      'Experience with design systems',
      'Strong CS fundamentals',
    ],
    benefits: ['Health insurance', '401k matching', 'Unlimited PTO', 'Remote-first'],
    postedDate: '2025-01-15',
    deadline: '2025-03-15',
    applicants: 47,
  },
  {
    id: 2,
    title: 'Product Designer',
    companyId: 2,
    category: 'Design',
    type: 'Full-time',
    experience: 'Mid Level',
    salaryMin: 100000,
    salaryMax: 140000,
    location: 'New York, NY',
    remote: false,
    description:
      'Lead product design for our flagship SaaS platform. Collaborate with product managers and engineers.',
    requirements: [
      '3+ years product design',
      'Figma expertise',
      'User research experience',
      'Portfolio required',
    ],
    benefits: ['Health insurance', 'Annual bonus', 'Learning budget', 'Gym membership'],
    postedDate: '2025-01-20',
    deadline: '2025-03-20',
    applicants: 83,
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    companyId: 3,
    category: 'Engineering',
    type: 'Full-time',
    experience: 'Senior',
    salaryMin: 140000,
    salaryMax: 180000,
    location: 'Austin, TX',
    remote: true,
    description:
      'Design and manage cloud infrastructure for our sustainability platform. Implement CI/CD pipelines and monitoring.',
    requirements: [
      'AWS/GCP experience',
      'Kubernetes proficiency',
      'Terraform/IaC tools',
      'Linux administration',
    ],
    benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Conference budget'],
    postedDate: '2025-01-10',
    deadline: '2025-02-28',
    applicants: 29,
  },
  {
    id: 4,
    title: 'Marketing Manager',
    companyId: 4,
    category: 'Marketing',
    type: 'Full-time',
    experience: 'Mid Level',
    salaryMin: 90000,
    salaryMax: 120000,
    location: 'Seattle, WA',
    remote: false,
    description:
      'Lead marketing strategy for our enterprise data analytics platform. Manage campaigns, content, and growth.',
    requirements: [
      '4+ years B2B marketing',
      'Campaign management',
      'Analytics expertise',
      'Content strategy',
    ],
    benefits: ['Health insurance', 'Annual bonus', 'Remote Fridays', 'Parental leave'],
    postedDate: '2025-01-25',
    deadline: '2025-03-25',
    applicants: 61,
  },
  {
    id: 5,
    title: 'Data Scientist',
    companyId: 4,
    category: 'Engineering',
    type: 'Full-time',
    experience: 'Lead',
    salaryMin: 170000,
    salaryMax: 220000,
    location: 'Seattle, WA',
    remote: true,
    description:
      'Lead our machine learning team building predictive models for enterprise customers. Drive data strategy.',
    requirements: [
      'PhD or MS in ML/Statistics',
      'Python/R proficiency',
      'Production ML experience',
      'Team leadership',
    ],
    benefits: ['Health insurance', 'Stock options', 'Unlimited PTO', 'Research time'],
    postedDate: '2025-01-18',
    deadline: '2025-03-18',
    applicants: 34,
  },
  {
    id: 6,
    title: 'Sales Development Rep',
    companyId: 1,
    category: 'Sales',
    type: 'Full-time',
    experience: 'Entry Level',
    salaryMin: 55000,
    salaryMax: 75000,
    location: 'San Francisco, CA',
    remote: false,
    description:
      'Generate qualified leads and build pipeline for our enterprise sales team. Great career growth opportunity.',
    requirements: [
      'Bachelor\'s degree',
      'Excellent communication',
      'Self-motivated',
      'CRM experience a plus',
    ],
    benefits: ['Health insurance', 'Commission structure', 'Training program', 'Team events'],
    postedDate: '2025-01-28',
    deadline: '2025-03-28',
    applicants: 112,
  },
  {
    id: 7,
    title: 'UX Researcher',
    companyId: 5,
    category: 'Design',
    type: 'Part-time',
    experience: 'Mid Level',
    salaryMin: 60000,
    salaryMax: 80000,
    location: 'Boston, MA',
    remote: true,
    description:
      'Conduct user research to improve our digital health platform. Run usability studies and synthesize findings.',
    requirements: [
      '3+ years UX research',
      'Qualitative & quantitative methods',
      'Healthcare experience preferred',
      'Strong presentation skills',
    ],
    benefits: ['Health insurance', 'Flexible schedule', 'Professional development', 'Wellness stipend'],
    postedDate: '2025-01-22',
    deadline: '2025-03-22',
    applicants: 56,
  },
  {
    id: 8,
    title: 'Full Stack Intern',
    companyId: 3,
    category: 'Engineering',
    type: 'Internship',
    experience: 'Entry Level',
    salaryMin: 30000,
    salaryMax: 45000,
    location: 'Austin, TX',
    remote: false,
    description:
      'Join our engineering team for a 12-week internship. Work on real features in our sustainability tech stack.',
    requirements: [
      'Currently enrolled in CS program',
      'Basic web development skills',
      'Git/GitHub experience',
      'Eager to learn',
    ],
    benefits: ['Stipend', 'Mentorship', 'Return offer potential', 'Free lunch'],
    postedDate: '2025-01-30',
    deadline: '2025-04-30',
    applicants: 198,
  },
  {
    id: 9,
    title: 'Product Manager',
    companyId: 5,
    category: 'Product',
    type: 'Full-time',
    experience: 'Senior',
    salaryMin: 140000,
    salaryMax: 175000,
    location: 'Boston, MA',
    remote: false,
    description:
      'Own product strategy for our patient-facing healthcare platform. Drive roadmap and coordinate with cross-functional teams.',
    requirements: [
      '5+ years product management',
      'Healthcare/healthtech experience',
      'Data-driven decision making',
      'Agile methodology',
    ],
    benefits: ['Health insurance', '401k matching', 'Equity', 'Parental leave'],
    postedDate: '2025-01-12',
    deadline: '2025-03-12',
    applicants: 42,
  },
  {
    id: 10,
    title: 'Frontend Contract Developer',
    companyId: 2,
    category: 'Engineering',
    type: 'Contract',
    experience: 'Mid Level',
    salaryMin: 80000,
    salaryMax: 110000,
    location: 'Remote',
    remote: true,
    description:
      'Six-month contract to rebuild our client portal. React/Next.js experience required.',
    requirements: [
      '3+ years frontend development',
      'React/Next.js proficiency',
      'Responsive design',
      'API integration experience',
    ],
    benefits: ['Competitive rate', 'Flexible hours', 'Extension possible'],
    postedDate: '2025-02-01',
    deadline: '2025-03-01',
    applicants: 73,
  },
];

export default function JobBoard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('browse');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    resumeUrl: '',
    linkedin: '',
    portfolio: '',
    availableDate: '',
  });
  const [showCompanyProfile, setShowCompanyProfile] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(5);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    category: '',
    type: '',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    remote: false,
    description: '',
    requirements: '',
    benefits: '',
    companyId: 1,
    deadline: '',
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('All');
  const searchInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('jobBoard');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.darkMode !== undefined) setDarkMode(data.darkMode);
        if (data.bookmarkedJobs) setBookmarkedJobs(data.bookmarkedJobs);
        if (data.applications) setApplications(data.applications);
        if (data.notifications) setNotifications(data.notifications);
        if (data.sidebarCollapsed !== undefined) setSidebarCollapsed(data.sidebarCollapsed);
      } catch (e) {
        console.error('Failed to load saved state');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'jobBoard',
      JSON.stringify({
        darkMode,
        bookmarkedJobs,
        applications,
        notifications,
        sidebarCollapsed,
      })
    );
  }, [darkMode, bookmarkedJobs, applications, notifications, sidebarCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowJobDetail(false);
        setShowApplicationModal(false);
        setShowCompanyProfile(false);
        setShowCreateJobModal(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleCategory = useCallback((cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  }, []);

  const toggleType = useCallback((type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  }, []);

  const toggleExperience = useCallback((exp) => {
    setSelectedExperience((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp]
    );
    setCurrentPage(1);
  }, []);

  const toggleBookmark = useCallback((jobId) => {
    setBookmarkedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedExperience([]);
    setSelectedSalaryRange(0);
    setRemoteOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          COMPANIES.find((c) => c.id === job.companyId)
            ?.name.toLowerCase()
            .includes(query)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((job) => selectedCategories.includes(job.category));
    }

    if (selectedTypes.length > 0) {
      result = result.filter((job) => selectedTypes.includes(job.type));
    }

    if (selectedExperience.length > 0) {
      result = result.filter((job) => selectedExperience.includes(job.experience));
    }

    if (selectedSalaryRange > 0) {
      const range = SALARY_RANGES[selectedSalaryRange];
      result = result.filter((job) => job.salaryMax >= range.min && job.salaryMin <= range.max);
    }

    if (remoteOnly) {
      result = result.filter((job) => job.remote);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
        break;
      case 'salary-high':
        result.sort((a, b) => b.salaryMax - a.salaryMax);
        break;
      case 'salary-low':
        result.sort((a, b) => a.salaryMin - b.salaryMin);
        break;
      case 'applicants':
        result.sort((a, b) => a.applicants - b.applicants);
        break;
      default:
        break;
    }

    return result;
  }, [jobs, searchQuery, selectedCategories, selectedTypes, selectedExperience, selectedSalaryRange, remoteOnly, sortBy]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * jobsPerPage;
    return filteredJobs.slice(start, start + jobsPerPage);
  }, [filteredJobs, currentPage, jobsPerPage]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handleApply = useCallback(
    (job) => {
      if (applications.some((app) => app.jobId === job.id)) {
        return;
      }
      setSelectedJob(job);
      setShowApplicationModal(true);
      setApplicationForm({
        coverLetter: '',
        resumeUrl: '',
        linkedin: '',
        portfolio: '',
        availableDate: '',
      });
    },
    [applications]
  );

  const submitApplication = useCallback(() => {
    if (!applicationForm.coverLetter.trim() || !applicationForm.resumeUrl.trim()) {
      return;
    }
    const newApplication = {
      id: Date.now(),
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      companyId: selectedJob.companyId,
      companyName: COMPANIES.find((c) => c.id === selectedJob.companyId)?.name,
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      ...applicationForm,
    };
    setApplications((prev) => [...prev, newApplication]);
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: `Application submitted for ${selectedJob.title}`,
        type: 'success',
        read: false,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    setShowApplicationModal(false);
    setSelectedJob(null);
  }, [applicationForm, selectedJob]);

  const updateApplicationStatus = useCallback((appId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
  }, []);

  const withdrawApplication = useCallback(
    (appId) => {
      if (window.confirm('Are you sure you want to withdraw this application?')) {
        updateApplicationStatus(appId, 'Withdrawn');
        setNotifications((prev) => [
          {
            id: Date.now(),
            message: 'Application withdrawn successfully',
            type: 'info',
            read: false,
            date: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    },
    [updateApplicationStatus]
  );

  const handleCreateJob = useCallback(() => {
    if (!newJob.title.trim() || !newJob.category || !newJob.type || !newJob.experience) {
      return;
    }
    const createdJob = {
      id: Date.now(),
      ...newJob,
      salaryMin: parseInt(newJob.salaryMin) || 0,
      salaryMax: parseInt(newJob.salaryMax) || 0,
      requirements: newJob.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      benefits: newJob.benefits
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean),
      postedDate: new Date().toISOString().split('T')[0],
      applicants: 0,
    };
    setJobs((prev) => [createdJob, ...prev]);
    setShowCreateJobModal(false);
    setNewJob({
      title: '',
      category: '',
      type: '',
      experience: '',
      salaryMin: '',
      salaryMax: '',
      location: '',
      remote: false,
      description: '',
      requirements: '',
      benefits: '',
      companyId: 1,
      deadline: '',
    });
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: `Job "${createdJob.title}" posted successfully`,
        type: 'success',
        read: false,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [newJob]);

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredApplications = useMemo(() => {
    if (applicationStatusFilter === 'All') return applications;
    return applications.filter((app) => app.status === applicationStatusFilter);
  }, [applications, applicationStatusFilter]);

  const applicationStats = useMemo(() => {
    const stats = { total: applications.length };
    Object.keys(STATUS_COLORS).forEach((status) => {
      stats[status] = applications.filter((app) => app.status === status).length;
    });
    return stats;
  }, [applications]);

  const bg = darkMode ? '#1a1a2e' : '#f8fafc';
  const cardBg = darkMode ? '#16213e' : '#ffffff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const mutedText = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#3b82f6';
  const sidebarBg = darkMode ? '#0f172a' : '#1e293b';

  const navItems = [
    { id: 'browse', label: 'Browse Jobs', icon: '🔍' },
    { id: 'bookmarks', label: 'Saved Jobs', icon: '⭐' },
    { id: 'applications', label: 'My Applications', icon: '📄' },
    { id: 'companies', label: 'Companies', icon: '🏢' },
    { id: 'admin', label: 'Admin Panel', icon: '⚙️' },
  ];

  const renderSidebar = () => (
    <div
      style={{
        width: sidebarCollapsed ? 60 : 240,
        backgroundColor: sidebarBg,
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: sidebarCollapsed ? '16px 12px' : '20px 16px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {!sidebarCollapsed && (
          <span style={{ fontWeight: 'bold', fontSize: 18 }}>JobBoard</span>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: 18,
            padding: 4,
          }}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      <nav style={{ padding: '8px 0', flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              setShowJobDetail(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: sidebarCollapsed ? '12px 18px' : '12px 16px',
              background: activeView === item.id ? 'rgba(59,130,246,0.2)' : 'transparent',
              border: 'none',
              color: activeView === item.id ? '#60a5fa' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 14,
              textAlign: 'left',
              borderLeft: activeView === item.id ? '3px solid #3b82f6' : '3px solid transparent',
            }}
          >
            <span>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div
        style={{
          padding: 16,
          borderTop: '1px solid #334155',
        }}
      >
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          aria-label="Toggle theme"
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </div>
  );

  const renderFilterPanel = () => (
    <div
      style={{
        width: filterPanelOpen ? 260 : 0,
        overflow: 'hidden',
        borderRight: filterPanelOpen ? `1px solid ${borderColor}` : 'none',
        backgroundColor: cardBg,
        transition: 'width 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: 16, width: 260 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, color: textColor, fontSize: 16 }}>Filters</h3>
          <button
            onClick={clearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: accentColor,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Clear All
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ color: textColor, fontSize: 13, marginBottom: 8 }}>Category</h4>
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
                color: mutedText,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ color: textColor, fontSize: 13, marginBottom: 8 }}>Employment Type</h4>
          {EMPLOYMENT_TYPES.map((type) => (
            <label
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
                color: mutedText,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleType(type)}
              />
              {type}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ color: textColor, fontSize: 13, marginBottom: 8 }}>Experience Level</h4>
          {EXPERIENCE_LEVELS.map((exp) => (
            <label
              key={exp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
                color: mutedText,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selectedExperience.includes(exp)}
                onChange={() => toggleExperience(exp)}
              />
              {exp}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ color: textColor, fontSize: 13, marginBottom: 8 }}>Salary Range</h4>
          <select
            value={selectedSalaryRange}
            onChange={(e) => {
              setSelectedSalaryRange(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: `1px solid ${borderColor}`,
              backgroundColor: cardBg,
              color: textColor,
              fontSize: 13,
            }}
          >
            {SALARY_RANGES.map((range, idx) => (
              <option key={idx} value={idx}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: mutedText,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={() => {
                setRemoteOnly(!remoteOnly);
                setCurrentPage(1);
              }}
            />
            Remote Only
          </label>
        </div>

        <div>
          <h4 style={{ color: textColor, fontSize: 13, marginBottom: 8 }}>Sort By</h4>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: `1px solid ${borderColor}`,
              backgroundColor: cardBg,
              color: textColor,
              fontSize: 13,
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="salary-high">Highest Salary</option>
            <option value="salary-low">Lowest Salary</option>
            <option value="applicants">Fewest Applicants</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderJobCard = (job) => {
    const company = COMPANIES.find((c) => c.id === job.companyId);
    const isBookmarked = bookmarkedJobs.includes(job.id);
    const hasApplied = applications.some((app) => app.jobId === job.id);

    return (
      <div
        key={job.id}
        style={{
          backgroundColor: cardBg,
          borderRadius: 12,
          padding: 20,
          marginBottom: 12,
          border: `1px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
        onClick={() => {
          setSelectedJob(job);
          setShowJobDetail(true);
        }}
        data-testid={`job-card-${job.id}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: accentColor,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {company?.logo}
            </div>
            <div>
              <h3 style={{ margin: 0, color: textColor, fontSize: 16 }}>{job.title}</h3>
              <p
                style={{ margin: '4px 0 0', color: accentColor, fontSize: 14, cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCompany(company);
                  setShowCompanyProfile(true);
                }}
              >
                {company?.name}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(job.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: isBookmarked ? '#f59e0b' : mutedText,
            }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>

        <p style={{ color: mutedText, fontSize: 13, margin: '12px 0', lineHeight: 1.5 }}>
          {job.description.length > 150 ? job.description.slice(0, 150) + '...' : job.description}
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              backgroundColor: darkMode ? '#1e3a5f' : '#dbeafe',
              color: accentColor,
              fontSize: 12,
            }}
          >
            {job.category}
          </span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              backgroundColor: darkMode ? '#1e3a5f' : '#dbeafe',
              color: accentColor,
              fontSize: 12,
            }}
          >
            {job.type}
          </span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              backgroundColor: darkMode ? '#1e3a5f' : '#dbeafe',
              color: accentColor,
              fontSize: 12,
            }}
          >
            {job.experience}
          </span>
          {job.remote && (
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                backgroundColor: darkMode ? '#064e3b' : '#d1fae5',
                color: '#10b981',
                fontSize: 12,
              }}
            >
              Remote
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: mutedText,
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <span>📍 {job.location}</span>
            <span>
              💰 ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
            </span>
            <span>👥 {job.applicants} applicants</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {hasApplied && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  backgroundColor: '#10b981',
                  color: '#fff',
                  fontSize: 12,
                }}
              >
                Applied
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApply(job);
              }}
              disabled={hasApplied}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: hasApplied ? '#94a3b8' : accentColor,
                color: '#fff',
                cursor: hasApplied ? 'default' : 'pointer',
                fontSize: 13,
              }}
            >
              {hasApplied ? 'Applied' : 'Quick Apply'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderJobDetail = () => {
    if (!selectedJob || !showJobDetail) return null;
    const company = COMPANIES.find((c) => c.id === selectedJob.companyId);
    const hasApplied = applications.some((app) => app.jobId === selectedJob.id);

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowJobDetail(false)}
        data-testid="job-detail-modal"
      >
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 32,
            maxWidth: 700,
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto',
            color: textColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0 }}>{selectedJob.title}</h2>
              <p style={{ color: accentColor, margin: '4px 0' }}>{company?.name}</p>
              <p style={{ color: mutedText, fontSize: 14 }}>
                📍 {selectedJob.location} | 💰 ${(selectedJob.salaryMin / 1000).toFixed(0)}k - $
                {(selectedJob.salaryMax / 1000).toFixed(0)}k
              </p>
            </div>
            <button
              onClick={() => setShowJobDetail(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: mutedText,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: darkMode ? '#1e3a5f' : '#dbeafe', color: accentColor, fontSize: 12 }}>
              {selectedJob.type}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: darkMode ? '#1e3a5f' : '#dbeafe', color: accentColor, fontSize: 12 }}>
              {selectedJob.experience}
            </span>
            {selectedJob.remote && (
              <span style={{ padding: '4px 10px', borderRadius: 20, backgroundColor: darkMode ? '#064e3b' : '#d1fae5', color: '#10b981', fontSize: 12 }}>
                Remote
              </span>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>About this role</h3>
            <p style={{ color: mutedText, lineHeight: 1.6, fontSize: 14 }}>{selectedJob.description}</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Requirements</h3>
            <ul style={{ color: mutedText, fontSize: 14, paddingLeft: 20 }}>
              {selectedJob.requirements.map((req, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Benefits</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selectedJob.benefits.map((benefit, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    backgroundColor: darkMode ? '#064e3b' : '#d1fae5',
                    color: '#10b981',
                    fontSize: 12,
                  }}
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${borderColor}` }}>
            <div style={{ color: mutedText, fontSize: 13 }}>
              <span>Posted: {selectedJob.postedDate}</span>
              <span style={{ margin: '0 12px' }}>|</span>
              <span>Deadline: {selectedJob.deadline}</span>
              <span style={{ margin: '0 12px' }}>|</span>
              <span>{selectedJob.applicants} applicants</span>
            </div>
            <button
              onClick={() => {
                setShowJobDetail(false);
                handleApply(selectedJob);
              }}
              disabled={hasApplied}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: hasApplied ? '#94a3b8' : accentColor,
                color: '#fff',
                cursor: hasApplied ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {hasApplied ? 'Already Applied' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderApplicationModal = () => {
    if (!showApplicationModal || !selectedJob) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
        }}
        onClick={() => setShowApplicationModal(false)}
        data-testid="application-modal"
      >
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            width: '90%',
            color: textColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ margin: '0 0 8px' }}>Apply for {selectedJob.title}</h2>
          <p style={{ color: mutedText, marginBottom: 24 }}>
            at {COMPANIES.find((c) => c.id === selectedJob.companyId)?.name}
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Cover Letter *
            </label>
            <textarea
              value={applicationForm.coverLetter}
              onChange={(e) =>
                setApplicationForm({ ...applicationForm, coverLetter: e.target.value })
              }
              placeholder="Tell us why you're a great fit..."
              style={{
                width: '100%',
                height: 120,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: bg,
                color: textColor,
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Resume URL *
            </label>
            <input
              type="text"
              value={applicationForm.resumeUrl}
              onChange={(e) =>
                setApplicationForm({ ...applicationForm, resumeUrl: e.target.value })
              }
              placeholder="https://drive.google.com/your-resume"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: bg,
                color: textColor,
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                LinkedIn
              </label>
              <input
                type="text"
                value={applicationForm.linkedin}
                onChange={(e) =>
                  setApplicationForm({ ...applicationForm, linkedin: e.target.value })
                }
                placeholder="linkedin.com/in/..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Portfolio
              </label>
              <input
                type="text"
                value={applicationForm.portfolio}
                onChange={(e) =>
                  setApplicationForm({ ...applicationForm, portfolio: e.target.value })
                }
                placeholder="your-portfolio.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Earliest Available Date
            </label>
            <input
              type="date"
              value={applicationForm.availableDate}
              onChange={(e) =>
                setApplicationForm({ ...applicationForm, availableDate: e.target.value })
              }
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: bg,
                color: textColor,
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowApplicationModal(false)}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              onClick={submitApplication}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: accentColor,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCompanyProfile = () => {
    if (!showCompanyProfile || !selectedCompany) return null;
    const companyJobs = jobs.filter((j) => j.companyId === selectedCompany.id);

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowCompanyProfile(false)}
        data-testid="company-profile-modal"
      >
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            color: textColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  backgroundColor: accentColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 20,
                }}
              >
                {selectedCompany.logo}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{selectedCompany.name}</h2>
                <p style={{ color: mutedText, margin: '4px 0 0' }}>{selectedCompany.industry}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCompanyProfile(false)}
              style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: mutedText }}
            >
              ×
            </button>
          </div>

          <p style={{ color: mutedText, lineHeight: 1.6, marginBottom: 20 }}>{selectedCompany.description}</p>

          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div>
              <span style={{ color: mutedText, fontSize: 12, display: 'block' }}>Location</span>
              <span style={{ fontWeight: 600 }}>{selectedCompany.location}</span>
            </div>
            <div>
              <span style={{ color: mutedText, fontSize: 12, display: 'block' }}>Size</span>
              <span style={{ fontWeight: 600 }}>{selectedCompany.size} employees</span>
            </div>
            <div>
              <span style={{ color: mutedText, fontSize: 12, display: 'block' }}>Rating</span>
              <span style={{ fontWeight: 600 }}>
                ⭐ {selectedCompany.rating} ({selectedCompany.reviewCount} reviews)
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: 16, marginBottom: 12 }}>
            Open Positions ({companyJobs.length})
          </h3>
          {companyJobs.map((job) => (
            <div
              key={job.id}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                marginBottom: 8,
                cursor: 'pointer',
              }}
              onClick={() => {
                setShowCompanyProfile(false);
                setSelectedJob(job);
                setShowJobDetail(true);
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>{job.title}</div>
              <div style={{ color: mutedText, fontSize: 12, marginTop: 4 }}>
                {job.type} | {job.experience} | ${(job.salaryMin / 1000).toFixed(0)}k - $
                {(job.salaryMax / 1000).toFixed(0)}k
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCreateJobModal = () => {
    if (!showCreateJobModal) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
        }}
        onClick={() => setShowCreateJobModal(false)}
        data-testid="create-job-modal"
      >
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 32,
            maxWidth: 700,
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto',
            color: textColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ margin: '0 0 24px' }}>Post a New Job</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Job Title *
              </label>
              <input
                type="text"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                placeholder="e.g., Senior Frontend Engineer"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Location
              </label>
              <input
                type="text"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                placeholder="e.g., San Francisco, CA"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Category *
              </label>
              <select
                value={newJob.category}
                onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              >
                <option value="">Select...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Type *
              </label>
              <select
                value={newJob.type}
                onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              >
                <option value="">Select...</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Experience *
              </label>
              <select
                value={newJob.experience}
                onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              >
                <option value="">Select...</option>
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Min Salary
              </label>
              <input
                type="number"
                value={newJob.salaryMin}
                onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                placeholder="50000"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Max Salary
              </label>
              <input
                type="number"
                value={newJob.salaryMax}
                onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                placeholder="100000"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Deadline
              </label>
              <input
                type="date"
                value={newJob.deadline}
                onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={newJob.remote}
                onChange={(e) => setNewJob({ ...newJob, remote: e.target.checked })}
              />
              Remote position
            </label>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Description
            </label>
            <textarea
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              placeholder="Describe the role..."
              style={{
                width: '100%',
                height: 100,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: bg,
                color: textColor,
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Requirements (one per line)
            </label>
            <textarea
              value={newJob.requirements}
              onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
              placeholder="5+ years experience&#10;React proficiency&#10;..."
              style={{
                width: '100%',
                height: 80,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: bg,
                color: textColor,
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Benefits (one per line)
            </label>
            <textarea
              value={newJob.benefits}
              onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
              placeholder="Health insurance&#10;401k matching&#10;..."
              style={{
                width: '100%',
                height: 80,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: bg,
                color: textColor,
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowCreateJobModal(false)}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateJob}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: accentColor,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Post Job
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBrowseView = () => (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {renderFilterPanel()}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: `1px solid ${borderColor}`,
                backgroundColor: cardBg,
                color: textColor,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {filterPanelOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search jobs, companies, locations... (Press /)"
              style={{
                width: 400,
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: cardBg,
                color: textColor,
                fontSize: 14,
              }}
            />
          </div>
          <span style={{ color: mutedText, fontSize: 14 }}>
            {filteredJobs.length} jobs found
          </span>
        </div>

        {paginatedJobs.map((job) => renderJobCard(job))}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: `1px solid ${borderColor}`,
                backgroundColor: cardBg,
                color: currentPage === 1 ? mutedText : textColor,
                cursor: currentPage === 1 ? 'default' : 'pointer',
                fontSize: 13,
              }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: currentPage === i + 1 ? accentColor : cardBg,
                  color: currentPage === i + 1 ? '#fff' : textColor,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: `1px solid ${borderColor}`,
                backgroundColor: cardBg,
                color: currentPage === totalPages ? mutedText : textColor,
                cursor: currentPage === totalPages ? 'default' : 'pointer',
                fontSize: 13,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderBookmarksView = () => {
    const bookmarkedJobsList = jobs.filter((job) => bookmarkedJobs.includes(job.id));

    return (
      <div style={{ padding: 24, overflow: 'auto', flex: 1 }}>
        <h2 style={{ color: textColor, marginBottom: 20 }}>Saved Jobs ({bookmarkedJobsList.length})</h2>
        {bookmarkedJobsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: mutedText }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>No saved jobs yet</p>
            <p style={{ fontSize: 14 }}>Click the star icon on any job to save it for later</p>
          </div>
        ) : (
          bookmarkedJobsList.map((job) => renderJobCard(job))
        )}
      </div>
    );
  };

  const renderApplicationsView = () => (
    <div style={{ padding: 24, overflow: 'auto', flex: 1 }}>
      <h2 style={{ color: textColor, marginBottom: 20 }}>My Applications</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div
          style={{
            padding: '12px 20px',
            borderRadius: 8,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>{applicationStats.total}</div>
          <div style={{ fontSize: 12, color: mutedText }}>Total</div>
        </div>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div
            key={status}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', color }}>{applicationStats[status] || 0}</div>
            <div style={{ fontSize: 12, color: mutedText }}>{status}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <select
          value={applicationStatusFilter}
          onChange={(e) => setApplicationStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: `1px solid ${borderColor}`,
            backgroundColor: cardBg,
            color: textColor,
            fontSize: 14,
          }}
        >
          <option value="All">All Applications</option>
          {Object.keys(STATUS_COLORS).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: mutedText }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No applications yet</p>
          <p style={{ fontSize: 14 }}>Start applying to jobs to track your progress here</p>
        </div>
      ) : (
        filteredApplications.map((app) => (
          <div
            key={app.id}
            style={{
              backgroundColor: cardBg,
              borderRadius: 12,
              padding: 20,
              marginBottom: 12,
              border: `1px solid ${borderColor}`,
            }}
            data-testid={`application-card-${app.id}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, color: textColor, fontSize: 16 }}>{app.jobTitle}</h3>
                <p style={{ color: accentColor, margin: '4px 0', fontSize: 14 }}>{app.companyName}</p>
                <p style={{ color: mutedText, fontSize: 13 }}>Applied: {app.appliedDate}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    backgroundColor: STATUS_COLORS[app.status] || '#6b7280',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {app.status}
                </span>
                {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                  <button
                    onClick={() => withdrawApplication(app.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: `1px solid ${borderColor}`,
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderCompaniesView = () => (
    <div style={{ padding: 24, overflow: 'auto', flex: 1 }}>
      <h2 style={{ color: textColor, marginBottom: 20 }}>Companies</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {COMPANIES.map((company) => {
          const companyJobs = jobs.filter((j) => j.companyId === company.id);
          return (
            <div
              key={company.id}
              style={{
                backgroundColor: cardBg,
                borderRadius: 12,
                padding: 20,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
              }}
              onClick={() => {
                setSelectedCompany(company);
                setShowCompanyProfile(true);
              }}
              data-testid={`company-card-${company.id}`}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: accentColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                >
                  {company.logo}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: textColor, fontSize: 16 }}>{company.name}</h3>
                  <p style={{ margin: 0, color: mutedText, fontSize: 13 }}>{company.industry}</p>
                </div>
              </div>
              <p style={{ color: mutedText, fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
                {company.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: mutedText, fontSize: 12 }}>
                  ⭐ {company.rating} ({company.reviewCount} reviews)
                </span>
                <span style={{ color: accentColor, fontSize: 13, fontWeight: 600 }}>
                  {companyJobs.length} open positions
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div style={{ padding: 24, overflow: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: textColor, margin: 0 }}>Admin Panel</h2>
        <button
          onClick={() => setShowCreateJobModal(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: accentColor,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          + Post New Job
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}`, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: accentColor }}>{jobs.length}</div>
          <div style={{ fontSize: 14, color: mutedText }}>Total Jobs</div>
        </div>
        <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}`, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#10b981' }}>
            {jobs.reduce((sum, j) => sum + j.applicants, 0)}
          </div>
          <div style={{ fontSize: 14, color: mutedText }}>Total Applicants</div>
        </div>
        <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}`, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f59e0b' }}>{applications.length}</div>
          <div style={{ fontSize: 14, color: mutedText }}>Your Applications</div>
        </div>
        <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}`, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8b5cf6' }}>{COMPANIES.length}</div>
          <div style={{ fontSize: 14, color: mutedText }}>Companies</div>
        </div>
      </div>

      <h3 style={{ color: textColor, marginBottom: 12 }}>All Job Listings</h3>
      <div
        style={{
          backgroundColor: cardBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
              <th style={{ padding: 12, textAlign: 'left', color: mutedText, fontWeight: 600 }}>Title</th>
              <th style={{ padding: 12, textAlign: 'left', color: mutedText, fontWeight: 600 }}>Company</th>
              <th style={{ padding: 12, textAlign: 'left', color: mutedText, fontWeight: 600 }}>Category</th>
              <th style={{ padding: 12, textAlign: 'left', color: mutedText, fontWeight: 600 }}>Type</th>
              <th style={{ padding: 12, textAlign: 'right', color: mutedText, fontWeight: 600 }}>Applicants</th>
              <th style={{ padding: 12, textAlign: 'left', color: mutedText, fontWeight: 600 }}>Posted</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                style={{ borderBottom: `1px solid ${borderColor}`, cursor: 'pointer' }}
                onClick={() => {
                  setSelectedJob(job);
                  setShowJobDetail(true);
                }}
              >
                <td style={{ padding: 12, color: textColor }}>{job.title}</td>
                <td style={{ padding: 12, color: mutedText }}>
                  {COMPANIES.find((c) => c.id === job.companyId)?.name}
                </td>
                <td style={{ padding: 12, color: mutedText }}>{job.category}</td>
                <td style={{ padding: 12, color: mutedText }}>{job.type}</td>
                <td style={{ padding: 12, textAlign: 'right', color: textColor }}>{job.applicants}</td>
                <td style={{ padding: 12, color: mutedText }}>{job.postedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotificationsDropdown = () => {
    if (!showNotifications) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: 48,
          right: 16,
          width: 360,
          backgroundColor: cardBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 999,
          maxHeight: 400,
          overflow: 'auto',
        }}
        data-testid="notifications-dropdown"
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, color: textColor }}>Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              style={{
                background: 'none',
                border: 'none',
                color: accentColor,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Mark all read
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: mutedText, fontSize: 14 }}>
            No notifications
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${borderColor}`,
                backgroundColor: notif.read ? 'transparent' : darkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                cursor: 'pointer',
              }}
              onClick={() => markNotificationRead(notif.id)}
            >
              <p style={{ margin: 0, color: textColor, fontSize: 14 }}>{notif.message}</p>
              <p style={{ margin: '4px 0 0', color: mutedText, fontSize: 12 }}>
                {new Date(notif.date).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {renderSidebar()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            padding: '12px 24px',
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: cardBg,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, color: textColor }}>
            {navItems.find((item) => item.id === activeView)?.label || 'Browse Jobs'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                position: 'relative',
                color: textColor,
              }}
              aria-label="Toggle notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {renderNotificationsDropdown()}

        {activeView === 'browse' && renderBrowseView()}
        {activeView === 'bookmarks' && renderBookmarksView()}
        {activeView === 'applications' && renderApplicationsView()}
        {activeView === 'companies' && renderCompaniesView()}
        {activeView === 'admin' && renderAdminView()}
      </div>

      {renderJobDetail()}
      {renderApplicationModal()}
      {renderCompanyProfile()}
      {renderCreateJobModal()}
    </div>
  );
}
