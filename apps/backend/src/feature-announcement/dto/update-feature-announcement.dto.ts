import { PartialType } from "@nestjs/mapped-types";
import { CreateFeatureAnnouncementDto } from "./create-feature-announcement.dto";

export class UpdateFeatureAnnouncementDto extends PartialType(
  CreateFeatureAnnouncementDto
) {}
