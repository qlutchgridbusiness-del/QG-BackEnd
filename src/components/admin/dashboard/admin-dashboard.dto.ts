import { ApiProperty } from '@nestjs/swagger';

export class AdminDashboardStatsDto {
  @ApiProperty({ example: 1200 })
  totalUsers: number;

  @ApiProperty({ example: 45 })
  totalBusinesses: number;

  @ApiProperty({ example: 7 })
  pendingKycs: number;

  @ApiProperty({ example: 32 })
  activeBusinesses: number;
}
