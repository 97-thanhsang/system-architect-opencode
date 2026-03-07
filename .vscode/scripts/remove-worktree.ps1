# Remove worktree with enhanced UX
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

# Parameters from tasks.json
$worktreeName = $args[0]  # First argument: worktree folder name
$branchName = $args[1]  # Second argument: branch name

# Validation
if ([string]::IsNullOrWhiteSpace($worktreeName)) {
    Write-Host "ERROR: Worktree name is required" -ForegroundColor Red
    Write-Host "Usage: remove-worktree.ps1 <worktreeName> <branchName>" -ForegroundColor Gray
    Write-Host "Example: remove-worktree.ps1 bug-emspro2-7327 bug/emspro2-7327" -ForegroundColor Gray
    exit 1
}

if ([string]::IsNullOrWhiteSpace($branchName)) {
    Write-Host "ERROR: Branch name is required" -ForegroundColor Red
    Write-Host "Usage: remove-worktree.ps1 <worktreeName> <branchName>" -ForegroundColor Gray
    Write-Host "Example: remove-worktree.ps1 bug-emspro2-7327 bug/emspro2-7327" -ForegroundColor Gray
    exit 1
}

# Check if worktree folder exists
$targetWorktreePath = Join-Path -Path $worktreeDir -ChildPath $worktreeName

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
    Write-Host "Path: $targetWorktreePath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Do you want to proceed anyway? (y/N)" -ForegroundColor Cyan
    $response = Read-Host

    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host ""
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
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

# Get branch info for display
$branchType = if ($branchName -match '^bug') { 'bug' }
            elseif ($branchName -match '^feature') { 'feature' }
            elseif ($branchName -match '^fix') { 'fix' }
            elseif ($branchName -match '^hotfix') { 'hotfix' }
            else { 'other' }

$branchIcon = if ($branchName -match '^bug') { '[BUG]' }
             elseif ($branchName -match '^feature') { '[FEAT]' }
             elseif ($branchName -match '^fix') { '[FIX]' }
             elseif ($branchName -match '^hotfix') { '[HOT]' }
             else { '[OTHR]' }

# Summary
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                        Summary" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Worktree folder:     $(if ($worktreeFolderExists) { 'EXISTS' } else { 'NOT FOUND' })" -ForegroundColor White
Write-Host "Git tracked:          $(if ($isTracked) { 'YES' } else { 'NO (orphaned)' })" -ForegroundColor White
Write-Host "Branch exists:        $(if ($branchExists) { 'YES' } else { 'NO' })" -ForegroundColor White
Write-Host "Branch type:          $branchType" -ForegroundColor White
Write-Host ""

