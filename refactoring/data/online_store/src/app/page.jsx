import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = ['electronics', 'clothing', 'home', 'sports', 'books', 'toys'];
const CATEGORY_LABELS = {
  electronics: 'Electronics',
  clothing: 'Clothing & Apparel',
  home: 'Home & Garden',
  sports: 'Sports & Outdoors',
  books: 'Books & Media',
  toys: 'Toys & Games',
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest Arrivals' },
];

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Wireless Noise-Cancelling Headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and hi-res audio support. Comfortable memory foam ear cups.', price: 249.99, originalPrice: 349.99, category: 'electronics', image: '/headphones.jpg', rating: 4.7, reviewCount: 1243, inStock: true, featured: true, tags: ['wireless', 'bluetooth', 'noise-cancelling'], sku: 'ELEC-HP-001', brand: 'SoundMax', createdAt: Date.now() - 86400000 * 30 },
  { id: 'p2', name: 'Organic Cotton T-Shirt', description: 'Soft, breathable organic cotton t-shirt. Ethically sourced and sustainably produced. Available in multiple colors.', price: 34.99, originalPrice: null, category: 'clothing', image: '/tshirt.jpg', rating: 4.3, reviewCount: 567, inStock: true, featured: false, tags: ['organic', 'cotton', 'sustainable'], sku: 'CLO-TS-001', brand: 'EcoWear', createdAt: Date.now() - 86400000 * 15 },
  { id: 'p3', name: 'Smart Home Security Camera', description: '1080p HD security camera with night vision, two-way audio, motion detection alerts, and cloud storage. Works with Alexa and Google Home.', price: 79.99, originalPrice: 99.99, category: 'electronics', image: '/camera.jpg', rating: 4.5, reviewCount: 892, inStock: true, featured: true, tags: ['smart-home', 'security', 'wifi'], sku: 'ELEC-CAM-001', brand: 'SecureView', createdAt: Date.now() - 86400000 * 45 },
  { id: 'p4', name: 'Ceramic Plant Pot Set (3-Pack)', description: 'Modern minimalist ceramic planters with drainage holes and bamboo saucers. Perfect for succulents and small houseplants.', price: 42.99, originalPrice: null, category: 'home', image: '/pots.jpg', rating: 4.8, reviewCount: 334, inStock: true, featured: false, tags: ['planters', 'ceramic', 'minimalist'], sku: 'HOME-PT-001', brand: 'GreenLife', createdAt: Date.now() - 86400000 * 20 },
  { id: 'p5', name: 'Running Shoes - UltraFlex Pro', description: 'Lightweight running shoes with responsive cushioning, breathable mesh upper, and durable rubber outsole. Ideal for daily runs.', price: 129.99, originalPrice: 159.99, category: 'sports', image: '/shoes.jpg', rating: 4.6, reviewCount: 2105, inStock: true, featured: true, tags: ['running', 'athletic', 'lightweight'], sku: 'SPO-SH-001', brand: 'FleetFoot', createdAt: Date.now() - 86400000 * 10 },
  { id: 'p6', name: 'The Art of Programming', description: 'Comprehensive guide to software design patterns, algorithms, and best practices. Revised 4th edition with modern examples.', price: 49.99, originalPrice: null, category: 'books', image: '/book.jpg', rating: 4.9, reviewCount: 1567, inStock: true, featured: false, tags: ['programming', 'software', 'education'], sku: 'BOOK-PR-001', brand: 'TechPress', createdAt: Date.now() - 86400000 * 60 },
  { id: 'p7', name: 'Building Blocks Mega Set (500pc)', description: 'Creative building blocks set with 500 pieces in 12 colors. Compatible with major brands. Includes storage container and idea booklet.', price: 39.99, originalPrice: 54.99, category: 'toys', image: '/blocks.jpg', rating: 4.7, reviewCount: 789, inStock: true, featured: false, tags: ['educational', 'creative', 'building'], sku: 'TOY-BL-001', brand: 'BrickWorld', createdAt: Date.now() - 86400000 * 25 },
  { id: 'p8', name: 'Stainless Steel Water Bottle', description: 'Double-wall vacuum insulated water bottle. Keeps drinks cold 24 hours or hot 12 hours. BPA-free, leak-proof lid.', price: 28.99, originalPrice: null, category: 'sports', image: '/bottle.jpg', rating: 4.4, reviewCount: 1893, inStock: true, featured: false, tags: ['hydration', 'insulated', 'eco-friendly'], sku: 'SPO-BT-001', brand: 'HydroFlow', createdAt: Date.now() - 86400000 * 35 },
  { id: 'p9', name: '4K Ultra HD Monitor 27"', description: 'Professional-grade 4K monitor with IPS panel, 99% sRGB color accuracy, USB-C connectivity, and adjustable stand.', price: 399.99, originalPrice: 499.99, category: 'electronics', image: '/monitor.jpg', rating: 4.6, reviewCount: 456, inStock: false, featured: true, tags: ['4k', 'monitor', 'usb-c'], sku: 'ELEC-MN-001', brand: 'PixelClear', createdAt: Date.now() - 86400000 * 5 },
  { id: 'p10', name: 'Weighted Blanket 15lbs', description: 'Premium glass bead weighted blanket with removable, machine-washable duvet cover. Promotes restful sleep.', price: 69.99, originalPrice: 89.99, category: 'home', image: '/blanket.jpg', rating: 4.5, reviewCount: 1102, inStock: true, featured: false, tags: ['sleep', 'wellness', 'comfort'], sku: 'HOME-BL-001', brand: 'DreamWeave', createdAt: Date.now() - 86400000 * 40 },
  { id: 'p11', name: 'Yoga Mat Premium 6mm', description: 'Non-slip yoga mat with alignment lines, carrying strap, and moisture-wicking surface. Eco-friendly TPE material.', price: 44.99, originalPrice: null, category: 'sports', image: '/yogamat.jpg', rating: 4.3, reviewCount: 678, inStock: true, featured: false, tags: ['yoga', 'fitness', 'eco-friendly'], sku: 'SPO-YM-001', brand: 'ZenFit', createdAt: Date.now() - 86400000 * 18 },
  { id: 'p12', name: 'Denim Jacket - Classic Fit', description: 'Timeless denim jacket in medium wash. Features button front, chest pockets, and adjustable waist tabs. Pre-washed for softness.', price: 89.99, originalPrice: 119.99, category: 'clothing', image: '/jacket.jpg', rating: 4.4, reviewCount: 234, inStock: true, featured: false, tags: ['denim', 'outerwear', 'classic'], sku: 'CLO-JK-001', brand: 'DenimCo', createdAt: Date.now() - 86400000 * 8 },
];

