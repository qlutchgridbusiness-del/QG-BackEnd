import {
  Controller,
  Post,
  Body,
  Req,
  Put,
  Param,
  Get,
  UseGuards,
  BadRequestException,
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
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './business.dto';
import { Business } from './business.entity';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
import { CreateServiceDto } from '../services/services.dto';
import { AddServicesDto } from '../services/add-services.dto';
import { Services } from '../services/services.entity';

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

  @Put('services/:serviceId')
  @ApiOperation({ summary: 'Update service (owner only)' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'serviceId',
    description: 'Service ID',
    example: '61c1b692-7967-444d-85a1-814bd15d803b',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Premium Car Wash' },
        price: { type: 'number', example: 499 },
        durationMinutes: { type: 'number', example: 45 },
        available: { type: 'boolean', example: true },
      },
    },
  })
  @ApiOkResponse({
    description: 'Service updated successfully',
    type: Services,
  })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiForbiddenResponse({ description: 'Not owner of this service' })
  updateService(
    @Req() req,
    @Param('serviceId') serviceId: string,
    @Body() dto: Partial<CreateServiceDto>,
  ) {
    return this.businessService.updateService(req.user.id, serviceId, dto);
  }

  @Put(':id/settings')
  @ApiOperation({ summary: 'Update business settings' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: String,
  })
  updateSettings(@Req() req, @Param('id') id: string, @Body() dto: any) {
    return this.businessService.updateSettings(req.user.id, id, dto);
  }

  @Post(':id/terms')
  @ApiOperation({ summary: 'Accept business terms and conditions' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        signatureName: { type: 'string', example: 'John Doe' },
        signatureUrl: { type: 'string', example: 'https://.../uploads/sign.png' },
      },
      required: ['signatureName', 'signatureUrl'],
    },
  })
  acceptTerms(
    @Req() req,
    @Param('id') id: string,
    @Body('signatureName') signatureName: string,
    @Body('signatureUrl') signatureUrl: string,
  ) {
    if (!signatureName || !signatureName.trim()) {
      throw new BadRequestException('Signature name is required');
    }
    if (!signatureUrl || !signatureUrl.trim()) {
      throw new BadRequestException('Signature image is required');
    }
    return this.businessService.acceptTerms(
      req.user.id,
      id,
      signatureName.trim(),
      signatureUrl.trim(),
    );
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get services of my business' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    example: 'c034d02a-6170-4756-ad0c-707c09f85934',
  })
  @ApiOkResponse({
    description: 'List of services',
    type: [Services],
  })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiForbiddenResponse({ description: 'Not owner of this business' })
  getMyServices(@Req() req, @Param('id') id: string) {
    return this.businessService.getServices(req.user.id, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get my business by ID' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    example: 'c034d02a-6170-4756-ad0c-707c09f85934',
  })
  @ApiOkResponse({
    description: 'Business details',
    type: Business,
  })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiForbiddenResponse({ description: 'Not owner of this business' })
  getBusiness(@Req() req, @Param('id') id: string) {
    return this.businessService.getBusinessById(req.user.id, id);
  }
}
