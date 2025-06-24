export interface CreateNewAdaptiveLearnerInterface {
  /**
   * The user associated with the adaptive learner.
   * This is typically a reference to a User entity.
   */
  user: string;

  /**
   * The course associated with the adaptive learner.
   * This is typically a reference to a Course entity.
   */
  course: string;

  /**
   * The initial mastery probability for the user in the course.
   * This is a float value between 0 and 1, representing the user's initial mastery level.
   */
  mastery?: number;

  /**
   * The initial ability probability for the user in the course.
   * This is a float value between 0 and 1, representing the user's initial ability level.
   */
  ability?: number;
}
