/**
 * Creates skeleton MDX files for every docs/components/blocks/plugins page.
 * Run once: node scripts/generate-skeletons.mjs
 * After running, fill in each file with content from migrate-content.mjs.
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '../../src/content/docs');

const pages = [
  // Docs
  { path: 'docs/overview.mdx',      title: 'Overview',        description: "There's no complicated setup — it uses the same configuration as Tailwind CSS." },
  { path: 'docs/installation.mdx',  title: 'Installation',    description: 'Install Frutjam as a Tailwind CSS v4 plugin in one line.' },
  { path: 'docs/configuration.mdx', title: 'Configuration',   description: 'Configure Frutjam via plugin options: prefix, reset, root, logs, include, exclude.' },
  { path: 'docs/themes.mdx',        title: 'Themes',          description: 'Switch themes with data-theme. Build custom themes using OKLCH CSS variables.' },
  { path: 'docs/colors.mdx',        title: 'Colors',          description: 'Frutjam uses an OKLCH color system with hand-tuned WCAG AA compliant color pairs.' },
  { path: 'docs/typography.mdx',    title: 'Typography',      description: 'Semantic heading and body typography utilities built on CSS custom properties.' },

  // Components — Inputs & Forms
  { path: 'components/button.mdx',    title: 'Button',    description: 'Versatile button component with variants, sizes, and states.' },
  { path: 'components/checkbox.mdx',  title: 'Checkbox',  description: 'Accessible checkbox with label support and indeterminate state.' },
  { path: 'components/radio.mdx',     title: 'Radio',     description: 'Radio button group for single-selection forms.' },
  { path: 'components/toggle.mdx',    title: 'Toggle',    description: 'CSS-only toggle switch built on native checkbox.' },
  { path: 'components/input.mdx',     title: 'Input',     description: 'Text input with size variants, icons, and validation states.' },
  { path: 'components/textarea.mdx',  title: 'Textarea',  description: 'Multi-line text input with auto-resize support.' },
  { path: 'components/select.mdx',    title: 'Select',    description: 'Styled native select element with full keyboard accessibility.' },
  { path: 'components/range.mdx',     title: 'Range',     description: 'Styled range slider for numeric input.' },
  { path: 'components/rating.mdx',    title: 'Rating',    description: 'CSS-only star rating component.' },
  { path: 'components/combobox.mdx',  title: 'Combobox',  description: 'Accessible combobox with keyboard navigation and filtering.' },

  // Components — Layout & Navigation
  { path: 'components/navbar.mdx',      title: 'Navbar',      description: 'Horizontal navigation bar with start/center/end slots.' },
  { path: 'components/sidebar.mdx',     title: 'Sidebar',     description: 'Vertical navigation sidebar with collapsible groups.' },
  { path: 'components/drawer.mdx',      title: 'Drawer',      description: 'CSS-only slide-in panel using native dialog element.' },
  { path: 'components/menu.mdx',        title: 'Menu',        description: 'Vertical list menu for navigation and dropdowns.' },
  { path: 'components/breadcrumb.mdx',  title: 'Breadcrumb',  description: 'Accessible breadcrumb navigation trail.' },
  { path: 'components/tabs.mdx',        title: 'Tabs',        description: 'CSS-only tab panels with multiple style variants.' },
  { path: 'components/steps.mdx',       title: 'Steps',       description: 'Visual step indicator for multi-step processes.' },
  { path: 'components/footer.mdx',      title: 'Footer',      description: 'Page footer with multi-column layout support.' },
  { path: 'components/header.mdx',      title: 'Header',      description: 'Top navigation bar with sticky and fixed position modifiers.' },
  { path: 'components/join.mdx',        title: 'Join',        description: 'Groups elements together by removing gaps and merging borders.' },
  { path: 'components/pagination.mdx',  title: 'Pagination',  description: 'Page navigation with previous, next, and numbered page links.' },

  // Components — Feedback & Overlay
  { path: 'components/modal.mdx',           title: 'Modal',           description: 'CSS-only modal dialog using native dialog and popover API.' },
  { path: 'components/toast.mdx',           title: 'Toast',           description: 'Non-blocking notification messages positioned at screen edges.' },
  { path: 'components/alert.mdx',           title: 'Alert',           description: 'Contextual alert messages for success, error, warning, and info states.' },
  { path: 'components/tooltip.mdx',         title: 'Tooltip',         description: 'CSS-only tooltip triggered on hover or focus.' },
  { path: 'components/popover.mdx',         title: 'Popover',         description: 'CSS-only popover panel using the native popover API.' },
  { path: 'components/loading.mdx',         title: 'Loading',         description: 'Loading spinner and skeleton placeholder components.' },
  { path: 'components/skeleton.mdx',        title: 'Skeleton',        description: 'Placeholder skeleton for content that is loading.' },
  { path: 'components/progress.mdx',        title: 'Progress',        description: 'Linear progress bar using the native progress element.' },
  { path: 'components/radial-progress.mdx', title: 'Radial Progress', description: 'Circular progress indicator using CSS conic-gradient.' },

  // Components — Data Display
  { path: 'components/card.mdx',       title: 'Card',       description: 'Flexible content container with optional header, body, and footer.' },
  { path: 'components/table.mdx',      title: 'Table',      description: 'Styled data table with size variants and striped rows.' },
  { path: 'components/stat.mdx',       title: 'Stat',       description: 'Display key metrics with label, value, and description.' },
  { path: 'components/badge.mdx',      title: 'Badge',      description: 'Small status indicator for labels, counts, and tags.' },
  { path: 'components/tag.mdx',        title: 'Tag',        description: 'Dismissible tag element for categories and filters.' },
  { path: 'components/avatar.mdx',     title: 'Avatar',     description: 'User avatar with image, initials, and status indicator.' },
  { path: 'components/indicator.mdx',  title: 'Indicator',  description: 'Position a badge or dot indicator over another element.' },
  { path: 'components/diff.mdx',       title: 'Diff',       description: 'Side-by-side diff viewer for comparing two content blocks.' },
  { path: 'components/timeline.mdx',   title: 'Timeline',   description: 'Vertical timeline for chronological events.' },
  { path: 'components/chat.mdx',       title: 'Chat',       description: 'Chat bubble layout for messaging interfaces.' },
  { path: 'components/status.mdx',     title: 'Status',     description: 'Small colored dot indicator for online/offline states.' },

  // Components — Typography & Decoration
  { path: 'components/hero.mdx',        title: 'Hero',        description: 'Full-width hero section with centered content and CTA.' },
  { path: 'components/divider.mdx',     title: 'Divider',     description: 'Horizontal rule with optional label text.' },
  { path: 'components/kbd.mdx',         title: 'Kbd',         description: 'Keyboard key representation for shortcut documentation.' },
  { path: 'components/link.mdx',        title: 'Link',        description: 'Anchor link with underline and color variants.' },
  { path: 'components/mask.mdx',        title: 'Mask',        description: 'Apply CSS clip-path shapes to images and elements.' },
  { path: 'components/swap.mdx',        title: 'Swap',        description: 'CSS-only toggle between two elements using checkbox state.' },
  { path: 'components/countdown.mdx',   title: 'Countdown',   description: 'Animated number countdown display.' },
  { path: 'components/marquee.mdx',     title: 'Marquee',     description: 'Continuously scrolling content using CSS animation.' },
  { path: 'components/carousel.mdx',    title: 'Carousel',    description: 'CSS-only horizontal scroll carousel with snap points.' },
  { path: 'components/accordion.mdx',   title: 'Accordion',   description: 'Collapsible content panels using native details element.' },
  { path: 'components/collapsible.mdx', title: 'Collapsible', description: 'CSS-only collapsible section using details element.' },
  { path: 'components/surface.mdx',     title: 'Surface',     description: 'Layered surface container with elevation and background tokens.' },

  // Blocks
  { path: 'blocks/header.mdx',  title: 'Header Block',  description: 'Full-page header block with logo, nav, and mobile drawer.' },
  { path: 'blocks/hero.mdx',    title: 'Hero Block',    description: 'Landing page hero section with headline, CTA, and illustration.' },
  { path: 'blocks/pricing.mdx', title: 'Pricing Block', description: 'Pricing table block with tiered plans and feature comparison.' },

  // Plugins
  { path: 'plugins/markdown-editor.mdx', title: 'Markdown Editor', description: 'Frutjam-styled markdown editor plugin.' },
];

let created = 0;

for (const page of pages) {
  const fullPath = join(ROOT, page.path);
  if (existsSync(fullPath)) continue;

  mkdirSync(dirname(fullPath), { recursive: true });

  const content = `---
title: ${page.title}
description: ${page.description}
---

{/* Content migrated from frutjam.com — run: node scripts/migrate-content.mjs */}

import { Tabs, TabItem } from '@astrojs/starlight/components';
`;

  writeFileSync(fullPath, content, 'utf8');
  console.log(`created: ${page.path}`);
  created++;
}

console.log(`\nDone. Created ${created} skeleton files.`);
