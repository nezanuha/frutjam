// functions/plugin.js
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import plugin from "tailwindcss/plugin"

const __dir = dirname(fileURLToPath(import.meta.url))
const srcDir = join(__dir, "../src")

const COMPONENTS = [
  "accordion", "alert", "badge", "breadcrumb", "button",
  "card", "checkbox", "radio", "divider", "drawer",
  "header", "input", "join", "link", "menu", "modal",
  "navbar", "popover", "progress", "sidebar", "surface",
  "table", "tooltip",
]

const UTILITIES = ["container", "headings", "para"]

function readFile(filePath) {
  return readFileSync(filePath, "utf8")
}

function applyPrefixToUtilities(css, prefix) {
  if (!prefix) return css
  return css.replace(
    /@utility\s+([\w-]+\*?)\s*\{/g,
    (match, name) => `@utility ${prefix}-${name} {`
  )
}

function stripLayerTheme(css) {
  return css.replace(/@layer\s+theme\s*\{([\s\S]*)\}\s*$/, "$1").trim()
}

export function buildPlugin(options) {
  const { prefix, base, themes, logs } = options

  return plugin(
    function ({ addBase, addComponents, addVariant }) {

      // 1. Dark variant
      addVariant("dark", [
        "&:where([data-theme=dark], [data-theme=dark] *)",
        "&:where([data-theme=darkberry], [data-theme=darkberry] *)",
      ])

      // 2. Base / preflight
      if (base) {
        addBase({ "@import": `"${join(srcDir, "base/preflight.css")}"` })
      }

      // 3. Themes — inject as raw CSS via @layer base trick
      if (themes) {
        const snowberry = stripLayerTheme(
          readFile(join(srcDir, "theme/jams/default/snowberry.css"))
        )
        const darkberry = stripLayerTheme(
          readFile(join(srcDir, "theme/jams/default/darkberry.css"))
        )

        // Use addBase with CSS string wrapped in a :root rule hack
        addBase({ [snowberry]: "" })
        addBase({ [darkberry]: "" })

        // @theme inline block
        const themeBase = readFile(join(srcDir, "theme/jams/base.css"))
        const inlineMatch = themeBase.match(/@theme\s+inline\s*\{[\s\S]*\}/)
        if (inlineMatch) addBase({ [inlineMatch[0]]: "" })
      }

      // 4. Components
      for (const name of COMPONENTS) {
        const dir = join(srcDir, "components", name)
        const files = readdirSync(dir)
          .filter(f => f.endsWith(".css") && f !== "safelist.css")
          .sort((a, b) => a === "base.css" ? -1 : b === "base.css" ? 1 : 0)

        for (const file of files) {
          const raw = readFile(join(dir, file))
          const processed = applyPrefixToUtilities(raw, prefix)
          addComponents({ [processed]: "" })
        }
      }

      // 5. Utilities
      for (const name of UTILITIES) {
        const dir = join(srcDir, "utilities", name)
        const files = readdirSync(dir)
          .filter(f => f.endsWith(".css") && f !== "safelist.css")
        for (const file of files) {
          const raw = readFile(join(dir, file))
          const processed = applyPrefixToUtilities(raw, prefix)
          addComponents({ [processed]: "" })
        }
      }

      if (logs) {
        const p = prefix ? ` with prefix "${prefix}-"` : ""
        console.log(`\x1b[36mfrutjam v2\x1b[0m loaded ${COMPONENTS.length} components${p}`)
      }
    }
  )
}