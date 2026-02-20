// src/components/bookings/bookings.dto.ts
import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  businessId: string;

  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ example: '2026-01-05T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleBrand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requestNotes?: string;
}

export class ProposeQuoteDto {
  @ApiProperty()
  quoteAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quoteNotes?: string;
}
