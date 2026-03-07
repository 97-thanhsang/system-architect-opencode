/**
 * @fileoverview Menu Model Definitions
 * @description Type definitions for role-based menu system
 * @version 1.0.0
 */

/** ============================================
 * Type Definitions
 * ============================================ */

/** Available roles in the system */
export type Role = 'FE' | 'BE' | 'QC' | 'BA' | 'PM' | 'ADMIN';

/** All available roles array */
export const ALL_ROLES: Role[] = ['FE', 'BE', 'QC', 'BA', 'PM', 'ADMIN'];

/** Badge configuration for menu items */
export interface MenuBadge {
  /** Badge text content */
  text?: string;
  /** Badge color theme */
  color: 'primary' | 'accent' | 'warn';
  /** Badge style */
  style?: 'dot' | 'number' | 'text';
}

/** Menu item interface with full hierarchy support */
export interface MenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Material icon name */
  icon?: string;
  /** Router link path */
  route?: string;
  /** External link URL */
  externalLink?: string;
  /** Required roles to view this menu */
  roles: Role[];
  /** Nested child menu items */
  children?: MenuItem[];
  /** Sort order (lower = higher priority) */
  order: number;
  /** Badge configuration */
  badge?: MenuBadge;
  /** Disabled state */
  disabled?: boolean;
  /** Whether to open link in new tab */
  openInNewTab?: boolean;
  /** Custom CSS class */
  cssClass?: string;
  /** Tooltip text */
  tooltip?: string;
  /** Whether this menu requires specific permission */
  permission?: string;
}

/** Menu section interface for organizing items by category */
export interface MenuSection {
  /** Section title */
  title: string;
  /** Section icon */
  icon?: string;
  /** Menu items in this section */
  items: MenuItem[];
  /** Sort order */
  order: number;
  /** Whether section is collapsed */
  collapsed?: boolean;
  /** Roles that can access this section */
  roles?: Role[];
}

/** Menu state for reactive signals */
export interface MenuState {
  /** Currently active role */
  currentRole: Role | null;
  /** All available menu items for current role */
  menuItems: MenuItem[];
  /** Sidebar expanded state */
  isExpanded: boolean;
  /** Currently active menu item ID */
  activeItemId: string | null;
  /** Expanded menu groups (for accordion behavior) */
  expandedGroups: string[];
  /** Mobile sidebar visibility */
  mobileOpen: boolean;
  /** Search query for filtering */
  searchQuery?: string;
}

/** Initial menu state */
export const initialMenuState: MenuState = {
  currentRole: null,
  menuItems: [],
  isExpanded: true,
  activeItemId: null,
  expandedGroups: [],
  mobileOpen: false,
  searchQuery: ''
};

/** Menu configuration for each role */
export type RoleMenuConfig = Record<Role, MenuItem[]>;

/** Menu configuration with sections for each role */
export type RoleMenuSectionConfig = Record<Role, MenuSection[]>;

/** Menu filter options */
export interface MenuFilterOptions {
  /** Filter by search term */
  searchTerm?: string;
  /** Include disabled items */
  includeDisabled?: boolean;
  /** Maximum depth to traverse */
  maxDepth?: number;
  /** Filter by role */
  role?: Role;
}

/** Menu group interface for organizing items */
export interface MenuGroup {
  /** Group identifier */
  id: string;
  /** Group display label */
  label: string;
  /** Icon for the group */
  icon?: string;
  /** Menu items in this group */
  items: MenuItem[];
  /** Sort order */
  order: number;
  /** Whether group is collapsible */
  collapsible?: boolean;
}

/** Breadcrumb item for navigation */
export interface MenuBreadcrumb {
  /** Item label */
  label: string;
  /** Router link */
  route?: string;
  /** Whether item is active */
  active?: boolean;
  /** Icon name */
  icon?: string;
}

/** Flattened menu item with hierarchy info */
export interface FlattenedMenuItem extends MenuItem {
  /** Depth level in hierarchy (0 = root) */
  depth: number;
  /** Parent item IDs */
  parentIds: string[];
  /** Full path labels */
  pathLabels: string[];
}

/** Sidebar configuration */
export interface SidebarConfig {
  /** Sidebar width in pixels */
  width: number;
  /** Collapsed width in pixels */
  collapsedWidth: number;
  /** Whether sidebar is collapsible */
  collapsible: boolean;
  /** Default expanded state */
  defaultExpanded: boolean;
  /** Show role selector */
  showRoleSelector: boolean;
  /** Show user profile */
  showUserProfile: boolean;
  /** Breakpoint for mobile view */
  mobileBreakpoint: number;
  /** Show section dividers */
  showSectionDividers?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
}

/** Default sidebar configuration */
export const defaultSidebarConfig: SidebarConfig = {
  width: 280,
  collapsedWidth: 72,
  collapsible: true,
  defaultExpanded: true,
  showRoleSelector: true,
  showUserProfile: true,
  mobileBreakpoint: 768,
  showSectionDividers: true,
  animationDuration: 300
};

/** Menu permissions */
export interface MenuPermission {
  /** Permission code */
  code: string;
  /** Permission name */
  name: string;
  /** Required roles */
  roles: Role[];
  /** Whether permission is active */
  active: boolean;
}
