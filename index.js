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
  // Handles: .classname, :has(.x), :not(.x), :is(.x), :where(.x), & .x, > .x etc.
  css = css.replace(
    /\.(([a-z][a-z0-9]*-?)+)/g,
    (match, name) => `.${prefix}-${name}`
  )

  return css
}

/**
 * Recursively resolves @import statements and returns
 * a single flat CSS string with all imports inlined
 */
function resolveImports(css, baseDir) {
  return css.replace(
    /@import\s+["']([^"']+)["'];?\s*/g,
    (_, importPath) => {
      const fullPath = join(baseDir, importPath)
      const importedDir = dirname(fullPath)
      const importedCSS = readFile(fullPath)
      // Recursively resolve nested imports
      return resolveImports(importedCSS, importedDir)
    }
  )
}

function buildCSS(prefix) {
  // Read frutjam.css and recursively resolve all @imports
  const entryCss = readFile(join(srcDir, "frutjam.css"))
  let resolved = resolveImports(entryCss, srcDir)

  // Apply prefix to all @utility names
  resolved = applyPrefix(resolved, prefix)
  
  // Debug — check @apply is prefixed
  const applyMatch = resolved.match(/@apply.+/g)
  if (applyMatch) console.log("@apply found:", applyMatch)
  
  return resolved
}

export default function frutjam(options = {}) {
  const prefix = typeof options.prefix === "string" ? options.prefix.trim() : ""

  return {
    postcssPlugin: "frutjam",
    Once(root) {
      const css = buildCSS(prefix)
      // append instead of prepend — ensures frutjam CSS is inside Tailwind's layer system
      root.append(postcss.parse(css).nodes)
      console.log(`\x1b[36mfrutjam v2\x1b[0m loaded${prefix ? ` with prefix "${prefix}-"` : ""}`)
    }
  }
}