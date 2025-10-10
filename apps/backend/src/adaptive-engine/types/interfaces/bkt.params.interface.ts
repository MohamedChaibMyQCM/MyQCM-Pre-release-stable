export interface BktParamsInterface {
  /**
   * Learning rate for the BKT model.
   * This parameter controls how quickly the model updates its belief about the user's knowledge.
   * A higher value means the model will adapt more quickly to new information.
   */
  learning_rate: number;

  /**
   * Probability of guessing the answer correctly.
   * This parameter accounts for the chance that a user might guess the answer correctly,
   * regardless of their actual knowledge.
   */
  guessing_probability: number;

  /**
   * Probability of slipping, or answering incorrectly despite knowing the answer.
   * This parameter accounts for the chance that a user might make a mistake even if they understand the material.
   */
  slipping_probability: number;
}
