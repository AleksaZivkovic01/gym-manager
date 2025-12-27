import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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

  //dohvati member po userId 
  private async getMemberByUserId(userId: number): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { user: { id: userId } } });
    if (!member) {
      throw new ForbiddenException('User is not a member');
    }
    return member;
  }

  async createNotification(memberId: number, message: string): Promise<Notification> {
    const member = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException(`Member ${memberId} not found`);
    }

    const notification = this.notificationRepository.create({
      member,
      message,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  //  GET NOTIFICATIONS 
  async getByUserId(userId: number): Promise<Notification[]> {
    const member = await this.getMemberByUserId(userId);
    return this.notificationRepository.find({
      where: { member: { id: member.id } },
      order: { createdAt: 'DESC' },
    });
  }

  // UNREAD COUNT 
  async getUnreadCount(userId: number): Promise<number> {
    const member = await this.getMemberByUserId(userId);
    return this.notificationRepository.count({
      where: { member: { id: member.id }, isRead: false },
    });
  }

  // MARK AS READ 
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    const member = await this.getMemberByUserId(userId);
    const result = await this.notificationRepository.update(
      { id: notificationId, member: { id: member.id } },
      { isRead: true },
    );
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found or does not belong to member');
    }
  }

  // MARK ALL AS READ 
  async markAllAsRead(userId: number): Promise<void> {
    const member = await this.getMemberByUserId(userId);
    await this.notificationRepository.update(
      { member: { id: member.id }, isRead: false },
      { isRead: true },
    );
  }

  // DELETE ONE 
  async delete(notificationId: number, userId: number): Promise<void> {
    const member = await this.getMemberByUserId(userId);
    const result = await this.notificationRepository.delete({
      id: notificationId,
      member: { id: member.id },
    });
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found or does not belong to member');
    }
  }

  //  DELETE ALL
  async deleteAll(userId: number): Promise<void> {
    const member = await this.getMemberByUserId(userId);
    await this.notificationRepository.delete({ member: { id: member.id } });
  }
}
