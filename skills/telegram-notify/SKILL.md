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
printf '%s' "multiline caption" | telegram-notify -a results.json
```

Use `telegram-notify --help` for formatting, notification, protection, and multi-file options.

Send only when explicitly requested. Attach only requested files. Check exit status; report partial batch delivery when output shows earlier success followed by failure. Never expose `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID`.
