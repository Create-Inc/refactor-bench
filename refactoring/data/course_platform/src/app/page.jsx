import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = ['development', 'design', 'marketing', 'business', 'data-science'];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const DIFFICULTY_COLORS = {
  beginner: '#22c55e',
  intermediate: '#eab308',
  advanced: '#ef4444',
};

const MOCK_INSTRUCTORS = [
  { id: 'i1', name: 'Sarah Miller', avatar: '👩‍🏫', specialty: 'Web Development', rating: 4.8, coursesCount: 12 },
  { id: 'i2', name: 'James Park', avatar: '👨‍💻', specialty: 'Data Science', rating: 4.9, coursesCount: 8 },
  { id: 'i3', name: 'Maria Garcia', avatar: '👩‍🎨', specialty: 'UI/UX Design', rating: 4.7, coursesCount: 15 },
  { id: 'i4', name: 'Alex Johnson', avatar: '👨‍💼', specialty: 'Digital Marketing', rating: 4.6, coursesCount: 10 },
  { id: 'i5', name: 'Emily Chen', avatar: '👩‍🔬', specialty: 'Machine Learning', rating: 4.9, coursesCount: 6 },
];

const INITIAL_COURSES = [
  {
    id: 'c1',
    title: 'Complete React Masterclass',
    description: 'Learn React from scratch including hooks, context, routing, and state management with real-world projects.',
    category: 'development',
    difficulty: 'intermediate',
    instructor: 'i1',
    price: 49.99,
    rating: 4.7,
    studentsEnrolled: 2340,
    totalLessons: 42,
    totalDuration: 28,
    thumbnail: '⚛️',
    tags: ['react', 'javascript', 'frontend'],
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 5,
    modules: [
      {
        id: 'm1',
        title: 'Getting Started with React',
        lessons: [
          { id: 'l1', title: 'Introduction to React', duration: 15, type: 'video', completed: true },
          { id: 'l2', title: 'Setting up Your Environment', duration: 20, type: 'video', completed: true },
          { id: 'l3', title: 'Your First Component', duration: 25, type: 'video', completed: true },
          { id: 'l4', title: 'Quiz: React Basics', duration: 10, type: 'quiz', completed: false },
        ],
      },
      {
        id: 'm2',
        title: 'React Hooks Deep Dive',
        lessons: [
          { id: 'l5', title: 'useState and useEffect', duration: 30, type: 'video', completed: false },
          { id: 'l6', title: 'useContext and useReducer', duration: 35, type: 'video', completed: false },
          { id: 'l7', title: 'Custom Hooks', duration: 25, type: 'video', completed: false },
          { id: 'l8', title: 'Exercise: Build a Custom Hook', duration: 45, type: 'exercise', completed: false },
        ],
      },
      {
        id: 'm3',
        title: 'State Management',
        lessons: [
          { id: 'l9', title: 'Context API Patterns', duration: 30, type: 'video', completed: false },
          { id: 'l10', title: 'Redux Toolkit', duration: 40, type: 'video', completed: false },
          { id: 'l11', title: 'Project: Todo App with Redux', duration: 60, type: 'exercise', completed: false },
        ],
      },
    ],
  },
  {
    id: 'c2',
    title: 'Python for Data Science',
    description: 'Master Python fundamentals and data science libraries including pandas, numpy, matplotlib, and scikit-learn.',
    category: 'data-science',
    difficulty: 'beginner',
    instructor: 'i2',
    price: 59.99,
    rating: 4.9,
    studentsEnrolled: 5600,
    totalLessons: 56,
    totalDuration: 38,
    thumbnail: '🐍',
    tags: ['python', 'data-science', 'pandas'],
    createdAt: Date.now() - 86400000 * 120,
    updatedAt: Date.now() - 86400000 * 2,
    modules: [
      {
        id: 'm4',
        title: 'Python Basics',
        lessons: [
          { id: 'l12', title: 'Variables and Data Types', duration: 20, type: 'video', completed: true },
          { id: 'l13', title: 'Control Flow', duration: 25, type: 'video', completed: true },
          { id: 'l14', title: 'Functions and Modules', duration: 30, type: 'video', completed: false },
        ],
      },
      {
        id: 'm5',
        title: 'Data Analysis with Pandas',
        lessons: [
          { id: 'l15', title: 'Introduction to Pandas', duration: 35, type: 'video', completed: false },
          { id: 'l16', title: 'Data Cleaning', duration: 40, type: 'video', completed: false },
          { id: 'l17', title: 'Exercise: Analyze a Dataset', duration: 50, type: 'exercise', completed: false },
        ],
      },
    ],
  },
  {
    id: 'c3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of user interface and user experience design with hands-on Figma projects.',
    category: 'design',
    difficulty: 'beginner',
    instructor: 'i3',
    price: 39.99,
    rating: 4.6,
    studentsEnrolled: 1890,
    totalLessons: 35,
    totalDuration: 22,
    thumbnail: '🎨',
    tags: ['design', 'ui', 'ux', 'figma'],
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 10,
    modules: [
      {
        id: 'm6',
        title: 'Design Principles',
        lessons: [
          { id: 'l18', title: 'Color Theory', duration: 20, type: 'video', completed: true },
          { id: 'l19', title: 'Typography', duration: 25, type: 'video', completed: true },
          { id: 'l20', title: 'Layout and Composition', duration: 30, type: 'video', completed: true },
          { id: 'l21', title: 'Quiz: Design Principles', duration: 15, type: 'quiz', completed: true },
        ],
      },
      {
        id: 'm7',
        title: 'Figma Mastery',
        lessons: [
          { id: 'l22', title: 'Figma Interface Tour', duration: 20, type: 'video', completed: false },
          { id: 'l23', title: 'Components and Variants', duration: 35, type: 'video', completed: false },
          { id: 'l24', title: 'Project: Design a Mobile App', duration: 90, type: 'exercise', completed: false },
        ],
      },
    ],
  },
  {
    id: 'c4',
    title: 'Digital Marketing Strategy',
    description: 'Build a comprehensive digital marketing strategy covering SEO, social media, content marketing, and paid ads.',
    category: 'marketing',
    difficulty: 'intermediate',
    instructor: 'i4',
    price: 44.99,
    rating: 4.5,
    studentsEnrolled: 980,
    totalLessons: 30,
    totalDuration: 18,
    thumbnail: '📣',
    tags: ['marketing', 'seo', 'social-media'],
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 3,
    modules: [
      {
        id: 'm8',
        title: 'SEO Fundamentals',
        lessons: [
          { id: 'l25', title: 'How Search Engines Work', duration: 20, type: 'video', completed: false },
          { id: 'l26', title: 'Keyword Research', duration: 30, type: 'video', completed: false },
          { id: 'l27', title: 'On-Page Optimization', duration: 25, type: 'video', completed: false },
        ],
      },
    ],
  },
  {
    id: 'c5',
    title: 'Advanced Machine Learning',
    description: 'Deep dive into neural networks, transformers, reinforcement learning, and MLOps with production deployment.',
    category: 'data-science',
    difficulty: 'advanced',
    instructor: 'i5',
    price: 79.99,
    rating: 4.8,
    studentsEnrolled: 720,
    totalLessons: 48,
    totalDuration: 45,
    thumbnail: '🤖',
    tags: ['ml', 'deep-learning', 'python', 'tensorflow'],
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 1,
    modules: [
      {
        id: 'm9',
        title: 'Neural Networks',
        lessons: [
          { id: 'l28', title: 'Perceptrons and Activation Functions', duration: 35, type: 'video', completed: false },
          { id: 'l29', title: 'Backpropagation', duration: 40, type: 'video', completed: false },
          { id: 'l30', title: 'CNNs for Computer Vision', duration: 45, type: 'video', completed: false },
          { id: 'l31', title: 'Exercise: Image Classifier', duration: 60, type: 'exercise', completed: false },
        ],
      },
      {
        id: 'm10',
        title: 'Transformers and NLP',
        lessons: [
          { id: 'l32', title: 'Attention Mechanism', duration: 35, type: 'video', completed: false },
          { id: 'l33', title: 'BERT and GPT Architectures', duration: 40, type: 'video', completed: false },
          { id: 'l34', title: 'Fine-tuning LLMs', duration: 50, type: 'video', completed: false },
        ],
      },
    ],
  },
  {
    id: 'c6',
    title: 'Business Analytics with Excel',
    description: 'Learn to leverage Excel for business decision-making with pivot tables, dashboards, and data visualization.',
    category: 'business',
    difficulty: 'beginner',
    instructor: 'i4',
    price: 29.99,
    rating: 4.4,
    studentsEnrolled: 3200,
    totalLessons: 24,
    totalDuration: 16,
    thumbnail: '📊',
    tags: ['excel', 'analytics', 'business'],
    createdAt: Date.now() - 86400000 * 75,
    updatedAt: Date.now() - 86400000 * 15,
    modules: [
      {
        id: 'm11',
        title: 'Excel Essentials',
        lessons: [
          { id: 'l35', title: 'Formulas and Functions', duration: 25, type: 'video', completed: true },
          { id: 'l36', title: 'Pivot Tables', duration: 30, type: 'video', completed: true },
          { id: 'l37', title: 'Charts and Visualization', duration: 35, type: 'video', completed: false },
        ],
      },
    ],
  },
];

