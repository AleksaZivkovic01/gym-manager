import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './trainer.entity';
import { CreateTrainerDto, UpdateTrainerDto } from './dto/trainer.dto';
import { RatingService } from '../ratings/rating.service';
import { TrainingSession } from '../sessions/training-session.entity';
import { User } from '../user/user.entity';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
    @InjectRepository(TrainingSession)
    private sessionRepository: Repository<TrainingSession>,
    @Inject(forwardRef(() => RatingService)) // resava circular dependency
    private ratingService: RatingService,
  ) {}

  async findAll(): Promise<Trainer[]> {
    const trainers = await this.trainerRepository.find({
        relations: ['sessions', 'user'],
        where: {
          user: {
            status: 'approved',
          },
        },
      });

    
    for (const trainer of trainers) {
      try {
        const averageRating = await this.ratingService.getAverageRating(trainer.id);
        (trainer as any).averageRating = averageRating > 0 ? averageRating : null;
      } catch {
        (trainer as any).averageRating = null;
      }
    }
    
    return trainers;
  }

  async findOne(id: number): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { id },
      relations: ['sessions'],
    });
    if (!trainer) throw new NotFoundException(`Trainer ${id} not found`);
    return trainer;
  }

  
  async findByUserId(userId: number): Promise<Trainer | null> {
    const trainer = await this.trainerRepository
      .createQueryBuilder('trainer')
      .leftJoinAndSelect('trainer.user', 'user')
      .leftJoinAndSelect('trainer.sessions', 'sessions')
      .where('user.id = :userId', { userId })
      .getOne();
    
    if (trainer) {
      try {
        const averageRating = await this.ratingService.getAverageRating(trainer.id);
        (trainer as any).averageRating = averageRating > 0 ? averageRating : null;
      } catch {
        (trainer as any).averageRating = null;
      }
    }
    
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
  const trainer = await this.trainerRepository.findOne({
    where: { id },
    relations: ['user'],
  });

    if (!trainer) {
      throw new NotFoundException(`Trainer ${id} not found`);
    }

    await this.sessionRepository.delete({ trainer: { id } });
    // obrisi usera
    await this.userRepository.delete(trainer.user.id);
  }

}
