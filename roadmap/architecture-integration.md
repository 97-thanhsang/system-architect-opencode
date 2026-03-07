# Architecture & OpenCode Integration Guide

> **Purpose**: Hướng dẫn chi tiết về architecture và cách tích hợp với OpenCode agents  
> **Version**: 1.0.0  
> **Audience**: Developers implementing the platform

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Angular 17+ Application                                             │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│   │
│  │  │  Dashboard   │ │  Module FE   │ │  Module BE   │ │  Admin Panel ││   │
│  │  │  Component   │ │  Component   │ │  Component   │ │  Component   ││   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Shared Services: Auth, API, WebSocket, State Management       │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP / WebSocket
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (BFF)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  NestJS Backend                                                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Auth    │ │  Tasks   │ │  Queue   │ │  Jira    │ │  OpenCode│  │   │
│  │  │ Module   │ │ Module   │ │ Module   │ │ Module   │ │ Module   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                           │   │
│  │  │ WebSocket│ │ Pipeline │ │  File    │                           │   │
│  │  │ Gateway  │ │ Module   │ │ Service  │                           │   │
│  │  └──────────┘ └──────────┘ └──────────┘                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
            ┌──────────┐      ┌──────────┐      ┌──────────┐
            │  Redis   │      │  SQLite/ │      │  OpenCode│
            │  Queue   │      │  Postgres│      │  Agents  │
            └──────────┘      └──────────┘      └──────────┘
                                                   │
                    ┌──────────────────────────────┼──────────┐
                    ▼                              ▼          ▼
            ┌──────────┐                   ┌──────────┐ ┌──────────┐
            │  Jira    │                   │ ANALYZE  │ │ SOLUTION │
            │   API    │                   │   Agent  │ │   Agent  │
            └──────────┘                   └──────────┘ └──────────┘
                                           ┌──────────┐ ┌──────────┐
                                           │  CODE    │ │  REVIEW  │
                                           │   Agent  │ │   Agent  │
                                           └──────────┘ └──────────┘
```

---

## 🔗 OpenCode Integration Patterns

### Pattern 1: CLI Spawn (Recommended for Phase 1)

**Architecture**:
```typescript
// Backend spawns OpenCode CLI as child process
@Injectable()
export class OpencodeCLIService {
  
  async runAgent(
    agent: AgentType,
    command: string,
    args: string[],
    options: SpawnOptions
  ): Promise<AgentResult> {
    
    return new Promise((resolve, reject) => {
      // Spawn opencode process
      const process = spawn('opencode', [command, ...args], {
        cwd: options.projectPath,
        env: {
          ...process.env,
          OPENCODE_CONFIG_DIR: options.configDir,
          JIRA_API_TOKEN: options.jiraToken
        }
      });
      
      let stdout = '';
      let stderr = '';
      
      // Stream stdout
      process.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        
        // Parse progress and emit via WebSocket
        const progress = this.parseProgress(chunk);
        if (progress) {
          this.websocket.emit(progress);
        }
      });
      
      // Stream stderr
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Handle completion
      process.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            stdout,
            outputPath: options.outputPath
          });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });
      
      // Handle errors
      process.on('error', (error) => {
        reject(error);
      });
    });
  }
}
```

**Pros**:
- ✅ Đơn giản, không cần modify OpenCode
- ✅ Tận dụng toàn bộ features của agents
- ✅ Dễ debug (xem logs trực tiếp)

**Cons**:
- ❌ Không real-time collaboration
- ❌ Process management complexity
- ❌ Security concerns (command injection)

**Use Case**: Phase 1-2, solo development

---

### Pattern 2: REST API Wrapper (Recommended for Production)

**Architecture**:
```typescript
// Create REST API layer around OpenCode
@Controller('agents')
export class AgentsController {
  
  @Post('analyze')
  async runAnalyze(
    @Body() dto: AnalyzeTaskDto
  ): Promise<AnalyzeResult> {
    // 1. Validate input
    await this.validateInput(dto);
    
    // 2. Queue job
    const job = await this.queue.add('analyze', dto);
    
    // 3. Return job ID for polling
    return { jobId: job.id, status: 'queued' };
  }
  
  @Get('jobs/:id/status')
  async getJobStatus(@Param('id') id: string): Promise<JobStatus> {
    const job = await this.queue.getJob(id);
    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress
    };
  }
  
  @Sse('jobs/:id/stream')
  streamJobProgress(@Param('id') id: string): Observable<MessageEvent> {
    return this.queue.getJobStream(id).pipe(
      map(progress => ({ data: progress }))
    );
  }
}

