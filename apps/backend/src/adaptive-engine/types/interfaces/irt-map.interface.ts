import { McqDifficulty, McqType } from "src/mcq/dto/mcq.type";

export interface IrtMapInterface {
  mcqId?: string;
  difficulty: McqDifficulty;
  type: McqType;
  estimated_time: number;
  time_spent: number;
  baseline: number;
  knowledgeComponentIds?: string[];
}
