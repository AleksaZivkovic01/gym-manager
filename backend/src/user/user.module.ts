import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User,Member,Trainer])],
  providers: [UserService],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
