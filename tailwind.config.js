/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        viva: {
          blue: '#1351B4',      // Azul institucional acolhedor e legível
          blueDark: '#0C326F',
          yellow: '#FFDF00',    // Amarelo para alto contraste
          green: '#15803D',     // Verde confirmação
          red: '#B91C1C',       // Vermelho alerta
        }
      },
      fontSize: {
        'accessible-sm': '1.125rem', // 18px mínimo
        'accessible-base': '1.375rem', // 22px
        'accessible-lg': '1.625rem', // 26px
        'accessible-xl': '2rem',     // 32px
        'accessible-2xl': '2.5rem',  // 40px
      }
    },
  },
  plugins: [],
}
