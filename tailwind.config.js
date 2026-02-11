/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#334155',
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',

        neutral: {
          900: '#111827',
          700: '#374151',
          500: '#6B7280',
          300: '#E5E7EB',
          100: '#F3F4F6',
          50:  '#F9FAFB',
        },
      },
    },
  },
  plugins: [],
}
