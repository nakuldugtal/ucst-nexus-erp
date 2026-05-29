/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.45), 0 0 60px rgba(75, 85, 99, 0.18)'
      },
      backgroundImage: {
        'mesh-dark': 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.09), transparent 24%), radial-gradient(circle at 80% 0%, rgba(114, 124, 245, 0.10), transparent 22%), radial-gradient(circle at 100% 100%, rgba(33, 150, 243, 0.08), transparent 24%)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};