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

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', icon: '🥞' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: '🍝' },
  { id: 'dessert', label: 'Dessert', icon: '🍰' },
  { id: 'snack', label: 'Snack', icon: '🍿' },
  { id: 'drink', label: 'Drink', icon: '🥤' },
];

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const INITIAL_RECIPES = [
  {
    id: 'r1',
    title: 'Classic Pancakes',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    rating: 4.8,
    reviewCount: 124,
    author: { id: 'u1', name: 'Chef Maria', avatar: 'CM' },
    image: 'pancakes.jpg',
    description: 'Fluffy buttermilk pancakes with maple syrup and fresh berries. A perfect weekend breakfast treat.',
    ingredients: [
      { id: 'i1', name: 'All-purpose flour', amount: '2', unit: 'cups' },
      { id: 'i2', name: 'Buttermilk', amount: '1.5', unit: 'cups' },
      { id: 'i3', name: 'Eggs', amount: '2', unit: 'large' },
      { id: 'i4', name: 'Butter (melted)', amount: '3', unit: 'tbsp' },
      { id: 'i5', name: 'Sugar', amount: '2', unit: 'tbsp' },
      { id: 'i6', name: 'Baking powder', amount: '2', unit: 'tsp' },
      { id: 'i7', name: 'Salt', amount: '0.5', unit: 'tsp' },
    ],
    steps: [
      { id: 's1', text: 'Mix flour, sugar, baking powder, and salt in a large bowl.', timer: null },
      { id: 's2', text: 'Whisk buttermilk, eggs, and melted butter in a separate bowl.', timer: null },
      { id: 's3', text: 'Pour wet ingredients into dry and stir until just combined. Do not overmix.', timer: null },
      { id: 's4', text: 'Heat a griddle over medium heat and lightly butter it.', timer: 120 },
      { id: 's5', text: 'Pour 1/4 cup batter per pancake. Cook until bubbles form on surface.', timer: 180 },
      { id: 's6', text: 'Flip and cook until golden brown on the other side.', timer: 120 },
    ],
    tags: ['vegetarian', 'kid-friendly', 'quick'],
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'r2',
    title: 'Grilled Caesar Salad',
    category: 'lunch',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    rating: 4.5,
    reviewCount: 87,
    author: { id: 'u2', name: 'Chef Tony', avatar: 'CT' },
    image: 'caesar.jpg',
    description: 'A smoky twist on the classic Caesar with grilled romaine hearts, homemade dressing, and parmesan crisps.',
    ingredients: [
      { id: 'i8', name: 'Romaine hearts', amount: '2', unit: 'whole' },
      { id: 'i9', name: 'Parmesan cheese', amount: '0.5', unit: 'cup' },
      { id: 'i10', name: 'Anchovy fillets', amount: '3', unit: 'pieces' },
      { id: 'i11', name: 'Garlic cloves', amount: '2', unit: 'cloves' },
      { id: 'i12', name: 'Lemon juice', amount: '2', unit: 'tbsp' },
      { id: 'i13', name: 'Olive oil', amount: '3', unit: 'tbsp' },
      { id: 'i14', name: 'Dijon mustard', amount: '1', unit: 'tsp' },
      { id: 'i15', name: 'Croutons', amount: '1', unit: 'cup' },
    ],
    steps: [
      { id: 's7', text: 'Make the dressing: blend anchovies, garlic, lemon juice, mustard, and olive oil.', timer: null },
      { id: 's8', text: 'Halve romaine hearts and brush with olive oil.', timer: null },
      { id: 's9', text: 'Grill romaine cut-side down until charred, about 2 minutes.', timer: 120 },
      { id: 's10', text: 'Plate grilled romaine, drizzle with dressing, top with parmesan and croutons.', timer: null },
    ],
    tags: ['high-protein', 'grilling'],
    createdAt: '2025-01-09T12:00:00Z',
  },
  {
    id: 'r3',
    title: 'Beef Bolognese',
    category: 'dinner',
    difficulty: 'medium',
    prepTime: 20,
    cookTime: 90,
    servings: 6,
    rating: 4.9,
    reviewCount: 203,
    author: { id: 'u3', name: 'Chef Elena', avatar: 'CE' },
    image: 'bolognese.jpg',
    description: 'A rich, slow-simmered meat sauce with tomatoes, red wine, and aromatic vegetables served over fresh pasta.',
    ingredients: [
      { id: 'i16', name: 'Ground beef', amount: '1', unit: 'lb' },
      { id: 'i17', name: 'Onion (diced)', amount: '1', unit: 'large' },
      { id: 'i18', name: 'Carrots (diced)', amount: '2', unit: 'medium' },
      { id: 'i19', name: 'Celery (diced)', amount: '2', unit: 'stalks' },
      { id: 'i20', name: 'Crushed tomatoes', amount: '28', unit: 'oz can' },
      { id: 'i21', name: 'Red wine', amount: '0.5', unit: 'cup' },
      { id: 'i22', name: 'Tomato paste', amount: '2', unit: 'tbsp' },
      { id: 'i23', name: 'Garlic cloves', amount: '4', unit: 'cloves' },
      { id: 'i24', name: 'Italian seasoning', amount: '1', unit: 'tbsp' },
      { id: 'i25', name: 'Spaghetti', amount: '1', unit: 'lb' },
    ],
    steps: [
      { id: 's11', text: 'Sauté onion, carrot, and celery in olive oil until softened.', timer: 480 },
      { id: 's12', text: 'Add garlic and cook for 1 minute until fragrant.', timer: 60 },
      { id: 's13', text: 'Add ground beef and cook until browned, breaking up with a spoon.', timer: 600 },
      { id: 's14', text: 'Pour in red wine and scrape up any browned bits.', timer: 120 },
      { id: 's15', text: 'Add crushed tomatoes, tomato paste, and Italian seasoning. Stir well.', timer: null },
      { id: 's16', text: 'Simmer on low heat, stirring occasionally, for at least 1 hour.', timer: 3600 },
      { id: 's17', text: 'Cook spaghetti according to package directions. Drain and serve with sauce.', timer: 600 },
    ],
    tags: ['comfort-food', 'italian', 'meal-prep'],
    createdAt: '2025-01-08T18:00:00Z',
  },
  {
    id: 'r4',
    title: 'Chocolate Lava Cake',
    category: 'dessert',
    difficulty: 'hard',
    prepTime: 15,
    cookTime: 14,
    servings: 4,
    rating: 4.7,
    reviewCount: 156,
    author: { id: 'u1', name: 'Chef Maria', avatar: 'CM' },
    image: 'lavacake.jpg',
    description: 'Decadent individual chocolate cakes with a warm, gooey molten center. Served with vanilla ice cream.',
    ingredients: [
      { id: 'i26', name: 'Dark chocolate (70%)', amount: '6', unit: 'oz' },
      { id: 'i27', name: 'Butter', amount: '0.5', unit: 'cup' },
      { id: 'i28', name: 'Eggs', amount: '2', unit: 'large' },
      { id: 'i29', name: 'Egg yolks', amount: '2', unit: 'large' },
      { id: 'i30', name: 'Sugar', amount: '0.25', unit: 'cup' },
      { id: 'i31', name: 'Flour', amount: '2', unit: 'tbsp' },
      { id: 'i32', name: 'Vanilla extract', amount: '1', unit: 'tsp' },
    ],
    steps: [
      { id: 's18', text: 'Preheat oven to 425°F. Butter and flour four ramekins.', timer: null },
      { id: 's19', text: 'Melt chocolate and butter together over a double boiler.', timer: 300 },
      { id: 's20', text: 'Whisk eggs, yolks, sugar, and vanilla until thick and pale.', timer: null },
      { id: 's21', text: 'Fold melted chocolate into egg mixture, then fold in flour.', timer: null },
      { id: 's22', text: 'Divide batter among ramekins. Bake for exactly 12-14 minutes.', timer: 780 },
      { id: 's23', text: 'Let cool 1 minute, then invert onto plates. Serve immediately with ice cream.', timer: 60 },
    ],
    tags: ['gluten-light', 'date-night', 'impressive'],
    createdAt: '2025-01-07T20:00:00Z',
  },
  {
    id: 'r5',
    title: 'Avocado Toast Supreme',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 5,
    servings: 2,
    rating: 4.3,
    reviewCount: 95,
    author: { id: 'u4', name: 'Chef Kai', avatar: 'CK' },
    image: 'avotoast.jpg',
    description: 'Elevated avocado toast with poached eggs, everything bagel seasoning, pickled onions, and microgreens.',
    ingredients: [
      { id: 'i33', name: 'Sourdough bread', amount: '2', unit: 'slices' },
      { id: 'i34', name: 'Avocado', amount: '1', unit: 'large' },
      { id: 'i35', name: 'Eggs', amount: '2', unit: 'large' },
      { id: 'i36', name: 'Everything seasoning', amount: '1', unit: 'tsp' },
      { id: 'i37', name: 'Red pepper flakes', amount: '0.25', unit: 'tsp' },
      { id: 'i38', name: 'Lemon juice', amount: '1', unit: 'tsp' },
    ],
    steps: [
      { id: 's24', text: 'Toast sourdough slices until golden and crispy.', timer: 180 },
      { id: 's25', text: 'Mash avocado with lemon juice, salt, and pepper.', timer: null },
      { id: 's26', text: 'Poach eggs in simmering water with a splash of vinegar.', timer: 210 },
      { id: 's27', text: 'Spread avocado on toast, top with poached egg and seasonings.', timer: null },
    ],
    tags: ['vegetarian', 'quick', 'healthy'],
    createdAt: '2025-01-06T09:00:00Z',
  },
  {
    id: 'r6',
    title: 'Thai Green Curry',
    category: 'dinner',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    rating: 4.6,
    reviewCount: 134,
    author: { id: 'u2', name: 'Chef Tony', avatar: 'CT' },
    image: 'greencurry.jpg',
    description: 'Aromatic coconut-based curry with chicken, bamboo shoots, Thai basil, and jasmine rice.',
    ingredients: [
      { id: 'i39', name: 'Chicken breast', amount: '1', unit: 'lb' },
      { id: 'i40', name: 'Coconut milk', amount: '14', unit: 'oz' },
      { id: 'i41', name: 'Green curry paste', amount: '3', unit: 'tbsp' },
      { id: 'i42', name: 'Bamboo shoots', amount: '1', unit: 'cup' },
      { id: 'i43', name: 'Thai basil', amount: '0.5', unit: 'cup' },
      { id: 'i44', name: 'Fish sauce', amount: '2', unit: 'tbsp' },
      { id: 'i45', name: 'Brown sugar', amount: '1', unit: 'tbsp' },
      { id: 'i46', name: 'Jasmine rice', amount: '2', unit: 'cups' },
    ],
    steps: [
      { id: 's28', text: 'Cook jasmine rice according to package directions.', timer: 900 },
      { id: 's29', text: 'Fry curry paste in a bit of coconut cream for 2 minutes until fragrant.', timer: 120 },
      { id: 's30', text: 'Add sliced chicken and cook until no longer pink.', timer: 300 },
      { id: 's31', text: 'Pour in remaining coconut milk, bamboo shoots, fish sauce, and sugar. Simmer.', timer: 600 },
      { id: 's32', text: 'Stir in Thai basil just before serving. Serve over jasmine rice.', timer: null },
    ],
    tags: ['asian', 'spicy', 'gluten-free'],
    createdAt: '2025-01-05T19:00:00Z',
  },
  {
    id: 'r7',
    title: 'Mango Smoothie Bowl',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    rating: 4.4,
    reviewCount: 67,
    author: { id: 'u4', name: 'Chef Kai', avatar: 'CK' },
    image: 'smoothiebowl.jpg',
    description: 'Tropical smoothie bowl topped with fresh fruit, granola, coconut flakes, and chia seeds.',
    ingredients: [
      { id: 'i47', name: 'Frozen mango', amount: '1.5', unit: 'cups' },
      { id: 'i48', name: 'Banana', amount: '1', unit: 'medium' },
      { id: 'i49', name: 'Greek yogurt', amount: '0.5', unit: 'cup' },
      { id: 'i50', name: 'Almond milk', amount: '0.25', unit: 'cup' },
      { id: 'i51', name: 'Granola', amount: '0.25', unit: 'cup' },
      { id: 'i52', name: 'Coconut flakes', amount: '1', unit: 'tbsp' },
      { id: 'i53', name: 'Chia seeds', amount: '1', unit: 'tsp' },
    ],
    steps: [
      { id: 's33', text: 'Blend mango, banana, yogurt, and almond milk until thick and smooth.', timer: null },
      { id: 's34', text: 'Pour into a bowl. Top with granola, coconut, chia seeds, and extra fruit.', timer: null },
    ],
    tags: ['vegetarian', 'healthy', 'no-cook'],
    createdAt: '2025-01-04T07:30:00Z',
  },
  {
    id: 'r8',
    title: 'Energy Bites',
    category: 'snack',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 0,
    servings: 12,
    rating: 4.2,
    reviewCount: 54,
    author: { id: 'u3', name: 'Chef Elena', avatar: 'CE' },
    image: 'energybites.jpg',
    description: 'No-bake peanut butter oat balls with chocolate chips, honey, and flaxseed. Perfect pre-workout fuel.',
    ingredients: [
      { id: 'i54', name: 'Rolled oats', amount: '1', unit: 'cup' },
      { id: 'i55', name: 'Peanut butter', amount: '0.5', unit: 'cup' },
      { id: 'i56', name: 'Honey', amount: '0.25', unit: 'cup' },
      { id: 'i57', name: 'Chocolate chips', amount: '0.25', unit: 'cup' },
      { id: 'i58', name: 'Ground flaxseed', amount: '2', unit: 'tbsp' },
      { id: 'i59', name: 'Vanilla extract', amount: '1', unit: 'tsp' },
    ],
    steps: [
      { id: 's35', text: 'Mix all ingredients in a large bowl until fully combined.', timer: null },
      { id: 's36', text: 'Refrigerate mixture for 30 minutes to firm up.', timer: 1800 },
      { id: 's37', text: 'Roll into 12 equal-sized balls and store in an airtight container.', timer: null },
    ],
    tags: ['no-bake', 'meal-prep', 'kid-friendly'],
    createdAt: '2025-01-03T14:00:00Z',
  },
  {
    id: 'r9',
    title: 'Iced Matcha Latte',
    category: 'drink',
    difficulty: 'easy',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    rating: 4.1,
    reviewCount: 43,
    author: { id: 'u1', name: 'Chef Maria', avatar: 'CM' },
    image: 'matcha.jpg',
    description: 'Creamy iced matcha latte with oat milk and a touch of vanilla. Energizing and refreshing.',
    ingredients: [
      { id: 'i60', name: 'Matcha powder', amount: '2', unit: 'tsp' },
      { id: 'i61', name: 'Hot water', amount: '2', unit: 'tbsp' },
      { id: 'i62', name: 'Oat milk', amount: '1', unit: 'cup' },
      { id: 'i63', name: 'Vanilla syrup', amount: '1', unit: 'tbsp' },
      { id: 'i64', name: 'Ice', amount: '1', unit: 'cup' },
    ],
    steps: [
      { id: 's38', text: 'Whisk matcha with hot water until smooth and free of lumps.', timer: null },
      { id: 's39', text: 'Fill a glass with ice. Add vanilla syrup and oat milk.', timer: null },
      { id: 's40', text: 'Pour matcha over the top and stir gently. Enjoy!', timer: null },
    ],
    tags: ['caffeine', 'vegan', 'quick'],
    createdAt: '2025-01-02T10:00:00Z',
  },
  {
    id: 'r10',
    title: 'Stuffed Bell Peppers',
    category: 'dinner',
    difficulty: 'medium',
    prepTime: 20,
    cookTime: 35,
    servings: 4,
    rating: 4.5,
    reviewCount: 89,
    author: { id: 'u3', name: 'Chef Elena', avatar: 'CE' },
    image: 'stuffedpeppers.jpg',
    description: 'Colorful bell peppers stuffed with seasoned ground turkey, rice, black beans, corn, and topped with melted cheese.',
    ingredients: [
      { id: 'i65', name: 'Bell peppers', amount: '4', unit: 'large' },
      { id: 'i66', name: 'Ground turkey', amount: '1', unit: 'lb' },
      { id: 'i67', name: 'Cooked rice', amount: '1', unit: 'cup' },
      { id: 'i68', name: 'Black beans', amount: '1', unit: 'can' },
      { id: 'i69', name: 'Corn', amount: '0.5', unit: 'cup' },
      { id: 'i70', name: 'Shredded cheese', amount: '1', unit: 'cup' },
      { id: 'i71', name: 'Cumin', amount: '1', unit: 'tsp' },
      { id: 'i72', name: 'Salsa', amount: '0.5', unit: 'cup' },
    ],
    steps: [
      { id: 's41', text: 'Preheat oven to 375°F. Cut tops off peppers and remove seeds.', timer: null },
      { id: 's42', text: 'Cook ground turkey with cumin and salt until browned.', timer: 480 },
      { id: 's43', text: 'Mix turkey with rice, beans, corn, salsa, and half the cheese.', timer: null },
      { id: 's44', text: 'Stuff peppers with mixture and place in a baking dish.', timer: null },
      { id: 's45', text: 'Bake for 30 minutes, add remaining cheese, bake 5 more minutes.', timer: 2100 },
    ],
    tags: ['high-protein', 'meal-prep', 'gluten-free'],
    createdAt: '2025-01-01T17:00:00Z',
  },
];

