/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./order-engine.js",
    "./products-data.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#FAF8F5',
          beige: '#F4EFEA',
          sand: '#EAE2D7',
          gold: '#C5A880',
          goldDark: '#9E8055',
          wine: '#6D2232',
          wineLight: '#8C3246',
          wineDark: '#521824',
          espresso: '#231F20',
          charcoal: '#3A3535',
          muted: '#7A726E'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '0.2': '0.05rem',
        '4.5': '1.125rem',
        '18': '4.5rem',
        '34': '8.5rem',
      },
      scale: {
        '98': '0.98',
      },
      borderRadius: {
        'xs': '0.125rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    }
  },
  plugins: [],
}
