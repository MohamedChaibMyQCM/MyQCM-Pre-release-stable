/**
 * Configuration for Alpha/Labs feature XP rewards
 */
export interface AlphaXpConfigInterface {
  /** XP awarded for testing a new alpha feature */
  testingReward: {
    baseXp: number;
    description: string;
  };

  /** XP awarded based on time spent in the feature */
  timeSpentReward: {
    xpPerMinute: number;
    maxXp: number;
    minMinutes: number;
    description: string;
  };

  /** XP awarded based on feedback quality */
  feedbackQualityReward: {
    rating1Xp: number;
    rating2Xp: number;
    rating3Xp: number;
    rating4Xp: number;
    rating5Xp: number;
    withTextBonus: number;
    minTextLength: number;
    description: string;
  };
}

/**
 * Response interface for XP calculation
 */
export interface AlphaXpCalculationResult {
  testingXp: number;
  timeSpentXp: number;
  feedbackQualityXp: number;
  totalXp: number;
  breakdown: {
    testing: string;
    timeSpent: string;
    feedbackQuality: string;
  };
}
