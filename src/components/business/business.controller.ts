// src/components/business/business.controller.ts
import { Controller, Post, Body, Req, Put, Param, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './business.dto';

@ApiTags('Business')
@ApiBearerAuth()
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBusinessDto) {
    return this.businessService.createBusiness(req.user.id, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateBusinessDto>) {
    return this.businessService.updateBusiness(id, dto);
  }

  @Get('me')
  myBusinesses(@Req() req) {
    return this.businessService.getMyBusinesses(req.user.id);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string) {
    return this.businessService.approveBusiness(id);
  }
}
