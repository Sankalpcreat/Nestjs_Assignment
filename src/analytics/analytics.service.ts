import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QrCode } from "../qr/entities/qr.entity";
import { Repository } from "typeorm";
import { Event } from "../event/entities/event.entity";
import { ConfigService } from "@nestjs/config";
import { Configuration, OpenAIApi } from "openai";
import * as ss from "simple-statistics";

@Injectable()
export class AnalyticsService {
  private openai: OpenAIApi;

  constructor(
    @InjectRepository(QrCode)
    private readonly qrRepository: Repository<QrCode>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly configService: ConfigService,
  ) {
    const configuration = new Configuration({
      apiKey: this.configService.get<string>("OPENAI_API_KEY"),
    });
    this.openai = new OpenAIApi(configuration);
  }

  async getAnalytics(
    qrId: string,
    userId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // Verify QR code ownership
    const qrCode = await this.qrRepository.findOne({
      where: { id: qrId },
      relations: ["owner"],
    });

    if (!qrCode) {
      throw new NotFoundException("QR Code not found");
    }

    if (qrCode.owner.id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this QR code",
      );
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

  // AI Integration: Anomaly Detection
  async detectAnomalies(qrId: string, userId: string) {
    // Verify QR code ownership
    const qrCode = await this.qrRepository.findOne({
      where: { id: qrId },
      relations: ["owner"],
    });

    if (!qrCode) {
      throw new NotFoundException("QR Code not found");
    }

    if (qrCode.owner.id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this QR code",
      );
    }

    // Fetch events
    const events = await this.eventRepository.find({
      where: { qrCode: { id: qrId } },
    });

    // Prepare data for anomaly detection
    const timestamps = events.map((event) => event.timestamp.getTime());
    const intervals = timestamps
      .sort((a, b) => a - b)
      .map((time, index, array) => {
        if (index === 0) return 0;
        return time - array[index - 1];
      })
      .slice(1); // Remove the first zero

    // Calculate mean and standard deviation
    const meanInterval = ss.mean(intervals);
    const sdInterval = ss.standardDeviation(intervals);

    const anomalies = [];
    intervals.forEach((interval, index) => {
      const zScore = (interval - meanInterval) / sdInterval;
      if (Math.abs(zScore) > 2) {
        anomalies.push(events[index + 1]); // Index offset due to slice(1)
      }
    });

    return {
      anomalies,
      totalEvents: events.length,
    };
  }

  // AI Integration: Generate Summary Reports
  async generateSummaryReport(qrId: string, userId: string): Promise<string> {
    const analyticsData = await this.getAnalytics(qrId, userId);

    // Prepare prompt for OpenAI
    const prompt = `
    Generate a concise summary report based on the following analytics data:

    Total Scans: ${analyticsData.totalScans}
    Unique Users: ${analyticsData.uniqueUsers}
    Scans Over Time: ${JSON.stringify(analyticsData.scansOverTime)}
    Geographic Distribution: ${JSON.stringify(analyticsData.geographicDistribution)}
    Device Statistics: ${JSON.stringify(analyticsData.deviceStats)}

    The report should be in natural language, highlighting key insights.
    `;

    // Call OpenAI API
    const response = await this.openai.createCompletion({
      model: "gpt-4o",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
    });

    const summary = response.data.choices[0].text.trim();
    return summary;
  }
}
