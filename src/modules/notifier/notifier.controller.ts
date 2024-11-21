import { Controller, Get, Post, Delete, Body, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { NotifierService } from './notifier.service';
import { CoreResponse } from '@core/types/core-response';
import { AdminGuard } from '@guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('notifier')
export class NotifierController {
  constructor(private readonly notifierService: NotifierService) {}

  @Get()
  public async getNotifierList(): Promise<CoreResponse<string[]>> {
    try {
      return await this.notifierService.getNotifierList();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch Notifier Emails',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  public async addNotifierEmail(@Body('email') email: string): Promise<CoreResponse<{}>> {
    if (!email || !email.includes('@')) {
      throw new HttpException('Invalid email address', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.notifierService.addNotifierEmail(email);
    } catch (error) {
      throw new HttpException(
        'Failed to add Notifier Email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  public async deleteNotifierEmail(@Query('email') email: string): Promise<CoreResponse<{}>> {
    if (!email || !email.includes('@')) {
      throw new HttpException('Invalid email address', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.notifierService.deleteNotifierEmail(email);
    } catch (error) {
      throw new HttpException(
        'Failed to delete Notifier Email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}