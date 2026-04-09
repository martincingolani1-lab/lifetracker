/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--bg-app)",
                card: "var(--bg-card)",
                primary: "var(--primary)",
                secondary: "var(--secondary)",
                "text-main": "var(--text-main)",
                "text-muted": "var(--text-muted)",
                border: "var(--border)",
                "border-highlight": "var(--border-highlight)",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Outfit", "Inter", "system-ui", "sans-serif"],
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            animation: {
                'fade-up': 'fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards',
                'fade-in-scale': 'fade-in-scale 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards',
                'slide-right': 'slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards',
            },
        },
    },
    plugins: [],
}
