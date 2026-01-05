import { ApiProperty } from '@nestjs/swagger';
import { CreateServiceDto } from '../services/services.dto';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

export class AddServicesDto {
  @ApiProperty({
    type: () => [CreateServiceDto],
    description: 'List of services to add',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceDto)
  services: CreateServiceDto[];
}
