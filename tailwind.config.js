/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                samurai: {
                    black: '#09090b', // Deep background
                    dark: '#18181b', // Card background
                    red: '#ef4444', // Primary accent
                    glass: 'rgba(255, 255, 255, 0.05)',
                    border: 'rgba(255, 255, 255, 0.1)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'dot-pattern': 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            }
        },
    },
    plugins: [],
}
