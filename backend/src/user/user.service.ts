import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { Member } from '../members/member.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
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
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // oslobadjanje emaila za ponovnu upotrebu
    user.email = `deleted_${user.id}_${Date.now()}@deleted.local`;
    user.status = 'deleted';

    await this.userRepository.save(user);
  }



  findPending(): Promise<User[]> {
    return this.userRepository.find({
      where: { status: 'pending' },
      relations: ['member', 'trainer'],
      order: { id: 'ASC' },
    });
  }
  
  async approve(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, { status: 'approved' });

    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }
  
  async reject(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // oslobadjanje emaila za ponovnu upotrebu
    user.email = `rejected_${user.id}_${Date.now()}@rejected.local`;
    user.status = 'rejected';

    await this.userRepository.save(user);

    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }

  
  async updateCurrentUser(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password', 'role', 'status'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const updateData: Partial<User> = {};

    // Update email
    if (dto.email && dto.email.trim().length > 0 && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email.trim());
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email is already used');
      }
      updateData.email = dto.email.trim();
    }

    // Update password
    if (dto.newPassword && dto.newPassword.trim().length >= 6) {
      if (!dto.oldPassword || dto.oldPassword.trim().length === 0) {
        throw new BadRequestException('The old password is required to change the password');
      }

      const passwordMatches = await bcrypt.compare(
        dto.oldPassword.trim(),
        user.password,
      );

      if (!passwordMatches) {
        throw new UnauthorizedException('The old password is incorrect');
      }

      updateData.password = await bcrypt.hash(dto.newPassword.trim(), 10);
    }

    // Ako nema promena – vrati korisnika bez update
    if (Object.keys(updateData).length === 0) {
    const existingUser = await this.findOne(userId);
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    return existingUser;
  }

    await this.userRepository.update(userId, updateData);

    const updatedUser = await this.findOne(userId);
    if (!updatedUser) {
      throw new BadRequestException('Failed to update user');
    }

    return updatedUser;
  }

}
