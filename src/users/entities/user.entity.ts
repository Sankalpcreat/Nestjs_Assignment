import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QrCode } from '../../qr/entities/qr.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => QrCode, (qrCode) => qrCode.owner)
  qrCodes: QrCode[];
}