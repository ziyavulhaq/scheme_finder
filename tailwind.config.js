/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FBF9F4",
        paperAlt: "#F1ECE0",
        ink: "#1F3A5F",
        inkSoft: "#345178",
        marigold: "#E8A33D",
        marigoldDeep: "#B97A1C",
        marigoldSoft: "#FBEBD2",
        banyan: "#3B6E52",
        banyanSoft: "#E4EEE7",
        ledgerLine: "#D8D2C4",
        charcoal: "#2B2A28",
        charcoalSoft: "#6B6558",
        terracotta: "#A6412A",
        terracottaSoft: "#F4E3DD"
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
