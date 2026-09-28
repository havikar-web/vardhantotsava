/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F0E3',
        cream: '#EFE1CB',
        gold: {
          light: '#D4AF37',
          DEFAULT: '#B47A18',
          dark: '#8C5D0D',
          hover: '#9A6712',
        },
        charcoal: {
          light: '#3D312A',
          DEFAULT: '#251B14',
          dark: '#18110D',
        },
        homa: {
          light: '#7A381C',
          DEFAULT: '#5A2914',
          dark: '#1C1613',
        },
        saffron: {
          light: '#F59E0B',
          DEFAULT: '#D97706',
          dark: '#B45309',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'DM Sans', 'sans-serif'],
        sanskrit: ['Noto Serif Devanagari', 'serif'],
      },
      boxShadow: {
        'sacred': '0 10px 30px -10px rgba(180, 122, 24, 0.15)',
        'sacred-lg': '0 20px 40px -15px rgba(37, 27, 20, 0.12)',
        'gold-glow': '0 0 25px rgba(180, 122, 24, 0.25)',
      }
    },
  },
  plugins: [],
};
