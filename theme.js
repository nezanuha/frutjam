// theme.js
// Allows: @plugin "frutjam/theme" { name: ocean; primary: oklch(60% 0.2 220); }

export default function frutjamTheme(options = {}) {
  return function ({ addBase }) {
    const { name = "custom", ...colors } = options

    const vars = Object.entries(colors)
      .map(([key, val]) => `  --color-${key}: ${val};`)
      .join("\n")

    addBase(`
      [data-theme="${name}"] {
${vars}
      }
    `)
  }
}