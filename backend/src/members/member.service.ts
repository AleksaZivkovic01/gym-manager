import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { SessionRegistration } from '../sessions/session-registration.entity';


@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(SessionRegistration)
    private registrationRepository: Repository<SessionRegistration>,
  ) {}

  findAll(): Promise<Member[]> {
    return this.memberRepository.find({ relations: ['sessionRegistrations', 'package'] });
  }

  async findOne(id: number): Promise<Member | null> {
    try {
      const member = await this.memberRepository.findOne({
        where: { id },
        relations: ['sessionRegistrations', 'package', 'user'],
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
    // Member is active only if they have a package
    const isActive = dto.packageId !== undefined && dto.packageId !== null;
    
    const newMember = this.memberRepository.create({
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      packageId: dto.packageId || undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : isActive,
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
      
      // Handle packageId update - automatically set isActive based on package
      if (dto.packageId !== undefined) {
        updateData.packageId = dto.packageId || null;
        // Member is active only if they have a package
        // Only update isActive if it's not explicitly set in DTO
        if (dto.isActive === undefined) {
          updateData.isActive = dto.packageId !== null && dto.packageId !== undefined;
        }
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
    try {
      // First check if member exists
      const member = await this.memberRepository.findOne({
        where: { id },
        relations: ['sessionRegistrations'],
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      // Delete all session registrations associated with this member first
      if (member.sessionRegistrations && member.sessionRegistrations.length > 0) {
        const registrationIds = member.sessionRegistrations.map(reg => reg.id);
        await this.registrationRepository.delete(registrationIds);
        console.log(`Deleted ${registrationIds.length} session registration(s) for member ${id}`);
      }

      // Now delete the member
      const result = await this.memberRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Error deleting member with ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Check if it's a foreign key constraint error
      if (error.code === '23503' || error.message?.includes('foreign key') || error.message?.includes('violates foreign key')) {
        throw new BadRequestException(`Cannot delete member with ID ${id} because it is referenced by other records (user). Please delete related user first.`);
      }
      throw error;
    }
  }

  // Find member by user ID
  async   findByUserId(userId: number): Promise<Member | null> {
    return this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.sessionRegistrations', 'sessionRegistrations')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.package', 'package')
      .where('user.id = :userId', { userId })
      .getOne();
  }
}
