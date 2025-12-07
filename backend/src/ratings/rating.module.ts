import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Member, Trainer])],
  providers: [RatingService],
  controllers: [RatingController],
  exports: [RatingService],
})
export class RatingModule {}

