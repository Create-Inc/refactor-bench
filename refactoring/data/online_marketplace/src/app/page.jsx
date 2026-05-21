import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = ['electronics', 'clothing', 'home', 'sports', 'books', 'toys', 'beauty', 'automotive'];
const CATEGORY_LABELS = {
  electronics: 'Electronics',
  clothing: 'Clothing & Apparel',
  home: 'Home & Garden',
  sports: 'Sports & Outdoors',
  books: 'Books & Media',
  toys: 'Toys & Games',
  beauty: 'Beauty & Health',
  automotive: 'Automotive',
};

const SORT_OPTIONS = ['relevance', 'price_low', 'price_high', 'rating', 'newest', 'bestselling'];
const SORT_LABELS = {
  relevance: 'Relevance',
  price_low: 'Price: Low to High',
  price_high: 'Price: High to Low',
  rating: 'Highest Rated',
  newest: 'Newest First',
  bestselling: 'Best Selling',
};

const SELLERS = [
  { id: 's1', name: 'TechWorld', avatar: '🏪', rating: 4.8, totalSales: 12500, joinedDate: '2022-03-15', description: 'Premium electronics and gadgets retailer with 2-day shipping guarantee.', verified: true, location: 'San Francisco, CA' },
  { id: 's2', name: 'FashionHub', avatar: '👗', rating: 4.5, totalSales: 8900, joinedDate: '2021-11-20', description: 'Curated fashion collections from independent designers worldwide.', verified: true, location: 'New York, NY' },
  { id: 's3', name: 'HomeComfort', avatar: '🏠', rating: 4.7, totalSales: 6200, joinedDate: '2023-01-10', description: 'Quality home furnishings and decor for modern living.', verified: false, location: 'Portland, OR' },
  { id: 's4', name: 'SportsPro', avatar: '⚽', rating: 4.6, totalSales: 4300, joinedDate: '2022-07-05', description: 'Professional sports equipment and athletic wear.', verified: true, location: 'Denver, CO' },
  { id: 's5', name: 'BookNook', avatar: '📚', rating: 4.9, totalSales: 15800, joinedDate: '2020-05-18', description: 'Independent bookstore specializing in rare and collectible editions.', verified: true, location: 'Boston, MA' },
  { id: 's6', name: 'GreenGarden', avatar: '🌱', rating: 4.4, totalSales: 3100, joinedDate: '2023-06-22', description: 'Eco-friendly garden supplies and organic plant care products.', verified: false, location: 'Austin, TX' },
];

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Wireless Noise-Canceling Headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and hi-res audio support. Includes carrying case and charging cable.', price: 249.99, originalPrice: 349.99, category: 'electronics', sellerId: 's1', images: ['headphones-1.jpg', 'headphones-2.jpg'], rating: 4.7, reviewCount: 342, stock: 45, tags: ['wireless', 'noise-canceling', 'bluetooth', 'premium'], createdAt: Date.now() - 86400000 * 30, salesCount: 1250, featured: true },
  { id: 'p2', name: 'Organic Cotton T-Shirt Bundle', description: 'Set of 5 premium organic cotton t-shirts in assorted earth tones. Pre-shrunk, tagless, with reinforced seams for lasting comfort.', price: 79.99, originalPrice: null, category: 'clothing', sellerId: 's2', images: ['tshirt-1.jpg'], rating: 4.3, reviewCount: 128, stock: 200, tags: ['organic', 'cotton', 'bundle', 'basics'], createdAt: Date.now() - 86400000 * 15, salesCount: 890, featured: false },
  { id: 'p3', name: 'Smart Home Security Camera', description: '4K indoor/outdoor security camera with night vision, two-way audio, motion detection zones, and cloud storage. Works with Alexa and Google Home.', price: 129.99, originalPrice: 179.99, category: 'electronics', sellerId: 's1', images: ['camera-1.jpg', 'camera-2.jpg', 'camera-3.jpg'], rating: 4.5, reviewCount: 567, stock: 78, tags: ['smart-home', 'security', '4k', 'wifi'], createdAt: Date.now() - 86400000 * 45, salesCount: 2340, featured: true },
  { id: 'p4', name: 'Ergonomic Standing Desk', description: 'Electric height-adjustable standing desk with memory presets, cable management tray, and solid bamboo top. Supports up to 300 lbs.', price: 599.99, originalPrice: 799.99, category: 'home', sellerId: 's3', images: ['desk-1.jpg', 'desk-2.jpg'], rating: 4.8, reviewCount: 89, stock: 12, tags: ['ergonomic', 'standing-desk', 'bamboo', 'electric'], createdAt: Date.now() - 86400000 * 60, salesCount: 456, featured: true },
  { id: 'p5', name: 'Trail Running Shoes', description: 'Lightweight trail running shoes with Vibram outsole, waterproof membrane, and responsive cushioning. Available in sizes 7-14.', price: 159.99, originalPrice: null, category: 'sports', sellerId: 's4', images: ['shoes-1.jpg'], rating: 4.6, reviewCount: 234, stock: 56, tags: ['running', 'trail', 'waterproof', 'vibram'], createdAt: Date.now() - 86400000 * 20, salesCount: 780, featured: false },
  { id: 'p6', name: 'Collector\'s Edition Fantasy Box Set', description: 'Complete 7-book fantasy series in hardcover with gilded edges, exclusive artwork, fold-out map, and signed bookplate.', price: 189.99, originalPrice: 249.99, category: 'books', sellerId: 's5', images: ['books-1.jpg', 'books-2.jpg'], rating: 4.9, reviewCount: 1203, stock: 25, tags: ['fantasy', 'collector', 'hardcover', 'box-set'], createdAt: Date.now() - 86400000 * 90, salesCount: 5670, featured: true },
  { id: 'p7', name: 'Bluetooth Mechanical Keyboard', description: 'Compact 75% layout mechanical keyboard with hot-swappable switches, RGB backlighting, and multi-device Bluetooth connectivity.', price: 139.99, originalPrice: null, category: 'electronics', sellerId: 's1', images: ['keyboard-1.jpg'], rating: 4.4, reviewCount: 178, stock: 90, tags: ['mechanical', 'keyboard', 'bluetooth', 'rgb'], createdAt: Date.now() - 86400000 * 10, salesCount: 560, featured: false },
  { id: 'p8', name: 'Yoga Mat & Accessories Kit', description: 'Premium non-slip yoga mat with alignment lines, cork blocks, cotton strap, and microfiber towel. Comes in a carrying bag.', price: 69.99, originalPrice: 89.99, category: 'sports', sellerId: 's4', images: ['yoga-1.jpg', 'yoga-2.jpg'], rating: 4.7, reviewCount: 445, stock: 150, tags: ['yoga', 'fitness', 'non-slip', 'eco-friendly'], createdAt: Date.now() - 86400000 * 25, salesCount: 1890, featured: false },
  { id: 'p9', name: 'Indoor Herb Garden Kit', description: 'Self-watering LED herb garden with 6 pods, adjustable light height, and smart water indicator. Includes basil, cilantro, and parsley seed pods.', price: 89.99, originalPrice: null, category: 'home', sellerId: 's6', images: ['garden-1.jpg'], rating: 4.2, reviewCount: 67, stock: 35, tags: ['garden', 'herbs', 'indoor', 'led', 'self-watering'], createdAt: Date.now() - 86400000 * 5, salesCount: 230, featured: false },
  { id: 'p10', name: 'Vintage Leather Messenger Bag', description: 'Handcrafted full-grain leather messenger bag with padded laptop compartment, brass hardware, and adjustable strap. Ages beautifully.', price: 219.99, originalPrice: 279.99, category: 'clothing', sellerId: 's2', images: ['bag-1.jpg', 'bag-2.jpg'], rating: 4.8, reviewCount: 312, stock: 18, tags: ['leather', 'messenger', 'handcrafted', 'vintage'], createdAt: Date.now() - 86400000 * 70, salesCount: 1450, featured: true },
  { id: 'p11', name: 'Building Blocks Mega Set', description: '1500-piece creative building blocks set compatible with major brands. Includes baseplate, storage box, and idea booklet.', price: 49.99, originalPrice: null, category: 'toys', sellerId: 's3', images: ['blocks-1.jpg'], rating: 4.6, reviewCount: 890, stock: 200, tags: ['building', 'blocks', 'creative', 'kids'], createdAt: Date.now() - 86400000 * 35, salesCount: 3400, featured: false },
  { id: 'p12', name: 'Natural Skincare Gift Set', description: 'Luxury skincare set with vitamin C serum, hyaluronic acid moisturizer, retinol night cream, and jade roller. All-natural ingredients.', price: 109.99, originalPrice: 149.99, category: 'beauty', sellerId: 's6', images: ['skincare-1.jpg', 'skincare-2.jpg'], rating: 4.5, reviewCount: 256, stock: 42, tags: ['skincare', 'natural', 'gift-set', 'anti-aging'], createdAt: Date.now() - 86400000 * 12, salesCount: 1120, featured: false },
];

