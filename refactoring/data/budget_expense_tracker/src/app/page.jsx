import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍔', color: '#ef4444' },
  { id: 'transport', label: 'Transportation', icon: '🚗', color: '#f97316' },
  { id: 'housing', label: 'Housing', icon: '🏠', color: '#eab308' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#22c55e' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#3b82f6' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#8b5cf6' },
  { id: 'health', label: 'Health', icon: '🏥', color: '#ec4899' },
  { id: 'education', label: 'Education', icon: '📚', color: '#14b8a6' },
  { id: 'savings', label: 'Savings', icon: '🏦', color: '#6366f1' },
  { id: 'other', label: 'Other', icon: '📦', color: '#64748b' },
];

const ACCOUNTS = [
  { id: 'checking', name: 'Checking Account', icon: '🏦', balance: 4250.0 },
  { id: 'savings_acct', name: 'Savings Account', icon: '💰', balance: 12800.0 },
  { id: 'credit', name: 'Credit Card', icon: '💳', balance: -1340.0 },
  { id: 'cash', name: 'Cash', icon: '💵', balance: 180.0 },
];

const INITIAL_TRANSACTIONS = [
  { id: 't1', description: 'Grocery Store', amount: -85.42, category: 'food', account: 'checking', date: '2025-04-28', notes: 'Weekly groceries', tags: ['groceries', 'weekly'] },
  { id: 't2', description: 'Monthly Rent', amount: -1500.0, category: 'housing', account: 'checking', date: '2025-04-01', notes: 'April rent payment', tags: ['rent', 'monthly'] },
  { id: 't3', description: 'Electric Bill', amount: -124.50, category: 'utilities', account: 'checking', date: '2025-04-05', notes: '', tags: ['electric', 'monthly'] },
  { id: 't4', description: 'Salary Deposit', amount: 3200.0, category: 'other', account: 'checking', date: '2025-04-01', notes: 'Monthly salary', tags: ['income', 'salary'] },
  { id: 't5', description: 'Netflix Subscription', amount: -15.99, category: 'entertainment', account: 'credit', date: '2025-04-03', notes: '', tags: ['streaming', 'monthly'] },
  { id: 't6', description: 'Gas Station', amount: -45.00, category: 'transport', account: 'credit', date: '2025-04-10', notes: 'Full tank', tags: ['gas'] },
  { id: 't7', description: 'Coffee Shop', amount: -6.75, category: 'food', account: 'cash', date: '2025-04-12', notes: 'Latte and muffin', tags: ['coffee'] },
  { id: 't8', description: 'Online Course', amount: -49.99, category: 'education', account: 'credit', date: '2025-04-08', notes: 'React advanced patterns', tags: ['learning'] },
  { id: 't9', description: 'Freelance Payment', amount: 750.0, category: 'other', account: 'checking', date: '2025-04-15', notes: 'Logo design project', tags: ['income', 'freelance'] },
  { id: 't10', description: 'Pharmacy', amount: -32.00, category: 'health', account: 'cash', date: '2025-04-18', notes: 'Vitamins', tags: ['health'] },
  { id: 't11', description: 'New Headphones', amount: -89.99, category: 'shopping', account: 'credit', date: '2025-04-20', notes: 'Wireless headphones', tags: ['electronics'] },
  { id: 't12', description: 'Savings Transfer', amount: -500.0, category: 'savings', account: 'checking', date: '2025-04-01', notes: 'Monthly savings', tags: ['savings', 'monthly'] },
  { id: 't13', description: 'Restaurant Dinner', amount: -62.30, category: 'food', account: 'credit', date: '2025-04-22', notes: 'Birthday dinner', tags: ['dining'] },
  { id: 't14', description: 'Water Bill', amount: -48.00, category: 'utilities', account: 'checking', date: '2025-04-10', notes: '', tags: ['water', 'monthly'] },
  { id: 't15', description: 'Movie Tickets', amount: -28.00, category: 'entertainment', account: 'cash', date: '2025-04-25', notes: '2 tickets', tags: ['movies'] },
];

