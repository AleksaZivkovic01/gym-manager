import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './trainer.entity';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { RatingModule } from '../ratings/rating.module';
import { TrainingSession } from '../sessions/training-session.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Trainer, TrainingSession]),
    forwardRef(() => RatingModule),
  ],
  providers: [TrainerService],
  controllers: [TrainerController],
  exports: [TrainerService],
})
export class TrainersModule {}
