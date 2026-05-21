import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Platform,
} from 'react-native';

// ─── Constants & Mock Data ──────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', icon: '🥞' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: '🍝' },
  { id: 'dessert', label: 'Dessert', icon: '🍰' },
  { id: 'snack', label: 'Snack', icon: '🍿' },
  { id: 'drink', label: 'Drink', icon: '🥤' },
];

const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy', color: '#22c55e' },
  medium: { label: 'Medium', color: '#eab308' },
  hard: { label: 'Hard', color: '#ef4444' },
};

const INITIAL_RECIPES = [
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
    description: 'Fluffy golden pancakes perfect for a lazy weekend morning. Serve with maple syrup and fresh berries.',
    ingredients: [
      { id: 'i1', name: 'All-purpose flour', amount: '1.5 cups', checked: false },
      { id: 'i2', name: 'Milk', amount: '1.25 cups', checked: false },
      { id: 'i3', name: 'Egg', amount: '1 large', checked: false },
      { id: 'i4', name: 'Butter (melted)', amount: '3 tbsp', checked: false },
      { id: 'i5', name: 'Sugar', amount: '2 tbsp', checked: false },
      { id: 'i6', name: 'Baking powder', amount: '2 tsp', checked: false },
      { id: 'i7', name: 'Salt', amount: '0.5 tsp', checked: false },
    ],
    steps: [
      'Mix dry ingredients (flour, sugar, baking powder, salt) in a large bowl.',
      'Whisk wet ingredients (milk, egg, melted butter) separately.',
      'Pour wet into dry and stir until just combined — lumps are okay.',
      'Heat a non-stick pan over medium heat and lightly butter it.',
      'Pour 1/4 cup batter per pancake and cook until bubbles form on top.',
      'Flip and cook another 1-2 minutes until golden brown.',
    ],
    tags: ['quick', 'family-friendly', 'classic'],
    createdAt: Date.now() - 86400000 * 30,
    notes: 'Add blueberries to the batter for extra flavor.',
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
    description: 'Crispy romaine lettuce with homemade Caesar dressing, croutons, and freshly shaved Parmesan.',
    ingredients: [
      { id: 'i8', name: 'Romaine lettuce', amount: '1 head', checked: false },
      { id: 'i9', name: 'Parmesan cheese', amount: '0.5 cup', checked: false },
      { id: 'i10', name: 'Croutons', amount: '1 cup', checked: false },
      { id: 'i11', name: 'Lemon juice', amount: '2 tbsp', checked: false },
      { id: 'i12', name: 'Olive oil', amount: '3 tbsp', checked: false },
      { id: 'i13', name: 'Garlic', amount: '2 cloves', checked: false },
      { id: 'i14', name: 'Anchovy paste', amount: '1 tsp', checked: false },
      { id: 'i15', name: 'Dijon mustard', amount: '1 tsp', checked: false },
    ],
    steps: [
      'Wash and chop romaine lettuce into bite-sized pieces.',
      'Whisk together lemon juice, olive oil, minced garlic, anchovy paste, and Dijon mustard for the dressing.',
      'Toss lettuce with dressing until evenly coated.',
      'Top with croutons and shaved Parmesan cheese.',
      'Season with black pepper and serve immediately.',
    ],
    tags: ['healthy', 'no-cook', 'classic'],
    createdAt: Date.now() - 86400000 * 25,
    notes: 'Add grilled chicken for a heartier meal.',
  },
  {
    id: 'r3',
    title: 'Spaghetti Bolognese',
    category: 'dinner',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 45,
    servings: 6,
    calories: 520,
    rating: 4.9,
    reviewCount: 210,
    image: '🍝',
    description: 'A rich and hearty meat sauce slow-simmered with tomatoes, herbs, and red wine over al dente spaghetti.',
    ingredients: [
      { id: 'i16', name: 'Spaghetti', amount: '1 lb', checked: false },
      { id: 'i17', name: 'Ground beef', amount: '1 lb', checked: false },
      { id: 'i18', name: 'Crushed tomatoes', amount: '28 oz can', checked: false },
      { id: 'i19', name: 'Onion', amount: '1 large', checked: false },
      { id: 'i20', name: 'Garlic', amount: '4 cloves', checked: false },
      { id: 'i21', name: 'Red wine', amount: '0.5 cup', checked: false },
      { id: 'i22', name: 'Tomato paste', amount: '2 tbsp', checked: false },
      { id: 'i23', name: 'Italian seasoning', amount: '2 tsp', checked: false },
      { id: 'i24', name: 'Olive oil', amount: '2 tbsp', checked: false },
    ],
    steps: [
      'Heat olive oil in a large pot over medium-high heat.',
      'Brown ground beef, breaking it into small pieces, for about 5 minutes.',
      'Add diced onion and minced garlic, cook until softened.',
      'Stir in tomato paste and cook for 1 minute.',
      'Pour in red wine and let it reduce by half.',
      'Add crushed tomatoes and Italian seasoning.',
      'Simmer on low heat for 30-40 minutes, stirring occasionally.',
      'Meanwhile, cook spaghetti in salted boiling water according to package directions.',
      'Serve sauce over drained pasta and top with Parmesan.',
    ],
    tags: ['italian', 'comfort-food', 'family-friendly'],
    createdAt: Date.now() - 86400000 * 20,
    notes: 'The sauce tastes even better the next day.',
  },
  {
    id: 'r4',
    title: 'Chocolate Lava Cake',
    category: 'dessert',
    difficulty: 'hard',
    prepTime: 20,
    cookTime: 14,
    servings: 4,
    calories: 480,
    rating: 4.7,
    reviewCount: 156,
    image: '🍫',
    description: 'Individual chocolate cakes with a molten center that flows out when cut. A showstopper dinner party dessert.',
    ingredients: [
      { id: 'i25', name: 'Dark chocolate', amount: '6 oz', checked: false },
      { id: 'i26', name: 'Butter', amount: '0.5 cup', checked: false },
      { id: 'i27', name: 'Eggs', amount: '2 large', checked: false },
      { id: 'i28', name: 'Egg yolks', amount: '2', checked: false },
      { id: 'i29', name: 'Sugar', amount: '0.25 cup', checked: false },
      { id: 'i30', name: 'Flour', amount: '2 tbsp', checked: false },
      { id: 'i31', name: 'Vanilla extract', amount: '1 tsp', checked: false },
    ],
    steps: [
      'Preheat oven to 425°F. Butter and flour four 6-oz ramekins.',
      'Melt chocolate and butter together in a double boiler or microwave.',
      'Whisk eggs, egg yolks, and sugar until thick and pale yellow.',
      'Fold melted chocolate mixture into egg mixture.',
      'Gently fold in flour and vanilla extract.',
      'Divide batter among prepared ramekins.',
      'Bake for exactly 12-14 minutes — edges should be set but center jiggly.',
      'Let cool 1 minute, then invert onto plates and serve immediately.',
    ],
    tags: ['chocolate', 'dinner-party', 'impressive'],
    createdAt: Date.now() - 86400000 * 15,
    notes: 'Timing is critical — even 1 minute too long and the center sets.',
  },
  {
    id: 'r5',
    title: 'Avocado Toast',
    category: 'snack',
    difficulty: 'easy',
    prepTime: 5,
    cookTime: 3,
    servings: 1,
    calories: 320,
    rating: 4.3,
    reviewCount: 67,
    image: '🥑',
    description: 'Simple yet satisfying avocado toast with a perfectly soft-boiled egg on top.',
    ingredients: [
      { id: 'i32', name: 'Sourdough bread', amount: '2 slices', checked: false },
      { id: 'i33', name: 'Ripe avocado', amount: '1', checked: false },
      { id: 'i34', name: 'Egg', amount: '1', checked: false },
      { id: 'i35', name: 'Red pepper flakes', amount: 'pinch', checked: false },
      { id: 'i36', name: 'Lemon juice', amount: '1 tsp', checked: false },
      { id: 'i37', name: 'Everything bagel seasoning', amount: '1 tsp', checked: false },
    ],
    steps: [
      'Toast sourdough bread until golden and crispy.',
      'Mash avocado with lemon juice and a pinch of salt.',
      'Spread avocado mixture on toast.',
      'Top with a soft-boiled egg (6 minutes in boiling water).',
      'Sprinkle with red pepper flakes and everything bagel seasoning.',
    ],
    tags: ['quick', 'healthy', 'trendy'],
    createdAt: Date.now() - 86400000 * 10,
    notes: '',
  },
  {
    id: 'r6',
    title: 'Mango Smoothie',
    category: 'drink',
    difficulty: 'easy',
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    calories: 210,
    rating: 4.6,
    reviewCount: 42,
    image: '🥭',
    description: 'Tropical mango smoothie blended with yogurt and a hint of lime. Refreshing on a hot day.',
    ingredients: [
      { id: 'i38', name: 'Frozen mango chunks', amount: '2 cups', checked: false },
      { id: 'i39', name: 'Greek yogurt', amount: '0.5 cup', checked: false },
      { id: 'i40', name: 'Orange juice', amount: '1 cup', checked: false },
      { id: 'i41', name: 'Honey', amount: '1 tbsp', checked: false },
      { id: 'i42', name: 'Lime juice', amount: '1 tbsp', checked: false },
    ],
    steps: [
      'Add frozen mango chunks to a blender.',
      'Pour in orange juice and add Greek yogurt.',
      'Add honey and lime juice.',
      'Blend on high until smooth and creamy.',
      'Pour into glasses and serve immediately.',
    ],
    tags: ['tropical', 'healthy', 'no-cook'],
    createdAt: Date.now() - 86400000 * 5,
    notes: 'Substitute coconut milk for a dairy-free version.',
  },
  {
    id: 'r7',
    title: 'Beef Tacos',
    category: 'dinner',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 440,
    rating: 4.8,
    reviewCount: 178,
    image: '🌮',
    description: 'Seasoned ground beef tacos with fresh toppings — cilantro, onion, lime, and homemade salsa.',
    ingredients: [
      { id: 'i43', name: 'Ground beef', amount: '1 lb', checked: false },
      { id: 'i44', name: 'Corn tortillas', amount: '12 small', checked: false },
      { id: 'i45', name: 'Onion', amount: '1 medium', checked: false },
      { id: 'i46', name: 'Cilantro', amount: '0.5 cup', checked: false },
      { id: 'i47', name: 'Lime', amount: '2', checked: false },
      { id: 'i48', name: 'Chili powder', amount: '2 tbsp', checked: false },
      { id: 'i49', name: 'Cumin', amount: '1 tsp', checked: false },
      { id: 'i50', name: 'Tomatoes', amount: '2 medium', checked: false },
    ],
    steps: [
      'Brown ground beef in a skillet over medium-high heat.',
      'Add chili powder, cumin, salt, and pepper. Stir to combine.',
      'Add a splash of water and simmer for 5 minutes until thickened.',
      'Dice onion, tomatoes, and cilantro for toppings.',
      'Warm tortillas in a dry pan or directly over a gas flame.',
      'Assemble tacos with beef, toppings, and a squeeze of lime.',
    ],
    tags: ['mexican', 'quick', 'family-friendly'],
    createdAt: Date.now() - 86400000 * 3,
    notes: 'Double the meat for taco Tuesday leftovers.',
  },
  {
    id: 'r8',
    title: 'Overnight Oats',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    calories: 380,
    rating: 4.4,
    reviewCount: 95,
    image: '🥣',
    description: 'No-cook overnight oats with chia seeds, berries, and a drizzle of honey. Prep the night before.',
    ingredients: [
      { id: 'i51', name: 'Rolled oats', amount: '0.5 cup', checked: false },
      { id: 'i52', name: 'Milk', amount: '0.5 cup', checked: false },
      { id: 'i53', name: 'Chia seeds', amount: '1 tbsp', checked: false },
      { id: 'i54', name: 'Greek yogurt', amount: '0.25 cup', checked: false },
      { id: 'i55', name: 'Honey', amount: '1 tbsp', checked: false },
      { id: 'i56', name: 'Mixed berries', amount: '0.5 cup', checked: false },
    ],
    steps: [
      'Combine oats, milk, chia seeds, and yogurt in a jar.',
      'Stir well and seal with a lid.',
      'Refrigerate overnight (or at least 4 hours).',
      'In the morning, top with mixed berries and drizzle with honey.',
      'Eat cold or microwave for 1-2 minutes if you prefer warm oats.',
    ],
    tags: ['meal-prep', 'healthy', 'no-cook'],
    createdAt: Date.now() - 86400000 * 1,
    notes: '',
  },
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'];

