"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ──── TypeScript Types & Interfaces ────

type CategoryType =
  | "food"
  | "transport"
  | "entertainment"
  | "utilities"
  | "shopping"
  | "health"
  | "education"
  | "travel"
  | "subscriptions"
  | "other";

type PaymentMethod =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "digital_wallet";

type RecurrenceInterval = "daily" | "weekly" | "monthly" | "yearly";

type ViewType =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "analytics"
  | "accounts"
  | "settings";

type SortField = "date" | "amount" | "category" | "description";
type SortDirection = "asc" | "desc";

type TransactionType = "expense" | "income";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryType;
  description: string;
  date: number;
  paymentMethod: PaymentMethod;
  tags: string[];
  notes: string;
  isRecurring: boolean;
  recurrence?: RecurrenceInterval;
  accountId: string;
}

interface Budget {
  id: string;
  category: CategoryType;
  limit: number;
  period: "monthly" | "weekly";
  alertThreshold: number;
}

interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "cash" | "investment";
  balance: number;
  currency: string;
  color: string;
  icon: string;
}

interface DateRange {
  start: number;
  end: number;
}

interface FilterState {
  search: string;
  category: CategoryType | "all";
  transactionType: TransactionType | "all";
  paymentMethod: PaymentMethod | "all";
  accountId: string | "all";
  dateRange: DateRange | null;
  minAmount: number | null;
  maxAmount: number | null;
}

interface AppSettings {
  currency: string;
  currencySymbol: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  weekStartsOn: "sunday" | "monday";
  showCents: boolean;
  enableNotifications: boolean;
  darkMode: boolean;
  compactView: boolean;
}

interface MonthlyAggregate {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

// ──── Constants ────

const CATEGORY_CONFIG: Record<
  CategoryType,
  { label: string; icon: string; color: string }
> = {
  food: { label: "Food & Dining", icon: "🍔", color: "#ef4444" },
  transport: { label: "Transport", icon: "🚗", color: "#f97316" },
  entertainment: { label: "Entertainment", icon: "🎬", color: "#a855f7" },
  utilities: { label: "Utilities", icon: "💡", color: "#eab308" },
  shopping: { label: "Shopping", icon: "🛍️", color: "#ec4899" },
  health: { label: "Health", icon: "🏥", color: "#22c55e" },
  education: { label: "Education", icon: "📚", color: "#3b82f6" },
  travel: { label: "Travel", icon: "✈️", color: "#06b6d4" },
  subscriptions: { label: "Subscriptions", icon: "🔄", color: "#8b5cf6" },
  other: { label: "Other", icon: "📦", color: "#64748b" },
};

const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  cash: "Cash",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  bank_transfer: "Bank Transfer",
  digital_wallet: "Digital Wallet",
};

