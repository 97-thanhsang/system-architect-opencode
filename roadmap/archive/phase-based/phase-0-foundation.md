# Phase 0: Foundation & Architecture

> **Duration**: 1-2 tuần  
> **Goal**: Thiết lập project structure, architecture, và integration patterns  
> **Output**: Project codebase sẵn sàng cho Phase 1

---

## 🎯 Objectives

1. ✅ Setup Angular 17+ project với Angular Material
2. ✅ Setup NestJS backend project
3. ✅ Thiết lập Redis cho queue system
4. ✅ Design database schema (SQLite/PostgreSQL cho solo dev)
5. ✅ Tạo OpenCode integration service
6. ✅ Setup WebSocket infrastructure
7. ✅ Setup project structure và conventions
8. ✅ Tạo base components và services

---

## 📁 Project Structure

```
E:\SOURCE\system-architect-opencode
├── apps/
│   ├── web/                          # Angular Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/             # Core singleton services
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── guards/
│   │   │   │   │   ├── interceptors/
│   │   │   │   │   └── services/
│   │   │   │   ├── features/
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── modules/
│   │   │   │   │   │   └── fe-module/
│   │   │   │   │   │       ├── analyze/
│   │   │   │   │   │       ├── solution/
│   │   │   │   │   │       └── execute/
│   │   │   │   │   └── shared/
│   │   │   │   └── app.component.*
│   │   ├── angular.json
│   │   └── package.json
│   │
│   └── api/                          # NestJS Backend
│       ├── src/
│       │   ├── auth/
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.module.ts
│       │   │   └── strategies/
│       │   │       └── jira.strategy.ts
│       │   ├── tasks/
│       │   │   ├── tasks.controller.ts
│       │   │   ├── tasks.service.ts
│       │   │   ├── tasks.module.ts
│       │   │   └── dto/
│       │   ├── queue/
│       │   │   ├── queue.module.ts
│       │   │   ├── queue.processor.ts
│       │   │   └── queue.service.ts
│       │   ├── opencode/
│       │   │   ├── opencode.module.ts
│       │   │   ├── opencode.service.ts
│       │   │   └── interfaces/
│       │   ├── jira/
│       │   │   ├── jira.module.ts
│       │   │   └── jira.service.ts
│       │   ├── websocket/
│       │   │   ├── websocket.gateway.ts
│       │   │   └── websocket.module.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── package.json
│       └── nest-cli.json
│
├── libs/
│   └── shared/                       # Shared types/interfaces
│       ├── src/
│       │   ├── models/
│       │   ├── dto/
│       │   └── enums/
│       └── package.json
│
├── infra/
│   ├── docker/
│   │   └── docker-compose.yml
│   └── scripts/
│       └── setup.sh
│
└── docs/
    ├── architecture/
    └── api/
```

---

## 🛠️ Tasks Breakdown

### Week 1: Setup & Foundation

#### Day 1-2: Frontend Setup
**Tasks**:
1. Khởi tạo Angular 17+ project
   ```bash
   ng new apps/web --routing --style=scss
   ```

2. Install dependencies
   ```bash
   cd apps/web
   npm install @angular/material @angular/cdk
   npm install socket.io-client
   npm install rxjs
   ```

3. Setup Angular Material theme
   ```typescript
   // angular.json
   "styles": [
     "@angular/material/prebuilt-themes/indigo-pink.css",
     "src/styles.scss"
   ]
   ```

4. Create base folder structure
   ```
   src/app/
   ├── core/
   ├── features/
   └── shared/
   ```

**Output**: Angular project chạy được, Material UI sẵn sàng

#### Day 3-4: Backend Setup
**Tasks**:
1. Khởi tạo NestJS project
   ```bash
   nest new apps/api --strict
   ```

2. Install dependencies
   ```bash
   cd apps/api
   npm install @nestjs/websockets @nestjs/platform-socket.io
   npm install @nestjs/bull bull
   npm install @nestjs/passport passport passport-jira
   npm install @nestjs/config
   npm install ioredis
   npm install typeorm @nestjs/typeorm sqlite3
   npm install @nestjs/axios axios
   npm install class-validator class-transformer
   ```

