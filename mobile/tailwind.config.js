/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds (warm dark layers)
        "bg-base": "#0e0e18",
        "bg-surface": "#161625",
        "bg-elevated": "#1e1e30",
        "bg-hover": "#282842",
        // Legacy aliases
        background: "#0e0e18",
        surface: "#161625",
        elevated: "#1e1e30",

        // Borders
        border: "#2a2a40",
        "border-subtle": "#1e1e30",

        // Brand accent
        accent: {
          DEFAULT: "#7c3aed",
          dark: "#6025c0",
          light: "#a78bfa",
          subtle: "rgba(124,58,237,0.12)",
        },

        // Secondary accent
        secondary: "#06b6d4",

        // Text
        "text-primary": "#f0f0f5",
        "text-secondary": "#8e8ea0",
        "text-tertiary": "#555568",
        "text-muted": "#3a3a4a",

        // Semantic
        success: "#34d399",
        warning: "#fbbf24",
        error: "#f87171",
        info: "#60a5fa",

        // Container status
        "status-cold": "#60a5fa",
        "status-warm": "#fbbf24",
        "status-hot": "#34d399",
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
        pill: "9999px",
        sheet: "24px",
      },
      fontSize: {
        display: ["28px", { lineHeight: "36px", fontWeight: "700" }],
        h1: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        h2: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        h3: ["17px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["15px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "18px", fontWeight: "400" }],
        micro: ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
