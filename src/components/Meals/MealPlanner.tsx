import React from 'react';
import { useUser, FRUIT_MACROS } from '../../store/userStore';
import { Check, Plus, Minus, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MealPlanner: React.FC = () => {
    const {
        mealCount, setMealCount, meals, toggleMealCompletion, toggleMealSkipped,
        updateMealMacros, updateMealName, dailyTargets,
        fruitIntake, incrementFruit, decrementFruit
    } = useUser();
    const isLight = useUser().theme === 'light';
    const [isEditingPlan, setIsEditingPlan] = React.useState(false);

    const handleMacroChange = (mealId: number, key: 'protein' | 'carbs' | 'fats', value: string) => {
        const numValue = parseInt(value) || 0;
        const meal = meals.find(m => m.id === mealId);
        if (meal) updateMealMacros(mealId, { ...meal.targetMacros, [key]: numValue });
    };

    const getRemainingMacros = () => {
        const assigned = meals.filter(m => !m.skipped).reduce(
            (acc, m) => ({ protein: acc.protein + m.targetMacros.protein, carbs: acc.carbs + m.targetMacros.carbs, fats: acc.fats + m.targetMacros.fats }),
            { protein: 0, carbs: 0, fats: 0 }
        );
        const fruit = {
            protein: fruitIntake.apples * FRUIT_MACROS.apples.protein + fruitIntake.oranges * FRUIT_MACROS.oranges.protein + fruitIntake.bananas * FRUIT_MACROS.bananas.protein,
            carbs: fruitIntake.apples * FRUIT_MACROS.apples.carbs + fruitIntake.oranges * FRUIT_MACROS.oranges.carbs + fruitIntake.bananas * FRUIT_MACROS.bananas.carbs,
            fats: fruitIntake.apples * FRUIT_MACROS.apples.fats + fruitIntake.oranges * FRUIT_MACROS.oranges.fats + fruitIntake.bananas * FRUIT_MACROS.bananas.fats,
        };
        return {
            protein: Math.max(0, dailyTargets.protein - assigned.protein - fruit.protein),
            carbs: Math.max(0, dailyTargets.carbs - assigned.carbs - fruit.carbs),
            fats: Math.max(0, dailyTargets.fats - assigned.fats - fruit.fats),
        };
    };

    const getSuggested = (mealId: number) => {
        const empty = meals.filter(m => !m.completed && !m.skipped && m.targetMacros.protein === 0 && m.targetMacros.carbs === 0 && m.targetMacros.fats === 0);
        const rem = getRemainingMacros();
        if (!empty.find(m => m.id === mealId)) return null;
        return { protein: Math.round(rem.protein / empty.length), carbs: Math.round(rem.carbs / empty.length), fats: Math.round(rem.fats / empty.length) };
    };

    const macroFields = [
        { key: 'protein' as const, label: 'P', color: isLight ? 'text-purple-700' : 'text-purple-400', border: 'focus:border-purple-500/50' },
        { key: 'carbs' as const, label: 'C', color: isLight ? 'text-blue-700' : 'text-blue-400', border: 'focus:border-blue-500/50' },
        { key: 'fats' as const, label: 'G', color: isLight ? 'text-emerald-700' : 'text-emerald-400', border: 'focus:border-emerald-500/50' },
    ];

    return (
        <div className="bg-card border border-border rounded-2xl p-5 pb-7 shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-display font-bold text-text-muted uppercase tracking-widest">Comidas del Día</h2>
                <div className="flex items-center gap-2">
                    {isEditingPlan && (
                        <select
                            value={mealCount}
                            onChange={(e) => setMealCount(Number(e.target.value))}
                            className="appearance-none bg-background border border-border text-text-main text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary/50 cursor-pointer"
                        >
                            {[3, 4, 5, 6].map(n => <option key={n} value={n}>{n} comidas</option>)}
                        </select>
                    )}
                    <button
                        onClick={() => setIsEditingPlan(!isEditingPlan)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${isEditingPlan ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-transparent border-transparent text-text-muted hover:text-text-main hover:bg-white/5'}`}
                    >
                        {isEditingPlan ? 'Listo' : 'Editar Plan'}
                    </button>
                </div>
            </div>

            {/* Horizontal meal grid */}
            <div className={`grid gap-3 flex-1`} style={{ gridTemplateColumns: `repeat(${mealCount}, minmax(0, 1fr))` }}>
                {meals.map((meal) => {
                    const suggested = getSuggested(meal.id);
                    return (
                        <div
                            key={meal.id}
                            className={`rounded-xl border px-3 py-5 flex flex-col gap-4 transition-all duration-300 min-h-[260px] h-full ${
                                meal.completed ? 'bg-green-500/5 border-green-500/20' :
                                meal.skipped ? 'opacity-50 border-border/40 bg-card/40' :
                                isLight ? 'bg-black/[0.03] border-border hover:border-black/15' : 'bg-background/60 border-border hover:border-white/15'
                            }`}
                        >
                            {/* Meal name + toggle */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleMealCompletion(meal.id)}
                                    className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border transition-all ${
                                        meal.completed ? 'bg-green-500 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'border-text-muted/40 hover:border-primary text-transparent'
                                    }`}
                                >
                                    <Check size={11} strokeWidth={3} />
                                </button>
                                {isEditingPlan ? (
                                    <input
                                        type="text"
                                        value={meal.name}
                                        onChange={(e) => updateMealName(meal.id, e.target.value)}
                                        className="bg-transparent border-b border-text-muted/20 text-xs font-semibold text-text-main focus:outline-none focus:border-primary w-full"
                                    />
                                ) : (
                                    <span className={`text-xs font-semibold truncate ${meal.completed || meal.skipped ? 'text-text-muted/50 line-through' : 'text-text-main'}`}>
                                        {meal.name}
                                    </span>
                                )}
                                <button
                                    onClick={() => toggleMealSkipped(meal.id)}
                                    title={meal.skipped ? 'Reactivar' : 'Saltear'}
                                    className={`ml-auto flex-shrink-0 p-1 rounded-lg transition-all ${meal.skipped ? 'text-red-400 bg-red-500/10' : 'text-text-muted/30 hover:text-orange-400 hover:bg-orange-500/10'}`}
                                >
                                    <ChevronsRight size={13} />
                                </button>
                            </div>

                            {/* Macro inputs */}
                            <div className="space-y-2 flex-1 justify-center flex flex-col">
                                {macroFields.map((f) => (
                                    <div key={f.key} className="flex items-center gap-1.5">
                                        <span className={`text-[10px] font-black w-3 flex-shrink-0 ${f.color}`}>{f.label}</span>
                                        <input
                                            type="number"
                                            value={meal.targetMacros[f.key] || ''}
                                            onChange={(e) => handleMacroChange(meal.id, f.key, e.target.value)}
                                            placeholder={suggested ? String(suggested[f.key]) : '0'}
                                            disabled={meal.skipped}
                                            className={`w-full ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} border rounded-lg py-2.5 px-2 text-xs font-semibold text-text-main focus:outline-none ${isLight ? 'focus:bg-black/8' : 'focus:bg-white/8'} ${f.border} placeholder:text-text-muted/30 transition-colors`}
                                        />
                                        <span className="text-[10px] text-text-muted/50 flex-shrink-0">g</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Frutas */}
            <div className="mt-4 pt-3 border-t border-border">
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'apples' as const, name: 'Manzana', icon: '🍎', color: isLight ? 'bg-red-500/10 text-red-700 border-red-500/20' : 'bg-red-500/5 text-red-400 border-red-500/10' },
                        { id: 'oranges' as const, name: 'Naranja', icon: '🍊', color: isLight ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' : 'bg-orange-500/5 text-orange-400 border-orange-500/10' },
                        { id: 'bananas' as const, name: 'Banana', icon: '🍌', color: isLight ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' : 'bg-yellow-500/5 text-yellow-500 border-yellow-500/10' },
                    ].map((fruit) => (
                        <div key={fruit.id} className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl border transition-all ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'} ${fruit.color}`}>
                            <div className="flex items-center gap-1.5">
                                <span className="text-base">{fruit.icon}</span>
                                <span className="text-[9px] font-extrabold uppercase tracking-tight">{fruit.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => decrementFruit(fruit.id)} className={`w-5 h-5 rounded-lg ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'} flex items-center justify-center active:scale-90 transition-all`}>
                                    <Minus size={10} />
                                </button>
                                <span className="text-sm font-black min-w-[1.2ch] text-center">{fruitIntake[fruit.id]}</span>
                                <button onClick={() => incrementFruit(fruit.id)} className={`w-5 h-5 rounded-lg ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'} flex items-center justify-center active:scale-90 transition-all`}>
                                    <Plus size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MealPlanner;
