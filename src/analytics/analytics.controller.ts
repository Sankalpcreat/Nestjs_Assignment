import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetAnalyticsDto } from "./dto/get-analytics.dto";

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Analytics")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard)
@Controller("qr")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: "Get analytics data for a QR code" })
  @ApiResponse({
    status: 200,
    description: "Analytics data retrieved successfully.",
  })
  @ApiResponse({ status: 404, description: "QR code not found." })
  @Get(":id/analytics")
  async getAnalytics(
    @Param("id") id: string,
    @Query() getAnalyticsDto: GetAnalyticsDto,
    @Request() req,
  ) {
    const { startDate, endDate } = getAnalyticsDto;
    return await this.analyticsService.getAnalytics(
      id,
      req.user.id,
      startDate,
      endDate,
    );
  }
}
