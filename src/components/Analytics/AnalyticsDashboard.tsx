import React, { useEffect, useState } from 'react';
import { useUser } from '../../store/userStore';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    LabelList
} from 'recharts';
import { TrendingUp, Utensils, Award, Droplets, Pill } from 'lucide-react';
import type { WeeklyHistoryData } from '../../types';

const AnalyticsDashboard: React.FC = () => {
    const { getWeeklyHistory } = useUser();
    const [data, setData] = useState<WeeklyHistoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const history = await getWeeklyHistory(365);
            setData(history);
            setLoading(false);
        };
        fetchHistory();
    }, [getWeeklyHistory]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Process data - Exclude TODAY for all calculations
    const todayStr = new Date().toISOString().split('T')[0];
    const baseData = data.filter(d => d.date !== todayStr).map(d => {
        const dateObj = new Date(d.date + 'T12:00:00');
        const totalMacros = (d.protein || 0) + (d.carbs || 0) + (d.fats || 0) || 1;
        return {
            ...d,
            dateObj,
            displayName: dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
            proteinPct: Math.round(((d.protein || 0) / totalMacros) * 100),
            carbsPct: Math.round(((d.carbs || 0) / totalMacros) * 100),
            fatsPct: Math.round(((d.fats || 0) / totalMacros) * 100),
            supplementPct: d.totalSupplements > 0 ? Math.round((d.supplementsTaken / d.totalSupplements) * 100) : 0,
        };
    });

    // Weight data (Last 30 days)
    const weightData = baseData.slice(-30);

    // Recent data (Last 14 days) for general metrics
    const calorieData = baseData.slice(-14);

    // Averages (using recent 14 days)
    const avgCalories = calorieData.length > 0
        ? Math.round(calorieData.reduce((acc, d) => acc + d.calories, 0) / calorieData.length)
        : 0;

    const avgWater = calorieData.length > 0
        ? (calorieData.reduce((acc, d) => acc + d.water, 0) / calorieData.length).toFixed(1)
        : '0';

    const supplementStats = calorieData.reduce((acc, d) => {
        acc.taken += d.supplementsTaken || 0;
        acc.total += d.totalSupplements || 0;
        return acc;
    }, { taken: 0, total: 0 });

    const supplementConsistency = supplementStats.total > 0
        ? Math.round((supplementStats.taken / supplementStats.total) * 100)
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-text-main tracking-tighter flex items-center gap-2">
                    <TrendingUp className="text-primary" />
                    Análisis de Progreso
                </h2>
                <p className="text-text-muted font-medium italic">Datos históricos (excluyendo hoy)</p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Utensils size={16} className="text-orange-500" />
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Promedio Calorías</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-text-main">{avgCalories}</span>
                        <span className="text-xs font-bold text-text-muted">kcal / día</span>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Droplets size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Promedio Agua</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-text-main">{avgWater}</span>
                        <span className="text-xs font-bold text-text-muted">L / día</span>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Pill size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Consistencia Suplementos</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-text-main">{supplementConsistency}%</span>
                        <span className="text-xs font-bold text-text-muted">total</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calories Area Chart */}
                <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl">
                    <h3 className="font-bold text-text-main mb-6 uppercase tracking-widest text-sm text-center">Calorías Totales</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={calorieData}>
                                <defs>
                                    <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="displayName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '16px', fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey="calories" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorKcal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Macros Breakdown */}
                <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl">
                    <h3 className="font-bold text-text-main mb-6 uppercase tracking-widest text-sm text-center">Distribución de Macros (%)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={calorieData} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="displayName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Bar dataKey="proteinPct" stackId="a" fill="#a855f7">
                                    <LabelList dataKey="proteinPct" position="center" fill="#fff" fontSize={9} fontWeight="black" formatter={(val: any) => Number(val) > 10 ? `${val}%` : ''} />
                                </Bar>
                                <Bar dataKey="carbsPct" stackId="a" fill="#3b82f6">
                                    <LabelList dataKey="carbsPct" position="center" fill="#fff" fontSize={9} fontWeight="black" formatter={(val: any) => Number(val) > 10 ? `${val}%` : ''} />
                                </Bar>
                                <Bar dataKey="fatsPct" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="fatsPct" position="center" fill="#fff" fontSize={9} fontWeight="black" formatter={(val: any) => Number(val) > 10 ? `${val}%` : ''} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /><span className="text-[8px] font-black text-text-muted uppercase">Prot</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[8px] font-black text-text-muted uppercase">Carb</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[8px] font-black text-text-muted uppercase">Grasa</span></div>
                    </div>
                </div>

                {/* Water Consumption Chart */}
                <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl">
                    <h3 className="font-bold text-text-main mb-6 uppercase tracking-widest text-sm text-center">Consumo de Agua (L)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={calorieData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="displayName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '16px', fontSize: '10px' }}
                                />
                                <Bar dataKey="water" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                                    <LabelList dataKey="water" position="top" fill="var(--text-main)" fontSize={10} fontWeight="black" formatter={(val: any) => `${val}L`} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Supplement Consistency Chart */}
                <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl">
                    <h3 className="font-bold text-text-main mb-6 uppercase tracking-widest text-sm text-center">Consistencia Suplementos</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={calorieData}>
                                <XAxis
                                    dataKey="displayName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            return (
                                                <div className="bg-card/95 backdrop-blur-xl border border-border p-3 rounded-xl shadow-2xl text-[10px]">
                                                    <p className="font-black text-text-muted uppercase mb-1">{d.displayName}</p>
                                                    <p className="text-text-main font-bold">{d.supplementsTaken} de {d.totalSupplements} suplementos</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="stepAfter"
                                    dataKey="supplementPct"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fill="#10b981"
                                    fillOpacity={0.1}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weight Trend Chart */}
                <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-text-main uppercase tracking-widest text-sm">Evolución de Peso (30 días)</h3>
                        {weightData.some(d => d.weight) && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Último:</span>
                                <span className="text-xs font-black text-primary">
                                    {[...weightData].reverse().find(d => d.weight)?.weight} kg
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weightData}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                                    minTickGap={30}
                                    tickFormatter={(str) => {
                                        const date = new Date(str + 'T12:00:00');
                                        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
                                    }}
                                    dy={10}
                                />
                                <YAxis
                                    hide
                                    domain={['dataMin - 2', 'dataMax + 2']}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '16px', fontSize: '10px' }}
                                    formatter={(value: any) => [`${value} kg`, 'Peso']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#facc15"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorWeight)"
                                    connectNulls={true}
                                    dot={{ fill: '#facc15', strokeWidth: 2, r: 4, stroke: 'var(--bg-card)' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>


            </div>

            {/* AI Insight Card */}
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2.5rem] flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shrink-0">
                    <Award size={24} />
                </div>
                <div>
                    <h4 className="font-black text-text-main text-sm uppercase tracking-wider mb-1">Coach Insight</h4>
                    <p className="text-sm text-text-muted italic leading-relaxed">
                        {calorieData.length > 0
                            ? `Has mantenido un promedio de ${avgCalories} kcal y ${avgWater}L de agua. Tu consistencia con la suplementación es del ${supplementConsistency}%, lo cual es ${supplementConsistency > 80 ? 'excelente' : 'mejorable'}. ¡Sigue así!`
                            : 'Registra al menos un día completo para recibir feedback personalizado.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
