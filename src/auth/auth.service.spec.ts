import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findOneByUsername: jest.fn(),
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue("test-jwt-token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe("register", () => {
    it("should register a new user and return a JWT token", async () => {
      const registerDto: RegisterDto = {
        username: "john_doe",
        email: "john@example.com",
        password: "password123",
      };

      jest.spyOn(usersService, "findOneByUsername").mockResolvedValue(null);
      jest.spyOn(usersService, "findOneByEmail").mockResolvedValue(null);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");
      jest.spyOn(usersService, "create").mockResolvedValue({
        id: "user-id",
        ...registerDto,
        password: "hashedPassword",
      });

      const result = await authService.register(registerDto);

      expect(usersService.findOneByUsername).toHaveBeenCalledWith("john_doe");
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        "john@example.com",
      );
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(usersService.create).toHaveBeenCalledWith({
        username: "john_doe",
        email: "john@example.com",
        password: "hashedPassword",
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: "john_doe",
        sub: "user-id",
      });
      expect(result).toEqual({ access_token: "test-jwt-token" });
    });
  });

  describe("login", () => {
    it("should validate user credentials and return a JWT token", async () => {
      const loginDto: LoginDto = {
        username: "john_doe",
        password: "password123",
      };

      jest.spyOn(usersService, "findOneByUsername").mockResolvedValue({
        id: "user-id",
        username: "john_doe",
        password: "hashedPassword",
      });

      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(usersService.findOneByUsername).toHaveBeenCalledWith("john_doe");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword",
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: "john_doe",
        sub: "user-id",
      });
      expect(result).toEqual({ access_token: "test-jwt-token" });
    });
  });
});
