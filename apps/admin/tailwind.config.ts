import type { Config } from "tailwindcss";
import BARQPreset from "@BARQ/theme/src/tailwind-preset";

const config: Config = {
  presets: [BARQPreset as Config],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

export default config;
