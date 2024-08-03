import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AdminGuard } from "@guards/admin.guard";
import { type AppUser } from "@models/user/app-user";
import { type CoreResponse } from "@core/types/core-response";

@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @UseGuards(AdminGuard)
  async getUsers(): Promise<CoreResponse<AppUser[]>> {
    return this.service.getUsers();
  }

  @Put()
  @UseGuards(AdminGuard)
  async updateUser(@Body() user: AppUser): Promise<CoreResponse<string>> {
    return this.service.updateUser(user);
  }

  @Post("approveUser")
  @UseGuards(AdminGuard)
  async approveUser(@Body("uid") uid: string): Promise<CoreResponse<string>> {
    return this.service.approveUser(uid);
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  async deleteUser(@Param("id") userId: string): Promise<CoreResponse<string>> {
    return this.service.deleteUser(userId);
  }
}
