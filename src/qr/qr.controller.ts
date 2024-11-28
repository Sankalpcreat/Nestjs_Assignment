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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { QrService } from "./qr.service";
import { CreateStaticQrDto } from "./dto/create-static-qr.dto";
import { CreateDynamicQrDto } from "./dto/create-dynamic-qr.dto";
import { UpdateQrDto } from "./dto/update-qr.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Response } from "express";

@ApiTags("QR Codes")
@ApiBearerAuth("access-token")
@Controller("qr")
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @UseGuards(JwtAuthGuard)
  @Post("static")
  @ApiOperation({ summary: "Create a static QR code" })
  @ApiResponse({
    status: 200,
    description: "Static QR code created successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiBody({ type: CreateStaticQrDto })
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
  @ApiOperation({ summary: "Create a dynamic QR code" })
  @ApiResponse({
    status: 200,
    description: "Dynamic QR code created successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiBody({ type: CreateDynamicQrDto })
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
  @ApiOperation({ summary: "Update a dynamic QR code" })
  @ApiResponse({
    status: 200,
    description: "Dynamic QR code updated successfully.",
  })
  @ApiResponse({ status: 404, description: "QR Code not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiParam({
    name: "id",
    description: "The ID of the QR code to update",
    type: String,
  })
  @ApiBody({ type: UpdateQrDto })
  async updateDynamicQr(
    @Param("id") id: string,
    @Body() updateQrDto: UpdateQrDto,
    @Request() req,
  ) {
    return await this.qrService.updateDynamicQr(id, updateQrDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("my-codes")
  @ApiOperation({ summary: "Get all QR codes for the logged-in user" })
  @ApiResponse({ status: 200, description: "List of user's QR codes." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async getMyQrCodes(@Request() req) {
    return await this.qrService.getUserQrCodes(req.user.id);
  }

  @Get("redirect/:id")
  @ApiOperation({ summary: "Redirect using a dynamic QR code" })
  @ApiResponse({ status: 302, description: "Redirected successfully." })
  @ApiResponse({ status: 404, description: "QR Code not found." })
  @ApiParam({
    name: "id",
    description: "The ID of the dynamic QR code",
    type: String,
  })
  async redirect(@Param("id") id: string, @Res() res: Response) {
    try {
      const url = await this.qrService.getRedirectUrl(id);
      return res.redirect(url);
    } catch (error) {
      throw new NotFoundException("QR Code not found");
    }
  }
}
