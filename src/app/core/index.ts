/**
 * @fileoverview Core Module Index
 * @description Central export point for all core module types and services
 * @version 1.0.0
 */

// ============================================================================
// Model Exports
// ============================================================================

export type {
  // Role Types
  Role,
  // Menu Types
  MenuBadge,
  MenuItem,
  MenuSection,
  MenuState,
  MenuFilterOptions,
  MenuGroup,
  MenuBreadcrumb,
  FlattenedMenuItem,
  SidebarConfig,
  MenuPermission
} from './models/menu.model';

export {
  // Role Constants
  ALL_ROLES,
  initialMenuState,
  defaultSidebarConfig
} from './models/menu.model';

// ============================================================================
// Config Exports
// ============================================================================

export {
  // Menu Configurations
  MENU_CONFIG,
  MENU_SECTIONS,
  // Helper Functions
  getMenuByRole,
  getAllMenuItems,
  findMenuItemById,
  getRoutesByRole,
  isMenuItemAccessible
} from './config/menu.config';

// ============================================================================
// Service Exports
// ============================================================================

export { MenuService } from './services/menu.service';

// Re-export existing services
export { ApiService } from './services/api.service';
export { AuthService } from './auth/auth.service';
export { JiraAuthService } from './auth/jira-auth.service';
export { TokenStorageService } from './auth/token-storage.service';
