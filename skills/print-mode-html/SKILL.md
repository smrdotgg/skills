---
name: print-mode-html
description: Shared presentation rules for any report or explanation requested as printable HTML. Use when output must print legibly on a black-and-white printer, including print-mode PR reviews and printable diff explanations.
---

# Print-mode HTML

Produce one HTML file designed for black-and-white printing and comfortable paper reading. Apply every rule below.

## Output

- Put document CSS inline in a `<style>` block. Google Fonts is the only external resource. Use no JavaScript or other external resources.
- Save outside the code repository at `/tmp/YYYY-MM-DD-<slug>.html`, using today's date.
- Build one long document with a numbered table of contents. Use no tabs, collapsed sections, hover-only content, or other screen-only interactions.
- Keep important URLs visible as text because paper readers cannot click them.

## Fonts

Place these exact tags in `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Use these exact stacks throughout:

```css
body { font-family: "Geist", system-ui, sans-serif; }
pre, code { font-family: "Geist Mono", ui-monospace, monospace; }
```

System fallbacks must preserve legibility if Google Fonts fails to load.

## Paper typography

- Body: `12pt`, line-height `1.5`, black text on white.
- Headings: `h1` about `20pt`, `h2` about `16pt`, `h3` about `13pt`.
- Code: `10.5pt`, line-height `1.4`. Use nothing smaller than `10pt`.
- Paragraphs: `0.6em` between blocks, no first-line indentation, `orphans: 3`, `widows: 3`.
- Page margins: `@page { margin: 20mm 18mm; }`. Leave room for handwritten notes.
- Screen preview: constrain content to about `70ch` or `680px`; print layout fills available page width.

## Black-and-white design

- Encode meaning with labels, numbering, borders, line styles, weight, or italics — never color alone.
- Use white backgrounds and black text. Only faint gray (`#f2f2f2` or lighter) may shade code blocks and table headers.
- Use no dark backgrounds or light-on-dark text.
- Start each top-level section (`<section class="level1">`) on a new printed page with `page-break-before: always`.
- Keep code blocks, diagrams, callouts, tables, and individual quiz questions together with `break-inside: avoid`.

## Code, diagrams, and callouts

- Use `<pre><code>` for code. Apply `white-space: pre-wrap;` and `overflow-wrap: anywhere;` so long lines remain on the page.
- Style code with faint gray fill, a `1px` solid border, and modest padding. Use bold rather than color for highlighted tokens.
- Build diagrams with HTML/CSS, not ASCII or external images. Use boxed labels, numbered captions, solid/dashed/dotted borders, and concrete example data. Keep each diagram on one page.
- Build callouts as bordered boxes with a bold text label such as “Definition,” “Edge case,” or “Key idea.”

## Delivery

After saving the file, read the `send-report` skill and follow it.

## Completion check

Before delivery, verify:

1. Google Fonts links load Geist and Geist Mono, and matching CSS stacks are applied.
2. Meaning survives grayscale; backgrounds remain white or faint gray.
3. Text sizes, spacing, margins, page breaks, widows, and orphans follow this skill.
4. Every `<pre>` wraps with `white-space: pre-wrap` and `overflow-wrap: anywhere`.
5. Page-contained elements use `break-inside: avoid`.
6. File uses `/tmp/YYYY-MM-DD-<slug>.html` and contains no external dependency except Google Fonts.