const INITIAL_REVIEWS = [
  { id: 'r1', productId: 'p1', userId: 'u1', userName: 'Alex K.', rating: 5, title: 'Best headphones ever!', comment: 'Amazing sound quality and the noise cancellation is incredible. Battery lasts forever.', helpful: 42, createdAt: Date.now() - 86400000 * 7 },
  { id: 'r2', productId: 'p1', userId: 'u2', userName: 'Maria S.', rating: 4, title: 'Great but heavy', comment: 'Sound is excellent but they get a bit heavy after 2+ hours. Still highly recommend.', helpful: 18, createdAt: Date.now() - 86400000 * 14 },
  { id: 'r3', productId: 'p5', userId: 'u3', userName: 'James L.', rating: 5, title: 'Perfect running shoes', comment: 'Super comfortable and great support. Ran my first marathon in these!', helpful: 31, createdAt: Date.now() - 86400000 * 5 },
  { id: 'r4', productId: 'p6', userId: 'u4', userName: 'Sarah T.', rating: 5, title: 'Must-read for developers', comment: 'Comprehensive and well-written. The examples are practical and modern.', helpful: 56, createdAt: Date.now() - 86400000 * 20 },
  { id: 'r5', productId: 'p3', userId: 'u5', userName: 'David M.', rating: 4, title: 'Solid security camera', comment: 'Easy setup, good picture quality. App could use some improvement though.', helpful: 12, createdAt: Date.now() - 86400000 * 10 },
  { id: 'r6', productId: 'p4', userId: 'u6', userName: 'Emma W.', rating: 5, title: 'Beautiful pots', comment: 'These look amazing with my succulents. The bamboo saucers are a nice touch.', helpful: 8, createdAt: Date.now() - 86400000 * 3 },
];

const MOCK_ADDRESSES = [
  { id: 'addr1', label: 'Home', name: 'John Doe', street: '123 Main Street', city: 'San Francisco', state: 'CA', zip: '94102', country: 'US', isDefault: true },
  { id: 'addr2', label: 'Work', name: 'John Doe', street: '456 Market Street, Suite 200', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US', isDefault: false },
];

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 14.99, days: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 29.99, days: '1 business day' },
];

const TAX_RATE = 0.0875;

