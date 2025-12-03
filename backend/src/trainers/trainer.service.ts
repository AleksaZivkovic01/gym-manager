import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './trainer.entity';
import { CreateTrainerDto, UpdateTrainerDto } from './dto/trainer.dto';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  findAll(): Promise<Trainer[]> {
    return this.trainerRepository.find({ relations: ['sessions'] });
  }

  async findOne(id: number): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { id },
      relations: ['sessions'],
    });
    if (!trainer) throw new NotFoundException(`Trainer ${id} not found`);
    return trainer;
  }

  create(dto: CreateTrainerDto): Promise<Trainer> {
    const trainer = this.trainerRepository.create({
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    });

    return this.trainerRepository.save(trainer);
  }

  async update(id: number, dto: UpdateTrainerDto): Promise<Trainer> {
    const updateData = {
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    };

    await this.trainerRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.trainerRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Trainer ${id} not found`);
  }
}
