---
title: "Dropdowns That Position Themselves: CSS Anchor Positioning Is Baseline Now"
description: "Popper.js and Floating UI existed to answer one question: where should this panel go? CSS answers it now, in every major browser, with no measuring and no listeners."
metaTitle: "CSS Anchor Positioning for Dropdowns | No Floating UI | Frutjam"
metaDescription: "CSS anchor positioning is Baseline. Position dropdowns and popovers relative to their trigger, with automatic edge flipping, without Popper.js or Floating UI."
image: "https://cdn.frutjam.com/media/blog/posts/css-anchor-positioning-popover-no-javascript.jpg"
imageAlt: "Illustration of two panels tethered to a block, one having swung across a dotted arc to the opposite side"
createdAt: "2026-09-25T00:00:00+00:00"
updatedAt: "2026-09-25T00:00:00+00:00"
---

Every dropdown you have ever built had the same problem underneath it: the panel
has to appear next to the button, stay there while the page scrolls, and flip to
the other side when it runs out of room.

For a decade the only answer was JavaScript. Popper.js, and then Floating UI,
existed almost entirely to measure two rectangles, do the arithmetic, and
rewrite `top` and `left` on every scroll and resize.

That is now a CSS feature, and as of this month it works in every major browser.

## What changed

CSS anchor positioning reached [Baseline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor)
in September 2026. Chromium shipped it first and the others have now followed;
MDN has the version table. It is marked *newly available*, which means the
current release of every major browser supports it, while older installs do
not.

The idea is simple. One element gives itself a name; another says it wants to be
positioned relative to that name.

```css
.trigger {
  anchor-name: --my-menu;
}

.panel {
  position: absolute;
  position-anchor: --my-menu;
  position-area: block-end span-inline-end;   /* below, aligned to the end */
  position-try-fallbacks: flip-block;          /* flip above if it won't fit */
}
```

The browser keeps them tethered from then on. Scroll the page, resize the
window, move the trigger — the panel follows, because the relationship is
declared rather than calculated.

`position-try-fallbacks` is the part that used to be most of the library code.
Give it a list, and when the preferred placement would put the panel off screen,
the browser tries the next one: flip vertically, flip horizontally, or both.

## What it replaces

A typical Floating UI setup for a single dropdown:

```javascript
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';

const cleanup = autoUpdate(button, panel, () => {
  computePosition(button, panel, {
    placement: 'bottom-end',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  }).then(({ x, y }) => {
    Object.assign(panel.style, { left: `${x}px`, top: `${y}px` });
  });
});

// and remember to call cleanup() when the panel closes
```

That is a dependency, a listener on every scrollable ancestor, a layout read and
a style write on every frame, and a teardown function you have to remember. The
CSS above does the same job with no bytes shipped and nothing to clean up.

## How Frutjam's popover uses it

We built the popover on anchor positioning before it was Baseline, so the
implementation is already in the library. It is three declarations.

The trigger names itself:

```css
@utility popover-toggle {
  anchor-name: var(--popover--anchor-name);
}
```

The panel anchors to that name and picks an area:

```css
@utility popover-content {
  position-anchor: var(--popover--anchor-name);
  position-area: var(--popover--position-area, block-end span-inline-end);
  position-try-fallbacks: var(--popover--position-try, none);
}
```

And each placement class sets the variables:

```css
@utility popover-top-start {
  --popover--position-area: block-start span-inline-start;
}
```

Twelve placement classes, one line of CSS each. In markup you pick one:

```html
<div class="popover popover-top-start">
  <button popovertarget="menu" type="button" class="popover-toggle btn">Options</button>
  <div class="popover-content" popover id="menu">
    <ul class="menu">
      <li><a class="menu-item">Edit</a></li>
      <li><a class="menu-item">Delete</a></li>
    </ul>
  </div>
</div>
```

That is the whole dropdown. The `popover` attribute gives you click-outside to
close, Escape to close, and rendering above everything without a `z-index`.
Anchor positioning decides where it goes. `@starting-style` animates it in.
There is no JavaScript on the page.

## Logical properties, so RTL comes free

Note what the placement values say: `block-start`, `span-inline-end`. Not top
and right.

Those are logical directions, resolved against the writing direction of the
document. In an Arabic or Hebrew layout, a popover aligned to `inline-start`
moves to the right-hand side by itself, because "start" means the side the text
starts from.

A dropdown positioned in pixels needs a second set of rules under `[dir="rtl"]`,
and someone has to remember to write them. This is the kind of thing that made
RTL support a project of its own, and the reason so many libraries treat it as
an afterthought.

## What to do about older browsers

*Newly available* means the current version of each major browser has it, not
every browser in use. Plan for both.

Frutjam's popover degrades quietly. Where anchor positioning is unavailable the
panel still opens, still closes on Escape and on outside clicks, and still
renders above the page; it simply falls back to the static position it would
have had in the flow, near its trigger, instead of being tethered to it.
Nothing breaks, the placement is just less precise.

If you want to branch explicitly, feature-query it:

```css
.panel {
  /* placement that works anywhere */
  position: absolute;
  inset-block-start: 100%;
}

@supports (anchor-name: --x) {
  .panel {
    position-anchor: --my-menu;
    position-area: block-end span-inline-end;
    position-try-fallbacks: flip-block;
  }
}
```

Worth deciding deliberately rather than by accident: a dropdown that is slightly
misplaced on an old browser is usually acceptable, while one that opens off
screen is not.

## The pattern this belongs to

Anchor positioning is the fourth in a run of features that each deleted a
category of UI JavaScript:

| Feature | What it replaced |
| --- | --- |
| `<dialog>` and `showModal()` | Focus trapping, the inert background, Escape handling |
| The popover API | Click-outside handlers, `z-index` stacking wars |
| `@starting-style` | Animation libraries for enter and exit transitions |
| Anchor positioning | Popper.js, Floating UI, scroll listeners |

None of these are exotic. They are the boring, load-bearing parts of a UI
library, and the platform has absorbed them one at a time over about three
years.

The interesting part is what it does to the cost of a component library. A
dropdown used to mean a dependency, a runtime and a bundle. Now it is a handful
of CSS custom properties, and the browser does the work — faster than any
library could, because it already knows where everything is.

---

The [popover component](https://frutjam.com/components/popover) ships all twelve
placements with edge flipping, and every Frutjam component is CSS-only by
default.
