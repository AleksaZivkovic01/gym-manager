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
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Korisnik sa ovim email-om već postoji');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.create({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role ?? 'member',
    });

    if (user.role === 'member' && registerDto.member) {
      const member = this.memberRepository.create({
        name: registerDto.member.name,
        level: registerDto.member.level,
        isActive: true,
        gender: registerDto.member.gender,
        dateOfBirth: registerDto.member.dateOfBirth ? new Date(registerDto.member.dateOfBirth) : undefined,
        user,
      });
      await this.memberRepository.save(member);
    }

    if (user.role === 'trainer' && registerDto.trainer) {
      const trainer = this.trainerRepository.create({
        name: registerDto.trainer.name,
        specialty: registerDto.trainer.specialty,
        experienceYears: registerDto.trainer.experienceYears,
        gender: registerDto.trainer.gender,
        dateOfBirth: registerDto.trainer.dateOfBirth ? new Date(registerDto.trainer.dateOfBirth) : undefined,
        user,
      });
      await this.trainerRepository.save(trainer);
    }

    return this.buildAuthPayload(user);
  }

  async login(loginDto: LoginDto): Promise<AuthPayload> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Pogrešan email ili lozinka');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Pogrešan email ili lozinka');
    }

    return this.buildAuthPayload(user);
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

    const { password: _password, ...safeUser } = user;
    void _password;

    return {
      user: safeUser as Omit<User, 'password'>,
      accessToken: token,
    };
  }
}
