import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const ASSET_TYPES = ['stock', 'etf', 'crypto', 'bond', 'mutual_fund'];
const ASSET_TYPE_LABELS = {
  stock: 'Stock',
  etf: 'ETF',
  crypto: 'Crypto',
  bond: 'Bond',
  mutual_fund: 'Mutual Fund',
};
const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial', 'Real Estate', 'Utilities'];

const MOCK_HOLDINGS = [
  { id: 'h1', symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', sector: 'Technology', shares: 50, avgCost: 145.20, currentPrice: 178.50, dayChange: 2.35, dayChangePercent: 1.33, dividendYield: 0.55, lastUpdated: Date.now() - 60000 },
  { id: 'h2', symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', sector: 'Technology', shares: 20, avgCost: 98.50, currentPrice: 141.80, dayChange: -1.20, dayChangePercent: -0.84, dividendYield: 0, lastUpdated: Date.now() - 120000 },
  { id: 'h3', symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf', sector: 'Finance', shares: 100, avgCost: 195.00, currentPrice: 228.40, dayChange: 0.85, dayChangePercent: 0.37, dividendYield: 1.32, lastUpdated: Date.now() - 90000 },
  { id: 'h4', symbol: 'BTC', name: 'Bitcoin', type: 'crypto', sector: 'Technology', shares: 1.5, avgCost: 42000.00, currentPrice: 67500.00, dayChange: 1250.00, dayChangePercent: 1.89, dividendYield: 0, lastUpdated: Date.now() - 30000 },
  { id: 'h5', symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', sector: 'Healthcare', shares: 30, avgCost: 155.80, currentPrice: 162.30, dayChange: -0.45, dayChangePercent: -0.28, dividendYield: 2.95, lastUpdated: Date.now() - 150000 },
  { id: 'h6', symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'bond', sector: 'Finance', shares: 80, avgCost: 73.20, currentPrice: 71.85, dayChange: 0.12, dayChangePercent: 0.17, dividendYield: 3.45, lastUpdated: Date.now() - 200000 },
  { id: 'h7', symbol: 'XOM', name: 'Exxon Mobil Corp', type: 'stock', sector: 'Energy', shares: 40, avgCost: 85.40, currentPrice: 104.20, dayChange: 1.65, dayChangePercent: 1.61, dividendYield: 3.28, lastUpdated: Date.now() - 180000 },
  { id: 'h8', symbol: 'ETH', name: 'Ethereum', type: 'crypto', sector: 'Technology', shares: 10, avgCost: 2200.00, currentPrice: 3450.00, dayChange: -85.00, dayChangePercent: -2.40, dividendYield: 0, lastUpdated: Date.now() - 45000 },
  { id: 'h9', symbol: 'VFIAX', name: 'Vanguard 500 Index Fund', type: 'mutual_fund', sector: 'Finance', shares: 25, avgCost: 380.00, currentPrice: 425.60, dayChange: 1.20, dayChangePercent: 0.28, dividendYield: 1.42, lastUpdated: Date.now() - 300000 },
  { id: 'h10', symbol: 'PG', name: 'Procter & Gamble', type: 'stock', sector: 'Consumer', shares: 35, avgCost: 142.00, currentPrice: 158.90, dayChange: 0.30, dayChangePercent: 0.19, dividendYield: 2.45, lastUpdated: Date.now() - 250000 },
  { id: 'h11', symbol: 'NEE', name: 'NextEra Energy', type: 'stock', sector: 'Utilities', shares: 25, avgCost: 72.50, currentPrice: 68.30, dayChange: -0.80, dayChangePercent: -1.16, dividendYield: 2.85, lastUpdated: Date.now() - 280000 },
  { id: 'h12', symbol: 'AMT', name: 'American Tower Corp', type: 'stock', sector: 'Real Estate', shares: 15, avgCost: 195.00, currentPrice: 210.75, dayChange: 2.10, dayChangePercent: 1.01, dividendYield: 3.15, lastUpdated: Date.now() - 320000 },
];

const MOCK_TRANSACTIONS = [
  { id: 't1', holdingId: 'h1', symbol: 'AAPL', type: 'buy', shares: 30, price: 142.50, total: 4275.00, date: Date.now() - 86400000 * 90, fees: 4.99, notes: 'Initial position' },
  { id: 't2', holdingId: 'h1', symbol: 'AAPL', type: 'buy', shares: 20, price: 149.25, total: 2985.00, date: Date.now() - 86400000 * 45, fees: 4.99, notes: 'Adding on dip' },
  { id: 't3', holdingId: 'h2', symbol: 'GOOGL', type: 'buy', shares: 20, price: 98.50, total: 1970.00, date: Date.now() - 86400000 * 60, fees: 0, notes: '' },
  { id: 't4', holdingId: 'h3', symbol: 'VTI', type: 'buy', shares: 50, price: 192.00, total: 9600.00, date: Date.now() - 86400000 * 120, fees: 0, notes: 'DCA purchase' },
  { id: 't5', holdingId: 'h3', symbol: 'VTI', type: 'buy', shares: 50, price: 198.00, total: 9900.00, date: Date.now() - 86400000 * 60, fees: 0, notes: 'DCA purchase' },
  { id: 't6', holdingId: 'h4', symbol: 'BTC', type: 'buy', shares: 1.5, price: 42000.00, total: 63000.00, date: Date.now() - 86400000 * 180, fees: 25.00, notes: 'Long-term hold' },
  { id: 't7', holdingId: 'h5', symbol: 'JNJ', type: 'buy', shares: 30, price: 155.80, total: 4674.00, date: Date.now() - 86400000 * 150, fees: 4.99, notes: 'Dividend play' },
  { id: 't8', holdingId: 'h7', symbol: 'XOM', type: 'buy', shares: 40, price: 85.40, total: 3416.00, date: Date.now() - 86400000 * 100, fees: 4.99, notes: 'Energy sector exposure' },
  { id: 't9', holdingId: 'h1', symbol: 'AAPL', type: 'sell', shares: 10, price: 175.00, total: 1750.00, date: Date.now() - 86400000 * 10, fees: 4.99, notes: 'Partial profit taking' },
  { id: 't10', holdingId: 'h8', symbol: 'ETH', type: 'buy', shares: 10, price: 2200.00, total: 22000.00, date: Date.now() - 86400000 * 75, fees: 15.00, notes: 'DeFi exposure' },
  { id: 't11', holdingId: 'h10', symbol: 'PG', type: 'buy', shares: 35, price: 142.00, total: 4970.00, date: Date.now() - 86400000 * 130, fees: 4.99, notes: 'Defensive position' },
  { id: 't12', holdingId: 'h9', symbol: 'VFIAX', type: 'buy', shares: 25, price: 380.00, total: 9500.00, date: Date.now() - 86400000 * 200, fees: 0, notes: 'Core holding' },
];

const MOCK_WATCHLIST = [
  { id: 'w1', symbol: 'NVDA', name: 'NVIDIA Corp', currentPrice: 875.30, dayChange: 12.40, dayChangePercent: 1.44, targetPrice: 800.00, notes: 'Wait for pullback to $800' },
  { id: 'w2', symbol: 'MSFT', name: 'Microsoft Corp', currentPrice: 415.60, dayChange: -3.20, dayChangePercent: -0.76, targetPrice: 400.00, notes: 'Buy below $400' },
  { id: 'w3', symbol: 'AMZN', name: 'Amazon.com Inc', currentPrice: 185.40, dayChange: 1.80, dayChangePercent: 0.98, targetPrice: 170.00, notes: 'Watching for entry' },
  { id: 'w4', symbol: 'TSLA', name: 'Tesla Inc', currentPrice: 245.80, dayChange: -8.50, dayChangePercent: -3.34, targetPrice: 200.00, notes: 'High volatility, wait' },
  { id: 'w5', symbol: 'V', name: 'Visa Inc', currentPrice: 278.90, dayChange: 0.65, dayChangePercent: 0.23, targetPrice: 260.00, notes: 'Dividend growth play' },
];

const MOCK_ALERTS = [
  { id: 'a1', holdingId: 'h4', symbol: 'BTC', type: 'price_above', threshold: 70000, triggered: false, active: true, createdAt: Date.now() - 86400000 * 5 },
  { id: 'a2', holdingId: 'h8', symbol: 'ETH', type: 'price_below', threshold: 3000, triggered: false, active: true, createdAt: Date.now() - 86400000 * 3 },
  { id: 'a3', holdingId: 'h1', symbol: 'AAPL', type: 'percent_change', threshold: 5, triggered: false, active: true, createdAt: Date.now() - 86400000 * 7 },
  { id: 'a4', holdingId: 'h11', symbol: 'NEE', type: 'price_below', threshold: 65, triggered: false, active: true, createdAt: Date.now() - 86400000 * 2 },
  { id: 'a5', holdingId: 'h7', symbol: 'XOM', type: 'price_above', threshold: 110, triggered: false, active: false, createdAt: Date.now() - 86400000 * 10 },
];

const ALERT_TYPE_LABELS = {
  price_above: 'Price Above',
  price_below: 'Price Below',
  percent_change: '% Change',
};

export default function FinancialPortfolio() {
  const [holdings, setHoldings] = useState(MOCK_HOLDINGS);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [watchlist, setWatchlist] = useState(MOCK_WATCHLIST);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [activeView, setActiveView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [sortField, setSortField] = useState('value');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [transactionForm, setTransactionForm] = useState({ symbol: '', type: 'buy', shares: '', price: '', notes: '' });
  const [alertForm, setAlertForm] = useState({ symbol: '', type: 'price_above', threshold: '' });
  const [watchlistForm, setWatchlistForm] = useState({ symbol: '', name: '', targetPrice: '', notes: '' });
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [portfolioSettings, setPortfolioSettings] = useState({
    currency: 'USD',
    refreshInterval: 30,
    showPercentages: true,
    compactView: false,
    alertSound: true,
  });
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
    const savedSettings = localStorage.getItem('portfolioSettings');
    if (savedSettings) {
      try { setPortfolioSettings(JSON.parse(savedSettings)); } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolioTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('portfolioSettings', JSON.stringify(portfolioSettings));
  }, [portfolioSettings]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const portfolioMetrics = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let totalDayChange = 0;
    let totalDividendIncome = 0;

    holdings.forEach((h) => {
      const value = h.shares * h.currentPrice;
      const cost = h.shares * h.avgCost;
      totalValue += value;
      totalCost += cost;
      totalDayChange += h.shares * h.dayChange;
      totalDividendIncome += value * (h.dividendYield / 100);
    });

    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? ((totalGain / totalCost) * 100) : 0;
    const dayChangePercent = totalValue > 0 ? ((totalDayChange / (totalValue - totalDayChange)) * 100) : 0;

    return { totalValue, totalCost, totalGain, totalGainPercent, totalDayChange, dayChangePercent, totalDividendIncome };
  }, [holdings]);

  const sectorAllocation = useMemo(() => {
    const allocation = {};
    let totalValue = 0;
    holdings.forEach((h) => {
      const value = h.shares * h.currentPrice;
      totalValue += value;
      allocation[h.sector] = (allocation[h.sector] || 0) + value;
    });
    return Object.entries(allocation).map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? ((value / totalValue) * 100) : 0,
    })).sort((a, b) => b.value - a.value);
  }, [holdings]);

  const assetTypeAllocation = useMemo(() => {
    const allocation = {};
    let totalValue = 0;
    holdings.forEach((h) => {
      const value = h.shares * h.currentPrice;
      totalValue += value;
      allocation[h.type] = (allocation[h.type] || 0) + value;
    });
    return Object.entries(allocation).map(([type, value]) => ({
      type,
      label: ASSET_TYPE_LABELS[type] || type,
      value,
      percentage: totalValue > 0 ? ((value / totalValue) * 100) : 0,
    })).sort((a, b) => b.value - a.value);
  }, [holdings]);

  const topPerformers = useMemo(() => {
    return [...holdings]
      .map((h) => ({
        ...h,
        gainPercent: h.avgCost > 0 ? (((h.currentPrice - h.avgCost) / h.avgCost) * 100) : 0,
        totalValue: h.shares * h.currentPrice,
        totalGain: h.shares * (h.currentPrice - h.avgCost),
      }))
      .sort((a, b) => b.gainPercent - a.gainPercent)
      .slice(0, 5);
  }, [holdings]);

  const filteredHoldings = useMemo(() => {
    let filtered = [...holdings];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((h) => h.symbol.toLowerCase().includes(q) || h.name.toLowerCase().includes(q));
    }
    if (filterAssetType !== 'all') {
      filtered = filtered.filter((h) => h.type === filterAssetType);
    }
    if (filterSector !== 'all') {
      filtered = filtered.filter((h) => h.sector === filterSector);
    }
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'symbol': aVal = a.symbol; bVal = b.symbol; break;
        case 'value': aVal = a.shares * a.currentPrice; bVal = b.shares * b.currentPrice; break;
        case 'gain': aVal = ((a.currentPrice - a.avgCost) / a.avgCost) * 100; bVal = ((b.currentPrice - b.avgCost) / b.avgCost) * 100; break;
        case 'dayChange': aVal = a.dayChangePercent; bVal = b.dayChangePercent; break;
        case 'dividend': aVal = a.dividendYield; bVal = b.dividendYield; break;
        default: aVal = a.shares * a.currentPrice; bVal = b.shares * b.currentPrice;
      }
      if (typeof aVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return filtered;
  }, [holdings, searchQuery, filterAssetType, filterSector, sortField, sortDirection]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    if (transactionFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === transactionFilter);
    }
    if (dateRangeFilter !== 'all') {
      const now = Date.now();
      const ranges = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      const days = ranges[dateRangeFilter];
      if (days) filtered = filtered.filter((t) => t.date >= now - 86400000 * days);
    }
    if (searchQuery && activeView === 'transactions') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => t.symbol.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }
    return filtered.sort((a, b) => b.date - a.date);
  }, [transactions, transactionFilter, dateRangeFilter, searchQuery, activeView]);

  const handleAddTransaction = useCallback(() => {
    if (!transactionForm.symbol || !transactionForm.shares || !transactionForm.price) return;
    const newTransaction = {
      id: `t${Date.now()}`,
      holdingId: null,
      symbol: transactionForm.symbol.toUpperCase(),
      type: transactionForm.type,
      shares: parseFloat(transactionForm.shares),
      price: parseFloat(transactionForm.price),
      total: parseFloat(transactionForm.shares) * parseFloat(transactionForm.price),
      date: Date.now(),
      fees: 4.99,
      notes: transactionForm.notes,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    setTransactionForm({ symbol: '', type: 'buy', shares: '', price: '', notes: '' });
    setShowTransactionModal(false);
  }, [transactionForm]);

  const handleAddAlert = useCallback(() => {
    if (!alertForm.symbol || !alertForm.threshold) return;
    const newAlert = {
      id: `a${Date.now()}`,
      holdingId: null,
      symbol: alertForm.symbol.toUpperCase(),
      type: alertForm.type,
      threshold: parseFloat(alertForm.threshold),
      triggered: false,
      active: true,
      createdAt: Date.now(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setAlertForm({ symbol: '', type: 'price_above', threshold: '' });
    setShowAlertModal(false);
  }, [alertForm]);

  const handleToggleAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, active: !a.active } : a));
  }, []);

  const handleDeleteAlert = useCallback((alertId) => {
    if (window.confirm('Delete this alert?')) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  }, []);

  const handleAddToWatchlist = useCallback(() => {
    if (!watchlistForm.symbol || !watchlistForm.name) return;
    const newItem = {
      id: `w${Date.now()}`,
      symbol: watchlistForm.symbol.toUpperCase(),
      name: watchlistForm.name,
      currentPrice: 0,
      dayChange: 0,
      dayChangePercent: 0,
      targetPrice: watchlistForm.targetPrice ? parseFloat(watchlistForm.targetPrice) : null,
      notes: watchlistForm.notes,
    };
    setWatchlist((prev) => [newItem, ...prev]);
    setWatchlistForm({ symbol: '', name: '', targetPrice: '', notes: '' });
    setShowWatchlistModal(false);
  }, [watchlistForm]);

  const handleRemoveFromWatchlist = useCallback((itemId) => {
    if (window.confirm('Remove from watchlist?')) {
      setWatchlist((prev) => prev.filter((w) => w.id !== itemId));
    }
  }, []);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: portfolioSettings.currency }).format(amount);
  };

  const formatPercent = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const bgColor = isDarkMode ? '#1a1a2e' : '#f8fafc';
  const cardBg = isDarkMode ? '#16213e' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const textMuted = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const sidebarBg = isDarkMode ? '#0f172a' : '#1e293b';
  const accentColor = '#3b82f6';
  const gainColor = '#22c55e';
  const lossColor = '#ef4444';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'holdings', label: 'Holdings', icon: '💼' },
    { id: 'transactions', label: 'Transactions', icon: '📋' },
    { id: 'watchlist', label: 'Watchlist', icon: '👁' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'performance', label: 'Performance', icon: '📈' },
  ];

  const activeAlertCount = alerts.filter((a) => a.active).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarCollapsed ? '64px' : '240px', background: sidebarBg, color: '#e2e8f0', transition: 'width 0.2s', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>PortfolioTracker</h1>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px', padding: '4px' }} aria-label="Toggle sidebar">
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 12px', marginBottom: '4px',
                background: activeView === item.id ? '#334155' : 'transparent', color: activeView === item.id ? '#ffffff' : '#94a3b8',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left', position: 'relative',
              }}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {item.id === 'alerts' && activeAlertCount > 0 && !sidebarCollapsed && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>
                  {activeAlertCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid #334155' }}>
          <button onClick={() => setShowSettingsPanel(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 12px', background: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}>
            <span>⚙️</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 12px', background: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}>
            <span>{isDarkMode ? '☀️' : '🌙'}</span>
            {!sidebarCollapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <header style={{ padding: '16px 24px', borderBottom: `1px solid ${borderColor}`, background: cardBg, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search holdings... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, maxWidth: '400px', padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px', outline: 'none' }}
          />
          {(activeView === 'holdings' || activeView === 'overview') && (
            <>
              <select value={filterAssetType} onChange={(e) => setFilterAssetType(e.target.value)} aria-label="Filter by asset type" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }}>
                <option value="all">All Types</option>
                {ASSET_TYPES.map((t) => <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>)}
              </select>
              <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} aria-label="Filter by sector" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }}>
                <option value="all">All Sectors</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}
          {activeView === 'transactions' && (
            <>
              <select value={transactionFilter} onChange={(e) => setTransactionFilter(e.target.value)} aria-label="Filter by transaction type" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }}>
                <option value="all">All Transactions</option>
                <option value="buy">Buys Only</option>
                <option value="sell">Sells Only</option>
              </select>
              <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)} aria-label="Filter by date range" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }}>
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </>
          )}
        </header>

        <div style={{ padding: '24px' }}>
          {/* Overview View */}
          {activeView === 'overview' && (
            <div>
              {/* Portfolio Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Total Value</div>
                  <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatCurrency(portfolioMetrics.totalValue)}</div>
                </div>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Total Gain/Loss</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: portfolioMetrics.totalGain >= 0 ? gainColor : lossColor }}>
                    {formatCurrency(portfolioMetrics.totalGain)}
                  </div>
                  <div style={{ fontSize: '13px', color: portfolioMetrics.totalGainPercent >= 0 ? gainColor : lossColor }}>
                    {formatPercent(portfolioMetrics.totalGainPercent)}
                  </div>
                </div>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Day Change</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: portfolioMetrics.totalDayChange >= 0 ? gainColor : lossColor }}>
                    {formatCurrency(portfolioMetrics.totalDayChange)}
                  </div>
                  <div style={{ fontSize: '13px', color: portfolioMetrics.dayChangePercent >= 0 ? gainColor : lossColor }}>
                    {formatPercent(portfolioMetrics.dayChangePercent)}
                  </div>
                </div>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Annual Dividend Income</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: gainColor }}>{formatCurrency(portfolioMetrics.totalDividendIncome)}</div>
                </div>
              </div>

              {/* Allocation Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Sector Allocation</h3>
                  {sectorAllocation.map((item) => (
                    <div key={item.sector} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ width: '100px', fontSize: '13px', color: textMuted }}>{item.sector}</div>
                      <div style={{ flex: 1, height: '8px', background: isDarkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.percentage}%`, background: accentColor, borderRadius: '4px' }} />
                      </div>
                      <div style={{ width: '50px', fontSize: '13px', textAlign: 'right' }}>{item.percentage.toFixed(1)}%</div>
                      <div style={{ width: '100px', fontSize: '13px', textAlign: 'right', color: textMuted }}>{formatCurrency(item.value)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Asset Type Allocation</h3>
                  {assetTypeAllocation.map((item) => (
                    <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ width: '100px', fontSize: '13px', color: textMuted }}>{item.label}</div>
                      <div style={{ flex: 1, height: '8px', background: isDarkMode ? '#1e293b' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.percentage}%`, background: '#8b5cf6', borderRadius: '4px' }} />
                      </div>
                      <div style={{ width: '50px', fontSize: '13px', textAlign: 'right' }}>{item.percentage.toFixed(1)}%</div>
                      <div style={{ width: '100px', fontSize: '13px', textAlign: 'right', color: textMuted }}>{formatCurrency(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Top Performers</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Symbol</th>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Name</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Gain %</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Total Gain</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((h) => (
                      <tr key={h.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                        <td style={{ padding: '12px', fontWeight: 600, fontSize: '14px' }}>{h.symbol}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: textMuted }}>{h.name}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: h.gainPercent >= 0 ? gainColor : lossColor }}>{formatPercent(h.gainPercent)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: h.totalGain >= 0 ? gainColor : lossColor }}>{formatCurrency(h.totalGain)}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(h.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Holdings View */}
          {activeView === 'holdings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Holdings ({filteredHoldings.length})</h2>
                <button onClick={() => setShowTransactionModal(true)} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                  + Add Transaction
                </button>
              </div>
              <div style={{ background: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                      {[
                        { key: 'symbol', label: 'Symbol', align: 'left' },
                        { key: 'value', label: 'Market Value', align: 'right' },
                        { key: 'gain', label: 'Total Gain', align: 'right' },
                        { key: 'dayChange', label: 'Day Change', align: 'right' },
                        { key: 'dividend', label: 'Div. Yield', align: 'right' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          style={{ textAlign: col.align, padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}
                        >
                          {col.label} {sortField === col.key ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                        </th>
                      ))}
                      <th style={{ padding: '12px 16px', width: '80px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHoldings.map((h) => {
                      const value = h.shares * h.currentPrice;
                      const cost = h.shares * h.avgCost;
                      const gain = value - cost;
                      const gainPct = ((h.currentPrice - h.avgCost) / h.avgCost) * 100;
                      return (
                        <tr key={h.id} style={{ borderBottom: `1px solid ${borderColor}`, cursor: 'pointer' }} onClick={() => setSelectedHolding(h)}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{h.symbol}</div>
                            <div style={{ fontSize: '12px', color: textMuted }}>{h.name}</div>
                            <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>{h.shares} shares @ {formatCurrency(h.avgCost)}</div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ fontWeight: 600 }}>{formatCurrency(value)}</div>
                            <div style={{ fontSize: '12px', color: textMuted }}>{formatCurrency(h.currentPrice)}/share</div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, color: gain >= 0 ? gainColor : lossColor }}>{formatCurrency(gain)}</div>
                            <div style={{ fontSize: '12px', color: gainPct >= 0 ? gainColor : lossColor }}>{formatPercent(gainPct)}</div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, color: h.dayChange >= 0 ? gainColor : lossColor }}>{h.dayChange >= 0 ? '+' : ''}{formatCurrency(h.dayChange)}</div>
                            <div style={{ fontSize: '12px', color: h.dayChangePercent >= 0 ? gainColor : lossColor }}>{formatPercent(h.dayChangePercent)}</div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {h.dividendYield > 0 ? `${h.dividendYield.toFixed(2)}%` : '—'}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedHolding(h); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: textMuted }}>
                              →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredHoldings.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: textMuted }}>No holdings match your filters</div>
                )}
              </div>
            </div>
          )}

          {/* Transactions View */}
          {activeView === 'transactions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Transactions ({filteredTransactions.length})</h2>
                <button onClick={() => setShowTransactionModal(true)} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                  + Record Transaction
                </button>
              </div>
              <div style={{ background: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Symbol</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Shares</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Total</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Fees</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{formatDate(t.date)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: t.type === 'buy' ? '#dcfce7' : '#fee2e2', color: t.type === 'buy' ? '#166534' : '#991b1b' }}>
                            {t.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px' }}>{t.symbol}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px' }}>{t.shares}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px' }}>{formatCurrency(t.price)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '14px' }}>{formatCurrency(t.total)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', color: textMuted }}>{formatCurrency(t.fees)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: textMuted, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: textMuted }}>No transactions match your filters</div>
                )}
              </div>
            </div>
          )}

          {/* Watchlist View */}
          {activeView === 'watchlist' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Watchlist ({watchlist.length})</h2>
                <button onClick={() => setShowWatchlistModal(true)} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                  + Add to Watchlist
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {watchlist.map((w) => (
                  <div key={w.id} style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{w.symbol}</div>
                        <div style={{ fontSize: '13px', color: textMuted }}>{w.name}</div>
                      </div>
                      <button onClick={() => handleRemoveFromWatchlist(w.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: textMuted }} aria-label={`Remove ${w.symbol} from watchlist`}>
                        ✕
                      </button>
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{formatCurrency(w.currentPrice)}</div>
                    <div style={{ fontSize: '13px', color: w.dayChange >= 0 ? gainColor : lossColor, marginBottom: '12px' }}>
                      {w.dayChange >= 0 ? '+' : ''}{formatCurrency(w.dayChange)} ({formatPercent(w.dayChangePercent)})
                    </div>
                    {w.targetPrice && (
                      <div style={{ fontSize: '13px', color: textMuted, marginBottom: '8px' }}>
                        Target: {formatCurrency(w.targetPrice)}
                        {w.currentPrice <= w.targetPrice && <span style={{ marginLeft: '8px', color: gainColor, fontWeight: 600 }}>✓ Below target</span>}
                      </div>
                    )}
                    {w.notes && <div style={{ fontSize: '12px', color: textMuted, fontStyle: 'italic' }}>{w.notes}</div>}
                  </div>
                ))}
                {watchlist.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: textMuted, gridColumn: '1 / -1' }}>Your watchlist is empty. Add symbols to track.</div>
                )}
              </div>
            </div>
          )}

          {/* Alerts View */}
          {activeView === 'alerts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Price Alerts ({alerts.length})</h2>
                <button onClick={() => setShowAlertModal(true)} style={{ padding: '8px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                  + Create Alert
                </button>
              </div>
              <div style={{ background: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Symbol</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Condition</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Threshold</th>
                      <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Created</th>
                      <th style={{ padding: '12px 16px', width: '120px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id} style={{ borderBottom: `1px solid ${borderColor}`, opacity: alert.active ? 1 : 0.5 }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px' }}>{alert.symbol}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{ALERT_TYPE_LABELS[alert.type]}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>
                          {alert.type === 'percent_change' ? `${alert.threshold}%` : formatCurrency(alert.threshold)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                            background: alert.triggered ? '#dcfce7' : (alert.active ? '#dbeafe' : '#f1f5f9'),
                            color: alert.triggered ? '#166534' : (alert.active ? '#1e40af' : '#64748b'),
                          }}>
                            {alert.triggered ? 'Triggered' : (alert.active ? 'Active' : 'Paused')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: textMuted }}>{formatDate(alert.createdAt)}</td>
                        <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleToggleAlert(alert.id)} style={{ padding: '4px 10px', background: alert.active ? '#fee2e2' : '#dcfce7', color: alert.active ? '#991b1b' : '#166534', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                            {alert.active ? 'Pause' : 'Resume'}
                          </button>
                          <button onClick={() => handleDeleteAlert(alert.id)} style={{ padding: '4px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {alerts.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: textMuted }}>No alerts configured. Create one to get notified.</div>
                )}
              </div>
            </div>
          )}

          {/* Performance View */}
          {activeView === 'performance' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 700 }}>Performance Analysis</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Total Invested</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatCurrency(portfolioMetrics.totalCost)}</div>
                </div>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Current Value</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatCurrency(portfolioMetrics.totalValue)}</div>
                </div>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Return on Investment</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: portfolioMetrics.totalGainPercent >= 0 ? gainColor : lossColor }}>
                    {formatPercent(portfolioMetrics.totalGainPercent)}
                  </div>
                </div>
                <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Total Fees Paid</div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>
                    {formatCurrency(transactions.reduce((sum, t) => sum + t.fees, 0))}
                  </div>
                </div>
              </div>

              {/* Per-holding performance */}
              <div style={{ background: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Holdings Performance Breakdown</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Symbol</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Cost Basis</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Market Value</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Gain/Loss</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Return %</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '12px', color: textMuted, fontWeight: 600, textTransform: 'uppercase' }}>% of Portfolio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => {
                      const cost = h.shares * h.avgCost;
                      const value = h.shares * h.currentPrice;
                      const gain = value - cost;
                      const returnPct = cost > 0 ? ((gain / cost) * 100) : 0;
                      const portfolioPct = portfolioMetrics.totalValue > 0 ? ((value / portfolioMetrics.totalValue) * 100) : 0;
                      return (
                        <tr key={h.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontWeight: 600 }}>{h.symbol}</span>
                            <span style={{ fontSize: '12px', color: textMuted, marginLeft: '8px' }}>{ASSET_TYPE_LABELS[h.type]}</span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatCurrency(cost)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(value)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: gain >= 0 ? gainColor : lossColor }}>{formatCurrency(gain)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: returnPct >= 0 ? gainColor : lossColor }}>{formatPercent(returnPct)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>{portfolioPct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Holding Detail Panel */}
      {selectedHolding && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: cardBg, borderLeft: `1px solid ${borderColor}`, boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', overflow: 'auto', zIndex: 100 }}>
          <div style={{ padding: '20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedHolding.symbol} Details</h3>
            <button onClick={() => setSelectedHolding(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: textMuted }} aria-label="Close details">✕</button>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: textMuted }}>{selectedHolding.name}</div>
              <div style={{ fontSize: '11px', color: textMuted, marginTop: '4px' }}>{ASSET_TYPE_LABELS[selectedHolding.type]} · {selectedHolding.sector}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: textMuted }}>Current Price</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{formatCurrency(selectedHolding.currentPrice)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: textMuted }}>Avg Cost</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{formatCurrency(selectedHolding.avgCost)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: textMuted }}>Shares</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{selectedHolding.shares}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: textMuted }}>Market Value</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{formatCurrency(selectedHolding.shares * selectedHolding.currentPrice)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: textMuted }}>Total Gain</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: (selectedHolding.currentPrice - selectedHolding.avgCost) >= 0 ? gainColor : lossColor }}>
                  {formatCurrency(selectedHolding.shares * (selectedHolding.currentPrice - selectedHolding.avgCost))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: textMuted }}>Day Change</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: selectedHolding.dayChange >= 0 ? gainColor : lossColor }}>
                  {formatPercent(selectedHolding.dayChangePercent)}
                </div>
              </div>
            </div>
            {selectedHolding.dividendYield > 0 && (
              <div style={{ padding: '12px 16px', background: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: textMuted }}>Dividend Yield</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedHolding.dividendYield.toFixed(2)}%</div>
                <div style={{ fontSize: '12px', color: textMuted }}>
                  Est. Annual: {formatCurrency(selectedHolding.shares * selectedHolding.currentPrice * (selectedHolding.dividendYield / 100))}
                </div>
              </div>
            )}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Recent Transactions</h4>
              {transactions.filter((t) => t.symbol === selectedHolding.symbol).slice(0, 5).map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', background: t.type === 'buy' ? '#dcfce7' : '#fee2e2', color: t.type === 'buy' ? '#166534' : '#991b1b', marginRight: '8px' }}>{t.type.toUpperCase()}</span>
                    <span style={{ fontSize: '13px' }}>{t.shares} @ {formatCurrency(t.price)}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: textMuted }}>{formatDate(t.date)}</div>
                </div>
              ))}
              {transactions.filter((t) => t.symbol === selectedHolding.symbol).length === 0 && (
                <div style={{ fontSize: '13px', color: textMuted, padding: '12px 0' }}>No transactions recorded</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: cardBg, borderRadius: '16px', padding: '24px', width: '420px', maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Record Transaction</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setTransactionForm((f) => ({ ...f, type: 'buy' }))} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: transactionForm.type === 'buy' ? '#dcfce7' : (isDarkMode ? '#1e293b' : '#f1f5f9'), color: transactionForm.type === 'buy' ? '#166534' : textMuted }}>Buy</button>
                <button onClick={() => setTransactionForm((f) => ({ ...f, type: 'sell' }))} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: transactionForm.type === 'sell' ? '#fee2e2' : (isDarkMode ? '#1e293b' : '#f1f5f9'), color: transactionForm.type === 'sell' ? '#991b1b' : textMuted }}>Sell</button>
              </div>
              <input placeholder="Symbol (e.g. AAPL)" value={transactionForm.symbol} onChange={(e) => setTransactionForm((f) => ({ ...f, symbol: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <input placeholder="Number of shares" type="number" value={transactionForm.shares} onChange={(e) => setTransactionForm((f) => ({ ...f, shares: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <input placeholder="Price per share" type="number" value={transactionForm.price} onChange={(e) => setTransactionForm((f) => ({ ...f, price: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <input placeholder="Notes (optional)" value={transactionForm.notes} onChange={(e) => setTransactionForm((f) => ({ ...f, notes: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              {transactionForm.shares && transactionForm.price && (
                <div style={{ fontSize: '14px', color: textMuted, padding: '8px 0' }}>
                  Total: {formatCurrency(parseFloat(transactionForm.shares) * parseFloat(transactionForm.price))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setShowTransactionModal(false)} style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: 'transparent', color: textColor, cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                <button onClick={handleAddTransaction} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: accentColor, color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Save Transaction</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: cardBg, borderRadius: '16px', padding: '24px', width: '400px', maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Create Price Alert</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Symbol (e.g. AAPL)" value={alertForm.symbol} onChange={(e) => setAlertForm((f) => ({ ...f, symbol: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <select value={alertForm.type} onChange={(e) => setAlertForm((f) => ({ ...f, type: e.target.value }))} aria-label="Alert type" style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }}>
                <option value="price_above">Price Above</option>
                <option value="price_below">Price Below</option>
                <option value="percent_change">% Change</option>
              </select>
              <input placeholder={alertForm.type === 'percent_change' ? 'Percentage (e.g. 5)' : 'Price threshold'} type="number" value={alertForm.threshold} onChange={(e) => setAlertForm((f) => ({ ...f, threshold: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setShowAlertModal(false)} style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: 'transparent', color: textColor, cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                <button onClick={handleAddAlert} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: accentColor, color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Create Alert</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Modal */}
      {showWatchlistModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: cardBg, borderRadius: '16px', padding: '24px', width: '400px', maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Add to Watchlist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Symbol (e.g. NVDA)" value={watchlistForm.symbol} onChange={(e) => setWatchlistForm((f) => ({ ...f, symbol: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <input placeholder="Company name" value={watchlistForm.name} onChange={(e) => setWatchlistForm((f) => ({ ...f, name: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <input placeholder="Target price (optional)" type="number" value={watchlistForm.targetPrice} onChange={(e) => setWatchlistForm((f) => ({ ...f, targetPrice: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <input placeholder="Notes (optional)" value={watchlistForm.notes} onChange={(e) => setWatchlistForm((f) => ({ ...f, notes: e.target.value }))} style={{ padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setShowWatchlistModal(false)} style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: 'transparent', color: textColor, cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                <button onClick={handleAddToWatchlist} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: accentColor, color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Add to Watchlist</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: cardBg, borderRadius: '16px', padding: '24px', width: '420px', maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Portfolio Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Currency</label>
                <select value={portfolioSettings.currency} onChange={(e) => setPortfolioSettings((s) => ({ ...s, currency: e.target.value }))} aria-label="Currency" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px' }}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Refresh Interval (seconds)</label>
                <input type="number" value={portfolioSettings.refreshInterval} onChange={(e) => setPortfolioSettings((s) => ({ ...s, refreshInterval: parseInt(e.target.value) || 30 }))} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bgColor, color: textColor, fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>Show Percentages</span>
                <button onClick={() => setPortfolioSettings((s) => ({ ...s, showPercentages: !s.showPercentages }))} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: portfolioSettings.showPercentages ? accentColor : '#cbd5e1', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '2px', left: portfolioSettings.showPercentages ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>Compact View</span>
                <button onClick={() => setPortfolioSettings((s) => ({ ...s, compactView: !s.compactView }))} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: portfolioSettings.compactView ? accentColor : '#cbd5e1', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '2px', left: portfolioSettings.compactView ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>Alert Sound</span>
                <button onClick={() => setPortfolioSettings((s) => ({ ...s, alertSound: !s.alertSound }))} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: portfolioSettings.alertSound ? accentColor : '#cbd5e1', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '2px', left: portfolioSettings.alertSound ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              <button onClick={() => setShowSettingsPanel(false)} style={{ padding: '10px', border: 'none', borderRadius: '8px', background: accentColor, color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
