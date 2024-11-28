import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Welcome to the QR Code Management Platform API!";
  }
}
