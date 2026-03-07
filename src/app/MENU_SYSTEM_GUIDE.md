/**
 * Role-Based Menu System - Documentation
 * @description Complete guide for implementing and using the menu system
 * @version 1.0.0
 */

# Role-Based Menu System

Hệ thống menu navigation dựa trên vai trò (role-based) cho Angular 17+ với Signals API và Angular Material.

## 📁 File Structure

```
src/app/
├── core/
│   ├── models/
│   │   └── menu.model.ts          # TypeScript interfaces & types
│   ├── services/
│   │   └── menu.service.ts        # Menu state management (Signals)
│   └── config/
│       └── menu.config.ts         # Role-based menu definitions
└── shared/
    └── components/
        └── sidebar/
            ├── sidebar.component.ts    # Main sidebar component
            └── sidebar.component.scss  # Responsive styles
```

## 🏗️ Architecture

### 1. Data Flow

```
User Role Selection
      ↓
MenuService.setRole(role)
      ↓
Update Signals (_currentRole)
      ↓
Computed Signals (menuItems)
      ↓
SidebarComponent Template
      ↓
MatNavList + MenuItemComponent
```

### 2. Key Components

| Component | Purpose | Technology |
|-----------|---------|------------|
| MenuItem Interface | Type definitions for menu items | TypeScript |
| MenuService | Reactive state management | Angular Signals |
| Menu Config | Static menu definitions | TypeScript Objects |
| SidebarComponent | UI rendering | Angular Material |
| MenuItemComponent | Recursive menu items | Standalone Components |

## 🎯 Features

### Role-Based Menu
- **FE (Frontend Developer)**: 7 menu items + sub-menus
- **BE (Backend Developer)**: 6 menu items + sub-menus
- **QC (Quality Control)**: 7 menu items + sub-menus
- **BA (Business Analyst)**: 7 menu items + sub-menus
- **PM (Project Manager)**: 8 menu items + sub-menus
- **ADMIN**: 4 menu items + sub-menus

### Responsive Design
- **Desktop (>1024px)**: Fixed sidebar (280px)
- **Tablet (768-1024px)**: Collapsible sidebar
- **Mobile (<768px)**: Hidden sidebar with toggle

### Interactive Features
- ✅ Collapsible/Expandable sidebar
- ✅ Nested menu with accordion behavior
- ✅ Role selector dropdown
- ✅ Search/filter functionality
- ✅ Active item highlighting
- ✅ Badge notifications (dot, number, text)
- ✅ Breadcrumb path tracking
- ✅ LocalStorage persistence
- ✅ Mobile hamburger menu

## 🚀 Usage

### 1. Basic Setup in App Component

```typescript
import { Component } from '@angular/core';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent],
  template: `
    <app-sidebar />
  `
})
export class AppComponent {}
```

### 2. Using MenuService

```typescript
import { Component, inject } from '@angular/core';
import { MenuService } from './core/services/menu.service';
import { Role } from './core/models/menu.model';

@Component({...})
export class SomeComponent {
  private readonly menuService = inject(MenuService);

  // Access signals
  currentRole = this.menuService.currentRole;
  menuItems = this.menuService.menuItems;
  isExpanded = this.menuService.isExpanded;
  activeItem = this.menuService.activeMenuItem;

  // Change role
  switchRole(role: Role) {
    this.menuService.setRole(role);
  }

  // Toggle sidebar
  toggleSidebar() {
    this.menuService.toggleSidebar();
  }

  // Navigate to menu item
  navigateToDashboard() {
    const dashboard = this.menuItems().find(i => i.id.includes('dashboard'));
    if (dashboard) {
      this.menuService.navigateToItem(dashboard);
    }
  }
}
```

### 3. Accessing Menu State in Templates

```typescript
@Component({
  template: `
    <!-- Show current role -->
    <span>Role: {{ menuService.currentRole() }}</span>

    <!-- Show menu item count -->
    <span>Items: {{ menuService.totalMenuItems() }}</span>

    <!-- Show active item -->
    @if (menuService.activeMenuItem(); as active) {
      <span>Active: {{ active.label }}</span>
    }

    <!-- Show breadcrumb -->
    <nav>
      @for (item of menuService.breadcrumbPath(); track item.id) {
        <span>{{ item.label }}</span>
        @if (!$last) {
          <mat-icon>chevron_right</mat-icon>
        }
      }
    </nav>
  `
})
export class DashboardComponent {
  protected readonly menuService = inject(MenuService);
}
```

### 4. Adding New Menu Items

```typescript
// menu.config.ts
const feMenu: MenuItem[] = [
  // ... existing items
  {
    id: 'fe-new-feature',
    label: 'New Feature',
    icon: 'star',
    route: '/fe/new-feature',
    roles: ['FE'],
    order: 10,
    badge: {
      text: 'New',
      color: 'accent',
      style: 'text'
    }
  }
];
```

### 5. Adding Nested Menu Items

```typescript
{
  id: 'parent-menu',
  label: 'Parent Menu',
  icon: 'folder',
  roles: ['FE'],
  order: 5,
  children: [
    {
      id: 'child-1',
      label: 'Child Item 1',
      icon: 'description',
      route: '/fe/parent/child-1',
      roles: ['FE'],
      order: 1
    },
    {
      id: 'child-2',
      label: 'Child Item 2',
      icon: 'description',
      route: '/fe/parent/child-2',
      roles: ['FE'],
      order: 2
    }
  ]
}
```

