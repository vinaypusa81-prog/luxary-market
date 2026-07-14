/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#8b0000', // Dark Red Accent
          dark: '#5a0000',
        },
        card: 'var(--card)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        accent: '#f97316', // Orange highlight
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 8px 30px rgb(0, 0, 0, 0.04)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
      }
    },
  },
  plugins: [],
}
