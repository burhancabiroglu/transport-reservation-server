import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@guards/auth.guard";
import { type RegisterRequest } from "@models/register/register.request";
import { type LoginRequest } from "@models/login/login.request";
import { type LoginResponse } from "@models/login/login.response";
import { type AppUser } from "@models/user/app-user";
import { type CoreResponse } from "@core/types/core-response";
import { UserFcmDto } from "@models/user/user-fcm-dto";
import { UserPayload } from "@models/payload/user-payload";
import { ResetPasswordRequest } from "@models/reset/reset-password-request";

@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post("register")
  async register(@Body(ValidationPipe) body: RegisterRequest): Promise<CoreResponse<string>> {
    return this.service.register(body);
  }

  @Post("login")
  async login(
    @Body(ValidationPipe) body: LoginRequest,
  ): Promise<CoreResponse<LoginResponse>> {
    return this.service.login(body);
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  async profile(@Request() req: Request): Promise<CoreResponse<AppUser>> {
    return this.service.profile(req["user"]);
  }

  @Post("resetPassword")
  async resetPassword(@Body(ValidationPipe) dto: ResetPasswordRequest): Promise<CoreResponse<string>> {
    return this.service.resetPassword(dto);
  }

  @UseGuards(AuthGuard)
  @Put("fcm")
  async updateUserFcm(
    @Request() req: Request,
    @Body(ValidationPipe) dto: UserFcmDto
  ): Promise<CoreResponse<string>> {
    return this.service.updateUserFcm(req["user"] as UserPayload, dto);
  }
  
  @UseGuards(AuthGuard)
  @Delete("deleteAccount")
  async deleteAccount(@Request() req: Request): Promise<CoreResponse<string>> {
    return this.service.deleteAccount(req["user"] as UserPayload);
  }
}
