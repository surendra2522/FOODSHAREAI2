/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fcf5',
          100: '#e2f7ea',
          200: '#c5eed4',
          300: '#97e0b2',
          400: '#62ca89',
          500: '#3bab66',
          600: '#2c8b4f',
          700: '#246f41',
          800: '#1f5835',
          900: '#1a492d',
          950: '#0c2918',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

