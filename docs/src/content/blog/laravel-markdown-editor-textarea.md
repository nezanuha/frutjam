---
title: "Adding a Markdown Editor to Laravel Forms (No Sync Code Required)"
description: "Most Laravel markdown editors replace the textarea, so you have to sync the value back before submit. Here is how to add one that enhances the textarea instead — $request->input() just works."
metaTitle: "Laravel Markdown Editor for Blade Forms | No JS Sync | Frutjam"
metaDescription: "Add a markdown editor to Laravel forms without breaking form submission. No manual sync, no custom component — $request->input('content') receives the markdown as typed."
image: "https://cdn.frutjam.com/media/blog/posts/laravel-markdown-editor-textarea.jpg"
imageAlt: "Illustration of a Blade form posting markdown straight through a textarea with no sync step"
createdAt: "2026-10-01T00:00:00+00:00"
updatedAt: "2026-10-01T00:00:00+00:00"
draft: true
---

Most tutorials for adding a markdown editor to Laravel end the same way:

```php
// Your Blade form
<textarea id="content" name="content">{{ old('content') }}</textarea>
```

```javascript
// Then in your script:
const easyMDE = new EasyMDE({ element: document.getElementById('content') });

// And before submit, you have to manually sync it back:
document.querySelector('form').addEventListener('submit', () => {
    document.getElementById('content').value = easyMDE.value();
});
```

That extra sync step is the problem. Laravel reads `$request->input('content')` directly from the submitted form field. If the editor replaced your textarea and you forgot the sync, you get empty data in your controller — no validation error, no warning, just blank content saved to your database.

Worse, it fails quietly. The page looks right, the editor works, the form redirects. Only the row in the database is empty.

## A better approach

[markdown-text-editor](https://frutjam.com/plugins/markdown-editor) enhances your textarea instead of replacing it. The original `<textarea>` stays in the DOM and keeps its `name` attribute, so Laravel's form handling works exactly as normal — no sync required.

Everything you already rely on keeps working: `$request->input()`, form request validation, `old()` repopulation, CSRF, and mass assignment.

## Setup

Install via npm (if you use Vite):

```bash
npm install markdown-text-editor
```

Or use the CDN directly in your Blade template — no build step needed:

```html
<script src="https://cdn.jsdelivr.net/npm/markdown-text-editor"></script>
```

## Blade template

```blade
<form method="POST" action="{{ route('posts.store') }}">
    @csrf

    <div>
        <label for="content">Content</label>
        <textarea id="content" name="content" class="markdown-editor">{{ old('content') }}</textarea>
        @error('content') <span>{{ $message }}</span> @enderror
    </div>

    <button type="submit">Save</button>
</form>

<script src="https://cdn.jsdelivr.net/npm/markdown-text-editor"></script>
<script>
    new MarkdownEditor('.markdown-editor');
</script>
```

That's it. Submit the form — `$request->input('content')` contains the markdown exactly as typed. No hooks, no sync, no custom extraction.

## Controller

Your controller doesn't change at all:

```php
// PostController.php
public function store(Request $request)
{
    $validated = $request->validate([
        'title'   => 'required|string|max:255',
        'content' => 'required|string',
    ]);

    Post::create($validated); // content is already there, untouched

    return redirect()->route('posts.index');
}
```

## Editing existing content

When editing a post, pre-fill the textarea with the saved value — the editor inherits it automatically:

```blade
<form method="POST" action="{{ route('posts.update', $post) }}">
    @csrf
    @method('PUT')

    <textarea id="content" name="content" class="markdown-editor">{{ old('content', $post->content) }}</textarea>

    <button type="submit">Update</button>
</form>

<script src="https://cdn.jsdelivr.net/npm/markdown-text-editor"></script>
<script>
    new MarkdownEditor('.markdown-editor');
</script>
```

## Validation failures keep the markdown

This is where replacing the textarea hurts most, and it is the reason `old()` is in every example above.

When validation fails, Laravel redirects back with the input flashed to the session. `old('content')` prints it straight into the textarea, and the editor picks it up from there:

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'title'   => 'required|string|max:255',
        'content' => 'required|string|min:50',
    ]);

    // On failure Laravel redirects back automatically — old('content')
    // refills the textarea with everything the user wrote.
    Post::create($validated);

    return redirect()->route('posts.index');
}
```

Someone writes 800 words, forgets the title, and gets the title error back with every word still in place. An editor that replaced the textarea would need its own code to restore that — and if it restores late, it overwrites what the user has already started retyping.

## Vite or the CDN

Both work. Use Vite when the rest of your front end is bundled:

```javascript
// resources/js/app.js
import MarkdownEditor from 'markdown-text-editor';

document.querySelectorAll('.markdown-editor').forEach(el => new MarkdownEditor(el));
```

```blade
@vite(['resources/js/app.js'])
```

Use the CDN for an admin panel or a single page, where a build step buys you nothing.

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
- **~116KB** — against 300KB+ for EasyMDE

## Rendering markdown in Blade

To display saved markdown in your views, use the `league/commonmark` package:

```bash
composer require league/commonmark
```

```php
// App\Models\Post.php
use League\CommonMark\CommonMarkConverter;

class Post extends Model
{
    public function getRenderedContentAttribute(): string
    {
        $converter = new CommonMarkConverter([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);

        return $converter->convert($this->content)->getContent();
    }
}
```

```blade
{{-- show.blade.php --}}
<article>
    {!! $post->rendered_content !!}
</article>
```

Or keep it out of the model and convert where you render:

```php
use League\CommonMark\CommonMarkConverter;

$converter = new CommonMarkConverter(['html_input' => 'strip']);
$html = $converter->convert($post->content)->getContent();
```

```blade
<article>{!! $html !!}</article>
```

Note the `html_input => 'strip'` setting. Markdown allows raw HTML, so anything a user writes would otherwise be rendered as-is — and `{!! !!}` prints it unescaped. Store the raw markdown, strip the HTML at render time, and you can change how it renders later without touching the data.

## Why the textarea matters

An editor that replaces the textarea makes itself part of your form pipeline. Every form using it needs the sync step, every new developer on the team has to learn about it, and every forgotten one is a silent data-loss bug that validation cannot catch — an empty string passes `required` checks only after it has already been submitted as empty.

An editor that enhances the textarea stays out of the pipeline entirely: the browser submits the field, Laravel reads it, and nothing in between has an opinion.

That is the whole design, and it is why the Laravel integration in this post is two lines long.

---

Full docs, theming guide, and image upload configuration: [markdown-text-editor on Frutjam](https://frutjam.com/plugins/markdown-editor).

Source on [GitHub](https://github.com/nezanuha/markdown-text-editor), package on [npm](https://www.npmjs.com/package/markdown-text-editor).
