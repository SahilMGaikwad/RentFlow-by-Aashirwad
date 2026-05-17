/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                app: 'var(--bg-app)',
                panel: 'var(--card-bg)',
                solid: 'var(--card-solid)',
                border: 'var(--card-border)',
                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                muted: 'var(--text-muted)',
            },
            backgroundImage: {
                'gradient-primary': 'var(--primary-gradient)',
            },
            boxShadow: {
                'glass': 'var(--glass-shadow)',
                'neon': '0 0 20px rgba(59, 130, 246, 0.4)',
                'neon-pink': '0 0 20px rgba(236, 72, 153, 0.4)',
            }
        },
    },
    plugins: [],
}
