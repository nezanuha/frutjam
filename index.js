import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import postcss from "postcss"

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)
const srcDir = join(__dir, "src")

const COMPONENTS = [
  "accordion", "alert", "badge", "breadcrumb", "button",
  "card", "checkbox", "radio", "divider", "drawer",
  "header", "input", "join", "link", "menu", "modal",
  "navbar", "popover", "progress", "sidebar", "surface",
  "table", "tooltip",
]

const UTILITIES = ["container", "headings", "para"]

function readFile(p) { return readFileSync(p, "utf8") }

function stripImports(css) {
  return css.replace(/@import\s+["'][^"']+["'];?\s*/g, "")
}

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

function buildCSS(prefix) {
  const parts = []

  parts.push(stripImports(readFile(join(srcDir, "base/variants.css"))))
  parts.push(stripImports(readFile(join(srcDir, "base/preflight.css"))))
  parts.push(stripLayerTheme(readFile(join(srcDir, "theme/jams/default/snowberry.css"))))
  parts.push(stripLayerTheme(readFile(join(srcDir, "theme/jams/default/darkberry.css"))))

  const extDir = join(srcDir, "theme/jams/extended")
  for (const f of readdirSync(extDir).filter(f => f.endsWith(".css") && f !== "base.css"))
    parts.push(stripLayerTheme(readFile(join(extDir, f))))

  const themeBase = readFile(join(srcDir, "theme/jams/base.css"))
  const inline = themeBase.match(/@theme\s+inline\s*\{[\s\S]*\}/)
  if (inline) parts.push(inline[0])

  parts.push(stripImports(readFile(join(srcDir, "theme/typography.css"))))

  parts.push(`@custom-variant dark (
    &:where([data-theme=dark],[data-theme=dark] *,
    [data-theme=darkberry],[data-theme=darkberry] *)
  );`)

  for (const name of COMPONENTS) {
    const dir = join(srcDir, "components", name)
    const files = readdirSync(dir)
      .filter(f => f.endsWith(".css") && f !== "safelist.css")
      .sort((a, b) => a === "base.css" ? -1 : b === "base.css" ? 1 : 0)
    for (const f of files)
      parts.push(applyPrefix(stripImports(readFile(join(dir, f))), prefix))
  }

  for (const name of UTILITIES) {
    const dir = join(srcDir, "utilities", name)
    for (const f of readdirSync(dir).filter(f => f.endsWith(".css") && f !== "safelist.css"))
      parts.push(applyPrefix(stripImports(readFile(join(dir, f))), prefix))
  }

  const animDir = join(srcDir, "theme/animation")
  for (const f of readdirSync(animDir).filter(f => f.endsWith(".css")))
    parts.push(readFile(join(animDir, f)))

  return parts.join("\n\n")
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
