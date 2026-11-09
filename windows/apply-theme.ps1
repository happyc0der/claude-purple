# Applies theme\modern-purple.js to the Claude desktop app through its own DevTools.
# Needs Developer Mode (Help > Troubleshooting > Enable Developer Mode).
#
#   (no args)      apply once to the running app
#   -Check         read-only: report Developer Mode, the windows and idle time; sends no keys
#   -Watch         keep running; apply whenever Claude starts or looks grey again (logon task)
#   -AllowPasting  also type Chrome's "allow pasting" consent (needed once, on the first run)
#   -Payload <js> -ResultFile <path> [-ResultWait <s>]
#                  run another script instead and save what it copies to the clipboard
#                  (used for read-only diagnostics)
#   -KeepOpen      leave DevTools open and save a picture of it, for troubleshooting
#
# It never launches Claude. It waits until the keyboard and mouse have been idle for
# 4 seconds, only types into a window it has confirmed is Claude's own DevTools
# (title names claude.ai), restores the clipboard, and logs every run.
param([switch]$Check, [switch]$Watch, [switch]$AllowPasting, [switch]$KeepOpen, [string]$Payload, [string]$ResultFile, [int]$ResultWait = 0)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$payload = if ($Payload) { $Payload } else { Join-Path (Split-Path $here -Parent) 'theme\modern-purple.js' }
$log = Join-Path $here 'apply-theme.log'
$dataDir = Get-ChildItem "$env:LOCALAPPDATA\Claude-Data" -Directory -Filter "claude_*" -ErrorAction SilentlyContinue | Select-Object -First 1
$settings = if ($dataDir) { Join-Path $dataDir.FullName "developer_settings.json" } else { "" }

Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System; using System.Runtime.InteropServices; using System.Text;
public static class ThemeWin {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] public static extern uint GetLastInputInfo(ref LASTINPUT i);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct LASTINPUT { public uint cbSize; public uint dwTime; }
  public static uint IdleMs() { var i = new LASTINPUT(); i.cbSize = 8; GetLastInputInfo(ref i); return (uint)Environment.TickCount - i.dwTime; }
}
'@

function Write-Log($text) { "$(Get-Date -Format s) $text" | Add-Content $log; $text }

function Get-ClaudeWindows {
    $pids = @(Get-Process claude -ErrorAction SilentlyContinue | Where-Object { $_.Path -match 'WindowsApps\\Claude_' } | ForEach-Object Id)
    $found = New-Object System.Collections.ArrayList
    $cb = [ThemeWin+EnumProc]{
        param($h, $l)
        if ([ThemeWin]::IsWindowVisible($h)) {
            $owner = [uint32]0
            [void][ThemeWin]::GetWindowThreadProcessId($h, [ref]$owner)
            if ($pids -contains [int]$owner) {
                $sb = New-Object Text.StringBuilder 256
                [void][ThemeWin]::GetWindowText($h, $sb, 256)
                if ($sb.Length -gt 0) { [void]$found.Add([pscustomobject]@{ Handle = $h; Title = $sb.ToString() }) }
            }
        }
        $true
    }
    [void][ThemeWin]::EnumWindows($cb, [IntPtr]::Zero)
    $found
}

function Get-MainWindow { Get-ClaudeWindows | Where-Object { $_.Title -notmatch '^(Developer Tools|DevTools)' } | Select-Object -First 1 }
# Only Claude's own page: the title must name claude.ai, never another site's DevTools.
function Get-DevToolsWindow { Get-ClaudeWindows | Where-Object { $_.Title -match '^(Developer Tools|DevTools).*claude\.ai' } | Select-Object -First 1 }

# Saves a picture of one window only, never the rest of the screen.
function Save-WindowShot($handle, $path) {
    Add-Type -AssemblyName System.Drawing
    $r = New-Object ThemeWin+RECT
    [void][ThemeWin]::GetWindowRect($handle, [ref]$r)
    $bmp = New-Object System.Drawing.Bitmap ([Math]::Max(1, $r.Right - $r.Left)), ([Math]::Max(1, $r.Bottom - $r.Top))
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try { $g.CopyFromScreen($r.Left, $r.Top, 0, 0, $bmp.Size); $bmp.Save($path) } finally { $g.Dispose(); $bmp.Dispose() }
}

