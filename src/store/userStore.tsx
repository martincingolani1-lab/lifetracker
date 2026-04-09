import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type {
    Macros, Meal, Supplement, Habit, TodoItem, TodoCategory,
    UserContextType, GlobalSettings, WeeklyHistoryData, FruitIntake, FrequentMeal
} from '../types';
import type { Session } from '@supabase/supabase-js';

// --- Initial Data ---

const INITIAL_TARGETS: Macros = { protein: 150, carbs: 150, fats: 50 };

const INITIAL_SUPPLEMENTS: Supplement[] = [];
const INITIAL_FRUIT_INTAKE: FruitIntake = { apples: 0, oranges: 0, bananas: 0 };

export const FRUIT_MACROS: Record<keyof FruitIntake, Macros> = {
    apples: { protein: 0, carbs: 15, fats: 0 },
    oranges: { protein: 1, carbs: 12, fats: 0 },
    bananas: { protein: 1, carbs: 25, fats: 0 }
};



const INITIAL_HABITS: Habit[] = [];

const INITIAL_TODO_CATEGORIES: TodoCategory[] = [
    { id: 'personal', label: 'Personal', icon: 'person', color: 'text-blue-400', isDefault: true },
    { id: 'work', label: 'Trabajo', icon: 'work', color: 'text-purple-400', isDefault: true },
    { id: 'health', label: 'Salud', icon: 'favorite', color: 'text-primary', isDefault: true },
    { id: 'other', label: 'Otros', icon: 'more_horiz', color: 'text-gray-400', isDefault: true },
];

const INITIAL_GLOBAL_SETTINGS: GlobalSettings = {
    waterTarget: 3000,
    supplements: INITIAL_SUPPLEMENTS,
    habits: INITIAL_HABITS,
    todoCategories: INITIAL_TODO_CATEGORIES,
    waterIntake: 0,
    todoList: [],
    frequentMeals: [],
    theme: 'color',
    liteMode: false
};

