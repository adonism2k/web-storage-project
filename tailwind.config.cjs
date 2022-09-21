/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {},
  },
  plugins: [require("flowbite/plugin")],
};
