import postcss from "postcss"
import tailwindcss from "@tailwindcss/postcss"
import cssnano from "cssnano"
import frutjam from "../index.js"
import { writeFileSync, mkdirSync, readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)
const rootDir = join(__dir, "..")

// Read version from package.json
const pkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"))
const version = pkg.version

const banner = `/*! frutjam v${version} (c) ${new Date().getFullYear()} Nezanuha | Released under the MIT License | https://frutjam.com */\n`

console.log(`Building frutjam v${version} CDN files...`)

const css = `@import "tailwindcss";`

// 1. Unminified
const result = await postcss([
  frutjam(),
  tailwindcss(),
]).process(css, {
  from: join(rootDir, "index.css"),
})

mkdirSync(join(rootDir, "dist"), { recursive: true })
writeFileSync(join(rootDir, "dist/frutjam.css"), banner + result.css)
console.log("✅ dist/frutjam.css")

// 2. Minified
const minified = await postcss([
  cssnano({ preset: "default" })
]).process(result.css, { from: undefined })

writeFileSync(join(rootDir, "dist/frutjam.min.css"), banner + minified.css)
console.log("✅ dist/frutjam.min.css")

console.log(`\n🎉 CDN build complete!`)