// --- Helper Functions ---
const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const generateMeals = (count: number): Meal[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Comida ${i + 1} `,
        targetMacros: {
            protein: 0,
            carbs: 0,
            fats: 0,
        },
        completed: false
    }));
};

const calculateStreak = (recentHabit?: Habit, recentDateStr?: string, isCompletedToday: boolean = false): number => {
    let baseStreak = 0;
    if (recentHabit) {
        if (recentHabit.completed) {
            baseStreak = recentHabit.streak;
        } else if (recentDateStr) {
            const [y, m, d] = recentDateStr.split('-').map(Number);
            const rDate = new Date(y, m - 1, d);
            if (!isNaN(rDate.getTime())) {
                const dayCode = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][rDate.getDay()];
                const wasScheduled = recentHabit.frequency.includes(dayCode);
                if (!wasScheduled) baseStreak = recentHabit.streak;
            }
        }
    }
    return isCompletedToday ? baseStreak + 1 : baseStreak;
};

// --- Context ---

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [session, setSession] = useState<Session | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);

    // Safety Ref to prevent race conditions during date switching
    const loadedDateRef = useRef<string | null>(null);

    // Data State
    const [dailyTargets, setDailyTargetsState] = useState<Macros>(INITIAL_TARGETS);
    const [mealCount, setMealCountState] = useState(4);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [supplements, setSupplements] = useState<Supplement[]>(INITIAL_SUPPLEMENTS);
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterTarget, setWaterTargetState] = useState(3000);
    const [lastCheatTimestamp, setLastCheatTimestamp] = useState<string | null>(null);
    const [cheatMealsPerWeek, setCheatMealsPerWeekState] = useState(1);
    const [coachInstructions, setCoachInstructionsState] = useState('');
    const [coachEquivalencies, setCoachEquivalenciesState] = useState('');
    const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
    const [todoList, setTodoList] = useState<TodoItem[]>([]);
    const [todoCategories, setTodoCategories] = useState<TodoCategory[]>(INITIAL_TODO_CATEGORIES);
    const [fruitIntake, setFruitIntake] = useState<FruitIntake>(INITIAL_FRUIT_INTAKE);
    const [frequentMeals, setFrequentMeals] = useState<FrequentMeal[]>([]);
    const [theme, setThemeState] = useState<string>('color');
    const [liteMode, setLiteModeState] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
    const globalSettingsRef = useRef<GlobalSettings | null>(null);
    const lastUpdateFromSelfRef = useRef<string | null>(null);

    // Sync master settings to user_sync
    const syncGlobalSettings = useCallback(async (updates: Partial<GlobalSettings>) => {
        if (!session) return;
        try {
            const settingsToUse = globalSettingsRef.current || INITIAL_GLOBAL_SETTINGS;
            const newSettings = { ...settingsToUse, ...updates };
            const now = new Date().toISOString();

            const { error } = await supabase.from('user_sync').upsert({
                user_id: session.user.id,
                logs: newSettings,
                updated_at: now
            });

            if (error) throw error;

            lastUpdateFromSelfRef.current = now;
            globalSettingsRef.current = newSettings;
            setGlobalSettings(newSettings);
        } catch (err) {
            console.error('Error syncing global settings:', err);
            toast.error('Error al sincronizar configuración');
        }
    }, [session]);

    // Setup Auth Session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoadingSession(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) {
                // Clear state on logout
                setMeals([]);
                setWaterIntake(0);
                setIsInitialized(false);
                loadedDateRef.current = null;
                setGlobalSettings(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadData = useCallback(async (currentSettings: GlobalSettings | null, options: { silent?: boolean, targetDate?: Date } = {}) => {
        if (!session) return;
        const dateToUse = options.targetDate || selectedDate;
        const dateKey = formatDateKey(dateToUse);

        if (!options.silent) {
            loadedDateRef.current = null;
            setIsLoading(true);
        }

        try {
            const [currentLogResult, recentLogResult] = await Promise.all([
                supabase
                    .from('daily_logs')
                    .select('data, updated_at')
                    .eq('user_id', session.user.id)
                    .eq('date', dateKey)
                    .single(),
                supabase
                    .from('daily_logs')
                    .select('data, date')
                    .eq('user_id', session.user.id)
                    .lt('date', dateKey)
                    .order('date', { ascending: false })
                    .limit(1)
            ]);

            const { data, error } = currentLogResult;
            const { data: recentLogs } = recentLogResult;
            const recent = recentLogs?.[0]?.data;

            // Update safety ref to avoid re-syncing our own data if we just loaded it
            if (data?.updated_at) {
                lastUpdateFromSelfRef.current = data.updated_at;
            }

            if (data && data.data) {
                const parsed = data.data;
                const isTodayOrFuture = new Date(dateToUse).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0);

                setMealCountState(parsed.mealCount || 4);
                if (parsed.meals && Array.isArray(parsed.meals) && parsed.meals.length > 0) {
                    setMeals(parsed.meals);
                } else {
                    setMeals(generateMeals(parsed.mealCount || 4));
                }

                if (isTodayOrFuture && currentSettings?.supplements) {
                    const currentTakenMap = new Map<string, boolean>((parsed.supplements || []).map((s: Supplement) => [s.name, !!s.taken]));
                    const syncedSupps: Supplement[] = currentSettings.supplements.map((s: Supplement) => ({
                        ...s,
                        taken: currentTakenMap.get(s.name) || false
                    }));
                    setSupplements(syncedSupps);
                } else {
                    setSupplements(parsed.supplements || INITIAL_SUPPLEMENTS);
                }

                setWaterIntake(parsed.waterIntake || 0);

                if (isTodayOrFuture && currentSettings?.waterTarget) {
                    setWaterTargetState(currentSettings.waterTarget);
                } else {
                    setWaterTargetState(parsed.waterTarget || 3000);
                }

                setDailyTargetsState(parsed.dailyTargets || INITIAL_TARGETS);
                setCheatMealsPerWeekState(parsed.cheatMealsPerWeek || 1);
                setCoachInstructionsState(parsed.coachInstructions || '');
                setCoachEquivalenciesState(parsed.coachEquivalencies || '');
                setFruitIntake(parsed.fruitIntake || INITIAL_FRUIT_INTAKE);

                if (isTodayOrFuture && Array.isArray(currentSettings?.habits)) {
                    const rawHabits = Array.isArray(parsed.habits) ? parsed.habits : [];
                    const currentStatusMap = new Map<string, { completed: boolean; value: number | string | undefined }>(rawHabits.map((h: Habit) => [h.id, { completed: !!h.completed, value: h.value }]));

                    const syncedHabits = currentSettings.habits
                        .filter((h: Habit) => !h.archived)
                        .map((h: Habit) => {
                            const status = currentStatusMap.get(h.id);
                            const isCompleted = status?.completed || false;
                            const recentH = (recent?.habits || []).find((rh: Habit) => rh.id === h.id);
                            const recentDate = recentLogs?.[0]?.date;
                            return {
                                ...h,
                                completed: isCompleted,
                                value: status?.value !== undefined ? status.value : (h.type === 'numeric' ? 0 : ''),
                                streak: calculateStreak(recentH, recentDate, isCompleted)
                            };
                        });
                    setHabits(syncedHabits);
                } else {
                    const loadedHabits = Array.isArray(parsed.habits) ? parsed.habits : INITIAL_HABITS;
                    setHabits(loadedHabits.filter((h: Habit) => !h.archived).map((h: Habit) => {
                        const recentH = (recent?.habits || []).find((rh: Habit) => rh.id === h.id);
                        const recentDate = recentLogs?.[0]?.date;
                        return { ...h, streak: calculateStreak(recentH, recentDate, h.completed) };
                    }));
                }

                if (isTodayOrFuture && currentSettings?.todoCategories) {
                    setTodoCategories(currentSettings.todoCategories);
                } else {
                    setTodoCategories(parsed.todoCategories || INITIAL_TODO_CATEGORIES);
                }

                const globalTodos = currentSettings?.todoList || [];
                const dailyTodos = (parsed.todoList || []).filter((t: TodoItem) => t.completed);
                const mergedTodos = Array.from(new Map([...globalTodos, ...dailyTodos].map(t => [t.id, t])).values());
                setTodoList(mergedTodos);

            } else if ((error && error.code === 'PGRST116') || (data && !data.data)) {
                const recent = recentLogs?.[0]?.data;
                const baseSupplements = currentSettings?.supplements || recent?.supplements || INITIAL_SUPPLEMENTS;
                const baseWaterTarget = currentSettings?.waterTarget || recent?.waterTarget || 3000;

                if (recent) {
                    setMeals(generateMeals(recent.mealCount || 4));
                    setMealCountState(recent.mealCount || 4);
                    setDailyTargetsState(recent.dailyTargets || INITIAL_TARGETS);
                    setSupplements(baseSupplements.map((s: Supplement) => ({ ...s, taken: false })));

                    let masterHabits = currentSettings?.habits || recent.habits || INITIAL_HABITS;
                    if (!Array.isArray(masterHabits)) masterHabits = INITIAL_HABITS;
                    setHabits(masterHabits
                        .filter((h: Habit) => !h.archived)
                        .map((h: Habit) => {
                            const recentH = (recent.habits || []).find((rh: Habit) => rh.id === h.id);
                            const recentDate = recentLogs?.[0]?.date;
                            return {
                                ...h,
                                completed: false,
                                value: h.type === 'numeric' ? 0 : '',
                                streak: calculateStreak(recentH, recentDate, false)
                            };
                        }));

                    const globalTodos = currentSettings?.todoList || [];
                    const recentUncompleted = (recent.todoList || []).filter((t: TodoItem) => !t.completed);

                    if (globalTodos.length === 0 && recentUncompleted.length > 0) {
                        syncGlobalSettings({ todoList: recentUncompleted });
                    }

                    const finalTodoList = Array.from(new Map([...globalTodos, ...recentUncompleted].map(t => [t.id, t])).values());
                    setTodoList(finalTodoList);

                    if (currentSettings?.todoCategories) {
                        setTodoCategories(currentSettings.todoCategories);
                    } else {
                        setTodoCategories(recent.todoCategories || INITIAL_TODO_CATEGORIES);
                    }

                    setWaterIntake(0);
                    setWaterTargetState(baseWaterTarget);
                    setCheatMealsPerWeekState(recent.cheatMealsPerWeek || 1);
                    setCoachInstructionsState(recent.coachInstructions || '');
                    setCoachEquivalenciesState(recent.coachEquivalencies || '');
                    setFruitIntake(INITIAL_FRUIT_INTAKE);
                } else {
                    setMeals(generateMeals(mealCount));
                    setSupplements(baseSupplements.map((s: Supplement) => ({ ...s, taken: false })));
                    setHabits((currentSettings?.habits || INITIAL_HABITS)
                        .filter((h: Habit) => !h.archived)
                        .map((h: Habit) => ({ ...h, completed: false, value: h.type === 'numeric' ? 0 : '' })));

                    if (currentSettings?.todoCategories) {
                        setTodoCategories(currentSettings.todoCategories);
                    } else {
                        setTodoCategories(INITIAL_TODO_CATEGORIES);
                    }

                    setTodoList([]);
                    setWaterIntake(0);
                    setWaterTargetState(baseWaterTarget);
                    setDailyTargetsState(INITIAL_TARGETS);
                    setFruitIntake(INITIAL_FRUIT_INTAKE);
                }
            }

            loadedDateRef.current = dateKey;
        } catch (err) {
            console.error('Error loading data:', err);
            if (!options.silent) toast.error('Error al cargar datos');
        } finally {
            if (!options.silent) setIsLoading(false);
            setIsInitialized(true);
        }
    }, [session, selectedDate, mealCount, syncGlobalSettings]);

    const initGlobal = useCallback(async () => {
        if (!session) return;
        let currentSettings = globalSettingsRef.current;

        const fetchLastCheat = async (userId: string) => {
            const { data: cheatData } = await supabase
                .from('daily_logs')
                .select('data')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .limit(100);

            if (cheatData) {
                const lastCheat = cheatData.find(row => row.data && row.data.cheatTimestamp);
                setLastCheatTimestamp(lastCheat ? lastCheat.data.cheatTimestamp : null);
            }
        };

        if (!isInitialized) {
            const [settingsResult] = await Promise.all([
                !currentSettings
                    ? supabase.from('user_sync').select('logs').eq('user_id', session.user.id).single()
                    : Promise.resolve({ data: { logs: currentSettings } }),
                fetchLastCheat(session.user.id)
            ]);

            if (settingsResult.data?.logs) {
                currentSettings = settingsResult.data.logs;
                globalSettingsRef.current = currentSettings;
                setGlobalSettings(currentSettings);
                setFrequentMeals(currentSettings?.frequentMeals || []);
                if (currentSettings?.theme) setThemeState(currentSettings.theme);
                if (currentSettings?.liteMode !== undefined) setLiteModeState(currentSettings.liteMode);
            }
        }

        loadData(currentSettings);
    }, [session, isInitialized, loadData]);

    // Load Data on Date Change or Session change
    useEffect(() => {
        initGlobal();
    }, [selectedDate, session, initGlobal]);

    // Real-time Subscription for Cross-Device Sync
    useEffect(() => {
        if (!session || !isInitialized) return;

        const dateKey = formatDateKey(selectedDate);

        const channel = supabase
            .channel('db_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'daily_logs',
                    filter: `user_id=eq.${session.user.id}`
                },
                (payload) => {
                    const newData = payload.new as any;
                    // Check if the change is for the current selected date
                    // and if it was updated AFTER our last known update
                    if (newData && newData.date === dateKey && newData.updated_at !== lastUpdateFromSelfRef.current) {
                        console.log('Detected external change on current day, syncing...');
                        loadData(globalSettingsRef.current, { silent: true });
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_sync',
                    filter: `user_id=eq.${session.user.id}`
                },
                (payload) => {
                    const newSync = payload.new as any;
                    if (newSync && newSync.updated_at !== lastUpdateFromSelfRef.current) {
                        console.log('Detected external change on settings, syncing...');
                        if (newSync.logs) {
                            const settings = newSync.logs;
                            globalSettingsRef.current = settings;
                            setGlobalSettings(settings);
                            setFrequentMeals(settings.frequentMeals || []);
                            if (settings.theme) setThemeState(settings.theme);
                            if (settings.liteMode !== undefined) setLiteModeState(settings.liteMode);
                            loadData(settings, { silent: true });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, isInitialized, selectedDate, loadData]);


    // Save Data on Changes (Debounced)
    useEffect(() => {
        if (!isInitialized || !session) return;

        const saveData = async () => {
            const dateKey = formatDateKey(selectedDate);

            // CRITICAL: Prevent saving if the currently loaded data doesn't match the selected date
            // This prevents overwriting history with current data when switching days rapidly
            if (loadedDateRef.current !== dateKey) return;

            const uncompleted = todoList.filter(t => !t.completed);
            const completed = todoList.filter(t => t.completed);

            // Sync uncompleted to global settings if they changed
            const currentGlobalTodos = globalSettingsRef.current?.todoList || [];
            if (JSON.stringify(currentGlobalTodos) !== JSON.stringify(uncompleted)) {
                syncGlobalSettings({ todoList: uncompleted });
            }

            const dataToSave: {
                mealCount: number;
                meals: Meal[];
                supplements: Supplement[];
                waterIntake: number;
                waterTarget: number;
                dailyTargets: Macros;
                cheatMealsPerWeek: number;
                coachInstructions: string;
                coachEquivalencies: string;
                habits: Habit[];
                todoList: TodoItem[];
                todoCategories: TodoCategory[];
                fruitIntake: FruitIntake;
                cheatTimestamp?: string | null;
            } = {
                mealCount: mealCount,
                meals: meals,
                supplements: supplements,
                waterIntake: waterIntake,
                waterTarget: waterTarget,
                dailyTargets: dailyTargets,
                cheatMealsPerWeek: cheatMealsPerWeek,
                coachInstructions: coachInstructions,
                coachEquivalencies: coachEquivalencies,
                habits: habits,
                todoList: completed, // Only save completed tasks to daily log
                todoCategories: todoCategories,
                fruitIntake: fruitIntake,
            };

            const isCheatDayMatch = lastCheatTimestamp && new Date(lastCheatTimestamp).toDateString() === selectedDate.toDateString();
            if (isCheatDayMatch) {
                dataToSave.cheatTimestamp = lastCheatTimestamp;
            }

            const now = new Date().toISOString();
            try {
                const { error } = await supabase
                    .from('daily_logs')
                    .upsert({
                        user_id: session.user.id,
                        date: dateKey,
                        data: dataToSave,
                        updated_at: now
                    });

                if (error) {
                    console.error('Error saving data:', error);
                    throw error;
                }

                // Update our local safety ref so we don't trigger a re-sync on our own change
                lastUpdateFromSelfRef.current = now;
            } catch (err) {
                console.error('Unexpected error saving data:', err);
                toast.error('Error al guardar cambios');
            }
        };

        const timeoutId = setTimeout(saveData, 1000);
        return () => {
            clearTimeout(timeoutId);
            saveData(); // Force save on unmount/dep change
        };
    }, [meals, supplements, habits, todoList, todoCategories, mealCount, selectedDate, isInitialized, waterIntake, dailyTargets, waterTarget, lastCheatTimestamp, cheatMealsPerWeek, coachInstructions, coachEquivalencies, session, fruitIntake, frequentMeals, syncGlobalSettings]);

    // Handlers
    const setMealCount = (count: number) => {
        if (count < 1 || count > 8) return;
        setMealCountState(count);
        setMeals(prev => {
            if (prev.length === count) return prev;
            if (prev.length < count) {
                // Extending: Keep existing, add new ones
                const existingCount = prev.length;
                const additionalCount = count - existingCount;
                const newMeals = Array.from({ length: additionalCount }, (_, i) => ({
                    id: existingCount + i + 1,
                    name: `Comida ${existingCount + i + 1} `,
                    targetMacros: { protein: 0, carbs: 0, fats: 0 },
                    completed: false
                }));
                return [...prev, ...newMeals];
            } else {
                // Reducing: Just slice (user loses excess but keeps the rest)
                return prev.slice(0, count);
            }
        });
    };

    const updateMealMacros = (mealId: number, macros: Macros) => {
        setMeals(prev => prev.map(m => m.id === mealId ? { ...m, targetMacros: macros } : m));
    };

    const updateMealName = (mealId: number, name: string) => {
        setMeals(prev => prev.map(m => m.id === mealId ? { ...m, name } : m));
    };

    const toggleMealCompletion = (mealId: number) => {
        setMeals(prev => prev.map(m => m.id === mealId ? {
            ...m,
            completed: !m.completed,
            skipped: false,
            completedAt: !m.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        } : m));
    };

    const toggleMealSkipped = (mealId: number) => {
        setMeals(prev => prev.map(m => m.id === mealId ? {
            ...m,
            skipped: !m.skipped,
            completed: false
        } : m));
    };

    const logAIAssistedMeal = (mealId: number, macros: Macros) => {
        setMeals(prev => prev.map(m => m.id === mealId ? {
            ...m,
            targetMacros: macros,
            completed: true,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : m));
    };

    const toggleSupplement = (id: string) => {
        setSupplements(prev => prev.map(s => s.id === id ? { ...s, taken: !s.taken } : s));
    };

    const registerCheatMeal = () => {
        const timestamp = new Date().toISOString();
        setLastCheatTimestamp(timestamp);
    };

    const undoCheatMeal = () => {
        setLastCheatTimestamp(null);
    };

    const addSupplement = (supplement: Omit<Supplement, 'id' | 'taken'>) => {
        const newSupplement: Supplement = {
            ...supplement,
            id: Date.now().toString(),
            taken: false
        };
        const newList = [...supplements, newSupplement];
        setSupplements(newList);
        syncGlobalSettings({ supplements: newList.map(s => ({ ...s, taken: false })) });
    };

    const updateSupplement = (id: string, updates: Partial<Supplement>) => {
        const newList = supplements.map(s => s.id === id ? { ...s, ...updates } : s);
        setSupplements(newList);
        if (updates.name || updates.timing || updates.type) {
            syncGlobalSettings({ supplements: newList.map(s => ({ ...s, taken: false })) });
        }
    };

    const deleteSupplement = (id: string) => {
        const newList = supplements.filter(s => s.id !== id);
        setSupplements(newList);
        syncGlobalSettings({ supplements: newList.map(s => ({ ...s, taken: false })) });
    };

    const resetDay = () => {
        setMeals(prev => prev.map(m => ({ ...m, completed: false, completedAt: undefined })));
        setSupplements(prev => prev.map(s => ({ ...s, taken: false })));
        setWaterIntake(0);
    };

    const setDailyTargets = (targets: Macros) => {
        setDailyTargetsState(targets);
    };

    const addHabit = (habit: Omit<Habit, 'id' | 'completed' | 'streak'>) => {
        const newHabit: Habit = {
            ...habit,
            id: crypto.randomUUID(),
            completed: false,
            streak: 0,
            value: habit.type === 'numeric' ? 0 : ''
        };
        const newList = [...habits, newHabit];
        setHabits(newList);
        syncGlobalSettings({ habits: newList.map(h => ({ ...h, completed: false, value: h.type === 'numeric' ? 0 : '', streak: 0 })) });
    };

    const toggleHabit = (id: string) => {
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                const newCompleted = !h.completed;
                const newStreak = newCompleted ? (h.streak || 0) + 1 : Math.max(0, (h.streak || 0) - 1);
                let newValue = h.value;
                if (newCompleted) {
                    if (h.type === 'numeric') newValue = h.target;
                    else if (h.type === 'time' && !h.value) newValue = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                    if (h.type === 'numeric') newValue = 0;
                    else if (h.type === 'time') newValue = '';
                }
                return { ...h, completed: newCompleted, streak: newStreak, value: newValue };
            }
            return h;
        }));
    };

    const updateHabitValue = (id: string, value: number | string) => {
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                let isCompleted = false;
                if (h.type === 'numeric') {
                    isCompleted = Number(value) >= (h.target || 0);
                } else if (h.type === 'time') {
                    isCompleted = !!value;
                }
                let newStreak = h.streak;
                if (isCompleted && !h.completed) newStreak += 1;
                if (!isCompleted && h.completed) newStreak = Math.max(0, newStreak - 1);
                return { ...h, value, completed: isCompleted, streak: newStreak };
            }
            return h;
        }));
    };

    const deleteHabit = (id: string) => {
        const newList = habits.filter(h => h.id !== id);
        setHabits(newList);
        syncGlobalSettings({ habits: newList.map(h => ({ ...h, completed: false, value: h.type === 'numeric' ? 0 : '', streak: 0 })) });
    };

    const restoreHabit = (habit: Habit, index: number) => {
        setHabits(prev => {
            const newList = [...prev];
            const safeIndex = Math.min(index, newList.length);
            newList.splice(safeIndex, 0, habit);
            syncGlobalSettings({ habits: newList.map(h => ({ ...h, completed: false, value: h.type === 'numeric' ? 0 : '', streak: 0 })) });
            return newList;
        });
    };

    const updateHabit = (id: string, updates: Partial<Habit>) => {
        const newList = habits.map(h => h.id === id ? { ...h, ...updates } : h);
        setHabits(newList);
        syncGlobalSettings({
            habits: newList.map(h => ({
                ...h,
                completed: false,
                value: h.type === 'numeric' ? 0 : '',
                streak: 0
            }))
        });
    };

    const reorderHabits = (newOrder: Habit[]) => {
        setHabits(newOrder);
        // Sync the new order to global settings
        // We strip daily data for the sync template, but Key: The ORDER is preserved in the array
        syncGlobalSettings({
            habits: newOrder.map(h => ({
                ...h,
                completed: false,
                value: h.type === 'numeric' ? 0 : '',
                streak: 0
            }))
        });
    };

    const updateWater = (amount: number) => {
        setWaterIntake(prev => Math.max(0, prev + amount));
    };

    const setWaterTarget = (target: number) => {
        setWaterTargetState(target);
        syncGlobalSettings({ waterTarget: target });
    };

    const setCheatMealsPerWeek = (count: number) => setCheatMealsPerWeekState(count);
    const setCoachInstructions = (instructions: string) => setCoachInstructionsState(instructions);
    const setCoachEquivalencies = (eq: string) => setCoachEquivalenciesState(eq);

    const addTodoCategory = (category: Omit<TodoCategory, 'id'>) => {
        const newCategory: TodoCategory = { ...category, id: crypto.randomUUID() };
        const newList = [...todoCategories, newCategory];
        setTodoCategories(newList);
        syncGlobalSettings({ todoCategories: newList });
    };

    const deleteTodoCategory = (id: string) => {
        const newList = todoCategories.filter(c => c.id !== id);
        setTodoCategories(newList);
        syncGlobalSettings({ todoCategories: newList });
    };

    const addTodo = (text: string, category: string, priority: boolean = false) => {
        setTodoList(prev => [...prev, { id: Date.now().toString(), text, category, completed: false, priority }]);
    };

    const toggleTodo = (id: string) => {
        setTodoList(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id: string) => {
        setTodoList(prev => prev.filter(t => t.id !== id));
    };

    const incrementFruit = (fruit: keyof FruitIntake) => {
        setFruitIntake((prev: FruitIntake) => ({
            ...prev,
            [fruit]: prev[fruit] + 1
        }));
    };

    const decrementFruit = (fruit: keyof FruitIntake) => {
        setFruitIntake((prev: FruitIntake) => ({
            ...prev,
            [fruit]: Math.max(0, prev[fruit] - 1)
        }));
    };

    const addFrequentMeal = (meal: Omit<FrequentMeal, 'id'>) => {
        const newMeal: FrequentMeal = { ...meal, id: crypto.randomUUID() };
        const newList = [...frequentMeals, newMeal];
        setFrequentMeals(newList);
        syncGlobalSettings({ frequentMeals: newList });
    };

    const deleteFrequentMeal = (id: string) => {
        const newList = frequentMeals.filter(m => m.id !== id);
        setFrequentMeals(newList);
        syncGlobalSettings({ frequentMeals: newList });
    };

    const updateFrequentMeal = (id: string, updates: Partial<FrequentMeal>) => {
        const newList = frequentMeals.map(m => m.id === id ? { ...m, ...updates } : m);
        setFrequentMeals(newList);
        syncGlobalSettings({ frequentMeals: newList });
    };

    const applyFrequentMeal = (mealId: number, frequentMealId: string) => {
        const freq = frequentMeals.find(m => m.id === frequentMealId);
        if (!freq) return;
        setMeals(prev => prev.map(m => m.id === mealId ? { ...m, targetMacros: freq.macros } : m));
        toast.success(`Cargado: ${freq.name}`);
    };

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
        syncGlobalSettings({ theme: newTheme });
    };

    const setLiteMode = (lite: boolean) => {
        setLiteModeState(lite);
        syncGlobalSettings({ liteMode: lite });
    };

    const getWeeklyHistory = async (days: number = 7): Promise<WeeklyHistoryData[]> => {
        if (!session) return [];
        try {
            const today = new Date();
            const startDate = new Date();
            startDate.setDate(today.getDate() - (days - 1));

            const { data, error } = await supabase
                .from('daily_logs')
                .select('date, data')
                .eq('user_id', session.user.id)
                .gte('date', formatDateKey(startDate))
                .lte('date', formatDateKey(today))
                .order('date', { ascending: true });

            if (error) throw error;

            const historyMap = new Map();
            data?.forEach(log => {
                const dayData = log.data;
                const totalCalories = (dayData.meals || []).reduce((acc: number, meal: Meal) => {
                    if (!meal.completed) return acc;
                    return acc + (meal.targetMacros.protein * 4) + (meal.targetMacros.carbs * 4) + (meal.targetMacros.fats * 9);
                }, 0);

                const totalProtein = (dayData.meals || []).reduce((acc: number, m: Meal) => m.completed ? acc + m.targetMacros.protein : acc, 0) +
                    (dayData.fruitIntake ? (dayData.fruitIntake.apples * FRUIT_MACROS.apples.protein + dayData.fruitIntake.oranges * FRUIT_MACROS.oranges.protein + dayData.fruitIntake.bananas * FRUIT_MACROS.bananas.protein) : 0);
                const totalCarbs = (dayData.meals || []).reduce((acc: number, m: Meal) => m.completed ? acc + m.targetMacros.carbs : acc, 0) +
                    (dayData.fruitIntake ? (dayData.fruitIntake.apples * FRUIT_MACROS.apples.carbs + dayData.fruitIntake.oranges * FRUIT_MACROS.oranges.carbs + dayData.fruitIntake.bananas * FRUIT_MACROS.bananas.carbs) : 0);
                const totalFats = (dayData.meals || []).reduce((acc: number, m: Meal) => m.completed ? acc + m.targetMacros.fats : acc, 0) +
                    (dayData.fruitIntake ? (dayData.fruitIntake.apples * FRUIT_MACROS.apples.fats + dayData.fruitIntake.oranges * FRUIT_MACROS.oranges.fats + dayData.fruitIntake.bananas * FRUIT_MACROS.bananas.fats) : 0);

                const supplements = dayData.supplements || [];
                const supplementsTaken = supplements.filter((s: any) => s.taken).length;

                const weightHabit = (dayData.habits || []).find((h: Habit) =>
                    h.type === 'numeric' &&
                    (h.name.toLowerCase().includes('peso') || h.unit?.toLowerCase() === 'kg' || h.unit?.toLowerCase() === 'lbs')
                );
                const currentWeight = weightHabit && weightHabit.value ? Number(weightHabit.value) : undefined;

                historyMap.set(log.date, {
                    date: log.date,
                    calories: totalCalories,
                    protein: totalProtein,
                    carbs: totalCarbs,
                    fats: totalFats,
                    water: dayData.waterIntake || 0,
                    mealsCompleted: (dayData.meals || []).filter((m: Meal) => m.completed).length,
                    totalMeals: (dayData.meals || []).filter((m: Meal) => !m.skipped).length || dayData.mealCount || 4,
                    supplementsTaken,
                    totalSupplements: supplements.length,
                    weight: currentWeight
                });
            });

            const result: WeeklyHistoryData[] = [];
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(today.getDate() - (days - 1 - i));
                const key = formatDateKey(d);
                const name = d.toLocaleDateString('es-ES', { weekday: 'short' });

                if (historyMap.has(key)) {
                    result.push({ ...historyMap.get(key), name });
                } else {
                    result.push({
                        date: key,
                        name,
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fats: 0,
                        water: 0,
                        mealsCompleted: 0,
                        totalMeals: 4,
                        supplementsTaken: 0,
                        totalSupplements: 0
                    });
                }
            }
            return result;
        } catch (err) {
            console.error("Error fetching history:", err);
            return [];
        }
    };

    const getHabitHistory = async (days: number) => {
        if (!session) return [];
        try {
            const today = new Date();
            const startDate = new Date();
            startDate.setDate(today.getDate() - (days - 1));

            const { data, error } = await supabase
                .from('daily_logs')
                .select('date, data')
                .eq('user_id', session.user.id)
                .gte('date', formatDateKey(startDate))
                .lte('date', formatDateKey(today))
                .order('date', { ascending: true });

            if (error) throw error;

            return (data || []).map(log => ({
                date: log.date,
                habits: log.data.habits || []
            }));
        } catch (err) {
            console.error("Error fetching habit history:", err);
            return [];
        }
    };

    const getMonthlyHabitStats = async (baseDate: Date) => {
        if (!session) return [];
        try {
            const year = baseDate.getFullYear();
            const month = baseDate.getMonth();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);

            const { data, error } = await supabase
                .from('daily_logs')
                .select('date, data')
                .eq('user_id', session.user.id)
                .gte('date', formatDateKey(startOfMonth))
                .lte('date', formatDateKey(endOfMonth));

            if (error) throw error;

            return (data || []).map(log => ({
                date: log.date,
                habits: log.data.habits || []
            }));
        } catch (err) {
            console.error("Error fetching monthly stats:", err);
            return [];
        }
    };

    const getHabitsForDateRange = async (startDate: Date, endDate: Date) => {
        if (!session) return [];
        try {
            const { data, error } = await supabase
                .from('daily_logs')
                .select('date, data')
                .eq('user_id', session.user.id)
                .gte('date', formatDateKey(startDate))
                .lte('date', formatDateKey(endDate));

            if (error) throw error;

            return (data || []).map(log => ({
                date: log.date,
                habits: log.data.habits || []
            }));
        } catch (err) {
            console.error("Error fetching habits for date range:", err);
            return [];
        }
    };

    const updateHabitsForDate = async (date: Date, updatedHabits: Habit[]) => {
        if (!session) return;

        const dateKey = formatDateKey(date);

        if (dateKey === formatDateKey(selectedDate)) {
            setHabits(updatedHabits);
        }

        try {
            const { data: existingLog } = await supabase
                .from('daily_logs')
                .select('data')
                .eq('user_id', session.user.id)
                .eq('date', dateKey)
                .maybeSingle();

            const dataToSave = existingLog?.data ? { ...existingLog.data, habits: updatedHabits } : { habits: updatedHabits };

            const { error } = await supabase
                .from('daily_logs')
                .upsert({
                    user_id: session.user.id,
                    date: dateKey,
                    data: dataToSave,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (err) {
            console.error('Error updating habits for date:', err);
            toast.error('Error al guardar cambios históricos');
        }
    };

    return (
        <UserContext.Provider value={{
            selectedDate,
            setSelectedDate,
            dailyTargets,
            setDailyTargets,
            fruitIntake,
            incrementFruit,
            decrementFruit,
            mealCount,
            meals,
            supplements,
            waterIntake,
            waterTarget,
            setMealCount,
            updateMealMacros,
            updateMealName,
            toggleMealCompletion,
            toggleMealSkipped,
            logAIAssistedMeal,
            registerCheatMeal,
            undoCheatMeal,
            lastCheatTimestamp,
            cheatMealsPerWeek,
            setCheatMealsPerWeek,
            coachInstructions,
            setCoachInstructions,
            coachEquivalencies,
            setCoachEquivalencies,
            habits,
            addHabit,
            toggleHabit,
            deleteHabit,
            restoreHabit,
            updateHabit,
            reorderHabits,
            updateHabitValue,
            todoList,
            todoCategories,
            addTodo,
            addTodoCategory,
            deleteTodoCategory,
            toggleTodo,
            deleteTodo,
            toggleSupplement,
            addSupplement,
            updateSupplement,
            deleteSupplement,
            updateWater,
            setWaterTarget,
            resetDay,
            isLoading,
            getWeeklyHistory,
            session,
            loadingSession,
            logout: async () => { await supabase.auth.signOut(); },
            deleteAccount: async () => {
                if (!session) return;
                try {
                    const results = await Promise.all([
                        supabase.from('daily_logs').delete().eq('user_id', session.user.id),
                        supabase.from('user_sync').delete().eq('user_id', session.user.id)
                    ]);
                    const error = results.find(r => r.error);
                    if (error) throw error.error;
                    await supabase.auth.signOut();
                    toast.success('Cuenta eliminada correctamente');
                } catch (err) {
                    console.error('Error deleting account:', err);
                    toast.error('Error al eliminar cuenta');
                }
            },
            getMonthlyHabitStats,
            getHabitsForDateRange,
            getHabitHistory,
            globalSettings,
            frequentMeals,
            addFrequentMeal,
            deleteFrequentMeal,
            updateFrequentMeal,
            applyFrequentMeal,
            theme,
            setTheme,
            liteMode,
            setLiteMode,
            updateHabitsForDate
        }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
