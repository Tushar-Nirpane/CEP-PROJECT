/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          navy: '#0C3B5D',
          hover: '#2C638A',
          cta: '#AC6953',
          ctaHover: '#8E523F',
          hero: '#FDFEFE',
          alt: '#E8EBEB',
          text: '#302D2D',
          secondary: '#2C638A',
          border: '#BEC3C8',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(12, 59, 93, 0.08), 0 4px 16px -4px rgba(12, 59, 93, 0.04)',
        cardHover: '0 8px 24px -4px rgba(12, 59, 93, 0.12), 0 4px 12px -2px rgba(12, 59, 93, 0.06)',
      }
    },
  },
  plugins: [],
}
