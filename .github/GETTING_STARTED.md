# Getting Started with MyQCM Development

## Quick Start Guide

This guide will help you set up your development environment and understand the CI/CD workflow.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.x or v20.x ([Download](https://nodejs.org/))
- **npm** v9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized development) ([Download](https://www.docker.com/))

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd myqcm-monorepo
```

### 2. Install Dependencies

#### Option A: Install All Dependencies at Once (Recommended)

```bash
npm run install-deps
```

This will install dependencies for:

- Root workspace
- Backend application
- Frontend application

#### Option B: Install Individually

```bash
# Root dependencies (includes Husky, lint-staged)
npm install

# Backend dependencies
cd apps/backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up Environment Variables

#### Backend

```bash
cd apps/backend
cp .env.example .env
# Edit .env with your local configuration
```

#### Frontend

```bash
cd apps/frontend
cp .env.example .env.local
# Edit .env.local with your local configuration
```

### 4. Start Database Services

#### Option A: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis
```

#### Option B: Install Locally

- Install PostgreSQL 15 and create database `myqcm`
- Install Redis 7

### 5. Run Database Migrations (if applicable)

```bash
cd apps/backend
npm run migration:run  # If using TypeORM migrations
```

## Development Workflow

### Starting the Development Servers

#### Option 1: Start Everything

```bash
npm run dev
```

This starts both backend (port 3001) and frontend (port 3000) concurrently.

#### Option 2: Start Individually

```bash
# Backend only
npm run dev-backend

# Frontend only
npm run dev-frontend
```

### Running Quality Checks

Before committing, it's good practice to run:

```bash
# Lint all code
npm run lint

# Check code formatting
npm run format:check

# Type check TypeScript
npm run type-check

# Run tests
npm run test

# Build everything
npm run build
```

### Pre-commit Hooks

Pre-commit hooks are automatically set up via Husky. They will:

1. Run ESLint with auto-fix on staged files
2. Run Prettier to format code
3. Automatically stage fixed files

**How it works:**

```bash
git add apps/backend/src/some-file.ts
git commit -m "Add feature"
# Hook runs automatically, fixes issues, and commits
```

**If the hook fails:**

- Fix the reported issues
- Stage the files again
- Retry the commit

## Working with Git

### Branch Naming Convention

- **Feature branches**: `feature/description` or `claude/description`
- **Bug fixes**: `fix/description`
- **Hotfixes**: `hotfix/description`

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Examples:**

```bash
git commit -m "feat(backend): add user authentication"
git commit -m "fix(frontend): correct login form validation"
git commit -m "docs: update deployment guide"
git commit -m "test(backend): add tests for adaptive engine"
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit changes**

   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

4. **Push to remote**

   ```bash
   git push -u origin feature/my-feature
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in description
   - Wait for CI/CD checks to pass

6. **Address Review Comments**
   - Make requested changes
   - Push additional commits
   - CI/CD runs automatically

7. **Merge**
   - Once approved and checks pass
   - Merge using GitHub interface

## CI/CD Pipeline

### What Runs on Every Push/PR

1. **Lint & Format Check**: Ensures code style consistency
2. **Type Check**: Validates TypeScript types
3. **Build**: Compiles both backend and frontend
4. **Tests**: Runs backend tests with PostgreSQL and Redis
5. **Security Audit**: Checks for vulnerabilities
6. **Docker Build**: Verifies Docker image builds

### Viewing CI/CD Results

1. Go to repository's **Actions** tab
2. Click on your workflow run
3. View job results and logs

### If CI/CD Fails

1. **Check the logs**: Click on the failed job to see error details
2. **Fix locally**: Reproduce and fix the issue
3. **Run checks locally**:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   npm run test
   ```
4. **Push fixes**: Commit and push the fixes

## Docker Development

### Using Docker Compose

Start all services:

```bash
docker-compose up
```

Start in detached mode:

```bash
docker-compose up -d
```

View logs:

```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

Stop services:

```bash
docker-compose down
```

Rebuild services:

```bash
docker-compose up --build
```

### Individual Docker Commands

**Backend:**

```bash
cd apps/backend
docker build -t myqcm-backend .
docker run -p 3001:3001 myqcm-backend
```

**Frontend:**

```bash
cd apps/frontend
docker build -t myqcm-frontend .
docker run -p 3000:3000 myqcm-frontend
```

## Useful Commands

### Root Level

```bash
npm run dev              # Start both backend and frontend
npm run lint             # Lint all code
npm run format           # Format all code
npm run type-check       # Check TypeScript types
npm run build            # Build all projects
npm run test             # Run all tests
npm run install-deps     # Install all dependencies
```

### Backend

```bash
cd apps/backend
npm run start:dev        # Start development server
npm run start:debug      # Start with debugger
npm run build            # Build production
npm run start:prod       # Run production build
npm run lint             # Lint backend
npm run format           # Format backend
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run E2E tests
```

### Frontend

```bash
cd apps/frontend
npm run dev              # Start development server
npm run build            # Build production
npm run start            # Run production build
npm run lint             # Lint frontend
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001 (backend)
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use backend script
cd apps/backend
npm run prestart:dev
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists:
   ```bash
   psql -h localhost -U myqcm_user -d myqcm
   ```

### Redis Connection Issues

1. Ensure Redis is running
2. Test connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or for specific app
cd apps/backend  # or apps/frontend
rm -rf node_modules package-lock.json
npm install
```

### Pre-commit Hook Issues

```bash
# Reinstall hooks
rm -rf .husky
npm run prepare

# Or manually trigger lint-staged
npx lint-staged
```

### Type Errors

```bash
# Check types without emitting files
npm run type-check

# Or per app
cd apps/backend && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit
```

## IDE Setup

### VS Code (Recommended)

Install these extensions:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

**Settings (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### WebStorm/IntelliJ IDEA

1. Enable ESLint: Preferences > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint
2. Enable Prettier: Preferences > Languages & Frameworks > JavaScript > Prettier
3. Check "On save" for both

## Resources

- [README.md](../README.md) - Project overview and features
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide
- [CI/CD Documentation](.github/CICD.md) - Detailed CI/CD information
- [GitHub Actions](https://docs.github.com/en/actions) - GitHub Actions docs

## Getting Help

- Check existing issues on GitHub
- Review documentation
- Ask in team chat/discussions
- Create a new issue with details

## Best Practices

### Code Quality

- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow TypeScript best practices
- Use meaningful variable names

### Security

- Never commit secrets or credentials
- Use environment variables
- Keep dependencies updated
- Review security audit warnings

### Performance

- Optimize database queries
- Use caching where appropriate
- Minimize bundle sizes
- Implement lazy loading

### Git

- Keep commits focused and small
- Pull before pushing
- Don't commit directly to main
- Review your own code before PR

---

**Happy coding!** If you have questions, check the documentation or ask the team.