// Queue Processor
@Processor('agents')
export class AgentsProcessor {
  
  @Process('analyze')
  async handleAnalyze(job: Job<AnalyzeTaskDto>) {
    const { issueKey, projectPath, outputPath } = job.data;
    
    // Update progress
    await job.progress(10);
    
    // Spawn opencode
    const result = await this.opencodeService.runAgent('/analyze-task', [
      issueKey,
      '--project-path', projectPath,
      '--output-path', outputPath
    ]);
    
    // Update progress
    await job.progress(50);
    
    // Process output
    await this.processOutput(outputPath);
    
    // Complete
    await job.progress(100);
    
    return result;
  }
}
```

**Pros**:
- ✅ Async processing với queue
- ✅ Scalable (có thể scale workers)
- ✅ RESTful API cho frontend
- ✅ Better error handling

**Cons**:
- ❌ Complex hơn Pattern 1
- ❌ Cần infrastructure (Redis)

**Use Case**: Phase 3+, production deployment

---

### Pattern 3: Direct Integration (Advanced)

**Architecture**:
```typescript
// Import OpenCode agents as modules (nếu có thể)
import { AnalyzeAgent } from '@opencode/agents';

@Injectable()
export class DirectIntegrationService {
  
  constructor(private analyzeAgent: AnalyzeAgent) {}
  
  async runAnalyzeDirectly(input: AnalyzeInput): Promise<AnalyzeResult> {
    // Gọi trực tiếp agent methods
    const result = await this.analyzeAgent.analyze({
      task: input.task,
      context: input.context,
      options: {
        mode: 'full',
        outputFormat: 'markdown'
      }
    });
    
    return result;
  }
}
```

**Note**: Pattern này yêu cầu OpenCode expose agents như Node.js modules, hiện tại chưa support.

---

## 🎨 Frontend-Backend Communication

### WebSocket Events

```typescript
// Client (Angular) - WebSocket Service
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket: Socket;
  
  constructor() {
    this.socket = io('/tasks', {
      auth: { token: localStorage.getItem('token') }
    });
  }
  
  onTaskProgress(taskId: string): Observable<TaskProgress> {
    return new Observable(observer => {
      this.socket.on(`task:${taskId}:progress`, (data) => {
        observer.next(data);
      });
    });
  }
  
  onTaskComplete(taskId: string): Observable<TaskResult> {
    return new Observable(observer => {
      this.socket.on(`task:${taskId}:complete`, (data) => {
        observer.next(data);
        observer.complete();
      });
    });
  }
}

// Server (NestJS) - WebSocket Gateway
@WebSocketGateway({ namespace: 'tasks' })
export class TasksGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  
  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    // Verify token
  }
  
  emitTaskProgress(taskId: string, progress: TaskProgress) {
    this.server.emit(`task:${taskId}:progress`, progress);
  }
  
  emitTaskComplete(taskId: string, result: TaskResult) {
    this.server.emit(`task:${taskId}:complete`, result);
  }
}
```

---

## 🗄️ Data Flow

### Task Execution Flow

```
User (Frontend)
    │
    │ 1. Submit tasks
    ▼
Frontend Service
    │
    │ 2. POST /api/tasks
    ▼
NestJS Controller
    │
    │ 3. Validate & Queue
    ▼
Bull Queue (Redis)
    │
    │ 4. Process job
    ▼
Queue Processor
    │
    │ 5. Spawn opencode process
    ▼
OpenCode Agent
    │
    │ 6. Execute workflow
    ▼
Output Files
    │
    │ 7. Copy to destination
    ▼
    │ 8. Emit completion event
    ▼
WebSocket Gateway
    │
    │ 9. Broadcast to client
    ▼
Frontend (Real-time update)
```

---

## 🔐 Security Considerations

### 1. Input Validation
```typescript
// Validate all inputs before spawning processes
@Injectable()
export class InputValidationService {
  validatePath(path: string): boolean {
    // Prevent path traversal
    const resolved = path.resolve(path);
    const allowedRoot = '/home/user/projects';
    return resolved.startsWith(allowedRoot);
  }
  
  validateJiraKey(key: string): boolean {
    // Format: PROJECT-123
    return /^[A-Z][A-Z0-9]*-\d+$/.test(key);
  }
  
