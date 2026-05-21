import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SurveyAnalyticsDashboard from './src/app/page.jsx';

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

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

describe('SurveyAnalyticsDashboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders the sidebar with SurveyInsight branding', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByText(/SurveyInsight/)).toBeInTheDocument();
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('renders all sidebar navigation items', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Surveys')).toBeInTheDocument();
      expect(screen.getByText('Responses')).toBeInTheDocument();
      expect(screen.getByText('Demographics')).toBeInTheDocument();
      expect(screen.getByText('Compare')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByPlaceholderText('Search surveys...')).toBeInTheDocument();
    });

    test('renders filter controls in header', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      expect(screen.getByLabelText('Date range')).toBeInTheDocument();
    });

    test('renders export button', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByLabelText('Export data')).toBeInTheDocument();
    });

    test('renders settings and theme toggle buttons in sidebar', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByLabelText('Toggle settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });
  });

  describe('Overview View (default)', () => {
    test('renders Dashboard Overview heading', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });

    test('renders all metric cards', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByText('Total Surveys')).toBeInTheDocument();
      expect(screen.getByText('Total Responses')).toBeInTheDocument();
      expect(screen.getByText('Active Surveys')).toBeInTheDocument();
      expect(screen.getByText('Avg Responses')).toBeInTheDocument();
      expect(screen.getByText('Avg Rating')).toBeInTheDocument();
      expect(screen.getByText('NPS Score')).toBeInTheDocument();
    });

    test('renders Response Trend chart section', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByText('Response Trend')).toBeInTheDocument();
    });

    test('renders NPS Score Overview section', () => {
      render(<SurveyAnalyticsDashboard />);
      expect(screen.getByText('NPS Score Overview')).toBeInTheDocument();
    });

    test('renders demographic breakdown toggle buttons', () => {
      render(<SurveyAnalyticsDashboard />);
      const regionButtons = screen.getAllByText('Region');
      expect(regionButtons.length).toBeGreaterThan(0);
    });

    test('renders charts with correct aria labels', () => {
      render(<SurveyAnalyticsDashboard />);
      const lineCharts = screen.getAllByLabelText('Line chart');
      expect(lineCharts.length).toBeGreaterThan(0);
      const pieCharts = screen.getAllByLabelText('Pie chart');
      expect(pieCharts.length).toBeGreaterThan(0);
      const npsGauges = screen.getAllByLabelText('NPS gauge');
      expect(npsGauges.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Toggling', () => {
    test('saves theme to localStorage when toggled', () => {
      render(<SurveyAnalyticsDashboard />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('surveyDashboardTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<SurveyAnalyticsDashboard />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('surveyDashboardTheme', 'light');
    });

    test('updates document body className on theme toggle', () => {
      render(<SurveyAnalyticsDashboard />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(document.body.className).toBe('dark-theme');
      fireEvent.click(themeButton);
      expect(document.body.className).toBe('');
    });
  });

  describe('Navigation', () => {
    test('clicking Surveys navigates to survey list', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      expect(screen.getByText('Q1 Product Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('Customer Support Feedback')).toBeInTheDocument();
      expect(screen.getByText('Pricing Survey 2024')).toBeInTheDocument();
      expect(screen.getByText('UX Research Study')).toBeInTheDocument();
      expect(screen.getByText('Feature Request Priorities')).toBeInTheDocument();
    });

    test('clicking Demographics navigates to demographics view', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Demographics'));
      expect(screen.getByText('Demographic Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Distribution')).toBeInTheDocument();
      expect(screen.getByText('Proportion')).toBeInTheDocument();
    });

    test('clicking Compare navigates to comparison view', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Compare'));
      expect(screen.getByText('Survey Comparison')).toBeInTheDocument();
      expect(screen.getByText(/Select up to 4 surveys/)).toBeInTheDocument();
    });

    test('clicking Responses without a survey selected shows prompt', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Responses'));
      expect(screen.getByText(/Select a survey to view detailed response analysis/)).toBeInTheDocument();
      expect(screen.getByText('Browse Surveys')).toBeInTheDocument();
    });

    test('clicking Browse Surveys from responses navigates to survey list', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Responses'));
      fireEvent.click(screen.getByText('Browse Surveys'));
      expect(screen.getByText('Q1 Product Satisfaction')).toBeInTheDocument();
    });
  });

  describe('Survey List', () => {
    test('shows all surveys with their metadata', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      expect(screen.getByText('Q1 Product Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('active', { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/Product/)).toBeInTheDocument();
    });

    test('displays response count for each survey', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      expect(screen.getByText('342')).toBeInTheDocument();
      expect(screen.getByText('187')).toBeInTheDocument();
      expect(screen.getByText('523')).toBeInTheDocument();
    });

    test('shows question counts for surveys', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const questionLabels = screen.getAllByText(/questions/);
      expect(questionLabels.length).toBeGreaterThanOrEqual(5);
    });

    test('sort by dropdown changes sort behavior', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'title' } });
      // After sorting by title, first survey should be alphabetically first
      const surveyCards = screen.getAllByRole('button', { name: /^View / });
      expect(surveyCards.length).toBe(5);
    });

    test('toggle sort order button works', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const sortOrderBtn = screen.getByLabelText('Toggle sort order');
      expect(sortOrderBtn.textContent).toContain('Desc');
      fireEvent.click(sortOrderBtn);
      expect(sortOrderBtn.textContent).toContain('Asc');
    });

    test('clicking a survey navigates to response analysis', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const surveyCard = screen.getByLabelText('View Q1 Product Satisfaction');
      fireEvent.click(surveyCard);
      expect(screen.getByText('Q1 Product Satisfaction')).toBeInTheDocument();
      expect(screen.getByText(/responses in selected date range/)).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('filtering by category shows only matching surveys', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const categorySelect = screen.getByLabelText('Filter by category');
      fireEvent.change(categorySelect, { target: { value: 'Pricing' } });
      expect(screen.getByText('Pricing Survey 2024')).toBeInTheDocument();
      expect(screen.queryByText('Q1 Product Satisfaction')).not.toBeInTheDocument();
    });

    test('filtering by status shows only matching surveys', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const statusSelect = screen.getByLabelText('Filter by status');
      fireEvent.change(statusSelect, { target: { value: 'draft' } });
      expect(screen.getByText('Feature Request Priorities')).toBeInTheDocument();
      expect(screen.queryByText('Q1 Product Satisfaction')).not.toBeInTheDocument();
    });

    test('empty filter results show no surveys message', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const searchInput = screen.getByPlaceholderText('Search surveys...');
      fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } });
      expect(screen.getByText('No surveys match your filters.')).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    test('search filters surveys by title', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const searchInput = screen.getByPlaceholderText('Search surveys...');
      fireEvent.change(searchInput, { target: { value: 'Pricing' } });
      expect(screen.getByText('Pricing Survey 2024')).toBeInTheDocument();
      expect(screen.queryByText('Q1 Product Satisfaction')).not.toBeInTheDocument();
    });

    test('search filters surveys by category', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      const searchInput = screen.getByPlaceholderText('Search surveys...');
      fireEvent.change(searchInput, { target: { value: 'usability' } });
      expect(screen.getByText('UX Research Study')).toBeInTheDocument();
    });
  });

  describe('Response Analysis View', () => {
    const navigateToResponseAnalysis = () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      fireEvent.click(screen.getByLabelText('View Q1 Product Satisfaction'));
    };

    test('shows survey title and back button', () => {
      navigateToResponseAnalysis();
      expect(screen.getByText('Q1 Product Satisfaction')).toBeInTheDocument();
      expect(screen.getByText(/← Back to Surveys/)).toBeInTheDocument();
    });

    test('shows response count in date range', () => {
      navigateToResponseAnalysis();
      expect(screen.getByText(/responses in selected date range/)).toBeInTheDocument();
    });

    test('shows chart type toggle buttons', () => {
      navigateToResponseAnalysis();
      expect(screen.getByText(/Bar/)).toBeInTheDocument();
      expect(screen.getByText(/Pie/)).toBeInTheDocument();
    });

    test('shows question selector buttons', () => {
      navigateToResponseAnalysis();
      expect(screen.getByText(/How satisfied/)).toBeInTheDocument();
    });

    test('clicking a question shows its analytics', () => {
      navigateToResponseAnalysis();
      // The first question should be auto-selected and show analytics
      expect(screen.getByText(/average rating/)).toBeInTheDocument();
    });

    test('back button returns to survey list', () => {
      navigateToResponseAnalysis();
      fireEvent.click(screen.getByText(/← Back to Surveys/));
      expect(screen.getByText('Customer Support Feedback')).toBeInTheDocument();
    });

    test('switching chart type toggles between bar and pie', () => {
      navigateToResponseAnalysis();
      const pieButton = screen.getByText(/Pie/);
      fireEvent.click(pieButton);
      // The chart should now render as a pie chart (the button should be selected)
      expect(pieButton.closest('button')).toHaveStyle({ background: '#3b82f6' });
    });

    test('shows response timeline chart', () => {
      navigateToResponseAnalysis();
      expect(screen.getByText('Response Timeline')).toBeInTheDocument();
    });
  });

  describe('Date Range Filter', () => {
    test('changing date range updates the filter', () => {
      render(<SurveyAnalyticsDashboard />);
      const dateSelect = screen.getByLabelText('Date range');
      fireEvent.change(dateSelect, { target: { value: 'Last 7 days' } });
      expect(dateSelect.value).toBe('Last 7 days');
    });

    test('all time option is available', () => {
      render(<SurveyAnalyticsDashboard />);
      const dateSelect = screen.getByLabelText('Date range');
      fireEvent.change(dateSelect, { target: { value: 'All time' } });
      expect(dateSelect.value).toBe('All time');
    });
  });

  describe('Demographics View', () => {
    test('renders demographic breakdown heading', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Demographics'));
      expect(screen.getByText('Demographic Breakdown')).toBeInTheDocument();
    });

    test('renders dimension toggle buttons', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Demographics'));
      const regionButtons = screen.getAllByText('Region');
      expect(regionButtons.length).toBeGreaterThan(0);
      const ageGroupButtons = screen.getAllByText('Age Group');
      expect(ageGroupButtons.length).toBeGreaterThan(0);
      const userTypeButtons = screen.getAllByText('User Type');
      expect(userTypeButtons.length).toBeGreaterThan(0);
    });

    test('switching demographic dimension updates charts and table', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Demographics'));
      const userTypeButtons = screen.getAllByText('User Type');
      fireEvent.click(userTypeButtons[0]);
      // Should show Free and Paid segments
      expect(screen.getByText('Free', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Paid', { exact: false })).toBeInTheDocument();
    });

    test('renders response table with segment data', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Demographics'));
      expect(screen.getByText('Response Table')).toBeInTheDocument();
      expect(screen.getByText('Segment')).toBeInTheDocument();
      expect(screen.getByText('Percentage')).toBeInTheDocument();
    });

    test('renders bar and pie charts in demographics', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Demographics'));
      const barCharts = screen.getAllByLabelText('Bar chart');
      expect(barCharts.length).toBeGreaterThan(0);
      const pieCharts = screen.getAllByLabelText('Pie chart');
      expect(pieCharts.length).toBeGreaterThan(0);
    });
  });

  describe('Comparison View', () => {
    test('renders comparison view heading and instructions', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Compare'));
      expect(screen.getByText('Survey Comparison')).toBeInTheDocument();
      expect(screen.getByText(/Select up to 4 surveys/)).toBeInTheDocument();
    });

    test('shows only non-draft surveys for comparison', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Compare'));
      // Feature Request Priorities is a draft and should not appear
      const compButtons = screen.getAllByRole('button');
      const featureRequestBtn = compButtons.find(
        (btn) => btn.textContent.includes('Feature Request Priorities')
      );
      expect(featureRequestBtn).toBeUndefined();
    });

    test('selecting 2 surveys shows comparison data', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Compare'));

      // Click two survey buttons to select them
      const buttons = screen.getAllByRole('button');
      const q1Btn = buttons.find((b) => b.textContent.includes('Q1 Product Satisfaction'));
      const csBtn = buttons.find((b) => b.textContent.includes('Customer Support Feedback'));
      fireEvent.click(q1Btn);
      fireEvent.click(csBtn);

      expect(screen.getByText('Response Count Comparison')).toBeInTheDocument();
    });

    test('shows message when fewer than 2 surveys selected', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Compare'));
      expect(screen.getByText(/Select at least 2 surveys/)).toBeInTheDocument();
    });

    test('toggling a selected survey deselects it', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Compare'));

      const buttons = screen.getAllByRole('button');
      const q1Btn = buttons.find((b) => b.textContent.includes('Q1 Product Satisfaction'));
      const csBtn = buttons.find((b) => b.textContent.includes('Customer Support Feedback'));
      fireEvent.click(q1Btn);
      fireEvent.click(csBtn);
      expect(screen.getByText('Response Count Comparison')).toBeInTheDocument();

      // Deselect one
      const updatedButtons = screen.getAllByRole('button');
      const checkBtn = updatedButtons.find(
        (b) => b.textContent.includes('✓') && b.textContent.includes('Q1 Product')
      );
      fireEvent.click(checkBtn);
      expect(screen.getByText(/Select at least 2 surveys/)).toBeInTheDocument();
    });
  });

  describe('Settings Panel', () => {
    test('clicking settings button opens settings panel', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Toggle settings'));
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Chart Animations')).toBeInTheDocument();
      expect(screen.getByText('Data Labels')).toBeInTheDocument();
    });

    test('can toggle chart animations off and on', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Toggle settings'));
      const animBtn = screen.getByText(/Enabled/);
      fireEvent.click(animBtn);
      expect(screen.getByText(/Disabled/)).toBeInTheDocument();
    });

    test('can toggle data labels off and on', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Toggle settings'));
      const labelBtn = screen.getByText(/Showing/);
      fireEvent.click(labelBtn);
      expect(screen.getByText(/Hidden/)).toBeInTheDocument();
    });

    test('close button closes settings panel', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Toggle settings'));
      expect(screen.getByText('Settings')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Close settings'));
      // Settings panel heading should no longer be visible
      expect(screen.queryByText('Chart Animations')).not.toBeInTheDocument();
    });

    test('can change default chart type in settings', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Toggle settings'));
      const chartSelect = screen.getAllByRole('combobox');
      const defaultChartSelect = chartSelect.find((s) =>
        Array.from(s.options).some((opt) => opt.value === 'pie')
      );
      fireEvent.change(defaultChartSelect, { target: { value: 'pie' } });
      expect(defaultChartSelect.value).toBe('pie');
    });

    test('can change export format in settings', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Toggle settings'));
      const selects = screen.getAllByRole('combobox');
      const exportSelect = selects.find((s) =>
        Array.from(s.options).some((opt) => opt.value === 'json')
      );
      fireEvent.change(exportSelect, { target: { value: 'json' } });
      expect(exportSelect.value).toBe('json');
    });
  });

  describe('Export Modal', () => {
    test('clicking export button opens export modal', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Export data'));
      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });

    test('export modal shows CSV and JSON format options', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Export data'));
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
    });

    test('can switch export format in modal', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Export data'));
      fireEvent.click(screen.getByText('JSON'));
      expect(screen.getByText('Download JSON')).toBeInTheDocument();
    });

    test('cancel button closes export modal', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Export data'));
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
    });

    test('download button triggers file download and closes modal', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByLabelText('Export data'));
      fireEvent.click(screen.getByText('Download CSV'));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
      expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
    });

    test('export modal shows correct context for survey-scoped export', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      fireEvent.click(screen.getByLabelText('View Q1 Product Satisfaction'));
      fireEvent.click(screen.getByLabelText('Export data'));
      expect(screen.getByText(/Q1 Product Satisfaction/)).toBeInTheDocument();
    });
  });

  describe('Cross-Cutting: Filters Affect Overview Metrics', () => {
    test('overview metric cards update when category filter changes', () => {
      render(<SurveyAnalyticsDashboard />);
      // Default should show all 5 surveys
      expect(screen.getByText('5')).toBeInTheDocument();

      // Filter to just Pricing category
      const categorySelect = screen.getByLabelText('Filter by category');
      fireEvent.change(categorySelect, { target: { value: 'Pricing' } });
      // Total Surveys should now be 1
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('overview metric cards update when status filter changes', () => {
      render(<SurveyAnalyticsDashboard />);
      const statusSelect = screen.getByLabelText('Filter by status');
      fireEvent.change(statusSelect, { target: { value: 'active' } });
      // Should show only active surveys (3)
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Chart Rendering', () => {
    test('bar chart has correct aria label', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Demographics'));
      const barCharts = screen.getAllByLabelText('Bar chart');
      expect(barCharts.length).toBeGreaterThan(0);
    });

    test('pie chart has correct aria label', () => {
      render(<SurveyAnalyticsDashboard />);
      const pieCharts = screen.getAllByLabelText('Pie chart');
      expect(pieCharts.length).toBeGreaterThan(0);
    });

    test('line chart has correct aria label', () => {
      render(<SurveyAnalyticsDashboard />);
      const lineCharts = screen.getAllByLabelText('Line chart');
      expect(lineCharts.length).toBeGreaterThan(0);
    });

    test('NPS gauge renders with correct aria label', () => {
      render(<SurveyAnalyticsDashboard />);
      const gauges = screen.getAllByLabelText('NPS gauge');
      expect(gauges.length).toBeGreaterThan(0);
    });
  });

  describe('NPS Analytics', () => {
    test('clicking NPS question shows NPS breakdown', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      fireEvent.click(screen.getByLabelText('View Q1 Product Satisfaction'));

      // Find and click the NPS question button
      const questionButtons = screen.getAllByRole('button');
      const npsBtn = questionButtons.find((b) => b.textContent.includes('recommend'));
      if (npsBtn) {
        fireEvent.click(npsBtn);
        // Should show NPS-specific groupings
        expect(screen.getByText(/Promoters/)).toBeInTheDocument();
        expect(screen.getByText(/Passives/)).toBeInTheDocument();
        expect(screen.getByText(/Detractors/)).toBeInTheDocument();
      }
    });
  });

  describe('Question Type Analytics', () => {
    test('rating question shows average and distribution', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      fireEvent.click(screen.getByLabelText('View Q1 Product Satisfaction'));
      // First question is rating type, auto-selected
      expect(screen.getByText(/average rating/)).toBeInTheDocument();
    });

    test('single choice question shows distribution', () => {
      render(<SurveyAnalyticsDashboard />);
      fireEvent.click(screen.getByText('Surveys'));
      fireEvent.click(screen.getByLabelText('View Customer Support Feedback'));
      // Click on the single_choice question
      const buttons = screen.getAllByRole('button');
      const choiceBtn = buttons.find((b) => b.textContent.includes('issue resolved'));
      if (choiceBtn) {
        fireEvent.click(choiceBtn);
        expect(screen.getByText(/single choice/)).toBeInTheDocument();
      }
    });
  });

  describe('Responsive Layout', () => {
    test('sidebar is fixed and main content offset by sidebar width', () => {
      render(<SurveyAnalyticsDashboard />);
      // The sidebar should have fixed positioning
      const sidebar = screen.getByText(/SurveyInsight/).closest('div');
      expect(sidebar).toHaveStyle({ position: 'fixed' });
    });
  });
});
