import React, { useState, useRef, useEffect } from 'react';
import { useUser, FRUIT_MACROS } from '../../store/userStore';
import { X, Check } from 'lucide-react';

interface QuickMealSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const QuickMealSheet: React.FC<QuickMealSheetProps> = ({ isOpen, onClose }) => {
    const ctx = useUser();

    const [selectedMealId, setSelectedMealId] = useState<number | null>(null);
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');

    // Drag-to-close refs
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragStartY = useRef(0);
    const isDraggingRef = useRef(false);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    // Reset and auto-select when opened
    useEffect(() => {
        if (isOpen && ctx.meals && ctx.meals.length > 0) {
            const firstIncomplete = ctx.meals.find(m => !m.completed);
            const mealToSelect = firstIncomplete || ctx.meals[0];
            setSelectedMealId(mealToSelect.id);
            setProtein(mealToSelect.targetMacros.protein > 0 ? String(mealToSelect.targetMacros.protein) : '');
            setCarbs(mealToSelect.targetMacros.carbs > 0 ? String(mealToSelect.targetMacros.carbs) : '');
            setFats(mealToSelect.targetMacros.fats > 0 ? String(mealToSelect.targetMacros.fats) : '');
        }
        if (!isOpen) {
            // Reset sheet position
            if (sheetRef.current) {
                sheetRef.current.style.transform = '';
                sheetRef.current.style.transition = '';
            }
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isOpen) return null;

    // Guard: if context data not ready
    const meals = ctx.meals || [];
    const dailyTargets = ctx.dailyTargets || { protein: 0, carbs: 0, fats: 0 };
    const fruitIntake = ctx.fruitIntake || { apples: 0, oranges: 0, bananas: 0 };

    const selectedMeal = meals.find(m => m.id === selectedMealId) || null;

    // Calculate remaining macros
    const assignedMacros = meals.reduce((acc, meal) => ({
        protein: acc.protein + (meal.targetMacros?.protein || 0),
        carbs: acc.carbs + (meal.targetMacros?.carbs || 0),
        fats: acc.fats + (meal.targetMacros?.fats || 0)
    }), { protein: 0, carbs: 0, fats: 0 });

    const fruitMacroTotal = {
        protein: (fruitIntake.apples || 0) * FRUIT_MACROS.apples.protein + (fruitIntake.oranges || 0) * FRUIT_MACROS.oranges.protein + (fruitIntake.bananas || 0) * FRUIT_MACROS.bananas.protein,
        carbs: (fruitIntake.apples || 0) * FRUIT_MACROS.apples.carbs + (fruitIntake.oranges || 0) * FRUIT_MACROS.oranges.carbs + (fruitIntake.bananas || 0) * FRUIT_MACROS.bananas.carbs,
        fats: (fruitIntake.apples || 0) * FRUIT_MACROS.apples.fats + (fruitIntake.oranges || 0) * FRUIT_MACROS.oranges.fats + (fruitIntake.bananas || 0) * FRUIT_MACROS.bananas.fats,
    };

    const remaining = {
        protein: Math.max(0, dailyTargets.protein - assignedMacros.protein - fruitMacroTotal.protein),
        carbs: Math.max(0, dailyTargets.carbs - assignedMacros.carbs - fruitMacroTotal.carbs),
        fats: Math.max(0, dailyTargets.fats - assignedMacros.fats - fruitMacroTotal.fats)
    };

    // Suggested = remaining / incomplete meals without macros
    const incompleteMealsCount = meals.filter(m =>
        !m.completed && (m.targetMacros?.protein || 0) === 0 && (m.targetMacros?.carbs || 0) === 0 && (m.targetMacros?.fats || 0) === 0
    ).length;

    const divisor = Math.max(1, incompleteMealsCount);
    const suggestedPerMeal = {
        protein: Math.round(remaining.protein / divisor),
        carbs: Math.round(remaining.carbs / divisor),
        fats: Math.round(remaining.fats / divisor)
    };

    // --- Handlers ---
    function doSelectMeal(mealId: number) {
        const meal = meals.find(m => m.id === mealId);
        if (!meal) return;
        setSelectedMealId(mealId);
        setProtein(meal.targetMacros.protein > 0 ? String(meal.targetMacros.protein) : '');
        setCarbs(meal.targetMacros.carbs > 0 ? String(meal.targetMacros.carbs) : '');
        setFats(meal.targetMacros.fats > 0 ? String(meal.targetMacros.fats) : '');
    }

    function doClose() {
        setSelectedMealId(null);
        setProtein('');
        setCarbs('');
        setFats('');
        onCloseRef.current();
    }

    function handleSave() {
        if (!selectedMeal) return;
        const p = parseInt(protein) || 0;
        const c = parseInt(carbs) || 0;
        const f = parseInt(fats) || 0;
        ctx.updateMealMacros(selectedMeal.id, { protein: p, carbs: c, fats: f });
        if (!selectedMeal.completed) {
            ctx.toggleMealCompletion(selectedMeal.id);
        }
        doClose();
    }


    // --- Drag handlers (inline, no useCallback) ---
    function onTouchStart(e: React.TouchEvent) {
        dragStartY.current = e.touches[0].clientY;
        isDraggingRef.current = true;
    }

    function onTouchMove(e: React.TouchEvent) {
        if (!isDraggingRef.current || !sheetRef.current) return;
        const deltaY = e.touches[0].clientY - dragStartY.current;
        if (deltaY > 0) {
            sheetRef.current.style.transform = `translateY(${deltaY}px)`;
            sheetRef.current.style.transition = 'none';
        }
    }

    function onTouchEnd(e: React.TouchEvent) {
        if (!isDraggingRef.current || !sheetRef.current) return;
        isDraggingRef.current = false;
        const deltaY = (e.changedTouches[0]?.clientY || 0) - dragStartY.current;
        sheetRef.current.style.transition = 'transform 0.3s ease-out';
        if (deltaY > 100) {
            sheetRef.current.style.transform = `translateY(100%)`;
            setTimeout(doClose, 300);
        } else {
            sheetRef.current.style.transform = 'translateY(0)';
        }
    }

    return (
        <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={doClose} />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl overflow-hidden animate-slide-up"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
            >
                {/* Drag Handle */}
                <div
                    className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3">
                    <h2 className="text-base font-display font-bold text-text-main">
                        Registrar Comida
                    </h2>
                    <button
                        onClick={doClose}
                        className="p-1.5 rounded-full bg-white/5 text-text-muted active:scale-90 transition-transform"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Meal Selector — horizontal pills */}
                <div className="px-5 pb-3">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {meals.map((meal) => (
                            <button
                                key={meal.id}
                                onClick={() => doSelectMeal(meal.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-display font-semibold transition-all border ${selectedMealId === meal.id
                                    ? 'bg-primary/15 border-primary/40 text-primary'
                                    : meal.completed
                                        ? 'bg-secondary/5 border-green-500/20 text-green-400/70'
                                        : 'bg-background/50 border-border text-text-muted active:bg-white/5'
                                    }`}
                            >
                                <span className="flex items-center gap-1.5">
                                    {meal.completed && <Check size={12} strokeWidth={3} />}
                                    {meal.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedMeal && (
                    <div className="px-5 pb-2">
                        {/* Remaining macros info */}
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-background/40 border border-white/[0.04] mb-4">
                            <span className="text-[10px] font-display font-bold text-text-muted uppercase tracking-wider">Restante</span>
                            <div className="flex items-center gap-3 ml-auto text-[11px] font-bold font-display">
                                <span className="text-purple-400">{remaining.protein}P</span>
                                <span className="text-blue-400">{remaining.carbs}C</span>
                                <span className="text-emerald-400">{remaining.fats}G</span>
                            </div>
                        </div>

                        {/* Macro Inputs */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: 'Proteína', value: protein, set: setProtein, suggested: suggestedPerMeal.protein, color: 'border-purple-500/30 focus:border-purple-400', textColor: 'text-purple-400' },
                                { label: 'Carbos', value: carbs, set: setCarbs, suggested: suggestedPerMeal.carbs, color: 'border-blue-500/30 focus:border-blue-400', textColor: 'text-blue-400' },
                                { label: 'Grasas', value: fats, set: setFats, suggested: suggestedPerMeal.fats, color: 'border-emerald-500/30 focus:border-emerald-400', textColor: 'text-emerald-400' },
                            ].map((input) => (
                                <div key={input.label} className="flex flex-col">
                                    <label className={`text-[10px] font-display font-bold uppercase tracking-wider mb-1.5 ${input.textColor}`}>
                                        {input.label}
                                    </label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        value={input.value}
                                        onChange={(e) => input.set(e.target.value)}
                                        placeholder={String(input.suggested)}
                                        className={`w-full bg-background border-2 ${input.color} rounded-xl py-3 px-3 text-center text-xl font-display font-bold text-text-main focus:outline-none transition-colors placeholder:text-text-muted/25`}
                                    />
                                    <span className="text-[9px] text-text-muted text-center mt-1 font-display">gramos</span>
                                </div>
                            ))}
                        </div>


                        {/* Save */}
                        <button
                            onClick={handleSave}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-black font-display font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
                        >
                            <Check size={18} strokeWidth={3} />
                            {selectedMeal.completed ? 'Actualizar comida' : 'Completar comida'}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slide-up-sheet {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up-sheet 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default QuickMealSheet;
