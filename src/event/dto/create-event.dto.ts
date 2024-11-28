import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateEventDto {
  @ApiPropertyOptional({
    example: "New York, USA",
    description: "Location of the event",
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: "Mobile", description: "Device type" })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({
    example: "Mozilla/5.0...",
    description: "User agent string",
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ example: "192.168.1.1", description: "IP address" })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
