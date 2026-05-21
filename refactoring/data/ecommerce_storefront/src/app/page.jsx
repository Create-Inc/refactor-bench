import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Books",
  "Toys",
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "Wireless Noise-Canceling Headphones",
    price: 249.99,
    originalPrice: 329.99,
    category: "Electronics",
    rating: 4.7,
    reviewCount: 1284,
    image: "headphones.jpg",
    description:
      "Premium wireless headphones with active noise cancellation, 30-hour battery life, and Hi-Res audio support. Features adaptive sound control and speak-to-chat technology.",
    stock: 45,
    featured: true,
    isNew: false,
    tags: ["wireless", "audio", "noise-canceling"],
    sku: "EL-WH-001",
    specs: {
      brand: "AudioTech",
      weight: "250g",
      connectivity: "Bluetooth 5.2",
      battery: "30 hours",
    },
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: "p2",
    name: "Organic Cotton Crew Neck T-Shirt",
    price: 34.99,
    originalPrice: null,
    category: "Clothing",
    rating: 4.3,
    reviewCount: 567,
    image: "tshirt.jpg",
    description:
      "Sustainably made crew neck t-shirt from 100% organic cotton. Pre-shrunk, relaxed fit with reinforced stitching. Available in 12 colors.",
    stock: 200,
    featured: false,
    isNew: true,
    tags: ["organic", "cotton", "sustainable"],
    sku: "CL-TS-001",
    specs: {
      brand: "EcoWear",
      material: "100% Organic Cotton",
      fit: "Relaxed",
      care: "Machine wash cold",
    },
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "p3",
    name: "Smart LED Desk Lamp with Wireless Charger",
    price: 79.99,
    originalPrice: 99.99,
    category: "Home & Garden",
    rating: 4.5,
    reviewCount: 892,
    image: "lamp.jpg",
    description:
      "Modern desk lamp with adjustable color temperature (2700K-6500K), brightness levels, and built-in 15W wireless charging pad. Touch controls and USB-C port.",
    stock: 78,
    featured: true,
    isNew: false,
    tags: ["smart", "led", "wireless-charging"],
    sku: "HG-DL-001",
    specs: {
      brand: "LumaTech",
      wattage: "12W",
      colorTemp: "2700K-6500K",
      charger: "15W Qi",
    },
    createdAt: Date.now() - 86400000 * 45,
  },
  {
    id: "p4",
    name: "Carbon Fiber Road Bike",
    price: 1899.99,
    originalPrice: 2299.99,
    category: "Sports",
    rating: 4.8,
    reviewCount: 234,
    image: "bike.jpg",
    description:
      "Lightweight carbon fiber frame road bike with Shimano 105 groupset, hydraulic disc brakes, and aerodynamic design. Perfect for competitive cycling and long-distance rides.",
    stock: 12,
    featured: true,
    isNew: false,
    tags: ["carbon-fiber", "road-bike", "shimano"],
    sku: "SP-RB-001",
    specs: {
      brand: "VeloSpeed",
      frame: "Carbon Fiber",
      groupset: "Shimano 105",
      weight: "8.2kg",
    },
    createdAt: Date.now() - 86400000 * 90,
  },
  {
    id: "p5",
    name: "The Art of Clean Code",
    price: 39.99,
    originalPrice: null,
    category: "Books",
    rating: 4.6,
    reviewCount: 2156,
    image: "book.jpg",
    description:
      "A comprehensive guide to writing maintainable, readable, and efficient code. Covers design patterns, refactoring techniques, and best practices for modern software development.",
    stock: 500,
    featured: false,
    isNew: true,
    tags: ["programming", "software", "clean-code"],
    sku: "BK-CC-001",
    specs: {
      author: "Sarah Mitchell",
      pages: "420",
      format: "Hardcover",
      publisher: "TechPress",
    },
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "p6",
    name: "Building Blocks Mega Set (1000 pieces)",
    price: 59.99,
    originalPrice: 79.99,
    category: "Toys",
    rating: 4.9,
    reviewCount: 3421,
    image: "blocks.jpg",
    description:
      "Creative building blocks set with 1000 pieces in 15 colors. Compatible with major brands. Includes baseplate, instruction booklet with 50 designs, and storage container.",
    stock: 150,
    featured: true,
    isNew: false,
    tags: ["building", "creative", "educational"],
    sku: "TY-BB-001",
    specs: {
      brand: "BuildFun",
      pieces: "1000",
      age: "4+",
      material: "ABS Plastic",
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: "p7",
    name: "4K Ultra HD Action Camera",
    price: 199.99,
    originalPrice: 279.99,
    category: "Electronics",
    rating: 4.4,
    reviewCount: 756,
    image: "camera.jpg",
    description:
      "Waterproof action camera with 4K/60fps video, 20MP photos, electronic image stabilization, and Wi-Fi connectivity. Includes waterproof case rated to 40m depth.",
    stock: 65,
    featured: false,
    isNew: false,
    tags: ["camera", "4k", "waterproof"],
    sku: "EL-AC-001",
    specs: {
      brand: "ActionPro",
      resolution: "4K/60fps",
      waterproof: "40m",
      sensor: "20MP",
    },
    createdAt: Date.now() - 86400000 * 75,
  },
  {
    id: "p8",
    name: "Merino Wool Quarter-Zip Pullover",
    price: 89.99,
    originalPrice: null,
    category: "Clothing",
    rating: 4.6,
    reviewCount: 423,
    image: "pullover.jpg",
    description:
      "Temperature-regulating merino wool pullover with quarter-zip design. Naturally odor-resistant, moisture-wicking, and breathable. Perfect for layering in any season.",
    stock: 85,
    featured: false,
    isNew: true,
    tags: ["merino", "wool", "pullover"],
    sku: "CL-QZ-001",
    specs: {
      brand: "WoolCraft",
      material: "100% Merino Wool",
      fit: "Slim",
      care: "Hand wash",
    },
    createdAt: Date.now() - 86400000 * 8,
  },
  {
    id: "p9",
    name: "Ceramic Indoor Planter Set (3-Pack)",
    price: 44.99,
    originalPrice: 54.99,
    category: "Home & Garden",
    rating: 4.2,
    reviewCount: 312,
    image: "planters.jpg",
    description:
      "Handcrafted ceramic planters in three sizes with drainage holes and bamboo saucers. Matte finish in neutral tones. Perfect for succulents, herbs, and small houseplants.",
    stock: 120,
    featured: false,
    isNew: false,
    tags: ["ceramic", "planters", "indoor"],
    sku: "HG-CP-001",
    specs: {
      brand: "GreenHome",
      material: "Ceramic + Bamboo",
      sizes: "S/M/L",
      drainage: "Yes",
    },
    createdAt: Date.now() - 86400000 * 40,
  },
  {
    id: "p10",
    name: "Yoga Mat Premium Non-Slip",
    price: 68.99,
    originalPrice: null,
    category: "Sports",
    rating: 4.7,
    reviewCount: 1567,
    image: "yogamat.jpg",
    description:
      "Extra-thick 6mm yoga mat with superior grip and cushioning. Made from eco-friendly TPE material. Double-sided texture for different practices. Comes with carrying strap.",
    stock: 200,
    featured: false,
    isNew: false,
    tags: ["yoga", "fitness", "eco-friendly"],
    sku: "SP-YM-001",
    specs: {
      brand: "ZenFit",
      thickness: "6mm",
      material: "TPE",
      size: '72" x 24"',
    },
    createdAt: Date.now() - 86400000 * 55,
  },
  {
    id: "p11",
    name: "Mechanical Gaming Keyboard RGB",
    price: 129.99,
    originalPrice: 159.99,
    category: "Electronics",
    rating: 4.5,
    reviewCount: 2089,
    image: "keyboard.jpg",
    description:
      "Full-size mechanical keyboard with Cherry MX Blue switches, per-key RGB lighting, aluminum frame, and programmable macros. Detachable USB-C cable and magnetic wrist rest included.",
    stock: 90,
    featured: true,
    isNew: false,
    tags: ["gaming", "mechanical", "rgb"],
    sku: "EL-GK-001",
    specs: {
      brand: "KeyForce",
      switches: "Cherry MX Blue",
      backlight: "Per-key RGB",
      layout: "Full-size",
    },
    createdAt: Date.now() - 86400000 * 35,
  },
  {
    id: "p12",
    name: "Algorithmic Thinking for Beginners",
    price: 29.99,
    originalPrice: null,
    category: "Books",
    rating: 4.4,
    reviewCount: 891,
    image: "algobook.jpg",
    description:
      "Learn fundamental algorithms and data structures through practical examples and visual explanations. Covers sorting, searching, graphs, dynamic programming, and more.",
    stock: 350,
    featured: false,
    isNew: false,
    tags: ["algorithms", "programming", "beginner"],
    sku: "BK-AT-001",
    specs: {
      author: "James Park",
      pages: "380",
      format: "Paperback",
      publisher: "CodeBooks",
    },
    createdAt: Date.now() - 86400000 * 120,
  },
];

