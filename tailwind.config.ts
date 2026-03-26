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
        pink: "var(--pink)",
        "pink-light": "var(--pink-light)",
        blue: "var(--blue)",
        "blue-light": "var(--blue-light)",
        "blue-pale": "var(--blue-pale)",
        marble: "var(--marble)",
        ink: "var(--surface-text)",
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
