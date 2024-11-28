import { Test, TestingModule } from "@nestjs/testing";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ExecutionContext } from "@nestjs/common";
import { GetAnalyticsDto } from "./dto/get-analytics.dto";

describe("AnalyticsController", () => {
  let analyticsController: AnalyticsController;
  let analyticsService: Partial<AnalyticsService>;

  beforeEach(async () => {
    analyticsService = {
      getAnalytics: jest.fn().mockResolvedValue({
        totalScans: 100,
        uniqueUsers: 80,
        scansOverTime: [],
        geographicDistribution: [],
        deviceStats: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: analyticsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    analyticsController = module.get<AnalyticsController>(AnalyticsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAnalytics", () => {
    it("should return analytics data for a QR code", async () => {
      const id = "qr-id";
      const getAnalyticsDto: GetAnalyticsDto = {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      };
      const req = { user: { id: "user-id" } };

      const result = await analyticsController.getAnalytics(
        id,
        getAnalyticsDto,
        req as any,
      );

      expect(analyticsService.getAnalytics).toHaveBeenCalledWith(
        id,
        req.user.id,
        "2023-01-01",
        "2023-12-31",
      );
      expect(result).toEqual({
        totalScans: 100,
        uniqueUsers: 80,
        scansOverTime: [],
        geographicDistribution: [],
        deviceStats: [],
      });
    });
  });
});
