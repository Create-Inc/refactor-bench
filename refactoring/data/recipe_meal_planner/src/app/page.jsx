import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];
const DIETARY_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];
const UNITS = ['cups', 'tbsp', 'tsp', 'oz', 'lbs', 'g', 'ml', 'pieces', 'cloves', 'whole'];

const INITIAL_RECIPES = [
  {
    id: 'r1', title: 'Avocado Toast with Poached Eggs', category: 'breakfast', difficulty: 'easy',
    prepTime: 10, cookTime: 5, servings: 2, rating: 4.5, timesCooked: 12,
    dietaryTags: ['vegetarian'], favorite: true,
    description: 'Creamy avocado on toasted sourdough topped with perfectly poached eggs.',
    ingredients: [
      { id: 'i1', name: 'Sourdough bread', amount: 2, unit: 'pieces' },
      { id: 'i2', name: 'Avocado', amount: 1, unit: 'whole' },
      { id: 'i3', name: 'Eggs', amount: 2, unit: 'whole' },
      { id: 'i4', name: 'Lemon juice', amount: 1, unit: 'tsp' },
      { id: 'i5', name: 'Red pepper flakes', amount: 0.5, unit: 'tsp' },
      { id: 'i6', name: 'Salt', amount: 0.25, unit: 'tsp' },
    ],
    instructions: ['Toast the sourdough bread until golden.', 'Mash avocado with lemon juice and salt.', 'Poach eggs in simmering water for 3 minutes.', 'Spread avocado on toast and top with poached eggs.', 'Sprinkle with red pepper flakes.'],
    nutrition: { calories: 350, protein: 14, carbs: 28, fat: 22, fiber: 7 },
    createdAt: Date.now() - 86400000 * 30,
    notes: 'Use ripe avocados for best texture.',
  },
  {
    id: 'r2', title: 'Grilled Chicken Caesar Salad', category: 'lunch', difficulty: 'medium',
    prepTime: 15, cookTime: 12, servings: 4, rating: 4.2, timesCooked: 8,
    dietaryTags: ['gluten-free'], favorite: false,
    description: 'Classic Caesar salad with juicy grilled chicken breast and homemade croutons.',
    ingredients: [
      { id: 'i7', name: 'Chicken breast', amount: 1.5, unit: 'lbs' },
      { id: 'i8', name: 'Romaine lettuce', amount: 2, unit: 'whole' },
      { id: 'i9', name: 'Parmesan cheese', amount: 0.5, unit: 'cups' },
      { id: 'i10', name: 'Caesar dressing', amount: 0.25, unit: 'cups' },
      { id: 'i11', name: 'Garlic', amount: 2, unit: 'cloves' },
      { id: 'i12', name: 'Olive oil', amount: 2, unit: 'tbsp' },
    ],
    instructions: ['Season chicken with salt, pepper, and garlic.', 'Grill chicken for 6 minutes per side.', 'Chop romaine lettuce and place in bowl.', 'Slice grilled chicken.', 'Toss salad with dressing and top with chicken and parmesan.'],
    nutrition: { calories: 420, protein: 38, carbs: 12, fat: 26, fiber: 4 },
    createdAt: Date.now() - 86400000 * 25,
    notes: '',
  },
  {
    id: 'r3', title: 'Spaghetti Bolognese', category: 'dinner', difficulty: 'medium',
    prepTime: 15, cookTime: 45, servings: 6, rating: 4.8, timesCooked: 20,
    dietaryTags: [], favorite: true,
    description: 'Rich and hearty meat sauce simmered with tomatoes and herbs over al dente pasta.',
    ingredients: [
      { id: 'i13', name: 'Ground beef', amount: 1, unit: 'lbs' },
      { id: 'i14', name: 'Spaghetti', amount: 1, unit: 'lbs' },
      { id: 'i15', name: 'Crushed tomatoes', amount: 28, unit: 'oz' },
      { id: 'i16', name: 'Onion', amount: 1, unit: 'whole' },
      { id: 'i17', name: 'Garlic', amount: 4, unit: 'cloves' },
      { id: 'i18', name: 'Olive oil', amount: 2, unit: 'tbsp' },
      { id: 'i19', name: 'Dried basil', amount: 1, unit: 'tsp' },
      { id: 'i20', name: 'Dried oregano', amount: 1, unit: 'tsp' },
    ],
    instructions: ['Cook spaghetti according to package directions.', 'Sauté onion and garlic in olive oil.', 'Brown ground beef and drain fat.', 'Add crushed tomatoes and herbs, simmer 30 minutes.', 'Serve sauce over pasta with parmesan.'],
    nutrition: { calories: 550, protein: 32, carbs: 65, fat: 18, fiber: 5 },
    createdAt: Date.now() - 86400000 * 20,
    notes: 'Can substitute with ground turkey for lighter version.',
  },
  {
    id: 'r4', title: 'Overnight Oats', category: 'breakfast', difficulty: 'easy',
    prepTime: 5, cookTime: 0, servings: 1, rating: 4.0, timesCooked: 15,
    dietaryTags: ['vegetarian', 'vegan'], favorite: false,
    description: 'No-cook oats soaked overnight in milk with chia seeds and fruit.',
    ingredients: [
      { id: 'i21', name: 'Rolled oats', amount: 0.5, unit: 'cups' },
      { id: 'i22', name: 'Almond milk', amount: 0.5, unit: 'cups' },
      { id: 'i23', name: 'Chia seeds', amount: 1, unit: 'tbsp' },
      { id: 'i24', name: 'Maple syrup', amount: 1, unit: 'tbsp' },
      { id: 'i25', name: 'Mixed berries', amount: 0.25, unit: 'cups' },
    ],
    instructions: ['Combine oats, milk, and chia seeds in a jar.', 'Add maple syrup and stir.', 'Refrigerate overnight.', 'Top with mixed berries before serving.'],
    nutrition: { calories: 280, protein: 8, carbs: 45, fat: 8, fiber: 9 },
    createdAt: Date.now() - 86400000 * 15,
    notes: 'Prep on Sunday for the whole week.',
  },
  {
    id: 'r5', title: 'Thai Green Curry', category: 'dinner', difficulty: 'hard',
    prepTime: 20, cookTime: 25, servings: 4, rating: 4.7, timesCooked: 6,
    dietaryTags: ['gluten-free', 'dairy-free'], favorite: true,
    description: 'Aromatic green curry with coconut milk, vegetables, and jasmine rice.',
    ingredients: [
      { id: 'i26', name: 'Green curry paste', amount: 3, unit: 'tbsp' },
      { id: 'i27', name: 'Coconut milk', amount: 14, unit: 'oz' },
      { id: 'i28', name: 'Chicken thighs', amount: 1, unit: 'lbs' },
      { id: 'i29', name: 'Bamboo shoots', amount: 8, unit: 'oz' },
      { id: 'i30', name: 'Thai basil', amount: 0.5, unit: 'cups' },
      { id: 'i31', name: 'Fish sauce', amount: 2, unit: 'tbsp' },
      { id: 'i32', name: 'Brown sugar', amount: 1, unit: 'tbsp' },
      { id: 'i33', name: 'Jasmine rice', amount: 2, unit: 'cups' },
    ],
    instructions: ['Cook jasmine rice.', 'Fry curry paste in oil for 1 minute.', 'Add coconut milk and bring to simmer.', 'Add chicken and cook until done.', 'Add bamboo shoots, fish sauce, and sugar.', 'Garnish with Thai basil and serve over rice.'],
    nutrition: { calories: 620, protein: 30, carbs: 55, fat: 32, fiber: 3 },
    createdAt: Date.now() - 86400000 * 10,
    notes: 'Adjust curry paste amount for spice preference.',
  },
  {
    id: 'r6', title: 'Berry Protein Smoothie', category: 'drink', difficulty: 'easy',
    prepTime: 5, cookTime: 0, servings: 1, rating: 4.3, timesCooked: 25,
    dietaryTags: ['vegetarian', 'gluten-free'], favorite: false,
    description: 'Creamy protein-packed smoothie with mixed berries and Greek yogurt.',
    ingredients: [
      { id: 'i34', name: 'Mixed berries', amount: 1, unit: 'cups' },
      { id: 'i35', name: 'Greek yogurt', amount: 0.5, unit: 'cups' },
      { id: 'i36', name: 'Protein powder', amount: 1, unit: 'tbsp' },
      { id: 'i37', name: 'Almond milk', amount: 0.5, unit: 'cups' },
      { id: 'i38', name: 'Honey', amount: 1, unit: 'tbsp' },
    ],
    instructions: ['Add all ingredients to blender.', 'Blend until smooth.', 'Pour into glass and serve immediately.'],
    nutrition: { calories: 250, protein: 20, carbs: 35, fat: 4, fiber: 5 },
    createdAt: Date.now() - 86400000 * 5,
    notes: 'Use frozen berries for thicker consistency.',
  },
  {
    id: 'r7', title: 'Chocolate Lava Cake', category: 'dessert', difficulty: 'hard',
    prepTime: 15, cookTime: 14, servings: 4, rating: 4.9, timesCooked: 3,
    dietaryTags: ['vegetarian'], favorite: true,
    description: 'Decadent individual chocolate cakes with a molten center.',
    ingredients: [
      { id: 'i39', name: 'Dark chocolate', amount: 6, unit: 'oz' },
      { id: 'i40', name: 'Butter', amount: 0.5, unit: 'cups' },
      { id: 'i41', name: 'Eggs', amount: 2, unit: 'whole' },
      { id: 'i42', name: 'Egg yolks', amount: 2, unit: 'whole' },
      { id: 'i43', name: 'Sugar', amount: 0.25, unit: 'cups' },
      { id: 'i44', name: 'All-purpose flour', amount: 2, unit: 'tbsp' },
    ],
    instructions: ['Melt chocolate and butter together.', 'Whisk eggs, yolks, and sugar until thick.', 'Fold chocolate mixture into eggs.', 'Fold in flour gently.', 'Pour into greased ramekins.', 'Bake at 425°F for 12-14 minutes.', 'Invert onto plate and serve immediately.'],
    nutrition: { calories: 480, protein: 8, carbs: 38, fat: 34, fiber: 3 },
    createdAt: Date.now() - 86400000 * 3,
    notes: 'Timing is critical — test one first to check doneness.',
  },
  {
    id: 'r8', title: 'Quinoa Buddha Bowl', category: 'lunch', difficulty: 'easy',
    prepTime: 10, cookTime: 20, servings: 2, rating: 4.4, timesCooked: 10,
    dietaryTags: ['vegan', 'gluten-free'], favorite: false,
    description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing.',
    ingredients: [
      { id: 'i45', name: 'Quinoa', amount: 1, unit: 'cups' },
      { id: 'i46', name: 'Sweet potato', amount: 1, unit: 'whole' },
      { id: 'i47', name: 'Chickpeas', amount: 15, unit: 'oz' },
      { id: 'i48', name: 'Kale', amount: 2, unit: 'cups' },
      { id: 'i49', name: 'Tahini', amount: 2, unit: 'tbsp' },
      { id: 'i50', name: 'Lemon juice', amount: 1, unit: 'tbsp' },
    ],
    instructions: ['Cook quinoa according to package.', 'Roast cubed sweet potato and chickpeas at 400°F for 20 minutes.', 'Massage kale with olive oil.', 'Assemble bowls with quinoa base.', 'Top with roasted vegetables and kale.', 'Drizzle with tahini-lemon dressing.'],
    nutrition: { calories: 480, protein: 18, carbs: 68, fat: 16, fiber: 12 },
    createdAt: Date.now() - 86400000 * 8,
    notes: 'Great for meal prep.',
  },
];

