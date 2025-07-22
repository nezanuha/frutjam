# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Components and utility classes now support prefixes. Example usage: `tw:btn`, `tw:btn-primary`.
  Configured via: `@import "tailwindcss" prefix("tw")`.
- Expanded typography utilities with heading-[{size}] and para-[{size}] for arbitrary size support
- A CDN version of the CSS is now available for fast and easy integration without local setup.

### Changed 
- Now only base colors like `--color-primary` and `--color-on-primary` need to be defined; the library automatically generates shades from `50` to `950`.
- Now, simply set a single `border-radius` value in the theme; the Frutjam library automatically applies and adjusts radius values across components for optimal UI consistency.
- `Nav` has been renamed to `Navbar` for improved clarity and consistency.

### Removed
- Removed manual border-radius variables for individual components (`--radius-btn`, `--radius-input`, `--radius-checkbox`, etc.).
- Removed manual color shade variables like `--primary-100` to `--primary-950`, `--secondary-100` to `--secondary-950`, etc. 
- Deprecated and removed the surface component; use bg-primary-{50..950} instead.