import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { of, throwError, timer } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  TokenStorageService,
  TokenStorageConfig,
  TokenRefreshResponse,
  User,
  TokenStorageError,
  TokenStorageErrorType,
  TokenRefreshQueue
} from './token-storage.service';

// Mock Router
const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

describe('TokenStorageService', () => {
  let service: TokenStorageService;
  let httpMock: HttpTestingController;
  let ngZone: NgZone;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    roles: ['user']
  };

  const mockTokenResponse: TokenRefreshResponse = {
    accessToken: 'new-test-token',
    expiresIn: 3600,
    tokenType: 'Bearer'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TokenStorageService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(TokenStorageService);
    httpMock = TestBed.inject(HttpTestingController);
    ngZone = TestBed.inject(NgZone);

    // Reset router spy
    mockRouter.navigate.calls.reset();

    // Clear session storage
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    service.ngOnDestroy();
    sessionStorage.clear();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with unauthenticated state', () => {
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUser()).toBeNull();
      expect(service.tokenExpiry()).toBeNull();
      expect(service.getAccessToken()).toBeNull();
    });

    it('should have default configuration', () => {
      const config = service.getConfig();
      expect(config.refreshBufferSeconds).toBe(120);
      expect(config.maxRetryAttempts).toBe(3);
      expect(config.retryDelayMs).toBe(1000);
      expect(config.debugLogging).toBeFalse();
    });
  });

  describe('Token Storage', () => {
    it('should store tokens and update signals', fakeAsync(() => {
      const token = 'test-access-token';
      const expiresIn = 3600;

      service.storeTokens(token, expiresIn, mockUser);
      tick();

      expect(service.getAccessToken()).toBe(token);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.tokenExpiry()).toBeInstanceOf(Date);
      expect(service.hasAccessToken()).toBeTrue();
    }));

    it('should store user in sessionStorage', fakeAsync(() => {
      service.storeTokens('token', 3600, mockUser);
      tick();

      const storedUser = sessionStorage.getItem('current_user');
      expect(storedUser).toBeTruthy();
      expect(JSON.parse(storedUser!)).toEqual(mockUser);
    }));

    it('should handle token storage without user', fakeAsync(() => {
      service.storeTokens('token', 3600);
      tick();

      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()).toBeNull();
    }));

    it('should schedule token refresh when storing tokens', fakeAsync(() => {
      spyOn(service as any, 'scheduleTokenRefresh');

      service.storeTokens('token', 3600);
      tick();

      expect(service['scheduleTokenRefresh']).toHaveBeenCalledWith(3600);
    }));

    it('should update computed signals correctly', fakeAsync(() => {
      const now = Date.now();
      service.storeTokens('token', 3600); // 1 hour
      tick();

      const timeUntilExpiry = service.timeUntilExpiry();
      expect(timeUntilExpiry).toBeGreaterThan(0);
      expect(timeUntilExpiry).toBeLessThanOrEqual(3600000); // 1 hour in ms

      expect(service.isTokenExpiringSoon()).toBeFalse(); // Signal - more than 2 minutes left
    }));
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', (done) => {
      service.refreshAccessToken().subscribe({
        next: (token) => {
          expect(token).toBe(mockTokenResponse.accessToken);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockTokenResponse);
    });

    it('should store new tokens after successful refresh', (done) => {
      spyOn(service, 'storeTokens').and.callThrough();

      service.refreshAccessToken().subscribe({
        next: () => {
          expect(service.storeTokens).toHaveBeenCalledWith(
            mockTokenResponse.accessToken,
            mockTokenResponse.expiresIn
          );
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush(mockTokenResponse);
    });

    it('should retry on failure with exponential backoff', fakeAsync(() => {
      let attempts = 0;

      service.refreshAccessToken().subscribe({
        error: (error) => {
          expect(attempts).toBe(4); // Initial + 3 retries
          expect(error).toBeInstanceOf(TokenStorageError);
          expect(error.type).toBe(TokenStorageErrorType.REFRESH_FAILED);
        }
      });

      // Fail 4 times (initial + 3 retries)
      for (let i = 0; i < 4; i++) {
        tick(i === 0 ? 0 : 1000 * Math.pow(2, i - 1)); // Exponential delay
        const req = httpMock.expectOne('/api/auth/refresh');
        attempts++;
        req.flush({ message: 'Server error' }, { status: 500, statusText: 'Server Error' });
      }

      flush();
    }));

    it('should handle 401 error and redirect to login', (done) => {
      service.refreshAccessToken().subscribe({
        error: (error) => {
          expect(error.type).toBe(TokenStorageErrorType.TOKEN_EXPIRED);
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
            queryParams: { sessionExpired: true }
          });
          done();
        }
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle network errors', (done) => {
      spyOnProperty(navigator, 'onLine').and.returnValue(false);

      service.refreshAccessToken().subscribe({
        error: (error) => {
          expect(error.type).toBe(TokenStorageErrorType.NETWORK_ERROR);
          done();
        }
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      req.error(new ProgressEvent('Network error'));
    });

    it('should queue requests during refresh', fakeAsync(() => {
      // First request triggers refresh
      const refresh$ = service.refreshAccessToken();

      // Queue second request
      let secondRequestResolved = false;
      service.queueRequestForRefresh().then(() => {
        secondRequestResolved = true;
      });

      // Complete the refresh
      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush(mockTokenResponse);
      tick();

      expect(secondRequestResolved).toBeTrue();
    }));

    it('should reject queued requests on refresh failure', fakeAsync(() => {
      // Start refresh
      service.refreshAccessToken().subscribe({ error: () => {} });

      // Queue a request
      let requestRejected = false;
      service.queueRequestForRefresh().catch(() => {
        requestRejected = true;
      });

      // Fail the refresh
      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
      tick();

      expect(requestRejected).toBeTrue();
    }));

    it('should emit token refresh completion event', (done) => {
      service.tokenRefreshCompleted$.subscribe((token) => {
        expect(token).toBe(mockTokenResponse.accessToken);
        done();
      });

      service.refreshAccessToken().subscribe();

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush(mockTokenResponse);
    });

    it('should wait for ongoing refresh instead of starting new one', (done) => {
      // Start first refresh
      const firstRefresh$ = service.refreshAccessToken();

      // Second refresh should wait for first to complete
      let secondRefreshCompleted = false;
      service.refreshAccessToken().subscribe({
        next: () => {
          secondRefreshCompleted = true;
          done();
        },
        error: done.fail
      });

      // Complete the first (and only) HTTP request
      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush(mockTokenResponse);
    });
  });

  describe('Token Expiry', () => {
    it('should detect token expiring soon', fakeAsync(() => {
      // Token expires in 1 minute (less than 2 minute buffer)
      service.storeTokens('token', 60);
      tick();

      expect(service.isTokenExpiringSoon()).toBeTrue();
    }));

    it('should detect token not expiring soon', fakeAsync(() => {
      // Token expires in 5 minutes (more than 2 minute buffer)
      service.storeTokens('token', 300);
      tick();

      expect(service.isTokenExpiringSoon()).toBeFalse();
    }));

    it('should return null for getTimeUntilExpiry when no token', () => {
      expect(service.getTimeUntilExpiry()).toBeNull();
    });

    it('should return correct time until expiry', fakeAsync(() => {
      service.storeTokens('token', 3600); // 1 hour
      tick();

      const timeUntil = service.getTimeUntilExpiry();
      expect(timeUntil).toBeGreaterThan(0);
      expect(timeUntil).toBeLessThanOrEqual(3600000);
    }));

    it('should automatically refresh before expiry', fakeAsync(() => {
      spyOn(service, 'refreshAccessToken').and.returnValue(
        of(mockTokenResponse.accessToken)
      );

      // Store token with short expiry
      service.storeTokens('token', 180); // 3 minutes
      tick();

      // Fast-forward to 1 minute before expiry (2 minute buffer)
      tick(60000); // 1 minute

      expect(service.refreshAccessToken).toHaveBeenCalled();

      flush();
    }));
  });

  describe('Token Clearing', () => {
    beforeEach(fakeAsync(() => {
      service.storeTokens('token', 3600, mockUser);
      tick();
    }));

    it('should clear tokens and reset state', fakeAsync(() => {
      expect(service.isAuthenticated()).toBeTrue();

      service.clearTokens();
      tick();

      expect(service.getAccessToken()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUser()).toBeNull();
      expect(service.tokenExpiry()).toBeNull();
      expect(service.hasAccessToken()).toBeFalse();
    }));

    it('should clear user from sessionStorage', fakeAsync(() => {
      sessionStorage.setItem('current_user', JSON.stringify(mockUser));

      service.clearTokens();
      tick();

      expect(sessionStorage.getItem('current_user')).toBeNull();
    }));

    it('should clear refresh timer', fakeAsync(() => {
      spyOn(service as any, 'clearRefreshTimer');

      service.clearTokens();
      tick();

      expect(service['clearRefreshTimer']).toHaveBeenCalled();
    }));
  });

  describe('Logout', () => {
    it('should call logout endpoint and clear tokens', fakeAsync(() => {
      spyOn(service, 'clearTokens');

      service.logout();
      tick();

      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();

      req.flush({});
      tick();

      expect(service.clearTokens).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    }));

    it('should clear tokens even if logout endpoint fails', fakeAsync(() => {
      spyOn(service, 'clearTokens');

      service.logout();
      tick();

      const req = httpMock.expectOne('/api/auth/logout');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });
      tick();

      expect(service.clearTokens).toHaveBeenCalled();
    }));
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig: Partial<TokenStorageConfig> = {
        refreshBufferSeconds: 300,
        maxRetryAttempts: 5
      };

      service.updateConfig(newConfig);

      const config = service.getConfig();
      expect(config.refreshBufferSeconds).toBe(300);
      expect(config.maxRetryAttempts).toBe(5);
      // Other values should remain unchanged
      expect(config.retryDelayMs).toBe(1000);
    });

    it('should return readonly config', () => {
      const config = service.getConfig();

      // Attempt to modify should fail or not affect original
      (config as any).refreshBufferSeconds = 999;
      expect(service.getConfig().refreshBufferSeconds).toBe(120);
    });
  });

  describe('Error Handling', () => {
    it('should create TokenStorageError with correct properties', () => {
      const originalError = new Error('Original error');
      const error = new TokenStorageError(
        TokenStorageErrorType.TOKEN_EXPIRED,
        'Token has expired',
        originalError
      );

      expect(error.type).toBe(TokenStorageErrorType.TOKEN_EXPIRED);
      expect(error.message).toBe('Token has expired');
      expect(error.originalError).toBe(originalError);
      expect(error.name).toBe('TokenStorageError');
    });
  });

  describe('Access Token Observable', () => {
    it('should emit token changes', (done) => {
      const tokens: (string | null)[] = [];

      service.accessToken$.subscribe((token) => {
        tokens.push(token);

        if (tokens.length === 3) {
          expect(tokens).toEqual([null, 'token1', 'token2']);
          done();
        }
      });

      // Initial null
      service.storeTokens('token1', 3600);
      service.storeTokens('token2', 3600);
    });
  });

  describe('NgZone Integration', () => {
    it('should run state updates in Angular zone', fakeAsync(() => {
      spyOn(ngZone, 'run').and.callThrough();

      service.storeTokens('token', 3600);
      tick();

      expect(ngZone.run).toHaveBeenCalled();
    }));

    it('should run clear in Angular zone', fakeAsync(() => {
      service.storeTokens('token', 3600);
      tick();

      spyOn(ngZone, 'run').and.callThrough();

      service.clearTokens();
      tick();

      expect(ngZone.run).toHaveBeenCalled();
    }));
  });

  describe('Signal Reactivity', () => {
    it('should have readonly public signals', () => {
      // These should be readonly signals
      expect(service.isAuthenticated).toBeDefined();
      expect(service.currentUser).toBeDefined();
      expect(service.tokenExpiry).toBeDefined();
      expect(service.isRefreshing).toBeDefined();
      expect(service.refreshError).toBeDefined();
    });

    it('should update computed signals when source changes', fakeAsync(() => {
      // Initially not expiring soon
      service.storeTokens('token', 3600);
      tick();
      expect(service.isTokenExpiringSoon()).toBeFalse();

      // Clear and set short expiry
      service.clearTokens();
      tick();

      service.storeTokens('token', 60);
      tick();
      expect(service.isTokenExpiringSoon()).toBeTrue();
    }));
  });
});

describe('TokenRefreshQueue', () => {
  let queue: TokenRefreshQueue;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TokenRefreshQueue]
    });

    queue = TestBed.inject(TokenRefreshQueue);
  });

  it('should be created', () => {
    expect(queue).toBeTruthy();
  });

  it('should execute operation immediately when not locked', async () => {
    const operation = jasmine.createSpy('operation').and.returnValue(Promise.resolve('result'));

    const result = await queue.queue(operation);

    expect(operation).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  it('should queue operation when locked', async () => {
    queue.lock();

    let operationExecuted = false;
    const operation = async () => {
      operationExecuted = true;
      return 'result';
    };

    const promise = queue.queue(operation);

    // Operation should not have executed yet
    expect(operationExecuted).toBeFalse();

    // Unlock the queue
    queue.unlock();

    const result = await promise;
    expect(operationExecuted).toBeTrue();
    expect(result).toBe('result');
  });

  it('should handle Observable operations', async () => {
    const operation = () => of('observable-result');

    const result = await queue.queue(operation);

    expect(result).toBe('observable-result');
  });

  it('should handle Promise operations', async () => {
    const operation = () => Promise.resolve('promise-result');

    const result = await queue.queue(operation);

    expect(result).toBe('promise-result');
  });
});
