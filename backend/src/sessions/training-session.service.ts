import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './training-session.entity';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto } from './dto/training-session.dto';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';

@Injectable()
export class TrainingSessionService {
  constructor(
    @InjectRepository(TrainingSession)
    private sessionRepository: Repository<TrainingSession>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  async findAll(): Promise<TrainingSession[]> {
    return this.sessionRepository.find({ relations: ['member', 'trainer'] });
  }

  async findOne(id: number): Promise<TrainingSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['member', 'trainer'],
    });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async create(dto: CreateTrainingSessionDto): Promise<TrainingSession> {
    const member = await this.memberRepository.findOne({ where: { id: dto.memberId } });
    const trainer = await this.trainerRepository.findOne({ where: { id: dto.trainerId } });

    if (!member) throw new NotFoundException(`Member ${dto.memberId} not found`);
    if (!trainer) throw new NotFoundException(`Trainer ${dto.trainerId} not found`);

    const session = this.sessionRepository.create({
      date: dto.date,
      time: dto.time,
      type: dto.type,
      member,
      trainer,
    });

    return this.sessionRepository.save(session);
  }

  async update(id: number, dto: UpdateTrainingSessionDto): Promise<TrainingSession> {
    const session = await this.findOne(id);

    if (dto.memberId) {
      const member = await this.memberRepository.findOne({ where: { id: dto.memberId } });
      if (!member) throw new NotFoundException(`Member ${dto.memberId} not found`);
      session.member = member;
    }

    if (dto.trainerId) {
      const trainer = await this.trainerRepository.findOne({ where: { id: dto.trainerId } });
      if (!trainer) throw new NotFoundException(`Trainer ${dto.trainerId} not found`);
      session.trainer = trainer;
    }

    session.date = dto.date ?? session.date;
    session.time = dto.time ?? session.time;
    session.type = dto.type ?? session.type;

    return this.sessionRepository.save(session);
  }

  async delete(id: number): Promise<void> {
    const result = await this.sessionRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Session ${id} not found`);
  }
}
