import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardStatsDto } from './admin-dashboard.dto';
import { AdminGuard } from 'src/components/auth/admin.guard';
import { JwtAuthGuard } from 'src/components/auth/jwt.auth-guard';

@ApiTags('Admin – Dashboard')
@UseGuards(JwtAuthGuard, AdminGuard)
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
