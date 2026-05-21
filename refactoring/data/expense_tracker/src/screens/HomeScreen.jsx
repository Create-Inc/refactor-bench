import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';

// ─── Constants & Mock Data ─────────────────────────────────────────────────────

const CURRENCIES = { USD: '$', EUR: '\u20ac', GBP: '\u00a3', JPY: '\u00a5' };
const DEFAULT_CURRENCY = 'USD';

const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '\ud83c\udf54', color: '#ef4444' },
  { id: 'transport', label: 'Transport', icon: '\ud83d\ude97', color: '#3b82f6' },
  { id: 'shopping', label: 'Shopping', icon: '\ud83d\udecd\ufe0f', color: '#a855f7' },
  { id: 'bills', label: 'Bills & Utilities', icon: '\ud83d\udcb0', color: '#f97316' },
  { id: 'entertainment', label: 'Entertainment', icon: '\ud83c\udfac', color: '#ec4899' },
  { id: 'health', label: 'Health', icon: '\ud83c\udfe5', color: '#10b981' },
  { id: 'education', label: 'Education', icon: '\ud83d\udcda', color: '#6366f1' },
  { id: 'travel', label: 'Travel', icon: '\u2708\ufe0f', color: '#14b8a6' },
  { id: 'other', label: 'Other', icon: '\ud83d\udce6', color: '#64748b' },
];

