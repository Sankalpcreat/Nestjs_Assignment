import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ExecutionContext } from "@nestjs/common";

describe("UsersController", () => {
  let usersController: UsersController;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn().mockResolvedValue([]),
      findOneById: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    usersController = module.get<UsersController>(UsersController);
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const result = await usersController.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a user by ID", async () => {
      const user = { id: "user-id", username: "john_doe" };
      jest.spyOn(usersService, "findOneById").mockResolvedValue(user as any);

      const result = await usersController.findOne("user-id");

      expect(usersService.findOneById).toHaveBeenCalledWith("user-id");
      expect(result).toEqual(user);
    });
  });
});
