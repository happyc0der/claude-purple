# Changelog

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
