# 🎨 TAIGA UI - Hướng dẫn sử dụng

> **Version**: 3.87.0 (tương thích Angular 17)  
> **Ngày cài đặt**: March 2026  
> **Documentation**: https://taiga-ui.dev

---

## ✅ Đã cài đặt thành công

### Packages đã cài:
```json
{
  "@taiga-ui/core": "3.87.0",        // Core components + theming
  "@taiga-ui/kit": "3.87.0",          // UI kit (inputs, buttons, islands...)
  "@taiga-ui/icons": "3.87.0",        // Icon library
  "@taiga-ui/addon-table": "3.87.0",  // Data tables
  "@taiga-ui/addon-charts": "3.87.0"  // Charts
}
```

---

## 🚀 Components mẫu đã tạo

### 1. **Login với Taiga UI**
📁 `src/app/features/auth/components/login-taiga/login-taiga.component.ts`

**Features:**
- ✅ TuiIsland (card design)
- ✅ TuiInput với validation hints
- ✅ TuiButton với icons
- ✅ TuiMarkerIcon cho logo
- ✅ Responsive design

**Usage:**
```typescript
import { LoginTaigaComponent } from './features/auth/components/login-taiga/login-taiga.component';

// Trong routes
{ path: 'login-new', component: LoginTaigaComponent }
```

---

### 2. **Dashboard với Taiga UI**
📁 `src/app/features/dashboard-taiga/dashboard-taiga.component.ts`

**Features:**
- ✅ Grid layout với TuiIsland cards
- ✅ Role selection cards với hover effects
- ✅ TuiBadge cho labels
- ✅ Stats overview với icons
- ✅ Header với user menu

**Usage:**
```typescript
import { DashboardTaigaComponent } from './features/dashboard-taiga/dashboard-taiga.component';

// Trong routes
{ path: 'dashboard-new', component: DashboardTaigaComponent }
```

---

## 📦 Cách sử dụng Taiga UI

### 1. **Import Modules**

Mỗi component standalone cần import các Taiga UI modules:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Taiga UI Core
import { 
  TuiButtonModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';

// Taiga UI Kit (components)
import { 
  TuiInputModule,
  TuiIslandModule,
  TuiBadgeModule,
  TuiMarkerIconModule
} from '@taiga-ui/kit';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [
    CommonModule,
    // Taiga UI
    TuiButtonModule,
    TuiInputModule,
    TuiIslandModule,
    TuiBadgeModule,
    TuiMarkerIconModule,
    TuiSvgModule
  ],
  template: `...`
})
export class MyComponent {}
```

---

### 2. **Common Components Cheat Sheet**

#### **Buttons**
```html
<!-- Primary Button -->
<button tuiButton type="button" size="m">Click me</button>

<!-- With Icon -->
<button tuiButton type="button" size="m">
  <tui-svg src="tuiIconCheck"></tui-svg>
  Save
</button>

<!-- Secondary -->
<button tuiButton type="button" appearance="secondary" size="m">Cancel</button>

<!-- Flat -->
<button tuiButton type="button" appearance="flat" size="m">Flat Button</button>
```

#### **Inputs**
```html
<!-- Basic Input -->
<tui-input [(ngModel)]="value">
  Label
  <input tuiTextfield type="text" placeholder="Placeholder" />
</tui-input>

<!-- With Hint -->
<tui-input [(ngModel)]="email" tuiHintContent="Enter your email">
  Email
  <input tuiTextfield type="email" />
</tui-input>

<!-- Large Size -->
<tui-input tuiTextfieldSize="l">
  Large Input
  <input tuiTextfield />
</tui-input>
```

#### **Cards (Islands)**
```html
<!-- Basic Island -->
<tui-island>
  <h3 class="tui-text_h5">Title</h3>
  <p class="tui-text_body-m">Content here</p>
</tui-island>

<!-- Hoverable -->
<tui-island [hoverable]="true">
  Hover me!
</tui-island>

<!-- With Padding -->
<tui-island size="l">
  Large padding island
</tui-island>
```

#### **Icons**
```html
<!-- SVG Icon -->
<tui-svg src="tuiIconHome"></tui-svg>

<!-- Large Icon -->
<tui-svg src="tuiIconCheckCircleLarge"></tui-svg>

<!-- Marker Icon (circular background) -->
<tui-marker-icon src="tuiIconStarLarge" mode="primary" size="m"></tui-marker-icon>
```

**Available icons:** https://taiga-ui.dev/icons

#### **Badges**
```html
<!-- Basic Badge -->
<tui-badge value="New" size="m"></tui-badge>

<!-- Status Badge -->
<tui-badge status="success" value="Active" size="l"></tui-badge>
<tui-badge status="error" value="Error" size="l"></tui-badge>
<tui-badge status="warning" value="Warning" size="l"></tui-badge>
```

---

### 3. **Typography Classes**

Taiga UI cung cấp sẵn typography classes:

```html
<!-- Headings -->
<h1 class="tui-text_h1">Heading 1</h1>
<h2 class="tui-text_h2">Heading 2</h2>
<h3 class="tui-text_h3">Heading 3</h3>
<h4 class="tui-text_h4">Heading 4</h4>
<h5 class="tui-text_h5">Heading 5</h5>

