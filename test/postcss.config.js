module.exports = {
  plugins: {
    "frutjam": {
      prefix: "fj",

      // // Skip browser reset (use alongside Bootstrap, Tailwind base, etc.)
      // // Default: true
      // reset: false,

      // // Scope CSS vars to a custom selector (e.g. Shadow DOM / web components)
      // // Default: ":root"
      // root: ":host",

      // // Suppress console output
      // // Default: true
      // logs: false,

      // Custom themes
      themes: {
        ocean: {
          "--color-primary": "oklch(60% 0.2 220)",
          "--color-on-primary": "oklch(98% 0.01 220)",
          "--color-base": "oklch(98% 0.01 220)",
          "--color-on-base": "oklch(20% 0.02 220)",
          "--scheme-color": "light",
        },
        "ocean-dark": {
          "--color-primary": "oklch(65% 0.2 220)",
          "--color-on-primary": "oklch(10% 0.01 220)",
          "--color-base": "oklch(15% 0.02 220)",
          "--color-on-base": "oklch(95% 0.01 220)",
          "--scheme-color": "dark",
        }
      }
    },
    "@tailwindcss/postcss": {
      optimize: { minify: false }
    }
  }
}
