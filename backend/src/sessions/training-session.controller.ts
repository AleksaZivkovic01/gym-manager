import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TrainingSessionService } from './training-session.service';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto, RegisterToSessionDto, CreateTrainingSessionByTrainerDto } from './dto/training-session.dto';
import { TrainingSession } from './training-session.entity';
import { Member } from '../members/member.entity';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('sessions')
export class TrainingSessionController {
  constructor(private readonly sessionService: TrainingSessionService) {}

  @Get()
  getAll(): Promise<TrainingSession[]> {
    return this.sessionService.findAll();
  }

  @Get('trainer/:trainerId')
  getByTrainer(@Param('trainerId', ParseIntPipe) trainerId: number): Promise<TrainingSession[]> {
    return this.sessionService.findByTrainer(trainerId);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthGuard('jwt'))
  @Get('my-sessions')
  async getMySessions(@Req() req: AuthenticatedRequest): Promise<TrainingSession[]> {
    if (req.user.role === 'member' && req.user.member?.id) {
      return this.sessionService.findByMember(req.user.member.id);
    }
    return [];
  }


  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<TrainingSession> {
    return this.sessionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','trainer')
  @Get(':id/members')
  getRegisteredMembers(@Param('id', ParseIntPipe) id: number): Promise<Member[]> {
    return this.sessionService.getRegisteredMembers(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','trainer')
  @Post()
  create(@Body() dto: CreateTrainingSessionDto): Promise<TrainingSession> {
    return this.sessionService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('trainer')
  @Post('me')
  async createMySession(@Req() req: AuthenticatedRequest, @Body() dto: CreateTrainingSessionByTrainerDto): Promise<TrainingSession> {
    if (req.user.role !== 'trainer') {
      throw new BadRequestException('Only trainers can create sessions');
    }
    return this.sessionService.createByTrainerForUser(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','member')
  @Post(':id/register')
  registerMember(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() dto: RegisterToSessionDto,
  ) {
    return this.sessionService.registerMember(sessionId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','member')
  @Delete(':id/register/:memberId')
  unregisterMember(
    @Param('id', ParseIntPipe) sessionId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<void> {
    return this.sessionService.unregisterMember(sessionId, memberId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','trainer')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrainingSessionDto,
  ): Promise<TrainingSession> {
    return this.sessionService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','trainer')
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sessionService.delete(id);
  }
}
