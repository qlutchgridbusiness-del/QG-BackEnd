import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitKycDto {
  @ApiProperty({ example: 'ABCDE1234F' })
  @IsString()
  @Length(10, 10)
  pancard: string;

  @ApiProperty({ example: '08AKWPJ1234H1ZN', required: false })
  @IsOptional()
  @IsString()
  gst?: string;
}
