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

const SCREEN_WIDTH = Dimensions.get('window').width;

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const DIET_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'high-protein', 'low-carb'];

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SORT_OPTIONS = [
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
  { id: 'calories-asc', label: 'Calories (Low)' },
  { id: 'calories-desc', label: 'Calories (High)' },
  { id: 'time-asc', label: 'Time (Quick)' },
  { id: 'time-desc', label: 'Time (Long)' },
  { id: 'rating-desc', label: 'Top Rated' },
];

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const RECIPES = [
  {
    id: 'r1',
    name: 'Avocado Toast with Poached Eggs',
    emoji: '🥑',
    mealType: 'breakfast',
    prepTime: 15,
    cookTime: 5,
    servings: 2,
    difficulty: 'easy',
    dietTags: ['vegetarian'],
    rating: 4.7,
    timesCooked: 12,
    ingredients: [
      { id: 'ing1', name: 'Avocado', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing2', name: 'Bread (sourdough)', quantity: 2, unit: 'slices', category: 'bakery' },
      { id: 'ing3', name: 'Eggs', quantity: 2, unit: 'whole', category: 'dairy' },
      { id: 'ing4', name: 'Cherry tomatoes', quantity: 6, unit: 'whole', category: 'produce' },
      { id: 'ing5', name: 'Red pepper flakes', quantity: 0.5, unit: 'tsp', category: 'spices' },
      { id: 'ing6', name: 'Lemon juice', quantity: 1, unit: 'tbsp', category: 'produce' },
      { id: 'ing7', name: 'Salt', quantity: 1, unit: 'pinch', category: 'spices' },
    ],
    nutrition: { calories: 420, protein: 18, carbs: 35, fat: 24, fiber: 9 },
    instructions: [
      'Toast the sourdough bread until golden brown.',
      'Mash the avocado with lemon juice and salt.',
      'Poach the eggs in simmering water for 3-4 minutes.',
      'Spread avocado on toast, top with poached eggs.',
      'Garnish with cherry tomatoes and red pepper flakes.',
    ],
    notes: 'Best with ripe avocados. Can add smoked salmon for extra protein.',
    createdAt: '2025-01-01T08:00:00Z',
  },
  {
    id: 'r2',
    name: 'Grilled Chicken Caesar Salad',
    emoji: '🥗',
    mealType: 'lunch',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    difficulty: 'easy',
    dietTags: ['high-protein', 'gluten-free'],
    rating: 4.5,
    timesCooked: 8,
    ingredients: [
      { id: 'ing8', name: 'Chicken breast', quantity: 2, unit: 'pieces', category: 'meat' },
      { id: 'ing9', name: 'Romaine lettuce', quantity: 1, unit: 'head', category: 'produce' },
      { id: 'ing10', name: 'Parmesan cheese', quantity: 0.5, unit: 'cup', category: 'dairy' },
      { id: 'ing11', name: 'Caesar dressing', quantity: 3, unit: 'tbsp', category: 'condiments' },
      { id: 'ing12', name: 'Croutons', quantity: 0.5, unit: 'cup', category: 'bakery' },
      { id: 'ing13', name: 'Lemon', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing14', name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'pantry' },
      { id: 'ing15', name: 'Garlic powder', quantity: 1, unit: 'tsp', category: 'spices' },
    ],
    nutrition: { calories: 520, protein: 42, carbs: 18, fat: 28, fiber: 4 },
    instructions: [
      'Season chicken breasts with olive oil, garlic powder, salt and pepper.',
      'Grill chicken for 6-7 minutes per side until cooked through.',
      'Chop romaine lettuce and place in a large bowl.',
      'Slice grilled chicken and arrange on top of lettuce.',
      'Add croutons, shaved parmesan, and drizzle with Caesar dressing.',
      'Squeeze lemon juice over the top and toss gently.',
    ],
    notes: 'Let chicken rest 5 minutes before slicing for juicier results.',
    createdAt: '2025-01-02T12:00:00Z',
  },
  {
    id: 'r3',
    name: 'Salmon Teriyaki Bowl',
    emoji: '🍣',
    mealType: 'dinner',
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: 'medium',
    dietTags: ['high-protein', 'dairy-free'],
    rating: 4.9,
    timesCooked: 15,
    ingredients: [
      { id: 'ing16', name: 'Salmon fillet', quantity: 2, unit: 'pieces', category: 'seafood' },
      { id: 'ing17', name: 'Sushi rice', quantity: 1.5, unit: 'cups', category: 'pantry' },
      { id: 'ing18', name: 'Soy sauce', quantity: 3, unit: 'tbsp', category: 'condiments' },
      { id: 'ing19', name: 'Mirin', quantity: 2, unit: 'tbsp', category: 'condiments' },
      { id: 'ing20', name: 'Honey', quantity: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ing21', name: 'Edamame', quantity: 0.5, unit: 'cup', category: 'frozen' },
      { id: 'ing22', name: 'Cucumber', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing23', name: 'Sesame seeds', quantity: 1, unit: 'tbsp', category: 'spices' },
      { id: 'ing24', name: 'Green onion', quantity: 2, unit: 'stalks', category: 'produce' },
    ],
    nutrition: { calories: 650, protein: 40, carbs: 62, fat: 22, fiber: 5 },
    instructions: [
      'Cook sushi rice according to package directions.',
      'Mix soy sauce, mirin, and honey for teriyaki glaze.',
      'Pan-sear salmon fillets skin-side down for 4 minutes.',
      'Flip salmon and brush with teriyaki glaze, cook 3-4 more minutes.',
      'Slice cucumber into thin rounds.',
      'Assemble bowls: rice, salmon, edamame, cucumber.',
      'Drizzle remaining glaze and top with sesame seeds and green onion.',
    ],
    notes: 'Use wild-caught salmon for best flavor. Can substitute with tofu for vegetarian version.',
    createdAt: '2025-01-03T18:00:00Z',
  },
  {
    id: 'r4',
    name: 'Greek Yogurt Parfait',
    emoji: '🫐',
    mealType: 'breakfast',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    dietTags: ['vegetarian', 'gluten-free', 'high-protein'],
    rating: 4.3,
    timesCooked: 20,
    ingredients: [
      { id: 'ing25', name: 'Greek yogurt', quantity: 1, unit: 'cup', category: 'dairy' },
      { id: 'ing26', name: 'Granola', quantity: 0.25, unit: 'cup', category: 'pantry' },
      { id: 'ing27', name: 'Blueberries', quantity: 0.5, unit: 'cup', category: 'produce' },
      { id: 'ing28', name: 'Strawberries', quantity: 0.5, unit: 'cup', category: 'produce' },
      { id: 'ing29', name: 'Honey', quantity: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ing30', name: 'Chia seeds', quantity: 1, unit: 'tsp', category: 'pantry' },
    ],
    nutrition: { calories: 320, protein: 22, carbs: 42, fat: 8, fiber: 6 },
    instructions: [
      'Layer half the yogurt in a glass or bowl.',
      'Add a layer of blueberries and strawberries.',
      'Sprinkle half the granola.',
      'Repeat layers with remaining yogurt, berries, and granola.',
      'Drizzle with honey and top with chia seeds.',
    ],
    notes: 'Prep the night before (minus granola) for quick grab-and-go mornings.',
    createdAt: '2025-01-04T07:30:00Z',
  },
  {
    id: 'r5',
    name: 'Spicy Black Bean Tacos',
    emoji: '🌮',
    mealType: 'dinner',
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    difficulty: 'easy',
    dietTags: ['vegan', 'dairy-free', 'gluten-free'],
    rating: 4.6,
    timesCooked: 10,
    ingredients: [
      { id: 'ing31', name: 'Black beans (canned)', quantity: 2, unit: 'cans', category: 'pantry' },
      { id: 'ing32', name: 'Corn tortillas', quantity: 8, unit: 'pieces', category: 'bakery' },
      { id: 'ing33', name: 'Red onion', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing34', name: 'Cilantro', quantity: 0.25, unit: 'cup', category: 'produce' },
      { id: 'ing35', name: 'Lime', quantity: 2, unit: 'whole', category: 'produce' },
      { id: 'ing36', name: 'Jalape\u00f1o', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing37', name: 'Cumin', quantity: 1, unit: 'tsp', category: 'spices' },
      { id: 'ing38', name: 'Chili powder', quantity: 0.5, unit: 'tsp', category: 'spices' },
      { id: 'ing39', name: 'Avocado', quantity: 1, unit: 'whole', category: 'produce' },
    ],
    nutrition: { calories: 380, protein: 16, carbs: 58, fat: 10, fiber: 14 },
    instructions: [
      'Drain and rinse black beans, add to a pan with cumin and chili powder.',
      'Cook beans on medium heat for 5-7 minutes, mashing slightly.',
      'Dice red onion, jalape\u00f1o, and cilantro for topping.',
      'Warm corn tortillas in a dry skillet.',
      'Assemble tacos with black bean mixture.',
      'Top with diced onion, jalape\u00f1o, cilantro, avocado slices, and lime juice.',
    ],
    notes: 'Adjust spice level by adding or removing jalape\u00f1o seeds.',
    createdAt: '2025-01-05T19:00:00Z',
  },
  {
    id: 'r6',
    name: 'Mediterranean Quinoa Bowl',
    emoji: '🥙',
    mealType: 'lunch',
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    difficulty: 'easy',
    dietTags: ['vegetarian', 'gluten-free', 'high-protein'],
    rating: 4.4,
    timesCooked: 6,
    ingredients: [
      { id: 'ing40', name: 'Quinoa', quantity: 1, unit: 'cup', category: 'pantry' },
      { id: 'ing41', name: 'Chickpeas (canned)', quantity: 1, unit: 'can', category: 'pantry' },
      { id: 'ing42', name: 'Cucumber', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing43', name: 'Cherry tomatoes', quantity: 1, unit: 'cup', category: 'produce' },
      { id: 'ing44', name: 'Feta cheese', quantity: 0.5, unit: 'cup', category: 'dairy' },
      { id: 'ing45', name: 'Kalamata olives', quantity: 0.25, unit: 'cup', category: 'pantry' },
      { id: 'ing46', name: 'Red onion', quantity: 0.5, unit: 'whole', category: 'produce' },
      { id: 'ing47', name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'pantry' },
      { id: 'ing48', name: 'Lemon juice', quantity: 2, unit: 'tbsp', category: 'produce' },
    ],
    nutrition: { calories: 480, protein: 20, carbs: 56, fat: 18, fiber: 10 },
    instructions: [
      'Cook quinoa in 2 cups water for 15-20 minutes until fluffy.',
      'Drain and rinse chickpeas.',
      'Dice cucumber, halve cherry tomatoes, and slice red onion thinly.',
      'Combine quinoa, chickpeas, and vegetables in a large bowl.',
      'Whisk olive oil and lemon juice for dressing.',
      'Drizzle dressing, crumble feta on top, and add olives.',
      'Toss gently and serve at room temperature or chilled.',
    ],
    notes: 'Great for meal prep \u2014 keeps well in the fridge for 3 days.',
    createdAt: '2025-01-06T12:30:00Z',
  },
  {
    id: 'r7',
    name: 'Overnight Oats',
    emoji: '🥣',
    mealType: 'breakfast',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    dietTags: ['vegetarian', 'dairy-free'],
    rating: 4.2,
    timesCooked: 25,
    ingredients: [
      { id: 'ing49', name: 'Rolled oats', quantity: 0.5, unit: 'cup', category: 'pantry' },
      { id: 'ing50', name: 'Almond milk', quantity: 0.5, unit: 'cup', category: 'dairy' },
      { id: 'ing51', name: 'Chia seeds', quantity: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ing52', name: 'Maple syrup', quantity: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ing53', name: 'Banana', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing54', name: 'Peanut butter', quantity: 1, unit: 'tbsp', category: 'pantry' },
    ],
    nutrition: { calories: 380, protein: 12, carbs: 58, fat: 12, fiber: 8 },
    instructions: [
      'Combine oats, almond milk, chia seeds, and maple syrup in a jar.',
      'Stir well, seal, and refrigerate overnight (at least 6 hours).',
      'In the morning, top with sliced banana and peanut butter.',
    ],
    notes: 'Try different toppings: berries, nuts, coconut flakes, or chocolate chips.',
    createdAt: '2025-01-07T07:00:00Z',
  },
  {
    id: 'r8',
    name: 'Thai Green Curry',
    emoji: '🍛',
    mealType: 'dinner',
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    difficulty: 'medium',
    dietTags: ['dairy-free', 'gluten-free'],
    rating: 4.8,
    timesCooked: 7,
    ingredients: [
      { id: 'ing55', name: 'Chicken thighs', quantity: 500, unit: 'g', category: 'meat' },
      { id: 'ing56', name: 'Green curry paste', quantity: 3, unit: 'tbsp', category: 'condiments' },
      { id: 'ing57', name: 'Coconut milk', quantity: 1, unit: 'can', category: 'pantry' },
      { id: 'ing58', name: 'Bamboo shoots', quantity: 1, unit: 'cup', category: 'pantry' },
      { id: 'ing59', name: 'Thai basil', quantity: 0.5, unit: 'cup', category: 'produce' },
      { id: 'ing60', name: 'Bell pepper', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing61', name: 'Fish sauce', quantity: 2, unit: 'tbsp', category: 'condiments' },
      { id: 'ing62', name: 'Brown sugar', quantity: 1, unit: 'tsp', category: 'pantry' },
      { id: 'ing63', name: 'Jasmine rice', quantity: 2, unit: 'cups', category: 'pantry' },
    ],
    nutrition: { calories: 580, protein: 35, carbs: 48, fat: 26, fiber: 4 },
    instructions: [
      'Cook jasmine rice according to package directions.',
      'Cut chicken into bite-sized pieces.',
      'Heat a tablespoon of coconut milk in a large pan until sizzling.',
      'Add green curry paste and stir-fry for 1-2 minutes until fragrant.',
      'Add chicken and cook until no longer pink (5-6 minutes).',
      'Pour in remaining coconut milk, bamboo shoots, and sliced bell pepper.',
      'Simmer for 15 minutes. Add fish sauce and brown sugar.',
      'Stir in Thai basil just before serving over jasmine rice.',
    ],
    notes: 'For vegetarian version, substitute chicken with tofu and use soy sauce instead of fish sauce.',
    createdAt: '2025-01-08T18:30:00Z',
  },
  {
    id: 'r9',
    name: 'Energy Bites',
    emoji: '🔋',
    mealType: 'snack',
    prepTime: 10,
    cookTime: 0,
    servings: 12,
    difficulty: 'easy',
    dietTags: ['vegetarian', 'gluten-free', 'dairy-free'],
    rating: 4.1,
    timesCooked: 18,
    ingredients: [
      { id: 'ing64', name: 'Rolled oats', quantity: 1, unit: 'cup', category: 'pantry' },
      { id: 'ing65', name: 'Peanut butter', quantity: 0.5, unit: 'cup', category: 'pantry' },
      { id: 'ing66', name: 'Honey', quantity: 0.25, unit: 'cup', category: 'pantry' },
      { id: 'ing67', name: 'Dark chocolate chips', quantity: 0.25, unit: 'cup', category: 'pantry' },
      { id: 'ing68', name: 'Flax seeds', quantity: 2, unit: 'tbsp', category: 'pantry' },
      { id: 'ing69', name: 'Vanilla extract', quantity: 1, unit: 'tsp', category: 'pantry' },
    ],
    nutrition: { calories: 120, protein: 4, carbs: 16, fat: 5, fiber: 2 },
    instructions: [
      'Mix all ingredients in a large bowl until well combined.',
      'Refrigerate for 30 minutes until firm enough to handle.',
      'Roll into 1-inch balls with your hands.',
      'Store in an airtight container in the refrigerator for up to 1 week.',
    ],
    notes: 'Swap peanut butter for almond butter if preferred. Add coconut flakes for extra texture.',
    createdAt: '2025-01-09T10:00:00Z',
  },
  {
    id: 'r10',
    name: 'Stuffed Bell Peppers',
    emoji: '🫑',
    mealType: 'dinner',
    prepTime: 20,
    cookTime: 35,
    servings: 4,
    difficulty: 'medium',
    dietTags: ['gluten-free', 'high-protein'],
    rating: 4.5,
    timesCooked: 5,
    ingredients: [
      { id: 'ing70', name: 'Bell peppers', quantity: 4, unit: 'whole', category: 'produce' },
      { id: 'ing71', name: 'Ground turkey', quantity: 500, unit: 'g', category: 'meat' },
      { id: 'ing72', name: 'Brown rice (cooked)', quantity: 1, unit: 'cup', category: 'pantry' },
      { id: 'ing73', name: 'Diced tomatoes', quantity: 1, unit: 'can', category: 'pantry' },
      { id: 'ing74', name: 'Black beans', quantity: 0.5, unit: 'cup', category: 'pantry' },
      { id: 'ing75', name: 'Cheddar cheese', quantity: 1, unit: 'cup', category: 'dairy' },
      { id: 'ing76', name: 'Onion', quantity: 1, unit: 'whole', category: 'produce' },
      { id: 'ing77', name: 'Garlic', quantity: 2, unit: 'cloves', category: 'produce' },
      { id: 'ing78', name: 'Cumin', quantity: 1, unit: 'tsp', category: 'spices' },
    ],
    nutrition: { calories: 450, protein: 38, carbs: 32, fat: 18, fiber: 8 },
    instructions: [
      'Preheat oven to 375\u00b0F (190\u00b0C).',
      'Cut tops off bell peppers and remove seeds.',
      'Saut\u00e9 onion and garlic until softened.',
      'Add ground turkey and cook until browned.',
      'Mix in cooked rice, diced tomatoes, black beans, and cumin.',
      'Stuff peppers with the mixture and place in a baking dish.',
      'Top with cheddar cheese.',
      'Bake for 30-35 minutes until peppers are tender and cheese is bubbly.',
    ],
    notes: 'Can make ahead and freeze stuffed peppers before baking.',
    createdAt: '2025-01-10T17:00:00Z',
  },
  {
    id: 'r11',
    name: 'Smoothie Bowl',
    emoji: '🍇',
    mealType: 'breakfast',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    dietTags: ['vegan', 'gluten-free', 'dairy-free'],
    rating: 4.4,
    timesCooked: 14,
    ingredients: [
      { id: 'ing79', name: 'Frozen a\u00e7a\u00ed packet', quantity: 1, unit: 'packet', category: 'frozen' },
      { id: 'ing80', name: 'Frozen banana', quantity: 1, unit: 'whole', category: 'frozen' },
      { id: 'ing81', name: 'Almond milk', quantity: 0.25, unit: 'cup', category: 'dairy' },
      { id: 'ing82', name: 'Granola', quantity: 0.25, unit: 'cup', category: 'pantry' },
      { id: 'ing83', name: 'Fresh berries', quantity: 0.5, unit: 'cup', category: 'produce' },
      { id: 'ing84', name: 'Coconut flakes', quantity: 1, unit: 'tbsp', category: 'pantry' },
      { id: 'ing85', name: 'Honey', quantity: 1, unit: 'tsp', category: 'pantry' },
    ],
    nutrition: { calories: 350, protein: 8, carbs: 62, fat: 10, fiber: 9 },
    instructions: [
      'Blend a\u00e7a\u00ed packet, frozen banana, and almond milk until thick and smooth.',
      'Pour into a bowl (should be thicker than a drinkable smoothie).',
      'Arrange granola, fresh berries, and coconut flakes on top.',
      'Drizzle with honey and serve immediately.',
    ],
    notes: 'The key is keeping it thick \u2014 use minimal liquid for a scoopable consistency.',
    createdAt: '2025-01-11T08:00:00Z',
  },
  {
    id: 'r12',
    name: 'Hummus & Veggie Wrap',
    emoji: '🌯',
    mealType: 'lunch',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    dietTags: ['vegan', 'dairy-free'],
    rating: 4.0,
    timesCooked: 9,
    ingredients: [
      { id: 'ing86', name: 'Whole wheat tortilla', quantity: 1, unit: 'piece', category: 'bakery' },
      { id: 'ing87', name: 'Hummus', quantity: 3, unit: 'tbsp', category: 'condiments' },
      { id: 'ing88', name: 'Spinach', quantity: 1, unit: 'cup', category: 'produce' },
      { id: 'ing89', name: 'Shredded carrots', quantity: 0.25, unit: 'cup', category: 'produce' },
      { id: 'ing90', name: 'Cucumber (sliced)', quantity: 0.5, unit: 'whole', category: 'produce' },
      { id: 'ing91', name: 'Red bell pepper strips', quantity: 0.25, unit: 'cup', category: 'produce' },
      { id: 'ing92', name: 'Sprouts', quantity: 0.25, unit: 'cup', category: 'produce' },
    ],
    nutrition: { calories: 310, protein: 12, carbs: 44, fat: 10, fiber: 9 },
    instructions: [
      'Spread hummus evenly across the tortilla.',
      'Layer spinach, shredded carrots, cucumber, bell pepper, and sprouts.',
      'Fold in the sides and roll tightly.',
      'Cut in half diagonally and serve.',
    ],
    notes: 'Add avocado slices or roasted chickpeas for extra substance.',
    createdAt: '2025-01-12T12:00:00Z',
  },
];

// ─── Initial Weekly Meal Plan ───────────────────────────────────────────────────

const INITIAL_MEAL_PLAN = {
  Monday: { breakfast: 'r1', lunch: 'r2', dinner: 'r3', snack: null },
  Tuesday: { breakfast: 'r4', lunch: 'r6', dinner: 'r5', snack: 'r9' },
  Wednesday: { breakfast: 'r7', lunch: 'r12', dinner: 'r8', snack: null },
  Thursday: { breakfast: 'r11', lunch: 'r2', dinner: 'r10', snack: 'r9' },
  Friday: { breakfast: 'r1', lunch: 'r6', dinner: 'r3', snack: null },
  Saturday: { breakfast: 'r4', lunch: null, dinner: 'r5', snack: 'r9' },
  Sunday: { breakfast: 'r7', lunch: 'r12', dinner: 'r8', snack: null },
};

// ─── Initial Favorites ──────────────────────────────────────────────────────────

const INITIAL_FAVORITES = ['r3', 'r1', 'r8', 'r5'];

// ─── Component ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // ─── Navigation / Tab State ─────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('recipes');
  const tabs = [
    { id: 'recipes', label: 'Recipes', icon: '📖' },
    { id: 'plan', label: 'Meal Plan', icon: '📅' },
    { id: 'grocery', label: 'Grocery', icon: '🛒' },
    { id: 'nutrition', label: 'Nutrition', icon: '📊' },
    { id: 'favorites', label: 'Favorites', icon: '❤️' },
  ];

  // ─── Recipe State ───────────────────────────────────────────────────
  const [recipes, setRecipes] = useState(RECIPES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealTypeFilter, setSelectedMealTypeFilter] = useState('all');
  const [selectedDietFilter, setSelectedDietFilter] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showSortPicker, setShowSortPicker] = useState(false);

  // ─── Recipe Detail Modal State ──────────────────────────────────────
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeDetailVisible, setRecipeDetailVisible] = useState(false);

  // ─── Meal Plan State ────────────────────────────────────────────────
  const [mealPlan, setMealPlan] = useState(INITIAL_MEAL_PLAN);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [assigningSlot, setAssigningSlot] = useState(null); // { day, mealType }
  const [showRecipePicker, setShowRecipePicker] = useState(false);

  // ─── Grocery List State ─────────────────────────────────────────────
  const [checkedItems, setCheckedItems] = useState({});
  const [grocerySearch, setGrocerySearch] = useState('');

  // ─── Favorites State ────────────────────────────────────────────────
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);

  // ─── Nutrition State ────────────────────────────────────────────────
  const [nutritionDay, setNutritionDay] = useState('Monday');

  // ─── Add Recipe Modal State ─────────────────────────────────────────
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    emoji: '🍽️',
    mealType: 'breakfast',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'easy',
    dietTags: [],
    ingredients: '',
    instructions: '',
    notes: '',
  });

  // ─── Derived Data ───────────────────────────────────────────────────

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.name.toLowerCase().includes(q)) ||
          r.dietTags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Meal type filter
    if (selectedMealTypeFilter !== 'all') {
      result = result.filter((r) => r.mealType === selectedMealTypeFilter);
    }

    // Diet filter
    if (selectedDietFilter !== 'all') {
      result = result.filter((r) => r.dietTags.includes(selectedDietFilter));
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      result = result.filter((r) => r.difficulty === selectedDifficulty);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'calories-asc':
          return a.nutrition.calories - b.nutrition.calories;
        case 'calories-desc':
          return b.nutrition.calories - a.nutrition.calories;
        case 'time-asc':
          return a.prepTime + a.cookTime - (b.prepTime + b.cookTime);
        case 'time-desc':
          return b.prepTime + b.cookTime - (a.prepTime + a.cookTime);
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [recipes, searchQuery, selectedMealTypeFilter, selectedDietFilter, selectedDifficulty, sortBy]);

  const groceryList = useMemo(() => {
    const ingredientMap = {};
    DAYS_OF_WEEK.forEach((day) => {
      const dayPlan = mealPlan[day];
      MEAL_TYPES.forEach((mealType) => {
        const recipeId = dayPlan[mealType];
        if (recipeId) {
          const recipe = recipes.find((r) => r.id === recipeId);
          if (recipe) {
            recipe.ingredients.forEach((ing) => {
              const key = `${ing.name}__${ing.unit}`;
              if (ingredientMap[key]) {
                ingredientMap[key].quantity += ing.quantity;
                if (!ingredientMap[key].usedIn.includes(recipe.name)) {
                  ingredientMap[key].usedIn.push(recipe.name);
                }
              } else {
                ingredientMap[key] = {
                  id: key,
                  name: ing.name,
                  quantity: ing.quantity,
                  unit: ing.unit,
                  category: ing.category,
                  usedIn: [recipe.name],
                };
              }
            });
          }
        }
      });
    });

    let items = Object.values(ingredientMap);

    // Group by category
    const grouped = {};
    items.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    // Sort each category alphabetically
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [mealPlan, recipes]);

  const filteredGroceryList = useMemo(() => {
    if (!grocerySearch.trim()) return groceryList;
    const q = grocerySearch.toLowerCase();
    const filtered = {};
    Object.entries(groceryList).forEach(([category, items]) => {
      const matching = items.filter((item) => item.name.toLowerCase().includes(q));
      if (matching.length > 0) {
        filtered[category] = matching;
      }
    });
    return filtered;
  }, [groceryList, grocerySearch]);

  const groceryStats = useMemo(() => {
    const allItems = Object.values(groceryList).flat();
    const total = allItems.length;
    const checked = allItems.filter((item) => checkedItems[item.id]).length;
    return { total, checked, remaining: total - checked };
  }, [groceryList, checkedItems]);

  const dailyNutrition = useMemo(() => {
    const dayPlan = mealPlan[nutritionDay];
    const meals = {};
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    MEAL_TYPES.forEach((mealType) => {
      const recipeId = dayPlan[mealType];
      if (recipeId) {
        const recipe = recipes.find((r) => r.id === recipeId);
        if (recipe) {
          meals[mealType] = { recipe, nutrition: recipe.nutrition };
          totals.calories += recipe.nutrition.calories;
          totals.protein += recipe.nutrition.protein;
          totals.carbs += recipe.nutrition.carbs;
          totals.fat += recipe.nutrition.fat;
          totals.fiber += recipe.nutrition.fiber;
        }
      }
    });

    return { meals, totals };
  }, [mealPlan, nutritionDay, recipes]);

  const weeklyNutritionSummary = useMemo(() => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    let mealCount = 0;

    DAYS_OF_WEEK.forEach((day) => {
      const dayPlan = mealPlan[day];
      MEAL_TYPES.forEach((mealType) => {
        const recipeId = dayPlan[mealType];
        if (recipeId) {
          const recipe = recipes.find((r) => r.id === recipeId);
          if (recipe) {
            totals.calories += recipe.nutrition.calories;
            totals.protein += recipe.nutrition.protein;
            totals.carbs += recipe.nutrition.carbs;
            totals.fat += recipe.nutrition.fat;
            totals.fiber += recipe.nutrition.fiber;
            mealCount++;
          }
        }
      });
    });

    const avgPerDay = {
      calories: Math.round(totals.calories / 7),
      protein: Math.round(totals.protein / 7),
      carbs: Math.round(totals.carbs / 7),
      fat: Math.round(totals.fat / 7),
      fiber: Math.round(totals.fiber / 7),
    };

    return { totals, avgPerDay, mealCount };
  }, [mealPlan, recipes]);

  const favoriteRecipes = useMemo(() => {
    return recipes.filter((r) => favorites.includes(r.id));
  }, [recipes, favorites]);

  // ─── Handlers ───────────────────────────────────────────────────────

  const toggleFavorite = useCallback(
    (recipeId) => {
      setFavorites((prev) => (prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]));
    },
    []
  );

  const openRecipeDetail = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDetailVisible(true);
  }, []);

  const closeRecipeDetail = useCallback(() => {
    setRecipeDetailVisible(false);
    setSelectedRecipe(null);
  }, []);

  const assignRecipeToSlot = useCallback(
    (recipeId) => {
      if (assigningSlot) {
        setMealPlan((prev) => ({
          ...prev,
          [assigningSlot.day]: {
            ...prev[assigningSlot.day],
            [assigningSlot.mealType]: recipeId,
          },
        }));
        setShowRecipePicker(false);
        setAssigningSlot(null);
      }
    },
    [assigningSlot]
  );

  const clearMealSlot = useCallback((day, mealType) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null,
      },
    }));
  }, []);

  const openRecipePicker = useCallback((day, mealType) => {
    setAssigningSlot({ day, mealType });
    setShowRecipePicker(true);
  }, []);

  const toggleGroceryItem = useCallback((itemId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  const clearAllChecked = useCallback(() => {
    setCheckedItems({});
  }, []);

  const handleAddRecipe = useCallback(() => {
    if (!newRecipe.name.trim()) {
      Alert.alert('Error', 'Please enter a recipe name.');
      return;
    }

    const ingredientsList = newRecipe.ingredients
      .split('\n')
      .filter((line) => line.trim())
      .map((line, idx) => ({
        id: `new_ing_${Date.now()}_${idx}`,
        name: line.trim(),
        quantity: 1,
        unit: 'piece',
        category: 'other',
      }));

    const instructionsList = newRecipe.instructions
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.trim());

    const recipe = {
      id: `r_${Date.now()}`,
      name: newRecipe.name.trim(),
      emoji: newRecipe.emoji,
      mealType: newRecipe.mealType,
      prepTime: parseInt(newRecipe.prepTime) || 0,
      cookTime: parseInt(newRecipe.cookTime) || 0,
      servings: parseInt(newRecipe.servings) || 1,
      difficulty: newRecipe.difficulty,
      dietTags: newRecipe.dietTags,
      rating: 0,
      timesCooked: 0,
      ingredients: ingredientsList,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      instructions: instructionsList,
      notes: newRecipe.notes,
      createdAt: new Date().toISOString(),
    };

    setRecipes((prev) => [...prev, recipe]);
    setShowAddRecipe(false);
    setNewRecipe({
      name: '',
      emoji: '🍽️',
      mealType: 'breakfast',
      prepTime: '',
      cookTime: '',
      servings: '',
      difficulty: 'easy',
      dietTags: [],
      ingredients: '',
      instructions: '',
      notes: '',
    });
  }, [newRecipe]);

  const toggleNewRecipeDietTag = useCallback((tag) => {
    setNewRecipe((prev) => ({
      ...prev,
      dietTags: prev.dietTags.includes(tag) ? prev.dietTags.filter((t) => t !== tag) : [...prev.dietTags, tag],
    }));
  }, []);

  // ─── Render Helpers ─────────────────────────────────────────────────

  const renderRecipeCard = useCallback(
    (recipe) => {
      const isFav = favorites.includes(recipe.id);
      const totalTime = recipe.prepTime + recipe.cookTime;
      return (
        <TouchableOpacity
          key={recipe.id}
          testID={`recipe-card-${recipe.id}`}
          style={styles.recipeCard}
          onPress={() => openRecipeDetail(recipe)}
        >
          <View style={styles.recipeCardHeader}>
            <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
            <TouchableOpacity
              testID={`fav-btn-${recipe.id}`}
              onPress={() => toggleFavorite(recipe.id)}
              style={styles.favButton}
            >
              <Text style={styles.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={styles.recipeMetaRow}>
            <Text style={styles.recipeMeta}>⏱ {totalTime}m</Text>
            <Text style={styles.recipeMeta}>🔥 {recipe.nutrition.calories} cal</Text>
            <Text style={styles.recipeMeta}>⭐ {recipe.rating}</Text>
          </View>
          <View style={styles.recipeTagRow}>
            <View style={[styles.mealTypeBadge, { backgroundColor: getMealTypeColor(recipe.mealType) }]}>
              <Text style={styles.mealTypeBadgeText}>{recipe.mealType}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(recipe.difficulty) }]}>
              <Text style={styles.difficultyBadgeText}>{recipe.difficulty}</Text>
            </View>
          </View>
          {recipe.dietTags.length > 0 && (
            <View style={styles.dietTagRow}>
              {recipe.dietTags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.dietTag}>
                  <Text style={styles.dietTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [favorites, openRecipeDetail, toggleFavorite]
  );

  const renderMealSlot = useCallback(
    (day, mealType) => {
      const recipeId = mealPlan[day][mealType];
      const recipe = recipeId ? recipes.find((r) => r.id === recipeId) : null;

      return (
        <View key={mealType} testID={`meal-slot-${day}-${mealType}`} style={styles.mealSlot}>
          <Text style={styles.mealSlotLabel}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
          {recipe ? (
            <View style={styles.mealSlotFilled}>
              <Text style={styles.mealSlotEmoji}>{recipe.emoji}</Text>
              <View style={styles.mealSlotInfo}>
                <Text style={styles.mealSlotName} numberOfLines={1}>
                  {recipe.name}
                </Text>
                <Text style={styles.mealSlotCalories}>{recipe.nutrition.calories} cal</Text>
              </View>
              <TouchableOpacity
                testID={`clear-slot-${day}-${mealType}`}
                onPress={() => clearMealSlot(day, mealType)}
                style={styles.clearSlotBtn}
              >
                <Text style={styles.clearSlotText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              testID={`assign-slot-${day}-${mealType}`}
              onPress={() => openRecipePicker(day, mealType)}
              style={styles.mealSlotEmpty}
            >
              <Text style={styles.mealSlotEmptyText}>+ Add meal</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [mealPlan, recipes, clearMealSlot, openRecipePicker]
  );

  const renderNutritionBar = useCallback((label, value, max, color) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <View style={styles.nutritionBarContainer}>
        <View style={styles.nutritionBarLabelRow}>
          <Text style={styles.nutritionBarLabel}>{label}</Text>
          <Text style={styles.nutritionBarValue}>{value}g</Text>
        </View>
        <View style={styles.nutritionBarTrack}>
          <View style={[styles.nutritionBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  }, []);

  // ─── Main Render ────────────────────────────────────────────────────

  return (
    <View testID="home-screen" style={styles.container}>
      {/* ─── Header ──────────────────────────────────────────── */}
      <View testID="header" style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meal Planner</Text>
          <Text style={styles.headerSubtitle}>{recipes.length} recipes · {groceryStats.remaining} items to buy</Text>
        </View>
        <TouchableOpacity
          testID="add-recipe-btn"
          onPress={() => setShowAddRecipe(true)}
          style={styles.addRecipeButton}
        >
          <Text style={styles.addRecipeButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Tab Bar ─────────────────────────────────────────── */}
      <View testID="tab-bar" style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            testID={`tab-${tab.id}`}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Content Area ────────────────────────────────────── */}
      <ScrollView testID="content-area" style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* ─── Recipes Tab ─────────────────────────────────── */}
        {activeTab === 'recipes' && (
          <View testID="recipes-tab">
            {/* Search Bar */}
            <View style={styles.searchRow}>
              <TextInput
                testID="recipe-search"
                style={styles.searchInput}
                placeholder="Search recipes, ingredients, tags..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                testID="sort-toggle"
                onPress={() => setShowSortPicker(!showSortPicker)}
                style={styles.sortButton}
              >
                <Text style={styles.sortButtonText}>⇅ Sort</Text>
              </TouchableOpacity>
            </View>

            {/* Sort Picker */}
            {showSortPicker && (
              <View testID="sort-picker" style={styles.sortPicker}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    testID={`sort-option-${option.id}`}
                    style={[styles.sortOption, sortBy === option.id && styles.sortOptionActive]}
                    onPress={() => {
                      setSortBy(option.id);
                      setShowSortPicker(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, sortBy === option.id && styles.sortOptionTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Filters */}
            <View testID="filters" style={styles.filterSection}>
              <Text style={styles.filterLabel}>Meal Type:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                <TouchableOpacity
                  testID="filter-meal-all"
                  style={[styles.chip, selectedMealTypeFilter === 'all' && styles.chipActive]}
                  onPress={() => setSelectedMealTypeFilter('all')}
                >
                  <Text style={[styles.chipText, selectedMealTypeFilter === 'all' && styles.chipTextActive]}>All</Text>
                </TouchableOpacity>
                {MEAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    testID={`filter-meal-${type}`}
                    style={[styles.chip, selectedMealTypeFilter === type && styles.chipActive]}
                    onPress={() => setSelectedMealTypeFilter(type)}
                  >
                    <Text style={[styles.chipText, selectedMealTypeFilter === type && styles.chipTextActive]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterLabel}>Diet:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                <TouchableOpacity
                  testID="filter-diet-all"
                  style={[styles.chip, selectedDietFilter === 'all' && styles.chipActive]}
                  onPress={() => setSelectedDietFilter('all')}
                >
                  <Text style={[styles.chipText, selectedDietFilter === 'all' && styles.chipTextActive]}>All</Text>
                </TouchableOpacity>
                {DIET_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    testID={`filter-diet-${tag}`}
                    style={[styles.chip, selectedDietFilter === tag && styles.chipActive]}
                    onPress={() => setSelectedDietFilter(tag)}
                  >
                    <Text style={[styles.chipText, selectedDietFilter === tag && styles.chipTextActive]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterLabel}>Difficulty:</Text>
              <View style={styles.filterChipsRow}>
                <TouchableOpacity
                  testID="filter-difficulty-all"
                  style={[styles.chip, selectedDifficulty === 'all' && styles.chipActive]}
                  onPress={() => setSelectedDifficulty('all')}
                >
                  <Text style={[styles.chipText, selectedDifficulty === 'all' && styles.chipTextActive]}>All</Text>
                </TouchableOpacity>
                {DIFFICULTY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    testID={`filter-difficulty-${level}`}
                    style={[styles.chip, selectedDifficulty === level && styles.chipActive]}
                    onPress={() => setSelectedDifficulty(level)}
                  >
                    <Text style={[styles.chipText, selectedDifficulty === level && styles.chipTextActive]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Results Count */}
            <Text testID="results-count" style={styles.resultsCount}>
              {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
            </Text>

            {/* Recipe Grid */}
            <View testID="recipe-grid" style={styles.recipeGrid}>
              {filteredRecipes.map((recipe) => renderRecipeCard(recipe))}
              {filteredRecipes.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyText}>No recipes match your filters</Text>
                  <TouchableOpacity
                    testID="clear-filters"
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedMealTypeFilter('all');
                      setSelectedDietFilter('all');
                      setSelectedDifficulty('all');
                    }}
                    style={styles.clearFiltersBtn}
                  >
                    <Text style={styles.clearFiltersBtnText}>Clear all filters</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ─── Meal Plan Tab ───────────────────────────────── */}
        {activeTab === 'plan' && (
          <View testID="plan-tab">
            <Text style={styles.sectionTitle}>Weekly Meal Plan</Text>

            {/* Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day}
                  testID={`day-btn-${day}`}
                  style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayButtonText, selectedDay === day && styles.dayButtonTextActive]}>
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Selected Day Meals */}
            <View testID={`day-plan-${selectedDay}`} style={styles.dayPlanCard}>
              <Text style={styles.dayPlanTitle}>{selectedDay}</Text>
              {MEAL_TYPES.map((mealType) => renderMealSlot(selectedDay, mealType))}
            </View>

            {/* Weekly Overview */}
            <Text style={styles.sectionSubtitle}>Weekly Overview</Text>
            <View testID="weekly-overview" style={styles.weeklyOverview}>
              {DAYS_OF_WEEK.map((day) => {
                const dayPlan = mealPlan[day];
                const filledSlots = MEAL_TYPES.filter((mt) => dayPlan[mt]).length;
                return (
                  <TouchableOpacity
                    key={day}
                    testID={`overview-${day}`}
                    style={styles.overviewDay}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={styles.overviewDayLabel}>{day.slice(0, 2)}</Text>
                    <View style={styles.overviewDots}>
                      {MEAL_TYPES.map((mt) => (
                        <View
                          key={mt}
                          style={[styles.overviewDot, dayPlan[mt] ? styles.overviewDotFilled : styles.overviewDotEmpty]}
                        />
                      ))}
                    </View>
                    <Text style={styles.overviewCount}>{filledSlots}/4</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── Grocery List Tab ────────────────────────────── */}
        {activeTab === 'grocery' && (
          <View testID="grocery-tab">
            <View style={styles.groceryHeader}>
              <Text style={styles.sectionTitle}>Grocery List</Text>
              <View style={styles.groceryStatsRow}>
                <Text testID="grocery-stats" style={styles.groceryStat}>
                  {groceryStats.checked}/{groceryStats.total} items checked
                </Text>
                {groceryStats.checked > 0 && (
                  <TouchableOpacity testID="clear-checked" onPress={clearAllChecked} style={styles.clearCheckedBtn}>
                    <Text style={styles.clearCheckedText}>Clear ✓</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Grocery Search */}
            <TextInput
              testID="grocery-search"
              style={styles.grocerySearchInput}
              placeholder="Search grocery items..."
              value={grocerySearch}
              onChangeText={setGrocerySearch}
            />

            {/* Progress Bar */}
            <View testID="grocery-progress" style={styles.groceryProgressBar}>
              <View
                style={[
                  styles.groceryProgressFill,
                  {
                    width: `${groceryStats.total > 0 ? (groceryStats.checked / groceryStats.total) * 100 : 0}%`,
                  },
                ]}
              />
            </View>

            {/* Grocery Items by Category */}
            {Object.entries(filteredGroceryList)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, items]) => (
                <View key={category} testID={`grocery-category-${category}`} style={styles.groceryCategory}>
                  <Text style={styles.groceryCategoryTitle}>
                    {getCategoryEmoji(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  {items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      testID={`grocery-item-${item.id}`}
                      style={[styles.groceryItem, checkedItems[item.id] && styles.groceryItemChecked]}
                      onPress={() => toggleGroceryItem(item.id)}
                    >
                      <View style={styles.groceryCheckbox}>
                        <Text>{checkedItems[item.id] ? '☑' : '☐'}</Text>
                      </View>
                      <View style={styles.groceryItemInfo}>
                        <Text
                          style={[styles.groceryItemName, checkedItems[item.id] && styles.groceryItemNameChecked]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.groceryItemQuantity}>
                          {item.quantity} {item.unit}
                        </Text>
                      </View>
                      <Text style={styles.groceryItemUsedIn} numberOfLines={1}>
                        {item.usedIn.join(', ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

            {Object.keys(filteredGroceryList).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyText}>
                  {grocerySearch ? 'No items match your search' : 'Add recipes to your meal plan to generate a grocery list'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── Nutrition Tab ──────────────────────────────── */}
        {activeTab === 'nutrition' && (
          <View testID="nutrition-tab">
            <Text style={styles.sectionTitle}>Nutrition Tracker</Text>

            {/* Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day}
                  testID={`nutrition-day-${day}`}
                  style={[styles.dayButton, nutritionDay === day && styles.dayButtonActive]}
                  onPress={() => setNutritionDay(day)}
                >
                  <Text style={[styles.dayButtonText, nutritionDay === day && styles.dayButtonTextActive]}>
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Daily Summary Card */}
            <View testID="daily-nutrition-summary" style={styles.nutritionSummaryCard}>
              <Text style={styles.nutritionDayTitle}>{nutritionDay}</Text>
              <View style={styles.calorieCircle}>
                <Text style={styles.calorieNumber}>{dailyNutrition.totals.calories}</Text>
                <Text style={styles.calorieLabel}>calories</Text>
              </View>

              {renderNutritionBar('Protein', dailyNutrition.totals.protein, 150, '#4F46E5')}
              {renderNutritionBar('Carbs', dailyNutrition.totals.carbs, 300, '#F59E0B')}
              {renderNutritionBar('Fat', dailyNutrition.totals.fat, 100, '#EF4444')}
              {renderNutritionBar('Fiber', dailyNutrition.totals.fiber, 40, '#22C55E')}
            </View>

            {/* Meal Breakdown */}
            <Text style={styles.sectionSubtitle}>Meal Breakdown</Text>
            {MEAL_TYPES.map((mealType) => {
              const mealData = dailyNutrition.meals[mealType];
              return (
                <View key={mealType} testID={`nutrition-meal-${mealType}`} style={styles.nutritionMealCard}>
                  <Text style={styles.nutritionMealType}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </Text>
                  {mealData ? (
                    <View>
                      <Text style={styles.nutritionMealName}>
                        {mealData.recipe.emoji} {mealData.recipe.name}
                      </Text>
                      <View style={styles.nutritionMealStats}>
                        <Text style={styles.nutritionStat}>{mealData.nutrition.calories} cal</Text>
                        <Text style={styles.nutritionStat}>{mealData.nutrition.protein}g protein</Text>
                        <Text style={styles.nutritionStat}>{mealData.nutrition.carbs}g carbs</Text>
                        <Text style={styles.nutritionStat}>{mealData.nutrition.fat}g fat</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.nutritionMealEmpty}>No meal planned</Text>
                  )}
                </View>
              );
            })}

            {/* Weekly Summary */}
            <View testID="weekly-nutrition-summary" style={styles.weeklySummaryCard}>
              <Text style={styles.sectionSubtitle}>Weekly Summary</Text>
              <View style={styles.weeklySummaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{weeklyNutritionSummary.mealCount}</Text>
                  <Text style={styles.summaryLabel}>Meals Planned</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{weeklyNutritionSummary.avgPerDay.calories}</Text>
                  <Text style={styles.summaryLabel}>Avg Cal/Day</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{weeklyNutritionSummary.avgPerDay.protein}g</Text>
                  <Text style={styles.summaryLabel}>Avg Protein/Day</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{weeklyNutritionSummary.totals.calories}</Text>
                  <Text style={styles.summaryLabel}>Total Calories</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ─── Favorites Tab ─────────────────────────────── */}
        {activeTab === 'favorites' && (
          <View testID="favorites-tab">
            <Text style={styles.sectionTitle}>Favorite Recipes ({favoriteRecipes.length})</Text>

            {favoriteRecipes.length > 0 ? (
              <View style={styles.recipeGrid}>{favoriteRecipes.map((recipe) => renderRecipeCard(recipe))}</View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>❤️</Text>
                <Text style={styles.emptyText}>No favorite recipes yet</Text>
                <Text style={styles.emptySubtext}>Tap the heart icon on any recipe to save it here</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ─── Recipe Detail Modal ───────────────────────────── */}
      <Modal
        testID="recipe-detail-modal"
        visible={recipeDetailVisible}
        animationType="slide"
        onRequestClose={closeRecipeDetail}
      >
        {selectedRecipe && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity testID="close-detail" onPress={closeRecipeDetail}>
                <Text style={styles.modalCloseText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity testID={`detail-fav-${selectedRecipe.id}`} onPress={() => toggleFavorite(selectedRecipe.id)}>
                <Text style={styles.favIcon}>
                  {favorites.includes(selectedRecipe.id) ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.detailEmoji}>{selectedRecipe.emoji}</Text>
              <Text style={styles.detailTitle}>{selectedRecipe.name}</Text>

              <View style={styles.detailMetaRow}>
                <View style={styles.detailMeta}>
                  <Text style={styles.detailMetaValue}>{selectedRecipe.prepTime + selectedRecipe.cookTime}m</Text>
                  <Text style={styles.detailMetaLabel}>Total Time</Text>
                </View>
                <View style={styles.detailMeta}>
                  <Text style={styles.detailMetaValue}>{selectedRecipe.servings}</Text>
                  <Text style={styles.detailMetaLabel}>Servings</Text>
                </View>
                <View style={styles.detailMeta}>
                  <Text style={styles.detailMetaValue}>{selectedRecipe.nutrition.calories}</Text>
                  <Text style={styles.detailMetaLabel}>Calories</Text>
                </View>
                <View style={styles.detailMeta}>
                  <Text style={styles.detailMetaValue}>⭐ {selectedRecipe.rating}</Text>
                  <Text style={styles.detailMetaLabel}>Rating</Text>
                </View>
              </View>

              <View style={styles.detailTagRow}>
                {selectedRecipe.dietTags.map((tag) => (
                  <View key={tag} style={styles.detailTag}>
                    <Text style={styles.detailTagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Nutrition Card */}
              <View testID="detail-nutrition" style={styles.detailNutritionCard}>
                <Text style={styles.detailSectionTitle}>Nutrition per serving</Text>
                <View style={styles.detailNutritionGrid}>
                  <View style={styles.detailNutritionItem}>
                    <Text style={styles.detailNutritionValue}>{selectedRecipe.nutrition.protein}g</Text>
                    <Text style={styles.detailNutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.detailNutritionItem}>
                    <Text style={styles.detailNutritionValue}>{selectedRecipe.nutrition.carbs}g</Text>
                    <Text style={styles.detailNutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.detailNutritionItem}>
                    <Text style={styles.detailNutritionValue}>{selectedRecipe.nutrition.fat}g</Text>
                    <Text style={styles.detailNutritionLabel}>Fat</Text>
                  </View>
                  <View style={styles.detailNutritionItem}>
                    <Text style={styles.detailNutritionValue}>{selectedRecipe.nutrition.fiber}g</Text>
                    <Text style={styles.detailNutritionLabel}>Fiber</Text>
                  </View>
                </View>
              </View>

              {/* Ingredients */}
              <Text style={styles.detailSectionTitle}>Ingredients</Text>
              {selectedRecipe.ingredients.map((ing, idx) => (
                <View key={ing.id} testID={`ingredient-${idx}`} style={styles.ingredientRow}>
                  <Text style={styles.ingredientBullet}>•</Text>
                  <Text style={styles.ingredientText}>
                    {ing.quantity} {ing.unit} {ing.name}
                  </Text>
                </View>
              ))}

              {/* Instructions */}
              <Text style={styles.detailSectionTitle}>Instructions</Text>
              {selectedRecipe.instructions.map((step, idx) => (
                <View key={idx} testID={`instruction-${idx}`} style={styles.instructionRow}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{step}</Text>
                </View>
              ))}

              {/* Notes */}
              {selectedRecipe.notes && (
                <View testID="recipe-notes" style={styles.notesSection}>
                  <Text style={styles.detailSectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedRecipe.notes}</Text>
                </View>
              )}

              {/* Cooked Count */}
              <View style={styles.cookedSection}>
                <Text style={styles.cookedText}>
                  Cooked {selectedRecipe.timesCooked} time{selectedRecipe.timesCooked !== 1 ? 's' : ''}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ─── Recipe Picker Modal ───────────────────────────── */}
      <Modal
        testID="recipe-picker-modal"
        visible={showRecipePicker}
        animationType="slide"
        onRequestClose={() => setShowRecipePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity testID="close-picker" onPress={() => setShowRecipePicker(false)}>
              <Text style={styles.modalCloseText}>← Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {assigningSlot ? `Pick ${assigningSlot.mealType} for ${assigningSlot.day}` : 'Pick a recipe'}
            </Text>
          </View>
          <ScrollView style={styles.modalContent}>
            {recipes
              .filter((r) => !assigningSlot || r.mealType === assigningSlot.mealType || assigningSlot.mealType === 'snack')
              .map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  testID={`pick-recipe-${recipe.id}`}
                  style={styles.pickerRecipeRow}
                  onPress={() => assignRecipeToSlot(recipe.id)}
                >
                  <Text style={styles.pickerRecipeEmoji}>{recipe.emoji}</Text>
                  <View style={styles.pickerRecipeInfo}>
                    <Text style={styles.pickerRecipeName}>{recipe.name}</Text>
                    <Text style={styles.pickerRecipeMeta}>
                      {recipe.nutrition.calories} cal · {recipe.prepTime + recipe.cookTime}m · {recipe.difficulty}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ─── Add Recipe Modal ──────────────────────────────── */}
      <Modal
        testID="add-recipe-modal"
        visible={showAddRecipe}
        animationType="slide"
        onRequestClose={() => setShowAddRecipe(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity testID="cancel-add-recipe" onPress={() => setShowAddRecipe(false)}>
              <Text style={styles.modalCloseText}>← Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="save-recipe-btn" onPress={handleAddRecipe}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Recipe</Text>

            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              testID="input-recipe-name"
              style={styles.textInput}
              placeholder="Recipe name"
              value={newRecipe.name}
              onChangeText={(text) => setNewRecipe((prev) => ({ ...prev, name: text }))}
            />

            <Text style={styles.inputLabel}>Emoji</Text>
            <TextInput
              testID="input-recipe-emoji"
              style={styles.textInput}
              placeholder="🍽️"
              value={newRecipe.emoji}
              onChangeText={(text) => setNewRecipe((prev) => ({ ...prev, emoji: text }))}
            />

            <Text style={styles.inputLabel}>Meal Type</Text>
            <View style={styles.filterChipsRow}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  testID={`new-meal-type-${type}`}
                  style={[styles.chip, newRecipe.mealType === type && styles.chipActive]}
                  onPress={() => setNewRecipe((prev) => ({ ...prev, mealType: type }))}
                >
                  <Text style={[styles.chipText, newRecipe.mealType === type && styles.chipTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.inputLabel}>Prep Time (min)</Text>
                <TextInput
                  testID="input-prep-time"
                  style={styles.textInput}
                  placeholder="15"
                  value={newRecipe.prepTime}
                  onChangeText={(text) => setNewRecipe((prev) => ({ ...prev, prepTime: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.timeField}>
                <Text style={styles.inputLabel}>Cook Time (min)</Text>
                <TextInput
                  testID="input-cook-time"
                  style={styles.textInput}
                  placeholder="30"
                  value={newRecipe.cookTime}
                  onChangeText={(text) => setNewRecipe((prev) => ({ ...prev, cookTime: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.timeField}>
                <Text style={styles.inputLabel}>Servings</Text>
                <TextInput
                  testID="input-servings"
                  style={styles.textInput}
                  placeholder="2"
                  value={newRecipe.servings}
                  onChangeText={(text) => setNewRecipe((prev) => ({ ...prev, servings: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Difficulty</Text>
            <View style={styles.filterChipsRow}>
              {DIFFICULTY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  testID={`new-difficulty-${level}`}
                  style={[styles.chip, newRecipe.difficulty === level && styles.chipActive]}
                  onPress={() => setNewRecipe((prev) => ({ ...prev, difficulty: level }))}
                >
                  <Text style={[styles.chipText, newRecipe.difficulty === level && styles.chipTextActive]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Diet Tags</Text>
            <View style={styles.dietTagGrid}>
              {DIET_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  testID={`new-diet-tag-${tag}`}
                  style={[styles.chip, newRecipe.dietTags.includes(tag) && styles.chipActive]}
                  onPress={() => toggleNewRecipeDietTag(tag)}
                >
                  <Text style={[styles.chipText, newRecipe.dietTags.includes(tag) && styles.chipTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Ingredients (one per line)</Text>
            <TextInput
              testID="input-ingredients"
              style={[styles.textInput, styles.multilineInput]}
              placeholder="1 cup flour\n2 eggs\n..."
              value={newRecipe.ingredients}
              onChangeText={(text) => setNewRecipe((prev) => ({ ...prev, ingredients: text }))}
              multiline
              numberOfLines={5}
            />

            <Text style={styles.inputLabel}>Instructions (one step per line)</Text>
            <TextInput
              testID="input-instructions"
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Preheat oven to 350°F\nMix dry ingredients\n..."
              value={newRecipe.instructions}
              onChangeText={(text) => setNewRecipe((prev) => ({ ...prev, instructions: text }))}
              multiline
              numberOfLines={5}
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              testID="input-notes"
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Any tips or notes..."
              value={newRecipe.notes}
              onChangeText={(text) => setNewRecipe((prev) => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

function getMealTypeColor(mealType) {
  const colors = {
    breakfast: '#F59E0B',
    lunch: '#22C55E',
    dinner: '#6366F1',
    snack: '#EC4899',
  };
  return colors[mealType] || '#9CA3AF';
}

function getDifficultyColor(difficulty) {
  const colors = {
    easy: '#22C55E',
    medium: '#F59E0B',
    hard: '#EF4444',
  };
  return colors[difficulty] || '#9CA3AF';
}

function getCategoryEmoji(category) {
  const emojis = {
    produce: '🥬',
    dairy: '🥛',
    meat: '🥩',
    seafood: '🐟',
    bakery: '🍞',
    pantry: '🫙',
    frozen: '🧊',
    condiments: '🫙',
    spices: '🌶️',
    other: '📦',
  };
  return emojis[category] || '📦';
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  addRecipeButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addRecipeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366F1',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#6366F1',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  sortPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: '#EEF2FF',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#475569',
  },
  sortOptionTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  resultsCount: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  recipeGrid: {
    gap: 12,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recipeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeEmoji: {
    fontSize: 32,
  },
  favButton: {
    padding: 4,
  },
  favIcon: {
    fontSize: 20,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  recipeMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  recipeTagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  mealTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mealTypeBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dietTagRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  dietTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dietTagText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 20,
    marginBottom: 12,
  },
  daySelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  dayButtonActive: {
    backgroundColor: '#6366F1',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  dayPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayPlanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  mealSlot: {
    marginBottom: 12,
  },
  mealSlotLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealSlotFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mealSlotEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  mealSlotInfo: {
    flex: 1,
  },
  mealSlotName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  mealSlotCalories: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  clearSlotBtn: {
    padding: 6,
  },
  clearSlotText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  mealSlotEmpty: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  mealSlotEmptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  weeklyOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  overviewDay: {
    alignItems: 'center',
    gap: 4,
  },
  overviewDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  overviewDots: {
    flexDirection: 'row',
    gap: 2,
  },
  overviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  overviewDotFilled: {
    backgroundColor: '#6366F1',
  },
  overviewDotEmpty: {
    backgroundColor: '#E2E8F0',
  },
  overviewCount: {
    fontSize: 10,
    color: '#94A3B8',
  },
  groceryHeader: {
    marginBottom: 12,
  },
  groceryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groceryStat: {
    fontSize: 13,
    color: '#64748B',
  },
  clearCheckedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  clearCheckedText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  grocerySearchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  groceryProgressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  groceryProgressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  groceryCategory: {
    marginBottom: 16,
  },
  groceryCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  groceryItemChecked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  groceryCheckbox: {
    marginRight: 10,
    fontSize: 18,
  },
  groceryItemInfo: {
    flex: 1,
  },
  groceryItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  groceryItemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  groceryItemQuantity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  groceryItemUsedIn: {
    fontSize: 10,
    color: '#94A3B8',
    maxWidth: 100,
    textAlign: 'right',
  },
  nutritionSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  nutritionDayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  calorieCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6366F1',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  nutritionBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  nutritionBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nutritionBarLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  nutritionBarValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  nutritionBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  nutritionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  nutritionMealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nutritionMealType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  nutritionMealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  nutritionMealStats: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  nutritionStat: {
    fontSize: 12,
    color: '#64748B',
  },
  nutritionMealEmpty: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  weeklySummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  weeklySummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    width: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6366F1',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94A3B8',
  },
  clearFiltersBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  clearFiltersBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
  },
  detailEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  detailMeta: {
    alignItems: 'center',
  },
  detailMetaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailMetaLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  detailTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
    justifyContent: 'center',
  },
  detailTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailTagText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  detailNutritionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  detailNutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailNutritionItem: {
    alignItems: 'center',
  },
  detailNutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  detailNutritionLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  ingredientBullet: {
    fontSize: 14,
    color: '#6366F1',
    marginRight: 8,
    fontWeight: '700',
  },
  ingredientText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
    lineHeight: 20,
    paddingTop: 4,
  },
  notesSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  cookedSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  cookedText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  pickerRecipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerRecipeEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  pickerRecipeInfo: {
    flex: 1,
  },
  pickerRecipeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  pickerRecipeMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 14,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1E293B',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timeField: {
    flex: 1,
  },
  dietTagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
