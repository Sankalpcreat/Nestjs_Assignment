import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { QrCode } from "../../qr/entities/qr.entity";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => QrCode, (qrCode) => qrCode.events, { onDelete: "CASCADE" })
  qrCode: QrCode;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  operatingSystem: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column()
  urlAtTimestamp: string;

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>;
}
