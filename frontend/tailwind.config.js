/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Syne', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(15,23,42,0.08)',
        'card-hover': '0 4px 24px 0 rgba(15,23,42,0.12)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
