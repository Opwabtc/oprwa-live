/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        accent: '#ff9900',
        gold: '#d4a017',
        'accent-hover': '#ffaa22',
        'bg-base': '#0a0a0a',
        'bg-2': '#111111',
        'bg-3': '#1a1a1a',
      },
      fontFamily: {
        display: ['"Inter var"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};
