import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Constants & seed data ───────────────────────────────────────────────────

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];

const PRODUCT_CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Food & Beverage'];

const SALES_CHANNELS = ['Online', 'Retail', 'Wholesale', 'Partner'];

const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899',
  indigo: '#6366f1',
  chartColors: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#6366f1'],
};

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 12 months', days: 365 },
];

function generateDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function generateSalesData() {
  const data = [];
  const rng = seedRandom(42);
  for (let i = 0; i < 365; i++) {
    const date = generateDate(365 - i);
    const numTransactions = Math.floor(rng() * 8) + 2;
    for (let j = 0; j < numTransactions; j++) {
      const region = REGIONS[Math.floor(rng() * REGIONS.length)];
      const category = PRODUCT_CATEGORIES[Math.floor(rng() * PRODUCT_CATEGORIES.length)];
      const channel = SALES_CHANNELS[Math.floor(rng() * SALES_CHANNELS.length)];
      const baseAmount = 50 + rng() * 950;
      const seasonalMultiplier = 1 + 0.3 * Math.sin((i / 365) * Math.PI * 2);
      const amount = Math.round(baseAmount * seasonalMultiplier * 100) / 100;
      const quantity = Math.floor(rng() * 20) + 1;
      const cost = Math.round(amount * (0.4 + rng() * 0.25) * 100) / 100;
      data.push({
        id: `txn-${i}-${j}`,
        date,
        region,
        category,
        channel,
        amount,
        quantity,
        cost,
        profit: Math.round((amount - cost) * 100) / 100,
        customerId: `cust-${Math.floor(rng() * 200) + 1}`,
        productId: `prod-${Math.floor(rng() * 50) + 1}`,
        status: rng() > 0.08 ? 'completed' : rng() > 0.5 ? 'refunded' : 'pending',
      });
    }
  }
  return data;
}

function seedRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [allSales] = useState(() => generateSalesData());
  const [dateRange, setDateRange] = useState({ start: generateDate(30), end: new Date() });
  const [selectedRegions, setSelectedRegions] = useState([...REGIONS]);
  const [selectedCategories, setSelectedCategories] = useState([...PRODUCT_CATEGORIES]);
  const [selectedChannels, setSelectedChannels] = useState([...SALES_CHANNELS]);
  const [groupBy, setGroupBy] = useState('day');
  const [chartType, setChartType] = useState('bar');
  const [activeTab, setActiveTab] = useState('overview');
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [drillDownData, setDrillDownData] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('analyticsDashboardTheme') || 'light';
    }
    return 'light';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [kpiLayout, setKpiLayout] = useState('grid');
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const exportMenuRef = useRef(null);
  const chartContainerRef = useRef(null);

  // ─── Theme persistence ───────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('analyticsDashboardTheme', theme);
  }, [theme]);

  // ─── Auto-refresh ────────────────────────────────────────────────────────

  useEffect(() => {
    if (refreshInterval > 0) {
      const timer = setInterval(() => {
        setLastRefreshed(new Date());
      }, refreshInterval * 1000);
      return () => clearInterval(timer);
    }
  }, [refreshInterval]);

  // ─── Click-outside for export menu ───────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'e') {
          e.preventDefault();
          setShowExportMenu((prev) => !prev);
        } else if (e.key === 'k') {
          e.preventDefault();
          document.querySelector('[data-testid="search-input"]')?.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── Filtered data ──────────────────────────────────────────────────────

  const filteredSales = useMemo(() => {
    return allSales.filter((sale) => {
      const dateMatch = sale.date >= dateRange.start && sale.date <= dateRange.end;
      const regionMatch = selectedRegions.includes(sale.region);
      const categoryMatch = selectedCategories.includes(sale.category);
      const channelMatch = selectedChannels.includes(sale.channel);
      const statusMatch = sale.status === 'completed';
      const searchMatch =
        searchQuery === '' ||
        sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerId.toLowerCase().includes(searchQuery.toLowerCase());
      return dateMatch && regionMatch && categoryMatch && channelMatch && statusMatch && searchMatch;
    });
  }, [allSales, dateRange, selectedRegions, selectedCategories, selectedChannels, searchQuery]);

  // ─── Comparison period data ──────────────────────────────────────────────

  const comparisonSales = useMemo(() => {
    if (!comparisonMode) return [];
    const rangeDays = Math.round((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));
    const compStart = new Date(dateRange.start);
    compStart.setDate(compStart.getDate() - rangeDays);
    const compEnd = new Date(dateRange.start);
    compEnd.setDate(compEnd.getDate() - 1);
    return allSales.filter((sale) => {
      return (
        sale.date >= compStart &&
        sale.date <= compEnd &&
        selectedRegions.includes(sale.region) &&
        selectedCategories.includes(sale.category) &&
        selectedChannels.includes(sale.channel) &&
        sale.status === 'completed'
      );
    });
  }, [allSales, dateRange, selectedRegions, selectedCategories, selectedChannels, comparisonMode]);

  // ─── KPI calculations ───────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.amount, 0);
    const totalProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0);
    const totalOrders = filteredSales.length;
    const totalQuantity = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const uniqueCustomers = new Set(filteredSales.map((s) => s.customerId)).size;
    const refundedCount = allSales.filter(
      (s) =>
        s.date >= dateRange.start &&
        s.date <= dateRange.end &&
        selectedRegions.includes(s.region) &&
        selectedCategories.includes(s.category) &&
        selectedChannels.includes(s.channel) &&
        s.status === 'refunded',
    ).length;
    const refundRate = totalOrders + refundedCount > 0 ? (refundedCount / (totalOrders + refundedCount)) * 100 : 0;

    let comparison = null;
    if (comparisonMode && comparisonSales.length > 0) {
      const prevRevenue = comparisonSales.reduce((sum, s) => sum + s.amount, 0);
      const prevProfit = comparisonSales.reduce((sum, s) => sum + s.profit, 0);
      const prevOrders = comparisonSales.length;
      comparison = {
        revenueChange: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
        profitChange: prevProfit > 0 ? ((totalProfit - prevProfit) / prevProfit) * 100 : 0,
        ordersChange: prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0,
      };
    }

    return { totalRevenue, totalProfit, totalOrders, totalQuantity, avgOrderValue, profitMargin, uniqueCustomers, refundRate, comparison };
  }, [filteredSales, comparisonSales, comparisonMode, allSales, dateRange, selectedRegions, selectedCategories, selectedChannels]);

  // ─── Time-series aggregation ─────────────────────────────────────────────

  const timeSeriesData = useMemo(() => {
    const buckets = {};
    filteredSales.forEach((sale) => {
      let key;
      if (groupBy === 'day') {
        key = formatShortDate(sale.date);
      } else if (groupBy === 'week') {
        const d = new Date(sale.date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        key = formatShortDate(d);
      } else if (groupBy === 'month') {
        key = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(sale.date);
      } else {
        key = sale.date.getFullYear().toString();
      }
      if (!buckets[key]) {
        buckets[key] = { label: key, revenue: 0, profit: 0, orders: 0, quantity: 0 };
      }
      buckets[key].revenue += sale.amount;
      buckets[key].profit += sale.profit;
      buckets[key].orders += 1;
      buckets[key].quantity += sale.quantity;
    });
    return Object.values(buckets);
  }, [filteredSales, groupBy]);

  // ─── Category breakdown ──────────────────────────────────────────────────

  const categoryBreakdown = useMemo(() => {
    const totals = {};
    filteredSales.forEach((sale) => {
      if (!totals[sale.category]) {
        totals[sale.category] = { category: sale.category, revenue: 0, profit: 0, orders: 0, quantity: 0 };
      }
      totals[sale.category].revenue += sale.amount;
      totals[sale.category].profit += sale.profit;
      totals[sale.category].orders += 1;
      totals[sale.category].quantity += sale.quantity;
    });
    return Object.values(totals).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // ─── Region breakdown ────────────────────────────────────────────────────

  const regionBreakdown = useMemo(() => {
    const totals = {};
    filteredSales.forEach((sale) => {
      if (!totals[sale.region]) {
        totals[sale.region] = { region: sale.region, revenue: 0, profit: 0, orders: 0, quantity: 0 };
      }
      totals[sale.region].revenue += sale.amount;
      totals[sale.region].profit += sale.profit;
      totals[sale.region].orders += 1;
      totals[sale.region].quantity += sale.quantity;
    });
    return Object.values(totals).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // ─── Channel breakdown ───────────────────────────────────────────────────

  const channelBreakdown = useMemo(() => {
    const totals = {};
    filteredSales.forEach((sale) => {
      if (!totals[sale.channel]) {
        totals[sale.channel] = { channel: sale.channel, revenue: 0, profit: 0, orders: 0, quantity: 0 };
      }
      totals[sale.channel].revenue += sale.amount;
      totals[sale.channel].profit += sale.profit;
      totals[sale.channel].orders += 1;
      totals[sale.channel].quantity += sale.quantity;
    });
    return Object.values(totals).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // ─── Top products ────────────────────────────────────────────────────────

  const topProducts = useMemo(() => {
    const products = {};
    filteredSales.forEach((sale) => {
      if (!products[sale.productId]) {
        products[sale.productId] = { productId: sale.productId, revenue: 0, orders: 0, quantity: 0 };
      }
      products[sale.productId].revenue += sale.amount;
      products[sale.productId].orders += 1;
      products[sale.productId].quantity += sale.quantity;
    });
    return Object.values(products)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales]);

  // ─── Sorted + paginated transactions ─────────────────────────────────────

  const sortedTransactions = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let cmp = 0;
      if (sortColumn === 'date') cmp = a.date - b.date;
      else if (sortColumn === 'amount') cmp = a.amount - b.amount;
      else if (sortColumn === 'profit') cmp = a.profit - b.profit;
      else if (sortColumn === 'quantity') cmp = a.quantity - b.quantity;
      else if (sortColumn === 'region') cmp = a.region.localeCompare(b.region);
      else if (sortColumn === 'category') cmp = a.category.localeCompare(b.category);
      else if (sortColumn === 'channel') cmp = a.channel.localeCompare(b.channel);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredSales, sortColumn, sortDirection]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(start, start + pageSize);
  }, [sortedTransactions, currentPage, pageSize]);

  const totalPages = useMemo(() => Math.ceil(sortedTransactions.length / pageSize), [sortedTransactions, pageSize]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleDatePreset = useCallback(
    (days) => {
      setDateRange({ start: generateDate(days), end: new Date() });
      setCurrentPage(1);
    },
    [],
  );

  const handleToggleRegion = useCallback((region) => {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]));
    setCurrentPage(1);
  }, []);

  const handleToggleCategory = useCallback((category) => {
    setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
    setCurrentPage(1);
  }, []);

  const handleToggleChannel = useCallback((channel) => {
    setSelectedChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(
    (column) => {
      if (sortColumn === column) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('desc');
      }
      setCurrentPage(1);
    },
    [sortColumn],
  );

  const handleExportCSV = useCallback(() => {
    const headers = ['Date', 'Region', 'Category', 'Channel', 'Amount', 'Cost', 'Profit', 'Quantity', 'Customer ID', 'Status'];
    const rows = filteredSales.map((s) => [formatDate(s.date), s.region, s.category, s.channel, s.amount, s.cost, s.profit, s.quantity, s.customerId, s.status]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-export-${formatDate(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [filteredSales]);

  const handleExportJSON = useCallback(() => {
    const data = filteredSales.map((s) => ({
      ...s,
      date: formatDate(s.date),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-export-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [filteredSales]);

  const handleDrillDown = useCallback(
    (type, value) => {
      const details = filteredSales.filter((s) => s[type] === value);
      setDrillDownData({ type, value, details });
    },
    [filteredSales],
  );

  const closeDrillDown = useCallback(() => {
    setDrillDownData(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // ─── Chart rendering helpers ─────────────────────────────────────────────

  const renderBarChart = useCallback(
    (data, metric = 'revenue') => {
      const maxVal = Math.max(...data.map((d) => d[metric]), 1);
      return (
        <div data-testid="bar-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '200px', padding: '10px 0' }}>
          {data.map((d, i) => {
            const height = (d[metric] / maxVal) * 180;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div
                  data-testid={`bar-${i}`}
                  style={{
                    width: '100%',
                    maxWidth: '40px',
                    height: `${height}px`,
                    backgroundColor: COLORS.chartColors[i % COLORS.chartColors.length],
                    borderRadius: '4px 4px 0 0',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  title={`${d.label}: ${formatCurrency(d[metric])}`}
                  onClick={() => handleDrillDown('date', d.label)}
                />
                {data.length <= 15 && (
                  <span style={{ fontSize: '10px', marginTop: '4px', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>{d.label}</span>
                )}
              </div>
            );
          })}
        </div>
      );
    },
    [theme, handleDrillDown],
  );

  const renderLineChart = useCallback(
    (data, metric = 'revenue') => {
      const maxVal = Math.max(...data.map((d) => d[metric]), 1);
      const width = 600;
      const height = 200;
      const padding = 20;
      const points = data.map((d, i) => {
        const x = padding + (i / Math.max(data.length - 1, 1)) * (width - 2 * padding);
        const y = height - padding - (d[metric] / maxVal) * (height - 2 * padding);
        return { x, y, ...d };
      });
      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      return (
        <div data-testid="line-chart">
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px' }}>
            <path d={pathD} fill="none" stroke={COLORS.primary} strokeWidth="2" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill={COLORS.primary} style={{ cursor: 'pointer' }}>
                <title>
                  {p.label}: {formatCurrency(p[metric])}
                </title>
              </circle>
            ))}
          </svg>
        </div>
      );
    },
    [],
  );

  const renderPieChart = useCallback(
    (data, metric = 'revenue') => {
      const total = data.reduce((sum, d) => sum + d[metric], 0);
      let currentAngle = 0;
      const slices = data.map((d, i) => {
        const percentage = total > 0 ? d[metric] / total : 0;
        const angle = percentage * 360;
        const startAngle = currentAngle;
        currentAngle += angle;
        const midAngle = ((startAngle + angle / 2) * Math.PI) / 180;
        return { ...d, percentage, startAngle, angle, color: COLORS.chartColors[i % COLORS.chartColors.length], midAngle };
      });
      return (
        <div data-testid="pie-chart" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <svg viewBox="0 0 200 200" style={{ width: '200px', height: '200px' }}>
            {slices.map((slice, i) => {
              const start = ((slice.startAngle - 90) * Math.PI) / 180;
              const end = ((slice.startAngle + slice.angle - 90) * Math.PI) / 180;
              const largeArc = slice.angle > 180 ? 1 : 0;
              const x1 = 100 + 80 * Math.cos(start);
              const y1 = 100 + 80 * Math.sin(start);
              const x2 = 100 + 80 * Math.cos(end);
              const y2 = 100 + 80 * Math.sin(end);
              const d = slice.angle >= 360 ? `M 100 20 A 80 80 0 1 1 99.99 20 Z` : `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
              return <path key={i} d={d} fill={slice.color} stroke="white" strokeWidth="1" data-testid={`pie-slice-${i}`} style={{ cursor: 'pointer' }} />;
            })}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {slices.map((slice, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: slice.color }} />
                <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#334155' }}>
                  {slice.category || slice.region || slice.channel}: {(slice.percentage * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    },
    [theme],
  );

  // ─── Styles ──────────────────────────────────────────────────────────────

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedText = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const hoverBg = isDark ? '#334155' : '#f1f5f9';

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header
        data-testid="dashboard-header"
        style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Sales Analytics</h1>
          <span style={{ fontSize: '12px', color: mutedText }}>Last updated: {formatDate(lastRefreshed)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            data-testid="search-input"
            type="text"
            placeholder="Search transactions... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              color: textColor,
              width: '240px',
              outline: 'none',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={comparisonMode} onChange={(e) => setComparisonMode(e.target.checked)} data-testid="comparison-toggle" />
            Compare
          </label>
          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            <button
              data-testid="export-btn"
              onClick={() => setShowExportMenu((prev) => !prev)}
              aria-label="Export data"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${borderColor}`,
                backgroundColor: cardBg,
                color: textColor,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ⬇ Export
            </button>
            {showExportMenu && (
              <div
                data-testid="export-menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '4px',
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  padding: '4px',
                  zIndex: 10,
                  minWidth: '140px',
                }}
              >
                <button
                  data-testid="export-csv-btn"
                  onClick={handleExportCSV}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    color: textColor,
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '4px',
                    fontSize: '13px',
                  }}
                >
                  📄 Export CSV
                </button>
                <button
                  data-testid="export-json-btn"
                  onClick={handleExportJSON}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    color: textColor,
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '4px',
                    fontSize: '13px',
                  }}
                >
                  📋 Export JSON
                </button>
              </div>
            )}
          </div>
          <button
            data-testid="settings-btn"
            onClick={() => setShowSettings((prev) => !prev)}
            aria-label="Dashboard settings"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: cardBg,
              color: textColor,
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            ⚙️
          </button>
          <button
            data-testid="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: cardBg,
              color: textColor,
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar filters */}
        <aside
          data-testid="filter-sidebar"
          style={{
            width: '240px',
            padding: '16px',
            borderRight: `1px solid ${borderColor}`,
            backgroundColor: cardBg,
            minHeight: 'calc(100vh - 60px)',
            overflowY: 'auto',
          }}
        >
          {/* Date range presets */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: mutedText }}>Date Range</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  data-testid={`preset-${preset.days}`}
                  onClick={() => handleDatePreset(preset.days)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: textColor,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: mutedText }}>From</label>
              <input
                data-testid="date-start"
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value + 'T00:00:00');
                  if (!isNaN(d.getTime())) {
                    setDateRange((prev) => ({ ...prev, start: d }));
                    setCurrentPage(1);
                  }
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: textColor,
                  fontSize: '12px',
                }}
              />
              <label style={{ fontSize: '12px', color: mutedText }}>To</label>
              <input
                data-testid="date-end"
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value + 'T00:00:00');
                  if (!isNaN(d.getTime())) {
                    setDateRange((prev) => ({ ...prev, end: d }));
                    setCurrentPage(1);
                  }
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: textColor,
                  fontSize: '12px',
                }}
              />
            </div>
          </div>

          {/* Region filters */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: mutedText }}>Regions</h3>
            {REGIONS.map((region) => (
              <label key={region} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region)}
                  onChange={() => handleToggleRegion(region)}
                  data-testid={`region-${region.replace(/\s+/g, '-').toLowerCase()}`}
                />
                {region}
              </label>
            ))}
          </div>

          {/* Category filters */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: mutedText }}>Categories</h3>
            {PRODUCT_CATEGORIES.map((cat) => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleToggleCategory(cat)}
                  data-testid={`category-${cat.replace(/\s+&?\s*/g, '-').toLowerCase()}`}
                />
                {cat}
              </label>
            ))}
          </div>

          {/* Channel filters */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: mutedText }}>Channels</h3>
            {SALES_CHANNELS.map((ch) => (
              <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedChannels.includes(ch)}
                  onChange={() => handleToggleChannel(ch)}
                  data-testid={`channel-${ch.toLowerCase()}`}
                />
                {ch}
              </label>
            ))}
          </div>

          {/* Group by */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: mutedText }}>Group By</h3>
            <select
              data-testid="group-by-select"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '4px',
                border: `1px solid ${borderColor}`,
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                color: textColor,
                fontSize: '13px',
              }}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
          {/* Settings Panel */}
          {showSettings && (
            <div
              data-testid="settings-panel"
              style={{
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
              }}
            >
              <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Dashboard Settings</h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: '12px', color: mutedText, display: 'block', marginBottom: '4px' }}>KPI Layout</label>
                  <select
                    data-testid="kpi-layout-select"
                    value={kpiLayout}
                    onChange={(e) => setKpiLayout(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${borderColor}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: textColor,
                      fontSize: '12px',
                    }}
                  >
                    <option value="grid">Grid</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: mutedText, display: 'block', marginBottom: '4px' }}>Auto-refresh (seconds)</label>
                  <select
                    data-testid="refresh-interval-select"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${borderColor}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: textColor,
                      fontSize: '12px',
                    }}
                  >
                    <option value={0}>Off</option>
                    <option value={30}>30s</option>
                    <option value={60}>60s</option>
                    <option value={300}>5 min</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: mutedText, display: 'block', marginBottom: '4px' }}>Page Size</label>
                  <select
                    data-testid="page-size-select"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${borderColor}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: textColor,
                      fontSize: '12px',
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div
            data-testid="tab-nav"
            style={{
              display: 'flex',
              gap: '2px',
              marginBottom: '20px',
              borderBottom: `2px solid ${borderColor}`,
            }}
          >
            {['overview', 'charts', 'breakdown', 'transactions'].map((tab) => (
              <button
                key={tab}
                data-testid={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: 'none',
                  color: activeTab === tab ? COLORS.primary : mutedText,
                  borderBottom: activeTab === tab ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab ? 600 : 400,
                  textTransform: 'capitalize',
                  marginBottom: '-2px',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          {(activeTab === 'overview' || activeTab === 'charts') && (
            <div
              data-testid="kpi-section"
              style={{
                display: 'grid',
                gridTemplateColumns: kpiLayout === 'grid' ? 'repeat(4, 1fr)' : 'repeat(8, 1fr)',
                gap: kpiLayout === 'grid' ? '16px' : '8px',
                marginBottom: '24px',
              }}
            >
              {[
                { label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue), change: kpis.comparison?.revenueChange, color: COLORS.primary },
                { label: 'Total Profit', value: formatCurrency(kpis.totalProfit), change: kpis.comparison?.profitChange, color: COLORS.success },
                { label: 'Total Orders', value: formatNumber(kpis.totalOrders), change: kpis.comparison?.ordersChange, color: COLORS.purple },
                { label: 'Avg Order Value', value: formatCurrency(kpis.avgOrderValue), color: COLORS.warning },
                { label: 'Profit Margin', value: `${kpis.profitMargin.toFixed(1)}%`, color: COLORS.teal },
                { label: 'Items Sold', value: formatNumber(kpis.totalQuantity), color: COLORS.pink },
                { label: 'Unique Customers', value: formatNumber(kpis.uniqueCustomers), color: COLORS.indigo },
                { label: 'Refund Rate', value: `${kpis.refundRate.toFixed(1)}%`, color: COLORS.danger },
              ].map((kpi, i) => (
                <div
                  key={i}
                  data-testid={`kpi-${kpi.label.replace(/\s+/g, '-').toLowerCase()}`}
                  style={{
                    padding: kpiLayout === 'grid' ? '16px' : '10px',
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    borderLeft: `4px solid ${kpi.color}`,
                  }}
                >
                  <div style={{ fontSize: kpiLayout === 'grid' ? '12px' : '10px', color: mutedText, marginBottom: '4px' }}>{kpi.label}</div>
                  <div style={{ fontSize: kpiLayout === 'grid' ? '22px' : '16px', fontWeight: 700 }}>{kpi.value}</div>
                  {comparisonMode && kpi.change !== undefined && (
                    <div
                      data-testid={`kpi-change-${kpi.label.replace(/\s+/g, '-').toLowerCase()}`}
                      style={{
                        fontSize: '11px',
                        color: kpi.change >= 0 ? COLORS.success : COLORS.danger,
                        marginTop: '4px',
                      }}
                    >
                      {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div data-testid="overview-section">
              {/* Top Products */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              >
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Top Products by Revenue</h3>
                <div data-testid="top-products-list">
                  {topProducts.map((product, i) => (
                    <div
                      key={product.productId}
                      data-testid={`top-product-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: i < topProducts.length - 1 ? `1px solid ${borderColor}` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '24px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: mutedText }}>#{i + 1}</span>
                        <span style={{ fontSize: '13px' }}>{product.productId}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                        <span>{formatCurrency(product.revenue)}</span>
                        <span style={{ color: mutedText }}>{product.orders} orders</span>
                        <span style={{ color: mutedText }}>{product.quantity} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Region Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                  }}
                >
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Revenue by Region</h3>
                  <div data-testid="region-summary">
                    {regionBreakdown.map((r, i) => {
                      const maxRev = regionBreakdown[0]?.revenue || 1;
                      const pct = (r.revenue / maxRev) * 100;
                      return (
                        <div
                          key={r.region}
                          data-testid={`region-row-${i}`}
                          onClick={() => handleDrillDown('region', r.region)}
                          style={{ padding: '6px 0', cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '13px' }}>
                            <span>{r.region}</span>
                            <span>{formatCurrency(r.revenue)}</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: isDark ? '#1e293b' : '#e2e8f0', borderRadius: '3px' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                backgroundColor: COLORS.chartColors[i],
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                  }}
                >
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Revenue by Channel</h3>
                  <div data-testid="channel-summary">
                    {channelBreakdown.map((ch, i) => {
                      const maxRev = channelBreakdown[0]?.revenue || 1;
                      const pct = (ch.revenue / maxRev) * 100;
                      return (
                        <div
                          key={ch.channel}
                          data-testid={`channel-row-${i}`}
                          onClick={() => handleDrillDown('channel', ch.channel)}
                          style={{ padding: '6px 0', cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '13px' }}>
                            <span>{ch.channel}</span>
                            <span>{formatCurrency(ch.revenue)}</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: isDark ? '#1e293b' : '#e2e8f0', borderRadius: '3px' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                backgroundColor: COLORS.chartColors[i],
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div data-testid="charts-section">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <span style={{ fontSize: '13px', color: mutedText }}>Chart Type:</span>
                {['bar', 'line', 'pie'].map((type) => (
                  <button
                    key={type}
                    data-testid={`chart-type-${type}`}
                    onClick={() => setChartType(type)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${chartType === type ? COLORS.primary : borderColor}`,
                      backgroundColor: chartType === type ? (isDark ? '#1e3a5f' : '#eff6ff') : 'transparent',
                      color: chartType === type ? COLORS.primary : textColor,
                      cursor: 'pointer',
                      fontSize: '13px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div ref={chartContainerRef} style={{ padding: '16px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>
                  Revenue Over Time ({groupBy === 'day' ? 'Daily' : groupBy === 'week' ? 'Weekly' : groupBy === 'month' ? 'Monthly' : 'Yearly'})
                </h3>
                {chartType === 'bar' && renderBarChart(timeSeriesData)}
                {chartType === 'line' && renderLineChart(timeSeriesData)}
                {chartType === 'pie' && renderPieChart(categoryBreakdown)}
                <div style={{ marginTop: '8px', fontSize: '12px', color: mutedText, textAlign: 'center' }}>
                  {timeSeriesData.length} data points | Total: {formatCurrency(kpis.totalRevenue)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Revenue by Category</h3>
                  {renderPieChart(categoryBreakdown)}
                </div>
                <div style={{ padding: '16px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Revenue by Region</h3>
                  {renderPieChart(regionBreakdown)}
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Tab */}
          {activeTab === 'breakdown' && (
            <div data-testid="breakdown-section">
              <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Category Breakdown</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Category', 'Revenue', 'Profit', 'Orders', 'Qty', 'Avg Order', 'Margin'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '8px',
                            borderBottom: `2px solid ${borderColor}`,
                            fontSize: '12px',
                            fontWeight: 600,
                            color: mutedText,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryBreakdown.map((cat, i) => (
                      <tr
                        key={cat.category}
                        data-testid={`category-breakdown-row-${i}`}
                        onClick={() => handleDrillDown('category', cat.category)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{cat.category}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(cat.revenue)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(cat.profit)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatNumber(cat.orders)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatNumber(cat.quantity)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(cat.orders > 0 ? cat.revenue / cat.orders : 0)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{cat.revenue > 0 ? ((cat.profit / cat.revenue) * 100).toFixed(1) : '0.0'}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Region Breakdown</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Region', 'Revenue', 'Profit', 'Orders', 'Qty', 'Avg Order', 'Margin'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '8px',
                            borderBottom: `2px solid ${borderColor}`,
                            fontSize: '12px',
                            fontWeight: 600,
                            color: mutedText,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {regionBreakdown.map((r, i) => (
                      <tr key={r.region} data-testid={`region-breakdown-row-${i}`} onClick={() => handleDrillDown('region', r.region)} style={{ cursor: 'pointer' }}>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{r.region}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(r.revenue)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(r.profit)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatNumber(r.orders)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatNumber(r.quantity)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(r.orders > 0 ? r.revenue / r.orders : 0)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{r.revenue > 0 ? ((r.profit / r.revenue) * 100).toFixed(1) : '0.0'}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '16px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>Channel Breakdown</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Channel', 'Revenue', 'Profit', 'Orders', 'Qty', 'Avg Order', 'Margin'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '8px',
                            borderBottom: `2px solid ${borderColor}`,
                            fontSize: '12px',
                            fontWeight: 600,
                            color: mutedText,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {channelBreakdown.map((ch, i) => (
                      <tr key={ch.channel} data-testid={`channel-breakdown-row-${i}`} onClick={() => handleDrillDown('channel', ch.channel)} style={{ cursor: 'pointer' }}>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{ch.channel}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(ch.revenue)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(ch.profit)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatNumber(ch.orders)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatNumber(ch.quantity)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(ch.orders > 0 ? ch.revenue / ch.orders : 0)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{ch.revenue > 0 ? ((ch.profit / ch.revenue) * 100).toFixed(1) : '0.0'}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div data-testid="transactions-section">
              <div style={{ padding: '16px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px' }}>
                    Transactions ({formatNumber(sortedTransactions.length)} total)
                  </h3>
                  <div style={{ fontSize: '12px', color: mutedText }}>
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {[
                        { key: 'date', label: 'Date' },
                        { key: 'region', label: 'Region' },
                        { key: 'category', label: 'Category' },
                        { key: 'channel', label: 'Channel' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'profit', label: 'Profit' },
                        { key: 'quantity', label: 'Qty' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          data-testid={`sort-${col.key}`}
                          onClick={() => handleSort(col.key)}
                          style={{
                            textAlign: 'left',
                            padding: '8px',
                            borderBottom: `2px solid ${borderColor}`,
                            fontSize: '12px',
                            fontWeight: 600,
                            color: sortColumn === col.key ? COLORS.primary : mutedText,
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          {col.label} {sortColumn === col.key ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((txn, i) => (
                      <tr key={txn.id} data-testid={`txn-row-${i}`} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : hoverBg }}>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatShortDate(txn.date)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{txn.region}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{txn.category}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{txn.channel}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{formatCurrency(txn.amount)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px', color: txn.profit >= 0 ? COLORS.success : COLORS.danger }}>{formatCurrency(txn.profit)}</td>
                        <td style={{ padding: '8px', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>{txn.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div
                  data-testid="pagination"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    fontSize: '13px',
                  }}
                >
                  <button
                    data-testid="prev-page"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${borderColor}`,
                      backgroundColor: cardBg,
                      color: currentPage <= 1 ? mutedText : textColor,
                      cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage <= 1 ? 0.5 : 1,
                    }}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        data-testid={`page-${page}`}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: `1px solid ${page === currentPage ? COLORS.primary : borderColor}`,
                          backgroundColor: page === currentPage ? (isDark ? '#1e3a5f' : '#eff6ff') : cardBg,
                          color: page === currentPage ? COLORS.primary : textColor,
                          cursor: 'pointer',
                          fontWeight: page === currentPage ? 600 : 400,
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    data-testid="next-page"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${borderColor}`,
                      backgroundColor: cardBg,
                      color: currentPage >= totalPages ? mutedText : textColor,
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage >= totalPages ? 0.5 : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Drill-Down Modal */}
      {drillDownData && (
        <div
          data-testid="drill-down-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={closeDrillDown}
        >
          <div
            style={{
              backgroundColor: cardBg,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>
                {drillDownData.type === 'region' ? '🌍' : drillDownData.type === 'category' ? '📦' : '📡'} {drillDownData.value}
              </h2>
              <button
                data-testid="close-drill-down"
                onClick={closeDrillDown}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: textColor,
                }}
              >
                ✕
              </button>
            </div>

            {/* Drill-down summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Revenue', value: formatCurrency(drillDownData.details.reduce((s, d) => s + d.amount, 0)) },
                { label: 'Profit', value: formatCurrency(drillDownData.details.reduce((s, d) => s + d.profit, 0)) },
                { label: 'Orders', value: formatNumber(drillDownData.details.length) },
                { label: 'Avg Order', value: formatCurrency(drillDownData.details.length > 0 ? drillDownData.details.reduce((s, d) => s + d.amount, 0) / drillDownData.details.length : 0) },
              ].map((kpi, i) => (
                <div key={i} data-testid={`drill-kpi-${i}`} style={{ padding: '10px', backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: mutedText }}>{kpi.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Drill-down transaction list */}
            <div style={{ fontSize: '12px', color: mutedText, marginBottom: '8px' }}>Showing first {Math.min(20, drillDownData.details.length)} of {drillDownData.details.length} transactions</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  {['Date', 'Category', 'Channel', 'Amount', 'Profit'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px', borderBottom: `2px solid ${borderColor}`, color: mutedText }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drillDownData.details.slice(0, 20).map((txn, i) => (
                  <tr key={txn.id} data-testid={`drill-txn-${i}`}>
                    <td style={{ padding: '6px', borderBottom: `1px solid ${borderColor}` }}>{formatShortDate(txn.date)}</td>
                    <td style={{ padding: '6px', borderBottom: `1px solid ${borderColor}` }}>{txn.category}</td>
                    <td style={{ padding: '6px', borderBottom: `1px solid ${borderColor}` }}>{txn.channel}</td>
                    <td style={{ padding: '6px', borderBottom: `1px solid ${borderColor}` }}>{formatCurrency(txn.amount)}</td>
                    <td style={{ padding: '6px', borderBottom: `1px solid ${borderColor}`, color: txn.profit >= 0 ? COLORS.success : COLORS.danger }}>{formatCurrency(txn.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Dialog (overlay) */}
      {showSettings && (
        <div
          data-testid="settings-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
          }}
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
