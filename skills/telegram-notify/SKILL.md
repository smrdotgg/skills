---
name: telegram-notify
description: Send user Telegram messages with local telegram-notify CLI. Use when user asks to be notified, pinged, or messaged on Telegram.
---

# Telegram Notify

Send message:

```bash
telegram-notify "message"
```

For multiline content:

```bash
printf '%s' "message" | telegram-notify
```

Send only when you are explicitly requested to use this skill. Check command exit status; never claim message sent after failure. Never expose `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID`.
