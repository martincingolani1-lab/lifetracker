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
    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl px-4 py-3 shadow-xl overflow-hidden relative transition-all duration-500">
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none" />

      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/15 rounded-lg text-blue-400">
            <Droplets size={14} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-display font-black text-text-main tracking-tight">Hidratación</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-display font-black text-text-main tabular-nums">{waterIntake}</span>
          <span className="text-[10px] font-bold text-text-muted">/</span>
          {isEditing ? (
            <input autoFocus type="number" value={inputTarget}
              onChange={(e) => setInputTarget(e.target.value)}
              onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-14 bg-background/50 border border-blue-500/50 text-text-main text-xs font-bold px-1.5 py-0.5 rounded-lg focus:outline-none" />
          ) : (
            <span onClick={() => setIsEditing(true)} className="text-[10px] text-text-muted font-bold cursor-pointer hover:text-blue-400 transition-colors">{waterTarget}ml</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-text-muted/10 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 40, damping: 15 }}
        />
      </div>

      {/* Buttons row */}
      <div className="flex items-center gap-2">
        <button onClick={() => updateWater(-250)} className="p-1.5 rounded-lg bg-text-muted/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all border border-border active:scale-90">
          <Minus size={13} strokeWidth={3} />
        </button>
        <button onClick={() => updateWater(250)} className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center justify-center gap-1 shadow-md shadow-blue-500/20 transition-all active:scale-95">
          <Plus size={13} strokeWidth={3} />
          <span className="font-display font-black text-[10px] uppercase tracking-widest">250ml</span>
        </button>
        <span className="text-xs font-bold text-blue-400 min-w-[2.5rem] text-right">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default WaterTracker;
