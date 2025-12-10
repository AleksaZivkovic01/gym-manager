import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { Member } from '../members/member.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async createNotification(memberId: number, message: string): Promise<Notification> {
    const member = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }

    const notification = this.notificationRepository.create({
      member,
      message,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async getNotificationsByMember(memberId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { member: { id: memberId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(memberId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { member: { id: memberId }, isRead: false },
    });
  }

  async markAsRead(notificationId: number, memberId: number): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, member: { id: memberId } },
      { isRead: true },
    );
  }

  async markAllAsRead(memberId: number): Promise<void> {
    await this.notificationRepository.update(
      { member: { id: memberId }, isRead: false },
      { isRead: true },
    );
  }

  async delete(notificationId: number, memberId: number): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      member: { id: memberId },
    });
    if (result.affected === 0) {
      throw new Error('Notification not found or does not belong to member');
    }
  }

  async deleteAll(memberId: number): Promise<void> {
    await this.notificationRepository.delete({
      member: { id: memberId },
    });
  }
}
