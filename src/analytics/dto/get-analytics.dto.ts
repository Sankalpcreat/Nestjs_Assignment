import { IsOptional, IsDateString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetAnalyticsDto {
  @ApiPropertyOptional({
    example: "2024-12-01",
    description: "Start date for analytics data",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: "2024-12-31",
    description: "End date for analytics data",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
