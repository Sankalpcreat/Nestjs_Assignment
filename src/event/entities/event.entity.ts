import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { QrCode } from "../../qr/entities/qr.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("events")
@Index(["qrCode", "timestamp"])
export class Event {
  @ApiProperty({ example: "uuid-v4-string", description: "Unique event ID" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Associated QR code" })
  @ManyToOne(() => QrCode, (qrCode) => qrCode.events, { onDelete: "CASCADE" })
  qrCode: QrCode;

  @ApiProperty({ description: "Timestamp of the event" })
  @CreateDateColumn()
  timestamp: Date;

  @ApiProperty({
    example: "New York, USA",
    description: "Location of the event",
  })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ example: "Mobile", description: "Device type" })
  @Column({ nullable: true })
  deviceType: string;

  @ApiProperty({ example: "Mozilla/5.0...", description: "User agent string" })
  @Column({ nullable: true })
  userAgent: string;

  @ApiProperty({ example: "192.168.1.1", description: "IP address" })
  @Column({ nullable: true })
  ipAddress: string;

  @ApiProperty({
    example: "https://example.com",
    description: "URL at the time of the event",
  })
  @Column()
  urlAtTimestamp: string;
}
