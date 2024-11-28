import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "john_doe", description: "Username" })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({ example: "strongPassword123", description: "User password" })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
