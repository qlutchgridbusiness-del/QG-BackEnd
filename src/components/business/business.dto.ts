import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Adani Enterprises' })
  name: string;

  @ApiPropertyOptional({ example: '09177391664' })
  phone?: string;

  @ApiPropertyOptional({ example: 'info@company.com' })
  email?: string;

  @ApiPropertyOptional({
    example: ['Garage / Mechanic', 'Painting'],
    isArray: true,
  })
  category?: string[];

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  latitude?: string;

  @ApiPropertyOptional()
  longitude?: string;

  @ApiPropertyOptional()
  pancard?: string;

  @ApiPropertyOptional()
  aadhaarCard?: string;

  @ApiPropertyOptional()
  gst?: string;

  @ApiPropertyOptional({
    example: {
      mon: { open: true, from: '09:00', to: '18:00' },
    },
  })
  openingHours?: Record<string, any>;

  @ApiPropertyOptional()
  logoKey?: string;

  @ApiPropertyOptional()
  coverKey?: string;
}
