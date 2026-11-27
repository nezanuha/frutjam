---
title: "Adding AI to a Markdown Editor Without Putting Your API Key in the Browser"
description: "Every AI writing feature in a browser needs a server in front of it, or your key ships to anyone who opens devtools. Here is the whole pattern: a toolbar button, a proxy endpoint, and the three mistakes that lose someone's paragraph."
metaTitle: "AI Markdown Editor: Add a Writing Assistant Without Exposing Your API Key | Frutjam"
metaDescription: "How to add an AI rewrite button to a markdown editor safely. The key stays on your server, the browser calls your endpoint, and a failed request never loses the user's text."
createdAt: "2026-11-19T00:00:00+00:00"
updatedAt: "2026-11-19T00:00:00+00:00"
image: "https://cdn.frutjam.com/media/blog/posts/ai-markdown-editor-without-exposing-api-key.jpg"
imageAlt: "Screen-print illustration of a key chained inside a service hatch with paper passing through it, and a loose key abandoned on the counter below"
---

Someone asks for an "improve this paragraph" button in your editor. You reach for the provider's JavaScript SDK, and that is where it goes wrong:

```js
// Do not do this
const client = new SomeProvider({ apiKey: 'sk-...' });
```

Anything in that file is public. Bundlers don't hide it, minifiers don't hide it, and `import.meta.env.VITE_API_KEY` doesn't hide it either: the `VITE_` prefix exists precisely to mark a value as *safe to publish*, and it ends up in the bundle as a string. Open devtools, search the JavaScript for `sk-`, and there it is.

People find these. There are scrapers that do nothing else.

## The shape that works

Three parts, and the middle one is the whole point.

```
browser                  your server              the provider
-------                  -----------              ------------
selected text  ------->  POST /api/rewrite
                         + your key, server-side  ------->
                                                  <-------  rewritten text
rewritten text <-------  { "text": "..." }
```

Your server holds the key. The browser never sees it, and never talks to the provider. You also get, for free, the things you will want by the second week: a rate limit per user, a length cap, an audit log, and the ability to change provider without shipping new JavaScript.

## The browser half

This is [markdown-text-editor](https://frutjam.com/plugins/markdown-editor), which lets you add a toolbar button without forking it. Any editor with a custom-tool hook works the same way.

```javascript
async function rewrite(editor) {
    const textarea = editor.usertextarea;
    const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    if (!selected.trim()) return;

    const token = `[${editor.label('Rewriting...')}]`;
    editor.insertText(token, token.length, 0);

    const put = (replacement) => {
        const at = textarea.value.indexOf(token);
        if (at === -1) return;
        textarea.value = textarea.value.slice(0, at)
            + replacement + textarea.value.slice(at + token.length);
        textarea.setSelectionRange(at, at + replacement.length);
        editor.render();
        editor.notifyChange();
    };

    try {
        const response = await fetch('/api/rewrite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: selected }),
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        put((await response.json()).text);
    } catch (error) {
        put(selected);
        console.error('[rewrite] failed', error);
    }
}

new MarkdownEditor('#content', {
    toolbar: ['bold', 'italic', {
        custom: { title: 'Rewrite', icon: ICON, action: rewrite }
    }, 'preview'],
});
```

## Three mistakes worth avoiding

Everything interesting in that function is in the waiting, not the fetching.

**Doing nothing while you wait.** A button that sits silent for two seconds reads as a broken button, and people click it again. Put a placeholder in the document on the first line of the handler, before the request even exists.

**Remembering where the placeholder went.** The obvious version stores `selectionStart`, awaits, then writes back at that offset. But the document keeps moving while the request is in flight. The person carries on typing, or undoes something, or deletes the placeholder entirely. By the time the answer lands, that offset points at someone else's sentence. Search for the token instead, and do nothing if it has gone.

**Throwing the original away.** This is the one that matters. The naive handler replaces the selection with the response, and when the request fails the paragraph is simply gone. Keep the original in a variable and put it back on failure. A visible failure is recoverable. A vanished paragraph isn't.

## The server half

Around fifteen lines in any stack. Node, because it is the shortest to show:

```javascript
app.post('/api/rewrite', requireLogin, async (req, res) => {
    const text = String(req.body.text ?? '');
    if (!text.trim() || text.length > 4000) {
        return res.status(400).json({ error: 'bad length' });
    }

    try {
        const result = await callProvider(process.env.API_KEY, text);
        res.json({ text: result });
    } catch (error) {
        console.error(error);
        res.status(502).json({ error: 'upstream' });
    }
});
```

Four things you can't skip:

- **`requireLogin`.** An open endpoint that spends money on your account is an open endpoint that will.
- **A length cap.** Billing is per token, and `text` arrives from a browser.
- **A rate limit** per user, not per IP.
- **Never return the provider's raw error.** They sometimes quote the request back, and the request contains your prompt.

Django, Laravel and Rails are the same handler in a different dialect. Nothing about it is AI-specific.

## This is not an AI pattern

The same code covers translation, a spell or grammar service, a house-style linter, or anything else that goes over a network: insert a placeholder, find it again by searching, restore the original if the call fails.

Which is also why the editor ships none of this built in. A key can't live in a browser, so the useful half is always on your server, written against whichever provider you chose, behind your auth, with your limits. A built-in button would be a button that does nothing until you've built that anyway.

The [custom tools documentation](https://frutjam.com/plugins/markdown-editor#custom-tools) covers the editor-side API, including the helpers a tool inherits and how to translate its label.
