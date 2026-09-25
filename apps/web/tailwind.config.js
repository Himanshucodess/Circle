/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ink: {
          950: "#0b0b10",
          900: "#131318",
          800: "#1c1c24",
        },
        cream: "#f6f5f1",
        lime: {
          DEFAULT: "#d8f34e",
          dim: "#c4e23a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--primary) / 0.25), 0 8px 40px -8px hsl(var(--primary) / 0.45)",
        card: "0 1px 2px rgb(16 16 20 / 0.05), 0 12px 32px -12px rgb(16 16 20 / 0.18)",
        pop: "0 18px 60px -18px rgb(16 16 20 / 0.35)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in": { from: { transform: "translateY(10px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        "float-slow": { "0%,100%": { transform: "translateY(0) rotate(0deg)" }, "50%": { transform: "translateY(-18px) rotate(2deg)" } },
        aurora: {
          "0%,100%": { transform: "translate(0,0) scale(1)", opacity: "0.8" },
          "33%": { transform: "translate(4%, -6%) scale(1.08)", opacity: "1" },
          "66%": { transform: "translate(-4%, 4%) scale(0.96)", opacity: "0.7" },
        },
        shine: { "0%": { transform: "translateX(-120%) skewX(-18deg)" }, "100%": { transform: "translateX(240%) skewX(-18deg)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.35s ease-out",
        "slide-in": "slide-in 0.4s cubic-bezier(0.22,1,0.36,1)",
        marquee: "marquee 28s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        aurora: "aurora 14s ease-in-out infinite",
        shine: "shine 2.8s ease-in-out infinite",
        "spin-slow": "spin-slow 14s linear infinite",
      },
    },
  },
  plugins: [],
};
