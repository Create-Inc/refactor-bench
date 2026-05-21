import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const PROPERTY_TYPES = ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'];
const LISTING_TYPES = ['sale', 'rent'];
const AMENITIES = [
  'Swimming Pool', 'Garage', 'Garden', 'Gym', 'Elevator', 'Security System',
  'Central AC', 'Fireplace', 'Balcony', 'Laundry Room', 'Storage Unit', 'Pet Friendly',
  'Hardwood Floors', 'Stainless Steel Appliances', 'Walk-in Closet', 'Rooftop Access',
];
const CONDITION_OPTIONS = ['new', 'excellent', 'good', 'fair', 'needs-renovation'];
const FURNISHING_OPTIONS = ['furnished', 'semi-furnished', 'unfurnished'];
const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const FREQUENCY_OPTIONS = ['monthly', 'weekly', 'yearly'];

const STEPS = [
  { id: 'basics', label: 'Property Details', icon: '🏠' },
  { id: 'media', label: 'Photos & Media', icon: '📷' },
  { id: 'pricing', label: 'Pricing', icon: '💰' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'review', label: 'Review & Submit', icon: '✅' },
];

const INITIAL_FORM_DATA = {
  // Step 1: Basics
  title: '',
  description: '',
  propertyType: 'house',
  listingType: 'sale',
  bedrooms: '',
  bathrooms: '',
  squareFeet: '',
  lotSize: '',
  yearBuilt: '',
  condition: 'good',
  furnishing: 'unfurnished',
  amenities: [],
  // Step 2: Media
  photos: [],
  virtualTourUrl: '',
  videoUrl: '',
  floorPlanUrl: '',
  // Step 3: Pricing
  price: '',
  currency: 'USD',
  priceNegotiable: false,
  rentalFrequency: 'monthly',
  securityDeposit: '',
  hoaFees: '',
  propertyTax: '',
  // Step 4: Location
  address: '',
  unit: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  neighborhood: '',
  latitude: '',
  longitude: '',
  nearbySchools: '',
  nearbyTransport: '',
  // Meta
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  showAddress: true,
  acceptTerms: false,
};

const SAMPLE_NEIGHBORHOODS = [
  'Downtown', 'Midtown', 'Uptown', 'Westside', 'Eastside',
  'Suburbs', 'Lakefront', 'Historic District', 'University Area', 'Tech Corridor',
];

