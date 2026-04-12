import postcss from "postcss"
import tailwindcss from "@tailwindcss/postcss"
import autoprefixer from "autoprefixer"
import cssnano from "cssnano"
import frutjam from "../index.js"
import { writeFileSync, mkdirSync, readFileSync, readdirSync, statSync, existsSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join, basename, extname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)
const rootDir = join(__dir, "..")
const srcDir = join(rootDir, "src")

const pkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"))
const version = pkg.version
const year = new Date().getFullYear()

const banner = `/*! frutjam v${version} (c) ${year} Nezanuha | Released under the MIT License | https://frutjam.com */\n`

// ── Helpers ──────────────────────────────────────────────────────────────────

function readFile(p) { return readFileSync(p, "utf8") }

function resolveImports(css, baseDir) {
  return css.replace(
    /@import\s+["']([^"']+)["'];?\s*/g,
    (_, importPath) => {
      const fullPath = join(baseDir, importPath)
      const importedCSS = readFile(fullPath)
      return resolveImports(importedCSS, dirname(fullPath))
    }
  )
}

function extractUtilityNames(css) {
  const names = []
  const re = /@utility\s+([\w-]+\*?)\s*\{/g
  let m
  while ((m = re.exec(css)) !== null) names.push(m[1])
  return [...new Set(names)]
}

function buildRegistry() {
  const components = {}
  const utilities = {}

  const componentsDir = join(srcDir, "components")
  for (const name of readdirSync(componentsDir)) {
    const entry = join(componentsDir, name, "base.css")
    if (statSync(join(componentsDir, name)).isDirectory() && existsSync(entry)) {
      components[name] = entry
    }
  }

  const utilitiesDir = join(srcDir, "utilities")
  for (const file of readdirSync(utilitiesDir)) {
    if (extname(file) === ".css") {
      utilities[basename(file, ".css")] = join(utilitiesDir, file)
    }
  }

  return { components, utilities }
}

// @custom-variant is a compile-time Tailwind directive — strip any that survive compilation
function stripCustomVariants(css) {
  const root = postcss.parse(css)
  root.walkAtRules("custom-variant", node => node.remove())
  return root.toString()
}

async function runTailwind(css, base = rootDir) {
  const result = await postcss([tailwindcss({ base }), autoprefixer()]).process(css, {
    from: join(base, "index.css"),
  })
  return stripCustomVariants(result.css)
}

async function runPostCSS(css) {
  const result = await postcss([autoprefixer()]).process(css, { from: undefined })
  return result.css
}

async function minify(css) {
  const result = await postcss([
    cssnano({ preset: ["default", { discardComments: { removeAll: false }, normalizeWhitespace: true }] })
  ]).process(css, { from: undefined })
  return result.css
}

function writeDist(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, banner + content)
  const rel = filePath.replace(rootDir + "/", "").replace(rootDir + "\\", "")
  console.log(`  ✓ ${rel}`)
}

// ── Context CSS (compile-time only — no output, used to compile @variant/@utility) ──

// Collect ALL @custom-variant definitions from base + every component's variants.css
// Required because some components use variants defined in sibling components (e.g. rating uses
// checked-or-aria-checked defined in checkbox). In a full build all variants are present; in
// per-component builds we must provide them explicitly so @variant references don't fail.
function collectAllVariants() {
  const parts = [
    resolveImports(readFile(join(srcDir, "base/variants.css")), join(srcDir, "base")),
    resolveImports(readFile(join(srcDir, "theme/variants.css")), join(srcDir, "theme")),
  ]
  // Scan every component folder for a variants.css
  const componentsDir = join(srcDir, "components")
  for (const name of readdirSync(componentsDir)) {
    const variantsFile = join(componentsDir, name, "variants.css")
    if (existsSync(variantsFile)) {
      parts.push(resolveImports(readFile(variantsFile), join(componentsDir, name)))
    }
  }
  return parts.join("\n")
}

