import { Test, TestingModule } from "@nestjs/testing";
import { QrService } from "./qr.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { QrCode } from "./entities/qr.entity";
import { Repository } from "typeorm";
import * as QRCode from "qrcode";
import { CreateStaticQrDto } from "./dto/create-static-qr.dto";
import { CreateDynamicQrDto } from "./dto/create-dynamic-qr.dto";
import { UpdateQrDto } from "./dto/update-qr.dto";

jest.mock("qrcode");

describe("QrService", () => {
  let qrService: QrService;
  let qrRepository: Repository<QrCode>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrService,
        {
          provide: getRepositoryToken(QrCode),
          useClass: Repository,
        },
      ],
    }).compile();

    qrService = module.get<QrService>(QrService);
    qrRepository = module.get<Repository<QrCode>>(getRepositoryToken(QrCode));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createStaticQr", () => {
    it("should create a static QR code and return the image data", async () => {
      const createStaticQrDto: CreateStaticQrDto = {
        url: "https://example.com",
      };
      const user = { id: "user-id" };

      const qrImage = "data:image/png;base64,...";

      (QRCode.toDataURL as jest.Mock).mockResolvedValue(qrImage);
      jest.spyOn(qrRepository, "create").mockReturnValue({} as any);
      jest.spyOn(qrRepository, "save").mockResolvedValue({} as any);

      const result = await qrService.createStaticQr(
        createStaticQrDto,
        user as any,
      );

      expect(QRCode.toDataURL).toHaveBeenCalledWith("https://example.com");
      expect(qrRepository.create).toHaveBeenCalledWith({
        owner: user,
        type: "static",
        url: "https://example.com",
        metadata: undefined,
      });
      expect(qrRepository.save).toHaveBeenCalled();
      expect(result).toEqual(qrImage);
    });
  });

  describe("createDynamicQr", () => {
    it("should create a dynamic QR code and return the image data and dynamicQrId", async () => {
      const createDynamicQrDto: CreateDynamicQrDto = {
        url: "https://example.com",
      };
      const user = { id: "user-id" };

      const qrImage = "data:image/png;base64,...";
      const dynamicQrId = "unique-dynamic-id";

      (QRCode.toDataURL as jest.Mock).mockResolvedValue(qrImage);
      jest.spyOn(qrService, "generateDynamicQrId").mockReturnValue(dynamicQrId);
      jest.spyOn(qrRepository, "create").mockReturnValue({} as any);
      jest.spyOn(qrRepository, "save").mockResolvedValue({} as any);

      const result = await qrService.createDynamicQr(
        createDynamicQrDto,
        user as any,
      );

      expect(qrService.generateDynamicQrId).toHaveBeenCalled();
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        `https://yourdomain.com/qr/redirect/${dynamicQrId}`,
      );
      expect(qrRepository.create).toHaveBeenCalledWith({
        owner: user,
        type: "dynamic",
        url: "https://example.com",
        metadata: undefined,
        dynamicQrId,
        urlHistory: [
          { url: "https://example.com", updatedAt: expect.any(Date) },
        ],
      });
      expect(qrRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ qrImage, dynamicQrId });
    });
  });

  describe("updateDynamicQr", () => {
    it("should update the URL of a dynamic QR code if the user is the owner", async () => {
      const updateQrDto: UpdateQrDto = { url: "https://new-url.com" };
      const userId = "user-id";
      const dynamicQrId = "dynamic-qr-id";

      const qrCode = {
        id: "qr-code-id",
        owner: { id: userId },
        urlHistory: [],
        url: "https://old-url.com",
        updatedAt: new Date(),
        save: jest.fn(),
      };

      jest.spyOn(qrRepository, "findOne").mockResolvedValue(qrCode as any);
      jest.spyOn(qrRepository, "save").mockResolvedValue(qrCode as any);

      const result = await qrService.updateDynamicQr(
        dynamicQrId,
        updateQrDto,
        userId,
      );

      expect(qrRepository.findOne).toHaveBeenCalledWith({
        where: { dynamicQrId },
        relations: ["owner"],
      });
      expect(qrCode.urlHistory).toContainEqual({
        url: "https://new-url.com",
        updatedAt: expect.any(Date),
      });
      expect(qrCode.url).toBe("https://new-url.com");
      expect(qrRepository.save).toHaveBeenCalledWith(qrCode);
      expect(result).toBe("QR Code updated successfully");
    });

    it("should throw NotFoundException if QR code not found", async () => {
      const updateQrDto: UpdateQrDto = { url: "https://new-url.com" };
      const userId = "user-id";
      const dynamicQrId = "dynamic-qr-id";

      jest.spyOn(qrRepository, "findOne").mockResolvedValue(null);

      await expect(
        qrService.updateDynamicQr(dynamicQrId, updateQrDto, userId),
      ).rejects.toThrow("QR Code not found");
    });

    it("should throw ForbiddenException if user is not the owner", async () => {
      const updateQrDto: UpdateQrDto = { url: "https://new-url.com" };
      const userId = "user-id";
      const dynamicQrId = "dynamic-qr-id";

      const qrCode = {
        id: "qr-code-id",
        owner: { id: "different-user-id" },
        urlHistory: [],
        url: "https://old-url.com",
        updatedAt: new Date(),
      };

      jest.spyOn(qrRepository, "findOne").mockResolvedValue(qrCode as any);

      await expect(
        qrService.updateDynamicQr(dynamicQrId, updateQrDto, userId),
      ).rejects.toThrow("You do not have permission to update this QR code");
    });
  });

  describe("getUserQrCodes", () => {
    it("should return a list of QR codes owned by the user", async () => {
      const userId = "user-id";

      const qrCodes = [
        { id: "qr1", owner: { id: userId } },
        { id: "qr2", owner: { id: userId } },
      ];

      jest.spyOn(qrRepository, "find").mockResolvedValue(qrCodes as any);

      const result = await qrService.getUserQrCodes(userId);

      expect(qrRepository.find).toHaveBeenCalledWith({
        where: { owner: { id: userId } },
      });
      expect(result).toEqual(qrCodes);
    });
  });

  describe("getRedirectUrl", () => {
    it("should return the current URL for a dynamic QR code", async () => {
      const dynamicQrId = "dynamic-qr-id";

      const qrCode = {
        id: "qr-code-id",
        url: "https://current-url.com",
      };

      jest.spyOn(qrRepository, "findOne").mockResolvedValue(qrCode as any);

      const result = await qrService.getRedirectUrl(dynamicQrId);

      expect(qrRepository.findOne).toHaveBeenCalledWith({
        where: { dynamicQrId },
      });
      expect(result).toBe("https://current-url.com");
    });

    it("should throw NotFoundException if QR code not found", async () => {
      const dynamicQrId = "dynamic-qr-id";

      jest.spyOn(qrRepository, "findOne").mockResolvedValue(null);

      await expect(qrService.getRedirectUrl(dynamicQrId)).rejects.toThrow(
        "QR Code not found",
      );
    });
  });
});
