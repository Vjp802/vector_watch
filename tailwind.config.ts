/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vw: {
          green:  '#2e7d32',
          'green-lt': '#e8f5e9',
          'green-md': '#4caf50',
          amber:  '#e65100',
          'amber-lt': '#fff3e0',
          red:    '#c62828',
          'red-lt': '#ffebee',
          blue:   '#1565c0',
          'blue-lt': '#e3f2fd',
          teal:   '#00695c',
          surface: '#ffffff',
          surface2: '#f0f1ef',
          bg:     '#f4f5f3',
          border: '#e0e2de',
          border2: '#c8cbc4',
          text:   '#1a1f1a',
          text2:  '#4a5248',
          text3:  '#8a9688',
        }
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
      }
    },
  },
  plugins: [],
}