<!-- Body Text -->
<p class="tui-text_body-l">Large body text</p>
<p class="tui-text_body-m">Medium body text</p>
<p class="tui-text_body-s">Small body text</p>

<!-- Colors -->
<p class="tui-text_color-01">Primary text (darkest)</p>
<p class="tui-text_color-02">Secondary text</p>
<p class="tui-text_color-03">Tertiary text (lightest)</p>
```

---

### 4. **Data Tables**

```typescript
import { TuiTableModule } from '@taiga-ui/addon-table';
```

```html
<table tuiTable [columns]="columns">
  <thead>
    <tr tuiThGroup>
      <th tuiTh *ngFor="let col of columns">{{ col }}</th>
    </tr>
  </thead>
  <tbody tuiTbody>
    <tr tuiTr *ngFor="let item of data">
      <td tuiTd *ngFor="let col of columns">{{ item[col] }}</td>
    </tr>
  </tbody>
</table>
```

---

### 5. **Charts**

```typescript
import { TuiAxesModule, TuiLineChartModule } from '@taiga-ui/addon-charts';
```

```html
<tui-axes
  [axisXLabels]="['Jan', 'Feb', 'Mar']"
  [axisYLabels]="['0', '50', '100']">
  <tui-line-chart
    [value]="[[0, 50], [1, 75], [2, 100]]">
  </tui-line-chart>
</tui-axes>
```

---

## 🎨 **Customization**

### CSS Variables (đã cấu hình trong styles.scss)

```css
:root {
  /* Primary */
  --tui-primary: #526ed3;
  --tui-primary-hover: #6c86e2;
  --tui-primary-active: #314692;
  
  /* Text */
  --tui-text-01: #1b1f3b;      /* Darkest */
  --tui-text-02: rgba(27, 31, 59, 0.65);  /* Secondary */
  --tui-text-03: rgba(27, 31, 59, 0.4);   /* Tertiary */
  
  /* Background */
  --tui-base-01: #ffffff;      /* White */
  --tui-base-02: #f6f7f8;      /* Light gray (page bg) */
  --tui-base-03: #eaecee;      /* Border */
  
  /* Status */
  --tui-success-fill: #4db524;
  --tui-error-fill: #f45725;
  --tui-warning-fill: #ff9f42;
  --tui-info-fill: #1b94f5;
  
  /* Border Radius */
  --tui-radius-m: 12px;
  --tui-radius-l: 16px;
}
```

---

## 📱 **Responsive Design**

Taiga UI components tự động responsive:

```html
<!-- Grid responsive -->
<div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
  <tui-island *ngFor="let item of items">
    {{ item.name }}
  </tui-island>
</div>

<!-- Mobile-first -->
<button tuiButton size="m" class="hide-mobile">Desktop Only</button>
<button tuiButton size="l" class="hide-desktop">Mobile Only</button>
```

---

## 🎯 **Best Practices**

### ✅ DO:
1. **Import only what you need** - Không import cả module, chỉ import component cụ thể
2. **Use standalone components** - Taiga UI fully supports Angular standalone
3. **Use tui-text classes** - Đảm bảo typography consistent
4. **Leverage CSS variables** - Dễ customize theme

### ❌ DON'T:
1. **Don't mix Material and Taiga** trong cùng 1 component (trừ khi cần thiết)
2. **Don't override styles** với !important - Dùng CSS variables thay thế
3. **Don't forget TuiRootModule** - Bắt buộc trong app.component.ts

---

## 🔧 **Troubleshooting**

### Icons không hiển thị?
```typescript
// Trong app.config.ts
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { provideIcons } from '@taiga-ui/icons';

providers: [
  NG_EVENT_PLUGINS,
  provideIcons()
]
```

### Styles không apply?
```scss
// Trong styles.scss
@import '@taiga-ui/core/styles/taiga-ui-local.scss';
@import '@taiga-ui/core/styles/taiga-ui-theme.scss';
```

### Component không có animation?
```typescript
// Đảm bảo có provideAnimationsAsync()
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

providers: [
  provideAnimationsAsync()
]
```

---

## 📚 **Resources**

- **Official Docs**: https://taiga-ui.dev
- **Icons**: https://taiga-ui.dev/icons
- **GitHub**: https://github.com/taiga-family/taiga-ui
- **StackBlitz**: https://stackblitz.com/@taiga-family

---

## 🚀 **Next Steps**

1. **Chạy dev server**:
   ```bash
   npm start
   ```

2. **Test Taiga UI components**:
   - Truy cập `/login-new` để xem Login component
   - Truy cập `/dashboard-new` để xem Dashboard component

3. **Migrate dần các components** từ Material → Taiga UI

4. **Tạo components mới** dùng Taiga UI patterns

---

**Happy coding with Taiga UI! 🎨**
