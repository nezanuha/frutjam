import { describe, it, expect, beforeAll } from "vitest"
import postcss from "postcss"
import tailwindcss from "@tailwindcss/postcss"
import frutjam from "frutjam"

async function build(options = {}) {
  const result = await postcss([
    frutjam(options),
    tailwindcss()
  ]).process(`@import "tailwindcss";`, { from: undefined })
  return result.css
}

// Build once per suite — much faster
let cssNoPrefix
let cssFj
let cssCustomTheme

beforeAll(async () => {
  ;[cssNoPrefix, cssFj, cssCustomTheme] = await Promise.all([
    build(),
    build({ prefix: "fj" }),
    build({
      themes: {
        ocean: {
          "--color-primary": "oklch(60% 0.2 220)",
          "--scheme-color": "light",
        },
        "ocean-dark": {
          "--color-primary": "oklch(65% 0.2 220)",
          "--scheme-color": "dark",
        }
      }
    })
  ])
}, 30000)

describe("no prefix", () => {
  it("generates .btn", () => expect(cssNoPrefix).toContain(".btn {"))
  it("generates .btn-primary", () => expect(cssNoPrefix).toContain(".btn-primary {"))
  it("generates .card", () => expect(cssNoPrefix).toContain(".card {"))
  it("generates .join-item", () => expect(cssNoPrefix).toContain(".join-item {"))
  it("generates .avatar", () => expect(cssNoPrefix).toContain(".avatar {"))
  it("generates .avatar-group", () => expect(cssNoPrefix).toContain(".avatar-group {"))
  it("injects snowberry theme", () => expect(cssNoPrefix).toContain('data-theme="snowberry"'))
  it("injects darkberry theme", () => expect(cssNoPrefix).toContain('data-theme="darkberry"'))
  it("injects --color-primary", () => expect(cssNoPrefix).toContain("--color-primary:"))
})

describe("with prefix fj", () => {
  it("generates .fj-btn", () => expect(cssFj).toContain(".fj-btn {"))
  it("generates .fj-btn-primary", () => expect(cssFj).toContain(".fj-btn-primary {"))
  it("generates .fj-card", () => expect(cssFj).toContain(".fj-card {"))
  it("generates .fj-join-item", () => expect(cssFj).toContain(".fj-join-item {"))
  it("generates .fj-avatar", () => expect(cssFj).toContain(".fj-avatar {"))
  it("generates .fj-avatar-primary", () => expect(cssFj).toContain(".fj-avatar-primary {"))
  it("generates .fj-avatar-group", () => expect(cssFj).toContain(".fj-avatar-group {"))
  it("does NOT generate unprefixed .btn", () => expect(cssFj).not.toContain(".btn {"))
  it("prefixes nested class in :has()", () => expect(cssFj).toContain(".fj-breadcrumb-separator"))
  it("prefixes nested class in avatar-group", () => expect(cssFj).toContain(".fj-avatar-group"))
})

describe("custom themes", () => {
  it("injects ocean theme", () => expect(cssCustomTheme).toContain('[data-theme="ocean"]'))
  it("injects ocean primary color", () => expect(cssCustomTheme).toContain("oklch(60% 0.2 220)"))
  it("injects ocean-dark theme", () => expect(cssCustomTheme).toContain('[data-theme="ocean-dark"]'))
  it("injects ocean-dark scheme", () => expect(cssCustomTheme).toContain("--scheme-color: dark"))
})