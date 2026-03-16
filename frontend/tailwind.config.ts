import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Page & surface
        'page':      'var(--bg-page)',
        'surface':   'var(--bg-surface)',
        'hov':       'var(--bg-hover)',
        'selected':  'var(--bg-selected)',
        // Borders
        'bdr':       'var(--border)',
        'bdr-strong':'var(--border-strong)',
        // Blue (primary)
        'b500':  'var(--blue-500)',
        'b100':  'var(--blue-100)',
        'b700':  'var(--blue-700)',
        // Green
        'g500':  'var(--green-500)',
        'g100':  'var(--green-100)',
        'g700':  'var(--green-700)',
        // Amber
        'a500':  'var(--amber-500)',
        'a100':  'var(--amber-100)',
        'a700':  'var(--amber-700)',
        // Red
        'r500':  'var(--red-500)',
        'r100':  'var(--red-100)',
        'r700':  'var(--red-700)',
        // Text
        'tp':    'var(--text-primary)',
        'ts':    'var(--text-secondary)',
        'tt':    'var(--text-tertiary)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        '11': ['11px', { lineHeight: '1.4' }],
        '12': ['12px', { lineHeight: '1.4' }],
        '13': ['13px', { lineHeight: '1.5' }],
        '14': ['14px', { lineHeight: '1.5' }],
        '15': ['15px', { lineHeight: '1.4' }],
        '20': ['20px', { lineHeight: '1.3' }],
        '24': ['24px', { lineHeight: '1.2' }],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.7)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        drawBar: {
          from: { width: '0%' },
          to: { width: 'var(--bar-width)' },
        },
        blinkCursor: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideIndicator: {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':      'fadeIn 150ms ease forwards',
        'pulse-dot':    'pulseDot 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s linear infinite',
        'blink-cursor': 'blinkCursor 1s step-end infinite',
        'count-up':     'countUp 300ms ease-out forwards',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'dropdown':'0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        'tooltip': '0 2px 8px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
