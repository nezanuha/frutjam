---
title: "Your Team Keeps Typing the Merge Tags Wrong. Give Them a List Instead"
description: "Placeholders like {{customer.name}} break when somebody typos them, adds a space, or 'fixes' a brace that looked like a mistake. Here is a free way to let non-technical staff insert them from a list, with sample values in the preview."
metaTitle: "Merge Tags in a Free Template Editor: Placeholders Non-Technical Staff Cannot Break | Frutjam"
metaDescription: "Let staff insert merge tags from a list instead of typing them. Free and open source, works with Django, Laravel, Rails and Node, with sample values shown in the preview."
createdAt: "2026-11-18T00:00:00+00:00"
updatedAt: "2026-11-18T00:00:00+00:00"
image: "https://cdn.frutjam.com/media/blog/posts/merge-tags-template-editor-without-paying.jpg"
imageAlt: "Screen-print illustration of a printer's tray of blank tags, one lifted out with tongs, beside a hand-scribbled tag torn and discarded"
draft: false
---

Somebody in support edits the welcome email. The next morning two hundred customers get this:

> Hi {{customer.nam}}, your invoice is ready.

Nothing threw. Nothing logged. The template engine found no variable by that name, rendered nothing or rendered the raw braces, and the email went out.

This is the ordinary failure of letting people type placeholders by hand, and it has more than one shape:

