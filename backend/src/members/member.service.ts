import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { SessionRegistration } from '../sessions/session-registration.entity';
import { User } from '../user/user.entity';


@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(SessionRegistration)
    private registrationRepository: Repository<SessionRegistration>,
  ) {}

  findAll(): Promise<Member[]> {
    return this.memberRepository.find({ 
      relations: ['sessionRegistrations', 'package', 'user'],
      where: {
        user: {
          status: 'approved'
        }
      }
    });
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
      
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.level !== undefined) updateData.level = dto.level;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
      if (dto.gender !== undefined) updateData.gender = dto.gender;
      if (dto.dateOfBirth !== undefined) {
        updateData.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
      }
      
      if (dto.packageId !== undefined) {
        updateData.packageId = dto.packageId || null;
        // isActive je true samo ako postoji packageId, inače false
        if (dto.isActive === undefined) {
          updateData.isActive = dto.packageId !== null && dto.packageId !== undefined;
        }
      }

      await this.memberRepository.update(id, updateData);

     
      try {
        const updated = await this.findOne(id);
        if (!updated) {
          throw new NotFoundException(`Member with ID ${id} not found`);
        }
        return updated;
      } catch (findError) {
     
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
      const member = await this.memberRepository.findOne({
        where: { id },
        relations: ['user', 'sessionRegistrations'],
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }


      if (member.sessionRegistrations?.length) {
        const registrationIds = member.sessionRegistrations.map(r => r.id);
        await this.registrationRepository.delete(registrationIds);
      }

      await this.userRepository.delete(member.user.id);

    } catch (error) {
      console.error(`Error deleting member with ID ${id}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    }
  }

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
