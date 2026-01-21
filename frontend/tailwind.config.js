/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-hot': '#ef4444',
        'status-warm': '#f59e0b',
        'status-cold': '#3b82f6',
      },
    },
  },
  plugins: [],
}
