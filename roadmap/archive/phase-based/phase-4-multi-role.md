# Phase 4: Multi-Role & Scale

> **Duration**: 4-6 tuần  
> **Goal**: Mở rộng platform cho tất cả roles (BE/QC/BA/PM) và admin features  
> **Output**: Enterprise-ready platform với multi-role support

---

## 🎯 Objectives

1. ✅ **Multi-Role Support**: Modules cho BE, QC, BA, PM
2. ✅ **Admin Panel**: User management, system config
3. ✅ **Menu Configuration**: Role-based menu system
4. ✅ **Team Collaboration**: Multi-user workflows
5. ✅ **Advanced Security**: RBAC, audit logs
6. ✅ **System Monitoring**: Health checks, performance monitoring
7. ✅ **Deployment**: Production deployment strategy

---

## 📐 Role-Based Architecture

### Available Roles

```
┌──────────────────────────────────────────────────────────────┐
│                     PLATFORM ROLES                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🎨 FE DEVELOPER (Module: fe-module)                        │
│  ├── Analyze: UI/UX, Frontend patterns                      │
│  ├── Solution: Component design, State management           │
│  └── Execute: Angular/React/Vue implementation              │
│                                                              │
│  ⚙️  BE DEVELOPER (Module: be-module)                        │
│  ├── Analyze: API design, Database schema                   │
│  ├── Solution: Architecture, Microservices                  │
│  └── Execute: NestJS/Node.js/Java implementation            │
│                                                              │
│  🧪 QC ENGINEER (Module: qc-module)                         │
│  ├── Analyze: Test scenarios, Coverage analysis             │
│  ├── Solution: Test strategies, Automation plan             │
│  └── Execute: Test cases, E2E scripts                       │
│                                                              │
│  📊 BA ANALYST (Module: ba-module)                          │
│  ├── Analyze: Requirements, User stories                    │
│  ├── Solution: Process flows, Documentation                 │
│  └── Execute: Specs, Acceptance criteria                    │
│                                                              │
│  📋 PM MANAGER (Module: pm-module)                          │
│  ├── Analyze: Sprint planning, Resource allocation          │
│  ├── Solution: Timeline, Risk assessment                    │
│  └── Execute: Reports, Stakeholder updates                  │
│                                                              │
│  👑 ADMIN (Module: admin-panel)                             │
│  ├── User Management                                        │
│  ├── System Configuration                                   │
│  ├── Role & Permission Management                           │
│  └── Monitoring & Logs                                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Tasks

### Week 1-2: BE Module

#### Task 4.1: Backend Module Structure
```typescript
// be-module.module.ts
@NgModule({
  declarations: [
    BeModuleComponent,
    BeAnalyzeComponent,
    BeSolutionComponent,
    BeExecuteComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    // BE-specific components
    ApiDesignComponent,
    DatabaseSchemaComponent,
    MicroserviceDiagramComponent
  ]
})
export class BeModuleModule {}
```

#### Task 4.2: BE Analyze Component
```typescript
// be-analyze.component.ts
@Component({
  selector: 'app-be-analyze',
  templateUrl: './be-analyze.component.html'
})
export class BeAnalyzeComponent {
  // BE-specific analysis inputs
  analysisTypes = [
    { id: 'api', label: 'API Design', icon: 'api' },
    { id: 'database', label: 'Database Schema', icon: 'storage' },
    { id: 'performance', label: 'Performance', icon: 'speed' },
    { id: 'security', label: 'Security', icon: 'security' }
  ];
  
  onAnalyze(type: string, input: TaskInput) {
    const config: BeAnalysisConfig = {
      type,
      input,
      // BE-specific configurations
      frameworks: ['nestjs', 'express', 'fastify'],
      databases: ['postgresql', 'mongodb', 'mysql'],
      patterns: ['microservices', 'monolith', 'serverless']
    };
    
    this.beService.startAnalysis(config).subscribe();
  }
}
```

---

### Week 3: QC & BA Modules

#### Task 4.3: QC Module
```typescript
// qc-module.module.ts
@NgModule({
  declarations: [
    QcModuleComponent,
    QcAnalyzeComponent,    // Test scenario analysis
    QcSolutionComponent,   // Test strategy design
    QcExecuteComponent     // Test generation & execution
  ]
})
export class QcModuleModule {}

// qc-analyze.component.ts
@Component({
  selector: 'app-qc-analyze'
})
export class QcAnalyzeComponent {
  testTypes = [
    { id: 'unit', label: 'Unit Tests' },
    { id: 'integration', label: 'Integration Tests' },
    { id: 'e2e', label: 'E2E Tests' },
    { id: 'performance', label: 'Performance Tests' }
  ];
  
