import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Services } from './services.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all services or filter by search and business',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search services by name (case-insensitive)',
    example: 'gold',
  })
  @ApiQuery({
    name: 'businessId',
    required: false,
    description: 'Filter services by business ID',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching services',
    type: [Services],
  })
  async getAllServices(
    @Query('search') search?: string,
  ) {
    return this.servicesService.findFiltered(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific service by ID' })
  @ApiParam({
    name: 'id',
    description: 'Service ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Service details including business info',
    type: Services,
  })
  async getServiceById(@Param('id') id: string) {
    console.log("check50", id);
    const service = await this.servicesService.findOneById(id);
    console.log("check52", id);
    if (!service) throw new NotFoundException(`Service with ID ${id} not found`);
    return service;
  }
}