const ALL_CATEGORIES: CategoryType[] = [
  "food",
  "transport",
  "entertainment",
  "utilities",
  "shopping",
  "health",
  "education",
  "travel",
  "subscriptions",
  "other",
];

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: "acc1",
    name: "Main Checking",
    type: "checking",
    balance: 4250.75,
    currency: "USD",
    color: "#3b82f6",
    icon: "🏦",
  },
  {
    id: "acc2",
    name: "Savings",
    type: "savings",
    balance: 12500.0,
    currency: "USD",
    color: "#22c55e",
    icon: "💰",
  },
  {
    id: "acc3",
    name: "Credit Card",
    type: "credit",
    balance: -1340.5,
    currency: "USD",
    color: "#ef4444",
    icon: "💳",
  },
  {
    id: "acc4",
    name: "Cash Wallet",
    type: "cash",
    balance: 180.0,
    currency: "USD",
    color: "#f97316",
    icon: "💵",
  },
  {
    id: "acc5",
    name: "Investment",
    type: "investment",
    balance: 8900.0,
    currency: "USD",
    color: "#8b5cf6",
    icon: "📈",
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx1",
    type: "expense",
    amount: 45.5,
    category: "food",
    description: "Grocery shopping at Whole Foods",
    date: Date.now() - 86400000 * 1,
    paymentMethod: "debit_card",
    tags: ["groceries", "weekly"],
    notes: "Weekly meal prep supplies",
    isRecurring: false,
    accountId: "acc1",
  },
  {
    id: "tx2",
    type: "expense",
    amount: 120.0,
    category: "utilities",
    description: "Electric bill - March",
    date: Date.now() - 86400000 * 3,
    paymentMethod: "bank_transfer",
    tags: ["bills", "monthly"],
    notes: "",
    isRecurring: true,
    recurrence: "monthly",
    accountId: "acc1",
  },
  {
    id: "tx3",
    type: "income",
    amount: 3500.0,
    category: "other",
    description: "Monthly salary",
    date: Date.now() - 86400000 * 5,
    paymentMethod: "bank_transfer",
    tags: ["salary", "income"],
    notes: "Net after taxes",
    isRecurring: true,
    recurrence: "monthly",
    accountId: "acc1",
  },
  {
    id: "tx4",
    type: "expense",
    amount: 35.0,
    category: "transport",
    description: "Uber rides this week",
    date: Date.now() - 86400000 * 2,
    paymentMethod: "digital_wallet",
    tags: ["uber", "commute"],
    notes: "",
    isRecurring: false,
    accountId: "acc1",
  },
  {
    id: "tx5",
    type: "expense",
    amount: 14.99,
    category: "subscriptions",
    description: "Netflix monthly",
    date: Date.now() - 86400000 * 7,
    paymentMethod: "credit_card",
    tags: ["streaming", "monthly"],
    notes: "Standard plan",
    isRecurring: true,
    recurrence: "monthly",
    accountId: "acc3",
  },
  {
    id: "tx6",
    type: "expense",
    amount: 250.0,
    category: "shopping",
    description: "New running shoes",
    date: Date.now() - 86400000 * 4,
    paymentMethod: "credit_card",
    tags: ["fitness", "shoes"],
    notes: "Nike Air Max",
    isRecurring: false,
    accountId: "acc3",
  },
  {
    id: "tx7",
    type: "expense",
    amount: 80.0,
    category: "health",
    description: "Gym membership",
    date: Date.now() - 86400000 * 10,
    paymentMethod: "debit_card",
    tags: ["fitness", "monthly"],
    notes: "",
    isRecurring: true,
    recurrence: "monthly",
    accountId: "acc1",
  },
  {
    id: "tx8",
    type: "income",
    amount: 500.0,
    category: "other",
    description: "Freelance design project",
    date: Date.now() - 86400000 * 6,
    paymentMethod: "bank_transfer",
    tags: ["freelance", "design"],
    notes: "Logo design for startup",
    isRecurring: false,
    accountId: "acc1",
  },
  {
    id: "tx9",
    type: "expense",
    amount: 65.0,
    category: "entertainment",
    description: "Concert tickets",
    date: Date.now() - 86400000 * 8,
    paymentMethod: "credit_card",
    tags: ["music", "events"],
    notes: "Jazz festival",
    isRecurring: false,
    accountId: "acc3",
  },
  {
    id: "tx10",
    type: "expense",
    amount: 42.0,
    category: "food",
    description: "Dinner at Italian restaurant",
    date: Date.now() - 86400000 * 2,
    paymentMethod: "cash",
    tags: ["dining", "restaurant"],
    notes: "Date night",
    isRecurring: false,
    accountId: "acc4",
  },
  {
    id: "tx11",
    type: "expense",
    amount: 200.0,
    category: "education",
    description: "Online TypeScript course",
    date: Date.now() - 86400000 * 15,
    paymentMethod: "credit_card",
    tags: ["learning", "programming"],
    notes: "Udemy course on advanced TS",
    isRecurring: false,
    accountId: "acc3",
  },
  {
    id: "tx12",
    type: "expense",
    amount: 1200.0,
    category: "travel",
    description: "Flight tickets to NYC",
    date: Date.now() - 86400000 * 12,
    paymentMethod: "credit_card",
    tags: ["flights", "vacation"],
    notes: "Round trip, economy class",
    isRecurring: false,
    accountId: "acc3",
  },
  {
    id: "tx13",
    type: "income",
    amount: 150.0,
    category: "other",
    description: "Sold old textbooks",
    date: Date.now() - 86400000 * 9,
    paymentMethod: "digital_wallet",
    tags: ["sales"],
    notes: "Sold on marketplace",
    isRecurring: false,
    accountId: "acc1",
  },
  {
    id: "tx14",
    type: "expense",
    amount: 9.99,
    category: "subscriptions",
    description: "Spotify Premium",
    date: Date.now() - 86400000 * 14,
    paymentMethod: "credit_card",
    tags: ["music", "monthly"],
    notes: "",
    isRecurring: true,
    recurrence: "monthly",
    accountId: "acc3",
  },
  {
    id: "tx15",
    type: "expense",
    amount: 55.0,
    category: "utilities",
    description: "Internet bill",
    date: Date.now() - 86400000 * 11,
    paymentMethod: "bank_transfer",
    tags: ["bills", "monthly"],
    notes: "Fiber 100Mbps",
    isRecurring: true,
    recurrence: "monthly",
    accountId: "acc1",
  },
];

