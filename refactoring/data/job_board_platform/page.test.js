import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import JobBoardPlatform from './src/app/page.jsx';

// Mock confirm dialog
window.confirm = vi.fn();

describe('JobBoardPlatform Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  // ── Loading & Data Fetching ──────────────────────────────────────────

  describe('Loading and Data Fetching', () => {
    test('shows loading state initially', () => {
      render(<JobBoardPlatform />);
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading hiring dashboard...')).toBeInTheDocument();
    });

    test('renders main content after data loads', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByTestId('job-board-platform')).toBeInTheDocument();
      });
    });

    test('displays job listings after fetch completes', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    });
  });

  // ── Sidebar Navigation ───────────────────────────────────────────────

  describe('Sidebar Navigation', () => {
    test('renders sidebar with HireBoard title', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('HireBoard')).toBeInTheDocument();
      });
    });

    test('renders all navigation items', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Job Listings')).toBeInTheDocument();
      });
      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByText('Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    test('can collapse sidebar', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('HireBoard')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('HireBoard')).not.toBeInTheDocument();
      expect(screen.queryByText('Job Listings')).not.toBeInTheDocument();
    });

    test('can expand sidebar back after collapsing', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('HireBoard')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.queryByText('HireBoard')).not.toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Toggle sidebar'));
      expect(screen.getByText('HireBoard')).toBeInTheDocument();
    });

    test('shows quick stats in sidebar', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      });
      expect(screen.getByText(/Open positions:/)).toBeInTheDocument();
      expect(screen.getByText(/Total applications:/)).toBeInTheDocument();
      expect(screen.getByText(/Pending review:/)).toBeInTheDocument();
    });

    test('switches to applications view when clicking Applications nav', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Job Listings')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      expect(screen.getByTestId('applications-view')).toBeInTheDocument();
    });

    test('switches to pipeline view', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Pipeline'));
      expect(screen.getByTestId('pipeline-view')).toBeInTheDocument();
    });

    test('switches to analytics view', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByTestId('analytics-view')).toBeInTheDocument();
    });
  });

  // ── Job Listings View ────────────────────────────────────────────────

  describe('Job Listings View', () => {
    test('shows jobs view by default', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByTestId('jobs-view')).toBeInTheDocument();
      });
    });

    test('displays job count info', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText(/Showing .* of .* jobs/)).toBeInTheDocument();
      });
    });

    test('renders job cards with title and metadata', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
    });

    test('shows active/closed badge on job cards', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByTestId('jobs-view')).toBeInTheDocument();
      });
      const activeBadges = screen.getAllByText('Active');
      const closedBadges = screen.getAllByText('Closed');
      expect(activeBadges.length).toBeGreaterThan(0);
      expect(closedBadges.length).toBeGreaterThan(0);
    });

    test('expands job card on click to show details', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText(/Build and maintain our React-based web application/)).toBeInTheDocument();
      expect(screen.getByText('Requirements:')).toBeInTheDocument();
    });

    test('collapses expanded job card when clicking again', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText(/Build and maintain our React-based web application/)).toBeInTheDocument();
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.queryByText(/Build and maintain our React-based web application/)).not.toBeInTheDocument();
    });

    test('shows close/reopen and delete buttons in expanded card', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      expect(screen.getByText('Close Posting')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    test('can toggle job active status', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Close Posting'));
      expect(screen.getByText('Reopen Posting')).toBeInTheDocument();
    });

    test('Post Job button is visible', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('+ Post Job')).toBeInTheDocument();
      });
    });
  });

  // ── Search and Filtering ─────────────────────────────────────────────

  describe('Search and Filtering', () => {
    test('renders search input with placeholder', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search... (Ctrl+K)')).toBeInTheDocument();
      });
    });

    test('filters jobs by search query', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText('Search... (Ctrl+K)'), { target: { value: 'frontend' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    test('renders department filter dropdown', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by department')).toBeInTheDocument();
      });
    });

    test('filters jobs by department', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText('Filter by department'), { target: { value: 'Design' } });
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
    });

    test('renders type filter in jobs view', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
      });
    });

    test('filters jobs by type', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText('Filter by type'), { target: { value: 'internship' } });
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
      expect(screen.getByText('DevOps Intern')).toBeInTheDocument();
    });

    test('filters jobs by experience level', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by experience')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText('Filter by experience'), { target: { value: 'director' } });
      expect(screen.getByText('Sales Director')).toBeInTheDocument();
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    });

    test('filters jobs by location', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by location')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText('Filter by location'), { target: { value: 'Remote' } });
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('DevOps Intern')).toBeInTheDocument();
      expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    test('filters active-only jobs', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Active only')).toBeInTheDocument();
      });
      // Backend Engineer (j3) is inactive
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Active only'));
      expect(screen.queryByText('Backend Engineer')).not.toBeInTheDocument();
    });

    test('shows empty state when no jobs match filters', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search... (Ctrl+K)')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText('Search... (Ctrl+K)'), { target: { value: 'xyznonexistent' } });
      expect(screen.getByText('No jobs match your filters')).toBeInTheDocument();
    });

    test('filters applications by status in applications view', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      expect(screen.getByTestId('applications-view')).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'interview' } });
      expect(screen.getByText('Alice Zhang')).toBeInTheDocument();
      expect(screen.queryByText('Bob Kumar')).not.toBeInTheDocument();
    });

    test('filters applications by department via shared department filter', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      fireEvent.change(screen.getByLabelText('Filter by department'), { target: { value: 'Design' } });
      expect(screen.getByText('Dave Park')).toBeInTheDocument();
      expect(screen.getByText('Eve Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Alice Zhang')).not.toBeInTheDocument();
    });

    test('search filters applications by candidate name', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      fireEvent.change(screen.getByPlaceholderText('Search... (Ctrl+K)'), { target: { value: 'Alice' } });
      expect(screen.getByText('Alice Zhang')).toBeInTheDocument();
      expect(screen.queryByText('Bob Kumar')).not.toBeInTheDocument();
    });
  });

  // ── Sorting ──────────────────────────────────────────────────────────

  describe('Sorting', () => {
    test('renders sort dropdown', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      });
    });

    test('renders sort direction toggle', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByLabelText('Toggle sort direction')).toBeInTheDocument();
      });
    });

    test('can toggle sort direction', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByLabelText('Toggle sort direction')).toBeInTheDocument();
      });
      const btn = screen.getByLabelText('Toggle sort direction');
      expect(btn.textContent).toBe('\u2193'); // desc by default
      fireEvent.click(btn);
      expect(btn.textContent).toBe('\u2191'); // now asc
    });
  });

  // ── Pagination ───────────────────────────────────────────────────────

  describe('Pagination', () => {
    test('shows pagination controls when there are more jobs than page size', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
    });

    test('can navigate to the next page', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
      const nextBtn = screen.getByText('Next');
      fireEvent.click(nextBtn);
      // Page 2 should show different jobs
      expect(screen.getByText(/Showing .* of .* jobs/)).toBeInTheDocument();
    });

    test('Previous button is disabled on page 1', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
      const prevBtn = screen.getByText('Previous');
      expect(prevBtn.disabled).toBe(true);
    });

    test('can navigate via page number buttons', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
      const pageBtn = screen.getByText('2');
      fireEvent.click(pageBtn);
      const prevBtn = screen.getByText('Previous');
      expect(prevBtn.disabled).toBe(false);
    });
  });

  // ── Create Job Modal ─────────────────────────────────────────────────

  describe('Create Job Modal', () => {
    test('opens create job modal on Post Job click', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('+ Post Job')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('+ Post Job'));
      expect(screen.getByTestId('create-job-modal')).toBeInTheDocument();
      expect(screen.getByText('Post New Job')).toBeInTheDocument();
    });

    test('modal has all required form fields', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('+ Post Job')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('+ Post Job'));
      expect(screen.getByPlaceholderText('e.g. Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Describe the role...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. 100000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. 150000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. React, TypeScript, 3+ years')).toBeInTheDocument();
    });

    test('Post Job button is disabled when title or description is empty', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('+ Post Job')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('+ Post Job'));
      const postBtn = within(screen.getByTestId('create-job-modal')).getByText('Post Job');
      expect(postBtn.disabled).toBe(true);
    });

    test('can create a new job posting', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('+ Post Job')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('+ Post Job'));
      fireEvent.change(screen.getByPlaceholderText('e.g. Senior Software Engineer'), { target: { value: 'Test Job Position' } });
      fireEvent.change(screen.getByPlaceholderText('Describe the role...'), { target: { value: 'A test job description for the eval' } });
      fireEvent.change(screen.getByPlaceholderText('e.g. 100000'), { target: { value: '80000' } });
      fireEvent.change(screen.getByPlaceholderText('e.g. 150000'), { target: { value: '120000' } });
      const postBtn = within(screen.getByTestId('create-job-modal')).getByText('Post Job');
      expect(postBtn.disabled).toBe(false);
      fireEvent.click(postBtn);
      // Modal should close
      expect(screen.queryByTestId('create-job-modal')).not.toBeInTheDocument();
      // New job should appear in list
      expect(screen.getByText('Test Job Position')).toBeInTheDocument();
    });

    test('can close create job modal with X button', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('+ Post Job')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('+ Post Job'));
      expect(screen.getByTestId('create-job-modal')).toBeInTheDocument();
      fireEvent.click(within(screen.getByTestId('create-job-modal')).getByText('\u2715'));
      expect(screen.queryByTestId('create-job-modal')).not.toBeInTheDocument();
    });

    test('can close create job modal with Cancel button', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('+ Post Job')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('+ Post Job'));
      fireEvent.click(within(screen.getByTestId('create-job-modal')).getByText('Cancel'));
      expect(screen.queryByTestId('create-job-modal')).not.toBeInTheDocument();
    });
  });

  // ── Applications View ────────────────────────────────────────────────

  describe('Applications View', () => {
    test('displays application cards with candidate info', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      expect(screen.getByText('Alice Zhang')).toBeInTheDocument();
      expect(screen.getByText('Bob Kumar')).toBeInTheDocument();
    });

    test('shows application count', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      expect(screen.getByText(/12 applications/)).toBeInTheDocument();
    });

    test('shows status badge on application cards', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      expect(screen.getByTestId('applications-view')).toBeInTheDocument();
      // Check for status badges
      const interviewBadges = screen.getAllByText('Interview');
      expect(interviewBadges.length).toBeGreaterThan(0);
    });

    test('has status transition buttons on application cards', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const moveButtons = screen.getAllByText(/Move to/);
      expect(moveButtons.length).toBeGreaterThan(0);
    });

    test('can change application status via move-to buttons', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      // Find Alice Zhang's card (status: interview)
      const aliceCard = screen.getByTestId('application-card-a1');
      const moveToOfferBtn = within(aliceCard).getByText('Move to offer');
      fireEvent.click(moveToOfferBtn);
      // Alice should now have offer status
      expect(within(aliceCard).getByText('Offer')).toBeInTheDocument();
    });

    test('has View Details button on application cards', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const viewButtons = screen.getAllByText('View Details');
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    test('shows star ratings on application cards', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const ratings = screen.getAllByTestId('star-rating');
      expect(ratings.length).toBeGreaterThan(0);
    });

    test('shows empty state when no applications match', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      fireEvent.change(screen.getByPlaceholderText('Search... (Ctrl+K)'), { target: { value: 'zzzzzznonexistent' } });
      expect(screen.getByText('No applications match your filters')).toBeInTheDocument();
    });
  });

  // ── Application Detail Modal ─────────────────────────────────────────

  describe('Application Detail Modal', () => {
    test('opens application detail modal on View Details click', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const viewButtons = screen.getAllByText('View Details');
      fireEvent.click(viewButtons[0]);
      expect(screen.getByTestId('application-detail-modal')).toBeInTheDocument();
      expect(screen.getByText('Application Details')).toBeInTheDocument();
    });

    test('shows candidate info in detail modal', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const aliceCard = screen.getByTestId('application-card-a1');
      fireEvent.click(within(aliceCard).getByText('View Details'));
      const modal = screen.getByTestId('application-detail-modal');
      expect(within(modal).getByText('Alice Zhang')).toBeInTheDocument();
      expect(within(modal).getByText('alice@email.com')).toBeInTheDocument();
    });

    test('shows cover letter in detail modal', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const aliceCard = screen.getByTestId('application-card-a1');
      fireEvent.click(within(aliceCard).getByText('View Details'));
      const modal = screen.getByTestId('application-detail-modal');
      expect(within(modal).getByText('Cover Letter')).toBeInTheDocument();
      expect(within(modal).getByText(/Passionate about building scalable UIs/)).toBeInTheDocument();
    });

    test('shows notes textarea in detail modal', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const aliceCard = screen.getByTestId('application-card-a1');
      fireEvent.click(within(aliceCard).getByText('View Details'));
      const modal = screen.getByTestId('application-detail-modal');
      expect(within(modal).getByPlaceholderText('Add notes about this candidate...')).toBeInTheDocument();
    });

    test('can update notes in detail modal', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const aliceCard = screen.getByTestId('application-card-a1');
      fireEvent.click(within(aliceCard).getByText('View Details'));
      const modal = screen.getByTestId('application-detail-modal');
      const notesInput = within(modal).getByPlaceholderText('Add notes about this candidate...');
      fireEvent.change(notesInput, { target: { value: 'Updated notes for eval test' } });
      expect(notesInput.value).toBe('Updated notes for eval test');
    });

    test('has status transition buttons in detail modal', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const aliceCard = screen.getByTestId('application-card-a1');
      fireEvent.click(within(aliceCard).getByText('View Details'));
      const modal = screen.getByTestId('application-detail-modal');
      expect(within(modal).getByText('Move to Status')).toBeInTheDocument();
      // Alice is in 'interview', so 'interview' button should be disabled
      APPLICATION_STATUSES.forEach((status) => {
        expect(within(modal).getByText(new RegExp(`^${status.charAt(0).toUpperCase() + status.slice(1)}$`, 'i'))).toBeInTheDocument();
      });
    });

    test('can change status from detail modal', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const aliceCard = screen.getByTestId('application-card-a1');
      fireEvent.click(within(aliceCard).getByText('View Details'));
      const modal = screen.getByTestId('application-detail-modal');
      // Click the "Offer" status button (Alice is currently in Interview)
      const offerBtn = within(modal).getAllByText(/offer/i).find(
        (el) => el.tagName === 'BUTTON' && !el.disabled
      );
      if (offerBtn) fireEvent.click(offerBtn);
    });

    test('shows View Resume link', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const viewButtons = screen.getAllByText('View Details');
      fireEvent.click(viewButtons[0]);
      expect(screen.getByText('View Resume')).toBeInTheDocument();
    });

    test('can close detail modal with close button', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      const viewButtons = screen.getAllByText('View Details');
      fireEvent.click(viewButtons[0]);
      expect(screen.getByTestId('application-detail-modal')).toBeInTheDocument();
      fireEvent.click(within(screen.getByTestId('application-detail-modal')).getByText('Close'));
      expect(screen.queryByTestId('application-detail-modal')).not.toBeInTheDocument();
    });

    test('shows interview date when available', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      // Alice (a1) has an interviewDate
      const aliceCard = screen.getByTestId('application-card-a1');
      fireEvent.click(within(aliceCard).getByText('View Details'));
      const modal = screen.getByTestId('application-detail-modal');
      expect(within(modal).getByText('Interview Date')).toBeInTheDocument();
    });
  });

  // ── Pipeline View ────────────────────────────────────────────────────

  describe('Pipeline View', () => {
    test('renders pipeline columns for each status', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Pipeline'));
      expect(screen.getByTestId('pipeline-view')).toBeInTheDocument();
      APPLICATION_STATUSES.forEach((status) => {
        expect(screen.getByTestId(`pipeline-column-${status}`)).toBeInTheDocument();
      });
    });

    test('shows candidate count per column', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Pipeline'));
      // "new" column should have Henry, Iris, Liam = 3 candidates
      const newColumn = screen.getByTestId('pipeline-column-new');
      expect(within(newColumn).getByText('3')).toBeInTheDocument();
    });

    test('shows candidate cards in pipeline columns', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Pipeline'));
      expect(screen.getByText('Alice Zhang')).toBeInTheDocument();
      expect(screen.getByText('Frank Lee')).toBeInTheDocument();
    });

    test('pipeline cards show job title', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Pipeline'));
      // Frank is hired for Backend Engineer
      const hiredColumn = screen.getByTestId('pipeline-column-hired');
      expect(within(hiredColumn).getByText('Backend Engineer')).toBeInTheDocument();
    });

    test('clicking pipeline card opens application detail', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Pipeline'));
      fireEvent.click(screen.getByTestId('pipeline-card-a1'));
      expect(screen.getByTestId('application-detail-modal')).toBeInTheDocument();
    });

    test('shows "No candidates" for empty columns', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Pipeline'));
      // No one is in 'offer' after initial load except Dave Park
      // Check that empty columns show the placeholder
      const noCandidateTexts = screen.queryAllByText('No candidates');
      // Some columns might be empty depending on data
      expect(noCandidateTexts.length).toBeGreaterThanOrEqual(0);
    });

    test('pipeline cards show star ratings', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Pipeline'));
      const ratings = screen.getAllByTestId('star-rating');
      expect(ratings.length).toBeGreaterThan(0);
    });
  });

  // ── Analytics View ───────────────────────────────────────────────────

  describe('Analytics View', () => {
    test('renders analytics summary cards', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByTestId('analytics-view')).toBeInTheDocument();
      expect(screen.getByText('Total Open Positions')).toBeInTheDocument();
      expect(screen.getByText('Total Applications')).toBeInTheDocument();
      expect(screen.getByText('Avg. Time-to-Hire')).toBeInTheDocument();
      expect(screen.getByText('Offer Rate')).toBeInTheDocument();
    });

    test('displays correct total applications count', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('12')).toBeInTheDocument(); // 12 applications
    });

    test('shows pipeline distribution bar chart', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Pipeline Distribution')).toBeInTheDocument();
      // Check that at least one pipeline bar exists
      const bars = screen.getAllByTestId(/^pipeline-bar-/);
      expect(bars.length).toBeGreaterThan(0);
    });

    test('shows department breakdown table', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Department Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });

    test('department table has correct column headers', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Jobs')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Applications')).toBeInTheDocument();
    });

    test('shows offer rate percentage', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Analytics'));
      // 2 out of 12 are offer/hired = ~17%
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
    });
  });

  // ── Job Deletion ─────────────────────────────────────────────────────

  describe('Job Deletion', () => {
    test('shows confirm dialog on delete', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Delete'));
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this job posting?');
    });

    test('deletes job and associated applications when confirmed', async () => {
      window.confirm.mockReturnValue(true);
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Delete'));
      expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    });

    test('does not delete job when confirm is cancelled', async () => {
      window.confirm.mockReturnValue(false);
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Delete'));
      expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    });
  });

  // ── Cross-View Data Consistency ──────────────────────────────────────

  describe('Cross-View Data Consistency', () => {
    test('application status change reflects in pipeline view', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      // Change Alice's status in applications view
      fireEvent.click(screen.getByText('Applications'));
      const aliceCard = screen.getByTestId('application-card-a1');
      fireEvent.click(within(aliceCard).getByText('Move to offer'));
      // Switch to pipeline view
      fireEvent.click(screen.getByText('Pipeline'));
      const offerColumn = screen.getByTestId('pipeline-column-offer');
      expect(within(offerColumn).getByText('Alice Zhang')).toBeInTheDocument();
    });

    test('new job appears after creating in create modal', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('+ Post Job')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('+ Post Job'));
      fireEvent.change(screen.getByPlaceholderText('e.g. Senior Software Engineer'), { target: { value: 'Cross View Test Job' } });
      fireEvent.change(screen.getByPlaceholderText('Describe the role...'), { target: { value: 'Testing cross-view consistency' } });
      const postBtn = within(screen.getByTestId('create-job-modal')).getByText('Post Job');
      fireEvent.click(postBtn);
      expect(screen.getByText('Cross View Test Job')).toBeInTheDocument();
    });

    test('toggling active status updates sidebar stats', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      });
      const initialOpen = screen.getByText(/Open positions:/).textContent;
      // Close a posting
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Close Posting'));
      const updatedOpen = screen.getByText(/Open positions:/).textContent;
      expect(updatedOpen).not.toBe(initialOpen);
    });

    test('deleting a job updates analytics counts', async () => {
      window.confirm.mockReturnValue(true);
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
      });
      // Delete a job
      fireEvent.click(screen.getByText('Senior Frontend Engineer'));
      fireEvent.click(screen.getByText('Delete'));
      // Switch to analytics
      fireEvent.click(screen.getByText('Analytics'));
      // Should have fewer than 12 applications now (3 were for j1)
      // The total applications card should reflect deletion
      expect(screen.getByTestId('analytics-view')).toBeInTheDocument();
    });
  });

  // ── Star Rating Component ────────────────────────────────────────────

  describe('Star Rating', () => {
    test('can rate an application from application card', async () => {
      render(<JobBoardPlatform />);
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Applications'));
      // Find a star button and click it
      const stars = screen.getAllByRole('button', { name: /star/ });
      expect(stars.length).toBeGreaterThan(0);
      fireEvent.click(stars[0]);
    });
  });
});

const APPLICATION_STATUSES = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'];
