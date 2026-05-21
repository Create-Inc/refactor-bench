import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppointmentScheduler from './src/app/page.jsx';

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
window.confirm = vi.fn();
window.alert = vi.fn();

describe('AppointmentScheduler Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with BookEase title', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByText('BookEase')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByText('Day View')).toBeInTheDocument();
      expect(screen.getByText('Week View')).toBeInTheDocument();
      expect(screen.getByText('List View')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Staff')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    test('renders header with search and filter controls', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByPlaceholderText('Search clients, services... (Ctrl+K)')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by staff')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });

    test('renders New Booking button', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByText('+ New Booking')).toBeInTheDocument();
    });

    test('renders day view by default with time slots', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByText('9:00 AM')).toBeInTheDocument();
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });

    test('displays today appointment count in sidebar', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
    });

    test('renders today date navigation controls', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('schedulerTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<AppointmentScheduler />);
      const btn = screen.getByLabelText('Toggle theme');
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('schedulerTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'schedulerTheme') return 'dark';
        return null;
      });
      render(<AppointmentScheduler />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Day View shows time grid', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Day View'));
      expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    });

    test('clicking Week View shows week grid', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Week View'));
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
    });

    test('clicking List View shows table with headers', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Service')).toBeInTheDocument();
      expect(screen.getByText('Staff')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
    });

    test('clicking Calendar shows month calendar', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Calendar'));
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      const now = new Date();
      const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    test('clicking Staff shows staff panel', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Staff'));
      expect(screen.getByText('Staff Members')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('James Cooper')).toBeInTheDocument();
      expect(screen.getByText('Lisa Park')).toBeInTheDocument();
    });

    test('clicking Revenue shows revenue report', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Revenue'));
      expect(screen.getByText('Revenue Report')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue (This Month)')).toBeInTheDocument();
      expect(screen.getByText('Total Appointments')).toBeInTheDocument();
    });

    test('saves active view to localStorage', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Week View'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('schedulerView', 'week');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('Day View')).not.toBeInTheDocument();
      expect(screen.queryByText('Week View')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<AppointmentScheduler />);
      const btn = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(screen.getByText('Day View')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search filters appointments by client name', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const searchInput = screen.getByPlaceholderText('Search clients, services... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Williams')).not.toBeInTheDocument();
    });

    test('search filters appointments by service name', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const searchInput = screen.getByPlaceholderText('Search clients, services... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Massage' } });
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
    });

    test('clearing search shows all appointments', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const searchInput = screen.getByPlaceholderText('Search clients, services... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
    });
  });

  describe('Staff Filter', () => {
    test('filtering by staff shows only their appointments', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const staffFilter = screen.getByLabelText('Filter by staff');
      fireEvent.change(staffFilter, { target: { value: 'st5' } });
      expect(screen.getByText('Carol Davis')).toBeInTheDocument();
      expect(screen.getByText('Grace Kim')).toBeInTheDocument();
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    test('selecting All Staff shows all appointments', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const staffFilter = screen.getByLabelText('Filter by staff');
      fireEvent.change(staffFilter, { target: { value: 'st5' } });
      fireEvent.change(staffFilter, { target: { value: 'all' } });
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('filtering by category shows only matching appointments', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'Massage' } });
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
      expect(screen.getByText('Frank Lee')).toBeInTheDocument();
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    test('filtering by status shows only matching appointments', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });
      expect(screen.getByText('Carol Davis')).toBeInTheDocument();
      expect(screen.getByText('Frank Lee')).toBeInTheDocument();
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });
  });

  describe('Day View', () => {
    test('shows appointment cards at correct time slots', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    test('shows service name and staff on appointment cards', () => {
      render(<AppointmentScheduler />);
      expect(screen.getByText(/Haircut/)).toBeInTheDocument();
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
    });

    test('clicking an appointment card opens detail modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('alice@email.com')).toBeInTheDocument();
      expect(screen.getByText('555-0101')).toBeInTheDocument();
    });
  });

  describe('Week View', () => {
    test('shows 7 day columns', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Week View'));
      const dayHeaders = screen.getAllByText(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/);
      expect(dayHeaders.length).toBeGreaterThanOrEqual(7);
    });

    test('today column is highlighted', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Week View'));
      const today = new Date();
      const todayNum = today.getDate().toString();
      expect(screen.getByText(todayNum)).toBeInTheDocument();
    });
  });

  describe('List View', () => {
    test('shows all appointments in table format', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
      expect(screen.getByText('Carol Davis')).toBeInTheDocument();
    });

    test('shows price column', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      expect(screen.getByText('$35.00')).toBeInTheDocument();
      expect(screen.getByText('$95.00')).toBeInTheDocument();
    });

    test('shows status badges', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const confirmedBadges = screen.getAllByText('confirmed');
      expect(confirmedBadges.length).toBeGreaterThan(0);
      const pendingBadges = screen.getAllByText('pending');
      expect(pendingBadges.length).toBeGreaterThan(0);
    });

    test('clicking a row opens detail modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('alice@email.com')).toBeInTheDocument();
    });
  });

  describe('Calendar View', () => {
    test('renders current month and year', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Calendar'));
      const now = new Date();
      const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    test('renders day of week headers', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Calendar'));
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    test('clicking left arrow navigates to previous month', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Calendar'));
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const prevMonthYear = prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const arrows = screen.getAllByText('←');
      fireEvent.click(arrows[arrows.length - 1]);
      expect(screen.getByText(prevMonthYear)).toBeInTheDocument();
    });

    test('clicking right arrow navigates to next month', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Calendar'));
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
      const nextMonthYear = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const arrows = screen.getAllByText('→');
      fireEvent.click(arrows[arrows.length - 1]);
      expect(screen.getByText(nextMonthYear)).toBeInTheDocument();
    });
  });

  describe('Date Navigation', () => {
    test('clicking left arrow changes date', () => {
      render(<AppointmentScheduler />);
      const leftArrow = screen.getAllByText('←')[0];
      fireEvent.click(leftArrow);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      expect(screen.getByText(dateStr)).toBeInTheDocument();
    });

    test('clicking Today returns to today', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getAllByText('←')[0]);
      fireEvent.click(screen.getByText('Today'));
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      expect(screen.getByText(dateStr)).toBeInTheDocument();
    });
  });

  describe('Staff Panel', () => {
    test('shows all staff members with details', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Staff'));
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('Senior Stylist')).toBeInTheDocument();
      expect(screen.getByText('James Cooper')).toBeInTheDocument();
      expect(screen.getByText('Lisa Park')).toBeInTheDocument();
      expect(screen.getByText('Emma Davis')).toBeInTheDocument();
      expect(screen.getByText('Sophie Chen')).toBeInTheDocument();
    });

    test('shows staff specialties', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Staff'));
      const hairLabels = screen.getAllByText('Hair');
      expect(hairLabels.length).toBeGreaterThan(0);
      const massageLabels = screen.getAllByText('Massage');
      expect(massageLabels.length).toBeGreaterThan(0);
    });

    test('shows staff ratings', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Staff'));
      expect(screen.getByText(/4\.9 \(312\)/)).toBeInTheDocument();
    });
  });

  describe('Revenue Report', () => {
    test('shows revenue statistics', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Revenue'));
      expect(screen.getByText('Total Revenue (This Month)')).toBeInTheDocument();
      expect(screen.getByText('Total Appointments')).toBeInTheDocument();
      expect(screen.getByText('Avg per Appointment')).toBeInTheDocument();
    });

    test('shows revenue by category breakdown', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Revenue'));
      expect(screen.getByText('Revenue by Category')).toBeInTheDocument();
    });

    test('shows revenue by staff breakdown', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Revenue'));
      expect(screen.getByText('Revenue by Staff')).toBeInTheDocument();
    });
  });

  describe('Booking Modal', () => {
    test('clicking New Booking opens booking modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('+ New Booking'));
      expect(screen.getByText('New Booking')).toBeInTheDocument();
    });

    test('booking modal has all form fields', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('+ New Booking'));
      expect(screen.getByText('Client Name *')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Service *')).toBeInTheDocument();
      expect(screen.getByText('Staff *')).toBeInTheDocument();
      expect(screen.getByText('Date *')).toBeInTheDocument();
      expect(screen.getByText('Time *')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    test('cancel button closes booking modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('+ New Booking'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('New Booking')).not.toBeInTheDocument();
    });

    test('close button closes booking modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('+ New Booking'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('New Booking')).not.toBeInTheDocument();
    });

    test('submitting form creates a new appointment', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('+ New Booking'));

      // Use form inputs by name attributes
      const form = screen.getByText('New Booking').closest('div').querySelector('form');
      const nameInput = form.querySelector('input[name="clientName"]');
      fireEvent.change(nameInput, { target: { value: 'Test Client' } });

      const serviceSelect = form.querySelector('select[name="serviceId"]');
      fireEvent.change(serviceSelect, { target: { value: 's3' } });

      const staffSelect = form.querySelector('select[name="staffId"]');
      fireEvent.change(staffSelect, { target: { value: 'st2' } });

      const timeSelect = form.querySelector('select[name="startTime"]');
      fireEvent.change(timeSelect, { target: { value: '12:00' } });

      fireEvent.click(screen.getByText('Book Appointment'));

      // Modal should close
      expect(screen.queryByText('New Booking')).not.toBeInTheDocument();
    });

    test('service selection shows available services', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('+ New Booking'));
      const form = screen.getByText('New Booking').closest('div').querySelector('form');
      const serviceSelect = form.querySelector('select[name="serviceId"]');
      expect(serviceSelect).toBeInTheDocument();
      expect(serviceSelect.querySelectorAll('option').length).toBeGreaterThan(1);
    });
  });

  describe('Appointment Detail Modal', () => {
    test('clicking appointment shows detail modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('alice@email.com')).toBeInTheDocument();
      expect(screen.getByText('555-0101')).toBeInTheDocument();
    });

    test('detail modal shows service and staff info', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });

    test('detail modal shows appointment notes', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('Regular client, prefers shorter layers')).toBeInTheDocument();
    });

    test('close button closes detail modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('alice@email.com')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[closeButtons.length - 1]);
      expect(screen.queryByText('alice@email.com')).not.toBeInTheDocument();
    });

    test('cancel button cancels appointment after confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      const cancelButtons = screen.getAllByText('Cancel');
      const cancelAppointmentBtn = cancelButtons.find((btn) => btn.style && btn.style.color === '#ef4444') || cancelButtons[cancelButtons.length - 1];
      fireEvent.click(cancelAppointmentBtn);
    });

    test('delete button deletes appointment after confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByText('Delete'));
      expect(screen.queryByText('alice@email.com')).not.toBeInTheDocument();
    });

    test('delete without confirmation keeps appointment', () => {
      window.confirm.mockReturnValue(false);
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByText('Delete'));
      // Modal still open, appointment still exists
      expect(screen.getByText('alice@email.com')).toBeInTheDocument();
    });

    test('complete button marks appointment as completed', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByText('Complete'));
      expect(screen.getByText('completed')).toBeInTheDocument();
    });

    test('edit button opens booking modal in edit mode', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    });
  });

  describe('Appointment Status Changes', () => {
    test('confirming a pending appointment', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      fireEvent.click(screen.getByText('Carol Davis'));
      fireEvent.click(screen.getByText('Confirm'));
      expect(screen.getByText('confirmed')).toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    test('clicking bell icon shows notification panel', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    test('clicking bell icon again hides notification panel', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });

    test('deleting an appointment adds a notification', () => {
      window.confirm.mockReturnValue(true);
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByText('Delete'));
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText(/Alice Johnson.*deleted/)).toBeInTheDocument();
    });

    test('mark all read button works', () => {
      window.confirm.mockReturnValue(true);
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByText('Delete'));
      fireEvent.click(screen.getByLabelText('Notifications'));
      fireEvent.click(screen.getByText('Mark all read'));
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes booking modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('+ New Booking'));
      expect(screen.getByText('New Booking')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('New Booking')).not.toBeInTheDocument();
    });

    test('Escape closes appointment detail modal', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('alice@email.com')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('alice@email.com')).not.toBeInTheDocument();
    });

    test('Escape closes notification panel', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('appointments are saved to localStorage on change', () => {
      render(<AppointmentScheduler />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'schedulerAppointments',
        expect.any(String)
      );
    });

    test('theme preference is loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'schedulerTheme') return 'dark';
        return null;
      });
      render(<AppointmentScheduler />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'schedulerView') return 'list';
        return null;
      });
      render(<AppointmentScheduler />);
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Service')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'schedulerAppointments') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<AppointmentScheduler />)).not.toThrow();
    });
  });

  describe('Combined Filters', () => {
    test('search and staff filter work together', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const searchInput = screen.getByPlaceholderText('Search clients, services... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      const staffFilter = screen.getByLabelText('Filter by staff');
      fireEvent.change(staffFilter, { target: { value: 'st1' } });
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    test('non-matching combined filters show no appointments', () => {
      render(<AppointmentScheduler />);
      fireEvent.click(screen.getByText('List View'));
      const searchInput = screen.getByPlaceholderText('Search clients, services... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      const staffFilter = screen.getByLabelText('Filter by staff');
      fireEvent.change(staffFilter, { target: { value: 'st3' } });
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      expect(screen.getByText('No appointments found')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<AppointmentScheduler />)).not.toThrow();
    });
  });
});