const INITIAL_BUDGETS = [
  { id: 'b1', category: 'food', monthlyLimit: 400 },
  { id: 'b2', category: 'transport', monthlyLimit: 150 },
  { id: 'b3', category: 'housing', monthlyLimit: 1600 },
  { id: 'b4', category: 'utilities', monthlyLimit: 250 },
  { id: 'b5', category: 'entertainment', monthlyLimit: 100 },
  { id: 'b6', category: 'shopping', monthlyLimit: 200 },
  { id: 'b7', category: 'health', monthlyLimit: 150 },
  { id: 'b8', category: 'education', monthlyLimit: 100 },
  { id: 'b9', category: 'savings', monthlyLimit: 500 },
];

const RECURRING_ITEMS = [
  { id: 'r1', description: 'Monthly Rent', amount: -1500.0, category: 'housing', account: 'checking', frequency: 'monthly', nextDate: '2025-05-01', active: true },
  { id: 'r2', description: 'Electric Bill', amount: -124.50, category: 'utilities', account: 'checking', frequency: 'monthly', nextDate: '2025-05-05', active: true },
  { id: 'r3', description: 'Netflix Subscription', amount: -15.99, category: 'entertainment', account: 'credit', frequency: 'monthly', nextDate: '2025-05-03', active: true },
  { id: 'r4', description: 'Savings Transfer', amount: -500.0, category: 'savings', account: 'checking', frequency: 'monthly', nextDate: '2025-05-01', active: true },
  { id: 'r5', description: 'Water Bill', amount: -48.0, category: 'utilities', account: 'checking', frequency: 'monthly', nextDate: '2025-05-10', active: true },
  { id: 'r6', description: 'Gym Membership', amount: -35.0, category: 'health', account: 'credit', frequency: 'monthly', nextDate: '2025-05-01', active: false },
];

