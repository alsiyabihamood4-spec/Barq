/**
 * Industry design system — tokens ported verbatim from
 * `project/_ds/industry-ec6cb39a-119a-40f8-b02b-2625ec260763/styles.css`.
 *
 * This is the single source of truth for color, type, spacing and radius
 * across apps/admin (Tailwind) and apps/mobile (React Native). Do not
 * hand-roll a hex, a font name, or a px value anywhere else — import from
 * here instead, exactly like the design system guide asks of the HTML
 * prototype.
 */

export const color = {
  bg: "#f2f2f3",
  surface: "#e9e9ea",
  text: "#1d1f20",
  accent: "#5980a6",
  accent2: "#728fab",
  /** color-mix(in srgb, #1d1f20 16%, transparent) flattened onto --color-bg */
  divider: "#d4d3d2",

  neutral100: "#f5f5f8",
  neutral200: "#e7e7ea",
  neutral300: "#d4d4d7",
  neutral400: "#b7b7ba",
  neutral500: "#98989b",
  neutral600: "#7a7a7d",
  neutral700: "#5d5d60",
  neutral800: "#424244",
  neutral900: "#2b2b2d",

  accent100: "#eef6ff",
  accent200: "#d6ebff",
  accent300: "#b5d9fd",
  accent400: "#94bce3",
  accent500: "#749dc4",
  accent600: "#597ea3",
  accent700: "#416180",
  accent800: "#2c455d",
  accent900: "#1d2d3d",
} as const;

/** Text-on-tint mixes used throughout the prototype (color-mix(in srgb, text N%, transparent)). */
export const textAlpha = (pct: number) => `rgba(29, 31, 32, ${pct / 100})`;

export const font = {
  heading: "Barlow Condensed",
  headingWeight: "600",
  body: "Barlow",
  /** Arabic pairing used by the prototype alongside the Latin faces. */
  headingArabic: "Noto Kufi Arabic",
  bodyArabic: "IBM Plex Sans Arabic",
  mono: "IBM Plex Mono",
} as const;

/** Density 0.85x, already baked into these values per the design system guide. */
export const space = {
  1: 3.4,
  2: 6.8,
  3: 10.2,
  4: 13.6,
  6: 20.4,
  8: 27.2,
} as const;

export const radius = {
  sm: 2,
  md: 4,
  lg: 7,
  /** The system's own rule: cards, figures and primary buttons stay square. */
  blueprint: 0,
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(43,43,45,0.14)",
  md: "0 3px 10px rgba(43,43,45,0.16)",
  lg: "0 12px 32px rgba(43,43,45,0.22)",
} as const;

/** The one accent — this is a mono scheme, accent-2 reads the same as accent. */
export const accentRamp = [
  color.accent100,
  color.accent200,
  color.accent300,
  color.accent400,
  color.accent500,
  color.accent600,
  color.accent700,
  color.accent800,
  color.accent900,
] as const;

export const neutralRamp = [
  color.neutral100,
  color.neutral200,
  color.neutral300,
  color.neutral400,
  color.neutral500,
  color.neutral600,
  color.neutral700,
  color.neutral800,
  color.neutral900,
] as const;
