/**
 * @fileoverview Menu Service Tests
 * @description Unit tests for MenuService
 * @version 1.0.0
 */

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuService } from './menu.service';
import { Role, MenuItem } from '../models/menu.model';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [MenuService]
    });

    service = TestBed.inject(MenuService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      expect(service.currentRole()).toBeNull();
      expect(service.menuItems()).toEqual([]);
      expect(service.isExpanded()).toBe(true);
      expect(service.activeItemId()).toBeNull();
      expect(service.mobileOpen()).toBe(false);
    });

    it('should initialize from localStorage', () => {
      // Set up localStorage
      localStorage.setItem('menu_role', 'FE');
      localStorage.setItem('menu_expanded', 'false');
      localStorage.setItem('menu_active_item', 'fe-dashboard');

      // Create new service instance
      const newService = TestBed.inject(MenuService);

      expect(newService.currentRole()).toBe('FE');
      expect(newService.isExpanded()).toBe(false);
      expect(newService.activeItemId()).toBe('fe-dashboard');
    });
  });

  describe('Role Management', () => {
    it('should set role and load menu items', () => {
      service.setRole('FE');

      expect(service.currentRole()).toBe('FE');
      expect(service.menuItems().length).toBeGreaterThan(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should set role for all valid roles', () => {
      const roles: Role[] = ['FE', 'BE', 'QC', 'BA', 'PM', 'ADMIN'];

      roles.forEach(role => {
        service.setRole(role);
        expect(service.currentRole()).toBe(role);
        expect(service.menuItems().length).toBeGreaterThan(0);
      });
    });

    it('should persist role to localStorage', () => {
      service.setRole('BE');
      expect(localStorage.getItem('menu_role')).toBe('BE');
    });

    it('should clear role and reset state', () => {
      service.setRole('FE');
      service.clearRole();

      expect(service.currentRole()).toBeNull();
      expect(service.menuItems()).toEqual([]);
      expect(localStorage.getItem('menu_role')).toBeNull();
    });
  });

  describe('Active Item Management', () => {
    beforeEach(() => {
      service.setRole('FE');
    });

    it('should set active item', () => {
      service.setActiveItem('fe-dashboard');
      expect(service.activeItemId()).toBe('fe-dashboard');
    });

    it('should find menu item by ID', () => {
      const item = service.findMenuItemById('fe-dashboard');
      expect(item).toBeTruthy();
      expect(item?.id).toBe('fe-dashboard');
    });

    it('should return undefined for non-existent item', () => {
      const item = service.findMenuItemById('non-existent');
      expect(item).toBeUndefined();
    });

    it('should check if item is active', () => {
      service.setActiveItem('fe-dashboard');
      expect(service.isItemActive('fe-dashboard')).toBe(true);
      expect(service.isItemActive('fe-components')).toBe(false);
    });
  });

  describe('Group Expansion', () => {
    beforeEach(() => {
      service.setRole('FE');
    });

    it('should toggle group expansion', () => {
      const groupId = 'fe-components';
      
      expect(service.isGroupExpanded(groupId)).toBe(false);
      
      service.toggleGroup(groupId);
      expect(service.isGroupExpanded(groupId)).toBe(true);
      
      service.toggleGroup(groupId);
      expect(service.isGroupExpanded(groupId)).toBe(false);
    });

    it('should expand group', () => {
      service.expandGroup('fe-components');
      expect(service.isGroupExpanded('fe-components')).toBe(true);
    });

    it('should collapse group', () => {
      service.expandGroup('fe-components');
      service.collapseGroup('fe-components');
      expect(service.isGroupExpanded('fe-components')).toBe(false);
    });

    it('should expand all groups', () => {
      service.expandAllGroups();
      const expanded = service.expandedGroups();
      expect(expanded.length).toBeGreaterThan(0);
    });

    it('should collapse all groups', () => {
      service.expandAllGroups();
      service.collapseAllGroups();
      expect(service.expandedGroups()).toEqual([]);
    });
  });

  describe('Sidebar State', () => {
    it('should toggle sidebar expansion', () => {
      expect(service.isExpanded()).toBe(true);
      
      service.toggleSidebar();
      expect(service.isExpanded()).toBe(false);
      
      service.toggleSidebar();
      expect(service.isExpanded()).toBe(true);
    });

    it('should set expanded state', () => {
      service.setExpanded(false);
      expect(service.isExpanded()).toBe(false);
      
      service.setExpanded(true);
      expect(service.isExpanded()).toBe(true);
    });
  });

  describe('Mobile Sidebar', () => {
    it('should toggle mobile sidebar', () => {
      expect(service.mobileOpen()).toBe(false);
      
      service.toggleMobileSidebar();
      expect(service.mobileOpen()).toBe(true);
      
      service.toggleMobileSidebar();
      expect(service.mobileOpen()).toBe(false);
    });

    it('should set mobile open state', () => {
      service.setMobileOpen(true);
      expect(service.mobileOpen()).toBe(true);
      
      service.setMobileOpen(false);
      expect(service.mobileOpen()).toBe(false);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      service.setRole('FE');
    });

    it('should set search query', () => {
      service.setSearchQuery('dashboard');
      expect(service.searchQuery()).toBe('dashboard');
    });

    it('should clear search query', () => {
      service.setSearchQuery('dashboard');
      service.clearSearch();
      expect(service.searchQuery()).toBe('');
    });

    it('should filter menu items based on search', () => {
      service.setSearchQuery('dashboard');
      const filtered = service.filteredMenuItems();
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.some(item => item.label.toLowerCase().includes('dashboard'))).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      service.setRole('FE');
    });

    it('should compute menu sections', () => {
      const sections = service.menuSections();
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should compute flattened menu items', () => {
      const flattened = service.flattenedMenuItems();
      expect(flattened.length).toBeGreaterThan(service.menuItems().length);
    });

    it('should compute total menu item count', () => {
      expect(service.totalMenuItemCount()).toBeGreaterThan(0);
    });

    it('should compute available roles', () => {
      expect(service.availableRoles()).toEqual(['FE', 'BE', 'QC', 'BA', 'PM', 'ADMIN']);
    });
  });

  describe('Item Hierarchy', () => {
    beforeEach(() => {
      service.setRole('FE');
    });

    it('should find parent item', () => {
      // fe-components has children
      const parent = service.findParentItem('fe-ui-library');
      expect(parent).toBeTruthy();
      expect(parent?.id).toBe('fe-components');
    });

    it('should check if item has children', () => {
      expect(service.hasChildren('fe-components')).toBe(true);
      expect(service.hasChildren('fe-dashboard')).toBe(false);
    });

    it('should get children of an item', () => {
      const children = service.getChildren('fe-components');
      expect(children.length).toBeGreaterThan(0);
    });

    it('should check if item has parent', () => {
      const item = service.findMenuItemById('fe-ui-library');
      expect(item).toBeTruthy();
      if (item) {
        expect(service.hasParent(item)).toBe(true);
      }
    });
  });

  describe('Breadcrumb', () => {
    beforeEach(() => {
      service.setRole('FE');
    });

    it('should compute breadcrumb for active item', () => {
      service.setActiveItem('fe-ui-library');
      const breadcrumb = service.breadcrumb();
      expect(breadcrumb.length).toBeGreaterThan(0);
    });

    it('should return empty breadcrumb when no active item', () => {
      service.setActiveItem('');
      expect(service.breadcrumb()).toEqual([]);
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      service.setRole('FE');
      service.setActiveItem('fe-dashboard');
      service.setSearchQuery('test');
      
      service.reset();

      expect(service.currentRole()).toBeNull();
      expect(service.menuItems()).toEqual([]);
      expect(service.activeItemId()).toBeNull();
      expect(service.searchQuery()).toBe('');
      expect(service.isExpanded()).toBe(true);
    });
  });
});
