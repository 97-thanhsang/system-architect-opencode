import { Injectable, signal } from '@angular/core';

export type MenuPosition = 'sidebar' | 'header';
export type Theme = 'light' | 'dark';
export type ModuleId = 'fe' | 'be' | 'qc' | 'ba';

export interface LayoutState {
  menuPosition: MenuPosition;
  sidebarCollapsed: boolean;
  theme: Theme;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  roles: string[];
  children?: MenuItem[];
}

/** Menu config cho từng module (Hỗ trợ menu 3 cấp) */
const MODULE_MENUS: Record<ModuleId, MenuItem[]> = {
  fe: [
    {
      id: 'engineering',
      label: 'Engineering',
      icon: 'engineering',
      roles: ['FE'],
      children: [
        { id: 'fe-dashboard', label: 'Dashboard', icon: 'dashboard', route: 'dashboard', roles: ['FE'] },
        {
          id: 'analysis-group',
          label: 'Analysis',
          icon: 'analytics',
          roles: ['FE'],
          children: [
            { id: 'analyze', label: 'Analyze Tool', route: 'analyze', roles: ['FE'] },
            { id: 'projects', label: 'Projects', route: 'projects', roles: ['FE'] },
          ]
        },
      ]
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: 'groups',
      roles: ['FE'],
      children: [
        { id: 'tasks', label: 'My Tasks', icon: 'assignment', route: 'tasks', roles: ['FE'] },
        { id: 'team', label: 'Team', icon: 'people', route: 'team', roles: ['FE'] },
      ]
    },
    { id: 'settings', label: 'Settings', icon: 'settings', route: 'settings', roles: ['FE'] },
  ],
  be: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: 'dashboard', roles: ['BE'] },
    {
      id: 'infrastructure',
      label: 'Infrastructure',
      icon: 'lan',
      roles: ['BE'],
      children: [
        { id: 'apis', label: 'APIs', icon: 'api', route: 'apis', roles: ['BE'] },
        { id: 'database', label: 'Database', icon: 'storage', route: 'database', roles: ['BE'] },
        { id: 'services', label: 'Services', icon: 'miscellaneous_services', route: 'services', roles: ['BE'] },
      ]
    },
    { id: 'logs', label: 'Logs', icon: 'receipt_long', route: 'logs', roles: ['BE'] },
    { id: 'settings', label: 'Settings', icon: 'settings', route: 'settings', roles: ['BE'] },
  ],
  qc: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: 'dashboard', roles: ['QC'] },
    {
      id: 'testing-group',
      label: 'Testing',
      icon: 'rule',
      roles: ['QC'],
      children: [
        { id: 'testcases', label: 'Test Cases', icon: 'fact_check', route: 'testcases', roles: ['QC'] },
        { id: 'testruns', label: 'Test Runs', icon: 'play_circle', route: 'testruns', roles: ['QC'] },
      ]
    },
    { id: 'bugs', label: 'Bug Reports', icon: 'bug_report', route: 'bugs', roles: ['QC'] },
    { id: 'reports', label: 'Reports', icon: 'bar_chart', route: 'reports', roles: ['QC'] },
    { id: 'settings', label: 'Settings', icon: 'settings', route: 'settings', roles: ['QC'] },
  ],
  ba: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: 'dashboard', roles: ['BA'] },
    {
      id: 'requirements-group',
      label: 'Analysis',
      icon: 'fact_check',
      roles: ['BA'],
      children: [
        { id: 'requirements', label: 'Requirements', icon: 'list_alt', route: 'requirements', roles: ['BA'] },
        { id: 'stories', label: 'User Stories', icon: 'auto_stories', route: 'stories', roles: ['BA'] },
      ]
    },
    { id: 'diagrams', label: 'Diagrams', icon: 'account_tree', route: 'diagrams', roles: ['BA'] },
    { id: 'documents', label: 'Documents', icon: 'description', route: 'documents', roles: ['BA'] },
    { id: 'settings', label: 'Settings', icon: 'settings', route: 'settings', roles: ['BA'] },
  ],
};

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // State signals
  private readonly _menuPosition = signal<MenuPosition>('sidebar');
  private readonly _sidebarCollapsed = signal<boolean>(false);
  private readonly _theme = signal<Theme>('light');

  // Read-only signals
  readonly menuPosition = this._menuPosition.asReadonly();
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();
  readonly theme = this._theme.asReadonly();

  constructor() {
    this.loadStoredPreferences();
  }

  /**
   * Toggle between sidebar and header menu
   */
  toggleMenuPosition(): void {
    this._menuPosition.update(pos => pos === 'sidebar' ? 'header' : 'sidebar');
    this.savePreferences();
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this._sidebarCollapsed.update(collapsed => !collapsed);
    this.savePreferences();
  }

  /**
   * Set menu position
   */
  setMenuPosition(position: MenuPosition): void {
    this._menuPosition.set(position);
    this.savePreferences();
  }

  /**
   * Toggle theme
   */
  toggleTheme(): void {
    this._theme.update(theme => theme === 'light' ? 'dark' : 'light');
    this.savePreferences();
  }

  /**
   * Get menu items cho một module cụ thể (FE / BE / QC / BA).
   * Fallback về FE menu nếu moduleId không hợp lệ.
   */
  getMenuItemsForModule(moduleId: string): MenuItem[] {
    const key = (moduleId || 'fe').toLowerCase() as ModuleId;
    return MODULE_MENUS[key] ?? MODULE_MENUS['fe'];
  }

  /**
   * @deprecated Dùng getMenuItemsForModule() thay thế.
   * Giữ lại để tránh breaking change với các nơi còn dùng.
   */
  getMenuItemsForRole(role: string): MenuItem[] {
    const key = (role || 'fe').toLowerCase() as ModuleId;
    return MODULE_MENUS[key] ?? MODULE_MENUS['fe'];
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    const preferences = {
      menuPosition: this._menuPosition(),
      sidebarCollapsed: this._sidebarCollapsed(),
      theme: this._theme()
    };
    localStorage.setItem('layout_preferences', JSON.stringify(preferences));
  }

  /**
   * Load preferences from localStorage
   */
  private loadStoredPreferences(): void {
    const stored = localStorage.getItem('layout_preferences');
    if (stored) {
      try {
        const preferences = JSON.parse(stored);
        this._menuPosition.set(preferences.menuPosition || 'sidebar');
        this._sidebarCollapsed.set(preferences.sidebarCollapsed || false);
        this._theme.set(preferences.theme || 'light');
      } catch (e) {
        console.error('Failed to load layout preferences', e);
      }
    }
  }
}
