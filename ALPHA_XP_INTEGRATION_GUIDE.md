# Alpha Feature XP System - Integration Guide

## 🎯 Overview
The Alpha XP system rewards users for testing Labs features with up to **225 XP per feature**.

### XP Breakdown:
- **Testing Bonus**: 50 XP (just for trying it)
- **Time Spent**: Up to 100 XP (5 XP/minute, max 20 minutes)
- **Feedback Quality**: Up to 75 XP (50 for 5-star rating + 25 for detailed feedback)

---

## 📦 What's Been Created

### Backend Files:
```
apps/backend/
├── src/user/
│   ├── entities/user-alpha-activity.entity.ts
│   ├── services/user-alpha-activity.service.ts
│   ├── controllers/user-alpha-activity.controller.ts
│   └── types/dtos/
│       ├── start-alpha-session.dto.ts
│       └── complete-alpha-session.dto.ts
├── config/
│   └── default-alpha-xp.config.ts
└── shared/interfaces/
    └── alpha-xp-config.interface.ts
```

### Frontend Files:
```
apps/frontend/src/app/demo/clinical-case/components/
├── AlphaXpExplanationModal.tsx  (Shows XP info before start)
└── AlphaXpRewardsModal.tsx      (Celebrates XP earned)
```

---

## 🔌 API Endpoints

### 1. Get XP Configuration
```typescript
GET /user/alpha-activity/xp-config

Response:
{
  "success": true,
  "data": {
    "testingReward": { "baseXp": 50, "description": "..." },
    "timeSpentReward": { "xpPerMinute": 5, "maxXp": 100, ... },
    "feedbackQualityReward": { ... }
  }
}
```

### 2. Start Alpha Session
```typescript
POST /user/alpha-activity/start
Body: {
  "feature_id": "clinical-case-demo",
  "feature_name": "Cas clinique interactif"
}

Response:
{
  "success": true,
  "data": {
    "activity_id": "uuid",
    "started_at": "2024-01-01T10:00:00Z"
  }
}
```

### 3. Complete Session & Award XP
```typescript
POST /user/alpha-activity/complete
Body: {
  "activity_id": "uuid",
  "rating": 5,
  "feedback_text": "Great feature!"
}

Response:
{
  "success": true,
  "data": {
    "total_xp_earned": 175,
    "testing_xp": 50,
    "time_spent_xp": 100,
    "feedback_quality_xp": 75,
    "time_spent_minutes": 20,
    "breakdown": { ... }
  }
}
```

### 4. Check Completion Status
```typescript
GET /user/alpha-activity/check-completion?feature_id=clinical-case-demo

Response:
{
  "success": true,
  "data": { "has_completed": false }
}
```

---

## 🎨 Frontend Integration

### Step 1: Add Modals to Your Component

```tsx
import { AlphaXpExplanationModal } from "./components/AlphaXpExplanationModal";
import { AlphaXpRewardsModal } from "./components/AlphaXpRewardsModal";
import { useState } from "react";

export function AlphaFeaturePage() {
  const [showXpExplanation, setShowXpExplanation] = useState(false);
  const [showXpRewards, setShowXpRewards] = useState(false);
  const [xpRewards, setXpRewards] = useState(null);
  const [alphaActivityId, setAlphaActivityId] = useState<string | null>(null);

  // ... rest of component
}
```

### Step 2: Show Explanation Before Starting

```tsx
// Show explanation modal before starting the feature
useEffect(() => {
  // Check if user has already completed this feature
  BaseUrl.get("/user/alpha-activity/check-completion", {
    params: { feature_id: "clinical-case-demo" }
  }).then((response) => {
    if (!response.data?.data?.has_completed) {
      setShowXpExplanation(true);
    }
  });
}, []);

const handleStartAlphaFeature = async () => {
  try {
    // Start tracking the session
    const response = await BaseUrl.post("/user/alpha-activity/start", {
      feature_id: "clinical-case-demo",
      feature_name: "Cas clinique interactif"
    });

    setAlphaActivityId(response.data?.data?.activity_id);
    // Continue with feature...
  } catch (error) {
    console.error("Failed to start alpha session:", error);
  }
};
```

### Step 3: Award XP After Feedback

```tsx
const handleFeedbackSubmitted = async (rating: number, feedbackText: string) => {
  if (!alphaActivityId) return;

  try {
    // Complete session and award XP
    const response = await BaseUrl.post("/user/alpha-activity/complete", {
      activity_id: alphaActivityId,
      rating: rating,
      feedback_text: feedbackText
    });

    // Show rewards modal with confetti!
    setXpRewards(response.data?.data);
    setShowXpRewards(true);
  } catch (error) {
    console.error("Failed to complete alpha session:", error);
  }
};
```

