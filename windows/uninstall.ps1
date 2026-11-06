# Removes Claude Purple on Windows: deletes the logon task and turns Developer Mode back off.
# Restart the Claude desktop app afterwards to drop the colours.
$task = Get-ScheduledTask -TaskName 'Claude Purple' -ErrorAction SilentlyContinue
if ($task) { Stop-ScheduledTask -TaskName 'Claude Purple' -ErrorAction SilentlyContinue; Unregister-ScheduledTask -TaskName 'Claude Purple' -Confirm:$false; 'Removed the "Claude Purple" task.' }
Get-CimInstance Win32_Process -Filter "Name='pwsh.exe' OR Name='powershell.exe'" | Where-Object { $_.CommandLine -match 'apply-theme\.ps1.*-Watch' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
$dataDir = Get-ChildItem "$env:LOCALAPPDATA\Claude-Data" -Directory -Filter 'claude_*' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($dataDir) {
    $settings = Join-Path $dataDir.FullName 'developer_settings.json'
    if (Test-Path $settings) {
        $s = Get-Content $settings -Raw | ConvertFrom-Json
        $s.allowDevTools = $false
        $s | ConvertTo-Json | Set-Content $settings -Encoding utf8
        'Developer Mode turned off.'
    }
}
'Done. Restart the Claude desktop app.'
