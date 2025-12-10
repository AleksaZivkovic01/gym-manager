import { Controller, Get, Put, Delete, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { User } from '../user/user.entity';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMyNotifications(@Req() req: AuthenticatedRequest): Promise<Notification[]> {
    if (req.user.role !== 'member' || !req.user.member?.id) {
      return [];
    }
    return this.notificationService.getNotificationsByMember(req.user.member.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: AuthenticatedRequest): Promise<{ count: number }> {
    if (req.user.role !== 'member' || !req.user.member?.id) {
      return { count: 0 };
    }
    const count = await this.notificationService.getUnreadCount(req.user.member.id);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    if (req.user.role !== 'member' || !req.user.member?.id) {
      return;
    }
    await this.notificationService.markAsRead(id, req.user.member.id);
  }

  @Put('read-all')
  async markAllAsRead(@Req() req: AuthenticatedRequest): Promise<void> {
    if (req.user.role !== 'member' || !req.user.member?.id) {
      return;
    }
    await this.notificationService.markAllAsRead(req.user.member.id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    if (req.user.role !== 'member' || !req.user.member?.id) {
      return;
    }
    await this.notificationService.delete(id, req.user.member.id);
  }

  @Delete()
  async deleteAll(@Req() req: AuthenticatedRequest): Promise<void> {
    if (req.user.role !== 'member' || !req.user.member?.id) {
      return;
    }
    await this.notificationService.deleteAll(req.user.member.id);
  }
}
