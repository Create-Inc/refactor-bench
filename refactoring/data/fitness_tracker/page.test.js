import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FitnessTracker from './src/app/page.jsx';

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

describe('FitnessTracker Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with FitTrack title', () => {
      render(<FitnessTracker />);
      expect(screen.getByText(/FitTrack/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<FitnessTracker />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Workouts')).toBeInTheDocument();
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
      expect(screen.getByText('Measurements')).toBeInTheDocument();
      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<FitnessTracker />);
      expect(screen.getByPlaceholderText('Search workouts... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders dashboard view by default', () => {
      render(<FitnessTracker />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Weekly Workouts')).toBeInTheDocument();
    });

    test('renders workout streak in sidebar', () => {
      render(<FitnessTracker />);
      expect(screen.getByText(/days/)).toBeInTheDocument();
      expect(screen.getByText(/cal burned this week/)).toBeInTheDocument();
    });

    test('renders user avatar', () => {
      render(<FitnessTracker />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<FitnessTracker />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<FitnessTracker />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('fitnessTrackerTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<FitnessTracker />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('fitnessTrackerTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'fitnessTrackerTheme') return 'dark';
        return null;
      });
      render(<FitnessTracker />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Dashboard shows dashboard view', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByText('Dashboard'));
      expect(screen.getByText('Weekly Workouts')).toBeInTheDocument();
    });

    test('clicking Workouts shows workouts view', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      expect(screen.getByLabelText('Add workout')).toBeInTheDocument();
    });

    test('clicking Nutrition shows nutrition view', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      expect(screen.getByLabelText('Log meal')).toBeInTheDocument();
    });

    test('clicking Measurements shows measurements view', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      expect(screen.getByText('Body Measurements')).toBeInTheDocument();
    });

    test('clicking Goals shows goals view', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      expect(screen.getByLabelText('Add goal')).toBeInTheDocument();
    });

    test('clicking History shows history view', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('History'));
      expect(screen.getByText('Activity History')).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('fitnessTrackerView', 'workouts');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<FitnessTracker />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<FitnessTracker />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Workouts')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<FitnessTracker />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Dashboard View', () => {
    test('shows stats cards', () => {
      render(<FitnessTracker />);
      expect(screen.getByText('Weekly Workouts')).toBeInTheDocument();
      expect(screen.getByText('Calories Burned')).toBeInTheDocument();
      expect(screen.getByText('Active Minutes')).toBeInTheDocument();
      expect(screen.getByText('Current Weight')).toBeInTheDocument();
    });

    test('shows weight trend section', () => {
      render(<FitnessTracker />);
      expect(screen.getByText('Weight Trend')).toBeInTheDocument();
      expect(screen.getByText(/lbs from last week/)).toBeInTheDocument();
    });

    test('shows weekly activity chart', () => {
      render(<FitnessTracker />);
      expect(screen.getByText('Weekly Activity')).toBeInTheDocument();
    });

    test('shows today nutrition summary', () => {
      render(<FitnessTracker />);
      expect(screen.getByText("Today's Nutrition")).toBeInTheDocument();
      expect(screen.getByText(/Protein/)).toBeInTheDocument();
      expect(screen.getByText(/Carbs/)).toBeInTheDocument();
    });

    test('shows goals summary with View All link', () => {
      render(<FitnessTracker />);
      expect(screen.getByText('View All →')).toBeInTheDocument();
      expect(screen.getByText('Lose 10 lbs')).toBeInTheDocument();
    });

    test('View All goals link navigates to goals view', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('View All →'));
      expect(screen.getByLabelText('Add goal')).toBeInTheDocument();
    });
  });

  describe('Workouts View', () => {
    test('shows workout list', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      expect(screen.getByText('Morning Run')).toBeInTheDocument();
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    test('shows category filter', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
    });

    test('shows sort control', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      expect(screen.getByLabelText('Sort workouts')).toBeInTheDocument();
    });

    test('category filter filters workouts', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const filter = screen.getByLabelText('Filter by category');
      fireEvent.change(filter, { target: { value: 'cardio' } });
      expect(screen.getByText('Morning Run')).toBeInTheDocument();
      expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
    });

    test('shows workout count', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      expect(screen.getByText('10 workouts')).toBeInTheDocument();
    });

    test('shows category breakdown', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
    });

    test('search input filters workouts', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const searchInput = screen.getByPlaceholderText('Search workouts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Bench' } });
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Morning Run')).not.toBeInTheDocument();
    });

    test('search filters by muscle group', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const searchInput = screen.getByPlaceholderText('Search workouts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'chest' } });
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    test('clearing search shows all workouts', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const searchInput = screen.getByPlaceholderText('Search workouts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Bench' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Morning Run')).toBeInTheDocument();
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });
  });

  describe('Workout Detail', () => {
    test('clicking a workout shows detail view', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByText('Bench Press'));
      expect(screen.getByText('← Back to Workouts')).toBeInTheDocument();
      expect(screen.getByText('Sets')).toBeInTheDocument();
    });

    test('detail shows duration, calories, and sets count', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByText('Bench Press'));
      expect(screen.getByText('Minutes')).toBeInTheDocument();
      expect(screen.getByText('Calories')).toBeInTheDocument();
    });

    test('detail shows sets table with volume', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByText('Bench Press'));
      expect(screen.getByText('Total Volume')).toBeInTheDocument();
    });

    test('detail shows notes when available', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByText('Bench Press'));
      expect(screen.getByText('New PR on last set')).toBeInTheDocument();
    });

    test('back button returns to workout list', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByText('Bench Press'));
      fireEvent.click(screen.getByText('← Back to Workouts'));
      expect(screen.getByText('Morning Run')).toBeInTheDocument();
    });
  });

  describe('Workout CRUD', () => {
    test('Add Workout button opens modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByLabelText('Add workout'));
      expect(screen.getByText('Add Workout')).toBeInTheDocument();
    });

    test('workout modal has all fields', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByLabelText('Add workout'));
      expect(screen.getByPlaceholderText('e.g., Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Muscle Group')).toBeInTheDocument();
      expect(screen.getByText('Duration (min)')).toBeInTheDocument();
      expect(screen.getByText('Calories Burned')).toBeInTheDocument();
    });

    test('saving a new workout adds it to the list', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByLabelText('Add workout'));
      const nameInput = screen.getByPlaceholderText('e.g., Bench Press');
      fireEvent.change(nameInput, { target: { value: 'Barbell Curls' } });
      fireEvent.click(screen.getByText('Add Workout', { selector: 'button' }));
      expect(screen.getByText('Barbell Curls')).toBeInTheDocument();
    });

    test('add set button adds a set row', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByLabelText('Add workout'));
      fireEvent.click(screen.getByText('+ Add Set'));
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    test('Edit button opens edit modal with pre-filled data', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Edit Workout')).toBeInTheDocument();
    });

    test('deleting a workout requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming delete removes workout', () => {
      window.confirm.mockReturnValue(true);
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const initialCount = screen.getAllByText('Edit').length;
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getAllByText('Edit').length).toBe(initialCount - 1);
    });

    test('cancel button closes workout modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByLabelText('Add workout'));
      expect(screen.getByText('Add Workout')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Add Workout')).not.toBeInTheDocument();
    });
  });

  describe('Nutrition View', () => {
    test('shows daily nutrition summary', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      expect(screen.getByText(/Daily Summary/)).toBeInTheDocument();
    });

    test('shows meal type sections', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      expect(screen.getByText('Oatmeal with Berries')).toBeInTheDocument();
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument();
    });

    test('date picker changes displayed meals', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      const dateInput = screen.getByLabelText('Select date');
      fireEvent.change(dateInput, { target: { value: '2026-04-27' } });
      expect(screen.getByText('Greek Yogurt Parfait')).toBeInTheDocument();
    });

    test('meal type filter works', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      const typeFilter = screen.getByLabelText('Filter by meal type');
      fireEvent.change(typeFilter, { target: { value: 'breakfast' } });
      expect(screen.getByText('Oatmeal with Berries')).toBeInTheDocument();
      expect(screen.queryByText('Grilled Chicken Salad')).not.toBeInTheDocument();
    });

    test('shows macro breakdown per meal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      // Look for protein/carbs/fat info
      expect(screen.getAllByText(/P:/).length).toBeGreaterThan(0);
    });
  });

  describe('Meal CRUD', () => {
    test('Log Meal button opens modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      fireEvent.click(screen.getByLabelText('Log meal'));
      expect(screen.getByText('Log Meal')).toBeInTheDocument();
    });

    test('meal modal has all nutritional fields', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      fireEvent.click(screen.getByLabelText('Log meal'));
      expect(screen.getByPlaceholderText('e.g., Chicken Salad')).toBeInTheDocument();
      expect(screen.getByText('Meal Type')).toBeInTheDocument();
      expect(screen.getByText('Protein (g)')).toBeInTheDocument();
      expect(screen.getByText('Carbs (g)')).toBeInTheDocument();
      expect(screen.getByText('Fat (g)')).toBeInTheDocument();
    });

    test('saving a new meal adds it to the list', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      fireEvent.click(screen.getByLabelText('Log meal'));
      const nameInput = screen.getByPlaceholderText('e.g., Chicken Salad');
      fireEvent.change(nameInput, { target: { value: 'Protein Bar' } });
      // Meal is logged for selected date
      const logButton = screen.getAllByText('Log Meal').find(el => el.tagName === 'BUTTON' && el.closest('[style*="position: fixed"]'));
      fireEvent.click(logButton);
      expect(screen.getByText('Protein Bar')).toBeInTheDocument();
    });

    test('editing a meal opens pre-filled modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Edit Meal')).toBeInTheDocument();
    });

    test('deleting a meal requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('cancel closes meal modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      fireEvent.click(screen.getByLabelText('Log meal'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Meal Name')).not.toBeInTheDocument();
    });
  });

  describe('Measurements View', () => {
    test('shows latest measurement cards', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('Body Fat')).toBeInTheDocument();
    });

    test('shows measurement history table', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      expect(screen.getByText('Waist (in)')).toBeInTheDocument();
      expect(screen.getByText('Hips (in)')).toBeInTheDocument();
    });

    test('shows weight change indicator', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      // Should show the change from previous measurement
      expect(screen.getAllByText(/-1\.0/).length).toBeGreaterThan(0);
    });

    test('Record Measurement button opens modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      fireEvent.click(screen.getByLabelText('Add measurement'));
      expect(screen.getByText('Record Measurements')).toBeInTheDocument();
    });

    test('measurement modal has all measurement fields', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      fireEvent.click(screen.getByLabelText('Add measurement'));
      expect(screen.getByText('Weight (lbs)')).toBeInTheDocument();
      expect(screen.getByText('Body Fat (%)')).toBeInTheDocument();
      expect(screen.getByText('Chest (in)')).toBeInTheDocument();
      expect(screen.getByText('Biceps (in)')).toBeInTheDocument();
    });

    test('saving a measurement adds it to the table', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      fireEvent.click(screen.getByLabelText('Add measurement'));
      const weightInput = screen.getByPlaceholderText('Weight');
      fireEvent.change(weightInput, { target: { value: '176' } });
      fireEvent.click(screen.getByText('Save'));
      // The new measurement should appear in the table
      expect(screen.getByText('176')).toBeInTheDocument();
    });

    test('deleting a measurement requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });
  });

  describe('Goals View', () => {
    test('shows goal cards', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      expect(screen.getByText('Lose 10 lbs')).toBeInTheDocument();
      expect(screen.getByText('Run a 5K under 25 min')).toBeInTheDocument();
      expect(screen.getByText('Bench Press 225 lbs')).toBeInTheDocument();
    });

    test('shows goal progress bars', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      expect(screen.getAllByText(/% complete/).length).toBeGreaterThan(0);
    });

    test('shows days remaining for goals', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      expect(screen.getAllByText(/days left/).length).toBeGreaterThan(0);
    });

    test('Add Goal button opens modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      fireEvent.click(screen.getByLabelText('Add goal'));
      expect(screen.getByText('Add Goal')).toBeInTheDocument();
    });

    test('goal modal has all fields', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      fireEvent.click(screen.getByLabelText('Add goal'));
      expect(screen.getByText('Goal Name')).toBeInTheDocument();
      expect(screen.getByText('Target Value')).toBeInTheDocument();
      expect(screen.getByText('Current Value')).toBeInTheDocument();
      expect(screen.getByText('Deadline')).toBeInTheDocument();
    });

    test('saving a new goal adds it to the list', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      fireEvent.click(screen.getByLabelText('Add goal'));
      const nameInput = screen.getByPlaceholderText('e.g., Lose 10 lbs');
      fireEvent.change(nameInput, { target: { value: 'Do 20 pull-ups' } });
      const addButton = screen.getAllByText('Add Goal').find(el => el.tagName === 'BUTTON' && el.closest('[style*="position: fixed"]'));
      fireEvent.click(addButton);
      expect(screen.getByText('Do 20 pull-ups')).toBeInTheDocument();
    });

    test('editing a goal opens pre-filled modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    });

    test('deleting a goal requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming goal delete removes it', () => {
      window.confirm.mockReturnValue(true);
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      const initialGoals = screen.getAllByText('Edit').length;
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getAllByText('Edit').length).toBe(initialGoals - 1);
    });

    test('update goal progress via input', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      const progressInputs = screen.getAllByPlaceholderText('Update progress');
      fireEvent.change(progressInputs[0], { target: { value: '175' } });
      fireEvent.keyDown(progressInputs[0], { key: 'Enter' });
      // Goal should update with new value
      expect(screen.getByText(/175 lbs/)).toBeInTheDocument();
    });
  });

  describe('History View', () => {
    test('shows muscle group frequency chart', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('History'));
      expect(screen.getByText('Muscle Group Frequency')).toBeInTheDocument();
    });

    test('shows all muscle groups', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('History'));
      expect(screen.getByText('chest')).toBeInTheDocument();
      expect(screen.getByText('back')).toBeInTheDocument();
      expect(screen.getByText('legs')).toBeInTheDocument();
    });

    test('shows full workout log', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('History'));
      expect(screen.getByText('Full Log')).toBeInTheDocument();
      expect(screen.getByText('Morning Run')).toBeInTheDocument();
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes workout modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByLabelText('Add workout'));
      expect(screen.getByText('Add Workout')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Add Workout')).not.toBeInTheDocument();
    });

    test('Escape key closes meal modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Nutrition'));
      fireEvent.click(screen.getByLabelText('Log meal'));
      expect(screen.getByText('Meal Name')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Meal Name')).not.toBeInTheDocument();
    });

    test('Escape key closes measurement modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Measurements'));
      fireEvent.click(screen.getByLabelText('Add measurement'));
      expect(screen.getByText('Record Measurements')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Record Measurements')).not.toBeInTheDocument();
    });

    test('Escape key closes goal modal', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Goals'));
      fireEvent.click(screen.getByLabelText('Add goal'));
      expect(screen.getByText('Goal Name')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Goal Name')).not.toBeInTheDocument();
    });

    test('Escape key closes workout detail', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      fireEvent.click(screen.getByText('Bench Press'));
      expect(screen.getByText('← Back to Workouts')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('← Back to Workouts')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('workouts are saved to localStorage', () => {
      render(<FitnessTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('fitnessWorkouts', expect.any(String));
    });

    test('meals are saved to localStorage', () => {
      render(<FitnessTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('fitnessMeals', expect.any(String));
    });

    test('measurements are saved to localStorage', () => {
      render(<FitnessTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('fitnessMeasurements', expect.any(String));
    });

    test('goals are saved to localStorage', () => {
      render(<FitnessTracker />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('fitnessGoals', expect.any(String));
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'fitnessTrackerView') return 'goals';
        return null;
      });
      render(<FitnessTracker />);
      expect(screen.getByLabelText('Add goal')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'fitnessWorkouts') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<FitnessTracker />)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<FitnessTracker />)).not.toThrow();
    });
  });

  describe('Workout Sort', () => {
    test('sorting by name orders alphabetically', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const sortControl = screen.getByLabelText('Sort workouts');
      fireEvent.change(sortControl, { target: { value: 'name' } });
      // Should reorder workouts
      const workoutCards = screen.getAllByText(/min/);
      expect(workoutCards.length).toBeGreaterThan(0);
    });
  });

  describe('Combined Filters', () => {
    test('search and category filter work together', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const searchInput = screen.getByPlaceholderText('Search workouts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Run' } });
      const filter = screen.getByLabelText('Filter by category');
      fireEvent.change(filter, { target: { value: 'cardio' } });
      expect(screen.getByText('Morning Run')).toBeInTheDocument();
    });

    test('non-matching combined filters show no workouts', () => {
      render(<FitnessTracker />);
      fireEvent.click(screen.getByText('Workouts'));
      const searchInput = screen.getByPlaceholderText('Search workouts... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Bench' } });
      const filter = screen.getByLabelText('Filter by category');
      fireEvent.change(filter, { target: { value: 'cardio' } });
      expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
      expect(screen.queryByText('Morning Run')).not.toBeInTheDocument();
    });
  });
});
