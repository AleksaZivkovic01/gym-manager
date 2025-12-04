import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';

import { AuthService } from './auth.service';
import { User } from '../user/user.entity';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken() as JwtFromRequestFunction;

    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<Omit<User, 'password'> | null> {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      return null;
    }

    const { password: _password, ...safeUser } = user;
    void _password;
    return safeUser;
  }
}
