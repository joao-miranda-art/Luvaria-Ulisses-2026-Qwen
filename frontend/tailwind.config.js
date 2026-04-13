/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ============================================================
      // Paleta de Cores — Luvaria Ulisses 2026
      // Luxo artesanal, tradição desde 1925
      // ============================================================
      colors: {
        // Primary — Vermelho Borgonha (luxo clássico)
        primary: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0da',
          300: '#f4a9bb',
          400: '#ec7493',
          500: '#de4570',
          600: '#c52454',
          700: '#a51a43',
          800: '#800020', // Borgonha principal
          900: '#5e0518',
          950: '#4a0312',
        },
        // Accent — Dourado (elegância)
        accent: {
          50: '#fefce8',
          100: '#fef8c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#D4AF37', // Dourado principal
          500: '#c49a2a',
          600: '#a67c1f',
          700: '#856018',
          800: '#6e4e16',
          900: '#5d4115',
          950: '#352309',
        },
        // Couro / Marrom Escuro
        leather: {
          50: '#f9f6f3',
          100: '#f2ebe5',
          200: '#e6d5c8',
          300: '#d4b59f',
          400: '#c09070',
          500: '#4A2C2A', // Marrom couro principal
          600: '#3d2322',
          700: '#331d1c',
          800: '#2a1717',
          900: '#241313',
          950: '#130909',
        },
        // Neutros — Creme e Cinza escuro
        cream: '#F5F5DC',
        beige: '#E8DCC8',
        charcoal: '#36454F',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'], // Títulos elegantes
        sans: ['Inter', 'system-ui', 'sans-serif'], // Corpo legível
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
