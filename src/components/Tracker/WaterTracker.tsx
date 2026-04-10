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
    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl px-4 py-3 shadow-xl overflow-hidden relative transition-all duration-500 flex items-center gap-4">
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none" />

      {/* Left: info + controls */}
      <div className="flex-1 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-blue-500/15 rounded-lg text-blue-400">
            <Droplets size={14} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-display font-black text-text-main tracking-tight">Hidratación</span>
        </div>

        {/* Number + target */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-xl font-display font-black text-text-main tabular-nums">{waterIntake}</span>
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

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => updateWater(-250)} className="p-1.5 rounded-lg bg-text-muted/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all border border-border active:scale-90">
            <Minus size={12} strokeWidth={3} />
          </button>
          <button onClick={() => updateWater(250)} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center gap-1 shadow-md shadow-blue-500/20 transition-all active:scale-95">
            <Plus size={12} strokeWidth={3} />
            <span className="font-display font-black text-[9px] uppercase tracking-widest">250ml</span>
          </button>
        </div>
      </div>

      {/* Right: Bottle */}
      <div className="relative flex flex-col items-center gap-0.5 z-10">
        <div className="w-5 h-1.5 bg-white/20 border border-border rounded-t-lg z-20" />
        <div className="relative w-10 h-20 bg-white/5 rounded-b-2xl rounded-t-sm border-2 border-border overflow-hidden z-10">
          <div className="absolute top-0 left-1.5 w-1 h-full bg-white/10 rounded-full z-20" />
          <motion.div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400"
            initial={{ height: 0 }} animate={{ height: `${percentage}%` }} transition={{ type: "spring", stiffness: 30, damping: 15 }}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/20 blur-[1px]" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-[10px] font-display font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
