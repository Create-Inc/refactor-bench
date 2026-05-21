import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = [
  { id: 'cat1', name: 'Electronics', icon: '💻', color: '#3b82f6' },
  { id: 'cat2', name: 'Clothing', icon: '👕', color: '#8b5cf6' },
  { id: 'cat3', name: 'Food & Beverage', icon: '🍔', color: '#f59e0b' },
  { id: 'cat4', name: 'Home & Garden', icon: '🏡', color: '#10b981' },
  { id: 'cat5', name: 'Sports', icon: '⚽', color: '#ef4444' },
  { id: 'cat6', name: 'Books & Media', icon: '📚', color: '#6366f1' },
];

const SUPPLIERS = [
  { id: 'sup1', name: 'TechParts Inc.', contact: 'mike@techparts.com', phone: '555-0101', rating: 4.5, location: 'San Francisco, CA', leadTimeDays: 5 },
  { id: 'sup2', name: 'Global Textiles', contact: 'sarah@globaltextiles.com', phone: '555-0202', rating: 4.2, location: 'New York, NY', leadTimeDays: 7 },
  { id: 'sup3', name: 'FreshFoods Co.', contact: 'james@freshfoods.com', phone: '555-0303', rating: 4.8, location: 'Portland, OR', leadTimeDays: 2 },
  { id: 'sup4', name: 'HomeStyle Supply', contact: 'linda@homestyle.com', phone: '555-0404', rating: 4.0, location: 'Austin, TX', leadTimeDays: 4 },
  { id: 'sup5', name: 'ActiveGear Ltd.', contact: 'tom@activegear.com', phone: '555-0505', rating: 4.6, location: 'Denver, CO', leadTimeDays: 6 },
  { id: 'sup6', name: 'BookWorld Dist.', contact: 'emma@bookworld.com', phone: '555-0606', rating: 4.3, location: 'Chicago, IL', leadTimeDays: 3 },
];

