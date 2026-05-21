import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage'];

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const DIFFICULTY_COLORS = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444',
};

const DIET_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'];

const MOCK_AUTHORS = [
  { id: 'a1', name: 'Chef Maria', avatar: '👩‍🍳', specialty: 'Italian Cuisine', recipesCount: 24 },
  { id: 'a2', name: 'Chef James', avatar: '👨‍🍳', specialty: 'Asian Fusion', recipesCount: 18 },
  { id: 'a3', name: 'Chef Sofia', avatar: '👩‍🍳', specialty: 'French Pastry', recipesCount: 31 },
  { id: 'a4', name: 'Chef David', avatar: '👨‍🍳', specialty: 'BBQ & Grilling', recipesCount: 15 },
  { id: 'a5', name: 'Chef Aisha', avatar: '👩‍🍳', specialty: 'Healthy Bowls', recipesCount: 22 },
];

const INITIAL_RECIPES = [
  {
    id: 'r1',
    title: 'Classic Margherita Pizza',
    description: 'Authentic Neapolitan pizza with fresh mozzarella, basil, and San Marzano tomato sauce on a perfectly charred thin crust.',
    category: 'dinner',
    difficulty: 'medium',
    author: 'a1',
    prepTime: 30,
    cookTime: 15,
    servings: 4,
    rating: 4.8,
    timesCooked: 342,
    thumbnail: '🍕',
    tags: ['vegetarian', 'italian'],
    createdAt: Date.now() - 86400000 * 90,
    ingredients: [
      { id: 'i1', name: 'Pizza dough', amount: 500, unit: 'g', calories: 270, protein: 9, carbs: 50, fat: 2 },
      { id: 'i2', name: 'San Marzano tomatoes', amount: 400, unit: 'g', calories: 32, protein: 1.6, carbs: 6.4, fat: 0.2 },
      { id: 'i3', name: 'Fresh mozzarella', amount: 250, unit: 'g', calories: 280, protein: 22, carbs: 2.2, fat: 22 },
      { id: 'i4', name: 'Fresh basil leaves', amount: 20, unit: 'g', calories: 1, protein: 0.2, carbs: 0.1, fat: 0 },
      { id: 'i5', name: 'Extra virgin olive oil', amount: 30, unit: 'ml', calories: 240, protein: 0, carbs: 0, fat: 28 },
      { id: 'i6', name: 'Salt', amount: 10, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 },
    ],
    steps: [
      'Preheat oven to 500°F (260°C) with a pizza stone inside for at least 30 minutes.',
      'Crush San Marzano tomatoes by hand, add salt and a drizzle of olive oil.',
      'Stretch the dough on a floured surface into a 12-inch round.',
      'Spread a thin layer of tomato sauce, leaving a 1-inch border.',
      'Tear mozzarella into pieces and distribute evenly over the sauce.',
      'Bake for 12-15 minutes until the crust is charred and cheese is bubbly.',
      'Top with fresh basil leaves and a drizzle of olive oil before serving.',
    ],
  },
  {
    id: 'r2',
    title: 'Teriyaki Salmon Bowl',
    description: 'Glazed salmon over sushi rice with edamame, avocado, pickled ginger, and a drizzle of spicy mayo.',
    category: 'dinner',
    difficulty: 'medium',
    author: 'a2',
    prepTime: 20,
    cookTime: 25,
    servings: 2,
    rating: 4.9,
    timesCooked: 528,
    thumbnail: '🍣',
    tags: ['gluten-free', 'japanese'],
    createdAt: Date.now() - 86400000 * 60,
    ingredients: [
      { id: 'i7', name: 'Salmon fillets', amount: 400, unit: 'g', calories: 416, protein: 46, carbs: 0, fat: 24 },
      { id: 'i8', name: 'Sushi rice', amount: 300, unit: 'g', calories: 390, protein: 8, carbs: 86, fat: 0.6 },
      { id: 'i9', name: 'Soy sauce', amount: 60, unit: 'ml', calories: 10, protein: 1.3, carbs: 1, fat: 0 },
      { id: 'i10', name: 'Mirin', amount: 40, unit: 'ml', calories: 56, protein: 0, carbs: 14, fat: 0 },
      { id: 'i11', name: 'Avocado', amount: 1, unit: 'pcs', calories: 240, protein: 3, carbs: 12, fat: 22 },
      { id: 'i12', name: 'Edamame', amount: 100, unit: 'g', calories: 122, protein: 11, carbs: 10, fat: 5 },
      { id: 'i13', name: 'Sesame seeds', amount: 10, unit: 'g', calories: 57, protein: 2, carbs: 2, fat: 5 },
    ],
    steps: [
      'Rinse sushi rice until water runs clear, then cook according to package directions.',
      'Mix soy sauce and mirin in a saucepan, simmer until slightly thickened for the teriyaki glaze.',
      'Season salmon with salt and pepper, sear skin-side down in a hot pan for 4 minutes.',
      'Flip salmon, brush with teriyaki glaze, and cook for another 3-4 minutes.',
      'Slice avocado and prepare edamame (boil if frozen).',
      'Assemble bowls: rice on the bottom, flaked salmon on top, arrange avocado and edamame.',
      'Drizzle with remaining teriyaki glaze and sprinkle sesame seeds.',
    ],
  },
  {
    id: 'r3',
    title: 'Chocolate Lava Cake',
    description: 'Decadent individual chocolate cakes with a molten center, served warm with vanilla ice cream and fresh berries.',
    category: 'dessert',
    difficulty: 'hard',
    author: 'a3',
    prepTime: 15,
    cookTime: 14,
    servings: 4,
    rating: 4.7,
    timesCooked: 215,
    thumbnail: '🍫',
    tags: ['vegetarian', 'french'],
    createdAt: Date.now() - 86400000 * 45,
    ingredients: [
      { id: 'i14', name: 'Dark chocolate (70%)', amount: 200, unit: 'g', calories: 570, protein: 8, carbs: 46, fat: 42 },
      { id: 'i15', name: 'Unsalted butter', amount: 120, unit: 'g', calories: 860, protein: 1, carbs: 0, fat: 96 },
      { id: 'i16', name: 'Eggs', amount: 4, unit: 'pcs', calories: 312, protein: 24, carbs: 2, fat: 20 },
      { id: 'i17', name: 'Sugar', amount: 100, unit: 'g', calories: 387, protein: 0, carbs: 100, fat: 0 },
      { id: 'i18', name: 'All-purpose flour', amount: 50, unit: 'g', calories: 182, protein: 5, carbs: 38, fat: 0.5 },
      { id: 'i19', name: 'Vanilla extract', amount: 5, unit: 'ml', calories: 12, protein: 0, carbs: 0.5, fat: 0 },
    ],
    steps: [
      'Preheat oven to 425°F (220°C). Butter and flour four 6-oz ramekins.',
      'Melt chocolate and butter together in a double boiler or microwave, stirring until smooth.',
      'Whisk eggs and sugar until thick and pale, about 3 minutes.',
      'Fold the chocolate mixture into the egg mixture gently.',
      'Sift in flour and fold until just combined. Add vanilla extract.',
      'Divide batter among prepared ramekins (about ¾ full).',
      'Bake for exactly 12-14 minutes — edges should be firm but center still jiggly.',
      'Let rest for 1 minute, then invert onto plates. Serve immediately with ice cream.',
    ],
  },
  {
    id: 'r4',
    title: 'Avocado Toast with Poached Eggs',
    description: 'Sourdough toast topped with smashed avocado, perfectly poached eggs, cherry tomatoes, microgreens, and everything bagel seasoning.',
    category: 'breakfast',
    difficulty: 'easy',
    author: 'a5',
    prepTime: 10,
    cookTime: 5,
    servings: 2,
    rating: 4.5,
    timesCooked: 891,
    thumbnail: '🥑',
    tags: ['vegetarian', 'healthy'],
    createdAt: Date.now() - 86400000 * 120,
    ingredients: [
      { id: 'i20', name: 'Sourdough bread', amount: 4, unit: 'slices', calories: 240, protein: 8, carbs: 48, fat: 2 },
      { id: 'i21', name: 'Ripe avocados', amount: 2, unit: 'pcs', calories: 480, protein: 6, carbs: 24, fat: 44 },
      { id: 'i22', name: 'Eggs', amount: 4, unit: 'pcs', calories: 312, protein: 24, carbs: 2, fat: 20 },
      { id: 'i23', name: 'Cherry tomatoes', amount: 100, unit: 'g', calories: 18, protein: 1, carbs: 4, fat: 0 },
      { id: 'i24', name: 'Lemon juice', amount: 15, unit: 'ml', calories: 4, protein: 0, carbs: 1, fat: 0 },
      { id: 'i25', name: 'Red pepper flakes', amount: 2, unit: 'g', calories: 6, protein: 0.3, carbs: 1, fat: 0.3 },
    ],
    steps: [
      'Toast the sourdough bread until golden and crispy.',
      'Halve the avocados, remove the pit, and scoop into a bowl. Add lemon juice, salt, and pepper. Mash with a fork to desired consistency.',
      'Bring a pot of water to a gentle simmer. Add a splash of white vinegar.',
      'Create a gentle whirlpool in the water and carefully crack eggs in one at a time. Poach for 3-4 minutes.',
      'Spread mashed avocado generously on each toast.',
      'Top with poached eggs, halved cherry tomatoes, and microgreens.',
      'Sprinkle with red pepper flakes, everything bagel seasoning, and flaky sea salt.',
    ],
  },
  {
    id: 'r5',
    title: 'Smoked BBQ Brisket',
    description: 'Texas-style slow-smoked beef brisket with a peppery bark, served with coleslaw and pickles.',
    category: 'dinner',
    difficulty: 'hard',
    author: 'a4',
    prepTime: 30,
    cookTime: 720,
    servings: 10,
    rating: 4.9,
    timesCooked: 178,
    thumbnail: '🥩',
    tags: ['keto', 'bbq'],
    createdAt: Date.now() - 86400000 * 30,
    ingredients: [
      { id: 'i26', name: 'Beef brisket', amount: 5000, unit: 'g', calories: 10200, protein: 850, carbs: 0, fat: 750 },
      { id: 'i27', name: 'Coarse black pepper', amount: 60, unit: 'g', calories: 15, protein: 0.6, carbs: 4, fat: 0.2 },
      { id: 'i28', name: 'Kosher salt', amount: 40, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 },
      { id: 'i29', name: 'Garlic powder', amount: 20, unit: 'g', calories: 20, protein: 1, carbs: 4, fat: 0 },
      { id: 'i30', name: 'Onion powder', amount: 15, unit: 'g', calories: 15, protein: 0.5, carbs: 3.5, fat: 0 },
      { id: 'i31', name: 'Oak wood chips', amount: 500, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 },
    ],
    steps: [
      'Trim the brisket, leaving about ¼ inch of fat cap.',
      'Mix pepper, salt, garlic powder, and onion powder. Rub generously over the entire brisket.',
      'Wrap and refrigerate for at least 4 hours, preferably overnight.',
      'Set up smoker at 225°F (107°C) with oak wood chips for smoke.',
      'Place brisket fat-side up on the smoker grate. Smoke for 6 hours without opening.',
      'When the bark has set and internal temp reaches 165°F, wrap tightly in butcher paper.',
      'Return to smoker until internal temperature reaches 203°F (about 4-6 more hours).',
      'Rest the wrapped brisket for at least 1 hour before slicing against the grain.',
    ],
  },
  {
    id: 'r6',
    title: 'Acai Smoothie Bowl',
    description: 'Thick blended acai bowl topped with granola, fresh berries, banana slices, chia seeds, and a drizzle of honey.',
    category: 'breakfast',
    difficulty: 'easy',
    author: 'a5',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    rating: 4.6,
    timesCooked: 1245,
    thumbnail: '🫐',
    tags: ['vegan', 'gluten-free', 'healthy'],
    createdAt: Date.now() - 86400000 * 15,
    ingredients: [
      { id: 'i32', name: 'Frozen acai puree', amount: 200, unit: 'g', calories: 140, protein: 2, carbs: 12, fat: 10 },
      { id: 'i33', name: 'Frozen banana', amount: 1, unit: 'pcs', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
      { id: 'i34', name: 'Almond milk', amount: 80, unit: 'ml', calories: 12, protein: 0.4, carbs: 0.5, fat: 1 },
      { id: 'i35', name: 'Granola', amount: 40, unit: 'g', calories: 180, protein: 4, carbs: 28, fat: 6 },
      { id: 'i36', name: 'Fresh blueberries', amount: 50, unit: 'g', calories: 28, protein: 0.4, carbs: 7, fat: 0.2 },
      { id: 'i37', name: 'Chia seeds', amount: 10, unit: 'g', calories: 49, protein: 2, carbs: 4, fat: 3 },
      { id: 'i38', name: 'Honey', amount: 15, unit: 'ml', calories: 46, protein: 0, carbs: 12, fat: 0 },
    ],
    steps: [
      'Blend frozen acai puree, frozen banana, and almond milk until thick and smooth.',
      'Pour into a bowl — the mixture should be thicker than a regular smoothie.',
      'Arrange toppings: granola on one side, fresh blueberries on another.',
      'Add banana slices and sprinkle chia seeds over the top.',
      'Drizzle with honey and serve immediately before it melts.',
    ],
  },
  {
    id: 'r7',
    title: 'Chicken Caesar Wrap',
    description: 'Grilled chicken with romaine, parmesan, croutons, and creamy caesar dressing wrapped in a warm flour tortilla.',
    category: 'lunch',
    difficulty: 'easy',
    author: 'a2',
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    rating: 4.4,
    timesCooked: 673,
    thumbnail: '🌯',
    tags: ['high-protein'],
    createdAt: Date.now() - 86400000 * 75,
    ingredients: [
      { id: 'i39', name: 'Chicken breast', amount: 300, unit: 'g', calories: 330, protein: 62, carbs: 0, fat: 7 },
      { id: 'i40', name: 'Flour tortillas', amount: 2, unit: 'pcs', calories: 280, protein: 6, carbs: 48, fat: 6 },
      { id: 'i41', name: 'Romaine lettuce', amount: 150, unit: 'g', calories: 8, protein: 0.6, carbs: 1.5, fat: 0.1 },
      { id: 'i42', name: 'Parmesan cheese', amount: 40, unit: 'g', calories: 160, protein: 14, carbs: 1.4, fat: 10.6 },
      { id: 'i43', name: 'Caesar dressing', amount: 60, unit: 'ml', calories: 170, protein: 1, carbs: 2, fat: 18 },
      { id: 'i44', name: 'Croutons', amount: 30, unit: 'g', calories: 122, protein: 3, carbs: 20, fat: 3 },
    ],
    steps: [
      'Season chicken breast with salt, pepper, and garlic powder.',
      'Grill or pan-sear chicken for 5-6 minutes per side until cooked through (165°F internal).',
      'Let chicken rest for 5 minutes, then slice into strips.',
      'Warm tortillas in a dry pan or microwave for 15 seconds.',
      'Chop romaine lettuce and toss with caesar dressing and grated parmesan.',
      'Layer dressed lettuce, chicken strips, and croutons on each tortilla.',
      'Roll tightly, tucking in the sides as you go. Slice diagonally and serve.',
    ],
  },
  {
    id: 'r8',
    title: 'Matcha Latte',
    description: 'Ceremonial-grade matcha whisked with steamed oat milk for a creamy, energizing drink with no jitters.',
    category: 'beverage',
    difficulty: 'easy',
    author: 'a2',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    rating: 4.3,
    timesCooked: 2100,
    thumbnail: '🍵',
    tags: ['vegan', 'dairy-free', 'healthy'],
    createdAt: Date.now() - 86400000 * 10,
    ingredients: [
      { id: 'i45', name: 'Ceremonial matcha powder', amount: 4, unit: 'g', calories: 10, protein: 1, carbs: 1, fat: 0 },
      { id: 'i46', name: 'Oat milk', amount: 240, unit: 'ml', calories: 120, protein: 3, carbs: 16, fat: 5 },
      { id: 'i47', name: 'Hot water (not boiling)', amount: 60, unit: 'ml', calories: 0, protein: 0, carbs: 0, fat: 0 },
      { id: 'i48', name: 'Honey or maple syrup', amount: 10, unit: 'ml', calories: 30, protein: 0, carbs: 8, fat: 0 },
    ],
    steps: [
      'Sift matcha powder into a bowl or cup to remove clumps.',
      'Add hot water (175°F / 80°C — not boiling) and whisk vigorously with a bamboo chasen or small whisk until frothy.',
      'Heat and froth oat milk until steamy with small bubbles.',
      'Pour frothed milk over the matcha. Stir gently to combine.',
      'Sweeten with honey or maple syrup to taste. Serve hot or over ice.',
    ],
  },
];

const MEAL_PLAN_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INITIAL_REVIEWS = [
  { id: 'rv1', recipeId: 'r1', author: 'FoodLover42', rating: 5, text: 'Best pizza recipe I have tried at home! The key is a really hot oven.', timestamp: Date.now() - 86400000 * 20 },
  { id: 'rv2', recipeId: 'r1', author: 'HomeCook', rating: 4, text: 'Great flavor. I added some garlic to the sauce.', timestamp: Date.now() - 86400000 * 15 },
  { id: 'rv3', recipeId: 'r2', author: 'HealthyEater', rating: 5, text: 'So delicious and nutritious! My family loves this.', timestamp: Date.now() - 86400000 * 10 },
  { id: 'rv4', recipeId: 'r5', author: 'GrillMaster', rating: 5, text: 'Followed this to the letter. Competition-worthy brisket!', timestamp: Date.now() - 86400000 * 5 },
];

export default function RecipeManager() {
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [activeView, setActiveView] = useState('browse');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterDiet, setFilterDiet] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [favorites, setFavorites] = useState(['r1', 'r4']);
  const [servingScale, setServingScale] = useState({});
  const [mealPlan, setMealPlan] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [shoppingChecked, setShoppingChecked] = useState({});
  const [cookingTimers, setCookingTimers] = useState({});
  const [activeTimers, setActiveTimers] = useState({});
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeModalData, setRecipeModalData] = useState(null);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [showNutritionPanel, setShowNutritionPanel] = useState(false);
  const searchInputRef = useRef(null);
  const timerIntervalRef = useRef({});

  useEffect(() => {
    const savedTheme = localStorage.getItem('recipeManagerTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedFavorites = localStorage.getItem('recipeFavorites');
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { /* ignore */ }
    }

    const savedMealPlan = localStorage.getItem('recipeMealPlan');
    if (savedMealPlan) {
      try { setMealPlan(JSON.parse(savedMealPlan)); } catch (e) { /* ignore */ }
    }

    const savedView = localStorage.getItem('recipeManagerView');
    if (savedView) setActiveView(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('recipeMealPlan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedRecipe(null);
        setShowRecipeModal(false);
        setRecipeModalData(null);
        setReviewModal(null);
        setShowNutritionPanel(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(timerIntervalRef.current).forEach(clearInterval);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('recipeManagerTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const getAuthor = (id) => MOCK_AUTHORS.find(a => a.id === id);

  const toggleFavorite = (recipeId) => {
    setFavorites(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  };

  const getScaledAmount = useCallback((recipeId, originalAmount, originalServings) => {
    const scale = servingScale[recipeId] || originalServings;
    return Math.round((originalAmount * (scale / originalServings)) * 100) / 100;
  }, [servingScale]);

  const getRecipeNutrition = useCallback((recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const scale = (servingScale[recipeId] || recipe.servings) / recipe.servings;
    const totals = recipe.ingredients.reduce((acc, ing) => ({
      calories: acc.calories + ing.calories * scale,
      protein: acc.protein + ing.protein * scale,
      carbs: acc.carbs + ing.carbs * scale,
      fat: acc.fat + ing.fat * scale,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const servings = servingScale[recipeId] || recipe.servings;
    return {
      calories: Math.round(totals.calories / servings),
      protein: Math.round(totals.protein / servings * 10) / 10,
      carbs: Math.round(totals.carbs / servings * 10) / 10,
      fat: Math.round(totals.fat / servings * 10) / 10,
    };
  }, [recipes, servingScale]);

  const getTotalNutritionForDay = useCallback((day) => {
    const dayMeals = mealPlan[day] || {};
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    Object.values(dayMeals).forEach(recipeId => {
      if (recipeId) {
        const nutrition = getRecipeNutrition(recipeId);
        totals.calories += nutrition.calories;
        totals.protein += nutrition.protein;
        totals.carbs += nutrition.carbs;
        totals.fat += nutrition.fat;
      }
    });
    return totals;
  }, [mealPlan, getRecipeNutrition]);

  const generateShoppingList = useCallback(() => {
    const ingredientMap = {};
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipeId => {
        if (!recipeId) return;
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;
        recipe.ingredients.forEach(ing => {
          const key = `${ing.name}-${ing.unit}`;
          if (ingredientMap[key]) {
            ingredientMap[key].amount += ing.amount;
          } else {
            ingredientMap[key] = { name: ing.name, amount: ing.amount, unit: ing.unit };
          }
        });
      });
    });
    const list = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name));
    setShoppingList(list);
    setShoppingChecked({});
  }, [mealPlan, recipes]);

  const toggleShoppingItem = (index) => {
    setShoppingChecked(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const startCookingTimer = useCallback((recipeId, minutes) => {
    const endTime = Date.now() + minutes * 60 * 1000;
    setCookingTimers(prev => ({ ...prev, [recipeId]: { endTime, totalMinutes: minutes } }));
    setActiveTimers(prev => ({ ...prev, [recipeId]: minutes * 60 }));

    if (timerIntervalRef.current[recipeId]) {
      clearInterval(timerIntervalRef.current[recipeId]);
    }

    timerIntervalRef.current[recipeId] = setInterval(() => {
      setActiveTimers(prev => {
        const remaining = prev[recipeId];
        if (remaining <= 1) {
          clearInterval(timerIntervalRef.current[recipeId]);
          delete timerIntervalRef.current[recipeId];
          return { ...prev, [recipeId]: 0 };
        }
        return { ...prev, [recipeId]: remaining - 1 };
      });
    }, 1000);
  }, []);

  const stopCookingTimer = useCallback((recipeId) => {
    if (timerIntervalRef.current[recipeId]) {
      clearInterval(timerIntervalRef.current[recipeId]);
      delete timerIntervalRef.current[recipeId];
    }
    setCookingTimers(prev => { const n = { ...prev }; delete n[recipeId]; return n; });
    setActiveTimers(prev => { const n = { ...prev }; delete n[recipeId]; return n; });
  }, []);

  const formatTimerDisplay = (seconds) => {
    if (seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const addToMealPlan = (day, mealSlot, recipeId) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [mealSlot]: recipeId },
    }));
  };

  const removeFromMealPlan = (day, mealSlot) => {
    setMealPlan(prev => {
      const dayMeals = { ...(prev[day] || {}) };
      delete dayMeals[mealSlot];
      return { ...prev, [day]: dayMeals };
    });
  };

  const submitReview = (recipeId) => {
    if (!reviewText.trim()) return;
    const review = { id: Date.now().toString(), recipeId, author: 'You', rating: reviewRating, text: reviewText, timestamp: Date.now() };
    setReviews(prev => [...prev, review]);
    setReviewText('');
    setReviewRating(5);
    setReviewModal(null);
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = recipe.title.toLowerCase().includes(q);
        const matchDesc = recipe.description.toLowerCase().includes(q);
        const matchTags = recipe.tags.some(t => t.toLowerCase().includes(q));
        const matchAuthor = getAuthor(recipe.author)?.name.toLowerCase().includes(q);
        const matchIngredients = recipe.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags && !matchAuthor && !matchIngredients) return false;
      }
      if (filterCategory !== 'all' && recipe.category !== filterCategory) return false;
      if (filterDifficulty !== 'all' && recipe.difficulty !== filterDifficulty) return false;
      if (filterDiet !== 'all' && !recipe.tags.includes(filterDiet)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.timesCooked - a.timesCooked;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'quickest') return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [recipes, searchQuery, filterCategory, filterDifficulty, filterDiet, sortBy]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db', fontSize: '14px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getMealPlanCount = useCallback(() => {
    let count = 0;
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipeId => {
        if (recipeId) count++;
      });
    });
    return count;
  }, [mealPlan]);

  const bgColor = isDarkMode ? '#0f172a' : '#faf7f2';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const secondaryText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const accentColor = '#e85d04';
  const successColor = '#22c55e';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? '64px' : '250px', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? '16px 12px' : '20px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>🍳 CookBook</h1>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText, padding: '4px' }}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'browse', icon: '📖', label: 'Browse Recipes' },
            { id: 'favorites', icon: '❤️', label: 'Favorites' },
            { id: 'meal-plan', icon: '📅', label: 'Meal Plan' },
            { id: 'shopping', icon: '🛒', label: 'Shopping List' },
            { id: 'timers', icon: '⏱️', label: 'Cooking Timers' },
            { id: 'chefs', icon: '👨‍🍳', label: 'Chefs' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSelectedRecipe(null);
                localStorage.setItem('recipeManagerView', item.id);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
                marginBottom: '4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                backgroundColor: activeView === item.id ? (isDarkMode ? '#1e293b' : '#fff7ed') : 'transparent',
                color: activeView === item.id ? accentColor : textColor, fontWeight: activeView === item.id ? 600 : 400,
                textAlign: 'left', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div style={{ padding: '16px', borderTop: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Meal Plan</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: accentColor }}>{getMealPlanCount()} meals</div>
            <div style={{ fontSize: '12px', color: secondaryText, marginTop: '4px' }}>{favorites.length} favorites</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search recipes... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${borderColor}`,
                  borderRadius: '8px', fontSize: '14px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                  color: textColor, outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter by category"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Levels</option>
              {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>

            <select
              value={filterDiet}
              onChange={(e) => setFilterDiet(e.target.value)}
              aria-label="Filter by diet"
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor, cursor: 'pointer' }}
            >
              <option value="all">All Diets</option>
              {DIET_TAGS.map(d => <option key={d} value={d}>{d.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowNutritionPanel(true)}
              style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
              aria-label="Open nutrition panel"
            >
              🥗 Nutrition
            </button>
            <button onClick={toggleTheme} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label="Toggle theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Browse View */}
          {activeView === 'browse' && !selectedRecipe && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Browse Recipes</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: secondaryText }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort recipes"
                    style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: cardBg, color: textColor, cursor: 'pointer' }}
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                    <option value="quickest">Quickest</option>
                    <option value="title">Title A-Z</option>
                  </select>
                  <span style={{ fontSize: '13px', color: secondaryText }}>{filteredRecipes.length} recipes</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredRecipes.map(recipe => {
                  const author = getAuthor(recipe.author);
                  const isFav = favorites.includes(recipe.id);
                  const totalTime = recipe.prepTime + recipe.cookTime;
                  return (
                    <div
                      key={recipe.id}
                      onClick={() => { setSelectedRecipe(recipe); setRecipeModalData(recipe); setShowRecipeModal(true); }}
                      style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, cursor: 'pointer', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                    >
                      <div style={{ padding: '24px 20px 16px', backgroundColor: isDarkMode ? '#1a2332' : '#fff7ed', textAlign: 'center', fontSize: '48px', position: 'relative' }}>
                        {recipe.thumbnail}
                        <span style={{
                          position: 'absolute', top: '12px', right: '12px', fontSize: '11px', padding: '3px 8px',
                          borderRadius: '6px', backgroundColor: DIFFICULTY_COLORS[recipe.difficulty] + '20',
                          color: DIFFICULTY_COLORS[recipe.difficulty], fontWeight: 600,
                        }}>
                          {recipe.difficulty}
                        </span>
                        {isFav && (
                          <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '16px' }}>❤️</span>
                        )}
                      </div>
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '10px', color: secondaryText, textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                          {recipe.category}
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px', lineHeight: 1.3 }}>{recipe.title}</h3>
                        <p style={{ fontSize: '13px', color: secondaryText, margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {recipe.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px' }}>
                          <span>{author?.avatar}</span>
                          <span style={{ color: secondaryText }}>{author?.name}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                          {renderStars(recipe.rating)}
                          <span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '4px' }}>{recipe.rating}</span>
                          <span style={{ fontSize: '12px', color: secondaryText }}>({recipe.timesCooked} cooked)</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: accentColor }}>
                            ⏱️ {formatTime(totalTime)}
                          </span>
                          <span style={{ fontSize: '12px', color: secondaryText }}>
                            {recipe.servings} servings · {recipe.ingredients.length} ingredients
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                          {recipe.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isDarkMode ? '#334155' : '#fff1e6', color: accentColor }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recipe Detail View */}
          {selectedRecipe && (
            <div>
              <button
                onClick={() => { setSelectedRecipe(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: accentColor, fontSize: '13px', marginBottom: '16px' }}
              >
                ← Back to {activeView === 'favorites' ? 'Favorites' : 'Recipes'}
              </button>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  {/* Recipe Header */}
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                      <div style={{ fontSize: '64px' }}>{selectedRecipe.thumbnail}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{
                            fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                            backgroundColor: DIFFICULTY_COLORS[selectedRecipe.difficulty] + '20',
                            color: DIFFICULTY_COLORS[selectedRecipe.difficulty], fontWeight: 600,
                          }}>
                            {selectedRecipe.difficulty}
                          </span>
                          <span style={{ fontSize: '11px', color: secondaryText, textTransform: 'uppercase', fontWeight: 600 }}>
                            {selectedRecipe.category}
                          </span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>{selectedRecipe.title}</h2>
                        <p style={{ fontSize: '14px', color: secondaryText, margin: '0 0 12px', lineHeight: 1.6 }}>{selectedRecipe.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {renderStars(selectedRecipe.rating)}
                            <span style={{ fontWeight: 600, marginLeft: '4px' }}>{selectedRecipe.rating}</span>
                          </span>
                          <span style={{ color: secondaryText }}>{selectedRecipe.timesCooked} times cooked</span>
                          <span style={{ color: secondaryText }}>Prep: {formatTime(selectedRecipe.prepTime)}</span>
                          <span style={{ color: secondaryText }}>Cook: {formatTime(selectedRecipe.cookTime)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedRecipe.id); }}
                          style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: favorites.includes(selectedRecipe.id) ? '#fef2f2' : 'transparent', color: favorites.includes(selectedRecipe.id) ? '#ef4444' : textColor }}
                          aria-label={favorites.includes(selectedRecipe.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favorites.includes(selectedRecipe.id) ? '❤️ Favorited' : '🤍 Favorite'}
                        </button>
                        <button
                          onClick={() => setReviewModal(selectedRecipe.id)}
                          style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
                        >
                          Write Review
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients with Scaling */}
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Ingredients</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '13px', color: secondaryText }} htmlFor="serving-scale">Servings:</label>
                        <input
                          id="serving-scale"
                          type="number"
                          min="1"
                          max="20"
                          value={servingScale[selectedRecipe.id] || selectedRecipe.servings}
                          onChange={(e) => setServingScale(prev => ({ ...prev, [selectedRecipe.id]: parseInt(e.target.value) || selectedRecipe.servings }))}
                          style={{ width: '60px', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, textAlign: 'center' }}
                          aria-label="Adjust servings"
                        />
                      </div>
                    </div>
                    {selectedRecipe.ingredients.map(ing => (
                      <div key={ing.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '14px' }}>
                        <span>{ing.name}</span>
                        <span style={{ fontWeight: 600, color: accentColor }}>
                          {getScaledAmount(selectedRecipe.id, ing.amount, selectedRecipe.servings)} {ing.unit}
                        </span>
                      </div>
                    ))}
                    {/* Nutrition Summary */}
                    <div style={{ marginTop: '16px', padding: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f8f4f0', borderRadius: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Per Serving Nutrition</div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                        {(() => {
                          const n = getRecipeNutrition(selectedRecipe.id);
                          return (
                            <>
                              <span>🔥 {n.calories} cal</span>
                              <span>💪 {n.protein}g protein</span>
                              <span>🌾 {n.carbs}g carbs</span>
                              <span>🧈 {n.fat}g fat</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Cooking Steps */}
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Instructions</h3>
                      {selectedRecipe.cookTime > 0 && (
                        <div>
                          {activeTimers[selectedRecipe.id] !== undefined ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px', fontWeight: 700, color: activeTimers[selectedRecipe.id] === 0 ? '#ef4444' : accentColor, fontVariantNumeric: 'tabular-nums' }} data-testid="timer-display">
                                {activeTimers[selectedRecipe.id] === 0 ? '⏰ Done!' : `⏱️ ${formatTimerDisplay(activeTimers[selectedRecipe.id])}`}
                              </span>
                              <button
                                onClick={() => stopCookingTimer(selectedRecipe.id)}
                                style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: secondaryText }}
                                data-testid="stop-timer"
                              >
                                Stop
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startCookingTimer(selectedRecipe.id, selectedRecipe.cookTime)}
                              style={{ padding: '6px 14px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                              data-testid="start-timer"
                            >
                              ⏱️ Start Cook Timer ({formatTime(selectedRecipe.cookTime)})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedRecipe.steps.map((step, index) => (
                      <div key={index} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: index < selectedRecipe.steps.length - 1 ? `1px solid ${borderColor}` : 'none' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', backgroundColor: accentColor,
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 600, flexShrink: 0,
                        }}>
                          {index + 1}
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, color: textColor }}>{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reviews Section */}
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Reviews ({reviews.filter(r => r.recipeId === selectedRecipe.id).length})</h3>
                    {reviews.filter(r => r.recipeId === selectedRecipe.id).length === 0 ? (
                      <p style={{ color: secondaryText, fontSize: '13px' }}>No reviews yet. Be the first to review!</p>
                    ) : (
                      reviews.filter(r => r.recipeId === selectedRecipe.id).map(review => (
                        <div key={review.id} style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600 }}>{review.author}</span>
                            <span>{renderStars(review.rating)}</span>
                            <span style={{ color: secondaryText, fontSize: '11px' }}>{formatDate(review.timestamp)}</span>
                          </div>
                          <p style={{ margin: 0, color: secondaryText, lineHeight: 1.5 }}>{review.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recipe Sidebar — Author Card */}
                <div style={{ width: '280px', flexShrink: 0 }}>
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '20px', textAlign: 'center', position: 'sticky', top: '0' }}>
                    <span style={{ fontSize: '48px' }}>{getAuthor(selectedRecipe.author)?.avatar}</span>
                    <div style={{ fontWeight: 600, fontSize: '15px', marginTop: '8px' }}>{getAuthor(selectedRecipe.author)?.name}</div>
                    <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '12px' }}>{getAuthor(selectedRecipe.author)?.specialty}</div>
                    <div style={{ fontSize: '13px', color: secondaryText }}>{getAuthor(selectedRecipe.author)?.recipesCount} recipes</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favorites View */}
          {activeView === 'favorites' && !selectedRecipe && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Favorite Recipes</h2>
              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
                  <p style={{ fontSize: '16px' }}>No favorite recipes yet.</p>
                  <button
                    onClick={() => setActiveView('browse')}
                    style={{ padding: '10px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '12px' }}
                  >
                    Browse Recipes
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {recipes.filter(r => favorites.includes(r.id)).map(recipe => (
                    <div key={recipe.id} style={{ display: 'flex', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedRecipe(recipe)}>
                      <div style={{ width: '100px', backgroundColor: isDarkMode ? '#1a2332' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>
                        {recipe.thumbnail}
                      </div>
                      <div style={{ flex: 1, padding: '14px 16px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>{recipe.title}</h3>
                        <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '6px' }}>
                          {getAuthor(recipe.author)?.name} · {formatTime(recipe.prepTime + recipe.cookTime)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {renderStars(recipe.rating)}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                            style={{ marginLeft: 'auto', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', backgroundColor: 'transparent', color: secondaryText }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Meal Plan View */}
          {activeView === 'meal-plan' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Weekly Meal Plan</h2>
                <button
                  onClick={generateShoppingList}
                  style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                >
                  🛒 Generate Shopping List
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MEAL_PLAN_DAYS.map(day => {
                  const dayMeals = mealPlan[day] || {};
                  const dayNutrition = getTotalNutritionForDay(day);
                  return (
                    <div key={day} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{day}</h3>
                        {dayNutrition.calories > 0 && (
                          <span style={{ fontSize: '12px', color: secondaryText }}>
                            {dayNutrition.calories} cal · {dayNutrition.protein}g P · {dayNutrition.carbs}g C · {dayNutrition.fat}g F
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {['breakfast', 'lunch', 'dinner'].map(slot => {
                          const recipeId = dayMeals[slot];
                          const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;
                          return (
                            <div key={slot} style={{ padding: '10px', border: `1px dashed ${borderColor}`, borderRadius: '8px', minHeight: '60px' }}>
                              <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{slot}</div>
                              {recipe ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '20px' }}>{recipe.thumbnail}</span>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{recipe.title}</div>
                                    <div style={{ fontSize: '10px', color: secondaryText }}>{formatTime(recipe.prepTime + recipe.cookTime)}</div>
                                  </div>
                                  <button
                                    onClick={() => removeFromMealPlan(day, slot)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: secondaryText, fontSize: '14px', padding: '2px' }}
                                    aria-label={`Remove ${slot} for ${day}`}
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <select
                                  onChange={(e) => { if (e.target.value) addToMealPlan(day, slot, e.target.value); e.target.value = ''; }}
                                  style={{ width: '100%', padding: '4px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '11px', backgroundColor: 'transparent', color: secondaryText, cursor: 'pointer' }}
                                  aria-label={`Add ${slot} for ${day}`}
                                  defaultValue=""
                                >
                                  <option value="">+ Add recipe</option>
                                  {recipes.map(r => <option key={r.id} value={r.id}>{r.thumbnail} {r.title}</option>)}
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shopping List View */}
          {activeView === 'shopping' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Shopping List</h2>
              {shoppingList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                  <p style={{ fontSize: '16px' }}>No items in your shopping list.</p>
                  <p style={{ fontSize: '13px' }}>Add recipes to your meal plan and generate a shopping list.</p>
                  <button
                    onClick={() => setActiveView('meal-plan')}
                    style={{ padding: '10px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '12px' }}
                  >
                    Go to Meal Plan
                  </button>
                </div>
              ) : (
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: secondaryText }}>
                      {Object.values(shoppingChecked).filter(Boolean).length}/{shoppingList.length} items checked
                    </span>
                    <button
                      onClick={() => setShoppingChecked({})}
                      style={{ padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontSize: '12px', backgroundColor: 'transparent', color: secondaryText }}
                    >
                      Uncheck All
                    </button>
                  </div>
                  {shoppingList.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => toggleShoppingItem(index)}
                      style={{
                        padding: '12px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                        textDecoration: shoppingChecked[index] ? 'line-through' : 'none',
                        opacity: shoppingChecked[index] ? 0.5 : 1,
                      }}
                    >
                      <span style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${shoppingChecked[index] ? successColor : borderColor}`, backgroundColor: shoppingChecked[index] ? successColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', flexShrink: 0 }}>
                        {shoppingChecked[index] ? '✓' : ''}
                      </span>
                      <span style={{ flex: 1, fontSize: '14px' }}>{item.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: accentColor }}>{item.amount} {item.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cooking Timers View */}
          {activeView === 'timers' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Cooking Timers</h2>
              {Object.keys(cookingTimers).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏱️</div>
                  <p style={{ fontSize: '16px' }}>No active timers.</p>
                  <p style={{ fontSize: '13px' }}>Start a cooking timer from any recipe detail page.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {Object.entries(cookingTimers).map(([recipeId, timer]) => {
                    const recipe = recipes.find(r => r.id === recipeId);
                    if (!recipe) return null;
                    const remaining = activeTimers[recipeId] || 0;
                    const isDone = remaining === 0;
                    return (
                      <div key={recipeId} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `2px solid ${isDone ? '#ef4444' : accentColor}`, padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>{recipe.thumbnail}</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{recipe.title}</div>
                        <div style={{
                          fontSize: '32px', fontWeight: 700, color: isDone ? '#ef4444' : accentColor,
                          marginBottom: '12px', fontVariantNumeric: 'tabular-nums',
                        }}>
                          {isDone ? '⏰ Done!' : formatTimerDisplay(remaining)}
                        </div>
                        <button
                          onClick={() => stopCookingTimer(recipeId)}
                          style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}
                        >
                          {isDone ? 'Dismiss' : 'Stop Timer'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Chefs View */}
          {activeView === 'chefs' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Our Chefs</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {MOCK_AUTHORS.map(author => {
                  const authorRecipes = recipes.filter(r => r.author === author.id);
                  const avgRating = authorRecipes.length > 0 ? Math.round(authorRecipes.reduce((sum, r) => sum + r.rating, 0) / authorRecipes.length * 10) / 10 : 0;
                  return (
                    <div key={author.id} style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{author.avatar}</div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{author.name}</h3>
                      <div style={{ fontSize: '13px', color: secondaryText, marginBottom: '8px' }}>{author.specialty}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
                        {renderStars(avgRating)}
                        <span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '4px' }}>{avgRating}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '12px', borderTop: `1px solid ${borderColor}`, fontSize: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>{authorRecipes.length}</div>
                          <div style={{ color: secondaryText }}>Recipes</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>{authorRecipes.reduce((sum, r) => sum + r.timesCooked, 0).toLocaleString()}</div>
                          <div style={{ color: secondaryText }}>Times Cooked</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Quick Preview Modal */}
      {showRecipeModal && recipeModalData && !selectedRecipe && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => { setShowRecipeModal(false); setRecipeModalData(null); }}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                    backgroundColor: DIFFICULTY_COLORS[recipeModalData.difficulty] + '20',
                    color: DIFFICULTY_COLORS[recipeModalData.difficulty], fontWeight: 600,
                  }}>
                    {recipeModalData.difficulty}
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{recipeModalData.title}</h2>
              </div>
              <button onClick={() => { setShowRecipeModal(false); setRecipeModalData(null); }} style={{ padding: '6px 12px', backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', color: textColor }}>×</button>
            </div>

            <p style={{ fontSize: '14px', color: secondaryText, lineHeight: 1.6, margin: '0 0 16px' }}>{recipeModalData.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {renderStars(recipeModalData.rating)}
                <span style={{ fontWeight: 600 }}>{recipeModalData.rating}</span>
              </span>
              <span style={{ color: secondaryText }}>{recipeModalData.timesCooked} times cooked</span>
              <span style={{ color: secondaryText }}>⏱️ {formatTime(recipeModalData.prepTime + recipeModalData.cookTime)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f8f4f0', borderRadius: '8px' }}>
              <span style={{ fontSize: '24px' }}>{getAuthor(recipeModalData.author)?.avatar}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{getAuthor(recipeModalData.author)?.name}</div>
                <div style={{ fontSize: '12px', color: secondaryText }}>{getAuthor(recipeModalData.author)?.specialty}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>Ingredients ({recipeModalData.ingredients.length})</h3>
              {recipeModalData.ingredients.map(ing => (
                <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: `1px solid ${borderColor}` }}>
                  <span>{ing.name}</span>
                  <span style={{ color: accentColor, fontWeight: 500 }}>{ing.amount} {ing.unit}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: `1px solid ${borderColor}` }}>
              <span style={{ fontSize: '14px', color: secondaryText }}>{recipeModalData.servings} servings</span>
              <button
                onClick={() => { setShowRecipeModal(false); setSelectedRecipe(recipeModalData); }}
                style={{ padding: '10px 24px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                View Full Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setReviewModal(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Write a Review</h2>
              <button onClick={() => setReviewModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '8px' }}>Rating</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: star <= reviewRating ? '#f59e0b' : '#d1d5db' }}
                    aria-label={`Rate ${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: secondaryText, marginBottom: '8px' }}>Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your cooking experience..."
                rows={4}
                style={{ width: '100%', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setReviewModal(null)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={() => submitReview(reviewModal)} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Side Panel */}
      {showNutritionPanel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 2000 }} onClick={() => setShowNutritionPanel(false)}>
          <div style={{ backgroundColor: cardBg, width: '400px', height: '100%', padding: '24px', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>🥗 Nutrition Overview</h2>
              <button onClick={() => setShowNutritionPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            {recipes.map(recipe => {
              const n = getRecipeNutrition(recipe.id);
              return (
                <div key={recipe.id} style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>{recipe.thumbnail}</span>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{recipe.title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: secondaryText }}>
                    <span>🔥 {n.calories} cal</span>
                    <span>💪 {n.protein}g P</span>
                    <span>🌾 {n.carbs}g C</span>
                    <span>🧈 {n.fat}g F</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
