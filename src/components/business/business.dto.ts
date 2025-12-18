// src/components/business/dto/create-business.dto.ts
import { IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsArray()
  category?: string[];

  @IsOptional()
  address?: string;

  @IsOptional()
  latitude?: string;

  @IsOptional()
  longitude?: string;

  @IsOptional()
  pancard?: string;

  @IsOptional()
  aadhaarCard?: string;

  @IsOptional()
  gst?: string;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

  @IsOptional()
  logoKey?: string;

  @IsOptional()
  coverKey?: string;
}
