import postcss from "postcss"
import postcssJs from "postcss-js"
import tailwindcss from "@tailwindcss/postcss"
import autoprefixer from "autoprefixer"
import { writeFileSync, mkdirSync, readFileSync, readdirSync, statSync, existsSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join, basename, extname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)
const rootDir = join(__dir, "..")
const srcDir = join(rootDir, "src")
const distDir = join(rootDir, "dist")

const pkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"))
const version = pkg.version
const year = new Date().getFullYear()
const banner = `/*! frutjam v${version} (c) ${year} Nezanuha | MIT License | https://frutjam.com */\n`

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

// Collect ALL @custom-variant definitions so cross-component variant references compile
function collectAllVariants() {
  const parts = [
    resolveImports(readFile(join(srcDir, "base/variants.css")), join(srcDir, "base")),
    resolveImports(readFile(join(srcDir, "theme/variants.css")), join(srcDir, "theme")),
  ]
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

const BREAKPOINTS_CSS = `@theme {
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
  --breakpoint-2xl: 96rem;
}`

// ── Build registry ───────────────────────────────────────────────────────────

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

const REGISTRY = buildRegistry()

// ── Tailwind compilation ─────────────────────────────────────────────────────

// @custom-variant is a compile-time Tailwind directive — strip any that survive compilation
// @layer properties is Tailwind's own @property block — already emitted by user's Tailwind build
function stripTailwindInternals(css) {
  const root = postcss.parse(css)
  root.walkAtRules("custom-variant", node => node.remove())
  root.walkAtRules("layer", node => {
    if (node.params === "properties") node.remove()
  })
  // Tailwind emits bare @property declarations for --tw-* variables — already
  // present in the user's own Tailwind build, don't duplicate in plugin output
  root.walkAtRules("property", node => node.remove())
  return root.toString()
}

async function runTailwind(css, base = rootDir) {
  const result = await postcss([tailwindcss({ base }), autoprefixer()]).process(css, {
    from: join(base, "index.css"),
  })
  return stripTailwindInternals(result.css)
}

async function runPostCSS(css) {
  const result = await postcss([autoprefixer()]).process(css, { from: undefined })
  return result.css
}

// Build a single module through Tailwind (no full @import "tailwindcss" — just utilities layer)
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

// ── CSS → JS object conversion ───────────────────────────────────────────────

// postcss-js returns camelCase keys (e.g. WebkitMaskSize → webkit-mask-size)
// We need kebab-case with proper vendor prefix dashes
function transformKeys(obj) {
  if (typeof obj !== "object" || obj === null) return obj
  // postcss-js uses arrays for duplicate CSS properties (fallbacks like -moz-fit-content / fit-content).
  // Tailwind's addBase doesn't support arrays — keep only the last (standard) value.
  // Vendor prefixes will be added by autoprefixer at the user's build step.
  if (Array.isArray(obj)) return obj[obj.length - 1]
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      let key = k.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
      // Restore leading dash for vendor-prefixed properties
      if (/^(webkit|moz|ms|o)-/.test(key)) key = "-" + key
      return [key, transformKeys(v)]
    })
  )
}

// postcss-js drops duplicate keys, so two @layer base blocks → only the last survives.
// Merge all top-level at-rule blocks with the same name+params into one before objectifying.
function mergeTopLevelAtRules(css) {
  const root = postcss.parse(css)
  const seen = new Map()
  root.each(node => {
    if (node.type !== "atrule") return
    const key = `${node.name} ${node.params}`
    if (seen.has(key)) {
      seen.get(key).append(...node.clone().nodes)
      node.remove()
    } else {
      seen.set(key, node)
    }
  })
  return root.toString()
}

function cssToJsObject(cssString) {
  const root = postcss.parse(mergeTopLevelAtRules(cssString))
  const raw = postcssJs.objectify(root)
  return transformKeys(raw)
}

// ── Output helpers ───────────────────────────────────────────────────────────

function writeDist(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content)
  const rel = filePath.replace(rootDir + "/", "").replace(rootDir + "\\", "")
  console.log(`  ✓ ${rel}`)
}

function toJSON(obj) {
  return JSON.stringify(obj, null, 0)
}

// ── Build ────────────────────────────────────────────────────────────────────

console.log(`\nBuilding frutjam v${version} plugin...\n`)

// 1. Base tokens (theme vars + defaults, no reboot)
// Note: src/theme/base.css (@theme inline) is intentionally excluded — it produces
// --color-base: var(--color-base-500) in @layer base, which creates a circular
// reference and overrides theme values in @layer theme (lower cascade precedence).
console.log("[base]")
const tokensCssRaw = resolveImports(readFile(join(srcDir, "base/tokens.css")), join(srcDir, "base"))
const tokensCompiled = await runTailwind(tokensCssRaw)
const BASE_TOKENS = cssToJsObject(tokensCompiled)

