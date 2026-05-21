import { describe, test, expect, beforeEach, vi } from 'vitest';
// biome-ignore lint/correctness/noUndeclaredDependencies: eval test data — runs in vitest sandbox, not core package
import { render, screen, fireEvent, within } from '@testing-library/react';
import HomeScreen from '.screens/HomeScreen.jsx';

// Mock react-native Alert
vi.mock('react-native', async () => {
  const actual = await vi.importActual('react-native');
  return {
    ...actual,
    Alert: { alert: vi.fn() },
  };
});

describe('RecipeBox — HomeScreen (Mobile Refactoring)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. Initial Rendering & Layout
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Initial Rendering', () => {
    test('renders the home screen with app title', () => {
      render(<HomeScreen />);
      expect(screen.getByText('RecipeBox')).toBeInTheDocument();
      expect(screen.getByTestId('home-screen')).toBeInTheDocument();
    });

    test('renders tab bar with all five tabs', () => {
      render(<HomeScreen />);
      const tabBar = screen.getByTestId('tab-bar');
      expect(tabBar).toBeInTheDocument();
      expect(screen.getByTestId('tab-recipes')).toBeInTheDocument();
      expect(screen.getByTestId('tab-favorites')).toBeInTheDocument();
      expect(screen.getByTestId('tab-planner')).toBeInTheDocument();
      expect(screen.getByTestId('tab-shopping')).toBeInTheDocument();
      expect(screen.getByTestId('tab-profile')).toBeInTheDocument();
    });

    test('renders search bar and category filter', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    test('renders all category filter chips', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('category-all')).toBeInTheDocument();
      expect(screen.getByTestId('category-breakfast')).toBeInTheDocument();
      expect(screen.getByTestId('category-lunch')).toBeInTheDocument();
      expect(screen.getByTestId('category-dinner')).toBeInTheDocument();
      expect(screen.getByTestId('category-dessert')).toBeInTheDocument();
      expect(screen.getByTestId('category-snack')).toBeInTheDocument();
      expect(screen.getByTestId('category-drink')).toBeInTheDocument();
    });

    test('renders recipe cards for initial recipes', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r2')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r3')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r10')).toBeInTheDocument();
    });

    test('recipe cards display title, author, and stats', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('by Chef Maria')).toBeInTheDocument();
      expect(screen.getByText('Grilled Caesar Salad')).toBeInTheDocument();
      expect(screen.getByText('Beef Bolognese')).toBeInTheDocument();
    });

    test('renders sort options', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('sort-newest')).toBeInTheDocument();
      expect(screen.getByTestId('sort-rating')).toBeInTheDocument();
      expect(screen.getByTestId('sort-quickest')).toBeInTheDocument();
      expect(screen.getByTestId('sort-popular')).toBeInTheDocument();
    });

    test('renders difficulty filter options', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('difficulty-all')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-medium')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-hard')).toBeInTheDocument();
    });

    test('renders the add recipe FAB button', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('add-recipe-fab')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. Search Functionality
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Search', () => {
    test('filters recipes by title when typing in search', () => {
      render(<HomeScreen />);
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'pancake' } });

      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
      expect(screen.queryByTestId('recipe-card-r2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('recipe-card-r3')).not.toBeInTheDocument();
    });

    test('filters recipes by tag', () => {
      render(<HomeScreen />);
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'italian' } });

      expect(screen.getByTestId('recipe-card-r3')).toBeInTheDocument();
      expect(screen.queryByTestId('recipe-card-r1')).not.toBeInTheDocument();
    });

    test('filters recipes by author name', () => {
      render(<HomeScreen />);
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'Chef Kai' } });

      expect(screen.getByTestId('recipe-card-r5')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r7')).toBeInTheDocument();
      expect(screen.queryByTestId('recipe-card-r1')).not.toBeInTheDocument();
    });

    test('shows empty state when no results match', () => {
      render(<HomeScreen />);
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'xyznonexistent' } });

      expect(screen.getByTestId('empty-recipes')).toBeInTheDocument();
    });

    test('clear search button resets results', () => {
      render(<HomeScreen />);
      const input = screen.getByTestId('search-input');
      fireEvent.change(input, { target: { value: 'pancake' } });

      expect(screen.queryByTestId('recipe-card-r2')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('clear-search'));
      expect(screen.getByTestId('recipe-card-r2')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. Category Filtering
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Category Filtering', () => {
    test('filters to breakfast recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('category-breakfast'));

      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument(); // Classic Pancakes
      expect(screen.getByTestId('recipe-card-r5')).toBeInTheDocument(); // Avocado Toast
      expect(screen.getByTestId('recipe-card-r7')).toBeInTheDocument(); // Mango Smoothie
      expect(screen.queryByTestId('recipe-card-r3')).not.toBeInTheDocument(); // Bolognese is dinner
    });

    test('filters to dinner recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('category-dinner'));

      expect(screen.getByTestId('recipe-card-r3')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r6')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r10')).toBeInTheDocument();
      expect(screen.queryByTestId('recipe-card-r1')).not.toBeInTheDocument();
    });

    test('clicking "All" shows all recipes again', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('category-breakfast'));
      expect(screen.queryByTestId('recipe-card-r3')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('category-all'));
      expect(screen.getByTestId('recipe-card-r3')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. Difficulty Filtering
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Difficulty Filtering', () => {
    test('filters to easy recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('difficulty-easy'));

      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r5')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r9')).toBeInTheDocument();
      expect(screen.queryByTestId('recipe-card-r4')).not.toBeInTheDocument(); // hard
    });

    test('filters to hard recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('difficulty-hard'));

      expect(screen.getByTestId('recipe-card-r4')).toBeInTheDocument(); // Chocolate Lava Cake
      expect(screen.queryByTestId('recipe-card-r1')).not.toBeInTheDocument(); // easy
      expect(screen.queryByTestId('recipe-card-r2')).not.toBeInTheDocument(); // medium
    });

    test('resetting difficulty to all shows all recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('difficulty-hard'));
      expect(screen.queryByTestId('recipe-card-r1')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('difficulty-all'));
      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. Sorting
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Sorting', () => {
    test('sort by rating puts highest rated first', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('sort-rating'));

      const cards = screen.getAllByTestId(/^recipe-card-/);
      // Bolognese (4.9) should be first
      expect(cards[0]).toHaveAttribute('data-testid', 'recipe-card-r3');
    });

    test('sort by quickest puts fastest recipe first', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('sort-quickest'));

      const cards = screen.getAllByTestId(/^recipe-card-/);
      // Iced Matcha Latte (5+0=5min) should be first
      expect(cards[0]).toHaveAttribute('data-testid', 'recipe-card-r9');
    });

    test('sort by popular puts most reviewed first', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('sort-popular'));

      const cards = screen.getAllByTestId(/^recipe-card-/);
      // Bolognese (203 reviews) should be first
      expect(cards[0]).toHaveAttribute('data-testid', 'recipe-card-r3');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. Favorites
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Favorites', () => {
    test('initial favorites are rendered with heart icon', () => {
      render(<HomeScreen />);
      // r1 and r3 start as favorites
      const favBtn1 = screen.getByTestId('fav-btn-r1');
      expect(favBtn1.textContent).toContain('❤️');

      const favBtn2 = screen.getByTestId('fav-btn-r2');
      expect(favBtn2.textContent).toContain('🤍');
    });

    test('toggling favorite changes heart icon', () => {
      render(<HomeScreen />);
      const favBtn = screen.getByTestId('fav-btn-r2');
      expect(favBtn.textContent).toContain('🤍');

      fireEvent.click(favBtn);
      expect(favBtn.textContent).toContain('❤️');

      fireEvent.click(favBtn);
      expect(favBtn.textContent).toContain('🤍');
    });

    test('favorites tab shows only favorited recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-favorites'));

      // r1 and r3 are favorites
      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r3')).toBeInTheDocument();
      // r2 is not a favorite
      expect(screen.queryByTestId('recipe-card-r2')).not.toBeInTheDocument();
    });

    test('un-favoriting removes from favorites tab', () => {
      render(<HomeScreen />);
      // First unfavorite r1 from the main tab
      fireEvent.click(screen.getByTestId('fav-btn-r1'));

      // Now switch to favorites tab
      fireEvent.click(screen.getByTestId('tab-favorites'));
      expect(screen.queryByTestId('recipe-card-r1')).not.toBeInTheDocument();
      expect(screen.getByTestId('recipe-card-r3')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. Recipe Detail
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Recipe Detail View', () => {
    test('clicking a recipe card opens the detail view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('by Chef Maria')).toBeInTheDocument();
    });

    test('back button returns to recipe list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByTestId('recipe-detail')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('back-btn'));
      expect(screen.queryByTestId('recipe-detail')).not.toBeInTheDocument();
      expect(screen.getByTestId('home-screen')).toBeInTheDocument();
    });

    test('displays recipe ingredients', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      expect(screen.getByTestId('ingredient-i1')).toBeInTheDocument();
      expect(screen.getByText('All-purpose flour')).toBeInTheDocument();
      expect(screen.getByText('Buttermilk')).toBeInTheDocument();
    });

    test('displays recipe steps', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      expect(screen.getByTestId('step-s1')).toBeInTheDocument();
      expect(screen.getByTestId('step-s2')).toBeInTheDocument();
      expect(screen.getByText(/Mix flour, sugar, baking powder/)).toBeInTheDocument();
    });

    test('toggling a step marks it as complete', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      const step = screen.getByTestId('step-s1');
      fireEvent.click(step);
      // After click, step should show check mark
      expect(step.textContent).toContain('✓');
    });

    test('favorite can be toggled from detail view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r2'));

      const detailFavBtn = screen.getByTestId('detail-fav-btn-r2');
      expect(detailFavBtn.textContent).toContain('🤍');

      fireEvent.click(detailFavBtn);
      expect(detailFavBtn.textContent).toContain('❤️');
    });

    test('displays tags section', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      expect(screen.getByText('#vegetarian')).toBeInTheDocument();
      expect(screen.getByText('#kid-friendly')).toBeInTheDocument();
      expect(screen.getByText('#quick')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. Serving Adjuster
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Serving Adjuster', () => {
    test('default serving display shows original servings', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      const display = screen.getByTestId('serving-display');
      expect(display.textContent).toContain('4 servings');
    });

    test('increasing servings updates the display', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      fireEvent.click(screen.getByTestId('increase-servings'));
      const display = screen.getByTestId('serving-display');
      expect(display.textContent).toContain('6 servings'); // 4 * 1.5
    });

    test('decreasing servings updates the display', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      fireEvent.click(screen.getByTestId('decrease-servings'));
      const display = screen.getByTestId('serving-display');
      expect(display.textContent).toContain('2 servings'); // 4 * 0.5
    });

    test('ingredient amounts scale with serving multiplier', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      // Default: flour is 2 cups
      const ingredientRow = screen.getByTestId('ingredient-i1');
      expect(ingredientRow.textContent).toContain('2');

      // Increase servings (multiplier becomes 1.5)
      fireEvent.click(screen.getByTestId('increase-servings'));
      expect(ingredientRow.textContent).toContain('3');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. Cooking Timer
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Cooking Timer', () => {
    test('timer buttons are shown for steps with timer values', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));

      // Step s4 has timer: 120
      expect(screen.getByTestId('timer-btn-s4')).toBeInTheDocument();
      // Step s1 has no timer
      expect(screen.queryByTestId('timer-btn-s1')).not.toBeInTheDocument();
    });

    test('clicking timer button shows floating timer', () => {
      vi.useFakeTimers();
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      fireEvent.click(screen.getByTestId('timer-btn-s4'));

      expect(screen.getByTestId('floating-timer')).toBeInTheDocument();
      vi.useRealTimers();
    });

    test('stop timer button removes the floating timer', () => {
      vi.useFakeTimers();
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('recipe-card-r1'));
      fireEvent.click(screen.getByTestId('timer-btn-s4'));

      expect(screen.getByTestId('floating-timer')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('stop-timer-btn'));
      expect(screen.queryByTestId('floating-timer')).not.toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 10. Meal Planner
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Meal Planner', () => {
    test('switching to planner tab renders the meal planner', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));

      expect(screen.getByTestId('meal-planner')).toBeInTheDocument();
      expect(screen.getByText('Meal Planner')).toBeInTheDocument();
    });

    test('renders all seven days', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));

      expect(screen.getByTestId('meal-day-Mon')).toBeInTheDocument();
      expect(screen.getByTestId('meal-day-Tue')).toBeInTheDocument();
      expect(screen.getByTestId('meal-day-Wed')).toBeInTheDocument();
      expect(screen.getByTestId('meal-day-Thu')).toBeInTheDocument();
      expect(screen.getByTestId('meal-day-Fri')).toBeInTheDocument();
      expect(screen.getByTestId('meal-day-Sat')).toBeInTheDocument();
      expect(screen.getByTestId('meal-day-Sun')).toBeInTheDocument();
    });

    test('clicking add meal opens the meal picker modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      fireEvent.click(screen.getByTestId('assign-meal-Mon-breakfast'));

      expect(screen.getByTestId('meal-picker-modal')).toBeInTheDocument();
      expect(screen.getByText('Choose a Recipe')).toBeInTheDocument();
    });

    test('selecting a recipe from picker assigns it to the day', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      fireEvent.click(screen.getByTestId('assign-meal-Mon-breakfast'));
      fireEvent.click(screen.getByTestId('pick-recipe-r1'));

      // After assignment, modal should close and meal should appear
      const monDay = screen.getByTestId('meal-day-Mon');
      expect(monDay.textContent).toContain('Classic Pancakes');
    });

    test('removing an assigned meal clears it', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));

      // Assign a meal
      fireEvent.click(screen.getByTestId('assign-meal-Tue-dinner'));
      fireEvent.click(screen.getByTestId('pick-recipe-r3'));
      expect(screen.getByTestId('meal-day-Tue').textContent).toContain('Beef Bolognese');

      // Remove it
      fireEvent.click(screen.getByTestId('remove-meal-Tue-dinner'));
      expect(screen.getByTestId('meal-day-Tue').textContent).not.toContain('Beef Bolognese');
    });

    test('closing meal picker without selection', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-planner'));
      fireEvent.click(screen.getByTestId('assign-meal-Wed-lunch'));
      expect(screen.getByTestId('meal-picker-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('close-meal-picker'));
      expect(screen.queryByTestId('meal-picker-modal')).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 11. Shopping List
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Shopping List', () => {
    test('shopping tab shows empty state initially', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));

      expect(screen.getByTestId('shopping-list')).toBeInTheDocument();
      expect(screen.getByTestId('empty-shopping')).toBeInTheDocument();
    });

    test('add custom item button opens modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      fireEvent.click(screen.getByTestId('add-custom-item-btn'));

      expect(screen.getByTestId('add-item-modal')).toBeInTheDocument();
    });

    test('adding a custom item appears in the list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      fireEvent.click(screen.getByTestId('add-custom-item-btn'));

      fireEvent.change(screen.getByTestId('new-item-name-input'), { target: { value: 'Milk' } });
      fireEvent.change(screen.getByTestId('new-item-amount-input'), { target: { value: '1 gallon' } });
      fireEvent.click(screen.getByTestId('confirm-add-item'));

      expect(screen.queryByTestId('empty-shopping')).not.toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    test('cancel button closes the add item modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      fireEvent.click(screen.getByTestId('add-custom-item-btn'));
      expect(screen.getByTestId('add-item-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('cancel-add-item'));
      expect(screen.queryByTestId('add-item-modal')).not.toBeInTheDocument();
    });

    test('checking an item and clearing checked items removes them', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-shopping'));
      fireEvent.click(screen.getByTestId('add-custom-item-btn'));

      fireEvent.change(screen.getByTestId('new-item-name-input'), { target: { value: 'Eggs' } });
      fireEvent.click(screen.getByTestId('confirm-add-item'));

      // Find the shopping item and click to check
      const items = screen.getAllByTestId(/^shopping-item-/);
      expect(items.length).toBe(1);
      fireEvent.click(items[0]);

      // Clear checked button should appear
      fireEvent.click(screen.getByTestId('clear-checked-btn'));
      expect(screen.getByTestId('empty-shopping')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 12. Add Ingredients to Shopping List from Recipe Detail
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Add Ingredients to Shopping List', () => {
    test('add-to-shopping button adds ingredients from recipe detail', () => {
      render(<HomeScreen />);
      // Open recipe detail
      fireEvent.click(screen.getByTestId('recipe-card-r9')); // Matcha (5 ingredients)
      fireEvent.click(screen.getByTestId('add-to-shopping-btn'));

      // Navigate back and to shopping
      fireEvent.click(screen.getByTestId('back-btn'));
      fireEvent.click(screen.getByTestId('tab-shopping'));

      expect(screen.queryByTestId('empty-shopping')).not.toBeInTheDocument();
      expect(screen.getByText('Matcha powder')).toBeInTheDocument();
      expect(screen.getByText('Oat milk')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 13. Profile Tab
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Profile', () => {
    test('profile tab renders user info', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));

      expect(screen.getByTestId('profile-tab')).toBeInTheDocument();
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText(/Home cook and food enthusiast/)).toBeInTheDocument();
    });

    test('profile shows stats (recipes, followers, following)', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));

      expect(screen.getByText('Recipes')).toBeInTheDocument();
      expect(screen.getByText('Followers')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
      expect(screen.getByText('47')).toBeInTheDocument();
      expect(screen.getByText('82')).toBeInTheDocument();
    });

    test('edit profile button opens modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      fireEvent.click(screen.getByTestId('edit-profile-btn'));

      expect(screen.getByTestId('edit-profile-modal')).toBeInTheDocument();
    });

    test('saving profile edits updates display', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      fireEvent.click(screen.getByTestId('edit-profile-btn'));

      fireEvent.change(screen.getByTestId('edit-name-input'), { target: { value: 'Alex K. Chen' } });
      fireEvent.click(screen.getByTestId('save-profile-btn'));

      expect(screen.queryByTestId('edit-profile-modal')).not.toBeInTheDocument();
      expect(screen.getByText('Alex K. Chen')).toBeInTheDocument();
    });

    test('cancel edit profile does not save changes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));
      fireEvent.click(screen.getByTestId('edit-profile-btn'));

      fireEvent.change(screen.getByTestId('edit-name-input'), { target: { value: 'New Name' } });
      fireEvent.click(screen.getByTestId('cancel-edit-profile'));

      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.queryByText('New Name')).not.toBeInTheDocument();
    });

    test('profile shows favorites section', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));

      expect(screen.getByTestId('fav-preview-r1')).toBeInTheDocument();
      expect(screen.getByTestId('fav-preview-r3')).toBeInTheDocument();
    });

    test('profile shows dietary preferences', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('tab-profile'));

      expect(screen.getByText('vegetarian-friendly')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 14. Add Recipe Modal
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Add Recipe', () => {
    test('FAB opens the add recipe modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-fab'));

      expect(screen.getByTestId('add-recipe-modal')).toBeInTheDocument();
      expect(screen.getByText('Share a Recipe')).toBeInTheDocument();
    });

    test('submitting a new recipe adds it to the list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-fab'));

      fireEvent.change(screen.getByTestId('new-recipe-title-input'), { target: { value: 'My Custom Soup' } });
      fireEvent.change(screen.getByTestId('new-recipe-prep-input'), { target: { value: '15' } });
      fireEvent.change(screen.getByTestId('new-recipe-cook-input'), { target: { value: '30' } });
      fireEvent.change(screen.getByTestId('new-recipe-servings-input'), { target: { value: '4' } });
      fireEvent.click(screen.getByTestId('submit-recipe-btn'));

      expect(screen.queryByTestId('add-recipe-modal')).not.toBeInTheDocument();
      expect(screen.getByText('My Custom Soup')).toBeInTheDocument();
    });

    test('cancel closes the add recipe modal without adding', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-fab'));

      fireEvent.change(screen.getByTestId('new-recipe-title-input'), { target: { value: 'Should Not Appear' } });
      fireEvent.click(screen.getByTestId('cancel-add-recipe'));

      expect(screen.queryByTestId('add-recipe-modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Should Not Appear')).not.toBeInTheDocument();
    });

    test('selecting a category chip updates the recipe category', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-fab'));

      fireEvent.click(screen.getByTestId('cat-chip-breakfast'));
      fireEvent.change(screen.getByTestId('new-recipe-title-input'), { target: { value: 'Breakfast Item' } });
      fireEvent.click(screen.getByTestId('submit-recipe-btn'));

      // Verify it appears under breakfast category
      fireEvent.click(screen.getByTestId('category-breakfast'));
      expect(screen.getByText('Breakfast Item')).toBeInTheDocument();
    });

    test('selecting a difficulty chip updates the recipe difficulty', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByTestId('add-recipe-fab'));

      fireEvent.click(screen.getByTestId('diff-chip-hard'));
      fireEvent.change(screen.getByTestId('new-recipe-title-input'), { target: { value: 'Hard Recipe' } });
      fireEvent.click(screen.getByTestId('submit-recipe-btn'));

      // Verify it appears under hard difficulty filter
      fireEvent.click(screen.getByTestId('difficulty-hard'));
      expect(screen.getByText('Hard Recipe')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 15. Tab Switching
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Tab Switching', () => {
    test('switching between all tabs preserves state', () => {
      render(<HomeScreen />);

      // Add a search query on recipes tab
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'pancake' } });
      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument();
      expect(screen.queryByTestId('recipe-card-r2')).not.toBeInTheDocument();

      // Switch to planner and back
      fireEvent.click(screen.getByTestId('tab-planner'));
      expect(screen.getByTestId('meal-planner')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('tab-recipes'));
      // Search should still be active
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    test('switching to shopping and back preserves items', () => {
      render(<HomeScreen />);

      // Add a custom item
      fireEvent.click(screen.getByTestId('tab-shopping'));
      fireEvent.click(screen.getByTestId('add-custom-item-btn'));
      fireEvent.change(screen.getByTestId('new-item-name-input'), { target: { value: 'Bread' } });
      fireEvent.click(screen.getByTestId('confirm-add-item'));
      expect(screen.getByText('Bread')).toBeInTheDocument();

      // Switch to recipes and back
      fireEvent.click(screen.getByTestId('tab-recipes'));
      fireEvent.click(screen.getByTestId('tab-shopping'));
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 16. Combined Filters
  // ═══════════════════════════════════════════════════════════════════════════════

  describe('Combined Filters', () => {
    test('category and difficulty filters work together', () => {
      render(<HomeScreen />);

      // Filter to breakfast + easy
      fireEvent.click(screen.getByTestId('category-breakfast'));
      fireEvent.click(screen.getByTestId('difficulty-easy'));

      expect(screen.getByTestId('recipe-card-r1')).toBeInTheDocument(); // breakfast, easy
      expect(screen.getByTestId('recipe-card-r5')).toBeInTheDocument(); // breakfast, easy
      expect(screen.getByTestId('recipe-card-r7')).toBeInTheDocument(); // breakfast, easy
      // No medium/hard breakfast items should appear
    });

    test('search combined with category filter', () => {
      render(<HomeScreen />);

      fireEvent.click(screen.getByTestId('category-dinner'));
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'curry' } });

      expect(screen.getByTestId('recipe-card-r6')).toBeInTheDocument(); // Thai Green Curry
      expect(screen.queryByTestId('recipe-card-r3')).not.toBeInTheDocument(); // Bolognese doesn't match 'curry'
    });
  });
});
