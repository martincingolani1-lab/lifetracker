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
    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-xl flex items-center justify-between group overflow-hidden relative transition-all duration-500">
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />

      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/15 rounded-xl text-blue-400">
            <Droplets size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-display font-black text-text-main tracking-tight">Hidratación</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider opacity-50">Mantente hidratado hoy</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-display font-black text-text-main tracking-tighter animate-number">{waterIntake}</span>
          <span className="text-xs font-bold text-text-muted">/ </span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input autoFocus type="number" value={inputTarget} onChange={(e) => setInputTarget(e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-16 bg-background/50 border border-blue-500/50 text-text-main text-sm font-bold px-2 py-0.5 rounded-lg focus:outline-none" />
              <span className="text-xs text-text-muted font-bold">ml</span>
            </div>
          ) : (
            <span onClick={() => setIsEditing(true)} className="text-sm text-text-muted font-bold cursor-pointer hover:text-blue-400 transition-colors">{waterTarget}ml</span>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => updateWater(-250)} className="p-2 rounded-xl bg-text-muted/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all border border-border active:scale-90">
            <Minus size={16} strokeWidth={3} />
          </button>
          <button onClick={() => updateWater(250)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all active:scale-95">
            <Plus size={16} strokeWidth={3} />
            <span className="font-display font-black text-xs uppercase tracking-widest">250ml</span>
          </button>
        </div>
      </div>

      {/* Bottle */}
      <div className="relative flex flex-col items-center gap-0.5">
        <div className="w-5 h-1.5 bg-white/20 border border-border rounded-t-lg z-20" />
        <div className="relative w-10 h-16 bg-white/5 rounded-b-2xl rounded-t-sm border-2 border-border overflow-hidden z-10">
          <div className="absolute top-0 left-1.5 w-1 h-full bg-white/10 rounded-full z-20" />
          <motion.div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400"
            initial={{ height: 0 }} animate={{ height: `${percentage}%` }} transition={{ type: "spring", stiffness: 30, damping: 15 }}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/20 blur-[1px]" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-xs font-display font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
