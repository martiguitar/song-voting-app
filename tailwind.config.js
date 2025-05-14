/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#66f0ff',
          500: '#00e0ff',
          600: '#00c3e6',
        },
        secondary: {
          500: '#d100ff',
          600: '#b300e6',
        },
        neutral: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          800: '#1a1a1a',
          900: '#0e0e0e',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};