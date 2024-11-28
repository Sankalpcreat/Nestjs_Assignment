import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

describe("UsersService", () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe("create", () => {
    it("should create and return a user", async () => {
      const createUserDto = {
        username: "john_doe",
        email: "john@example.com",
        password: "hashedPassword",
      };

      jest
        .spyOn(usersRepository, "create")
        .mockReturnValue(createUserDto as User);
      jest.spyOn(usersRepository, "save").mockResolvedValue({
        id: "user-id",
        ...createUserDto,
      } as User);

      const result = await usersService.create(createUserDto);

      expect(usersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(usersRepository.save).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({ id: "user-id", ...createUserDto });
    });
  });

  describe("findOneByUsername", () => {
    it("should return a user by username", async () => {
      const user = {
        id: "user-id",
        username: "john_doe",
        email: "john@example.com",
        password: "hashedPassword",
      } as User;

      jest.spyOn(usersRepository, "findOne").mockResolvedValue(user);

      const result = await usersService.findOneByUsername("john_doe");

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: "john_doe" },
      });
      expect(result).toEqual(user);
    });
  });
});
