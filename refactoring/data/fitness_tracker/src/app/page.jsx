import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const EXERCISE_CATEGORIES = ['strength', 'cardio', 'flexibility', 'sports', 'other'];

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'full-body'];

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEASUREMENT_TYPES = [
  { id: 'weight', label: 'Weight', unit: 'lbs' },
  { id: 'bodyFat', label: 'Body Fat', unit: '%' },
  { id: 'chest', label: 'Chest', unit: 'in' },
  { id: 'waist', label: 'Waist', unit: 'in' },
  { id: 'hips', label: 'Hips', unit: 'in' },
  { id: 'biceps', label: 'Biceps', unit: 'in' },
  { id: 'thighs', label: 'Thighs', unit: 'in' },
];

const INITIAL_WORKOUTS = [
  { id: 'w1', name: 'Morning Run', category: 'cardio', muscleGroup: 'legs', date: '2026-04-28', duration: 35, caloriesBurned: 320, notes: 'Easy pace, felt good', sets: [], completed: true },
  { id: 'w2', name: 'Bench Press', category: 'strength', muscleGroup: 'chest', date: '2026-04-28', duration: 45, caloriesBurned: 180, notes: 'New PR on last set', sets: [{ weight: 135, reps: 10 }, { weight: 155, reps: 8 }, { weight: 175, reps: 5 }, { weight: 185, reps: 3 }], completed: true },
  { id: 'w3', name: 'Yoga Flow', category: 'flexibility', muscleGroup: 'full-body', date: '2026-04-27', duration: 60, caloriesBurned: 150, notes: 'Focused on hip openers', sets: [], completed: true },
  { id: 'w4', name: 'Deadlifts', category: 'strength', muscleGroup: 'back', date: '2026-04-27', duration: 40, caloriesBurned: 200, notes: '', sets: [{ weight: 225, reps: 8 }, { weight: 275, reps: 6 }, { weight: 315, reps: 4 }], completed: true },
  { id: 'w5', name: 'HIIT Circuit', category: 'cardio', muscleGroup: 'full-body', date: '2026-04-26', duration: 25, caloriesBurned: 350, notes: 'Burpees, jump squats, mountain climbers', sets: [], completed: true },
  { id: 'w6', name: 'Shoulder Press', category: 'strength', muscleGroup: 'shoulders', date: '2026-04-26', duration: 30, caloriesBurned: 120, notes: '', sets: [{ weight: 95, reps: 10 }, { weight: 105, reps: 8 }, { weight: 115, reps: 6 }], completed: true },
  { id: 'w7', name: 'Cycling', category: 'cardio', muscleGroup: 'legs', date: '2026-04-25', duration: 50, caloriesBurned: 400, notes: 'Outdoor ride, hilly route', sets: [], completed: true },
  { id: 'w8', name: 'Pull-ups & Rows', category: 'strength', muscleGroup: 'back', date: '2026-04-25', duration: 35, caloriesBurned: 160, notes: '', sets: [{ weight: 0, reps: 12 }, { weight: 0, reps: 10 }, { weight: 0, reps: 8 }], completed: true },
  { id: 'w9', name: 'Rest Day Walk', category: 'cardio', muscleGroup: 'legs', date: '2026-04-24', duration: 30, caloriesBurned: 100, notes: 'Light walk around the park', sets: [], completed: true },
  { id: 'w10', name: 'Squats & Lunges', category: 'strength', muscleGroup: 'legs', date: '2026-04-23', duration: 50, caloriesBurned: 250, notes: 'Leg day', sets: [{ weight: 185, reps: 10 }, { weight: 225, reps: 8 }, { weight: 245, reps: 6 }], completed: true },
];

const INITIAL_MEALS = [
  { id: 'm1', name: 'Oatmeal with Berries', type: 'breakfast', date: '2026-04-28', calories: 350, protein: 12, carbs: 55, fat: 8, notes: 'Added honey and almonds' },
  { id: 'm2', name: 'Grilled Chicken Salad', type: 'lunch', date: '2026-04-28', calories: 450, protein: 42, carbs: 20, fat: 22, notes: '' },
  { id: 'm3', name: 'Salmon with Rice', type: 'dinner', date: '2026-04-28', calories: 620, protein: 38, carbs: 65, fat: 18, notes: 'Teriyaki glaze' },
  { id: 'm4', name: 'Protein Shake', type: 'snack', date: '2026-04-28', calories: 200, protein: 30, carbs: 10, fat: 5, notes: '' },
  { id: 'm5', name: 'Greek Yogurt Parfait', type: 'breakfast', date: '2026-04-27', calories: 300, protein: 20, carbs: 40, fat: 8, notes: 'With granola and fruit' },
  { id: 'm6', name: 'Turkey Wrap', type: 'lunch', date: '2026-04-27', calories: 480, protein: 35, carbs: 45, fat: 16, notes: '' },
  { id: 'm7', name: 'Steak with Vegetables', type: 'dinner', date: '2026-04-27', calories: 700, protein: 50, carbs: 30, fat: 35, notes: 'Medium rare' },
  { id: 'm8', name: 'Apple with Peanut Butter', type: 'snack', date: '2026-04-27', calories: 250, protein: 8, carbs: 30, fat: 14, notes: '' },
  { id: 'm9', name: 'Eggs and Toast', type: 'breakfast', date: '2026-04-26', calories: 380, protein: 22, carbs: 35, fat: 18, notes: 'Scrambled eggs' },
  { id: 'm10', name: 'Pasta Primavera', type: 'dinner', date: '2026-04-26', calories: 550, protein: 18, carbs: 75, fat: 16, notes: '' },
];

