import React from 'react';
import { useUser } from '../../store/userStore';
import {
    Activity,
    Utensils,
    ListTodo,
    ChevronRight,
    Sparkles,
    Target,
    Droplets,
    Pill,
} from 'lucide-react';
import { FRUIT_MACROS } from '../../store/userStore';

interface GeneralOverviewProps {
    setModule: (module: 'home' | 'nutrition' | 'todo' | 'settings') => void;
}

const GeneralOverview: React.FC<GeneralOverviewProps> = ({ setModule }) => {
    const {
        dailyTargets,
        meals,
        todoList,
        fruitIntake,
        waterIntake,
        waterTarget,
        supplements,
    } = useUser();

    // Nutrition Stats
    const fruitConsumed = {
        protein: (fruitIntake.apples * FRUIT_MACROS.apples.protein) + (fruitIntake.oranges * FRUIT_MACROS.oranges.protein) + (fruitIntake.bananas * FRUIT_MACROS.bananas.protein),
        carbs: (fruitIntake.apples * FRUIT_MACROS.apples.carbs) + (fruitIntake.oranges * FRUIT_MACROS.oranges.carbs) + (fruitIntake.bananas * FRUIT_MACROS.bananas.carbs),
        fats: (fruitIntake.apples * FRUIT_MACROS.apples.fats) + (fruitIntake.oranges * FRUIT_MACROS.oranges.fats) + (fruitIntake.bananas * FRUIT_MACROS.bananas.fats),
    };

    const consumed = {
        protein: meals.reduce((acc, m) => m.completed ? acc + m.targetMacros.protein : acc, 0) + fruitConsumed.protein,
        carbs: meals.reduce((acc, m) => m.completed ? acc + m.targetMacros.carbs : acc, 0) + fruitConsumed.carbs,
        fats: meals.reduce((acc, m) => m.completed ? acc + m.targetMacros.fats : acc, 0) + fruitConsumed.fats,
    };

    const totalCals = (consumed.protein * 4) + (consumed.carbs * 4) + (consumed.fats * 9);
    const targetCals = (dailyTargets.protein * 4) + (dailyTargets.carbs * 4) + (dailyTargets.fats * 9);
    const nutritionProgress = Math.min((totalCals / targetCals) * 100, 100);

    // Todo Stats
    const completedTasks = todoList.filter(t => t.completed).length;
    const pendingTasks = todoList.filter(t => !t.completed).length;

    // Water Stats
    const waterProgress = Math.min((waterIntake / waterTarget) * 100, 100);

    // Supplements Stats
    const takenSupplements = supplements.filter(s => s.taken).length;
    const supplementsProgress = supplements.length > 0 ? (takenSupplements / supplements.length) * 100 : 0;

    const cards = [
        {
            id: 'nutrition',
            module: 'nutrition' as const,
            icon: Utensils,
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            value: totalCals,
            suffix: 'kcal hoy',
            progress: nutritionProgress,
            barColor: 'from-emerald-500 via-emerald-400 to-green-400',
            glowColor: 'rgba(16, 185, 129, 0.15)',
        },
        {
            id: 'water',
            module: 'nutrition' as const,
            icon: Droplets,
            iconBg: 'bg-cyan-500/10',
            iconColor: 'text-cyan-400',
            value: `${waterIntake}ml`,
            suffix: `/ ${waterTarget}ml`,
            progress: waterProgress,
            barColor: 'from-cyan-500 via-sky-400 to-blue-400',
            glowColor: 'rgba(6, 182, 212, 0.15)',
        },
        {
            id: 'supplements',
            module: 'nutrition' as const,
            icon: Pill,
            iconBg: 'bg-violet-500/10',
            iconColor: 'text-violet-400',
            value: `${takenSupplements} / ${supplements.length}`,
            suffix: 'suplementos',
            progress: supplementsProgress,
            barColor: 'from-violet-500 via-purple-400 to-violet-300',
            glowColor: 'rgba(139, 92, 246, 0.15)',
        },
        {
            id: 'todo',
            module: 'todo' as const,
            icon: ListTodo,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            value: pendingTasks,
            suffix: 'tareas pendientes',
            progress: null,
            completedText: `Has completado ${completedTasks} hoy`,
            barColor: '',
            glowColor: 'rgba(59, 130, 246, 0.15)',
        },
        {
            id: 'macros',
            module: 'nutrition' as const,
            icon: Target,
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            value: '',
            suffix: 'Macros Diarios',
            isMacroCard: true,
            macros: [
                { label: 'Prot', current: Math.round(consumed.protein), target: dailyTargets.protein, color: 'from-purple-500 to-violet-400' },
                { label: 'Carb', current: Math.round(consumed.carbs), target: dailyTargets.carbs, color: 'from-blue-500 to-cyan-400' },
                { label: 'Gras', current: Math.round(consumed.fats), target: dailyTargets.fats, color: 'from-emerald-500 to-green-400' },
            ],
            glowColor: 'rgba(16, 185, 129, 0.15)',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1.5 py-2 animate-fade-up">
                <h2 className="text-3xl md:text-4xl font-display font-black text-text-main tracking-tighter">
                    ¡Hola!
                    <Sparkles size={24} className="inline-block ml-2 text-primary animate-pulse" />
                </h2>
                <p className="text-text-muted font-medium flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    Tu progreso de hoy se ve increíble.
                </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.id}
                            onClick={() => setModule(card.module)}
                            className={`
                                relative bg-card/50 backdrop-blur-xl border border-border
                                p-6 rounded-[2rem] flex flex-col justify-between
                                group cursor-pointer
                                hover:bg-card/80 hover:border-border
                                transition-all duration-500
                                hover:shadow-[0_20px_60px_-15px_var(--glow-color)]
                                hover-lift shimmer-border
                                animate-fade-up stagger-${i + 2}
                            `}
                            style={{ '--glow-color': card.glowColor } as React.CSSProperties}
                        >
                            <div
                                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                style={{ background: card.glowColor }}
                            />

                            <div className="flex items-center justify-between mb-5">
                                <div className={`p-3 rounded-2xl ${card.iconBg} ${card.iconColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                    <Icon size={24} />
                                </div>
                                <ChevronRight
                                    size={20}
                                    className="text-text-muted/40 group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-300"
                                />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-2xl font-display font-black text-text-main tracking-tight animate-number">
                                        {card.value}
                                    </span>
                                    <span className="text-xs font-display font-bold text-text-muted/70 uppercase tracking-wider">
                                        {card.suffix}
                                    </span>
                                </div>

                                {card.isMacroCard ? (
                                    <div className="space-y-3 mt-2">
                                        {(card as any).macros.map((macro: any) => (
                                            <div key={macro.label} className="space-y-1">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{macro.label}</span>
                                                    <span className="text-[10px] font-black text-text-main">{macro.current} / {macro.target}g</span>
                                                </div>
                                                <div className="w-full bg-background/50 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${macro.color} rounded-full transition-all duration-1000 ease-out`}
                                                        style={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : card.progress !== null ? (
                                    <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden mt-4">
                                        <div
                                            className={`h-full bg-gradient-to-r ${card.barColor} rounded-full transition-all duration-1000 ease-out progress-shine`}
                                            style={{ width: `${card.progress}%` }}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-xs font-semibold text-text-muted mt-4">
                                        {card.completedText}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="h-4" />
        </div>
    );
};

export default GeneralOverview;
