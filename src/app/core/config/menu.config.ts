/**
 * @fileoverview Menu Configuration
 * @description Role-based menu definitions for all user roles
 * @version 1.0.0
 */

import { MenuItem, Role, RoleMenuConfig, MenuSection } from '../models/menu.model';

/** ============================================
 * FE (Frontend Developer) Menu Configuration
 * ============================================ */
const feMenu: MenuItem[] = [
  {
    id: 'fe-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/fe/dashboard',
    roles: ['FE'],
    order: 1
  },
  {
    id: 'fe-components',
    label: 'Components',
    icon: 'widgets',
    roles: ['FE'],
    order: 2,
    children: [
      {
        id: 'fe-ui-library',
        label: 'UI Library',
        icon: 'palette',
        route: '/fe/components/ui-library',
        roles: ['FE'],
        order: 1
      },
      {
        id: 'fe-form-controls',
        label: 'Form Controls',
        icon: 'input',
        route: '/fe/components/forms',
        roles: ['FE'],
        order: 2
      },
      {
        id: 'fe-data-tables',
        label: 'Data Tables',
        icon: 'table_chart',
        route: '/fe/components/tables',
        roles: ['FE'],
        order: 3
      },
      {
        id: 'fe-charts',
        label: 'Charts & Graphs',
        icon: 'insert_chart',
        route: '/fe/components/charts',
        roles: ['FE'],
        order: 4
      }
    ]
  },
  {
    id: 'fe-layouts',
    label: 'Layouts',
    icon: 'view_quilt',
    route: '/fe/layouts',
    roles: ['FE'],
    order: 3
  },
  {
    id: 'fe-state',
    label: 'State Management',
    icon: 'storage',
    route: '/fe/state',
    roles: ['FE'],
    order: 4
  },
  {
    id: 'fe-api',
    label: 'API Integration',
    icon: 'api',
    route: '/fe/api',
    roles: ['FE'],
    order: 5,
    badge: {
      color: 'accent',
      style: 'dot'
    }
  },
  {
    id: 'fe-styling',
    label: 'Styling & Themes',
    icon: 'style',
    route: '/fe/styling',
    roles: ['FE'],
    order: 6
  },
  {
    id: 'fe-testing',
    label: 'Testing',
    icon: 'bug_report',
    route: '/fe/testing',
    roles: ['FE'],
    order: 7
  }
];

/** ============================================
 * BE (Backend Developer) Menu Configuration
 * ============================================ */
const beMenu: MenuItem[] = [
  {
    id: 'be-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/be/dashboard',
    roles: ['BE'],
    order: 1
  },
  {
    id: 'be-api',
    label: 'API Management',
    icon: 'api',
    roles: ['BE'],
    order: 2,
    children: [
      {
        id: 'be-endpoints',
        label: 'Endpoints',
        icon: 'http',
        route: '/be/api/endpoints',
        roles: ['BE'],
        order: 1
      },
      {
        id: 'be-middleware',
        label: 'Middleware',
        icon: 'settings_ethernet',
        route: '/be/api/middleware',
        roles: ['BE'],
        order: 2
      },
      {
        id: 'be-security',
        label: 'Security',
        icon: 'security',
        route: '/be/api/security',
        roles: ['BE'],
        order: 3
      },
      {
        id: 'be-documentation',
        label: 'API Documentation',
        icon: 'description',
        route: '/be/api/docs',
        roles: ['BE'],
        order: 4
      }
    ]
  },
  {
    id: 'be-database',
    label: 'Database',
    icon: 'storage',
    roles: ['BE'],
    order: 3,
    children: [
      {
        id: 'be-schema',
        label: 'Schema Design',
        icon: 'schema',
        route: '/be/database/schema',
        roles: ['BE'],
        order: 1
      },
      {
        id: 'be-queries',
        label: 'Query Builder',
        icon: 'code',
        route: '/be/database/queries',
        roles: ['BE'],
        order: 2
      },
      {
        id: 'be-migrations',
        label: 'Migrations',
        icon: 'sync',
        route: '/be/database/migrations',
        roles: ['BE'],
        order: 3
      }
    ]
  },
  {
    id: 'be-microservices',
    label: 'Microservices',
    icon: 'account_tree',
    route: '/be/microservices',
    roles: ['BE'],
    order: 4
  },
  {
    id: 'be-testing',
    label: 'Testing',
    icon: 'science',
    route: '/be/testing',
    roles: ['BE'],
    order: 5
  },
  {
    id: 'be-logs',
    label: 'Logs & Monitoring',
    icon: 'monitoring',
    route: '/be/logs',
    roles: ['BE'],
    order: 6,
    badge: {
      text: '3',
      color: 'warn',
      style: 'number'
    }
  }
];

/** ============================================
 * QC (Quality Control) Menu Configuration
 * ============================================ */
