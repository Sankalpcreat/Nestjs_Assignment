// src/event/event.controller.ts

import { Controller, Post, Body, Param } from "@nestjs/common";
import { EventService } from "./event.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Events")
@Controller("qr")
export class EventController {
  constructor(
    private readonly eventService: EventService,
    @InjectQueue("event") private readonly eventQueue: Queue,
  ) {}

  @ApiOperation({ summary: "Track an event for a QR code" })
  @ApiResponse({ status: 201, description: "Event tracked successfully." })
  @ApiResponse({ status: 404, description: "QR Code not found." })
  @Post(":id/track")
  async trackEvent(
    @Param("id") id: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    await this.eventQueue.add("trackEvent", { qrId: id, createEventDto });
    return { message: "Event tracking scheduled" };
  }
}
