import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, Matches } from "class-validator";

export class UpdateFreelancerDto {
  @ApiProperty({
    description: "freelancer new name to update (optional)",
    required: false,
  })
  @IsOptional()
  @Matches(/^[a-zA-Z]+(?: [a-zA-Z]+)+$/, {
    message: "name must be a correct full name",
  })
  name: string;
}
