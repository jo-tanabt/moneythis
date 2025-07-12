/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#ffffff',
          secondary: '#f7f6f3',
          text: '#37352f',
          muted: '#9b9a97',
          border: '#e9e9e7',
          hover: '#f1f1ef'
        }
      },
      fontFamily: {
        'notion': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'notion': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'notion-hover': '0 2px 4px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}