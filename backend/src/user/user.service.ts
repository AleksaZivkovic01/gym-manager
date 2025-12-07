import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

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

  // Get pending users (needs approval)
  findPending(): Promise<User[]> {
    return this.userRepository.find({
      where: { status: 'pending' },
      relations: ['member', 'trainer'],
      order: { id: 'ASC' },
    });
  }

  // Approve user
  async approve(id: number): Promise<User> {
    return this.update(id, { status: 'approved' });
  }

  // Reject user
  async reject(id: number): Promise<User> {
    return this.update(id, { status: 'rejected' });
  }

  // Update current user (email and/or password)
  async updateCurrentUser(userId: number, dto: UpdateUserDto): Promise<User> {
    // Load user with password field for password verification
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password', 'role', 'status']
    });
    if (!user) {
      throw new BadRequestException('Korisnik nije pronađen');
    }

    const updateData: Partial<User> = {};

    // Update email if provided (and not empty)
    if (dto.email && dto.email.trim && dto.email.trim().length > 0 && dto.email !== user.email) {
      // Check if email already exists
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email je već u upotrebi');
      }
      updateData.email = dto.email.trim();
    }

    // Update password if provided (and not empty)
    if (dto.newPassword && dto.newPassword.trim && dto.newPassword.trim().length >= 6) {
      const trimmedOldPassword = dto.oldPassword?.trim && dto.oldPassword.trim() || dto.oldPassword;
      if (!trimmedOldPassword || trimmedOldPassword.length === 0) {
        throw new BadRequestException('Stara lozinka je obavezna za promenu lozinke');
      }

      // Verify old password
      const passwordMatches = await bcrypt.compare(trimmedOldPassword, user.password);
      if (!passwordMatches) {
        throw new UnauthorizedException('Stara lozinka nije ispravna');
      }

      // Hash new password
      const trimmedNewPassword = dto.newPassword.trim && dto.newPassword.trim() || dto.newPassword;
      const hashedPassword = await bcrypt.hash(trimmedNewPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    if (Object.keys(updateData).length > 0) {
      // For password update, we need to explicitly select password field
      const userToUpdate = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'password', 'role', 'status']
      });
      if (!userToUpdate) {
        throw new BadRequestException('Korisnik nije pronađen');
      }
      
      // Update fields
      if (updateData.email) {
        userToUpdate.email = updateData.email;
      }
      if (updateData.password) {
        userToUpdate.password = updateData.password;
      }
      
      // Save the updated user - explicitly save password field
      await this.userRepository.save(userToUpdate);
      
      // Force flush to ensure database write
      if (updateData.password) {
        // Use query builder to directly update password in database
        await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({ password: updateData.password })
          .where('id = :id', { id: userId })
          .execute();
      }
      
      // Verify the update by checking the password directly from database
      if (updateData.password) {
        // Wait a bit to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const verifyUser = await this.userRepository
          .createQueryBuilder('user')
          .select(['user.id', 'user.email', 'user.password'])
          .where('user.id = :id', { id: userId })
          .getOne();
          
        if (verifyUser && verifyUser.password) {
          // Ensure newPassword is defined and not empty
          if (!dto.newPassword) {
            throw new BadRequestException('Greška pri ažuriranju lozinke. Molimo pokušajte ponovo.');
          }
          
          const trimmedNewPassword = typeof dto.newPassword === 'string' && dto.newPassword.trim ? dto.newPassword.trim() : dto.newPassword;
          
          if (!trimmedNewPassword || trimmedNewPassword.length === 0) {
            throw new BadRequestException('Greška pri ažuriranju lozinke. Molimo pokušajte ponovo.');
          }
          
          const newPasswordMatches: boolean = await bcrypt.compare(trimmedNewPassword, verifyUser.password);
          
          if (newPasswordMatches === false) {
            throw new BadRequestException('Greška pri ažuriranju lozinke. Molimo pokušajte ponovo.');
          }
        } else {
          throw new BadRequestException('Greška pri verifikaciji lozinke. Molimo pokušajte ponovo.');
        }
      }
      
      // Return user with relations (without password)
      const userWithRelations = await this.findOne(userId);
      if (!userWithRelations) {
        throw new BadRequestException('Greška pri ažuriranju korisnika');
      }
      return userWithRelations;
    }

    return user;
  }
}
