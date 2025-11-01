import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class StartAlphaSessionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  feature_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  feature_name: string;
}