export default function PropertyListingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef(null);
  const amenitiesRef = useRef(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('propertyListingDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData && parsed.currentStep !== undefined) {
          setShowDraftModal(true);
        }
      } catch (e) { /* ignore corrupted data */ }
    }
    const savedTheme = localStorage.getItem('listingWizardTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (formData.title || formData.description || formData.price) {
        saveDraft(true);
      }
    }, 30000);
    setAutoSaveTimer(timer);
    return () => clearInterval(timer);
  }, [formData]);

  // Close amenities dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (amenitiesRef.current && !amenitiesRef.current.contains(e.target)) {
        setShowAmenitiesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDraftModal(false);
        setShowDiscardModal(false);
        setPhotoPreview(null);
        setShowPreviewPanel(false);
        setShowAmenitiesDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Estimate property value based on inputs
  useEffect(() => {
    const sqft = parseInt(formData.squareFeet);
    const beds = parseInt(formData.bedrooms);
    const baths = parseInt(formData.bathrooms);
    if (sqft > 0 && beds > 0) {
      const basePrice = sqft * 150;
      const bedroomBonus = beds * 15000;
      const bathroomBonus = (baths || 1) * 8000;
      const conditionMultiplier = {
        'new': 1.3, 'excellent': 1.15, 'good': 1.0, 'fair': 0.85, 'needs-renovation': 0.7,
      }[formData.condition] || 1.0;
      const amenityBonus = formData.amenities.length * 5000;
      const estimate = Math.round((basePrice + bedroomBonus + bathroomBonus + amenityBonus) * conditionMultiplier);
      setEstimatedValue(estimate);
    } else {
      setEstimatedValue(null);
    }
  }, [formData.squareFeet, formData.bedrooms, formData.bathrooms, formData.condition, formData.amenities]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('listingWizardTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    // Clear error on change
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const toggleAmenity = useCallback((amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  const addPhoto = useCallback((name) => {
    const photo = {
      id: Date.now().toString(),
      name: name || `Photo ${formData.photos.length + 1}`,
      url: `https://placeholder.example.com/property-${Date.now()}.jpg`,
      isPrimary: formData.photos.length === 0,
      caption: '',
      addedAt: Date.now(),
    };
    setFormData(prev => ({ ...prev, photos: [...prev.photos, photo] }));
  }, [formData.photos.length]);

  const removePhoto = useCallback((photoId) => {
    setFormData(prev => {
      const updated = prev.photos.filter(p => p.id !== photoId);
      // If we removed the primary, make the first remaining one primary
      if (updated.length > 0 && !updated.some(p => p.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return { ...prev, photos: updated };
    });
  }, []);

  const setPrimaryPhoto = useCallback((photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.map(p => ({ ...p, isPrimary: p.id === photoId })),
    }));
  }, []);

  const updatePhotoCaption = useCallback((photoId, caption) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === photoId ? { ...p, caption } : p),
    }));
  }, []);

  const validateStep = useCallback((stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      else if (formData.title.trim().length < 10) newErrors.title = 'Title must be at least 10 characters';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      else if (formData.description.trim().length < 30) newErrors.description = 'Description must be at least 30 characters';
      if (!formData.bedrooms && formData.propertyType !== 'land' && formData.propertyType !== 'commercial') {
        newErrors.bedrooms = 'Number of bedrooms is required';
      }
      if (!formData.bathrooms && formData.propertyType !== 'land') {
        newErrors.bathrooms = 'Number of bathrooms is required';
      }
      if (!formData.squareFeet) newErrors.squareFeet = 'Square footage is required';
      else if (parseInt(formData.squareFeet) <= 0) newErrors.squareFeet = 'Square footage must be positive';
    }

    if (stepIndex === 1) {
      if (formData.photos.length === 0) newErrors.photos = 'At least one photo is required';
      if (formData.virtualTourUrl && !formData.virtualTourUrl.match(/^https?:\/\/.+/)) {
        newErrors.virtualTourUrl = 'Please enter a valid URL';
      }
      if (formData.videoUrl && !formData.videoUrl.match(/^https?:\/\/.+/)) {
        newErrors.videoUrl = 'Please enter a valid URL';
      }
    }

    if (stepIndex === 2) {
      if (!formData.price) newErrors.price = 'Price is required';
      else if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be positive';
      if (formData.listingType === 'rent' && !formData.securityDeposit) {
        newErrors.securityDeposit = 'Security deposit is required for rentals';
      }
    }

    if (stepIndex === 3) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
      else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) newErrors.zipCode = 'Invalid ZIP code format';
      if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
      if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) newErrors.contactEmail = 'Invalid email format';
    }

    if (stepIndex === 4) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const goToStep = useCallback((stepIndex) => {
    // Validate all steps before the target
    if (stepIndex > currentStep) {
      for (let i = currentStep; i < stepIndex; i++) {
        if (!validateStep(i)) return;
      }
    }
    setCurrentStep(stepIndex);
  }, [currentStep, validateStep]);

  const goNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [currentStep, validateStep]);

  const goBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const saveDraft = useCallback((isAuto = false) => {
    const draft = { formData, currentStep, completedSteps, savedAt: Date.now() };
    localStorage.setItem('propertyListingDraft', JSON.stringify(draft));
    setIsDraftSaved(true);
    if (isAuto) setLastAutoSave(new Date());
    setTimeout(() => setIsDraftSaved(false), 2000);
  }, [formData, currentStep, completedSteps]);

  const loadDraft = useCallback(() => {
    const savedDraft = localStorage.getItem('propertyListingDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed.formData);
        setCurrentStep(parsed.currentStep);
        setCompletedSteps(parsed.completedSteps || []);
      } catch (e) { /* ignore */ }
    }
    setShowDraftModal(false);
  }, []);

  const discardDraft = useCallback(() => {
    localStorage.removeItem('propertyListingDraft');
    setShowDraftModal(false);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(0);
    setErrors({});
    setTouched({});
    setCompletedSteps([]);
    setIsSubmitted(false);
    localStorage.removeItem('propertyListingDraft');
    setShowDiscardModal(false);
  }, []);

  const handleSubmit = useCallback(() => {
    // Validate all steps
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        return;
      }
    }
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      localStorage.removeItem('propertyListingDraft');
    }, 2000);
  }, [validateStep]);

  const getStepStatus = useCallback((stepIndex) => {
    if (stepIndex === currentStep) return 'current';
    if (completedSteps.includes(stepIndex)) return 'completed';
    return 'pending';
  }, [currentStep, completedSteps]);

  const overallProgress = useMemo(() => {
    return Math.round((completedSteps.length / STEPS.length) * 100);
  }, [completedSteps]);

  const formatCurrency = (amount, currency = formData.currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$' };
    return `${symbols[currency] || '$'}${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const bgColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const secondaryText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#6366f1';
  const errorColor = '#ef4444';
  const successColor = '#22c55e';

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: `1px solid ${borderColor}`,
    borderRadius: '8px', fontSize: '14px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
    color: textColor, outline: 'none', boxSizing: 'border-box',
  };

  const errorInputStyle = { ...inputStyle, borderColor: errorColor };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: textColor, marginBottom: '6px' };

  // Submitted confirmation screen
  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '48px', textAlign: 'center', maxWidth: '500px', border: `1px solid ${borderColor}` }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: textColor, marginBottom: '8px' }}>Listing Submitted!</h1>
          <p style={{ fontSize: '14px', color: secondaryText, marginBottom: '8px' }}>
            Your property "{formData.title}" has been submitted for review.
          </p>
          <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '24px' }}>
            You will receive a confirmation email at {formData.contactEmail} within 24 hours.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={resetForm}
              style={{ padding: '10px 24px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
            >
              Create Another Listing
            </button>
            <button
              onClick={() => setShowPreviewPanel(true)}
              style={{ padding: '10px 24px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
            >
              View Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>🏠 PropertyList</h1>
          <span style={{ fontSize: '13px', color: secondaryText }}>Create New Listing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lastAutoSave && (
            <span style={{ fontSize: '11px', color: secondaryText }}>
              Auto-saved {formatDate(lastAutoSave)}
            </span>
          )}
          <button
            onClick={() => saveDraft(false)}
            style={{ padding: '6px 14px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: isDraftSaved ? successColor + '20' : 'transparent', color: isDraftSaved ? successColor : textColor }}
            aria-label="Save draft"
          >
            {isDraftSaved ? '✓ Saved' : '💾 Save Draft'}
          </button>
          <button
            onClick={() => setShowPreviewPanel(true)}
            style={{ padding: '6px 14px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}
            aria-label="Preview listing"
          >
            👁️ Preview
          </button>
          <button
            onClick={() => setShowDiscardModal(true)}
            style={{ padding: '6px 14px', border: `1px solid ${errorColor}40`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: errorColor }}
            aria-label="Discard listing"
          >
            🗑️ Discard
          </button>
          <button onClick={toggleTheme} style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }} aria-label="Toggle theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ padding: '20px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>Step {currentStep + 1} of {STEPS.length}</span>
          <span style={{ fontSize: '13px', color: secondaryText }}>{overallProgress}% complete</span>
        </div>
        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ width: `${overallProgress}%`, height: '100%', backgroundColor: accentColor, borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {STEPS.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                style={{
                  flex: 1, padding: '10px 8px', border: `2px solid ${status === 'current' ? accentColor : status === 'completed' ? successColor : borderColor}`,
                  borderRadius: '8px', cursor: 'pointer', fontSize: '12px', textAlign: 'center',
                  backgroundColor: status === 'current' ? accentColor + '10' : status === 'completed' ? successColor + '10' : 'transparent',
                  color: status === 'current' ? accentColor : status === 'completed' ? successColor : secondaryText,
                  fontWeight: status === 'current' ? 600 : 400, transition: 'all 0.2s',
                }}
                aria-label={`Go to ${step.label}`}
              >
                <span style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                  {status === 'completed' ? '✓' : step.icon}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        {/* Step 1: Property Details */}
        {currentStep === 0 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Property Details</h2>
            <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '24px' }}>Tell us about your property. Fields marked with * are required.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Listing Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Stunning 3BR Home with Pool in Downtown"
                  style={errors.title ? errorInputStyle : inputStyle}
                  maxLength={100}
                  aria-label="Listing title"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  {errors.title && <span style={{ fontSize: '12px', color: errorColor }}>{errors.title}</span>}
                  <span style={{ fontSize: '11px', color: secondaryText, marginLeft: 'auto' }}>{formData.title.length}/100</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your property in detail — features, recent upgrades, neighborhood highlights..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  maxLength={2000}
                  aria-label="Property description"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  {errors.description && <span style={{ fontSize: '12px', color: errorColor }}>{errors.description}</span>}
                  <span style={{ fontSize: '11px', color: secondaryText, marginLeft: 'auto' }}>{formData.description.length}/2000</span>
                </div>
              </div>

              {/* Property Type + Listing Type row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => updateField('propertyType', e.target.value)}
                    style={inputStyle}
                    aria-label="Property type"
                  >
                    {PROPERTY_TYPES.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Listing Type</label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => updateField('listingType', e.target.value)}
                    style={inputStyle}
                    aria-label="Listing type"
                  >
                    {LISTING_TYPES.map(type => (
                      <option key={type} value={type}>{type === 'sale' ? 'For Sale' : 'For Rent'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bedrooms / Bathrooms / SqFt row */}
              {formData.propertyType !== 'land' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {formData.propertyType !== 'commercial' && (
                    <div>
                      <label style={labelStyle}>Bedrooms *</label>
                      <input
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => updateField('bedrooms', e.target.value)}
                        min="0" max="20" placeholder="0"
                        style={errors.bedrooms ? errorInputStyle : inputStyle}
                        aria-label="Number of bedrooms"
                      />
                      {errors.bedrooms && <span style={{ fontSize: '12px', color: errorColor }}>{errors.bedrooms}</span>}
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>Bathrooms *</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => updateField('bathrooms', e.target.value)}
                      min="0" max="20" step="0.5" placeholder="0"
                      style={errors.bathrooms ? errorInputStyle : inputStyle}
                      aria-label="Number of bathrooms"
                    />
                    {errors.bathrooms && <span style={{ fontSize: '12px', color: errorColor }}>{errors.bathrooms}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Square Feet *</label>
                    <input
                      type="number"
                      value={formData.squareFeet}
                      onChange={(e) => updateField('squareFeet', e.target.value)}
                      min="0" placeholder="0"
                      style={errors.squareFeet ? errorInputStyle : inputStyle}
                      aria-label="Square footage"
                    />
                    {errors.squareFeet && <span style={{ fontSize: '12px', color: errorColor }}>{errors.squareFeet}</span>}
                  </div>
                </div>
              )}

              {/* Lot Size / Year Built row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Lot Size (acres)</label>
                  <input
                    type="number"
                    value={formData.lotSize}
                    onChange={(e) => updateField('lotSize', e.target.value)}
                    min="0" step="0.01" placeholder="0.00"
                    style={inputStyle}
                    aria-label="Lot size"
                  />
                </div>
                {formData.propertyType !== 'land' && (
                  <div>
                    <label style={labelStyle}>Year Built</label>
                    <input
                      type="number"
                      value={formData.yearBuilt}
                      onChange={(e) => updateField('yearBuilt', e.target.value)}
                      min="1800" max={new Date().getFullYear()} placeholder={new Date().getFullYear().toString()}
                      style={inputStyle}
                      aria-label="Year built"
                    />
                  </div>
                )}
              </div>

              {/* Condition / Furnishing row */}
              {formData.propertyType !== 'land' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => updateField('condition', e.target.value)}
                      style={inputStyle}
                      aria-label="Property condition"
                    >
                      {CONDITION_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Furnishing</label>
                    <select
                      value={formData.furnishing}
                      onChange={(e) => updateField('furnishing', e.target.value)}
                      style={inputStyle}
                      aria-label="Furnishing status"
                    >
                      {FURNISHING_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Amenities */}
              {formData.propertyType !== 'land' && (
                <div ref={amenitiesRef}>
                  <label style={labelStyle}>Amenities</label>
                  <button
                    onClick={() => setShowAmenitiesDropdown(!showAmenitiesDropdown)}
                    style={{ ...inputStyle, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    aria-label="Select amenities"
                  >
                    <span style={{ color: formData.amenities.length > 0 ? textColor : secondaryText }}>
                      {formData.amenities.length > 0 ? `${formData.amenities.length} selected` : 'Select amenities...'}
                    </span>
                    <span>{showAmenitiesDropdown ? '▲' : '▼'}</span>
                  </button>
                  {showAmenitiesDropdown && (
                    <div style={{ border: `1px solid ${borderColor}`, borderRadius: '8px', marginTop: '4px', backgroundColor: cardBg, maxHeight: '200px', overflow: 'auto' }}>
                      {AMENITIES.map(amenity => (
                        <label
                          key={amenity}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: `1px solid ${borderColor}` }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  )}
                  {formData.amenities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {formData.amenities.map(amenity => (
                        <span key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '12px', backgroundColor: accentColor + '15', color: accentColor, borderRadius: '16px' }}>
                          {amenity}
                          <button
                            onClick={() => toggleAmenity(amenity)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: accentColor, fontSize: '14px', padding: 0, lineHeight: 1 }}
                            aria-label={`Remove ${amenity}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Estimated Value */}
              {estimatedValue && (
                <div style={{ padding: '16px', backgroundColor: accentColor + '10', borderRadius: '8px', border: `1px solid ${accentColor}30` }}>
                  <div style={{ fontSize: '12px', color: accentColor, fontWeight: 600, marginBottom: '4px' }}>Estimated Market Value</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: accentColor }}>
                    {formatCurrency(estimatedValue, 'USD')}
                  </div>
                  <div style={{ fontSize: '11px', color: secondaryText, marginTop: '4px' }}>
                    Based on size, bedrooms, condition, and amenities. Actual value may vary.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Photos & Media */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Photos & Media</h2>
            <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '24px' }}>Add photos and media to showcase your property. At least one photo is required.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Photo Upload Area */}
              <div>
                <label style={labelStyle}>Property Photos * ({formData.photos.length}/20)</label>
                <div
                  onClick={() => formData.photos.length < 20 && addPhoto()}
                  style={{
                    border: `2px dashed ${errors.photos ? errorColor : borderColor}`,
                    borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer',
                    backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                  }}
                  role="button"
                  aria-label="Upload photos"
                >
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>📷</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Click to add photos</div>
                  <div style={{ fontSize: '12px', color: secondaryText, marginTop: '4px' }}>
                    JPEG, PNG, WebP up to 10MB each. Max 20 photos.
                  </div>
                </div>
                {errors.photos && <span style={{ fontSize: '12px', color: errorColor, marginTop: '4px', display: 'block' }}>{errors.photos}</span>}
              </div>

              {/* Photo Grid */}
              {formData.photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {formData.photos.map((photo, index) => (
                    <div key={photo.id} style={{ border: `2px solid ${photo.isPrimary ? accentColor : borderColor}`, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                      <div
                        style={{ height: '120px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', cursor: 'pointer' }}
                        onClick={() => setPhotoPreview(photo)}
                      >
                        🖼️
                      </div>
                      {photo.isPrimary && (
                        <span style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '10px', padding: '2px 8px', backgroundColor: accentColor, color: '#fff', borderRadius: '4px', fontWeight: 600 }}>
                          Primary
                        </span>
                      )}
                      <div style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                          placeholder="Add caption..."
                          style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}
                          aria-label={`Caption for photo ${index + 1}`}
                        />
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                          {!photo.isPrimary && (
                            <button
                              onClick={() => setPrimaryPhoto(photo.id)}
                              style={{ flex: 1, padding: '4px', fontSize: '11px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor }}
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => removePhoto(photo.id)}
                            style={{ flex: 1, padding: '4px', fontSize: '11px', border: `1px solid ${errorColor}40`, borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent', color: errorColor }}
                            aria-label={`Remove photo ${index + 1}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Virtual Tour URL */}
              <div>
                <label style={labelStyle}>Virtual Tour URL</label>
                <input
                  type="url"
                  value={formData.virtualTourUrl}
                  onChange={(e) => updateField('virtualTourUrl', e.target.value)}
                  placeholder="https://example.com/virtual-tour"
                  style={errors.virtualTourUrl ? errorInputStyle : inputStyle}
                  aria-label="Virtual tour URL"
                />
                {errors.virtualTourUrl && <span style={{ fontSize: '12px', color: errorColor }}>{errors.virtualTourUrl}</span>}
              </div>

              {/* Video URL */}
              <div>
                <label style={labelStyle}>Video Tour URL</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  style={errors.videoUrl ? errorInputStyle : inputStyle}
                  aria-label="Video tour URL"
                />
                {errors.videoUrl && <span style={{ fontSize: '12px', color: errorColor }}>{errors.videoUrl}</span>}
              </div>

              {/* Floor Plan URL */}
              <div>
                <label style={labelStyle}>Floor Plan URL</label>
                <input
                  type="url"
                  value={formData.floorPlanUrl}
                  onChange={(e) => updateField('floorPlanUrl', e.target.value)}
                  placeholder="https://example.com/floor-plan.pdf"
                  style={inputStyle}
                  aria-label="Floor plan URL"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Pricing</h2>
            <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '24px' }}>Set your price and related financial details.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Price + Currency row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>
                    {formData.listingType === 'rent' ? 'Monthly Rent' : 'Asking Price'} *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    min="0" step="100" placeholder="0"
                    style={errors.price ? errorInputStyle : inputStyle}
                    aria-label="Price"
                  />
                  {errors.price && <span style={{ fontSize: '12px', color: errorColor }}>{errors.price}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    style={inputStyle}
                    aria-label="Currency"
                  >
                    {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Rental frequency (conditional) */}
              {formData.listingType === 'rent' && (
                <div>
                  <label style={labelStyle}>Rental Frequency</label>
                  <select
                    value={formData.rentalFrequency}
                    onChange={(e) => updateField('rentalFrequency', e.target.value)}
                    style={inputStyle}
                    aria-label="Rental frequency"
                  >
                    {FREQUENCY_OPTIONS.map(f => (
                      <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Negotiable */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={formData.priceNegotiable}
                  onChange={(e) => updateField('priceNegotiable', e.target.checked)}
                />
                Price is negotiable
              </label>

              {/* Security Deposit (rental only) */}
              {formData.listingType === 'rent' && (
                <div>
                  <label style={labelStyle}>Security Deposit *</label>
                  <input
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => updateField('securityDeposit', e.target.value)}
                    min="0" placeholder="0"
                    style={errors.securityDeposit ? errorInputStyle : inputStyle}
                    aria-label="Security deposit"
                  />
                  {errors.securityDeposit && <span style={{ fontSize: '12px', color: errorColor }}>{errors.securityDeposit}</span>}
                </div>
              )}

              {/* HOA Fees / Property Tax row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>HOA / Maintenance Fees ({formData.currency}/mo)</label>
                  <input
                    type="number"
                    value={formData.hoaFees}
                    onChange={(e) => updateField('hoaFees', e.target.value)}
                    min="0" placeholder="0"
                    style={inputStyle}
                    aria-label="HOA fees"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Annual Property Tax ({formData.currency})</label>
                  <input
                    type="number"
                    value={formData.propertyTax}
                    onChange={(e) => updateField('propertyTax', e.target.value)}
                    min="0" placeholder="0"
                    style={inputStyle}
                    aria-label="Property tax"
                  />
                </div>
              </div>

              {/* Estimated value comparison */}
              {estimatedValue && formData.price && (
                <div style={{ padding: '16px', backgroundColor: isDarkMode ? '#1a2332' : '#f0fdf4', borderRadius: '8px', border: `1px solid ${successColor}30` }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: textColor }}>Price Analysis</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: secondaryText }}>Your price:</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(formData.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: secondaryText }}>Estimated value:</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(estimatedValue, 'USD')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: secondaryText }}>Difference:</span>
                    <span style={{ fontWeight: 600, color: parseFloat(formData.price) > estimatedValue ? successColor : errorColor }}>
                      {parseFloat(formData.price) > estimatedValue ? '+' : ''}{formatCurrency(parseFloat(formData.price) - estimatedValue, 'USD')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Location & Contact</h2>
            <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '24px' }}>Provide the property location and your contact details.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Address */}
              <div>
                <label style={labelStyle}>Street Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="123 Main Street"
                  style={errors.address ? errorInputStyle : inputStyle}
                  aria-label="Street address"
                />
                {errors.address && <span style={{ fontSize: '12px', color: errorColor }}>{errors.address}</span>}
              </div>

              {/* Unit / City row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Unit/Apt #</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => updateField('unit', e.target.value)}
                    placeholder="Apt 4B"
                    style={inputStyle}
                    aria-label="Unit number"
                  />
                </div>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="San Francisco"
                    style={errors.city ? errorInputStyle : inputStyle}
                    aria-label="City"
                  />
                  {errors.city && <span style={{ fontSize: '12px', color: errorColor }}>{errors.city}</span>}
                </div>
              </div>

              {/* State / ZIP / Country row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="CA"
                    style={errors.state ? errorInputStyle : inputStyle}
                    aria-label="State"
                  />
                  {errors.state && <span style={{ fontSize: '12px', color: errorColor }}>{errors.state}</span>}
                </div>
                <div>
                  <label style={labelStyle}>ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    placeholder="94102"
                    style={errors.zipCode ? errorInputStyle : inputStyle}
                    aria-label="ZIP code"
                  />
                  {errors.zipCode && <span style={{ fontSize: '12px', color: errorColor }}>{errors.zipCode}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    style={inputStyle}
                    aria-label="Country"
                  />
                </div>
              </div>

              {/* Neighborhood */}
              <div>
                <label style={labelStyle}>Neighborhood</label>
                <select
                  value={formData.neighborhood}
                  onChange={(e) => updateField('neighborhood', e.target.value)}
                  style={inputStyle}
                  aria-label="Neighborhood"
                >
                  <option value="">Select neighborhood...</option>
                  {SAMPLE_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Lat / Lng row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Latitude</label>
                  <input
                    type="number"
                    value={formData.latitude}
                    onChange={(e) => updateField('latitude', e.target.value)}
                    step="0.0001" placeholder="37.7749"
                    style={inputStyle}
                    aria-label="Latitude"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Longitude</label>
                  <input
                    type="number"
                    value={formData.longitude}
                    onChange={(e) => updateField('longitude', e.target.value)}
                    step="0.0001" placeholder="-122.4194"
                    style={inputStyle}
                    aria-label="Longitude"
                  />
                </div>
              </div>

              {/* Nearby amenities */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Nearby Schools</label>
                  <input
                    type="text"
                    value={formData.nearbySchools}
                    onChange={(e) => updateField('nearbySchools', e.target.value)}
                    placeholder="Lincoln Elementary (0.3 mi)"
                    style={inputStyle}
                    aria-label="Nearby schools"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nearby Transport</label>
                  <input
                    type="text"
                    value={formData.nearbyTransport}
                    onChange={(e) => updateField('nearbyTransport', e.target.value)}
                    placeholder="BART Powell Station (0.2 mi)"
                    style={inputStyle}
                    aria-label="Nearby transport"
                  />
                </div>
              </div>

              {/* Show address toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={formData.showAddress}
                  onChange={(e) => updateField('showAddress', e.target.checked)}
                />
                Show exact address in listing
              </label>

              {/* Contact Info Section */}
              <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Contact Name *</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => updateField('contactName', e.target.value)}
                      placeholder="John Doe"
                      style={errors.contactName ? errorInputStyle : inputStyle}
                      aria-label="Contact name"
                    />
                    {errors.contactName && <span style={{ fontSize: '12px', color: errorColor }}>{errors.contactName}</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => updateField('contactEmail', e.target.value)}
                        placeholder="john@example.com"
                        style={errors.contactEmail ? errorInputStyle : inputStyle}
                        aria-label="Contact email"
                      />
                      {errors.contactEmail && <span style={{ fontSize: '12px', color: errorColor }}>{errors.contactEmail}</span>}
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => updateField('contactPhone', e.target.value)}
                        placeholder="(555) 123-4567"
                        style={inputStyle}
                        aria-label="Contact phone"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Review & Submit</h2>
            <p style={{ fontSize: '13px', color: secondaryText, marginBottom: '24px' }}>Review your listing before submitting.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Property Summary */}
              <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏠 Property Details
                  <button onClick={() => setCurrentStep(0)} style={{ fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  <div><span style={{ color: secondaryText }}>Title:</span> {formData.title || '—'}</div>
                  <div><span style={{ color: secondaryText }}>Type:</span> {formData.propertyType} ({formData.listingType === 'sale' ? 'For Sale' : 'For Rent'})</div>
                  {formData.propertyType !== 'land' && formData.propertyType !== 'commercial' && (
                    <div><span style={{ color: secondaryText }}>Bedrooms:</span> {formData.bedrooms || '—'}</div>
                  )}
                  {formData.propertyType !== 'land' && (
                    <div><span style={{ color: secondaryText }}>Bathrooms:</span> {formData.bathrooms || '—'}</div>
                  )}
                  <div><span style={{ color: secondaryText }}>Size:</span> {formData.squareFeet ? `${parseInt(formData.squareFeet).toLocaleString()} sq ft` : '—'}</div>
                  {formData.propertyType !== 'land' && (
                    <div><span style={{ color: secondaryText }}>Condition:</span> {formData.condition}</div>
                  )}
                  {formData.amenities.length > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: secondaryText }}>Amenities:</span> {formData.amenities.join(', ')}
                    </div>
                  )}
                </div>
                {formData.description && (
                  <div style={{ marginTop: '8px', fontSize: '13px' }}>
                    <span style={{ color: secondaryText }}>Description:</span>
                    <p style={{ margin: '4px 0 0', lineHeight: 1.5 }}>{formData.description}</p>
                  </div>
                )}
              </div>

              {/* Media Summary */}
              <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📷 Photos & Media
                  <button onClick={() => setCurrentStep(1)} style={{ fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                </h3>
                <div style={{ fontSize: '13px' }}>
                  <div><span style={{ color: secondaryText }}>Photos:</span> {formData.photos.length} uploaded</div>
                  {formData.virtualTourUrl && <div><span style={{ color: secondaryText }}>Virtual Tour:</span> ✓ Provided</div>}
                  {formData.videoUrl && <div><span style={{ color: secondaryText }}>Video:</span> ✓ Provided</div>}
                  {formData.floorPlanUrl && <div><span style={{ color: secondaryText }}>Floor Plan:</span> ✓ Provided</div>}
                </div>
              </div>

              {/* Pricing Summary */}
              <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💰 Pricing
                  <button onClick={() => setCurrentStep(2)} style={{ fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                </h3>
                <div style={{ fontSize: '13px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: accentColor, marginBottom: '8px' }}>
                    {formData.price ? formatCurrency(formData.price) : '—'}
                    {formData.listingType === 'rent' && <span style={{ fontSize: '13px', fontWeight: 400, color: secondaryText }}> /{formData.rentalFrequency}</span>}
                  </div>
                  {formData.priceNegotiable && <div style={{ color: successColor }}>✓ Price is negotiable</div>}
                  {formData.securityDeposit && <div><span style={{ color: secondaryText }}>Security Deposit:</span> {formatCurrency(formData.securityDeposit)}</div>}
                  {formData.hoaFees && <div><span style={{ color: secondaryText }}>HOA Fees:</span> {formatCurrency(formData.hoaFees)}/mo</div>}
                  {formData.propertyTax && <div><span style={{ color: secondaryText }}>Property Tax:</span> {formatCurrency(formData.propertyTax)}/yr</div>}
                </div>
              </div>

              {/* Location Summary */}
              <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📍 Location
                  <button onClick={() => setCurrentStep(3)} style={{ fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                </h3>
                <div style={{ fontSize: '13px' }}>
                  <div>{formData.address}{formData.unit ? `, ${formData.unit}` : ''}</div>
                  <div>{formData.city}{formData.state ? `, ${formData.state}` : ''} {formData.zipCode}</div>
                  <div>{formData.country}</div>
                  {formData.neighborhood && <div style={{ marginTop: '4px' }}><span style={{ color: secondaryText }}>Neighborhood:</span> {formData.neighborhood}</div>}
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${borderColor}` }}>
                    <div><span style={{ color: secondaryText }}>Contact:</span> {formData.contactName}</div>
                    <div><span style={{ color: secondaryText }}>Email:</span> {formData.contactEmail}</div>
                    {formData.contactPhone && <div><span style={{ color: secondaryText }}>Phone:</span> {formData.contactPhone}</div>}
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div style={{ backgroundColor: isDarkMode ? '#1a2332' : '#fffbeb', borderRadius: '8px', padding: '16px', border: `1px solid ${errors.acceptTerms ? errorColor : '#fbbf2440'}` }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => updateField('acceptTerms', e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    I confirm that all information provided is accurate and I am authorized to create this listing. I agree to the <span style={{ color: accentColor, textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: accentColor, textDecoration: 'underline' }}>Privacy Policy</span>.
                  </span>
                </label>
                {errors.acceptTerms && <span style={{ fontSize: '12px', color: errorColor, marginTop: '6px', display: 'block', marginLeft: '26px' }}>{errors.acceptTerms}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: `1px solid ${borderColor}` }}>
          <button
            onClick={goBack}
            disabled={currentStep === 0}
            style={{
              padding: '10px 24px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px', backgroundColor: 'transparent', color: currentStep === 0 ? secondaryText : textColor, opacity: currentStep === 0 ? 0.5 : 1,
            }}
          >
            ← Previous
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                style={{ padding: '10px 28px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  padding: '10px 28px', backgroundColor: isSubmitting ? secondaryText : successColor, color: '#fff',
                  border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600,
                }}
              >
                {isSubmitting ? 'Submitting...' : '✓ Submit Listing'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {photoPreview && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setPhotoPreview(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '24px', maxWidth: '600px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{photoPreview.name}</h3>
              <button onClick={() => setPhotoPreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div style={{ height: '300px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
              🖼️
            </div>
            {photoPreview.caption && (
              <p style={{ fontSize: '13px', color: secondaryText, marginTop: '12px', textAlign: 'center' }}>{photoPreview.caption}</p>
            )}
            <div style={{ fontSize: '12px', color: secondaryText, marginTop: '8px', textAlign: 'center' }}>
              Added {formatDate(photoPreview.addedAt)}
              {photoPreview.isPrimary && <span style={{ marginLeft: '8px', color: accentColor, fontWeight: 600 }}>★ Primary Photo</span>}
            </div>
          </div>
        </div>
      )}

      {/* Draft Restore Modal */}
      {showDraftModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>📋</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, textAlign: 'center', margin: '0 0 8px' }}>Resume Draft?</h3>
            <p style={{ fontSize: '13px', color: secondaryText, textAlign: 'center', marginBottom: '20px' }}>
              You have an unsaved draft from a previous session. Would you like to continue where you left off?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={loadDraft}
                style={{ flex: 1, padding: '10px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Resume Draft
              </button>
              <button
                onClick={discardDraft}
                style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, textAlign: 'center', margin: '0 0 8px' }}>Discard Listing?</h3>
            <p style={{ fontSize: '13px', color: secondaryText, textAlign: 'center', marginBottom: '20px' }}>
              All progress will be lost. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowDiscardModal(false)}
                style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backgroundColor: 'transparent', color: textColor }}
              >
                Cancel
              </button>
              <button
                onClick={resetForm}
                style={{ flex: 1, padding: '10px', backgroundColor: errorColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Side Panel */}
      {showPreviewPanel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 2000 }} onClick={() => setShowPreviewPanel(false)}>
          <div style={{ backgroundColor: cardBg, width: '480px', height: '100%', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>👁️ Listing Preview</h2>
              <button onClick={() => setShowPreviewPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>

            {/* Preview Card */}
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '200px', backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                {formData.photos.length > 0 ? '🖼️' : '📷'}
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: formData.listingType === 'sale' ? accentColor + '20' : successColor + '20', color: formData.listingType === 'sale' ? accentColor : successColor, borderRadius: '4px', fontWeight: 600 }}>
                      For {formData.listingType === 'sale' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: accentColor }}>
                    {formData.price ? formatCurrency(formData.price) : '—'}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '8px 0 4px' }}>{formData.title || 'Untitled Listing'}</h3>
                <div style={{ fontSize: '13px', color: secondaryText, marginBottom: '8px' }}>
                  {[formData.address, formData.city, formData.state].filter(Boolean).join(', ') || 'Location not specified'}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: secondaryText, marginBottom: '12px' }}>
                  {formData.bedrooms && <span>🛏️ {formData.bedrooms} bed</span>}
                  {formData.bathrooms && <span>🚿 {formData.bathrooms} bath</span>}
                  {formData.squareFeet && <span>📐 {parseInt(formData.squareFeet).toLocaleString()} sqft</span>}
                </div>
                {formData.description && (
                  <p style={{ fontSize: '13px', color: secondaryText, margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {formData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Completeness checklist */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Listing Completeness</h4>
              {[
                { label: 'Title & Description', done: formData.title.length >= 10 && formData.description.length >= 30 },
                { label: 'Property details', done: !!formData.bedrooms || formData.propertyType === 'land' },
                { label: 'At least one photo', done: formData.photos.length > 0 },
                { label: 'Price set', done: !!formData.price },
                { label: 'Address provided', done: !!formData.address && !!formData.city },
                { label: 'Contact info', done: !!formData.contactName && !!formData.contactEmail },
                { label: 'Terms accepted', done: formData.acceptTerms },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px' }}>
                  <span style={{ color: item.done ? successColor : secondaryText }}>{item.done ? '✓' : '○'}</span>
                  <span style={{ color: item.done ? textColor : secondaryText }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
