import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { SessionRegistration } from '../sessions/session-registration.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Member, SessionRegistration])],
  providers: [MemberService],
  controllers: [MemberController],
})
export class MembersModule {}
