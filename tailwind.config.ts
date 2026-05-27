import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", ".dark"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // rose is defined in globals.css @theme block so it can be swapped at runtime via [data-primary]
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        elevated: "0 4px 16px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
