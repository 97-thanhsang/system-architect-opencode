# VS Code Scripts

Scripts quản lý worktree và workspace cho VS Code.

## Cấu Trúc

```
.vscode/
├── scripts/
│   ├── list-worktrees.ps1             # Liệt kê worktrees với UX đẹp
│   ├── create-worktree.ps1           # Tạo worktree mới với UX nâng cấp
│   ├── update-workspace.ps1            # Cập nhật workspace từ git worktrees
│   ├── clean-orphaned-worktrees.ps1   # Clean các worktree orphaned
│   ├── cleanup-merged-worktrees.ps1    # Clean các worktree đã merged
│   └── README.md                     # File này
└── tasks.json                          # VS Code tasks (tham chiếu đến scripts)
```

## Scripts

### 1. update-workspace.ps1

**Mục đích**: Tự động cập nhật file `E:\SOURCE\ems-finance.code-workspace` dựa trên danh sách worktrees hiện tại.

**Cách dùng**: Chạy task **"📝 Workspace: Update from Worktrees"** trong VS Code.

**Chức năng**:

-   Quét tất cả worktrees từ `git worktree list`
-   Tự động detect main repo vs worktrees
-   Thêm icon theo type branch (🐛 bug, ✨ feature, 🔧 fix, 🚨 hotfix)
-   Extract issue ID từ worktree path
-   Update file workspace với UTF-8 encoding

### 2. clean-orphaned-worktrees.ps1

**Mục đích**: Clean các worktree "orphaned" (folder còn tồn tại nhưng git không còn track).

**Cách dùng**: Chạy task **"🧹 Git: Clean Orphaned Worktrees"** trong VS Code.

**Chức năng**:

-   Scan folder `E:/SOURCE/system-architect-opencode.worktree/`
-   So sánh với `git worktree list`
-   Xóa các folder orphaned (không còn được track)
-   Cảnh báo nếu folder đang được dùng bởi process khác (ví dụ VS Code đang mở)

### 3. cleanup-merged-worktrees.ps1

**Mục đích**: Clean các worktree đã được merged vào target branch (`feature/learning-outcomes`).

**Cách dùng**: Chạy task **"🧹 Git: Cleanup Merged Worktrees"** trong VS Code.

**Chức năng**:

-   Quét tất cả worktrees từ `git worktree list`
-   Check branch hiện tại của từng worktree
-   Kiểm tra xem branch đã được merged vào `feature/learning-outcomes` chưa
-   Nếu merged:
    -   Xóa worktree bằng `git worktree remove`
    -   Cố gỡ bỏ branch local bằng `git branch -d`
-   Bỏ qua main repo
-   Bỏ qua các branch chưa merged

### 4. create-worktree.ps1

**Mục đích**: Tạo worktree mới với UX nâng cấp, validation thông tin chi tiết.

**Cách dùng**: Chạy task **"➕ Git: Create New Worktree"** trong VS Code.

**Chức năng**:

-   **Validation input**:
    -   Kiểm tra worktree name và branch name có hợp lệ
    -   Hiển thị usage nếu thiếu tham số
-   **Xử lý conflict**:
    -   Kiểm tra folder worktree đã tồn tại chưa
    -   Kiểm tra branch đã tồn tại chưa
    -   Hỏi confirm nếu branch đã tồn tại
-   **Hiển thị thông tin chi tiết**:
    -   Worktree name, branch name, source branch, target path
    -   Icon theo type branch ([BUG], [FEAT], [FIX], [HOT], [OTHR])
    -   Commit hash của worktree mới
-   **Next Steps**:
    -   Danh sách các bước tiếp theo (List Worktrees, Update Workspace, Reload VS Code)
-   **Error handling**:
    -   Cảnh báo rõ ràng nếu có lỗi
    -   Hiển thị các bước debug

**UX Features**:

-   Header đẹp với đường viền `=====`- Bảng thông tin chi tiết trước khi tạo
-   Màu sắc: Cyan (header), White (info), Green (success), Red (error), Yellow (warning), Gray (next steps)
-   Format output rõ ràng, dễ đọc
-   Hiển thị commit hash sau khi tạo thành công

### 5. list-worktrees.ps1

**Mục đích**: Liệt kê tất cả worktrees với giao diện thân thiện, màu sắc và thông tin chi tiết.

**Cách dùng**: Chạy task **"📊 Git: List All Worktrees"** trong VS Code.

**Chức năng**:

-   Hiển thị bảng worktrees với:
    -   Icon theo type (🏠 main, 🐛 bug, ✨ feature, 🔧 fix, 🚨 hotfix)
    -   Folder path ngắn gọn
    -   Branch name
    -   Commit hash (8 ký tự đầu tiên)
    -   Description (nếu có)
-   Màu sắc branch theo type:
    -   Cyan: `dev` branches
    -   Red: `bug` branches
    -   Green: `feature` branches
    -   Yellow: `fix` branches
    -   Magenta: `hotfix` branches
