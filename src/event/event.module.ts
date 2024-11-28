import { Module } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./entities/event.entity";
import { QrCode } from "../qr/entities/qr.entity";
import { BullModule } from "@nestjs/bull";
import { EventProcessor } from "./event.processor";

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, QrCode]),
    BullModule.registerQueue({
      name: "event",
    }),
  ],
  controllers: [EventController],
  providers: [EventService, EventProcessor],
})
export class EventModule {}
