#!/bin/bash
# Keeps the Claude desktop app purple on the Mac: whenever Claude (re)starts, it waits
# until the keyboard and mouse have been idle for 4 seconds, then runs ClaudePurple.app.
# Run by the LaunchAgent io.github.claudepurple.watch. Log: apply.log next to job.txt.
BASE="$HOME/Library/Application Support/ClaudePurple"
APP="$HOME/Applications/ClaudePurple.app"
last=""
idle_s() { ioreg -c IOHIDSystem | awk '/HIDIdleTime/ { print int($NF / 1000000000); exit }'; }

while true; do
  pid=$(pgrep -x Claude | head -1)
  if [ -n "$pid" ]; then
    start=$(ps -o lstart= -p "$pid" 2>/dev/null)
    if [ -n "$start" ] && [ "$start" != "$last" ]; then
      sleep 20
      tries=0
      while [ $tries -lt 60 ]; do
        if [ "$(idle_s)" -ge 4 ]; then
          printf '%s\n' apply "$BASE/modern-purple.js" - 1 0 > "$BASE/job.txt"
          open -g -W "$APP"
          if tail -1 "$BASE/apply.log" 2>/dev/null | grep -q 'applied$'; then last="$start"; break; fi
        fi
        tries=$((tries + 1))
        sleep 10
      done
      [ $tries -ge 60 ] && last="$start"
    fi
  fi
  sleep 30
done
