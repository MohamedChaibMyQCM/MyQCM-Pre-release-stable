# GitHub Actions Workflows

This directory contains the CI/CD workflow configurations for the MyQCM monorepo.

## Available Workflows

### 1. CI/CD Pipeline (`ci.yml`)

Main continuous integration and continuous deployment workflow.

**Triggers:**

- Push to `main`, `develop`, `claude/**` branches
- Pull requests to `main`, `develop` branches

**Jobs:**

- Lint & Format Check
- TypeScript Type Check
- Backend Build
- Frontend Build
- Backend Tests (with PostgreSQL & Redis)
- Frontend Tests
- Security Audit
- Docker Build Verification

**Status Badge:**

```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
```

## Workflow Management

### Viewing Workflow Runs

1. Go to the repository's Actions tab
2. Select the workflow from the left sidebar
3. View run history and details

### Re-running Failed Jobs

1. Open the failed workflow run
2. Click "Re-run jobs" button
3. Select "Re-run failed jobs" or "Re-run all jobs"

### Canceling Running Workflows

1. Open the running workflow
2. Click "Cancel workflow" button

## Debugging Workflows

### Enable Debug Logging

Add these secrets to repository:

- `ACTIONS_RUNNER_DEBUG`: `true`
- `ACTIONS_STEP_DEBUG`: `true`

### Common Issues

**Issue:** npm ci fails with network errors
**Solution:** Retry the job or check npm registry status

**Issue:** Tests timeout
**Solution:** Increase timeout or optimize tests

**Issue:** Docker build fails
**Solution:** Check Dockerfile and context

## Adding New Workflows

1. Create new `.yml` file in this directory
2. Define trigger events
3. Add jobs and steps
4. Test in a feature branch first

## Best Practices

- Use semantic workflow names
- Add clear descriptions
- Use matrix builds for multiple versions
- Cache dependencies when possible
- Set appropriate timeouts
- Use secrets for sensitive data
- Document workflow purpose

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [CI/CD Documentation](../CICD.md)
