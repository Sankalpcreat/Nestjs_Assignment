// src/app.controller.ts

import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Root")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Get a welcome message" })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
