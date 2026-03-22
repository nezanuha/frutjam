// scripts/build-cdn.mjs
import postcss from "postcss"
import tailwindcss from "@tailwindcss/postcss"
import frutjam from "../index.js"
import { writeFileSync, mkdirSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)
const rootDir = join(__dir, "..")

console.log("Building frutjam CDN file...")

const css = `@import "tailwindcss";`

const result = await postcss([
  frutjam(),
  tailwindcss(),
]).process(css, { 
  from: join(rootDir, "index.css"), // gives Tailwind a base path to resolve from
})

mkdirSync(join(rootDir, "dist"), { recursive: true })
writeFileSync(join(rootDir, "dist/frutjam.css"), result.css)

console.log("✅ CDN build complete → dist/frutjam.css")