/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(210, 90%, 50%)', // A nice blue
          light: 'hsl(210, 90%, 60%)',
          dark: 'hsl(210, 90%, 40%)',
        },
        secondary: {
          DEFAULT: 'hsl(170, 70%, 40%)', // A teal/green accent
          light: 'hsl(170, 70%, 50%)',
          dark: 'hsl(170, 70%, 30%)',
        },
        getmar: { // Special color for Getmar mode
          DEFAULT: 'hsl(30, 90%, 50%)', 
          light: 'hsl(30, 90%, 60%)',
          dark: 'hsl(30, 90%, 40%)',
        },
        // Backgrounds
        bg_light: 'hsl(0, 0%, 98%)', // Off-white for light mode
        bg_dark: 'hsl(220, 15%, 15%)', // Dark gray for dark mode
        // Surface colors (cards, modals)
        surface_light: 'hsl(0, 0%, 100%)',
        surface_dark: 'hsl(220, 15%, 20%)',
        // Text colors
        text_light_primary: 'hsl(220, 15%, 25%)',
        text_light_secondary: 'hsl(220, 10%, 45%)',
        text_dark_primary: 'hsl(0, 0%, 95%)',
        text_dark_secondary: 'hsl(0, 0%, 75%)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'focus': '0 0 0 3px rgba(59, 130, 246, 0.5)', // Example focus ring
      }
    },
  },
  plugins: [],
};