const MEAL_PLAN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const USER_PROFILE = {
  id: 'current_user',
  name: 'Alex Chen',
  avatar: 'AC',
  bio: 'Home cook and food enthusiast. Love trying new cuisines!',
  recipesShared: 3,
  followersCount: 47,
  followingCount: 82,
  dietaryPreferences: ['vegetarian-friendly'],
  joinDate: '2024-08-15',
};

// ─── Helper Functions ───────────────────────────────────────────────────────────

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'hard': return '#ef4444';
    default: return '#6b7280';
  }
};

const getTotalTime = (recipe) => recipe.prepTime + recipe.cookTime;

const getStarDisplay = (rating) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  let stars = '★'.repeat(full);
  if (hasHalf) stars += '½';
  return stars;
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // ── App State ──
  const [activeTab, setActiveTab] = useState('recipes');
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [favorites, setFavorites] = useState(['r1', 'r3']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // ── Recipe Detail State ──
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [servingMultiplier, setServingMultiplier] = useState(1);

  // ── Timer State ──
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerLabel, setTimerLabel] = useState('');
  const timerRef = useRef(null);

  // ── Meal Planner State ──
  const [mealPlan, setMealPlan] = useState({});
  const [selectedMealDay, setSelectedMealDay] = useState(null);
  const [showMealPicker, setShowMealPicker] = useState(false);

  // ── Shopping List State ──
  const [shoppingList, setShoppingList] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  // ── Profile State ──
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(USER_PROFILE.name);
  const [editBio, setEditBio] = useState(USER_PROFILE.bio);
  const [profileData, setProfileData] = useState(USER_PROFILE);

  // ── Add Recipe State ──
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [newRecipeCategory, setNewRecipeCategory] = useState('dinner');
  const [newRecipeDifficulty, setNewRecipeDifficulty] = useState('medium');
  const [newRecipePrepTime, setNewRecipePrepTime] = useState('');
  const [newRecipeCookTime, setNewRecipeCookTime] = useState('');
  const [newRecipeServings, setNewRecipeServings] = useState('');
  const [newRecipeDescription, setNewRecipeDescription] = useState('');

  // ── Timer Effect ──
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            Alert.alert('Timer Done!', `${timerLabel} is complete!`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timerLabel]);

  // ── Filtered and Sorted Recipes ──
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    if (difficultyFilter !== 'all') {
      result = result.filter((r) => r.difficulty === difficultyFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.author.name.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'favorites') {
      result = result.filter((r) => favorites.includes(r.id));
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'quickest':
        result.sort((a, b) => getTotalTime(a) - getTotalTime(b));
        break;
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [recipes, selectedCategory, difficultyFilter, searchQuery, sortBy, activeTab, favorites]);

  // ── Callbacks ──
  const toggleFavorite = useCallback((recipeId) => {
    setFavorites((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  }, []);

  const startTimer = useCallback((seconds, label) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(seconds);
    setTimerLabel(label);
    setTimerActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setTimerSeconds(0);
    setTimerLabel('');
  }, []);

  const toggleStepComplete = useCallback((recipeId, stepId) => {
    setCompletedSteps((prev) => {
      const recipeSteps = prev[recipeId] || {};
      return {
        ...prev,
        [recipeId]: { ...recipeSteps, [stepId]: !recipeSteps[stepId] },
      };
    });
  }, []);

  const addToShoppingList = useCallback((recipe) => {
    const newItems = recipe.ingredients.map((ing) => ({
      id: `shop_${ing.id}_${Date.now()}`,
      name: ing.name,
      amount: `${parseFloat(ing.amount) * servingMultiplier} ${ing.unit}`,
      fromRecipe: recipe.title,
    }));
    setShoppingList((prev) => [...prev, ...newItems]);
    Alert.alert('Added!', `${recipe.ingredients.length} items added to shopping list.`);
  }, [servingMultiplier]);

  const toggleShoppingItem = useCallback((itemId) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const removeCheckedItems = useCallback(() => {
    setShoppingList((prev) => prev.filter((item) => !checkedItems[item.id]));
    setCheckedItems({});
  }, [checkedItems]);

  const addCustomShoppingItem = useCallback(() => {
    if (!newItemName.trim()) return;
    const newItem = {
      id: `custom_${Date.now()}`,
      name: newItemName.trim(),
      amount: newItemAmount.trim() || '',
      fromRecipe: 'Manual',
    };
    setShoppingList((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemAmount('');
    setShowAddItemModal(false);
  }, [newItemName, newItemAmount]);

  const assignMealToDay = useCallback((day, mealType, recipeId) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [mealType]: recipeId },
    }));
    setShowMealPicker(false);
  }, []);

  const removeMealFromDay = useCallback((day, mealType) => {
    setMealPlan((prev) => {
      const dayPlan = { ...(prev[day] || {}) };
      delete dayPlan[mealType];
      return { ...prev, [day]: dayPlan };
    });
  }, []);

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
      prepTime: parseInt(newRecipePrepTime) || 0,
      cookTime: parseInt(newRecipeCookTime) || 0,
      servings: parseInt(newRecipeServings) || 1,
      rating: 0,
      reviewCount: 0,
      author: { id: USER_PROFILE.id, name: profileData.name, avatar: profileData.avatar },
      image: 'custom.jpg',
      description: newRecipeDescription.trim() || 'No description provided.',
      ingredients: [],
      steps: [],
      tags: [],
      createdAt: new Date().toISOString(),
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    setNewRecipeTitle('');
    setNewRecipeCategory('dinner');
    setNewRecipeDifficulty('medium');
    setNewRecipePrepTime('');
    setNewRecipeCookTime('');
    setNewRecipeServings('');
    setNewRecipeDescription('');
    setShowAddRecipe(false);
  }, [newRecipeTitle, newRecipeCategory, newRecipeDifficulty, newRecipePrepTime, newRecipeCookTime, newRecipeServings, newRecipeDescription, profileData]);

  const saveProfileEdits = useCallback(() => {
    setProfileData((prev) => ({
      ...prev,
      name: editName.trim() || prev.name,
      bio: editBio.trim() || prev.bio,
    }));
    setShowEditProfile(false);
  }, [editName, editBio]);

  // ── Render: Recipe Card ──
  const renderRecipeCard = (recipe) => {
    const isFav = favorites.includes(recipe.id);
    const totalTime = getTotalTime(recipe);

    return (
      <TouchableOpacity
        key={recipe.id}
        testID={`recipe-card-${recipe.id}`}
        style={styles.recipeCard}
        onPress={() => {
          setSelectedRecipe(recipe);
          setActiveStepIndex(0);
          setServingMultiplier(1);
        }}
      >
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageEmoji}>
            {CATEGORIES.find((c) => c.id === recipe.category)?.icon || '🍽️'}
          </Text>
          <TouchableOpacity
            testID={`fav-btn-${recipe.id}`}
            style={styles.favButton}
            onPress={(e) => {
              e.stopPropagation?.();
              toggleFavorite(recipe.id);
            }}
          >
            <Text style={styles.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{recipe.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardAuthor}>by {recipe.author.name}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(recipe.difficulty) }]}>
              <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <Text style={styles.statText}>⏱ {totalTime}min</Text>
            <Text style={styles.statText}>👥 {recipe.servings}</Text>
            <Text style={styles.statText}>{getStarDisplay(recipe.rating)} ({recipe.reviewCount})</Text>
          </View>
          <View style={styles.tagRow}>
            {recipe.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Render: Recipe Detail ──
  const renderRecipeDetail = () => {
    if (!selectedRecipe) return null;
    const recipe = selectedRecipe;
    const recipeSteps = completedSteps[recipe.id] || {};

    return (
      <View style={styles.detailContainer} testID="recipe-detail">
        <View style={styles.detailHeader}>
          <TouchableOpacity testID="back-btn" onPress={() => setSelectedRecipe(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID={`detail-fav-btn-${recipe.id}`}
            onPress={() => toggleFavorite(recipe.id)}
          >
            <Text style={styles.detailFavIcon}>{favorites.includes(recipe.id) ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailScroll}>
          <Text style={styles.detailTitle}>{recipe.title}</Text>
          <Text style={styles.detailAuthor}>by {recipe.author.name}</Text>
          <Text style={styles.detailDescription}>{recipe.description}</Text>

          <View style={styles.detailMetaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Prep</Text>
              <Text style={styles.metaValue}>{recipe.prepTime}m</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Cook</Text>
              <Text style={styles.metaValue}>{recipe.cookTime}m</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Servings</Text>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
            </View>
            <View style={[styles.metaItem, { backgroundColor: getDifficultyColor(recipe.difficulty) }]}>
              <Text style={styles.metaLabel}>Level</Text>
              <Text style={styles.metaValue}>{recipe.difficulty}</Text>
            </View>
          </View>

          {/* Serving Adjuster */}
          <View style={styles.servingAdjuster} testID="serving-adjuster">
            <Text style={styles.sectionTitle}>Adjust Servings</Text>
            <View style={styles.servingControls}>
              <TouchableOpacity
                testID="decrease-servings"
                style={styles.servingBtn}
                onPress={() => setServingMultiplier((prev) => Math.max(0.5, prev - 0.5))}
              >
                <Text style={styles.servingBtnText}>−</Text>
              </TouchableOpacity>
              <Text testID="serving-display" style={styles.servingDisplay}>
                {Math.round(recipe.servings * servingMultiplier)} servings
              </Text>
              <TouchableOpacity
                testID="increase-servings"
                style={styles.servingBtn}
                onPress={() => setServingMultiplier((prev) => Math.min(10, prev + 0.5))}
              >
                <Text style={styles.servingBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <TouchableOpacity
                testID="add-to-shopping-btn"
                style={styles.addToShoppingBtn}
                onPress={() => addToShoppingList(recipe)}
              >
                <Text style={styles.addToShoppingText}>🛒 Add to List</Text>
              </TouchableOpacity>
            </View>
            {recipe.ingredients.map((ing) => (
              <View key={ing.id} style={styles.ingredientRow} testID={`ingredient-${ing.id}`}>
                <Text style={styles.ingredientAmount}>
                  {(parseFloat(ing.amount) * servingMultiplier).toFixed(1).replace(/\.0$/, '')} {ing.unit}
                </Text>
                <Text style={styles.ingredientName}>{ing.name}</Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.steps.map((step, index) => (
              <Pressable
                key={step.id}
                testID={`step-${step.id}`}
                style={[
                  styles.stepCard,
                  recipeSteps[step.id] && styles.stepCompleted,
                  index === activeStepIndex && styles.stepActive,
                ]}
                onPress={() => {
                  toggleStepComplete(recipe.id, step.id);
                  if (index < recipe.steps.length - 1) setActiveStepIndex(index + 1);
                }}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{recipeSteps[step.id] ? '✓' : index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepText, recipeSteps[step.id] && styles.stepTextCompleted]}>
                    {step.text}
                  </Text>
                  {step.timer && (
                    <TouchableOpacity
                      testID={`timer-btn-${step.id}`}
                      style={styles.timerButton}
                      onPress={() => startTimer(step.timer, `Step ${index + 1}`)}
                    >
                      <Text style={styles.timerButtonText}>⏱ Start Timer ({formatTime(step.timer)})</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagRow}>
              {recipe.tags.map((tag) => (
                <View key={tag} style={styles.detailTag}>
                  <Text style={styles.detailTagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Floating Timer */}
        {timerActive && (
          <View style={styles.floatingTimer} testID="floating-timer">
            <Text style={styles.timerLabelText}>{timerLabel}</Text>
            <Text style={styles.timerCountdown}>{formatTime(timerSeconds)}</Text>
            <TouchableOpacity testID="stop-timer-btn" onPress={stopTimer}>
              <Text style={styles.stopTimerText}>✕ Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ── Render: Meal Planner ──
  const renderMealPlanner = () => (
    <ScrollView style={styles.tabContent} testID="meal-planner">
      <Text style={styles.tabTitle}>Meal Planner</Text>
      <Text style={styles.tabSubtitle}>Plan your weekly meals</Text>

      {MEAL_PLAN_DAYS.map((day) => {
        const dayPlan = mealPlan[day] || {};
        return (
          <View key={day} style={styles.mealDayCard} testID={`meal-day-${day}`}>
            <Text style={styles.mealDayName}>{day}</Text>
            {['breakfast', 'lunch', 'dinner'].map((mealType) => {
              const recipeId = dayPlan[mealType];
              const recipe = recipeId ? recipes.find((r) => r.id === recipeId) : null;
              return (
                <View key={mealType} style={styles.mealSlot}>
                  <Text style={styles.mealTypeLabel}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                  {recipe ? (
                    <View style={styles.assignedMeal}>
                      <Text style={styles.assignedMealTitle}>{recipe.title}</Text>
                      <TouchableOpacity
                        testID={`remove-meal-${day}-${mealType}`}
                        onPress={() => removeMealFromDay(day, mealType)}
                      >
                        <Text style={styles.removeMealText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      testID={`assign-meal-${day}-${mealType}`}
                      style={styles.addMealBtn}
                      onPress={() => {
                        setSelectedMealDay({ day, mealType });
                        setShowMealPicker(true);
                      }}
                    >
                      <Text style={styles.addMealText}>+ Add {mealType}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      {/* Meal Picker Modal */}
      <Modal visible={showMealPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} testID="meal-picker-modal">
            <Text style={styles.modalTitle}>Choose a Recipe</Text>
            <ScrollView style={styles.modalScroll}>
              {recipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  testID={`pick-recipe-${recipe.id}`}
                  style={styles.mealPickerItem}
                  onPress={() => {
                    if (selectedMealDay) {
                      assignMealToDay(selectedMealDay.day, selectedMealDay.mealType, recipe.id);
                    }
                  }}
                >
                  <Text style={styles.mealPickerTitle}>{recipe.title}</Text>
                  <Text style={styles.mealPickerMeta}>
                    {getTotalTime(recipe)}min · {recipe.difficulty} · {recipe.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              testID="close-meal-picker"
              style={styles.modalCloseBtn}
              onPress={() => setShowMealPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  // ── Render: Shopping List ──
  const renderShoppingList = () => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;

    return (
      <ScrollView style={styles.tabContent} testID="shopping-list">
        <View style={styles.shoppingHeader}>
          <Text style={styles.tabTitle}>Shopping List</Text>
          <TouchableOpacity
            testID="add-custom-item-btn"
            style={styles.addItemButton}
            onPress={() => setShowAddItemModal(true)}
          >
            <Text style={styles.addItemButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.tabSubtitle}>
          {shoppingList.length} items · {checkedCount} checked
        </Text>

        {shoppingList.length === 0 ? (
          <View style={styles.emptyState} testID="empty-shopping">
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>Your shopping list is empty.</Text>
            <Text style={styles.emptySubtext}>Add ingredients from any recipe!</Text>
          </View>
        ) : (
          <>
            {shoppingList.map((item) => (
              <TouchableOpacity
                key={item.id}
                testID={`shopping-item-${item.id}`}
                style={[styles.shoppingItem, checkedItems[item.id] && styles.shoppingItemChecked]}
                onPress={() => toggleShoppingItem(item.id)}
              >
                <View style={[styles.checkbox, checkedItems[item.id] && styles.checkboxChecked]}>
                  {checkedItems[item.id] && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={styles.shoppingItemContent}>
                  <Text style={[styles.shoppingItemName, checkedItems[item.id] && styles.shoppingItemNameChecked]}>
                    {item.name}
                  </Text>
                  {item.amount ? <Text style={styles.shoppingItemAmount}>{item.amount}</Text> : null}
                  <Text style={styles.shoppingItemFrom}>From: {item.fromRecipe}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {checkedCount > 0 && (
              <TouchableOpacity
                testID="clear-checked-btn"
                style={styles.clearCheckedBtn}
                onPress={removeCheckedItems}
              >
                <Text style={styles.clearCheckedText}>🗑 Remove {checkedCount} checked items</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Add Custom Item Modal */}
        <Modal visible={showAddItemModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent} testID="add-item-modal">
              <Text style={styles.modalTitle}>Add Item</Text>
              <TextInput
                testID="new-item-name-input"
                style={styles.modalInput}
                placeholder="Item name"
                value={newItemName}
                onChangeText={setNewItemName}
              />
              <TextInput
                testID="new-item-amount-input"
                style={styles.modalInput}
                placeholder="Amount (optional)"
                value={newItemAmount}
                onChangeText={setNewItemAmount}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  testID="cancel-add-item"
                  style={styles.modalCancelBtn}
                  onPress={() => setShowAddItemModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="confirm-add-item"
                  style={styles.modalConfirmBtn}
                  onPress={addCustomShoppingItem}
                >
                  <Text style={styles.modalConfirmText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  // ── Render: Profile ──
  const renderProfile = () => (
    <ScrollView style={styles.tabContent} testID="profile-tab">
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{profileData.avatar}</Text>
        </View>
        <Text style={styles.profileName}>{profileData.name}</Text>
        <Text style={styles.profileBio}>{profileData.bio}</Text>

        <View style={styles.profileStats}>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{profileData.recipesShared}</Text>
            <Text style={styles.profileStatLabel}>Recipes</Text>
          </View>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{profileData.followersCount}</Text>
            <Text style={styles.profileStatLabel}>Followers</Text>
          </View>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{profileData.followingCount}</Text>
            <Text style={styles.profileStatLabel}>Following</Text>
          </View>
        </View>

        <TouchableOpacity
          testID="edit-profile-btn"
          style={styles.editProfileBtn}
          onPress={() => setShowEditProfile(true)}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Recipes</Text>
        {recipes
          .filter((r) => r.author.id === USER_PROFILE.id || r.author.id === 'current_user')
          .map((recipe) => renderRecipeCard(recipe))}
        {recipes.filter((r) => r.author.id === USER_PROFILE.id || r.author.id === 'current_user').length === 0 && (
          <Text style={styles.emptySubtext}>You haven't shared any recipes yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        <View style={styles.tagRow}>
          {profileData.dietaryPreferences.map((pref) => (
            <View key={pref} style={styles.prefTag}>
              <Text style={styles.prefTagText}>{pref}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorites ({favorites.length})</Text>
        {recipes
          .filter((r) => favorites.includes(r.id))
          .slice(0, 3)
          .map((recipe) => (
            <View key={recipe.id} style={styles.favPreviewRow} testID={`fav-preview-${recipe.id}`}>
              <Text style={styles.favPreviewTitle}>{recipe.title}</Text>
              <Text style={styles.favPreviewRating}>{getStarDisplay(recipe.rating)}</Text>
            </View>
          ))}
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} testID="edit-profile-modal">
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              testID="edit-name-input"
              style={styles.modalInput}
              placeholder="Name"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              testID="edit-bio-input"
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Bio"
              value={editBio}
              onChangeText={setEditBio}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                testID="cancel-edit-profile"
                style={styles.modalCancelBtn}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="save-profile-btn"
                style={styles.modalConfirmBtn}
                onPress={saveProfileEdits}
              >
                <Text style={styles.modalConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  // ── Render: Add Recipe Modal ──
  const renderAddRecipeModal = () => (
    <Modal visible={showAddRecipe} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent} testID="add-recipe-modal">
          <Text style={styles.modalTitle}>Share a Recipe</Text>
          <ScrollView style={styles.modalScroll}>
            <TextInput
              testID="new-recipe-title-input"
              style={styles.modalInput}
              placeholder="Recipe title"
              value={newRecipeTitle}
              onChangeText={setNewRecipeTitle}
            />
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  testID={`cat-chip-${cat.id}`}
                  style={[styles.chip, newRecipeCategory === cat.id && styles.chipActive]}
                  onPress={() => setNewRecipeCategory(cat.id)}
                >
                  <Text style={styles.chipText}>{cat.icon} {cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Difficulty</Text>
            <View style={styles.chipRow}>
              {DIFFICULTY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  testID={`diff-chip-${level}`}
                  style={[styles.chip, newRecipeDifficulty === level && styles.chipActive]}
                  onPress={() => setNewRecipeDifficulty(level)}
                >
                  <Text style={styles.chipText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                testID="new-recipe-prep-input"
                style={[styles.modalInput, styles.inputHalf]}
                placeholder="Prep time (min)"
                keyboardType="numeric"
                value={newRecipePrepTime}
                onChangeText={setNewRecipePrepTime}
              />
              <TextInput
                testID="new-recipe-cook-input"
                style={[styles.modalInput, styles.inputHalf]}
                placeholder="Cook time (min)"
                keyboardType="numeric"
                value={newRecipeCookTime}
                onChangeText={setNewRecipeCookTime}
              />
            </View>
            <TextInput
              testID="new-recipe-servings-input"
              style={styles.modalInput}
              placeholder="Servings"
              keyboardType="numeric"
              value={newRecipeServings}
              onChangeText={setNewRecipeServings}
            />
            <TextInput
              testID="new-recipe-desc-input"
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description"
              value={newRecipeDescription}
              onChangeText={setNewRecipeDescription}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              testID="cancel-add-recipe"
              style={styles.modalCancelBtn}
              onPress={() => setShowAddRecipe(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="submit-recipe-btn"
              style={styles.modalConfirmBtn}
              onPress={addNewRecipe}
            >
              <Text style={styles.modalConfirmText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ── Render: Main Recipes Tab ──
  const renderRecipesTab = () => (
    <View style={styles.tabContent}>
      {/* Search Bar */}
      <View style={styles.searchBar} testID="search-bar">
        <TextInput
          testID="search-input"
          style={styles.searchInput}
          placeholder="Search recipes, tags, chefs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity testID="clear-search" onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
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

      {/* Sort and Difficulty Row */}
      <View style={styles.filterRow} testID="filter-row">
        <View style={styles.sortPicker}>
          <Text style={styles.filterLabel}>Sort: </Text>
          {['newest', 'rating', 'quickest', 'popular'].map((option) => (
            <TouchableOpacity
              key={option}
              testID={`sort-${option}`}
              style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.difficultyRow}>
          <Text style={styles.filterLabel}>Level: </Text>
          {['all', ...DIFFICULTY_LEVELS].map((level) => (
            <TouchableOpacity
              key={level}
              testID={`difficulty-${level}`}
              style={[styles.sortOption, difficultyFilter === level && styles.sortOptionActive]}
              onPress={() => setDifficultyFilter(level)}
            >
              <Text style={[styles.sortOptionText, difficultyFilter === level && styles.sortOptionTextActive]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recipe List */}
      <ScrollView style={styles.recipeList} testID="recipe-list">
        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyState} testID="empty-recipes">
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or search terms.</Text>
          </View>
        ) : (
          filteredRecipes.map((recipe) => renderRecipeCard(recipe))
        )}
      </ScrollView>
    </View>
  );

  // ── Main Return ──
  if (selectedRecipe) {
    return renderRecipeDetail();
  }

  return (
    <View style={styles.container} testID="home-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>RecipeBox</Text>
        <TouchableOpacity
          testID="add-recipe-fab"
          style={styles.addRecipeFab}
          onPress={() => setShowAddRecipe(true)}
        >
          <Text style={styles.addRecipeFabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar} testID="tab-bar">
        {[
          { id: 'recipes', label: 'Recipes', icon: '🍽️' },
          { id: 'favorites', label: 'Favorites', icon: '❤️' },
          { id: 'planner', label: 'Planner', icon: '📅' },
          { id: 'shopping', label: 'Shopping', icon: '🛒' },
          { id: 'profile', label: 'Profile', icon: '👤' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            testID={`tab-${tab.id}`}
            style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {(activeTab === 'recipes' || activeTab === 'favorites') && renderRecipesTab()}
      {activeTab === 'planner' && renderMealPlanner()}
      {activeTab === 'shopping' && renderShoppingList()}
      {activeTab === 'profile' && renderProfile()}

      {/* Add Recipe Modal */}
      {renderAddRecipeModal()}

      {/* Floating Timer (on main screen) */}
      {timerActive && !selectedRecipe && (
        <View style={styles.floatingTimer} testID="main-floating-timer">
          <Text style={styles.timerLabelText}>{timerLabel}</Text>
          <Text style={styles.timerCountdown}>{formatTime(timerSeconds)}</Text>
          <TouchableOpacity testID="main-stop-timer-btn" onPress={stopTimer}>
            <Text style={styles.stopTimerText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  appTitle: { fontSize: 26, fontWeight: '800', color: '#e85d04' },
  addRecipeFab: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#e85d04',
    alignItems: 'center', justifyContent: 'center',
  },
  addRecipeFabText: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: -2 },

  // Tab Bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1,
    borderBottomColor: '#eee', paddingVertical: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#e85d04' },
  tabIcon: { fontSize: 18 },
  tabLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  tabLabelActive: { color: '#e85d04', fontWeight: '600' },
  tabContent: { flex: 1, paddingHorizontal: 16 },
  tabTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginTop: 16 },
  tabSubtitle: { fontSize: 13, color: '#777', marginBottom: 12, marginTop: 4 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, paddingHorizontal: 14, marginTop: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: '#333' },
  clearSearchText: { fontSize: 16, color: '#999', padding: 4 },

  // Categories
  categoryScroll: { marginBottom: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff', marginRight: 8,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  categoryChipActive: { backgroundColor: '#e85d04', borderColor: '#e85d04' },
  categoryIcon: { fontSize: 16, marginRight: 4 },
  categoryLabel: { fontSize: 13, color: '#555' },
  categoryLabelActive: { color: '#fff', fontWeight: '600' },

  // Filters
  filterRow: { marginBottom: 8 },
  sortPicker: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  difficultyRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  filterLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  sortOption: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: '#f0f0f0', marginRight: 6, marginBottom: 4,
  },
  sortOptionActive: { backgroundColor: '#e85d04' },
  sortOptionText: { fontSize: 12, color: '#555' },
  sortOptionTextActive: { color: '#fff', fontWeight: '600' },

  // Recipe Cards
  recipeList: { flex: 1 },
  recipeCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: '#eee',
  },
  cardImagePlaceholder: {
    height: 140, backgroundColor: '#fff3e0', alignItems: 'center',
    justifyContent: 'center', position: 'relative',
  },
  cardImageEmoji: { fontSize: 48 },
  favButton: { position: 'absolute', top: 10, right: 10, padding: 4 },
  favIcon: { fontSize: 22 },
  cardContent: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardAuthor: { fontSize: 12, color: '#888' },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  difficultyText: { fontSize: 11, color: '#fff', fontWeight: '600', textTransform: 'capitalize' },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statText: { fontSize: 12, color: '#666' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  tagText: { fontSize: 11, color: '#777' },

  // Recipe Detail
  detailContainer: { flex: 1, backgroundColor: '#fff' },
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  backButton: { fontSize: 16, color: '#e85d04', fontWeight: '600' },
  detailFavIcon: { fontSize: 24 },
  detailScroll: { flex: 1, paddingHorizontal: 20 },
  detailTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginTop: 16 },
  detailAuthor: { fontSize: 14, color: '#888', marginTop: 4 },
  detailDescription: { fontSize: 15, color: '#555', lineHeight: 22, marginTop: 12, marginBottom: 16 },
  detailMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metaItem: {
    flex: 1, alignItems: 'center', paddingVertical: 10, marginHorizontal: 4,
    borderRadius: 12, backgroundColor: '#f5f5f5',
  },
  metaLabel: { fontSize: 11, color: '#999', marginBottom: 2 },
  metaValue: { fontSize: 16, fontWeight: '700', color: '#333' },

  // Serving Adjuster
  servingAdjuster: { marginBottom: 16 },
  servingControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  servingBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#e85d04',
    alignItems: 'center', justifyContent: 'center',
  },
  servingBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  servingDisplay: { fontSize: 16, fontWeight: '600', color: '#333', marginHorizontal: 20 },

  // Sections
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },

  // Ingredients
  ingredientRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ingredientAmount: { width: 80, fontSize: 14, color: '#e85d04', fontWeight: '600' },
  ingredientName: { flex: 1, fontSize: 14, color: '#333' },
  addToShoppingBtn: { backgroundColor: '#e85d04', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addToShoppingText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Steps
  stepCard: {
    flexDirection: 'row', padding: 12, marginBottom: 8, borderRadius: 12,
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee',
  },
  stepCompleted: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  stepActive: { borderColor: '#e85d04', borderWidth: 2 },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#e0e0e0',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  stepNumberText: { fontSize: 14, fontWeight: '700', color: '#555' },
  stepContent: { flex: 1 },
  stepText: { fontSize: 14, color: '#333', lineHeight: 20 },
  stepTextCompleted: { textDecorationLine: 'line-through', color: '#999' },
  timerButton: { marginTop: 6, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#fff3e0', borderRadius: 8, alignSelf: 'flex-start' },
  timerButtonText: { fontSize: 13, color: '#e85d04', fontWeight: '600' },
  detailTag: { backgroundColor: '#fff3e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 8, marginBottom: 6 },
  detailTagText: { fontSize: 12, color: '#e85d04', fontWeight: '500' },

  // Floating Timer
  floatingTimer: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#e85d04', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14,
  },
  timerLabelText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  timerCountdown: { color: '#fff', fontSize: 22, fontWeight: '800' },
  stopTimerText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Meal Planner
  mealDayCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  mealDayName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  mealSlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  mealTypeLabel: { fontSize: 13, color: '#888', width: 80, fontWeight: '500' },
  assignedMeal: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assignedMealTitle: { fontSize: 14, color: '#333', fontWeight: '500' },
  removeMealText: { fontSize: 14, color: '#dc2626', fontWeight: '700', paddingHorizontal: 8 },
  addMealBtn: { flex: 1, paddingVertical: 4 },
  addMealText: { fontSize: 13, color: '#e85d04', fontWeight: '500' },

  // Shopping List
  shoppingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addItemButton: { backgroundColor: '#e85d04', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 16 },
  addItemButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  shoppingItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14,
    borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee',
  },
  shoppingItemChecked: { backgroundColor: '#f5f5f5', borderColor: '#ddd' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  shoppingItemContent: { flex: 1 },
  shoppingItemName: { fontSize: 15, color: '#333', fontWeight: '500' },
  shoppingItemNameChecked: { textDecorationLine: 'line-through', color: '#999' },
  shoppingItemAmount: { fontSize: 12, color: '#888', marginTop: 2 },
  shoppingItemFrom: { fontSize: 11, color: '#bbb', marginTop: 2 },
  clearCheckedBtn: {
    paddingVertical: 12, alignItems: 'center', backgroundColor: '#fee2e2',
    borderRadius: 12, marginTop: 8,
  },
  clearCheckedText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },

  // Profile
  profileHeader: { alignItems: 'center', paddingTop: 20, paddingBottom: 16 },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#e85d04',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  profileAvatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  profileName: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  profileBio: { fontSize: 14, color: '#777', textAlign: 'center', marginHorizontal: 40, marginTop: 6 },
  profileStats: { flexDirection: 'row', marginTop: 16, marginBottom: 12 },
  profileStatItem: { alignItems: 'center', marginHorizontal: 20 },
  profileStatValue: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  profileStatLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  editProfileBtn: {
    borderWidth: 1, borderColor: '#e85d04', paddingHorizontal: 24,
    paddingVertical: 8, borderRadius: 20,
  },
  editProfileText: { color: '#e85d04', fontWeight: '600', fontSize: 14 },
  prefTag: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 8 },
  prefTagText: { fontSize: 13, color: '#2e7d32', fontWeight: '500' },
  favPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  favPreviewTitle: { fontSize: 14, color: '#333' },
  favPreviewRating: { fontSize: 14, color: '#f59e0b' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: SCREEN_WIDTH - 48, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  modalInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 15, marginBottom: 12, color: '#333',
  },
  modalTextArea: { minHeight: 80, textAlignVertical: 'top' },
  modalScroll: { maxHeight: 300 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', marginRight: 8, backgroundColor: '#f5f5f5', borderRadius: 12 },
  modalCancelText: { color: '#777', fontWeight: '600', fontSize: 15 },
  modalConfirmBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', marginLeft: 8, backgroundColor: '#e85d04', borderRadius: 12 },
  modalConfirmText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  modalCloseBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  modalCloseText: { color: '#e85d04', fontWeight: '600', fontSize: 15 },

  // Misc
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#555' },
  emptySubtext: { fontSize: 13, color: '#999', marginTop: 4 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0', marginRight: 8, marginBottom: 6 },
  chipActive: { backgroundColor: '#e85d04' },
  chipText: { fontSize: 12, color: '#555' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputHalf: { flex: 1, marginRight: 6 },
  mealPickerItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  mealPickerTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  mealPickerMeta: { fontSize: 12, color: '#888', marginTop: 2 },
});
