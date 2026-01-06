// src/components/social/social.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSocialPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({
    description: 'Uploaded image URL (S3 / Cloudinary)',
  })
  url: string;
}
