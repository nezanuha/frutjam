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
          "--color-base": "oklch(98% 0.01 220)",
          "--color-on-base": "oklch(20% 0.02 220)",
          "--scheme-color": "light",
        },
        "ocean-dark": {
          "--color-primary": "oklch(65% 0.2 220)",
          "--color-on-primary": "oklch(10% 0.01 220)",
          "--color-base": "oklch(15% 0.02 220)",
          "--color-on-base": "oklch(95% 0.01 220)",
          "--scheme-color": "dark",
        }
      }
    }),
    tailwindcss(),
  ]
}