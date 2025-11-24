import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { Trainer } from './trainer.entity';
import { CreateTrainerDto, UpdateTrainerDto } from './dto/trainer.dto';

@Controller('trainers')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Get()
  getAll(): Promise<Trainer[]> {
    return this.trainerService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<Trainer> {
    return this.trainerService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTrainerDto): Promise<Trainer> {
    return this.trainerService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrainerDto): Promise<Trainer> {
    return this.trainerService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.trainerService.delete(id);
  }
}
