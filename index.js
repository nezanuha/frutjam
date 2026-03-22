import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import postcss from "postcss"

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)
const srcDir = join(__dir, "src")

function readFile(p) { return readFileSync(p, "utf8") }

function applyPrefix(css, prefix) {
  if (!prefix) return css

  // 1. Prefix @utility names
  css = css.replace(
    /@utility\s+([\w-]+\*?)\s*\{/g,
    (_, name) => `@utility ${prefix}-${name} {`
  )
  // 2. Prefix @apply class references
  css = css.replace(
    /@apply\s+([\w-]+)/g,
    (_, name) => `@apply ${prefix}-${name}`
  )
  // 3. Prefix class references inside CSS body
  css = css.replace(
    /\.(([a-z][a-z0-9]*-?)+)/g,
    (match, name) => `.${prefix}-${name}`
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

function buildCSS(prefix, themes = {}) {
  const entryCss = readFile(join(srcDir, "frutjam.css"))
  let resolved = resolveImports(entryCss, srcDir)
  resolved = applyPrefix(resolved, prefix)

  // Append custom themes
  const customThemes = buildCustomThemes(themes)
  if (customThemes) resolved += "\n\n" + customThemes

  return resolved
}

export default function frutjam(options = {}) {
  const prefix = typeof options.prefix === "string" ? options.prefix.trim() : ""
  const themes = typeof options.themes === "object" ? options.themes : {}

  return {
    postcssPlugin: "frutjam",
    Once(root) {
      const css = buildCSS(prefix, themes)
      root.append(postcss.parse(css).nodes)
      console.log(`\x1b[36mfrutjam v2\x1b[0m loaded${prefix ? ` with prefix "${prefix}-"` : ""}`)
    }
  }
}
frutjam.postcss = true