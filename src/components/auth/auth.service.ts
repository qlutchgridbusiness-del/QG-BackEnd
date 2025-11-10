// auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Business } from '../business/business.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto } from './auth.dto';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly verificationService: VerificationService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  async verifyOtp(phone: string, idToken: string) {
    const decoded = await this.firebaseService.verifyIdToken(idToken);
    if (decoded.phone_number !== phone) {
      throw new UnauthorizedException('Phone number mismatch');
    }
    return { message: 'OTP verified successfully' };
  }

  async register(dto: RegisterDto) {
    const decoded = await this.firebaseService.verifyIdToken(dto.idToken);
    if (decoded.phone_number !== dto.phone) {
      throw new UnauthorizedException('Phone number mismatch');
    }

    // --- Aadhaar & PAN verification (temporarily skipped) ---
    // if (dto.role === 'business' && dto.aadhaarCard) {
    //   console.log('inside Aadhaar');
    //   const aadhaarValid = await this.verificationService.verifyAadhaar(
    //     dto.aadhaarCard,
    //     dto.idToken,
    //   );
    //   console.log('aadhaarValid', aadhaarValid);
    //   if (!aadhaarValid) throw new BadRequestException('Invalid Aadhaar');
    // }

    // if (dto.role === 'business' && dto.pancard) {
    //   const panValid = await this.verificationService.verifyPAN(dto.pancard);
    //   if (!panValid) throw new BadRequestException('Invalid PAN');
    // }

    // --- Create or get user ---
    let user = await this.userRepo.findOne({ where: { phone: dto.phone } });

    if (!user) {
      const userData: Partial<User> = {
        phone: dto.phone,
        name: dto.name,
        email: dto.email,
        role: dto.role,
      };

      if (dto.role === 'business') {
        userData.pancard = dto.pancard;
        userData.aadhaarCard = dto.aadhaarCard;
        userData.gst = dto.gst;
      }

      user = this.userRepo.create(userData);
      await this.userRepo.save(user);
    }

    // --- Create business if role is 'business' ---
    if (dto.role === 'business') {
      const existingBusiness = await this.businessRepo.findOne({
        where: { owner: { id: user.id } },
      });

      if (!existingBusiness) {
        const business = this.businessRepo.create({
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          owner: user,
          latitude: dto.latitude || null,
          longitude: dto.longitude || null,
        });
        await this.businessRepo.save(business);
      }
    }

    // --- Generate JWT ---
    const token = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
      email: user.email,
    });

    return {
      message:
        dto.role === 'business'
          ? 'Business registered successfully'
          : 'User registered successfully',
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

  async login(phone: string, idToken: string) {
    const decoded = await this.firebaseService.verifyIdToken(idToken);
    if (decoded.phone_number !== phone) {
      throw new UnauthorizedException('Phone number mismatch');
    }

    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new UnauthorizedException('User not found');

    const token = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
      email: user.email,
    });

    return {
      message: 'Login successful',
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
