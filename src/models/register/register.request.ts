import { IsString, IsEmail, MinLength } from "class-validator";

export class RegisterRequest {
  @MinLength(2)
  @IsString()
  readonly name: string;

  @MinLength(2)
  @IsString()
  readonly surname: string;

  @IsEmail()
  readonly email: string;

  @MinLength(6)
  readonly password: string;

  readonly fcmToken?: string;

  readonly apnsToken?: string;
}
