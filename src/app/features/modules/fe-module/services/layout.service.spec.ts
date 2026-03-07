import { TestBed } from '@angular/core/testing';
import { LayoutService, MenuItem } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayoutService]
    });

    service = TestBed.inject(LayoutService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with sidebar menu position', () => {
      expect(service.menuPosition()).toBe('sidebar');
    });

    it('should initialize with expanded sidebar', () => {
      expect(service.sidebarCollapsed()).toBe(false);
    });

    it('should initialize with light theme', () => {
      expect(service.theme()).toBe('light');
    });
  });

  describe('Menu Position', () => {
    it('should toggle menu position', () => {
      const initialPosition = service.menuPosition();
      
      service.toggleMenuPosition();

      expect(service.menuPosition()).toBe(initialPosition === 'sidebar' ? 'header' : 'sidebar');
    });

    it('should set menu position directly', () => {
      service.setMenuPosition('header');
      expect(service.menuPosition()).toBe('header');
    });

    it('should persist menu position to localStorage', () => {
      service.setMenuPosition('header');
      
      const stored = JSON.parse(localStorage.getItem('layout_preferences') || '{}');
      expect(stored.menuPosition).toBe('header');
    });
  });

  describe('Sidebar Toggle', () => {
    it('should toggle sidebar collapsed state', () => {
      const initialState = service.sidebarCollapsed();
      
      service.toggleSidebar();

      expect(service.sidebarCollapsed()).toBe(!initialState);
    });
  });

  describe('Menu Items', () => {
    it('should return menu items for role FE', () => {
      const items = service.getMenuItemsForRole('FE');
      
      expect(items.length).toBeGreaterThan(0);
      expect(items.some((item: MenuItem) => item.id === 'tasks')).toBe(true);
    });

    it('should return menu items for role BA', () => {
      const items = service.getMenuItemsForRole('BA');
      
      expect(items.length).toBeGreaterThan(0);
      expect(items.some((item: MenuItem) => item.id === 'projects')).toBe(true);
    });

    it('should filter out items not allowed for role', () => {
      const items = service.getMenuItemsForRole('QC');
      
      // QC should not see projects
      expect(items.some((item: MenuItem) => item.id === 'projects')).toBe(false);
    });
  });

  describe('Theme', () => {
    it('should toggle theme', () => {
      const initialTheme = service.theme();
      
      service.toggleTheme();

      expect(service.theme()).toBe(initialTheme === 'light' ? 'dark' : 'light');
    });
  });
});
