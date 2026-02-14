import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminContractsService } from './admin-contracts.service';
import { AdminContractDto } from './admin-contracts.dto';
import { AdminActionResponseDto } from '../dto/admin-response.dto';
import { BasicAuthGuard } from 'src/components/auth/basic-auth.guard';

@ApiTags('Admin – Contracts')
@UseGuards(BasicAuthGuard)
@Controller('admin/contracts')
export class AdminContractsController {
  constructor(private readonly service: AdminContractsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List pending contracts' })
  @ApiOkResponse({ type: [AdminContractDto] })
  listPending() {
    return this.service.listPendingContracts();
  }

  @Post(':businessId/sign')
  @ApiOperation({ summary: 'Sign contract' })
  @ApiParam({ name: 'businessId', type: String })
  @ApiOkResponse({ type: AdminActionResponseDto })
  sign(@Param('businessId') businessId: string) {
    return this.service.signContract(businessId);
  }
}
