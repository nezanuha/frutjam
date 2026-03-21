// functions/pluginOptionsHandler.js

export function pluginOptionsHandler(options = {}) {
  return {
    // @plugin "frutjam" { prefix: fj; }
    prefix: typeof options.prefix === "string" ? options.prefix.trim() : "",

    // @plugin "frutjam" { themes: false; }  ← opt out of themes
    themes: options.themes !== false,

    // @plugin "frutjam" { base: false; }  ← opt out of preflight/base
    base: options.base !== false,

    // @plugin "frutjam" { logs: false; }  ← opt out of console logs
    logs: options.logs !== false,
  }
}