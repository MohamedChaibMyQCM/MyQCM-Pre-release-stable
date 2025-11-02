import { PartialType } from "@nestjs/swagger";
import { CreateKnowledgeComponentDto } from "./create-knowledge-component.dto";

export class UpdateKnowledgeComponentDto extends PartialType(
  CreateKnowledgeComponentDto,
) {}
