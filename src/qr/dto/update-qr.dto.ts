import { IsNotEmpty, IsString } from "class-validator";

export class UpdateQrDto {
  @IsNotEmpty()
  @IsString()
  url: string;
}
