import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        working: "#22C55E",
        weekend: "#9CA3AF",
        holiday: "#F97316",
        leave: "#EF4444",
        spark: "#3B82F6",
        radiate: "#8B5CF6",
        synthpersona: "#14B8A6",
      },
    },
  },
  plugins: [],
};
export default config;
