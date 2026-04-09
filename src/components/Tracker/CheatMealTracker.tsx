import { useMemo, useState, useEffect } from "react";
import { useUser } from "../../store/userStore";
import { Flame, UtensilsCrossed, Timer } from "lucide-react";
import { motion } from "framer-motion";

const CheatMealTracker = () => {
  const {
    registerCheatMeal,
    undoCheatMeal,
    lastCheatTimestamp,
    cheatMealsPerWeek,
    setCheatMealsPerWeek,
  } = useUser();

  const [now, setNow] = useState(new Date());

  // Update 'now' every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const nextCheatDate = useMemo(() => {
    if (!lastCheatTimestamp) return new Date(); // Available now
    const last = new Date(lastCheatTimestamp);
    let intervalMs;
    if (cheatMealsPerWeek === 2) {
      // 3.5 days = 3 days + 12 hours
      intervalMs = (3 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000);
    } else {
      // 7 days
      intervalMs = 7 * 24 * 60 * 60 * 1000;
    }
    const next = new Date(last.getTime() + intervalMs);
    return next;
  }, [lastCheatTimestamp, cheatMealsPerWeek]);

  const isAvailable = now >= nextCheatDate;

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (isAvailable) return null;
    const diff = nextCheatDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, [now, nextCheatDate, isAvailable]);

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  // Calculate progress percentage accurately
  const progressPercentage = useMemo(() => {
    if (isAvailable) return 100;
    let totalDurationMs;
    if (cheatMealsPerWeek === 2) {
      totalDurationMs = (3 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000);
    } else {
      totalDurationMs = 7 * 24 * 60 * 60 * 1000;
    }
    const remainingMs = nextCheatDate.getTime() - now.getTime();
    const elapsed = totalDurationMs - remainingMs;
    return Math.min((elapsed / totalDurationMs) * 100, 100);
  }, [isAvailable, nextCheatDate, now, cheatMealsPerWeek]);

  return (
    <div className="bg-gradient-to-br from-orange-900/20 via-red-900/20 to-card border border-orange-500/20 rounded-2xl p-4 overflow-hidden relative group">
      {/* Background Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] rounded-full opacity-20 pointer-events-none transition-colors duration-500 ${isAvailable ? 'bg-green-500' : 'bg-orange-600'}`} />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          {isAvailable ? <UtensilsCrossed size={20} className="text-green-400" /> : <Timer size={20} className="text-orange-400" />}
          <h3 className={`text-sm font-bold ${isAvailable ? 'text-green-400' : 'text-orange-400'}`}>
            {isAvailable ? 'Permitido' : 'Próximo Permitido'}
          </h3>
        </div>

        {/* Countdown Timer */}
        {!isAvailable && timeRemaining ? (
          <div className="flex items-baseline justify-center gap-1 font-mono text-3xl font-bold text-white tracking-wide">
            <span>{timeRemaining.days}d</span>
            <span className="text-gray-500 text-xl">:</span>
            <span>{formatTime(timeRemaining.hours)}</span>
            <span className="text-gray-500 text-xl">:</span>
            <span>{formatTime(timeRemaining.minutes)}</span>
            <span className="text-gray-500 text-xl">:</span>
            <span className="text-orange-400">{formatTime(timeRemaining.seconds)}</span>
          </div>
        ) : null}

        {/* Available Message */}
        {isAvailable && (
          <p className="text-gray-400 text-xs text-center">
            ¡Te has portado bien! 🍔
          </p>
        )}

        {/* Settings Toggle */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Frecuencia:</span>
          <div className="flex bg-background rounded-lg p-1 w-full">
            <button
              onClick={() => setCheatMealsPerWeek(1)}
              className={`flex-1 px-2 py-1.5 text-xs font-bold rounded-md transition-all ${cheatMealsPerWeek === 1 ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              1/Semana
            </button>
            <button
              onClick={() => setCheatMealsPerWeek(2)}
              className={`flex-1 px-2 py-1.5 text-xs font-bold rounded-md transition-all ${cheatMealsPerWeek === 2 ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              2/Semana
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!isAvailable && (
          <div className="h-1 w-full bg-background rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-orange-500"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={registerCheatMeal}
          disabled={!isAvailable}
          className={`w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${isAvailable ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-105 hover:shadow-orange-900/40' : 'bg-background text-gray-500 cursor-not-allowed opacity-50'}`}
        >
          <Flame size={16} className={isAvailable ? "animate-pulse" : ""} />
          {isAvailable ? '¡CHITIÉ!' : 'En Progreso...'}
        </button>

        {/* Undo Button */}
        {!isAvailable && lastCheatTimestamp && (
          <button
            onClick={undoCheatMeal}
            className="text-xs text-red-400/60 hover:text-red-400 underline transition-colors text-center"
          >
            Deshacer
          </button>
        )}
      </div>
    </div>
  );
};

export default CheatMealTracker;
