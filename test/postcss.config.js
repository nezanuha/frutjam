import frutjam from "frutjam"
import tailwindcss from "@tailwindcss/postcss"

export default {
  plugins: [
    frutjam({
      prefix: "fj",
      themes: {
        ocean: {
          "--color-primary": "oklch(60% 0.2 220)",
          "--color-on-primary": "oklch(98% 0.01 220)",
          "--color-secondary": "oklch(70% 0.18 160)",
          "--color-on-secondary": "oklch(98% 0.01 160)",
          "--color-base": "oklch(98% 0.01 220)",
          "--color-on-base": "oklch(20% 0.02 220)",
          "--border-radius": "0.5rem",
          "--scheme-color": "light",
        }
      }
    }),
    tailwindcss(),
  ]
}