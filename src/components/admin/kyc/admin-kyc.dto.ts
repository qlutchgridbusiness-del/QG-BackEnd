import { ApiProperty } from '@nestjs/swagger';

export class AdminKycDto {
  @ApiProperty()
  businessId: string;

  @ApiProperty()
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty()
  createdAt: Date;
}

export class RejectKycDto {
  @ApiProperty({ example: 'PAN mismatch' })
  reason: string;
}
