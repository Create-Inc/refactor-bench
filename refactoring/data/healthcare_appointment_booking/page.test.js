import { describe, test, expect, beforeEach, vi } from 'vitest';
// biome-ignore lint/correctness/noUndeclaredDependencies: eval test data — runs in vitest sandbox, not core package
import { render, screen, fireEvent } from '@testing-library/react-native';
import HealthcareApp from './src/app/page.jsx';

// Mock AsyncStorage
const asyncStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => Promise.resolve(store[key] || null)),
    setItem: vi.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: vi.fn(() => {
      store = {};
      return Promise.resolve();
    }),
  };
})();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: asyncStorageMock,
}));

// Mock Alert
const alertSpy = vi.fn();
vi.spyOn(global, 'Alert', 'get').mockReturnValue?.({ alert: alertSpy });

// Mock Animated to avoid timing issues
vi.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('HealthcareApp', () => {
  beforeEach(() => {
    asyncStorageMock.clear();
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════
  // INITIAL RENDERING
  // ═══════════════════════════════════════════════════════

  describe('Initial Rendering', () => {
    test('renders the app container', () => {
      render(<HealthcareApp />);
      expect(screen.getByTestId('healthcare-app')).toBeTruthy();
    });

    test('renders header with HealthCare+ title', () => {
      render(<HealthcareApp />);
      expect(screen.getByText('HealthCare+')).toBeTruthy();
    });

    test('renders notification bell', () => {
      render(<HealthcareApp />);
      expect(screen.getByTestId('notification-bell')).toBeTruthy();
    });

    test('renders all tab bar items', () => {
      render(<HealthcareApp />);
      expect(screen.getByTestId('tab-home')).toBeTruthy();
      expect(screen.getByTestId('tab-doctors')).toBeTruthy();
      expect(screen.getByTestId('tab-appointments')).toBeTruthy();
      expect(screen.getByTestId('tab-profile')).toBeTruthy();
    });

    test('shows home tab by default', () => {
      render(<HealthcareApp />);
      expect(screen.getByTestId('home-tab')).toBeTruthy();
    });

    test('renders welcome message with patient name', () => {
      render(<HealthcareApp />);
      expect(screen.getByText(/Hello, Alex Johnson/)).toBeTruthy();
    });

    test('displays upcoming appointment count', () => {
      render(<HealthcareApp />);
      expect(screen.getByText(/2 upcoming appointments/)).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // HOME TAB - QUICK ACTIONS
  // ═══════════════════════════════════════════════════════

  describe('Home Tab - Quick Actions', () => {
    test('renders all four quick actions', () => {
      render(<HealthcareApp />);
      expect(screen.getByTestId('quick-find-doctor')).toBeTruthy();
      expect(screen.getByTestId('quick-appointments')).toBeTruthy();
      expect(screen.getByTestId('quick-prescriptions')).toBeTruthy();
      expect(screen.getByTestId('quick-history')).toBeTruthy();
    });

    test('quick action labels are displayed', () => {
      render(<HealthcareApp />);
      expect(screen.getByText('Find Doctor')).toBeTruthy();
      expect(screen.getByText('Appointments')).toBeTruthy();
      expect(screen.getByText('Prescriptions')).toBeTruthy();
      expect(screen.getByText('History')).toBeTruthy();
    });

    test('Find Doctor quick action navigates to doctors tab', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('quick-find-doctor'));
      expect(screen.getByTestId('doctors-tab')).toBeTruthy();
    });

    test('Appointments quick action navigates to appointments tab', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('quick-appointments'));
      expect(screen.getByTestId('appointments-tab')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // HOME TAB - NEXT APPOINTMENT
  // ═══════════════════════════════════════════════════════

  describe('Home Tab - Next Appointment', () => {
    test('renders next appointment section', () => {
      render(<HealthcareApp />);
      expect(screen.getByText('Next Appointment')).toBeTruthy();
    });

    test('renders next appointment card', () => {
      render(<HealthcareApp />);
      expect(screen.getByTestId('next-appointment-card')).toBeTruthy();
    });

    test('shows doctor name on next appointment', () => {
      render(<HealthcareApp />);
      // a3 is the earliest upcoming appointment (2025-04-20)
      expect(screen.getByText('Dr. Emily Nakamura')).toBeTruthy();
    });

    test('shows appointment reason on next appointment card', () => {
      render(<HealthcareApp />);
      expect(screen.getByText(/Child wellness check/)).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // HOME TAB - FAVORITE DOCTORS
  // ═══════════════════════════════════════════════════════

  describe('Home Tab - Favorite Doctors', () => {
    test('renders favorite doctors section', () => {
      render(<HealthcareApp />);
      expect(screen.getByText('Favorite Doctors')).toBeTruthy();
    });

    test('shows initial favorites (d1 and d5)', () => {
      render(<HealthcareApp />);
      expect(screen.getByTestId('fav-doctor-d1')).toBeTruthy();
      expect(screen.getByTestId('fav-doctor-d5')).toBeTruthy();
    });

    test('book button on favorite doctor is present', () => {
      render(<HealthcareApp />);
      expect(screen.getByTestId('book-fav-d1')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // HOME TAB - NOTIFICATIONS
  // ═══════════════════════════════════════════════════════

  describe('Home Tab - Notifications', () => {
    test('renders recent notifications section', () => {
      render(<HealthcareApp />);
      expect(screen.getByText('Recent Notifications')).toBeTruthy();
    });

    test('shows notification titles', () => {
      render(<HealthcareApp />);
      expect(screen.getByText('Upcoming Appointment')).toBeTruthy();
      expect(screen.getByText('Prescription Refill')).toBeTruthy();
    });

    test('shows unread notification count badge', () => {
      render(<HealthcareApp />);
      // 3 unread notifications initially (n1, n2, n4)
      expect(screen.getByText('3')).toBeTruthy();
    });

    test('tapping notification marks it as read', () => {
      render(<HealthcareApp />);
      const notif = screen.getByTestId('notif-n1');
      fireEvent.press(notif);
      // Unread count should decrease from 3 to 2
      expect(screen.getByText('2')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // TAB NAVIGATION
  // ═══════════════════════════════════════════════════════

  describe('Tab Navigation', () => {
    test('clicking doctors tab shows doctors view', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByTestId('doctors-tab')).toBeTruthy();
    });

    test('clicking appointments tab shows appointments view', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      expect(screen.getByTestId('appointments-tab')).toBeTruthy();
    });

    test('clicking profile tab shows profile view', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByTestId('profile-tab')).toBeTruthy();
    });

    test('clicking home tab returns to home', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('tab-home'));
      expect(screen.getByTestId('home-tab')).toBeTruthy();
    });

    test('header title updates based on active tab', () => {
      render(<HealthcareApp />);
      expect(screen.getByText('HealthCare+')).toBeTruthy();
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByText('Find Doctors')).toBeTruthy();
      fireEvent.press(screen.getByTestId('tab-appointments'));
      expect(screen.getByText('Appointments')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // DOCTORS TAB - SEARCH & FILTER
  // ═══════════════════════════════════════════════════════

  describe('Doctors Tab - Search & Filter', () => {
    test('renders search input', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByTestId('doctor-search-input')).toBeTruthy();
    });

    test('search filters doctors by name', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.changeText(screen.getByTestId('doctor-search-input'), 'Sarah');
      expect(screen.getByText('Dr. Sarah Chen')).toBeTruthy();
      expect(screen.queryByText('Dr. Michael Reeves')).toBeNull();
    });

    test('search filters doctors by specialty', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.changeText(screen.getByTestId('doctor-search-input'), 'Cardiology');
      expect(screen.getByText('Dr. Michael Reeves')).toBeTruthy();
      expect(screen.queryByText('Dr. Sarah Chen')).toBeNull();
    });

    test('search filters doctors by hospital', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.changeText(screen.getByTestId('doctor-search-input'), 'SkinCare');
      expect(screen.getByText('Dr. Priya Patel')).toBeTruthy();
    });

    test('search filters by language', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.changeText(screen.getByTestId('doctor-search-input'), 'Korean');
      expect(screen.getByText('Dr. Robert Kim')).toBeTruthy();
    });

    test('clear search button resets results', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.changeText(screen.getByTestId('doctor-search-input'), 'Sarah');
      expect(screen.queryByText('Dr. Michael Reeves')).toBeNull();
      fireEvent.press(screen.getByTestId('clear-search'));
      expect(screen.getByText('Dr. Michael Reeves')).toBeTruthy();
    });

    test('specialty filter shows only matching doctors', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('specialty-cardiology'));
      expect(screen.getByText('Dr. Michael Reeves')).toBeTruthy();
      expect(screen.queryByText('Dr. Sarah Chen')).toBeNull();
    });

    test('All specialty chip resets filter', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('specialty-cardiology'));
      fireEvent.press(screen.getByTestId('specialty-all'));
      expect(screen.getByText('Dr. Sarah Chen')).toBeTruthy();
      expect(screen.getByText('Dr. Michael Reeves')).toBeTruthy();
    });

    test('displays correct doctor count', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByText('8 doctors')).toBeTruthy();
    });

    test('filtered count updates', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('specialty-cardiology'));
      expect(screen.getByText('1 doctors')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // DOCTORS TAB - SORT
  // ═══════════════════════════════════════════════════════

  describe('Doctors Tab - Sort', () => {
    test('sort options are rendered', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByTestId('sort-rating')).toBeTruthy();
      expect(screen.getByTestId('sort-experience')).toBeTruthy();
      expect(screen.getByTestId('sort-fee')).toBeTruthy();
      expect(screen.getByTestId('sort-name')).toBeTruthy();
    });

    test('sort by fee changes order', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('sort-fee'));
      // Dr. Sarah Chen ($75) should come before Dr. Michael Reeves ($150)
      const doctorCards = screen.getAllByText(/^Dr\./);
      const names = doctorCards.map((el) => el.props.children);
      const sarahIdx = names.indexOf('Dr. Sarah Chen');
      const michaelIdx = names.indexOf('Dr. Michael Reeves');
      expect(sarahIdx).toBeLessThan(michaelIdx);
    });
  });

  // ═══════════════════════════════════════════════════════
  // DOCTORS TAB - DOCTOR CARD & FAVORITES
  // ═══════════════════════════════════════════════════════

  describe('Doctors Tab - Doctor Cards', () => {
    test('doctor cards display name, specialty, and hospital', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByText('Dr. Sarah Chen')).toBeTruthy();
      expect(screen.getByText('General Practice')).toBeTruthy();
      expect(screen.getByText('City Medical Center')).toBeTruthy();
    });

    test('doctor cards show rating', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByText(/4\.8/)).toBeTruthy();
    });

    test('doctor cards show consultation fee', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByText('$75')).toBeTruthy();
    });

    test('doctor cards show language tags', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByText('English')).toBeTruthy();
      expect(screen.getByText('Mandarin')).toBeTruthy();
    });

    test('favorite toggle works', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      // d1 is already a favorite, toggling should remove it
      fireEvent.press(screen.getByTestId('fav-toggle-d1'));
      // Go back to home, should only see d5 as favorite
      fireEvent.press(screen.getByTestId('tab-home'));
      expect(screen.queryByTestId('fav-doctor-d1')).toBeNull();
      expect(screen.getByTestId('fav-doctor-d5')).toBeTruthy();
    });

    test('adding a new favorite', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('fav-toggle-d2'));
      fireEvent.press(screen.getByTestId('tab-home'));
      expect(screen.getByTestId('fav-doctor-d2')).toBeTruthy();
    });

    test('book button on doctor card is present', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      expect(screen.getByTestId('book-doctor-d1')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // DOCTOR PROFILE MODAL
  // ═══════════════════════════════════════════════════════

  describe('Doctor Profile Modal', () => {
    test('clicking doctor card opens profile modal', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('doctor-card-d1'));
      expect(screen.getByTestId('doctor-modal')).toBeTruthy();
    });

    test('modal shows doctor details', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('doctor-card-d1'));
      expect(screen.getByText('Board-certified family medicine physician with focus on preventive care.')).toBeTruthy();
      expect(screen.getByText(/Harvard Medical School/)).toBeTruthy();
    });

    test('modal shows insurance accepted', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('doctor-card-d1'));
      expect(screen.getByText('BlueCross')).toBeTruthy();
      expect(screen.getByText('Aetna')).toBeTruthy();
    });

    test('modal shows available days', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('doctor-card-d1'));
      expect(screen.getByText('Monday')).toBeTruthy();
      expect(screen.getByText('Friday')).toBeTruthy();
    });

    test('close button closes modal', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('doctor-card-d1'));
      fireEvent.press(screen.getByTestId('close-doctor-modal'));
      expect(screen.queryByTestId('doctor-modal')).toBeNull();
    });

    test('Book Appointment button opens booking modal', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('doctor-card-d1'));
      fireEvent.press(screen.getByTestId('book-from-profile'));
      expect(screen.getByTestId('booking-modal')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // BOOKING MODAL
  // ═══════════════════════════════════════════════════════

  describe('Booking Modal', () => {
    const openBookingForDoctor = () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('book-doctor-d1'));
    };

    test('booking modal opens with doctor info', () => {
      openBookingForDoctor();
      expect(screen.getByTestId('booking-modal')).toBeTruthy();
      expect(screen.getByText('Dr. Sarah Chen')).toBeTruthy();
      expect(screen.getByText('Book Appointment')).toBeTruthy();
    });

    test('reason input is present', () => {
      openBookingForDoctor();
      expect(screen.getByTestId('booking-reason-input')).toBeTruthy();
    });

    test('notes input is present', () => {
      openBookingForDoctor();
      expect(screen.getByTestId('booking-notes-input')).toBeTruthy();
    });

    test('close button closes booking modal', () => {
      openBookingForDoctor();
      fireEvent.press(screen.getByTestId('close-booking-modal'));
      expect(screen.queryByTestId('booking-modal')).toBeNull();
    });

    test('confirm button is disabled without required fields', () => {
      openBookingForDoctor();
      const confirmBtn = screen.getByTestId('confirm-booking-btn');
      // Button should have opacity 0.5 (disabled state) or be disabled
      expect(confirmBtn).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // APPOINTMENTS TAB
  // ═══════════════════════════════════════════════════════

  describe('Appointments Tab', () => {
    test('renders upcoming appointments section', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      expect(screen.getByText(/Upcoming \(2\)/)).toBeTruthy();
    });

    test('renders past appointments section', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      expect(screen.getByText(/Past Appointments \(3\)/)).toBeTruthy();
    });

    test('upcoming appointments display doctor info', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      expect(screen.getByTestId('appointment-a3')).toBeTruthy();
      expect(screen.getByTestId('appointment-a4')).toBeTruthy();
    });

    test('past appointments show completed status', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      expect(screen.getByTestId('past-appointment-a1')).toBeTruthy();
      expect(screen.getByTestId('past-appointment-a2')).toBeTruthy();
    });

    test('upcoming appointments show cancel button', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      expect(screen.getByTestId('cancel-apt-a3')).toBeTruthy();
    });

    test('past appointment with prescriptions shows count', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      // a1 has 1 prescription, a5 has 2 prescriptions
      expect(screen.getByText(/1 prescription/)).toBeTruthy();
      expect(screen.getByText(/2 prescriptions/)).toBeTruthy();
    });

    test('clicking appointment opens detail modal', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('appointment-a3'));
      expect(screen.getByTestId('appointment-detail-modal')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // APPOINTMENT DETAIL MODAL
  // ═══════════════════════════════════════════════════════

  describe('Appointment Detail Modal', () => {
    test('shows appointment details', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('past-appointment-a1'));
      expect(screen.getByText('Dr. Sarah Chen')).toBeTruthy();
      expect(screen.getByText('Annual physical exam')).toBeTruthy();
    });

    test('shows doctor notes for completed appointments', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('past-appointment-a1'));
      expect(screen.getByText('All vitals normal. Follow-up in 12 months.')).toBeTruthy();
    });

    test('shows prescriptions for appointments that have them', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('past-appointment-a5'));
      expect(screen.getByText(/Sumatriptan/)).toBeTruthy();
      expect(screen.getByText(/Topiramate/)).toBeTruthy();
    });

    test('upcoming appointment detail shows cancel button', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('appointment-a3'));
      expect(screen.getByTestId('cancel-from-detail')).toBeTruthy();
    });

    test('close button closes detail modal', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('appointment-a3'));
      fireEvent.press(screen.getByTestId('close-apt-detail'));
      expect(screen.queryByTestId('appointment-detail-modal')).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════
  // CANCEL APPOINTMENT
  // ═══════════════════════════════════════════════════════

  describe('Cancel Appointment', () => {
    test('cancel button opens confirmation modal', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('cancel-apt-a3'));
      expect(screen.getByTestId('cancel-confirm-modal')).toBeTruthy();
      expect(screen.getByText('Cancel Appointment?')).toBeTruthy();
    });

    test('keep button closes confirmation modal', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('cancel-apt-a3'));
      fireEvent.press(screen.getByTestId('keep-appointment-btn'));
      expect(screen.queryByTestId('cancel-confirm-modal')).toBeNull();
    });

    test('confirming cancel removes appointment', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('cancel-apt-a3'));
      fireEvent.press(screen.getByTestId('confirm-cancel-btn'));
      expect(screen.queryByTestId('appointment-a3')).toBeNull();
      expect(screen.getByText(/Upcoming \(1\)/)).toBeTruthy();
    });

    test('cancellation adds notification', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-appointments'));
      fireEvent.press(screen.getByTestId('cancel-apt-a3'));
      fireEvent.press(screen.getByTestId('confirm-cancel-btn'));
      // Go to home and check notifications
      fireEvent.press(screen.getByTestId('tab-home'));
      expect(screen.getByText('Appointment Cancelled')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // NOTIFICATION PANEL
  // ═══════════════════════════════════════════════════════

  describe('Notification Panel', () => {
    test('bell opens notification panel', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('notification-bell'));
      expect(screen.getByTestId('notification-panel')).toBeTruthy();
    });

    test('notification panel shows all notifications', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('notification-bell'));
      expect(screen.getByTestId('notif-panel-n1')).toBeTruthy();
      expect(screen.getByTestId('notif-panel-n2')).toBeTruthy();
      expect(screen.getByTestId('notif-panel-n3')).toBeTruthy();
    });

    test('mark all read button works', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('notification-bell'));
      fireEvent.press(screen.getByTestId('mark-all-read'));
      fireEvent.press(screen.getByTestId('close-notif-panel'));
      // Badge count should disappear (all read)
      expect(screen.queryByText('3')).toBeNull();
    });

    test('clear all button removes all notifications', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('notification-bell'));
      fireEvent.press(screen.getByTestId('clear-all-notifs'));
      expect(screen.getByText('No notifications')).toBeTruthy();
    });

    test('close button closes notification panel', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('notification-bell'));
      fireEvent.press(screen.getByTestId('close-notif-panel'));
      expect(screen.queryByTestId('notification-panel')).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════
  // PROFILE TAB - INFO
  // ═══════════════════════════════════════════════════════

  describe('Profile Tab - Info', () => {
    test('renders profile header with patient info', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByText('Alex Johnson')).toBeTruthy();
      expect(screen.getByText('alex.johnson@email.com')).toBeTruthy();
      expect(screen.getByText('(555) 123-4567')).toBeTruthy();
    });

    test('renders profile avatar initials', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByText('AJ')).toBeTruthy();
    });

    test('renders sub-navigation tabs', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByTestId('profile-nav-info')).toBeTruthy();
      expect(screen.getByTestId('profile-nav-prescriptions')).toBeTruthy();
      expect(screen.getByTestId('profile-nav-history')).toBeTruthy();
      expect(screen.getByTestId('profile-nav-settings')).toBeTruthy();
    });

    test('info section shows personal information', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByText('Personal Information')).toBeTruthy();
      expect(screen.getByText('Male')).toBeTruthy();
      expect(screen.getByText('O+')).toBeTruthy();
    });

    test('info section shows insurance details', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByText('Insurance')).toBeTruthy();
      expect(screen.getByText('BlueCross BlueShield')).toBeTruthy();
      expect(screen.getByText('BCB-98765432')).toBeTruthy();
    });

    test('info section shows allergies', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByText(/Penicillin/)).toBeTruthy();
      expect(screen.getByText(/Shellfish/)).toBeTruthy();
    });

    test('info section shows conditions', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByText('Mild hypertension')).toBeTruthy();
      expect(screen.getByText('Seasonal allergies')).toBeTruthy();
    });

    test('info section shows emergency contact', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      expect(screen.getByText('Emergency Contact')).toBeTruthy();
      expect(screen.getByText('Maria Johnson')).toBeTruthy();
      expect(screen.getByText('Spouse')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // PROFILE TAB - PRESCRIPTIONS
  // ═══════════════════════════════════════════════════════

  describe('Profile Tab - Prescriptions', () => {
    test('prescriptions sub-view shows all prescriptions', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-prescriptions'));
      expect(screen.getByTestId('prescriptions-section')).toBeTruthy();
      expect(screen.getByTestId('prescription-rx1')).toBeTruthy();
      expect(screen.getByTestId('prescription-rx2')).toBeTruthy();
      expect(screen.getByTestId('prescription-rx3')).toBeTruthy();
    });

    test('prescriptions show correct details', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-prescriptions'));
      expect(screen.getByText('Vitamin D3')).toBeTruthy();
      expect(screen.getByText('2000 IU daily')).toBeTruthy();
      expect(screen.getByText('90 days')).toBeTruthy();
    });

    test('prescriptions show prescribing doctor', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-prescriptions'));
      expect(screen.getByText('Prescribed by Dr. Sarah Chen')).toBeTruthy();
    });

    test('prescription count header is correct', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-prescriptions'));
      expect(screen.getByText(/Active Prescriptions \(3\)/)).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // PROFILE TAB - HISTORY
  // ═══════════════════════════════════════════════════════

  describe('Profile Tab - History', () => {
    test('history sub-view shows medical history', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-history'));
      expect(screen.getByTestId('history-section')).toBeTruthy();
    });

    test('history entries display correct info', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-history'));
      expect(screen.getByText('Complete blood count')).toBeTruthy();
      expect(screen.getByText('Chest X-ray')).toBeTruthy();
      expect(screen.getByText('Flu vaccination')).toBeTruthy();
    });

    test('history entries show result badges', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-history'));
      expect(screen.getByText('Normal')).toBeTruthy();
      expect(screen.getByText('Clear')).toBeTruthy();
      expect(screen.getByText('Borderline high cholesterol')).toBeTruthy();
    });

    test('history entries show provider', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-history'));
      expect(screen.getByText('City Medical Lab')).toBeTruthy();
      expect(screen.getByText('Sleep Center')).toBeTruthy();
    });

    test('all history entries are rendered', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-history'));
      expect(screen.getByTestId('history-mh1')).toBeTruthy();
      expect(screen.getByTestId('history-mh2')).toBeTruthy();
      expect(screen.getByTestId('history-mh3')).toBeTruthy();
      expect(screen.getByTestId('history-mh4')).toBeTruthy();
      expect(screen.getByTestId('history-mh5')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // PROFILE TAB - SETTINGS
  // ═══════════════════════════════════════════════════════

  describe('Profile Tab - Settings', () => {
    test('settings sub-view shows toggles', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-settings'));
      expect(screen.getByTestId('settings-section')).toBeTruthy();
      expect(screen.getByTestId('dark-mode-toggle')).toBeTruthy();
      expect(screen.getByTestId('reminder-toggle')).toBeTruthy();
    });

    test('dark mode toggle labels are present', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-settings'));
      expect(screen.getByText('Dark Mode')).toBeTruthy();
      expect(screen.getByText('Switch to dark theme')).toBeTruthy();
    });

    test('reminder toggle labels are present', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-settings'));
      expect(screen.getByText('Appointment Reminders')).toBeTruthy();
      expect(screen.getByText('Get notified before appointments')).toBeTruthy();
    });

    test('reminder hours options are visible when reminders enabled', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('profile-nav-settings'));
      expect(screen.getByTestId('reminder-1h')).toBeTruthy();
      expect(screen.getByTestId('reminder-12h')).toBeTruthy();
      expect(screen.getByTestId('reminder-24h')).toBeTruthy();
      expect(screen.getByTestId('reminder-48h')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // EDIT PROFILE MODAL
  // ═══════════════════════════════════════════════════════

  describe('Edit Profile Modal', () => {
    test('edit profile button opens modal', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('edit-profile-btn'));
      expect(screen.getByTestId('edit-profile-modal')).toBeTruthy();
    });

    test('edit profile modal has all input fields', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('edit-profile-btn'));
      expect(screen.getByTestId('edit-phone-input')).toBeTruthy();
      expect(screen.getByTestId('edit-email-input')).toBeTruthy();
      expect(screen.getByTestId('edit-emergency-name-input')).toBeTruthy();
      expect(screen.getByTestId('edit-emergency-phone-input')).toBeTruthy();
    });

    test('save profile updates the displayed info', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('edit-profile-btn'));
      fireEvent.changeText(screen.getByTestId('edit-phone-input'), '(555) 999-8888');
      fireEvent.changeText(screen.getByTestId('edit-email-input'), 'newemail@test.com');
      fireEvent.press(screen.getByTestId('save-profile-btn'));
      // Modal should close and profile should show updated info
      expect(screen.getByText('(555) 999-8888')).toBeTruthy();
      expect(screen.getByText('newemail@test.com')).toBeTruthy();
    });

    test('close button closes edit modal without saving', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-profile'));
      fireEvent.press(screen.getByTestId('edit-profile-btn'));
      fireEvent.changeText(screen.getByTestId('edit-phone-input'), '(555) 999-8888');
      fireEvent.press(screen.getByTestId('close-edit-profile'));
      // Original phone should still be shown
      expect(screen.getByText('(555) 123-4567')).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════

  describe('AsyncStorage Persistence', () => {
    test('appointments are saved to AsyncStorage', () => {
      render(<HealthcareApp />);
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
        'hc_appointments',
        expect.any(String)
      );
    });

    test('favorites are saved to AsyncStorage', () => {
      render(<HealthcareApp />);
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
        'hc_favorites',
        expect.any(String)
      );
    });

    test('profile is saved to AsyncStorage', () => {
      render(<HealthcareApp />);
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
        'hc_profile',
        expect.any(String)
      );
    });

    test('notifications are saved to AsyncStorage', () => {
      render(<HealthcareApp />);
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
        'hc_notifications',
        expect.any(String)
      );
    });

    test('dark mode preference is saved', () => {
      render(<HealthcareApp />);
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
        'hc_darkMode',
        expect.any(String)
      );
    });

    test('reminder preference is saved', () => {
      render(<HealthcareApp />);
      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
        'hc_reminderEnabled',
        expect.any(String)
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // CROSS-CUTTING INTERACTIONS
  // ═══════════════════════════════════════════════════════

  describe('Cross-cutting Interactions', () => {
    test('quick-prescriptions navigates to prescriptions sub-view', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('quick-prescriptions'));
      expect(screen.getByTestId('prescriptions-section')).toBeTruthy();
    });

    test('quick-history navigates to history sub-view', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('quick-history'));
      expect(screen.getByTestId('history-section')).toBeTruthy();
    });

    test('booking from favorites creates new appointment', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('book-fav-d1'));
      expect(screen.getByTestId('booking-modal')).toBeTruthy();
      expect(screen.getByText('Dr. Sarah Chen')).toBeTruthy();
    });

    test('search and specialty filter work together', () => {
      render(<HealthcareApp />);
      fireEvent.press(screen.getByTestId('tab-doctors'));
      fireEvent.press(screen.getByTestId('specialty-pediatrics'));
      expect(screen.getByText('Dr. Emily Nakamura')).toBeTruthy();
      expect(screen.getByText('1 doctors')).toBeTruthy();
      fireEvent.changeText(screen.getByTestId('doctor-search-input'), 'NonExistent');
      expect(screen.getByText('0 doctors')).toBeTruthy();
    });
  });
});
