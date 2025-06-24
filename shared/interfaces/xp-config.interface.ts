/**
 * Interface defining the XP configuration for different question types and difficulty levels
 */
export interface XpConfigInterface {
  /** Base XP values for different question formats */
  questionFormat: {
    qcm: number;
    qcs: number;
    qroc: number;
    [key: string]: number;
  };

  /** XP multipliers based on difficulty levels */
  difficultyMultiplier: {
    easy: number;
    medium: number;
    hard: number;
    [key: string]: number;
  };

  /** Bonus multipliers for specific question types */
  typeBonus: {
    theorique: number;
    pratique: number;
    [key: string]: number;
  };
}
