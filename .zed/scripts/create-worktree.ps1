# Create new worktree with enhanced UX (Zed Edition - Interactive)
# File encoding: UTF-8 with BOM
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ErrorActionPreference = 'Stop'

$mainRepo = 'E:/SOURCE/system-architect-opencode'
$worktreeDir = 'E:/SOURCE/system-architect-opencode.worktree'
$defaultSourceBranch = 'origin/devSang'

# Header
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                  Create New Worktree" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Interactive prompts (since Zed doesn't support input variables)
Write-Host "Enter worktree details:" -ForegroundColor White
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

# Check if worktree folder already exists
$targetWorktreePath = Join-Path -Path $worktreeDir -ChildPath $worktreeName

if (Test-Path $targetWorktreePath) {
    Write-Host ""
    Write-Host "ERROR: Worktree folder already exists!" -ForegroundColor Red
    Write-Host "Path: $targetWorktreePath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please choose a different worktree name or remove the existing one." -ForegroundColor Gray
    exit 1
}

# Check if branch already exists
$existingBranches = git branch
$branchExists = $existingBranches | Where-Object { $_ -match [regex]::Escape($branchName) }

if ($branchExists) {
    Write-Host ""
    Write-Host "WARNING: Branch '$branchName' already exists!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Do you want to create worktree with existing branch? (y/N)" -ForegroundColor Cyan
    $response = Read-Host

    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
}

# Create worktree
Write-Host ""
Write-Host "Creating worktree..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor White
Write-Host "  Worktree name: $worktreeName" -ForegroundColor Gray
Write-Host "  Branch name:   $branchName" -ForegroundColor Gray
Write-Host "  Source branch: $defaultSourceBranch" -ForegroundColor Gray
Write-Host "  Target path:   $targetWorktreePath" -ForegroundColor Gray
Write-Host ""

# Suppress stderr for git worktree add
$ErrorActionPreference = 'Continue'
$result = git worktree add $targetWorktreePath -b $branchName $defaultSourceBranch 2>&1
$exitCode = $LASTEXITCODE
$ErrorActionPreference = 'Stop'

if ($exitCode -eq 0) {
    Write-Host "SUCCESS: Worktree created!" -ForegroundColor Green
    Write-Host ""

    # Get current commit of new branch
    $newCommit = git -C $targetWorktreePath log --oneline -1 2>$null

    Write-Host "Worktree Details:" -ForegroundColor White
    Write-Host "  Path:       $targetWorktreePath" -ForegroundColor Gray
    Write-Host "  Branch:     $branchName" -ForegroundColor Gray
    Write-Host "  Commit:     $newCommit" -ForegroundColor Gray
    Write-Host ""

    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Run: List All Worktrees to verify" -ForegroundColor White
    Write-Host "  2. Run: Update Workspace to sync Zed workspace" -ForegroundColor White
    Write-Host "  3. Reload Zed IDE" -ForegroundColor White
    Write-Host ""

} else {
    Write-Host "ERROR: Failed to create worktree!" -ForegroundColor Red
    Write-Host "Exit code: $exitCode" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Output:" -ForegroundColor Yellow
    Write-Host $result
    exit 1
}

Write-Host ""
