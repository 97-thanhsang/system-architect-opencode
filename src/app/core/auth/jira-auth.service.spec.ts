import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JiraAuthService, JiraUser, LoginCredentials } from './jira-auth.service';
import { TokenStorageService } from './token-storage.service';

describe('JiraAuthService', () => {
  let service: JiraAuthService;
  let httpMock: HttpTestingController;
  let tokenStorageSpy: jasmine.SpyObj<TokenStorageService>;

  const mockJiraUser: JiraUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    jiraUsername: 'testuser',
    jiraDisplayName: 'Test User',
    displayName: 'Test User',
    avatarUrl: null,
    roles: ['FE', 'BE']
  };

  const mockAuthResponse = {
    access_token: 'mock-access-token',
    user: mockJiraUser
  };

  beforeEach(() => {
    // Create spy for TokenStorageService
    tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'storeTokens',
      'clearTokens'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        JiraAuthService,
        { provide: TokenStorageService, useValue: tokenStorageSpy }
      ]
    });

    // Clear localStorage before creating service
    localStorage.clear();

    service = TestBed.inject(JiraAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with unauthenticated state', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
    });
  });

  describe('User State Restoration (Bug Fix)', () => {
    it('should restore user from localStorage on initialization', () => {
      // Setup: Store valid user data in localStorage
      localStorage.setItem('access_token', 'stored-token');
      localStorage.setItem('user', JSON.stringify(mockJiraUser));

      // Create new service instance to trigger loadStoredAuth
      const newService = TestBed.inject(JiraAuthService);

      // Assert: User should be restored
      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.user()).toEqual(mockJiraUser);
    });

    it('should handle missing token gracefully', () => {
      // Setup: Only store user, no token
      localStorage.setItem('user', JSON.stringify(mockJiraUser));

      // Create new service instance
      const newService = TestBed.inject(JiraAuthService);

      // Assert: Should remain unauthenticated
      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.user()).toBeNull();
    });

    it('should handle missing user data gracefully', () => {
      // Setup: Only store token, no user
      localStorage.setItem('access_token', 'stored-token');

      // Create new service instance
      const newService = TestBed.inject(JiraAuthService);

      // Assert: Should remain unauthenticated
      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.user()).toBeNull();
    });

    it('should handle corrupted user data by logging out', () => {
      // Setup: Store invalid JSON
      localStorage.setItem('access_token', 'stored-token');
      localStorage.setItem('user', 'invalid-json{{');

      spyOn(console, 'error');
      spyOn(console, 'log');

      // Create new service instance
      const newService = TestBed.inject(JiraAuthService);

      // Assert: Should be unauthenticated and localStorage cleared
      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.user()).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should validate user data structure before restoration', () => {
      // Setup: Store incomplete user object
      localStorage.setItem('access_token', 'stored-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com'
        // Missing required fields
      }));

      spyOn(console, 'error');
      spyOn(console, 'log');

      // Create new service instance
      const newService = TestBed.inject(JiraAuthService);

      // Assert: Should be unauthenticated due to validation failure
      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.user()).toBeNull();
    });

    it('should restore user with jiraDisplayName as fallback', () => {
      // Setup: User without displayName but with jiraDisplayName
      const userWithJiraDisplayName: JiraUser = {
        ...mockJiraUser,
        displayName: undefined as unknown as string,
        jiraDisplayName: 'Jira Display Name'
      };
      localStorage.setItem('access_token', 'stored-token');
      localStorage.setItem('user', JSON.stringify(userWithJiraDisplayName));

      // Create new service instance
      const newService = TestBed.inject(JiraAuthService);

      // Assert: Should restore successfully
      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.user()).toEqual(userWithJiraDisplayName);
    });

    it('should validate roles array contains strings', () => {
      // Setup: User with invalid roles
      localStorage.setItem('access_token', 'stored-token');
      localStorage.setItem('user', JSON.stringify({
        ...mockJiraUser,
        roles: [123, null, undefined] // Invalid roles
      }));

      spyOn(console, 'warn');
      spyOn(console, 'error');

      // Create new service instance
      const newService = TestBed.inject(JiraAuthService);

      // Assert: Should be unauthenticated due to validation failure
      expect(newService.isAuthenticated()).toBe(false);
      expect(newService.user()).toBeNull();
    });
  });

  describe('Login', () => {
    it('should authenticate user and store in localStorage', async () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123'
      };

      const loginPromise = service.login(credentials);

      // Mock HTTP response
      const req = httpMock.expectOne('/api/auth/jira/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);

      const result = await loginPromise;

      expect(result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()).toEqual(mockJiraUser);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();

      // Verify localStorage
      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockJiraUser));

      // Verify TokenStorageService integration
      expect(tokenStorageSpy.storeTokens).toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const loginPromise = service.login(credentials);

      // Mock HTTP error response
      const req = httpMock.expectOne('/api/auth/jira/login');
      req.flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' }
      );

      const result = await loginPromise;

      expect(result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe('Invalid credentials');
    });
  });

  describe('Logout', () => {
    it('should clear auth state from both services', () => {
      // Setup: Login first
      localStorage.setItem('access_token', 'stored-token');
      localStorage.setItem('user', JSON.stringify(mockJiraUser));
      
      // Create service and verify logged in
      const testService = TestBed.inject(JiraAuthService);
      expect(testService.isAuthenticated()).toBe(true);

      // Execute logout
      testService.logout();

      // Assert: State cleared
      expect(testService.isAuthenticated()).toBe(false);
      expect(testService.user()).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(tokenStorageSpy.clearTokens).toHaveBeenCalled();
    });
  });

  describe('Role Checking', () => {
    beforeEach(() => {
      // Setup authenticated state
      localStorage.setItem('access_token', 'stored-token');
      localStorage.setItem('user', JSON.stringify(mockJiraUser));
      service = TestBed.inject(JiraAuthService);
    });

    it('should check if user has specific role', () => {
      expect(service.hasRole('FE')).toBe(true);
      expect(service.hasRole('QC')).toBe(false);
    });

    it('should check if user has any of the specified roles', () => {
      expect(service.hasAnyRole(['FE', 'QC'])).toBe(true);
      expect(service.hasAnyRole(['QC', 'BA'])).toBe(false);
    });

    it('should return false for role checks when not authenticated', () => {
      service.logout();
      
      expect(service.hasRole('FE')).toBe(false);
      expect(service.hasAnyRole(['FE', 'BE'])).toBe(false);
    });
  });

  describe('Token Management', () => {
    it('should get token from localStorage', () => {
      localStorage.setItem('access_token', 'my-token');
      
      expect(service.getToken()).toBe('my-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear error message', async () => {
      // Simulate error state by attempting login with invalid credentials
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const loginPromise = service.login(credentials);

      // Mock HTTP error response
      const req = httpMock.expectOne('/api/auth/jira/login');
      req.flush(
        { message: 'Test error message' },
        { status: 401, statusText: 'Unauthorized' }
      );

      await loginPromise;

      // Assert error is set
      expect(service.error()).toBe('Test error message');

      // Clear error
      service.clearError();
      expect(service.error()).toBeNull();
    });
  });
});
