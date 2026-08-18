---
name: explain-diff-print
description: Use when the user asks for a printable explanation of a code change, diff, branch, or PR. Produces a self-contained HTML file optimized for printing on a black-and-white printer and reading away from a screen (e.g. at a café).
---

# Explain Diff (Print Edition)

Make a clear, legible, printable explanation of the specified code change. The output is a single self-contained HTML file meant to be printed on a **black-and-white printer**, taken somewhere quiet, and read on paper.

The guiding constraint is **legibility on cheap paper from a B&W laser printer**. No color reliance, no dark backgrounds, no tiny fonts, no interactive elements that only work on a screen. Everything must survive the trip to grayscale print.

## Sections

Produce these sections, in order. Each major section starts on a new printed page.

- **Background**: Explain the existing system relevant to this change. Broadly explore the surrounding code first. Include a deep background for beginners (clearly marked as skippable if the reader already knows it), then a narrower background directly relevant to the change.
- **Intuition**: Explain the core intuition. Essence over details. Use concrete toy examples with small data. Use diagrams liberally — but see the diagram rules below, which are stricter than the on-screen version of this skill.
- **Code**: A high-level walkthrough of the changes. Group and order the changes in an understandable way. Walk through *what changed and why*, not line-by-line trivia.
- **Quiz**: Five questions testing whether the reader actually understood the PR. Medium difficulty — real understanding required, but no gotchas. **Format for print:** each question is a numbered multiple-choice question with the options listed plainly (A, B, C, D). Put the answers in an **Answers section at the very end of the document**, starting on its own page, so the reader can attempt all questions before flipping to the back. For each answer give the correct letter and a one-paragraph explanation of why.

## Writing style

- Write with the clarity and flow of Martin Kleppmann: engaging, classic style, smooth transitions between sections.
- Plain, warm, precise prose. Short sentences when they help, but not choppy.
- Define every term the first time it appears.

## Format and file location

- Output a single self-contained HTML file with all CSS inline in a `<style>` block. No external resources, no web fonts, no JavaScript. It must open and print correctly with no network.
- Put the file in a global place on the computer, outside the code repo. The filename must start with today's date in `YYYY-MM-DD-` format so files stay time-sorted and out of version control. Example: `/tmp/2026-01-12-explanation-<slug>.html`
- One long document. No tabs, no collapsing sections, no hover-reveals — remember, this prints to paper.

## Print and typography rules (important)

These rules are the whole point of this skill versus the on-screen version. Follow them strictly.

- **Black-and-white only.** Design as if color does not exist. Never encode meaning with color alone. If you would have used color to distinguish things on screen, distinguish them on paper with: borders, line style (solid vs. dashed vs. dotted), labels, numbering, shading patterns, or bold/italic weight.
- **No dark or saturated backgrounds.** White background, black text. The only shading allowed is very light gray (`#f2f2f2` or lighter) for code blocks and table headers, which prints as a faint tint and does not waste toner. Never use black backgrounds with light text.
- **Fonts**: use a readable serif stack for body text (`Charter, Georgia, "Times New Roman", serif`) and a readable monospace stack for code (`"SF Mono", "Menlo", Consolas, "Courier New", monospace`). Serif body text is easier on the eyes for long reading on paper.
- **Sizes**: body text `12pt`, line-height `1.5`. `H1` ~20pt, `H2` ~16pt, `H3` ~13pt. Code blocks `10.5pt` with line-height `1.4`. Don't go smaller than `10pt` anywhere.
- **Margins**: generous. `@page { margin: 20mm 18mm; }` and a matching body padding for screen viewing. Give the reader room to write notes in the margins.
- **Paragraph spacing**: `0.6em` between paragraphs. No indentation on first lines; block paragraphs with whitespace are easier to scan on paper.
- **Max width**: constrain body content to ~`70ch`/`680px` for comfortable screen reading before printing; the print stylesheet should let it fill the page.
- **Page breaks**: every top-level section (`<section class="level1">`) starts on a new printed page via `page-break-before: always`. Avoid page breaks inside code blocks, diagrams, and quiz questions using `break-inside: avoid`.
- **Widows/orphans**: set `orphans: 3; widows: 3;` on body copy so paragraphs don't strand a single line at the top or bottom of a page.
- **Links**: keep them but don't rely on them. URLs that matter should be printed in full as text, since a paper reader cannot click.
- **A table of contents** at the top: a numbered list of section titles with page numbers is ideal if you can compute them, but a simple numbered list of section titles is acceptable. Do not make it a collapsible widget.

## Diagrams

- No ASCII diagrams. Use simple HTML/CSS constructions.
- Diagrams must work in grayscale. Use borders (solid/dashed/dotted), boxed labels, numbered captions, and light-gray fills — never color-coded meaning.
- Pick a small number of diagram *families* and reuse them throughout the explanation:
  - A simplified version of the UI the user sees, for UI changes.
  - A system/data-flow diagram showing components and example data flowing between them. Always include concrete example data in the boxes/arrows.
- Keep diagrams modest in size so they fit on one printed page and do not break across pages (`break-inside: avoid`).

## Code blocks

- Always use `<pre><code>` tags.
- Every code block's CSS **must** include `white-space: pre-wrap;` (so long lines wrap on paper instead of overflowing the page edge) and `overflow-wrap: anywhere;`.
- Light-gray background, 1px solid border, a little inner padding. Monospace font per the rules above.
- Before saving the file, scan each code block in the HTML source and confirm its CSS includes `white-space: pre-wrap`. This is the single most common failure mode for printable HTML.
- Do not rely on syntax highlighting colors. If you want emphasis inside code, use **bold** (`<strong>`) for the specific tokens the prose is discussing — color-based highlighting will vanish on a B&W printer.

## Callouts

- Use callout boxes for key concepts, definitions, and important edge cases.
- Callouts are bordered boxes with a bold label (e.g. "Definition", "Edge case", "Key idea"). No colored backgrounds — a 1px solid border and a bold label is enough. They must `break-inside: avoid`.

## Self-check before saving

Before writing the file to disk, verify:

1. No color is used to convey meaning anywhere.
2. No dark/saturated backgrounds; text is black on white except faint gray tints.
3. Body font is the serif stack, code is the monospace stack, sizes meet the minimums.
4. Every `<pre>` has `white-space: pre-wrap` in its CSS.
5. Every top-level section starts on a new page in print.
6. Quiz answers live in a separate final section on its own page.
7. File path starts with `/tmp/YYYY-MM-DD-`.
8. The file is fully self-contained — no external fonts, scripts, stylesheets, or images.
