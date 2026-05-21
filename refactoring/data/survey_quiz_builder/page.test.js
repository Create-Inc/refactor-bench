import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SurveyQuizBuilder from './src/app/page.jsx';

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

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock document.createElement('a').click for export
const mockClick = vi.fn();
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  const el = originalCreateElement(tag);
  if (tag === 'a') {
    el.click = mockClick;
  }
  return el;
});

describe('SurveyQuizBuilder Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    test('renders app title SurveyForge', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByText(/SurveyForge/)).toBeInTheDocument();
    });

    test('renders navigation tabs', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByText(/My Surveys/)).toBeInTheDocument();
      expect(screen.getByText(/Templates/)).toBeInTheDocument();
      expect(screen.getByText(/Analytics/)).toBeInTheDocument();
    });

    test('renders header action buttons', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByText('+ New Survey')).toBeInTheDocument();
      expect(screen.getByText(/Import/)).toBeInTheDocument();
    });

    test('renders theme toggle button', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByPlaceholderText('Search surveys... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter dropdowns', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    });

    test('renders sample survey cards', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Fundamentals Quiz')).toBeInTheDocument();
      expect(screen.getByText('Employee Onboarding Feedback')).toBeInTheDocument();
    });

    test('renders survey status badges', () => {
      render(<SurveyQuizBuilder />);
      const publishedBadges = screen.getAllByText(/Published/);
      expect(publishedBadges.length).toBeGreaterThan(0);
      const draftBadges = screen.getAllByText(/Draft/);
      expect(draftBadges.length).toBeGreaterThan(0);
    });

    test('renders survey type badges', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getAllByText(/Quiz/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Survey/).length).toBeGreaterThan(0);
    });

    test('renders question counts for each survey', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByText(/6 questions/)).toBeInTheDocument();
      expect(screen.getByText(/5 questions/)).toBeInTheDocument();
      expect(screen.getByText(/4 questions/)).toBeInTheDocument();
    });

    test('renders response counts for each survey', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByText(/4 responses/)).toBeInTheDocument();
      expect(screen.getByText(/2 responses/)).toBeInTheDocument();
      expect(screen.getByText(/0 responses/)).toBeInTheDocument();
    });

    test('renders action buttons on survey cards', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      expect(editButtons.length).toBeGreaterThan(0);
      const previewButtons = screen.getAllByText(/Preview/);
      expect(previewButtons.length).toBeGreaterThan(0);
      const resultsButtons = screen.getAllByText(/Results/);
      expect(resultsButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Toggle', () => {
    test('toggles to dark mode and saves to localStorage', () => {
      render(<SurveyQuizBuilder />);
      const themeBtn = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeBtn);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('surveyBuilderTheme', 'dark');
    });

    test('toggles back to light mode', () => {
      render(<SurveyQuizBuilder />);
      const themeBtn = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeBtn);
      fireEvent.click(themeBtn);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('surveyBuilderTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'surveyBuilderTheme') return 'dark';
        return null;
      });
      render(<SurveyQuizBuilder />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    test('search filters surveys by title', () => {
      render(<SurveyQuizBuilder />);
      const searchInput = screen.getByPlaceholderText('Search surveys... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Customer' } });
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.queryByText('JavaScript Fundamentals Quiz')).not.toBeInTheDocument();
    });

    test('search filters surveys by description', () => {
      render(<SurveyQuizBuilder />);
      const searchInput = screen.getByPlaceholderText('Search surveys... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'JavaScript' } });
      expect(screen.getByText('JavaScript Fundamentals Quiz')).toBeInTheDocument();
      expect(screen.queryByText('Customer Satisfaction Survey')).not.toBeInTheDocument();
    });

    test('clearing search shows all surveys', () => {
      render(<SurveyQuizBuilder />);
      const searchInput = screen.getByPlaceholderText('Search surveys... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Customer' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Fundamentals Quiz')).toBeInTheDocument();
    });

    test('filter by published status', () => {
      render(<SurveyQuizBuilder />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'published' } });
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Fundamentals Quiz')).toBeInTheDocument();
      expect(screen.queryByText('Employee Onboarding Feedback')).not.toBeInTheDocument();
    });

    test('filter by draft status', () => {
      render(<SurveyQuizBuilder />);
      const statusFilter = screen.getByLabelText('Filter by status');
      fireEvent.change(statusFilter, { target: { value: 'draft' } });
      expect(screen.getByText('Employee Onboarding Feedback')).toBeInTheDocument();
      expect(screen.queryByText('Customer Satisfaction Survey')).not.toBeInTheDocument();
    });

    test('filter by quiz type', () => {
      render(<SurveyQuizBuilder />);
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'quiz' } });
      expect(screen.getByText('JavaScript Fundamentals Quiz')).toBeInTheDocument();
      expect(screen.queryByText('Customer Satisfaction Survey')).not.toBeInTheDocument();
    });

    test('filter by survey type', () => {
      render(<SurveyQuizBuilder />);
      const typeFilter = screen.getByLabelText('Filter by type');
      fireEvent.change(typeFilter, { target: { value: 'survey' } });
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.queryByText('JavaScript Fundamentals Quiz')).not.toBeInTheDocument();
    });

    test('no results message when filters match nothing', () => {
      render(<SurveyQuizBuilder />);
      const searchInput = screen.getByPlaceholderText('Search surveys... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'nonexistent survey xyz' } });
      expect(screen.getByText('No surveys found')).toBeInTheDocument();
    });
  });

  describe('Create Survey Modal', () => {
    test('clicking New Survey opens create modal', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText('+ New Survey'));
      expect(screen.getByText('Create New Survey')).toBeInTheDocument();
    });

    test('create modal has title, description, and quiz mode fields', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText('+ New Survey'));
      expect(screen.getByText('Title *')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText(/Enable Quiz Mode/)).toBeInTheDocument();
    });

    test('cancel button closes create modal', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText('+ New Survey'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Survey')).not.toBeInTheDocument();
    });

    test('close button (×) closes create modal', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText('+ New Survey'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Create New Survey')).not.toBeInTheDocument();
    });

    test('submitting form creates new survey and enters editor', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText('+ New Survey'));

      const form = screen.getByText('Create New Survey').closest('div').querySelector('form');
      const titleField = form.querySelector('input[name="title"]');
      fireEvent.change(titleField, { target: { value: 'My Test Survey' } });

      fireEvent.click(screen.getByText('Create Survey'));

      // Should now be in the editor view
      expect(screen.getByText(/Editing: My Test Survey/)).toBeInTheDocument();
    });
  });

  describe('Survey Editor', () => {
    test('clicking Edit on a survey opens the editor', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText(/Editing:/)).toBeInTheDocument();
    });

    test('editor shows Back button', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    test('Back button returns to survey list', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      fireEvent.click(screen.getByText('← Back'));
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
    });

    test('editor shows Survey Settings section', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Survey Settings')).toBeInTheDocument();
    });

    test('editor shows title and description inputs', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByDisplayValue('Customer Satisfaction Survey')).toBeInTheDocument();
    });

    test('editor shows checkbox settings', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Quiz Mode')).toBeInTheDocument();
      expect(screen.getByText('Show Progress Bar')).toBeInTheDocument();
      expect(screen.getByText('Allow Anonymous')).toBeInTheDocument();
      expect(screen.getByText('Shuffle Questions')).toBeInTheDocument();
      expect(screen.getByText('Require All')).toBeInTheDocument();
    });

    test('updating title updates the survey', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      const titleInput = screen.getByDisplayValue('Customer Satisfaction Survey');
      fireEvent.change(titleInput, { target: { value: 'Updated Survey Title' } });
      expect(screen.getByText(/Editing: Updated Survey Title/)).toBeInTheDocument();
    });

    test('editor shows question count', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Questions (6)')).toBeInTheDocument();
    });

    test('editor shows question list with types', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Q1')).toBeInTheDocument();
      expect(screen.getByText('Q2')).toBeInTheDocument();
      expect(screen.getByText('Q3')).toBeInTheDocument();
    });

    test('editor shows Add Question section', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Add Question')).toBeInTheDocument();
    });

    test('editor shows all question type buttons', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText(/Short Text/)).toBeInTheDocument();
      expect(screen.getByText(/Long Text/)).toBeInTheDocument();
      expect(screen.getByText(/Multiple Choice/)).toBeInTheDocument();
      expect(screen.getByText(/Checkboxes/)).toBeInTheDocument();
      expect(screen.getByText(/Rating Scale/)).toBeInTheDocument();
      expect(screen.getByText(/Dropdown/)).toBeInTheDocument();
      expect(screen.getByText(/Number/)).toBeInTheDocument();
      expect(screen.getByText(/Yes \/ No/)).toBeInTheDocument();
    });

    test('published survey shows Unpublish button', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]); // Customer Satisfaction Survey is published
      expect(screen.getByText('Unpublish')).toBeInTheDocument();
    });

    test('draft survey shows Publish button', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      // Employee Onboarding Feedback is draft - it's the 3rd card
      fireEvent.click(editButtons[2]);
      expect(screen.getByText('Publish')).toBeInTheDocument();
    });

    test('clicking Publish changes status and shows notification', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[2]); // draft survey
      fireEvent.click(screen.getByText('Publish'));
      expect(screen.getByText('Unpublish')).toBeInTheDocument();
      expect(screen.getByText('Survey published successfully!')).toBeInTheDocument();
    });

    test('clicking Unpublish changes status', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]); // published survey
      fireEvent.click(screen.getByText('Unpublish'));
      expect(screen.getByText('Publish')).toBeInTheDocument();
    });
  });

  describe('Question Management', () => {
    test('adding a new question of each type', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      // Add a Short Text question
      const addButtons = screen.getAllByText(/Short Text/);
      const addButton = addButtons[addButtons.length - 1]; // the one in Add Question section
      fireEvent.click(addButton);

      expect(screen.getByText('Questions (7)')).toBeInTheDocument();
    });

    test('clicking Edit on a question expands it for editing', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]); // Enter editor for first survey

      // Find Edit buttons within question cards
      const questionEditButtons = screen.getAllByText('Edit');
      fireEvent.click(questionEditButtons[0]);

      expect(screen.getByText('Question Text')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your question...')).toBeInTheDocument();
    });

    test('clicking Collapse hides question editing form', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      const questionEditButtons = screen.getAllByText('Edit');
      fireEvent.click(questionEditButtons[0]);
      expect(screen.getByText('Collapse')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Collapse'));
      expect(screen.queryByText('Collapse')).not.toBeInTheDocument();
    });

    test('deleting a question removes it', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Questions (6)')).toBeInTheDocument();
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Questions (5)')).toBeInTheDocument();
    });

    test('editing question text updates the display', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      const questionEditButtons = screen.getAllByText('Edit');
      fireEvent.click(questionEditButtons[0]);

      const questionInput = screen.getByPlaceholderText('Enter your question...');
      fireEvent.change(questionInput, { target: { value: 'Updated question text here' } });
      expect(screen.getByDisplayValue('Updated question text here')).toBeInTheDocument();
    });

    test('toggling required checkbox works', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      const questionEditButtons = screen.getAllByText('Edit');
      fireEvent.click(questionEditButtons[0]);

      const requiredCheckbox = screen.getByLabelText('Required');
      // First question has required: true
      expect(requiredCheckbox.checked).toBe(true);
      fireEvent.click(requiredCheckbox);
      expect(requiredCheckbox.checked).toBe(false);
    });
  });

  describe('Options Management', () => {
    test('multiple choice question shows options with inputs', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      // Find and expand the multiple choice question (Q2)
      const questionEditButtons = screen.getAllByText('Edit');
      fireEvent.click(questionEditButtons[1]); // Q2 is multiple choice

      expect(screen.getByText('Options')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Search Engine')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Social Media')).toBeInTheDocument();
    });

    test('adding an option to a multiple choice question', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      const questionEditButtons = screen.getAllByText('Edit');
      fireEvent.click(questionEditButtons[1]); // Q2

      fireEvent.click(screen.getByText('+ Add Option'));
      expect(screen.getByDisplayValue('Option 6')).toBeInTheDocument();
    });

    test('updating an option value', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      const questionEditButtons = screen.getAllByText('Edit');
      fireEvent.click(questionEditButtons[1]);

      const optionInput = screen.getByDisplayValue('Search Engine');
      fireEvent.change(optionInput, { target: { value: 'Google Search' } });
      expect(screen.getByDisplayValue('Google Search')).toBeInTheDocument();
    });

    test('removing an option', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);

      const questionEditButtons = screen.getAllByText('Edit');
      fireEvent.click(questionEditButtons[1]);

      expect(screen.getByDisplayValue('Search Engine')).toBeInTheDocument();
      // The × buttons are for removing options
      const removeButtons = screen.getAllByText('×');
      fireEvent.click(removeButtons[0]); // Remove first option
      expect(screen.queryByDisplayValue('Search Engine')).not.toBeInTheDocument();
    });
  });

  describe('Survey Preview', () => {
    test('clicking Preview opens preview mode', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      expect(screen.getByText(/Preview: Customer Satisfaction Survey/)).toBeInTheDocument();
    });

    test('preview shows survey title and description', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.getByText('Help us improve our product by sharing your experience.')).toBeInTheDocument();
    });

    test('preview shows progress bar for surveys with it enabled', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    test('preview shows questions with labels', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      expect(screen.getByText('How satisfied are you with our product overall?')).toBeInTheDocument();
      expect(screen.getByText('How did you hear about us?')).toBeInTheDocument();
    });

    test('preview shows required indicator on required questions', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      const requiredStars = screen.getAllByText('*');
      expect(requiredStars.length).toBeGreaterThan(0);
    });

    test('rating question shows clickable buttons', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      // Rating 1-5 buttons
      const rateBtn = screen.getByLabelText('Rate 3');
      expect(rateBtn).toBeInTheDocument();
    });

    test('clicking a rating button selects it', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      const rateBtn = screen.getByLabelText('Rate 4');
      fireEvent.click(rateBtn);
      // Progress should update
      expect(screen.getByText('1/6')).toBeInTheDocument();
    });

    test('multiple choice question shows radio options', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      expect(screen.getByText('Search Engine')).toBeInTheDocument();
      expect(screen.getByText('Social Media')).toBeInTheDocument();
      expect(screen.getByText('Friend/Colleague')).toBeInTheDocument();
    });

    test('selecting a multiple choice option', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      const option = screen.getByText('Search Engine');
      fireEvent.click(option);
    });

    test('checkbox question allows multiple selections', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      const performanceLabel = screen.getByText('Performance');
      const uiLabel = screen.getByText('User Interface');
      fireEvent.click(performanceLabel);
      fireEvent.click(uiLabel);
    });

    test('text input question accepts text', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      const textInputs = screen.getAllByPlaceholderText('Your answer...');
      fireEvent.change(textInputs[0], { target: { value: 'My answer here' } });
      expect(screen.getByDisplayValue('My answer here')).toBeInTheDocument();
    });

    test('Submit Response button exists', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      expect(screen.getByText('Submit Response')).toBeInTheDocument();
    });

    test('submitting response shows success message', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      fireEvent.click(screen.getByText('Submit Response'));
      expect(screen.getByText('Response Submitted!')).toBeInTheDocument();
    });

    test('submitting response shows Take Again button', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      fireEvent.click(screen.getByText('Submit Response'));
      expect(screen.getByText('Take Again')).toBeInTheDocument();
    });

    test('clicking Take Again resets the preview', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      fireEvent.click(screen.getByText('Submit Response'));
      fireEvent.click(screen.getByText('Take Again'));
      expect(screen.getByText('Submit Response')).toBeInTheDocument();
    });

    test('Back button from preview returns to list', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      fireEvent.click(screen.getByText('← Back'));
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.queryByText(/Preview:/)).not.toBeInTheDocument();
    });
  });

  describe('Quiz Mode Preview', () => {
    test('quiz preview shows score after submission', () => {
      render(<SurveyQuizBuilder />);
      // Find the quiz card and click its preview
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[1]); // JS Quiz is the 2nd card
      expect(screen.getByText(/Preview: JavaScript Fundamentals Quiz/)).toBeInTheDocument();

      // Submit without answering (should get 0%)
      fireEvent.click(screen.getByText('Submit Response'));
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText(/0\/60 points/)).toBeInTheDocument();
    });

    test('quiz shows correct score with correct answers', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[1]); // JS Quiz

      // Answer Q1: Both let and const (correct, 10 pts)
      fireEvent.click(screen.getByText('Both let and const'));

      // Answer Q2 (yes_no): No (correct, 5 pts)
      fireEvent.click(screen.getByText('👎 No'));

      fireEvent.click(screen.getByText('Submit Response'));
      // Should have 15/60 = 25%
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  describe('Response Analytics', () => {
    test('clicking Results opens analytics view', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]); // Customer Satisfaction Survey
      expect(screen.getByText(/Results: Customer Satisfaction Survey/)).toBeInTheDocument();
    });

    test('analytics shows total response count', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      expect(screen.getByText('Total Responses')).toBeInTheDocument();
    });

    test('analytics shows question count', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      expect(screen.getByText('Questions')).toBeInTheDocument();
    });

    test('analytics shows per-question breakdown', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      expect(screen.getByText(/Q1\./)).toBeInTheDocument();
      expect(screen.getByText('How satisfied are you with our product overall?')).toBeInTheDocument();
    });

    test('rating question shows average rating', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      expect(screen.getByText(/avg/)).toBeInTheDocument();
    });

    test('multiple choice question shows choice distribution', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      expect(screen.getByText('Search Engine')).toBeInTheDocument();
      expect(screen.getByText('Social Media')).toBeInTheDocument();
    });

    test('text question shows individual responses', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      expect(screen.getByText(/Dashboard and analytics/)).toBeInTheDocument();
    });

    test('analytics shows Individual Responses table', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      expect(screen.getByText('Individual Responses')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });

    test('no responses message for empty survey', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[2]); // Employee Onboarding (no responses)
      expect(screen.getByText('No responses yet')).toBeInTheDocument();
    });

    test('Back button from analytics returns to list', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      fireEvent.click(screen.getByText('← Back'));
      expect(screen.queryByText(/Results:/)).not.toBeInTheDocument();
    });
  });

  describe('Delete Survey', () => {
    test('clicking Delete shows confirmation modal', () => {
      render(<SurveyQuizBuilder />);
      const deleteButtons = screen.getAllByText(/Delete/);
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Delete Survey?')).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });

    test('cancel delete closes modal', () => {
      render(<SurveyQuizBuilder />);
      const deleteButtons = screen.getAllByText(/Delete/);
      fireEvent.click(deleteButtons[0]);
      // Click Cancel in the confirm modal
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText('Delete Survey?')).not.toBeInTheDocument();
    });

    test('confirming delete removes the survey', () => {
      render(<SurveyQuizBuilder />);
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      const deleteButtons = screen.getAllByText(/Delete/);
      fireEvent.click(deleteButtons[0]);

      // Click the red Delete button in the modal
      const confirmDeleteBtn = screen.getAllByText('Delete');
      fireEvent.click(confirmDeleteBtn[confirmDeleteBtn.length - 1]);

      expect(screen.queryByText('Customer Satisfaction Survey')).not.toBeInTheDocument();
    });
  });

  describe('Duplicate Survey', () => {
    test('clicking Duplicate creates a copy', () => {
      render(<SurveyQuizBuilder />);
      const dupButtons = screen.getAllByText(/Duplicate/);
      fireEvent.click(dupButtons[0]);
      expect(screen.getByText('Customer Satisfaction Survey (Copy)')).toBeInTheDocument();
    });

    test('duplicate has draft status', () => {
      render(<SurveyQuizBuilder />);
      const dupButtons = screen.getAllByText(/Duplicate/);
      fireEvent.click(dupButtons[0]);
      // Original is published, copy should be draft
      const draftBadges = screen.getAllByText(/Draft/);
      expect(draftBadges.length).toBeGreaterThanOrEqual(2); // At least employee onboarding + the copy
    });
  });

  describe('Export Survey', () => {
    test('clicking Export triggers JSON download', () => {
      render(<SurveyQuizBuilder />);
      const exportButtons = screen.getAllByText(/Export/);
      // Export buttons: one in header (Import), and then Export on each card
      fireEvent.click(exportButtons[1]); // First card's Export button
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Import Survey', () => {
    test('clicking Import opens import modal', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Import/));
      expect(screen.getByText('Import Survey')).toBeInTheDocument();
    });

    test('import modal has textarea and buttons', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Import/));
      expect(screen.getByPlaceholderText(/title.*My Survey/)).toBeInTheDocument();
    });

    test('cancel closes import modal', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Import/));
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText('Import Survey')).not.toBeInTheDocument();
    });

    test('importing valid JSON creates a new survey', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Import/));

      const textarea = screen.getByPlaceholderText(/title.*My Survey/);
      fireEvent.change(textarea, { target: { value: JSON.stringify({ title: 'Imported Survey', description: 'Imported desc', isQuizMode: false, questions: [], responses: [] }) } });

      const importBtn = screen.getAllByText('Import');
      fireEvent.click(importBtn[importBtn.length - 1]);

      expect(screen.getByText('Imported Survey')).toBeInTheDocument();
    });

    test('importing invalid JSON shows error notification', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Import/));

      const textarea = screen.getByPlaceholderText(/title.*My Survey/);
      fireEvent.change(textarea, { target: { value: 'not valid json{{{' } });

      const importBtn = screen.getAllByText('Import');
      fireEvent.click(importBtn[importBtn.length - 1]);

      expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
    });
  });

  describe('Templates View', () => {
    test('clicking Templates tab shows templates', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Templates/));
      expect(screen.getByText('Survey Templates')).toBeInTheDocument();
    });

    test('shows template cards with descriptions', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Templates/));
      expect(screen.getByText('Customer Feedback')).toBeInTheDocument();
      expect(screen.getByText('Employee Engagement')).toBeInTheDocument();
      expect(screen.getByText('Event Evaluation')).toBeInTheDocument();
      expect(screen.getByText('Course Assessment')).toBeInTheDocument();
      expect(screen.getByText('Market Research')).toBeInTheDocument();
      expect(screen.getByText('Website Usability')).toBeInTheDocument();
    });

    test('template cards show Use Template button', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Templates/));
      const useButtons = screen.getAllByText('Use Template');
      expect(useButtons.length).toBe(6);
    });
  });

  describe('Analytics Overview', () => {
    test('clicking Analytics tab shows overview', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Analytics/));
      expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
    });

    test('shows total surveys count', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Analytics/));
      expect(screen.getByText('Total Surveys')).toBeInTheDocument();
    });

    test('shows published count', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Analytics/));
      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    test('shows total responses count', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Analytics/));
      expect(screen.getByText('Total Responses')).toBeInTheDocument();
    });

    test('shows total questions count', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Analytics/));
      expect(screen.getByText('Total Questions')).toBeInTheDocument();
    });

    test('shows survey performance table', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Analytics/));
      expect(screen.getByText('Survey Performance')).toBeInTheDocument();
      expect(screen.getByText('Customer Satisfaction Survey')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Fundamentals Quiz')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes create modal', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText('+ New Survey'));
      expect(screen.getByText('Create New Survey')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Survey')).not.toBeInTheDocument();
    });

    test('Escape closes import modal', () => {
      render(<SurveyQuizBuilder />);
      fireEvent.click(screen.getByText(/Import/));
      expect(screen.getByText('Import Survey')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Import Survey')).not.toBeInTheDocument();
    });

    test('Escape closes delete confirm modal', () => {
      render(<SurveyQuizBuilder />);
      const deleteButtons = screen.getAllByText(/Delete/);
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Delete Survey?')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Delete Survey?')).not.toBeInTheDocument();
    });

    test('Escape closes preview mode', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[0]);
      expect(screen.getByText(/Preview:/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Preview:/)).not.toBeInTheDocument();
    });

    test('Escape closes editor mode', () => {
      render(<SurveyQuizBuilder />);
      const editButtons = screen.getAllByText(/Edit/);
      fireEvent.click(editButtons[0]);
      expect(screen.getByText(/Editing:/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Editing:/)).not.toBeInTheDocument();
    });

    test('Escape closes response view', () => {
      render(<SurveyQuizBuilder />);
      const resultsButtons = screen.getAllByText(/Results/);
      fireEvent.click(resultsButtons[0]);
      expect(screen.getByText(/Results:/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Results:/)).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('surveys are saved to localStorage on change', () => {
      render(<SurveyQuizBuilder />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'surveyBuilderData',
        expect.any(String)
      );
    });

    test('surveys are loaded from localStorage on mount', () => {
      const customSurveys = JSON.stringify([{
        id: 'custom_1',
        title: 'Custom Saved Survey',
        description: 'Loaded from storage',
        isQuizMode: false,
        showProgressBar: true,
        allowAnonymous: true,
        shuffleQuestions: false,
        requireAllQuestions: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'draft',
        questions: [],
        responses: [],
      }]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'surveyBuilderData') return customSurveys;
        return null;
      });
      render(<SurveyQuizBuilder />);
      expect(screen.getByText('Custom Saved Survey')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'surveyBuilderData') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<SurveyQuizBuilder />)).not.toThrow();
    });
  });

  describe('Conditional Logic', () => {
    test('questions with conditional logic are hidden when condition not met', () => {
      render(<SurveyQuizBuilder />);
      // Employee Onboarding has Q4 with conditional logic: show if Q1 rating < 4
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[2]); // Employee Onboarding

      // Q4 should be hidden since Q1 has no answer yet (condition: q1 < 4)
      expect(screen.queryByText('What could be improved in the onboarding process?')).not.toBeInTheDocument();
    });

    test('questions with conditional logic appear when condition is met', () => {
      render(<SurveyQuizBuilder />);
      const previewButtons = screen.getAllByText(/Preview/);
      fireEvent.click(previewButtons[2]); // Employee Onboarding

      // Answer Q1 with rating 2 (< 4, so Q4 should appear)
      const rateBtn = screen.getByLabelText('Rate 2');
      fireEvent.click(rateBtn);

      expect(screen.getByText('What could be improved in the onboarding process?')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<SurveyQuizBuilder />)).not.toThrow();
    });
  });
});
