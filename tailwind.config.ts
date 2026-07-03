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
        ink:      '#26263A',   // near-black navy — primary text, dark section bg base
        paper:    '#F1EFE7',   // warm off-white — hero/light section bg
        navSurf:  '#EDEBE3',   // slightly darker off-white for nav bar
        dark:     '#2C2C40',   // dark slate — the "proof zone" background
        darkCard: '#34344A',   // slightly lighter card surface within dark zone
        mint:     '#2CE8A5',   // primary accent — success/cheap-tier/savings/CTA
        magenta:  '#FF6FCF',   // secondary accent — escalation/strong-tier/urgent CTA
        line:     '#3E3E56',   // hairline borders within dark zone
        lineLight:'#D8D5C9',   // hairline borders within light zone
      },
      fontFamily: {
        display: ['Zodiak', 'serif'],
        mono: ['Comico', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
