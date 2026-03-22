import { describe, it, expect } from "vitest"
import postcss from "postcss"
import tailwindcss from "@tailwindcss/postcss"
import frutjam from "frutjam"

async function build(html = "", options = {}) {
  const plugins = [frutjam(options), tailwindcss()]
  const result = await postcss(plugins).process(
    `@import "tailwindcss";`,
    { from: undefined }
  )
  return result.css
}

describe("no prefix", () => {
  it("generates .btn", async () => {
    const css = await build()
    expect(css).toContain(".btn {")
  })

  it("generates .btn-primary", async () => {
    const css = await build()
    expect(css).toContain(".btn-primary {")
  })

  it("generates .card", async () => {
    const css = await build()
    expect(css).toContain(".card {")
  })

  it("generates .join-item", async () => {
    const css = await build()
    expect(css).toContain(".join-item {")
  })

  it("injects snowberry theme", async () => {
    const css = await build()
    expect(css).toContain('data-theme="snowberry"')
  })

  it("injects darkberry theme", async () => {
    const css = await build()
    expect(css).toContain('data-theme="darkberry"')
  })

  it("injects --color-primary", async () => {
    const css = await build()
    expect(css).toContain("--color-primary:")
  })
})

describe("with prefix fj", () => {
  it("generates .fj-btn", async () => {
    const css = await build("", { prefix: "fj" })
    expect(css).toContain(".fj-btn {")
  })

  it("generates .fj-btn-primary", async () => {
    const css = await build("", { prefix: "fj" })
    expect(css).toContain(".fj-btn-primary {")
  })

  it("generates .fj-card", async () => {
    const css = await build("", { prefix: "fj" })
    expect(css).toContain(".fj-card {")
  })

  it("generates .fj-join-item", async () => {
    const css = await build("", { prefix: "fj" })
    expect(css).toContain(".fj-join-item {")
  })

  it("does NOT generate unprefixed .btn", async () => {
    const css = await build("", { prefix: "fj" })
    expect(css).not.toContain(".btn {")
  })

  it("prefixes nested class in :has()", async () => {
    const css = await build("", { prefix: "fj" })
    expect(css).toContain(".fj-breadcrumb-separator")
  })
})

describe("custom themes", () => {
  it("injects custom theme", async () => {
    const css = await build("", {
      themes: {
        ocean: {
          "--color-primary": "oklch(60% 0.2 220)",
          "--scheme-color": "light",
        }
      }
    })
    expect(css).toContain('[data-theme="ocean"]')
    expect(css).toContain("oklch(60% 0.2 220)")
  })

  it("injects dark custom theme", async () => {
    const css = await build("", {
      themes: {
        "ocean-dark": {
          "--color-primary": "oklch(65% 0.2 220)",
          "--scheme-color": "dark",
        }
      }
    })
    expect(css).toContain('[data-theme="ocean-dark"]')
    expect(css).toContain("--scheme-color: dark")
  })
})