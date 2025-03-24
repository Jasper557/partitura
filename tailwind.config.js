/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      dropShadow: {
        'glow': '0 0 8px rgba(255, 255, 255, 0.7)',
        'blue-glow': '0 0 10px rgba(59, 130, 246, 0.7)',
      },
    },
  },
  plugins: [],
} 