const INITIAL_REVIEWS = [
  { id: 'r1', productId: 'p1', userId: 'u1', userName: 'Alex M.', rating: 5, title: 'Best headphones I\'ve owned', text: 'Incredible sound quality and the noise cancellation is next level. Battery lasts forever.', date: Date.now() - 86400000 * 5, helpful: 24, images: [] },
  { id: 'r2', productId: 'p1', userId: 'u2', userName: 'Sarah K.', rating: 4, title: 'Great but a bit heavy', text: 'Sound quality is amazing but they get uncomfortable after 3+ hours. ANC is excellent.', date: Date.now() - 86400000 * 12, helpful: 18, images: [] },
  { id: 'r3', productId: 'p4', userId: 'u3', userName: 'Mike R.', rating: 5, title: 'Transformed my workspace', text: 'The bamboo top is gorgeous. Motor is whisper quiet. Memory presets are clutch.', date: Date.now() - 86400000 * 8, helpful: 31, images: [] },
  { id: 'r4', productId: 'p6', userId: 'u4', userName: 'Emma L.', rating: 5, title: 'Stunning collector\'s edition', text: 'The gilded edges and artwork are breathtaking. Worth every penny for fans.', date: Date.now() - 86400000 * 3, helpful: 42, images: [] },
  { id: 'r5', productId: 'p3', userId: 'u5', userName: 'James W.', rating: 4, title: 'Solid security camera', text: 'Night vision is surprisingly clear. App could use some work but camera hardware is great.', date: Date.now() - 86400000 * 20, helpful: 15, images: [] },
  { id: 'r6', productId: 'p10', userId: 'u6', userName: 'Diana P.', rating: 5, title: 'Absolutely gorgeous bag', text: 'The leather quality is exceptional. It\'s already developing a beautiful patina.', date: Date.now() - 86400000 * 15, helpful: 28, images: [] },
  { id: 'r7', productId: 'p5', userId: 'u7', userName: 'Tom H.', rating: 4, title: 'Great trail grip', text: 'Vibram outsole provides excellent traction. Waterproofing holds up well.', date: Date.now() - 86400000 * 7, helpful: 11, images: [] },
  { id: 'r8', productId: 'p8', userId: 'u8', userName: 'Lisa C.', rating: 5, title: 'Everything you need for yoga', text: 'Mat is thick and grippy. Cork blocks are sturdy. Great value for a complete kit.', date: Date.now() - 86400000 * 18, helpful: 36, images: [] },
];

