/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'google-blue': '#1a73e8',
        'google-blue-dark': '#1557b0',
        'google-gray': '#5f6368',
        'google-border': '#dadce0',
        'google-bg-light': '#f8f9fa',
      },
      boxShadow: {
        'google-soft': '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
        'google-hover': '0 1px 2px 0 rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15)',
      }
    },
  },
  plugins: [],
}
