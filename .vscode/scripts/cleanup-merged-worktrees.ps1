# Cleanup merged worktrees
$ErrorActionPreference = 'Stop'
$mainRepo = 'E:/SOURCE/system-architect-opencode'
$targetBranch = 'feature/learning-outcomes'

Write-Host 'Scanning worktrees...' -ForegroundColor Cyan

# Get all worktrees
$worktrees = git worktree list

foreach ($line in $worktrees) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $parts = $line -split '\s+', 4
    $path = $parts[0]
    $isMain = $path -eq $mainRepo

    if ($isMain) {
        Write-Host "  Skipped: $path (main repo)" -ForegroundColor Gray
        continue
    }

    Write-Host "Checking: $path" -ForegroundColor White

    # Get current branch in worktree
    $branch = git -C $path branch --show-current 2>$null

    if (-not $branch) {
        Write-Host "  Skipped: $path (no branch found)" -ForegroundColor Gray
        continue
    }

    # Check if branch is merged
    $mergedBranches = git branch --merged $targetBranch
    $isMerged = $mergedBranches | Where-Object { $_ -match [regex]::Escape($branch) }

    if ($isMerged) {
        Write-Host "  Removing: $path (branch: $branch)" -ForegroundColor Yellow

        # Remove worktree
        git worktree remove $path 2>$null

        # Try to delete local branch
        if ($LASTEXITCODE -eq 0) {
            git branch -d $branch 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    Worktree and branch removed successfully!" -ForegroundColor Green
            } else {
                Write-Host "    Worktree removed, but branch not deleted (may not be fully merged)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  Failed to remove worktree!" -ForegroundColor Red
        }
    } else {
        Write-Host "  Skipped: $path (branch not merged)" -ForegroundColor Gray
    }
}

Write-Host ''
Write-Host 'Done!' -ForegroundColor Green
