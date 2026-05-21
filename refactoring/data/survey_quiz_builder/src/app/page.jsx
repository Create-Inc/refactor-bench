import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const QUESTION_TYPES = [
  { id: 'text', label: 'Short Text', icon: '✏️' },
  { id: 'textarea', label: 'Long Text', icon: '📝' },
  { id: 'multiple_choice', label: 'Multiple Choice', icon: '🔘' },
  { id: 'checkbox', label: 'Checkboxes', icon: '☑️' },
  { id: 'rating', label: 'Rating Scale', icon: '⭐' },
  { id: 'dropdown', label: 'Dropdown', icon: '📋' },
  { id: 'number', label: 'Number', icon: '🔢' },
  { id: 'yes_no', label: 'Yes / No', icon: '👍' },
];

const SAMPLE_SURVEYS = [
  {
    id: 'survey_1',
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve our product by sharing your experience.',
    isQuizMode: false,
    showProgressBar: true,
    allowAnonymous: true,
    shuffleQuestions: false,
    requireAllQuestions: false,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 2,
    status: 'published',
    questions: [
      { id: 'q1', type: 'rating', text: 'How satisfied are you with our product overall?', required: true, ratingMax: 5, options: [], correctAnswer: null, points: 0, conditionalLogic: null },
      { id: 'q2', type: 'multiple_choice', text: 'How did you hear about us?', required: true, ratingMax: 5, options: ['Search Engine', 'Social Media', 'Friend/Colleague', 'Advertisement', 'Other'], correctAnswer: null, points: 0, conditionalLogic: null },
      { id: 'q3', type: 'textarea', text: 'What features do you use most frequently?', required: false, ratingMax: 5, options: [], correctAnswer: null, points: 0, conditionalLogic: null },
      { id: 'q4', type: 'checkbox', text: 'Which areas need improvement?', required: false, ratingMax: 5, options: ['Performance', 'User Interface', 'Documentation', 'Customer Support', 'Pricing'], correctAnswer: null, points: 0, conditionalLogic: null },
      { id: 'q5', type: 'rating', text: 'How likely are you to recommend us to a friend?', required: true, ratingMax: 10, options: [], correctAnswer: null, points: 0, conditionalLogic: null },
      { id: 'q6', type: 'text', text: 'Any additional comments or suggestions?', required: false, ratingMax: 5, options: [], correctAnswer: null, points: 0, conditionalLogic: null },
    ],
    responses: [
      { id: 'r1', submittedAt: Date.now() - 86400000 * 5, answers: { q1: 4, q2: 'Search Engine', q3: 'Dashboard and analytics', q4: ['Documentation', 'Pricing'], q5: 8, q6: 'Great product overall!' } },
      { id: 'r2', submittedAt: Date.now() - 86400000 * 4, answers: { q1: 5, q2: 'Friend/Colleague', q3: 'Reporting features', q4: ['Performance'], q5: 9, q6: '' } },
      { id: 'r3', submittedAt: Date.now() - 86400000 * 3, answers: { q1: 3, q2: 'Social Media', q3: '', q4: ['User Interface', 'Customer Support'], q5: 6, q6: 'Needs better mobile support' } },
      { id: 'r4', submittedAt: Date.now() - 86400000 * 1, answers: { q1: 4, q2: 'Advertisement', q3: 'Project management tools', q4: ['Documentation'], q5: 7, q6: '' } },
    ],
  },
  {
    id: 'survey_2',
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of core JavaScript concepts.',
    isQuizMode: true,
    showProgressBar: true,
    allowAnonymous: false,
    shuffleQuestions: false,
    requireAllQuestions: true,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 1,
    status: 'published',
    questions: [
      { id: 'qq1', type: 'multiple_choice', text: 'What keyword declares a block-scoped variable in JavaScript?', required: true, ratingMax: 5, options: ['var', 'let', 'const', 'Both let and const'], correctAnswer: 'Both let and const', points: 10, conditionalLogic: null },
      { id: 'qq2', type: 'yes_no', text: 'Is JavaScript a statically typed language?', required: true, ratingMax: 5, options: [], correctAnswer: 'No', points: 5, conditionalLogic: null },
      { id: 'qq3', type: 'multiple_choice', text: 'Which method converts a JSON string into an object?', required: true, ratingMax: 5, options: ['JSON.stringify()', 'JSON.parse()', 'JSON.toObject()', 'JSON.decode()'], correctAnswer: 'JSON.parse()', points: 10, conditionalLogic: null },
      { id: 'qq4', type: 'dropdown', text: 'What is the output of typeof null?', required: true, ratingMax: 5, options: ['null', 'undefined', 'object', 'number'], correctAnswer: 'object', points: 15, conditionalLogic: null },
      { id: 'qq5', type: 'checkbox', text: 'Which are valid array methods? (Select all that apply)', required: true, ratingMax: 5, options: ['map()', 'filter()', 'reduce()', 'transform()', 'forEach()'], correctAnswer: ['map()', 'filter()', 'reduce()', 'forEach()'], points: 20, conditionalLogic: null },
    ],
    responses: [
      { id: 'qr1', submittedAt: Date.now() - 86400000 * 3, answers: { qq1: 'Both let and const', qq2: 'No', qq3: 'JSON.parse()', qq4: 'object', qq5: ['map()', 'filter()', 'reduce()', 'forEach()'] } },
      { id: 'qr2', submittedAt: Date.now() - 86400000 * 2, answers: { qq1: 'let', qq2: 'No', qq3: 'JSON.parse()', qq4: 'null', qq5: ['map()', 'filter()'] } },
    ],
  },
  {
    id: 'survey_3',
    title: 'Employee Onboarding Feedback',
    description: 'Share your experience with the onboarding process.',
    isQuizMode: false,
    showProgressBar: false,
    allowAnonymous: true,
    shuffleQuestions: false,
    requireAllQuestions: false,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 5,
    status: 'draft',
    questions: [
      { id: 'ob1', type: 'rating', text: 'How would you rate the overall onboarding experience?', required: true, ratingMax: 5, options: [], correctAnswer: null, points: 0, conditionalLogic: null },
      { id: 'ob2', type: 'multiple_choice', text: 'How long was your onboarding process?', required: true, ratingMax: 5, options: ['Less than 1 week', '1-2 weeks', '2-4 weeks', 'More than 4 weeks'], correctAnswer: null, points: 0, conditionalLogic: null },
      { id: 'ob3', type: 'number', text: 'How many training sessions did you attend?', required: false, ratingMax: 5, options: [], correctAnswer: null, points: 0, conditionalLogic: null },
      { id: 'ob4', type: 'textarea', text: 'What could be improved in the onboarding process?', required: false, ratingMax: 5, options: [], correctAnswer: null, points: 0, conditionalLogic: { questionId: 'ob1', operator: 'less_than', value: 4 } },
    ],
    responses: [],
  },
];

