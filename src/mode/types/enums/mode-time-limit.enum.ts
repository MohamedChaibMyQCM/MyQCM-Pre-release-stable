import { Mode } from "src/mode/entities/mode.entity";

export enum ModeTimeLimit {
  USER = "user", // let user define it
  ASSISTANT = "assistant", //assistant defines it
  ORIGINAL = "original", //original time limit of that mcqc
}
