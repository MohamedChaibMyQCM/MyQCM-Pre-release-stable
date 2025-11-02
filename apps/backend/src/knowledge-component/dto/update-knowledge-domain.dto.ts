import { PartialType } from "@nestjs/swagger";
import { CreateKnowledgeDomainDto } from "./create-knowledge-domain.dto";

export class UpdateKnowledgeDomainDto extends PartialType(
  CreateKnowledgeDomainDto,
) {}
