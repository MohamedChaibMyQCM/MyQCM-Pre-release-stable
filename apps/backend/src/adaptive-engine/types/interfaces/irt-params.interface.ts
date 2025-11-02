export interface IrtParamsInterface {
  /**
   * Discrimination parameter for the IRT model.
   * This parameter indicates how well the Question can differentiate between different levels of ability.
   * A higher value means the Question is more effective at distinguishing between high and low ability users.
   */
  discrimination: number;

  /**
   * Difficulty parameter for the IRT model.
   * This parameter indicates how difficult the Question is. A higher value means the Question is more difficult.
   * easy question = -2 ,  medium = 0 , hard question = 2
   */
  difficulty: number;

  /**
   * Guessing parameter for the IRT model.
   * This parameter indicates the probability that a user with very low ability will answer the Question correctly by guessing.
   */
  guessing: number;

  /**
   * Knowledge components associated with the item.
   */
  knowledgeComponentIds?: string[];
}
