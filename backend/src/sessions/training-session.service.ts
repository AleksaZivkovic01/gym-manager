import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './training-session.entity';
import { SessionRegistration } from './session-registration.entity';
import { CreateTrainingSessionDto, UpdateTrainingSessionDto, RegisterToSessionDto, CreateTrainingSessionByTrainerDto } from './dto/training-session.dto';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';
import { TrainerService } from '../trainers/trainer.service';
import { NotificationService } from '../notifications/notification.service';

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
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
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

  private normalizeTime(time: string): string {
    if (!time) return time;
    // Ukloni sekunde ako postoje 
    const parts = time.split(':');
    if (parts.length === 3) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }

  async create(dto: CreateTrainingSessionDto): Promise<TrainingSession> {
    const trainer = await this.trainerRepository.findOne({ where: { id: dto.trainerId } });
    if (!trainer) throw new NotFoundException(`Trainer ${dto.trainerId} not found`);

    const session = this.sessionRepository.create({
      date: new Date(dto.date),
      time: this.normalizeTime(dto.time),
      type: dto.type,
      maxParticipants: dto.maxParticipants,
      trainer,
    });

    return this.sessionRepository.save(session);
  }

  
  async createByTrainer(trainerId: number, dto: CreateTrainingSessionByTrainerDto): Promise<TrainingSession> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) throw new NotFoundException(`Trainer ${trainerId} not found`);

    const session = this.sessionRepository.create({
      date: new Date(dto.date),
      time: this.normalizeTime(dto.time),
      type: dto.type,
      maxParticipants: dto.maxParticipants,
      trainer,
    });

    return this.sessionRepository.save(session);
  }

  
  async createByTrainerForUser(userId: number, dto: CreateTrainingSessionByTrainerDto): Promise<TrainingSession> {
    const trainer = await this.trainerService.findByUserId(userId);
    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    return this.createByTrainer(trainer.id, dto);
  }

  async update(id: number, dto: UpdateTrainingSessionDto): Promise<TrainingSession> {
    const session = await this.findOne(id);

    const oldDate = session.date;
    const oldTime = session.time;
    const oldType = session.type;
    const oldMaxParticipants = session.maxParticipants;

    if (dto.trainerId) {
      const trainer = await this.trainerRepository.findOne({ where: { id: dto.trainerId } });
      if (!trainer) throw new NotFoundException(`Trainer ${dto.trainerId} not found`);
      session.trainer = trainer;
    }

    if (dto.date) session.date = new Date(dto.date);
    if (dto.time) session.time = this.normalizeTime(dto.time);
    if (dto.type) session.type = dto.type;
    if (dto.maxParticipants !== undefined) session.maxParticipants = dto.maxParticipants;

    const updatedSession = await this.sessionRepository.save(session);

    const registrations = await this.registrationRepository.find({
      where: { session: { id } },
      relations: ['member'],
    });

    const changes: string[] = [];
    
    // Proveri da li je stvarno promenjeno
    if (dto.date && new Date(dto.date).getTime() !== new Date(oldDate).getTime()) {
      const newDate = new Date(dto.date).toLocaleDateString('sr-RS');
      changes.push(`datum na ${newDate}`);
    }
    if (dto.time && dto.time !== oldTime) {
      changes.push(`pocetak treninga na ${dto.time}`);
    }
    if (dto.type && dto.type !== oldType) {
      changes.push(`tip treninga na "${dto.type}"`);
    }
    if (dto.maxParticipants !== undefined && dto.maxParticipants !== oldMaxParticipants) {
      changes.push(`maksimalan broj ucesnika na ${dto.maxParticipants}`);
    }

    if (changes.length > 0 && registrations.length > 0) {
      const message = `Trening "${session.type}" koji ste rezervisali je azuriran. Promenjeno: ${changes.join(', ')}.`;
      for (const registration of registrations) {
        try {
          await this.notificationService.createNotification(registration.member.id, message);
        } catch {
          // nista se ne dešava
        }
      }
    }

    return updatedSession;
  }

  async delete(id: number): Promise<void> {
    const session = await this.findOne(id);

    // kreira obavestenja za sve registrovane clanove
    const registrations = await this.registrationRepository.find({
      where: { session: { id } },
      relations: ['member'],
    });

    if (registrations.length > 0) {
      const message = `Trening "${session.type}" koji ste rezervisali je otkazan.`;
      for (const registration of registrations) {
        try {
          await this.notificationService.createNotification(registration.member.id, message);
        } catch {
          // nista se ne dešava 
        }
      }
    }

    const result = await this.sessionRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Session ${id} not found`);
  }

  // prijava clana na trening
  async registerMember(sessionId: number, dto: RegisterToSessionDto): Promise<SessionRegistration> {
    const session = await this.findOne(sessionId);
    const member = await this.memberRepository.findOne({ where: { id: dto.memberId } });
    
    if (!member) throw new NotFoundException(`Member ${dto.memberId} not found`);

    
    if (!member.isActive) {
      throw new BadRequestException('You cannot reserve a training because you do not have an active membership. Please select a package');
    }

    // Check if member is already registered
    const existingRegistration = await this.registrationRepository.findOne({
      where: { session: { id: sessionId }, member: { id: dto.memberId } },
    });

    if (existingRegistration) {
      throw new BadRequestException('Member is already registered for this session.');
    }

    // provera da li ima mesta
    const currentRegistrations = await this.registrationRepository.count({
      where: { session: { id: sessionId } },
    });

    if (currentRegistrations >= session.maxParticipants) {
      throw new BadRequestException('Training session is full.');
    }

    const registration = this.registrationRepository.create({
      session,
      member,
    });

    return this.registrationRepository.save(registration);
  }

  
  async getRegisteredMembers(sessionId: number): Promise<Member[]> {
    
    await this.findOne(sessionId);
    const registrations = await this.registrationRepository.find({
      where: { session: { id: sessionId } },
      relations: ['member'],
    });

    return registrations.map(reg => reg.member);
  }

  
  async unregisterMember(sessionId: number, memberId: number): Promise<void> {
    const registration = await this.registrationRepository.findOne({
      where: { session: { id: sessionId }, member: { id: memberId } },
    });

    if (!registration) {
      throw new NotFoundException('Member is not registered for this session.');
    }

    await this.registrationRepository.delete(registration.id);
  }

  
  async findByTrainer(trainerId: number): Promise<TrainingSession[]> {
    return this.sessionRepository.find({
      where: { trainer: { id: trainerId } },
      relations: ['trainer', 'registrations', 'registrations.member'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  
  async findByMember(memberId: number): Promise<TrainingSession[]> {
    const registrations = await this.registrationRepository.find({
      where: { member: { id: memberId } },
      relations: ['session', 'session.trainer'],
    });

    return registrations.map(reg => reg.session);
  }

}