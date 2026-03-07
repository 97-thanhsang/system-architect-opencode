# Zed IDE Scripts for Git Worktree Management

> Created: 2026-02-12
> Purpose: PowerShell scripts for managing git worktrees in Zed IDE

## 📁 Scripts Overview

| Script                         | Description                                  | Interactive? |
| ------------------------------ | -------------------------------------------- | ------------ |
| `list-worktrees.ps1`           | List all git worktrees with status           | No           |
| `create-worktree.ps1`          | Create new worktree (prompts for input)      | **Yes**      |
| `remove-worktree.ps1`          | Remove existing worktree (prompts for input) | **Yes**      |
| `cleanup-merged-worktrees.ps1` | Remove all merged worktrees                  | No           |
| `clean-orphaned-worktrees.ps1` | Remove orphaned worktree folders             | No           |
| `update-workspace.ps1`         | Update Zed workspace file with all worktrees | No           |

## 🎯 Key Differences from VSCode Scripts

### 1. **Interactive Prompts**

**VSCode Version** (uses input variables):

```powershell
# Receives parameters from tasks.json
$worktreeName = $args[0]  # From ${input:worktreeName}
$branchName = $args[1]    # From ${input:branchName}
```

**Zed Version** (prompts user directly):

```powershell
# Interactive prompts in script
$worktreeName = Read-Host "Worktree folder name (e.g., bug-emspro2-7327)"
$branchName = Read-Host "Branch name (e.g., bug/emspro2-7327)"
```

### 2. **Workspace File Format**

**VSCode**: `.code-workspace` (JSON with comments, custom format)
**Zed**: `.zed-workspace.json` (pure JSON, simpler format)

```json
{
    "folders": [{ "path": "ems.finance.fe" }, { "path": "E:/SOURCE/system-architect-opencode.worktree/bug-123" }]
}
```

## 🚀 Usage

### List All Worktrees

```bash
powershell -ExecutionPolicy Bypass -File .zed/scripts/list-worktrees.ps1
```

**Output**:

```
=====================================================================
                  Git Worktrees Overview
=====================================================================

Found 3 worktree(s)

Folder                         Branch               Commit       Description
------------------------------ -------------------- ------------ ----------------------------------------
Main (devSang)                 devSang              a1b2c3d4...
FEAT bug-emspro2-7327          bug/emspro2-7327     e5f6g7h8...
BUG feature-emspro2-7328       feature/emspro2-7328 i9j0k1l2...
```

### Create New Worktree

```bash
powershell -ExecutionPolicy Bypass -File .zed/scripts/create-worktree.ps1
```

**Interactive prompts**:

```
Enter worktree details:

Worktree folder name (e.g., bug-emspro2-7327): feature-emspro2-7400
Branch name (e.g., bug/emspro2-7327): feature/emspro2-7400

Creating worktree...

Configuration:
  Worktree name: feature-emspro2-7400
  Branch name:   feature/emspro2-7400
  Source branch: origin/devSang
  Target path:   E:/SOURCE/system-architect-opencode.worktree/feature-emspro2-7400

SUCCESS: Worktree created!
```

### Remove Worktree

```bash
powershell -ExecutionPolicy Bypass -File .zed/scripts/remove-worktree.ps1
```

**Interactive prompts**:

```
Enter worktree details to remove:

Worktree folder name (e.g., bug-emspro2-7327): feature-emspro2-7400
Branch name (e.g., bug/emspro2-7327): feature/emspro2-7400

Validating inputs...

Configuration:
  Worktree name: feature-emspro2-7400
  Branch name:   feature/emspro2-7400
  Target path:   E:/SOURCE/system-architect-opencode.worktree/feature-emspro2-7400

Worktree folder found!
Checking worktree status...
Worktree is tracked by git.

Branch 'feature/emspro2-7400' found in local repository.

=====================================================================
                        Summary
=====================================================================

Worktree folder:     EXISTS
Git tracked:          YES
Branch exists:        YES
Branch type:          feature

Action plan:
  1. Remove worktree via 'git worktree remove'
  2. Delete local branch via 'git branch -d'

Confirm removal? (y/N): y

Executing removal...

Removing worktree via git...
SUCCESS: Worktree removed!
Deleting local branch...
SUCCESS: Branch deleted!
```

### Cleanup Merged Worktrees

```bash
powershell -ExecutionPolicy Bypass -File .zed/scripts/cleanup-merged-worktrees.ps1
```

### Clean Orphaned Worktrees

```bash
powershell -ExecutionPolicy Bypass -File .zed/scripts/clean-orphaned-worktrees.ps1
```

### Update Zed Workspace

```bash
powershell -ExecutionPolicy Bypass -File .zed/scripts/update-workspace.ps1
```

## ⚙️ Configuration

All scripts use these default paths:

```powershell
$mainRepo = 'E:/SOURCE/system-architect-opencode'
$worktreeDir = 'E:/SOURCE/system-architect-opencode.worktree'
$defaultSourceBranch = 'origin/devSang'
$workspacePath = 'E:\SOURCE\ems-finance.zed-workspace.json'
```

**To customize**: Edit the variables at the top of each script.

## 🔧 Troubleshooting

### Issue: "Execution Policy Error"

```
File cannot be loaded because running scripts is disabled on this system
```

**Solution**: Run with `-ExecutionPolicy Bypass`:

```bash
powershell -ExecutionPolicy Bypass -File .zed/scripts/script-name.ps1
```

### Issue: "Worktree folder locked"

```
ERROR: Failed to remove folder!
Possible cause: Folder is being used by another process
```

**Solution**: Close all Zed IDE instances and try again.

### Issue: "Branch not deleted (not fully merged)"

```
WARNING: Failed to delete branch
Reason: Branch may not be fully merged
```

**Solution**: Force delete with `git branch -D <branch-name>`

## 📝 Maintenance

### Adding New Scripts

1. Create script in `.zed/scripts/`
2. Add task definition in `.zed/tasks.json`
3. Update this README with usage instructions
4. Test script in Zed IDE

### Testing Scripts

```bash
# Test individually
powershell -ExecutionPolicy Bypass -File .zed/scripts/script-name.ps1

# Test via Zed tasks
# Cmd+Shift+P → "Tasks: Run Task" → Select task
```

## 🎨 Script Conventions

-   **UTF-8 BOM**: All scripts use UTF-8 with BOM for emoji support
-   **Color Coding**:
    -   🟦 Cyan: Headers and sections
    -   🟩 Green: Success messages
    -   🟨 Yellow: Warnings
    -   🟥 Red: Errors
    -   ⬜ Gray: Information
-   **Error Handling**: `$ErrorActionPreference = 'Stop'`
-   **Interactive**: Scripts prompt user when input needed (no VSCode input variables)

## 🔗 Integration with Zed

Scripts are called from `.zed/tasks.json`:

```json
{
    "label": "➕ Git: Create New Worktree",
    "type": "shell",
    "command": "powershell -ExecutionPolicy Bypass -File ${workspaceFolder}/.zed/scripts/create-worktree.ps1",
    "options": {
        "cwd": "E:/SOURCE/system-architect-opencode"
    }
}
```

## 📊 Statistics

-   **Total Scripts**: 6
-   **Interactive Scripts**: 2 (create, remove)
-   **Automated Scripts**: 4 (list, cleanup, clean-orphaned, update-workspace)
-   **Total Lines**: ~600 LOC

---

Happy coding with Zed IDE! 🚀
