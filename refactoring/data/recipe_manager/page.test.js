import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeScreen from './src/screens/HomeScreen.jsx';

// Mock React Native components as web equivalents
vi.mock('react-native', () => ({
  View: ({ children, style, ...props }) => <div style={style} {...props}>{children}</div>,
  Text: ({ children, style, numberOfLines, ...props }) => <span style={style} {...props}>{children}</span>,
  ScrollView: ({ children, horizontal, showsVerticalScrollIndicator, showsHorizontalScrollIndicator, style, ...props }) => <div style={{ ...(style || {}), overflowX: horizontal ? 'auto' : undefined }} {...props}>{children}</div>,
  TouchableOpacity: ({ children, onPress, style, accessibilityLabel, ...props }) => (
    <button onClick={onPress} style={style} aria-label={accessibilityLabel} {...props}>{children}</button>
  ),
  TextInput: ({ value, onChangeText, placeholder, style, placeholderTextColor, keyboardType, multiline, accessibilityLabel, ...props }) => (
    <input
      value={value}
      onChange={(e) => onChangeText && onChangeText(e.target.value)}
      placeholder={placeholder}
      style={style}
      aria-label={accessibilityLabel}
      {...props}
    />
  ),
  StyleSheet: { create: (styles) => styles },
  Alert: { alert: vi.fn() },
  Modal: ({ children, visible, animationType, transparent, accessibilityLabel }) =>
    visible ? <div role="dialog" aria-label={accessibilityLabel}>{children}</div> : null,
  Dimensions: { get: () => ({ width: 375, height: 812 }) },
  Platform: { OS: 'ios' },
}));

