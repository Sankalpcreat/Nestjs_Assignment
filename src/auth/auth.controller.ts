import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
} from "@nestjs/common";
import { AuthService } from "./auth.service";

import { JwtAuthGuard } from "./guards/jwt-auth.guard";

import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully." })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "User logged in successfully." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Current user profile." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req) {
    return req.user;
  }
}