const INITIAL_REVIEWS = [
  {
    id: "r1",
    productId: "p1",
    author: "Alex M.",
    rating: 5,
    title: "Best headphones I have ever owned",
    text: "The noise cancellation is incredible. I use these daily for work and travel. Battery life easily lasts a full week of commuting.",
    helpful: 42,
    date: Date.now() - 86400000 * 30,
    verified: true,
  },
  {
    id: "r2",
    productId: "p1",
    author: "Jordan K.",
    rating: 4,
    title: "Great sound, slightly tight fit",
    text: "Sound quality is phenomenal but they feel a bit tight after 3+ hours. The ANC is top-notch though.",
    helpful: 18,
    date: Date.now() - 86400000 * 15,
    verified: true,
  },
  {
    id: "r3",
    productId: "p4",
    author: "Chris R.",
    rating: 5,
    title: "Race-ready out of the box",
    text: "Incredible value for a carbon frame with Shimano 105. Dropped 2 minutes off my usual time trial. The handling is precise and confident.",
    helpful: 31,
    date: Date.now() - 86400000 * 20,
    verified: true,
  },
  {
    id: "r4",
    productId: "p6",
    author: "Parent123",
    rating: 5,
    title: "Kids love it!",
    text: "My kids spend hours building with these. Great quality, compatible with other brands, and the storage container is a nice touch.",
    helpful: 56,
    date: Date.now() - 86400000 * 10,
    verified: false,
  },
  {
    id: "r5",
    productId: "p5",
    author: "DevGuru",
    rating: 4,
    title: "Essential reading for developers",
    text: "Well-structured chapters with practical refactoring examples. Some sections could go deeper into functional programming patterns.",
    helpful: 23,
    date: Date.now() - 86400000 * 3,
    verified: true,
  },
  {
    id: "r6",
    productId: "p3",
    author: "HomeOffice",
    rating: 5,
    title: "Perfect desk companion",
    text: "The wireless charging works great with my phone. Light quality is excellent for late-night work sessions. Touch controls are intuitive.",
    helpful: 15,
    date: Date.now() - 86400000 * 25,
    verified: true,
  },
  {
    id: "r7",
    productId: "p11",
    author: "GamerPro",
    rating: 4,
    title: "Clicky and satisfying",
    text: "Cherry MX Blues are loud but the typing feel is unmatched. RGB effects are customizable. The wrist rest is a nice bonus.",
    helpful: 29,
    date: Date.now() - 86400000 * 12,
    verified: true,
  },
  {
    id: "r8",
    productId: "p10",
    author: "YogaLover",
    rating: 5,
    title: "Non-slip even during hot yoga",
    text: "Finally a mat that does not slip when I sweat. The thickness is perfect for my knees. Eco-friendly material is a bonus.",
    helpful: 38,
    date: Date.now() - 86400000 * 8,
    verified: true,
  },
];

