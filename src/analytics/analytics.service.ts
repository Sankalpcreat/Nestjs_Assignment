import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QrCode } from "../qr/entities/qr.entity";
import { Repository } from "typeorm";
import { Event } from "../event/entities/event.entity";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(QrCode)
    private readonly qrRepository: Repository<QrCode>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async getAnalytics(
    qrId: string,
    userId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // Verify QR code ownership
    const qrCode = await this.qrRepository.findOne({
      where: { id: qrId, owner: { id: userId } },
    });

    if (!qrCode) {
      throw new NotFoundException("QR Code not found");
    }

    // Build event query with optional date filters
    const query = this.eventRepository
      .createQueryBuilder("event")
      .where("event.qrCodeId = :qrCodeId", { qrCodeId: qrId });

    if (startDate) {
      query.andWhere("event.timestamp >= :startDate", { startDate });
    }

    if (endDate) {
      query.andWhere("event.timestamp <= :endDate", { endDate });
    }

    // Compute Total Scans
    const totalScans = await query.getCount();

    // Compute Unique Users (based on IP address)
    const uniqueUsers = await query
      .select("event.ipAddress")
      .distinct(true)
      .getCount();

    // Compute Scans Over Time
    const scansOverTime = await query
      .select("DATE(event.timestamp) as date")
      .addSelect("COUNT(*) as count")
      .groupBy("date")
      .orderBy("date", "ASC")
      .getRawMany();

    // Compute Geographic Distribution
    const geographicDistribution = await query
      .select("event.location as location")
      .addSelect("COUNT(*) as count")
      .groupBy("location")
      .orderBy("count", "DESC")
      .getRawMany();

    // Compute Device or Platform Statistics
    const deviceStats = await query
      .select("event.deviceType as deviceType")
      .addSelect("COUNT(*) as count")
      .groupBy("deviceType")
      .orderBy("count", "DESC")
      .getRawMany();

    return {
      totalScans,
      uniqueUsers,
      scansOverTime,
      geographicDistribution,
      deviceStats,
    };
  }
}
