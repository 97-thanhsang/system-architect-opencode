# Project Setup Guide

> **Purpose**: Hướng dẫn step-by-step để setup và chạy dự án  
> **Prerequisites**: Node.js 18+, Git, Docker (optional)

---

## 📋 Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (included with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Docker & Docker Compose** (optional, for Redis/DB)

### Optional but Recommended
- **VS Code**: With extensions:
  - Angular Language Service
  - ESLint
  - Prettier
  - NestJS Snippets
- **Redis Insight**: GUI for Redis ([Download](https://redis.com/redis-insight/))
- **Postman**: API testing ([Download](https://www.postman.com/))

---

## 🚀 Quick Start (5 phút)

### Step 1: Clone Repository
```bash
cd E:\SOURCE
git clone <repository-url> system-architect-opencode
cd system-architect-opencode
```

### Step 2: Setup Environment
```bash
# Copy environment templates
copy .env.example .env

# Edit .env file với your credentials
# Required variables:
# - JIRA_CLIENT_ID
# - JIRA_CLIENT_SECRET
# - DATABASE_URL (optional, defaults to SQLite)
# - REDIS_URL (optional, defaults to localhost:6379)
```

### Step 3: Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd apps/web && npm install && cd ../..

# Install backend dependencies  
cd apps/api && npm install && cd ../..
```

### Step 4: Setup Infrastructure (Redis + DB)
```bash
# Option A: Using Docker (Recommended)
docker-compose -f infra/docker/docker-compose.dev.yml up -d

# Option B: Local Redis
# Windows: https://redis.io/docs/getting-started/installation/install-redis-on-windows/
# Mac: brew install redis && brew services start redis
# Linux: sudo apt-get install redis-server
```

### Step 5: Run Database Migrations
```bash
cd apps/api
npm run migration:run
```

### Step 6: Start Development Servers
```bash
# Terminal 1: Backend API
cd apps/api
npm run start:dev

# Terminal 2: Frontend (in new terminal)
cd apps/web
npm start
```

### Step 7: Verify Setup
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Redis**: localhost:6379

---

## 🔧 Detailed Setup

### 1. Node.js Environment

**Kiểm tra version**:
```bash
node --version  # v18.0.0+
npm --version   # v9.0.0+
```

**Nếu cần update**:
```bash
# Using nvm (Linux/Mac)
nvm install 18
nvm use 18

# Windows: Download từ nodejs.org
```

### 2. Jira OAuth Setup

**Bước 1: Tạo OAuth App trong Jira**
1. Truy cập: https://developer.atlassian.com/console/myapps/
2. Click "Create" → "OAuth 2.0 integration"
3. Điền thông tin:
   - App name: "OpenCode Workflow Platform"
   - Callback URL: `http://localhost:4200/auth/callback`
4. Lưu **Client ID** và **Client Secret**

**Bước 2: Configure App**
1. Vào "Permissions" → Add:
   - `read:jira-user`
   - `read:jira-work`
   - `write:jira-work`
2. Vào "Authorization" → Configure:
   - Callback URL: `http://localhost:4200/auth/callback`

**Bước 3: Update .env**
```env
JIRA_CLIENT_ID=your-client-id-here
JIRA_CLIENT_SECRET=your-client-secret-here
JIRA_CALLBACK_URL=http://localhost:4200/auth/callback
```

### 3. Database Setup

**Option A: SQLite (Recommended for solo dev)**
```env
# apps/api/.env
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/opencode.db
```
Không cần setup gì thêm - SQLite tự động tạo file.

**Option B: PostgreSQL**
```bash
# Using Docker
docker run -d \
  --name opencode-postgres \
  -e POSTGRES_USER=opencode \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=opencode \
  -p 5432:5432 \
  postgres:14
```

```env
# apps/api/.env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=opencode
DATABASE_PASSWORD=password
DATABASE_NAME=opencode
```

### 4. Redis Setup

**Using Docker**:
```bash
docker run -d \
  --name opencode-redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Verify Redis**:
```bash
redis-cli ping
# Expected: PONG
```

### 5. OpenCode Configuration

**Kiểm tra OpenCode CLI**:
```bash
opencode --version
```

**Nếu chưa có**:
```bash
# Install OpenCode CLI
npm install -g opencode

# Verify
opencode --version
```

**Configure OpenCode**:
```bash
# Login to OpenCode (nếu cần)
opencode login

# Verify agents available
opencode agents list
```

---

## 📁 Project Structure

```
system-architect-opencode/
├── apps/
│   ├── web/                    # Angular Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/       # Core services
│   │   │   │   ├── features/   # Feature modules
│   │   │   │   └── shared/     # Shared components
│   │   │   └── environments/
│   │   └── package.json
│   │
│   └── api/                    # NestJS Backend
│       ├── src/
│       │   ├── auth/
│       │   ├── tasks/
│       │   ├── queue/
│       │   ├── opencode/
│       │   └── websocket/
│       └── package.json
│
├── infra/
│   └── docker/
│       └── docker-compose.dev.yml
│
├── docs/
│   └── (documentation)
│
├── roadmap/
│   ├── README.md
│   ├── phase-0-foundation.md
│   ├── phase-1-mvp-analyze.md
│   ├── phase-2-workflow-expansion.md
│   ├── phase-3-advanced-features.md
│   ├── phase-4-multi-role.md
│   ├── architecture-integration.md
│   └── project-setup-guide.md
│
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## 🛠️ Development Commands

### Frontend (Angular)
```bash
cd apps/web

# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run e2e tests
npm run e2e

# Lint code
npm run lint

# Format code
npm run format
```

### Backend (NestJS)
```bash
cd apps/api

# Start dev server
npm run start:dev

# Build
npm run build

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Database migrations
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```

### Docker
```bash
# Start all services
docker-compose -f infra/docker/docker-compose.dev.yml up -d

# Stop all services
docker-compose -f infra/docker/docker-compose.dev.yml down

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Rebuild
docker-compose up -d --build
```

---

## 🔍 Troubleshooting

### Issue 1: Port already in use
**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue 2: Cannot connect to Redis
**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
```bash
# Check if Redis is running
docker ps | grep redis

# If not, start it
docker start opencode-redis

# Or restart
docker-compose up -d redis
```

### Issue 3: Angular build errors
**Error**: `Cannot find module '@angular/core'`

**Solution**:
```bash
cd apps/web
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Database connection failed
**Error**: `Connection refused to database`

**Solution**:
```bash
# Check if database is running
docker ps | grep postgres

# If using SQLite, ensure directory exists
mkdir -p apps/api/data

# Check permissions
ls -la apps/api/data/
```

### Issue 5: Jira OAuth callback fails
**Error**: `redirect_uri mismatch`

**Solution**:
1. Kiểm tra Jira app settings
2. Đảm bảo callback URL khớp với `.env`
3. Format phải đúng: `http://localhost:4200/auth/callback`

---

## 🧪 Testing the Setup

### 1. API Health Check
```bash
curl http://localhost:3000/health

# Expected:
# {"status":"ok","timestamp":"2026-03-07T..."}
```

### 2. Login Flow
1. Mở http://localhost:4200
2. Click "Login with Jira"
3. Xác thực với Jira account
4. Redirect về app → Dashboard

### 3. Test Analyze Workflow
1. Vào Menu → Analyze
2. Chọn project path
3. Add Jira task: `TEST-123`
4. Click Start
5. Kiểm tra real-time progress

---

## 📚 Next Steps

Sau khi setup thành công:

1. **Đọc Roadmap**: Bắt đầu với [Phase 0](./phase-0-foundation.md)
2. **Setup IDE**: Configure VS Code với recommended extensions
3. **Run Tests**: Đảm bảo tất cả tests pass
4. **Create First Task**: Thử chạy workflow đầu tiên
5. **Review Architecture**: Đọc [Architecture Guide](./architecture-integration.md)

---

## 🆘 Getting Help

### Resources
- [Angular Documentation](https://angular.io/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [OpenCode Documentation](https://opencode.ai/docs)
- [Redis Commands](https://redis.io/commands/)

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm run start:dev

# Angular debug
ng serve --configuration=development
```

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env file configured
- [ ] Redis running
- [ ] Database connected
- [ ] Jira OAuth configured
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Login flow works
- [ ] Sample task execution works

**Setup Complete!** 🎉

---

**Guide Version**: 1.0.0  
**Last Updated**: March 2026  
**Next Update**: After Phase 1 completion
