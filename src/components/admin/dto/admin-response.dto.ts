import { ApiProperty } from '@nestjs/swagger';

export class AdminActionResponseDto {
  @ApiProperty({ example: 'Action completed successfully' })
  message: string;
}
