import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@ApiBearerAuth("access-token")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "List of users." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User data." })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiParam({ name: "id", description: "The ID of the user", type: String })
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.usersService.findOneById(id);
  }

  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
}