- **A typo.** `{{customer.nam}}`, `{{custmer.name}}`. Invisible in a text box, obvious in an inbox.
- **A space.** `{{ customer.name }}` is correct in Django, Jinja and Liquid. In Handlebars and Blade it may not be. [A Laracasts thread on email templates](https://laracasts.com/discuss/channels/laravel/e-mail-templates) uses spaced braces in a Blade example, which is exactly the trap.
- **A helpful correction.** [A write-up on protecting tokens across template syntaxes](https://dev.to/sasa_593fa920f64dac14df3c/how-to-detect-and-protect-esp-tokens-across-5-different-template-syntaxes-3b0f) notes that translators working in raw markup often "fix" a doubled brace, because it looks like a typo to anyone who does not know the syntax.
- **A name that was never valid.** Somebody writes `{{first_name}}` because that is what it is called in the other system.

Telling people the syntax doesn't fix any of this. They aren't getting it wrong because nobody told them. They're getting it wrong because typing a precise string from memory, inside prose, is a thing humans are bad at.

## The fix everybody converges on

Every editor that takes this seriously lands in the same place: **stop asking people to type the tag.** Give them a list.

[TinyMCE's Merge Tags plugin](https://www.tiny.cloud/docs/tinymce/latest/mergetags/) does it. [Unlayer's merge tags](https://docs.unlayer.com/builder/dynamic-content/merge-tags) put a button in the toolbar. [Syncfusion](https://ej2.syncfusion.com/documentation/rich-text-editor/smart-editing/mail-merge) offers a dropdown and a typed trigger. [Stripo](https://plugin.stripo.email/extensions/tutorials/examples/integrations/external-merge-tags-selector) pulls the list out of your CRM.

They're right. The catch is the invoice: TinyMCE's merge tags plugin is **paid only**, its docs say so plainly, and Unlayer and Stripo are hosted email builders you adopt wholesale. Meanwhile the free editors people reach for instead, [Trumbowyg](https://alternativeto.net/software/tinymce/) and Tiptap among them, don't ship the feature at all.

So the pattern is well understood and the free implementations are missing.

## A list, in a markdown editor, free

[markdown-text-editor](https://frutjam.com/plugins/markdown-editor) has this built in, MIT licensed, no account. You pass the fields and it puts them behind a toolbar button.

```javascript
import MarkdownEditor from 'markdown-text-editor';

new MarkdownEditor('#template', {
    toolbar: ['bold', 'italic', 'link',
        { variables: [
            { label: 'Customer Name',  value: '{{customer.name}}' },
            { label: 'Customer Email', value: '{{customer.email}}' },
            { label: 'Invoice No',     value: '{{invoice.number}}' },
            { label: 'Total',          value: '{{invoice.total}}' }
        ]},
        'preview'
    ],
});
```

Support staff see **Customer Name**. They never see or type the braces, so they can't misspell them. The syntax is whatever you put in `value`, which means it is whatever your backend already uses: Django, Jinja, Liquid, Handlebars or Blade, spaced or not.

Group them when the list gets long:

```javascript
{ variables: [
    { label: 'Customer', items: [
        { label: 'Name',  value: '{{customer.name}}' },
        { label: 'Email', value: '{{customer.email}}' }
    ]},
    { label: 'Invoice', items: [
        { label: 'Number', value: '{{invoice.number}}' },
        { label: 'Total',  value: '{{invoice.total}}' }
    ]}
]}
```

## Typing the opening works too

The toolbar list has been there since 1.7. What follows is new in 2.0, which is in beta as this goes up.

A menu is right the first time somebody meets a template and wrong every time after, once they know the field they want. So typing the start of a placeholder opens the same list under the cursor, narrowed as you keep typing, with the arrow keys to move and `Enter` to insert.

Which opening? Yours. The editor reads the punctuation your `value` starts and ends with, so the syntax your backend already uses is the syntax people type:

| Your `value` | Opens on | Inserts |
| --- | --- | --- |
| `{{today}}` | `{{` | `{{today}}` |
| `{{ today }}` | `{{` or `{{ ` | `{{ today }}` |
| `<< today >>` | `<<` | `<< today >>` |
| `[[today]]` | `[[` | `[[today]]` |

That matters more than it sounds. A merge tag feature with its own fixed syntax is one you have to translate at both ends. Your template engine expects one thing, the editor emits another, and somewhere between them sits a conversion nobody wants to own. Here there's nothing to convert, because the editor never had an opinion about the syntax in the first place.

A closing already sitting after the cursor is swallowed whatever its shape, so an editor that auto-closes brackets won't leave anybody with `<< today >>>>`.

## Show them what it will look like

A placeholder in a preview is still a placeholder. `Hi {{customer.name}},` doesn't read like an email, so nobody notices the greeting is clumsy until it's been sent.

Give an entry a `sample` and the preview shows that instead, while the textarea keeps the real placeholder:

```javascript
{ label: 'Customer Name', value: '{{customer.name}}', sample: 'Hannes' }
```

```
what they type     Hi {{customer.name}}, your invoice is ready.
what they see      Hi Hannes, your invoice is ready.
what you store     Hi {{customer.name}}, your invoice is ready.
```

The same idea exists in Unlayer, under the same name. It is the difference between proofreading a template and proofreading an email.

## What this does not do

Worth saying plainly, because a picker isn't validation.

**It doesn't resolve variables.** The editor inserts text. Your application substitutes real values at send time, with the same engine you already use.

**It doesn't stop someone typing braces by hand.** They can still write `{{whatever}}` straight into the textarea. The picker makes the correct path the easy one. It doesn't close the other.

So **validate on save**, server side, against the same list you passed to the editor. Pull the placeholders out of the submitted text, compare them with the allowed names, and reject the ones that don't match. That is a dozen lines, it catches the paste from somewhere else, and it is the only part that actually guarantees anything.

**And render previews with the engine you send with**, where you can. A preview built by a different renderer can differ from the real thing. [A Laravel Mail Editor issue](https://github.com/Qoraiche/laravel-mail-editor/issues/101) describes Blade directives not rendering in the editor because they never pass through Laravel's view compiler.

## The short version

Typing precise strings from memory isn't a thing to ask of people who are writing an email. A list of readable names, a typed shortcut for the people who know what they want, sample values so the preview reads like the finished thing, and validation on save for everything else.

The [documentation](https://frutjam.com/plugins/markdown-editor) covers the options, including grouping, samples and turning the typed trigger off.
