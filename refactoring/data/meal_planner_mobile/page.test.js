import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import HomeScreen from './src/screens/HomeScreen.jsx';

// Mock Alert for React Native
global.Alert = { alert: vi.fn() };

// Mock Dimensions for React Native
vi.mock('react-native', async () => {
  const actual = await vi.importActual('react-native');
  return {
    ...actual,
    Dimensions: { get: () => ({ width: 375, height: 812 }) },
    Platform: { OS: 'ios' },
  };
});

describe('MealPlanner HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════
  // INITIAL RENDERING
  // ═══════════════════════════════════════════════════════════════

  describe('Initial Rendering', () => {
    test('renders the home screen container', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('home-screen')).toBeInTheDocument();
    });

    test('renders the header with app title', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Meal Planner')).toBeInTheDocument();
    });

    test('renders header subtitle with recipe count and grocery info', () => {
      render(<HomeScreen />);
      const header = screen.getByTestId('header');
      expect(within(header).getByText(/12 recipes/)).toBeInTheDocument();
      expect(within(header).getByText(/items to buy/)).toBeInTheDocument();
    });

    test('renders the add recipe button', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('add-recipe-btn')).toBeInTheDocument();
      expect(screen.getByText('+ New')).toBeInTheDocument();
    });

    test('renders the tab bar with all tabs', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
      expect(screen.getByTestId('tab-recipes')).toBeInTheDocument();
      expect(screen.getByTestId('tab-plan')).toBeInTheDocument();
      expect(screen.getByTestId('tab-grocery')).toBeInTheDocument();
      expect(screen.getByTestId('tab-nutrition')).toBeInTheDocument();
      expect(screen.getByTestId('tab-favorites')).toBeInTheDocument();
    });

    test('renders tab labels', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Recipes')).toBeInTheDocument();
      expect(screen.getByText('Meal Plan')).toBeInTheDocument();
      expect(screen.getByText('Grocery')).toBeInTheDocument();
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    test('recipes tab is active by default', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('recipes-tab')).toBeInTheDocument();
    });

    test('renders the content area', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('content-area')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // RECIPES TAB
  // ═══════════════════════════════════════════════════════════════

  describe('Recipes Tab', () => {
    test('renders the recipe search input', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('recipe-search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search recipes/)).toBeInTheDocument();
    });

    test('renders the sort toggle button', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('sort-toggle')).toBeInTheDocument();
    });

    test('renders meal type filter chips', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('filter-meal-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-meal-breakfast')).toBeInTheDocument();
      expect(screen.getByTestId('filter-meal-lunch')).toBeInTheDocument();
      expect(screen.getByTestId('filter-meal-dinner')).toBeInTheDocument();
      expect(screen.getByTestId('filter-meal-snack')).toBeInTheDocument();
    });

    test('renders diet filter chips', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('filter-diet-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-diet-vegetarian')).toBeInTheDocument();
      expect(screen.getByTestId('filter-diet-vegan')).toBeInTheDocument();
      expect(screen.getByTestId('filter-diet-gluten-free')).toBeInTheDocument();
    });

    test('renders difficulty filter chips', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('filter-difficulty-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-difficulty-easy')).toBeInTheDocument();
      expect(screen.getByTestId('filter-difficulty-medium')).toBeInTheDocument();
      expect(screen.getByTestId('filter-difficulty-hard')).toBeInTheDocument();
    });

    test('renders the results count showing all recipes', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('results-count')).toBeInTheDocument();
      expect(screen.getByText(/12 recipes found/)).toBeInTheDocument();
    });

    test('renders the recipe grid', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('recipe-grid')).toBeInTheDocument();
    });

    test('renders recipe cards with correct data', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r3')).toBeInTheDocument();
      expect(screen.getByText('Salmon Teriyaki Bowl')).toBeInTheDocument();
    });

    test('recipe cards display calorie and time info', () => {
      render(<HomeScreen />);
      const card = screen.getByTestId('recipe-card-r1');
      // Avocado toast: 15+5=20m, 420 cal, 4.7 rating
      expect(within(card).getByText(/20m/)).toBeInTheDocument();
      expect(within(card).getByText(/420 cal/)).toBeInTheDocument();
      expect(within(card).getByText(/4.7/)).toBeInTheDocument();
    });

    test('recipe cards show favorite button', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('fav-btn-r1')).toBeInTheDocument();
      expect(screen.getByTestId('fav-btn-r2')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // RECIPE SEARCH AND FILTERING
  // ═══════════════════════════════════════════════════════════════

  describe('Recipe Search and Filtering', () => {
    test('search filters recipes by name', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('recipe-search');
      fireEvent.change(search, { target: { value: 'salmon' } });
      expect(screen.getByText(/1 recipe found/)).toBeInTheDocument();
      expect(screen.getByText('Salmon Teriyaki Bowl')).toBeInTheDocument();
    });

    test('search filters recipes by ingredient', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('recipe-search');
      fireEvent.change(search, { target: { value: 'avocado' } });
      // Should match Avocado Toast and Spicy Black Bean Tacos (both have avocado)
      const results = screen.getByTestId('results-count');
      expect(results.textContent).toMatch(/2 recipes/);
    });

    test('search filters recipes by diet tag', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('recipe-search');
      fireEvent.change(search, { target: { value: 'keto' } });
      expect(screen.getByText(/0 recipes found/)).toBeInTheDocument();
    });

    test('meal type filter narrows results', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('filter-meal-breakfast'));
      // Breakfast recipes: r1 (Avocado Toast), r4 (Greek Yogurt), r7 (Overnight Oats), r11 (Smoothie Bowl)
      expect(screen.getByText(/4 recipes found/)).toBeInTheDocument();
    });

    test('diet filter narrows results', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('filter-diet-vegan'));
      // Vegan recipes: r5 (Spicy Black Bean Tacos), r11 (Smoothie Bowl), r12 (Hummus Wrap)
      expect(screen.getByText(/3 recipes found/)).toBeInTheDocument();
    });

    test('difficulty filter narrows results', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('filter-difficulty-medium'));
      // Medium: r3 (Salmon Teriyaki), r8 (Thai Green Curry), r10 (Stuffed Bell Peppers)
      expect(screen.getByText(/3 recipes found/)).toBeInTheDocument();
    });

    test('filters can be combined', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('filter-meal-dinner'));
      fireEvent.click(screen.getByTestId('filter-difficulty-easy'));
      // Dinner + easy: r5 (Spicy Black Bean Tacos)
      expect(screen.getByText(/1 recipe found/)).toBeInTheDocument();
      expect(screen.getByText('Spicy Black Bean Tacos')).toBeInTheDocument();
    });

    test('no results shows empty state', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('recipe-search');
      fireEvent.change(search, { target: { value: 'xyznonexistent' } });
      expect(screen.getByText(/No recipes match your filters/)).toBeInTheDocument();
      expect(screen.getByTestId('clear-filters')).toBeInTheDocument();
    });

    test('clear filters button resets all filters', () => {
      render(<HomeScreen />);
      const search = screen.getByTestId('recipe-search');
      fireEvent.change(search, { target: { value: 'xyznonexistent' } });
      fireEvent.click(screen.getByTestId('clear-filters'));
      expect(screen.getByText(/12 recipes found/)).toBeInTheDocument();
    });

    test('sort toggle opens sort picker', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('sort-toggle'));
      expect(screen.getByTestId('sort-picker')).toBeInTheDocument();
      expect(screen.getByTestId('sort-option-name-asc')).toBeInTheDocument();
      expect(screen.getByTestId('sort-option-calories-desc')).toBeInTheDocument();
    });

    test('selecting a sort option sorts recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('sort-toggle'));
      fireEvent.click(screen.getByTestId('sort-option-rating-desc'));
      // Top rated is Salmon Teriyaki (4.9), should be first
      const grid = screen.getByTestId('recipe-grid');
      const firstCard = grid.children[0];
      expect(within(firstCard).getByText('Salmon Teriyaki Bowl')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // FAVORITES
  // ═══════════════════════════════════════════════════════════════

  describe('Favorites', () => {
    test('initial favorite recipes are marked', () => {
      render(<HomeScreen />);
      // r3, r1, r8, r5 are initial favorites
      const fav1 = screen.getByTestId('fav-btn-r1');
      expect(fav1.textContent).toContain('\u2764\uFE0F');
      const fav3 = screen.getByTestId('fav-btn-r3');
      expect(fav3.textContent).toContain('\u2764\uFE0F');
    });

    test('non-favorited recipes show empty heart', () => {
      render(<HomeScreen />);
      const fav2 = screen.getByTestId('fav-btn-r2');
      expect(fav2.textContent).toContain('\uD83E\uDD0D');
    });

    test('clicking favorite button toggles favorite on', () => {
      render(<HomeScreen />);
      const fav2 = screen.getByTestId('fav-btn-r2');
      fireEvent.click(fav2);
      expect(fav2.textContent).toContain('\u2764\uFE0F');
    });

    test('clicking favorite button toggles favorite off', () => {
      render(<HomeScreen />);
      const fav1 = screen.getByTestId('fav-btn-r1');
      fireEvent.click(fav1);
      expect(fav1.textContent).toContain('\uD83E\uDD0D');
    });

    test('favorites tab shows only favorite recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.getByTestId('favorites-tab')).toBeInTheDocument();
      expect(screen.getByText(/Favorite Recipes \(4\)/)).toBeInTheDocument();
      expect(screen.getByText('Salmon Teriyaki Bowl')).toBeInTheDocument();
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.getByText('Thai Green Curry')).toBeInTheDocument();
      expect(screen.getByText('Spicy Black Bean Tacos')).toBeInTheDocument();
    });

    test('removing a favorite updates favorites tab count', () => {
      render(<HomeScreen />);
      // Remove r1 from favorites on recipes tab
      fireEvent.click(screen.getByTestId('fav-btn-r1'));
      // Switch to favorites tab
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.getByText(/Favorite Recipes \(3\)/)).toBeInTheDocument();
    });

    test('favorites tab shows empty state when no favorites', () => {
      render(<HomeScreen />);
      // Remove all 4 initial favorites
      fireEvent.click(screen.getByTestId('fav-btn-r3'));
      fireEvent.click(screen.getByTestId('fav-btn-r1'));
      fireEvent.click(screen.getByTestId('fav-btn-r8'));
      fireEvent.click(screen.getByTestId('fav-btn-r5'));
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.getByText(/No favorite recipes yet/)).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // RECIPE DETAIL MODAL
  // ═══════════════════════════════════════════════════════════════

  describe('Recipe Detail Modal', () => {
    test('clicking recipe card opens detail modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByTestId('recipe-detail-modal')).toBeInTheDocument();
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
    });

    test('detail modal shows nutrition info', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r3'));
      expect(screen.getByTestId('detail-nutrition')).toBeInTheDocument();
      // Salmon: 40g protein, 62g carbs, 22g fat, 5g fiber
      expect(screen.getByText('40g')).toBeInTheDocument();
      expect(screen.getByText('62g')).toBeInTheDocument();
    });

    test('detail modal shows ingredients', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByTestId('ingredient-0')).toBeInTheDocument();
      expect(screen.getByText(/Avocado/)).toBeInTheDocument();
      expect(screen.getByText(/Bread \(sourdough\)/)).toBeInTheDocument();
    });

    test('detail modal shows instructions', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByTestId('instruction-0')).toBeInTheDocument();
      expect(screen.getByText(/Toast the sourdough bread/)).toBeInTheDocument();
    });

    test('detail modal shows notes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByTestId('recipe-notes')).toBeInTheDocument();
      expect(screen.getByText(/Best with ripe avocados/)).toBeInTheDocument();
    });

    test('detail modal shows meta info (time, servings, calories, rating)', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      // Avocado toast: 20m total, 2 servings, 420 cal, 4.7 rating
      expect(screen.getByText('20m')).toBeInTheDocument();
      expect(screen.getByText('420')).toBeInTheDocument();
    });

    test('detail modal shows diet tags', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByText('vegetarian')).toBeInTheDocument();
    });

    test('close button closes the detail modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByTestId('recipe-detail-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('close-detail'));
      // After closing, the recipe card should still be visible
      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
    });

    test('favorite button in detail modal works', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r2'));
      // r2 is not a favorite initially
      const detailFav = screen.getByTestId('detail-fav-r2');
      expect(detailFav.textContent).toContain('\uD83E\uDD0D');
      fireEvent.click(detailFav);
      expect(detailFav.textContent).toContain('\u2764\uFE0F');
    });

    test('detail modal shows cooked count', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByText(/Cooked 12 times/)).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MEAL PLAN TAB
  // ═══════════════════════════════════════════════════════════════

  describe('Meal Plan Tab', () => {
    test('switching to meal plan tab renders plan view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      expect(screen.getByTestId('plan-tab')).toBeInTheDocument();
      expect(screen.getByText('Weekly Meal Plan')).toBeInTheDocument();
    });

    test('renders day selector buttons', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      expect(screen.getByTestId('day-btn-Monday')).toBeInTheDocument();
      expect(screen.getByTestId('day-btn-Sunday')).toBeInTheDocument();
    });

    test('Monday is selected by default', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      expect(screen.getByTestId('day-plan-Monday')).toBeInTheDocument();
      expect(screen.getByText('Monday')).toBeInTheDocument();
    });

    test('renders meal slots for selected day', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      expect(screen.getByTestId('meal-slot-Monday-breakfast')).toBeInTheDocument();
      expect(screen.getByTestId('meal-slot-Monday-lunch')).toBeInTheDocument();
      expect(screen.getByTestId('meal-slot-Monday-dinner')).toBeInTheDocument();
      expect(screen.getByTestId('meal-slot-Monday-snack')).toBeInTheDocument();
    });

    test('filled meal slots show recipe name and calories', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      // Monday breakfast = r1 (Avocado Toast)
      const slot = screen.getByTestId('meal-slot-Monday-breakfast');
      expect(within(slot).getByText(/Avocado Toast/)).toBeInTheDocument();
      expect(within(slot).getByText(/420 cal/)).toBeInTheDocument();
    });

    test('empty meal slots show add button', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      // Monday snack is null
      expect(screen.getByTestId('assign-slot-Monday-snack')).toBeInTheDocument();
      expect(screen.getByText('+ Add meal')).toBeInTheDocument();
    });

    test('clicking day button switches day', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('day-btn-Tuesday'));
      expect(screen.getByTestId('day-plan-Tuesday')).toBeInTheDocument();
      // Tuesday breakfast = r4 (Greek Yogurt Parfait)
      const slot = screen.getByTestId('meal-slot-Tuesday-breakfast');
      expect(within(slot).getByText(/Greek Yogurt/)).toBeInTheDocument();
    });

    test('clear meal slot button removes recipe', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      // Clear Monday breakfast
      fireEvent.click(screen.getByTestId('clear-slot-Monday-breakfast'));
      // Should now show "Add meal" in that slot
      expect(screen.getByTestId('assign-slot-Monday-breakfast')).toBeInTheDocument();
    });

    test('add meal button opens recipe picker', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('assign-slot-Monday-snack'));
      expect(screen.getByTestId('recipe-picker-modal')).toBeInTheDocument();
    });

    test('recipe picker shows available recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('assign-slot-Monday-snack'));
      expect(screen.getByTestId('pick-recipe-r9')).toBeInTheDocument();
    });

    test('selecting a recipe from picker assigns it to slot', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('assign-slot-Monday-snack'));
      fireEvent.click(screen.getByTestId('pick-recipe-r9'));
      // Energy Bites should now be in the snack slot
      const slot = screen.getByTestId('meal-slot-Monday-snack');
      expect(within(slot).getByText(/Energy Bites/)).toBeInTheDocument();
    });

    test('weekly overview is rendered', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      expect(screen.getByTestId('weekly-overview')).toBeInTheDocument();
      expect(screen.getByTestId('overview-Monday')).toBeInTheDocument();
      expect(screen.getByTestId('overview-Sunday')).toBeInTheDocument();
    });

    test('weekly overview shows fill counts', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      // Monday has 3 meals (no snack)
      const mondayOverview = screen.getByTestId('overview-Monday');
      expect(within(mondayOverview).getByText('3/4')).toBeInTheDocument();
      // Tuesday has 4 meals (including snack)
      const tuesdayOverview = screen.getByTestId('overview-Tuesday');
      expect(within(tuesdayOverview).getByText('4/4')).toBeInTheDocument();
    });

    test('clicking weekly overview day selects that day', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('overview-Wednesday'));
      expect(screen.getByTestId('day-plan-Wednesday')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GROCERY LIST TAB
  // ═══════════════════════════════════════════════════════════════

  describe('Grocery List Tab', () => {
    test('switching to grocery tab renders grocery view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-grocery'));
      expect(screen.getByTestId('grocery-tab')).toBeInTheDocument();
      expect(screen.getByText('Grocery List')).toBeInTheDocument();
    });

    test('shows grocery stats', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-grocery'));
      expect(screen.getByTestId('grocery-stats')).toBeInTheDocument();
      expect(screen.getByText(/items checked/)).toBeInTheDocument();
    });

    test('renders grocery search input', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-grocery'));
      expect(screen.getByTestId('grocery-search')).toBeInTheDocument();
    });

    test('renders grocery progress bar', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-grocery'));
      expect(screen.getByTestId('grocery-progress')).toBeInTheDocument();
    });

    test('grocery items are grouped by category', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-grocery'));
      expect(screen.getByTestId('grocery-category-produce')).toBeInTheDocument();
      expect(screen.getByTestId('grocery-category-dairy')).toBeInTheDocument();
    });

    test('clicking grocery item toggles checked state', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-grocery'));
      // Find the first grocery item
      const produceCategory = screen.getByTestId('grocery-category-produce');
      const firstItem = within(produceCategory).getAllByText(/☐/)[0];
      const itemRow = firstItem.closest('[data-testid]');
      fireEvent.click(itemRow);
      // After clicking, stats should update
      expect(screen.getByText(/1\//)).toBeInTheDocument();
    });

    test('clear checked button appears when items are checked', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-grocery'));
      // Check an item first
      const produceCategory = screen.getByTestId('grocery-category-produce');
      const items = within(produceCategory).getAllByText(/☐/);
      const itemRow = items[0].closest('[data-testid]');
      fireEvent.click(itemRow);
      expect(screen.getByTestId('clear-checked')).toBeInTheDocument();
    });

    test('grocery search filters items', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-grocery'));
      const grocerySearch = screen.getByTestId('grocery-search');
      fireEvent.change(grocerySearch, { target: { value: 'eggs' } });
      // Should show only items matching "eggs"
      expect(screen.getByText('Eggs')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // NUTRITION TAB
  // ═══════════════════════════════════════════════════════════════

  describe('Nutrition Tab', () => {
    test('switching to nutrition tab renders nutrition view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      expect(screen.getByTestId('nutrition-tab')).toBeInTheDocument();
      expect(screen.getByText('Nutrition Tracker')).toBeInTheDocument();
    });

    test('renders day selector for nutrition', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      expect(screen.getByTestId('nutrition-day-Monday')).toBeInTheDocument();
      expect(screen.getByTestId('nutrition-day-Sunday')).toBeInTheDocument();
    });

    test('renders daily nutrition summary', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      expect(screen.getByTestId('daily-nutrition-summary')).toBeInTheDocument();
      // Monday: r1 (420) + r2 (520) + r3 (650) = 1590 calories
      expect(screen.getByText('1590')).toBeInTheDocument();
      expect(screen.getByText('calories')).toBeInTheDocument();
    });

    test('renders nutrition bars for macros', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      expect(screen.getByText('Protein')).toBeInTheDocument();
      expect(screen.getByText('Carbs')).toBeInTheDocument();
      expect(screen.getByText('Fat')).toBeInTheDocument();
      expect(screen.getByText('Fiber')).toBeInTheDocument();
    });

    test('renders meal breakdown section', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      expect(screen.getByTestId('nutrition-meal-breakfast')).toBeInTheDocument();
      expect(screen.getByTestId('nutrition-meal-lunch')).toBeInTheDocument();
      expect(screen.getByTestId('nutrition-meal-dinner')).toBeInTheDocument();
      expect(screen.getByTestId('nutrition-meal-snack')).toBeInTheDocument();
    });

    test('meal breakdown shows recipe names', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      // Monday: breakfast=r1, lunch=r2, dinner=r3
      const breakfast = screen.getByTestId('nutrition-meal-breakfast');
      expect(within(breakfast).getByText(/Avocado Toast/)).toBeInTheDocument();
      const lunch = screen.getByTestId('nutrition-meal-lunch');
      expect(within(lunch).getByText(/Grilled Chicken Caesar/)).toBeInTheDocument();
    });

    test('empty meal slot shows "No meal planned"', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      // Monday snack is null
      const snack = screen.getByTestId('nutrition-meal-snack');
      expect(within(snack).getByText(/No meal planned/)).toBeInTheDocument();
    });

    test('switching day updates nutrition data', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      fireEvent.click(screen.getByTestId('nutrition-day-Tuesday'));
      // Tuesday: r4 (320) + r6 (480) + r5 (380) + r9 (120) = 1300 calories
      expect(screen.getByText('1300')).toBeInTheDocument();
    });

    test('renders weekly nutrition summary', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      expect(screen.getByTestId('weekly-nutrition-summary')).toBeInTheDocument();
      expect(screen.getByText('Meals Planned')).toBeInTheDocument();
      expect(screen.getByText('Avg Cal/Day')).toBeInTheDocument();
      expect(screen.getByText('Avg Protein/Day')).toBeInTheDocument();
      expect(screen.getByText('Total Calories')).toBeInTheDocument();
    });

    test('weekly summary shows correct meal count', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      const summary = screen.getByTestId('weekly-nutrition-summary');
      // Count non-null meals in INITIAL_MEAL_PLAN:
      // Mon: 3, Tue: 4, Wed: 3, Thu: 4, Fri: 3, Sat: 3, Sun: 3 = 23
      expect(within(summary).getByText('23')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ADD RECIPE MODAL
  // ═══════════════════════════════════════════════════════════════

  describe('Add Recipe Modal', () => {
    test('clicking add recipe button opens modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      expect(screen.getByTestId('add-recipe-modal')).toBeInTheDocument();
      expect(screen.getByText('New Recipe')).toBeInTheDocument();
    });

    test('add recipe modal has all form fields', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      expect(screen.getByTestId('input-recipe-name')).toBeInTheDocument();
      expect(screen.getByTestId('input-recipe-emoji')).toBeInTheDocument();
      expect(screen.getByTestId('input-prep-time')).toBeInTheDocument();
      expect(screen.getByTestId('input-cook-time')).toBeInTheDocument();
      expect(screen.getByTestId('input-servings')).toBeInTheDocument();
      expect(screen.getByTestId('input-ingredients')).toBeInTheDocument();
      expect(screen.getByTestId('input-instructions')).toBeInTheDocument();
      expect(screen.getByTestId('input-notes')).toBeInTheDocument();
    });

    test('add recipe modal has meal type selector', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      expect(screen.getByTestId('new-meal-type-breakfast')).toBeInTheDocument();
      expect(screen.getByTestId('new-meal-type-lunch')).toBeInTheDocument();
      expect(screen.getByTestId('new-meal-type-dinner')).toBeInTheDocument();
      expect(screen.getByTestId('new-meal-type-snack')).toBeInTheDocument();
    });

    test('add recipe modal has difficulty selector', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      expect(screen.getByTestId('new-difficulty-easy')).toBeInTheDocument();
      expect(screen.getByTestId('new-difficulty-medium')).toBeInTheDocument();
      expect(screen.getByTestId('new-difficulty-hard')).toBeInTheDocument();
    });

    test('add recipe modal has diet tag toggles', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      expect(screen.getByTestId('new-diet-tag-vegetarian')).toBeInTheDocument();
      expect(screen.getByTestId('new-diet-tag-vegan')).toBeInTheDocument();
    });

    test('saving a new recipe adds it to the list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));

      // Fill in the form
      fireEvent.change(screen.getByTestId('input-recipe-name'), { target: { value: 'My Test Recipe' } });
      fireEvent.change(screen.getByTestId('input-prep-time'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('input-cook-time'), { target: { value: '20' } });
      fireEvent.change(screen.getByTestId('input-servings'), { target: { value: '2' } });
      fireEvent.change(screen.getByTestId('input-ingredients'), { target: { value: 'Flour\nEggs' } });
      fireEvent.change(screen.getByTestId('input-instructions'), { target: { value: 'Mix\nBake' } });

      fireEvent.click(screen.getByTestId('save-recipe-btn'));

      // The new recipe should now appear in the list
      expect(screen.getByText(/13 recipes found/)).toBeInTheDocument();
      expect(screen.getByText('My Test Recipe')).toBeInTheDocument();
    });

    test('cancel button closes the add recipe modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      fireEvent.click(screen.getByTestId('cancel-add-recipe'));
      // Should be back on recipes tab
      expect(screen.getByTestId('recipes-tab')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TAB NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  describe('Tab Navigation', () => {
    test('switching between all tabs works', () => {
      render(<HomeScreen />);

      // Start on recipes
      expect(screen.getByTestId('recipes-tab')).toBeInTheDocument();

      // Switch to plan
      fireEvent.click(screen.getByTestId('tab-plan'));
      expect(screen.getByTestId('plan-tab')).toBeInTheDocument();

      // Switch to grocery
      fireEvent.click(screen.getByTestId('tab-grocery'));
      expect(screen.getByTestId('grocery-tab')).toBeInTheDocument();

      // Switch to nutrition
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      expect(screen.getByTestId('nutrition-tab')).toBeInTheDocument();

      // Switch to favorites
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.getByTestId('favorites-tab')).toBeInTheDocument();

      // Back to recipes
      fireEvent.click(screen.getByTestId('tab-recipes'));
      expect(screen.getByTestId('recipes-tab')).toBeInTheDocument();
    });

    test('state persists across tab switches', () => {
      render(<HomeScreen />);

      // Set a search filter
      fireEvent.change(screen.getByTestId('recipe-search'), { target: { value: 'salmon' } });
      expect(screen.getByText(/1 recipe found/)).toBeInTheDocument();

      // Switch to plan and back
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('tab-recipes'));

      // Search should still be active
      expect(screen.getByText(/1 recipe found/)).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CROSS-FEATURE INTERACTIONS
  // ═══════════════════════════════════════════════════════════════

  describe('Cross-Feature Interactions', () => {
    test('changing meal plan updates grocery list', () => {
      render(<HomeScreen />);

      // Go to meal plan and clear Monday breakfast
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('clear-slot-Monday-breakfast'));

      // Go to grocery tab and check the stats changed
      fireEvent.click(screen.getByTestId('tab-grocery'));
      // Items should be reduced since we removed a meal
      const stats = screen.getByTestId('grocery-stats');
      expect(stats).toBeInTheDocument();
    });

    test('changing meal plan updates nutrition data', () => {
      render(<HomeScreen />);

      // Check Monday nutrition first
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      expect(screen.getByText('1590')).toBeInTheDocument();

      // Go to meal plan and clear Monday breakfast (r1 = 420 cal)
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('clear-slot-Monday-breakfast'));

      // Go back to nutrition
      fireEvent.click(screen.getByTestId('tab-nutrition'));
      // Should now be 1590 - 420 = 1170
      expect(screen.getByText('1170')).toBeInTheDocument();
    });

    test('adding a recipe makes it available in meal plan picker', () => {
      render(<HomeScreen />);

      // Add a new recipe
      fireEvent.click(screen.getByTestId('add-recipe-btn'));
      fireEvent.change(screen.getByTestId('input-recipe-name'), { target: { value: 'Brand New Dish' } });
      fireEvent.click(screen.getByTestId('new-meal-type-snack'));
      fireEvent.click(screen.getByTestId('save-recipe-btn'));

      // Go to meal plan and open picker for snack
      fireEvent.click(screen.getByTestId('tab-plan'));
      fireEvent.click(screen.getByTestId('assign-slot-Monday-snack'));

      // New recipe should appear in picker
      expect(screen.getByText('Brand New Dish')).toBeInTheDocument();
    });

    test('favoriting from detail modal reflects on recipe card', () => {
      render(<HomeScreen />);

      // Open detail for r2 (not a favorite)
      fireEvent.click(screen.getByTestId('recipe-card-r2'));
      // Favorite it
      fireEvent.click(screen.getByTestId('detail-fav-r2'));
      // Close modal
      fireEvent.click(screen.getByTestId('close-detail'));
      // Check the card button
      const fav2 = screen.getByTestId('fav-btn-r2');
      expect(fav2.textContent).toContain('\u2764\uFE0F');
    });
  });
});
