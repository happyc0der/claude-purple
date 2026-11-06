#!/bin/bash
# Claude Purple for macOS: builds the small ClaudePurple helper app, turns on Claude's
# Developer Mode (after asking) and installs a LaunchAgent that re-applies the colours
# whenever the Claude desktop app starts. No admin rights needed.
# Run from the repo:  bash macos/install.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
BASE="$HOME/Library/Application Support/ClaudePurple"
APP="$HOME/Applications/ClaudePurple.app"
AGENT="$HOME/Library/LaunchAgents/io.github.claudepurple.watch.plist"
CLAUDE_DATA="$HOME/Library/Application Support/Claude"

mkdir -p "$BASE" "$HOME/Applications" "$HOME/Library/LaunchAgents"
cp "$HERE/launcher.js" "$HERE/runner.js" "$HERE/claude-purple-watch.sh" "$BASE/"
cp "$HERE/../theme/modern-purple.js" "$BASE/modern-purple.js"
chmod +x "$BASE/claude-purple-watch.sh"

# The helper app only launches runner.js, so later updates never need it rebuilt
# (rebuilding would reset its Accessibility permission).
if [ ! -d "$APP" ]; then
  osacompile -l JavaScript -o "$APP" "$BASE/launcher.js"
  /usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string io.github.claudepurple" "$APP/Contents/Info.plist" 2>/dev/null \
    || /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier io.github.claudepurple" "$APP/Contents/Info.plist"
  codesign --force --sign - "$APP" >/dev/null 2>&1
  echo "Built $APP"
else
  echo "Kept the existing $APP (and its Accessibility permission)"
fi

cat <<'MSG'
Claude Purple needs Claude's Developer Mode, which adds a Developer menu and DevTools.
DevTools can see your signed-in Claude session, so only use this on your own computer.
You can turn it on yourself instead: Help > Troubleshooting > Enable Developer Mode.
MSG
read -r -p "Turn on Developer Mode now? (y/N) " answer
if [[ "$answer" =~ ^([yY]|yes)$ ]]; then
  mkdir -p "$CLAUDE_DATA"
  printf '{\n  "allowDevTools": true\n}\n' > "$CLAUDE_DATA/developer_settings.json"
  echo "Developer Mode turned on."
fi

sed "s#HOME_PLACEHOLDER#$HOME#g" "$HERE/io.github.claudepurple.watch.plist" > "$AGENT"
launchctl bootout "gui/$(id -u)" "$AGENT" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$AGENT"
echo "Installed the LaunchAgent io.github.claudepurple.watch."

cat <<'MSG'

Two steps left:
 1. System Settings > Privacy & Security > Accessibility: click +, choose
    ~/Applications/ClaudePurple.app and switch it on. (It types into Claude's DevTools,
    and only when the focused window's title starts with "Developer Tools".)
 2. Quit and reopen Claude. After a few idle seconds a DevTools window flashes up and
    Claude turns purple. Log: ~/Library/Application Support/ClaudePurple/apply.log
MSG
