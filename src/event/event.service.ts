import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { Repository } from "typeorm";
import { CreateEventDto } from "./dto/create-event.dto";
import { QrCode } from "../qr/entities/qr.entity";

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(QrCode)
    private readonly qrRepository: Repository<QrCode>,
  ) {}

  async createEvent(
    qrId: string,
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    // Find the QR code
    const qrCode = await this.qrRepository.findOne({ where: { id: qrId } });

    if (!qrCode) {
      throw new NotFoundException("QR Code not found");
    }

    // Create the event
    const event = this.eventRepository.create({
      qrCode,
      location: createEventDto.location,
      deviceType: createEventDto.deviceType,
      userAgent: createEventDto.userAgent,
      ipAddress: createEventDto.ipAddress,
      urlAtTimestamp: qrCode.url,
    });

    return await this.eventRepository.save(event);
  }

  async getEventsByQrId(qrId: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { qrCode: { id: qrId } },
      relations: ["qrCode"],
    });
  }
}