-   Cảnh báo orphaned worktrees (không được track bởi git)
-   Danh sách quick actions (tasks có sẵn)
-   Thống kê chi tiết:
    -   Tổng số worktrees
    -   Main repo path
    -   Worktree directory
    -   Số folder trong worktree directory
-   Git status của main repo:
    -   Branch hiện tại
    -   File bị thay đổi (nếu có)
    -   Working directory clean (nếu không có thay đổi)

## VS Code Tasks

Để dễ dàng chạy các scripts, đã thêm các tasks vào `.vscode/tasks.json`:

| Task                                | Label                                                                        | Mô tả |
| ----------------------------------- | ---------------------------------------------------------------------------- | ----- |
| 📊 Git: List All Worktrees          | Liệt kê worktrees với UX đẹp, màu sắc, thông tin chi tiết                    |
| ➕ Git: Create New Worktree         | Tạo worktree mới với validation, thông tin chi tiết, next steps              |
| ➖ Git: Remove Worktree             | Gỡ bỏ worktree với UX nâng cấp, validation chi tiết, error handling, confirm |
| 🧹 Git: Cleanup Merged Worktrees    | Clean các worktree đã merged vào feature/learning-outcomes                   |
| 🧹 Git: Clean Orphaned Worktrees    | Clean worktree orphaned                                                      |
| 📝 Workspace: Update from Worktrees | Update workspace từ worktrees                                                |

## Workflow Khuyến Nghị

### Tạo Worktree Mới

```
1. Chạy task "➕ Git: Create New Worktree"
    ↓
2. Nhập: worktreeName (ví dụ: bug-emspro2-7327)
    ↓
3. Nhập: branchName (ví dụ: bug-emspro2-7327)
    ↓
4. Script validation:
    -   Check conflict (folder/branch đã tồn tại)
    -   Hỏi confirm nếu cần
    ↓
5. Worktree được tạo từ origin/feature/learning-outcomes
    ↓
6. Hiển thị thông tin chi tiết:
    -   Path, branch, commit hash
    -   Next steps
    ↓
7. Chạy task "📝 Workspace: Update from Worktrees"
    ↓
8. Reload VS Code workspace
```

### Xóa Worktree

```
1. Đóng folder worktree trong VS Code (quan trọng!)
    ↓
2. Chạy task "➖ Git: Remove Worktree"
    ↓
3. Nhập: worktreeToRemove (ví dụ: bug-emspro2-7327)
    ↓
4. Nhập: branchToDelete (ví dụ: bug-emspro2-7327)
    ↓
5. Task tự động xử lý:
    -   Nếu worktree còn trong git list → dùng `git worktree remove`
    -   Nếu worktree orphaned → xóa folder thủ công
    -   Cố gỡ bỏ branch local nếu tồn tại
    ↓
6. Chạy task "📝 Workspace: Update from Worktrees"
```

### Clean Orphaned Worktrees

```
1. Đóng tất cả VS Code instances
    ↓
2. Chạy task "🧹 Git: Clean Orphaned Worktrees"
    ↓
3. Script tự động:
    -   Scan folder worktree
    -   So sánh với git worktree list
    -   Xóa các folder orphaned
```

### Clean Merged Worktrees

```
1. Chạy task "🧹 Git: Cleanup Merged Worktrees"
    ↓
2. Script tự động:
    -   Scan worktrees
    -   Check merged status
    -   Xóa worktrees và branches đã merged
```

## Lưu Ý Quan Trọng

1. **Đóng VS Code trước khi xóa worktree**: Nếu không đóng, folder đang được dùng bởi process khác và không thể xóa.
2. **Orphaned worktrees**: Đôi khi git mất track với worktree (do lỗi hoặc gián đoạn), folder vẫn còn nhưng không có trong `git worktree list`. Dùng task "Clean Orphaned Worktrees" để clean.
3. **UTF-8 Encoding**: Scripts sử dụng UTF-8 encoding để hỗ trợ text an toàn (không emoji phức tạp).
4. **Validation**: Script `create-worktree.ps1` có validation chi tiết để tránh lỗi trước khi tạo worktree.

## Xử Lý Lỗi

### Lỗi: "Worktree folder already exists"

**Nguyên nhân**: Folder worktree đã tồn tại

**Giải pháp**:

1. Đóng VS Code đang mở worktree đó
2. Chạy task "Git: Remove Worktree" để xóa
3. Hoặc chọn worktree name khác

### Lỗi: "Branch already exists"

**Nguyên nhân**: Branch local đã tồn tại

**Giải pháp**:

1. Script sẽ tự động hỏi confirm
2. Chọn "y" để tạo worktree với branch đã tồn tại
3. Hoặc xóa branch trước: `git branch -D <branch-name>`

### Lỗi: "The process cannot access file... being used by another process"

**Nguyên nhân**: Folder đang được mở bởi VS Code hoặc process khác

**Giải pháp**:

1. Đóng tất cả VS Code instances
2. Đóng các process đang truy cập folder (file explorer, terminal, etc.)
3. Thử lại

## Tài Liệu Tham Khảo

-   [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
-   [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
-   [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
