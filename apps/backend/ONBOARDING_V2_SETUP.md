# OnboardingV2 & Feature Announcements - Setup Guide

⚠️ **IMPORTANT:** Critical fixes have been applied to the migration. See `CRITICAL_FIXES_ONBOARDING_V2.md` for complete details.

This guide explains how to set up the database for the new OnboardingV2 system and Feature Announcements.

## Prerequisites

- PostgreSQL database running
- Backend application configured with database credentials
- Node.js and npm installed

## ⚠️ Migration Files

**USE:** `1763300000001-CreateFeatureAnnouncementTablesFixed.ts` ✅ (Corrected version)

**DO NOT USE:** `1763300000000-CreateFeatureAnnouncementTables.ts` ❌ (Has critical bugs)

The original migration had 6 critical issues including wrong table names, missing columns, and field name mismatches. If you already ran the old migration, see `CRITICAL_FIXES_ONBOARDING_V2.md` for recovery steps.

## Step 1: Run Database Migration

The migration will create the following tables:
- `feature_announcements` (plural) - Stores feature announcements/updates
- `feature_interactions` (plural) - Tracks user interactions with features

### Option A: Using TypeORM CLI

```bash
# Navigate to backend directory
cd apps/backend

# Run the migration
npm run typeorm migration:run

# Or if using yarn
yarn typeorm migration:run
```

### Option B: Manual Migration (if TypeORM CLI not configured)

```bash
# Navigate to backend directory
cd apps/backend

# Run with ts-node
npx ts-node ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts
```

### Verify Migration

Check your PostgreSQL database to ensure the tables were created:

```sql
-- Connect to your database and run:
\dt feature_*

-- You should see:
-- feature_announcement
-- feature_interaction
```

## Step 2: Seed Test Data

To populate the database with sample feature announcements for testing:

### Option A: Using Seed Script

```bash
# Navigate to backend directory
cd apps/backend

# Run the seed script
npx ts-node src/seeds/feature-announcement.seed.ts
```

### Option B: Manual Insert (SQL)

Connect to your PostgreSQL database and run:

```sql
INSERT INTO feature_announcement (
  id,
  title,
  description,
  type,
  target_roles,
  release_date,
  is_active,
  priority,
  "createdAt",
  "updatedAt"
) VALUES
(
  gen_random_uuid(),
  'Système de Streak amélioré',
  'Nous avons repensé le système de streak pour être plus motivant ! Maintenez votre série quotidienne et débloquez des badges exclusifs.',
  'major',
  '["user"]'::jsonb,
  '2025-01-15'::timestamp,
  true,
  100,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Nouveau système de notifications',
  'Recevez des notifications intelligentes pour ne jamais manquer une mise à jour importante.',
  'minor',
  '["user"]'::jsonb,
  '2025-01-20'::timestamp,
  true,
  90,
  NOW(),
  NOW()
);
```

## Step 3: Start the Application

```bash
# Start backend
cd apps/backend
npm run start:dev

# Start frontend (in another terminal)
cd apps/frontend
npm run dev
```

## Step 4: Test the Integration

### Test in the UI:

1. **Login** to the application as a student
2. **Check the Dashboard Header** - You should see a "✨ Nouveautés" button
3. **Click the button** - The "What's New" modal should open showing feature announcements
4. **Visit /changelog** - You should see the full changelog page
5. **Achievement Toasts** - Complete an action to see achievement notifications

### Test via API:

```bash
# Get new features for current user
curl -X GET http://localhost:3000/api/feature-announcements/new \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark feature as seen
curl -X POST http://localhost:3000/api/feature-announcements/FEATURE_ID/seen \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get changelog
curl -X GET http://localhost:3000/api/feature-announcements/changelog
```

### Test in AdminJS:

1. Navigate to `http://localhost:3000/admin`
2. Login with admin credentials
3. You should see:
   - **Annonces de fonctionnalités** section
   - **Feature Announcements** resource
   - **Feature Interactions** resource
4. Try creating a new feature announcement

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- The tables already exist. You can either:
  - Revert the migration: `npm run typeorm migration:revert`
  - Or skip this migration if tables are correct

**Error: "Cannot find module"**
- Ensure TypeORM is installed: `npm install typeorm`
- Check your data-source configuration path

### Seed Fails

