import type { Session } from '@supabase/supabase-js';

export interface Macros {
    protein: number;
    carbs: number;
    fats: number;
}

export interface Meal {
    id: number;
    name: string;
    targetMacros: Macros;
    completed: boolean;
    completedAt?: string; // ISO string
    skipped?: boolean;
}

export interface Supplement {
    id: string;
    name: string;
    type: 'hormonal' | 'gym';
    timing: string;
    taken: boolean;
}

export interface TodoCategory {
    id: string;
    label: string;
    icon: string;
    color: string;
    isDefault?: boolean;
}

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    category: string;
    priority?: boolean;
}

export type HabitType = 'regular' | 'numeric' | 'time';

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    color?: string; // Hex color
    type: HabitType;
    completed: boolean;
    streak: number;
    frequency: string[]; // ['Mon', 'Tue', ...]
    target?: number; // For numeric (e.g., 7000 steps)
    unit?: string; // For numeric (e.g., 'pasos', 'kg')
    reminderTime?: string; // HH:mm
    value?: number | string; // Current value (number for numeric, string for time)
    category?: string;
    archived?: boolean;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export interface FruitIntake {
    apples: number;
    oranges: number;
    bananas: number;
}

export interface FrequentMeal {
    id: string;
    name: string;
    macros: Macros;
}

export interface UserState {
    selectedDate: Date;
    dailyTargets: Macros;
    mealCount: number;
    meals: Meal[];
    supplements: Supplement[];
    waterIntake: number;
    waterTarget: number;
    lastCheatTimestamp: string | null;
    cheatMealsPerWeek: number;
    coachInstructions: string;
    coachEquivalencies: string;
    habits: Habit[];
    todoList: TodoItem[];
    todoCategories: TodoCategory[];
    fruitIntake: FruitIntake;
}

export interface GlobalSettings {
    waterTarget: number;
    waterIntake?: number;
    supplements: Supplement[];
    habits: Habit[];
    todoCategories: TodoCategory[];
    todoList?: TodoItem[];
    frequentMeals?: FrequentMeal[];
    theme?: string;
    liteMode?: boolean;
}

export interface UserContextType extends UserState {
    setSelectedDate: (date: Date) => void;
    setDailyTargets: (targets: Macros) => void;
    setMealCount: (count: number) => void;
    updateMealMacros: (mealId: number, macros: Macros) => void;
    updateMealName: (mealId: number, name: string) => void;
    toggleMealCompletion: (mealId: number) => void;
    toggleMealSkipped: (mealId: number) => void;
    logAIAssistedMeal: (mealId: number, macros: Macros) => void;
    registerCheatMeal: () => void;
    undoCheatMeal: () => void;
    setCheatMealsPerWeek: (count: number) => void;
    setCoachInstructions: (instructions: string) => void;
    setCoachEquivalencies: (equivalencies: string) => void;
    toggleSupplement: (id: string) => void;
    addSupplement: (supplement: Omit<Supplement, 'id' | 'taken'>) => void;
    updateSupplement: (id: string, updates: Partial<Supplement>) => void;
    deleteSupplement: (id: string) => void;
    updateWater: (amount: number) => void;
    setWaterTarget: (target: number) => void;
    resetDay: () => void;
    isLoading: boolean;
    getWeeklyHistory: (days?: number) => Promise<WeeklyHistoryData[]>;
    session: Session | null;
    loadingSession: boolean;
    logout: () => Promise<void>;
    addHabit: (habit: Omit<Habit, 'id' | 'completed' | 'streak'>) => void;
    toggleHabit: (id: string) => void;
    deleteHabit: (id: string) => void;
    restoreHabit: (habit: Habit, index: number) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    reorderHabits: (newOrder: Habit[]) => void;
    updateHabitValue: (id: string, value: number | string) => void;
    addTodo: (text: string, category: string, priority?: boolean) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    addTodoCategory: (category: Omit<TodoCategory, 'id'>) => void;
    deleteTodoCategory: (id: string) => void;

    globalSettings: GlobalSettings | null;
    incrementFruit: (fruit: keyof FruitIntake) => void;
    decrementFruit: (fruit: keyof FruitIntake) => void;
    frequentMeals: FrequentMeal[];
    addFrequentMeal: (meal: Omit<FrequentMeal, 'id'>) => void;
    deleteFrequentMeal: (id: string) => void;
    updateFrequentMeal: (id: string, updates: Partial<FrequentMeal>) => void;
    applyFrequentMeal: (mealId: number, frequentMealId: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
    liteMode: boolean;
    setLiteMode: (lite: boolean) => void;
    updateHabitsForDate: (date: Date, habits: Habit[]) => Promise<void>;
    getMonthlyHabitStats: (date: Date) => Promise<MonthlyHabitStats[]>;
    getHabitsForDateRange: (startDate: Date, endDate: Date) => Promise<MonthlyHabitStats[]>;
    getHabitHistory: (days: number) => Promise<MonthlyHabitStats[]>;
    deleteAccount: () => Promise<void>;
}


export interface MonthlyHabitStats {
    date: string;
    habits: Habit[];
}

export interface WeeklyHistoryData {
    date: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    water: number;
    mealsCompleted: number;
    totalMeals: number;
    supplementsTaken: number;
    totalSupplements: number;
    weight?: number;
}
