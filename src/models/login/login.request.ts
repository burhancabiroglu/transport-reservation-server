import { IsEmail, IsString } from "class-validator";

export class LoginRequest {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}
