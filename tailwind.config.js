/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1A237E',
          navyDark: '#121858',
          navyLight: '#283593',
          pink: '#E91E63',
          pinkLight: '#F06292',
          orange: '#FF9800',
          orangeLight: '#FFB74D',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          muted: '#64748B'
        }
      },
      boxShadow: {
        'clean': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'clean-md': '0 4px 20px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)',
        'clean-lg': '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'clean-hover': '0 8px 25px rgba(26, 35, 126, 0.08)',
      }
    },
  },
  plugins: [],
}

