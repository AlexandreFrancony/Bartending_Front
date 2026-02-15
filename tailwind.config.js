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
        terracota: {
          DEFAULT: '#C65F3C',
          hover: '#B34924',
          'dark-hover': '#D87D5C',
        },
      },
      animation: {
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.25s ease-in',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};
