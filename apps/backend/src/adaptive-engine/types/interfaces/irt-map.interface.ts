import { McqDifficulty, McqType } from "src/mcq/dto/mcq.type";

export interface IrtMapInterface {
  difficulty: McqDifficulty;
  type: McqType;
  estimated_time: number;
  time_spent: number;
  baseline: number;
}
