import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
    private readonly qrRepository: Repository<QrCode>,
  ) {}

  // AI Integration: Optimize QR Code Generation
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

    const errorCorrectionLevel = this.getErrorCorrectionLevel(
      createStaticQrDto.url,
    );

    const qrImage = await QRCode.toDataURL(createStaticQrDto.url, {
      errorCorrectionLevel,
    });
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

    const errorCorrectionLevel = this.getErrorCorrectionLevel(redirectUrl);

    const qrImage = await QRCode.toDataURL(redirectUrl, {
      errorCorrectionLevel,
    });
    return { qrImage, dynamicQrId };
  }

  private generateDynamicQrId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getErrorCorrectionLevel(
    data: string,
  ): QRCode.QRCodeErrorCorrectionLevel {
    const length = data.length;

    if (length < 50) {
      return "L"; // Low error correction
    } else if (length < 100) {
      return "M"; // Medium error correction
    } else if (length < 200) {
      return "Q"; // Quartile error correction
    } else {
      return "H"; // High error correction
    }
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

  async getRedirectUrl(dynamicQrId: string): Promise<string> {
    const qrCode = await this.qrRepository.findOne({ where: { dynamicQrId } });
    if (!qrCode) {
      throw new NotFoundException("QR Code not found");
    }
    return qrCode.url;
  }
}
