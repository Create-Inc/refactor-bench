import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

const SURVEY_CATEGORIES = ['Product', 'Customer Service', 'Pricing', 'Usability', 'Features'];

const RESPONSE_TYPES = ['single_choice', 'multiple_choice', 'rating', 'nps', 'open_text'];

const DATE_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 },
  { label: 'All time', days: null },
];

const INITIAL_SURVEYS = [
  {
    id: 's1',
    title: 'Q1 Product Satisfaction',
    category: 'Product',
    createdAt: Date.now() - 86400000 * 60,
    status: 'active',
    totalResponses: 342,
    questions: [
      { id: 'q1', text: 'How satisfied are you with our product?', type: 'rating', options: null },
      { id: 'q2', text: 'Which features do you use most?', type: 'multiple_choice', options: ['Dashboard', 'Reports', 'Automation', 'Integrations', 'API'] },
      { id: 'q3', text: 'Would you recommend us?', type: 'nps', options: null },
      { id: 'q4', text: 'What improvements would you suggest?', type: 'open_text', options: null },
    ],
  },
  {
    id: 's2',
    title: 'Customer Support Feedback',
    category: 'Customer Service',
    createdAt: Date.now() - 86400000 * 45,
    status: 'active',
    totalResponses: 187,
    questions: [
      { id: 'q5', text: 'How would you rate our support?', type: 'rating', options: null },
      { id: 'q6', text: 'How was your issue resolved?', type: 'single_choice', options: ['Fully resolved', 'Partially resolved', 'Not resolved', 'Still pending'] },
      { id: 'q7', text: 'Support channel preference?', type: 'single_choice', options: ['Live Chat', 'Email', 'Phone', 'Knowledge Base'] },
    ],
  },
  {
    id: 's3',
    title: 'Pricing Survey 2024',
    category: 'Pricing',
    createdAt: Date.now() - 86400000 * 30,
    status: 'closed',
    totalResponses: 523,
    questions: [
      { id: 'q8', text: 'Is our pricing fair?', type: 'rating', options: null },
      { id: 'q9', text: 'Which plan are you on?', type: 'single_choice', options: ['Free', 'Starter', 'Professional', 'Enterprise'] },
      { id: 'q10', text: 'Would you pay more for premium features?', type: 'single_choice', options: ['Definitely', 'Maybe', 'Unlikely', 'No'] },
    ],
  },
  {
    id: 's4',
    title: 'UX Research Study',
    category: 'Usability',
    createdAt: Date.now() - 86400000 * 15,
    status: 'active',
    totalResponses: 98,
    questions: [
      { id: 'q11', text: 'How easy is our product to use?', type: 'rating', options: null },
      { id: 'q12', text: 'Which areas need improvement?', type: 'multiple_choice', options: ['Navigation', 'Search', 'Onboarding', 'Settings', 'Mobile'] },
      { id: 'q13', text: 'How often do you use our product?', type: 'single_choice', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
    ],
  },
  {
    id: 's5',
    title: 'Feature Request Priorities',
    category: 'Features',
    createdAt: Date.now() - 86400000 * 5,
    status: 'draft',
    totalResponses: 0,
    questions: [
      { id: 'q14', text: 'Which feature matters most?', type: 'single_choice', options: ['AI Assistant', 'Advanced Analytics', 'Team Collaboration', 'Custom Workflows'] },
      { id: 'q15', text: 'Rate feature quality overall', type: 'rating', options: null },
    ],
  },
];

function generateResponses(surveys) {
  const responses = [];
  const now = Date.now();
  surveys.forEach((survey) => {
    for (let i = 0; i < survey.totalResponses; i++) {
      const responseDate = survey.createdAt + Math.random() * (now - survey.createdAt);
      const answers = {};
      survey.questions.forEach((q) => {
        if (q.type === 'rating') {
          answers[q.id] = Math.floor(Math.random() * 5) + 1;
        } else if (q.type === 'nps') {
          answers[q.id] = Math.floor(Math.random() * 11);
        } else if (q.type === 'single_choice' && q.options) {
          answers[q.id] = q.options[Math.floor(Math.random() * q.options.length)];
        } else if (q.type === 'multiple_choice' && q.options) {
          const count = Math.floor(Math.random() * q.options.length) + 1;
          const shuffled = [...q.options].sort(() => Math.random() - 0.5);
          answers[q.id] = shuffled.slice(0, count);
        } else if (q.type === 'open_text') {
          answers[q.id] = 'Sample response text';
        }
      });
      responses.push({
        id: `r${survey.id}_${i}`,
        surveyId: survey.id,
        timestamp: responseDate,
        answers,
        demographic: {
          region: ['North America', 'Europe', 'Asia', 'South America', 'Africa'][Math.floor(Math.random() * 5)],
          ageGroup: ['18-24', '25-34', '35-44', '45-54', '55+'][Math.floor(Math.random() * 5)],
          userType: ['Free', 'Paid'][Math.floor(Math.random() * 2)],
        },
      });
    }
  });
  return responses;
}

const STATUS_COLORS = {
  active: '#22c55e',
  closed: '#6b7280',
  draft: '#f59e0b',
};

export default function SurveyAnalyticsDashboard() {
  const [surveys] = useState(INITIAL_SURVEYS);
  const [responses, setResponses] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [dateRange, setDateRange] = useState(DATE_RANGES[1]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [showTooltip, setShowTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('surveyDashboardTheme') || 'light';
    }
    return 'light';
  });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedSurveys, setComparedSurveys] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [demographicBreakdown, setDemographicBreakdown] = useState('region');
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const generated = generateResponses(surveys);
    setResponses(generated);
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('surveyDashboardTheme', theme);
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
  }, [theme]);

  const filteredSurveys = useMemo(() => {
    let result = [...surveys];
    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = a.createdAt - b.createdAt;
      else if (sortBy === 'responses') cmp = a.totalResponses - b.totalResponses;
      else if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      return sortOrder === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [surveys, categoryFilter, statusFilter, searchQuery, sortBy, sortOrder]);

  const filteredResponses = useMemo(() => {
    if (!dateRange.days) return responses;
    const cutoff = Date.now() - dateRange.days * 86400000;
    return responses.filter((r) => r.timestamp >= cutoff);
  }, [responses, dateRange]);

  const surveyResponses = useMemo(() => {
    if (!selectedSurvey) return [];
    return filteredResponses.filter((r) => r.surveyId === selectedSurvey.id);
  }, [filteredResponses, selectedSurvey]);

  const overviewMetrics = useMemo(() => {
    const totalSurveys = filteredSurveys.length;
    const totalResponses = filteredResponses.length;
    const activeSurveys = filteredSurveys.filter((s) => s.status === 'active').length;
    const avgResponseRate =
      totalSurveys > 0 ? Math.round(totalResponses / totalSurveys) : 0;

    const ratingResponses = filteredResponses.filter((r) => {
      const survey = surveys.find((s) => s.id === r.surveyId);
      return survey?.questions.some((q) => q.type === 'rating');
    });
    let avgRating = 0;
    if (ratingResponses.length > 0) {
      let sum = 0;
      let count = 0;
      ratingResponses.forEach((r) => {
        const survey = surveys.find((s) => s.id === r.surveyId);
        survey?.questions.forEach((q) => {
          if (q.type === 'rating' && r.answers[q.id] !== undefined) {
            sum += r.answers[q.id];
            count++;
          }
        });
      });
      avgRating = count > 0 ? (sum / count).toFixed(1) : 0;
    }

    const npsResponses = filteredResponses.filter((r) => {
      const survey = surveys.find((s) => s.id === r.surveyId);
      return survey?.questions.some((q) => q.type === 'nps');
    });
    let npsScore = 0;
    if (npsResponses.length > 0) {
      let promoters = 0;
      let detractors = 0;
      let total = 0;
      npsResponses.forEach((r) => {
        const survey = surveys.find((s) => s.id === r.surveyId);
        survey?.questions.forEach((q) => {
          if (q.type === 'nps' && r.answers[q.id] !== undefined) {
            const score = r.answers[q.id];
            if (score >= 9) promoters++;
            else if (score <= 6) detractors++;
            total++;
          }
        });
      });
      npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
    }

    return { totalSurveys, totalResponses, activeSurveys, avgResponseRate, avgRating, npsScore };
  }, [filteredSurveys, filteredResponses, surveys]);

  const responseTimeline = useMemo(() => {
    const timeline = {};
    const relevantResponses = selectedSurvey
      ? surveyResponses
      : filteredResponses;
    relevantResponses.forEach((r) => {
      const date = new Date(r.timestamp).toLocaleDateString();
      timeline[date] = (timeline[date] || 0) + 1;
    });
    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);
  }, [filteredResponses, surveyResponses, selectedSurvey]);

  const questionAnalytics = useMemo(() => {
    if (!selectedSurvey || !selectedQuestion) return null;
    const question = selectedSurvey.questions.find((q) => q.id === selectedQuestion);
    if (!question) return null;

    const answers = surveyResponses
      .map((r) => r.answers[question.id])
      .filter((a) => a !== undefined);

    if (question.type === 'rating') {
      const distribution = [0, 0, 0, 0, 0];
      answers.forEach((a) => {
        if (a >= 1 && a <= 5) distribution[a - 1]++;
      });
      const avg = answers.length > 0 ? answers.reduce((s, v) => s + v, 0) / answers.length : 0;
      return {
        type: 'rating',
        distribution: distribution.map((count, i) => ({ label: `${i + 1} Star`, count })),
        average: avg.toFixed(1),
        total: answers.length,
      };
    }

    if (question.type === 'nps') {
      const groups = { promoters: 0, passives: 0, detractors: 0 };
      answers.forEach((a) => {
        if (a >= 9) groups.promoters++;
        else if (a >= 7) groups.passives++;
        else groups.detractors++;
      });
      const nps =
        answers.length > 0
          ? Math.round(((groups.promoters - groups.detractors) / answers.length) * 100)
          : 0;
      return {
        type: 'nps',
        groups,
        npsScore: nps,
        total: answers.length,
      };
    }

    if (question.type === 'single_choice') {
      const counts = {};
      answers.forEach((a) => {
        counts[a] = (counts[a] || 0) + 1;
      });
      return {
        type: 'single_choice',
        distribution: Object.entries(counts).map(([label, count]) => ({ label, count })),
        total: answers.length,
      };
    }

    if (question.type === 'multiple_choice') {
      const counts = {};
      answers.forEach((arr) => {
        if (Array.isArray(arr)) {
          arr.forEach((a) => {
            counts[a] = (counts[a] || 0) + 1;
          });
        }
      });
      return {
        type: 'multiple_choice',
        distribution: Object.entries(counts).map(([label, count]) => ({ label, count })),
        total: answers.length,
      };
    }

    return { type: 'open_text', total: answers.length };
  }, [selectedSurvey, selectedQuestion, surveyResponses]);

  const demographicData = useMemo(() => {
    const relevantResponses = selectedSurvey ? surveyResponses : filteredResponses;
    const groups = {};
    relevantResponses.forEach((r) => {
      const key = r.demographic[demographicBreakdown];
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredResponses, surveyResponses, selectedSurvey, demographicBreakdown]);

  const comparisonData = useMemo(() => {
    if (!comparisonMode || comparedSurveys.length < 2) return null;
    return comparedSurveys.map((surveyId) => {
      const survey = surveys.find((s) => s.id === surveyId);
      const sResponses = filteredResponses.filter((r) => r.surveyId === surveyId);
      let avgRating = 0;
      let ratingCount = 0;
      sResponses.forEach((r) => {
        survey?.questions.forEach((q) => {
          if (q.type === 'rating' && r.answers[q.id] !== undefined) {
            avgRating += r.answers[q.id];
            ratingCount++;
          }
        });
      });
      return {
        id: surveyId,
        title: survey?.title || 'Unknown',
        responseCount: sResponses.length,
        avgRating: ratingCount > 0 ? (avgRating / ratingCount).toFixed(1) : 'N/A',
      };
    });
  }, [comparisonMode, comparedSurveys, surveys, filteredResponses]);

  const toggleComparedSurvey = useCallback(
    (surveyId) => {
      setComparedSurveys((prev) =>
        prev.includes(surveyId)
          ? prev.filter((id) => id !== surveyId)
          : prev.length < 4
            ? [...prev, surveyId]
            : prev
      );
    },
    []
  );

  const handleExport = useCallback(() => {
    const data = selectedSurvey ? surveyResponses : filteredResponses;
    if (exportFormat === 'csv') {
      const headers = ['Response ID', 'Survey ID', 'Timestamp', 'Region', 'Age Group', 'User Type'];
      const rows = data.map((r) => [
        r.id,
        r.surveyId,
        new Date(r.timestamp).toISOString(),
        r.demographic.region,
        r.demographic.ageGroup,
        r.demographic.userType,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'json') {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowExportModal(false);
  }, [selectedSurvey, surveyResponses, filteredResponses, exportFormat]);

  const handleChartHover = useCallback((item, event) => {
    if (item) {
      setShowTooltip(item);
      setTooltipPos({ x: event.clientX, y: event.clientY });
    } else {
      setShowTooltip(null);
    }
  }, []);

  const renderBarChart = (data, width = 500, height = 300) => {
    if (!data || data.length === 0) return <p style={{ color: '#9ca3af' }}>No data available</p>;
    const maxVal = Math.max(...data.map((d) => d.count));
    const barWidth = Math.min(60, (width - 80) / data.length - 10);
    const chartHeight = height - 60;
    return (
      <svg width={width} height={height} ref={chartRef} aria-label="Bar chart">
        {data.map((item, i) => {
          const barHeight = maxVal > 0 ? (item.count / maxVal) * chartHeight : 0;
          const x = 50 + i * (barWidth + 10);
          const y = chartHeight - barHeight + 20;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                rx={4}
                onMouseEnter={(e) => handleChartHover(item, e)}
                onMouseLeave={() => handleChartHover(null)}
                style={{ cursor: 'pointer', transition: animationsEnabled ? 'height 0.3s, y 0.3s' : 'none' }}
              />
              {showDataLabels && (
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize={11} fill={theme === 'dark' ? '#e5e7eb' : '#374151'}>
                  {item.count}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize={10}
                fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              >
                {item.label.length > 8 ? item.label.slice(0, 8) + '...' : item.label}
              </text>
            </g>
          );
        })}
        <line x1={45} y1={20} x2={45} y2={chartHeight + 20} stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'} />
        <line x1={45} y1={chartHeight + 20} x2={width} y2={chartHeight + 20} stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'} />
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <text
            key={pct}
            x={40}
            y={chartHeight + 20 - pct * chartHeight + 4}
            textAnchor="end"
            fontSize={10}
            fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          >
            {Math.round(maxVal * pct)}
          </text>
        ))}
      </svg>
    );
  };

  const renderPieChart = (data, size = 200) => {
    if (!data || data.length === 0) return <p style={{ color: '#9ca3af' }}>No data available</p>;
    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) return <p style={{ color: '#9ca3af' }}>No data available</p>;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 20;
    let currentAngle = -Math.PI / 2;
    const slices = data.map((item, i) => {
      const sliceAngle = (item.count / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const midAngle = startAngle + sliceAngle / 2;
      const labelX = cx + (radius * 0.65) * Math.cos(midAngle);
      const labelY = cy + (radius * 0.65) * Math.sin(midAngle);
      return { path, color: CHART_COLORS[i % CHART_COLORS.length], label: item.label, count: item.count, pct: ((item.count / total) * 100).toFixed(1), labelX, labelY };
    });
    return (
      <svg width={size} height={size} aria-label="Pie chart">
        {slices.map((slice, i) => (
          <g key={i}>
            <path
              d={slice.path}
              fill={slice.color}
              stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
              strokeWidth={2}
              onMouseEnter={(e) => handleChartHover({ label: slice.label, count: slice.count, pct: slice.pct }, e)}
              onMouseLeave={() => handleChartHover(null)}
              style={{ cursor: 'pointer' }}
            />
            {showDataLabels && slice.pct > 5 && (
              <text x={slice.labelX} y={slice.labelY} textAnchor="middle" fontSize={11} fill="#ffffff" fontWeight="bold">
                {slice.pct}%
              </text>
            )}
          </g>
        ))}
      </svg>
    );
  };

  const renderLineChart = (data, width = 600, height = 300) => {
    if (!data || data.length === 0) return <p style={{ color: '#9ca3af' }}>No data available</p>;
    const maxVal = Math.max(...data.map((d) => d.count));
    const chartWidth = width - 80;
    const chartHeight = height - 60;
    const points = data.map((item, i) => {
      const x = 60 + (i / Math.max(data.length - 1, 1)) * chartWidth;
      const y = maxVal > 0 ? chartHeight + 20 - (item.count / maxVal) * chartHeight : chartHeight + 20;
      return { x, y, ...item };
    });
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight + 20} L ${points[0].x} ${chartHeight + 20} Z`;
    return (
      <svg width={width} height={height} aria-label="Line chart">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGradient)" />
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth={2}
              onMouseEnter={(e) => handleChartHover({ label: p.date, count: p.count }, e)}
              onMouseLeave={() => handleChartHover(null)}
              style={{ cursor: 'pointer' }}
            />
            {showDataLabels && i % Math.max(1, Math.floor(data.length / 8)) === 0 && (
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={10} fill={theme === 'dark' ? '#e5e7eb' : '#374151'}>
                {p.count}
              </text>
            )}
          </g>
        ))}
        <line x1={55} y1={20} x2={55} y2={chartHeight + 20} stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'} />
        <line x1={55} y1={chartHeight + 20} x2={width - 10} y2={chartHeight + 20} stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'} />
        {points.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0).map((p) => (
          <text key={p.x} x={p.x} y={height - 5} textAnchor="middle" fontSize={9} fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}>
            {p.date.split('/').slice(0, 2).join('/')}
          </text>
        ))}
      </svg>
    );
  };

  const renderNpsGauge = (score) => {
    const gaugeWidth = 300;
    const gaugeHeight = 160;
    const centerX = gaugeWidth / 2;
    const centerY = gaugeHeight - 20;
    const radius = 110;
    const normalizedScore = (score + 100) / 200;
    const angle = -Math.PI + normalizedScore * Math.PI;
    const needleX = centerX + radius * 0.8 * Math.cos(angle);
    const needleY = centerY + radius * 0.8 * Math.sin(angle);
    return (
      <svg width={gaugeWidth} height={gaugeHeight} aria-label="NPS gauge">
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY - radius}`}
          fill="none" stroke="#ef4444" strokeWidth={20} strokeLinecap="round"
        />
        <path
          d={`M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX + radius * 0.5} ${centerY - radius * 0.87}`}
          fill="none" stroke="#f59e0b" strokeWidth={20}
        />
        <path
          d={`M ${centerX + radius * 0.5} ${centerY - radius * 0.87} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none" stroke="#22c55e" strokeWidth={20} strokeLinecap="round"
        />
        <line x1={centerX} y1={centerY} x2={needleX} y2={needleY} stroke={theme === 'dark' ? '#e5e7eb' : '#374151'} strokeWidth={3} />
        <circle cx={centerX} cy={centerY} r={6} fill={theme === 'dark' ? '#e5e7eb' : '#374151'} />
        <text x={centerX} y={centerY + 30} textAnchor="middle" fontSize={24} fontWeight="bold" fill={theme === 'dark' ? '#e5e7eb' : '#111827'}>
          {score}
        </text>
        <text x={centerX - radius + 10} y={centerY + 15} fontSize={10} fill="#ef4444">-100</text>
        <text x={centerX + radius - 20} y={centerY + 15} fontSize={10} fill="#22c55e">100</text>
      </svg>
    );
  };

  const bgColor = theme === 'dark' ? '#111827' : '#f9fafb';
  const cardBg = theme === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = theme === 'dark' ? '#f3f4f6' : '#111827';
  const mutedText = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const inputBg = theme === 'dark' ? '#374151' : '#f3f4f6';

  const renderSidebar = () => (
    <div
      style={{
        width: 260,
        backgroundColor: theme === 'dark' ? '#0f172a' : '#1e293b',
        color: '#f1f5f9',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <div style={{ padding: '0 20px', marginBottom: 30 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>📊 SurveyInsight</h1>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Analytics Dashboard</p>
      </div>
      <nav>
        {[
          { id: 'overview', label: 'Overview', icon: '📈' },
          { id: 'surveys', label: 'Surveys', icon: '📋' },
          { id: 'responses', label: 'Responses', icon: '💬' },
          { id: 'demographics', label: 'Demographics', icon: '👥' },
          { id: 'comparison', label: 'Compare', icon: '⚖️' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              if (item.id === 'comparison') setComparisonMode(true);
              else setComparisonMode(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '12px 20px',
              border: 'none',
              background: activeView === item.id ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: activeView === item.id ? '#60a5fa' : '#cbd5e1',
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'left',
              borderLeft: activeView === item.id ? '3px solid #3b82f6' : '3px solid transparent',
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '0 20px' }}>
        <div style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            aria-label="Toggle settings"
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: 6, color: '#cbd5e1', cursor: 'pointer', fontSize: 13 }}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            style={{ width: '100%', marginTop: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: 6, color: '#cbd5e1', cursor: 'pointer', fontSize: 13 }}
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: cardBg,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <input
          type="text"
          placeholder="Search surveys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 12px',
            border: `1px solid ${borderColor}`,
            borderRadius: 6,
            backgroundColor: inputBg,
            color: textColor,
            fontSize: 13,
            width: 220,
          }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, backgroundColor: inputBg, color: textColor, fontSize: 13 }}
        >
          <option value="all">All Categories</option>
          {SURVEY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, backgroundColor: inputBg, color: textColor, fontSize: 13 }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={dateRange.label}
          onChange={(e) => setDateRange(DATE_RANGES.find((d) => d.label === e.target.value) || DATE_RANGES[1])}
          aria-label="Date range"
          style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, backgroundColor: inputBg, color: textColor, fontSize: 13 }}
        >
          {DATE_RANGES.map((d) => (
            <option key={d.label} value={d.label}>{d.label}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowExportModal(true)}
          aria-label="Export data"
          style={{ padding: '8px 16px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          📥 Export
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: textColor, marginBottom: 20 }}>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Surveys', value: overviewMetrics.totalSurveys, icon: '📋', color: '#3b82f6' },
          { label: 'Total Responses', value: overviewMetrics.totalResponses.toLocaleString(), icon: '💬', color: '#22c55e' },
          { label: 'Active Surveys', value: overviewMetrics.activeSurveys, icon: '🟢', color: '#10b981' },
          { label: 'Avg Responses', value: overviewMetrics.avgResponseRate, icon: '📊', color: '#f59e0b' },
          { label: 'Avg Rating', value: `${overviewMetrics.avgRating}/5`, icon: '⭐', color: '#ef4444' },
          { label: 'NPS Score', value: overviewMetrics.npsScore, icon: '🎯', color: '#8b5cf6' },
        ].map((metric) => (
          <div
            key={metric.label}
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              padding: 16,
              borderLeft: `4px solid ${metric.color}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: mutedText }}>{metric.label}</span>
              <span>{metric.icon}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: textColor, marginTop: 8 }}>{metric.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 16 }}>Response Trend</h3>
          {renderLineChart(responseTimeline)}
        </div>
        <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 16 }}>Responses by {demographicBreakdown.charAt(0).toUpperCase() + demographicBreakdown.slice(1)}</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['region', 'ageGroup', 'userType'].map((dim) => (
              <button
                key={dim}
                onClick={() => setDemographicBreakdown(dim)}
                style={{
                  padding: '4px 12px',
                  border: `1px solid ${demographicBreakdown === dim ? '#3b82f6' : borderColor}`,
                  borderRadius: 20,
                  background: demographicBreakdown === dim ? '#3b82f6' : 'transparent',
                  color: demographicBreakdown === dim ? '#ffffff' : mutedText,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {dim === 'ageGroup' ? 'Age Group' : dim === 'userType' ? 'User Type' : 'Region'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {renderPieChart(demographicData)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {demographicData.map((item, i) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span style={{ color: textColor }}>{item.label}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20, backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 16 }}>NPS Score Overview</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderNpsGauge(overviewMetrics.npsScore)}
        </div>
      </div>
    </div>
  );

  const renderSurveyList = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: textColor }}>Surveys</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort by"
            style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, backgroundColor: inputBg, color: textColor, fontSize: 12 }}
          >
            <option value="date">Sort by Date</option>
            <option value="responses">Sort by Responses</option>
            <option value="title">Sort by Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            aria-label="Toggle sort order"
            style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, backgroundColor: inputBg, color: textColor, cursor: 'pointer', fontSize: 12 }}
          >
            {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
          </button>
        </div>
      </div>
      {filteredSurveys.length === 0 ? (
        <p style={{ color: mutedText, textAlign: 'center', padding: 40 }}>No surveys match your filters.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => {
                setSelectedSurvey(survey);
                setSelectedQuestion(survey.questions[0]?.id || null);
                setActiveView('responses');
              }}
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                padding: 16,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'box-shadow 0.2s',
              }}
              role="button"
              tabIndex={0}
              aria-label={`View ${survey.title}`}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, margin: 0 }}>{survey.title}</h3>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: STATUS_COLORS[survey.status] + '20',
                      color: STATUS_COLORS[survey.status],
                    }}
                  >
                    {survey.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: mutedText }}>
                  <span>📁 {survey.category}</span>
                  <span>❓ {survey.questions.length} questions</span>
                  <span>📅 {new Date(survey.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: textColor }}>{survey.totalResponses}</div>
                <div style={{ fontSize: 11, color: mutedText }}>responses</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResponseAnalysis = () => {
    if (!selectedSurvey) {
      return (
        <div style={{ padding: 24, textAlign: 'center', color: mutedText }}>
          <p style={{ fontSize: 16 }}>Select a survey to view detailed response analysis.</p>
          <button
            onClick={() => setActiveView('surveys')}
            style={{ marginTop: 12, padding: '8px 16px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Browse Surveys
          </button>
        </div>
      );
    }
    return (
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <button
              onClick={() => {
                setSelectedSurvey(null);
                setSelectedQuestion(null);
                setActiveView('surveys');
              }}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}
            >
              ← Back to Surveys
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: textColor, margin: 0 }}>{selectedSurvey.title}</h2>
            <p style={{ fontSize: 13, color: mutedText, margin: '4px 0 0' }}>{surveyResponses.length} responses in selected date range</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['bar', 'pie'].map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                style={{
                  padding: '6px 14px',
                  border: `1px solid ${chartType === type ? '#3b82f6' : borderColor}`,
                  borderRadius: 6,
                  background: chartType === type ? '#3b82f6' : 'transparent',
                  color: chartType === type ? '#ffffff' : mutedText,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {type === 'bar' ? '📊 Bar' : '🥧 Pie'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {selectedSurvey.questions.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuestion(q.id)}
              style={{
                padding: '8px 14px',
                border: `1px solid ${selectedQuestion === q.id ? '#3b82f6' : borderColor}`,
                borderRadius: 6,
                background: selectedQuestion === q.id ? '#3b82f6' : cardBg,
                color: selectedQuestion === q.id ? '#ffffff' : textColor,
                cursor: 'pointer',
                fontSize: 12,
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {q.text.length > 30 ? q.text.slice(0, 30) + '...' : q.text}
            </button>
          ))}
        </div>
        {questionAnalytics && (
          <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 4 }}>
              {selectedSurvey.questions.find((q) => q.id === selectedQuestion)?.text}
            </h3>
            <p style={{ fontSize: 12, color: mutedText, marginBottom: 16 }}>
              {questionAnalytics.total} responses • Type: {questionAnalytics.type.replace('_', ' ')}
            </p>
            {questionAnalytics.type === 'rating' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: textColor }}>{questionAnalytics.average}</span>
                  <span style={{ fontSize: 14, color: mutedText }}>/ 5 average rating</span>
                </div>
                {chartType === 'bar' ? renderBarChart(questionAnalytics.distribution) : renderPieChart(questionAnalytics.distribution)}
              </div>
            )}
            {questionAnalytics.type === 'nps' && (
              <div>
                {renderNpsGauge(questionAnalytics.npsScore)}
                <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
                  {[
                    { label: 'Promoters (9-10)', value: questionAnalytics.groups.promoters, color: '#22c55e' },
                    { label: 'Passives (7-8)', value: questionAnalytics.groups.passives, color: '#f59e0b' },
                    { label: 'Detractors (0-6)', value: questionAnalytics.groups.detractors, color: '#ef4444' },
                  ].map((g) => (
                    <div key={g.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: g.color }}>{g.value}</div>
                      <div style={{ fontSize: 11, color: mutedText }}>{g.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(questionAnalytics.type === 'single_choice' || questionAnalytics.type === 'multiple_choice') && (
              <div>
                {chartType === 'bar' ? renderBarChart(questionAnalytics.distribution) : renderPieChart(questionAnalytics.distribution)}
              </div>
            )}
            {questionAnalytics.type === 'open_text' && (
              <p style={{ color: mutedText, fontStyle: 'italic' }}>Open text responses: {questionAnalytics.total} collected</p>
            )}
          </div>
        )}
        <div style={{ marginTop: 20, backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 16 }}>Response Timeline</h3>
          {renderLineChart(responseTimeline)}
        </div>
      </div>
    );
  };

  const renderDemographics = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: textColor, marginBottom: 20 }}>Demographic Breakdown</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['region', 'ageGroup', 'userType'].map((dim) => (
          <button
            key={dim}
            onClick={() => setDemographicBreakdown(dim)}
            style={{
              padding: '8px 16px',
              border: `1px solid ${demographicBreakdown === dim ? '#3b82f6' : borderColor}`,
              borderRadius: 6,
              background: demographicBreakdown === dim ? '#3b82f6' : cardBg,
              color: demographicBreakdown === dim ? '#ffffff' : textColor,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {dim === 'ageGroup' ? 'Age Group' : dim === 'userType' ? 'User Type' : 'Region'}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 16 }}>Distribution</h3>
          {renderBarChart(demographicData)}
        </div>
        <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 16 }}>Proportion</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {renderPieChart(demographicData)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {demographicData.map((item, i) => {
                const total = demographicData.reduce((s, d) => s + d.count, 0);
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span style={{ color: textColor }}>{item.label}</span>
                    <span style={{ color: mutedText, marginLeft: 'auto' }}>{total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20, backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 16 }}>Response Table</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `2px solid ${borderColor}`, color: mutedText, fontWeight: 600 }}>Segment</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: `2px solid ${borderColor}`, color: mutedText, fontWeight: 600 }}>Responses</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: `2px solid ${borderColor}`, color: mutedText, fontWeight: 600 }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {demographicData.map((item) => {
              const total = demographicData.reduce((s, d) => s + d.count, 0);
              return (
                <tr key={item.label}>
                  <td style={{ padding: '8px 12px', borderBottom: `1px solid ${borderColor}`, color: textColor }}>{item.label}</td>
                  <td style={{ textAlign: 'right', padding: '8px 12px', borderBottom: `1px solid ${borderColor}`, color: textColor }}>{item.count}</td>
                  <td style={{ textAlign: 'right', padding: '8px 12px', borderBottom: `1px solid ${borderColor}`, color: textColor }}>
                    {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderComparison = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: textColor, marginBottom: 8 }}>Survey Comparison</h2>
      <p style={{ fontSize: 13, color: mutedText, marginBottom: 20 }}>Select up to 4 surveys to compare side by side.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {surveys.filter((s) => s.status !== 'draft').map((survey) => (
          <button
            key={survey.id}
            onClick={() => toggleComparedSurvey(survey.id)}
            style={{
              padding: '8px 14px',
              border: `2px solid ${comparedSurveys.includes(survey.id) ? '#3b82f6' : borderColor}`,
              borderRadius: 8,
              background: comparedSurveys.includes(survey.id) ? '#3b82f620' : cardBg,
              color: textColor,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {comparedSurveys.includes(survey.id) ? '✓ ' : ''}{survey.title}
          </button>
        ))}
      </div>
      {comparisonData && comparisonData.length >= 2 ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)`, gap: 16, marginBottom: 20 }}>
            {comparisonData.map((item, i) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: 16,
                  borderTop: `4px solid ${CHART_COLORS[i]}`,
                }}
              >
                <h4 style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 12 }}>{item.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, color: mutedText }}>Responses</span>
                    <div style={{ fontSize: 20, fontWeight: 700, color: textColor }}>{item.responseCount}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: mutedText }}>Avg Rating</span>
                    <div style={{ fontSize: 20, fontWeight: 700, color: textColor }}>{item.avgRating}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textColor, marginBottom: 16 }}>Response Count Comparison</h3>
            {renderBarChart(comparisonData.map((d) => ({ label: d.title.slice(0, 12), count: d.responseCount })))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: mutedText }}>
          <p>Select at least 2 surveys to see comparison data.</p>
        </div>
      )}
    </div>
  );

  const renderSettingsPanel = () => {
    if (!showSettingsPanel) return null;
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 320,
          height: '100vh',
          backgroundColor: cardBg,
          borderLeft: `1px solid ${borderColor}`,
          padding: 24,
          zIndex: 1000,
          boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: textColor, margin: 0 }}>Settings</h3>
          <button
            onClick={() => setShowSettingsPanel(false)}
            aria-label="Close settings"
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: mutedText }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: textColor, display: 'block', marginBottom: 6 }}>Chart Animations</label>
            <button
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${borderColor}`,
                borderRadius: 6,
                background: animationsEnabled ? '#22c55e20' : inputBg,
                color: animationsEnabled ? '#22c55e' : mutedText,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {animationsEnabled ? '✓ Enabled' : '✗ Disabled'}
            </button>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: textColor, display: 'block', marginBottom: 6 }}>Data Labels</label>
            <button
              onClick={() => setShowDataLabels(!showDataLabels)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${borderColor}`,
                borderRadius: 6,
                background: showDataLabels ? '#3b82f620' : inputBg,
                color: showDataLabels ? '#3b82f6' : mutedText,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {showDataLabels ? '✓ Showing' : '✗ Hidden'}
            </button>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: textColor, display: 'block', marginBottom: 6 }}>Default Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, backgroundColor: inputBg, color: textColor, fontSize: 13 }}
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: textColor, display: 'block', marginBottom: 6 }}>Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, backgroundColor: inputBg, color: textColor, fontSize: 13 }}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderExportModal = () => {
    if (!showExportModal) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
        <div style={{ backgroundColor: cardBg, borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: textColor, marginBottom: 16 }}>Export Data</h3>
          <p style={{ fontSize: 13, color: mutedText, marginBottom: 16 }}>
            {selectedSurvey ? `Export ${surveyResponses.length} responses from "${selectedSurvey.title}"` : `Export all ${filteredResponses.length} filtered responses`}
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['csv', 'json'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: `2px solid ${exportFormat === fmt ? '#3b82f6' : borderColor}`,
                  borderRadius: 8,
                  background: exportFormat === fmt ? '#3b82f620' : 'transparent',
                  color: exportFormat === fmt ? '#3b82f6' : textColor,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowExportModal(false)}
              style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: textColor, cursor: 'pointer', fontSize: 13 }}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              style={{ padding: '8px 16px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
            >
              Download {exportFormat.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTooltip = () => {
    if (!showTooltip) return null;
    return (
      <div
        style={{
          position: 'fixed',
          left: tooltipPos.x + 10,
          top: tooltipPos.y - 40,
          backgroundColor: theme === 'dark' ? '#374151' : '#1f2937',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 12,
          pointerEvents: 'none',
          zIndex: 3000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ fontWeight: 600 }}>{showTooltip.label}</div>
        <div>{showTooltip.count !== undefined ? `Count: ${showTooltip.count}` : ''}</div>
        {showTooltip.pct && <div>{showTooltip.pct}%</div>}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {renderSidebar()}
      <div style={{ marginLeft: 260, flex: 1 }}>
        {renderHeader()}
        {activeView === 'overview' && renderOverview()}
        {activeView === 'surveys' && renderSurveyList()}
        {activeView === 'responses' && renderResponseAnalysis()}
        {activeView === 'demographics' && renderDemographics()}
        {activeView === 'comparison' && renderComparison()}
      </div>
      {renderSettingsPanel()}
      {renderExportModal()}
      {renderTooltip()}
    </div>
  );
}
