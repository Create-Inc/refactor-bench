import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const CATEGORIES = {
  revenue: [
    "Product Sales",
    "Service Fees",
    "Subscriptions",
    "Licensing",
    "Consulting",
  ],
  expense: [
    "Salaries",
    "Marketing",
    "Infrastructure",
    "Office Supplies",
    "Travel",
    "Software Licenses",
    "Legal",
    "Insurance",
  ],
};

const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Operations",
  "HR",
  "Finance",
  "Legal",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CURRENCY_FORMATS = { USD: "$", EUR: "\u20AC", GBP: "\u00A3" };

function generateTransactions() {
  const transactions = [];
  const now = Date.now();
  let id = 1;
  for (let d = 0; d < 365; d++) {
    const date = new Date(now - d * 86400000);
    const dailyCount = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < dailyCount; i++) {
      const isRevenue = Math.random() > 0.4;
      const type = isRevenue ? "revenue" : "expense";
      const cats = CATEGORIES[type];
      const category = cats[Math.floor(Math.random() * cats.length)];
      const department =
        DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      const amount = isRevenue
        ? Math.round((Math.random() * 50000 + 1000) * 100) / 100
        : Math.round((Math.random() * 20000 + 500) * 100) / 100;
      transactions.push({
        id: String(id++),
        date: date.toISOString().split("T")[0],
        type,
        category,
        department,
        amount,
        description: `${category} - ${department} (${date.toLocaleDateString()})`,
        status: Math.random() > 0.1 ? "completed" : "pending",
        reference: `TXN-${String(id).padStart(6, "0")}`,
      });
    }
  }
  return transactions;
}

const SEED_TRANSACTIONS = generateTransactions();

