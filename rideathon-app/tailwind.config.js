/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Sunset color palette
        sunset: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fbd7a5',
          300: '#f8b86d',
          400: '#f59433',
          500: '#f2760a',
          600: '#e35d05',
          700: '#bc4408',
          800: '#96360e',
          900: '#792e0f',
        },
        coral: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        peach: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fad9bc',
          300: '#f6be8c',
          400: '#f19a5a',
          500: '#ed7a2e',
          600: '#de5f24',
          700: '#b94a1f',
          800: '#943b20',
          900: '#77321c',
        },
        lavender: {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9ddff',
          300: '#d8c2ff',
          400: '#c197ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Updated primary colors using sunset theme
        primary: '#f2760a', // Sunset orange
        secondary: '#ef4444', // Coral red
        accent: '#a855f7', // Lavender purple
        dark: '#1f2937', // Dark gray
        light: '#fef7ee', // Sunset cream
        success: '#10b981', // Emerald green
        warning: '#f59e0b', // Amber
        error: '#ef4444', // Red
      },
      backgroundImage: {
        'sunset-gradient': 'linear-gradient(135deg, #f2760a 0%, #ef4444 50%, #a855f7 100%)',
        'sunset-soft': 'linear-gradient(135deg, #fef7ee 0%, #fee2e2 50%, #faf7ff 100%)',
        'sunset-card': 'linear-gradient(135deg, #ffffff 0%, #fef7ee 100%)',
      },
    },
  },
  plugins: [],
}