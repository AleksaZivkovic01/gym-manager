import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './training-session.entity';
import { SessionRegistration } from './session-registration.entity';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto, RegisterToSessionDto, CreateTrainingSessionByTrainerDto } from './dto/training-session.dto';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';
import { TrainerService } from '../trainers/trainer.service';

@Injectable()
export class TrainingSessionService {
  constructor(
    @InjectRepository(TrainingSession)
    private sessionRepository: Repository<TrainingSession>,
    @InjectRepository(SessionRegistration)
    private registrationRepository: Repository<SessionRegistration>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
    @Inject(forwardRef(() => TrainerService))
    private trainerService: TrainerService,
  ) {}

  async findAll(): Promise<TrainingSession[]> {
    return this.sessionRepository.find({ 
      relations: ['trainer', 'registrations', 'registrations.member'],
      order: { date: 'ASC', time: 'ASC' }
    });
  }

  async findOne(id: number): Promise<TrainingSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['trainer', 'registrations', 'registrations.member'],
    });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async create(dto: CreateTrainingSessionDto): Promise<TrainingSession> {
    const trainer = await this.trainerRepository.findOne({ where: { id: dto.trainerId } });
    if (!trainer) throw new NotFoundException(`Trainer ${dto.trainerId} not found`);

    const session = this.sessionRepository.create({
      date: new Date(dto.date),
      time: dto.time,
      type: dto.type,
      maxParticipants: dto.maxParticipants,
      trainer,
    });

    return this.sessionRepository.save(session);
  }

  // Create session by trainer (for authenticated trainer)
  async createByTrainer(trainerId: number, dto: CreateTrainingSessionByTrainerDto): Promise<TrainingSession> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) throw new NotFoundException(`Trainer ${trainerId} not found`);

    const session = this.sessionRepository.create({
      date: new Date(dto.date),
      time: dto.time,
      type: dto.type,
      maxParticipants: dto.maxParticipants,
      trainer,
    });

    return this.sessionRepository.save(session);
  }

  // Create session by trainer using user ID
  async createByTrainerForUser(userId: number, dto: CreateTrainingSessionByTrainerDto): Promise<TrainingSession> {
    const trainer = await this.trainerService.findByUserId(userId);
    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    return this.createByTrainer(trainer.id, dto);
  }

  async update(id: number, dto: UpdateTrainingSessionDto): Promise<TrainingSession> {
    const session = await this.findOne(id);

    if (dto.trainerId) {
      const trainer = await this.trainerRepository.findOne({ where: { id: dto.trainerId } });
      if (!trainer) throw new NotFoundException(`Trainer ${dto.trainerId} not found`);
      session.trainer = trainer;
    }

    if (dto.date) session.date = new Date(dto.date);
    if (dto.time) session.time = dto.time;
    if (dto.type) session.type = dto.type;
    if (dto.maxParticipants !== undefined) session.maxParticipants = dto.maxParticipants;

    return this.sessionRepository.save(session);
  }

  async delete(id: number): Promise<void> {
    const result = await this.sessionRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Session ${id} not found`);
  }

  // Register a member to a session
  async registerMember(sessionId: number, dto: RegisterToSessionDto): Promise<SessionRegistration> {
    const session = await this.findOne(sessionId);
    const member = await this.memberRepository.findOne({ where: { id: dto.memberId } });
    
    if (!member) throw new NotFoundException(`Member ${dto.memberId} not found`);

    // Check if member is active (has a package)
    if (!member.isActive) {
      throw new BadRequestException('Ne možete rezervisati trening jer nemate aktivno članstvo. Molimo izaberite paket.');
    }

    // Check if member is already registered
    const existingRegistration = await this.registrationRepository.findOne({
      where: { session: { id: sessionId }, member: { id: dto.memberId } },
    });

    if (existingRegistration) {
      throw new BadRequestException('Član je već prijavljen na ovaj trening.');
    }

    // Check if session is full
    const currentRegistrations = await this.registrationRepository.count({
      where: { session: { id: sessionId } },
    });

    if (currentRegistrations >= session.maxParticipants) {
      throw new BadRequestException('Trening je popunjen. Nema više mesta.');
    }

    const registration = this.registrationRepository.create({
      session,
      member,
    });

    return this.registrationRepository.save(registration);
  }

  // Get all registered members for a session
  async getRegisteredMembers(sessionId: number): Promise<Member[]> {
    // Verify session exists (will throw NotFoundException if not found)
    await this.findOne(sessionId);
    const registrations = await this.registrationRepository.find({
      where: { session: { id: sessionId } },
      relations: ['member'],
    });

    return registrations.map(reg => reg.member);
  }

  // Unregister a member from a session
  async unregisterMember(sessionId: number, memberId: number): Promise<void> {
    const registration = await this.registrationRepository.findOne({
      where: { session: { id: sessionId }, member: { id: memberId } },
    });

    if (!registration) {
      throw new NotFoundException('Član nije prijavljen na ovaj trening.');
    }

    await this.registrationRepository.delete(registration.id);
  }

  // Get sessions for a specific trainer
  async findByTrainer(trainerId: number): Promise<TrainingSession[]> {
    return this.sessionRepository.find({
      where: { trainer: { id: trainerId } },
      relations: ['trainer', 'registrations', 'registrations.member'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  // Get sessions for a specific member
  async findByMember(memberId: number): Promise<TrainingSession[]> {
    const registrations = await this.registrationRepository.find({
      where: { member: { id: memberId } },
      relations: ['session', 'session.trainer'],
    });

    return registrations.map(reg => reg.session);
  }
}