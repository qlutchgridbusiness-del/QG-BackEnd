import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  phone: string;

  @ApiProperty()
  idToken: string;
}

export class RegisterDto {
  idToken: string;
  phone: string;
  name: string;
  email?: string;
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

  @ApiProperty()
  idToken: string;
}
