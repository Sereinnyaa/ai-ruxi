/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinematic: {
          bg: '#0a0a0a',
          card: '#1f1f1f',
          border: '#3d3d3d',
          gold: '#e0c278',
          text: '#ececec',
          muted: '#b0b0b0',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"SimSun"', 'serif'],
      },
    },
  },
  plugins: [],
}
