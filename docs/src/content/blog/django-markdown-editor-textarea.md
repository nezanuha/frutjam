---
title: "Adding a Markdown Editor to Django Forms (No Sync Code Required)"
description: "Most Django markdown editors replace the textarea, so you have to sync the value back before submit. Here is how to add one that enhances the textarea instead — request.POST just works."
metaTitle: "Django Markdown Editor for Forms | No JS Sync | Frutjam"
metaDescription: "Add a markdown editor to Django forms without breaking form submission. No manual sync, no custom widget — request.POST receives the markdown as typed."
image: "https://cdn.frutjam.com/media/blog/posts/django-markdown-editor-textarea.jpg"
imageAlt: "Illustration of a text box with an editor toolbar and a pencil writing in it, beside a green check mark"
createdAt: "2026-09-22T00:00:00+00:00"
updatedAt: "2026-09-22T00:00:00+00:00"
---

Add a markdown editor to a Django form the usual way and it looks fine — until
the form silently refuses to submit:

```python
# forms.py — Django adds required=True to every non-blank field
class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content']
```

```javascript
// The editor everyone reaches for first
const easyMDE = new EasyMDE({ element: document.getElementById('id_content') });
```

Click Save and nothing happens. No validation error, no request, no clue on the
page. The console says:

```
An invalid form control with name='content' is not focusable.
```

EasyMDE hides your `<textarea>` with `display: none` and edits a copy. The
hidden field is still `required`, so the browser refuses to submit a form it
cannot focus the invalid field in — and because the submit event never fires,
the editor never copies its content back. The user's writing goes nowhere.

To be fair to EasyMDE: on a form *without* `required`, it does sync on submit by
itself, so plain forms work. The trouble is that Django marks fields required by
default, and that the value only exists in the textarea *during* submit:

```javascript
// Any code that reads the field before submit gets an empty string
new FormData(document.querySelector('form')).get('content');   // ""
```

That breaks anything that serialises the form itself — htmx, Turbo, Alpine,
autosave, an "unsaved changes" guard, a character counter.

## A better approach

[markdown-text-editor](https://frutjam.com/plugins/markdown-editor) styles the
textarea you already have and leaves it as the field you type into. It is never
hidden and never copied, so its value is correct at every moment — not just
during submit.

`required` works because the field is visible. `FormData` works because the
value is live. And `request.POST`, form validation, `ModelForm.save()`, CSRF and
pre-filling on edit all behave exactly as they do with a plain textarea.

## Setup

Install via npm (if you use a JS bundler):

```bash
npm install markdown-text-editor
```

Or use the CDN directly in your template — no build step needed:

```html
<script src="https://cdn.jsdelivr.net/npm/markdown-text-editor"></script>
```

## Django form

Nothing changes in your form class:

```python
# forms.py
from django import forms

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content']
        widgets = {
            'content': forms.Textarea(attrs={'class': 'markdown-editor'}),
        }
```

## Template

```html
{% extends "base.html" %}

{% block content %}
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">Save</button>
</form>

<script src="https://cdn.jsdelivr.net/npm/markdown-text-editor"></script>
<script>
    new MarkdownEditor('.markdown-editor');
</script>
{% endblock %}
```

That's it. Submit the form — `request.POST['content']` contains the markdown exactly as typed. No hooks, no sync, no custom extraction.

## View

Your view doesn't change at all:

```python
# views.py
def create_post(request):
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            form.save()  # content is already there, untouched
            return redirect('post-list')
    else:
        form = PostForm()
    return render(request, 'create_post.html', {'form': form})
```

## Editing existing content

When editing an existing post, Django pre-fills the textarea via the form — and the editor picks up whatever value is already there:

```python
def edit_post(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == 'POST':
        form = PostForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('post-detail', pk=pk)
    else:
        form = PostForm(instance=post)  # textarea pre-filled, editor inherits it
    return render(request, 'edit_post.html', {'form': form})
```

## Validation errors keep the user's text

Server-side validation is the other half of the story. When a form fails
validation, Django re-renders the page with the submitted data bound to the
form. Because the markdown lives in the textarea, it comes back with it:

```python
def create_post(request):
    form = PostForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('post-list')
    # Invalid: the same template re-renders with the user's markdown intact
    return render(request, 'create_post.html', {'form': form})
```

The reader types 800 words, forgets the title, and gets the title error back with every word still in place.

## Optional: auto-save draft

```javascript
const textarea = document.querySelector('.markdown-editor');
const saved = localStorage.getItem('post-draft');
if (saved && !textarea.value) textarea.value = saved;

new MarkdownEditor('.markdown-editor', {
    onChange(value) {
        localStorage.setItem('post-draft', value);
    }
});
```

## Features you get out of the box

- **WYSIWYG hybrid mode** — renders bold, italic and headings live while keeping raw Markdown underneath
- **Live preview** — side-by-side preview panel
- **Find & Replace** — `Ctrl+F` / `Ctrl+H`
- **Keyboard shortcuts** — `Ctrl+B`, `Ctrl+I`, `Ctrl+K`, headings via `Ctrl+1`–`Ctrl+3`, lists via `Ctrl+L`
- **RTL support** — Arabic, Urdu and Farsi work out of the box
- **Dark mode** — add `data-theme="dark"` to any ancestor element
- **XSS safe** — preview sanitized with DOMPurify
- **CSP compatible** — no inline event handlers
- **51 KB gzipped** (245 KB minified, CSS included) — EasyMDE is 107 KB gzipped across its JS and CSS

## Rendering markdown in templates

To display saved markdown in your templates, use the `markdown` library:

```bash
pip install markdown bleach
```

```python
# models.py
import markdown
import bleach
from django.db import models
from django.utils.safestring import mark_safe

class Post(models.Model):
    content = models.TextField()

    def rendered_content(self):
        html = markdown.markdown(self.content, extensions=['fenced_code', 'tables'])
        return mark_safe(bleach.clean(
            html,
            tags=bleach.sanitizer.ALLOWED_TAGS + ['p', 'h1', 'h2', 'h3', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
            strip=True
        ))
```

```html
<!-- detail template -->
<article>
    {{ post.rendered_content }}
</article>
```

Sanitize on render, not on save. Storing the raw markdown means you can change how it is rendered later — switch extensions, allow a new tag, fix an escaping bug — without a data migration.

## Why the textarea matters

An editor that hides the textarea and edits a copy has to guess when to put the
content back. CodeMirror guesses "on submit", which is a good guess and right
most of the time — until the browser refuses to submit, or something reads the
form before that moment. Every one of those failures is silent, because from the
outside the field looks fine.

An editor that leaves the textarea in place has nothing to guess about. The
browser owns the value, Django reads what the browser sent, and nothing in
between has an opinion.

That is the whole design, and it is why the Django integration in this post is
three lines long.

## Starting from scratch?

[django-frutjam-starter](https://github.com/nezanuha/django-frutjam-starter) is a
working Django 6 project with all of this already wired up — accounts, a
dashboard, and this exact markdown editor on a notes form. Clone it, run two
commands, and you have somewhere to start.

---

Full docs, theming guide, and image upload configuration: [markdown-text-editor on Frutjam](https://frutjam.com/plugins/markdown-editor).

Source on [GitHub](https://github.com/nezanuha/markdown-text-editor), package on [npm](https://www.npmjs.com/package/markdown-text-editor).
