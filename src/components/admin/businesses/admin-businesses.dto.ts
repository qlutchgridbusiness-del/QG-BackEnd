import { ApiProperty } from '@nestjs/swagger';

export class AdminBusinessDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  kycRejectReason?: string;

  @ApiProperty()
  createdAt: Date;
}
