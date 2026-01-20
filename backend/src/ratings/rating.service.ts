import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
  ) {}

  async create(trainerId: number, dto: CreateRatingDto): Promise<Rating> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const member = await this.memberRepository.findOne({ where: { id: dto.memberId } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${dto.memberId} not found`);
    }

    const existingRating = await this.ratingRepository.findOne({
      where: { trainer: { id: trainerId }, member: { id: dto.memberId } },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this trainer.');
    }

    const rating = this.ratingRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      member,
      trainer,
    });

    return this.ratingRepository.save(rating);
  }

  async update(ratingId: number, dto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['member', 'trainer'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);
    }

    if (dto.rating !== undefined) rating.rating = dto.rating;
    if (dto.comment !== undefined) rating.comment = dto.comment;

    return this.ratingRepository.save(rating);
  }

  async findByTrainer(trainerId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { trainer: { id: trainerId } },
      relations: ['member'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByMember(memberId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { member: { id: memberId } },
      relations: ['trainer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(trainerId: number): Promise<number> {
    const ratings = await this.ratingRepository.find({
      where: { trainer: { id: trainerId } },
      select: ['rating'],
    });

    if (ratings.length === 0) {
      return 0;
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10; 
  }

  async getRatingByMemberAndTrainer(memberId: number, trainerId: number): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { member: { id: memberId }, trainer: { id: trainerId } },
      relations: ['member', 'trainer'],
    });
  }

  async delete(ratingId: number): Promise<void> {
    const result = await this.ratingRepository.delete(ratingId);
    if (result.affected === 0) {
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);
    }
  }
}