const qcMenu: MenuItem[] = [
  {
    id: 'qc-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/qc/dashboard',
    roles: ['QC'],
    order: 1,
    badge: {
      text: '5',
      color: 'warn',
      style: 'number'
    }
  },
  {
    id: 'qc-test-plans',
    label: 'Test Plans',
    icon: 'assignment',
    route: '/qc/test-plans',
    roles: ['QC'],
    order: 2
  },
  {
    id: 'qc-test-cases',
    label: 'Test Cases',
    icon: 'checklist',
    route: '/qc/test-cases',
    roles: ['QC'],
    order: 3
  },
  {
    id: 'qc-execution',
    label: 'Test Execution',
    icon: 'play_circle',
    route: '/qc/execution',
    roles: ['QC'],
    order: 4,
    badge: {
      color: 'accent',
      style: 'dot'
    }
  },
  {
    id: 'qc-bugs',
    label: 'Bug Reports',
    icon: 'bug_report',
    route: '/qc/bugs',
    roles: ['QC'],
    order: 5,
    badge: {
      text: '12',
      color: 'warn',
      style: 'number'
    }
  },
  {
    id: 'qc-reports',
    label: 'Test Reports',
    icon: 'assessment',
    roles: ['QC'],
    order: 6,
    children: [
      {
        id: 'qc-coverage',
        label: 'Coverage Reports',
        icon: 'pie_chart',
        route: '/qc/reports/coverage',
        roles: ['QC'],
        order: 1
      },
      {
        id: 'qc-performance',
        label: 'Performance',
        icon: 'speed',
        route: '/qc/reports/performance',
        roles: ['QC'],
        order: 2
      },
      {
        id: 'qc-automation',
        label: 'Automation Stats',
        icon: 'auto_graph',
        route: '/qc/reports/automation',
        roles: ['QC'],
        order: 3
      }
    ]
  },
  {
    id: 'qc-environments',
    label: 'Environments',
    icon: 'computer',
    route: '/qc/environments',
    roles: ['QC'],
    order: 7
  }
];

/** ============================================
 * BA (Business Analyst) Menu Configuration
 * ============================================ */
const baMenu: MenuItem[] = [
  {
    id: 'ba-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/ba/dashboard',
    roles: ['BA'],
    order: 1
  },
  {
    id: 'ba-requirements',
    label: 'Requirements',
    icon: 'list_alt',
    route: '/ba/requirements',
    roles: ['BA'],
    order: 2,
    badge: {
      text: 'New',
      color: 'primary',
      style: 'text'
    }
  },
  {
    id: 'ba-user-stories',
    label: 'User Stories',
    icon: 'person_outline',
    route: '/ba/user-stories',
    roles: ['BA'],
    order: 3
  },
  {
    id: 'ba-process-flows',
    label: 'Process Flows',
    icon: 'account_tree',
    route: '/ba/process-flows',
    roles: ['BA'],
    order: 4
  },
  {
    id: 'ba-wireframes',
    label: 'Wireframes',
    icon: 'web',
    route: '/ba/wireframes',
    roles: ['BA'],
    order: 5
  },
  {
    id: 'ba-documentation',
    label: 'Documentation',
    icon: 'menu_book',
    roles: ['BA'],
    order: 6,
    children: [
      {
        id: 'ba-business-rules',
        label: 'Business Rules',
        icon: 'gavel',
        route: '/ba/docs/business-rules',
        roles: ['BA'],
        order: 1
      },
      {
        id: 'ba-glossary',
        label: 'Glossary',
        icon: 'book',
        route: '/ba/docs/glossary',
        roles: ['BA'],
        order: 2
      },
      {
        id: 'ba-templates',
        label: 'Templates',
        icon: 'description',
        route: '/ba/docs/templates',
        roles: ['BA'],
        order: 3
      }
    ]
  },
  {
    id: 'ba-stakeholders',
    label: 'Stakeholders',
    icon: 'groups',
    route: '/ba/stakeholders',
    roles: ['BA'],
    order: 7
  }
];

/** ============================================
 * PM (Project Manager) Menu Configuration
 * ============================================ */
