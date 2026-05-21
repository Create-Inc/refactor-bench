import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance'];
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'lead', 'director'];
const APPLICATION_STATUSES = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'];
const STATUS_COLORS = {
  new: '#3b82f6',
  screening: '#f59e0b',
  interview: '#8b5cf6',
  offer: '#10b981',
  hired: '#059669',
  rejected: '#ef4444',
};
const LOCATIONS = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const fakeApi = {
  async fetchJobs() {
    await delay(100);
    return [
      { id: 'j1', title: 'Senior Frontend Engineer', department: 'Engineering', type: 'full-time', experience: 'senior', location: 'Remote', salary: { min: 140000, max: 180000 }, description: 'Build and maintain our React-based web application platform. Lead frontend architecture decisions and mentor junior developers.', requirements: ['5+ years React', 'TypeScript', 'System design'], posted: Date.now() - 86400000 * 30, deadline: Date.now() + 86400000 * 30, active: true, applicantCount: 47 },
      { id: 'j2', title: 'Product Designer', department: 'Design', type: 'full-time', experience: 'mid', location: 'San Francisco', salary: { min: 110000, max: 150000 }, description: 'Design user experiences for our SaaS platform. Work closely with product and engineering to deliver pixel-perfect interfaces.', requirements: ['3+ years product design', 'Figma', 'User research'], posted: Date.now() - 86400000 * 15, deadline: Date.now() + 86400000 * 45, active: true, applicantCount: 32 },
      { id: 'j3', title: 'Backend Engineer', department: 'Engineering', type: 'full-time', experience: 'mid', location: 'New York', salary: { min: 120000, max: 160000 }, description: 'Design and implement scalable backend services. Own the API layer and database architecture for our core platform.', requirements: ['3+ years backend', 'Node.js or Python', 'PostgreSQL'], posted: Date.now() - 86400000 * 45, deadline: Date.now() - 86400000 * 5, active: false, applicantCount: 63 },
      { id: 'j4', title: 'Marketing Manager', department: 'Marketing', type: 'full-time', experience: 'senior', location: 'London', salary: { min: 90000, max: 120000 }, description: 'Lead our B2B marketing strategy. Manage campaigns, content, and demand generation to drive pipeline growth.', requirements: ['5+ years B2B marketing', 'HubSpot', 'Content strategy'], posted: Date.now() - 86400000 * 10, deadline: Date.now() + 86400000 * 50, active: true, applicantCount: 18 },
      { id: 'j5', title: 'DevOps Intern', department: 'Engineering', type: 'internship', experience: 'junior', location: 'Remote', salary: { min: 30000, max: 45000 }, description: 'Assist with CI/CD pipeline management, infrastructure monitoring, and automation scripts. Great learning opportunity.', requirements: ['CS student', 'Basic Linux', 'Git'], posted: Date.now() - 86400000 * 5, deadline: Date.now() + 86400000 * 60, active: true, applicantCount: 85 },
      { id: 'j6', title: 'Sales Director', department: 'Sales', type: 'full-time', experience: 'director', location: 'New York', salary: { min: 180000, max: 250000 }, description: 'Build and lead the enterprise sales organization. Develop go-to-market strategies and close strategic accounts.', requirements: ['10+ years enterprise sales', 'Team leadership', 'SaaS experience'], posted: Date.now() - 86400000 * 20, deadline: Date.now() + 86400000 * 20, active: true, applicantCount: 12 },
      { id: 'j7', title: 'UX Researcher', department: 'Design', type: 'contract', experience: 'mid', location: 'Berlin', salary: { min: 80000, max: 100000 }, description: 'Conduct user research studies, usability testing, and synthesize insights to drive product decisions.', requirements: ['3+ years UX research', 'Qualitative methods', 'Survey design'], posted: Date.now() - 86400000 * 8, deadline: Date.now() + 86400000 * 40, active: true, applicantCount: 22 },
      { id: 'j8', title: 'Data Analyst', department: 'Operations', type: 'part-time', experience: 'junior', location: 'Tokyo', salary: { min: 50000, max: 70000 }, description: 'Analyze operational data and create dashboards to support decision-making across the organization.', requirements: ['SQL', 'Python/R', 'Data visualization'], posted: Date.now() - 86400000 * 3, deadline: Date.now() + 86400000 * 55, active: true, applicantCount: 41 },
    ];
  },
  async fetchApplications() {
    await delay(100);
    return [
      { id: 'a1', jobId: 'j1', candidateName: 'Alice Zhang', email: 'alice@email.com', status: 'interview', appliedAt: Date.now() - 86400000 * 25, resumeUrl: '#', coverLetter: 'Passionate about building scalable UIs with React. 7 years experience at top tech companies.', rating: 4, notes: 'Strong technical background, passed phone screen', interviewDate: Date.now() + 86400000 * 2 },
      { id: 'a2', jobId: 'j1', candidateName: 'Bob Kumar', email: 'bob@email.com', status: 'screening', appliedAt: Date.now() - 86400000 * 20, resumeUrl: '#', coverLetter: 'Full-stack developer transitioning to frontend focus. Built several production React apps.', rating: 3, notes: '', interviewDate: null },
      { id: 'a3', jobId: 'j1', candidateName: 'Carol Martinez', email: 'carol@email.com', status: 'rejected', appliedAt: Date.now() - 86400000 * 28, resumeUrl: '#', coverLetter: 'Recent bootcamp graduate eager to learn. Strong work ethic.', rating: 2, notes: 'Not enough experience for senior role', interviewDate: null },
      { id: 'a4', jobId: 'j2', candidateName: 'Dave Park', email: 'dave@email.com', status: 'offer', appliedAt: Date.now() - 86400000 * 14, resumeUrl: '#', coverLetter: '5 years of product design experience at startups. Portfolio includes award-winning mobile apps.', rating: 5, notes: 'Excellent portfolio, great culture fit. Offer sent at $135K.', interviewDate: null },
      { id: 'a5', jobId: 'j2', candidateName: 'Eve Johnson', email: 'eve@email.com', status: 'interview', appliedAt: Date.now() - 86400000 * 12, resumeUrl: '#', coverLetter: 'Design systems specialist with enterprise SaaS experience.', rating: 4, notes: 'Onsite interview scheduled', interviewDate: Date.now() + 86400000 * 5 },
      { id: 'a6', jobId: 'j3', candidateName: 'Frank Lee', email: 'frank@email.com', status: 'hired', appliedAt: Date.now() - 86400000 * 40, resumeUrl: '#', coverLetter: 'Backend engineer with distributed systems expertise. Previously at AWS.', rating: 5, notes: 'Accepted offer. Start date: next month.', interviewDate: null },
      { id: 'a7', jobId: 'j3', candidateName: 'Grace Chen', email: 'grace@email.com', status: 'rejected', appliedAt: Date.now() - 86400000 * 38, resumeUrl: '#', coverLetter: 'Self-taught developer with passion for backend systems.', rating: 2, notes: 'Lacks professional experience', interviewDate: null },
      { id: 'a8', jobId: 'j5', candidateName: 'Henry Nguyen', email: 'henry@email.com', status: 'new', appliedAt: Date.now() - 86400000 * 2, resumeUrl: '#', coverLetter: 'CS junior with DevOps club experience and AWS certifications.', rating: 0, notes: '', interviewDate: null },
      { id: 'a9', jobId: 'j5', candidateName: 'Iris Thompson', email: 'iris@email.com', status: 'new', appliedAt: Date.now() - 86400000 * 1, resumeUrl: '#', coverLetter: 'Sophomore studying systems engineering. Familiar with Docker and Kubernetes.', rating: 0, notes: '', interviewDate: null },
      { id: 'a10', jobId: 'j4', candidateName: 'Jake Wilson', email: 'jake@email.com', status: 'screening', appliedAt: Date.now() - 86400000 * 8, resumeUrl: '#', coverLetter: '6 years B2B marketing at SaaS companies. Expertise in demand gen and content marketing.', rating: 3, notes: 'Reviewing portfolio', interviewDate: null },
      { id: 'a11', jobId: 'j6', candidateName: 'Karen Davis', email: 'karen@email.com', status: 'interview', appliedAt: Date.now() - 86400000 * 18, resumeUrl: '#', coverLetter: 'VP Sales at Series B startup. Built team from 2 to 20 reps. $15M ARR achievement.', rating: 5, notes: 'Final round with CEO', interviewDate: Date.now() + 86400000 * 1 },
      { id: 'a12', jobId: 'j7', candidateName: 'Liam Brown', email: 'liam@email.com', status: 'new', appliedAt: Date.now() - 86400000 * 3, resumeUrl: '#', coverLetter: 'UX researcher with background in cognitive psychology and 4 years of industry experience.', rating: 0, notes: '', interviewDate: null },
    ];
  },
};

