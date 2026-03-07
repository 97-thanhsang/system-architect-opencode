# Cài đặt Skills cho Dự án

## Skills cần thiết

### AnalogJS Angular Skills (Khuyến nghị)

```bash
# Cài đặt qua opkg
opkg install @analogjs/angular-new
opkg install @analogjs/angular-component
opkg install @analogjs/angular-service
opkg install @analogjs/angular-signals
opkg install @analogjs/angular-material
```

### Hoặc sử dụng OpenCode commands

```bash
# Mở OpenCode tại thư mục dự án
cd E:\SOURCE\system-architect-opencode

# Cài đặt skills
/skills install @analogjs/angular-new
/skills install @analogjs/angular-component
/skills install @analogjs/angular-service
/skills install @analogjs/angular-signals
```

## Danh sách Skills đầy đủ

| Skill | Mục đích | Lệnh cài đặt |
|-------|----------|--------------|
| angular-new | Tạo project Angular mới | `opkg install @analogjs/angular-new` |
| angular-component | Generate component | `opkg install @analogjs/angular-component` |
| angular-service | Generate service | `opkg install @analogjs/angular-service` |
| angular-signals | State management | `opkg install @analogjs/angular-signals` |
| angular-material | Material components | `opkg install @analogjs/angular-material` |
| angular-router | Routing | `opkg install @analogjs/angular-router` |

## Cách sử dụng Skills

### 1. Tạo Component mới

```bash
/analogjs/angular-component my-component --path=src/app/features
```

Hoặc dùng Angular CLI:
```bash
g generate component my-component
```

### 2. Tạo Service mới

```bash
/analogjs/angular-service my-service
```

Hoặc:
```bash
g generate service my-service
```

### 3. Tạo Module mới

```bash
/analogjs/angular-module my-module
```

## Integration với OpenCode

Dự án này đã cấu hình sẵn trong `.config/opencode/opencode.json`:

```json
{
  "skills": [
    {
      "name": "angular-new",
      "source": "@analogjs/angular-new"
    },
    {
      "name": "angular-component",
      "source": "@analogjs/angular-component"
    }
  ]
}
```

## Tips

1. **Luôn cập nhật skills**: Chạy `opkg update` để cập nhật skills mới nhất
2. **Kiểm tra skills đã cài**: `opkg list`
3. **Xem hướng dẫn skill**: `/<skill-name> --help`

## Link tham khảo

- [AnalogJS Skills](https://skills.sh/analogjs/angular-skills)
- [OpenCode Documentation](https://opencode.ai/docs)
- [Angular CLI](https://angular.io/cli)
