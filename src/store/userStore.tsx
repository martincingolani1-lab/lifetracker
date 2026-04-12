import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type {
    Macros, Meal, Supplement, TodoItem, TodoCategory,
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



const INITIAL_TODO_CATEGORIES: TodoCategory[] = [
    { id: 'personal', label: 'Personal', icon: 'person', color: 'text-blue-400', isDefault: true },
    { id: 'work', label: 'Trabajo', icon: 'work', color: 'text-purple-400', isDefault: true },
    { id: 'health', label: 'Salud', icon: 'favorite', color: 'text-primary', isDefault: true },
    { id: 'other', label: 'Otros', icon: 'more_horiz', color: 'text-gray-400', isDefault: true },
];

const INITIAL_GLOBAL_SETTINGS: GlobalSettings = {
    waterTarget: 3000,
    supplements: INITIAL_SUPPLEMENTS,
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
    const [coachInstructions, setCoachInstructionsState] = useState('');
    const [coachEquivalencies, setCoachEquivalenciesState] = useState('');
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
                setCoachInstructionsState(parsed.coachInstructions || '');
                setCoachEquivalenciesState(parsed.coachEquivalencies || '');
                setFruitIntake(parsed.fruitIntake || INITIAL_FRUIT_INTAKE);

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
                    setCoachInstructionsState(recent.coachInstructions || '');
                    setCoachEquivalenciesState(recent.coachEquivalencies || '');
                    setFruitIntake(INITIAL_FRUIT_INTAKE);
                } else {
                    setMeals(generateMeals(mealCount));
                    setSupplements(baseSupplements.map((s: Supplement) => ({ ...s, taken: false })));

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

        if (!isInitialized) {
            const [settingsResult] = await Promise.all([
                !currentSettings
                    ? supabase.from('user_sync').select('logs').eq('user_id', session.user.id).single()
                    : Promise.resolve({ data: { logs: currentSettings } }),
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

            const dataToSave = {
                mealCount,
                meals,
                supplements,
                waterIntake,
                waterTarget,
                dailyTargets,
                coachInstructions,
                coachEquivalencies,
                todoList: completed,
                todoCategories,
                fruitIntake,
            };

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
    }, [meals, supplements, todoList, todoCategories, mealCount, selectedDate, isInitialized, waterIntake, dailyTargets, waterTarget, coachInstructions, coachEquivalencies, session, fruitIntake, frequentMeals, syncGlobalSettings]);

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

    const updateWater = (amount: number) => {
        setWaterIntake(prev => Math.max(0, prev + amount));
    };

    const setWaterTarget = (target: number) => {
        setWaterTargetState(target);
        syncGlobalSettings({ waterTarget: target });
    };

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
                const meals: Meal[] = dayData.meals || [];
                const allMealsSkipped = meals.length > 0 && meals.every((m: Meal) => m.skipped === true);

                const totalCalories = allMealsSkipped ? 0 : meals.reduce((acc: number, meal: Meal) => {
                    if (!meal.completed) return acc;
                    return acc + (meal.targetMacros.protein * 4) + (meal.targetMacros.carbs * 4) + (meal.targetMacros.fats * 9);
                }, 0);

                const totalProtein = allMealsSkipped ? 0 : meals.reduce((acc: number, m: Meal) => m.completed ? acc + m.targetMacros.protein : acc, 0) +
                    (dayData.fruitIntake ? (dayData.fruitIntake.apples * FRUIT_MACROS.apples.protein + dayData.fruitIntake.oranges * FRUIT_MACROS.oranges.protein + dayData.fruitIntake.bananas * FRUIT_MACROS.bananas.protein) : 0);
                const totalCarbs = allMealsSkipped ? 0 : meals.reduce((acc: number, m: Meal) => m.completed ? acc + m.targetMacros.carbs : acc, 0) +
                    (dayData.fruitIntake ? (dayData.fruitIntake.apples * FRUIT_MACROS.apples.carbs + dayData.fruitIntake.oranges * FRUIT_MACROS.oranges.carbs + dayData.fruitIntake.bananas * FRUIT_MACROS.bananas.carbs) : 0);
                const totalFats = allMealsSkipped ? 0 : meals.reduce((acc: number, m: Meal) => m.completed ? acc + m.targetMacros.fats : acc, 0) +
                    (dayData.fruitIntake ? (dayData.fruitIntake.apples * FRUIT_MACROS.apples.fats + dayData.fruitIntake.oranges * FRUIT_MACROS.oranges.fats + dayData.fruitIntake.bananas * FRUIT_MACROS.bananas.fats) : 0);

                const supplements = dayData.supplements || [];
                const supplementsTaken = supplements.filter((s: any) => s.taken).length;

                historyMap.set(log.date, {
                    date: log.date,
                    calories: totalCalories,
                    protein: totalProtein,
                    carbs: totalCarbs,
                    fats: totalFats,
                    water: dayData.waterIntake || 0,
                    mealsCompleted: meals.filter((m: Meal) => m.completed).length,
                    totalMeals: meals.filter((m: Meal) => !m.skipped).length || dayData.mealCount || 4,
                    supplementsTaken,
                    totalSupplements: supplements.length,
                    nutritionSkipped: allMealsSkipped
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
            coachInstructions,
            setCoachInstructions,
            coachEquivalencies,
            setCoachEquivalencies,
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
