/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Cinzel', 'Georgia', 'serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        primary: {
          50:      '#f0fdf0',
          100:     '#dcfce7',
          200:     '#bbf7d0',
          DEFAULT: '#1B5E20',
          light:   '#2E7D32',
          lighter: '#4CAF50',
          dark:    '#154A19',
          900:     '#052e16',
        },
        accent: {
          DEFAULT: '#F9A825',
          light:   '#FDD835',
          dark:    '#F57F17',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#F8FAFC',
          subtle:  '#F1F5F9',
        },
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
        'card-lg': '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.10)',
        'hover':   '0 8px 24px rgba(27,94,32,0.16), 0 2px 8px rgba(27,94,32,0.08)',
        'green':   '0 4px 24px rgba(27,94,32,0.25)',
        'glass':   '0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
        'inner-sm':'inset 0 1px 2px rgba(0,0,0,0.05)',
        'glow':    '0 0 0 3px rgba(27,94,32,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-up':        'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-up-sm':     'fadeUpSm 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':       'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-down':     'slideDown 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':        'shimmer 1.8s infinite linear',
        'pulse-green':    'pulseGreen 2.5s cubic-bezier(0.4,0,.6,1) infinite',
        'bounce-subtle':  'bounceSm 1.8s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUpSm: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseGreen: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
      },
      transitionTimingFunction: {
        'spring':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth':  'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
