/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lynk: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c2d8ff',
          300: '#94b8ff',
          400: '#5c8fff',
          500: '#3b6eff',
          600: '#1a4aee',
          700: '#1339c9',
          800: '#1531a3',
          900: '#172d81',
          950: '#111f4d',
        }
      }
    },
  },
  plugins: [],
}