const BUDGET_DATA = [
  { department: "Engineering", allocated: 500000, category: "Salaries" },
  { department: "Engineering", allocated: 120000, category: "Infrastructure" },
  {
    department: "Engineering",
    allocated: 50000,
    category: "Software Licenses",
  },
  { department: "Marketing", allocated: 300000, category: "Marketing" },
  { department: "Marketing", allocated: 80000, category: "Salaries" },
  { department: "Sales", allocated: 200000, category: "Salaries" },
  { department: "Sales", allocated: 60000, category: "Travel" },
  { department: "Operations", allocated: 150000, category: "Salaries" },
  { department: "Operations", allocated: 40000, category: "Office Supplies" },
  { department: "HR", allocated: 120000, category: "Salaries" },
  { department: "Finance", allocated: 100000, category: "Salaries" },
  { department: "Finance", allocated: 30000, category: "Software Licenses" },
  { department: "Legal", allocated: 90000, category: "Legal" },
  { department: "Legal", allocated: 80000, category: "Salaries" },
  { department: "Legal", allocated: 20000, category: "Insurance" },
];

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);
  const [activeView, setActiveView] = useState("overview");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [compareMode, setCompareMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedRows, setSelectedRows] = useState([]);
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("finDashTheme");
    if (savedTheme === "dark") setIsDarkMode(true);
    const savedCurrency = localStorage.getItem("finDashCurrency");
    if (savedCurrency) setCurrency(savedCurrency);
    const savedView = localStorage.getItem("finDashView");
    if (savedView) setActiveView(savedView);
    const savedPageSize = localStorage.getItem("finDashPageSize");
    if (savedPageSize) setPageSize(Number(savedPageSize));
  }, []);

  useEffect(() => {
    localStorage.setItem("finDashTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("finDashCurrency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("finDashView", activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem("finDashPageSize", String(pageSize));
  }, [pageSize]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedTransaction(null);
        setShowAddModal(false);
        setShowSettingsPanel(false);
        setShowNotifications(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setShowAddModal(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addNotification = useCallback((message, type = "info") => {
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        message,
        type,
        timestamp: Date.now(),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const formatCurrency = useCallback(
    (amount) => {
      const symbol = CURRENCY_FORMATS[currency] || "$";
      return `${symbol}${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency]
  );

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (dateRange.start) {
      result = result.filter((t) => t.date >= dateRange.start);
    }
    if (dateRange.end) {
      result = result.filter((t) => t.date <= dateRange.end);
    }
    if (filterType !== "all") {
      result = result.filter((t) => t.type === filterType);
    }
    if (filterCategory !== "all") {
      result = result.filter((t) => t.category === filterCategory);
    }
    if (filterDepartment !== "all") {
      result = result.filter((t) => t.department === filterDepartment);
    }
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date);
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else if (sortField === "category")
        cmp = a.category.localeCompare(b.category);
      else if (sortField === "department")
        cmp = a.department.localeCompare(b.department);
      else if (sortField === "reference")
        cmp = a.reference.localeCompare(b.reference);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return result;
  }, [
    transactions,
    dateRange,
    filterType,
    filterCategory,
    filterDepartment,
    filterStatus,
    searchQuery,
    sortField,
    sortDirection,
  ]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  const kpiMetrics = useMemo(() => {
    const revenue = filteredTransactions
      .filter((t) => t.type === "revenue")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const netIncome = revenue - expenses;
    const profitMargin =
      revenue > 0 ? ((netIncome / revenue) * 100).toFixed(1) : "0.0";
    const pendingCount = filteredTransactions.filter(
      (t) => t.status === "pending"
    ).length;
    const avgTransactionSize =
      filteredTransactions.length > 0
        ? filteredTransactions.reduce((s, t) => s + t.amount, 0) /
          filteredTransactions.length
        : 0;
    return {
      revenue,
      expenses,
      netIncome,
      profitMargin,
      pendingCount,
      avgTransactionSize,
      totalCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const monthly = {};
    filteredTransactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!monthly[key]) monthly[key] = { revenue: 0, expenses: 0, count: 0 };
      if (t.type === "revenue") monthly[key].revenue += t.amount;
      else monthly[key].expenses += t.amount;
      monthly[key].count++;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => ({
        month: key,
        label:
          MONTHS[parseInt(key.split("-")[1]) - 1] + " " + key.split("-")[0],
        ...data,
        net: data.revenue - data.expenses,
      }));
  }, [filteredTransactions]);

  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    filteredTransactions.forEach((t) => {
      if (!breakdown[t.category])
        breakdown[t.category] = { total: 0, count: 0, type: t.type };
      breakdown[t.category].total += t.amount;
      breakdown[t.category].count++;
    });
    return Object.entries(breakdown)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  const departmentBreakdown = useMemo(() => {
    const breakdown = {};
    filteredTransactions.forEach((t) => {
      if (!breakdown[t.department])
        breakdown[t.department] = { revenue: 0, expenses: 0, count: 0 };
      if (t.type === "revenue") breakdown[t.department].revenue += t.amount;
      else breakdown[t.department].expenses += t.amount;
      breakdown[t.department].count++;
    });
    return Object.entries(breakdown)
      .map(([dept, data]) => ({
        department: dept,
        ...data,
        net: data.revenue - data.expenses,
      }))
      .sort((a, b) => b.net - a.net);
  }, [filteredTransactions]);

  const budgetComparison = useMemo(() => {
    const yearExpenses = transactions.filter(
      (t) =>
        t.type === "expense" && new Date(t.date).getFullYear() === budgetYear
    );
    return BUDGET_DATA.map((b) => {
      const actual = yearExpenses
        .filter(
          (t) => t.department === b.department && t.category === b.category
        )
        .reduce((s, t) => s + t.amount, 0);
      const variance = b.allocated - actual;
      const utilizationPct =
        b.allocated > 0 ? ((actual / b.allocated) * 100).toFixed(1) : "0.0";
      return { ...b, actual, variance, utilizationPct };
    });
  }, [transactions, budgetYear]);

  const topTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredTransactions]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const form = e.target;
    const newTxn = {
      id: String(Date.now()),
      date: form.date.value || new Date().toISOString().split("T")[0],
      type: form.type.value,
      category: form.category.value,
      department: form.department.value,
      amount: parseFloat(form.amount.value) || 0,
      description:
        form.description.value ||
        `${form.category.value} - ${form.department.value}`,
      status: "completed",
      reference: `TXN-${String(transactions.length + 1).padStart(6, "0")}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    setShowAddModal(false);
    addNotification(
      `Transaction ${newTxn.reference} added (${formatCurrency(
        newTxn.amount
      )})`,
      "success"
    );
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      const txn = transactions.find((t) => t.id === id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setSelectedTransaction(null);
      addNotification(`Transaction ${txn?.reference} deleted`, "warning");
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (
      window.confirm(`Delete ${selectedRows.length} selected transactions?`)
    ) {
      setTransactions((prev) =>
        prev.filter((t) => !selectedRows.includes(t.id))
      );
      addNotification(`${selectedRows.length} transactions deleted`, "warning");
      setSelectedRows([]);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Reference",
      "Type",
      "Category",
      "Department",
      "Amount",
      "Status",
      "Description",
    ];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.reference,
      t.type,
      t.category,
      t.department,
      t.amount,
      t.status,
      t.description,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification("Financial report exported to CSV", "success");
  };

  const handleExportPDF = () => {
    addNotification(
      "PDF export started — report will be available shortly",
      "info"
    );
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedTransactions.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedTransactions.map((t) => t.id));
    }
  };

  const clearAllFilters = () => {
    setDateRange({ start: "", end: "" });
    setFilterType("all");
    setFilterCategory("all");
    setFilterDepartment("all");
    setFilterStatus("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const bgColor = isDarkMode ? "#1a1a2e" : "#f8fafc";
  const cardBg = isDarkMode ? "#16213e" : "#ffffff";
  const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
  const mutedColor = isDarkMode ? "#94a3b8" : "#64748b";
  const borderColor = isDarkMode ? "#334155" : "#e2e8f0";
  const accentColor = "#3b82f6";
  const successColor = "#22c55e";
  const dangerColor = "#ef4444";

  const navItems = [
    { id: "overview", label: "Overview", icon: "\uD83D\uDCCA" },
    { id: "transactions", label: "Transactions", icon: "\uD83D\uDCCB" },
    { id: "charts", label: "Charts", icon: "\uD83D\uDCC8" },
    { id: "budget", label: "Budget", icon: "\uD83D\uDCB0" },
    { id: "departments", label: "Departments", icon: "\uD83C\uDFE2" },
    { id: "reports", label: "Reports", icon: "\uD83D\uDCC4" },
  ];

  const renderKPICards = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{ color: mutedColor, fontSize: "13px", marginBottom: "4px" }}
        >
          Total Revenue
        </div>
        <div
          style={{ color: successColor, fontSize: "24px", fontWeight: "700" }}
        >
          {formatCurrency(kpiMetrics.revenue)}
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{ color: mutedColor, fontSize: "13px", marginBottom: "4px" }}
        >
          Total Expenses
        </div>
        <div
          style={{ color: dangerColor, fontSize: "24px", fontWeight: "700" }}
        >
          {formatCurrency(kpiMetrics.expenses)}
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{ color: mutedColor, fontSize: "13px", marginBottom: "4px" }}
        >
          Net Income
        </div>
        <div
          style={{
            color: kpiMetrics.netIncome >= 0 ? successColor : dangerColor,
            fontSize: "24px",
            fontWeight: "700",
          }}
        >
          {formatCurrency(kpiMetrics.netIncome)}
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{ color: mutedColor, fontSize: "13px", marginBottom: "4px" }}
        >
          Profit Margin
        </div>
        <div style={{ color: textColor, fontSize: "24px", fontWeight: "700" }}>
          {kpiMetrics.profitMargin}%
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{ color: mutedColor, fontSize: "13px", marginBottom: "4px" }}
        >
          Pending Transactions
        </div>
        <div style={{ color: textColor, fontSize: "24px", fontWeight: "700" }}>
          {kpiMetrics.pendingCount}
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{ color: mutedColor, fontSize: "13px", marginBottom: "4px" }}
        >
          Avg Transaction
        </div>
        <div style={{ color: textColor, fontSize: "24px", fontWeight: "700" }}>
          {formatCurrency(kpiMetrics.avgTransactionSize)}
        </div>
      </div>
    </div>
  );

  const renderBarChart = (data, valueKey, label, color) => {
    const maxVal = Math.max(...data.map((d) => d[valueKey]), 1);
    return (
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ color: textColor, marginBottom: "12px" }}>{label}</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {data.map((d, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div
                style={{
                  width: "80px",
                  fontSize: "12px",
                  color: mutedColor,
                  textAlign: "right",
                }}
              >
                {d.label || d.month}
              </div>
              <div
                style={{
                  flex: 1,
                  background: borderColor,
                  borderRadius: "4px",
                  height: "24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  data-testid={`bar-${valueKey}-${i}`}
                  style={{
                    width: `${(d[valueKey] / maxVal) * 100}%`,
                    height: "100%",
                    background: color,
                    borderRadius: "4px",
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div
                style={{
                  width: "100px",
                  fontSize: "12px",
                  color: textColor,
                  textAlign: "right",
                }}
              >
                {formatCurrency(d[valueKey])}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = (data) => {
    const total = data.reduce((s, d) => s + d.total, 0);
    const colors = [
      "#3b82f6",
      "#ef4444",
      "#22c55e",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#6366f1",
    ];
    let cumAngle = 0;
    return (
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <svg
          width="200"
          height="200"
          viewBox="-1 -1 2 2"
          style={{ transform: "rotate(-90deg)" }}
          data-testid="pie-chart"
        >
          {data.slice(0, 10).map((d, i) => {
            const pct = total > 0 ? d.total / total : 0;
            const startAngle = cumAngle * 2 * Math.PI;
            cumAngle += pct;
            const endAngle = cumAngle * 2 * Math.PI;
            const largeArc = pct > 0.5 ? 1 : 0;
            const x1 = Math.cos(startAngle);
            const y1 = Math.sin(startAngle);
            const x2 = Math.cos(endAngle);
            const y2 = Math.sin(endAngle);
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} L 0 0`}
                fill={colors[i % colors.length]}
                data-testid={`pie-slice-${i}`}
              />
            );
          })}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {data.slice(0, 10).map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  background: colors[i % colors.length],
                }}
              />
              <span style={{ color: textColor }}>{d.category}</span>
              <span style={{ color: mutedColor }}>
                ({total > 0 ? ((d.total / total) * 100).toFixed(1) : "0.0"}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthlyTrend = () => {
    if (monthlyData.length === 0)
      return (
        <div style={{ color: mutedColor }}>No data for selected period</div>
      );
    const maxVal = Math.max(
      ...monthlyData.map((m) => Math.max(m.revenue, m.expenses)),
      1
    );
    const chartHeight = 200;
    const chartWidth = Math.max(monthlyData.length * 60, 400);
    return (
      <div style={{ overflowX: "auto" }}>
        <svg
          width={chartWidth}
          height={chartHeight + 40}
          data-testid="monthly-trend-chart"
        >
          {monthlyData.map((m, i) => {
            const x = i * 60 + 30;
            const revHeight = (m.revenue / maxVal) * chartHeight;
            const expHeight = (m.expenses / maxVal) * chartHeight;
            return (
              <g key={i}>
                <rect
                  x={x - 12}
                  y={chartHeight - revHeight}
                  width={12}
                  height={revHeight}
                  fill={successColor}
                  opacity={0.8}
                  data-testid={`trend-rev-${i}`}
                />
                <rect
                  x={x}
                  y={chartHeight - expHeight}
                  width={12}
                  height={expHeight}
                  fill={dangerColor}
                  opacity={0.8}
                  data-testid={`trend-exp-${i}`}
                />
                <text
                  x={x}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill={mutedColor}
                >
                  {m.label}
                </text>
              </g>
            );
          })}
          <line
            x1="0"
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke={borderColor}
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  };

  const renderOverview = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: "16px", fontSize: "20px" }}>
        Financial Overview
      </h2>
      {renderKPICards()}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "16px" }}>
            Monthly Revenue vs Expenses
          </h3>
          {renderMonthlyTrend()}
          <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: successColor,
                  borderRadius: "2px",
                }}
              />
              <span style={{ color: mutedColor }}>Revenue</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: dangerColor,
                  borderRadius: "2px",
                }}
              />
              <span style={{ color: mutedColor }}>Expenses</span>
            </div>
          </div>
        </div>
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "16px" }}>
            Top Categories
          </h3>
          {renderPieChart(categoryBreakdown)}
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
          marginTop: "24px",
        }}
      >
        <h3 style={{ color: textColor, marginBottom: "16px" }}>
          Top 10 Transactions
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: `1px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                }}
              >
                Date
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: `1px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                }}
              >
                Reference
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: `1px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                }}
              >
                Category
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: `1px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                }}
              >
                Department
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "8px",
                  borderBottom: `1px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {topTransactions.map((t) => (
              <tr
                key={t.id}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setActiveView("transactions");
                  setSelectedTransaction(t);
                }}
              >
                <td
                  style={{
                    padding: "8px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                >
                  {t.date}
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: accentColor,
                    fontSize: "13px",
                  }}
                >
                  {t.reference}
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                >
                  {t.category}
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                >
                  {t.department}
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: `1px solid ${borderColor}`,
                    textAlign: "right",
                    color: t.type === "revenue" ? successColor : dangerColor,
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {t.type === "revenue" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ color: textColor, fontSize: "20px" }}>Transactions</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {selectedRows.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: mutedColor, fontSize: "13px" }}>
                {selectedRows.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                style={{
                  background: dangerColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRows([])}
                style={{
                  background: "transparent",
                  color: mutedColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Clear Selection
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            + Add Transaction
          </button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ color: mutedColor, fontSize: "13px" }}>
          Showing {paginatedTransactions.length} of{" "}
          {filteredTransactions.length} transactions
        </span>
        <button
          onClick={clearAllFilters}
          style={{
            background: "transparent",
            color: accentColor,
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            textDecoration: "underline",
          }}
        >
          Clear Filters
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  textAlign: "left",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              {["date", "reference", "category", "department", "amount"].map(
                (field) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    style={{
                      padding: "10px",
                      borderBottom: `2px solid ${borderColor}`,
                      textAlign: field === "amount" ? "right" : "left",
                      cursor: "pointer",
                      color: mutedColor,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      userSelect: "none",
                    }}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                    {sortField === field
                      ? sortDirection === "asc"
                        ? "\u2191"
                        : "\u2193"
                      : ""}
                  </th>
                )
              )}
              <th
                style={{
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  textAlign: "left",
                  color: mutedColor,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  textAlign: "left",
                  color: mutedColor,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((t) => (
              <tr
                key={t.id}
                onClick={() => setSelectedTransaction(t)}
                style={{
                  cursor: "pointer",
                  background: selectedRows.includes(t.id)
                    ? isDarkMode
                      ? "#1e3a5f"
                      : "#eff6ff"
                    : "transparent",
                }}
              >
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(t.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleRowSelection(t.id);
                    }}
                    aria-label={`Select ${t.reference}`}
                  />
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                >
                  {t.date}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: accentColor,
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  {t.reference}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                >
                  {t.category}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                >
                  {t.department}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    textAlign: "right",
                    color: t.type === "revenue" ? successColor : dangerColor,
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {t.type === "revenue" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <span
                    style={{
                      background: t.type === "revenue" ? "#dcfce7" : "#fee2e2",
                      color: t.type === "revenue" ? "#166534" : "#991b1b",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.type}
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  <span
                    style={{
                      background:
                        t.status === "completed" ? "#dcfce7" : "#fef3c7",
                      color: t.status === "completed" ? "#166534" : "#92400e",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: mutedColor, fontSize: "13px" }}>
            Rows per page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "4px",
              padding: "4px 8px",
            }}
            aria-label="Rows per page"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: mutedColor, fontSize: "13px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
            aria-label="First page"
          >
            &laquo;
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
            aria-label="Previous page"
          >
            &lsaquo;
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
            aria-label="Next page"
          >
            &rsaquo;
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
            aria-label="Last page"
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );

  const renderCharts = () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ color: textColor, fontSize: "20px" }}>
          Charts & Analytics
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {["bar", "line", "comparison"].map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                background: chartType === type ? accentColor : cardBg,
                color: chartType === type ? "#fff" : textColor,
                border: `1px solid ${
                  chartType === type ? accentColor : borderColor
                }`,
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: "13px",
                textTransform: "capitalize",
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      {chartType === "bar" && (
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "16px" }}>
            Revenue by Month
          </h3>
          {renderBarChart(
            monthlyData,
            "revenue",
            "Monthly Revenue",
            successColor
          )}
          <h3
            style={{
              color: textColor,
              marginBottom: "16px",
              marginTop: "24px",
            }}
          >
            Expenses by Month
          </h3>
          {renderBarChart(
            monthlyData,
            "expenses",
            "Monthly Expenses",
            dangerColor
          )}
        </div>
      )}
      {chartType === "line" && (
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "16px" }}>
            Net Income Trend
          </h3>
          {monthlyData.length > 0 ? (
            (() => {
              const maxAbs = Math.max(
                ...monthlyData.map((m) => Math.abs(m.net)),
                1
              );
              const chartH = 200;
              const w = Math.max(monthlyData.length * 60, 400);
              const mid = chartH / 2;
              const points = monthlyData
                .map((m, i) => {
                  const x = i * 60 + 30;
                  const y = mid - (m.net / maxAbs) * (chartH / 2);
                  return `${x},${y}`;
                })
                .join(" ");
              return (
                <svg
                  width={w}
                  height={chartH + 40}
                  data-testid="net-income-chart"
                >
                  <line
                    x1="0"
                    y1={mid}
                    x2={w}
                    y2={mid}
                    stroke={borderColor}
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <polyline
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="2"
                    points={points}
                  />
                  {monthlyData.map((m, i) => {
                    const x = i * 60 + 30;
                    const y = mid - (m.net / maxAbs) * (chartH / 2);
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={m.net >= 0 ? successColor : dangerColor}
                        />
                        <text
                          x={x}
                          y={chartH + 16}
                          textAnchor="middle"
                          fontSize="10"
                          fill={mutedColor}
                        >
                          {m.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()
          ) : (
            <div style={{ color: mutedColor }}>No data available</div>
          )}
        </div>
      )}
      {chartType === "comparison" && (
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "16px" }}>
            Category Comparison
          </h3>
          {renderPieChart(
            categoryBreakdown.filter((c) => c.type === "revenue")
          )}
          <h3
            style={{
              color: textColor,
              marginBottom: "16px",
              marginTop: "24px",
            }}
          >
            Expense Distribution
          </h3>
          {renderPieChart(
            categoryBreakdown.filter((c) => c.type === "expense")
          )}
        </div>
      )}
    </div>
  );

  const renderBudget = () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ color: textColor, fontSize: "20px" }}>
          Budget vs Actuals
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ color: mutedColor, fontSize: "13px" }}>Year:</label>
          <select
            value={budgetYear}
            onChange={(e) => setBudgetYear(Number(e.target.value))}
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "4px",
              padding: "4px 8px",
            }}
            aria-label="Budget year"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Department
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Category
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Allocated
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Actual
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Variance
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px",
                  borderBottom: `2px solid ${borderColor}`,
                  color: mutedColor,
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                Utilization
              </th>
            </tr>
          </thead>
          <tbody>
            {budgetComparison.map((b, i) => (
              <tr key={i}>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                >
                  {b.department}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                >
                  {b.category}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(b.allocated)}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(b.actual)}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    textAlign: "right",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: b.variance >= 0 ? successColor : dangerColor,
                  }}
                >
                  {b.variance >= 0 ? "+" : ""}
                  {formatCurrency(b.variance)}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "8px",
                        background: borderColor,
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(
                            parseFloat(b.utilizationPct),
                            100
                          )}%`,
                          height: "100%",
                          background:
                            parseFloat(b.utilizationPct) > 100
                              ? dangerColor
                              : parseFloat(b.utilizationPct) > 80
                              ? "#f59e0b"
                              : successColor,
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: textColor,
                        fontSize: "12px",
                        minWidth: "40px",
                        textAlign: "right",
                      }}
                    >
                      {b.utilizationPct}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: isDarkMode ? "#1e293b" : "#f1f5f9",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ color: mutedColor, fontSize: "12px" }}>
                Total Allocated
              </div>
              <div
                style={{
                  color: textColor,
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(
                  budgetComparison.reduce((s, b) => s + b.allocated, 0)
                )}
              </div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: "12px" }}>
                Total Actual
              </div>
              <div
                style={{
                  color: textColor,
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(
                  budgetComparison.reduce((s, b) => s + b.actual, 0)
                )}
              </div>
            </div>
            <div>
              <div style={{ color: mutedColor, fontSize: "12px" }}>
                Total Variance
              </div>
              <div
                style={{
                  color:
                    budgetComparison.reduce((s, b) => s + b.variance, 0) >= 0
                      ? successColor
                      : dangerColor,
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {formatCurrency(
                  budgetComparison.reduce((s, b) => s + b.variance, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: "16px", fontSize: "20px" }}>
        Department Performance
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {departmentBreakdown.map((dept, i) => (
          <div
            key={i}
            style={{
              background: cardBg,
              borderRadius: "12px",
              padding: "20px",
              border: `1px solid ${borderColor}`,
            }}
          >
            <h3
              style={{
                color: textColor,
                marginBottom: "12px",
                fontSize: "16px",
              }}
            >
              {dept.department}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ color: mutedColor, fontSize: "12px" }}>
                  Revenue
                </div>
                <div
                  style={{
                    color: successColor,
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  {formatCurrency(dept.revenue)}
                </div>
              </div>
              <div>
                <div style={{ color: mutedColor, fontSize: "12px" }}>
                  Expenses
                </div>
                <div
                  style={{
                    color: dangerColor,
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  {formatCurrency(dept.expenses)}
                </div>
              </div>
              <div>
                <div style={{ color: mutedColor, fontSize: "12px" }}>Net</div>
                <div
                  style={{
                    color: dept.net >= 0 ? successColor : dangerColor,
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  {formatCurrency(dept.net)}
                </div>
              </div>
              <div>
                <div style={{ color: mutedColor, fontSize: "12px" }}>
                  Transactions
                </div>
                <div
                  style={{
                    color: textColor,
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  {dept.count}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: "12px",
                height: "6px",
                background: borderColor,
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${
                    dept.revenue + dept.expenses > 0
                      ? (dept.revenue / (dept.revenue + dept.expenses)) * 100
                      : 50
                  }%`,
                  height: "100%",
                  background: `linear-gradient(to right, ${successColor}, ${accentColor})`,
                  borderRadius: "3px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
                fontSize: "11px",
                color: mutedColor,
              }}
            >
              <span>Revenue share</span>
              <span>
                {dept.revenue + dept.expenses > 0
                  ? (
                      (dept.revenue / (dept.revenue + dept.expenses)) *
                      100
                    ).toFixed(1)
                  : "50.0"}
                %
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div>
      <h2 style={{ color: textColor, marginBottom: "16px", fontSize: "20px" }}>
        Reports
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "8px" }}>
            Financial Summary
          </h3>
          <p
            style={{
              color: mutedColor,
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            Complete financial overview with revenue, expenses, and net income
            across all departments and categories.
          </p>
          <button
            onClick={handleExportCSV}
            style={{
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              width: "100%",
            }}
          >
            Export CSV
          </button>
        </div>
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "8px" }}>
            Budget Report
          </h3>
          <p
            style={{
              color: mutedColor,
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            Budget allocation vs actual spending by department with variance
            analysis and utilization rates.
          </p>
          <button
            onClick={handleExportPDF}
            style={{
              background: "#8b5cf6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              width: "100%",
            }}
          >
            Export PDF
          </button>
        </div>
        <div
          style={{
            background: cardBg,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ color: textColor, marginBottom: "8px" }}>
            Department Analysis
          </h3>
          <p
            style={{
              color: mutedColor,
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            Detailed breakdown of financial performance per department including
            revenue share and expense tracking.
          </p>
          <button
            onClick={() => {
              setActiveView("departments");
            }}
            style={{
              background: "#06b6d4",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              width: "100%",
            }}
          >
            View Departments
          </button>
        </div>
      </div>
      <div
        style={{
          background: cardBg,
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${borderColor}`,
          marginTop: "24px",
        }}
      >
        <h3 style={{ color: textColor, marginBottom: "12px" }}>Quick Stats</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ color: mutedColor, fontSize: "12px" }}>
              Total Transactions
            </div>
            <div
              style={{ color: textColor, fontSize: "20px", fontWeight: "700" }}
            >
              {kpiMetrics.totalCount}
            </div>
          </div>
          <div>
            <div style={{ color: mutedColor, fontSize: "12px" }}>
              Revenue Categories
            </div>
            <div
              style={{ color: textColor, fontSize: "20px", fontWeight: "700" }}
            >
              {CATEGORIES.revenue.length}
            </div>
          </div>
          <div>
            <div style={{ color: mutedColor, fontSize: "12px" }}>
              Expense Categories
            </div>
            <div
              style={{ color: textColor, fontSize: "20px", fontWeight: "700" }}
            >
              {CATEGORIES.expense.length}
            </div>
          </div>
          <div>
            <div style={{ color: mutedColor, fontSize: "12px" }}>
              Departments
            </div>
            <div
              style={{ color: textColor, fontSize: "20px", fontWeight: "700" }}
            >
              {DEPARTMENTS.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: bgColor,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? "60px" : "220px",
          background: isDarkMode ? "#0f172a" : "#ffffff",
          borderRight: `1px solid ${borderColor}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {!sidebarCollapsed && (
            <h1
              style={{
                color: textColor,
                fontSize: "18px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              FinTracker
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
            style={{
              background: "transparent",
              border: "none",
              color: mutedColor,
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {sidebarCollapsed ? "\u2192" : "\u2190"}
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px" }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                localStorage.setItem("finDashView", item.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                borderRadius: "8px",
                background:
                  activeView === item.id
                    ? isDarkMode
                      ? "#1e3a5f"
                      : "#eff6ff"
                    : "transparent",
                color: activeView === item.id ? accentColor : mutedColor,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeView === item.id ? "600" : "400",
                textAlign: "left",
                marginBottom: "2px",
              }}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        {!sidebarCollapsed && (
          <div
            style={{ padding: "12px", borderTop: `1px solid ${borderColor}` }}
          >
            <div
              style={{
                color: mutedColor,
                fontSize: "11px",
                marginBottom: "4px",
              }}
            >
              Net Income
            </div>
            <div
              style={{
                color: kpiMetrics.netIncome >= 0 ? successColor : dangerColor,
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              {formatCurrency(kpiMetrics.netIncome)}
            </div>
          </div>
        )}
        <div style={{ padding: "8px", borderTop: `1px solid ${borderColor}` }}>
          <button
            onClick={() => setShowSettingsPanel(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 12px",
              border: "none",
              borderRadius: "8px",
              background: "transparent",
              color: mutedColor,
              cursor: "pointer",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            <span>\u2699\uFE0F</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 24px",
            background: cardBg,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <input
            ref={searchRef}
            type="text"
            placeholder="Search transactions... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              flex: 1,
              maxWidth: "400px",
              padding: "8px 12px",
              background: isDarkMode ? "#1e293b" : "#f1f5f9",
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              color: textColor,
              fontSize: "14px",
              outline: "none",
            }}
          />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by type"
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              padding: "8px",
              fontSize: "13px",
            }}
          >
            <option value="all">All Types</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by category"
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              padding: "8px",
              fontSize: "13px",
            }}
          >
            <option value="all">All Categories</option>
            {[...CATEGORIES.revenue, ...CATEGORIES.expense].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterDepartment}
            onChange={(e) => {
              setFilterDepartment(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by department"
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              padding: "8px",
              fontSize: "13px",
            }}
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by status"
            style={{
              background: cardBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              padding: "8px",
              fontSize: "13px",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          <div style={{ display: "flex", gap: "4px" }}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => {
                setDateRange((prev) => ({ ...prev, start: e.target.value }));
                setCurrentPage(1);
              }}
              aria-label="Start date"
              style={{
                background: cardBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                padding: "6px",
                fontSize: "12px",
              }}
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => {
                setDateRange((prev) => ({ ...prev, end: e.target.value }));
                setCurrentPage(1);
              }}
              aria-label="End date"
              style={{
                background: cardBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                padding: "6px",
                fontSize: "12px",
              }}
            />
          </div>
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            aria-label="Toggle theme"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            {isDarkMode ? "\u2600\uFE0F" : "\uD83C\uDF19"}
          </button>
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              aria-label="Notifications"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                position: "relative",
              }}
            >
              \uD83D\uDD14
              {notifications.filter((n) => !n.read).length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: dangerColor,
                    color: "#fff",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  width: "300px",
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  zIndex: 100,
                  maxHeight: "400px",
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${borderColor}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h4 style={{ color: textColor, margin: 0 }}>Notifications</h4>
                  <button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, read: true }))
                      )
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      color: accentColor,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Mark all read
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: mutedColor,
                    }}
                  >
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 16px",
                        borderBottom: `1px solid ${borderColor}`,
                        background: n.read
                          ? "transparent"
                          : isDarkMode
                          ? "#1e293b"
                          : "#f8fafc",
                      }}
                    >
                      <div style={{ color: textColor, fontSize: "13px" }}>
                        {n.message}
                      </div>
                      <div
                        style={{
                          color: mutedColor,
                          fontSize: "11px",
                          marginTop: "4px",
                        }}
                      >
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleExportCSV}
            style={{
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            Export CSV
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {activeView === "overview" && renderOverview()}
          {activeView === "transactions" && renderTransactions()}
          {activeView === "charts" && renderCharts()}
          {activeView === "budget" && renderBudget()}
          {activeView === "departments" && renderDepartments()}
          {activeView === "reports" && renderReports()}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "16px",
              padding: "24px",
              width: "500px",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ color: textColor, margin: 0 }}>
                  {selectedTransaction.reference}
                </h3>
                <div
                  style={{
                    color: mutedColor,
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  {selectedTransaction.date}
                </div>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: mutedColor,
                  cursor: "pointer",
                  fontSize: "24px",
                }}
              >
                \u00D7
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    color: mutedColor,
                    fontSize: "12px",
                    marginBottom: "2px",
                  }}
                >
                  Type
                </div>
                <span
                  style={{
                    background:
                      selectedTransaction.type === "revenue"
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      selectedTransaction.type === "revenue"
                        ? "#166534"
                        : "#991b1b",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  {selectedTransaction.type}
                </span>
              </div>
              <div>
                <div
                  style={{
                    color: mutedColor,
                    fontSize: "12px",
                    marginBottom: "2px",
                  }}
                >
                  Status
                </div>
                <span
                  style={{
                    background:
                      selectedTransaction.status === "completed"
                        ? "#dcfce7"
                        : "#fef3c7",
                    color:
                      selectedTransaction.status === "completed"
                        ? "#166534"
                        : "#92400e",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {selectedTransaction.status}
                </span>
              </div>
              <div>
                <div
                  style={{
                    color: mutedColor,
                    fontSize: "12px",
                    marginBottom: "2px",
                  }}
                >
                  Category
                </div>
                <div style={{ color: textColor, fontSize: "14px" }}>
                  {selectedTransaction.category}
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: mutedColor,
                    fontSize: "12px",
                    marginBottom: "2px",
                  }}
                >
                  Department
                </div>
                <div style={{ color: textColor, fontSize: "14px" }}>
                  {selectedTransaction.department}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  color: mutedColor,
                  fontSize: "12px",
                  marginBottom: "2px",
                }}
              >
                Amount
              </div>
              <div
                style={{
                  color:
                    selectedTransaction.type === "revenue"
                      ? successColor
                      : dangerColor,
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              >
                {selectedTransaction.type === "revenue" ? "+" : "-"}
                {formatCurrency(selectedTransaction.amount)}
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  color: mutedColor,
                  fontSize: "12px",
                  marginBottom: "2px",
                }}
              >
                Description
              </div>
              <div style={{ color: textColor, fontSize: "14px" }}>
                {selectedTransaction.description}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleDeleteTransaction(selectedTransaction.id)}
                style={{
                  background: dangerColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "16px",
              padding: "24px",
              width: "480px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
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
              <h3 style={{ color: textColor, margin: 0 }}>Add Transaction</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: mutedColor,
                  cursor: "pointer",
                  fontSize: "24px",
                }}
              >
                \u00D7
              </button>
            </div>
            <form onSubmit={handleAddTransaction}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      color: mutedColor,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Type *
                  </label>
                  <select
                    name="type"
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: cardBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                    }}
                  >
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      color: mutedColor,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: cardBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                    }}
                  >
                    {[...CATEGORIES.revenue, ...CATEGORIES.expense].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      color: mutedColor,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Department *
                  </label>
                  <select
                    name="department"
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: cardBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                    }}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      color: mutedColor,
                      fontSize: "13px",
                      display: "block",
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
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: cardBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      color: mutedColor,
                      fontSize: "13px",
                      display: "block",
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
                      background: cardBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      color: mutedColor,
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Transaction description..."
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: cardBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "transparent",
                    color: mutedColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setShowSettingsPanel(false)}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "16px",
              padding: "24px",
              width: "400px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
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
              <h3 style={{ color: textColor, margin: 0 }}>Settings</h3>
              <button
                onClick={() => setShowSettingsPanel(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: mutedColor,
                  cursor: "pointer",
                  fontSize: "24px",
                }}
              >
                \u00D7
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    color: mutedColor,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  aria-label="Currency"
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: cardBg,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (\u20AC)</option>
                  <option value="GBP">GBP (\u00A3)</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    color: mutedColor,
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Default Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label="Default page size"
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: cardBg,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                  }}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: textColor, fontSize: "14px" }}>
                  Dark Mode
                </span>
                <button
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  style={{
                    background: isDarkMode ? accentColor : borderColor,
                    border: "none",
                    borderRadius: "12px",
                    width: "44px",
                    height: "24px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: isDarkMode ? "22px" : "2px",
                      width: "20px",
                      height: "20px",
                      background: "#fff",
                      borderRadius: "50%",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>
            </div>
            <div
              style={{
                marginTop: "24px",
                paddingTop: "16px",
                borderTop: `1px solid ${borderColor}`,
              }}
            >
              <h4 style={{ color: dangerColor, marginBottom: "8px" }}>
                Danger Zone
              </h4>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete ALL transactions? This cannot be undone."
                    )
                  ) {
                    setTransactions([]);
                    setShowSettingsPanel(false);
                    addNotification("All transactions deleted", "warning");
                  }
                }}
                style={{
                  background: dangerColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  width: "100%",
                }}
              >
                Delete All Transactions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
