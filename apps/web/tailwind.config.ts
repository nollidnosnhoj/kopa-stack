import type { Config } from "tailwindcss";
import tailwindPreset from "@kopa/ui/tailwind.config";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [tailwindPreset],
};

export default config;
