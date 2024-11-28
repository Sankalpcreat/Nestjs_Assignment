import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QrController } from "./qr.controller";
import { QrService } from "./qr.service";
import { QrCode } from "./entities/qr.entity";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([QrCode]), UsersModule],
  controllers: [QrController],
  providers: [QrService],
})
export class QrModule {}
