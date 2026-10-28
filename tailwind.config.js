/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        porcelain: '#F4F0E8',
        forest: {
          DEFAULT: '#263329',
          dark: '#1c261f',
          light: '#354539',
        },
        ink: {
          DEFAULT: '#17221D',
          muted: '#72776F',
        },
        sage: {
          DEFAULT: '#D9E2C6',
          light: '#EAF0DC',
          dark: '#B8C69F',
        },
        lavender: {
          DEFAULT: '#DDD1EA',
          light: '#EFE7F7',
          dark: '#C3B4D6',
        },
        sand: {
          DEFAULT: '#E9D3B5',
          light: '#F5E7D3',
          dark: '#D6BA96',
        },
        surface: {
          DEFAULT: '#FBF9F4',
          card: '#FBF9F4',
          subtle: '#FAF6EE',
          dark: '#263329',
        },
        border: {
          DEFAULT: '#E3DDD2',
          light: '#ECE6DC',
          dark: '#D0C8B8',
        },
        botanical: {
          green: '#4F7757',
          amber: '#D48B38',
          terracotta: '#C85A48',
          softRed: '#FCECE9',
          softGreen: '#EBF4ED',
          softAmber: '#FDF5E9',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        handwriting: ['Caveat', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 2px rgba(38, 51, 41, 0.04), 0 1px 3px rgba(38, 51, 41, 0.02)',
        'warm': '0 4px 16px -2px rgba(38, 51, 41, 0.05), 0 2px 6px -1px rgba(38, 51, 41, 0.03)',
        'warm-lg': '0 12px 28px -4px rgba(38, 51, 41, 0.08), 0 4px 12px -2px rgba(38, 51, 41, 0.04)',
        'warm-xl': '0 20px 40px -8px rgba(38, 51, 41, 0.12)',
        'inner-soft': 'inset 0 1px 3px rgba(38, 51, 41, 0.04)',
      },
      borderRadius: {
        'editorial': '18px',
        'card': '20px',
        'pill': '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
