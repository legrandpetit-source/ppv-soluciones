/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./admin/**/*.html",
    "./**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: '#07090E',
        slateDark: '#0B1120',
        slateCard: 'rgba(15, 23, 42, 0.70)',
        neonCyan: '#00f3ff',
        neonMagenta: '#ff007f',
        neonViolet: '#a855f7',
        cobalt: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8'
        },
        emeraldAccent: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669'
        },
        cyanAccent: {
          400: '#22D3EE',
          500: '#06B6D4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: [],
}
