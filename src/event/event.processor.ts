import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { EventService } from "./event.service";

@Processor("event")
export class EventProcessor {
  constructor(private readonly eventService: EventService) {}

  @Process("trackEvent")
  async handleTrackEvent(job: Job) {
    const { qrId, createEventDto } = job.data;
    await this.eventService.createEvent(qrId, createEventDto);
  }
}
