import { Test, TestingModule } from "@nestjs/testing";
import { AnalyticsService } from "./analytics.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { QrCode } from "../qr/entities/qr.entity";
import { Event } from "../event/entities/event.entity";
import { Repository } from "typeorm";

describe("AnalyticsService", () => {
  let analyticsService: AnalyticsService;
  let qrRepository: Repository<QrCode>;
  let eventRepository: Repository<Event>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(QrCode),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
      ],
    }).compile();

    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    qrRepository = module.get<Repository<QrCode>>(getRepositoryToken(QrCode));
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAnalytics", () => {
    it("should return analytics data for a QR code", async () => {
      const qrId = "qr-id";
      const userId = "user-id";
      const startDate = "2023-01-01";
      const endDate = "2023-12-31";

      jest.spyOn(qrRepository, "findOne").mockResolvedValue({
        id: qrId,
        owner: { id: userId },
      } as any);

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(100),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ date: "2023-01-01", count: "10" }]),
        getRawOne: jest.fn().mockResolvedValue({}),
      };

      jest
        .spyOn(eventRepository, "createQueryBuilder")
        .mockReturnValue(queryBuilder);

      const result = await analyticsService.getAnalytics(
        qrId,
        userId,
        startDate,
        endDate,
      );

      expect(qrRepository.findOne).toHaveBeenCalledWith({
        where: { id: qrId, owner: { id: userId } },
      });
      expect(eventRepository.createQueryBuilder).toHaveBeenCalledWith("event");
      expect(queryBuilder.where).toHaveBeenCalledWith(
        "event.qrCodeId = :qrCodeId",
        { qrCodeId: qrId },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "event.timestamp >= :startDate",
        { startDate },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "event.timestamp <= :endDate",
        { endDate },
      );
      expect(result).toEqual({
        totalScans: 100,
        uniqueUsers: 0,
        scansOverTime: [{ date: "2023-01-01", count: "10" }],
        geographicDistribution: [],
        deviceStats: [],
      });
    });

    it("should throw NotFoundException if QR code not found or not owned by user", async () => {
      const qrId = "qr-id";
      const userId = "user-id";

      jest.spyOn(qrRepository, "findOne").mockResolvedValue(null);

      await expect(analyticsService.getAnalytics(qrId, userId)).rejects.toThrow(
        "QR Code not found",
      );
    });
  });
});
