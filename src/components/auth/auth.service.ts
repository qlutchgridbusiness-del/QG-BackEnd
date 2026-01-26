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

  /* -----------------------------
     2️⃣ VERIFY OTP
     (NO TOKEN ISSUED HERE UNLESS USER EXISTS)
  ------------------------------ */
  async verifyOtp(phone: string, otp: string) {
    const valid = await this.otpService.verifyOtp(phone, otp);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.userRepo.findOne({
      where: { phone },
    });

    // 🆕 New user → frontend must show onboarding
    if (!user) {
      return {
        isNewUser: true,
        phone,
      };
    }

    // 👤 Existing user → login directly
    return {
      isNewUser: false,
      ...this.issueToken(user),
    };
  }

  /* -----------------------------
     3️⃣ REGISTER (ONLY AFTER OTP VERIFIED)
  ------------------------------ */
  async register(dto: RegisterDto) {
    // ❗ OTP must already be verified before calling register
    // (do NOT verify OTP again here)

    let user = await this.userRepo.findOne({
      where: { phone: dto.phone },
    });

    if (!user) {
      user = this.userRepo.create({
        phone: dto.phone,
        name: dto.name,
        email: dto.email,
        role: dto.role === 'business' ? UserRole.BUSINESS : UserRole.USER,
      });

      await this.userRepo.save(user);
    }

    // 🏢 Create business if role = business
    if (user.role === UserRole.BUSINESS) {
      const existingBusiness = await this.businessRepo.findOne({
        where: { owner: { id: user.id } },
      });

      if (!existingBusiness) {
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
