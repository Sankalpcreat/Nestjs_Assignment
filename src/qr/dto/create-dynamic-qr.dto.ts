import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateDynamicQrDto {
  @ApiProperty({
    example: "https://example.com",
    description: "Initial URL for the dynamic QR code",
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  metadata?: Record<string, any>;
}
