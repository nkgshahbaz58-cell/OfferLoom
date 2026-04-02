/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          black: '#141414',
          red: '#E50914',
          'red-dark': '#B81D24',
          gray: '#B3B3B3',
          'card-bg': '#2F2F2F',
        },
      },
      fontFamily: {
        netflix: ['Helvetica Neue', 'Arial', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
