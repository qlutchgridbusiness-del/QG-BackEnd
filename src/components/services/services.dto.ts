import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus } from '../business/business-status.enum';

export enum PricingType {
  FIXED = 'FIXED',
  RANGE = 'RANGE',
  QUOTE = 'QUOTE',
}

export class CreateServiceDto {
  /** Service name shown to users */
  @ApiProperty({
    example: 'Full Car Service',
    description: 'Service name shown to users',
  })
  @IsString()
  name: string;

  /** Optional description */
  @ApiPropertyOptional({
    example: 'Complete interior and exterior service',
  })
  @IsOptional()
  @IsString()
  description?: string;

  /** Pricing model */
  @ApiProperty({
    enum: PricingType,
    example: PricingType.FIXED,
    description: 'Pricing model for the service',
  })
  @IsEnum(PricingType)
  pricingType: PricingType;

  /** Fixed price (required if pricingType = FIXED) */
  @ApiPropertyOptional({
    example: 2499,
    description: 'Required when pricingType is FIXED',
  })
  @ValidateIf((o) => o.pricingType === PricingType.FIXED)
  @IsNumber()
  @Min(0)
  price?: number;

  /** Minimum price (required if pricingType = RANGE) */
  @ApiPropertyOptional({
    example: 999,
    description: 'Required when pricingType is RANGE',
  })
  @ValidateIf((o) => o.pricingType === PricingType.RANGE)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  /** Maximum price (required if pricingType = RANGE) */
  @ApiPropertyOptional({
    example: 2999,
    description: 'Required when pricingType is RANGE',
  })
  @ValidateIf((o) => o.pricingType === PricingType.RANGE)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  /** Duration in minutes */
  @ApiPropertyOptional({
    example: 120,
    description: 'Duration of service in minutes',
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  durationMinutes?: number;

  /** Whether service is visible for booking */
  @ApiPropertyOptional({
    example: true,
    description: 'Controls visibility for users',
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  /** Internal status (ignored from client) */
  @ApiPropertyOptional({
    enum: ServiceStatus,
    example: ServiceStatus.DRAFT,
    description: 'Managed internally by backend',
    readOnly: true,
  })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