# Confirmation
if ($isTracked -and $branchExists) {
    Write-Host "Action plan:" -ForegroundColor Yellow
    Write-Host "  1. Remove worktree via 'git worktree remove'" -ForegroundColor White
    Write-Host "  2. Delete local branch via 'git branch -d'" -ForegroundColor White
    Write-Host ""
    Write-Host "Confirm removal? (y/N)" -ForegroundColor Cyan
    $confirm = Read-Host

    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host ""
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }

} elseif (-not $isTracked -and $worktreeFolderExists) {
    Write-Host "Action plan:" -ForegroundColor Yellow
    Write-Host "  1. Remove orphaned folder manually" -ForegroundColor White
    Write-Host "  2. Delete local branch (if exists)" -ForegroundColor White
    Write-Host ""
    Write-Host "Confirm removal? (y/N)" -ForegroundColor Cyan
    $confirm = Read-Host

    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host ""
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
} elseif ($isTracked -and -not $branchExists) {
    Write-Host "Action plan:" -ForegroundColor Yellow
    Write-Host "  1. Remove worktree via 'git worktree remove'" -ForegroundColor White
    Write-Host "  2. Skip branch deletion (branch does not exist)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Confirm worktree removal only? (y/N)" -ForegroundColor Cyan
    $confirm = Read-Host

    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host ""
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
} else {
    Write-Host "WARNING: Nothing to remove!" -ForegroundColor Yellow
    Write-Host "  Worktree folder does not exist" -ForegroundColor Gray
    Write-Host "  Worktree is not tracked" -ForegroundColor Gray
    Write-Host "  Branch does not exist" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# Execute removal
Write-Host ""
Write-Host "Executing removal..." -ForegroundColor Cyan
Write-Host ""

$worktreeRemoved = $false
$branchRemoved = $false


$result = git worktree remove $targetWorktreePath 2>&1
$result = git branch -d $branchName 2>&1

# # Remove worktree
# if ($isTracked) {
#     Write-Host "Removing worktree via git..." -ForegroundColor Gray
#     $result = git worktree remove $targetWorktreePath 2>&1

#     if ($LASTEXITCODE -eq 0) {
#         Write-Host "SUCCESS: Worktree removed!" -ForegroundColor Green
#         $worktreeRemoved = $true
#     } else {
#         Write-Host "ERROR: Failed to remove worktree!" -ForegroundColor Red
#         Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Yellow
#         Write-Host ""
#         Write-Host "Output:" -ForegroundColor Yellow
#         Write-Host $result
#         exit 1
#     }
# } elseif ($worktreeFolderExists) {
#     Write-Host "Removing orphaned folder..." -ForegroundColor Gray
#     try {
#         Remove-Item -Path $targetWorktreePath -Recurse -Force -ErrorAction Stop
#         Write-Host "SUCCESS: Orphaned folder removed!" -ForegroundColor Green
#         $worktreeRemoved = $true
#     } catch {
#         Write-Host "ERROR: Failed to remove folder!" -ForegroundColor Red
#         Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
#         Write-Host ""
#         Write-Host "Possible cause: Folder is being used by another process" -ForegroundColor Yellow
#         Write-Host "Solution: Close all VS Code instances and try again" -ForegroundColor Gray
#         exit 1
#     }
# }

# # Remove branch (if exists and worktree was removed)
# if ($branchExists -and $worktreeRemoved) {
#     Write-Host "Deleting local branch..." -ForegroundColor Gray
#     $result = git branch -d $branchName 2>&1

#     if ($LASTEXITCODE -eq 0) {
#         Write-Host "SUCCESS: Branch deleted!" -ForegroundColor Green
#         $branchRemoved = $true
#     } else {
#         Write-Host "WARNING: Failed to delete branch" -ForegroundColor Yellow
#         Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Yellow
#         Write-Host "Reason: Branch may not be fully merged" -ForegroundColor Gray
#         Write-Host "Solution: Use 'git branch -D $branchName' to force delete" -ForegroundColor Gray
#         $branchRemoved = $false
#     }
# }

# # Results
# Write-Host ""
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host "                         Results" -ForegroundColor Cyan
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host ""

# Write-Host "Worktree removed:  $(if ($worktreeRemoved) { 'YES' } else { 'NO' })" -ForegroundColor $(if ($worktreeRemoved) { 'Green' } else { 'Red' })
# Write-Host "Branch deleted:     $(if ($branchRemoved) { 'YES' } else { 'N/A' })" -ForegroundColor $(if ($branchRemoved -or (-not $branchExists)) { 'Green' } else { 'Yellow' })
# Write-Host ""

# # Next steps
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host "                        Next Steps" -ForegroundColor Cyan
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host ""

# Write-Host "  1. Run: Git: List All Worktrees" -ForegroundColor White
# Write-Host "       --> Verify worktree was removed" -ForegroundColor Gray
# Write-Host ""
# Write-Host "  2. Run: Git: Update Workspace" -ForegroundColor White
# Write-Host "       --> Update VS Code workspace" -ForegroundColor Gray
# Write-Host ""
# Write-Host "  3. Reload VS Code" -ForegroundColor White
# Write-Host "       --> Press: Ctrl+Shift+P > Developer: Reload Window" -ForegroundColor Gray
# Write-Host ""

# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host "                            Done" -ForegroundColor Cyan
# Write-Host "=====================================================================" -ForegroundColor Cyan
# Write-Host ""
