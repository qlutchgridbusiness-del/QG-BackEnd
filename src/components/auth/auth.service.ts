// src/components/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../user/user.entity';
import { Business } from '../business/business.entity';
import { RegisterDto } from './auth.dto';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  /* -----------------------------
     1️⃣ REQUEST OTP
  ------------------------------ */
  async requestOtp(phone: string) {
    return this.otpService.sendOtp(phone);
  }

  async verifyOtp(phone: string, otp: string) {
    const valid = await this.otpService.verifyOtp(phone, otp);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.userRepo.findOne({ where: { phone } });

    // 🔹 Existing user → full login
    if (user) {
      return this.issueToken(user);
    }

    // 🔹 New user → temp token
    const tempToken = this.jwtService.sign(
      { phone, purpose: 'REGISTER' },
      { expiresIn: '10m' },
    );

    return {
      isNewUser: true,
      tempToken,
      phone,
    };
  }

  async register(dto: RegisterDto, tempToken: string) {
    const payload = this.jwtService.verify(tempToken);

    if (payload.purpose !== 'REGISTER') {
      throw new UnauthorizedException('Invalid registration token');
    }

    if (payload.phone !== dto.phone) {
      throw new UnauthorizedException('Phone mismatch');
    }

    let user = await this.userRepo.findOne({
      where: [{ phone: dto.phone }, dto.email ? { email: dto.email } : {}],
    });

    if (!user) {
      try {
        user = this.userRepo.create({
          phone: dto.phone,
          name: dto.name,
          email: dto.email,
          role: dto.role === 'business' ? UserRole.BUSINESS : UserRole.USER,
        });

        await this.userRepo.save(user);
      } catch (err: any) {
        // 🔒 Handle race condition / duplicate submit
        if (err.code === '23505') {
          user = await this.userRepo.findOne({
            where: { phone: dto.phone },
          });
        } else {
          throw err;
        }
      }
    }

    // 🏢 Create business if needed
    if (user.role === UserRole.BUSINESS) {
      const existing = await this.businessRepo.findOne({
        where: { owner: { id: user.id } },
      });

      if (!existing) {
        const business = this.businessRepo.create({
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          owner: user,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
        });

        await this.businessRepo.save(business);
      }
    }

    return this.issueToken(user);
  }

  /* -----------------------------
     🔐 JWT ISSUER (PRIVATE)
  ------------------------------ */
  private issueToken(user: User) {
    const token = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
