import { ApiProperty } from '@nestjs/swagger';
import { KycStatus } from './kyc-status.enum';

export class AdminKycDto {
  @ApiProperty({ example: 'uuid-business-id' })
  businessId: string;

  @ApiProperty({
    enum: KycStatus,
    example: KycStatus.PENDING,
  })
  status: KycStatus;

  @ApiProperty({
    required: false,
    example: 'PAN mismatch',
  })
  rejectionReason?: string;

  @ApiProperty({
    example: '2026-01-03T10:30:00.000Z',
  })
  createdAt: Date;
}

export class RejectKycDto {
  @ApiProperty({ example: 'PAN mismatch' })
  reason: string;
}
