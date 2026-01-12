import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
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
import { SocialComment } from './social-comment.entity';

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
  @ApiOperation({
    summary: 'Get social posts for my business (owner)',
  })
  @ApiOkResponse({
    description: 'List of social posts created by my business',
    type: [SocialPost],
  })
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
  @ApiOperation({
    summary: 'Upload a social post for my business',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        caption: {
          type: 'string',
          example: 'Before & After service 🚗✨',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    description: 'Uploaded social post',
    type: SocialPost,
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
  @ApiOperation({
    summary: 'Get social posts for a business (public feed)',
  })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: 'c034d02a-6170-4756-ad0c-707c09f85934',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 6,
  })
  @ApiOkResponse({
    description: 'Paginated list of social posts',
    type: [SocialPost],
  })
  getBusinessSocial(
    @Param('businessId') businessId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 6,
  ) {
    return this.service.getForBusinessId(businessId, +page, +limit);
  }

  // --------------------------------------------------
  // 4️⃣ LIKE / UNLIKE POST
  // --------------------------------------------------
  @Post(':postId/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Like or unlike a social post',
  })
  @ApiParam({
    name: 'postId',
    description: 'Social post ID',
    example: '6b2ce1f2-ea62-4e0b-8913-a52b866a2c54',
  })
  @ApiOkResponse({
    description: 'Like toggle result',
    schema: {
      example: {
        liked: true,
        likesCount: 12,
      },
    },
  })
  toggleLike(@Param('postId') postId: string, @Req() req) {
    return this.service.toggleLike(postId, req.user.id);
  }

  // --------------------------------------------------
  // 5️⃣ ADD COMMENT
  // --------------------------------------------------
  @Post(':postId/comment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add a comment to a social post',
  })
  @ApiParam({
    name: 'postId',
    description: 'Social post ID',
    example: '6b2ce1f2-ea62-4e0b-8913-a52b866a2c54',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comment: {
          type: 'string',
          example: 'Great service!',
        },
      },
      required: ['comment'],
    },
  })
  @ApiOkResponse({
    description: 'Created comment',
    type: SocialComment,
  })
  addComment(
    @Param('postId') postId: string,
    @Req() req,
    @Body('comment') comment: string,
  ) {
    return this.service.addComment(postId, req.user.id, comment);
  }

  // --------------------------------------------------
  // 4️⃣ GLOBAL SOCIAL FEED (PUBLIC / USER)
  // --------------------------------------------------
  @Get('feed')
  @ApiOperation({ summary: 'Get global social feed (all businesses)' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Items per page',
  })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 'uuid',
          url: 'https://s3.aws.com/image.jpg',
          caption: 'Great service!',
          businessId: 'uuid',
          createdAt: '2026-01-12T10:00:00Z',
          likesCount: 12,
          comments: [
            {
              id: 'uuid',
              comment: 'Awesome!',
              userId: 'uuid',
              createdAt: '2026-01-12T10:05:00Z',
            },
          ],
        },
      ],
    },
  })
  getGlobalFeed(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.getGlobalFeed(+page, +limit);
  }
}
