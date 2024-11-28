import { Test, TestingModule } from "@nestjs/testing";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { getQueueToken } from "@nestjs/bull";
import { Queue } from "bull";

describe("EventController", () => {
  let eventController: EventController;
  let eventService: Partial<EventService>;
  let eventQueue: Partial<Queue>;

  beforeEach(async () => {
    eventService = {
      getEventsByQrId: jest.fn().mockResolvedValue([]),
    };

    eventQueue = {
      add: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: eventService },
        { provide: getQueueToken("event"), useValue: eventQueue },
      ],
    }).compile();

    eventController = module.get<EventController>(EventController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("trackEvent", () => {
    it("should add event tracking to the queue", async () => {
      const id = "qr-id";
      const createEventDto: CreateEventDto = {
        location: "New York, USA",
        deviceType: "Mobile",
        userAgent: "Mozilla/5.0",
        ipAddress: "192.168.1.1",
      };

      const result = await eventController.trackEvent(id, createEventDto);

      expect(eventQueue.add).toHaveBeenCalledWith("trackEvent", {
        qrId: id,
        createEventDto,
      });
      expect(result).toEqual({ message: "Event tracking scheduled" });
    });
  });

  describe("getEvents", () => {
    it("should return events for a QR code", async () => {
      const id = "qr-id";
      const events = [{ id: "event1" }, { id: "event2" }];
      jest
        .spyOn(eventService, "getEventsByQrId")
        .mockResolvedValue(events as any);

      const result = await eventController.getEvents(id);

      expect(eventService.getEventsByQrId).toHaveBeenCalledWith(id);
      expect(result).toEqual(events);
    });
  });
});
