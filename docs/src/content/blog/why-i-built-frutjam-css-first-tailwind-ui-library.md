---
title: "Why I Stopped Using JavaScript-Heavy UI Libraries (And Built a CSS-First Tailwind Component Library)"
description: "Achieve 100% PageSpeed scores by default. A guide to building high-performance, RTL-ready platforms using native HTML5 and CSS-first components."
metaTitle: "Why I Built Frutjam | A Free CSS-Only Tailwind CSS Library | Frutjam"
metaDescription: "How JS-heavy UI libraries killed performance — and how building Frutjam, a CSS-only Tailwind CSS library with WCAG accessibility, solved it."
image: "https://cdn.frutjam.com/media/blog/posts/why-i-built-frutjam-css-first-tailwind-ui-library.jpg"
imageAlt: "frutjam CSS-first Tailwind UI library vs bloated JS libraries — PageSpeed 100"
createdAt: "2026-04-02T07:58:06.179767+00:00"
updatedAt: "2026-07-15T19:51:10.833780+00:00"
---

I build websites to solve problems, but after delivering several major multilingual platforms, I realized I was spending more time auditing performance than actually writing code. I'm a developer, not a professional performance janitor, yet I found myself stuck in a constant loop of chasing PageSpeed scores and fixing layout shifts caused by the very tools I was using. Instead of building new functionality, I spent more time fighting Cumulative Layout Shift (CLS) and writing tedious RTL (Right-to-Left) CSS overrides than actually shipping features.

I realized my 'shortcut' of using popular, JS-heavy component libraries was actually my biggest bottleneck. I was constantly battling render-blocking scripts just to open a simple dropdown and manually retrofitting WAI-ARIA tags to pass basic accessibility audits.

I didn't want another bloated library. I wanted a **CSS-first Tailwind component library** that made [100% PageSpeed Insights scores](https://pagespeed.web.dev/analysis?url=https://frutjam.com) the default, not a struggle. That's why I spent the last few months building **Frutjam**.

Here is why shifting to **native-first with CSS-first components** completely changed my workflow, and why it will fix your Core Web Vitals, too.

---

## 1. The Power of a CSS-First Tailwind Component Library

Modern web technologies are increasingly approaching a "native-first" standard. Years ago, we had to rely on heavy JavaScript bundles just to create a functioning modal, a popover, or a toggleable accordion because the browser lacked built-in solutions. Today, the web platform has caught up. The browser's native rendering engine is now incredibly powerful, equipped with standardized elements designed specifically for these interactions.

By ignoring these native features and continuing to ship megabytes of state-management JS just for basic UI, we are actively working against the browser.

Frutjam takes a **native-first with a CSS-first approach**. This means we trust the browser to handle the core logic (Native-First) while using modern CSS for the behavioral styling and visual identity (CSS-First).

Take a standard accordion. Instead of writing complex state-management logic in React or Svelte, you can achieve a perfectly accessible, highly performant accordion using the native `<details>` and `<summary>` tags, styled cleanly with CSS:

```html
<div class="accordion">
    <details name="default-accordion">
        <summary>Is this accessible?</summary>
        <div class="accordion-body">
            <p>Yes, because the browser handles the state natively.</p>
        </div>
    </details>
</div>
```

By combining this native structure with advanced CSS features like `@starting-style`, you get the exact same premium feel and smooth animations with zero JavaScript overhead. And once your markup is this clean, maintaining it becomes a completely different experience.

---

## 2. No More Ugly HTML: Fewer Classes, Faster Development

We all love Tailwind CSS, but we've all seen the "ugly HTML" problem: a single button wrapped in 20 different utility classes. It creates a cluster of code that is hard to read, terrible to maintain, and prone to copy-paste errors.

With Frutjam, you don't need to rewrite the whole Tailwind class string every time you need a button. I've grouped those utility clusters into clean, prebuilt component classes.

- **Fewer class names**: Keep your markup clean and readable.
- **Easily maintainable**: Update a component's style in one place without hunting down 50 different `<div>` tags.
- **Faster development**: Drop in the component and move on to building your actual application logic.