3. Setup modules structure
   ```bash
   nest generate module auth
   nest generate module tasks
   nest generate module queue
   nest generate module opencode
   nest generate module jira
   nest generate module websocket
   ```

4. Create database entities
   ```typescript
   // entities/task.entity.ts
   @Entity()
   export class Task {
     @PrimaryGeneratedColumn('uuid')
     id: string;
     
     @Column()
     jiraKey: string;
     
     @Column({ type: 'enum', enum: TaskStatus })
     status: TaskStatus;
     
     @Column({ type: 'json' })
     input: TaskInput;
     
     @Column({ type: 'json', nullable: true })
     output: TaskOutput;
     
     @CreateDateColumn()
     createdAt: Date;
     
     @UpdateDateColumn()
     updatedAt: Date;
   }
   ```

**Output**: NestJS API chạy được, database connected

#### Day 5-7: Integration Layer
**Tasks**:
1. **Create OpenCode Service**
   ```typescript
   // opencode.service.ts
   @Injectable()
   export class OpencodeService {
     constructor(
       private config: ConfigService,
       private http: HttpService,
     ) {}
     
     async runAnalyzeTask(
       input: AnalyzeTaskInput,
       progressCallback: (progress: TaskProgress) => void
     ): Promise<AnalyzeResult> {
       // Implementation
     }
     
     private spawnOpencodeProcess(
       command: string,
       args: string[],
       options: SpawnOptions
     ): ChildProcess {
       // Spawn opencode CLI
       return spawn('opencode', [command, ...args], options);
     }
   }
   ```

2. **Setup Queue Processor**
   ```typescript
   // queue.processor.ts
   @Processor('tasks')
   export class TasksProcessor {
     constructor(
       private opencodeService: OpencodeService,
       private websocket: WebsocketGateway,
     ) {}
     
     @Process('analyze')
     async handleAnalyze(job: Job<AnalyzeTaskInput>) {
       const { taskId, input } = job.data;
       
       // Update status
       await this.updateTaskStatus(taskId, TaskStatus.RUNNING);
       
       // Stream progress
       const result = await this.opencodeService.runAnalyzeTask(
         input,
         (progress) => {
           this.websocket.emitProgress(taskId, progress);
         }
       );
       
       // Complete
       await this.updateTaskStatus(taskId, TaskStatus.COMPLETED, result);
       
       return result;
     }
   }
   ```

3. **Setup WebSocket Gateway**
   ```typescript
   // websocket.gateway.ts
   @WebSocketGateway({
     cors: { origin: 'http://localhost:4200' },
   })
   export class WebsocketGateway {
     @WebSocketServer()
     server: Server;
     
     emitProgress(taskId: string, progress: TaskProgress) {
       this.server.emit(`task:${taskId}:progress`, progress);
     }
     
     emitComplete(taskId: string, result: any) {
       this.server.emit(`task:${taskId}:complete`, result);
     }
   }
   ```

**Output**: Integration layer hoạt động

### Week 2: Authentication & Base UI

#### Day 8-10: Jira OAuth Integration
**Tasks**:
1. **Backend - OAuth Strategy**
   ```typescript
   // jira.strategy.ts
   @Injectable()
   export class JiraStrategy extends PassportStrategy(Strategy, 'jira') {
     constructor(config: ConfigService) {
       super({
         authorizationURL: 'https://auth.atlassian.com/authorize',
         tokenURL: 'https://auth.atlassian.com/oauth/token',
         clientID: config.get('JIRA_CLIENT_ID'),
         clientSecret: config.get('JIRA_CLIENT_SECRET'),
         callbackURL: '/auth/jira/callback',
         scope: ['read:jira-user', 'read:jira-work'],
       });
     }
     
     async validate(accessToken: string, refreshToken: string, profile: any) {
       // Validate và return user
       return { id: profile.id, email: profile.email, accessToken };
     }
   }
   ```

