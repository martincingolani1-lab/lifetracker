import React from "react";
import { useUser } from "../../store/userStore";
import { Palette, Moon, Sun, LogOut, Shield, Zap } from "lucide-react";

const AppSettings: React.FC = () => {
  const { theme, setTheme, liteMode, setLiteMode, logout, deleteAccount } = useUser();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6 md:mb-8 px-1">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1 md:mb-2 text-text-main tracking-tight">
          Configuración
        </h1>
        <p className="text-xs md:text-sm text-text-muted">
          Gestiona tus preferencias e integraciones
        </p>
      </header>

      <div className="grid gap-6">
        {/* Personalization Section */}
        <section className="bg-card p-5 md:p-8 rounded-3xl shadow-xl border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Palette className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-text-main">
                Personalización
              </h2>
              <p className="text-xs md:text-sm text-text-muted">
                Elige el estilo visual que más te guste
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("color")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all ${theme === "color" ? "border-2 border-primary bg-primary/5" : " bg-background hover:bg-text-muted/5"}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#163E3E] -primary flex items-center justify-center text-primary">
                <Palette size={20} />
              </div>
              <div className="text-center">
                <p className="font-bold text-text-main">Modo Color</p>
                <p className="text-[10px] text-text-muted">
                  Teal & Amarillo (Original)
                </p>
              </div>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all ${theme === "dark" ? "border-2 border-primary bg-primary/5" : " bg-background hover:bg-text-muted/5"}`}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-900 -zinc-700 flex items-center justify-center text-zinc-400">
                <Moon size={20} />
              </div>
              <div className="text-center">
                <p className="font-bold text-text-main">Modo Oscuro</p>
                <p className="text-[10px] text-text-muted">
                  Negro absoluto & Amarillo
                </p>
              </div>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all ${theme === "light" ? "border-2 border-primary bg-primary/5" : " bg-background hover:bg-text-muted/5"}`}
            >
              <div className="w-10 h-10 rounded-full bg-white -gray-200 flex items-center justify-center text-primary">
                <Sun size={20} />
              </div>
              <div className="text-center">
                <p className="font-bold text-text-main">Modo Claro</p>
                <p className="text-[10px] text-text-muted">
                  Limpio y brillante
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Performance Section */}
        <section className="bg-card p-5 md:p-8 rounded-3xl shadow-xl border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-text-main">Rendimiento</h2>
              <p className="text-xs md:text-sm text-text-muted">Optimiza la app para tu dispositivo</p>
            </div>
          </div>

          <div className="p-4 bg-background rounded-2xl flex items-center justify-between border border-border/50">
            <div className="flex-1 pr-4">
              <h3 className="text-sm font-bold text-text-main">Modo Lite</h3>
              <p className="text-[10px] md:text-xs text-text-muted">Desactiva animaciones pesadas y efectos visuales complejos. Ideal para ahorrar batería o para teléfonos con pocos recursos.</p>
            </div>
            <button
              onClick={() => setLiteMode(!liteMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${liteMode ? 'bg-primary' : 'bg-text-muted/30'}`}
            >
              <span
                className={`${liteMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
              />
            </button>
          </div>
        </section>

        {/* Privacy & Legal Section */}
        <section className="bg-card p-5 md:p-8 rounded-3xl shadow-xl border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
              <Shield className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-text-main">Privacidad y Legal</h2>
              <p className="text-xs md:text-sm text-text-muted">Tus datos y derechos</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => window.open('/PRIVACY_POLICY.md', '_blank')}
              className="flex items-center justify-between p-4 bg-background hover:bg-text-muted/5 rounded-2xl transition-all"
            >
              <span className="text-sm font-semibold">Política de Privacidad</span>
              <span className="material-icons-round text-text-muted">arrow_forward</span>
            </button>
            <button
              onClick={() => window.open('/MONETIZACION.md', '_blank')}
              className="flex items-center justify-between p-4 bg-background hover:bg-text-muted/5 rounded-2xl transition-all"
            >
              <span className="text-sm font-semibold">Plan de Suscripción</span>
              <span className="material-icons-round text-text-muted">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="bg-card p-5 md:p-8 rounded-3xl shadow-xl border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
              <span className="material-icons-round text-xl md:text-2xl">warning</span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-text-main">Zona de Peligro</h2>
              <p className="text-xs md:text-sm text-text-muted">Acciones destructivas o de reinicio</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Logout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-red-500/5 rounded-2xl border border-red-500/10 gap-4">
              <div>
                <h3 className="font-bold text-red-500">Cerrar Sesión</h3>
                <p className="text-xs text-text-muted mt-1">Salir de tu cuenta de forma segura.</p>
              </div>
              <button
                onClick={logout}
                className="w-full sm:w-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-red-800/10 rounded-2xl border border-red-800/20 gap-4">
              <div>
                <h3 className="font-bold text-red-700">Eliminar Cuenta</h3>
                <p className="text-xs text-text-muted mt-1">Borra permanentemente todos tus datos y tu cuenta.</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('¿Estás SEGURO? Esta acción es irreversible y borrará TODO tu progreso.')) {
                    deleteAccount();
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-red-800/20 hover:bg-red-800/30 text-red-800 rounded-xl text-sm font-bold transition-colors"
              >
                Eliminar Todo
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AppSettings;
