import { XpConfigInterface } from "shared/interfaces/xp-config.interface";

/**
 * Default XP configuration for different question types and difficulty levels
 */
export const DefaultXpConfig: XpConfigInterface = {
  // Base XP values for different question formats
  questionFormat: {
    qcm: 10,
    qcs: 8,
    qroc: 12,
  },

  // XP multipliers based on difficulty
  difficultyMultiplier: {
    easy: 3,
    medium: 6,
    hard: 15,
  },

  // Bonus multipliers for specific question types
  typeBonus: {
    theorique: 1,
    pratique: 1,
    // Can be extended with more types as needed
  },
};
