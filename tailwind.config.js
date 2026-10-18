/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          base: '#101114',
          panel: '#1A1C20',
          raised: '#22252A',
          border: '#303238',
          muted: '#2A2D33',
        },
        lime: {
          DEFAULT: '#B7F36B',
          soft: '#9BE050',
          dim: '#7CC23E',
          glow: 'rgba(183, 243, 107, 0.35)',
        },
        amber: {
          DEFAULT: '#F6C66A',
          soft: '#E0AE54',
        },
        rose: {
          DEFAULT: '#F47777',
          soft: '#D85F5F',
        },
        sky: {
          DEFAULT: '#6BC1F3',
          soft: '#5AA8D8',
        },
        content: {
          primary: '#F4F4F5',
          secondary: '#A1A1AA',
          faint: '#71717A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(183, 243, 107, 0.25), 0 8px 30px -8px rgba(183, 243, 107, 0.25)',
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -16px rgba(0,0,0,0.6)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
