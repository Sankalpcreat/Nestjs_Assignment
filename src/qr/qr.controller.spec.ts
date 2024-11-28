import { Test, TestingModule } from "@nestjs/testing";
import { QrController } from "./qr.controller";
import { QrService } from "./qr.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ExecutionContext } from "@nestjs/common";
import { CreateStaticQrDto } from "./dto/create-static-qr.dto";
import { CreateDynamicQrDto } from "./dto/create-dynamic-qr.dto";
import { UpdateQrDto } from "./dto/update-qr.dto";

describe("QrController", () => {
  let qrController: QrController;
  let qrService: Partial<QrService>;

  beforeEach(async () => {
    qrService = {
      createStaticQr: jest.fn().mockResolvedValue("data:image/png;base64,..."),
      createDynamicQr: jest.fn().mockResolvedValue({
        qrImage: "data:image/png;base64,...",
        dynamicQrId: "dynamic-qr-id",
      }),
      updateDynamicQr: jest
        .fn()
        .mockResolvedValue("QR Code updated successfully"),
      getUserQrCodes: jest.fn().mockResolvedValue([]),
      getRedirectUrl: jest.fn().mockResolvedValue("https://redirect-url.com"),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrController],
      providers: [{ provide: QrService, useValue: qrService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    qrController = module.get<QrController>(QrController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createStaticQr", () => {
    it("should create a static QR code and send the image in response", async () => {
      const createStaticQrDto: CreateStaticQrDto = {
        url: "https://example.com",
      };
      const req = { user: { id: "user-id" } };
      const res = {
        writeHead: jest.fn(),
        end: jest.fn(),
      };

      await qrController.createStaticQr(
        createStaticQrDto,
        req as any,
        res as any,
      );

      expect(qrService.createStaticQr).toHaveBeenCalledWith(
        createStaticQrDto,
        req.user,
      );
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "image/png",
        "Content-Length": expect.any(Number),
      });
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe("createDynamicQr", () => {
    it("should create a dynamic QR code and send the image in response", async () => {
      const createDynamicQrDto: CreateDynamicQrDto = {
        url: "https://example.com",
      };
      const req = { user: { id: "user-id" } };
      const res = {
        writeHead: jest.fn(),
        end: jest.fn(),
        setHeader: jest.fn(),
      };

      await qrController.createDynamicQr(
        createDynamicQrDto,
        req as any,
        res as any,
      );

      expect(qrService.createDynamicQr).toHaveBeenCalledWith(
        createDynamicQrDto,
        req.user,
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "X-Dynamic-QR-ID",
        "dynamic-qr-id",
      );
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "image/png",
        "Content-Length": expect.any(Number),
      });
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe("updateDynamicQr", () => {
    it("should update a dynamic QR code URL", async () => {
      const updateQrDto: UpdateQrDto = { url: "https://new-url.com" };
      const req = { user: { id: "user-id" } };
      const id = "dynamic-qr-id";

      const result = await qrController.updateDynamicQr(
        id,
        updateQrDto,
        req as any,
      );

      expect(qrService.updateDynamicQr).toHaveBeenCalledWith(
        id,
        updateQrDto,
        req.user.id,
      );
      expect(result).toBe("QR Code updated successfully");
    });
  });

  describe("getMyQrCodes", () => {
    it("should return a list of QR codes owned by the user", async () => {
      const req = { user: { id: "user-id" } };

      const result = await qrController.getMyQrCodes(req as any);

      expect(qrService.getUserQrCodes).toHaveBeenCalledWith(req.user.id);
      expect(result).toEqual([]);
    });
  });

  describe("redirect", () => {
    it("should redirect to the current URL of the dynamic QR code", async () => {
      const id = "dynamic-qr-id";
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await qrController.redirect(id, res as any);

      expect(qrService.getRedirectUrl).toHaveBeenCalledWith(id);
      expect(res.redirect).toHaveBeenCalledWith("https://redirect-url.com");
    });

    it("should return 404 if QR code not found", async () => {
      const id = "dynamic-qr-id";
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest
        .spyOn(qrService, "getRedirectUrl")
        .mockRejectedValue(new Error("QR Code not found"));

      await qrController.redirect(id, res as any);

      expect(qrService.getRedirectUrl).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "QR code not found" });
    });
  });
});
