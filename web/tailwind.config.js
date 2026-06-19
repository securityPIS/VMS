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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
};
