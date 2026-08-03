/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#0A5E7E', deep: '#074557', light: '#1A7A9E' },
        gold: { DEFAULT: '#B8860B', light: '#D4A017' },
        parchment: { DEFAULT: '#F5EFE0', cream: '#FAF6EC' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        bn: ['Hind Siliguri', 'sans-serif'],
      },
    },
  },
  plugins: [],
}