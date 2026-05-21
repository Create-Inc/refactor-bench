import { useState, useEffect, useCallback, useMemo } from 'react';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'Product', 'Operations'];

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];

const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'lead'];

const PIPELINE_STAGES = ['applied', 'screening', 'interview', 'technical', 'offer', 'hired', 'rejected'];

const STAGE_COLORS = {
  applied: '#6b7280',
  screening: '#3b82f6',
  interview: '#8b5cf6',
  technical: '#f59e0b',
  offer: '#10b981',
  hired: '#22c55e',
  rejected: '#ef4444',
};

const INITIAL_JOBS = [
  {
    id: 'j1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    type: 'full-time',
    experience: 'senior',
    location: 'Remote',
    salary: { min: 140000, max: 180000 },
    description: 'We are looking for a senior frontend engineer to lead our React-based platform development. You will work on complex UI systems, mentor junior developers, and drive technical decisions.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'System design skills', 'Team leadership'],
    status: 'open',
    postedDate: Date.now() - 86400000 * 14,
    applicantCount: 24,
  },
  {
    id: 'j2',
    title: 'Product Designer',
    department: 'Design',
    type: 'full-time',
    experience: 'mid',
    location: 'New York, NY',
    salary: { min: 100000, max: 130000 },
    description: 'Join our design team to create beautiful and intuitive user experiences. You will collaborate with product managers and engineers to deliver high-quality designs.',
    requirements: ['3+ years product design', 'Figma expertise', 'User research skills', 'Design system experience'],
    status: 'open',
    postedDate: Date.now() - 86400000 * 7,
    applicantCount: 18,
  },
  {
    id: 'j3',
    title: 'Marketing Manager',
    department: 'Marketing',
    type: 'full-time',
    experience: 'mid',
    location: 'San Francisco, CA',
    salary: { min: 90000, max: 120000 },
    description: 'Lead our marketing efforts including campaign planning, content strategy, and analytics. You will manage a team of 3 marketers.',
    requirements: ['4+ years marketing experience', 'Team management', 'Analytics proficiency', 'Content strategy'],
    status: 'open',
    postedDate: Date.now() - 86400000 * 21,
    applicantCount: 32,
  },
  {
    id: 'j4',
    title: 'Junior Backend Developer',
    department: 'Engineering',
    type: 'full-time',
    experience: 'junior',
    location: 'Remote',
    salary: { min: 70000, max: 95000 },
    description: 'Great opportunity for early-career developers to work on our API layer and microservices architecture.',
    requirements: ['1+ years experience', 'Node.js or Python', 'SQL basics', 'REST API knowledge'],
    status: 'open',
    postedDate: Date.now() - 86400000 * 3,
    applicantCount: 45,
  },
  {
    id: 'j5',
    title: 'Sales Development Rep',
    department: 'Sales',
    type: 'full-time',
    experience: 'junior',
    location: 'Austin, TX',
    salary: { min: 55000, max: 75000 },
    description: 'Drive outbound sales efforts and qualify leads for our enterprise sales team.',
    requirements: ['Sales experience preferred', 'Excellent communication', 'CRM proficiency', 'Goal-oriented'],
    status: 'closed',
    postedDate: Date.now() - 86400000 * 45,
    applicantCount: 28,
  },
  {
    id: 'j6',
    title: 'DevOps Engineer',
    department: 'Engineering',
    type: 'contract',
    experience: 'senior',
    location: 'Remote',
    salary: { min: 150000, max: 190000 },
    description: 'Help us build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems.',
    requirements: ['AWS/GCP expertise', 'Terraform/Kubernetes', 'CI/CD experience', 'Monitoring tools'],
    status: 'open',
    postedDate: Date.now() - 86400000 * 10,
    applicantCount: 12,
  },
];

