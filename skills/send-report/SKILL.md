---
name: send-report
description: Deliver a report to the user. For HTML, use an existing hosted URL or upload via postplan; attach the local file only when no URL can be obtained. Always notify via the telegram-notify skill.
---
# send-report
Respond to the user with the report.

## Resolve the delivery target

Use **URL-first delivery**:

1. If the report already has a hosted URL, use that URL.
2. Otherwise, if the report is an HTML file, upload it:

```sh
postplan upload path-to-file.html
```

3. When the upload returns a URL, use that URL in both the response and Telegram notification.
4. Use a local file attachment only when no hosted URL exists and the upload attempt did not produce one.

A hosted URL is the mandatory delivery target whenever one is available. Send the URL as message text; do not also attach the local HTML file.

## Deliver

Always send a Telegram notification using the `telegram-notify` skill. Include the report title, a short description, and the hosted URL. When no hosted URL can be obtained, attach the local report file as the fallback.

Check the Telegram command's exit status before claiming delivery succeeded. Telegram notification is mandatory and additive; it does not replace the normal response presenting the report to the user.
