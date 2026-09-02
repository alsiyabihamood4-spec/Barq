import type { Config } from "tailwindcss";
import tanafusPreset from "@tanafus/theme/src/tailwind-preset";

const config: Config = {
  presets: [tanafusPreset as Config],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

export default config;
