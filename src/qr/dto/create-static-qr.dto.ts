import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateStaticQrDto {
  @ApiProperty({
    example: "https://example.com",
    description: "URL to encode in the QR code",
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  metadata?: Record<string, any>;
}