const INITIAL_MEAL_PLAN = {
  Mon: { breakfast: 'r1', lunch: 'r2', dinner: 'r3' },
  Tue: { breakfast: 'r8', lunch: null, dinner: 'r7' },
  Wed: { breakfast: null, lunch: 'r2', dinner: null },
  Thu: { breakfast: 'r1', lunch: null, dinner: 'r3' },
  Fri: { breakfast: 'r8', lunch: null, dinner: 'r7' },
  Sat: { breakfast: null, lunch: null, dinner: 'r4' },
  Sun: { breakfast: 'r1', lunch: 'r2', dinner: null },
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // Core state
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [favoriteIds, setFavoriteIds] = useState(['r1', 'r3', 'r7']);
  const [activeTab, setActiveTab] = useState('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [mealPlan, setMealPlan] = useState(INITIAL_MEAL_PLAN);
  const [shoppingList, setShoppingList] = useState([]);

  // Filter & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTarget, setTimerTarget] = useState(0);
  const [timerLabel, setTimerLabel] = useState('');
  const timerRef = useRef(null);

  // Modal state
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showMealPicker, setShowMealPicker] = useState(null); // { day, slot }
  const [showTimerSetup, setShowTimerSetup] = useState(false);
  const [timerMinutesInput, setTimerMinutesInput] = useState('');
  const [timerLabelInput, setTimerLabelInput] = useState('');

  // Add recipe form state
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [newRecipeCategory, setNewRecipeCategory] = useState('dinner');
  const [newRecipeDifficulty, setNewRecipeDifficulty] = useState('medium');
  const [newRecipePrepTime, setNewRecipePrepTime] = useState('');
  const [newRecipeCookTime, setNewRecipeCookTime] = useState('');
  const [newRecipeServings, setNewRecipeServings] = useState('');
  const [newRecipeDescription, setNewRecipeDescription] = useState('');

  // Timer effect
  useEffect(() => {
    if (timerActive && timerSeconds < timerTarget) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev + 1 >= timerTarget) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            Alert.alert('Timer Done!', `${timerLabel || 'Your timer'} is complete.`);
            return timerTarget;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timerTarget, timerLabel, timerSeconds]);

  // ─── Computed Values ────────────────────────────────────────────────────────

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'time') return a.prepTime + a.cookTime - (b.prepTime + b.cookTime);
      if (sortBy === 'calories') return a.calories - b.calories;
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [recipes, searchQuery, selectedCategory, sortBy]);

  const favoriteRecipes = useMemo(() => {
    return recipes.filter((r) => favoriteIds.includes(r.id));
  }, [recipes, favoriteIds]);

  const totalMealPlanCalories = useMemo(() => {
    let total = 0;
    Object.values(mealPlan).forEach((day) => {
      Object.values(day).forEach((recipeId) => {
        if (recipeId) {
          const recipe = recipes.find((r) => r.id === recipeId);
          if (recipe) total += recipe.calories;
        }
      });
    });
    return total;
  }, [mealPlan, recipes]);

  const avgDailyCalories = useMemo(() => {
    return Math.round(totalMealPlanCalories / 7);
  }, [totalMealPlanCalories]);

  const plannedMealsCount = useMemo(() => {
    let count = 0;
    Object.values(mealPlan).forEach((day) => {
      Object.values(day).forEach((recipeId) => {
        if (recipeId) count++;
      });
    });
    return count;
  }, [mealPlan]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const toggleFavorite = useCallback(
    (recipeId) => {
      setFavoriteIds((prev) =>
        prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
      );
    },
    []
  );

  const getRecipeById = useCallback(
    (id) => recipes.find((r) => r.id === id),
    [recipes]
  );

  const generateShoppingList = useCallback(() => {
    const ingredientMap = {};
    Object.values(mealPlan).forEach((day) => {
      Object.values(day).forEach((recipeId) => {
        if (recipeId) {
          const recipe = recipes.find((r) => r.id === recipeId);
          if (recipe) {
            recipe.ingredients.forEach((ing) => {
              const key = ing.name.toLowerCase();
              if (!ingredientMap[key]) {
                ingredientMap[key] = {
                  id: `shop-${key.replace(/\s/g, '-')}`,
                  name: ing.name,
                  amount: ing.amount,
                  checked: false,
                  recipes: [recipe.title],
                };
              } else if (!ingredientMap[key].recipes.includes(recipe.title)) {
                ingredientMap[key].recipes.push(recipe.title);
              }
            });
          }
        }
      });
    });
    setShoppingList(Object.values(ingredientMap));
    setActiveTab('shopping');
  }, [mealPlan, recipes]);

  const toggleShoppingItem = useCallback((itemId) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const clearCheckedItems = useCallback(() => {
    setShoppingList((prev) => prev.filter((item) => !item.checked));
  }, []);

  const assignMeal = useCallback(
    (day, slot, recipeId) => {
      setMealPlan((prev) => ({
        ...prev,
        [day]: { ...prev[day], [slot]: recipeId },
      }));
      setShowMealPicker(null);
    },
    []
  );

  const removeMeal = useCallback((day, slot) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: null },
    }));
  }, []);

  const addRecipe = useCallback(() => {
    if (!newRecipeTitle.trim()) {
      Alert.alert('Error', 'Recipe title is required.');
      return;
    }
    const newRecipe = {
      id: `r${Date.now()}`,
      title: newRecipeTitle.trim(),
      category: newRecipeCategory,
      difficulty: newRecipeDifficulty,
      prepTime: parseInt(newRecipePrepTime) || 0,
      cookTime: parseInt(newRecipeCookTime) || 0,
      servings: parseInt(newRecipeServings) || 1,
      calories: 0,
      rating: 0,
      reviewCount: 0,
      image: CATEGORIES.find((c) => c.id === newRecipeCategory)?.icon || '🍽️',
      description: newRecipeDescription.trim(),
      ingredients: [],
      steps: [],
      tags: [],
      createdAt: Date.now(),
      notes: '',
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    setShowAddRecipe(false);
    resetAddRecipeForm();
  }, [
    newRecipeTitle,
    newRecipeCategory,
    newRecipeDifficulty,
    newRecipePrepTime,
    newRecipeCookTime,
    newRecipeServings,
    newRecipeDescription,
  ]);

  const resetAddRecipeForm = useCallback(() => {
    setNewRecipeTitle('');
    setNewRecipeCategory('dinner');
    setNewRecipeDifficulty('medium');
    setNewRecipePrepTime('');
    setNewRecipeCookTime('');
    setNewRecipeServings('');
    setNewRecipeDescription('');
  }, []);

  const deleteRecipe = useCallback(
    (recipeId) => {
      Alert.alert('Delete Recipe', 'Are you sure you want to delete this recipe?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
            setFavoriteIds((prev) => prev.filter((id) => id !== recipeId));
            setSelectedRecipe(null);
            // Also remove from meal plan
            setMealPlan((prev) => {
              const updated = { ...prev };
              Object.keys(updated).forEach((day) => {
                Object.keys(updated[day]).forEach((slot) => {
                  if (updated[day][slot] === recipeId) {
                    updated[day] = { ...updated[day], [slot]: null };
                  }
                });
              });
              return updated;
            });
          },
        },
      ]);
    },
    []
  );

  const startTimer = useCallback(() => {
    const minutes = parseInt(timerMinutesInput);
    if (!minutes || minutes <= 0) {
      Alert.alert('Error', 'Please enter a valid number of minutes.');
      return;
    }
    setTimerTarget(minutes * 60);
    setTimerSeconds(0);
    setTimerLabel(timerLabelInput.trim() || `${minutes} min timer`);
    setTimerActive(true);
    setShowTimerSetup(false);
    setTimerMinutesInput('');
    setTimerLabelInput('');
  }, [timerMinutesInput, timerLabelInput]);

  const stopTimer = useCallback(() => {
    setTimerActive(false);
    setTimerSeconds(0);
    setTimerTarget(0);
    setTimerLabel('');
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTimerDisplay = useCallback(
    (seconds) => {
      const remaining = timerTarget - seconds;
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    [timerTarget]
  );

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db', fontSize: 14 }}>
          ★
        </Text>
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  // ─── Render: Recipe Detail ──────────────────────────────────────────────────

  if (selectedRecipe) {
    const recipe = selectedRecipe;
    const isFavorite = favoriteIds.includes(recipe.id);
    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedRecipe(null)} accessibilityLabel="Back to recipes">
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => toggleFavorite(recipe.id)} accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Text style={{ fontSize: 24 }}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteRecipe(recipe.id)} accessibilityLabel="Delete recipe">
              <Text style={{ fontSize: 24 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.detailImageContainer}>
            <Text style={styles.detailImage}>{recipe.image}</Text>
          </View>

          <View style={styles.detailContent}>
            <View style={styles.detailBadges}>
              <View style={[styles.badge, { backgroundColor: DIFFICULTY_LEVELS[recipe.difficulty].color + '20' }]}>
                <Text style={[styles.badgeText, { color: DIFFICULTY_LEVELS[recipe.difficulty].color }]}>
                  {DIFFICULTY_LEVELS[recipe.difficulty].label}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#6366f120' }]}>
                <Text style={[styles.badgeText, { color: '#6366f1' }]}>
                  {CATEGORIES.find((c) => c.id === recipe.category)?.label}
                </Text>
              </View>
            </View>

            <Text style={styles.detailTitle}>{recipe.title}</Text>
            <Text style={styles.detailDescription}>{recipe.description}</Text>

            <View style={styles.detailStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(recipe.prepTime)}</Text>
                <Text style={styles.statLabel}>Prep</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(recipe.cookTime)}</Text>
                <Text style={styles.statLabel}>Cook</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{recipe.servings}</Text>
                <Text style={styles.statLabel}>Servings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{recipe.calories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              {renderStars(recipe.rating)}
              <Text style={styles.ratingText}>{recipe.rating}</Text>
              <Text style={styles.reviewCount}>({recipe.reviewCount} reviews)</Text>
            </View>

            {/* Ingredients */}
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing) => (
              <View key={ing.id} style={styles.ingredientRow}>
                <Text style={styles.ingredientBullet}>•</Text>
                <Text style={styles.ingredientText}>
                  {ing.amount} {ing.name}
                </Text>
              </View>
            ))}

            {/* Steps */}
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            {/* Notes */}
            {recipe.notes ? (
              <>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{recipe.notes}</Text>
              </>
            ) : null}

            {/* Tags */}
            <View style={styles.tagRow}>
              {recipe.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* Quick Timer */}
            <TouchableOpacity
              style={styles.startTimerButton}
              onPress={() => {
                setTimerMinutesInput(String(recipe.cookTime || recipe.prepTime));
                setTimerLabelInput(recipe.title);
                setShowTimerSetup(true);
              }}
              accessibilityLabel="Start cooking timer"
            >
              <Text style={styles.startTimerText}>⏱️ Start Cooking Timer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Render: Main Tabs ──────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍳 RecipeBox</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {timerActive && (
            <TouchableOpacity onPress={stopTimer} accessibilityLabel="Active timer">
              <Text style={styles.timerBadge}>
                ⏱️ {formatTimerDisplay(timerSeconds)}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowTimerSetup(true)} accessibilityLabel="Set timer">
            <Text style={{ fontSize: 24 }}>⏱️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddRecipe(true)} accessibilityLabel="Add recipe">
            <Text style={{ fontSize: 24 }}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { id: 'recipes', label: 'Recipes', icon: '📖' },
          { id: 'favorites', label: 'Favorites', icon: '❤️' },
          { id: 'mealplan', label: 'Meal Plan', icon: '📅' },
          { id: 'shopping', label: 'Shopping', icon: '🛒' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.id)}
            accessibilityLabel={`${tab.label} tab`}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Recipes Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'recipes' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes, ingredients, tags..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                accessibilityLabel={`Filter by ${cat.label}`}
              >
                <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryChipLabel,
                    selectedCategory === cat.id && styles.categoryChipLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Bar */}
          <View style={styles.sortBar}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            {[
              { id: 'rating', label: 'Rating' },
              { id: 'time', label: 'Time' },
              { id: 'calories', label: 'Calories' },
              { id: 'newest', label: 'Newest' },
              { id: 'name', label: 'Name' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.sortChip, sortBy === option.id && styles.sortChipActive]}
                onPress={() => setSortBy(option.id)}
                accessibilityLabel={`Sort by ${option.label}`}
              >
                <Text
                  style={[
                    styles.sortChipLabel,
                    sortBy === option.id && styles.sortChipLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Results count */}
          <Text style={styles.resultsCount}>{filteredRecipes.length} recipes</Text>

          {/* Recipe Cards */}
          {filteredRecipes.map((recipe) => {
            const isFav = favoriteIds.includes(recipe.id);
            return (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => setSelectedRecipe(recipe)}
                accessibilityLabel={`View ${recipe.title}`}
              >
                <View style={styles.recipeCardHeader}>
                  <Text style={styles.recipeCardImage}>{recipe.image}</Text>
                  <View style={styles.recipeCardInfo}>
                    <Text style={styles.recipeCardTitle}>{recipe.title}</Text>
                    <Text style={styles.recipeCardDesc} numberOfLines={2}>
                      {recipe.description}
                    </Text>
                    <View style={styles.recipeCardMeta}>
                      <Text style={styles.metaText}>
                        ⏱ {formatDuration(recipe.prepTime + recipe.cookTime)}
                      </Text>
                      <Text style={styles.metaText}>🔥 {recipe.calories} cal</Text>
                      <Text style={styles.metaText}>🍽 {recipe.servings} srv</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation && e.stopPropagation();
                      toggleFavorite(recipe.id);
                    }}
                    accessibilityLabel={isFav ? `Unfavorite ${recipe.title}` : `Favorite ${recipe.title}`}
                  >
                    <Text style={{ fontSize: 22 }}>{isFav ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recipeCardFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {renderStars(recipe.rating)}
                    <Text style={styles.ratingSmall}>{recipe.rating}</Text>
                  </View>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: DIFFICULTY_LEVELS[recipe.difficulty].color + '20' },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: DIFFICULTY_LEVELS[recipe.difficulty].color,
                      }}
                    >
                      {DIFFICULTY_LEVELS[recipe.difficulty].label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredRecipes.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No recipes found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ─── Favorites Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'favorites' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>
            ❤️ My Favorites ({favoriteRecipes.length})
          </Text>

          {favoriteRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>❤️</Text>
              <Text style={styles.emptyText}>No favorites yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the heart icon on any recipe to save it here
              </Text>
            </View>
          ) : (
            favoriteRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => setSelectedRecipe(recipe)}
              >
                <View style={styles.recipeCardHeader}>
                  <Text style={styles.recipeCardImage}>{recipe.image}</Text>
                  <View style={styles.recipeCardInfo}>
                    <Text style={styles.recipeCardTitle}>{recipe.title}</Text>
                    <View style={styles.recipeCardMeta}>
                      <Text style={styles.metaText}>
                        ⏱ {formatDuration(recipe.prepTime + recipe.cookTime)}
                      </Text>
                      <Text style={styles.metaText}>🔥 {recipe.calories} cal</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(recipe.id)} accessibilityLabel={`Unfavorite ${recipe.title}`}>
                    <Text style={{ fontSize: 22 }}>❤️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* ─── Meal Plan Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'mealplan' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mealPlanHeader}>
            <Text style={styles.sectionHeader}>📅 Weekly Meal Plan</Text>
            <TouchableOpacity style={styles.generateButton} onPress={generateShoppingList} accessibilityLabel="Generate shopping list">
              <Text style={styles.generateButtonText}>🛒 Generate List</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealPlanStats}>
            <View style={styles.mealPlanStat}>
              <Text style={styles.mealPlanStatValue}>{plannedMealsCount}</Text>
              <Text style={styles.mealPlanStatLabel}>Planned Meals</Text>
            </View>
            <View style={styles.mealPlanStat}>
              <Text style={styles.mealPlanStatValue}>{avgDailyCalories}</Text>
              <Text style={styles.mealPlanStatLabel}>Avg Daily Cal</Text>
            </View>
          </View>

          {DAYS_OF_WEEK.map((day) => (
            <View key={day} style={styles.mealDayCard}>
              <Text style={styles.mealDayTitle}>{day}</Text>
              {MEAL_SLOTS.map((slot) => {
                const recipeId = mealPlan[day][slot];
                const recipe = recipeId ? getRecipeById(recipeId) : null;
                return (
                  <View key={slot} style={styles.mealSlot}>
                    <Text style={styles.mealSlotLabel}>
                      {slot.charAt(0).toUpperCase() + slot.slice(1)}
                    </Text>
                    {recipe ? (
                      <View style={styles.mealSlotContent}>
                        <Text style={styles.mealSlotRecipe}>
                          {recipe.image} {recipe.title}
                        </Text>
                        <Text style={styles.mealSlotCalories}>{recipe.calories} cal</Text>
                        <TouchableOpacity
                          onPress={() => removeMeal(day, slot)}
                          accessibilityLabel={`Remove ${recipe.title} from ${day} ${slot}`}
                        >
                          <Text style={styles.removeMealButton}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addMealButton}
                        onPress={() => setShowMealPicker({ day, slot })}
                        accessibilityLabel={`Add ${slot} for ${day}`}
                      >
                        <Text style={styles.addMealText}>+ Add Meal</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ─── Shopping List Tab ────────────────────────────────────────────────── */}
      {activeTab === 'shopping' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.shoppingHeader}>
            <Text style={styles.sectionHeader}>🛒 Shopping List</Text>
            {shoppingList.some((item) => item.checked) && (
              <TouchableOpacity onPress={clearCheckedItems} accessibilityLabel="Clear checked items">
                <Text style={styles.clearCheckedText}>Clear Checked</Text>
              </TouchableOpacity>
            )}
          </View>

          {shoppingList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>Shopping list is empty</Text>
              <Text style={styles.emptySubtext}>
                Set up your meal plan and tap Generate List
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.shoppingCount}>
                {shoppingList.filter((i) => !i.checked).length} of {shoppingList.length} items
                remaining
              </Text>
              {shoppingList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.shoppingItem}
                  onPress={() => toggleShoppingItem(item.id)}
                  accessibilityLabel={`${item.checked ? 'Uncheck' : 'Check'} ${item.name}`}
                >
                  <Text style={styles.shoppingCheckbox}>{item.checked ? '☑️' : '⬜'}</Text>
                  <View style={styles.shoppingItemInfo}>
                    <Text
                      style={[
                        styles.shoppingItemName,
                        item.checked && styles.shoppingItemChecked,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.shoppingItemAmount}>{item.amount}</Text>
                    <Text style={styles.shoppingItemRecipes}>
                      For: {item.recipes.join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* ─── Add Recipe Modal ────────────────────────────────────────────────── */}
      <Modal visible={showAddRecipe} animationType="slide" transparent accessibilityLabel="Add recipe modal">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Recipe</Text>
              <TouchableOpacity onPress={() => { setShowAddRecipe(false); resetAddRecipeForm(); }} accessibilityLabel="Close add recipe modal">
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                value={newRecipeTitle}
                onChangeText={setNewRecipeTitle}
                placeholder="Recipe name"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.formChipRow}>
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.formChip,
                      newRecipeCategory === cat.id && styles.formChipActive,
                    ]}
                    onPress={() => setNewRecipeCategory(cat.id)}
                    accessibilityLabel={`Select ${cat.label} category`}
                  >
                    <Text style={styles.formChipText}>
                      {cat.icon} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Difficulty</Text>
              <View style={styles.formChipRow}>
                {Object.entries(DIFFICULTY_LEVELS).map(([key, val]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.formChip,
                      newRecipeDifficulty === key && { backgroundColor: val.color + '20', borderColor: val.color },
                    ]}
                    onPress={() => setNewRecipeDifficulty(key)}
                    accessibilityLabel={`Select ${val.label} difficulty`}
                  >
                    <Text style={[styles.formChipText, newRecipeDifficulty === key && { color: val.color }]}>
                      {val.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Prep Time (min)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newRecipePrepTime}
                    onChangeText={setNewRecipePrepTime}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Cook Time (min)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newRecipeCookTime}
                    onChangeText={setNewRecipeCookTime}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Servings</Text>
              <TextInput
                style={styles.formInput}
                value={newRecipeServings}
                onChangeText={setNewRecipeServings}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                value={newRecipeDescription}
                onChangeText={setNewRecipeDescription}
                placeholder="Describe your recipe..."
                placeholderTextColor="#94a3b8"
                multiline
              />

              <TouchableOpacity style={styles.submitButton} onPress={addRecipe} accessibilityLabel="Save recipe">
                <Text style={styles.submitButtonText}>Save Recipe</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Meal Picker Modal ───────────────────────────────────────────────── */}
      <Modal visible={showMealPicker !== null} animationType="slide" transparent accessibilityLabel="Select recipe for meal">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Choose Recipe for{' '}
                {showMealPicker ? `${showMealPicker.day} ${showMealPicker.slot}` : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowMealPicker(null)} accessibilityLabel="Close meal picker">
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {recipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.mealPickerItem}
                  onPress={() =>
                    showMealPicker &&
                    assignMeal(showMealPicker.day, showMealPicker.slot, recipe.id)
                  }
                  accessibilityLabel={`Select ${recipe.title}`}
                >
                  <Text style={styles.mealPickerEmoji}>{recipe.image}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealPickerTitle}>{recipe.title}</Text>
                    <Text style={styles.mealPickerMeta}>
                      {formatDuration(recipe.prepTime + recipe.cookTime)} · {recipe.calories} cal
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Timer Setup Modal ───────────────────────────────────────────────── */}
      <Modal visible={showTimerSetup} animationType="fade" transparent accessibilityLabel="Timer setup modal">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 300 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⏱️ Set Timer</Text>
              <TouchableOpacity onPress={() => setShowTimerSetup(false)} accessibilityLabel="Close timer setup">
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Label (optional)</Text>
            <TextInput
              style={styles.formInput}
              value={timerLabelInput}
              onChangeText={setTimerLabelInput}
              placeholder="e.g., Boil pasta"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.formLabel}>Minutes *</Text>
            <TextInput
              style={styles.formInput}
              value={timerMinutesInput}
              onChangeText={setTimerMinutesInput}
              keyboardType="numeric"
              placeholder="Enter minutes"
              placeholderTextColor="#94a3b8"
            />

            <TouchableOpacity style={styles.submitButton} onPress={startTimer} accessibilityLabel="Start timer">
              <Text style={styles.submitButtonText}>Start Timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  timerBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#6366f1',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  tabLabelActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  categoryChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryChipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryChipLabelActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sortLabel: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 4,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  sortChipLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  sortChipLabelActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  recipeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recipeCardImage: {
    fontSize: 40,
  },
  recipeCardInfo: {
    flex: 1,
  },
  recipeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  recipeCardDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  recipeCardMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  recipeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ratingSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 12,
  },
  // Detail view
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  detailScroll: {
    flex: 1,
  },
  detailImageContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f1f5f9',
  },
  detailImage: {
    fontSize: 80,
  },
  detailContent: {
    padding: 20,
  },
  detailBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 20,
  },
  detailStats: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  reviewCount: {
    fontSize: 13,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 8,
  },
  ingredientBullet: {
    fontSize: 16,
    color: '#6366f1',
    marginTop: 1,
  },
  ingredientText: {
    fontSize: 15,
    color: '#334155',
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 20,
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
  },
  tag: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  startTimerButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  startTimerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Meal Plan
  mealPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  mealPlanStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mealPlanStat: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
  },
  mealPlanStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
  },
  mealPlanStatLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  mealDayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  mealDayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  mealSlot: {
    marginBottom: 10,
  },
  mealSlotLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  mealSlotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  mealSlotRecipe: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  mealSlotCalories: {
    fontSize: 12,
    color: '#94a3b8',
  },
  removeMealButton: {
    fontSize: 16,
    color: '#ef4444',
  },
  addMealButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  addMealText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  // Shopping List
  shoppingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearCheckedText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 16,
  },
  shoppingCount: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  shoppingCheckbox: {
    fontSize: 20,
    marginTop: 2,
  },
  shoppingItemInfo: {
    flex: 1,
  },
  shoppingItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  shoppingItemChecked: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  shoppingItemAmount: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  shoppingItemRecipes: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalClose: {
    fontSize: 20,
    color: '#94a3b8',
    padding: 4,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1e293b',
  },
  formChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  formChipActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  formChipText: {
    fontSize: 13,
    color: '#334155',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formHalf: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Meal Picker
  mealPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  mealPickerEmoji: {
    fontSize: 32,
  },
  mealPickerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  mealPickerMeta: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
});
