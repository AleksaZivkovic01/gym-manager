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
    return this.memberRepository.find({ relations: ['sessions'] });
  }

  findOne(id: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { id },
      relations: ['sessions'],
    });
  }

  create(dto: CreateMemberDto): Promise<Member> {
    const newMember = this.memberRepository.create({
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    });

    return this.memberRepository.save(newMember);
  }

 
  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    const updateData = {
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    };

    await this.memberRepository.update(id, updateData);

    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const result = await this.memberRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
  }
}
