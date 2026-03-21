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
  return css.replace(
    /@utility\s+([\w-]+\*?)\s*\{/g,
    (_, name) => `@utility ${prefix}-${name} {`
  )
}

function stripLayerTheme(css) {
  return css.replace(/@layer\s+theme\s*\{([\s\S]*)\}\s*$/, "$1").trim()
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

  // Strip @layer theme { } wrappers
  resolved = resolved.replace(
    /@layer\s+theme\s*\{([\s\S]*?)\}(?=\s*(?:@|$|\.|#|:|\[))/g,
    (_, inner) => inner.trim()
  )

  // Apply prefix to all @utility names
  resolved = applyPrefix(resolved, prefix)

  return resolved
}

export default function frutjam(options = {}) {
  const prefix = typeof options.prefix === "string" ? options.prefix.trim() : ""

  return {
    postcssPlugin: "frutjam",
    Once(root) {
      const css = buildCSS(prefix)
      root.prepend(postcss.parse(css).nodes)
      console.log(`\x1b[36mfrutjam v2\x1b[0m loaded${prefix ? ` with prefix "${prefix}-"` : ""}`)
    }
  }
}