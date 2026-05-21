import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeMealPlanner from './src/app/page.jsx';

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

describe('RecipeMealPlanner Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with MealPlanner title', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText(/MealPlanner/)).toBeInTheDocument();
    });

    test('renders sidebar recipe count', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('8 recipes')).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('My Recipes')).toBeInTheDocument();
      expect(screen.getByText('Meal Plan')).toBeInTheDocument();
      expect(screen.getByText('Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    test('renders search input in header', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByPlaceholderText('Search recipes... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls in header', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by difficulty')).toBeInTheDocument();
    });

    test('renders New Recipe button', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('+ New Recipe')).toBeInTheDocument();
    });

    test('renders recipe cards in grid', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.getByText('Grilled Chicken Caesar Salad')).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.getByText('Thai Green Curry')).toBeInTheDocument();
      expect(screen.getByText('Chocolate Lava Cake')).toBeInTheDocument();
    });

    test('renders recipe count summary', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('8 recipes found')).toBeInTheDocument();
    });

    test('renders sort controls', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('Sort:')).toBeInTheDocument();
      expect(screen.getByText(/Title/)).toBeInTheDocument();
      expect(screen.getByText(/Rating/)).toBeInTheDocument();
      expect(screen.getByText(/Time/)).toBeInTheDocument();
      expect(screen.getByText(/Calories/)).toBeInTheDocument();
    });

    test('renders dietary filter tags', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('vegetarian')).toBeInTheDocument();
      expect(screen.getByText('vegan')).toBeInTheDocument();
      expect(screen.getByText('gluten-free')).toBeInTheDocument();
      expect(screen.getByText('dairy-free')).toBeInTheDocument();
      expect(screen.getByText('keto')).toBeInTheDocument();
      expect(screen.getByText('paleo')).toBeInTheDocument();
    });
  });

  describe('Recipe Card Content', () => {
    test('recipe cards display category badge', () => {
      render(<RecipeMealPlanner />);
      const breakfastBadges = screen.getAllByText('breakfast');
      expect(breakfastBadges.length).toBeGreaterThan(0);
    });

    test('recipe cards display cooking time', () => {
      render(<RecipeMealPlanner />);
      // Avocado toast: 10+5 = 15min
      expect(screen.getByText('⏱ 15min')).toBeInTheDocument();
    });

    test('recipe cards display servings', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('👥 2 servings')).toBeInTheDocument();
    });

    test('recipe cards display calorie count', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('🔥 350 cal')).toBeInTheDocument();
    });

    test('recipe cards display rating', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    test('recipe cards display difficulty', () => {
      render(<RecipeMealPlanner />);
      const easyBadges = screen.getAllByText('easy');
      expect(easyBadges.length).toBeGreaterThan(0);
    });

    test('recipe cards display times cooked', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByText('Cooked 12x')).toBeInTheDocument();
    });

    test('recipe cards show favorite heart icon', () => {
      render(<RecipeMealPlanner />);
      const favoriteButtons = screen.getAllByLabelText(/Favorite/);
      expect(favoriteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<RecipeMealPlanner />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<RecipeMealPlanner />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mealPlannerTheme',
        'dark'
      );
    });

    test('toggling theme twice returns to light mode', () => {
      render(<RecipeMealPlanner />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mealPlannerTheme',
        'light'
      );
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'mealPlannerTheme') return 'dark';
        return null;
      });
      render(<RecipeMealPlanner />);
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search input filters recipes by title', () => {
      render(<RecipeMealPlanner />);
      const searchInput = screen.getByPlaceholderText('Search recipes... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'avocado' } });
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.queryByText('Spaghetti Bolognese')).not.toBeInTheDocument();
    });

    test('search input filters recipes by description', () => {
      render(<RecipeMealPlanner />);
      const searchInput = screen.getByPlaceholderText('Search recipes... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'molten' } });
      expect(screen.getByText('Chocolate Lava Cake')).toBeInTheDocument();
    });

    test('search input filters recipes by ingredient', () => {
      render(<RecipeMealPlanner />);
      const searchInput = screen.getByPlaceholderText('Search recipes... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'quinoa' } });
      expect(screen.getByText('Quinoa Buddha Bowl')).toBeInTheDocument();
      expect(screen.queryByText('Avocado Toast with Poached Eggs')).not.toBeInTheDocument();
    });

    test('clearing search shows all recipes again', () => {
      render(<RecipeMealPlanner />);
      const searchInput = screen.getByPlaceholderText('Search recipes... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'avocado' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });

    test('no results shows empty state', () => {
      render(<RecipeMealPlanner />);
      const searchInput = screen.getByPlaceholderText('Search recipes... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
      expect(screen.getByText('No recipes found')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('filtering by breakfast shows only breakfast recipes', () => {
      render(<RecipeMealPlanner />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'breakfast' } });
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
      expect(screen.queryByText('Spaghetti Bolognese')).not.toBeInTheDocument();
    });

    test('selecting All Categories shows all recipes', () => {
      render(<RecipeMealPlanner />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'breakfast' } });
      fireEvent.change(categoryFilter, { target: { value: 'all' } });
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });
  });

  describe('Difficulty Filter', () => {
    test('filtering by easy shows only easy recipes', () => {
      render(<RecipeMealPlanner />);
      const difficultyFilter = screen.getByLabelText('Filter by difficulty');
      fireEvent.change(difficultyFilter, { target: { value: 'easy' } });
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
      expect(screen.getByText('Berry Protein Smoothie')).toBeInTheDocument();
      expect(screen.getByText('Quinoa Buddha Bowl')).toBeInTheDocument();
      expect(screen.queryByText('Thai Green Curry')).not.toBeInTheDocument();
    });
  });

  describe('Dietary Tag Filters', () => {
    test('clicking vegetarian tag filters recipes', () => {
      render(<RecipeMealPlanner />);
      // Find the vegetarian filter button (not the ones in recipe cards)
      const filterButtons = screen.getAllByText('vegetarian');
      fireEvent.click(filterButtons[0]);
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
      expect(screen.queryByText('Spaghetti Bolognese')).not.toBeInTheDocument();
    });

    test('clicking Clear filters removes dietary tag filters', () => {
      render(<RecipeMealPlanner />);
      const filterButtons = screen.getAllByText('vegetarian');
      fireEvent.click(filterButtons[0]);
      fireEvent.click(screen.getByText('Clear filters'));
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });

    test('multiple dietary tag filters combine with AND logic', () => {
      render(<RecipeMealPlanner />);
      const veganButton = screen.getAllByText('vegan');
      fireEvent.click(veganButton[0]);
      const glutenFreeButton = screen.getAllByText('gluten-free');
      fireEvent.click(glutenFreeButton[0]);
      // Only Quinoa Buddha Bowl is both vegan and gluten-free
      expect(screen.getByText('Quinoa Buddha Bowl')).toBeInTheDocument();
      expect(screen.queryByText('Avocado Toast with Poached Eggs')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    test('clicking Rating sort changes sort order', () => {
      render(<RecipeMealPlanner />);
      const ratingButton = screen.getByText(/Rating/);
      fireEvent.click(ratingButton);
      expect(screen.getByText(/Rating.*↓/)).toBeInTheDocument();
    });

    test('clicking same sort button toggles direction', () => {
      render(<RecipeMealPlanner />);
      const titleButton = screen.getByText(/Title/);
      fireEvent.click(titleButton); // already sorted by title asc, toggles to desc
      expect(screen.getByText(/Title.*↓/)).toBeInTheDocument();
    });
  });

  describe('Favorites', () => {
    test('toggling favorite updates heart icon', () => {
      render(<RecipeMealPlanner />);
      // Find Caesar Salad's favorite button (not favorited)
      const favoriteButton = screen.getByLabelText('Favorite Grilled Chicken Caesar Salad');
      fireEvent.click(favoriteButton);
      // After clicking, it should now be favorited
    });

    test('clicking Favorites view shows only favorited recipes', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Favorites'));
      expect(screen.getByText('Favorite Recipes')).toBeInTheDocument();
      // Avocado toast, Bolognese, Thai Green Curry, Chocolate Lava Cake are favorites
      expect(screen.getByText('Avocado Toast with Poached Eggs')).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.getByText('Thai Green Curry')).toBeInTheDocument();
      expect(screen.getByText('Chocolate Lava Cake')).toBeInTheDocument();
      expect(screen.queryByText('Grilled Chicken Caesar Salad')).not.toBeInTheDocument();
    });
  });

  describe('Recipe Detail Modal', () => {
    test('clicking recipe card opens detail modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Creamy avocado on toasted sourdough topped with perfectly poached eggs.')).toBeInTheDocument();
    });

    test('modal shows prep and cook times', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Prep: 10min')).toBeInTheDocument();
      expect(screen.getByText('Cook: 5min')).toBeInTheDocument();
    });

    test('modal shows servings', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('2 servings')).toBeInTheDocument();
    });

    test('modal shows times cooked', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Cooked 12 times')).toBeInTheDocument();
    });

    test('modal shows ingredients list', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText(/Ingredients/)).toBeInTheDocument();
      expect(screen.getByText('Sourdough bread')).toBeInTheDocument();
      expect(screen.getByText('Avocado')).toBeInTheDocument();
      expect(screen.getByText('Eggs')).toBeInTheDocument();
    });

    test('modal shows instructions', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Instructions')).toBeInTheDocument();
      expect(screen.getByText('Toast the sourdough bread until golden.')).toBeInTheDocument();
      expect(screen.getByText('Sprinkle with red pepper flakes.')).toBeInTheDocument();
    });

    test('modal shows nutrition info', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Nutrition per Serving')).toBeInTheDocument();
    });

    test('modal shows dietary tags', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      const vegetarianTags = screen.getAllByText('vegetarian');
      expect(vegetarianTags.length).toBeGreaterThan(0);
    });

    test('modal shows notes section', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Use ripe avocados for best texture.')).toBeInTheDocument();
    });

    test('modal shows star rating controls', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      const starButtons = screen.getAllByLabelText(/Rate \d star/);
      expect(starButtons.length).toBe(5);
    });

    test('clicking a star updates rating', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      const fiveStar = screen.getByLabelText('Rate 5 stars');
      fireEvent.click(fiveStar);
      expect(screen.getByText('5.0')).toBeInTheDocument();
    });

    test('Mark as Cooked button increments count', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Cooked 12 times')).toBeInTheDocument();
      fireEvent.click(screen.getByText(/Mark as Cooked/));
      expect(screen.getByText('Cooked 13 times')).toBeInTheDocument();
    });

    test('close button closes modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Creamy avocado on toasted sourdough topped with perfectly poached eggs.')).toBeInTheDocument();
      fireEvent.click(screen.getByText('×'));
      expect(screen.queryByText('Creamy avocado on toasted sourdough topped with perfectly poached eggs.')).not.toBeInTheDocument();
    });

    test('Edit button opens edit modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.getByText('Edit Recipe')).toBeInTheDocument();
    });

    test('Delete button triggers confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      fireEvent.click(screen.getByText('Delete'));
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this recipe?'
      );
    });

    test('confirming delete removes recipe', () => {
      window.confirm.mockReturnValue(true);
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      fireEvent.click(screen.getByText('Delete'));
      expect(screen.queryByText('Avocado Toast with Poached Eggs')).not.toBeInTheDocument();
    });

    test('favorite toggle in modal works', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      const favButton = screen.getByLabelText('Toggle favorite');
      fireEvent.click(favButton);
      // After un-favoriting, check the button changed
    });
  });

  describe('Create Recipe Modal', () => {
    test('clicking New Recipe opens create modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('+ New Recipe'));
      expect(screen.getByText('Create New Recipe')).toBeInTheDocument();
    });

    test('create modal has all form fields', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('+ New Recipe'));
      expect(screen.getByText('Recipe Title *')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Servings')).toBeInTheDocument();
      expect(screen.getByText('Prep Time (min)')).toBeInTheDocument();
      expect(screen.getByText('Cook Time (min)')).toBeInTheDocument();
    });

    test('create modal has ingredients and instructions textareas', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('+ New Recipe'));
      expect(screen.getByText(/Ingredients.*one per line/)).toBeInTheDocument();
      expect(screen.getByText(/Instructions.*one step per line/)).toBeInTheDocument();
    });

    test('create modal has dietary tag checkboxes', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('+ New Recipe'));
      expect(screen.getByText('Dietary Tags')).toBeInTheDocument();
    });

    test('create modal has nutrition inputs', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('+ New Recipe'));
      expect(screen.getByText('Nutrition per Serving')).toBeInTheDocument();
    });

    test('cancel button closes create modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('+ New Recipe'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Recipe')).not.toBeInTheDocument();
    });

    test('submitting form creates a new recipe', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('+ New Recipe'));

      const form = screen.getByText('Create New Recipe').closest('div').querySelector('form');
      const titleField = form.querySelector('input[name="title"]');
      fireEvent.change(titleField, { target: { value: 'My Custom Recipe' } });

      fireEvent.click(screen.getByText('Create Recipe'));

      expect(screen.queryByText('Create New Recipe')).not.toBeInTheDocument();
      expect(screen.getByText('My Custom Recipe')).toBeInTheDocument();
    });
  });

  describe('Edit Recipe Modal', () => {
    test('edit modal pre-fills recipe data', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.getByDisplayValue('Avocado Toast with Poached Eggs')).toBeInTheDocument();
    });

    test('saving edit updates recipe', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      fireEvent.click(screen.getByText('Edit'));

      const titleInput = screen.getByDisplayValue('Avocado Toast with Poached Eggs');
      fireEvent.change(titleInput, { target: { value: 'Updated Avocado Toast' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(screen.getByText('Updated Avocado Toast')).toBeInTheDocument();
    });

    test('cancel closes edit modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Edit Recipe')).not.toBeInTheDocument();
    });
  });

  describe('Meal Plan View', () => {
    test('clicking Meal Plan shows the meal plan grid', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      expect(screen.getByText('This Week')).toBeInTheDocument();
    });

    test('meal plan shows days of week columns', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
      expect(screen.getByText('Thursday')).toBeInTheDocument();
      expect(screen.getByText('Friday')).toBeInTheDocument();
      expect(screen.getByText('Saturday')).toBeInTheDocument();
      expect(screen.getByText('Sunday')).toBeInTheDocument();
    });

    test('meal plan shows meal slot rows', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      const breakfastLabels = screen.getAllByText('breakfast');
      expect(breakfastLabels.length).toBeGreaterThan(0);
    });

    test('week navigation prev button works', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      fireEvent.click(screen.getByText('← Prev Week'));
      expect(screen.getByText('1 Week Ago')).toBeInTheDocument();
    });

    test('week navigation next button works', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      fireEvent.click(screen.getByText('Next Week →'));
      expect(screen.getByText('1 Week Ahead')).toBeInTheDocument();
    });

    test('multiple weeks ahead shows plural', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      fireEvent.click(screen.getByText('Next Week →'));
      fireEvent.click(screen.getByText('Next Week →'));
      expect(screen.getByText('2 Weeks Ahead')).toBeInTheDocument();
    });

    test('Generate Shopping List button is present', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      expect(screen.getByText(/Generate Shopping List/)).toBeInTheDocument();
    });

    test('Weekly Nutrition button is present', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      expect(screen.getByText(/Weekly Nutrition/)).toBeInTheDocument();
    });

    test('meal plan has recipe assignment dropdowns', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      const addDropdowns = screen.getAllByLabelText(/Assign recipe to/);
      expect(addDropdowns.length).toBeGreaterThan(0);
    });

    test('assigning recipe to meal slot shows recipe name', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      // Find any "Assign recipe to" dropdown and assign a recipe
      const dropdown = screen.getAllByLabelText(/Assign recipe to Monday breakfast/)[0];
      if (dropdown) {
        // Find a breakfast recipe option
        const options = dropdown.querySelectorAll('option');
        if (options.length > 1) {
          fireEvent.change(dropdown, { target: { value: options[1].value } });
        }
      }
    });
  });

  describe('Shopping List View', () => {
    test('clicking Shopping List shows empty state', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Shopping List'));
      expect(screen.getByText('No shopping list yet')).toBeInTheDocument();
    });

    test('Regenerate button is present', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Shopping List'));
      expect(screen.getByText(/Regenerate/)).toBeInTheDocument();
    });

    test('shopping list shows guidance text', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Shopping List'));
      expect(screen.getByText(/Generate Shopping List/i)).toBeInTheDocument();
    });
  });

  describe('Nutrition View', () => {
    test('clicking Nutrition shows overview', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Nutrition'));
      expect(screen.getByText('Nutrition Overview')).toBeInTheDocument();
    });

    test('shows stat cards', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Nutrition'));
      expect(screen.getByText('Total Recipes')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
      expect(screen.getByText('Times Cooked')).toBeInTheDocument();
      expect(screen.getByText('Avg Rating')).toBeInTheDocument();
    });

    test('shows recipes by category chart', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Nutrition'));
      expect(screen.getByText('Recipes by Category')).toBeInTheDocument();
    });

    test('shows difficulty distribution chart', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Nutrition'));
      expect(screen.getByText('Difficulty Distribution')).toBeInTheDocument();
    });

    test('shows average nutrition section', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Nutrition'));
      expect(screen.getByText('Average Nutrition per Recipe')).toBeInTheDocument();
      expect(screen.getByText('Calories')).toBeInTheDocument();
      expect(screen.getByText('Protein')).toBeInTheDocument();
      expect(screen.getByText('Carbs')).toBeInTheDocument();
      expect(screen.getByText('Fat')).toBeInTheDocument();
      expect(screen.getByText('Fiber')).toBeInTheDocument();
    });

    test('total recipes count is correct', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Nutrition'));
      // 8 total recipes
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    test('favorites count is correct', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Nutrition'));
      // 4 favorites (avocado toast, bolognese, thai curry, lava cake)
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Weekly Nutrition Summary Modal', () => {
    test('Weekly Nutrition button opens modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      fireEvent.click(screen.getByText(/Weekly Nutrition/));
      expect(screen.getByText('Weekly Nutrition Summary')).toBeInTheDocument();
    });

    test('modal shows daily breakdown with all days', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      fireEvent.click(screen.getByText(/Weekly Nutrition/));
      expect(screen.getByText('Daily Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Sunday')).toBeInTheDocument();
    });

    test('close button closes nutrition modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      fireEvent.click(screen.getByText(/Weekly Nutrition/));
      expect(screen.getByText('Weekly Nutrition Summary')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Weekly Nutrition Summary')).not.toBeInTheDocument();
    });

    test('modal shows meals planned count', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      fireEvent.click(screen.getByText(/Weekly Nutrition/));
      expect(screen.getByText(/meals planned this week/)).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes recipe detail modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Avocado Toast with Poached Eggs'));
      expect(screen.getByText('Creamy avocado on toasted sourdough topped with perfectly poached eggs.')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Creamy avocado on toasted sourdough topped with perfectly poached eggs.')).not.toBeInTheDocument();
    });

    test('Escape closes create modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('+ New Recipe'));
      expect(screen.getByText('Create New Recipe')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Recipe')).not.toBeInTheDocument();
    });

    test('Escape closes nutrition summary modal', () => {
      render(<RecipeMealPlanner />);
      fireEvent.click(screen.getByText('Meal Plan'));
      fireEvent.click(screen.getByText(/Weekly Nutrition/));
      expect(screen.getByText('Weekly Nutrition Summary')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Weekly Nutrition Summary')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('recipes are saved to localStorage on change', () => {
      render(<RecipeMealPlanner />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mealPlannerRecipes',
        expect.any(String)
      );
    });

    test('meal plan is saved to localStorage on change', () => {
      render(<RecipeMealPlanner />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mealPlannerPlan',
        expect.any(String)
      );
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'mealPlannerRecipes') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<RecipeMealPlanner />)).not.toThrow();
    });

    test('loads saved recipes from localStorage', () => {
      const savedRecipes = JSON.stringify([
        {
          id: '999', title: 'Custom Saved Recipe', category: 'dinner', difficulty: 'easy',
          prepTime: 10, cookTime: 20, servings: 2, rating: 3.0, timesCooked: 0,
          dietaryTags: [], favorite: false,
          description: 'A custom recipe from localStorage',
          ingredients: [], instructions: [],
          nutrition: { calories: 100, protein: 10, carbs: 10, fat: 5, fiber: 2 },
          createdAt: Date.now(), notes: '',
        },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'mealPlannerRecipes') return savedRecipes;
        return null;
      });
      render(<RecipeMealPlanner />);
      expect(screen.getByText('Custom Saved Recipe')).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    test('search and category filter work together', () => {
      render(<RecipeMealPlanner />);
      const searchInput = screen.getByPlaceholderText('Search recipes... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'oats' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'breakfast' } });
      expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
    });

    test('non-matching combined filters show no recipes', () => {
      render(<RecipeMealPlanner />);
      const searchInput = screen.getByPlaceholderText('Search recipes... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'avocado' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'dessert' } });
      expect(screen.getByText('No recipes found')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<RecipeMealPlanner />)).not.toThrow();
    });
  });
});
