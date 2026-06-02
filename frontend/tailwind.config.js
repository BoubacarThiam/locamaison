/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Josefin Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Cinzel', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1B5E20',
          light:   '#2E7D32',
          lighter: '#4CAF50',
          dark:    '#154A19',
        },
        accent: {
          DEFAULT: '#F9A825',
          light:   '#FDD835',
          dark:    '#F0A000',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card:   '0 4px 24px rgba(0,0,0,0.08)',
        hover:  '0 8px 40px rgba(27,94,32,0.18)',
        glass:  '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
