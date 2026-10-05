/*
 * Builds the UnoCSS preset from the same objects the Tailwind plugin uses.
 *
 * build-plugin.mjs already turns every component's CSS into a map of selector
 * to CSS object. UnoCSS wants the opposite shape: one entry per class a user
 * might type, carrying everything that class is responsible for. So the
 * selectors are grouped by the first class they mention, which is the class
 * that owns them, and anything a user cannot type (@keyframes, @container)
 * goes to a preflight instead.
 *
 * Output is a body string per token rather than a CSS object, because many
 * components nest, and UnoCSS's symbols.body takes nested CSS while keeping
 * variants working. That is what lets md:btn-error behave.
 */
import postcss from "postcss"
import postcssJs from "postcss-js"
import { writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath, pathToFileURL } from "url"

const __dir = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dir, "..")
const distDir = join(rootDir, "dist")

const pkg = JSON.parse((await import("fs")).readFileSync(join(rootDir, "package.json"), "utf8"))
const banner = `/*! frutjam v${pkg.version} (c) ${new Date().getFullYear()} Nezanuha | MIT | https://frutjam.com */`

/** The class a selector belongs to: the first one it names. */
const ownerOf = (selector) => (selector.match(/\.([a-z0-9-]+)/i) || [])[1] ?? null

/** Serialise a postcss-js object to a CSS body, no wrapping braces. */
function toBody(obj) {
  const css = postcss().process(obj, { parser: postcssJs, from: undefined }).css
  return css.replace(/\s*\n\s*/g, " ").trim()
}

function collect() {
  const tokens = new Map()   // token -> merged postcss-js object
  const orphans = {}         // @keyframes and friends, emitted once

  for (const group of ["components", "utilities"]) {
    const dir = join(distDir, group)
    if (!existsSync(dir)) continue

    for (const name of readdirSync(dir)) {
      const objPath = join(dir, name, "object.js")
      if (!statSync(join(dir, name)).isDirectory() || !existsSync(objPath)) continue
      const entries = modules.get(objPath)

      for (const [selector, body] of Object.entries(entries)) {
        const owner = ownerOf(selector)
        if (!owner) { orphans[selector] = body; continue }

        const merged = tokens.get(owner) ?? {}
        if (selector === `.${owner}`) {
          Object.assign(merged, body)
        } else {
          // .collapsible-peek > .collapsible-content  ->  & > .collapsible-content
          merged[selector.split(`.${owner}`).join("&")] = body
        }
        tokens.set(owner, merged)
      }
    }
  }
  return { tokens, orphans }
}

// Load every object.js up front; collect() stays synchronous and readable.
const modules = new Map()
for (const group of ["components", "utilities"]) {
  const dir = join(distDir, group)
  if (!existsSync(dir)) continue
  for (const name of readdirSync(dir)) {
    const objPath = join(dir, name, "object.js")
    if (!statSync(join(dir, name)).isDirectory() || !existsSync(objPath)) continue
    modules.set(objPath, (await import(pathToFileURL(objPath).href)).default)
  }
}

const { tokens, orphans } = collect()

const map = {}
for (const [token, obj] of [...tokens].sort(([a], [b]) => a.localeCompare(b))) {
  map[token] = toBody(obj)
}

/*
 * Attributify turns card="outline sm" into card-outline and card-sm, and never
 * asks for a bare card, so the component itself would go missing. The preset
 * fixes that at extraction time, which needs to know which tokens are whole
 * components rather than modifiers of one: a component is a token that other
 * tokens hang off.
 */
const names = Object.keys(map)
const components = names
  .filter((token) => names.some((other) => other !== token && other.startsWith(`${token}-`)))
  // card is a component, card-content is not, even though card-content-foo
  // would make it look like one. Keep the shortest root of each family.
  .filter((token) => !names.some((other) => other !== token && token.startsWith(`${other}-`)))

// The tokens, reset and themes, inlined rather than read from disk, so the
// preset works in the browser runtime as well as in a Node build.
const { readFileSync } = await import("fs")
const strip = (css) => css.replace(/\/\*![\s\S]*?\*\/\s*/g, "")
const baseCss = [
  readFileSync(join(distDir, "base.css"), "utf8"),
  // Without these, data-theme="dark" does nothing under the preset while it
  // works everywhere else.
  ...["snowberry", "darkberry"].map((t) => readFileSync(join(distDir, `themes/${t}.css`), "utf8")),
].map(strip).join("\n")

mkdirSync(join(distDir, "unocss"), { recursive: true })
writeFileSync(
  join(distDir, "unocss", "map.js"),
  [
    banner,
    `export const rules = ${JSON.stringify(map)};`,
    `export const preflight = ${JSON.stringify(toBody(orphans))};`,
    `export const base = ${JSON.stringify(baseCss)};`,
    `export const components = ${JSON.stringify(components)};`,
    "",
  ].join("\n"),
)

// The preset itself is hand written and ships from packages/unocss, the way
// packages/js and packages/react do. Only the data beside it is generated.

console.log(`\n[unocss]`)
console.log(`  ✓ dist/unocss/map.js — ${Object.keys(map).length} tokens, ${Object.keys(orphans).length} preflight rules`)
