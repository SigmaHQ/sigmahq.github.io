/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./.vitepress/**/*.js",
    "./.vitepress/**/*.vue",
    "./.vitepress/**/*.ts",
    "./**/*.md",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        sigma: {
          50: "#E5F8FF",
          100: "#CDF1FE",
          200: "#9CE2FC",
          300: "#72D4F8",
          400: "#45C4F2",
          500: "#1AB2EA",
          600: "#0D93C4",
          700: "#087096",
          800: "#034963",
          900: "#012532",
          950: "#001319",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
