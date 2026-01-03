import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
  ValidateIf,
} from 'class-validator';
import { ServiceStatus } from '../business/business-status.enum';

export enum PricingType {
  FIXED = 'FIXED',
  RANGE = 'RANGE',
  QUOTE = 'QUOTE',
}

export class CreateServiceDto {
  /** Service name shown to users */
  @IsString()
  name: string;

  /** Optional description */
  @IsOptional()
  @IsString()
  description?: string;

  /** Pricing model */
  @IsEnum(PricingType)
  pricingType: PricingType;

  /** Fixed price (required if pricingType = FIXED) */
  @ValidateIf((o) => o.pricingType === PricingType.FIXED)
  @IsNumber()
  @Min(0)
  price?: number;

  /** Minimum price (required if pricingType = RANGE) */
  @ValidateIf((o) => o.pricingType === PricingType.RANGE)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  /** Maximum price (required if pricingType = RANGE) */
  @ValidateIf((o) => o.pricingType === PricingType.RANGE)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  /** Duration in minutes */
  @IsOptional()
  @IsNumber()
  @Min(5)
  durationMinutes?: number;

  /** Whether service is visible for booking */
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  /** Internal status (set by backend, ignored from client) */
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
