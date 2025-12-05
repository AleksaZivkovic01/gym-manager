import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './package.entity';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Package])],
  providers: [PackageService],
  controllers: [PackageController],
  exports: [PackageService],
})
export class PackageModule {}

