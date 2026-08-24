/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        void: {
          950: "#050409",
          900: "#09090b",
          850: "#0d0914",
          800: "#130c22",
          700: "#1d1433",
          600: "#271b45",
        },
        inferno: {
          400: "#ff6b4a",
          500: "#ff4d28",
          600: "#f43f5e",
          700: "#dc2626",
          800: "#991b1b",
        },
        astral: {
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        karma: {
          gold: "#fbbf24",
          parchment: "#fef3c7",
          amber: "#f59e0b",
          darkAmber: "#78350f",
        }
      },
      fontFamily: {
        serif: ["Cinzel", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        "glow-crimson": "0 0 25px rgba(255, 77, 40, 0.4)",
        "glow-violet": "0 0 30px rgba(139, 92, 246, 0.35)",
        "glow-gold": "0 0 25px rgba(251, 191, 36, 0.3)",
        "altar": "0 20px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(139, 92, 246, 0.15)",
        "card-gothic": "0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spin-reverse 25s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite",
      },
      keyframes: {
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      }
    },
  },
  plugins: [],
};