const WAREHOUSES = [
  { id: 'wh1', name: 'Main Warehouse', location: 'Building A', capacity: 10000 },
  { id: 'wh2', name: 'Overflow Storage', location: 'Building B', capacity: 5000 },
  { id: 'wh3', name: 'Cold Storage', location: 'Building C', capacity: 2000 },
];

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Wireless Bluetooth Headphones', sku: 'ELEC-001', category: 'cat1', supplier: 'sup1', price: 79.99, cost: 35.00, stock: 145, minStock: 20, maxStock: 500, warehouse: 'wh1', status: 'active', weight: 0.3, barcode: '1234567890123', description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.', tags: ['wireless', 'audio', 'bluetooth'], createdAt: Date.now() - 86400000 * 60, lastRestocked: Date.now() - 86400000 * 5, salesCount: 342 },
  { id: 'p2', name: 'USB-C Charging Cable 6ft', sku: 'ELEC-002', category: 'cat1', supplier: 'sup1', price: 14.99, cost: 3.50, stock: 523, minStock: 100, maxStock: 2000, warehouse: 'wh1', status: 'active', weight: 0.05, barcode: '1234567890124', description: 'Durable braided USB-C cable with fast charging support up to 100W.', tags: ['cable', 'usb-c', 'charging'], createdAt: Date.now() - 86400000 * 45, lastRestocked: Date.now() - 86400000 * 2, salesCount: 1205 },
  { id: 'p3', name: 'Organic Cotton T-Shirt', sku: 'CLTH-001', category: 'cat2', supplier: 'sup2', price: 29.99, cost: 12.00, stock: 78, minStock: 30, maxStock: 300, warehouse: 'wh1', status: 'active', weight: 0.2, barcode: '2234567890123', description: 'Comfortable 100% organic cotton t-shirt available in multiple colors.', tags: ['cotton', 'organic', 'casual'], createdAt: Date.now() - 86400000 * 30, lastRestocked: Date.now() - 86400000 * 10, salesCount: 567 },
  { id: 'p4', name: 'Artisan Granola Mix', sku: 'FOOD-001', category: 'cat3', supplier: 'sup3', price: 8.99, cost: 3.20, stock: 12, minStock: 50, maxStock: 500, warehouse: 'wh3', status: 'active', weight: 0.5, barcode: '3234567890123', description: 'Hand-crafted granola with almonds, dried cranberries, and dark chocolate chips.', tags: ['organic', 'granola', 'snack'], createdAt: Date.now() - 86400000 * 20, lastRestocked: Date.now() - 86400000 * 15, salesCount: 890 },
  { id: 'p5', name: 'Ceramic Plant Pot Set', sku: 'HOME-001', category: 'cat4', supplier: 'sup4', price: 34.99, cost: 15.00, stock: 67, minStock: 15, maxStock: 200, warehouse: 'wh2', status: 'active', weight: 2.5, barcode: '4234567890123', description: 'Set of 3 decorative ceramic pots with drainage holes. Includes saucers.', tags: ['ceramic', 'plants', 'decor'], createdAt: Date.now() - 86400000 * 25, lastRestocked: Date.now() - 86400000 * 8, salesCount: 234 },
  { id: 'p6', name: 'Yoga Mat Premium', sku: 'SPRT-001', category: 'cat5', supplier: 'sup5', price: 49.99, cost: 18.00, stock: 0, minStock: 10, maxStock: 150, warehouse: 'wh1', status: 'out_of_stock', weight: 1.2, barcode: '5234567890123', description: 'Extra thick non-slip yoga mat with alignment markings and carrying strap.', tags: ['yoga', 'fitness', 'mat'], createdAt: Date.now() - 86400000 * 40, lastRestocked: Date.now() - 86400000 * 30, salesCount: 456 },
  { id: 'p7', name: 'Bestseller Fiction Collection', sku: 'BOOK-001', category: 'cat6', supplier: 'sup6', price: 24.99, cost: 10.00, stock: 189, minStock: 25, maxStock: 400, warehouse: 'wh2', status: 'active', weight: 1.8, barcode: '6234567890123', description: 'Curated collection of 3 bestselling fiction novels. Perfect gift set.', tags: ['fiction', 'bestseller', 'gift'], createdAt: Date.now() - 86400000 * 15, lastRestocked: Date.now() - 86400000 * 3, salesCount: 678 },
  { id: 'p8', name: 'Smart Watch Band', sku: 'ELEC-003', category: 'cat1', supplier: 'sup1', price: 19.99, cost: 5.50, stock: 8, minStock: 25, maxStock: 300, warehouse: 'wh1', status: 'low_stock', weight: 0.05, barcode: '1234567890125', description: 'Silicone replacement band compatible with most smart watches. Adjustable fit.', tags: ['watch', 'accessory', 'silicone'], createdAt: Date.now() - 86400000 * 35, lastRestocked: Date.now() - 86400000 * 20, salesCount: 321 },
  { id: 'p9', name: 'Denim Jacket Classic', sku: 'CLTH-002', category: 'cat2', supplier: 'sup2', price: 89.99, cost: 38.00, stock: 34, minStock: 10, maxStock: 100, warehouse: 'wh1', status: 'active', weight: 0.8, barcode: '2234567890124', description: 'Classic fit denim jacket with button closure. Vintage wash finish.', tags: ['denim', 'jacket', 'classic'], createdAt: Date.now() - 86400000 * 50, lastRestocked: Date.now() - 86400000 * 12, salesCount: 198 },
  { id: 'p10', name: 'Protein Bar Variety Pack', sku: 'FOOD-002', category: 'cat3', supplier: 'sup3', price: 29.99, cost: 14.00, stock: 256, minStock: 40, maxStock: 600, warehouse: 'wh3', status: 'active', weight: 1.0, barcode: '3234567890124', description: '24-pack of assorted protein bars. Flavors: chocolate, peanut butter, vanilla.', tags: ['protein', 'snack', 'fitness'], createdAt: Date.now() - 86400000 * 10, lastRestocked: Date.now() - 86400000 * 1, salesCount: 1567 },
  { id: 'p11', name: 'LED Desk Lamp', sku: 'HOME-002', category: 'cat4', supplier: 'sup4', price: 44.99, cost: 20.00, stock: 45, minStock: 10, maxStock: 100, warehouse: 'wh2', status: 'active', weight: 1.5, barcode: '4234567890124', description: 'Adjustable LED desk lamp with 5 brightness levels and USB charging port.', tags: ['led', 'lamp', 'office'], createdAt: Date.now() - 86400000 * 18, lastRestocked: Date.now() - 86400000 * 6, salesCount: 389 },
  { id: 'p12', name: 'Running Shoes TrailMax', sku: 'SPRT-002', category: 'cat5', supplier: 'sup5', price: 129.99, cost: 55.00, stock: 23, minStock: 15, maxStock: 80, warehouse: 'wh1', status: 'active', weight: 0.7, barcode: '5234567890124', description: 'Trail running shoes with waterproof membrane and Vibram outsole.', tags: ['running', 'trail', 'waterproof'], createdAt: Date.now() - 86400000 * 22, lastRestocked: Date.now() - 86400000 * 9, salesCount: 167 },
  { id: 'p13', name: 'Wireless Mouse Ergonomic', sku: 'ELEC-004', category: 'cat1', supplier: 'sup1', price: 39.99, cost: 12.00, stock: 0, minStock: 20, maxStock: 250, warehouse: 'wh1', status: 'discontinued', weight: 0.1, barcode: '1234567890126', description: 'Ergonomic vertical wireless mouse with adjustable DPI and silent clicks.', tags: ['mouse', 'ergonomic', 'wireless'], createdAt: Date.now() - 86400000 * 90, lastRestocked: Date.now() - 86400000 * 60, salesCount: 789 },
  { id: 'p14', name: 'Garden Tool Set', sku: 'HOME-003', category: 'cat4', supplier: 'sup4', price: 54.99, cost: 25.00, stock: 5, minStock: 10, maxStock: 60, warehouse: 'wh2', status: 'low_stock', weight: 3.0, barcode: '4234567890125', description: '5-piece stainless steel garden tool set with ergonomic handles and storage bag.', tags: ['garden', 'tools', 'outdoor'], createdAt: Date.now() - 86400000 * 28, lastRestocked: Date.now() - 86400000 * 18, salesCount: 145 },
  { id: 'p15', name: 'Cookbook: World Flavors', sku: 'BOOK-002', category: 'cat6', supplier: 'sup6', price: 34.99, cost: 16.00, stock: 92, minStock: 20, maxStock: 200, warehouse: 'wh2', status: 'active', weight: 1.2, barcode: '6234567890124', description: 'International cookbook with 200+ recipes from 40 countries. Hardcover edition.', tags: ['cookbook', 'international', 'recipes'], createdAt: Date.now() - 86400000 * 8, lastRestocked: Date.now() - 86400000 * 4, salesCount: 234 },
  { id: 'p16', name: 'Resistance Band Set', sku: 'SPRT-003', category: 'cat5', supplier: 'sup5', price: 24.99, cost: 8.00, stock: 178, minStock: 30, maxStock: 400, warehouse: 'wh1', status: 'active', weight: 0.4, barcode: '5234567890125', description: 'Set of 5 resistance bands with different strengths. Includes door anchor and carrying pouch.', tags: ['resistance', 'fitness', 'home-workout'], createdAt: Date.now() - 86400000 * 12, lastRestocked: Date.now() - 86400000 * 2, salesCount: 923 },
];

