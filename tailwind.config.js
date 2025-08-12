
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,context,hooks,services,types}/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        'light-bg': '#f3f4f6', // Very light gray background
        'light-surface': '#ffffff', // White for cards and surfaces
        'light-border': '#e5e7eb', // Light gray for borders
        'light-text-primary': '#111827', // Dark gray for primary text
        'light-text-secondary': '#6b7280', // Lighter gray for secondary text
        'sorare': {
          'blue': '#2255f5',
          'green': '#16a34a', // A slightly darker, more pleasant green
          'red': '#ef4444',
          'yellow': 'rgb(245 158 11)',
          'super-rare': '#3c7dff',
          'unique': '#b98c55'
        },
      },
    },
  },
  plugins: [],
}