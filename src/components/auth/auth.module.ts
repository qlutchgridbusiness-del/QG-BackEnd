import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/components/user/user.entity';
import { AuthController } from './auth.controller';
import { Otp } from 'src/entities/otp.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';
import { VerificationService } from '../verification/verification.service';
import { Business } from '../business/business.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { OtpModule } from './otp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Otp, Business]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallbackSecret',
        signOptions: { expiresIn: '1h' },
      }),
    }),
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseService, VerificationService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
