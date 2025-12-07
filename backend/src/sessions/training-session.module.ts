import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSession } from './training-session.entity';
import { SessionRegistration } from './session-registration.entity';
import { TrainingSessionService } from './training-session.service';
import { TrainingSessionController } from './training-session.controller';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingSession, SessionRegistration, Member, Trainer])],
  providers: [TrainingSessionService],
  controllers: [TrainingSessionController],
})
export class TrainingSessionModule {}
