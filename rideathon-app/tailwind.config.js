/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4ECDC4',
        secondary: '#FF6B6B',
        accent: '#45B7D1',
        dark: '#1A1A2E',
        light: '#F5F5F5',
      },
    },
  },
  plugins: [],
}