export default function EcommerceStorefront() {
  // Product & catalog state
  const [products] = useState(INITIAL_PRODUCTS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 2500]);
  const [minRating, setMinRating] = useState(0);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);

  // Product detail state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewSortBy, setReviewSortBy] = useState("newest");

  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    nameOnCard: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");

  // Order state
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);

  // UI state
  const [toast, setToast] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const searchInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  // localStorage persistence
  useEffect(() => {
    const savedCart = localStorage.getItem("shopCart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        /* ignore */
      }
    }
    const savedWishlist = localStorage.getItem("shopWishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        /* ignore */
      }
    }
    const savedOrders = localStorage.getItem("shopOrders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        /* ignore */
      }
    }
    const savedRecent = localStorage.getItem("shopRecentlyViewed");
    if (savedRecent) {
      try {
        setRecentlyViewed(JSON.parse(savedRecent));
      } catch (e) {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("shopCart", JSON.stringify(cartItems));
  }, [cartItems]);
  useEffect(() => {
    localStorage.setItem("shopWishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    localStorage.setItem("shopOrders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem("shopRecentlyViewed", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
        setShowCart(false);
        setShowCheckout(false);
        setShowWishlist(false);
        setShowOrders(false);
        setShowCompare(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Cart operations
  const addToCart = useCallback(
    (product, quantity = 1) => {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, product.stock),
                }
              : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            quantity: Math.min(quantity, product.stock),
            addedAt: Date.now(),
          },
        ];
      });
      showToast(`${product.name} added to cart`);
    },
    [showToast]
  );

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateCartQuantity = useCallback(
    (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      const product = products.find((p) => p.id === productId);
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, product?.stock || 99) }
            : item
        )
      );
    },
    [products, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedPromo(null);
  }, []);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cartItems, products]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percentage")
      return cartTotal * (appliedPromo.value / 100);
    return appliedPromo.value;
  }, [appliedPromo, cartTotal]);

  const shippingCost = useMemo(() => {
    if (cartTotal >= 100) return 0;
    if (shippingMethod === "express") return 14.99;
    if (shippingMethod === "overnight") return 24.99;
    return 5.99;
  }, [cartTotal, shippingMethod]);

  const orderTotal = useMemo(() => {
    return cartTotal - discountAmount + shippingCost;
  }, [cartTotal, discountAmount, shippingCost]);

  const applyPromoCode = useCallback(() => {
    const codes = {
      SAVE10: { type: "percentage", value: 10, label: "10% off" },
      FLAT20: { type: "fixed", value: 20, label: "$20 off" },
      WELCOME: { type: "percentage", value: 15, label: "15% off (Welcome)" },
    };
    const promo = codes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo(promo);
      showToast(`Promo code applied: ${promo.label}`);
    } else {
      showToast("Invalid promo code", "error");
    }
  }, [promoCode, showToast]);

  // Wishlist operations
  const toggleWishlist = useCallback(
    (productId) => {
      setWishlist((prev) => {
        if (prev.includes(productId)) {
          showToast("Removed from wishlist");
          return prev.filter((id) => id !== productId);
        }
        showToast("Added to wishlist");
        return [...prev, productId];
      });
    },
    [showToast]
  );

  // Compare operations
  const toggleCompare = useCallback(
    (productId) => {
      setCompareList((prev) => {
        if (prev.includes(productId))
          return prev.filter((id) => id !== productId);
        if (prev.length >= 4) {
          showToast("Maximum 4 products to compare", "error");
          return prev;
        }
        return [...prev, productId];
      });
    },
    [showToast]
  );

  // Product detail
  const viewProduct = useCallback((product) => {
    setSelectedProduct(product);
    setActiveTab("description");
    setSelectedImageIndex(0);
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== product.id);
      return [product.id, ...filtered].slice(0, 10);
    });
  }, []);

  // Reviews
  const addReview = useCallback(
    (productId, reviewData) => {
      const newReview = {
        id: "r" + Date.now(),
        productId,
        author: reviewData.author || "Anonymous",
        rating: reviewData.rating,
        title: reviewData.title,
        text: reviewData.text,
        helpful: 0,
        date: Date.now(),
        verified: false,
      };
      setReviews((prev) => [...prev, newReview]);
      showToast("Review submitted successfully");
    },
    [showToast]
  );

  const markReviewHelpful = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      )
    );
  }, []);

  // Checkout
  const placeOrder = useCallback(() => {
    const order = {
      id: "ORD-" + Date.now(),
      items: cartItems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          ...item,
          name: product?.name,
          price: product?.price,
          image: product?.image,
        };
      }),
      subtotal: cartTotal,
      discount: discountAmount,
      shipping: shippingCost,
      total: orderTotal,
      shippingInfo: { ...shippingInfo },
      shippingMethod,
      status: "confirmed",
      date: Date.now(),
    };
    setOrders((prev) => [order, ...prev]);
    clearCart();
    setShowCheckout(false);
    setCheckoutStep(1);
    showToast("Order placed successfully!");
  }, [
    cartItems,
    products,
    cartTotal,
    discountAmount,
    shippingCost,
    orderTotal,
    shippingInfo,
    shippingMethod,
    clearCart,
    showToast,
  ]);

  // Filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory)
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !p.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (p.rating < minRating) return false;
      if (showOnlyInStock && p.stock === 0) return false;
      if (showOnlyOnSale && !p.originalPrice) return false;
      return true;
    });

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    return result;
  }, [
    products,
    selectedCategory,
    searchQuery,
    sortBy,
    priceRange,
    minRating,
    showOnlyInStock,
    showOnlyOnSale,
  ]);

  const productReviews = useMemo(() => {
    if (!selectedProduct) return [];
    let result = reviews.filter((r) => r.productId === selectedProduct.id);
    if (reviewSortBy === "newest") result.sort((a, b) => b.date - a.date);
    else if (reviewSortBy === "highest")
      result.sort((a, b) => b.rating - a.rating);
    else if (reviewSortBy === "helpful")
      result.sort((a, b) => b.helpful - a.helpful);
    return result;
  }, [reviews, selectedProduct, reviewSortBy]);

  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const renderStars = (rating, size = 14) => {
    return (
      <span style={{ display: "inline-flex", gap: "1px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: star <= Math.round(rating) ? "#f59e0b" : "#d1d5db",
              fontSize: `${size}px`,
            }}
          >
            {star <= Math.round(rating) ? "\u2605" : "\u2606"}
          </span>
        ))}
      </span>
    );
  };

  const getDiscountPercent = (product) => {
    if (!product.originalPrice) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  };

  const accentColor = "#4f46e5";
  const bgColor = "#f8fafc";
  const cardBg = "#ffffff";
  const textColor = "#1e293b";
  const secondaryText = "#64748b";
  const borderColor = "#e2e8f0";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header / Navbar */}
      <header
        style={{
          backgroundColor: cardBg,
          borderBottom: `1px solid ${borderColor}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "64px",
              gap: "24px",
            }}
          >
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                margin: 0,
                color: accentColor,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() => {
                setSelectedProduct(null);
                setShowCart(false);
                setShowCheckout(false);
                setShowOrders(false);
                setShowWishlist(false);
                setShowCompare(false);
              }}
            >
              ShopWave
            </h1>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? "\u2715" : "\u2630"}
            </button>

            <nav style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedProduct(null);
                    setShowCart(false);
                    setShowCheckout(false);
                    setShowOrders(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color:
                      selectedCategory === cat ? accentColor : secondaryText,
                    fontWeight: selectedCategory === cat ? 600 : 400,
                    padding: "4px 0",
                    borderBottom:
                      selectedCategory === cat
                        ? `2px solid ${accentColor}`
                        : "2px solid transparent",
                    fontSize: "14px",
                  }}
                >
                  {cat}
                </button>
              ))}
            </nav>

            <div style={{ flex: 1, maxWidth: "400px", position: "relative" }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor: "#f1f5f9",
                  color: textColor,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: secondaryText,
                }}
              >
                &#128269;
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowWishlist(true);
                  setShowCart(false);
                  setShowCheckout(false);
                  setShowOrders(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  position: "relative",
                }}
                aria-label="Wishlist"
              >
                &#9825;
                {wishlist.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-6px",
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      fontSize: "10px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowOrders(true);
                  setShowCart(false);
                  setShowCheckout(false);
                  setShowWishlist(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: secondaryText,
                }}
                aria-label="Orders"
              >
                &#128230;
              </button>

              <button
                onClick={() => {
                  setShowCart(!showCart);
                  setShowCheckout(false);
                  setShowWishlist(false);
                  setShowOrders(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  position: "relative",
                }}
                aria-label="Shopping cart"
              >
                &#128722;
                {cartItemCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-6px",
                      backgroundColor: accentColor,
                      color: "#fff",
                      fontSize: "10px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        {/* Product Detail View */}
        {selectedProduct &&
          !showCart &&
          !showCheckout &&
          !showOrders &&
          !showWishlist &&
          !showCompare && (
            <div>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: accentColor,
                  fontSize: "14px",
                  marginBottom: "16px",
                  padding: 0,
                }}
              >
                &larr; Back to products
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "40px",
                  marginBottom: "32px",
                }}
              >
                <div>
                  <div
                    style={{
                      backgroundColor: cardBg,
                      borderRadius: "12px",
                      border: `1px solid ${borderColor}`,
                      padding: "40px",
                      textAlign: "center",
                      marginBottom: "12px",
                      minHeight: "300px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: "120px" }}>&#128247;</div>
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: "8px" }}>
                    {selectedProduct.isNew && (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#dcfce7",
                          color: "#16a34a",
                          fontWeight: 600,
                          marginRight: "8px",
                        }}
                      >
                        NEW
                      </span>
                    )}
                    {selectedProduct.originalPrice && (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#fef2f2",
                          color: "#ef4444",
                          fontWeight: 600,
                        }}
                      >
                        SAVE {getDiscountPercent(selectedProduct)}%
                      </span>
                    )}
                  </div>

                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: 600,
                      margin: "0 0 8px",
                    }}
                  >
                    {selectedProduct.name}
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    {renderStars(selectedProduct.rating)}
                    <span style={{ fontSize: "14px", color: secondaryText }}>
                      ({selectedProduct.reviewCount} reviews)
                    </span>
                    <span style={{ fontSize: "13px", color: secondaryText }}>
                      SKU: {selectedProduct.sku}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        color: accentColor,
                      }}
                    >
                      {formatPrice(selectedProduct.price)}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span
                        style={{
                          fontSize: "18px",
                          color: secondaryText,
                          textDecoration: "line-through",
                        }}
                      >
                        {formatPrice(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: "14px",
                      color: secondaryText,
                      lineHeight: 1.7,
                      marginBottom: "20px",
                    }}
                  >
                    {selectedProduct.description}
                  </p>

                  <div
                    style={{
                      fontSize: "14px",
                      marginBottom: "20px",
                      color:
                        selectedProduct.stock > 10
                          ? "#16a34a"
                          : selectedProduct.stock > 0
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {selectedProduct.stock > 10
                      ? `In Stock (${selectedProduct.stock} available)`
                      : selectedProduct.stock > 0
                      ? `Low Stock - Only ${selectedProduct.stock} left!`
                      : "Out of Stock"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      disabled={selectedProduct.stock === 0}
                      style={{
                        flex: 1,
                        padding: "12px 24px",
                        backgroundColor:
                          selectedProduct.stock === 0 ? "#94a3b8" : accentColor,
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor:
                          selectedProduct.stock === 0
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "15px",
                        fontWeight: 600,
                      }}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: wishlist.includes(selectedProduct.id)
                          ? "#fef2f2"
                          : cardBg,
                        border: `1px solid ${
                          wishlist.includes(selectedProduct.id)
                            ? "#ef4444"
                            : borderColor
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "18px",
                        color: wishlist.includes(selectedProduct.id)
                          ? "#ef4444"
                          : secondaryText,
                      }}
                      aria-label="Toggle wishlist"
                    >
                      {wishlist.includes(selectedProduct.id)
                        ? "\u2665"
                        : "\u2661"}
                    </button>
                    <button
                      onClick={() => toggleCompare(selectedProduct.id)}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: compareList.includes(
                          selectedProduct.id
                        )
                          ? "#eef2ff"
                          : cardBg,
                        border: `1px solid ${
                          compareList.includes(selectedProduct.id)
                            ? accentColor
                            : borderColor
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: compareList.includes(selectedProduct.id)
                          ? accentColor
                          : secondaryText,
                      }}
                      aria-label="Toggle compare"
                    >
                      &#8646;
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginBottom: "16px",
                    }}
                  >
                    {selectedProduct.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "12px",
                          padding: "4px 10px",
                          borderRadius: "16px",
                          backgroundColor: "#f1f5f9",
                          color: secondaryText,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Specs table */}
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: "8px",
                      padding: "16px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "10px",
                        textTransform: "uppercase",
                        color: secondaryText,
                      }}
                    >
                      Specifications
                    </h4>
                    {Object.entries(selectedProduct.specs).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "6px 0",
                            borderBottom: `1px solid ${borderColor}`,
                            fontSize: "13px",
                          }}
                        >
                          <span
                            style={{
                              color: secondaryText,
                              textTransform: "capitalize",
                            }}
                          >
                            {key}
                          </span>
                          <span style={{ fontWeight: 500 }}>{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs: Description / Reviews */}
              <div style={{ marginBottom: "32px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0",
                    borderBottom: `2px solid ${borderColor}`,
                    marginBottom: "20px",
                  }}
                >
                  {["description", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: "12px 24px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: activeTab === tab ? 600 : 400,
                        color: activeTab === tab ? accentColor : secondaryText,
                        borderBottom:
                          activeTab === tab
                            ? `2px solid ${accentColor}`
                            : "2px solid transparent",
                        marginBottom: "-2px",
                        textTransform: "capitalize",
                      }}
                    >
                      {tab} {tab === "reviews" && `(${productReviews.length})`}
                    </button>
                  ))}
                </div>

                {activeTab === "description" && (
                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.8,
                      color: secondaryText,
                      maxWidth: "800px",
                    }}
                  >
                    <p>{selectedProduct.description}</p>
                    <p style={{ marginTop: "12px" }}>
                      Category: <strong>{selectedProduct.category}</strong>
                    </p>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "36px", fontWeight: 700 }}>
                          {selectedProduct.rating}
                        </span>
                        <div>
                          {renderStars(selectedProduct.rating, 18)}
                          <div
                            style={{ fontSize: "13px", color: secondaryText }}
                          >
                            {selectedProduct.reviewCount} reviews
                          </div>
                        </div>
                      </div>
                      <select
                        value={reviewSortBy}
                        onChange={(e) => setReviewSortBy(e.target.value)}
                        style={{
                          padding: "6px 12px",
                          border: `1px solid ${borderColor}`,
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: textColor,
                          backgroundColor: cardBg,
                        }}
                        aria-label="Sort reviews"
                      >
                        <option value="newest">Newest First</option>
                        <option value="highest">Highest Rated</option>
                        <option value="helpful">Most Helpful</option>
                      </select>
                    </div>

                    {productReviews.map((review) => (
                      <div
                        key={review.id}
                        style={{
                          padding: "16px 0",
                          borderBottom: `1px solid ${borderColor}`,
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
                          {renderStars(review.rating)}
                          <span style={{ fontWeight: 600, fontSize: "14px" }}>
                            {review.title}
                          </span>
                          {review.verified && (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "#dcfce7",
                                color: "#16a34a",
                              }}
                            >
                              Verified
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: secondaryText,
                            marginBottom: "8px",
                          }}
                        >
                          By {review.author} on {formatDate(review.date)}
                        </div>
                        <p
                          style={{
                            fontSize: "14px",
                            lineHeight: 1.6,
                            color: secondaryText,
                            margin: "0 0 8px",
                          }}
                        >
                          {review.text}
                        </p>
                        <button
                          onClick={() => markReviewHelpful(review.id)}
                          style={{
                            background: "none",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "4px",
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: "12px",
                            color: secondaryText,
                          }}
                        >
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    ))}

                    {/* Write a review */}
                    <div
                      style={{
                        marginTop: "24px",
                        padding: "20px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          marginBottom: "12px",
                        }}
                      >
                        Write a Review
                      </h4>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target);
                          addReview(selectedProduct.id, {
                            author: formData.get("author"),
                            rating: parseInt(formData.get("rating")),
                            title: formData.get("title"),
                            text: formData.get("text"),
                          });
                          e.target.reset();
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <input
                            name="author"
                            placeholder="Your name"
                            required
                            style={{
                              padding: "8px 12px",
                              border: `1px solid ${borderColor}`,
                              borderRadius: "6px",
                              fontSize: "13px",
                            }}
                          />
                          <select
                            name="rating"
                            required
                            style={{
                              padding: "8px 12px",
                              border: `1px solid ${borderColor}`,
                              borderRadius: "6px",
                              fontSize: "13px",
                            }}
                            aria-label="Rating"
                          >
                            <option value="">Rating</option>
                            {[5, 4, 3, 2, 1].map((r) => (
                              <option key={r} value={r}>
                                {r} Star{r !== 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          name="title"
                          placeholder="Review title"
                          required
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "6px",
                            fontSize: "13px",
                            marginBottom: "12px",
                            boxSizing: "border-box",
                          }}
                        />
                        <textarea
                          name="text"
                          placeholder="Write your review..."
                          rows={3}
                          required
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "6px",
                            fontSize: "13px",
                            marginBottom: "12px",
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                        />
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
                          Submit Review
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Recently Viewed */}
              {recentlyViewed.length > 1 && (
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    Recently Viewed
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      overflowX: "auto",
                      paddingBottom: "8px",
                    }}
                  >
                    {recentlyViewed
                      .filter((id) => id !== selectedProduct.id)
                      .slice(0, 4)
                      .map((id) => {
                        const p = products.find((prod) => prod.id === id);
                        if (!p) return null;
                        return (
                          <div
                            key={p.id}
                            onClick={() => viewProduct(p)}
                            style={{
                              minWidth: "200px",
                              backgroundColor: cardBg,
                              borderRadius: "8px",
                              border: `1px solid ${borderColor}`,
                              padding: "12px",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                marginBottom: "4px",
                              }}
                            >
                              {p.name}
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: accentColor,
                              }}
                            >
                              {formatPrice(p.price)}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Shopping Cart Sidebar */}
        {showCart && !showCheckout && (
          <div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              Shopping Cart ({cartItemCount} items)
            </h2>
            {cartItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  &#128722;
                </div>
                <p style={{ color: secondaryText, fontSize: "16px" }}>
                  Your cart is empty
                </p>
                <button
                  onClick={() => setShowCart(false)}
                  style={{
                    marginTop: "12px",
                    padding: "10px 24px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 380px",
                  gap: "24px",
                }}
              >
                <div>
                  {cartItems.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId
                    );
                    if (!product) return null;
                    return (
                      <div
                        key={item.productId}
                        style={{
                          display: "flex",
                          gap: "16px",
                          padding: "16px",
                          backgroundColor: cardBg,
                          borderRadius: "8px",
                          border: `1px solid ${borderColor}`,
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            backgroundColor: "#f1f5f9",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "32px",
                            flexShrink: 0,
                          }}
                        >
                          &#128247;
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4
                            style={{
                              fontSize: "15px",
                              fontWeight: 500,
                              margin: "0 0 4px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              viewProduct(product);
                              setShowCart(false);
                            }}
                          >
                            {product.name}
                          </h4>
                          <div
                            style={{
                              fontSize: "13px",
                              color: secondaryText,
                              marginBottom: "8px",
                            }}
                          >
                            {product.category}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                border: `1px solid ${borderColor}`,
                                borderRadius: "6px",
                              }}
                            >
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                style={{
                                  padding: "4px 10px",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                                aria-label="Decrease quantity"
                              >
                                &minus;
                              </button>
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderLeft: `1px solid ${borderColor}`,
                                  borderRight: `1px solid ${borderColor}`,
                                  fontSize: "14px",
                                  minWidth: "24px",
                                  textAlign: "center",
                                }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                style={{
                                  padding: "4px 10px",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#ef4444",
                                fontSize: "13px",
                              }}
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => {
                                toggleWishlist(item.productId);
                                removeFromCart(item.productId);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: secondaryText,
                                fontSize: "13px",
                              }}
                            >
                              Move to Wishlist
                            </button>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "16px", fontWeight: 600 }}>
                            {formatPrice(product.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div
                              style={{ fontSize: "12px", color: secondaryText }}
                            >
                              {formatPrice(product.price)} each
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    border: `1px solid ${borderColor}`,
                    padding: "24px",
                    alignSelf: "start",
                    position: "sticky",
                    top: "88px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    Order Summary
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: secondaryText }}>
                      Subtotal ({cartItemCount} items)
                    </span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>

                  {appliedPromo && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        marginBottom: "8px",
                        color: "#16a34a",
                      }}
                    >
                      <span>Discount ({appliedPromo.label})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: secondaryText }}>Shipping</span>
                    <span>
                      {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                    </span>
                  </div>

                  {cartTotal < 100 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#16a34a",
                        marginBottom: "8px",
                        padding: "6px 10px",
                        backgroundColor: "#f0fdf4",
                        borderRadius: "4px",
                      }}
                    >
                      Add {formatPrice(100 - cartTotal)} more for free shipping!
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "16px",
                      fontWeight: 700,
                      borderTop: `1px solid ${borderColor}`,
                      paddingTop: "12px",
                      marginTop: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: accentColor }}>
                      {formatPrice(orderTotal)}
                    </span>
                  </div>

                  {/* Promo code */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}
                    />
                    <button
                      onClick={applyPromoCode}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#f1f5f9",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      Apply
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowCheckout(true);
                      setShowCart(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: accentColor,
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setShowCart(false)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "transparent",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: secondaryText,
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checkout Flow */}
        {showCheckout && (
          <div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              Checkout
            </h2>

            {/* Progress Steps */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "32px",
              }}
            >
              {["Shipping", "Payment", "Review"].map((step, i) => (
                <div
                  key={step}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 600,
                      backgroundColor:
                        checkoutStep > i + 1
                          ? "#16a34a"
                          : checkoutStep === i + 1
                          ? accentColor
                          : "#e2e8f0",
                      color: checkoutStep >= i + 1 ? "#fff" : secondaryText,
                    }}
                  >
                    {checkoutStep > i + 1 ? "\u2713" : i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: checkoutStep === i + 1 ? 600 : 400,
                      color: checkoutStep === i + 1 ? textColor : secondaryText,
                    }}
                  >
                    {step}
                  </span>
                  {i < 2 && (
                    <div
                      style={{
                        width: "40px",
                        height: "2px",
                        backgroundColor:
                          checkoutStep > i + 1 ? "#16a34a" : "#e2e8f0",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {checkoutStep === 1 && (
              <div style={{ maxWidth: "600px" }}>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    marginBottom: "16px",
                  }}
                >
                  Shipping Information
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "16px",
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
                      First Name *
                    </label>
                    <input
                      value={shippingInfo.firstName}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "14px",
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
                      Last Name *
                    </label>
                    <input
                      value={shippingInfo.lastName}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
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
                    Email *
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "14px",
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
                    Address *
                  </label>
                  <input
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
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
                      City *
                    </label>
                    <input
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "14px",
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
                      State *
                    </label>
                    <input
                      value={shippingInfo.state}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "14px",
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
                      Zip Code *
                    </label>
                    <input
                      value={shippingInfo.zipCode}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: secondaryText,
                      marginBottom: "4px",
                    }}
                  >
                    Phone
                  </label>
                  <input
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <h4
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  Shipping Method
                </h4>
                {[
                  {
                    id: "standard",
                    label: "Standard (5-7 business days)",
                    price: cartTotal >= 100 ? "FREE" : "$5.99",
                  },
                  {
                    id: "express",
                    label: "Express (2-3 business days)",
                    price: "$14.99",
                  },
                  {
                    id: "overnight",
                    label: "Overnight (next business day)",
                    price: "$24.99",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      border: `1px solid ${
                        shippingMethod === method.id ? accentColor : borderColor
                      }`,
                      borderRadius: "8px",
                      marginBottom: "8px",
                      cursor: "pointer",
                      backgroundColor:
                        shippingMethod === method.id ? "#eef2ff" : cardBg,
                    }}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>
                        {method.label}
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>
                      {method.price}
                    </span>
                  </label>
                ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "24px",
                  }}
                >
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setShowCart(true);
                    }}
                    style={{
                      padding: "10px 24px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      backgroundColor: "transparent",
                      color: textColor,
                    }}
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={() => setCheckoutStep(2)}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: accentColor,
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 2 && (
              <div style={{ maxWidth: "600px" }}>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    marginBottom: "16px",
                  }}
                >
                  Payment Information
                </h3>
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
                    Card Number *
                  </label>
                  <input
                    value={paymentInfo.cardNumber}
                    onChange={(e) =>
                      setPaymentInfo((prev) => ({
                        ...prev,
                        cardNumber: e.target.value,
                      }))
                    }
                    placeholder="1234 5678 9012 3456"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "14px",
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
                      Expiry Date *
                    </label>
                    <input
                      value={paymentInfo.expiry}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          expiry: e.target.value,
                        }))
                      }
                      placeholder="MM/YY"
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "14px",
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
                      CVV *
                    </label>
                    <input
                      value={paymentInfo.cvv}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          cvv: e.target.value,
                        }))
                      }
                      placeholder="123"
                      required
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: secondaryText,
                      marginBottom: "4px",
                    }}
                  >
                    Name on Card *
                  </label>
                  <input
                    value={paymentInfo.nameOnCard}
                    onChange={(e) =>
                      setPaymentInfo((prev) => ({
                        ...prev,
                        nameOnCard: e.target.value,
                      }))
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "24px",
                  }}
                >
                  <button
                    onClick={() => setCheckoutStep(1)}
                    style={{
                      padding: "10px 24px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      backgroundColor: "transparent",
                      color: textColor,
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCheckoutStep(3)}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: accentColor,
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div style={{ maxWidth: "600px" }}>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    marginBottom: "16px",
                  }}
                >
                  Review Your Order
                </h3>

                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    Shipping To
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: secondaryText,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {shippingInfo.firstName} {shippingInfo.lastName}
                    <br />
                    {shippingInfo.address}
                    <br />
                    {shippingInfo.city}, {shippingInfo.state}{" "}
                    {shippingInfo.zipCode}
                    <br />
                    {shippingInfo.email}
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "12px",
                    }}
                  >
                    Items ({cartItemCount})
                  </h4>
                  {cartItems.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId
                    );
                    if (!product) return null;
                    return (
                      <div
                        key={item.productId}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "14px",
                          padding: "6px 0",
                          borderBottom: `1px solid ${borderColor}`,
                        }}
                      >
                        <span>
                          {product.name} &times; {item.quantity}
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          {formatPrice(product.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    padding: "16px",
                    marginBottom: "24px",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ color: secondaryText }}>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {appliedPromo && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                        color: "#16a34a",
                      }}
                    >
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ color: secondaryText }}>Shipping</span>
                    <span>
                      {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 700,
                      fontSize: "16px",
                      borderTop: `1px solid ${borderColor}`,
                      paddingTop: "10px",
                      marginTop: "6px",
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: accentColor }}>
                      {formatPrice(orderTotal)}
                    </span>
                  </div>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button
                    onClick={() => setCheckoutStep(2)}
                    style={{
                      padding: "10px 24px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      backgroundColor: "transparent",
                      color: textColor,
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={placeOrder}
                    style={{
                      padding: "12px 32px",
                      backgroundColor: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order History */}
        {showOrders && !showCheckout && (
          <div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              Order History
            </h2>
            {orders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  &#128230;
                </div>
                <p style={{ color: secondaryText, fontSize: "16px" }}>
                  No orders yet
                </p>
                <button
                  onClick={() => {
                    setShowOrders(false);
                  }}
                  style={{
                    marginTop: "12px",
                    padding: "10px 24px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    border: `1px solid ${borderColor}`,
                    padding: "20px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>
                        {order.id}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: secondaryText,
                          marginLeft: "12px",
                        }}
                      >
                        {formatDate(order.date)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        backgroundColor:
                          order.status === "confirmed" ? "#dcfce7" : "#fef3c7",
                        color:
                          order.status === "confirmed" ? "#16a34a" : "#d97706",
                        fontWeight: 600,
                      }}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                  <div
                    style={{
                      borderTop: `1px solid ${borderColor}`,
                      paddingTop: "12px",
                    }}
                  >
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "14px",
                          padding: "4px 0",
                        }}
                      >
                        <span>
                          {item.name} &times; {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: `1px solid ${borderColor}`,
                      paddingTop: "12px",
                      marginTop: "8px",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: accentColor }}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Wishlist */}
        {showWishlist && !showCheckout && !showCart && (
          <div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              My Wishlist ({wishlist.length} items)
            </h2>
            {wishlist.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  &#9825;
                </div>
                <p style={{ color: secondaryText, fontSize: "16px" }}>
                  Your wishlist is empty
                </p>
                <button
                  onClick={() => setShowWishlist(false)}
                  style={{
                    marginTop: "12px",
                    padding: "10px 24px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "16px",
                }}
              >
                {wishlist.map((id) => {
                  const product = products.find((p) => p.id === id);
                  if (!product) return null;
                  return (
                    <div
                      key={product.id}
                      style={{
                        backgroundColor: cardBg,
                        borderRadius: "12px",
                        border: `1px solid ${borderColor}`,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "160px",
                          backgroundColor: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "48px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          viewProduct(product);
                          setShowWishlist(false);
                        }}
                      >
                        &#128247;
                      </div>
                      <div style={{ padding: "16px" }}>
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            margin: "0 0 6px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            viewProduct(product);
                            setShowWishlist(false);
                          }}
                        >
                          {product.name}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginBottom: "8px",
                          }}
                        >
                          {renderStars(product.rating, 12)}
                          <span
                            style={{ fontSize: "12px", color: secondaryText }}
                          >
                            ({product.reviewCount})
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: accentColor,
                            marginBottom: "12px",
                          }}
                        >
                          {formatPrice(product.price)}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => addToCart(product)}
                            style={{
                              flex: 1,
                              padding: "8px",
                              backgroundColor: accentColor,
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            style={{
                              padding: "8px 12px",
                              background: "none",
                              border: `1px solid ${borderColor}`,
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "#ef4444",
                            }}
                            aria-label="Remove from wishlist"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Compare Products */}
        {showCompare && compareList.length > 0 && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "22px", fontWeight: 600, margin: 0 }}>
                Compare Products
              </h2>
              <button
                onClick={() => {
                  setCompareList([]);
                  setShowCompare(false);
                }}
                style={{
                  padding: "8px 16px",
                  background: "none",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: secondaryText,
                  fontSize: "13px",
                }}
              >
                Clear All
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${compareList.length}, 1fr)`,
                gap: "16px",
                overflowX: "auto",
              }}
            >
              {compareList.map((id) => {
                const product = products.find((p) => p.id === id);
                if (!product) return null;
                return (
                  <div
                    key={product.id}
                    style={{
                      backgroundColor: cardBg,
                      borderRadius: "12px",
                      border: `1px solid ${borderColor}`,
                      padding: "20px",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => toggleCompare(product.id)}
                      style={{
                        float: "right",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: secondaryText,
                      }}
                    >
                      &#10005;
                    </button>
                    <div style={{ fontSize: "60px", marginBottom: "12px" }}>
                      &#128247;
                    </div>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        marginBottom: "8px",
                      }}
                    >
                      {product.name}
                    </h4>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: accentColor,
                        marginBottom: "8px",
                      }}
                    >
                      {formatPrice(product.price)}
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      {renderStars(product.rating)}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: secondaryText,
                        marginBottom: "12px",
                      }}
                    >
                      {product.category}
                    </div>
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: `1px solid ${borderColor}`,
                          fontSize: "12px",
                          textAlign: "left",
                        }}
                      >
                        <span
                          style={{
                            color: secondaryText,
                            textTransform: "capitalize",
                          }}
                        >
                          {key}
                        </span>
                        <span style={{ fontWeight: 500 }}>{val}</span>
                      </div>
                    ))}
                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        marginTop: "12px",
                        width: "100%",
                        padding: "8px",
                        backgroundColor: accentColor,
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Catalog */}
        {!selectedProduct &&
          !showCart &&
          !showCheckout &&
          !showOrders &&
          !showWishlist &&
          !(showCompare && compareList.length > 0) && (
            <div>
              {/* Filters & controls */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchQuery("");
                      setMinRating(0);
                      setShowOnlyInStock(false);
                      setShowOnlyOnSale(false);
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border:
                        selectedCategory === "all"
                          ? "none"
                          : `1px solid ${borderColor}`,
                      backgroundColor:
                        selectedCategory === "all"
                          ? accentColor
                          : "transparent",
                      color: selectedCategory === "all" ? "#fff" : textColor,
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    All Products
                  </button>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showOnlyInStock}
                      onChange={(e) => setShowOnlyInStock(e.target.checked)}
                    />{" "}
                    In Stock
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showOnlyOnSale}
                      onChange={(e) => setShowOnlyOnSale(e.target.checked)}
                    />{" "}
                    On Sale
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    style={{
                      padding: "6px 10px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "13px",
                      backgroundColor: cardBg,
                      color: textColor,
                    }}
                    aria-label="Minimum rating"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={4}>4+ Stars</option>
                    <option value={3}>3+ Stars</option>
                  </select>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "13px", color: secondaryText }}>
                    {filteredProducts.length} products
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      fontSize: "13px",
                      backgroundColor: cardBg,
                      color: textColor,
                    }}
                    aria-label="Sort by"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div
                    style={{
                      display: "flex",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setViewMode("grid")}
                      style={{
                        padding: "6px 10px",
                        background:
                          viewMode === "grid" ? "#f1f5f9" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                      aria-label="Grid view"
                    >
                      &#9638;
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      style={{
                        padding: "6px 10px",
                        background:
                          viewMode === "list" ? "#f1f5f9" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderLeft: `1px solid ${borderColor}`,
                      }}
                      aria-label="List view"
                    >
                      &#9776;
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Grid / List */}
              {filteredProducts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    &#128269;
                  </div>
                  <p style={{ color: secondaryText, fontSize: "16px" }}>
                    No products match your filters
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchQuery("");
                      setMinRating(0);
                      setShowOnlyInStock(false);
                      setShowOnlyOnSale(false);
                    }}
                    style={{
                      marginTop: "12px",
                      padding: "8px 20px",
                      backgroundColor: accentColor,
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        backgroundColor: cardBg,
                        borderRadius: "12px",
                        border: `1px solid ${borderColor}`,
                        overflow: "hidden",
                        transition: "box-shadow 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          height: "200px",
                          backgroundColor: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => viewProduct(product)}
                      >
                        <div style={{ fontSize: "64px" }}>&#128247;</div>
                        {product.isNew && (
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              fontSize: "11px",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              backgroundColor: "#dcfce7",
                              color: "#16a34a",
                              fontWeight: 600,
                            }}
                          >
                            NEW
                          </span>
                        )}
                        {product.originalPrice && (
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              fontSize: "11px",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              backgroundColor: "#fef2f2",
                              color: "#ef4444",
                              fontWeight: 600,
                            }}
                          >
                            -{getDiscountPercent(product)}%
                          </span>
                        )}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            display: "flex",
                            gap: "6px",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              border: "none",
                              backgroundColor: "rgba(255,255,255,0.9)",
                              cursor: "pointer",
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: wishlist.includes(product.id)
                                ? "#ef4444"
                                : secondaryText,
                            }}
                            aria-label={`Wishlist ${product.name}`}
                          >
                            {wishlist.includes(product.id)
                              ? "\u2665"
                              : "\u2661"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompare(product.id);
                            }}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              border: "none",
                              backgroundColor: "rgba(255,255,255,0.9)",
                              cursor: "pointer",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: compareList.includes(product.id)
                                ? accentColor
                                : secondaryText,
                            }}
                            aria-label={`Compare ${product.name}`}
                          >
                            &#8646;
                          </button>
                        </div>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <div
                          style={{
                            fontSize: "12px",
                            color: secondaryText,
                            marginBottom: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          {product.category}
                        </div>
                        <h3
                          style={{
                            fontSize: "15px",
                            fontWeight: 500,
                            margin: "0 0 6px",
                            cursor: "pointer",
                            lineHeight: 1.3,
                          }}
                          onClick={() => viewProduct(product)}
                        >
                          {product.name}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginBottom: "8px",
                          }}
                        >
                          {renderStars(product.rating, 12)}
                          <span
                            style={{ fontSize: "12px", color: secondaryText }}
                          >
                            ({product.reviewCount})
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: 700,
                              color: accentColor,
                            }}
                          >
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span
                              style={{
                                fontSize: "13px",
                                color: secondaryText,
                                textDecoration: "line-through",
                              }}
                            >
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor:
                              product.stock === 0 ? "#94a3b8" : accentColor,
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor:
                              product.stock === 0 ? "not-allowed" : "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        display: "flex",
                        gap: "20px",
                        backgroundColor: cardBg,
                        borderRadius: "12px",
                        border: `1px solid ${borderColor}`,
                        padding: "16px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "140px",
                          height: "140px",
                          backgroundColor: "#f1f5f9",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "48px",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                        onClick={() => viewProduct(product)}
                      >
                        &#128247;
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            color: secondaryText,
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          {product.category}
                        </div>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: 500,
                            margin: "0 0 6px",
                            cursor: "pointer",
                          }}
                          onClick={() => viewProduct(product)}
                        >
                          {product.name}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginBottom: "6px",
                          }}
                        >
                          {renderStars(product.rating, 12)}
                          <span
                            style={{ fontSize: "12px", color: secondaryText }}
                          >
                            ({product.reviewCount})
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "13px",
                            color: secondaryText,
                            margin: "0 0 8px",
                            lineHeight: 1.5,
                          }}
                        >
                          {product.description.slice(0, 120)}...
                        </p>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {product.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                backgroundColor: "#f1f5f9",
                                color: secondaryText,
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          minWidth: "140px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: 700,
                              color: accentColor,
                            }}
                          >
                            {formatPrice(product.price)}
                          </div>
                          {product.originalPrice && (
                            <div
                              style={{
                                fontSize: "13px",
                                color: secondaryText,
                                textDecoration: "line-through",
                              }}
                            >
                              {formatPrice(product.originalPrice)}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: "12px",
                              color:
                                product.stock > 10
                                  ? "#16a34a"
                                  : product.stock > 0
                                  ? "#f59e0b"
                                  : "#ef4444",
                              marginTop: "4px",
                            }}
                          >
                            {product.stock > 10
                              ? "In Stock"
                              : product.stock > 0
                              ? `Only ${product.stock} left`
                              : "Out of Stock"}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            style={{
                              padding: "8px 12px",
                              background: "none",
                              border: `1px solid ${borderColor}`,
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: wishlist.includes(product.id)
                                ? "#ef4444"
                                : secondaryText,
                            }}
                            aria-label={`Wishlist ${product.name}`}
                          >
                            {wishlist.includes(product.id)
                              ? "\u2665"
                              : "\u2661"}
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            style={{
                              padding: "8px 16px",
                              backgroundColor:
                                product.stock === 0 ? "#94a3b8" : accentColor,
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor:
                                product.stock === 0 ? "not-allowed" : "pointer",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Compare floating bar */}
              {compareList.length > 0 && (
                <div
                  style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    border: `1px solid ${borderColor}`,
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 50,
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>
                    {compareList.length} product
                    {compareList.length > 1 ? "s" : ""} selected
                  </span>
                  <button
                    onClick={() => setShowCompare(true)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: accentColor,
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    Compare Now
                  </button>
                  <button
                    onClick={() => setCompareList([])}
                    style={{
                      padding: "8px 12px",
                      background: "none",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: secondaryText,
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${
              toast.type === "error" ? "#fecaca" : "#bbf7d0"
            }`,
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "14px",
            color: toast.type === "error" ? "#dc2626" : "#16a34a",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{toast.type === "error" ? "\u2717" : "\u2713"}</span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: secondaryText,
              marginLeft: "8px",
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
