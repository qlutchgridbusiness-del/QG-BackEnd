import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
import { SocialService } from './social.service';
import { SocialPost } from './social-post.entity';

@ApiTags('Business Social')
@Controller('social')
export class SocialController {
  constructor(private readonly service: SocialService) {}

  // --------------------------------------------------
  // 1️⃣ OWNER: Get my business social posts
  // --------------------------------------------------
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get social posts for my business (owner)' })
  @ApiOkResponse({ type: [SocialPost] })
  getMySocial(@Req() req) {
    return this.service.getForOwner(req.user.id);
  }

  // --------------------------------------------------
  // 2️⃣ OWNER: Upload social post
  // --------------------------------------------------
  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a social post for my business' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        caption: { type: 'string', example: 'Before & After service 🚗✨' },
      },
    },
  })
  upload(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    return this.service.upload(req.user.id, file, caption);
  }

  // --------------------------------------------------
  // 3️⃣ PUBLIC: Get social posts for a business
  // --------------------------------------------------
  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get social posts for a business (public)' })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: 'c034d02a-6170-4756-ad0c-707c09f85934',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 6 })
  @ApiOkResponse({ type: [SocialPost] })
  getBusinessSocial(
    @Param('businessId') businessId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 6,
  ) {
    return this.service.getForBusiness(businessId, +page, +limit);
  }
}
