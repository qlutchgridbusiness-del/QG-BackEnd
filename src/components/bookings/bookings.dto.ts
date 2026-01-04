// src/components/bookings/bookings.dto.ts
import { IsUUID, IsDateString, IsOptional } from 'class-validator';
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
}