2. **Frontend - Auth Service**
   ```typescript
   // auth.service.ts
   @Injectable({ providedIn: 'root' })
   export class AuthService {
     private currentUser = new BehaviorSubject<User | null>(null);
     
     constructor(private http: HttpClient) {}
     
     loginWithJira() {
       window.location.href = '/api/auth/jira';
     }
     
     handleCallback(token: string) {
       localStorage.setItem('token', token);
       return this.loadUserProfile();
     }
     
     logout() {
       localStorage.removeItem('token');
       this.currentUser.next(null);
     }
   }
   ```

**Output**: Login/logout hoạt động, user session quản lý được

#### Day 11-14: Base Components
**Tasks**:
1. **Layout Components**
   - Sidebar component (configurable)
   - Header component
   - Main content area
   - Footer component

2. **Shared Components**
   - Loading spinner
   - Progress bar
   - Toast notifications
   - Dialog/modal

3. **Base Services**
   - API service (HTTP client wrapper)
   - WebSocket service
   - Task service
   - File service

4. **Create routing structure**
   ```typescript
   // app-routing.module.ts
   const routes: Routes = [
     { path: 'login', component: LoginComponent },
     { 
       path: '', 
       component: LayoutComponent,
       canActivate: [AuthGuard],
       children: [
         { path: 'dashboard', component: DashboardComponent },
         { path: 'modules/fe', component: FeModuleComponent },
         { path: 'modules/fe/analyze', component: AnalyzeComponent },
       ]
     },
   ];
   ```

**Output**: Base UI framework hoàn chỉnh

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] API endpoints respond correctly
- [ ] WebSocket connection established
- [ ] Queue jobs process correctly
- [ ] OpenCode service spawns process correctly
- [ ] Database CRUD operations work

### Frontend Tests
- [ ] Angular app builds without errors
- [ ] Material UI components render correctly
- [ ] Routing works between pages
- [ ] Auth guard protects routes
- [ ] WebSocket client connects to server

### Integration Tests
- [ ] Jira OAuth flow completes
- [ ] User can login/logout
- [ ] Frontend communicates with backend
- [ ] Real-time updates work

---

## 📋 Deliverables

### Code
1. ✅ Angular project structure (`apps/web/`)
2. ✅ NestJS project structure (`apps/api/`)
3. ✅ Database entities và migrations
4. ✅ OpenCode integration service
5. ✅ Queue processor
6. ✅ WebSocket gateway
7. ✅ Auth module (Jira OAuth)
8. ✅ Base UI components

### Documentation
1. ✅ API documentation (Swagger)
2. ✅ Database schema diagram
3. ✅ Architecture decision records

### Infrastructure
1. ✅ Docker compose cho Redis + Database
2. ✅ Environment configuration templates
3. ✅ Setup scripts

---

## 🚀 Next Steps

Sau khi hoàn thành Phase 0:

1. **Verify** tất cả integrations hoạt động
2. **Run** end-to-end test đơn giản
3. **Move to Phase 1**: Implement Analyze Module
4. **Use OpenCode agents**:
   - `/solution-task` cho technical design chi tiết
   - `/execute-task` cho implementation

---

## 📝 Notes

### Solo Dev Optimizations
- Sử dụng **SQLite** cho Phase 0-1 (đơn giản, không cần setup)
- **Redis** chạy local (docker-compose đơn giản)
- **TypeORM** auto-sync schema (không cần migrations phức tạp)
- **Monorepo** structure để dễ quản lý

### Security Considerations
- Store secrets trong `.env` files
- Không commit credentials
- Sử dụng JWT cho session management
- Validate tất cả inputs

### Performance Considerations
- Queue system để handle long-running tasks
- WebSocket cho real-time updates (thay vì polling)
- Lazy loading cho Angular modules

---

**Phase Owner**: System Architect  
**Reviewers**: Self (solo dev)  
**Estimated Effort**: 80-100 hours
