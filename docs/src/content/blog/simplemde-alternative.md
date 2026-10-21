---
title: "SimpleMDE Alternative: The Diff Is Smaller Than You Think"
description: "SimpleMDE has not shipped a commit since June 2024 and has 290 open issues. Here is how to move to markdown-text-editor, including the option and toolbar mapping, and an honest list of what you lose."
metaTitle: "SimpleMDE Alternative — Migration Guide | Frutjam"
metaDescription: "A practical SimpleMDE migration guide: option mapping, toolbar names, the sync code you delete, and what is missing. SimpleMDE is unmaintained since June 2024."
image: "https://cdn.frutjam.com/media/blog/posts/simplemde-alternative.jpg"
imageAlt: "Screen-print illustration of a dusty abandoned panel beside a working one, a single cable being unplugged from the first and seated into the second"
createdAt: "2026-10-20T00:00:00+00:00"
updatedAt: "2026-10-20T00:00:00+00:00"
draft: false
---

SimpleMDE's last commit was June 2024. It has 290 open issues and 10,141 stars, which is an awkward combination: enough people depend on it that it still does 94,000 installs a month, and nobody is answering any of them.

If you're on it, you've probably already decided to move. This is the part nobody writes down: what the migration actually costs.

The short answer is that it's smaller than a normal migration, because you spend most of it deleting code.

## The one line you delete

SimpleMDE replaces your textarea with a CodeMirror instance. The textarea stays in the DOM but nothing types into it, which is why almost every SimpleMDE codebase has some version of this:

```js
form.addEventListener('submit', () => {
  document.querySelector('#content').value = simplemde.value();
});
```

That line exists because the editor and the form disagree about where the content lives.

markdown-text-editor doesn't replace the textarea. It wraps it and puts a toolbar on top, and you type into the real element. So:

```js
import MarkdownEditor from 'markdown-text-editor';

new MarkdownEditor('#content');
```

The sync handler goes. So does any `simplemde.value()` call elsewhere in your code, because `document.querySelector('#content').value` is now simply correct, at every moment, without anyone doing anything.

If you kept a `required` attribute on that textarea and quietly wondered why it never fired, it fires now.

## Install

```bash
npm uninstall simplemde
npm install markdown-text-editor
```

Two dependencies, `marked` and `dompurify`. No CodeMirror.

## Options

The constructor shape differs: SimpleMDE takes the element inside the options object, this takes a selector or element first and options second.

| SimpleMDE | markdown-text-editor |
| --- | --- |
| `element: el` | first argument: `new MarkdownEditor(el)` |
| `initialValue` | set the textarea's content as normal |
| `placeholder` | `placeholder` |
| `toolbar` | `toolbar` |
| `status` | `footer`, or `false` to hide it |
| `renderingConfig` | `renderer`, a function returning HTML |
| `spellChecker` | no equivalent, see below |
| `autosave` | no equivalent, see below |

So a typical config:

```js
new MarkdownEditor('#content', {
  placeholder: 'Write something…',
  toolbar: ['bold', 'italic', 'link', 'code', 'preview'],
  footer: { words: true, chars: true },
});
```

## Toolbar names

Most buttons exist under a different name. This is the whole mapping:

| SimpleMDE | markdown-text-editor |
| --- | --- |
| `bold`, `italic`, `strikethrough` | same |
| `code`, `table`, `link`, `image` | same |
| `preview` | `preview` (fullscreen, side by side) |
| `quote` | `blockquote` |
| `unordered-list` | `ul` |
| `ordered-list` | `ol` |
| `horizontal-rule` | `hr` |
| `heading`, `heading-1/2/3` | `heading`, with a `levels` option |
| `side-by-side`, `fullscreen` | folded into `preview` |
| `clean-block`, `guide` | no equivalent |

Headings are configurable rather than fixed, which is useful on a CMS body field where H1 belongs to the page:

```js
toolbar: [{ heading: { levels: [2, 3, 4] } }, 'bold', 'italic', 'preview']
```

You also get `checklist`, `codeblock`, `undo`, `redo`, `indent` and `outdent`, which SimpleMDE didn't have.

## What you lose

Three things, and it's better to know now than after you've migrated.

**The spell checker.** SimpleMDE shipped one. There's no equivalent here. In practice most projects disabled it, because it fought the browser's own spell check and flagged markdown syntax as misspellings, but if you were relying on it this is a real gap.

**Autosave to localStorage.** SimpleMDE had it built in. Here you'd wire it yourself through the `onChange` callback, which is a few lines rather than a feature.

**The guide button.** The one linking to markdown syntax help. Not included.

Everything else has an equivalent, including fullscreen and side-by-side preview, which are the same button.

## If you're on EasyMDE instead

EasyMDE is the maintained fork and does nearly a million installs a month, so "it's abandoned" doesn't apply to it. The migration is almost identical, since the API barely diverged.

But the reason to move is different. It isn't maintenance, it's that EasyMDE also replaces the textarea, so you keep the sync code and everything that reads the form early still reads an empty string: `FormData`, htmx, Turbo, unsaved-changes guards, server-side validation. If none of that has ever bitten you, EasyMDE is a perfectly good editor and you should stay on it.

## Worth half an hour

The realistic migration is: change the constructor, rename four toolbar entries, delete the sync handler, re-test the form.

If you hit something this guide doesn't cover, [open an issue](https://github.com/nezanuha/markdown-text-editor/issues) — unlike the repo you're leaving, someone reads them.

[Full documentation](https://frutjam.com/plugins/markdown-editor) · framework guides for [Django](https://frutjam.com/blog/django-markdown-editor-textarea), [Laravel](https://frutjam.com/blog/laravel-markdown-editor-textarea) and [plain JavaScript](https://frutjam.com/blog/javascript-markdown-editor-textarea).
