import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemberService } from './member.service';

@Injectable()
export class MembershipSchedulerService {
  private readonly logger = new Logger(MembershipSchedulerService.name);

  constructor(private readonly memberService: MemberService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredMemberships() {
    this.logger.log('Checking for expired memberships...');
    
    try {
      const expiredCount = await this.memberService.expireMemberships();
      if (expiredCount > 0) {
        this.logger.log(`Expired ${expiredCount} membership(s)`);
      } else {
        this.logger.log('No expired memberships found');
      }
    } catch (error) {
      this.logger.error('Error checking expired memberships:', error);
    }
  }
}