**Error: "data source not initialized"**
- Make sure the backend is not running when seeding
- Or seed through the AdminJS interface instead

### Frontend Issues

**Error: "Cannot find module '@/components/onboarding-v2'"**
- Make sure you've pulled all frontend changes
- Run `npm install` in the frontend directory

**Modal not showing**
- Check browser console for errors
- Verify the `useWhatsNew` hook is returning data
- Check that the API endpoints are accessible

## Architecture Overview

### Backend Structure

```
apps/backend/src/
├── feature-announcement/
│   ├── entities/
│   │   ├── feature-announcement.entity.ts
│   │   └── feature-interaction.entity.ts
│   ├── dto/
│   │   ├── create-feature-announcement.dto.ts
│   │   └── update-feature-announcement.dto.ts
│   ├── feature-announcement.controller.ts
│   ├── feature-announcement.service.ts
│   └── feature-announcement.module.ts
├── migrations/
│   └── 1763300000000-CreateFeatureAnnouncementTables.ts
└── seeds/
    └── feature-announcement.seed.ts
```

### Frontend Structure

```
apps/frontend/src/
├── components/onboarding-v2/
│   ├── OnboardingV2.jsx           # Main orchestrator
│   ├── WhatsNewModal.jsx          # Feature announcement modal
│   ├── Changelog.jsx              # Full changelog page
│   ├── AchievementToast.jsx       # Achievement notifications
│   ├── ConfettiExplosion.jsx      # Celebration effects
│   └── AccessibilityUtils.jsx     # Accessible components
├── hooks/
│   ├── useWhatsNew.js             # React Query hook for API
│   ├── useSoundEffects.js         # Sound system
│   └── useAccessibility.js        # Accessibility hooks
├── context/
│   └── OnboardingV2Context.jsx    # Global state management
└── app/
    ├── layout.jsx                 # Root layout with providers
    └── changelog/
        └── page.jsx               # Changelog route
```

### API Endpoints

- `GET /api/feature-announcements/new` - Get unseen features for logged-in user
- `POST /api/feature-announcements/:id/seen` - Mark feature as seen
- `POST /api/feature-announcements/:id/tried` - Mark feature as tried
- `POST /api/feature-announcements/:id/dismissed` - Dismiss feature
- `GET /api/feature-announcements/changelog` - Get full changelog

### Database Schema

**feature_announcement**
- `id` (uuid, primary key)
- `title` (varchar 200)
- `description` (text)
- `type` (enum: major, minor, update, bugfix)
- `media_url` (varchar 500, nullable)
- `media_type` (enum: image, video, lottie, nullable)
- `cta_label` (varchar 100, nullable)
- `cta_link` (varchar 500, nullable)
- `target_roles` (jsonb, default: ["user"])
- `release_date` (timestamp, default: now)
- `is_active` (boolean, default: true)
- `priority` (int, default: 0)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**feature_interaction**
- `id` (uuid, primary key)
- `has_seen` (boolean, default: false)
- `has_tried` (boolean, default: false)
- `has_dismissed` (boolean, default: false)
- `seen_at` (timestamp, nullable)
- `tried_at` (timestamp, nullable)
- `dismissed_at` (timestamp, nullable)
- `featureId` (uuid, foreign key → feature_announcement)
- `userId` (uuid, foreign key → user)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Next Steps

1. ✅ Migration applied
2. ✅ Test data seeded
3. ✅ Application running
4. ✅ UI tested
5. 🎯 Create real feature announcements via AdminJS
6. 🎯 Monitor analytics in AdminJS
7. 🎯 Deploy to production

## Support

If you encounter any issues:
1. Check the backend logs: `apps/backend/logs/`
2. Check browser console for frontend errors
3. Verify database connections
4. Check AdminJS at `/admin` for data verification

## Production Checklist

Before deploying to production:

- [ ] Run migration on production database
- [ ] Create real feature announcements (not test data)
- [ ] Test with different user roles (user, admin, freelancer)
- [ ] Verify performance with many announcements
- [ ] Test with different browsers
- [ ] Test mobile responsiveness
- [ ] Set up monitoring for API endpoints
- [ ] Configure proper error tracking
- [ ] Set up analytics for feature interactions

---

**Created:** 2025-11-05
**Version:** 1.0.0
**Part of:** OnboardingV2 System
