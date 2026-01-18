import {  ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
  ) {}

 async register(registerDto: RegisterDto): Promise<AuthPayload> {
  console.log('Register attempt for email:', registerDto.email);

  const existingUser = await this.userRepository.findOne({
    where: { email: registerDto.email },
  });

  if (existingUser) {
    console.log('Registration blocked: email already exists');
    throw new ConflictException('A user with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(registerDto.password, 10);
 
  const user = new User();
  user.email = registerDto.email;
  user.password = hashedPassword;
  user.role = registerDto.role ?? 'member';
  user.status = user.role === 'admin' ? 'approved' : 'pending';

  if (user.role === 'member' && registerDto.member) {
    const member = new Member();
    member.name = registerDto.member.name;
    member.level = registerDto.member.level;
    member.gender = registerDto.member.gender;
    member.dateOfBirth = registerDto.member.dateOfBirth ? new Date(registerDto.member.dateOfBirth) : undefined;
    member.isActive = false;
    member.user = user; 
    user.member = member; 
  }

  if (user.role === 'trainer' && registerDto.trainer) {
    const trainer = new Trainer();
    trainer.name = registerDto.trainer.name;
    trainer.specialty = registerDto.trainer.specialty;
    trainer.experienceYears = registerDto.trainer.experienceYears;
    trainer.gender = registerDto.trainer.gender;
    trainer.dateOfBirth = registerDto.trainer.dateOfBirth ? new Date(registerDto.trainer.dateOfBirth) : undefined;
    user.trainer = trainer;
  }

  try {
    const savedUser = await this.userRepository.save(user);
    console.log('Registration successful for email:', savedUser.email);
    
    // Učitaj user ponovo sa relations
    const userWithRelations = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['member', 'trainer'],
    });
    
    if (!userWithRelations) {
      throw new Error('Failed to load user after registration');
    }
    
    // ukloni circular reference da ne bi doslo do rekurzije 
    if (userWithRelations.member && userWithRelations.member.user) {
      delete (userWithRelations.member as any).user;
    }
    if (userWithRelations.trainer && userWithRelations.trainer.user) {
      delete (userWithRelations.trainer as any).user;
    }
    
    return this.buildAuthPayload(userWithRelations);
  } catch (err: any) {
    if (err.code === '23505') {
      console.log('Duplicate key detected at save():', err.detail);
      throw new ConflictException('A user with this email already exists.');
    }
    console.error('Unexpected error during registration:', err);
    throw err; 
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

      // provera statusa
      switch (user.status) {
        case 'deleted':
          throw new UnauthorizedException('Account no longer exists');
        case 'pending':
          throw new UnauthorizedException(
            'Your registration has not been approved yet. Please wait for approval from an administrator.'
          );
        case 'rejected':
          throw new UnauthorizedException(
            'Your registration has been rejected. Contact an administrator for more information.'
          );
        case 'approved':
          break;
        default:
          throw new UnauthorizedException('Your account status is invalid. Contact admin.');
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

    // uklanjam password iz user objekta i vracam usera bez passworda
    // rest operator
    const { password: _password, ...safeUser } = user;
    void _password;

    // Ukloni circular reference - ukloni user property iz member/trainer objekata
    if (safeUser.member && safeUser.member.user) {
      const { user: _memberUser, ...memberWithoutUser } = safeUser.member;
      void _memberUser;
      safeUser.member = memberWithoutUser as typeof safeUser.member;
    }

    if (safeUser.trainer && safeUser.trainer.user) {
      const { user: _trainerUser, ...trainerWithoutUser } = safeUser.trainer;
      void _trainerUser;
      safeUser.trainer = trainerWithoutUser as typeof safeUser.trainer;
    }

    return {
      user: safeUser as Omit<User, 'password'>,
      accessToken: token,
    };
  }
}
