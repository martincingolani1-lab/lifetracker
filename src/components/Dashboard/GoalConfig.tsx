import React, { useState, useEffect } from "react";
import { useUser } from "../../store/userStore";
import { X, Target, Save } from "lucide-react";
import { motion } from "framer-motion";
interface GoalConfigProps {
  isOpen: boolean;
  onClose: () => void;
}
const GoalConfig: React.FC<GoalConfigProps> = ({ isOpen, onClose }) => {
  const { dailyTargets, setDailyTargets, theme } = useUser();
  const isLight = theme === "light";
  const [targets, setTargets] = useState(dailyTargets);
  useEffect(() => {
    if (isOpen) setTargets(dailyTargets);
  }, [isOpen, dailyTargets]);
  const handleChange = (key: keyof typeof targets, value: string) => {
    const num = parseInt(value) || 0;
    setTargets((prev) => ({ ...prev, [key]: num }));
  };
  const handleSave = () => {
    setDailyTargets(targets);
    onClose();
  };
  const calories = targets.protein * 4 + targets.carbs * 4 + targets.fats * 9;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border"
      >
        {" "}
        <div className="p-6 -b flex items-center justify-between">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 font-bold">
              {" "}
              <Target size={20} />{" "}
            </div>{" "}
            <div>
              {" "}
              <h2 className="text-xl font-bold text-text-main">
                Configurar Objetivos
              </h2>{" "}
              <p className="text-xs text-text-muted">
                Define tus macros diarios
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main transition-colors"
          >
            {" "}
            <X size={24} />{" "}
          </button>{" "}
        </div>{" "}
        <div className="p-6 space-y-6">
          {" "}
          <div className="grid grid-cols-3 gap-4">
            {" "}
            <div className="space-y-2">
              {" "}
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Proteína (g)
              </label>{" "}
              <input
                type="number"
                value={targets.protein}
                onChange={(e) => handleChange("protein", e.target.value)}
                className={`w-full bg-background rounded-xl px-4 py-3 text-lg font-bold outline-none border border-border focus:border-purple-500 transition-all ${isLight ? "text-purple-700" : "text-purple-400"}`}
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Carbos (g)
              </label>{" "}
              <input
                type="number"
                value={targets.carbs}
                onChange={(e) => handleChange("carbs", e.target.value)}
                className={`w-full bg-background rounded-xl px-4 py-3 text-lg font-bold outline-none border border-border focus:border-blue-500 transition-all ${isLight ? "text-blue-700" : "text-blue-400"}`}
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Grasas (g)
              </label>{" "}
              <input
                type="number"
                value={targets.fats}
                onChange={(e) => handleChange("fats", e.target.value)}
                className={`w-full bg-background rounded-xl px-4 py-3 text-lg font-bold outline-none border border-border focus:border-emerald-500 transition-all ${isLight ? "text-emerald-700" : "text-emerald-400"}`}
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-background rounded-xl p-4 flex items-center justify-between border border-border">
            {" "}
            <span className="text-sm font-medium text-text-muted">
              Total Calorías Estimadas
            </span>{" "}
            <span className="text-xl font-bold text-text-main">
              {calories}{" "}
              <span className="text-sm text-text-muted font-normal">kcal</span>
            </span>{" "}
          </div>{" "}
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {" "}
            <Save size={18} /> Guardar Cambios{" "}
          </button>{" "}
        </div>{" "}
      </motion.div>{" "}
    </div>
  );
};
export default GoalConfig;
