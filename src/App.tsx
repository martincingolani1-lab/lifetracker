import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, LogOut, Utensils, Zap, ListTodo, LayoutDashboard, Settings, Plus } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { UserProvider, useUser } from './store/userStore';
import GeneralOverview from './components/Dashboard/GeneralOverview';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import HabitDashboard from './components/Habits/HabitDashboard';
import HabitMetrics from './components/Habits/HabitMetrics';
import TodoDashboard from './components/Todo/TodoDashboard';
import AppSettings from './components/Settings/AppSettings';
import Auth from './components/Auth/Auth';
import NutritionDashboard from './components/Nutrition/NutritionDashboard';
import QuickMealSheet from './components/Meals/QuickMealSheet';
import Logo from './components/Logo';
import ThemeSlider from './components/UI/ThemeSlider';

// Floating particles background component
const FloatingParticles: React.FC = () => {
  const particles = React.useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${15 + Math.random() * 25}s`,
      delay: `${Math.random() * -20}s`, // Negative delay for immediate start
      tx: `${(Math.random() - 0.5) * 300}px`,
      ty: `${(Math.random() - 0.5) * 300}px`,
      size: `${0.5 + Math.random() * 2.5}px`,
      opacity: 0.2 + Math.random() * 0.6,
    })), []
  );

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            '--duration': p.duration,
            '--delay': p.delay,
            '--tx': p.tx,
            '--ty': p.ty,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
};

// Separate component for content to use context
const AppContent = () => {
  const { selectedDate, setSelectedDate, session, loadingSession, logout, cheatMealsPerWeek, theme, liteMode } = useUser();
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'analytics'>(() =>
    (localStorage.getItem('lt_view') as 'dashboard' | 'analytics') || 'dashboard'
  );
  const [currentModule, setCurrentModule] = React.useState<'home' | 'nutrition' | 'habits' | 'todo' | 'settings'>(() =>
    (localStorage.getItem('lt_module') as 'home' | 'nutrition' | 'habits' | 'todo' | 'settings') || 'home'
  );
  const [quickMealOpen, setQuickMealOpen] = React.useState(false);

  // Sync state to localStorage
  React.useEffect(() => {
    localStorage.setItem('lt_module', currentModule);
  }, [currentModule]);

  React.useEffect(() => {
    localStorage.setItem('lt_view', currentView);
  }, [currentView]);

  // Scroll to top when changing modules or views
  React.useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 10);
  }, [currentModule, currentView]);

  if (loadingSession) {
    return (
      <div className={`min-h-screen theme-${theme} bg-background flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="spinner-premium" />
          <span className="text-sm font-display font-bold text-text-muted tracking-wider uppercase animate-pulse">
            Cargando...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const navItems = [
    { id: 'home' as const, icon: LayoutDashboard, label: 'Home' },
    { id: 'nutrition' as const, icon: Utensils, label: 'Nutrición' },
    { id: 'habits' as const, icon: Zap, label: 'Hábitos' },
    { id: 'todo' as const, icon: ListTodo, label: 'Tareas' },
  ];

  const navColors: Record<string, string> = {
    nutrition: 'text-green-400',
    habits: 'text-yellow-400',
    todo: 'text-blue-400',
  };

  return (
    <div
      className={`min-h-screen theme-${theme} ${liteMode ? 'lite-mode' : ''} bg-background text-text-main selection:bg-primary/30 font-sans pb-safe-area-bottom overflow-x-hidden`}
      style={liteMode ? {} : { transition: 'background-color 0.6s, color 0.6s' }}
    >
      {/* Gradient Mesh Background */}
      {!liteMode && (
        <div className="gradient-mesh">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
      )}

      {/* Floating Particles */}
      {!liteMode && <FloatingParticles />}

      {/* ═══════ HEADER ═══════ */}
      <header
        className="fixed top-0 left-0 w-full z-[70] header-glass px-4 md:px-8 flex items-center"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(64px + env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="relative w-full max-w-[1600px] mx-auto h-full flex items-center justify-between gap-4">

          {/* Left: Logo & Module Nav */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setCurrentModule('home')}
              className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0 group"
            >
              <Logo size={28} className="mr-2 md:mr-1.5 group-hover:scale-110 transition-transform" />
              <h1 className="text-xl md:text-lg font-display font-bold tracking-tighter">
                Life<span className="text-primary font-normal">Tracker</span>
              </h1>
            </button>

            {/* Desktop Nav Pills */}
            <div className="hidden md:flex items-center gap-0.5 bg-card/40 border border-border p-0.5 rounded-xl w-fit overflow-hidden backdrop-blur-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentModule(item.id)}
                    className={`px-3.5 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 relative ${isActive
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-main hover:bg-white/5'
                      }`}
                  >
                    <Icon
                      size={14}
                      className={`transition-colors ${isActive && navColors[item.id] ? navColors[item.id] : ''}`}
                    />
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Actions (PC Only) */}
          <div className="hidden md:flex items-center gap-4 justify-end">
            {(currentModule === 'nutrition' || currentModule === 'habits') && (
              <div className="flex items-center gap-1 mr-2 bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-border">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`text-xs font-display font-bold px-3.5 py-1.5 rounded-lg transition-all duration-300 ${currentView === 'dashboard'
                    ? 'text-black bg-primary shadow-md shadow-primary/20'
                    : 'text-text-muted hover:text-text-main'
                    }`}
                >
                  Diario
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`text-xs font-display font-bold px-3.5 py-1.5 rounded-lg transition-all duration-300 ${currentView === 'analytics'
                    ? 'text-black bg-primary shadow-md shadow-primary/20'
                    : 'text-text-muted hover:text-text-main'
                    }`}
                >
                  Métricas
                </button>
              </div>
            )}

            <div className="flex items-center bg-card/60 rounded-xl border border-border p-0.5 shadow-inner scale-90 origin-right backdrop-blur-sm">
              <button onClick={() => changeDate(-1)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-all active:scale-90">
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center gap-1.5 px-2.5 min-w-[110px] justify-center cursor-pointer" onClick={() => !isToday && setSelectedDate(new Date())}>
                <Calendar size={12} className={isToday ? 'text-primary' : 'text-primary animate-pulse'} />
                <span className={`text-xs font-display font-bold tabular-nums ${isToday ? 'text-text-main' : 'text-primary'}`}>
                  {isToday ? 'Hoy' : selectedDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                </span>
              </div>
              <button onClick={() => changeDate(1)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-all active:scale-90">
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="h-6 w-px bg-white/10 mx-1" />

            <div className="flex items-center gap-1">
              <ThemeSlider />
              <button onClick={() => setCurrentModule('settings')} className="p-2 rounded-lg text-text-muted hover:text-primary transition-all active:scale-90">
                <Settings size={18} />
              </button>
              <button onClick={logout} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all active:scale-90">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Header Right */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <button
              onClick={() => setCurrentModule(currentModule === 'settings' ? 'home' : 'settings')}
              className={`p-2 rounded-full transition-all active:scale-90 ${currentModule === 'settings'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-text-muted/5 text-text-muted active:text-primary active:bg-primary/10'
                }`}
            >
              <Settings size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* 📅 Mobile-Only Top Date Bar (integrated below header) */}
      <div
        className="md:hidden fixed left-0 right-0 z-[50] header-glass border-b border-white/5 py-1.5 shadow-lg shadow-black/10 animate-fade-down"
        style={{ top: 'calc(64px + env(safe-area-inset-top, 0px))' }}
      >
        <div className="px-6 flex items-center justify-between">
          <button onClick={() => changeDate(-1)} className="p-1.5 text-text-muted active:text-primary active:scale-95 transition-all">
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => !isToday && setSelectedDate(new Date())}
            className={`flex flex-col items-center justify-center min-w-[120px] transition-all ${!isToday ? 'scale-105' : ''}`}
          >
            <div className="flex items-center gap-1.5">
              {!isToday && <Calendar size={10} className="text-primary animate-pulse" />}
              <span className={`text-[13px] font-display font-black tracking-tight ${isToday ? 'text-text-main' : 'text-primary'}`}>
                {isToday ? 'Hoy' : selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-display font-medium opacity-80 uppercase tracking-widest">
              {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </span>
          </button>
          <button onClick={() => changeDate(1)} className="p-1.5 text-text-muted active:text-primary active:scale-95 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>


      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-display)',
            boxShadow: '0 16px 48px -12px rgba(0,0,0,0.3), 0 0 0 1px rgba(var(--primary-rgb), 0.05)',
            backdropFilter: 'blur(20px)',
          },
          success: {
            iconTheme: {
              primary: 'var(--primary)',
              secondary: 'var(--bg-card)',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'var(--bg-card)',
            },
          },
        }}
      />

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="w-full md:w-[133.33%] px-4 md:px-6 pt-[calc(10rem+env(safe-area-inset-top,0px))] md:pt-32 pb-[calc(10rem+env(safe-area-inset-bottom,20px))] md:pb-6 relative z-10 space-y-4 md:scale-75 md:origin-top-left">
        {/* Breadcrumbs */}
        {currentModule !== 'home' && (
          <nav className="flex items-center gap-2 text-[10px] md:text-sm text-text-muted mb-4 overflow-x-auto whitespace-nowrap pb-2 animate-fade-up" aria-label="Breadcrumb">
            <button
              onClick={() => setCurrentModule('home')}
              className="hover:text-primary transition-colors font-medium flex-shrink-0"
            >
              Home
            </button>
            <ChevronRight size={12} className="flex-shrink-0 opacity-40" />
            <span className="text-text-main font-display font-bold flex-shrink-0">
              {currentModule === 'nutrition' ? 'Nutrición' :
                currentModule === 'habits' ? 'Hábitos' :
                  currentModule === 'todo' ? 'Tareas' : 'Configuración'}
            </span>
            {currentModule === 'nutrition' && currentView === 'analytics' && (
              <>
                <ChevronRight size={12} className="flex-shrink-0 opacity-40" />
                <span className="text-primary font-display font-bold flex-shrink-0">Métricas</span>
              </>
            )}
          </nav>
        )}

        {/* Content with Page Transition */}
        <div key={`${currentModule}-${currentView}`} className="page-transition">
          {currentModule === 'home' ? (
            <GeneralOverview setModule={setCurrentModule} />
          ) : currentModule === 'habits' ? (
            currentView === 'dashboard' ? <HabitDashboard /> : <HabitMetrics />
          ) : currentModule === 'todo' ? (
            <TodoDashboard />
          ) : currentModule === 'settings' ? (
            <AppSettings />
          ) : (
            currentView === 'dashboard' ? <NutritionDashboard /> : <AnalyticsDashboard />
          )}
        </div>
      </main>


      {/* ═══════ MOBILE BOTTOM NAV ═══════ */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-card border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
      >

        {/* Main Nav — solid, labeled, with center FAB */}
        <div className="px-2 py-1.5 flex items-center justify-around relative">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentModule(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-200 ${isActive
                  ? 'text-primary'
                  : 'text-text-muted active:text-text-main'
                  }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] mt-0.5 font-display font-semibold ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  {item.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </button>
            );
          })}

          {/* Center FAB — Quick Meal */}
          <div className="flex flex-col items-center justify-center -mt-8 relative z-10 w-16">
            {/* Background 'Bridge' Glow */}
            <div className="absolute -top-1 w-14 h-14 bg-primary/20 rounded-full blur-xl animate-fab-glow pointer-events-none" />

            <button
              onClick={() => setQuickMealOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-primary/40 active:scale-90 transition-all ring-[5px] ring-card animate-fab-float relative"
            >
              {/* Internal shine effect */}
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 active:opacity-100 transition-opacity" />
              <Plus size={24} strokeWidth={3} className="text-black drop-shadow-sm" />
            </button>
            <span className="text-[10px] mt-1 font-display font-black text-primary uppercase tracking-wider">Comida</span>
          </div>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentModule(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-200 ${isActive
                  ? 'text-primary'
                  : 'text-text-muted active:text-text-main'
                  }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] mt-0.5 font-display font-semibold ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  {item.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Meal Bottom Sheet */}
      <QuickMealSheet isOpen={quickMealOpen} onClose={() => setQuickMealOpen(false)} />

      <div className="fixed bottom-2 right-4 text-[10px] text-gray-700 pointer-events-none opacity-30 font-display">
        v2.0 — {cheatMealsPerWeek}/sem
      </div>
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
