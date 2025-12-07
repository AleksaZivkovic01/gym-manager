import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TrainingSessionService } from './training-session.service';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto, RegisterToSessionDto } from './dto/training-session.dto';
import { TrainingSession } from './training-session.entity';
import { Member } from '../members/member.entity';
import { User } from '../user/user.entity';

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

  @UseGuards(AuthGuard('jwt'))
  @Get('my-sessions')
  async getMySessions(@Req() req: AuthenticatedRequest): Promise<TrainingSession[]> {
    // Assuming user has member relation
    if (req.user.role === 'member' && req.user.member?.id) {
      return this.sessionService.findByMember(req.user.member.id);
    }
    // Return empty array if user is not a member or doesn't have member relation loaded
    return [];
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<TrainingSession> {
    return this.sessionService.findOne(id);
  }

  @Get(':id/members')
  getRegisteredMembers(@Param('id', ParseIntPipe) id: number): Promise<Member[]> {
    return this.sessionService.getRegisteredMembers(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateTrainingSessionDto): Promise<TrainingSession> {
    return this.sessionService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/register')
  registerMember(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() dto: RegisterToSessionDto,
  ) {
    return this.sessionService.registerMember(sessionId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/register/:memberId')
  unregisterMember(
    @Param('id', ParseIntPipe) sessionId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<void> {
    return this.sessionService.unregisterMember(sessionId, memberId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrainingSessionDto,
  ): Promise<TrainingSession> {
    return this.sessionService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sessionService.delete(id);
  }
}