const INITIAL_MEAL_PLAN = {};

export default function RecipeMealPlanner() {
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [activeView, setActiveView] = useState('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterDietary, setFilterDietary] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [mealPlan, setMealPlan] = useState(INITIAL_MEAL_PLAN);
  const [shoppingList, setShoppingList] = useState([]);
  const [shoppingChecked, setShoppingChecked] = useState({});
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showNutritionSummary, setShowNutritionSummary] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setNotifications] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedRecipes = localStorage.getItem('mealPlannerRecipes');
    if (savedRecipes) {
      try { setRecipes(JSON.parse(savedRecipes)); } catch (e) { console.error('Failed to load recipes'); }
    }
    const savedMealPlan = localStorage.getItem('mealPlannerPlan');
    if (savedMealPlan) {
      try { setMealPlan(JSON.parse(savedMealPlan)); } catch (e) { console.error('Failed to load meal plan'); }
    }
    const savedTheme = localStorage.getItem('mealPlannerTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('mealPlannerRecipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('mealPlannerPlan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedRecipe(null);
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowNutritionSummary(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    const notif = { id: Date.now().toString(), message, type, timestamp: Date.now() };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('mealPlannerTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const toggleFavorite = (recipeId) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, favorite: !r.favorite } : r));
  };

  const incrementTimesCooked = (recipeId) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, timesCooked: r.timesCooked + 1 } : r));
    addNotification('Marked as cooked!', 'success');
  };

  const rateRecipe = (recipeId, rating) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, rating } : r));
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = recipe.title.toLowerCase().includes(q);
        const matchDesc = recipe.description.toLowerCase().includes(q);
        const matchIngredients = recipe.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchIngredients) return false;
      }
      if (filterCategory !== 'all' && recipe.category !== filterCategory) return false;
      if (filterDifficulty !== 'all' && recipe.difficulty !== filterDifficulty) return false;
      if (filterDietary.length > 0 && !filterDietary.every(tag => recipe.dietaryTags.includes(tag))) return false;
      if (showFavoritesOnly && !recipe.favorite) return false;
      return true;
    });
  }, [recipes, searchQuery, filterCategory, filterDifficulty, filterDietary, showFavoritesOnly]);

  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'rating') cmp = a.rating - b.rating;
      else if (sortBy === 'prepTime') cmp = (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
      else if (sortBy === 'timesCooked') cmp = a.timesCooked - b.timesCooked;
      else if (sortBy === 'created') cmp = a.createdAt - b.createdAt;
      else if (sortBy === 'calories') cmp = a.nutrition.calories - b.nutrition.calories;
      return sortDirection === 'desc' ? -cmp : cmp;
    });
  }, [filteredRecipes, sortBy, sortDirection]);

  const createRecipe = (formData) => {
    const ingredientLines = formData.ingredientsText ? formData.ingredientsText.split('\n').filter(Boolean) : [];
    const parsedIngredients = ingredientLines.map((line, idx) => {
      const parts = line.trim().split(/\s+/);
      const amount = parseFloat(parts[0]) || 1;
      const unit = UNITS.includes(parts[1]) ? parts[1] : 'whole';
      const name = UNITS.includes(parts[1]) ? parts.slice(2).join(' ') : parts.slice(1).join(' ');
      return { id: `new_i_${Date.now()}_${idx}`, name: name || line.trim(), amount, unit };
    });
    const instructionLines = formData.instructionsText ? formData.instructionsText.split('\n').filter(Boolean) : [];
    const newRecipe = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category || 'dinner',
      difficulty: formData.difficulty || 'medium',
      prepTime: parseInt(formData.prepTime) || 0,
      cookTime: parseInt(formData.cookTime) || 0,
      servings: parseInt(formData.servings) || 1,
      rating: 0,
      timesCooked: 0,
      dietaryTags: formData.dietaryTags || [],
      favorite: false,
      description: formData.description || '',
      ingredients: parsedIngredients,
      instructions: instructionLines,
      nutrition: {
        calories: parseInt(formData.calories) || 0,
        protein: parseInt(formData.protein) || 0,
        carbs: parseInt(formData.carbs) || 0,
        fat: parseInt(formData.fat) || 0,
        fiber: parseInt(formData.fiber) || 0,
      },
      createdAt: Date.now(),
      notes: formData.notes || '',
    };
    setRecipes(prev => [...prev, newRecipe]);
    setShowCreateModal(false);
    addNotification(`Recipe "${newRecipe.title}" created!`, 'success');
  };

  const updateRecipe = (recipeId, updates) => {
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, ...updates } : r));
    setShowEditModal(false);
    setEditingRecipe(null);
    addNotification('Recipe updated!', 'success');
  };

  const deleteRecipe = (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      const recipe = recipes.find(r => r.id === recipeId);
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
      setSelectedRecipe(null);
      // Remove from meal plan
      const updatedPlan = { ...mealPlan };
      Object.keys(updatedPlan).forEach(key => {
        if (updatedPlan[key] === recipeId) delete updatedPlan[key];
      });
      setMealPlan(updatedPlan);
      addNotification(`Recipe "${recipe?.title}" deleted`, 'warning');
    }
  };

  const assignToMealPlan = (day, slot, recipeId) => {
    const key = `${currentWeekOffset}_${day}_${slot}`;
    setMealPlan(prev => ({ ...prev, [key]: recipeId }));
    const recipe = recipes.find(r => r.id === recipeId);
    addNotification(`Added "${recipe?.title}" to ${day} ${slot}`, 'info');
  };

  const removeFromMealPlan = (day, slot) => {
    const key = `${currentWeekOffset}_${day}_${slot}`;
    setMealPlan(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const getMealPlanRecipe = (day, slot) => {
    const key = `${currentWeekOffset}_${day}_${slot}`;
    const recipeId = mealPlan[key];
    return recipeId ? recipes.find(r => r.id === recipeId) : null;
  };

  const generateShoppingList = () => {
    const ingredientMap = {};
    DAYS_OF_WEEK.forEach(day => {
      MEAL_SLOTS.forEach(slot => {
        const recipe = getMealPlanRecipe(day, slot);
        if (recipe) {
          recipe.ingredients.forEach(ing => {
            const key = `${ing.name}_${ing.unit}`;
            if (ingredientMap[key]) {
              ingredientMap[key].amount += ing.amount;
            } else {
              ingredientMap[key] = { name: ing.name, amount: ing.amount, unit: ing.unit };
            }
          });
        }
      });
    });
    const list = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name));
    setShoppingList(list);
    setShoppingChecked({});
    addNotification(`Shopping list generated with ${list.length} items`, 'success');
  };

  const toggleShoppingItem = (itemName) => {
    setShoppingChecked(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const getWeeklyNutrition = () => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, mealCount: 0 };
    DAYS_OF_WEEK.forEach(day => {
      MEAL_SLOTS.forEach(slot => {
        const recipe = getMealPlanRecipe(day, slot);
        if (recipe) {
          totals.calories += recipe.nutrition.calories;
          totals.protein += recipe.nutrition.protein;
          totals.carbs += recipe.nutrition.carbs;
          totals.fat += recipe.nutrition.fat;
          totals.fiber += recipe.nutrition.fiber;
          totals.mealCount += 1;
        }
      });
    });
    return totals;
  };

  const getDailyNutrition = (day) => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    MEAL_SLOTS.forEach(slot => {
      const recipe = getMealPlanRecipe(day, slot);
      if (recipe) {
        totals.calories += recipe.nutrition.calories;
        totals.protein += recipe.nutrition.protein;
        totals.carbs += recipe.nutrition.carbs;
        totals.fat += recipe.nutrition.fat;
        totals.fiber += recipe.nutrition.fiber;
      }
    });
    return totals;
  };

  const getCategoryStats = () => {
    const stats = {};
    CATEGORIES.forEach(cat => { stats[cat] = recipes.filter(r => r.category === cat).length; });
    return stats;
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
  };

  const bgColor = isDarkMode ? '#1a1a2e' : '#faf9f6';
  const cardBg = isDarkMode ? '#16213e' : '#ffffff';
  const textColor = isDarkMode ? '#e0e0e0' : '#2d2d2d';
  const secondaryText = isDarkMode ? '#a0a0a0' : '#666666';
  const borderColor = isDarkMode ? '#2a2a4a' : '#e8e5e0';
  const accentColor = '#e07a5f';
  const accentLight = isDarkMode ? '#3d2a2a' : '#fef0ec';
  const greenColor = '#81b29a';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', backgroundColor: isDarkMode ? '#0f0f23' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${borderColor}` }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>🍳 MealPlanner</h1>
          <p style={{ fontSize: '11px', color: secondaryText, margin: '4px 0 0' }}>{recipes.length} recipes</p>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {[
            { id: 'recipes', icon: '📖', label: 'My Recipes' },
            { id: 'meal-plan', icon: '📅', label: 'Meal Plan' },
            { id: 'shopping', icon: '🛒', label: 'Shopping List' },
            { id: 'nutrition', icon: '📊', label: 'Nutrition' },
            { id: 'favorites', icon: '❤️', label: 'Favorites' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                if (item.id === 'favorites') setShowFavoritesOnly(true);
                else setShowFavoritesOnly(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '10px 12px', marginBottom: '4px', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontSize: '14px', textAlign: 'left',
                backgroundColor: activeView === item.id ? accentLight : 'transparent',
                color: activeView === item.id ? accentColor : textColor,
                fontWeight: activeView === item.id ? 600 : 400,
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: `1px solid ${borderColor}` }}>
          <button
            onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', backgroundColor: 'transparent', color: secondaryText, textAlign: 'left' }}
            aria-label="Toggle theme"
          >
            <span>{isDarkMode ? '☀️' : '🌙'}</span>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search recipes... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor, outline: 'none' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
          </div>

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor, cursor: 'pointer' }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>

          <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} aria-label="Filter by difficulty" style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', color: textColor, cursor: 'pointer' }}>
            <option value="all">All Difficulty</option>
            {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            + New Recipe
          </button>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Recipes View */}
          {(activeView === 'recipes' || activeView === 'favorites') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                    {activeView === 'favorites' ? 'Favorite Recipes' : 'My Recipes'}
                  </h2>
                  <p style={{ fontSize: '13px', color: secondaryText, margin: '4px 0 0' }}>
                    {sortedRecipes.length} recipe{sortedRecipes.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: secondaryText }}>Sort:</span>
                  {['title', 'rating', 'prepTime', 'calories'].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        if (sortBy === s) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        else { setSortBy(s); setSortDirection(s === 'rating' ? 'desc' : 'asc'); }
                      }}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                        border: `1px solid ${sortBy === s ? accentColor : borderColor}`,
                        backgroundColor: sortBy === s ? accentLight : 'transparent',
                        color: sortBy === s ? accentColor : textColor,
                      }}
                    >
                      {s === 'prepTime' ? 'Time' : s.charAt(0).toUpperCase() + s.slice(1)}
                      {sortBy === s && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary tag filters */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {DIETARY_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilterDietary(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    style={{
                      padding: '4px 10px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer',
                      border: `1px solid ${filterDietary.includes(tag) ? greenColor : borderColor}`,
                      backgroundColor: filterDietary.includes(tag) ? (isDarkMode ? '#1e3a2e' : '#e8f5e9') : 'transparent',
                      color: filterDietary.includes(tag) ? greenColor : secondaryText,
                    }}
                  >
                    {tag}
                  </button>
                ))}
                {filterDietary.length > 0 && (
                  <button onClick={() => setFilterDietary([])} style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: accentColor, textDecoration: 'underline' }}>
                    Clear filters
                  </button>
                )}
              </div>

              {/* Recipe Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {sortedRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '16px', border: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: accentLight, color: accentColor, textTransform: 'uppercase', fontWeight: 600 }}>
                        {recipe.category}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                        aria-label={`Favorite ${recipe.title}`}
                      >
                        {recipe.favorite ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.3 }}>{recipe.title}</h3>
                    <p style={{ fontSize: '13px', color: secondaryText, margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {recipe.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: secondaryText, marginBottom: '8px' }}>
                      <span>⏱ {formatTime(recipe.prepTime + recipe.cookTime)}</span>
                      <span>👥 {recipe.servings} servings</span>
                      <span>🔥 {recipe.nutrition.calories} cal</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {recipe.dietaryTags.slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isDarkMode ? '#1e3a2e' : '#e8f5e9', color: greenColor }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span style={{ color: '#f59e0b', fontSize: '12px' }}>★</span>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{recipe.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '11px', color: secondaryText }}>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6' }}>{recipe.difficulty}</span>
                      <span>Cooked {recipe.timesCooked}x</span>
                    </div>
                  </div>
                ))}
              </div>

              {sortedRecipes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <p style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</p>
                  <p style={{ fontSize: '16px', fontWeight: 500 }}>No recipes found</p>
                  <p style={{ fontSize: '13px' }}>Try adjusting your filters or add a new recipe.</p>
                </div>
              )}
            </div>
          )}

          {/* Meal Plan View */}
          {activeView === 'meal-plan' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: cardBg, color: textColor }}>← Prev Week</button>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                    {currentWeekOffset === 0 ? 'This Week' : currentWeekOffset > 0 ? `${currentWeekOffset} Week${currentWeekOffset > 1 ? 's' : ''} Ahead` : `${Math.abs(currentWeekOffset)} Week${Math.abs(currentWeekOffset) > 1 ? 's' : ''} Ago`}
                  </h2>
                  <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} style={{ padding: '6px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: cardBg, color: textColor }}>Next Week →</button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={generateShoppingList} style={{ padding: '8px 16px', backgroundColor: greenColor, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    🛒 Generate Shopping List
                  </button>
                  <button onClick={() => setShowNutritionSummary(true)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', backgroundColor: cardBg, color: textColor }}>
                    📊 Weekly Nutrition
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${DAYS_OF_WEEK.length}, 1fr)`, gap: '1px', backgroundColor: borderColor, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                {/* Header row */}
                <div style={{ backgroundColor: cardBg, padding: '12px 8px', fontWeight: 600, fontSize: '12px', color: secondaryText }} />
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} style={{ backgroundColor: cardBg, padding: '12px 8px', fontWeight: 600, fontSize: '12px', textAlign: 'center', color: secondaryText }}>
                    {day}
                  </div>
                ))}

                {/* Meal slot rows */}
                {MEAL_SLOTS.map(slot => (
                  <>
                    <div key={`${slot}-label`} style={{ backgroundColor: cardBg, padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: secondaryText, textTransform: 'capitalize', display: 'flex', alignItems: 'center' }}>
                      {slot}
                    </div>
                    {DAYS_OF_WEEK.map(day => {
                      const recipe = getMealPlanRecipe(day, slot);
                      return (
                        <div key={`${slot}-${day}`} style={{ backgroundColor: cardBg, padding: '8px', minHeight: '70px', position: 'relative' }}>
                          {recipe ? (
                            <div style={{ fontSize: '11px', padding: '6px', borderRadius: '6px', backgroundColor: accentLight, border: `1px solid ${accentColor}20`, height: '100%' }}>
                              <div style={{ fontWeight: 600, marginBottom: '2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recipe.title}</div>
                              <div style={{ color: secondaryText, fontSize: '10px' }}>{recipe.nutrition.calories} cal</div>
                              <button
                                onClick={() => removeFromMealPlan(day, slot)}
                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: secondaryText }}
                                aria-label={`Remove ${recipe.title} from ${day} ${slot}`}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <select
                              value=""
                              onChange={(e) => { if (e.target.value) assignToMealPlan(day, slot, e.target.value); }}
                              style={{ width: '100%', height: '100%', border: `1px dashed ${borderColor}`, borderRadius: '6px', backgroundColor: 'transparent', color: secondaryText, fontSize: '11px', cursor: 'pointer', padding: '4px' }}
                              aria-label={`Assign recipe to ${day} ${slot}`}
                            >
                              <option value="">+ Add</option>
                              {recipes.filter(r => r.category === slot || slot === 'snack').map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          )}

          {/* Shopping List View */}
          {activeView === 'shopping' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Shopping List</h2>
                  <p style={{ fontSize: '13px', color: secondaryText, margin: '4px 0 0' }}>
                    {shoppingList.length > 0 ? `${shoppingList.filter((_, i) => !shoppingChecked[shoppingList[i]?.name]).length} of ${shoppingList.length} items remaining` : 'Generate a shopping list from your meal plan'}
                  </p>
                </div>
                <button onClick={generateShoppingList} style={{ padding: '8px 16px', backgroundColor: greenColor, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  🔄 Regenerate
                </button>
              </div>

              {shoppingList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: secondaryText }}>
                  <p style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</p>
                  <p style={{ fontSize: '16px', fontWeight: 500 }}>No shopping list yet</p>
                  <p style={{ fontSize: '13px' }}>Go to Meal Plan, add recipes, then click "Generate Shopping List".</p>
                </div>
              ) : (
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                  {shoppingList.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleShoppingItem(item.name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        borderBottom: idx < shoppingList.length - 1 ? `1px solid ${borderColor}` : 'none',
                        cursor: 'pointer', backgroundColor: shoppingChecked[item.name] ? (isDarkMode ? '#1e2a1e' : '#f0fdf4') : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!shoppingChecked[item.name]}
                        onChange={() => toggleShoppingItem(item.name)}
                        style={{ cursor: 'pointer' }}
                        aria-label={`Check ${item.name}`}
                      />
                      <span style={{ flex: 1, fontSize: '14px', textDecoration: shoppingChecked[item.name] ? 'line-through' : 'none', color: shoppingChecked[item.name] ? secondaryText : textColor }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '13px', color: secondaryText, fontWeight: 500 }}>
                        {item.amount} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nutrition View */}
          {activeView === 'nutrition' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Nutrition Overview</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Recipes', value: recipes.length, icon: '📖', color: accentColor },
                  { label: 'Favorites', value: recipes.filter(r => r.favorite).length, icon: '❤️', color: '#e07a5f' },
                  { label: 'Times Cooked', value: recipes.reduce((sum, r) => sum + r.timesCooked, 0), icon: '👨‍🍳', color: greenColor },
                  { label: 'Avg Rating', value: recipes.length > 0 ? (recipes.reduce((sum, r) => sum + r.rating, 0) / recipes.length).toFixed(1) : '0', icon: '⭐', color: '#f59e0b' },
                ].map(stat => (
                  <div key={stat.label} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                      <span style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: secondaryText }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Recipes by Category</h3>
                  {Object.entries(getCategoryStats()).map(([category, count]) => {
                    const pct = recipes.length > 0 ? (count / recipes.length) * 100 : 0;
                    return (
                      <div key={category} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ textTransform: 'capitalize' }}>{category}</span>
                          <span style={{ color: secondaryText }}>{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: accentColor, borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Difficulty Distribution</h3>
                  {DIFFICULTY_LEVELS.map(level => {
                    const count = recipes.filter(r => r.difficulty === level).length;
                    const pct = recipes.length > 0 ? (count / recipes.length) * 100 : 0;
                    const levelColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
                    return (
                      <div key={level} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: levelColors[level], display: 'inline-block' }} />
                            {level}
                          </span>
                          <span style={{ color: secondaryText }}>{count}</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: isDarkMode ? '#2a2a4a' : '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: levelColors[level], borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Average Nutrition per Recipe</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  {recipes.length > 0 ? (
                    <>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: accentColor }}>{Math.round(recipes.reduce((s, r) => s + r.nutrition.calories, 0) / recipes.length)}</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Calories</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{Math.round(recipes.reduce((s, r) => s + r.nutrition.protein, 0) / recipes.length)}g</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Protein</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{Math.round(recipes.reduce((s, r) => s + r.nutrition.carbs, 0) / recipes.length)}g</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Carbs</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{Math.round(recipes.reduce((s, r) => s + r.nutrition.fat, 0) / recipes.length)}g</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Fat</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: greenColor }}>{Math.round(recipes.reduce((s, r) => s + r.nutrition.fiber, 0) / recipes.length)}g</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Fiber</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: secondaryText, fontSize: '13px' }}>No recipes to analyze</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setSelectedRecipe(null)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', backgroundColor: accentLight, color: accentColor, textTransform: 'uppercase', fontWeight: 600 }}>{selectedRecipe.category}</span>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6', color: secondaryText }}>{selectedRecipe.difficulty}</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{selectedRecipe.title}</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedRecipe.id); setSelectedRecipe(prev => ({ ...prev, favorite: !prev.favorite })); }} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }} aria-label="Toggle favorite">
                  {selectedRecipe.favorite ? '❤️' : '🤍'}
                </button>
                <button onClick={() => { setEditingRecipe(selectedRecipe); setShowEditModal(true); setSelectedRecipe(null); }} style={{ padding: '6px 12px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6', color: textColor, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                <button onClick={() => deleteRecipe(selectedRecipe.id)} style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                <button onClick={() => setSelectedRecipe(null)} style={{ padding: '6px 12px', backgroundColor: isDarkMode ? '#2a2a4a' : '#f3f4f6', color: textColor, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: secondaryText, lineHeight: 1.6, marginBottom: '16px' }}>{selectedRecipe.description}</p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <span>⏱</span>
                <span>Prep: {formatTime(selectedRecipe.prepTime)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <span>🍳</span>
                <span>Cook: {formatTime(selectedRecipe.cookTime)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <span>👥</span>
                <span>{selectedRecipe.servings} servings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <span>👨‍🍳</span>
                <span>Cooked {selectedRecipe.timesCooked} times</span>
              </div>
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: secondaryText }}>Rating:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => { rateRecipe(selectedRecipe.id, star); setSelectedRecipe(prev => ({ ...prev, rating: star })); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: star <= selectedRecipe.rating ? '#f59e0b' : '#d1d5db' }}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedRecipe.rating.toFixed(1)}</span>
            </div>

            {/* Dietary tags */}
            {selectedRecipe.dietaryTags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {selectedRecipe.dietaryTags.map(tag => (
                  <span key={tag} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', backgroundColor: isDarkMode ? '#1e3a2e' : '#e8f5e9', color: greenColor }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Nutrition */}
            <div style={{ backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Nutrition per Serving</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[
                  { label: 'Calories', value: selectedRecipe.nutrition.calories, unit: '', color: accentColor },
                  { label: 'Protein', value: selectedRecipe.nutrition.protein, unit: 'g', color: '#3b82f6' },
                  { label: 'Carbs', value: selectedRecipe.nutrition.carbs, unit: 'g', color: '#f59e0b' },
                  { label: 'Fat', value: selectedRecipe.nutrition.fat, unit: 'g', color: '#ef4444' },
                  { label: 'Fiber', value: selectedRecipe.nutrition.fiber, unit: 'g', color: greenColor },
                ].map(n => (
                  <div key={n.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: n.color }}>{n.value}{n.unit}</div>
                    <div style={{ fontSize: '11px', color: secondaryText }}>{n.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Ingredients ({selectedRecipe.ingredients.length})</h3>
              {selectedRecipe.ingredients.map(ing => (
                <div key={ing.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px', borderBottom: `1px solid ${borderColor}` }}>
                  <span style={{ color: accentColor, fontWeight: 600, minWidth: '60px' }}>{ing.amount} {ing.unit}</span>
                  <span>{ing.name}</span>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Instructions</h3>
              {selectedRecipe.instructions.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', padding: '8px 0', fontSize: '13px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: accentLight, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <span style={{ lineHeight: 1.6 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            {selectedRecipe.notes && (
              <div style={{ backgroundColor: isDarkMode ? '#2a2a1e' : '#fffbeb', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: `1px solid ${isDarkMode ? '#4a4a2e' : '#fde68a'}` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', marginBottom: '4px' }}>📝 Notes</div>
                <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{selectedRecipe.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
              <button
                onClick={() => { incrementTimesCooked(selectedRecipe.id); setSelectedRecipe(prev => ({ ...prev, timesCooked: prev.timesCooked + 1 })); }}
                style={{ padding: '8px 16px', backgroundColor: greenColor, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                👨‍🍳 Mark as Cooked
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Recipe Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowCreateModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Create New Recipe</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              createRecipe({
                title: fd.get('title'),
                description: fd.get('description'),
                category: fd.get('category'),
                difficulty: fd.get('difficulty'),
                prepTime: fd.get('prepTime'),
                cookTime: fd.get('cookTime'),
                servings: fd.get('servings'),
                ingredientsText: fd.get('ingredientsText'),
                instructionsText: fd.get('instructionsText'),
                calories: fd.get('calories'),
                protein: fd.get('protein'),
                carbs: fd.get('carbs'),
                fat: fd.get('fat'),
                fiber: fd.get('fiber'),
                notes: fd.get('notes'),
                dietaryTags: DIETARY_TAGS.filter(tag => fd.get(`dietary_${tag}`)),
              });
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Recipe Title *</label>
                <input name="title" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Description</label>
                <textarea name="description" rows={2} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Category</label>
                  <select name="category" defaultValue="dinner" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Difficulty</label>
                  <select name="difficulty" defaultValue="medium" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Servings</label>
                  <input name="servings" type="number" min="1" defaultValue="4" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Prep Time (min)</label>
                  <input name="prepTime" type="number" min="0" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Cook Time (min)</label>
                  <input name="cookTime" type="number" min="0" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Ingredients (one per line: amount unit name)</label>
                <textarea name="ingredientsText" rows={4} placeholder="2 cups flour&#10;1 tsp salt&#10;3 whole eggs" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Instructions (one step per line)</label>
                <textarea name="instructionsText" rows={4} placeholder="Preheat oven to 350°F.&#10;Mix dry ingredients.&#10;Add wet ingredients and stir." style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Dietary Tags</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {DIETARY_TAGS.map(tag => (
                    <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" name={`dietary_${tag}`} />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Nutrition per Serving</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: secondaryText }}>Calories</label>
                    <input name="calories" type="number" min="0" style={{ width: '100%', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: secondaryText }}>Protein (g)</label>
                    <input name="protein" type="number" min="0" style={{ width: '100%', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: secondaryText }}>Carbs (g)</label>
                    <input name="carbs" type="number" min="0" style={{ width: '100%', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: secondaryText }}>Fat (g)</label>
                    <input name="fat" type="number" min="0" style={{ width: '100%', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: secondaryText }}>Fiber (g)</label>
                    <input name="fiber" type="number" min="0" style={{ width: '100%', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '12px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Notes</label>
                <textarea name="notes" rows={2} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Create Recipe</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Recipe Modal */}
      {showEditModal && editingRecipe && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => { setShowEditModal(false); setEditingRecipe(null); }}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Edit Recipe</h2>
              <button onClick={() => { setShowEditModal(false); setEditingRecipe(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              updateRecipe(editingRecipe.id, {
                title: fd.get('title'),
                description: fd.get('description'),
                category: fd.get('category'),
                difficulty: fd.get('difficulty'),
                prepTime: parseInt(fd.get('prepTime')) || 0,
                cookTime: parseInt(fd.get('cookTime')) || 0,
                servings: parseInt(fd.get('servings')) || 1,
                notes: fd.get('notes'),
              });
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Recipe Title *</label>
                <input name="title" required defaultValue={editingRecipe.title} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Description</label>
                <textarea name="description" rows={2} defaultValue={editingRecipe.description} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Category</label>
                  <select name="category" defaultValue={editingRecipe.category} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Difficulty</label>
                  <select name="difficulty" defaultValue={editingRecipe.difficulty} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Servings</label>
                  <input name="servings" type="number" min="1" defaultValue={editingRecipe.servings} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Prep Time (min)</label>
                  <input name="prepTime" type="number" min="0" defaultValue={editingRecipe.prepTime} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Cook Time (min)</label>
                  <input name="cookTime" type="number" min="0" defaultValue={editingRecipe.cookTime} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: secondaryText, marginBottom: '4px' }}>Notes</label>
                <textarea name="notes" rows={2} defaultValue={editingRecipe.notes} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingRecipe(null); }} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Nutrition Summary Modal */}
      {showNutritionSummary && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowNutritionSummary(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Weekly Nutrition Summary</h2>
              <button onClick={() => setShowNutritionSummary(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>

            {(() => {
              const weekly = getWeeklyNutrition();
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '24px', padding: '16px', backgroundColor: isDarkMode ? '#1a1a2e' : '#f9fafb', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: accentColor }}>{weekly.calories}</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>Total Calories</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>{weekly.protein}g</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>Protein</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>{weekly.carbs}g</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>Carbs</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>{weekly.fat}g</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>Fat</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: secondaryText, textAlign: 'center', marginBottom: '20px' }}>
                    {weekly.mealCount} meals planned this week
                    {weekly.mealCount > 0 && ` • ~${Math.round(weekly.calories / 7)} cal/day avg`}
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Daily Breakdown</h3>
                  {DAYS_OF_WEEK.map(day => {
                    const daily = getDailyNutrition(day);
                    return (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '13px' }}>
                        <span style={{ fontWeight: 600, minWidth: '80px' }}>{day}</span>
                        <span style={{ color: accentColor, minWidth: '60px' }}>{daily.calories} cal</span>
                        <span style={{ color: '#3b82f6', minWidth: '40px' }}>{daily.protein}g P</span>
                        <span style={{ color: '#f59e0b', minWidth: '40px' }}>{daily.carbs}g C</span>
                        <span style={{ color: '#ef4444', minWidth: '40px' }}>{daily.fat}g F</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
