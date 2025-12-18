import { IsUUID, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  businessId: string;

  @IsUUID()
  serviceId: string;

  @IsDateString()
  scheduledAt: string;
}
