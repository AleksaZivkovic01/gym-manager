import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['member', 'trainer'] });
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['member', 'trainer'],
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['member', 'trainer'],
    });
  }

  create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) throw new Error(`User with ID ${id} not found`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
