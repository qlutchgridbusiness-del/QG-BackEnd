import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Post('verify-otp')
@ApiBody({ type: VerifyOtpDto })
@ApiResponse({ status: 200, description: 'OTP verified successfully' })
async verifyOtp(@Body() dto: VerifyOtpDto) {
  // No idToken here, just frontend verification
return this.authService.verifyOtp(dto.phone, dto.idToken);
}


  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() dto: RegisterDto) {
    // Include business-specific fields if role is 'business'
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.idToken);
  }
}
