import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Token warna identitas Pertamina (lihat UIUX Section 3.1)
      colors: {
        pertamina: {
          red: '#BA313B',
          blue: '#3C6DB2',
          green: '#ADC52D',
          black: '#101410',
        },
        // Palet premium turunan — biru korporat yang lebih dalam + aksen sampanye.
        brand: {
          50: '#EEF4FB',
          100: '#D6E4F5',
          200: '#AEC8EA',
          300: '#7FA6D9',
          400: '#5587C6',
          500: '#3C6DB2',
          600: '#2F5793',
          700: '#274875',
          800: '#1E3759',
          900: '#16273E',
        },
        // Aksen "mahal": emas sampanye untuk garis & sorotan halus.
        gold: {
          DEFAULT: '#B8924A',
          soft: '#D9BE84',
          light: '#F2E7CF',
        },
        ink: {
          DEFAULT: '#14181C',
          soft: '#3C434C',
          muted: '#6A727C',
        },
        line: '#E7E4DE',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Serif display mewah untuk judul (kesan editorial & berkelas).
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      borderRadius: {
        '4xl': '32px',
      },
      boxShadow: {
        // Bayangan berlapis lembut — kunci tampilan premium (bukan shadow datar).
        premium: '0 1px 2px rgba(20,24,28,0.04), 0 6px 16px -6px rgba(20,24,28,0.08), 0 18px 40px -16px rgba(20,24,28,0.10)',
        'premium-lg': '0 2px 4px rgba(20,24,28,0.04), 0 12px 28px -8px rgba(20,24,28,0.10), 0 32px 64px -24px rgba(20,24,28,0.16)',
        card: '0 1px 2px rgba(20,24,28,0.04), 0 8px 24px -12px rgba(20,24,28,0.10)',
        float: '0 24px 60px -20px rgba(20,24,28,0.28)',
        'inset-line': 'inset 0 0 0 1px rgba(255,255,255,0.6)',
        glow: '0 0 0 1px rgba(60,109,178,0.15), 0 8px 24px -6px rgba(60,109,178,0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3C6DB2 0%, #274875 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #5587C6 0%, #2F5793 100%)',
        'ink-gradient': 'linear-gradient(150deg, #1B2026 0%, #0E1216 100%)',
        'gold-line': 'linear-gradient(90deg, transparent, #D9BE84 50%, transparent)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};
