import frutjam from "../index.js"
import tailwindcss from "@tailwindcss/postcss"

export default {
  plugins: [
    frutjam({ prefix: "fj" }),
    tailwindcss(),
  ]
}