const SORT_OPTIONS = [
  { id: 'date_desc', label: 'Newest First' },
  { id: 'date_asc', label: 'Oldest First' },
  { id: 'amount_desc', label: 'Highest Amount' },
  { id: 'amount_asc', label: 'Lowest Amount' },
  { id: 'category', label: 'By Category' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const INITIAL_EXPENSES = [
  { id: 'e1', title: 'Grocery Shopping', amount: 87.50, category: 'food', date: '2025-01-15', notes: 'Weekly groceries from Whole Foods', paymentMethod: 'credit_card', recurring: false },
  { id: 'e2', title: 'Monthly Metro Pass', amount: 127.00, category: 'transport', date: '2025-01-14', notes: 'January metro pass', paymentMethod: 'debit_card', recurring: true },
  { id: 'e3', title: 'Electric Bill', amount: 145.30, category: 'bills', date: '2025-01-13', notes: 'December electricity', paymentMethod: 'bank_transfer', recurring: true },
  { id: 'e4', title: 'Movie Tickets', amount: 32.00, category: 'entertainment', date: '2025-01-13', notes: 'Weekend movie with friends', paymentMethod: 'credit_card', recurring: false },
  { id: 'e5', title: 'New Running Shoes', amount: 159.99, category: 'shopping', date: '2025-01-12', notes: 'Nike Air Max for the gym', paymentMethod: 'credit_card', recurring: false },
  { id: 'e6', title: 'Dentist Visit', amount: 75.00, category: 'health', date: '2025-01-11', notes: 'Regular checkup and cleaning', paymentMethod: 'insurance', recurring: false },
  { id: 'e7', title: 'Online Course - React Native', amount: 49.99, category: 'education', date: '2025-01-10', notes: 'Udemy course on advanced RN', paymentMethod: 'credit_card', recurring: false },
  { id: 'e8', title: 'Lunch with Colleagues', amount: 28.50, category: 'food', date: '2025-01-10', notes: 'Thai restaurant downtown', paymentMethod: 'cash', recurring: false },
  { id: 'e9', title: 'Uber to Airport', amount: 45.00, category: 'transport', date: '2025-01-09', notes: 'Early morning ride to JFK', paymentMethod: 'credit_card', recurring: false },
  { id: 'e10', title: 'Flight to Chicago', amount: 289.00, category: 'travel', date: '2025-01-09', notes: 'Round trip for conference', paymentMethod: 'credit_card', recurring: false },
  { id: 'e11', title: 'Hotel - 2 Nights', amount: 340.00, category: 'travel', date: '2025-01-09', notes: 'Marriott downtown Chicago', paymentMethod: 'credit_card', recurring: false },
  { id: 'e12', title: 'Internet Bill', amount: 79.99, category: 'bills', date: '2025-01-08', notes: 'Monthly fiber internet', paymentMethod: 'bank_transfer', recurring: true },
  { id: 'e13', title: 'Coffee Beans', amount: 18.75, category: 'food', date: '2025-01-07', notes: 'Ethiopian single origin from local roaster', paymentMethod: 'cash', recurring: false },
  { id: 'e14', title: 'Gym Membership', amount: 55.00, category: 'health', date: '2025-01-05', notes: 'Monthly gym subscription', paymentMethod: 'debit_card', recurring: true },
  { id: 'e15', title: 'Streaming Services', amount: 42.97, category: 'entertainment', date: '2025-01-03', notes: 'Netflix + Spotify + HBO', paymentMethod: 'credit_card', recurring: true },
  { id: 'e16', title: 'Phone Bill', amount: 65.00, category: 'bills', date: '2025-01-02', notes: 'Monthly T-Mobile plan', paymentMethod: 'bank_transfer', recurring: true },
  { id: 'e17', title: 'New Year Dinner', amount: 120.00, category: 'food', date: '2025-01-01', notes: 'Celebration dinner at Italian restaurant', paymentMethod: 'credit_card', recurring: false },
  { id: 'e18', title: 'Parking Garage', amount: 35.00, category: 'transport', date: '2025-01-01', notes: 'NYE parking downtown', paymentMethod: 'cash', recurring: false },
];

const INITIAL_BUDGETS = [
  { id: 'b1', category: 'food', monthlyLimit: 400, alertThreshold: 0.8 },
  { id: 'b2', category: 'transport', monthlyLimit: 250, alertThreshold: 0.9 },
  { id: 'b3', category: 'shopping', monthlyLimit: 300, alertThreshold: 0.75 },
  { id: 'b4', category: 'bills', monthlyLimit: 500, alertThreshold: 0.95 },
  { id: 'b5', category: 'entertainment', monthlyLimit: 150, alertThreshold: 0.8 },
  { id: 'b6', category: 'health', monthlyLimit: 200, alertThreshold: 0.9 },
  { id: 'b7', category: 'education', monthlyLimit: 100, alertThreshold: 0.8 },
  { id: 'b8', category: 'travel', monthlyLimit: 800, alertThreshold: 0.7 },
];

const PAYMENT_METHODS = [
  { id: 'credit_card', label: 'Credit Card', icon: '\ud83d\udcb3' },
  { id: 'debit_card', label: 'Debit Card', icon: '\ud83c\udfb4' },
  { id: 'cash', label: 'Cash', icon: '\ud83d\udcb5' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '\ud83c\udfe6' },
  { id: 'insurance', label: 'Insurance', icon: '\ud83d\udee1\ufe0f' },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // Core state
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  // Navigation state
  const [activeTab, setActiveTab] = useState('expenses');

  // Expense list state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('food');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('credit_card');
  const [formRecurring, setFormRecurring] = useState(false);

  // Budget form state
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetThreshold, setBudgetThreshold] = useState('80');

  // Analytics state
  const [analyticsMonth, setAnalyticsMonth] = useState(0); // 0 = January 2025
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showCents, setShowCents] = useState(true);

  // ─── Persistence ──────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem('expenseTrackerExpenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      const savedBudgets = localStorage.getItem('expenseTrackerBudgets');
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
      const savedCurrency = localStorage.getItem('expenseTrackerCurrency');
      if (savedCurrency) setCurrency(savedCurrency);
      const savedDarkMode = localStorage.getItem('expenseTrackerDarkMode');
      if (savedDarkMode === 'true') setDarkMode(true);
      const savedShowCents = localStorage.getItem('expenseTrackerShowCents');
      if (savedShowCents === 'false') setShowCents(false);
    } catch (e) {
      console.error('Failed to load saved data');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expenseTrackerExpenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('expenseTrackerBudgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('expenseTrackerCurrency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('expenseTrackerDarkMode', darkMode.toString());
  }, [darkMode]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const formatCurrency = useCallback((amount) => {
    const symbol = CURRENCIES[currency] || '$';
    return showCents ? `${symbol}${amount.toFixed(2)}` : `${symbol}${Math.round(amount)}`;
  }, [currency, showCents]);

  const getCategoryInfo = useCallback((categoryId) => {
    return EXPENSE_CATEGORIES.find(c => c.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  }, []);

  const getPaymentInfo = useCallback((paymentId) => {
    return PAYMENT_METHODS.find(p => p.id === paymentId) || PAYMENT_METHODS[0];
  }, []);

  // ─── Derived Data ─────────────────────────────────────────────────────────

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.notes.toLowerCase().includes(query) ||
        getCategoryInfo(e.category).label.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory);
    }

    // Payment method filter
    if (filterPayment !== 'all') {
      result = result.filter(e => e.paymentMethod === filterPayment);
    }

    // Recurring filter
    if (showRecurringOnly) {
      result = result.filter(e => e.recurring);
    }

    // Sorting
    switch (sortBy) {
      case 'date_desc':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'date_asc':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'amount_desc':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        result.sort((a, b) => a.amount - b.amount);
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }

    return result;
  }, [expenses, searchQuery, filterCategory, filterPayment, sortBy, showRecurringOnly, getCategoryInfo]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const monthlySpentByCategory = useMemo(() => {
    const result = {};
    const targetMonth = analyticsMonth;
    const targetYear = 2025;
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
        result[e.category] = (result[e.category] || 0) + e.amount;
      }
    });
    return result;
  }, [expenses, analyticsMonth]);

  const budgetStatus = useMemo(() => {
    return budgets.map(b => {
      const spent = monthlySpentByCategory[b.category] || 0;
      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const isOverBudget = percentage > 100;
      const isNearLimit = percentage >= b.alertThreshold * 100;
      return { ...b, spent, percentage: Math.min(percentage, 100), isOverBudget, isNearLimit };
    });
  }, [budgets, monthlySpentByCategory]);

  const topCategories = useMemo(() => {
    const catTotals = {};
    expenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    return Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, total]) => ({ ...getCategoryInfo(cat), total }));
  }, [expenses, getCategoryInfo]);

  const dailyAverage = useMemo(() => {
    if (expenses.length === 0) return 0;
    const dates = expenses.map(e => new Date(e.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const daySpan = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
    return totalSpent / daySpan;
  }, [expenses, totalSpent]);

  const recurringTotal = useMemo(() => {
    return expenses.filter(e => e.recurring).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormAmount('');
    setFormCategory('food');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormNotes('');
    setFormPaymentMethod('credit_card');
    setFormRecurring(false);
  }, []);

  const handleAddExpense = useCallback(() => {
    if (!formTitle.trim() || !formAmount.trim()) {
      Alert.alert('Error', 'Please fill in title and amount');
      return;
    }
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    const newExpense = {
      id: `e${Date.now()}`,
      title: formTitle.trim(),
      amount,
      category: formCategory,
      date: formDate,
      notes: formNotes.trim(),
      paymentMethod: formPaymentMethod,
      recurring: formRecurring,
    };
    setExpenses(prev => [newExpense, ...prev]);
    setShowAddModal(false);
    resetForm();
  }, [formTitle, formAmount, formCategory, formDate, formNotes, formPaymentMethod, formRecurring, resetForm]);

  const handleEditExpense = useCallback(() => {
    if (!selectedExpense) return;
    if (!formTitle.trim() || !formAmount.trim()) {
      Alert.alert('Error', 'Please fill in title and amount');
      return;
    }
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    setExpenses(prev => prev.map(e =>
      e.id === selectedExpense.id
        ? { ...e, title: formTitle.trim(), amount, category: formCategory, date: formDate, notes: formNotes.trim(), paymentMethod: formPaymentMethod, recurring: formRecurring }
        : e
    ));
    setShowEditModal(false);
    setSelectedExpense(null);
    resetForm();
  }, [selectedExpense, formTitle, formAmount, formCategory, formDate, formNotes, formPaymentMethod, formRecurring, resetForm]);

  const handleDeleteExpense = useCallback((expenseId) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        setShowDetailModal(false);
        setSelectedExpense(null);
      }},
    ]);
  }, []);

  const openEditModal = useCallback((expense) => {
    setSelectedExpense(expense);
    setFormTitle(expense.title);
    setFormAmount(expense.amount.toString());
    setFormCategory(expense.category);
    setFormDate(expense.date);
    setFormNotes(expense.notes);
    setFormPaymentMethod(expense.paymentMethod);
    setFormRecurring(expense.recurring);
    setShowEditModal(true);
    setShowDetailModal(false);
  }, []);

  const openDetailModal = useCallback((expense) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  }, []);

  const handleSaveBudget = useCallback(() => {
    if (!editingBudget) return;
    const limit = parseFloat(budgetLimit);
    const threshold = parseFloat(budgetThreshold) / 100;
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Error', 'Please enter a valid budget limit');
      return;
    }
    if (isNaN(threshold) || threshold < 0 || threshold > 1) {
      Alert.alert('Error', 'Alert threshold must be between 0 and 100');
      return;
    }
    setBudgets(prev => prev.map(b =>
      b.id === editingBudget.id ? { ...b, monthlyLimit: limit, alertThreshold: threshold } : b
    ));
    setShowBudgetModal(false);
    setEditingBudget(null);
  }, [editingBudget, budgetLimit, budgetThreshold]);

  const openBudgetEdit = useCallback((budget) => {
    setEditingBudget(budget);
    setBudgetLimit(budget.monthlyLimit.toString());
    setBudgetThreshold((budget.alertThreshold * 100).toString());
    setShowBudgetModal(true);
  }, []);

  // ─── Theme Colors ─────────────────────────────────────────────────────────

  const theme = darkMode ? {
    bg: '#0f172a', card: '#1e293b', text: '#f8fafc', textSecondary: '#94a3b8',
    border: '#334155', accent: '#3b82f6', danger: '#ef4444', success: '#22c55e',
    inputBg: '#334155', tabBg: '#1e293b', tabActive: '#3b82f6',
  } : {
    bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', textSecondary: '#64748b',
    border: '#e2e8f0', accent: '#3b82f6', danger: '#ef4444', success: '#22c55e',
    inputBg: '#f8fafc', tabBg: '#ffffff', tabActive: '#3b82f6',
  };

  // ─── Render: Summary Card ────────────────────────────────────────────────

  const renderSummaryCard = () => (
    <View data-testid="summary-card" style={{ backgroundColor: theme.accent, borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <Text style={{ color: '#ffffff', fontSize: 14, opacity: 0.8 }}>Total Spent</Text>
      <Text data-testid="total-spent" style={{ color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginVertical: 4 }}>
        {formatCurrency(totalSpent)}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <View>
          <Text style={{ color: '#ffffff', opacity: 0.7, fontSize: 12 }}>Daily Average</Text>
          <Text data-testid="daily-average" style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>{formatCurrency(dailyAverage)}</Text>
        </View>
        <View>
          <Text style={{ color: '#ffffff', opacity: 0.7, fontSize: 12 }}>Recurring</Text>
          <Text data-testid="recurring-total" style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>{formatCurrency(recurringTotal)}</Text>
        </View>
        <View>
          <Text style={{ color: '#ffffff', opacity: 0.7, fontSize: 12 }}>Transactions</Text>
          <Text data-testid="transaction-count" style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>{expenses.length}</Text>
        </View>
      </View>
    </View>
  );

  // ─── Render: Expense Card ────────────────────────────────────────────────

  const renderExpenseCard = (expense) => {
    const catInfo = getCategoryInfo(expense.category);
    const payInfo = getPaymentInfo(expense.paymentMethod);
    return (
      <Pressable
        key={expense.id}
        data-testid={`expense-${expense.id}`}
        onPress={() => openDetailModal(expense)}
        style={{ backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.border }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: catInfo.color + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 18 }}>{catInfo.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>{expense.title}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                {catInfo.label} \u00b7 {expense.date} {expense.recurring ? '\ud83d\udd01' : ''}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>{formatCurrency(expense.amount)}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>{payInfo.icon} {payInfo.label}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // ─── Render: Expenses Tab ────────────────────────────────────────────────

  const renderExpensesTab = () => (
    <View data-testid="expenses-tab">
      {renderSummaryCard()}

      {/* Search */}
      <View style={{ marginBottom: 12 }}>
        <TextInput
          data-testid="search-input"
          placeholder="Search expenses..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ backgroundColor: theme.inputBg, borderRadius: 10, padding: 12, color: theme.text, borderWidth: 1, borderColor: theme.border, fontSize: 15 }}
        />
      </View>

      {/* Filters Row */}
      <View data-testid="filters-row" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1, minWidth: 120 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              data-testid="filter-category-all"
              onPress={() => setFilterCategory('all')}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6, backgroundColor: filterCategory === 'all' ? theme.accent : theme.inputBg }}
            >
              <Text style={{ color: filterCategory === 'all' ? '#fff' : theme.text, fontSize: 12 }}>All</Text>
            </TouchableOpacity>
            {EXPENSE_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                data-testid={`filter-category-${cat.id}`}
                onPress={() => setFilterCategory(cat.id)}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6, backgroundColor: filterCategory === cat.id ? cat.color : theme.inputBg }}
              >
                <Text style={{ color: filterCategory === cat.id ? '#fff' : theme.text, fontSize: 12 }}>{cat.icon} {cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Sort & Recurring Toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.id}
              data-testid={`sort-${opt.id}`}
              onPress={() => setSortBy(opt.id)}
              style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6, backgroundColor: sortBy === opt.id ? theme.accent : theme.inputBg }}
            >
              <Text style={{ color: sortBy === opt.id ? '#fff' : theme.textSecondary, fontSize: 11 }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          data-testid="toggle-recurring"
          onPress={() => setShowRecurringOnly(!showRecurringOnly)}
          style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: showRecurringOnly ? theme.accent : theme.inputBg, marginLeft: 8 }}
        >
          <Text style={{ color: showRecurringOnly ? '#fff' : theme.textSecondary, fontSize: 11 }}>\ud83d\udd01 Recurring</Text>
        </TouchableOpacity>
      </View>

      {/* Expense List */}
      <View data-testid="expense-list">
        {filteredExpenses.length === 0 ? (
          <View data-testid="empty-state" style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 48 }}>\ud83d\udcad</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 12, fontSize: 16 }}>No expenses found</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>Try adjusting your filters</Text>
          </View>
        ) : (
          filteredExpenses.map(expense => renderExpenseCard(expense))
        )}
      </View>

      {/* Results Count */}
      <Text data-testid="results-count" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8, fontSize: 12 }}>
        Showing {filteredExpenses.length} of {expenses.length} expenses
      </Text>
    </View>
  );

  // ─── Render: Budgets Tab ─────────────────────────────────────────────────

  const renderBudgetsTab = () => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalBudgetSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
    const overBudgetCount = budgetStatus.filter(b => b.isOverBudget).length;

    return (
      <View data-testid="budgets-tab">
        {/* Budget Overview */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Monthly Budget Overview</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Total Budget</Text>
              <Text data-testid="total-budget" style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>{formatCurrency(totalBudget)}</Text>
            </View>
            <View>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Spent</Text>
              <Text data-testid="total-budget-spent" style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>{formatCurrency(totalBudgetSpent)}</Text>
            </View>
            <View>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Over Budget</Text>
              <Text data-testid="over-budget-count" style={{ color: overBudgetCount > 0 ? theme.danger : theme.success, fontSize: 20, fontWeight: 'bold' }}>{overBudgetCount}</Text>
            </View>
          </View>
          {/* Overall progress bar */}
          <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, marginTop: 16, overflow: 'hidden' }}>
            <View
              data-testid="overall-budget-bar"
              style={{ height: '100%', width: `${Math.min((totalBudgetSpent / totalBudget) * 100, 100)}%`, backgroundColor: totalBudgetSpent > totalBudget ? theme.danger : theme.accent, borderRadius: 4 }}
            />
          </View>
        </View>

        {/* Individual Budget Cards */}
        {budgetStatus.map(budget => {
          const catInfo = getCategoryInfo(budget.category);
          return (
            <Pressable
              key={budget.id}
              data-testid={`budget-${budget.id}`}
              onPress={() => openBudgetEdit(budget)}
              style={{ backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: budget.isOverBudget ? theme.danger : theme.border }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>{catInfo.icon}</Text>
                  <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>{catInfo.label}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: theme.text, fontWeight: 'bold' }}>{formatCurrency(budget.spent)} / {formatCurrency(budget.monthlyLimit)}</Text>
                  {budget.isOverBudget && <Text style={{ color: theme.danger, fontSize: 11, fontWeight: '600' }}>Over budget!</Text>}
                  {budget.isNearLimit && !budget.isOverBudget && <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: '600' }}>Near limit</Text>}
                </View>
              </View>
              {/* Progress bar */}
              <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${budget.percentage}%`, backgroundColor: budget.isOverBudget ? theme.danger : budget.isNearLimit ? '#f59e0b' : theme.success, borderRadius: 3 }} />
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  // ─── Render: Analytics Tab ───────────────────────────────────────────────

  const renderAnalyticsTab = () => {
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === analyticsMonth && d.getFullYear() === 2025;
    });
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthAvg = monthExpenses.length > 0 ? monthTotal / monthExpenses.length : 0;
    const maxCatSpend = Math.max(...Object.values(monthlySpentByCategory), 1);

    return (
      <View data-testid="analytics-tab">
        {/* Month Selector */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            data-testid="prev-month"
            onPress={() => setAnalyticsMonth(Math.max(0, analyticsMonth - 1))}
            style={{ padding: 8 }}
          >
            <Text style={{ color: theme.accent, fontSize: 20 }}>\u25c0</Text>
          </TouchableOpacity>
          <Text data-testid="analytics-month" style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginHorizontal: 20 }}>
            {MONTHS[analyticsMonth]} 2025
          </Text>
          <TouchableOpacity
            data-testid="next-month"
            onPress={() => setAnalyticsMonth(Math.min(11, analyticsMonth + 1))}
            style={{ padding: 8 }}
          >
            <Text style={{ color: theme.accent, fontSize: 20 }}>\u25b6</Text>
          </TouchableOpacity>
        </View>

        {/* Month Summary */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Month Summary</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Total</Text>
              <Text data-testid="month-total" style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{formatCurrency(monthTotal)}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Average</Text>
              <Text data-testid="month-average" style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{formatCurrency(monthAvg)}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Count</Text>
              <Text data-testid="month-count" style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{monthExpenses.length}</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown Bar Chart */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Spending by Category</Text>
          {EXPENSE_CATEGORIES.filter(c => monthlySpentByCategory[c.id]).map(cat => {
            const spent = monthlySpentByCategory[cat.id];
            const pct = (spent / maxCatSpend) * 100;
            return (
              <View key={cat.id} data-testid={`analytics-cat-${cat.id}`} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: theme.text, fontSize: 13 }}>{cat.icon} {cat.label}</Text>
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{formatCurrency(spent)}</Text>
                </View>
                <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${pct}%`, backgroundColor: cat.color, borderRadius: 4 }} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Top Categories */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Top Spending Categories</Text>
          {topCategories.map((cat, idx) => (
            <View key={cat.id} data-testid={`top-cat-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: idx < topCategories.length - 1 ? 1 : 0, borderBottomColor: theme.border }}>
              <Text style={{ color: theme.textSecondary, fontWeight: 'bold', fontSize: 16, width: 24 }}>#{idx + 1}</Text>
              <Text style={{ fontSize: 20, marginRight: 8 }}>{cat.icon}</Text>
              <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>{cat.label}</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 14 }}>{formatCurrency(cat.total)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ─── Render: Settings Tab ────────────────────────────────────────────────

  const renderSettingsTab = () => (
    <View data-testid="settings-tab">
      <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Settings</Text>

        {/* Currency Selector */}
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 8 }}>Currency</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {Object.entries(CURRENCIES).map(([code, symbol]) => (
            <TouchableOpacity
              key={code}
              data-testid={`currency-${code}`}
              onPress={() => setCurrency(code)}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 8, backgroundColor: currency === code ? theme.accent : theme.inputBg }}
            >
              <Text style={{ color: currency === code ? '#fff' : theme.text, fontWeight: '600' }}>{symbol} {code}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Toggle Settings */}
        <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16 }}>
          <Pressable
            data-testid="toggle-dark-mode"
            onPress={() => setDarkMode(!darkMode)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}
          >
            <View>
              <Text style={{ color: theme.text, fontSize: 15 }}>Dark Mode</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Switch between light and dark themes</Text>
            </View>
            <Text style={{ fontSize: 24 }}>{darkMode ? '\ud83c\udf19' : '\u2600\ufe0f'}</Text>
          </Pressable>

          <Pressable
            data-testid="toggle-show-cents"
            onPress={() => {
              setShowCents(!showCents);
              localStorage.setItem('expenseTrackerShowCents', (!showCents).toString());
            }}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.border }}
          >
            <View>
              <Text style={{ color: theme.text, fontSize: 15 }}>Show Cents</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Display amounts with decimal places</Text>
            </View>
            <View style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: showCents ? theme.accent : theme.border, justifyContent: 'center', padding: 2 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: showCents ? 'flex-end' : 'flex-start' }} />
            </View>
          </Pressable>

          <Pressable
            data-testid="toggle-notifications"
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.border }}
          >
            <View>
              <Text style={{ color: theme.text, fontSize: 15 }}>Budget Notifications</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Get alerts when approaching budget limits</Text>
            </View>
            <View style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: notificationsEnabled ? theme.accent : theme.border, justifyContent: 'center', padding: 2 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: notificationsEnabled ? 'flex-end' : 'flex-start' }} />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Data Management */}
      <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border }}>
        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Data Management</Text>
        <TouchableOpacity
          data-testid="export-data-btn"
          onPress={() => Alert.alert('Export', 'Data exported successfully!')}
          style={{ backgroundColor: theme.accent, borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>\ud83d\udce4 Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          data-testid="clear-data-btn"
          onPress={() => Alert.alert('Clear Data', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => {
              setExpenses(INITIAL_EXPENSES);
              setBudgets(INITIAL_BUDGETS);
            }},
          ])}
          style={{ backgroundColor: theme.danger, borderRadius: 8, padding: 12, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>\ud83d\uddd1\ufe0f Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render: Add/Edit Expense Modal ──────────────────────────────────────

  const renderExpenseFormModal = (isEdit) => {
    const isVisible = isEdit ? showEditModal : showAddModal;
    if (!isVisible) return null;

    return (
      <View data-testid={isEdit ? 'edit-modal' : 'add-modal'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 100 }}>
        <Pressable style={{ flex: 1 }} onPress={() => { isEdit ? setShowEditModal(false) : setShowAddModal(false); resetForm(); }} />
        <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>
            {isEdit ? 'Edit Expense' : 'Add Expense'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Title</Text>
            <TextInput
              data-testid="form-title"
              placeholder="Expense title"
              placeholderTextColor={theme.textSecondary}
              value={formTitle}
              onChangeText={setFormTitle}
              style={{ backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 12, fontSize: 15 }}
            />

            {/* Amount */}
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Amount</Text>
            <TextInput
              data-testid="form-amount"
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="decimal-pad"
              style={{ backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 12, fontSize: 15 }}
            />

            {/* Category Selector */}
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {EXPENSE_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  data-testid={`form-cat-${cat.id}`}
                  onPress={() => setFormCategory(cat.id)}
                  style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: formCategory === cat.id ? cat.color : theme.inputBg, borderWidth: 1, borderColor: formCategory === cat.id ? cat.color : theme.border }}
                >
                  <Text style={{ color: formCategory === cat.id ? '#fff' : theme.text, fontSize: 12 }}>{cat.icon} {cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date */}
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Date</Text>
            <TextInput
              data-testid="form-date"
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={formDate}
              onChangeText={setFormDate}
              style={{ backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 12, fontSize: 15 }}
            />

            {/* Payment Method */}
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Payment Method</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {PAYMENT_METHODS.map(pm => (
                <TouchableOpacity
                  key={pm.id}
                  data-testid={`form-pay-${pm.id}`}
                  onPress={() => setFormPaymentMethod(pm.id)}
                  style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: formPaymentMethod === pm.id ? theme.accent : theme.inputBg, borderWidth: 1, borderColor: formPaymentMethod === pm.id ? theme.accent : theme.border }}
                >
                  <Text style={{ color: formPaymentMethod === pm.id ? '#fff' : theme.text, fontSize: 12 }}>{pm.icon} {pm.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Notes</Text>
            <TextInput
              data-testid="form-notes"
              placeholder="Optional notes"
              placeholderTextColor={theme.textSecondary}
              value={formNotes}
              onChangeText={setFormNotes}
              multiline
              numberOfLines={3}
              style={{ backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 12, fontSize: 15, minHeight: 70 }}
            />

            {/* Recurring Toggle */}
            <Pressable
              data-testid="form-recurring-toggle"
              onPress={() => setFormRecurring(!formRecurring)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 16 }}
            >
              <Text style={{ color: theme.text, fontSize: 15 }}>\ud83d\udd01 Recurring Expense</Text>
              <View style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: formRecurring ? theme.accent : theme.border, justifyContent: 'center', padding: 2 }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: formRecurring ? 'flex-end' : 'flex-start' }} />
              </View>
            </Pressable>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <TouchableOpacity
                data-testid="form-cancel"
                onPress={() => { isEdit ? setShowEditModal(false) : setShowAddModal(false); resetForm(); }}
                style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.inputBg, alignItems: 'center' }}
              >
                <Text style={{ color: theme.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                data-testid="form-save"
                onPress={isEdit ? handleEditExpense : handleAddExpense}
                style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.accent, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{isEdit ? 'Save Changes' : 'Add Expense'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  // ─── Render: Expense Detail Modal ────────────────────────────────────────

  const renderDetailModal = () => {
    if (!showDetailModal || !selectedExpense) return null;
    const catInfo = getCategoryInfo(selectedExpense.category);
    const payInfo = getPaymentInfo(selectedExpense.paymentMethod);

    return (
      <View data-testid="detail-modal" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => { setShowDetailModal(false); setSelectedExpense(null); }} />
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 24, width: '90%', maxWidth: 400 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: catInfo.color + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 28 }}>{catInfo.icon}</Text>
            </View>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 20 }}>{selectedExpense.title}</Text>
            <Text data-testid="detail-amount" style={{ color: theme.accent, fontWeight: 'bold', fontSize: 28, marginTop: 4 }}>{formatCurrency(selectedExpense.amount)}</Text>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: theme.textSecondary }}>Category</Text>
              <Text style={{ color: theme.text }}>{catInfo.icon} {catInfo.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: theme.textSecondary }}>Date</Text>
              <Text data-testid="detail-date" style={{ color: theme.text }}>{selectedExpense.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: theme.textSecondary }}>Payment</Text>
              <Text style={{ color: theme.text }}>{payInfo.icon} {payInfo.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ color: theme.textSecondary }}>Recurring</Text>
              <Text style={{ color: theme.text }}>{selectedExpense.recurring ? 'Yes \ud83d\udd01' : 'No'}</Text>
            </View>
            {selectedExpense.notes ? (
              <View style={{ paddingVertical: 8 }}>
                <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>Notes</Text>
                <Text data-testid="detail-notes" style={{ color: theme.text }}>{selectedExpense.notes}</Text>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              data-testid="detail-edit-btn"
              onPress={() => openEditModal(selectedExpense)}
              style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: theme.accent, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>\u270f\ufe0f Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              data-testid="detail-delete-btn"
              onPress={() => handleDeleteExpense(selectedExpense.id)}
              style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: theme.danger, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>\ud83d\uddd1\ufe0f Delete</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            data-testid="detail-close-btn"
            onPress={() => { setShowDetailModal(false); setSelectedExpense(null); }}
            style={{ padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Render: Budget Edit Modal ───────────────────────────────────────────

  const renderBudgetModal = () => {
    if (!showBudgetModal || !editingBudget) return null;
    const catInfo = getCategoryInfo(editingBudget.category);

    return (
      <View data-testid="budget-modal" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 24, width: '90%', maxWidth: 400 }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 20, marginBottom: 4 }}>Edit Budget</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 16 }}>{catInfo.icon} {catInfo.label}</Text>

          <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Monthly Limit ({CURRENCIES[currency]})</Text>
          <TextInput
            data-testid="budget-limit-input"
            placeholder="0.00"
            placeholderTextColor={theme.textSecondary}
            value={budgetLimit}
            onChangeText={setBudgetLimit}
            keyboardType="decimal-pad"
            style={{ backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 12, fontSize: 15 }}
          />

          <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Alert Threshold (%)</Text>
          <TextInput
            data-testid="budget-threshold-input"
            placeholder="80"
            placeholderTextColor={theme.textSecondary}
            value={budgetThreshold}
            onChangeText={setBudgetThreshold}
            keyboardType="number-pad"
            style={{ backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 16, fontSize: 15 }}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              data-testid="budget-cancel"
              onPress={() => { setShowBudgetModal(false); setEditingBudget(null); }}
              style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.inputBg, alignItems: 'center' }}
            >
              <Text style={{ color: theme.text, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              data-testid="budget-save"
              onPress={handleSaveBudget}
              style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.accent, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ─── Render: Tab Content ─────────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'expenses': return renderExpensesTab();
      case 'budgets': return renderBudgetsTab();
      case 'analytics': return renderAnalyticsTab();
      case 'settings': return renderSettingsTab();
      default: return renderExpensesTab();
    }
  };

  // ─── Main Render ─────────────────────────────────────────────────────────

  return (
    <View data-testid="home-screen" style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View data-testid="header" style={{ backgroundColor: theme.card, paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Welcome back</Text>
            <Text data-testid="app-title" style={{ color: theme.text, fontSize: 22, fontWeight: 'bold' }}>ExpenseTracker</Text>
          </View>
          <TouchableOpacity
            data-testid="add-expense-fab"
            onPress={() => setShowAddModal(true)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 24, lineHeight: 26 }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView data-testid="content-scroll" style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View data-testid="tab-bar" style={{ flexDirection: 'row', backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8 }}>
        {[
          { id: 'expenses', label: 'Expenses', icon: '\ud83d\udcb8' },
          { id: 'budgets', label: 'Budgets', icon: '\ud83d\udcca' },
          { id: 'analytics', label: 'Analytics', icon: '\ud83d\udcc8' },
          { id: 'settings', label: 'Settings', icon: '\u2699\ufe0f' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onPress={() => setActiveTab(tab.id)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
          >
            <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            <Text style={{ color: activeTab === tab.id ? theme.tabActive : theme.textSecondary, fontSize: 11, marginTop: 2, fontWeight: activeTab === tab.id ? '600' : '400' }}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modals */}
      {renderExpenseFormModal(false)}
      {renderExpenseFormModal(true)}
      {renderDetailModal()}
      {renderBudgetModal()}
    </View>
  );
}
