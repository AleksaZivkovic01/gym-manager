import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
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
        
        if (dto.packageId !== null && dto.packageId !== undefined) {
          updateData.packageStatus = 'pending_package';
          updateData.isActive = false; 
        } else {
          updateData.packageStatus = undefined;
          updateData.isActive = false;
          updateData.membershipStartDate = undefined;
          updateData.membershipEndDate = undefined;
        }
        
        // admin moze da izvrsi active ili inactive membership
        if (dto.isActive !== undefined) {
          updateData.isActive = dto.isActive;
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
        // ako pukne findOne, vracam member bez relacija
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
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<Member | null> {
    return this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.sessionRegistrations', 'sessionRegistrations')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.package', 'package')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findPendingPackageRequests(): Promise<Member[]> {
    return this.memberRepository.find({
      where: {
        packageStatus: 'pending_package'
      },
      relations: ['user', 'package'],
      order: {
        id: 'DESC'
      }
    });
  }

  async approvePackage(memberId: number): Promise<Member> {
    const member = await this.findOne(memberId);
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    if (member.packageStatus !== 'pending_package') {
      throw new NotFoundException(`Member ${memberId} does not have a pending package request`);
    }

    if (!member.packageId) {
      throw new NotFoundException(`Member ${memberId} does not have a package selected`);
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30); 

    await this.memberRepository.update(memberId, {
      packageStatus: 'active',
      isActive: true,
      membershipStartDate: now,
      membershipEndDate: endDate
    });

    const updated = await this.findOne(memberId);
    if (!updated) {
      throw new NotFoundException(`Member with ID ${memberId} not found after update`);
    }
    return updated;
  }

  async rejectPackage(memberId: number): Promise<Member> {
    const member = await this.findOne(memberId);
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    if (member.packageStatus !== 'pending_package') {
      throw new NotFoundException(`Member ${memberId} does not have a pending package request`);
    }

    await this.memberRepository.update(memberId, {
      packageStatus: undefined,
      packageId: undefined,
      isActive: false,
      membershipStartDate: undefined,
      membershipEndDate: undefined
    });

    const updated = await this.findOne(memberId);
    if (!updated) {
      throw new NotFoundException(`Member with ID ${memberId} not found after update`);
    }
    return updated;
  }

  async expireMemberships(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.memberRepository.update(
      {
        packageStatus: 'active',
        membershipEndDate: LessThan(today)
      },
      {
        packageStatus: 'expired',
        isActive: false,
        packageId: undefined,
        membershipStartDate: undefined,
        membershipEndDate: undefined
      }
    );

    return result.affected || 0;
  }

}
