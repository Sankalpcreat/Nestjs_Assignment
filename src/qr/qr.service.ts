import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm/index";
import { QrCode } from "./entities/qr.entity";
import { CreateStaticQrDto } from "./dto/create-static-qr.dto";
import { CreateDynamicQrDto } from "./dto/create-dynamic-qr.dto";
import { UpdateQrDto } from "./dto/update-qr.dto";
import { User } from "../users/entities/user.entity";
import * as QRCode from "qrcode";

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(QrCode)
    private qrRepository: Repository<QrCode>,
  ) {}

  async createStaticQr(
    createStaticQrDto: CreateStaticQrDto,
    owner: User,
  ): Promise<string> {
    const qrCode = this.qrRepository.create({
      owner,
      type: "static",
      url: createStaticQrDto.url,
      metadata: createStaticQrDto.metadata,
    });

    await this.qrRepository.save(qrCode);

    const qrImage = await QRCode.toDataURL(createStaticQrDto.url);
    return qrImage;
  }

  async createDynamicQr(
    createDynamicQrDto: CreateDynamicQrDto,
    owner: User,
  ): Promise<{ qrImage: string; dynamicQrId: string }> {
    const dynamicQrId = this.generateDynamicQrId();
    const redirectUrl = `https://yourdomain.com/qr/redirect/${dynamicQrId}`;

    const qrCode = this.qrRepository.create({
      owner,
      type: "dynamic",
      url: createDynamicQrDto.url,
      metadata: createDynamicQrDto.metadata,
      dynamicQrId,
      urlHistory: [{ url: createDynamicQrDto.url, updatedAt: new Date() }],
    });

    await this.qrRepository.save(qrCode);

    const qrImage = await QRCode.toDataURL(redirectUrl);
    return { qrImage, dynamicQrId };
  }
  generateDynamicQrId(): string {
    // Implement a method to generate a unique ID for dynamic QR codes
    return "unique-dynamic-id";
  }

  async updateDynamicQr(
    id: string,
    updateQrDto: UpdateQrDto,
    userId: string,
  ): Promise<string> {
    const qrCode = await this.qrRepository.findOne({
      where: { dynamicQrId: id },
      relations: ["owner"],
    });
    if (!qrCode) {
      throw new NotFoundException("QR Code not found");
    }

    if (qrCode.owner.id !== userId) {
      throw new ForbiddenException(
        "You do not have permission to update this QR code",
      );
    }

    qrCode.urlHistory = qrCode.urlHistory || [];
    qrCode.urlHistory.push({ url: updateQrDto.url, updatedAt: new Date() });
    qrCode.url = updateQrDto.url;
    qrCode.updatedAt = new Date();

    await this.qrRepository.save(qrCode);
    return "QR Code updated successfully";
  }

  async getUserQrCodes(userId: string): Promise<QrCode[]> {
    return this.qrRepository.find({ where: { owner: { id: userId } } });
  }

  private generateDynamicQrId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async getRedirectUrl(dynamicQrId: string): Promise<string> {
    const qrCode = await this.qrRepository.findOne({ where: { dynamicQrId } });
    if (!qrCode) {
      throw new NotFoundException("QR Code not found");
    }
    return qrCode.url;
  }
}