const INITIAL_MEASUREMENTS = [
  { id: 'ms1', date: '2026-04-28', weight: 178, bodyFat: 16.5, chest: 42, waist: 33, hips: 38, biceps: 15, thighs: 24 },
  { id: 'ms2', date: '2026-04-21', weight: 179, bodyFat: 16.8, chest: 41.5, waist: 33.2, hips: 38, biceps: 14.8, thighs: 23.8 },
  { id: 'ms3', date: '2026-04-14', weight: 180, bodyFat: 17.2, chest: 41, waist: 33.5, hips: 38.2, biceps: 14.5, thighs: 23.5 },
  { id: 'ms4', date: '2026-04-07', weight: 182, bodyFat: 17.8, chest: 40.5, waist: 34, hips: 38.5, biceps: 14.2, thighs: 23.2 },
  { id: 'ms5', date: '2026-03-31', weight: 183, bodyFat: 18.1, chest: 40, waist: 34.3, hips: 38.5, biceps: 14, thighs: 23 },
];

const INITIAL_GOALS = [
  { id: 'g1', name: 'Lose 10 lbs', targetValue: 173, currentValue: 178, unit: 'lbs', type: 'weight', deadline: '2026-06-30', createdAt: '2026-04-01' },
  { id: 'g2', name: 'Run a 5K under 25 min', targetValue: 25, currentValue: 27.5, unit: 'min', type: 'cardio', deadline: '2026-07-15', createdAt: '2026-04-01' },
  { id: 'g3', name: 'Bench Press 225 lbs', targetValue: 225, currentValue: 185, unit: 'lbs', type: 'strength', deadline: '2026-09-01', createdAt: '2026-04-01' },
  { id: 'g4', name: 'Reduce Body Fat to 14%', targetValue: 14, currentValue: 16.5, unit: '%', type: 'body-composition', deadline: '2026-08-15', createdAt: '2026-04-01' },
  { id: 'g5', name: 'Workout 5 days a week', targetValue: 5, currentValue: 4, unit: 'days/week', type: 'consistency', deadline: '2026-12-31', createdAt: '2026-04-01' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function FitnessTracker() {
  const [workouts, setWorkouts] = useState(INITIAL_WORKOUTS);
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [measurements, setMeasurements] = useState(INITIAL_MEASUREMENTS);
  const [goals, setGoals] = useState(INITIAL_GOALS);

  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Workout state
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [workoutForm, setWorkoutForm] = useState({ name: '', category: 'strength', muscleGroup: 'chest', duration: '', caloriesBurned: '', notes: '', sets: [] });
  const [workoutFilterCategory, setWorkoutFilterCategory] = useState('all');
  const [workoutSortBy, setWorkoutSortBy] = useState('date');

  // Meal state
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealForm, setMealForm] = useState({ name: '', type: 'breakfast', calories: '', protein: '', carbs: '', fat: '', notes: '' });
  const [mealFilterType, setMealFilterType] = useState('all');
  const [selectedMealDate, setSelectedMealDate] = useState('2026-04-28');

  // Measurements state
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurementForm, setMeasurementForm] = useState({ weight: '', bodyFat: '', chest: '', waist: '', hips: '', biceps: '', thighs: '' });

  // Goals state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({ name: '', targetValue: '', currentValue: '', unit: '', type: 'weight', deadline: '' });

  // Detail panel
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('fitnessTrackerTheme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedView = localStorage.getItem('fitnessTrackerView');
    if (savedView) setActiveView(savedView);

    const savedWorkouts = localStorage.getItem('fitnessWorkouts');
    if (savedWorkouts) {
      try { setWorkouts(JSON.parse(savedWorkouts)); } catch (e) { /* ignore */ }
    }

    const savedMeals = localStorage.getItem('fitnessMeals');
    if (savedMeals) {
      try { setMeals(JSON.parse(savedMeals)); } catch (e) { /* ignore */ }
    }

    const savedMeasurements = localStorage.getItem('fitnessMeasurements');
    if (savedMeasurements) {
      try { setMeasurements(JSON.parse(savedMeasurements)); } catch (e) { /* ignore */ }
    }

    const savedGoals = localStorage.getItem('fitnessGoals');
    if (savedGoals) {
      try { setGoals(JSON.parse(savedGoals)); } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => { localStorage.setItem('fitnessWorkouts', JSON.stringify(workouts)); }, [workouts]);
  useEffect(() => { localStorage.setItem('fitnessMeals', JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem('fitnessMeasurements', JSON.stringify(measurements)); }, [measurements]);
  useEffect(() => { localStorage.setItem('fitnessGoals', JSON.stringify(goals)); }, [goals]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowWorkoutModal(false);
        setShowMealModal(false);
        setShowMeasurementModal(false);
        setShowGoalModal(false);
        setSelectedWorkout(null);
        setEditingWorkout(null);
        setEditingMeal(null);
        setEditingGoal(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('fitnessTrackerTheme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const navigateTo = (view) => {
    setActiveView(view);
    setSelectedWorkout(null);
    localStorage.setItem('fitnessTrackerView', view);
  };

  // ── Workout CRUD ──────────────────────────────────────────────────────
  const openAddWorkout = () => {
    setEditingWorkout(null);
    setWorkoutForm({ name: '', category: 'strength', muscleGroup: 'chest', duration: '', caloriesBurned: '', notes: '', sets: [] });
    setShowWorkoutModal(true);
  };

  const openEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setWorkoutForm({
      name: workout.name,
      category: workout.category,
      muscleGroup: workout.muscleGroup,
      duration: workout.duration.toString(),
      caloriesBurned: workout.caloriesBurned.toString(),
      notes: workout.notes,
      sets: [...workout.sets],
    });
    setShowWorkoutModal(true);
  };

  const saveWorkout = () => {
    if (!workoutForm.name.trim()) return;
    const workoutData = {
      name: workoutForm.name.trim(),
      category: workoutForm.category,
      muscleGroup: workoutForm.muscleGroup,
      duration: parseInt(workoutForm.duration) || 0,
      caloriesBurned: parseInt(workoutForm.caloriesBurned) || 0,
      notes: workoutForm.notes,
      sets: workoutForm.sets,
      date: new Date().toISOString().split('T')[0],
      completed: true,
    };
    if (editingWorkout) {
      setWorkouts(prev => prev.map(w => w.id === editingWorkout.id ? { ...w, ...workoutData } : w));
    } else {
      setWorkouts(prev => [{ ...workoutData, id: 'w' + Date.now() }, ...prev]);
    }
    setShowWorkoutModal(false);
    setEditingWorkout(null);
  };

  const deleteWorkout = (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      setWorkouts(prev => prev.filter(w => w.id !== id));
      if (selectedWorkout?.id === id) setSelectedWorkout(null);
    }
  };

  const addSet = () => {
    setWorkoutForm(prev => ({ ...prev, sets: [...prev.sets, { weight: 0, reps: 0 }] }));
  };

  const updateSet = (index, field, value) => {
    setWorkoutForm(prev => ({
      ...prev,
      sets: prev.sets.map((s, i) => i === index ? { ...s, [field]: parseInt(value) || 0 } : s),
    }));
  };

  const removeSet = (index) => {
    setWorkoutForm(prev => ({ ...prev, sets: prev.sets.filter((_, i) => i !== index) }));
  };

  // ── Meal CRUD ─────────────────────────────────────────────────────────
  const openAddMeal = () => {
    setEditingMeal(null);
    setMealForm({ name: '', type: 'breakfast', calories: '', protein: '', carbs: '', fat: '', notes: '' });
    setShowMealModal(true);
  };

  const openEditMeal = (meal) => {
    setEditingMeal(meal);
    setMealForm({
      name: meal.name,
      type: meal.type,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      notes: meal.notes,
    });
    setShowMealModal(true);
  };

  const saveMeal = () => {
    if (!mealForm.name.trim()) return;
    const mealData = {
      name: mealForm.name.trim(),
      type: mealForm.type,
      calories: parseInt(mealForm.calories) || 0,
      protein: parseInt(mealForm.protein) || 0,
      carbs: parseInt(mealForm.carbs) || 0,
      fat: parseInt(mealForm.fat) || 0,
      notes: mealForm.notes,
      date: selectedMealDate,
    };
    if (editingMeal) {
      setMeals(prev => prev.map(m => m.id === editingMeal.id ? { ...m, ...mealData } : m));
    } else {
      setMeals(prev => [{ ...mealData, id: 'm' + Date.now() }, ...prev]);
    }
    setShowMealModal(false);
    setEditingMeal(null);
  };

  const deleteMeal = (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      setMeals(prev => prev.filter(m => m.id !== id));
    }
  };

  // ── Measurement CRUD ──────────────────────────────────────────────────
  const openAddMeasurement = () => {
    setMeasurementForm({ weight: '', bodyFat: '', chest: '', waist: '', hips: '', biceps: '', thighs: '' });
    setShowMeasurementModal(true);
  };

  const saveMeasurement = () => {
    const hasValue = Object.values(measurementForm).some(v => v !== '');
    if (!hasValue) return;
    const measurementData = {
      id: 'ms' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(measurementForm.weight) || 0,
      bodyFat: parseFloat(measurementForm.bodyFat) || 0,
      chest: parseFloat(measurementForm.chest) || 0,
      waist: parseFloat(measurementForm.waist) || 0,
      hips: parseFloat(measurementForm.hips) || 0,
      biceps: parseFloat(measurementForm.biceps) || 0,
      thighs: parseFloat(measurementForm.thighs) || 0,
    };
    setMeasurements(prev => [measurementData, ...prev]);
    setShowMeasurementModal(false);
  };

  const deleteMeasurement = (id) => {
    if (window.confirm('Delete this measurement entry?')) {
      setMeasurements(prev => prev.filter(m => m.id !== id));
    }
  };

  // ── Goal CRUD ─────────────────────────────────────────────────────────
  const openAddGoal = () => {
    setEditingGoal(null);
    setGoalForm({ name: '', targetValue: '', currentValue: '', unit: '', type: 'weight', deadline: '' });
    setShowGoalModal(true);
  };

  const openEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      name: goal.name,
      targetValue: goal.targetValue.toString(),
      currentValue: goal.currentValue.toString(),
      unit: goal.unit,
      type: goal.type,
      deadline: goal.deadline,
    });
    setShowGoalModal(true);
  };

  const saveGoal = () => {
    if (!goalForm.name.trim()) return;
    const goalData = {
      name: goalForm.name.trim(),
      targetValue: parseFloat(goalForm.targetValue) || 0,
      currentValue: parseFloat(goalForm.currentValue) || 0,
      unit: goalForm.unit,
      type: goalForm.type,
      deadline: goalForm.deadline,
    };
    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
    } else {
      setGoals(prev => [...prev, { ...goalData, id: 'g' + Date.now(), createdAt: new Date().toISOString().split('T')[0] }]);
    }
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const deleteGoal = (id) => {
    if (window.confirm('Delete this goal?')) {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const updateGoalProgress = (goalId, newValue) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentValue: parseFloat(newValue) || g.currentValue } : g));
  };

  // ── Derived Computations ──────────────────────────────────────────────
  const getWorkoutStreak = useCallback(() => {
    const today = new Date('2026-04-28');
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasWorkout = workouts.some(w => w.date === dateStr && w.completed);
      if (hasWorkout) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [workouts]);

  const getWeeklyCaloriesBurned = useCallback(() => {
    const weekAgo = new Date('2026-04-21');
    return workouts
      .filter(w => new Date(w.date) >= weekAgo)
      .reduce((sum, w) => sum + w.caloriesBurned, 0);
  }, [workouts]);

  const getWeeklyWorkoutMinutes = useCallback(() => {
    const weekAgo = new Date('2026-04-21');
    return workouts
      .filter(w => new Date(w.date) >= weekAgo)
      .reduce((sum, w) => sum + w.duration, 0);
  }, [workouts]);

  const getDailyNutrition = useCallback((date) => {
    const dayMeals = meals.filter(m => m.date === date);
    return {
      calories: dayMeals.reduce((sum, m) => sum + m.calories, 0),
      protein: dayMeals.reduce((sum, m) => sum + m.protein, 0),
      carbs: dayMeals.reduce((sum, m) => sum + m.carbs, 0),
      fat: dayMeals.reduce((sum, m) => sum + m.fat, 0),
      mealCount: dayMeals.length,
    };
  }, [meals]);

  const getWeightChange = useCallback(() => {
    if (measurements.length < 2) return null;
    const sorted = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));
    return {
      current: sorted[0].weight,
      previous: sorted[1].weight,
      change: sorted[0].weight - sorted[1].weight,
    };
  }, [measurements]);

  const getGoalProgress = useCallback((goal) => {
    const total = Math.abs(goal.targetValue - parseFloat(goal.createdAt ? goal.currentValue : 0));
    if (total === 0) return 100;
    const isDecreasing = goal.type === 'weight' || goal.type === 'body-composition';
    if (isDecreasing) {
      const startValue = measurements.length > 0 ? measurements[measurements.length - 1].weight : goal.currentValue + 10;
      const totalRange = startValue - goal.targetValue;
      if (totalRange <= 0) return 100;
      const progress = ((startValue - goal.currentValue) / totalRange) * 100;
      return Math.min(100, Math.max(0, Math.round(progress)));
    }
    const progress = (goal.currentValue / goal.targetValue) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  }, [measurements]);

  const getCategoryBreakdown = useCallback(() => {
    const breakdown = {};
    EXERCISE_CATEGORIES.forEach(cat => { breakdown[cat] = 0; });
    workouts.forEach(w => { breakdown[w.category] = (breakdown[w.category] || 0) + 1; });
    return breakdown;
  }, [workouts]);

  const getMuscleGroupBreakdown = useCallback(() => {
    const breakdown = {};
    MUSCLE_GROUPS.forEach(mg => { breakdown[mg] = 0; });
    workouts.forEach(w => { breakdown[w.muscleGroup] = (breakdown[w.muscleGroup] || 0) + 1; });
    return breakdown;
  }, [workouts]);

  const getWeeklyActivity = useCallback(() => {
    const activity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date('2026-04-28');
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayWorkouts = workouts.filter(w => w.date === dateStr);
      activity.push({
        date: dateStr,
        dayName: WEEKDAYS[date.getDay()],
        workoutCount: dayWorkouts.length,
        totalDuration: dayWorkouts.reduce((s, w) => s + w.duration, 0),
        totalCalories: dayWorkouts.reduce((s, w) => s + w.caloriesBurned, 0),
      });
    }
    return activity;
  }, [workouts]);

  // ── Filtered Lists ────────────────────────────────────────────────────
  const filteredWorkouts = useMemo(() => {
    let filtered = [...workouts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.muscleGroup.toLowerCase().includes(q) ||
        w.notes.toLowerCase().includes(q)
      );
    }
    if (workoutFilterCategory !== 'all') {
      filtered = filtered.filter(w => w.category === workoutFilterCategory);
    }
    filtered.sort((a, b) => {
      if (workoutSortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (workoutSortBy === 'duration') return b.duration - a.duration;
      if (workoutSortBy === 'calories') return b.caloriesBurned - a.caloriesBurned;
      if (workoutSortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
    return filtered;
  }, [workouts, searchQuery, workoutFilterCategory, workoutSortBy]);

  const filteredMeals = useMemo(() => {
    let filtered = meals.filter(m => m.date === selectedMealDate);
    if (mealFilterType !== 'all') {
      filtered = filtered.filter(m => m.type === mealFilterType);
    }
    return filtered;
  }, [meals, selectedMealDate, mealFilterType]);

  // ── Styles ────────────────────────────────────────────────────────────
  const bgColor = isDarkMode ? '#0f172a' : '#f0fdf4';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const secondaryText = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#d1fae5';
  const accentColor = '#10b981';
  const accentLight = isDarkMode ? '#064e3b' : '#d1fae5';
  const dangerColor = '#ef4444';

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderProgressBar = (percent, color = accentColor, height = 8) => (
    <div style={{ height: `${height}px`, backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: `${height / 2}px`, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, percent)}%`, height: '100%', backgroundColor: color, borderRadius: `${height / 2}px`, transition: 'width 0.3s' }} />
    </div>
  );

  const getCategoryColor = (category) => {
    const colors = { strength: '#6366f1', cardio: '#ef4444', flexibility: '#f59e0b', sports: '#06b6d4', other: '#8b5cf6' };
    return colors[category] || '#6b7280';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? '64px' : '240px', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRight: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: sidebarCollapsed ? '16px 12px' : '20px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: accentColor }}>💪 FitTrack</h1>}
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
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'workouts', icon: '🏋️', label: 'Workouts' },
            { id: 'nutrition', icon: '🥗', label: 'Nutrition' },
            { id: 'measurements', icon: '📏', label: 'Measurements' },
            { id: 'goals', icon: '🎯', label: 'Goals' },
            { id: 'history', icon: '📅', label: 'History' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
                marginBottom: '4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                backgroundColor: activeView === item.id ? accentLight : 'transparent',
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
            <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>Workout Streak</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>🔥 {getWorkoutStreak()} days</div>
            <div style={{ fontSize: '12px', color: secondaryText, marginTop: '8px' }}>{getWeeklyCaloriesBurned()} cal burned this week</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ padding: '12px 24px', backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search workouts... (Ctrl+K)"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleTheme} style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label="Toggle theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700 }}>
              JD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

          {/* ── DASHBOARD VIEW ── */}
          {activeView === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Dashboard</h2>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Weekly Workouts', value: workouts.filter(w => new Date(w.date) >= new Date('2026-04-21')).length, icon: '🏋️', color: accentColor },
                  { label: 'Calories Burned', value: getWeeklyCaloriesBurned(), icon: '🔥', color: '#ef4444' },
                  { label: 'Active Minutes', value: getWeeklyWorkoutMinutes(), icon: '⏱️', color: '#6366f1' },
                  { label: 'Current Weight', value: measurements.length > 0 ? measurements[0].weight + ' lbs' : 'N/A', icon: '⚖️', color: '#f59e0b' },
                ].map(stat => (
                  <div key={stat.label} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '13px', color: secondaryText, marginTop: '4px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Weight Change */}
              {getWeightChange() && (
                <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Weight Trend</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: 700 }}>{getWeightChange().current} lbs</div>
                      <div style={{ fontSize: '13px', color: getWeightChange().change < 0 ? accentColor : dangerColor }}>
                        {getWeightChange().change > 0 ? '+' : ''}{getWeightChange().change.toFixed(1)} lbs from last week
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px' }}>
                      {[...measurements].reverse().map((m, i) => (
                        <div key={m.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '100%', backgroundColor: accentColor + '40', borderRadius: '4px 4px 0 0',
                            height: `${((m.weight - 170) / 15) * 60}px`, minHeight: '4px',
                          }} />
                          <span style={{ fontSize: '10px', color: secondaryText, marginTop: '4px' }}>{m.weight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Activity Chart */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Weekly Activity</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
                  {getWeeklyActivity().map(day => (
                    <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '100%', maxWidth: '40px', backgroundColor: day.workoutCount > 0 ? accentColor : (isDarkMode ? '#334155' : '#e2e8f0'),
                        borderRadius: '6px 6px 0 0', height: `${Math.max(4, day.totalDuration * 1.2)}px`,
                        transition: 'height 0.3s',
                      }} />
                      <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '8px', color: day.workoutCount > 0 ? accentColor : secondaryText }}>
                        {day.dayName}
                      </span>
                      <span style={{ fontSize: '10px', color: secondaryText }}>{day.totalDuration}m</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Nutrition Summary */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Today's Nutrition</h3>
                {(() => {
                  const nutrition = getDailyNutrition('2026-04-28');
                  const calorieGoal = 2200;
                  return (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: secondaryText }}>Calories</span>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{nutrition.calories} / {calorieGoal} kcal</span>
                      </div>
                      {renderProgressBar((nutrition.calories / calorieGoal) * 100)}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                        {[
                          { label: 'Protein', value: nutrition.protein, goal: 150, unit: 'g', color: '#6366f1' },
                          { label: 'Carbs', value: nutrition.carbs, goal: 250, unit: 'g', color: '#f59e0b' },
                          { label: 'Fat', value: nutrition.fat, goal: 70, unit: 'g', color: '#ef4444' },
                        ].map(macro => (
                          <div key={macro.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>
                              <span>{macro.label}</span>
                              <span>{macro.value}/{macro.goal}{macro.unit}</span>
                            </div>
                            {renderProgressBar((macro.value / macro.goal) * 100, macro.color, 6)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Goals Summary */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Goals</h3>
                  <button onClick={() => navigateTo('goals')} style={{ fontSize: '13px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
                </div>
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500 }}>{goal.name}</span>
                      <span style={{ color: secondaryText }}>{getGoalProgress(goal)}%</span>
                    </div>
                    {renderProgressBar(getGoalProgress(goal), accentColor, 6)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WORKOUTS VIEW ── */}
          {activeView === 'workouts' && !selectedWorkout && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Workouts</h2>
                <button
                  onClick={openAddWorkout}
                  style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                  aria-label="Add workout"
                >
                  + Add Workout
                </button>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <select
                  value={workoutFilterCategory}
                  onChange={(e) => setWorkoutFilterCategory(e.target.value)}
                  aria-label="Filter by category"
                  style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor }}
                >
                  <option value="all">All Categories</option>
                  {EXERCISE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <select
                  value={workoutSortBy}
                  onChange={(e) => setWorkoutSortBy(e.target.value)}
                  aria-label="Sort workouts"
                  style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor }}
                >
                  <option value="date">Most Recent</option>
                  <option value="duration">Duration</option>
                  <option value="calories">Calories Burned</option>
                  <option value="name">Name A-Z</option>
                </select>
                <span style={{ fontSize: '13px', color: secondaryText }}>{filteredWorkouts.length} workouts</span>
              </div>

              {/* Category Breakdown */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '16px 20px', border: `1px solid ${borderColor}`, marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Category Breakdown</h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {Object.entries(getCategoryBreakdown()).filter(([, count]) => count > 0).map(([cat, count]) => (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getCategoryColor(cat) }} />
                      <span style={{ fontSize: '12px', color: secondaryText }}>{cat}: {count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workout List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredWorkouts.map(workout => (
                  <div
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '16px 20px', border: `1px solid ${borderColor}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: getCategoryColor(workout.category) + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      {workout.category === 'strength' ? '🏋️' : workout.category === 'cardio' ? '🏃' : workout.category === 'flexibility' ? '🧘' : workout.category === 'sports' ? '⚽' : '💪'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{workout.name}</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: secondaryText }}>
                        <span>{formatDate(workout.date)}</span>
                        <span>{workout.duration} min</span>
                        <span>{workout.caloriesBurned} cal</span>
                        <span style={{ color: getCategoryColor(workout.category) }}>{workout.category}</span>
                        <span>{workout.muscleGroup}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditWorkout(workout); }}
                        style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '12px', color: secondaryText }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteWorkout(workout.id); }}
                        style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '12px', color: dangerColor }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workout Detail */}
          {activeView === 'workouts' && selectedWorkout && (
            <div>
              <button
                onClick={() => setSelectedWorkout(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: accentColor, fontSize: '13px', marginBottom: '16px' }}
              >
                ← Back to Workouts
              </button>
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '24px', border: `1px solid ${borderColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>{selectedWorkout.name}</h2>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: secondaryText }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: getCategoryColor(selectedWorkout.category) + '20', color: getCategoryColor(selectedWorkout.category) }}>{selectedWorkout.category}</span>
                      <span>{selectedWorkout.muscleGroup}</span>
                      <span>{formatDate(selectedWorkout.date)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditWorkout(selectedWorkout)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '13px', color: textColor }}>Edit</button>
                    <button onClick={() => deleteWorkout(selectedWorkout.id)} style={{ padding: '8px 16px', border: `1px solid ${dangerColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '13px', color: dangerColor }}>Delete</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '16px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: accentColor }}>{selectedWorkout.duration}</div>
                    <div style={{ fontSize: '12px', color: secondaryText }}>Minutes</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{selectedWorkout.caloriesBurned}</div>
                    <div style={{ fontSize: '12px', color: secondaryText }}>Calories</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>{selectedWorkout.sets.length}</div>
                    <div style={{ fontSize: '12px', color: secondaryText }}>Sets</div>
                  </div>
                </div>

                {selectedWorkout.sets.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>Sets</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: secondaryText, fontWeight: 600 }}>Set</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', color: secondaryText, fontWeight: 600 }}>Weight (lbs)</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', color: secondaryText, fontWeight: 600 }}>Reps</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', color: secondaryText, fontWeight: 600 }}>Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWorkout.sets.map((set, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${borderColor}` }}>
                            <td style={{ padding: '8px 12px' }}>#{i + 1}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{set.weight}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{set.reps}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{set.weight * set.reps}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" style={{ padding: '8px 12px', fontWeight: 600 }}>Total Volume</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: accentColor }}>
                            {selectedWorkout.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)} lbs
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {selectedWorkout.notes && (
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Notes</h3>
                    <p style={{ fontSize: '14px', color: secondaryText, lineHeight: 1.6, margin: 0 }}>{selectedWorkout.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── NUTRITION VIEW ── */}
          {activeView === 'nutrition' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Nutrition</h2>
                <button
                  onClick={openAddMeal}
                  style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                  aria-label="Log meal"
                >
                  + Log Meal
                </button>
              </div>

              {/* Date picker + filter */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <input
                  type="date"
                  value={selectedMealDate}
                  onChange={(e) => setSelectedMealDate(e.target.value)}
                  aria-label="Select date"
                  style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor }}
                />
                <select
                  value={mealFilterType}
                  onChange={(e) => setMealFilterType(e.target.value)}
                  aria-label="Filter by meal type"
                  style={{ padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textColor }}
                >
                  <option value="all">All Meals</option>
                  {MEAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              {/* Daily Summary */}
              {(() => {
                const nutrition = getDailyNutrition(selectedMealDate);
                return (
                  <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Daily Summary — {formatDate(selectedMealDate)}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: accentColor }}>{nutrition.calories}</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Calories</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>{nutrition.protein}g</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Protein</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{nutrition.carbs}g</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Carbs</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{nutrition.fat}g</div>
                        <div style={{ fontSize: '12px', color: secondaryText }}>Fat</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Meal List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MEAL_TYPES.map(mealType => {
                  const typeMeals = filteredMeals.filter(m => m.type === mealType);
                  if (mealFilterType !== 'all' && mealFilterType !== mealType) return null;
                  return (
                    <div key={mealType}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize', marginBottom: '8px', color: secondaryText }}>
                        {mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '☀️' : mealType === 'dinner' ? '🌙' : '🍎'} {mealType}
                      </h4>
                      {typeMeals.length === 0 ? (
                        <div style={{ padding: '16px', backgroundColor: cardBg, borderRadius: '8px', border: `1px solid ${borderColor}`, fontSize: '13px', color: secondaryText }}>
                          No {mealType} logged
                        </div>
                      ) : (
                        typeMeals.map(meal => (
                          <div key={meal.id} style={{ backgroundColor: cardBg, borderRadius: '8px', padding: '14px 16px', border: `1px solid ${borderColor}`, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{meal.name}</div>
                              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: secondaryText }}>
                                <span>{meal.calories} cal</span>
                                <span>P: {meal.protein}g</span>
                                <span>C: {meal.carbs}g</span>
                                <span>F: {meal.fat}g</span>
                              </div>
                              {meal.notes && <div style={{ fontSize: '12px', color: secondaryText, marginTop: '4px', fontStyle: 'italic' }}>{meal.notes}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => openEditMeal(meal)} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '11px', color: secondaryText }}>Edit</button>
                              <button onClick={() => deleteMeal(meal.id)} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '11px', color: dangerColor }}>Delete</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MEASUREMENTS VIEW ── */}
          {activeView === 'measurements' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Body Measurements</h2>
                <button
                  onClick={openAddMeasurement}
                  style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                  aria-label="Add measurement"
                >
                  + Record Measurement
                </button>
              </div>

              {/* Latest Measurements Cards */}
              {measurements.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {MEASUREMENT_TYPES.slice(0, 4).map(mt => {
                    const latest = measurements[0][mt.id];
                    const previous = measurements.length > 1 ? measurements[1][mt.id] : null;
                    const change = previous !== null ? latest - previous : null;
                    return (
                      <div key={mt.id} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '16px', border: `1px solid ${borderColor}` }}>
                        <div style={{ fontSize: '12px', color: secondaryText, marginBottom: '4px' }}>{mt.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>{latest} <span style={{ fontSize: '12px', fontWeight: 400, color: secondaryText }}>{mt.unit}</span></div>
                        {change !== null && (
                          <div style={{ fontSize: '12px', color: change < 0 ? accentColor : change > 0 ? dangerColor : secondaryText, marginTop: '4px' }}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)} {mt.unit}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Measurement History Table */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${borderColor}`, backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: secondaryText }}>Date</th>
                        {MEASUREMENT_TYPES.map(mt => (
                          <th key={mt.id} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: secondaryText }}>{mt.label} ({mt.unit})</th>
                        ))}
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: secondaryText }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.map(m => (
                        <tr key={m.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <td style={{ padding: '10px 16px', fontWeight: 500 }}>{formatDate(m.date)}</td>
                          {MEASUREMENT_TYPES.map(mt => (
                            <td key={mt.id} style={{ padding: '10px 12px', textAlign: 'right' }}>{m[mt.id]}</td>
                          ))}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => deleteMeasurement(m.id)}
                              style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '11px', color: dangerColor }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── GOALS VIEW ── */}
          {activeView === 'goals' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Goals</h2>
                <button
                  onClick={openAddGoal}
                  style={{ padding: '8px 16px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                  aria-label="Add goal"
                >
                  + Add Goal
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {goals.map(goal => {
                  const progress = getGoalProgress(goal);
                  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline) - new Date('2026-04-28')) / 86400000));
                  return (
                    <div key={goal.id} style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{goal.name}</h3>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', backgroundColor: accentLight, color: accentColor }}>{goal.type}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEditGoal(goal)} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '11px', color: secondaryText }}>Edit</button>
                          <button onClick={() => deleteGoal(goal.id)} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '11px', color: dangerColor }}>Delete</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: secondaryText }}>Current: {goal.currentValue} {goal.unit}</span>
                          <span style={{ color: secondaryText }}>Target: {goal.targetValue} {goal.unit}</span>
                        </div>
                        {renderProgressBar(progress)}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                          <span style={{ color: progress >= 100 ? accentColor : secondaryText, fontWeight: progress >= 100 ? 700 : 400 }}>
                            {progress >= 100 ? '🎉 Goal Reached!' : `${progress}% complete`}
                          </span>
                          <span style={{ color: daysLeft < 30 ? dangerColor : secondaryText }}>{daysLeft} days left</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="Update progress"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateGoalProgress(goal.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          style={{ flex: 1, padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: 'transparent', color: textColor }}
                          aria-label={`Update ${goal.name} progress`}
                        />
                        <span style={{ fontSize: '11px', color: secondaryText }}>Press Enter</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── HISTORY VIEW ── */}
          {activeView === 'history' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Activity History</h2>

              {/* Muscle Group Heatmap */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '20px', border: `1px solid ${borderColor}`, marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Muscle Group Frequency</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                  {Object.entries(getMuscleGroupBreakdown()).map(([group, count]) => {
                    const maxCount = Math.max(...Object.values(getMuscleGroupBreakdown()));
                    const intensity = maxCount > 0 ? count / maxCount : 0;
                    return (
                      <div key={group} style={{
                        padding: '12px', borderRadius: '8px', textAlign: 'center',
                        backgroundColor: count > 0 ? `rgba(16, 185, 129, ${0.1 + intensity * 0.5})` : (isDarkMode ? '#1e293b' : '#f1f5f9'),
                        border: `1px solid ${borderColor}`,
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: count > 0 ? accentColor : secondaryText }}>{count}</div>
                        <div style={{ fontSize: '11px', color: secondaryText, textTransform: 'capitalize' }}>{group}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Workout Log */}
              <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${borderColor}` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Full Log</h3>
                </div>
                {[...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)).map(workout => (
                  <div key={workout.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getCategoryColor(workout.category), flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{workout.name}</div>
                      <div style={{ fontSize: '11px', color: secondaryText }}>{formatDate(workout.date)} · {workout.duration}m · {workout.caloriesBurned} cal</div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: getCategoryColor(workout.category) + '20', color: getCategoryColor(workout.category) }}>{workout.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── WORKOUT MODAL ── */}
      {showWorkoutModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowWorkoutModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{editingWorkout ? 'Edit Workout' : 'Add Workout'}</h2>
              <button onClick={() => setShowWorkoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Name</label>
                <input type="text" value={workoutForm.name} onChange={(e) => setWorkoutForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Bench Press" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Category</label>
                  <select value={workoutForm.category} onChange={(e) => setWorkoutForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {EXERCISE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Muscle Group</label>
                  <select value={workoutForm.muscleGroup} onChange={(e) => setWorkoutForm(p => ({ ...p, muscleGroup: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg.charAt(0).toUpperCase() + mg.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Duration (min)</label>
                  <input type="number" value={workoutForm.duration} onChange={(e) => setWorkoutForm(p => ({ ...p, duration: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Calories Burned</label>
                  <input type="number" value={workoutForm.caloriesBurned} onChange={(e) => setWorkoutForm(p => ({ ...p, caloriesBurned: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Notes</label>
                <textarea value={workoutForm.notes} onChange={(e) => setWorkoutForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Optional notes..." style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              {/* Sets */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Sets</label>
                  <button onClick={addSet} style={{ fontSize: '12px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Set</button>
                </div>
                {workoutForm.sets.map((set, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: secondaryText, width: '20px' }}>#{i + 1}</span>
                    <input type="number" placeholder="Weight" value={set.weight} onChange={(e) => updateSet(i, 'weight', e.target.value)} style={{ flex: 1, padding: '6px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: 'transparent', color: textColor }} />
                    <input type="number" placeholder="Reps" value={set.reps} onChange={(e) => updateSet(i, 'reps', e.target.value)} style={{ flex: 1, padding: '6px 8px', border: `1px solid ${borderColor}`, borderRadius: '6px', fontSize: '12px', backgroundColor: 'transparent', color: textColor }} />
                    <button onClick={() => removeSet(i)} style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: dangerColor + '20', color: dangerColor, fontSize: '12px' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowWorkoutModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>Cancel</button>
              <button onClick={saveWorkout} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                {editingWorkout ? 'Save Changes' : 'Add Workout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MEAL MODAL ── */}
      {showMealModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowMealModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{editingMeal ? 'Edit Meal' : 'Log Meal'}</h2>
              <button onClick={() => setShowMealModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Meal Name</label>
                <input type="text" value={mealForm.name} onChange={(e) => setMealForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Chicken Salad" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Meal Type</label>
                <select value={mealForm.type} onChange={(e) => setMealForm(p => ({ ...p, type: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                  {MEAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Calories</label>
                  <input type="number" value={mealForm.calories} onChange={(e) => setMealForm(p => ({ ...p, calories: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Protein (g)</label>
                  <input type="number" value={mealForm.protein} onChange={(e) => setMealForm(p => ({ ...p, protein: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Carbs (g)</label>
                  <input type="number" value={mealForm.carbs} onChange={(e) => setMealForm(p => ({ ...p, carbs: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Fat (g)</label>
                  <input type="number" value={mealForm.fat} onChange={(e) => setMealForm(p => ({ ...p, fat: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Notes</label>
                <input type="text" value={mealForm.notes} onChange={(e) => setMealForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowMealModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>Cancel</button>
              <button onClick={saveMeal} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                {editingMeal ? 'Save Changes' : 'Log Meal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MEASUREMENT MODAL ── */}
      {showMeasurementModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowMeasurementModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Record Measurements</h2>
              <button onClick={() => setShowMeasurementModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {MEASUREMENT_TYPES.map(mt => (
                <div key={mt.id}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{mt.label} ({mt.unit})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementForm[mt.id]}
                    onChange={(e) => setMeasurementForm(p => ({ ...p, [mt.id]: e.target.value }))}
                    placeholder={mt.label}
                    style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowMeasurementModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>Cancel</button>
              <button onClick={saveMeasurement} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── GOAL MODAL ── */}
      {showGoalModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowGoalModal(false)}>
          <div style={{ backgroundColor: cardBg, borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{editingGoal ? 'Edit Goal' : 'Add Goal'}</h2>
              <button onClick={() => setShowGoalModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: secondaryText }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Goal Name</label>
                <input type="text" value={goalForm.name} onChange={(e) => setGoalForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Lose 10 lbs" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Target Value</label>
                  <input type="number" value={goalForm.targetValue} onChange={(e) => setGoalForm(p => ({ ...p, targetValue: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Current Value</label>
                  <input type="number" value={goalForm.currentValue} onChange={(e) => setGoalForm(p => ({ ...p, currentValue: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Unit</label>
                  <input type="text" value={goalForm.unit} onChange={(e) => setGoalForm(p => ({ ...p, unit: e.target.value }))} placeholder="lbs, min, %" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Type</label>
                  <select value={goalForm.type} onChange={(e) => setGoalForm(p => ({ ...p, type: e.target.value }))} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '13px', backgroundColor: 'transparent', color: textColor }}>
                    <option value="weight">Weight</option>
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="body-composition">Body Composition</option>
                    <option value="consistency">Consistency</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Deadline</label>
                <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm(p => ({ ...p, deadline: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', backgroundColor: 'transparent', color: textColor, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowGoalModal(false)} style={{ padding: '8px 16px', border: `1px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: textColor, fontSize: '13px' }}>Cancel</button>
              <button onClick={saveGoal} style={{ padding: '8px 20px', backgroundColor: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                {editingGoal ? 'Save Changes' : 'Add Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
