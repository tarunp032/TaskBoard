/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // 👈 Important
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7b2ff7",
        secondary: "#f107a3",
        darkBg: "#0f0f12",
        darkCard: "#1a1a1e",
        darkText: "#e5e5e5",
      },
    },
  },
  plugins: [],
};
