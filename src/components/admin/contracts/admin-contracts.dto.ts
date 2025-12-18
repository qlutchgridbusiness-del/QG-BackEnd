import { ApiProperty } from '@nestjs/swagger';

export class AdminContractDto {
  @ApiProperty()
  businessId: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;
}