const pmMenu: MenuItem[] = [
  {
    id: 'pm-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/pm/dashboard',
    roles: ['PM'],
    order: 1
  },
  {
    id: 'pm-overview',
    label: 'Project Overview',
    icon: 'visibility',
    route: '/pm/overview',
    roles: ['PM'],
    order: 2
  },
  {
    id: 'pm-sprint',
    label: 'Sprint Planning',
    icon: 'sprint',
    roles: ['PM'],
    order: 3,
    children: [
      {
        id: 'pm-backlog',
        label: 'Backlog',
        icon: 'inventory_2',
        route: '/pm/sprint/backlog',
        roles: ['PM'],
        order: 1
      },
      {
        id: 'pm-board',
        label: 'Kanban Board',
        icon: 'view_kanban',
        route: '/pm/sprint/board',
        roles: ['PM'],
        order: 2
      },
      {
        id: 'pm-retrospective',
        label: 'Retrospectives',
        icon: 'replay',
        route: '/pm/sprint/retrospective',
        roles: ['PM'],
        order: 3
      }
    ]
  },
  {
    id: 'pm-team',
    label: 'Team Management',
    icon: 'people',
    route: '/pm/team',
    roles: ['PM'],
    order: 4
  },
  {
    id: 'pm-timeline',
    label: 'Timeline & Gantt',
    icon: 'calendar_month',
    route: '/pm/timeline',
    roles: ['PM'],
    order: 5
  },
  {
    id: 'pm-reports',
    label: 'Reports & Analytics',
    icon: 'insights',
    roles: ['PM'],
    order: 6,
    children: [
      {
        id: 'pm-velocity',
        label: 'Velocity',
        icon: 'speed',
        route: '/pm/reports/velocity',
        roles: ['PM'],
        order: 1
      },
      {
        id: 'pm-burndown',
        label: 'Burndown',
        icon: 'trending_down',
        route: '/pm/reports/burndown',
        roles: ['PM'],
        order: 2
      },
      {
        id: 'pm-risk',
        label: 'Risk Analysis',
        icon: 'warning',
        route: '/pm/reports/risk',
        roles: ['PM'],
        order: 3
      }
    ]
  },
  {
    id: 'pm-budget',
    label: 'Budget & Resources',
    icon: 'account_balance',
    route: '/pm/budget',
    roles: ['PM'],
    order: 7
  },
  {
    id: 'pm-settings',
    label: 'Project Settings',
    icon: 'settings',
    route: '/pm/settings',
    roles: ['PM'],
    order: 8
  }
];

/** ============================================
 * ADMIN Menu Configuration (Super User)
 * ============================================ */
const adminMenu: MenuItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    icon: 'admin_panel_settings',
    route: '/admin/dashboard',
    roles: ['ADMIN'],
    order: 1
  },
  {
    id: 'admin-users',
    label: 'User Management',
    icon: 'manage_accounts',
    route: '/admin/users',
    roles: ['ADMIN'],
    order: 2
  },
  {
    id: 'admin-roles',
    label: 'Roles & Permissions',
    icon: 'security',
    route: '/admin/roles',
    roles: ['ADMIN'],
    order: 3
  },
  {
    id: 'admin-system',
    label: 'System Settings',
    icon: 'settings_applications',
    roles: ['ADMIN'],
    order: 4,
    children: [
      {
        id: 'admin-config',
        label: 'Configuration',
        icon: 'tune',
        route: '/admin/system/config',
        roles: ['ADMIN'],
        order: 1
      },
      {
        id: 'admin-logs',
        label: 'System Logs',
        icon: 'receipt_long',
        route: '/admin/system/logs',
        roles: ['ADMIN'],
        order: 2
      },
      {
        id: 'admin-backup',
        label: 'Backup & Restore',
        icon: 'backup',
        route: '/admin/system/backup',
        roles: ['ADMIN'],
        order: 3
      }
    ]
  }
];

/** ============================================
 * Combined Menu Configuration
 * ============================================ */
export const MENU_CONFIG: RoleMenuConfig = {
  FE: feMenu,
  BE: beMenu,
  QC: qcMenu,
  BA: baMenu,
  PM: pmMenu,
  ADMIN: adminMenu
};

/** ============================================
 * Menu Sections by Role (Alternative Structure)
 * ============================================ */
