---
name: send-report
description: Deliver a report to the user. If the report happens to be an HTML file, optionally upload it via postplan. Always send a Telegram notification using the telegram-notify skill with whatever the report needs attached.
---
# send-report
Respond to the user with the report.

If the report happens to be an HTML file, you can upload it to cloud-plan manager:

```sh
postplan upload path-to-file.html
```

Replace `path-to-file.html` with created file's path. Command output includes uploaded file's URL. Respond to user with that URL instead of local file path.

Always send a Telegram notification with whatever the report needs attached — title, short description, URL, or file. Use the `telegram-notify` skill.

Telegram notification is mandatory and additive. It does not replace normal response presenting report to user.
