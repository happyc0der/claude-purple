#!/bin/bash
# Keeps the Claude desktop app purple on the Mac. Whenever Claude starts, or reloads its
# page without restarting (it does this to load new web code), it waits until the keyboard
# and mouse have been idle for 4 seconds, then runs ClaudePurple.app.
# Reloads are found through Claude's own log, which writes "Loaded https://claude.ai" on
# every page load.
# Run by the LaunchAgent io.github.claudepurple.watch. Log: apply.log next to job.txt.
BASE="$HOME/Library/Application Support/ClaudePurple"
APP="$HOME/Applications/ClaudePurple.app"
CLAUDE_LOG="$HOME/Library/Logs/Claude/main.log"
last=""
idle_s() { ioreg -c IOHIDSystem | awk '/HIDIdleTime/ { print int($NF / 1000000000); exit }'; }
last_load() { grep -a '\] Loaded https://claude.ai' "$CLAUDE_LOG" 2>/dev/null | tail -1 | cut -c1-19; }

while true; do
  pid=$(pgrep -x Claude | head -1)
  if [ -n "$pid" ]; then
    start=$(ps -o lstart= -p "$pid" 2>/dev/null)
    key="$start|$(last_load)"
    if [ -n "$start" ] && [ "$key" != "$last" ]; then
      sleep 20
      key="$start|$(last_load)"
      tries=0
      while [ $tries -lt 60 ]; do
        if [ "$(idle_s)" -ge 4 ]; then
          printf '%s\n' apply "$BASE/modern-purple.js" - 1 0 > "$BASE/job.txt"
          open -g -W "$APP"
          if tail -1 "$BASE/apply.log" 2>/dev/null | grep -q 'applied$'; then last="$key"; break; fi
        fi
        tries=$((tries + 1))
        sleep 10
      done
      [ $tries -ge 60 ] && last="$key"
    fi
  fi
  sleep 30
done
