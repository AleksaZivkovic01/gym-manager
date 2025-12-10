import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSession } from './training-session.entity';
import { SessionRegistration } from './session-registration.entity';
import { TrainingSessionService } from './training-session.service';
import { TrainingSessionController } from './training-session.controller';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';
import { TrainersModule } from '../trainers/trainers.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingSession, SessionRegistration, Member, Trainer]),
    forwardRef(() => TrainersModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [TrainingSessionService],
  controllers: [TrainingSessionController],
  exports: [TrainingSessionService],
})
export class TrainingSessionModule {}
