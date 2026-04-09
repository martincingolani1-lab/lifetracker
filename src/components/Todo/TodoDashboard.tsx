import React, { useState, useEffect } from "react";
import { useUser } from "../../store/userStore";
import { motion, AnimatePresence } from "framer-motion";

const TodoDashboard: React.FC = () => {
  const {
    todoList,
    addTodo,
    toggleTodo,
    deleteTodo,
    todoCategories,
    addTodoCategory,
    deleteTodoCategory,
  } = useUser();

  const [isAdding, setIsAdding] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [category, setCategory] = useState<string>("personal");

  useEffect(() => {
    if (todoCategories?.length > 0 && !todoCategories.find(c => c.id === category)) {
      setCategory(todoCategories[0].id);
    }
  }, [todoCategories, category]);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addTodo(newText, category);
    setNewText('');
    setIsAdding(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const colors = ['text-blue-400', 'text-purple-400', 'text-pink-400', 'text-orange-400', 'text-green-400', 'text-yellow-400'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    addTodoCategory({
      label: newCategoryName,
      icon: 'label',
      color: randomColor
    });
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const sortedTodos = [...todoList].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) return a.priority ? -1 : 1;
    return 0;
  });

  const completedCount = todoList.filter(t => t.completed).length;
  const progress = todoList.length > 0 ? (completedCount / todoList.length) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 font-sans text-text-main pb-20">
      {/* LEFT COLUMN */}
      <div className="lg:col-span-5 flex flex-col gap-8">
        <div className="animate-fade-up">
          <h1 className="text-4xl lg:text-5xl font-display font-black leading-tight text-text-main tracking-tighter">
            Tus Pendientes, <br /> <span className="text-text-muted/40">Organizados.</span>
          </h1>
        </div>

        {/* Progress Card */}
        <div className="relative p-8 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl overflow-hidden group hover-lift animate-fade-up stagger-2">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/15 blur-[60px] rounded-full pointer-events-none group-hover:bg-primary/25 transition-colors duration-700" />
          <div className="flex items-center gap-3 mb-4 text-primary font-display font-bold tracking-wide text-sm">
            <span className="material-icons-round">analytics</span>
            <span>PROGRESO DEL DÍA</span>
          </div>
          <p className="text-xl lg:text-2xl leading-relaxed mb-8 text-text-main font-display font-medium">
            Has completado <span className="text-gradient-gold font-bold">{completedCount} de {todoList.length}</span> tareas.
            {progress === 100 && todoList.length > 0 ? " ¡Día perfecto!" : " ¡Vamos por la siguiente!"}
          </p>
          <div className="relative h-2.5 w-full bg-text-muted/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-amber-400 to-yellow-300 rounded-full progress-shine"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-4 animate-fade-up stagger-3">
          <div className="grid grid-cols-2 gap-3">
            {(todoCategories || []).map(cat => (
              <div key={cat.id} className="relative group bg-card/60 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-border hover:border-border transition-all duration-300 hover-lift">
                <span className={`material-icons-round ${cat.color}`}>{cat.icon}</span>
                <div className="text-xs font-display font-bold uppercase tracking-wider text-text-muted flex-1">{cat.label}</div>
                {!cat.isDefault && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTodoCategory(cat.id); }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-white/10 p-1 rounded-lg transition-all duration-300"
                  >
                    <span className="material-icons-round text-sm">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isAddingCategory ? (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-primary transition-all duration-300 bg-card/30 ripple-container"
            >
              <span className="material-icons-round text-lg">add</span>
              <span className="font-display font-medium">Nueva Categoría</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border flex flex-col gap-3 animate-fade-in-scale">
              <input
                autoFocus
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Nombre de categoría..."
                className="w-full bg-background rounded-xl px-3 py-2 text-sm text-text-main border border-border focus:border-primary outline-none font-display transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.1)]"
              />
              <div className="flex gap-2">
                <button onClick={() => setIsAddingCategory(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-display font-medium transition-colors">Cancelar</button>
                <button onClick={handleAddCategory} className="flex-1 py-2 bg-primary text-black hover:brightness-110 rounded-xl text-xs font-display font-bold transition-all">Crear</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2 animate-fade-up stagger-2">
          <h2 className="text-2xl font-display font-bold text-text-main tracking-tight">Tareas de Hoy</h2>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {todoList.length === 0 && (
              <div className="text-center py-20 bg-card/40 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-border">
                <span className="material-icons-round text-5xl text-text-muted/20 mb-4">task_alt</span>
                <p className="text-text-muted font-display">No tienes tareas pendientes para hoy.</p>
              </div>
            )}
            {sortedTodos.map((todo, i) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -10 }}
                transition={{ delay: i * 0.03 }}
                className={`group p-4 rounded-2xl flex items-center justify-between shadow-sm border transition-all duration-300 relative overflow-hidden ${todo.completed
                    ? 'bg-primary/5 border-primary/15 opacity-70'
                    : 'bg-card/60 backdrop-blur-sm border-border hover:border-primary/30 hover-lift'
                  }`}
              >
                <div className="flex items-center gap-4 relative z-10 flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${todo.completed
                        ? 'bg-primary border-transparent text-black shadow-md shadow-primary/20'
                        : 'border-text-muted/20 hover:border-primary hover:shadow-[0_0_12px_rgba(var(--primary-rgb),0.2)]'
                      }`}
                  >
                    {todo.completed && <span className="material-icons-round text-sm animate-check-pop">check</span>}
                  </button>
                  <div className="flex-1">
                    <span className={`text-lg font-display transition-all duration-300 ${todo.completed ? 'text-text-muted line-through' : 'text-text-main'}`}>
                      {todo.text}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {todo.priority && !todo.completed && (
                        <span className="text-[10px] font-display font-bold uppercase tracking-widest text-orange-400 flex items-center gap-1">
                          <span className="material-icons-round text-[10px]">priority_high</span> Prioridad (Ayer)
                        </span>
                      )}
                      <span className={`text-[10px] font-display font-bold uppercase tracking-widest ${(todoCategories || []).find(c => c.id === todo.category)?.color}`}>
                        {(todoCategories || []).find(c => c.id === todo.category)?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300 relative z-10 opacity-0 group-hover:opacity-100"
                >
                  <span className="material-icons-round">delete</span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Task */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="group relative w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-all duration-300 flex items-center justify-center gap-3 mt-4 ripple-container"
          >
            <span className="font-display font-medium text-text-muted group-hover:text-primary transition-colors duration-300">Agregar nueva tarea</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-black shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:shadow-primary/40 transition-all duration-300">
              <span className="material-icons-round">add</span>
            </div>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="p-6 rounded-[2rem] bg-card/80 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/5"
          >
            <div className="flex flex-col gap-4">
              <input
                autoFocus
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="¿Qué necesitas hacer hoy?"
                className="w-full bg-background rounded-xl px-4 py-3 text-text-main font-display border border-border focus:border-primary outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.1)]"
              />
              <div className="flex flex-wrap gap-2">
                {(todoCategories || []).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider border transition-all duration-300 ${category === cat.id
                        ? 'bg-primary/15 border-primary/30 text-primary shadow-sm'
                        : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-display font-medium transition-all duration-300">Cancelar</button>
                <button onClick={handleAdd} className="flex-1 py-3 bg-gradient-to-r from-primary to-amber-500 hover:brightness-110 text-black font-display font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98]">Agregar Tarea</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TodoDashboard;
