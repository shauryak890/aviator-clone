/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          primary: "#6B46C1", // Purple primary color
          secondary: "#4299E1", // Blue secondary color
          accent: "#38B2AC", // Teal accent color
          background: "#1A202C", // Dark blue background
          surface: "#2D3748", // Darker surface
          text: "#E2E8F0", // Light text
          red: "#F56565", // Red for crashed
          green: "#48BB78", // Green for success
          yellow: "#ECC94B", // Yellow for warning
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fly': 'fly 15s linear forwards',
        'crash': 'crash 0.5s ease-in forwards',
      },
      keyframes: {
        fly: {
          '0%': { transform: 'translateX(0) translateY(0) scale(1)' },
          '100%': { transform: 'translateX(200%) translateY(-100%) scale(1.5)' }
        },
        crash: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(45deg)' }
        }
      }
    },
  },
  plugins: [],
}
