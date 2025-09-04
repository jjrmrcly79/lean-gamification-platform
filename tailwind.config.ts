import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    // ESTA ES LA PARTE CORREGIDA:
    // Le decimos que busque en todos los archivos .ts y .tsx DENTRO de la carpeta 'app'.
    // Esto incluye page.tsx, layout.tsx y todo lo que esté en app/components.
    './app/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'brand-blue': '#1A2E5B', // El azul marino de "Brito & Co"
        'brand-red': '#E63946',  // El rojo del logo
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config