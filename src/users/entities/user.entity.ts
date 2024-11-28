import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Exclude } from "class-transformer";
import { QrCode } from "../../qr/entities/qr.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("users")
export class User {
  @ApiProperty({ example: "uuid-v4-string", description: "Unique user ID" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ example: "john_doe", description: "Unique username" })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    example: "john@example.com",
    description: "User email address",
  })
  @Column({ unique: true })
  email: string;

  @Exclude()
  @ApiProperty({ description: "User password", writeOnly: true })
  @Column()
  password: string;

  @OneToMany(() => QrCode, (qrCode) => qrCode.owner)
  qrCodes: QrCode[];

  @ApiProperty({ description: "User creation date" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: "Last update date" })
  @UpdateDateColumn()
  updatedAt: Date;
}
