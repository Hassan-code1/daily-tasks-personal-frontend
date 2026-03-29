/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#a78bfa',
        success: '#34d399',
        danger: '#f87171',
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        'accent-glow': '0 0 20px rgba(167,139,250,0.4)',
        'success-glow': '0 0 6px rgba(52,211,153,0.6)',
        'btn-glow': '0 4px 15px rgba(124,58,237,0.4)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
