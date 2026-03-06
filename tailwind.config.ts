import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#4F46E5', // Indigo
          hover: '#4338CA',
          light: '#6366F1',
        },
        secondary: {
          DEFAULT: '#22D3EE', // Cyan
          hover: '#06B6D4',
          light: '#67E8F9',
        },
        // Semantic Colors
        warning: {
          DEFAULT: '#F59E0B', // Amber
          light: '#FFFBEB',
          border: '#F59E0B',
        },
        success: {
          DEFAULT: '#10B981', // Emerald
          light: '#ECFDF5',
          border: '#10B981',
        },
        // Neutral Colors
        background: '#F9FAFB', // Off-white
        text: {
          primary: '#111827', // Dark Slate
          secondary: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'h1': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'code': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        'gutter': '24px',
        'container': '80px',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}

export default config