Cleaner markup also means your theming system has less to fight against, which brings me to one of my favorite parts of Frutjam.

---

## 3. Unlimited Themes With Zero Effort

Most UI libraries restrict you to a handful of predefined themes. Frutjam adds a set of highly customizable color names directly to your Tailwind CSS configuration. This allows you to generate **unlimited themes** with almost zero effort.

Whether your client needs a dark, neon cyberpunk aesthetic or a clean, corporate minimalist look, the design system adapts to your brand colors instantly without requiring you to write custom CSS overrides from scratch. But themes are only useful if the colors actually pass accessibility standards — and that's where most libraries quietly let you down.

---

## 4. Accessibility and Color Contrast by Default

I was shocked to find that even "industry standard" libraries were failing basic WCAG contrast checks in their default themes. If you look at libraries like **DaisyUI**, their color contrast often fails across various themes. In modern web development, poor contrast isn't just bad UX — it tanks your SEO.

I built Frutjam so that color logic is handled automatically. Every theme you create within the library is designed to pass accessibility and color contrast checks out of the box. You get a production-ready, SEO-friendly UI without needing to be an accessibility expert. That kind of guarantee matters even more when you're building for global audiences — including right-to-left ones.

---

## 5. The "Big Three" Comparison

When I was architecting Frutjam, I looked at what was slowing me down with other tools. Here is how taking a native-first approach compares:

| Feature | **Frutjam** | **Preline** | **Shadcn** |
| :--- | :--- | :--- | :--- |
| **Logic** | **Native-First** (CSS/HTML) | JS-Dependent | Framework-Specific (React/Svelte) |
| **PageSpeed** | Ultra Fast (Zero JS CLS) | Can cause render-blocking | Depends on your JS bundle |
| **A11y / Contrast** | **Guaranteed Pass** | Manual Effort | Manual Setup |
| **Setup** | Plug & Play | Requires JS Plugins | High Boilerplate |
| **RTL Support** | Native Built-in | Requires Overrides | Manual Configuration |

- **Versus Preline**: Preline relies heavily on JavaScript for components, which directly contributes to layout shifts (CLS) as the JS kicks in. Frutjam uses native HTML, meaning zero shift and pristine PageSpeed scores.
- **Versus Shadcn**: Shadcn is beautiful but complex and highly opinionated. It requires copying massive amounts of boilerplate into your project. Frutjam is **truly framework-agnostic**. Whether you are spinning up a Django backend, a Node application, or a Svelte frontend, it drops in flawlessly.

That framework-agnostic design also makes RTL support something you get automatically, rather than something you bolt on afterwards.

---

## 6. First-Class Multilingual (RTL) Support

Building for the MENA region means RTL isn't an afterthought; it's a strict requirement. I got tired of writing `dir="rtl"` overrides for every single component. Frutjam handles multi-language layouts naturally without requiring massive CSS hacks, saving hours of development time on internationalized projects.

---

## Stop Fighting Your Tooling

You shouldn't have to compromise between shipping fast, maintaining clean HTML, and hitting a 100% PageSpeed score. By shifting the heavy lifting back to the browser and utilizing a CSS-first Tailwind component library, high performance stops being a chore and becomes the default state of your application.

I've shipped real production projects with this approach — multilingual, RTL-ready platforms that score green across the board without a single JavaScript workaround for UI state. That's not a promise; it's just what happens when you stop fighting the browser and start working with it.

If you're building something where performance, accessibility, and clean code actually matter, this is the stack worth trying. The bloat you eliminate on day one pays dividends every time you ship.

If you are tired of JS-heavy interfaces and messy class clusters slowing down your builds, [view the live documentation](https://frutjam.com), [check the source code on GitHub](https://github.com/nezanuha/frutjam), or [grab the package on npm](https://www.npmjs.com/package/frutjam) to try the CSS-first approach for yourself.

## Components mentioned in this post

- [Button](/components/button)
- [Modal](/components/modal)
- [Card](/components/card)
- [Navbar](/components/navbar)
- [Installation guide](/docs/installation)
- [Themes](/docs/themes)
