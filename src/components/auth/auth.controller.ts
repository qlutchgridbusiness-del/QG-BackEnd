// src/components/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔹 STEP 1: SEND OTP
  @Post('request-otp')
  @ApiBody({ schema: { example: { phone: '+919XXXXXXXXX' } } })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async requestOtp(@Body('phone') phone: string) {
    return this.authService.requestOtp(phone);
  }

  // 🔹 STEP 2: VERIFY OTP (Login / Register Gate)
  @Post('verify-otp')
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  // 🔹 REGISTER (User / Business)
  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registered successfully' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // 🔹 LOGIN (OTP already verified)
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone);
  }
}
