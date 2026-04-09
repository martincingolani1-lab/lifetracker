import React, { useState } from "react";
import { useUser, FRUIT_MACROS } from "../../store/userStore";
import {
  Settings,
  Flame,
  Utensils,
  Circle,
  Droplet,
  Target,
} from "lucide-react";
import GoalConfig from "./GoalConfig";

interface MacroCardProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  colorClass: string;
  bgClass: string;
  barColor: string;
  icon: React.ElementType;
  index: number;
}

const MacroCard = ({
  label,
  current,
  target,
  unit = "g",
  colorClass,
  bgClass,
  barColor,
  icon: Icon,
  index,
}: MacroCardProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div
      className={`p-5 rounded-2xl relative overflow-hidden ${bgClass} flex flex-col justify-between h-36 group 
        border border-border hover:border-primary/20 
        transition-all duration-500 hover-lift
        animate-fade-up stagger-${index + 1}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start z-10">
        <div className={`p-2.5 rounded-xl bg-text-muted/5 ${colorClass} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-display font-bold text-text-muted/60 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="z-10">
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-2xl font-display font-black text-text-main tracking-tight animate-number">
            {current}
          </span>
          <span className="text-xs text-text-muted/60 font-display font-bold">
            / {target}{unit}
          </span>
        </div>
        {/* Progress Bar with shine */}
        <div className="h-1.5 w-full bg-text-muted/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out progress-shine`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div >
  );
};

const MacroOverview: React.FC = () => {
  const { dailyTargets, meals, fruitIntake, theme } = useUser();
  const isLight = theme === "light";

  const mealConsumed = meals.reduce(
    (acc, meal) => {
      if (meal.completed) {
        return {
          protein: acc.protein + meal.targetMacros.protein,
          carbs: acc.carbs + meal.targetMacros.carbs,
          fats: acc.fats + meal.targetMacros.fats,
        };
      }
      return acc;
    },
    { protein: 0, carbs: 0, fats: 0 },
  );

  const fruitConsumed = {
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

  const consumed = {
    protein: mealConsumed.protein + fruitConsumed.protein,
    carbs: mealConsumed.carbs + fruitConsumed.carbs,
    fats: mealConsumed.fats + fruitConsumed.fats,
  };

  const calculateCalories = (p: number, c: number, f: number) =>
    p * 4 + c * 4 + f * 9;

  const currentCals = calculateCalories(
    consumed.protein,
    consumed.carbs,
    consumed.fats,
  );

  const targetCals = calculateCalories(
    dailyTargets.protein,
    dailyTargets.carbs,
    dailyTargets.fats,
  );

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-sm font-display font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Target size={14} className="text-primary" /> Resumen Diario
          </h2>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-display font-bold text-text-muted hover:text-text-main hover:bg-white/5 hover:border-border transition-all duration-300 active:scale-95"
          >
            <Settings size={14} /> <span>Configurar</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MacroCard
            label="Calorías"
            current={currentCals}
            target={targetCals}
            unit="kcal"
            icon={Flame}
            colorClass={isLight ? "text-orange-600" : "text-orange-400"}
            bgClass="bg-card shadow-sm"
            barColor="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400"
            index={0}
          />
          <MacroCard
            label="Proteína"
            current={consumed.protein}
            target={dailyTargets.protein}
            icon={Utensils}
            colorClass={isLight ? "text-purple-600" : "text-purple-400"}
            bgClass="bg-card shadow-sm"
            barColor="bg-gradient-to-r from-purple-600 via-purple-500 to-violet-400"
            index={1}
          />
          <MacroCard
            label="Carbs"
            current={consumed.carbs}
            target={dailyTargets.carbs}
            icon={Circle}
            colorClass={isLight ? "text-blue-600" : "text-blue-400"}
            bgClass="bg-card shadow-sm"
            barColor="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400"
            index={2}
          />
          <MacroCard
            label="Grasas"
            current={consumed.fats}
            target={dailyTargets.fats}
            icon={Droplet}
            colorClass={isLight ? "text-emerald-600" : "text-emerald-400"}
            bgClass="bg-card shadow-sm"
            barColor="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400"
            index={3}
          />
        </div>
      </div>

      <GoalConfig
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
};

export default MacroOverview;
