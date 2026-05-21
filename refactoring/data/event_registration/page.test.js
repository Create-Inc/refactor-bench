import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EventRegistration from './src/app/page.jsx';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.print
window.print = vi.fn();

// Helper: fill attendee fields for the first attendee
const fillPrimaryAttendee = () => {
  fireEvent.change(screen.getByLabelText('Attendee 1 first name'), { target: { value: 'Jane' } });
  fireEvent.change(screen.getByLabelText('Attendee 1 last name'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Attendee 1 email'), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText('Attendee 1 emergency contact name'), { target: { value: 'John Doe' } });
  fireEvent.change(screen.getByLabelText('Attendee 1 emergency contact phone'), { target: { value: '+1 555-1234' } });
};

// Helper: navigate to a step, filling required fields along the way
const navigateToStep = async (targetStep) => {
  // Step 0: Select event + date
  if (targetStep >= 1) {
    fireEvent.click(screen.getByTestId('event-type-conference'));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    const dateStr = tomorrow.toISOString().split('T')[0];
    fireEvent.change(screen.getByLabelText('Event date'), { target: { value: dateStr } });
    fireEvent.click(screen.getByText('Next →'));
  }
  // Step 1: Fill attendee details
  if (targetStep >= 2) {
    fillPrimaryAttendee();
    fireEvent.click(screen.getByText('Next →'));
  }
  // Step 2: Preferences (no required fields)
  if (targetStep >= 3) {
    fireEvent.click(screen.getByText('Next →'));
  }
  // Step 3: Fill payment details
  if (targetStep >= 4) {
    fireEvent.change(screen.getByLabelText('Card number'), { target: { value: '4111 1111 1111 1111' } });
    fireEvent.change(screen.getByLabelText('Card expiry'), { target: { value: '12/28' } });
    fireEvent.change(screen.getByLabelText('Card CVC'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Billing name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Billing address'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('Billing city'), { target: { value: 'San Francisco' } });
    fireEvent.change(screen.getByLabelText('Billing ZIP'), { target: { value: '94105' } });
    fireEvent.click(screen.getByText('Next →'));
  }
};

describe('EventRegistration Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    test('renders header with title and save draft button', () => {
      render(<EventRegistration />);
      expect(screen.getByText(/Event Registration/)).toBeInTheDocument();
      expect(screen.getByText(/Save Draft/)).toBeInTheDocument();
    });

    test('renders progress bar with all step labels', () => {
      render(<EventRegistration />);
      expect(screen.getByText('Event Selection')).toBeInTheDocument();
      expect(screen.getByText('Attendees')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Review & Submit')).toBeInTheDocument();
    });

    test('renders event type options', () => {
      render(<EventRegistration />);
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.getByText('Workshop')).toBeInTheDocument();
      expect(screen.getByText('Webinar')).toBeInTheDocument();
      expect(screen.getByText('Gala Dinner')).toBeInTheDocument();
      expect(screen.getByText('Hackathon')).toBeInTheDocument();
    });

    test('renders event prices', () => {
      render(<EventRegistration />);
      expect(screen.getByText('$299')).toBeInTheDocument();
      expect(screen.getByText('$149')).toBeInTheDocument();
      expect(screen.getByText('$49')).toBeInTheDocument();
      expect(screen.getByText('$199')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
    });

    test('renders event date input', () => {
      render(<EventRegistration />);
      expect(screen.getByLabelText('Event date')).toBeInTheDocument();
    });

    test('shows 20% complete on step 1', () => {
      render(<EventRegistration />);
      expect(screen.getByText('20% complete')).toBeInTheDocument();
    });
  });

  describe('Step 0: Event Selection', () => {
    test('selecting an event type highlights it', () => {
      render(<EventRegistration />);
      const conferenceButton = screen.getByTestId('event-type-conference');
      fireEvent.click(conferenceButton);
      expect(conferenceButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('shows event features for each type', () => {
      render(<EventRegistration />);
      expect(screen.getByText(/Max 10 attendees/)).toBeInTheDocument();
      expect(screen.getByText(/Meals included/)).toBeInTheDocument();
      expect(screen.getByText(/Workshops available/)).toBeInTheDocument();
    });

    test('validation fails without event type selected', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Please select an event type')).toBeInTheDocument();
    });

    test('validation fails without event date', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Please select a date')).toBeInTheDocument();
    });

    test('validation fails with past date', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: '2020-01-01' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Date must be in the future')).toBeInTheDocument();
    });

    test('successful validation advances to attendees step', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Attendee Details')).toBeInTheDocument();
    });

    test('back button is disabled on first step', () => {
      render(<EventRegistration />);
      const backButton = screen.getByText('← Back');
      expect(backButton).toBeDisabled();
    });

    test('selecting event type shows order summary sidebar', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });
  });

  describe('Step 1: Attendees', () => {
    beforeEach(() => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
    });

    test('renders attendee form with first attendee expanded', () => {
      expect(screen.getByText('Attendee Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Attendee 1 first name')).toBeInTheDocument();
      expect(screen.getByLabelText('Attendee 1 last name')).toBeInTheDocument();
      expect(screen.getByLabelText('Attendee 1 email')).toBeInTheDocument();
    });

    test('shows attendee count and max', () => {
      expect(screen.getByText(/1 of 10 attendees added/)).toBeInTheDocument();
    });

    test('add attendee button adds new attendee', () => {
      fireEvent.click(screen.getByText('+ Add Attendee'));
      expect(screen.getByText(/2 of 10 attendees added/)).toBeInTheDocument();
    });

    test('remove button removes an attendee', () => {
      fireEvent.click(screen.getByText('+ Add Attendee'));
      expect(screen.getByText(/2 of 10 attendees added/)).toBeInTheDocument();
      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[0]);
      expect(screen.getByText(/1 of 10 attendees added/)).toBeInTheDocument();
    });

    test('duplicate button copies company and job data but clears personal info', () => {
      fireEvent.change(screen.getByLabelText('Attendee 1 first name'), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByLabelText('Attendee 1 company'), { target: { value: 'Acme Corp' } });
      const duplicateButtons = screen.getAllByText('Duplicate');
      fireEvent.click(duplicateButtons[0]);
      expect(screen.getByText(/2 of 10 attendees added/)).toBeInTheDocument();
      // The duplicated attendee should have company but not personal name/email
      expect(screen.getByText('Attendee 2')).toBeInTheDocument();
    });

    test('validation fails without required attendee fields', () => {
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    test('validation fails with invalid email', () => {
      fireEvent.change(screen.getByLabelText('Attendee 1 first name'), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByLabelText('Attendee 1 last name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Attendee 1 email'), { target: { value: 'not-an-email' } });
      fireEvent.change(screen.getByLabelText('Attendee 1 emergency contact name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Attendee 1 emergency contact phone'), { target: { value: '+1 555-0000' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    test('validation detects duplicate email addresses', () => {
      fillPrimaryAttendee();
      fireEvent.click(screen.getByText('+ Add Attendee'));
      // Click on Attendee 2 to expand
      fireEvent.click(screen.getByText('Attendee 2'));
      fireEvent.change(screen.getByLabelText('Attendee 2 first name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Attendee 2 last name'), { target: { value: 'Smith' } });
      fireEvent.change(screen.getByLabelText('Attendee 2 email'), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByLabelText('Attendee 2 emergency contact name'), { target: { value: 'Bob' } });
      fireEvent.change(screen.getByLabelText('Attendee 2 emergency contact phone'), { target: { value: '+1 555-9999' } });
      fireEvent.click(screen.getByText('Next →'));
      const duplicateErrors = screen.getAllByText('Duplicate email address');
      expect(duplicateErrors.length).toBeGreaterThan(0);
    });

    test('clicking attendee header expands/collapses the form', () => {
      fillPrimaryAttendee();
      fireEvent.click(screen.getByText('+ Add Attendee'));
      // Attendee 2 should auto-expand. Click Attendee 1 header.
      fireEvent.click(screen.getByText('Jane Doe'));
      expect(screen.getByLabelText('Attendee 1 first name')).toBeInTheDocument();
    });

    test('attendee name shows in header after filling', () => {
      fireEvent.change(screen.getByLabelText('Attendee 1 first name'), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByLabelText('Attendee 1 last name'), { target: { value: 'Smith' } });
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    test('country selector defaults to United States', () => {
      expect(screen.getByLabelText('Attendee 1 country')).toHaveValue('United States');
    });

    test('t-shirt size selector defaults to M', () => {
      expect(screen.getByLabelText('Attendee 1 t-shirt size')).toHaveValue('M');
    });

    test('can change country selection', () => {
      const countrySelect = screen.getByLabelText('Attendee 1 country');
      fireEvent.change(countrySelect, { target: { value: 'Japan' } });
      expect(countrySelect).toHaveValue('Japan');
    });

    test('emergency contact fields are required', () => {
      fireEvent.change(screen.getByLabelText('Attendee 1 first name'), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByLabelText('Attendee 1 last name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Attendee 1 email'), { target: { value: 'jane@example.com' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Emergency contact name is required')).toBeInTheDocument();
      expect(screen.getByText('Emergency contact phone is required')).toBeInTheDocument();
    });

    test('valid attendee data advances to preferences step', () => {
      fillPrimaryAttendee();
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Preferences')).toBeInTheDocument();
    });
  });

  describe('Step 2: Preferences', () => {
    beforeEach(() => {
      render(<EventRegistration />);
      navigateToStep(2);
    });

    test('renders meal selection for conference', () => {
      expect(screen.getByText(/Meal Selection/)).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Vegetarian')).toBeInTheDocument();
      expect(screen.getByText('Vegan')).toBeInTheDocument();
      expect(screen.getByText('Gluten Free')).toBeInTheDocument();
    });

    test('renders workshop sessions for conference', () => {
      expect(screen.getByText(/Workshop Sessions/)).toBeInTheDocument();
      expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
      expect(screen.getByText('System Design at Scale')).toBeInTheDocument();
    });

    test('selecting a meal option updates selection', () => {
      const veganRadio = screen.getByDisplayValue('vegan');
      fireEvent.click(veganRadio);
      expect(veganRadio).toBeChecked();
    });

    test('shows meal price surcharge for premium options', () => {
      expect(screen.getByText('+$5/person')).toBeInTheDocument();
      expect(screen.getByText('+$10/person')).toBeInTheDocument();
    });

    test('clicking a workshop selects it', () => {
      const wsButton = screen.getByTestId('workshop-ws1');
      fireEvent.click(wsButton);
      expect(wsButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('selecting conflicting workshop auto-swaps', () => {
      // ws1 and ws2 are at same time (10:00 AM)
      const ws1 = screen.getByTestId('workshop-ws1');
      const ws2 = screen.getByTestId('workshop-ws2');
      fireEvent.click(ws1);
      expect(ws1).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(ws2);
      // ws2 should now be selected, ws1 deselected
      expect(ws2).toHaveAttribute('aria-pressed', 'true');
      expect(ws1).toHaveAttribute('aria-pressed', 'false');
    });

    test('full workshops show FULL indicator and are not selectable', () => {
      // ws2 is full (25/25)
      expect(screen.getByText('25/25 enrolled')).toBeInTheDocument();
    });

    test('track filter buttons filter workshops', () => {
      fireEvent.click(screen.getByText('frontend'));
      // Should show only frontend track workshops
      expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
      expect(screen.getByText('CSS Architecture')).toBeInTheDocument();
      expect(screen.queryByText('System Design at Scale')).not.toBeInTheDocument();
    });

    test('All Tracks filter shows all workshops', () => {
      fireEvent.click(screen.getByText('frontend'));
      fireEvent.click(screen.getByText('All Tracks'));
      expect(screen.getByText('System Design at Scale')).toBeInTheDocument();
      expect(screen.getByText('DevOps Pipelines')).toBeInTheDocument();
    });

    test('special requests textarea renders with character count', () => {
      expect(screen.getByLabelText('Special requests')).toBeInTheDocument();
      expect(screen.getByText('0/500 characters')).toBeInTheDocument();
    });

    test('typing in special requests updates character count', () => {
      fireEvent.change(screen.getByLabelText('Special requests'), { target: { value: 'Need parking' } });
      expect(screen.getByText('12/500 characters')).toBeInTheDocument();
    });

    test('preferences step has no required fields and advances', () => {
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Payment Details')).toBeInTheDocument();
    });
  });

  describe('Step 3: Payment', () => {
    beforeEach(() => {
      render(<EventRegistration />);
      navigateToStep(3);
    });

    test('renders payment method options', () => {
      expect(screen.getByTestId('payment-credit_card')).toBeInTheDocument();
      expect(screen.getByTestId('payment-paypal')).toBeInTheDocument();
      expect(screen.getByTestId('payment-purchase_order')).toBeInTheDocument();
    });

    test('credit card form renders by default', () => {
      expect(screen.getByLabelText('Card number')).toBeInTheDocument();
      expect(screen.getByLabelText('Card expiry')).toBeInTheDocument();
      expect(screen.getByLabelText('Card CVC')).toBeInTheDocument();
    });

    test('switching to PayPal hides card fields', () => {
      fireEvent.click(screen.getByTestId('payment-paypal'));
      expect(screen.queryByLabelText('Card number')).not.toBeInTheDocument();
      expect(screen.getByText(/redirected to PayPal/)).toBeInTheDocument();
    });

    test('switching to purchase order shows PO field', () => {
      fireEvent.click(screen.getByTestId('payment-purchase_order'));
      expect(screen.getByLabelText('Purchase order number')).toBeInTheDocument();
    });

    test('card number is formatted with spaces', () => {
      const cardInput = screen.getByLabelText('Card number');
      fireEvent.change(cardInput, { target: { value: '4111111111111111' } });
      expect(cardInput).toHaveValue('4111 1111 1111 1111');
    });

    test('expiry date is formatted with slash', () => {
      const expiryInput = screen.getByLabelText('Card expiry');
      fireEvent.change(expiryInput, { target: { value: '1228' } });
      expect(expiryInput).toHaveValue('12/28');
    });

    test('CVC only allows digits', () => {
      const cvcInput = screen.getByLabelText('Card CVC');
      fireEvent.change(cvcInput, { target: { value: '12a3' } });
      expect(cvcInput).toHaveValue('123');
    });

    test('billing address fields render', () => {
      expect(screen.getByLabelText('Billing name')).toBeInTheDocument();
      expect(screen.getByLabelText('Billing address')).toBeInTheDocument();
      expect(screen.getByLabelText('Billing city')).toBeInTheDocument();
      expect(screen.getByLabelText('Billing state')).toBeInTheDocument();
      expect(screen.getByLabelText('Billing ZIP')).toBeInTheDocument();
    });

    test('validation fails without card details', () => {
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Card number is required')).toBeInTheDocument();
      expect(screen.getByText('Expiry date is required')).toBeInTheDocument();
      expect(screen.getByText('CVC is required')).toBeInTheDocument();
    });

    test('validation fails without billing name', () => {
      fireEvent.change(screen.getByLabelText('Card number'), { target: { value: '4111 1111 1111 1111' } });
      fireEvent.change(screen.getByLabelText('Card expiry'), { target: { value: '12/28' } });
      fireEvent.change(screen.getByLabelText('Card CVC'), { target: { value: '123' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Billing name is required')).toBeInTheDocument();
    });

    test('purchase order validation requires PO number', () => {
      fireEvent.click(screen.getByTestId('payment-purchase_order'));
      fireEvent.change(screen.getByLabelText('Billing name'), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByLabelText('Billing address'), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText('Billing city'), { target: { value: 'SF' } });
      fireEvent.change(screen.getByLabelText('Billing ZIP'), { target: { value: '94105' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Purchase order number is required')).toBeInTheDocument();
    });
  });

  describe('Discount Codes', () => {
    beforeEach(() => {
      render(<EventRegistration />);
      navigateToStep(3);
    });

    test('renders discount code input', () => {
      expect(screen.getByLabelText('Discount code')).toBeInTheDocument();
    });

    test('applying valid discount code shows success', () => {
      fireEvent.change(screen.getByLabelText('Discount code'), { target: { value: 'EARLY2025' } });
      fireEvent.click(screen.getByText('Apply'));
      expect(screen.getByText(/EARLY2025/)).toBeInTheDocument();
      expect(screen.getByText(/Early bird 20% off/)).toBeInTheDocument();
    });

    test('applying invalid code shows error', () => {
      fireEvent.change(screen.getByLabelText('Discount code'), { target: { value: 'INVALID' } });
      fireEvent.click(screen.getByText('Apply'));
      expect(screen.getByText('Invalid discount code')).toBeInTheDocument();
    });

    test('removing applied discount code', () => {
      fireEvent.change(screen.getByLabelText('Discount code'), { target: { value: 'EARLY2025' } });
      fireEvent.click(screen.getByText('Apply'));
      fireEvent.click(screen.getByText('Remove'));
      expect(screen.getByLabelText('Discount code')).toBeInTheDocument();
    });

    test('view codes toggle shows available discount codes', () => {
      fireEvent.click(screen.getByText('View codes'));
      expect(screen.getByText('EARLY2025')).toBeInTheDocument();
      expect(screen.getByText('GROUP5')).toBeInTheDocument();
      expect(screen.getByText('STUDENT')).toBeInTheDocument();
    });

    test('hide info toggle hides discount codes', () => {
      fireEvent.click(screen.getByText('View codes'));
      expect(screen.getByText('STUDENT')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Hide info'));
      expect(screen.queryByText('Student discount 30%')).not.toBeInTheDocument();
    });

    test('group discount requires minimum attendees', () => {
      fireEvent.change(screen.getByLabelText('Discount code'), { target: { value: 'GROUP5' } });
      fireEvent.click(screen.getByText('Apply'));
      expect(screen.getByText(/requires at least 5 attendees/)).toBeInTheDocument();
    });
  });

  describe('Order Summary & Pricing', () => {
    test('shows base price for selected event', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      expect(screen.getByText(/Conference × 1/)).toBeInTheDocument();
      expect(screen.getByText('$299.00')).toBeInTheDocument();
    });

    test('price updates when adding attendees', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
      fireEvent.click(screen.getByText('+ Add Attendee'));
      expect(screen.getByText(/Conference × 2/)).toBeInTheDocument();
    });

    test('workshop selection adds to total', () => {
      render(<EventRegistration />);
      navigateToStep(2);
      const ws = screen.getByTestId('workshop-ws1');
      fireEvent.click(ws);
      expect(screen.getByText(/1 workshop/)).toBeInTheDocument();
    });

    test('tax is calculated at 8%', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      // Subtotal is $299, tax is $299 * 0.08 = $23.92
      expect(screen.getByText('$23.92')).toBeInTheDocument();
    });

    test('shows secure checkout and refund info', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      expect(screen.getByText(/Secure checkout/)).toBeInTheDocument();
      expect(screen.getByText(/Full refund within 30 days/)).toBeInTheDocument();
    });
  });

  describe('Step 4: Review & Submit', () => {
    beforeEach(async () => {
      render(<EventRegistration />);
      await navigateToStep(4);
    });

    test('renders review section headers', () => {
      expect(screen.getByText('Review & Submit')).toBeInTheDocument();
      expect(screen.getByText(/Event Details/)).toBeInTheDocument();
      expect(screen.getByText(/Attendees \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Payment/)).toBeInTheDocument();
    });

    test('shows attendee name in review', () => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    test('shows payment method in review', () => {
      expect(screen.getByText(/Credit Card ending in 1111/)).toBeInTheDocument();
    });

    test('shows billing address in review', () => {
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    });

    test('edit buttons link back to corresponding steps', () => {
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    test('terms and privacy checkboxes render', () => {
      expect(screen.getByText(/Terms and Conditions/)).toBeInTheDocument();
      expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument();
    });

    test('newsletter opt-in checkbox renders', () => {
      expect(screen.getByText(/Subscribe to event newsletter/)).toBeInTheDocument();
    });

    test('submit button renders', () => {
      expect(screen.getByText(/Submit Registration/)).toBeInTheDocument();
    });

    test('submission fails without agreeing to terms', () => {
      fireEvent.click(screen.getByText(/Submit Registration/));
      expect(screen.getByText('You must agree to the terms')).toBeInTheDocument();
    });

    test('submission fails without agreeing to privacy policy', () => {
      const termsCheckbox = screen.getByText(/Terms and Conditions/).closest('label').querySelector('input');
      fireEvent.click(termsCheckbox);
      fireEvent.click(screen.getByText(/Submit Registration/));
      expect(screen.getByText('You must agree to the privacy policy')).toBeInTheDocument();
    });

    test('successful submission shows confirmation page', async () => {
      const termsCheckbox = screen.getByText(/Terms and Conditions/).closest('label').querySelector('input');
      const privacyCheckbox = screen.getByText(/Privacy Policy/).closest('label').querySelector('input');
      fireEvent.click(termsCheckbox);
      fireEvent.click(privacyCheckbox);
      fireEvent.click(screen.getByText(/Submit Registration/));
      expect(screen.getByText(/Processing/)).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.getByText('Registration Complete!')).toBeInTheDocument();
    });

    test('confirmation page shows registration ID', async () => {
      const termsCheckbox = screen.getByText(/Terms and Conditions/).closest('label').querySelector('input');
      const privacyCheckbox = screen.getByText(/Privacy Policy/).closest('label').querySelector('input');
      fireEvent.click(termsCheckbox);
      fireEvent.click(privacyCheckbox);
      fireEvent.click(screen.getByText(/Submit Registration/));

      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      const regId = screen.getByTestId('registration-id');
      expect(regId.textContent).toMatch(/^REG-/);
    });

    test('confirmation page shows summary', async () => {
      const termsCheckbox = screen.getByText(/Terms and Conditions/).closest('label').querySelector('input');
      const privacyCheckbox = screen.getByText(/Privacy Policy/).closest('label').querySelector('input');
      fireEvent.click(termsCheckbox);
      fireEvent.click(privacyCheckbox);
      fireEvent.click(screen.getByText(/Submit Registration/));

      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument();
    });

    test('new registration button resets form', async () => {
      const termsCheckbox = screen.getByText(/Terms and Conditions/).closest('label').querySelector('input');
      const privacyCheckbox = screen.getByText(/Privacy Policy/).closest('label').querySelector('input');
      fireEvent.click(termsCheckbox);
      fireEvent.click(privacyCheckbox);
      fireEvent.click(screen.getByText(/Submit Registration/));

      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      fireEvent.click(screen.getByText('New Registration'));
      expect(screen.getByText('Select Your Event')).toBeInTheDocument();
    });

    test('print button is available on confirmation', async () => {
      const termsCheckbox = screen.getByText(/Terms and Conditions/).closest('label').querySelector('input');
      const privacyCheckbox = screen.getByText(/Privacy Policy/).closest('label').querySelector('input');
      fireEvent.click(termsCheckbox);
      fireEvent.click(privacyCheckbox);
      fireEvent.click(screen.getByText(/Submit Registration/));

      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      fireEvent.click(screen.getByText(/Print Confirmation/));
      expect(window.print).toHaveBeenCalled();
    });
  });

  describe('Navigation Between Steps', () => {
    test('back button goes to previous step', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Attendee Details')).toBeInTheDocument();
      fireEvent.click(screen.getByText('← Back'));
      expect(screen.getByText('Select Your Event')).toBeInTheDocument();
    });

    test('clicking completed step in progress bar navigates back', () => {
      render(<EventRegistration />);
      navigateToStep(2);
      // Click on Event Selection step
      fireEvent.click(screen.getByText('Event Selection'));
      expect(screen.getByText('Select Your Event')).toBeInTheDocument();
    });

    test('progress percent updates with each step', () => {
      render(<EventRegistration />);
      expect(screen.getByText('20% complete')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('event-type-conference'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('40% complete')).toBeInTheDocument();
    });
  });

  describe('Draft Saving & Persistence', () => {
    test('clicking save draft shows saved indicator', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByText(/Save Draft/));
      expect(screen.getByText(/Draft saved/)).toBeInTheDocument();
    });

    test('draft saved indicator disappears after timeout', async () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByText(/Save Draft/));
      expect(screen.getByText(/Draft saved/)).toBeInTheDocument();
      await act(async () => {
        vi.advanceTimersByTime(2500);
      });
      expect(screen.queryByText(/Draft saved/)).not.toBeInTheDocument();
    });

    test('form state is saved to localStorage', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'eventRegistrationDraft',
        expect.stringContaining('conference')
      );
    });

    test('draft is loaded from localStorage on mount', () => {
      const draft = JSON.stringify({
        selectedEventType: 'hackathon',
        customEventDate: '2027-06-15',
        attendees: [{ ...{ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '', company: '', jobTitle: '', dietaryRestrictions: '', accessibilityNeeds: '', tshirtSize: 'M', emergencyContactName: '', emergencyContactPhone: '', country: 'United States' } }],
        selectedMealOption: 'vegan',
        selectedWorkshops: ['ws1'],
        teamName: 'Alpha Team',
        currentStep: 0,
      });
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'eventRegistrationDraft') return draft;
        return null;
      });
      render(<EventRegistration />);
      // hackathon should be selected
      expect(screen.getByTestId('event-type-hackathon')).toHaveAttribute('aria-pressed', 'true');
    });

    test('handles corrupted localStorage draft gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'eventRegistrationDraft') return '{invalid json!!!';
        return null;
      });
      expect(() => render(<EventRegistration />)).not.toThrow();
    });

    test('localStorage draft is cleared on successful submission', async () => {
      render(<EventRegistration />);
      await navigateToStep(4);
      const termsCheckbox = screen.getByText(/Terms and Conditions/).closest('label').querySelector('input');
      const privacyCheckbox = screen.getByText(/Privacy Policy/).closest('label').querySelector('input');
      fireEvent.click(termsCheckbox);
      fireEvent.click(privacyCheckbox);
      fireEvent.click(screen.getByText(/Submit Registration/));

      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('eventRegistrationDraft');
    });
  });

  describe('Conditional Event Features', () => {
    test('webinar does not show meal or workshop options', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-webinar'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
      fillPrimaryAttendee();
      fireEvent.click(screen.getByText('Next →'));
      // Preferences step should not show meals or workshops
      expect(screen.queryByText(/Meal Selection/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Workshop Sessions/)).not.toBeInTheDocument();
    });

    test('webinar limits attendees to 3', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-webinar'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText(/1 of 3 attendees added/)).toBeInTheDocument();
    });

    test('gala dinner shows meals but not workshops', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-gala'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
      fillPrimaryAttendee();
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText(/Meal Selection/)).toBeInTheDocument();
      expect(screen.queryByText(/Workshop Sessions/)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<EventRegistration />)).not.toThrow();
    });

    test('error clears when correcting a field', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByTestId('event-type-conference'));
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      fireEvent.change(screen.getByLabelText('Event date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.click(screen.getByText('Next →'));
      // Try to advance without filling fields
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      // Fix the error
      fireEvent.change(screen.getByLabelText('Attendee 1 first name'), { target: { value: 'Jane' } });
      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
    });

    test('selecting event type clears event type error', () => {
      render(<EventRegistration />);
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Please select an event type')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('event-type-conference'));
      expect(screen.queryByText('Please select an event type')).not.toBeInTheDocument();
    });
  });
});
