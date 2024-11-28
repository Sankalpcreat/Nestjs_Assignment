import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm/index";

import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOneById(id: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<User | undefined> {
    return await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
  }
}
