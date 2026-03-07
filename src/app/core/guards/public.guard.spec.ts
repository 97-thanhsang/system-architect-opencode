import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { publicGuard } from './public.guard';
import { JiraAuthService } from '../auth/jira-auth.service';
import { TokenStorageService } from '../auth/token-storage.service';
import { signal } from '@angular/core';

describe('publicGuard', () => {
  let jiraAuthService: jasmine.SpyObj<JiraAuthService>;
  let tokenStorageService: jasmine.SpyObj<TokenStorageService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    // Create spy objects
    jiraAuthService = jasmine.createSpyObj('JiraAuthService', ['isAuthenticated']);
    tokenStorageService = jasmine.createSpyObj('TokenStorageService', ['isAuthenticated']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    // Create mock route and state
    mockRoute = {
      queryParams: {}
    } as unknown as ActivatedRouteSnapshot;
    mockState = {
      url: '/auth/login'
    } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: JiraAuthService, useValue: jiraAuthService },
        { provide: TokenStorageService, useValue: tokenStorageService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow access when user is not authenticated', () => {
    // Arrange: Both services return false (not authenticated)
    jiraAuthService.isAuthenticated.and.returnValue(false);
    tokenStorageService.isAuthenticated.and.returnValue(false);

    // Act: Execute guard
    const result = TestBed.runInInjectionContext(() => 
      publicGuard(mockRoute, mockState)
    );

    // Assert: Should allow access
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when user is authenticated via JiraAuthService', () => {
    // Arrange: JiraAuthService returns true (authenticated)
    jiraAuthService.isAuthenticated.and.returnValue(true);
    tokenStorageService.isAuthenticated.and.returnValue(false);

    // Act: Execute guard
    const result = TestBed.runInInjectionContext(() => 
      publicGuard(mockRoute, mockState)
    );

    // Assert: Should redirect and return false
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/module/fe']);
  });

  it('should redirect to dashboard when user is authenticated via TokenStorageService', () => {
    // Arrange: TokenStorageService returns true (authenticated)
    jiraAuthService.isAuthenticated.and.returnValue(false);
    tokenStorageService.isAuthenticated.and.returnValue(true);

    // Act: Execute guard
    const result = TestBed.runInInjectionContext(() => 
      publicGuard(mockRoute, mockState)
    );

    // Assert: Should redirect and return false
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/module/fe']);
  });

  it('should redirect to dashboard when user is authenticated via both services', () => {
    // Arrange: Both services return true (authenticated)
    jiraAuthService.isAuthenticated.and.returnValue(true);
    tokenStorageService.isAuthenticated.and.returnValue(true);

    // Act: Execute guard
    const result = TestBed.runInInjectionContext(() => 
      publicGuard(mockRoute, mockState)
    );

    // Assert: Should redirect and return false
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/module/fe']);
  });

  it('should redirect to returnUrl when provided in query params', () => {
    // Arrange: User is authenticated and returnUrl is provided
    jiraAuthService.isAuthenticated.and.returnValue(true);
    tokenStorageService.isAuthenticated.and.returnValue(false);
    mockRoute.queryParams = { returnUrl: '/dashboard' };

    // Act: Execute guard
    const result = TestBed.runInInjectionContext(() => 
      publicGuard(mockRoute, mockState)
    );

    // Assert: Should redirect to returnUrl
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should use default redirect when returnUrl is not provided', () => {
    // Arrange: User is authenticated, no returnUrl
    jiraAuthService.isAuthenticated.and.returnValue(true);
    tokenStorageService.isAuthenticated.and.returnValue(false);
    mockRoute.queryParams = {};

    // Act: Execute guard
    const result = TestBed.runInInjectionContext(() => 
      publicGuard(mockRoute, mockState)
    );

    // Assert: Should redirect to default route
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/module/fe']);
  });
});
