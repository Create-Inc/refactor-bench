import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  FlatList,
  Modal,
} from 'react-native';

// ─── Constants ──────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', icon: '🥞' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: '🍝' },
  { id: 'dessert', label: 'Dessert', icon: '🍰' },
  { id: 'snack', label: 'Snack', icon: '🍿' },
  { id: 'drink', label: 'Drinks', icon: '🥤' },
];

const DIFFICULTY_COLORS = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444',
};

const RECIPES = [
  {
    id: 'r1',
    title: 'Classic Pancakes',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    calories: 350,
    rating: 4.8,
    reviewCount: 124,
    image: '🥞',
    description: 'Fluffy buttermilk pancakes with maple syrup and fresh berries.',
    ingredients: [
      { id: 'i1', name: 'All-purpose flour', amount: '2 cups', checked: false },
      { id: 'i2', name: 'Buttermilk', amount: '1.5 cups', checked: false },
      { id: 'i3', name: 'Eggs', amount: '2 large', checked: false },
      { id: 'i4', name: 'Butter', amount: '3 tbsp', checked: false },
      { id: 'i5', name: 'Sugar', amount: '2 tbsp', checked: false },
      { id: 'i6', name: 'Baking powder', amount: '2 tsp', checked: false },
      { id: 'i7', name: 'Salt', amount: '0.5 tsp', checked: false },
    ],
    steps: [
      'Mix flour, sugar, baking powder, and salt in a large bowl.',
      'Whisk buttermilk, eggs, and melted butter in another bowl.',
      'Combine wet and dry ingredients until just mixed (lumps are okay!).',
      'Heat a griddle over medium heat and lightly butter it.',
      'Pour 1/4 cup batter per pancake. Cook until bubbles form, then flip.',
      'Serve with maple syrup and fresh berries.',
    ],
    tags: ['quick', 'family-friendly', 'classic'],
    createdAt: '2025-01-01',
    isFavorite: true,
  },
  {
    id: 'r2',
    title: 'Caesar Salad',
    category: 'lunch',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 0,
    servings: 2,
    calories: 280,
    rating: 4.5,
    reviewCount: 89,
    image: '🥗',
    description: 'Crisp romaine lettuce with homemade Caesar dressing, croutons, and parmesan.',
    ingredients: [
      { id: 'i8', name: 'Romaine lettuce', amount: '2 heads', checked: false },
      { id: 'i9', name: 'Parmesan cheese', amount: '0.5 cup', checked: false },
      { id: 'i10', name: 'Croutons', amount: '1 cup', checked: false },
      { id: 'i11', name: 'Anchovy paste', amount: '1 tsp', checked: false },
      { id: 'i12', name: 'Lemon juice', amount: '2 tbsp', checked: false },
      { id: 'i13', name: 'Olive oil', amount: '0.25 cup', checked: false },
      { id: 'i14', name: 'Garlic', amount: '2 cloves', checked: false },
    ],
    steps: [
      'Wash and chop romaine lettuce into bite-sized pieces.',
      'Make dressing: blend garlic, anchovy paste, lemon juice, and olive oil.',
      'Toss lettuce with dressing until evenly coated.',
      'Top with shaved parmesan and croutons.',
      'Season with freshly ground black pepper.',
    ],
    tags: ['healthy', 'quick', 'low-carb'],
    createdAt: '2025-01-02',
    isFavorite: false,
  },
  {
    id: 'r3',
    title: 'Spaghetti Carbonara',
    category: 'dinner',
    difficulty: 'medium',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    calories: 520,
    rating: 4.9,
    reviewCount: 203,
    image: '🍝',
    description: 'Traditional Italian pasta with crispy guanciale, eggs, pecorino, and black pepper.',
    ingredients: [
      { id: 'i15', name: 'Spaghetti', amount: '400g', checked: false },
      { id: 'i16', name: 'Guanciale', amount: '200g', checked: false },
      { id: 'i17', name: 'Egg yolks', amount: '4 large', checked: false },
      { id: 'i18', name: 'Pecorino Romano', amount: '1 cup', checked: false },
      { id: 'i19', name: 'Black pepper', amount: '2 tsp', checked: false },
    ],
    steps: [
      'Bring a large pot of salted water to boil. Cook spaghetti al dente.',
      'Cut guanciale into small strips and cook in a cold pan until crispy.',
      'Mix egg yolks, pecorino, and black pepper in a bowl.',
      'Reserve 1 cup pasta water, then drain spaghetti.',
      'Toss hot pasta with guanciale (off heat), then quickly mix in egg mixture.',
      'Add pasta water as needed for a creamy consistency. Serve immediately.',
    ],
    tags: ['italian', 'pasta', 'classic'],
    createdAt: '2025-01-03',
    isFavorite: true,
  },
  {
    id: 'r4',
    title: 'Chocolate Lava Cake',
    category: 'dessert',
    difficulty: 'hard',
    prepTime: 20,
    cookTime: 12,
    servings: 4,
    calories: 480,
    rating: 4.7,
    reviewCount: 156,
    image: '🍫',
    description: 'Decadent individual chocolate cakes with a molten center, served warm.',
    ingredients: [
      { id: 'i20', name: 'Dark chocolate', amount: '200g', checked: false },
      { id: 'i21', name: 'Butter', amount: '100g', checked: false },
      { id: 'i22', name: 'Eggs', amount: '3 large', checked: false },
      { id: 'i23', name: 'Sugar', amount: '0.5 cup', checked: false },
      { id: 'i24', name: 'Flour', amount: '3 tbsp', checked: false },
      { id: 'i25', name: 'Vanilla extract', amount: '1 tsp', checked: false },
    ],
    steps: [
      'Preheat oven to 425°F (220°C). Grease 4 ramekins and dust with cocoa.',
      'Melt chocolate and butter together in a double boiler.',
      'Whisk eggs and sugar until thick and pale, about 3 minutes.',
      'Fold chocolate mixture into egg mixture, then fold in flour and vanilla.',
      'Divide batter among ramekins. Bake 12 minutes until edges are set but center jiggles.',
      'Let cool 1 minute, invert onto plates, and serve immediately.',
    ],
    tags: ['indulgent', 'chocolate', 'dinner-party'],
    createdAt: '2025-01-04',
    isFavorite: false,
  },
  {
    id: 'r5',
    title: 'Avocado Toast',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 5,
    cookTime: 3,
    servings: 1,
    calories: 320,
    rating: 4.3,
    reviewCount: 67,
    image: '🥑',
    description: 'Creamy smashed avocado on toasted sourdough with cherry tomatoes and everything seasoning.',
    ingredients: [
      { id: 'i26', name: 'Sourdough bread', amount: '2 slices', checked: false },
      { id: 'i27', name: 'Avocado', amount: '1 ripe', checked: false },
      { id: 'i28', name: 'Cherry tomatoes', amount: '6', checked: false },
      { id: 'i29', name: 'Lemon juice', amount: '1 tbsp', checked: false },
      { id: 'i30', name: 'Everything seasoning', amount: '1 tsp', checked: false },
      { id: 'i31', name: 'Red pepper flakes', amount: 'pinch', checked: false },
    ],
    steps: [
      'Toast sourdough slices until golden and crispy.',
      'Halve and pit the avocado. Smash with a fork and mix with lemon juice.',
      'Spread avocado mixture on toast.',
      'Halve cherry tomatoes and arrange on top.',
      'Sprinkle with everything seasoning and red pepper flakes.',
    ],
    tags: ['quick', 'healthy', 'trendy'],
    createdAt: '2025-01-05',
    isFavorite: false,
  },
  {
    id: 'r6',
    title: 'Thai Green Curry',
    category: 'dinner',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    calories: 410,
    rating: 4.6,
    reviewCount: 142,
    image: '🍛',
    description: 'Aromatic Thai curry with coconut milk, vegetables, and jasmine rice.',
    ingredients: [
      { id: 'i32', name: 'Green curry paste', amount: '3 tbsp', checked: false },
      { id: 'i33', name: 'Coconut milk', amount: '400ml', checked: false },
      { id: 'i34', name: 'Chicken breast', amount: '500g', checked: false },
      { id: 'i35', name: 'Bamboo shoots', amount: '1 can', checked: false },
      { id: 'i36', name: 'Thai basil', amount: '1 cup', checked: false },
      { id: 'i37', name: 'Fish sauce', amount: '2 tbsp', checked: false },
      { id: 'i38', name: 'Jasmine rice', amount: '2 cups', checked: false },
    ],
    steps: [
      'Cook jasmine rice according to package directions.',
      'Heat a wok over high heat. Fry curry paste for 1 minute until fragrant.',
      'Add half the coconut milk and cook until oil separates.',
      'Add sliced chicken and cook until no longer pink, about 5 minutes.',
      'Add remaining coconut milk, bamboo shoots, and fish sauce. Simmer 15 minutes.',
      'Stir in Thai basil. Serve over jasmine rice.',
    ],
    tags: ['spicy', 'asian', 'coconut'],
    createdAt: '2025-01-06',
    isFavorite: true,
  },
  {
    id: 'r7',
    title: 'Berry Smoothie Bowl',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    calories: 290,
    rating: 4.4,
    reviewCount: 78,
    image: '🫐',
    description: 'Thick and creamy smoothie bowl topped with fresh fruits, granola, and honey.',
    ingredients: [
      { id: 'i39', name: 'Frozen mixed berries', amount: '1.5 cups', checked: false },
      { id: 'i40', name: 'Banana', amount: '1 frozen', checked: false },
      { id: 'i41', name: 'Greek yogurt', amount: '0.5 cup', checked: false },
      { id: 'i42', name: 'Granola', amount: '0.25 cup', checked: false },
      { id: 'i43', name: 'Honey', amount: '1 tbsp', checked: false },
      { id: 'i44', name: 'Chia seeds', amount: '1 tsp', checked: false },
    ],
    steps: [
      'Blend frozen berries, banana, and yogurt until thick and smooth.',
      'Pour into a bowl (it should be thicker than a regular smoothie).',
      'Top with granola, fresh berries, sliced banana, chia seeds, and honey.',
      'Serve immediately.',
    ],
    tags: ['healthy', 'quick', 'vegan-optional'],
    createdAt: '2025-01-07',
    isFavorite: false,
  },
  {
    id: 'r8',
    title: 'Beef Tacos',
    category: 'lunch',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 380,
    rating: 4.7,
    reviewCount: 198,
    image: '🌮',
    description: 'Seasoned ground beef tacos with fresh salsa, guacamole, and all the fixings.',
    ingredients: [
      { id: 'i45', name: 'Ground beef', amount: '500g', checked: false },
      { id: 'i46', name: 'Taco shells', amount: '8', checked: false },
      { id: 'i47', name: 'Tomatoes', amount: '2 large', checked: false },
      { id: 'i48', name: 'Onion', amount: '1 medium', checked: false },
      { id: 'i49', name: 'Cilantro', amount: '0.5 cup', checked: false },
      { id: 'i50', name: 'Lime', amount: '2', checked: false },
      { id: 'i51', name: 'Taco seasoning', amount: '1 packet', checked: false },
      { id: 'i52', name: 'Sour cream', amount: '0.5 cup', checked: false },
    ],
    steps: [
      'Brown ground beef in a skillet over medium-high heat.',
      'Add taco seasoning and water per package directions. Simmer 5 minutes.',
      'Dice tomatoes, onion, and cilantro. Mix with lime juice for fresh salsa.',
      'Warm taco shells in oven for 2 minutes.',
      'Fill shells with seasoned beef, salsa, sour cream, and cilantro.',
      'Serve with lime wedges.',
    ],
    tags: ['mexican', 'family-friendly', 'quick'],
    createdAt: '2025-01-08',
    isFavorite: false,
  },
  {
    id: 'r9',
    title: 'Mango Lassi',
    category: 'drink',
    difficulty: 'easy',
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    calories: 180,
    rating: 4.6,
    reviewCount: 54,
    image: '🥭',
    description: 'Refreshing Indian yogurt drink with ripe mango, cardamom, and a hint of saffron.',
    ingredients: [
      { id: 'i53', name: 'Ripe mango', amount: '2 cups', checked: false },
      { id: 'i54', name: 'Plain yogurt', amount: '1 cup', checked: false },
      { id: 'i55', name: 'Milk', amount: '0.5 cup', checked: false },
      { id: 'i56', name: 'Sugar', amount: '2 tbsp', checked: false },
      { id: 'i57', name: 'Cardamom', amount: '0.25 tsp', checked: false },
    ],
    steps: [
      'Peel and dice ripe mango.',
      'Blend mango, yogurt, milk, sugar, and cardamom until smooth.',
      'Add ice if desired and blend briefly.',
      'Pour into glasses and garnish with a pinch of cardamom.',
    ],
    tags: ['indian', 'refreshing', 'quick'],
    createdAt: '2025-01-09',
    isFavorite: false,
  },
  {
    id: 'r10',
    title: 'Trail Mix Energy Bites',
    category: 'snack',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 0,
    servings: 12,
    calories: 120,
    rating: 4.2,
    reviewCount: 43,
    image: '🥜',
    description: 'No-bake protein-packed energy bites with oats, peanut butter, and chocolate chips.',
    ingredients: [
      { id: 'i58', name: 'Rolled oats', amount: '1 cup', checked: false },
      { id: 'i59', name: 'Peanut butter', amount: '0.5 cup', checked: false },
      { id: 'i60', name: 'Honey', amount: '0.25 cup', checked: false },
      { id: 'i61', name: 'Chocolate chips', amount: '0.25 cup', checked: false },
      { id: 'i62', name: 'Flax seeds', amount: '2 tbsp', checked: false },
    ],
    steps: [
      'Mix all ingredients in a large bowl until well combined.',
      'Refrigerate mixture for 30 minutes until firm.',
      'Roll into 12 equal-sized balls.',
      'Store in an airtight container in the fridge for up to 1 week.',
    ],
    tags: ['healthy', 'meal-prep', 'no-bake'],
    createdAt: '2025-01-10',
    isFavorite: false,
  },
];

