# Setting up Claude Purple (instructions for AI coding agents)

You are helping a user install Claude Purple from this repository. Work through the
steps below in order, run the commands yourself where you can, and stop to ask the
user wherever a step says so. Report what you did and what you could not verify.

## 0. Ground rules
- **Ask before** turning on Claude's Developer Mode, before restarting the Claude desktop
  app (a restart ends every open Claude session, including the one you are running in if
  you are inside the desktop app), and before changing any setting outside this repo.
- Everything here is per-user. Never use sudo or an elevated/Admin shell.
- Do not edit the app's own files. This project only adds colours through DevTools.
- If you are running **inside the Claude desktop app**, tell the user that the restart in
  step 4 will end this session, and let them do the restart.

## 1. Find out what the user wants
Ask which parts they want (default: all that apply to their OS):
1. **CLI theme** for Claude Code in the terminal.
2. **browser-ad-remover** plugin for Claude Code's built-in browser.
3. **Desktop reskin** of the Claude desktop app (Windows or macOS).
4. **Windows Terminal scheme** (Windows only).

## 2. CLI theme
- Copy `cli/modern-purple.json` to `~/.claude/themes/modern-purple.json`
  (Windows: `%USERPROFILE%\.claude\themes\`). Create the folder if needed.
- Set `"theme": "custom:modern-purple"` in `~/.claude/settings.json`, preserving every
  other key (read, merge, write; never overwrite the file).
- Verify: `claude` then `/theme` shows "Modern Purple" selected.

## 3. browser-ad-remover
Run:
```
claude plugin marketplace add happyc0der/claude-purple
claude plugin install browser-ad-remover@claude-purple
```
Verify with `claude plugin list`. It takes effect in new sessions; `/browser-ads` toggles it.

## 4. Desktop reskin
### Windows
1. Ask, then run `pwsh -ExecutionPolicy Bypass -File windows\install.ps1` (it asks before
   enabling Developer Mode and registers the per-user logon task "Claude Purple").
2. The user fully quits Claude (tray icon > Quit) and reopens it.
3. Run once: `pwsh -File windows\apply-theme.ps1 -AllowPasting` while the user keeps
   their hands off the keyboard and mouse for ~10 seconds.
4. Verify: `windows\apply-theme.log` ends with `verified: N of 24 sampled points are purple`
   and `applied`. `pwsh -File windows\apply-theme.ps1 -Check` reports the windows it sees.

### macOS
1. Ask, then run `bash macos/install.sh` (it builds `~/Applications/ClaudePurple.app`,
   asks before enabling Developer Mode and loads the LaunchAgent).
2. **The user must do this by hand:** System Settings > Privacy & Security > Accessibility,
   click +, add `~/Applications/ClaudePurple.app`, switch it on. You cannot grant this.
   Do not rebuild the app afterwards: a rebuild resets this permission.
3. The user quits and reopens Claude. The watcher applies the colours after ~20 s once
   the keyboard and mouse have been idle for 4 s.
4. Verify: `tail ~/Library/Application\ Support/ClaudePurple/apply.log` ends with
   `applied`. A read-only check that types nothing:
   ```
   B="$HOME/Library/Application Support/ClaudePurple"
   printf '%s\n' check - - 0 0 > "$B/job.txt"; open -g -W ~/Applications/ClaudePurple.app; cat "$B/check.txt"
   ```
   It should list a window titled "Claude" and `"trusted":true`.

## 5. Windows Terminal scheme (optional)
Add the object in `cli/windows-terminal-scheme.json` to `schemes` in Windows Terminal's
`settings.json` and set `"colorScheme": "Modern Purple"` under `profiles.defaults`.
Merge; don't replace the file.

## Troubleshooting
| Symptom | Cause and fix |
|---|---|
| Log says `stop: DevTools did not open` | Developer Mode is off, or Claude wasn't restarted after turning it on. |
| Console shows "Type 'allow pasting'" | First run only. Windows: run `apply-theme.ps1 -AllowPasting`. macOS: the job already types it. |
| macOS log says `Accessibility permission is off` | Re-add ClaudePurple under Accessibility (step 4.2). |
| macOS log says `Claude did not come to the front` | Another app (often System Settings) was in front; it retries. |
| `skip: keyboard or mouse in use` | Expected. It waits until the user is idle. |
| Parts are still grey after an app update | The app renamed colour variables. Update `theme/modern-purple.js`. |

## Uninstall
Windows: `pwsh -File windows\uninstall.ps1`. macOS: `bash macos/uninstall.sh`, then remove
ClaudePurple from the Accessibility list. Restart Claude afterwards.
