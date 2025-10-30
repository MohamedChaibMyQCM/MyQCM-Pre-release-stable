# CI/CD Pipeline Documentation

## Overview

This document provides detailed information about the CI/CD pipeline configuration for the MyQCM monorepo.

## Pipeline Architecture

The CI/CD pipeline is implemented using **GitHub Actions** and consists of multiple parallel and sequential jobs that ensure code quality, type safety, and build integrity.

## Workflow Triggers

The pipeline is triggered on:

- **Push events** to:
  - `main` branch (production)
  - `develop` branch (staging)
  - `claude/**` branches (feature branches)
- **Pull request events** to:
  - `main` branch
  - `develop` branch

## Jobs Overview

### 1. Lint and Format Check (`lint-and-format`)

**Purpose**: Ensures code follows consistent style guidelines

**Steps:**

1. Checkout code
2. Setup Node.js 18 with npm caching
3. Install dependencies (root, backend, frontend)
4. Run ESLint on backend (`npm run lint`)
5. Run Prettier format check on backend (`npm run format`)
6. Run ESLint on frontend (`npm run lint`)

**Duration**: ~1-2 minutes

**Failure Conditions:**

- ESLint errors found
- Code formatting issues detected
- Linting configuration errors

### 2. TypeScript Type Check (`type-check`)

**Purpose**: Validates TypeScript types without emitting files

**Steps:**

1. Checkout code
2. Setup Node.js 18 with npm caching
3. Install dependencies
4. Run `tsc --noEmit` on backend
5. Run `tsc --noEmit` on frontend

**Duration**: ~1-2 minutes

**Failure Conditions:**

- Type errors in backend
- Type errors in frontend
- Missing type definitions

### 3. Build Backend (`build-backend`)

**Purpose**: Verifies backend can be built successfully

**Steps:**

1. Checkout code
2. Setup Node.js 18 with npm caching
3. Install backend dependencies
4. Run `npm run build` (compiles TypeScript)
5. Verify build artifacts:
   - Check `dist/` directory exists
   - Check `dist/main.js` exists
6. Upload build artifacts (retained for 7 days)

**Duration**: ~2-3 minutes

**Build Output**: `apps/backend/dist/`

**Failure Conditions:**

- TypeScript compilation errors
- Missing dependencies
- Build script failures
- Missing required files after build

### 4. Build Frontend (`build-frontend`)

**Purpose**: Verifies frontend can be built successfully

**Steps:**

1. Checkout code
2. Setup Node.js 18 with npm caching
3. Install frontend dependencies
4. Run `npm run build` (Next.js production build)
5. Verify `.next/` directory exists
6. Upload build artifacts (retained for 7 days)

**Duration**: ~2-4 minutes

**Build Output**: `apps/frontend/.next/`

**Environment Variables:**

- `NEXT_PUBLIC_BASE_URL`: Set to `http://localhost:3001`

**Failure Conditions:**

- Next.js build errors
- Missing environment variables
- Invalid imports or components
- Build optimization failures

### 5. Test Backend (`test-backend`)

**Purpose**: Runs backend tests with real database and cache services

**Services:**

- **PostgreSQL 15**: Test database on port 5432
- **Redis 7**: Cache/queue service on port 6379

**Steps:**

1. Start PostgreSQL and Redis services
2. Wait for health checks to pass
3. Checkout code
4. Setup Node.js 18 with npm caching
5. Install backend dependencies
6. Run Jest tests with coverage (`npm run test -- --coverage --passWithNoTests`)
7. Upload coverage reports to Codecov (optional)

**Duration**: ~2-5 minutes

**Environment Variables:**

- `DATABASE_URL`: `postgresql://test:test@localhost:5432/myqcm_test`
- `REDIS_HOST`: `localhost`
- `REDIS_PORT`: `6379`

**Failure Conditions:**

- Test failures
- Database connection issues
- Redis connection issues
- Timeout errors

### 6. Test Frontend (`test-frontend`)

**Purpose**: Runs frontend tests if configured

**Steps:**

1. Checkout code
2. Setup Node.js 18 with npm caching
3. Install frontend dependencies
4. Run tests with `--if-present` flag
5. Run with `--passWithNoTests` to prevent failure if no tests

**Duration**: ~1 minute

**Note**: Currently passes as frontend tests are not configured

### 7. Security Audit (`security-scan`)

**Purpose**: Identifies security vulnerabilities in dependencies

**Steps:**

1. Checkout code
2. Setup Node.js 18
3. Run `npm audit --audit-level=high --production` on backend
4. Run `npm audit --audit-level=high --production` on frontend

**Duration**: ~30 seconds

**Note**: Continues on error (non-blocking)

**Audit Level**: `high` - Only reports high and critical vulnerabilities

### 8. Docker Build Verification (`docker-build`)

**Purpose**: Ensures backend Docker image can be built

**Steps:**

1. Checkout code
2. Setup Docker Buildx
3. Build backend Docker image
4. Use GitHub Actions cache for layers

**Duration**: ~2-3 minutes

**Cache Strategy:**

- Cache from: GitHub Actions cache
- Cache to: GitHub Actions cache (max mode)

**Failure Conditions:**

- Dockerfile syntax errors
- Missing dependencies in Docker context
- Build command failures

