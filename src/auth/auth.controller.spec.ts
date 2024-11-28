import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ access_token: "test-jwt-token" }),
      login: jest.fn().mockResolvedValue({ access_token: "test-jwt-token" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe("register", () => {
    it("should register a new user and return a JWT token", async () => {
      const registerDto: RegisterDto = {
        username: "john_doe",
        email: "john@example.com",
        password: "password123",
      };

      const result = await authController.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({ access_token: "test-jwt-token" });
    });
  });

  describe("login", () => {
    it("should login a user and return a JWT token", async () => {
      const loginDto: LoginDto = {
        username: "john_doe",
        password: "password123",
      };

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({ access_token: "test-jwt-token" });
    });
  });
});
