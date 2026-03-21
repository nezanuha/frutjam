// functions/prefixSelector.js

/**
 * Rewrites every .classname in a selector to .{prefix}-{classname}
 *
 * Examples (prefix = "fj"):
 *   .btn               →  .fj-btn
 *   .btn.btn-primary   →  .fj-btn.fj-btn-primary
 *   .join-y > .join-item  →  .fj-join-y > .fj-join-item
 *   .card:hover        →  .fj-card:hover
 *   :where(.btn)       →  :where(.fj-btn)
 */
export function prefixSelector(selector, prefix) {
  if (!prefix) return selector

  return selector.replace(
    /(\.)(-?[a-zA-Z_][a-zA-Z0-9_-]*)/g,
    (_, dot, name) => `${dot}${prefix}-${name}`
  )
}