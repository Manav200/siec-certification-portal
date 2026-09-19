import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        siec: {
          "warm-start": "#FFC837",
          "warm-end": "#FF8008",
          "primary-start": "#7C3AED",
          "primary-end": "#10B981",
          "ocean-start": "#06B6D4",
          "ocean-end": "#1D4ED8",
          bg: "#F8FAFC",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-warm": "linear-gradient(135deg, #FFC837 0%, #FF8008 100%)",
        "gradient-primary":
          "linear-gradient(135deg, #7C3AED 0%, #10B981 100%)",
        "gradient-ocean": "linear-gradient(135deg, #06B6D4 0%, #1D4ED8 100%)",
        "gradient-warm-h": "linear-gradient(90deg, #FFC837 0%, #FF8008 100%)",
        "gradient-primary-h":
          "linear-gradient(90deg, #7C3AED 0%, #10B981 100%)",
        "gradient-ocean-h": "linear-gradient(90deg, #06B6D4 0%, #1D4ED8 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0.4)" },
          "50%": { boxShadow: "0 0 20px 6px rgba(124, 58, 237, 0.15)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".glass": {
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
        },
        ".glass-dark": {
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        ".text-gradient-warm": {
          background: "linear-gradient(135deg, #FFC837 0%, #FF8008 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-primary": {
          background: "linear-gradient(135deg, #7C3AED 0%, #10B981 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-ocean": {
          background: "linear-gradient(135deg, #06B6D4 0%, #1D4ED8 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
      });
    }),
  ],
};

export default config;
