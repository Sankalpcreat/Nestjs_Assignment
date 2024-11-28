import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateStaticQrDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
