import React from 'react';
import { useUser, FRUIT_MACROS } from '../../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, ChevronDown, Plus, Minus, Bookmark, Save, Trash2, Edit2, Slash } from 'lucide-react';

const MealPlanner: React.FC = () => {
    const {
        mealCount, setMealCount, meals, toggleMealCompletion, toggleMealSkipped,
        updateMealMacros, updateMealName, dailyTargets,
        fruitIntake, incrementFruit, decrementFruit,
        frequentMeals, addFrequentMeal, applyFrequentMeal, deleteFrequentMeal, updateFrequentMeal
    } = useUser();
    const isLight = useUser().theme === 'light';
    const [expandedMeal, setExpandedMeal] = React.useState<number | null>(null);
    const [isEditingPlan, setIsEditingPlan] = React.useState(false);
    const [editingFreqId, setEditingFreqId] = React.useState<string | null>(null);
    const [tempFreqName, setTempFreqName] = React.useState("");

    const handleMacroChange = (mealId: number, key: 'protein' | 'carbs' | 'fats', value: string) => {
        const numValue = parseInt(value) || 0;
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
            updateMealMacros(mealId, { ...meal.targetMacros, [key]: numValue });
        }
    };

    // Calculate remaining macros to distribute
    const getRemainingMacros = () => {
        const assignedMacros = meals
            .filter(meal => !meal.skipped)
            .reduce((acc, meal) => ({
                protein: acc.protein + meal.targetMacros.protein,
                carbs: acc.carbs + meal.targetMacros.carbs,
                fats: acc.fats + meal.targetMacros.fats
            }), { protein: 0, carbs: 0, fats: 0 });

        const fruitMacros = {
            protein:
                fruitIntake.apples * FRUIT_MACROS.apples.protein +
                fruitIntake.oranges * FRUIT_MACROS.oranges.protein +
                fruitIntake.bananas * FRUIT_MACROS.bananas.protein,
            carbs:
                fruitIntake.apples * FRUIT_MACROS.apples.carbs +
                fruitIntake.oranges * FRUIT_MACROS.oranges.carbs +
                fruitIntake.bananas * FRUIT_MACROS.bananas.carbs,
            fats:
                fruitIntake.apples * FRUIT_MACROS.apples.fats +
                fruitIntake.oranges * FRUIT_MACROS.oranges.fats +
                fruitIntake.bananas * FRUIT_MACROS.bananas.fats,
        };

        return {
            protein: Math.max(0, dailyTargets.protein - assignedMacros.protein - fruitMacros.protein),
            carbs: Math.max(0, dailyTargets.carbs - assignedMacros.carbs - fruitMacros.carbs),
            fats: Math.max(0, dailyTargets.fats - assignedMacros.fats - fruitMacros.fats)
        };
    };

    // Calculate suggested macros for incomplete meals
    const getSuggestedMacros = (mealId: number) => {
        const incompleteMeals = meals.filter(m => !m.completed && !m.skipped && m.targetMacros.protein === 0 && m.targetMacros.carbs === 0 && m.targetMacros.fats === 0);
        const remaining = getRemainingMacros();

        if (incompleteMeals.length === 0 || !incompleteMeals.find(m => m.id === mealId) || meals.find(m => m.id === mealId)?.skipped) {
            return null;
        }

        return {
            protein: Math.round(remaining.protein / incompleteMeals.length),
            carbs: Math.round(remaining.carbs / incompleteMeals.length),
            fats: Math.round(remaining.fats / incompleteMeals.length)
        };
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col gap-6 h-full">
                {/* Header / Config - Only visible when editing or minimal header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-text-main">
                        Comidas del Día
                    </h2>
                    <button
                        onClick={() => setIsEditingPlan(!isEditingPlan)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${isEditingPlan
                            ? 'bg-primary/10 border-primary/50 text-primary'
                            : 'bg-transparent border-transparent text-text-muted hover:text-text-main hover:bg-white/5'}`}
                    >
                        {isEditingPlan ? 'Listo' : 'Editar Plan'}
                    </button>
                </div>

                {isEditingPlan && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-card border border-border rounded-2xl p-4 shadow-xl overflow-hidden mb-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted font-medium">Cantidad de Comidas</span>
                            <div className="relative">
                                <select
                                    value={mealCount}
                                    onChange={(e) => setMealCount(Number(e.target.value))}
                                    className="appearance-none bg-background border border-border text-text-main text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary/50 cursor-pointer hover:bg-white/5 transition-colors"
                                >
                                    {[3, 4, 5, 6].map(num => (
                                        <option key={num} value={num}>{num} Comidas</option>
                                    ))}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="space-y-4">
                    {meals.map((meal) => {
                        const suggestedMacros = getSuggestedMacros(meal.id);
                        const hasAssignedMacros = meal.targetMacros.protein > 0 || meal.targetMacros.carbs > 0 || meal.targetMacros.fats > 0;

                        return (
                            <div
                                key={meal.id}
                                className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${meal.completed
                                    ? 'bg-secondary/10 border-green-500/20'
                                    : meal.skipped
                                        ? 'bg-card/50 border-border/50 opacity-60'
                                        : 'bg-card border-border hover:border-white/15'
                                    }`}
                            >
                                <div
                                    className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${meal.completed ? 'bg-green-500' : meal.skipped ? 'bg-red-500/20' : expandedMeal === meal.id ? 'bg-purple-500' : 'bg-transparent'
                                        }`}
                                />

                                <div className="flex items-center p-4 pl-5">
                                    <button
                                        onClick={() => toggleMealCompletion(meal.id)}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-5 transition-all border ${meal.completed
                                            ? 'bg-secondary border-secondary text-white scale-110 shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)]'
                                            : 'border-text-muted/40 hover:border-primary text-transparent'
                                            }`}
                                    >
                                        <Check size={14} strokeWidth={3} />
                                    </button>

                                    <div className="flex-1 cursor-pointer" onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                            {isEditingPlan ? (
                                                <input
                                                    type="text"
                                                    value={meal.name}
                                                    onChange={(e) => updateMealName(meal.id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()} // Prevent expanding
                                                    className="bg-transparent border-b border-text-muted/20 text-base font-semibold tracking-tight text-text-main focus:outline-none focus:border-primary w-full mb-1"
                                                    placeholder="Nombre de comida"
                                                />
                                            ) : (
                                                <h4 className={`text-base font-semibold tracking-tight transition-colors ${meal.completed || meal.skipped ? 'text-text-muted/50 line-through decoration-primary/30' : 'text-text-main'
                                                    }`}>
                                                    {meal.name}
                                                    {meal.skipped && <span className="ml-2 text-[10px] font-bold text-red-400/70 border border-red-400/30 px-1.5 py-0.5 rounded uppercase tracking-wider line-none no-underline inline-block align-middle">Saltada</span>}
                                                </h4>
                                            )}

                                            <div className="flex items-center gap-3">
                                                {meal.completedAt && (
                                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${isLight ? 'text-primary bg-primary/10' : 'text-green-400 bg-green-500/10'}`}>
                                                        <Clock size={10} /> {meal.completedAt}
                                                    </span>
                                                )}
                                                <div className="flex gap-4 text-xs font-medium">
                                                    {hasAssignedMacros ? (
                                                        <>
                                                            <span className={`${meal.completed ? 'text-text-muted/60' : isLight ? 'text-purple-700 font-bold' : 'text-purple-400'}`}>{meal.targetMacros.protein}g P</span>
                                                            <span className={`${meal.completed ? 'text-text-muted/60' : isLight ? 'text-blue-700 font-bold' : 'text-blue-400'}`}>{meal.targetMacros.carbs}g C</span>
                                                            <span className={`${meal.completed ? 'text-text-muted/60' : isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>{meal.targetMacros.fats}g F</span>
                                                        </>
                                                    ) : suggestedMacros ? (
                                                        <>
                                                            <span className="text-purple-400/50">{suggestedMacros.protein}g P</span>
                                                            <span className="text-blue-400/50">{suggestedMacros.carbs}g C</span>
                                                            <span className="text-emerald-400/50">{suggestedMacros.fats}g F</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className={isLight ? "text-purple-700 font-bold" : "text-purple-400"}>0g P</span>
                                                            <span className={isLight ? "text-blue-700 font-bold" : "text-blue-400"}>0g C</span>
                                                            <span className={isLight ? "text-emerald-700 font-bold" : "text-emerald-400"}>0g F</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMealSkipped(meal.id);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${meal.skipped
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'text-text-muted hover:text-red-400 hover:bg-red-500/10'
                                            }`}
                                        title={meal.skipped ? "Reactivar comida" : "Desactivar para hoy"}
                                    >
                                        <Slash size={14} className={meal.skipped ? "rotate-90 transition-transform" : "transition-transform"} />
                                    </button>

                                    <button
                                        onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                                        className={`p-2 rounded-lg transition-colors ${expandedMeal === meal.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-main hover:bg-white/5'
                                            }`}
                                    >
                                        <ChevronDown size={18} className={`transition-transform duration-300 ${expandedMeal === meal.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {expandedMeal === meal.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-border bg-background/30 p-5 pl-16 md:pl-5"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Macro Inputs */}
                                                {[
                                                    { label: 'Proteína', key: 'protein', color: isLight ? 'text-purple-700' : 'text-purple-400', border: 'focus:border-purple-500/50' },
                                                    { label: 'Carbohidratos', key: 'carbs', color: isLight ? 'text-blue-700' : 'text-blue-400', border: 'focus:border-blue-500/50' },
                                                    { label: 'Grasas', key: 'fats', color: isLight ? 'text-emerald-700' : 'text-emerald-400', border: 'focus:border-emerald-500/50' }
                                                ].map((macro) => (
                                                    <div key={macro.key} className="relative group">
                                                        <label className={`absolute -top-2 left-3 text-[10px] font-bold uppercase tracking-wider bg-card px-1 ${macro.color}`}>
                                                            {macro.label}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={meal.targetMacros[macro.key as keyof typeof meal.targetMacros] || ''}
                                                            onChange={(e) => handleMacroChange(meal.id, macro.key as 'protein' | 'carbs' | 'fats', e.target.value)}
                                                            placeholder={suggestedMacros ? suggestedMacros[macro.key as keyof typeof suggestedMacros].toString() : '0'}
                                                            className={`w-full bg-background border border-border rounded-xl py-3 px-4 text-sm font-semibold text-text-main focus:outline-none transition-colors ${macro.border} placeholder:text-text-muted/40`}
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium pointer-events-none">g</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Frequent Meals Section */}
                                            <div className="mt-6 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                                        <Bookmark size={10} /> Comidas Frecuentes
                                                    </span>
                                                    {hasAssignedMacros && (
                                                        <button
                                                            onClick={() => addFrequentMeal({ name: meal.name, macros: meal.targetMacros })}
                                                            className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                                        >
                                                            <Save size={10} /> Guardar actual
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {frequentMeals.length > 0 ? (
                                                        frequentMeals.map((freq) => (
                                                            <div key={freq.id} className="group relative flex items-center gap-2 bg-background hover:bg-white/10 border border-border hover:border-primary/20 px-3 py-1.5 rounded-lg transition-all shadow-sm">
                                                                <button
                                                                    onClick={() => applyFrequentMeal(meal.id, freq.id)}
                                                                    className="flex items-center gap-2 overflow-hidden"
                                                                >
                                                                    {editingFreqId === freq.id ? (
                                                                        <input
                                                                            autoFocus
                                                                            value={tempFreqName}
                                                                            onChange={(e) => setTempFreqName(e.target.value)}
                                                                            onBlur={() => {
                                                                                if (tempFreqName.trim()) {
                                                                                    updateFrequentMeal(freq.id, { name: tempFreqName });
                                                                                }
                                                                                setEditingFreqId(null);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    if (tempFreqName.trim()) {
                                                                                        updateFrequentMeal(freq.id, { name: tempFreqName });
                                                                                    }
                                                                                    setEditingFreqId(null);
                                                                                }
                                                                                if (e.key === 'Escape') setEditingFreqId(null);
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="bg-background border border-primary/50 rounded px-1 text-xs font-semibold text-text-main focus:outline-none min-w-[80px] h-5"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xs font-semibold text-text-muted group-hover:text-text-main whitespace-nowrap">{freq.name}</span>
                                                                    )}
                                                                    <span className="text-[9px] text-text-muted/60 font-mono whitespace-nowrap">
                                                                        {freq.macros.protein}P {freq.macros.carbs}C {freq.macros.fats}G
                                                                    </span>
                                                                </button>

                                                                {isEditingPlan && (
                                                                    <div className="flex items-center gap-1.5 ml-1 border-l border-border pl-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditingFreqId(freq.id);
                                                                                setTempFreqName(freq.name);
                                                                            }}
                                                                            className="text-text-muted hover:text-primary transition-colors"
                                                                        >
                                                                            <Edit2 size={10} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteFrequentMeal(freq.id);
                                                                            }}
                                                                            className="text-red-400/60 hover:text-red-400"
                                                                        >
                                                                            <Trash2 size={10} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-text-muted italic">No hay comidas guardadas</span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    <div className="pt-6 mt-2 border-t border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                Frutas
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                                { id: 'apples' as const, name: 'Manzana', icon: '🍎', color: isLight ? 'bg-red-500/10 text-red-700 border-red-500/20' : 'bg-red-500/5 text-red-400 border-red-500/10' },
                                { id: 'oranges' as const, name: 'Naranja', icon: '🍊', color: isLight ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' : 'bg-orange-500/5 text-orange-400 border-orange-500/10' },
                                { id: 'bananas' as const, name: 'Banana', icon: '🍌', color: isLight ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' : 'bg-yellow-500/5 text-yellow-500 border-yellow-500/10' },
                            ].map((fruit) => (
                                <div
                                    key={fruit.id}
                                    className={`flex items-center justify-between p-2 px-3 rounded-xl border transition-all hover:bg-white/5 ${fruit.color}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{fruit.icon}</span>
                                        <span className="text-[9px] font-extrabold uppercase tracking-tight leading-none">{fruit.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => decrementFruit(fruit.id)}
                                            className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
                                        >
                                            <Minus size={10} />
                                        </button>
                                        <span className="text-sm font-black min-w-[1.2ch] text-center">{fruitIntake[fruit.id]}</span>
                                        <button
                                            onClick={() => incrementFruit(fruit.id)}
                                            className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
                                        >
                                            <Plus size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealPlanner;
