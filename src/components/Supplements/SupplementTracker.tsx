import React, { useState } from "react";
import { useUser } from "../../store/userStore";
import { Activity, Check, Plus, Trash2, Edit2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SupplementTracker: React.FC = () => {
  const {
    supplements,
    toggleSupplement,
    addSupplement,
    updateSupplement,
    deleteSupplement,
    theme,
  } = useUser();

  const isLight = theme === "light";
  const [isEditing, setIsEditing] = useState(false);

  const [newName, setNewName] = useState('');
  const [newTiming, setNewTiming] = useState('');
  const [newType, setNewType] = useState<'hormonal' | 'gym'>('hormonal');

  const hormonal = supplements.filter(s => s.type === 'hormonal');
  const gym = supplements.filter(s => s.type === 'gym');

  const handleAdd = () => {
    if (!newName.trim() || !newTiming.trim()) return;
    addSupplement({
      name: newName,
      timing: newTiming,
      type: newType
    });
    setNewName('');
    setNewTiming('');
  };

  const renderGroup = (title: string, items: typeof supplements, icon: React.ReactNode, colorClass: string) => (
    <div className="mb-4 last:mb-0">
      <div className={`flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest ${colorClass} opacity-80`}>
        {icon}
        {title}
      </div>
      <div className="space-y-1.5">
        <AnimatePresence>
          {items.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              {isEditing ? (
                <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border">
                  <div className="flex-1 space-y-2">
                    <input
                      value={s.name}
                      onChange={(e) => updateSupplement(s.id, { name: e.target.value })}
                      className="w-full bg-background rounded px-2 py-1 text-xs text-text-main focus:border-green-500/50 outline-none"
                      placeholder="Nombre"
                    />
                    <div className="flex gap-2">
                      <input
                        value={s.timing}
                        onChange={(e) => updateSupplement(s.id, { timing: e.target.value })}
                        className="flex-1 bg-background rounded px-2 py-1 text-[10px] text-text-muted focus:border-green-500/50 outline-none"
                        placeholder="Horario"
                      />
                      <select
                        value={s.type}
                        onChange={(e) => updateSupplement(s.id, { type: e.target.value as 'hormonal' | 'gym' })}
                        className="bg-background rounded px-1 py-1 text-[10px] text-text-muted focus:border-green-500/50 outline-none"
                      >
                        <option value="hormonal">Hormonal</option>
                        <option value="gym">Gym</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSupplement(s.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleSupplement(s.id)}
                  className={`w-full flex items-center justify-between p-2.5 pl-3 rounded-lg transition-all duration-300 group border ${s.taken ? 'bg-blue-900/10 border-blue-500/20' : 'bg-card/50 border-border hover:border-border hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${s.taken ? 'bg-primary' : 'bg-text-muted/20 group-hover:bg-primary'} transition-all`} />
                    <div className="flex flex-col items-start gap-0.5">
                      <span className={`text-xs font-medium transition-colors ${s.taken ? 'text-primary' : 'text-text-main group-hover:text-primary'}`}>
                        {s.name}
                      </span>
                      <span className="text-[9px] text-text-muted font-medium uppercase tracking-wide group-hover:text-primary/70 transition-colors">
                        {s.timing}
                      </span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${s.taken ? 'bg-primary border-primary shadow shadow-primary/20' : 'border-text-muted/30 bg-transparent group-hover:border-primary/50'}`} >
                    {s.taken && <Check size={10} className={isLight ? "text-white" : "text-black"} strokeWidth={3} />}
                  </div>
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm relative overflow-hidden h-full flex flex-col border border-border">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold tracking-tight text-text-main flex items-center gap-2">
          <Activity size={16} className="text-primary" />
          Suplementación
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-1.5 rounded-lg transition-all ${isEditing ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
        >
          {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-2 custom-scrollbar">
        {renderGroup('Hormonal', hormonal, null, isLight ? 'text-purple-700' : 'text-purple-400')}
        <div className="w-full h-px bg-white/5 my-4" />
        {renderGroup('Rendimiento', gym, null, isLight ? 'text-cyan-700' : 'text-cyan-400')}

        {isEditing && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Nuevo Suplemento</div>
            <div className="space-y-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-background rounded px-2 py-1.5 text-xs text-text-main border border-border focus:border-green-500/50 outline-none"
                placeholder="Nombre..."
              />
              <div className="flex gap-2">
                <input
                  value={newTiming}
                  onChange={(e) => setNewTiming(e.target.value)}
                  className="flex-1 bg-background rounded px-2 py-1.5 text-xs text-text-muted border border-border focus:border-green-500/50 outline-none"
                  placeholder="Horario..."
                />
                <button
                  onClick={handleAdd}
                  disabled={!newName || !newTiming}
                  className="px-3 py-1.5 bg-green-600 disabled:opacity-50 hover:bg-green-500 text-white rounded-md flex items-center justify-center transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex gap-2 text-[10px]">
                <button
                  onClick={() => setNewType('hormonal')}
                  className={`flex-1 py-1 rounded transition-colors border ${newType === 'hormonal' ? 'bg-purple-500/20 border-purple-500/50 text-purple-700 font-bold' : 'border-transparent text-text-muted'}`}
                >
                  Hormonal
                </button>
                <button
                  onClick={() => setNewType('gym')}
                  className={`flex-1 py-1 rounded transition-colors border ${newType === 'gym' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-700 font-bold' : 'border-transparent text-text-muted'}`}
                >
                  Gym
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplementTracker;
