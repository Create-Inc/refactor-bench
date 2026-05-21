import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const EVENT_TYPES = [
  { id: 'conference', label: 'Conference', basePrice: 299, maxAttendees: 10, hasMeals: true, hasWorkshops: true },
  { id: 'workshop', label: 'Workshop', basePrice: 149, maxAttendees: 5, hasMeals: false, hasWorkshops: false },
  { id: 'webinar', label: 'Webinar', basePrice: 49, maxAttendees: 3, hasMeals: false, hasWorkshops: false },
  { id: 'gala', label: 'Gala Dinner', basePrice: 199, maxAttendees: 8, hasMeals: true, hasWorkshops: false },
  { id: 'hackathon', label: 'Hackathon', basePrice: 99, maxAttendees: 6, hasMeals: true, hasWorkshops: true },
];

const MEAL_OPTIONS = [
  { id: 'standard', label: 'Standard', price: 0, description: 'Regular meal service' },
  { id: 'vegetarian', label: 'Vegetarian', price: 0, description: 'Plant-based options' },
  { id: 'vegan', label: 'Vegan', price: 5, description: 'Fully vegan menu' },
  { id: 'gluten_free', label: 'Gluten Free', price: 10, description: 'Gluten-free alternatives' },
  { id: 'halal', label: 'Halal', price: 5, description: 'Halal certified meals' },
  { id: 'kosher', label: 'Kosher', price: 10, description: 'Kosher certified meals' },
];

const WORKSHOP_SESSIONS = [
  { id: 'ws1', title: 'Advanced React Patterns', time: '10:00 AM', duration: '2h', capacity: 30, enrolled: 22, track: 'frontend' },
  { id: 'ws2', title: 'System Design at Scale', time: '10:00 AM', duration: '2h', capacity: 25, enrolled: 25, track: 'backend' },
  { id: 'ws3', title: 'GraphQL Deep Dive', time: '1:00 PM', duration: '2h', capacity: 30, enrolled: 18, track: 'backend' },
  { id: 'ws4', title: 'CSS Architecture', time: '1:00 PM', duration: '1.5h', capacity: 35, enrolled: 30, track: 'frontend' },
  { id: 'ws5', title: 'DevOps Pipelines', time: '3:00 PM', duration: '2h', capacity: 20, enrolled: 12, track: 'devops' },
  { id: 'ws6', title: 'AI/ML for Developers', time: '3:00 PM', duration: '2h', capacity: 40, enrolled: 38, track: 'ai' },
];

const DISCOUNT_CODES = {
  EARLY2025: { percent: 20, minAttendees: 1, description: 'Early bird 20% off' },
  GROUP5: { percent: 15, minAttendees: 5, description: '15% off for groups of 5+' },
  STUDENT: { percent: 30, minAttendees: 1, description: 'Student discount 30%' },
  VIP2025: { flat: 50, minAttendees: 1, description: '$50 off per registration' },
  TEAM10: { percent: 25, minAttendees: 10, description: '25% off for teams of 10+' },
};

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'Other'];

const T_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const STEPS = [
  { id: 'event', label: 'Event Selection', icon: '📋' },
  { id: 'attendees', label: 'Attendees', icon: '👥' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'payment', label: 'Payment', icon: '💳' },
  { id: 'review', label: 'Review & Submit', icon: '✅' },
];

const EMPTY_ATTENDEE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  dietaryRestrictions: '',
  accessibilityNeeds: '',
  tshirtSize: 'M',
  emergencyContactName: '',
  emergencyContactPhone: '',
  country: 'United States',
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\+?[\d\s\-()]{7,}$/.test(phone);