const ALL_VARIANTS_CSS = collectAllVariants()


// Tailwind's default breakpoints — needed so @variant sm/md/lg compile inside @utility blocks.
// We define only these (not the full theme) so no Tailwind color/font vars pollute component files.
const BREAKPOINTS_CSS = `@theme {
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
  --breakpoint-2xl: 96rem;
}`

// Build a single module (component or utility) through Tailwind.
// Does NOT use @import "tailwindcss" — that would trigger project file scanning and emit
// Tailwind's standard utilities (.flex, .grid, .container, etc.) from scanned HTML.
// Instead: declare layers + define only breakpoints + safelist our @utility names.
// Output is ONLY the component's compiled CSS classes — no Tailwind base or theme.
async function buildModule(cssContent) {
  const utilityNames = extractUtilityNames(cssContent)
  if (utilityNames.length === 0) {
    return runPostCSS(cssContent)
  }
  const safelist = utilityNames.join(" ")
  const input = [
    `@import "tailwindcss/utilities";`,
    `@source inline("${safelist}");`,
    BREAKPOINTS_CSS,
    ALL_VARIANTS_CSS,
    cssContent,
  ].join("\n")
  return (await runTailwind(input, srcDir)).trim()
}

// ── Registry ──────────────────────────────────────────────────────────────────

const REGISTRY = buildRegistry()
const distDir = join(rootDir, "dist")

// ── 1. Full bundle ────────────────────────────────────────────────────────────

console.log(`\nBuilding frutjam v${version} CDN files...\n[full bundle]`)

const resolved = await postcss([frutjam({ logs: false })]).process("", { from: undefined })
const allSafelist = extractUtilityNames(resolved.css).join(" ")

const fullInput = `@import "tailwindcss";\n@source inline("${allSafelist}");`
const fullResult = await postcss([
  frutjam({ logs: false }),
  tailwindcss(),
  autoprefixer(),
]).process(fullInput, { from: join(rootDir, "index.css") })

writeDist(join(distDir, "frutjam.min.css"), await minify(fullResult.css))

// ── 2. Base ───────────────────────────────────────────────────────────────────

console.log("\n[base]")

// reboot.css already imports variants.css + tokens.css — just resolve and compile
// theme/base.css provides @theme inline (compile-time) + default theme CSS vars
const baseCssRaw = [
  resolveImports(readFile(join(srcDir, "base/reboot.css")), join(srcDir, "base")),
  resolveImports(readFile(join(srcDir, "theme/base.css")), join(srcDir, "theme")),
].join("\n")

// Run through Tailwind so @custom-variant / @theme inline compile away correctly
const baseCompiled = await runTailwind(baseCssRaw)
writeDist(join(distDir, "base.css"), await minify(baseCompiled))

// ── 3. Themes ─────────────────────────────────────────────────────────────────

console.log("\n[themes]")

for (const theme of ["darkberry", "snowberry"]) {
  const css = readFile(join(srcDir, `theme/default/${theme}.css`))
  // Plain CSS — @layer theme + CSS vars, no Tailwind syntax
  const compiled = await runPostCSS(css)
  writeDist(join(distDir, `themes/${theme}.css`), await minify(compiled))
}

// ── 4. Components ─────────────────────────────────────────────────────────────

console.log("\n[components]")

for (const [name, filePath] of Object.entries(REGISTRY.components)) {
  const css = resolveImports(readFile(filePath), dirname(filePath))
  const compiled = await buildModule(css)
  writeDist(join(distDir, `components/${name}.css`), await minify(compiled))
}

// ── 5. Utilities ──────────────────────────────────────────────────────────────

console.log("\n[utilities]")

for (const [name, filePath] of Object.entries(REGISTRY.utilities)) {
  const css = resolveImports(readFile(filePath), dirname(filePath))
  const compiled = await buildModule(css)
  writeDist(join(distDir, `utilities/${name}.css`), await minify(compiled))
}

console.log(`\n🎉 CDN build complete!`)
