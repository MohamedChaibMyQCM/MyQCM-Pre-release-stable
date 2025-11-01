import { AlphaXpConfigInterface } from "shared/interfaces/alpha-xp-config.interface";

/**
 * Default XP configuration for Alpha/Labs features
 */
export const DefaultAlphaXpConfig: AlphaXpConfigInterface = {
  testingReward: {
    baseXp: 50,
    description: "Bonus for testing a new alpha feature",
  },

  timeSpentReward: {
    xpPerMinute: 5,
    maxXp: 100,
    minMinutes: 1,
    description: "XP based on time spent exploring the feature (max 20 minutes)",
  },

  feedbackQualityReward: {
    rating1Xp: 10,
    rating2Xp: 20,
    rating3Xp: 30,
    rating4Xp: 40,
    rating5Xp: 50,
    withTextBonus: 25,
    minTextLength: 50,
    description: "XP based on your rating and detailed feedback",
  },
};
