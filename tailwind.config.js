/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color scheme based on Stitch designs
        primary: {
          DEFAULT: '#38e07b',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#38e07b',
          600: '#2fbc68',
          700: '#2dad60',
          800: '#166534',
          900: '#14532d',
        },
        background: {
          DEFAULT: '#122118',
          secondary: '#1a221c',
        },
        surface: {
          DEFAULT: '#264532',
          light: '#366348',
        },
        text: {
          primary: '#ffffff',
          secondary: '#96c5a9',
        },
        // Gray scale matching the design
        gray: {
          800: '#264532',
          900: '#122118',
        }
      },
      fontFamily: {
        sans: ['Spline Sans', 'Noto Sans', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        'xl': '0.75rem',
        'full': '9999px',
      },
      spacing: {
        '14': '3.5rem',
        '16': '4rem',
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  darkMode: 'class',
};