const INITIAL_BUDGETS: Budget[] = [
  {
    id: "b1",
    category: "food",
    limit: 400,
    period: "monthly",
    alertThreshold: 80,
  },
  {
    id: "b2",
    category: "transport",
    limit: 200,
    period: "monthly",
    alertThreshold: 75,
  },
  {
    id: "b3",
    category: "entertainment",
    limit: 150,
    period: "monthly",
    alertThreshold: 80,
  },
  {
    id: "b4",
    category: "shopping",
    limit: 300,
    period: "monthly",
    alertThreshold: 70,
  },
  {
    id: "b5",
    category: "subscriptions",
    limit: 50,
    period: "monthly",
    alertThreshold: 90,
  },
  {
    id: "b6",
    category: "utilities",
    limit: 250,
    period: "monthly",
    alertThreshold: 85,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  currency: "USD",
  currencySymbol: "$",
  dateFormat: "MM/DD/YYYY",
  weekStartsOn: "sunday",
  showCents: true,
  enableNotifications: true,
  darkMode: false,
  compactView: false,
};

// ──── Helper Functions ────

function formatCurrency(amount: number, settings: AppSettings): string {
  const abs = Math.abs(amount);
  const formatted = settings.showCents
    ? abs.toFixed(2)
    : Math.round(abs).toString();
  const sign = amount < 0 ? "-" : "";
  return `${sign}${settings.currencySymbol}${formatted}`;
}

function formatDate(
  timestamp: number,
  format: AppSettings["dateFormat"]
): string {
  const d = new Date(timestamp);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  if (format === "DD/MM/YYYY") return `${day}/${month}/${year}`;
  if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
  return `${month}/${day}/${year}`;
}

function getMonthKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function calculateBudgetSpent(
  transactions: Transaction[],
  budget: Budget
): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category === budget.category &&
        t.date >= startOfMonth
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

// ──── Main Component ────

export default function ExpenseTracker() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    transactionType: "all",
    paymentMethod: "all",
    accountId: "all",
    dateRange: null,
    minAmount: null,
    maxAmount: null,
  });

  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // ──── Persistence ────

  useEffect(() => {
    const savedTransactions = localStorage.getItem(
      "expenseTrackerTransactions"
    );
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        console.error("Failed to parse saved transactions");
      }
    }
    const savedBudgets = localStorage.getItem("expenseTrackerBudgets");
    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch (e) {
        console.error("Failed to parse saved budgets");
      }
    }
    const savedAccounts = localStorage.getItem("expenseTrackerAccounts");
    if (savedAccounts) {
      try {
        setAccounts(JSON.parse(savedAccounts));
      } catch (e) {
        console.error("Failed to parse saved accounts");
      }
    }
    const savedSettings = localStorage.getItem("expenseTrackerSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse saved settings");
      }
    }
    const savedView = localStorage.getItem("expenseTrackerView");
    if (savedView) {
      setActiveView(savedView as ViewType);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "expenseTrackerTransactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem("expenseTrackerBudgets", JSON.stringify(budgets));
  }, [budgets]);
  useEffect(() => {
    localStorage.setItem("expenseTrackerAccounts", JSON.stringify(accounts));
  }, [accounts]);
  useEffect(() => {
    localStorage.setItem("expenseTrackerSettings", JSON.stringify(settings));
  }, [settings]);

  // ──── Keyboard Shortcuts ────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedTransaction(null);
        setShowAddModal(false);
        setShowBudgetModal(false);
        setShowTransferModal(false);
        setEditingBudget(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setShowAddModal(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ──── Computed Values ────

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchNotes = t.notes.toLowerCase().includes(q);
        if (!matchDesc && !matchTags && !matchNotes) return false;
      }
      if (filters.category !== "all" && t.category !== filters.category)
        return false;
      if (
        filters.transactionType !== "all" &&
        t.type !== filters.transactionType
      )
        return false;
      if (
        filters.paymentMethod !== "all" &&
        t.paymentMethod !== filters.paymentMethod
      )
        return false;
      if (filters.accountId !== "all" && t.accountId !== filters.accountId)
        return false;
      if (filters.dateRange) {
        if (t.date < filters.dateRange.start || t.date > filters.dateRange.end)
          return false;
      }
      if (filters.minAmount !== null && t.amount < filters.minAmount)
        return false;
      if (filters.maxAmount !== null && t.amount > filters.maxAmount)
        return false;
      return true;
    });
  }, [transactions, filters]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = a.date - b.date;
      else if (sortBy === "amount") cmp = a.amount - b.amount;
      else if (sortBy === "category")
        cmp = a.category.localeCompare(b.category);
      else if (sortBy === "description")
        cmp = a.description.localeCompare(b.description);
      return sortDirection === "desc" ? -cmp : cmp;
    });
  }, [filteredTransactions, sortBy, sortDirection]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const netBalance = totalIncome - totalExpenses;
  const totalAccountBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );

  const monthlyAggregates: MonthlyAggregate[] = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>();
    transactions.forEach((t) => {
      const key = getMonthKey(t.date);
      const existing = map.get(key) || { income: 0, expenses: 0 };
      if (t.type === "income") existing.income += t.amount;
      else existing.expenses += t.amount;
      map.set(key, existing);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }));
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<CategoryType, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }));
  }, [transactions, totalExpenses]);

  const recurringTransactions = useMemo(
    () => transactions.filter((t) => t.isRecurring),
    [transactions]
  );

  // ──── Actions ────

  const addTransaction = useCallback((data: Omit<Transaction, "id">) => {
    const newTx: Transaction = { ...data, id: `tx_${Date.now()}` };
    setTransactions((prev) => [...prev, newTx]);
    // Update account balance
    const balanceChange = data.type === "income" ? data.amount : -data.amount;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === data.accountId
          ? { ...a, balance: a.balance + balanceChange }
          : a
      )
    );
    setShowAddModal(false);
  }, []);

  const deleteTransaction = useCallback(
    (txId: string) => {
      if (window.confirm("Are you sure you want to delete this transaction?")) {
        const tx = transactions.find((t) => t.id === txId);
        if (tx) {
          const balanceChange = tx.type === "income" ? -tx.amount : tx.amount;
          setAccounts((prev) =>
            prev.map((a) =>
              a.id === tx.accountId
                ? { ...a, balance: a.balance + balanceChange }
                : a
            )
          );
        }
        setTransactions((prev) => prev.filter((t) => t.id !== txId));
        setSelectedTransaction(null);
      }
    },
    [transactions]
  );

  const transferBetweenAccounts = useCallback(
    (fromId: string, toId: string, amount: number) => {
      if (amount <= 0) return;
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === fromId) return { ...a, balance: a.balance - amount };
          if (a.id === toId) return { ...a, balance: a.balance + amount };
          return a;
        })
      );
      setShowTransferModal(false);
    },
    []
  );

  const saveBudget = useCallback(
    (budgetData: Omit<Budget, "id">) => {
      if (editingBudget) {
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === editingBudget.id ? { ...b, ...budgetData } : b
          )
        );
      } else {
        setBudgets((prev) => [
          ...prev,
          { ...budgetData, id: `b_${Date.now()}` },
        ]);
      }
      setShowBudgetModal(false);
      setEditingBudget(null);
    },
    [editingBudget]
  );

  const deleteBudget = useCallback((budgetId: string) => {
    if (window.confirm("Delete this budget?")) {
      setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    }
  }, []);

  const exportTransactionsCSV = useCallback(() => {
    const headers = [
      "Date",
      "Type",
      "Description",
      "Category",
      "Amount",
      "Payment Method",
      "Account",
      "Tags",
      "Notes",
    ];
    const rows = sortedTransactions.map((t) => [
      formatDate(t.date, settings.dateFormat),
      t.type,
      t.description,
      CATEGORY_CONFIG[t.category].label,
      t.type === "expense" ? `-${t.amount}` : t.amount.toString(),
      PAYMENT_METHODS[t.paymentMethod],
      accounts.find((a) => a.id === t.accountId)?.name || "Unknown",
      t.tags.join("; "),
      t.notes,
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedTransactions, settings.dateFormat, accounts]);

  const getAccountById = useCallback(
    (id: string): Account | undefined => accounts.find((a) => a.id === id),
    [accounts]
  );

  // ──── Theme colors ────

  const isDark = settings.darkMode;
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#e2e8f0" : "#1e293b";
  const secondaryText = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#334155" : "#e2e8f0";
  const accentColor = "#6366f1";
  const dangerColor = "#ef4444";
  const successColor = "#22c55e";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? "60px" : "220px",
          backgroundColor: isDark ? "#020617" : "#ffffff",
          borderRight: `1px solid ${borderColor}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: sidebarCollapsed ? "16px 10px" : "20px 16px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {!sidebarCollapsed && (
            <h1
              style={{
                fontSize: "17px",
                fontWeight: 700,
                margin: 0,
                color: accentColor,
              }}
            >
              💰 FinTrack
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: secondaryText,
              padding: "4px",
            }}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <nav style={{ padding: "12px 8px", flex: 1 }}>
          {[
            { id: "dashboard" as ViewType, icon: "📊", label: "Dashboard" },
            {
              id: "transactions" as ViewType,
              icon: "💳",
              label: "Transactions",
            },
            { id: "budgets" as ViewType, icon: "🎯", label: "Budgets" },
            { id: "analytics" as ViewType, icon: "📈", label: "Analytics" },
            { id: "accounts" as ViewType, icon: "🏦", label: "Accounts" },
            { id: "settings" as ViewType, icon: "⚙️", label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                localStorage.setItem("expenseTrackerView", item.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                marginBottom: "4px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                backgroundColor:
                  activeView === item.id
                    ? isDark
                      ? "#1e293b"
                      : "#eef2ff"
                    : "transparent",
                color: activeView === item.id ? accentColor : textColor,
                fontWeight: activeView === item.id ? 600 : 400,
                textAlign: "left",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span style={{ fontSize: "15px" }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div
            style={{
              padding: "16px",
              borderTop: `1px solid ${borderColor}`,
              fontSize: "12px",
              color: secondaryText,
            }}
          >
            <div>Net Worth</div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: totalAccountBalance >= 0 ? successColor : dangerColor,
                marginTop: "4px",
              }}
            >
              {formatCurrency(totalAccountBalance, settings)}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: "12px 24px",
            backgroundColor: cardBg,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search transactions... (Ctrl+K)"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                border: `1px solid ${borderColor}`,
                borderRadius: "8px",
                fontSize: "13px",
                backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                color: textColor,
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "13px",
              }}
            >
              🔍
            </span>
          </div>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category: e.target.value as CategoryType | "all",
              }))
            }
            aria-label="Filter by category"
            style={{
              padding: "8px",
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              fontSize: "12px",
              backgroundColor: isDark ? "#0f172a" : "#f9fafb",
              color: textColor,
              cursor: "pointer",
            }}
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_CONFIG[c].label}
              </option>
            ))}
          </select>

          <select
            value={filters.transactionType}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                transactionType: e.target.value as TransactionType | "all",
              }))
            }
            aria-label="Filter by type"
            style={{
              padding: "8px",
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              fontSize: "12px",
              backgroundColor: isDark ? "#0f172a" : "#f9fafb",
              color: textColor,
              cursor: "pointer",
            }}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            + Add Transaction
          </button>

          <button
            onClick={exportTransactionsCSV}
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              color: textColor,
            }}
            title="Export CSV"
          >
            📥 Export
          </button>

          <button
            onClick={() =>
              setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))
            }
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
            aria-label="Toggle theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "20px",
                }}
              >
                Financial Overview
              </h2>

              {/* Summary cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                {[
                  {
                    label: "Total Income",
                    value: formatCurrency(totalIncome, settings),
                    icon: "📈",
                    color: successColor,
                  },
                  {
                    label: "Total Expenses",
                    value: formatCurrency(totalExpenses, settings),
                    icon: "📉",
                    color: dangerColor,
                  },
                  {
                    label: "Net Balance",
                    value: formatCurrency(netBalance, settings),
                    icon: "💰",
                    color: netBalance >= 0 ? successColor : dangerColor,
                  },
                  {
                    label: "Transactions",
                    value: transactions.length.toString(),
                    icon: "📋",
                    color: accentColor,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      backgroundColor: cardBg,
                      borderRadius: "12px",
                      padding: "20px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>{stat.icon}</span>
                      <span
                        style={{
                          fontSize: "22px",
                          fontWeight: 700,
                          color: stat.color,
                        }}
                      >
                        {stat.value}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: secondaryText }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Budget alerts */}
              <div
                style={{
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${borderColor}`,
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "16px",
                  }}
                >
                  Budget Status
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  {budgets.map((budget) => {
                    const spent = calculateBudgetSpent(transactions, budget);
                    const pct =
                      budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                    const isOverBudget = pct > 100;
                    const isAlert = pct >= budget.alertThreshold;
                    return (
                      <div
                        key={budget.id}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: `1px solid ${
                            isOverBudget ? dangerColor : borderColor
                          }`,
                          backgroundColor: isOverBudget
                            ? isDark
                              ? "#1c1917"
                              : "#fef2f2"
                            : "transparent",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <span>{CATEGORY_CONFIG[budget.category].icon}</span>
                          <span style={{ fontSize: "13px", fontWeight: 500 }}>
                            {CATEGORY_CONFIG[budget.category].label}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: isOverBudget ? dangerColor : secondaryText,
                            }}
                          >
                            {formatCurrency(spent, settings)}
                          </span>
                          <span style={{ color: secondaryText }}>
                            of {formatCurrency(budget.limit, settings)}
                          </span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            backgroundColor: isDark ? "#334155" : "#e2e8f0",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              height: "100%",
                              backgroundColor: isOverBudget
                                ? dangerColor
                                : isAlert
                                ? "#f59e0b"
                                : successColor,
                              borderRadius: "3px",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: isOverBudget ? dangerColor : secondaryText,
                            marginTop: "4px",
                          }}
                        >
                          {isOverBudget
                            ? `Over by ${formatCurrency(
                                spent - budget.limit,
                                settings
                              )}`
                            : `${Math.round(100 - pct)}% remaining`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent transactions */}
              <div
                style={{
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "16px",
                  }}
                >
                  Recent Transactions
                </h3>
                {transactions
                  .sort((a, b) => b.date - a.date)
                  .slice(0, 5)
                  .map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTransaction(tx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 0",
                        borderBottom: `1px solid ${borderColor}`,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>
                        {CATEGORY_CONFIG[tx.category].icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 500 }}>
                          {tx.description}
                        </div>
                        <div style={{ fontSize: "11px", color: secondaryText }}>
                          {formatDate(tx.date, settings.dateFormat)} ·{" "}
                          {CATEGORY_CONFIG[tx.category].label}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color:
                            tx.type === "income" ? successColor : dangerColor,
                        }}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount, settings)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Transactions View */}
          {activeView === "transactions" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                  Transactions
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                  }}
                >
                  <span style={{ color: secondaryText }}>Sort by:</span>
                  {(
                    ["date", "amount", "category", "description"] as SortField[]
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        if (sortBy === s)
                          setSortDirection((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          );
                        else {
                          setSortBy(s);
                          setSortDirection("desc");
                        }
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${
                          sortBy === s ? accentColor : borderColor
                        }`,
                        backgroundColor:
                          sortBy === s
                            ? isDark
                              ? "#1e293b"
                              : "#eef2ff"
                            : "transparent",
                        color: sortBy === s ? accentColor : textColor,
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
                      {sortBy === s && (sortDirection === "asc" ? "↑" : "↓")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced filters */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                <select
                  value={filters.paymentMethod}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value as PaymentMethod | "all",
                    }))
                  }
                  aria-label="Filter by payment method"
                  style={{
                    padding: "6px 10px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "12px",
                    backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                    color: textColor,
                  }}
                >
                  <option value="all">All Methods</option>
                  {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.accountId}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      accountId: e.target.value,
                    }))
                  }
                  aria-label="Filter by account"
                  style={{
                    padding: "6px 10px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "12px",
                    backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                    color: textColor,
                  }}
                >
                  <option value="all">All Accounts</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {(filters.category !== "all" ||
                  filters.transactionType !== "all" ||
                  filters.paymentMethod !== "all" ||
                  filters.accountId !== "all" ||
                  filters.search) && (
                  <button
                    onClick={() =>
                      setFilters({
                        search: "",
                        category: "all",
                        transactionType: "all",
                        paymentMethod: "all",
                        accountId: "all",
                        dateRange: null,
                        minAmount: null,
                        maxAmount: null,
                      })
                    }
                    style={{
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor: isDark ? "#334155" : "#e2e8f0",
                      color: textColor,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Transaction table */}
              <div
                style={{
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  border: `1px solid ${borderColor}`,
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: `2px solid ${borderColor}`,
                        textAlign: "left",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: secondaryText,
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: secondaryText,
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: secondaryText,
                        }}
                      >
                        Category
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: secondaryText,
                        }}
                      >
                        Account
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: secondaryText,
                        }}
                      >
                        Method
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: secondaryText,
                          textAlign: "right",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        style={{
                          borderBottom: `1px solid ${borderColor}`,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = isDark
                            ? "#334155"
                            : "#f1f5f9")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <td
                          style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
                        >
                          {formatDate(tx.date, settings.dateFormat)}
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ fontWeight: 500 }}>
                            {tx.description}
                          </div>
                          <div
                            style={{ fontSize: "11px", color: secondaryText }}
                          >
                            {tx.tags.map((t) => `#${t}`).join(" ")}
                          </div>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>{CATEGORY_CONFIG[tx.category].icon}</span>{" "}
                            {CATEGORY_CONFIG[tx.category].label}
                          </span>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          {getAccountById(tx.accountId)?.name || "—"}
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          {PAYMENT_METHODS[tx.paymentMethod]}
                        </td>
                        <td
                          style={{
                            padding: "10px 16px",
                            textAlign: "right",
                            fontWeight: 600,
                            color:
                              tx.type === "income" ? successColor : dangerColor,
                          }}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount, settings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedTransactions.length === 0 && (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: secondaryText,
                    }}
                  >
                    No transactions match your filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Budgets View */}
          {activeView === "budgets" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                  Budgets
                </h2>
                <button
                  onClick={() => {
                    setEditingBudget(null);
                    setShowBudgetModal(true);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  + New Budget
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "16px",
                }}
              >
                {budgets.map((budget) => {
                  const spent = calculateBudgetSpent(transactions, budget);
                  const pct =
                    budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                  const remaining = budget.limit - spent;
                  const daysLeft =
                    getDaysInCurrentMonth() - new Date().getDate();
                  const dailyBudget = daysLeft > 0 ? remaining / daysLeft : 0;
                  const isOverBudget = pct > 100;

                  return (
                    <div
                      key={budget.id}
                      style={{
                        backgroundColor: cardBg,
                        borderRadius: "12px",
                        padding: "20px",
                        border: `1px solid ${
                          isOverBudget ? dangerColor : borderColor
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>
                            {CATEGORY_CONFIG[budget.category].icon}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "14px" }}>
                              {CATEGORY_CONFIG[budget.category].label}
                            </div>
                            <div
                              style={{ fontSize: "11px", color: secondaryText }}
                            >
                              {budget.period} budget
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => {
                              setEditingBudget(budget);
                              setShowBudgetModal(true);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                            aria-label={`Edit ${
                              CATEGORY_CONFIG[budget.category].label
                            } budget`}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteBudget(budget.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                            aria-label={`Delete ${
                              CATEGORY_CONFIG[budget.category].label
                            } budget`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: isOverBudget ? dangerColor : textColor,
                          }}
                        >
                          {formatCurrency(spent, settings)} spent
                        </span>
                        <span style={{ color: secondaryText }}>
                          {formatCurrency(budget.limit, settings)} limit
                        </span>
                      </div>
                      <div
                        style={{
                          height: "8px",
                          backgroundColor: isDark ? "#334155" : "#e2e8f0",
                          borderRadius: "4px",
                          overflow: "hidden",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            height: "100%",
                            backgroundColor: isOverBudget
                              ? dangerColor
                              : pct >= budget.alertThreshold
                              ? "#f59e0b"
                              : successColor,
                            borderRadius: "4px",
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          color: secondaryText,
                        }}
                      >
                        <span>{Math.round(pct)}% used</span>
                        <span>
                          {isOverBudget
                            ? "Over budget!"
                            : `${formatCurrency(
                                Math.max(dailyBudget, 0),
                                settings
                              )}/day left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeView === "analytics" && (
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "20px",
                }}
              >
                Analytics
              </h2>

              {/* Monthly trend */}
              <div
                style={{
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${borderColor}`,
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "16px",
                  }}
                >
                  Monthly Trend
                </h3>
                {monthlyAggregates.map((agg) => {
                  const maxVal = Math.max(
                    ...monthlyAggregates.map((a) =>
                      Math.max(a.income, a.expenses)
                    ),
                    1
                  );
                  return (
                    <div key={agg.month} style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {getMonthLabel(agg.month)}
                        </span>
                        <span
                          style={{
                            color: agg.net >= 0 ? successColor : dangerColor,
                          }}
                        >
                          Net: {formatCurrency(agg.net, settings)}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              height: "8px",
                              backgroundColor: isDark ? "#334155" : "#e2e8f0",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(agg.income / maxVal) * 100}%`,
                                height: "100%",
                                backgroundColor: successColor,
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: successColor,
                              marginTop: "2px",
                            }}
                          >
                            Income: {formatCurrency(agg.income, settings)}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              height: "8px",
                              backgroundColor: isDark ? "#334155" : "#e2e8f0",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(agg.expenses / maxVal) * 100}%`,
                                height: "100%",
                                backgroundColor: dangerColor,
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: dangerColor,
                              marginTop: "2px",
                            }}
                          >
                            Expenses: {formatCurrency(agg.expenses, settings)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Category breakdown */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    padding: "20px",
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    Spending by Category
                  </h3>
                  {categoryBreakdown.map((item) => (
                    <div key={item.category} style={{ marginBottom: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>{CATEGORY_CONFIG[item.category].icon}</span>
                          {CATEGORY_CONFIG[item.category].label}
                        </span>
                        <span style={{ color: secondaryText }}>
                          {formatCurrency(item.amount, settings)} (
                          {Math.round(item.percentage)}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          backgroundColor: isDark ? "#334155" : "#e2e8f0",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${item.percentage}%`,
                            height: "100%",
                            backgroundColor:
                              CATEGORY_CONFIG[item.category].color,
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    padding: "20px",
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    Recurring Expenses
                  </h3>
                  {recurringTransactions
                    .filter((t) => t.type === "expense")
                    .map((tx) => (
                      <div
                        key={tx.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 0",
                          borderBottom: `1px solid ${borderColor}`,
                          fontSize: "13px",
                        }}
                      >
                        <span>{CATEGORY_CONFIG[tx.category].icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>
                            {tx.description}
                          </div>
                          <div
                            style={{ fontSize: "11px", color: secondaryText }}
                          >
                            {tx.recurrence}
                          </div>
                        </div>
                        <span style={{ fontWeight: 600, color: dangerColor }}>
                          {formatCurrency(tx.amount, settings)}
                        </span>
                      </div>
                    ))}
                  {recurringTransactions.filter((t) => t.type === "expense")
                    .length === 0 && (
                    <div
                      style={{
                        color: secondaryText,
                        fontSize: "13px",
                        textAlign: "center",
                        padding: "20px",
                      }}
                    >
                      No recurring expenses
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Accounts View */}
          {activeView === "accounts" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                  Accounts
                </h2>
                <button
                  onClick={() => setShowTransferModal(true)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  🔄 Transfer
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                {accounts.map((account) => {
                  const accountTx = transactions.filter(
                    (t) => t.accountId === account.id
                  );
                  const recentTx = accountTx
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 3);
                  return (
                    <div
                      key={account.id}
                      style={{
                        backgroundColor: cardBg,
                        borderRadius: "12px",
                        padding: "20px",
                        border: `1px solid ${borderColor}`,
                        borderTop: `3px solid ${account.color}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>{account.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "15px" }}>
                            {account.name}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: secondaryText,
                              textTransform: "capitalize",
                            }}
                          >
                            {account.type} · {account.currency}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 700,
                          color: account.balance >= 0 ? textColor : dangerColor,
                          marginBottom: "12px",
                        }}
                      >
                        {formatCurrency(account.balance, settings)}
                      </div>
                      <div
                        style={{
                          borderTop: `1px solid ${borderColor}`,
                          paddingTop: "10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: secondaryText,
                            marginBottom: "6px",
                          }}
                        >
                          Recent Activity
                        </div>
                        {recentTx.length > 0 ? (
                          recentTx.map((tx) => (
                            <div
                              key={tx.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "12px",
                                padding: "3px 0",
                              }}
                            >
                              <span style={{ color: secondaryText }}>
                                {tx.description.substring(0, 20)}
                                {tx.description.length > 20 ? "..." : ""}
                              </span>
                              <span
                                style={{
                                  color:
                                    tx.type === "income"
                                      ? successColor
                                      : dangerColor,
                                  fontWeight: 500,
                                }}
                              >
                                {tx.type === "income" ? "+" : "-"}
                                {formatCurrency(tx.amount, settings)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div
                            style={{ fontSize: "12px", color: secondaryText }}
                          >
                            No recent transactions
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: secondaryText,
                          marginTop: "8px",
                        }}
                      >
                        {accountTx.length} total transactions
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeView === "settings" && (
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "20px",
                }}
              >
                Settings
              </h2>
              <div style={{ maxWidth: "600px" }}>
                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    padding: "20px",
                    border: `1px solid ${borderColor}`,
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    Display
                  </h3>

                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: secondaryText,
                        marginBottom: "4px",
                      }}
                    >
                      Currency Symbol
                    </label>
                    <input
                      value={settings.currencySymbol}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          currencySymbol: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "13px",
                        backgroundColor: "transparent",
                        color: textColor,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: secondaryText,
                        marginBottom: "4px",
                      }}
                    >
                      Date Format
                    </label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          dateFormat: e.target
                            .value as AppSettings["dateFormat"],
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "13px",
                        backgroundColor: "transparent",
                        color: textColor,
                      }}
                      aria-label="Date format"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>Show Cents</span>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          showCents: !prev.showCents,
                        }))
                      }
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: settings.showCents
                          ? accentColor
                          : isDark
                          ? "#334155"
                          : "#cbd5e1",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                      aria-label="Toggle show cents"
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "3px",
                          left: settings.showCents ? "23px" : "3px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          transition: "left 0.2s",
                        }}
                      />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>Dark Mode</span>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          darkMode: !prev.darkMode,
                        }))
                      }
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: settings.darkMode
                          ? accentColor
                          : isDark
                          ? "#334155"
                          : "#cbd5e1",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                      aria-label="Toggle dark mode"
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "3px",
                          left: settings.darkMode ? "23px" : "3px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          transition: "left 0.2s",
                        }}
                      />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>Compact View</span>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          compactView: !prev.compactView,
                        }))
                      }
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: settings.compactView
                          ? accentColor
                          : isDark
                          ? "#334155"
                          : "#cbd5e1",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                      aria-label="Toggle compact view"
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "3px",
                          left: settings.compactView ? "23px" : "3px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          transition: "left 0.2s",
                        }}
                      />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    padding: "20px",
                    border: `1px solid ${borderColor}`,
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    Data
                  </h3>
                  <button
                    onClick={exportTransactionsCSV}
                    style={{
                      padding: "8px 16px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      backgroundColor: "transparent",
                      color: textColor,
                      marginRight: "8px",
                    }}
                  >
                    📥 Export All Transactions
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    padding: "20px",
                    border: `1px solid ${dangerColor}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "16px",
                      color: dangerColor,
                    }}
                  >
                    Danger Zone
                  </h3>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete ALL transactions? This cannot be undone."
                        )
                      ) {
                        setTransactions([]);
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#fef2f2",
                      color: dangerColor,
                      border: `1px solid #fecaca`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      width: "100%",
                      marginBottom: "8px",
                    }}
                  >
                    Delete All Transactions
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Reset all settings to defaults?")) {
                        setSettings(DEFAULT_SETTINGS);
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#fef2f2",
                      color: dangerColor,
                      border: `1px solid #fecaca`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      width: "100%",
                    }}
                  >
                    Reset Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            style={{
              backgroundColor: cardBg,
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "28px" }}>
                  {CATEGORY_CONFIG[selectedTransaction.category].icon}
                </span>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 600, margin: 0 }}>
                    {selectedTransaction.description}
                  </h3>
                  <div style={{ fontSize: "12px", color: secondaryText }}>
                    {CATEGORY_CONFIG[selectedTransaction.category].label}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: secondaryText,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color:
                  selectedTransaction.type === "income"
                    ? successColor
                    : dangerColor,
                marginBottom: "20px",
              }}
            >
              {selectedTransaction.type === "income" ? "+" : "-"}
              {formatCurrency(selectedTransaction.amount, settings)}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: secondaryText,
                    marginBottom: "2px",
                  }}
                >
                  Date
                </div>
                <div>
                  {formatDate(selectedTransaction.date, settings.dateFormat)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: secondaryText,
                    marginBottom: "2px",
                  }}
                >
                  Type
                </div>
                <div style={{ textTransform: "capitalize" }}>
                  {selectedTransaction.type}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: secondaryText,
                    marginBottom: "2px",
                  }}
                >
                  Payment Method
                </div>
                <div>{PAYMENT_METHODS[selectedTransaction.paymentMethod]}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: secondaryText,
                    marginBottom: "2px",
                  }}
                >
                  Account
                </div>
                <div>
                  {getAccountById(selectedTransaction.accountId)?.name ||
                    "Unknown"}
                </div>
              </div>
            </div>

            {selectedTransaction.isRecurring && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: isDark ? "#1e293b" : "#f0f9ff",
                  borderRadius: "6px",
                  fontSize: "12px",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>🔄</span> Recurring: {selectedTransaction.recurrence}
              </div>
            )}

            {selectedTransaction.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                {selectedTransaction.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      backgroundColor: isDark ? "#334155" : "#e0e7ff",
                      color: accentColor,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {selectedTransaction.notes && (
              <div
                style={{
                  padding: "10px",
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "16px",
                  color: secondaryText,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  Notes
                </div>
                {selectedTransaction.notes}
              </div>
            )}

            <button
              onClick={() => deleteTransaction(selectedTransaction.id)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#fef2f2",
                color: dangerColor,
                border: `1px solid #fecaca`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                width: "100%",
              }}
            >
              Delete Transaction
            </button>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: cardBg,
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
                Add Transaction
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: secondaryText,
                }}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target as HTMLFormElement);
                addTransaction({
                  type: fd.get("type") as TransactionType,
                  amount: parseFloat(fd.get("amount") as string) || 0,
                  category: fd.get("category") as CategoryType,
                  description: fd.get("description") as string,
                  date: fd.get("date")
                    ? new Date(fd.get("date") as string).getTime()
                    : Date.now(),
                  paymentMethod: fd.get("paymentMethod") as PaymentMethod,
                  accountId: fd.get("accountId") as string,
                  tags:
                    (fd.get("tags") as string)
                      ?.split(",")
                      .map((t) => t.trim())
                      .filter(Boolean) || [],
                  notes: (fd.get("notes") as string) || "",
                  isRecurring: fd.get("isRecurring") === "on",
                  recurrence: fd.get("recurrence") as
                    | RecurrenceInterval
                    | undefined,
                });
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Type
                </label>
                <select
                  name="type"
                  defaultValue="expense"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Description *
                </label>
                <input
                  name="description"
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: secondaryText,
                      marginBottom: "4px",
                    }}
                  >
                    Amount *
                  </label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "13px",
                      backgroundColor: "transparent",
                      color: textColor,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: secondaryText,
                      marginBottom: "4px",
                    }}
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue="food"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "13px",
                      backgroundColor: "transparent",
                      color: textColor,
                    }}
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_CONFIG[c].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: secondaryText,
                      marginBottom: "4px",
                    }}
                  >
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "13px",
                      backgroundColor: "transparent",
                      color: textColor,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: secondaryText,
                      marginBottom: "4px",
                    }}
                  >
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    defaultValue="debit_card"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "13px",
                      backgroundColor: "transparent",
                      color: textColor,
                    }}
                  >
                    {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Account
                </label>
                <select
                  name="accountId"
                  defaultValue="acc1"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  placeholder="e.g. groceries, weekly"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "8px 16px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => {
            setShowBudgetModal(false);
            setEditingBudget(null);
          }}
        >
          <div
            style={{
              backgroundColor: cardBg,
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
                {editingBudget ? "Edit Budget" : "New Budget"}
              </h2>
              <button
                onClick={() => {
                  setShowBudgetModal(false);
                  setEditingBudget(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: secondaryText,
                }}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target as HTMLFormElement);
                saveBudget({
                  category: fd.get("category") as CategoryType,
                  limit: parseFloat(fd.get("limit") as string) || 0,
                  period: fd.get("period") as "monthly" | "weekly",
                  alertThreshold:
                    parseInt(fd.get("alertThreshold") as string) || 80,
                });
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Category
                </label>
                <select
                  name="category"
                  defaultValue={editingBudget?.category || "food"}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_CONFIG[c].label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Limit ({settings.currencySymbol})
                </label>
                <input
                  name="limit"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={editingBudget?.limit || ""}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Period
                </label>
                <select
                  name="period"
                  defaultValue={editingBudget?.period || "monthly"}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Alert Threshold (%)
                </label>
                <input
                  name="alertThreshold"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={editingBudget?.alertThreshold || 80}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetModal(false);
                    setEditingBudget(null);
                  }}
                  style={{
                    padding: "8px 16px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {editingBudget ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowTransferModal(false)}
        >
          <div
            style={{
              backgroundColor: cardBg,
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
                Transfer Between Accounts
              </h2>
              <button
                onClick={() => setShowTransferModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: secondaryText,
                }}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target as HTMLFormElement);
                transferBetweenAccounts(
                  fd.get("from") as string,
                  fd.get("to") as string,
                  parseFloat(fd.get("amount") as string) || 0
                );
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  From Account
                </label>
                <select
                  name="from"
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, settings)})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  To Account
                </label>
                <select
                  name="to"
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, settings)})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: secondaryText,
                    marginBottom: "4px",
                  }}
                >
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  style={{
                    padding: "8px 16px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    color: textColor,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
