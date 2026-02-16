// src/components/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Headers,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyOtpDto } from './auth.dto';
import { JwtAuthGuard } from './jwt.auth-guard';
import { UseGuards } from '@nestjs/common';

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

  // 🔹 STEP 2: VERIFY OTP → returns token (even for new users)
  @Post('verify-otp')
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  // 🔹 STEP 3: REGISTER (requires token in Authorization header)
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

    const token = authHeader.replace('Bearer ', '').trim();
    return this.authService.register(dto, token);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

}
