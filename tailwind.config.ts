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
        // Base colors from CSS variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Fall Agricultural color palette - Vivid-inspired dark theme
        agricultural: {
          50: "#fdf8f3",
          100: "#f9ede3",
          200: "#f1d4bf",
          300: "#e8b896",
          400: "#d89561",
          500: "#c67742",
          600: "#a85d32",
          700: "#8b4a2b",
          800: "#6f3c26",
          900: "#5a3121",
          950: "#31180f",
        },
        // Primary - Deep Burgundy/Wine (Fall signature)
        primary: {
          50: "#fdf4f4",
          100: "#fbe8e8",
          200: "#f6d1d1",
          300: "#eeacac",
          400: "#e37d7d",
          500: "#d35555",
          600: "#b83838",
          700: "#9a2c2c",
          800: "#7f2727",
          900: "#6a2626",
        },
        // Secondary - Deep Orange/Rust (Fall warmth)
        secondary: {
          50: "#fef6ee",
          100: "#fdebd8",
          200: "#fad3b0",
          300: "#f7b47d",
          400: "#f38b48",
          500: "#ef6a25",
          600: "#e0511b",
          700: "#b93d18",
          800: "#93321b",
          900: "#762b19",
        },
        // Accent - Dark Forest Green (Agricultural earthiness)
        accent: {
          50: "#f3f6f3",
          100: "#e4ebe4",
          200: "#cad7ca",
          300: "#a3bba5",
          400: "#76977a",
          500: "#557b5a",
          600: "#426246",
          700: "#354e38",
          800: "#2d3f30",
          900: "#263428",
        },
        // Neutral - Rich Browns (Fall earth tones)
        earth: {
          50: "#f8f6f4",
          100: "#eeebe6",
          200: "#dcd5cc",
          300: "#c4b8aa",
          400: "#aa9685",
          500: "#967d6b",
          600: "#89705f",
          700: "#725c4f",
          800: "#5e4d44",
          900: "#4d3f38",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Cal Sans",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "bounce-slow": "bounce 3s infinite",
        // Loading animations
        shimmer: "shimmer 2s infinite",
        "shimmer-sweep": "shimmerSweep 2s infinite",
        wave: "wave 1.5s infinite",
        "wave-sweep": "waveSweep 1.5s infinite",
        "progress-indeterminate":
          "progressIndeterminate 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        // Loading keyframes
        shimmer: {
          "0%": { opacity: "0.5" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.5" },
        },
        shimmerSweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        wave: {
          "0%": { opacity: "0.6" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.6" },
        },
        waveSweep: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        progressIndeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(184, 56, 56, 0.4)",
        "glow-lg": "0 0 40px rgba(184, 56, 56, 0.5)",
        "glow-warm": "0 0 30px rgba(239, 106, 37, 0.4)",
        "glow-earth": "0 4px 24px rgba(114, 92, 79, 0.3)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};

export default config;
