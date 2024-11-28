import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("qr_codes")
export class QrCode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.qrCodes, { onDelete: "CASCADE" })
  owner: User;

  @Column({ type: "enum", enum: ["static", "dynamic"] })
  type: "static" | "dynamic";

  @Column()
  url: string;

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>;

  @Column({ unique: true, nullable: true })
  dynamicQrId: string;

  @Column({ type: "json", nullable: true })
  urlHistory: { url: string; updatedAt: Date }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
