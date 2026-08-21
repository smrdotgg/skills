---
name: telegram-notify
description: Send user Telegram messages and file attachments with local telegram-notify CLI. Use when user asks to be notified, pinged, messaged, or sent files on Telegram.
---

# Telegram Notify

Send requested text or files:

```bash
telegram-notify "message"
telegram-notify --attach report.pdf --caption "Report ready"
telegram-notify -a one.pdf -a two.csv "Export bundle"
```

For multiline text, send real newline characters through stdin:

```bash
telegram-notify <<'EOF'
PR ready
https://example.com/pull/123
EOF

printf '%s\n' "line one" "line two" | telegram-notify

telegram-notify -a results.json <<'EOF'
Multiline attachment caption
Second line
EOF
```

Ordinary shell quotes do not expand `\n`: `telegram-notify "line one\nline two"` sends the two characters `\` and `n`. Use a heredoc or `printf` as above, then check the exit status.

Use `telegram-notify --help` for formatting, notification, protection, and multi-file options.

Send only when explicitly requested. Attach only requested files. Check exit status; report partial batch delivery when output shows earlier success followed by failure. Never expose `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID`.