export default function OnlineStore() {
  const [products] = useState(MOCK_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [activeView, setActiveView] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showQuickView, setShowQuickView] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState('all');
  const [filterInStock, setFilterInStock] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedAddress, setSelectedAddress] = useState('addr1');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', name: '', street: '', city: '', state: '', zip: '', country: 'US' });
  const [showOrderDetail, setShowOrderDetail] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [notification, setNotification] = useState(null);
  const searchRef = useRef(null);
  const notificationTimerRef = useRef(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('storeCart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { /* ignore */ }
    }
    const savedWishlist = localStorage.getItem('storeWishlist');
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { /* ignore */ }
    }
    const savedOrders = localStorage.getItem('storeOrders');
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('storeCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('storeWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('storeOrders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showNotification = useCallback((message, type = 'success') => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setNotification({ message, type });
    notificationTimerRef.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));
    }
    if (filterCategory !== 'all') {
      result = result.filter(p => p.category === filterCategory);
    }
    if (filterPriceRange !== 'all') {
      const ranges = { under25: [0, 25], '25to50': [25, 50], '50to100': [50, 100], '100to200': [100, 200], over200: [200, Infinity] };
      const [min, max] = ranges[filterPriceRange] || [0, Infinity];
      result = result.filter(p => p.price >= min && p.price < max);
    }
    if (filterInStock) {
      result = result.filter(p => p.inStock);
    }
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => b.createdAt - a.createdAt); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }
    return result;
  }, [products, searchQuery, filterCategory, filterPriceRange, filterInStock, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const taxAmount = cartTotal * TAX_RATE;
  const shippingCost = SHIPPING_OPTIONS.find(s => s.id === selectedShipping)?.price || 0;
  const promoDiscount = appliedPromo ? (appliedPromo.type === 'percent' ? cartTotal * appliedPromo.value / 100 : appliedPromo.value) : 0;
  const orderTotal = cartTotal + taxAmount + shippingCost - promoDiscount;

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product.inStock) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, image: product.image, quantity }];
    });
    showNotification(`${product.name} added to cart`);
  }, [showNotification]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showNotification('Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      }
      showNotification('Added to wishlist');
      return [...prev, productId];
    });
  }, [showNotification]);

  const moveWishlistToCart = useCallback((productId) => {
    const product = products.find(p => p.id === productId);
    if (product && product.inStock) {
      addToCart(product);
      setWishlist(prev => prev.filter(id => id !== productId));
    }
  }, [products, addToCart]);

  const toggleCompare = useCallback((productId) => {
    setCompareList(prev => {
      if (prev.includes(productId)) return prev.filter(id => id !== productId);
      if (prev.length >= 4) {
        showNotification('Maximum 4 items can be compared', 'warning');
        return prev;
      }
      return [...prev, productId];
    });
  }, [showNotification]);

  const applyPromoCode = useCallback(() => {
    const codes = {
      'SAVE10': { type: 'percent', value: 10, label: '10% off' },
      'FLAT20': { type: 'flat', value: 20, label: '$20 off' },
      'WELCOME': { type: 'percent', value: 15, label: '15% off (Welcome)' },
    };
    const promo = codes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo(promo);
      showNotification(`Promo code applied: ${promo.label}`);
    } else {
      showNotification('Invalid promo code', 'error');
    }
  }, [promoCode, showNotification]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setPromoCode('');
  }, []);

  const handleViewProduct = useCallback((product) => {
    setSelectedProduct(product);
    setActiveView('product');
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== product.id);
      return [product.id, ...filtered].slice(0, 5);
    });
  }, []);

  const placeOrder = useCallback(() => {
    const order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      subtotal: cartTotal,
      tax: taxAmount,
      shipping: shippingCost,
      discount: promoDiscount,
      total: orderTotal,
      shippingOption: SHIPPING_OPTIONS.find(s => s.id === selectedShipping),
      address: addresses.find(a => a.id === selectedAddress),
      paymentMethod,
      status: 'confirmed',
      createdAt: Date.now(),
      estimatedDelivery: Date.now() + (selectedShipping === 'overnight' ? 86400000 : selectedShipping === 'express' ? 86400000 * 3 : 86400000 * 7),
    };
    setOrders(prev => [order, ...prev]);
    clearCart();
    setAppliedPromo(null);
    setPromoCode('');
    setShowCheckout(false);
    setCheckoutStep(1);
    setActiveView('orders');
    showNotification('Order placed successfully!');
  }, [cart, cartTotal, taxAmount, shippingCost, promoDiscount, orderTotal, selectedShipping, selectedAddress, addresses, paymentMethod, clearCart, showNotification]);

  const submitReview = useCallback((productId) => {
    if (!newReview.title.trim() || !newReview.comment.trim()) return;
    const review = {
      id: `r${Date.now()}`,
      productId,
      userId: 'current',
      userName: 'You',
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      helpful: 0,
      createdAt: Date.now(),
    };
    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 5, title: '', comment: '' });
    setShowReviewModal(null);
    showNotification('Review submitted successfully!');
  }, [newReview, showNotification]);

  const markReviewHelpful = useCallback((reviewId) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
  }, []);

  const addAddress = useCallback(() => {
    if (!newAddress.name.trim() || !newAddress.street.trim() || !newAddress.city.trim()) return;
    const addr = { ...newAddress, id: `addr${Date.now()}`, isDefault: addresses.length === 0 };
    setAddresses(prev => [...prev, addr]);
    setNewAddress({ label: '', name: '', street: '', city: '', state: '', zip: '', country: 'US' });
    setShowAddressModal(false);
    showNotification('Address added successfully!');
  }, [newAddress, addresses, showNotification]);

  const removeAddress = useCallback((addrId) => {
    if (window.confirm('Remove this address?')) {
      setAddresses(prev => prev.filter(a => a.id !== addrId));
    }
  }, []);

  const setDefaultAddress = useCallback((addrId) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addrId })));
  }, []);

  const getProductReviews = useCallback((productId) => reviews.filter(r => r.productId === productId), [reviews]);

  const getAverageRating = useCallback((productId) => {
    const productReviews = getProductReviews(productId);
    if (productReviews.length === 0) return 0;
    return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  }, [getProductReviews]);

  const renderStars = (rating, size = 'sm') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db', fontSize: size === 'lg' ? '24px' : '14px', cursor: 'default' }}>{i <= Math.round(rating) ? '\u2605' : '\u2606'}</span>);
    }
    return <span data-testid="star-rating">{stars}</span>;
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const renderNotification = () => {
    if (!notification) return null;
    const colors = { success: '#16a34a', error: '#dc2626', warning: '#f59e0b', info: '#2563eb' };
    return (
      <div data-testid="notification" style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, background: colors[notification.type] || colors.success, color: 'white', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideIn 0.3s ease' }}>
        {notification.message}
        <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }} aria-label="Dismiss notification">&times;</button>
      </div>
    );
  };

  const renderProductCard = (product) => {
    const isInWishlist = wishlist.includes(product.id);
    const isInCompare = compareList.includes(product.id);
    const isInCart = cart.some(item => item.productId === product.id);
    if (viewMode === 'list') {
      return (
        <div key={product.id} data-testid={`product-card-${product.id}`} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '12px' }}>
          <div style={{ width: '200px', height: '150px', background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', cursor: 'pointer' }} onClick={() => handleViewProduct(product)}>
            <span style={{ fontSize: '48px' }}>📦</span>
            {product.originalPrice && <span style={{ position: 'absolute', top: 8, left: 8, background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>SALE</span>}
            {!product.inStock && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>Out of Stock</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: 0, cursor: 'pointer', color: '#1f2937' }} onClick={() => handleViewProduct(product)}>{product.name}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0' }}>{product.brand} | SKU: {product.sku}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => toggleWishlist(product.id)} data-testid={`wishlist-btn-${product.id}`} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: isInWishlist ? '#dc2626' : '#6b7280' }} aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>{isInWishlist ? '\u2764' : '\u2661'}</button>
                <button onClick={() => toggleCompare(product.id)} data-testid={`compare-btn-${product.id}`} style={{ background: isInCompare ? '#2563eb' : 'none', color: isInCompare ? 'white' : '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }} aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}>Compare</button>
              </div>
            </div>
            <p style={{ color: '#4b5563', fontSize: '14px', margin: '8px 0', lineHeight: '1.4' }}>{product.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
              {renderStars(product.rating)}
              <span style={{ color: '#6b7280', fontSize: '13px' }}>({product.reviewCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{formatCurrency(product.price)}</span>
                {product.originalPrice && <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>{formatCurrency(product.originalPrice)}</span>}
                {product.originalPrice && <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>Save {Math.round((1 - product.price / product.originalPrice) * 100)}%</span>}
              </div>
              <button onClick={() => addToCart(product)} disabled={!product.inStock} data-testid={`add-to-cart-${product.id}`} style={{ padding: '8px 20px', background: product.inStock ? (isInCart ? '#16a34a' : '#2563eb') : '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: product.inStock ? 'pointer' : 'not-allowed', fontWeight: 600 }}>{isInCart ? 'In Cart \u2713' : 'Add to Cart'}</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div key={product.id} data-testid={`product-card-${product.id}`} style={{ background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.2s', position: 'relative' }}>
        <div style={{ height: '200px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }} onClick={() => handleViewProduct(product)}>
          <span style={{ fontSize: '64px' }}>📦</span>
          {product.originalPrice && <span style={{ position: 'absolute', top: 8, left: 8, background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>SALE</span>}
          {product.featured && <span style={{ position: 'absolute', top: 8, right: 8, background: '#7c3aed', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Featured</span>}
          {!product.inStock && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '18px' }}>Out of Stock</div>}
          <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: '6px' }}>
            <button onClick={(e) => { e.stopPropagation(); setShowQuickView(product); }} data-testid={`quick-view-${product.id}`} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Quick view">👁</button>
            <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} data-testid={`wishlist-btn-${product.id}`} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isInWishlist ? '#dc2626' : '#6b7280' }} aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>{isInWishlist ? '\u2764' : '\u2661'}</button>
          </div>
        </div>
        <div style={{ padding: '14px' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{CATEGORY_LABELS[product.category]}</p>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', cursor: 'pointer', color: '#1f2937', lineHeight: '1.3' }} onClick={() => handleViewProduct(product)}>{product.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            {renderStars(product.rating)}
            <span style={{ color: '#6b7280', fontSize: '12px' }}>({product.reviewCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>{formatCurrency(product.price)}</span>
            {product.originalPrice && <span style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through' }}>{formatCurrency(product.originalPrice)}</span>}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => addToCart(product)} disabled={!product.inStock} data-testid={`add-to-cart-${product.id}`} style={{ flex: 1, padding: '8px', background: product.inStock ? (isInCart ? '#16a34a' : '#2563eb') : '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: product.inStock ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '13px' }}>{isInCart ? '\u2713 In Cart' : 'Add to Cart'}</button>
            <button onClick={() => toggleCompare(product.id)} data-testid={`compare-btn-${product.id}`} style={{ padding: '8px 12px', background: isInCompare ? '#2563eb' : 'white', color: isInCompare ? 'white' : '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}>&#x2194;</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCatalog = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }} aria-label="Filter by category" style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white' }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
          <select value={filterPriceRange} onChange={e => { setFilterPriceRange(e.target.value); setCurrentPage(1); }} aria-label="Filter by price" style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white' }}>
            <option value="all">All Prices</option>
            <option value="under25">Under $25</option>
            <option value="25to50">$25 - $50</option>
            <option value="50to100">$50 - $100</option>
            <option value="100to200">$100 - $200</option>
            <option value="over200">Over $200</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#4b5563', cursor: 'pointer' }}>
            <input type="checkbox" checked={filterInStock} onChange={e => { setFilterInStock(e.target.checked); setCurrentPage(1); }} data-testid="in-stock-filter" />
            In Stock Only
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{filteredProducts.length} products</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort by" style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white' }}>
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden' }}>
            <button onClick={() => setViewMode('grid')} data-testid="grid-view-btn" style={{ padding: '6px 12px', background: viewMode === 'grid' ? '#2563eb' : 'white', color: viewMode === 'grid' ? 'white' : '#6b7280', border: 'none', cursor: 'pointer' }} aria-label="Grid view">&#9638;</button>
            <button onClick={() => setViewMode('list')} data-testid="list-view-btn" style={{ padding: '6px 12px', background: viewMode === 'list' ? '#2563eb' : 'white', color: viewMode === 'list' ? 'white' : '#6b7280', border: 'none', cursor: 'pointer' }} aria-label="List view">&#9776;</button>
          </div>
        </div>
      </div>
      {compareList.length > 0 && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#1e40af' }}>{compareList.length} item(s) selected for comparison</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowCompare(true)} data-testid="compare-now-btn" style={{ padding: '6px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Compare Now</button>
            <button onClick={() => setCompareList([])} style={{ padding: '6px 16px', background: 'white', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Clear</button>
          </div>
        </div>
      )}
      <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' } : {}}>
        {paginatedProducts.map(product => renderProductCard(product))}
      </div>
      {paginatedProducts.length === 0 && <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}><p style={{ fontSize: '18px' }}>No products found</p><p>Try adjusting your filters or search query.</p></div>}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }} data-testid="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#9ca3af' : '#1f2937' }}>Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: currentPage === page ? '#2563eb' : 'white', color: currentPage === page ? 'white' : '#1f2937', cursor: 'pointer', fontWeight: currentPage === page ? 600 : 400 }}>{page}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#9ca3af' : '#1f2937' }}>Next</button>
        </div>
      )}
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const productReviews = getProductReviews(selectedProduct.id);
    const avgRating = getAverageRating(selectedProduct.id);
    const relatedProducts = products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 4);
    const recentProducts = recentlyViewed.filter(id => id !== selectedProduct.id).map(id => products.find(p => p.id === id)).filter(Boolean).slice(0, 4);
    return (
      <div>
        <button onClick={() => { setSelectedProduct(null); setActiveView('catalog'); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0', marginBottom: '16px', fontSize: '14px' }} data-testid="back-to-catalog">&larr; Back to Catalog</button>
        <div style={{ display: 'flex', gap: '32px', background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
          <div style={{ width: '400px', height: '400px', background: '#f3f4f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
            <span style={{ fontSize: '96px' }}>📦</span>
            {selectedProduct.originalPrice && <span style={{ position: 'absolute', top: 12, left: 12, background: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 600 }}>SALE</span>}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px', textTransform: 'uppercase' }}>{CATEGORY_LABELS[selectedProduct.category]} | {selectedProduct.brand}</p>
            <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: '#1f2937' }}>{selectedProduct.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {renderStars(avgRating || selectedProduct.rating, 'lg')}
              <span style={{ color: '#6b7280', fontSize: '15px' }}>({productReviews.length > 0 ? productReviews.length : selectedProduct.reviewCount} reviews)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px', fontWeight: 700, color: '#1f2937' }}>{formatCurrency(selectedProduct.price)}</span>
              {selectedProduct.originalPrice && <span style={{ fontSize: '18px', color: '#9ca3af', textDecoration: 'line-through' }}>{formatCurrency(selectedProduct.originalPrice)}</span>}
              {selectedProduct.originalPrice && <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: 600 }}>Save {formatCurrency(selectedProduct.originalPrice - selectedProduct.price)}</span>}
            </div>
            <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '16px' }}>{selectedProduct.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {selectedProduct.tags.map(tag => <span key={tag} style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>#{tag}</span>)}
            </div>
            <p style={{ fontSize: '14px', color: selectedProduct.inStock ? '#16a34a' : '#dc2626', fontWeight: 600, marginBottom: '16px' }}>{selectedProduct.inStock ? '\u2713 In Stock' : '\u2717 Out of Stock'}</p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>SKU: {selectedProduct.sku}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => addToCart(selectedProduct)} disabled={!selectedProduct.inStock} data-testid="detail-add-to-cart" style={{ padding: '12px 32px', background: selectedProduct.inStock ? '#2563eb' : '#9ca3af', color: 'white', border: 'none', borderRadius: '8px', cursor: selectedProduct.inStock ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '16px' }}>Add to Cart</button>
              <button onClick={() => toggleWishlist(selectedProduct.id)} data-testid="detail-wishlist-btn" style={{ padding: '12px 20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', color: wishlist.includes(selectedProduct.id) ? '#dc2626' : '#6b7280' }}>{wishlist.includes(selectedProduct.id) ? '\u2764 Wishlisted' : '\u2661 Wishlist'}</button>
              <button onClick={() => toggleCompare(selectedProduct.id)} data-testid="detail-compare-btn" style={{ padding: '12px 20px', background: compareList.includes(selectedProduct.id) ? '#2563eb' : 'white', color: compareList.includes(selectedProduct.id) ? 'white' : '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Compare</button>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#1f2937' }}>Customer Reviews</h2>
            <button onClick={() => setShowReviewModal(selectedProduct.id)} data-testid="write-review-btn" style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Write a Review</button>
          </div>
          {productReviews.length === 0 ? <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>No reviews yet. Be the first to review this product!</p> : productReviews.map(review => (
            <div key={review.id} data-testid={`review-${review.id}`} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{review.userName}</span>
                  <span style={{ color: '#9ca3af', fontSize: '13px', marginLeft: '12px' }}>{formatDate(review.createdAt)}</span>
                </div>
                {renderStars(review.rating)}
              </div>
              <h4 style={{ margin: '0 0 6px', color: '#1f2937' }}>{review.title}</h4>
              <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5', margin: '0 0 10px' }}>{review.comment}</p>
              <button onClick={() => markReviewHelpful(review.id)} data-testid={`helpful-btn-${review.id}`} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', color: '#6b7280', fontSize: '12px' }}>Helpful ({review.helpful})</button>
            </div>
          ))}
        </div>
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '22px', color: '#1f2937', marginBottom: '16px' }}>Related Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {relatedProducts.map(p => (
                <div key={p.id} data-testid={`related-${p.id}`} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '12px', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleViewProduct(p)}>
                  <span style={{ fontSize: '40px' }}>📦</span>
                  <p style={{ fontSize: '13px', fontWeight: 600, margin: '8px 0 4px', color: '#1f2937' }}>{p.name}</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb', margin: 0 }}>{formatCurrency(p.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {recentProducts.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '22px', color: '#1f2937', marginBottom: '16px' }}>Recently Viewed</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {recentProducts.map(p => (
                <div key={p.id} data-testid={`recent-${p.id}`} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '12px', cursor: 'pointer', textAlign: 'center' }} onClick={() => handleViewProduct(p)}>
                  <span style={{ fontSize: '40px' }}>📦</span>
                  <p style={{ fontSize: '13px', fontWeight: 600, margin: '8px 0 4px', color: '#1f2937' }}>{p.name}</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb', margin: 0 }}>{formatCurrency(p.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCartSidebar = () => (
    <div data-testid="cart-sidebar" style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', background: 'white', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', zIndex: 900, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Shopping Cart ({cartItemCount})</h2>
        <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }} aria-label="Close cart">&times;</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {cart.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}><p style={{ fontSize: '48px' }}>🛒</p><p>Your cart is empty</p><button onClick={() => { setShowCart(false); setActiveView('catalog'); }} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Start Shopping</button></div> : cart.map(item => (
          <div key={item.productId} data-testid={`cart-item-${item.productId}`} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px' }}>
            <div style={{ width: '70px', height: '70px', background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: '28px' }}>📦</span></div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#1f2937' }}>{item.name}</h4>
              <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#2563eb' }}>{formatCurrency(item.price)}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} data-testid={`decrease-qty-${item.productId}`} style={{ width: '28px', height: '28px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                <span data-testid={`qty-${item.productId}`} style={{ fontSize: '14px', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} data-testid={`increase-qty-${item.productId}`} style={{ width: '28px', height: '28px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                <button onClick={() => removeFromCart(item.productId)} data-testid={`remove-item-${item.productId}`} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '13px' }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: '#6b7280' }}>Subtotal</span><span style={{ fontWeight: 600 }}>{formatCurrency(cartTotal)}</span></div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Promo code" data-testid="promo-input" style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <button onClick={applyPromoCode} data-testid="apply-promo-btn" style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Apply</button>
          </div>
          {appliedPromo && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#16a34a' }}><span>Discount ({appliedPromo.label})</span><span>-{formatCurrency(promoDiscount)}</span><button onClick={removePromoCode} data-testid="remove-promo-btn" style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '12px' }}>&times;</button></div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={clearCart} data-testid="clear-cart-btn" style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Clear Cart</button>
            <button onClick={() => { setShowCart(false); setShowCheckout(true); setCheckoutStep(1); }} data-testid="checkout-btn" style={{ flex: 2, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Checkout</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div data-testid="checkout-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '700px', maxHeight: '85vh', overflow: 'auto', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Checkout</h2>
          <button onClick={() => setShowCheckout(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }} aria-label="Close checkout">&times;</button>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {['Shipping', 'Payment', 'Review'].map((step, idx) => (
            <div key={step} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: checkoutStep > idx + 1 ? '#16a34a' : checkoutStep === idx + 1 ? '#2563eb' : '#e5e7eb', color: checkoutStep >= idx + 1 ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontWeight: 600 }}>{checkoutStep > idx + 1 ? '\u2713' : idx + 1}</div>
              <span style={{ fontSize: '13px', color: checkoutStep >= idx + 1 ? '#1f2937' : '#9ca3af' }}>{step}</span>
            </div>
          ))}
        </div>
        {checkoutStep === 1 && (
          <div>
            <h3 style={{ margin: '0 0 16px' }}>Shipping Address</h3>
            {addresses.map(addr => (
              <label key={addr.id} data-testid={`address-option-${addr.id}`} style={{ display: 'flex', gap: '12px', padding: '14px', border: `2px solid ${selectedAddress === addr.id ? '#2563eb' : '#e5e7eb'}`, borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', background: selectedAddress === addr.id ? '#eff6ff' : 'white' }}>
                <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} />
                <div>
                  <div style={{ fontWeight: 600 }}>{addr.label} {addr.isDefault && <span style={{ fontSize: '11px', background: '#dbeafe', color: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>Default</span>}</div>
                  <div style={{ fontSize: '14px', color: '#4b5563' }}>{addr.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{addr.street}, {addr.city}, {addr.state} {addr.zip}</div>
                </div>
              </label>
            ))}
            <button onClick={() => setShowAddressModal(true)} data-testid="add-address-btn" style={{ width: '100%', padding: '12px', border: '2px dashed #d1d5db', borderRadius: '8px', background: 'white', cursor: 'pointer', color: '#6b7280', marginBottom: '20px' }}>+ Add New Address</button>
            <h3 style={{ margin: '0 0 12px' }}>Shipping Method</h3>
            {SHIPPING_OPTIONS.map(option => (
              <label key={option.id} data-testid={`shipping-option-${option.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: `2px solid ${selectedShipping === option.id ? '#2563eb' : '#e5e7eb'}`, borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', background: selectedShipping === option.id ? '#eff6ff' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="radio" name="shipping" checked={selectedShipping === option.id} onChange={() => setSelectedShipping(option.id)} />
                  <div><div style={{ fontWeight: 600 }}>{option.name}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>{option.days}</div></div>
                </div>
                <span style={{ fontWeight: 600 }}>{formatCurrency(option.price)}</span>
              </label>
            ))}
            <button onClick={() => setCheckoutStep(2)} data-testid="continue-to-payment" style={{ width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px', marginTop: '12px' }}>Continue to Payment</button>
          </div>
        )}
        {checkoutStep === 2 && (
          <div>
            <h3 style={{ margin: '0 0 16px' }}>Payment Method</h3>
            {[{ id: 'card', label: 'Credit / Debit Card', icon: '💳' }, { id: 'paypal', label: 'PayPal', icon: '🅿️' }, { id: 'applepay', label: 'Apple Pay', icon: '🍎' }].map(method => (
              <label key={method.id} data-testid={`payment-method-${method.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', border: `2px solid ${paymentMethod === method.id ? '#2563eb' : '#e5e7eb'}`, borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', background: paymentMethod === method.id ? '#eff6ff' : 'white' }}>
                <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                <span style={{ fontSize: '24px' }}>{method.icon}</span>
                <span style={{ fontWeight: 600 }}>{method.label}</span>
              </label>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Back</button>
              <button onClick={() => setCheckoutStep(3)} data-testid="continue-to-review" style={{ flex: 2, padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px' }}>Review Order</button>
            </div>
          </div>
        )}
        {checkoutStep === 3 && (
          <div>
            <h3 style={{ margin: '0 0 16px' }}>Order Summary</h3>
            {cart.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div><span style={{ fontWeight: 600 }}>{item.name}</span><span style={{ color: '#6b7280', marginLeft: '8px' }}>x{item.quantity}</span></div>
                <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>Shipping</span><span>{formatCurrency(shippingCost)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>Tax</span><span>{formatCurrency(taxAmount)}</span></div>
              {appliedPromo && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#16a34a' }}><span>Discount</span><span>-{formatCurrency(promoDiscount)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #e5e7eb', fontSize: '20px', fontWeight: 700 }} data-testid="order-total"><span>Total</span><span>{formatCurrency(orderTotal)}</span></div>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '14px', margin: '16px 0' }}>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Shipping to: <strong>{addresses.find(a => a.id === selectedAddress)?.label}</strong></div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Method: <strong>{SHIPPING_OPTIONS.find(s => s.id === selectedShipping)?.name}</strong></div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Payment: <strong>{paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setCheckoutStep(2)} style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Back</button>
              <button onClick={placeOrder} data-testid="place-order-btn" style={{ flex: 2, padding: '14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px' }}>Place Order</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderWishlist = () => {
    const wishlistProducts = wishlist.map(id => products.find(p => p.id === id)).filter(Boolean);
    return (
      <div>
        <h2 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '16px' }}>My Wishlist ({wishlistProducts.length})</h2>
        {wishlistProducts.length === 0 ? <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}><p style={{ fontSize: '48px' }}>💝</p><p>Your wishlist is empty</p></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {wishlistProducts.map(product => (
              <div key={product.id} data-testid={`wishlist-item-${product.id}`} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', gap: '14px' }}>
                <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: '32px' }}>📦</span></div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#1f2937', cursor: 'pointer' }} onClick={() => handleViewProduct(product)}>{product.name}</h4>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#2563eb', margin: '0 0 8px' }}>{formatCurrency(product.price)}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => moveWishlistToCart(product.id)} disabled={!product.inStock} data-testid={`move-to-cart-${product.id}`} style={{ padding: '6px 12px', background: product.inStock ? '#2563eb' : '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: product.inStock ? 'pointer' : 'not-allowed', fontSize: '12px' }}>{product.inStock ? 'Move to Cart' : 'Out of Stock'}</button>
                    <button onClick={() => toggleWishlist(product.id)} data-testid={`remove-wishlist-${product.id}`} style={{ padding: '6px 12px', background: 'white', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => (
    <div>
      <h2 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '16px' }}>Order History</h2>
      {orders.length === 0 ? <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}><p style={{ fontSize: '48px' }}>📋</p><p>No orders yet</p></div> : orders.map(order => (
        <div key={order.id} data-testid={`order-${order.id}`} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '16px', color: '#1f2937' }}>{order.id}</span>
              <span style={{ marginLeft: '12px', fontSize: '13px', color: '#6b7280' }}>{formatDate(order.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: order.status === 'confirmed' ? '#dcfce7' : '#dbeafe', color: order.status === 'confirmed' ? '#16a34a' : '#2563eb' }}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              <button onClick={() => setShowOrderDetail(showOrderDetail === order.id ? null : order.id)} data-testid={`toggle-order-detail-${order.id}`} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', color: '#6b7280', fontSize: '13px' }}>{showOrderDetail === order.id ? 'Hide Details' : 'View Details'}</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
            <span>{order.items.length} item(s)</span>
            <span>Total: <strong style={{ color: '#1f2937' }}>{formatCurrency(order.total)}</strong></span>
            {order.estimatedDelivery && <span>Est. Delivery: {formatDate(order.estimatedDelivery)}</span>}
          </div>
          {showOrderDetail === order.id && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              {order.items.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280' }}>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280' }}>Shipping ({order.shippingOption?.name})</span><span>{formatCurrency(order.shipping)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#6b7280' }}>Tax</span><span>{formatCurrency(order.tax)}</span></div>
                {order.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#16a34a' }}><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}><span>Total</span><span>{formatCurrency(order.total)}</span></div>
              </div>
              {order.address && <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}><strong>Shipped to:</strong> {order.address.name}, {order.address.street}, {order.address.city}, {order.address.state} {order.address.zip}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCompareModal = () => {
    if (!showCompare) return null;
    const compareProducts = compareList.map(id => products.find(p => p.id === id)).filter(Boolean);
    return (
      <div data-testid="compare-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', width: '900px', maxHeight: '85vh', overflow: 'auto', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0 }}>Compare Products ({compareProducts.length})</h2>
            <button onClick={() => setShowCompare(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }} aria-label="Close compare">&times;</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '13px', width: '120px' }}>Attribute</th>
                {compareProducts.map(p => <th key={p.id} style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontSize: '14px' }}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '10px', color: '#6b7280', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>Price</td>{compareProducts.map(p => <td key={p.id} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>{formatCurrency(p.price)}</td>)}</tr>
              <tr><td style={{ padding: '10px', color: '#6b7280', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>Rating</td>{compareProducts.map(p => <td key={p.id} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{renderStars(p.rating)} ({p.rating})</td>)}</tr>
              <tr><td style={{ padding: '10px', color: '#6b7280', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>Category</td>{compareProducts.map(p => <td key={p.id} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{CATEGORY_LABELS[p.category]}</td>)}</tr>
              <tr><td style={{ padding: '10px', color: '#6b7280', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>Brand</td>{compareProducts.map(p => <td key={p.id} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{p.brand}</td>)}</tr>
              <tr><td style={{ padding: '10px', color: '#6b7280', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>In Stock</td>{compareProducts.map(p => <td key={p.id} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', color: p.inStock ? '#16a34a' : '#dc2626' }}>{p.inStock ? 'Yes' : 'No'}</td>)}</tr>
              <tr><td style={{ padding: '10px', color: '#6b7280', fontSize: '13px' }}>Actions</td>{compareProducts.map(p => <td key={p.id} style={{ padding: '10px', textAlign: 'center' }}><button onClick={() => addToCart(p)} disabled={!p.inStock} style={{ padding: '6px 14px', background: p.inStock ? '#2563eb' : '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: p.inStock ? 'pointer' : 'not-allowed', fontSize: '12px' }}>Add to Cart</button></td>)}</tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReviewModal = () => {
    if (!showReviewModal) return null;
    const product = products.find(p => p.id === showReviewModal);
    return (
      <div data-testid="review-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', width: '500px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Write a Review</h2>
            <button onClick={() => setShowReviewModal(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }} aria-label="Close review modal">&times;</button>
          </div>
          {product && <p style={{ color: '#6b7280', marginBottom: '16px' }}>Reviewing: <strong>{product.name}</strong></p>}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Rating</label>
            <div data-testid="review-rating-selector">{[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setNewReview(prev => ({ ...prev, rating: star }))} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: star <= newReview.rating ? '#f59e0b' : '#d1d5db' }} aria-label={`Rate ${star} stars`}>{star <= newReview.rating ? '\u2605' : '\u2606'}</button>
            ))}</div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Title</label>
            <input value={newReview.title} onChange={e => setNewReview(prev => ({ ...prev, title: e.target.value }))} placeholder="Summary of your review" data-testid="review-title-input" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Review</label>
            <textarea value={newReview.comment} onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))} placeholder="Share your experience with this product..." rows={4} data-testid="review-comment-input" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <button onClick={() => submitReview(showReviewModal)} data-testid="submit-review-btn" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>Submit Review</button>
        </div>
      </div>
    );
  };

  const renderAddressModal = () => {
    if (!showAddressModal) return null;
    return (
      <div data-testid="address-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', width: '500px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Add New Address</h2>
            <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }} aria-label="Close address modal">&times;</button>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div><label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Label</label><input value={newAddress.label} onChange={e => setNewAddress(prev => ({ ...prev, label: e.target.value }))} placeholder="e.g. Home, Work" data-testid="address-label-input" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
            <div><label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Full Name</label><input value={newAddress.name} onChange={e => setNewAddress(prev => ({ ...prev, name: e.target.value }))} placeholder="John Doe" data-testid="address-name-input" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
            <div><label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Street Address</label><input value={newAddress.street} onChange={e => setNewAddress(prev => ({ ...prev, street: e.target.value }))} placeholder="123 Main St" data-testid="address-street-input" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
              <div><label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>City</label><input value={newAddress.city} onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))} data-testid="address-city-input" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>State</label><input value={newAddress.state} onChange={e => setNewAddress(prev => ({ ...prev, state: e.target.value }))} data-testid="address-state-input" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>ZIP</label><input value={newAddress.zip} onChange={e => setNewAddress(prev => ({ ...prev, zip: e.target.value }))} data-testid="address-zip-input" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
            </div>
          </div>
          <button onClick={addAddress} data-testid="save-address-btn" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', marginTop: '16px' }}>Save Address</button>
        </div>
      </div>
    );
  };

  const renderAddresses = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', color: '#1f2937', margin: 0 }}>My Addresses</h2>
        <button onClick={() => setShowAddressModal(true)} data-testid="add-address-page-btn" style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Add Address</button>
      </div>
      {addresses.length === 0 ? <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}><p style={{ fontSize: '48px' }}>🏠</p><p>No saved addresses</p></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {addresses.map(addr => (
            <div key={addr.id} data-testid={`address-card-${addr.id}`} style={{ background: 'white', borderRadius: '8px', border: `2px solid ${addr.isDefault ? '#2563eb' : '#e5e7eb'}`, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>{addr.label}</span>
                {addr.isDefault && <span style={{ fontSize: '11px', background: '#dbeafe', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Default</span>}
              </div>
              <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 4px' }}>{addr.name}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px' }}>{addr.street}<br />{addr.city}, {addr.state} {addr.zip}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!addr.isDefault && <button onClick={() => setDefaultAddress(addr.id)} data-testid={`set-default-${addr.id}`} style={{ padding: '6px 12px', background: 'white', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Set as Default</button>}
                <button onClick={() => removeAddress(addr.id)} data-testid={`remove-address-${addr.id}`} style={{ padding: '6px 12px', background: 'white', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const navItems = [
    { id: 'catalog', label: 'Shop', icon: '🛍️' },
    { id: 'wishlist', label: 'Wishlist', icon: '💝', badge: wishlist.length || null },
    { id: 'orders', label: 'Orders', icon: '📋', badge: orders.length || null },
    { id: 'addresses', label: 'Addresses', icon: '🏠' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {renderNotification()}
      <aside style={{ width: '240px', background: 'white', borderRight: '1px solid #e5e7eb', padding: '20px 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1f2937' }} data-testid="store-name">ShopWave</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Premium Online Store</p>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setSelectedProduct(null); }} data-testid={`nav-${item.id}`} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', border: 'none', background: activeView === item.id || (activeView === 'product' && item.id === 'catalog') ? '#eff6ff' : 'transparent', color: activeView === item.id || (activeView === 'product' && item.id === 'catalog') ? '#2563eb' : '#4b5563', cursor: 'pointer', fontSize: '14px', textAlign: 'left', fontWeight: activeView === item.id ? 600 : 400 }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span style={{ marginLeft: 'auto', background: '#2563eb', color: 'white', borderRadius: '10px', padding: '1px 8px', fontSize: '11px', fontWeight: 600 }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', fontSize: '13px', color: '#9ca3af' }}>
          <p style={{ margin: '0 0 4px' }}>Cart: {cartItemCount} items</p>
          <p style={{ margin: 0, fontWeight: 600, color: '#1f2937' }}>{formatCurrency(cartTotal)}</p>
        </div>
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input ref={searchRef} value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); if (activeView !== 'catalog') setActiveView('catalog'); }} placeholder="Search products... (Ctrl+K)" data-testid="search-input" style={{ width: '100%', padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
          <button onClick={() => setShowCart(true)} data-testid="cart-button" style={{ position: 'relative', padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Cart
            {cartItemCount > 0 && <span style={{ background: '#dc2626', color: 'white', borderRadius: '10px', padding: '1px 8px', fontSize: '11px' }}>{cartItemCount}</span>}
          </button>
        </header>
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeView === 'catalog' && renderCatalog()}
          {activeView === 'product' && renderProductDetail()}
          {activeView === 'wishlist' && renderWishlist()}
          {activeView === 'orders' && renderOrders()}
          {activeView === 'addresses' && renderAddresses()}
        </div>
      </main>
      {showCart && renderCartSidebar()}
      {showCheckout && renderCheckout()}
      {showCompare && renderCompareModal()}
      {showReviewModal && renderReviewModal()}
      {showAddressModal && renderAddressModal()}
    </div>
  );
}
