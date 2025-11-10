import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  Patch,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) { }

  // 🔹 Create new business
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cafe Delight' },
        ownerId: { type: 'string', example: 'uuid-of-user', nullable: true },
      },
    },
  })
  async createBusiness(
    @Body()
    body: {
      name: string;
      ownerId: string;
      phone: string;
      email: string;
    },
  ) {
    return this.businessService.createBusiness(
      body.name,
      body.ownerId,
      body.phone,
      body.email,
    );
  }

  // 🔹 Update business
  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Cafe Name' },
      },
    },
  })
  async updateBusiness(
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    return this.businessService.updateBusiness(id, body.name);
  }

  // 🔹 Delete business
  @Delete(':id')
  async deleteBusiness(@Param('id') id: string) {
    return this.businessService.deleteBusiness(id);
  }

  // 🔹 Get all businesses
  @Get()
  async getBusinesses() {
    return this.businessService.getBusinessesDistinct();
  }

  // 🔹 Get all services under a business
  @Get(':id/services')
  async getServices(@Param('id') id: string) {
    return this.businessService.getBusinessServices(id);
  }

  // 🔹 Save services for a business
  @Post(':id/services')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Haircut' },
              price: { type: 'number', example: 299 },
              available: { type: 'boolean', example: true },
              durationMinutes: { type: 'number', example: 45 },
            },
          },
        },
      },
    },
  })
  async saveServices(
    @Param('id') id: string,
    @Body()
    body: {
      services: {
        name: string;
        price: number;
        available: boolean;
        durationMinutes?: number;
      }[];
    },
  ) {
    return this.businessService.saveServices(id, body.services);
  }

  // 🔹 Upload social content
  @Post(":id/social")
  @ApiConsumes("application/json")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        caption: { type: "string" },
        files: {
          type: "array",
          items: {
            type: "object",
            properties: {
              base64: { type: "string", description: "Base64 encoded file" },
              filename: { type: "string", example: "photo.png" },
              mimetype: { type: "string", example: "image/png" },
            },
          },
        },
      },
    },
  })
  async uploadSocialContent(
    @Param("id") businessId: string,
    @Body()
    body: {
      caption?: string;
      files: { base64: string; filename: string; mimetype: string }[];
    },
  ) {
    return this.businessService.uploadSocialContent(
      businessId,
      body.files,
      body.caption,
    );
  }

  // 🔹 Fetch business-specific social feed
  @Get(':id/social')
  async getBusinessSocial(@Param('id') businessId: string) {
    return this.businessService.getSocialFeed(businessId);
  }

  // 🔹 Fetch global social feed
  @Get('social/global')
  async getGlobalSocial() {
    return this.businessService.getSocialFeed();
  }

  // @Patch(':id/verify')
  // verify(@Param('id') id: string, @Body() dto: VerifyBusinessDto) {
  //   return this.businessService.verifyBusiness(Number(id), dto);
  // }
}
