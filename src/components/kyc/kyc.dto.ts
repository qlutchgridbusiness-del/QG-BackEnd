// src/components/kyc/kyc.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPanDto {
  @ApiProperty({ example: 'ABCDE1234F' })
  panNumber: string;
}

export class VerifyGstDto {
  @ApiProperty({ example: '08AKWPJ1234H1ZN' })
  gstNumber: string;
}
