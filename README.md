# Claude Purple

A purple reskin for the **Claude desktop app** (Windows and macOS) and **Claude Code**, using the palette of the VS Code theme [Modern Purple Theme Dark](https://github.com/nataliefruitema/modern-purple-theme), plus **browser-ad-remover**, a Claude Code plugin that strips ads from pages in Claude's built-in browser.

> Unofficial. Not made by, endorsed by, or affiliated with Anthropic. It changes colours only, so the app's behaviour isn't changed. It relies on Developer Mode and on the app's internal colour names, so an update can partly or fully undo it.

## What's inside

| Part | What it does | Where |
|---|---|---|
| Desktop reskin | Recolours the whole app: sidebar, chat, panes, menus, settings, placeholders, and code blocks with the theme's syntax colours | `theme/`, `windows/`, `macos/` |
| CLI theme | Claude Code's own custom theme format, for the terminal UI | `cli/modern-purple.json` |
| Terminal scheme | Matching Windows Terminal colour scheme | `cli/windows-terminal-scheme.json` |
| browser-ad-remover | Removes ad markup and empty ad slots before Claude reads or screenshots a page in the built-in browser | `plugins/browser-ad-remover` |

## Install

### Claude Code CLI theme
Copy `cli/modern-purple.json` to `~/.claude/themes/`, then pick **Modern Purple** in `/theme` (or set `"theme": "custom:modern-purple"` in `~/.claude/settings.json`).

### browser-ad-remover (Claude Code plugin)
```
/plugin marketplace add happyc0der/claude-purple
/plugin install browser-ad-remover@claude-purple
```
`/browser-ads` turns it on and off.

### Desktop reskin: Windows
```powershell
git clone https://github.com/happyc0der/claude-purple
cd claude-purple
pwsh -ExecutionPolicy Bypass -File windows\install.ps1
```
Restart the Claude app. The first time, run `pwsh -File windows\apply-theme.ps1 -AllowPasting` once so the console accepts the paste.

### Desktop reskin: macOS
```bash
git clone https://github.com/happyc0der/claude-purple
cd claude-purple
bash macos/install.sh
```
Then add `~/Applications/ClaudePurple.app` under **System Settings > Privacy & Security > Accessibility**, and restart Claude.

## How it works

The Claude desktop app has no custom theme support, its files are signed and integrity-checked, and it blocks remote debugging. So nothing is patched. Instead:

1. **Developer Mode** (the app's own Help > Troubleshooting option) enables DevTools.
2. When Claude starts, a small watcher (a logon task on Windows, a LaunchAgent on macOS) waits until you've stopped typing, opens DevTools, and pastes `theme/modern-purple.js` into the console.
3. That script only sets **colour values**. It finds the app's neutral greys at runtime, including styles loaded later by menus, and shifts their hue. It also maps the app's code theme to the VS Code theme's syntax colours, including inside the sealed-off code blocks. A reload undoes it, and the watcher re-applies it.

**Safety:** the automation only types when it has confirmed that the focused window is Claude's "Developer Tools" window, using the window title. Otherwise it stops. It waits for 4 seconds without keyboard or mouse input, restores your clipboard afterwards, and logs every run.

## browser-ad-remover: what it saves

Claude Code's built-in browser has no extension or content-blocking support, so this plugin hooks the browser tools and runs a small sweep just before Claude reads or screenshots a page. It removes common ad slots (Google Ads, GPT, Taboola, Outbrain, ad-network iframes and `ad`-named containers), and the empty space they leave. Measured on three ad-heavy pages:

| Page | Ad elements removed | Page text | Ad iframes | Share of the first screen that was ads |
|---|---|---|---|---|
| AccuWeather | 7 | unchanged | 4 → 4 | ~31% (empty slots) |
| Daily Mail | 37 | −0.3% | 31 → 12 | ~31% |
| Allrecipes | 36 | ~0% | 21 → 14 | high (overlapping slots, figure overstated) |

So it **barely changes text tokens**. The win is screenshots: each one shows more real content and less ad space, so Claude needs fewer screenshots and scrolls. Ads still download, because it removes them from the page rather than blocking them.

## Limitations
- The terminal pane's **text** colours are set by the terminal component in code, so CSS can't change them. Only its background is recoloured.
- On macOS, a page reload without an app restart isn't detected yet. Windows checks for grey and re-applies.
- Pop-out windows (quick entry and similar) aren't covered.
- If Anthropic renames its colour values, parts fall back to the default colours until `theme/modern-purple.js` is updated.

## Uninstall
`windows/uninstall.ps1` or `macos/uninstall.sh` removes the task or agent and turns Developer Mode off. On macOS, also remove ClaudePurple from the Accessibility list.

## Credits
Colours from **Modern Purple Theme** by [nataliefruitema](https://github.com/nataliefruitema/modern-purple-theme). That theme declares no licence, so this repo ships no files from it: only colour values, re-applied with original code. The code here is MIT.