const INITIAL_ORDERS = [
  { id: 'ord1', productId: 'p1', type: 'restock', quantity: 100, supplier: 'sup1', status: 'delivered', createdAt: Date.now() - 86400000 * 5, deliveredAt: Date.now() - 86400000 * 2, cost: 3500 },
  { id: 'ord2', productId: 'p4', type: 'restock', quantity: 200, supplier: 'sup3', status: 'in_transit', createdAt: Date.now() - 86400000 * 2, deliveredAt: null, cost: 640 },
  { id: 'ord3', productId: 'p6', type: 'restock', quantity: 50, supplier: 'sup5', status: 'pending', createdAt: Date.now() - 86400000 * 1, deliveredAt: null, cost: 900 },
  { id: 'ord4', productId: 'p8', type: 'restock', quantity: 75, supplier: 'sup1', status: 'pending', createdAt: Date.now(), deliveredAt: null, cost: 412.50 },
  { id: 'ord5', productId: 'p14', type: 'restock', quantity: 30, supplier: 'sup4', status: 'in_transit', createdAt: Date.now() - 86400000 * 3, deliveredAt: null, cost: 750 },
  { id: 'ord6', productId: 'p2', type: 'restock', quantity: 500, supplier: 'sup1', status: 'delivered', createdAt: Date.now() - 86400000 * 10, deliveredAt: Date.now() - 86400000 * 7, cost: 1750 },
  { id: 'ord7', productId: 'p10', type: 'restock', quantity: 150, supplier: 'sup3', status: 'delivered', createdAt: Date.now() - 86400000 * 4, deliveredAt: Date.now() - 86400000 * 1, cost: 2100 },
  { id: 'ord8', productId: 'p3', type: 'return', quantity: 5, supplier: 'sup2', status: 'delivered', createdAt: Date.now() - 86400000 * 6, deliveredAt: Date.now() - 86400000 * 4, cost: -60 },
];

const STATUS_COLORS = {
  active: '#22c55e',
  low_stock: '#f59e0b',
  out_of_stock: '#ef4444',
  discontinued: '#6b7280',
};

