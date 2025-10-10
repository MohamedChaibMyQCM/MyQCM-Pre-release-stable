import { PartialType } from "@nestjs/swagger";
import { CreateUserProfileDto } from "../types/dtos/create-user-profile.dto";

export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto) {}
