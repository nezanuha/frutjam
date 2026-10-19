---
title: "Every JavaScript Markdown Editor Breaks Your Form. Here's One That Doesn't"
description: "Most JavaScript markdown editors hide your textarea and edit a copy, which quietly breaks required fields, validation and anything reading the form. Here is one that enhances the textarea instead, so the form keeps working."
metaTitle: "JavaScript Markdown Editor That Keeps Your Form Working | Frutjam"
metaDescription: "A JavaScript markdown editor that enhances your textarea instead of replacing it. Required fields, validation and FormData keep working. Hybrid and plain modes, no framework needed."
image: "https://cdn.frutjam.com/media/blog/posts/javascript-markdown-editor-textarea.jpg"
imageAlt: "Screen-print illustration of an input panel with a toolbar along its top, bolted firmly to a base, beside a tipped-over grey panel whose cable has been cut"
createdAt: "2026-10-19T00:00:00+00:00"
updatedAt: "2026-10-19T00:00:00+00:00"
---

You add a markdown editor to a form. It looks great. Then someone reports that the submit button does nothing, and you spend an afternoon finding out why.

Here's the form before the editor:

```html
<form method="post">
  <textarea id="content" name="content" required></textarea>
  <button>Publish</button>
</form>
```

That `required` works. The browser blocks submission on an empty field and shows its own message.

Now add almost any markdown editor. The library hides your textarea, builds a `contenteditable` div next to it, and edits that instead. Your textarea is still in the DOM, still `required`, and still empty, because nobody has typed into it. The browser refuses to submit a form containing an invalid field it cannot show you, and you get no error, no focus ring, nothing.

## What else breaks

The empty textarea is the obvious symptom. The rest surface later.

**`FormData` reads nothing.** Anything serialising the form by hand gets an empty string for that field.

**Server-side validation sees an empty field.** Django's `request.POST`, Laravel's `$request->input()`, Rails' `params` — all of them read the real form controls, not the div.

**Validation errors lose the user's text.** The server re-renders the form, the textarea is repopulated, the editor initialises again from a value that was never synced, and the draft is gone.

**Autofocus, labels and `aria-describedby` point at a hidden element.** A screen reader announces a field that is not the one being edited.

The usual fix is to sync on every keystroke, or on submit. It works until something reads the form at a moment you did not anticipate, which is the kind of bug that only shows up in production.

## A different approach

[markdown-text-editor](https://frutjam.com/plugins/markdown-editor) does not replace the textarea. It wraps it, puts a toolbar above it, and lets you type into the real element. There is nothing to sync because there is only ever one value.

```bash
npm install markdown-text-editor
```

```js
import MarkdownEditor from 'markdown-text-editor';

new MarkdownEditor('#content');
```

That's it. The `required` attribute still works, because the field the browser is validating is the field you typed into. `FormData` reads what you wrote. The server sees the markdown as typed.

## Options

```js
new MarkdownEditor('#content', {
  mode: 'hybrid',           // or 'plain' for raw markdown, the default
  placeholder: 'Write something…',
  toolbar: ['bold', 'italic', 'link', 'code', 'preview'],
});
```

The toolbar is an array, so you build the one your users need rather than hiding buttons with CSS. The available entries are `heading`, `bold`, `italic`, `strikethrough`, `ol`, `ul`, `checklist`, `blockquote`, `code`, `codeblock`, `hr`, `table`, `image`, `link`, `undo`, `redo`, `indent`, `outdent` and `preview`.

Headings take a configuration of their own, which matters more than it sounds. On most CMS body fields H1 belongs to the page, not the content:

```js
new MarkdownEditor('#content', {
  toolbar: [{ heading: { levels: [2, 3, 4] } }, 'bold', 'italic', 'preview'],
});
```

`Ctrl+1` through `Ctrl+3` follow the same list, so a level you leave out cannot be inserted from the keyboard either.

## Reading and writing the content

The textarea is the source of truth, so most of the time you don't need the editor instance at all:

```js
document.querySelector('#content').value;
```

When you do want to insert something, use the editor rather than writing to the textarea directly:

```js
editor.insertText('**bold**');
```

It replaces the selection, restores focus, moves the caret, scrolls, re-renders the preview and fires `onChange`. Setting `.value` yourself does none of that.

## React and Vue

There is no wrapper package, because the editor attaches to a DOM element and a ref is a DOM element:

```jsx
import { useEffect, useRef } from 'react';
import MarkdownEditor from 'markdown-text-editor';

export function Editor() {
  const ref = useRef(null);
  useEffect(() => {
    const editor = new MarkdownEditor(ref.current);
    return () => editor.destroy();
  }, []);
  return <textarea ref={ref} name="content" required />;
}
```

TypeScript definitions ship with the package. Import `MarkdownEditorOptions` and annotate your config, because TypeScript only checks for unknown keys on an object literal passed directly — a config lifted into its own variable will swallow a misspelled key in silence and render the default toolbar.

## When you want something else

This is not the editor for every job, and it's worth saying so.

If you need collaborative editing, comments anchored to ranges, or a document model you can query, you want a real editor framework. ProseMirror and Lexical exist for that and this is not competing with them.

If your content is not markdown, this is the wrong tool entirely.

And if you have no form — an editor in a modal that saves over `fetch`, say — then the textarea argument doesn't apply to you, and you should pick on features instead.

What this is good at is the common case: a form with a markdown field, on a server-rendered app, where you want the writing experience to improve and nothing else to change.

## Why the textarea matters

Every framework, every validation library and every browser feature already knows what a textarea is. Keeping it means you inherit all of that for free instead of reimplementing it.

That's the whole idea. The editor is 2 dependencies, works without a framework, and leaves the thing your stack already understands exactly where it was.

[Read the full documentation](https://frutjam.com/plugins/markdown-editor), or see the framework-specific guides for [Django](https://frutjam.com/blog/django-markdown-editor-textarea) and [Laravel](https://frutjam.com/blog/laravel-markdown-editor-textarea).
