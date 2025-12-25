import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/user.entity';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';

export interface AuthPayload {
  user: Omit<User, 'password'>;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthPayload> {
    try {
      const existingUser = await this.userService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new BadRequestException('A user with this email already exists. Please use another email or login.');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const userRole = registerDto.role ?? 'member';
      let user = await this.userService.create({
        email: registerDto.email,
        password: hashedPassword,
        role: userRole,
        // admin automatski odobren
        status: userRole === 'admin' ? 'approved' : 'pending',
      });

      if (user.role === 'member' && registerDto.member) {
        try {
          const member = this.memberRepository.create({
            name: registerDto.member.name,
            level: registerDto.member.level,
            isActive: false, 
            gender: registerDto.member.gender,
            dateOfBirth: registerDto.member.dateOfBirth ? new Date(registerDto.member.dateOfBirth) : undefined,
            user,
          });
          await this.memberRepository.save(member);
          // Reload user with member relation
          try {
            const reloadedUser = await this.userService.findOne(user.id);
            if (reloadedUser) user = reloadedUser;
          } catch (reloadError) {
            console.warn('Failed to reload user with member relation:', reloadError);
          }
        } catch (memberError) {
          console.error('Error creating member:', memberError);
          throw new BadRequestException('Error with creating member. Please try again.');
        }
      }

      if (user.role === 'trainer' && registerDto.trainer) {
        try {
          const trainer = this.trainerRepository.create({
            name: registerDto.trainer.name,
            specialty: registerDto.trainer.specialty,
            experienceYears: registerDto.trainer.experienceYears,
            gender: registerDto.trainer.gender,
            dateOfBirth: registerDto.trainer.dateOfBirth ? new Date(registerDto.trainer.dateOfBirth) : undefined,
            user,
          });
          await this.trainerRepository.save(trainer);
          // Reload user with trainer relation
          try {
            const reloadedUser = await this.userService.findOne(user.id);
            if (reloadedUser) user = reloadedUser;
          } catch (reloadError) {
            console.warn('Failed to reload user with trainer relation:', reloadError);
          }
        } catch (trainerError) {
          console.error('Error creating trainer:', trainerError);
          throw new BadRequestException('Error with creating trainer. Please try again.');
        }
      }

      return this.buildAuthPayload(user);
    } catch (error) {
      console.error('Error in register:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Registration error. Please try again.');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthPayload> {
    try {
      const user = await this.userService.findByEmail(loginDto.email);
      if (!user) {
        console.log(`Login attempt with non-existent email: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
      if (!passwordMatches) {
        console.log(`Login attempt with wrong password for email: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      
      if (user.role !== 'admin') {
        if (!user.status || user.status === 'pending') {
          console.log(`Login attempt for pending user: ${loginDto.email}, status: ${user.status}`);
          throw new UnauthorizedException('Your registration has not been approved yet. Please wait for approval from an administrator.');
        } else if (user.status === 'rejected') {
          console.log(`Login attempt for rejected user: ${loginDto.email}`);
          throw new UnauthorizedException('Your registration has been rejected. Contact an administrator for more information.');
        } else if (user.status !== 'approved') {
          const statusValue: string = user.status || 'unknown';
          console.log(`Login attempt for user with invalid status: ${loginDto.email}, status: ${statusValue}`);
          throw new UnauthorizedException('Your account is not approved. Contact an administrator.');
        }
        // ako je odobren status, nastavi dalje
      }
      console.log(`Successful login for user: ${loginDto.email}, role: ${user.role}, status: ${user.status}`);
      return this.buildAuthPayload(user);
    } catch (error) {
      console.error('Error in login:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error during login. Please try again.');
    }
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.userService.findOne(userId);
  }

  private buildAuthPayload(user: User): AuthPayload {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // uklanja se password iz user objekta i vraca user bez passworda
    // rest operator
    const { password: _password, ...safeUser } = user;
    void _password;

    return {
      user: safeUser as Omit<User, 'password'>,
      accessToken: token,
    };
  }
}
