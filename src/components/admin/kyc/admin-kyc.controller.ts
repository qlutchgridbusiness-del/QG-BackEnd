import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminKycService } from './admin-kyc.service';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminKycDto, RejectKycDto } from './admin-kyc.dto';
import { AdminActionResponseDto } from '../dto/admin-response.dto';
import { BasicAuthGuard } from 'src/components/auth/basic-auth.guard';

@ApiTags('Admin – Business KYC')
@UseGuards(BasicAuthGuard)
@Controller('admin/kyc')
export class AdminKycController {
  constructor(private readonly adminKyc: AdminKycService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List pending KYC requests' })
  @ApiOkResponse({ type: [AdminKycDto] })
  listPending() {
    return this.adminKyc.listPendingKycs();
  }

  @Post(':businessId/approve')
  @ApiOperation({ summary: 'Approve KYC' })
  @ApiParam({ name: 'businessId', type: String })
  @ApiOkResponse({ type: AdminActionResponseDto })
  approve(@Param('businessId') businessId: string) {
    return this.adminKyc.approveBusiness(businessId);
  }

  @Post(':businessId/reject')
  @ApiOperation({ summary: 'Reject KYC' })
  @ApiParam({ name: 'businessId', type: String })
  @ApiBody({ type: RejectKycDto })
  @ApiOkResponse({ type: AdminActionResponseDto })
  reject(@Param('businessId') businessId: string, @Body() dto: RejectKycDto) {
    return this.adminKyc.rejectBusiness(businessId, dto.reason);
  }
}
