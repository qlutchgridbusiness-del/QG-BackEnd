import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty()
  phone: string;
}

export class VerifyOtpDto {
  phone: string;
  otp: string;
}

export class RegisterDto {
  idToken: string;
  phone: string;
  name: string;
  email?: string;
  otp: string;
  role: 'user' | 'business';
  aadhaarCard?: string;
  pancard?: string;
  gst?: string;
  latitude?: number;
  longitude?: number;
}

export class LoginDto {
  @ApiProperty()
  phone: string;
}

export class AdminLoginDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
