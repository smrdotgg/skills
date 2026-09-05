---
name: explain
description: Creates readable explanations in screen or print-ready paper mode.
disable-model-invocation: true
---

# Explain

Explain the specified subject as a readable document.

## Mode

Two modes, selected by user request. If neither is explicitly mentioned, assume **screen** mode.

- **Screen mode (default):** Read the `create-report` skill and follow it for output file and delivery.
- **Paper mode:** Read the `print-mode-html` skill and follow it for all HTML, typography, print layout, file location, completion checks, and delivery.

Both modes carry the same content below; only the format and delivery differ.

## Explore

Investigate the subject in the real code until you could explain it end to end. Adapt the digging to the subject:

- **A code change**: establish existing behavior, changed behavior, motivation, data flow, and affected boundaries. Account for every material change.
- **A system or subsystem**: find the entry points, trace a concrete piece of data through every component, note state, persistence, failure modes, and the reasons behind the shape of the design.
- **An algorithm or concept**: pin down the precise mechanics, the problem it solves, its complexity, and where it appears in this codebase, if anywhere.

Read the actual source rather than trusting names, comments, or docs.

## Document structure

Produce these top-level sections in order:

1. **Background**: Start with beginner-friendly background clearly marked as skippable, then narrow to the context directly required for the subject.
2. **Intuition**: Explain the subject's essence rather than implementation detail. Use small toy examples with concrete data and a few reusable diagram families.
3. **Walkthrough**: The deep dive, adapted to the subject:
   - For a change, walk through what changed and why, grouped by concept or execution flow instead of file order or line-by-line trivia.
   - For a system, follow one concrete request or input through it end to end, naming each component it touches and what it does there.
   - For an algorithm or concept, build up the mechanics step by step on running example data.
4. **Quiz**: Write five medium-difficulty multiple-choice questions. Each needs real understanding but no gotchas. List options as A, B, C, and D.
5. **Answers**: Put this at the very end. Give each correct letter and a one-paragraph explanation so the reader can check their work after attempting every question. In paper mode, start Answers on its own printed page.

## Writing

- Use clear, engaging, classic prose with smooth transitions.
- Prefer plain, warm, precise language.
- Define each term on first use.
- Use concrete example data in every system or data-flow diagram.
- For UI under discussion, include a simplified HTML/CSS representation of relevant UI.

## Completion check

Before delivery, verify:

1. Every material aspect of the subject found during exploration appears in the explanation.
2. Background, Intuition, Walkthrough, Quiz, and Answers appear in order.
3. Quiz contains exactly five questions; Answers comes last.
4. Screen mode: every rule in `create-report` is followed. Paper mode: every rule in `print-mode-html` passes its completion check.