### 9. All Checks Passed (`all-checks-passed`)

**Purpose**: Final validation that all required checks succeeded

**Dependencies**: Waits for all previous jobs

**Steps:**

1. Check status of all required jobs
2. Fail if any required job failed
3. Pass if all required jobs succeeded

**Required Jobs:**

- lint-and-format
- type-check
- build-backend
- build-frontend
- test-backend
- test-frontend

**Always Runs**: Yes (even if previous jobs fail)

## Pre-commit Hooks

### Configuration

Pre-commit hooks are managed by **Husky** and **lint-staged**.

**Location**: `.husky/pre-commit`

**Trigger**: Before each `git commit`

### What Runs

Configured in `package.json` under `lint-staged`:

```json
{
  "lint-staged": {
    "apps/backend/**/*.{ts,js}": ["eslint --fix", "prettier --write"],
    "apps/frontend/**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Behavior

1. **Staged files only**: Only files added to git staging area are checked
2. **Auto-fix**: ESLint and Prettier automatically fix issues
3. **Modified files**: Fixed files are re-staged automatically
4. **Abort on error**: Commit is aborted if fixes cannot be applied

### Bypassing Hooks

**Not recommended**, but possible in emergencies:

```bash
git commit --no-verify -m "Emergency fix"
```

## Environment Variables for CI

### Required Secrets

Configure in GitHub Settings > Secrets and Variables > Actions:

```bash
# Optional: For Codecov integration
CODECOV_TOKEN=<your-codecov-token>

# Optional: For Docker registry
DOCKER_USERNAME=<docker-username>
DOCKER_PASSWORD=<docker-password>

# Optional: For deployment
DEPLOY_SSH_KEY=<ssh-private-key>
DEPLOY_HOST=<deployment-host>
```

### Environment-specific Variables

```bash
# Development/Staging
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Production
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://api.yourdomain.com
```

## Optimization Strategies

### 1. Caching

**npm cache**: Enabled on all jobs

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
```

**Docker cache**: Uses GitHub Actions cache

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

### 2. Parallelization

Jobs run in parallel where possible:

- `lint-and-format`, `type-check`, `build-backend`, `build-frontend` all run in parallel
- `test-backend` and `test-frontend` run in parallel

### 3. Conditional Execution

- Security scan continues on error (non-blocking)
- Frontend tests use `--if-present` (optional)
- Docker build only runs on backend changes (future optimization)

## Troubleshooting

### Job Fails: "npm ci" timeout

**Solution**: Increase timeout or check network issues

```yaml
timeout-minutes: 15
```

### Job Fails: "Port already in use"

**Solution**: GitHub Actions provides clean runners, but check service configuration

```yaml
services:
  postgres:
    ports:
      - 5432:5432 # Ensure unique ports
```

### Job Fails: "Module not found"

**Solution**: Ensure all dependencies are in package.json, not just devDependencies

```bash
npm install --save <package-name>
```

### Pre-commit Hook Issues

**Skip hook temporarily:**

```bash
git commit --no-verify
```

**Reset hooks:**

```bash
rm -rf .husky
npm run prepare
```

**Manual lint-staged:**

```bash
npx lint-staged
```

## Performance Metrics

Typical pipeline duration:

- **Fast path** (lint + type-check only): ~2-3 minutes
- **Full pipeline** (all checks): ~5-10 minutes
- **With cache hits**: ~4-6 minutes
- **Without cache**: ~8-12 minutes

## Future Enhancements

### Planned Improvements

1. **Automated Deployment**
   - Deploy to staging on `develop` push
   - Deploy to production on `main` push with approval

2. **E2E Testing**
   - Add Playwright or Cypress tests
   - Run on preview deployments

3. **Visual Regression Testing**
   - Screenshot comparison for UI changes
   - Percy or Chromatic integration

4. **Performance Testing**
   - Lighthouse CI for frontend
   - Load testing for backend APIs

5. **Dependency Updates**
   - Dependabot configuration
   - Automated PR for dependency updates

6. **Code Quality Metrics**
   - SonarCloud integration
   - Code coverage tracking
   - Technical debt monitoring

7. **Notification System**
   - Slack notifications on failures
   - Discord webhook for deployments

## Best Practices

### For Developers

1. **Run checks locally before pushing**

   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

2. **Keep commits small and focused**
   - Easier to debug CI failures
   - Faster review process

3. **Write meaningful commit messages**
   - Helps track changes in CI logs

4. **Don't bypass pre-commit hooks**
   - They catch issues early

### For Maintainers

1. **Monitor pipeline performance**
   - Review Actions usage limits
   - Optimize slow jobs

2. **Keep dependencies updated**
   - Regular security patches
   - Test with latest Node.js versions

3. **Review failed builds promptly**
   - Unblock developers quickly
   - Fix flaky tests

4. **Document changes**
   - Update this file when modifying CI
   - Communicate breaking changes

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Jest Documentation](https://jestjs.io/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)

## Support

For CI/CD issues:

1. Check GitHub Actions logs
2. Review this documentation
3. Contact the DevOps team
4. Create an issue in the repository

---

**Last Updated:** October 30, 2025
**Pipeline Version:** 1.0.0
