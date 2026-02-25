import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        // Apple-inspired dark palette
        surface: {
          DEFAULT: "#1c1c1e",
          secondary: "#2c2c2e",
          tertiary: "#3a3a3c",
          elevated: "#242426",
        },
        accent: {
          blue: "#0a84ff",
          green: "#30d158",
          orange: "#ff9f0a",
          red: "#ff453a",
          purple: "#bf5af2",
          yellow: "#ffd60a",
          teal: "#5ac8fa",
          pink: "#ff375f",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        apple: "0 2px 20px rgba(0, 0, 0, 0.4)",
        "apple-sm": "0 1px 8px rgba(0, 0, 0, 0.3)",
        "apple-lg": "0 8px 40px rgba(0, 0, 0, 0.5)",
        "apple-inner": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scaleIn 0.15s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
