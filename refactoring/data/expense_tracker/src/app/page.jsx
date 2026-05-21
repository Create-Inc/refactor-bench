import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  JPY: { symbol: '¥', rate: 149.5 },
  CAD: { symbol: 'C$', rate: 1.36 },
};

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#ef4444' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#f97316' },
  { id: 'housing', name: 'Housing', icon: '🏠', color: '#eab308' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#22c55e' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#3b82f6' },
  { id: 'health', name: 'Health', icon: '🏥', color: '#8b5cf6' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: 'education', name: 'Education', icon: '📚', color: '#06b6d4' },
  { id: 'savings', name: 'Savings', icon: '🏦', color: '#14b8a6' },
  { id: 'income', name: 'Income', icon: '💰', color: '#10b981' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6b7280' },
];

const RECURRENCE_OPTIONS = ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'];

const INITIAL_TRANSACTIONS = [
  { id: 't1', description: 'Monthly Salary', amount: 5000, type: 'income', category: 'income', date: '2025-01-01', currency: 'USD', recurrence: 'monthly', tags: ['salary', 'work'], notes: 'Regular monthly salary deposit' },
  { id: 't2', description: 'Rent Payment', amount: 1500, type: 'expense', category: 'housing', date: '2025-01-02', currency: 'USD', recurrence: 'monthly', tags: ['rent', 'housing'], notes: 'Apartment rent for January' },
  { id: 't3', description: 'Grocery Shopping', amount: 85.50, type: 'expense', category: 'food', date: '2025-01-03', currency: 'USD', recurrence: 'weekly', tags: ['groceries'], notes: '' },
  { id: 't4', description: 'Electric Bill', amount: 120, type: 'expense', category: 'utilities', date: '2025-01-05', currency: 'USD', recurrence: 'monthly', tags: ['electricity'], notes: 'Winter rate is higher' },
  { id: 't5', description: 'Netflix Subscription', amount: 15.99, type: 'expense', category: 'entertainment', date: '2025-01-05', currency: 'USD', recurrence: 'monthly', tags: ['streaming', 'subscription'], notes: '' },
  { id: 't6', description: 'Gas Station', amount: 45, type: 'expense', category: 'transport', date: '2025-01-06', currency: 'USD', recurrence: 'none', tags: ['fuel'], notes: '' },
  { id: 't7', description: 'Doctor Visit', amount: 150, type: 'expense', category: 'health', date: '2025-01-07', currency: 'USD', recurrence: 'none', tags: ['medical', 'copay'], notes: 'Annual checkup' },
  { id: 't8', description: 'Online Course', amount: 49.99, type: 'expense', category: 'education', date: '2025-01-08', currency: 'USD', recurrence: 'none', tags: ['learning', 'programming'], notes: 'React Advanced Patterns course' },
  { id: 't9', description: 'Freelance Project', amount: 800, type: 'income', category: 'income', date: '2025-01-10', currency: 'USD', recurrence: 'none', tags: ['freelance', 'side-income'], notes: 'Website redesign project' },
  { id: 't10', description: 'New Headphones', amount: 199.99, type: 'expense', category: 'shopping', date: '2025-01-12', currency: 'USD', recurrence: 'none', tags: ['electronics', 'audio'], notes: 'Sony WH-1000XM5' },
  { id: 't11', description: 'Emergency Fund Transfer', amount: 500, type: 'expense', category: 'savings', date: '2025-01-15', currency: 'USD', recurrence: 'monthly', tags: ['savings', 'emergency'], notes: 'Monthly emergency fund contribution' },
  { id: 't12', description: 'Restaurant Dinner', amount: 65, type: 'expense', category: 'food', date: '2025-01-18', currency: 'USD', recurrence: 'none', tags: ['dining', 'restaurant'], notes: 'Birthday dinner' },
  { id: 't13', description: 'Gym Membership', amount: 40, type: 'expense', category: 'health', date: '2025-01-20', currency: 'USD', recurrence: 'monthly', tags: ['fitness', 'gym'], notes: '' },
  { id: 't14', description: 'Book Purchase', amount: 24.99, type: 'expense', category: 'education', date: '2025-01-22', currency: 'EUR', recurrence: 'none', tags: ['books', 'reading'], notes: 'Design Patterns in JavaScript' },
  { id: 't15', description: 'Uber Ride', amount: 18.50, type: 'expense', category: 'transport', date: '2025-01-25', currency: 'USD', recurrence: 'none', tags: ['rideshare'], notes: '' },
];

const INITIAL_BUDGETS = [
  { id: 'b1', category: 'food', monthlyLimit: 400, color: '#ef4444' },
  { id: 'b2', category: 'transport', monthlyLimit: 200, color: '#f97316' },
  { id: 'b3', category: 'entertainment', monthlyLimit: 100, color: '#3b82f6' },
  { id: 'b4', category: 'shopping', monthlyLimit: 300, color: '#ec4899' },
  { id: 'b5', category: 'health', monthlyLimit: 250, color: '#8b5cf6' },
];

const INITIAL_SAVINGS_GOALS = [
  { id: 'sg1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 3500, deadline: '2025-12-31', icon: '🛡️' },
  { id: 'sg2', name: 'Vacation Fund', targetAmount: 3000, currentAmount: 800, deadline: '2025-06-30', icon: '✈️' },
  { id: 'sg3', name: 'New Laptop', targetAmount: 2000, currentAmount: 1200, deadline: '2025-04-30', icon: '💻' },
];

function formatCurrency(amount, currencyCode = 'USD') {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return `${currency.symbol}${Math.abs(amount).toFixed(2)}`;
}

function convertToUSD(amount, fromCurrency) {
  const rate = CURRENCIES[fromCurrency]?.rate || 1;
  return amount / rate;
}

function parseDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState(INITIAL_SAVINGS_GOALS);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRangeStart, setDateRangeStart] = useState('2025-01-01');
  const [dateRangeEnd, setDateRangeEnd] = useState('2025-01-31');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [csvData, setCsvData] = useState('');
  const [bulkSelection, setBulkSelection] = useState([]);

  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load persisted state from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('expenseTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedTransactions = localStorage.getItem('expenseTransactions');
    if (savedTransactions) {
      try { setTransactions(JSON.parse(savedTransactions)); } catch (e) { console.error('Failed to parse saved transactions'); }
    }

    const savedBudgets = localStorage.getItem('expenseBudgets');
    if (savedBudgets) {
      try { setBudgets(JSON.parse(savedBudgets)); } catch (e) { console.error('Failed to parse saved budgets'); }
    }

    const savedGoals = localStorage.getItem('expenseSavingsGoals');
    if (savedGoals) {
      try { setSavingsGoals(JSON.parse(savedGoals)); } catch (e) { console.error('Failed to parse saved goals'); }
    }

    const savedView = localStorage.getItem('expenseView');
    if (savedView) setActiveView(savedView);

    const savedCurrency = localStorage.getItem('expenseDisplayCurrency');
    if (savedCurrency && CURRENCIES[savedCurrency]) setDisplayCurrency(savedCurrency);
  }, []);

  // Persist state to localStorage
  useEffect(() => { localStorage.setItem('expenseTransactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('expenseBudgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('expenseSavingsGoals', JSON.stringify(savingsGoals)); }, [savingsGoals]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedTransaction(null);
        setShowAddModal(false);
        setShowBudgetModal(false);
        setShowGoalModal(false);
        setShowImportModal(false);
        setShowNotifications(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    const newNotif = { id: Date.now().toString(), message, type, timestamp: Date.now(), read: false };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('expenseTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const switchView = (view) => {
    setActiveView(view);
    localStorage.setItem('expenseView', view);
  };

  const changeCurrency = (currency) => {
    setDisplayCurrency(currency);
    localStorage.setItem('expenseDisplayCurrency', currency);
  };

  // === Derived computations ===

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const { start, end } = parseDateRange(dateRangeStart, dateRangeEnd);
      const txnDate = new Date(txn.date);
      if (txnDate < start || txnDate > end) return false;
      if (filterCategory !== 'all' && txn.category !== filterCategory) return false;
      if (filterType !== 'all' && txn.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchDesc = txn.description.toLowerCase().includes(q);
        const matchTags = txn.tags.some(t => t.toLowerCase().includes(q));
        const matchNotes = txn.notes.toLowerCase().includes(q);
        if (!matchDesc && !matchTags && !matchNotes) return false;
      }
      return true;
    });
  }, [transactions, dateRangeStart, dateRangeEnd, filterCategory, filterType, searchQuery]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = new Date(a.date) - new Date(b.date);
      else if (sortBy === 'amount') cmp = a.amount - b.amount;
      else if (sortBy === 'description') cmp = a.description.localeCompare(b.description);
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category);
      return sortDirection === 'desc' ? -cmp : cmp;
    });
  }, [filteredTransactions, sortBy, sortDirection]);

  const displayAmount = useCallback((amount, fromCurrency = 'USD') => {
    const usdAmount = convertToUSD(amount, fromCurrency);
    const displayRate = CURRENCIES[displayCurrency]?.rate || 1;
    const converted = usdAmount * displayRate;
    return formatCurrency(converted, displayCurrency);
  }, [displayCurrency]);

  const summaryStats = useMemo(() => {
    const { start, end } = parseDateRange(dateRangeStart, dateRangeEnd);
    const periodTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    const totalIncome = periodTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const totalExpenses = periodTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const transactionCount = periodTxns.length;
    const avgExpense = periodTxns.filter(t => t.type === 'expense').length > 0
      ? totalExpenses / periodTxns.filter(t => t.type === 'expense').length
      : 0;
    return { totalIncome, totalExpenses, netSavings, savingsRate, transactionCount, avgExpense };
  }, [transactions, dateRangeStart, dateRangeEnd]);

  const categoryBreakdown = useMemo(() => {
    const { start, end } = parseDateRange(dateRangeStart, dateRangeEnd);
    const expenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d >= start && d <= end;
    });
    const breakdown = {};
    expenses.forEach(txn => {
      if (!breakdown[txn.category]) breakdown[txn.category] = 0;
      breakdown[txn.category] += convertToUSD(txn.amount, txn.currency);
    });
    return CATEGORIES
      .filter(c => breakdown[c.id])
      .map(c => ({ ...c, total: breakdown[c.id], percentage: summaryStats.totalExpenses > 0 ? (breakdown[c.id] / summaryStats.totalExpenses) * 100 : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, dateRangeStart, dateRangeEnd, summaryStats.totalExpenses]);

  const monthlyTrends = useMemo(() => {
    const months = {};
    transactions.forEach(txn => {
      const key = getMonthKey(txn.date);
      if (!months[key]) months[key] = { income: 0, expenses: 0 };
      const usdAmount = convertToUSD(txn.amount, txn.currency);
      if (txn.type === 'income') months[key].income += usdAmount;
      else months[key].expenses += usdAmount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data, net: data.income - data.expenses }));
  }, [transactions]);

  const budgetStatus = useMemo(() => {
    const currentMonth = getMonthKey(new Date().toISOString().split('T')[0]);
    const monthExpenses = transactions.filter(t => {
      return t.type === 'expense' && getMonthKey(t.date) === currentMonth;
    });
    return budgets.map(budget => {
      const spent = monthExpenses
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + convertToUSD(t.amount, t.currency), 0);
      const remaining = budget.monthlyLimit - spent;
      const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
      const cat = CATEGORIES.find(c => c.id === budget.category);
      return { ...budget, spent, remaining, percentage, categoryName: cat?.name || budget.category, icon: cat?.icon || '📦' };
    });
  }, [budgets, transactions]);

  const recurringTransactions = useMemo(() => {
    return transactions.filter(t => t.recurrence !== 'none');
  }, [transactions]);

  const upcomingRecurring = useMemo(() => {
    const today = new Date();
    return recurringTransactions.map(t => {
      const lastDate = new Date(t.date);
      let nextDate = new Date(lastDate);
      while (nextDate <= today) {
        if (t.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (t.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (t.recurrence === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
        else if (t.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (t.recurrence === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      return { ...t, nextDate: nextDate.toISOString().split('T')[0] };
    }).sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));
  }, [recurringTransactions]);

  // === Transaction CRUD ===

  const addTransaction = (formData) => {
    const newTxn = {
      id: `t${Date.now()}`,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      currency: formData.currency || 'USD',
      recurrence: formData.recurrence || 'none',
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      notes: formData.notes || '',
    };
    setTransactions(prev => [...prev, newTxn]);
    addNotification(`Transaction "${newTxn.description}" added`);
    setShowAddModal(false);
  };

  const updateTransaction = (id, updates) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    addNotification('Transaction updated');
  };

  const deleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const txn = transactions.find(t => t.id === id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setSelectedTransaction(null);
      addNotification(`Transaction "${txn?.description}" deleted`);
    }
  };

  const bulkDeleteTransactions = () => {
    if (bulkSelection.length === 0) return;
    if (window.confirm(`Delete ${bulkSelection.length} selected transactions?`)) {
      setTransactions(prev => prev.filter(t => !bulkSelection.includes(t.id)));
      setBulkSelection([]);
      addNotification(`${bulkSelection.length} transactions deleted`);
    }
  };

  const toggleBulkSelect = (id) => {
    setBulkSelection(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // === Budget CRUD ===

  const addBudget = (formData) => {
    const newBudget = {
      id: `b${Date.now()}`,
      category: formData.category,
      monthlyLimit: parseFloat(formData.monthlyLimit),
      color: CATEGORIES.find(c => c.id === formData.category)?.color || '#6b7280',
    };
    setBudgets(prev => [...prev, newBudget]);
    addNotification(`Budget for ${formData.category} added`);
    setShowBudgetModal(false);
  };

  const updateBudget = (id, updates) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    setEditingBudgetId(null);
    addNotification('Budget updated');
  };

  const deleteBudget = (id) => {
    if (window.confirm('Delete this budget?')) {
      setBudgets(prev => prev.filter(b => b.id !== id));
      addNotification('Budget deleted');
    }
  };

  // === Savings Goals ===

  const addSavingsGoal = (formData) => {
    const newGoal = {
      id: `sg${Date.now()}`,
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
      icon: formData.icon || '🎯',
    };
    setSavingsGoals(prev => [...prev, newGoal]);
    addNotification(`Savings goal "${newGoal.name}" created`);
    setShowGoalModal(false);
  };

  const updateGoalProgress = (id, amount) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g));
    addNotification(`Savings goal updated`);
  };

  const deleteGoal = (id) => {
    if (window.confirm('Delete this savings goal?')) {
      setSavingsGoals(prev => prev.filter(g => g.id !== id));
      addNotification('Savings goal deleted');
    }
  };

  // === CSV Import/Export ===

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Currency', 'Recurrence', 'Tags', 'Notes'];
    const rows = sortedTransactions.map(t => [
      t.date, t.description, t.amount, t.type, t.category, t.currency, t.recurrence, t.tags.join(';'), t.notes,
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${dateRangeStart}_to_${dateRangeEnd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Transactions exported to CSV');
  };

  const importFromCSV = () => {
    if (!csvData.trim()) return;
    try {
      const lines = csvData.trim().split('\n');
      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (parts && parts.length >= 5) {
          const clean = parts.map(p => p.replace(/^"|"$/g, '').replace(/""/g, '"'));
          imported.push({
            id: `t${Date.now()}_${i}`,
            date: clean[0],
            description: clean[1],
            amount: parseFloat(clean[2]),
            type: clean[3] || 'expense',
            category: clean[4] || 'other',
            currency: clean[5] || 'USD',
            recurrence: clean[6] || 'none',
            tags: clean[7] ? clean[7].split(';') : [],
            notes: clean[8] || '',
          });
        }
      }
      if (imported.length > 0) {
        setTransactions(prev => [...prev, ...imported]);
        addNotification(`${imported.length} transactions imported`);
        setShowImportModal(false);
        setCsvData('');
      } else {
        addNotification('No valid transactions found in CSV', 'error');
      }
    } catch (err) {
      addNotification('Failed to parse CSV data', 'error');
    }
  };

  // === Sorting ===

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // === Theme styles ===

  const theme = isDarkMode
    ? { bg: '#111827', card: '#1f2937', text: '#f9fafb', textSecondary: '#9ca3af', border: '#374151', accent: '#3b82f6', success: '#10b981', danger: '#ef4444', warning: '#f59e0b' }
    : { bg: '#f3f4f6', card: '#ffffff', text: '#111827', textSecondary: '#6b7280', border: '#e5e7eb', accent: '#3b82f6', success: '#10b981', danger: '#ef4444', warning: '#f59e0b' };

  // === Render: Sidebar ===

  const renderSidebar = () => (
    <div style={{ width: sidebarCollapsed ? 60 : 240, minHeight: '100vh', backgroundColor: isDarkMode ? '#1e293b' : '#1e40af', color: '#fff', padding: sidebarCollapsed ? '16px 8px' : 16, transition: 'width 0.3s', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        {!sidebarCollapsed && <h1 style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>💰 FinTrack</h1>}
        <button aria-label="Toggle sidebar" onClick={() => setSidebarCollapsed(prev => !prev)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: 8, borderRadius: 4 }}>
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {[
        { key: 'dashboard', icon: '📊', label: 'Dashboard' },
        { key: 'transactions', icon: '📋', label: 'Transactions' },
        { key: 'budgets', icon: '🎯', label: 'Budgets' },
        { key: 'analytics', icon: '📈', label: 'Analytics' },
        { key: 'recurring', icon: '🔄', label: 'Recurring' },
        { key: 'goals', icon: '🏆', label: 'Goals' },
        { key: 'settings', icon: '⚙️', label: 'Settings' },
      ].map(nav => (
        <button key={nav.key} onClick={() => switchView(nav.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', marginBottom: 4, border: 'none', borderRadius: 8, cursor: 'pointer', backgroundColor: activeView === nav.key ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', fontSize: 14, textAlign: 'left' }}>
          <span>{nav.icon}</span>
          {!sidebarCollapsed && <span>{nav.label}</span>}
        </button>
      ))}

      {!sidebarCollapsed && (
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Net Savings</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: summaryStats.netSavings >= 0 ? '#4ade80' : '#f87171' }}>
            {summaryStats.netSavings >= 0 ? '+' : '-'}{displayAmount(Math.abs(summaryStats.netSavings))}
          </div>
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>Savings Rate: {summaryStats.savingsRate.toFixed(1)}%</div>
        </div>
      )}
    </div>
  );

  // === Render: Header ===

  const renderHeader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <input ref={searchInputRef} type="text" placeholder="Search transactions... (Ctrl+K)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, width: 300 }} />
        <select aria-label="Filter by category" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select aria-label="Filter by type" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select aria-label="Display currency" value={displayCurrency} onChange={e => changeCurrency(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
          {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
            <option key={code} value={code}>{symbol} {code}</option>
          ))}
        </select>
        <div ref={notificationRef} style={{ position: 'relative' }}>
          <button aria-label="Notifications" onClick={() => setShowNotifications(prev => !prev)} style={{ background: 'none', border: `1px solid ${theme.border}`, padding: 8, borderRadius: 8, cursor: 'pointer', color: theme.text, position: 'relative' }}>
            🔔
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', backgroundColor: theme.danger, color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.filter(n => !n.read).length}</span>
            )}
          </button>
          {showNotifications && (
            <div style={{ position: 'absolute', right: 0, top: 44, width: 320, backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 400, overflow: 'auto' }}>
              <div style={{ padding: 16, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: theme.text }}>Notifications</h3>
                <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: 12 }}>Mark all read</button>
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: theme.textSecondary }}>No notifications</div>
              ) : notifications.slice(0, 10).map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, backgroundColor: n.read ? 'transparent' : (isDarkMode ? '#1e293b' : '#eff6ff'), color: theme.text, fontSize: 13 }}>
                  {n.message}
                  <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>{new Date(n.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button aria-label="Toggle theme" onClick={toggleTheme} style={{ background: 'none', border: `1px solid ${theme.border}`, padding: 8, borderRadius: 8, cursor: 'pointer', color: theme.text }}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );

  // === Render: Dashboard View ===

  const renderDashboard = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: theme.text }}>Financial Overview</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={dateRangeStart} onChange={e => setDateRangeStart(e.target.value)} aria-label="Start date" style={{ padding: '6px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }} />
          <input type="date" value={dateRangeEnd} onChange={e => setDateRangeEnd(e.target.value)} aria-label="End date" style={{ padding: '6px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }} />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Total Income</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: theme.success }}>{displayAmount(summaryStats.totalIncome)}</div>
        </div>
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Total Expenses</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: theme.danger }}>{displayAmount(summaryStats.totalExpenses)}</div>
        </div>
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Net Savings</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: summaryStats.netSavings >= 0 ? theme.success : theme.danger }}>
            {summaryStats.netSavings >= 0 ? '+' : ''}{displayAmount(summaryStats.netSavings)}
          </div>
        </div>
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Transactions</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>{summaryStats.transactionCount}</div>
          <div style={{ fontSize: 11, color: theme.textSecondary }}>Avg expense: {displayAmount(summaryStats.avgExpense)}</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Spending by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <div style={{ color: theme.textSecondary, textAlign: 'center', padding: 20 }}>No expenses in this period</div>
          ) : categoryBreakdown.map(cat => (
            <div key={cat.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: theme.text, fontSize: 13 }}>{cat.icon} {cat.name}</span>
                <span style={{ color: theme.text, fontSize: 13, fontWeight: 'bold' }}>{displayAmount(cat.total)} ({cat.percentage.toFixed(1)}%)</span>
              </div>
              <div style={{ height: 8, backgroundColor: isDarkMode ? '#374151' : '#e5e7eb', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Budget Status */}
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Budget Status</h3>
          {budgetStatus.length === 0 ? (
            <div style={{ color: theme.textSecondary, textAlign: 'center', padding: 20 }}>No budgets set</div>
          ) : budgetStatus.map(b => (
            <div key={b.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: theme.text, fontSize: 13 }}>{b.icon} {b.categoryName}</span>
                <span style={{ color: b.percentage > 90 ? theme.danger : b.percentage > 70 ? theme.warning : theme.success, fontSize: 13, fontWeight: 'bold' }}>
                  {displayAmount(b.spent)} / {displayAmount(b.monthlyLimit)}
                </span>
              </div>
              <div style={{ height: 8, backgroundColor: isDarkMode ? '#374151' : '#e5e7eb', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${Math.min(b.percentage, 100)}%`, backgroundColor: b.percentage > 90 ? theme.danger : b.percentage > 70 ? theme.warning : theme.success, borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: theme.text }}>Recent Transactions</h3>
          <button onClick={() => switchView('transactions')} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: 13 }}>View All</button>
        </div>
        {sortedTransactions.slice(0, 5).map(txn => (
          <div key={txn.id} onClick={() => setSelectedTransaction(txn)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{CATEGORIES.find(c => c.id === txn.category)?.icon || '📦'}</span>
              <div>
                <div style={{ color: theme.text, fontSize: 14, fontWeight: 500 }}>{txn.description}</div>
                <div style={{ color: theme.textSecondary, fontSize: 12 }}>{txn.date} · {txn.category}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: txn.type === 'income' ? theme.success : theme.danger }}>
              {txn.type === 'income' ? '+' : '-'}{displayAmount(txn.amount, txn.currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // === Render: Transactions View ===

  const renderTransactions = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: theme.text }}>Transactions</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={dateRangeStart} onChange={e => setDateRangeStart(e.target.value)} aria-label="Start date" style={{ padding: '6px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }} />
          <input type="date" value={dateRangeEnd} onChange={e => setDateRangeEnd(e.target.value)} aria-label="End date" style={{ padding: '6px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }} />
          <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 16px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>+ Add Transaction</button>
          <button onClick={exportToCSV} style={{ padding: '8px 16px', backgroundColor: theme.success, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Export CSV</button>
          <button onClick={() => setShowImportModal(true)} style={{ padding: '8px 16px', backgroundColor: theme.warning, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Import CSV</button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkSelection.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', backgroundColor: isDarkMode ? '#1e293b' : '#dbeafe', borderRadius: 8, marginBottom: 16 }}>
          <span style={{ color: theme.text, fontWeight: 'bold' }}>{bulkSelection.length} selected</span>
          <button onClick={bulkDeleteTransactions} style={{ padding: '6px 12px', backgroundColor: theme.danger, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Delete Selected</button>
          <button onClick={() => setBulkSelection([])} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textSecondary, fontSize: 12, fontWeight: 600, width: 40 }}>
                <input type="checkbox" aria-label="Select all" onChange={e => {
                  if (e.target.checked) setBulkSelection(sortedTransactions.map(t => t.id));
                  else setBulkSelection([]);
                }} checked={bulkSelection.length === sortedTransactions.length && sortedTransactions.length > 0} />
              </th>
              {[
                { key: 'date', label: 'Date' },
                { key: 'description', label: 'Description' },
                { key: 'category', label: 'Category' },
                { key: 'amount', label: 'Amount' },
              ].map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)} style={{ padding: '12px 16px', textAlign: 'left', color: theme.textSecondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                  {col.label} {sortBy === col.key ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
                </th>
              ))}
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textSecondary, fontSize: 12, fontWeight: 600 }}>Tags</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: theme.textSecondary, fontSize: 12, fontWeight: 600 }}>Recurrence</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: theme.textSecondary }}>No transactions found</td></tr>
            ) : sortedTransactions.map(txn => {
              const cat = CATEGORIES.find(c => c.id === txn.category);
              return (
                <tr key={txn.id} onClick={() => setSelectedTransaction(txn)} style={{ borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', backgroundColor: bulkSelection.includes(txn.id) ? (isDarkMode ? '#1e293b' : '#dbeafe') : 'transparent' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <input type="checkbox" aria-label={`Select ${txn.description}`} checked={bulkSelection.includes(txn.id)} onChange={() => toggleBulkSelect(txn.id)} onClick={e => e.stopPropagation()} />
                  </td>
                  <td style={{ padding: '12px 16px', color: theme.text, fontSize: 13 }}>{txn.date}</td>
                  <td style={{ padding: '12px 16px', color: theme.text, fontSize: 13, fontWeight: 500 }}>{txn.description}</td>
                  <td style={{ padding: '12px 16px', color: theme.text, fontSize: 13 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, backgroundColor: cat?.color + '20', color: cat?.color }}>
                      {cat?.icon} {cat?.name || txn.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 'bold', color: txn.type === 'income' ? theme.success : theme.danger }}>
                    {txn.type === 'income' ? '+' : '-'}{displayAmount(txn.amount, txn.currency)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {txn.tags.map(tag => (
                      <span key={tag} style={{ display: 'inline-block', padding: '2px 6px', marginRight: 4, borderRadius: 4, backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', color: theme.textSecondary, fontSize: 11 }}>{tag}</span>
                    ))}
                  </td>
                  <td style={{ padding: '12px 16px', color: theme.textSecondary, fontSize: 12 }}>
                    {txn.recurrence !== 'none' && <span style={{ padding: '2px 8px', borderRadius: 12, backgroundColor: isDarkMode ? '#1e293b' : '#dbeafe', color: theme.accent, fontSize: 11 }}>🔄 {txn.recurrence}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '12px 16px', backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}` }}>
        <span style={{ color: theme.textSecondary, fontSize: 13 }}>{sortedTransactions.length} transactions</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ color: theme.success, fontSize: 13, fontWeight: 'bold' }}>Income: {displayAmount(sortedTransactions.filter(t => t.type === 'income').reduce((s, t) => s + convertToUSD(t.amount, t.currency), 0))}</span>
          <span style={{ color: theme.danger, fontSize: 13, fontWeight: 'bold' }}>Expenses: {displayAmount(sortedTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + convertToUSD(t.amount, t.currency), 0))}</span>
        </div>
      </div>
    </div>
  );

  // === Render: Budgets View ===

  const renderBudgets = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: theme.text }}>Budget Management</h2>
        <button onClick={() => setShowBudgetModal(true)} style={{ padding: '8px 16px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>+ New Budget</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320, 1fr))', gap: 16 }}>
        {budgetStatus.map(b => (
          <div key={b.id} style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: theme.text }}>{b.categoryName}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>Monthly Budget</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {editingBudgetId === b.id ? (
                  <input type="number" defaultValue={b.monthlyLimit} aria-label="Edit budget limit" onBlur={e => updateBudget(b.id, { monthlyLimit: parseFloat(e.target.value) })} onKeyDown={e => { if (e.key === 'Enter') updateBudget(b.id, { monthlyLimit: parseFloat(e.target.value) }); }} style={{ width: 80, padding: 4, border: `1px solid ${theme.border}`, borderRadius: 4, backgroundColor: theme.bg, color: theme.text }} autoFocus />
                ) : (
                  <button onClick={() => setEditingBudgetId(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                )}
                <button onClick={() => deleteBudget(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: theme.textSecondary, fontSize: 13 }}>Spent</span>
                <span style={{ color: theme.text, fontSize: 13, fontWeight: 'bold' }}>{displayAmount(b.spent)} / {displayAmount(b.monthlyLimit)}</span>
              </div>
              <div style={{ height: 12, backgroundColor: isDarkMode ? '#374151' : '#e5e7eb', borderRadius: 6 }}>
                <div style={{ height: '100%', width: `${Math.min(b.percentage, 100)}%`, backgroundColor: b.percentage > 90 ? theme.danger : b.percentage > 70 ? theme.warning : theme.success, borderRadius: 6, transition: 'width 0.3s' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: b.remaining >= 0 ? theme.success : theme.danger }}>
                {b.remaining >= 0 ? `${displayAmount(b.remaining)} remaining` : `${displayAmount(Math.abs(b.remaining))} over budget`}
              </span>
              <span style={{ color: theme.textSecondary }}>{b.percentage.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // === Render: Analytics View ===

  const renderAnalytics = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 24px 0', color: theme.text }}>Analytics</h2>

      {/* Monthly Trends */}
      <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Monthly Trends</h3>
        {monthlyTrends.length === 0 ? (
          <div style={{ color: theme.textSecondary, textAlign: 'center', padding: 20 }}>No data available</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {monthlyTrends.map(m => {
              const maxVal = Math.max(...monthlyTrends.map(t => Math.max(t.income, t.expenses)));
              return (
                <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 80, color: theme.textSecondary, fontSize: 13 }}>{m.month}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
                      <div style={{ height: 16, width: `${(m.income / maxVal) * 100}%`, backgroundColor: theme.success, borderRadius: 4, minWidth: 2 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <div style={{ height: 16, width: `${(m.expenses / maxVal) * 100}%`, backgroundColor: theme.danger, borderRadius: 4, minWidth: 2 }} />
                    </div>
                  </div>
                  <div style={{ width: 160, textAlign: 'right' }}>
                    <span style={{ color: theme.success, fontSize: 12 }}>{displayAmount(m.income)}</span>
                    <span style={{ color: theme.textSecondary, fontSize: 12 }}> / </span>
                    <span style={{ color: theme.danger, fontSize: 12 }}>{displayAmount(m.expenses)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Spending Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Top Spending Categories</h3>
          {categoryBreakdown.slice(0, 5).map((cat, i) => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 4 ? `1px solid ${theme.border}` : 'none' }}>
              <span style={{ fontSize: 12, color: theme.textSecondary, width: 20 }}>#{i + 1}</span>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: theme.text, fontSize: 14, fontWeight: 500 }}>{cat.name}</div>
                <div style={{ color: theme.textSecondary, fontSize: 12 }}>{cat.percentage.toFixed(1)}% of total</div>
              </div>
              <span style={{ color: theme.text, fontWeight: 'bold', fontSize: 14 }}>{displayAmount(cat.total)}</span>
            </div>
          ))}
        </div>

        {/* Savings Rate & Stats */}
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Financial Health</h3>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Savings Rate</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: summaryStats.savingsRate >= 20 ? theme.success : summaryStats.savingsRate >= 10 ? theme.warning : theme.danger }}>
              {summaryStats.savingsRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: 12, color: theme.textSecondary }}>
              {summaryStats.savingsRate >= 20 ? 'Excellent! Above recommended 20%' : summaryStats.savingsRate >= 10 ? 'Good, aim for 20%' : 'Below 10%, consider cutting expenses'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, backgroundColor: theme.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>Daily Average Spend</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>{displayAmount(summaryStats.avgExpense)}</div>
            </div>
            <div style={{ padding: 12, backgroundColor: theme.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>Transactions</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>{summaryStats.transactionCount}</div>
            </div>
            <div style={{ padding: 12, backgroundColor: theme.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>Recurring Monthly</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>{recurringTransactions.length}</div>
            </div>
            <div style={{ padding: 12, backgroundColor: theme.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>Active Budgets</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>{budgets.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // === Render: Recurring View ===

  const renderRecurring = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 24px 0', color: theme.text }}>Recurring Transactions</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Active Recurring</h3>
          {recurringTransactions.length === 0 ? (
            <div style={{ color: theme.textSecondary, textAlign: 'center', padding: 20 }}>No recurring transactions</div>
          ) : recurringTransactions.map(txn => {
            const cat = CATEGORIES.find(c => c.id === txn.category);
            return (
              <div key={txn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{cat?.icon || '📦'}</span>
                  <div>
                    <div style={{ color: theme.text, fontSize: 14, fontWeight: 500 }}>{txn.description}</div>
                    <div style={{ color: theme.textSecondary, fontSize: 12 }}>Every {txn.recurrence}</div>
                  </div>
                </div>
                <span style={{ fontWeight: 'bold', color: txn.type === 'income' ? theme.success : theme.danger, fontSize: 14 }}>
                  {txn.type === 'income' ? '+' : '-'}{displayAmount(txn.amount, txn.currency)}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Upcoming Schedule</h3>
          {upcomingRecurring.length === 0 ? (
            <div style={{ color: theme.textSecondary, textAlign: 'center', padding: 20 }}>No upcoming recurring transactions</div>
          ) : upcomingRecurring.map(txn => (
            <div key={txn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ color: theme.text, fontSize: 14 }}>{txn.description}</div>
                <div style={{ color: theme.accent, fontSize: 12 }}>Next: {txn.nextDate}</div>
              </div>
              <span style={{ fontWeight: 'bold', color: txn.type === 'income' ? theme.success : theme.danger, fontSize: 14 }}>
                {displayAmount(txn.amount, txn.currency)}
              </span>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: 12, backgroundColor: theme.bg, borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Monthly Recurring Total</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: theme.success, fontWeight: 'bold' }}>
                Income: {displayAmount(recurringTransactions.filter(t => t.type === 'income').reduce((s, t) => s + convertToUSD(t.amount, t.currency), 0))}
              </span>
              <span style={{ color: theme.danger, fontWeight: 'bold' }}>
                Expenses: {displayAmount(recurringTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + convertToUSD(t.amount, t.currency), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // === Render: Goals View ===

  const renderGoals = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: theme.text }}>Savings Goals</h2>
        <button onClick={() => setShowGoalModal(true)} style={{ padding: '8px 16px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>+ New Goal</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
        {savingsGoals.map(goal => {
          const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / 86400000));
          const amountLeft = goal.targetAmount - goal.currentAmount;
          const monthlyNeeded = daysLeft > 0 ? (amountLeft / (daysLeft / 30)) : 0;
          return (
            <div key={goal.id} style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 28 }}>{goal.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: theme.text, fontSize: 16 }}>{goal.name}</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary }}>Deadline: {goal.deadline}</div>
                  </div>
                </div>
                <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: theme.text, fontWeight: 'bold' }}>{displayAmount(goal.currentAmount)}</span>
                  <span style={{ color: theme.textSecondary }}>{displayAmount(goal.targetAmount)}</span>
                </div>
                <div style={{ height: 16, backgroundColor: isDarkMode ? '#374151' : '#e5e7eb', borderRadius: 8 }}>
                  <div style={{ height: '100%', width: `${Math.min(percentage, 100)}%`, backgroundColor: percentage >= 100 ? theme.success : theme.accent, borderRadius: 8, transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: theme.textSecondary, fontSize: 12 }}>{percentage.toFixed(1)}% complete</span>
                  <span style={{ color: theme.textSecondary, fontSize: 12 }}>{daysLeft} days left</span>
                </div>
              </div>

              {percentage < 100 && (
                <div style={{ padding: 8, backgroundColor: theme.bg, borderRadius: 8, marginBottom: 12, fontSize: 12, color: theme.textSecondary }}>
                  Need {displayAmount(monthlyNeeded)}/month to reach goal
                </div>
              )}

              {percentage >= 100 && (
                <div style={{ padding: 8, backgroundColor: theme.success + '20', borderRadius: 8, marginBottom: 12, fontSize: 12, color: theme.success, textAlign: 'center', fontWeight: 'bold' }}>
                  🎉 Goal Reached!
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => updateGoalProgress(goal.id, 50)} style={{ flex: 1, padding: '8px 0', backgroundColor: theme.success, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>+{displayAmount(50)}</button>
                <button onClick={() => updateGoalProgress(goal.id, 100)} style={{ flex: 1, padding: '8px 0', backgroundColor: theme.success, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>+{displayAmount(100)}</button>
                <button onClick={() => updateGoalProgress(goal.id, -50)} style={{ flex: 1, padding: '8px 0', backgroundColor: theme.danger, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>-{displayAmount(50)}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // === Render: Settings View ===

  const renderSettings = () => (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2 style={{ margin: '0 0 24px 0', color: theme.text }}>Settings</h2>

      <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Display</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, color: theme.textSecondary, fontSize: 13 }}>Default Currency</label>
          <select value={displayCurrency} onChange={e => changeCurrency(e.target.value)} aria-label="Default currency" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
            {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
              <option key={code} value={code}>{symbol} {code}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ color: theme.text, fontSize: 14 }}>Dark Mode</span>
          <button onClick={toggleTheme} style={{ padding: '6px 16px', backgroundColor: isDarkMode ? theme.success : theme.bg, color: isDarkMode ? '#fff' : theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer' }}>
            {isDarkMode ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Data Management</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportToCSV} style={{ padding: '8px 16px', backgroundColor: theme.success, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Export All Data</button>
          <button onClick={() => setShowImportModal(true)} style={{ padding: '8px 16px', backgroundColor: theme.warning, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Import Data</button>
        </div>
      </div>

      <div style={{ padding: 20, backgroundColor: theme.card, borderRadius: 12, border: `1px solid ${theme.border}` }}>
        <h3 style={{ margin: '0 0 16px 0', color: theme.danger }}>Danger Zone</h3>
        <button onClick={() => {
          if (window.confirm('Delete ALL transactions? This cannot be undone.')) {
            setTransactions([]);
            addNotification('All transactions deleted');
          }
        }} style={{ padding: '8px 16px', backgroundColor: theme.danger, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginRight: 8 }}>Delete All Transactions</button>
        <button onClick={() => {
          if (window.confirm('Reset all budgets?')) {
            setBudgets([]);
            addNotification('All budgets reset');
          }
        }} style={{ padding: '8px 16px', backgroundColor: theme.danger, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginRight: 8 }}>Reset Budgets</button>
        <button onClick={() => {
          if (window.confirm('Delete all savings goals?')) {
            setSavingsGoals([]);
            addNotification('All savings goals deleted');
          }
        }} style={{ padding: '8px 16px', backgroundColor: theme.danger, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Delete All Goals</button>
      </div>
    </div>
  );

  // === Render: Transaction Detail Modal ===

  const renderTransactionModal = () => {
    if (!selectedTransaction) return null;
    const txn = transactions.find(t => t.id === selectedTransaction.id) || selectedTransaction;
    const cat = CATEGORIES.find(c => c.id === txn.category);
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setSelectedTransaction(null)}>
        <div style={{ backgroundColor: theme.card, borderRadius: 16, width: 500, maxHeight: '80vh', overflow: 'auto', padding: 24 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: theme.text }}>{txn.description}</h2>
            <button onClick={() => setSelectedTransaction(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.textSecondary }}>×</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ padding: '4px 12px', borderRadius: 12, backgroundColor: cat?.color + '20', color: cat?.color, fontSize: 13 }}>{cat?.icon} {cat?.name}</span>
            <span style={{ padding: '4px 12px', borderRadius: 12, backgroundColor: txn.type === 'income' ? theme.success + '20' : theme.danger + '20', color: txn.type === 'income' ? theme.success : theme.danger, fontSize: 13 }}>{txn.type}</span>
            {txn.recurrence !== 'none' && (
              <span style={{ padding: '4px 12px', borderRadius: 12, backgroundColor: theme.accent + '20', color: theme.accent, fontSize: 13 }}>🔄 {txn.recurrence}</span>
            )}
          </div>

          <div style={{ fontSize: 32, fontWeight: 'bold', color: txn.type === 'income' ? theme.success : theme.danger, marginBottom: 16 }}>
            {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><span style={{ fontSize: 12, color: theme.textSecondary }}>Date</span><div style={{ color: theme.text }}>{txn.date}</div></div>
              <div><span style={{ fontSize: 12, color: theme.textSecondary }}>Currency</span><div style={{ color: theme.text }}>{txn.currency}</div></div>
            </div>
          </div>

          {txn.notes && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Notes</div>
              <div style={{ color: theme.text, padding: 12, backgroundColor: theme.bg, borderRadius: 8 }}>{txn.notes}</div>
            </div>
          )}

          {txn.tags.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Tags</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {txn.tags.map(tag => <span key={tag} style={{ padding: '4px 10px', borderRadius: 12, backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', color: theme.text, fontSize: 12 }}>#{tag}</span>)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button onClick={() => deleteTransaction(txn.id)} style={{ padding: '8px 16px', backgroundColor: theme.danger, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Delete</button>
            <button onClick={() => setSelectedTransaction(null)} style={{ padding: '8px 16px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // === Render: Add Transaction Modal ===

  const renderAddModal = () => {
    if (!showAddModal) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowAddModal(false)}>
        <div style={{ backgroundColor: theme.card, borderRadius: 16, width: 500, padding: 24 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: theme.text }}>Add Transaction</h2>
            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.textSecondary }}>×</button>
          </div>
          <form onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            addTransaction(Object.fromEntries(fd));
          }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Description *</label>
              <input name="description" required placeholder="What was this for?" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Amount *</label>
                <input name="amount" type="number" step="0.01" required placeholder="0.00" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Type</label>
                <select name="type" defaultValue="expense" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Category</label>
                <select name="category" defaultValue="other" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Date *</label>
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Currency</label>
                <select name="currency" defaultValue="USD" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
                  {Object.entries(CURRENCIES).map(([code, { symbol }]) => <option key={code} value={code}>{symbol} {code}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Recurrence</label>
                <select name="recurrence" defaultValue="none" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
                  {RECURRENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt === 'none' ? 'One-time' : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Tags (comma separated)</label>
              <input name="tags" placeholder="e.g. groceries, weekly" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Notes</label>
              <textarea name="notes" rows={2} placeholder="Additional notes..." style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Add Transaction</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // === Render: Add Budget Modal ===

  const renderBudgetModal = () => {
    if (!showBudgetModal) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowBudgetModal(false)}>
        <div style={{ backgroundColor: theme.card, borderRadius: 16, width: 400, padding: 24 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: theme.text }}>New Budget</h2>
            <button onClick={() => setShowBudgetModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.textSecondary }}>×</button>
          </div>
          <form onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            addBudget(Object.fromEntries(fd));
          }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Category</label>
              <select name="category" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text }}>
                {CATEGORIES.filter(c => c.id !== 'income').map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Monthly Limit</label>
              <input name="monthlyLimit" type="number" step="0.01" required placeholder="0.00" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowBudgetModal(false)} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Create Budget</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // === Render: Add Savings Goal Modal ===

  const renderGoalModal = () => {
    if (!showGoalModal) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowGoalModal(false)}>
        <div style={{ backgroundColor: theme.card, borderRadius: 16, width: 400, padding: 24 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: theme.text }}>New Savings Goal</h2>
            <button onClick={() => setShowGoalModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.textSecondary }}>×</button>
          </div>
          <form onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            addSavingsGoal(Object.fromEntries(fd));
          }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Goal Name *</label>
              <input name="name" required placeholder="e.g. Emergency Fund" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Target Amount *</label>
                <input name="targetAmount" type="number" step="0.01" required placeholder="0.00" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Current Amount</label>
                <input name="currentAmount" type="number" step="0.01" defaultValue="0" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Deadline</label>
                <input name="deadline" type="date" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: theme.text, fontSize: 13 }}>Icon</label>
                <input name="icon" placeholder="🎯" defaultValue="🎯" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowGoalModal(false)} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Create Goal</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // === Render: Import CSV Modal ===

  const renderImportModal = () => {
    if (!showImportModal) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowImportModal(false)}>
        <div style={{ backgroundColor: theme.card, borderRadius: 16, width: 500, padding: 24 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: theme.text }}>Import CSV</h2>
            <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.textSecondary }}>×</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 8 }}>
              Paste CSV data below. Expected columns: Date, Description, Amount, Type, Category, Currency, Recurrence, Tags, Notes
            </div>
            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} placeholder="Date,Description,Amount,Type,Category,Currency,Recurrence,Tags,Notes" rows={8} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, backgroundColor: theme.bg, color: theme.text, resize: 'vertical', fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => { setShowImportModal(false); setCsvData(''); }} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            <button onClick={importFromCSV} style={{ padding: '8px 16px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Import</button>
          </div>
        </div>
      </div>
    );
  };

  // === Main Render ===

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {renderSidebar()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderHeader()}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'transactions' && renderTransactions()}
          {activeView === 'budgets' && renderBudgets()}
          {activeView === 'analytics' && renderAnalytics()}
          {activeView === 'recurring' && renderRecurring()}
          {activeView === 'goals' && renderGoals()}
          {activeView === 'settings' && renderSettings()}
        </div>
      </div>
      {renderTransactionModal()}
      {renderAddModal()}
      {renderBudgetModal()}
      {renderGoalModal()}
      {renderImportModal()}
    </div>
  );
}
