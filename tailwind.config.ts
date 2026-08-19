import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#07090A",
        surface: "#0E1412",
        surface2: "#132019",
        emerald: {
          DEFAULT: "#123324",
          deep: "#0B241A",
        },
        jade: {
          DEFAULT: "#1FAE72",
          bright: "#3FE39A",
        },
        gold: {
          DEFAULT: "#C6A15B",
          soft: "#E4CE9B",
        },
        ivory: "#EDF2ED",
        sage: "#7C9186",
        danger: "#E2574C",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 40px rgba(198,161,91,0.12)",
        "jade-glow": "0 0 40px rgba(31,174,114,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
