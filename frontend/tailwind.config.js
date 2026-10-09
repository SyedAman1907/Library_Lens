/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#FFFDF9',
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FFF8F3',
          hover: '#FFF3EB',
        },
        borderBase: {
          DEFAULT: '#F0DED7',
          strong: '#E8C8BD',
        },
        content: {
          primary: '#241414',
          secondary: '#674B48',
          muted: '#9B8580',
        },
        // RED: Primary action / important
        crimson: {
          DEFAULT: '#E63946',
          dark: '#C92D3A',
          soft: '#FFF1F2',
          border: '#FECDD3',
        },
        // PINK: AI / intelligence
        roseai: {
          DEFAULT: '#EC4899',
          dark: '#BE185D',
          soft: '#FCE7F3',
          border: '#FBCFE8',
        },
        // YELLOW: Discovery / new
        ambernew: {
          DEFAULT: '#FACC15',
          dark: '#CA8A04',
          soft: '#FEF9C3',
          border: '#FEF08A',
        },
        // GOLD: Recommendation / premium / LibraryLens Pick
        goldpick: {
          DEFAULT: '#D4A017',
          light: '#F5D76E',
          soft: '#FFFDF0',
          border: '#FDE68A',
        },
        statusSuccess: '#16A34A',
        statusWarning: '#D97706',
        statusError: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(36, 20, 20, 0.05)',
        'card': '0 4px 20px -2px rgba(36, 20, 20, 0.05), 0 1px 3px 0 rgba(36, 20, 20, 0.03)',
        'elevated': '0 12px 36px -4px rgba(36, 20, 20, 0.08), 0 2px 6px 0 rgba(36, 20, 20, 0.04)',
        'gold-highlight': '0 8px 30px -4px rgba(212, 160, 23, 0.20)',
        'red-cta': '0 4px 14px 0 rgba(230, 57, 70, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.99)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
