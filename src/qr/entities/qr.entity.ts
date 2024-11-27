import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Event } from "../../event/entities/event.entity";

@Entity("qr_codes")
export class QrCode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.qrCodes, { onDelete: "CASCADE" })
  owner: User;

  @Column({ type: "enum", enum: ["static", "dynamic"], default: "static" })
  type: "static" | "dynamic";

  @Column()
  url: string;

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  dynamicQrId: string;

  @OneToMany(() => Event, (event) => event.qrCode)
  events: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "json", nullable: true })
  urlHistory: { url: string; updatedAt: Date }[];
}
