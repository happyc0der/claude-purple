#!/bin/bash
# Removes Claude Purple on macOS and turns Claude's Developer Mode back off.
AGENT="$HOME/Library/LaunchAgents/io.github.claudepurple.watch.plist"
launchctl bootout "gui/$(id -u)" "$AGENT" 2>/dev/null || true
rm -f "$AGENT"
rm -rf "$HOME/Applications/ClaudePurple.app" "$HOME/Library/Application Support/ClaudePurple"
D="$HOME/Library/Application Support/Claude/developer_settings.json"
[ -f "$D" ] && printf '{\n  "allowDevTools": false\n}\n' > "$D"
echo "Removed. Also remove ClaudePurple from System Settings > Privacy & Security > Accessibility, then restart Claude."
