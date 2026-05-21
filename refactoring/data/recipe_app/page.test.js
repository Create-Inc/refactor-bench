import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
// biome-ignore lint/correctness/noUndeclaredDependencies: eval test data — runs in vitest sandbox, not core package
import { render, screen, fireEvent } from '@testing-library/react';
import HomeScreen from './screens/HomeScreen.jsx';

// Mock Alert
vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
const mockAlert = vi.fn();
vi.mock('react-native', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Alert: {
      alert: (...args) => mockAlert(...args),
    },
  };
});

describe('Recipe App - HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Header & Initial Rendering ──

  describe('Initial Rendering', () => {
    test('renders home screen with header', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('home-screen')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    test('displays app title', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('app-title')).toBeInTheDocument();
      expect(screen.getByText('Recipe Box')).toBeInTheDocument();
    });

    test('shows recipe and favorite counts in subtitle', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/10 recipes/)).toBeInTheDocument();
      expect(screen.getByText(/3 favorites/)).toBeInTheDocument();
    });

    test('renders add recipe button', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('add-recipe-btn')).toBeInTheDocument();
      expect(screen.getByText('+ Add')).toBeInTheDocument();
    });

    test('renders search input on recipes tab', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  // ── Tab Bar ──

  describe('Tab Bar', () => {
    test('renders all 5 tabs', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
      expect(screen.getByTestId('tab-recipes')).toBeInTheDocument();
      expect(screen.getByTestId('tab-favorites')).toBeInTheDocument();
      expect(screen.getByTestId('tab-shopping')).toBeInTheDocument();
      expect(screen.getByTestId('tab-planner')).toBeInTheDocument();
      expect(screen.getByTestId('tab-timer')).toBeInTheDocument();
    });

    test('recipes tab is active by default', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('recipes-tab')).toBeInTheDocument();
    });

    test('switching to favorites tab shows favorites view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.getByTestId('favorites-tab')).toBeInTheDocument();
    });

    test('switching to shopping tab shows shopping list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      expect(screen.getByTestId('shopping-tab')).toBeInTheDocument();
    });

    test('switching to planner tab shows meal planner', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      expect(screen.getByTestId('planner-tab')).toBeInTheDocument();
    });

    test('switching to timer tab shows cooking timer', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-timer'));
      expect(screen.getByTestId('timer-tab')).toBeInTheDocument();
    });
  });

  // ── Category Filtering ──

  describe('Category Filtering', () => {
    test('renders category filter', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
      expect(screen.getByTestId('category-all')).toBeInTheDocument();
      expect(screen.getByTestId('category-breakfast')).toBeInTheDocument();
      expect(screen.getByTestId('category-lunch')).toBeInTheDocument();
      expect(screen.getByTestId('category-dinner')).toBeInTheDocument();
      expect(screen.getByTestId('category-dessert')).toBeInTheDocument();
    });

    test('filtering by breakfast shows only breakfast recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('category-breakfast'));
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('Avocado Toast')).toBeInTheDocument();
      expect(screen.getByText('Berry Smoothie Bowl')).toBeInTheDocument();
      expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
      expect(screen.queryByText('Spaghetti Carbonara')).not.toBeInTheDocument();
    });

    test('filtering by dinner shows only dinner recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('category-dinner'));
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
      expect(screen.getByText('Thai Green Curry')).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('filtering by dessert shows only dessert recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('category-dessert'));
      expect(screen.getByText('Chocolate Lava Cake')).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('selecting All shows all recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('category-breakfast'));
      fireEvent.click(screen.getByTestId('category-all'));
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    test('result count updates with filter', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('result-count').textContent).toContain('10');
      fireEvent.click(screen.getByTestId('category-breakfast'));
      expect(screen.getByTestId('result-count').textContent).toContain('3');
    });
  });

  // ── Search ──

  describe('Search', () => {
    test('searching by recipe title filters results', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'pancake' } });
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
    });

    test('searching by ingredient name filters results', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'guanciale' } });
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('searching by tag filters results', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'italian' } });
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('clearing search shows all recipes', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'pancake' } });
      fireEvent.change(search, { target: { value: '' } });
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    test('no results shows empty state', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'xyznonexistent' } });
      expect(screen.getByText('No recipes found')).toBeInTheDocument();
    });
  });

  // ── Sort Controls ──

  describe('Sort Controls', () => {
    test('renders sort controls', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('sort-controls')).toBeInTheDocument();
      expect(screen.getByTestId('sort-rating')).toBeInTheDocument();
      expect(screen.getByTestId('sort-prepTime')).toBeInTheDocument();
      expect(screen.getByTestId('sort-calories')).toBeInTheDocument();
      expect(screen.getByTestId('sort-title')).toBeInTheDocument();
    });

    test('clicking same sort toggles direction', () => {
      render(<HomeScreen />);
      // Default sort is rating desc
      const ratingBtn = screen.getByTestId('sort-rating');
      expect(ratingBtn.textContent).toContain('↓');
      fireEvent.click(ratingBtn);
      expect(ratingBtn.textContent).toContain('↑');
    });

    test('clicking different sort changes field', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('sort-title'));
      expect(screen.getByTestId('sort-title').textContent).toContain('↓');
    });
  });

  // ── Recipe Cards ──

  describe('Recipe Cards', () => {
    test('renders recipe cards in list', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-r1')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-r2')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-r3')).toBeInTheDocument();
    });

    test('recipe card shows title, description, and metadata', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText(/Fluffy buttermilk pancakes/)).toBeInTheDocument();
    });

    test('recipe card shows difficulty badge', () => {
      render(<HomeScreen />);
      const easyBadges = screen.getAllByText('easy');
      expect(easyBadges.length).toBeGreaterThan(0);
    });

    test('recipe card shows tags', () => {
      render(<HomeScreen />);
      expect(screen.getByText('#quick')).toBeInTheDocument();
      expect(screen.getByText('#classic')).toBeInTheDocument();
    });

    test('recipe card shows calorie count', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/350 cal/)).toBeInTheDocument();
    });
  });

  // ── Favorites ──

  describe('Favorites', () => {
    test('toggling favorite updates heart icon', () => {
      render(<HomeScreen />);
      // r1 (Classic Pancakes) starts as favorite
      const favBtn = screen.getByTestId('favorite-r1');
      expect(favBtn.textContent).toContain('❤️');
      fireEvent.click(favBtn);
      expect(favBtn.textContent).toContain('🤍');
    });

    test('unfavoriting reduces favorite count', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/3 favorites/)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('favorite-r1'));
      expect(screen.getByText(/2 favorites/)).toBeInTheDocument();
    });

    test('favorites tab shows only favorited recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
      expect(screen.getByText('Thai Green Curry')).toBeInTheDocument();
      expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
    });

    test('favorites tab shows empty state when no favorites', () => {
      render(<HomeScreen />);
      // Unfavorite all 3
      fireEvent.click(screen.getByTestId('favorite-r1'));
      fireEvent.click(screen.getByTestId('favorite-r3'));
      fireEvent.click(screen.getByTestId('favorite-r6'));
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    });
  });

  // ── Recipe Detail Modal ──

  describe('Recipe Detail Modal', () => {
    test('clicking a recipe opens detail modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      expect(screen.getByTestId('recipe-detail-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-recipe-title').textContent).toContain('Classic Pancakes');
    });

    test('modal shows prep/cook time, servings, calories', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      expect(screen.getByText('10m')).toBeInTheDocument(); // prep
      expect(screen.getByText('15m')).toBeInTheDocument(); // cook
      expect(screen.getByText('4')).toBeInTheDocument(); // servings
      expect(screen.getByText('350')).toBeInTheDocument(); // calories
    });

    test('modal shows recipe detail tabs', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      expect(screen.getByTestId('recipe-detail-tabs')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-tab-ingredients')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-tab-steps')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-tab-notes')).toBeInTheDocument();
    });

    test('ingredients tab shows ingredient list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      expect(screen.getByTestId('ingredients-section')).toBeInTheDocument();
      expect(screen.getByText('All-purpose flour')).toBeInTheDocument();
      expect(screen.getByText('2 cups')).toBeInTheDocument();
      expect(screen.getByText('Buttermilk')).toBeInTheDocument();
    });

    test('switching to steps tab shows recipe steps', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      fireEvent.click(screen.getByTestId('recipe-tab-steps'));
      expect(screen.getByTestId('steps-section')).toBeInTheDocument();
      expect(screen.getByTestId('step-0')).toBeInTheDocument();
      expect(screen.getByText(/Mix flour, sugar, baking powder/)).toBeInTheDocument();
    });

    test('switching to notes tab shows notes input', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      fireEvent.click(screen.getByTestId('recipe-tab-notes'));
      expect(screen.getByTestId('notes-section')).toBeInTheDocument();
      expect(screen.getByTestId('notes-input')).toBeInTheDocument();
    });

    test('close button closes modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      expect(screen.getByTestId('recipe-detail-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('close-recipe-modal'));
      expect(screen.queryByTestId('recipe-detail-modal')).not.toBeInTheDocument();
    });

    test('can toggle favorite from within modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r2')); // Caesar (not favorite)
      const modalFav = screen.getByTestId('modal-favorite-r2');
      expect(modalFav.textContent).toContain('🤍');
      fireEvent.click(modalFav);
      expect(modalFav.textContent).toContain('❤️');
    });

    test('add to shopping list button adds ingredients', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      fireEvent.click(screen.getByTestId('add-to-shopping-btn'));
      // Close modal and check shopping tab
      fireEvent.click(screen.getByTestId('close-recipe-modal'));
      fireEvent.click(screen.getByTestId('tab-shopping'));
      expect(screen.getByText('All-purpose flour')).toBeInTheDocument();
      expect(screen.getByText('Buttermilk')).toBeInTheDocument();
    });
  });

  // ── Notes ──

  describe('Recipe Notes', () => {
    test('saving a note persists it', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      fireEvent.click(screen.getByTestId('recipe-tab-notes'));
      const notesInput = screen.getByTestId('notes-input');
      fireEvent.change(notesInput, { target: { value: 'My secret tip: add cinnamon!' } });
      fireEvent.click(screen.getByTestId('save-notes-btn'));
      // Close and reopen
      fireEvent.click(screen.getByTestId('close-recipe-modal'));
      fireEvent.click(screen.getByTestId('recipe-r1'));
      fireEvent.click(screen.getByTestId('recipe-tab-notes'));
      expect(screen.getByTestId('notes-input').value).toBe('My secret tip: add cinnamon!');
    });
  });

  // ── Shopping List ──

  describe('Shopping List', () => {
    test('shopping tab renders with empty list message', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      expect(screen.getByText('Shopping list is empty')).toBeInTheDocument();
    });

    test('adding manual item appears in list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      const input = screen.getByTestId('shopping-input');
      fireEvent.change(input, { target: { value: 'Extra lemons' } });
      fireEvent.click(screen.getByTestId('add-shopping-btn'));
      expect(screen.getByText('Extra lemons')).toBeInTheDocument();
    });

    test('checking off a shopping item applies strikethrough style', () => {
      render(<HomeScreen />);
      // Add an item first
      fireEvent.click(screen.getByTestId('tab-shopping'));
      const input = screen.getByTestId('shopping-input');
      fireEvent.change(input, { target: { value: 'Milk' } });
      fireEvent.click(screen.getByTestId('add-shopping-btn'));
      // Find the toggle button and click it
      const items = screen.getAllByText('⬜');
      fireEvent.click(items[0]);
      expect(screen.getByText('☑️')).toBeInTheDocument();
    });

    test('removing a shopping item removes it from list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      const input = screen.getByTestId('shopping-input');
      fireEvent.change(input, { target: { value: 'Bread' } });
      fireEvent.click(screen.getByTestId('add-shopping-btn'));
      expect(screen.getByText('Bread')).toBeInTheDocument();
      // Click the remove button
      const removeBtn = screen.getByText('✕');
      fireEvent.click(removeBtn);
      expect(screen.queryByText('Bread')).not.toBeInTheDocument();
    });

    test('shopping filter buttons work', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      expect(screen.getByTestId('shopping-filter')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-filter-unchecked')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-filter-checked')).toBeInTheDocument();
    });

    test('clear checked removes only checked items', () => {
      render(<HomeScreen />);
      // Add two items from recipe
      fireEvent.click(screen.getByTestId('recipe-r9')); // Mango Lassi
      fireEvent.click(screen.getByTestId('add-to-shopping-btn'));
      fireEvent.click(screen.getByTestId('close-recipe-modal'));
      fireEvent.click(screen.getByTestId('tab-shopping'));
      // Check the first item
      const checkboxes = screen.getAllByText('⬜');
      fireEvent.click(checkboxes[0]);
      // Now clear checked
      fireEvent.click(screen.getByTestId('clear-checked-btn'));
      // First item (Ripe mango) should be gone, others remain
      const remaining = screen.getAllByText('⬜');
      expect(remaining.length).toBe(checkboxes.length - 1);
    });
  });

  // ── Meal Planner ──

  describe('Meal Planner', () => {
    test('planner tab shows weekly meal plan', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      expect(screen.getByTestId('planner-tab')).toBeInTheDocument();
      expect(screen.getByText('Weekly Meal Plan')).toBeInTheDocument();
    });

    test('planner shows stats', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      expect(screen.getByTestId('planner-stats')).toBeInTheDocument();
      expect(screen.getByText(/0 meals planned/)).toBeInTheDocument();
    });

    test('day selector renders all days', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      expect(screen.getByTestId('day-selector')).toBeInTheDocument();
      expect(screen.getByTestId('day-Monday')).toBeInTheDocument();
      expect(screen.getByTestId('day-Sunday')).toBeInTheDocument();
    });

    test('meal slots render for each meal type', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      expect(screen.getByTestId('meal-slot-breakfast')).toBeInTheDocument();
      expect(screen.getByTestId('meal-slot-lunch')).toBeInTheDocument();
      expect(screen.getByTestId('meal-slot-dinner')).toBeInTheDocument();
      expect(screen.getByTestId('meal-slot-snack')).toBeInTheDocument();
    });

    test('clicking add meal opens meal picker modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      fireEvent.click(screen.getByTestId('add-meal-breakfast'));
      expect(screen.getByTestId('meal-picker-modal')).toBeInTheDocument();
      expect(screen.getByTestId('meal-picker-list')).toBeInTheDocument();
    });

    test('picking a meal assigns it to the slot', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      fireEvent.click(screen.getByTestId('add-meal-breakfast'));
      fireEvent.click(screen.getByTestId('pick-meal-r1'));
      // Should now show Classic Pancakes in the breakfast slot
      expect(screen.getByText(/Classic Pancakes/)).toBeInTheDocument();
      expect(screen.getByText(/350 cal/)).toBeInTheDocument();
    });

    test('removing a meal clears the slot', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      // Add a meal
      fireEvent.click(screen.getByTestId('add-meal-lunch'));
      fireEvent.click(screen.getByTestId('pick-meal-r2'));
      expect(screen.getByText(/Caesar Salad/)).toBeInTheDocument();
      // Remove it
      fireEvent.click(screen.getByTestId('remove-meal-lunch'));
      expect(screen.getByTestId('add-meal-lunch')).toBeInTheDocument();
    });

    test('switching days shows different meal slots', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      // Add meal for Monday
      fireEvent.click(screen.getByTestId('add-meal-breakfast'));
      fireEvent.click(screen.getByTestId('pick-meal-r1'));
      // Switch to Tuesday
      fireEvent.click(screen.getByTestId('day-Tuesday'));
      // Should show empty slots for Tuesday
      expect(screen.getByTestId('add-meal-breakfast')).toBeInTheDocument();
      // Switch back to Monday - should still have the meal
      fireEvent.click(screen.getByTestId('day-Monday'));
      expect(screen.getByText(/Classic Pancakes/)).toBeInTheDocument();
    });

    test('planner stats update when meals are added', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      fireEvent.click(screen.getByTestId('add-meal-breakfast'));
      fireEvent.click(screen.getByTestId('pick-meal-r1'));
      expect(screen.getByText(/1 meals planned/)).toBeInTheDocument();
      expect(screen.getByText(/350 total calories/)).toBeInTheDocument();
    });
  });

  // ── Timer ──

  describe('Cooking Timer', () => {
    test('timer tab renders with presets', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-timer'));
      expect(screen.getByTestId('timer-tab')).toBeInTheDocument();
      expect(screen.getByTestId('timer-display')).toBeInTheDocument();
      expect(screen.getByTestId('timer-presets')).toBeInTheDocument();
    });

    test('timer shows 00:00 initially', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-timer'));
      expect(screen.getByTestId('timer-value').textContent).toBe('00:00');
    });

    test('clicking a preset starts the timer', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-timer'));
      fireEvent.click(screen.getByTestId('timer-preset-5'));
      // Timer should show 05:00 countdown
      expect(screen.getByTestId('timer-value').textContent).toBe('05:00');
      expect(screen.getByTestId('timer-label').textContent).toContain('5 min');
      // Pause button should appear
      expect(screen.getByTestId('timer-stop-btn')).toBeInTheDocument();
    });

    test('pause button pauses the timer', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-timer'));
      fireEvent.click(screen.getByTestId('timer-preset-1'));
      expect(screen.getByTestId('timer-stop-btn')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('timer-stop-btn'));
      // Resume and Reset buttons should appear
      expect(screen.getByTestId('timer-resume-btn')).toBeInTheDocument();
      expect(screen.getByTestId('timer-reset-btn')).toBeInTheDocument();
    });

    test('reset button resets timer to zero', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-timer'));
      fireEvent.click(screen.getByTestId('timer-preset-1'));
      fireEvent.click(screen.getByTestId('timer-stop-btn'));
      fireEvent.click(screen.getByTestId('timer-reset-btn'));
      expect(screen.getByTestId('timer-value').textContent).toBe('00:00');
      // Presets should reappear
      expect(screen.getByTestId('timer-presets')).toBeInTheDocument();
    });
  });

  // ── Add Recipe Modal ──

  describe('Add Recipe', () => {
    test('clicking add button opens add recipe modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      expect(screen.getByTestId('add-recipe-modal')).toBeInTheDocument();
      expect(screen.getByTestId('add-recipe-form')).toBeInTheDocument();
    });

    test('add recipe form has all required fields', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      expect(screen.getByTestId('input-recipe-title')).toBeInTheDocument();
      expect(screen.getByTestId('input-recipe-description')).toBeInTheDocument();
      expect(screen.getByTestId('category-selector')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-selector')).toBeInTheDocument();
      expect(screen.getByTestId('input-prep-time')).toBeInTheDocument();
      expect(screen.getByTestId('input-cook-time')).toBeInTheDocument();
      expect(screen.getByTestId('input-servings')).toBeInTheDocument();
    });

    test('cancel button closes modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      fireEvent.click(screen.getByTestId('close-add-recipe'));
      expect(screen.queryByTestId('add-recipe-modal')).not.toBeInTheDocument();
    });

    test('submitting form adds new recipe', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      const titleInput = screen.getByTestId('input-recipe-title');
      fireEvent.change(titleInput, { target: { value: 'My Custom Salad' } });
      fireEvent.click(screen.getByTestId('save-recipe-btn'));
      // Modal should close
      expect(screen.queryByTestId('add-recipe-modal')).not.toBeInTheDocument();
      // New recipe should appear in list
      expect(screen.getByText('My Custom Salad')).toBeInTheDocument();
    });

    test('recipe count updates after adding', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/10 recipes/)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      fireEvent.change(screen.getByTestId('input-recipe-title'), { target: { value: 'New Recipe' } });
      fireEvent.click(screen.getByTestId('save-recipe-btn'));
      expect(screen.getByText(/11 recipes/)).toBeInTheDocument();
    });

    test('selecting category in add form updates selection', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      fireEvent.click(screen.getByTestId('select-category-dessert'));
      // Submit and verify the recipe has the right category icon
      fireEvent.change(screen.getByTestId('input-recipe-title'), { target: { value: 'Test Dessert' } });
      fireEvent.click(screen.getByTestId('save-recipe-btn'));
      // Filter by dessert to find it
      fireEvent.click(screen.getByTestId('category-dessert'));
      expect(screen.getByText('Test Dessert')).toBeInTheDocument();
    });

    test('selecting difficulty in add form works', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      expect(screen.getByTestId('select-difficulty-easy')).toBeInTheDocument();
      expect(screen.getByTestId('select-difficulty-medium')).toBeInTheDocument();
      expect(screen.getByTestId('select-difficulty-hard')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('select-difficulty-hard'));
    });
  });

  // ── Quick Timers from Recipe Detail ──

  describe('Recipe Quick Timers', () => {
    test('steps tab shows quick timer buttons', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      fireEvent.click(screen.getByTestId('recipe-tab-steps'));
      expect(screen.getByTestId('quick-timer-prep')).toBeInTheDocument();
      expect(screen.getByTestId('quick-timer-cook')).toBeInTheDocument();
    });

    test('quick timer prep button text shows prep time', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r1'));
      fireEvent.click(screen.getByTestId('recipe-tab-steps'));
      expect(screen.getByTestId('quick-timer-prep').textContent).toContain('10m');
    });
  });

  // ── Cross-feature interactions ──

  describe('Cross-Feature Interactions', () => {
    test('search + category filter work together', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('category-breakfast'));
      const search = screen.getByTestId('search-input');
      fireEvent.change(search, { target: { value: 'avocado' } });
      expect(screen.getByText('Avocado Toast')).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('favoriting from recipe card updates favorites tab', () => {
      render(<HomeScreen />);
      // Unfavorite r1, then check favorites tab
      fireEvent.click(screen.getByTestId('favorite-r1'));
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
      expect(screen.getByText(/2 favorites/)).toBeInTheDocument();
    });

    test('adding recipe from modal shopping to shopping tab persists', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-r3')); // Carbonara
      fireEvent.click(screen.getByTestId('add-to-shopping-btn'));
      fireEvent.click(screen.getByTestId('close-recipe-modal'));
      fireEvent.click(screen.getByTestId('tab-shopping'));
      expect(screen.getByText('Spaghetti')).toBeInTheDocument();
      expect(screen.getByText('Guanciale')).toBeInTheDocument();
      expect(screen.getByText('Pecorino Romano')).toBeInTheDocument();
    });
  });
});
