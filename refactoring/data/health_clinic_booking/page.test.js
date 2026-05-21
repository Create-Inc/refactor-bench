import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import HealthClinicBooking from './src/app/page.jsx';

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

window.confirm = vi.fn();

describe('HealthClinicBooking Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with MediCare Clinic title', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText('MediCare Clinic')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Appointments')).toBeInTheDocument();
      expect(screen.getByText('Patients')).toBeInTheDocument();
      expect(screen.getByText('Doctors')).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByPlaceholderText('Search patients, doctors, appointments...')).toBeInTheDocument();
    });

    test('renders New Patient button', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText('+ New Patient')).toBeInTheDocument();
    });

    test('renders Book Appointment button', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText('+ Book Appointment')).toBeInTheDocument();
    });

    test('renders dashboard by default', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
    });

    test('renders sidebar stats', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText(/registered patients/)).toBeInTheDocument();
      expect(screen.getByText(/active appointments/)).toBeInTheDocument();
    });

    test('renders theme toggle button', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('toggling theme saves to localStorage', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('clinicTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<HealthClinicBooking />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('clinicTheme', 'light');
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Dashboard shows dashboard view', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      fireEvent.click(screen.getByText('Dashboard'));
      expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
    });

    test('clicking Appointments shows appointments view', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      expect(screen.getByText(/appointments$/)).toBeInTheDocument();
    });

    test('clicking Patients shows patients view', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Carlos Martinez')).toBeInTheDocument();
    });

    test('clicking Doctors shows doctors view', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('Dr. James Rivera')).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('clinicActiveView', 'patients');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Appointments')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<HealthClinicBooking />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Dashboard', () => {
    test('shows stat cards', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
      expect(screen.getByText('Upcoming')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Total Patients')).toBeInTheDocument();
    });

    test('shows correct total patient count', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText('4')).toBeInTheDocument(); // 4 initial patients
    });

    test('shows upcoming appointments section', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
    });

    test('shows recent patients section', () => {
      render(<HealthClinicBooking />);
      expect(screen.getByText('Recent Patients')).toBeInTheDocument();
    });

    test('clicking a patient in recent patients navigates to patient detail', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Erik Patel'));
      expect(screen.getByText(/Back to Patients/)).toBeInTheDocument();
    });
  });

  describe('Appointments View', () => {
    test('shows appointments table with headers', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      expect(screen.getByText('Patient')).toBeInTheDocument();
      expect(screen.getByText('Doctor')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('shows appointment data', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Carlos Martinez')).toBeInTheDocument();
    });

    test('shows status filter dropdown', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });

    test('filtering by status shows only matching appointments', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });
      expect(screen.getByText('Carlos Martinez')).toBeInTheDocument();
      // Alice Johnson's appointments are confirmed, not pending
      const rows = screen.queryAllByText('Alice Johnson');
      expect(rows.length).toBe(0);
    });

    test('confirm button appears for pending appointments', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    test('confirming appointment changes status', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });
      fireEvent.click(screen.getByText('Confirm'));
      // After confirming, no more pending - should show empty
      expect(screen.getByText('No appointments found')).toBeInTheDocument();
    });

    test('cancel button requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming cancel changes appointment status', () => {
      window.confirm.mockReturnValue(true);
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      const initialCount = screen.getAllByText(/Cancel/).length;
      // cancel buttons exist for non-cancelled/non-completed appointments
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
      // After cancelling, there should be one fewer Cancel button
      const newCancelButtons = screen.queryAllByText('Cancel');
      expect(newCancelButtons.length).toBe(initialCount - 1);
    });

    test('search filters appointments', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Appointments'));
      const searchInput = screen.getByPlaceholderText('Search patients, doctors, appointments...');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Carlos Martinez')).not.toBeInTheDocument();
    });
  });

  describe('Patients View', () => {
    test('shows patient cards', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Carlos Martinez')).toBeInTheDocument();
      expect(screen.getByText('Diana Lee')).toBeInTheDocument();
      expect(screen.getByText('Erik Patel')).toBeInTheDocument();
    });

    test('patient cards show insurance', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      expect(screen.getByText('BlueCross')).toBeInTheDocument();
      expect(screen.getByText('Aetna')).toBeInTheDocument();
    });

    test('patient cards show allergy warnings', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      const allergyWarnings = screen.getAllByText('Allergies noted');
      expect(allergyWarnings.length).toBeGreaterThan(0);
    });

    test('patient cards show appointment count', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      expect(screen.getByText('2 appointments')).toBeInTheDocument(); // Alice has 2
    });

    test('search filters patients', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      const searchInput = screen.getByPlaceholderText('Search patients, doctors, appointments...');
      fireEvent.change(searchInput, { target: { value: 'Diana' } });
      expect(screen.getByText('Diana Lee')).toBeInTheDocument();
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    test('search by email filters patients', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      const searchInput = screen.getByPlaceholderText('Search patients, doctors, appointments...');
      fireEvent.change(searchInput, { target: { value: 'carlos@' } });
      expect(screen.getByText('Carlos Martinez')).toBeInTheDocument();
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    test('clicking patient card opens patient detail', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText(/Back to Patients/)).toBeInTheDocument();
    });

    test('patient count is displayed', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      expect(screen.getByText('4 patients')).toBeInTheDocument();
    });
  });

  describe('Patient Detail', () => {
    test('shows patient info', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('555-0101')).toBeInTheDocument();
    });

    test('shows insurance info', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText(/BlueCross/)).toBeInTheDocument();
      expect(screen.getByText(/BC-123456/)).toBeInTheDocument();
    });

    test('shows allergies with emphasis for non-None', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('Penicillin')).toBeInTheDocument();
    });

    test('shows emergency contact info', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('555-0102')).toBeInTheDocument();
    });

    test('shows appointment history', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText('Appointment History')).toBeInTheDocument();
      expect(screen.getByText(/Check-up/)).toBeInTheDocument();
    });

    test('shows visit notes for patient with completed visits', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Diana Lee'));
      expect(screen.getByText('Visit Notes')).toBeInTheDocument();
      expect(screen.getByText('Type 2 Diabetes - well controlled')).toBeInTheDocument();
    });

    test('shows vitals in visit notes', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Diana Lee'));
      expect(screen.getByText('128/82')).toBeInTheDocument();
    });

    test('back button returns to patients list', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByText(/Back to Patients/));
      expect(screen.getByText('4 patients')).toBeInTheDocument();
    });

    test('edit button opens patient modal with pre-filled data', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByLabelText('Edit patient'));
      expect(screen.getByText('Edit Patient')).toBeInTheDocument();
    });

    test('delete button requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByLabelText('Delete patient'));
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming delete removes patient', () => {
      window.confirm.mockReturnValue(true);
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      fireEvent.click(screen.getByLabelText('Delete patient'));
      // Should go back to patients list with 3 patients
      expect(screen.getByText('3 patients')).toBeInTheDocument();
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });
  });

  describe('Doctors View', () => {
    test('shows doctor cards', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('Dr. James Rivera')).toBeInTheDocument();
      expect(screen.getByText('Dr. Emily Park')).toBeInTheDocument();
      expect(screen.getByText('Dr. Michael Torres')).toBeInTheDocument();
      expect(screen.getByText('Dr. Lisa Nguyen')).toBeInTheDocument();
      expect(screen.getByText('Dr. Robert Kim')).toBeInTheDocument();
    });

    test('doctor cards show specialties', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      expect(screen.getByText('General Practice')).toBeInTheDocument();
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
      expect(screen.getByText('Dermatology')).toBeInTheDocument();
    });

    test('specialty filter works', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      const specialtyFilter = screen.getByLabelText('Filter by specialty');
      fireEvent.change(specialtyFilter, { target: { value: 'Cardiology' } });
      expect(screen.getByText('Dr. James Rivera')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Chen')).not.toBeInTheDocument();
    });

    test('search filters doctors by name', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      const searchInput = screen.getByPlaceholderText('Search patients, doctors, appointments...');
      fireEvent.change(searchInput, { target: { value: 'Kim' } });
      expect(screen.getByText('Dr. Robert Kim')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Chen')).not.toBeInTheDocument();
    });

    test('search filters doctors by specialty', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      const searchInput = screen.getByPlaceholderText('Search patients, doctors, appointments...');
      fireEvent.change(searchInput, { target: { value: 'Pediatrics' } });
      expect(screen.getByText('Dr. Lisa Nguyen')).toBeInTheDocument();
      expect(screen.queryByText('Dr. Sarah Chen')).not.toBeInTheDocument();
    });

    test('clicking doctor card opens doctor detail', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      fireEvent.click(screen.getByText('Dr. Sarah Chen'));
      expect(screen.getByText(/Back to Doctors/)).toBeInTheDocument();
    });

    test('doctor count is displayed', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      expect(screen.getByText('6 doctors')).toBeInTheDocument();
    });
  });

  describe('Doctor Detail', () => {
    test('shows doctor bio', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      fireEvent.click(screen.getByText('Dr. Sarah Chen'));
      expect(screen.getByText(/Board-certified family medicine/)).toBeInTheDocument();
    });

    test('shows years of experience', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      fireEvent.click(screen.getByText('Dr. Sarah Chen'));
      expect(screen.getByText(/12 years experience/)).toBeInTheDocument();
    });

    test('shows available days', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      fireEvent.click(screen.getByText('Dr. Sarah Chen'));
      expect(screen.getByText('Available Days')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
    });

    test('shows appointment schedule', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      fireEvent.click(screen.getByText('Dr. Sarah Chen'));
      expect(screen.getByText('Appointment Schedule')).toBeInTheDocument();
    });

    test('back button returns to doctors list', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      fireEvent.click(screen.getByText('Dr. Sarah Chen'));
      fireEvent.click(screen.getByText(/Back to Doctors/));
      expect(screen.getByText('6 doctors')).toBeInTheDocument();
    });
  });

  describe('Patient Intake Modal - Multi-Step Form', () => {
    test('clicking New Patient opens intake modal', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      expect(screen.getByText('New Patient Registration')).toBeInTheDocument();
    });

    test('shows step 1 (Personal Info) by default', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByText('First Name *')).toBeInTheDocument();
      expect(screen.getByText('Last Name *')).toBeInTheDocument();
      expect(screen.getByText('Email *')).toBeInTheDocument();
    });

    test('shows step indicators', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByText('Insurance')).toBeInTheDocument();
      expect(screen.getByText('Emergency & Medical')).toBeInTheDocument();
    });

    test('step 1 validation shows errors for empty fields', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone is required')).toBeInTheDocument();
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
    });

    test('step 1 validates email format', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      const inputs = document.querySelectorAll('input');
      // First Name
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      // Last Name
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      // Email (invalid)
      fireEvent.change(inputs[3], { target: { value: 'notanemail' } });
      // Phone
      fireEvent.change(inputs[4], { target: { value: '555-1234' } });
      // DOB
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    test('step 1 validates phone format', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      const inputs = document.querySelectorAll('input');
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      fireEvent.change(inputs[3], { target: { value: 'john@example.com' } });
      fireEvent.change(inputs[4], { target: { value: '12345' } });
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Phone format: 555-0101')).toBeInTheDocument();
    });

    test('valid step 1 advances to step 2', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      const inputs = document.querySelectorAll('input');
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      fireEvent.change(inputs[3], { target: { value: 'john@example.com' } });
      fireEvent.change(inputs[4], { target: { value: '555-1234' } });
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Insurance Provider *')).toBeInTheDocument();
    });

    test('step 2 validates insurance selection', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      // Fill step 1
      const inputs = document.querySelectorAll('input');
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      fireEvent.change(inputs[3], { target: { value: 'john@example.com' } });
      fireEvent.change(inputs[4], { target: { value: '555-1234' } });
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      // Try to proceed without selecting insurance
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Insurance provider is required')).toBeInTheDocument();
    });

    test('step 2 shows insurance ID field when insurance is not None', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      const inputs = document.querySelectorAll('input');
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      fireEvent.change(inputs[3], { target: { value: 'john@example.com' } });
      fireEvent.change(inputs[4], { target: { value: '555-1234' } });
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      // Select BlueCross
      const selects = document.querySelectorAll('select');
      fireEvent.change(selects[0], { target: { value: 'BlueCross' } });
      expect(screen.getByText('Insurance ID *')).toBeInTheDocument();
    });

    test('step 2 does not show insurance ID when insurance is None', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      const inputs = document.querySelectorAll('input');
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      fireEvent.change(inputs[3], { target: { value: 'john@example.com' } });
      fireEvent.change(inputs[4], { target: { value: '555-1234' } });
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      const selects = document.querySelectorAll('select');
      fireEvent.change(selects[0], { target: { value: 'None' } });
      expect(screen.queryByText('Insurance ID *')).not.toBeInTheDocument();
    });

    test('back button returns to previous step', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      const inputs = document.querySelectorAll('input');
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      fireEvent.change(inputs[3], { target: { value: 'john@example.com' } });
      fireEvent.change(inputs[4], { target: { value: '555-1234' } });
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Insurance Provider *')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('First Name *')).toBeInTheDocument();
    });

    test('completing all steps registers new patient', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      // Step 1
      const inputs = document.querySelectorAll('input');
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      fireEvent.change(inputs[3], { target: { value: 'john@example.com' } });
      fireEvent.change(inputs[4], { target: { value: '555-1234' } });
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      // Step 2
      const selects = document.querySelectorAll('select');
      fireEvent.change(selects[0], { target: { value: 'None' } });
      fireEvent.click(screen.getByText('Next'));
      // Step 3
      const step3Inputs = document.querySelectorAll('input');
      // Find emergency contact and phone inputs (after allergies and medications)
      fireEvent.change(step3Inputs[3], { target: { value: 'Jane Doe' } });
      fireEvent.change(step3Inputs[4], { target: { value: '555-5678' } });
      fireEvent.click(screen.getByText('Register Patient'));
      // Modal should close, patient should appear in list
      expect(screen.queryByText('New Patient Registration')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('Patients'));
      expect(screen.getByText('5 patients')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('step 3 validates emergency contact fields', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      // Step 1
      const inputs = document.querySelectorAll('input');
      fireEvent.change(inputs[1], { target: { value: 'John' } });
      fireEvent.change(inputs[2], { target: { value: 'Doe' } });
      fireEvent.change(inputs[3], { target: { value: 'john@example.com' } });
      fireEvent.change(inputs[4], { target: { value: '555-1234' } });
      fireEvent.change(inputs[5], { target: { value: '1990-01-01' } });
      fireEvent.click(screen.getByText('Next'));
      // Step 2
      const selects = document.querySelectorAll('select');
      fireEvent.change(selects[0], { target: { value: 'None' } });
      fireEvent.click(screen.getByText('Next'));
      // Step 3 - try to submit without emergency info
      fireEvent.click(screen.getByText('Register Patient'));
      expect(screen.getByText('Emergency contact name is required')).toBeInTheDocument();
      expect(screen.getByText('Emergency phone is required')).toBeInTheDocument();
    });

    test('close button closes modal', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      expect(screen.getByText('New Patient Registration')).toBeInTheDocument();
      fireEvent.click(screen.getByText('\u00D7'));
      expect(screen.queryByText('New Patient Registration')).not.toBeInTheDocument();
    });
  });

  describe('Booking Modal', () => {
    test('clicking Book Appointment opens booking modal', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ Book Appointment'));
      expect(screen.getByText('Book Appointment')).toBeInTheDocument();
    });

    test('shows patient, doctor, date, time, type fields', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ Book Appointment'));
      expect(screen.getByText('Patient *')).toBeInTheDocument();
      expect(screen.getByText('Doctor *')).toBeInTheDocument();
      expect(screen.getByText('Date *')).toBeInTheDocument();
      expect(screen.getByText('Time *')).toBeInTheDocument();
      expect(screen.getByText('Appointment Type *')).toBeInTheDocument();
    });

    test('validation shows errors for empty fields', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ Book Appointment'));
      fireEvent.click(screen.getByText('Book Appointment'));
      expect(screen.getByText('Select a patient')).toBeInTheDocument();
      expect(screen.getByText('Select a doctor')).toBeInTheDocument();
      expect(screen.getByText('Select a date')).toBeInTheDocument();
      expect(screen.getByText('Select a time slot')).toBeInTheDocument();
      expect(screen.getByText('Select appointment type')).toBeInTheDocument();
    });

    test('patient dropdown shows all patients', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ Book Appointment'));
      const selects = document.querySelectorAll('select');
      const patientSelect = selects[0];
      expect(patientSelect.querySelectorAll('option').length).toBe(5); // 4 patients + placeholder
    });

    test('booking modal has notes textarea', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ Book Appointment'));
      expect(screen.getByPlaceholderText('Reason for visit...')).toBeInTheDocument();
    });

    test('cancel button closes booking modal', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ Book Appointment'));
      expect(screen.getByText('Book Appointment')).toBeInTheDocument();
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText('Patient *')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes patient modal', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ New Patient'));
      expect(screen.getByText('New Patient Registration')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('New Patient Registration')).not.toBeInTheDocument();
    });

    test('Escape closes booking modal', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('+ Book Appointment'));
      expect(screen.getByText('Book Appointment')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Patient *')).not.toBeInTheDocument();
    });

    test('Escape closes patient detail', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Patients'));
      fireEvent.click(screen.getByText('Alice Johnson'));
      expect(screen.getByText(/Back to Patients/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Back to Patients/)).not.toBeInTheDocument();
    });

    test('Escape closes doctor detail', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      fireEvent.click(screen.getByText('Dr. Sarah Chen'));
      expect(screen.getByText(/Back to Doctors/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Back to Doctors/)).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('patients are saved to localStorage', () => {
      render(<HealthClinicBooking />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'clinicPatients',
        expect.any(String)
      );
    });

    test('appointments are saved to localStorage', () => {
      render(<HealthClinicBooking />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'clinicAppointments',
        expect.any(String)
      );
    });

    test('visit notes are saved to localStorage', () => {
      render(<HealthClinicBooking />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'clinicVisitNotes',
        expect.any(String)
      );
    });

    test('active view is saved to localStorage', () => {
      render(<HealthClinicBooking />);
      fireEvent.click(screen.getByText('Doctors'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('clinicActiveView', 'doctors');
    });

    test('saved active view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'clinicActiveView') return 'doctors';
        return null;
      });
      render(<HealthClinicBooking />);
      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'clinicPatients') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<HealthClinicBooking />)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<HealthClinicBooking />)).not.toThrow();
    });
  });
});
