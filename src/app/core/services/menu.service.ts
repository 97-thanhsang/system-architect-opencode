/**
 * @fileoverview Menu Service
 * @description Service for managing application menu state and operations using Angular Signals
 * @version 1.0.0
 */

import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';

// Import types from menu model
import {
  Role,
  MenuItem,
  MenuSection,
  MenuState,
  MenuFilterOptions,
  FlattenedMenuItem,
  MenuBreadcrumb,
  initialMenuState,
  ALL_ROLES
} from '../models/menu.model';

// Import menu configuration
import {
  MENU_CONFIG,
  MENU_SECTIONS,
  getMenuByRole,
  findMenuItemById,
  getRoutesByRole
} from '../config/menu.config';

/**
 * Service for managing application menu state
 * Uses Angular 17 Signals for reactive state management
 * 
 * @example
 * ```typescript
 * constructor(private menuService: MenuService) {}
 * 
 * ngOnInit() {
 *   // Set role and load menu
 *   this.menuService.setRole('FE');
 *   
 *   // Access signals
 *   const menuItems = this.menuService.menuItems();
 *   const activeItem = this.menuService.activeMenuItem();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  // ============================================================================
  // Dependencies
  // ============================================================================
  
  private readonly router = inject(Router);

  // ============================================================================
  // Private State Signals
  // ============================================================================

  /** Current menu state */
  private readonly _state = signal<MenuState>(initialMenuState);

  /** Loading state for async operations */
  private readonly _isLoading = signal<boolean>(false);

  /** Error state */
  private readonly _error = signal<string | null>(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  /** Current menu state (readonly) */
  readonly state = this._state.asReadonly();

  /** Loading state (readonly) */
  readonly isLoading = this._isLoading.asReadonly();

  /** Error state (readonly) */
  readonly error = this._error.asReadonly();

  // ============================================================================
  // Computed Signals
  // ============================================================================

  /** Currently selected role */
  readonly currentRole = computed(() => this._state().currentRole);

  /** Current menu items for the selected role */
  readonly menuItems = computed(() => this._state().menuItems);

  /** Menu sections organized by category */
  readonly menuSections = computed<MenuSection[]>(() => {
    const role = this._state().currentRole;
    return role ? MENU_SECTIONS[role] || [] : [];
  });

  /** Whether sidebar is expanded */
  readonly isExpanded = computed(() => this._state().isExpanded);

  /** Currently active menu item ID */
  readonly activeItemId = computed(() => this._state().activeItemId);

  /** Active menu item object */
  readonly activeMenuItem = computed<MenuItem | null>(() => {
    const itemId = this._state().activeItemId;
    if (!itemId) return null;
    
    return this.findMenuItemById(itemId) ?? null;
  });

  /** Expanded menu groups */
  readonly expandedGroups = computed(() => this._state().expandedGroups);

  /** Mobile sidebar open state */
  readonly mobileOpen = computed(() => this._state().mobileOpen);

  /** Current search query */
  readonly searchQuery = computed(() => this._state().searchQuery || '');

  /** All available roles */
  readonly availableRoles = computed(() => ALL_ROLES);

  /** Flattened menu items with hierarchy info */
  readonly flattenedMenuItems = computed<FlattenedMenuItem[]>(() => {
    const items = this._state().menuItems;
    return this.flattenMenuItems(items);
  });

  /** Total menu item count */
  readonly totalMenuItemCount = computed(() => 
    this.flattenedMenuItems().length
  );

  /** Breadcrumb path for active item */
  readonly breadcrumb = computed<MenuBreadcrumb[]>(() => {
    const activeItem = this.activeMenuItem();
    if (!activeItem) return [];
    
    return this.buildBreadcrumb(activeItem);
  });

  /** Filtered menu items based on search query */
  readonly filteredMenuItems = computed<MenuItem[]>(() => {
    const items = this._state().menuItems;
    const query = this.searchQuery().toLowerCase().trim();
    
    if (!query) return items;
    
    return this.filterMenuItemsByQuery(items, query);
  });

  /** Current route is a menu route */
  readonly isMenuRoute = computed(() => {
    const role = this._state().currentRole;
    const url = this.router.url;
    if (!role) return false;
    
    const routes = getRoutesByRole(role);
    return routes.some(route => url.startsWith(route));
  });

  // ============================================================================
  // Constructor & Effects
  // ============================================================================

  constructor() {
    // Initialize from storage
    this.initializeFromStorage();
    
    // Sync with localStorage on state changes
    effect(() => {
      const state = this._state();
      if (state.currentRole) {
        localStorage.setItem('menu_role', state.currentRole);
      }
      localStorage.setItem('menu_expanded', String(state.isExpanded));
      localStorage.setItem('menu_active_item', state.activeItemId || '');
    });
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize menu state from localStorage
   */
  private initializeFromStorage(): void {
    const storedRole = localStorage.getItem('menu_role') as Role | null;
    const storedExpanded = localStorage.getItem('menu_expanded');
    const storedActiveItem = localStorage.getItem('menu_active_item');

    if (storedRole && this.isValidRole(storedRole)) {
      const items = getMenuByRole(storedRole);
      this._state.update(state => ({
        ...state,
        currentRole: storedRole,
        menuItems: items
      }));
    }

    if (storedExpanded !== null) {
      this._state.update(state => ({
        ...state,
        isExpanded: storedExpanded === 'true'
      }));
    }

    if (storedActiveItem) {
      this._state.update(state => ({
        ...state,
        activeItemId: storedActiveItem
      }));
    }
  }

  /**
   * Validate if string is a valid Role
   */
  private isValidRole(role: string): role is Role {
    return ALL_ROLES.includes(role as Role);
  }

  // ============================================================================
  // Role Management
  // ============================================================================

  /**
   * Set the current user role and load corresponding menu
   * @param role - User role to set
   */
  setRole(role: Role): void {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const items = getMenuByRole(role);
      
      this._state.update(state => ({
        ...state,
        currentRole: role,
        menuItems: items,
        activeItemId: null,
        expandedGroups: []
      }));

      // Navigate to first menu item if available
      const firstRoute = this.getFirstRoute(items);
      if (firstRoute) {
        this.router.navigate([firstRoute]);
      }
    } catch (err) {
      this._error.set('Failed to load menu for role: ' + role);
      console.error('MenuService: Error setting role', err);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Clear the current role
   */
  clearRole(): void {
    this._state.set(initialMenuState);
    localStorage.removeItem('menu_role');
    localStorage.removeItem('menu_active_item');
  }

  // ============================================================================
  // Menu Item Actions
  // ============================================================================

  /**
   * Set active menu item
   * @param itemId - Menu item ID to activate
   */
  setActiveItem(itemId: string): void {
    this._state.update(state => ({
      ...state,
      activeItemId: itemId
    }));

    // Auto-expand parent if item has parent
    const item = this.findMenuItemById(itemId);
    if (item && this.hasParent(item)) {
      // Find parent and expand it
      const parent = this.findParentItem(itemId);
      if (parent) {
        this.expandGroup(parent.id);
      }
    }
  }

  /**
   * Navigate to a menu item
   * @param itemId - Menu item ID to navigate to
   */
  navigateToItem(itemId: string): void {
    const item = this.findMenuItemById(itemId);
    if (!item || item.disabled) return;

    this.setActiveItem(itemId);

    if (item.externalLink) {
      if (item.openInNewTab) {
        window.open(item.externalLink, '_blank');
      } else {
        window.location.href = item.externalLink;
      }
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  /**
   * Toggle sidebar expanded state
   */
  toggleSidebar(): void {
    this._state.update(state => ({
      ...state,
      isExpanded: !state.isExpanded
    }));
  }

  /**
   * Set sidebar expanded state
   * @param expanded - Whether sidebar should be expanded
   */
  setExpanded(expanded: boolean): void {
    this._state.update(state => ({
      ...state,
      isExpanded: expanded
    }));
  }

  /**
   * Toggle mobile sidebar
   */
  toggleMobileSidebar(): void {
    this._state.update(state => ({
      ...state,
      mobileOpen: !state.mobileOpen
    }));
  }

  /**
   * Set mobile sidebar state
   * @param open - Whether mobile sidebar should be open
   */
  setMobileOpen(open: boolean): void {
    this._state.update(state => ({
      ...state,
      mobileOpen: open
    }));
  }

  /**
   * Toggle group expansion
   * @param groupId - Group ID to toggle
   */
  toggleGroup(groupId: string): void {
    this._state.update(state => {
      const expanded = new Set(state.expandedGroups);
      if (expanded.has(groupId)) {
        expanded.delete(groupId);
      } else {
        expanded.add(groupId);
      }
      return { ...state, expandedGroups: Array.from(expanded) };
    });
  }

  /**
   * Expand a group
   * @param groupId - Group ID to expand
   */
  expandGroup(groupId: string): void {
    this._state.update(state => {
      if (state.expandedGroups.includes(groupId)) return state;
      return {
        ...state,
        expandedGroups: [...state.expandedGroups, groupId]
      };
    });
  }

  /**
   * Collapse a group
   * @param groupId - Group ID to collapse
   */
  collapseGroup(groupId: string): void {
    this._state.update(state => ({
      ...state,
      expandedGroups: state.expandedGroups.filter(id => id !== groupId)
    }));
  }

  /**
   * Expand all groups
   */
  expandAllGroups(): void {
    const allGroupIds = this.getAllGroupIds();
    this._state.update(state => ({
      ...state,
      expandedGroups: allGroupIds
    }));
  }

  /**
   * Collapse all groups
   */
  collapseAllGroups(): void {
    this._state.update(state => ({
      ...state,
      expandedGroups: []
    }));
  }

  /**
   * Set search query for filtering
   * @param query - Search query string
   */
  setSearchQuery(query: string): void {
    this._state.update(state => ({
      ...state,
      searchQuery: query
    }));
  }

  /**
   * Clear search query
   */
  clearSearch(): void {
    this._state.update(state => ({
      ...state,
      searchQuery: ''
    }));
  }

  /**
   * Reset menu to initial state
   */
  reset(): void {
    this._state.set(initialMenuState);
    localStorage.removeItem('menu_role');
    localStorage.removeItem('menu_expanded');
    localStorage.removeItem('menu_active_item');
  }

  // ============================================================================
  // Menu Item Helpers
  // ============================================================================

  /**
   * Find menu item by ID
   * @param itemId - Menu item ID
   * @returns Menu item or undefined
   */
  findMenuItemById(itemId: string): MenuItem | undefined {
    return findMenuItemById(this._state().menuItems, itemId);
  }

  /**
   * Check if item has parent
   * @param item - Menu item to check
   * @returns Whether item has a parent
   */
  hasParent(item: MenuItem): boolean {
    return !!this.findParentItem(item.id);
  }

  /**
   * Find parent of a menu item
   * @param itemId - Menu item ID
   * @returns Parent menu item or undefined
   */
  findParentItem(itemId: string): MenuItem | undefined {
    const items = this._state().menuItems;
    
    for (const item of items) {
      if (item.children?.some(child => child.id === itemId)) {
        return item;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.children?.some(grandchild => grandchild.id === itemId)) {
            return child;
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * Get children of a menu item
   * @param itemId - Menu item ID
   * @returns Array of child menu items
   */
  getChildren(itemId: string): MenuItem[] {
    const item = this.findMenuItemById(itemId);
    return item?.children || [];
  }

  /**
   * Check if item has children
   * @param itemId - Menu item ID
   * @returns Whether item has children
   */
  hasChildren(itemId: string): boolean {
    const item = this.findMenuItemById(itemId);
    return (item?.children?.length || 0) > 0;
  }

  /**
   * Check if group is expanded
   * @param groupId - Group ID to check
   * @returns Whether group is expanded
   */
  isGroupExpanded(groupId: string): boolean {
    return this._state().expandedGroups.includes(groupId);
  }

  /**
   * Check if item is active
   * @param itemId - Menu item ID to check
   * @returns Whether item is active
   */
  isItemActive(itemId: string): boolean {
    return this._state().activeItemId === itemId;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Get first route from menu items
   */
  private getFirstRoute(items: MenuItem[]): string | null {
    for (const item of items) {
      if (item.route) return item.route;
      if (item.children) {
        const childRoute = this.getFirstRoute(item.children);
        if (childRoute) return childRoute;
      }
    }
    return null;
  }

  /**
   * Flatten menu items recursively
   */
  private flattenMenuItems(
    items: MenuItem[], 
    depth = 0, 
    parentIds: string[] = [],
    pathLabels: string[] = []
  ): FlattenedMenuItem[] {
    const result: FlattenedMenuItem[] = [];
    
    for (const item of items) {
      const currentPathLabels = [...pathLabels, item.label];
      
      result.push({
        ...item,
        depth,
        parentIds: [...parentIds],
        pathLabels: currentPathLabels
      });
      
      if (item.children) {
        result.push(...this.flattenMenuItems(
          item.children,
          depth + 1,
          [...parentIds, item.id],
          currentPathLabels
        ));
      }
    }
    
    return result;
  }

  /**
   * Build breadcrumb for a menu item
   */
  private buildBreadcrumb(item: MenuItem): MenuBreadcrumb[] {
    const breadcrumb: MenuBreadcrumb[] = [];
    
    // Find item in flattened list to get path
    const flattened = this.flattenedMenuItems();
    const flatItem = flattened.find(f => f.id === item.id);
    
    if (flatItem && flatItem.parentIds.length > 0) {
      // Add parent items
      for (const parentId of flatItem.parentIds) {
        const parent = this.findMenuItemById(parentId);
        if (parent) {
          breadcrumb.push({
            label: parent.label,
            route: parent.route,
            icon: parent.icon
          });
        }
      }
    }
    
    // Add current item
    breadcrumb.push({
      label: item.label,
      route: item.route,
      icon: item.icon,
      active: true
    });
    
    return breadcrumb;
  }

  /**
   * Filter menu items by search query
   */
  private filterMenuItemsByQuery(items: MenuItem[], query: string): MenuItem[] {
    return items.filter(item => {
      const matchesLabel = item.label.toLowerCase().includes(query);
      const matchesTooltip = item.tooltip?.toLowerCase().includes(query) || false;
      const matchesChildren = item.children?.some(child =>
        this.filterMenuItemsByQuery([child], query).length > 0
      ) || false;
      
      return matchesLabel || matchesTooltip || matchesChildren;
    });
  }

  /**
   * Get all group IDs
   */
  private getAllGroupIds(): string[] {
    const items = this._state().menuItems;
    const ids: string[] = [];
    
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        ids.push(item.id);
      }
    }
    
    return ids;
  }
}
