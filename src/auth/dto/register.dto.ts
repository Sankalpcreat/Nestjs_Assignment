import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "john_doe", description: "Unique username" })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({
    example: "john@example.com",
    description: "User email address",
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: "strongPassword123",
    description: "User password",
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  readonly password: string;
}
