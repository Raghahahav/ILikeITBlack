/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#09090b',
          1: '#0f0f11',
          2: '#18181b',
          3: '#1f1f23',
          4: '#27272a',
        },
        border: {
          DEFAULT: '#27272a',
          subtle: '#1f1f23',
          hover: '#3f3f46',
        },
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
          faint: '#52525b',
        },
        accent: {
          DEFAULT: '#a78bfa',
          dim: '#7c3aed',
          glow: 'rgba(167, 139, 250, 0.15)',
          subtle: 'rgba(167, 139, 250, 0.08)',
        },
        status: {
          success: '#4ade80',
          error: '#f87171',
          warning: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-right': 'slideRight 0.2s ease-out',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