function formatSalary(amount) {
  return `$${(amount / 1000).toFixed(0)}K`;
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysAgo(ts) {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function StarRating({ rating, onRate, readonly }) {
  return (
    <div data-testid="star-rating" style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          role="button"
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          onClick={() => !readonly && onRate && onRate(star)}
          style={{ cursor: readonly ? 'default' : 'pointer', color: star <= rating ? '#f59e0b' : '#d1d5db', fontSize: '18px' }}
        >
          {star <= rating ? '\u2605' : '\u2606'}
        </span>
      ))}
    </div>
  );
}

export default function JobBoardPlatform() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState('posted');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [newJobForm, setNewJobForm] = useState({
    title: '', department: 'Engineering', type: 'full-time', experience: 'mid',
    location: 'Remote', salaryMin: '', salaryMax: '', description: '', requirements: '',
  });
  const searchRef = useRef(null);
  const retryCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, appsData] = await Promise.all([
        fakeApi.fetchJobs(),
        fakeApi.fetchApplications(),
      ]);
      setJobs(jobsData);
      setApplications(appsData);
      retryCountRef.current = 0;
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      retryCountRef.current += 1;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) => j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q) || j.description.toLowerCase().includes(q)
      );
    }
    if (filterDepartment !== 'all') result = result.filter((j) => j.department === filterDepartment);
    if (filterType !== 'all') result = result.filter((j) => j.type === filterType);
    if (filterExperience !== 'all') result = result.filter((j) => j.experience === filterExperience);
    if (filterLocation !== 'all') result = result.filter((j) => j.location === filterLocation);
    if (filterActiveOnly) result = result.filter((j) => j.active);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'posted') cmp = a.posted - b.posted;
      else if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'salary') cmp = a.salary.max - b.salary.max;
      else if (sortBy === 'applicants') cmp = a.applicantCount - b.applicantCount;
      return sortDirection === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [jobs, searchQuery, filterDepartment, filterType, filterExperience, filterLocation, filterActiveOnly, sortBy, sortDirection]);

  const filteredApplications = useMemo(() => {
    let result = [...applications];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.candidateName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.coverLetter.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') result = result.filter((a) => a.status === filterStatus);
    if (filterDepartment !== 'all') {
      const deptJobIds = jobs.filter((j) => j.department === filterDepartment).map((j) => j.id);
      result = result.filter((a) => deptJobIds.includes(a.jobId));
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'posted' || sortBy === 'applied') cmp = a.appliedAt - b.appliedAt;
      else if (sortBy === 'title' || sortBy === 'name') cmp = a.candidateName.localeCompare(b.candidateName);
      else if (sortBy === 'rating') cmp = a.rating - b.rating;
      return sortDirection === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [applications, jobs, searchQuery, filterStatus, filterDepartment, sortBy, sortDirection]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage, itemsPerPage]);

  const totalJobPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const pipelineStats = useMemo(() => {
    const stats = {};
    APPLICATION_STATUSES.forEach((s) => { stats[s] = 0; });
    applications.forEach((a) => { stats[a.status] = (stats[a.status] || 0) + 1; });
    return stats;
  }, [applications]);

  const departmentStats = useMemo(() => {
    const stats = {};
    jobs.forEach((j) => {
      if (!stats[j.department]) stats[j.department] = { jobs: 0, applications: 0, active: 0 };
      stats[j.department].jobs += 1;
      if (j.active) stats[j.department].active += 1;
      stats[j.department].applications += applications.filter((a) => a.jobId === j.id).length;
    });
    return stats;
  }, [jobs, applications]);

  const timeToHireAvg = useMemo(() => {
    const hired = applications.filter((a) => a.status === 'hired');
    if (hired.length === 0) return null;
    const total = hired.reduce((sum, a) => {
      const job = jobs.find((j) => j.id === a.jobId);
      if (!job) return sum;
      return sum + (a.appliedAt - job.posted);
    }, 0);
    return Math.round(total / hired.length / 86400000);
  }, [applications, jobs]);

  const handleCreateJob = () => {
    const job = {
      id: `j${Date.now()}`,
      title: newJobForm.title,
      department: newJobForm.department,
      type: newJobForm.type,
      experience: newJobForm.experience,
      location: newJobForm.location,
      salary: { min: parseInt(newJobForm.salaryMin) || 0, max: parseInt(newJobForm.salaryMax) || 0 },
      description: newJobForm.description,
      requirements: newJobForm.requirements.split(',').map((r) => r.trim()).filter(Boolean),
      posted: Date.now(),
      deadline: Date.now() + 86400000 * 60,
      active: true,
      applicantCount: 0,
    };
    setJobs((prev) => [job, ...prev]);
    setNewJobForm({ title: '', department: 'Engineering', type: 'full-time', experience: 'mid', location: 'Remote', salaryMin: '', salaryMax: '', description: '', requirements: '' });
    setShowCreateJobModal(false);
  };

  const handleUpdateApplicationStatus = (appId, newStatus) => {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
  };

  const handleUpdateApplicationRating = (appId, rating) => {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, rating } : a)));
  };

  const handleUpdateApplicationNotes = (appId, notes) => {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, notes } : a)));
  };

  const handleToggleJobActive = (jobId) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, active: !j.active } : j)));
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setApplications((prev) => prev.filter((a) => a.jobId !== jobId));
      if (selectedJob?.id === jobId) setSelectedJob(null);
    }
  };

  const getJobForApplication = (app) => jobs.find((j) => j.id === app.jobId);

  const sidebarStyle = {
    width: sidebarCollapsed ? '60px' : '240px',
    background: '#1e293b',
    color: '#e2e8f0',
    padding: sidebarCollapsed ? '16px 8px' : '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'width 0.2s',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const navItems = [
    { id: 'jobs', label: 'Job Listings', icon: '\uD83D\uDCCB' },
    { id: 'applications', label: 'Applications', icon: '\uD83D\uDCC4' },
    { id: 'pipeline', label: 'Pipeline', icon: '\uD83D\uDD04' },
    { id: 'analytics', label: 'Analytics', icon: '\uD83D\uDCCA' },
  ];

  if (loading) {
    return (
      <div data-testid="loading-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#64748b' }}>
        <div>
          <div style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>{'\u23F3'}</div>
          <div>Loading hiring dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="error-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ color: '#ef4444', fontSize: '18px' }}>Error: {error}</div>
        <button onClick={fetchData} style={{ padding: '8px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Retry {retryCountRef.current > 0 ? `(Attempt ${retryCountRef.current + 1})` : ''}
        </button>
      </div>
    );
  }

  return (
    <div data-testid="job-board-platform" style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {!sidebarCollapsed && <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>HireBoard</h2>}
          <button
            aria-label="Toggle sidebar"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
          >
            {sidebarCollapsed ? '\u25B6' : '\u25C0'}
          </button>
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); setCurrentPage(1); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: activeView === item.id ? '#334155' : 'transparent',
              border: 'none', color: activeView === item.id ? '#fff' : '#94a3b8', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontSize: '14px', width: '100%',
            }}
          >
            <span>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
        {!sidebarCollapsed && (
          <div style={{ marginTop: 'auto', padding: '12px', background: '#334155', borderRadius: '8px', fontSize: '12px' }}>
            <div style={{ marginBottom: '8px', fontWeight: '600' }}>Quick Stats</div>
            <div>Open positions: {jobs.filter((j) => j.active).length}</div>
            <div>Total applications: {applications.length}</div>
            <div>Pending review: {applications.filter((a) => a.status === 'new').length}</div>
            {timeToHireAvg !== null && <div>Avg time-to-hire: {timeToHireAvg}d</div>}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', flex: '1', minWidth: '180px', fontSize: '14px' }}
          />
          <select aria-label="Filter by department" value={filterDepartment} onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {activeView === 'jobs' && (
            <>
              <select aria-label="Filter by type" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                <option value="all">All Types</option>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select aria-label="Filter by experience" value={filterExperience} onChange={(e) => { setFilterExperience(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                <option value="all">All Levels</option>
                {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select aria-label="Filter by location" value={filterLocation} onChange={(e) => { setFilterLocation(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                <option value="all">All Locations</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                <input type="checkbox" checked={filterActiveOnly} onChange={(e) => { setFilterActiveOnly(e.target.checked); setCurrentPage(1); }} />
                Active only
              </label>
            </>
          )}
          {activeView === 'applications' && (
            <select aria-label="Filter by status" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="all">All Statuses</option>
              {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          )}
          <select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          >
            {activeView === 'jobs' ? (
              <>
                <option value="posted">Date Posted</option>
                <option value="title">Title</option>
                <option value="salary">Salary</option>
                <option value="applicants">Applicants</option>
              </>
            ) : (
              <>
                <option value="applied">Date Applied</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </>
            )}
          </select>
          <button
            aria-label="Toggle sort direction"
            onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
          >
            {sortDirection === 'asc' ? '\u2191' : '\u2193'}
          </button>
          {activeView === 'jobs' && (
            <button onClick={() => setShowCreateJobModal(true)} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
              + Post Job
            </button>
          )}
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Jobs View */}
          {activeView === 'jobs' && (
            <div data-testid="jobs-view">
              <div style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px' }}>
                Showing {paginatedJobs.length} of {filteredJobs.length} jobs
              </div>
              {paginatedJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>No jobs match your filters</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {paginatedJobs.map((job) => (
                    <div
                      key={job.id}
                      data-testid={`job-card-${job.id}`}
                      onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                      style={{ background: '#fff', borderRadius: '8px', padding: '16px', cursor: 'pointer', border: selectedJob?.id === job.id ? '2px solid #3b82f6' : '1px solid #e2e8f0', transition: 'border 0.15s' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{job.title}</h3>
                          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span>{job.department}</span>
                            <span>{job.type}</span>
                            <span>{job.location}</span>
                            <span>{job.experience}</span>
                            <span>{formatSalary(job.salary.min)} - {formatSalary(job.salary.max)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: job.active ? '#dcfce7' : '#fee2e2', color: job.active ? '#166534' : '#991b1b', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                            {job.active ? 'Active' : 'Closed'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{job.applicantCount} applicants</span>
                        </div>
                      </div>
                      {selectedJob?.id === job.id && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                          <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#475569' }}>{job.description}</p>
                          <div style={{ marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px' }}>Requirements:</strong>
                            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                              {job.requirements.map((r, i) => <li key={i} style={{ fontSize: '13px', color: '#64748b' }}>{r}</li>)}
                            </ul>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                            <span>Posted: {formatDate(job.posted)}</span>
                            <span>Deadline: {formatDate(job.deadline)}</span>
                          </div>
                          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleToggleJobActive(job.id); }} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                              {job.active ? 'Close Posting' : 'Reopen Posting'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }} style={{ padding: '6px 12px', border: '1px solid #fecaca', borderRadius: '4px', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px' }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {totalJobPages > 1 && (
                <div data-testid="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                    Previous
                  </button>
                  {Array.from({ length: totalJobPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: currentPage === page ? '#3b82f6' : '#fff', color: currentPage === page ? '#fff' : '#1e293b', cursor: 'pointer' }}
                    >
                      {page}
                    </button>
                  ))}
                  <button disabled={currentPage === totalJobPages} onClick={() => setCurrentPage((p) => p + 1)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', cursor: currentPage === totalJobPages ? 'not-allowed' : 'pointer' }}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Applications View */}
          {activeView === 'applications' && (
            <div data-testid="applications-view">
              <div style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px' }}>
                {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
              </div>
              {filteredApplications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>No applications match your filters</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredApplications.map((app) => {
                    const job = getJobForApplication(app);
                    return (
                      <div
                        key={app.id}
                        data-testid={`application-card-${app.id}`}
                        style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{app.candidateName}</h3>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                              {app.email} {'\u2022'} Applied for: {job?.title || 'Unknown'} {'\u2022'} {daysAgo(app.appliedAt)}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: STATUS_COLORS[app.status] + '20', color: STATUS_COLORS[app.status], padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                            <StarRating rating={app.rating} onRate={(r) => handleUpdateApplicationRating(app.id, r)} />
                          </div>
                        </div>
                        <p style={{ margin: '8px 0', fontSize: '14px', color: '#475569' }}>{app.coverLetter}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {APPLICATION_STATUSES.filter((s) => s !== app.status).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateApplicationStatus(app.id, status)}
                                style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '12px', color: STATUS_COLORS[status] }}
                              >
                                Move to {status}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => { setSelectedApplication(app); setShowApplicationDetail(true); }}
                            style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Pipeline View */}
          {activeView === 'pipeline' && (
            <div data-testid="pipeline-view">
              <h2 style={{ margin: '0 0 20px', fontSize: '20px' }}>Hiring Pipeline</h2>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }}>
                {APPLICATION_STATUSES.map((status) => {
                  const statusApps = applications.filter((a) => a.status === status);
                  return (
                    <div key={status} data-testid={`pipeline-column-${status}`} style={{ minWidth: '220px', flex: '1', background: '#fff', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'capitalize', color: STATUS_COLORS[status] }}>{status}</h3>
                        <span style={{ background: STATUS_COLORS[status] + '20', color: STATUS_COLORS[status], padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          {statusApps.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {statusApps.map((app) => {
                          const job = getJobForApplication(app);
                          return (
                            <div
                              key={app.id}
                              data-testid={`pipeline-card-${app.id}`}
                              onClick={() => { setSelectedApplication(app); setShowApplicationDetail(true); }}
                              style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                            >
                              <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{app.candidateName}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{job?.title || 'Unknown'}</div>
                              <div style={{ marginTop: '4px' }}>
                                <StarRating rating={app.rating} readonly />
                              </div>
                            </div>
                          );
                        })}
                        {statusApps.length === 0 && (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>No candidates</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <div data-testid="analytics-view">
              <h2 style={{ margin: '0 0 20px', fontSize: '20px' }}>Hiring Analytics</h2>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Total Open Positions</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{jobs.filter((j) => j.active).length}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Total Applications</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{applications.length}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Avg. Time-to-Hire</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{timeToHireAvg !== null ? `${timeToHireAvg}d` : 'N/A'}</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Offer Rate</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                    {applications.length > 0 ? `${Math.round((applications.filter((a) => a.status === 'offer' || a.status === 'hired').length / applications.length) * 100)}%` : 'N/A'}
                  </div>
                </div>
              </div>
              {/* Pipeline Distribution */}
              <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Pipeline Distribution</h3>
                <div style={{ display: 'flex', gap: '4px', height: '32px', borderRadius: '6px', overflow: 'hidden' }}>
                  {APPLICATION_STATUSES.map((status) => {
                    const count = pipelineStats[status] || 0;
                    const pct = applications.length > 0 ? (count / applications.length) * 100 : 0;
                    return pct > 0 ? (
                      <div
                        key={status}
                        data-testid={`pipeline-bar-${status}`}
                        title={`${status}: ${count} (${Math.round(pct)}%)`}
                        style={{ width: `${pct}%`, background: STATUS_COLORS[status], minWidth: '2px' }}
                      />
                    ) : null;
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                  {APPLICATION_STATUSES.map((status) => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[status] }} />
                      <span style={{ textTransform: 'capitalize' }}>{status}: {pipelineStats[status] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Department Breakdown */}
              <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Department Breakdown</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px', color: '#64748b' }}>Department</th>
                      <th style={{ textAlign: 'right', padding: '8px', fontSize: '13px', color: '#64748b' }}>Jobs</th>
                      <th style={{ textAlign: 'right', padding: '8px', fontSize: '13px', color: '#64748b' }}>Active</th>
                      <th style={{ textAlign: 'right', padding: '8px', fontSize: '13px', color: '#64748b' }}>Applications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(departmentStats).map(([dept, stats]) => (
                      <tr key={dept} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontSize: '14px' }}>{dept}</td>
                        <td style={{ padding: '8px', fontSize: '14px', textAlign: 'right' }}>{stats.jobs}</td>
                        <td style={{ padding: '8px', fontSize: '14px', textAlign: 'right' }}>{stats.active}</td>
                        <td style={{ padding: '8px', fontSize: '14px', textAlign: 'right' }}>{stats.applications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div data-testid="create-job-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Post New Job</h2>
              <button onClick={() => setShowCreateJobModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>{'\u2715'}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={newJobForm.title}
                  onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Department</label>
                  <select value={newJobForm.department} onChange={(e) => setNewJobForm({ ...newJobForm, department: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Job Type</label>
                  <select value={newJobForm.type} onChange={(e) => setNewJobForm({ ...newJobForm, type: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Experience Level</label>
                  <select value={newJobForm.experience} onChange={(e) => setNewJobForm({ ...newJobForm, experience: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Location</label>
                  <select value={newJobForm.location} onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Min Salary ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={newJobForm.salaryMin}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salaryMin: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Max Salary ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={newJobForm.salaryMax}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salaryMax: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Description *</label>
                <textarea
                  placeholder="Describe the role..."
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Requirements (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, 3+ years"
                  value={newJobForm.requirements}
                  onChange={(e) => setNewJobForm({ ...newJobForm, requirements: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setShowCreateJobModal(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button
                  disabled={!newJobForm.title.trim() || !newJobForm.description.trim()}
                  onClick={handleCreateJob}
                  style={{ padding: '8px 16px', background: !newJobForm.title.trim() || !newJobForm.description.trim() ? '#94a3b8' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: !newJobForm.title.trim() || !newJobForm.description.trim() ? 'not-allowed' : 'pointer' }}
                >
                  Post Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {showApplicationDetail && selectedApplication && (
        <div data-testid="application-detail-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '550px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Application Details</h2>
              <button onClick={() => { setShowApplicationDetail(false); setSelectedApplication(null); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>{'\u2715'}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>{selectedApplication.candidateName}</h3>
                <div style={{ fontSize: '14px', color: '#64748b' }}>{selectedApplication.email}</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ background: STATUS_COLORS[selectedApplication.status] + '20', color: STATUS_COLORS[selectedApplication.status], padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '600' }}>
                  {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Applied for: {getJobForApplication(selectedApplication)?.title || 'Unknown'}</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{daysAgo(selectedApplication.appliedAt)}</span>
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Rating</div>
                <StarRating rating={selectedApplication.rating} onRate={(r) => handleUpdateApplicationRating(selectedApplication.id, r)} />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Cover Letter</div>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>{selectedApplication.coverLetter}</p>
              </div>
              {selectedApplication.interviewDate && (
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Interview Date</div>
                  <div style={{ fontSize: '14px', color: '#475569' }}>{formatDate(selectedApplication.interviewDate)}</div>
                </div>
              )}
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Notes</div>
                <textarea
                  value={selectedApplication.notes}
                  onChange={(e) => handleUpdateApplicationNotes(selectedApplication.id, e.target.value)}
                  placeholder="Add notes about this candidate..."
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', resize: 'vertical', fontSize: '14px' }}
                />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>Move to Status</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {APPLICATION_STATUSES.map((status) => (
                    <button
                      key={status}
                      disabled={status === selectedApplication.status}
                      onClick={() => {
                        handleUpdateApplicationStatus(selectedApplication.id, status);
                        setSelectedApplication({ ...selectedApplication, status });
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: '6px', border: status === selectedApplication.status ? '2px solid' + STATUS_COLORS[status] : '1px solid #e2e8f0',
                        background: status === selectedApplication.status ? STATUS_COLORS[status] + '20' : '#fff', color: STATUS_COLORS[status],
                        cursor: status === selectedApplication.status ? 'default' : 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize',
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', textDecoration: 'none', color: '#1e293b', fontSize: '14px' }}>
                  View Resume
                </a>
                <button onClick={() => { setShowApplicationDetail(false); setSelectedApplication(null); }} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
