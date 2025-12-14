/** @type {import('tailwindcss').Config} */
export default {
  // CRITICAL: Configure the files where Tailwind should look for classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Defines 'Inter' as a fallback font for consistency
        sans: ['Inter', 'sans-serif'],
      },
      // You can add custom colors, spacing, etc., here if needed
    },
  },
  plugins: [],
}