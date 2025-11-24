import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './trainer.entity';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trainer])],
  providers: [TrainerService],
  controllers: [TrainerController],
})
export class TrainersModule {}
