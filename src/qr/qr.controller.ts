import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Get,
  Request,
  Res,
  NotFoundException,
} from "@nestjs/common";
import { QrService } from "./qr.service";
import { CreateStaticQrDto } from "./dto/create-static-qr.dto";
import { CreateDynamicQrDto } from "./dto/create-dynamic-qr.dto";
import { UpdateQrDto } from "./dto/update-qr.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Response } from "express";

@Controller("qr")
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @UseGuards(JwtAuthGuard)
  @Post("static")
  async createStaticQr(
    @Body() createStaticQrDto: CreateStaticQrDto,
    @Request() req,
    @Res() res: Response,
  ) {
    const qrImage = await this.qrService.createStaticQr(
      createStaticQrDto,
      req.user,
    );
    const img = Buffer.from(qrImage.split(",")[1], "base64");
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": img.length,
    });
    res.end(img);
  }

  @UseGuards(JwtAuthGuard)
  @Post("dynamic")
  async createDynamicQr(
    @Body() createDynamicQrDto: CreateDynamicQrDto,
    @Request() req,
    @Res() res: Response,
  ) {
    const { qrImage, dynamicQrId } = await this.qrService.createDynamicQr(
      createDynamicQrDto,
      req.user,
    );
    const img = Buffer.from(qrImage.split(",")[1], "base64");
    res.setHeader("X-Dynamic-QR-ID", dynamicQrId);
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": img.length,
    });
    res.end(img);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id/update")
  async updateDynamicQr(
    @Param("id") id: string,
    @Body() updateQrDto: UpdateQrDto,
    @Request() req,
  ) {
    return await this.qrService.updateDynamicQr(id, updateQrDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("my-codes")
  async getMyQrCodes(@Request() req) {
    return await this.qrService.getUserQrCodes(req.user.id);
  }

  // Endpoint to handle redirection for dynamic QR codes
  @Get("redirect/:id")
  async redirect(@Param("id") id: string, @Res() res: Response) {
    try {
      const url = await this.qrService.getRedirectUrl(id);
      return res.redirect(url);
    } catch (error) {
      throw new NotFoundException("QR Code not found");
    }
  }
}