  sanitizeCommandArg(arg: string): string {
    // Escape special characters
    return arg.replace(/[;&|`$(){}[\]\\]/g, '\\$&');
  }
}
```

### 2. Authentication Flow
```typescript
// Jira OAuth Integration
@Controller('auth')
export class AuthController {
  
  @Get('jira')
  @UseGuards(JiraAuthGuard)
  async jiraAuth() {
    // Redirect to Jira OAuth
  }
  
  @Get('jira/callback')
  @UseGuards(JiraAuthGuard)
  async jiraCallback(@Req() req) {
    const user = req.user;
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      jiraToken: user.accessToken
    });
    
    return { token };
  }
}
```

### 3. Permission System
```typescript
// RBAC Decorator
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => 
  SetMetadata(ROLES_KEY, roles);

// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Usage
@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  
  @Post('users')
  @Roles('admin')
  createUser() {
    // Only admins
  }
}
```

---

## 📊 Performance Optimization

### 1. Caching Strategy
```typescript
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
  
  async getJiraIssue(key: string): Promise<JiraIssue> {
    const cached = await this.cache.get<JiraIssue>(`jira:${key}`);
    if (cached) return cached;
    
    const issue = await this.jiraService.getIssue(key);
    await this.cache.set(`jira:${key}`, issue, 300); // 5 minutes
    
    return issue;
  }
}
```

### 2. Connection Pooling
```typescript
// Database connection pooling
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'pass',
  database: 'opencode',
  extra: {
    max: 20, // Maximum connections
    connectionTimeoutMillis: 2000
  }
})
```

### 3. Lazy Loading
```typescript
// Angular lazy loading
const routes: Routes = [
  {
    path: 'modules/fe',
    loadChildren: () => import('./fe-module/fe-module.module')
      .then(m => m.FeModuleModule)
  },
  {
    path: 'modules/be',
    loadChildren: () => import('./be-module/be-module.module')
      .then(m => m.BeModuleModule)
  }
];
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example: Queue Processor Test
describe('TasksProcessor', () => {
  let processor: TasksProcessor;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksProcessor,
        {
          provide: OpencodeService,
          useValue: { spawnProcess: jest.fn() }
        },
        {
          provide: WebsocketGateway,
          useValue: { emitProgress: jest.fn() }
        }
      ]
    }).compile();
    
    processor = module.get<TasksProcessor>(TasksProcessor);
  });
  
  it('should process analyze task', async () => {
    const job = { data: { taskId: '123', input: {} } } as Job;
    
    await processor.handleAnalyze(job);
    
    // Assert
    expect(opencodeService.spawnProcess).toHaveBeenCalled();
  });
});
```

### E2E Tests
```typescript
// Example: Full workflow test
describe('Analyze Workflow (e2e)', () => {
  it('should complete full analyze workflow', async () => {
    // 1. Login
    const login = await request(app.getHttpServer())
      .post('/auth/jira')
      .expect(302);
    
    // 2. Start analyze
    const response = await request(app.getHttpServer())
      .post('/api/tasks/analyze/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        paths: { projectPath: '/test', outputPath: '/output' },
        tasks: [{ type: 'jira', value: 'TEST-123' }]
      })
      .expect(201);
    
    const taskId = response.body.taskId;
    
    // 3. Poll for completion
    await waitFor(async () => {
      const status = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}/status`);
      return status.body.status === 'completed';
    }, { timeout: 30000 });
    
    // 4. Verify output
    const output = await request(app.getHttpServer())
      .get(`/api/tasks/${taskId}/output`);
    
    expect(output.body).toHaveLength(4); // 4 output files
  });
});
```

---

## 🚀 Deployment Patterns

### Development
```bash
# Run locally
# Terminal 1: Backend
cd apps/api
npm run start:dev

# Terminal 2: Frontend
cd apps/web
npm start

# Terminal 3: Redis
docker run -p 6379:6379 redis:alpine
```

### Staging
```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  web:
    build: ./apps/web
    environment:
      - API_URL=https://staging-api.opencode.local
    
  api:
    build: ./apps/api
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=postgres://staging:pass@db:5432/opencode
```

### Production
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  web:
    image: opencode-platform/web:${VERSION}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    
  api:
    image: opencode-platform/api:${VERSION}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

---

## 📚 References

- [OpenCode Agents Documentation](../../agents/README.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Angular Architecture](https://angular.io/guide/architecture)
- [WebSocket Best Practices](https://socket.io/docs/v4/)
- [Redis Queue Patterns](https://redis.io/docs/manual/pubsub/)

---

**Architecture Version**: 1.0.0  
**Last Updated**: March 2026  
**Maintainer**: System Architect
