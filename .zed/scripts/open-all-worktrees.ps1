# Open all git worktrees in separate Zed windows
# Note: Zed does NOT support VSCode-style workspace files
# This script opens each worktree in a separate window

$ErrorActionPreference = 'Stop'

$mainRepo = 'E:/SOURCE/system-architect-opencode'

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "          Open All Worktrees in Zed (Multiple Windows)" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if zed command exists
$zedExists = Get-Command zed -ErrorAction SilentlyContinue

if (-not $zedExists) {
    Write-Host "ERROR: 'zed' command not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure Zed CLI is installed:" -ForegroundColor Yellow
    Write-Host "  1. Open Zed" -ForegroundColor Gray
    Write-Host "  2. Cmd+Shift+P → 'Install CLI'" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "Scanning worktrees..." -ForegroundColor Cyan
$worktrees = git worktree list
$worktreeCount = ($worktrees | Measure-Object).Count

Write-Host "Found $worktreeCount worktree(s)" -ForegroundColor Green
Write-Host ""

$openedCount = 0

foreach ($line in $worktrees) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $parts = $line -split '\s+', 4
    $path = $parts[0]
    $branchInfo = if ($parts[2] -match '\[([^\]]+)\]') { $matches[1] } else { 'unknown' }

    $isMain = $path -eq $mainRepo
    $displayName = if ($isMain) { "Main ($branchInfo)" } else { Split-Path -Path $path -Leaf }

    Write-Host "Opening: $displayName" -ForegroundColor White
    Write-Host "  Path: $path" -ForegroundColor Gray

    # Open in Zed
    Start-Process zed $path
    $openedCount++

    # Wait a bit to avoid overwhelming system
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                           Done!" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opened $openedCount Zed windows" -ForegroundColor Green
Write-Host ""

Write-Host "Tips:" -ForegroundColor Cyan
Write-Host "  - Switch windows: Cmd+Tab (Mac) or Alt+Tab (Windows)" -ForegroundColor White
Write-Host "  - Each worktree has its own window" -ForegroundColor White
Write-Host "  - Use tasks in each window independently" -ForegroundColor White
Write-Host ""

Write-Host "Note:" -ForegroundColor Yellow
Write-Host "  Zed does NOT support VSCode-style workspace files." -ForegroundColor Gray
Write-Host "  This is the recommended workflow for multiple worktrees in Zed." -ForegroundColor Gray
Write-Host ""
