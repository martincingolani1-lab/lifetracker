import React, { useState, useEffect } from 'react';
import { useUser } from '../../store/userStore';
import type { Habit } from '../../types';

import {
    Zap,
    Plus,
    Flame,
    CheckCircle2,
    X,
    Save,
    Clock,
    Edit2,
    Trash2,
    GripVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// DnD Kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableHabitItemProps {
    habit: Habit;
    date: Date;
    isToday: boolean;
    isScheduled: boolean;
    isTodayBoard: boolean;
    handleValueChange: (date: Date, id: string, val: any) => void;
    handleEdit: (habit: Habit) => void;
    onDelete: (habit: Habit) => void;
}

const SortableHabitItem: React.FC<SortableHabitItemProps> = ({
    habit, date, isToday, isScheduled, isTodayBoard, handleValueChange, handleEdit, onDelete
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: habit.id, disabled: !isTodayBoard });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        position: 'relative' as any,
    };

    const habitColor = habit.color || 'var(--primary)';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`w-full py-2.5 px-4 rounded-[1.25rem] border flex items-center gap-2 group text-left relative overflow-hidden transition-[opacity,border-color,background-color] duration-300 ${habit.completed
                ? 'bg-white/[0.01] border-white/[0.04] opacity-50'
                : !isScheduled
                    ? 'bg-background/20 opacity-40 cursor-not-allowed grayscale'
                    : 'bg-background/40 hover:bg-background/60 shadow-sm border-border hover:border-border'
                } ${isDragging ? 'shadow-2xl opacity-100 ring-2 ring-primary/50 scale-[1.02]' : ''}`}
        >
            {/* Strike-through Line */}
            {habit.completed && (
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/15 z-10 pointer-events-none animate-in slide-in-from-left duration-500" />
            )}

            {/* Left Accent Border */}
            <div
                className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-500"
                style={{
                    backgroundColor: habitColor,
                    opacity: habit.completed ? 0.3 : 0.25,
                    boxShadow: habit.completed ? `0 0 12px ${habitColor}30` : 'none'
                }}
            />

            {isTodayBoard && (
                <div
                    {...attributes}
                    {...listeners}
                    className="p-1 cursor-grab active:cursor-grabbing text-text-muted/20 hover:text-text-muted/60 transition-colors duration-300 ml-1 z-20"
                >
                    <GripVertical size={16} />
                </div>
            )}

            <button
                disabled={!isScheduled || habit.type !== 'regular'}
                onClick={() => {
                    if (habit.type === 'regular' || !habit.type) {
                        handleValueChange(date, habit.id, habit.completed ? 'false' : 'true');
                    }
                }}
                style={{
                    backgroundColor: habit.completed ? `${habitColor}20` : `${habitColor}12`,
                    borderColor: habit.completed ? 'transparent' : `${habitColor}25`,
                }}
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 relative overflow-hidden z-20 ${!isScheduled ? '' : 'hover:scale-110 active:scale-90'} ${habit.completed
                    ? 'text-black opacity-60'
                    : !isScheduled
                        ? 'bg-white/5 text-text-muted border border-border opacity-30'
                        : 'text-text-muted'
                    } ${habit.type !== 'regular' ? 'cursor-default' : ''}`}
            >
                <span className={`text-xl filter drop-shadow-sm transition-all duration-500 ${habit.completed ? 'scale-75 opacity-20 grayscale' : ''}`}>
                    {habit.emoji || '✨'}
                </span>
                {habit.completed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-text-main/40 relative z-10 animate-check-pop" />
                    </div>
                )}
            </button>
            <div className="min-w-0 flex-1 z-20">
                <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-display font-bold tracking-tight truncate transition-all duration-500 ${habit.completed ? 'text-text-muted line-through opacity-30' : 'text-text-main'}`}>
                        {habit.name}
                        {!isScheduled && <span className="ml-2 text-[8px] opacity-60 uppercase tracking-tighter font-sans">(No hoy)</span>}
                    </h4>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 text-orange-500 font-display font-bold text-[10px] transition-opacity duration-500 ${habit.completed ? 'opacity-20' : 'opacity-100'}`}>
                            <Flame size={12} fill="currentColor" />
                            <span>{habit.streak || 0}</span>
                        </div>
                        {isToday && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(habit); }}
                                    className="p-1 hover:bg-white/10 rounded-lg text-text-muted hover:text-primary transition-all duration-300"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(habit); }}
                                    className="p-1 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-400 transition-all duration-300"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {habit.type !== 'regular' && (
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div className="flex flex-1 items-center gap-2">
                            {habit.type === 'time' && (
                                <div className="flex items-center gap-2 w-full">
                                    <div className={`flex items-center gap-1.5 px-2 py-1 bg-background/50 rounded-lg border border-border transition-colors ${isScheduled ? 'focus-within:border-primary/50' : ''}`}>
                                        <Clock size={12} className="text-text-muted" />
                                        <input
                                            disabled={!isScheduled}
                                            type="time"
                                            value={habit.value || ''}
                                            onChange={(e) => handleValueChange(date, habit.id, e.target.value)}
                                            className="bg-transparent border-none outline-none text-[11px] font-display font-bold text-text-main w-20 [color-scheme:dark] disabled:opacity-50"
                                        />
                                    </div>
                                    {habit.completed && (
                                        <span className="text-[10px] font-display font-black uppercase tracking-tighter text-primary">Completado</span>
                                    )}
                                </div>
                            )}
                            {habit.type === 'numeric' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        disabled={!isScheduled}
                                        type="number"
                                        step="any"
                                        value={habit.value ?? ''}
                                        onChange={(e) => handleValueChange(date, habit.id, e.target.value)}
                                        className="w-24 bg-white/10 border border-border rounded-lg px-2 py-1.5 text-sm font-display font-black text-white placeholder:text-white/20 outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="text-[10px] text-text-muted font-display font-bold">/ {habit.target} {habit.unit}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const HabitDashboard: React.FC = () => {
    const {
        habits,
        selectedDate,
        addHabit,
        updateHabit,
        deleteHabit,
        restoreHabit,
        updateHabitsForDate,
        getHabitsForDateRange,
        reorderHabits
    } = useUser();
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitTarget, setNewHabitTarget] = useState(1);
    const [newHabitUnit, setNewHabitUnit] = useState('');
    const [newHabitType, setNewHabitType] = useState<'regular' | 'numeric' | 'time'>('regular');
    const [newHabitEmoji, setNewHabitEmoji] = useState('✨');
    const [newHabitColor, setNewHabitColor] = useState('#facc15');
    const [newHabitFrequency, setNewHabitFrequency] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const EMOJIS = [
        '✨', '🔥', '💧', '🥗', '⚡', '🚶', '🍎', '🏋️', '📚', '🛌', '🧘', '🚭', '💊', '💪', '🧠', '⚖️',
        '☀️', '🌑', '🚿', '☕', '🍵', '🥦', '🏃', '🏊', '🚴', '🎸', '🎨', '📝', '💻', '📱', '⏳', '📅',
        '🎯', '💎', '🌱', '🌲', '🌊', '🧗', '🛹', '🏀', '⚽', '🎾', '♟️', '🕹️', '🧼', '👔', '🧹', '🛒', '💰', '📈'
    ];
    const COLORS = [
        '#facc15', '#eab308', '#10b981', '#22c55e', '#84cc16', '#3b82f6', '#06b6d4', '#6366f1',
        '#ef4444', '#f43f5e', '#a855f7', '#8b5cf6', '#d946ef', '#f97316', '#fb923c', '#ec4899', '#f472b6',
        '#94a3b8', '#71717a'
    ];

    // Historical data state
    const [historicalHabits, setHistoricalHabits] = useState<Record<string, Habit[]>>({});

    // Calculate the 3 dates to show
    const datesToShow = [0, 1, 2].map(offset => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - offset);
        return d;
    });

    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isHabitScheduledForDate = (habit: Habit, date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[date.getDay()];
        return habit.frequency.includes(dayName);
    };

    // Fetch history — use exact date range to handle cross-month boundaries
    // (e.g. today = March 1, ayer = Feb 28, anteayer = Feb 27)
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const endDate = datesToShow[0];   // selectedDate (today)
                const startDate = datesToShow[datesToShow.length - 1]; // 2 days before
                const rangeStats = await getHabitsForDateRange(startDate, endDate);
                const historyMap: Record<string, Habit[]> = {};
                rangeStats.forEach(stat => {
                    historyMap[stat.date] = stat.habits;
                });
                setHistoricalHabits(historyMap);
            } catch (err) {
                console.error("Error loading historical habits:", err);
            }
        };
        fetchHistory();
    }, [selectedDate]);

    const handleValueChange = async (date: Date, habitId: string, newValue: string | number) => {
        const dateKey = formatDateKey(date);

        const dayHabits = dateKey === formatDateKey(selectedDate)
            ? habits
            : (historicalHabits[dateKey] || habits.map(h => ({ ...h, completed: false, streak: 0, value: h.type === 'numeric' ? 0 : '' })));

        const habitToUpdate = dayHabits.find(h => h.id === habitId);
        if (habitToUpdate && !isHabitScheduledForDate(habitToUpdate, date)) {
            toast.error('Este hábito no está programado para hoy');
            return;
        }

        const newHabits = dayHabits.map(h => {
            if (h.id === habitId) {
                let isCompleted = false;
                if (h.type === 'numeric') {
                    const numVal = Number(newValue);
                    // Completed if not empty AND (if target exists, meet it; otherwise, any value > 0)
                    isCompleted = newValue !== '' && (h.target ? numVal >= h.target : numVal > 0);
                } else if (h.type === 'time') {
                    isCompleted = !!newValue && newValue !== '';
                } else if (h.type === 'regular' || !h.type) {
                    isCompleted = newValue === 'true';
                }

                let newStreak = h.streak || 0;
                if (isCompleted && !h.completed) newStreak += 1;
                if (!isCompleted && h.completed) newStreak = Math.max(0, newStreak - 1);

                return { ...h, value: newValue, completed: isCompleted, streak: newStreak };
            }
            return h;
        });

        if (dateKey !== formatDateKey(selectedDate)) {
            setHistoricalHabits(prev => ({ ...prev, [dateKey]: newHabits }));
        }

        await updateHabitsForDate(date, newHabits);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = habits.findIndex((h) => h.id === active.id);
            const newIndex = habits.findIndex((h) => h.id === over.id);
            const newOrder = arrayMove(habits, oldIndex, newIndex);
            reorderHabits(newOrder);
        }
    };

    const handleEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setNewHabitName(habit.name);
        setNewHabitTarget(habit.target || 1);
        setNewHabitUnit(habit.unit || '');
        setNewHabitType(habit.type);
        setNewHabitEmoji(habit.emoji || '✨');
        setNewHabitColor(habit.color || '#facc15');
        setNewHabitFrequency(habit.frequency);
        setIsAdding(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;

        if (editingHabit) {
            updateHabit(editingHabit.id, {
                name: newHabitName,
                target: newHabitTarget,
                unit: newHabitUnit,
                type: newHabitType,
                emoji: newHabitEmoji,
                color: newHabitColor,
                frequency: newHabitFrequency
            });
            toast.success('Hábito actualizado');
        } else {
            addHabit({
                name: newHabitName,
                target: newHabitTarget,
                unit: newHabitUnit,
                emoji: newHabitEmoji,
                color: newHabitColor,
                frequency: newHabitFrequency,
                type: newHabitType,
                archived: false
            });
            toast.success('Hábito creado');
        }

        closeModal();
    };

    const closeModal = () => {
        setNewHabitName('');
        setNewHabitUnit('');
        setNewHabitTarget(1);
        setNewHabitType('regular');
        setNewHabitEmoji('✨');
        setNewHabitColor('#facc15');
        setNewHabitFrequency(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        setEditingHabit(null);
        setIsAdding(false);
    };

    const handleDelete = (habit: Habit) => {
        const index = habits.findIndex(h => h.id === habit.id);
        const savedHabit = { ...habit };
        deleteHabit(habit.id);
        toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>Hábito <b>{savedHabit.emoji} {savedHabit.name}</b> eliminado</span>
                <button
                    onClick={() => {
                        restoreHabit(savedHabit, index);
                        toast.dismiss(t.id);
                        toast.success('Hábito restaurado');
                    }}
                    style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        background: 'var(--primary)',
                        color: '#000',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-display)'
                    }}
                >
                    Deshacer
                </button>
            </div>
        ), { duration: 5000, icon: '🗑️' });
    };

    return (
        <div className="space-y-6 pr-4 md:pr-12">
            <div className="flex flex-col gap-2 animate-fade-up">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-black text-text-main tracking-tighter flex items-center gap-2">
                        <Zap className="text-yellow-400" />
                        Hábitos Diarios
                    </h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="p-2.5 bg-gradient-to-br from-primary to-amber-500 text-black rounded-xl hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                </div>
                <p className="text-sm text-text-muted font-display">Visualiza y completa hábitos de hoy y días anteriores.</p>
            </div>

            {/* Board Layout — Mobile: Today first; Desktop: chronological left-to-right */}
            <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-0 gap-6 items-start">
                {datesToShow.map((date, idx) => {
                    const dateKey = formatDateKey(date);
                    const actsAsToday = dateKey === formatDateKey(selectedDate);
                    const isToday = idx === 0;

                    const dayHabits = actsAsToday
                        ? habits
                        : (historicalHabits[dateKey] || habits.map(h => ({ ...h, completed: false, value: h.type === 'numeric' ? 0 : '' })));

                    // Desktop order: anteayer(0), ayer(1), hoy(2) — reversed with CSS order
                    const desktopOrder = idx === 0 ? 'lg:order-3' : idx === 1 ? 'lg:order-2' : 'lg:order-1';

                    return (
                        <div
                            key={dateKey}
                            className={`flex flex-col h-full rounded-[2.5rem] p-6 lg:p-8 relative animate-fade-up ${desktopOrder} ${isToday
                                ? `lg:col-span-2 bg-card border border-primary/20 shadow-[0_0_40px_-20px_rgba(var(--primary-rgb),0.15)] scale-[1.02] lg:scale-105 z-30 lg:-ml-12 stagger-2`
                                : idx === 1
                                    ? 'lg:col-span-1 bg-card/60 border border-border opacity-50 hover:opacity-100 transition-opacity duration-300 z-20 lg:-ml-12 stagger-1'
                                    : 'lg:col-span-1 bg-card/60 border border-border opacity-50 hover:opacity-100 transition-opacity duration-300 z-10'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <h3 className={`text-xl font-display font-black transition-colors ${isToday ? 'text-gradient-gold' : 'text-text-main'}`}>
                                        {idx === 0 ? 'Hoy' : idx === 1 ? 'Ayer' : 'Anteayer'}
                                    </h3>
                                    <span className="text-[10px] font-display font-black text-text-muted uppercase tracking-[0.2em] mt-1 opacity-50">
                                        {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                {dayHabits.length > 0 && (() => {
                                    const scheduledHabits = dayHabits.filter(h => isHabitScheduledForDate(h, date));
                                    const completedScheduled = scheduledHabits.filter(h => h.completed).length;
                                    return (
                                        <div className={`px-3.5 py-1.5 rounded-xl text-[10px] font-display font-black uppercase tracking-widest transition-all duration-300 ${isToday ? 'bg-gradient-to-r from-primary to-amber-500 text-black shadow-lg shadow-primary/20' : 'bg-white/5 text-text-muted'}`}>
                                            {completedScheduled}/{scheduledHabits.length}
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="space-y-2">
                                {dayHabits.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-20">
                                        <Zap size={32} className="mb-2" />
                                        <p className="text-xs font-display font-bold uppercase tracking-widest">Vacio</p>
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={dayHabits.filter(h => !h.archived).map(h => h.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-2">
                                                {dayHabits.filter(h => !h.archived).map(habit => (
                                                    <SortableHabitItem
                                                        key={habit.id}
                                                        habit={habit}
                                                        date={date}
                                                        isToday={isToday}
                                                        isScheduled={isHabitScheduledForDate(habit, date)}
                                                        isTodayBoard={isToday}
                                                        handleValueChange={handleValueChange}
                                                        handleEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal / Form */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={closeModal} />
                    <div className="relative bg-card/95 backdrop-blur-2xl border border-border p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-fade-in-scale gradient-border">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-display font-black text-text-main tracking-tight">
                                    {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
                                </h3>
                                <p className="text-sm text-text-muted font-display">
                                    {editingHabit ? 'Ajusta tus metas' : '¿Qué quieres lograr hoy?'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all duration-300 active:scale-90">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-display font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Nombre</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newHabitName}
                                    onChange={e => setNewHabitName(e.target.value)}
                                    placeholder="Ej. Caminar 10k pasos"
                                    className="w-full bg-background/50 border border-border rounded-xl p-3 text-text-main font-display outline-none focus:border-primary/50 transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.1)]"
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-display font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Tipo de Hábito</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'regular', label: 'Check', icon: <CheckCircle2 size={14} /> },
                                            { id: 'numeric', label: 'Número', icon: <Plus size={14} /> },
                                            { id: 'time', label: 'Horario', icon: <Clock size={14} /> }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setNewHabitType(type.id as any)}
                                                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[10px] font-display font-bold uppercase transition-all duration-300 ${newHabitType === type.id
                                                    ? 'bg-primary text-black border-primary shadow-md shadow-primary/20'
                                                    : 'bg-background/50 border-border text-text-muted hover:border-text-muted'
                                                    }`}
                                            >
                                                {type.icon}
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {newHabitType === 'numeric' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-display font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Meta</label>
                                            <input
                                                type="number"
                                                value={newHabitTarget}
                                                onChange={e => setNewHabitTarget(Number(e.target.value))}
                                                className="w-full bg-background/50 border border-border rounded-xl p-3 text-text-main font-display outline-none focus:border-primary/50 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-display font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Unidad</label>
                                            <input
                                                type="text"
                                                value={newHabitUnit}
                                                onChange={e => setNewHabitUnit(e.target.value)}
                                                placeholder="Ej. pasos"
                                                className="w-full bg-background/50 border border-border rounded-xl p-3 text-text-main font-display outline-none focus:border-primary/50 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-display font-bold text-text-muted uppercase tracking-widest mb-2 block">Días Vigentes</label>
                                    <div className="flex justify-between gap-1">
                                        {[
                                            { id: 'Mon', label: 'L' },
                                            { id: 'Tue', label: 'M' },
                                            { id: 'Wed', label: 'X' },
                                            { id: 'Thu', label: 'J' },
                                            { id: 'Fri', label: 'V' },
                                            { id: 'Sat', label: 'S' },
                                            { id: 'Sun', label: 'D' }
                                        ].map(day => (
                                            <button
                                                key={day.id}
                                                type="button"
                                                onClick={() => {
                                                    setNewHabitFrequency(prev =>
                                                        prev.includes(day.id)
                                                            ? prev.filter(d => d !== day.id)
                                                            : [...prev, day.id]
                                                    );
                                                }}
                                                className={`flex-1 aspect-square rounded-xl text-[10px] font-display font-bold transition-all duration-300 border ${newHabitFrequency.includes(day.id)
                                                    ? 'bg-primary text-black border-primary shadow-md shadow-primary/20'
                                                    : 'bg-background/50 border-border text-text-muted hover:border-text-muted'
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                    {newHabitFrequency.length === 0 && (
                                        <p className="text-[10px] text-red-400 mt-1 font-display font-bold">Selecciona al menos un día</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-display font-bold text-text-muted uppercase tracking-widest mb-2 block">Icono</label>
                                        <div className="flex flex-wrap gap-1.5 p-3 bg-background/50 border border-border rounded-2xl max-h-[120px] overflow-y-auto overflow-x-hidden no-scrollbar">
                                            {EMOJIS.map(e => (
                                                <button
                                                    key={e}
                                                    type="button"
                                                    onClick={() => setNewHabitEmoji(e)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all duration-200 ${newHabitEmoji === e ? 'bg-white/20 scale-110 shadow-lg' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                                                >
                                                    {e}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-display font-bold text-text-muted uppercase tracking-widest mb-2 block">Color</label>
                                        <div className="flex flex-wrap gap-2 p-3 bg-background/50 border border-border rounded-2xl max-h-[120px] overflow-y-auto no-scrollbar">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setNewHabitColor(c)}
                                                    className={`w-6 h-6 rounded-full transition-all duration-200 border-2 shrink-0 ${newHabitColor === c ? 'scale-125 shadow-lg ring-2 ring-white/20' : 'opacity-40 hover:opacity-100'}`}
                                                    style={{ backgroundColor: c, borderColor: newHabitColor === c ? 'white' : 'transparent' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={newHabitFrequency.length === 0}
                                style={{ backgroundColor: newHabitColor, boxShadow: `0 12px 24px -6px ${newHabitColor}40` }}
                                className="w-full text-black font-display font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] hover:brightness-110"
                            >
                                <Save size={18} />
                                {editingHabit ? 'Actualizar Hábito' : 'Guardar Hábito'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitDashboard;
