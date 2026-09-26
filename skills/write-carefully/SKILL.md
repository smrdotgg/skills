---
name: write-carefully
description: Draft the final response in a Markdown file, revise it, and return its path.
disable-model-invocation: true
---

Complete the user's request as usual, but deliver the response through a file:

1. Write the entire response you would have sent in chat to a uniquely named Markdown file under `/tmp` (for example, create the path with `mktemp /tmp/write-carefully-XXXXXXXX.md`).
2. Read the file back in full. Check every claim against the request and the work done; resolve contradictions, missing qualifications, and awkward or unclear phrasing by editing the file. Read the revised file again. Repeat until the file is coherent, accurate, and ready for the user to read.
3. Reply in chat with only the file's absolute path. The file, not the chat reply, is the answer.
