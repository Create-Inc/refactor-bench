import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import JobBoard from './src/app/page.jsx';

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

describe('JobBoard Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders the sidebar with navigation items', () => {
      render(<JobBoard />);
      expect(screen.getByText('JobBoard')).toBeTruthy();
      expect(screen.getByText('Browse Jobs')).toBeTruthy();
      expect(screen.getByText('Saved Jobs')).toBeTruthy();
      expect(screen.getByText('My Applications')).toBeTruthy();
      expect(screen.getByText('Companies')).toBeTruthy();
      expect(screen.getByText('Admin Panel')).toBeTruthy();
    });

    test('renders job listings by default on browse view', () => {
      render(<JobBoard />);
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
      expect(screen.getByText('Product Designer')).toBeTruthy();
      expect(screen.getByText('DevOps Engineer')).toBeTruthy();
    });

    test('renders the search input with placeholder', () => {
      render(<JobBoard />);
      expect(
        screen.getByPlaceholderText('Search jobs, companies, locations... (Press /)')
      ).toBeTruthy();
    });

    test('renders filter panel with categories', () => {
      render(<JobBoard />);
      expect(screen.getByText('Engineering')).toBeTruthy();
      expect(screen.getByText('Design')).toBeTruthy();
      expect(screen.getByText('Marketing')).toBeTruthy();
      expect(screen.getByText('Sales')).toBeTruthy();
      expect(screen.getByText('Product')).toBeTruthy();
    });

    test('renders employment type filters', () => {
      render(<JobBoard />);
      expect(screen.getByText('Full-time')).toBeTruthy();
      expect(screen.getByText('Part-time')).toBeTruthy();
      expect(screen.getByText('Contract')).toBeTruthy();
      expect(screen.getByText('Internship')).toBeTruthy();
    });

    test('renders the jobs count', () => {
      render(<JobBoard />);
      expect(screen.getByText('10 jobs found')).toBeTruthy();
    });

    test('renders the notification bell', () => {
      render(<JobBoard />);
      expect(screen.getByLabelText('Toggle notifications')).toBeTruthy();
    });
  });

  describe('Theme Toggling', () => {
    test('toggles between dark and light mode', () => {
      render(<JobBoard />);
      const themeBtn = screen.getByLabelText('Toggle theme');
      expect(screen.getByText('Dark Mode')).toBeTruthy();
      fireEvent.click(themeBtn);
      expect(screen.getByText('Light Mode')).toBeTruthy();
    });

    test('persists theme preference to localStorage', () => {
      render(<JobBoard />);
      const themeBtn = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeBtn);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jobBoard',
        expect.stringContaining('"darkMode":true')
      );
    });
  });

  describe('Sidebar Navigation', () => {
    test('navigates to Saved Jobs view', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Saved Jobs'));
      expect(screen.getByText('Saved Jobs (0)')).toBeTruthy();
      expect(screen.getByText('No saved jobs yet')).toBeTruthy();
    });

    test('navigates to My Applications view', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('My Applications'));
      expect(screen.getByText('No applications yet')).toBeTruthy();
    });

    test('navigates to Companies view', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Companies'));
      expect(screen.getByText('TechFlow Inc.')).toBeTruthy();
      expect(screen.getByText('DesignHub')).toBeTruthy();
      expect(screen.getByText('GreenScale')).toBeTruthy();
      expect(screen.getByText('DataNova')).toBeTruthy();
      expect(screen.getByText('HealthBridge')).toBeTruthy();
    });

    test('navigates to Admin Panel view', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Admin Panel'));
      expect(screen.getByText('+ Post New Job')).toBeTruthy();
      expect(screen.getByText('Total Jobs')).toBeTruthy();
      expect(screen.getByText('Total Applicants')).toBeTruthy();
    });

    test('collapses sidebar when toggle button is clicked', () => {
      render(<JobBoard />);
      const collapseBtn = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(collapseBtn);
      expect(screen.queryByText('Browse Jobs')).toBeFalsy();
    });
  });

  describe('Search Filtering', () => {
    test('filters jobs by title search query', () => {
      render(<JobBoard />);
      const searchInput = screen.getByPlaceholderText(
        'Search jobs, companies, locations... (Press /)'
      );
      fireEvent.change(searchInput, { target: { value: 'Frontend' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
      expect(screen.getByText('Frontend Contract Developer')).toBeTruthy();
      expect(screen.queryByText('Product Designer')).toBeFalsy();
      expect(screen.queryByText('Marketing Manager')).toBeFalsy();
    });

    test('filters jobs by company name', () => {
      render(<JobBoard />);
      const searchInput = screen.getByPlaceholderText(
        'Search jobs, companies, locations... (Press /)'
      );
      fireEvent.change(searchInput, { target: { value: 'DesignHub' } });
      expect(screen.getByText('Product Designer')).toBeTruthy();
      expect(screen.getByText('Frontend Contract Developer')).toBeTruthy();
      expect(screen.queryByText('DevOps Engineer')).toBeFalsy();
    });

    test('filters jobs by location', () => {
      render(<JobBoard />);
      const searchInput = screen.getByPlaceholderText(
        'Search jobs, companies, locations... (Press /)'
      );
      fireEvent.change(searchInput, { target: { value: 'Austin' } });
      expect(screen.getByText('DevOps Engineer')).toBeTruthy();
      expect(screen.getByText('Full Stack Intern')).toBeTruthy();
      expect(screen.queryByText('Product Designer')).toBeFalsy();
    });

    test('shows updated job count after filtering', () => {
      render(<JobBoard />);
      const searchInput = screen.getByPlaceholderText(
        'Search jobs, companies, locations... (Press /)'
      );
      fireEvent.change(searchInput, { target: { value: 'Senior' } });
      expect(screen.getByText('3 jobs found')).toBeTruthy();
    });
  });

  describe('Category Filtering', () => {
    test('filters jobs by category checkbox', () => {
      render(<JobBoard />);
      const engineeringCheckbox = screen.getAllByRole('checkbox').find(
        (cb) => cb.parentElement.textContent.trim() === 'Engineering'
      );
      fireEvent.click(engineeringCheckbox);
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
      expect(screen.getByText('DevOps Engineer')).toBeTruthy();
      expect(screen.queryByText('Product Designer')).toBeFalsy();
      expect(screen.queryByText('Marketing Manager')).toBeFalsy();
    });

    test('filters by multiple categories', () => {
      render(<JobBoard />);
      const checkboxes = screen.getAllByRole('checkbox');
      const engineeringCb = checkboxes.find(
        (cb) => cb.parentElement.textContent.trim() === 'Engineering'
      );
      const designCb = checkboxes.find(
        (cb) => cb.parentElement.textContent.trim() === 'Design'
      );
      fireEvent.click(engineeringCb);
      fireEvent.click(designCb);
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
      expect(screen.getByText('Product Designer')).toBeTruthy();
      expect(screen.getByText('UX Researcher')).toBeTruthy();
      expect(screen.queryByText('Marketing Manager')).toBeFalsy();
    });

    test('clears all filters with Clear All button', () => {
      render(<JobBoard />);
      const engineeringCb = screen.getAllByRole('checkbox').find(
        (cb) => cb.parentElement.textContent.trim() === 'Engineering'
      );
      fireEvent.click(engineeringCb);
      fireEvent.click(screen.getByText('Clear All'));
      expect(screen.getByText('10 jobs found')).toBeTruthy();
    });
  });

  describe('Employment Type Filtering', () => {
    test('filters by employment type', () => {
      render(<JobBoard />);
      const partTimeCb = screen.getAllByRole('checkbox').find(
        (cb) => cb.parentElement.textContent.trim() === 'Part-time'
      );
      fireEvent.click(partTimeCb);
      expect(screen.getByText('UX Researcher')).toBeTruthy();
      expect(screen.queryByText('Senior Frontend Engineer')).toBeFalsy();
    });

    test('filters by Internship type', () => {
      render(<JobBoard />);
      const internshipCb = screen.getAllByRole('checkbox').find(
        (cb) => cb.parentElement.textContent.trim() === 'Internship'
      );
      fireEvent.click(internshipCb);
      expect(screen.getByText('Full Stack Intern')).toBeTruthy();
      expect(screen.getByText('1 jobs found')).toBeTruthy();
    });
  });

  describe('Remote Only Filter', () => {
    test('filters to show only remote jobs', () => {
      render(<JobBoard />);
      const remoteCheckbox = screen.getAllByRole('checkbox').find(
        (cb) => cb.parentElement.textContent.trim() === 'Remote Only'
      );
      fireEvent.click(remoteCheckbox);
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
      expect(screen.getByText('DevOps Engineer')).toBeTruthy();
      expect(screen.queryByText('Product Designer')).toBeFalsy();
      expect(screen.queryByText('Marketing Manager')).toBeFalsy();
    });
  });

  describe('Sorting', () => {
    test('sorts by highest salary', () => {
      render(<JobBoard />);
      const sortSelect = screen.getAllByRole('combobox').find(
        (select) => {
          const options = within(select).queryAllByRole('option');
          return options.some((opt) => opt.textContent === 'Highest Salary');
        }
      );
      fireEvent.change(sortSelect, { target: { value: 'salary-high' } });
      const jobCards = screen.getAllByText(/applicants$/);
      const firstCard = jobCards[0].closest('[data-testid]');
      expect(firstCard).toBeTruthy();
    });

    test('sorts by fewest applicants', () => {
      render(<JobBoard />);
      const sortSelect = screen.getAllByRole('combobox').find(
        (select) => {
          const options = within(select).queryAllByRole('option');
          return options.some((opt) => opt.textContent === 'Fewest Applicants');
        }
      );
      fireEvent.change(sortSelect, { target: { value: 'applicants' } });
      // DevOps Engineer has fewest applicants (29)
      const allText = document.body.textContent;
      const devOpsIdx = allText.indexOf('DevOps Engineer');
      const marketingIdx = allText.indexOf('Marketing Manager');
      expect(devOpsIdx).toBeLessThan(marketingIdx);
    });
  });

  describe('Bookmarking', () => {
    test('bookmarks a job and shows it in Saved Jobs', () => {
      render(<JobBoard />);
      const bookmarkBtns = screen.getAllByLabelText('Add bookmark');
      fireEvent.click(bookmarkBtns[0]);
      fireEvent.click(screen.getByText('Saved Jobs'));
      expect(screen.getByText('Saved Jobs (1)')).toBeTruthy();
    });

    test('unbookmarks a job', () => {
      render(<JobBoard />);
      const bookmarkBtns = screen.getAllByLabelText('Add bookmark');
      fireEvent.click(bookmarkBtns[0]);
      const removeBtn = screen.getByLabelText('Remove bookmark');
      fireEvent.click(removeBtn);
      fireEvent.click(screen.getByText('Saved Jobs'));
      expect(screen.getByText('Saved Jobs (0)')).toBeTruthy();
      expect(screen.getByText('No saved jobs yet')).toBeTruthy();
    });

    test('persists bookmarks to localStorage', () => {
      render(<JobBoard />);
      const bookmarkBtns = screen.getAllByLabelText('Add bookmark');
      fireEvent.click(bookmarkBtns[0]);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'jobBoard',
        expect.stringContaining('bookmarkedJobs')
      );
    });
  });

  describe('Job Detail Modal', () => {
    test('opens job detail modal when clicking a job card', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByTestId('job-detail-modal')).toBeTruthy();
      expect(screen.getByText('About this role')).toBeTruthy();
      expect(screen.getByText('Requirements')).toBeTruthy();
      expect(screen.getByText('Benefits')).toBeTruthy();
    });

    test('shows job requirements in detail modal', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText('5+ years React experience')).toBeTruthy();
      expect(screen.getByText('TypeScript proficiency')).toBeTruthy();
    });

    test('shows job benefits in detail modal', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText('Health insurance')).toBeTruthy();
      expect(screen.getByText('401k matching')).toBeTruthy();
      expect(screen.getByText('Unlimited PTO')).toBeTruthy();
    });

    test('closes job detail modal when X button is clicked', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByTestId('job-detail-modal')).toBeTruthy();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByTestId('job-detail-modal')).toBeFalsy();
    });
  });

  describe('Application Flow', () => {
    test('opens application modal when clicking Quick Apply', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);
      expect(screen.getByTestId('application-modal')).toBeTruthy();
      expect(screen.getByText('Cover Letter *')).toBeTruthy();
      expect(screen.getByText('Resume URL *')).toBeTruthy();
    });

    test('submits an application with required fields', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);

      const coverLetterInput = screen.getByPlaceholderText("Tell us why you're a great fit...");
      fireEvent.change(coverLetterInput, {
        target: { value: 'I am very interested in this role.' },
      });

      const resumeInput = screen.getByPlaceholderText('https://drive.google.com/your-resume');
      fireEvent.change(resumeInput, {
        target: { value: 'https://drive.google.com/my-resume' },
      });

      fireEvent.click(screen.getByText('Submit Application'));

      expect(screen.queryByTestId('application-modal')).toBeFalsy();
    });

    test('does not submit application without cover letter', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);

      const resumeInput = screen.getByPlaceholderText('https://drive.google.com/your-resume');
      fireEvent.change(resumeInput, {
        target: { value: 'https://drive.google.com/my-resume' },
      });

      fireEvent.click(screen.getByText('Submit Application'));
      expect(screen.getByTestId('application-modal')).toBeTruthy();
    });

    test('does not submit application without resume URL', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);

      const coverLetterInput = screen.getByPlaceholderText("Tell us why you're a great fit...");
      fireEvent.change(coverLetterInput, {
        target: { value: 'I am very interested in this role.' },
      });

      fireEvent.click(screen.getByText('Submit Application'));
      expect(screen.getByTestId('application-modal')).toBeTruthy();
    });

    test('shows Applied badge after submitting application', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);

      fireEvent.change(screen.getByPlaceholderText("Tell us why you're a great fit..."), {
        target: { value: 'Cover letter text' },
      });
      fireEvent.change(screen.getByPlaceholderText('https://drive.google.com/your-resume'), {
        target: { value: 'https://resume.url' },
      });
      fireEvent.click(screen.getByText('Submit Application'));

      expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
    });

    test('disables Quick Apply after application is submitted', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);

      fireEvent.change(screen.getByPlaceholderText("Tell us why you're a great fit..."), {
        target: { value: 'Cover letter text' },
      });
      fireEvent.change(screen.getByPlaceholderText('https://drive.google.com/your-resume'), {
        target: { value: 'https://resume.url' },
      });
      fireEvent.click(screen.getByText('Submit Application'));

      // After submission, the first job should show "Applied" instead of "Quick Apply"
      const appliedBtns = screen.getAllByText('Applied');
      expect(appliedBtns.length).toBeGreaterThanOrEqual(2); // badge + button
    });
  });

  describe('Applications View', () => {
    const applyToFirstJob = () => {
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);
      fireEvent.change(screen.getByPlaceholderText("Tell us why you're a great fit..."), {
        target: { value: 'Cover letter text' },
      });
      fireEvent.change(screen.getByPlaceholderText('https://drive.google.com/your-resume'), {
        target: { value: 'https://resume.url' },
      });
      fireEvent.click(screen.getByText('Submit Application'));
    };

    test('shows application in My Applications after applying', () => {
      render(<JobBoard />);
      applyToFirstJob();
      fireEvent.click(screen.getByText('My Applications'));
      expect(screen.getByText('Total')).toBeTruthy();
      const applicationCards = document.querySelectorAll('[data-testid^="application-card-"]');
      expect(applicationCards.length).toBe(1);
    });

    test('shows application status stats', () => {
      render(<JobBoard />);
      applyToFirstJob();
      fireEvent.click(screen.getByText('My Applications'));
      expect(screen.getByText('Total')).toBeTruthy();
      expect(screen.getByText('Under Review')).toBeTruthy();
      expect(screen.getByText('Interview')).toBeTruthy();
    });

    test('allows filtering applications by status', () => {
      render(<JobBoard />);
      applyToFirstJob();
      fireEvent.click(screen.getByText('My Applications'));

      const statusFilter = screen.getAllByRole('combobox').find((select) => {
        const options = within(select).queryAllByRole('option');
        return options.some((opt) => opt.textContent === 'All Applications');
      });
      expect(statusFilter).toBeTruthy();
    });

    test('allows withdrawing an application with confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<JobBoard />);
      applyToFirstJob();
      fireEvent.click(screen.getByText('My Applications'));
      fireEvent.click(screen.getByText('Withdraw'));
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to withdraw this application?'
      );
    });

    test('does not withdraw application when confirmation is cancelled', () => {
      window.confirm.mockReturnValue(false);
      render(<JobBoard />);
      applyToFirstJob();
      fireEvent.click(screen.getByText('My Applications'));
      fireEvent.click(screen.getByText('Withdraw'));
      // Application status should still be "Applied"
      expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
    });
  });

  describe('Company Profile Modal', () => {
    test('opens company profile from Companies view', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Companies'));
      const companyCard = screen.getByTestId('company-card-1');
      fireEvent.click(companyCard);
      expect(screen.getByTestId('company-profile-modal')).toBeTruthy();
      expect(screen.getByText('Technology')).toBeTruthy();
      expect(screen.getByText('Open Positions (2)')).toBeTruthy();
    });

    test('shows company details in profile modal', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Companies'));
      fireEvent.click(screen.getByTestId('company-card-3'));
      expect(screen.getByText('GreenScale')).toBeTruthy();
      expect(screen.getByText('CleanTech')).toBeTruthy();
      expect(screen.getByText('200-500 employees')).toBeTruthy();
    });

    test('navigates to job detail from company profile', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Companies'));
      fireEvent.click(screen.getByTestId('company-card-1'));
      // TechFlow Inc. has 2 jobs, click on the first
      const openPositions = screen.getByText('Open Positions (2)');
      expect(openPositions).toBeTruthy();
      const modal = screen.getByTestId('company-profile-modal');
      const jobLinks = within(modal).getAllByText(/Senior Frontend Engineer|Sales Development Rep/);
      fireEvent.click(jobLinks[0]);
      expect(screen.getByTestId('job-detail-modal')).toBeTruthy();
    });

    test('closes company profile modal', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Companies'));
      fireEvent.click(screen.getByTestId('company-card-1'));
      expect(screen.getByTestId('company-profile-modal')).toBeTruthy();
      const closeButtons = screen.getAllByText('×');
      const modalClose = closeButtons.find((btn) =>
        btn.closest('[data-testid="company-profile-modal"]')
      );
      fireEvent.click(modalClose);
      expect(screen.queryByTestId('company-profile-modal')).toBeFalsy();
    });
  });

  describe('Admin Panel', () => {
    test('shows admin stats', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Admin Panel'));
      expect(screen.getByText('Total Jobs')).toBeTruthy();
      expect(screen.getByText('Total Applicants')).toBeTruthy();
      expect(screen.getByText('Your Applications')).toBeTruthy();
    });

    test('shows all jobs in admin table', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Admin Panel'));
      const rows = document.querySelectorAll('tbody tr');
      expect(rows.length).toBe(10);
    });

    test('opens create job modal', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Admin Panel'));
      fireEvent.click(screen.getByText('+ Post New Job'));
      expect(screen.getByTestId('create-job-modal')).toBeTruthy();
      expect(screen.getByText('Post a New Job')).toBeTruthy();
    });

    test('creates a new job with required fields', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Admin Panel'));
      fireEvent.click(screen.getByText('+ Post New Job'));

      fireEvent.change(screen.getByPlaceholderText('e.g., Senior Frontend Engineer'), {
        target: { value: 'Test Engineer' },
      });

      const modal = screen.getByTestId('create-job-modal');
      const selects = within(modal).getAllByRole('combobox');
      // Category select
      fireEvent.change(selects[0], { target: { value: 'Engineering' } });
      // Type select
      fireEvent.change(selects[1], { target: { value: 'Full-time' } });
      // Experience select
      fireEvent.change(selects[2], { target: { value: 'Mid Level' } });

      fireEvent.click(screen.getByText('Post Job'));
      expect(screen.queryByTestId('create-job-modal')).toBeFalsy();

      // New job should appear in admin table
      const rows = document.querySelectorAll('tbody tr');
      expect(rows.length).toBe(11);
    });

    test('does not create job without required fields', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Admin Panel'));
      fireEvent.click(screen.getByText('+ Post New Job'));
      fireEvent.click(screen.getByText('Post Job'));
      // Modal should still be open
      expect(screen.getByTestId('create-job-modal')).toBeTruthy();
    });
  });

  describe('Notifications', () => {
    test('shows notification after submitting application', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);
      fireEvent.change(screen.getByPlaceholderText("Tell us why you're a great fit..."), {
        target: { value: 'Cover letter' },
      });
      fireEvent.change(screen.getByPlaceholderText('https://drive.google.com/your-resume'), {
        target: { value: 'https://resume.url' },
      });
      fireEvent.click(screen.getByText('Submit Application'));

      fireEvent.click(screen.getByLabelText('Toggle notifications'));
      expect(screen.getByTestId('notifications-dropdown')).toBeTruthy();
      expect(
        screen.getByText('Application submitted for Senior Frontend Engineer')
      ).toBeTruthy();
    });

    test('shows unread notification count badge', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);
      fireEvent.change(screen.getByPlaceholderText("Tell us why you're a great fit..."), {
        target: { value: 'Cover letter' },
      });
      fireEvent.change(screen.getByPlaceholderText('https://drive.google.com/your-resume'), {
        target: { value: 'https://resume.url' },
      });
      fireEvent.click(screen.getByText('Submit Application'));

      // The unread count badge should show "1"
      const badge = screen.getByText('1');
      expect(badge).toBeTruthy();
    });

    test('marks all notifications as read', () => {
      render(<JobBoard />);
      const applyButtons = screen.getAllByText('Quick Apply');
      fireEvent.click(applyButtons[0]);
      fireEvent.change(screen.getByPlaceholderText("Tell us why you're a great fit..."), {
        target: { value: 'Cover letter' },
      });
      fireEvent.change(screen.getByPlaceholderText('https://drive.google.com/your-resume'), {
        target: { value: 'https://resume.url' },
      });
      fireEvent.click(screen.getByText('Submit Application'));

      fireEvent.click(screen.getByLabelText('Toggle notifications'));
      fireEvent.click(screen.getByText('Mark all read'));
      // Unread count badge should be gone
      expect(screen.queryByText('1')).toBeFalsy();
    });

    test('shows no notifications message when empty', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByLabelText('Toggle notifications'));
      expect(screen.getByText('No notifications')).toBeTruthy();
    });
  });

  describe('Pagination', () => {
    test('shows pagination controls when jobs exceed page size', () => {
      render(<JobBoard />);
      expect(screen.getByText('Previous')).toBeTruthy();
      expect(screen.getByText('Next')).toBeTruthy();
    });

    test('navigates to next page', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Product Manager')).toBeTruthy();
      expect(screen.getByText('Frontend Contract Developer')).toBeTruthy();
    });

    test('navigates back to first page', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Previous'));
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
    });

    test('resets to page 1 when search changes', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Next'));
      const searchInput = screen.getByPlaceholderText(
        'Search jobs, companies, locations... (Press /)'
      );
      fireEvent.change(searchInput, { target: { value: 'Engineer' } });
      // Should be back on page 1 with filtered results
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
    });
  });

  describe('Filter Panel Toggle', () => {
    test('hides filter panel when toggle button is clicked', () => {
      render(<JobBoard />);
      expect(screen.getByText('Filters')).toBeTruthy();
      fireEvent.click(screen.getByText('Hide Filters'));
      expect(screen.queryByText('Filters')).toBeFalsy();
      expect(screen.getByText('Show Filters')).toBeTruthy();
    });

    test('shows filter panel again when toggled back', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Hide Filters'));
      fireEvent.click(screen.getByText('Show Filters'));
      expect(screen.getByText('Filters')).toBeTruthy();
    });
  });

  describe('localStorage Persistence', () => {
    test('loads bookmarks from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          darkMode: false,
          bookmarkedJobs: [1, 3],
          applications: [],
          notifications: [],
          sidebarCollapsed: false,
        })
      );
      render(<JobBoard />);
      const removeBookmarkBtns = screen.getAllByLabelText('Remove bookmark');
      expect(removeBookmarkBtns.length).toBe(2);
    });

    test('loads applications from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          darkMode: false,
          bookmarkedJobs: [],
          applications: [
            {
              id: 999,
              jobId: 1,
              jobTitle: 'Senior Frontend Engineer',
              companyId: 1,
              companyName: 'TechFlow Inc.',
              status: 'Applied',
              appliedDate: '2025-01-20',
              coverLetter: 'Test',
              resumeUrl: 'https://test.com',
            },
          ],
          notifications: [],
          sidebarCollapsed: false,
        })
      );
      render(<JobBoard />);
      fireEvent.click(screen.getByText('My Applications'));
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
      expect(screen.getByText('TechFlow Inc.')).toBeTruthy();
    });

    test('loads dark mode preference from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          darkMode: true,
          bookmarkedJobs: [],
          applications: [],
          notifications: [],
          sidebarCollapsed: false,
        })
      );
      render(<JobBoard />);
      expect(screen.getByText('Light Mode')).toBeTruthy();
    });

    test('loads collapsed sidebar from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          darkMode: false,
          bookmarkedJobs: [],
          applications: [],
          notifications: [],
          sidebarCollapsed: true,
        })
      );
      render(<JobBoard />);
      expect(screen.queryByText('Browse Jobs')).toBeFalsy();
    });
  });

  describe('Cross-feature Interactions', () => {
    test('search and category filter work together', () => {
      render(<JobBoard />);
      const searchInput = screen.getByPlaceholderText(
        'Search jobs, companies, locations... (Press /)'
      );
      fireEvent.change(searchInput, { target: { value: 'San Francisco' } });

      const engineeringCb = screen.getAllByRole('checkbox').find(
        (cb) => cb.parentElement.textContent.trim() === 'Engineering'
      );
      fireEvent.click(engineeringCb);

      // Only engineering jobs in San Francisco should show
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
      expect(screen.queryByText('Sales Development Rep')).toBeFalsy();
    });

    test('applying from job detail modal works', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByTestId('job-detail-modal')).toBeTruthy();
      fireEvent.click(screen.getByText('Apply Now'));

      expect(screen.getByTestId('application-modal')).toBeTruthy();
      fireEvent.change(screen.getByPlaceholderText("Tell us why you're a great fit..."), {
        target: { value: 'Cover letter' },
      });
      fireEvent.change(screen.getByPlaceholderText('https://drive.google.com/your-resume'), {
        target: { value: 'https://resume.url' },
      });
      fireEvent.click(screen.getByText('Submit Application'));

      // Now navigating to My Applications should show the application
      fireEvent.click(screen.getByText('My Applications'));
      const appCards = document.querySelectorAll('[data-testid^="application-card-"]');
      expect(appCards.length).toBe(1);
    });

    test('creating job in admin shows it in browse view', () => {
      render(<JobBoard />);
      fireEvent.click(screen.getByText('Admin Panel'));
      fireEvent.click(screen.getByText('+ Post New Job'));

      fireEvent.change(screen.getByPlaceholderText('e.g., Senior Frontend Engineer'), {
        target: { value: 'New Test Position' },
      });
      const modal = screen.getByTestId('create-job-modal');
      const selects = within(modal).getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Engineering' } });
      fireEvent.change(selects[1], { target: { value: 'Full-time' } });
      fireEvent.change(selects[2], { target: { value: 'Senior' } });
      fireEvent.click(screen.getByText('Post Job'));

      // Navigate back to Browse
      fireEvent.click(screen.getByText('Browse Jobs'));
      expect(screen.getByText('11 jobs found')).toBeTruthy();
    });

    test('salary range filter combined with remote filter', () => {
      render(<JobBoard />);
      const salarySelect = screen.getAllByRole('combobox').find((select) => {
        const options = within(select).queryAllByRole('option');
        return options.some((opt) => opt.textContent === '$150k - $200k');
      });
      fireEvent.change(salarySelect, { target: { value: '4' } });

      const remoteCheckbox = screen.getAllByRole('checkbox').find(
        (cb) => cb.parentElement.textContent.trim() === 'Remote Only'
      );
      fireEvent.click(remoteCheckbox);

      // Only high-salary remote jobs
      expect(screen.getByText('Senior Frontend Engineer')).toBeTruthy();
      expect(screen.getByText('Data Scientist')).toBeTruthy();
      expect(screen.queryByText('Product Designer')).toBeFalsy();
    });
  });
});
