/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf3',
          100: '#d1fadf',
          200: '#a6f4c5',
          300: '#6ce9a6',
          400: '#32d583',
          500: '#16b364',
          600: '#0a9150',
          700: '#087443',
          800: '#095c37',
          900: '#084c2e',
        },
        ink: {
          DEFAULT: '#0b2a22',
          800: '#0f3329',
          700: '#17452f',
        },
        cream: {
          DEFAULT: '#faf8f1',
          100: '#f4f1e6',
          200: '#ece7d6',
        },
        lime: {
          300: '#dcf56f',
          400: '#c9ef4d',
          500: '#b2e02f',
          600: '#93bd1f',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 18px 50px -12px rgba(11, 42, 34, 0.18)',
        soft: '0 6px 24px -8px rgba(11, 42, 34, 0.10)',
        glow: '0 0 0 1px rgba(178, 224, 47, 0.4), 0 12px 40px -8px rgba(178, 224, 47, 0.35)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: { '2xl': '1200px' },
      },
    },
  },
  plugins: [],
};
