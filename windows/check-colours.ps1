# Compares the live Claude app's colours with the saved reference, part by part.
# Use it after an app update: it lists exactly which parts of the screen changed colour,
# so the theme can be fixed to bring back the old look.
#
#   (no args)  compare and list differences (read-only; runs theme\colour-roles.js in DevTools)
#   -Save      record the current look as the new reference (only once it looks right)
#
# Reference: colour-reference.json next to the theme file. Like apply-theme.ps1, it waits
# until you have stopped typing, and only types into Claude's own DevTools.
param([switch]$Save, [int]$Tries = 20)
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$theme = Join-Path (Split-Path $here) 'theme'
if (-not (Test-Path (Join-Path $theme 'colour-roles.js'))) { $theme = $here }   # flat install
$probe = Join-Path $theme 'colour-roles.js'
$refFile = Join-Path $theme 'colour-reference.json'
$now = Join-Path $env:TEMP 'claude-purple-colours-now.json'

Remove-Item $now -ErrorAction SilentlyContinue
for ($i = 0; $i -lt $Tries -and -not (Test-Path $now); $i++) {
    [void](& pwsh -NoProfile -File (Join-Path $here 'apply-theme.ps1') -Payload $probe -ResultFile $now -ResultWait 3 2>&1)
    if (-not (Test-Path $now)) { Start-Sleep -Seconds 5 }
}
if (-not (Test-Path $now)) { throw 'Could not read the colours (Claude busy, or the keyboard was never idle).' }
$live = Get-Content $now -Raw | ConvertFrom-Json

if ($Save) {
    Copy-Item $now $refFile -Force
    "Saved the current look as the reference ($($live.app)): $refFile"
    return
}
if (-not (Test-Path $refFile)) { throw "No reference yet. Run with -Save once the app looks right." }
$ref = Get-Content $refFile -Raw | ConvertFrom-Json

function ConvertTo-Rgba($s) {
    if ($s -match 'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?') {
        return @([double]$Matches[1], [double]$Matches[2], [double]$Matches[3], $(if ($Matches[4]) { [double]$Matches[4] } else { 1 }))
    }
    $null
}
function Test-Same($a, $b) {
    if ($a -eq $b) { return $true }
    $x = ConvertTo-Rgba $a; $y = ConvertTo-Rgba $b
    if (-not $x -or -not $y) { return $false }
    # Small differences (rounding, anti-aliasing) don't count.
    ([Math]::Abs($x[0] - $y[0]) + [Math]::Abs($x[1] - $y[1]) + [Math]::Abs($x[2] - $y[2])) -le 6 -and [Math]::Abs($x[3] - $y[3]) -le 0.05
}

$diffs = @()
foreach ($role in $ref.roles.PSObject.Properties) {
    $want = $role.Value; $got = $live.roles.($role.Name)
    if ($null -eq $want) { continue }
    if ($null -eq $got) { $diffs += [pscustomobject]@{ Part = $role.Name; What = 'element'; Before = 'found'; Now = 'not found (the app changed its layout)' }; continue }
    foreach ($k in 'color', 'background', 'weight', 'scrollbar') {
        $w = $want.$k; if ($null -eq $w) { continue }
        $g = $got.$k
        $same = if ($k -eq 'weight') { [Math]::Abs([double]$w - [double]$g) -lt 50 } else { Test-Same $w $g }
        if (-not $same) { $diffs += [pscustomobject]@{ Part = $role.Name; What = $k; Before = $w; Now = $g } }
    }
}
foreach ($v in $ref.vars.PSObject.Properties) {
    if ($live.vars.($v.Name) -ne $v.Value) { $diffs += [pscustomobject]@{ Part = 'theme value'; What = $v.Name; Before = $v.Value; Now = $live.vars.($v.Name) } }
}

"Reference: $($ref.app)   Now: $($live.app)"
if ($diffs) { "$($diffs.Count) difference(s):"; $diffs | Format-Table -AutoSize -Wrap | Out-String -Width 200 }
else { 'Every part matches the reference.' }
