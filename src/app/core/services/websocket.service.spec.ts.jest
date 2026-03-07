import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { take, toArray } from 'rxjs/operators';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    connected: false,
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
  }))
}));

import { io, Socket } from 'socket.io-client';
import { WebSocketService, WebSocketConnectionState } from './websocket.service';
import { TokenStorageService } from '../auth/token-storage.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockSocket: any;
  let mockTokenStorage: MockTokenStorageService;
  let ngZone: NgZone;

  // Mock TokenStorageService
  class MockTokenStorageService {
    private tokenSubject = new BehaviorSubject<string | null>('mock-jwt-token');
    
    getAccessToken(): string | null {
      return this.tokenSubject.getValue();
    }
    
    accessToken$ = this.tokenSubject.asObservable();
  }

  beforeEach(() => {
    // Reset mock
    (io as any).mockClear();
    
    mockSocket = {
      connected: true,
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn()
    };
    
    (io as any).mockReturnValue(mockSocket);

    mockTokenStorage = new MockTokenStorageService();

    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        { provide: NgZone, useValue: { run: (fn: () => void) => fn() } },
        { provide: TokenStorageService, useValue: mockTokenStorage }
      ]
    });

    service = TestBed.inject(WebSocketService);
    ngZone = TestBed.inject(NgZone);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have initial disconnected state', () => {
      expect(service.connectionState()).toBe(WebSocketConnectionState.DISCONNECTED);
    });

    it('should not be connected initially', () => {
      expect(service.isConnected()).toBe(false);
    });

    it('should have empty connected task IDs', () => {
      expect(service.connectedTaskIds().size).toBe(0);
    });

    it('should not be subscribed to queue initially', () => {
      expect(service.subscribedToQueue()).toBe(false);
    });
  });

  describe('Connection', () => {
    it('should update state to connecting when connect is called', () => {
      service.connect();
      expect(service.connectionState()).toBe(WebSocketConnectionState.CONNECTING);
    });

    it('should create socket connection with correct URL', () => {
      service.connect();
      expect(io).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        expect.objectContaining({
          transports: ['websocket'],
          reconnection: false
        })
      );
    });

    it('should include JWT token in auth', () => {
      service.connect();
      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: expect.objectContaining({
            token: 'mock-jwt-token'
          })
        })
      );
    });

    it('should set up event handlers on connect', () => {
      service.connect();
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('task-progress', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('task-status', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('task-log', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('queue-status', expect.any(Function));
    });

    it('should not create new connection if already connected', () => {
      service.connect();
      service.connect();
      expect(io).toHaveBeenCalledTimes(1);
    });

    it('should update state to connected when socket connects', fakeAsync(() => {
      let connectHandler: ((...args: unknown[]) => void) | undefined;
      (mockSocket.on as jest.Mock).mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'connect') {
          connectHandler = handler;
        }
      });

      service.connect();
      tick();

      // Simulate connection
      if (connectHandler) {
        connectHandler();
        tick();
      }

      expect(service.connectionState()).toBe(WebSocketConnectionState.CONNECTED);
      expect(service.isConnected()).toBe(true);
    }));
  });

  describe('Disconnection', () => {
    beforeEach(() => {
      // Setup connected state
      (mockSocket.on as jest.Mock).mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'connect') {
          // Simulate immediate connection
          setTimeout(() => handler(), 0);
        }
      });
    });

    it('should disconnect socket when disconnect is called', () => {
      service.connect();
      service.disconnect();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should update state to disconnected after disconnect', fakeAsync(() => {
      let disconnectHandler: ((...args: unknown[]) => void) | undefined;
      (mockSocket.on as jest.Mock).mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'disconnect') {
          disconnectHandler = handler;
        }
      });

      service.connect();
      tick();

      service.disconnect();
      tick();

      expect(service.connectionState()).toBe(WebSocketConnectionState.DISCONNECTED);
      expect(service.isConnected()).toBe(false);
    }));

    it('should clear subscribed tasks on disconnect', fakeAsync(() => {
      service.connect();
      tick();

      // Simulate subscription
      service.subscribeToTask('task-123');
      expect(service.connectedTaskIds().has('task-123')).toBe(true);

      service.disconnect();
      tick();

      expect(service.connectedTaskIds().size).toBe(0);
    }));
  });

  describe('Task Subscription', () => {
    beforeEach(() => {
      // Setup connected state
      (mockSocket.on as jest.Mock).mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'connect') {
          setTimeout(() => handler(), 0);
        }
      });
    });

    it('should emit subscribe-task event when subscribing to task', fakeAsync(() => {
      service.connect();
      tick();

      service.subscribeToTask('task-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe-task', 'task-123');
    }));

    it('should add task ID to connected set when subscribed', fakeAsync(() => {
      service.connect();
      tick();

      service.subscribeToTask('task-123');

      expect(service.connectedTaskIds().has('task-123')).toBe(true);
    }));

    it('should emit unsubscribe-task event when unsubscribing from task', fakeAsync(() => {
      service.connect();
      tick();

      service.subscribeToTask('task-123');
      service.unsubscribeFromTask('task-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribe-task', 'task-123');
    }));

    it('should remove task ID from connected set when unsubscribed', fakeAsync(() => {
      service.connect();
      tick();

      service.subscribeToTask('task-123');
      service.unsubscribeFromTask('task-123');

      expect(service.connectedTaskIds().has('task-123')).toBe(false);
    }));

    it('should not subscribe if not connected', () => {
      service.subscribeToTask('task-123');
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('Queue Subscription', () => {
    beforeEach(() => {
      (mockSocket.on as jest.Mock).mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
        if (event === 'connect') {
          setTimeout(() => handler(), 0);
        }
      });
    });

    it('should emit subscribe-queue event when subscribing', fakeAsync(() => {
      service.connect();
      tick();

      service.subscribeToQueueStatus();

      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe-queue');
      expect(service.subscribedToQueue()).toBe(true);
    }));

    it('should update subscribed state when unsubscribed', fakeAsync(() => {
      service.connect();
      tick();

      service.subscribeToQueueStatus();
      service.unsubscribeFromQueueStatus();

      expect(service.subscribedToQueue()).toBe(false);
    }));
  });

  describe('Event Observables', () => {
    let progressHandler: any;
    let statusHandler: any;
    let logHandler: any;
    let queueHandler: any;

    beforeEach(() => {
      mockSocket.on = jest.fn((event: string, handler: any) => {
        if (event === 'connect') {
          setTimeout(() => handler(), 0);
        }

        if (event === 'task-progress') {
          progressHandler = handler;
        }
        if (event === 'task-status') {
          statusHandler = handler;
        }
        if (event === 'task-log') {
          logHandler = handler;
        }
        if (event === 'queue-status') {
          queueHandler = handler;
        }
      });
    });

    it('should emit task progress events', fakeAsync(() => {
      const events: any[] = [];
      service.onTaskProgress().pipe(take(2), toArray()).subscribe(events);

      service.connect();
      tick();

      const progressEvent = {
        taskId: 'task-123',
        progress: 50,
        logs: ['Step 1', 'Step 2'],
        timestamp: '2026-03-07T10:00:00Z'
      };

      if (progressHandler) {
        progressHandler(progressEvent);
        progressHandler({ ...progressEvent, progress: 100 });
      }

      tick();

      expect(events.length).toBe(2);
      expect(events[0].progress).toBe(50);
      expect(events[1].progress).toBe(100);
    }));

    it('should emit task status events', fakeAsync(() => {
      const events: any[] = [];
      service.onTaskStatus().pipe(take(1), toArray()).subscribe(events);

      service.connect();
      tick();

      const statusEvent = {
        taskId: 'task-123',
        status: 'completed',
        output: 'Output data',
        timestamp: '2026-03-07T10:00:00Z'
      };

      if (statusHandler) {
        statusHandler(statusEvent);
      }

      tick();

      expect(events.length).toBe(1);
      expect(events[0].status).toBe('completed');
    }));

    it('should emit task log events', fakeAsync(() => {
      const events: any[] = [];
      service.onTaskLog().pipe(take(1), toArray()).subscribe(events);

      service.connect();
      tick();

      const logEvent = {
        taskId: 'task-123',
        log: 'Processing file...',
        timestamp: '2026-03-07T10:00:00Z'
      };

      if (logHandler) {
        logHandler(logEvent);
      }

      tick();

      expect(events.length).toBe(1);
      expect(events[0].log).toBe('Processing file...');
    }));

    it('should emit queue status events', fakeAsync(() => {
      const events: any[] = [];
      service.onQueueStatus().pipe(take(1), toArray()).subscribe(events);

      service.connect();
      tick();

      const queueEvent = {
        waiting: 2,
        active: 1,
        completed: 10,
        failed: 0,
        total: 13
      };

      if (queueHandler) {
        queueHandler(queueEvent);
      }

      tick();

      expect(events.length).toBe(1);
      expect(events[0].total).toBe(13);
    }));

    it('should filter task progress by task ID', fakeAsync(() => {
      const events: any[] = [];
      service.onTaskProgress('task-123').pipe(take(2), toArray()).subscribe(events);

      service.connect();
      tick();

      if (progressHandler) {
        progressHandler({ taskId: 'task-123', progress: 50, timestamp: '' });
        progressHandler({ taskId: 'task-456', progress: 75, timestamp: '' }); // Should be filtered
        progressHandler({ taskId: 'task-123', progress: 100, timestamp: '' });
      }

      tick();

      // Only task-123 events should pass through
      expect(events.length).toBe(2);
      expect(events.every(e => e.taskId === 'task-123')).toBe(true);
    }));
  });

  describe('Reconnection', () => {
    it('should attempt reconnection on disconnect with reason', fakeAsync(() => {
      let disconnectHandler: any;
      
      mockSocket.on = jest.fn((event: string, handler: any) => {
        if (event === 'connect') {
          setTimeout(() => handler(), 0);
        }
        if (event === 'disconnect') {
          disconnectHandler = handler;
        }
      });

      service.connect();
      tick();

      // Simulate disconnection with server-side reason
      if (disconnectHandler) {
        disconnectHandler('io server disconnect');
      }
      tick();

      // Should attempt to reconnect
      expect(service.connectionState()).toBe(WebSocketConnectionState.RECONNECTING);
    }));

    it('should not attempt reconnection on manual disconnect', fakeAsync(() => {
      let disconnectHandler: any;
      
      mockSocket.on = jest.fn((event: string, handler: any) => {
        if (event === 'connect') {
          setTimeout(() => handler(), 0);
        }
        if (event === 'disconnect') {
          disconnectHandler = handler;
        }
      });

      service.connect();
      tick();

      // Manual disconnect
      service.disconnect(true);

      if (disconnectHandler) {
        disconnectHandler('io client disconnect');
      }
      tick();

      expect(service.connectionState()).not.toBe(WebSocketConnectionState.RECONNECTING);
    }));
  });

  describe('Error Handling', () => {
    it('should emit error on connection error', fakeAsync(() => {
      const errors: string[] = [];
      service.error$.pipe(take(1)).subscribe(error => errors.push(error));

      let errorHandler: any;
      
      mockSocket.on = jest.fn((event: string, handler: any) => {
        if (event === 'connect_error') {
          errorHandler = handler;
        }
      });

      service.connect();
      tick();

      if (errorHandler) {
        errorHandler({ message: 'Authentication failed' });
      }
      tick();

      expect(errors.length).toBe(1);
      expect(errors[0]).toBe('Authentication failed');
      expect(service.lastError()).toBe('Authentication failed');
    }));
  });

  describe('Configuration', () => {
    it('should allow updating configuration', () => {
      service.updateConfig({
        maxReconnectAttempts: 10,
        debugLogging: true
      });

      const config = service.getConfig();
      expect(config.maxReconnectAttempts).toBe(10);
      expect(config.debugLogging).toBe(true);
    });
  });
});