// Base reboot (full reset + tokens + theme)
const rebootCssRaw = resolveImports(readFile(join(srcDir, "base/reboot.css")), join(srcDir, "base"))
const rebootCompiled = await runTailwind(rebootCssRaw)
const BASE_REBOOT = cssToJsObject(rebootCompiled)

// Write per-module base files
writeDist(join(distDir, "base/tokens/object.js"), `export default ${toJSON(BASE_TOKENS)};\n`)
writeDist(join(distDir, "base/tokens/index.js"), [
  `import tokens from './object.js';`,
  ``,
  `export default ({ addBase }) => {`,
  `  addBase({ ...tokens });`,
  `};`,
  ``,
].join("\n"))

writeDist(join(distDir, "base/reboot/object.js"), `export default ${toJSON(BASE_REBOOT)};\n`)
writeDist(join(distDir, "base/reboot/index.js"), [
  `import reboot from './object.js';`,
  ``,
  `export default ({ addBase }) => {`,
  `  addBase({ ...reboot });`,
  `};`,
  ``,
].join("\n"))

// 2. Themes
console.log("\n[themes]")
const THEMES = {}
for (const theme of ["darkberry", "snowberry"]) {
  const css = readFile(join(srcDir, `theme/default/${theme}.css`))
  const compiled = await runPostCSS(css)
  THEMES[theme] = cssToJsObject(compiled)

  writeDist(join(distDir, `themes/${theme}/object.js`), `export default ${toJSON(THEMES[theme])};\n`)
  writeDist(join(distDir, `themes/${theme}/index.js`), [
    `import theme from './object.js';`,
    ``,
    `export default ({ addBase }) => {`,
    `  addBase({ ...theme });`,
    `};`,
    ``,
  ].join("\n"))
}

// 3. Components
console.log("\n[components]")
const COMPONENTS = {}
for (const [name, filePath] of Object.entries(REGISTRY.components)) {
  const css = resolveImports(readFile(filePath), dirname(filePath))
  const compiled = await buildModule(css)
  COMPONENTS[name] = cssToJsObject(compiled)

  writeDist(join(distDir, `components/${name}/object.js`), `export default ${toJSON(COMPONENTS[name])};\n`)
  writeDist(join(distDir, `components/${name}/index.js`), [
    `import ${name.replace(/-/g, "_")} from './object.js';`,
    `import { addPrefix } from '../../functions/addPrefix.js';`,
    ``,
    `export default ({ addUtilities, prefix = '' }) => {`,
    `  const prefixed = addPrefix(${name.replace(/-/g, "_")}, prefix);`,
    `  addUtilities({ ...prefixed });`,
    `};`,
    ``,
  ].join("\n"))
}

// 4. Utilities — all registered via addUtilities() so variants (lg:, hover:, etc.) work
console.log("\n[utilities]")
const UTILITIES = {}
for (const [name, filePath] of Object.entries(REGISTRY.utilities)) {
  const css = resolveImports(readFile(filePath), dirname(filePath))
  const compiled = await buildModule(css)
  const jsObj = cssToJsObject(compiled)
  UTILITIES[name] = jsObj

  writeDist(join(distDir, `utilities/${name}/object.js`), `export default ${toJSON(jsObj)};\n`)
  writeDist(join(distDir, `utilities/${name}/index.js`), [
    `import ${name.replace(/-/g, "_")} from './object.js';`,
    `import { addPrefix } from '../../functions/addPrefix.js';`,
    ``,
    `export default ({ addUtilities, prefix = '' }) => {`,
    `  const prefixed = addPrefix(${name.replace(/-/g, "_")}, prefix);`,
    `  addUtilities({ ...prefixed });`,
    `};`,
    ``,
  ].join("\n"))
}

// 5. addPrefix function
console.log("\n[functions]")
writeDist(join(distDir, "functions/addPrefix.js"), [
  `function prefixClassesInSelector(sel, prefix) {`,
  `  return sel.replace(/\\.([\\.\\w-]+)/g, (_, name) => "." + prefix + name)`,
  `}`,
  ``,
  `export function addPrefix(obj, prefix) {`,
  `  if (!prefix) return obj`,
  `  return Object.fromEntries(`,
  `    Object.entries(obj).map(([key, value]) => {`,
  `      const newKey = key.startsWith("@") ? key : prefixClassesInSelector(key, prefix)`,
  `      const newValue = (value && typeof value === "object") ? addPrefix(value, prefix) : value`,
  `      return [newKey, newValue]`,
  `    })`,
  `  )`,
  `}`,
  ``,
].join("\n"))

// 6. Theme config — extract @theme inline declarations to replicate in plugin.withOptions config
//    so users don't need @import "frutjam/theme" for Tailwind color utilities (bg-base-200 etc.)
const THEME_CONFIG = (() => {
  const themeCss = readFile(join(srcDir, "theme/base.css"))
  const root = postcss.parse(themeCss)
  const colors = {}
  root.walkAtRules("theme", node => {
    if (!node.params.includes("inline")) return
    node.walkDecls(decl => {
      if (decl.prop.startsWith("--color-")) {
        colors[decl.prop.slice("--color-".length)] = decl.value.trim()
      }
    })
  })
  return colors
})()

