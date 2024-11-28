import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateQrDto {
  @ApiProperty({
    example: "https://new-url.com",
    description: "New URL for the dynamic QR code",
  })
  @IsNotEmpty()
  @IsString()
  url: string;
}