export default function OnlineMarketplace() {
  const [products] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [activeView, setActiveView] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterOnSale, setFilterOnSale] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({ name: '', address: '', city: '', state: '', zip: '', phone: '' });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: '', expiry: '', cvv: '', nameOnCard: '' });
  const [newReview, setNewReview] = useState({ rating: 5, title: '', text: '' });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const searchInputRef = useRef(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const savedTheme = localStorage.getItem('marketTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
    const savedCart = localStorage.getItem('marketCart');
    if (savedCart) { try { setCart(JSON.parse(savedCart)); } catch (e) { /* ignore */ } }
    const savedWishlist = localStorage.getItem('marketWishlist');
    if (savedWishlist) { try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { /* ignore */ } }
    const savedOrders = localStorage.getItem('marketOrders');
    if (savedOrders) { try { setOrders(JSON.parse(savedOrders)); } catch (e) { /* ignore */ } }
    const savedView = localStorage.getItem('marketActiveView');
    if (savedView) setActiveView(savedView);
  }, []);

  useEffect(() => { localStorage.setItem('marketTheme', isDarkMode ? 'dark' : 'light'); }, [isDarkMode]);
  useEffect(() => { localStorage.setItem('marketCart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('marketWishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('marketOrders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('marketActiveView', activeView); }, [activeView]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'Escape') { setSelectedProduct(null); setSelectedSeller(null); setShowCheckout(false); setShowReviewModal(false); setSelectedOrder(null); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = useCallback((message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, read: false }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  }, []);

  const addToCart = useCallback((productId, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { productId, quantity }];
    });
    const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
    addNotification(`Added "${product?.name}" to cart`);
  }, [addNotification]);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity } : item));
  }, [removeFromCart]);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addNotification('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      }
      addNotification('Added to wishlist');
      return [...prev, productId];
    });
  }, [addNotification]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query) || p.tags.some((t) => t.toLowerCase().includes(query)));
    }
    if (filterCategory !== 'all') result = result.filter((p) => p.category === filterCategory);
    if (filterPriceMin !== '') result = result.filter((p) => p.price >= parseFloat(filterPriceMin));
    if (filterPriceMax !== '') result = result.filter((p) => p.price <= parseFloat(filterPriceMax));
    if (filterRating > 0) result = result.filter((p) => p.rating >= filterRating);
    if (filterInStock) result = result.filter((p) => p.stock > 0);
    if (filterOnSale) result = result.filter((p) => p.originalPrice !== null);

    switch (sortBy) {
      case 'price_low': result.sort((a, b) => a.price - b.price); break;
      case 'price_high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'bestselling': result.sort((a, b) => b.salesCount - a.salesCount); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.salesCount - a.salesCount); break;
    }
    return result;
  }, [products, searchQuery, filterCategory, filterPriceMin, filterPriceMax, filterRating, filterInStock, filterOnSale, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (catalogPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, catalogPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const placeOrder = useCallback(() => {
    if (cart.length === 0) return;
    const newOrder = {
      id: `order-${Date.now()}`,
      items: cart.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return { ...item, name: product?.name, price: product?.price, image: product?.images[0] };
      }),
      total: cartTotal,
      shipping: shippingInfo,
      status: 'processing',
      date: Date.now(),
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setShowCheckout(false);
    setCheckoutStep(1);
    setShippingInfo({ name: '', address: '', city: '', state: '', zip: '', phone: '' });
    setPaymentInfo({ cardNumber: '', expiry: '', cvv: '', nameOnCard: '' });
    addNotification(`Order ${newOrder.id} placed successfully!`);
    setActiveView('orders');
  }, [cart, products, cartTotal, shippingInfo, addNotification]);

  const submitReview = useCallback(() => {
    if (!selectedProduct || !newReview.title || !newReview.text) return;
    const review = {
      id: `r-${Date.now()}`,
      productId: selectedProduct.id,
      userId: 'current-user',
      userName: 'You',
      rating: newReview.rating,
      title: newReview.title,
      text: newReview.text,
      date: Date.now(),
      helpful: 0,
      images: [],
    };
    setReviews((prev) => [review, ...prev]);
    setShowReviewModal(false);
    setNewReview({ rating: 5, title: '', text: '' });
    addNotification('Review submitted successfully!');
  }, [selectedProduct, newReview, addNotification]);

  const markReviewHelpful = useCallback((reviewId) => {
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
  }, []);

  const getProductReviews = useCallback((productId) => {
    return reviews.filter((r) => r.productId === productId);
  }, [reviews]);

  const bgColor = isDarkMode ? '#111827' : '#f9fafb';
  const cardBg = isDarkMode ? '#1f2937' : '#ffffff';
  const textColor = isDarkMode ? '#f3f4f6' : '#111827';
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280';
  const borderColor = isDarkMode ? '#374151' : '#e5e7eb';
  const accentColor = '#3b82f6';
  const sidebarBg = isDarkMode ? '#0f172a' : '#1e293b';

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating));
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderSidebar = () => (
    <div data-testid="sidebar" style={{ width: sidebarCollapsed ? 60 : 240, background: sidebarBg, color: '#e2e8f0', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', flexShrink: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #334155' }}>
        <span style={{ fontSize: 24 }}>🛍️</span>
        {!sidebarCollapsed && <span style={{ fontWeight: 'bold', fontSize: 18 }}>MarketPlace</span>}
      </div>
      <nav style={{ flex: 1, padding: '8px' }}>
        {[
          { id: 'catalog', icon: '📦', label: 'Browse Products' },
          { id: 'cart', icon: '🛒', label: `Cart${cartItemCount > 0 ? ` (${cartItemCount})` : ''}` },
          { id: 'wishlist', icon: '❤️', label: `Wishlist${wishlist.length > 0 ? ` (${wishlist.length})` : ''}` },
          { id: 'orders', icon: '📋', label: 'Order History' },
          { id: 'sellers', icon: '🏬', label: 'Sellers' },
        ].map(({ id, icon, label }) => (
          <button key={id} onClick={() => { setActiveView(id); setSelectedProduct(null); setSelectedSeller(null); setSelectedOrder(null); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', marginBottom: 4, border: 'none', borderRadius: 8, cursor: 'pointer', background: activeView === id ? '#3b82f6' : 'transparent', color: activeView === id ? '#ffffff' : '#94a3b8', fontSize: 14, textAlign: 'left' }}>
            <span>{icon}</span>
            {!sidebarCollapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: '12px', borderTop: '1px solid #334155' }}>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ width: '100%', padding: '8px', border: 'none', borderRadius: 6, cursor: 'pointer', background: '#334155', color: '#94a3b8', fontSize: 12 }}>
          {sidebarCollapsed ? '→' : '← Collapse'}
        </button>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: `1px solid ${borderColor}`, background: cardBg }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input ref={searchInputRef} type="text" placeholder="Search products... (Ctrl+K)" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCatalogPage(1); }} style={{ flex: 1, maxWidth: 400, padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 8, background: bgColor, color: textColor, fontSize: 14 }} aria-label="Search products" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button aria-label="Toggle theme" onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 16 }}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div style={{ position: 'relative' }}>
          <button aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)} style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 16, position: 'relative' }}>
            🔔
            {notifications.filter((n) => !n.read).length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div data-testid="notification-panel" style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, width: 300, background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: 300, overflow: 'auto' }}>
              <div style={{ padding: '12px', borderBottom: `1px solid ${borderColor}`, fontWeight: 600, color: textColor }}>Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: textSecondary }}>No notifications</div>
              ) : notifications.map((n) => (
                <div key={n.id} onClick={() => setNotifications((prev) => prev.map((notif) => notif.id === n.id ? { ...notif, read: true } : notif))} style={{ padding: '10px 12px', borderBottom: `1px solid ${borderColor}`, cursor: 'pointer', background: n.read ? 'transparent' : (isDarkMode ? '#1e3a5f' : '#eff6ff'), color: textColor, fontSize: 13 }}>
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => { setActiveView('cart'); setSelectedProduct(null); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', cursor: 'pointer', color: textColor, fontSize: 14 }}>
          🛒 <span data-testid="cart-badge">{cartItemCount}</span>
        </button>
      </div>
    </header>
  );

  const renderFilterBar = () => (
    <div data-testid="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '12px 24px', borderBottom: `1px solid ${borderColor}`, background: cardBg, alignItems: 'center' }}>
      <select aria-label="Filter by category" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCatalogPage(1); }} style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 13 }}>
        <option value="all">All Categories</option>
        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
      </select>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: textSecondary }}>
        <span>Price:</span>
        <input type="number" placeholder="Min" value={filterPriceMin} onChange={(e) => { setFilterPriceMin(e.target.value); setCatalogPage(1); }} style={{ width: 70, padding: '6px 8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 13 }} aria-label="Minimum price" />
        <span>-</span>
        <input type="number" placeholder="Max" value={filterPriceMax} onChange={(e) => { setFilterPriceMax(e.target.value); setCatalogPage(1); }} style={{ width: 70, padding: '6px 8px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 13 }} aria-label="Maximum price" />
      </div>
      <select aria-label="Minimum rating" value={filterRating} onChange={(e) => { setFilterRating(Number(e.target.value)); setCatalogPage(1); }} style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 13 }}>
        <option value={0}>Any Rating</option>
        <option value={4}>4+ Stars</option>
        <option value={4.5}>4.5+ Stars</option>
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: textSecondary, cursor: 'pointer' }}>
        <input type="checkbox" checked={filterInStock} onChange={(e) => { setFilterInStock(e.target.checked); setCatalogPage(1); }} /> In Stock Only
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: textSecondary, cursor: 'pointer' }}>
        <input type="checkbox" checked={filterOnSale} onChange={(e) => { setFilterOnSale(e.target.checked); setCatalogPage(1); }} /> On Sale
      </label>
      <select aria-label="Sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 13, marginLeft: 'auto' }}>
        {SORT_OPTIONS.map((opt) => <option key={opt} value={opt}>{SORT_LABELS[opt]}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 4 }}>
        <button aria-label="Grid view" onClick={() => setViewMode('grid')} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, background: viewMode === 'grid' ? accentColor : 'transparent', color: viewMode === 'grid' ? 'white' : textSecondary, cursor: 'pointer' }}>▦</button>
        <button aria-label="List view" onClick={() => setViewMode('list')} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, background: viewMode === 'list' ? accentColor : 'transparent', color: viewMode === 'list' ? 'white' : textSecondary, cursor: 'pointer' }}>☰</button>
      </div>
      <span style={{ fontSize: 13, color: textSecondary }}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</span>
    </div>
  );

  const renderProductCard = (product) => {
    const isInWishlist = wishlist.includes(product.id);
    const isInCart = cart.some((item) => item.productId === product.id);
    const seller = SELLERS.find((s) => s.id === product.sellerId);

    if (viewMode === 'list') {
      return (
        <div key={product.id} data-testid={`product-card-${product.id}`} style={{ display: 'flex', gap: 16, padding: '16px', border: `1px solid ${borderColor}`, borderRadius: 8, background: cardBg, cursor: 'pointer' }} onClick={() => setSelectedProduct(product)}>
          <div style={{ width: 120, height: 120, background: isDarkMode ? '#374151' : '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>📷</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: textColor }}>{product.name}</h3>
                <p style={{ margin: '4px 0', fontSize: 13, color: textSecondary }}>{product.description.slice(0, 100)}...</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: textColor }}>{formatPrice(product.price)}</div>
                {product.originalPrice && <div style={{ fontSize: 13, color: '#ef4444', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <span style={{ color: '#f59e0b', fontSize: 14 }}>{renderStars(product.rating)}</span>
              <span style={{ fontSize: 13, color: textSecondary }}>({product.reviewCount})</span>
              <span style={{ fontSize: 12, color: textSecondary }}>by {seller?.name}</span>
              {product.stock < 10 && <span style={{ fontSize: 12, color: '#ef4444' }}>Only {product.stock} left!</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={(e) => { e.stopPropagation(); addToCart(product.id); }} style={{ padding: '6px 12px', border: 'none', borderRadius: 6, background: isInCart ? '#22c55e' : accentColor, color: 'white', cursor: 'pointer', fontSize: 13 }}>{isInCart ? '✓ In Cart' : 'Add to Cart'}</button>
              <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: isInWishlist ? '#ef4444' : textSecondary, cursor: 'pointer', fontSize: 13 }}>{isInWishlist ? '❤️ Wishlisted' : '🤍 Wishlist'}</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={product.id} data-testid={`product-card-${product.id}`} style={{ border: `1px solid ${borderColor}`, borderRadius: 12, background: cardBg, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setSelectedProduct(product)}>
        <div style={{ position: 'relative', height: 180, background: isDarkMode ? '#374151' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
          📷
          {product.originalPrice && <span style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>SALE</span>}
          {product.featured && <span style={{ position: 'absolute', top: 8, right: 8, background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Featured</span>}
          <button data-testid={`wishlist-btn-${product.id}`} onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} style={{ position: 'absolute', bottom: 8, right: 8, width: 32, height: 32, border: 'none', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            {isInWishlist ? '❤️' : '🤍'}
          </button>
        </div>
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: 12, color: textSecondary, marginBottom: 4 }}>{CATEGORY_LABELS[product.category]}</div>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: textColor, lineHeight: 1.3 }}>{product.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <span style={{ color: '#f59e0b', fontSize: 13 }}>{renderStars(product.rating)}</span>
            <span style={{ fontSize: 12, color: textSecondary }}>({product.reviewCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: textColor }}>{formatPrice(product.price)}</span>
              {product.originalPrice && <span style={{ fontSize: 13, color: '#ef4444', textDecoration: 'line-through', marginLeft: 6 }}>{formatPrice(product.originalPrice)}</span>}
            </div>
            <button data-testid={`add-to-cart-${product.id}`} onClick={(e) => { e.stopPropagation(); addToCart(product.id); }} style={{ padding: '6px 12px', border: 'none', borderRadius: 6, background: isInCart ? '#22c55e' : accentColor, color: 'white', cursor: 'pointer', fontSize: 13 }}>
              {isInCart ? '✓' : '🛒'}
            </button>
          </div>
          {product.stock < 10 && <div style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>Only {product.stock} left!</div>}
        </div>
      </div>
    );
  };

  const renderCatalog = () => (
    <div>
      {renderFilterBar()}
      <div style={{ padding: '24px' }}>
        <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260, 1fr))', gap: 20 } : { display: 'flex', flexDirection: 'column', gap: 12 }}>
          {paginatedProducts.map(renderProductCard)}
        </div>
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: textSecondary }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p>No products found matching your criteria</p>
            <button onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterPriceMin(''); setFilterPriceMax(''); setFilterRating(0); setFilterInStock(false); setFilterOnSale(false); }} style={{ marginTop: 12, padding: '8px 16px', border: 'none', borderRadius: 6, background: accentColor, color: 'white', cursor: 'pointer' }}>Clear Filters</button>
          </div>
        )}
        {totalPages > 1 && (
          <div data-testid="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
            <button disabled={catalogPage === 1} onClick={() => setCatalogPage((p) => p - 1)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: textColor, cursor: catalogPage === 1 ? 'not-allowed' : 'pointer', opacity: catalogPage === 1 ? 0.5 : 1 }}>Previous</button>
            <span style={{ fontSize: 14, color: textSecondary }}>Page {catalogPage} of {totalPages}</span>
            <button disabled={catalogPage === totalPages} onClick={() => setCatalogPage((p) => p + 1)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: textColor, cursor: catalogPage === totalPages ? 'not-allowed' : 'pointer', opacity: catalogPage === totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const product = selectedProduct;
    const seller = SELLERS.find((s) => s.id === product.sellerId);
    const productReviews = getProductReviews(product.id);
    const isInWishlist = wishlist.includes(product.id);
    const cartItem = cart.find((item) => item.productId === product.id);
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return (
      <div data-testid="product-detail" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
        <div style={{ background: cardBg, borderRadius: 16, maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button onClick={() => setSelectedProduct(null)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: textColor, cursor: 'pointer' }}>← Back</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleWishlist(product.id)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: isInWishlist ? '#ef4444' : textSecondary, cursor: 'pointer' }}>{isInWishlist ? '❤️ Wishlisted' : '🤍 Add to Wishlist'}</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', height: 300, background: isDarkMode ? '#374151' : '#f3f4f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, position: 'relative' }}>
              📷
              {product.images.length > 1 && <div style={{ position: 'absolute', bottom: 8, display: 'flex', gap: 4 }}>{product.images.map((_, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? accentColor : '#9ca3af' }} />)}</div>}
            </div>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ fontSize: 12, color: accentColor, fontWeight: 600, marginBottom: 4 }}>{CATEGORY_LABELS[product.category]}</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: textColor }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ color: '#f59e0b', fontSize: 16 }}>{renderStars(product.rating)}</span>
                <span style={{ fontSize: 14, color: textSecondary }}>{product.rating} ({product.reviewCount} reviews)</span>
                <span style={{ fontSize: 13, color: textSecondary }}>|</span>
                <span style={{ fontSize: 13, color: textSecondary }}>{product.salesCount.toLocaleString()} sold</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: textColor }}>{formatPrice(product.price)}</span>
                {product.originalPrice && (<>
                  <span style={{ fontSize: 18, color: '#ef4444', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>
                  <span style={{ fontSize: 14, color: '#22c55e', fontWeight: 600 }}>Save {discount}%</span>
                </>)}
              </div>
              <p style={{ fontSize: 14, color: textSecondary, lineHeight: 1.6, marginBottom: 16 }}>{product.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {product.tags.map((tag) => <span key={tag} style={{ padding: '4px 10px', borderRadius: 12, background: isDarkMode ? '#374151' : '#f3f4f6', color: textSecondary, fontSize: 12 }}>#{tag}</span>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                {product.stock > 10 ? <span style={{ color: '#22c55e', fontSize: 14 }}>✓ In Stock</span> : product.stock > 0 ? <span style={{ color: '#f59e0b', fontSize: 14 }}>⚠ Only {product.stock} left</span> : <span style={{ color: '#ef4444', fontSize: 14 }}>✗ Out of Stock</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {cartItem ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${borderColor}`, borderRadius: 8, padding: '4px' }}>
                    <button data-testid="decrease-qty" onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, background: isDarkMode ? '#374151' : '#f3f4f6', cursor: 'pointer', color: textColor, fontSize: 16 }}>-</button>
                    <span data-testid="cart-quantity" style={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: textColor }}>{cartItem.quantity}</span>
                    <button data-testid="increase-qty" onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, background: isDarkMode ? '#374151' : '#f3f4f6', cursor: 'pointer', color: textColor, fontSize: 16 }}>+</button>
                  </div>
                ) : (
                  <button data-testid="detail-add-to-cart" onClick={() => addToCart(product.id)} disabled={product.stock === 0} style={{ padding: '10px 24px', border: 'none', borderRadius: 8, background: product.stock === 0 ? '#9ca3af' : accentColor, color: 'white', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600 }}>Add to Cart</button>
                )}
              </div>
            </div>
          </div>
          {seller && (
            <div data-testid="product-seller-info" style={{ marginTop: 24, padding: '16px', border: `1px solid ${borderColor}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => { setSelectedProduct(null); setSelectedSeller(seller); setActiveView('sellers'); }}>
                <span style={{ fontSize: 32 }}>{seller.avatar}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, color: textColor }}>{seller.name}</span>
                    {seller.verified && <span style={{ color: '#3b82f6', fontSize: 14 }}>✓ Verified</span>}
                  </div>
                  <div style={{ fontSize: 13, color: textSecondary }}>{seller.rating} ★ | {seller.totalSales.toLocaleString()} sales</div>
                </div>
              </div>
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: textColor }}>Reviews ({productReviews.length})</h3>
              <button data-testid="write-review-btn" onClick={() => setShowReviewModal(true)} style={{ padding: '8px 16px', border: 'none', borderRadius: 6, background: accentColor, color: 'white', cursor: 'pointer', fontSize: 13 }}>Write a Review</button>
            </div>
            {productReviews.length === 0 ? (
              <p style={{ color: textSecondary, textAlign: 'center', padding: '16px' }}>No reviews yet. Be the first to review!</p>
            ) : productReviews.map((review) => (
              <div key={review.id} data-testid={`review-${review.id}`} style={{ padding: '16px', border: `1px solid ${borderColor}`, borderRadius: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600, color: textColor }}>{review.userName}</span>
                    <span style={{ color: '#f59e0b', marginLeft: 8 }}>{renderStars(review.rating)}</span>
                  </div>
                  <span style={{ fontSize: 12, color: textSecondary }}>{formatDate(review.date)}</span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, color: textColor }}>{review.title}</h4>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: textSecondary, lineHeight: 1.5 }}>{review.text}</p>
                <button data-testid={`helpful-${review.id}`} onClick={() => markReviewHelpful(review.id)} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, background: 'transparent', color: textSecondary, cursor: 'pointer', fontSize: 12 }}>👍 Helpful ({review.helpful})</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReviewModal = () => {
    if (!showReviewModal || !selectedProduct) return null;
    return (
      <div data-testid="review-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
        <div style={{ background: cardBg, borderRadius: 12, padding: '24px', width: 400, maxWidth: '90vw' }}>
          <h3 style={{ margin: '0 0 16px', color: textColor }}>Write a Review for {selectedProduct.name}</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: textSecondary }}>Rating</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} data-testid={`star-${star}`} onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))} style={{ fontSize: 24, border: 'none', background: 'transparent', cursor: 'pointer', color: star <= newReview.rating ? '#f59e0b' : '#d1d5db' }}>★</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: textSecondary }}>Title</label>
            <input type="text" value={newReview.title} onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))} placeholder="Review title" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: textSecondary }}>Review</label>
            <textarea value={newReview.text} onChange={(e) => setNewReview((prev) => ({ ...prev, text: e.target.value }))} placeholder="Share your experience..." rows={4} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowReviewModal(false); setNewReview({ rating: 5, title: '', text: '' }); }} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: textColor, cursor: 'pointer' }}>Cancel</button>
            <button data-testid="submit-review" onClick={submitReview} style={{ padding: '8px 16px', border: 'none', borderRadius: 6, background: accentColor, color: 'white', cursor: 'pointer' }}>Submit Review</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 20px', color: textColor }}>Shopping Cart ({cartItemCount} item{cartItemCount !== 1 ? 's' : ''})</h2>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <p>Your cart is empty</p>
          <button onClick={() => setActiveView('catalog')} style={{ marginTop: 12, padding: '8px 16px', border: 'none', borderRadius: 6, background: accentColor, color: 'white', cursor: 'pointer' }}>Browse Products</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;
              return (
                <div key={item.productId} data-testid={`cart-item-${item.productId}`} style={{ display: 'flex', gap: 16, padding: '16px', border: `1px solid ${borderColor}`, borderRadius: 8, marginBottom: 12, background: cardBg }}>
                  <div style={{ width: 80, height: 80, background: isDarkMode ? '#374151' : '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📷</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', color: textColor }}>{product.name}</h4>
                    <div style={{ fontSize: 13, color: textSecondary, marginBottom: 8 }}>{formatPrice(product.price)} each</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateCartQuantity(product.id, item.quantity - 1)} style={{ width: 28, height: 28, border: `1px solid ${borderColor}`, borderRadius: 4, background: 'transparent', cursor: 'pointer', color: textColor }}>-</button>
                      <span style={{ minWidth: 20, textAlign: 'center', color: textColor }}>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(product.id, item.quantity + 1)} style={{ width: 28, height: 28, border: `1px solid ${borderColor}`, borderRadius: 4, background: 'transparent', cursor: 'pointer', color: textColor }}>+</button>
                      <button data-testid={`remove-cart-${item.productId}`} onClick={() => removeFromCart(item.productId)} style={{ marginLeft: 'auto', padding: '4px 10px', border: 'none', borderRadius: 4, background: '#fee2e2', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: textColor, fontSize: 16, flexShrink: 0 }}>{formatPrice(product.price * item.quantity)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ flex: '0 0 300px' }}>
            <div data-testid="cart-summary" style={{ padding: '20px', border: `1px solid ${borderColor}`, borderRadius: 12, background: cardBg, position: 'sticky', top: 24 }}>
              <h3 style={{ margin: '0 0 16px', color: textColor }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: textSecondary, fontSize: 14 }}>
                <span>Subtotal ({cartItemCount} items)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: textSecondary, fontSize: 14 }}>
                <span>Shipping</span>
                <span>{cartTotal >= 50 ? 'Free' : '$9.99'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: textSecondary, fontSize: 14 }}>
                <span>Tax (est.)</span>
                <span>{formatPrice(cartTotal * 0.08)}</span>
              </div>
              <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, color: textColor }}>
                <span>Total</span>
                <span data-testid="cart-total">{formatPrice(cartTotal + (cartTotal >= 50 ? 0 : 9.99) + cartTotal * 0.08)}</span>
              </div>
              <button data-testid="checkout-btn" onClick={() => setShowCheckout(true)} style={{ width: '100%', marginTop: 16, padding: '12px', border: 'none', borderRadius: 8, background: accentColor, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>Proceed to Checkout</button>
              {cartTotal < 50 && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#22c55e', textAlign: 'center' }}>Add {formatPrice(50 - cartTotal)} more for free shipping!</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => {
    if (!showCheckout) return null;
    return (
      <div data-testid="checkout-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
        <div style={{ background: cardBg, borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, color: textColor }}>Checkout</h2>
            <button onClick={() => setShowCheckout(false)} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: textColor }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[1, 2, 3].map((step) => (
              <div key={step} style={{ flex: 1, height: 4, borderRadius: 2, background: step <= checkoutStep ? accentColor : (isDarkMode ? '#374151' : '#e5e7eb') }} />
            ))}
          </div>
          <div style={{ marginBottom: 8, fontSize: 14, color: textSecondary }}>Step {checkoutStep} of 3: {checkoutStep === 1 ? 'Shipping' : checkoutStep === 2 ? 'Payment' : 'Review'}</div>
          {checkoutStep === 1 && (
            <div data-testid="shipping-form">
              {['name', 'address', 'city', 'state', 'zip', 'phone'].map((field) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: textSecondary, textTransform: 'capitalize' }}>{field}</label>
                  <input type="text" value={shippingInfo[field]} onChange={(e) => setShippingInfo((prev) => ({ ...prev, [field]: e.target.value }))} placeholder={`Enter ${field}`} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 14, boxSizing: 'border-box' }} data-testid={`shipping-${field}`} />
                </div>
              ))}
              <button data-testid="continue-to-payment" onClick={() => setCheckoutStep(2)} style={{ width: '100%', padding: '10px', border: 'none', borderRadius: 8, background: accentColor, color: 'white', cursor: 'pointer', fontWeight: 600, marginTop: 8 }}>Continue to Payment</button>
            </div>
          )}
          {checkoutStep === 2 && (
            <div data-testid="payment-form">
              {[{ field: 'nameOnCard', label: 'Name on Card' }, { field: 'cardNumber', label: 'Card Number' }, { field: 'expiry', label: 'Expiry Date' }, { field: 'cvv', label: 'CVV' }].map(({ field, label }) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, color: textSecondary }}>{label}</label>
                  <input type="text" value={paymentInfo[field]} onChange={(e) => setPaymentInfo((prev) => ({ ...prev, [field]: e.target.value }))} placeholder={label} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bgColor, color: textColor, fontSize: 14, boxSizing: 'border-box' }} data-testid={`payment-${field}`} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: 8, background: 'transparent', color: textColor, cursor: 'pointer' }}>Back</button>
                <button data-testid="continue-to-review" onClick={() => setCheckoutStep(3)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: accentColor, color: 'white', cursor: 'pointer', fontWeight: 600 }}>Review Order</button>
              </div>
            </div>
          )}
          {checkoutStep === 3 && (
            <div data-testid="order-review">
              <h3 style={{ margin: '0 0 12px', color: textColor }}>Order Review</h3>
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                return product ? (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, color: textColor, fontSize: 14 }}>
                    <span>{product.name} × {item.quantity}</span>
                    <span>{formatPrice(product.price * item.quantity)}</span>
                  </div>
                ) : null;
              })}
              <div style={{ fontWeight: 700, fontSize: 16, color: textColor, textAlign: 'right', marginTop: 12 }}>Total: {formatPrice(cartTotal + (cartTotal >= 50 ? 0 : 9.99) + cartTotal * 0.08)}</div>
              <div style={{ marginTop: 16, padding: '12px', background: isDarkMode ? '#1e3a5f' : '#eff6ff', borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: textSecondary }}>Shipping to: {shippingInfo.name}, {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => setCheckoutStep(2)} style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: 8, background: 'transparent', color: textColor, cursor: 'pointer' }}>Back</button>
                <button data-testid="place-order-btn" onClick={placeOrder} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#22c55e', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Place Order</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWishlist = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 20px', color: textColor }}>Wishlist ({wishlist.length} item{wishlist.length !== 1 ? 's' : ''})</h2>
      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❤️</div>
          <p>Your wishlist is empty</p>
          <button onClick={() => setActiveView('catalog')} style={{ marginTop: 12, padding: '8px 16px', border: 'none', borderRadius: 6, background: accentColor, color: 'white', cursor: 'pointer' }}>Browse Products</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {wishlist.map((productId) => {
            const product = products.find((p) => p.id === productId);
            if (!product) return null;
            return (
              <div key={product.id} data-testid={`wishlist-item-${product.id}`} style={{ border: `1px solid ${borderColor}`, borderRadius: 12, background: cardBg, overflow: 'hidden' }}>
                <div style={{ height: 140, background: isDarkMode ? '#374151' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, cursor: 'pointer' }} onClick={() => setSelectedProduct(product)}>📷</div>
                <div style={{ padding: '12px' }}>
                  <h4 style={{ margin: '0 0 4px', color: textColor, cursor: 'pointer' }} onClick={() => setSelectedProduct(product)}>{product.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{formatPrice(product.price)}</span>
                    <span style={{ color: '#f59e0b', fontSize: 12 }}>{renderStars(product.rating)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => addToCart(product.id)} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: 6, background: accentColor, color: 'white', cursor: 'pointer', fontSize: 12 }}>Add to Cart</button>
                    <button data-testid={`remove-wishlist-${product.id}`} onClick={() => toggleWishlist(product.id)} style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 20px', color: textColor }}>Order History ({orders.length} order{orders.length !== 1 ? 's' : ''})</h2>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p>No orders yet</p>
          <button onClick={() => setActiveView('catalog')} style={{ marginTop: 12, padding: '8px 16px', border: 'none', borderRadius: 6, background: accentColor, color: 'white', cursor: 'pointer' }}>Start Shopping</button>
        </div>
      ) : orders.map((order) => (
        <div key={order.id} data-testid={`order-${order.id}`} style={{ border: `1px solid ${borderColor}`, borderRadius: 12, background: cardBg, padding: '20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 600, color: textColor }}>{order.id}</div>
              <div style={{ fontSize: 13, color: textSecondary }}>{formatDate(order.date)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: order.status === 'processing' ? '#fef3c7' : order.status === 'shipped' ? '#dbeafe' : '#d1fae5', color: order.status === 'processing' ? '#92400e' : order.status === 'shipped' ? '#1e40af' : '#065f46' }}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span style={{ fontWeight: 700, color: textColor }}>{formatPrice(order.total)}</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: textSecondary, marginBottom: 8 }}>
            Tracking: {order.trackingNumber}
          </div>
          {order.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: textColor, borderTop: idx > 0 ? `1px solid ${borderColor}` : 'none' }}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <button data-testid={`view-order-detail-${order.id}`} onClick={() => setSelectedOrder(order)} style={{ marginTop: 12, padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: accentColor, cursor: 'pointer', fontSize: 13 }}>View Details</button>
        </div>
      ))}
    </div>
  );

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;
    return (
      <div data-testid="order-detail-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
        <div style={{ background: cardBg, borderRadius: 16, maxWidth: 500, width: '100%', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: textColor }}>Order {selectedOrder.id}</h3>
            <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: textColor, fontSize: 18 }}>✕</button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: textSecondary }}>Status: {selectedOrder.status}</div>
            <div style={{ fontSize: 13, color: textSecondary }}>Date: {formatDate(selectedOrder.date)}</div>
            <div style={{ fontSize: 13, color: textSecondary }}>Tracking: {selectedOrder.trackingNumber}</div>
          </div>
          {selectedOrder.shipping && (
            <div style={{ padding: '12px', background: isDarkMode ? '#1e3a5f' : '#eff6ff', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 4 }}>Shipping Address</div>
              <div style={{ fontSize: 13, color: textSecondary }}>{selectedOrder.shipping.name}</div>
              <div style={{ fontSize: 13, color: textSecondary }}>{selectedOrder.shipping.address}</div>
              <div style={{ fontSize: 13, color: textSecondary }}>{selectedOrder.shipping.city}, {selectedOrder.shipping.state} {selectedOrder.shipping.zip}</div>
            </div>
          )}
          {selectedOrder.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: textColor, borderBottom: `1px solid ${borderColor}` }}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div style={{ fontWeight: 700, fontSize: 16, color: textColor, textAlign: 'right', marginTop: 12 }}>Total: {formatPrice(selectedOrder.total)}</div>
        </div>
      </div>
    );
  };

  const renderSellers = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 20px', color: textColor }}>Marketplace Sellers</h2>
      {selectedSeller ? (
        <div data-testid="seller-detail">
          <button onClick={() => setSelectedSeller(null)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: 6, background: 'transparent', color: textColor, cursor: 'pointer', marginBottom: 16 }}>← All Sellers</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <span style={{ fontSize: 48 }}>{selectedSeller.avatar}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ margin: 0, color: textColor }}>{selectedSeller.name}</h2>
                {selectedSeller.verified && <span style={{ color: '#3b82f6', fontWeight: 600 }}>✓ Verified Seller</span>}
              </div>
              <div style={{ fontSize: 14, color: textSecondary, marginTop: 4 }}>{selectedSeller.description}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 14, color: textSecondary }}>
                <span>⭐ {selectedSeller.rating}</span>
                <span>🛍️ {selectedSeller.totalSales.toLocaleString()} sales</span>
                <span>📍 {selectedSeller.location}</span>
                <span>📅 Joined {formatDate(new Date(selectedSeller.joinedDate).getTime())}</span>
              </div>
            </div>
          </div>
          <h3 style={{ color: textColor, marginBottom: 16 }}>Products by {selectedSeller.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {products.filter((p) => p.sellerId === selectedSeller.id).map(renderProductCard)}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {SELLERS.map((seller) => (
            <div key={seller.id} data-testid={`seller-card-${seller.id}`} style={{ border: `1px solid ${borderColor}`, borderRadius: 12, background: cardBg, padding: '20px', cursor: 'pointer' }} onClick={() => setSelectedSeller(seller)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 36 }}>{seller.avatar}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, color: textColor }}>{seller.name}</span>
                    {seller.verified && <span style={{ color: '#3b82f6', fontSize: 12 }}>✓ Verified</span>}
                  </div>
                  <div style={{ fontSize: 13, color: textSecondary }}>{seller.location}</div>
                </div>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: textSecondary, lineHeight: 1.4 }}>{seller.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: textSecondary }}>
                <span>⭐ {seller.rating}</span>
                <span>{seller.totalSales.toLocaleString()} sales</span>
                <span>{products.filter((p) => p.sellerId === seller.id).length} products</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {renderSidebar()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderHeader()}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeView === 'catalog' && renderCatalog()}
          {activeView === 'cart' && renderCart()}
          {activeView === 'wishlist' && renderWishlist()}
          {activeView === 'orders' && renderOrders()}
          {activeView === 'sellers' && renderSellers()}
        </div>
      </div>
      {selectedProduct && renderProductDetail()}
      {showReviewModal && renderReviewModal()}
      {showCheckout && renderCheckout()}
      {selectedOrder && renderOrderDetail()}
    </div>
  );
}
