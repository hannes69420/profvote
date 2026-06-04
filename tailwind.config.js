/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system','BlinkMacSystemFont','"SF Pro Text"','"Segoe UI"','system-ui','sans-serif',
        ],
        display: [
          '-apple-system','BlinkMacSystemFont','"SF Pro Display"','"Segoe UI"','system-ui','sans-serif',
        ],
      },
      letterSpacing: { tightest: '-0.03em' },
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
        canvas: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          soft: 'rgb(var(--bg-soft) / <alpha-value>)',
        },
        accent: {
          DEFAULT: '#0071e3',
          hover: '#0a84ff',
        },
      },
      borderColor: {
        DEFAULT: 'rgb(var(--border) / <alpha-value>)',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
      },
    },
  },
  plugins: [],
};
