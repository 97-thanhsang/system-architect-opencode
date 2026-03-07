# List all worktrees with enhanced UX
# File encoding: UTF-8 with BOM
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ErrorActionPreference = 'Stop'

$mainRepo = 'E:/SOURCE/system-architect-opencode'
$worktreeDir = 'E:/SOURCE/system-architect-opencode.worktree'

# Header
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                  Git Worktrees Overview" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Get worktrees
$worktrees = git worktree list
$worktreeCount = ($worktrees | Measure-Object).Count

Write-Host "Found $worktreeCount worktree(s)" -ForegroundColor Green
Write-Host ""

# Table header
$header = "{0,-30} {1,-20} {2,-12} {3,-40}" -f "Folder", "Branch", "Commit", "Description"
Write-Host $header -ForegroundColor Cyan
$separator = "{0,-30} {1,-20} {2,-12} {3,-40}" -f "------------------------------", "--------------------", "------------", "----------------------------------------"
Write-Host $separator -ForegroundColor Gray

foreach ($line in $worktrees) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $parts = $line -split '\s+', 4
    $path = $parts[0]
    $commitHash = if ($parts[1]) { $parts[1].Substring(0, 8) } else { 'N/A' }
    $branchInfo = if ($parts[2] -match '\[([^\]]+)\]') { $matches[1] } else { 'unknown' }
    $desc = if ($parts[3]) { $parts[3] } else { '' }

    # Format path
    $isMain = $path -eq $mainRepo
    if ($isMain) {
        $folderDisplay = "Main ($branchInfo)"
    } else {
        $suffix = Split-Path -Path $path -Leaf
        $icon = if ($branchInfo -match '^bug') { 'BUG' }
                elseif ($branchInfo -match '^feature') { 'FEAT' }
                elseif ($branchInfo -match '^fix') { 'FIX' }
                elseif ($branchInfo -match '^hotfix') { 'HOT' }
                else { 'OTHR' }
        $folderDisplay = "$icon $suffix"
    }

    # Color branch based on type
    $branchColor = if ($branchInfo -match '^dev') { 'Cyan' }
                    elseif ($branchInfo -match '^bug') { 'Red' }
                    elseif ($branchInfo -match '^feature') { 'Green' }
                    elseif ($branchInfo -match '^fix') { 'Yellow' }
                    elseif ($branchInfo -match '^hotfix') { 'Magenta' }
                    else { 'White' }

    # Format commit hash
    $commitDisplay = "$commitHash..."

    # Output row
    $row = "{0,-30} {1,-20} {2,-12} {3,-40}" -f $folderDisplay, $branchInfo, $commitDisplay, $desc
    Write-Host $row -ForegroundColor $branchColor
}

Write-Host $separator -ForegroundColor Gray

# # Additional info
# Write-Host ""
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host "                       Quick Actions" -ForegroundColor Cyan
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host ""

# # Get orphaned worktrees
# if (Test-Path $worktreeDir) {
#     $allFolders = Get-ChildItem -Path $worktreeDir -Directory -ErrorAction SilentlyContinue
#     $trackedPaths = $worktrees | ForEach-Object { ($_ -split '\s+')[0] }
#     $orphaned = $allFolders | Where-Object { $trackedPaths -notcontains $_.FullName }

#     if ($orphaned) {
#         Write-Host "WARNING: Found $($orphaned.Count) orphaned worktree(s):" -ForegroundColor Yellow
#         foreach ($orph in $orphaned) {
#             Write-Host "    REMOVED: $($orph.Name)" -ForegroundColor Yellow
#         }
#         Write-Host "    Run: Git Clean Orphaned Worktrees task" -ForegroundColor Gray
#         Write-Host ""
#     }
# }

# # Commands reference
# Write-Host "Available tasks:" -ForegroundColor White
# Write-Host ""
# Write-Host "  [+]  Create New Worktree          --> Add a new worktree" -ForegroundColor Green
# Write-Host "  [-]  Remove Worktree               --> Remove a specific worktree" -ForegroundColor Green
# Write-Host "  [x]  Cleanup Merged Worktrees     --> Remove all merged worktrees" -ForegroundColor Green
# Write-Host "  [x]  Clean Orphaned Worktrees     --> Remove orphaned (untracked) worktrees" -ForegroundColor Green
# Write-Host "  [=]  Update Workspace               --> Update VS Code workspace" -ForegroundColor Green
# Write-Host ""

# Stats
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host "                          Statistics" -ForegroundColor Cyan
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host ""

# Write-Host "Total worktrees:     $worktreeCount" -ForegroundColor White
# Write-Host "Main repo:         $mainRepo" -ForegroundColor White

# if (Test-Path $worktreeDir) {
#     $allFolders = Get-ChildItem -Path $worktreeDir -Directory -ErrorAction SilentlyContinue
#     Write-Host "Worktree directory: $worktreeDir" -ForegroundColor White
#     Write-Host "Folders in directory: $($allFolders.Count)" -ForegroundColor White
# }

# Write-Host ""
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host "                            Git Status" -ForegroundColor Cyan
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host ""

# $mainBranch = git branch --show-current
# Write-Host "Current branch: $mainBranch" -ForegroundColor White

# $mainStatus = git status --short --branch
# if ($mainStatus) {
#     $statusOutput = $mainStatus -join "`n"
#     Write-Host "`n$statusOutput" -ForegroundColor Gray
# } else {
#     Write-Host "  Working directory clean" -ForegroundColor Green
# }

# Write-Host ""
