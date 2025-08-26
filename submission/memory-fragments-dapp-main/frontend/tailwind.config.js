/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'memory': {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fad7a5',
          300: '#f6bc6d',
          400: '#f19833',
          500: '#ed7a0b',
          600: '#de5e06',
          700: '#b84608',
          800: '#93380e',
          900: '#76300f',
        },
        'emotion': {
          happy: '#FEF08A',
          sad: '#93C5FD', 
          nostalgic: '#DDA0DD',
          excited: '#FCA5A5',
          peaceful: '#86EFAC',
        }
      },
      fontFamily: {
        'memory': ['Inter', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
