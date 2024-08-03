import { IsEmail } from "class-validator";

export class ResetPasswordRequest {
  @IsEmail()
  readonly email: string;
}
