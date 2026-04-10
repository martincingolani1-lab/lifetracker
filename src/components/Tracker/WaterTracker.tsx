import React from 'react';
import { useUser } from '../../store/userStore';
import { Droplets, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const WaterTracker: React.FC = () => {
  const { waterIntake, updateWater, waterTarget, setWaterTarget } = useUser();
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputTarget, setInputTarget] = React.useState(waterTarget.toString());

  React.useEffect(() => {
    if (!isEditing) setInputTarget(waterTarget.toString());
  }, [waterTarget, isEditing]);

  const percentage = Math.min((waterIntake / waterTarget) * 100, 100);

  const handleSave = () => {
    const val = parseInt(inputTarget);
    if (val && val > 0) setWaterTarget(val);
    setIsEditing(false);
  };

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl px-5 py-4 shadow-xl overflow-hidden relative transition-all duration-500 flex items-stretch gap-5 h-full">
      <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />

      {/* Left: info + controls — fills all vertical space */}
      <div className="flex-1 flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/15 rounded-xl text-blue-400">
            <Droplets size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-display font-black text-text-main tracking-tight">Hidratación</span>
        </div>

        {/* Big number */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-display font-black text-text-main tabular-nums leading-none">{waterIntake}</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted leading-none">/</span>
            {isEditing ? (
              <input autoFocus type="number" value={inputTarget}
                onChange={(e) => setInputTarget(e.target.value)}
                onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-16 bg-background/50 border border-blue-500/50 text-text-main text-sm font-bold px-1.5 py-0.5 rounded-lg focus:outline-none mt-0.5" />
            ) : (
              <span onClick={() => setIsEditing(true)} className="text-sm text-text-muted font-bold cursor-pointer hover:text-blue-400 transition-colors">{waterTarget}ml</span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-text-muted/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 15 }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => updateWater(-250)} className="p-2 rounded-xl bg-text-muted/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all border border-border active:scale-90">
            <Minus size={14} strokeWidth={3} />
          </button>
          <button onClick={() => updateWater(250)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95">
            <Plus size={14} strokeWidth={3} />
            <span className="font-display font-black text-xs uppercase tracking-widest">250ml</span>
          </button>
        </div>
      </div>

      {/* Right: Bottle — stretches to fill height */}
      <div className="relative flex flex-col items-center gap-0.5 z-10 self-stretch justify-end">
        <div className="w-6 h-2 bg-white/20 border border-border rounded-t-lg z-20" />
        <div className="relative w-12 flex-1 bg-white/5 rounded-b-2xl rounded-t-sm border-2 border-border overflow-hidden z-10" style={{ minHeight: 80 }}>
          <div className="absolute top-0 left-2 w-1 h-full bg-white/10 rounded-full z-20" />
          <motion.div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400"
            initial={{ height: 0 }} animate={{ height: `${percentage}%` }} transition={{ type: "spring", stiffness: 30, damping: 15 }}>
            <div className="absolute top-0 left-0 w-full h-2 bg-white/20 blur-[1px]" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-xs font-display font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