### Step 4: Add the Modal Components

```tsx
return (
  <>
    {/* Your feature content */}
    <YourFeatureContent />

    {/* XP Explanation Modal */}
    <AlphaXpExplanationModal
      open={showXpExplanation}
      onClose={() => setShowXpExplanation(false)}
      onStart={handleStartAlphaFeature}
      featureName="Cas clinique interactif"
    />

    {/* XP Rewards Modal */}
    <AlphaXpRewardsModal
      open={showXpRewards}
      onClose={() => {
        setShowXpRewards(false);
        router.push("/dashboard");
      }}
      rewards={xpRewards}
    />
  </>
);
```

---

## 🔗 Integrating with Labs Page

### Update Labs Page Card:

```tsx
// In apps/frontend/src/app/dashboard/labs/page.jsx

const [showXpExplanation, setShowXpExplanation] = useState(false);

// Modify the "Lancer la démo" button:
<Link
  href="/demo/clinical-case"
  onClick={(e) => {
    e.preventDefault();
    setShowXpExplanation(true);
  }}
  className="..."
>
  Lancer la démo
</Link>

// Add the modal:
<AlphaXpExplanationModal
  open={showXpExplanation}
  onClose={() => setShowXpExplanation(false)}
  onStart={() => router.push("/demo/clinical-case")}
  featureName="Cas clinique interactif"
/>
```

---

## 🗄️ Database Migration

Run this migration to create the table:

```bash
cd apps/backend
npm run migration:generate -- AddAlphaActivity
npm run migration:run
```

Or manually create:

```sql
CREATE TABLE user_alpha_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id VARCHAR(100) NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  testing_xp INT DEFAULT 0,
  time_spent_xp INT DEFAULT 0,
  feedback_quality_xp INT DEFAULT 0,
  total_xp_earned INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  feedback_rating INT,
  feedback_text TEXT,
  xp_awarded BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_alpha_activity ON user_alpha_activity(user_id);
```

---

## 🎨 UI Features

### AlphaXpExplanationModal:
- ✅ Displays all 3 XP categories
- ✅ Shows max XP potential
- ✅ Animated entrance
- ✅ Fetches live config from API
- ✅ Cancel or Start buttons

### AlphaXpRewardsModal:
- ✅ Confetti celebration 🎉
- ✅ Animated XP reveal
- ✅ Breakdown of earned XP
- ✅ "View ranking" CTA
- ✅ Trophy icon and gradient header

---

## 📊 Configuration

Edit XP values in: `apps/backend/config/default-alpha-xp.config.ts`

```typescript
export const DefaultAlphaXpConfig: AlphaXpConfigInterface = {
  testingReward: {
    baseXp: 50,  // Change this
    description: "Bonus for testing a new alpha feature",
  },
  timeSpentReward: {
    xpPerMinute: 5,  // Change this
    maxXp: 100,      // Change this
    minMinutes: 1,
    description: "XP based on time spent",
  },
  feedbackQualityReward: {
    rating1Xp: 10,
    rating2Xp: 20,
    rating3Xp: 30,
    rating4Xp: 40,
    rating5Xp: 50,  // Change this
    withTextBonus: 25,  // Change this
    minTextLength: 50,
    description: "XP based on rating and feedback",
  },
};
```

---

## 🚀 Quick Start Checklist

- [ ] Run database migration
- [ ] Start backend server
- [ ] Test `/user/alpha-activity/xp-config` endpoint
- [ ] Import modals in clinical case page
- [ ] Add state management for modals
- [ ] Test complete flow:
  - Open labs page
  - Click "Lancer la démo"
  - See XP explanation
  - Complete feature
  - Submit feedback
  - See XP rewards with confetti!

---

## 🎯 Next Steps

1. **Add to other Alpha features**: Use the same pattern for future Labs features
2. **Leaderboard**: Display top alpha testers
3. **Badges**: Award special badges for alpha testing
4. **Analytics**: Track which features get most engagement

---

## 💡 Tips

- Only award XP **once per user per feature**
- Time tracking starts when session begins
- Feedback text must be ≥50 chars for bonus
- Confetti triggers automatically on rewards modal
- XP is immediately added to user's total

---

Need help? Check the implementation in:
- `apps/backend/src/user/services/user-alpha-activity.service.ts`
- `apps/frontend/src/app/demo/clinical-case/components/`
