/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#141420",
        elevated: "#1e1e2e",
        border: "#2a2a3a",
        accent: {
          primary: "#7c3aed",
          secondary: "#06b6d4",
        },
      },
    },
  },
  plugins: [],
};
