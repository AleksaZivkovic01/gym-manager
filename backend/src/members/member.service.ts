import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';


@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  findAll(): Promise<Member[]> {
    return this.memberRepository.find({ relations: ['sessions', 'package'] });
  }

  async findOne(id: number): Promise<Member | null> {
    try {
      const member = await this.memberRepository.findOne({
        where: { id },
        relations: ['sessions', 'package', 'user'],
      });
      if (!member) {
        return null;
      }
      return member;
    } catch (error) {
      console.error(`Error finding member with ID ${id}:`, error);
      console.error('Error details:', error.message, error.stack);
      // If it's a relation error, try without relations
      try {
        const memberWithoutRelations = await this.memberRepository.findOne({
          where: { id },
        });
        return memberWithoutRelations;
      } catch (retryError) {
        console.error(`Retry also failed for member ID ${id}:`, retryError);
        throw new NotFoundException(`Error loading member with ID ${id}`);
      }
    }
  }

  create(dto: CreateMemberDto): Promise<Member> {
    const newMember = this.memberRepository.create({
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      packageId: dto.packageId || undefined,
    });

    return this.memberRepository.save(newMember);
  }

 
  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    try {
      const updateData: any = {};
      
      // Only include fields that are provided
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.level !== undefined) updateData.level = dto.level;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
      if (dto.gender !== undefined) updateData.gender = dto.gender;
      if (dto.dateOfBirth !== undefined) {
        updateData.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
      }
      
      // Handle packageId update
      if (dto.packageId !== undefined) {
        updateData.packageId = dto.packageId || null;
      }

      await this.memberRepository.update(id, updateData);

      // Try to get updated member, but if findOne fails, try without relations
      try {
        const updated = await this.findOne(id);
        if (!updated) {
          throw new NotFoundException(`Member with ID ${id} not found`);
        }
        return updated;
      } catch (findError) {
        // If findOne fails (maybe due to relations), try to get member without relations
        console.warn(`findOne failed for member ${id}, trying without relations:`, findError);
        const memberWithoutRelations = await this.memberRepository.findOne({
          where: { id },
        });
        if (!memberWithoutRelations) {
          throw new NotFoundException(`Member with ID ${id} not found`);
        }
        return memberWithoutRelations;
      }
    } catch (error) {
      console.error(`Error updating member with ID ${id}:`, error);
      console.error('Update DTO:', dto);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    const result = await this.memberRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
  }

  // Find member by user ID
  async   findByUserId(userId: number): Promise<Member | null> {
    return this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.sessions', 'sessions')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.package', 'package')
      .where('user.id = :userId', { userId })
      .getOne();
  }
}
