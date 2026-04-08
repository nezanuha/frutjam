import postcss from "postcss"
import tailwindcss from "@tailwindcss/postcss"
import autoprefixer from "autoprefixer"
import cssnano from "cssnano"
import frutjam from "../index.js"
import { writeFileSync, mkdirSync, readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)
const rootDir = join(__dir, "..")

const pkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"))
const version = pkg.version
const year = new Date().getFullYear()

const banner = `/*! frutjam v${version} (c) ${year} Nezanuha | Released under the MIT License | https://frutjam.com */\n`

console.log(`Building frutjam v${version} CDN files...`)

// Extract all @utility names from the frutjam source so we can safelist them.
// Tailwind v4 only emits @utility classes that appear in scanned content.
// We inject them via @source inline(...) to ensure all components are always included.
function extractUtilityNames(css) {
  const names = []
  const re = /@utility\s+([\w-]+\*?)\s*\{/g
  let m
  while ((m = re.exec(css)) !== null) names.push(m[1])
  return [...new Set(names)]
}

// Run frutjam alone first to get the full resolved CSS for utility extraction
const resolved = await postcss([frutjam({ logs: false })]).process("", { from: undefined })
const utilityNames = extractUtilityNames(resolved.css)
const safelist = utilityNames.join(" ")

const css = `@import "tailwindcss";\n@source inline("${safelist}");`

// 1. Build with Tailwind + autoprefixer
const result = await postcss([
  frutjam({ logs: false }),
  tailwindcss(),
  autoprefixer(),
]).process(css, {
  from: join(rootDir, "index.css"),
})

mkdirSync(join(rootDir, "dist"), { recursive: true })

// 2. Unminified
writeFileSync(join(rootDir, "dist/frutjam.css"), banner + result.css)
console.log("✅ dist/frutjam.css")

// 3. Minified
const minified = await postcss([
  cssnano({
    preset: ["default", {
      discardComments: { removeAll: false }, // keep the banner comment
      normalizeWhitespace: true,
    }]
  })
]).process(result.css, { from: undefined })

writeFileSync(join(rootDir, "dist/frutjam.min.css"), banner + minified.css)
console.log("✅ dist/frutjam.min.css")

console.log(`\n🎉 CDN build complete!`)