// 7. Bundled plugin.js
console.log("\n[plugin.js]")

const pluginJs = `${banner}
// Tailwind v4 plugin.withOptions implementation
const plugin = {
  withOptions: (pluginFn, configFn = () => ({})) => {
    const optionsFn = (options) => {
      const handler = pluginFn(options)
      const config = configFn(options)
      return { handler, config }
    }
    optionsFn.__isOptionsFunction = true
    return optionsFn
  }
}

// Pre-built CSS-in-JS objects (generated by build-plugin.mjs)
const BASE_TOKENS = ${toJSON(BASE_TOKENS)}

const BASE_REBOOT = ${toJSON(BASE_REBOOT)}

const THEMES = ${toJSON(THEMES)}

const COMPONENTS = ${toJSON(COMPONENTS)}

const UTILITIES = ${toJSON(UTILITIES)}

// Color name → CSS variable mapping (mirrors @theme inline in frutjam/theme)
const THEME_CONFIG = ${toJSON(THEME_CONFIG)}

// Prefix all class selectors in a selector string: ".tab" → ".fj-tab", "& > .tab" → "& > .fj-tab"
function prefixClassesInSelector(sel, prefix) {
  return sel.replace(/\\.([\\.\\w-]+)/g, (_, name) => "." + prefix + name)
}

// Prefix class selectors in all keys (top-level and nested), and recurse into values
function addPrefix(obj, prefix) {
  if (!prefix) return obj
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const newKey = key.startsWith("@") ? key : prefixClassesInSelector(key, prefix)
      const newValue = (value && typeof value === "object") ? addPrefix(value, prefix) : value
      return [newKey, newValue]
    })
  )
}

// Split a CSS-in-JS object into utility class selectors and everything else.
// addUtilities() only accepts single class selectors (e.g. ".btn"); at-rules
// like @container, @keyframes, and non-class selectors must go to addBase().
function splitStyles(styles) {
  const base = {}
  const utils = {}
  for (const [k, v] of Object.entries(styles)) {
    if (/^\\.[a-z]/.test(k)) utils[k] = v
    else base[k] = v
  }
  return { base, utils }
}

// Recursively remap :root keys to a custom selector
function remapRoot(obj, rootSelector) {
  if (!rootSelector || rootSelector === ":root") return obj
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const newKey = k.replace(/:root\\b/g, rootSelector)
      const newVal = (v && typeof v === "object") ? remapRoot(v, rootSelector) : v
      return [newKey, newVal]
    })
  )
}

export default plugin.withOptions(
  (options = {}) => ({ addBase, addUtilities }) => {
    const {
      prefix    = "",
      reset     = true,
      root      = ":root",
      logs      = true,
      themes    = Object.keys(THEMES),
      include   = [],
      exclude   = [],
    } = typeof options === "string" ? {} : (options || {})

    const p = prefix ? prefix + "-" : ""

    if (logs) console.log(\`\\x1b[36mfrutjam v${version}\\x1b[0m loaded\${prefix ? \` with prefix "\${prefix}-"\` : ""}\`)

    const shouldInclude = (name) => {
      if (include.length > 0 && exclude.length > 0) return include.includes(name) && !exclude.includes(name)
      if (include.length > 0) return include.includes(name)
      if (exclude.length > 0) return !exclude.includes(name)
      return true
    }

    // Base
    addBase(remapRoot(reset ? BASE_REBOOT : BASE_TOKENS, root))

    // Themes
    const activeThemes = Array.isArray(themes) ? themes : [themes]
    for (const [name, styles] of Object.entries(THEMES)) {
      if (activeThemes.includes(name)) addBase(styles)
    }

    // Components — class selectors via addUtilities (enables lg:/hover:/etc. variants),
    // non-class rules (e.g. @container, @keyframes) via addBase
    for (const [name, styles] of Object.entries(COMPONENTS)) {
      if (shouldInclude(name)) {
        const s = p ? addPrefix(styles, p) : styles
        const { base, utils } = splitStyles(s)
        if (Object.keys(base).length) addBase(base)
        if (Object.keys(utils).length) addUtilities(utils)
      }
    }

    // Utilities — same split: class selectors via addUtilities, rest via addBase
    for (const [name, styles] of Object.entries(UTILITIES)) {
      if (shouldInclude(name)) {
        const s = p ? addPrefix(styles, p) : styles
        const { base, utils } = splitStyles(s)
        if (Object.keys(base).length) addBase(base)
        if (Object.keys(utils).length) addUtilities(utils)
      }
    }
  },
  () => ({
    theme: {
      extend: {
        colors: THEME_CONFIG
      }
    }
  })
)
`

writeDist(join(distDir, "plugin.js"), pluginJs)

console.log(`\n🎉 Plugin build complete!`)
