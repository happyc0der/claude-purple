# Claude Purple for Windows: turns on Claude's Developer Mode (after asking) and adds a
# per-user logon task that re-applies the colours whenever the Claude desktop app starts.
# Run from the repo:  pwsh -ExecutionPolicy Bypass -File windows\install.ps1
# Nothing here needs admin rights.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$apply = Join-Path $here 'apply-theme.ps1'

$dataDir = Get-ChildItem "$env:LOCALAPPDATA\Claude-Data" -Directory -Filter 'claude_*' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $dataDir) { throw 'Could not find the Claude desktop app data folder (%LOCALAPPDATA%\Claude-Data\claude_*). Is Claude installed and opened once?' }
$settings = Join-Path $dataDir.FullName 'developer_settings.json'

Write-Host @'
Claude Purple needs Claude's Developer Mode, which adds a Developer menu and DevTools.
DevTools can see your signed-in Claude session, so only use this on your own computer.
You can turn it on yourself instead: Help > Troubleshooting > Enable Developer Mode.
'@
$answer = Read-Host 'Turn on Developer Mode now? (y/N)'
if ($answer -match '^(y|yes)$') {
    $current = @{}
    if (Test-Path $settings) { (Get-Content $settings -Raw | ConvertFrom-Json).psobject.Properties | ForEach-Object { $current[$_.Name] = $_.Value } }
    $current.allowDevTools = $true
    $current | ConvertTo-Json | Set-Content $settings -Encoding utf8
    Write-Host "Developer Mode turned on in $settings"
}

$shell = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
if (-not $shell) { $shell = (Get-Command powershell).Source }
$action = New-ScheduledTaskAction -Execute $shell -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$apply`" -Watch"
$trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
$taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0 -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'Claude Purple' -Action $action -Trigger $trigger -Principal $principal -Settings $taskSettings -Force | Out-Null
Start-ScheduledTask -TaskName 'Claude Purple'

Write-Host @'
Installed the "Claude Purple" logon task. Restart the Claude desktop app once (fully quit it
from the tray), then leave the keyboard and mouse alone for a few seconds: a DevTools window
flashes up and the app turns purple. The first run may need "allow pasting":
  pwsh -File windows\apply-theme.ps1 -AllowPasting
Log: windows\apply-theme.log
'@