const MEAL_PLAN_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // ── Core state ──
  const [recipes, setRecipes] = useState(RECIPES);
  const [activeTab, setActiveTab] = useState('recipes');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortDirection, setSortDirection] = useState('desc');

  // ── Recipe detail modal ──
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [activeRecipeTab, setActiveRecipeTab] = useState('ingredients');

  // ── Shopping list ──
  const [shoppingList, setShoppingList] = useState([]);
  const [newShoppingItem, setNewShoppingItem] = useState('');
  const [shoppingFilter, setShoppingFilter] = useState('all');

  // ── Meal planner ──
  const [mealPlan, setMealPlan] = useState({});
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showMealPickerModal, setShowMealPickerModal] = useState(false);
  const [mealSlotToFill, setMealSlotToFill] = useState(null);

  // ── Cooking timer ──
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTarget, setTimerTarget] = useState(0);
  const [timerLabel, setTimerLabel] = useState('');
  const timerRef = useRef(null);

  // ── Add recipe form ──
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [newRecipeCategory, setNewRecipeCategory] = useState('breakfast');
  const [newRecipeDifficulty, setNewRecipeDifficulty] = useState('easy');
  const [newRecipePrepTime, setNewRecipePrepTime] = useState('');
  const [newRecipeCookTime, setNewRecipeCookTime] = useState('');
  const [newRecipeServings, setNewRecipeServings] = useState('');
  const [newRecipeDescription, setNewRecipeDescription] = useState('');

  // ── Notes/Reviews ──
  const [recipeNotes, setRecipeNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');

  // ── Timer logic ──
  useEffect(() => {
    if (timerActive && timerSeconds < timerTarget) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev + 1 >= timerTarget) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            Alert.alert('Timer Complete!', `${timerLabel} is done!`);
            return timerTarget;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timerTarget, timerLabel]);

  // ── Filtered & sorted recipes ──
  const filteredRecipes = useMemo(() => {
    let result = recipes;

    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query)) ||
          r.ingredients.some((ing) => ing.name.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'rating') comparison = a.rating - b.rating;
      else if (sortBy === 'prepTime') comparison = (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
      else if (sortBy === 'calories') comparison = a.calories - b.calories;
      else if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [recipes, selectedCategory, searchQuery, sortBy, sortDirection]);

  const favoriteRecipes = useMemo(() => recipes.filter((r) => r.isFavorite), [recipes]);

  // ── Handlers ──
  const toggleFavorite = useCallback((recipeId) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  }, []);

  const openRecipeDetail = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setActiveRecipeTab('ingredients');
    setCurrentNote(recipeNotes[recipe.id] || '');
    setShowRecipeModal(true);
  }, [recipeNotes]);

  const closeRecipeDetail = useCallback(() => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  }, []);

  const addIngredientsToShoppingList = useCallback((recipe) => {
    const newItems = recipe.ingredients.map((ing) => ({
      id: `sl_${Date.now()}_${ing.id}`,
      name: ing.name,
      amount: ing.amount,
      recipeTitle: recipe.title,
      checked: false,
    }));
    setShoppingList((prev) => [...prev, ...newItems]);
    Alert.alert('Added!', `${recipe.ingredients.length} ingredients added to shopping list.`);
  }, []);

  const toggleShoppingItem = useCallback((itemId) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  const removeShoppingItem = useCallback((itemId) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const clearCheckedItems = useCallback(() => {
    setShoppingList((prev) => prev.filter((item) => !item.checked));
  }, []);

  const addManualShoppingItem = useCallback(() => {
    if (!newShoppingItem.trim()) return;
    setShoppingList((prev) => [
      ...prev,
      {
        id: `sl_manual_${Date.now()}`,
        name: newShoppingItem.trim(),
        amount: '',
        recipeTitle: 'Manual',
        checked: false,
      },
    ]);
    setNewShoppingItem('');
  }, [newShoppingItem]);

  const filteredShoppingList = useMemo(() => {
    if (shoppingFilter === 'all') return shoppingList;
    if (shoppingFilter === 'unchecked') return shoppingList.filter((i) => !i.checked);
    if (shoppingFilter === 'checked') return shoppingList.filter((i) => i.checked);
    return shoppingList;
  }, [shoppingList, shoppingFilter]);

  const assignMeal = useCallback((recipe) => {
    if (!mealSlotToFill) return;
    const key = `${selectedDay}_${mealSlotToFill}`;
    setMealPlan((prev) => ({ ...prev, [key]: recipe }));
    setShowMealPickerModal(false);
    setMealSlotToFill(null);
  }, [selectedDay, mealSlotToFill]);

  const removeMeal = useCallback((day, slot) => {
    const key = `${day}_${slot}`;
    setMealPlan((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const startTimer = useCallback((minutes, label) => {
    setTimerSeconds(0);
    setTimerTarget(minutes * 60);
    setTimerLabel(label);
    setTimerActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimerSeconds(0);
    setTimerTarget(0);
    setTimerLabel('');
  }, [stopTimer]);

  const formatTime = useCallback((totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const saveRecipeNote = useCallback(() => {
    if (selectedRecipe) {
      setRecipeNotes((prev) => ({ ...prev, [selectedRecipe.id]: currentNote }));
    }
  }, [selectedRecipe, currentNote]);

  const addNewRecipe = useCallback(() => {
    if (!newRecipeTitle.trim()) {
      Alert.alert('Error', 'Please enter a recipe title.');
      return;
    }
    const newRecipe = {
      id: `r_${Date.now()}`,
      title: newRecipeTitle.trim(),
      category: newRecipeCategory,
      difficulty: newRecipeDifficulty,
      prepTime: parseInt(newRecipePrepTime, 10) || 0,
      cookTime: parseInt(newRecipeCookTime, 10) || 0,
      servings: parseInt(newRecipeServings, 10) || 1,
      calories: 0,
      rating: 0,
      reviewCount: 0,
      image: CATEGORIES.find((c) => c.id === newRecipeCategory)?.icon || '🍽️',
      description: newRecipeDescription.trim() || 'No description',
      ingredients: [],
      steps: [],
      tags: [],
      createdAt: new Date().toISOString().split('T')[0],
      isFavorite: false,
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    setShowAddRecipeModal(false);
    setNewRecipeTitle('');
    setNewRecipeCategory('breakfast');
    setNewRecipeDifficulty('easy');
    setNewRecipePrepTime('');
    setNewRecipeCookTime('');
    setNewRecipeServings('');
    setNewRecipeDescription('');
  }, [newRecipeTitle, newRecipeCategory, newRecipeDifficulty, newRecipePrepTime, newRecipeCookTime, newRecipeServings, newRecipeDescription]);

  const getWeeklyCalories = useMemo(() => {
    let total = 0;
    for (const key of Object.keys(mealPlan)) {
      if (mealPlan[key]) total += mealPlan[key].calories;
    }
    return total;
  }, [mealPlan]);

  const getMealsPlanned = useMemo(() => Object.keys(mealPlan).length, [mealPlan]);

  // ── Render: Tab Bar ──
  const renderTabBar = () => (
    <View style={styles.tabBar} testID="tab-bar">
      {[
        { id: 'recipes', label: 'Recipes', icon: '📖' },
        { id: 'favorites', label: 'Favorites', icon: '❤️' },
        { id: 'shopping', label: 'Shopping', icon: '🛒' },
        { id: 'planner', label: 'Planner', icon: '📅' },
        { id: 'timer', label: 'Timer', icon: '⏱️' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          testID={`tab-${tab.id}`}
          style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Render: Header ──
  const renderHeader = () => (
    <View style={styles.header} testID="header">
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle} testID="app-title">Recipe Box</Text>
          <Text style={styles.headerSubtitle}>
            {recipes.length} recipes | {favoriteRecipes.length} favorites
          </Text>
        </View>
        <TouchableOpacity
          testID="add-recipe-btn"
          style={styles.addButton}
          onPress={() => setShowAddRecipeModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'recipes' && (
        <View style={styles.searchContainer}>
          <TextInput
            testID="search-input"
            style={styles.searchInput}
            placeholder="Search recipes, ingredients, tags..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      )}
    </View>
  );

  // ── Render: Category Filter ──
  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      testID="category-filter"
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          testID={`category-${cat.id}`}
          style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(cat.id)}
        >
          <Text style={styles.categoryIcon}>{cat.icon}</Text>
          <Text style={[styles.categoryLabel, selectedCategory === cat.id && styles.categoryLabelActive]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // ── Render: Sort Controls ──
  const renderSortControls = () => (
    <View style={styles.sortControls} testID="sort-controls">
      <Text style={styles.sortLabel}>Sort by:</Text>
      {[
        { id: 'rating', label: 'Rating' },
        { id: 'prepTime', label: 'Time' },
        { id: 'calories', label: 'Calories' },
        { id: 'title', label: 'Name' },
      ].map((option) => (
        <TouchableOpacity
          key={option.id}
          testID={`sort-${option.id}`}
          style={[styles.sortOption, sortBy === option.id && styles.sortOptionActive]}
          onPress={() => {
            if (sortBy === option.id) {
              setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
            } else {
              setSortBy(option.id);
              setSortDirection('desc');
            }
          }}
        >
          <Text style={[styles.sortOptionText, sortBy === option.id && styles.sortOptionTextActive]}>
            {option.label} {sortBy === option.id ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Render: Recipe Card ──
  const renderRecipeCard = (recipe) => (
    <TouchableOpacity
      key={recipe.id}
      testID={`recipe-${recipe.id}`}
      style={styles.recipeCard}
      onPress={() => openRecipeDetail(recipe)}
    >
      <View style={styles.recipeCardHeader}>
        <Text style={styles.recipeImage}>{recipe.image}</Text>
        <TouchableOpacity
          testID={`favorite-${recipe.id}`}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavorite(recipe.id);
          }}
        >
          <Text style={styles.favoriteIcon}>{recipe.isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Text style={styles.recipeDescription} numberOfLines={2}>
        {recipe.description}
      </Text>
      <View style={styles.recipeMeta}>
        <Text style={styles.recipeMetaItem}>⏱ {recipe.prepTime + recipe.cookTime}m</Text>
        <Text style={styles.recipeMetaItem}>🔥 {recipe.calories} cal</Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: DIFFICULTY_COLORS[recipe.difficulty] },
          ]}
        >
          <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
        </View>
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingText}>{'⭐'.repeat(Math.round(recipe.rating))}</Text>
        <Text style={styles.reviewCount}>({recipe.reviewCount})</Text>
      </View>
      <View style={styles.tagRow}>
        {recipe.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  // ── Render: Recipes Tab ──
  const renderRecipesTab = () => (
    <View testID="recipes-tab">
      {renderCategoryFilter()}
      {renderSortControls()}
      <Text style={styles.resultCount} testID="result-count">
        {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
      </Text>
      <ScrollView style={styles.recipeList} testID="recipe-list">
        {filteredRecipes.map((recipe) => renderRecipeCard(recipe))}
        {filteredRecipes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>Try a different search or category</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ── Render: Favorites Tab ──
  const renderFavoritesTab = () => (
    <View testID="favorites-tab">
      <Text style={styles.sectionTitle}>Your Favorites ({favoriteRecipes.length})</Text>
      <ScrollView style={styles.recipeList}>
        {favoriteRecipes.map((recipe) => renderRecipeCard(recipe))}
        {favoriteRecipes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Tap the heart on any recipe to save it</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ── Render: Shopping List Tab ──
  const renderShoppingTab = () => (
    <View testID="shopping-tab">
      <Text style={styles.sectionTitle}>
        Shopping List ({shoppingList.length} items)
      </Text>
      <View style={styles.shoppingInputRow}>
        <TextInput
          testID="shopping-input"
          style={styles.shoppingInput}
          placeholder="Add item..."
          value={newShoppingItem}
          onChangeText={setNewShoppingItem}
          onSubmitEditing={addManualShoppingItem}
        />
        <TouchableOpacity
          testID="add-shopping-btn"
          style={styles.shoppingAddBtn}
          onPress={addManualShoppingItem}
        >
          <Text style={styles.shoppingAddBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.shoppingFilterRow} testID="shopping-filter">
        {['all', 'unchecked', 'checked'].map((filter) => (
          <TouchableOpacity
            key={filter}
            testID={`shopping-filter-${filter}`}
            style={[styles.shoppingFilterBtn, shoppingFilter === filter && styles.shoppingFilterBtnActive]}
            onPress={() => setShoppingFilter(filter)}
          >
            <Text style={[styles.shoppingFilterText, shoppingFilter === filter && styles.shoppingFilterTextActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        {shoppingList.some((i) => i.checked) && (
          <TouchableOpacity testID="clear-checked-btn" style={styles.clearCheckedBtn} onPress={clearCheckedItems}>
            <Text style={styles.clearCheckedText}>Clear Checked</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.shoppingListContainer}>
        {filteredShoppingList.map((item) => (
          <View key={item.id} testID={`shopping-item-${item.id}`} style={styles.shoppingItem}>
            <TouchableOpacity
              testID={`toggle-shopping-${item.id}`}
              style={styles.shoppingCheckbox}
              onPress={() => toggleShoppingItem(item.id)}
            >
              <Text>{item.checked ? '☑️' : '⬜'}</Text>
            </TouchableOpacity>
            <View style={styles.shoppingItemInfo}>
              <Text style={[styles.shoppingItemName, item.checked && styles.shoppingItemChecked]}>
                {item.name}
              </Text>
              {item.amount ? <Text style={styles.shoppingItemAmount}>{item.amount}</Text> : null}
              <Text style={styles.shoppingItemRecipe}>From: {item.recipeTitle}</Text>
            </View>
            <TouchableOpacity testID={`remove-shopping-${item.id}`} onPress={() => removeShoppingItem(item.id)}>
              <Text style={styles.removeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {filteredShoppingList.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Shopping list is empty</Text>
            <Text style={styles.emptySubtext}>Add items from recipe details or manually above</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ── Render: Meal Planner Tab ──
  const renderPlannerTab = () => (
    <View testID="planner-tab">
      <Text style={styles.sectionTitle}>Weekly Meal Plan</Text>
      <View style={styles.plannerStats} testID="planner-stats">
        <Text style={styles.plannerStatText}>🍽️ {getMealsPlanned} meals planned</Text>
        <Text style={styles.plannerStatText}>🔥 {getWeeklyCalories} total calories</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} testID="day-selector">
        {MEAL_PLAN_DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            testID={`day-${day}`}
            style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.mealSlotList}>
        {MEAL_SLOTS.map((slot) => {
          const key = `${selectedDay}_${slot}`;
          const meal = mealPlan[key];
          return (
            <View key={slot} testID={`meal-slot-${slot}`} style={styles.mealSlot}>
              <Text style={styles.mealSlotLabel}>
                {slot.charAt(0).toUpperCase() + slot.slice(1)}
              </Text>
              {meal ? (
                <View style={styles.mealSlotContent}>
                  <Text style={styles.mealSlotRecipe}>
                    {meal.image} {meal.title}
                  </Text>
                  <Text style={styles.mealSlotCalories}>{meal.calories} cal</Text>
                  <TouchableOpacity
                    testID={`remove-meal-${slot}`}
                    onPress={() => removeMeal(selectedDay, slot)}
                  >
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  testID={`add-meal-${slot}`}
                  style={styles.addMealBtn}
                  onPress={() => {
                    setMealSlotToFill(slot);
                    setShowMealPickerModal(true);
                  }}
                >
                  <Text style={styles.addMealBtnText}>+ Add Meal</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  // ── Render: Timer Tab ──
  const renderTimerTab = () => (
    <View testID="timer-tab" style={styles.timerContainer}>
      <Text style={styles.sectionTitle}>Cooking Timer</Text>
      <View style={styles.timerDisplay} testID="timer-display">
        <Text style={styles.timerTime} testID="timer-value">
          {formatTime(timerActive || timerSeconds > 0 ? timerTarget - timerSeconds : 0)}
        </Text>
        {timerLabel ? <Text style={styles.timerLabelText} testID="timer-label">{timerLabel}</Text> : null}
        <View style={styles.timerProgress}>
          <View
            style={[
              styles.timerProgressBar,
              { width: timerTarget > 0 ? `${(timerSeconds / timerTarget) * 100}%` : '0%' },
            ]}
          />
        </View>
      </View>
      <View style={styles.timerControls}>
        {!timerActive && timerSeconds === 0 && (
          <View style={styles.timerPresets} testID="timer-presets">
            <Text style={styles.timerPresetsLabel}>Quick Start:</Text>
            {[
              { min: 1, label: '1 min' },
              { min: 5, label: '5 min' },
              { min: 10, label: '10 min' },
              { min: 15, label: '15 min' },
              { min: 30, label: '30 min' },
              { min: 60, label: '60 min' },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.min}
                testID={`timer-preset-${preset.min}`}
                style={styles.timerPresetBtn}
                onPress={() => startTimer(preset.min, `${preset.label} timer`)}
              >
                <Text style={styles.timerPresetText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {timerActive && (
          <TouchableOpacity testID="timer-stop-btn" style={styles.timerStopBtn} onPress={stopTimer}>
            <Text style={styles.timerBtnText}>⏸ Pause</Text>
          </TouchableOpacity>
        )}
        {!timerActive && timerSeconds > 0 && timerSeconds < timerTarget && (
          <View style={styles.timerResumeRow}>
            <TouchableOpacity
              testID="timer-resume-btn"
              style={styles.timerResumeBtn}
              onPress={() => setTimerActive(true)}
            >
              <Text style={styles.timerBtnText}>▶ Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="timer-reset-btn" style={styles.timerResetBtn} onPress={resetTimer}>
              <Text style={styles.timerBtnText}>↺ Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {selectedRecipe && (
        <View style={styles.recipeTimerSection} testID="recipe-timer-section">
          <Text style={styles.recipeTimerTitle}>Timer for: {selectedRecipe.title}</Text>
          <View style={styles.recipeTimerButtons}>
            <TouchableOpacity
              testID="timer-prep-btn"
              style={styles.recipeTimerBtn}
              onPress={() => startTimer(selectedRecipe.prepTime, `${selectedRecipe.title} - Prep`)}
            >
              <Text style={styles.recipeTimerBtnText}>
                Prep ({selectedRecipe.prepTime}m)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="timer-cook-btn"
              style={styles.recipeTimerBtn}
              onPress={() => startTimer(selectedRecipe.cookTime, `${selectedRecipe.title} - Cook`)}
            >
              <Text style={styles.recipeTimerBtnText}>
                Cook ({selectedRecipe.cookTime}m)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  // ── Render: Recipe Detail Modal ──
  const renderRecipeDetailModal = () => {
    if (!selectedRecipe) return null;
    return (
      <Modal visible={showRecipeModal} animationType="slide" testID="recipe-detail-modal">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity testID="close-recipe-modal" onPress={closeRecipeDetail}>
              <Text style={styles.modalCloseBtn}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID={`modal-favorite-${selectedRecipe.id}`}
              onPress={() => toggleFavorite(selectedRecipe.id)}
            >
              <Text style={styles.modalFavoriteBtn}>
                {selectedRecipe.isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalRecipeImage}>{selectedRecipe.image}</Text>
            <Text style={styles.modalRecipeTitle} testID="modal-recipe-title">
              {selectedRecipe.title}
            </Text>
            <Text style={styles.modalRecipeDescription}>{selectedRecipe.description}</Text>

            <View style={styles.modalMetaRow}>
              <View style={styles.modalMetaItem}>
                <Text style={styles.modalMetaValue}>{selectedRecipe.prepTime}m</Text>
                <Text style={styles.modalMetaLabel}>Prep</Text>
              </View>
              <View style={styles.modalMetaItem}>
                <Text style={styles.modalMetaValue}>{selectedRecipe.cookTime}m</Text>
                <Text style={styles.modalMetaLabel}>Cook</Text>
              </View>
              <View style={styles.modalMetaItem}>
                <Text style={styles.modalMetaValue}>{selectedRecipe.servings}</Text>
                <Text style={styles.modalMetaLabel}>Servings</Text>
              </View>
              <View style={styles.modalMetaItem}>
                <Text style={styles.modalMetaValue}>{selectedRecipe.calories}</Text>
                <Text style={styles.modalMetaLabel}>Calories</Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              <Text style={styles.modalRating}>
                {'⭐'.repeat(Math.round(selectedRecipe.rating))} {selectedRecipe.rating.toFixed(1)}
              </Text>
              <Text style={styles.modalReviewCount}>({selectedRecipe.reviewCount} reviews)</Text>
            </View>

            <View style={styles.modalTabRow} testID="recipe-detail-tabs">
              {['ingredients', 'steps', 'notes'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  testID={`recipe-tab-${tab}`}
                  style={[styles.modalTab, activeRecipeTab === tab && styles.modalTabActive]}
                  onPress={() => setActiveRecipeTab(tab)}
                >
                  <Text style={[styles.modalTabText, activeRecipeTab === tab && styles.modalTabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeRecipeTab === 'ingredients' && (
              <View testID="ingredients-section">
                <View style={styles.ingredientHeader}>
                  <Text style={styles.ingredientTitle}>
                    Ingredients ({selectedRecipe.ingredients.length})
                  </Text>
                  <TouchableOpacity
                    testID="add-to-shopping-btn"
                    style={styles.addToShoppingBtn}
                    onPress={() => addIngredientsToShoppingList(selectedRecipe)}
                  >
                    <Text style={styles.addToShoppingBtnText}>🛒 Add All to List</Text>
                  </TouchableOpacity>
                </View>
                {selectedRecipe.ingredients.map((ing) => (
                  <View key={ing.id} testID={`ingredient-${ing.id}`} style={styles.ingredientRow}>
                    <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                    <Text style={styles.ingredientName}>{ing.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeRecipeTab === 'steps' && (
              <View testID="steps-section">
                <Text style={styles.stepsTitle}>Steps ({selectedRecipe.steps.length})</Text>
                {selectedRecipe.steps.map((step, index) => (
                  <View key={index} testID={`step-${index}`} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
                <View style={styles.timerShortcuts}>
                  <Text style={styles.timerShortcutsTitle}>Quick Timers</Text>
                  <View style={styles.timerShortcutRow}>
                    <TouchableOpacity
                      testID="quick-timer-prep"
                      style={styles.timerShortcutBtn}
                      onPress={() => startTimer(selectedRecipe.prepTime, `${selectedRecipe.title} - Prep`)}
                    >
                      <Text style={styles.timerShortcutText}>⏱ Prep ({selectedRecipe.prepTime}m)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      testID="quick-timer-cook"
                      style={styles.timerShortcutBtn}
                      onPress={() => startTimer(selectedRecipe.cookTime, `${selectedRecipe.title} - Cook`)}
                    >
                      <Text style={styles.timerShortcutText}>⏱ Cook ({selectedRecipe.cookTime}m)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {activeRecipeTab === 'notes' && (
              <View testID="notes-section">
                <Text style={styles.notesTitle}>My Notes</Text>
                <TextInput
                  testID="notes-input"
                  style={styles.notesInput}
                  multiline
                  placeholder="Add your notes about this recipe..."
                  value={currentNote}
                  onChangeText={setCurrentNote}
                />
                <TouchableOpacity testID="save-notes-btn" style={styles.saveNotesBtn} onPress={saveRecipeNote}>
                  <Text style={styles.saveNotesBtnText}>Save Note</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // ── Render: Meal Picker Modal ──
  const renderMealPickerModal = () => (
    <Modal visible={showMealPickerModal} animationType="slide" testID="meal-picker-modal">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity testID="close-meal-picker" onPress={() => setShowMealPickerModal(false)}>
            <Text style={styles.modalCloseBtn}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            Pick a meal for {selectedDay} {mealSlotToFill}
          </Text>
        </View>
        <ScrollView style={styles.mealPickerList} testID="meal-picker-list">
          {recipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              testID={`pick-meal-${recipe.id}`}
              style={styles.mealPickerItem}
              onPress={() => assignMeal(recipe)}
            >
              <Text style={styles.mealPickerIcon}>{recipe.image}</Text>
              <View style={styles.mealPickerInfo}>
                <Text style={styles.mealPickerTitle}>{recipe.title}</Text>
                <Text style={styles.mealPickerMeta}>
                  {recipe.calories} cal | {recipe.prepTime + recipe.cookTime}m
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  // ── Render: Add Recipe Modal ──
  const renderAddRecipeModal = () => (
    <Modal visible={showAddRecipeModal} animationType="slide" testID="add-recipe-modal">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity testID="close-add-recipe" onPress={() => setShowAddRecipeModal(false)}>
            <Text style={styles.modalCloseBtn}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add New Recipe</Text>
        </View>
        <ScrollView style={styles.addRecipeForm} testID="add-recipe-form">
          <Text style={styles.formLabel}>Title *</Text>
          <TextInput
            testID="input-recipe-title"
            style={styles.formInput}
            placeholder="Recipe title"
            value={newRecipeTitle}
            onChangeText={setNewRecipeTitle}
          />

          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            testID="input-recipe-description"
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Brief description..."
            value={newRecipeDescription}
            onChangeText={setNewRecipeDescription}
            multiline
          />

          <Text style={styles.formLabel}>Category</Text>
          <View style={styles.formCategoryRow} testID="category-selector">
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <TouchableOpacity
                key={cat.id}
                testID={`select-category-${cat.id}`}
                style={[styles.formCategoryChip, newRecipeCategory === cat.id && styles.formCategoryChipActive]}
                onPress={() => setNewRecipeCategory(cat.id)}
              >
                <Text>{cat.icon} {cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Difficulty</Text>
          <View style={styles.formDifficultyRow} testID="difficulty-selector">
            {['easy', 'medium', 'hard'].map((diff) => (
              <TouchableOpacity
                key={diff}
                testID={`select-difficulty-${diff}`}
                style={[
                  styles.formDifficultyChip,
                  newRecipeDifficulty === diff && {
                    backgroundColor: DIFFICULTY_COLORS[diff],
                  },
                ]}
                onPress={() => setNewRecipeDifficulty(diff)}
              >
                <Text style={styles.formDifficultyText}>{diff}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Prep Time (min)</Text>
              <TextInput
                testID="input-prep-time"
                style={styles.formInput}
                placeholder="10"
                keyboardType="numeric"
                value={newRecipePrepTime}
                onChangeText={setNewRecipePrepTime}
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Cook Time (min)</Text>
              <TextInput
                testID="input-cook-time"
                style={styles.formInput}
                placeholder="20"
                keyboardType="numeric"
                value={newRecipeCookTime}
                onChangeText={setNewRecipeCookTime}
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Servings</Text>
              <TextInput
                testID="input-servings"
                style={styles.formInput}
                placeholder="4"
                keyboardType="numeric"
                value={newRecipeServings}
                onChangeText={setNewRecipeServings}
              />
            </View>
          </View>

          <TouchableOpacity testID="save-recipe-btn" style={styles.saveRecipeBtn} onPress={addNewRecipe}>
            <Text style={styles.saveRecipeBtnText}>Save Recipe</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  // ── Main render ──
  return (
    <View style={styles.container} testID="home-screen">
      {renderHeader()}
      <View style={styles.content}>
        {activeTab === 'recipes' && renderRecipesTab()}
        {activeTab === 'favorites' && renderFavoritesTab()}
        {activeTab === 'shopping' && renderShoppingTab()}
        {activeTab === 'planner' && renderPlannerTab()}
        {activeTab === 'timer' && renderTimerTab()}
      </View>
      {renderTabBar()}
      {renderRecipeDetailModal()}
      {renderMealPickerModal()}
      {renderAddRecipeModal()}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, paddingHorizontal: 16 },

  // Header
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 24, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 14, color: '#888', marginTop: 2 },
  addButton: { backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  searchContainer: { marginTop: 12 },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#333' },

  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: Platform.OS === 'ios' ? 24 : 8, paddingTop: 8 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabItemActive: { borderTopWidth: 2, borderTopColor: '#FF6B35' },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  tabLabelActive: { color: '#FF6B35', fontWeight: '600' },

  // Category Filter
  categoryScroll: { marginTop: 12, marginBottom: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  categoryChipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  categoryIcon: { fontSize: 16, marginRight: 4 },
  categoryLabel: { fontSize: 13, color: '#555' },
  categoryLabelActive: { color: '#fff', fontWeight: '600' },

  // Sort Controls
  sortControls: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
  sortLabel: { fontSize: 13, color: '#888', marginRight: 8 },
  sortOption: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6, backgroundColor: '#f0f0f0' },
  sortOptionActive: { backgroundColor: '#FF6B35' },
  sortOptionText: { fontSize: 12, color: '#555' },
  sortOptionTextActive: { color: '#fff', fontWeight: '600' },

  // Recipe Card
  recipeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  recipeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recipeImage: { fontSize: 40 },
  favoriteIcon: { fontSize: 24 },
  recipeTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  recipeDescription: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 18 },
  recipeMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  recipeMetaItem: { fontSize: 12, color: '#888', marginRight: 12 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  difficultyText: { fontSize: 11, color: '#fff', fontWeight: '600', textTransform: 'capitalize' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { fontSize: 14 },
  reviewCount: { fontSize: 12, color: '#888', marginLeft: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagChip: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginTop: 4 },
  tagText: { fontSize: 11, color: '#666' },

  // Result count
  resultCount: { fontSize: 13, color: '#888', marginBottom: 8 },

  // Recipe List
  recipeList: { flex: 1 },

  // Section Title
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginTop: 12, marginBottom: 12 },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#888' },

  // Shopping List
  shoppingInputRow: { flexDirection: 'row', marginBottom: 8 },
  shoppingInput: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  shoppingAddBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  shoppingAddBtnText: { color: '#fff', fontWeight: '600' },
  shoppingFilterRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  shoppingFilterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0', marginRight: 8 },
  shoppingFilterBtnActive: { backgroundColor: '#FF6B35' },
  shoppingFilterText: { fontSize: 13, color: '#555' },
  shoppingFilterTextActive: { color: '#fff', fontWeight: '600' },
  clearCheckedBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fee2e2' },
  clearCheckedText: { fontSize: 13, color: '#dc2626', fontWeight: '600' },
  shoppingListContainer: { flex: 1 },
  shoppingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6 },
  shoppingCheckbox: { marginRight: 12 },
  shoppingItemInfo: { flex: 1 },
  shoppingItemName: { fontSize: 15, color: '#333', fontWeight: '500' },
  shoppingItemChecked: { textDecorationLine: 'line-through', color: '#999' },
  shoppingItemAmount: { fontSize: 12, color: '#888', marginTop: 2 },
  shoppingItemRecipe: { fontSize: 11, color: '#aaa', marginTop: 2 },
  removeBtn: { fontSize: 18, color: '#999', paddingHorizontal: 8 },

  // Meal Planner
  plannerStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 12 },
  plannerStatText: { fontSize: 14, color: '#555' },
  dayScroll: { marginBottom: 12 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  dayChipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  dayChipText: { fontSize: 14, color: '#555', fontWeight: '500' },
  dayChipTextActive: { color: '#fff' },
  mealSlotList: { flex: 1 },
  mealSlot: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  mealSlotLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, textTransform: 'capitalize' },
  mealSlotContent: { flexDirection: 'row', alignItems: 'center' },
  mealSlotRecipe: { flex: 1, fontSize: 14, color: '#555' },
  mealSlotCalories: { fontSize: 12, color: '#888', marginRight: 8 },
  addMealBtn: { borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  addMealBtnText: { fontSize: 14, color: '#888' },

  // Timer
  timerContainer: { flex: 1, alignItems: 'center', paddingTop: 20 },
  timerDisplay: { alignItems: 'center', marginBottom: 24 },
  timerTime: { fontSize: 64, fontWeight: '200', color: '#1a1a1a', fontVariant: ['tabular-nums'] },
  timerLabelText: { fontSize: 16, color: '#888', marginTop: 4 },
  timerProgress: { width: SCREEN_WIDTH - 80, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, marginTop: 16 },
  timerProgressBar: { height: 6, backgroundColor: '#FF6B35', borderRadius: 3 },
  timerControls: { alignItems: 'center' },
  timerPresets: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  timerPresetsLabel: { width: '100%', textAlign: 'center', fontSize: 14, color: '#888', marginBottom: 8 },
  timerPresetBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FF6B35', borderRadius: 20, margin: 4 },
  timerPresetText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  timerStopBtn: { backgroundColor: '#ef4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  timerResumeRow: { flexDirection: 'row' },
  timerResumeBtn: { backgroundColor: '#22c55e', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginRight: 8 },
  timerResetBtn: { backgroundColor: '#888', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  timerBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  recipeTimerSection: { marginTop: 32, alignItems: 'center' },
  recipeTimerTitle: { fontSize: 14, color: '#888', marginBottom: 8 },
  recipeTimerButtons: { flexDirection: 'row' },
  recipeTimerBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 4 },
  recipeTimerBtnText: { fontSize: 13, color: '#555' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 56 : 24, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalCloseBtn: { fontSize: 16, color: '#FF6B35', fontWeight: '600' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  modalFavoriteBtn: { fontSize: 24 },
  modalBody: { flex: 1, padding: 16 },
  modalRecipeImage: { fontSize: 64, textAlign: 'center', marginBottom: 12 },
  modalRecipeTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center' },
  modalRecipeDescription: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 16, lineHeight: 20 },
  modalMetaRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 16 },
  modalMetaItem: { alignItems: 'center' },
  modalMetaValue: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  modalMetaLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  modalRating: { fontSize: 16, marginRight: 4 },
  modalReviewCount: { fontSize: 14, color: '#888' },
  modalTabRow: { flexDirection: 'row', marginTop: 16, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  modalTabActive: { borderBottomWidth: 2, borderBottomColor: '#FF6B35' },
  modalTabText: { fontSize: 14, color: '#888' },
  modalTabTextActive: { color: '#FF6B35', fontWeight: '600' },

  // Ingredients
  ingredientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ingredientTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  addToShoppingBtn: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addToShoppingBtnText: { fontSize: 13, color: '#2e7d32', fontWeight: '600' },
  ingredientRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ingredientAmount: { width: 80, fontSize: 14, color: '#FF6B35', fontWeight: '600' },
  ingredientName: { flex: 1, fontSize: 14, color: '#333' },

  // Steps
  stepsTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  stepRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepNumberText: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
  stepText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },
  timerShortcuts: { marginTop: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 12 },
  timerShortcutsTitle: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  timerShortcutRow: { flexDirection: 'row' },
  timerShortcutBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8 },
  timerShortcutText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Notes
  notesTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  notesInput: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12, fontSize: 14, color: '#333', minHeight: 120, textAlignVertical: 'top' },
  saveNotesBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  saveNotesBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  // Meal Picker
  mealPickerList: { flex: 1, padding: 16 },
  mealPickerItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 8 },
  mealPickerIcon: { fontSize: 32, marginRight: 12 },
  mealPickerInfo: { flex: 1 },
  mealPickerTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  mealPickerMeta: { fontSize: 12, color: '#888', marginTop: 2 },

  // Add Recipe Form
  addRecipeForm: { flex: 1, padding: 16 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  formInput: { backgroundColor: '#f8f9fa', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee' },
  formTextArea: { minHeight: 80, textAlignVertical: 'top' },
  formCategoryRow: { flexDirection: 'row', flexWrap: 'wrap' },
  formCategoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0', marginRight: 8, marginBottom: 8 },
  formCategoryChipActive: { backgroundColor: '#FF6B35' },
  formDifficultyRow: { flexDirection: 'row' },
  formDifficultyChip: { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f0f0f0', marginRight: 8, alignItems: 'center' },
  formDifficultyText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  formRow: { flexDirection: 'row', marginTop: 8 },
  formCol: { flex: 1, marginRight: 8 },
  saveRecipeBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveRecipeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
