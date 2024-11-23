import type { Config } from "tailwindcss";
import tailwinPreset from "@kopa/ui/tailwind.config";

export default {
  content: [
    "./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [tailwinPreset],
} satisfies Config;
