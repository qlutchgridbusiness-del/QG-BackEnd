import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  businessId: string;

  @ApiProperty()
  serviceId: string;

  @ApiPropertyOptional()
  scheduledAt?: string;

  @ApiPropertyOptional()
  proposedPrice?: string;
}

export class VerifyPaymentDto {
  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  razorpay_order_id: string;

  @ApiProperty()
  razorpay_payment_id: string;

  @ApiProperty()
  razorpay_signature: string;
}
