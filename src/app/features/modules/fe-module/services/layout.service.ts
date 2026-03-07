import { Injectable, signal } from '@angular/core';

export type MenuPosition = 'sidebar' | 'header';
export type Theme = 'light' | 'dark';

export interface LayoutState {
  menuPosition: MenuPosition;
  sidebarCollapsed: boolean;
  theme: Theme;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

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

  // Menu configuration
  readonly menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: 'dashboard', roles: ['FE', 'BE', 'QC', 'BA'] },
    { id: 'tasks', label: 'My Tasks', icon: 'assignment', route: 'tasks', roles: ['FE', 'QC'] },
    { id: 'projects', label: 'Projects', icon: 'folder', route: 'projects', roles: ['FE', 'BE', 'BA'] },
    { id: 'team', label: 'Team', icon: 'people', route: 'team', roles: ['FE', 'BE', 'QC', 'BA'] },
    { id: 'settings', label: 'Settings', icon: 'settings', route: 'settings', roles: ['FE', 'BE', 'QC', 'BA'] }
  ];

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
   * Get menu items for a specific role
   */
  getMenuItemsForRole(role: string): MenuItem[] {
    return this.menuItems.filter(item => item.roles.includes(role));
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
