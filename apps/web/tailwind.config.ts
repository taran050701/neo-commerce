import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#050816',
        aurora: {
          violet: '#6366F1',
          teal: '#22D3EE',
          amber: '#FBBF24',
          blush: '#F472B6',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 25px 60px -25px rgba(12, 20, 38, 0.75)',
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '1.75rem',
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.35), transparent 55%), radial-gradient(circle at 90% 15%, rgba(34, 211, 238, 0.25), transparent 50%), radial-gradient(circle at 50% 90%, rgba(251, 191, 36, 0.18), transparent 55%)',
      },
    },
  },
  plugins: [forms, plugin(({ addComponents }) => {
    addComponents({
      '.glass-card': {
        '@apply bg-slate-900/55 backdrop-blur-3xl border border-white/10 shadow-glass rounded-3xl text-slate-100': '',
      },
    });
  })],
};

export default config;
