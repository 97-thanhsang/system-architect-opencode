# Clean orphaned worktrees
$worktreeDir = 'E:/SOURCE/system-architect-opencode.worktree'

if (-not (Test-Path $worktreeDir)) {
    Write-Host 'Worktree directory does not exist' -ForegroundColor Gray
    exit
}

Write-Host 'Scanning for orphaned worktrees...' -ForegroundColor Cyan

# Get all folders in worktree directory
$folders = Get-ChildItem -Path $worktreeDir -Directory

# Get tracked worktrees from git
$trackedWorktrees = git worktree list | ForEach-Object { ($_ -split '\s+')[0] }

$orphaned = @()

foreach ($folder in $folders) {
    $folderPath = $folder.FullName
    $isTracked = $trackedWorktrees | Where-Object { $_ -like "*$folderPath*" }

    if (-not $isTracked) {
        Write-Host "  Found orphaned: $($folder.Name)" -ForegroundColor Yellow
        $orphaned += $folder
    }
}

if ($orphaned.Count -eq 0) {
    Write-Host 'No orphaned worktrees found' -ForegroundColor Green
} else {
    Write-Host "Removing $($orphaned.Count) orphaned worktrees..." -ForegroundColor Yellow
    try {
        $orphaned | ForEach-Object {
            Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction Stop
            Write-Host "  Removed: $($_.Name)" -ForegroundColor Green
        }
        Write-Host 'Done!' -ForegroundColor Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host 'Some worktrees may still be in use (e.g., open in Zed)' -ForegroundColor Yellow
        Write-Host 'Close all Zed instances and try again' -ForegroundColor Gray
    }
}
