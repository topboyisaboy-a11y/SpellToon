import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFDF5",
        cocoa: "#4A3E3D",
        bubble: {
          yellow: "#FEE388",
          peach: "#FFC4A4",
          mint: "#BEE3DB",
          sky: "#B5E2FA",
          lavender: "#DEC0F1",
          pink: "#F7CAD0",
        },
      },
      minWidth: {
        touch: "80px",
      },
      minHeight: {
        touch: "80px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        toddler: "0 8px 0 0 rgba(74, 62, 61, 0.12)",
        "toddler-active": "0 2px 0 0 rgba(74, 62, 61, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
