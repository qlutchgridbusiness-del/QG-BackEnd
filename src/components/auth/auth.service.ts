import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.otpService.sendOtp(phone);
  }

  // 🔹 VERIFY OTP → ISSUE TEMP TOKEN
  async verifyOtp(phone: string, otp: string) {
    const valid = await this.otpService.verifyOtp(phone, otp);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.userRepo.findOne({ where: { phone } });

    // ⏱️ TEMP TOKEN (5 min)
    const tempToken = this.jwtService.sign(
      {
        phone,
        purpose: 'OTP_VERIFIED',
      },
      { expiresIn: '5m' },
    );

    return {
      tempToken,
      isNewUser: !user,
    };
  }

  // 🔹 REGISTER USING TEMP TOKEN
  async register(dto: RegisterDto, tempToken: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(tempToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired temp token');
    }

    if (payload.purpose !== 'OTP_VERIFIED') {
      throw new UnauthorizedException('Invalid temp token');
    }

    if (payload.phone !== dto.phone) {
      throw new UnauthorizedException('Phone mismatch');
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

  // 🔹 ISSUE REAL JWT
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