  onGenerateTests(config: TestConfig) {
    this.qcService.generateTests(config).subscribe(results => {
      // Display test scenarios and coverage analysis
    });
  }
}
```

#### Task 4.4: BA Module
```typescript
// ba-module.module.ts
@NgModule({
  declarations: [
    BaModuleComponent,
    BaAnalyzeComponent,    // Requirements analysis
    BaSolutionComponent,   // Process design
    BaExecuteComponent     // Documentation generation
  ]
})
export class BaModuleModule {}

// ba-analyze.component.ts
@Component({
  selector: 'app-ba-analyze'
})
export class BaAnalyzeComponent {
  onAnalyzeRequirements(input: RequirementsInput) {
    this.baService.analyzeRequirements(input).subscribe(analysis => {
      // Display: User stories, Acceptance criteria
      // Process flows, Business rules
    });
  }
}
```

---

### Week 4: PM Module & Menu Configuration

#### Task 4.5: PM Module
```typescript
// pm-module.module.ts
@NgModule({
  declarations: [
    PmModuleComponent,
    SprintPlanningComponent,
    ResourceAllocationComponent,
    RiskAssessmentComponent,
    StakeholderReportsComponent
  ]
})
export class PmModuleModule {}

// pm-dashboard.component.ts
@Component({
  selector: 'app-pm-dashboard'
})
export class PmDashboardComponent {
  sprintData$ = this.pmService.getSprintData();
  velocity$ = this.pmService.getVelocity();
  burndown$ = this.pmService.getBurndownChart();
  
  onPlanSprint() {
    this.pmService.generateSprintPlan().subscribe(plan => {
      // Display sprint backlog, capacity planning
    });
  }
}
```

#### Task 4.6: Menu Configuration System
```typescript
// menu-config.service.ts
@Injectable({ providedIn: 'root' })
export class MenuConfigService {
  
  defaultMenus: Record<UserRole, MenuConfig> = {
    'fe-developer': {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { id: 'fe-module', label: 'FE Module', icon: 'code', route: '/modules/fe' },
        { 
          id: 'fe-workflows', 
          label: 'Workflows', 
          icon: 'account_tree',
          children: [
            { id: 'analyze', label: 'Analyze', route: '/modules/fe/analyze' },
            { id: 'solution', label: 'Solution', route: '/modules/fe/solution' },
            { id: 'execute', label: 'Execute', route: '/modules/fe/execute' }
          ]
        },
        { id: 'reports', label: 'Reports', icon: 'assessment', route: '/reports' }
      ]
    },
    'be-developer': {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { id: 'be-module', label: 'BE Module', icon: 'storage', route: '/modules/be' },
        { 
          id: 'be-workflows', 
          label: 'Workflows', 
          icon: 'account_tree',
          children: [
            { id: 'analyze', label: 'Analyze', route: '/modules/be/analyze' },
            { id: 'solution', label: 'Solution', route: '/modules/be/solution' },
            { id: 'execute', label: 'Execute', route: '/modules/be/execute' }
          ]
        },
        { id: 'api-docs', label: 'API Docs', icon: 'api', route: '/api-docs' }
      ]
    },
    // ... other roles
  };
  
  getMenuConfig(role: UserRole): Observable<MenuConfig> {
    // Check for custom config first
    return this.http.get<MenuConfig>(`/api/menu-config/${role}`).pipe(
      catchError(() => of(this.defaultMenus[role]))
    );
  }
  
  updateMenuConfig(role: UserRole, config: MenuConfig): Observable<void> {
    return this.http.put<void>(`/api/menu-config/${role}`, config);
  }
}
```

---

### Week 5: Admin Panel

#### Task 4.7: Admin Panel Structure
```typescript
// admin-panel.module.ts
@NgModule({
  declarations: [
    AdminPanelComponent,
    UserManagementComponent,
    RoleManagementComponent,
    SystemConfigComponent,
    AuditLogsComponent,
    MonitoringComponent
  ]
})
export class AdminPanelModule {}
```

#### Task 4.8: User Management
```typescript
// user-management.component.ts
@Component({
  selector: 'app-user-management'
})
export class UserManagementComponent {
  users$ = this.adminService.getUsers();
  
  roles = ['fe-developer', 'be-developer', 'qc-engineer', 'ba-analyst', 'pm-manager', 'admin'];
  
  onCreateUser(userData: CreateUserData) {
    this.adminService.createUser(userData).subscribe();
  }
  
