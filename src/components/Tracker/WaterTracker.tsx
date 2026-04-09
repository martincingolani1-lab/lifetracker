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
    <div className="bg-card/40 backdrop-blur-xl border border-border hover:border-border rounded-[2rem] p-6 shadow-xl flex items-center justify-between group overflow-hidden relative transition-all duration-500 hover-lift">
      {/* Background Decorative Glow */}
      <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
      <div className="absolute -top-8 -left-8 w-24 h-24 bg-cyan-500/5 blur-[40px] rounded-full pointer-events-none" />

      <div className="flex flex-col gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2.5 bg-blue-500/15 rounded-xl text-blue-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Droplets size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black text-text-main tracking-tight">Hidratación</h3>
          </div>
          <p className="text-xs text-text-muted font-display font-bold uppercase tracking-wider opacity-50">Mantente hidratado hoy</p>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span className="text-4xl font-display font-black text-text-main tracking-tighter animate-number">{waterIntake}</span>
          <span className="text-sm font-bold text-text-muted">/ </span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="number"
                value={inputTarget}
                onChange={(e) => setInputTarget(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-20 bg-background/50 border border-blue-500/50 text-text-main text-lg font-bold px-2 py-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              <span className="text-sm text-text-muted font-bold">ml</span>
            </div>
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="text-lg text-text-muted font-bold cursor-pointer hover:text-blue-400 hover:underline decoration-dashed transition-all duration-300"
              title="Haz clic para editar meta"
            >
              {waterTarget}ml
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => updateWater(-250)}
            className="p-3 rounded-2xl bg-text-muted/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all duration-300 border border-border hover:border-red-500/30 active:scale-90 ripple-container"
          >
            <Minus size={20} strokeWidth={3} />
          </button>
          <button
            onClick={() => updateWater(250)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 active:scale-95 ripple-container"
          >
            <Plus size={20} strokeWidth={3} />
            <span className="font-display font-black text-sm uppercase tracking-widest">250ml</span>
          </button>
        </div>
      </div>

      {/* Bottle Visualization */}
      <div className="relative flex flex-col items-center gap-1 scale-110">
        {/* Cap */}
        <div className="w-8 h-3 bg-white/20 border border-border rounded-t-lg z-20 shadow-sm" />

        {/* Bottle Body */}
        <div className="relative w-16 h-32 bg-white/5 backdrop-blur-md rounded-b-[1.5rem] rounded-t-md border-2 border-border overflow-hidden shadow-2xl z-10">
          {/* Shine effect */}
          <div className="absolute top-0 left-2 w-1.5 h-full bg-white/10 rounded-full z-20" />

          {/* Water Fill */}
          <motion.div
            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400"
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 30, damping: 15 }}
          >
            {/* Wave effect */}
            <div className="absolute top-0 left-0 w-full h-2 bg-white/20 blur-[1px]" />
          </motion.div>

          {/* Percentage */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-lg font-display font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
