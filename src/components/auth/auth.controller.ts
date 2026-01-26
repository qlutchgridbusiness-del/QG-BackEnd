// src/components/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyOtpDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔹 STEP 1: SEND OTP
  @Post('request-otp')
  @ApiBody({ schema: { example: { phone: '917XXXXXXXXX' } } })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async requestOtp(@Body('phone') phone: string) {
    return this.authService.requestOtp(phone);
  }

  // 🔹 STEP 2: VERIFY OTP → returns tempToken
  @Post('verify-otp')
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  // 🔹 STEP 3: REGISTER (requires tempToken in Authorization header)
  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registered successfully' })
  async register(
    @Headers('authorization') authHeader: string,
    @Body() dto: RegisterDto,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const tempToken = authHeader.replace('Bearer ', '').trim();
    return this.authService.register(dto, tempToken);
  }
}