  onAssignRole(userId: string, role: string) {
    this.adminService.assignRole(userId, role).subscribe();
  }
  
  onDeactivateUser(userId: string) {
    this.adminService.deactivateUser(userId).subscribe();
  }
}
```

#### Task 4.9: Role & Permission Management
```typescript
// permission.service.ts
@Injectable({ providedIn: 'root' })
export class PermissionService {
  
  permissions: Record<string, Permission[]> = {
    'fe-developer': [
      { resource: 'fe-module', actions: ['read', 'write', 'execute'] },
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'write'] }
    ],
    'admin': [
      { resource: '*', actions: ['*'] } // Full access
    ]
  };
  
  hasPermission(user: User, resource: string, action: string): boolean {
    const userPermissions = this.permissions[user.role] || [];
    
    return userPermissions.some(permission => {
      const resourceMatch = permission.resource === '*' || 
                           permission.resource === resource;
      const actionMatch = permission.actions.includes('*') || 
                         permission.actions.includes(action);
      return resourceMatch && actionMatch;
    });
  }
}

// permission.guard.ts
@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: PermissionService, private auth: AuthService) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission = route.data['permission'] as Permission;
    const user = this.auth.currentUser;
    
    if (!user) return false;
    
    return this.permissionService.hasPermission(
      user, 
      requiredPermission.resource, 
      requiredPermission.action
    );
  }
}
```

---

### Week 6: Monitoring & Deployment

#### Task 4.10: System Monitoring
```typescript
// monitoring.service.ts
@Injectable({ providedIn: 'root' })
export class MonitoringService {
  
  systemHealth$ = interval(30000).pipe(
    switchMap(() => this.checkSystemHealth())
  );
  
  private checkSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>('/api/health');
  }
  
  getMetrics(): Observable<SystemMetrics> {
    return this.http.get<SystemMetrics>('/api/metrics');
  }
  
  getAuditLogs(filters: AuditFilter): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>('/api/audit-logs', { params: filters });
  }
}

// monitoring-dashboard.component.ts
@Component({
  selector: 'app-monitoring-dashboard'
})
export class MonitoringDashboardComponent {
  health$ = this.monitoringService.systemHealth$;
  metrics$ = this.monitoringService.getMetrics();
  
  healthStatus$ = this.health$.pipe(
    map(health => {
      if (health.status === 'healthy') return { color: 'green', icon: 'check_circle' };
      if (health.status === 'degraded') return { color: 'yellow', icon: 'warning' };
      return { color: 'red', icon: 'error' };
    })
  );
}
```

#### Task 4.11: Deployment Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  web:
    build: ./apps/web
    ports:
      - "80:80"
    environment:
      - API_URL=http://api:3000
      - WS_URL=ws://api:3000
    depends_on:
      - api
      
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/opencode
      - REDIS_URL=redis://redis:6379
      - JIRA_CLIENT_ID=${JIRA_CLIENT_ID}
      - JIRA_CLIENT_SECRET=${JIRA_CLIENT_SECRET}
    depends_on:
      - db
      - redis
      
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=opencode
      
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
      
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api

volumes:
  postgres_data:
  redis_data:
```

---

## ✅ Acceptance Criteria

### Multi-Role Support
- [ ] FE Module hoạt động đầy đủ
- [ ] BE Module hoạt động đầy đủ
- [ ] QC Module hoạt động đầy đủ
- [ ] BA Module hoạt động đầy đủ
- [ ] PM Module hoạt động đầy đủ

### Admin Features
- [ ] User management hoạt động
- [ ] Role assignment hoạt động
- [ ] Permission system hoạt động
- [ ] Menu configuration hoạt động
- [ ] Audit logs ghi đầy đủ

### System
- [ ] Health monitoring hoạt động
- [ ] Performance metrics chính xác
- [ ] Docker deployment hoạt động
- [ ] SSL/HTTPS configured
- [ ] Backup strategy implemented

---

## 🚀 Phase 4 Completion Criteria

✅ **Definition of Done**:
1. All 5 roles (FE/BE/QC/BA/PM) có modules hoạt động
2. Admin panel hoàn chỉnh với user/role management
3. RBAC permission system hoạt động
4. Menu configuration system hoạt động
5. System monitoring và alerting hoạt động
6. Production deployment successful
7. Documentation hoàn chỉnh

**Sau Phase 4**: Platform enterprise-ready, có thể deploy production

---

**Phase Owner**: Solo Developer  
**Estimated Effort**: 160-240 hours  
**Dependencies**: Phase 3 hoàn thành
