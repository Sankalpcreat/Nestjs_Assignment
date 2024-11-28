import { Test, TestingModule } from "@nestjs/testing";
import { EventService } from "./event.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { Repository } from "typeorm";
import { QrCode } from "../qr/entities/qr.entity";

describe("EventService", () => {
  let eventService: EventService;
  let eventRepository: Repository<Event>;
  let qrRepository: Repository<QrCode>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(QrCode),
          useClass: Repository,
        },
      ],
    }).compile();

    eventService = module.get<EventService>(EventService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    qrRepository = module.get<Repository<QrCode>>(getRepositoryToken(QrCode));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should create an event for a valid QR code", async () => {
      const qrId = "qr-id";
      const createEventDto = {
        location: "New York, USA",
        deviceType: "Mobile",
        userAgent: "Mozilla/5.0",
        ipAddress: "192.168.1.1",
      };
      const qrCode = { id: qrId, url: "https://example.com" };

      jest.spyOn(qrRepository, "findOne").mockResolvedValue(qrCode as any);
      jest.spyOn(eventRepository, "create").mockReturnValue({} as any);
      jest.spyOn(eventRepository, "save").mockResolvedValue({} as any);

      const result = await eventService.createEvent(qrId, createEventDto);

      expect(qrRepository.findOne).toHaveBeenCalledWith({
        where: { id: qrId },
      });
      expect(eventRepository.create).toHaveBeenCalledWith({
        qrCode,
        location: createEventDto.location,
        deviceType: createEventDto.deviceType,
        userAgent: createEventDto.userAgent,
        ipAddress: createEventDto.ipAddress,
        urlAtTimestamp: qrCode.url,
      });
      expect(eventRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException if QR code not found", async () => {
      const qrId = "qr-id";
      const createEventDto = {};

      jest.spyOn(qrRepository, "findOne").mockResolvedValue(null);

      await expect(
        eventService.createEvent(qrId, createEventDto),
      ).rejects.toThrow("QR Code not found");
    });
  });

  describe("getEventsByQrId", () => {
    it("should return events for a given QR code ID", async () => {
      const qrId = "qr-id";
      const events = [{ id: "event1" }, { id: "event2" }];

      jest.spyOn(eventRepository, "find").mockResolvedValue(events as any);

      const result = await eventService.getEventsByQrId(qrId);

      expect(eventRepository.find).toHaveBeenCalledWith({
        where: { qrCode: { id: qrId } },
        relations: ["qrCode"],
      });
      expect(result).toEqual(events);
    });
  });
});
