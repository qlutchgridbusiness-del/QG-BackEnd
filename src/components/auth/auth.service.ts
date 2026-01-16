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

  // 🔹 SEND OTP
  async requestOtp(phone: string) {
    console.log('check number', phone);
    return this.otpService.sendOtp(phone);
  }

  // 🔹 VERIFY OTP
  async verifyOtp(phone: string, otp: string) {
    const valid = await this.otpService.verifyOtp(phone, otp);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    return { message: 'OTP verified successfully' };
  }

  // 🔹 REGISTER
  async register(dto: RegisterDto) {
    // OTP MUST be verified before this
    const otpValid = await this.otpService.verifyOtp(dto.phone, dto.otp);
    if (!otpValid) {
      throw new UnauthorizedException('OTP verification required');
    }

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

    // 🔹 Create Business if needed
    if (dto.role === 'business') {
      const existing = await this.businessRepo.findOne({
        where: { owner: { id: user.id } },
      });

      if (!existing) {
        const business = this.businessRepo.create({
          name: dto.name || dto.name,
          phone: dto.phone,
          email: dto.email,
          owner: user,
          latitude: dto.latitude || null,
          longitude: dto.longitude || null,
        });
        await this.businessRepo.save(business);
      }
    }

    return this.issueToken(user);
  }

  // 🔹 LOGIN
  async login(phone: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueToken(user);
  }

  // 🔹 JWT ISSUER
  private issueToken(user: User) {
    const token = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
      email: user.email,
    });

    return {
      message: 'Authentication successful',
      token,
      role: user.role,
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