export const MENU_SECTIONS: Record<Role, MenuSection[]> = {
  FE: [
    { title: 'Dashboard', icon: 'dashboard', items: feMenu.filter(m => m.id.includes('dashboard')), order: 1 },
    { title: 'Phát Triển UI', icon: 'code', items: feMenu.filter(m => m.id.includes('component') || m.id.includes('layout') || m.id.includes('form') || m.id.includes('page')), order: 2 },
    { title: 'State Management', icon: 'storage', items: feMenu.filter(m => m.id.includes('state')), order: 3 },
    { title: 'Tích Hợp', icon: 'api', items: feMenu.filter(m => m.id.includes('api')), order: 4 },
    { title: 'Testing', icon: 'bug_report', items: feMenu.filter(m => m.id.includes('testing') || m.id.includes('test')), order: 5 },
    { title: 'Design System', icon: 'style', items: feMenu.filter(m => m.id.includes('styling')), order: 6 }
  ],
  BE: [
    { title: 'Dashboard', icon: 'dashboard', items: beMenu.filter(m => m.id.includes('dashboard')), order: 1 },
    { title: 'API Management', icon: 'api', items: beMenu.filter(m => m.id.includes('api')), order: 2 },
    { title: 'Database', icon: 'storage', items: beMenu.filter(m => m.id.includes('database')), order: 3 },
    { title: 'Microservices', icon: 'account_tree', items: beMenu.filter(m => m.id.includes('microservices')), order: 4 },
    { title: 'Testing', icon: 'science', items: beMenu.filter(m => m.id.includes('testing')), order: 5 },
    { title: 'Monitoring', icon: 'monitoring', items: beMenu.filter(m => m.id.includes('logs')), order: 6 }
  ],
  QC: [
    { title: 'Dashboard', icon: 'dashboard', items: qcMenu.filter(m => m.id.includes('dashboard')), order: 1 },
    { title: 'Test Plans', icon: 'assignment', items: qcMenu.filter(m => m.id.includes('test-plans')), order: 2 },
    { title: 'Test Cases', icon: 'checklist', items: qcMenu.filter(m => m.id.includes('test-cases')), order: 3 },
    { title: 'Execution', icon: 'play_circle', items: qcMenu.filter(m => m.id.includes('execution')), order: 4 },
    { title: 'Bug Reports', icon: 'bug_report', items: qcMenu.filter(m => m.id.includes('bugs')), order: 5 },
    { title: 'Reports', icon: 'assessment', items: qcMenu.filter(m => m.id.includes('reports') || m.id.includes('environment')), order: 6 }
  ],
  BA: [
    { title: 'Dashboard', icon: 'dashboard', items: baMenu.filter(m => m.id.includes('dashboard')), order: 1 },
    { title: 'Requirements', icon: 'list_alt', items: baMenu.filter(m => m.id.includes('requirements') || m.id.includes('user-stories')), order: 2 },
    { title: 'Design', icon: 'web', items: baMenu.filter(m => m.id.includes('wireframes') || m.id.includes('process')), order: 3 },
    { title: 'Documentation', icon: 'menu_book', items: baMenu.filter(m => m.id.includes('documentation') || m.id.includes('docs')), order: 4 },
    { title: 'Stakeholders', icon: 'groups', items: baMenu.filter(m => m.id.includes('stakeholders')), order: 5 }
  ],
  PM: [
    { title: 'Dashboard', icon: 'dashboard', items: pmMenu.filter(m => m.id.includes('dashboard')), order: 1 },
    { title: 'Project Overview', icon: 'visibility', items: pmMenu.filter(m => m.id.includes('overview')), order: 2 },
    { title: 'Sprint', icon: 'sprint', items: pmMenu.filter(m => m.id.includes('sprint')), order: 3 },
    { title: 'Team', icon: 'people', items: pmMenu.filter(m => m.id.includes('team')), order: 4 },
    { title: 'Timeline', icon: 'calendar_month', items: pmMenu.filter(m => m.id.includes('timeline')), order: 5 },
    { title: 'Reports', icon: 'insights', items: pmMenu.filter(m => m.id.includes('reports')), order: 6 },
    { title: 'Settings', icon: 'settings', items: pmMenu.filter(m => m.id.includes('settings') || m.id.includes('budget')), order: 7 }
  ],
  ADMIN: [
    { title: 'Dashboard', icon: 'admin_panel_settings', items: adminMenu.filter(m => m.id.includes('dashboard')), order: 1 },
    { title: 'User Management', icon: 'manage_accounts', items: adminMenu.filter(m => m.id.includes('users')), order: 2 },
    { title: 'Security', icon: 'security', items: adminMenu.filter(m => m.id.includes('roles')), order: 3 },
    { title: 'System', icon: 'settings_applications', items: adminMenu.filter(m => m.id.includes('system')), order: 4 }
  ]
};

/** ============================================
 * Menu Utility Functions
 * ============================================ */

/**
 * Get menu items for a specific role
 */
export function getMenuByRole(role: Role): MenuItem[] {
  return MENU_CONFIG[role] || [];
}

/**
 * Get all available menu items flattened
 */
export function getAllMenuItems(): MenuItem[] {
  return Object.values(MENU_CONFIG).flat();
}

/**
 * Find menu item by ID recursively
 */
export function findMenuItemById(
  items: MenuItem[],
  id: string
): MenuItem | undefined {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Get all routes for a role
 */
export function getRoutesByRole(role: Role): string[] {
  const routes: string[] = [];
  const items = getMenuByRole(role);

  function extractRoutes(menuItems: MenuItem[]): void {
    menuItems.forEach(item => {
      if (item.route) {
        routes.push(item.route);
      }
      if (item.children) {
        extractRoutes(item.children);
      }
    });
  }

  extractRoutes(items);
  return routes;
}

/**
 * Check if menu item is accessible for role
 */
export function isMenuItemAccessible(item: MenuItem, role: Role): boolean {
  return item.roles.includes(role) || item.roles.includes('ADMIN');
}
