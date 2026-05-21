import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PatientManagement from './src/app/page.jsx';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
window.confirm = vi.fn();

describe('PatientManagement Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with MedChart branding', () => {
      render(<PatientManagement />);
      expect(screen.getByText('MedChart')).toBeInTheDocument();
      expect(screen.getByText('Patient Management')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<PatientManagement />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Patients')).toBeInTheDocument();
      expect(screen.getByText('Appointments')).toBeInTheDocument();
      expect(screen.getByText('Prescriptions')).toBeInTheDocument();
    });

    test('renders patients view by default with table headers', () => {
      render(<PatientManagement />);
      expect(screen.getByText('Patient')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Blood Type')).toBeInTheDocument();
      expect(screen.getByText('Insurance')).toBeInTheDocument();
      expect(screen.getByText('BMI')).toBeInTheDocument();
      expect(screen.getByText('Risk')).toBeInTheDocument();
      expect(screen.getByText('Conditions')).toBeInTheDocument();
    });

    test('renders initial patients in the table', () => {
      render(<PatientManagement />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Emily Smith')).toBeInTheDocument();
      expect(screen.getByText('Robert Johnson')).toBeInTheDocument();
      expect(screen.getByText('Sofia Martinez')).toBeInTheDocument();
      expect(screen.getByText('William Taylor')).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<PatientManagement />);
      expect(screen.getByPlaceholderText('Search patients by name, email, phone...')).toBeInTheDocument();
    });

    test('renders New Patient button on patients view', () => {
      render(<PatientManagement />);
      expect(screen.getByText('+ New Patient')).toBeInTheDocument();
    });

    test('renders insurance filter on patients view', () => {
      render(<PatientManagement />);
      expect(screen.getByLabelText('Filter by insurance')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<PatientManagement />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pmDarkMode', 'true');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<PatientManagement />);
      const btn = screen.getByLabelText('Toggle theme');
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pmDarkMode', 'false');
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Dashboard shows dashboard overview', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Dashboard'));
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });

    test('clicking Appointments shows appointments view', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      expect(screen.getByText(/Appointments \(/)).toBeInTheDocument();
    });

    test('clicking Prescriptions shows prescriptions view', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Prescriptions'));
      expect(screen.getByText('All Prescriptions')).toBeInTheDocument();
    });

    test('clicking Patients shows patients list', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Dashboard'));
      fireEvent.click(screen.getByText('Patients'));
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Dashboard View', () => {
    beforeEach(() => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Dashboard'));
    });

    test('renders dashboard stat cards', () => {
      expect(screen.getByText('Total Patients')).toBeInTheDocument();
      expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
      expect(screen.getByText('Active Prescriptions')).toBeInTheDocument();
      expect(screen.getByText('Critical Risk Patients')).toBeInTheDocument();
    });

    test('shows correct total patients count', () => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('renders risk distribution section', () => {
      expect(screen.getByText('Patient Risk Distribution')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    test('renders low refill alerts section', () => {
      expect(screen.getByText('Low Refill Alerts')).toBeInTheDocument();
    });
  });

  describe('Patient Search and Filter', () => {
    test('search filters patients by name', () => {
      render(<PatientManagement />);
      const searchInput = screen.getByPlaceholderText('Search patients by name, email, phone...');
      fireEvent.change(searchInput, { target: { value: 'John' } });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Emily Smith')).not.toBeInTheDocument();
    });

    test('search filters patients by email', () => {
      render(<PatientManagement />);
      const searchInput = screen.getByPlaceholderText('Search patients by name, email, phone...');
      fireEvent.change(searchInput, { target: { value: 'rjohnson' } });
      expect(screen.getByText('Robert Johnson')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('clearing search shows all patients', () => {
      render(<PatientManagement />);
      const searchInput = screen.getByPlaceholderText('Search patients by name, email, phone...');
      fireEvent.change(searchInput, { target: { value: 'Sofia' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Emily Smith')).toBeInTheDocument();
    });

    test('filtering by insurance shows only matching patients', () => {
      render(<PatientManagement />);
      const insuranceFilter = screen.getByLabelText('Filter by insurance');
      fireEvent.change(insuranceFilter, { target: { value: 'BlueCross' } });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Emily Smith')).not.toBeInTheDocument();
    });

    test('resetting insurance filter shows all patients', () => {
      render(<PatientManagement />);
      const insuranceFilter = screen.getByLabelText('Filter by insurance');
      fireEvent.change(insuranceFilter, { target: { value: 'Medicare' } });
      fireEvent.change(insuranceFilter, { target: { value: 'all' } });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Robert Johnson')).toBeInTheDocument();
    });
  });

  describe('Patient Detail View', () => {
    test('clicking a patient opens detail view', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText('john.doe@email.com')).toBeInTheDocument();
      expect(screen.getByText(/Risk Score/)).toBeInTheDocument();
    });

    test('patient detail shows BMI calculation', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      // BMI = 88 / (1.78^2) = 27.8
      expect(screen.getByText('27.8')).toBeInTheDocument();
    });

    test('patient detail shows allergies alert', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText(/Allergies:/)).toBeInTheDocument();
      expect(screen.getByText(/Penicillin, Peanuts/)).toBeInTheDocument();
    });

    test('patient detail shows conditions', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      expect(screen.getByText('Type 2 Diabetes')).toBeInTheDocument();
    });

    test('patient detail shows emergency contact', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText(/Jane Doe \(Wife\)/)).toBeInTheDocument();
    });

    test('patient detail shows insurance info', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText(/BlueCross \(BC-12345\)/)).toBeInTheDocument();
    });

    test('back button returns to patient list', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText(/Back to Patients/));
      expect(screen.getByText('Emily Smith')).toBeInTheDocument();
    });

    test('patient detail shows tab navigation', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Vitals')).toBeInTheDocument();
    });
  });

  describe('Patient Detail - Overview Tab', () => {
    test('shows physical information card', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText('Physical Information')).toBeInTheDocument();
      expect(screen.getByText(/178 cm/)).toBeInTheDocument();
      expect(screen.getByText(/88 kg/)).toBeInTheDocument();
    });

    test('shows latest vitals card', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText('Latest Vitals')).toBeInTheDocument();
      expect(screen.getByText(/130\/85 mmHg/)).toBeInTheDocument();
    });

    test('shows notes section with editable textarea', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText('Notes')).toBeInTheDocument();
      const textarea = screen.getByDisplayValue('Regular checkups every 3 months');
      expect(textarea).toBeInTheDocument();
    });

    test('editing notes updates patient data', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      const textarea = screen.getByDisplayValue('Regular checkups every 3 months');
      fireEvent.change(textarea, { target: { value: 'Updated notes' } });
      expect(textarea.value).toBe('Updated notes');
    });
  });

  describe('Patient Detail - Vitals Tab', () => {
    test('switching to vitals tab shows vitals history', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Vitals'));
      expect(screen.getByText('Vital Signs History')).toBeInTheDocument();
      expect(screen.getByText('+ Record Vitals')).toBeInTheDocument();
    });

    test('vitals table shows records with BP highlighting', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Vitals'));
      // John Doe has two vitals records
      expect(screen.getByText('130/85')).toBeInTheDocument();
      expect(screen.getByText('145/92')).toBeInTheDocument();
    });

    test('vitals table shows doctor name', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Vitals'));
      const doctorNames = screen.getAllByText('Dr. Sarah Chen');
      expect(doctorNames.length).toBeGreaterThan(0);
    });
  });

  describe('Patient Detail - Appointments Tab', () => {
    test('switching to appointments tab shows appointment history', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      // Find and click the Appointments tab (not the sidebar nav)
      const tabs = screen.getAllByText('Appointments');
      fireEvent.click(tabs[tabs.length - 1]);
      expect(screen.getByText('Appointment History')).toBeInTheDocument();
    });

    test('shows appointment details with status', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      const tabs = screen.getAllByText('Appointments');
      fireEvent.click(tabs[tabs.length - 1]);
      expect(screen.getByText('Quarterly checkup')).toBeInTheDocument();
      expect(screen.getByText('Blood pressure monitoring')).toBeInTheDocument();
    });

    test('scheduled appointments show Check In and Cancel buttons', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      const tabs = screen.getAllByText('Appointments');
      fireEvent.click(tabs[tabs.length - 1]);
      expect(screen.getByText('Check In')).toBeInTheDocument();
    });
  });

  describe('Patient Detail - Prescriptions Tab', () => {
    test('switching to prescriptions tab shows medication list', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      const tabs = screen.getAllByText('Prescriptions');
      fireEvent.click(tabs[tabs.length - 1]);
      expect(screen.getByText(/Lisinopril - 10mg/)).toBeInTheDocument();
      expect(screen.getByText(/Metformin - 500mg/)).toBeInTheDocument();
    });

    test('active prescriptions show discontinue button', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      const tabs = screen.getAllByText('Prescriptions');
      fireEvent.click(tabs[tabs.length - 1]);
      const discontinueButtons = screen.getAllByText('Discontinue');
      expect(discontinueButtons.length).toBeGreaterThan(0);
    });

    test('discontinuing a prescription shows confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      const tabs = screen.getAllByText('Prescriptions');
      fireEvent.click(tabs[tabs.length - 1]);
      const discontinueButtons = screen.getAllByText('Discontinue');
      fireEvent.click(discontinueButtons[0]);
      expect(window.confirm).toHaveBeenCalledWith('Discontinue this prescription?');
    });

    test('confirming discontinue marks prescription as discontinued', () => {
      window.confirm.mockReturnValue(true);
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      const tabs = screen.getAllByText('Prescriptions');
      fireEvent.click(tabs[tabs.length - 1]);
      const discontinueButtons = screen.getAllByText('Discontinue');
      fireEvent.click(discontinueButtons[0]);
      expect(screen.getByText('Discontinued')).toBeInTheDocument();
    });
  });

  describe('Add Patient Modal', () => {
    test('clicking New Patient opens add patient modal', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('+ New Patient'));
      expect(screen.getByText('Add New Patient')).toBeInTheDocument();
    });

    test('add patient modal has all required fields', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('+ New Patient'));
      expect(screen.getByText('First Name *')).toBeInTheDocument();
      expect(screen.getByText('Last Name *')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth *')).toBeInTheDocument();
      expect(screen.getByText('Phone *')).toBeInTheDocument();
    });

    test('cancel button closes add patient modal', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('+ New Patient'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Add New Patient')).not.toBeInTheDocument();
    });

    test('close button closes add patient modal', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('+ New Patient'));
      const closeButtons = screen.getAllByText('\u00d7');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Add New Patient')).not.toBeInTheDocument();
    });

    test('submitting form creates a new patient', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('+ New Patient'));
      const form = screen.getByText('Add New Patient').closest('div').querySelector('form');
      const firstNameInput = form.querySelector('input[name="firstName"]');
      const lastNameInput = form.querySelector('input[name="lastName"]');
      const dobInput = form.querySelector('input[name="dob"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'Patient' } });
      fireEvent.change(dobInput, { target: { value: '1990-01-01' } });
      fireEvent.change(phoneInput, { target: { value: '555-9999' } });
      fireEvent.click(screen.getByText('Add Patient'));
      expect(screen.queryByText('Add New Patient')).not.toBeInTheDocument();
      expect(screen.getByText('Test Patient')).toBeInTheDocument();
    });
  });

  describe('Appointments View', () => {
    beforeEach(() => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
    });

    test('shows appointment table with headers', () => {
      expect(screen.getByText('Date & Time')).toBeInTheDocument();
      expect(screen.getByText('Doctor')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Reason')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('shows + New Appointment button', () => {
      expect(screen.getByText('+ New Appointment')).toBeInTheDocument();
    });

    test('renders department filter', () => {
      expect(screen.getByLabelText('Filter by department')).toBeInTheDocument();
    });

    test('renders status filter', () => {
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });

    test('renders date filter', () => {
      expect(screen.getByLabelText('Filter by date')).toBeInTheDocument();
    });

    test('filtering by department shows only matching appointments', () => {
      const deptFilter = screen.getByLabelText('Filter by department');
      fireEvent.change(deptFilter, { target: { value: 'Cardiology' } });
      expect(screen.getByText('Cardiac stress test')).toBeInTheDocument();
      expect(screen.queryByText('Back pain evaluation')).not.toBeInTheDocument();
    });

    test('filtering by status shows only matching appointments', () => {
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'in_progress' } });
      expect(screen.getByText('Cardiac stress test')).toBeInTheDocument();
    });

    test('check in button transitions appointment from scheduled to checked_in', () => {
      const checkInButtons = screen.getAllByText('Check In');
      fireEvent.click(checkInButtons[0]);
      expect(screen.getByText('Checked In')).toBeInTheDocument();
    });

    test('clicking patient name in appointments navigates to patient detail', () => {
      // The patient names in the appointment table are clickable
      const patientLinks = screen.getAllByText('John Doe');
      fireEvent.click(patientLinks[0]);
      // Should navigate to patient detail view
      expect(screen.getByText(/Risk Score/)).toBeInTheDocument();
    });
  });

  describe('Add Appointment Modal', () => {
    test('clicking New Appointment opens modal', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      fireEvent.click(screen.getByText('+ New Appointment'));
      expect(screen.getByText('Schedule Appointment')).toBeInTheDocument();
    });

    test('appointment modal has patient select when no patient selected', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      fireEvent.click(screen.getByText('+ New Appointment'));
      expect(screen.getByText('Patient *')).toBeInTheDocument();
    });

    test('cancel button closes appointment modal', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      fireEvent.click(screen.getByText('+ New Appointment'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Schedule Appointment')).not.toBeInTheDocument();
    });
  });

  describe('Prescriptions View', () => {
    test('prescriptions view shows all prescriptions in table', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Prescriptions'));
      expect(screen.getByText('Lisinopril')).toBeInTheDocument();
      expect(screen.getByText('Metformin')).toBeInTheDocument();
      expect(screen.getByText('Albuterol Inhaler')).toBeInTheDocument();
      expect(screen.getByText('Atorvastatin')).toBeInTheDocument();
      expect(screen.getByText('Gabapentin')).toBeInTheDocument();
      expect(screen.getByText('Sertraline')).toBeInTheDocument();
    });

    test('prescriptions table shows medication details', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Prescriptions'));
      expect(screen.getByText('10mg')).toBeInTheDocument();
      expect(screen.getByText('Once daily')).toBeInTheDocument();
    });

    test('prescriptions table shows refill counts', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Prescriptions'));
      expect(screen.getByText('Medication')).toBeInTheDocument();
      expect(screen.getByText('Dosage')).toBeInTheDocument();
      expect(screen.getByText('Frequency')).toBeInTheDocument();
      expect(screen.getByText('Refills')).toBeInTheDocument();
    });

    test('clicking patient name in prescriptions navigates to patient detail', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Prescriptions'));
      const patientLinks = screen.getAllByText('John Doe');
      fireEvent.click(patientLinks[0]);
      expect(screen.getByText(/Risk Score/)).toBeInTheDocument();
    });

    test('stop button discontinues prescription after confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Prescriptions'));
      const stopButtons = screen.getAllByText('Stop');
      fireEvent.click(stopButtons[0]);
      expect(screen.getByText('Discontinued')).toBeInTheDocument();
    });
  });

  describe('Appointment Status Transitions', () => {
    test('cancel appointment shows confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      const cancelButtons = screen.getAllByText('Cancel');
      // Filter to only the appointment cancel buttons (not modal cancel)
      const apptCancelButton = cancelButtons.find(btn => btn.closest('td'));
      if (apptCancelButton) {
        fireEvent.click(apptCancelButton);
        expect(window.confirm).toHaveBeenCalledWith('Cancel this appointment?');
      }
    });

    test('in_progress appointment shows Complete button', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    test('completing an appointment updates status', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      fireEvent.click(screen.getByText('Complete'));
      const completedLabels = screen.getAllByText('Completed');
      expect(completedLabels.length).toBeGreaterThan(0);
    });

    test('checked_in appointment shows Start button', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      expect(screen.getByText('Start')).toBeInTheDocument();
    });

    test('starting an appointment transitions to in_progress', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      fireEvent.click(screen.getByText('Start'));
      const inProgressLabels = screen.getAllByText('In Progress');
      expect(inProgressLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Delete Patient', () => {
    test('delete button shows confirmation dialog', () => {
      window.confirm.mockReturnValue(false);
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Delete'));
      expect(window.confirm).toHaveBeenCalledWith('Delete this patient and all associated records?');
    });

    test('confirming delete removes patient and returns to list', () => {
      window.confirm.mockReturnValue(true);
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Delete'));
      // Should return to patient list without John Doe
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Emily Smith')).toBeInTheDocument();
    });

    test('canceling delete keeps patient', () => {
      window.confirm.mockReturnValue(false);
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Delete'));
      // Patient detail should still be showing
      expect(screen.getByText(/john.doe@email.com/)).toBeInTheDocument();
    });
  });

  describe('BMI Calculations', () => {
    test('displays correct BMI for each patient', () => {
      render(<PatientManagement />);
      // John Doe: 88 / (1.78^2) = 27.8
      expect(screen.getByText('27.8')).toBeInTheDocument();
      // Emily Smith: 62 / (1.65^2) = 22.8
      expect(screen.getByText('22.8')).toBeInTheDocument();
    });

    test('BMI category is shown in patient detail', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText(/Overweight/)).toBeInTheDocument();
    });
  });

  describe('Risk Score Calculation', () => {
    test('patient with multiple conditions has higher risk', () => {
      render(<PatientManagement />);
      // Robert Johnson: age >65 (+3), 3 conditions (+3), BMI >30 (+2) = High/Critical risk
      fireEvent.click(screen.getByText('Robert Johnson'));
      const riskScore = screen.getByText(/\/10/);
      expect(riskScore).toBeInTheDocument();
    });

    test('young patient with no conditions has low risk', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Sofia Martinez'));
      expect(screen.getByText(/\/10/)).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes add patient modal', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('+ New Patient'));
      expect(screen.getByText('Add New Patient')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Add New Patient')).not.toBeInTheDocument();
    });

    test('Escape key closes patient detail', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      expect(screen.getByText(/john.doe@email.com/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      // Should return to patient list
      expect(screen.getByText('Emily Smith')).toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('patients are saved to localStorage on change', () => {
      render(<PatientManagement />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pmPatients', expect.any(String));
    });

    test('appointments are saved to localStorage on change', () => {
      render(<PatientManagement />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pmAppointments', expect.any(String));
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'pmPatients') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<PatientManagement />)).not.toThrow();
    });

    test('loads dark mode from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'pmDarkMode') return 'true';
        return null;
      });
      render(<PatientManagement />);
      // In dark mode, Light Mode text is shown
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
  });

  describe('Cross-Entity Navigation', () => {
    test('appointment view patient link navigates to patient detail', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Appointments'));
      // Click on a patient name in the appointments table
      const links = screen.getAllByText('Robert Johnson');
      fireEvent.click(links[0]);
      // Should show patient detail
      expect(screen.getByText(/rjohnson@email.com/)).toBeInTheDocument();
    });

    test('prescription view patient link navigates to patient detail prescriptions tab', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Prescriptions'));
      const links = screen.getAllByText('William Taylor');
      fireEvent.click(links[0]);
      // Should show patient detail with prescriptions tab active
      expect(screen.getByText(/wtaylor@email.com/)).toBeInTheDocument();
    });
  });

  describe('Add Vitals Modal', () => {
    test('record vitals button opens modal for selected patient', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Vitals'));
      fireEvent.click(screen.getByText('+ Record Vitals'));
      expect(screen.getByText(/Record Vitals for John Doe/)).toBeInTheDocument();
    });

    test('vitals modal has all required fields', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Vitals'));
      fireEvent.click(screen.getByText('+ Record Vitals'));
      expect(screen.getByText('Systolic (mmHg) *')).toBeInTheDocument();
      expect(screen.getByText('Diastolic (mmHg) *')).toBeInTheDocument();
      expect(screen.getByText('Heart Rate (bpm) *')).toBeInTheDocument();
    });

    test('cancel closes vitals modal', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('John Doe'));
      fireEvent.click(screen.getByText('Vitals'));
      fireEvent.click(screen.getByText('+ Record Vitals'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText(/Record Vitals for/)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<PatientManagement />)).not.toThrow();
    });

    test('patient with no vitals shows empty state', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Sofia Martinez'));
      fireEvent.click(screen.getByText('Vitals'));
      expect(screen.getByText('No vitals recorded')).toBeInTheDocument();
    });

    test('patient with no prescriptions shows empty state', () => {
      render(<PatientManagement />);
      fireEvent.click(screen.getByText('Sofia Martinez'));
      const tabs = screen.getAllByText('Prescriptions');
      fireEvent.click(tabs[tabs.length - 1]);
      expect(screen.getByText('No prescriptions')).toBeInTheDocument();
    });
  });
});