export default function SurveyQuizBuilder() {
  const [surveys, setSurveys] = useState(SAMPLE_SURVEYS);
  const [activeView, setActiveView] = useState('list');
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [editingSurveyId, setEditingSurveyId] = useState(null);
  const [previewSurveyId, setPreviewSurveyId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [previewCurrentPage, setPreviewCurrentPage] = useState(0);
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [responseViewSurveyId, setResponseViewSurveyId] = useState(null);
  const [importText, setImportText] = useState('');
  const [notification, setNotification] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('surveyBuilderData');
    if (saved) {
      try { setSurveys(JSON.parse(saved)); } catch (e) { /* ignore */ }
    }
    const theme = localStorage.getItem('surveyBuilderTheme');
    if (theme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('surveyBuilderData', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false);
        setShowImportModal(false);
        setShowDeleteConfirm(null);
        setPreviewSurveyId(null);
        setEditingSurveyId(null);
        setResponseViewSurveyId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('surveyBuilderTheme', next ? 'dark' : 'light');
      return next;
    });
  };

  const filteredSurveys = useMemo(() => {
    let result = surveys;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') result = result.filter(s => s.status === filterStatus);
    if (filterType !== 'all') result = result.filter(s => filterType === 'quiz' ? s.isQuizMode : !s.isQuizMode);
    return [...result].sort((a, b) => {
      if (sortBy === 'updatedAt') return b.updatedAt - a.updatedAt;
      if (sortBy === 'createdAt') return b.createdAt - a.createdAt;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'responses') return (b.responses?.length || 0) - (a.responses?.length || 0);
      return 0;
    });
  }, [surveys, searchQuery, filterStatus, filterType, sortBy]);

  const getSelectedSurvey = () => surveys.find(s => s.id === selectedSurveyId);
  const getEditingSurvey = () => surveys.find(s => s.id === editingSurveyId);
  const getPreviewSurvey = () => surveys.find(s => s.id === previewSurveyId);
  const getResponseViewSurvey = () => surveys.find(s => s.id === responseViewSurveyId);

  const createSurvey = (data) => {
    const newSurvey = {
      id: `survey_${Date.now()}`,
      title: data.title,
      description: data.description || '',
      isQuizMode: data.isQuizMode || false,
      showProgressBar: true,
      allowAnonymous: true,
      shuffleQuestions: false,
      requireAllQuestions: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
      questions: [],
      responses: [],
    };
    setSurveys(prev => [...prev, newSurvey]);
    setShowCreateModal(false);
    setEditingSurveyId(newSurvey.id);
    showNotification(`Survey "${data.title}" created`);
  };

  const updateSurvey = (surveyId, updates) => {
    setSurveys(prev => prev.map(s => s.id === surveyId ? { ...s, ...updates, updatedAt: Date.now() } : s));
  };

  const deleteSurvey = (surveyId) => {
    const survey = surveys.find(s => s.id === surveyId);
    setSurveys(prev => prev.filter(s => s.id !== surveyId));
    setShowDeleteConfirm(null);
    setSelectedSurveyId(null);
    showNotification(`Survey "${survey?.title}" deleted`, 'warning');
  };

  const duplicateSurvey = (surveyId) => {
    const original = surveys.find(s => s.id === surveyId);
    if (!original) return;
    const copy = {
      ...original,
      id: `survey_${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      responses: [],
      questions: original.questions.map(q => ({ ...q, id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` })),
    };
    setSurveys(prev => [...prev, copy]);
    showNotification(`Survey duplicated as "${copy.title}"`);
  };

  const addQuestion = (surveyId, type) => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type,
      text: '',
      required: false,
      ratingMax: 5,
      options: type === 'multiple_choice' || type === 'checkbox' || type === 'dropdown' ? ['Option 1', 'Option 2'] : [],
      correctAnswer: null,
      points: 0,
      conditionalLogic: null,
    };
    setSurveys(prev => prev.map(s => s.id === surveyId ? { ...s, questions: [...s.questions, newQuestion], updatedAt: Date.now() } : s));
    setEditingQuestionId(newQuestion.id);
  };

  const updateQuestion = (surveyId, questionId, updates) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== surveyId) return s;
      return { ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q), updatedAt: Date.now() };
    }));
  };

  const deleteQuestion = (surveyId, questionId) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== surveyId) return s;
      return { ...s, questions: s.questions.filter(q => q.id !== questionId), updatedAt: Date.now() };
    }));
  };

  const reorderQuestions = (surveyId, fromIndex, toIndex) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== surveyId) return s;
      const newQuestions = [...s.questions];
      const [moved] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, moved);
      return { ...s, questions: newQuestions, updatedAt: Date.now() };
    }));
  };

  const addOption = (surveyId, questionId) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== surveyId) return s;
      return {
        ...s,
        questions: s.questions.map(q => {
          if (q.id !== questionId) return q;
          return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
        }),
        updatedAt: Date.now(),
      };
    }));
  };

  const updateOption = (surveyId, questionId, optionIndex, value) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== surveyId) return s;
      return {
        ...s,
        questions: s.questions.map(q => {
          if (q.id !== questionId) return q;
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }),
        updatedAt: Date.now(),
      };
    }));
  };

  const removeOption = (surveyId, questionId, optionIndex) => {
    setSurveys(prev => prev.map(s => {
      if (s.id !== surveyId) return s;
      return {
        ...s,
        questions: s.questions.map(q => {
          if (q.id !== questionId) return q;
          return { ...q, options: q.options.filter((_, i) => i !== optionIndex) };
        }),
        updatedAt: Date.now(),
      };
    }));
  };

  const publishSurvey = (surveyId) => {
    updateSurvey(surveyId, { status: 'published' });
    showNotification('Survey published successfully!');
  };

  const unpublishSurvey = (surveyId) => {
    updateSurvey(surveyId, { status: 'draft' });
    showNotification('Survey unpublished');
  };

  const exportSurvey = (surveyId) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;
    const data = JSON.stringify(survey, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${survey.title.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Survey exported successfully');
  };

  const importSurvey = () => {
    try {
      const imported = JSON.parse(importText);
      const newSurvey = {
        ...imported,
        id: `survey_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'draft',
        responses: [],
      };
      setSurveys(prev => [...prev, newSurvey]);
      setShowImportModal(false);
      setImportText('');
      showNotification(`Survey "${newSurvey.title}" imported`);
    } catch (e) {
      showNotification('Invalid JSON format', 'error');
    }
  };

  const calculateQuizScore = (survey, answers) => {
    if (!survey.isQuizMode) return null;
    let totalPoints = 0;
    let earnedPoints = 0;
    survey.questions.forEach(q => {
      totalPoints += q.points;
      const answer = answers[q.id];
      if (q.type === 'checkbox' && Array.isArray(q.correctAnswer)) {
        const correct = q.correctAnswer;
        const given = Array.isArray(answer) ? answer : [];
        if (correct.length === given.length && correct.every(c => given.includes(c))) {
          earnedPoints += q.points;
        }
      } else if (answer === q.correctAnswer) {
        earnedPoints += q.points;
      }
    });
    return { earned: earnedPoints, total: totalPoints, percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0 };
  };

  const getRatingDistribution = (survey, questionId) => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question || question.type !== 'rating') return [];
    const dist = {};
    for (let i = 1; i <= question.ratingMax; i++) dist[i] = 0;
    survey.responses.forEach(r => {
      const val = r.answers[questionId];
      if (val && dist[val] !== undefined) dist[val]++;
    });
    return Object.entries(dist).map(([rating, count]) => ({ rating: parseInt(rating), count }));
  };

  const getChoiceDistribution = (survey, questionId) => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question || !question.options.length) return [];
    const dist = {};
    question.options.forEach(opt => { dist[opt] = 0; });
    survey.responses.forEach(r => {
      const val = r.answers[questionId];
      if (Array.isArray(val)) {
        val.forEach(v => { if (dist[v] !== undefined) dist[v]++; });
      } else if (val && dist[val] !== undefined) {
        dist[val]++;
      }
    });
    return Object.entries(dist).map(([option, count]) => ({ option, count }));
  };

  const getAverageRating = (survey, questionId) => {
    const ratings = survey.responses.map(r => r.answers[questionId]).filter(v => typeof v === 'number');
    if (ratings.length === 0) return 0;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  };

  const shouldShowQuestion = (survey, question, answers) => {
    if (!question.conditionalLogic) return true;
    const { questionId, operator, value } = question.conditionalLogic;
    const condAnswer = answers[questionId];
    if (condAnswer === undefined || condAnswer === null) return false;
    if (operator === 'equals') return condAnswer === value;
    if (operator === 'not_equals') return condAnswer !== value;
    if (operator === 'less_than') return condAnswer < value;
    if (operator === 'greater_than') return condAnswer > value;
    return true;
  };

  const handlePreviewSubmit = () => {
    const survey = getPreviewSurvey();
    if (!survey) return;
    const newResponse = {
      id: `r_${Date.now()}`,
      submittedAt: Date.now(),
      answers: { ...previewAnswers },
    };
    updateSurvey(survey.id, { responses: [...survey.responses, newResponse] });
    setPreviewSubmitted(true);
    showNotification('Response submitted!');
  };

  const resetPreview = () => {
    setPreviewAnswers({});
    setPreviewCurrentPage(0);
    setPreviewSubmitted(false);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const bgColor = isDarkMode ? '#1a1a2e' : '#f8f9fa';
  const cardBg = isDarkMode ? '#16213e' : '#ffffff';
  const textColor = isDarkMode ? '#e0e0e0' : '#333333';
  const secondaryText = isDarkMode ? '#a0a0a0' : '#666666';
  const borderColor = isDarkMode ? '#2a2a4a' : '#e0e0e0';
  const accentColor = '#6366f1';
  const successColor = '#22c55e';
  const warningColor = '#f59e0b';
  const dangerColor = '#ef4444';

  const editingSurvey = getEditingSurvey();
  const previewSurvey = getPreviewSurvey();
  const responseViewSurvey = getResponseViewSurvey();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '8px', backgroundColor: notification.type === 'error' ? dangerColor : notification.type === 'warning' ? warningColor : successColor, color: '#fff', fontSize: '14px', fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease' }} data-testid="notification">
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: accentColor }}>📊 SurveyForge</h1>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'list', label: 'My Surveys', icon: '📋' },
              { id: 'templates', label: 'Templates', icon: '📄' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveView(tab.id); setEditingSurveyId(null); setPreviewSurveyId(null); setResponseViewSurveyId(null); }}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeView === tab.id ? 600 : 400,
                  backgroundColor: activeView === tab.id ? (isDarkMode ? '#2a2a4a' : '#eef2ff') : 'transparent',
                  color: activeView === tab.id ? accentColor : textColor,
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setShowCreateModal(true)} style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            + New Survey
          </button>
          <button onClick={() => setShowImportModal(true)} style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
            📥 Import
          </button>
          <button onClick={toggleTheme} style={{ padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '18px' }} aria-label="Toggle theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Survey List View */}
        {activeView === 'list' && !editingSurveyId && !previewSurveyId && !responseViewSurveyId && (
          <div>
            {/* Search and Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search surveys... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: cardBg, color: textColor, outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status" style={{ padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: cardBg, color: textColor, cursor: 'pointer' }}>
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} aria-label="Filter by type" style={{ padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: cardBg, color: textColor, cursor: 'pointer' }}>
                <option value="all">All Types</option>
                <option value="survey">Surveys</option>
                <option value="quiz">Quizzes</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort by" style={{ padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: cardBg, color: textColor, cursor: 'pointer' }}>
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Created</option>
                <option value="title">Title</option>
                <option value="responses">Responses</option>
              </select>
            </div>

            {/* Survey Cards */}
            {filteredSurveys.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <p style={{ fontSize: '16px', margin: 0 }}>No surveys found</p>
                <p style={{ fontSize: '13px', margin: '8px 0 0' }}>Create a new survey or adjust your filters.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                {filteredSurveys.map(survey => (
                  <div key={survey.id} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: survey.status === 'published' ? '#dcfce7' : '#fef3c7', color: survey.status === 'published' ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                            {survey.status === 'published' ? '● Published' : '○ Draft'}
                          </span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6', color: secondaryText }}>
                            {survey.isQuizMode ? '🎯 Quiz' : '📊 Survey'}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '4px 0' }}>{survey.title}</h3>
                        <p style={{ fontSize: '13px', color: secondaryText, margin: 0, lineHeight: 1.4 }}>{survey.description}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: secondaryText }}>
                      <span>📝 {survey.questions.length} questions</span>
                      <span>📩 {survey.responses.length} responses</span>
                      <span>Updated {formatRelativeTime(survey.updatedAt)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <button onClick={() => setEditingSurveyId(survey.id)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}>✏️ Edit</button>
                      <button onClick={() => { setPreviewSurveyId(survey.id); resetPreview(); }} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}>👁️ Preview</button>
                      <button onClick={() => setResponseViewSurveyId(survey.id)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}>📊 Results</button>
                      <button onClick={() => duplicateSurvey(survey.id)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}>📋 Duplicate</button>
                      <button onClick={() => exportSurvey(survey.id)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}>📥 Export</button>
                      <button onClick={() => setShowDeleteConfirm(survey.id)} style={{ padding: '6px 12px', border: `1px solid #fecaca`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: '#fef2f2', color: dangerColor }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Survey Editor */}
        {editingSurvey && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setEditingSurveyId(null)} style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>← Back</button>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Editing: {editingSurvey.title}</h2>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: editingSurvey.status === 'published' ? '#dcfce7' : '#fef3c7', color: editingSurvey.status === 'published' ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                  {editingSurvey.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setPreviewSurveyId(editingSurvey.id); resetPreview(); }} style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>👁️ Preview</button>
                {editingSurvey.status === 'draft' ? (
                  <button onClick={() => publishSurvey(editingSurvey.id)} style={{ padding: '8px 14px', backgroundColor: successColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Publish</button>
                ) : (
                  <button onClick={() => unpublishSurvey(editingSurvey.id)} style={{ padding: '8px 14px', backgroundColor: warningColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Unpublish</button>
                )}
              </div>
            </div>

            {/* Survey Settings */}
            <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Survey Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Title</label>
                  <input value={editingSurvey.title} onChange={(e) => updateSurvey(editingSurvey.id, { title: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Description</label>
                  <input value={editingSurvey.description} onChange={(e) => updateSurvey(editingSurvey.id, { description: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingSurvey.isQuizMode} onChange={(e) => updateSurvey(editingSurvey.id, { isQuizMode: e.target.checked })} /> Quiz Mode
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingSurvey.showProgressBar} onChange={(e) => updateSurvey(editingSurvey.id, { showProgressBar: e.target.checked })} /> Show Progress Bar
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingSurvey.allowAnonymous} onChange={(e) => updateSurvey(editingSurvey.id, { allowAnonymous: e.target.checked })} /> Allow Anonymous
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingSurvey.shuffleQuestions} onChange={(e) => updateSurvey(editingSurvey.id, { shuffleQuestions: e.target.checked })} /> Shuffle Questions
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingSurvey.requireAllQuestions} onChange={(e) => updateSurvey(editingSurvey.id, { requireAllQuestions: e.target.checked })} /> Require All
                </label>
              </div>
            </div>

            {/* Questions List */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Questions ({editingSurvey.questions.length})</h3>
              </div>

              {editingSurvey.questions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: cardBg, borderRadius: '12px', border: `2px dashed ${borderColor}`, color: secondaryText }}>
                  <p style={{ fontSize: '14px', margin: '0 0 8px' }}>No questions yet</p>
                  <p style={{ fontSize: '12px', margin: 0 }}>Add your first question below.</p>
                </div>
              )}

              {editingSurvey.questions.map((question, index) => (
                <div
                  key={question.id}
                  draggable
                  onDragStart={() => setDraggedQuestionId(question.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedQuestionId && draggedQuestionId !== question.id) {
                      const fromIndex = editingSurvey.questions.findIndex(q => q.id === draggedQuestionId);
                      reorderQuestions(editingSurvey.id, fromIndex, index);
                    }
                    setDraggedQuestionId(null);
                  }}
                  style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '16px', marginBottom: '12px', cursor: 'grab' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editingQuestionId === question.id ? '12px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ cursor: 'grab', fontSize: '14px', color: secondaryText }}>⋮⋮</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: accentColor }}>Q{index + 1}</span>
                      <span style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6', color: secondaryText }}>
                        {QUESTION_TYPES.find(t => t.id === question.type)?.icon} {QUESTION_TYPES.find(t => t.id === question.type)?.label}
                      </span>
                      {question.required && <span style={{ fontSize: '10px', color: dangerColor, fontWeight: 600 }}>REQUIRED</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setEditingQuestionId(editingQuestionId === question.id ? null : question.id)} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: textColor }}>
                        {editingQuestionId === question.id ? 'Collapse' : 'Edit'}
                      </button>
                      <button onClick={() => deleteQuestion(editingSurvey.id, question.id)} style={{ padding: '4px 8px', border: `1px solid #fecaca`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: '#fef2f2', color: dangerColor }}>Delete</button>
                    </div>
                  </div>

                  {editingQuestionId !== question.id && (
                    <div style={{ fontSize: '14px', marginTop: '8px', color: question.text ? textColor : secondaryText }}>
                      {question.text || 'Untitled question'}
                    </div>
                  )}

                  {editingQuestionId === question.id && (
                    <div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Question Text</label>
                        <input
                          value={question.text}
                          onChange={(e) => updateQuestion(editingSurvey.id, question.id, { text: e.target.value })}
                          placeholder="Enter your question..."
                          style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                          <input type="checkbox" checked={question.required} onChange={(e) => updateQuestion(editingSurvey.id, question.id, { required: e.target.checked })} /> Required
                        </label>
                        {question.type === 'rating' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <label>Max Rating:</label>
                            <input type="number" min={2} max={10} value={question.ratingMax} onChange={(e) => updateQuestion(editingSurvey.id, question.id, { ratingMax: parseInt(e.target.value) || 5 })} style={{ width: '50px', padding: '4px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', color: textColor }} />
                          </div>
                        )}
                        {editingSurvey.isQuizMode && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <label>Points:</label>
                            <input type="number" min={0} value={question.points} onChange={(e) => updateQuestion(editingSurvey.id, question.id, { points: parseInt(e.target.value) || 0 })} style={{ width: '50px', padding: '4px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', color: textColor }} />
                          </div>
                        )}
                      </div>

                      {/* Options for choice-based questions */}
                      {(question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'dropdown') && (
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '6px' }}>Options</label>
                          {question.options.map((opt, optIdx) => (
                            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <input
                                value={opt}
                                onChange={(e) => updateOption(editingSurvey.id, question.id, optIdx, e.target.value)}
                                style={{ flex: 1, padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
                              />
                              {editingSurvey.isQuizMode && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: secondaryText, whiteSpace: 'nowrap' }}>
                                  <input
                                    type={question.type === 'checkbox' ? 'checkbox' : 'radio'}
                                    name={`correct_${question.id}`}
                                    checked={question.type === 'checkbox' ? (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(opt)) : question.correctAnswer === opt}
                                    onChange={() => {
                                      if (question.type === 'checkbox') {
                                        const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                                        const updated = current.includes(opt) ? current.filter(c => c !== opt) : [...current, opt];
                                        updateQuestion(editingSurvey.id, question.id, { correctAnswer: updated });
                                      } else {
                                        updateQuestion(editingSurvey.id, question.id, { correctAnswer: opt });
                                      }
                                    }}
                                  /> Correct
                                </label>
                              )}
                              <button onClick={() => removeOption(editingSurvey.id, question.id, optIdx)} style={{ padding: '4px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: dangerColor }}>×</button>
                            </div>
                          ))}
                          <button onClick={() => addOption(editingSurvey.id, question.id)} style={{ padding: '4px 10px', border: `1px dashed ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: accentColor }}>+ Add Option</button>
                        </div>
                      )}

                      {/* Correct answer for yes_no type */}
                      {editingSurvey.isQuizMode && question.type === 'yes_no' && (
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Correct Answer</label>
                          <select
                            value={question.correctAnswer || ''}
                            onChange={(e) => updateQuestion(editingSurvey.id, question.id, { correctAnswer: e.target.value })}
                            style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
                          >
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Question Buttons */}
            <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: secondaryText }}>Add Question</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {QUESTION_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => addQuestion(editingSurvey.id, type.id)}
                    style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Survey Preview */}
        {previewSurvey && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button onClick={() => { setPreviewSurveyId(null); resetPreview(); }} style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>← Back</button>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Preview: {previewSurvey.title}</h2>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              {!previewSubmitted ? (
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{previewSurvey.title}</h3>
                  <p style={{ fontSize: '14px', color: secondaryText, marginBottom: '20px' }}>{previewSurvey.description}</p>

                  {previewSurvey.showProgressBar && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>
                        <span>Progress</span>
                        <span>{Object.keys(previewAnswers).length}/{previewSurvey.questions.length}</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(Object.keys(previewAnswers).length / previewSurvey.questions.length) * 100}%`, height: '100%', backgroundColor: accentColor, borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )}

                  {previewSurvey.questions.map((question, index) => {
                    if (!shouldShowQuestion(previewSurvey, question, previewAnswers)) return null;
                    return (
                      <div key={question.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: index < previewSurvey.questions.length - 1 ? `1px solid ${borderColor}` : 'none' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                          {question.text || `Question ${index + 1}`}
                          {question.required && <span style={{ color: dangerColor, marginLeft: '4px' }}>*</span>}
                        </label>

                        {question.type === 'text' && (
                          <input type="text" value={previewAnswers[question.id] || ''} onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [question.id]: e.target.value }))} placeholder="Your answer..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                        )}

                        {question.type === 'textarea' && (
                          <textarea value={previewAnswers[question.id] || ''} onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [question.id]: e.target.value }))} placeholder="Your answer..." rows={3} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
                        )}

                        {question.type === 'number' && (
                          <input type="number" value={previewAnswers[question.id] || ''} onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [question.id]: parseInt(e.target.value) || 0 }))} style={{ width: '150px', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }} />
                        )}

                        {question.type === 'multiple_choice' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {question.options.map((opt) => (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: `1px solid ${previewAnswers[question.id] === opt ? accentColor : borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '14px', backgroundColor: previewAnswers[question.id] === opt ? (isDarkMode ? '#1e2a4a' : '#eef2ff') : 'transparent' }}>
                                <input type="radio" name={question.id} value={opt} checked={previewAnswers[question.id] === opt} onChange={() => setPreviewAnswers(prev => ({ ...prev, [question.id]: opt }))} />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'checkbox' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {question.options.map((opt) => {
                              const checked = Array.isArray(previewAnswers[question.id]) && previewAnswers[question.id].includes(opt);
                              return (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: `1px solid ${checked ? accentColor : borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '14px', backgroundColor: checked ? (isDarkMode ? '#1e2a4a' : '#eef2ff') : 'transparent' }}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      const current = Array.isArray(previewAnswers[question.id]) ? previewAnswers[question.id] : [];
                                      const updated = checked ? current.filter(c => c !== opt) : [...current, opt];
                                      setPreviewAnswers(prev => ({ ...prev, [question.id]: updated }));
                                    }}
                                  />
                                  {opt}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {question.type === 'dropdown' && (
                          <select value={previewAnswers[question.id] || ''} onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [question.id]: e.target.value }))} style={{ padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, minWidth: '200px' }}>
                            <option value="">Select an option...</option>
                            {question.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        )}

                        {question.type === 'rating' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {Array.from({ length: question.ratingMax }, (_, i) => i + 1).map(val => (
                              <button
                                key={val}
                                onClick={() => setPreviewAnswers(prev => ({ ...prev, [question.id]: val }))}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  border: `1px solid ${previewAnswers[question.id] === val ? accentColor : borderColor}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: previewAnswers[question.id] === val ? 700 : 400,
                                  backgroundColor: previewAnswers[question.id] === val ? accentColor : 'transparent',
                                  color: previewAnswers[question.id] === val ? '#fff' : textColor,
                                }}
                                aria-label={`Rate ${val}`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        )}

                        {question.type === 'yes_no' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            {['Yes', 'No'].map(opt => (
                              <button
                                key={opt}
                                onClick={() => setPreviewAnswers(prev => ({ ...prev, [question.id]: opt }))}
                                style={{
                                  padding: '10px 24px',
                                  border: `1px solid ${previewAnswers[question.id] === opt ? accentColor : borderColor}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: previewAnswers[question.id] === opt ? 600 : 400,
                                  backgroundColor: previewAnswers[question.id] === opt ? accentColor : 'transparent',
                                  color: previewAnswers[question.id] === opt ? '#fff' : textColor,
                                }}
                              >
                                {opt === 'Yes' ? '👍' : '👎'} {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    onClick={handlePreviewSubmit}
                    style={{ padding: '12px 28px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, width: '100%', marginTop: '12px' }}
                  >
                    Submit Response
                  </button>
                </div>
              ) : (
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Response Submitted!</h3>
                  <p style={{ fontSize: '14px', color: secondaryText, marginBottom: '16px' }}>Thank you for completing the {previewSurvey.isQuizMode ? 'quiz' : 'survey'}.</p>

                  {previewSurvey.isQuizMode && (() => {
                    const score = calculateQuizScore(previewSurvey, previewAnswers);
                    return (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: score.percentage >= 70 ? successColor : score.percentage >= 40 ? warningColor : dangerColor }}>
                          {score.percentage}%
                        </div>
                        <p style={{ fontSize: '14px', color: secondaryText }}>
                          Score: {score.earned}/{score.total} points
                        </p>
                      </div>
                    );
                  })()}

                  <button onClick={resetPreview} style={{ padding: '10px 20px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    Take Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Response Analytics View */}
        {responseViewSurvey && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button onClick={() => setResponseViewSurveyId(null)} style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>← Back</button>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Results: {responseViewSurvey.title}</h2>
              <span style={{ fontSize: '13px', color: secondaryText }}>({responseViewSurvey.responses.length} responses)</span>
            </div>

            {responseViewSurvey.responses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, color: secondaryText }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p style={{ fontSize: '16px', margin: 0 }}>No responses yet</p>
              </div>
            ) : (
              <div>
                {/* Summary Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{responseViewSurvey.responses.length}</div>
                    <div style={{ fontSize: '13px', color: secondaryText }}>Total Responses</div>
                  </div>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{responseViewSurvey.questions.length}</div>
                    <div style={{ fontSize: '13px', color: secondaryText }}>Questions</div>
                  </div>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>
                      {responseViewSurvey.responses.length > 0 ? formatDate(responseViewSurvey.responses[responseViewSurvey.responses.length - 1].submittedAt) : 'N/A'}
                    </div>
                    <div style={{ fontSize: '13px', color: secondaryText }}>Latest Response</div>
                  </div>
                </div>

                {/* Per-Question Analytics */}
                {responseViewSurvey.questions.map((question, index) => (
                  <div key={question.id} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                      <span style={{ color: accentColor }}>Q{index + 1}.</span> {question.text}
                    </h4>

                    {question.type === 'rating' && (
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: accentColor }}>
                          {getAverageRating(responseViewSurvey, question.id)} <span style={{ fontSize: '14px', fontWeight: 400, color: secondaryText }}>/ {question.ratingMax} avg</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                          {getRatingDistribution(responseViewSurvey, question.id).map(({ rating, count }) => (
                            <div key={rating} style={{ textAlign: 'center', flex: 1 }}>
                              <div style={{ height: `${(count / responseViewSurvey.responses.length) * 60 + 4}px`, backgroundColor: accentColor, borderRadius: '4px 4px 0 0', minHeight: '4px', opacity: count > 0 ? 1 : 0.2 }} />
                              <div style={{ fontSize: '11px', marginTop: '4px', color: secondaryText }}>{rating}</div>
                              <div style={{ fontSize: '10px', color: secondaryText }}>{count}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'dropdown') && (
                      <div>
                        {getChoiceDistribution(responseViewSurvey, question.id).map(({ option, count }) => (
                          <div key={option} style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px' }}>
                              <span>{option}</span>
                              <span style={{ color: secondaryText }}>{count} ({responseViewSurvey.responses.length > 0 ? Math.round((count / responseViewSurvey.responses.length) * 100) : 0}%)</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${responseViewSurvey.responses.length > 0 ? (count / responseViewSurvey.responses.length) * 100 : 0}%`, height: '100%', backgroundColor: accentColor, borderRadius: '3px' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(question.type === 'text' || question.type === 'textarea') && (
                      <div>
                        {responseViewSurvey.responses.map(r => {
                          const answer = r.answers[question.id];
                          if (!answer) return null;
                          return (
                            <div key={r.id} style={{ padding: '8px 12px', marginBottom: '6px', borderRadius: '6px', backgroundColor: isDarkMode ? '#1e2a4a' : '#f9fafb', fontSize: '13px' }}>
                              "{answer}"
                              <span style={{ fontSize: '11px', color: secondaryText, marginLeft: '8px' }}>{formatRelativeTime(r.submittedAt)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === 'number' && (() => {
                      const values = responseViewSurvey.responses.map(r => r.answers[question.id]).filter(v => typeof v === 'number');
                      if (values.length === 0) return <div style={{ fontSize: '13px', color: secondaryText }}>No responses</div>;
                      return (
                        <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                          <div><span style={{ color: secondaryText }}>Average:</span> <strong>{(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}</strong></div>
                          <div><span style={{ color: secondaryText }}>Min:</span> <strong>{Math.min(...values)}</strong></div>
                          <div><span style={{ color: secondaryText }}>Max:</span> <strong>{Math.max(...values)}</strong></div>
                        </div>
                      );
                    })()}

                    {question.type === 'yes_no' && (
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {['Yes', 'No'].map(opt => {
                          const count = responseViewSurvey.responses.filter(r => r.answers[question.id] === opt).length;
                          return (
                            <div key={opt} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '8px', backgroundColor: isDarkMode ? '#1e2a4a' : '#f9fafb' }}>
                              <div style={{ fontSize: '20px', fontWeight: 700 }}>{count}</div>
                              <div style={{ fontSize: '12px', color: secondaryText }}>{opt} ({responseViewSurvey.responses.length > 0 ? Math.round((count / responseViewSurvey.responses.length) * 100) : 0}%)</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* Response Table */}
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden', marginTop: '24px' }}>
                  <h4 style={{ padding: '16px 20px', margin: 0, fontSize: '14px', fontWeight: 600, borderBottom: `1px solid ${borderColor}` }}>Individual Responses</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <th style={{ padding: '10px 16px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Submitted</th>
                          {responseViewSurvey.questions.map((q, i) => (
                            <th key={q.id} style={{ padding: '10px 16px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Q{i + 1}</th>
                          ))}
                          {responseViewSurvey.isQuizMode && <th style={{ padding: '10px 16px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Score</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {responseViewSurvey.responses.map(response => {
                          const score = responseViewSurvey.isQuizMode ? calculateQuizScore(responseViewSurvey, response.answers) : null;
                          return (
                            <tr key={response.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                              <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>{formatDate(response.submittedAt)}</td>
                              {responseViewSurvey.questions.map(q => (
                                <td key={q.id} style={{ padding: '10px 16px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {Array.isArray(response.answers[q.id]) ? response.answers[q.id].join(', ') : String(response.answers[q.id] ?? '')}
                                </td>
                              ))}
                              {score && <td style={{ padding: '10px 16px', fontWeight: 600, color: score.percentage >= 70 ? successColor : dangerColor }}>{score.percentage}%</td>}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates View */}
        {activeView === 'templates' && !editingSurveyId && !previewSurveyId && !responseViewSurveyId && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Survey Templates</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {[
                { title: 'Customer Feedback', description: 'Gather feedback about your product or service', icon: '💬', questions: 6 },
                { title: 'Employee Engagement', description: 'Measure team satisfaction and engagement levels', icon: '👥', questions: 8 },
                { title: 'Event Evaluation', description: 'Evaluate the success of events and conferences', icon: '🎪', questions: 5 },
                { title: 'Course Assessment', description: 'Quiz template for educational assessments', icon: '🎓', questions: 10 },
                { title: 'Market Research', description: 'Understand your target market preferences', icon: '🔬', questions: 7 },
                { title: 'Website Usability', description: 'Test the usability of your website or app', icon: '🌐', questions: 6 },
              ].map(template => (
                <div key={template.title} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{template.icon}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{template.title}</h3>
                  <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '12px' }}>{template.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: secondaryText }}>{template.questions} questions</span>
                    <button style={{ padding: '6px 14px', border: `1px solid ${accentColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: accentColor }}>Use Template</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Overview */}
        {activeView === 'analytics' && !editingSurveyId && !previewSurveyId && !responseViewSurveyId && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Analytics Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{surveys.length}</div>
                <div style={{ fontSize: '13px', color: secondaryText }}>Total Surveys</div>
              </div>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: successColor }}>{surveys.filter(s => s.status === 'published').length}</div>
                <div style={{ fontSize: '13px', color: secondaryText }}>Published</div>
              </div>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{surveys.reduce((sum, s) => sum + s.responses.length, 0)}</div>
                <div style={{ fontSize: '13px', color: secondaryText }}>Total Responses</div>
              </div>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{surveys.reduce((sum, s) => sum + s.questions.length, 0)}</div>
                <div style={{ fontSize: '13px', color: secondaryText }}>Total Questions</div>
              </div>
            </div>

            <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
              <h3 style={{ padding: '16px 20px', margin: 0, fontSize: '14px', fontWeight: 600, borderBottom: `1px solid ${borderColor}` }}>Survey Performance</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Survey</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Questions</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Responses</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map(survey => (
                    <tr key={survey.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500 }}>{survey.title}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: survey.status === 'published' ? '#dcfce7' : '#fef3c7', color: survey.status === 'published' ? '#16a34a' : '#d97706' }}>
                          {survey.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px' }}>{survey.questions.length}</td>
                      <td style={{ padding: '10px 16px' }}>{survey.responses.length}</td>
                      <td style={{ padding: '10px 16px', color: secondaryText }}>{formatDate(survey.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create Survey Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowCreateModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Create New Survey</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              createSurvey({ title: formData.get('title'), description: formData.get('description'), isQuizMode: formData.get('isQuizMode') === 'on' });
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Title *</label>
                <input name="title" required placeholder="My Survey" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Description</label>
                <textarea name="description" rows={2} placeholder="Describe your survey..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" name="isQuizMode" /> Enable Quiz Mode (with scoring)
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Create Survey</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowImportModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Import Survey</h2>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '12px' }}>Paste a JSON export of a survey below.</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"title": "My Survey", ...}'
              rows={8}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => setShowImportModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
              <button onClick={importSurvey} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowDeleteConfirm(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Delete Survey?</h3>
            <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '20px' }}>This action cannot be undone. All responses will be permanently deleted.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '8px 20px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
              <button onClick={() => deleteSurvey(showDeleteConfirm)} style={{ padding: '8px 20px', backgroundColor: dangerColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
