---
name: explain-diff-print
description: Use when the user asks for a printable explanation of a code change, diff, branch, or PR. Produces printable HTML for reading away from a screen.
---

# Explain diff for print

Explain the specified code change as a paper-readable document.

Before writing, read the `print-mode-html` skill. Follow it for all HTML, typography, print layout, file location, completion checks, and delivery.

## Explore

Broadly inspect the diff and surrounding code. Establish existing behavior, changed behavior, motivation, data flow, and affected boundaries before writing. Account for every material change.

## Document structure

Produce these top-level sections in order:

1. **Background**: Explain the relevant existing system. Start with beginner-friendly background clearly marked as skippable, then narrow to context directly required for this change.
2. **Intuition**: Explain the change's essence rather than implementation detail. Use small toy examples with concrete data and a few reusable diagram families.
3. **Code**: Walk through what changed and why. Group changes by concept or execution flow instead of file order or line-by-line trivia.
4. **Quiz**: Write five medium-difficulty multiple-choice questions. Each needs real understanding but no gotchas. List options as A, B, C, and D.
5. **Answers**: Put this at the very end on its own page. Give each correct letter and a one-paragraph explanation so the reader can check their work after attempting every question.

## Writing

- Use clear, engaging, classic prose with smooth transitions.
- Prefer plain, warm, precise language.
- Define each term on first use.
- Use concrete example data in every system or data-flow diagram.
- For UI changes, include a simplified HTML/CSS representation of relevant UI.

## Completion check

Before delivery, verify:

1. Every material change appears in the explanation.
2. Background, Intuition, Code, Quiz, and Answers appear in order.
3. Quiz contains exactly five questions; Answers is final and starts on its own printed page.
4. Every rule in `print-mode-html` passes its completion check.
