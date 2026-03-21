// postcss.config.js
import frutjam from "frutjam"
import tailwindcss from "@tailwindcss/postcss"

export default {
  plugins: [
    frutjam({ prefix: "fj" }),
    tailwindcss(),
  ]
}