# Security policy

## What this project can access
- **Developer Mode** gives DevTools, and so the pasted theme script, the same access as the
  Claude web page itself, including your signed-in session. The theme script only sets colour
  values; it makes no network requests and reads no conversation content.
- **Keystrokes:** the Windows script and the macOS helper send keys to Claude's DevTools window
  only, after checking its title, and only after 4 s without keyboard or mouse input.
- **macOS Accessibility** is granted to `ClaudePurple.app`, which only runs `runner.js` from
  `~/Library/Application Support/ClaudePurple/`. Keep that folder writable only by you.
- **browser-ad-remover** runs a small script in pages Claude opens in its built-in browser,
  removing ad elements. It sends nothing anywhere.

Read the scripts before installing; they are short.

## Reporting a problem
Please report security issues privately through GitHub's
[private vulnerability reporting](https://github.com/happyc0der/claude-purple/security/advisories/new)
rather than a public issue. Include the OS, the Claude app version and the steps to reproduce.
