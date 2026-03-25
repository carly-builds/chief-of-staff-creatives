import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: "#f2b8c6",
        "pink-light": "#f8d5de",
        blue: "#9dcde3",
        "blue-light": "#c5e3ee",
        "blue-pale": "#dceef5",
        marble: "#e8e4e0",
        ink: "#2a2528",
        "ink-soft": "rgba(42, 37, 40, 0.45)",
        "ink-faint": "rgba(42, 37, 40, 0.18)",
      },
      fontFamily: {
        display: ['"Ibarra Real Nova"', "serif"],
        mono: ['"Roboto Mono"', "monospace"],
        body: ['"Libre Franklin"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
