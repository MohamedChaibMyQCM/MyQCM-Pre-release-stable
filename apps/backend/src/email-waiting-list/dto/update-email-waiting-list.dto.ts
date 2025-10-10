import { PartialType } from "@nestjs/swagger";
import { CreateEmailWaitingListDto } from "./create-email-waiting-list.dto";

export class UpdateEmailWaitingListDto extends PartialType(
  CreateEmailWaitingListDto,
) {}
