import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardStatsDto } from './admin-dashboard.dto';

@ApiTags('Admin – Dashboard')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Admin dashboard statistics' })
  @ApiOkResponse({ type: AdminDashboardStatsDto })
  getStats() {
    return this.service.getDashboardStats();
  }
}
