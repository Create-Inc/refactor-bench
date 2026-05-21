import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#f97316' },
  { id: 'transport', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
  { id: 'housing', name: 'Housing', icon: '🏠', color: '#8b5cf6' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#eab308' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#14b8a6' },
  { id: 'health', name: 'Health', icon: '🏥', color: '#ef4444' },
  { id: 'income', name: 'Income', icon: '💰', color: '#22c55e' },
  { id: 'savings', name: 'Savings', icon: '🏦', color: '#6366f1' },
  { id: 'other', name: 'Other', icon: '📦', color: '#94a3b8' },
];

const ACCOUNTS = [
  { id: 'checking', name: 'Main Checking', type: 'checking', icon: '🏦', balance: 4250.00 },
  { id: 'savings_acc', name: 'Savings Account', type: 'savings', icon: '💎', balance: 12500.00 },
  { id: 'credit', name: 'Credit Card', type: 'credit', icon: '💳', balance: -1820.50 },
  { id: 'cash', name: 'Cash', type: 'cash', icon: '💵', balance: 340.00 },
];

const INITIAL_TRANSACTIONS = [
  { id: 't1', description: 'Monthly salary', amount: 5200.00, type: 'income', category: 'income', account: 'checking', date: '2025-01-01', notes: 'January salary deposit', recurring: true },
  { id: 't2', description: 'Rent payment', amount: -1500.00, type: 'expense', category: 'housing', account: 'checking', date: '2025-01-02', notes: 'Monthly rent', recurring: true },
  { id: 't3', description: 'Grocery store', amount: -87.50, type: 'expense', category: 'food', account: 'credit', date: '2025-01-03', notes: '', recurring: false },
  { id: 't4', description: 'Electric bill', amount: -142.30, type: 'expense', category: 'utilities', account: 'checking', date: '2025-01-04', notes: 'January electric', recurring: true },
  { id: 't5', description: 'Gas station', amount: -45.00, type: 'expense', category: 'transport', account: 'credit', date: '2025-01-05', notes: '', recurring: false },
  { id: 't6', description: 'Movie tickets', amount: -32.00, type: 'expense', category: 'entertainment', account: 'credit', date: '2025-01-06', notes: 'Weekend movie', recurring: false },
  { id: 't7', description: 'Freelance payment', amount: 800.00, type: 'income', category: 'income', account: 'checking', date: '2025-01-07', notes: 'Web design project', recurring: false },
  { id: 't8', description: 'Amazon order', amount: -65.99, type: 'expense', category: 'shopping', account: 'credit', date: '2025-01-08', notes: 'Kitchen supplies', recurring: false },
  { id: 't9', description: 'Doctor visit copay', amount: -30.00, type: 'expense', category: 'health', account: 'checking', date: '2025-01-09', notes: 'Annual checkup', recurring: false },
  { id: 't10', description: 'Restaurant dinner', amount: -56.75, type: 'expense', category: 'food', account: 'credit', date: '2025-01-10', notes: 'Birthday dinner', recurring: false },
  { id: 't11', description: 'Internet bill', amount: -79.99, type: 'expense', category: 'utilities', account: 'checking', date: '2025-01-10', notes: 'Monthly internet', recurring: true },
  { id: 't12', description: 'Savings transfer', amount: -500.00, type: 'transfer', category: 'savings', account: 'checking', date: '2025-01-11', notes: 'Monthly savings', recurring: true },
  { id: 't13', description: 'Coffee shop', amount: -12.50, type: 'expense', category: 'food', account: 'cash', date: '2025-01-12', notes: '', recurring: false },
  { id: 't14', description: 'Gym membership', amount: -49.99, type: 'expense', category: 'health', account: 'checking', date: '2025-01-13', notes: 'Monthly gym', recurring: true },
  { id: 't15', description: 'Uber ride', amount: -18.50, type: 'expense', category: 'transport', account: 'credit', date: '2025-01-14', notes: 'To airport', recurring: false },
  { id: 't16', description: 'Clothing store', amount: -124.00, type: 'expense', category: 'shopping', account: 'credit', date: '2025-01-15', notes: 'Winter jacket', recurring: false },
  { id: 't17', description: 'Phone bill', amount: -65.00, type: 'expense', category: 'utilities', account: 'checking', date: '2025-01-15', notes: 'Monthly phone', recurring: true },
  { id: 't18', description: 'Side project income', amount: 350.00, type: 'income', category: 'income', account: 'checking', date: '2025-01-16', notes: 'App store revenue', recurring: false },
  { id: 't19', description: 'Parking fee', amount: -15.00, type: 'expense', category: 'transport', account: 'cash', date: '2025-01-17', notes: '', recurring: false },
  { id: 't20', description: 'Streaming subscription', amount: -15.99, type: 'expense', category: 'entertainment', account: 'credit', date: '2025-01-18', notes: 'Netflix', recurring: true },
];

const INITIAL_BUDGETS = [
  { id: 'b1', category: 'food', limit: 400.00, period: 'monthly' },
  { id: 'b2', category: 'transport', limit: 200.00, period: 'monthly' },
  { id: 'b3', category: 'entertainment', limit: 150.00, period: 'monthly' },
  { id: 'b4', category: 'shopping', limit: 300.00, period: 'monthly' },
  { id: 'b5', category: 'utilities', limit: 350.00, period: 'monthly' },
  { id: 'b6', category: 'health', limit: 200.00, period: 'monthly' },
];

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function BudgetTracker() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(null);
  const [dateRangeStart, setDateRangeStart] = useState('2025-01-01');
  const [dateRangeEnd, setDateRangeEnd] = useState('2025-01-31');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('budgetTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedTransactions = localStorage.getItem('budgetTransactions');
    if (savedTransactions) {
      try { setTransactions(JSON.parse(savedTransactions)); } catch (e) { console.error('Failed to parse transactions'); }
    }

    const savedAccounts = localStorage.getItem('budgetAccounts');
    if (savedAccounts) {
      try { setAccounts(JSON.parse(savedAccounts)); } catch (e) { console.error('Failed to parse accounts'); }
    }

    const savedBudgets = localStorage.getItem('budgetBudgets');
    if (savedBudgets) {
      try { setBudgets(JSON.parse(savedBudgets)); } catch (e) { console.error('Failed to parse budgets'); }
    }

    const savedView = localStorage.getItem('budgetView');
    if (savedView) setActiveView(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem('budgetTransactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgetAccounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('budgetBudgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedTransaction(null);
        setShowAddTransaction(false);
        setShowAddBudget(false);
        setShowEditAccount(null);
        setShowNotifications(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowAddTransaction(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    setNotifications(prev => [{ id: Date.now().toString(), message, type, timestamp: Date.now(), read: false }, ...prev]);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('budgetTheme', next ? 'dark' : 'light');
      return next;
    });
  };

  const getCategoryById = (id) => CATEGORIES.find(c => c.id === id);
  const getAccountById = (id) => accounts.find(a => a.id === id);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.description.toLowerCase().includes(q) && !t.notes.toLowerCase().includes(q)) return false;
      }
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterAccount !== 'all' && t.account !== filterAccount) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (dateRangeStart && t.date < dateRangeStart) return false;
      if (dateRangeEnd && t.date > dateRangeEnd) return false;
      return true;
    });
  }, [transactions, searchQuery, filterCategory, filterAccount, filterType, dateRangeStart, dateRangeEnd]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortBy === 'amount') cmp = Math.abs(a.amount) - Math.abs(b.amount);
      else if (sortBy === 'description') cmp = a.description.localeCompare(b.description);
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category);
      return sortDirection === 'desc' ? -cmp : cmp;
    });
  }, [filteredTransactions, sortBy, sortDirection]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0), [transactions]);
  const netCashFlow = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  const totalBalance = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);

  const getCategorySpending = useCallback((categoryId) => {
    return transactions
      .filter(t => t.category === categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const getBudgetStatus = useCallback((budget) => {
    const spent = getCategorySpending(budget.category);
    const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    return { spent, remaining: budget.limit - spent, percentage: Math.min(pct, 100), overBudget: spent > budget.limit };
  }, [getCategorySpending]);

  const addTransaction = (data) => {
    const newTx = {
      id: `t${Date.now()}`,
      ...data,
      amount: data.type === 'expense' ? -Math.abs(parseFloat(data.amount)) : Math.abs(parseFloat(data.amount)),
    };
    setTransactions(prev => [...prev, newTx]);
    setShowAddTransaction(false);
    addNotification(`Transaction "${newTx.description}" added`, 'success');

    // Update account balance
    setAccounts(prev => prev.map(a => a.id === newTx.account ? { ...a, balance: a.balance + newTx.amount } : a));
  };

  const deleteTransaction = (txId) => {
    if (window.confirm('Delete this transaction?')) {
      const tx = transactions.find(t => t.id === txId);
      setTransactions(prev => prev.filter(t => t.id !== txId));
      setSelectedTransaction(null);
      if (tx) {
        setAccounts(prev => prev.map(a => a.id === tx.account ? { ...a, balance: a.balance - tx.amount } : a));
        addNotification(`Transaction "${tx.description}" deleted`, 'warning');
      }
    }
  };

  const updateTransaction = (txId, updates) => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, ...updates } : t));
  };

  const addBudget = (data) => {
    const newBudget = { id: `b${Date.now()}`, category: data.category, limit: parseFloat(data.limit), period: data.period || 'monthly' };
    setBudgets(prev => [...prev, newBudget]);
    setShowAddBudget(false);
    addNotification(`Budget for ${getCategoryById(data.category)?.name} added`, 'success');
  };

  const deleteBudget = (budgetId) => {
    if (window.confirm('Delete this budget?')) {
      setBudgets(prev => prev.filter(b => b.id !== budgetId));
      addNotification('Budget deleted', 'warning');
    }
  };

  const updateBudgetLimit = (budgetId, newLimit) => {
    setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, limit: parseFloat(newLimit) } : b));
    setEditingBudgetId(null);
  };

  const updateAccountName = (accountId, newName) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, name: newName } : a));
    setShowEditAccount(null);
    addNotification('Account updated', 'info');
  };

  const getSpendingByCategory = useMemo(() => {
    const spending = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      if (!spending[t.category]) spending[t.category] = 0;
      spending[t.category] += Math.abs(t.amount);
    });
    return Object.entries(spending)
      .map(([categoryId, amount]) => ({ category: getCategoryById(categoryId), amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const getMonthlyTrend = useMemo(() => {
    const months = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!months[month]) months[month] = { income: 0, expenses: 0 };
      if (t.type === 'income') months[month].income += t.amount;
      else if (t.type === 'expense') months[month].expenses += Math.abs(t.amount);
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => ({ month, ...data }));
  }, [transactions]);

  const exportTransactionsCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account', 'Notes'];
    const rows = sortedTransactions.map(t => [
      t.date,
      t.description,
      t.amount.toFixed(2),
      t.type,
      getCategoryById(t.category)?.name || t.category,
      getAccountById(t.account)?.name || t.account,
      t.notes,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Transactions exported to CSV', 'success');
  };

  const formatCurrency = (amount) => CURRENCY_FORMAT.format(amount);

  const bgColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const secondaryText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#6366f1';
  const successColor = '#22c55e';
  const dangerColor = '#ef4444';
  const warningColor = '#f59e0b';

  const overBudgetAlerts = budgets.filter(b => getBudgetStatus(b).overBudget);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? '60px' : '240px', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? '16px 12px' : '20px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>💰 BudgetWise</h1>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText, padding: '4px' }} aria-label="Toggle sidebar">
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'transactions', icon: '💳', label: 'Transactions' },
            { id: 'budgets', icon: '🎯', label: 'Budgets' },
            { id: 'accounts', icon: '🏦', label: 'Accounts' },
            { id: 'reports', icon: '📈', label: 'Reports' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); localStorage.setItem('budgetView', item.id); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', marginBottom: '4px',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                backgroundColor: activeView === item.id ? (isDarkMode ? '#334155' : '#eef2ff') : 'transparent',
                color: activeView === item.id ? accentColor : textColor,
                fontWeight: activeView === item.id ? 600 : 400, textAlign: 'left',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
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
            <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Net Worth</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: totalBalance >= 0 ? successColor : dangerColor }}>
              {formatCurrency(totalBalance)}
            </div>
            {overBudgetAlerts.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: warningColor }}>
                ⚠️ {overBudgetAlerts.length} budget{overBudgetAlerts.length > 1 ? 's' : ''} exceeded
              </div>
            )}
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
                placeholder="Search transactions... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb', color: textColor, outline: 'none' }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowAddTransaction(true)} style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>+</span> Add Transaction
            </button>

            <button onClick={toggleTheme} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label="Toggle theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div ref={notificationRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', position: 'relative' }} aria-label="Notifications">
                🔔
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: dangerColor, borderRadius: '50%' }} />
                )}
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, top: '100%', width: '320px', backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '400px', overflow: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}`, fontWeight: 600, fontSize: '14px' }}>
                    Notifications
                    {notifications.length > 0 && (
                      <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} style={{ float: 'right', fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: secondaryText, fontSize: '13px' }}>No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${borderColor}`, backgroundColor: n.read ? 'transparent' : (isDarkMode ? '#334155' : '#f0f4ff'), fontSize: '13px' }}>
                        <div>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Financial Overview</h2>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Balance', value: formatCurrency(totalBalance), icon: '💰', color: totalBalance >= 0 ? successColor : dangerColor },
                  { label: 'Income', value: formatCurrency(totalIncome), icon: '📈', color: successColor },
                  { label: 'Expenses', value: formatCurrency(totalExpenses), icon: '📉', color: dangerColor },
                  { label: 'Net Cash Flow', value: formatCurrency(netCashFlow), icon: '💹', color: netCashFlow >= 0 ? successColor : dangerColor },
                ].map(card => (
                  <div key={card.label} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{card.icon}</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: card.color }}>{card.value}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: secondaryText }}>{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Budget Alerts */}
              {overBudgetAlerts.length > 0 && (
                <div style={{ backgroundColor: isDarkMode ? '#451a03' : '#fef3c7', borderRadius: '12px', padding: '16px', border: `1px solid ${warningColor}40`, marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: warningColor, marginBottom: '8px' }}>⚠️ Budget Alerts</h3>
                  {overBudgetAlerts.map(b => {
                    const status = getBudgetStatus(b);
                    const cat = getCategoryById(b.category);
                    return (
                      <div key={b.id} style={{ fontSize: '13px', marginBottom: '4px', color: textColor }}>
                        {cat?.icon} {cat?.name}: {formatCurrency(status.spent)} of {formatCurrency(b.limit)} ({Math.round(status.percentage)}%)
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Spending by Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Spending by Category</h3>
                  {getSpendingByCategory.slice(0, 6).map(item => {
                    const pct = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
                    return (
                      <div key={item.category?.id} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{item.category?.icon} {item.category?.name}</span>
                          <span style={{ color: secondaryText }}>{formatCurrency(item.amount)} ({Math.round(pct)}%)</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#334155' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.category?.color || accentColor, borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Recent Transactions</h3>
                  {transactions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(tx => {
                    const cat = getCategoryById(tx.category);
                    return (
                      <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                        <span style={{ fontSize: '18px' }}>{cat?.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{tx.description}</div>
                          <div style={{ fontSize: '11px', color: secondaryText }}>{tx.date}</div>
                        </div>
                        <span style={{ fontWeight: 600, color: tx.amount >= 0 ? successColor : dangerColor }}>
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Summary */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Account Balances</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {accounts.map(acc => (
                    <div key={acc.id} style={{ padding: '14px', borderRadius: '8px', border: `1px solid ${borderColor}`, backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '20px' }}>{acc.icon}</span>
                        <span style={{ fontWeight: 500, fontSize: '13px' }}>{acc.name}</span>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: acc.balance >= 0 ? successColor : dangerColor }}>
                        {formatCurrency(acc.balance)}
                      </div>
                      <div style={{ fontSize: '11px', color: secondaryText, marginTop: '2px', textTransform: 'capitalize' }}>{acc.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transactions View */}
          {activeView === 'transactions' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Transactions</h2>
                <button onClick={exportTransactionsCSV} style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                  📥 Export CSV
                </button>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category" style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: cardBg, color: textColor }}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} aria-label="Filter by account" style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: cardBg, color: textColor }}>
                  <option value="all">All Accounts</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>

                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} aria-label="Filter by type" style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: cardBg, color: textColor }}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                  <label htmlFor="dateStart" style={{ color: secondaryText }}>From:</label>
                  <input id="dateStart" type="date" value={dateRangeStart} onChange={(e) => setDateRangeStart(e.target.value)} style={{ padding: '6px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor }} />
                  <label htmlFor="dateEnd" style={{ color: secondaryText }}>To:</label>
                  <input id="dateEnd" type="date" value={dateRangeEnd} onChange={(e) => setDateRangeEnd(e.target.value)} style={{ padding: '6px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor }} />
                </div>
              </div>

              {/* Sort Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: secondaryText }}>Sort by:</span>
                {['date', 'amount', 'description', 'category'].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      if (sortBy === s) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      else { setSortBy(s); setSortDirection('desc'); }
                    }}
                    style={{
                      padding: '4px 10px', borderRadius: '6px', border: `1px solid ${sortBy === s ? accentColor : borderColor}`,
                      backgroundColor: sortBy === s ? (isDarkMode ? '#334155' : '#eef2ff') : 'transparent',
                      color: sortBy === s ? accentColor : textColor, cursor: 'pointer', fontSize: '12px',
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}{sortBy === s && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: secondaryText }}>
                  {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Transaction Table */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}`, textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Description</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Category</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText }}>Account</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: secondaryText, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map(tx => {
                      const cat = getCategoryById(tx.category);
                      const acc = getAccountById(tx.account);
                      return (
                        <tr
                          key={tx.id}
                          onClick={() => setSelectedTransaction(tx)}
                          style={{ borderBottom: `1px solid ${borderColor}`, cursor: 'pointer' }}
                        >
                          <td style={{ padding: '10px 16px' }}>{tx.date}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ fontWeight: 500 }}>{tx.description}</div>
                            {tx.notes && <div style={{ fontSize: '11px', color: secondaryText }}>{tx.notes}</div>}
                            {tx.recurring && <span style={{ fontSize: '10px', color: accentColor, marginLeft: '4px' }}>🔄 Recurring</span>}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{cat?.icon}</span> {cat?.name}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{acc?.icon}</span> {acc?.name}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: tx.amount >= 0 ? successColor : dangerColor }}>
                            {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {sortedTransactions.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: secondaryText }}>No transactions match your filters</div>
                )}
              </div>
            </div>
          )}

          {/* Budgets View */}
          {activeView === 'budgets' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Budgets</h2>
                <button onClick={() => setShowAddBudget(true)} style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  + Add Budget
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {budgets.map(budget => {
                  const status = getBudgetStatus(budget);
                  const cat = getCategoryById(budget.category);
                  const barColor = status.overBudget ? dangerColor : status.percentage > 80 ? warningColor : successColor;
                  return (
                    <div key={budget.id} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${status.overBudget ? dangerColor + '40' : borderColor}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>{cat?.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{cat?.name}</div>
                            <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'capitalize' }}>{budget.period}</div>
                          </div>
                        </div>
                        <button onClick={() => deleteBudget(budget.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: secondaryText, fontSize: '16px' }} aria-label={`Delete ${cat?.name} budget`}>×</button>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span>Spent: <strong>{formatCurrency(status.spent)}</strong></span>
                          {editingBudgetId === budget.id ? (
                            <input
                              type="number"
                              defaultValue={budget.limit}
                              onBlur={(e) => updateBudgetLimit(budget.id, e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                              style={{ width: '80px', padding: '2px 6px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
                              autoFocus
                            />
                          ) : (
                            <span onClick={() => setEditingBudgetId(budget.id)} style={{ cursor: 'pointer' }} title="Click to edit limit">
                              Limit: <strong>{formatCurrency(budget.limit)}</strong>
                            </span>
                          )}
                        </div>
                        <div style={{ height: '8px', backgroundColor: isDarkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(status.percentage, 100)}%`, height: '100%', backgroundColor: barColor, borderRadius: '4px', transition: 'width 0.3s' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: status.overBudget ? dangerColor : secondaryText }}>
                        <span>{Math.round(status.percentage)}% used</span>
                        <span>{status.overBudget ? `Over by ${formatCurrency(Math.abs(status.remaining))}` : `${formatCurrency(status.remaining)} left`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {budgets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>No budgets set up yet</div>
                  <div style={{ fontSize: '13px' }}>Click "Add Budget" to start tracking your spending limits</div>
                </div>
              )}
            </div>
          )}

          {/* Accounts View */}
          {activeView === 'accounts' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Accounts</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {accounts.map(acc => {
                  const accTransactions = transactions.filter(t => t.account === acc.id);
                  const accIncome = accTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
                  const accExpenses = accTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
                  return (
                    <div key={acc.id} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '28px' }}>{acc.icon}</span>
                          <div>
                            {showEditAccount === acc.id ? (
                              <input
                                type="text"
                                defaultValue={acc.name}
                                onBlur={(e) => updateAccountName(acc.id, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                                style={{ fontSize: '15px', fontWeight: 600, border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '2px 6px', backgroundColor: 'transparent', color: textColor }}
                                autoFocus
                              />
                            ) : (
                              <div style={{ fontWeight: 600, fontSize: '15px', cursor: 'pointer' }} onClick={() => setShowEditAccount(acc.id)}>{acc.name}</div>
                            )}
                            <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'capitalize' }}>{acc.type}</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '24px', fontWeight: 700, color: acc.balance >= 0 ? successColor : dangerColor, marginBottom: '12px' }}>
                        {formatCurrency(acc.balance)}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 0', borderTop: `1px solid ${borderColor}` }}>
                        <div>
                          <div style={{ color: secondaryText }}>Income</div>
                          <div style={{ fontWeight: 600, color: successColor }}>{formatCurrency(accIncome)}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: secondaryText }}>Expenses</div>
                          <div style={{ fontWeight: 600, color: dangerColor }}>{formatCurrency(accExpenses)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: secondaryText }}>Transactions</div>
                          <div style={{ fontWeight: 600 }}>{accTransactions.length}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Account Totals */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Account Summary</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}`, textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', color: secondaryText, fontWeight: 600 }}>Account</th>
                      <th style={{ padding: '8px 12px', color: secondaryText, fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '8px 12px', color: secondaryText, fontWeight: 600, textAlign: 'right' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(acc => (
                      <tr key={acc.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                        <td style={{ padding: '8px 12px' }}>{acc.icon} {acc.name}</td>
                        <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{acc.type}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: acc.balance >= 0 ? successColor : dangerColor }}>{formatCurrency(acc.balance)}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 700 }}>
                      <td colSpan={2} style={{ padding: '10px 12px' }}>Total</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: totalBalance >= 0 ? successColor : dangerColor }}>{formatCurrency(totalBalance)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeView === 'reports' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Financial Reports</h2>

              {/* Income vs Expenses Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: secondaryText, marginBottom: '8px' }}>Total Income</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: successColor }}>{formatCurrency(totalIncome)}</div>
                </div>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: secondaryText, marginBottom: '8px' }}>Total Expenses</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: dangerColor }}>{formatCurrency(totalExpenses)}</div>
                </div>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: secondaryText, marginBottom: '8px' }}>Savings Rate</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: accentColor }}>
                    {totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Expense Breakdown</h3>
                  {getSpendingByCategory.map(item => (
                    <div key={item.category?.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                      <span style={{ fontSize: '18px' }}>{item.category?.icon}</span>
                      <span style={{ flex: 1 }}>{item.category?.name}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</span>
                      <span style={{ fontSize: '11px', color: secondaryText, width: '40px', textAlign: 'right' }}>
                        {totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Budget vs Actual</h3>
                  {budgets.map(budget => {
                    const status = getBudgetStatus(budget);
                    const cat = getCategoryById(budget.category);
                    return (
                      <div key={budget.id} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{cat?.icon} {cat?.name}</span>
                          <span style={{ color: status.overBudget ? dangerColor : secondaryText }}>
                            {formatCurrency(status.spent)} / {formatCurrency(budget.limit)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', height: '8px' }}>
                          <div style={{ flex: Math.min(status.percentage, 100), backgroundColor: status.overBudget ? dangerColor : successColor, borderRadius: '4px 0 0 4px', height: '100%' }} />
                          {!status.overBudget && (
                            <div style={{ flex: 100 - status.percentage, backgroundColor: isDarkMode ? '#334155' : '#e5e7eb', borderRadius: '0 4px 4px 0', height: '100%' }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Trend */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Monthly Trend</h3>
                {getMonthlyTrend.map(month => (
                  <div key={month.month} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                    <span style={{ width: '80px', fontWeight: 500 }}>{month.month}</span>
                    <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <div style={{ width: `${totalIncome > 0 ? (month.income / totalIncome) * 100 : 0}%`, height: '12px', backgroundColor: successColor + '60', borderRadius: '3px', minWidth: '2px' }} />
                      <span style={{ fontSize: '11px', color: successColor }}>{formatCurrency(month.income)}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <div style={{ width: `${totalExpenses > 0 ? (month.expenses / totalExpenses) * 100 : 0}%`, height: '12px', backgroundColor: dangerColor + '60', borderRadius: '3px', minWidth: '2px' }} />
                      <span style={{ fontSize: '11px', color: dangerColor }}>{formatCurrency(month.expenses)}</span>
                    </div>
                    <span style={{ width: '90px', textAlign: 'right', fontWeight: 600, color: month.income - month.expenses >= 0 ? successColor : dangerColor }}>
                      {formatCurrency(month.income - month.expenses)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recurring Expenses */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, marginTop: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Recurring Expenses</h3>
                {transactions.filter(t => t.recurring && t.type === 'expense').map(tx => {
                  const cat = getCategoryById(tx.category);
                  return (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                      <span style={{ fontSize: '18px' }}>{cat?.icon}</span>
                      <span style={{ flex: 1 }}>{tx.description}</span>
                      <span style={{ fontWeight: 600, color: dangerColor }}>{formatCurrency(tx.amount)}</span>
                      <span style={{ fontSize: '11px', color: secondaryText }}>Monthly</span>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '13px', fontWeight: 600 }}>
                  <span>Total Monthly Recurring</span>
                  <span style={{ color: dangerColor }}>
                    {formatCurrency(transactions.filter(t => t.recurring && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setSelectedTransaction(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px', textTransform: 'capitalize' }}>{selectedTransaction.type}</div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{selectedTransaction.description}</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => deleteTransaction(selectedTransaction.id)} style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: dangerColor, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                <button onClick={() => setSelectedTransaction(null)} style={{ padding: '6px 12px', backgroundColor: isDarkMode ? '#334155' : '#f3f4f6', color: textColor, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
            </div>

            <div style={{ fontSize: '32px', fontWeight: 700, color: selectedTransaction.amount >= 0 ? successColor : dangerColor, marginBottom: '20px' }}>
              {formatCurrency(selectedTransaction.amount)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <div style={{ color: secondaryText, fontSize: '11px', marginBottom: '2px' }}>Date</div>
                <div>{selectedTransaction.date}</div>
              </div>
              <div>
                <div style={{ color: secondaryText, fontSize: '11px', marginBottom: '2px' }}>Category</div>
                <div>{getCategoryById(selectedTransaction.category)?.icon} {getCategoryById(selectedTransaction.category)?.name}</div>
              </div>
              <div>
                <div style={{ color: secondaryText, fontSize: '11px', marginBottom: '2px' }}>Account</div>
                <div>{getAccountById(selectedTransaction.account)?.icon} {getAccountById(selectedTransaction.account)?.name}</div>
              </div>
              <div>
                <div style={{ color: secondaryText, fontSize: '11px', marginBottom: '2px' }}>Recurring</div>
                <div>{selectedTransaction.recurring ? '🔄 Yes' : 'No'}</div>
              </div>
            </div>

            {selectedTransaction.notes && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ color: secondaryText, fontSize: '11px', marginBottom: '4px' }}>Notes</div>
                <div style={{ fontSize: '13px', padding: '10px', backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                  {selectedTransaction.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowAddTransaction(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Add Transaction</h2>
              <button onClick={() => setShowAddTransaction(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              addTransaction({
                description: fd.get('description'),
                amount: fd.get('amount'),
                type: fd.get('type'),
                category: fd.get('category'),
                account: fd.get('account'),
                date: fd.get('date'),
                notes: fd.get('notes') || '',
                recurring: fd.get('recurring') === 'on',
              });
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Description *</label>
                <input name="description" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Amount *</label>
                  <input name="amount" type="number" step="0.01" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Type *</label>
                  <select name="type" defaultValue="expense" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Category *</label>
                  <select name="category" defaultValue="other" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Account *</label>
                  <select name="account" defaultValue="checking" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Date *</label>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input name="recurring" type="checkbox" />
                    Recurring
                  </label>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Notes</label>
                <textarea name="notes" rows={2} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddTransaction(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowAddBudget(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Add Budget</h2>
              <button onClick={() => setShowAddBudget(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              addBudget({ category: fd.get('category'), limit: fd.get('limit'), period: fd.get('period') });
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Category *</label>
                <select name="category" required style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                  {CATEGORIES.filter(c => c.id !== 'income' && c.id !== 'savings').map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Limit *</label>
                  <input name="limit" type="number" step="0.01" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Period</label>
                  <select name="period" defaultValue="monthly" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddBudget(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Add Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
