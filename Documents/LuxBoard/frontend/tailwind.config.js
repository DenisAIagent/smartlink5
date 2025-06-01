/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luxe-gold': '#D4AF37',
        'luxe-black': '#000000',
        'luxe-gray': {
          light: '#F8F9FA',
          medium: '#E5E5E5',
          dark: '#B0AFAF',
        },
      },
      fontFamily: {
        'serif': ['"DM Serif Display"', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 