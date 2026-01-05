import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
import { SocialService } from './social.service';
import { CreateSocialPostDto } from './social.dto';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

// src/components/social/social.controller.ts
@ApiTags('Business Social')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business/social')
export class SocialController {
  constructor(private readonly service: SocialService) {}

  @Get()
  @ApiOperation({ summary: 'Get social posts for my business' })
  getMySocial(@Req() req) {
    return this.service.getForOwner(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add social image' })
  create(@Req() req, @Body() dto: CreateSocialPostDto) {
    return this.service.create(req.user.id, dto);
  }
}
