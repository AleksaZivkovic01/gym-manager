import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { SessionRegistration } from '../sessions/session-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, SessionRegistration])],
  providers: [MemberService],
  controllers: [MemberController],
})
export class MembersModule {}
