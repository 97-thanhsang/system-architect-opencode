# Remove worktree with enhanced UX (Zed Edition - Interactive)
# File encoding: UTF-8 with BOM
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ErrorActionPreference = 'Stop'

$mainRepo = 'E:/SOURCE/system-architect-opencode'
$worktreeDir = 'E:/SOURCE/system-architect-opencode.worktree'

# Header
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                  Remove Worktree" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Interactive prompts
Write-Host "Enter worktree details to remove:" -ForegroundColor White
Write-Host ""

$worktreeName = Read-Host "Worktree folder name (e.g., bug-emspro2-7327)"
$branchName = Read-Host "Branch name (e.g., bug/emspro2-7327)"

# Validation
if ([string]::IsNullOrWhiteSpace($worktreeName)) {
    Write-Host "ERROR: Worktree name is required" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrWhiteSpace($branchName)) {
    Write-Host "ERROR: Branch name is required" -ForegroundColor Red
    exit 1
}

# Check if worktree folder exists
$targetWorktreePath = Join-Path -Path $worktreeDir -ChildPath $worktreeName

Write-Host ""
Write-Host "Validating inputs..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration:" -ForegroundColor White
Write-Host "  Worktree name: $worktreeName" -ForegroundColor Gray
Write-Host "  Branch name:   $branchName" -ForegroundColor Gray
Write-Host "  Target path:   $targetWorktreePath" -ForegroundColor Gray
Write-Host ""

# Check worktree folder exists
$worktreeFolderExists = Test-Path $targetWorktreePath

if ($worktreeFolderExists) {
    Write-Host "Worktree folder found!" -ForegroundColor Green
} else {
    Write-Host "Worktree folder NOT found!" -ForegroundColor Yellow
}

# Get current worktrees from git
Write-Host "Checking worktree status..." -ForegroundColor Cyan
$worktrees = git worktree list
$trackedPaths = $worktrees | ForEach-Object { ($_ -split '\s+')[0] }
$isTracked = $trackedPaths | Where-Object { $_ -like "*$targetWorktreePath*" }

if ($isTracked) {
    Write-Host "Worktree is tracked by git." -ForegroundColor Green
} else {
    Write-Host "Worktree is NOT tracked by git (orphaned)." -ForegroundColor Yellow
}
Write-Host ""

# Check if branch exists
$branches = git branch
$branchExists = $branches | Where-Object { $_ -match [regex]::Escape($branchName) }

if ($branchExists) {
    Write-Host "Branch '$branchName' found in local repository." -ForegroundColor Yellow
} else {
    Write-Host "Branch '$branchName' NOT found in local repository." -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                        Summary" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Worktree folder:     $(if ($worktreeFolderExists) { 'EXISTS' } else { 'NOT FOUND' })" -ForegroundColor White
Write-Host "Git tracked:          $(if ($isTracked) { 'YES' } else { 'NO (orphaned)' })" -ForegroundColor White
Write-Host "Branch exists:        $(if ($branchExists) { 'YES' } else { 'NO' })" -ForegroundColor White
Write-Host ""

# Confirmation
if ($isTracked -and $branchExists) {
    Write-Host "Action plan:" -ForegroundColor Yellow
    Write-Host "  1. Remove worktree via 'git worktree remove'" -ForegroundColor White
    Write-Host "  2. Delete local branch via 'git branch -d'" -ForegroundColor White
} elseif (-not $isTracked -and $worktreeFolderExists) {
    Write-Host "Action plan:" -ForegroundColor Yellow
    Write-Host "  1. Remove orphaned folder manually" -ForegroundColor White
    Write-Host "  2. Delete local branch (if exists)" -ForegroundColor White
} elseif ($isTracked -and -not $branchExists) {
    Write-Host "Action plan:" -ForegroundColor Yellow
    Write-Host "  1. Remove worktree via 'git worktree remove'" -ForegroundColor White
    Write-Host "  2. Skip branch deletion (branch does not exist)" -ForegroundColor Gray
} else {
    Write-Host "WARNING: Nothing to remove!" -ForegroundColor Yellow
    Write-Host "  Worktree folder does not exist" -ForegroundColor Gray
    Write-Host "  Worktree is not tracked" -ForegroundColor Gray
    Write-Host "  Branch does not exist" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Confirm removal? (y/N)" -ForegroundColor Cyan
$confirm = Read-Host

if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host ""
    Write-Host "Cancelled." -ForegroundColor Gray
    exit 0
}

# Execute removal
Write-Host ""
Write-Host "Executing removal..." -ForegroundColor Cyan
Write-Host ""

$worktreeRemoved = $false
$branchRemoved = $false

# Remove worktree
if ($isTracked) {
    Write-Host "Removing worktree via git..." -ForegroundColor Gray
    $result = git worktree remove $targetWorktreePath 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Worktree removed!" -ForegroundColor Green
        $worktreeRemoved = $true
    } else {
        Write-Host "ERROR: Failed to remove worktree!" -ForegroundColor Red
        Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Output:" -ForegroundColor Yellow
        Write-Host $result
        exit 1
    }
} elseif ($worktreeFolderExists) {
    Write-Host "Removing orphaned folder..." -ForegroundColor Gray
    try {
        Remove-Item -Path $targetWorktreePath -Recurse -Force -ErrorAction Stop
        Write-Host "SUCCESS: Orphaned folder removed!" -ForegroundColor Green
        $worktreeRemoved = $true
    } catch {
        Write-Host "ERROR: Failed to remove folder!" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
        exit 1
    }
}

# Remove branch (if exists and worktree was removed)
if ($branchExists -and $worktreeRemoved) {
    Write-Host "Deleting local branch..." -ForegroundColor Gray
    $result = git branch -d $branchName 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Branch deleted!" -ForegroundColor Green
        $branchRemoved = $true
    } else {
        Write-Host "WARNING: Failed to delete branch" -ForegroundColor Yellow
        Write-Host "Reason: Branch may not be fully merged" -ForegroundColor Gray
        Write-Host "Solution: Use 'git branch -D $branchName' to force delete" -ForegroundColor Gray
        $branchRemoved = $false
    }
}

# Results
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                         Results" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Worktree removed:  $(if ($worktreeRemoved) { 'YES' } else { 'NO' })" -ForegroundColor $(if ($worktreeRemoved) { 'Green' } else { 'Red' })
Write-Host "Branch deleted:     $(if ($branchRemoved) { 'YES' } else { 'N/A' })" -ForegroundColor $(if ($branchRemoved -or (-not $branchExists)) { 'Green' } else { 'Yellow' })
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Run: List All Worktrees to verify" -ForegroundColor White
Write-Host "  2. Run: Update Workspace to sync Zed workspace" -ForegroundColor White
Write-Host "  3. Reload Zed IDE" -ForegroundColor White
Write-Host ""
