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
        throw new BadRequestException('Korisnik sa ovim email-om već postoji. Molimo koristite drugi email ili se prijavite.');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const userRole = registerDto.role ?? 'member';
      let user = await this.userService.create({
        email: registerDto.email,
        password: hashedPassword,
        role: userRole,
        // Admini su automatski odobreni, ostali moraju čekati odobrenje
        status: userRole === 'admin' ? 'approved' : 'pending',
      });

      if (user.role === 'member' && registerDto.member) {
        try {
          const member = this.memberRepository.create({
            name: registerDto.member.name,
            level: registerDto.member.level,
            isActive: true,
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
            // Continue with user without relations
          }
        } catch (memberError) {
          console.error('Error creating member:', memberError);
          // If member creation fails, we should probably rollback user creation
          // But for now, just log and continue
          throw new BadRequestException('Greška pri kreiranju člana. Molimo pokušajte ponovo.');
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
            // Continue with user without relations
          }
        } catch (trainerError) {
          console.error('Error creating trainer:', trainerError);
          throw new BadRequestException('Greška pri kreiranju trenera. Molimo pokušajte ponovo.');
        }
      }

      return this.buildAuthPayload(user);
    } catch (error) {
      console.error('Error in register:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Greška pri registraciji. Molimo pokušajte ponovo.');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthPayload> {
    try {
      const user = await this.userService.findByEmail(loginDto.email);
      if (!user) {
        console.log(`Login attempt with non-existent email: ${loginDto.email}`);
        throw new UnauthorizedException('Pogrešan email ili lozinka');
      }

      const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
      if (!passwordMatches) {
        console.log(`Login attempt with wrong password for email: ${loginDto.email}`);
        throw new UnauthorizedException('Pogrešan email ili lozinka');
      }

      // Proveri da li je korisnik odobren (admini su uvek odobreni)
      // Proveri status pre nego što dozvoliš login
      if (user.role !== 'admin') {
        if (!user.status || user.status === 'pending') {
          console.log(`Login attempt for pending user: ${loginDto.email}, status: ${user.status}`);
          throw new UnauthorizedException('Vaša registracija još nije odobrena. Molimo sačekajte odobrenje administratora.');
        } else if (user.status === 'rejected') {
          console.log(`Login attempt for rejected user: ${loginDto.email}`);
          throw new UnauthorizedException('Vaša registracija je odbijena. Kontaktirajte administratora za više informacija.');
        } else if (user.status !== 'approved') {
          console.log(`Login attempt for user with invalid status: ${loginDto.email}, status: ${user.status}`);
          throw new UnauthorizedException('Vaš nalog nije odobren. Kontaktirajte administratora.');
        }
      }

      console.log(`Successful login for user: ${loginDto.email}, role: ${user.role}, status: ${user.status}`);
      return this.buildAuthPayload(user);
    } catch (error) {
      console.error('Error in login:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Greška pri prijavi. Molimo pokušajte ponovo.');
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

    const { password: _password, ...safeUser } = user;
    void _password;

    return {
      user: safeUser as Omit<User, 'password'>,
      accessToken: token,
    };
  }
}
