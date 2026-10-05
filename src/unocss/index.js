import { symbols } from "@unocss/core"
import { rules as tokenRules, preflight, base } from "./map.js"

/**
 * Frutjam as an UnoCSS preset.
 *
 * Every class the Tailwind plugin generates is available here too, so
 * `class="btn btn-error"` works, and with presetAttributify so does
 * `btn="error xl"`. Only the classes you use are emitted.
 *
 * Bodies are handed to UnoCSS through symbols.body rather than returned as a
 * plain object, because several components nest. symbols.body accepts nested
 * CSS and still lets UnoCSS apply variants, which is what keeps `md:btn-error`
 * and `hover:card-primary` working.
 *
 * @param {object}  [options]
 * @param {boolean} [options.preflight=true]  Emit Frutjam's tokens and reset.
 *                                            Turn off if you already import
 *                                            frutjam/css/base yourself.
 * @param {string}  [options.layer='frutjam'] Cascade layer for the components.
 */
export function presetFrutjam(options = {}) {
  const { preflight: withPreflight = true, layer = "frutjam" } = options

  return {
    name: "frutjam",

    layers: { [layer]: -1 },

    rules: [
      [
        // Matched against the whole token, so `btn` and `btn-error` both land
        // here and anything that is not ours falls through to other presets.
        /^(.+)$/,
        ([, token]) => {
          const body = tokenRules[token]
          return body ? { [symbols.body]: body } : undefined
        },
        { layer, autocomplete: Object.keys(tokenRules) },
      ],
    ],

    preflights: withPreflight
      ? [
          { layer, getCSS: () => base },
          // @keyframes and @container rules, which no class name can carry.
          { layer, getCSS: () => preflight },
        ]
      : [{ layer, getCSS: () => preflight }],
  }
}

export default presetFrutjam
