import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallbackSecret',
    });
  }

  async validate(payload: any) {
    // ⚠️ THIS becomes req.user
    return {
      id: payload.sub, // 👈 REQUIRED
      phone: payload.phone,
      role: payload.role,
      email: payload.email,
    };
  }
}
