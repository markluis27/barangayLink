/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tinurik: {
          navy: '#0f2757',
          blue: '#1e3a8a',
          sky: '#0284c7',
          lightSky: '#e0f2fe',
          accent: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
