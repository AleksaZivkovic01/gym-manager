import { Controller, Get, Put, Delete, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('notifications')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('member')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMyNotifications(@Req() req: AuthenticatedRequest): Promise<Notification[]> {
    return this.notificationService.getByUserId(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: AuthenticatedRequest): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.notificationService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  async markAllAsRead(@Req() req: AuthenticatedRequest): Promise<void> {
    await this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.notificationService.delete(id, req.user.id);
  }

  @Delete()
  async deleteAll(@Req() req: AuthenticatedRequest): Promise<void> {

    await this.notificationService.deleteAll(req.user.id);
  }
}
