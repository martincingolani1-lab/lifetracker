import React from 'react';
import { Sun, Moon, Droplets } from 'lucide-react';
import { useUser } from '../../store/userStore';
import { motion } from 'framer-motion';

const PALETTES = [
    { id: 'light', icon: Sun, color: '#EAB308', label: 'Light' },
    { id: 'dark', icon: Moon, color: '#171717', label: 'Dark' },
    { id: 'color', icon: Droplets, color: '#163E3E', label: 'Deep Sea' },
];

const ThemeSlider: React.FC = () => {
    const { theme, setTheme } = useUser();

    const handleClick = () => {
        const currentIndex = PALETTES.findIndex(p => p.id === theme);
        const nextIndex = (currentIndex + 1) % PALETTES.length;
        setTheme(PALETTES[nextIndex].id);
    };

    const current = PALETTES.find(p => p.id === theme) || PALETTES[0];
    const Icon = current.icon;

    return (
        <button
            onClick={handleClick}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-main border border-border hover:border-border transition-all duration-300 active:scale-90 overflow-hidden"
            title={`Tema: ${current.label}`}
        >
            <motion.div
                key={theme}
                initial={{ y: 12, opacity: 0, rotate: -60 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 250 }}
                className="relative z-10"
            >
                <Icon size={16} strokeWidth={2.5} />
            </motion.div>
        </button>
    );
};

export default ThemeSlider;
