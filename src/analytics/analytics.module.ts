import { Module } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QrCode } from "../qr/entities/qr.entity";
import { Event } from "../event/entities/event.entity";

@Module({
  imports: [TypeOrmModule.forFeature([QrCode, Event])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
