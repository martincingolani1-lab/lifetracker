import React from "react";
import { TrendingUp, Award, Flame, Target } from "lucide-react";
import type { Habit } from "../../types";

interface InsightProps {
  habits: Habit[];
  consistency: number;
}

const COLOR_MAP: Record<string, { bg: string; text: string; glow: string }> = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    glow: "shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]",
  },
  "orange-500": {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]",
  },
  "green-500": {
    bg: "bg-green-500/10",
    text: "text-green-400",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.15)]",
  },
  "blue-500": {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  },
  "gray-500": {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    glow: "",
  },
};

export const SmartInsights: React.FC<InsightProps> = ({
  habits,
  consistency,
}) => {
  const getInsight = () => {
    const completedCount = habits.filter((h) => h.completed).length;
    const totalHabits = habits.length;
    const maxStreak = Math.max(...habits.map((h) => h.streak || 0), 0);
    if (completedCount === totalHabits && totalHabits > 0) {
      return {
        icon: <Award size={20} />,
        message: "¡Día perfecto! Completaste todos tus hábitos 🏆",
        color: "primary",
      };
    }
    if (maxStreak >= 7) {
      return {
        icon: <Flame size={20} />,
        message: `¡${maxStreak} días de racha! Sigue así 🔥`,
        color: "orange-500",
      };
    }
    if (consistency >= 80) {
      return {
        icon: <TrendingUp size={20} />,
        message: "Excelente progreso esta semana 💪",
        color: "green-500",
      };
    }
    if (completedCount > 0) {
      return {
        icon: <Target size={20} />,
        message: `${completedCount} de ${totalHabits} completados. ¡Sigue adelante! 🌟`,
        color: "blue-500",
      };
    }
    return {
      icon: <Target size={20} />,
      message: "Comienza tu día completando un hábito 🚀",
      color: "gray-500",
    };
  };

  const insight = getInsight();
  const colorStyle = COLOR_MAP[insight.color] || COLOR_MAP["gray-500"];

  return (
    <div className={`bg-card/60 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3.5 border border-border hover:border-border transition-all duration-500 group ${colorStyle.glow}`}>
      <div className={`p-2.5 rounded-xl ${colorStyle.bg} ${colorStyle.text} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
        {insight.icon}
      </div>
      <p className="text-sm text-text-muted font-medium flex-1 font-display">
        {insight.message}
      </p>
    </div>
  );
};

export default SmartInsights;
