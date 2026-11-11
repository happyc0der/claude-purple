# Changelog

## 1.0.1 (2026-11-11)
- macOS: re-apply the theme when Claude reloads its page without restarting. The app does
  this to load new web code, which wiped the colours until the next restart. The watcher now
  notices the reload from the `Loaded https://claude.ai` line in Claude's own log.
- Windows: apply within about 10 seconds of Claude opening instead of up to a minute. The
  watcher checks for a new Claude every 3 s (it remembers the process, so this stays cheap),
  applies once the window has drawn for 8 s, and retries every 5 s if you are typing.

## 1.0.0 (2026-11-09)
First tagged release.

### Desktop reskin
- Recolours the whole Claude desktop app: sidebar, chat, Changes/Files/Terminal panes, menus,
  settings, placeholders and code blocks (Modern Purple syntax colours, including inside
  code-block shadow roots).
- macOS: the sidebar is painted solid instead of showing grey through the window's vibrancy,
  its text matches Windows, and the selected item uses the theme's violet accent.
- Works when Claude is minimized: the window is restored for the few seconds the apply takes,
  then minimized again.
- Only types into a DevTools window whose title names claude.ai.
- Windows: the colour check captures only Claude's own window, never the rest of the screen.
- Lighter: watchers poll every 30 s, and the code-block watcher wakes only when a code block
  is added, not on every streamed word.

### Also included
- Claude Code CLI theme `custom:modern-purple`.
- Windows Terminal colour scheme.
- browser-ad-remover 0.2.0, a Claude Code plugin that removes ads from pages in the built-in
  browser before Claude reads or screenshots them.
