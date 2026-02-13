import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminBusinessesService } from './admin-businesses.service';
import { AdminActionResponseDto } from '../dto/admin-response.dto';
import { AdminBusinessDto } from './admin-businesses.dto';
import { AdminGuard } from 'src/components/auth/admin.guard';
import { JwtAuthGuard } from 'src/components/auth/jwt.auth-guard';

@ApiTags('Admin – Businesses')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/businesses')
export class AdminBusinessesController {
  constructor(private readonly service: AdminBusinessesService) {}

  @Get()
  @ApiOperation({ summary: 'List all businesses' })
  @ApiOkResponse({ type: [AdminBusinessDto] })
  listBusinesses() {
    return this.service.listBusinesses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business details' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: AdminBusinessDto })
  getBusiness(@Param('id') id: string) {
    return this.service.getBusiness(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate business' })
  @ApiOkResponse({ type: AdminActionResponseDto })
  activate(@Param('id') id: string) {
    return this.service.activateBusiness(id);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend business' })
  @ApiOkResponse({ type: AdminActionResponseDto })
  suspend(@Param('id') id: string) {
    return this.service.suspendBusiness(id);
  }

  @Post(':id/request-signature')
  @ApiOperation({ summary: 'Request signature re-upload' })
  @ApiOkResponse({ type: AdminActionResponseDto })
  requestSignature(@Param('id') id: string) {
    return this.service.requestSignatureReupload(id);
  }
}