function Wait-For($test, [int]$seconds) {
    $end = (Get-Date).AddSeconds($seconds)
    while ((Get-Date) -lt $end) { $r = & $test; if ($r) { return $r }; Start-Sleep -Milliseconds 250 }
    $null
}

# A minimized Claude has no focused page, so the DevTools shortcut does nothing.
# Restore it for the few seconds this takes, then minimize it again.
function Invoke-Apply {
    $main = Get-MainWindow
    if (-not $main) { return Write-Log 'skip: Claude is not running' }
    if ([ThemeWin]::IdleMs() -lt 4000) { return Write-Log 'skip: keyboard or mouse in use' }
    $wasMinimized = [ThemeWin]::IsIconic($main.Handle)
    if ($wasMinimized) { [void][ThemeWin]::ShowWindow($main.Handle, 9); Start-Sleep -Milliseconds 1200 }
    try { Invoke-ApplyCore $main } finally { if ($wasMinimized) { [void][ThemeWin]::ShowWindow($main.Handle, 6) } }
}

function Invoke-ApplyCore($main) {

    $devtools = Get-DevToolsWindow
    if (-not $devtools) {
        [void][ThemeWin]::SetForegroundWindow($main.Handle)
        if (-not (Wait-For { [ThemeWin]::GetForegroundWindow() -eq $main.Handle } 3)) { return Write-Log 'stop: could not focus Claude' }
        [System.Windows.Forms.SendKeys]::SendWait('^%i')
        $devtools = Wait-For { Get-DevToolsWindow } 15
        if (-not $devtools) { return Write-Log 'stop: DevTools did not open (is Developer Mode on?)' }
    }

    [void][ThemeWin]::SetForegroundWindow($devtools.Handle)
    if (-not (Wait-For { [ThemeWin]::GetForegroundWindow() -eq $devtools.Handle } 3)) { return Write-Log 'stop: could not focus DevTools' }

    $saved = $null
    try { $saved = Get-Clipboard -Raw -ErrorAction SilentlyContinue } catch {}
    try {
        Set-Clipboard -Value (Get-Content $payload -Raw)
        # Open the Console through the command menu; Ctrl+Shift+J does not switch panels here.
        [System.Windows.Forms.SendKeys]::SendWait('^+p')
        Start-Sleep -Milliseconds 900
        [System.Windows.Forms.SendKeys]::SendWait('Show Console')
        Start-Sleep -Milliseconds 900
        [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
        Start-Sleep -Milliseconds 1500
        if ([ThemeWin]::GetForegroundWindow() -ne $devtools.Handle) { return Write-Log 'stop: focus moved before pasting' }
        [System.Windows.Forms.SendKeys]::SendWait('^v')
        Start-Sleep -Milliseconds 700
        if ($AllowPasting) {
            # The first paste is refused with a warning; typing this consent allows the next one.
            [System.Windows.Forms.SendKeys]::SendWait('^a{BACKSPACE}')
            [System.Windows.Forms.SendKeys]::SendWait('allow pasting{ENTER}')
            Start-Sleep -Milliseconds 700
            [System.Windows.Forms.SendKeys]::SendWait('^a{BACKSPACE}')
            if ([ThemeWin]::GetForegroundWindow() -ne $devtools.Handle) { return Write-Log 'stop: focus moved after consent' }
            [System.Windows.Forms.SendKeys]::SendWait('^v')
            Start-Sleep -Milliseconds 700
        }
        if ([ThemeWin]::GetForegroundWindow() -ne $devtools.Handle) { return Write-Log 'stop: focus moved before running' }
        [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
        Start-Sleep -Milliseconds 1200
        if ($ResultFile) { Start-Sleep -Seconds $ResultWait; Get-Clipboard -Raw | Set-Content $ResultFile -Encoding utf8 }
    } finally {
        if ($null -ne $saved) { Set-Clipboard -Value $saved } else { Set-Clipboard -Value $null }
    }
    if ($KeepOpen) {
        Save-WindowShot $devtools.Handle (Join-Path $here 'debug-devtools.png')
        return Write-Log 'kept DevTools open for inspection'
    }
    if ([ThemeWin]::GetForegroundWindow() -eq $devtools.Handle) { [System.Windows.Forms.SendKeys]::SendWait('%{F4}') }
    Start-Sleep -Milliseconds 800
    [void][ThemeWin]::SetForegroundWindow($main.Handle)
    Start-Sleep -Milliseconds 500
    $shot = Join-Path $here 'last-apply.png'
    try { Save-WindowShot $main.Handle $shot } catch { [void](Write-Log "screenshot failed: $_") }
    # Judge by the screen, not by having sent the keys: count purple-tinted points.
    $purple = 0; $total = 0
    try {
        $img = [System.Drawing.Bitmap]::FromFile($shot)
        foreach ($fx in 0.06, 0.12, 0.2, 0.3, 0.4, 0.5) { foreach ($fy in 0.5, 0.7, 0.9, 0.96) {
            $px = $img.GetPixel([int]($img.Width * $fx), [int]($img.Height * $fy)); $total++
            if (($px.B - $px.R) -ge 10) { $purple++ }
        } }
        $img.Dispose()
    } catch {}
    if ($total -gt 0 -and ($purple / $total) -lt 0.5) { return Write-Log "not applied: only $purple of $total sampled points are purple" }
    [void](Write-Log "verified: $purple of $total sampled points are purple")
    Write-Log 'applied'
}

# True when the visible Claude window looks grey again (for example after a page reload).
function Test-LooksGrey {
    $main = Get-MainWindow
    if (-not $main -or [ThemeWin]::GetForegroundWindow() -ne $main.Handle -or [ThemeWin]::IsIconic($main.Handle)) { return $false }
    $r = New-Object ThemeWin+RECT
    if (-not [ThemeWin]::GetWindowRect($main.Handle, [ref]$r)) { return $false }
    $w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
    if ($w -lt 400 -or $h -lt 300) { return $false }
    Add-Type -AssemblyName System.Drawing
    $grey = 0; $n = 0
    foreach ($fx in 0.05, 0.1, 0.4, 0.6) { foreach ($fy in 0.5, 0.8) {
        $bmp = New-Object System.Drawing.Bitmap 1, 1
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.CopyFromScreen($r.Left + [int]($w * $fx), $r.Top + [int]($h * $fy), 0, 0, (New-Object System.Drawing.Size 1, 1))
        $px = $bmp.GetPixel(0, 0); $g.Dispose(); $bmp.Dispose(); $n++
        if ($px.R -lt 70 -and ($px.B - $px.R) -lt 15) { $grey++ }   # dark and not clearly purple (grey, or Tokyo Night blue-grey)
    } }
    return ($grey -ge 6)
}

if ($Check) {
    $on = $false
    if ($settings -and (Test-Path $settings)) { $on = (Get-Content $settings -Raw | ConvertFrom-Json).allowDevTools -eq $true }
    "developer mode file: $on"
    "windows:"; Get-ClaudeWindows | ForEach-Object { "  $($_.Title)" }
    "idle ms: $([ThemeWin]::IdleMs())"
    "payload: $((Get-Item $payload).Length) bytes"
    "looks grey now: $(Test-LooksGrey)"
    return
}

if ($Watch) {
    $lastStart = $null
    while ($true) {
        $p = Get-Process claude -ErrorAction SilentlyContinue | Where-Object { $_.Path -match 'WindowsApps\\Claude_' } | Sort-Object StartTime | Select-Object -First 1
        if ($p -and $p.StartTime -eq $lastStart -and (Test-LooksGrey)) {
            [void](Write-Log 'app looks grey again (page reload?), reapplying')
            $lastStart = $null
        }
        if ($p -and $p.StartTime -ne $lastStart) {
            # Give the interface time to load, then keep trying until it isn't interrupted.
            Start-Sleep -Seconds 20
            # An unexpected error is logged and retried, never allowed to stop the watcher.
            try { $result = Invoke-Apply } catch { $result = Write-Log "error: $_" }
            if ($result -eq 'applied') { $lastStart = $p.StartTime }
        }
        Start-Sleep -Seconds 30
    }
}

Invoke-Apply
