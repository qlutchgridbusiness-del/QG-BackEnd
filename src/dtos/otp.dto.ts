import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  phone: string;

  @ApiProperty()
  idToken: string; // Firebase ID Token

}

export class RegisterDto {
  @ApiProperty()
  phone: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: 'user' | 'business';

  @ApiProperty()
  email: string;

  @ApiProperty()
  idToken: string;
}

export class LoginDto {
  @ApiProperty()
  phone: string;

  @ApiProperty()
  idToken: string; // Firebase ID Token

}
