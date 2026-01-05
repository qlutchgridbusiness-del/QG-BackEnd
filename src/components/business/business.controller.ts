import {
  Controller,
  Post,
  Body,
  Req,
  Put,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBody,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './business.dto';
import { Business } from './business.entity';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
import { CreateServiceDto } from '../services/services.dto';
import { AddServicesDto } from '../services/add-services.dto';

@ApiTags('Business')
@ApiBearerAuth()
@ApiExtraModels(CreateServiceDto, AddServicesDto) // 🔥 REQUIRED
@UseGuards(JwtAuthGuard) // ✅ THIS FIXES req.user
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiCreatedResponse({
    description: 'Business created successfully',
    type: Business,
  })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Req() req, @Body() dto: CreateBusinessDto) {
    return this.businessService.createBusiness(req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update business details' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: String,
  })
  @ApiOkResponse({
    description: 'Business updated successfully',
    type: Business,
  })
  @ApiBadRequestResponse({ description: 'Invalid update payload' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateBusinessDto>,
  ) {
    return this.businessService.updateBusiness(req.user.id, id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my businesses' })
  @ApiOkResponse({
    description: 'List of businesses owned by the user',
    type: [Business],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  myBusinesses(@Req() req) {
    return this.businessService.getMyBusinesses(req.user.id);
  }

  @Post(':id/services')
  @ApiOperation({ summary: 'Add services to a business (Owner only)' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    example: 'b6f8c7a4-1234-4cde-9abc-1234567890ab',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        services: {
          type: 'array',
          items: { $ref: getSchemaPath(CreateServiceDto) },
        },
      },
    },
    examples: {
      default: {
        summary: 'Add multiple services',
        value: {
          services: [
            {
              name: 'Full Car Service',
              pricingType: 'FIXED',
              price: 2499,
              durationMinutes: 120,
              available: true,
            },
            {
              name: 'Water Wash',
              pricingType: 'FIXED',
              price: 399,
              durationMinutes: 30,
              available: true,
            },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Services added successfully',
    schema: {
      example: {
        success: true,
        totalServices: 3,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({
    description: 'Business not found or not owned by user',
  })
  addServices(
    @Req() req,
    @Param('id') businessId: string,
    @Body() body: AddServicesDto,
  ) {
    return this.businessService.addServices(
      req.user.id,
      businessId,
      body.services,
    );
  }
}
