import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        military: {
          50: '#f0f4f0',
          100: '#dce8dc',
          200: '#b8d1b8',
          300: '#8ab38a',
          400: '#5e8f5e',
          500: '#3d6b3d',
          600: '#2d5a2d',
          700: '#1e4a1e',
          800: '#143514',
          900: '#0a240a',
          950: '#061506',
        },
        olive: {
          50: '#f7f6f0',
          100: '#eceadc',
          200: '#d8d3b9',
          300: '#c0b88f',
          400: '#a89d6b',
          500: '#8f8450',
          600: '#756b40',
          700: '#5d5434',
          800: '#4a432b',
          900: '#3a3523',
          950: '#1f1c12',
        },
        danger: '#dc2626',
        warning: '#d97706',
        success: '#16a34a',
        info: '#2563eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
