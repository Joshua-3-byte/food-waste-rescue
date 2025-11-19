// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981', // Green for eco/sustainability
        secondary: '#F59E0B', // Orange for food
      },
    },
  },
  plugins: [],
}