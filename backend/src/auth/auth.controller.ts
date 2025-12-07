import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { AuthPayload, AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/user.entity';

type AuthenticatedRequest = Request & { user: Omit<User, 'password'> };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthPayload> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      console.error('Error in register controller:', error);
      throw error;
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthPayload> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      console.error('Error in login controller:', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: AuthenticatedRequest): Omit<User, 'password'> {
    return req.user;
  }
}