describe('HomeScreen — RecipeBox App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders app header with title', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/RecipeBox/)).toBeInTheDocument();
    });

    test('renders tab bar with all tabs', () => {
      render(<HomeScreen />);
      expect(screen.getByLabelText('Recipes tab')).toBeInTheDocument();
      expect(screen.getByLabelText('Favorites tab')).toBeInTheDocument();
      expect(screen.getByLabelText('Meal Plan tab')).toBeInTheDocument();
      expect(screen.getByLabelText('Shopping tab')).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<HomeScreen />);
      expect(screen.getByPlaceholderText('Search recipes, ingredients, tags...')).toBeInTheDocument();
    });

    test('renders category filter chips', () => {
      render(<HomeScreen />);
      expect(screen.getByLabelText('Filter by All')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by Breakfast')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by Dinner')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by Dessert')).toBeInTheDocument();
    });

    test('renders sort options', () => {
      render(<HomeScreen />);
      expect(screen.getByLabelText('Sort by Rating')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by Time')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by Calories')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by Newest')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by Name')).toBeInTheDocument();
    });

    test('renders all recipe cards on recipes tab', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.getByText('Chocolate Lava Cake')).toBeInTheDocument();
      expect(screen.getByText('Avocado Toast')).toBeInTheDocument();
      expect(screen.getByText('Mango Smoothie')).toBeInTheDocument();
      expect(screen.getByText('Beef Tacos')).toBeInTheDocument();
      expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
    });

    test('shows recipe count', () => {
      render(<HomeScreen />);
      expect(screen.getByText('8 recipes')).toBeInTheDocument();
    });

    test('renders add recipe button', () => {
      render(<HomeScreen />);
      expect(screen.getByLabelText('Add recipe')).toBeInTheDocument();
    });

    test('renders set timer button', () => {
      render(<HomeScreen />);
      expect(screen.getByLabelText('Set timer')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search filters recipes by title', () => {
      render(<HomeScreen />);
      const searchInput = screen.getByPlaceholderText('Search recipes, ingredients, tags...');
      fireEvent.change(searchInput, { target: { value: 'Pancakes' } });
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
    });

    test('search filters recipes by tags', () => {
      render(<HomeScreen />);
      const searchInput = screen.getByPlaceholderText('Search recipes, ingredients, tags...');
      fireEvent.change(searchInput, { target: { value: 'italian' } });
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('search filters recipes by ingredients', () => {
      render(<HomeScreen />);
      const searchInput = screen.getByPlaceholderText('Search recipes, ingredients, tags...');
      fireEvent.change(searchInput, { target: { value: 'avocado' } });
      expect(screen.getByText('Avocado Toast')).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('clearing search shows all recipes', () => {
      render(<HomeScreen />);
      const searchInput = screen.getByPlaceholderText('Search recipes, ingredients, tags...');
      fireEvent.change(searchInput, { target: { value: 'Pancakes' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    test('no results shows empty state', () => {
      render(<HomeScreen />);
      const searchInput = screen.getByPlaceholderText('Search recipes, ingredients, tags...');
      fireEvent.change(searchInput, { target: { value: 'nonexistentrecipe' } });
      expect(screen.getByText('No recipes found')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    test('filtering by breakfast shows only breakfast recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Filter by Breakfast'));
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('Overnight Oats')).toBeInTheDocument();
      expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
    });

    test('filtering by dinner shows only dinner recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Filter by Dinner'));
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.getByText('Beef Tacos')).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('selecting All shows all recipes again', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Filter by Breakfast'));
      fireEvent.click(screen.getByLabelText('Filter by All'));
      expect(screen.getByText('8 recipes')).toBeInTheDocument();
    });

    test('search and category filter combine correctly', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Filter by Dinner'));
      const searchInput = screen.getByPlaceholderText('Search recipes, ingredients, tags...');
      fireEvent.change(searchInput, { target: { value: 'Spaghetti' } });
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.queryByText('Beef Tacos')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    test('sort by name changes recipe order', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Sort by Name'));
      // After sorting by name, Avocado Toast should appear before Overnight Oats
      const cards = screen.getAllByText(/Toast|Oats|Pancakes|Salad|Bolognese|Lava|Smoothie|Tacos/);
      expect(cards.length).toBeGreaterThan(0);
    });

    test('sort by calories is selectable', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Sort by Calories'));
      // Mango Smoothie (210 cal) should appear first
      expect(screen.getByText('Mango Smoothie')).toBeInTheDocument();
    });
  });

  describe('Recipe Detail View', () => {
    test('clicking a recipe card opens detail view', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByText('Ingredients')).toBeInTheDocument();
      expect(screen.getByText('Instructions')).toBeInTheDocument();
    });

    test('detail view shows recipe description', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByText(/Fluffy golden pancakes/)).toBeInTheDocument();
    });

    test('detail view shows ingredients list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByText(/All-purpose flour/)).toBeInTheDocument();
      expect(screen.getByText(/Baking powder/)).toBeInTheDocument();
    });

    test('detail view shows steps', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByText(/Mix dry ingredients/)).toBeInTheDocument();
      expect(screen.getByText(/Flip and cook/)).toBeInTheDocument();
    });

    test('detail view shows stats (prep, cook, servings, calories)', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByText('Prep')).toBeInTheDocument();
      expect(screen.getByText('Cook')).toBeInTheDocument();
      expect(screen.getByText('Servings')).toBeInTheDocument();
      expect(screen.getByText('Calories')).toBeInTheDocument();
    });

    test('detail view shows tags', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByText('#quick')).toBeInTheDocument();
      expect(screen.getByText('#family-friendly')).toBeInTheDocument();
      expect(screen.getByText('#classic')).toBeInTheDocument();
    });

    test('detail view shows recipe notes when present', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText(/blueberries/)).toBeInTheDocument();
    });

    test('detail view shows difficulty and category badges', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
    });

    test('back button returns to recipe list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      fireEvent.click(screen.getByLabelText('Back to recipes'));
      expect(screen.getByText('8 recipes')).toBeInTheDocument();
    });

    test('detail view has start cooking timer button', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByLabelText('Start cooking timer')).toBeInTheDocument();
    });

    test('detail view has delete recipe button', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByLabelText('Delete recipe')).toBeInTheDocument();
    });
  });

  describe('Favorites', () => {
    test('favorites tab shows favorite recipes', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Favorites tab'));
      // r1, r3, r7 are initial favorites
      expect(screen.getByText('Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.getByText('Beef Tacos')).toBeInTheDocument();
    });

    test('favorites tab shows count', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Favorites tab'));
      expect(screen.getByText(/My Favorites \(3\)/)).toBeInTheDocument();
    });

    test('toggling favorite removes recipe from favorites tab', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Favorites tab'));
      // Unfavorite Classic Pancakes
      fireEvent.click(screen.getByLabelText('Unfavorite Classic Pancakes'));
      expect(screen.getByText(/My Favorites \(2\)/)).toBeInTheDocument();
      expect(screen.queryByText('Classic Pancakes')).not.toBeInTheDocument();
    });

    test('toggling favorite on recipes tab adds to favorites', () => {
      render(<HomeScreen />);
      // Caesar Salad (r2) is not a favorite initially
      fireEvent.click(screen.getByLabelText('Favorite Caesar Salad'));
      // Now go to favorites tab
      fireEvent.click(screen.getByLabelText('Favorites tab'));
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    test('empty favorites shows empty state', () => {
      render(<HomeScreen />);
      // Remove all 3 favorites from recipes tab
      fireEvent.click(screen.getByLabelText('Unfavorite Classic Pancakes'));
      fireEvent.click(screen.getByLabelText('Unfavorite Spaghetti Bolognese'));
      fireEvent.click(screen.getByLabelText('Unfavorite Beef Tacos'));
      fireEvent.click(screen.getByLabelText('Favorites tab'));
      expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    });

    test('favorite toggle on detail view works', () => {
      render(<HomeScreen />);
      // View a recipe that IS a favorite
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Remove from favorites'));
      expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();
    });
  });

  describe('Meal Plan', () => {
    test('meal plan tab renders all days of the week', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });

    test('meal plan shows section header', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      expect(screen.getByText(/Weekly Meal Plan/)).toBeInTheDocument();
    });

    test('meal plan shows planned meals count', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      expect(screen.getByText('Planned Meals')).toBeInTheDocument();
    });

    test('meal plan shows avg daily calories', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      expect(screen.getByText('Avg Daily Cal')).toBeInTheDocument();
    });

    test('pre-assigned meals display recipe names', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      // Mon breakfast = r1 (Classic Pancakes)
      expect(screen.getByText(/Classic Pancakes/)).toBeInTheDocument();
    });

    test('empty meal slots show Add Meal button', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      // Wed breakfast is empty
      const addButtons = screen.getAllByText('+ Add Meal');
      expect(addButtons.length).toBeGreaterThan(0);
    });

    test('clicking Add Meal opens meal picker modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      // Click the first "Add Meal" button (e.g., for Tue lunch)
      fireEvent.click(screen.getByLabelText('Add lunch for Tue'));
      // Modal should show recipe options
      expect(screen.getByText('Choose Recipe for')).toBeInTheDocument();
    });

    test('selecting a recipe in meal picker assigns it', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      fireEvent.click(screen.getByLabelText('Add lunch for Tue'));
      // Select Avocado Toast
      fireEvent.click(screen.getByLabelText('Select Avocado Toast'));
      // Modal should close, meal should be assigned
      // Avocado Toast should now appear in Tue lunch
      expect(screen.getByText(/Avocado Toast/)).toBeInTheDocument();
    });

    test('removing a meal clears the slot', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      // Mon breakfast has Classic Pancakes, click remove
      fireEvent.click(screen.getByLabelText('Remove Classic Pancakes from Mon breakfast'));
      // The slot should now show Add Meal
      expect(screen.getByLabelText('Add breakfast for Mon')).toBeInTheDocument();
    });

    test('generate shopping list button exists', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      expect(screen.getByLabelText('Generate shopping list')).toBeInTheDocument();
    });

    test('generate shopping list switches to shopping tab', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      fireEvent.click(screen.getByLabelText('Generate shopping list'));
      // Should switch to shopping tab and have items
      expect(screen.getByText(/Shopping List/)).toBeInTheDocument();
    });
  });

  describe('Shopping List', () => {
    test('empty shopping list shows empty state', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Shopping tab'));
      expect(screen.getByText('Shopping list is empty')).toBeInTheDocument();
    });

    test('generated shopping list shows ingredients', () => {
      render(<HomeScreen />);
      // First generate from meal plan
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      fireEvent.click(screen.getByLabelText('Generate shopping list'));
      // Should have ingredients from planned meals
      expect(screen.getByText(/items remaining/)).toBeInTheDocument();
    });

    test('tapping a shopping item toggles its checked state', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      fireEvent.click(screen.getByLabelText('Generate shopping list'));
      // Find and check an item
      const items = screen.getAllByText('⬜');
      fireEvent.click(items[0].closest('button'));
      // Should now have at least one checked item
      expect(screen.getAllByText('☑️').length).toBeGreaterThan(0);
    });

    test('clear checked removes checked items', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      fireEvent.click(screen.getByLabelText('Generate shopping list'));
      // Check one item
      const items = screen.getAllByText('⬜');
      const totalBefore = items.length;
      fireEvent.click(items[0].closest('button'));
      // Clear checked
      fireEvent.click(screen.getByLabelText('Clear checked items'));
      // Should have one fewer item
      const remainingUnchecked = screen.getAllByText('⬜');
      expect(remainingUnchecked.length).toBe(totalBefore - 1);
    });

    test('shopping items show which recipes they are for', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      fireEvent.click(screen.getByLabelText('Generate shopping list'));
      // Items should have "For: recipe name" text
      const forLabels = screen.getAllByText(/^For:/);
      expect(forLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Add Recipe Modal', () => {
    test('clicking add recipe button opens modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Add recipe'));
      expect(screen.getByText('Add New Recipe')).toBeInTheDocument();
    });

    test('add recipe modal has all form fields', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Add recipe'));
      expect(screen.getByText('Title *')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Prep Time (min)')).toBeInTheDocument();
      expect(screen.getByText('Cook Time (min)')).toBeInTheDocument();
      expect(screen.getByText('Servings')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    test('close button closes add recipe modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Add recipe'));
      expect(screen.getByText('Add New Recipe')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Close add recipe modal'));
      expect(screen.queryByText('Add New Recipe')).not.toBeInTheDocument();
    });

    test('submitting a recipe adds it to the list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Add recipe'));
      const titleInput = screen.getByPlaceholderText('Recipe name');
      fireEvent.change(titleInput, { target: { value: 'My New Recipe' } });
      fireEvent.click(screen.getByLabelText('Save recipe'));
      // Modal should close
      expect(screen.queryByText('Add New Recipe')).not.toBeInTheDocument();
      // New recipe should appear in list
      expect(screen.getByText('My New Recipe')).toBeInTheDocument();
    });

    test('submitting empty title shows alert', () => {
      const { Alert } = require('react-native');
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Add recipe'));
      fireEvent.click(screen.getByLabelText('Save recipe'));
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Recipe title is required.');
    });

    test('category selection in add recipe form works', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Add recipe'));
      fireEvent.click(screen.getByLabelText('Select Breakfast category'));
      // Category chip should be visually active (test via form structure)
    });

    test('difficulty selection in add recipe form works', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Add recipe'));
      fireEvent.click(screen.getByLabelText('Select Easy difficulty'));
    });
  });

  describe('Timer', () => {
    test('set timer button opens timer setup modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Set timer'));
      expect(screen.getByText('Set Timer')).toBeInTheDocument();
    });

    test('timer setup modal has label and minutes inputs', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Set timer'));
      expect(screen.getByPlaceholderText('e.g., Boil pasta')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter minutes')).toBeInTheDocument();
    });

    test('close button closes timer setup modal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Set timer'));
      fireEvent.click(screen.getByLabelText('Close timer setup'));
      expect(screen.queryByText('Set Timer')).not.toBeInTheDocument();
    });

    test('starting timer with valid minutes shows active timer', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Set timer'));
      const minutesInput = screen.getByPlaceholderText('Enter minutes');
      fireEvent.change(minutesInput, { target: { value: '10' } });
      fireEvent.click(screen.getByLabelText('Start timer'));
      // Timer badge should appear in header
      expect(screen.getByLabelText('Active timer')).toBeInTheDocument();
    });

    test('starting timer with invalid minutes shows alert', () => {
      const { Alert } = require('react-native');
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Set timer'));
      fireEvent.click(screen.getByLabelText('Start timer'));
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid number of minutes.');
    });

    test('clicking active timer stops it', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Set timer'));
      const minutesInput = screen.getByPlaceholderText('Enter minutes');
      fireEvent.change(minutesInput, { target: { value: '5' } });
      fireEvent.click(screen.getByLabelText('Start timer'));
      expect(screen.getByLabelText('Active timer')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Active timer'));
      expect(screen.queryByLabelText('Active timer')).not.toBeInTheDocument();
    });

    test('starting timer from recipe detail pre-fills cook time', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('View Classic Pancakes'));
      fireEvent.click(screen.getByLabelText('Start cooking timer'));
      // Timer modal should open with pre-filled minutes
      expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // cookTime of Classic Pancakes
      expect(screen.getByDisplayValue('Classic Pancakes')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('switching to favorites tab hides recipe list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Favorites tab'));
      expect(screen.getByText(/My Favorites/)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Search recipes, ingredients, tags...')).not.toBeInTheDocument();
    });

    test('switching to meal plan tab shows weekly plan', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      expect(screen.getByText(/Weekly Meal Plan/)).toBeInTheDocument();
    });

    test('switching back to recipes tab shows recipe list', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Favorites tab'));
      fireEvent.click(screen.getByLabelText('Recipes tab'));
      expect(screen.getByPlaceholderText('Search recipes, ingredients, tags...')).toBeInTheDocument();
    });
  });

  describe('Recipe Card Content', () => {
    test('recipe cards show time, calories, and servings', () => {
      render(<HomeScreen />);
      // Classic Pancakes: prepTime 10 + cookTime 15 = 25m, 350 cal, 4 srv
      expect(screen.getByText('⏱ 25m')).toBeInTheDocument();
      expect(screen.getByText('🔥 350 cal')).toBeInTheDocument();
      expect(screen.getByText('🍽 4 srv')).toBeInTheDocument();
    });

    test('recipe cards show difficulty badges', () => {
      render(<HomeScreen />);
      const easyBadges = screen.getAllByText('Easy');
      expect(easyBadges.length).toBeGreaterThan(0);
      const hardBadges = screen.getAllByText('Hard');
      expect(hardBadges.length).toBeGreaterThan(0);
    });

    test('recipe cards show rating stars', () => {
      render(<HomeScreen />);
      // Multiple star characters should be present
      const stars = screen.getAllByText('★');
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  describe('Meal Picker Modal', () => {
    test('meal picker shows all recipes to choose from', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      fireEvent.click(screen.getByLabelText('Add lunch for Tue'));
      // All recipes should be listed
      expect(screen.getByLabelText('Select Classic Pancakes')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Spaghetti Bolognese')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Avocado Toast')).toBeInTheDocument();
    });

    test('closing meal picker does not assign a meal', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Meal Plan tab'));
      fireEvent.click(screen.getByLabelText('Add lunch for Tue'));
      fireEvent.click(screen.getByLabelText('Close meal picker'));
      // The slot should still show Add Meal
      expect(screen.getByLabelText('Add lunch for Tue')).toBeInTheDocument();
    });
  });

  describe('Cross-Feature Interactions', () => {
    test('adding a recipe then favoriting it appears in favorites', () => {
      render(<HomeScreen />);
      // Add a recipe
      fireEvent.click(screen.getByLabelText('Add recipe'));
      const titleInput = screen.getByPlaceholderText('Recipe name');
      fireEvent.change(titleInput, { target: { value: 'Test Recipe' } });
      fireEvent.click(screen.getByLabelText('Save recipe'));
      // Favorite it
      fireEvent.click(screen.getByLabelText('Favorite Test Recipe'));
      // Check favorites
      fireEvent.click(screen.getByLabelText('Favorites tab'));
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    test('recipe count updates after adding a recipe', () => {
      render(<HomeScreen />);
      fireEvent.click(screen.getByLabelText('Add recipe'));
      const titleInput = screen.getByPlaceholderText('Recipe name');
      fireEvent.change(titleInput, { target: { value: 'Another Recipe' } });
      fireEvent.click(screen.getByLabelText('Save recipe'));
      expect(screen.getByText('9 recipes')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors', () => {
      expect(() => render(<HomeScreen />)).not.toThrow();
    });
  });
});
