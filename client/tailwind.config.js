/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        foreground: '#e4e4ef',
        surface: { DEFAULT: '#12121a', hover: '#1a1a26' },
        primary: { DEFAULT: '#8b5cf6', hover: '#a78bfa' },
        text: { DEFAULT: '#e4e4ef', secondary: '#71718a' },
        border: '#272736',
        destructive: '#ef4444',
        success: '#22c55e',
        warning: '#eab308',
      },
    },
  },
  plugins: [],
};
