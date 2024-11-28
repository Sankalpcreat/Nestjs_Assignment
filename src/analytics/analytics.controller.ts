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

@Controller("qr")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
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