const ORDER_STATUS_COLORS = {
  pending: '#f59e0b',
  in_transit: '#3b82f6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

export default function InventoryAdmin() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeView, setActiveView] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterWarehouse, setFilterWarehouse] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bulkSelection, setBulkSelection] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editFormData, setEditFormData] = useState(null);
  const [orderFormData, setOrderFormData] = useState({ productId: '', quantity: '', supplier: '' });
  const [stockAlerts, setStockAlerts] = useState([]);
  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('inventoryTheme');
      if (savedTheme === 'dark') setIsDarkMode(true);
      const savedView = localStorage.getItem('inventoryView');
      if (savedView) setActiveView(savedView);
      const savedProducts = localStorage.getItem('inventoryProducts');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      const savedOrders = localStorage.getItem('inventoryOrders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      const savedItemsPerPage = localStorage.getItem('inventoryItemsPerPage');
      if (savedItemsPerPage) setItemsPerPage(parseInt(savedItemsPerPage, 10));
    } catch (e) {
      // Gracefully handle corrupted localStorage
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('inventoryTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('inventoryView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('inventoryProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inventoryOrders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('inventoryItemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  // Calculate stock alerts
  useEffect(() => {
    const alerts = products
      .filter((p) => p.status !== 'discontinued' && p.stock <= p.minStock)
      .map((p) => ({
        id: `alert-${p.id}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        currentStock: p.stock,
        minStock: p.minStock,
        severity: p.stock === 0 ? 'critical' : 'warning',
      }));
    setStockAlerts(alerts);
  }, [products]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowOrderModal(false);
        setShowBulkImport(false);
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

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterCategory !== 'all') result = result.filter((p) => p.category === filterCategory);
    if (filterStatus !== 'all') result = result.filter((p) => p.status === filterStatus);
    if (filterSupplier !== 'all') result = result.filter((p) => p.supplier === filterSupplier);
    if (filterWarehouse !== 'all') result = result.filter((p) => p.warehouse === filterWarehouse);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'price') cmp = a.price - b.price;
      else if (sortField === 'stock') cmp = a.stock - b.stock;
      else if (sortField === 'sales') cmp = a.salesCount - b.salesCount;
      else if (sortField === 'created') cmp = a.createdAt - b.createdAt;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [products, searchQuery, filterCategory, filterStatus, filterSupplier, filterWarehouse, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus, filterSupplier, filterWarehouse]);

  const addNotification = useCallback(
    (message) => {
      const n = { id: `n-${Date.now()}`, message, timestamp: Date.now(), read: false };
      setNotifications((prev) => [n, ...prev]);
    },
    []
  );

  const handleCreateProduct = (formData) => {
    const newProduct = {
      id: `p${Date.now()}`,
      ...formData,
      stock: parseInt(formData.stock, 10) || 0,
      minStock: parseInt(formData.minStock, 10) || 0,
      maxStock: parseInt(formData.maxStock, 10) || 0,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      weight: parseFloat(formData.weight) || 0,
      status: parseInt(formData.stock, 10) > 0 ? 'active' : 'out_of_stock',
      createdAt: Date.now(),
      lastRestocked: Date.now(),
      salesCount: 0,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
    };
    setProducts((prev) => [...prev, newProduct]);
    setShowCreateModal(false);
    addNotification(`Product "${newProduct.name}" created`);
  };

  const handleUpdateProduct = (formData) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== formData.id) return p;
        const stock = parseInt(formData.stock, 10) || 0;
        let status = p.status;
        if (p.status !== 'discontinued') {
          if (stock === 0) status = 'out_of_stock';
          else if (stock <= (parseInt(formData.minStock, 10) || p.minStock)) status = 'low_stock';
          else status = 'active';
        }
        return {
          ...p,
          ...formData,
          stock,
          minStock: parseInt(formData.minStock, 10) || p.minStock,
          maxStock: parseInt(formData.maxStock, 10) || p.maxStock,
          price: parseFloat(formData.price) || p.price,
          cost: parseFloat(formData.cost) || p.cost,
          weight: parseFloat(formData.weight) || p.weight,
          status,
          tags: typeof formData.tags === 'string' ? formData.tags.split(',').map((t) => t.trim()) : p.tags,
        };
      })
    );
    setShowEditModal(false);
    setSelectedProduct(null);
    addNotification(`Product "${formData.name}" updated`);
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedProduct(null);
      addNotification(`Product "${product?.name}" deleted`);
    }
  };

  const handleDiscontinueProduct = (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: 'discontinued' } : p))
    );
    const product = products.find((p) => p.id === productId);
    addNotification(`Product "${product?.name}" discontinued`);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${bulkSelection.length} selected products?`)) {
      setProducts((prev) => prev.filter((p) => !bulkSelection.includes(p.id)));
      addNotification(`${bulkSelection.length} products deleted`);
      setBulkSelection([]);
    }
  };

  const handleBulkStatusChange = (newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (bulkSelection.includes(p.id) ? { ...p, status: newStatus } : p))
    );
    addNotification(`${bulkSelection.length} products updated to ${newStatus}`);
    setBulkSelection([]);
  };

  const handleCreateOrder = (formData) => {
    const product = products.find((p) => p.id === formData.productId);
    const supplier = product ? product.supplier : formData.supplier;
    const newOrder = {
      id: `ord${Date.now()}`,
      productId: formData.productId,
      type: 'restock',
      quantity: parseInt(formData.quantity, 10),
      supplier,
      status: 'pending',
      createdAt: Date.now(),
      deliveredAt: null,
      cost: (parseInt(formData.quantity, 10) || 0) * (product?.cost || 0),
    };
    setOrders((prev) => [...prev, newOrder]);
    setShowOrderModal(false);
    addNotification(`Restock order for "${product?.name}" placed`);
  };

  const handleDeliverOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'delivered', deliveredAt: Date.now() } : o
      )
    );
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== order.productId) return p;
        const newStock = p.stock + order.quantity;
        return {
          ...p,
          stock: newStock,
          lastRestocked: Date.now(),
          status: newStock > p.minStock ? 'active' : newStock > 0 ? 'low_stock' : 'out_of_stock',
        };
      })
    );
    const product = products.find((p) => p.id === order.productId);
    addNotification(`Order for "${product?.name}" delivered (+${order.quantity} units)`);
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Cancel this order?')) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
      );
      addNotification('Order cancelled');
    }
  };

  const toggleBulkSelect = (productId) => {
    setBulkSelection((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (bulkSelection.length === paginatedProducts.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(paginatedProducts.map((p) => p.id));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Status', 'Warehouse', 'Sales'];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.sku,
      CATEGORIES.find((c) => c.id === p.category)?.name || '',
      p.price,
      p.cost,
      p.stock,
      p.status,
      WAREHOUSES.find((w) => w.id === p.warehouse)?.name || '',
      p.salesCount,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Inventory exported to CSV');
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'active').length;
    const lowStockProducts = products.filter((p) => p.status === 'low_stock').length;
    const outOfStockProducts = products.filter((p) => p.status === 'out_of_stock').length;
    const discontinuedProducts = products.filter((p) => p.status === 'discontinued').length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const totalCost = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
    const totalSales = products.reduce((sum, p) => sum + p.salesCount, 0);
    const avgMargin = products.length > 0
      ? products.reduce((sum, p) => sum + ((p.price - p.cost) / p.price) * 100, 0) / products.length
      : 0;
    const categoryBreakdown = CATEGORIES.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat.id);
      return {
        ...cat,
        count: catProducts.length,
        totalStock: catProducts.reduce((s, p) => s + p.stock, 0),
        totalValue: catProducts.reduce((s, p) => s + p.price * p.stock, 0),
        totalSales: catProducts.reduce((s, p) => s + p.salesCount, 0),
      };
    });
    const topSellers = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const inTransitOrders = orders.filter((o) => o.status === 'in_transit').length;
    return {
      totalProducts, activeProducts, lowStockProducts, outOfStockProducts, discontinuedProducts,
      totalValue, totalCost, totalSales, avgMargin, categoryBreakdown, topSellers,
      pendingOrders, inTransitOrders,
    };
  }, [products, orders]);

  const theme = isDarkMode
    ? { bg: '#1a1a2e', card: '#16213e', text: '#e2e8f0', textSecondary: '#94a3b8', border: '#334155', accent: '#3b82f6', sidebar: '#0f172a', hover: '#1e293b', input: '#1e293b', tableStripe: '#1e293b' }
    : { bg: '#f1f5f9', card: '#ffffff', text: '#1e293b', textSecondary: '#64748b', border: '#e2e8f0', accent: '#3b82f6', sidebar: '#1e293b', hover: '#f8fafc', input: '#f8fafc', tableStripe: '#f8fafc' };

  const navItems = [
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '🚚' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'warehouses', label: 'Warehouses', icon: '🏢' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'alerts', label: 'Stock Alerts', icon: '⚠️' },
  ];

  const renderSidebar = () => (
    <div style={{ width: sidebarCollapsed ? 60 : 240, backgroundColor: theme.sidebar, color: '#e2e8f0', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', flexShrink: 0, overflow: 'hidden' }}>
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {!sidebarCollapsed && <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>InvenTrack</h1>}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Toggle sidebar" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: 18 }}>
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveView(item.id)} style={{ width: '100%', padding: sidebarCollapsed ? '12px 0' : '10px 16px', display: 'flex', alignItems: 'center', gap: 10, background: activeView === item.id ? 'rgba(59,130,246,0.2)' : 'transparent', border: 'none', borderLeft: activeView === item.id ? '3px solid #3b82f6' : '3px solid transparent', color: activeView === item.id ? '#3b82f6' : '#94a3b8', cursor: 'pointer', fontSize: 14, textAlign: 'left', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {!sidebarCollapsed && item.label}
          </button>
        ))}
      </nav>
      {!sidebarCollapsed && (
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#94a3b8' }}>
          <div style={{ marginBottom: 4 }}>Total Products: {products.length}</div>
          <div style={{ marginBottom: 4 }}>Active: {analytics.activeProducts}</div>
          <div style={{ color: '#f59e0b' }}>Low Stock: {analytics.lowStockProducts}</div>
          <div style={{ color: '#ef4444' }}>Out of Stock: {analytics.outOfStockProducts}</div>
        </div>
      )}
    </div>
  );

  const renderHeader = () => (
    <div style={{ padding: '12px 24px', backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search products... (Ctrl+K)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, fontSize: 14 }}
      />
      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category" style={{ padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text }}>
        <option value="all">All Categories</option>
        {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status" style={{ padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text }}>
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="low_stock">Low Stock</option>
        <option value="out_of_stock">Out of Stock</option>
        <option value="discontinued">Discontinued</option>
      </select>
      <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} aria-label="Filter by supplier" style={{ padding: '8px 12px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text }}>
        <option value="all">All Suppliers</option>
        {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setShowCreateModal(true)} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          + New Product
        </button>
        <button onClick={handleExportCSV} style={{ padding: '8px 16px', backgroundColor: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
          📥 Export
        </button>
        <button onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications" style={{ padding: '8px 12px', backgroundColor: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 16, position: 'relative' }}>
          🔔
          {notifications.filter((n) => !n.read).length > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </button>
        <button onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle theme" style={{ padding: '8px 12px', backgroundColor: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );

  const renderProductsTable = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: theme.text }}>Products ({filteredProducts.length})</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)} aria-label="Filter by warehouse" style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, fontSize: 13 }}>
            <option value="all">All Warehouses</option>
            {WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))} aria-label="Items per page" style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, fontSize: 13 }}>
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
      {bulkSelection.length > 0 && (
        <div style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: 6, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>{bulkSelection.length} selected</span>
          <button onClick={handleBulkDelete} style={{ padding: '4px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete Selected</button>
          <button onClick={() => handleBulkStatusChange('discontinued')} style={{ padding: '4px 12px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Discontinue</button>
          <button onClick={() => setBulkSelection([])} style={{ padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 'auto' }}>Cancel</button>
        </div>
      )}
      <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>
                <input type="checkbox" checked={bulkSelection.length === paginatedProducts.length && paginatedProducts.length > 0} onChange={toggleSelectAll} aria-label="Select all products" />
              </th>
              <th onClick={() => handleSort('name')} style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer', color: theme.text, fontSize: 13, fontWeight: 600, userSelect: 'none' }}>
                Product {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: theme.text, fontSize: 13, fontWeight: 600 }}>SKU</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: theme.text, fontSize: 13, fontWeight: 600 }}>Category</th>
              <th onClick={() => handleSort('price')} style={{ padding: '10px 12px', textAlign: 'right', cursor: 'pointer', color: theme.text, fontSize: 13, fontWeight: 600, userSelect: 'none' }}>
                Price {sortField === 'price' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('stock')} style={{ padding: '10px 12px', textAlign: 'right', cursor: 'pointer', color: theme.text, fontSize: 13, fontWeight: 600, userSelect: 'none' }}>
                Stock {sortField === 'stock' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: theme.text, fontSize: 13, fontWeight: 600 }}>Status</th>
              <th onClick={() => handleSort('sales')} style={{ padding: '10px 12px', textAlign: 'right', cursor: 'pointer', color: theme.text, fontSize: 13, fontWeight: 600, userSelect: 'none' }}>
                Sales {sortField === 'sales' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: theme.text, fontSize: 13, fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product, idx) => (
              <tr key={product.id} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: idx % 2 === 0 ? 'transparent' : theme.tableStripe, cursor: 'pointer' }} onClick={() => setSelectedProduct(product)}>
                <td style={{ padding: '10px 12px' }} onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={bulkSelection.includes(product.id)} onChange={() => toggleBulkSelect(product.id)} aria-label={`Select ${product.name}`} />
                </td>
                <td style={{ padding: '10px 12px', color: theme.text, fontWeight: 500, fontSize: 14 }}>
                  {product.name}
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>{product.tags.map((t) => `#${t}`).join(' ')}</div>
                </td>
                <td style={{ padding: '10px 12px', color: theme.textSecondary, fontSize: 13, fontFamily: 'monospace' }}>{product.sku}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: 13, color: CATEGORIES.find((c) => c.id === product.category)?.color || theme.text }}>
                    {CATEGORIES.find((c) => c.id === product.category)?.icon} {CATEGORIES.find((c) => c.id === product.category)?.name}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: theme.text, fontWeight: 500, fontSize: 14 }}>${product.price.toFixed(2)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: product.stock <= product.minStock ? '#ef4444' : theme.text, fontSize: 14 }}>
                  {product.stock}
                  {product.stock <= product.minStock && product.status !== 'discontinued' && <span style={{ fontSize: 10, marginLeft: 4 }}>⚠️</span>}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: `${STATUS_COLORS[product.status]}20`, color: STATUS_COLORS[product.status] }}>
                    {product.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: theme.textSecondary, fontSize: 13 }}>{product.salesCount.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setEditFormData({ ...product, tags: product.tags.join(', ') }); setShowEditModal(true); }} style={{ padding: '4px 8px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 4 }}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Del</button>
                </td>
              </tr>
            ))}
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: theme.textSecondary }}>No products found matching your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: 4, backgroundColor: theme.card, color: theme.text, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>First</button>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: 4, backgroundColor: theme.card, color: theme.text, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>←</button>
          <span style={{ color: theme.text, fontSize: 14 }}>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: 4, backgroundColor: theme.card, color: theme.text, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>→</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: 4, backgroundColor: theme.card, color: theme.text, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>Last</button>
        </div>
      )}
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const product = products.find((p) => p.id === selectedProduct.id) || selectedProduct;
    const category = CATEGORIES.find((c) => c.id === product.category);
    const supplier = SUPPLIERS.find((s) => s.id === product.supplier);
    const warehouse = WAREHOUSES.find((w) => w.id === product.warehouse);
    const productOrders = orders.filter((o) => o.productId === product.id);
    const profit = product.price - product.cost;
    const margin = product.price > 0 ? ((profit / product.price) * 100).toFixed(1) : 0;
    const stockPercentage = product.maxStock > 0 ? Math.min(100, (product.stock / product.maxStock) * 100) : 0;
    return (
      <div onClick={() => setSelectedProduct(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', zIndex: 100, overflowY: 'auto' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: theme.card, borderRadius: 12, width: '100%', maxWidth: 700, padding: 24, color: theme.text, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>{product.name}</h2>
              <div style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>SKU: {product.sku} | Barcode: {product.barcode}</div>
            </div>
            <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          <p style={{ color: theme.textSecondary, lineHeight: 1.5, marginBottom: 20 }}>{product.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, backgroundColor: theme.bg, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: theme.textSecondary }}>Price</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>${product.price.toFixed(2)}</div>
            </div>
            <div style={{ padding: 12, backgroundColor: theme.bg, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: theme.textSecondary }}>Cost</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>${product.cost.toFixed(2)}</div>
            </div>
            <div style={{ padding: 12, backgroundColor: theme.bg, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: theme.textSecondary }}>Margin</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{margin}%</div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: theme.textSecondary }}>
              <span>Stock Level: {product.stock} / {product.maxStock}</span>
              <span>Min: {product.minStock}</span>
            </div>
            <div style={{ height: 8, backgroundColor: theme.bg, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stockPercentage}%`, backgroundColor: product.stock <= product.minStock ? '#ef4444' : product.stock <= product.minStock * 2 ? '#f59e0b' : '#22c55e', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: theme.textSecondary }}>Details</h4>
              <div style={{ fontSize: 13, lineHeight: 2 }}>
                <div><strong>Category:</strong> {category?.icon} {category?.name}</div>
                <div><strong>Status:</strong> <span style={{ color: STATUS_COLORS[product.status] }}>{product.status.replace('_', ' ')}</span></div>
                <div><strong>Warehouse:</strong> {warehouse?.name}</div>
                <div><strong>Weight:</strong> {product.weight} kg</div>
                <div><strong>Total Sales:</strong> {product.salesCount.toLocaleString()}</div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: theme.textSecondary }}>Supplier</h4>
              <div style={{ fontSize: 13, lineHeight: 2 }}>
                <div><strong>Name:</strong> {supplier?.name}</div>
                <div><strong>Contact:</strong> {supplier?.contact}</div>
                <div><strong>Phone:</strong> {supplier?.phone}</div>
                <div><strong>Lead Time:</strong> {supplier?.leadTimeDays} days</div>
                <div><strong>Rating:</strong> {'⭐'.repeat(Math.floor(supplier?.rating || 0))} ({supplier?.rating})</div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {product.tags.map((tag) => (
                <span key={tag} style={{ padding: '2px 8px', backgroundColor: `${theme.accent}20`, color: theme.accent, borderRadius: 12, fontSize: 12 }}>#{tag}</span>
              ))}
            </div>
          </div>
          {productOrders.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: theme.textSecondary }}>Order History</h4>
              <div style={{ border: `1px solid ${theme.border}`, borderRadius: 8, overflow: 'hidden' }}>
                {productOrders.map((order) => (
                  <div key={order.id} style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span>{order.type === 'restock' ? '📥' : '📤'} {order.type}</span>
                    <span>Qty: {order.quantity}</span>
                    <span style={{ color: ORDER_STATUS_COLORS[order.status] }}>{order.status}</span>
                    <span style={{ color: theme.textSecondary }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setEditFormData({ ...product, tags: product.tags.join(', ') }); setShowEditModal(true); setSelectedProduct(null); }} style={{ padding: '8px 16px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Edit Product</button>
            <button onClick={() => { setOrderFormData({ productId: product.id, quantity: '', supplier: product.supplier }); setShowOrderModal(true); setSelectedProduct(null); }} style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Order Restock</button>
            {product.status !== 'discontinued' && (
              <button onClick={() => { handleDiscontinueProduct(product.id); setSelectedProduct(null); }} style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Discontinue</button>
            )}
            <button onClick={() => handleDeleteProduct(product.id)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateModal = () => {
    if (!showCreateModal) return null;
    return (
      <div onClick={() => setShowCreateModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', zIndex: 100, overflowY: 'auto' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: theme.card, borderRadius: 12, width: '100%', maxWidth: 600, padding: 24, color: theme.text }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>Create New Product</h2>
            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); handleCreateProduct(Object.fromEntries(fd)); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Name *</label>
                <input name="name" required style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>SKU *</label>
                <input name="sku" required style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Description</label>
              <textarea name="description" rows={3} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Category</label>
                <select name="category" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text }}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Supplier</label>
                <select name="supplier" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text }}>
                  {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Warehouse</label>
                <select name="warehouse" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text }}>
                  {WAREHOUSES.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Price ($)</label>
                <input name="price" type="number" step="0.01" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Cost ($)</label>
                <input name="cost" type="number" step="0.01" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Stock</label>
                <input name="stock" type="number" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Weight (kg)</label>
                <input name="weight" type="number" step="0.01" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Min Stock</label>
                <input name="minStock" type="number" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Max Stock</label>
                <input name="maxStock" type="number" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Barcode</label>
                <input name="barcode" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Tags (comma separated)</label>
              <input name="tags" placeholder="e.g. wireless, audio, bluetooth" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Create Product</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!showEditModal || !editFormData) return null;
    return (
      <div onClick={() => setShowEditModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', zIndex: 100, overflowY: 'auto' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: theme.card, borderRadius: 12, width: '100%', maxWidth: 600, padding: 24, color: theme.text }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>Edit Product</h2>
            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(editFormData); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Name</label>
                <input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>SKU</label>
                <input value={editFormData.sku} onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Price ($)</label>
                <input type="number" step="0.01" value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Cost ($)</label>
                <input type="number" step="0.01" value={editFormData.cost} onChange={(e) => setEditFormData({ ...editFormData, cost: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Stock</label>
                <input type="number" value={editFormData.stock} onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Weight (kg)</label>
                <input type="number" step="0.01" value={editFormData.weight} onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Min Stock</label>
                <input type="number" value={editFormData.minStock} onChange={(e) => setEditFormData({ ...editFormData, minStock: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Max Stock</label>
                <input type="number" value={editFormData.maxStock} onChange={(e) => setEditFormData({ ...editFormData, maxStock: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Tags (comma separated)</label>
              <input value={editFormData.tags} onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '8px 16px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderOrderModal = () => {
    if (!showOrderModal) return null;
    return (
      <div onClick={() => setShowOrderModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: theme.card, borderRadius: 12, width: '100%', maxWidth: 450, padding: 24, color: theme.text }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>Create Restock Order</h2>
            <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', color: theme.text, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateOrder(orderFormData); }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Product</label>
              <select value={orderFormData.productId} onChange={(e) => setOrderFormData({ ...orderFormData, productId: e.target.value })} aria-label="Select product" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text }}>
                <option value="">Select a product</option>
                {products.filter((p) => p.status !== 'discontinued').map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: theme.textSecondary }}>Quantity</label>
              <input type="number" min="1" value={orderFormData.quantity} onChange={(e) => setOrderFormData({ ...orderFormData, quantity: e.target.value })} aria-label="Order quantity" style={{ width: '100%', padding: '8px 10px', border: `1px solid ${theme.border}`, borderRadius: 6, backgroundColor: theme.input, color: theme.text, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowOrderModal(false)} style={{ padding: '8px 16px', backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Place Order</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderOrdersView = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: theme.text }}>Orders ({orders.length})</h2>
        <button onClick={() => { setOrderFormData({ productId: '', quantity: '', supplier: '' }); setShowOrderModal(true); }} style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>+ New Order</button>
      </div>
      <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: theme.text, fontSize: 13, fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: theme.text, fontSize: 13, fontWeight: 600 }}>Product</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: theme.text, fontSize: 13, fontWeight: 600 }}>Type</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: theme.text, fontSize: 13, fontWeight: 600 }}>Quantity</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: theme.text, fontSize: 13, fontWeight: 600 }}>Cost</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: theme.text, fontSize: 13, fontWeight: 600 }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: theme.text, fontSize: 13, fontWeight: 600 }}>Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: theme.text, fontSize: 13, fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const product = products.find((p) => p.id === order.productId);
              return (
                <tr key={order.id} style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: idx % 2 === 0 ? 'transparent' : theme.tableStripe }}>
                  <td style={{ padding: '10px 12px', color: theme.textSecondary, fontSize: 13, fontFamily: 'monospace' }}>{order.id}</td>
                  <td style={{ padding: '10px 12px', color: theme.text, fontSize: 14 }}>{product?.name || 'Unknown'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, backgroundColor: order.type === 'restock' ? '#3b82f620' : '#f59e0b20', color: order.type === 'restock' ? '#3b82f6' : '#f59e0b' }}>{order.type}</span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: theme.text, fontWeight: 500 }}>{order.quantity}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: order.cost < 0 ? '#ef4444' : theme.text, fontWeight: 500 }}>${Math.abs(order.cost).toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: `${ORDER_STATUS_COLORS[order.status]}20`, color: ORDER_STATUS_COLORS[order.status] }}>{order.status.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: theme.textSecondary, fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {order.status === 'in_transit' && (
                      <button onClick={() => handleDeliverOrder(order.id)} style={{ padding: '4px 8px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 4 }}>Mark Delivered</button>
                    )}
                    {(order.status === 'pending' || order.status === 'in_transit') && (
                      <button onClick={() => handleCancelOrder(order.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSuppliersView = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px 0', color: theme.text }}>Suppliers ({SUPPLIERS.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {SUPPLIERS.map((supplier) => {
          const supplierProducts = products.filter((p) => p.supplier === supplier.id);
          const totalStock = supplierProducts.reduce((s, p) => s + p.stock, 0);
          const totalValue = supplierProducts.reduce((s, p) => s + p.price * p.stock, 0);
          return (
            <div key={supplier.id} style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: theme.text }}>{supplier.name}</h3>
                  <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{supplier.location}</div>
                </div>
                <div style={{ color: '#f59e0b', fontSize: 13 }}>{'⭐'.repeat(Math.floor(supplier.rating))} {supplier.rating}</div>
              </div>
              <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.8 }}>
                <div>📧 {supplier.contact}</div>
                <div>📞 {supplier.phone}</div>
                <div>🕐 Lead time: {supplier.leadTimeDays} days</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>{supplierProducts.length}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>Products</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>{totalStock}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>Units</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>${totalValue.toFixed(0)}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>Value</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCategoriesView = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px 0', color: theme.text }}>Categories ({CATEGORIES.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {analytics.categoryBreakdown.map((cat) => (
          <div key={cat.id} style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16, borderLeft: `4px solid ${cat.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <h3 style={{ margin: 0, fontSize: 16, color: theme.text }}>{cat.name}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>{cat.count}</div>
                <div style={{ fontSize: 11, color: theme.textSecondary }}>Products</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>{cat.totalStock}</div>
                <div style={{ fontSize: 11, color: theme.textSecondary }}>Total Stock</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>${cat.totalValue.toFixed(0)}</div>
                <div style={{ fontSize: 11, color: theme.textSecondary }}>Inventory Value</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>{cat.totalSales.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: theme.textSecondary }}>Total Sales</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWarehousesView = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px 0', color: theme.text }}>Warehouses ({WAREHOUSES.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {WAREHOUSES.map((warehouse) => {
          const warehouseProducts = products.filter((p) => p.warehouse === warehouse.id);
          const totalUnits = warehouseProducts.reduce((s, p) => s + p.stock, 0);
          const utilization = warehouse.capacity > 0 ? ((totalUnits / warehouse.capacity) * 100).toFixed(1) : 0;
          return (
            <div key={warehouse.id} style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: theme.text }}>🏢 {warehouse.name}</h3>
              <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 12 }}>{warehouse.location}</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: theme.textSecondary }}>
                  <span>Utilization: {totalUnits} / {warehouse.capacity}</span>
                  <span>{utilization}%</span>
                </div>
                <div style={{ height: 8, backgroundColor: theme.bg, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, utilization)}%`, backgroundColor: utilization > 90 ? '#ef4444' : utilization > 70 ? '#f59e0b' : '#22c55e', borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center', padding: 8, backgroundColor: theme.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>{warehouseProducts.length}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>Products</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, backgroundColor: theme.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>{totalUnits.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>Total Units</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px 0', color: theme.text }}>Inventory Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Total Products</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.text }}>{analytics.totalProducts}</div>
        </div>
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Inventory Value</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        </div>
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Total Sales</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.accent }}>{analytics.totalSales.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Avg Margin</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{analytics.avgMargin.toFixed(1)}%</div>
        </div>
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Pending Orders</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{analytics.pendingOrders}</div>
        </div>
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>In Transit</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{analytics.inTransitOrders}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 15, color: theme.text }}>Status Breakdown</h3>
          {[
            { label: 'Active', count: analytics.activeProducts, color: '#22c55e' },
            { label: 'Low Stock', count: analytics.lowStockProducts, color: '#f59e0b' },
            { label: 'Out of Stock', count: analytics.outOfStockProducts, color: '#ef4444' },
            { label: 'Discontinued', count: analytics.discontinuedProducts, color: '#6b7280' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
              <span style={{ flex: 1, fontSize: 13, color: theme.text }}>{item.label}</span>
              <span style={{ fontWeight: 600, color: theme.text }}>{item.count}</span>
              <div style={{ width: 60, height: 6, backgroundColor: theme.bg, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${analytics.totalProducts > 0 ? (item.count / analytics.totalProducts) * 100 : 0}%`, backgroundColor: item.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 15, color: theme.text }}>Top Sellers</h3>
          {analytics.topSellers.map((product, idx) => (
            <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: theme.textSecondary, width: 20 }}>#{idx + 1}</span>
              <span style={{ flex: 1, fontSize: 13, color: theme.text }}>{product.name}</span>
              <span style={{ fontWeight: 600, color: theme.accent, fontSize: 13 }}>{product.salesCount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 15, color: theme.text }}>Category Performance</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: theme.textSecondary, fontSize: 12 }}>Category</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: theme.textSecondary, fontSize: 12 }}>Products</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: theme.textSecondary, fontSize: 12 }}>Stock</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: theme.textSecondary, fontSize: 12 }}>Value</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: theme.textSecondary, fontSize: 12 }}>Sales</th>
            </tr>
          </thead>
          <tbody>
            {analytics.categoryBreakdown.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '8px 12px', fontSize: 13, color: theme.text }}>{cat.icon} {cat.name}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 13, color: theme.text }}>{cat.count}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 13, color: theme.text }}>{cat.totalStock}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 13, color: theme.text }}>${cat.totalValue.toFixed(0)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 13, color: theme.text }}>{cat.totalSales.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAlertsView = () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px 0', color: theme.text }}>Stock Alerts ({stockAlerts.length})</h2>
      {stockAlerts.length === 0 ? (
        <div style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 40, textAlign: 'center', color: theme.textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <div>All products are well-stocked!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stockAlerts.map((alert) => (
            <div key={alert.id} style={{ backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${alert.severity === 'critical' ? '#ef4444' : '#f59e0b'}`, borderLeftWidth: 4, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{alert.severity === 'critical' ? '🚨' : '⚠️'}</span>
                  <span style={{ fontWeight: 600, color: theme.text }}>{alert.productName}</span>
                  <span style={{ fontSize: 12, color: theme.textSecondary, fontFamily: 'monospace' }}>{alert.sku}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: alert.severity === 'critical' ? '#ef444420' : '#f59e0b20', color: alert.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>{alert.severity}</span>
                </div>
                <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>
                  Current stock: {alert.currentStock} (minimum: {alert.minStock})
                </div>
              </div>
              <button onClick={() => { setOrderFormData({ productId: alert.productId, quantity: String(alert.minStock * 2), supplier: '' }); setShowOrderModal(true); }} style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                Order Restock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => {
    if (!showNotifications) return null;
    return (
      <div ref={notificationRef} style={{ position: 'absolute', top: 50, right: 80, width: 320, backgroundColor: theme.card, borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: 400, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, color: theme.text }}>Notifications</h3>
          <button onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: 12 }}>Mark all read</button>
        </div>
        {notifications.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: theme.textSecondary }}>No notifications</div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <div key={n.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}`, backgroundColor: n.read ? 'transparent' : `${theme.accent}10` }}>
              <div style={{ fontSize: 13, color: theme.text }}>{n.message}</div>
              <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>{new Date(n.timestamp).toLocaleTimeString()}</div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'products': return renderProductsTable();
      case 'orders': return renderOrdersView();
      case 'suppliers': return renderSuppliersView();
      case 'categories': return renderCategoriesView();
      case 'warehouses': return renderWarehousesView();
      case 'analytics': return renderAnalyticsView();
      case 'alerts': return renderAlertsView();
      default: return renderProductsTable();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: theme.bg, overflow: 'hidden' }}>
      {renderSidebar()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {renderHeader()}
        {renderNotifications()}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderMainContent()}
        </div>
      </div>
      {renderProductDetail()}
      {renderCreateModal()}
      {renderEditModal()}
      {renderOrderModal()}
    </div>
  );
}
