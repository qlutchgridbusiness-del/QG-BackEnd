import { Controller, Post, Body, Req, Put, Param, Get } from '@nestjs/common';
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
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './business.dto';
import { Business } from './business.entity';

@ApiTags('Business')
@ApiBearerAuth()
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
}
