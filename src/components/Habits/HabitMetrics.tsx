import React, { useEffect, useState } from 'react';
import { useUser } from '../../store/userStore';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Zap, Flame, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import type { MonthlyHabitStats, Habit } from '../../types';

const HabitMetrics: React.FC = () => {
    const { getHabitHistory, habits } = useUser();
    const [history, setHistory] = useState<MonthlyHabitStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getHabitHistory(30);
            setHistory(data);
            setLoading(false);
        };
        fetchStats();
    }, [getHabitHistory]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isHabitScheduledForDate = (habit: Habit, date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[date.getDay()];
        return (habit.frequency || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).includes(dayName);
    };

    // Process 30-day timeline data
    const today = new Date();
    const timelineData = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayLog = history.find(h => h.date === dateStr);

        // Filter habits that were actually scheduled for this day
        const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, d));

        let completedCount = 0;
        if (dayLog) {
            completedCount = dayLog.habits.filter((h: Habit) => {
                // Check if it was completed AND if it was actually scheduled (to be safe)
                const isScheduled = isHabitScheduledForDate(h, d);
                return h.completed && isScheduled;
            }).length;
        }

        const totalScheduled = scheduledHabits.length || 1;
        const percentage = Math.round((completedCount / totalScheduled) * 100);

        return {
            date: d.getDate(),
            fullDate: dateStr,
            percentage,
            count: completedCount,
            intensity: percentage / 100
        };
    });

    // Process Individual Habit Stats
    const habitStats = habits.map((habit: Habit) => {
        // Consistency - Last 7 days
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (i + 1)); // excluding today
            return d;
        });

        const scheduledDays = last7Days.filter(date => isHabitScheduledForDate(habit, date));
        const scheduledCount = scheduledDays.length;

        const completedInScheduled = scheduledDays.filter(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dayLog = history.find(h => h.date === dateStr);
            const found = dayLog?.habits.find((h: Habit) => h.id === habit.id);
            return found?.completed;
        }).length;

        // If not scheduled any day in last 7, consistency is 100% if they were doing it, 0 otherwise? 
        // Usually 100% is fairer if no action was required.
        const consistency = scheduledCount > 0 ? Math.round((completedInScheduled / scheduledCount) * 100) : 100;

        // Streak Calculation
        let currentStreak = 0;
        // Check today first
        if (habit.completed) {
            currentStreak = 1;
            // Then check backwards
            for (let i = 1; i < 30; i++) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayLog = history.find(h => h.date === dateStr);
                const hInLog = dayLog?.habits.find((h: Habit) => h.id === habit.id);

                if (hInLog?.completed) {
                    currentStreak++;
                } else if (dayLog && isHabitScheduledForDate(habit, d)) {
                    // Only break if the habit was scheduled for this day but not completed
                    break;
                }
                // If not scheduled, we just skip this day and keep the streak alive
            }
        } else {
            // Check from yesterday backwards
            for (let i = 1; i < 30; i++) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayLog = history.find(h => h.date === dateStr);
                const hInLog = dayLog?.habits.find((h: Habit) => h.id === habit.id);

                if (hInLog?.completed) {
                    currentStreak++;
                } else if (dayLog && isHabitScheduledForDate(habit, d)) {
                    // Only break if the habit was scheduled for this day but not completed
                    break;
                }
            }
        }

        // Average Value for time-based habits (last 7 days)
        let averageValue = null;
        if (habit.type === 'time' || habit.name.toLowerCase().includes('wake up')) {
            const values = last7Days.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const dayLog = history.find(h => h.date === dateStr);
                const hInLog = dayLog?.habits.find((h: Habit) => h.id === habit.id);
                return hInLog?.value;
            }).filter(v => v !== undefined && v !== null && v !== '');

            // Try to parse as time (HH:mm)
            const timeValues = values.filter(v => typeof v === 'string' && v.includes(':')) as string[];
            if (timeValues.length > 0) {
                const totalMinutes = timeValues.reduce((acc, time) => {
                    const [h, m] = time.split(':').map(Number);
                    return acc + (h * 60) + m;
                }, 0);
                const avgMin = Math.round(totalMinutes / timeValues.length);
                const hh = Math.floor(avgMin / 60);
                const mm = avgMin % 60;
                averageValue = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
            }
            // Fallback to numeric if it's "Wake Up" specifically
            else if (values.length > 0 && habit.name.toLowerCase().includes('wake up')) {
                const numValues = values.map(v => Number(v)).filter(v => !isNaN(v));
                if (numValues.length > 0) {
                    const avg = numValues.reduce((a, b) => a + b, 0) / numValues.length;
                    averageValue = avg % 1 === 0 ? avg.toString() : avg.toFixed(1);
                    if (habit.unit) averageValue += ` ${habit.unit}`;
                }
            }
        }

        return {
            ...habit,
            consistency,
            calculatedStreak: currentStreak,
            averageValue
        };
    });

    // AI Insight logic
    const getAIInsight = () => {
        const avgConsistency = habitStats.reduce((acc: number, h: any) => acc + h.consistency, 0) / (habitStats.length || 1);
        const topHabit = [...habitStats].sort((a, b) => b.consistency - a.consistency)[0];
        const lowHabit = [...habitStats].sort((a, b) => a.consistency - b.consistency)[0];

        if (avgConsistency > 80) {
            return `¡Increíble nivel de disciplina! Tu consistencia promedio es del ${Math.round(avgConsistency)}%. Mantienes un ritmo de élite, especialmente con "${topHabit?.name}".`;
        } else if (avgConsistency > 50) {
            return `Vas por buen camino. Tu consistencia es sólida (${Math.round(avgConsistency)}%). "${topHabit?.name}" es tu fuerte, pero podrías prestar más atención a "${lowHabit?.name}" para equilibrar tu progreso.`;
        } else {
            return `Estamos construyendo las bases. Tu enfoque actual está en "${topHabit?.name}". Intenta establecer una racha mínima de 3 días para "${lowHabit?.name}" esta semana para ganar impulso.`;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-text-main tracking-tighter flex items-center gap-2">
                    <TrendingUp className="text-yellow-400" />
                    Métricas de Hábitos
                </h2>
                <p className="text-text-muted font-medium">Análisis de los últimos 30 días</p>
            </div>

            {/* AI Insight Card */}
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2.5rem] flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center shrink-0 mt-1">
                    <Zap size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-text-main text-sm uppercase tracking-wider mb-1">AI Insight</h4>
                    <p className="text-sm text-text-muted leading-relaxed italic">
                        "{getAIInsight()}"
                    </p>
                </div>
            </div>

            {/* 30-Day Timeline Chart */}
            <div className="bg-card/50 backdrop-blur-xl border border-border p-6 md:p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                            <CalendarIcon size={18} />
                        </div>
                        <h3 className="font-bold text-text-main uppercase tracking-widest text-sm">Línea de Tiempo (30 días)</h3>
                    </div>
                </div>

                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timelineData}>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                interval={2}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-card/95 backdrop-blur-xl border border-border p-3 rounded-xl shadow-2xl">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Día {d.date}</p>
                                                <p className="text-lg font-black text-text-main">{d.percentage}% <span className="text-xs font-normal text-text-muted">completado</span></p>
                                                <p className="text-[10px] font-bold text-primary mt-1">{d.count} hábitos logrados</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="percentage" radius={[4, 4, 4, 4]}>
                                {timelineData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.percentage > 80 ? 'var(--primary)' : entry.percentage > 40 ? 'rgba(250,204,21,0.6)' : 'rgba(250,204,21,0.2)'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Individual Habit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {habitStats.map((habit: any) => (
                    <div
                        key={habit.id}
                        className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl group hover:border-primary/50 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                                    {habit.emoji || '✨'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-main mb-0.5">{habit.name}</h4>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Activo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-text-main leading-none">
                                    {habit.averageValue ? habit.averageValue : habit.calculatedStreak}
                                </span>
                                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-1">
                                    {habit.averageValue ? 'Promedio (7d)' : 'Racha'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Consistencia (7d)</span>
                                    <span className="text-sm font-black text-primary">{habit.consistency}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.3)]"
                                        style={{ width: `${habit.consistency}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1 text-text-muted">
                                    <Flame size={14} className={habit.calculatedStreak > 0 ? 'text-orange-500' : 'text-text-muted/30'} />
                                    <span className="text-[10px] font-bold">Consistencia Pro</span>
                                </div>
                                <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                                    {habit.consistency > 90 ? 'Élite' : habit.consistency > 70 ? 'Sólido' : 'En proceso'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Internal icon proxy to avoid import error if lucide version is old
export default HabitMetrics;
