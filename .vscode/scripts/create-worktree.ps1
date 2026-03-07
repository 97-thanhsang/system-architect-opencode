# Create new worktree with enhanced UX
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

# Parameters from tasks.json
$worktreeName = $args[0]  # First argument: worktree folder name
$branchName = $args[1]    # Second argument: branch name

# Validation
if ([string]::IsNullOrWhiteSpace($worktreeName)) {
    Write-Host "ERROR: Worktree name is required" -ForegroundColor Red
    Write-Host "Usage: create-worktree.ps1 <worktreeName> <branchName>" -ForegroundColor Gray
    Write-Host "Example: create-worktree.ps1 bug-emspro2-7327 bug/emspro2-7327" -ForegroundColor Gray
    exit 1
}

if ([string]::IsNullOrWhiteSpace($branchName)) {
    Write-Host "ERROR: Branch name is required" -ForegroundColor Red
    Write-Host "Usage: create-worktree.ps1 <worktreeName> <branchName>" -ForegroundColor Gray
    Write-Host "Example: create-worktree.ps1 bug-emspro2-7327 bug/emspro2-7327" -ForegroundColor Gray
    exit 1
}

# Check if worktree folder already exists
$targetWorktreePath = Join-Path -Path $worktreeDir -ChildPath $worktreeName

if (Test-Path $targetWorktreePath) {
    Write-Host "ERROR: Worktree folder already exists!" -ForegroundColor Red
    Write-Host "Path: $targetWorktreePath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please choose a different worktree name or remove the existing one." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Run: Git: List All Worktrees to see current worktrees" -ForegroundColor Cyan
    Write-Host "Run: Git: Remove Worktree to remove existing worktree" -ForegroundColor Cyan
    exit 1
}

# Check if branch already exists
$existingBranches = git branch
$branchExists = $existingBranches | Where-Object { $_ -match [regex]::Escape($branchName) }

if ($branchExists) {
    Write-Host "WARNING: Branch '$branchName' already exists!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  1. Switch to existing branch: git checkout $branchName" -ForegroundColor Green
    Write-Host "  2. Delete existing branch first: git branch -D $branchName" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Do you want to create worktree with existing branch? (y/N)" -ForegroundColor Cyan
    $response = Read-Host

    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
}

# Create worktree
Write-Host "Creating worktree..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor White
Write-Host "  Worktree name: $worktreeName" -ForegroundColor Gray
Write-Host "  Branch name:   $branchName" -ForegroundColor Gray
Write-Host "  Source branch: $defaultSourceBranch" -ForegroundColor Gray
Write-Host "  Target path:   $targetWorktreePath" -ForegroundColor Gray
Write-Host ""

# Suppress stderr for git worktree add (to avoid catching "Preparing worktree" message as error)
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

    # Extract branch type for icon
    $icon = if ($branchName -match '^bug') { '[BUG]' }
            elseif ($branchName -match '^feature') { '[FEAT]' }
            elseif ($branchName -match '^fix') { '[FIX]' }
            elseif ($branchName -match '^hotfix') { '[HOT]' }
            else { '[OTHR]' }

    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Run: Git: List All Worktrees" -ForegroundColor White
    Write-Host "     --> Verify worktree was created" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Run: Git: Update Workspace" -ForegroundColor White
    Write-Host "     --> Update VS Code workspace to include new worktree" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Reload VS Code" -ForegroundColor White
    Write-Host "     --> Press: Ctrl+Shift+P > Developer: Reload Window" -ForegroundColor Gray
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
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                         Done" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
