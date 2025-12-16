import { IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class GetBusinessServicesQuery {
  email: string;
}

export class SaveServicesDto {
  email: string;
  services: { name: string; price: number; available: boolean }[];
}

// create-business.dto.ts
// src/components/business/dto/create-business.dto.ts
export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  category?: string[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  pancard?: string;

  @IsOptional()
  @IsString()
  aadhaarCard?: string;

  @IsOptional()
  @IsString()
  gst?: string;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

  @IsOptional()
  @IsString()
  logoKey?: string;

  @IsOptional()
  @IsString()
  coverKey?: string;

  @IsOptional()
  latitude?: string;

  @IsOptional()
  longitude?: string;
}
// verify-business.dto.ts
export class VerifyBusinessDto {
  panNumber?: string;
  aadhaarNumber?: string;
  otp?: string; // optional, if using Aadhaar OTP
}
