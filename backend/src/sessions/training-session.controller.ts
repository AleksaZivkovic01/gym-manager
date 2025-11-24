import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { TrainingSessionService } from './training-session.service';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto } from './dto/training-session.dto';
import { TrainingSession } from './training-session.entity';

@Controller('sessions')
export class TrainingSessionController {
  constructor(private readonly sessionService: TrainingSessionService) {}

  @Get()
  getAll(): Promise<TrainingSession[]> {
    return this.sessionService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<TrainingSession> {
    return this.sessionService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTrainingSessionDto): Promise<TrainingSession> {
    return this.sessionService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrainingSessionDto,
  ): Promise<TrainingSession> {
    return this.sessionService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sessionService.delete(id);
  }
}
