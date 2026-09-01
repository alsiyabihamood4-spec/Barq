import { color, font, radius, space } from "./tokens";

/**
 * A React Native-friendly restatement of the same tokens, for apps/mobile.
 * React Native has no `color-mix()`, so the text-on-tint mixes used all over
 * the prototype are pre-flattened here as solid hex/rgba.
 */
export const rnColor = {
  ...color,
  textMuted45: "rgba(29,31,32,0.45)",
  textMuted48: "rgba(29,31,32,0.48)",
  textMuted50: "rgba(29,31,32,0.50)",
  textMuted55: "rgba(29,31,32,0.55)",
  textMuted58: "rgba(29,31,32,0.58)",
  textMuted60: "rgba(29,31,32,0.60)",
  textMuted62: "rgba(29,31,32,0.62)",
  textMuted70: "rgba(29,31,32,0.70)",
  accentTint10: "rgba(89,128,166,0.10)",
  accentTint18: "rgba(89,128,166,0.18)",
};

export const rnFont = {
  heading: font.heading,
  headingWeight: "600" as const,
  body: font.body,
  headingArabic: font.headingArabic,
  bodyArabic: font.bodyArabic,
  mono: font.mono,
};

export const rnSpace = space;
export const rnRadius = radius;

/** Corner-mark geometry used by <Blueprint> — matches .blueprint > .corner in styles.css. */
export const cornerMark = {
  size: 11,
  strokeWidth: 1,
  offset: -6,
  color: "rgba(29,31,32,0.55)",
};