export default function BudgetExpenseTracker() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [recurringItems, setRecurringItems] = useState(RECURRING_ITEMS);
  const [activeView, setActiveView] = useState('transactions');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    description: '', amount: '', category: 'food', account: 'checking', date: '', notes: '', tags: '',
  });
  const [editTransaction, setEditTransaction] = useState(null);
  const [budgetEditAmount, setBudgetEditAmount] = useState('');
  const [transferFrom, setTransferFrom] = useState('checking');
  const [transferTo, setTransferTo] = useState('savings_acct');
  const [transferAmount, setTransferAmount] = useState('');
  const [reportPeriod, setReportPeriod] = useState('this-month');
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('budgetTrackerTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedTransactions = localStorage.getItem('budgetTrackerTransactions');
    if (savedTransactions) {
      try { setTransactions(JSON.parse(savedTransactions)); } catch (e) { /* ignore */ }
    }

    const savedBudgets = localStorage.getItem('budgetTrackerBudgets');
    if (savedBudgets) {
      try { setBudgets(JSON.parse(savedBudgets)); } catch (e) { /* ignore */ }
    }

    const savedAccounts = localStorage.getItem('budgetTrackerAccounts');
    if (savedAccounts) {
      try { setAccounts(JSON.parse(savedAccounts)); } catch (e) { /* ignore */ }
    }

    const savedRecurring = localStorage.getItem('budgetTrackerRecurring');
    if (savedRecurring) {
      try { setRecurringItems(JSON.parse(savedRecurring)); } catch (e) { /* ignore */ }
    }

    const savedView = localStorage.getItem('budgetTrackerView');
    if (savedView) setActiveView(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem('budgetTrackerTransactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgetTrackerBudgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('budgetTrackerAccounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('budgetTrackerRecurring', JSON.stringify(recurringItems));
  }, [recurringItems]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowEditModal(null);
        setShowBudgetModal(null);
        setShowTransferModal(false);
        setSelectedTransactions([]);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowAddModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('budgetTrackerTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const getCategoryInfo = (id) => CATEGORIES.find(c => c.id === id);

  const getAccountInfo = (id) => accounts.find(a => a.id === id);

  const addTransaction = () => {
    const amount = parseFloat(newTransaction.amount);
    if (!newTransaction.description.trim() || isNaN(amount)) return;
    const transaction = {
      id: 't' + Date.now(),
      description: newTransaction.description.trim(),
      amount,
      category: newTransaction.category,
      account: newTransaction.account,
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      notes: newTransaction.notes,
      tags: newTransaction.tags ? newTransaction.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    setTransactions(prev => [transaction, ...prev]);
    setAccounts(prev => prev.map(a =>
      a.id === transaction.account ? { ...a, balance: a.balance + transaction.amount } : a
    ));
    setNewTransaction({ description: '', amount: '', category: 'food', account: 'checking', date: '', notes: '', tags: '' });
    setShowAddModal(false);
  };

  const updateTransaction = () => {
    if (!editTransaction) return;
    const amount = parseFloat(editTransaction.amount);
    if (!editTransaction.description.trim() || isNaN(amount)) return;

    const oldTx = transactions.find(t => t.id === editTransaction.id);
    if (!oldTx) return;

    setTransactions(prev => prev.map(t =>
      t.id === editTransaction.id
        ? { ...editTransaction, amount, tags: typeof editTransaction.tags === 'string' ? editTransaction.tags.split(',').map(s => s.trim()).filter(Boolean) : editTransaction.tags }
        : t
    ));

    // Adjust account balances
    if (oldTx.account === editTransaction.account) {
      const diff = amount - oldTx.amount;
      setAccounts(prev => prev.map(a =>
        a.id === oldTx.account ? { ...a, balance: a.balance + diff } : a
      ));
    } else {
      setAccounts(prev => prev.map(a => {
        if (a.id === oldTx.account) return { ...a, balance: a.balance - oldTx.amount };
        if (a.id === editTransaction.account) return { ...a, balance: a.balance + amount };
        return a;
      }));
    }

    setShowEditModal(null);
    setEditTransaction(null);
  };

  const deleteTransaction = (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setAccounts(prev => prev.map(a =>
        a.id === tx.account ? { ...a, balance: a.balance - tx.amount } : a
      ));
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const bulkDeleteTransactions = () => {
    if (selectedTransactions.length === 0) return;
    if (!window.confirm(`Delete ${selectedTransactions.length} selected transactions?`)) return;
    const toDelete = transactions.filter(t => selectedTransactions.includes(t.id));
    const balanceAdjustments = {};
    toDelete.forEach(tx => {
      balanceAdjustments[tx.account] = (balanceAdjustments[tx.account] || 0) - tx.amount;
    });
    setAccounts(prev => prev.map(a =>
      balanceAdjustments[a.id] ? { ...a, balance: a.balance + balanceAdjustments[a.id] } : a
    ));
    setTransactions(prev => prev.filter(t => !selectedTransactions.includes(t.id)));
    setSelectedTransactions([]);
  };

  const toggleTransactionSelection = (id) => {
    setSelectedTransactions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredTransactions.map(t => t.id);
    const allSelected = allFilteredIds.every(id => selectedTransactions.includes(id));
    setSelectedTransactions(allSelected ? [] : allFilteredIds);
  };

  const executeTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || transferFrom === transferTo) return;
    setAccounts(prev => prev.map(a => {
      if (a.id === transferFrom) return { ...a, balance: a.balance - amount };
      if (a.id === transferTo) return { ...a, balance: a.balance + amount };
      return a;
    }));
    const transferTx = {
      id: 't' + Date.now(),
      description: `Transfer: ${getAccountInfo(transferFrom)?.name} → ${getAccountInfo(transferTo)?.name}`,
      amount: -amount,
      category: 'other',
      account: transferFrom,
      date: new Date().toISOString().split('T')[0],
      notes: 'Account transfer',
      tags: ['transfer'],
    };
    setTransactions(prev => [transferTx, ...prev]);
    setTransferAmount('');
    setShowTransferModal(false);
  };

  const updateBudget = (categoryId) => {
    const limit = parseFloat(budgetEditAmount);
    if (isNaN(limit) || limit < 0) return;
    setBudgets(prev => {
      const existing = prev.find(b => b.category === categoryId);
      if (existing) {
        return prev.map(b => b.category === categoryId ? { ...b, monthlyLimit: limit } : b);
      }
      return [...prev, { id: 'b' + Date.now(), category: categoryId, monthlyLimit: limit }];
    });
    setShowBudgetModal(null);
    setBudgetEditAmount('');
  };

  const toggleRecurringActive = (id) => {
    setRecurringItems(prev => prev.map(r =>
      r.id === id ? { ...r, active: !r.active } : r
    ));
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Account', 'Notes', 'Tags'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.amount.toFixed(2),
      getCategoryInfo(t.category)?.label || t.category,
      getAccountInfo(t.account)?.name || t.account,
      t.notes,
      (t.tags || []).join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getReportDateRange = useCallback(() => {
    const now = new Date();
    if (reportPeriod === 'this-month') {
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      };
    }
    if (reportPeriod === 'last-month') {
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
      };
    }
    if (reportPeriod === 'last-3-months') {
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0],
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      };
    }
    return { from: '', to: '' };
  }, [reportPeriod]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchNotes = tx.notes.toLowerCase().includes(q);
        const matchTags = (tx.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchDesc && !matchNotes && !matchTags) return false;
      }
      if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
      if (filterAccount !== 'all' && tx.account !== filterAccount) return false;
      if (filterDateFrom && tx.date < filterDateFrom) return false;
      if (filterDateTo && tx.date > filterDateTo) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortBy === 'amount-asc') return Math.abs(a.amount) - Math.abs(b.amount);
      if (sortBy === 'name') return a.description.localeCompare(b.description);
      return 0;
    });
  }, [transactions, searchQuery, filterCategory, filterAccount, filterDateFrom, filterDateTo, sortBy]);

  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const netBalance = useMemo(() => {
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const getCategorySpending = useCallback((categoryId, dateFrom, dateTo) => {
    return transactions
      .filter(t => t.category === categoryId && t.amount < 0
        && (!dateFrom || t.date >= dateFrom)
        && (!dateTo || t.date <= dateTo)
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const getMonthlyRecurringTotal = useMemo(() => {
    return recurringItems
      .filter(r => r.active)
      .reduce((sum, r) => sum + Math.abs(r.amount), 0);
  }, [recurringItems]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const bgColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const secondaryText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#6366f1';
  const successColor = '#22c55e';
  const dangerColor = '#ef4444';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? '64px' : '240px', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? '16px 12px' : '20px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>💰 BudgetWise</h1>}
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
            { id: 'transactions', icon: '📋', label: 'Transactions' },
            { id: 'budgets', icon: '📊', label: 'Budgets' },
            { id: 'accounts', icon: '🏦', label: 'Accounts' },
            { id: 'reports', icon: '📈', label: 'Reports' },
            { id: 'recurring', icon: '🔄', label: 'Recurring' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                localStorage.setItem('budgetTrackerView', item.id);
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
            <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Net Balance</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: netBalance >= 0 ? successColor : dangerColor }}>
              {formatCurrency(netBalance)}
            </div>
            <div style={{ fontSize: '12px', color: secondaryText, marginTop: '8px' }}>
              Recurring: {formatCurrency(getMonthlyRecurringTotal)}/mo
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search transactions... (Ctrl+K)"
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ padding: '8px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              aria-label="Add transaction"
            >
              + Add Transaction
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              style={{ padding: '8px 14px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
              aria-label="Transfer funds"
            >
              ↔ Transfer
            </button>
            <button onClick={toggleTheme} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label="Toggle theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

          {/* Summary Cards (shown on all views) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Income', value: formatCurrency(totalIncome), icon: '📈', color: successColor },
              { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: '📉', color: dangerColor },
              { label: 'Net Balance', value: formatCurrency(netBalance), icon: '💰', color: netBalance >= 0 ? successColor : dangerColor },
              { label: 'Transactions', value: transactions.length, icon: '📋', color: accentColor },
            ].map(stat => (
              <div key={stat.label} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                </div>
                <div style={{ fontSize: '13px', color: secondaryText }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Transactions View */}
          {activeView === 'transactions' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Transactions</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedTransactions.length > 0 && (
                    <button
                      onClick={bulkDeleteTransactions}
                      style={{ padding: '6px 12px', backgroundColor: dangerColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Delete {selectedTransactions.length} Selected
                    </button>
                  )}
                  <button
                    onClick={exportCSV}
                    style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}
                    aria-label="Export CSV"
                  >
                    📥 Export CSV
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  aria-label="Filter by category"
                  style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor }}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>

                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  aria-label="Filter by account"
                  style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor }}
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>

                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  aria-label="Date from"
                  style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor }}
                />

                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  aria-label="Date to"
                  style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor }}
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort transactions"
                  style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor }}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                  <option value="name">Name A-Z</option>
                </select>

                <span style={{ fontSize: '12px', color: secondaryText, display: 'flex', alignItems: 'center' }}>
                  {filteredTransactions.length} results
                </span>
              </div>

              {/* Transaction List */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                {/* Select All Header */}
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: secondaryText, backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }}>
                  <input
                    type="checkbox"
                    checked={filteredTransactions.length > 0 && filteredTransactions.every(t => selectedTransactions.includes(t.id))}
                    onChange={selectAllFiltered}
                    aria-label="Select all transactions"
                  />
                  <span style={{ flex: 1 }}>Description</span>
                  <span style={{ width: '120px' }}>Category</span>
                  <span style={{ width: '120px' }}>Account</span>
                  <span style={{ width: '100px', textAlign: 'right' }}>Amount</span>
                  <span style={{ width: '100px', textAlign: 'right' }}>Date</span>
                  <span style={{ width: '60px' }} />
                </div>

                {filteredTransactions.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: secondaryText }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                    <p>No transactions found.</p>
                  </div>
                ) : (
                  filteredTransactions.map(tx => {
                    const cat = getCategoryInfo(tx.category);
                    const acc = getAccountInfo(tx.account);
                    return (
                      <div
                        key={tx.id}
                        style={{
                          padding: '12px 16px', borderBottom: `1px solid ${borderColor}`,
                          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px',
                          backgroundColor: selectedTransactions.includes(tx.id) ? (isDarkMode ? '#1e3a5f' : '#eef2ff') : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(tx.id)}
                          onChange={() => toggleTransactionSelection(tx.id)}
                          aria-label={`Select ${tx.description}`}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{tx.description}</div>
                          {tx.notes && <div style={{ fontSize: '11px', color: secondaryText, marginTop: '2px' }}>{tx.notes}</div>}
                          {tx.tags && tx.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                              {tx.tags.map(tag => (
                                <span key={tag} style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', backgroundColor: isDarkMode ? '#334155' : '#e0e7ff', color: accentColor }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{cat?.icon}</span>
                          <span style={{ fontSize: '12px' }}>{cat?.label}</span>
                        </span>
                        <span style={{ width: '120px', fontSize: '12px', color: secondaryText }}>{acc?.name}</span>
                        <span style={{ width: '100px', textAlign: 'right', fontWeight: 600, color: tx.amount >= 0 ? successColor : dangerColor }}>
                          {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </span>
                        <span style={{ width: '100px', textAlign: 'right', fontSize: '12px', color: secondaryText }}>{formatDate(tx.date)}</span>
                        <div style={{ width: '60px', display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => {
                              setEditTransaction({ ...tx, tags: (tx.tags || []).join(', ') });
                              setShowEditModal(tx.id);
                            }}
                            style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: textColor }}
                            aria-label={`Edit ${tx.description}`}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: dangerColor }}
                            aria-label={`Delete ${tx.description}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Budgets View */}
          {activeView === 'budgets' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Monthly Budgets</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {CATEGORIES.filter(c => c.id !== 'other').map(category => {
                  const budget = budgets.find(b => b.category === category.id);
                  const reportRange = getReportDateRange();
                  const spent = getCategorySpending(category.id, reportRange.from, reportRange.to);
                  const limit = budget?.monthlyLimit || 0;
                  const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
                  const isOverBudget = spent > limit && limit > 0;
                  return (
                    <div key={category.id} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${isOverBudget ? dangerColor : borderColor}`, padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{category.icon}</span>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{category.label}</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowBudgetModal(category.id);
                            setBudgetEditAmount(limit.toString());
                          }}
                          style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: secondaryText }}
                          aria-label={`Edit ${category.label} budget`}
                        >
                          Edit
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: isOverBudget ? dangerColor : secondaryText }}>
                          {formatCurrency(spent)} spent
                        </span>
                        <span style={{ color: secondaryText }}>{formatCurrency(limit)} limit</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${percentage}%`, height: '100%', borderRadius: '4px',
                          backgroundColor: isOverBudget ? dangerColor : percentage > 80 ? '#f59e0b' : successColor,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      {isOverBudget && (
                        <div style={{ fontSize: '11px', color: dangerColor, marginTop: '6px', fontWeight: 600 }}>
                          ⚠️ Over budget by {formatCurrency(spent - limit)}
                        </div>
                      )}
                      {!isOverBudget && limit > 0 && (
                        <div style={{ fontSize: '11px', color: secondaryText, marginTop: '6px' }}>
                          {formatCurrency(limit - spent)} remaining
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accounts View */}
          {activeView === 'accounts' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Accounts</h2>
                <button
                  onClick={() => setShowTransferModal(true)}
                  style={{ padding: '8px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                >
                  ↔ Transfer Between Accounts
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {accounts.map(account => {
                  const accountTransactions = transactions.filter(t => t.account === account.id);
                  const recentTransactions = accountTransactions.slice(0, 3);
                  return (
                    <div key={account.id} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '28px' }}>{account.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{account.name}</div>
                          <div style={{ fontSize: '22px', fontWeight: 700, color: account.balance >= 0 ? successColor : dangerColor }}>
                            {formatCurrency(account.balance)}
                          </div>
                        </div>
                      </div>
                      <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '12px' }}>
                        <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '8px' }}>Recent Transactions</div>
                        {recentTransactions.length === 0 ? (
                          <div style={{ fontSize: '12px', color: secondaryText }}>No transactions yet.</div>
                        ) : (
                          recentTransactions.map(tx => (
                            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                              <span>{tx.description}</span>
                              <span style={{ fontWeight: 600, color: tx.amount >= 0 ? successColor : dangerColor }}>
                                {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      <div style={{ marginTop: '12px', fontSize: '12px', color: secondaryText }}>
                        {accountTransactions.length} total transactions
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeView === 'reports' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Spending Reports</h2>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  aria-label="Report period"
                  style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: cardBg, color: textColor }}
                >
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-3-months">Last 3 Months</option>
                </select>
              </div>

              {/* Category Breakdown */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Spending by Category</h3>
                {(() => {
                  const reportRange = getReportDateRange();
                  const categoryData = CATEGORIES
                    .map(c => ({ ...c, spent: getCategorySpending(c.id, reportRange.from, reportRange.to) }))
                    .filter(c => c.spent > 0)
                    .sort((a, b) => b.spent - a.spent);
                  const totalReportSpending = categoryData.reduce((sum, c) => sum + c.spent, 0);

                  if (categoryData.length === 0) {
                    return <p style={{ color: secondaryText, fontSize: '13px' }}>No spending data for this period.</p>;
                  }

                  return categoryData.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${borderColor}` }}>
                      <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 500 }}>{cat.label}</span>
                          <span style={{ fontWeight: 600 }}>{formatCurrency(cat.spent)}</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${(cat.spent / totalReportSpending * 100).toFixed(0)}%`, height: '100%', backgroundColor: cat.color, borderRadius: '3px' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: secondaryText, width: '40px', textAlign: 'right' }}>
                        {totalReportSpending > 0 ? Math.round(cat.spent / totalReportSpending * 100) : 0}%
                      </span>
                    </div>
                  ));
                })()}
              </div>

              {/* Budget vs Actual */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Budget vs Actual</h3>
                {budgets.map(budget => {
                  const cat = getCategoryInfo(budget.category);
                  const reportRange = getReportDateRange();
                  const spent = getCategorySpending(budget.category, reportRange.from, reportRange.to);
                  const isOver = spent > budget.monthlyLimit;
                  return (
                    <div key={budget.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                      <span style={{ fontSize: '16px' }}>{cat?.icon}</span>
                      <span style={{ flex: 1, fontWeight: 500 }}>{cat?.label}</span>
                      <span style={{ width: '100px', textAlign: 'right', color: isOver ? dangerColor : textColor }}>
                        {formatCurrency(spent)}
                      </span>
                      <span style={{ width: '20px', textAlign: 'center', color: secondaryText }}>/</span>
                      <span style={{ width: '100px', textAlign: 'right', color: secondaryText }}>
                        {formatCurrency(budget.monthlyLimit)}
                      </span>
                      <span style={{ width: '60px', textAlign: 'right', fontWeight: 600, color: isOver ? dangerColor : successColor }}>
                        {budget.monthlyLimit > 0 ? Math.round(spent / budget.monthlyLimit * 100) : 0}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recurring View */}
          {activeView === 'recurring' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Recurring Transactions</h2>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '4px 0', marginBottom: '16px' }}>
                <div style={{ padding: '12px 20px', fontSize: '14px', color: secondaryText, borderBottom: `1px solid ${borderColor}` }}>
                  Monthly recurring total: <strong style={{ color: dangerColor }}>{formatCurrency(getMonthlyRecurringTotal)}</strong>
                </div>
                {recurringItems.map(item => {
                  const cat = getCategoryInfo(item.category);
                  const acc = getAccountInfo(item.account);
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '14px 20px', borderBottom: `1px solid ${borderColor}`,
                        display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px',
                        opacity: item.active ? 1 : 0.5,
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{cat?.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.description}</div>
                        <div style={{ fontSize: '11px', color: secondaryText }}>
                          {cat?.label} · {acc?.name} · {item.frequency}
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, color: dangerColor }}>{formatCurrency(Math.abs(item.amount))}</span>
                      <span style={{ fontSize: '12px', color: secondaryText }}>Next: {formatDate(item.nextDate)}</span>
                      <button
                        onClick={() => toggleRecurringActive(item.id)}
                        style={{
                          padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', border: 'none',
                          backgroundColor: item.active ? successColor + '20' : isDarkMode ? '#334155' : '#f1f5f9',
                          color: item.active ? successColor : secondaryText,
                        }}
                        aria-label={item.active ? `Pause ${item.description}` : `Resume ${item.description}`}
                      >
                        {item.active ? 'Active' : 'Paused'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowAddModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Add Transaction</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Grocery Store"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Amount (negative for expenses)</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="-85.42"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Category</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                    aria-label="Transaction category"
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Account</label>
                  <select
                    value={newTransaction.account}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, account: e.target.value }))}
                    aria-label="Transaction account"
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Date</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  aria-label="Transaction date"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Notes</label>
                <input
                  type="text"
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTransaction.tags}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="groceries, weekly"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={addTransaction} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editTransaction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => { setShowEditModal(null); setEditTransaction(null); }}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Edit Transaction</h2>
              <button onClick={() => { setShowEditModal(null); setEditTransaction(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  value={editTransaction.description}
                  onChange={(e) => setEditTransaction(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Amount</label>
                <input
                  type="number"
                  value={editTransaction.amount}
                  onChange={(e) => setEditTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Category</label>
                  <select
                    value={editTransaction.category}
                    onChange={(e) => setEditTransaction(prev => ({ ...prev, category: e.target.value }))}
                    aria-label="Edit category"
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Account</label>
                  <select
                    value={editTransaction.account}
                    onChange={(e) => setEditTransaction(prev => ({ ...prev, account: e.target.value }))}
                    aria-label="Edit account"
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => { setShowEditModal(null); setEditTransaction(null); }} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={updateTransaction} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Edit Modal */}
      {showBudgetModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowBudgetModal(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                Edit {getCategoryInfo(showBudgetModal)?.label} Budget
              </h2>
              <button onClick={() => setShowBudgetModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Monthly Limit ($)</label>
              <input
                type="number"
                value={budgetEditAmount}
                onChange={(e) => setBudgetEditAmount(e.target.value)}
                placeholder="0.00"
                aria-label="Budget limit"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowBudgetModal(null)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={() => updateBudget(showBudgetModal)} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowTransferModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Transfer Funds</h2>
              <button onClick={() => setShowTransferModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>From Account</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  aria-label="Transfer from"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} ({formatCurrency(a.balance)})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>To Account</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  aria-label="Transfer to"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} ({formatCurrency(a.balance)})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Amount</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  aria-label="Transfer amount"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowTransferModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={executeTransfer} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
