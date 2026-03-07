import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService, User } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication State', () => {
    it('should initialize with unauthenticated state', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.token()).toBeNull();
    });

    it('should set authentication state', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      // Simulate login
      service['setAuth'](mockUser, 'mock-token');

      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()).toEqual(mockUser);
      expect(service.token()).toBe('mock-token');
    });

    it('should load auth from localStorage', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      localStorage.setItem('auth_token', 'stored-token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      // Create new service instance to trigger loadStoredAuth
      const newService = TestBed.inject(AuthService);

      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.user()).toEqual(mockUser);
      expect(newService.token()).toBe('stored-token');
    });
  });

  describe('Role Selection', () => {
    it('should select role and navigate', () => {
      const role = 'FE';
      
      service.selectRole(role);

      expect(service.selectedRole()).toBe(role);
      expect(localStorage.getItem('selected_role')).toBe(role);
    });
  });

  describe('Logout', () => {
    it('should clear auth state on logout', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      // Login first
      service['setAuth'](mockUser, 'mock-token');
      service.selectRole('FE');

      // Then logout
      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.token()).toBeNull();
      expect(service.selectedRole()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('selected_role')).toBeNull();
    });
  });
});
