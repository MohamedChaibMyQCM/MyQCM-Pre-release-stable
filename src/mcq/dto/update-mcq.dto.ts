import { PartialType } from "@nestjs/swagger";
import { CreateMcqDto, CreateMcqInClinicalCase } from "./create-mcq.dto";

export class UpdateMcqDto extends PartialType(CreateMcqDto) {
  // extending this because it doesnt containes realtions and for now you cant update relations like university and subjects ...
}
