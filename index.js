import { readFileSync, readdirSync, statSync, existsSync } from "fs"
import { join, dirname, basename, extname } from "path"
import { fileURLToPath } from "url"
import postcss from "postcss"

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)
const srcDir = join(__dir, "src")

// ── Registry (built once at startup, not per build) ──────────────────────────

function buildRegistry() {
  const registry = {}

  // Components: src/components/*/base.css — keyed by folder name
  const componentsDir = join(srcDir, "components")
  for (const name of readdirSync(componentsDir)) {
    const entry = join(componentsDir, name, "base.css")
    if (statSync(join(componentsDir, name)).isDirectory() && existsSync(entry)) {
      registry[name] = entry
    }
  }

  // Utilities: src/utilities/*.css — keyed by filename without extension
  const utilitiesDir = join(srcDir, "utilities")
  for (const file of readdirSync(utilitiesDir)) {
    if (extname(file) === ".css") {
      registry[basename(file, ".css")] = join(utilitiesDir, file)
    }
  }

  return registry
}

const REGISTRY = buildRegistry()

// ── Helpers ─────────────────────────────────────────────────────────────────

function readFile(p) { return readFileSync(p, "utf8") }

function parseList(val) {
  if (!val) return []
  if (Array.isArray(val)) return val.map(s => s.trim()).filter(Boolean)
  return String(val).split(",").map(s => s.trim()).filter(Boolean)
}

function applyPrefix(css, prefix) {
  if (!prefix) return css

  css = css.replace(
    /@utility\s+([\w-]+\*?)\s*\{/g,
    (_, name) => `@utility ${prefix}-${name} {`
  )
  css = css.replace(
    /@apply\s+([^;{}\n]+)/g,
    (_, classes) => `@apply ${classes.trim().split(/\s+/).map(c => `${prefix}-${c}`).join(' ')}`
  )
  css = css.replace(
    /\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|\.(([a-z][a-z0-9]*-?)+)/g,
    (match, name) => name ? `.${prefix}-${name}` : match
  )
  return css
}

function resolveImports(css, baseDir) {
  return css.replace(
    /@import\s+["']([^"']+)["'];?\s*/g,
    (_, importPath) => {
      const fullPath = join(baseDir, importPath)
      const importedDir = dirname(fullPath)
      const importedCSS = readFile(fullPath)
      return resolveImports(importedCSS, importedDir)
    }
  )
}

function buildCustomThemes(themes) {
  if (!themes || Object.keys(themes).length === 0) return ""

  return Object.entries(themes)
    .map(([name, vars]) => {
      const varString = Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n")
      return `[data-theme="${name}"] {\n${varString}\n}`
    })
    .join("\n\n")
}

// ── Base layers (inlined — no entry CSS files needed) ───────────────────────

const BASE_FULL = [
  "base/reboot.css",
  "theme/base.css",
]

const BASE_CORE = [
  "base/variants.css",
  "base/tokens.css",
  "theme/base.css",
]

// ── Build ────────────────────────────────────────────────────────────────────

function buildCSS(prefix, themes, reset, rootSelector, include, exclude) {
  // Resolve which components+utilities to include
  let keys = Object.keys(REGISTRY)
  if (include.length > 0) {
    keys = include.filter(k => REGISTRY[k])
  } else if (exclude.length > 0) {
    const excludeSet = new Set(exclude)
    keys = keys.filter(k => !excludeSet.has(k))
  }

  // Base layer (full with reboot, or core without)
  const baseFiles = reset ? BASE_FULL : BASE_CORE
  const baseCss = baseFiles
    .map(f => resolveImports(readFile(join(srcDir, f)), join(srcDir, dirname(f))))
    .join("\n")

  // Components + utilities
  const modulesCss = keys
    .map(k => resolveImports(readFile(REGISTRY[k]), dirname(REGISTRY[k])))
    .join("\n")

  let css = baseCss + "\n" + modulesCss

  if (rootSelector !== ":root") {
    css = css.replace(/:root\b/g, rootSelector)
  }

  css = applyPrefix(css, prefix)

  const customThemes = buildCustomThemes(themes)
  if (customThemes) css += "\n\n" + customThemes

  return css
}

// ── Plugin ───────────────────────────────────────────────────────────────────

export default function frutjam(options = {}) {
  const prefix       = typeof options.prefix === "string" ? options.prefix.trim() : ""
  const themes       = typeof options.themes === "object" ? options.themes : {}
  const reset        = options.reset !== false
  const rootSelector = typeof options.root === "string" ? options.root : ":root"
  const logs         = options.logs !== false
  const include      = parseList(options.include)
  const exclude      = parseList(options.exclude)

  return {
    postcssPlugin: "frutjam",
    Once(root) {
      const css = buildCSS(prefix, themes, reset, rootSelector, include, exclude)
      root.append(postcss.parse(css).nodes)
      if (logs) console.log(`\x1b[36mfrutjam v2\x1b[0m loaded${prefix ? ` with prefix "${prefix}-"` : ""}`)
    }
  }
}
frutjam.postcss = true
