import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

import { appConfig } from '../../app.config';
import { UserEntity as User } from '../../users/entities/user.entity';
import { AuthService } from '../auth.service';

const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: appConfig.jwt.secret,
    });
  }

  validate(payload: { id: string }): Promise<User> {
    return this.authService.validateJwtPayload(payload);
  }
}