const INITIAL_APPLICANTS = [
  { id: 'a1', name: 'Alice Chen', email: 'alice@example.com', phone: '555-0101', avatar: '👩‍💻', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'], experience: 6, resumeUrl: '#', rating: 5, notes: [] },
  { id: 'a2', name: 'Bob Martinez', email: 'bob@example.com', phone: '555-0102', avatar: '👨‍💻', skills: ['React', 'Vue', 'CSS', 'Testing'], experience: 4, resumeUrl: '#', rating: 4, notes: [] },
  { id: 'a3', name: 'Carol Williams', email: 'carol@example.com', phone: '555-0103', avatar: '👩‍🎨', skills: ['Figma', 'Sketch', 'User Research', 'Prototyping'], experience: 5, resumeUrl: '#', rating: 4, notes: [] },
  { id: 'a4', name: 'David Kim', email: 'david@example.com', phone: '555-0104', avatar: '👨‍💼', skills: ['SEO', 'Content Marketing', 'Analytics', 'Social Media'], experience: 4, resumeUrl: '#', rating: 3, notes: [] },
  { id: 'a5', name: 'Eva Thompson', email: 'eva@example.com', phone: '555-0105', avatar: '👩‍🔬', skills: ['Python', 'Node.js', 'SQL', 'Docker'], experience: 2, resumeUrl: '#', rating: 4, notes: [] },
  { id: 'a6', name: 'Frank Nguyen', email: 'frank@example.com', phone: '555-0106', avatar: '👨‍🏫', skills: ['React', 'Python', 'AWS', 'System Design'], experience: 8, resumeUrl: '#', rating: 5, notes: [] },
  { id: 'a7', name: 'Grace Patel', email: 'grace@example.com', phone: '555-0107', avatar: '👩‍💼', skills: ['Sales', 'CRM', 'Lead Generation', 'Negotiation'], experience: 3, resumeUrl: '#', rating: 3, notes: [] },
  { id: 'a8', name: 'Henry Wright', email: 'henry@example.com', phone: '555-0108', avatar: '👨‍🔧', skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'], experience: 7, resumeUrl: '#', rating: 5, notes: [] },
  { id: 'a9', name: 'Iris Cooper', email: 'iris@example.com', phone: '555-0109', avatar: '👩‍🏫', skills: ['Figma', 'CSS', 'Animation', 'Design Systems'], experience: 3, resumeUrl: '#', rating: 4, notes: [] },
  { id: 'a10', name: 'Jake Robinson', email: 'jake@example.com', phone: '555-0110', avatar: '👨‍💻', skills: ['React', 'Next.js', 'Tailwind', 'PostgreSQL'], experience: 3, resumeUrl: '#', rating: 4, notes: [] },
];

const INITIAL_APPLICATIONS = [
  { id: 'app1', jobId: 'j1', applicantId: 'a1', stage: 'technical', appliedDate: Date.now() - 86400000 * 10, interviewDate: Date.now() + 86400000 * 2, interviewType: 'technical', feedback: 'Strong React skills, excellent system design discussion.' },
  { id: 'app2', jobId: 'j1', applicantId: 'a2', stage: 'interview', appliedDate: Date.now() - 86400000 * 8, interviewDate: Date.now() + 86400000 * 3, interviewType: 'behavioral', feedback: '' },
  { id: 'app3', jobId: 'j1', applicantId: 'a6', stage: 'offer', appliedDate: Date.now() - 86400000 * 12, interviewDate: null, interviewType: null, feedback: 'Exceptional candidate. 8 years experience, great culture fit.' },
  { id: 'app4', jobId: 'j1', applicantId: 'a10', stage: 'screening', appliedDate: Date.now() - 86400000 * 5, interviewDate: null, interviewType: null, feedback: '' },
  { id: 'app5', jobId: 'j2', applicantId: 'a3', stage: 'interview', appliedDate: Date.now() - 86400000 * 6, interviewDate: Date.now() + 86400000 * 1, interviewType: 'portfolio', feedback: 'Impressive portfolio, strong Figma skills.' },
  { id: 'app6', jobId: 'j2', applicantId: 'a9', stage: 'screening', appliedDate: Date.now() - 86400000 * 4, interviewDate: null, interviewType: null, feedback: '' },
  { id: 'app7', jobId: 'j3', applicantId: 'a4', stage: 'technical', appliedDate: Date.now() - 86400000 * 15, interviewDate: Date.now() - 86400000 * 1, interviewType: 'case-study', feedback: 'Good analytics knowledge but needs more team management experience.' },
  { id: 'app8', jobId: 'j4', applicantId: 'a5', stage: 'interview', appliedDate: Date.now() - 86400000 * 2, interviewDate: Date.now() + 86400000 * 5, interviewType: 'behavioral', feedback: '' },
  { id: 'app9', jobId: 'j4', applicantId: 'a10', stage: 'applied', appliedDate: Date.now() - 86400000 * 1, interviewDate: null, interviewType: null, feedback: '' },
  { id: 'app10', jobId: 'j5', applicantId: 'a7', stage: 'hired', appliedDate: Date.now() - 86400000 * 40, interviewDate: null, interviewType: null, feedback: 'Great communicator. Hired!' },
  { id: 'app11', jobId: 'j6', applicantId: 'a8', stage: 'technical', appliedDate: Date.now() - 86400000 * 8, interviewDate: Date.now() + 86400000 * 4, interviewType: 'technical', feedback: 'Deep AWS and K8s knowledge. Promising.' },
  { id: 'app12', jobId: 'j1', applicantId: 'a5', stage: 'rejected', appliedDate: Date.now() - 86400000 * 11, interviewDate: null, interviewType: null, feedback: 'Not enough senior-level experience for this role.' },
];

const INITIAL_INTERVIEWS = [
  { id: 'int1', applicationId: 'app1', date: Date.now() + 86400000 * 2, duration: 60, type: 'technical', interviewer: 'Sarah Tech Lead', location: 'Zoom', notes: 'Focus on React architecture and system design' },
  { id: 'int2', applicationId: 'app2', date: Date.now() + 86400000 * 3, duration: 45, type: 'behavioral', interviewer: 'Mike HR', location: 'Google Meet', notes: 'Culture fit and collaboration assessment' },
  { id: 'int3', applicationId: 'app5', date: Date.now() + 86400000 * 1, duration: 60, type: 'portfolio', interviewer: 'Lisa Design Director', location: 'In-person', notes: 'Review portfolio and design process walkthrough' },
  { id: 'int4', applicationId: 'app8', date: Date.now() + 86400000 * 5, duration: 45, type: 'behavioral', interviewer: 'Mike HR', location: 'Zoom', notes: 'Initial behavioral interview for junior role' },
  { id: 'int5', applicationId: 'app11', date: Date.now() + 86400000 * 4, duration: 90, type: 'technical', interviewer: 'Tom DevOps Lead', location: 'Zoom', notes: 'Infrastructure design and troubleshooting scenarios' },
];

export default function JobBoardTracker() {
  const [activeView, setActiveView] = useState(() => {
    try {
      return localStorage.getItem('jbtActiveView') || 'jobs';
    } catch { return 'jobs'; }
  });
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [applicants, setApplicants] = useState(() => {
    try {
      const saved = localStorage.getItem('jbtApplicants');
      return saved ? JSON.parse(saved) : INITIAL_APPLICANTS;
    } catch { return INITIAL_APPLICANTS; }
  });
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('jbtApplications');
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch { return INITIAL_APPLICATIONS; }
  });
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('jbtTheme') || 'light';
    } catch { return 'light'; }
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [jobFormData, setJobFormData] = useState({ title: '', department: 'Engineering', type: 'full-time', experience: 'mid', location: '', salaryMin: '', salaryMax: '', description: '', requirements: '' });
  const [noteText, setNoteText] = useState('');
  const [interviewFormData, setInterviewFormData] = useState({ date: '', duration: 60, type: 'behavioral', interviewer: '', location: '', notes: '' });

  useEffect(() => {
    localStorage.setItem('jbtActiveView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('jbtTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jbtApplicants', JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem('jbtApplications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showNoteModal) { setShowNoteModal(false); return; }
        if (showInterviewModal) { setShowInterviewModal(false); return; }
        if (showApplicantModal) { setShowApplicantModal(false); return; }
        if (showJobModal) { setShowJobModal(false); return; }
        if (selectedApplication) { setSelectedApplication(null); return; }
        if (selectedApplicant) { setSelectedApplicant(null); return; }
        if (selectedJob) { setSelectedJob(null); return; }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNoteModal, showInterviewModal, showApplicantModal, showJobModal, selectedApplication, selectedApplicant, selectedJob]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }
    if (departmentFilter !== 'all') result = result.filter(j => j.department === departmentFilter);
    if (typeFilter !== 'all') result = result.filter(j => j.type === typeFilter);
    if (experienceFilter !== 'all') result = result.filter(j => j.experience === experienceFilter);
    if (statusFilter !== 'all') result = result.filter(j => j.status === statusFilter);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = a.postedDate - b.postedDate;
      else if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'applicants') cmp = a.applicantCount - b.applicantCount;
      else if (sortBy === 'salary') cmp = a.salary.min - b.salary.min;
      return sortDirection === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [jobs, searchQuery, departmentFilter, typeFilter, experienceFilter, statusFilter, sortBy, sortDirection]);

  const filteredApplications = useMemo(() => {
    let result = [...applications];
    if (stageFilter !== 'all') result = result.filter(app => app.stage === stageFilter);
    if (selectedJob) result = result.filter(app => app.jobId === selectedJob.id);
    return result;
  }, [applications, stageFilter, selectedJob]);

  const pipelineStats = useMemo(() => {
    const stats = {};
    PIPELINE_STAGES.forEach(stage => { stats[stage] = 0; });
    applications.forEach(app => { stats[app.stage] = (stats[app.stage] || 0) + 1; });
    return stats;
  }, [applications]);

  const analyticsData = useMemo(() => {
    const totalApps = applications.length;
    const activeApps = applications.filter(a => !['hired', 'rejected'].includes(a.stage)).length;
    const hiredCount = applications.filter(a => a.stage === 'hired').length;
    const rejectedCount = applications.filter(a => a.stage === 'rejected').length;
    const avgTimeToHire = hiredCount > 0 ? Math.round(applications.filter(a => a.stage === 'hired').reduce((sum, a) => sum + (Date.now() - a.appliedDate) / 86400000, 0) / hiredCount) : 0;
    const openJobs = jobs.filter(j => j.status === 'open').length;
    const deptBreakdown = {};
    jobs.forEach(j => {
      if (!deptBreakdown[j.department]) deptBreakdown[j.department] = { jobs: 0, applications: 0 };
      deptBreakdown[j.department].jobs++;
    });
    applications.forEach(app => {
      const job = jobs.find(j => j.id === app.jobId);
      if (job && deptBreakdown[job.department]) deptBreakdown[job.department].applications++;
    });
    const upcomingInterviews = interviews.filter(i => i.date > Date.now()).length;
    return { totalApps, activeApps, hiredCount, rejectedCount, avgTimeToHire, openJobs, deptBreakdown, upcomingInterviews };
  }, [applications, jobs, interviews]);

  const getApplicant = useCallback((id) => applicants.find(a => a.id === id), [applicants]);
  const getJob = useCallback((id) => jobs.find(j => j.id === id), [jobs]);

  const moveApplicationStage = useCallback((appId, newStage) => {
    setApplications(prev => prev.map(app => app.id === appId ? { ...app, stage: newStage } : app));
  }, []);

  const addNote = useCallback((applicantId, text) => {
    setApplicants(prev => prev.map(a =>
      a.id === applicantId
        ? { ...a, notes: [...a.notes, { id: `n${Date.now()}`, text, date: Date.now() }] }
        : a
    ));
  }, []);

  const deleteNote = useCallback((applicantId, noteId) => {
    setApplicants(prev => prev.map(a =>
      a.id === applicantId
        ? { ...a, notes: a.notes.filter(n => n.id !== noteId) }
        : a
    ));
  }, []);

  const updateApplicantRating = useCallback((applicantId, rating) => {
    setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, rating } : a));
  }, []);

  const createJob = useCallback(() => {
    const newJob = {
      id: `j${Date.now()}`,
      title: jobFormData.title,
      department: jobFormData.department,
      type: jobFormData.type,
      experience: jobFormData.experience,
      location: jobFormData.location,
      salary: { min: parseInt(jobFormData.salaryMin) || 0, max: parseInt(jobFormData.salaryMax) || 0 },
      description: jobFormData.description,
      requirements: jobFormData.requirements.split(',').map(r => r.trim()).filter(Boolean),
      status: 'open',
      postedDate: Date.now(),
      applicantCount: 0,
    };
    setJobs(prev => [newJob, ...prev]);
    setShowJobModal(false);
    setJobFormData({ title: '', department: 'Engineering', type: 'full-time', experience: 'mid', location: '', salaryMin: '', salaryMax: '', description: '', requirements: '' });
  }, [jobFormData]);

  const toggleJobStatus = useCallback((jobId) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: j.status === 'open' ? 'closed' : 'open' } : j));
  }, []);

  const deleteJob = useCallback((jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? All associated applications will also be removed.')) return;
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setApplications(prev => prev.filter(app => app.jobId !== jobId));
    setInterviews(prev => prev.filter(int => {
      const app = applications.find(a => a.id === int.applicationId);
      return !app || app.jobId !== jobId;
    }));
    if (selectedJob && selectedJob.id === jobId) setSelectedJob(null);
  }, [applications, selectedJob]);

  const scheduleInterview = useCallback(() => {
    if (!selectedApplication) return;
    const newInterview = {
      id: `int${Date.now()}`,
      applicationId: selectedApplication.id,
      date: new Date(interviewFormData.date).getTime(),
      duration: parseInt(interviewFormData.duration) || 60,
      type: interviewFormData.type,
      interviewer: interviewFormData.interviewer,
      location: interviewFormData.location,
      notes: interviewFormData.notes,
    };
    setInterviews(prev => [...prev, newInterview]);
    setShowInterviewModal(false);
    setInterviewFormData({ date: '', duration: 60, type: 'behavioral', interviewer: '', location: '', notes: '' });
  }, [selectedApplication, interviewFormData]);

  const deleteInterview = useCallback((intId) => {
    if (!window.confirm('Delete this interview?')) return;
    setInterviews(prev => prev.filter(i => i.id !== intId));
  }, []);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatSalary = (salary) => `$${(salary.min / 1000).toFixed(0)}k - $${(salary.max / 1000).toFixed(0)}k`;

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a2e' : '#f8fafc';
  const cardBg = isDark ? '#16213e' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const accentColor = '#6366f1';
  const sidebarBg = isDark ? '#0f172a' : '#1e293b';

  const navItems = [
    { id: 'jobs', label: 'Job Listings', icon: '💼' },
    { id: 'pipeline', label: 'Pipeline', icon: '📊' },
    { id: 'applicants', label: 'Applicants', icon: '👥' },
    { id: 'interviews', label: 'Interviews', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const renderSidebar = () => (
    <div style={{ width: sidebarCollapsed ? 60 : 240, backgroundColor: sidebarBg, color: '#e2e8f0', display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!sidebarCollapsed && <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>HireTrack</h1>}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Toggle sidebar" style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: 18 }}>
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      <nav style={{ flex: 1, padding: '8px' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); setSelectedJob(null); setSelectedApplicant(null); setSelectedApplication(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', marginBottom: 4,
              backgroundColor: activeView === item.id ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: activeView === item.id ? '#818cf8' : '#94a3b8',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, textAlign: 'left',
            }}
          >
            <span>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      {!sidebarCollapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Open positions</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{analyticsData.openJobs}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8, marginBottom: 4 }}>Active applications</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{analyticsData.activeApps}</div>
        </div>
      )}
    </div>
  );

  const renderHeader = () => (
    <div style={{ padding: '12px 24px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 16, backgroundColor: cardBg }}>
      <input
        type="text"
        placeholder="Search jobs, applicants..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ flex: 1, padding: '8px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor, fontSize: 14 }}
      />
      <button onClick={toggleTheme} aria-label="Toggle theme" style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  );

  const renderJobFilters = () => (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <select aria-label="Filter by department" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: textColor }}>
        <option value="all">All Departments</option>
        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: textColor }}>
        <option value="all">All Types</option>
        {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select aria-label="Filter by experience" value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: textColor }}>
        <option value="all">All Levels</option>
        {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: textColor }}>
        <option value="all">All Status</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>
      <select aria-label="Sort jobs" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: textColor }}>
        <option value="date">Sort by Date</option>
        <option value="title">Sort by Title</option>
        <option value="applicants">Sort by Applicants</option>
        <option value="salary">Sort by Salary</option>
      </select>
      <button onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} aria-label="Toggle sort direction" style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: textColor, cursor: 'pointer' }}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </button>
      <span style={{ color: mutedColor, fontSize: 13 }}>{filteredJobs.length} jobs</span>
    </div>
  );

  const renderJobCard = (job) => {
    const jobApps = applications.filter(app => app.jobId === job.id);
    return (
      <div
        key={job.id}
        onClick={() => setSelectedJob(job)}
        style={{
          padding: 16, marginBottom: 12, borderRadius: 10, border: `1px solid ${borderColor}`,
          backgroundColor: cardBg, cursor: 'pointer', transition: 'box-shadow 0.15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: textColor }}>{job.title}</h3>
            <div style={{ fontSize: 13, color: mutedColor, marginTop: 4 }}>{job.department} · {job.location}</div>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
            backgroundColor: job.status === 'open' ? '#dcfce7' : '#fee2e2',
            color: job.status === 'open' ? '#166534' : '#991b1b',
          }}>
            {job.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: mutedColor, flexWrap: 'wrap' }}>
          <span>🏷️ {job.type}</span>
          <span>📊 {job.experience}</span>
          <span>💰 {formatSalary(job.salary)}</span>
          <span>👥 {jobApps.length} applicants</span>
          <span>📅 {formatDate(job.postedDate)}</span>
        </div>
        {jobApps.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
            {PIPELINE_STAGES.map(stage => {
              const count = jobApps.filter(a => a.stage === stage).length;
              if (count === 0) return null;
              return (
                <span key={stage} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, backgroundColor: STAGE_COLORS[stage] + '22', color: STAGE_COLORS[stage] }}>
                  {stage}: {count}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderJobDetail = () => {
    if (!selectedJob) return null;
    const job = selectedJob;
    const jobApps = applications.filter(app => app.jobId === job.id);
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>
          ← Back to Jobs
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, color: textColor }}>{job.title}</h2>
            <div style={{ color: mutedColor, marginTop: 4 }}>{job.department} · {job.location} · {job.type} · {job.experience}</div>
            <div style={{ color: mutedColor, marginTop: 4 }}>💰 {formatSalary(job.salary)} · Posted {formatDate(job.postedDate)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => toggleJobStatus(job.id)} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: textColor, cursor: 'pointer' }}>
              {job.status === 'open' ? 'Close Position' : 'Reopen Position'}
            </button>
            <button onClick={() => deleteJob(job.id)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: textColor, marginBottom: 8 }}>Description</h3>
          <p style={{ color: mutedColor, lineHeight: 1.6 }}>{job.description}</p>
        </div>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: textColor, marginBottom: 8 }}>Requirements</h3>
          <ul style={{ color: mutedColor, lineHeight: 1.8, paddingLeft: 20 }}>
            {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
          </ul>
        </div>
        <div>
          <h3 style={{ color: textColor, marginBottom: 12 }}>Applicants ({jobApps.length})</h3>
          {jobApps.length === 0 ? (
            <p style={{ color: mutedColor }}>No applicants yet for this position.</p>
          ) : (
            <div>
              {jobApps.map(app => {
                const applicant = getApplicant(app.applicantId);
                if (!applicant) return null;
                return (
                  <div key={app.id} onClick={() => setSelectedApplication(app)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, marginBottom: 8, borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: bgColor, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{applicant.avatar}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: textColor }}>{applicant.name}</div>
                        <div style={{ fontSize: 12, color: mutedColor }}>{applicant.email} · {applicant.experience} yrs exp</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: mutedColor }}>Applied {formatDate(app.appliedDate)}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, backgroundColor: STAGE_COLORS[app.stage] + '22', color: STAGE_COLORS[app.stage] }}>
                        {app.stage}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderJobsView = () => (
    <div style={{ padding: 24 }}>
      {selectedJob ? renderJobDetail() : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: textColor }}>Job Listings</h2>
            <button onClick={() => setShowJobModal(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: accentColor, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              + New Job
            </button>
          </div>
          {renderJobFilters()}
          {filteredJobs.length === 0 ? (
            <p style={{ color: mutedColor, textAlign: 'center', padding: 40 }}>No jobs match your filters.</p>
          ) : (
            filteredJobs.map(job => renderJobCard(job))
          )}
        </>
      )}
    </div>
  );

  const renderPipelineView = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: textColor }}>Application Pipeline</h2>
        <select aria-label="Filter by stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: textColor }}>
          <option value="all">All Stages</option>
          {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {PIPELINE_STAGES.map(stage => (
          <div key={stage} style={{ textAlign: 'center', padding: '10px 16px', borderRadius: 8, backgroundColor: STAGE_COLORS[stage] + '15', minWidth: 80 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: STAGE_COLORS[stage] }}>{pipelineStats[stage]}</div>
            <div style={{ fontSize: 11, color: mutedColor, textTransform: 'capitalize' }}>{stage}</div>
          </div>
        ))}
      </div>
      {selectedApplication ? renderApplicationDetail() : (
        <div>
          {filteredApplications.map(app => {
            const applicant = getApplicant(app.applicantId);
            const job = getJob(app.jobId);
            if (!applicant || !job) return null;
            return (
              <div key={app.id} onClick={() => setSelectedApplication(app)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, marginBottom: 8, borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: cardBg, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{applicant.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: textColor }}>{applicant.name}</div>
                    <div style={{ fontSize: 12, color: mutedColor }}>{job.title} · Applied {formatDate(app.appliedDate)}</div>
                  </div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, backgroundColor: STAGE_COLORS[app.stage] + '22', color: STAGE_COLORS[app.stage] }}>
                  {app.stage}
                </span>
              </div>
            );
          })}
          {filteredApplications.length === 0 && (
            <p style={{ color: mutedColor, textAlign: 'center', padding: 40 }}>No applications match the selected filter.</p>
          )}
        </div>
      )}
    </div>
  );

  const renderApplicationDetail = () => {
    if (!selectedApplication) return null;
    const app = selectedApplication;
    const applicant = getApplicant(app.applicantId);
    const job = getJob(app.jobId);
    const appInterviews = interviews.filter(i => i.applicationId === app.id);
    if (!applicant || !job) return null;
    return (
      <div>
        <button onClick={() => setSelectedApplication(null)} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>
          ← Back to Pipeline
        </button>
        <div style={{ backgroundColor: cardBg, borderRadius: 10, border: `1px solid ${borderColor}`, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 40 }}>{applicant.avatar}</span>
            <div>
              <h3 style={{ margin: 0, color: textColor }}>{applicant.name}</h3>
              <div style={{ color: mutedColor }}>{applicant.email} · {applicant.phone}</div>
              <div style={{ color: mutedColor, fontSize: 13 }}>{applicant.experience} years experience · Rating: {'⭐'.repeat(applicant.rating)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {applicant.skills.map(skill => (
              <span key={skill} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, backgroundColor: accentColor + '15', color: accentColor }}>{skill}</span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: mutedColor }}>Applied for: <strong style={{ color: textColor }}>{job.title}</strong> · {formatDate(app.appliedDate)}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ color: textColor, marginBottom: 8 }}>Pipeline Stage</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PIPELINE_STAGES.map(stage => (
              <button
                key={stage}
                onClick={() => moveApplicationStage(app.id, stage)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: app.stage === stage ? `2px solid ${STAGE_COLORS[stage]}` : `1px solid ${borderColor}`,
                  backgroundColor: app.stage === stage ? STAGE_COLORS[stage] + '22' : 'transparent',
                  color: app.stage === stage ? STAGE_COLORS[stage] : mutedColor,
                }}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
        {app.feedback && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
            <h4 style={{ color: textColor, margin: '0 0 6px 0' }}>Feedback</h4>
            <p style={{ color: mutedColor, margin: 0 }}>{app.feedback}</p>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ color: textColor, margin: 0 }}>Interviews ({appInterviews.length})</h4>
            <button onClick={() => setShowInterviewModal(true)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', backgroundColor: accentColor, color: '#fff', cursor: 'pointer', fontSize: 12 }}>
              + Schedule
            </button>
          </div>
          {appInterviews.length === 0 ? (
            <p style={{ color: mutedColor, fontSize: 13 }}>No interviews scheduled.</p>
          ) : (
            appInterviews.map(int => (
              <div key={int.id} style={{ padding: 12, marginBottom: 8, borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: bgColor }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: textColor }}>{int.type} Interview</div>
                    <div style={{ fontSize: 12, color: mutedColor }}>{formatDate(int.date)} · {int.duration} min · {int.location}</div>
                    <div style={{ fontSize: 12, color: mutedColor }}>Interviewer: {int.interviewer}</div>
                  </div>
                  <button onClick={() => deleteInterview(int.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }} aria-label="Delete interview">🗑️</button>
                </div>
                {int.notes && <div style={{ fontSize: 12, color: mutedColor, marginTop: 6, fontStyle: 'italic' }}>Notes: {int.notes}</div>}
              </div>
            ))
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ color: textColor, marginBottom: 8 }}>Rating</h4>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => updateApplicantRating(applicant.id, star)}
                aria-label={`Rate ${star} stars`}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', opacity: star <= applicant.rating ? 1 : 0.3 }}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ color: textColor, margin: 0 }}>Notes ({applicant.notes.length})</h4>
            <button onClick={() => setShowNoteModal(true)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', backgroundColor: accentColor, color: '#fff', cursor: 'pointer', fontSize: 12 }}>
              + Add Note
            </button>
          </div>
          {applicant.notes.length === 0 ? (
            <p style={{ color: mutedColor, fontSize: 13 }}>No notes yet.</p>
          ) : (
            applicant.notes.map(note => (
              <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 10, marginBottom: 6, borderRadius: 6, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                <div>
                  <div style={{ color: textColor, fontSize: 13 }}>{note.text}</div>
                  <div style={{ color: mutedColor, fontSize: 11, marginTop: 4 }}>{formatDate(note.date)}</div>
                </div>
                <button onClick={() => deleteNote(applicant.id, note.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderApplicantsView = () => {
    const filteredApplicants = searchQuery
      ? applicants.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      : applicants;
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 20px 0', color: textColor }}>Applicants ({filteredApplicants.length})</h2>
        {selectedApplicant ? renderApplicantProfile() : (
          <div>
            {filteredApplicants.map(applicant => {
              const appCount = applications.filter(app => app.applicantId === applicant.id).length;
              return (
                <div key={applicant.id} onClick={() => setSelectedApplicant(applicant)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, marginBottom: 8, borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: cardBg, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{applicant.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: textColor }}>{applicant.name}</div>
                      <div style={{ fontSize: 12, color: mutedColor }}>{applicant.email} · {applicant.experience} yrs exp</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        {applicant.skills.slice(0, 3).map(s => (
                          <span key={s} style={{ padding: '1px 6px', borderRadius: 8, fontSize: 10, backgroundColor: accentColor + '15', color: accentColor }}>{s}</span>
                        ))}
                        {applicant.skills.length > 3 && <span style={{ fontSize: 10, color: mutedColor }}>+{applicant.skills.length - 3}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: mutedColor }}>{appCount} application{appCount !== 1 ? 's' : ''}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>{'⭐'.repeat(applicant.rating)}</div>
                  </div>
                </div>
              );
            })}
            {filteredApplicants.length === 0 && (
              <p style={{ color: mutedColor, textAlign: 'center', padding: 40 }}>No applicants found.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderApplicantProfile = () => {
    if (!selectedApplicant) return null;
    const applicant = selectedApplicant;
    const applicantApps = applications.filter(app => app.applicantId === applicant.id);
    return (
      <div>
        <button onClick={() => setSelectedApplicant(null)} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>
          ← Back to Applicants
        </button>
        <div style={{ backgroundColor: cardBg, borderRadius: 10, border: `1px solid ${borderColor}`, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <span style={{ fontSize: 48 }}>{applicant.avatar}</span>
            <div>
              <h2 style={{ margin: 0, color: textColor }}>{applicant.name}</h2>
              <div style={{ color: mutedColor }}>{applicant.email} · {applicant.phone}</div>
              <div style={{ color: mutedColor, fontSize: 13 }}>{applicant.experience} years experience</div>
              <div style={{ marginTop: 4 }}>{'⭐'.repeat(applicant.rating)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {applicant.skills.map(skill => (
              <span key={skill} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, backgroundColor: accentColor + '15', color: accentColor }}>{skill}</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: textColor, marginBottom: 12 }}>Applications ({applicantApps.length})</h3>
          {applicantApps.map(app => {
            const job = getJob(app.jobId);
            if (!job) return null;
            return (
              <div key={app.id} style={{ padding: 12, marginBottom: 8, borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: bgColor }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: textColor }}>{job.title}</div>
                    <div style={{ fontSize: 12, color: mutedColor }}>{job.department} · Applied {formatDate(app.appliedDate)}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, backgroundColor: STAGE_COLORS[app.stage] + '22', color: STAGE_COLORS[app.stage] }}>
                    {app.stage}
                  </span>
                </div>
                {app.feedback && <div style={{ fontSize: 12, color: mutedColor, marginTop: 6 }}>Feedback: {app.feedback}</div>}
              </div>
            );
          })}
          {applicantApps.length === 0 && <p style={{ color: mutedColor }}>No applications submitted.</p>}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ color: textColor, margin: 0 }}>Notes ({applicant.notes.length})</h3>
            <button onClick={() => { setShowNoteModal(true); }} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', backgroundColor: accentColor, color: '#fff', cursor: 'pointer', fontSize: 12 }}>
              + Add Note
            </button>
          </div>
          {applicant.notes.map(note => (
            <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 10, marginBottom: 6, borderRadius: 6, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
              <div>
                <div style={{ color: textColor, fontSize: 13 }}>{note.text}</div>
                <div style={{ color: mutedColor, fontSize: 11, marginTop: 4 }}>{formatDate(note.date)}</div>
              </div>
              <button onClick={() => deleteNote(applicant.id, note.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInterviewsView = () => {
    const upcomingInterviews = interviews.filter(i => i.date > Date.now()).sort((a, b) => a.date - b.date);
    const pastInterviews = interviews.filter(i => i.date <= Date.now()).sort((a, b) => b.date - a.date);
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 20px 0', color: textColor }}>Interviews</h2>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: textColor, marginBottom: 12 }}>Upcoming ({upcomingInterviews.length})</h3>
          {upcomingInterviews.length === 0 ? (
            <p style={{ color: mutedColor }}>No upcoming interviews scheduled.</p>
          ) : (
            upcomingInterviews.map(int => {
              const app = applications.find(a => a.id === int.applicationId);
              const applicant = app ? getApplicant(app.applicantId) : null;
              const job = app ? getJob(app.jobId) : null;
              if (!applicant || !job) return null;
              return (
                <div key={int.id} style={{ padding: 14, marginBottom: 8, borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: cardBg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{applicant.avatar}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: textColor }}>{applicant.name}</div>
                        <div style={{ fontSize: 12, color: mutedColor }}>{job.title} · {int.type} interview</div>
                        <div style={{ fontSize: 12, color: mutedColor }}>📅 {formatDate(int.date)} · ⏱️ {int.duration} min · 📍 {int.location}</div>
                        <div style={{ fontSize: 12, color: mutedColor }}>Interviewer: {int.interviewer}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteInterview(int.id)} aria-label="Delete interview" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                  </div>
                  {int.notes && <div style={{ fontSize: 12, color: mutedColor, marginTop: 8, fontStyle: 'italic' }}>Notes: {int.notes}</div>}
                </div>
              );
            })
          )}
        </div>
        <div>
          <h3 style={{ color: textColor, marginBottom: 12 }}>Past ({pastInterviews.length})</h3>
          {pastInterviews.length === 0 ? (
            <p style={{ color: mutedColor }}>No past interviews.</p>
          ) : (
            pastInterviews.map(int => {
              const app = applications.find(a => a.id === int.applicationId);
              const applicant = app ? getApplicant(app.applicantId) : null;
              const job = app ? getJob(app.jobId) : null;
              if (!applicant || !job) return null;
              return (
                <div key={int.id} style={{ padding: 14, marginBottom: 8, borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: cardBg, opacity: 0.7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{applicant.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: textColor }}>{applicant.name}</div>
                      <div style={{ fontSize: 12, color: mutedColor }}>{job.title} · {int.type} interview</div>
                      <div style={{ fontSize: 12, color: mutedColor }}>📅 {formatDate(int.date)} · ⏱️ {int.duration} min</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => {
    const { totalApps, activeApps, hiredCount, rejectedCount, avgTimeToHire, openJobs, deptBreakdown, upcomingInterviews } = analyticsData;
    const conversionRate = totalApps > 0 ? ((hiredCount / totalApps) * 100).toFixed(1) : '0.0';
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 20px 0', color: textColor }}>Analytics Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Open Positions', value: openJobs, icon: '💼' },
            { label: 'Total Applications', value: totalApps, icon: '📋' },
            { label: 'Active in Pipeline', value: activeApps, icon: '🔄' },
            { label: 'Hired', value: hiredCount, icon: '✅' },
            { label: 'Rejected', value: rejectedCount, icon: '❌' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, icon: '📊' },
            { label: 'Avg Days to Hire', value: avgTimeToHire, icon: '⏱️' },
            { label: 'Upcoming Interviews', value: upcomingInterviews, icon: '📅' },
          ].map(stat => (
            <div key={stat.label} style={{ padding: 16, borderRadius: 10, border: `1px solid ${borderColor}`, backgroundColor: cardBg }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: textColor }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: mutedColor }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: textColor, marginBottom: 12 }}>Pipeline Overview</h3>
          <div style={{ display: 'flex', gap: 2, borderRadius: 8, overflow: 'hidden', height: 32 }}>
            {PIPELINE_STAGES.map(stage => {
              const count = pipelineStats[stage];
              const width = totalApps > 0 ? (count / totalApps) * 100 : 0;
              if (width === 0) return null;
              return (
                <div key={stage} title={`${stage}: ${count}`} style={{ width: `${width}%`, backgroundColor: STAGE_COLORS[stage], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 600, minWidth: count > 0 ? 24 : 0 }}>
                  {count}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {PIPELINE_STAGES.map(stage => (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: mutedColor }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: STAGE_COLORS[stage], display: 'inline-block' }} />
                {stage}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ color: textColor, marginBottom: 12 }}>Department Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(deptBreakdown).map(([dept, data]) => (
              <div key={dept} style={{ padding: 14, borderRadius: 8, border: `1px solid ${borderColor}`, backgroundColor: cardBg }}>
                <div style={{ fontWeight: 600, color: textColor, marginBottom: 6 }}>{dept}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: mutedColor }}>
                  <span>{data.jobs} job{data.jobs !== 1 ? 's' : ''}</span>
                  <span>{data.applications} app{data.applications !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderJobModal = () => {
    if (!showJobModal) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 24, width: 500, maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: textColor }}>Create New Job</h2>
            <button onClick={() => setShowJobModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: textColor }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="Job Title" value={jobFormData.title} onChange={(e) => setJobFormData(prev => ({ ...prev, title: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
            <select value={jobFormData.department} onChange={(e) => setJobFormData(prev => ({ ...prev, department: e.target.value }))} aria-label="Job department" style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={jobFormData.type} onChange={(e) => setJobFormData(prev => ({ ...prev, type: e.target.value }))} aria-label="Job type" style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }}>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={jobFormData.experience} onChange={(e) => setJobFormData(prev => ({ ...prev, experience: e.target.value }))} aria-label="Experience level" style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }}>
              {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input type="text" placeholder="Location" value={jobFormData.location} onChange={(e) => setJobFormData(prev => ({ ...prev, location: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" placeholder="Min Salary" value={jobFormData.salaryMin} onChange={(e) => setJobFormData(prev => ({ ...prev, salaryMin: e.target.value }))} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
              <input type="number" placeholder="Max Salary" value={jobFormData.salaryMax} onChange={(e) => setJobFormData(prev => ({ ...prev, salaryMax: e.target.value }))} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
            </div>
            <textarea placeholder="Job Description" value={jobFormData.description} onChange={(e) => setJobFormData(prev => ({ ...prev, description: e.target.value }))} rows={4} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor, resize: 'vertical' }} />
            <input type="text" placeholder="Requirements (comma-separated)" value={jobFormData.requirements} onChange={(e) => setJobFormData(prev => ({ ...prev, requirements: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowJobModal(false)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: 'transparent', color: textColor, cursor: 'pointer' }}>Cancel</button>
              <button onClick={createJob} disabled={!jobFormData.title} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: accentColor, color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: jobFormData.title ? 1 : 0.5 }}>Create Job</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInterviewModal = () => {
    if (!showInterviewModal) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 24, width: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, color: textColor }}>Schedule Interview</h2>
            <button onClick={() => setShowInterviewModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: textColor }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="datetime-local" value={interviewFormData.date} onChange={(e) => setInterviewFormData(prev => ({ ...prev, date: e.target.value }))} aria-label="Interview date" style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
            <input type="number" placeholder="Duration (minutes)" value={interviewFormData.duration} onChange={(e) => setInterviewFormData(prev => ({ ...prev, duration: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
            <select value={interviewFormData.type} onChange={(e) => setInterviewFormData(prev => ({ ...prev, type: e.target.value }))} aria-label="Interview type" style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }}>
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="portfolio">Portfolio</option>
              <option value="case-study">Case Study</option>
            </select>
            <input type="text" placeholder="Interviewer Name" value={interviewFormData.interviewer} onChange={(e) => setInterviewFormData(prev => ({ ...prev, interviewer: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
            <input type="text" placeholder="Location (e.g., Zoom, In-person)" value={interviewFormData.location} onChange={(e) => setInterviewFormData(prev => ({ ...prev, location: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor }} />
            <textarea placeholder="Notes" value={interviewFormData.notes} onChange={(e) => setInterviewFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowInterviewModal(false)} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: 'transparent', color: textColor, cursor: 'pointer' }}>Cancel</button>
              <button onClick={scheduleInterview} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: accentColor, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Schedule</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNoteModal = () => {
    if (!showNoteModal) return null;
    const targetApplicant = selectedApplication ? getApplicant(selectedApplication.applicantId) : selectedApplicant;
    if (!targetApplicant) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 24, width: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: textColor }}>Add Note for {targetApplicant.name}</h2>
            <button onClick={() => setShowNoteModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: textColor }}>×</button>
          </div>
          <textarea
            placeholder="Write a note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <button onClick={() => { setShowNoteModal(false); setNoteText(''); }} style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: 'transparent', color: textColor, cursor: 'pointer' }}>Cancel</button>
            <button
              onClick={() => { addNote(targetApplicant.id, noteText); setShowNoteModal(false); setNoteText(''); }}
              disabled={!noteText.trim()}
              style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: accentColor, color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: noteText.trim() ? 1 : 0.5 }}
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'jobs': return renderJobsView();
      case 'pipeline': return renderPipelineView();
      case 'applicants': return renderApplicantsView();
      case 'interviews': return renderInterviewsView();
      case 'analytics': return renderAnalyticsView();
      default: return renderJobsView();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {renderSidebar()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderHeader()}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </div>
      </div>
      {renderJobModal()}
      {renderInterviewModal()}
      {renderNoteModal()}
    </div>
  );
}
