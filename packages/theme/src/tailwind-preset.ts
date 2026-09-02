import { color, font, radius } from "./tokens";
import type { Config } from "tailwindcss";

/**
 * Tailwind preset for apps/admin — maps the Industry tokens onto Tailwind's
 * theme so admin markup can use `bg-accent`, `text-accent-700`,
 * `font-heading`, `rounded-blueprint` (0) etc. instead of ad-hoc values.
 */
const tanafusPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: color.bg,
        surface: color.surface,
        ink: color.text,
        divider: color.divider,
        accent: {
          DEFAULT: color.accent,
          100: color.accent100,
          200: color.accent200,
          300: color.accent300,
          400: color.accent400,
          500: color.accent500,
          600: color.accent600,
          700: color.accent700,
          800: color.accent800,
          900: color.accent900,
        },
        neutral: {
          100: color.neutral100,
          200: color.neutral200,
          300: color.neutral300,
          400: color.neutral400,
          500: color.neutral500,
          600: color.neutral600,
          700: color.neutral700,
          800: color.neutral800,
          900: color.neutral900,
        },
      },
      fontFamily: {
        heading: [font.heading, "system-ui", "sans-serif"],
        body: [font.body, "system-ui", "sans-serif"],
        headingAr: [font.headingArabic, "system-ui", "sans-serif"],
        bodyAr: [font.bodyArabic, "system-ui", "sans-serif"],
        mono: [font.mono, "monospace"],
      },
      borderRadius: {
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        blueprint: "0px",
      },
    },
  },
};

export default tanafusPreset;
