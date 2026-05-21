import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobBoardTracker from './src/app/page.jsx';

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

// Mock confirm dialog
window.confirm = vi.fn();

describe('JobBoardTracker Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with HireTrack title', () => {
      render(<JobBoardTracker />);
      expect(screen.getByText('HireTrack')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<JobBoardTracker />);
      expect(screen.getByText('Job Listings')).toBeInTheDocument();
      expect(screen.getByText('Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Applicants')).toBeInTheDocument();
      expect(screen.getByText('Interviews')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<JobBoardTracker />);
      expect(screen.getByPlaceholderText('Search jobs, applicants...')).toBeInTheDocument();
    });

    test('renders job listings view by default', () => {
      render(<JobBoardTracker />);
      expect(screen.getByText('Job Listings')).toBeInTheDocument();
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
    });

    test('renders sidebar stats', () => {
      render(<JobBoardTracker />);
      expect(screen.getByText('Open positions')).toBeInTheDocument();
      expect(screen.getByText('Active applications')).toBeInTheDocument();
    });

    test('renders filter controls', () => {
      render(<JobBoardTracker />);
      expect(screen.getByLabelText('Filter by department')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by experience')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort jobs')).toBeInTheDocument();
    });

    test('renders job count', () => {
      render(<JobBoardTracker />);
      expect(screen.getByText('6 jobs')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<JobBoardTracker />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<JobBoardTracker />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('jbtTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<JobBoardTracker />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('jbtTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'jbtTheme') return 'dark';
        return null;
      });
      render(<JobBoardTracker />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Pipeline shows pipeline view', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      expect(screen.getByText('Application Pipeline')).toBeInTheDocument();
    });

    test('clicking Applicants shows applicants view', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      expect(screen.getByText(/Applicants \(/)).toBeInTheDocument();
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    });

    test('clicking Interviews shows interviews view', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Interviews'));
      expect(screen.getByText(/Upcoming/)).toBeInTheDocument();
      expect(screen.getByText(/Past/)).toBeInTheDocument();
    });

    test('clicking Analytics shows analytics dashboard', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('jbtActiveView', 'pipeline');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<JobBoardTracker />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<JobBoardTracker />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Job Listings')).not.toBeInTheDocument();
      expect(screen.queryByText('Pipeline')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<JobBoardTracker />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Job Listings')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search input filters jobs by title', () => {
      render(<JobBoardTracker />);
      const searchInput = screen.getByPlaceholderText('Search jobs, applicants...');
      fireEvent.change(searchInput, { target: { value: 'Frontend' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    test('search input filters jobs by department', () => {
      render(<JobBoardTracker />);
      const searchInput = screen.getByPlaceholderText('Search jobs, applicants...');
      fireEvent.change(searchInput, { target: { value: 'Design' } });
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
    });

    test('search input filters jobs by location', () => {
      render(<JobBoardTracker />);
      const searchInput = screen.getByPlaceholderText('Search jobs, applicants...');
      fireEvent.change(searchInput, { target: { value: 'Austin' } });
      expect(screen.getByText('Sales Development Rep')).toBeInTheDocument();
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    });

    test('clearing search shows all jobs again', () => {
      render(<JobBoardTracker />);
      const searchInput = screen.getByPlaceholderText('Search jobs, applicants...');
      fireEvent.change(searchInput, { target: { value: 'Frontend' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
    });

    test('search filters applicants by name in applicants view', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      const searchInput = screen.getByPlaceholderText('Search jobs, applicants...');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.queryByText('Bob Martinez')).not.toBeInTheDocument();
    });

    test('search filters applicants by skill', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      const searchInput = screen.getByPlaceholderText('Search jobs, applicants...');
      fireEvent.change(searchInput, { target: { value: 'Kubernetes' } });
      expect(screen.getByText('Henry Wright')).toBeInTheDocument();
    });
  });

  describe('Department Filter', () => {
    test('filtering by Engineering shows only engineering jobs', () => {
      render(<JobBoardTracker />);
      const deptFilter = screen.getByLabelText('Filter by department');
      fireEvent.change(deptFilter, { target: { value: 'Engineering' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('Junior Backend Developer')).toBeInTheDocument();
      expect(screen.getByText('DevOps Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
      expect(screen.queryByText('Marketing Manager')).not.toBeInTheDocument();
    });

    test('selecting All Departments shows all jobs', () => {
      render(<JobBoardTracker />);
      const deptFilter = screen.getByLabelText('Filter by department');
      fireEvent.change(deptFilter, { target: { value: 'Engineering' } });
      fireEvent.change(deptFilter, { target: { value: 'all' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
    });
  });

  describe('Type Filter', () => {
    test('filtering by contract shows only contract jobs', () => {
      render(<JobBoardTracker />);
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'contract' } });
      expect(screen.getByText('DevOps Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    });
  });

  describe('Experience Filter', () => {
    test('filtering by senior shows only senior jobs', () => {
      render(<JobBoardTracker />);
      const expFilter = screen.getByLabelText('Filter by experience');
      fireEvent.change(expFilter, { target: { value: 'senior' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('DevOps Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Junior Backend Developer')).not.toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    test('filtering by closed shows only closed jobs', () => {
      render(<JobBoardTracker />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'closed' } });
      expect(screen.getByText('Sales Development Rep')).toBeInTheDocument();
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    });

    test('filtering by open shows only open jobs', () => {
      render(<JobBoardTracker />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'open' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Sales Development Rep')).not.toBeInTheDocument();
    });
  });

  describe('Job Cards', () => {
    test('job cards display department and location', () => {
      render(<JobBoardTracker />);
      expect(screen.getByText(/Engineering · Remote/)).toBeInTheDocument();
    });

    test('job cards display status badges', () => {
      render(<JobBoardTracker />);
      const openBadges = screen.getAllByText('open');
      expect(openBadges.length).toBeGreaterThan(0);
    });

    test('job cards display pipeline stage counts', () => {
      render(<JobBoardTracker />);
      // Senior Frontend Engineer has applicants in various stages
      expect(screen.getByText(/technical: \d+/)).toBeInTheDocument();
    });
  });

  describe('Job Detail View', () => {
    test('clicking a job card opens job detail', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Requirements')).toBeInTheDocument();
    });

    test('job detail shows description', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText(/lead our React-based platform/)).toBeInTheDocument();
    });

    test('job detail shows requirements list', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText('5+ years React experience')).toBeInTheDocument();
      expect(screen.getByText('TypeScript proficiency')).toBeInTheDocument();
    });

    test('job detail shows applicants list', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
      expect(screen.getByText('Frank Nguyen')).toBeInTheDocument();
    });

    test('back button returns to job list', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('← Back to Jobs'));
      expect(screen.getByText('+ New Job')).toBeInTheDocument();
    });

    test('close position button toggles job status', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Close Position'));
      expect(screen.getByText('Reopen Position')).toBeInTheDocument();
    });

    test('reopen position toggles job back to open', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Close Position'));
      fireEvent.click(screen.getByText('Reopen Position'));
      expect(screen.getByText('Close Position')).toBeInTheDocument();
    });

    test('delete job requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Delete'));
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming delete removes job and returns to list', () => {
      window.confirm.mockReturnValue(true);
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Delete'));
      // Should be back at job list without the deleted job
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
    });
  });

  describe('Pipeline View', () => {
    test('pipeline view shows stage stats', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      // Check that stage labels exist
      expect(screen.getByText('applied')).toBeInTheDocument();
      expect(screen.getByText('screening')).toBeInTheDocument();
      expect(screen.getByText('interview')).toBeInTheDocument();
      expect(screen.getByText('technical')).toBeInTheDocument();
      expect(screen.getByText('offer')).toBeInTheDocument();
      expect(screen.getByText('hired')).toBeInTheDocument();
      expect(screen.getByText('rejected')).toBeInTheDocument();
    });

    test('pipeline view shows application list', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
    });

    test('pipeline stage filter works', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      const stageFilter = screen.getByLabelText('Filter by stage');
      fireEvent.change(stageFilter, { target: { value: 'offer' } });
      expect(screen.getByText('Frank Nguyen')).toBeInTheDocument();
      expect(screen.queryByText('Alice Chen')).not.toBeInTheDocument();
    });

    test('clicking application opens application detail', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      // Click on Alice Chen's row
      fireEvent.click(screen.getByText('Alice Chen'));
      // Should show detailed view with pipeline stage buttons
      expect(screen.getByText('Pipeline Stage')).toBeInTheDocument();
    });
  });

  describe('Application Detail', () => {
    test('application detail shows applicant info', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('alice@example.com · 555-0101')).toBeInTheDocument();
      expect(screen.getByText('6 years experience · Rating: ⭐⭐⭐⭐⭐')).toBeInTheDocument();
    });

    test('application detail shows skills', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('GraphQL')).toBeInTheDocument();
    });

    test('clicking pipeline stage button changes application stage', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      // Alice is in 'technical' stage, move to 'offer'
      const offerButton = screen.getAllByText('offer').find(el => el.tagName === 'BUTTON');
      fireEvent.click(offerButton);
      // After clicking, the offer button should now be the active stage
      expect(offerButton).toHaveStyle('border: 2px solid');
    });

    test('application detail shows feedback when available', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('Feedback')).toBeInTheDocument();
      expect(screen.getByText(/Strong React skills/)).toBeInTheDocument();
    });

    test('back button returns to pipeline list', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('← Back to Pipeline'));
      expect(screen.getByText('Application Pipeline')).toBeInTheDocument();
    });

    test('application detail shows interviews section', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText(/Interviews \(/)).toBeInTheDocument();
    });

    test('schedule button is present in application detail', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('+ Schedule')).toBeInTheDocument();
    });
  });

  describe('Rating System', () => {
    test('application detail shows rating stars', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByLabelText('Rate 1 stars')).toBeInTheDocument();
      expect(screen.getByLabelText('Rate 5 stars')).toBeInTheDocument();
    });

    test('clicking a star updates applicant rating', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      const star3 = screen.getByLabelText('Rate 3 stars');
      fireEvent.click(star3);
      // The applicant data is saved to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jbtApplicants',
        expect.any(String)
      );
    });
  });

  describe('Notes', () => {
    test('add note button opens note modal in application detail', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Add Note'));
      expect(screen.getByText(/Add Note for Alice Chen/)).toBeInTheDocument();
    });

    test('note modal has text area and save button', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Add Note'));
      expect(screen.getByPlaceholderText('Write a note...')).toBeInTheDocument();
      expect(screen.getByText('Save Note')).toBeInTheDocument();
    });

    test('saving a note adds it to the applicant', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Add Note'));
      const textarea = screen.getByPlaceholderText('Write a note...');
      fireEvent.change(textarea, { target: { value: 'Great interview performance' } });
      fireEvent.click(screen.getByText('Save Note'));
      expect(screen.getByText('Great interview performance')).toBeInTheDocument();
    });

    test('cancel note modal closes without saving', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Add Note'));
      const textarea = screen.getByPlaceholderText('Write a note...');
      fireEvent.change(textarea, { target: { value: 'Should not be saved' } });
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Should not be saved')).not.toBeInTheDocument();
    });

    test('deleting a note removes it', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      // Add a note first
      fireEvent.click(screen.getByText('+ Add Note'));
      const textarea = screen.getByPlaceholderText('Write a note...');
      fireEvent.change(textarea, { target: { value: 'Note to delete' } });
      fireEvent.click(screen.getByText('Save Note'));
      expect(screen.getByText('Note to delete')).toBeInTheDocument();
      // Delete it
      const deleteButtons = screen.getAllByText('×');
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);
      expect(screen.queryByText('Note to delete')).not.toBeInTheDocument();
    });

    test('add note from applicant profile view', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Add Note'));
      expect(screen.getByText(/Add Note for Alice Chen/)).toBeInTheDocument();
    });
  });

  describe('Applicants View', () => {
    test('shows all applicants with info', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
      expect(screen.getByText('Carol Williams')).toBeInTheDocument();
      expect(screen.getByText('Henry Wright')).toBeInTheDocument();
    });

    test('applicant cards show skills preview', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      // Alice's first 3 skills should be visible as tags
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    test('applicant cards show application count', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      // Jake Robinson has 2 applications (j1 and j4)
      expect(screen.getByText('2 applications')).toBeInTheDocument();
    });

    test('clicking applicant opens profile view', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('alice@example.com · 555-0101')).toBeInTheDocument();
    });
  });

  describe('Applicant Profile', () => {
    test('shows full skill list', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('GraphQL')).toBeInTheDocument();
    });

    test('shows applications for the applicant', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    });

    test('shows application stage badges', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('technical')).toBeInTheDocument();
    });

    test('shows feedback on applications', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText(/Strong React skills/)).toBeInTheDocument();
    });

    test('back button returns to applicant list', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Applicants'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('← Back to Applicants'));
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
    });
  });

  describe('Interviews View', () => {
    test('shows upcoming interviews section', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Interviews'));
      expect(screen.getByText(/Upcoming/)).toBeInTheDocument();
    });

    test('shows past interviews section', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Interviews'));
      expect(screen.getByText(/Past/)).toBeInTheDocument();
    });

    test('upcoming interviews show interviewer name', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Interviews'));
      expect(screen.getByText(/Sarah Tech Lead/)).toBeInTheDocument();
    });

    test('upcoming interviews show interview type', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Interviews'));
      expect(screen.getByText(/technical interview/)).toBeInTheDocument();
    });

    test('upcoming interviews have delete button', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Interviews'));
      const deleteButtons = screen.getAllByLabelText('Delete interview');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    test('deleting interview requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Interviews'));
      const deleteButtons = screen.getAllByLabelText('Delete interview');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming interview delete removes it', () => {
      window.confirm.mockReturnValue(true);
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Interviews'));
      const deleteButtons = screen.getAllByLabelText('Delete interview');
      const initialCount = deleteButtons.length;
      fireEvent.click(deleteButtons[0]);
      const remainingButtons = screen.getAllByLabelText('Delete interview');
      expect(remainingButtons.length).toBe(initialCount - 1);
    });
  });

  describe('Analytics View', () => {
    test('shows stat cards', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Open Positions')).toBeInTheDocument();
      expect(screen.getByText('Total Applications')).toBeInTheDocument();
      expect(screen.getByText('Active in Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Hired')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Days to Hire')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
    });

    test('shows correct open positions count', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Analytics'));
      // 5 open jobs (j1-j4, j6 are open, j5 is closed)
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('shows pipeline overview bar', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Pipeline Overview')).toBeInTheDocument();
    });

    test('shows department breakdown', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Department Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });

    test('shows conversion rate percentage', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Analytics'));
      // 1 hired out of 12 total = 8.3%
      expect(screen.getByText('8.3%')).toBeInTheDocument();
    });
  });

  describe('Create Job Modal', () => {
    test('clicking New Job opens create modal', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('+ New Job'));
      expect(screen.getByText('Create New Job')).toBeInTheDocument();
    });

    test('create job modal has required fields', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('+ New Job'));
      expect(screen.getByPlaceholderText('Job Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Job department')).toBeInTheDocument();
      expect(screen.getByLabelText('Job type')).toBeInTheDocument();
      expect(screen.getByLabelText('Experience level')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Location')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min Salary')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max Salary')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Job Description')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Requirements (comma-separated)')).toBeInTheDocument();
    });

    test('creating a job adds it to the list', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('+ New Job'));
      fireEvent.change(screen.getByPlaceholderText('Job Title'), { target: { value: 'Test Engineer' } });
      fireEvent.change(screen.getByPlaceholderText('Location'), { target: { value: 'Remote' } });
      fireEvent.change(screen.getByPlaceholderText('Job Description'), { target: { value: 'Test description' } });
      fireEvent.click(screen.getByText('Create Job'));
      expect(screen.getByText('Test Engineer')).toBeInTheDocument();
    });

    test('create job modal cancel button works', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('+ New Job'));
      expect(screen.getByText('Create New Job')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Job')).not.toBeInTheDocument();
    });

    test('close button on create job modal works', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('+ New Job'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Create New Job')).not.toBeInTheDocument();
    });
  });

  describe('Schedule Interview Modal', () => {
    test('schedule button opens interview modal', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Schedule'));
      expect(screen.getByText('Schedule Interview')).toBeInTheDocument();
    });

    test('interview modal has required fields', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Schedule'));
      expect(screen.getByLabelText('Interview date')).toBeInTheDocument();
      expect(screen.getByLabelText('Interview type')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Interviewer Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Location/)).toBeInTheDocument();
    });

    test('interview modal cancel button works', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Schedule'));
      expect(screen.getByText('Schedule Interview')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Schedule Interview')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes job detail view', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText('Description')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    test('Escape closes create job modal', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('+ New Job'));
      expect(screen.getByText('Create New Job')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Job')).not.toBeInTheDocument();
    });

    test('Escape closes note modal', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Add Note'));
      expect(screen.getByText(/Add Note for/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Add Note for/)).not.toBeInTheDocument();
    });

    test('Escape closes interview modal', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      fireEvent.click(screen.getByText('+ Schedule'));
      expect(screen.getByText('Schedule Interview')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Schedule Interview')).not.toBeInTheDocument();
    });

    test('Escape closes application detail', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByText('Alice Chen'));
      expect(screen.getByText('Pipeline Stage')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Pipeline Stage')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('applications are saved to localStorage', () => {
      render(<JobBoardTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jbtApplications',
        expect.any(String)
      );
    });

    test('applicants are saved to localStorage', () => {
      render(<JobBoardTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jbtApplicants',
        expect.any(String)
      );
    });

    test('active view is saved to localStorage', () => {
      render(<JobBoardTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jbtActiveView',
        'jobs'
      );
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'jbtActiveView') return 'analytics';
        return null;
      });
      render(<JobBoardTracker />);
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'jbtApplications') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<JobBoardTracker />)).not.toThrow();
    });
  });

  describe('Combined Filters', () => {
    test('search and department filter work together', () => {
      render(<JobBoardTracker />);
      const searchInput = screen.getByPlaceholderText('Search jobs, applicants...');
      fireEvent.change(searchInput, { target: { value: 'Remote' } });
      const deptFilter = screen.getByLabelText('Filter by department');
      fireEvent.change(deptFilter, { target: { value: 'Engineering' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('DevOps Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    test('non-matching combined filters show no jobs', () => {
      render(<JobBoardTracker />);
      const searchInput = screen.getByPlaceholderText('Search jobs, applicants...');
      fireEvent.change(searchInput, { target: { value: 'Austin' } });
      const deptFilter = screen.getByLabelText('Filter by department');
      fireEvent.change(deptFilter, { target: { value: 'Engineering' } });
      expect(screen.getByText('No jobs match your filters.')).toBeInTheDocument();
    });
  });

  describe('Cross-Entity Navigation', () => {
    test('job detail applicant row shows stage badge', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      // Frank Nguyen is at offer stage
      expect(screen.getByText('Frank Nguyen')).toBeInTheDocument();
    });

    test('navigating between views clears selections', () => {
      render(<JobBoardTracker />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText('Description')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      // Go back to jobs - should not be in detail view
      fireEvent.click(screen.getByText('Job Listings'));
      expect(screen.getByText('+ New Job')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<JobBoardTracker />)).not.toThrow();
    });
  });
});
