# Update workspace file from git worktrees
$ErrorActionPreference = 'Stop'

$workspacePath = 'E:\SOURCE\ems-finance.code-workspace'
$mainRepo = 'E:/SOURCE/system-architect-opencode'

Write-Host 'Scanning worktrees...' -ForegroundColor Cyan
$worktrees = git worktree list
Write-Host "Found $($worktrees.Count) worktrees" -ForegroundColor Green

$folders = @()

foreach ($line in $worktrees) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $parts = $line -split '\s+', 4
    $path = $parts[0]
    $branch = if ($parts[2] -match '\[([^\]]+)\]') { $matches[1] } else { 'unknown' }

    $isMain = $path -eq $mainRepo

    if ($isMain) {
        $name = "Main ($branch)"
        $folderPath = 'ems.finance.fe'
    } else {
        $suffix = Split-Path -Path $path -Leaf

        # Extract issue ID (EMSPRO2-XXXX)
        $issueId = $suffix -replace '.*?(EMSPRO2-\d+).*', '$1'

        if ($issueId -eq $suffix) {
            $issueId = $branch -replace '^[a-z]+/', ''
        }

        # Icon based on branch type (using surrogate pairs for emoji)
        $icon = if ($branch -match '^bug') {
            "$([char]0xD83D)$([char]0xDC1B)"  # 🐛
        } elseif ($branch -match '^feature') {
            "$([char]0xE2)$([char]0x9C)$([char]0xA8)"  # ✨
        } elseif ($branch -match '^fix') {
            "$([char]0xF0)$([char]0x9F)$([char]0xA5)$([char]0xA7)"  # 🔧
        } elseif ($branch -match '^hotfix') {
            "$([char]0xF0)$([char]0x9F)$([char]0x9A)$([char]0xA8)"  # 🚨
        } else {
            "$([char]0xF0)$([char]0x9F)$([char]0x93)$([char]0xA6)"  # 📦
        }

        # Title case issue ID
        $issueIdTitle = if ($issueId -match '^(bug|feature|fix|hotfix)/(.*)') {
            "$($matches[1].ToUpper()) $($matches[2])"
        } else {
            $issueId
        }

        # Track branch name for display
        $trackBranch = "origin/devSang"
        if ($branch -match '^(bug|feature|fix|hotfix)/') {
            $trackBranch = "origin/devSang"
        }

        $name = "$icon $issueIdTitle ($trackBranch)"
        $folderPath = $path
    }

    $folders += @{
        name = $name
        path = $folderPath
    }

    Write-Host "  - $name" -ForegroundColor Gray
}

# Build folders JSON
$folderEntries = $folders | ForEach-Object {
    @"
    {
      "name": "$($_.name)",
      "path": "$($_.path)",
    }
"@
}
$folderJson = $folderEntries -join ",`n"

Write-Host "Reading workspace file..." -ForegroundColor Cyan

# Read workspace file
$workspaceContent = Get-Content -Path $workspacePath -Raw

# Simple replacement: replace from "folders": [ to closing ]
$pattern = '(?s)("folders":\s*\[)(.*?)(\],\s*//)'
$replacement = "`$1`n$folderJson,`n  `$3"

$newContent = $workspaceContent -replace $pattern, $replacement

if ($newContent -eq $workspaceContent) {
    Write-Host 'No changes detected in folders section' -ForegroundColor Yellow
} else {
    # Save with UTF-8 encoding with BOM for emoji support
    [System.IO.File]::WriteAllText($workspacePath, $newContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host 'Workspace file updated successfully!' -ForegroundColor Green
    Write-Host "File: $workspacePath" -ForegroundColor Gray
}

Write-Host "Reload VS Code workspace to see changes (Ctrl+Shift+P > 'Developer: Reload Window')" -ForegroundColor Cyan