## 📊 Menu Configuration

### FE (Frontend Developer)
```
Dashboard
Components
├── UI Library
├── Form Controls
├── Data Tables
└── Charts & Graphs
Layouts
State Management
API Integration
Styling & Themes
Testing
```

### BE (Backend Developer)
```
Dashboard
API Management
├── Endpoints
├── Middleware
├── Security
└── API Documentation
Database
├── Schema Design
├── Query Builder
└── Migrations
Microservices
Testing
Logs & Monitoring
```

### QC (Quality Control)
```
Dashboard [5]
Test Plans
Test Cases
Test Execution [●]
Bug Reports [12]
Test Reports
├── Coverage Reports
├── Performance
└── Automation Stats
Environments
```

### BA (Business Analyst)
```
Dashboard
Requirements [New]
User Stories
Process Flows
Wireframes
Documentation
├── Business Rules
├── Glossary
└── Templates
Stakeholders
```

### PM (Project Manager)
```
Dashboard
Project Overview
Sprint Planning
├── Backlog
├── Kanban Board
└── Retrospectives
Team Management
Timeline & Gantt
Reports & Analytics
├── Velocity
├── Burndown
└── Risk Analysis
Budget & Resources
Project Settings
```

## 🎨 Styling

### CSS Variables

```scss
// Sidebar dimensions
$sidebar-width: 280px;
$sidebar-collapsed-width: 72px;

// Colors
$primary-color: #3f51b5;
$accent-color: #ff4081;
$warn-color: #f44336;

// Breakpoints
$mobile-breakpoint: 768px;
```

### Customizing Theme

```scss
// sidebar.component.scss
.sidenav {
  background: linear-gradient(180deg, #your-color 0%, #your-color2 100%);
}

.sidenav-brand {
  background: linear-gradient(135deg, $your-primary 0%, $your-secondary 100%);
}
```

## 🔄 State Management

### Available Signals

| Signal | Type | Description |
|--------|------|-------------|
| `currentRole` | `Signal<Role \| null>` | Current user role |
| `menuItems` | `Signal<MenuItem[]>` | Filtered menu items |
| `isExpanded` | `Signal<boolean>` | Sidebar expanded state |
| `activeItemId` | `Signal<string \| null>` | Active menu item ID |
| `expandedGroups` | `Signal<string[]>` | Expanded group IDs |
| `mobileOpen` | `Signal<boolean>` | Mobile sidebar state |

### Observable Streams

```typescript
// Subscribe to role changes
menuService.roleChanges$.subscribe(role => {
  console.log('Role changed to:', role);
});

// Subscribe to full state
menuService.menuState$.subscribe(state => {
  console.log('Menu state:', state);
});
```

## 🧪 Testing

### Unit Test Example

```typescript
import { TestBed } from '@angular/core/testing';
import { MenuService } from './menu.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.inject(MenuService);
  });

  it('should set role and load menu items', () => {
    service.setRole('FE');
    expect(service.currentRole()).toBe('FE');
    expect(service.menuItems().length).toBeGreaterThan(0);
  });

  it('should toggle sidebar expansion', () => {
    const initial = service.isExpanded();
    service.toggleSidebar();
    expect(service.isExpanded()).toBe(!initial);
  });

  it('should filter menu items by search', () => {
    service.setRole('FE');
    service.setSearchTerm('Dashboard');
    const items = service.menuItems();
    expect(items.every(i => 
      i.label.toLowerCase().includes('dashboard')
    )).toBeTrue();
  });
});
```

## 📱 Responsive Behavior

### Desktop
- Sidebar always visible
- Full width (280px)
- Role selector dropdown
- User profile visible

### Tablet
- Collapsible sidebar
- Overlay mode on mobile
- Toggle button visible

### Mobile
- Hidden by default
- Hamburger menu button
- Full-screen overlay
- Slide-in animation

## 🔒 Best Practices

### 1. Role Management
- Set role on user login
- Persist role in localStorage
- Validate role before menu operations

### 2. Navigation
- Use `navigateToItem()` for programmatic navigation
- Let router events handle active state
- Handle external links appropriately

### 3. Performance
- Use `OnPush` change detection
- Leverage Signal computed values
- Lazy load menu content when possible

### 4. Accessibility
- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- High contrast mode support

## 🐛 Troubleshooting

### Menu not showing
1. Check if role is set: `menuService.currentRole()`
2. Verify MENU_CONFIG has items for role
3. Check browser console for errors

### Active item not highlighting
1. Verify route matches menu item route
2. Check if `setActiveItem()` is called
3. Ensure Router events are working

### Sidebar not responsive
1. Check window resize listeners
2. Verify breakpoint configuration
3. Test on actual mobile device

### State not persisting
1. Check localStorage permissions
2. Verify localStorage keys
3. Clear localStorage and retry

## 📝 Changelog

### v1.0.0
- ✅ Initial release
- ✅ Role-based menu system
- ✅ Angular 17 Signals integration
- ✅ Responsive design
- ✅ Mobile support
- ✅ Badge notifications
- ✅ Search/filter functionality
- ✅ LocalStorage persistence

## 🔗 References

- [Angular Signals](https://angular.io/guide/signals)
- [Angular Material](https://material.angular.io/)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [RxJS](https://rxjs.dev/)
