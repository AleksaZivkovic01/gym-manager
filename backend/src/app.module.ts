import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MembersModule } from './members/member.module';
import { TrainersModule } from './trainers/trainers.module';
import { TrainingSessionModule } from './sessions/training-session.module';
import { UserModule } from './user/user.module';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'gymdb1',
      autoLoadEntities: true,
      synchronize: true,
    }),
    MembersModule,
    TrainersModule,
    TrainingSessionModule,
    UserModule,
   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
