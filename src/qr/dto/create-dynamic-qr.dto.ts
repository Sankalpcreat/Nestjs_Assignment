import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateDynamicQrDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