const STUDENT_NOTES = [
  { id: 'n1', courseId: 'c1', lessonId: 'l1', text: 'React uses a virtual DOM for efficient updates', timestamp: Date.now() - 86400000 * 10 },
  { id: 'n2', courseId: 'c1', lessonId: 'l2', text: 'Need to install Node.js and npm first', timestamp: Date.now() - 86400000 * 9 },
  { id: 'n3', courseId: 'c2', lessonId: 'l12', text: 'Python is dynamically typed', timestamp: Date.now() - 86400000 * 5 },
  { id: 'n4', courseId: 'c3', lessonId: 'l18', text: 'Use 60-30-10 rule for color distribution', timestamp: Date.now() - 86400000 * 3 },
];

export default function CoursePlatform() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(['c1', 'c2', 'c3', 'c6']);
  const [activeView, setActiveView] = useState('catalog');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseModalData, setCourseModalData] = useState(null);
  const [notes, setNotes] = useState(STUDENT_NOTES);
  const [newNote, setNewNote] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [bookmarkedLessons, setBookmarkedLessons] = useState(['l1', 'l18']);
  const [certificateModal, setCertificateModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviews, setReviews] = useState([
    { id: 'r1', courseId: 'c1', author: 'Student A', rating: 5, text: 'Excellent course! Very thorough.', timestamp: Date.now() - 86400000 * 20 },
    { id: 'r2', courseId: 'c1', author: 'Student B', rating: 4, text: 'Good content but could use more exercises.', timestamp: Date.now() - 86400000 * 15 },
    { id: 'r3', courseId: 'c2', author: 'Student C', rating: 5, text: 'Best Python course I have taken.', timestamp: Date.now() - 86400000 * 8 },
  ]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('coursePlatformTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedEnrolled = localStorage.getItem('enrolledCourses');
    if (savedEnrolled) {
      try { setEnrolledCourseIds(JSON.parse(savedEnrolled)); } catch (e) { /* ignore */ }
    }

    const savedNotes = localStorage.getItem('studentNotes');
    if (savedNotes) {
      try { setNotes(JSON.parse(savedNotes)); } catch (e) { /* ignore */ }
    }

    const savedBookmarks = localStorage.getItem('bookmarkedLessons');
    if (savedBookmarks) {
      try { setBookmarkedLessons(JSON.parse(savedBookmarks)); } catch (e) { /* ignore */ }
    }

    const savedView = localStorage.getItem('coursePlatformView');
    if (savedView) setActiveView(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourseIds));
  }, [enrolledCourseIds]);

  useEffect(() => {
    localStorage.setItem('studentNotes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('bookmarkedLessons', JSON.stringify(bookmarkedLessons));
  }, [bookmarkedLessons]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedCourse(null);
        setShowCourseModal(false);
        setCertificateModal(null);
        setReviewModal(null);
        setShowNotesPanel(false);
        setActiveLessonId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('coursePlatformTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const getInstructor = (id) => MOCK_INSTRUCTORS.find(i => i.id === id);

  const enrollInCourse = (courseId) => {
    if (!enrolledCourseIds.includes(courseId)) {
      setEnrolledCourseIds(prev => [...prev, courseId]);
    }
  };

  const unenrollFromCourse = (courseId) => {
    if (window.confirm('Are you sure you want to unenroll from this course? Your progress will be lost.')) {
      setEnrolledCourseIds(prev => prev.filter(id => id !== courseId));
      setCourses(prev => prev.map(c => {
        if (c.id !== courseId) return c;
        return { ...c, modules: c.modules.map(m => ({ ...m, lessons: m.lessons.map(l => ({ ...l, completed: false })) })) };
      }));
    }
  };

  const toggleLessonComplete = (courseId, lessonId) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l),
        })),
      };
    }));
  };

  const getCourseProgress = useCallback((courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;
    const allLessons = course.modules.flatMap(m => m.lessons);
    if (allLessons.length === 0) return 0;
    return Math.round((allLessons.filter(l => l.completed).length / allLessons.length) * 100);
  }, [courses]);

  const getEnrolledCourses = useCallback(() => {
    return courses.filter(c => enrolledCourseIds.includes(c.id));
  }, [courses, enrolledCourseIds]);

  const getTotalLearningHours = useCallback(() => {
    const enrolled = getEnrolledCourses();
    let completedMinutes = 0;
    enrolled.forEach(c => {
      c.modules.forEach(m => {
        m.lessons.forEach(l => {
          if (l.completed) completedMinutes += l.duration;
        });
      });
    });
    return Math.round(completedMinutes / 60 * 10) / 10;
  }, [getEnrolledCourses]);

  const getCompletedLessonsCount = useCallback(() => {
    const enrolled = getEnrolledCourses();
    let count = 0;
    enrolled.forEach(c => {
      c.modules.forEach(m => {
        m.lessons.forEach(l => {
          if (l.completed) count++;
        });
      });
    });
    return count;
  }, [getEnrolledCourses]);

  const getStreakDays = useCallback(() => {
    // Simulated streak based on completed lessons
    return getCompletedLessonsCount() > 0 ? Math.min(getCompletedLessonsCount(), 14) : 0;
  }, [getCompletedLessonsCount]);

  const toggleBookmark = (lessonId) => {
    setBookmarkedLessons(prev =>
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
  };

  const addNote = (courseId, lessonId, text) => {
    if (!text.trim()) return;
    const note = { id: Date.now().toString(), courseId, lessonId, text, timestamp: Date.now() };
    setNotes(prev => [...prev, note]);
    setNewNote('');
  };

  const deleteNote = (noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const submitReview = (courseId) => {
    if (!reviewText.trim()) return;
    const review = { id: Date.now().toString(), courseId, author: 'You', rating: reviewRating, text: reviewText, timestamp: Date.now() };
    setReviews(prev => [...prev, review]);
    setReviewText('');
    setReviewRating(5);
    setReviewModal(null);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchDesc = course.description.toLowerCase().includes(q);
        const matchTags = course.tags.some(t => t.toLowerCase().includes(q));
        const matchInstructor = getInstructor(course.instructor)?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTags && !matchInstructor) return false;
      }
      if (filterCategory !== 'all' && course.category !== filterCategory) return false;
      if (filterDifficulty !== 'all' && course.difficulty !== filterDifficulty) return false;
      if (filterPrice === 'free' && course.price > 0) return false;
      if (filterPrice === 'paid' && course.price === 0) return false;
      if (filterPrice === 'under50' && course.price >= 50) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.studentsEnrolled - a.studentsEnrolled;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [courses, searchQuery, filterCategory, filterDifficulty, filterPrice, sortBy]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db', fontSize: '14px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const bgColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const secondaryText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#6366f1';
  const successColor = '#22c55e';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? '64px' : '250px', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? '16px 12px' : '20px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>🎓 LearnHub</h1>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText, padding: '4px' }}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'catalog', icon: '📚', label: 'Course Catalog' },
            { id: 'my-courses', icon: '📖', label: 'My Courses' },
            { id: 'progress', icon: '📊', label: 'Progress' },
            { id: 'bookmarks', icon: '🔖', label: 'Bookmarks' },
            { id: 'certificates', icon: '🏆', label: 'Certificates' },
            { id: 'instructors', icon: '👩‍🏫', label: 'Instructors' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSelectedCourse(null);
                setActiveLessonId(null);
                localStorage.setItem('coursePlatformView', item.id);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
                marginBottom: '4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                backgroundColor: activeView === item.id ? (isDarkMode ? '#1e293b' : '#eef2ff') : 'transparent',
                color: activeView === item.id ? accentColor : textColor, fontWeight: activeView === item.id ? 600 : 400,
                textAlign: 'left', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div style={{ padding: '16px', borderTop: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Learning Streak</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>🔥 {getStreakDays()} days</div>
            <div style={{ fontSize: '12px', color: secondaryText, marginTop: '8px' }}>{getTotalLearningHours()}h total learning</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search courses... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${borderColor}`,
                  borderRadius: '8px', fontSize: '14px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                  color: textColor, outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter by category"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Levels</option>
              {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>

            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              aria-label="Filter by price"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="under50">Under $50</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowNotesPanel(true)}
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
              aria-label="Open notes"
            >
              📝 Notes
            </button>
            <button onClick={toggleTheme} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label="Toggle theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Catalog View */}
          {activeView === 'catalog' && !selectedCourse && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Course Catalog</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: secondaryText }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort courses"
                    style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor, cursor: 'pointer' }}
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="title">Title A-Z</option>
                  </select>
                  <span style={{ fontSize: '13px', color: secondaryText }}>{filteredCourses.length} courses</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredCourses.map(course => {
                  const instructor = getInstructor(course.instructor);
                  const isEnrolled = enrolledCourseIds.includes(course.id);
                  const progress = getCourseProgress(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => { setSelectedCourse(course); setCourseModalData(course); setShowCourseModal(true); }}
                      style={{
                        backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`,
                        cursor: 'pointer', overflow: 'hidden', transition: 'box-shadow 0.2s',
                      }}
                    >
                      <div style={{ padding: '24px 20px 16px', backgroundColor: isDarkMode ? '#1a2332' : '#f1f5f9', textAlign: 'center', fontSize: '48px', position: 'relative' }}>
                        {course.thumbnail}
                        <span style={{
                          position: 'absolute', top: '12px', right: '12px', fontSize: '11px', padding: '3px 8px',
                          borderRadius: '6px', backgroundColor: DIFFICULTY_COLORS[course.difficulty] + '20',
                          color: DIFFICULTY_COLORS[course.difficulty], fontWeight: 600,
                        }}>
                          {course.difficulty}
                        </span>
                        {isEnrolled && (
                          <span style={{
                            position: 'absolute', top: '12px', left: '12px', fontSize: '11px', padding: '3px 8px',
                            borderRadius: '6px', backgroundColor: successColor + '20', color: successColor, fontWeight: 600,
                          }}>
                            Enrolled
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '10px', color: secondaryText, textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                          {course.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px', lineHeight: 1.3 }}>{course.title}</h3>
                        <p style={{ fontSize: '13px', color: secondaryText, margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px' }}>
                          <span>{instructor?.avatar}</span>
                          <span style={{ color: secondaryText }}>{instructor?.name}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                          {renderStars(course.rating)}
                          <span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '4px' }}>{course.rating}</span>
                          <span style={{ fontSize: '12px', color: secondaryText }}>({course.studentsEnrolled.toLocaleString()} students)</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700, color: accentColor }}>${course.price}</span>
                          <span style={{ fontSize: '12px', color: secondaryText }}>
                            {course.totalLessons} lessons · {course.totalDuration}h
                          </span>
                        </div>

                        {isEnrolled && progress > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: secondaryText, marginBottom: '4px' }}>
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div style={{ height: '4px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: successColor, borderRadius: '2px' }} />
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                          {course.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isDarkMode ? '#334155' : '#e0e7ff', color: accentColor }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Courses View */}
          {activeView === 'my-courses' && !selectedCourse && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>My Courses</h2>
              {getEnrolledCourses().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                  <p style={{ fontSize: '16px' }}>You haven't enrolled in any courses yet.</p>
                  <button
                    onClick={() => setActiveView('catalog')}
                    style={{ padding: '10px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '12px' }}
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {getEnrolledCourses().map(course => {
                    const instructor = getInstructor(course.instructor);
                    const progress = getCourseProgress(course.id);
                    const completedLessons = course.modules.flatMap(m => m.lessons).filter(l => l.completed).length;
                    const totalLessons = course.modules.flatMap(m => m.lessons).length;
                    return (
                      <div
                        key={course.id}
                        style={{ display: 'flex', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}
                      >
                        <div style={{ width: '120px', backgroundColor: isDarkMode ? '#1a2332' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', flexShrink: 0 }}>
                          {course.thumbnail}
                        </div>
                        <div style={{ flex: 1, padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{course.title}</h3>
                              <div style={{ fontSize: '13px', color: secondaryText, marginBottom: '8px' }}>
                                {instructor?.avatar} {instructor?.name}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setActiveView('my-courses'); }}
                                style={{ padding: '6px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                Continue
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); unenrollFromCourse(course.id); }}
                                style={{ padding: '6px 14px', backgroundColor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: secondaryText }}
                              >
                                Unenroll
                              </button>
                            </div>
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>
                              <span>{completedLessons}/{totalLessons} lessons completed</span>
                              <span>{progress}%</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? successColor : accentColor, borderRadius: '3px', transition: 'width 0.3s' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Course Detail / Lesson Player */}
          {selectedCourse && (
            <div>
              <button
                onClick={() => { setSelectedCourse(null); setActiveLessonId(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: accentColor, fontSize: '13px', marginBottom: '16px' }}
              >
                ← Back to {activeView === 'my-courses' ? 'My Courses' : 'Catalog'}
              </button>

              <div style={{ display: 'flex', gap: '24px' }}>
                {/* Course Content / Lesson Player */}
                <div style={{ flex: 1 }}>
                  {activeLessonId ? (
                    <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px' }}>
                      {(() => {
                        const lesson = selectedCourse.modules.flatMap(m => m.lessons).find(l => l.id === activeLessonId);
                        if (!lesson) return null;
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{lesson.title}</h3>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => toggleBookmark(lesson.id)}
                                  style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: bookmarkedLessons.includes(lesson.id) ? '#fef3c7' : 'transparent', fontSize: '14px' }}
                                  aria-label={bookmarkedLessons.includes(lesson.id) ? 'Remove bookmark' : 'Bookmark lesson'}
                                >
                                  {bookmarkedLessons.includes(lesson.id) ? '🔖' : '📑'}
                                </button>
                                <button
                                  onClick={() => toggleLessonComplete(selectedCourse.id, lesson.id)}
                                  style={{
                                    padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                    backgroundColor: lesson.completed ? successColor : accentColor, color: '#fff',
                                  }}
                                >
                                  {lesson.completed ? '✓ Completed' : 'Mark Complete'}
                                </button>
                              </div>
                            </div>

                            <div style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px', padding: '60px', textAlign: 'center', marginBottom: '20px' }}>
                              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                                {lesson.type === 'video' ? '🎬' : lesson.type === 'quiz' ? '❓' : '💻'}
                              </div>
                              <p style={{ color: secondaryText, margin: 0 }}>
                                {lesson.type === 'video' ? 'Video Player' : lesson.type === 'quiz' ? 'Quiz Interface' : 'Exercise Environment'}
                              </p>
                              <p style={{ color: secondaryText, fontSize: '13px', margin: '8px 0 0' }}>Duration: {formatDuration(lesson.duration)}</p>
                            </div>

                            {/* Notes Section */}
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Lesson Notes</h4>
                              {notes.filter(n => n.lessonId === lesson.id).map(note => (
                                <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                                  <div>
                                    <p style={{ margin: '0 0 4px' }}>{note.text}</p>
                                    <span style={{ fontSize: '11px', color: secondaryText }}>{formatDate(note.timestamp)}</span>
                                  </div>
                                  <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: secondaryText, fontSize: '14px' }}>×</button>
                                </div>
                              ))}
                              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <input
                                  type="text"
                                  placeholder="Add a note..."
                                  value={newNote}
                                  onChange={(e) => setNewNote(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      addNote(selectedCourse.id, lesson.id, newNote);
                                    }
                                  }}
                                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
                                />
                                <button
                                  onClick={() => addNote(selectedCourse.id, lesson.id, newNote)}
                                  style={{ padding: '8px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div>
                      <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                          <div style={{ fontSize: '64px' }}>{selectedCourse.thumbnail}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{
                                fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                                backgroundColor: DIFFICULTY_COLORS[selectedCourse.difficulty] + '20',
                                color: DIFFICULTY_COLORS[selectedCourse.difficulty], fontWeight: 600,
                              }}>
                                {selectedCourse.difficulty}
                              </span>
                              <span style={{ fontSize: '11px', color: secondaryText, textTransform: 'uppercase', fontWeight: 600 }}>
                                {selectedCourse.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </span>
                            </div>
                            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>{selectedCourse.title}</h2>
                            <p style={{ fontSize: '14px', color: secondaryText, margin: '0 0 12px', lineHeight: 1.6 }}>{selectedCourse.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {renderStars(selectedCourse.rating)}
                                <span style={{ fontWeight: 600, marginLeft: '4px' }}>{selectedCourse.rating}</span>
                              </span>
                              <span style={{ color: secondaryText }}>{selectedCourse.studentsEnrolled.toLocaleString()} students</span>
                              <span style={{ color: secondaryText }}>{selectedCourse.totalLessons} lessons</span>
                              <span style={{ color: secondaryText }}>{selectedCourse.totalDuration}h total</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: accentColor, marginBottom: '8px' }}>${selectedCourse.price}</div>
                            {enrolledCourseIds.includes(selectedCourse.id) ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <button
                                  onClick={() => setReviewModal(selectedCourse.id)}
                                  style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}
                                >
                                  Write Review
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => enrollInCourse(selectedCourse.id)}
                                style={{ padding: '10px 24px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                              >
                                Enroll Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Instructor Card */}
                      <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>{getInstructor(selectedCourse.instructor)?.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{getInstructor(selectedCourse.instructor)?.name}</div>
                          <div style={{ fontSize: '12px', color: secondaryText }}>{getInstructor(selectedCourse.instructor)?.specialty}</div>
                          <div style={{ fontSize: '12px', color: secondaryText, marginTop: '2px' }}>
                            ★ {getInstructor(selectedCourse.instructor)?.rating} · {getInstructor(selectedCourse.instructor)?.coursesCount} courses
                          </div>
                        </div>
                      </div>

                      {/* Reviews Section */}
                      <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Reviews ({reviews.filter(r => r.courseId === selectedCourse.id).length})</h3>
                        {reviews.filter(r => r.courseId === selectedCourse.id).length === 0 ? (
                          <p style={{ color: secondaryText, fontSize: '13px' }}>No reviews yet. Be the first to review!</p>
                        ) : (
                          reviews.filter(r => r.courseId === selectedCourse.id).map(review => (
                            <div key={review.id} style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{ fontWeight: 600 }}>{review.author}</span>
                                <span>{renderStars(review.rating)}</span>
                                <span style={{ color: secondaryText, fontSize: '11px' }}>{formatDate(review.timestamp)}</span>
                              </div>
                              <p style={{ margin: 0, color: secondaryText, lineHeight: 1.5 }}>{review.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Sidebar - Module List */}
                <div style={{ width: '320px', flexShrink: 0 }}>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden', position: 'sticky', top: '0' }}>
                    {enrolledCourseIds.includes(selectedCourse.id) && (
                      <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: secondaryText, marginBottom: '6px' }}>
                          <span>Course Progress</span>
                          <span>{getCourseProgress(selectedCourse.id)}%</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${getCourseProgress(selectedCourse.id)}%`, height: '100%', backgroundColor: getCourseProgress(selectedCourse.id) === 100 ? successColor : accentColor, borderRadius: '3px' }} />
                        </div>
                      </div>
                    )}
                    <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                      {selectedCourse.modules.map((module, moduleIndex) => (
                        <div key={module.id}>
                          <div style={{ padding: '12px 16px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', fontWeight: 600, fontSize: '13px', borderBottom: `1px solid ${borderColor}` }}>
                            Module {moduleIndex + 1}: {module.title}
                          </div>
                          {module.lessons.map(lesson => (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                if (enrolledCourseIds.includes(selectedCourse.id)) {
                                  setActiveLessonId(lesson.id);
                                }
                              }}
                              style={{
                                padding: '10px 16px', borderBottom: `1px solid ${borderColor}`,
                                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px',
                                cursor: enrolledCourseIds.includes(selectedCourse.id) ? 'pointer' : 'default',
                                backgroundColor: activeLessonId === lesson.id ? (isDarkMode ? '#1e293b' : '#eef2ff') : 'transparent',
                                opacity: enrolledCourseIds.includes(selectedCourse.id) ? 1 : 0.6,
                              }}
                            >
                              <span style={{ fontSize: '14px', flexShrink: 0 }}>
                                {lesson.completed ? '✅' : lesson.type === 'video' ? '🎬' : lesson.type === 'quiz' ? '❓' : '💻'}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: activeLessonId === lesson.id ? 600 : 400 }}>{lesson.title}</div>
                                <div style={{ fontSize: '11px', color: secondaryText }}>{formatDuration(lesson.duration)}</div>
                              </div>
                              {bookmarkedLessons.includes(lesson.id) && <span style={{ fontSize: '12px' }}>🔖</span>}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress View */}
          {activeView === 'progress' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Learning Progress</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Courses Enrolled', value: enrolledCourseIds.length, icon: '📚', color: accentColor },
                  { label: 'Lessons Completed', value: getCompletedLessonsCount(), icon: '✅', color: successColor },
                  { label: 'Hours Learned', value: getTotalLearningHours(), icon: '⏱️', color: '#f59e0b' },
                  { label: 'Day Streak', value: getStreakDays(), icon: '🔥', color: '#ef4444' },
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

              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', fontWeight: 600, fontSize: '15px', borderBottom: `1px solid ${borderColor}` }}>
                  Course-by-Course Progress
                </div>
                {getEnrolledCourses().map(course => {
                  const progress = getCourseProgress(course.id);
                  const completed = course.modules.flatMap(m => m.lessons).filter(l => l.completed).length;
                  const total = course.modules.flatMap(m => m.lessons).length;
                  return (
                    <div key={course.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '28px' }}>{course.thumbnail}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>{course.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? successColor : accentColor, borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '12px', color: secondaryText, whiteSpace: 'nowrap' }}>{completed}/{total} · {progress}%</span>
                        </div>
                      </div>
                      {progress === 100 && (
                        <button
                          onClick={() => setCertificateModal(course.id)}
                          style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#b45309', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          🏆 Certificate
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bookmarks View */}
          {activeView === 'bookmarks' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Bookmarked Lessons</h2>
              {bookmarkedLessons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔖</div>
                  <p style={{ fontSize: '16px' }}>No bookmarked lessons yet.</p>
                </div>
              ) : (
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                  {bookmarkedLessons.map(lessonId => {
                    let foundCourse = null;
                    let foundLesson = null;
                    courses.forEach(c => {
                      c.modules.forEach(m => {
                        m.lessons.forEach(l => {
                          if (l.id === lessonId) { foundCourse = c; foundLesson = l; }
                        });
                      });
                    });
                    if (!foundLesson) return null;
                    return (
                      <div key={lessonId} style={{ padding: '14px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px' }}>
                          {foundLesson.type === 'video' ? '🎬' : foundLesson.type === 'quiz' ? '❓' : '💻'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{foundLesson.title}</div>
                          <div style={{ fontSize: '12px', color: secondaryText }}>{foundCourse?.title} · {formatDuration(foundLesson.duration)}</div>
                        </div>
                        <button
                          onClick={() => toggleBookmark(lessonId)}
                          style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '12px', color: secondaryText }}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Certificates View */}
          {activeView === 'certificates' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Certificates</h2>
              {(() => {
                const completedCourses = getEnrolledCourses().filter(c => getCourseProgress(c.id) === 100);
                if (completedCourses.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                      <p style={{ fontSize: '16px' }}>Complete a course to earn your first certificate!</p>
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {completedCourses.map(course => (
                      <div key={course.id} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `2px solid #f59e0b`, padding: '24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>Certificate of Completion</h3>
                        <p style={{ fontSize: '14px', color: accentColor, fontWeight: 600, margin: '0 0 8px' }}>{course.title}</p>
                        <p style={{ fontSize: '12px', color: secondaryText, margin: 0 }}>
                          Instructor: {getInstructor(course.instructor)?.name}
                        </p>
                        <button
                          onClick={() => setCertificateModal(course.id)}
                          style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#fef3c7', color: '#b45309', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                        >
                          View Certificate
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Instructors View */}
          {activeView === 'instructors' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Instructors</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {MOCK_INSTRUCTORS.map(instructor => {
                  const instructorCourses = courses.filter(c => c.instructor === instructor.id);
                  return (
                    <div key={instructor.id} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{instructor.avatar}</div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{instructor.name}</h3>
                      <div style={{ fontSize: '13px', color: secondaryText, marginBottom: '8px' }}>{instructor.specialty}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
                        {renderStars(instructor.rating)}
                        <span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '4px' }}>{instructor.rating}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '12px', borderTop: `1px solid ${borderColor}`, fontSize: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>{instructorCourses.length}</div>
                          <div style={{ color: secondaryText }}>Courses</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>{instructorCourses.reduce((sum, c) => sum + c.studentsEnrolled, 0).toLocaleString()}</div>
                          <div style={{ color: secondaryText }}>Students</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Detail Modal (for quick preview from catalog) */}
      {showCourseModal && courseModalData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => { setShowCourseModal(false); setCourseModalData(null); }}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                    backgroundColor: DIFFICULTY_COLORS[courseModalData.difficulty] + '20',
                    color: DIFFICULTY_COLORS[courseModalData.difficulty], fontWeight: 600,
                  }}>
                    {courseModalData.difficulty}
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{courseModalData.title}</h2>
              </div>
              <button onClick={() => { setShowCourseModal(false); setCourseModalData(null); }} style={{ padding: '6px 12px', backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', color: textColor }}>×</button>
            </div>

            <p style={{ fontSize: '14px', color: secondaryText, lineHeight: 1.6, margin: '0 0 16px' }}>{courseModalData.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {renderStars(courseModalData.rating)}
                <span style={{ fontWeight: 600 }}>{courseModalData.rating}</span>
              </span>
              <span style={{ color: secondaryText }}>{courseModalData.studentsEnrolled.toLocaleString()} students</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
              <span style={{ fontSize: '24px' }}>{getInstructor(courseModalData.instructor)?.avatar}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{getInstructor(courseModalData.instructor)?.name}</div>
                <div style={{ fontSize: '12px', color: secondaryText }}>{getInstructor(courseModalData.instructor)?.specialty}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>Course Content</h3>
              <div style={{ fontSize: '13px', color: secondaryText, marginBottom: '10px' }}>
                {courseModalData.modules.length} modules · {courseModalData.totalLessons} lessons · {courseModalData.totalDuration}h total
              </div>
              {courseModalData.modules.map((module, i) => (
                <div key={module.id} style={{ padding: '10px 0', borderBottom: `1px solid ${borderColor}` }}>
                  <div style={{ fontWeight: 500 }}>Module {i + 1}: {module.title}</div>
                  <div style={{ fontSize: '12px', color: secondaryText }}>{module.lessons.length} lessons</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: accentColor }}>${courseModalData.price}</span>
              {enrolledCourseIds.includes(courseModalData.id) ? (
                <button
                  onClick={() => { setShowCourseModal(false); setSelectedCourse(courseModalData); }}
                  style={{ padding: '10px 24px', backgroundColor: successColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                >
                  Continue Learning
                </button>
              ) : (
                <button
                  onClick={() => { enrollInCourse(courseModalData.id); setShowCourseModal(false); }}
                  style={{ padding: '10px 24px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                >
                  Enroll Now — ${courseModalData.price}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certificateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setCertificateModal(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '40px', textAlign: 'center', border: '3px solid #f59e0b' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Certificate of Completion</h2>
            <p style={{ fontSize: '16px', color: accentColor, fontWeight: 600, margin: '0 0 4px' }}>
              {courses.find(c => c.id === certificateModal)?.title}
            </p>
            <p style={{ fontSize: '14px', color: secondaryText, margin: '0 0 16px' }}>
              Instructor: {getInstructor(courses.find(c => c.id === certificateModal)?.instructor)?.name}
            </p>
            <div style={{ fontSize: '14px', color: secondaryText, borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
              <p style={{ margin: '0 0 4px' }}>Issued to: <strong>Student</strong></p>
              <p style={{ margin: '0' }}>Date: {formatDate(Date.now())}</p>
            </div>
            <button
              onClick={() => setCertificateModal(null)}
              style={{ marginTop: '20px', padding: '8px 20px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '14px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setReviewModal(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Write a Review</h2>
              <button onClick={() => setReviewModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '8px' }}>Rating</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: star <= reviewRating ? '#f59e0b' : '#d1d5db' }}
                    aria-label={`Rate ${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '8px' }}>Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={4}
                style={{ width: '100%', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setReviewModal(null)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={() => submitReview(reviewModal)} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Side Panel */}
      {showNotesPanel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 2000 }} onClick={() => setShowNotesPanel(false)}>
          <div style={{ backgroundColor: cardBg, width: '400px', height: '100%', padding: '24px', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>📝 All Notes</h2>
              <button onClick={() => setShowNotesPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            {notes.length === 0 ? (
              <p style={{ color: secondaryText, fontSize: '14px', textAlign: 'center', padding: '20px' }}>No notes yet. Add notes while watching lessons.</p>
            ) : (
              notes.sort((a, b) => b.timestamp - a.timestamp).map(note => {
                const course = courses.find(c => c.id === note.courseId);
                let lessonTitle = '';
                course?.modules.forEach(m => { m.lessons.forEach(l => { if (l.id === note.lessonId) lessonTitle = l.title; }); });
                return (
                  <div key={note.id} style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontSize: '11px', color: accentColor, fontWeight: 600, marginBottom: '4px' }}>{course?.title}</div>
                    <div style={{ fontSize: '11px', color: secondaryText, marginBottom: '6px' }}>{lessonTitle}</div>
                    <p style={{ fontSize: '13px', margin: '0 0 4px', lineHeight: 1.5 }}>{note.text}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: secondaryText }}>{formatDate(note.timestamp)}</span>
                      <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '12px' }}>Delete</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
