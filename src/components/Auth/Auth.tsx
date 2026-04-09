import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { LogIn, UserPlus, Mail, Lock, Loader2, Zap, Shield, Smartphone, TrendingUp, ChevronRight } from 'lucide-react';
import Logo from '../Logo';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

const FEATURES = [
    { icon: Zap, title: 'Hábitos inteligentes', desc: 'Trackeo diario con métricas y racha' },
    { icon: Shield, title: 'Nutrición precisa', desc: 'Macros, comidas y suplementos' },
    { icon: TrendingUp, title: 'Analytics profundo', desc: 'Gráficos y tendencias semanales' },
    { icon: Smartphone, title: 'Mobile-first', desc: 'Diseñado para usar en cualquier lugar' },
];

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    React.useEffect(() => {
        // Handle deep links for OAuth
        if (Capacitor.isNativePlatform()) {
            App.addListener('appUrlOpen', async (data) => {
                const url = new URL(data.url);
                // Supabase returns tokens in the hash
                const hash = url.hash.substring(1);
                if (hash) {
                    const params = new URLSearchParams(hash);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        if (error) {
                            toast.error('Error al restaurar sesión: ' + error.message);
                        } else {
                            toast.success('Sesión iniciada con Google');
                        }
                    }
                }
            });
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                toast.success('¡Registro exitoso! Revisa tu email para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('Sesión iniciada correctamente');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const redirectTo = Capacitor.isNativePlatform()
                ? 'com.lifetracker.app://google-auth'
                : window.location.origin;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || 'Error al iniciar con Google');
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-white overflow-hidden relative">
            {/* Ambient background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[60%] bg-teal-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[60%] bg-yellow-400/10 rounded-full blur-[150px]" />
                <div className="absolute top-[30%] right-[20%] w-[25%] h-[25%] bg-yellow-400/5 rounded-full blur-[120px]" />
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(250,204,21,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* ═══ TOP NAV ═══ */}
                <nav
                    className="flex items-center justify-between px-6 md:px-12 py-5"
                    style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
                >
                    <div className="flex items-center gap-2">
                        <Logo size={28} className="text-yellow-400" />
                        <span className="text-lg font-display font-black tracking-tight">
                            Life<span className="text-yellow-400">Tracker</span>
                        </span>
                    </div>
                    <a
                        href="#login"
                        className="text-sm font-display font-semibold text-white/60 hover:text-yellow-400 transition-colors"
                    >
                        Iniciar sesión
                    </a>
                </nav>

                {/* ═══ HERO + AUTH SPLIT ═══ */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 md:px-12 py-8 md:py-16">

                    {/* LEFT — Hero */}
                    <div className="flex-1 max-w-xl text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs font-display font-semibold text-yellow-400 mb-6">
                            <Zap size={12} />
                            Tu sistema de vida, simplificado
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.1] mb-6">
                            Dominá tus
                            <br />
                            <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                                hábitos y nutrición
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-white/50 font-display leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                            Un dashboard personal para trackear hábitos, macros, suplementos y más. Todo en un solo lugar, sincronizado entre dispositivos.
                        </p>

                        {/* Feature grid */}
                        <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-lg mx-auto lg:mx-0">
                            {FEATURES.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={feature.title}
                                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-yellow-400/20 transition-colors"
                                    >
                                        <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400 flex-shrink-0">
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-display font-bold text-white/90">{feature.title}</p>
                                            <p className="text-[11px] font-display text-white/40 mt-0.5">{feature.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT — Auth Card */}
                    <div id="login" className="w-full max-w-[420px] flex-shrink-0">
                        <div className="relative">
                            {/* Glow behind card */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400/20 via-transparent to-blue-500/10 rounded-[2rem] blur-xl opacity-60" />

                            <div className="relative bg-[#0c1222] border border-border rounded-[2rem] p-8 md:p-10 shadow-2xl">
                                {/* Card header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-blue-500/10 border border-yellow-400/20 mb-4">
                                        <Logo size={32} className="text-yellow-400" />
                                    </div>
                                    <h2 className="text-xl font-display font-black tracking-tight text-white">
                                        {isSignUp ? 'Crear cuenta' : 'Bienvenido de nuevo'}
                                    </h2>
                                    <p className="text-sm text-white/40 font-display mt-1">
                                        {isSignUp ? 'Empezá a trackear tu vida' : 'Ingresá a tu dashboard'}
                                    </p>
                                </div>

                                {/* Google Sign In */}
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading}
                                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white text-black font-display font-bold text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 mb-5"
                                >
                                    {googleLoading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Continuar con Google
                                        </>
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                    <span className="text-[11px] font-display font-semibold text-white/25 uppercase tracking-wider">o con email</span>
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                </div>

                                {/* Email/Password Form */}
                                <form onSubmit={handleAuth} className="space-y-3">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/25 group-focus-within:text-yellow-400 transition-colors duration-300">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-border focus:border-yellow-400/40 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all duration-300 text-white placeholder:text-white/20 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)] font-display text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/25 group-focus-within:text-yellow-400 transition-colors duration-300">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-border focus:border-yellow-400/40 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all duration-300 text-white placeholder:text-white/20 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)] font-display text-sm"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-yellow-400 to-amber-300 text-[#060b0b] font-display font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-sm"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : isSignUp ? (
                                            <>
                                                <UserPlus size={16} />
                                                Crear cuenta
                                            </>
                                        ) : (
                                            <>
                                                <LogIn size={16} />
                                                Iniciar sesión
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Switch mode */}
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-xs font-display font-semibold text-white/35 hover:text-yellow-400 transition-colors duration-300 flex items-center gap-1 mx-auto"
                                    >
                                        {isSignUp
                                            ? '¿Ya tenés cuenta? Iniciá sesión'
                                            : '¿No tienes cuenta? Registrate'}
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ FOOTER ═══ */}
                <footer
                    className="px-6 md:px-12 py-4 flex items-center justify-between text-[11px] font-display text-white/15"
                    style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
                >
                    <span>© 2026 LifeTracker</span>
                    <span>Built with ❤️</span>
                </footer>
            </div>
        </div>
    );
};

export default Auth;
