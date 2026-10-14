import type { Config } from "tailwindcss";

// Design tokens from CLAUDE.md §3. Hex values live as CSS variables in app/globals.css.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--gl-ink)",
        gold: {
          200: "var(--gl-gold-200)",
          300: "var(--gl-gold-300)",
          400: "var(--gl-gold-400)",
          500: "var(--gl-gold-500)",
          text: "var(--gl-gold-text)",
        },
        champagne: {
          DEFAULT: "var(--gl-champagne)",
          2: "var(--gl-champagne-2)",
        },
        line: "var(--gl-line)",
        muted: "var(--gl-muted)",
        blush: {
          DEFAULT: "var(--gl-blush)",
          2: "var(--gl-blush-2)",
        },
        sage: "var(--gl-sage)",
      },
      fontFamily: {
        display: ["var(--font-bodoni)", "serif"],
        caps: ["var(--font-cinzel)", "serif"],
        script: ["var(--font-great-vibes)", "cursive"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        site: "1320px",
      },
    },
  },
};

export default config;
