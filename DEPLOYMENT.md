# MyQCM Deployment Documentation

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment Strategies](#deployment-strategies)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

This document outlines the deployment process for the MyQCM monorepo, which consists of:

- **Backend**: NestJS application (REST API + WebSocket server)
- **Frontend**: Next.js 14 application

## Prerequisites

### Required Software

- **Node.js**: v18.x or v20.x (LTS recommended)
- **npm**: v9.x or higher
- **PostgreSQL**: v14 or higher
- **Redis**: v6 or higher
- **Docker** (optional): v20.x or higher
- **Docker Compose** (optional): v2.x or higher

### Required Credentials

- PostgreSQL database credentials
- Redis connection details
- JWT secret keys
- Email service credentials (if applicable)
- Cloud storage credentials (if applicable)

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in `apps/backend/`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myqcm
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=myqcm_user
DB_PASSWORD=secure_password
DB_NAME=myqcm

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application
NODE_ENV=production
PORT=3001
API_PREFIX=api

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Email (if configured)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=noreply@example.com
MAIL_PASSWORD=email_password
MAIL_FROM=noreply@example.com

# File Upload
MAX_FILE_SIZE=5242880
```

### Frontend Environment Variables

Create a `.env.production` file in `apps/frontend/`:

```bash
# API Configuration
NEXT_PUBLIC_BASE_URL=https://api.your-domain.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is configured in `.github/workflows/ci.yml` and runs on:

- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop` branches

### Pipeline Stages

#### 1. Lint & Format Check

- Runs ESLint on backend and frontend
- Validates code formatting with Prettier
- **Duration**: ~1-2 minutes

#### 2. TypeScript Type Check

- Validates TypeScript types in both projects
- Ensures no type errors before deployment
- **Duration**: ~1-2 minutes

#### 3. Build Verification

- **Backend**: Compiles TypeScript to JavaScript
- **Frontend**: Creates production Next.js build
- Uploads build artifacts for inspection
- **Duration**: ~2-4 minutes

#### 4. Test Execution

- **Backend**: Runs Jest tests with PostgreSQL and Redis services
- **Frontend**: Runs tests if configured
- Generates code coverage reports
- **Duration**: ~2-5 minutes

#### 5. Security Audit

- Runs `npm audit` on both projects
- Checks for high-severity vulnerabilities
- **Duration**: ~30 seconds

#### 6. Docker Build

- Verifies backend Docker image can be built
- Uses buildx for multi-platform support
- **Duration**: ~2-3 minutes

### Pre-commit Hooks

Pre-commit hooks run automatically before each commit:

```bash
# Configured with Husky and lint-staged
- ESLint auto-fix on staged TypeScript files
- Prettier formatting on staged files
- Runs on both backend and frontend files
```

To bypass hooks (not recommended):

```bash
git commit --no-verify -m "Your message"
```

## Deployment Strategies

### 1. Continuous Deployment (Recommended)

**Suitable for**: Production environments with automated testing

1. Push code to `main` branch
2. CI/CD pipeline runs automatically
3. On success, deploy to staging environment
4. Run smoke tests
5. Deploy to production with zero downtime

### 2. Manual Deployment

**Suitable for**: Initial setup or critical hotfixes

Follow the [Manual Deployment](#manual-deployment) section below.

### 3. Blue-Green Deployment

**Suitable for**: Large-scale production with zero-downtime requirements

1. Deploy to "green" environment
2. Run health checks
3. Switch traffic from "blue" to "green"
4. Keep "blue" for quick rollback

## Docker Deployment

### Using Docker Compose (Development)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myqcm
      POSTGRES_USER: myqcm_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    ports:
      - '3001:3001'
    environment:
      DATABASE_URL: postgresql://myqcm_user:secure_password@postgres:5432/myqcm
      REDIS_HOST: redis
      REDIS_PORT: 6379
      NODE_ENV: production
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      NEXT_PUBLIC_BASE_URL: http://backend:3001
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

Run with:

```bash
docker-compose up -d
```

### Production Docker Deployment

**Backend:**

```bash
cd apps/backend
docker build -t myqcm-backend:latest .
docker run -d \
  --name myqcm-backend \
  -p 3001:3001 \
  --env-file .env \
  myqcm-backend:latest
```

**Frontend:**

```bash
cd apps/frontend
docker build -t myqcm-frontend:latest .
docker run -d \
  --name myqcm-frontend \
  -p 3000:3000 \
  --env-file .env.production \
  myqcm-frontend:latest
```

## Manual Deployment

### Backend Deployment

1. **Clone repository:**

   ```bash
   git clone <repository-url>
   cd myqcm-monorepo/apps/backend
   ```

2. **Install dependencies:**

   ```bash
   npm ci --only=production
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Build application:**

   ```bash
   npm run build
   ```

5. **Run database migrations:**

   ```bash
   # If using TypeORM migrations
   npm run migration:run
   ```

6. **Start application:**
   ```bash
   npm run start:prod
   ```

### Frontend Deployment

1. **Navigate to frontend:**

   ```bash
   cd apps/frontend
   ```

2. **Install dependencies:**

   ```bash
   npm ci --only=production
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

4. **Build application:**

   ```bash
   npm run build
   ```

5. **Start application:**
   ```bash
   npm run start
   ```

### Using PM2 (Process Manager)

**Install PM2:**

```bash
npm install -g pm2
```

**Backend:**

```bash
cd apps/backend
pm2 start dist/main.js --name myqcm-backend
pm2 save
pm2 startup
```

**Frontend:**

```bash
cd apps/frontend
pm2 start npm --name myqcm-frontend -- start
pm2 save
```

**PM2 Commands:**

```bash
pm2 list                  # List all processes
pm2 logs myqcm-backend    # View logs
pm2 restart myqcm-backend # Restart service
pm2 stop myqcm-backend    # Stop service
pm2 delete myqcm-backend  # Remove from PM2
```

## Monitoring and Health Checks

### Backend Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

### Frontend Health Check

```bash
curl http://localhost:3000/api/health
```

### Monitoring Best Practices

1. **Set up uptime monitoring**: Use services like UptimeRobot, Pingdom
2. **Application Performance Monitoring**: Consider New Relic, DataDog
3. **Error tracking**: Use Sentry or similar
4. **Log aggregation**: ELK Stack, CloudWatch, or similar

### Key Metrics to Monitor

- **Backend:**
  - Response time (avg, p95, p99)
  - Error rate
  - Database connection pool
  - Redis connection status
  - Memory usage
  - CPU usage

- **Frontend:**
  - Page load time
  - Core Web Vitals (LCP, FID, CLS)
  - Error rate
  - API request failures

## Rollback Procedures

### Quick Rollback (PM2)

```bash
# Backend
cd apps/backend
git checkout <previous-commit-hash>
npm run build
pm2 restart myqcm-backend

# Frontend
cd apps/frontend
git checkout <previous-commit-hash>
npm run build
pm2 restart myqcm-frontend
```

### Docker Rollback

```bash
# Tag your images with versions
docker tag myqcm-backend:latest myqcm-backend:v1.2.3

# Rollback to previous version
docker stop myqcm-backend
docker rm myqcm-backend
docker run -d \
  --name myqcm-backend \
  -p 3001:3001 \
  --env-file .env \
  myqcm-backend:v1.2.2
```

### Database Rollback

If migrations were run:

```bash
# Using TypeORM
npm run migration:revert
```

**Important:** Always backup your database before deployments!

## Troubleshooting

### Backend Won't Start

1. **Check database connection:**

   ```bash
   psql -h localhost -U myqcm_user -d myqcm
   ```

2. **Check Redis connection:**

   ```bash
   redis-cli ping
   ```

3. **Check logs:**

   ```bash
   pm2 logs myqcm-backend
   # or
   docker logs myqcm-backend
   ```

4. **Verify environment variables:**
   ```bash
   cat .env
   ```

### Frontend Build Fails

1. **Clear cache:**

   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Check API connectivity:**
   ```bash
   curl $NEXT_PUBLIC_BASE_URL/health
   ```

### High Memory Usage

1. **Check for memory leaks:**

   ```bash
   node --inspect dist/main.js
   ```

2. **Increase Node.js memory:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run start:prod
   ```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use the provided script
npm run prestart:dev  # For backend
```

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database SSL connections
- [ ] Secure Redis with password
- [ ] Set appropriate file upload limits
- [ ] Configure helmet for security headers
- [ ] Set up Web Application Firewall (WAF)
- [ ] Enable logging and monitoring
- [ ] Regular security audits (`npm audit`)
- [ ] Keep dependencies updated

## Performance Optimization

### Backend

- Enable response compression (gzip)
- Implement caching strategies (Redis)
- Use connection pooling for database
- Enable clustering for multi-core systems
- Optimize database queries and indexes

### Frontend

- Enable Next.js image optimization
- Implement code splitting
- Use CDN for static assets
- Enable browser caching
- Minimize bundle size
- Implement lazy loading

## Support and Resources

- **Documentation**: See `/README.md` for development guide
- **Issues**: Report at GitHub repository
- **CI/CD Logs**: Check GitHub Actions tab

## Change Log

| Date       | Version | Changes                          | Author      |
| ---------- | ------- | -------------------------------- | ----------- |
| 2025-10-30 | 1.0.0   | Initial deployment documentation | CI/CD Setup |

---

**Last Updated:** October 30, 2025
**Maintained by:** Development Team
