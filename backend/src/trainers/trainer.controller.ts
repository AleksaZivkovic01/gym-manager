import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { TrainerService } from './trainer.service';
import { Trainer } from './trainer.entity';
import { CreateTrainerDto, UpdateTrainerDto } from './dto/trainer.dto';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('trainers')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  
  @Get()
  getAll(): Promise<Trainer[]> {
    return this.trainerService.findAll();
  }

 
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyTrainer(@Req() req: AuthenticatedRequest) {
    const trainer = await this.trainerService.findByUserId(req.user.id);
    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }
    return trainer;
  }

  
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMyTrainer(@Req() req: AuthenticatedRequest, @Body() dto: UpdateTrainerDto) {
    const trainer = await this.trainerService.findByUserId(req.user.id);
    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }
    return this.trainerService.update(trainer.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<Trainer> {
    return this.trainerService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateTrainerDto): Promise<Trainer> {
    return this.trainerService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrainerDto): Promise<Trainer> {
    return this.trainerService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.trainerService.delete(id);
  }
}