export default function EventRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [customEventDate, setCustomEventDate] = useState('');
  const [attendees, setAttendees] = useState([{ ...EMPTY_ATTENDEE }]);
  const [selectedMealOption, setSelectedMealOption] = useState('standard');
  const [selectedWorkshops, setSelectedWorkshops] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [billingName, setBillingName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCountry, setBillingCountry] = useState('United States');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [expandedAttendee, setExpandedAttendee] = useState(0);
  const [showDiscountInfo, setShowDiscountInfo] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [teamName, setTeamName] = useState('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [workshopTrackFilter, setWorkshopTrackFilter] = useState('all');
  const formRef = useRef(null);
  const topRef = useRef(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem('eventRegistrationDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.selectedEventType) setSelectedEventType(draft.selectedEventType);
        if (draft.customEventDate) setCustomEventDate(draft.customEventDate);
        if (draft.attendees?.length) setAttendees(draft.attendees);
        if (draft.selectedMealOption) setSelectedMealOption(draft.selectedMealOption);
        if (draft.selectedWorkshops) setSelectedWorkshops(draft.selectedWorkshops);
        if (draft.teamName) setTeamName(draft.teamName);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
      } catch (e) {
        console.error('Failed to load draft');
      }
    }
  }, []);

  useEffect(() => {
    const draft = {
      selectedEventType,
      customEventDate,
      attendees,
      selectedMealOption,
      selectedWorkshops,
      teamName,
      currentStep,
    };
    localStorage.setItem('eventRegistrationDraft', JSON.stringify(draft));
  }, [selectedEventType, customEventDate, attendees, selectedMealOption, selectedWorkshops, teamName, currentStep]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted && (selectedEventType || attendees[0].firstName)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitted, selectedEventType, attendees]);

  const saveDraft = useCallback(() => {
    setShowDraftSaved(true);
    setTimeout(() => setShowDraftSaved(false), 2000);
  }, []);

  const eventConfig = useMemo(() => EVENT_TYPES.find(e => e.id === selectedEventType), [selectedEventType]);

  const calculateSubtotal = useCallback(() => {
    if (!eventConfig) return 0;
    let subtotal = eventConfig.basePrice * attendees.length;
    if (eventConfig.hasMeals) {
      const mealOption = MEAL_OPTIONS.find(m => m.id === selectedMealOption);
      subtotal += (mealOption?.price || 0) * attendees.length;
    }
    if (eventConfig.hasWorkshops) {
      subtotal += selectedWorkshops.length * 25 * attendees.length;
    }
    return subtotal;
  }, [eventConfig, attendees.length, selectedMealOption, selectedWorkshops.length]);

  const calculateDiscount = useCallback(() => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateSubtotal();
    if (appliedDiscount.percent) {
      return Math.round(subtotal * appliedDiscount.percent / 100);
    }
    if (appliedDiscount.flat) {
      return appliedDiscount.flat * attendees.length;
    }
    return 0;
  }, [appliedDiscount, calculateSubtotal, attendees.length]);

  const calculateTax = useCallback(() => {
    const taxable = calculateSubtotal() - calculateDiscount();
    return Math.round(taxable * 0.08 * 100) / 100;
  }, [calculateSubtotal, calculateDiscount]);

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  }, [calculateSubtotal, calculateDiscount, calculateTax]);

  const applyDiscountCode = () => {
    const code = discountCode.trim().toUpperCase();
    const discount = DISCOUNT_CODES[code];
    if (!discount) {
      setDiscountError('Invalid discount code');
      setAppliedDiscount(null);
      return;
    }
    if (attendees.length < discount.minAttendees) {
      setDiscountError(`This code requires at least ${discount.minAttendees} attendees`);
      setAppliedDiscount(null);
      return;
    }
    setAppliedDiscount(discount);
    setDiscountError('');
  };

  const removeDiscountCode = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const addAttendee = () => {
    if (eventConfig && attendees.length < eventConfig.maxAttendees) {
      setAttendees(prev => [...prev, { ...EMPTY_ATTENDEE }]);
      setExpandedAttendee(attendees.length);
    }
  };

  const removeAttendee = (index) => {
    if (attendees.length > 1) {
      setAttendees(prev => prev.filter((_, i) => i !== index));
      if (expandedAttendee >= attendees.length - 1) {
        setExpandedAttendee(Math.max(0, attendees.length - 2));
      }
    }
  };

  const updateAttendee = (index, field, value) => {
    setAttendees(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
    if (errors[`attendee_${index}_${field}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`attendee_${index}_${field}`];
        return next;
      });
    }
  };

  const duplicateAttendee = (index) => {
    if (eventConfig && attendees.length < eventConfig.maxAttendees) {
      const source = attendees[index];
      const duplicate = { ...source, firstName: '', lastName: '', email: '', phone: '' };
      setAttendees(prev => [...prev.slice(0, index + 1), duplicate, ...prev.slice(index + 1)]);
      setExpandedAttendee(index + 1);
    }
  };

  const toggleWorkshop = (workshopId) => {
    setSelectedWorkshops(prev => {
      if (prev.includes(workshopId)) {
        return prev.filter(id => id !== workshopId);
      }
      const workshop = WORKSHOP_SESSIONS.find(w => w.id === workshopId);
      const conflicting = prev.find(id => {
        const selected = WORKSHOP_SESSIONS.find(w => w.id === id);
        return selected && selected.time === workshop.time;
      });
      if (conflicting) {
        return [...prev.filter(id => id !== conflicting), workshopId];
      }
      return [...prev, workshopId];
    });
  };

  const filteredWorkshops = useMemo(() => {
    if (workshopTrackFilter === 'all') return WORKSHOP_SESSIONS;
    return WORKSHOP_SESSIONS.filter(w => w.track === workshopTrackFilter);
  }, [workshopTrackFilter]);

  const workshopTracks = useMemo(() => {
    return [...new Set(WORKSHOP_SESSIONS.map(w => w.track))];
  }, []);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!selectedEventType) newErrors.eventType = 'Please select an event type';
      if (!customEventDate) newErrors.eventDate = 'Please select a date';
      else {
        const selectedDate = new Date(customEventDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) newErrors.eventDate = 'Date must be in the future';
      }
    }

    if (step === 1) {
      attendees.forEach((attendee, index) => {
        if (!attendee.firstName.trim()) newErrors[`attendee_${index}_firstName`] = 'First name is required';
        if (!attendee.lastName.trim()) newErrors[`attendee_${index}_lastName`] = 'Last name is required';
        if (!attendee.email.trim()) newErrors[`attendee_${index}_email`] = 'Email is required';
        else if (!validateEmail(attendee.email)) newErrors[`attendee_${index}_email`] = 'Invalid email format';
        if (attendee.phone && !validatePhone(attendee.phone)) newErrors[`attendee_${index}_phone`] = 'Invalid phone format';
        if (!attendee.emergencyContactName.trim()) newErrors[`attendee_${index}_emergencyContactName`] = 'Emergency contact name is required';
        if (!attendee.emergencyContactPhone.trim()) newErrors[`attendee_${index}_emergencyContactPhone`] = 'Emergency contact phone is required';
        else if (!validatePhone(attendee.emergencyContactPhone)) newErrors[`attendee_${index}_emergencyContactPhone`] = 'Invalid phone format';
      });

      const emails = attendees.map(a => a.email.toLowerCase()).filter(Boolean);
      const duplicateEmails = emails.filter((e, i) => emails.indexOf(e) !== i);
      if (duplicateEmails.length > 0) {
        attendees.forEach((a, i) => {
          if (duplicateEmails.includes(a.email.toLowerCase())) {
            newErrors[`attendee_${i}_email`] = 'Duplicate email address';
          }
        });
      }
    }

    if (step === 3) {
      if (paymentMethod === 'credit_card') {
        if (!cardNumber.replace(/\s/g, '')) newErrors.cardNumber = 'Card number is required';
        else if (cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Card number must be 16 digits';
        if (!cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
        else {
          const [month, year] = cardExpiry.split('/');
          if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) newErrors.cardExpiry = 'Invalid expiry format (MM/YY)';
        }
        if (!cardCvc) newErrors.cardCvc = 'CVC is required';
        else if (cardCvc.length < 3) newErrors.cardCvc = 'CVC must be 3-4 digits';
      }
      if (paymentMethod === 'purchase_order' && !purchaseOrderNumber.trim()) {
        newErrors.purchaseOrderNumber = 'Purchase order number is required';
      }
      if (!billingName.trim()) newErrors.billingName = 'Billing name is required';
      if (!billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
      if (!billingCity.trim()) newErrors.billingCity = 'City is required';
      if (!billingZip.trim()) newErrors.billingZip = 'ZIP/Postal code is required';
    }

    if (step === 4) {
      if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
      if (!agreePrivacy) newErrors.agreePrivacy = 'You must agree to the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    for (let i = currentStep; i < step; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        return;
      }
    }
    setCurrentStep(step);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const id = 'REG-' + Date.now().toString(36).toUpperCase();
    setRegistrationId(id);
    setIsProcessing(false);
    setSubmitted(true);
    localStorage.removeItem('eventRegistrationDraft');
  };

  const handleNewRegistration = () => {
    setCurrentStep(0);
    setSelectedEventType(null);
    setCustomEventDate('');
    setAttendees([{ ...EMPTY_ATTENDEE }]);
    setSelectedMealOption('standard');
    setSelectedWorkshops([]);
    setDiscountCode('');
    setAppliedDiscount(null);
    setDiscountError('');
    setPaymentMethod('credit_card');
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setBillingName('');
    setBillingAddress('');
    setBillingCity('');
    setBillingState('');
    setBillingZip('');
    setBillingCountry('United States');
    setAgreeTerms(false);
    setAgreePrivacy(false);
    setNewsletterOptIn(false);
    setErrors({});
    setSubmitted(false);
    setShowDraftSaved(false);
    setRegistrationId(null);
    setIsProcessing(false);
    setSpecialRequests('');
    setTeamName('');
    setPurchaseOrderNumber('');
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const getProgressPercent = () => {
    return Math.round(((currentStep + 1) / STEPS.length) * 100);
  };

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '48px', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Registration Complete!</h1>
          <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '24px' }}>Your registration has been submitted successfully.</p>
          <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Registration ID</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#166534', fontFamily: 'monospace' }} data-testid="registration-id">{registrationId}</div>
          </div>
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Summary</h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Event</span>
                <span style={{ fontWeight: 500 }}>{eventConfig?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Date</span>
                <span style={{ fontWeight: 500 }}>{customEventDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Attendees</span>
                <span style={{ fontWeight: 500 }}>{attendees.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                <span style={{ fontWeight: 600 }}>Total Paid</span>
                <span style={{ fontWeight: 700, color: '#166534' }}>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>A confirmation email has been sent to {attendees[0].email}.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => window.print()} style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#fff', color: '#374151' }}>
              🖨️ Print Confirmation
            </button>
            <button onClick={handleNewRegistration} style={{ padding: '10px 24px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
              New Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1e40af', color: '#fff', padding: '20px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>🎪 Event Registration</h1>
            <p style={{ fontSize: '13px', opacity: 0.8, margin: '4px 0 0' }}>Complete all steps to register for your event</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {showDraftSaved && (
              <span style={{ fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px' }}>✓ Draft saved</span>
            )}
            <button onClick={saveDraft} style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              💾 Save Draft
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: index <= currentStep ? 'pointer' : 'default',
                  opacity: index <= currentStep ? 1 : 0.4,
                  padding: '4px',
                }}
                disabled={index > currentStep + 1}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  backgroundColor: getStepStatus(index) === 'completed' ? '#16a34a' : getStepStatus(index) === 'active' ? '#1e40af' : '#e5e7eb',
                  color: getStepStatus(index) === 'pending' ? '#6b7280' : '#fff',
                  fontWeight: 600,
                }}>
                  {getStepStatus(index) === 'completed' ? '✓' : step.icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: getStepStatus(index) === 'active' ? 600 : 400, color: getStepStatus(index) === 'active' ? '#1e40af' : '#6b7280' }}>
                  {step.label}
                </span>
              </button>
            ))}
          </div>
          <div style={{ height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${getProgressPercent()}%`, height: '100%', backgroundColor: '#1e40af', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', textAlign: 'right' }}>{getProgressPercent()}% complete</div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={formRef} style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          {/* Step 0: Event Selection */}
          {currentStep === 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Select Your Event</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Choose the event type and date for your registration.</p>

              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {EVENT_TYPES.map(event => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEventType(event.id);
                      if (errors.eventType) setErrors(prev => { const n = { ...prev }; delete n.eventType; return n; });
                    }}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: `2px solid ${selectedEventType === event.id ? '#1e40af' : '#e5e7eb'}`,
                      backgroundColor: selectedEventType === event.id ? '#eff6ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    data-testid={`event-type-${event.id}`}
                    role="button"
                    aria-pressed={selectedEventType === event.id}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{event.label}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        Max {event.maxAttendees} attendees
                        {event.hasMeals && ' • Meals included'}
                        {event.hasWorkshops && ' • Workshops available'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e40af' }}>${event.basePrice}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>per person</div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.eventType && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }} role="alert">{errors.eventType}</div>}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Event Date *</label>
                <input
                  type="date"
                  value={customEventDate}
                  onChange={(e) => {
                    setCustomEventDate(e.target.value);
                    if (errors.eventDate) setErrors(prev => { const n = { ...prev }; delete n.eventDate; return n; });
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors.eventDate ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  aria-label="Event date"
                />
                {errors.eventDate && <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px' }} role="alert">{errors.eventDate}</div>}
              </div>

              {attendees.length > 2 && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Team Name (optional)</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team or group name"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    aria-label="Team name"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 1: Attendees */}
          {currentStep === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Attendee Details</h2>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                    {attendees.length} of {eventConfig?.maxAttendees} attendees added
                  </p>
                </div>
                <button
                  onClick={addAttendee}
                  disabled={attendees.length >= (eventConfig?.maxAttendees || 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: attendees.length >= (eventConfig?.maxAttendees || 1) ? '#e5e7eb' : '#1e40af',
                    color: attendees.length >= (eventConfig?.maxAttendees || 1) ? '#9ca3af' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: attendees.length >= (eventConfig?.maxAttendees || 1) ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  + Add Attendee
                </button>
              </div>

              {attendees.map((attendee, index) => (
                <div key={index} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '12px', overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpandedAttendee(expandedAttendee === index ? -1 : index)}
                    style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: expandedAttendee === index ? '#f8fafc' : '#fff' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px' }}>👤</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {attendee.firstName && attendee.lastName
                            ? `${attendee.firstName} ${attendee.lastName}`
                            : `Attendee ${index + 1}`}
                        </div>
                        {attendee.email && <div style={{ fontSize: '12px', color: '#6b7280' }}>{attendee.email}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {index > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); removeAttendee(index); }} style={{ padding: '4px 10px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                          Remove
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); duplicateAttendee(index); }} disabled={attendees.length >= (eventConfig?.maxAttendees || 1)} style={{ padding: '4px 10px', backgroundColor: '#f0f9ff', color: '#1e40af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        Duplicate
                      </button>
                      <span style={{ fontSize: '14px', transform: expandedAttendee === index ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                    </div>
                  </div>

                  {expandedAttendee === index && (
                    <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>First Name *</label>
                          <input
                            value={attendee.firstName}
                            onChange={(e) => updateAttendee(index, 'firstName', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors[`attendee_${index}_firstName`] ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            placeholder="First name"
                            aria-label={`Attendee ${index + 1} first name`}
                          />
                          {errors[`attendee_${index}_firstName`] && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors[`attendee_${index}_firstName`]}</div>}
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>Last Name *</label>
                          <input
                            value={attendee.lastName}
                            onChange={(e) => updateAttendee(index, 'lastName', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors[`attendee_${index}_lastName`] ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            placeholder="Last name"
                            aria-label={`Attendee ${index + 1} last name`}
                          />
                          {errors[`attendee_${index}_lastName`] && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors[`attendee_${index}_lastName`]}</div>}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>Email *</label>
                          <input
                            type="email"
                            value={attendee.email}
                            onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors[`attendee_${index}_email`] ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            placeholder="email@example.com"
                            aria-label={`Attendee ${index + 1} email`}
                          />
                          {errors[`attendee_${index}_email`] && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors[`attendee_${index}_email`]}</div>}
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>Phone</label>
                          <input
                            type="tel"
                            value={attendee.phone}
                            onChange={(e) => updateAttendee(index, 'phone', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors[`attendee_${index}_phone`] ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            placeholder="+1 (555) 000-0000"
                            aria-label={`Attendee ${index + 1} phone`}
                          />
                          {errors[`attendee_${index}_phone`] && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors[`attendee_${index}_phone`]}</div>}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>Company</label>
                          <input
                            value={attendee.company}
                            onChange={(e) => updateAttendee(index, 'company', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            placeholder="Company name"
                            aria-label={`Attendee ${index + 1} company`}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>Job Title</label>
                          <input
                            value={attendee.jobTitle}
                            onChange={(e) => updateAttendee(index, 'jobTitle', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            placeholder="Job title"
                            aria-label={`Attendee ${index + 1} job title`}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>Country</label>
                          <select
                            value={attendee.country}
                            onChange={(e) => updateAttendee(index, 'country', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            aria-label={`Attendee ${index + 1} country`}
                          >
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>T-Shirt Size</label>
                          <select
                            value={attendee.tshirtSize}
                            onChange={(e) => updateAttendee(index, 'tshirtSize', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            aria-label={`Attendee ${index + 1} t-shirt size`}
                          >
                            {T_SHIRT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>Dietary Restrictions</label>
                        <input
                          value={attendee.dietaryRestrictions}
                          onChange={(e) => updateAttendee(index, 'dietaryRestrictions', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                          placeholder="Any allergies or dietary needs"
                          aria-label={`Attendee ${index + 1} dietary restrictions`}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }}>Accessibility Needs</label>
                        <input
                          value={attendee.accessibilityNeeds}
                          onChange={(e) => updateAttendee(index, 'accessibilityNeeds', e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                          placeholder="Wheelchair access, hearing assistance, etc."
                          aria-label={`Attendee ${index + 1} accessibility needs`}
                        />
                      </div>

                      <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '12px 16px', marginBottom: '0' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: '#92400e' }}>Emergency Contact *</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <input
                              value={attendee.emergencyContactName}
                              onChange={(e) => updateAttendee(index, 'emergencyContactName', e.target.value)}
                              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors[`attendee_${index}_emergencyContactName`] ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                              placeholder="Contact name"
                              aria-label={`Attendee ${index + 1} emergency contact name`}
                            />
                            {errors[`attendee_${index}_emergencyContactName`] && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors[`attendee_${index}_emergencyContactName`]}</div>}
                          </div>
                          <div>
                            <input
                              value={attendee.emergencyContactPhone}
                              onChange={(e) => updateAttendee(index, 'emergencyContactPhone', e.target.value)}
                              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors[`attendee_${index}_emergencyContactPhone`] ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                              placeholder="Contact phone"
                              aria-label={`Attendee ${index + 1} emergency contact phone`}
                            />
                            {errors[`attendee_${index}_emergencyContactPhone`] && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors[`attendee_${index}_emergencyContactPhone`]}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Preferences</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Customize your event experience.</p>

              {eventConfig?.hasMeals && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>🍽️ Meal Selection</h3>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {MEAL_OPTIONS.map(meal => (
                      <label
                        key={meal.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: `1px solid ${selectedMealOption === meal.id ? '#1e40af' : '#e5e7eb'}`,
                          backgroundColor: selectedMealOption === meal.id ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="mealOption"
                          value={meal.id}
                          checked={selectedMealOption === meal.id}
                          onChange={(e) => setSelectedMealOption(e.target.value)}
                          style={{ accentColor: '#1e40af' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{meal.label}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{meal.description}</div>
                        </div>
                        {meal.price > 0 && (
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>+${meal.price}/person</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {eventConfig?.hasWorkshops && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>📚 Workshop Sessions</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Select workshops to attend. Sessions at the same time will auto-swap. $25 per workshop per attendee.</p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setWorkshopTrackFilter('all')}
                      style={{
                        padding: '4px 12px', borderRadius: '20px', border: 'none', fontSize: '12px', cursor: 'pointer',
                        backgroundColor: workshopTrackFilter === 'all' ? '#1e40af' : '#e5e7eb',
                        color: workshopTrackFilter === 'all' ? '#fff' : '#374151',
                      }}
                    >
                      All Tracks
                    </button>
                    {workshopTracks.map(track => (
                      <button
                        key={track}
                        onClick={() => setWorkshopTrackFilter(track)}
                        style={{
                          padding: '4px 12px', borderRadius: '20px', border: 'none', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize',
                          backgroundColor: workshopTrackFilter === track ? '#1e40af' : '#e5e7eb',
                          color: workshopTrackFilter === track ? '#fff' : '#374151',
                        }}
                      >
                        {track}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {filteredWorkshops.map(ws => {
                      const isFull = ws.enrolled >= ws.capacity && !selectedWorkshops.includes(ws.id);
                      const isSelected = selectedWorkshops.includes(ws.id);
                      return (
                        <div
                          key={ws.id}
                          onClick={() => !isFull && toggleWorkshop(ws.id)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '8px',
                            border: `1px solid ${isSelected ? '#1e40af' : '#e5e7eb'}`,
                            backgroundColor: isSelected ? '#eff6ff' : isFull ? '#f9fafb' : '#fff',
                            cursor: isFull ? 'not-allowed' : 'pointer',
                            opacity: isFull ? 0.6 : 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          role="button"
                          aria-pressed={isSelected}
                          data-testid={`workshop-${ws.id}`}
                        >
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>{ws.title}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {ws.time} • {ws.duration} • <span style={{ textTransform: 'capitalize' }}>{ws.track}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: isFull ? '#dc2626' : '#6b7280' }}>
                              {ws.enrolled}/{ws.capacity} enrolled
                            </div>
                            {isFull && <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>FULL</div>}
                            {isSelected && <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>SELECTED</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>📝 Special Requests</h3>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                  placeholder="Any special accommodations or requests..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
                  aria-label="Special requests"
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{specialRequests.length}/500 characters</div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Payment Details</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Complete your payment information.</p>

              {/* Discount Code */}
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>🏷️ Discount Code</h3>
                  <button onClick={() => setShowDiscountInfo(!showDiscountInfo)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1e40af' }}>
                    {showDiscountInfo ? 'Hide info' : 'View codes'}
                  </button>
                </div>

                {showDiscountInfo && (
                  <div style={{ backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '12px', marginBottom: '12px', fontSize: '12px' }}>
                    {Object.entries(DISCOUNT_CODES).map(([code, info]) => (
                      <div key={code} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{code}</span>
                        <span style={{ color: '#6b7280' }}>{info.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {appliedDiscount ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div>
                      <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '14px' }}>✓ {discountCode.toUpperCase()}</span>
                      <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '8px' }}>{appliedDiscount.description}</span>
                    </div>
                    <button onClick={removeDiscountCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '13px' }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter code"
                      style={{ flex: 1, padding: '8px 12px', border: `1px solid ${discountError ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px' }}
                      aria-label="Discount code"
                    />
                    <button onClick={applyDiscountCode} style={{ padding: '8px 16px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      Apply
                    </button>
                  </div>
                )}
                {discountError && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }} role="alert">{discountError}</div>}
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Payment Method</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { id: 'credit_card', label: '💳 Credit Card' },
                    { id: 'paypal', label: '🅿️ PayPal' },
                    { id: 'purchase_order', label: '📄 Purchase Order' },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: `1px solid ${paymentMethod === method.id ? '#1e40af' : '#e5e7eb'}`,
                        backgroundColor: paymentMethod === method.id ? '#eff6ff' : '#fff',
                        color: paymentMethod === method.id ? '#1e40af' : '#374151',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: paymentMethod === method.id ? 600 : 400,
                      }}
                      data-testid={`payment-${method.id}`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'credit_card' && (
                  <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Card Number *</label>
                      <input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors.cardNumber ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '16px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                        aria-label="Card number"
                      />
                      {errors.cardNumber && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors.cardNumber}</div>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Expiry *</label>
                        <input
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors.cardExpiry ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                          aria-label="Card expiry"
                        />
                        {errors.cardExpiry && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors.cardExpiry}</div>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>CVC *</label>
                        <input
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          maxLength={4}
                          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors.cardCvc ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                          aria-label="Card CVC"
                        />
                        {errors.cardCvc && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors.cardCvc}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>You will be redirected to PayPal after clicking Submit.</p>
                  </div>
                )}

                {paymentMethod === 'purchase_order' && (
                  <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Purchase Order Number *</label>
                    <input
                      value={purchaseOrderNumber}
                      onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                      placeholder="PO-12345"
                      style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors.purchaseOrderNumber ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                      aria-label="Purchase order number"
                    />
                    {errors.purchaseOrderNumber && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors.purchaseOrderNumber}</div>}
                  </div>
                )}
              </div>

              {/* Billing Address */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Billing Address</h3>
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Full Name *</label>
                    <input value={billingName} onChange={(e) => setBillingName(e.target.value)} placeholder="Name on card" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors.billingName ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} aria-label="Billing name" />
                    {errors.billingName && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors.billingName}</div>}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Address *</label>
                    <input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Street address" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors.billingAddress ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} aria-label="Billing address" />
                    {errors.billingAddress && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors.billingAddress}</div>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>City *</label>
                      <input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} placeholder="City" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors.billingCity ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} aria-label="Billing city" />
                      {errors.billingCity && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors.billingCity}</div>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>State</label>
                      <input value={billingState} onChange={(e) => setBillingState(e.target.value)} placeholder="State" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} aria-label="Billing state" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>ZIP *</label>
                      <input value={billingZip} onChange={(e) => setBillingZip(e.target.value)} placeholder="ZIP" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${errors.billingZip ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} aria-label="Billing ZIP" />
                      {errors.billingZip && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px' }} role="alert">{errors.billingZip}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Review & Submit</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Please review your registration details before submitting.</p>

              {/* Event Summary */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>📋 Event Details</h3>
                  <button onClick={() => goToStep(0)} style={{ color: '#1e40af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                </div>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Event Type</span>
                    <span style={{ fontWeight: 500 }}>{eventConfig?.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Date</span>
                    <span style={{ fontWeight: 500 }}>{customEventDate}</span>
                  </div>
                  {teamName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Team</span>
                      <span style={{ fontWeight: 500 }}>{teamName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendees Summary */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>👥 Attendees ({attendees.length})</h3>
                  <button onClick={() => goToStep(1)} style={{ color: '#1e40af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                </div>
                {attendees.map((a, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < attendees.length - 1 ? '1px solid #f3f4f6' : 'none', fontSize: '14px' }}>
                    <div style={{ fontWeight: 500 }}>{a.firstName} {a.lastName}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{a.email} • {a.company || 'No company'} • Size: {a.tshirtSize}</div>
                  </div>
                ))}
              </div>

              {/* Preferences Summary */}
              {(eventConfig?.hasMeals || eventConfig?.hasWorkshops || specialRequests) && (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>⚙️ Preferences</h3>
                    <button onClick={() => goToStep(2)} style={{ color: '#1e40af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                  </div>
                  {eventConfig?.hasMeals && (
                    <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Meal: </span>
                      <span style={{ fontWeight: 500 }}>{MEAL_OPTIONS.find(m => m.id === selectedMealOption)?.label}</span>
                    </div>
                  )}
                  {eventConfig?.hasWorkshops && selectedWorkshops.length > 0 && (
                    <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Workshops: </span>
                      <span style={{ fontWeight: 500 }}>{selectedWorkshops.map(id => WORKSHOP_SESSIONS.find(w => w.id === id)?.title).join(', ')}</span>
                    </div>
                  )}
                  {specialRequests && (
                    <div style={{ fontSize: '14px' }}>
                      <span style={{ color: '#6b7280' }}>Special Requests: </span>
                      <span>{specialRequests}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Summary */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>💳 Payment</h3>
                  <button onClick={() => goToStep(3)} style={{ color: '#1e40af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                </div>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Method: </span>
                  <span style={{ fontWeight: 500 }}>{paymentMethod === 'credit_card' ? `Credit Card ending in ${cardNumber.slice(-4)}` : paymentMethod === 'paypal' ? 'PayPal' : `PO #${purchaseOrderNumber}`}</span>
                </div>
                <div style={{ fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Billing: </span>
                  <span>{billingName}, {billingAddress}, {billingCity} {billingState} {billingZip}</span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Legal Agreements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} style={{ marginTop: '2px', accentColor: '#1e40af' }} />
                    <span>I agree to the <a href="#" style={{ color: '#1e40af' }}>Terms and Conditions</a> *</span>
                  </label>
                  {errors.agreeTerms && <div style={{ color: '#dc2626', fontSize: '12px', marginLeft: '26px' }} role="alert">{errors.agreeTerms}</div>}

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} style={{ marginTop: '2px', accentColor: '#1e40af' }} />
                    <span>I agree to the <a href="#" style={{ color: '#1e40af' }}>Privacy Policy</a> *</span>
                  </label>
                  {errors.agreePrivacy && <div style={{ color: '#dc2626', fontSize: '12px', marginLeft: '26px' }} role="alert">{errors.agreePrivacy}</div>}

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="checkbox" checked={newsletterOptIn} onChange={(e) => setNewsletterOptIn(e.target.checked)} style={{ marginTop: '2px', accentColor: '#1e40af' }} />
                    <span>Subscribe to event newsletter for updates and future events</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: currentStep === 0 ? '#f3f4f6' : '#fff',
                color: currentStep === 0 ? '#9ca3af' : '#374151',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              ← Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  backgroundColor: '#1e40af',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                style={{
                  padding: '10px 32px',
                  borderRadius: '8px',
                  backgroundColor: isProcessing ? '#9ca3af' : '#16a34a',
                  color: '#fff',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isProcessing ? '⏳ Processing...' : '✅ Submit Registration'}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar: Order Summary */}
        {eventConfig && (
          <div style={{ width: '280px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '24px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Order Summary</h3>

              <div style={{ fontSize: '14px', display: 'grid', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>{eventConfig.label} × {attendees.length}</span>
                  <span>${(eventConfig.basePrice * attendees.length).toFixed(2)}</span>
                </div>

                {eventConfig.hasMeals && selectedMealOption !== 'standard' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Meal upgrade × {attendees.length}</span>
                    <span>${(MEAL_OPTIONS.find(m => m.id === selectedMealOption)?.price * attendees.length || 0).toFixed(2)}</span>
                  </div>
                )}

                {eventConfig.hasWorkshops && selectedWorkshops.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>{selectedWorkshops.length} workshop(s) × {attendees.length}</span>
                    <span>${(selectedWorkshops.length * 25 * attendees.length).toFixed(2)}</span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                {appliedDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Discount</span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>

                <div style={{ borderTop: '2px solid #1e40af', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px' }}>
                  <span>Total</span>
                  <span style={{ color: '#1e40af' }} data-testid="order-total">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>🔒 Secure checkout</div>
                <div>📧 Confirmation sent to {attendees[0].email || 'your email'}</div>
                <div>↩️ Full refund within 30 days</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
