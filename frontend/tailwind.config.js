export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { brand: { green: '#14532d', dark: '#0f3d22', soft: '#eaf5ee', gold: '#f59e0b', ink: '#17151a', bg: '#f6f8fb' } },
    fontFamily: { sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'] },
    keyframes: {
      float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      shimmer: { '100%': { transform: 'translateX(100%)' } },
    },
    animation: { float: 'float 4s ease-in-out infinite' },
  } },
  plugins: [],
};
