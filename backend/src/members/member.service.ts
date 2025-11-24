import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';

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

  create(member: Partial<Member>): Promise<Member> {
    const newMember = this.memberRepository.create(member);
    return this.memberRepository.save(newMember);
  }

  async update(id: number, updateData: Partial<Member>): Promise<Member> {
    await this.memberRepository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return updated;
  }

  delete(id: number): Promise<void> {
    return this.memberRepository.delete(id).then(() => undefined);
  }
}
