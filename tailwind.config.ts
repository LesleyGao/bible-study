import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#faf7f2",
        "parchment-dark": "#f0ebe3",
        ink: "#2d2418",
        "ink-light": "#5c4a38",
        gold: "#c9922e",
        "gold-dark": "#a07424",
        "gold-light": "#e8c97a",
        warmgray: "#8a7e72",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
