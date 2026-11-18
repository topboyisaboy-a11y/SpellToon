import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDF8EE",
        cocoa: "#4A3E3D",
        "primary-container": "#ffd23f",
        "on-primary-container": "#725a00",
        "primary-fixed": "#ffe089",
        "primary-fixed-dim": "#edc22e",
        "on-primary-fixed": "#241a00",
        primary: "#745c00",
        "secondary-container": "#ff5964",
        "on-secondary-container": "#600012",
        "secondary-fixed": "#ffdad9",
        secondary: "#b52234",
        "tertiary-container": "#63ecdd",
        "on-tertiary-container": "#006961",
        "on-tertiary-fixed-variant": "#005049",
        tertiary: "#006a62",
        surface: "#f9f9fc",
        "on-surface": "#1a1c1e",
        "on-surface-variant": "#4d4634",
        "surface-container": "#eeeef0",
        "surface-container-low": "#f3f3f6",
        "surface-container-highest": "#e2e2e5",
        "surface-container-lowest": "#ffffff",
        outline: "#7f7661",
        "outline-variant": "#d1c5ad",
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
        "5xl": "2.5rem",
      },
      boxShadow: {
        toddler: "0 6px 0 0 rgba(74, 62, 61, 0.12)",
        "toddler-active": "0 2px 0 0 rgba(74, 62, 61, 0.12)",
        "stitch-btn": "0 4px 0 #edc22e",
        "stitch-card": "0 8px 0 rgba(30,32,34,0.06)",
        "stitch-teal": "0 4px 0 #005049",
      },
      fontFamily: {
        headline: ["Comfortaa", "system-ui", "sans-serif"],
        body: ["Quicksand", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
