---
name: show-report
description: How to present reports to the user.
---
# show-report
Create an HTML file in `/tmp/`, then upload it to cloud-plan manager:

```sh
postplan upload path-to-file.html
```

Replace `path-to-file.html` with created file's path. Command output includes uploaded file's URL. Respond to user with that URL instead of local file path.

After upload, always send a Telegram notification containing report title, short description, and uploaded URL:

```sh
printf '%s\n' \
  'Report: <title>' \
  '<short description>' \
  '<uploaded URL>' | telegram-notify
```

Telegram notification is mandatory and additive. It does not replace normal response presenting uploaded URL to user. Check `telegram-notify` exit status; if notification fails, report failure to user and do not claim it was sent.

## When to use
When you need to present a report to the user, be it after an internet research task, a PR review, or anything else that would naturally require a "report back".

## Instructions
The styles for text in the HTML file should be minimal. Legibility and clarity are important. Ensure it has a dark mode that simply follows the browser's theme.


Though the text should have minimal styling, any other element that is added to the report may be as interactive or stylish as necessary. We want the basic elements to remain basic. If the report would benefit from elements that are more out-there, then feel free to style these and add javascript to these elements. These extra elements are not mandatory. Use them if you deem them necessary to visualize your point or help you in any other way.
